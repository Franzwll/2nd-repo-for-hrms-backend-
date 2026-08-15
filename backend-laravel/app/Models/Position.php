<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Position extends Model
{
    protected $table = 'positions';
    protected $primaryKey = 'position_id';

    protected $fillable = [
        'position_code',
        'title',
        'department_id',
        'salary_grade_id',
        'level',
        'headcount',
        'filled_count',
    ];

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id', 'department_id');
    }
}
