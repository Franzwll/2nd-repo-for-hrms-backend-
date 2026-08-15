<?php

use Illuminate\Support\Facades\Route;
use Modules\Landing\Http\Controllers\LandingController;

Route::prefix('v1')->group(function () {
    Route::get('landing/company', [LandingController::class, 'company']);
    Route::get('landing/jobs', [LandingController::class, 'jobs']);
    Route::get('landing/jobs/{job_post}', [LandingController::class, 'job']);
    Route::get('landing/announcements', [LandingController::class, 'announcements']);
    Route::post('landing/apply', [LandingController::class, 'apply']);
});