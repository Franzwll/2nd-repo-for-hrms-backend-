<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\SystemUser;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Send notification to a specific system user or broadcast to all active system users (if user is null).
     */
    public static function send(
        string $title,
        ?string $body = null,
        string $module = 'System',
        string $type = 'info',
        ?string $targetType = null,
        ?string $targetId = null,
        ?int $systemUserId = null,
    ): void {
        try {
            if ($systemUserId) {
                Notification::create([
                    'system_user_id' => $systemUserId,
                    'type'           => $type,
                    'title'          => $title,
                    'body'           => $body,
                    'module_name'    => $module,
                    'target_type'    => $targetType,
                    'target_id'      => $targetId,
                    'is_read'        => false,
                    'created_at'     => now(),
                ]);
            } else {
                // Broadcast to active users
                $users = SystemUser::where('status', 'Active')->pluck('system_user_id');
                foreach ($users as $userId) {
                    Notification::create([
                        'system_user_id' => $userId,
                        'type'           => $type,
                        'title'          => $title,
                        'body'           => $body,
                        'module_name'    => $module,
                        'target_type'    => $targetType,
                        'target_id'      => $targetId,
                        'is_read'        => false,
                        'created_at'     => now(),
                    ]);
                }
            }
        } catch (\Throwable $e) {
            Log::warning('Failed to create notification: ' . $e->getMessage());
        }
    }
}
