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
            'mode'                    => ['required', 'string', 'in:On-site,Virtual'],
            'interviewer_employee_id' => ['nullable', 'integer', 'exists:employees,employee_id'],
            'interviewer_name'        => ['nullable', 'string', 'max:160'],
            'status'                  => ['sometimes', 'string', 'in:Scheduled,Completed,No Show'],
        ];
    }
}
