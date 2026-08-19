<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeePositionHistory extends Model
{
    protected $table = 'employee_position_history';
    protected $primaryKey = 'position_history_id';

    public $timestamps = false;

    protected $fillable = [
        'employee_id',
        'effective_date',
        'change_type',
        'old_position_id',
        'new_position_id',
        'old_salary_grade_id',
        'new_salary_grade_id',
        'notes',
    ];

    protected $casts = [
        'effective_date' => 'date',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'employee_id', 'employee_id');
    }

    public function oldPosition(): BelongsTo
    {
        return $this->belongsTo(Position::class, 'old_position_id', 'position_id');
    }

    public function newPosition(): BelongsTo
    {
        return $this->belongsTo(Position::class, 'new_position_id', 'position_id');
    }

    public function oldSalaryGrade(): BelongsTo
    {
        return $this->belongsTo(SalaryGrade::class, 'old_salary_grade_id', 'salary_grade_id');
    }

    public function newSalaryGrade(): BelongsTo
    {
        return $this->belongsTo(SalaryGrade::class, 'new_salary_grade_id', 'salary_grade_id');
    }
}