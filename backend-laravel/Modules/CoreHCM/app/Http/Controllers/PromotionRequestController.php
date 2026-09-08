<?php

namespace Modules\CoreHCM\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\EmployeePositionHistory;
use App\Models\Position;
use App\Models\PromotionRequest;
use App\Observers\ActivityObserver;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * HR-side promotion request inbox.
 * Employees file requests from ESS; HR reviews here and approval
 * runs the same position-transfer path as EmployeeController@promote
 * (history row + filled_count move + employee update).
 */
class PromotionRequestController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = PromotionRequest::with(['employee.department', 'employee.position', 'requestedPosition'])
            ->orderByDesc('created_at');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        if ($request->boolean('pending_only')) {
            $query->active();
        }
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('justification', 'like', "%{$search}%")
                    ->orWhereHas('employee', fn ($e) => $e
                        ->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('employee_code', 'like', "%{$search}%"));
            });
        }

        $paginated = $query->paginate((int) $request->query('per_page', 15));

        return response()->json([
            'data' => $paginated->items(),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
        ]);
    }

    public function show(int $promotionRequest): JsonResponse
    {
        $model = PromotionRequest::with(['employee.department', 'employee.position', 'requestedPosition'])
            ->findOrFail($promotionRequest);

        return response()->json(['data' => $model]);
    }

    /**
     * Review a request: approve | reject | return.
     * Approve applies the promotion immediately (position/grade transfer).
     */
    public function review(Request $request, int $promotionRequest): JsonResponse
    {
        $data = $request->validate([
            'decision' => ['required', 'string', 'in:approve,reject,return'],
            'review_notes' => ['nullable', 'string', 'max:1000'],
            'requested_position_id' => ['nullable', 'integer', 'exists:positions,position_id'],
            'requested_salary_grade_id' => ['nullable', 'integer', 'exists:salary_grades,salary_grade_id'],
            'effective_date' => ['nullable', 'date'],
        ]);

        $promo = PromotionRequest::with('employee')->findOrFail($promotionRequest);

        if (! in_array($promo->status, ['Pending', 'Returned'])) {
            return response()->json(['message' => "Request is already {$promo->status} and cannot be reviewed again."], 422);
        }

        $employee = $promo->employee;
        if (! $employee) {
            return response()->json(['message' => 'Linked employee record no longer exists.'], 422);
        }

        $user = $request->user();

        if ($data['decision'] === 'approve') {
            $newPositionId = (int) ($data['requested_position_id'] ?? $promo->requested_position_id ?? $employee->position_id);
            $newGradeId = $data['requested_salary_grade_id'] ?? $promo->requested_salary_grade_id;

            $oldPositionId = $employee->position_id;

            DB::transaction(function () use ($employee, $promo, $newPositionId, $newGradeId, $data, $oldPositionId) {
                EmployeePositionHistory::create([
                    'employee_id' => $employee->employee_id,
                    'effective_date' => $data['effective_date'] ?? now()->toDateString(),
                    'change_type' => $newPositionId !== (int) $oldPositionId ? 'Promotion' : 'Salary Adjustment',
                    'old_position_id' => $oldPositionId,
                    'new_position_id' => $newPositionId,
                    'old_salary_grade_id' => $employee->salary_grade_id,
                    'new_salary_grade_id' => $newGradeId,
                    'notes' => $data['review_notes'] ?? ('Promotion approved from employee request #' . $promo->promotion_request_id),
                ]);

                if ($newPositionId !== (int) $oldPositionId) {
                    Position::where('position_id', $oldPositionId)->decrement('filled_count');
                    Position::where('position_id', $newPositionId)->increment('filled_count');
                }

                ActivityObserver::withoutLogging(fn () => $employee->forceFill([
                    'position_id' => $newPositionId,
                    'salary_grade_id' => $newGradeId ?: $employee->salary_grade_id,
                ])->save());

                $promo->update([
                    'status' => 'Approved',
                    'reviewed_by' => $user?->system_user_id,
                    'reviewed_at' => now(),
                    'review_notes' => $data['review_notes'],
                    'requested_position_id' => $newPositionId,
                    'requested_salary_grade_id' => $newGradeId,
                ]);
            });

            AuditLogger::log(
                'Promotion request approved',
                'Core HCM',
                'Info',
                'employee',
                (string) $employee->employee_code,
                "Approved promotion request #{$promo->promotion_request_id} for {$employee->full_name}.",
            );

            return response()->json(['message' => 'Promotion request approved and applied.']);
        }

        $promo->update([
            'status' => $data['decision'] === 'reject' ? 'Rejected' : 'Returned',
            'reviewed_by' => $user?->system_user_id,
            'reviewed_at' => now(),
            'review_notes' => $data['review_notes'],
        ]);

        AuditLogger::log(
            $data['decision'] === 'reject' ? 'Promotion request rejected' : 'Promotion request returned',
            'Core HCM',
            $data['decision'] === 'reject' ? 'Warning' : 'Info',
            'employee',
            (string) $employee->employee_code,
            ucfirst($data['decision']) . " promotion request #{$promo->promotion_request_id} for {$employee->full_name}.",
        );

        return response()->json(['message' => 'Promotion request ' . strtolower($promo->status) . '.']);
    }
}
