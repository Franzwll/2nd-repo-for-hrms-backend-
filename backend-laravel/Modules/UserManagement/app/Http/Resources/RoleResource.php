<?php

namespace Modules\UserManagement\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $this->loadMissing('permissions');

        return [
            'role_id' => $this->role_id,
            'role_name' => $this->role_name,
            'description' => $this->description,
            'is_super_admin' => $this->is_super_admin,
            'is_protected' => $this->is_protected,
            'user_count' => $this->whenCounted('users'),
            'permissions' => $this->permissions->map(fn ($p) => [
                'module_name' => $p->module_name,
                'permission_level' => $p->permission_level,
            ]),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}