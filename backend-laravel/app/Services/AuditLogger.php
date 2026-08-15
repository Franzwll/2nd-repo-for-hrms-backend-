<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\SystemUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AuditLogger
{
    public static function log(
        string $action,
        string $module,
        ?string $severity = 'Info',
        ?string $targetType = null,
        ?string $targetId = null,
        ?string $details = null,
        ?SystemUser $actor = null,
        ?Request $request = null,
    ): ?AuditLog {
        $actor ??= auth('sanctum')->user();

        $request ??= request();

        $ip = $request?->ip();
        $userAgent = $request?->userAgent();

        $deviceInfo = null;
        if ($userAgent) {
            $deviceInfo = self::summarizeUserAgent($userAgent);
        }

        return AuditLog::create([
            'system_user_id' => $actor?->system_user_id,
            'actor_role' => $actor?->role?->role_name ?? ($actor ? null : 'System'),
            'actor_department' => $actor?->department_name ?? 'System',
            'occurred_at' => now(),
            'action' => $action,
            'module_name' => $module,
            'target_type' => $targetType,
            'target_id' => $targetId,
            'details' => $details,
            'severity' => $severity,
            'ip_address' => $ip,
            'device_info' => $deviceInfo,
        ]);
    }

    private static function summarizeUserAgent(string $userAgent): string
    {
        if (str_contains($userAgent, 'Edg/')) {
            return 'Edge';
        }
        if (str_contains($userAgent, 'Chrome/')) {
            return 'Chrome';
        }
        if (str_contains($userAgent, 'Firefox/')) {
            return 'Firefox';
        }
        if (str_contains($userAgent, 'Safari/')) {
            return 'Safari';
        }
        if (str_contains($userAgent, 'Android')) {
            return 'Mobile App';
        }

        return 'Unknown';
    }
}