<?php

namespace Modules\CoreHCM\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
            'first_name' => ['required', 'string', 'max:80'],
            'middle_name' => ['nullable', 'string', 'max:80'],
            'last_name' => ['required', 'string', 'max:80'],
            'email' => ['required', 'email', 'max:190', Rule::unique('employees', 'email')->ignore($employee->employee_id, 'employee_id')],
            'personal_email' => ['nullable', 'email', 'max:190'],
            'phone' => ['nullable', 'string', 'max:40'],
            'address' => ['nullable', 'string', 'max:255'],
            'birth_date' => ['nullable', 'date', 'before:today'],
            'gender' => ['nullable', Rule::in(['Male', 'Female', 'Other'])],
            'civil_status' => ['nullable', 'string', 'max:20'],
            'nationality' => ['nullable', 'string', 'max:60'],
            'sss_number' => ['nullable', 'string', 'max:30'],
            'philhealth_number' => ['nullable', 'string', 'max:30'],
            'pagibig_number' => ['nullable', 'string', 'max:30'],
            'tin_number' => ['nullable', 'string', 'max:30'],
            'department_id' => ['required', 'integer', 'exists:departments,department_id'],
            'position_id' => ['required', 'integer', 'exists:positions,position_id'],
            'supervisor_employee_id' => ['nullable', 'integer', 'exists:employees,employee_id'],
            'employment_type' => ['required', Rule::in(['Regular', 'Contractual', 'Probationary'])],
            'status' => ['required', Rule::in(['Active', 'On Leave', 'Resigned', 'Terminated'])],
            'date_hired' => ['required', 'date'],
            'salary_grade_id' => ['nullable', 'integer', 'exists:salary_grades,salary_grade_id'],
            'salary_step' => ['nullable', 'string', 'max:30'],
        ];
    }
}