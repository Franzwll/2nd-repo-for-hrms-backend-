<?php

namespace Modules\EmployeeSelfService\Services;

use App\Models\EssRequest;
use App\Models\EssRequestAttachment;
use App\Models\EssRequestRouting;
use App\Models\EssRequestStatusHistory;
use App\Models\SystemUser;
use App\Services\AuditLogger;
use App\Services\Notifier;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Modules\EmployeeSelfService\Events\EssRequestDispatched;
use Modules\EmployeeSelfService\Events\EssRequestFulfilled;
use Modules\EmployeeSelfService\Events\EssRequestReleased;
use Modules\EmployeeSelfService\Events\EssRequestReturnedToEss;

/**
 * Single source of truth for ESS request transitions.
 *
 * Pipeline: Employee -> ESS Management (gate) -> module -> ESS Management
 * (release) -> Employee. A module can only submit a result; it can never mark
 * a request Completed. That last step belongs to ESS Management and is always
 * manual.
 */
class EssRequestWorkflow
{
    public const STATUS_PENDING = 'Pending';
    public const STATUS_UNDER_REVIEW = 'Under Review';
    public const STATUS_FOR_DISPATCH = 'For Dispatch';
    public const STATUS_WITH_MODULE = 'With Module';
    public const STATUS_FOR_RELEASE = 'For Release';
    public const STATUS_REJECTED = 'Rejected';
    public const STATUS_RETURNED = 'Returned for Clarification';
    public const STATUS_COMPLETED = 'Completed';
    public const STATUS_CANCELLED = 'Cancelled';

    /** Legacy statuses kept only for inbound data / error messages. */
    public const STATUS_LEGACY_APPROVED = 'Approved';
    public const STATUS_LEGACY_FOR_FULFILLMENT = 'For Fulfillment';

    public function __construct(
        private readonly EssRoutingService $routing,
        private readonly EssModuleRegistry $registry,
    ) {
    }

    /**
     * Store an uploaded file in the public disk and return the column payload
     * used by ess_request_attachments.
     *
     * @return array{file_path:string,original_name:string,mime_type:string,file_size_bytes:int}
     */
    public function storeUpload(UploadedFile $file, string $directory = 'ess-request-attachments'): array
    {
        $path = $file->store($directory, 'public');

        if (! $path) {
            throw new \RuntimeException('The file could not be stored. Please try again.');
        }

        return [
            'file_path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getClientMimeType() ?: 'application/octet-stream',
            'file_size_bytes' => $file->getSize() ?: 0,
        ];
    }

    public function requiresFulfillment(EssRequest $request): bool
    {
        $request->loadMissing('category');

        if ($request->category) {
            if ((bool) ($request->category->requires_fulfillment ?? false)) {
                return true;
            }

            $code = strtolower((string) $request->category->code);
            $name = strtolower((string) $request->category->name);

            if (in_array($code, ['ess-hrdoc', 'hr_document'], true) || str_contains($name, 'document')) {
                return true;
            }
        }

        $type = strtolower((string) $request->request_type);

        foreach (['document', 'certificate', 'coe', 'service record', 'employment'] as $needle) {
            if (str_contains($type, $needle)) {
                return true;
            }
        }

        return false;
    }

    /**
     * HR opens the request. Persisting this is what makes the timeline honest.
     */
    public function startReview(EssRequest $request, ?SystemUser $actor): EssRequest
    {
        if ($request->status === self::STATUS_UNDER_REVIEW) {
            return $request;
        }

        $this->assertStatus($request, [self::STATUS_PENDING], 'Only pending requests can be opened for review.');

        return $this->transition($request, $actor, self::STATUS_UNDER_REVIEW, 'Review started by ESS Management.');
    }

    /**
     * Gate decision.
     *
     * @param  string  $decision  approve|reject|return
     */
    public function review(EssRequest $request, ?SystemUser $actor, string $decision, ?string $note = null): EssRequest
    {
        $note = trim((string) $note);
        $decision = strtolower($decision);

        if (! in_array($decision, ['approve', 'reject', 'return'], true)) {
            throw new \RuntimeException('Unknown review decision.');
        }

        if (in_array($decision, ['reject', 'return'], true) && $note === '') {
            throw new \RuntimeException(
                $decision === 'reject'
                    ? 'A reason for rejection is required.'
                    : 'A note explaining what clarification is needed is required.'
            );
        }

        $this->assertStatus(
            $request,
            [self::STATUS_PENDING, self::STATUS_UNDER_REVIEW],
            'This request is no longer awaiting review.'
        );

        if ($decision === 'reject') {
            $request->review_note = $note;
            $request = $this->transition(
                $request,
                $actor,
                self::STATUS_REJECTED,
                $note !== '' ? $note : 'Rejected by ESS Management.'
            );

            $this->notifyEmployee(
                $request,
                'Request rejected',
                "Your request \"{$request->request_type}\" ({$request->request_code}) was rejected. Reason: {$note}",
                'warning'
            );

            return $request;
        }

        if ($decision === 'return') {
            $request->review_note = $note;
            $request->returned_count = (int) $request->returned_count + 1;
            $request->save();

            $request = $this->transition(
                $request,
                $actor,
                self::STATUS_RETURNED,
                $note !== '' ? $note : 'Returned to the employee for clarification.'
            );

            $this->notifyEmployee(
                $request,
                'Action needed on your request',
                "ESS Management needs more information for \"{$request->request_type}\" ({$request->request_code}): {$note}",
                'warning'
            );

            return $request;
        }

        // Approve: route to the owning module, or leave it with ESS Management
        // when no module claims the category.
        $module = $this->routing->resolve($request);
        $label = $this->routing->label($module);

        $request->review_note = $note !== '' ? $note : null;
        $request->routed_module = $module;
        $request->routed_at = $module ? now() : null;
        $request->module_reference = null;
        $request->module_note = null;
        $request->module_responded_at = null;

        $request = $this->transition(
            $request,
            $actor,
            $module ? self::STATUS_FOR_DISPATCH : self::STATUS_FOR_RELEASE,
            $module
                ? "Approved by ESS Management — dispatched to {$label}."
                : 'Approved by ESS Management — ready for release.'
        );

        $this->recordRouting(
            $request,
            'ess_admin',
            $module ?: 'ess_admin',
            'dispatch',
            $actor,
            $note !== '' ? $note : null
        );

        if ($module) {
            event(new EssRequestDispatched($request, $module, $actor));
        }

        if (in_array($request->status, [self::STATUS_FOR_DISPATCH, self::STATUS_WITH_MODULE], true)) {
            $this->notifyEmployee(
                $request,
                'Request approved',
                "Your request \"{$request->request_type}\" ({$request->request_code}) was approved and sent to {$label} for processing.",
                'info'
            );

            $this->notifyAdmins(
                'Request dispatched',
                "{$request->request_code} ({$request->request_type}) was approved and sent to {$label}.",
                'info'
            );
        } else {
            $this->notifyEmployee(
                $request,
                'Request approved',
                "Your request \"{$request->request_type}\" ({$request->request_code}) was approved and is ready for release.",
                'success'
            );
        }

        return $request;
    }

    /**
     * Approve a request without dispatching it to a module.
     *
     * Used by the ESS Management manual-document override: the gate attaches
     * the file itself, then releases it. No module is notified because the
     * request never enters a module queue.
     */
    public function approveManually(
        EssRequest $request,
        ?SystemUser $actor,
        ?string $note = null
    ): EssRequest {
        $this->assertStatus(
            $request,
            [self::STATUS_PENDING, self::STATUS_UNDER_REVIEW],
            'This request is no longer awaiting review.'
        );

        $note = trim((string) $note);

        $request->review_note = $note !== '' ? $note : null;
        $request->routed_module = null;
        $request->routed_at = null;
        $request->module_reference = null;
        $request->module_note = null;
        $request->module_responded_at = null;

        $request = $this->transition(
            $request,
            $actor,
            self::STATUS_FOR_RELEASE,
            'Approved by ESS Management for manual document release.'
        );

        $this->recordRouting(
            $request,
            'ess_admin',
            'ess_admin',
            'approve',
            $actor,
            $note !== '' ? $note : null
        );

        $this->notifyEmployee(
            $request,
            'Request approved',
            "Your request \"{$request->request_type}\" ({$request->request_code}) was approved and is ready for release.",
            'success'
        );

        return $request;
    }

    /**
     * Send an already-gated request to a module.
     */
    public function dispatch(
        EssRequest $request,
        ?SystemUser $actor,
        ?string $module = null,
        ?string $note = null
    ): EssRequest {
        $this->assertStatus(
            $request,
            [self::STATUS_UNDER_REVIEW, self::STATUS_FOR_RELEASE],
            'Only a reviewed or release-ready request can be dispatched.'
        );

        $module = $module ?: $this->routing->resolve($request);

        if (! $module) {
            throw new \RuntimeException('No module is configured for this request.');
        }

        $this->registry->for($module);
        $label = $this->routing->label($module);

        $request = DB::transaction(function () use ($request, $actor, $module, $note, $label) {
            // If a previous module already applied side effects, compensate
            // first.
            if ($request->routed_module && $request->module_reference) {
                $this->registry->adapter($request->routed_module)
                    ->reverseResult($request->fresh(), $actor ?? $request->releasedBy, 'Re-dispatched to another module.');
            }

            // A previous module's output must not be released as the new
            // module's result. Employee-uploaded attachments are untouched.
            $this->clearOutboundAttachments($request);

            $request->routed_module = $module;
            $request->routed_at = now();
            $request->module_reference = null;
            $request->module_note = null;
            $request->module_responded_at = null;

            $request = $this->transition(
                $request,
                $actor,
                self::STATUS_FOR_DISPATCH,
                'Dispatched to ' . $label . ($note ? ": {$note}" : '.')
            );

            $this->recordRouting($request, 'ess_admin', $module, 'dispatch', $actor, $note);

            return $request;
        });

        event(new EssRequestDispatched($request, $module, $actor));

        return $request;
    }

    /**
     * Module acknowledges ownership of the request.
     */
    public function accept(EssRequest $request, ?SystemUser $actor): EssRequest
    {
        $this->assertStatus($request, [self::STATUS_FOR_DISPATCH], 'Only a dispatched request can be accepted.');

        $module = (string) $request->routed_module;

        if (! $this->routing->isKnownModule($module)) {
            throw new \RuntimeException('This request is not routed to a module.');
        }

        $request = $this->transition(
            $request,
            $actor,
            self::STATUS_WITH_MODULE,
            'Accepted by ' . $this->routing->label($module) . '.'
        );

        $this->recordRouting($request, $module, $module, 'accept', $actor);

        return $request;
    }

    /**
     * Module cannot handle the request. It goes back to the gate with a reason.
     */
    public function decline(EssRequest $request, ?SystemUser $actor, string $reason): EssRequest
    {
        $reason = trim($reason);

        if ($reason === '') {
            throw new \RuntimeException('A reason for declining is required.');
        }

        $this->assertStatus(
            $request,
            [self::STATUS_FOR_DISPATCH, self::STATUS_WITH_MODULE],
            'Only an open module request can be declined.'
        );

        $module = (string) $request->routed_module;
        $label = $this->routing->label($module);

        $request = DB::transaction(function () use ($request, $actor, $module, $reason) {
            // Best effort: no result should have been applied before completion,
            // but compensate if a module wrote side effects early.
            if ($module) {
                $this->registry->adapter($module)->reverseResult($request, $actor ?? $request->releasedBy, $reason);
            }

            // The module produced no releasable output.
            $this->clearOutboundAttachments($request);

            $request->routed_module = null;
            $request->module_reference = null;
            $request->module_note = $reason;
            $request->module_responded_at = now();

            $request = $this->transition(
                $request,
                $actor,
                self::STATUS_UNDER_REVIEW,
                "Declined by {$this->routing->label($module)}: {$reason}"
            );

            $this->recordRouting($request, $module ?: 'ess_admin', 'ess_admin', 'decline', $actor, $reason);

            return $request;
        });

        $this->notifyAdmins(
            'Module declined a request',
            "{$label} declined {$request->request_code} ({$request->request_type}): {$reason}",
            'warning'
        );

        return $request;
    }

    /**
     * Module submits its result. The request lands in the ESS Management
     * release queue; it is NOT completed here.
     *
     * @param  array<string, mixed>  $payload
     */
    public function submitResult(
        EssRequest $request,
        ?SystemUser $actor,
        array $payload = [],
        ?UploadedFile $file = null,
        ?string $note = null
    ): EssRequest {
        $module = (string) $request->routed_module;

        if (! $module) {
            throw new \RuntimeException('This request is not routed to a module.');
        }

        $adapter = $this->registry->for($module);

        if (! $adapter->supports($request)) {
            throw new \RuntimeException('This module cannot process the request.');
        }

        if ($request->status === self::STATUS_FOR_DISPATCH) {
            $this->accept($request, $actor);
            $request->refresh();
        }

        $this->assertStatus(
            $request,
            [self::STATUS_WITH_MODULE],
            'Accept the request before submitting a result.'
        );

        $filePayload = $file ? $this->storeUpload($file, 'ess-request-fulfillments') : null;

        // Never persist the uploaded file object on the routing ledger.
        unset($payload['file']);
        $payload['note'] = $note ?? ($payload['note'] ?? null);

        $adapter->validateResult($request, $payload, $filePayload);

        $meta = [];
        $label = $this->routing->label($module);

        DB::transaction(function () use ($request, $actor, $payload, $filePayload, $module, $label, &$meta) {
            $meta = $this->registry->for($module)
                ->applyResult($request, $payload, $filePayload, $actor);

            $request->module_reference = $meta['reference'] ?? null;
            $request->module_note = $meta['note'] ?? ($payload['note'] ?? null);
            $request->module_responded_at = now();

            $request = $this->transition(
                $request,
                $actor,
                self::STATUS_FOR_RELEASE,
                "Result submitted by {$label} — waiting for ESS Management release."
            );

            $ledger = array_merge($payload, is_array($meta['ledger'] ?? null) ? $meta['ledger'] : []);

            $this->recordRouting(
                $request,
                $module,
                'ess_admin',
                'complete',
                $actor,
                $meta['note'] ?? ($payload['note'] ?? null),
                $ledger
            );
        });

        $request->refresh();

        event(new EssRequestReturnedToEss($request, $module, $actor));

        return $request;
    }

    /**
     * ESS Management releases the module result to the employee.
     */
    public function release(EssRequest $request, ?SystemUser $actor, ?string $note = null): EssRequest
    {
        $this->assertStatus(
            $request,
            [self::STATUS_FOR_RELEASE],
            'Only a request that came back from a module can be released.'
        );

        $request->loadMissing('category', 'attachments');

        if ($this->requiresFulfillment($request) && ! $request->outboundAttachment()) {
            throw new \RuntimeException('Attach the requested document before releasing this request.');
        }

        $module = $request->routed_module;
        $label = $this->routing->label($module);

        DB::transaction(function () use ($request, $actor, $note, $module) {
            if ($module) {
                $this->registry->adapter($module)->onRelease($request);
            }

            $request->released_at = now();
            $request->released_by_user_id = $actor?->system_user_id;

            $request = $this->transition(
                $request,
                $actor,
                self::STATUS_COMPLETED,
                $note !== null && trim($note) !== ''
                    ? trim($note)
                    : "Released to the employee by ESS Management after {$this->routing->label($module)} processing."
            );

            $this->recordRouting(
                $request,
                $module ?: 'ess_admin',
                'ess_admin',
                'release',
                $actor,
                $note
            );
        });

        $request->refresh();
        $attachment = $request->outboundAttachment();

        if ($attachment) {
            event(new EssRequestFulfilled($request, $attachment));
        }

        event(new EssRequestReleased($request, $actor));

        // Document releases are announced by the ERM listener attached to
        // EssRequestFulfilled, so only notify here when there is no file.
        if (! $attachment) {
            $this->notifyEmployee(
                $request,
                'Your request is complete',
                "Your request \"{$request->request_type}\" ({$request->request_code}) was released. {$request->module_note}",
                'success'
            );
        }

        return $request;
    }

    /**
     * Send a request to a different module, compensating any applied result.
     */
    public function reroute(
        EssRequest $request,
        ?SystemUser $actor,
        string $module,
        ?string $note = null
    ): EssRequest {
        $this->assertStatus(
            $request,
            [self::STATUS_UNDER_REVIEW, self::STATUS_FOR_DISPATCH, self::STATUS_FOR_RELEASE],
            'This request cannot be rerouted from its current stage.'
        );

        if (! $this->routing->isKnownModule($module)) {
            throw new \RuntimeException('Unknown ESS module.');
        }

        $this->registry->for($module);
        $previous = $request->routed_module;
        $label = $this->routing->label($module);

        $request = DB::transaction(function () use ($request, $actor, $module, $note, $previous, $label) {
            if ($previous) {
                $this->registry->adapter($previous)
                    ->reverseResult($request->fresh(), $actor ?? $request->releasedBy, $note ?: 'Rerouted.');
            }

            // Drop the previous module's result file; it no longer represents
            // the request once another module owns it. Employee uploads stay
            // intact.
            $this->clearOutboundAttachments($request);

            $request->routed_module = $module;
            $request->routed_at = now();
            $request->module_reference = null;
            $request->module_note = null;
            $request->module_responded_at = null;

            $request = $this->transition(
                $request,
                $actor,
                self::STATUS_FOR_DISPATCH,
                "Rerouted to {$label}" . ($note ? ": {$note}" : '.')
            );

            $this->recordRouting($request, $previous ?: 'ess_admin', $module, 'reroute', $actor, $note);

            return $request;
        });

        event(new EssRequestDispatched($request, $module, $actor));

        return $request;
    }

    /**
     * Attach an outbound file manually. Used by the ESS Management override and
     * by legacy callers; the request still needs release() to reach the employee.
     *
     * @param  array{file_path:string,original_name:string,mime_type:string,file_size_bytes:int}  $filePayload
     */
    public function fulfill(
        EssRequest $request,
        ?SystemUser $actor,
        array $filePayload,
        ?string $note = null
    ): EssRequestAttachment {
        $this->assertStatus(
            $request,
            [
                self::STATUS_FOR_DISPATCH,
                self::STATUS_WITH_MODULE,
                self::STATUS_FOR_RELEASE,
                self::STATUS_COMPLETED,
            ],
            'This request is not in a stage where a document can be attached.'
        );

        if (! $this->requiresFulfillment($request)) {
            throw new \RuntimeException('This request does not require a document.');
        }

        if (empty($filePayload['file_path'])) {
            throw new \RuntimeException('Attach the requested document before continuing.');
        }

        $isReplacement = $request->status === self::STATUS_COMPLETED;
        $note = trim((string) $note);
        $attachment = null;

        DB::transaction(function () use ($request, $actor, $filePayload, $note, $isReplacement, &$attachment) {
            if ($isReplacement) {
                EssRequestAttachment::where('ess_request_id', $request->ess_request_id)
                    ->where('direction', 'hr')
                    ->delete();
            }

            $attachment = EssRequestAttachment::create([
                'ess_request_id' => $request->ess_request_id,
                'direction' => 'hr',
                'source_module' => $request->routed_module ?: 'ess_admin',
                'file_path' => $filePayload['file_path'],
                'original_name' => $filePayload['original_name'],
                'mime_type' => $filePayload['mime_type'],
                'file_size_bytes' => $filePayload['file_size_bytes'],
                'uploaded_by_user_id' => $actor?->system_user_id,
            ]);

            if (! $isReplacement) {
                $request->status = self::STATUS_FOR_RELEASE;
                if ($note !== '') {
                    $request->review_note = $note;
                }
                $request->save();

                EssRequestStatusHistory::create([
                    'ess_request_id' => $request->ess_request_id,
                    'status' => self::STATUS_FOR_RELEASE,
                    'actor_user_id' => $actor?->system_user_id,
                    'note' => $note !== ''
                        ? $note
                        : 'Document attached by ESS Management — waiting for release.',
                ]);
            }
        });

        if ($isReplacement && $attachment) {
            event(new EssRequestFulfilled($request->fresh(), $attachment));
        }

        AuditLogger::log(
            action: $isReplacement ? 'ESS Request File Replaced' : 'ESS Request Document Attached',
            module: 'Employee Self-Service',
            severity: 'Info',
            targetType: 'EssRequest',
            targetId: (string) $request->ess_request_id,
            details: ($isReplacement ? 'Replaced file for ' : 'Attached ')
                . "{$request->request_code} with {$filePayload['original_name']} by "
                . ($actor?->full_name ?? 'ESS Management'),
        );

        return $attachment;
    }

    public function cancel(EssRequest $request, ?SystemUser $actor): EssRequest
    {
        $this->assertStatus(
            $request,
            [self::STATUS_PENDING, self::STATUS_UNDER_REVIEW, self::STATUS_RETURNED],
            'Only requests that are still open can be cancelled.'
        );

        $request = $this->transition(
            $request,
            $actor,
            self::STATUS_CANCELLED,
            'Request withdrawn by the employee.'
        );

        $this->notifyAdmins(
            'ESS request withdrawn',
            "{$request->request_code} ({$request->request_type}) was withdrawn by the employee.",
            'info'
        );

        return $request;
    }

    /**
     * Employee answered a Returned request. Files were already stored by the
     * controller and are passed in as attachment payloads.
     *
     * @param  array<int, array{file_path:string,original_name:string,mime_type:string,file_size_bytes:int}>  $attachments
     */
    public function resubmit(
        EssRequest $request,
        ?SystemUser $actor,
        ?string $note,
        array $attachments = []
    ): EssRequest {
        $this->assertStatus(
            $request,
            [self::STATUS_RETURNED],
            'Only a returned request can be resubmitted.'
        );

        $note = trim((string) $note);

        DB::transaction(function () use ($request, $actor, $note, $attachments) {
            foreach ($attachments as $payload) {
                EssRequestAttachment::create([
                    'ess_request_id' => $request->ess_request_id,
                    'direction' => 'employee',
                    'file_path' => $payload['file_path'],
                    'original_name' => $payload['original_name'],
                    'mime_type' => $payload['mime_type'],
                    'file_size_bytes' => $payload['file_size_bytes'],
                    'uploaded_by_user_id' => $actor?->system_user_id,
                ]);
            }

            $request->status = self::STATUS_UNDER_REVIEW;
            if ($note !== '') {
                $request->review_note = $note;
            }
            $request->save();

            EssRequestStatusHistory::create([
                'ess_request_id' => $request->ess_request_id,
                'status' => self::STATUS_UNDER_REVIEW,
                'actor_user_id' => $actor?->system_user_id,
                'note' => $note !== ''
                    ? "Employee responded: {$note}"
                    : 'Employee submitted the requested clarification.',
            ]);
        });

        AuditLogger::log(
            action: 'ESS Request Clarification Submitted',
            module: 'Employee Self-Service',
            severity: 'Info',
            targetType: 'EssRequest',
            targetId: (string) $request->ess_request_id,
            details: "Employee responded to {$request->request_code} ({$request->request_type})",
        );

        $this->notifyAdmins(
            'Clarification received',
            "The employee responded to {$request->request_code} ({$request->request_type}). It is back in the review queue.",
            'info'
        );

        return $request;
    }

    private function transition(
        EssRequest $request,
        ?SystemUser $actor,
        string $status,
        string $note
    ): EssRequest {
        $previous = $request->status;

        $request->status = $status;
        if ($actor) {
            $request->assigned_to_user_id = $actor->system_user_id;
        }
        if ($status === self::STATUS_COMPLETED) {
            $request->completed_at = now();
        }
        $request->save();

        EssRequestStatusHistory::create([
            'ess_request_id' => $request->ess_request_id,
            'status' => $status,
            'actor_user_id' => $actor?->system_user_id,
            'note' => $note,
        ]);

        AuditLogger::log(
            action: "ESS Request {$status}",
            module: 'Employee Self-Service',
            severity: $status === self::STATUS_REJECTED ? 'Warning' : 'Info',
            targetType: 'EssRequest',
            targetId: (string) $request->ess_request_id,
            details: "Request {$request->request_code} moved from {$previous} to {$status} by "
                . ($actor?->full_name ?? 'the employee')
                . ($note !== '' ? ": {$note}" : ''),
        );

        return $request;
    }

    /**
     * Remove module/HR output from a request that is moving to another module.
     * Only direction=hr is touched, so the employee's own evidence survives.
     */
    private function clearOutboundAttachments(EssRequest $request): void
    {
        EssRequestAttachment::where('ess_request_id', $request->ess_request_id)
            ->where('direction', 'hr')
            ->delete();
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function recordRouting(
        EssRequest $request,
        ?string $from,
        ?string $to,
        string $action,
        ?SystemUser $actor,
        ?string $note = null,
        array $payload = []
    ): void {
        $max = (int) $request->routings()->max('leg');
        $leg = in_array($action, ['dispatch', 'reroute'], true)
            ? max(1, $max + 1)
            : max(1, $max);

        EssRequestRouting::create([
            'ess_request_id' => $request->ess_request_id,
            'leg' => $leg,
            'from_module' => $from,
            'to_module' => $to,
            'action' => $action,
            'actor_user_id' => $actor?->system_user_id,
            'note' => $note,
            'result_payload' => $payload ?: null,
        ]);
    }

    /**
     * @param  array<int, string>  $allowed
     */
    private function assertStatus(EssRequest $request, array $allowed, string $message): void
    {
        if (! in_array($request->status, $allowed, true)) {
            throw new \RuntimeException($message);
        }
    }

    private function notifyEmployee(EssRequest $request, string $title, string $body, string $type): void
    {
        $ids = SystemUser::where('employee_id', $request->employee_id)
            ->pluck('system_user_id')
            ->all();

        Notifier::to($ids, [
            'title' => $title,
            'body' => $body,
            'type' => $type,
            'module_name' => 'Employee Self-Service',
            'target_type' => 'ess_request',
            'target_id' => (string) $request->ess_request_id,
        ]);
    }

    private function notifyAdmins(string $title, string $body, string $type): void
    {
        Notifier::to(
            array_merge(Notifier::hrAdminIds(), Notifier::superAdminIds()),
            [
                'title' => $title,
                'body' => $body,
                'type' => $type,
                'module_name' => 'ESS Management',
                'target_type' => 'ess_request',
            ]
        );
    }
}
