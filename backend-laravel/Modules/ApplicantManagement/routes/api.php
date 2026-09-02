<?php

use Illuminate\Support\Facades\Route;
use Modules\ApplicantManagement\Http\Controllers\ApplicantManagementController;
use Modules\ApplicantManagement\Http\Controllers\ApplicantAssessmentController;
use Modules\ApplicantManagement\Http\Controllers\ScreeningEvaluationController;
use Modules\ApplicantManagement\Http\Controllers\ScreeningReferenceController;
use Modules\ApplicantManagement\Http\Controllers\InterviewController;

/*
 * Resume file preview (token auth, no auth:sanctum header required).
 *
 * The Applicant Management review dialog previews resumes inside a browser
 * <iframe>/<img>, which cannot send an Authorization header, so this route
 * authenticates directly from the ?token= query param (Bearer fallback)
 * instead of relying on the auth:sanctum middleware. Permission is checked
 * in the controller. Serving through /api (not the public /storage symlink)
 * keeps the preview same-origin so the browser renders PDFs/images inline
 * instead of a blank white box.
 */
Route::prefix('v1')->middleware('api')->group(function () {
     Route::get('applicants/{applicant}/resume-document', [ApplicantManagementController::class, 'resumeDocument'])
          ->name('applicants.resume-document');
});

Route::prefix('v1')
     ->middleware(['auth:sanctum', 'permission:Applicant Management'])
     ->group(function () {

           /* ------------------------------------------------------------------ */
           /* Applicants                                                           */
           /* ------------------------------------------------------------------ */
           Route::get('applicants/stats', [ApplicantManagementController::class, 'stats'])
                ->name('applicants.stats');

           // Preview screening for an uploaded resume (no applicant created yet)
           Route::post('applicants/screen-resume', [ApplicantManagementController::class, 'screenResume'])
                ->name('applicants.screen-resume');

           // Lightweight NLP extraction (profile only) - autofills wizard contact fields
           Route::post('applicants/extract-resume', [ApplicantManagementController::class, 'extractResume'])
                ->name('applicants.extract-resume');

           // Latest full spaCy screening detail for one applicant
           Route::get('applicants/{applicant}/screening', [ApplicantManagementController::class, 'screeningDetail'])
                ->name('applicants.screening');

          // Research evaluation (SOP 1/2/3/5)
          Route::post('applicants/{applicant}/ground-truth', [ScreeningEvaluationController::class, 'storeGroundTruth'])
               ->name('applicants.ground-truth');
          Route::get('applicants/screening-stats', [ScreeningEvaluationController::class, 'stats'])
               ->name('applicants.screening-stats');
          Route::get('evaluation/sop2-detection', [ScreeningEvaluationController::class, 'sop2'])
               ->name('evaluation.sop2');
          Route::get('evaluation/sop3-screening-metrics', [ScreeningEvaluationController::class, 'sop3'])
               ->name('evaluation.sop3');
          Route::get('evaluation/sop5-score-alignment', [ScreeningEvaluationController::class, 'sop5'])
               ->name('evaluation.sop5');

           // DB-managed screening reference data (skills/roles/certifications + aliases)
           Route::get('screening/reference-data', [ScreeningReferenceController::class, 'index'])
                ->name('screening.reference-data');
           Route::get('screening/reference-data/list', [ScreeningReferenceController::class, 'list'])
                ->name('screening.reference-data.list');

           // NLP service status + HR scoring configuration (Screening Setup dialog)
           Route::get('screening/status', [ScreeningReferenceController::class, 'status'])
                ->name('screening.status');
           Route::put('screening/configuration', [ScreeningReferenceController::class, 'saveConfiguration'])
                ->name('screening.configuration.save');

           Route::post('screening/reference-data', [ScreeningReferenceController::class, 'store'])
                ->name('screening.reference-data.store');
          Route::put('screening/reference-data/{id}', [ScreeningReferenceController::class, 'update'])
               ->name('screening.reference-data.update');
          Route::patch('screening/reference-data/{id}/toggle', [ScreeningReferenceController::class, 'toggle'])
               ->name('screening.reference-data.toggle');
          Route::delete('screening/reference-data/{id}', [ScreeningReferenceController::class, 'destroy'])
               ->name('screening.reference-data.destroy');

          Route::apiResource('applicants', ApplicantManagementController::class)
               ->parameters(['applicants' => 'applicant'])
               ->names('applicant');

          // Advance applicant to Offer / Hired stage
          Route::post('applicants/{applicant}/hire', [ApplicantManagementController::class, 'hire'])
               ->name('applicants.hire');

          // Send email (accept / reject / offer) to applicant
          Route::post('applicants/{applicant}/send-email', [ApplicantManagementController::class, 'sendEmail'])
               ->name('applicants.send-email');

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
          Route::get('assessments', [ApplicantAssessmentController::class, 'index'])
               ->name('assessments.index');

          Route::post('applicants/{applicant}/assessments', [ApplicantAssessmentController::class, 'store'])
               ->name('applicants.assessments.store');

          Route::put('assessments/{assessment}', [ApplicantAssessmentController::class, 'update'])
               ->name('assessments.update');
     });
