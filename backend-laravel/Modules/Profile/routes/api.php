<?php

use Illuminate\Support\Facades\Route;
use Modules\Profile\Http\Controllers\ProfileController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('profiles', ProfileController::class)->names('profile');
    Route::post('profile/photo', [ProfileController::class, 'uploadPhoto'])->name('profile.photo.upload');
    Route::delete('profile/photo', [ProfileController::class, 'removePhoto'])->name('profile.photo.remove');
});

// Public photo stream — no auth so <img> tags can load it directly.
// The filename is random per upload, so this is unguessable in practice.
Route::prefix('v1')->group(function () {
    Route::get('profile-photo/{filename}', [ProfileController::class, 'showPhoto'])
        ->where('filename', '[A-Za-z0-9._-]+')
        ->name('profile.photo.show');
});
