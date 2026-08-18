<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PermissionMiddleware
{
    public function handle(Request $request, Closure $next, string $module): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (! $user->hasModuleAccess($module)) {
            return response()->json([
                'message' => "Access denied: you do not have permission to access the {$module} module.",
            ], 403);
        }

        return $next($request);
    }
}