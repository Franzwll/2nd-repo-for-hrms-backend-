<?php

namespace Modules\ApplicantManagement\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinalEvaluation extends Model
{
    protected $table = 'final_evaluations';
    protected $primaryKey = 'final_evaluation_id';

    protected $fillable = [
        'applicant_id',
        'evaluated_by_user_id',
        'evaluation_date',
        'screening_score',
        'screening_status',
        'interview_score',
        'interview_result',
        'assessment_test_score',
        'assessment_test_result',
        'practical_required',
        'practical_test_score',
        'practical_test_result',
        'overall_score',
        'score_breakdown_json',
        'recommendation',
        'recommended_job_post_id',
        'recommended_position_title',
        'overall_remarks',
    ];

    protected $casts = [
        'screening_score'         => 'decimal:2',
        'interview_score'         => 'decimal:2',
        'assessment_test_score'   => 'decimal:2',
        'practical_test_score'    => 'decimal:2',
        'overall_score'           => 'decimal:2',
        'score_breakdown_json'    => 'array',
        'practical_required'      => 'boolean',
        'evaluation_date'         => 'date',
    ];

    /* ------------------------------------------------------------------ */
    /* Relationships                                                         */
    /* ------------------------------------------------------------------ */

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class, 'applicant_id', 'applicant_id');
    }

    public function recommendedJobPost(): BelongsTo
    {
        return $this->belongsTo(
            \Modules\RecruitmentManagement\Models\JobPost::class,
            'recommended_job_post_id',
            'job_post_id'
        );
    }
}
