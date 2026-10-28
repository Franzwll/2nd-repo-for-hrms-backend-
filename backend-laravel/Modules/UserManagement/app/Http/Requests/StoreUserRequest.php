<?php

namespace Modules\UserManagement\Http\Requests;

use App\Services\SecurityPolicy;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'username' => ['required', 'string', 'max:100', Rule::unique('system_users', 'username')],
            'email' => ['required', 'email', 'max:190', Rule::unique('system_users', 'email')],
            'password' => SecurityPolicy::passwordRules(),
            'full_name' => ['nullable', 'string', 'max:160'],
            'department_name' => ['nullable', 'string', 'max:120'],
            'employee_id' => ['nullable', 'integer', 'exists:employees,employee_id'],
            'role_id' => ['required', 'integer', 'exists:system_roles,role_id'],
            'status' => ['sometimes', Rule::in(['Active', 'Suspended', 'Inactive'])],
        ];
    }
}