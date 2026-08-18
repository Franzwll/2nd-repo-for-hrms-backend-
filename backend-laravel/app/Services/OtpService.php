<?php

namespace App\Services;

use App\Mail\SendOtpMail;
use App\Models\SystemUser;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class OtpService
{
    private const TTL_SECONDS = 300;
    private const MAX_ATTEMPTS = 3;

    public function issue(SystemUser $user): array
    {
        $token = Str::random(64);
        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        Cache::put(
            'auth.otp.' . $token,
            [
                'user_id' => $user->system_user_id,
                'code_hash' => hash('sha256', $code),
                'attempts' => 0,
                'expires_at' => now()->addSeconds(self::TTL_SECONDS)->timestamp,
            ],
            now()->addSeconds(self::TTL_SECONDS)
        );

        $this->deliver($user, $code);

        return [
            'login_token' => $token,
            'expires_in' => self::TTL_SECONDS,
            'debug_otp' => $code,
        ];
    }

    public function resend(string $token): array
    {
        $payload = Cache::get('auth.otp.' . $token);

        if (! $payload) {
            return ['ok' => false];
        }

        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $payload['code_hash'] = hash('sha256', $code);
        $payload['attempts'] = 0;

        Cache::put('auth.otp.' . $token, $payload, now()->addSeconds(self::TTL_SECONDS));

        $user = SystemUser::find($payload['user_id']);
        if ($user) {
            $this->deliver($user, $code);
        }

        return ['ok' => true, 'debug_otp' => $code];
    }

    public function verify(string $token, string $code): ?SystemUser
    {
        $key = 'auth.otp.' . $token;
        $payload = Cache::get($key);

        if (! $payload || $payload['expires_at'] < now()->timestamp) {
            Cache::forget($key);

            return null;
        }

        if (hash_equals($payload['code_hash'], hash('sha256', $code))) {
            Cache::forget($key);

            return SystemUser::find($payload['user_id']);
        }

        $payload['attempts']++;
        if ($payload['attempts'] >= self::MAX_ATTEMPTS) {
            Cache::forget($key);

            return null;
        }

        Cache::put($key, $payload, now()->addSeconds(self::TTL_SECONDS));

        return null;
    }

    public function remainingAttempts(string $token): int
    {
        $payload = Cache::get('auth.otp.' . $token);

        if (! $payload) {
            return 0;
        }

        return max(0, self::MAX_ATTEMPTS - $payload['attempts']);
    }

    public static function ttlSeconds(): int
    {
        return self::TTL_SECONDS;
    }

    private function deliver(SystemUser $user, string $code): void
    {
        try {
            Mail::to($user->email)->send(
                new SendOtpMail($code, $user->full_name ?: $user->username, self::TTL_SECONDS)
            );
        } catch (\Throwable $e) {
            report($e);
        }
    }
}