<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttendanceRecord extends Model
{
    protected $table = 'attendance_records';
    protected $primaryKey = 'attendance_id';

    public $timestamps = true;

    protected $fillable = [
        'employee_id',
        'work_date',
        'time_in',
        'time_out',
        'break_in',
        'break_out',
        'hours_worked',
        'late_minutes',
        'undertime_minutes',
        'overtime_hours',
        'remark',
        'status',
    ];

    protected $casts = [
        'work_date' => 'date',
        'time_in' => 'datetime',
        'time_out' => 'datetime',
        'break_in' => 'datetime',
        'break_out' => 'datetime',
        'hours_worked' => 'float',
        'late_minutes' => 'integer',
        'undertime_minutes' => 'integer',
        'overtime_hours' => 'float',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'employee_id', 'employee_id');
    }
}
