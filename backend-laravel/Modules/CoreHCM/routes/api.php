<?php

use Illuminate\Support\Facades\Route;
use Modules\CoreHCM\Http\Controllers\CoreHCMController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('corehcms', CoreHCMController::class)->names('corehcm');
});
