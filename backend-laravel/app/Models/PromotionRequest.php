<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PromotionRequest extends Model
{
    protected $table = 'promotion_requests';
    protected $primaryKey = 'promotion_request_id';

    protected $fillable = [
        'employee_id',
        'current_position_id',
        'requested_position_id',
        'requested_salary_grade_id',
        'justification',
        'status',
        'reviewed_by',
        'reviewed_at',
        'review_notes',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    public const ACTIVE_STATUSES = ['Pending', 'Returned'];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'employee_id', 'employee_id');
    }

    public function currentPosition(): BelongsTo
    {
        return $this->belongsTo(Position::class, 'current_position_id', 'position_id');
    }

    public function requestedPosition(): BelongsTo
    {
        return $this->belongsTo(Position::class, 'requested_position_id', 'position_id');
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', self::ACTIVE_STATUSES);
    }
}
