<?php

use Illuminate\Support\Facades\Route;
use Modules\AuditLog\Http\Controllers\AuditLogController;

Route::middleware(['auth:sanctum', 'permission:Audit Logs'])->prefix('v1')->group(function () {
    Route::get('audit-logs', [AuditLogController::class, 'index'])->name('auditlog.index');
    Route::get('audit-logs/stats', [AuditLogController::class, 'stats'])->name('auditlog.stats');
    Route::get('audit-logs/{audit_log}', [AuditLogController::class, 'show'])->name('auditlog.show');
});