<?php

namespace Tests\Feature;

use App\Services\SecurityPolicy;
use Modules\Settings\Models\SystemSetting;
use Tests\Concerns\RefreshesSeededDatabase;
use Tests\TestCase;

class SecurityPolicyTest extends TestCase
{
    use RefreshesSeededDatabase;

    private function setPolicy(array $overrides): void
    {
        SystemSetting::setValue('security', array_merge(SecurityPolicy::settings(), $overrides));
    }

    public function test_lockout_threshold_uses_the_configured_maximum(): void
    {
        $this->setPolicy(['maxLoginAttempts' => '3 attempts']);

        for ($i = 0; $i < 3; $i++) {
            $this->postJson('/api/v1/auth/login', [
                'email' => 'bullseur@oxfordsuites.com.ph',
                'password' => 'wrong-password',
            ])->assertStatus(401);
        }

        $this->postJson('/api/v1/auth/login', [
            'email' => 'bullseur@oxfordsuites.com.ph',
            'password' => 'Oxford@2026',
        ])->assertStatus(423);
    }

    public function test_session_policy_uses_the_configured_idle_timeout(): void
    {
        $this->setPolicy(['sessionTimeout' => '60 minutes']);

        $this->getJson('/api/v1/auth/session-policy')
            ->assertOk()
            ->assertJsonPath('idle_timeout_minutes', 60)
            ->assertJsonPath('roles.superadmin.idle_minutes', 60)
            ->assertJsonPath('roles.admin.idle_minutes', 60)
            ->assertJsonPath('roles.employee.idle_minutes', 60);
    }

    public function test_password_changes_enforce_the_configured_policy(): void
    {
        $this->setPolicy([
            'minLength' => 12,
            'requireUppercase' => true,
            'requireLowercase' => true,
            'requireNumber' => true,
            'requireSymbol' => true,
        ]);

        $token = $this->superAdminToken();

        $this->postJson('/api/v1/my/change-password', [
            'current_password' => 'Oxford@2026',
            'new_password' => 'LongPassword1',
        ], $this->authHeaders($token))->assertStatus(422);

        $this->postJson('/api/v1/my/change-password', [
            'current_password' => 'Oxford@2026',
            'new_password' => 'LongPass@1234',
        ], $this->authHeaders($token))->assertOk();
    }

    public function test_backup_routes_require_authentication_and_full_settings_access(): void
    {
        $this->getJson('/api/v1/settings/backups')->assertStatus(401);

        $employee = \App\Models\SystemUser::where('role_id', 3)->firstOrFail();
        $employeeToken = $employee->createToken('test-token')->plainTextToken;

        $this->getJson('/api/v1/settings/backups', $this->authHeaders($employeeToken))
            ->assertStatus(403);

        $this->getJson('/api/v1/settings/backups', $this->authHeaders($this->superAdminToken()))
            ->assertOk();
    }
}
