<?php

namespace App\Services;

use App\Models\SystemUser;
use App\Models\UserLoginActivity;
use Illuminate\Http\Request;
use Modules\Auth\Http\Resources\UserResource;

/**
 * Shared sign-in finalization: role-lifetime token, login stamps,
 * activity row. Used by the password, email-OTP and TOTP-MFA paths
 * so every factor lands in the same session shape.
 */
class LoginService
{
    /**
     * @return array{token: string, expires_in_minutes: int, idle_timeout_minutes: int}
     */
    public static function issueToken(SystemUser $user): array
    {
        $policy = RoleSessionPolicy::forRole($user->loadMissing('role')->role?->role_name);

        $token = $user->createToken(
            'auth-token',
            ['*'],
            now()->addMinutes($policy['token_minutes'])
        )->plainTextToken;

        return [
            'token' => $token,
            'expires_in_minutes' => $policy['token_minutes'],
            'idle_timeout_minutes' => $policy['idle_minutes'],
        ];
    }

    public static function deviceInfo(Request $request): string
    {
        $agent = $request->userAgent() ?? '';

        if (str_contains($agent, 'Edg/')) {
            return 'Edge on ' . self::os($agent);
        }
        if (str_contains($agent, 'Chrome/')) {
            return 'Chrome on ' . self::os($agent);
        }
        if (str_contains($agent, 'Firefox/')) {
            return 'Firefox on ' . self::os($agent);
        }
        if (str_contains($agent, 'Safari/')) {
            return 'Safari on ' . self::os($agent);
        }
        if (str_contains($agent, 'Android')) {
            return 'Mobile App on Android';
        }

        return 'Unknown device';
    }

    private static function os(string $agent): string
    {
        if (str_contains($agent, 'Windows')) {
            return 'Windows';
        }
        if (str_contains($agent, 'Android')) {
            return 'Android';
        }
        if (str_contains($agent, 'iPhone') || str_contains($agent, 'Mac OS')) {
            return 'macOS';
        }
        if (str_contains($agent, 'Linux')) {
            return 'Linux';
        }

        return 'Unknown OS';
    }

    /**
     * @return array{token: string, token_type: string, user: UserResource, expires_in_minutes: int, idle_timeout_minutes: int}
     */
    public static function completeLogin(Request $request, SystemUser $user): array
    {
        $issued = self::issueToken($user);

        $user->forceFill([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ])->save();

        UserLoginActivity::create([
            'system_user_id' => $user->system_user_id,
            'login_at' => now(),
            'ip_address' => $request->ip(),
            'device_info' => self::deviceInfo($request),
            'user_agent' => $request->userAgent(),
            'status' => 'success',
        ]);

        return [
            'token' => $issued['token'],
            'token_type' => 'Bearer',
            'user' => new UserResource($user),
            'expires_in_minutes' => $issued['expires_in_minutes'],
            'idle_timeout_minutes' => $issued['idle_timeout_minutes'],
        ];
    }
}
