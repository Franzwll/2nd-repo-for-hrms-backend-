<?php

namespace App\Services\Integration\Mocks;

use App\Services\Integration\Contracts\AttendanceProvider;
use Illuminate\Support\Facades\DB;

/**
 * Demo/local implementation of the Team 2 (Workforce Management) seam. Reads
 * the HRMS-side tables that mirror Team 2's data so the ESS can be shown
 * end-to-end before the real integration lands.
 */
class MockAttendanceProvider implements AttendanceProvider
{
    public function attendanceFor(int $employeeId): array
    {
        return DB::table('attendance_records')
            ->where('employee_id', $employeeId)
            ->orderByDesc('work_date')
            ->limit(30)
            ->get()
            ->map(fn ($r) => [
                'date' => $r->work_date,
                'time_in' => $r->time_in,
                'time_out' => $r->time_out,
                'hours_worked' => (float) ($r->hours_worked ?? 0),
                'overtime_hours' => (float) ($r->overtime_hours ?? 0),
            ])->all();
    }

    public function scheduleFor(int $employeeId): array
    {
        return DB::table('work_schedules')
            ->where('employee_id', $employeeId)
            ->orderBy('day_of_week')
            ->get()
            ->map(fn ($r) => [
                'day_of_week' => (int) $r->day_of_week,
                'shift_name' => $r->shift_name,
                'start_time' => $r->start_time,
                'end_time' => $r->end_time,
                'location' => $r->location,
                'is_rest_day' => (bool) $r->is_rest_day,
            ])->all();
    }

    public function leaveBalancesFor(int $employeeId): array
    {
        return DB::table('leave_balances')
            ->where('employee_id', $employeeId)
            ->get()
            ->map(fn ($r) => [
                'leave_type' => $r->leave_type,
                'period_year' => (int) $r->period_year,
                'total_days' => (float) $r->total_days,
                'used_days' => (float) $r->used_days,
                'available_days' => max(0, (float) $r->total_days - (float) $r->used_days),
            ])->all();
    }
}
