<?php

namespace Modules\ApplicantManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInterviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'applicant_id'            => ['required', 'integer', 'exists:applicants,applicant_id'],
            'scheduled_date'          => ['required', 'date'],
            'scheduled_time'          => ['required', 'date_format:H:i'],
            'scheduled_end_time'      => ['nullable', 'date_format:H:i'],
            'mode'                    => ['required', 'string', 'in:On-site,Virtual'],
            'facility_id'             => ['nullable', 'integer', 'exists:facilities,facility_id'],
            'interviewer_employee_id' => ['nullable', 'integer', 'exists:employees,employee_id'],
            'interviewer_name'        => ['nullable', 'string', 'max:160'],
            'zoom_meeting_id'         => ['nullable', 'string', 'max:64'],
            'zoom_join_url'           => ['nullable', 'string', 'max:2000'],
            'zoom_continue_url'       => ['nullable', 'string', 'max:2000'],
            'zoom_password'           => ['nullable', 'string', 'max:64'],
            'status'                  => ['sometimes', 'string', 'in:Scheduled,Completed,No Show'],
        ];
    }
}
