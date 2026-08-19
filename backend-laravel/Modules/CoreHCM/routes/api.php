<?php

use Illuminate\Support\Facades\Route;
use Modules\CoreHCM\Http\Controllers\CoreHCMController;

Route::prefix('v1')->group(function () {
    Route::apiResource('corehcms', CoreHCMController::class)->names('corehcm');

    Route::get('departments', [CoreHCMController::class, 'departments'])
         ->name('corehcm.departments');
    Route::post('departments', [CoreHCMController::class, 'storeDepartment'])
         ->name('corehcm.departments.store');
    Route::get('positions', [CoreHCMController::class, 'positions'])
         ->name('corehcm.positions');
    Route::post('positions', [CoreHCMController::class, 'storePosition'])
         ->name('corehcm.positions.store');
});