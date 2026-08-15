<?php

namespace Modules\ApplicantManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateInterviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'scheduled_date'          => ['sometimes', 'date'],
            'scheduled_time'          => ['sometimes', 'date_format:H:i'],
            'mode'                    => ['sometimes', 'string', 'in:On-site,Virtual'],
            'interviewer_employee_id' => ['nullable', 'integer', 'exists:employees,employee_id'],
            'interviewer_name'        => ['nullable', 'string', 'max:160'],
            'status'                  => ['sometimes', 'string', 'in:Scheduled,Completed,No Show'],
        ];
    }
}
