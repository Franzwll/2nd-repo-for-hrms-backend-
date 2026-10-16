<?php

namespace Modules\CoreHCM\Services;

use App\Models\Employee;
use App\Models\EmployeePositionHistory;
use App\Models\Position;
use App\Observers\ActivityObserver;
use Illuminate\Support\Facades\DB;
use Modules\CoreHCM\Events\EmployeeStatusChanged;

/**
 * Single source of truth for Core HCM employment mutations.
 *
 * Every position / department / salary-grade change goes through
 * applyPositionChange() so that employee_position_history is always written and
 * positions.filled_count stays accurate — including plain profile edits, which
 * previously bypassed both. Employee codes are minted by generateEmployeeCode()
 * against a locked sequence row so concurrent hires cannot collide.
 */
class EmployeeLifecycleService
{
    /**
     * Mint the next sequential employee code (EMP-0001, ...).
     *
     * Must be called inside a transaction: lockForUpdate() holds the sequence
     * row until that transaction commits, so two concurrent hires serialise.
     */
    public function generateEmployeeCode(): string
    {
        $row = DB::table('employee_code_sequences')->where('id', 1)->lockForUpdate()->first();

        // Floor the sequence against whatever already exists so seeded / legacy
        // records (inserted after the migration seeded the sequence) can never
        // be re-issued. Uses both the numeric employee_id and the numeric
        // suffix of the highest employee_code.
        $floorCode = (int) preg_replace('/\D/', '', (string) (Employee::withTrashed()->max('employee_code') ?? '0'));
        $floorId = (int) (Employee::withTrashed()->max('employee_id') ?? 0);
        $floor = max($floorCode, $floorId);

        if (! $row) {
            // Self-heal on legacy databases where the seed row is missing.
            DB::table('employee_code_sequences')->insert(['id' => 1, 'next_val' => $floor]);
            $row = (object) ['next_val' => $floor];
        }

        $next = max((int) $row->next_val, $floor) + 1;

        DB::table('employee_code_sequences')->where('id', 1)->update(['next_val' => $next]);

        return 'EMP-' . str_pad((string) $next, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Move an employee to a new position / department / salary grade.
     *
     * Writes the employee_position_history row, adjusts positions.filled_count
     * on both the old and new position, updates the employee, stamps the record
     * freshness date, and fires EmployeeStatusChanged. Null arguments keep the
     * employee's current value. A same-position change (e.g. regularization)
     * still records history but does not touch filled_count.
     */
    public function applyPositionChange(
        Employee $employee,
        ?int $newPositionId,
        ?int $newDepartmentId,
        ?int $newSalaryGradeId,
        string $changeType,
        string $effectiveDate,
        ?string $notes = null,
        string $eventAction = 'position_change',
    ): Employee {
        $newPositionId ??= (int) $employee->position_id;
        $newDepartmentId ??= $employee->department_id;
        $hasNewGrade = $newSalaryGradeId !== null;

        $oldPositionId = (int) $employee->position_id;
        $oldSalaryGradeId = $employee->salary_grade_id;

        EmployeePositionHistory::create([
            'employee_id' => $employee->employee_id,
            'effective_date' => $effectiveDate,
            'change_type' => $changeType,
            'old_position_id' => $oldPositionId,
            'new_position_id' => $newPositionId,
            'old_salary_grade_id' => $oldSalaryGradeId,
            'new_salary_grade_id' => $hasNewGrade ? $newSalaryGradeId : $oldSalaryGradeId,
            'notes' => $notes,
        ]);

        if ($newPositionId !== $oldPositionId) {
            Position::where('position_id', $oldPositionId)->decrement('filled_count');
            Position::where('position_id', $newPositionId)->increment('filled_count');
        }

        ActivityObserver::withoutLogging(fn () => $employee->forceFill([
            'position_id' => $newPositionId,
            'department_id' => $newDepartmentId,
            'salary_grade_id' => $hasNewGrade ? $newSalaryGradeId : $employee->salary_grade_id,
            'employee_record_last_updated_at' => now()->toDateString(),
        ])->save());

        EmployeeStatusChanged::dispatch($employee, $eventAction, null, null, [
            'change_type' => $changeType,
            'old_position_id' => $oldPositionId,
            'new_position_id' => $newPositionId,
        ]);

        return $employee;
    }

    /**
     * Stamp the 201 record freshness date after a dossier edit (ERM calls this).
     */
    public function touchRecord(Employee $employee): void
    {
        $employee->forceFill(['employee_record_last_updated_at' => now()->toDateString()])->save();
    }

    /**
     * Fire the status-changed contract without any structural change (used for
     * exits, rehires and manual status/employment-type edits).
     */
    public function notifyStatusChange(
        Employee $employee,
        string $action,
        ?string $previousStatus = null,
        ?string $previousEmploymentType = null,
        array $context = [],
    ): void {
        EmployeeStatusChanged::dispatch($employee, $action, $previousStatus, $previousEmploymentType, $context);
    }
}
