<?php

use Illuminate\Support\Facades\Route;
use Modules\EmployeeSelfService\Http\Controllers\EssAdminController;
use Modules\EmployeeSelfService\Http\Controllers\EssModuleInboxController;
use Modules\EmployeeSelfService\Http\Controllers\EssPortalController;

/*
 * File streaming uses token auth (?token=) because browser <iframe>/<a> opens
 * cannot send an Authorization header. Ownership/permission is enforced inside
 * the controller for each file.
 */
Route::prefix('v1/ess')->middleware('api')->group(function () {
    Route::get('my-documents/{id}/file', [EssPortalController::class, 'documentFile']);
    Route::get('requests/{id}/attachments/{attachmentId}/file', [EssPortalController::class, 'requestAttachmentFile']);
    // HR review/preview of the same attachments (ESS Management permission
    // is enforced inside the controller).
    Route::get('admin/requests/{id}/attachments/{attachmentId}/file', [EssPortalController::class, 'adminRequestAttachmentFile']);
    // File-based handbooks are streamed inline into the player's reading stage.
    if (config('services.ess_lms.enabled')) {
        Route::get('my-learning/{courseCode}/file', [EssPortalController::class, 'learningMaterialFile']);
    }
});

Route::middleware(['auth:sanctum', 'permission:ESS Management'])->prefix('v1/ess')->group(function () {
    // Employee Self-Service (Portal) Endpoints
    Route::get('my-context', [EssPortalController::class, 'getMyContext']);
    Route::get('my-overview', [EssPortalController::class, 'getOverview']);
    Route::get('my-schedule', [EssPortalController::class, 'getSchedule']);
    Route::get('colleagues', [EssPortalController::class, 'getColleagues']);
    Route::get('my-attendance', [EssPortalController::class, 'getMyAttendance']);
    Route::get('my-leaves', [EssPortalController::class, 'getLeaves']);
    Route::get('my-benefits', [EssPortalController::class, 'getBenefits']);
    Route::get('my-payroll', [EssPortalController::class, 'getPayroll']);
    Route::get('my-documents', [EssPortalController::class, 'getMyDocuments']);
    Route::post('my-documents/upload', [EssPortalController::class, 'uploadDocument']);
    Route::get('my-performance', [EssPortalController::class, 'getMyPerformance']);
    Route::get('categories', [EssPortalController::class, 'getCategories']);
    Route::get('my-requests', [EssPortalController::class, 'getMyRequests']);
    Route::get('recognitions', [EssPortalController::class, 'getRecognitions']);
    Route::post('recognitions', [EssPortalController::class, 'postKudos']);
    Route::post('recognitions/{id}/react', [EssPortalController::class, 'reactKudos']);
    Route::post('recognitions/{id}/share', [EssPortalController::class, 'shareKudos']);
    Route::post('my-learning/progress', [EssPortalController::class, 'updateLearningProgress']);
    Route::get('my-learning/certificate/{courseCode}', [EssPortalController::class, 'learningCertificate']);

    // Tier-1 thin LMS: read handbook -> AI quiz -> auto-score. Kill switch:
    // ESS_LMS_QUIZ_ENABLED=false unregisters these, so the cards fall back to
    // updateLearningProgress + HR verification (verifyLearning).
    if (config('services.ess_lms.enabled')) {
        Route::get('my-learning/{courseCode}/material', [EssPortalController::class, 'learningMaterial']);
        Route::get('my-learning/{courseCode}/quiz', [EssPortalController::class, 'learningQuiz']);
        Route::post('my-learning/{courseCode}/quiz', [EssPortalController::class, 'submitLearningQuiz']);
        Route::post('my-learning/{courseCode}/reading-complete', [EssPortalController::class, 'completeLearningReading']);
    }
    Route::post('requests', [EssPortalController::class, 'createRequest']);
    Route::post('requests/{id}/respond', [EssPortalController::class, 'respondToRequest']);
    Route::post('requests/{id}/cancel', [EssPortalController::class, 'cancelRequest']);
    Route::post('clock', [EssPortalController::class, 'clock']);
    Route::get('my-promotion-requests', [EssPortalController::class, 'myPromotionRequests']);
    Route::post('my-promotion-requests', [EssPortalController::class, 'createPromotionRequest']);
    // ESS-safe promotion position options (id/title/department only — no HCM permission needed).
    Route::get('promotion-positions', [EssPortalController::class, 'promotionPositions']);
    // ESS-safe view of the employee's OWN onboarding checklist.
    Route::get('my-checklist', [EssPortalController::class, 'myChecklist']);

    // Admin & Super Admin endpoints require edit-grade access. The Employee
    // role has View on ESS Management so it can reach the portal, but it must
    // not read the company-wide request queue.
    Route::middleware('permission:ESS Management:Edit')->group(function () {
        Route::get('admin/requests', [EssAdminController::class, 'getRequests']);
        Route::get('admin/categories', [EssAdminController::class, 'getCategories']);
        Route::get('admin/audit-logs', [EssAdminController::class, 'getAuditLogs']);
        Route::get('admin/learning', [EssAdminController::class, 'getLearning']);

        Route::patch('admin/requests/{id}/status', [EssAdminController::class, 'updateStatus']);
        Route::post('admin/requests/{id}/review', [EssAdminController::class, 'review']);
        Route::post('admin/requests/{id}/fulfill', [EssAdminController::class, 'fulfill']);
        Route::post('admin/requests/{id}/dispatch', [EssAdminController::class, 'dispatch']);
        Route::post('admin/requests/{id}/release', [EssAdminController::class, 'release']);
        Route::post('admin/requests/{id}/reroute', [EssAdminController::class, 'reroute']);
        Route::get('admin/requests/{id}/routings', [EssAdminController::class, 'routings']);
        Route::post('admin/requests/behalf', [EssAdminController::class, 'fileOnBehalf']);
        Route::put('admin/categories/{id}/toggle', [EssAdminController::class, 'toggleCategory']);
        Route::patch('admin/learning/{id}/status', [EssAdminController::class, 'verifyLearning']);
    });
});

/*
 * Generic module inbox. Permission is enforced per module inside the
 * controller because each module uses its own permission (Employee Records for
 * ERM; ESS Management as the interim owner for the not-yet-built modules).
 */
Route::middleware(['auth:sanctum'])->prefix('v1/ess/modules/{module}')->group(function () {
    Route::get('requests', [EssModuleInboxController::class, 'index']);
    Route::get('requests/{id}', [EssModuleInboxController::class, 'show']);
    Route::post('requests/{id}/accept', [EssModuleInboxController::class, 'accept']);
    Route::post('requests/{id}/decline', [EssModuleInboxController::class, 'decline']);
    Route::post('requests/{id}/complete', [EssModuleInboxController::class, 'complete']);
});