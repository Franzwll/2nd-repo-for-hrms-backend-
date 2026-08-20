<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EssRequest extends Model
{
    protected $table = 'ess_requests';
    protected $primaryKey = 'ess_request_id';

    public $timestamps = true;

    protected $fillable = [
        'request_code',
        'employee_id',
        'category_id',
        'request_type',
        'filed_at',
        'date_from',
        'date_to',
        'status',
        'assigned_to_user_id',
        'details',
        'review_note',
        'returned_count',
        'attachment_path',
    ];

    protected $casts = [
        'filed_at' => 'datetime',
        'date_from' => 'date',
        'date_to' => 'date',
        'returned_count' => 'integer',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'employee_id', 'employee_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(EssCategory::class, 'category_id', 'ess_category_id');
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(SystemUser::class, 'assigned_to_user_id', 'system_user_id');
    }
}
