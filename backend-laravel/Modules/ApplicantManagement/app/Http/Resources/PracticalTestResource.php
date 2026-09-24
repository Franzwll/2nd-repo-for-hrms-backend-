<?php

namespace Modules\ApplicantManagement\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PracticalTestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $applicant = $this->whenLoaded('applicant');

        return [
            'practical_test_id' => $this->practical_test_id,
            'applicant_id'      => $this->applicant_id,
            'assessor_user_id'  => $this->assessor_user_id,
            'task_title'        => $this->task_title,
            'criteria_json'     => $this->criteria_json ?? [],
            'scores_json'       => $this->scores_json ?? [],
            'total_score'       => $this->total_score !== null ? (float) $this->total_score : null,
            'result'            => $this->result,
            'test_date'         => $this->test_date?->toDateString(),
            'remarks'           => $this->remarks,
            'created_at'        => $this->created_at?->toISOString(),
            'updated_at'        => $this->updated_at?->toISOString(),
            'applicant'         => $applicant ? [
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
