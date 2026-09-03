<?php

namespace Modules\ApplicantManagement\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScreeningGroundTruth extends Model
{
    protected $table = 'screening_ground_truths';

    protected $primaryKey = 'gt_id';

    protected $fillable = [
        'applicant_id',
        'job_post_id',
        'true_screening_result',
        'true_qualification_score',
        'true_missing_information_json',
        'true_unrecognized_skills_json',
        'notes',
    ];

    protected $casts = [
        'true_missing_information_json' => 'array',
        'true_unrecognized_skills_json' => 'array',
        'true_qualification_score' => 'decimal:2',
    ];

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class, 'applicant_id', 'applicant_id');
    }
}
