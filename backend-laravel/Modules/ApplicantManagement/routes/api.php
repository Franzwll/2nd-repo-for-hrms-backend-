<?php

use Illuminate\Support\Facades\Route;
use Modules\ApplicantManagement\Http\Controllers\ApplicantManagementController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('applicantmanagements', ApplicantManagementController::class)->names('applicantmanagement');
});
