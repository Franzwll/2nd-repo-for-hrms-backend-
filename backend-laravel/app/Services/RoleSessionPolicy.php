<?php

namespace App\Services;

/**
 * Role-based session lifetimes.
 *
 * - Super Admin:  4h token / 10m idle (highest blast radius)
 * - Admin:        8h token / 15m idle (sensitive PII/payroll, often shared PCs)
 * - Employee:    12h token / 30m idle (ESS convenience, lowest privilege)
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
        return match (self::keyFor($role)) {
            'superadmin' => [
                'token_minutes' => (int) env('SESSION_MINUTES_SUPERADMIN', 240),
                'idle_minutes' => (int) env('SESSION_IDLE_SUPERADMIN', 10),
            ],
            'admin' => [
                'token_minutes' => (int) env('SESSION_MINUTES_ADMIN', 480),
                'idle_minutes' => (int) env('SESSION_IDLE_ADMIN', 15),
            ],
            default => [
                'token_minutes' => (int) env('SESSION_MINUTES_EMPLOYEE', 720),
                'idle_minutes' => (int) env('SESSION_IDLE_EMPLOYEE', 30),
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
