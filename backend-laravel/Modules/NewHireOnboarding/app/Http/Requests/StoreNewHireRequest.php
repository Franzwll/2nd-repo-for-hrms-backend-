<?php

namespace Modules\NewHireOnboarding\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
            // Applicants already carry a job post, so position/department can
            // be derived by the controller. Direct hires must name both once
            // they are past Pre-onboarding; otherwise no Core HCM employee can
            // be provisioned (the old behaviour left them off the org chart).
            'position_id'   => [
                'nullable',
                'integer',
                'exists:positions,position_id',
                Rule::requiredIf(fn () => $this->input('stage') !== 'Pre-onboarding'
                    && ! $this->filled('applicant_id')),
            ],
            'department_id' => [
                'nullable',
                'integer',
                'exists:departments,department_id',
                Rule::requiredIf(fn () => $this->input('stage') !== 'Pre-onboarding'
                    && ! $this->filled('applicant_id')),
            ],
            'stage'         => ['required', 'string', 'in:Pre-onboarding,Probationary,Regular'],
            'start_date'    => ['required', 'date'],
        ];
    }
}
