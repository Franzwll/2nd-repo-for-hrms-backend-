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

    public function test_unlinked_staff_cannot_resolve_another_employee(): void
    {
        $this->getJson(
            '/api/v1/ess/my-overview',
            $this->authHeaders($this->tokenFor(1)),
        )->assertStatus(409)
            ->assertJsonPath('code', 'ESS_NOT_LINKED')
            ->assertJsonMissingPath('employee');
    }

    public function test_unlinked_staff_gets_409_on_other_my_endpoints(): void
    {
        $headers = $this->authHeaders($this->tokenFor(1));

        foreach (['my-schedule', 'my-leaves', 'my-benefits'] as $endpoint) {
            $this->getJson('/api/v1/ess/' . $endpoint, $headers)
                ->assertStatus(409)
                ->assertJsonPath('code', 'ESS_NOT_LINKED');
        }
    }

    public function test_linked_admin_overview_resolves_the_linked_employee(): void
    {
        $response = $this->getJson(
            '/api/v1/ess/my-overview',
            $this->authHeaders($this->tokenFor(2)),
        )->assertOk()->json();

        $this->assertSame(7, $response['employee']['id']);
    }

    public function test_employee_overview_still_resolves_the_employee_record(): void
    {
        $response = $this->getJson(
            '/api/v1/ess/my-overview',
            $this->authHeaders($this->tokenFor(4)),
        )->assertOk()->json();

        $this->assertSame(5, $response['employee']['id']);
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
