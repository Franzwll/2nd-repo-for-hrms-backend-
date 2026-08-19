<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JobPost extends Model
{
    protected $table = 'job_posts';
    protected $primaryKey = 'job_post_id';

    protected $fillable = [
        'slug',
        'title',
        'department_id',
        'position_id',
        'employment_type',
        'schedule',
        'salary_min',
        'salary_max',
        'vacancies',
        'filled_count',
        'posted_date',
        'status',
        'active',
        'experience_level',
        'education_level',
        'summary',
        'description',
        'responsibilities_json',
        'qualifications_json',
        'skills_json',
        'benefits_json',
    ];

    protected $casts = [
        'salary_min' => 'decimal:2',
        'salary_max' => 'decimal:2',
        'posted_date' => 'date',
        'active' => 'boolean',
        'responsibilities_json' => 'array',
        'qualifications_json' => 'array',
        'skills_json' => 'array',
        'benefits_json' => 'array',
    ];

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id', 'department_id');
    }

    public function position(): BelongsTo
    {
        return $this->belongsTo(Position::class, 'position_id', 'position_id');
    }

    public function applicants(): HasMany
    {
        return $this->hasMany(Applicant::class, 'job_post_id', 'job_post_id');
    }
}