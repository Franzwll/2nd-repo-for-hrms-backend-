<?php

use Illuminate\Support\Facades\Route;
use Modules\CoreHCM\Http\Controllers\DashboardController;
use Modules\CoreHCM\Http\Controllers\DepartmentController;
use Modules\CoreHCM\Http\Controllers\EmployeeController;
use Modules\CoreHCM\Http\Controllers\HR3RecommendationController;
use Modules\CoreHCM\Http\Controllers\OrgChartController;
use Modules\CoreHCM\Http\Controllers\PositionController;
use Modules\CoreHCM\Http\Controllers\SalaryGradeController;

Route::middleware('auth:sanctum')->prefix('v1')->group(function () {
    Route::get('dashboard/stats', [DashboardController::class, 'stats']);
});

Route::middleware(['auth:sanctum', 'permission:Core HCM'])->prefix('v1')->group(function () {
    Route::apiResource('departments', DepartmentController::class);
    Route::apiResource('positions', PositionController::class)->except(['show']);
    Route::get('salary-grades', [SalaryGradeController::class, 'index']);
    Route::get('salary-grades/{salary_grade}', [SalaryGradeController::class, 'show']);
    Route::post('salary-grades', [SalaryGradeController::class, 'store']);
    Route::put('salary-grades/{salary_grade}', [SalaryGradeController::class, 'update']);
    Route::delete('salary-grades/{salary_grade}', [SalaryGradeController::class, 'destroy']);
    Route::get('org-chart', [OrgChartController::class, 'index']);

    Route::get('hr3-recommendations', [HR3RecommendationController::class, 'index']);
    Route::post('hr3-recommendations/{recommendation}/acknowledge', [HR3RecommendationController::class, 'acknowledge']);

    Route::get('employees', [EmployeeController::class, 'index']);
    Route::post('employees', [EmployeeController::class, 'store']);
    Route::get('employees/{employee}', [EmployeeController::class, 'show']);
    Route::put('employees/{employee}', [EmployeeController::class, 'update']);
    Route::delete('employees/{employee}', [EmployeeController::class, 'destroy']);

    Route::post('employees/{employee}/regularize', [EmployeeController::class, 'regularize']);
    Route::post('employees/{employee}/promote', [EmployeeController::class, 'promote']);
    Route::post('employees/{employee}/exit', [EmployeeController::class, 'exit']);
});