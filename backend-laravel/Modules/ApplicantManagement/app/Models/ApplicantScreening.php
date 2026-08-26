<?php

namespace Modules\ApplicantManagement\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicantScreening extends Model
{
    protected $table = 'applicant_screenings';

    protected $primaryKey = 'screening_id';

    protected $fillable = [
        'applicant_id',
        'job_post_id',
        'processing_status',
        'screening_result',
        'match_score',
        'score_breakdown_json',
        'profile_json',
        'entities_json',
        'missing_information_json',
        'validation_json',
        'alternative_job_json',
        'reasons_json',
        'model_info_json',
        'error_message',
        'processed_at',
    ];

    protected $casts = [
        'score_breakdown_json' => 'array',
        'profile_json' => 'array',
        'entities_json' => 'array',
        'missing_information_json' => 'array',
        'validation_json' => 'array',
        'alternative_job_json' => 'array',
        'reasons_json' => 'array',
        'model_info_json' => 'array',
        'match_score' => 'decimal:2',
        'processed_at' => 'datetime',
    ];

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class, 'applicant_id', 'applicant_id');
    }
}
