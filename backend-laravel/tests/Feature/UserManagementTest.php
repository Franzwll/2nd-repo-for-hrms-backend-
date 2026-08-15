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

    public function test_cannot_delete_last_active_super_admin(): void
    {
        $token = $this->loginViaOtp();

        $this->deleteJson('/api/v1/users/1', [], $this->authHeaders($token))
            ->assertStatus(422);
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