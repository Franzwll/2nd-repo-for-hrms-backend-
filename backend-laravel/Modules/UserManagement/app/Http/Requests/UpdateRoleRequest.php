<?php

namespace Modules\UserManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $role = $this->route('role');

        return [
            'role_name' => ['required', 'string', 'max:50', Rule::unique('system_roles', 'role_name')->ignore($role->role_id, 'role_id')],
            'description' => ['nullable', 'string', 'max:255'],
        ];
    }
}