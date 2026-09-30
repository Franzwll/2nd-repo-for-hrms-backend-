<?php

namespace Modules\Settings\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Settings\Services\BackupService;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class BackupController extends Controller
{
    /* ------------------------------------------------------------------ */
    /* GET /api/v1/settings/backups                                        */
    /* List all recorded backup entries.                                   */
    /* ------------------------------------------------------------------ */

    public function index(): JsonResponse
    {
        return response()->json(['data' => BackupService::entries()]);
    }

    /* ------------------------------------------------------------------ */
    /* POST /api/v1/settings/backups                                       */
    /* Create a real database backup (dump + entry persisted in settings). */
    /* ------------------------------------------------------------------ */

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'type' => ['nullable', 'string', 'in:Manual,Automatic'],
        ]);

        try {
            $entry = BackupService::create($data['type'] ?? 'Manual');
        } catch (\Throwable $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 500);
        }

        AuditLogger::log(
            "Backup {$entry['id']} created ({$entry['type']})",
            'Settings',
            'Info',
            'backup',
            $entry['id'],
            "Backup {$entry['id']} ({$entry['size']}) created successfully.",
        );

        return response()->json([
            'message' => "Backup {$entry['id']} created successfully.",
            'backup'  => $entry,
            'data'    => BackupService::entries(),
        ], 201);
    }

    /* ------------------------------------------------------------------ */
    /* GET /api/v1/settings/backups/{id}/download                          */
    /* Download the .sql dump file.                                        */
    /* ------------------------------------------------------------------ */

    public function download(string $id): BinaryFileResponse|JsonResponse
    {
        $entry = BackupService::findEntry($id);

        if (! $entry) {
            return response()->json(['message' => "Backup '{$id}' was not found."], 404);
        }

        $path = BackupService::directory() . DIRECTORY_SEPARATOR . ($entry['filename'] ?? '');

        if (! is_file($path)) {
            return response()->json(['message' => 'Backup file is missing on the server.'], 404);
        }

        AuditLogger::log(
            "Backup {$entry['id']} downloaded",
            'Settings',
            'Info',
            'backup',
            $entry['id'],
            "Backup file {$entry['id']}.sql downloaded.",
        );

        return response()->download(
            $path,
            ($entry['id'] ?? $id) . '.sql',
            ['Content-Type' => 'application/octet-stream'],
        );
    }

    /* ------------------------------------------------------------------ */
    /* POST /api/v1/settings/backups/{id}/restore                          */
    /* Roll the database back to the selected snapshot.                    */
    /* ------------------------------------------------------------------ */

    public function restore(string $id): JsonResponse
    {
        try {
            $statements = BackupService::restore($id);
        } catch (\Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }

        // Logged AFTER the restore: the replayed dump may overwrite the
        // audit_logs table with the snapshot, which would wipe a pre-restore
        // entry. A post-restore entry survives and proves the rollback.
        AuditLogger::log(
            "System restored from {$id}",
            'Settings',
            'Critical',
            'backup',
            $id,
            "System restored from {$id}. Executed {$statements} statement(s). Changes made after this backup were lost.",
        );

        return response()->json([
            'message'    => "System restored from {$id}. Executed {$statements} statement(s).",
            'data'       => BackupService::entries(),
        ]);
    }
}
