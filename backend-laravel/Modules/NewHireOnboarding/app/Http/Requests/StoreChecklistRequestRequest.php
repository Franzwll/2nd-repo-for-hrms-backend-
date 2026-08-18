<?php

namespace Modules\NewHireOnboarding\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreChecklistRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'employee_id'           => ['required', 'integer', 'exists:employees,employee_id'],
            'template_id'           => ['nullable', 'integer', 'exists:onboarding_checklist_templates,template_id'],
            'phase'                 => ['required', 'string', 'in:Pre-onboarding,Probationary,Regular'],
            'items_json'            => ['nullable', 'array'],
            'requested_by_user_id'  => ['nullable', 'integer'],
            'requested_at'          => ['required', 'date'],
        ];
    }
}
