<?php

namespace Modules\NewHireOnboarding\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreNewHireRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'applicant_id'  => ['nullable', 'integer', 'exists:applicants,applicant_id'],
            'employee_id'   => ['nullable', 'integer', 'exists:employees,employee_id'],
            'name'          => ['required', 'string', 'max:160'],
            'email'         => ['nullable', 'email', 'max:190'],
            'phone'         => ['nullable', 'string', 'max:40'],
            'position_id'   => ['nullable', 'integer', 'exists:positions,position_id'],
            'department_id' => ['nullable', 'integer', 'exists:departments,department_id'],
            'stage'         => ['required', 'string', 'in:Pre-onboarding,Probationary,Regular'],
            'start_date'    => ['required', 'date'],
        ];
    }
}
