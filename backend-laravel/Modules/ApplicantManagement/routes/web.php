<?php

use Illuminate\Support\Facades\Route;
use Modules\ApplicantManagement\Http\Controllers\ApplicantManagementController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('applicantmanagements', ApplicantManagementController::class)->names('applicantmanagement');
});
