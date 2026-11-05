<?php

namespace Modules\ApplicantManagement\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Single-use links for applicants to complete an assessment test.
 *
 * Rows now live in `applicant_evaluations` with eval_type = 'assessment_invite'.
 * The global scope hides other evaluation types, and accessors keep backward
 * compatibility for callers expecting assessment_invite_id, created_by_user_id
 * and test_title.
 */
class AssessmentInvite extends Model
{
    public const EVAL_TYPE = 'assessment_invite';

    protected $table = 'applicant_evaluations';
    protected $primaryKey = 'evaluation_id';

    protected $fillable = [
        'token',
        'applicant_id',
        'created_by_user_id',
        'assessor_user_id',
        'test_title',
        'title',
        'questions_json',
        'answers_json',
        'passing_score',
        'total_score',
        'result',
        'status',
        'expires_at',
        'submitted_at',
    ];

    protected $casts = [
        'questions_json' => 'array',
        'answers_json'   => 'array',
        'passing_score'  => 'decimal:2',
        'total_score'    => 'decimal:2',
        'expires_at'     => 'datetime',
        'submitted_at'   => 'datetime',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope('assessment_invites', function (Builder $query): void {
            $query->where('eval_type', self::EVAL_TYPE);
        });

        static::creating(function (AssessmentInvite $model): void {
            $model->eval_type = self::EVAL_TYPE;
            $model->passing_score ??= 75.00;
            $model->status ??= 'Pending';

            if (! isset($model->attributes['assessor_user_id']) && isset($model->attributes['created_by_user_id'])) {
                $model->attributes['assessor_user_id'] = $model->attributes['created_by_user_id'];
                unset($model->attributes['created_by_user_id']);
            }
            if (! isset($model->attributes['title']) && isset($model->attributes['test_title'])) {
                $model->attributes['title'] = $model->attributes['test_title'];
                unset($model->attributes['test_title']);
            }
        });
    }

    public function getAssessmentInviteIdAttribute(): ?int
    {
        return $this->evaluation_id;
    }

    public function setCreatedByUserIdAttribute(mixed $value): void
    {
        $this->attributes['assessor_user_id'] = $value;
    }

    public function getCreatedByUserIdAttribute(): ?int
    {
        return $this->assessor_user_id !== null ? (int) $this->assessor_user_id : null;
    }

    public function setTestTitleAttribute(mixed $value): void
    {
        $this->attributes['title'] = $value;
    }

    public function getTestTitleAttribute(): mixed
    {
        return $this->attributes['title'] ?? null;
    }

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class, 'applicant_id', 'applicant_id');
    }
}
