<?php

return [
    'mock_enabled' => (bool) env('HR3_MOCK_MODE', false),
    'default_score' => (float) env('HR3_MOCK_SCORE', 90),
    'default_comments' => env('HR3_MOCK_COMMENTS', 'Auto-generated performance evaluation (HR3 demo mode).'),
    'default_evaluator_user_id' => env('HR3_MOCK_EVALUATOR_USER_ID'),
];
