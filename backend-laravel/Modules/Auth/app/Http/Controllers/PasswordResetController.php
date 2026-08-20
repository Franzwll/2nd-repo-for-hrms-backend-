<?php

namespace Modules\Auth\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\SystemUser;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Modules\Auth\Http\Requests\ForgotPasswordRequest;
use Modules\Auth\Http\Requests\ResetPasswordRequest;
use Modules\Auth\Mail\SendPasswordResetMail;
use Modules\Auth\Services\PasswordResetService;

class PasswordResetController extends Controller
{
    public function __construct(private readonly PasswordResetService $service)
    {
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $email = $request->string('email')->toString();
        $user = SystemUser::where('email', $email)->first();

        if ($user && $user->status === 'Active') {
            $token = $this->service->issue($user);

            $frontendUrl = rtrim((string) config('app.frontend_url'), '/');
            $resetUrl = $frontendUrl . '/reset-password?token=' . $token;

            try {
                Mail::to($user->email)->send(new SendPasswordResetMail(
                    $resetUrl,
                    $user->full_name ?: $user->username,
                    (int) round(PasswordResetService::ttlSeconds() / 60)
                ));
            } catch (\Throwable $e) {
                report($e);
            }

            AuditLogger::log(
                'Password reset requested',
                'Authentication',
                'Info',
                'user',
                $user->username,
                'Password reset link emailed to ' . $this->maskEmail($user->email),
                $user
            );
        }

        return response()->json([
            'message' => 'If that email matches an active account, a password reset link has been sent.',
        ]);
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $token = $request->string('token')->toString();
        $user = $this->service->findUser($token);

        if (! $user) {
            AuditLogger::log(
                'Failed password reset',
                'Authentication',
                'Warning',
                'user',
                null,
                'Invalid or expired password reset token attempt.',
            );

            return response()->json([
                'message' => 'This reset link is invalid or has expired. Please request a new one.',
            ], 422);
        }

        if ($user->status !== 'Active') {
            return response()->json(['message' => 'Your account is not active. Contact an administrator.'], 403);
        }

        $user->forceFill([
            'password_hash' => Hash::make($request->string('password')),
        ])->save();

        $this->service->consume($token);

        $user->tokens()->delete();

        AuditLogger::log(
            'Password reset completed',
            'Authentication',
            'Info',
            'user',
            $user->username,
            'Password changed via self-service reset link.',
            $user
        );

        return response()->json([
            'message' => 'Your password has been reset. You can now sign in.',
        ]);
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
}