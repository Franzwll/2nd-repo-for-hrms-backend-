<?php

use Illuminate\Support\Facades\Route;
use Modules\Settings\Http\Controllers\SettingsController;

Route::prefix('v1')->group(function () {

    /* ------------------------------------------------------------------ */
    /* System Settings                                                      */
    /* ------------------------------------------------------------------ */

    // List all settings + flat map
    Route::get('settings', [SettingsController::class, 'index'])
         ->name('settings.index');

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
});
