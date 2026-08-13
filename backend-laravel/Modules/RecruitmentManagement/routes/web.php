<?php

use Illuminate\Support\Facades\Route;
use Modules\RecruitmentManagement\Http\Controllers\RecruitmentManagementController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('recruitmentmanagements', RecruitmentManagementController::class)->names('recruitmentmanagement');
});
