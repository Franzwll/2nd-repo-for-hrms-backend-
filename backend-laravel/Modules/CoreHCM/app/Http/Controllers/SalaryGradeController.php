<?php

namespace Modules\CoreHCM\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\SalaryGrade;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\CoreHCM\Http\Requests\StoreSalaryGradeRequest;
use Modules\CoreHCM\Http\Requests\UpdateSalaryGradeRequest;
use Modules\CoreHCM\Http\Resources\SalaryGradeResource;

class SalaryGradeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $grades = SalaryGrade::orderBy('code')->paginate($request->integer('per_page', 50));

        return response()->json([
            'data' => SalaryGradeResource::collection($grades),
            'meta' => [
                'current_page' => $grades->currentPage(),
                'last_page' => $grades->lastPage(),
                'per_page' => $grades->perPage(),
                'total' => $grades->total(),
            ],
        ]);
    }

    public function show(SalaryGrade $salary_grade): JsonResponse
    {
        return response()->json([
            'data' => new SalaryGradeResource($salary_grade),
        ]);
    }

    public function store(StoreSalaryGradeRequest $request): JsonResponse
    {
        $salary_grade = SalaryGrade::create($request->validated());

        return response()->json([
            'message' => 'Salary grade created successfully.',
            'data' => new SalaryGradeResource($salary_grade),
        ], 201);
    }

    public function update(UpdateSalaryGradeRequest $request, SalaryGrade $salary_grade): JsonResponse
    {
        $salary_grade->update($request->validated());

        return response()->json([
            'message' => 'Salary grade updated successfully.',
            'data' => new SalaryGradeResource($salary_grade),
        ]);
    }

    public function destroy(SalaryGrade $salary_grade): JsonResponse
    {
        if ($salary_grade->positions()->exists()) {
            return response()->json(['message' => 'Cannot delete a salary grade assigned to one or more positions.'], 422);
        }

        $code = $salary_grade->code;
        $salary_grade->delete();

        return response()->json(['message' => 'Salary grade deleted successfully.']);
    }
}