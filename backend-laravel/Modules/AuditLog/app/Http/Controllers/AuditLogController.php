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
        $user = $request->user();

        if ($request->filled('module')) {
            $module = $request->string('module')->value();
            if (! $user || (! $user->hasModuleAccess('Audit Logs') && ! $user->hasModuleAccess($module))) {
                return response()->json([
                    'message' => "Access denied: you do not have permission to view audit logs for the {$module} module.",
                ], 403);
            }
        } else {
            if (! $user || ! $user->hasModuleAccess('Audit Logs')) {
                return response()->json([
                    'message' => 'Access denied: you do not have permission to access the Audit Logs module.',
                ], 403);
            }
        }

        $query = AuditLog::query()->with('user');

        if ($request->filled('module')) {
            $rawModule = $request->string('module')->value();
            $modules = array_filter(array_map('trim', explode(',', $rawModule)));

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
            } else {
                $query->whereIn('module_name', $modules);
            }
        }

        if ($request->filled('severity')) {
            $query->where('severity', $request->string('severity'));
        }

        if ($request->filled('from')) {
            $query->whereDate('occurred_at', '>=', $request->string('from'));
        }

        if ($request->filled('to')) {
            $query->whereDate('occurred_at', '<=', $request->string('to'));
        }

        if ($request->filled('q')) {
            $search = $request->string('q');

            $query->where(function ($q) use ($search) {
                $q->where('action', 'like', "%{$search}%")
                    ->orWhere('details', 'like', "%{$search}%")
                    ->orWhere('module_name', 'like', "%{$search}%")
                    ->orWhere('actor_role', 'like', "%{$search}%")
                    ->orWhere('actor_department', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($u) => $u->where('full_name', 'like', "%{$search}%"));
            });
        }

        $logs = $query->orderByDesc('occurred_at')
            ->paginate($request->integer('per_page', 25));

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
                'latest' => new AuditLogResource(AuditLog::with('user')->latest('occurred_at')->first()),
            ],
        ]);
    }
}