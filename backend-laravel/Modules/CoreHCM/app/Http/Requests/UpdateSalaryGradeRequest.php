<?php

namespace Modules\CoreHCM\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSalaryGradeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('salary_grade')?->salary_grade_id;

        return [
            'code' => ['required', 'string', 'max:20', Rule::unique('salary_grades', 'code')->ignore($id, 'salary_grade_id')],
            'title' => ['required', 'string', 'max:120'],
            'min_salary' => ['required', 'numeric', 'min:0'],
            'max_salary' => ['required', 'numeric', 'gt:min_salary'],
            'currency_code' => ['nullable', 'string', 'size:3'],
            'level' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }
}