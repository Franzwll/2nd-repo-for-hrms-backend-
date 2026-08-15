<?php

use Illuminate\Support\Facades\Route;
use Modules\ApplicantManagement\Http\Controllers\ApplicantManagementController;
use Modules\ApplicantManagement\Http\Controllers\ApplicantAssessmentController;
use Modules\ApplicantManagement\Http\Controllers\InterviewController;

Route::prefix('v1')->group(function () {

    /* ------------------------------------------------------------------ */
    /* Applicants                                                           */
    /* ------------------------------------------------------------------ */
    Route::get('applicants/stats', [ApplicantManagementController::class, 'stats'])
         ->name('applicants.stats');

    Route::apiResource('applicants', ApplicantManagementController::class)
         ->parameters(['applicants' => 'applicant'])
         ->names('applicant');

    // Advance applicant to Offer / Hired stage
    Route::post('applicants/{applicant}/hire', [ApplicantManagementController::class, 'hire'])
         ->name('applicants.hire');

    /* ------------------------------------------------------------------ */
    /* Interviews                                                           */
    /* ------------------------------------------------------------------ */
    Route::apiResource('interviews', InterviewController::class)
         ->parameters(['interviews' => 'interview'])
         ->except(['create', 'edit'])
         ->names('interview');

    /* ------------------------------------------------------------------ */
    /* Assessments                                                          */
    /* ------------------------------------------------------------------ */
    Route::post('applicants/{applicant}/assessments', [ApplicantAssessmentController::class, 'store'])
         ->name('applicants.assessments.store');

    Route::put('assessments/{assessment}', [ApplicantAssessmentController::class, 'update'])
         ->name('assessments.update');
});
