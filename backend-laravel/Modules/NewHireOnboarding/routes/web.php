<?php

use Illuminate\Support\Facades\Route;
use Modules\NewHireOnboarding\Http\Controllers\NewHireOnboardingController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('newhireonboardings', NewHireOnboardingController::class)->names('newhireonboarding');
});
