<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_filter(array_map('trim', explode(',', env('CORS_ALLOWED_ORIGINS', 'http://localhost:8080,http://localhost:8081,http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:3000,http://127.0.0.1:8080,http://127.0.0.1:8081,http://127.0.0.1:5173,http://127.0.0.1:5174,http://127.0.0.1:5175')))),

    // Allow any local dev origin (localhost / 127.0.0.1 on any port) so the
    // frontend can fetch document blobs cross-origin for in-browser preview.
    // Also allow any HTTPS subdomain of oxfordsuitesmakati.io so deployed
    // frontends (hrms1 / testhrms1) can call their API host (testapi-hrms1)
    // without editing CORS_ALLOWED_ORIGINS on every server.
    'allowed_origins_patterns' => [
        '/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/',
        '/^https:\/\/([a-z0-9-]+\.)*oxfordsuitesmakati\.io(:\d+)?$/',
    ],


    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 86400,

    'supports_credentials' => false,

];
