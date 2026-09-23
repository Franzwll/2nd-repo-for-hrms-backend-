<?php

namespace Tests\Feature;

use App\Models\SystemUser;
use PragmaRX\Google2FA\Google2FA;
use Tests\Concerns\RefreshesSeededDatabase;
use Tests\TestCase;

class MfaTotpTest extends TestCase
{
    use RefreshesSeededDatabase;

    private function enrollTotp(SystemUser $user): array
    {
        $token = $user->createToken('test-token')->plainTextToken;

        $setup = $this->postJson(
            '/api/v1/auth/mfa/totp/setup',
            [],
            $this->authHeaders($token)
        )->assertOk()->json();

        $this->assertArrayHasKey('qr_svg', $setup);
        $this->assertArrayHasKey('manual_key', $setup);

        // The pending secret lives in cache; pull the current code from it
        // via a fresh TOTP computation for the test user.
        $google = new Google2FA;
        $pending = cache()->get('mfa.setup.' . $user->system_user_id);
        $this->assertNotEmpty($pending['secret']);

        $code = $google->getCurrentOtp($pending['secret']);

        $confirm = $this->postJson(
            '/api/v1/auth/mfa/totp/confirm',
            ['code' => $code, 'password' => 'Oxford@2026'],
            $this->authHeaders($token)
        )->assertOk()->json();

        $this->assertArrayHasKey('recovery_codes', $confirm);
        $this->assertCount(8, $confirm['recovery_codes']);

        // Confirm consumed this window's code via replay protection; clear the
        // marker so later steps simulate codes from a fresh 30s window.
        cache()->forget('auth.mfa.used.' . $user->system_user_id . '.' . $code);

        return $confirm['recovery_codes'];
    }

    public function test_totp_enrollment_then_login_with_app_code(): void
    {
        $user = SystemUser::where('email', 'bullseur@oxfordsuites.com.ph')->firstOrFail();
        $this->enrollTotp($user);

        $login = $this->postJson('/api/v1/auth/login', [
            'email' => 'bullseur@oxfordsuites.com.ph',
            'password' => 'Oxford@2026',
        ])->assertOk()->json();

        $this->assertEquals('totp', $login['mfa_method']);
        $this->assertArrayHasKey('login_token', $login);

        $google = new Google2FA;
        $code = $google->getCurrentOtp($user->fresh()->totp_secret);

        $verify = $this->postJson('/api/v1/auth/mfa/verify', [
            'login_token' => $login['login_token'],
            'code' => $code,
        ])->assertOk()->json();

        $this->assertArrayHasKey('token', $verify);
        $this->assertEquals('Super Admin', $verify['user']['role']);
    }

    public function test_totp_verify_rejects_wrong_code(): void
    {
        $user = SystemUser::where('email', 'bullseur@oxfordsuites.com.ph')->firstOrFail();
        $this->enrollTotp($user);

        $login = $this->postJson('/api/v1/auth/login', [
            'email' => 'bullseur@oxfordsuites.com.ph',
            'password' => 'Oxford@2026',
        ])->assertOk()->json();

        $this->postJson('/api/v1/auth/mfa/verify', [
            'login_token' => $login['login_token'],
            'code' => '000000',
        ])->assertStatus(422);
    }

    public function test_recovery_code_signs_in_once(): void
    {
        // Enroll directly (setup/confirm flow is covered by other tests) to
        // keep this test's HTTP hits inside the shared guest-throttle budget.
        $user = SystemUser::where('email', 'bullseur@oxfordsuites.com.ph')->firstOrFail();
        $codes = \App\Services\TotpService::generateRecoveryCodes();
        $user->forceFill([
            'totp_secret' => (new Google2FA)->generateSecretKey(),
            'totp_confirmed_at' => now(),
            'mfa_method' => 'totp',
            'mfa_recovery_codes' => $codes['hashes'],
        ])->save();
        $plain = $codes['plain'];

        $login = $this->postJson('/api/v1/auth/login', [
            'email' => 'bullseur@oxfordsuites.com.ph',
            'password' => 'Oxford@2026',
        ])->assertOk()->json();

        $this->postJson('/api/v1/auth/mfa/recover', [
            'login_token' => $login['login_token'],
            'recovery_code' => $plain[0],
        ])->assertOk()->json();

        $this->assertCount(7, $user->fresh()->mfa_recovery_codes);

        // Same code is burned — a second challenge cannot reuse it.
        $login2 = $this->postJson('/api/v1/auth/login', [
            'email' => 'bullseur@oxfordsuites.com.ph',
            'password' => 'Oxford@2026',
        ])->assertOk()->json();

        $this->postJson('/api/v1/auth/mfa/recover', [
            'login_token' => $login2['login_token'],
            'recovery_code' => $plain[0],
        ])->assertStatus(422);
    }

    public function test_superadmin_cannot_disable_totp(): void
    {
        $user = SystemUser::where('email', 'bullseur@oxfordsuites.com.ph')->firstOrFail();
        $this->enrollTotp($user);

        $token = $user->fresh()->createToken('test-token')->plainTextToken;

        $this->postJson(
            '/api/v1/auth/mfa/totp/disable',
            ['password' => 'Oxford@2026'],
            $this->authHeaders($token)
        )->assertStatus(403);
    }
}
