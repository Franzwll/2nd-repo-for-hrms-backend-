<?php

namespace Modules\ApplicantManagement\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssessmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $applicant = $this->whenLoaded('applicant');

        return [
            'assessment_id'    => $this->assessment_id,
            'applicant_id'     => $this->applicant_id,
            'assessor_user_id' => $this->assessor_user_id,
            'assessment_date'  => $this->assessment_date?->toDateString(),
            'scores_json'      => $this->scores_json ?? [],
            'total_score'      => $this->total_score !== null ? (float) $this->total_score : null,
            'outcome'          => $this->outcome,
            'remarks'          => $this->remarks,
            'created_at'       => $this->created_at?->toISOString(),
            'updated_at'       => $this->updated_at?->toISOString(),
            'applicant'        => $applicant ? [
                'applicant_id'   => $applicant->applicant_id,
                'applicant_code' => $applicant->applicant_code,
                'name'           => $applicant->name,
                'position'       => $applicant->jobPost?->title,
                'department'     => $applicant->jobPost?->department?->name,
                'stage'          => $applicant->stage,
            ] : null,
        ];
    }
}
