<?php

use Illuminate\Support\Facades\Route;
use Modules\NewHireOnboarding\Http\Controllers\NewHireOnboardingController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('newhireonboardings', NewHireOnboardingController::class)->names('newhireonboarding');
});
