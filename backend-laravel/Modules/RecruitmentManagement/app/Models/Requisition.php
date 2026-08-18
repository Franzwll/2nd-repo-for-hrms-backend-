<?php

namespace Modules\RecruitmentManagement\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Requisition extends Model
{
    protected $table = 'requisitions';
    protected $primaryKey = 'requisition_id';

    protected $fillable = [
        'requisition_code',
        'position_id',
        'position_title',
        'department_id',
        'requested_by_user_id',
        'requested_count',
        'urgency',
        'justification',
        'status',
        'requested_at',
        'converted_job_post_id',
    ];

    protected $casts = [
        'requested_at' => 'date',
    ];

    /* ------------------------------------------------------------------ */
    /* Relationships                                                         */
    /* ------------------------------------------------------------------ */

    public function department(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Department::class, 'department_id', 'department_id');
    }

    public function position(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Position::class, 'position_id', 'position_id');
    }

    public function convertedJobPost(): BelongsTo
    {
        return $this->belongsTo(JobPost::class, 'converted_job_post_id', 'job_post_id');
    }

    /* ------------------------------------------------------------------ */
    /* Helpers                                                              */
    /* ------------------------------------------------------------------ */

    public static function generateCode(): string
    {
        $last = static::orderByDesc('requisition_id')->value('requisition_code');
        $next = $last ? ((int) substr($last, 4)) + 1 : 1;
        return 'REQ-' . str_pad($next, 5, '0', STR_PAD_LEFT);
    }
}
