<?php

namespace Modules\CoreHCM\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Employment record edit — see StoreEmployeeRequest for the ownership boundary.
 * Personal / 201-dossier fields are edited via the Employee Records dossier
 * endpoint.
 */
class UpdateEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $employee = $this->route('employee');

        return [
            'first_name' => ['sometimes', 'required', 'string', 'max:80'],
            'middle_name' => ['sometimes', 'nullable', 'string', 'max:80'],
            'last_name' => ['sometimes', 'required', 'string', 'max:80'],
            'email' => ['sometimes', 'required', 'email', 'max:190', Rule::unique('employees', 'email')->ignore($employee->employee_id, 'employee_id')],
            'department_id' => ['sometimes', 'required', 'integer', 'exists:departments,department_id'],
            'position_id' => ['sometimes', 'required', 'integer', 'exists:positions,position_id'],
            'supervisor_employee_id' => ['sometimes', 'nullable', 'integer', 'exists:employees,employee_id'],
            'employment_type' => ['sometimes', 'required', Rule::in(['Regular', 'Contractual', 'Probationary'])],
            'status' => ['sometimes', 'required', Rule::in(['Active', 'On Leave', 'Resigned', 'Retired', 'Terminated'])],
            'date_hired' => ['sometimes', 'required', 'date'],
            'salary_grade_id' => ['sometimes', 'nullable', 'integer', 'exists:salary_grades,salary_grade_id'],
            'salary_step' => ['sometimes', 'nullable', 'string', 'max:30'],
            'onboarding_complete' => ['sometimes', 'nullable', 'boolean'],
        ];
    }
}
