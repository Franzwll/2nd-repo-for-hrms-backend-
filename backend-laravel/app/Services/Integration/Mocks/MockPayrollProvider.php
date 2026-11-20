<?php

namespace App\Services\Integration\Mocks;

use App\Services\Integration\Contracts\PayrollProvider;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Demo/local implementation of the Team 4 (Payroll & Benefits) seam.
 */
class MockPayrollProvider implements PayrollProvider
{
    public function payslipsFor(int $employeeId): array
    {
        return DB::table('payroll_records')
            ->where('employee_id', $employeeId)
            ->orderByDesc('pay_period_end')
            ->get()
            ->map(fn ($r) => [
                'id' => 'PS-' . $r->payroll_record_id,
                'period' => Carbon::parse($r->pay_period_start)->format('M d') . ' - ' . Carbon::parse($r->pay_period_end)->format('M d, Y'),
                'gross' => (float) $r->gross_pay,
                'net' => (float) $r->net_pay,
                'deductions' => (float) $r->gross_pay - (float) $r->net_pay,
                'status' => $r->status,
                'payout_date' => $r->payout_date,
            ])->all();
    }

    public function benefitsFor(int $employeeId): array
    {
        $raw = DB::table('employees')->where('employee_id', $employeeId)->value('benefits_json');
        $rows = json_decode((string) $raw, true) ?: [];

        return array_map(fn ($r) => [
            'benefit_name' => $r['benefit_name'] ?? null,
            'reference_value' => $r['reference_value'] ?? null,
            'status' => $r['status'] ?? null,
            'effective_date' => $r['effective_date'] ?? null,
            'end_date' => $r['end_date'] ?? null,
        ], $rows);
    }
}
