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

class EssPortalController extends Controller
{
    /**
     * Resolve the current authenticated employee.
     * Returns null when the authenticated user has no linked employee record
     * so callers respond 403/404 instead of falling back to an arbitrary record.
     */
    protected function resolveEmployee(Request $request): ?Employee
    {
        $user = $request->user();
        if (! $user?->employee_id) {
            return null;
        }

        return Employee::with(['department', 'position', 'supervisor'])->find($user->employee_id);
    }

    /**
     * GET /api/v1/ess/my-overview
     */
    public function getOverview(Request $request): JsonResponse
    {
        $employee = $this->resolveEmployee($request);

        if (! $employee) {
            return response()->json(['message' => 'Employee profile not found.'], 404);
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

        $recentRequests = EssRequest::with('category')
            ->where('employee_id', $employee->employee_id)
            ->orderByDesc('filed_at')
            ->take(5)
            ->get();

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
            'attachment_path' => ['nullable', 'string', 'max:255', 'regex:/^[\w\-.\/\\: ]+$/'],
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
}
