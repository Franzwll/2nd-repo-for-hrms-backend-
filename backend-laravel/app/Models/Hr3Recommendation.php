<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Hr3Recommendation extends Model
{
    protected $table = 'hr3_recommendations';
    protected $primaryKey = 'recommendation_id';

    public $timestamps = true;

    protected $fillable = [
        'employee_id',
        'recommendation_type',
        'evaluation_score',
        'evaluator_user_id',
        'date_submitted',
        'status',
        'suggested_position_id',
        'suggested_salary_grade_id',
        'current_employment_type',
        'comments',
    ];

    protected $casts = [
        'evaluation_score' => 'float',
        'date_submitted' => 'date',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'employee_id', 'employee_id');
    }

    public function suggestedPosition(): BelongsTo
    {
        return $this->belongsTo(Position::class, 'suggested_position_id', 'position_id');
    }

    public function suggestedSalaryGrade(): BelongsTo
    {
        return $this->belongsTo(SalaryGrade::class, 'suggested_salary_grade_id', 'salary_grade_id');
    }

    public function evaluator(): BelongsTo
    {
        return $this->belongsTo(SystemUser::class, 'evaluator_user_id', 'system_user_id');
    }
}