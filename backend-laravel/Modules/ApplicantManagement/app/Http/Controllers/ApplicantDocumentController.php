<?php

namespace Modules\ApplicantManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\SystemUser;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\PersonalAccessToken;
use Modules\ApplicantManagement\Http\Resources\ApplicantDocumentResource;
use Modules\ApplicantManagement\Models\Applicant;
use Modules\ApplicantManagement\Models\ApplicantDocument;
use Modules\ApplicantManagement\Services\DocumentVerificationService;

class ApplicantDocumentController extends Controller
{
    /* GET /api/v1/applicants/{applicant}/documents */
    public function index(Request $request, int $applicant): JsonResponse
    {
        $query = ApplicantDocument::where('applicant_id', $applicant)
            ->orderByDesc('uploaded_at');

        if ($docType = $request->query('doc_type')) {
            $query->where('doc_type', $docType);
        }

        $documents = $query->get();

        return response()->json([
            'data' => ApplicantDocumentResource::collection($documents),
            'meta' => [
                'current_page' => 1,
                'last_page'    => 1,
                'per_page'     => $documents->count(),
                'total'        => $documents->count(),
            ],
        ]);
    }

    /* POST /api/v1/applicants/{applicant}/documents (multipart)      */
    /* Stores a verification document (COE, Certificate, Credential,  */
    /* Others) used to verify the resume content.                     */
    public function store(Request $request, int $applicant): JsonResponse
    {
        $model = Applicant::findOrFail($applicant);

        $data = $request->validate([
            'doc_type'       => ['required', 'string', 'in:COE,Certificate,Credential,Others'],
            'title'          => ['nullable', 'string', 'max:190'],
            'original_copy'  => ['nullable', 'boolean'],
            'file'           => ['required', 'file', 'max:10240'],
        ]);

        $file = $request->file('file');
        $path = $file->store('applicant-documents', 'public');

        $document = ApplicantDocument::create([
            'applicant_id'  => $applicant,
            'doc_type'      => $data['doc_type'],
            'title'         => $data['title'] ?? null,
            'original_copy' => $request->boolean('original_copy'),
            'file_path'     => $path,
            'original_name' => $file->getClientOriginalName(),
        ]);

        AuditLogger::log(
            action: 'Verification Document Uploaded',
            module: 'Applicant Management',
            severity: 'Info',
            targetType: 'Applicant Document',
            targetId: (string) $document->applicant_document_id,
            details: "Uploaded {$document->doc_type} verification document for {$model->name}" .
                ($document->original_copy ? ' (original copy).' : '.')
        );

        // Automatic verification against the applicant's resume claims
        // (matches how screening auto-runs on resume upload). Documents
        // without a completed screening stay at PENDING.
        $document = app(DocumentVerificationService::class)->verifyDocument($document);

        return response()->json(new ApplicantDocumentResource($document), 201);
    }

    /* POST /api/v1/applicant-documents/{applicantDocument}/verify */
    /* Manual re-verification (e.g. after the resume was re-screened).      */
    public function verify(int $applicantDocument): JsonResponse
    {
        $document = ApplicantDocument::findOrFail($applicantDocument);

        $document = app(DocumentVerificationService::class)->verifyDocument($document);

        return response()->json(new ApplicantDocumentResource($document));
    }

    /* DELETE /api/v1/applicant-documents/{applicantDocument} */
    public function destroy(int $applicantDocument): JsonResponse
    {
        $model = ApplicantDocument::findOrFail($applicantDocument);
        $applicant = $model->applicant;

        if ($model->file_path && Storage::disk('public')->exists($model->file_path)) {
            Storage::disk('public')->delete($model->file_path);
        }

        $model->delete();

        // Removing a document changes the evidence set behind the resume
        // claims: refresh the ranking so the percentage/status no longer
        // reflect the deleted proof.
        app(DocumentVerificationService::class)->refreshRanking($applicant, 'document removal');

        return response()->json(['message' => 'Verification document deleted successfully.']);
    }

    /* ------------------------------------------------------------------ */
    /* GET /api/v1/applicant-documents/{applicantDocument}/file            */
    /* Streams the stored supporting-document file inline for preview      */
    /* (or as an attachment with ?download=1). Mirrors the resume preview  */
    /* endpoint: <iframe>/<a> requests cannot send an Authorization        */
    /* header, so this authenticates from the ?token= query param (Bearer  */
    /* header accepted as a fallback) instead of relying on the            */
    /* auth:sanctum middleware. Permission is enforced here.               */
    /* ------------------------------------------------------------------ */

    public function file(Request $request, int $applicantDocument): \Symfony\Component\HttpFoundation\BinaryFileResponse|JsonResponse
    {
        $user = $this->resolveTokenUser($request);

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (! $this->hasApplicantManagementView($user)) {
            return response()->json([
                'message' => 'Access denied: you do not have permission to view this document.',
            ], 403);
        }

        $model = ApplicantDocument::findOrFail($applicantDocument);

        if (! $model->file_path || ! Storage::disk('public')->exists($model->file_path)) {
            return response()->json(['message' => 'No file found for this document.'], 404);
        }

        $disk = Storage::disk('public');
        $path = $disk->path($model->file_path);
        $name = $model->original_name ?: basename($model->file_path);

        $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
        $mimeMap = [
            'pdf'  => 'application/pdf',
            'png'  => 'image/png',
            'jpg'  => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'gif'  => 'image/gif',
            'webp' => 'image/webp',
            'bmp'  => 'image/bmp',
            'doc'  => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        $mime = $mimeMap[$ext]
            ?? (function_exists('mime_content_type') ? @mime_content_type($path) : null)
            ?? 'application/octet-stream';

        $disposition = $request->boolean('download') ? 'attachment' : 'inline';

        // Keep the filename header-safe (see resumeDocument): quotes / line
        // breaks in the original name must not break Content-Disposition and
        // flip an inline preview into a forced download.
        $safeName = (string) preg_replace('/[\r\n"]+/', '_', (string) $name);

        return response()->file($path, [
            'Content-Type'        => $mime,
            'Content-Disposition' => $disposition . '; filename="' . $safeName . '"; filename*=UTF-8\'\'' . rawurlencode((string) $name),
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* Token-based authentication for direct browser previews              */
    /* (mirrors ApplicantManagementController@resumeDocument)              */
    /* ------------------------------------------------------------------ */

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

    private function hasApplicantManagementView(SystemUser $user): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        $ranks = [
            'Full'                  => 3,
            'Edit'                 => 2,
            'Write'                 => 2,
            'Approve / Reject Only' => 2,
            'View'                  => 1,
            'Read'                  => 1,
            'None'                  => 0,
        ];

        $level = $user->permissions->firstWhere('module_name', 'Applicant Management')?->permission_level ?? 'None';

        return ($ranks[$level] ?? 0) >= 1;
    }
}
