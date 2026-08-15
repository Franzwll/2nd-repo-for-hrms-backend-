<?php

namespace Modules\CoreHCM\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EmployeeLifecycleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'effective_date' => ['required', 'date'],
            'new_position_id' => ['required_if:action,promote', 'integer', 'exists:positions,position_id'],
            'new_department_id' => ['nullable', 'integer', 'exists:departments,department_id'],
            'new_salary_grade_id' => ['nullable', 'integer', 'exists:salary_grades,salary_grade_id'],
            'notes' => ['nullable', 'string', 'max:255'],
            'exit_type' => ['required_if:action,exit', Rule::in(['Resigned', 'Terminated', 'Retired'])],
            'exit_date' => ['required_if:action,exit', 'date'],
            'clearance_status' => ['nullable', Rule::in(['Pending', 'Cleared', 'Partial'])],
            'coe_status' => ['nullable', Rule::in(['Pending', 'Issued', 'Declined'])],
        ];
    }
}