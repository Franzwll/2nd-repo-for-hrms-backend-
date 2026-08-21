<?php

use Illuminate\Support\Facades\Route;
use Modules\ApplicantManagement\Http\Controllers\ApplicantManagementController;
use Modules\ApplicantManagement\Http\Controllers\ApplicantAssessmentController;
use Modules\ApplicantManagement\Http\Controllers\InterviewController;

Route::prefix('v1')->middleware('auth:sanctum')->group(function () {

    /* ------------------------------------------------------------------ */
    /* Read-only endpoints (permission:Applicant Management)               */
    /* ------------------------------------------------------------------ */

    Route::middleware('permission:Applicant Management')->group(function () {
        Route::get('applicants/stats', [ApplicantManagementController::class, 'stats'])
             ->name('applicants.stats');

        Route::get('applicants', [ApplicantManagementController::class, 'index'])
             ->name('applicant.index');

        Route::get('applicants/{applicant}', [ApplicantManagementController::class, 'show'])
             ->name('applicant.show');

        Route::get('interviews', [InterviewController::class, 'index'])
             ->name('interview.index');

        Route::get('interviews/{interview}', [InterviewController::class, 'show'])
             ->name('interview.show');

        Route::get('assessments', [ApplicantAssessmentController::class, 'index'])
             ->name('assessments.index');
    });

    /* ------------------------------------------------------------------ */
    /* Mutating endpoints (permission:Applicant Management:Edit)           */
    /* ------------------------------------------------------------------ */

    Route::middleware('permission:Applicant Management:Edit')->group(function () {
        Route::post('applicants', [ApplicantManagementController::class, 'store'])
             ->name('applicant.store');

        Route::put('applicants/{applicant}', [ApplicantManagementController::class, 'update'])
             ->name('applicant.update');

        Route::delete('applicants/{applicant}', [ApplicantManagementController::class, 'destroy'])
             ->name('applicant.destroy');

        // Advance applicant to Offer / Hired stage
        Route::post('applicants/{applicant}/hire', [ApplicantManagementController::class, 'hire'])
             ->name('applicants.hire');

        Route::post('interviews', [InterviewController::class, 'store'])
             ->name('interview.store');

        Route::put('interviews/{interview}', [InterviewController::class, 'update'])
             ->name('interview.update');

        Route::delete('interviews/{interview}', [InterviewController::class, 'destroy'])
             ->name('interview.destroy');

        Route::post('applicants/{applicant}/assessments', [ApplicantAssessmentController::class, 'store'])
             ->name('applicants.assessments.store');

        Route::put('assessments/{assessment}', [ApplicantAssessmentController::class, 'update'])
             ->name('assessments.update');
    });
});