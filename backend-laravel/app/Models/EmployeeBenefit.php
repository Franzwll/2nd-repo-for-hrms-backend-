<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeBenefit extends Model
{
    protected $table = 'employee_benefits';
    protected $primaryKey = 'employee_benefit_id';

    public $timestamps = true;

    protected $fillable = [
        'employee_id',
        'benefit_name',
        'reference_value',
        'note',
        'effective_date',
        'end_date',
        'status',
    ];

    protected $casts = [
        'effective_date' => 'date',
        'end_date' => 'date',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'employee_id', 'employee_id');
    }
}
