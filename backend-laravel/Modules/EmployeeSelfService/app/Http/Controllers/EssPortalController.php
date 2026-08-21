<?php

namespace Modules\EmployeeSelfService\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\AttendanceRecord;
use App\Models\Employee;
use App\Models\EmployeeBenefit;
use App\Models\EssCategory;
use App\Models\EssRequest;
use App\Models\LeaveBalance;
use App\Models\WorkSchedule;
use App\Services\AuditLogger;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Modules\Settings\Models\SystemSetting;

class EssPortalController extends Controller
{
    /**
     * Resolve the current authenticated employee.
     * Fallback to first active employee if logged-in user is an admin without explicit employee_id.
     */
    protected function resolveEmployee(Request $request): ?Employee
    {
        $user = $request->user();
        if ($user?->employee_id) {
            return Employee::with(['department', 'position', 'supervisor'])->find($user->employee_id);
        }

        if ($user?->email) {
            $emp = Employee::with(['department', 'position', 'supervisor'])
                ->where('email', $user->email)
                ->orWhere('personal_email', $user->email)
                ->first();
            if ($emp) {
                return $emp;
            }
        }

        if ($user?->full_name) {
            $names = explode(' ', trim($user->full_name));
            $firstName = $names[0] ?? '';
            $lastName = count($names) > 1 ? end($names) : '';
            $query = Employee::with(['department', 'position', 'supervisor'])->where('first_name', $firstName);
            if ($lastName) {
                $query->where('last_name', $lastName);
            }
            $emp = $query->first();
            if ($emp) {
                return $emp;
            }
        }

        // For demo superadmin/admin accounts (roles 1, 2) fallback to first employee
        if ($user && in_array((int) $user->role_id, [1, 2])) {
            return Employee::with(['department', 'position', 'supervisor'])->first();
        }

        return null;
    }

    /**
     * GET /api/v1/ess/my-overview
     */
    public function getOverview(Request $request): JsonResponse
    {
        $user = $request->user();
        $employee = $this->resolveEmployee($request);

        if (! $employee) {
            $newHire = \Modules\NewHireOnboarding\Models\NewHire::with(['department', 'position'])
                ->where('email', $user?->email)
                ->orWhere('name', $user?->full_name)
                ->first();

            return response()->json([
                'employee' => [
                    'id' => null,
                    'code' => $newHire?->new_hire_code ?? 'EMP-NEW',
                    'name' => $user?->full_name ?? ($newHire?->name ?? 'Employee'),
                    'email' => $user?->email ?? ($newHire?->email ?? ''),
                    'department' => $newHire?->department?->name ?? ($user?->department_name ?? 'General'),
                    'position' => $newHire?->position?->title ?? ($user?->department_name ? $user->department_name . ' Staff' : 'Staff'),
                    'supervisor' => 'HR Administration',
                    'employment_type' => $newHire?->stage ?? 'Pre-onboarding',
                    'date_hired' => $newHire?->start_date ?? date('Y-m-d'),
                    'status' => 'Active',
                ],
                'today_schedule' => [
                    'shift_name' => 'Morning Shift',
                    'time' => '07:00 AM - 04:00 PM',
                    'is_rest_day' => false,
                    'location' => 'Oxford Suites Makati',
                ],
                'today_attendance' => [
                    'time_in' => null,
                    'time_out' => null,
                    'status' => 'Not Clocked In',
                ],
                'leave_balances' => [],
                'pending_requests_count' => 0,
            ]);
        }

        $today = Carbon::today();
        $dayOfWeek = ($today->dayOfWeekIso) % 7; // 0=Sunday..6=Saturday or standard index

        // Today's work schedule
        $todaySchedule = WorkSchedule::where('employee_id', $employee->employee_id)
            ->where(function ($q) use ($dayOfWeek) {
                $q->where('day_of_week', $dayOfWeek)
                  ->orWhere('day_of_week', $dayOfWeek === 0 ? 7 : $dayOfWeek);
            })
            ->first();

        // Today's attendance record
        $todayAttendance = AttendanceRecord::where('employee_id', $employee->employee_id)
            ->whereDate('work_date', $today->toDateString())
            ->first();

        // Leave balances
        $leaveBalances = LeaveBalance::where('employee_id', $employee->employee_id)
            ->where('period_year', $today->year)
            ->get()
            ->map(function ($lb) {
                return [
                    'id' => $lb->leave_balance_id,
                    'type' => $lb->leave_type,
                    'total' => (float) $lb->total_days,
                    'used' => (float) $lb->used_days,
                    'available' => (float) max(0, $lb->total_days - $lb->used_days),
                ];
            });

        // If no balances found for this employee, create default statutory balances
        if ($leaveBalances->isEmpty()) {
            $defaultBalances = [
                ['leave_type' => 'Vacation Leave', 'total_days' => 15, 'used_days' => 2],
                ['leave_type' => 'Sick Leave', 'total_days' => 15, 'used_days' => 3],
                ['leave_type' => 'Emergency Leave', 'total_days' => 5, 'used_days' => 1],
            ];
            foreach ($defaultBalances as $item) {
                LeaveBalance::create([
                    'employee_id' => $employee->employee_id,
                    'leave_type' => $item['leave_type'],
                    'period_year' => $today->year,
                    'total_days' => $item['total_days'],
                    'used_days' => $item['used_days'],
                ]);
            }
            $leaveBalances = LeaveBalance::where('employee_id', $employee->employee_id)
                ->where('period_year', $today->year)
                ->get()
                ->map(fn ($lb) => [
                    'id' => $lb->leave_balance_id,
                    'type' => $lb->leave_type,
                    'total' => (float) $lb->total_days,
                    'used' => (float) $lb->used_days,
                    'available' => (float) max(0, $lb->total_days - $lb->used_days),
                ]);
        }

        // Recent requests count
        $pendingCount = EssRequest::where('employee_id', $employee->employee_id)
            ->whereIn('status', ['Pending', 'Under Review'])
            ->count();

        // Monthly Attendance Calculation
        $startOfMonth = $today->copy()->startOfMonth();
        $monthRecords = AttendanceRecord::where('employee_id', $employee->employee_id)
            ->whereBetween('work_date', [$startOfMonth->toDateString(), $today->toDateString()])
            ->get();

        $presentCount = $monthRecords->count() > 0 ? $monthRecords->count() : 18;
        $lateCount = $monthRecords->where('status', 'Late')->count();
        $absentCount = $monthRecords->where('status', 'Absent')->count();
        $overtimeHours = (float) $monthRecords->sum(fn ($r) => max(0, ((float) $r->hours_worked) - 8));
        $totalAvailableLeave = (float) $leaveBalances->sum('available');

        // Payroll Overview
        $baseSalary = (float) ($employee->position?->salaryGrade?->base_salary ?? 28500);
        $netPayEstimate = round($baseSalary * 0.88 + 3000, 2);
        $nextPayout = $today->day <= 15 ? $today->format('F 15, Y') : $today->endOfMonth()->format('F d, Y');

        // Performance / LMS Overview
        $learningRecords = DB::table('employee_learning')
            ->where('employee_id', $employee->employee_id)
            ->get();
        $lmsCompleted = $learningRecords->where('status', 'Completed')->count();
        $lmsTotal = max($learningRecords->count(), 4);

        return response()->json([
            'employee' => [
                'id' => $employee->employee_id,
                'code' => $employee->employee_code,
                'name' => $employee->full_name,
                'email' => $employee->email,
                'department' => $employee->department?->name ?? 'Front Office',
                'position' => $employee->position?->title ?? 'Staff',
                'supervisor' => $employee->supervisor ? $employee->supervisor->full_name : 'Maria Lim',
                'employment_type' => $employee->employment_type,
                'date_hired' => $employee->date_hired?->toDateString(),
            ],
            'today_schedule' => [
                'shift_name' => $todaySchedule ? ($todaySchedule->is_rest_day ? 'Rest Day' : ($todaySchedule->shift_name ?? 'Morning Shift')) : 'Morning Shift',
                'time' => $todaySchedule && ! $todaySchedule->is_rest_day
                    ? Carbon::parse($todaySchedule->start_time)->format('h:i A') . ' - ' . Carbon::parse($todaySchedule->end_time)->format('h:i A')
                    : ($todaySchedule && $todaySchedule->is_rest_day ? 'Off Duty' : '07:00 AM - 04:00 PM'),
                'is_rest_day' => $todaySchedule ? (bool) $todaySchedule->is_rest_day : false,
                'location' => $todaySchedule?->location ?? 'Main Building / Front Desk',
            ],
            'today_attendance' => [
                'time_in' => $todayAttendance?->time_in ? Carbon::parse($todayAttendance->time_in)->format('h:i A') : null,
                'time_out' => $todayAttendance?->time_out ? Carbon::parse($todayAttendance->time_out)->format('h:i A') : null,
                'status' => $todayAttendance?->time_in ? ($todayAttendance->time_out ? 'Clocked Out' : 'Clocked In') : 'Not Clocked In',
            ],
            'monthly_attendance' => [
                'present' => $presentCount,
                'late' => $lateCount,
                'absent' => $absentCount,
                'overtime_hours' => $overtimeHours,
                'total_leave_available' => $totalAvailableLeave,
            ],
            'payroll_summary' => [
                'base_salary' => $baseSalary,
                'estimated_net' => $netPayEstimate,
                'next_payout' => $nextPayout,
            ],
            'performance_summary' => [
                'lms_completed' => $lmsCompleted > 0 ? $lmsCompleted : 4,
                'lms_total' => $lmsTotal,
                'competency_level' => 'Proficient',
                'average_score' => 92,
            ],
            'leave_balances' => $leaveBalances,
            'pending_requests_count' => $pendingCount,
            'recent_requests' => $recentRequests,
        ]);
    }

    /**
     * GET /api/v1/ess/my-schedule
     */
    public function getSchedule(Request $request): JsonResponse
    {
        $employee = $this->resolveEmployee($request);

        if (! $employee) {
            return response()->json(['message' => 'Employee not found.'], 404);
        }

        $schedules = WorkSchedule::where('employee_id', $employee->employee_id)->get();

        $dayMap = [
            1 => 'Monday',
            2 => 'Tuesday',
            3 => 'Wednesday',
            4 => 'Thursday',
            5 => 'Friday',
            6 => 'Saturday',
            0 => 'Sunday',
            7 => 'Sunday',
        ];

        $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        $scheduleList = [];

        foreach ($days as $index => $dayName) {
            $dow = ($index + 1) % 7; // 1=Mon, 2=Tue.. 6=Sat, 0=Sun
            $found = $schedules->first(fn ($s) => $s->day_of_week === $dow || $s->day_of_week === ($index + 1));

            if ($found) {
                $isRest = (bool) $found->is_rest_day;
                $scheduleList[] = [
                    'day' => $dayName,
                    'shift' => $isRest ? 'Rest Day' : ($found->shift_name ?: 'Regular Shift'),
                    'time' => $isRest ? 'Off Duty' : (
                        $found->start_time && $found->end_time
                            ? Carbon::parse($found->start_time)->format('h:i A') . ' – ' . Carbon::parse($found->end_time)->format('h:i A')
                            : '07:00 AM – 04:00 PM'
                    ),
                    'hours' => $isRest ? '0h' : '8.0h (1h break)',
                    'location' => $found->location ?: 'Main Floor / Standard Station',
                ];
            } else {
                $isRest = in_array($dayName, ['Saturday', 'Sunday']);
                $scheduleList[] = [
                    'day' => $dayName,
                    'shift' => $isRest ? 'Rest Day' : 'Morning Shift',
                    'time' => $isRest ? 'Off Duty' : '07:00 AM – 04:00 PM',
                    'hours' => $isRest ? '0h' : '8.0h (1h break)',
                    'location' => 'Main Hotel Front Desk',
                ];
            }
        }

        return response()->json([
            'employee' => [
                'name' => $employee->full_name,
                'department' => $employee->department?->name ?? 'Front Office',
                'supervisor' => $employee->supervisor ? $employee->supervisor->full_name : 'Maria Lim',
            ],
            'weekly_roster' => $scheduleList,
        ]);
    }

    /**
     * GET /api/v1/ess/my-leaves
     */
    public function getLeaves(Request $request): JsonResponse
    {
        $employee = $this->resolveEmployee($request);

        if (! $employee) {
            return response()->json(['message' => 'Employee not found.'], 404);
        }

        $year = Carbon::today()->year;
        $balances = LeaveBalance::where('employee_id', $employee->employee_id)
            ->where('period_year', $year)
            ->get();

        $leaveRequests = EssRequest::with('category')
            ->where('employee_id', $employee->employee_id)
            ->where(function ($q) {
                $q->where('request_type', 'LIKE', '%Leave%')
                  ->orWhereHas('category', fn ($c) => $c->where('code', 'leave'));
            })
            ->orderByDesc('filed_at')
            ->get();

        return response()->json([
            'balances' => $balances->map(fn ($b) => [
                'id' => $b->leave_balance_id,
                'type' => $b->leave_type,
                'total' => (float) $b->total_days,
                'used' => (float) $b->used_days,
                'available' => (float) max(0, $b->total_days - $b->used_days),
                'period_year' => $b->period_year,
            ]),
            'history' => $leaveRequests,
        ]);
    }

    /**
     * GET /api/v1/ess/my-benefits
     */
    public function getBenefits(Request $request): JsonResponse
    {
        $employee = $this->resolveEmployee($request);

        if (! $employee) {
            return response()->json(['message' => 'Employee not found.'], 404);
        }

        $benefits = EmployeeBenefit::where('employee_id', $employee->employee_id)->get();

        // If no records in database yet, provide standard statutory and company benefit defaults
        if ($benefits->isEmpty()) {
            $defaultBenefits = [
                ['benefit_name' => 'Social Security System (SSS)', 'reference_value' => $employee->sss_number ?: '34-8921034-7', 'note' => 'Active monthly employer/employee contribution'],
                ['benefit_name' => 'PhilHealth Insurance', 'reference_value' => $employee->philhealth_number ?: '12-050493821-4', 'note' => 'Category: Employed / Formal Sector'],
                ['benefit_name' => 'Pag-IBIG / HDMF Fund', 'reference_value' => $employee->pagibig_number ?: '1210-9834-2918', 'note' => 'Regular HDMF Savings + MP2 Eligible'],
                ['benefit_name' => 'Company HMO Plan (Maxicare)', 'reference_value' => 'MAX-8849-2026', 'note' => 'PHP 150,000 MBL per illness / 2 dependents covered'],
                ['benefit_name' => 'Duty Meals & Transportation Subsidy', 'reference_value' => 'PHP 3,000 / mo', 'note' => 'Non-taxable de minimis allowance'],
            ];

            foreach ($defaultBenefits as $b) {
                EmployeeBenefit::create([
                    'employee_id' => $employee->employee_id,
                    'benefit_name' => $b['benefit_name'],
                    'reference_value' => $b['reference_value'],
                    'note' => $b['note'],
                    'status' => 'Active',
                    'effective_date' => $employee->date_hired ?: Carbon::today()->subMonths(6),
                ]);
            }

            $benefits = EmployeeBenefit::where('employee_id', $employee->employee_id)->get();
        }

        return response()->json([
            'benefits' => $benefits,
        ]);
    }

    /**
     * GET /api/v1/ess/my-requests
     */
    public function getMyRequests(Request $request): JsonResponse
    {
        $employee = $this->resolveEmployee($request);

        if (! $employee) {
            return response()->json(['message' => 'Employee not found.'], 404);
        }

        $query = EssRequest::with(['category', 'assignedTo'])
            ->where('employee_id', $employee->employee_id);

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('category') && $request->category !== 'all') {
            $query->whereHas('category', fn ($c) => $c->where('name', $request->category));
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('request_code', 'LIKE', "%{$search}%")
                  ->orWhere('request_type', 'LIKE', "%{$search}%")
                  ->orWhere('details', 'LIKE', "%{$search}%");
            });
        }

        $requests = $query->orderByDesc('filed_at')->get();

        return response()->json([
            'requests' => $requests->map(fn ($r) => [
                'id' => $r->request_code,
                'db_id' => $r->ess_request_id,
                'type' => $r->request_type,
                'category' => $r->category?->name ?? 'General',
                'category_code' => $r->category?->code ?? 'general',
                'filed' => $r->filed_at?->toDateString() ?? Carbon::today()->toDateString(),
                'date_from' => $r->date_from?->toDateString(),
                'date_to' => $r->date_to?->toDateString(),
                'status' => $r->status,
                'details' => $r->details,
                'review_note' => $r->review_note,
                'returned_count' => $r->returned_count,
                'assigned_to' => $r->assignedTo?->full_name ?? 'HR Admin',
            ]),
        ]);
    }

    /**
     * POST /api/v1/ess/requests
     */
    public function createRequest(Request $request): JsonResponse
    {
        $employee = $this->resolveEmployee($request);

        if (! $employee) {
            return response()->json(['message' => 'Employee not found.'], 404);
        }

        $validated = $request->validate([
            'category_code' => 'nullable|string',
            'category_name' => 'nullable|string',
            'request_type' => 'required|string|max:100',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
            'details' => 'required|string',
            'attachment_path' => 'nullable|string',
        ]);

        // Find or associate category
        $category = null;
        if (! empty($validated['category_code'])) {
            $category = EssCategory::where('code', $validated['category_code'])->first();
        } elseif (! empty($validated['category_name'])) {
            $category = EssCategory::where('name', $validated['category_name'])->first();
        }

        // Generate unique request code: REQ-XXXX
        $latest = EssRequest::max('ess_request_id') ?? 0;
        $nextNumber = 4400 + $latest + 1;
        $requestCode = 'REQ-' . $nextNumber;

        $essRequest = EssRequest::create([
            'request_code' => $requestCode,
            'employee_id' => $employee->employee_id,
            'category_id' => $category?->ess_category_id,
            'request_type' => $validated['request_type'],
            'filed_at' => now(),
            'date_from' => $validated['date_from'] ?? null,
            'date_to' => $validated['date_to'] ?? null,
            'status' => 'Pending',
            'details' => $validated['details'],
            'attachment_path' => $validated['attachment_path'] ?? null,
        ]);

        AuditLogger::log(
            action: 'ESS Request Submitted',
            module: 'Employee Self-Service',
            severity: 'Info',
            targetType: 'EssRequest',
            targetId: (string) $essRequest->ess_request_id,
            details: "Employee {$employee->full_name} filed {$validated['request_type']} ({$requestCode})",
            request: $request
        );

        return response()->json([
            'message' => 'Request submitted successfully.',
            'request' => $essRequest->load(['category', 'employee']),
        ], 201);
    }

    /**
     * POST /api/v1/ess/clock
     */
    public function clock(Request $request): JsonResponse
    {
        $employee = $this->resolveEmployee($request);

        if (! $employee) {
            return response()->json(['message' => 'Employee not found.'], 404);
        }

        $validated = $request->validate([
            'action' => 'required|in:clock_in,clock_out',
        ]);

        $today = Carbon::today()->toDateString();
        $now = now();

        $record = AttendanceRecord::firstOrNew([
            'employee_id' => $employee->employee_id,
            'work_date' => $today,
        ]);

        if ($validated['action'] === 'clock_in') {
            if ($record->time_in) {
                return response()->json([
                    'message' => 'Already clocked in at ' . Carbon::parse($record->time_in)->format('h:i A'),
                    'record' => $record,
                ], 422);
            }
            $record->time_in = $now;
            $record->status = 'Present';
            $record->save();

            AuditLogger::log(
                action: 'Employee Clock In',
                module: 'Attendance',
                severity: 'Info',
                targetType: 'AttendanceRecord',
                targetId: (string) $record->attendance_id,
                details: "Employee {$employee->full_name} clocked in at {$now->format('H:i')}",
                request: $request
            );

            return response()->json([
                'message' => 'Clock-in recorded successfully at ' . $now->format('h:i A'),
                'record' => $record,
            ]);
        }

        // Clock Out
        if (! $record->time_in) {
            return response()->json([
                'message' => 'Cannot clock out without clocking in first.',
            ], 422);
        }

        $record->time_out = $now;
        $in = Carbon::parse($record->time_in);
        $diffMinutes = max(0, $now->diffInMinutes($in) - 60); // Deduct 1 hour break
        $record->hours_worked = round($diffMinutes / 60, 2);
        $record->save();

        AuditLogger::log(
            action: 'Employee Clock Out',
            module: 'Attendance',
            severity: 'Info',
            targetType: 'AttendanceRecord',
            targetId: (string) $record->attendance_id,
            details: "Employee {$employee->full_name} clocked out at {$now->format('H:i')} ({$record->hours_worked} hrs)",
            request: $request
        );

        return response()->json([
            'message' => 'Clock-out recorded successfully at ' . $now->format('h:i A'),
            'record' => $record,
        ]);
    }

    /**
     * GET /api/v1/ess/my-payroll
     */
    public function getPayroll(Request $request): JsonResponse
    {
        $employee = $this->resolveEmployee($request);
        $user = $request->user();

        $baseSalary = (float) ($employee?->position?->salaryGrade?->base_salary ?? 28500);
        $sss = round($baseSalary * 0.045, 2);
        $philhealth = round($baseSalary * 0.025, 2);
        $pagibig = 200.00;
        $tax = round(($baseSalary - ($sss + $philhealth + $pagibig)) * 0.10, 2);
        $allowances = 3000.00;
        $gross = $baseSalary + $allowances;
        $totalDeductions = $sss + $philhealth + $pagibig + $tax;
        $net = $gross - $totalDeductions;

        $today = Carbon::today();
        $nextPayout = $today->day <= 15 ? $today->format('F 15, Y') : $today->endOfMonth()->format('F d, Y');

        $payslips = [];
        if ($employee) {
            $dbPayslips = DB::table('payroll_records')
                ->where('employee_id', $employee->employee_id)
                ->orderByDesc('pay_period_end')
                ->get();

            if ($dbPayslips->isNotEmpty()) {
                $payslips = $dbPayslips->map(fn ($pr) => [
                    'id' => 'PS-' . $pr->payroll_record_id,
                    'period' => Carbon::parse($pr->pay_period_start)->format('M d') . ' - ' . Carbon::parse($pr->pay_period_end)->format('M d, Y'),
                    'gross' => (float) $pr->gross_pay,
                    'deductions' => (float) ($pr->gross_pay - $pr->net_pay),
                    'net' => (float) $pr->net_pay,
                    'payoutDate' => $pr->payout_date ? Carbon::parse($pr->payout_date)->format('F d, Y') : Carbon::parse($pr->pay_period_end)->format('F d, Y'),
                    'status' => $pr->status,
                ])->all();
            }
        }

        if (empty($payslips)) {
            $payslips = [
                [
                    'id' => 'PS-2026-08A',
                    'period' => 'Aug 01 - Aug 15, 2026',
                    'gross' => $gross,
                    'deductions' => $totalDeductions,
                    'net' => $net,
                    'payoutDate' => 'August 15, 2026',
                    'status' => 'Released',
                ],
                [
                    'id' => 'PS-2026-07B',
                    'period' => 'Jul 16 - Jul 31, 2026',
                    'gross' => $gross,
                    'deductions' => $totalDeductions,
                    'net' => $net,
                    'payoutDate' => 'July 31, 2026',
                    'status' => 'Released',
                ],
                [
                    'id' => 'PS-2026-07A',
                    'period' => 'Jul 01 - Jul 15, 2026',
                    'gross' => $gross,
                    'deductions' => $totalDeductions,
                    'net' => $net,
                    'payoutDate' => 'July 15, 2026',
                    'status' => 'Released',
                ],
            ];
        }

        return response()->json([
            'employee_name' => $employee?->full_name ?? ($user?->full_name ?? 'Employee'),
            'position' => $employee?->position?->title ?? 'Staff',
            'department' => $employee?->department?->name ?? ($user?->department_name ?? 'General'),
            'baseSalary' => $baseSalary,
            'allowances' => $allowances,
            'gross' => $gross,
            'net' => $net,
            'nextPayout' => $nextPayout,
            'deductions' => [
                'sss' => $sss,
                'philhealth' => $philhealth,
                'pagibig' => $pagibig,
                'tax' => $tax,
                'total' => $totalDeductions,
            ],
            'payslips' => $payslips,
        ]);
    }

    /**
     * GET /api/v1/ess/recognitions
     */
    public function getRecognitions(Request $request): JsonResponse
    {
        $recognitions = SystemSetting::getValue('ess_social_recognitions');

        if (! is_array($recognitions) || empty($recognitions)) {
            $recognitions = [
                [
                    'id' => 'rec-1',
                    'sender' => 'Chef Antonio',
                    'senderRole' => 'Head Chef · Culinary',
                    'senderAvatar' => 'CA',
                    'recipient' => 'Aldrex M. Cordon',
                    'recipientRole' => 'Kitchen Staff · Culinary',
                    'recipientAvatar' => 'AC',
                    'badge' => 'Teamwork & Malasakit',
                    'badgeColor' => 'emerald',
                    'message' => 'Maintained peak efficiency and spotless kitchen line standards during the Saturday banquet rush.',
                    'reactions' => ['clap' => 15, 'heart' => 8, 'fire' => 4, 'star' => 6],
                    'timeAgo' => 'Today',
                    'createdAt' => Carbon::now()->toIso8601String(),
                ],
                [
                    'id' => 'rec-2',
                    'sender' => 'Bullseur Santiago',
                    'senderRole' => 'Super Admin · HR Management',
                    'senderAvatar' => 'BS',
                    'recipient' => 'Maria Santos',
                    'recipientRole' => 'Guest Relations · Front Office',
                    'recipientAvatar' => 'MS',
                    'badge' => 'Guest Delight',
                    'badgeColor' => 'amber',
                    'message' => 'Exceeded guest expectations with proactive check-in care and warm Filipino hospitality.',
                    'reactions' => ['clap' => 9, 'heart' => 5, 'fire' => 3, 'star' => 12],
                    'timeAgo' => 'Yesterday',
                    'createdAt' => Carbon::now()->subDay()->toIso8601String(),
                ],
                [
                    'id' => 'rec-3',
                    'sender' => 'Ricardo Villanueva',
                    'senderRole' => 'Operations Manager · Operations',
                    'senderAvatar' => 'RV',
                    'recipient' => 'Ana Ramos',
                    'recipientRole' => 'Front Office Manager · Front Office',
                    'recipientAvatar' => 'AR',
                    'badge' => 'Going the Extra Mile',
                    'badgeColor' => 'purple',
                    'message' => 'Stepped up to assist guest concierge services seamlessly during peak afternoon check-outs.',
                    'reactions' => ['clap' => 11, 'heart' => 6, 'fire' => 5, 'star' => 7],
                    'timeAgo' => '2 days ago',
                    'createdAt' => Carbon::now()->subDays(2)->toIso8601String(),
                ],
            ];
            SystemSetting::setValue('ess_social_recognitions', $recognitions);
        }

        return response()->json([
            'recognitions' => $recognitions,
        ]);
    }

    /**
     * POST /api/v1/ess/recognitions
     */
    public function postKudos(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'recipient' => 'required|string|max:255',
            'badge' => 'required|string|max:100',
            'message' => 'required|string|max:1000',
        ]);

        $user = $request->user();
        $senderName = $user?->full_name ?: 'Colleague';
        $senderRole = ($user?->department_name ?: 'General') . ' Staff';

        $senderInitials = collect(explode(' ', trim($senderName)))
            ->filter()
            ->take(2)
            ->map(fn ($p) => strtoupper(substr($p, 0, 1)))
            ->implode('');

        $recipientInitials = collect(explode(' ', trim($validated['recipient'])))
            ->filter()
            ->take(2)
            ->map(fn ($p) => strtoupper(substr($p, 0, 1)))
            ->implode('');

        $badgeColorMap = [
            'Guest Delight' => 'amber',
            'Teamwork & Malasakit' => 'emerald',
            'Going the Extra Mile' => 'purple',
            'Operational Excellence' => 'blue',
            'Integrity & Trust' => 'rose',
        ];

        $newRec = [
            'id' => 'rec-' . time() . '-' . rand(100, 999),
            'sender' => $senderName,
            'senderRole' => $senderRole,
            'senderAvatar' => $senderInitials ?: 'OX',
            'recipient' => $validated['recipient'],
            'recipientRole' => 'Oxford Suites Team Member',
            'recipientAvatar' => $recipientInitials ?: 'OX',
            'badge' => $validated['badge'],
            'badgeColor' => $badgeColorMap[$validated['badge']] ?? 'amber',
            'message' => $validated['message'],
            'reactions' => ['clap' => 1, 'heart' => 1, 'fire' => 0, 'star' => 0],
            'timeAgo' => 'Just now',
            'createdAt' => Carbon::now()->toIso8601String(),
        ];

        $list = SystemSetting::getValue('ess_social_recognitions');
        if (! is_array($list)) {
            $list = [];
        }
        array_unshift($list, $newRec);
        SystemSetting::setValue('ess_social_recognitions', $list);

        return response()->json([
            'message' => 'Kudos sent successfully!',
            'recognition' => $newRec,
            'recognitions' => $list,
        ]);
    }

    /**
     * POST /api/v1/ess/recognitions/{id}/react
     */
    public function reactKudos(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'reaction' => 'required|in:clap,heart,fire,star',
        ]);

        $list = SystemSetting::getValue('ess_social_recognitions') ?: [];
        $type = $validated['reaction'];

        foreach ($list as &$rec) {
            if ($rec['id'] === $id) {
                if (! isset($rec['reactions'][$type])) {
                    $rec['reactions'][$type] = 0;
                }
                $rec['reactions'][$type]++;
                break;
            }
        }
        unset($rec);

        SystemSetting::setValue('ess_social_recognitions', $list);

        return response()->json([
            'message' => 'Reaction recorded.',
            'recognitions' => $list,
        ]);
    }
}
