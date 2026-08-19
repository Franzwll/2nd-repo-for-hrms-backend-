<?php

namespace Modules\Auth\Services;

use App\Models\SystemUser;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class PasswordResetService
{
    private const TTL_SECONDS = 3600;

    public function issue(SystemUser $user): string
    {
        $token = Str::random(64);

        Cache::put(
            'auth.reset.' . $token,
            [
                'user_id' => $user->system_user_id,
                'expires_at' => now()->addSeconds(self::TTL_SECONDS)->timestamp,
            ],
            now()->addSeconds(self::TTL_SECONDS)
        );

        return $token;
    }

    public function findUser(string $token): ?SystemUser
    {
        $payload = Cache::get('auth.reset.' . $token);

        if (! $payload || $payload['expires_at'] < now()->timestamp) {
            Cache::forget('auth.reset.' . $token);

            return null;
        }

        return SystemUser::find($payload['user_id']);
    }

    public function consume(string $token): void
    {
        Cache::forget('auth.reset.' . $token);
    }

    public static function ttlSeconds(): int
    {
        return self::TTL_SECONDS;
    }
}