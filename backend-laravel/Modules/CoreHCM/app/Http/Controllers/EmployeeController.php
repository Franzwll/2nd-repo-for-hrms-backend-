<?php

namespace Modules\CoreHCM\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\EmployeeExitRecord;
use App\Models\EmployeePositionHistory;
use App\Models\EssRequest;
use App\Models\Hr3Recommendation;
use App\Models\Position;
use App\Observers\ActivityObserver;
use App\Services\AuditLogger;
use App\Services\Hr3MockService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Modules\CoreHCM\Http\Controllers\Concerns\AppliesTableQuery;
use Modules\CoreHCM\Http\Controllers\Concerns\HcmCache;
use Modules\CoreHCM\Http\Requests\EmployeeLifecycleRequest;
use Modules\CoreHCM\Http\Requests\StoreEmployeeRequest;
use Modules\CoreHCM\Http\Requests\UpdateEmployeeRequest;
use Modules\CoreHCM\Http\Resources\EmployeeResource;
use Modules\CoreHCM\Services\EmployeeLifecycleService;

class EmployeeController extends Controller
{
    use AppliesTableQuery;

    public function __construct(
        private readonly EmployeeLifecycleService $lifecycle,
        private readonly Hr3MockService $hr3Mock,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $payload = $this->rememberHcmIndex($request, 'hcm:employees', function () use ($request) {
            $query = Employee::query()->with(['department', 'position']);

            if ($request->filled('q')) {
                $search = $request->string('q');

                $query->where(function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('employee_code', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            }

            $this->applyFilters($request, $query, [
                'department_id' => 'department_id',
                'position_id' => 'position_id',
                'status' => 'status',
                'employment_type' => 'employment_type',
            ]);

            $this->applySort($request, $query, [
                'employee_code' => 'employee_code',
                'first_name' => 'first_name',
                'last_name' => 'last_name',
                'email' => 'email',
                'status' => 'status',
                'employment_type' => 'employment_type',
                'date_hired' => 'date_hired',
                'created_at' => 'created_at',
            ], ['employee_code', 'asc']);

            $employees = $query->paginate($request->integer('per_page', 25));

            return [
                'data' => EmployeeResource::collection($employees)->resolve(),
                'meta' => [
                    'current_page' => $employees->currentPage(),
                    'last_page' => $employees->lastPage(),
                    'per_page' => $employees->perPage(),
                    'total' => $employees->total(),
                ],
            ];
        });

        return response()->json($payload);
    }

    public function store(StoreEmployeeRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $employee = DB::transaction(function () use ($validated) {
            $employee = Employee::create([
                ...$validated,
                'employee_code' => $this->lifecycle->generateEmployeeCode(),
                'onboarding_complete' => $validated['onboarding_complete'] ?? false,
                'employee_record_last_updated_at' => now()->toDateString(),
            ]);

            Position::where('position_id', $employee->position_id)->increment('filled_count');

            return $employee;
        });
        HcmCache::flush();

        return response()->json([
            'message' => 'Employee created successfully.',
            'data' => new EmployeeResource($employee->load('department', 'position')),
        ], 201);
    }

    public function show(Employee $employee): JsonResponse
    {
        $employee->load('department', 'position');

        return response()->json([
            'data' => new EmployeeResource($employee),
        ]);
    }

    public function update(UpdateEmployeeRequest $request, Employee $employee): JsonResponse
    {
        $validated = $request->validated();

        $previousStatus = $employee->status;
        $previousEmploymentType = $employee->employment_type;

        $newPositionId = array_key_exists('position_id', $validated)
            ? (int) $validated['position_id']
            : (int) $employee->position_id;
        $newDepartmentId = array_key_exists('department_id', $validated)
            ? (int) $validated['department_id']
            : $employee->department_id;

        $positionChanged = $newPositionId !== (int) $employee->position_id;
        $departmentChanged = (int) $newDepartmentId !== (int) $employee->department_id;
        $gradeChanged = array_key_exists('salary_grade_id', $validated)
            && (int) $validated['salary_grade_id'] !== (int) $employee->salary_grade_id;

        DB::transaction(function () use ($validated, $employee, $newPositionId, $newDepartmentId, $positionChanged, $departmentChanged, $gradeChanged) {
            if ($positionChanged || $departmentChanged || $gradeChanged) {
                // Structural change: route through the lifecycle service so the
                // position history and filled_count stay consistent.
                $employee->update(collect($validated)
                    ->except(['position_id', 'department_id', 'salary_grade_id'])
                    ->all());

                $changeType = $positionChanged
                    ? 'Transfer'
                    : ($departmentChanged ? 'Transfer' : 'Salary Adjustment');

                $this->lifecycle->applyPositionChange(
                    $employee,
                    $newPositionId,
                    $newDepartmentId,
                    $validated['salary_grade_id'] ?? null,
                    $changeType,
                    now()->toDateString(),
                    'Updated via employee record edit.',
                    'update',
                );
            } else {
                $employee->update($validated);
            }

            $employee->forceFill(['employee_record_last_updated_at' => now()->toDateString()])->save();
        });

        if ($previousStatus !== $employee->status || $previousEmploymentType !== $employee->employment_type) {
            $this->lifecycle->notifyStatusChange($employee, 'update', $previousStatus, $previousEmploymentType);
        }

        HcmCache::flush();

        return response()->json([
            'message' => 'Employee updated successfully.',
            'data' => new EmployeeResource($employee->load('department', 'position')),
        ]);
    }

    public function destroy(Employee $employee): JsonResponse
    {
        if (in_array($employee->status, ['Active', 'On Leave'], true)) {
            return response()->json(['message' => 'Use the exit process to off-board an active employee.'], 422);
        }

        // Archive, never hard-delete: statutory 201-file retention and the
        // employee's position history / documents must survive.
        $employee->delete();
        HcmCache::flush();

        return response()->json(['message' => 'Employee record archived successfully.']);
    }

    public function regularize(EmployeeLifecycleRequest $request, Employee $employee): JsonResponse
    {
        if ($employee->employment_type === 'Regular') {
            return response()->json(['message' => 'Employee is already regularized.'], 422);
        }

        if (! $request->filled('recommendation_id') && $this->hr3Mock->enabled()) {
            $recommendation = $this->hr3Mock->createForEmployee($employee, 'Regularization');
        } else {
            $recommendation = $this->requiredPerformanceEvaluation($request, $employee, ['Regularization', 'Performance Review']);
            if ($recommendation instanceof JsonResponse) {
                return $recommendation;
            }
        }

        $previousEmploymentType = $employee->employment_type;

        DB::transaction(function () use ($request, $employee, $recommendation) {
            ActivityObserver::withoutLogging(fn () => $employee->update(['employment_type' => 'Regular']));

            $this->lifecycle->applyPositionChange(
                $employee,
                (int) $employee->position_id,
                $employee->department_id,
                null,
                'Regularization',
                $request->date('effective_date')->toDateString(),
                $request->string('notes') ?: ('Regularized via performance evaluation (' . $recommendation->evaluation_score . '%).'),
                'regularize',
            );
        });

        $this->markRecommendationProcessed($recommendation);
        HcmCache::flush();

        AuditLogger::log(
            'Employee regularized',
            'Core HCM',
            'Info',
            'employee',
            $employee->employee_code,
            'Regularized ' . $employee->full_name,
        );

        $this->lifecycle->notifyStatusChange($employee, 'regularize', $employee->status, $previousEmploymentType);

        return response()->json([
            'message' => 'Employee regularized successfully.',
            'data' => new EmployeeResource($employee->load('department', 'position')),
        ]);
    }

    public function promote(EmployeeLifecycleRequest $request, Employee $employee): JsonResponse
    {
        if (! $request->filled('recommendation_id') && $this->hr3Mock->enabled()) {
            $recommendation = $this->hr3Mock->createForEmployee($employee, 'Promotion', [
                'suggested_position_id' => $request->integer('new_position_id'),
                'suggested_salary_grade_id' => $request->filled('new_salary_grade_id')
                    ? $request->integer('new_salary_grade_id')
                    : null,
            ]);
        } else {
            $recommendation = $this->requiredPerformanceEvaluation($request, $employee, ['Promotion', 'Performance Review']);
            if ($recommendation instanceof JsonResponse) {
                return $recommendation;
            }
        }

        $newPositionId = $request->integer('new_position_id');
        $newDepartmentId = $request->filled('new_department_id') ? $request->integer('new_department_id') : $employee->department_id;
        $newSalaryGradeId = $request->filled('new_salary_grade_id') ? $request->integer('new_salary_grade_id') : null;

        DB::transaction(function () use ($employee, $request, $newPositionId, $newDepartmentId, $newSalaryGradeId) {
            $this->lifecycle->applyPositionChange(
                $employee,
                $newPositionId,
                $newDepartmentId,
                $newSalaryGradeId,
                $newPositionId !== (int) $employee->position_id ? 'Promotion' : 'Salary Adjustment',
                $request->date('effective_date')->toDateString(),
                $request->string('notes'),
                'promote',
            );
        });

        $this->markRecommendationProcessed($recommendation);

        // Resolve any active ESS Promotion Requests for this employee.
        EssRequest::where('employee_id', $employee->employee_id)
            ->whereIn('status', ['Pending', 'Under Review'])
            ->where(function ($q) {
                $q->where('request_type', 'LIKE', '%Promotion%')
                  ->orWhereHas('category', fn ($c) => $c->where('code', 'career_promotion')->orWhere('name', 'LIKE', '%Career%'));
            })
            ->update([
                'status' => 'Approved',
                'review_note' => 'Promotion officially approved and processed via Core HCM & HR3 Performance Evaluation.',
            ]);

        HcmCache::flush();

        AuditLogger::log(
            'Employee promoted',
            'Core HCM',
            'Info',
            'employee',
            $employee->employee_code,
            'Promoted ' . $employee->full_name . ' to position ' . $newPositionId,
        );

        return response()->json([
            'message' => 'Employee promoted successfully.',
            'data' => new EmployeeResource($employee->load('department', 'position')),
        ]);
    }

    /**
     * Lateral move (department and/or position) without a performance
     * evaluation requirement. Distinct from promote(), which is merit-based.
     */
    public function transfer(EmployeeLifecycleRequest $request, Employee $employee): JsonResponse
    {
        $newPositionId = $request->filled('new_position_id') ? $request->integer('new_position_id') : (int) $employee->position_id;
        $newDepartmentId = $request->filled('new_department_id') ? $request->integer('new_department_id') : $employee->department_id;

        if ($newPositionId === (int) $employee->position_id && (int) $newDepartmentId === (int) $employee->department_id) {
            return response()->json(['message' => 'Select a different position or department to transfer to.'], 422);
        }

        DB::transaction(function () use ($request, $employee, $newPositionId, $newDepartmentId) {
            $this->lifecycle->applyPositionChange(
                $employee,
                $newPositionId,
                $newDepartmentId,
                null,
                'Transfer',
                $request->date('effective_date')->toDateString(),
                $request->string('notes') ?: 'Lateral transfer.',
                'transfer',
            );
        });

        HcmCache::flush();

        AuditLogger::log(
            'Employee transferred',
            'Core HCM',
            'Info',
            'employee',
            $employee->employee_code,
            'Transferred ' . $employee->full_name . ' to position ' . $newPositionId,
        );

        return response()->json([
            'message' => 'Employee transferred successfully.',
            'data' => new EmployeeResource($employee->load('department', 'position')),
        ]);
    }

    public function exit(EmployeeLifecycleRequest $request, Employee $employee): JsonResponse
    {
        if (in_array($employee->status, ['Resigned', 'Terminated', 'Retired'], true)) {
            return response()->json(['message' => 'Employee already has an exit record.'], 422);
        }

        $previousStatus = $employee->status;
        $exitType = $request->string('exit_type')->toString();

        DB::transaction(function () use ($request, $employee, $exitType) {
            // Core HCM owns the status change; Employee Records owns the exit
            // paperwork (clearance / COE). ERM fills those in via its own
            // endpoint once it receives EmployeeStatusChanged.
            EmployeeExitRecord::updateOrCreate(
                ['employee_id' => $employee->employee_id],
                [
                    'exit_type' => $exitType,
                    'exit_date' => $request->date('exit_date'),
                    'clearance_status' => 'Pending',
                    'coe_status' => 'Pending',
                    'notes' => $request->string('notes'),
                ]
            );

            EmployeePositionHistory::create([
                'employee_id' => $employee->employee_id,
                'effective_date' => $request->date('effective_date')->toDateString(),
                'change_type' => 'Exit',
                'old_position_id' => $employee->position_id,
                'new_position_id' => $employee->position_id,
                'notes' => $request->string('notes'),
            ]);

            Position::where('position_id', $employee->position_id)->decrement('filled_count');

            ActivityObserver::withoutLogging(fn () => $employee->forceFill([
                'status' => $exitType,
                'supervisor_employee_id' => null,
                'employee_record_last_updated_at' => now()->toDateString(),
            ])->save());
        });

        HcmCache::flush();

        AuditLogger::log(
            'Employee exited',
            'Core HCM',
            'Warning',
            'employee',
            $employee->employee_code,
            $exitType . ' ' . $employee->full_name,
        );

        $this->lifecycle->notifyStatusChange($employee, 'exit', $previousStatus, null, [
            'exit_type' => $exitType,
            'exit_date' => $request->date('exit_date')->toDateString(),
        ]);

        return response()->json([
            'message' => 'Employee exit processed successfully.',
            'data' => new EmployeeResource($employee->load('department', 'position')),
        ]);
    }

    /**
     * Return a separated employee to active service, reusing the original
     * record (code, tenure, documents) rather than creating a new one.
     */
    public function rehire(EmployeeLifecycleRequest $request, Employee $employee): JsonResponse
    {
        if (! in_array($employee->status, ['Resigned', 'Terminated', 'Retired'], true)) {
            return response()->json(['message' => 'Only separated employees can be rehired.'], 422);
        }

        $previousStatus = $employee->status;
        $employmentType = $request->string('employment_type')->toString() ?: 'Probationary';

        DB::transaction(function () use ($request, $employee, $employmentType) {
            EmployeePositionHistory::create([
                'employee_id' => $employee->employee_id,
                'effective_date' => $request->date('effective_date')->toDateString(),
                'change_type' => 'Rehire',
                'old_position_id' => $employee->position_id,
                'new_position_id' => $employee->position_id,
                'notes' => $request->string('notes') ?: 'Rehired.',
            ]);

            Position::where('position_id', $employee->position_id)->increment('filled_count');

            $employee->exitRecord?->delete();

            ActivityObserver::withoutLogging(fn () => $employee->forceFill([
                'status' => 'Active',
                'employment_type' => $employmentType,
                'employee_record_last_updated_at' => now()->toDateString(),
            ])->save());
        });

        HcmCache::flush();

        AuditLogger::log(
            'Employee rehired',
            'Core HCM',
            'Info',
            'employee',
            $employee->employee_code,
            'Rehired ' . $employee->full_name,
        );

        $this->lifecycle->notifyStatusChange($employee, 'rehire', $previousStatus, null);

        return response()->json([
            'message' => 'Employee rehired successfully.',
            'data' => new EmployeeResource($employee->load('department', 'position')),
        ]);
    }

    /**
     * Resolve the performance evaluation (HR3 recommendation) required before
     * regularization or promotion, or return a 422 JSON response if missing.
     */
    private function requiredPerformanceEvaluation(
        EmployeeLifecycleRequest $request,
        Employee $employee,
        array $allowedTypes
    ): Hr3Recommendation|JsonResponse {
        $recommendationId = $request->integer('recommendation_id');

        if (!$recommendationId) {
            return response()->json(
                ['message' => 'A performance evaluation (HR3 recommendation) is required before performing this action.'],
                422
            );
        }

        $recommendation = Hr3Recommendation::find($recommendationId);

        if (!$recommendation || (int) $recommendation->employee_id !== (int) $employee->employee_id) {
            return response()->json(
                ['message' => 'The selected performance evaluation does not belong to this employee.'],
                422
            );
        }

        if (!in_array($recommendation->recommendation_type, $allowedTypes, true)) {
            return response()->json(
                ['message' => 'The selected performance evaluation type does not support this action.'],
                422
            );
        }

        if (! in_array($recommendation->status, ['Pending HR Action', 'Acknowledged'], true)) {
            return response()->json(
                ['message' => 'The selected performance evaluation has already been processed or deferred.'],
                422
            );
        }

        return $recommendation;
    }

    private function markRecommendationProcessed(Hr3Recommendation $recommendation): void
    {
        $recommendation->update(['status' => 'Approved & Processed']);
    }
}
