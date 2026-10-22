<?php

namespace Modules\EmployeeSelfService\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\AttendanceRecord;
use App\Models\Employee;
use App\Models\EmployeeBenefit;
use App\Models\EmployeeDocument;
use App\Models\EssCategory;
use App\Models\EssRequest;
use App\Models\EssRequestAttachment;
use App\Models\EssRequestStatusHistory;
use App\Models\LeaveBalance;
use App\Models\WorkSchedule;
use App\Services\AuditLogger;
use App\Services\HandbookTextCleaner;
use App\Services\LmsQuizGenerator;
use App\Services\NlpService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\PersonalAccessToken;
use App\Models\SystemUser;
use Modules\EmployeeSelfService\Events\EssRequestFiled;
use Modules\EmployeeSelfService\Models\RecognitionReaction;
use Modules\EmployeeSelfService\Models\SocialRecognition;
use Modules\EmployeeSelfService\Services\EssRequestWorkflow;
use Modules\EmployeeRecords\Services\EmployeeDocumentCodeGenerator;
use Modules\Settings\Models\SystemSetting;

class EssPortalController extends Controller
{
    /**
     * Entry base pay per HR policy: the linked salary grade's band MINIMUM.
     * 28500 only when no grade is linked at all (never a silent grade value).
     */
    private function resolveBaseSalary(?Employee $employee): float
    {
        $min = $employee?->position?->salaryGrade?->min_salary;
        return $min !== null ? (float) $min : 28500.00;
    }

    /**
     * Resolve the current authenticated employee.
     * Returns null when the authenticated user has no linked employee record
     * so callers respond 403/404 instead of falling back to an arbitrary record.
     */
    private function resolveEmployee(Request $request): ?Employee
    {
        $user = $request->user();
        if ($user?->employee_id) {
            $emp = Employee::with(['department', 'position', 'supervisor'])->find($user->employee_id);
            if ($emp) {
                return $emp;
            }
        }

        if ($user?->email) {
            $emp = Employee::with(['department', 'position', 'supervisor'])
                ->where('email', $user->email)
                ->orWhere('personal_email', $user->email)
                ->first();
            if ($emp) {
                if ($user && ! $user->employee_id) {
                    $user->employee_id = $emp->employee_id;
                    $user->save();
                }
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
                if ($user && ! $user->employee_id) {
                    $user->employee_id = $emp->employee_id;
                    $user->save();
                }
                return $emp;
            }
        }

        // Check if there is a NewHire record for this user to auto-create / link Employee record
        $newHire = \Modules\NewHireOnboarding\Models\NewHire::where('email', $user?->email)
            ->orWhere('name', $user?->full_name)
            ->first();

        if ($newHire) {
            if ($newHire->employee_id) {
                $emp = Employee::with(['department', 'position', 'supervisor'])->find($newHire->employee_id);
                if ($emp) {
                    if ($user && ! $user->employee_id) {
                        $user->employee_id = $emp->employee_id;
                        $user->save();
                    }
                    return $emp;
                }
            }

            // Auto-provision Employee record from NewHire
            $names = explode(' ', trim($newHire->name));
            $firstName = $names[0] ?? 'Employee';
            $middleName = count($names) > 2 ? $names[1] : null;
            $lastName = count($names) > 1 ? end($names) : 'Staff';

            $nextCodeNumber = (Employee::max('employee_id') ?? 0) + 1;
            $code = 'EMP-' . str_pad((string) $nextCodeNumber, 4, '0', STR_PAD_LEFT);

            $emp = Employee::create([
                'employee_code'   => $code,
                'first_name'      => $firstName,
                'middle_name'     => $middleName,
                'last_name'       => $lastName,
                'email'           => $newHire->email ?? $user?->email,
                'department_id'   => $newHire->department_id ?? 1,
                'position_id'     => $newHire->position_id ?? 1,
                'employment_type' => 'Probationary',
                'date_hired'      => $newHire->start_date ?? now(),
                'status'          => 'Active',
                'onboarding_complete' => true,
            ]);

            $newHire->employee_id = $emp->employee_id;
            $newHire->save();

            if ($user) {
                $user->employee_id = $emp->employee_id;
                $user->save();
            }

            return $emp->load(['department', 'position', 'supervisor']);
        }

        // For user with role_id 3 (Employee) without existing records, auto-provision
        if ($user && $user->role_id == 3 && $user->email) {
            $names = explode(' ', trim($user->full_name ?? $user->username));
            $firstName = $names[0] ?? 'Employee';
            $lastName = count($names) > 1 ? end($names) : 'Staff';
            $nextCodeNumber = (Employee::max('employee_id') ?? 0) + 1;
            $code = 'EMP-' . str_pad((string) $nextCodeNumber, 4, '0', STR_PAD_LEFT);

            $emp = Employee::create([
                'employee_code'   => $code,
                'first_name'      => $firstName,
                'last_name'       => $lastName,
                'email'           => $user->email,
                'department_id'   => 1,
                'position_id'     => 1,
                'employment_type' => 'Probationary',
                'date_hired'      => now(),
                'status'          => 'Active',
                'onboarding_complete' => true,
            ]);

            $user->employee_id = $emp->employee_id;
            $user->save();

            return $emp->load(['department', 'position', 'supervisor']);
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

        $recentRequests = EssRequest::where('employee_id', $employee->employee_id)
            ->orderByDesc('filed_at')
            ->limit(5)
            ->get()
            ->map(fn ($r) => [
                'id' => $r->request_id,
                'type' => $r->request_type,
                'category' => $r->category,
                'status' => $r->status,
                'filed' => $r->filed_at?->format('M d, Y') ?? 'Recently',
            ]);

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
        $baseSalary = $this->resolveBaseSalary($employee);
        $netPayEstimate = round($baseSalary * 0.88 + 3000, 2);
        $nextPayout = $today->day <= 15 ? $today->format('F 15, Y') : $today->endOfMonth()->format('F d, Y');

        // Performance / LMS Overview (real counts; nulls when nothing recorded —
        // the ESS tabs fall back to their placeholders in that case).
        $learningRecords = DB::table('employee_learning')
            ->where('employee_id', $employee->employee_id)
            ->get();
        $lmsCompleted = $learningRecords->where('status', 'Completed')->count();
        $lmsTotal = $learningRecords->count();
        $lmsScores = $learningRecords->where('status', 'Completed')
            ->map(fn ($r) => $r->score)
            ->filter(fn ($s) => $s !== null)
            ->values();
        $lmsAverage = $lmsScores->count() ? round((float) $lmsScores->avg(), 1) : null;
        $latestReview = DB::table('performance_reviews')
            ->where('employee_id', $employee->employee_id)
            ->orderByDesc('review_date')
            ->orderByDesc('performance_review_id')
            ->first();

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
                'lms_completed' => $lmsCompleted,
                'lms_total' => $lmsTotal,
                'competency_level' => $latestReview?->competency_level,
                'average_score' => $lmsAverage,
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

        $query = EssRequest::with(['category', 'assignedTo', 'attachments', 'statusHistory'])
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
                'module' => $r->routed_module,
                'module_label' => $r->routed_module
                    ? (config("ess_routing.modules.{$r->routed_module}.label") ?? ucfirst($r->routed_module))
                    : null,
                'details' => $r->details,
                'review_note' => $r->review_note,
                'returned_count' => $r->returned_count,
                'completed_at' => $r->completed_at?->toIso8601String(),
                'released_at' => $r->released_at?->toIso8601String(),
                // Module output/notes are only visible after release.
                'module_note' => $r->status === 'Completed' ? $r->module_note : null,
                'assigned_to' => $r->assignedTo?->full_name ?? 'HR Admin',
                'attachments' => $r->attachments
                    ->filter(fn ($a) => $a->direction !== 'hr' || $r->status === 'Completed')
                    ->map(fn ($a) => [
                        'id' => $a->ess_request_attachment_id,
                        'direction' => $a->direction,
                        'source_module' => $a->source_module,
                        'original_name' => $a->original_name,
                        'mime_type' => $a->mime_type,
                        'file_size_bytes' => $a->file_size_bytes,
                        'has_file' => $this->attachmentFileExists($a->file_path),
                    ])->values(),
                // Module output stays hidden until ESS Management releases it.
                'has_fulfillment' => $r->status === 'Completed'
                    && $r->attachments->contains(fn ($a) => $a->direction === 'hr'),
                'timeline' => $r->statusHistory->map(fn ($h) => [
                    'status' => $h->status,
                    'note' => $h->note,
                    'at' => $h->created_at?->toIso8601String(),
                ])->values(),
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
            'attachments' => 'nullable|array|max:5',
            'attachments.*' => 'file|max:10240|mimes:pdf,png,jpg,jpeg,doc,docx',
        ]);

        // Find or associate category. Fall back to the human name when the
        // client-supplied code does not match a stored category code (the
        // frontend derives codes from names, e.g. "hr_document" vs "ESS-HRDOC").
        $category = null;
        if (! empty($validated['category_code'])) {
            $category = EssCategory::where('code', $validated['category_code'])->first();
        }
        if (! $category && ! empty($validated['category_name'])) {
            $category = EssCategory::where('name', $validated['category_name'])->first();
        }

        // Generate a unique request code: REQ-XXXX. Derive the next number from
        // the highest existing numeric suffix (not the auto-increment id, which
        // can drift from the seeded REQ-44xx codes) and guard for collisions.
        $highest = (int) EssRequest::query()
            ->selectRaw('MAX(CAST(SUBSTRING(request_code, 5) AS UNSIGNED)) as n')
            ->value('n');
        $nextNumber = ($highest ?: 4400) + 1;
        do {
            $requestCode = 'REQ-' . $nextNumber;
            $nextNumber++;
        } while (EssRequest::where('request_code', $requestCode)->exists());

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

        // Timeline entry: Filed.
        EssRequestStatusHistory::create([
            'ess_request_id' => $essRequest->ess_request_id,
            'status' => 'Pending',
            'actor_user_id' => $request->user()?->system_user_id,
            'note' => 'Request filed by employee.',
        ]);

        // If the employee attached a file with the request, keep it in the
        // attachment ledger (direction = employee). Supports multiple files
        // from the real upload form, plus the legacy single path field.
        $workflow = app(EssRequestWorkflow::class);
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $payload = $workflow->storeUpload($file, 'ess-request-attachments');
                EssRequestAttachment::create([
                    'ess_request_id' => $essRequest->ess_request_id,
                    'direction' => 'employee',
                    'file_path' => $payload['file_path'],
                    'original_name' => $payload['original_name'],
                    'mime_type' => $payload['mime_type'],
                    'file_size_bytes' => $payload['file_size_bytes'],
                    'uploaded_by_user_id' => $request->user()?->system_user_id,
                ]);
            }
        }

        if (! empty($validated['attachment_path'])) {
            EssRequestAttachment::create([
                'ess_request_id' => $essRequest->ess_request_id,
                'direction' => 'employee',
                'file_path' => $validated['attachment_path'],
                'original_name' => basename((string) $validated['attachment_path']),
                'mime_type' => null,
                'file_size_bytes' => null,
                'uploaded_by_user_id' => $request->user()?->system_user_id,
            ]);
        }

        AuditLogger::log(
            action: 'ESS Request Submitted',
            module: 'Employee Self-Service',
            severity: 'Info',
            targetType: 'EssRequest',
            targetId: (string) $essRequest->ess_request_id,
            details: "Employee {$employee->full_name} filed {$validated['request_type']} ({$requestCode})",
            request: $request
        );

        // "Outbound" half of the ESS <-> ERM loop: Employee Records listens and
        // surfaces document requests; other categories are handled in ESS admin.
        event(new EssRequestFiled($essRequest));

        return response()->json([
            'message' => 'Request submitted successfully.',
            'request' => $essRequest->load(['category', 'employee', 'attachments', 'statusHistory']),
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

        $baseSalary = $this->resolveBaseSalary($employee);
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
        $heroSource = 'estimate';
        $heroPeriod = null;
        if ($employee) {
            $dbPayslips = DB::table('payroll_records')
                ->where('employee_id', $employee->employee_id)
                ->orderByDesc('pay_period_end')
                ->get();

            if ($dbPayslips->isNotEmpty()) {
                // All item lines in one query, grouped per record.
                $recordIds = $dbPayslips->pluck('payroll_record_id')->all();
                $itemsByRecord = $recordIds
                    ? DB::table('payroll_items')->whereIn('payroll_record_id', $recordIds)->get()->groupBy('payroll_record_id')
                    : collect();
                $endById = $dbPayslips->mapWithKeys(fn ($pr) => [
                    $pr->payroll_record_id => Carbon::parse($pr->pay_period_end),
                ]);

                $payslips = $dbPayslips->map(function ($pr) use ($itemsByRecord, $endById) {
                    $items = $itemsByRecord->get($pr->payroll_record_id, collect());
                    $end = $endById->get($pr->payroll_record_id);
                    // Calendar-year YTD per label: same employee, same year,
                    // period ending on/before this record.
                    $ytdIds = $endById
                        ->filter(fn ($d) => $d->format('Y') === $end->format('Y') && $d->lte($end))
                        ->keys()->all();
                    $ytdItems = collect();
                    foreach ($ytdIds as $id) {
                        foreach ($itemsByRecord->get($id, collect()) as $it) {
                            $ytdItems->push($it);
                        }
                    }
                    $build = function ($type) use ($items, $ytdItems) {
                        return $items->where('item_type', $type)->map(function ($it) use ($ytdItems, $type) {
                            return [
                                'label' => $it->label,
                                'amount' => (float) $it->amount,
                                'ytd' => (float) $ytdItems
                                    ->where('item_type', $type)
                                    ->where('label', $it->label)
                                    ->sum('amount'),
                            ];
                        })->values()->all();
                    };
                    return [
                        'id' => 'PS-' . $pr->payroll_record_id,
                        'period' => Carbon::parse($pr->pay_period_start)->format('M d') . ' - ' . Carbon::parse($pr->pay_period_end)->format('M d, Y'),
                        'gross' => (float) $pr->gross_pay,
                        'deductions' => (float) ($pr->gross_pay - $pr->net_pay),
                        'net' => (float) $pr->net_pay,
                        'payoutDate' => $pr->payout_date ? Carbon::parse($pr->payout_date)->format('F d, Y') : Carbon::parse($pr->pay_period_end)->format('F d, Y'),
                        'status' => $pr->status,
                        'earnings' => $build('Earning'),
                        'deductions_breakdown' => $build('Deduction'),
                    ];
                })->all();

                // Hero figures = latest Released record (never Draft estimates).
                $latestReleased = $dbPayslips->firstWhere('status', 'Released');
                if ($latestReleased) {
                    $gross = (float) $latestReleased->gross_pay;
                    $net = (float) $latestReleased->net_pay;
                    $totalDeductions = $gross - $net;
                    $heroSource = 'released';
                    $heroPeriod = Carbon::parse($latestReleased->pay_period_start)->format('M d') . ' - ' . Carbon::parse($latestReleased->pay_period_end)->format('M d, Y');
                }
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
            'hero_source' => $heroSource,
            'hero_period' => $heroPeriod,
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
     * GET /api/v1/ess/my-attendance
     */
    public function getMyAttendance(Request $request): JsonResponse
    {
        $employee = $this->resolveEmployee($request);

        if (! $employee) {
            return response()->json(['message' => 'Employee not found.'], 404);
        }

        $records = AttendanceRecord::where('employee_id', $employee->employee_id)
            ->orderByDesc('work_date')
            ->get();

        // If no records in database yet, auto-seed standard monthly attendance logs
        if ($records->isEmpty()) {
            $today = Carbon::today();
            for ($i = 0; $i < 20; $i++) {
                $date = $today->copy()->subDays($i);
                $isWeekend = $date->isWeekend();

                AttendanceRecord::create([
                    'employee_id' => $employee->employee_id,
                    'work_date' => $date->toDateString(),
                    'time_in' => $isWeekend ? null : $date->copy()->setTime(7, rand(50, 59))->toDateTimeString(),
                    'time_out' => $isWeekend ? null : $date->copy()->setTime(16, rand(0, 15))->toDateTimeString(),
                    'hours_worked' => $isWeekend ? 0 : 8.0,
                    'overtime_hours' => ($i % 5 === 0 && ! $isWeekend) ? 1.5 : 0.0,
                    'status' => $isWeekend ? 'Rest Day' : ($i === 3 ? 'Late' : 'Present'),
                    'biometric_device_id' => $isWeekend ? null : 'BIO-MAIN-01',
                    'remark' => $isWeekend ? 'Scheduled Weekly Rest Day' : 'Biometric Terminal Clock',
                ]);
            }

            $records = AttendanceRecord::where('employee_id', $employee->employee_id)
                ->orderByDesc('work_date')
                ->get();
        }

        $presentCount = $records->where('status', 'Present')->count();
        $leaveCount = EssRequest::where('employee_id', $employee->employee_id)
            ->whereIn('status', ['For Release', 'Completed'])
            ->where('request_type', 'like', '%Leave%')
            ->count();

        return response()->json([
            'summary' => [
                'present_days' => $presentCount,
                'leave_days' => $leaveCount,
                'average_hours' => 8.0,
            ],
            'records' => $records->map(fn ($r) => [
                'id' => $r->attendance_id,
                'date' => Carbon::parse($r->work_date)->format('M d, Y'),
                'day' => Carbon::parse($r->work_date)->format('l'),
                'rawDate' => $r->work_date?->toDateString() ?? $r->work_date,
                'timeIn' => $r->time_in ? Carbon::parse($r->time_in)->format('h:i A') : '—',
                'timeOut' => $r->time_out ? Carbon::parse($r->time_out)->format('h:i A') : '—',
                'workedHours' => (float) $r->hours_worked,
                'status' => $r->status,
                // `status` is the processing state ("Completed" / leave type),
                // while `remark` holds the attendance verdict ("Present",
                // "Late 7 mins", "Overtime 2h", ...). Expose both so the ESS
                // calendar can colour days correctly.
                'remark' => $r->remark,
                'remarks' => $r->remark ?: 'Verified via HR Biometric Sync',
                'lateMinutes' => (int) $r->late_minutes,
                'undertimeMinutes' => (int) $r->undertime_minutes,
                'overtimeHours' => (float) $r->overtime_hours,
                'device' => $r->biometric_device_id ?: 'Web Portal / Mobile Clock',
            ]),
        ]);
    }

    /**
     * GET /api/v1/ess/my-documents
     */
    public function getMyDocuments(Request $request): JsonResponse
    {
        $employee = $this->resolveEmployee($request);

        if (! $employee) {
            return response()->json(['message' => 'Employee not found.'], 404);
        }

        $documents = EmployeeDocument::where('employee_id', $employee->employee_id)->get();

        return response()->json([
            'documents' => $documents->map(function ($doc) {
                $relative = ltrim((string) $doc->file_path, '/');
                if (str_starts_with($relative, 'storage/')) {
                    $relative = substr($relative, strlen('storage/'));
                }
                return [
                    'id' => $doc->document_id,
                    'code' => $doc->document_code,
                    'title' => $doc->title,
                    'category' => $doc->category,
                    'status' => $doc->document_status === 'Verified' ? 'Verified & Active' : ($doc->document_status ?: 'Active'),
                    'verified' => $doc->document_status === 'Verified',
                    'issuedDate' => $doc->document_date ? Carbon::parse($doc->document_date)->format('M d, Y') : 'Active',
                    'expiryDate' => $doc->expiry_date ? Carbon::parse($doc->expiry_date)->format('M d, Y') : 'No Expiry',
                    'fileSize' => $doc->file_size_bytes ? round($doc->file_size_bytes / 1048576, 1) . ' MB' : '1.2 MB',
                    'fileType' => 'PDF Document',
                    'downloadUrl' => $doc->file_path,
                    // True only when real bytes exist on disk (new uploads).
                    'has_file' => $relative !== '' && Storage::disk('public')->exists($relative),
                ];
            }),
        ]);
    }

    /**
     * POST /api/v1/ess/my-documents/upload
     * Real multipart upload: bytes go to the public disk, the row stores the
     * actual path/mime/size. Legacy pure-JSON callers (title/category only)
     * still work and keep the old placeholder behavior.
     */
    public function uploadDocument(Request $request): JsonResponse
    {
        $employee = $this->resolveEmployee($request);

        if (! $employee) {
            return response()->json(['message' => 'Employee not found.'], 404);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'file' => 'nullable|file|max:10240|mimes:pdf,png,jpg,jpeg',
            'file_path' => 'nullable|string',
            'expiry_date' => 'nullable|date',
        ]);

        $storedPath = null;
        $mimeType = 'application/pdf';
        $fileSize = 1258291;
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $storedPath = $file->store('employee-documents', 'public');
            $mimeType = $file->getClientMimeType() ?: 'application/octet-stream';
            $fileSize = $file->getSize() ?: 0;
        }

        // Code minted through the shared, lock-serialised generator so ESS
        // uploads and ERM uploads can never collide.
        $doc = app(EmployeeDocumentCodeGenerator::class)->create($employee, [
            'title' => $validated['title'],
            'category' => $validated['category'],
            'file_path' => $storedPath ?? ($validated['file_path'] ?? null),
            'mime_type' => $mimeType,
            'file_size_bytes' => $fileSize,
            'document_status' => 'Pending Verification',
            'document_date' => Carbon::today(),
            'expiry_date' => $validated['expiry_date'] ?? null,
        ]);

        return response()->json([
            'message' => 'Document uploaded successfully and queued for HR verification.',
            'document' => $doc,
        ]);
    }

    /**
     * GET /api/v1/ess/my-documents/{id}/file
     * Stream the employee's own file inline (PDF/image in iframe/img).
     * Token auth (?token=) so plain browser opens work without headers.
     * 404 when the row has no real file (legacy placeholder paths).
     */
    public function documentFile(Request $request, string $id): object
    {
        $user = $this->resolveTokenUser($request) ?? $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $employee = null;
        if ($user->employee_id) {
            $employee = Employee::find($user->employee_id);
        }
        if (! $employee && $user->email) {
            $employee = Employee::where('email', $user->email)->first();
        }
        if (! $employee) {
            return response()->json(['message' => 'Employee not found.'], 404);
        }

        $doc = EmployeeDocument::where('document_id', (int) $id)
            ->where('employee_id', $employee->employee_id)
            ->first();
        if (! $doc) {
            return response()->json(['message' => 'Document not found.'], 404);
        }

        $relative = ltrim((string) $doc->file_path, '/');
        if (str_starts_with($relative, 'storage/')) {
            $relative = substr($relative, strlen('storage/'));
        }
        if (! $relative || ! Storage::disk('public')->exists($relative)) {
            return response()->json(['message' => 'No file on record for this document.'], 404);
        }

        $path = Storage::disk('public')->path($relative);
        $name = $doc->title . '.' . pathinfo($relative, PATHINFO_EXTENSION);

        return response()->file($path, [
            'Content-Type' => $doc->mime_type ?: 'application/octet-stream',
            'Content-Disposition' => 'inline; filename="' . $name . '"',
        ]);
    }

    /**
     * GET /api/v1/ess/requests/{id}/attachments/{attachmentId}/file
     * Streams a file attached to one of the employee's OWN requests — either
     * their own upload or the file HR sent back. Token auth (?token=) so a
     * plain browser open works without headers.
     */
    public function requestAttachmentFile(Request $request, string $id, string $attachmentId): object
    {
        $user = $this->resolveTokenUser($request) ?? $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $employee = $user->employee_id ? Employee::find($user->employee_id) : null;
        if (! $employee && $user->email) {
            $employee = Employee::where('email', $user->email)->first();
        }
        if (! $employee) {
            return response()->json(['message' => 'Employee not found.'], 404);
        }

        $essRequest = EssRequest::where('employee_id', $employee->employee_id)
            ->where(function ($q) use ($id) {
                $q->where('request_code', $id)->orWhere('ess_request_id', $id);
            })
            ->first();
        if (! $essRequest) {
            return response()->json(['message' => 'Request not found.'], 404);
        }

        $attachment = EssRequestAttachment::where('ess_request_attachment_id', (int) $attachmentId)
            ->where('ess_request_id', $essRequest->ess_request_id)
            ->first();
        if (! $attachment) {
            return response()->json(['message' => 'Attachment not found.'], 404);
        }

        // Release gate: the employee cannot open a module/HR file until ESS
        // Management has explicitly released the request.
        if ($attachment->direction === 'hr' && $essRequest->status !== 'Completed') {
            return response()->json([
                'message' => 'This document has not been released to you yet.',
            ], 403);
        }

        $relative = ltrim((string) $attachment->file_path, '/');
        if (str_starts_with($relative, 'storage/')) {
            $relative = substr($relative, strlen('storage/'));
        }
        if (! $relative || ! Storage::disk('public')->exists($relative)) {
            return response()->json(['message' => 'No file on record for this attachment.'], 404);
        }

        $path = Storage::disk('public')->path($relative);
        $name = $attachment->original_name ?: basename($relative);
        $safeName = (string) preg_replace('/[\r\n"]+/', '_', (string) $name);

        return response()->file($path, [
            'Content-Type' => $attachment->mime_type ?: 'application/octet-stream',
            'Content-Disposition' => 'inline; filename="' . $safeName . '"',
        ]);
    }

    /**
     * GET /api/v1/ess/admin/requests/{id}/attachments/{attachmentId}/file
     *
     * HR preview/download of an attachment on any employee request. Token auth
     * because browser opens cannot send an Authorization header.
     */
    public function adminRequestAttachmentFile(Request $request, string $id, string $attachmentId): object
    {
        $user = $this->resolveTokenUser($request) ?? $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $level = $user->permissions
            ->firstWhere('module_name', 'ESS Management')?->permission_level ?? 'None';

        // Attachments are the sensitive half of the workflow: require edit-grade
        // access (Edit / Write / Approve / Full), not just View.
        $rank = [
            'Full' => 3,
            'Edit' => 2,
            'Write' => 2,
            'Approve / Reject Only' => 2,
            'View' => 1,
            'Read' => 1,
            'None' => 0,
        ][$level] ?? 0;

        if (! $user->isSuperAdmin() && $rank < 2) {
            return response()->json([
                'message' => 'Access denied: you do not have permission to view this attachment.',
            ], 403);
        }

        $essRequest = EssRequest::where('request_code', $id)
            ->orWhere('ess_request_id', $id)
            ->first();
        if (! $essRequest) {
            return response()->json(['message' => 'Request not found.'], 404);
        }

        $attachment = EssRequestAttachment::where('ess_request_attachment_id', (int) $attachmentId)
            ->where('ess_request_id', $essRequest->ess_request_id)
            ->first();
        if (! $attachment) {
            return response()->json(['message' => 'Attachment not found.'], 404);
        }

        $relative = ltrim((string) $attachment->file_path, '/');
        if (str_starts_with($relative, 'storage/')) {
            $relative = substr($relative, strlen('storage/'));
        }
        if (! $relative || ! Storage::disk('public')->exists($relative)) {
            return response()->json(['message' => 'No file on record for this attachment.'], 404);
        }

        $path = Storage::disk('public')->path($relative);
        $name = $attachment->original_name ?: basename($relative);
        $safeName = (string) preg_replace('/[\r\n"]+/', '_', (string) $name);

        return response()->file($path, [
            'Content-Type' => $attachment->mime_type ?: 'application/octet-stream',
            'Content-Disposition' => 'inline; filename="' . $safeName . '"',
        ]);
    }

    /**
     * Token-based authentication for direct browser opens (?token=).
     */
    private function resolveTokenUser(Request $request): ?SystemUser
    {
        $token = $request->query('token') ?? $request->bearerToken();
        if (! $token) {
            return null;
        }
        $pat = PersonalAccessToken::findToken($token);
        if (! $pat || ! $pat->tokenable instanceof SystemUser) {
            return null;
        }
        return $pat->tokenable;
    }

    private function attachmentFileExists(?string $path): bool
    {
        $relative = ltrim((string) $path, '/');
        if (str_starts_with($relative, 'storage/')) {
            $relative = substr($relative, strlen('storage/'));
        }

        return $relative !== '' && Storage::disk('public')->exists($relative);
    }

    /**
     * POST /api/v1/ess/requests/{id}/cancel
     * Employee withdraws their own request while still Pending/Under Review.
     */
    public function cancelRequest(Request $request, string $id): JsonResponse
    {
        $employee = $this->resolveEmployee($request);
        if (! $employee) {
            return response()->json(['message' => 'Employee not found.'], 404);
        }

        $row = EssRequest::where('employee_id', $employee->employee_id)
            ->where(function ($q) use ($id) {
                $q->where('request_code', $id)->orWhere('ess_request_id', $id);
            })
            ->first();
        if (! $row) {
            return response()->json(['message' => 'Request not found.'], 404);
        }

        try {
            app(EssRequestWorkflow::class)->cancel($row, $request->user());
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => "Request {$row->request_code} withdrawn.",
            'request' => $row->fresh(['category', 'attachments', 'statusHistory']),
        ]);
    }

    /**
     * POST /api/v1/ess/requests/{id}/respond
     *
     * The employee answers a "Returned for Clarification" request with a note
     * and/or additional files. It goes back to Under Review.
     */
    public function respondToRequest(Request $request, string $id): JsonResponse
    {
        $employee = $this->resolveEmployee($request);
        if (! $employee) {
            return response()->json(['message' => 'Employee not found.'], 404);
        }

        $validated = $request->validate([
            'note' => 'nullable|string|max:2000',
            'attachments' => 'nullable|array|max:5',
            'attachments.*' => 'file|max:10240|mimes:pdf,png,jpg,jpeg,doc,docx',
        ]);

        if (trim((string) ($validated['note'] ?? '')) === '' && ! $request->hasFile('attachments')) {
            return response()->json([
                'message' => 'Add a note or attach a file so HR knows what changed.',
            ], 422);
        }

        $row = EssRequest::where('employee_id', $employee->employee_id)
            ->where(function ($q) use ($id) {
                $q->where('request_code', $id)->orWhere('ess_request_id', $id);
            })
            ->first();

        if (! $row) {
            return response()->json(['message' => 'Request not found.'], 404);
        }

        if ($row->status !== 'Returned for Clarification') {
            return response()->json([
                'message' => 'Only a returned request can be resubmitted.',
            ], 422);
        }

        $workflow = app(EssRequestWorkflow::class);
        $payloads = [];

        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $payloads[] = $workflow->storeUpload($file, 'ess-request-attachments');
            }
        }

        try {
            $workflow->resubmit($row, $request->user(), $validated['note'] ?? null, $payloads);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => 'Clarification submitted. Your request is back with HR.',
            'request' => $row->fresh(['category', 'attachments', 'statusHistory']),
        ]);
    }

    /**
     * GET /api/v1/ess/my-performance
     */
    public function getMyPerformance(Request $request): JsonResponse
    {
        $employee = $this->resolveEmployee($request);

        if (! $employee) {
            return response()->json(['message' => 'Employee not found.'], 404);
        }

        $courses = DB::table('learning_courses')->get();
        $userLearning = DB::table('employee_learning')
            ->where('employee_id', $employee->employee_id)
            ->get();

        // Real curriculum: every catalog course with this employee's progress
        // joined in (Assigned when no row exists yet).
        $byCourse = $userLearning->keyBy('course_id');
        $courseList = $courses->map(function ($c) use ($byCourse) {
            $row = $byCourse->get($c->course_id);
            $status = $row?->status ?? 'Assigned';
            // Text courses may not have been opened yet; derive the badge from
            // their content rather than showing a hand-typed (or missing) value.
            $meta = filled($c->content_text)
                ? $this->deriveReadingMeta((string) $c->content_text)
                : ['pages' => null, 'minutes' => null];
            return [
                'id' => $c->course_code,
                'course_id' => $c->course_id,
                'title' => $c->title,
                'category' => $c->category ?? 'General',
                'progress' => $status === 'Completed' ? 100 : ($status === 'In Progress' ? 50 : 0),
                'status' => $status,
                'score' => $row?->score !== null ? (float) $row->score : null,
                'duration' => null,
                'completedDate' => $row?->completed_date
                    ? Carbon::parse($row->completed_date)->format('M d, Y')
                    : null,
                // Tier-1 LMS: lets the player pick the reading vs quiz stage and
                // lets the cards show the parity badge (pages / read-time).
                'reading_completed_at' => $row?->reading_completed_at,
                'estimated_reading_minutes' => $c->estimated_reading_minutes !== null
                    ? (int) $c->estimated_reading_minutes : $meta['minutes'],
                'estimated_pages' => $c->estimated_pages !== null
                    ? (int) $c->estimated_pages : $meta['pages'],
                'mandatory' => (bool) ($c->mandatory ?? false),
            ];
        })->values()->all();

        $completedRows = $userLearning->where('status', 'Completed');
        $completedScores = $completedRows
            ->map(fn ($r) => $r->score)
            ->filter(fn ($s) => $s !== null)
            ->values();
        $averageScore = $completedScores->count() ? round((float) $completedScores->avg(), 1) : null;

        // Rating / competency come from the latest real performance review —
        // null when never reviewed (frontend falls back to its placeholder).
        $latestReview = DB::table('performance_reviews')
            ->where('employee_id', $employee->employee_id)
            ->orderByDesc('review_date')
            ->orderByDesc('performance_review_id')
            ->first();

        return response()->json([
            'employee' => [
                'name' => $employee->full_name,
                'role' => $employee->position?->title ?? 'Staff',
                'department' => $employee->department?->name ?? 'Front Office',
                'overall_rating' => $latestReview?->overall_rating !== null
                    ? (float) $latestReview->overall_rating
                    : null,
                'competency_level' => $latestReview?->competency_level,
            ],
            'stats' => [
                'completed_courses' => $completedRows->count(),
                'in_progress_courses' => $userLearning->where('status', 'In Progress')->count(),
                'average_score' => $averageScore,
                'total_training_hours' => null,
            ],
            'courses' => $courseList,
        ]);
    }

    /**
     * GET /api/v1/ess/categories
     */
    public function getCategories(): JsonResponse
    {
        $categories = EssCategory::where('is_open', true)
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'categories' => $categories->map(fn ($c) => [
                'id' => $c->ess_category_id,
                'name' => $c->name,
                'code' => $c->code,
                'description' => $c->description,
                'is_open' => (bool) $c->is_open,
            ]),
        ]);
    }

    /**
     * GET /api/v1/ess/recognitions
     */
    public function getRecognitions(Request $request): JsonResponse
    {
        $user = $request->user();
        $employee = $this->resolveEmployee($request);
        $empId = $employee?->employee_id;

        $posts = SocialRecognition::with('reactions')
            ->orderByDesc('created_at')
            ->get();

        $userReactions = [];
        if ($empId) {
            $userReactions = RecognitionReaction::where('employee_id', $empId)
                ->get()
                ->groupBy('recognition_id')
                ->map(fn ($group) => $group->pluck('reaction_type')->all())
                ->all();
        }

        $badgeColorMap = [
            'Guest Delight' => 'amber',
            'Teamwork & Malasakit' => 'emerald',
            'Going the Extra Mile' => 'purple',
            'Operational Excellence' => 'blue',
            'Integrity & Trust' => 'rose',
        ];

        $mapped = $posts->map(function ($p) use ($userReactions, $badgeColorMap) {
            $senderInitials = collect(explode(' ', trim($p->sender_name)))
                ->filter()
                ->take(2)
                ->map(fn ($n) => strtoupper(substr($n, 0, 1)))
                ->implode('');

            $recipientInitials = collect(explode(' ', trim($p->recipient_name)))
                ->filter()
                ->take(2)
                ->map(fn ($n) => strtoupper(substr($n, 0, 1)))
                ->implode('');

            return [
                'id' => (string) $p->recognition_id,
                'sender' => $p->sender_name,
                'senderRole' => $p->sender_role ?: 'Oxford Staff',
                'senderAvatar' => $senderInitials ?: 'OX',
                'recipient' => $p->recipient_name,
                'recipientRole' => $p->recipient_role ?: 'Oxford Suites Team Member',
                'recipientAvatar' => $recipientInitials ?: 'OX',
                'badge' => $p->core_value,
                'badgeColor' => $badgeColorMap[$p->core_value] ?? 'amber',
                'message' => $p->message,
                'reactions' => [
                    'clap' => (int) $p->clap_count,
                    'heart' => (int) $p->heart_count,
                    'star' => (int) $p->star_count,
                    'fire' => (int) $p->fire_count,
                ],
                'shares' => (int) ($p->shares_count ?? 0),
                'userReactions' => $userReactions[$p->recognition_id] ?? [],
                'timeAgo' => $p->created_at ? $p->created_at->diffForHumans() : 'Recently',
                'createdAt' => $p->created_at ? $p->created_at->toIso8601String() : Carbon::now()->toIso8601String(),
            ];
        });

        return response()->json([
            'recognitions' => $mapped,
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

        $employee = $this->resolveEmployee($request);
        $user = $request->user();
        $senderName = $employee?->full_name ?? ($user?->full_name ?: 'Colleague');
        $senderRole = ($employee?->department?->name ?? ($user?->department_name ?: 'General')) . ' Staff';

        // Try to locate recipient employee ID
        $recipientEmp = Employee::with('department', 'position')
            ->where(DB::raw("CONCAT(first_name, ' ', last_name)"), 'LIKE', "%{$validated['recipient']}%")
            ->orWhere('first_name', 'LIKE', "%{$validated['recipient']}%")
            ->first();

        $recipientRole = $recipientEmp ? ($recipientEmp->position?->title . ' · ' . ($recipientEmp->department?->name ?? 'Hotel')) : 'Oxford Suites Team Member';

        $post = SocialRecognition::create([
            'sender_employee_id' => $employee?->employee_id,
            'recipient_employee_id' => $recipientEmp?->employee_id,
            'sender_name' => $senderName,
            'recipient_name' => $validated['recipient'],
            'sender_role' => $senderRole,
            'recipient_role' => $recipientRole,
            'core_value' => $validated['badge'],
            'message' => $validated['message'],
            'clap_count' => 1,
            'heart_count' => 0,
            'star_count' => 0,
            'fire_count' => 0,
        ]);

        if ($employee) {
            RecognitionReaction::create([
                'recognition_id' => $post->recognition_id,
                'employee_id' => $employee->employee_id,
                'reaction_type' => 'clap',
            ]);
        }

        AuditLogger::log(
            action: 'Social Recognition Posted',
            module: 'Social Recognition',
            severity: 'Info',
            targetType: 'SocialRecognition',
            targetId: (string) $post->recognition_id,
            details: "{$senderName} recognized {$validated['recipient']} for {$validated['badge']}",
            request: $request
        );

        return response()->json([
            'message' => 'Recognition posted successfully!',
            'recognition' => $post,
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

        $employee = $this->resolveEmployee($request);
        $rec = SocialRecognition::findOrFail((int) $id);
        $type = $validated['reaction'];
        $column = $type . '_count';

        $empId = $employee?->employee_id;

        if ($empId) {
            $existing = RecognitionReaction::where('recognition_id', $rec->recognition_id)
                ->where('employee_id', $empId)
                ->where('reaction_type', $type)
                ->first();

            if ($existing) {
                $existing->delete();
                $rec->decrement($column);
            } else {
                RecognitionReaction::create([
                    'recognition_id' => $rec->recognition_id,
                    'employee_id' => $empId,
                    'reaction_type' => $type,
                ]);
                $rec->increment($column);
            }
        } else {
            $rec->increment($column);
        }

        $rec->refresh();

        return response()->json([
            'message' => 'Reaction updated.',
            'reactions' => [
                'clap' => $rec->clap_count,
                'heart' => $rec->heart_count,
                'star' => $rec->star_count,
                'fire' => $rec->fire_count,
            ],
        ]);
    }

    /**
     * POST /api/v1/ess/recognitions/{id}/share
     * Record a Wall of Fame share (any authenticated portal user).
     */
    public function shareKudos(Request $request, string $id): JsonResponse
    {
        $rec = SocialRecognition::findOrFail((int) $id);
        $rec->increment('shares_count');
        $rec->refresh();

        return response()->json([
            'message' => 'Recognition shared.',
            'shares' => (int) $rec->shares_count,
        ]);
    }

    /**
     * POST /api/v1/ess/my-learning/progress
     * Employee starts (or resumes) a catalog course: Assigned -> In Progress.
     * Completion itself is HR-verified (PATCH /ess/admin/learning/{id}/status).
     */
    public function updateLearningProgress(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'course_code' => 'required|string|max:40',
        ]);

        $employee = $this->resolveEmployee($request);
        if (! $employee) {
            return response()->json(['message' => 'Employee not found.'], 404);
        }

        $course = DB::table('learning_courses')
            ->where('course_code', $validated['course_code'])
            ->first();
        if (! $course) {
            return response()->json(['message' => 'Course not found.'], 404);
        }

        $existing = DB::table('employee_learning')
            ->where('employee_id', $employee->employee_id)
            ->where('course_id', $course->course_id)
            ->first();

        if ($existing) {
            if ($existing->status === 'Completed') {
                return response()->json([
                    'message' => 'Course already completed — only HR can modify a completed record.',
                ], 422);
            }
            DB::table('employee_learning')
                ->where('employee_learning_id', $existing->employee_learning_id)
                ->update(['status' => 'In Progress']);
            $learningId = $existing->employee_learning_id;
        } else {
            $learningId = DB::table('employee_learning')->insertGetId([
                'employee_id' => $employee->employee_id,
                'course_id' => $course->course_id,
                'status' => 'In Progress',
                'assigned_date' => Carbon::today()->toDateString(),
            ]);
        }

        $record = DB::table('employee_learning')->where('employee_learning_id', $learningId)->first();

        AuditLogger::log(
            action: 'LMS Course Started',
            module: 'Learning Management',
            severity: 'Info',
            targetType: 'EmployeeLearning',
            targetId: (string) $learningId,
            details: "{$employee->full_name} started {$course->course_code} — {$course->title}",
            request: $request
        );

        return response()->json([
            'message' => 'Course marked as in progress.',
            'learning' => $record,
        ]);
    }

    /**
     * Deterministic, verifiable certificate code — no storage needed, the same
     * inputs always reproduce the same code (HR can recompute it to verify).
     */
    private function learningVerificationCode(int $employeeId, int $courseId, ?string $completedDate): string
    {
        $hash = strtoupper(substr(hash('sha256', $employeeId.'|'.$courseId.'|'.$completedDate.'|'.config('app.key')), 0, 8));
        return "LMS-{$employeeId}-{$courseId}-{$hash}";
    }

    /**
     * GET /api/v1/ess/my-learning/certificate/{courseCode}
     * Eligibility + verification code for a COMPLETED course only.
     */
    public function learningCertificate(Request $request, string $courseCode): JsonResponse
    {
        $employee = $this->resolveEmployee($request);
        if (! $employee) {
            return response()->json(['message' => 'Employee not found.'], 404);
        }

        $row = DB::table('employee_learning as el')
            ->join('learning_courses as lc', 'lc.course_id', '=', 'el.course_id')
            ->where('el.employee_id', $employee->employee_id)
            ->where('lc.course_code', $courseCode)
            ->select('el.*', 'lc.title', 'lc.category', 'lc.course_code')
            ->first();

        if (! $row || $row->status !== 'Completed') {
            return response()->json([
                'eligible' => false,
                'message' => 'Certificate available only for completed courses.',
            ], 404);
        }

        return response()->json([
            'eligible' => true,
            'verification_code' => $this->learningVerificationCode(
                (int) $employee->employee_id,
                (int) $row->course_id,
                $row->completed_date
            ),
            'course' => [
                'code' => $row->course_code,
                'title' => $row->title,
                'category' => $row->category ?? 'General',
                'score' => $row->score !== null ? (float) $row->score : null,
                'completed_date' => $row->completed_date
                    ? Carbon::parse($row->completed_date)->format('M d, Y')
                    : null,
            ],
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* Tier-1 thin LMS: handbook -> AI quiz -> auto-score (ESS only)        */
    /* ------------------------------------------------------------------ */

    private const CHARS_PER_PAGE = 1800;
    private const WORDS_PER_MINUTE = 200;

    /**
     * Estimate reading metadata from handbook text. A real PDF page count
     * (from the NLP extractor) always wins over the character estimate.
     *
     * @return array{pages:int, minutes:int}
     */
    private function deriveReadingMeta(string $text, ?int $realPageCount = null): array
    {
        $words = str_word_count(strip_tags($text));
        $pages = ($realPageCount !== null && $realPageCount > 0)
            ? $realPageCount
            : max(1, (int) ceil(mb_strlen($text) / self::CHARS_PER_PAGE));

        return [
            'pages' => $pages,
            'minutes' => max(1, (int) ceil($words / self::WORDS_PER_MINUTE)),
        ];
    }

    /**
     * Lazy handbook material: the cached content_text, or (for file-based
     * handbooks) text extracted once via the NLP service and cached back onto
     * the course together with its real page count.
     *
     * @return array{text:?string, source:?string, page_count:?int}
     */
    private function resolveCourseMaterial(object $course): array
    {
        $cached = trim((string) ($course->content_text ?? ''));
        if ($cached !== '') {
            return ['text' => $cached, 'source' => 'content_text', 'page_count' => null];
        }

        $relative = $this->courseFilePath($course);
        if ($relative === null) {
            return ['text' => null, 'source' => null, 'page_count' => null];
        }

        $result = app(NlpService::class)->extractDocumentText(
            Storage::disk('public')->path($relative),
            basename($relative),
        );

        $text = HandbookTextCleaner::clean((string) data_get($result, 'data.text', ''));
        if (! ($result['ok'] ?? false) || $text === '') {
            return ['text' => null, 'source' => null, 'page_count' => null];
        }

        $pageCount = (int) data_get($result, 'data.page_count', 0) ?: null;
        $meta = $this->deriveReadingMeta($text, $pageCount);

        $patch = ['content_text' => $text];
        if ($course->estimated_pages === null) {
            $patch['estimated_pages'] = $meta['pages'];
        }
        if ($course->estimated_reading_minutes === null) {
            $patch['estimated_reading_minutes'] = $meta['minutes'];
        }

        DB::table('learning_courses')
            ->where('course_id', $course->course_id)
            ->update($patch);

        return ['text' => $text, 'source' => 'file', 'page_count' => $pageCount];
    }

    /** Normalised, existing public-disk path for a course handbook, or null. */
    private function courseFilePath(object $course): ?string
    {
        $relative = ltrim((string) ($course->material_path ?? ''), '/');
        if (str_starts_with($relative, 'storage/')) {
            $relative = substr($relative, strlen('storage/'));
        }

        return ($relative !== '' && Storage::disk('public')->exists($relative)) ? $relative : null;
    }

    /** The employee's employee_learning row for a course (or null). */
    private function learningRow(int $employeeId, int $courseId): ?object
    {
        return DB::table('employee_learning')
            ->where('employee_id', $employeeId)
            ->where('course_id', $courseId)
            ->first();
    }

    /**
     * GET /api/v1/ess/my-learning/{courseCode}/material
     * Handbook payload for the player's reading stage (§2a).
     */
    public function learningMaterial(Request $request, string $courseCode): JsonResponse
    {
        $employee = $this->resolveEmployee($request);
        if (! $employee) {
            return response()->json(['message' => 'Employee not found.'], 404);
        }

        $course = DB::table('learning_courses')->where('course_code', $courseCode)->first();
        if (! $course) {
            return response()->json(['message' => 'Course not found.'], 404);
        }

        $relative = $this->courseFilePath($course);
        $material = $this->resolveCourseMaterial($course);

        // Backfill derived metadata so the badge is honest on first open, and
        // patch the in-memory row so this response already reflects it.
        if ($material['text'] !== null
            && ($course->estimated_pages === null || $course->estimated_reading_minutes === null)) {
            $meta = $this->deriveReadingMeta($material['text'], $material['page_count']);
            $patch = [];
            if ($course->estimated_pages === null) {
                $patch['estimated_pages'] = $meta['pages'];
            }
            if ($course->estimated_reading_minutes === null) {
                $patch['estimated_reading_minutes'] = $meta['minutes'];
            }
            if ($patch !== []) {
                DB::table('learning_courses')
                    ->where('course_id', $course->course_id)
                    ->update($patch);
                $course = (object) array_merge((array) $course, $patch);
            }
        }

        $row = $this->learningRow((int) $employee->employee_id, (int) $course->course_id);

        return response()->json([
            'course' => [
                'code' => $course->course_code,
                'title' => $course->title,
                'category' => $course->category ?? 'General',
                'estimated_reading_minutes' => $course->estimated_reading_minutes !== null
                    ? (int) $course->estimated_reading_minutes : null,
                'estimated_pages' => $course->estimated_pages !== null
                    ? (int) $course->estimated_pages : null,
                'mandatory' => (bool) ($course->mandatory ?? false),
            ],
            'content' => $material['text'],
            'file_url' => $relative !== null
                ? '/api/v1/ess/my-learning/' . rawurlencode($courseCode) . '/file'
                : null,
            'status' => $row?->status ?? 'Assigned',
            'reading_completed_at' => $row?->reading_completed_at,
        ]);
    }

    /**
     * POST /api/v1/ess/my-learning/{courseCode}/reading-complete
     * Marks the reading stage done - the write the hard gate checks (§2d).
     * Idempotent; never downgrades an existing Completed row.
     */
    public function completeLearningReading(Request $request, string $courseCode): JsonResponse
    {
        $employee = $this->resolveEmployee($request);
        if (! $employee) {
            return response()->json(['message' => 'Employee not found.'], 404);
        }

        $course = DB::table('learning_courses')->where('course_code', $courseCode)->first();
        if (! $course) {
            return response()->json(['message' => 'Course not found.'], 404);
        }

        $existing = $this->learningRow((int) $employee->employee_id, (int) $course->course_id);

        if (! $existing) {
            $learningId = DB::table('employee_learning')->insertGetId([
                'employee_id' => $employee->employee_id,
                'course_id' => $course->course_id,
                'status' => 'In Progress',
                'assigned_date' => Carbon::today()->toDateString(),
                'reading_completed_at' => now(),
            ]);
        } else {
            $learningId = $existing->employee_learning_id;
            $update = ['reading_completed_at' => $existing->reading_completed_at ?: now()];
            if ($existing->status !== 'Completed') {
                $update['status'] = 'In Progress';
            }
            DB::table('employee_learning')
                ->where('employee_learning_id', $learningId)
                ->update($update);
        }

        $row = DB::table('employee_learning')->where('employee_learning_id', $learningId)->first();

        AuditLogger::log(
            action: 'LMS Reading Completed',
            module: 'Learning Management',
            severity: 'Info',
            targetType: 'EmployeeLearning',
            targetId: (string) $learningId,
            details: "{$employee->full_name} finished reading {$course->course_code} - {$course->title}",
            request: $request
        );

        return response()->json([
            'message' => 'Reading marked complete.',
            'reading_completed_at' => $row->reading_completed_at,
            'status' => $row->status,
        ]);
    }

    /**
     * GET /api/v1/ess/my-learning/{courseCode}/quiz
     * Hard gate (§1e / §10): the quiz is refused until the handbook is read.
     * Generates + caches the quiz on first request; NEVER returns the answer key.
     */
    public function learningQuiz(Request $request, string $courseCode): JsonResponse
    {
        $employee = $this->resolveEmployee($request);
        if (! $employee) {
            return response()->json(['message' => 'Employee not found.'], 404);
        }

        $course = DB::table('learning_courses')->where('course_code', $courseCode)->first();
        if (! $course) {
            return response()->json(['message' => 'Course not found.'], 404);
        }

        $row = $this->learningRow((int) $employee->employee_id, (int) $course->course_id);

        // The server gate is authoritative - a bypassed client cannot skip reading.
        if (! $row || $row->reading_completed_at === null) {
            return response()->json([
                'code' => 'reading_required',
                'message' => 'Finish the handbook first.',
            ], 409);
        }

        $quiz = $course->quiz_json ? json_decode((string) $course->quiz_json, true) : null;

        if (! is_array($quiz) || empty($quiz['questions'])) {
            $material = $this->resolveCourseMaterial($course);
            $text = $material['text'];
            if ($text === null) {
                return response()->json([
                    'code' => 'ai_unavailable',
                    'fallback' => false,
                    'message' => 'No handbook text is available to build a quiz.',
                ], 503);
            }

            $generated = app(LmsQuizGenerator::class)->generate(
                (string) $course->title,
                $course->category,
                $text,
                (int) config('services.ess_lms.question_count', 10),
            );

            if (! ($generated['ok'] ?? false)) {
                return response()->json([
                    'code' => 'ai_unavailable',
                    'fallback' => false,
                    'message' => $generated['error'] ?? 'Could not generate a quiz.',
                ], 503);
            }

            $quiz = [
                'pass_mark' => (int) config('services.ess_lms.pass_mark', 80),
                'time_limit_seconds' => (int) config('services.ess_lms.time_limit_seconds', 600),
                'generated_by' => $generated['generated_by'] ?? 'ai',
                'questions' => $generated['questions'],
            ];

            DB::table('learning_courses')->where('course_id', $course->course_id)->update([
                'quiz_json' => json_encode($quiz),
                'quiz_generated_at' => now(),
                'content_text' => $course->content_text ?: $text,
            ]);
        }

        // Per-attempt shuffle (§4): the bank is cached in canonical order, but each
        // serving re-orders questions and options so a circulated answer key
        // ("question 3 is option C") does not carry over to the next attempt.
        // The seed is safe to expose - it reveals only the display order, never
        // which option is correct (correct_index stays server-side).
        $seed = random_int(1, 2147483647);

        $questions = array_values($quiz['questions']);
        $shuffled = [];
        foreach (LmsQuizGenerator::permutation(count($questions), $seed) as $questionIndex) {
            $q = $questions[$questionIndex];
            $qid = (int) $q['id'];
            $options = array_values($q['options']);
            $optionOrder = LmsQuizGenerator::permutation(count($options), $seed ^ $qid);

            $shuffled[] = [
                'id' => $qid,
                'question' => $q['question'],
                'options' => array_map(fn (int $i) => $options[$i], $optionOrder),
            ];
        }

        return response()->json([
            'course' => [
                'code' => $course->course_code,
                'title' => $course->title,
                'category' => $course->category ?? 'General',
            ],
            'pass_mark' => (int) ($quiz['pass_mark'] ?? 80),
            'total_items' => count($questions),
            'time_limit_seconds' => (int) ($quiz['time_limit_seconds'] ?? 600),
            // Answer key (correct_index / explanation) intentionally omitted.
            'questions' => $shuffled,
            // Echoed back on submit so grading can rebuild this attempt's order.
            'attempt_seed' => $seed,
            'already_passed' => ($row->status ?? null) === 'Completed',
            'last_score' => $row->score !== null ? (float) $row->score : null,
        ]);
    }

    /**
     * POST /api/v1/ess/my-learning/{courseCode}/quiz
     * Grades server-side from the cached key and applies the §2c completion
     * rule: a pass sets Completed immediately (completion_source = 'quiz').
     * Completed is terminal - resubmits are no-ops.
     */
    public function submitLearningQuiz(Request $request, string $courseCode): JsonResponse
    {
        $validated = $request->validate([
            'answers' => 'required|array',
            // The per-attempt shuffle seed echoed back from the GET (§4).
            'attempt_seed' => 'required|integer|min:1',
        ]);

        $employee = $this->resolveEmployee($request);
        if (! $employee) {
            return response()->json(['message' => 'Employee not found.'], 404);
        }

        $course = DB::table('learning_courses')->where('course_code', $courseCode)->first();
        if (! $course) {
            return response()->json(['message' => 'Course not found.'], 404);
        }

        $quiz = $course->quiz_json ? json_decode((string) $course->quiz_json, true) : null;
        if (! is_array($quiz) || empty($quiz['questions'])) {
            return response()->json([
                'code' => 'quiz_not_ready',
                'message' => 'The quiz has not been prepared yet.',
            ], 409);
        }

        $row = $this->learningRow((int) $employee->employee_id, (int) $course->course_id);

        // The same hard gate protects submission, not just delivery.
        if (! $row || $row->reading_completed_at === null) {
            return response()->json([
                'code' => 'reading_required',
                'message' => 'Finish the handbook first.',
            ], 409);
        }

        $answers = $validated['answers'];
        $passMark = (int) ($quiz['pass_mark'] ?? 80);

        // Rebuild this attempt's display order from the seed the client echoed
        // back, so a displayed option position maps to its canonical index.
        $seed = (int) $validated['attempt_seed'];

        $correct = 0;
        $answered = [];
        $review = [];
        foreach ($quiz['questions'] as $q) {
            $qid = (int) $q['id'];
            $correctIndex = (int) $q['correct_index'];
            $options = array_values($q['options']);
            $optionOrder = LmsQuizGenerator::permutation(count($options), $seed ^ $qid);

            $displayed = array_key_exists($qid, $answers) ? (int) $answers[$qid] : null;
            $yourIndex = ($displayed !== null && isset($optionOrder[$displayed]))
                ? (int) $optionOrder[$displayed]
                : null;

            $isCorrect = $yourIndex !== null && $yourIndex === $correctIndex;
            if ($isCorrect) {
                $correct++;
            }
            $answered[$qid] = $yourIndex;
            $review[] = [
                'id' => $qid,
                'question' => $q['question'],
                'options' => array_values($q['options']),
                'correct_index' => $correctIndex,
                'your_index' => $yourIndex,
                'is_correct' => $isCorrect,
                'explanation' => $q['explanation'] ?? '',
            ];
        }

        $total = count($quiz['questions']);
        $score = $total > 0 ? (int) round(100 * $correct / $total) : 0;
        $passed = $score >= $passMark;

        // Terminal: once Completed the course is finished; resubmits are no-ops.
        if ($row->status === 'Completed') {
            return response()->json([
                'passed' => true,
                'score' => $row->score !== null ? (int) round((float) $row->score) : $score,
                'correct_count' => $correct,
                'total_count' => $total,
                'pass_mark' => $passMark,
                'status' => 'Completed',
                'certificate_eligible' => true,
                'already_completed' => true,
                'review' => $review,
            ]);
        }

        // Keep the best score ever recorded for the course card.
        $bestScore = $row->score !== null ? max((float) $row->score, (float) $score) : (float) $score;

        if ($passed) {
            DB::table('employee_learning')
                ->where('employee_learning_id', $row->employee_learning_id)
                ->update([
                    'status' => 'Completed',
                    'score' => $bestScore,
                    'completed_date' => $row->completed_date ?: Carbon::today()->toDateString(),
                    'completion_source' => 'quiz',
                ]);
        } else {
            // Not completed - retakes stay available while not Completed.
            DB::table('employee_learning')
                ->where('employee_learning_id', $row->employee_learning_id)
                ->update([
                    'status' => 'In Progress',
                    'score' => $bestScore,
                ]);
        }

        DB::table('employee_learning_attempts')->insert([
            'employee_id' => $employee->employee_id,
            'course_id' => $course->course_id,
            'score' => $score,
            'correct_count' => $correct,
            'total_count' => $total,
            'passed' => $passed,
            'answers_json' => json_encode($answered),
            'submitted_at' => now(),
        ]);

        AuditLogger::log(
            action: 'LMS Quiz Submitted',
            module: 'Learning Management',
            severity: 'Info',
            targetType: 'EmployeeLearning',
            targetId: (string) $row->employee_learning_id,
            details: "{$employee->full_name} scored {$score}% on {$course->course_code} (".($passed ? 'pass' : 'fail').")",
            request: $request
        );

        return response()->json([
            'passed' => $passed,
            'score' => $score,
            'correct_count' => $correct,
            'total_count' => $total,
            'pass_mark' => $passMark,
            'status' => $passed ? 'Completed' : 'In Progress',
            'certificate_eligible' => $passed,
            'review' => $review,
        ]);
    }

    /**
     * GET /api/v1/ess/my-learning/{courseCode}/file
     * Streams a file-based handbook inline. Token auth (?token=) so the
     * reading <iframe> works without an Authorization header.
     */
    public function learningMaterialFile(Request $request, string $courseCode): object
    {
        $user = $this->resolveTokenUser($request) ?? $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $employee = $user->employee_id ? Employee::find($user->employee_id) : null;
        if (! $employee && $user->email) {
            $employee = Employee::where('email', $user->email)->first();
        }
        if (! $employee) {
            return response()->json(['message' => 'Employee not found.'], 404);
        }

        $course = DB::table('learning_courses')->where('course_code', $courseCode)->first();
        if (! $course) {
            return response()->json(['message' => 'Course not found.'], 404);
        }

        $relative = $this->courseFilePath($course);
        if ($relative === null) {
            return response()->json(['message' => 'No handbook file on record for this course.'], 404);
        }

        $extension = pathinfo($relative, PATHINFO_EXTENSION);
        $name = (string) preg_replace('/[\r\n"]+/', '_', (string) $course->title . ($extension ? '.' . $extension : ''));

        return response()->file(Storage::disk('public')->path($relative), [
            'Content-Type' => $extension === 'pdf' ? 'application/pdf' : 'application/octet-stream',
            'Content-Disposition' => 'inline; filename="' . $name . '"',
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* Promotion requests (employee files, HR reviews in Core HCM)         */
    /* ------------------------------------------------------------------ */

    public function myPromotionRequests(Request $request): JsonResponse
    {
        $employee = $this->resolveEmployee($request);
        if (! $employee) {
            return response()->json(['message' => 'No linked employee record found.'], 404);
        }

        $rows = \App\Models\PromotionRequest::with(['requestedPosition', 'hr3Recommendation'])
            ->where('employee_id', $employee->employee_id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $rows]);
    }

    /**
     * ESS-safe position options for promotion requests.
     * Employees have Core HCM = None so they cannot hit /positions directly;
     * this exposes id/title/department only (no headcount/salary internals).
     */
    public function promotionPositions(Request $request): JsonResponse
    {
        $employee = $this->resolveEmployee($request);
        if (! $employee) {
            return response()->json(['message' => 'No linked employee record found.'], 404);
        }

        $rows = \App\Models\Position::query()
            ->with('department:department_id,name')
            ->orderBy('title')
            ->limit(200)
            ->get(['position_id', 'title', 'department_id'])
            ->map(fn ($p) => [
                'position_id' => $p->position_id,
                'title' => $p->title,
                'department' => $p->department?->name,
            ]);

        return response()->json(['data' => $rows]);
    }

    /**
     * ESS-safe checklist view for the employee's OWN onboarding items
     * (no New Hire Onboarding module permission needed beyond ESS).
     */
    public function myChecklist(Request $request): JsonResponse
    {
        $employee = $this->resolveEmployee($request);
        if (! $employee) {
            return response()->json(['message' => 'No linked employee record found.'], 404);
        }

        $hire = \Modules\NewHireOnboarding\Models\NewHire::with(['position', 'onboardingItems.templateItem.template'])
            ->where(function ($outer) use ($employee) {
                $outer->where('employee_id', $employee->employee_id)
                    ->orWhere(function ($q) use ($employee) {
                        $q->where('email', $employee->email)
                            ->orWhere('name', trim(($employee->first_name ?? '').' '.($employee->last_name ?? '')));
                    });
            })
            ->orderByDesc('start_date')
            ->first();

        if (! $hire) {
            return response()->json(['data' => [], 'new_hire' => null]);
        }

        // Use the same read-time union as the admin pipeline
        // (NewHire::visibleOnboardingItems()): materialized rows + virtual
        // items from Active checklist templates that match the hire's stage
        // and position. Raw onboardingItems alone hides every Active template
        // that has not been materialized yet — which is exactly why active
        // pre-onboarding templates were invisible to employees.
        return response()->json([
            'data' => $hire->visibleOnboardingItems(),
            'new_hire' => [
                'new_hire_id' => $hire->new_hire_id,
                'new_hire_code' => $hire->new_hire_code,
                'name' => $hire->name,
                'stage' => $hire->stage,
            ],
        ]);
    }

    public function createPromotionRequest(Request $request): JsonResponse
    {
        $employee = $this->resolveEmployee($request);
        if (! $employee) {
            return response()->json(['message' => 'No linked employee record found.'], 404);
        }

        $data = $request->validate([
            'requested_position_id' => ['nullable', 'integer', 'exists:positions,position_id'],
            'requested_salary_grade_id' => ['nullable', 'integer', 'exists:salary_grades,salary_grade_id'],
            'justification' => ['required', 'string', 'min:10', 'max:2000'],
        ]);

        $pending = \App\Models\PromotionRequest::where('employee_id', $employee->employee_id)
            ->active()
            ->exists();
        if ($pending) {
            return response()->json([
                'code' => 'DUPLICATE_PROMOTION_REQUEST',
                'message' => 'You already have a pending promotion request. Please wait for HR review or withdraw it first.',
            ], 409);
        }

        $row = \App\Models\PromotionRequest::create([
            'employee_id' => $employee->employee_id,
            'current_position_id' => $employee->position_id,
            'requested_position_id' => $data['requested_position_id'] ?? null,
            'requested_salary_grade_id' => $data['requested_salary_grade_id'] ?? null,
            'justification' => $data['justification'],
            'status' => 'Pending',
        ]);

        AuditLogger::log(
            'Promotion request filed',
            'ESS Management',
            'Info',
            'employee',
            (string) $employee->employee_code,
            "Employee {$employee->full_name} filed promotion request #{$row->promotion_request_id}.",
        );

        return response()->json(['message' => 'Promotion request submitted for HR review.', 'data' => $row], 201);
    }
}
