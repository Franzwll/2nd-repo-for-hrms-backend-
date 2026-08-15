<?php

namespace Modules\Landing\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JobPostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $this->loadMissing('department', 'position');

        return [
            'job_post_id' => $this->job_post_id,
            'slug' => $this->slug,
            'title' => $this->title,
            'department_id' => $this->department_id,
            'department_name' => $this->department?->name,
            'position_title' => $this->position?->title,
            'employment_type' => $this->employment_type,
            'schedule' => $this->schedule,
            'salary_min' => $this->salary_min,
            'salary_max' => $this->salary_max,
            'vacancies' => $this->vacancies,
            'filled_count' => $this->filled_count,
            'posted_date' => $this->posted_date?->toDateString(),
            'experience_level' => $this->experience_level,
            'education_level' => $this->education_level,
            'summary' => $this->summary,
            'description' => $this->description,
            'responsibilities' => $this->responsibilities_json,
            'qualifications' => $this->qualifications_json,
            'skills' => $this->skills_json,
            'benefits' => $this->benefits_json,
        ];
    }
}