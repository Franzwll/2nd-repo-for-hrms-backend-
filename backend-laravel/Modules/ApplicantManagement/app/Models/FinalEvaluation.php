<?php

namespace Modules\ApplicantManagement\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Closing evaluation of the whole recruitment process for an applicant.
 *
 * Rows now live in `applicant_evaluations` with eval_type = 'final_evaluation'.
 * The global scope hides other evaluation types, and accessors keep backward
 * compatibility for callers expecting final_evaluation_id, evaluated_by_user_id
 * and overall_remarks.
 */
class FinalEvaluation extends Model
{
    public const EVAL_TYPE = 'final_evaluation';

    protected $table = 'applicant_evaluations';
    protected $primaryKey = 'evaluation_id';

    protected $fillable = [
        'applicant_id',
        'evaluated_by_user_id',
        'assessor_user_id',
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
        'remarks',
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

    protected static function booted(): void
    {
        static::addGlobalScope('final_evaluations', function (Builder $query): void {
            $query->where('eval_type', self::EVAL_TYPE);
        });

        static::creating(function (FinalEvaluation $model): void {
            $model->eval_type = self::EVAL_TYPE;

            if (! isset($model->attributes['assessor_user_id']) && isset($model->attributes['evaluated_by_user_id'])) {
                $model->attributes['assessor_user_id'] = $model->attributes['evaluated_by_user_id'];
                unset($model->attributes['evaluated_by_user_id']);
            }
            if (! isset($model->attributes['remarks']) && isset($model->attributes['overall_remarks'])) {
                $model->attributes['remarks'] = $model->attributes['overall_remarks'];
                unset($model->attributes['overall_remarks']);
            }
        });
    }

    public function getFinalEvaluationIdAttribute(): ?int
    {
        return $this->evaluation_id;
    }

    public function setEvaluatedByUserIdAttribute(mixed $value): void
    {
        $this->attributes['assessor_user_id'] = $value;
    }

    public function getEvaluatedByUserIdAttribute(): ?int
    {
        return $this->assessor_user_id !== null ? (int) $this->assessor_user_id : null;
    }

    public function setOverallRemarksAttribute(mixed $value): void
    {
        $this->attributes['remarks'] = $value;
    }

    public function getOverallRemarksAttribute(): ?string
    {
        return $this->attributes['remarks'] ?? null;
    }

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
        )->withTrashed();
    }
}
