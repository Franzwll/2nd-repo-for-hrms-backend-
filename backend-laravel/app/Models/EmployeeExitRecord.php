<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeExitRecord extends Model
{
    protected $table = 'employee_exit_records';
    protected $primaryKey = 'exit_record_id';

    protected $fillable = [
        'employee_id',
        'exit_type',
        'exit_date',
        'clearance_status',
        'coe_status',
        'notes',
    ];

    protected $casts = [
        'exit_date' => 'date',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'employee_id', 'employee_id');
    }
}