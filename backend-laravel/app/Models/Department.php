<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Department extends Model
{
    protected $table = 'departments';
    protected $primaryKey = 'department_id';

    protected $fillable = [
        'code',
        'name',
        'description',
        'head_employee_id',
        'budget',
    ];

    protected $casts = [
        'budget' => 'decimal:2',
    ];

    public function positions(): HasMany
    {
        return $this->hasMany(Position::class, 'department_id', 'department_id');
    }

    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class, 'department_id', 'department_id');
    }

    public function head(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'head_employee_id', 'employee_id');
    }
}
