<?php

return [
    'name' => 'ApplicantManagement',

    /*
    |--------------------------------------------------------------------------
    | Final Evaluation weighting / rubric
    |--------------------------------------------------------------------------
    |
    | Single source of truth for the system-calculated Overall Score.
    | Values are percentages that must total 100. When the position does
    | NOT require a practical test, the backend normalizes the remaining
    | applicable weights to 100% instead of counting practical as zero.
    |
    | Example (initial implementation):
    |   Screening/Role Fit 20% + Interview 30% + Assessment 25% + Practical 25%
    |
    */
    'final_evaluation' => [
        'weights' => [
            'screening' => 20,
            'interview' => 30,
            'assessment' => 25,
            'practical' => 25,
        ],
    ],
];
