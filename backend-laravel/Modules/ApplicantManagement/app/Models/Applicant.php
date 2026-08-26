<?php

namespace Modules\ApplicantManagement\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Applicant extends Model
{
    protected $table = 'applicants';
    protected $primaryKey = 'applicant_id';

    protected $fillable = [
        'applicant_code',
        'job_post_id',
        'name',
        'email',
        'phone',
        'applied_at',
        'fit_score',
        'status',
        'stage',
        'source',
        'resume_file_path',
        'resume_original_name',
        'summary',
        'flags_json',
    ];

    protected $casts = [
        'flags_json'              => 'array',
        'applied_at'              => 'datetime',
        'fit_score'               => 'decimal:2',
    ];

    /* ------------------------------------------------------------------ */
    /* Relationships                                                         */
    /* ------------------------------------------------------------------ */

    public function jobPost(): BelongsTo
    {
        return $this->belongsTo(
            \Modules\RecruitmentManagement\Models\JobPost::class,
            'job_post_id',
            'job_post_id'
        );
    }

    public function screeningEntities(): HasMany
    {
        return $this->hasMany(ApplicantScreeningEntity::class, 'applicant_id', 'applicant_id');
    }

    public function screeningScores(): HasMany
    {
        return $this->hasMany(ApplicantScreeningScore::class, 'applicant_id', 'applicant_id');
    }

    public function screenings(): HasMany
    {
        return $this->hasMany(ApplicantScreening::class, 'applicant_id', 'applicant_id');
    }

    public function latestScreening(): HasOne
    {
        return $this->hasOne(ApplicantScreening::class, 'applicant_id', 'applicant_id')
            ->latestOfMany('screening_id');
    }

    public function interviews(): HasMany
    {
        return $this->hasMany(Interview::class, 'applicant_id', 'applicant_id');
    }

    public function assessment(): HasOne
    {
        return $this->hasOne(ApplicantAssessment::class, 'applicant_id', 'applicant_id')
                    ->latestOfMany('assessment_id');
    }

    public function assessments(): HasMany
    {
        return $this->hasMany(ApplicantAssessment::class, 'applicant_id', 'applicant_id');
    }

    /* ------------------------------------------------------------------ */
    /* Helpers                                                              */
    /* ------------------------------------------------------------------ */

    /**
     * Generate the next applicant_code in the sequence APL-XXXXX.
     */
    public static function generateCode(): string
    {
        $last = static::orderByDesc('applicant_id')->value('applicant_code');
        $next = $last ? ((int) substr($last, 4)) + 1 : 1;
        return 'APL-' . str_pad($next, 5, '0', STR_PAD_LEFT);
    }
}
