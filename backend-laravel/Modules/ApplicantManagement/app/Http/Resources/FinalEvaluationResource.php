<?php

namespace Modules\ApplicantManagement\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FinalEvaluationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $applicant = $this->whenLoaded('applicant');

        return [
            'final_evaluation_id'      => $this->final_evaluation_id,
            'applicant_id'             => $this->applicant_id,
            'evaluated_by_user_id'     => $this->evaluated_by_user_id,
            'evaluation_date'          => $this->evaluation_date?->toDateString(),
            // Snapshot of every preceding stage (preview material)
            'screening_score'          => $this->screening_score !== null ? (float) $this->screening_score : null,
            'screening_status'         => $this->screening_status,
            'interview_score'          => $this->interview_score !== null ? (float) $this->interview_score : null,
            'interview_result'         => $this->interview_result,
            'assessment_test_score'    => $this->assessment_test_score !== null ? (float) $this->assessment_test_score : null,
            'assessment_test_result'   => $this->assessment_test_result,
            'practical_required'       => (bool) $this->practical_required,
            'practical_test_score'     => $this->practical_test_score !== null ? (float) $this->practical_test_score : null,
            'practical_test_result'    => $this->practical_test_result,
            'recommendation'           => $this->recommendation,
            'overall_remarks'          => $this->overall_remarks,
            'created_at'               => $this->created_at?->toISOString(),
            'updated_at'               => $this->updated_at?->toISOString(),
            'applicant'                => $applicant ? [
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
