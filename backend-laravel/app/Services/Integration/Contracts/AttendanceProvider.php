<?php

namespace App\Services\Integration\Contracts;

/**
 * Integration seam for Workforce Management (Cluster 4, Team 2):
 * Time & Attendance, Shift/Schedule, Timesheet, Leave Management.
 *
 * ESS reads attendance/schedule/leave through this contract. Today it is bound
 * to a local mock; when Team 2 exposes real endpoints this binding is swapped
 * for an HTTP client with no controller changes.
 */
interface AttendanceProvider
{
    /** @return array<int, array<string, mixed>> daily time records */
    public function attendanceFor(int $employeeId): array;

    /** @return array<int, array<string, mixed>> assigned shifts */
    public function scheduleFor(int $employeeId): array;

    /** @return array<int, array<string, mixed>> leave balances */
    public function leaveBalancesFor(int $employeeId): array;
}
