<?php

use Illuminate\Support\Facades\Route;
use Modules\AuditLog\Http\Controllers\AuditLogController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('auditlogs', AuditLogController::class)->names('auditlog');
});
