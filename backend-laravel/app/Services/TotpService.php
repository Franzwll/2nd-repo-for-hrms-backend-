<?php

namespace App\Services;

use App\Models\SystemUser;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use PragmaRX\Google2FA\Google2FA;

/**
 * TOTP authenticator MFA (Google/Microsoft Authenticator apps).
 *
 * Users choose between emailed OTP codes (default) and TOTP.
 * Login MFA challenges reuse the same short-lived login_token pattern
 * as the email OTP flow (5-minute TTL, max attempts then invalidated).
 */
class TotpService
{
    private const MFA_TTL_SECONDS = 300;
    private const MAX_ATTEMPTS = 5;
    private const VERIFY_WINDOW = 1; // ±1 step (±30s clock skew)
    private const RECOVERY_CODE_COUNT = 8;

    public function __construct(private readonly Google2FA $google = new Google2FA)
    {
    }

    public function generateSecret(): string
    {
        return $this->google->generateSecretKey();
    }

    public function otpauthUrl(SystemUser $user, string $secret): string
    {
        $company = (string) (config('app.name') ?: 'Oxford Suites Makati HRMS');

        return $this->google->getQRCodeUrl($company, $user->email, $secret);
    }

    public function qrSvg(string $otpauthUrl): string
    {
        $renderer = new ImageRenderer(new RendererStyle(200), new SvgImageBackEnd());
        $writer = new Writer($renderer);

        return $writer->writeString($otpauthUrl);
    }

    /** Human-friendly grouping: XXXX XXXX XXXX ... */
    public static function formatKey(string $secret): string
    {
        return trim(chunk_split(strtoupper($secret), 4, ' '));
    }

    public function verifyCode(string $secret, string $code): bool
    {
        $code = preg_replace('/\D/', '', $code) ?? '';

        try {
            return $this->google->verify($code, $secret, self::VERIFY_WINDOW);
        } catch (\Throwable $e) {
            return false;
        }
    }

    /**
     * Reject reuse of the same code within its validity window
     * (blocks pass-back / replay of an observed code).
     */
    public function markCodeUsed(SystemUser $user, string $code): bool
    {
        $key = 'auth.mfa.used.' . $user->system_user_id . '.' . preg_replace('/\D/', '', $code);
        if (Cache::has($key)) {
            return false;
        }
        Cache::put($key, true, now()->addSeconds(90));

        return true;
    }

    /**
     * @return array{login_token: string, expires_in: int}
     */
    public function issueChallenge(SystemUser $user): array
    {
        $token = Str::random(64);

        Cache::put(
            'auth.mfa.' . $token,
            [
                'user_id' => $user->system_user_id,
                'attempts' => 0,
                'expires_at' => now()->addSeconds(self::MFA_TTL_SECONDS)->timestamp,
                // login() already passed the Turnstile check to get here,
                // so downstream verify/recover skip their own challenge.
                'captcha_passed' => true,
            ],
            now()->addSeconds(self::MFA_TTL_SECONDS)
        );

        return ['login_token' => $token, 'expires_in' => self::MFA_TTL_SECONDS];
    }

    /**
     * Whether this challenge's login already cleared the captcha
     * (lets verify/recover skip asking twice in one journey).
     */
    public static function challengePassedCaptcha(string $token): bool
    {
        $payload = Cache::get('auth.mfa.' . $token);

        return is_array($payload) && ($payload['captcha_passed'] ?? false) === true;
    }

    public function resolveChallenge(string $token): ?SystemUser
    {
        $payload = Cache::get('auth.mfa.' . $token);

        if (! $payload || $payload['expires_at'] < now()->timestamp) {
            Cache::forget('auth.mfa.' . $token);

            return null;
        }

        return SystemUser::find($payload['user_id']);
    }

    public function recordFailedAttempt(string $token): int
    {
        $key = 'auth.mfa.' . $token;
        $payload = Cache::get($key);
        if (! $payload) {
            return 0;
        }

        $payload['attempts']++;
        $remaining = max(0, self::MAX_ATTEMPTS - $payload['attempts']);

        if ($remaining <= 0) {
            Cache::forget($key);

            return 0;
        }

        Cache::put($key, $payload, now()->addSeconds(self::MFA_TTL_SECONDS));

        return $remaining;
    }

    public function consumeChallenge(string $token): void
    {
        Cache::forget('auth.mfa.' . $token);
    }

    public static function ttlSeconds(): int
    {
        return self::MFA_TTL_SECONDS;
    }

    /**
     * Generate plaintext recovery codes; callers store only the hashes.
     *
     * @return array{plain: string[], hashes: string[]}
     */
    public static function generateRecoveryCodes(): array
    {
        $plain = [];
        $hashes = [];
        for ($i = 0; $i < self::RECOVERY_CODE_COUNT; $i++) {
            $code = strtoupper(Str::random(4) . '-' . Str::random(4));
            $plain[] = $code;
            $hashes[] = Hash::make(strtolower(str_replace('-', '', $code)));
        }

        return ['plain' => $plain, 'hashes' => $hashes];
    }

    /**
     * Verify a recovery code and burn it (single use).
     */
    public static function consumeRecoveryCode(SystemUser $user, string $code): bool
    {
        $normalized = strtolower(str_replace(['-', ' '], '', trim($code)));
        $hashes = $user->mfa_recovery_codes ?? [];
        if (! is_array($hashes) || $hashes === []) {
            return false;
        }

        foreach ($hashes as $index => $hash) {
            if (Hash::check($normalized, $hash)) {
                unset($hashes[$index]);
                $user->forceFill(['mfa_recovery_codes' => array_values($hashes)])->save();

                return true;
            }
        }

        return false;
    }
}
