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
        'rejected_at',
        'cooldown_lifted_at',
        'offer_status',
        'offer_sent_at',
        'offer_expires_at',
        'offer_start_date',
        'offer_response_channel',
        'offer_response_note',
        'offer_responded_at',
        'offer_response_recorded_by',
        'source',
        'resume_file_path',
        'resume_original_name',
        'resume_hash',
        'summary',
        'flags_json',
    ];

    protected $casts = [
        'flags_json'              => 'array',
        'applied_at'              => 'datetime',
        'fit_score'               => 'decimal:2',
        'rejected_at'             => 'datetime',
        'cooldown_lifted_at'      => 'datetime',
        'offer_sent_at'           => 'datetime',
        'offer_expires_at'        => 'datetime',
        'offer_start_date'        => 'date',
        'offer_responded_at'      => 'datetime',
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

    public function assessmentTests(): HasMany
    {
        return $this->hasMany(AssessmentTest::class, 'applicant_id', 'applicant_id');
    }

    public function latestAssessmentTest(): HasOne
    {
        return $this->hasOne(AssessmentTest::class, 'applicant_id', 'applicant_id')
                    ->latestOfMany('assessment_test_id');
    }

    public function practicalTests(): HasMany
    {
        return $this->hasMany(PracticalTest::class, 'applicant_id', 'applicant_id');
    }

    public function latestPracticalTest(): HasOne
    {
        return $this->hasOne(PracticalTest::class, 'applicant_id', 'applicant_id')
                    ->latestOfMany('practical_test_id');
    }

    public function finalEvaluation(): HasOne
    {
        return $this->hasOne(FinalEvaluation::class, 'applicant_id', 'applicant_id')
                    ->latestOfMany('final_evaluation_id');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(ApplicantDocument::class, 'applicant_id', 'applicant_id');
    }

    /* ------------------------------------------------------------------ */
    /* Helpers                                                              */
    /* ------------------------------------------------------------------ */

    /**
     * Generate the next applicant_code in the sequence APL-XXXXX.
     *
     * Uses the HIGHEST existing code number (not the last row's code) so
     * seeded/imported records with high codes can never cause a duplicate,
     * and retries forward until an unused code is found.
     */
    public static function generateCode(): string
    {
        $max = (int) static::query()
            ->selectRaw("MAX(CAST(SUBSTRING(applicant_code, 5) AS UNSIGNED)) AS max_no")
            ->value('max_no');

        $next = $max + 1;
        while (static::where('applicant_code', 'APL-' . str_pad($next, 5, '0', STR_PAD_LEFT))->exists()) {
            $next++;
        }

        return 'APL-' . str_pad($next, 5, '0', STR_PAD_LEFT);
    }

    /* ------------------------------------------------------------------ */
    /* Offer workflow helpers                                                */
    /* ------------------------------------------------------------------ */

    /** Whole days remaining in the 7-day offer response window (0 when the
     *  window has already lapsed). Null when no offer was sent. */
    public function offerDaysLeft(): ?int
    {
        if ($this->offer_expires_at === null) {
            return null;
        }

        $seconds = now()->diffInSeconds($this->offer_expires_at, false);

        return $seconds >= 0 ? (int) ceil($seconds / 86400) : 0;
    }

    /** True when a pending offer passed its 7-day response window. */
    public function offerResponseExpired(): bool
    {
        return $this->offer_status === 'Pending'
            && $this->offer_expires_at !== null
            && $this->offer_expires_at->isPast();
    }
}
