<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Cloudflare Turnstile bot check for public auth endpoints
 * (login, OTP, MFA, forgot-password).
 *
 * Fail-open when no secret is configured (local dev / testing) so the
 * suite and keyless environments never block. Fail-closed in production.
 */
class TurnstileService
{
    public function configured(): bool
    {
        return (string) config('services.turnstile.secret', '') !== '';
    }

    public function verify(?string $token, ?string $ip = null): bool
    {
        // No secret configured (keyless dev) or automated tests: never block.
        if (! $this->configured() || app()->environment('testing')) {
            return true;
        }

        if (! $token) {
            return false;
        }

        try {
            $response = Http::timeout(5)->asForm()->post(
                'https://challenges.cloudflare.com/turnstile/v0/siteverify',
                [
                    'secret' => config('services.turnstile.secret'),
                    'response' => $token,
                    'remoteip' => $ip,
                ]
            );

            return (bool) ($response->json('success') ?? false);
        } catch (\Throwable $e) {
            Log::warning('Turnstile verification unreachable: ' . $e->getMessage());

            return false;
        }
    }
}
