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
            Log::warning('Turnstile verification failed: missing token.');

            return false;
        }

        try {
            $response = Http::timeout(8)->asForm()->post(
                'https://challenges.cloudflare.com/turnstile/v0/siteverify',
                [
                    'secret' => config('services.turnstile.secret'),
                    'response' => $token,
                    'remoteip' => $ip,
                ]
            );

            $json = $response->json();
            $ok = (bool) ($json['success'] ?? false);

            if (! $ok) {
                // Cloudflare returns machine-readable error-codes
                // (e.g. invalid-input-secret, timeout-or-duplicate when a
                // single-use token is reused or expired). Logged server-side
                // only — the client keeps the generic message.
                Log::warning('Turnstile verification failed: ' . json_encode([
                    'codes' => $json['error-codes'] ?? [],
                    'status' => $response->status(),
                ]));
            }

            return $ok;
        } catch (\Throwable $e) {
            Log::warning('Turnstile verification unreachable: ' . $e->getMessage());

            return false;
        }
    }
}
