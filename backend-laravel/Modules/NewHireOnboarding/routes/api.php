<?php

use Illuminate\Support\Facades\Route;
use Modules\NewHireOnboarding\Http\Controllers\ChecklistRequestController;
use Modules\NewHireOnboarding\Http\Controllers\ChecklistTemplateController;
use Modules\NewHireOnboarding\Http\Controllers\EmployeeOnboardingItemController;
use Modules\NewHireOnboarding\Http\Controllers\NewHireController;

Route::prefix('v1')->middleware('auth:sanctum')->group(function () {

     /* ------------------------------------------------------------------ */
     /* Read-only endpoints (permission:New Hire Onboarding)                */
     /* ------------------------------------------------------------------ */

     Route::middleware('permission:New Hire Onboarding')->group(function () {
          Route::get('new-hires/stats', [NewHireController::class, 'stats'])
               ->name('new-hires.stats');

          Route::get('new-hires', [NewHireController::class, 'index'])
               ->name('new-hire.index');

          Route::get('new-hires/{new_hire}', [NewHireController::class, 'show'])
               ->name('new-hire.show');

          Route::get('new-hires/{new_hire}/onboarding-items', [EmployeeOnboardingItemController::class, 'index'])
               ->name('new-hires.onboarding-items.index');

          Route::get('checklist-templates', [ChecklistTemplateController::class, 'index'])
               ->name('checklist-template.index');

          Route::get('checklist-templates/{template}', [ChecklistTemplateController::class, 'show'])
               ->name('checklist-template.show');

          Route::get('checklist-requests', [ChecklistRequestController::class, 'index'])
               ->name('checklist-request.index');

          Route::get('checklist-requests/{checklistRequest}', [ChecklistRequestController::class, 'show'])
               ->name('checklist-request.show');

           /* ------------------------------------------------------------------ */
           /* Employee self-service submission endpoints                        */
           /* Employees (read-level "New Hire Onboarding" permission) must be   */
           /* able to materialize, upload and view their OWN onboarding         */
           /* documents — verification (toggle) stays Edit-only.               */
           /* ------------------------------------------------------------------ */

           Route::post('new-hires/{new_hire}/onboarding-items', [EmployeeOnboardingItemController::class, 'materialize'])
                ->name('new-hires.onboarding-items.materialize');

           Route::post('onboarding-items/{item}/upload', [EmployeeOnboardingItemController::class, 'upload'])
                ->name('onboarding-items.upload');

       });

      /* ------------------------------------------------------------------ */
      /* Document preview (token auth, no auth:sanctum header required)       */
      /* Employees preview files inside a browser <iframe>/<img> which cannot */
      /* send an Authorization header, so this route authenticates directly  */
      /* from the ?token= query param (Bearer fallback) instead of relying   */
      /* on the auth:sanctum middleware. Permission is checked in the        */
      /* controller.                                                        */
      /* ------------------------------------------------------------------ */

      Route::get('onboarding-items/{item}/document', [EmployeeOnboardingItemController::class, 'document'])
           ->name('onboarding-items.document')
           ->withoutMiddleware('auth:sanctum');

      /* ------------------------------------------------------------------ */
      /* Mutating endpoints (permission:New Hire Onboarding:Edit)            */
     /* ------------------------------------------------------------------ */

     Route::middleware('permission:New Hire Onboarding:Edit')->group(function () {
          Route::post('new-hires', [NewHireController::class, 'store'])
               ->name('new-hire.store');

          Route::put('new-hires/{new_hire}', [NewHireController::class, 'update'])
               ->name('new-hire.update');

          Route::delete('new-hires/{new_hire}', [NewHireController::class, 'destroy'])
               ->name('new-hire.destroy');

          // Advance: Pre-onboarding → Probationary → Regular
          Route::post('new-hires/{new_hire}/promote-stage', [NewHireController::class, 'promoteStage'])
               ->name('new-hire.promote-stage');

           /* ------------------------------------------------------------------ */
           /* Checklist Templates                                                  */
           /* ------------------------------------------------------------------ */
           Route::apiResource('checklist-templates', ChecklistTemplateController::class)
                ->parameters(['checklist-templates' => 'template'])
                ->names('checklist-template');

           Route::post('new-hires/{new_hire}/onboarding-items/bulk', [EmployeeOnboardingItemController::class, 'bulkCreate'])
                ->name('new-hires.onboarding-items.bulk');

           Route::patch('onboarding-items/{item}/toggle', [EmployeeOnboardingItemController::class, 'toggle'])
               ->name('onboarding-items.toggle');

          Route::post('checklist-templates', [ChecklistTemplateController::class, 'store'])
               ->name('checklist-template.store');

          Route::put('checklist-templates/{template}', [ChecklistTemplateController::class, 'update'])
               ->name('checklist-template.update');

          Route::delete('checklist-templates/{template}', [ChecklistTemplateController::class, 'destroy'])
               ->name('checklist-template.destroy');

          Route::post('checklist-templates/{template}/items', [ChecklistTemplateController::class, 'addItem'])
               ->name('checklist-templates.items.store');

          Route::put('checklist-items/{item}', [ChecklistTemplateController::class, 'updateItem'])
               ->name('checklist-items.update');

          Route::delete('checklist-items/{item}', [ChecklistTemplateController::class, 'destroyItem'])
               ->name('checklist-items.destroy');

          Route::post('checklist-requests', [ChecklistRequestController::class, 'store'])
               ->name('checklist-request.store');

          Route::put('checklist-requests/{checklistRequest}', [ChecklistRequestController::class, 'update'])
               ->name('checklist-request.update');

          Route::post('checklist-requests/{checklistRequest}/approve', [ChecklistRequestController::class, 'approve'])
               ->name('checklist-requests.approve');

          Route::post('checklist-requests/{checklistRequest}/reject', [ChecklistRequestController::class, 'reject'])
               ->name('checklist-requests.reject');
     });
});