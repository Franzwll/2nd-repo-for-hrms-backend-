<?php

namespace Modules\EmployeeRecords\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\EmployeeDocument;
use App\Models\EssRequest;
use App\Models\EssRequestAttachment;
use App\Models\SystemUser;
use App\Services\Integration\Contracts\DocumentArchiveProvider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\PersonalAccessToken;
use Modules\EmployeeSelfService\Services\EssRequestWorkflow;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * Employee Records fulfilment inbox for ESS document requests.
 *
 * The employee files a request in ESS (category hr_document); it lands here.
 * Records staff attach the file the employee asked for and the request is
 * marked Completed — the employee is then notified and can download it.
 * This is the "return" half of the ESS <-> ERM document loop.
 */
class DocumentRequestController extends Controller
{
    /* GET /api/v1/erm/document-requests */
    public function index(Request $request): JsonResponse
    {
        $query = $this->documentRequests();

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('q')) {
            $search = $request->string('q');
            $query->where(function ($q) use ($search) {
                $q->where('request_code', 'LIKE', "%{$search}%")
                    ->orWhere('request_type', 'LIKE', "%{$search}%")
                    ->orWhere('details', 'LIKE', "%{$search}%")
                    ->orWhereHas('employee', function ($eq) use ($search) {
                        $eq->where('first_name', 'LIKE', "%{$search}%")
                            ->orWhere('last_name', 'LIKE', "%{$search}%")
                            ->orWhere('employee_code', 'LIKE', "%{$search}%");
                    });
            });
        }

        $requests = $query->orderByDesc('filed_at')->get();

        $counts = [
            'total' => $this->documentRequests()->count(),
            'pending' => $this->documentRequests()
                ->whereIn('status', ['For Fulfillment', 'Approved'])
                ->count(),
            'fulfilled' => $this->documentRequests()->where('status', 'Completed')->count(),
        ];

        return response()->json([
            'counts' => $counts,
            'requests' => $requests->map(fn ($r) => $this->transform($r)),
        ]);
    }

    /* GET /api/v1/erm/document-requests/{id} */
    public function show(string $id, DocumentArchiveProvider $archive): JsonResponse
    {
        $essRequest = $this->findRequest($id);

        if (! $essRequest) {
            return response()->json(['message' => 'Document request not found.'], 404);
        }

        $payload = $this->transform($essRequest);

        // Team 8 seam: archived documents HR can attach instead of uploading.
        $payload['archive_options'] = $archive->archivedDocumentsFor($essRequest->employee_id);

        return response()->json(['request' => $payload]);
    }

    /* POST /api/v1/erm/document-requests/{id}/fulfill (multipart) */
    public function fulfill(Request $request, string $id): JsonResponse
    {
        $essRequest = $this->findRequest($id);

        if (! $essRequest) {
            return response()->json(['message' => 'Document request not found.'], 404);
        }

        $validated = $request->validate([
            'file' => ['nullable', 'file', 'max:10240', 'mimes:pdf,png,jpg,jpeg,doc,docx', 'required_without:document_id'],
            'document_id' => ['nullable', 'integer', 'exists:employee_documents,document_id', 'required_without:file'],
            'note' => ['nullable', 'string', 'max:2000'],
        ]);

        $user = $request->user();
        $workflow = app(EssRequestWorkflow::class);

        if (! $workflow->requiresFulfillment($essRequest)) {
            return response()->json(['message' => 'This request does not require a document.'], 422);
        }

        if (! in_array($essRequest->status, ['For Fulfillment', 'Approved', 'Completed'], true)) {
            return response()->json([
                'message' => 'Approve the request before attaching the document.',
            ], 422);
        }

        // Resolve the file payload: either a fresh upload or a document pulled
        // from the employee's archive (Team 8 seam).
        if ($request->hasFile('file')) {
            $payload = $workflow->storeUpload($request->file('file'), 'ess-request-fulfillments');
        } else {
            $source = EmployeeDocument::where('document_id', $validated['document_id'])
                ->where('employee_id', $essRequest->employee_id)
                ->first();

            if (! $source) {
                return response()->json(['message' => 'The selected archived document does not belong to this employee.'], 422);
            }

            $payload = [
                'file_path' => $source->file_path,
                'original_name' => $source->original_name ?: $source->title,
                'mime_type' => $source->mime_type,
                'file_size_bytes' => $source->file_size_bytes,
            ];
        }

        try {
            $workflow->fulfill($essRequest, $user, $payload, $validated['note'] ?? null);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => "Request {$essRequest->request_code} fulfilled.",
            'request' => $this->transform($essRequest->fresh(['employee.department', 'category', 'assignedTo', 'attachments', 'statusHistory'])),
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* GET /api/v1/erm/document-requests/{id}/attachments/{attachmentId}/file
    /* Streams a fulfilment file inline for HR preview. Token auth (?token=) */
    /* because iframe/anchors cannot send an Authorization header.          */
    /* ------------------------------------------------------------------ */
    public function file(Request $request, string $id, string $attachmentId): BinaryFileResponse|JsonResponse
    {
        $user = $this->resolveTokenUser($request);
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (! $this->hasEmployeeRecordsView($user)) {
            return response()->json([
                'message' => 'Access denied: you do not have permission to view this document.',
            ], 403);
        }

        $essRequest = EssRequest::where('ess_request_id', (int) $id)
            ->orWhere('request_code', $id)
            ->first();
        if (! $essRequest) {
            return response()->json(['message' => 'Document request not found.'], 404);
        }

        $attachment = EssRequestAttachment::where('ess_request_attachment_id', (int) $attachmentId)
            ->where('ess_request_id', $essRequest->ess_request_id)
            ->first();
        if (! $attachment) {
            return response()->json(['message' => 'Attachment not found.'], 404);
        }

        $relative = ltrim((string) $attachment->file_path, '/');
        if (str_starts_with($relative, 'storage/')) {
            $relative = substr($relative, strlen('storage/'));
        }
        if (! $relative || ! Storage::disk('public')->exists($relative)) {
            return response()->json(['message' => 'No file on record for this attachment.'], 404);
        }

        $path = Storage::disk('public')->path($relative);
        $name = $attachment->original_name ?: basename($relative);
        $safeName = (string) preg_replace('/[\r\n"]+/', '_', (string) $name);

        return response()->file($path, [
            'Content-Type' => $attachment->mime_type ?: 'application/octet-stream',
            'Content-Disposition' => 'inline; filename="' . $safeName . '"',
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* Helpers                                                              */
    /* ------------------------------------------------------------------ */

    private function documentRequests()
    {
        return EssRequest::with(['employee.department', 'category', 'assignedTo', 'attachments', 'statusHistory'])
            ->where(function ($q) {
                $q->whereHas('category', function ($c) {
                    $c->whereIn('code', ['hr_document', 'ESS-HRDOC'])
                        ->orWhere('name', 'LIKE', '%Document%');
                })
                    ->orWhere('request_type', 'LIKE', '%document%')
                    ->orWhere('request_type', 'LIKE', '%certificate%')
                    ->orWhere('request_type', 'LIKE', '%COE%')
                    ->orWhere('request_type', 'LIKE', '%service record%')
                    ->orWhere('request_type', 'LIKE', '%employment%');
            });
    }

    private function findRequest(string $id): ?EssRequest
    {
        return EssRequest::with(['employee.department', 'category', 'assignedTo', 'attachments', 'statusHistory'])
            ->where('request_code', $id)
            ->orWhere('ess_request_id', $id)
            ->first();
    }

    private function transform(EssRequest $r): array
    {
        $hrAttachment = $r->attachments->firstWhere('direction', 'hr');

        return [
            'id' => $r->request_code,
            'db_id' => $r->ess_request_id,
            'employee' => $r->employee?->full_name ?? 'Unknown Employee',
            'employeeId' => $r->employee?->employee_code ?? 'EMP-0000',
            'employeeDbId' => $r->employee_id,
            'department' => $r->employee?->department?->name ?? 'General',
            'category' => $r->category?->name ?? 'HR Document',
            'category_code' => $r->category?->code ?? 'hr_document',
            'type' => $r->request_type,
            'filed' => $r->filed_at?->toDateString(),
            'status' => $r->status,
            'assignedTo' => $r->assignedTo?->full_name ?? ($r->status === 'Pending' ? 'Unassigned' : 'HR Admin'),
            'details' => $r->details,
            'note' => $r->review_note,
            'has_fulfillment' => (bool) $hrAttachment,
            'attachments' => $r->attachments->map(fn ($a) => [
                'id' => $a->ess_request_attachment_id,
                'direction' => $a->direction,
                'original_name' => $a->original_name,
                'mime_type' => $a->mime_type,
                'file_size_bytes' => $a->file_size_bytes,
                'has_file' => Storage::disk('public')->exists($a->file_path),
            ])->values(),
            'timeline' => $r->statusHistory->map(fn ($h) => [
                'status' => $h->status,
                'note' => $h->note,
                'at' => $h->created_at?->toIso8601String(),
            ])->values(),
        ];
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
