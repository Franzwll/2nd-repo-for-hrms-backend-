<?php

namespace Modules\CoreHCM\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Applicant;
use App\Models\Department;
use App\Models\Employee;
use App\Models\JobPost;
use App\Models\Position;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UnifiedSearchController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => ['required', 'string', 'min:1', 'max:100'],
            'limit' => ['sometimes', 'integer', 'min:1', 'max:20'],
        ]);
        $q = trim($validated['q']);
        $limit = (int) ($validated['limit'] ?? 8);
        $like = "%{$q}%";

        $user = $request->user();
        $isSuperAdmin = method_exists($user, 'isSuperAdmin') && $user->isSuperAdmin();
        $canViewEmployees = $this->canViewEmployees($request);
        $canViewApplicants = $this->canViewApplicants($request);
        $canViewUsers = $isSuperAdmin || $user?->hasPermissionTo('User Management');
        $canViewDepartments = $this->canViewDepartments($request);

        // Employees
        $employees = [];
        if ($canViewEmployees) {
            $employees = Employee::query()
                ->with(['department:department_id,name', 'position:position_id,title'])
                ->where(function ($w) use ($like) {
                    $w->where('first_name', 'like', $like)
                        ->orWhere('last_name', 'like', $like)
                        ->orWhere('employee_code', 'like', $like);
                })
                ->orderBy('first_name')->limit($limit)
                ->get(['employee_id as id', 'employee_code as code', 'first_name', 'last_name', 'status', 'department_id', 'position_id'])
                ->map(fn ($e) => [
                    'id' => $e->id,
                    'type' => 'employee',
                    'module' => 'Employee Records',
                    'title' => trim($e->first_name.' '.$e->last_name).' ('.$e->code.')',
                    'subtitle' => trim(($e->department->name ?? '').' · '.($e->position->title ?? '').' · '.($e->status ?? ''), ' ·'),
                    'url' => "/superadmin/employees/{$e->id}",
                ])->values();
        }

        // Applicants
        $applicants = [];
        if ($canViewApplicants) {
            $applicants = Applicant::query()
                ->with(['jobPost:job_post_id,title', 'currentStage'])
                ->where(function ($w) use ($like) {
                    $w->where('first_name', 'like', $like)
                        ->orWhere('last_name', 'like', $like)
                        ->orWhere('applicant_code', 'like', $like)
                        ->orWhere('email', 'like', $like);
                })
                ->orderByDesc('created_at')->limit($limit)
                ->get(['applicant_id as id', 'applicant_code as code', 'first_name', 'last_name', 'email', 'status', 'job_post_id', 'current_stage_id'])
                ->map(fn ($a) => [
                    'id' => $a->id,
                    'type' => 'applicant',
                    'module' => 'Applicant Management',
                    'title' => trim($a->first_name.' '.$a->last_name).' ('.$a->code.')',
                    'subtitle' => trim(($a->jobPost->title ?? '').' · '.($a->currentStage->name ?? '').' · '.($a->status ?? ''), ' ·'),
                    'url' => "/superadmin/applicants/{$a->id}",
                ])->values();
        }

        // Users (Super Admin only)
        $users = [];
        if ($canViewUsers) {
            $users = User::query()
                ->where(function ($w) use ($like) {
                    $w->where('name', 'like', $like)
                        ->orWhere('email', 'like', $like)
                        ->orWhere('employee_id', 'like', $like);
                })
                ->orderBy('name')->limit($limit)
                ->get(['id', 'name', 'email', 'status', 'role_id', 'employee_id'])
                ->map(fn ($u) => [
                    'id' => $u->id,
                    'type' => 'user',
                    'module' => 'User Management',
                    'title' => $u->name.' ('.$u->email.')',
                    'subtitle' => $u->status,
                    'url' => "/superadmin/users/{$u->id}",
                ])->values();
        }

        // Job Posts
        $jobs = JobPost::query()
            ->with('department:department_id,name')
            ->whereIn('status', ['published', 'Open'])->where('active', 1)
            ->where(function ($w) use ($like) {
                $w->where('title', 'like', $like)
                    ->orWhere('summary', 'like', $like);
            })
            ->orderByDesc('posted_date')->limit($limit)
            ->get(['job_post_id as id', 'title', 'employment_type', 'department_id'])
            ->map(fn ($j) => [
                'id' => $j->id,
                'type' => 'job',
                'module' => 'Recruitment',
                'title' => $j->title,
                'subtitle' => trim(($j->department->name ?? '').' · '.($j->employment_type ?? ''), ' ·'),
                'url' => "/superadmin/recruitment/{$j->id}",
            ])->values();

        // Departments
        $departments = [];
        if ($canViewDepartments) {
            $departments = Department::query()
                ->where(fn ($w) => $w->where('name', 'like', $like)->orWhere('code', 'like', $like))
                ->orderBy('name')->limit($limit)
                ->get(['department_id as id', 'code', 'name'])
                ->map(fn ($d) => [
                    'id' => $d->id,
                    'type' => 'department',
                    'module' => 'Core HCM',
                    'title' => $d->name,
                    'subtitle' => $d->code,
                    'url' => "/superadmin/dept-pos?tab=departments",
                ])->values();
        }

        // Positions
        $positions = Position::query()
            ->with('department:department_id,name')
            ->where(fn ($w) => $w->where('title', 'like', $like)->orWhere('position_code', 'like', $like))
            ->orderBy('title')->limit($limit)
            ->get(['position_id as id', 'position_code as code', 'title', 'department_id'])
            ->map(fn ($p) => [
                'id' => $p->id,
                'type' => 'position',
                'module' => 'Core HCM',
                'title' => $p->title,
                'subtitle' => trim(($p->code ?? '').' · '.($p->department->name ?? ''), ' ·'),
                'url' => "/superadmin/dept-pos?tab=positions",
            ])->values();

        // Combine all results with module grouping
        $allResults = collect()
            ->merge($employees)
            ->merge($applicants)
            ->merge($users)
            ->merge($jobs)
            ->merge($departments)
            ->merge($positions);

        // Group by module for frontend rendering
        $grouped = $allResults->groupBy('module')->map(function ($items, $module) {
            return [
                'module' => $module,
                'count' => $items->count(),
                'items' => $items->values(),
            ];
        })->values();

        return response()->json([
            'data' => [
                'results' => $grouped,
                'total' => $allResults->count(),
                'query' => $q,
            ],
        ]);
    }

    private function canViewEmployees(Request $request): bool
    {
        $user = $request->user();
        if (! $user) {
            return false;
        }
        if (method_exists($user, 'isSuperAdmin') && $user->isSuperAdmin()) {
            return true;
        }
        $levels = $user->permissions ?? collect();
        $rank = fn (?string $l) => match ($l) {
            'Full', 'Edit', 'Write', 'Approve / Reject Only' => 2,
            'View', 'Read' => 1,
            default => 0,
        };
        foreach (['Core HCM', 'Employee Records', 'Dashboard'] as $module) {
            $level = $levels->firstWhere('module_name', $module)?->permission_level ?? 'None';
            if ($rank($level) >= 1) {
                return true;
            }
        }
        return false;
    }

    private function canViewApplicants(Request $request): bool
    {
        $user = $request->user();
        if (! $user) {
            return false;
        }
        if (method_exists($user, 'isSuperAdmin') && $user->isSuperAdmin()) {
            return true;
        }
        $levels = $user->permissions ?? collect();
        $rank = fn (?string $l) => match ($l) {
            'Full', 'Edit', 'Write', 'Approve / Reject Only' => 2,
            'View', 'Read' => 1,
            default => 0,
        };
        foreach (['Applicant Management', 'Recruitment Management', 'Dashboard'] as $module) {
            $level = $levels->firstWhere('module_name', $module)?->permission_level ?? 'None';
            if ($rank($level) >= 1) {
                return true;
            }
        }
        return false;
    }

    private function canViewDepartments(Request $request): bool
    {
        $user = $request->user();
        if (! $user) {
            return false;
        }
        if (method_exists($user, 'isSuperAdmin') && $user->isSuperAdmin()) {
            return true;
        }
        $levels = $user->permissions ?? collect();
        $rank = fn (?string $l) => match ($l) {
            'Full', 'Edit', 'Write', 'Approve / Reject Only' => 2,
            'View', 'Read' => 1,
            default => 0,
        };
        foreach (['Core HCM', 'Employee Records', 'Dashboard'] as $module) {
            $level = $levels->firstWhere('module_name', $module)?->permission_level ?? 'None';
            if ($rank($level) >= 1) {
                return true;
            }
        }
        return false;
    }
}