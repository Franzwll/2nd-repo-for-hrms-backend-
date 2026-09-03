<?php

namespace Modules\EmployeeSelfService\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Employee;
use App\Models\EssCategory;
use App\Models\EssRequest;
use App\Models\LeaveBalance;
use App\Services\AuditLogger;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EssAdminController extends Controller
{
    /**
     * GET /api/v1/ess/admin/requests
     */
    public function getRequests(Request $request): JsonResponse
    {
        $query = EssRequest::with(['employee.department', 'category', 'assignedTo']);

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
            'approved' => EssRequest::where('status', 'Approved')->count(),
            'completed' => EssRequest::where('status', 'Completed')->count(),
            'rejected' => EssRequest::where('status', 'Rejected')->count(),
            'returned' => EssRequest::where('returned_count', '>', 0)->count(),
        ];

        return response()->json([
            'counts' => $counts,
            'requests' => $allRequests->map(function ($r) {
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
                    'assignedTo' => $r->assignedTo?->full_name ?? ($r->status === 'Pending' ? 'Unassigned' : 'HR Admin'),
                    'details' => $r->details,
                    'note' => $r->review_note,
                    'returnedCount' => $r->returned_count,
                    'attachment_path' => $r->attachment_path,
                ];
            }),
        ]);
    }

    /**
     * PATCH /api/v1/ess/admin/requests/{id}/status
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:Pending,Under Review,Approved,Rejected,Completed,Returned for Clarification',
            'note' => 'nullable|string',
        ]);

        $essRequest = EssRequest::where('request_code', $id)
            ->orWhere('ess_request_id', $id)
            ->first();

        if (! $essRequest) {
            return response()->json(['message' => 'Request not found.'], 404);
        }

        $user = $request->user();
        $targetStatus = $validated['status'];
        $previousStatus = $essRequest->status;

        if ($targetStatus === 'Returned for Clarification') {
            $essRequest->status = 'Pending';
            $essRequest->returned_count += 1;
        } else {
            $essRequest->status = $targetStatus;
        }

        if ($user) {
            $essRequest->assigned_to_user_id = $user->system_user_id;
        }

        if (! empty($validated['note'])) {
            $essRequest->review_note = $validated['note'];
        }

        $essRequest->save();

        // If Approved and is a Leave request, automatically deduct/update leave balances
        if ($targetStatus === 'Approved' && $previousStatus !== 'Approved') {
            if (stripos($essRequest->request_type, 'Leave') !== false) {
                // Calculate days
                $days = 1.0;
                if ($essRequest->date_from && $essRequest->date_to) {
                    $start = Carbon::parse($essRequest->date_from);
                    $end = Carbon::parse($essRequest->date_to);
                    $days = max(1.0, (float) ($end->diffInDays($start) + 1));
                }

                // Determine leave type (Vacation, Sick, Emergency)
                $leaveType = 'Vacation Leave';
                if (stripos($essRequest->request_type, 'Sick') !== false) {
                    $leaveType = 'Sick Leave';
                } elseif (stripos($essRequest->request_type, 'Emergency') !== false) {
                    $leaveType = 'Emergency Leave';
                }

                $balance = LeaveBalance::firstOrCreate([
                    'employee_id' => $essRequest->employee_id,
                    'leave_type' => $leaveType,
                    'period_year' => Carbon::today()->year,
                ], [
                    'total_days' => 15.0,
                    'used_days' => 0.0,
                ]);

                $balance->used_days = min($balance->total_days, $balance->used_days + $days);
                $balance->save();
            }
        }

        AuditLogger::log(
            action: "ESS Request {$targetStatus}",
            module: 'ESS Management',
            severity: $targetStatus === 'Rejected' ? 'Warning' : 'Info',
            targetType: 'EssRequest',
            targetId: (string) $essRequest->ess_request_id,
            details: "Request {$essRequest->request_code} marked as {$targetStatus} by " . ($user?->full_name ?? 'Admin') . ($validated['note'] ? ": {$validated['note']}" : ''),
            request: $request
        );

        return response()->json([
            'message' => "Request {$essRequest->request_code} updated to {$targetStatus}.",
            'request' => $essRequest->load(['employee', 'category']),
        ]);
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

        $latest = EssRequest::max('ess_request_id') ?? 0;
        $nextNumber = 4400 + $latest + 1;
        $requestCode = 'REQ-' . $nextNumber;

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
