<?php

use Illuminate\Support\Facades\Route;
use Modules\EmployeeRecords\Http\Controllers\DocumentRequestController;

/*
 * Attachment file preview uses token auth (?token=) because browser
 * <iframe>/<a> opens cannot send an Authorization header. Permission is
 * enforced inside the controller.
 */
Route::prefix('v1')->middleware('api')->group(function () {
    Route::get('erm/document-requests/{id}/attachments/{attachmentId}/file', [DocumentRequestController::class, 'file'])
        ->name('erm.document-requests.attachment-file');
});

Route::middleware(['auth:sanctum', 'permission:Employee Records'])->prefix('v1/erm')->group(function () {
    Route::get('document-requests', [DocumentRequestController::class, 'index']);
    Route::get('document-requests/{id}', [DocumentRequestController::class, 'show']);
});

Route::middleware(['auth:sanctum', 'permission:Employee Records:Edit'])->prefix('v1/erm')->group(function () {
    Route::post('document-requests/{id}/fulfill', [DocumentRequestController::class, 'fulfill']);
});
