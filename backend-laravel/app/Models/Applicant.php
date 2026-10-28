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
        'archived_at' => 'datetime',
        'is_blocked' => 'boolean',
        'blocked_at' => 'datetime',
        'block_expires_at' => 'datetime',
    ];

    public function jobPost(): BelongsTo
    {
        /* Archived job posts stay visible on existing applicant records so
           their position title and department never disappear. */
        return $this->belongsTo(JobPost::class, 'job_post_id', 'job_post_id')->withTrashed();
    }

    public function isBlocked(): bool
    {
        if (! $this->is_blocked) {
            return false;
        }

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
}
