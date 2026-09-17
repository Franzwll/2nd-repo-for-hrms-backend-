<?php

namespace Modules\CoreHCM\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\EmployeeExitRecord;
use App\Models\EmployeePositionHistory;
use App\Models\Hr3Recommendation;
use App\Models\Position;
use App\Models\PromotionRequest;
use App\Observers\ActivityObserver;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Modules\CoreHCM\Http\Controllers\Concerns\AppliesTableQuery;

/**
 * HR-side promotion request inbox.
 * Employees file requests from ESS; HR reviews here and approval
 * runs the same position-transfer path as EmployeeController@promote
 * (history row + filled_count move + employee update).
 */
class PromotionRequestController extends Controller
{
    use AppliesTableQuery;

    public function index(Request $request): JsonResponse
    {
        $query = PromotionRequest::with(['employee.department', 'employee.position', 'requestedPosition', 'hr3Recommendation']);

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

        $this->applyFilters($request, $query, [
            'status' => 'status',
            'employee_id' => 'employee_id',
        ]);

        $this->applySort($request, $query, [
            'status' => 'status',
            'created_at' => 'created_at',
            'updated_at' => 'updated_at',
            'reviewed_at' => 'reviewed_at',
        ], ['created_at', 'desc']);

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
        $model = PromotionRequest::with(['employee.department', 'employee.position', 'requestedPosition', 'hr3Recommendation'])
            ->findOrFail($promotionRequest);

        return response()->json(['data' => $model]);
    }

    /**
     * Forward an ESS request to HR3 for performance evaluation.
     * Additive step in the succession loop — does not decide anything yet.
     * Accepts Pending/Returned requests and moves them to Under HR3 Review.
     */
    public function forwardToHr3(Request $request, int $promotionRequest): JsonResponse
    {
        $data = $request->validate([
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        $promo = PromotionRequest::with('employee')->findOrFail($promotionRequest);

        if (! in_array($promo->status, ['Pending', 'Returned'], true)) {
            return response()->json(['message' => "Only Pending or Returned requests can be forwarded to HR3 (current: {$promo->status})."], 422);
        }

        if (! $promo->employee) {
            return response()->json(['message' => 'Linked employee record no longer exists.'], 422);
        }

        $user = $request->user();

        $promo->update([
            'status' => 'Under HR3 Review',
            'forwarded_to_hr3_by' => $user?->system_user_id,
            'forwarded_to_hr3_at' => now(),
            'review_notes' => $data['note'] ?? $promo->review_notes,
        ]);

        AuditLogger::log(
            'Promotion request forwarded to HR3',
            'Core HCM',
            'Info',
            'employee',
            (string) $promo->employee->employee_code,
            "Forwarded promotion request #{$promo->promotion_request_id} to HR3 for evaluation.",
        );

        return response()->json([
            'message' => 'Request forwarded to HR3 for performance evaluation.',
            'data' => $promo->fresh(['employee', 'hr3Recommendation']),
        ]);
    }

    /**
     * Record the HR3 evaluation result against a forwarded request.
     * Creates/links the hr3_recommendations row and moves the request to
     * Pending HR Action so the final promote/terminate decision can be made.
     */
    public function linkHr3Result(Request $request, int $promotionRequest): JsonResponse
    {
        $data = $request->validate([
            'recommendation_id' => ['nullable', 'integer', 'exists:hr3_recommendations,recommendation_id'],
            'recommendation_type' => ['nullable', 'string', 'in:Regularization,Promotion,Performance Review'],
            'evaluation_score' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'suggested_position_id' => ['nullable', 'integer', 'exists:positions,position_id'],
            'suggested_salary_grade_id' => ['nullable', 'integer', 'exists:salary_grades,salary_grade_id'],
            'comments' => ['nullable', 'string', 'max:2000'],
        ]);

        $promo = PromotionRequest::with(['employee', 'hr3Recommendation'])->findOrFail($promotionRequest);

        if ($promo->status !== 'Under HR3 Review') {
            return response()->json(['message' => "Only requests Under HR3 Review can receive an HR3 result (current: {$promo->status})."], 422);
        }

        $employee = $promo->employee;
        if (! $employee) {
            return response()->json(['message' => 'Linked employee record no longer exists.'], 422);
        }

        $recommendation = null;
        if (! empty($data['recommendation_id'])) {
            $recommendation = Hr3Recommendation::find($data['recommendation_id']);
            if (! $recommendation || (int) $recommendation->employee_id !== (int) $employee->employee_id) {
                return response()->json(['message' => 'The selected HR3 evaluation does not belong to this employee.'], 422);
            }
            if ($recommendation->status !== 'Pending HR Action') {
                return response()->json(['message' => 'The selected HR3 evaluation has already been processed.'], 422);
            }
        } else {
            if ($data['evaluation_score'] === null) {
                return response()->json(['message' => 'Provide either recommendation_id or an evaluation_score.'], 422);
            }
            $recommendation = Hr3Recommendation::create([
                'employee_id' => $employee->employee_id,
                'promotion_request_id' => $promo->promotion_request_id,
                'recommendation_type' => $data['recommendation_type'] ?? 'Promotion',
                'evaluation_score' => $data['evaluation_score'],
                'evaluator_user_id' => $request->user()?->system_user_id,
                'date_submitted' => now()->toDateString(),
                'status' => 'Pending HR Action',
                'suggested_position_id' => $data['suggested_position_id'] ?? $promo->requested_position_id,
                'suggested_salary_grade_id' => $data['suggested_salary_grade_id'] ?? $promo->requested_salary_grade_id,
                'current_employment_type' => $employee->employment_type,
                'comments' => $data['comments'],
            ]);
        }

        // Link both directions.
        $recommendation->update(['promotion_request_id' => $promo->promotion_request_id]);
        $promo->update([
            'status' => 'Pending HR Action',
            'hr3_recommendation_id' => $recommendation->recommendation_id,
        ]);

        AuditLogger::log(
            'HR3 evaluation received',
            'Core HCM',
            'Info',
            'employee',
            (string) $employee->employee_code,
            "HR3 evaluation ({$recommendation->evaluation_score}%) linked to promotion request #{$promo->promotion_request_id}.",
        );

        return response()->json([
            'message' => 'HR3 evaluation linked. Request is now pending final decision.',
            'data' => $promo->fresh(['employee', 'hr3Recommendation']),
        ]);
    }

    /**
     * Review a request: approve | reject | return | terminate | defer.
     * - Direct path (Pending/Returned, never forwarded): approve works as before.
     * - HR3 loop path (Under HR3 Review / Pending HR Action): approve/terminate
     *   require a linked HR3 evaluation in Pending HR Action; approve consumes
     *   it (marks Approved & Processed) exactly like EmployeeController@promote.
     */
    public function review(Request $request, int $promotionRequest): JsonResponse
    {
        $data = $request->validate([
            'decision' => ['required', 'string', 'in:approve,reject,return,terminate,defer'],
            'review_notes' => ['nullable', 'string', 'max:1000'],
            'requested_position_id' => ['nullable', 'integer', 'exists:positions,position_id'],
            'requested_salary_grade_id' => ['nullable', 'integer', 'exists:salary_grades,salary_grade_id'],
            'effective_date' => ['nullable', 'date'],
            'exit_type' => ['nullable', 'string', 'in:Resigned,Terminated,Retired'],
        ]);

        $promo = PromotionRequest::with(['employee', 'hr3Recommendation'])->findOrFail($promotionRequest);

        if (! in_array($promo->status, ['Pending', 'Returned', 'Pending HR Action'], true)) {
            return response()->json(['message' => "Request is already {$promo->status} and cannot be reviewed again."], 422);
        }

        if ($promo->status === 'Under HR3 Review') {
            return response()->json(['message' => 'Request is still under HR3 review. Wait for the evaluation result first.'], 422);
        }

        $employee = $promo->employee;
        if (! $employee) {
            return response()->json(['message' => 'Linked employee record no longer exists.'], 422);
        }

        $user = $request->user();

        // HR3-loop gate: forwarded requests need a fresh HR3 evaluation.
        $hr3 = null;
        if ($promo->inHr3Loop()) {
            $hr3 = $promo->hr3Recommendation;
            if (! $hr3 || $hr3->status !== 'Pending HR Action') {
                return response()->json(['message' => 'This request is in the HR3 loop — link a pending HR3 evaluation before deciding.'], 422);
            }
            if ((int) $hr3->employee_id !== (int) $employee->employee_id) {
                return response()->json(['message' => 'The linked HR3 evaluation does not belong to this employee.'], 422);
            }
        }

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

                if ($hr3) {
                    $hr3->update(['status' => 'Approved & Processed']);
                }
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

        if ($data['decision'] === 'terminate') {
            $exitType = $data['exit_type'] ?? 'Terminated';

            DB::transaction(function () use ($employee, $promo, $data, $user, $exitType, $hr3) {
                EmployeeExitRecord::updateOrCreate(
                    ['employee_id' => $employee->employee_id],
                    [
                        'exit_type' => $exitType,
                        'exit_date' => $data['effective_date'] ?? now()->toDateString(),
                        'clearance_status' => 'Pending',
                        'coe_status' => 'Pending',
                        'notes' => $data['review_notes'] ?? ('Terminated via succession decision on request #' . $promo->promotion_request_id),
                    ]
                );

                EmployeePositionHistory::create([
                    'employee_id' => $employee->employee_id,
                    'effective_date' => $data['effective_date'] ?? now()->toDateString(),
                    'change_type' => 'Exit',
                    'old_position_id' => $employee->position_id,
                    'new_position_id' => $employee->position_id,
                    'notes' => $data['review_notes'],
                ]);

                Position::where('position_id', $employee->position_id)->decrement('filled_count');

                ActivityObserver::withoutLogging(fn () => $employee->forceFill([
                    'status' => $exitType,
                    'supervisor_employee_id' => null,
                ])->save());

                $promo->update([
                    'status' => 'Terminated',
                    'reviewed_by' => $user?->system_user_id,
                    'reviewed_at' => now(),
                    'review_notes' => $data['review_notes'],
                ]);

                if ($hr3) {
                    $hr3->update(['status' => 'Approved & Processed']);
                }
            });

            AuditLogger::log(
                'Promotion request terminated',
                'Core HCM',
                'Warning',
                'employee',
                (string) $employee->employee_code,
                "Succession decision terminated {$employee->full_name} via request #{$promo->promotion_request_id}.",
            );

            return response()->json(['message' => 'Employee terminated via succession decision.']);
        }

        if ($data['decision'] === 'defer') {
            $promo->update([
                'status' => 'Deferred',
                'reviewed_by' => $user?->system_user_id,
                'reviewed_at' => now(),
                'review_notes' => $data['review_notes'],
            ]);

            if ($hr3) {
                $hr3->update(['status' => 'Deferred']);
            }

            AuditLogger::log(
                'Promotion request deferred',
                'Core HCM',
                'Info',
                'employee',
                (string) $employee->employee_code,
                "Deferred promotion request #{$promo->promotion_request_id} for {$employee->full_name}.",
            );

            return response()->json(['message' => 'Promotion request deferred.']);
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
