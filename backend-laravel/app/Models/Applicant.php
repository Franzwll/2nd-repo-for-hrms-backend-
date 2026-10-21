<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
        'source',
        'resume_file_path',
        'resume_original_name',
        'resume_hash',
        'summary',
        'flags_json',
    ];

    protected $casts = [
        'applied_at' => 'datetime',
        'fit_score' => 'decimal:2',
        'flags_json' => 'array',
        'rejected_at' => 'datetime',
        'cooldown_lifted_at' => 'datetime',
    ];

    public function jobPost(): BelongsTo
    {
        /* Archived job posts stay visible on existing applicant records so
           their position title and department never disappear. */
        return $this->belongsTo(JobPost::class, 'job_post_id', 'job_post_id')->withTrashed();
    }
}