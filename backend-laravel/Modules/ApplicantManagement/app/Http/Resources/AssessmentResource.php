<?php

namespace Modules\ApplicantManagement\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\MissingValue;

class AssessmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $applicant = $this->whenLoaded('applicant');
        $applicantData = $applicant instanceof MissingValue || ! $applicant ? null : [
            'applicant_id'   => $applicant->applicant_id,
            'applicant_code' => $applicant->applicant_code,
            'name'           => $applicant->name,
            'position'       => $applicant->jobPost?->title,
            'department'     => $applicant->jobPost?->department?->name,
            'stage'          => $applicant->stage,
        ];

        return [
            'assessment_id'    => $this->assessment_id,
            'applicant_id'     => $this->applicant_id,
            'assessor_user_id' => $this->assessor_user_id,
            'assessment_date'  => $this->assessment_date?->toDateString(),
            'scores_json'      => $this->scores_json ?? [],
            'comments_json'    => $this->comments_json ?? [],
            'total_score'      => $this->total_score !== null ? (float) $this->total_score : null,
            'outcome'          => $this->outcome,
            'result'           => $this->result,
            'remarks'          => $this->remarks,
            'created_at'       => $this->created_at?->toISOString(),
            'updated_at'       => $this->updated_at?->toISOString(),
            'applicant'        => $applicantData,
        ];
    }
}
