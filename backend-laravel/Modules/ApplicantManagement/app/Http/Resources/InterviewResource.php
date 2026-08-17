<?php

namespace Modules\ApplicantManagement\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InterviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $applicant = $this->whenLoaded('applicant');

        return [
            'interview_id'            => $this->interview_id,
            'interview_code'          => $this->interview_code,
            'applicant_id'            => $this->applicant_id,
            'scheduled_date'          => $this->scheduled_date?->toDateString(),
            'scheduled_time'          => $this->scheduled_time,
            'mode'                    => $this->mode,
            'interviewer_employee_id' => $this->interviewer_employee_id,
            'interviewer_name'        => $this->interviewer_name,
            'status'                  => $this->status,
            'created_at'              => $this->created_at?->toISOString(),
            'updated_at'              => $this->updated_at?->toISOString(),
            'applicant'               => $applicant ? [
                'applicant_id'   => $applicant->applicant_id,
                'applicant_code' => $applicant->applicant_code,
                'name'           => $applicant->name,
                'email'          => $applicant->email,
                'phone'          => $applicant->phone,
                'position'       => $applicant->jobPost?->title,
                'department'     => $applicant->jobPost?->department?->name,
                'stage'          => $applicant->stage,
                'fit_score'      => $applicant->fit_score !== null ? (float) $applicant->fit_score : null,
            ] : null,
        ];
    }
}
