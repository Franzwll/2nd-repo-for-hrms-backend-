<?php

use Illuminate\Support\Facades\Route;
use Modules\Profile\Http\Controllers\ProfileController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('profiles', ProfileController::class)->names('profile');
    Route::post('profile/photo', [ProfileController::class, 'uploadPhoto'])->name('profile.photo.upload');
    Route::delete('profile/photo', [ProfileController::class, 'removePhoto'])->name('profile.photo.remove');
});
