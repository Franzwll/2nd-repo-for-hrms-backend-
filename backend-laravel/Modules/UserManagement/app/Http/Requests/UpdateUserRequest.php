<?php

namespace Modules\UserManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $user = $this->route('user');

        return [
            'username' => ['required', 'string', 'max:100', Rule::unique('system_users', 'username')->ignore($user->system_user_id, 'system_user_id')],
            'email' => ['required', 'email', 'max:190', Rule::unique('system_users', 'email')->ignore($user->system_user_id, 'system_user_id')],
            'password' => ['nullable', 'string', 'min:8'],
            'full_name' => ['nullable', 'string', 'max:160'],
            'department_name' => ['nullable', 'string', 'max:120'],
            'employee_id' => ['nullable', 'integer', 'exists:employees,employee_id'],
            'role_id' => ['required', 'integer', 'exists:system_roles,role_id'],
            'status' => ['required', Rule::in(['Active', 'Suspended', 'Inactive'])],
        ];
    }
}