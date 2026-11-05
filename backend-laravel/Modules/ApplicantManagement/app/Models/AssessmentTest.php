<?php

namespace Modules\ApplicantManagement\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Job-specific written / knowledge assessment test.
 *
 * Rows now live in `applicant_evaluations` with eval_type = 'assessment_test'.
 * The global scope hides other evaluation types, and accessors keep backward
 * compatibility for callers expecting assessment_test_id, test_title and test_date.
 */
class AssessmentTest extends Model
{
    public const EVAL_TYPE = 'assessment_test';

    protected $table = 'applicant_evaluations';
    protected $primaryKey = 'evaluation_id';

    protected $fillable = [
        'applicant_id',
        'assessor_user_id',
        'test_title',
        'title',
        'questions_json',
        'scores_json',
        'total_score',
        'passing_score',
        'result',
        'test_date',
        'evaluation_date',
        'remarks',
    ];

    protected $casts = [
        'questions_json'  => 'array',
        'scores_json'     => 'array',
        'total_score'     => 'decimal:2',
        'passing_score'   => 'decimal:2',
        'evaluation_date' => 'date',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope('assessment_tests', function (Builder $query): void {
            $query->where('eval_type', self::EVAL_TYPE);
        });

        static::creating(function (AssessmentTest $model): void {
            $model->eval_type = self::EVAL_TYPE;
            $model->passing_score ??= 75.00;

            if (! isset($model->attributes['title']) && isset($model->attributes['test_title'])) {
                $model->attributes['title'] = $model->attributes['test_title'];
                unset($model->attributes['test_title']);
            }
            if (! isset($model->attributes['evaluation_date']) && isset($model->attributes['test_date'])) {
                $model->attributes['evaluation_date'] = $model->attributes['test_date'];
                unset($model->attributes['test_date']);
            }
        });
    }

    public function getAssessmentTestIdAttribute(): ?int
    {
        return $this->evaluation_id;
    }

    public function setTestTitleAttribute(mixed $value): void
    {
        $this->attributes['title'] = $value;
    }

    public function getTestTitleAttribute(): mixed
    {
        return $this->attributes['title'] ?? null;
    }

    public function setTestDateAttribute(mixed $value): void
    {
        $this->attributes['evaluation_date'] = $value;
    }

    public function getTestDateAttribute(): mixed
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
