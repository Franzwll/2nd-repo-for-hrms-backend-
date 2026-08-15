<?php

namespace Modules\CoreHCM\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDepartmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $department = $this->route('department');

        return [
            'code' => ['required', 'string', 'max:20', Rule::unique('departments', 'code')->ignore($department->department_id, 'department_id')],
            'name' => ['required', 'string', 'max:120', Rule::unique('departments', 'name')->ignore($department->department_id, 'department_id')],
            'description' => ['nullable', 'string', 'max:255'],
            'head_employee_id' => ['nullable', 'integer', 'exists:employees,employee_id'],
            'budget' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}