<?php

namespace Modules\CoreHCM\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\EmployeeEmergencyContact;
use App\Models\EmployeeExitRecord;
use App\Models\EmployeePositionHistory;
use App\Models\Hr3Recommendation;
use App\Models\Position;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Modules\CoreHCM\Http\Requests\EmployeeLifecycleRequest;
use Modules\CoreHCM\Http\Requests\StoreEmployeeRequest;
use Modules\CoreHCM\Http\Requests\UpdateEmployeeRequest;
use Modules\CoreHCM\Http\Resources\EmployeeResource;

class EmployeeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
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

        if ($request->filled('department_id')) {
            $query->where('department_id', $request->integer('department_id'));
        }

        if ($request->filled('position_id')) {
            $query->where('position_id', $request->integer('position_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('employment_type')) {
            $query->where('employment_type', $request->string('employment_type'));
        }

        $employees = $query->orderBy('employee_code')->paginate($request->integer('per_page', 25));

        return response()->json([
            'data' => EmployeeResource::collection($employees),
            'meta' => [
                'current_page' => $employees->currentPage(),
                'last_page' => $employees->lastPage(),
                'per_page' => $employees->perPage(),
                'total' => $employees->total(),
            ],
        ]);
    }

    public function store(StoreEmployeeRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $contacts = $validated['emergency_contacts'] ?? [];
        unset($validated['emergency_contacts']);

        $employee = DB::transaction(function () use ($validated, $contacts) {
            $employee = Employee::create([
                ...$validated,
                'employee_code' => $this->nextEmployeeCode(),
                'onboarding_complete' => false,
            ]);

            foreach ($contacts as $index => $contact) {
                EmployeeEmergencyContact::create([
                    ...$contact,
                    'employee_id' => $employee->employee_id,
                    'is_primary' => $contact['is_primary'] ?? ($index === 0 ? 1 : 0),
                ]);
            }

            Position::where('position_id', $employee->position_id)->increment('filled_count');

            return $employee;
        });

        AuditLogger::log(
            'Employee created',
            'Core HCM',
            'Info',
            'employee',
            $employee->employee_code,
            'Hired ' . $employee->full_name,
        );

        return response()->json([
            'message' => 'Employee created successfully.',
            'data' => new EmployeeResource($employee->load('department', 'position', 'emergencyContacts')),
        ], 201);
    }

    public function show(Employee $employee): JsonResponse
    {
        $employee->load('department', 'position', 'emergencyContacts', 'documents', 'positionHistory', 'exitRecord');

        return response()->json([
            'data' => new EmployeeResource($employee),
        ]);
    }

    public function update(UpdateEmployeeRequest $request, Employee $employee): JsonResponse
    {
        $validated = $request->validated();
        $contacts = $validated['emergency_contacts'] ?? [];
        unset($validated['emergency_contacts']);
        $hasEmergencyContacts = array_key_exists('emergency_contacts', $request->validated());

        DB::transaction(function () use ($validated, $contacts, $employee, $hasEmergencyContacts) {
            $employee->update($validated);

            if ($hasEmergencyContacts) {
                $employee->emergencyContacts()->delete();

                foreach ($contacts as $index => $contact) {
                    EmployeeEmergencyContact::create([
                        ...$contact,
                        'employee_id' => $employee->employee_id,
                        'is_primary' => $contact['is_primary'] ?? ($index === 0 ? 1 : 0),
                    ]);
                }
            }
        });

        AuditLogger::log(
            'Employee updated',
            'Core HCM',
            'Info',
            'employee',
            $employee->employee_code,
            'Updated record for ' . $employee->full_name,
        );

        return response()->json([
            'message' => 'Employee updated successfully.',
            'data' => new EmployeeResource($employee->load('department', 'position', 'emergencyContacts')),
        ]);
    }

    public function destroy(Employee $employee): JsonResponse
    {
        if ($employee->status === 'Active' || $employee->status === 'On Leave') {
            return response()->json(['message' => 'Use the exit process to off-board an active employee.'], 422);
        }

        DB::transaction(function () use ($employee) {
            Position::where('position_id', $employee->position_id)->decrement('filled_count');
            $employee->exitRecord?->delete();
            $employee->positionHistory()->delete();
            $employee->emergencyContacts()->delete();
            $employee->delete();
        });

        AuditLogger::log(
            'Employee deleted',
            'Core HCM',
            'Warning',
            'employee',
            $employee->employee_code,
            'Deleted record for ' . $employee->full_name,
        );

        return response()->json(['message' => 'Employee deleted successfully.']);
    }

    public function regularize(EmployeeLifecycleRequest $request, Employee $employee): JsonResponse
    {
        if ($employee->employment_type === 'Regular') {
            return response()->json(['message' => 'Employee is already regularized.'], 422);
        }

        $recommendation = $this->requiredPerformanceEvaluation($request, $employee, ['Regularization', 'Performance Review']);
        if ($recommendation instanceof JsonResponse) {
            return $recommendation;
        }

        $employee->update(['employment_type' => 'Regular']);

        $this->markRecommendationProcessed($recommendation);

        EmployeePositionHistory::create([
            'employee_id' => $employee->employee_id,
            'effective_date' => $request->date('effective_date'),
            'change_type' => 'Regularization',
            'old_position_id' => $employee->position_id,
            'new_position_id' => $employee->position_id,
            'notes' => $request->string('notes') ?: ('Regularized via performance evaluation (' . $recommendation->evaluation_score . '%).'),
        ]);

        AuditLogger::log(
            'Employee regularized',
            'Core HCM',
            'Info',
            'employee',
            $employee->employee_code,
            'Regularized ' . $employee->full_name,
        );

        return response()->json([
            'message' => 'Employee regularized successfully.',
            'data' => new EmployeeResource($employee->load('department', 'position')),
        ]);
    }

    public function promote(EmployeeLifecycleRequest $request, Employee $employee): JsonResponse
    {
        $recommendation = $this->requiredPerformanceEvaluation($request, $employee, ['Promotion', 'Performance Review']);
        if ($recommendation instanceof JsonResponse) {
            return $recommendation;
        }

        $newPositionId = $request->integer('new_position_id');
        $newDepartmentId = $request->filled('new_department_id') ? $request->integer('new_department_id') : $employee->department_id;
        $newSalaryGradeId = $request->filled('new_salary_grade_id') ? $request->integer('new_salary_grade_id') : null;

        $oldPositionId = $employee->position_id;
        $oldSalaryGradeId = $employee->salary_grade_id;

        DB::transaction(function () use ($employee, $newPositionId, $newDepartmentId, $newSalaryGradeId, $request, $oldPositionId, $oldSalaryGradeId) {
            EmployeePositionHistory::create([
                'employee_id' => $employee->employee_id,
                'effective_date' => $request->date('effective_date'),
                'change_type' => $newPositionId !== $oldPositionId ? 'Promotion' : 'Salary Adjustment',
                'old_position_id' => $oldPositionId,
                'new_position_id' => $newPositionId,
                'old_salary_grade_id' => $oldSalaryGradeId,
                'new_salary_grade_id' => $newSalaryGradeId,
                'notes' => $request->string('notes'),
            ]);

            if ($newPositionId !== $oldPositionId) {
                Position::where('position_id', $oldPositionId)->decrement('filled_count');
                Position::where('position_id', $newPositionId)->increment('filled_count');
            }

            $employee->forceFill([
                'position_id' => $newPositionId,
                'department_id' => $newDepartmentId,
                'salary_grade_id' => $newSalaryGradeId ?: $employee->salary_grade_id,
            ])->save();
        });

        $this->markRecommendationProcessed($recommendation);

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

    public function exit(EmployeeLifecycleRequest $request, Employee $employee): JsonResponse
    {
        if ($employee->status === 'Resigned' || $employee->status === 'Terminated') {
            return response()->json(['message' => 'Employee already has an exit record.'], 422);
        }

        DB::transaction(function () use ($request, $employee) {
            EmployeeExitRecord::updateOrCreate(
                ['employee_id' => $employee->employee_id],
                [
                    'exit_type' => $request->string('exit_type'),
                    'exit_date' => $request->date('exit_date'),
                    'clearance_status' => $request->string('clearance_status', 'Pending'),
                    'coe_status' => $request->string('coe_status', 'Pending'),
                    'notes' => $request->string('notes'),
                ]
            );

            EmployeePositionHistory::create([
                'employee_id' => $employee->employee_id,
                'effective_date' => $request->date('effective_date'),
                'change_type' => 'Exit',
                'old_position_id' => $employee->position_id,
                'new_position_id' => $employee->position_id,
                'notes' => $request->string('notes'),
            ]);

            Position::where('position_id', $employee->position_id)->decrement('filled_count');

            $employee->forceFill([
                'status' => $request->string('exit_type'),
                'supervisor_employee_id' => null,
            ])->save();
        });

        AuditLogger::log(
            'Employee exited',
            'Core HCM',
            'Warning',
            'employee',
            $employee->employee_code,
            $request->string('exit_type') . ' ' . $employee->full_name,
        );

        return response()->json([
            'message' => 'Employee exit processed successfully.',
            'data' => new EmployeeResource($employee->load('department', 'position', 'exitRecord')),
        ]);
    }

    private function nextEmployeeCode(): string
    {
        $last = Employee::max('employee_code');
        $next = $last ? ((int) substr($last, 4)) + 1 : 1;

        return 'EMP-' . str_pad((string) $next, 4, '0', STR_PAD_LEFT);
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

        if ($recommendation->status !== 'Pending HR Action') {
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