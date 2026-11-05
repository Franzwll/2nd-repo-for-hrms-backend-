<?php

namespace Tests\Feature;

use Tests\Concerns\RefreshesSeededDatabase;
use Tests\TestCase;

/**
 * Guards GET /ess/my-payroll: the payslip block used to throw a 500 because the
 * Schema facade was referenced without an import, so the ESS portal silently
 * rendered zero amounts and no payslips.
 */
class EssPayrollPayslipTest extends TestCase
{
    use RefreshesSeededDatabase;

    public function test_payroll_endpoint_returns_payslips_and_statutory_ids(): void
    {
        $response = $this->getJson('/api/v1/ess/my-payroll', $this->authHeaders($this->superAdminToken()));

        $response->assertOk()
            ->assertJsonPath('hero_source', 'released')
            ->assertJsonStructure([
                'employee_name',
                'statutory' => ['sss', 'philhealth', 'pagibig', 'tin'],
                'payslips' => [
                    '*' => ['id', 'period', 'gross', 'net', 'status', 'earnings', 'deductions_breakdown'],
                ],
            ]);

        $data = $response->json();

        $this->assertNotEmpty($data['employee_name']);
        $this->assertNotEmpty($data['statutory']['sss']);
        $this->assertNotEmpty($data['payslips']);
        $this->assertNotEmpty($data['payslips'][0]['earnings']);
        $this->assertNotEmpty($data['payslips'][0]['deductions_breakdown']);
        $this->assertGreaterThan(0, $data['payslips'][0]['gross']);
    }
}
