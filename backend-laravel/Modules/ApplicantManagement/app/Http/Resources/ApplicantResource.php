<?php

namespace Modules\ApplicantManagement\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ApplicantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'applicant_id'    => $this->applicant_id,
            'applicant_code'  => $this->applicant_code,
            'job_post_id'     => $this->job_post_id,
            'name'            => $this->name,
            'email'           => $this->email,
            'phone'           => $this->phone,
            'applied_at'      => $this->applied_at?->toISOString(),
            'fit_score'       => $this->fit_score !== null ? (float) $this->fit_score : null,
            'status'          => $this->status,
            'stage'           => $this->stage,
            'source'          => $this->source,
            'summary'         => $this->summary,
            'flags_json'      => $this->flags_json ?? [],
            'resume_url'      => $this->resume_file_path
                                    ? url('storage/resumes/' . basename($this->resume_file_path))
                                    : null,
            'created_at'      => $this->created_at?->toISOString(),
            'updated_at'      => $this->updated_at?->toISOString(),

            /* Conditionally loaded relations */
            'job_post'            => $this->whenLoaded('jobPost', fn () => [
                'job_post_id' => $this->jobPost->job_post_id,
                'title'       => $this->jobPost->title,
                'department'  => optional($this->jobPost->department)->name,
            ]),
            'screening_entities'  => ScreeningEntityResource::collection($this->whenLoaded('screeningEntities')),
            'screening_scores'    => ScreeningScoreResource::collection($this->whenLoaded('screeningScores')),
            'interviews'          => InterviewResource::collection($this->whenLoaded('interviews')),
            'assessment'          => new AssessmentResource($this->whenLoaded('assessment')),
        ];
    }
}
