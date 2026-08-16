<?php

namespace Modules\CoreHCM\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Hr3Recommendation;
use Illuminate\Http\JsonResponse;

class HR3RecommendationController extends Controller
{
    public function index(): JsonResponse
    {
        $recommendations = Hr3Recommendation::query()
            ->with(['employee.department', 'suggestedPosition', 'suggestedSalaryGrade', 'evaluator'])
            ->orderByDesc('date_submitted')
            ->get()
            ->map(function (Hr3Recommendation $rec) {
                $employee = $rec->employee;

                return [
                    'id' => 'HR3-REC-' . str_pad((string) $rec->recommendation_id, 2, '0', STR_PAD_LEFT),
                    'recommendation_id' => $rec->recommendation_id,
                    'employee_id' => $employee ? $employee->employee_id : null,
                    'employee_code' => $employee?->employee_code,
                    'employee_name' => $employee ? trim(($employee->first_name ?? '') . ' ' . ($employee->last_name ?? '')) : 'Unknown',
                    'department' => $employee?->department?->name ?? '—',
                    'current_employment_type' => $rec->current_employment_type,
                    'recommendation_type' => $rec->recommendation_type,
                    'evaluation_score' => (float) $rec->evaluation_score,
                    'evaluator' => $rec->evaluator ? trim(($rec->evaluator->first_name ?? '') . ' ' . ($rec->evaluator->last_name ?? '')) : '—',
                    'date_submitted' => $rec->date_submitted?->toDateString(),
                    'status' => $rec->status,
                    'suggested_position' => $rec->suggestedPosition?->title ?? null,
                    'suggested_salary_grade' => $rec->suggestedSalaryGrade
                        ? $rec->suggestedSalaryGrade->code . ' (₱' . number_format($rec->suggestedSalaryGrade->min_salary ?? 0) . ' – ₱' . number_format($rec->suggestedSalaryGrade->max_salary ?? 0) . ')'
                        : null,
                    'comments' => $rec->comments,
                ];
            });

        return response()->json(['data' => $recommendations]);
    }
}