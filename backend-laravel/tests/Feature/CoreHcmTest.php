<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\EmployeePositionHistory;
use App\Models\Position;
use App\Models\SystemUser;
use Tests\Concerns\RefreshesSeededDatabase;
use Tests\TestCase;

class CoreHcmTest extends TestCase
{
    use RefreshesSeededDatabase;

    public function test_employee_role_cannot_access_core_hcm(): void
    {
        $user = SystemUser::where('role_id', 3)->firstOrFail();
        $token = $user->createToken('test-token')->plainTextToken;

        $this->getJson('/api/v1/employees', $this->authHeaders($token))->assertStatus(403);
    }

    public function test_list_employees(): void
    {
        $token = $this->loginViaOtp();

        $response = $this->getJson('/api/v1/employees?per_page=5', $this->authHeaders($token))
            ->assertOk();

        $this->assertGreaterThan(0, $response->json('meta.total'));
        $this->assertArrayHasKey('employee_code', $response->json('data.0'));
    }

    public function test_create_department_and_position(): void
    {
        $token = $this->loginViaOtp();

        $dept = $this->postJson('/api/v1/departments', [
            'code' => 'DEP-TEST',
            'name' => 'QA Department',
        ], $this->authHeaders($token))->assertCreated()->json('data');

        $position = $this->postJson('/api/v1/positions', [
            'title' => 'QA Tester',
            'department_id' => $dept['department_id'],
            'salary_grade_id' => 1,
            'headcount' => 2,
        ], $this->authHeaders($token))->assertCreated()->json('data');

        $this->assertStringStartsWith('POS-', $position['position_code']);
        $this->assertDatabaseHas('positions', ['position_code' => $position['position_code']]);
    }

    public function test_employee_lifecycle_regularize_promote_exit(): void
    {
        $token = $this->loginViaOtp();

        $employee = $this->postJson('/api/v1/employees', [
            'first_name' => 'Test',
            'last_name' => 'Lifecycle',
            'email' => 'lifecycle.test@oxfordsuites.com.ph',
            'gender' => 'Male',
            'birth_date' => '1990-01-01',
            'department_id' => 1,
            'position_id' => 1,
            'employment_type' => 'Probationary',
            'status' => 'Active',
            'date_hired' => '2026-08-01',
        ], $this->authHeaders($token))->assertCreated()->json('data');

        $id = $employee['employee_id'];
        $this->assertStringStartsWith('EMP-', $employee['employee_code']);

        $this->postJson("/api/v1/employees/{$id}/regularize", [
            'effective_date' => '2026-12-01',
        ], $this->authHeaders($token))
            ->assertOk()
            ->assertJsonPath('data.employment_type', 'Regular');

        $this->postJson("/api/v1/employees/{$id}/promote", [
            'effective_date' => '2026-12-02',
            'new_position_id' => 2,
        ], $this->authHeaders($token))->assertOk();

        $this->postJson("/api/v1/employees/{$id}/exit", [
            'effective_date' => '2026-08-15',
            'exit_type' => 'Resigned',
            'exit_date' => '2026-08-15',
        ], $this->authHeaders($token))
            ->assertOk()
            ->assertJsonPath('data.status', 'Resigned');

        $this->assertDatabaseHas('employee_position_history', [
            'employee_id' => $id,
            'change_type' => 'Regularization',
        ]);
        $this->assertDatabaseHas('employee_exit_records', [
            'employee_id' => $id,
            'exit_type' => 'Resigned',
        ]);
    }

    public function test_org_chart_returns_departments(): void
    {
        $token = $this->loginViaOtp();

        $this->getJson('/api/v1/org-chart', $this->authHeaders($token))
            ->assertOk()
            ->assertJsonStructure(['data' => [['department_id', 'name']]]);
    }
}