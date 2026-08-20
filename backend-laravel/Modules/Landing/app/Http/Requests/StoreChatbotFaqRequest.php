<?php

namespace Modules\Landing\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreChatbotFaqRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'question' => ['required', 'string', 'max:255'],
            'answer' => ['required', 'string', 'max:2000'],
            'keywords' => ['nullable', 'string', 'max:500'],
            'enabled' => ['sometimes', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}