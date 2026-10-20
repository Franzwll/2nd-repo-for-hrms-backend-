<?php

namespace Modules\CoreHCM\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Core HCM owns the *employment* record only. Personal / 201-dossier fields
 * (birth date, gender, government IDs, personal contact details, emergency
 * contacts) belong to Employee Records and are written through the ERM dossier
 * endpoint — not here.
 */
class StoreEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:80'],
            'middle_name' => ['nullable', 'string', 'max:80'],
            'last_name' => ['required', 'string', 'max:80'],
            'email' => ['required', 'email', 'max:190', Rule::unique('employees', 'email')],
            'department_id' => ['required', 'integer', 'exists:departments,department_id'],
            'position_id' => ['required', 'integer', 'exists:positions,position_id'],
            'supervisor_employee_id' => ['nullable', 'integer', 'exists:employees,employee_id'],
            'employment_type' => ['required', Rule::in(['Regular', 'Contractual', 'Probationary'])],
            'status' => ['required', Rule::in(['Active', 'On Leave', 'Resigned', 'Terminated'])],
            'date_hired' => ['required', 'date'],
            'salary_grade_id' => ['nullable', 'integer', 'exists:salary_grades,salary_grade_id'],
            'salary_step' => ['nullable', 'string', 'max:30'],
            'onboarding_complete' => ['nullable', 'boolean'],
        ];
    }
}
