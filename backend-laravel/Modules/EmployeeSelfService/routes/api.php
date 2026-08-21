<?php

use Illuminate\Support\Facades\Route;
use Modules\EmployeeSelfService\Http\Controllers\EssAdminController;
use Modules\EmployeeSelfService\Http\Controllers\EssPortalController;

Route::middleware(['auth:sanctum'])->prefix('v1/ess')->group(function () {
    // Employee Self-Service (Portal) Endpoints
    Route::get('my-overview', [EssPortalController::class, 'getOverview']);
    Route::get('my-schedule', [EssPortalController::class, 'getSchedule']);
    Route::get('my-leaves', [EssPortalController::class, 'getLeaves']);
    Route::get('my-benefits', [EssPortalController::class, 'getBenefits']);
    Route::get('my-payroll', [EssPortalController::class, 'getPayroll']);
    Route::get('my-requests', [EssPortalController::class, 'getMyRequests']);
    Route::get('recognitions', [EssPortalController::class, 'getRecognitions']);
    Route::post('recognitions', [EssPortalController::class, 'postKudos']);
    Route::post('recognitions/{id}/react', [EssPortalController::class, 'reactKudos']);
    Route::post('requests', [EssPortalController::class, 'createRequest']);
    Route::post('clock', [EssPortalController::class, 'clock']);

    // Admin & Super Admin Management Endpoints
    Route::get('admin/requests', [EssAdminController::class, 'getRequests']);
    Route::patch('admin/requests/{id}/status', [EssAdminController::class, 'updateStatus']);
    Route::post('admin/requests/behalf', [EssAdminController::class, 'fileOnBehalf']);
    Route::get('admin/categories', [EssAdminController::class, 'getCategories']);
    Route::put('admin/categories/{id}/toggle', [EssAdminController::class, 'toggleCategory']);
    Route::get('admin/audit-logs', [EssAdminController::class, 'getAuditLogs']);
});
