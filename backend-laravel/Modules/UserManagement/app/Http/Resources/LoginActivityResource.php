<?php

namespace Modules\UserManagement\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LoginActivityResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'login_activity_id' => $this->login_activity_id,
            'system_user_id' => $this->system_user_id,
            'login_at' => $this->login_at?->toIso8601String(),
            'ip_address' => $this->ip_address,
            'device_info' => $this->device_info,
            'user_agent' => $this->user_agent,
            'status' => $this->status,
        ];
    }
}