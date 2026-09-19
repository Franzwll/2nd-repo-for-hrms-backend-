<?php

namespace Modules\Auth\Http\Controllers\Concerns;

use App\Services\TurnstileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Rejects bot submissions on public auth endpoints before any
 * account lookup happens (prevents credential-stuffing and
 * forgot-password email enumeration by bots).
 */
trait VerifiesCaptcha
{
    protected function captchaFailed(Request $request): ?JsonResponse
    {
        /** @var TurnstileService $turnstile */
        $turnstile = app(TurnstileService::class);

        $token = $request->string('captcha_token')->toString() ?: null;

        if ($turnstile->verify($token, $request->ip())) {
            return null;
        }

        return response()->json([
            'message' => 'Security check failed. Please refresh and try again.',
            'code' => 'CAPTCHA_FAILED',
        ], 422);
    }
}
