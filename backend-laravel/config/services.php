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
        'model' => env('GEMINI_MODEL', 'gemini-3.5-flash-lite'),
        'fallback_model' => env('GEMINI_FALLBACK_MODEL'),
        'timeout' => (int) env('GEMINI_TIMEOUT', 30),
        'max_tokens' => (int) env('GEMINI_MAX_TOKENS', 2048),
    ],

    /*
    |--------------------------------------------------------------------------
    | AI chat (Landing + ESS share one chain)
    |--------------------------------------------------------------------------
    | 1st Groq (openai/gpt-oss-20b) -> 2nd OpenRouter
    | (nvidia/nemotron-3-super-120b-a12b:free) -> 3rd shared Gemini.
    */
    'chat_groq' => [
        'key' => env('CHAT_GROQ_API_KEY'),
        'model' => env('CHAT_GROQ_MODEL', 'openai/gpt-oss-20b'),
    ],

    'chat_openrouter' => [
        'key' => env('CHAT_OPENROUTER_API_KEY'),
        'model' => env('CHAT_OPENROUTER_MODEL', 'nvidia/nemotron-3-super-120b-a12b:free'),
    ],

    /*
    |--------------------------------------------------------------------------
    | AI job-post drafts (own Groq/OpenRouter keys, shared Gemini key)
    |--------------------------------------------------------------------------
    | Chain: 1st shared Gemini -> 2nd Groq -> 3rd OpenRouter.
    | Per-provider timeout/attempt budget: services.job_ai.
    */
    'job_groq' => [
        'key' => env('JOB_GROQ_API_KEY'),
        'model' => env('JOB_GROQ_MODEL', 'openai/gpt-oss-20b'),
    ],

    'job_openrouter' => [
        'key' => env('JOB_OPENROUTER_API_KEY'),
        'model' => env('JOB_OPENROUTER_MODEL', 'nvidia/nemotron-3-super-120b-a12b:free'),
    ],

    'turnstile' => [
        'secret' => env('TURNSTILE_SECRET_KEY'),
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
        /*
        | Per-provider HTTP timeout (seconds) and attempt budget for the
        | job-post chain. The first provider gets a short timeout and a
        | single attempt, so a slow answer fails over to the next provider
        | in seconds instead of stalling the whole request.
        */
        'timeouts' => [
            'gemini' => (int) env('JOB_GEMINI_TIMEOUT', 10),
            'groq' => (int) env('JOB_GROQ_TIMEOUT', 20),
            'openrouter' => (int) env('JOB_OPENROUTER_TIMEOUT', 20),
        ],
        'attempts' => [
            'gemini' => (int) env('JOB_GEMINI_ATTEMPTS', 1),
            'groq' => (int) env('JOB_GROQ_ATTEMPTS', 2),
            'openrouter' => (int) env('JOB_OPENROUTER_ATTEMPTS', 2),
        ],
        // Ceiling (seconds) for one generation across all providers. When it
        // is reached no further provider is started, so a fully degraded chain
        // answers with a clean error instead of a hanging request.
        'total_budget' => (int) env('JOB_AI_TOTAL_BUDGET', 25),
    ],

    /*
    |--------------------------------------------------------------------------
    | Zoom Meeting SDK (embedded virtual interviews)
    |--------------------------------------------------------------------------
    | Mock provider (default) needs no keys — ZoomMeetingService generates
    | Zoom-style links stored on the interview row. To embed a REAL meeting
    | inside the HRMS popup (no Zoom app), create a Meeting SDK app +
    | Server-to-Server OAuth app at https://marketplace.zoom.us and fill:
    |   ZOOM_PROVIDER=api
    |   ZOOM_SDK_KEY=..., ZOOM_SDK_SECRET=...
    |   ZOOM_ACCOUNT_ID=..., ZOOM_CLIENT_ID=..., ZOOM_CLIENT_SECRET=...
    | The frontend joins via @zoom/meetingsdk Component View using the
    | signature minted by POST /api/v1/interviews/{id}/zoom-signature.
    */
    'zoom' => [
        'provider'      => env('ZOOM_PROVIDER', 'mock'),
        'sdk_key'       => env('ZOOM_SDK_KEY'),
        'sdk_secret'    => env('ZOOM_SDK_SECRET'),
        'account_id'    => env('ZOOM_ACCOUNT_ID'),
        'client_id'     => env('ZOOM_CLIENT_ID'),
        'client_secret' => env('ZOOM_CLIENT_SECRET'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Tier-1 thin LMS (ESS Performance: handbook -> AI quiz -> auto-score)
    |--------------------------------------------------------------------------
    | Kill switch: set ESS_LMS_QUIZ_ENABLED=false to unregister the new ESS
    | learning routes so the cards fall back to updateLearningProgress +
    | HR verification (verifyLearning). The quiz spec is fixed at
    | 10 items / 10 minutes / pass >= 80%.
    */
    'ess_lms' => [
        'enabled' => filter_var(env('ESS_LMS_QUIZ_ENABLED', true), FILTER_VALIDATE_BOOLEAN),
        'pass_mark' => (int) env('ESS_LMS_PASS_MARK', 80),
        'time_limit_seconds' => (int) env('ESS_LMS_TIME_LIMIT', 600),
        'question_count' => (int) env('ESS_LMS_QUESTION_COUNT', 10),
        // Wall-clock cap for one quiz-generation call. Kept well under PHP's
        // 60s max_execution_time so a slow AI provider falls back to the
        // deterministic bank instead of fatalling the request.
        'quiz_budget_seconds' => (int) env('ESS_LMS_QUIZ_BUDGET', 45),
    ],

];
