<?php

namespace Tests\Feature;

use App\Models\RolePermission;
use App\Models\SystemRole;
use App\Models\SystemUser;
use Tests\Concerns\RefreshesSeededDatabase;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshesSeededDatabase;

    public function test_list_users_and_roles(): void
    {
        $token = $this->loginViaOtp();

        $this->getJson('/api/v1/users?per_page=10', $this->authHeaders($token))
            ->assertOk()
            ->assertJsonPath('meta.total', 8);

        $this->getJson('/api/v1/roles', $this->authHeaders($token))
            ->assertOk()
            ->assertJsonPath('meta.total', 3);
    }

    public function test_create_update_delete_user(): void
    {
        $token = $this->loginViaOtp();

        $created = $this->postJson('/api/v1/users', [
            'username' => 'qa.user',
            'email' => 'qa.user@oxfordsuites.com.ph',
            'password' => 'Temp@1234',
            'full_name' => 'QA User',
            'role_id' => 2,
            'status' => 'Active',
        ], $this->authHeaders($token))->assertCreated()->json('data');

        $id = $created['system_user_id'];

        $this->putJson("/api/v1/users/{$id}", [
            'username' => 'qa.user',
            'email' => 'qa.user@oxfordsuites.com.ph',
            'full_name' => 'QA User Updated',
            'role_id' => 2,
            'status' => 'Active',
        ], $this->authHeaders($token))
            ->assertOk()
            ->assertJsonPath('data.full_name', 'QA User Updated');

        $login = $this->postJson('/api/v1/auth/login', [
            'email' => 'qa.user@oxfordsuites.com.ph',
            'password' => 'Temp@1234',
        ])->assertOk();

        $this->assertArrayHasKey('login_token', $login->json());

        $this->deleteJson("/api/v1/users/{$id}", [], $this->authHeaders($token))
            ->assertOk();

        $this->assertDatabaseMissing('system_users', ['system_user_id' => $id]);
    }

    public function test_create_user_without_status_defaults_to_active(): void
    {
        $token = $this->loginViaOtp();

        $this->postJson('/api/v1/users', [
            'username' => 'no.status',
            'email' => 'no.status@oxfordsuites.com.ph',
            'password' => 'Temp@1234',
            'full_name' => 'No Status User',
            'role_id' => 3,
        ], $this->authHeaders($token))
            ->assertCreated()
            ->assertJsonPath('data.status', 'Active');
    }

    public function test_admin_can_reset_password_and_revoke_sessions(): void
    {
        $token = $this->loginViaOtp();

        $created = $this->postJson('/api/v1/users', [
            'username' => 'reset.user',
            'email' => 'reset.user@oxfordsuites.com.ph',
            'password' => 'Temp@1234',
            'full_name' => 'Reset User',
            'role_id' => 3,
            'status' => 'Active',
        ], $this->authHeaders($token))->assertCreated()->json('data');

        $user = SystemUser::findOrFail($created['system_user_id']);
        $session = $user->createToken('reset-test');
        $sessionId = $session->accessToken->id;

        $this->postJson("/api/v1/users/{$user->system_user_id}/password", [
            'password' => 'Reset@1234',
        ], $this->authHeaders($token))->assertOk();

        $this->assertDatabaseMissing('personal_access_tokens', ['id' => $sessionId]);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'reset.user@oxfordsuites.com.ph',
            'password' => 'Reset@1234',
        ])->assertOk();

        $this->postJson('/api/v1/auth/login', [
            'email' => 'reset.user@oxfordsuites.com.ph',
            'password' => 'Temp@1234',
        ])->assertStatus(401);
    }

    public function test_non_super_admin_cannot_reset_super_admin_password(): void
    {
        $admin = SystemUser::where('role_id', 2)->firstOrFail();
        $token = $admin->createToken('test-token')->plainTextToken;

        $this->postJson('/api/v1/users/1/password', [
            'password' => 'Reset@1234',
        ], $this->authHeaders($token))->assertStatus(403);
    }

    public function test_cannot_delete_last_active_super_admin(): void
    {
        $token = $this->loginViaOtp();

        $this->deleteJson('/api/v1/users/1', [], $this->authHeaders($token))
            ->assertStatus(422);
    }

    public function test_cannot_deactivate_last_active_super_admin(): void
    {
        $token = $this->loginViaOtp();
        $user = SystemUser::findOrFail(1);

        $this->putJson('/api/v1/users/1', [
            'username' => $user->username,
            'email' => $user->email,
            'full_name' => $user->full_name,
            'role_id' => 1,
            'status' => 'Suspended',
        ], $this->authHeaders($token))->assertStatus(422);
    }

    public function test_protected_role_cannot_be_renamed_or_deleted(): void
    {
        $token = $this->loginViaOtp();

        $this->putJson('/api/v1/roles/1', [
            'role_name' => 'Renamed Super Admin',
        ], $this->authHeaders($token))->assertStatus(403);

        $this->deleteJson('/api/v1/roles/1', [], $this->authHeaders($token))
            ->assertStatus(403);
    }

    public function test_update_role_permissions(): void
    {
        $token = $this->loginViaOtp();

        $role = SystemRole::where('role_name', 'Employee')->firstOrFail();

        $permissions = [
            ['module_name' => 'Core HCM', 'permission_level' => 'Read'],
            ['module_name' => 'Dashboard', 'permission_level' => 'View'],
            ['module_name' => 'User Management', 'permission_level' => 'None'],
        ];

        $this->putJson("/api/v1/roles/{$role->role_id}/permissions", [
            'permissions' => $permissions,
        ], $this->authHeaders($token))->assertOk();

        $this->assertDatabaseHas('role_permissions', [
            'role_id' => $role->role_id,
            'module_name' => 'Core HCM',
            'permission_level' => 'Read',
        ]);

        $this->assertDatabaseMissing('role_permissions', [
            'role_id' => $role->role_id,
            'module_name' => 'User Management',
        ]);
    }

    public function test_employee_role_cannot_manage_users(): void
    {
        $user = SystemUser::where('role_id', 3)->firstOrFail();
        $token = $user->createToken('test-token')->plainTextToken;

        $this->getJson('/api/v1/users', $this->authHeaders($token))->assertStatus(403);
    }
}