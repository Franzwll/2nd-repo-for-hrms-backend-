<?php

use Illuminate\Support\Facades\Route;
use Modules\Landing\Http\Controllers\AnnouncementController;
use Modules\Landing\Http\Controllers\ChatbotController;
use Modules\Landing\Http\Controllers\ChatbotFaqController;
use Modules\Landing\Http\Controllers\LandingController;

Route::prefix('v1')->group(function () {
    Route::get('landing/company', [LandingController::class, 'company']);
    Route::get('landing/jobs', [LandingController::class, 'jobs']);
    Route::get('landing/jobs/{job_post}', [LandingController::class, 'job']);
    Route::get('landing/announcements', [LandingController::class, 'announcements']);
    Route::post('landing/apply', [LandingController::class, 'apply']);
    Route::post('landing/chat', [ChatbotController::class, 'chat']);

    /* ------------------------------------------------------------------ */
    /* Announcements (portal CRUD, DB-backed)                              */
    /* ------------------------------------------------------------------ */
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('announcements', [AnnouncementController::class, 'index']);

        Route::middleware('permission:Settings:Edit')->group(function () {
            Route::post('announcements', [AnnouncementController::class, 'store']);
            Route::put('announcements/{announcement}', [AnnouncementController::class, 'update']);
            Route::delete('announcements/{announcement}', [AnnouncementController::class, 'destroy']);
        });
    });

    /* ------------------------------------------------------------------ */
    /* Chatbot FAQs                                                         */
    /* ------------------------------------------------------------------ */
    Route::middleware(['auth:sanctum', 'permission:Settings'])->prefix('chatbot')->group(function () {
        Route::get('faqs', [ChatbotFaqController::class, 'index']);

        Route::middleware('permission:Settings:Edit')->group(function () {
            Route::post('faqs', [ChatbotFaqController::class, 'store']);
            Route::put('faqs/{faq}', [ChatbotFaqController::class, 'update']);
            Route::delete('faqs/{faq}', [ChatbotFaqController::class, 'destroy']);
        });
    });
});