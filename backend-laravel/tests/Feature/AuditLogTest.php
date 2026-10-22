<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Department;
use App\Models\SystemUser;
use Tests\Concerns\RefreshesSeededDatabase;
use Tests\TestCase;

class AuditLogTest extends TestCase
{
    use RefreshesSeededDatabase;

    public function test_list_audit_logs(): void
    {
        $token = $this->loginViaOtp();

        $this->getJson('/api/v1/audit-logs?per_page=10', $this->authHeaders($token))
            ->assertOk()
            ->assertJsonStructure([
                'data' => [['audit_log_id', 'action', 'module_name', 'severity']],
                'meta' => ['total'],
            ]);
    }

    public function test_stats_returns_counts(): void
    {
        $token = $this->loginViaOtp();

        $this->getJson('/api/v1/audit-logs/stats', $this->authHeaders($token))
            ->assertOk()
            ->assertJsonStructure([
                'data' => ['total', 'by_severity', 'by_module', 'modules', 'unique_actors'],
            ]);
    }

    public function test_list_supports_pagination_filters_and_date_validation(): void
    {
        $token = $this->loginViaOtp();

        $this->getJson('/api/v1/audit-logs?per_page=999', $this->authHeaders($token))
            ->assertOk()
            ->assertJsonPath('meta.per_page', 100);

        $this->getJson('/api/v1/audit-logs?severity=Warning&per_page=5', $this->authHeaders($token))
            ->assertOk()
            ->assertJsonPath('meta.per_page', 5);

        $this->getJson('/api/v1/audit-logs?from=2026-01-02&to=2026-01-01', $this->authHeaders($token))
            ->assertStatus(422);
    }

    public function test_employee_role_cannot_access_audit_logs(): void
    {
        $user = SystemUser::where('role_id', 3)->firstOrFail();
        $token = $user->createToken('test-token')->plainTextToken;

        $this->getJson('/api/v1/audit-logs', $this->authHeaders($token))->assertStatus(403);
    }

    public function test_actions_are_audited(): void
    {
        $token = $this->loginViaOtp();

        $this->postJson('/api/v1/departments', [
            'code' => 'DEP-AUD',
            'name' => 'Audit Check Dept',
        ], $this->authHeaders($token))->assertCreated();

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'Department created',
            'module_name' => 'Core HCM',
        ]);

        $department = Department::where('code', 'DEP-AUD')->firstOrFail();
        $department->update(['name' => 'Audit Check Dept Updated']);

        $log = AuditLog::where('action', 'Department updated')->latest('audit_log_id')->firstOrFail();

        $this->assertStringContainsString(
            'name: Audit Check Dept -> Audit Check Dept Updated',
            (string) $log->details,
        );
    }
}