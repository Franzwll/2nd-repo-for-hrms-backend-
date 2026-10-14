<?php

namespace App\Services;

use App\Models\SystemRole;
use App\Models\SystemUser;
use Illuminate\Support\Facades\DB;

/**
 * Delivers in-app notifications to system users.
 *
 * Notifications are audience-scoped and always inserted server-side so the
 * bell indicator in the portal reflects real, persisted activity.
 */
class Notifier
{
    /**
     * Deliver a notification to one or more recipients.
     */
    public static function to(array $userIds, array $attrs): void
    {
        $userIds = array_values(array_unique(array_filter(array_map('intval', $userIds))));

        if (empty($userIds)) {
            return;
        }

        $rows = array_map(function (int $userId) use ($attrs) {
            return [
                'system_user_id' => $userId,
                'title' => $attrs['title'] ?? 'Notification',
                'body' => $attrs['body'] ?? null,
                'type' => $attrs['type'] ?? 'info',
                'module_name' => $attrs['module_name'] ?? null,
                'target_type' => $attrs['target_type'] ?? null,
                'target_id' => $attrs['target_id'] ?? null,
                'is_read' => false,
                'created_at' => now(),
            ];
        }, $userIds);

        DB::table('notifications')->insert($rows);
    }

    /**
     * Deliver to every user holding one of the given role names.
     */
    public static function toRoles(array $roleNames, array $attrs): void
    {
        $roleIds = SystemRole::whereIn('role_name', $roleNames)->pluck('role_id');

        if ($roleIds->isEmpty()) {
            return;
        }

        $userIds = SystemUser::whereIn('role_id', $roleIds)->pluck('system_user_id')->all();

        self::to($userIds, $attrs);
    }

    /**
     * Deliver to every active user, optionally excluding some (e.g. the actor).
     * Used sparingly for broadcast-style events such as announcements.
     */
    public static function toAll(array $attrs, ?array $exceptIds = null): void
    {
        $query = SystemUser::query();

        if (! empty($exceptIds)) {
            $query->whereNotIn('system_user_id', $exceptIds);
        }

        self::to($query->pluck('system_user_id')->all(), $attrs);
    }

    public static function superAdminIds(): array
    {
        return SystemUser::whereHas('role', fn ($q) => $q->where('is_super_admin', true))
            ->pluck('system_user_id')
            ->all();
    }

    public static function hrAdminIds(): array
    {
        return SystemUser::whereHas('role', fn ($q) => $q->where('role_name', 'Admin'))
            ->pluck('system_user_id')
            ->all();
    }

    /**
     * Audience for an announcement: respects the Audience column so the bell
     * matches what the board shows (All / Employee / Admin / Super Admin).
     * Returns null to mean "all users".
     */
    public static function audienceRoleNames(?string $audience): ?array
    {
        return match ($audience) {
            'Employee' => ['Employee'],
            'Admin' => ['Admin'],
            'Super Admin' => ['Super Admin'],
            default => null,
        };
    }

    /**
     * Deliver to every ACTIVE user holding one of the given role names.
     */
    public static function toActiveRoles(array $roleNames, array $attrs, ?array $exceptIds = null): void
    {
        $roleIds = SystemRole::whereIn('role_name', $roleNames)->pluck('role_id');

        if ($roleIds->isEmpty()) {
            return;
        }

        $query = SystemUser::whereIn('role_id', $roleIds)->where('status', 'Active');

        if (! empty($exceptIds)) {
            $query->whereNotIn('system_user_id', $exceptIds);
        }

        self::to($query->pluck('system_user_id')->all(), $attrs);
    }
}
