<?php

namespace Modules\AuditLog\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\AuditLog\Http\Resources\AuditLogResource;

class AuditLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'q' => ['nullable', 'string', 'max:255'],
            'module' => ['nullable', 'string', 'max:255'],
            'actions' => ['nullable', 'string', 'max:1000'],
            'severity' => ['nullable', 'in:Info,Warning,Critical'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
            'per_page' => ['nullable', 'integer', 'min:1'],
            'sort' => ['nullable', 'in:occurred_at,action,module_name,severity'],
            'direction' => ['nullable', 'in:asc,desc'],
        ]);

        if (! empty($data['from']) && ! empty($data['to']) && strtotime($data['to']) < strtotime($data['from'])) {
            return response()->json([
                'message' => 'The end date must be after or equal to the start date.',
                'errors' => ['to' => ['The end date must be after or equal to the start date.']],
            ], 422);
        }

        $query = AuditLog::query()->with('user');

        if (! empty($data['module'])) {
            $modules = array_values(array_filter(array_map('trim', explode(',', $data['module']))));

            if (in_array('Applicant Management', $modules, true)) {
                $modules = array_unique(array_merge($modules, [
                    'Applicant Management',
                    'Screening',
                    'Interview Scheduling',
                    'Assessment',
                    'Resume Screening',
                ]));
            }

            if (in_array('Core HCM', $modules, true)) {
                $modules = array_unique(array_merge($modules, [
                    'Core HCM',
                    'Department',
                    'Position',
                    'Salary Grade',
                    'Recommendation',
                ]));
            }

            if (count($modules) === 1) {
                $query->where('module_name', reset($modules));
            } elseif ($modules !== []) {
                $query->whereIn('module_name', $modules);
            }
        }

        if (! empty($data['actions'])) {
            $actions = array_values(array_filter(array_map('trim', explode(',', $data['actions']))));
            if ($actions !== []) {
                $query->whereIn('action', $actions);
            }
        }

        if (! empty($data['severity'])) {
            $query->where('severity', $data['severity']);
        }

        if (! empty($data['from'])) {
            $query->whereDate('occurred_at', '>=', $data['from']);
        }

        if (! empty($data['to'])) {
            $query->whereDate('occurred_at', '<=', $data['to']);
        }

        if (! empty($data['q'])) {
            $search = $data['q'];

            $query->where(function ($q) use ($search) {
                $q->where('action', 'like', "%{$search}%")
                    ->orWhere('details', 'like', "%{$search}%")
                    ->orWhere('module_name', 'like', "%{$search}%")
                    ->orWhere('actor_role', 'like', "%{$search}%")
                    ->orWhere('actor_department', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($u) => $u->where('full_name', 'like', "%{$search}%"));
            });
        }

        $logs = $query
            ->orderBy($data['sort'] ?? 'occurred_at', $data['direction'] ?? 'desc')
            ->paginate(min(max((int) ($data['per_page'] ?? 25), 1), 100));

        return response()->json([
            'data' => AuditLogResource::collection($logs),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
            ],
        ]);
    }

    public function show(AuditLog $audit_log): JsonResponse
    {
        return response()->json([
            'data' => new AuditLogResource($audit_log),
        ]);
    }

    public function stats(): JsonResponse
    {
        $latest = AuditLog::with('user')->latest('occurred_at')->first();

        return response()->json([
            'data' => [
                'total' => AuditLog::count(),
                'by_severity' => AuditLog::selectRaw('severity, COUNT(*) as count')
                    ->groupBy('severity')
                    ->pluck('count', 'severity'),
                'by_module' => AuditLog::selectRaw('module_name, COUNT(*) as count')
                    ->groupBy('module_name')
                    ->orderByDesc('count')
                    ->limit(10)
                    ->pluck('count', 'module_name'),
                'modules' => AuditLog::query()
                    ->distinct()
                    ->orderBy('module_name')
                    ->pluck('module_name'),
                'unique_actors' => AuditLog::query()
                    ->whereNotNull('system_user_id')
                    ->distinct()
                    ->count('system_user_id'),
                'latest' => $latest ? new AuditLogResource($latest) : null,
            ],
        ]);
    }
}