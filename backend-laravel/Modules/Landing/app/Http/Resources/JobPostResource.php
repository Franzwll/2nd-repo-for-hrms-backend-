<?php

namespace Modules\Landing\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JobPostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $this->loadMissing('department', 'position');

        // Builder posts may persist JSON lists as encoded strings when the
        // model cast is bypassed (e.g. raw query / stale model). Normalize
        // every list here so the public careers page always gets arrays —
        // a raw string crashes the detail page's .map() render and trips the
        // root "This page didn't load" error boundary on new posts only.
        $asList = fn ($value): array => is_array($value)
            ? array_values($value)
            : (is_string($value) && ($decoded = json_decode($value, true)) !== null && is_array($decoded)
                ? array_values($decoded)
                : []);

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
            'responsibilities' => $asList($this->responsibilities_json),
            'qualifications' => $asList($this->qualifications_json),
            'skills' => $asList($this->skills_json),
            'additional' => $asList($this->additional_json ?? []),
            'instructions' => $this->instructions,
            'about' => $this->about,
            'benefits' => $asList($this->benefits_json),
            'picture' => $this->picture,
            'picture_url' => $this->picture
                ? $request->getSchemeAndHttpHost() . '/api/v1/job-posts/' . $this->job_post_id . '/picture'
                : $request->getSchemeAndHttpHost() . '/api/v1/job-posts/template-picture?title=' . urlencode($this->title),
        ];
    }
}