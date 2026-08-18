<?php

namespace Modules\Auth\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\SystemUser;
use App\Models\UserLoginActivity;
use App\Services\AuditLogger;
use App\Services\OtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Modules\Auth\Http\Requests\LoginRequest;
use Modules\Auth\Http\Requests\OtpVerifyRequest;
use Modules\Auth\Http\Resources\UserResource;

class AuthController extends Controller
{
    public function __construct(private readonly OtpService $otpService)
    {
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = SystemUser::where('email', $request->string('email'))->first();

        if (! $user || ! Hash::check($request->string('password'), $user->password_hash)) {
            AuditLogger::log(
                'Failed login attempt',
                'Authentication',
                'Warning',
                'user',
                $user?->username,
                'Invalid credentials supplied.',
                $user
            );

            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

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

        return response()->json($this->otpResponse(
            'One-time password sent to your work email.',
            $issued
        ));
    }

    public function verifyOtp(OtpVerifyRequest $request): JsonResponse
    {
        $user = $this->otpService->verify(
            $request->string('login_token'),
            $request->string('otp')
        );

        if (! $user) {
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

        $token = $user->createToken('auth-token')->plainTextToken;

        $user->forceFill([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ])->save();

        UserLoginActivity::create([
            'system_user_id' => $user->system_user_id,
            'login_at' => now(),
            'ip_address' => $request->ip(),
            'device_info' => $this->deviceInfo($request),
            'user_agent' => $request->userAgent(),
            'status' => 'success',
        ]);

        AuditLogger::log(
            'User logged in',
            'Authentication',
            'Info',
            'user',
            $user->username,
            'Two-factor login completed.',
            $user
        );

        return response()->json([
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => new UserResource($user),
        ]);
    }

    public function resendOtp(Request $request): JsonResponse
    {
        $request->validate(['login_token' => ['required', 'string']]);

        $result = $this->otpService->resend($request->string('login_token'));

        if (! $result['ok']) {
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

    private function debugOtp(string $code): array
    {
        if (! app()->environment(['local', 'testing'])) {
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