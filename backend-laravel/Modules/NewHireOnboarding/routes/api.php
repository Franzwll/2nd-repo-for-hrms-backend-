<?php

use Illuminate\Support\Facades\Route;
use Modules\NewHireOnboarding\Http\Controllers\ChecklistRequestController;
use Modules\NewHireOnboarding\Http\Controllers\ChecklistTemplateController;
use Modules\NewHireOnboarding\Http\Controllers\EmployeeOnboardingItemController;
use Modules\NewHireOnboarding\Http\Controllers\NewHireController;

Route::prefix('v1')->group(function () {

    /* ------------------------------------------------------------------ */
    /* New Hires                                                            */
    /* ------------------------------------------------------------------ */
    Route::get('new-hires/stats', [NewHireController::class, 'stats'])
         ->name('new-hires.stats');

    Route::apiResource('new-hires', NewHireController::class)
         ->parameters(['new-hires' => 'new_hire'])
         ->names('new-hire');

    Route::post('new-hires/{new_hire}/promote-stage', [NewHireController::class, 'promoteStage'])
         ->name('new-hires.promote-stage');

    /* ------------------------------------------------------------------ */
    /* Onboarding Items (per new hire)                                      */
    /* ------------------------------------------------------------------ */
    Route::get('new-hires/{new_hire}/onboarding-items', [EmployeeOnboardingItemController::class, 'index'])
         ->name('new-hires.onboarding-items.index');

    Route::post('new-hires/{new_hire}/onboarding-items/bulk', [EmployeeOnboardingItemController::class, 'bulkCreate'])
         ->name('new-hires.onboarding-items.bulk');

    Route::patch('onboarding-items/{item}/toggle', [EmployeeOnboardingItemController::class, 'toggle'])
         ->name('onboarding-items.toggle');

    /* ------------------------------------------------------------------ */
    /* Checklist Templates                                                  */
    /* ------------------------------------------------------------------ */
    Route::apiResource('checklist-templates', ChecklistTemplateController::class)
         ->parameters(['checklist-templates' => 'template'])
         ->names('checklist-template');

    Route::post('checklist-templates/{template}/items', [ChecklistTemplateController::class, 'addItem'])
         ->name('checklist-templates.items.store');

    Route::put('checklist-items/{item}', [ChecklistTemplateController::class, 'updateItem'])
         ->name('checklist-items.update');

    Route::delete('checklist-items/{item}', [ChecklistTemplateController::class, 'destroyItem'])
         ->name('checklist-items.destroy');

    /* ------------------------------------------------------------------ */
    /* Checklist Requests                                                   */
    /* ------------------------------------------------------------------ */
    Route::apiResource('checklist-requests', ChecklistRequestController::class)
         ->parameters(['checklist-requests' => 'checklistRequest'])
         ->except(['destroy'])
         ->names('checklist-request');

    Route::post('checklist-requests/{checklistRequest}/approve', [ChecklistRequestController::class, 'approve'])
         ->name('checklist-requests.approve');

    Route::post('checklist-requests/{checklistRequest}/reject', [ChecklistRequestController::class, 'reject'])
         ->name('checklist-requests.reject');
});
