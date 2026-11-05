<?php

namespace Modules\ApplicantManagement\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScreeningGroundTruth extends Model
{
    protected $table = 'applicant_screenings';

    protected $primaryKey = 'screening_id';

    protected $fillable = [
        'applicant_id',
        'job_post_id',
        'true_screening_result',
        'true_qualification_score',
        'true_missing_information_json',
        'true_unrecognized_skills_json',
        'ground_truth_notes',
        'ground_truth_recorded_at',
        'notes',
    ];

    protected $casts = [
        'true_missing_information_json' => 'array',
        'true_unrecognized_skills_json' => 'array',
        'true_qualification_score' => 'decimal:2',
        'ground_truth_recorded_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope('ground_truth', function (Builder $q) {
            $q->whereNotNull('true_screening_result');
        });
    }

    public function getNotesAttribute(): ?string
    {
        return $this->ground_truth_notes;
    }

    public function setNotesAttribute(?string $value): void
    {
        $this->ground_truth_notes = $value;
    }

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class, 'applicant_id', 'applicant_id');
    }
}
