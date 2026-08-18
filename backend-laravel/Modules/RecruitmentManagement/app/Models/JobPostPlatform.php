<?php

namespace Modules\RecruitmentManagement\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobPostPlatform extends Model
{
    protected $table = 'job_post_platforms';
    protected $primaryKey = 'job_post_platform_id';

    public $timestamps = false; // only created_at in schema

    protected $casts = [
        'created_at'   => 'datetime',
        'published_at' => 'datetime',
    ];

    protected $fillable = [
        'job_post_id',
        'platform',
        'published_at',
        'status',
    ];

    public function jobPost(): BelongsTo
    {
        return $this->belongsTo(JobPost::class, 'job_post_id', 'job_post_id');
    }
}
