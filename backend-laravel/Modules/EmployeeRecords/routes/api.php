<?php

use Illuminate\Support\Facades\Route;
use Modules\EmployeeRecords\Http\Controllers\DocumentRequestController;
use Modules\EmployeeRecords\Http\Controllers\EmployeeDocumentController;
use Modules\EmployeeRecords\Http\Controllers\EmployeeDossierController;

/*
 * Attachment / document file previews use token auth (?token=) because browser
 * <iframe>/<a> opens cannot send an Authorization header. Permission is
 * enforced inside the controller.
 */
Route::prefix('v1')->middleware('api')->group(function () {
    Route::get('erm/document-requests/{id}/attachments/{attachmentId}/file', [DocumentRequestController::class, 'file'])
        ->name('erm.document-requests.attachment-file');
    Route::get('erm/employees/{employee}/documents/{document}/file', [EmployeeDocumentController::class, 'file'])
        ->name('erm.employees.documents.file');
});

/* ------------------------------------------------------------------ */
/* Read — Employee Records: View                                        */
/* ------------------------------------------------------------------ */
Route::middleware(['auth:sanctum', 'permission:Employee Records'])->prefix('v1/erm')->group(function () {
    // Document-request fulfilment inbox (ESS <-> ERM loop).
    Route::get('document-requests', [DocumentRequestController::class, 'index']);
    Route::get('document-requests/{id}', [DocumentRequestController::class, 'show']);

    // 201 dossier (composes the Core HCM master + ERM fields).
    Route::get('employees/archived', [EmployeeDossierController::class, 'archived']);
    Route::get('employees/{employee}', [EmployeeDossierController::class, 'show']);
    Route::get('employees/{employee}/emergency-contacts', [EmployeeDossierController::class, 'contacts']);
    Route::get('employees/{employee}/documents', [EmployeeDocumentController::class, 'index']);
    Route::get('employees/{employee}/exit-record', [EmployeeDossierController::class, 'showExitRecord']);
});

/* ------------------------------------------------------------------ */
/* Write — Employee Records: Edit                                       */
/* ------------------------------------------------------------------ */
Route::middleware(['auth:sanctum', 'permission:Employee Records:Edit'])->prefix('v1/erm')->group(function () {
    Route::post('document-requests/{id}/fulfill', [DocumentRequestController::class, 'fulfill']);

    Route::put('employees/{employee}/dossier', [EmployeeDossierController::class, 'updateDossier']);

    Route::post('employees/{employee}/emergency-contacts', [EmployeeDossierController::class, 'storeContact']);
    Route::put('employees/{employee}/emergency-contacts/{contact}', [EmployeeDossierController::class, 'updateContact']);
    Route::delete('employees/{employee}/emergency-contacts/{contact}', [EmployeeDossierController::class, 'destroyContact']);

    Route::post('employees/{employee}/documents', [EmployeeDocumentController::class, 'store']);
    Route::put('employees/{employee}/documents/{document}', [EmployeeDocumentController::class, 'update']);
    Route::post('employees/{employee}/documents/{document}/verify', [EmployeeDocumentController::class, 'verify']);
    Route::delete('employees/{employee}/documents/{document}', [EmployeeDocumentController::class, 'destroy']);

    Route::put('employees/{employee}/exit-record', [EmployeeDossierController::class, 'updateExitRecord']);

    Route::post('employees/{employee}/archive', [EmployeeDossierController::class, 'archive']);
    Route::post('employees/{id}/restore', [EmployeeDossierController::class, 'restore']);
});
