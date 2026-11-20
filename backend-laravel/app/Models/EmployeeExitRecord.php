<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * One row per separation cycle. employee_id is indexed but not unique so a
 * rehired employee can keep every past clearance/COE record.
 */
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
        'rehire_date',
    ];

    protected $casts = [
        'exit_date' => 'date',
        'rehire_date' => 'date',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'employee_id', 'employee_id');
    }
}
