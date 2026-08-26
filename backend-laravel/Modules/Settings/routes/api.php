<?php

use Illuminate\Support\Facades\Route;
use Modules\Settings\Http\Controllers\BackupController;
use Modules\Settings\Http\Controllers\MySettingsController;
use Modules\Settings\Http\Controllers\SettingsController;

Route::prefix('v1')->group(function () {

    /* ------------------------------------------------------------------ */
    /* System Settings                                                      */
    /* ------------------------------------------------------------------ */

    // List all settings + flat map
    Route::get('settings', [SettingsController::class, 'index'])
         ->name('settings.index');

    /* ------------------------------------------------------------------ */
    /* Database backups (declared before the {key} wildcard)               */
    /* ------------------------------------------------------------------ */

    Route::prefix('settings/backups')->name('settings.backups.')->group(function () {
        Route::get('/', [BackupController::class, 'index'])->name('index');
        Route::post('/', [BackupController::class, 'store'])->name('store');
        Route::get('/{id}/download', [BackupController::class, 'download'])->name('download');
        Route::post('/{id}/restore', [BackupController::class, 'restore'])->name('restore');
    });

    // Bulk upsert — must be declared BEFORE the {key} wildcard
    Route::patch('settings/bulk', [SettingsController::class, 'bulkUpsert'])
         ->name('settings.bulk');

    // Show single setting by key
    Route::get('settings/{key}', [SettingsController::class, 'show'])
         ->name('settings.show');

    // Upsert (create or update) a single setting
    Route::put('settings/{key}', [SettingsController::class, 'upsert'])
         ->name('settings.upsert');

    // Delete a setting
    Route::delete('settings/{key}', [SettingsController::class, 'destroy'])
         ->name('settings.destroy');

    // List system users (e.g. for the assessment assessor selector)
    Route::get('system-users', [SettingsController::class, 'listSystemUsers'])
         ->name('settings.system-users');

    // Reset the password of every system user to the given default
    Route::post('reset-default-password', [SettingsController::class, 'resetDefaultPassword'])
         ->name('settings.reset-default-password');

    /* ------------------------------------------------------------------ */
    /* Per-user portal settings                                            */
    /* ------------------------------------------------------------------ */

    // Current user's notifications + preferences (merged over system defaults)
    Route::get('my/settings', [MySettingsController::class, 'show'])
         ->name('my-settings.show');

    // Save the current user's notifications or preferences
    Route::put('my/settings/{scope}', [MySettingsController::class, 'save'])
         ->name('my-settings.save');

    // Toggle the current user's own OTP-at-login requirement
    Route::put('my/otp', [MySettingsController::class, 'toggleOtp'])
         ->name('my.toggle-otp');

    // Change the current user's password (verified against system_users)
    Route::post('my/change-password', [MySettingsController::class, 'changePassword'])
         ->name('my.change-password');

    /* ------------------------------------------------------------------ */
    /* Notifications                                                      */
    /* ------------------------------------------------------------------ */
    Route::get('notifications', [\Modules\Settings\Http\Controllers\NotificationController::class, 'index'])
         ->name('notifications.index');
    Route::patch('notifications/{id}/read', [\Modules\Settings\Http\Controllers\NotificationController::class, 'markRead'])
         ->name('notifications.read');
    Route::post('notifications/mark-all-read', [\Modules\Settings\Http\Controllers\NotificationController::class, 'markAllRead'])
         ->name('notifications.mark-all-read');
});
