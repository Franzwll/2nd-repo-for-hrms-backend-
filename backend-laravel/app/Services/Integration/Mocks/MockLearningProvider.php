<?php

namespace App\Services\Integration\Mocks;

use App\Services\Integration\Contracts\LearningProvider;
use Illuminate\Support\Facades\DB;

/**
 * Demo/local implementation of the Team 3 (Performance & Development) seam.
 */
class MockLearningProvider implements LearningProvider
{
    public function learningFor(int $employeeId): array
    {
        return DB::table('employee_learning as el')
            ->leftJoin('learning_courses as lc', 'lc.course_id', '=', 'el.course_id')
            ->where('el.employee_id', $employeeId)
            ->get([
                'el.status',
                'el.score',
                'el.assigned_date',
                'el.completed_date',
                'lc.course_code',
                'lc.title as course_title',
                'lc.category as course_category',
            ])
            ->map(fn ($r) => [
                'course_code' => $r->course_code,
                'title' => $r->course_title,
                'category' => $r->course_category ?? 'General',
                'status' => $r->status,
                'score' => $r->score !== null ? (float) $r->score : null,
                'assigned_date' => $r->assigned_date,
                'completed_date' => $r->completed_date,
            ])->all();
    }
}
