<?php

namespace Modules\AuditLog\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuditLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $this->loadMissing('user');

        return [
            'audit_log_id' => $this->audit_log_id,
            'system_user_id' => $this->system_user_id,
            'timestamp' => $this->occurred_at?->toIso8601String(),
            'occurred_at' => $this->occurred_at?->toIso8601String(),
            'user' => $this->user?->full_name ?? $this->actor_role ?? 'System',
            'role' => $this->actor_role,
            'department' => $this->actor_department,
            'action' => $this->action,
            'module' => $this->module_name,
            'module_name' => $this->module_name,
            'target_type' => $this->target_type,
            'target_id' => $this->target_id,
            'details' => $this->details,
            'severity' => $this->severity,
            'ip_address' => $this->ip_address,
            'device' => $this->device_info,
            'url' => $this->url,
        ];
    }
}