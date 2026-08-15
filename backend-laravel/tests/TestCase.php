<?php

namespace Tests;

use App\Models\SystemUser;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function superAdminToken(): string
    {
        $user = SystemUser::where('email', 'bullseur@oxfordsuites.com.ph')->firstOrFail();

        return $user->createToken('test-token')->plainTextToken;
    }

    protected function authHeaders(string $token): array
    {
        return ['Authorization' => "Bearer {$token}", 'Accept' => 'application/json'];
    }

    protected function loginViaOtp(): string
    {
        $login = $this->postJson('/api/v1/auth/login', [
            'email' => 'bullseur@oxfordsuites.com.ph',
            'password' => 'Oxford@2026',
        ])->assertOk()->json();

        $verify = $this->postJson('/api/v1/auth/otp/verify', [
            'login_token' => $login['login_token'],
            'otp' => $login['debug_otp'],
        ])->assertOk()->json();

        return $verify['token'];
    }
}