<?php

namespace App\Services;

use App\Exceptions\OtpDeliveryException;
use App\Mail\SendOtpMail;
use App\Models\SystemUser;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class OtpService
{
    private const TTL_SECONDS = 120;
    private const MAX_ATTEMPTS = 3;

    /**
     * How long a challenge stays resendable after its code expires. The code
     * itself is only valid for TTL_SECONDS (enforced via `expires_at`); this
     * just lets the user request a fresh one without signing in again.
     */
    private const RESEND_GRACE_SECONDS = 600;

    /**
     * Whether this specific account must pass OTP verification at login.
     *
     * Per-user flag (system_users.otp_enabled), toggled by the user in their
     * portal Settings. Defaults to enabled when never touched.
     */
    public static function requiredFor(SystemUser $user): bool
    {
        return (bool) ($user->otp_enabled ?? true);
    }

    public function issue(SystemUser $user): array
    {
        $token = Str::random(64);
        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $key = 'auth.otp.' . $token;

        Cache::put(
            $key,
            [
                'user_id' => $user->system_user_id,
                'code_hash' => hash('sha256', $code),
                'attempts' => 0,
                'expires_at' => now()->addSeconds(self::TTL_SECONDS)->timestamp,
                // login() already passed the Turnstile check to get here,
                // so downstream verify/resend skip their own challenge.
                'captcha_passed' => true,
            ],
            $this->retainUntil()
        );

        try {
            $this->deliver($user, $code);
        } catch (\Throwable $e) {
            // No code reached the user, so don't leave a challenge behind
            // that can never be completed.
            Cache::forget($key);
            report($e);

            throw OtpDeliveryException::forUser($user->email, $e);
        }

        return [
            'login_token' => $token,
            'expires_in' => self::TTL_SECONDS,
        ];
    }

    /**
     * Whether this challenge's login already cleared the captcha
     * (lets verify/resend skip asking twice in one journey).
     */
    public static function challengePassedCaptcha(string $token): bool
    {
        $payload = Cache::get('auth.otp.' . $token);

        return is_array($payload) && ($payload['captcha_passed'] ?? false) === true;
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
        // The new code gets its own full lifetime. Without this, verify()
        // kept rejecting it once the *first* code's expires_at passed.
        $payload['expires_at'] = now()->addSeconds(self::TTL_SECONDS)->timestamp;

        Cache::put('auth.otp.' . $token, $payload, $this->retainUntil());

        $user = SystemUser::find($payload['user_id']);
        if (! $user) {
            return ['ok' => false];
        }

        try {
            $this->deliver($user, $code);
        } catch (\Throwable $e) {
            report($e);

            // Keep the existing challenge: the stored hash is the new code, so
            // a successful retry will still line up with what the user receives.
            return ['ok' => false, 'mail_failed' => true];
        }

        return ['ok' => true];
    }

    public function verify(string $token, string $code): ?SystemUser
    {
        $key = 'auth.otp.' . $token;
        $payload = Cache::get($key);

        if (! $payload) {
            return null;
        }

        // Expired code: reject it but keep the challenge so the user can
        // still resend until the grace window closes.
        if ($payload['expires_at'] < now()->timestamp) {
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

        Cache::put($key, $payload, $this->retainUntil());

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

    private function retainUntil(): \DateTimeInterface
    {
        return now()->addSeconds(self::TTL_SECONDS + self::RESEND_GRACE_SECONDS);
    }

    private function deliver(SystemUser $user, string $code): void
    {
        if (! app()->environment('production')) {
            Log::info("OTP issued for {$user->email}: >{$code}<");
        }

        // Deliberately not caught here: the caller decides how to report a
        // delivery failure. Swallowing it made "OTP sent" a lie.
        Mail::to($user->email)->send(
            new SendOtpMail($code, $user->full_name ?: $user->username, self::TTL_SECONDS)
        );
    }
}