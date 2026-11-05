<?php

namespace Modules\ApplicantManagement\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Hands-on, position-based practical exam.
 *
 * Rows now live in `applicant_evaluations` with eval_type = 'practical_test'.
 * The global scope hides other evaluation types, and accessors keep backward
 * compatibility for callers expecting practical_test_id, task_title and test_date.
 */
class PracticalTest extends Model
{
    public const EVAL_TYPE = 'practical_test';

    protected $table = 'applicant_evaluations';
    protected $primaryKey = 'evaluation_id';

    protected $fillable = [
        'applicant_id',
        'assessor_user_id',
        'task_title',
        'title',
        'criteria_json',
        'scores_json',
        'total_score',
        'result',
        'test_date',
        'evaluation_date',
        'remarks',
    ];

    protected $casts = [
        'criteria_json'   => 'array',
        'scores_json'     => 'array',
        'total_score'     => 'decimal:2',
        'evaluation_date' => 'date',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope('practical_tests', function (Builder $query): void {
            $query->where('eval_type', self::EVAL_TYPE);
        });

        static::creating(function (PracticalTest $model): void {
            $model->eval_type = self::EVAL_TYPE;

            if (! isset($model->attributes['title']) && isset($model->attributes['task_title'])) {
                $model->attributes['title'] = $model->attributes['task_title'];
                unset($model->attributes['task_title']);
            }
            if (! isset($model->attributes['evaluation_date']) && isset($model->attributes['test_date'])) {
                $model->attributes['evaluation_date'] = $model->attributes['test_date'];
                unset($model->attributes['test_date']);
            }
        });
    }

    public function getPracticalTestIdAttribute(): ?int
    {
        return $this->evaluation_id;
    }

    public function setTaskTitleAttribute(mixed $value): void
    {
        $this->attributes['title'] = $value;
    }

    public function getTaskTitleAttribute(): mixed
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
