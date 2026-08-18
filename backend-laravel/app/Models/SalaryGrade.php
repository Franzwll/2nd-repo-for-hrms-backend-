<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SalaryGrade extends Model
{
    protected $table = 'salary_grades';
    protected $primaryKey = 'salary_grade_id';

    protected $fillable = [
        'code',
        'title',
        'min_salary',
        'max_salary',
        'currency_code',
        'level',
        'notes',
    ];

    protected $casts = [
        'min_salary' => 'decimal:2',
        'max_salary' => 'decimal:2',
    ];

    public function positions(): HasMany
    {
        return $this->hasMany(Position::class, 'salary_grade_id', 'salary_grade_id');
    }

    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class, 'salary_grade_id', 'salary_grade_id');
    }
}