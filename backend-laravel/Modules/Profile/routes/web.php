<?php

use Illuminate\Support\Facades\Route;
use Modules\Profile\Http\Controllers\ProfileController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('profiles', ProfileController::class)->names('profile');
});
