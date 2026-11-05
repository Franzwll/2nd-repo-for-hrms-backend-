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
        'address',
        'applied_at',
        'fit_score',
        'status',
        'stage',
        'rejected_at',
        'cooldown_lifted_at',
        'archived_at',
        'archived_by',
        'archived_reason',
        'is_blocked',
        'blocked_at',
        'blocked_by',
        'blocked_reason',
        'block_scope',
        'block_expires_at',
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
        'archived_at'             => 'datetime',
        'is_blocked'              => 'boolean',
        'blocked_at'              => 'datetime',
        'block_expires_at'        => 'datetime',
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
        /* Archived job posts stay visible on existing applicant records so
           their position title and department never disappear. */
        return $this->belongsTo(
            \Modules\RecruitmentManagement\Models\JobPost::class,
            'job_post_id',
            'job_post_id'
        )->withTrashed();
    }

    public function getScreeningEntitiesAttribute(): \Illuminate\Support\Collection
    {
        $screening = $this->relationLoaded('latestScreening')
            ? $this->latestScreening
            : $this->latestScreening()->first();

        $entities = $screening?->entities_json ?? [];
        if (!is_array($entities)) {
            return collect();
        }

        return collect($entities)->values()->map(function ($e, $index) use ($screening) {
            return new ApplicantScreeningEntity([
                'entity_id'    => $e['entity_id'] ?? ($index + 1),
                'applicant_id' => $this->applicant_id,
                'label'        => $e['label'] ?? '',
                'value'        => $e['value'] ?? '',
                'created_at'   => $e['created_at'] ?? $screening?->created_at ?? $this->created_at,
            ]);
        });
    }

    public function getScreeningScoresAttribute(): \Illuminate\Support\Collection
    {
        $screening = $this->relationLoaded('latestScreening')
            ? $this->latestScreening
            : $this->latestScreening()->first();

        $scores = $screening?->score_breakdown_json ?? [];
        if (!is_array($scores)) {
            return collect();
        }

        $items = collect();
        $index = 1;

        foreach ($scores as $key => $val) {
            if (is_array($val) && isset($val['criterion'])) {
                $items->push(new ApplicantScreeningScore([
                    'score_id'     => $val['score_id'] ?? $index++,
                    'applicant_id' => $this->applicant_id,
                    'criterion'    => $val['criterion'],
                    'score'        => (float) ($val['score'] ?? $val['earned'] ?? 0),
                    'created_at'   => $val['created_at'] ?? $screening?->created_at ?? $this->created_at,
                ]));
            } elseif (is_array($val)) {
                $criterionName = ucfirst((string) $key);
                if (strtolower($key) === 'experience') {
                    $criterionName = 'Work Experience';
                } elseif (strtolower($key) === 'education') {
                    $criterionName = 'Educational Background';
                }
                $items->push(new ApplicantScreeningScore([
                    'score_id'     => $val['score_id'] ?? $index++,
                    'applicant_id' => $this->applicant_id,
                    'criterion'    => $criterionName,
                    'score'        => (float) ($val['earned'] ?? $val['score'] ?? 0),
                    'created_at'   => $val['created_at'] ?? $screening?->created_at ?? $this->created_at,
                ]));
            }
        }

        return $items;
    }

    public function screeningEntities(): \Illuminate\Support\Collection
    {
        return $this->getScreeningEntitiesAttribute();
    }

    public function screeningScores(): \Illuminate\Support\Collection
    {
        return $this->getScreeningScoresAttribute();
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
                    ->latestOfMany('evaluation_id');
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
                    ->latestOfMany('evaluation_id');
    }

    public function practicalTests(): HasMany
    {
        return $this->hasMany(PracticalTest::class, 'applicant_id', 'applicant_id');
    }

    public function latestPracticalTest(): HasOne
    {
        return $this->hasOne(PracticalTest::class, 'applicant_id', 'applicant_id')
                    ->latestOfMany('evaluation_id');
    }

    public function finalEvaluation(): HasOne
    {
        return $this->hasOne(FinalEvaluation::class, 'applicant_id', 'applicant_id')
                    ->latestOfMany('evaluation_id');
    }

    public function finalEvaluations(): HasMany
    {
        return $this->hasMany(FinalEvaluation::class, 'applicant_id', 'applicant_id');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(ApplicantDocument::class, 'applicant_id', 'applicant_id');
    }

    public function blockHistories(): HasMany
    {
        return $this->hasMany(ApplicantBlockHistory::class, 'target_id', 'applicant_id')
            ->orderByDesc('occurred_at');
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

    public function isBlocked(): bool
    {
        if (! $this->is_blocked) {
            return false;
        }

        // If an expiration was set, check if block has expired
        if ($this->block_expires_at !== null && $this->block_expires_at->isPast()) {
            return false;
        }

        return true;
    }

    public function isArchived(): bool
    {
        return $this->archived_at !== null;
    }

    public function getIsArchivedAttribute(): bool
    {
        return $this->isArchived();
    }

    public function getBlockReasonAttribute(): ?string
    {
        return $this->blocked_reason;
    }

    public function rejectedAtStage(): string
    {
        if ($this->offer_status !== null || $this->offer_sent_at !== null) {
            return 'Offer';
        }

        if ($this->finalEvaluations()->exists()) {
            return 'Final Evaluation';
        }

        if ($this->practicalTests()->exists()) {
            return 'Practical Test';
        }

        if ($this->assessmentTests()->exists()) {
            return 'Assessment Test';
        }

        if ($this->assessments()->exists()) {
            return 'Assessed';
        }

        if ($this->interviews()->exists()) {
            return 'Interview Scheduled';
        }

        return 'Screened';
    }

    public function allowedReturnStages(): array
    {
        $order = [
            'Screened'            => 0,
            'Accepted'            => 1,
            'Interview Scheduled' => 2,
            'Assessed'            => 3,
            'Assessment Test'     => 4,
            'Practical Test'      => 5,
            'Final Evaluation'    => 6,
            'Offer'               => 7,
            'Hired'               => 8,
        ];

        $active = ['Screened', 'Accepted', 'Interview Scheduled', 'Assessed', 'Assessment Test', 'Practical Test', 'Final Evaluation'];

        if ($this->stage === 'Rejected') {
            $failedStage = $this->rejectedAtStage();
            $maxAllowedStage = $failedStage === 'Assessed' ? 'Interview Scheduled' : $failedStage;
            $maxIndex = $order[$maxAllowedStage] ?? 0;

            $allowed = array_values(array_filter(
                $active,
                fn (string $s): bool => ($order[$s] ?? 99) <= $maxIndex,
            ));

            return $allowed !== [] ? $allowed : ['Screened'];
        }

        if (! isset($order[$this->stage])) {
            return [];
        }

        $currentIndex = $order[$this->stage];

        return array_values(array_filter(
            $active,
            fn (string $s): bool => ($order[$s] ?? 99) < $currentIndex,
        ));
    }
}
