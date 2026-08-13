<?php

use Illuminate\Support\Facades\Route;
use Modules\RecruitmentManagement\Http\Controllers\RecruitmentManagementController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('recruitmentmanagements', RecruitmentManagementController::class)->names('recruitmentmanagement');
});
