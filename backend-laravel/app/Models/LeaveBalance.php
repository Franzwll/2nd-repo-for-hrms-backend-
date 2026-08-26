<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeaveBalance extends Model
{
    protected $table = 'leave_balances';
    protected $primaryKey = 'leave_balance_id';

    public $timestamps = true;

    protected $fillable = [
        'employee_id',
        'leave_type',
        'period_year',
        'total_days',
        'used_days',
    ];

    protected $casts = [
        'period_year' => 'integer',
        'total_days' => 'float',
        'used_days' => 'float',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'employee_id', 'employee_id');
    }
}
