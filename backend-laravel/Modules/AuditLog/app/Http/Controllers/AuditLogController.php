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
        $query = AuditLog::query()->with('user');

        if ($request->filled('module')) {
            $query->where('module_name', $request->string('module'));
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