<?php

namespace Modules\Auth\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\SystemUser;
use App\Models\UserLoginActivity;
use App\Services\AuditLogger;
use App\Services\LoginService;
use App\Services\Notifier;
use App\Services\OtpService;
use App\Services\RoleSessionPolicy;
use App\Services\TotpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Modules\Auth\Http\Requests\LoginRequest;
use Modules\Auth\Http\Requests\OtpVerifyRequest;
use Modules\Auth\Http\Resources\UserResource;
use Modules\Auth\Http\Controllers\Concerns\VerifiesCaptcha;
class AuthController extends Controller
{
    use VerifiesCaptcha;

    public function __construct(private readonly OtpService $otpService)
    {
    }

    public function login(LoginRequest $request): JsonResponse
    {
        if ($failed = $this->captchaFailed($request)) {
            return $failed;
        }

        $login = $request->string('email');
        $user = SystemUser::where('email', $login)->orWhere('username', $login)->first();

        if ($user && $user->isLockedOut()) {
            $seconds = now()->diffInSeconds($user->locked_until);

            AuditLogger::log(
                'Blocked login attempt',
                'Authentication',
                'Warning',
                'user',
                $user->username,
                'Login blocked: account temporarily locked after repeated failures.',
                $user
            );

            return response()->json([
                'message' => 'Too many failed attempts. Try again in ' . max(1, (int) ceil($seconds / 60)) . ' minute(s).',
            ], 423);
        }

        if (!$user || !Hash::check($request->string('password'), $user->password_hash)) {
            if ($user) {
                $this->registerFailedAttempt($user);
            }

            AuditLogger::log(
                'Failed login attempt',
                'Authentication',
                'Warning',
                'user',
                $user?->username ?: $login,
                'Invalid credentials supplied.',
                $user
            );

            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        $user->forceFill(['failed_attempts' => 0, 'locked_until' => null])->save();

        if ($user->status !== 'Active') {
            AuditLogger::log(
                'Blocked login attempt',
                'Authentication',
                'Warning',
                'user',
                $user->username,
                "Login blocked: account is {$user->status}.",
                $user
            );

            return response()->json(['message' => 'Your account is not active. Contact an administrator.'], 403);
        }

        // Authenticator-app MFA wins over the email OTP toggle: a confirmed
        // TOTP enrollment always requires the 30-second app code.
        $user->loadMissing('role');
        if ($user->usesTotp()) {
            $issued = app(TotpService::class)->issueChallenge($user);

            AuditLogger::log(
                'MFA challenge issued',
                'Authentication',
                'Info',
                'user',
                $user->username,
                'Authenticator-app code requested at login.',
                $user
            );

            return response()->json([
                'otp_required' => true,
                'mfa_method' => 'totp',
                'message' => 'Enter the 6-digit code from your authenticator app.',
                'login_token' => $issued['login_token'],
                'expires_in' => $issued['expires_in'],
                'totp_enrollment_required' => false,
            ]);
        }

        $totpRequired = $user->isSuperAdmin();

        // OTP can be switched off by each user for their own account
        // (system_users.otp_enabled, toggled in portal Settings).
        // When disabled, sign the user straight in — no one-time password step.
        if (!OtpService::requiredFor($user)) {
            $session = $this->completeLogin($request, $user);

            AuditLogger::log(
                'User logged in',
                'Authentication',
                'Info',
                'user',
                $user->username,
                'Signed in with email and password (OTP disabled for role).',
                $user
            );

            return response()->json([
                'otp_required' => false,
                'mfa_method' => 'email_otp',
                'totp_enrollment_required' => $totpRequired,
                ...$session,
            ]);
        }

        $issued = $this->otpService->issue($user);

        AuditLogger::log(
            'OTP sent',
            'Authentication',
            'Info',
            'user',
            $user->username,
            'One-time password emailed to ' . $this->maskEmail($user->email),
            $user
        );

        return response()->json([
            'otp_required' => true,
            'mfa_method' => 'email_otp',
            'totp_enrollment_required' => $totpRequired,
            ...$this->otpResponse(
                'One-time password sent to your work email.',
                $issued
            ),
        ]);
    }

    public function verifyOtp(OtpVerifyRequest $request): JsonResponse
    {
        // Single challenge per journey: login() already cleared Turnstile
        // to mint this token, so only unstamped tokens face a new check.
        if (! OtpService::challengePassedCaptcha($request->string('login_token')->toString())) {
            if ($failed = $this->captchaFailed($request)) {
                return $failed;
            }
        }

        $user = $this->otpService->verify(
            $request->string('login_token'),
            $request->string('otp')
        );

        if (!$user) {
            AuditLogger::log(
                'Failed OTP verification',
                'Authentication',
                'Warning',
                'user',
                null,
                'Invalid or expired OTP attempt.',
            );

            return response()->json(['message' => 'Invalid or expired OTP.'], 422);
        }

        if ($user->status !== 'Active') {
            return response()->json(['message' => 'Your account is not active.'], 403);
        }

        $issued = LoginService::issueToken($user);
        $token = $issued['token'];

        $previousIp = $user->last_login_ip;
        $previousLogin = $user->last_login_at;

        $user->forceFill([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ])->save();

        // Security alert: notify the user when signing in from a new IP address.
        if ($previousLogin && $previousIp && $previousIp !== $request->ip()) {
            Notifier::to([$user->system_user_id], [
                'title' => 'New sign-in to your account',
                'body' => 'We noticed a login to your account from a new IP address (' . $request->ip() . '). If this wasn’t you, reset your password.',
                'type' => 'warning',
                'module_name' => 'Authentication',
                'target_type' => 'user',
                'target_id' => (string) $user->system_user_id,
            ]);
        }

        UserLoginActivity::create([
            'system_user_id' => $user->system_user_id,
            'login_at' => now(),
            'ip_address' => $request->ip(),
            'device_info' => $this->deviceInfo($request),
            'user_agent' => $request->userAgent(),
            'status' => 'success',
        ]);

        $session = [
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => new UserResource($user),
            'expires_in_minutes' => $issued['expires_in_minutes'],
            'idle_timeout_minutes' => $issued['idle_timeout_minutes'],
        ];

        AuditLogger::log(
            'User logged in',
            'Authentication',
            'Info',
            'user',
            $user->username,
            'Two-factor login completed.',
            $user
        );

        return response()->json($session);
    }

    public function resendOtp(Request $request): JsonResponse
    {
        if (! OtpService::challengePassedCaptcha($request->string('login_token')->toString())) {
            if ($failed = $this->captchaFailed($request)) {
                return $failed;
            }
        }

        $request->validate(['login_token' => ['required', 'string']]);

        $result = $this->otpService->resend($request->string('login_token'));

        if (!$result['ok']) {
            return response()->json(['message' => 'Login token is invalid or expired.'], 422);
        }

        return response()->json([
            'message' => 'A new OTP has been sent to your work email.',
            'expires_in' => OtpService::ttlSeconds(),
            ...$this->debugOtp($result['debug_otp']),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => new UserResource($request->user()),
        ]);
    }

    /**
     * Public session policy so the login page and portal can display
     * exactly how many minutes a session lasts (no more guessing).
     * Returns the per-role map; the global Sanctum value is the ceiling.
     */
    public function sessionPolicy(): JsonResponse
    {
        return response()->json([
            'token_expiration_minutes' => (int) config('sanctum.expiration'),
            'idle_timeout_minutes' => (int) env('SESSION_IDLE_MINUTES', 30),
            'roles' => RoleSessionPolicy::map(),
            'otp_expires_in_seconds' => OtpService::ttlSeconds(),
            'reset_expires_in_seconds' => \Modules\Auth\Services\PasswordResetService::ttlSeconds(),
        ]);
    }

    /**
     * Re-verify the account password for a sensitive action
     * (confidential report export/print). Never logs the password.
     */
    public function confirmPassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'password' => ['required', 'string'],
        ]);

        /** @var SystemUser $user */
        $user = $request->user();

        if (! Hash::check($data['password'], $user->password_hash)) {
            AuditLogger::log(
                'Failed sensitive-action confirmation',
                'Authentication',
                'Warning',
                'user',
                $user->username,
                'Wrong password supplied for a sensitive-action confirmation.',
                $user
            );

            return response()->json(['message' => 'Incorrect password.'], 401);
        }

        AuditLogger::log(
            'Sensitive action confirmed',
            'Authentication',
            'Info',
            'user',
            $user->username,
            'Password re-confirmed for a sensitive action (export/print).',
            $user
        );

        return response()->json(['ok' => true]);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        AuditLogger::log(
            'User logged out',
            'Authentication',
            'Info',
            'user',
            $user->username,
            'Session token revoked.',
            $user
        );

        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.'], 200);
    }

    private function otpResponse(string $message, array $issued): array
    {
        return [
            'message' => $message,
            'login_token' => $issued['login_token'],
            'expires_in' => $issued['expires_in'],
            ...$this->debugOtp($issued['debug_otp']),
        ];
    }

    /**
     * Finishes a sign-in: creates the API token, stamps login metadata and
     * records the login activity. Shared by the OTP and direct-login paths.
     */
    private function completeLogin(Request $request, SystemUser $user): array
    {
        return LoginService::completeLogin($request, $user);
    }

    /**
     * Track wrong-password attempts; lock the account for 15 minutes
     * after 5 consecutive failures.
     */
    private function registerFailedAttempt(SystemUser $user): void
    {
        $attempts = (int) ($user->failed_attempts ?? 0) + 1;

        $user->forceFill(['failed_attempts' => $attempts]);

        if ($attempts >= 5) {
            $user->forceFill([
                'failed_attempts' => 0,
                'locked_until' => now()->addMinutes(15),
            ]);

            AuditLogger::log(
                'Account locked',
                'Authentication',
                'Warning',
                'user',
                $user->username,
                'Account locked for 15 minutes after 5 failed login attempts.',
                $user
            );
        }

        $user->save();
    }

    private function debugOtp(string $code): array
    {
        if (!app()->environment(['local', 'testing'])) {
            return [];
        }

        return ['debug_otp' => $code];
    }

    private function maskEmail(string $email): string
    {
        $parts = explode('@', $email);
        $name = $parts[0] ?? '';
        $domain = $parts[1] ?? '';

        if (strlen($name) <= 2) {
            return str_repeat('*', strlen($name)) . '@' . $domain;
        }

        return $name[0] . str_repeat('*', max(2, strlen($name) - 2)) . '@' . $domain;
    }

    private function deviceInfo(Request $request): string
    {
        $agent = $request->userAgent() ?? '';

        if (str_contains($agent, 'Edg/')) {
            return 'Edge on ' . $this->os($agent);
        }
        if (str_contains($agent, 'Chrome/')) {
            return 'Chrome on ' . $this->os($agent);
        }
        if (str_contains($agent, 'Firefox/')) {
            return 'Firefox on ' . $this->os($agent);
        }
        if (str_contains($agent, 'Safari/')) {
            return 'Safari on ' . $this->os($agent);
        }
        if (str_contains($agent, 'Android')) {
            return 'Mobile App on Android';
        }

        return 'Unknown device';
    }

    private function os(string $agent): string
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
}