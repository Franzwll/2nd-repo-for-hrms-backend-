<?php

use Illuminate\Support\Facades\Route;
use Modules\RecruitmentManagement\Http\Controllers\RecruitmentManagementController;
use Modules\RecruitmentManagement\Http\Controllers\RequisitionController;

Route::prefix('v1')->group(function () {

    /* ------------------------------------------------------------------ */
    /* Job Posts                                                            */
    /* ------------------------------------------------------------------ */
    Route::get('job-posts/stats', [RecruitmentManagementController::class, 'stats'])
         ->name('job-posts.stats');

    Route::apiResource('job-posts', RecruitmentManagementController::class)
         ->parameters(['job-posts' => 'job_post'])
         ->names('job-post');

    Route::patch('job-posts/{job_post}/toggle', [RecruitmentManagementController::class, 'toggleActive'])
         ->name('job-posts.toggle');

    Route::post('job-posts/{job_post}/publish', [RecruitmentManagementController::class, 'publish'])
         ->name('job-posts.publish');

    /* ------------------------------------------------------------------ */
    /* Requisitions                                                         */
    /* ------------------------------------------------------------------ */
    Route::apiResource('requisitions', RequisitionController::class)
         ->parameters(['requisitions' => 'requisition'])
         ->except(['destroy'])
         ->names('requisition');

    Route::post('requisitions/{requisition}/convert', [RequisitionController::class, 'convert'])
         ->name('requisitions.convert');
});
