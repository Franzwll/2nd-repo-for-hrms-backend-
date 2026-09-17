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
        'hr3_recommendation_id',
        'forwarded_to_hr3_by',
        'forwarded_to_hr3_at',
        'justification',
        'status',
        'reviewed_by',
        'reviewed_at',
        'review_notes',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
        'forwarded_to_hr3_at' => 'datetime',
    ];

    public const ACTIVE_STATUSES = ['Pending', 'Returned', 'Under HR3 Review', 'Pending HR Action'];

    /** True once this request entered the HR3 evaluation loop. */
    public function inHr3Loop(): bool
    {
        return in_array($this->status, ['Under HR3 Review', 'Pending HR Action'], true)
            || $this->hr3_recommendation_id !== null;
    }

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

    public function hr3Recommendation(): BelongsTo
    {
        return $this->belongsTo(Hr3Recommendation::class, 'hr3_recommendation_id', 'recommendation_id');
    }

    public function forwardedBy(): BelongsTo
    {
        return $this->belongsTo(SystemUser::class, 'forwarded_to_hr3_by', 'system_user_id');
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', self::ACTIVE_STATUSES);
    }
}
