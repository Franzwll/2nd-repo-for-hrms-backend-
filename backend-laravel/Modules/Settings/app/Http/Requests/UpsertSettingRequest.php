<?php

namespace Modules\Settings\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpsertSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'setting_value' => ['required'],
        ];
    }
}
