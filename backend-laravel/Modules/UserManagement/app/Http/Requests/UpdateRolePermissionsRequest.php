<?php

namespace Modules\UserManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRolePermissionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'permissions' => ['required', 'array'],
            'permissions.*.module_name' => ['required', 'string', 'max:100'],
            'permissions.*.permission_level' => ['required', Rule::in(['None', 'Read', 'Write', 'Full', 'View'])],
        ];
    }
}