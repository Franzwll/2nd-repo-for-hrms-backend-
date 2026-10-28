<?php

namespace Modules\Auth\Http\Requests;

use App\Services\SecurityPolicy;
use Illuminate\Foundation\Http\FormRequest;

class ResetPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'token' => ['required', 'string'],
            'password' => [...SecurityPolicy::passwordRules(), 'confirmed'],
        ];
    }
}