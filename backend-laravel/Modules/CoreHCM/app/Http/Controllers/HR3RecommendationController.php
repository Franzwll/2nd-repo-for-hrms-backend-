<?php

namespace Modules\CoreHCM\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Hr3Recommendation;
use App\Services\AuditLogger;
use App\Observers\ActivityObserver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\CoreHCM\Http\Controllers\Concerns\AppliesTableQuery;

class HR3RecommendationController extends Controller
{
    use AppliesTableQuery;

    public function index(Request $request): JsonResponse
    {
        $base = Hr3Recommendation::query()
            ->with(['employee.department', 'suggestedPosition', 'suggestedSalaryGrade', 'evaluator']);

        if ($request->filled('q')) {
            $search = $request->string('q');
            $base->where(function ($q) use ($search) {
                $q->where('comments', 'like', "%{$search}%")
                    ->orWhereHas('employee', fn ($e) => $e
                        ->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('employee_code', 'like', "%{$search}%"));
            });
        }

        $this->applyFilters($request, $base, [
            'status' => 'status',
            'recommendation_type' => 'recommendation_type',
            'employee_id' => 'employee_id',
        ]);

        $this->applySort($request, $base, [
            'evaluation_score' => 'evaluation_score',
            'date_submitted' => 'date_submitted',
            'status' => 'status',
            'recommendation_type' => 'recommendation_type',
            'created_at' => 'created_at',
        ], ['date_submitted', 'desc']);

        $perPage = $request->integer('per_page', 0);
        $records = $perPage > 0 ? $base->paginate($perPage) : $base->get();
        $items = $records instanceof \Illuminate\Contracts\Pagination\LengthAwarePaginator ? $records->items() : $records;
        $recommendations = collect($items)
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

        if ($records instanceof \Illuminate\Contracts\Pagination\LengthAwarePaginator) {
            return response()->json([
                'data' => $recommendations->values(),
                'meta' => [
                    'current_page' => $records->currentPage(),
                    'last_page' => $records->lastPage(),
                    'per_page' => $records->perPage(),
                    'total' => $records->total(),
                ],
            ]);
        }

        return response()->json(['data' => $recommendations->values()]);
    }

    public function acknowledge(Hr3Recommendation $recommendation): JsonResponse
    {
        if ($recommendation->status !== 'Pending HR Action') {
            return response()->json(['message' => 'This recommendation has already been processed.'], 422);
        }

        $employee = $recommendation->employee;
        $name = $employee ? trim(($employee->first_name ?? '') . ' ' . ($employee->last_name ?? '')) : 'Unknown';

        ActivityObserver::withoutLogging(fn () => $recommendation->update(['status' => 'Acknowledged']));

        AuditLogger::log(
            'HR3 recommendation acknowledged',
            'Core HCM',
            'Info',
            'hr3_recommendation',
            (string) $recommendation->recommendation_id,
            'Acknowledged performance evaluation for ' . $name,
        );

        return response()->json(['message' => 'HR3 recommendation acknowledged.']);
    }
}