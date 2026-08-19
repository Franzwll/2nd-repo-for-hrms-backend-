<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\SystemUser;
use App\Models\UserLoginActivity;
use Tests\Concerns\RefreshesSeededDatabase;
use Tests\TestCase;

class AuthFlowTest extends TestCase
{
    use RefreshesSeededDatabase;

    public function test_login_rejects_invalid_credentials(): void
    {
        $this->postJson('/api/v1/auth/login', [
            'email' => 'bullseur@oxfordsuites.com.ph',
            'password' => 'wrong-password',
        ])->assertStatus(401);
    }

    public function test_login_issues_otp_and_verify_returns_token(): void
    {
        $login = $this->postJson('/api/v1/auth/login', [
            'email' => 'bullseur@oxfordsuites.com.ph',
            'password' => 'Oxford@2026',
        ])->assertOk()->json();

        $this->assertArrayHasKey('login_token', $login);
        $this->assertArrayHasKey('debug_otp', $login);
        $this->assertEquals(300, $login['expires_in']);

        $verify = $this->postJson('/api/v1/auth/otp/verify', [
            'login_token' => $login['login_token'],
            'otp' => $login['debug_otp'],
        ])->assertOk()->json();

        $this->assertArrayHasKey('token', $verify);
        $this->assertEquals('Super Admin', $verify['user']['role']);
        $this->assertEquals('bullseur@oxfordsuites.com.ph', $verify['user']['email']);

        $this->assertDatabaseHas('user_login_activity', [
            'system_user_id' => $verify['user']['system_user_id'],
            'status' => 'success',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'User logged in',
            'module_name' => 'Authentication',
        ]);
    }

    public function test_otp_verify_rejects_invalid_token(): void
    {
        $this->postJson('/api/v1/auth/otp/verify', [
            'login_token' => 'not-a-real-token',
            'otp' => '000000',
        ])->assertStatus(422);
    }

    public function test_me_returns_authenticated_user(): void
    {
        $token = $this->loginViaOtp();

        $this->getJson('/api/v1/auth/me', $this->authHeaders($token))
            ->assertOk()
            ->assertJsonPath('user.email', 'bullseur@oxfordsuites.com.ph');
    }

    public function test_logout_revokes_token(): void
    {
        $token = $this->loginViaOtp();

        $this->assertDatabaseCount('personal_access_tokens', 1);

        $this->postJson('/api/v1/auth/logout', [], $this->authHeaders($token))->assertOk();

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_me_requires_token(): void
    {
        $this->getJson('/api/v1/auth/me')->assertStatus(401);
    }
}