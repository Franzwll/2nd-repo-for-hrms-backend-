<?php

namespace Modules\EmployeeSelfService\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Employee;
use App\Models\EmployeeDocument;
use App\Models\EssCategory;
use App\Models\EssRequest;
use App\Models\EssRequestStatusHistory;
use App\Services\AuditLogger;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Modules\EmployeeSelfService\Services\EssRequestWorkflow;
use Modules\EmployeeSelfService\Services\EssRoutingService;

class EssAdminController extends Controller
{
    /**
     * GET /api/v1/ess/admin/requests
     */
    public function getRequests(Request $request): JsonResponse
    {
        $query = EssRequest::with(['employee.department', 'category', 'assignedTo', 'attachments', 'statusHistory']);

        if ($request->filled('department') && $request->department !== 'all') {
            $query->whereHas('employee.department', function ($q) use ($request) {
                $q->where('name', $request->department);
            });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('category') && $request->category !== 'all') {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('name', $request->category)->orWhere('code', $request->category);
            });
        }

        if ($request->filled('search')) {
            $search = $request->search;
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

        $allRequests = $query->orderByDesc('filed_at')->get();

        // Calculate company-wide stats
        $counts = [
            'total' => EssRequest::count(),
            'pending' => EssRequest::where('status', 'Pending')->count(),
            'under_review' => EssRequest::where('status', 'Under Review')->count(),
            'for_dispatch' => EssRequest::where('status', 'For Dispatch')->count(),
            'with_module' => EssRequest::where('status', 'With Module')->count(),
            'for_release' => EssRequest::where('status', 'For Release')->count(),
            // Legacy keys kept for older clients.
            'approved' => EssRequest::where('status', 'For Release')->count(),
            'for_fulfillment' => EssRequest::where('status', 'With Module')->count(),
            'completed' => EssRequest::where('status', 'Completed')->count(),
            'rejected' => EssRequest::where('status', 'Rejected')->count(),
            'returned' => EssRequest::where('status', 'Returned for Clarification')->count(),
            'cancelled' => EssRequest::where('status', 'Cancelled')->count(),
        ];

        $routing = app(EssRoutingService::class);

        return response()->json([
            'counts' => $counts,
            'requests' => $allRequests->map(function ($r) use ($routing) {
                return [
                    'id' => $r->request_code,
                    'db_id' => $r->ess_request_id,
                    'employee' => $r->employee ? $r->employee->full_name : 'Unknown Employee',
                    'employeeId' => $r->employee?->employee_code ?? 'EMP-0000',
                    'department' => $r->employee?->department?->name ?? 'General',
                    'category' => $r->category?->name ?? 'General',
                    'category_code' => $r->category?->code ?? 'general',
                    'type' => $r->request_type,
                    'filed' => $r->filed_at?->toDateString() ?? Carbon::today()->toDateString(),
                    'date_from' => $r->date_from?->toDateString(),
                    'date_to' => $r->date_to?->toDateString(),
                    'status' => $r->status,
                    'assignedTo' => $r->assignedTo?->full_name
                        ?? ($r->status === 'Pending'
                            ? 'Unassigned'
                            : ($r->routed_module ? $routing->label($r->routed_module) : 'HR Admin')),
                    'details' => $r->details,
                    'note' => $r->review_note,
                    'returnedCount' => $r->returned_count,
                    'attachment_path' => $r->attachment_path,
                    'employeeDbId' => $r->employee_id,
                    'completed_at' => $r->completed_at?->toIso8601String(),
                    'module' => $r->routed_module,
                    'module_label' => $r->routed_module ? $routing->label($r->routed_module) : null,
                    'routed_at' => $r->routed_at?->toIso8601String(),
                    'module_responded_at' => $r->module_responded_at?->toIso8601String(),
                    'module_note' => $r->module_note,
                    'module_reference' => $r->module_reference,
                    'released_at' => $r->released_at?->toIso8601String(),
                    'attachments' => $r->attachments->map(fn ($a) => [
                        'id' => $a->ess_request_attachment_id,
                        'direction' => $a->direction,
                        'original_name' => $a->original_name,
                        'mime_type' => $a->mime_type,
                        'file_size_bytes' => $a->file_size_bytes,
                        'has_file' => $a->file_path
                            && Storage::disk('public')->exists(ltrim((string) $a->file_path, '/')),
                    ])->values(),
                    'has_fulfillment' => $r->attachments->contains(fn ($a) => $a->direction === 'hr'),
                    'timeline' => $r->statusHistory->map(fn ($h) => [
                        'status' => $h->status,
                        'note' => $h->note,
                        'at' => $h->created_at?->toIso8601String(),
                    ])->values(),
                ];
            }),
        ]);
    }

    /**
     * PATCH /api/v1/ess/admin/requests/{id}/status
     *
     * Legacy status endpoint. It can only move a request within the gate
     * (Pending / Under Review / Returned / Cancelled). Approval, dispatch,
     * completion and release have dedicated, guarded actions.
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:Pending,Under Review,Rejected,Returned for Clarification,Cancelled',
            'note' => 'nullable|string',
        ]);

        $essRequest = $this->findRequest($id);

        if (! $essRequest) {
            return response()->json(['message' => 'Request not found.'], 404);
        }

        $workflow = app(EssRequestWorkflow::class);
        $user = $request->user();
        $targetStatus = $validated['status'];

        // The legacy endpoint stays inside the gate. Module/release stages must
        // go through review/dispatch/release so their invariants hold.
        if (! in_array($essRequest->status, [
            'Pending',
            'Under Review',
            'Returned for Clarification',
        ], true)) {
            return response()->json([
                'message' => 'This request has moved past the review stage; use the guarded actions instead.',
            ], 422);
        }

        if (
            in_array($targetStatus, ['Rejected', 'Returned for Clarification'], true)
            && trim((string) ($validated['note'] ?? '')) === ''
        ) {
            return response()->json([
                'message' => $targetStatus === 'Rejected'
                    ? 'A reason for rejection is required.'
                    : 'A note explaining what clarification is needed is required.',
            ], 422);
        }

        try {
            if ($targetStatus === 'Rejected') {
                $workflow->review($essRequest, $user, 'reject', $validated['note'] ?? null);
            } elseif ($targetStatus === 'Returned for Clarification') {
                $workflow->review($essRequest, $user, 'return', $validated['note'] ?? null);
            } else {
                $essRequest->status = $targetStatus;
                if ($user) {
                    $essRequest->assigned_to_user_id = $user->system_user_id;
                }
                if (! empty($validated['note'])) {
                    $essRequest->review_note = $validated['note'];
                }
                $essRequest->save();

                EssRequestStatusHistory::create([
                    'ess_request_id' => $essRequest->ess_request_id,
                    'status' => $essRequest->status,
                    'actor_user_id' => $user?->system_user_id,
                    'note' => $validated['note'] ?? "Marked {$targetStatus}.",
                ]);

                AuditLogger::log(
                    action: "ESS Request {$targetStatus}",
                    module: 'ESS Management',
                    severity: 'Info',
                    targetType: 'EssRequest',
                    targetId: (string) $essRequest->ess_request_id,
                    details: "Request {$essRequest->request_code} marked as {$targetStatus} by "
                        . ($user?->full_name ?? 'Admin'),
                    request: $request
                );
            }
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        $essRequest->refresh();

        return response()->json([
            'message' => "Request {$essRequest->request_code} updated to {$essRequest->status}.",
            'request' => $essRequest->load(['employee', 'category', 'attachments', 'statusHistory']),
        ]);
    }

    /**
     * POST /api/v1/ess/admin/requests/{id}/review
     *
     * decision=start    -> Pending becomes Under Review
     * decision=approve  -> For Dispatch (routed module) or For Release (no module)
     * decision=return   -> Returned for Clarification (note required)
     * decision=reject   -> Rejected (note required)
     *
     * Supplying a file with an approval is an explicit manual override: the
     * document is attached and released in one step by ESS Management.
     */
    public function review(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'decision' => 'required|in:start,approve,reject,return',
            'note' => 'nullable|string|max:2000',
            'file' => 'nullable|file|max:10240|mimes:pdf,png,jpg,jpeg,doc,docx',
        ]);

        $essRequest = $this->findRequest($id);

        if (! $essRequest) {
            return response()->json(['message' => 'Request not found.'], 404);
        }

        $workflow = app(EssRequestWorkflow::class);
        $user = $request->user();

        // Explicit manual override: the gate attaches the document and releases
        // it immediately. Keep this out of dispatch so ERM is never notified
        // about a request that is already complete.
        $manualDocument = $validated['decision'] === 'approve'
            && $request->hasFile('file')
            && $workflow->requiresFulfillment($essRequest);

        try {
            if ($validated['decision'] === 'start') {
                $workflow->startReview($essRequest, $user);
            } elseif ($manualDocument) {
                $essRequest = $workflow->approveManually(
                    $essRequest,
                    $user,
                    $validated['note'] ?? null
                );

                $payload = $workflow->storeUpload(
                    $request->file('file'),
                    'ess-request-fulfillments'
                );
                $workflow->fulfill(
                    $essRequest->fresh(),
                    $user,
                    $payload,
                    $validated['note'] ?? null
                );
                $workflow->release(
                    $essRequest->fresh(),
                    $user,
                    'Released manually after attaching the document.'
                );
            } else {
                $essRequest = $workflow->review(
                    $essRequest,
                    $user,
                    $validated['decision'],
                    $validated['note'] ?? null
                );
            }
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        $essRequest->refresh();

        return response()->json([
            'message' => $validated['decision'] === 'start'
                ? "Request {$essRequest->request_code} is now under review."
                : "Request {$essRequest->request_code} updated to {$essRequest->status}.",
            'request' => $essRequest->load(['employee', 'category', 'attachments', 'statusHistory']),
        ]);
    }

    /**
     * POST /api/v1/ess/admin/requests/{id}/fulfill
     *
     * ESS Management manual override: attach a document (fresh upload or an
     * archived employee document) and release it. Normal document requests are
     * fulfilled by ERM and only released here.
     */
    public function fulfill(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'file' => 'nullable|file|max:10240|mimes:pdf,png,jpg,jpeg,doc,docx|required_without:document_id',
            'document_id' => 'nullable|integer|exists:employee_documents,document_id|required_without:file',
            'note' => 'nullable|string|max:2000',
        ]);

        $essRequest = $this->findRequest($id);

        if (! $essRequest) {
            return response()->json(['message' => 'Request not found.'], 404);
        }

        $workflow = app(EssRequestWorkflow::class);

        if (! $workflow->requiresFulfillment($essRequest)) {
            return response()->json(['message' => 'This request does not require a document.'], 422);
        }

        if (! in_array($essRequest->status, ['For Dispatch', 'With Module', 'For Release', 'Completed'], true)) {
            return response()->json([
                'message' => 'Approve the request before attaching the document.',
            ], 422);
        }

        try {
            if ($request->hasFile('file')) {
                $payload = $workflow->storeUpload(
                    $request->file('file'),
                    'ess-request-fulfillments'
                );
            } else {
                $source = EmployeeDocument::where('document_id', $validated['document_id'])
                    ->where('employee_id', $essRequest->employee_id)
                    ->first();

                if (! $source) {
                    return response()->json([
                        'message' => 'The selected archived document does not belong to this employee.',
                    ], 422);
                }

                $payload = [
                    'file_path' => $source->file_path,
                    'original_name' => $source->original_name ?: $source->title,
                    'mime_type' => $source->mime_type,
                    'file_size_bytes' => $source->file_size_bytes,
                ];
            }

            $workflow->fulfill(
                $essRequest,
                $request->user(),
                $payload,
                $validated['note'] ?? null
            );

            if ($essRequest->fresh()->status !== 'Completed') {
                $workflow->release(
                    $essRequest->fresh(),
                    $request->user(),
                    'Released manually after attaching the document.'
                );
            }
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => "Request {$essRequest->request_code} fulfilled.",
            'request' => $essRequest->fresh(['employee', 'category', 'attachments', 'statusHistory']),
        ]);
    }

    /**
     * POST /api/v1/ess/admin/requests/{id}/release
     */
    public function release(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'note' => 'nullable|string|max:2000',
        ]);

        $essRequest = $this->findRequest($id);

        if (! $essRequest) {
            return response()->json(['message' => 'Request not found.'], 404);
        }

        try {
            app(EssRequestWorkflow::class)->release(
                $essRequest,
                $request->user(),
                $validated['note'] ?? null
            );
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => "Request {$essRequest->request_code} released to the employee.",
            'request' => $essRequest->fresh(['employee', 'category', 'attachments', 'statusHistory', 'routings']),
        ]);
    }

    /**
     * POST /api/v1/ess/admin/requests/{id}/reroute
     */
    public function reroute(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'module' => 'required|string|max:40',
            'note' => 'nullable|string|max:2000',
        ]);

        $essRequest = $this->findRequest($id);

        if (! $essRequest) {
            return response()->json(['message' => 'Request not found.'], 404);
        }

        try {
            app(EssRequestWorkflow::class)->reroute(
                $essRequest,
                $request->user(),
                $validated['module'],
                $validated['note'] ?? null
            );
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => "Request {$essRequest->request_code} rerouted.",
            'request' => $essRequest->fresh(['employee', 'category', 'attachments', 'statusHistory', 'routings']),
        ]);
    }

    /**
     * POST /api/v1/ess/admin/requests/{id}/dispatch
     */
    public function dispatch(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'module' => 'nullable|string|max:40',
            'note' => 'nullable|string|max:2000',
        ]);

        $essRequest = $this->findRequest($id);

        if (! $essRequest) {
            return response()->json(['message' => 'Request not found.'], 404);
        }

        try {
            app(EssRequestWorkflow::class)->dispatch(
                $essRequest,
                $request->user(),
                $validated['module'] ?? null,
                $validated['note'] ?? null
            );
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => "Request {$essRequest->request_code} dispatched.",
            'request' => $essRequest->fresh(['employee', 'category', 'attachments', 'statusHistory']),
        ]);
    }

    /**
     * GET /api/v1/ess/admin/requests/{id}/routings
     */
    public function routings(Request $request, $id): JsonResponse
    {
        $essRequest = $this->findRequest($id);

        if (! $essRequest) {
            return response()->json(['message' => 'Request not found.'], 404);
        }

        return response()->json([
            'routings' => $essRequest->routings()
                ->with('actor')
                ->get()
                ->map(fn ($routing) => [
                    'id' => $routing->ess_request_routing_id,
                    'leg' => $routing->leg,
                    'from_module' => $routing->from_module,
                    'to_module' => $routing->to_module,
                    'action' => $routing->action,
                    'actor' => $routing->actor?->full_name,
                    'note' => $routing->note,
                    'result_payload' => $routing->result_payload,
                    'at' => $routing->created_at?->toIso8601String(),
                ])->values(),
        ]);
    }

    private function findRequest($id): ?EssRequest
    {
        return EssRequest::with(['employee', 'category', 'attachments', 'statusHistory'])
            ->where('request_code', $id)
            ->orWhere('ess_request_id', $id)
            ->first();
    }


    /**
     * POST /api/v1/ess/admin/requests/behalf
     */
    public function fileOnBehalf(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,employee_id',
            'category_name' => 'required|string',
            'request_type' => 'required|string|max:100',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
            'details' => 'required|string',
        ]);

        $category = EssCategory::where('name', $validated['category_name'])->first();

        // Same numeric-suffix generator as employee-filed requests so the two
        // paths can never mint overlapping REQ codes.
        $highest = (int) EssRequest::query()
            ->selectRaw('MAX(CAST(SUBSTRING(request_code, 5) AS UNSIGNED)) as n')
            ->value('n');
        $nextNumber = ($highest ?: 4400) + 1;
        do {
            $requestCode = 'REQ-' . $nextNumber;
            $nextNumber++;
        } while (EssRequest::where('request_code', $requestCode)->exists());

        $user = $request->user();

        $essRequest = EssRequest::create([
            'request_code' => $requestCode,
            'employee_id' => $validated['employee_id'],
            'category_id' => $category?->ess_category_id,
            'request_type' => $validated['request_type'],
            'filed_at' => now(),
            'date_from' => $validated['date_from'] ?? null,
            'date_to' => $validated['date_to'] ?? null,
            'status' => 'Pending',
            'assigned_to_user_id' => $user?->system_user_id,
            'details' => $validated['details'] . ' (Filed by HR on behalf)',
        ]);

        EssRequestStatusHistory::create([
            'ess_request_id' => $essRequest->ess_request_id,
            'status' => 'Pending',
            'actor_user_id' => $user?->system_user_id,
            'note' => 'Request filed by HR on behalf of the employee.',
        ]);

        $employee = Employee::find($validated['employee_id']);

        AuditLogger::log(
            action: 'ESS Request Filed On Behalf',
            module: 'ESS Management',
            severity: 'Info',
            targetType: 'EssRequest',
            targetId: (string) $essRequest->ess_request_id,
            details: "HR Admin filed {$validated['request_type']} ({$requestCode}) on behalf of {$employee?->full_name}",
            request: $request
        );

        return response()->json([
            'message' => 'Request filed on behalf successfully.',
            'request' => $essRequest->load(['employee', 'category']),
        ], 201);
    }

    /**
     * GET /api/v1/ess/admin/categories
     */
    public function getCategories(Request $request): JsonResponse
    {
        $categories = EssCategory::orderBy('sort_order')->get();

        // If table is empty, seed defaults
        if ($categories->isEmpty()) {
            $defaults = [
                ['code' => 'attendance', 'name' => 'Attendance', 'description' => 'Time correction, overtime approval, missed punch', 'is_open' => true, 'sort_order' => 1],
                ['code' => 'leave', 'name' => 'Leave', 'description' => 'Vacation, sick, emergency, maternity/paternity leave', 'is_open' => true, 'sort_order' => 2],
                ['code' => 'payroll', 'name' => 'Payroll', 'description' => 'Payslip inquiries, tax adjustment, salary advance', 'is_open' => true, 'sort_order' => 3],
                ['code' => 'hr_document', 'name' => 'HR Document', 'description' => 'COE, clearance, 2316 copy, employment verification', 'is_open' => true, 'sort_order' => 4],
                ['code' => 'schedule', 'name' => 'Shift Schedule', 'description' => 'Shift swap, roster change, rest day reassignment', 'is_open' => true, 'sort_order' => 5],
                ['code' => 'benefits', 'name' => 'Benefits & Loans', 'description' => 'HMO enrollment, government loans, allowances', 'is_open' => true, 'sort_order' => 6],
            ];
            foreach ($defaults as $d) {
                EssCategory::create($d);
            }
            $categories = EssCategory::orderBy('sort_order')->get();
        }

        return response()->json([
            'categories' => $categories,
        ]);
    }

    /**
     * PUT /api/v1/ess/admin/categories/{id}/toggle
     */
    public function toggleCategory(Request $request, $id): JsonResponse
    {
        $category = EssCategory::where('code', $id)->orWhere('ess_category_id', $id)->first();

        if (! $category) {
            return response()->json(['message' => 'Category not found.'], 404);
        }

        $category->is_open = ! $category->is_open;
        $category->save();

        AuditLogger::log(
            action: 'ESS Category Toggled',
            module: 'ESS Administration',
            severity: 'Info',
            targetType: 'EssCategory',
            targetId: (string) $category->ess_category_id,
            details: "Category '{$category->name}' set to " . ($category->is_open ? 'Open' : 'Locked'),
            request: $request
        );

        return response()->json([
            'message' => "Category {$category->name} is now " . ($category->is_open ? 'Open' : 'Locked') . '.',
            'category' => $category,
        ]);
    }

    /**
     * GET /api/v1/ess/admin/learning
     * Company-wide learning records (Admin/Superadmin read-only oversight).
     */
    public function getLearning(Request $request): JsonResponse
    {
        $records = DB::table('employee_learning as el')
            ->join('employees as e', 'e.employee_id', '=', 'el.employee_id')
            ->join('learning_courses as lc', 'lc.course_id', '=', 'el.course_id')
            ->leftJoin('departments as d', 'd.department_id', '=', 'e.department_id')
            ->orderByDesc('el.employee_learning_id')
            ->get([
                'el.employee_learning_id',
                'el.status',
                'el.score',
                'el.assigned_date',
                'el.completed_date',
                'e.employee_id',
                'e.first_name',
                'e.last_name',
                'e.email',
                'd.name as department',
                'lc.course_id',
                'lc.course_code',
                'lc.title as course_title',
                'lc.category as course_category',
            ])
            ->map(fn ($r) => [
                'id' => $r->employee_learning_id,
                'employee_id' => $r->employee_id,
                'employee_name' => trim(($r->first_name ?? '').' '.($r->last_name ?? '')),
                'email' => $r->email,
                'department' => $r->department ?? '—',
                'course_id' => $r->course_id,
                'course_code' => $r->course_code,
                'course_title' => $r->course_title,
                'course_category' => $r->course_category ?? 'General',
                'status' => $r->status,
                'score' => $r->score !== null ? (float) $r->score : null,
                'assigned_date' => $r->assigned_date,
                'completed_date' => $r->completed_date,
            ]);

        return response()->json([
            'records' => $records,
            'summary' => [
                'total' => $records->count(),
                'assigned' => $records->where('status', 'Assigned')->count(),
                'in_progress' => $records->where('status', 'In Progress')->count(),
                'completed' => $records->where('status', 'Completed')->count(),
            ],
        ]);
    }

    /**
     * PATCH /api/v1/ess/admin/learning/{id}/status
     * HR verifies a learning record (e.g. marks Completed with a score).
     * Reopening (non-Completed) clears the completion date.
     */
    public function verifyLearning(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:Assigned,In Progress,Completed',
            'score' => 'nullable|numeric|min:0|max:100',
        ]);

        $row = DB::table('employee_learning')->where('employee_learning_id', (int) $id)->first();
        if (! $row) {
            return response()->json(['message' => 'Learning record not found.'], 404);
        }

        $update = ['status' => $validated['status']];
        if ($validated['status'] === 'Completed') {
            $update['completed_date'] = Carbon::today()->toDateString();
        } else {
            $update['completed_date'] = null;
        }
        if ($validated['score'] !== null) {
            $update['score'] = $validated['score'];
        }

        DB::table('employee_learning')
            ->where('employee_learning_id', (int) $id)
            ->update($update);

        $record = DB::table('employee_learning')->where('employee_learning_id', (int) $id)->first();

        AuditLogger::log(
            action: 'LMS Record Verified',
            module: 'Learning Management',
            severity: 'Info',
            targetType: 'EmployeeLearning',
            targetId: (string) $id,
            details: "Learning record #{$id} set to {$validated['status']}" .
                ($validated['score'] !== null ? " (score {$validated['score']})" : ''),
            request: $request
        );

        return response()->json([
            'message' => "Learning record marked as {$validated['status']}.",
            'record' => $record,
        ]);
    }

    /**
     * GET /api/v1/ess/admin/audit-logs
     */
    public function getAuditLogs(Request $request): JsonResponse
    {
        $logs = AuditLog::with('user')
            ->whereIn('module_name', ['Employee Self-Service', 'ESS Management', 'ESS Administration', 'Attendance'])
            ->orderByDesc('occurred_at')
            ->take(50)
            ->get();

        return response()->json([
            'logs' => $logs->map(fn ($l) => [
                'id' => $l->audit_log_id,
                'timestamp' => $l->occurred_at?->toIso8601String() ?? now()->toIso8601String(),
                'user' => $l->user?->full_name ?? ($l->actor_role ?: 'System'),
                'action' => $l->action,
                'module' => $l->module_name,
                'department' => $l->actor_department ?? 'HR Department',
                'category' => $l->severity,
                'details' => $l->details,
                'requestId' => $l->target_id ? "REQ-{$l->target_id}" : '—',
            ]),
        ]);
    }
}
