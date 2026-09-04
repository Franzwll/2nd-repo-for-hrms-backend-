<?php

namespace Modules\RecruitmentManagement\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JobPostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'job_post_id'           => $this->job_post_id,
            'slug'                  => $this->slug,
            'title'                 => $this->title,
            'department_id'         => $this->department_id,
            'department'            => $this->whenLoaded('department', fn () => $this->department->name),
            'position_id'           => $this->position_id,
            'employment_type'       => $this->employment_type,
            'schedule'              => $this->schedule,
            'salary_min'            => $this->salary_min !== null ? (float) $this->salary_min : null,
            'salary_max'            => $this->salary_max !== null ? (float) $this->salary_max : null,
            'vacancies'             => (int) $this->vacancies,
            'filled_count'          => (int) $this->filled_count,
            'posted_date'           => $this->posted_date?->toDateString(),
            'status'                => $this->status,
            'active'                => (bool) $this->active,
            'experience_level'      => $this->experience_level,
            'education_level'       => $this->education_level,
            'summary'               => $this->summary,
            'description'           => $this->description,
            'responsibilities'      => $this->responsibilities_json ?? [],
            'qualifications'        => $this->qualifications_json ?? [],
            'skills'                => $this->skills_json ?? [],
            'platforms'             => $this->whenLoaded('platforms',
                fn () => $this->platforms->where('status', 'published')->pluck('platform')->values()
            ),
            'picture'               => $this->picture,
            'picture_url'           => $this->picture
                ? $request->getSchemeAndHttpHost() . '/api/v1/job-posts/' . $this->job_post_id . '/picture'
                : null,
            'applicants_count'      => $this->whenLoaded('applicants', fn () => $this->applicants->count()),
            'created_at'            => $this->created_at?->toISOString(),
            'updated_at'            => $this->updated_at?->toISOString(),
        ];
    }
}
