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
                                    ? 'storage/resumes/' . basename($this->resume_file_path)
                                    : null,
            'resume_original_name' => $this->resume_original_name ?? ($this->resume_file_path ? basename($this->resume_file_path) : null),
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
            'latest_screening'    => $this->when($this->relationLoaded('latestScreening') && $this->latestScreening, fn () => [
                'screening_id'       => $this->latestScreening->screening_id,
                'processing_status'  => $this->latestScreening->processing_status,
                'screening_result'   => $this->latestScreening->screening_result,
                'match_score'        => $this->latestScreening->match_score !== null ? (float) $this->latestScreening->match_score : null,
                'score_breakdown'    => $this->latestScreening->score_breakdown_json,
                'profile'            => $this->latestScreening->profile_json,
                'missing_information'=> $this->latestScreening->missing_information_json ?? [],
                'validation'         => $this->latestScreening->validation_json,
                'alternative_job'    => $this->latestScreening->alternative_job_json,
                'reasons'            => $this->latestScreening->reasons_json ?? [],
                'model_info'         => $this->latestScreening->model_info_json,
                'error_message'      => $this->latestScreening->error_message,
                'processed_at'       => $this->latestScreening->processed_at?->toISOString(),
            ]),
            'interviews'          => InterviewResource::collection($this->whenLoaded('interviews')),
            'assessment'          => new AssessmentResource($this->whenLoaded('assessment')),
        ];
    }
}
