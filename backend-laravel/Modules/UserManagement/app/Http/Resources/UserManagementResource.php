<?php

namespace Modules\UserManagement\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserManagementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $this->loadMissing('role', 'permissions');

        return [
            'system_user_id' => $this->system_user_id,
            'username' => $this->username,
            'email' => $this->email,
            'full_name' => $this->full_name,
            'department_name' => $this->department_name,
            'employee_id' => $this->employee_id,
            'role_id' => $this->role_id,
            'role' => $this->role?->role_name,
            'status' => $this->status,
            'last_login_at' => $this->last_login_at?->toIso8601String(),
            'last_login_ip' => $this->last_login_ip,
            'permissions' => $this->permissionMap(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}