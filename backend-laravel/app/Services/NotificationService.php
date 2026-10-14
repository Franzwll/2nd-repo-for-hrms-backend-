<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\SystemUser;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Helpful-only delivery for hiring events.
     *
     * - Single-user mode when $systemUserId is given (unchanged).
     * - Role-targeted mode when $onlyRoleNames is given (preferred for hiring:
     *   only HR-side roles get the bell, Employees stop getting hiring spam).
     * - Legacy broadcast to all active users only when neither is given.
     */
    public static function send(
        string $title,
        ?string $body = null,
        string $module = 'System',
        string $type = 'info',
        ?string $targetType = null,
        ?string $targetId = null,
        ?int $systemUserId = null,
        ?array $onlyRoleNames = null,
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

                return;
            }

            if (! empty($onlyRoleNames)) {
                Notifier::toActiveRoles($onlyRoleNames, [
                    'title' => $title,
                    'body' => $body,
                    'type' => $type,
                    'module_name' => $module,
                    'target_type' => $targetType,
                    'target_id' => $targetId,
                ]);

                return;
            }

            // Legacy broadcast to active users (kept for callers not yet migrated).
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
        } catch (\Throwable $e) {
            Log::warning('Failed to create notification: ' . $e->getMessage());
        }
    }
}
