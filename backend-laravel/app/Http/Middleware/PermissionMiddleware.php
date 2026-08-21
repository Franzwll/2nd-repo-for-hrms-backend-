<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PermissionMiddleware
{
    private const LEVEL_RANK = [
        'Full' => 3,
        'Edit' => 2,
        'Write' => 2,
        'Approve / Reject Only' => 2,
        'View' => 1,
        'Read' => 1,
        'None' => 0,
    ];

    public function handle(Request $request, Closure $next, string $module, string $requiredLevel = 'View'): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Laravel splits middleware params on the first colon, then by comma.
        // Routes written as "permission:User Management:Full" arrive here with
        // $module = "User Management:Full". Normalize that into module + level.
        if (str_contains($module, ':')) {
            [$module, $requiredLevel] = explode(':', $module, 2);
        }

        // Super Admin (role_id = 1) bypasses all permission checks
        if ((int) $user->role_id === 1) {
            return $next($request);
        }

        $level = $user->permissions->firstWhere('module_name', $module)?->permission_level ?? 'None';

        if (self::rank($level) < self::rank($requiredLevel)) {
            return response()->json([
                'message' => "Access denied: you do not have permission to access the {$module} module.",
            ], 403);
        }

        return $next($request);
    }

    private static function rank(string $level): int
    {
        return self::LEVEL_RANK[$level] ?? 0;
    }
}