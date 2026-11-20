<?php

namespace Modules\ApplicantManagement\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Interview assessment for an applicant.
 *
 * Rows now live in `applicant_evaluations` with eval_type = 'interview_assessment'.
 * The global scope hides other evaluation types, and accessors keep backward
 * compatibility for callers expecting assessment_id and assessment_date.
 */
class ApplicantAssessment extends Model
{
    public const EVAL_TYPE = 'interview_assessment';

    protected $table = 'applicant_evaluations';
    protected $primaryKey = 'evaluation_id';

    protected $fillable = [
        'applicant_id',
        'assessor_user_id',
        'assessment_date',
        'evaluation_date',
        'scores_json',
        'comments_json',
        'total_score',
        'outcome',
        'result',
        'remarks',
    ];

    protected $casts = [
        'scores_json'     => 'array',
        'comments_json'   => 'array',
        'total_score'     => 'decimal:2',
        'evaluation_date' => 'date',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope('interview_assessments', function (Builder $query): void {
            $query->where('eval_type', self::EVAL_TYPE);
        });

        static::creating(function (ApplicantAssessment $model): void {
            $model->eval_type = self::EVAL_TYPE;
            if (! isset($model->attributes['evaluation_date']) && isset($model->attributes['assessment_date'])) {
                $model->attributes['evaluation_date'] = $model->attributes['assessment_date'];
                unset($model->attributes['assessment_date']);
            }
        });
    }

    public function getAssessmentIdAttribute(): ?int
    {
        return $this->evaluation_id;
    }

    public function setAssessmentDateAttribute(mixed $value): void
    {
        $this->attributes['evaluation_date'] = $value;
    }

    public function getAssessmentDateAttribute(): mixed
    {
        return $this->evaluation_date;
    }

    /* ------------------------------------------------------------------ */
    /* Relationships                                                         */
    /* ------------------------------------------------------------------ */

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class, 'applicant_id', 'applicant_id');
    }
}
