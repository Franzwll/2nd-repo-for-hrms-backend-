<?php

use Illuminate\Database\QueryException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'permission' => \App\Http\Middleware\PermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json(['message' => 'Resource not found.'], 404);
            }
        });

        // Never leak SQL / connection details to clients (e.g. MySQL down,
        // `select * from cache ...`). Log the full error, show a generic message.
        $exceptions->render(function (QueryException $e, Request $request) {
            \Illuminate\Support\Facades\Log::error('Database error: '.$e->getMessage());
            if ($request->is('api/*')) {
                return response()->json(['message' => 'Service temporarily unavailable. Please try again later.'], 503);
            }
            if (config('app.debug')) {
                return response('Service temporarily unavailable. Please try again later.', 503);
            }
        });
        $exceptions->render(function (\PDOException $e, Request $request) {
            \Illuminate\Support\Facades\Log::error('Database connection error: '.$e->getMessage());
            if ($request->is('api/*')) {
                return response()->json(['message' => 'Service temporarily unavailable. Please try again later.'], 503);
            }
            if (config('app.debug')) {
                return response('Service temporarily unavailable. Please try again later.', 503);
            }
        });
    })->create();
