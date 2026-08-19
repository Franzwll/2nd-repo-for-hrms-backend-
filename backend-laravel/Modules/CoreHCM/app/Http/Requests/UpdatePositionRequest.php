<?php

namespace Modules\CoreHCM\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePositionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $position = $this->route('position');

        return [
            'position_code' => ['required', 'string', 'max:20', Rule::unique('positions', 'position_code')->ignore($position->position_id, 'position_id')],
            'title' => ['required', 'string', 'max:120'],
            'department_id' => ['required', 'integer', 'exists:departments,department_id'],
            'salary_grade_id' => ['required', 'integer', 'exists:salary_grades,salary_grade_id'],
            'level' => ['nullable', 'string', 'max:50'],
            'headcount' => ['required', 'integer', 'min:1'],
        ];
    }
}