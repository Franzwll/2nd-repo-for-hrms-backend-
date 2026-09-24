<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'gemini' => [
        'key' => env('GEMINI_API_KEY'),
        'fallback_key' => env('GEMINI_FALLBACK_API_KEY'),
        'model' => env('GEMINI_MODEL', 'gemini-3.6-flash'),
        'fallback_model' => env('GEMINI_FALLBACK_MODEL'),
        'timeout' => (int) env('GEMINI_TIMEOUT', 30),
        'max_tokens' => (int) env('GEMINI_MAX_TOKENS', 2048),
    ],

    'openrouter' => [
        'key' => env('OPENROUTER_API_KEY'),
        // Free auto-router across all free models (not a Gemini model — it
        // picks whatever free model is available). Pin a specific slug
        // (e.g. "google/gemini-2.5-flash" or "...:free") to fix the model.
        'model' => env('OPENROUTER_MODEL', 'openrouter/free'),
    ],

    'job_ai' => [
        // Optional app-level cap on successful AI job-post drafts per day
        // (0 = unlimited). When set, the builder's AI usage indicator shows
        // "used X of N today" and the API answers 429 past the cap.
        'daily_limit' => (int) env('JOB_AI_DAILY_LIMIT', 0),
    ],

];
