<?php

namespace Modules\Settings\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BulkUpsertSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'settings'          => ['required', 'array', 'min:1'],
            'settings.*.key'    => ['required', 'string', 'max:120'],
            'settings.*.value'  => ['required'],
        ];
    }
}
