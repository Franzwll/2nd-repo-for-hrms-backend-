<?php

namespace Modules\Auth\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'status' => $this->status,
            'role_id' => $this->role_id,
            'role' => $this->role?->role_name,
            'otp_enabled' => (bool) ($this->otp_enabled ?? true),
            'permissions' => $this->permissionMap(),
            'last_login_at' => $this->last_login_at?->toIso8601String(),
        ];
    }
}