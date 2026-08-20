<?php

namespace Modules\RecruitmentManagement\Models;

use App\Models\Department;
use App\Models\Position;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;
use Modules\ApplicantManagement\Models\Applicant;

class JobPost extends Model
{
    protected $table = 'job_posts';

    protected $primaryKey = 'job_post_id';

    protected static function booted(): void
    {
        static::creating(function (JobPost $jobPost) {
            $jobPost->deriveTitleAndSlugFromPosition();
        });

        static::updating(function (JobPost $jobPost) {
            if ($jobPost->isDirty('position_id')) {
                $jobPost->deriveTitleAndSlugFromPosition();
            }
        });
    }

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
        'picture',
    ];

    protected $casts = [
        'responsibilities_json' => 'array',
        'qualifications_json' => 'array',
        'skills_json' => 'array',
        'benefits_json' => 'array',
        'active' => 'boolean',
        'salary_min' => 'decimal:2',
        'salary_max' => 'decimal:2',
        'posted_date' => 'date',
    ];

    /* ------------------------------------------------------------------ */
    /* Relationships */
    /* ------------------------------------------------------------------ */

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id', 'department_id');
    }

    public function position(): BelongsTo
    {
        return $this->belongsTo(Position::class, 'position_id', 'position_id');
    }

    public function platforms(): HasMany
    {
        return $this->hasMany(JobPostPlatform::class, 'job_post_id', 'job_post_id');
    }

    public function applicants(): HasMany
    {
        return $this->hasMany(
            Applicant::class,
            'job_post_id',
            'job_post_id'
        );
    }

    /* ------------------------------------------------------------------ */
    /* Helpers */
    /* ------------------------------------------------------------------ */

    /**
     * title and slug always refer to the linked Core HR position title,
     * so job posts can never drift out of sync with the position.
     */
    private function deriveTitleAndSlugFromPosition(): void
    {
        $position = $this->position()->first();
        if (! $position) {
            return;
        }
        $this->title = $position->title;
        $this->slug = static::generateSlug($position->title, $this->job_post_id);
    }

    public static function generateSlug(string $title, ?int $exceptId = null): string
    {
        $base = Str::slug($title);
        $slug = $base;
        $i = 1;
        while (static::where('slug', $slug)
            ->when($exceptId !== null, fn ($q) => $q->where('job_post_id', '!=', $exceptId))
            ->exists()) {
            $slug = "{$base}-{$i}";
            $i++;
        }

        return $slug;
    }
}
