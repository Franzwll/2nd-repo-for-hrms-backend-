<?php

use Illuminate\Support\Facades\Route;
use Modules\RecruitmentManagement\Http\Controllers\RecruitmentManagementController;
use Modules\RecruitmentManagement\Http\Controllers\RequisitionController;

Route::prefix('v1')->middleware('auth:sanctum')->group(function () {

    /* ------------------------------------------------------------------ */
    /* Read-only endpoints (permission:Recruitment Management)             */
    /* ------------------------------------------------------------------ */

    Route::middleware('permission:Recruitment Management')->group(function () {
        Route::get('job-posts/stats', [RecruitmentManagementController::class, 'stats'])
             ->name('job-posts.stats');

        Route::get('job-posts', [RecruitmentManagementController::class, 'index'])
             ->name('job-post.index');

        Route::get('job-posts/{job_post}', [RecruitmentManagementController::class, 'show'])
             ->name('job-post.show');

        Route::get('requisitions', [RequisitionController::class, 'index'])
             ->name('requisition.index');

        Route::get('requisitions/{requisition}', [RequisitionController::class, 'show'])
             ->name('requisition.show');
    });

    /* ------------------------------------------------------------------ */
    /* Mutating endpoints (permission:Recruitment Management:Edit)         */
    /* ------------------------------------------------------------------ */

    Route::middleware('permission:Recruitment Management:Edit')->group(function () {
        Route::post('job-posts', [RecruitmentManagementController::class, 'store'])
             ->name('job-post.store');

        Route::put('job-posts/{job_post}', [RecruitmentManagementController::class, 'update'])
             ->name('job-post.update');

        Route::delete('job-posts/{job_post}', [RecruitmentManagementController::class, 'destroy'])
             ->name('job-post.destroy');

        Route::patch('job-posts/{job_post}/toggle', [RecruitmentManagementController::class, 'toggleActive'])
             ->name('job-posts.toggle');

        Route::post('job-posts/{job_post}/publish', [RecruitmentManagementController::class, 'publish'])
             ->name('job-posts.publish');

        Route::post('requisitions', [RequisitionController::class, 'store'])
             ->name('requisition.store');

        Route::put('requisitions/{requisition}', [RequisitionController::class, 'update'])
             ->name('requisition.update');

        Route::post('requisitions/{requisition}/convert', [RequisitionController::class, 'convert'])
             ->name('requisitions.convert');
    });
});