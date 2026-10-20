<?php

namespace Modules\EmployeeRecords\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\EmployeeDocument;
use App\Models\SystemUser;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Laravel\Sanctum\PersonalAccessToken;
use Modules\EmployeeRecords\Http\Resources\EmployeeDocumentResource;
use Modules\EmployeeRecords\Services\EmployeeDocumentCodeGenerator;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * Employee Records Management (ERM) — 201-file document repository.
 *
 * HR/staff upload, verify, replace and remove an employee's documents. This is
 * the HR-side document management that previously did not exist (the UI edited
 * documents in browser memory only). The ESS self-service upload and the
 * document-request fulfilment inbox stay separate.
 */
class EmployeeDocumentController extends Controller
{
    public function __construct(private readonly EmployeeDocumentCodeGenerator $codes) {}

    /* GET /api/v1/erm/employees/{employee}/documents */
    public function index(Employee $employee): JsonResponse
    {
        $documents = $employee->documents()
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'documents' => EmployeeDocumentResource::collection($documents)->resolve(),
        ]);
    }

    /* POST /api/v1/erm/employees/{employee}/documents (multipart or JSON) */
    public function store(Request $request, Employee $employee): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'category' => ['required', 'string', 'max:80'],
            'document_status' => ['nullable', Rule::in(['Pending Verification', 'Verified', 'Rejected'])],
            'document_date' => ['nullable', 'date'],
            'expiry_date' => ['nullable', 'date'],
            'file' => ['nullable', 'file', 'max:10240', 'mimes:pdf,png,jpg,jpeg,doc,docx'],
        ]);

        $payload = [
            'title' => $validated['title'],
            'category' => $validated['category'],
            'document_status' => $validated['document_status'] ?? ($request->hasFile('file') ? 'Pending Verification' : 'Submitted'),
            'document_date' => $validated['document_date'] ?? now()->toDateString(),
            'expiry_date' => $validated['expiry_date'] ?? null,
            'source_type' => 'manual_upload',
        ];

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $payload['file_path'] = $file->store('employee-documents', 'public');
            $payload['original_name'] = $file->getClientOriginalName();
            $payload['mime_type'] = $file->getClientMimeType() ?: 'application/octet-stream';
            $payload['file_size_bytes'] = $file->getSize() ?: 0;
        }

        $document = $this->codes->create($employee, $payload);
        $employee->forceFill(['employee_record_last_updated_at' => now()->toDateString()])->save();

        AuditLogger::log(
            'Employee document added',
            'Employee Records',
            'Info',
            'employee',
            $employee->employee_code,
            "Added '{$document->title}' to {$employee->full_name}'s 201 file.",
        );

        return response()->json([
            'message' => 'Document added to the 201 file.',
            'document' => new EmployeeDocumentResource($document),
        ], 201);
    }

    /* POST /api/v1/erm/employees/{employee}/documents/{document}/verify */
    public function verify(Request $request, Employee $employee, string $document): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['Verified', 'Rejected', 'Pending Verification'])],
            'note' => ['nullable', 'string', 'max:2000'],
        ]);

        $model = $employee->documents()->where('document_id', $document)->firstOrFail();
        $model->update([
            'document_status' => $validated['status'],
            'last_updated_at' => now(),
        ]);

        AuditLogger::log(
            'Employee document verified',
            'Employee Records',
            'Info',
            'employee',
            $employee->employee_code,
            "Marked '{$model->title}' as {$validated['status']} for {$employee->full_name}.",
        );

        return response()->json([
            'message' => 'Document status updated.',
            'document' => new EmployeeDocumentResource($model->fresh()),
        ]);
    }

    /* PUT /api/v1/erm/employees/{employee}/documents/{document} */
    public function update(Request $request, Employee $employee, string $document): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:200'],
            'category' => ['sometimes', 'required', 'string', 'max:80'],
            'document_status' => ['sometimes', Rule::in(['Pending Verification', 'Verified', 'Rejected', 'Submitted'])],
            'document_date' => ['sometimes', 'nullable', 'date'],
            'expiry_date' => ['sometimes', 'nullable', 'date'],
        ]);

        $model = $employee->documents()->where('document_id', $document)->firstOrFail();
        $validated['last_updated_at'] = now();
        $model->update($validated);
        $employee->forceFill(['employee_record_last_updated_at' => now()->toDateString()])->save();

        AuditLogger::log(
            'Employee document updated',
            'Employee Records',
            'Info',
            'employee',
            $employee->employee_code,
            "Updated '{$model->title}' on {$employee->full_name}'s 201 file.",
        );

        return response()->json([
            'message' => 'Document updated.',
            'document' => new EmployeeDocumentResource($model->fresh()),
        ]);
    }

    /* DELETE /api/v1/erm/employees/{employee}/documents/{document} */
    public function destroy(Employee $employee, string $document): JsonResponse
    {
        $model = $employee->documents()->where('document_id', $document)->firstOrFail();
        $model->delete(); // soft delete — retained for audit / retention

        AuditLogger::log(
            'Employee document removed',
            'Employee Records',
            'Warning',
            'employee',
            $employee->employee_code,
            "Removed '{$model->title}' from {$employee->full_name}'s 201 file.",
        );

        return response()->json(['message' => 'Document removed from the 201 file.']);
    }

    /* ------------------------------------------------------------------ */
    /* GET .../documents/{document}/file — streams inline for preview.     */
    /* Token auth (?token=) because iframe/anchors cannot set headers.     */
    /* ------------------------------------------------------------------ */
    public function file(Request $request, string $employee, string $document): BinaryFileResponse|JsonResponse
    {
        $user = $this->resolveTokenUser($request);
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (! $this->hasEmployeeRecordsView($user)) {
            return response()->json(['message' => 'Access denied.'], 403);
        }

        $model = EmployeeDocument::where('document_id', (int) $document)
            ->where('employee_id', (int) $employee)
            ->first();
        if (! $model) {
            return response()->json(['message' => 'Document not found.'], 404);
        }

        $relative = ltrim((string) $model->file_path, '/');
        if (str_starts_with($relative, 'storage/')) {
            $relative = substr($relative, strlen('storage/'));
        }
        if (! $relative || ! Storage::disk('public')->exists($relative)) {
            return response()->json(['message' => 'No file on record for this document.'], 404);
        }

        $path = Storage::disk('public')->path($relative);
        $name = $model->original_name ?: ($model->title . '.' . pathinfo($relative, PATHINFO_EXTENSION));
        $safeName = (string) preg_replace('/[\r\n"]+/', '_', (string) $name);

        return response()->file($path, [
            'Content-Type' => $model->mime_type ?: 'application/octet-stream',
            'Content-Disposition' => 'inline; filename="' . $safeName . '"',
        ]);
    }

    private function resolveTokenUser(Request $request): ?SystemUser
    {
        $token = $request->query('token') ?? $request->bearerToken();
        if (! $token) {
            return null;
        }

        $pat = PersonalAccessToken::findToken($token);
        if (! $pat || ! $pat->tokenable instanceof SystemUser) {
            return null;
        }

        return $pat->tokenable;
    }

    private function hasEmployeeRecordsView(SystemUser $user): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        $ranks = [
            'Full' => 3,
            'Edit' => 2,
            'Write' => 2,
            'Approve / Reject Only' => 2,
            'View' => 1,
            'Read' => 1,
            'None' => 0,
        ];

        $level = $user->permissions->firstWhere('module_name', 'Employee Records')?->permission_level ?? 'None';

        return ($ranks[$level] ?? 0) >= 1;
    }
}
