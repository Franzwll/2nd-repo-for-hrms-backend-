<?php

namespace Modules\ApplicantManagement\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Interview extends Model
{
    protected $table = 'interviews';
    protected $primaryKey = 'interview_id';

    protected $fillable = [
        'interview_code',
        'applicant_id',
        'scheduled_date',
        'scheduled_time',
        'mode',
        'facility_id',
        'facility_status',
        'interviewer_employee_id',
        'interviewer_name',
        'status',
    ];

    protected $casts = [
        'scheduled_date' => 'date',
    ];

    /* ------------------------------------------------------------------ */
    /* Relationships                                                         */
    /* ------------------------------------------------------------------ */

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class, 'applicant_id', 'applicant_id');
    }

    public function facility(): BelongsTo
    {
        return $this->belongsTo(Facility::class, 'facility_id', 'facility_id');
    }

    /* ------------------------------------------------------------------ */
    /* Helpers                                                              */
    /* ------------------------------------------------------------------ */

    public static function generateCode(): string
    {
        $last = static::orderByDesc('interview_id')->value('interview_code');
        $next = $last ? ((int) substr($last, 4)) + 1 : 1;
        return 'INT-' . str_pad($next, 5, '0', STR_PAD_LEFT);
    }
}
