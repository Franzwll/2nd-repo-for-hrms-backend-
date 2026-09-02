<?php

namespace Modules\ApplicantManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Mail\ApplicantAcceptedMail;
use App\Mail\ApplicantRejectedMail;
use App\Mail\OfferNewJobMail;
use App\Models\SystemUser;
use App\Services\AuditLogger;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\PersonalAccessToken;
use Modules\ApplicantManagement\Http\Requests\StoreApplicantRequest;
use Modules\ApplicantManagement\Http\Requests\UpdateApplicantRequest;
use Modules\ApplicantManagement\Http\Resources\ApplicantResource;
use Modules\ApplicantManagement\Models\Applicant;
use Modules\ApplicantManagement\Services\ScreeningService;
use App\Services\NlpService;

class ApplicantManagementController extends Controller
{
    public function __construct(
        protected ScreeningService $screening,
        protected NlpService $nlp
    ) {
    }

    /* ------------------------------------------------------------------ */
    /* GET /api/v1/applicants                                               */
    /* ------------------------------------------------------------------ */

    public function index(Request $request): JsonResponse
    {
        $query = Applicant::with(['jobPost.department', 'screeningEntities', 'screeningScores', 'latestScreening'])
            ->orderByDesc('applied_at');

        // Search by name or email
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('applicant_code', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        // Filter by stage
        if ($stage = $request->query('stage')) {
            $query->where('stage', $stage);
        }

        // Filter by job post
        if ($jobPostId = $request->query('job_post_id')) {
            $query->where('job_post_id', $jobPostId);
        }

        // Filter by source
        if ($source = $request->query('source')) {
            $query->where('source', $source);
        }

        // Exclude stages from the active pipeline (e.g. Hired, Rejected)
        if ($excludeStages = $request->query('exclude_stages')) {
            $excluded = array_filter(array_map('trim', explode(',', $excludeStages)));
            if ($excluded) {
                $query->whereNotIn('stage', $excluded);
            }
        }

        $perPage = (int) $request->query('per_page', 15);
        $paginated = $query->paginate($perPage);

        return response()->json([
            'data' => ApplicantResource::collection($paginated->items()),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'per_page'     => $paginated->perPage(),
                'total'        => $paginated->total(),
            ],
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* POST /api/v1/applicants                                              */
    /* ------------------------------------------------------------------ */

    public function store(StoreApplicantRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Handle resume upload
        if ($request->hasFile('resume')) {
            $path = $request->file('resume')->store('resumes', 'public');
            $data['resume_file_path'] = $path;
            $data['resume_original_name'] = $request->file('resume')->getClientOriginalName();
        }
        unset($data['resume']);

        $data['applicant_code'] = Applicant::generateCode();

        $applicant = Applicant::create($data);

        // Run spaCy NLP screening when a resume is present. A precomputed
        // payload from the wizard's preview run avoids a second NLP call.
        $precomputed = null;
        if ($request->filled('screening_payload')) {
            $decoded = json_decode((string) $request->input('screening_payload'), true);
            if (is_array($decoded)) {
                $precomputed = $decoded;
            }
        }
        if ($applicant->resume_file_path) {
            $screeningRecord = $this->screening->screenAndPersist($applicant, $precomputed);
            $applicant->refresh();

            AuditLogger::log(
                action: 'Applicant Screened',
                module: 'Applicant Management',
                severity: ($screeningRecord?->processing_status ?? '') === 'FAILED' ? 'Warning' : 'Info',
                targetType: 'Applicant',
                targetId: (string) $applicant->applicant_id,
                details: sprintf(
                    'spaCy screening for %s: %s (%s%%), processing status %s.',
                    $applicant->name,
                    ScreeningService::OFFICIAL_LABELS[$applicant->status] ?? $applicant->status,
                    $applicant->fit_score ?? 'n/a',
                    $screeningRecord?->processing_status ?? 'SKIPPED'
                )
            );
        }

        AuditLogger::log(
            action: 'Applicant Created',
            module: 'Applicant Management',
            severity: 'Info',
            targetType: 'Applicant',
            targetId: (string) $applicant->applicant_id,
            details: "Added new applicant {$applicant->name} for position ID {$applicant->job_post_id}."
        );

        NotificationService::send(
            title: "New applicant: {$applicant->name}",
            body: "Submitted application with screening score " . ($applicant->fit_score ?? 0) . "%.",
            module: 'Applicant Management',
            type: 'info',
            targetType: 'Applicant',
            targetId: (string) $applicant->applicant_id
        );

        return response()->json(
            new ApplicantResource($applicant->load(['jobPost.department'])),
            201
        );
    }

    /* ------------------------------------------------------------------ */
    /* GET /api/v1/applicants/{applicant}                                  */
    /* ------------------------------------------------------------------ */

    public function show(int $applicant): JsonResponse
    {
        $model = Applicant::with([
            'jobPost.department',
            'screeningEntities',
            'screeningScores',
            'interviews',
            'assessment',
            'latestScreening',
        ])->findOrFail($applicant);

        return response()->json(new ApplicantResource($model));
    }

    /* ------------------------------------------------------------------ */
    /* GET /api/v1/applicants/{applicant}/screening                        */
    /* Latest full screening detail (profile, breakdown, reasons, alt job)  */
    /* ------------------------------------------------------------------ */

    public function screeningDetail(int $applicant): JsonResponse
    {
        $model = Applicant::findOrFail($applicant);
        $screening = $model->screenings()->latest('screening_id')->first();

        if (! $screening) {
            return response()->json(['message' => 'No screening record found for this applicant.'], 404);
        }

        return response()->json(['data' => $screening]);
    }

    /* ------------------------------------------------------------------ */
    /* GET /api/v1/applicants/{applicant}/resume-document                   */
    /* Streams the stored resume inline for the review dialog's preview.   */
    /* Used instead of the public /storage URL because that URL is         */
    /* cross-origin (different host/port) in development, which browsers    */
    /* refuse to render inside an <iframe>/<img> — the review preview      */
    /* showed a blank white panel. This endpoint goes through the /api    */
    /* proxy so the preview is same-origin, and authenticates from the     */
    /* ?token= query param (iframe requests cannot send headers).          */
    /* ------------------------------------------------------------------ */

    public function resumeDocument(Request $request, int $applicant): \Symfony\Component\HttpFoundation\BinaryFileResponse|JsonResponse
    {
        // Resume files are previewed inside a browser <iframe>/<img>, which
        // cannot send an Authorization header, so authenticate directly from
        // the ?token= query param (Bearer header accepted as a fallback)
        // instead of relying on the auth:sanctum middleware. Permission is
        // also enforced here.
        $user = $this->resolveTokenUser($request);

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (! $this->hasApplicantManagementView($user)) {
            return response()->json([
                'message' => 'Access denied: you do not have permission to view this resume.',
            ], 403);
        }

        $model = Applicant::findOrFail($applicant);

        if (! $model->resume_file_path || ! Storage::disk('public')->exists($model->resume_file_path)) {
            return response()->json(['message' => 'No resume file found for this applicant.'], 404);
        }

        $disk = Storage::disk('public');
        $path = $disk->path($model->resume_file_path);
        $name = $model->resume_original_name ?: basename($model->resume_file_path);

        // Serve inline (not as an attachment) so the browser renders PDFs and
        // images inside the review dialog's <iframe>/<img> instead of forcing
        // a download. Unknown extensions fall back to octet-stream, which the
        // frontend routes to its "open file" fallback.
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

        return response()->file($path, [
            'Content-Type'        => $mime,
            'Content-Disposition' => 'inline; filename="' . $name . '"',
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* Token-based authentication for direct browser previews              */
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

    /* ------------------------------------------------------------------ */
    /* POST /api/v1/applicants/screen-resume                               */
    /* Preview screening for the Add Applicant wizard (no applicant row).   */
    /* ------------------------------------------------------------------ */

    public function screenResume(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'resume' => ['required', 'file', 'max:20480'],
            'job_post_id' => ['required', 'integer', 'exists:job_posts,job_post_id'],
        ]);

        $storedPath = $request->file('resume')->store('resumes-tmp', 'local');
        try {
            $result = $this->screening->screenPreviewFile(
                $storedPath,
                $request->file('resume')->getClientOriginalName() ?: 'resume',
                (int) $validated['job_post_id']
            );
        } finally {
            if (Storage::disk('local')->exists($storedPath)) {
                Storage::disk('local')->delete($storedPath);
            }
        }

        AuditLogger::log(
            action: 'Resume Screening Preview',
            module: 'Applicant Management',
            severity: ($result['success'] ?? false) ? 'Info' : 'Warning',
            targetType: 'Job Post',
            targetId: (string) $validated['job_post_id'],
            details: ($result['success'] ?? false)
                ? "Preview screening scored {$result['match_score']}% with status {$result['screening_status']}."
                : 'Preview screening failed: ' . mb_substr((string) ($result['error'] ?? 'unknown'), 0, 300)
        );

        return response()->json($result, ($result['success'] ?? false) ? 200 : 502);
    }

    /* ------------------------------------------------------------------ */
    /* POST /api/v1/applicants/extract-resume                              */
    /* Lightweight NLP pass (text extraction + profile only) used by the   */
    /* Add Applicant wizard to auto-fill empty contact fields.             */
    /* ------------------------------------------------------------------ */

    public function extractResume(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'resume' => ['required', 'file', 'max:20480'],
        ]);

        $originalName = $request->file('resume')->getClientOriginalName() ?: 'resume';
        $storedPath = $request->file('resume')->store('resumes-tmp', 'local');
        try {
            $fullPath = Storage::disk('local')->path($storedPath);
            $result = $this->nlp->extractResume($fullPath, $originalName);
        } finally {
            if (Storage::disk('local')->exists($storedPath)) {
                Storage::disk('local')->delete($storedPath);
            }
        }

        if (! ($result['ok'] ?? false)) {
            return response()->json([
                'success' => false,
                'error_message' => $result['error'] ?? 'Resume extraction failed.',
            ], 502);
        }

        $data = $result['data'] ?? [];
        $personal = $data['profile']['personal_information'] ?? [];

        return response()->json([
            'success' => true,
            'processing_status' => $data['processing_status'] ?? null,
            'personal_information' => [
                'name' => $personal['name'] ?? null,
                'email' => $personal['email'] ?? null,
                'phone' => $personal['phone'] ?? null,
                'address' => $personal['address'] ?? null,
            ],
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* PUT /api/v1/applicants/{applicant}                                  */
    /* ------------------------------------------------------------------ */

    public function update(UpdateApplicantRequest $request, int $applicant): JsonResponse
    {
        $model = Applicant::with(['jobPost'])->findOrFail($applicant);
        $data  = $request->validated();
        $oldStage = $model->stage;
        $oldJobPostId = $model->job_post_id;

        // Handle resume replacement
        if ($request->hasFile('resume')) {
            // Delete old file if it exists
            if ($model->resume_file_path && Storage::disk('public')->exists($model->resume_file_path)) {
                Storage::disk('public')->delete($model->resume_file_path);
            }
            $data['resume_file_path'] = $request->file('resume')->store('resumes', 'public');
            $data['resume_original_name'] = $request->file('resume')->getClientOriginalName();
        }
        unset($data['resume']);

        $model->update($data);
        $model->refresh()->load(['jobPost.department', 'screeningEntities', 'screeningScores', 'interviews', 'assessment']);

        // Re-screen automatically when the resume was replaced.
        if (isset($data['resume_file_path']) && $model->job_post_id) {
            $precomputed = null;
            if ($request->filled('screening_payload')) {
                $decoded = json_decode((string) $request->input('screening_payload'), true);
                if (is_array($decoded)) {
                    $precomputed = $decoded;
                }
            }
            $this->screening->screenAndPersist($model, $precomputed);
            $model->refresh();
        }

        $positionTitle = $model->jobPost?->title ?? 'Position';

        // Stage change triggers
        if (isset($data['stage']) && $data['stage'] !== $oldStage) {
            $newStage = $data['stage'];

            AuditLogger::log(
                action: "Applicant Stage Changed to {$newStage}",
                module: 'Applicant Management',
                severity: $newStage === 'Rejected' ? 'Warning' : 'Info',
                targetType: 'Applicant',
                targetId: (string) $model->applicant_id,
                details: "Stage changed from {$oldStage} to {$newStage} for {$model->name} ({$positionTitle})."
            );

            NotificationService::send(
                title: "Applicant {$model->name}: {$newStage}",
                body: "Stage updated from {$oldStage} to {$newStage} for {$positionTitle}.",
                module: 'Applicant Management',
                type: $newStage === 'Rejected' ? 'warning' : 'info',
                targetType: 'Applicant',
                targetId: (string) $model->applicant_id
            );

            // Send Emails based on stage change
            if ($model->email) {
                try {
                    if ($newStage === 'Accepted' || $newStage === 'Interview Scheduled') {
                        $latestInterview = $model->interviews()->latest('scheduled_date')->first();
                        Mail::to($model->email)->send(new ApplicantAcceptedMail(
                            recipientEmail: $model->email,
                            applicantName: $model->name,
                            position: $positionTitle,
                            interviewDate: $latestInterview?->scheduled_date,
                            interviewTime: $latestInterview?->scheduled_time,
                            interviewMode: $latestInterview?->mode
                        ));
                    } elseif ($newStage === 'Rejected') {
                        Mail::to($model->email)->send(new ApplicantRejectedMail(
                            recipientEmail: $model->email,
                            applicantName: $model->name,
                            position: $positionTitle
                        ));
                    } elseif ($newStage === 'Offer') {
                        Mail::to($model->email)->send(new OfferNewJobMail(
                            recipientEmail: $model->email,
                            applicantName: $model->name,
                            offeredPosition: $positionTitle,
                            details: "Official job offer for {$positionTitle} at Oxford Suites Makati."
                        ));
                    }
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::warning("Failed to send stage email to {$model->email}: " . $e->getMessage());
                }
            }
        }

        // Job referral / offer trigger
        if (isset($data['job_post_id']) && $data['job_post_id'] !== $oldJobPostId) {
            AuditLogger::log(
                action: "Applicant Referred to New Position",
                module: 'Applicant Management',
                severity: 'Info',
                targetType: 'Applicant',
                targetId: (string) $model->applicant_id,
                details: "Referred {$model->name} to new position {$positionTitle}."
            );

            if ($model->email) {
                try {
                    Mail::to($model->email)->send(new OfferNewJobMail(
                        recipientEmail: $model->email,
                        applicantName: $model->name,
                        offeredPosition: $positionTitle,
                        details: "Your profile has been referred and offered for the position of {$positionTitle}."
                    ));
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::warning("Failed to send referral email to {$model->email}: " . $e->getMessage());
                }
            }
        }

        return response()->json(new ApplicantResource($model));
    }

    /* ------------------------------------------------------------------ */
    /* DELETE /api/v1/applicants/{applicant}                               */
    /* ------------------------------------------------------------------ */

    public function destroy(int $applicant): JsonResponse
    {
        $model = Applicant::findOrFail($applicant);

        AuditLogger::log(
            action: 'Applicant Deleted',
            module: 'Applicant Management',
            severity: 'Warning',
            targetType: 'Applicant',
            targetId: (string) $model->applicant_id,
            details: "Removed applicant record {$model->name} ({$model->applicant_code})."
        );

        // Clean up resume file
        if ($model->resume_file_path && Storage::disk('public')->exists($model->resume_file_path)) {
            Storage::disk('public')->delete($model->resume_file_path);
        }

        $model->delete();

        return response()->json(['message' => 'Applicant deleted successfully.']);
    }

    /* ------------------------------------------------------------------ */
    /* POST /api/v1/applicants/{applicant}/hire                            */
    /* Advances applicant to Offer or Hired stage                          */
    /* ------------------------------------------------------------------ */

    public function hire(int $applicant): JsonResponse
    {
        $model = Applicant::with(['jobPost'])->findOrFail($applicant);

        $nextStage = match ($model->stage) {
            'Assessed'            => 'Offer',
            'Offer'               => 'Hired',
            'Accepted'            => 'Offer',
            default               => null,
        };

        if (! $nextStage) {
            return response()->json([
                'message' => "Cannot advance from stage '{$model->stage}' using the hire action.",
            ], 422);
        }

        $model->update(['stage' => $nextStage]);
        $positionTitle = $model->jobPost?->title ?? 'Position';

        AuditLogger::log(
            action: "Applicant Advanced to {$nextStage}",
            module: 'Applicant Management',
            severity: 'Info',
            targetType: 'Applicant',
            targetId: (string) $model->applicant_id,
            details: "Advanced {$model->name} to {$nextStage} for {$positionTitle}."
        );

        NotificationService::send(
            title: "Applicant {$model->name} &rarr; {$nextStage}",
            body: "Applicant advanced to {$nextStage} stage.",
            module: 'Applicant Management',
            type: 'success',
            targetType: 'Applicant',
            targetId: (string) $model->applicant_id
        );

        if ($model->email && $nextStage === 'Offer') {
            try {
                Mail::to($model->email)->send(new OfferNewJobMail(
                    recipientEmail: $model->email,
                    applicantName: $model->name,
                    offeredPosition: $positionTitle,
                    details: "Formal offer extended for {$positionTitle}."
                ));
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning("Failed to send hire offer email to {$model->email}: " . $e->getMessage());
            }
        }

        return response()->json(new ApplicantResource($model->load(['jobPost.department'])));
    }

    /* ------------------------------------------------------------------ */
    /* POST /api/v1/applicants/{applicant}/send-email                      */
    /* Explicitly trigger an email (accept, reject, offer) to an applicant  */
    /* ------------------------------------------------------------------ */

    public function sendEmail(Request $request, int $applicant): JsonResponse
    {
        $model = Applicant::with(['jobPost.department'])->findOrFail($applicant);

        $type = $request->input('type', 'accept'); // 'accept' | 'reject' | 'offer'
        $positionTitle = $request->input('position', $model->jobPost?->title ?? 'Position');
        $details = $request->input('details');

        if (!$model->email) {
            return response()->json(['message' => 'Applicant does not have an email address.'], 422);
        }

        try {
            if ($type === 'accept') {
                $latestInterview = $model->interviews()->latest('scheduled_date')->first();
                Mail::to($model->email)->send(new ApplicantAcceptedMail(
                    recipientEmail: $model->email,
                    applicantName: $model->name,
                    position: $positionTitle,
                    interviewDate: $request->input('interview_date', $latestInterview?->scheduled_date),
                    interviewTime: $request->input('interview_time', $latestInterview?->scheduled_time),
                    interviewMode: $request->input('interview_mode', $latestInterview?->mode)
                ));
            } elseif ($type === 'reject') {
                Mail::to($model->email)->send(new ApplicantRejectedMail(
                    recipientEmail: $model->email,
                    applicantName: $model->name,
                    position: $positionTitle
                ));
            } elseif ($type === 'offer') {
                Mail::to($model->email)->send(new OfferNewJobMail(
                    recipientEmail: $model->email,
                    applicantName: $model->name,
                    offeredPosition: $positionTitle,
                    details: $details
                ));
            }

            AuditLogger::log(
                action: "Email Sent: " . ucfirst($type),
                module: 'Applicant Management',
                severity: 'Info',
                targetType: 'Applicant',
                targetId: (string) $model->applicant_id,
                details: "Sent {$type} email notification to {$model->name} ({$model->email})."
            );

            return response()->json(['message' => ucfirst($type) . " email sent successfully to {$model->email}."]);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Failed to send email: ' . $e->getMessage()], 500);
        }
    }

    /* ------------------------------------------------------------------ */
    /* GET /api/v1/applicants/stats                                        */
    /* Summary counts for the dashboard stat cards                         */
    /* ------------------------------------------------------------------ */

    public function stats(): JsonResponse
    {
        return response()->json([
            'total'               => Applicant::count(),
            'by_stage'            => Applicant::selectRaw('stage, COUNT(*) as count')
                                              ->groupBy('stage')
                                              ->pluck('count', 'stage'),
            'by_status'           => Applicant::selectRaw('status, COUNT(*) as count')
                                               ->groupBy('status')
                                               ->pluck('count', 'status'),
            'avg_fit_score'       => (float) Applicant::whereNotNull('fit_score')->avg('fit_score'),
            'hired_this_month'    => Applicant::where('stage', 'Hired')
                                               ->whereMonth('updated_at', now()->month)
                                               ->count(),
        ]);
    }
}
