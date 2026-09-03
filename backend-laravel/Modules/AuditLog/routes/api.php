<?php

use Illuminate\Support\Facades\Route;
use Modules\AuditLog\Http\Controllers\AuditLogController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::get('audit-logs', [AuditLogController::class, 'index'])->name('auditlog.index');
    Route::get('audit-logs/stats', [AuditLogController::class, 'stats'])->middleware('permission:Audit Logs')->name('auditlog.stats');
    Route::get('audit-logs/{audit_log}', [AuditLogController::class, 'show'])->middleware('permission:Audit Logs')->name('auditlog.show');
});