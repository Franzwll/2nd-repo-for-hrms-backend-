<?php

namespace Modules\Auth\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\SystemUser;
use App\Services\AuditLogger;
use App\Services\LoginService;
use App\Services\TotpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Modules\Auth\Http\Controllers\Concerns\VerifiesCaptcha;

/**
 * TOTP authenticator-app MFA (user-chosen; required for Super Admins).
 *
 * Enrollment is self-service in portal Settings; the login step is
 * handled by verify()/recover() with the same short-lived login_token
 * pattern as the email OTP flow.
 */
class MfaController extends Controller
{
    use VerifiesCaptcha;

    public function __construct(private readonly TotpService $totp)
    {
    }

    public function status(Request $request): JsonResponse
    {
        /** @var SystemUser $user */
        $user = $request->user();

        $codes = $user->mfa_recovery_codes;
        $remaining = is_array($codes) ? count($codes) : 0;

        return response()->json([
            'mfa_method' => $user->mfa_method ?? 'email_otp',
            'totp_confirmed' => $user->totp_confirmed_at !== null,
            'recovery_codes_remaining' => $remaining,
            'totp_required' => $user->isSuperAdmin() && ! $user->usesTotp(),
            'email_otp_enabled' => (bool) ($user->otp_enabled ?? true),
        ]);
    }

    /**
     * Start enrollment: mint a secret and return the QR + manual key.
     * The secret is NOT stored until confirm() succeeds.
     */
    public function setup(Request $request): JsonResponse
    {
        /** @var SystemUser $user */
        $user = $request->user();

        $secret = $this->totp->generateSecret();
        Cache::put(
            'mfa.setup.' . $user->system_user_id,
            ['secret' => $secret],
            now()->addMinutes(10)
        );

        $otpauthUrl = $this->totp->otpauthUrl($user, $secret);

        AuditLogger::log(
            'MFA enrollment started',
            'Authentication',
            'Info',
            'user',
            $user->username,
            'Authenticator-app enrollment started.',
            $user
        );

        return response()->json([
            'otpauth_url' => $otpauthUrl,
            'qr_svg' => $this->totp->qrSvg($otpauthUrl),
            'manual_key' => TotpService::formatKey($secret),
        ]);
    }

    /**
     * Confirm enrollment: password + one valid app code activates TOTP
     * and returns the single-use recovery codes (shown once).
     */
    public function confirm(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:10'],
            'password' => ['required', 'string'],
        ]);

        /** @var SystemUser $user */
        $user = $request->user();

        if (! Hash::check($data['password'], $user->password_hash)) {
            return response()->json(['message' => 'Incorrect password.'], 401);
        }

        $pending = Cache::get('mfa.setup.' . $user->system_user_id);
        if (! $pending || empty($pending['secret'])) {
            return response()->json(['message' => 'Enrollment expired. Please scan the QR code again.'], 422);
        }

        if (! $this->totp->verifyCode($pending['secret'], $data['code'])) {
            AuditLogger::log(
                'Failed MFA enrollment',
                'Authentication',
                'Warning',
                'user',
                $user->username,
                'Wrong authenticator code during enrollment.',
                $user
            );

            return response()->json(['message' => 'Invalid code. Check your authenticator app time and try again.'], 422);
        }

        $codes = TotpService::generateRecoveryCodes();

        $user->forceFill([
            'totp_secret' => $pending['secret'],
            'totp_confirmed_at' => now(),
            'mfa_method' => 'totp',
            'mfa_recovery_codes' => $codes['hashes'],
        ])->save();

        Cache::forget('mfa.setup.' . $user->system_user_id);
        $this->totp->markCodeUsed($user, $data['code']);

        AuditLogger::log(
            'MFA enrollment completed',
            'Authentication',
            'Info',
            'user',
            $user->username,
            'Authenticator-app MFA enabled.',
            $user
        );

        return response()->json([
            'message' => 'Authenticator app enabled. Save your recovery codes now — they are shown once.',
            'recovery_codes' => $codes['plain'],
        ]);
    }

    /**
     * Switch back to emailed OTP codes. Super Admins cannot disable
     * (TOTP is mandatory for the role).
     */
    public function disable(Request $request): JsonResponse
    {
        $data = $request->validate([
            'password' => ['required', 'string'],
            'code' => ['nullable', 'string', 'max:10'],
        ]);

        /** @var SystemUser $user */
        $user = $request->user();

        if (! Hash::check($data['password'], $user->password_hash)) {
            return response()->json(['message' => 'Incorrect password.'], 401);
        }

        if (! $user->usesTotp()) {
            return response()->json(['message' => 'Authenticator MFA is not enabled on your account.'], 422);
        }

        if ($user->isSuperAdmin()) {
            return response()->json(['message' => 'Authenticator MFA is required for Super Admins and cannot be disabled.'], 403);
        }

        if (empty($data['code']) || ! $this->totp->verifyCode($user->totp_secret, $data['code'])) {
            return response()->json(['message' => 'Enter a valid code from your authenticator app to confirm.'], 422);
        }

        $user->forceFill([
            'mfa_method' => 'email_otp',
            'totp_secret' => null,
            'totp_confirmed_at' => null,
            'mfa_recovery_codes' => null,
        ])->save();

        AuditLogger::log(
            'MFA disabled',
            'Authentication',
            'Warning',
            'user',
            $user->username,
            'Authenticator-app MFA disabled; account fell back to emailed OTP.',
            $user
        );

        return response()->json(['message' => 'Authenticator app removed. You will receive emailed codes at login.']);
    }

    public function regenerateCodes(Request $request): JsonResponse
    {
        $data = $request->validate([
            'password' => ['required', 'string'],
        ]);

        /** @var SystemUser $user */
        $user = $request->user();

        if (! Hash::check($data['password'], $user->password_hash)) {
            return response()->json(['message' => 'Incorrect password.'], 401);
        }

        if (! $user->usesTotp()) {
            return response()->json(['message' => 'Authenticator MFA is not enabled on your account.'], 422);
        }

        $codes = TotpService::generateRecoveryCodes();
        $user->forceFill(['mfa_recovery_codes' => $codes['hashes']])->save();

        AuditLogger::log(
            'MFA recovery codes regenerated',
            'Authentication',
            'Info',
            'user',
            $user->username,
            'Authenticator recovery codes regenerated.',
            $user
        );

        return response()->json([
            'message' => 'New recovery codes generated. Old ones no longer work.',
            'recovery_codes' => $codes['plain'],
        ]);
    }

    /**
     * Login step: verify the 30-second app code against the MFA challenge.
     */
    public function verify(Request $request): JsonResponse
    {
        if (! TotpService::challengePassedCaptcha($request->string('login_token')->toString())) {
            if ($failed = $this->captchaFailed($request)) {
                return $failed;
            }
        }

        $data = $request->validate([
            'login_token' => ['required', 'string'],
            'code' => ['required', 'string', 'max:10'],
        ]);

        $user = $this->totp->resolveChallenge($data['login_token']);

        if (! $user) {
            AuditLogger::log(
                'Failed MFA verification',
                'Authentication',
                'Warning',
                'user',
                null,
                'Invalid or expired MFA challenge.',
            );

            return response()->json(['message' => 'Login session expired. Please sign in again.'], 422);
        }

        if ($user->status !== 'Active') {
            return response()->json(['message' => 'Your account is not active.'], 403);
        }

        if (! $user->usesTotp()) {
            return response()->json(['message' => 'Authenticator MFA is not enabled on your account.'], 422);
        }

        $valid = $this->totp->verifyCode($user->totp_secret, $data['code'])
            && $this->totp->markCodeUsed($user, $data['code']);

        if (! $valid) {
            $remaining = $this->totp->recordFailedAttempt($data['login_token']);

            AuditLogger::log(
                'Failed MFA verification',
                'Authentication',
                'Warning',
                'user',
                $user->username,
                'Wrong authenticator code at login.',
                $user
            );

            return response()->json([
                'message' => $remaining > 0
                    ? "Invalid code. {$remaining} attempt(s) left before this session expires."
                    : 'Too many wrong codes. Please sign in again.',
            ], 422);
        }

        $this->totp->consumeChallenge($data['login_token']);
        $session = LoginService::completeLogin($request, $user);

        AuditLogger::log(
            'User logged in',
            'Authentication',
            'Info',
            'user',
            $user->username,
            'Authenticator-app MFA login completed.',
            $user
        );

        return response()->json($session);
    }

    /**
     * Login step with a single-use recovery code (lost phone path).
     */
    public function recover(Request $request): JsonResponse
    {
        if (! TotpService::challengePassedCaptcha($request->string('login_token')->toString())) {
            if ($failed = $this->captchaFailed($request)) {
                return $failed;
            }
        }

        $data = $request->validate([
            'login_token' => ['required', 'string'],
            'recovery_code' => ['required', 'string', 'max:20'],
        ]);

        $user = $this->totp->resolveChallenge($data['login_token']);

        if (! $user) {
            return response()->json(['message' => 'Login session expired. Please sign in again.'], 422);
        }

        if ($user->status !== 'Active') {
            return response()->json(['message' => 'Your account is not active.'], 403);
        }

        if (! $user->usesTotp()) {
            return response()->json(['message' => 'Authenticator MFA is not enabled on your account.'], 422);
        }

        if (! TotpService::consumeRecoveryCode($user, $data['recovery_code'])) {
            $remaining = $this->totp->recordFailedAttempt($data['login_token']);

            AuditLogger::log(
                'Failed MFA recovery',
                'Authentication',
                'Warning',
                'user',
                $user->username,
                'Wrong recovery code at login.',
                $user
            );

            return response()->json([
                'message' => $remaining > 0
                    ? 'Invalid recovery code.'
                    : 'Too many wrong codes. Please sign in again.',
            ], 422);
        }

        $this->totp->consumeChallenge($data['login_token']);
        $session = LoginService::completeLogin($request, $user);

        $left = is_array($user->fresh()->mfa_recovery_codes) ? count($user->fresh()->mfa_recovery_codes) : 0;

        AuditLogger::log(
            'User logged in',
            'Authentication',
            'Info',
            'user',
            $user->username,
            "Signed in with a recovery code ({$left} left).",
            $user
        );

        return response()->json([
            ...$session,
            'recovery_codes_remaining' => $left,
        ]);
    }

    /**
     * Admin lockout rescue: reset an account to emailed OTP.
     * Guarded by User Management:Full permission in routes.
     */
    public function adminReset(Request $request, SystemUser $systemUser): JsonResponse
    {
        $systemUser->forceFill([
            'mfa_method' => 'email_otp',
            'totp_secret' => null,
            'totp_confirmed_at' => null,
            'mfa_recovery_codes' => null,
        ])->save();

        AuditLogger::log(
            'MFA reset by admin',
            'Authentication',
            'Warning',
            'user',
            $systemUser->username,
            'Authenticator MFA reset to emailed OTP by ' . ($request->user()?->username ?? 'admin') . '.',
            $systemUser
        );

        return response()->json(['message' => "MFA reset for {$systemUser->username}. They will use emailed codes at login."]);
    }
}
