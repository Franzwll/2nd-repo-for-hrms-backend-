<?php

namespace Tests\Feature;

use App\Mail\SendOtpMail;
use App\Models\AuditLog;
use App\Models\SystemUser;
use App\Models\UserLoginActivity;
use Illuminate\Support\Facades\Mail;
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
        Mail::fake();

        $login = $this->postJson('/api/v1/auth/login', [
            'email' => 'bullseur@oxfordsuites.com.ph',
            'password' => 'Oxford@2026',
        ])->assertOk()->json();

        $this->assertArrayHasKey('login_token', $login);
        $this->assertArrayNotHasKey('debug_otp', $login);
        $this->assertEquals(120, $login['expires_in']);

        $otp = null;
        Mail::assertSent(SendOtpMail::class, function (SendOtpMail $mail) use (&$otp): bool {
            $otp = $mail->code;

            return true;
        });
        $this->assertNotNull($otp);

        $verify = $this->postJson('/api/v1/auth/otp/verify', [
            'login_token' => $login['login_token'],
            'otp' => $otp,
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

    public function test_resend_otp_issues_a_fresh_code(): void
    {
        Mail::fake();

        $login = $this->postJson('/api/v1/auth/login', [
            'email' => 'bullseur@oxfordsuites.com.ph',
            'password' => 'Oxford@2026',
        ])->assertOk()->json();

        $this->postJson('/api/v1/auth/otp/resend', [
            'login_token' => $login['login_token'],
        ])->assertOk()->assertJsonPath('expires_in', 120);

        Mail::assertSent(SendOtpMail::class, 2);

        // Only the most recently emailed code should work.
        $codes = [];
        Mail::assertSent(SendOtpMail::class, function (SendOtpMail $mail) use (&$codes): bool {
            $codes[] = $mail->code;

            return true;
        });
        $latest = end($codes);

        $this->postJson('/api/v1/auth/otp/verify', [
            'login_token' => $login['login_token'],
            'otp' => $latest,
        ])->assertOk()->assertJsonStructure(['token', 'user']);
    }

    public function test_resend_otp_rejects_unknown_token(): void
    {
        $this->postJson('/api/v1/auth/otp/resend', [
            'login_token' => 'not-a-real-token',
        ])->assertStatus(422);
    }

    public function test_resend_extends_the_code_lifetime(): void
    {
        Mail::fake();

        $login = $this->postJson('/api/v1/auth/login', [
            'email' => 'bullseur@oxfordsuites.com.ph',
            'password' => 'Oxford@2026',
        ])->assertOk()->json();

        // Resend late in the first window. The fresh code must live for its
        // own full lifetime, not for the first code's remaining seconds.
        $this->travel(100)->seconds();

        $this->postJson('/api/v1/auth/otp/resend', [
            'login_token' => $login['login_token'],
        ])->assertOk();

        // 200s after login: past the first code's expiry, inside the new one's.
        $this->travel(100)->seconds();

        $this->postJson('/api/v1/auth/otp/verify', [
            'login_token' => $login['login_token'],
            'otp' => $this->latestOtpCode(),
        ])->assertOk()->assertJsonStructure(['token', 'user']);
    }

    public function test_resend_works_after_the_code_has_expired(): void
    {
        Mail::fake();

        $login = $this->postJson('/api/v1/auth/login', [
            'email' => 'bullseur@oxfordsuites.com.ph',
            'password' => 'Oxford@2026',
        ])->assertOk()->json();

        $expiredCode = $this->latestOtpCode();

        $this->travel(121)->seconds();

        // The expired code is rejected...
        $this->postJson('/api/v1/auth/otp/verify', [
            'login_token' => $login['login_token'],
            'otp' => $expiredCode,
        ])->assertStatus(422);

        // ...but the user can still request a new one without signing in again.
        $this->postJson('/api/v1/auth/otp/resend', [
            'login_token' => $login['login_token'],
        ])->assertOk()->assertJsonPath('expires_in', 120);

        Mail::assertSent(SendOtpMail::class, 2);

        $this->postJson('/api/v1/auth/otp/verify', [
            'login_token' => $login['login_token'],
            'otp' => $this->latestOtpCode(),
        ])->assertOk()->assertJsonStructure(['token', 'user']);
    }

    public function test_login_reports_mail_delivery_failure(): void
    {
        Mail::shouldReceive('to')->andThrow(new \RuntimeException('SMTP unavailable'));

        $this->postJson('/api/v1/auth/login', [
            'email' => 'bullseur@oxfordsuites.com.ph',
            'password' => 'Oxford@2026',
        ])->assertStatus(503)
            ->assertJsonPath(
                'message',
                'We could not send your verification code right now. Please try again in a moment.'
            );
    }

    public function test_resend_reports_mail_delivery_failure(): void
    {
        Mail::fake();

        $login = $this->postJson('/api/v1/auth/login', [
            'email' => 'bullseur@oxfordsuites.com.ph',
            'password' => 'Oxford@2026',
        ])->assertOk()->json();

        Mail::shouldReceive('to')->andThrow(new \RuntimeException('SMTP unavailable'));

        $this->postJson('/api/v1/auth/otp/resend', [
            'login_token' => $login['login_token'],
        ])->assertStatus(503)
            ->assertJsonPath(
                'message',
                'We could not resend your verification code right now. Please try again in a moment.'
            );
    }

    private function latestOtpCode(): string
    {
        $mail = Mail::sent(SendOtpMail::class)->last();
        $this->assertNotNull($mail, 'No OTP email was sent.');

        return $mail->code;
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