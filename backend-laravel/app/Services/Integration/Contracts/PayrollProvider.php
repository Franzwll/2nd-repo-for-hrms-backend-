<?php

namespace App\Services\Integration\Contracts;

/**
 * Integration seam for Payroll & Benefits (Cluster 4, Team 4):
 * Payroll Management, Compensation, Claims, HMO & Benefits.
 */
interface PayrollProvider
{
    /** @return array<int, array<string, mixed>> payslips */
    public function payslipsFor(int $employeeId): array;

    /** @return array<int, array<string, mixed>> benefit enrollments */
    public function benefitsFor(int $employeeId): array;
}
