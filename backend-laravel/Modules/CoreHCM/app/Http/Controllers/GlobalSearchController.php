<?php

namespace Modules\CoreHCM\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Employee;
use App\Models\JobPost;
use App\Models\Position;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Unified non-confidential site search.
 *
 * Groups: departments, positions, open job posts, status taxonomy.
 * Employees are minimal (name/code/department/position/status) and only
 * included when the viewer can access Core HCM / Employee Records.
 * Never returns SSS/PhilHealth/Pag-IBIG/TIN, salary, contacts, documents.
 */
class GlobalSearchController extends Controller
{
    private const STATUSES = [
        ['group' => 'Employment type', 'value' => 'Regular'],
        ['group' => 'Employment type', 'value' => 'Probationary'],
        ['group' => 'Employment type', 'value' => 'Contractual'],
        ['group' => 'Employee status', 'value' => 'Active'],
        ['group' => 'Employee status', 'value' => 'On Leave'],
        ['group' => 'Employee status', 'value' => 'Resigned'],
        ['group' => 'Employee status', 'value' => 'Terminated'],
        ['group' => 'Job post status', 'value' => 'Open'],
        ['group' => 'Job post status', 'value' => 'Closed'],
        ['group' => 'Job post status', 'value' => 'Draft'],
        ['group' => 'Applicant stage', 'value' => 'Screened'],
        ['group' => 'Applicant stage', 'value' => 'Interview Scheduled'],
        ['group' => 'Applicant stage', 'value' => 'Assessed'],
        ['group' => 'Applicant stage', 'value' => 'Offer'],
        ['group' => 'Applicant stage', 'value' => 'Hired'],
        ['group' => 'Applicant stage', 'value' => 'Rejected'],
    ];

    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => ['required', 'string', 'min:2', 'max:100'],
            'limit' => ['sometimes', 'integer', 'min:1', 'max:10'],
        ]);
        $q = trim($validated['q']);
        $limit = (int) ($validated['limit'] ?? 6);
        $like = "%{$q}%";

        $departments = Department::query()
            ->where(fn ($w) => $w->where('name', 'like', $like)->orWhere('code', 'like', $like))
            ->orderBy('name')->limit($limit)
            ->get(['department_id as id', 'code', 'name'])
            ->map(fn ($d) => [
                'id' => $d->id,
                'title' => $d->name,
                'subtitle' => $d->code,
                'href' => null,
            ])->values();

        $positions = Position::query()
            ->with('department:department_id,name')
            ->where(fn ($w) => $w->where('title', 'like', $like)->orWhere('position_code', 'like', $like))
            ->orderBy('title')->limit($limit)
            ->get(['position_id as id', 'position_code as code', 'title', 'department_id'])
            ->map(fn ($p) => [
                'id' => $p->id,
                'title' => $p->title,
                'subtitle' => trim(($p->code ?? '').' · '.($p->department->name ?? ''), ' ·'),
                'href' => null,
            ])->values();

        $jobs = JobPost::query()
            ->with('department:department_id,name')
            ->whereIn('status', ['published', 'Open'])->where('active', 1)
            ->where(fn ($w) => $w->where('title', 'like', $like)->orWhere('summary', 'like', $like))
            ->orderByDesc('posted_date')->limit($limit)
            ->get(['job_post_id as id', 'title', 'employment_type', 'department_id'])
            ->map(fn ($j) => [
                'id' => $j->id,
                'title' => $j->title,
                'subtitle' => trim(($j->department->name ?? '').' · '.($j->employment_type ?? ''), ' ·'),
                'href' => null,
            ])->values();

        $statuses = collect(self::STATUSES)
            ->filter(fn ($s) => stripos($s['value'], $q) !== false || stripos($s['group'], $q) !== false)
            ->take($limit)
            ->map(fn ($s) => ['title' => $s['value'], 'subtitle' => $s['group']])
            ->values();

        $employees = [];
        if ($this->canViewEmployees($request)) {
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
                    'title' => trim($e->first_name.' '.$e->last_name).' ('.$e->code.')',
                    'subtitle' => trim(($e->department->name ?? '').' · '.($e->position->title ?? '').' · '.($e->status ?? ''), ' ·'),
                    'href' => null,
                ])->values();
        }

        return response()->json([
            'data' => [
                'departments' => $departments,
                'positions' => $positions,
                'jobs' => $jobs,
                'statuses' => $statuses,
                'employees' => $employees,
                'employees_hidden' => empty($employees) && ! $this->canViewEmployees($request),
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
}
