<?php

namespace Tests\Feature;

use App\Models\SystemUser;
use Tests\Concerns\RefreshesSeededDatabase;
use Tests\TestCase;

class AuthLockoutTest extends TestCase
{
    use RefreshesSeededDatabase;

    public function test_five_wrong_passwords_lock_the_account(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/auth/login', [
                'email' => 'bullseur@oxfordsuites.com.ph',
                'password' => 'wrong-password',
            ])->assertStatus(401);
        }

        // Even the correct password is rejected while locked.
        $this->postJson('/api/v1/auth/login', [
            'email' => 'bullseur@oxfordsuites.com.ph',
            'password' => 'Oxford@2026',
        ])->assertStatus(423);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'Account locked',
            'module_name' => 'Authentication',
        ]);
    }

    public function test_lock_expires_and_success_resets_counter(): void
    {
        /** @var SystemUser $user */
        $user = SystemUser::where('email', 'bullseur@oxfordsuites.com.ph')->firstOrFail();
        $user->forceFill(['locked_until' => now()->subMinute()])->save();

        $login = $this->postJson('/api/v1/auth/login', [
            'email' => 'bullseur@oxfordsuites.com.ph',
            'password' => 'Oxford@2026',
        ])->assertOk()->json();

        $this->assertArrayHasKey('login_token', $login);
        $this->assertNull($user->fresh()->locked_until);
        $this->assertEquals(0, $user->fresh()->failed_attempts);
    }
}
