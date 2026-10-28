<?php

namespace App\Services;

/**
 * Role-based token lifetimes with a system-wide idle timeout.
 *
 * Sanctum's global `sanctum.expiration` acts as a ceiling on top of the
 * per-token `expires_at`, so the global value must be >= the longest role
 * (see config/sanctum.php default of 720).
 */
class RoleSessionPolicy
{
    public static function keyFor(?string $role): string
    {
        $normalized = strtolower(trim((string) $role));
        $normalized = str_replace(['_', '-'], ' ', $normalized);
        $normalized = str_replace(' ', '', $normalized);

        return match ($normalized) {
            'superadmin' => 'superadmin',
            'admin', 'administrator' => 'admin',
            default => 'employee',
        };
    }

    /**
     * @return array{token_minutes: int, idle_minutes: int}
     */
    public static function forRole(?string $role): array
    {
        $idle = SecurityPolicy::idleMinutes();

        return match (self::keyFor($role)) {
            'superadmin' => [
                'token_minutes' => (int) env('SESSION_MINUTES_SUPERADMIN', 240),
                'idle_minutes' => $idle,
            ],
            'admin' => [
                'token_minutes' => (int) env('SESSION_MINUTES_ADMIN', 480),
                'idle_minutes' => $idle,
            ],
            default => [
                'token_minutes' => (int) env('SESSION_MINUTES_EMPLOYEE', 720),
                'idle_minutes' => $idle,
            ],
        };
    }

    /**
     * @return array<string, array{token_minutes: int, idle_minutes: int}>
     */
    public static function map(): array
    {
        return [
            'superadmin' => self::forRole('superadmin'),
            'admin' => self::forRole('admin'),
            'employee' => self::forRole('employee'),
        ];
    }

    public static function ceiling(): int
    {
        return max(array_column(self::map(), 'token_minutes'));
    }
}
