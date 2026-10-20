<?php

namespace Modules\EmployeeSelfService\Services;

use App\Models\EssRequest;
use App\Models\EssRequestAttachment;
use App\Models\EssRequestStatusHistory;
use App\Models\LeaveBalance;
use App\Models\SystemUser;
use App\Services\AuditLogger;
use App\Services\Notifier;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Modules\EmployeeSelfService\Events\EssRequestFulfilled;

/**
 * Single source of truth for ESS request transitions.
 *
 * The important rule: a request that needs a document can never be marked
 * Completed without a file. Approval only moves it into the fulfiller's queue
 * ("For Fulfillment"); the upload is what closes it.
 */
class EssRequestWorkflow
{
    public const STATUS_PENDING = 'Pending';
    public const STATUS_UNDER_REVIEW = 'Under Review';
    public const STATUS_APPROVED = 'Approved';
    public const STATUS_FOR_FULFILLMENT = 'For Fulfillment';
    public const STATUS_REJECTED = 'Rejected';
    public const STATUS_RETURNED = 'Returned for Clarification';
    public const STATUS_COMPLETED = 'Completed';
    public const STATUS_CANCELLED = 'Cancelled';

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

        return $this->transition($request, $actor, self::STATUS_UNDER_REVIEW, 'Review started by HR.');
    }

    /**
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

        // Returned requests must be resubmitted by the employee before HR can
        // review them again; completed/cancelled requests are closed.
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
                $note !== '' ? $note : 'Rejected by HR.'
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
                "HR needs more information for \"{$request->request_type}\" ({$request->request_code}): {$note}",
                'warning'
            );

            return $request;
        }

        // Approve. HR documents are NOT complete at this point — they enter the
        // fulfillment queue and only the file upload can close them.
        $requiresFulfillment = $this->requiresFulfillment($request);
        $target = $requiresFulfillment ? self::STATUS_FOR_FULFILLMENT : self::STATUS_APPROVED;

        if ($note !== '') {
            $request->review_note = $note;
        } else {
            // Don't let an old "needs clarification" note linger on a request
            // that has now been approved.
            $request->review_note = null;
        }

        $request = $this->transition(
            $request,
            $actor,
            $target,
            $note !== ''
                ? $note
                : ($requiresFulfillment ? 'Approved — waiting for the document to be attached.' : 'Approved by HR.')
        );

        if ($target === self::STATUS_APPROVED && stripos((string) $request->request_type, 'leave') !== false) {
            $this->applyLeaveDeduction($request);
        }

        if ($target === self::STATUS_FOR_FULFILLMENT) {
            $this->notifyEmployee(
                $request,
                'Request approved',
                "Your request \"{$request->request_type}\" ({$request->request_code}) was approved and is now being prepared.",
                'info'
            );

            $this->notifyHr(
                'Document request ready to prepare',
                "{$request->request_code} ({$request->request_type}) was approved. Upload the document to complete it.",
                'info'
            );
        } else {
            $this->notifyEmployee(
                $request,
                'Request approved',
                "Your request \"{$request->request_type}\" ({$request->request_code}) was approved.",
                'success'
            );
        }

        return $request;
    }

    /**
     * Attach the requested document and close the request.
     *
     * @param  array{file_path:string,original_name:string,mime_type:string,file_size_bytes:int}  $filePayload
     */
    public function fulfill(
        EssRequest $request,
        ?SystemUser $actor,
        array $filePayload,
        ?string $note = null
    ): EssRequestAttachment {
        $requiresFulfillment = $this->requiresFulfillment($request);
        $isReplacement = $request->status === self::STATUS_COMPLETED;

        if (! $requiresFulfillment) {
            throw new \RuntimeException('This request does not require a document.');
        }

        if (! $isReplacement) {
            $this->assertStatus(
                $request,
                [self::STATUS_FOR_FULFILLMENT, self::STATUS_APPROVED],
                'Approve the request before attaching the document.'
            );
        }

        if (empty($filePayload['file_path'])) {
            throw new \RuntimeException('Attach the requested document before completing this request.');
        }

        $note = trim((string) $note);
        $attachment = null;

        DB::transaction(function () use ($request, $actor, $filePayload, $note, $isReplacement, &$attachment) {
            if ($isReplacement) {
                // Keep the audit trail, but only the newest HR file should be
                // visible to the employee. Do not delete the underlying file:
                // it may point at an archive document owned elsewhere.
                EssRequestAttachment::where('ess_request_id', $request->ess_request_id)
                    ->where('direction', 'hr')
                    ->delete();
            }

            $attachment = EssRequestAttachment::create([
                'ess_request_id' => $request->ess_request_id,
                'direction' => 'hr',
                'file_path' => $filePayload['file_path'],
                'original_name' => $filePayload['original_name'],
                'mime_type' => $filePayload['mime_type'],
                'file_size_bytes' => $filePayload['file_size_bytes'],
                'uploaded_by_user_id' => $actor?->system_user_id,
            ]);

            $request->status = self::STATUS_COMPLETED;
            $request->assigned_to_user_id = $actor?->system_user_id ?? $request->assigned_to_user_id;
            if ($note !== '') {
                $request->review_note = $note;
            }
            if (! $request->completed_at) {
                $request->completed_at = now();
            }
            $request->save();

            EssRequestStatusHistory::create([
                'ess_request_id' => $request->ess_request_id,
                'status' => self::STATUS_COMPLETED,
                'actor_user_id' => $actor?->system_user_id,
                'note' => $note !== ''
                    ? $note
                    : ($isReplacement ? 'Replacement document attached.' : 'Document attached and released to the employee.'),
            ]);
        });

        AuditLogger::log(
            action: $isReplacement ? 'ESS Request File Replaced' : 'ESS Request Fulfilled',
            module: 'Employee Self-Service',
            severity: 'Info',
            targetType: 'EssRequest',
            targetId: (string) $request->ess_request_id,
            details: ($isReplacement ? 'Replaced file for ' : 'Fulfilled ')
                . "{$request->request_code} with {$filePayload['original_name']} by "
                . ($actor?->full_name ?? 'HR'),
        );

        // Existing listener notifies the employee that the file is ready.
        event(new EssRequestFulfilled($request->fresh(), $attachment));

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

        $this->notifyHr(
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

        $this->notifyHr(
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
     * @param  array<int, string>  $allowed
     */
    private function assertStatus(EssRequest $request, array $allowed, string $message): void
    {
        if (! in_array($request->status, $allowed, true)) {
            throw new \RuntimeException($message);
        }
    }

    private function applyLeaveDeduction(EssRequest $request): void
    {
        $days = 1.0;
        if ($request->date_from && $request->date_to) {
            $start = Carbon::parse($request->date_from);
            $end = Carbon::parse($request->date_to);
            $days = max(1.0, (float) ($start->diffInDays($end) + 1));
        }

        $leaveType = 'Vacation Leave';
        if (stripos((string) $request->request_type, 'Sick') !== false) {
            $leaveType = 'Sick Leave';
        } elseif (stripos((string) $request->request_type, 'Emergency') !== false) {
            $leaveType = 'Emergency Leave';
        }

        $balance = LeaveBalance::firstOrCreate([
            'employee_id' => $request->employee_id,
            'leave_type' => $leaveType,
            'period_year' => Carbon::today()->year,
        ], [
            'total_days' => 15.0,
            'used_days' => 0.0,
        ]);

        $balance->used_days = min($balance->total_days, $balance->used_days + $days);
        $balance->save();
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

    private function notifyHr(string $title, string $body, string $type): void
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
