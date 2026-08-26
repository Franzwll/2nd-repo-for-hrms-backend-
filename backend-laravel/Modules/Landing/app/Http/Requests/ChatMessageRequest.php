<?php

namespace Modules\Landing\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ChatMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'message' => ['required', 'string', 'max:500'],
            'session_id' => ['nullable', 'string', 'max:80'],
            'topic' => ['nullable', 'string', 'max:160'],
        ];
    }
}