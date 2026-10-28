<?php

namespace Tests\Feature;

use App\Models\SystemUser;
use Tests\Concerns\RefreshesSeededDatabase;
use Tests\TestCase;

class EssAdminSelfServiceTest extends TestCase
{
    use RefreshesSeededDatabase;

    private function tokenFor(int $systemUserId): string
    {
        $this->resetAuthGuards();

        return SystemUser::findOrFail($systemUserId)->createToken('test-token')->plainTextToken;
    }

    public function test_admin_context_uses_the_linked_employee_record(): void
    {
        $response = $this->getJson(
            '/api/v1/ess/my-context',
            $this->authHeaders($this->tokenFor(2)),
        )->assertOk()->json();

        $this->assertTrue($response['linked']);
        $this->assertSame(7, $response['employee']['id']);
    }

    public function test_superadmin_without_an_employee_link_gets_no_fallback_record(): void
    {
        $response = $this->getJson(
            '/api/v1/ess/my-context',
            $this->authHeaders($this->tokenFor(1)),
        )->assertOk()->json();

        $this->assertFalse($response['linked']);
        $this->assertNull($response['employee']);
    }

    public function test_employee_context_still_resolves_the_employee_record(): void
    {
        $response = $this->getJson(
            '/api/v1/ess/my-context',
            $this->authHeaders($this->tokenFor(4)),
        )->assertOk()->json();

        $this->assertTrue($response['linked']);
        $this->assertSame(5, $response['employee']['id']);
    }
}
