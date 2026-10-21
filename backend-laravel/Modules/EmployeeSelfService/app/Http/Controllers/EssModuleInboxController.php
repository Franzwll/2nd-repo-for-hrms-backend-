<?php

namespace Modules\EmployeeSelfService\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\EssRequest;
use App\Models\SystemUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Modules\EmployeeSelfService\Services\EssModuleRegistry;
use Modules\EmployeeSelfService\Services\EssRequestWorkflow;
use Modules\EmployeeSelfService\Services\EssRoutingService;

/**
 * Generic inbox for every ESS module (ERM, Attendance, Payroll, Performance).
 *
 * The module key comes from the route, and every query is scoped to
 * routed_module so a module can never read a request the gate did not send it.
 */
class EssModuleInboxController extends Controller
{
    public function __construct(
        private readonly EssRequestWorkflow $workflow,
        private readonly EssModuleRegistry $registry,
        private readonly EssRoutingService $routing,
    ) {
    }

    public function index(Request $request, string $module): JsonResponse
    {
        $this->authorizeModule($request, $module);

        $query = $this->baseQuery($module);

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('q')) {
            $search = $request->string('q');
            $query->where(function ($q) use ($search) {
                $q->where('request_code', 'LIKE', "%{$search}%")
                    ->orWhere('request_type', 'LIKE', "%{$search}%")
                    ->orWhere('details', 'LIKE', "%{$search}%")
                    ->orWhereHas('employee', function ($eq) use ($search) {
                        $eq->where('first_name', 'LIKE', "%{$search}%")
                            ->orWhere('last_name', 'LIKE', "%{$search}%")
                            ->orWhere('employee_code', 'LIKE', "%{$search}%");
                    });
            });
        }

        $requests = $query->orderByDesc('routed_at')->orderByDesc('filed_at')->get();

        return response()->json([
            'module' => $module,
            'module_label' => $this->routing->label($module),
            'counts' => [
                'total' => $this->baseQuery($module)->count(),
                'for_dispatch' => $this->baseQuery($module)->where('status', 'For Dispatch')->count(),
                'with_module' => $this->baseQuery($module)->where('status', 'With Module')->count(),
                'for_release' => $this->baseQuery($module)->where('status', 'For Release')->count(),
            ],
            'requests' => $requests->map(fn ($r) => $this->transform($r)),
        ]);
    }

    public function show(Request $request, string $module, string $id): JsonResponse
    {
        $this->authorizeModule($request, $module);

        $essRequest = $this->findRequest($module, $id);

        if (! $essRequest) {
            return response()->json(['message' => 'Request not found in this module queue.'], 404);
        }

        $payload = $this->transform($essRequest);
        $payload['routings'] = $essRequest->routings->map(fn ($routing) => [
            'leg' => $routing->leg,
            'from_module' => $routing->from_module,
            'to_module' => $routing->to_module,
            'action' => $routing->action,
            'note' => $routing->note,
            'at' => $routing->created_at?->toIso8601String(),
        ])->values();

        return response()->json(['request' => $payload]);
    }

    public function accept(Request $request, string $module, string $id): JsonResponse
    {
        $this->authorizeModule($request, $module);
        $essRequest = $this->findRequest($module, $id);

        if (! $essRequest) {
            return response()->json(['message' => 'Request not found in this module queue.'], 404);
        }

        try {
            $this->workflow->accept($essRequest, $request->user());
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => "Request {$essRequest->request_code} accepted.",
            'request' => $this->transform($essRequest->fresh(['employee.department', 'category', 'assignedTo', 'attachments', 'statusHistory', 'routings'])),
        ]);
    }

    public function decline(Request $request, string $module, string $id): JsonResponse
    {
        $this->authorizeModule($request, $module);
        $essRequest = $this->findRequest($module, $id);

        if (! $essRequest) {
            return response()->json(['message' => 'Request not found in this module queue.'], 404);
        }

        $validated = $request->validate([
            'reason' => 'required|string|max:2000',
        ]);

        try {
            $this->workflow->decline($essRequest, $request->user(), $validated['reason']);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => "Request {$essRequest->request_code} declined and returned to ESS Management.",
            'request' => $this->transform($essRequest->fresh(['employee.department', 'category', 'assignedTo', 'attachments', 'statusHistory', 'routings'])),
        ]);
    }

    public function complete(Request $request, string $module, string $id): JsonResponse
    {
        $this->authorizeModule($request, $module);
        $essRequest = $this->findRequest($module, $id);

        if (! $essRequest) {
            return response()->json(['message' => 'Request not found in this module queue.'], 404);
        }

        $validated = $request->validate([
            'note' => 'nullable|string|max:2000',
            'file' => 'nullable|file|max:10240|mimes:pdf,png,jpg,jpeg,doc,docx',
            'document_id' => 'nullable|integer|exists:employee_documents,document_id',
            'decision' => 'nullable|in:approved,rejected,Approved,Rejected',
            'leave_type' => 'nullable|string|max:80',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
            'period_year' => 'nullable|integer',
            'payslip_id' => 'nullable|integer',
            'promotion_request_id' => 'nullable|integer',
            'request_kind' => 'nullable|string|max:40',
        ]);

        $payload = array_filter(
            $validated,
            fn ($value) => $value !== null && $value !== ''
        );

        if (isset($payload['decision'])) {
            $payload['decision'] = strtolower((string) $payload['decision']);
        }

        try {
            $this->workflow->submitResult(
                $essRequest,
                $request->user(),
                $payload,
                $request->file('file'),
                $validated['note'] ?? null
            );
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => "Result for {$essRequest->request_code} sent back to ESS Management for release.",
            'request' => $this->transform($essRequest->fresh(['employee.department', 'category', 'assignedTo', 'attachments', 'statusHistory', 'routings'])),
        ]);
    }

    private function baseQuery(string $module)
    {
        return EssRequest::with(['employee.department', 'category', 'assignedTo', 'attachments', 'statusHistory', 'routings.actor'])
            ->where('routed_module', $module)
            ->whereIn('status', ['For Dispatch', 'With Module', 'For Release', 'Completed']);
    }

    private function findRequest(string $module, string $id): ?EssRequest
    {
        return $this->baseQuery($module)
            ->where(function ($q) use ($id) {
                $q->where('request_code', $id)->orWhere('ess_request_id', $id);
            })
            ->first();
    }

    private function authorizeModule(Request $request, string $module): void
    {
        if (! $this->routing->isKnownModule($module)) {
            abort(response()->json(['message' => 'Unknown ESS module.'], 404));
        }

        /** @var SystemUser|null $user */
        $user = $request->user();

        if (! $user) {
            abort(response()->json(['message' => 'Unauthenticated.'], 401));
        }

        if ($user->isSuperAdmin()) {
            return;
        }

        $permission = $this->registry->permissionFor($module);

        // View/Read is enough to open the employee ESS portal, but working a
        // module queue (accept/decline/complete) requires edit-grade access.
        if (
            ($permission && $this->canWorkQueue($user, $permission))
            || $this->canWorkQueue($user, 'ESS Management')
        ) {
            return;
        }

        abort(response()->json([
            'message' => "Access denied: you do not have permission to access the {$this->routing->label($module)} queue.",
        ], 403));
    }

    private function canWorkQueue(SystemUser $user, string $module): bool
    {
        $level = $user->permissions
            ->firstWhere('module_name', $module)?->permission_level ?? 'None';

        return in_array($level, ['Full', 'Edit', 'Write', 'Approve / Reject Only'], true);
    }

    private function transform(EssRequest $r): array
    {
        $outbound = $r->attachments->firstWhere('direction', 'hr');

        return [
            'id' => $r->request_code,
            'db_id' => $r->ess_request_id,
            'employee' => $r->employee?->full_name ?? 'Unknown Employee',
            'employeeId' => $r->employee?->employee_code ?? 'EMP-0000',
            'employeeDbId' => $r->employee_id,
            'department' => $r->employee?->department?->name ?? 'General',
            'category' => $r->category?->name ?? 'General',
            'category_code' => $r->category?->code ?? 'general',
            'type' => $r->request_type,
            'filed' => $r->filed_at?->toDateString(),
            'date_from' => $r->date_from?->toDateString(),
            'date_to' => $r->date_to?->toDateString(),
            'status' => $r->status,
            'module' => $r->routed_module,
            'module_label' => $r->routed_module ? $this->routing->label($r->routed_module) : null,
            'module_note' => $r->module_note,
            'module_reference' => $r->module_reference,
            'routed_at' => $r->routed_at?->toIso8601String(),
            'assignedTo' => $r->assignedTo?->full_name ?? ($r->status === 'For Dispatch' ? 'Unassigned' : 'ESS Management'),
            'details' => $r->details,
            'note' => $r->review_note,
            'has_fulfillment' => (bool) $outbound,
            'attachments' => $r->attachments->map(fn ($a) => [
                'id' => $a->ess_request_attachment_id,
                'direction' => $a->direction,
                'source_module' => $a->source_module,
                'original_name' => $a->original_name,
                'mime_type' => $a->mime_type,
                'file_size_bytes' => $a->file_size_bytes,
                'has_file' => $a->file_path && Storage::disk('public')->exists(ltrim((string) $a->file_path, '/')),
            ])->values(),
            'timeline' => $r->statusHistory->map(fn ($h) => [
                'status' => $h->status,
                'note' => $h->note,
                'at' => $h->created_at?->toIso8601String(),
            ])->values(),
        ];
    }
}
