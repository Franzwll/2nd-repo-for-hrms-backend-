<?php

namespace Modules\UserManagement\Http\Requests;

use App\Models\RolePermission;
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
        $knownModules = RolePermission::query()
            ->select('module_name')
            ->distinct()
            ->pluck('module_name')
            ->all();

        return [
            'permissions' => ['required', 'array'],
            'permissions.*.module_name' => ['required', 'string', 'max:100', Rule::in($knownModules)],
            'permissions.*.permission_level' => ['required', Rule::in(['None', 'Read', 'Write', 'Full', 'View'])],
        ];
    }
}