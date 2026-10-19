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
            /* Re-apply cooldown anchors — rejected_at starts the waiting
               period, cooldown_lifted_at records an HR early override. */
            'rejected_at'      => $this->rejected_at?->toISOString(),
            'cooldown_lifted_at' => $this->cooldown_lifted_at?->toISOString(),
            /* Offer workflow — set when the final evaluation decision emails
               the applicant an offer (7-day response window) and the reply is
               recorded by HR. */
            'offer_status'     => $this->offer_status,
            'offer_sent_at'    => $this->offer_sent_at?->toISOString(),
            'offer_expires_at' => $this->offer_expires_at?->toISOString(),
            'offer_start_date' => $this->offer_start_date?->toDateString(),
            /* How the reply came in (Email / SMS / Call / In person) and who
               recorded it — there is no applicant portal, so HR logs it. */
            'offer_response_channel'     => $this->offer_response_channel,
            'offer_response_note'        => $this->offer_response_note,
            'offer_responded_at'         => $this->offer_responded_at?->toISOString(),
            'offer_response_recorded_by' => $this->offer_response_recorded_by,
            'offer_days_left'  => $this->offerDaysLeft(),
            'source'          => $this->source,
            'summary'         => $this->summary,
            'flags_json'      => $this->flags_json ?? [],
            'resume_url'      => $this->resume_file_path
                                    ? 'storage/resumes/' . basename($this->resume_file_path)
                                    : null,
            'resume_original_name' => $this->resume_original_name ?? ($this->resume_file_path ? basename($this->resume_file_path) : null),
            /* Number of uploaded supporting documents (COE / Certificate /
               Credential / Others) — 0 when the count was not loaded. */
            'documents_count'   => (int) ($this->documents_count ?? 0),
            'created_at'      => $this->created_at?->toISOString(),
            'updated_at'      => $this->updated_at?->toISOString(),

            /* Conditionally loaded relations */
            'job_post'            => $this->whenLoaded('jobPost', fn () => [
                'job_post_id' => $this->jobPost->job_post_id,
                'title'       => $this->jobPost->title,
                'department'  => optional($this->jobPost->department)->name,
                /* Whether this position takes a practical assessment — Core HCM
                   position flag (owner); the UI uses it so the practical stage
                   is only offered when the API will accept the record. */
                'requires_practical' => \Modules\ApplicantManagement\Services\PracticalRequirement::required(
                    $this->jobPost,
                    $this->jobPost->title,
                    $this->jobPost->position,
                ),
                /* Whether this position takes an assessment test — Core HCM
                   position flag (owner); legacy job-post flag is fallback. */
                'requires_assessment' => \Modules\ApplicantManagement\Services\AssessmentRequirement::required(
                    $this->jobPost,
                    null,
                    $this->jobPost->position,
                ),
            ]),
            'screening_entities'  => ScreeningEntityResource::collection($this->whenLoaded('screeningEntities')),
            'screening_scores'    => ScreeningScoreResource::collection($this->whenLoaded('screeningScores')),
            'latest_screening'    => $this->when($this->relationLoaded('latestScreening') && $this->latestScreening, fn () => [
                'screening_id'       => $this->latestScreening->screening_id,
                'processing_status'  => $this->latestScreening->processing_status,
                'screening_result'   => $this->latestScreening->screening_result,
                'match_score'        => $this->latestScreening->match_score !== null ? (float) $this->latestScreening->match_score : null,
                /* Resume-only score before the supporting-document evidence was
                   blended into match_score (the ranking percentage). */
                'resume_match_score' => $this->latestScreening->resume_match_score !== null
                                            ? (float) $this->latestScreening->resume_match_score
                                            : null,
                /* Supporting-document evidence behind the ranking score:
                   documents score, verified / discrepancy / unable counts,
                   applied penalty, flags and the per-document breakdown. */
                'document_verification' => $this->latestScreening->document_verification_json,
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
            'documents'           => ApplicantDocumentResource::collection($this->whenLoaded('documents')),
        ];
    }
}
