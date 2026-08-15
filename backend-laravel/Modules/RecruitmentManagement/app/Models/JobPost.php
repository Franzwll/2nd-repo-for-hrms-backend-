<?php

namespace Modules\RecruitmentManagement\Models;

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
        'responsibilities_json' => 'array',
        'qualifications_json'   => 'array',
        'skills_json'           => 'array',
        'benefits_json'         => 'array',
        'active'                => 'boolean',
        'salary_min'            => 'decimal:2',
        'salary_max'            => 'decimal:2',
        'posted_date'           => 'date',
    ];

    /* ------------------------------------------------------------------ */
    /* Relationships                                                         */
    /* ------------------------------------------------------------------ */

    public function department(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Department::class, 'department_id', 'department_id');
    }

    public function position(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Position::class, 'position_id', 'position_id');
    }

    public function platforms(): HasMany
    {
        return $this->hasMany(JobPostPlatform::class, 'job_post_id', 'job_post_id');
    }

    public function applicants(): HasMany
    {
        return $this->hasMany(
            \Modules\ApplicantManagement\Models\Applicant::class,
            'job_post_id',
            'job_post_id'
        );
    }

    /* ------------------------------------------------------------------ */
    /* Helpers                                                              */
    /* ------------------------------------------------------------------ */

    public static function generateSlug(string $title): string
    {
        $base = \Illuminate\Support\Str::slug($title);
        $slug = $base;
        $i    = 1;
        while (static::where('slug', $slug)->exists()) {
            $slug = "{$base}-{$i}";
            $i++;
        }
        return $slug;
    }
}
