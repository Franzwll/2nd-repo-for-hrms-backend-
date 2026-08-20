<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkSchedule extends Model
{
    protected $table = 'work_schedules';
    protected $primaryKey = 'work_schedule_id';

    public $timestamps = true;

    protected $fillable = [
        'employee_id',
        'day_of_week',
        'shift_name',
        'start_time',
        'end_time',
        'location',
        'is_rest_day',
        'effective_from',
        'effective_to',
    ];

    protected $casts = [
        'day_of_week' => 'integer',
        'is_rest_day' => 'boolean',
        'effective_from' => 'date',
        'effective_to' => 'date',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'employee_id', 'employee_id');
    }
}
