<?php

namespace Modules\RecruitmentManagement\Models;

use App\Models\Department;
use App\Models\Position;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Modules\ApplicantManagement\Models\Applicant;

class JobPost extends Model
{
    use SoftDeletes;

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
        'experience_levels',
        'education_levels',
        'summary',
        'description',
        'responsibilities_json',
        'qualifications_json',
        'skills_json',
        'additional_json',
        'instructions',
        'about',
        'picture',
        'blocks_json',
        'requires_practical',
        'requires_assessment',
    ];

    protected $casts = [
        'responsibilities_json' => 'array',
        'qualifications_json' => 'array',
        'skills_json' => 'array',
        'additional_json' => 'array',
        'blocks_json' => 'array',
        /* Accepted screening levels ("any of these"). The scalar
           education_level / experience_level keep holding the weakest one. */
        'education_levels' => 'array',
        'experience_levels' => 'array',
        'active' => 'boolean',
        'requires_practical' => 'boolean',
        'requires_assessment' => 'boolean',
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
    /* Vacancy helpers */
    /* ------------------------------------------------------------------ */

    public function remainingSlots(): int
    {
        return max(0, (int) ($this->vacancies ?? 0) - (int) ($this->filled_count ?? 0));
    }

    public function scopeOpen($query)
    {
        return $query->whereIn('status', ['published', 'Open'])
            ->where('active', 1)
            ->whereRaw('COALESCE(vacancies, 1) - COALESCE(filled_count, 0) > 0');
    }

    /** Fill one slot; auto-closes the post when slots reach 0. */
    public function fillOneSlot(): void
    {
        $this->increment('filled_count');
        $this->refresh();
        if ($this->remainingSlots() <= 0 && in_array($this->status, ['published', 'Open'])) {
            $this->update(['status' => 'Closed', 'active' => 0]);
        }
    }

    /**
     * Release one filled slot — used when a Super Admin returns a Hired
     * applicant to the recruitment pipeline. Mirrors fillOneSlot(): the
     * counter never drops below zero, and a post that was auto-closed by the
     * hire becomes open again as soon as it has a vacancy.
     */
    public function releaseOneSlot(): void
    {
        if ($this->trashed() || (int) ($this->filled_count ?? 0) <= 0) {
            return;
        }

        $this->decrement('filled_count');
        $this->refresh();

        if ($this->remainingSlots() > 0 && $this->status === 'Closed') {
            $this->update(['status' => 'published', 'active' => 1]);
        }
    }

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
        /* Archived posts still own their unique slug, so include them here;
           otherwise a replacement post would collide on the slug index. */
        while (static::withTrashed()->where('slug', $slug)
            ->when($exceptId !== null, fn ($q) => $q->where('job_post_id', '!=', $exceptId))
            ->exists()) {
            $slug = "{$base}-{$i}";
            $i++;
        }

        return $slug;
    }
}
