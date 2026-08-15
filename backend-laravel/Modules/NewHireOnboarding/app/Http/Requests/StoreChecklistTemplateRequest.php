<?php

namespace Modules\NewHireOnboarding\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreChecklistTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'               => ['required', 'string', 'max:200'],
            'phase'               => ['required', 'string', 'in:Pre-onboarding,Onboarding,Probationary,Regular'],
            'position_scope_json' => ['nullable', 'array'],
            'status'              => ['sometimes', 'string', 'in:Active,Inactive'],
            'items'               => ['nullable', 'array'],
            'items.*.item_text'   => ['required_with:items', 'string'],
            'items.*.sort_order'  => ['required_with:items', 'integer', 'min:0'],
        ];
    }
}
