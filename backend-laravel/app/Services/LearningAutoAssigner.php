<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Resolves which learning courses an employee should be assigned based on
 * their department and position, then creates missing employee_learning rows.
 *
 * Called on:
 *  - New hire (onboarding)
 *  - Department/position transfer
 */
class LearningAutoAssigner
{
    /**
     * Auto-assign applicable courses to a single employee.
     *
     * @return int Number of new enrollments created.
     */
    public function assignForEmployee(int $employeeId): int
    {
        $employee = DB::table('employees')
            ->where('employee_id', $employeeId)
            ->first(['employee_id', 'department_id', 'position_id']);

        if (! $employee || ! $employee->department_id) {
            return 0;
        }

        $courseIds = $this->resolveCoursesFor(
            (int) $employee->department_id,
            $employee->position_id ? (int) $employee->position_id : null
        );

        $assigned = 0;

        foreach ($courseIds as $courseId) {
            $exists = DB::table('employee_learning')
                ->where('employee_id', $employeeId)
                ->where('course_id', $courseId)
                ->exists();

            if ($exists) {
                continue;
            }

            DB::table('employee_learning')->insert([
                'employee_id'   => $employeeId,
                'course_id'     => $courseId,
                'status'        => 'Assigned',
                'assigned_date' => now()->toDateString(),
                'created_at'    => now(),
                'updated_at'    => now(),
            ]);

            $assigned++;
        }

        if ($assigned > 0) {
            Log::info('LearningAutoAssigner: assigned courses', [
                'employee_id' => $employeeId,
                'courses_assigned' => $assigned,
            ]);
        }

        return $assigned;
    }

    /**
     * Re-evaluate and assign new courses after a department/position change.
     * Existing course progress is never removed — only new enrollments are added.
     *
     * @return int Number of new enrollments created.
     */
    public function reassignOnTransfer(int $employeeId): int
    {
        // Same logic — assignForEmployee only creates missing rows,
        // so it's safe to call after a transfer.
        return $this->assignForEmployee($employeeId);
    }

    /**
     * Resolve which course IDs an employee should see based on their
     * department and position.
     *
     * @return int[]
     */
    private function resolveCoursesFor(int $departmentId, ?int $positionId): array
    {
        // Universal courses (no targets defined at all)
        $universal = DB::table('learning_courses')
            ->whereNotExists(function ($q) {
                $q->select(DB::raw(1))
                    ->from('learning_course_targets')
                    ->whereColumn('learning_course_targets.course_id', 'learning_courses.course_id');
            })
            ->pluck('course_id')
            ->all();

        // Targeted courses matching this employee's department or position
        $targeted = DB::table('learning_courses')
            ->whereExists(function ($q) use ($departmentId, $positionId) {
                $q->select(DB::raw(1))
                    ->from('learning_course_targets')
                    ->whereColumn('learning_course_targets.course_id', 'learning_courses.course_id')
                    ->where(function ($w) use ($departmentId, $positionId) {
                        $w->where('learning_course_targets.department_id', $departmentId);
                        if ($positionId) {
                            $w->orWhere('learning_course_targets.position_id', $positionId);
                        }
                    });
            })
            ->pluck('course_id')
            ->all();

        return array_unique(array_merge($universal, $targeted));
    }
}
