<?php

use Illuminate\Support\Facades\Route;
use Modules\Auth\Http\Controllers\AuthController;
use Modules\Auth\Http\Controllers\MfaController;
use Modules\Auth\Http\Controllers\PasswordResetController;
use App\Http\Controllers\NotificationController;

Route::prefix('v1')->group(function () {
    Route::get('auth/session-policy', [AuthController::class, 'sessionPolicy']);
    Route::post('auth/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
    Route::post('auth/otp/verify', [AuthController::class, 'verifyOtp'])->middleware('throttle:10,1');
    Route::post('auth/otp/resend', [AuthController::class, 'resendOtp'])->middleware('throttle:3,1');
    Route::post('auth/mfa/verify', [MfaController::class, 'verify'])->middleware('throttle:5,1');
    Route::post('auth/mfa/recover', [MfaController::class, 'recover'])->middleware('throttle:5,1');
    Route::post('auth/forgot-password', [PasswordResetController::class, 'forgotPassword'])->middleware('throttle:3,1');
    Route::post('auth/reset-password', [PasswordResetController::class, 'resetPassword'])->middleware('throttle:5,1');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('auth/me', [AuthController::class, 'me']);
        Route::get('auth/mfa/status', [MfaController::class, 'status']);
        Route::post('auth/mfa/totp/setup', [MfaController::class, 'setup'])->middleware('throttle:10,1');
        Route::post('auth/mfa/totp/confirm', [MfaController::class, 'confirm'])->middleware('throttle:5,1');
        Route::post('auth/mfa/totp/disable', [MfaController::class, 'disable'])->middleware('throttle:5,1');
        Route::post('auth/mfa/recovery-codes', [MfaController::class, 'regenerateCodes'])->middleware('throttle:3,1');
        Route::post('auth/mfa/reset/{systemUser}', [MfaController::class, 'adminReset'])->middleware('permission:User Management:Full');

        // Notifications
        Route::get('notifications', [NotificationController::class, 'index']);
        Route::post('notifications', [NotificationController::class, 'store']);
        Route::post('notifications/mark-all-read', [NotificationController::class, 'markAllRead']);
        Route::patch('notifications/{id}/read', [NotificationController::class, 'markRead']);
    });
});
