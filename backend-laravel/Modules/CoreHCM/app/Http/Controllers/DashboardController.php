<?php

namespace Modules\CoreHCM\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Applicant;
use App\Models\AuditLog;
use App\Models\Department;
use App\Models\Employee;
use App\Models\EmployeeExitRecord;
use App\Models\JobPost;
use App\Models\SystemUser;
use Illuminate\Http\JsonResponse;
use Modules\ApplicantManagement\Models\Interview;
use Modules\NewHireOnboarding\Models\NewHire;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        return response()->json([
            'data' => [
                'applicants' => $this->applicants(),
                'interviews' => ['scheduled' => Interview::where('status', 'Scheduled')->count()],
                'job_posts' => $this->jobPosts(),
                'new_hires' => $this->newHires(),
                'employees' => $this->employees(),
                'departments' => $this->departments(),
                'system_users' => $this->systemUsers(),
                'audit' => $this->audit(),
            ],
        ]);
    }

    private function applicants(): array
    {
        $applicants = Applicant::select('status', 'stage', 'source', 'fit_score', 'applied_at')->get();

        $byStatus = $applicants->groupBy('status')->map->count();
        $byStage = $applicants->groupBy('stage')->map->count();
        $bySource = $applicants->groupBy('source')->map->count();

        $trend = collect(range(6, 0))->map(function ($daysAgo) use ($applicants) {
            $date = now()->subDays($daysAgo)->toDateString();
            $day = $applicants->filter(fn ($a) => $a->applied_at?->toDateString() === $date);
            return [
                'day' => now()->subDays($daysAgo)->format('D'),
                'applications' => $day->count(),
                'screened' => $day->whereNotNull('fit_score')->count(),
            ];
        });

        return [
            'total' => $applicants->count(),
            'fit' => $byStatus['fit'] ?? 0,
            'by_status' => $byStatus,
            'by_stage' => $byStage,
            'by_source' => $bySource,
            'avg_fit_score' => round($applicants->avg('fit_score') ?? 0, 1),
            'trend' => $trend,
        ];
    }

    private function jobPosts(): array
    {
        $open = JobPost::whereIn('status', ['published', 'Open'])->where('active', 1);
        $openIds = (clone $open)->pluck('job_post_id');

        return [
            'open' => $open->count(),
            'total_applicants' => Applicant::whereIn('job_post_id', $openIds)->count(),
        ];
    }

    private function newHires(): array
    {
        $hires = NewHire::select('stage')->get();

        return [
            'total' => $hires->count(),
            'by_stage' => $hires->groupBy('stage')->map->count(),
        ];
    }

    private function employees(): array
    {
        $employees = Employee::select('employee_id', 'status', 'date_hired')->get();
        $exits = EmployeeExitRecord::select('exit_date')->get();

        $activeStatuses = ['Active', 'On Leave'];
        $activeCount = $employees->whereIn('status', $activeStatuses)->count();

        $monthSeries = function (int $months) use ($employees, $exits) {
            $series = [];
            $headcount = 0;
            for ($i = $months - 1; $i >= 0; $i--) {
                $month = now()->subMonths($i);
                $start = $month->copy()->startOfMonth();
                $end = $month->copy()->endOfMonth();
                $hires = $employees->whereBetween('date_hired', [$start, $end])->count();
                $exitCount = $exits->whereBetween('exit_date', [$start, $end])->count();
                $headcount += $hires - $exitCount;
                $series[] = [
                    'month' => $month->format('M'),
                    'headcount' => max($headcount, 0),
                    'hires' => $hires,
                    'exits' => $exitCount,
                ];
            }
            return $series;
        };

        return [
            'total' => $employees->count(),
            'active' => $activeCount,
            'trend_6m' => $monthSeries(6),
            'trend_ytd' => $monthSeries(12),
        ];
    }

    private function departments(): array
    {
        $openPerDept = JobPost::whereIn('status', ['published', 'Open'])
            ->where('active', 1)
            ->selectRaw('department_id, COUNT(*) as open_count')
            ->groupBy('department_id')
            ->pluck('open_count', 'department_id');

        return Department::withCount(['employees' => fn ($q) => $q->whereIn('status', ['Active', 'On Leave'])])
            ->get()
            ->map(fn (Department $d) => [
                'name' => $d->name,
                'staff' => $d->employees_count,
                'open' => $openPerDept[$d->department_id] ?? 0,
            ])
            ->values()
            ->all();
    }

    private function systemUsers(): array
    {
        $users = SystemUser::with('role')
            ->orderByDesc('last_login_at')
            ->get();

        return [
            'total' => $users->count(),
            'by_role' => $users->groupBy(fn ($u) => $u->role?->role_name ?? 'Unknown')->map->count(),
            'by_status' => $users->groupBy('status')->map->count(),
            'recent' => $users->take(4)->map(fn ($u) => [
                'id' => $u->system_user_id,
                'name' => $u->full_name,
                'department' => $u->department_name,
                'status' => $u->status,
                'last_login_at' => $u->last_login_at?->toIso8601String(),
            ]),
        ];
    }

    private function audit(): array
    {
        return [
            'total' => AuditLog::count(),
            'recent' => AuditLog::orderByDesc('occurred_at')
                ->take(6)
                ->get()
                ->map(fn ($log) => [
                    'id' => $log->audit_log_id,
                    'action' => $log->action,
                    'severity' => $log->severity,
                    'user' => $log->actor_role === 'System' ? 'System' : ($log->user->full_name ?? 'System'),
                    'timestamp' => $log->occurred_at?->toIso8601String(),
                ]),
        ];
    }
}