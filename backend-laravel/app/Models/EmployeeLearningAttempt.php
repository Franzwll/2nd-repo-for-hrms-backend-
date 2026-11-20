<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeLearningAttempt extends Model
{
    protected $table = 'employee_learning_attempts';
    protected $primaryKey = 'attempt_id';

    public $timestamps = false;

    protected $fillable = [
        'employee_id',
        'course_id',
        'score',
        'correct_count',
        'total_count',
        'passed',
        'answers_json',
        'submitted_at',
    ];

    protected $casts = [
        'score' => 'integer',
        'correct_count' => 'integer',
        'total_count' => 'integer',
        'passed' => 'boolean',
        'answers_json' => 'array',
        'submitted_at' => 'datetime',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'employee_id', 'employee_id');
    }
}
