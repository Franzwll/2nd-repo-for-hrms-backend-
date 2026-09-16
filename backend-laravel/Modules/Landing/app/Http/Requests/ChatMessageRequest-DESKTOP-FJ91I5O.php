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
            'message' => ['required', 'string', 'max:2000'],
            'session_id' => ['nullable', 'string', 'max:80'],
            'topic' => ['nullable', 'string', 'max:160'],
            'role' => ['nullable', 'string', 'in:guest,applicant,employee,admin,superadmin'],
            'history' => ['nullable', 'array', 'max:24'],
            'history.*.role' => ['nullable', 'string', 'in:user,model'],
            'history.*.text' => ['nullable', 'string', 'max:2000'],
        ];
    }
}