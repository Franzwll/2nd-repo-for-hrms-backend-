<?php

namespace Tests\Feature;

use App\Models\AuditLog;
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
            ->assertJsonStructure(['data' => ['total', 'by_severity', 'by_module']]);
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
    }
}