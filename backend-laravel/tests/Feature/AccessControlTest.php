<?php

namespace Tests\Feature;

use App\Models\SystemUser;
use Modules\Settings\Models\SystemSetting;
use Tests\Concerns\RefreshesSeededDatabase;
use Tests\TestCase;

class AccessControlTest extends TestCase
{
    use RefreshesSeededDatabase;

    private function roleToken(int $roleId): string
    {
        $user = SystemUser::where('role_id', $roleId)->firstOrFail();

        return $user->createToken('test-token')->plainTextToken;
    }

    public function test_settings_endpoints_require_auth(): void
    {
        $this->getJson('/api/v1/settings')->assertStatus(401);
        $this->patchJson('/api/v1/settings/bulk', [
            'settings' => [['key' => 'company.name', 'value' => 'x']],
        ])->assertStatus(401);
        $this->postJson('/api/v1/reset-default-password', ['password' => 'NewPass@123'])->assertStatus(401);
        $this->postJson('/api/v1/my/change-password', [
            'current_password' => 'anything',
            'new_password' => 'NewPass@123',
        ])->assertStatus(401);
    }

    public function test_applicants_require_auth(): void
    {
        $this->getJson('/api/v1/applicants')->assertStatus(401);
        $this->postJson('/api/v1/applicants', [
            'job_post_id' => 1,
            'name' => 'Test',
            'email' => 'test@example.com',
        ])->assertStatus(401);
        $this->getJson('/api/v1/interviews')->assertStatus(401);
    }

    public function test_job_posts_require_auth(): void
    {
        $this->getJson('/api/v1/job-posts')->assertStatus(401);
        $this->postJson('/api/v1/job-posts', ['title' => 'Test'])->assertStatus(401);
        $this->getJson('/api/v1/requisitions')->assertStatus(401);
    }

    public function test_new_hires_require_auth(): void
    {
        $this->getJson('/api/v1/new-hires')->assertStatus(401);
        $this->postJson('/api/v1/new-hires', ['name' => 'Test'])->assertStatus(401);
        $this->getJson('/api/v1/checklist-templates')->assertStatus(401);
    }

    public function test_ess_admin_endpoints_require_write_level(): void
    {
        $token = $this->roleToken(3);

        $this->getJson('/api/v1/ess/admin/requests', $this->authHeaders($token))->assertStatus(403);
        $this->getJson('/api/v1/ess/admin/audit-logs', $this->authHeaders($token))->assertStatus(403);
    }

    public function test_employee_role_cannot_reset_default_password(): void
    {
        $token = $this->roleToken(3);

        $this->postJson('/api/v1/reset-default-password', [
            'password' => 'NewPass@123',
        ], $this->authHeaders($token))->assertStatus(403);
    }

    public function test_read_only_core_hcm_user_cannot_write(): void
    {
        $token = $this->roleToken(2);

        $this->getJson('/api/v1/departments', $this->authHeaders($token))->assertOk();

        $this->postJson('/api/v1/departments', [
            'code' => 'DEP-NOPE',
            'name' => 'Nope',
        ], $this->authHeaders($token))->assertStatus(403);
    }

    public function test_default_password_redacted_for_non_full_users(): void
    {
        SystemSetting::setValue('default_password', ['password' => 'Secret@123']);

        $this->app->make('auth')->forgetGuards();

        $admin = $this->roleToken(2);
        $response = $this->getJson('/api/v1/settings', $this->authHeaders($admin))
            ->assertOk()
            ->assertJsonMissingPath('map.default_password');

        // Verify non-sensitive settings are visible (key contains dot, so use direct json access)
        $this->assertSame('Oxford Suites Makati', $response->json('map')['company.name']['value'] ?? null);

        $this->app->make('auth')->forgetGuards();

        $superAdmin = $this->superAdminToken();
        $this->getJson('/api/v1/settings', $this->authHeaders($superAdmin))
            ->assertOk()
            ->assertJsonPath('map.default_password.password', 'Secret@123');
    }

    public function test_super_admin_can_modify_editable_role_permissions(): void
    {
        $token = $this->loginViaOtp();

        // Super Admin can edit an editable role (Employee = role 3), including
        // turning off edit permission for lifecycle actions (Core HCM).
        $this->putJson('/api/v1/roles/3/permissions', [
            'permissions' => [
                ['module_name' => 'Core HCM', 'permission_level' => 'None'],
            ],
        ], $this->authHeaders($token))->assertOk();
    }

    public function test_protected_role_permissions_cannot_be_modified_by_anyone(): void
    {
        $token = $this->loginViaOtp();

        $this->putJson('/api/v1/roles/1/permissions', [
            'permissions' => [
                ['module_name' => 'Core HCM', 'permission_level' => 'None'],
            ],
        ], $this->authHeaders($token))->assertStatus(403);
    }

    public function test_non_standard_permission_levels_are_accepted(): void
    {
        $token = $this->loginViaOtp();

        $this->putJson('/api/v1/roles/3/permissions', [
            'permissions' => [
                ['module_name' => 'Applicant Management', 'permission_level' => 'Edit'],
                ['module_name' => 'ESS Management', 'permission_level' => 'Approve / Reject Only'],
            ],
        ], $this->authHeaders($token))->assertOk();
    }

    public function test_non_super_admin_cannot_modify_super_admin_role_permissions(): void
    {
        $token = $this->roleToken(2);

        $this->putJson('/api/v1/roles/1/permissions', [
            'permissions' => [
                ['module_name' => 'Core HCM', 'permission_level' => 'None'],
            ],
        ], $this->authHeaders($token))->assertStatus(403);
    }

    public function test_my_change_password_updates_authenticated_user(): void
    {
        $token = $this->loginViaOtp();

        $this->postJson('/api/v1/my/change-password', [
            'current_password' => 'Oxford@2026',
            'new_password' => 'Changed@123',
        ], $this->authHeaders($token))->assertOk();

        $this->postJson('/api/v1/auth/login', [
            'email' => 'bullseur@oxfordsuites.com.ph',
            'password' => 'Changed@123',
        ])->assertOk();
    }

    public function test_my_settings_are_scoped_to_authenticated_user(): void
    {
        $token = $this->loginViaOtp();

        $this->putJson('/api/v1/my/settings/notifications', [
            'value' => ['ess_updates' => true],
        ], $this->authHeaders($token))->assertOk();

        $this->assertDatabaseHas('system_settings', [
            'setting_key' => 'my_notifications_bullseur@oxfordsuites.com.ph',
        ]);
    }
}