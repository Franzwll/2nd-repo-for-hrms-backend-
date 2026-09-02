<?php

namespace Modules\NewHireOnboarding\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateNewHireRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'employee_id'   => ['nullable', 'integer', 'exists:employees,employee_id'],
            'name'          => ['sometimes', 'string', 'max:160'],
            'email'         => ['nullable', 'email', 'max:190'],
            'phone'         => ['nullable', 'string', 'max:40'],
            'position_id'   => ['nullable', 'integer', 'exists:positions,position_id'],
            'department_id' => ['nullable', 'integer', 'exists:departments,department_id'],
            'stage'         => ['sometimes', 'string', 'in:Pre-onboarding,Probationary,Regular'],
            'start_date'    => ['sometimes', 'date'],
            // When HR requested the probationary performance evaluation.
            // Null clears the pending request (cancelled / completed / regularized).
            'evaluation_requested_at' => ['nullable', 'date'],
        ];
    }
}
