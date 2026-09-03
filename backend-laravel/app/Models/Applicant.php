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
        'source',
        'resume_file_path',
        'resume_original_name',
        'summary',
        'flags_json',
    ];

    protected $casts = [
        'applied_at' => 'datetime',
        'fit_score' => 'decimal:2',
        'flags_json' => 'array',
    ];

    public function jobPost(): BelongsTo
    {
        return $this->belongsTo(JobPost::class, 'job_post_id', 'job_post_id');
    }
}