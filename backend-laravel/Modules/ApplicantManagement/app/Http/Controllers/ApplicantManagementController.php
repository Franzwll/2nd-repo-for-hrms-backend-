<?php

namespace Modules\ApplicantManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Mail\ApplicantAcceptedMail;
use App\Mail\ApplicantRejectedMail;
use App\Mail\OfferNewJobMail;
use App\Models\SystemUser;
use App\Services\ApplicantRecognitionService;
use App\Services\AuditLogger;
use App\Services\DuplicateApplicationService;
use App\Services\NotificationService;
use App\Services\ResumeStorage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\PersonalAccessToken;
use Modules\ApplicantManagement\Http\Requests\StoreApplicantRequest;
use Modules\ApplicantManagement\Http\Requests\UpdateApplicantRequest;
use Modules\ApplicantManagement\Http\Resources\ApplicantResource;
use Modules\ApplicantManagement\Models\Applicant;
use Modules\ApplicantManagement\Models\ApplicantBlockHistory;
use Modules\ApplicantManagement\Models\AssessmentInvite;
use Modules\ApplicantManagement\Models\FinalEvaluation;
use Modules\ApplicantManagement\Services\DocumentVerificationService;
use Modules\ApplicantManagement\Services\OfferService;
use Modules\ApplicantManagement\Services\ScreeningService;
use Modules\NewHireOnboarding\Models\NewHire;
use Modules\RecruitmentManagement\Models\JobPost;
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
        // Lazy 7-day rule: a pending offer past its response window is
        // treated as a declined applicant before the list is returned.
        OfferService::expireOverdue();

        // `jobPost.position` is eager-loaded so the resource can resolve the
        // Core HCM test-requirement flags (owner) without N+1 queries.
        $query = Applicant::with(['jobPost.department', 'jobPost.position', 'screeningEntities', 'screeningScores', 'latestScreening'])
            ->withCount('documents')
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

        // Archive filter: hide archived by default unless requested
        if ($request->boolean('include_archived')) {
            // Keep all including archived
        } elseif ($request->boolean('only_archived')) {
            $query->whereNotNull('archived_at');
        } else {
            $query->whereNull('archived_at');
        }

        // Filter by blocked flag if specified
        if ($request->has('is_blocked')) {
            $query->where('is_blocked', $request->boolean('is_blocked'));
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

        // Blocked applicant check (any recognized identity)
        $block = ApplicantRecognitionService::findBlock(
            (string) ($data['email'] ?? ''),
            (string) ($data['name'] ?? ''),
            $data['phone'] ?? null,
            $data['address'] ?? null,
            isset($data['job_post_id']) ? (int) $data['job_post_id'] : null
        );
        if ($block && empty($data['override_block'])) {
            return response()->json(
                DuplicateApplicationService::blockResponse($block),
                403
            );
        }

        // Failed-applicant cooldown first (any recognized identity). HR may override it
        // deliberately with override_cooldown=true (audited below).
        $cooldown = ! empty($data['email'])
            ? ApplicantRecognitionService::findCooldown(
                (string) $data['email'],
                $data['name'] ?? null,
                $data['phone'] ?? null,
                $data['address'] ?? null
            )
            : null;
        if ($cooldown && empty($data['override_cooldown'])) {
            return response()->json(
                DuplicateApplicationService::cooldownResponse($cooldown),
                409
            );
        }

        // HR-side duplicate guard: recognized identity + same job + active stage.
        $existing = ApplicantRecognitionService::findDuplicate(
            (string) ($data['email'] ?? ''),
            (int) ($data['job_post_id'] ?? 0),
            $data['name'] ?? null,
            $data['phone'] ?? null,
            $data['address'] ?? null
        );
        if ($existing && ! empty($data['email']) && ! empty($data['job_post_id'])) {
            return response()->json(
                DuplicateApplicationService::duplicateResponse($existing),
                409
            );
        }

        // Applicants may only be attached to an available job post (Open /
        // published, active, with remaining slots) — same rule as the public
        // landing apply. Closed, Draft or fully-filled posts reject new adds.
        if ($blocked = $this->unavailableJobPostResponse((int) ($data['job_post_id'] ?? 0))) {
            return $blocked;
        }

        // Handle resume upload
        if ($request->hasFile('resume')) {
            $data['resume_hash'] = DuplicateApplicationService::hashFile($request->file('resume'));
            // Preserve the real extension (store() would yield ".bin" for e.g.
            // .docx, which the NLP screening rejects).
            $data['resume_file_path'] = ResumeStorage::store($request->file('resume'));
            $data['resume_original_name'] = $request->file('resume')->getClientOriginalName();
        }
        unset($data['resume']);

        $data['applicant_code'] = Applicant::generateCode();

        $applicant = Applicant::create($data);

        // HR deliberately let someone back in early — paper trail.
        if ($cooldown && ! empty($data['override_cooldown'])) {
            $applicant->forceFill(['cooldown_lifted_at' => now()])->save();
            AuditLogger::log(
                action: 'Re-apply Cooldown Overridden',
                module: 'Applicant Management',
                severity: 'Warning',
                targetType: 'Applicant',
                targetId: (string) $applicant->applicant_id,
                details: "Cooldown overridden by " . ($request->user()?->username ?? 'HR')
                    . " — {$applicant->name} ({$applicant->email}) was Rejected, "
                    . "eligible after {$cooldown['eligible_after']} ({$cooldown['days_left']} day(s) left)."
            );
        }

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
            targetId: (string) $applicant->applicant_id,
            onlyRoleNames: ['Admin', 'Super Admin']
        );

        return response()->json(
            new ApplicantResource($applicant->load(['jobPost.department'])),
            201
        );
    }

    /* ------------------------------------------------------------------ */
    /* Availability guard shared by store/update                             */
    /* A job post accepts applicants only while it is Open (or published),   */
    /* active, and still has unfilled vacancies. Returns a 422 response when */
    /* the post is unavailable, null when the applicant may proceed.         */
    /* ------------------------------------------------------------------ */

    private function unavailableJobPostResponse(int $jobPostId): ?JsonResponse
    {
        $jobPost = JobPost::find($jobPostId);

        if (! $jobPost) {
            return response()->json(['message' => 'The selected job post no longer exists.'], 422);
        }

        if (! $jobPost->active || ! in_array($jobPost->status, ['published', 'Open'], true)) {
            return response()->json([
                'message' => "Cannot add applicant: the job post for '{$jobPost->title}' is {$jobPost->status} and is not accepting applications.",
            ], 422);
        }

        if ($jobPost->remainingSlots() <= 0) {
            return response()->json([
                'message' => "Cannot add applicant: all slots for '{$jobPost->title}' have been filled.",
            ], 422);
        }

        return null;
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
            'documents',
        ])->findOrFail($applicant);

        return response()->json(new ApplicantResource($model));
    }

    /* ------------------------------------------------------------------ */
    /* GET /api/v1/applicants/{applicant}/history                            */
    /* Same-email past applications: position, dates, failed stage,         */
    /* cooldown countdown / eligible flag for the HR profile strip.         */
    /* ------------------------------------------------------------------ */

    public function history(int $applicant): JsonResponse
    {
        $model = Applicant::findOrFail($applicant);

        // Find matches across multi-field recognition
        $matches = ApplicantRecognitionService::findMatches(
            (string) $model->email,
            (string) $model->name,
            $model->phone,
            $model->address
        );

        $matchedIds = $matches->pluck('applicant_id')->push($model->applicant_id)->unique()->all();

        $rows = Applicant::with('jobPost')
            ->whereIn('applicant_id', $matchedIds)
            ->orderByDesc('applied_at')
            ->limit(20)
            ->get();

        $matchLookup = $matches->keyBy('applicant_id');

        $cooldown = ApplicantRecognitionService::findCooldown(
            (string) $model->email,
            (string) $model->name,
            $model->phone,
            $model->address
        );

        $block = ApplicantRecognitionService::findBlock(
            (string) $model->email,
            (string) $model->name,
            $model->phone,
            $model->address
        );

        return response()->json([
            'data' => $rows->map(function (Applicant $row) use ($model, $matchLookup) {
                $matchInfo = $matchLookup->get($row->applicant_id);

                return [
                    'applicant_id' => $row->applicant_id,
                    'applicant_code' => $row->applicant_code,
                    'job_post_id' => $row->job_post_id,
                    'position' => $row->jobPost?->title ?? 'Position',
                    'applied_at' => $row->applied_at?->toISOString(),
                    'stage' => $row->stage,
                    'status' => $row->status,
                    'offer_status' => $row->offer_status,
                    'rejected_at' => $row->rejected_at?->toISOString(),
                    'cooldown_lifted_at' => $row->cooldown_lifted_at?->toISOString(),
                    'is_current' => $row->applicant_id === $model->applicant_id,
                    'matched_rules' => $matchInfo['matched_rules'] ?? ['Current record'],
                    'confidence' => $matchInfo['confidence'] ?? 'High',
                ];
            }),
            'cooldown' => $cooldown,
            'block' => $block,
            'cooldown_days' => DuplicateApplicationService::cooldownDays(),
            'attempt_count' => $rows->count(),
            'matched_applicants_count' => count($matchedIds),
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* POST /api/v1/applicants/{applicant}/cooldown/override                */
    /* HR allows early re-application: lifts the waiting period with audit. */
    /* ------------------------------------------------------------------ */

    public function overrideCooldown(Request $request, int $applicant): JsonResponse
    {
        $model = Applicant::findOrFail($applicant);

        $model->forceFill(['cooldown_lifted_at' => now()])->save();

        AuditLogger::log(
            action: 'Re-apply Cooldown Overridden',
            module: 'Applicant Management',
            severity: 'Warning',
            targetType: 'Applicant',
            targetId: (string) $model->applicant_id,
            details: "Cooldown lifted early by " . ($request->user()?->username ?? 'HR')
                . " for {$model->name} ({$model->email})."
        );

        return response()->json([
            'message' => "{$model->name} may now re-apply for any open position.",
            'data' => new ApplicantResource($model->fresh()),
        ]);
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
    /* POST /api/v1/applicants/{applicant}/screening/recompute              */
    /* Re-runs the classification stage with the current supporting-document */
    /* evidence so the ranking percentage, rank order and official status    */
    /* reflect the verification of the resume claims.                        */
    /* ------------------------------------------------------------------ */

    public function recomputeScreening(int $applicant): JsonResponse
    {
        $model = Applicant::with('jobPost')->findOrFail($applicant);

        /* Documents uploaded before the resume was screened were never
           compared (PENDING). Verify them first so a manual recompute really
           reflects every uploaded paper, not just the ones checked by hand. */
        app(DocumentVerificationService::class)->verifyPendingDocuments($model);

        $screening = $this->screening->recomputeWithDocuments($model);

        if (! $screening) {
            return response()->json([
                'message' => 'No completed resume screening is available to recompute, or the NLP service is offline.',
            ], 422);
        }

        AuditLogger::log(
            action: 'Screening Recomputed With Supporting Documents',
            module: 'Applicant Management',
            severity: $screening->screening_result === 'credential' ? 'Warning' : 'Info',
            targetType: 'Applicant',
            targetId: (string) $model->applicant_id,
            details: sprintf(
                'Ranking score recomputed to %s%% using %d supporting document(s).',
                rtrim(rtrim((string) $screening->match_score, '0'), '.'),
                $model->documents()->count()
            )
        );

        return response()->json([
            'data'      => $screening,
            'applicant' => new ApplicantResource($model->fresh([
                'jobPost.department',
                'screeningEntities',
                'screeningScores',
                'latestScreening',
                'documents',
            ])),
        ]);
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

        // Keep the filename header-safe: quotes / line breaks in the stored
        // original name would otherwise break out of Content-Disposition and
        // flip an inline preview into a forced download (or worse). The
        // RFC 5987 filename* carries the exact name for Unicode clients.
        $safeName = (string) preg_replace('/[\r\n"]+/', '_', (string) $name);

        return response()->file($path, [
            'Content-Type'        => $mime,
            'Content-Disposition' => 'inline; filename="' . $safeName . '"; filename*=UTF-8\'\'' . rawurlencode((string) $name),
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
            // Keep in sync with the landing cap (20) — same 1-box uploader.
            'documents' => ['sometimes', 'array', 'max:20'],
            'documents.*' => ['file', 'max:10240'],
            'doc_types' => ['sometimes', 'array', 'max:20'],
            'doc_types.*' => ['string', 'in:COE,Certificate,Credential,Others'],
        ]);

        $storedPath = $request->file('resume')->store('resumes-tmp', 'local');
        $docTmps = [];
        try {
            $files = $request->file('documents', []);
            if ($files instanceof \Illuminate\Http\UploadedFile) {
                $files = [$files];
            }
            $types = $request->input('doc_types', []);
            if (! is_array($types)) {
                $types = [$types];
            }
            foreach (array_values(is_array($files) ? $files : []) as $i => $docFile) {
                if (! $docFile instanceof \Illuminate\Http\UploadedFile || ! $docFile->isValid()) {
                    continue;
                }
                $docStored = $docFile->store('resumes-tmp', 'local');
                $docTmps[] = [
                    'stored_path' => $docStored,
                    'original_name' => $docFile->getClientOriginalName() ?: 'document',
                    'doc_type' => (string) ($types[$i] ?? 'Others'),
                    'title' => $docFile->getClientOriginalName() ?: 'document',
                ];
            }

            $result = $this->screening->screenPreviewWithDocuments(
                $storedPath,
                $request->file('resume')->getClientOriginalName() ?: 'resume',
                (int) $validated['job_post_id'],
                $docTmps
            );
        } finally {
            if (Storage::disk('local')->exists($storedPath)) {
                Storage::disk('local')->delete($storedPath);
            }
            foreach ($docTmps as $tmp) {
                $p = $tmp['stored_path'] ?? null;
                if ($p && Storage::disk('local')->exists($p)) {
                    Storage::disk('local')->delete($p);
                }
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

        // Transfers (referrals) may only target an available job post.
        if (isset($data['job_post_id']) && (int) $data['job_post_id'] !== (int) $oldJobPostId) {
            if ($blocked = $this->unavailableJobPostResponse((int) $data['job_post_id'])) {
                return $blocked;
            }
        }

        // Handle resume replacement
        if ($request->hasFile('resume')) {
            // Delete old file if it exists
            if ($model->resume_file_path && Storage::disk('public')->exists($model->resume_file_path)) {
                Storage::disk('public')->delete($model->resume_file_path);
            }
            $data['resume_hash'] = DuplicateApplicationService::hashFile($request->file('resume'));
            $data['resume_file_path'] = ResumeStorage::store($request->file('resume'));
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

            // Entering Rejected starts the re-apply cooldown clock.
            // Leaving Rejected (re-book / override) keeps the stamp as history.
            if ($newStage === 'Rejected') {
                if ($model->offer_status !== 'Declined') {
                    $model->forceFill([
                        'rejected_at' => now(),
                        'cooldown_lifted_at' => null,
                    ])->save();
                    $model->refresh();
                }
            }

            AuditLogger::log(
                action: "Applicant Stage Changed to {$newStage}",
                module: 'Applicant Management',
                severity: $newStage === 'Rejected' ? 'Warning' : 'Info',
                targetType: 'Applicant',
                targetId: (string) $model->applicant_id,
                details: "Stage changed from {$oldStage} to {$newStage} for {$model->name} ({$positionTitle})."
            );

            // Helpful-only: bell only for action stages (needs HR decision).
            // Intermediate moves stay in audit log.
            if (in_array($newStage, ['Interview Scheduled', 'Offer', 'Hired', 'Rejected'], true)) {
                NotificationService::send(
                    title: "Applicant {$model->name}: {$newStage}",
                    body: "Stage updated from {$oldStage} to {$newStage} for {$positionTitle}.",
                    module: 'Applicant Management',
                    type: $newStage === 'Rejected' ? 'warning' : 'info',
                    targetType: 'Applicant',
                    targetId: (string) $model->applicant_id,
                    onlyRoleNames: ['Admin', 'Super Admin']
                );
            }

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
                        $eligibleLabel = $model->rejected_at
                            ? $model->rejected_at->copy()->addDays(DuplicateApplicationService::cooldownDays())->format('M j, Y')
                            : null;
                        Mail::to($model->email)->send(new ApplicantRejectedMail(
                            recipientEmail: $model->email,
                            applicantName: $model->name,
                            position: $positionTitle,
                            eligibleAfterLabel: $eligibleLabel
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

        // Strict pre-hiring workflow: an offer may only be extended from a
        // Final Evaluation with a "Recommended for Hire" verdict. There are
        // no shortcuts from earlier stages — the candidate must complete the
        // assessment test, practical test (when required) and final evaluation.
        $nextStage = match ($model->stage) {
            'Final Evaluation'    => 'Offer',
            'Offer'               => 'Hired',
            default               => null,
        };

        if (! $nextStage) {
            return response()->json([
                'message' => "Cannot advance from stage '{$model->stage}' using the hire action. Complete the required evaluation workflow first.",
            ], 422);
        }

        if ($model->stage === 'Final Evaluation') {
            $final = $model->finalEvaluation()->latest('final_evaluation_id')->first();
            if (! $final || $final->recommendation !== 'Recommended for Hire') {
                return response()->json([
                    'message' => 'A final evaluation with a "Recommended for Hire" recommendation is required before extending an offer.',
                ], 422);
            }
        }

        $model->update(['stage' => $nextStage]);
        $positionTitle = $model->jobPost?->title ?? 'Position';

        // Filling a slot: auto-closes the job post when vacancies reach 0.
        if ($nextStage === 'Hired' && $model->jobPost) {
            try {
                $model->jobPost->fillOneSlot();
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('Job post slot fill failed for post '.$model->job_post_id.': '.$e->getMessage());
            }
        }

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
            targetId: (string) $model->applicant_id,
            onlyRoleNames: ['Admin', 'Super Admin']
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
    /* POST /api/v1/applicants/{applicant}/return-to-pipeline               */
    /* Super Admin only: move an applicant back to an earlier stage so a    */
    /* step can be redone. Works for Rejected, Hired and in-progress        */
    /* applicants. Subsequent pipeline records are reset so the applicant   */
    /* is cleanly back at the target stage.                                 */
    /* ------------------------------------------------------------------ */

    /** Pipeline order used to decide which stages count as "earlier". */
    private const RETURN_STAGE_ORDER = [
        'Screened'            => 0,
        'Accepted'            => 1,
        'Interview Scheduled' => 2,
        'Assessed'            => 3,
        'Assessment Test'     => 4,
        'Practical Test'      => 5,
        'Final Evaluation'    => 6,
        'Offer'               => 7,
        'Hired'               => 8,
    ];

    /**
     * Where a Rejected applicant actually failed, inferred from the process
     * records that survive the rejection. A final evaluation is written before
     * the stage flips to Rejected, and an offer reply stays on the record, so
     * the latest surviving evidence is the failure point.
     */
    private function rejectedAtStage(Applicant $model): string
    {
        if ($model->offer_status !== null || $model->offer_sent_at !== null) {
            return 'Offer';
        }

        if (FinalEvaluation::where('applicant_id', $model->applicant_id)->exists()) {
            return 'Final Evaluation';
        }

        if ($model->practicalTests()->exists()) {
            return 'Practical Test';
        }

        if ($model->assessmentTests()->exists()) {
            return 'Assessment Test';
        }

        if ($model->assessments()->exists()) {
            return 'Assessed';
        }

        if ($model->interviews()->exists()) {
            return 'Interview Scheduled';
        }

        return 'Screened';
    }

    /**
     * Active stages this applicant may be returned to — strictly earlier than
     * their current step, or than the step where a Rejected applicant failed.
     * A rejection at screening has nothing before it, so Screened is offered
     * as the restart point.
     *
     * @return array<int, string>
     */
    private function allowedReturnStages(Applicant $model): array
    {
        $order = self::RETURN_STAGE_ORDER;

        $active = array_keys(array_filter(
            $order,
            fn (int $index): bool => $index < $order['Hired'],
        ));

        if ($model->stage === 'Rejected') {
            $failedAt = $order[$this->rejectedAtStage($model)];

            $allowed = array_values(array_filter(
                $active,
                fn (string $stage): bool => $order[$stage] < $failedAt,
            ));

            return $allowed !== [] ? $allowed : ['Screened'];
        }

        if (! isset($order[$model->stage])) {
            return [];
        }

        return array_values(array_filter(
            $active,
            fn (string $stage): bool => $order[$stage] < $order[$model->stage],
        ));
    }

    public function returnToPipeline(Request $request, int $applicant): JsonResponse
    {
        $user = $request->user();
        if (! $user || ! $user->isSuperAdmin()) {
            return response()->json([
                'message' => 'Only a Super Admin may return an applicant to the recruitment pipeline.',
            ], 403);
        }

        $validated = $request->validate([
            'target_stage' => ['required', 'string'],
            'reason'       => ['required', 'string', 'max:1000'],
        ]);

        $model = Applicant::with(['jobPost.department'])->findOrFail($applicant);
        $fromStage = $model->stage;

        $allowedStages = $this->allowedReturnStages($model);

        if ($allowedStages === []) {
            return response()->json([
                'message' => "{$model->name} is at the start of the pipeline ({$fromStage}) — there is no earlier stage to return to.",
            ], 422);
        }

        $targetStage = $validated['target_stage'];

        if (! in_array($targetStage, $allowedStages, true)) {
            return response()->json([
                'message' => "{$model->name} can only be returned to an earlier stage: "
                    . implode(', ', $allowedStages) . '.',
            ], 422);
        }

        // An Offer must still be backed by a positive final evaluation —
        // otherwise the pipeline would jump past the whole process.
        if ($targetStage === 'Offer') {
            $final = $model->finalEvaluation()->latest('final_evaluation_id')->first();
            if (! $final || $final->recommendation === 'Not Recommended') {
                return response()->json([
                    'message' => 'Returning to Offer requires a final evaluation that is not "Not Recommended".',
                ], 422);
            }
        }

        $newHire = $fromStage === 'Hired'
            ? NewHire::where('applicant_id', $model->applicant_id)->first()
            : null;

        // A hire that already became an employee (Probationary / Regular or a
        // linked employee record) is real headcount — never silently undo it.
        if ($newHire && ($newHire->employee_id || $newHire->stage !== 'Pre-onboarding')) {
            return response()->json([
                'message' => "{$model->name} has already progressed past Pre-onboarding and can no longer be returned automatically.",
            ], 422);
        }

        $portalEmail = $newHire?->email;
        $removedNewHireCode = $newHire?->new_hire_code;

        DB::beginTransaction();
        try {
            if ($newHire) {
                // onboarding_items.new_hire_id has no cascade, so clear the
                // checklist rows before deleting the Pre-onboarding record.
                $newHire->onboardingItems()->delete();
                $newHire->delete();
            }

            // A Hired applicant consumed a job-post slot — release it (and
            // reopen the post when a vacancy is available again).
            if ($fromStage === 'Hired' && $model->jobPost) {
                $model->jobPost->releaseOneSlot();
            }

            // Clean up subsequent pipeline records so the applicant's record
            // in the pipeline accurately reflects $targetStage.
            $this->performReturnCleanup($model, $targetStage);

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Could not return the applicant to the pipeline: '.$e->getMessage(),
            ], 500);
        }

        // Best-effort: remove the portal account that was auto-created for the
        // Pre-onboarding hire (Employee role, not linked to an employee yet).
        if ($newHire && $portalEmail) {
            try {
                SystemUser::where('email', $portalEmail)
                    ->where('role_id', 3)
                    ->whereNull('employee_id')
                    ->delete();
            } catch (\Throwable $e) {
                Log::warning('Could not remove returned applicant portal account', [
                    'email' => $portalEmail,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $positionTitle = $model->jobPost?->title ?? 'Position';
        $reason = trim($validated['reason']);

        AuditLogger::log(
            action: 'Applicant Returned to Recruitment',
            module: 'Applicant Management',
            severity: 'Warning',
            targetType: 'Applicant',
            targetId: (string) $model->applicant_id,
            details: "Returned {$model->name} from {$fromStage} to {$targetStage} for {$positionTitle}. Subsequent pipeline records were reset. Reason: {$reason}"
                . ($removedNewHireCode ? " Removed Pre-onboarding record {$removedNewHireCode}." : ''),
        );

        NotificationService::send(
            title: "Applicant {$model->name} returned to {$targetStage}",
            body: "{$fromStage} → {$targetStage}. Reason: {$reason}",
            module: 'Applicant Management',
            type: 'warning',
            targetType: 'Applicant',
            targetId: (string) $model->applicant_id,
            onlyRoleNames: ['Admin', 'Super Admin'],
        );

        return response()->json(new ApplicantResource($model->fresh(['jobPost.department'])));
    }

    /**
     * Clean up subsequent pipeline records so the applicant's record
     * in the pipeline accurately reflects $targetStage.
     */
    private function performReturnCleanup(Applicant $model, string $targetStage): void
    {
        $targetIndex = self::RETURN_STAGE_ORDER[$targetStage] ?? 0;

        // Stages > 5: Final Evaluation
        if ($targetIndex <= 5) {
            FinalEvaluation::where('applicant_id', $model->applicant_id)->delete();
        }

        // Stages > 4: Practical Test
        if ($targetIndex <= 4) {
            $model->practicalTests()->delete();
        }

        // Stages > 3: Assessment Test & Invites
        if ($targetIndex <= 3) {
            $model->assessmentTests()->delete();
            AssessmentInvite::where('applicant_id', $model->applicant_id)->delete();
        }

        // Stages > 2: Interview Assessment (Assessed verdict)
        if ($targetIndex <= 2) {
            $model->assessments()->delete();
            if ($targetIndex === 2) {
                // When returning to Interview Scheduled, reset completed interview back to Scheduled
                $model->interviews()->where('status', 'Completed')->update(['status' => 'Scheduled']);
            }
        }

        // Stages > 1: Interview Scheduling
        if ($targetIndex <= 1) {
            $model->interviews()->delete();
        }

        // If returning to Screened, Accepted, or Interview Scheduled, restore
        // fit_score back to the resume screening match score if available.
        $fitScore = $model->fit_score;
        if ($targetIndex <= 2) {
            $screening = $model->screenings()->latest('screening_id')->first();
            if ($screening && $screening->match_score !== null) {
                $fitScore = $screening->match_score;
            }
        }

        // The step is being redone: clear the rejection/cooldown anchors
        // and any offer reply trail so the pipeline starts clean at the
        // target stage.
        $model->forceFill([
            'stage'                      => $targetStage,
            'status'                     => 'fit',
            'fit_score'                  => $fitScore,
            'rejected_at'                => null,
            'cooldown_lifted_at'         => null,
            'offer_status'               => null,
            'offer_sent_at'              => null,
            'offer_expires_at'           => null,
            'offer_start_date'           => null,
            'offer_response_channel'     => null,
            'offer_response_note'        => null,
            'offer_responded_at'         => null,
            'offer_response_recorded_by' => null,
        ])->save();
    }

    /* ------------------------------------------------------------------ */
    /* POST /api/v1/applicants/{applicant}/move-to-stage                   */
    /* Moves an applicant to a selected recruitment stage (forward or back) */
    /* ------------------------------------------------------------------ */
    public function moveToStage(Request $request, int $applicant): JsonResponse
    {
        $user = $request->user();
        if (! $user || ! $user->isSuperAdmin()) {
            return response()->json([
                'message' => 'Only a Super Admin may move an applicant across recruitment stages.',
            ], 403);
        }

        $validated = $request->validate([
            'target_stage' => ['required', 'string', 'in:Screened,Accepted,Interview Scheduled,Assessed,Assessment Test,Practical Test,Final Evaluation,Offer'],
            'reason'       => ['required', 'string', 'max:1000'],
        ]);

        $model = Applicant::with(['jobPost.department'])->findOrFail($applicant);
        $fromStage = $model->stage;
        $targetStage = $validated['target_stage'];

        if ($fromStage === $targetStage) {
            return response()->json([
                'message' => "{$model->name} is already at {$targetStage}.",
            ], 422);
        }

        $targetIndex = self::RETURN_STAGE_ORDER[$targetStage] ?? null;
        $currentIndex = self::RETURN_STAGE_ORDER[$fromStage] ?? null;

        $newHire = $fromStage === 'Hired'
            ? NewHire::where('applicant_id', $model->applicant_id)->first()
            : null;

        if ($newHire && ($newHire->employee_id || $newHire->stage !== 'Pre-onboarding')) {
            return response()->json([
                'message' => "{$model->name} has already progressed past Pre-onboarding and cannot be moved automatically.",
            ], 422);
        }

        $isMovingBackward = ($currentIndex === null || in_array($fromStage, ['Hired', 'Rejected'], true) || $targetIndex < $currentIndex);

        if ($isMovingBackward) {
            // Backward move: clean up downstream records
            DB::beginTransaction();
            try {
                if ($fromStage === 'Hired') {
                    if ($newHire) {
                        $newHire->onboardingItems()->delete();
                        $newHire->delete();
                    }
                    if ($model->jobPost) {
                        $model->jobPost->releaseOneSlot();
                    }
                }

                $this->performReturnCleanup($model, $targetStage);
                DB::commit();
            } catch (\Throwable $e) {
                DB::rollBack();

                return response()->json([
                    'message' => 'Could not move applicant: ' . $e->getMessage(),
                ], 500);
            }
        } else {
            // Forward move: validate prerequisites
            if ($targetIndex >= 2 && ! $model->screenings()->exists()) {
                return response()->json(['message' => "Moving to {$targetStage} requires a completed screening."], 422);
            }
            if ($targetIndex >= 3 && ! $model->interviews()->exists()) {
                return response()->json(['message' => "Moving to {$targetStage} requires an interview."], 422);
            }
            if ($targetIndex >= 4 && ! $model->assessments()->exists()) {
                return response()->json(['message' => "Moving to {$targetStage} requires an interview assessment."], 422);
            }
            if ($targetIndex >= 5 && ! $model->assessmentTests()->exists()) {
                return response()->json(['message' => "Moving to {$targetStage} requires an assessment test."], 422);
            }
            if ($targetIndex >= 6) {
                $requiresPractical = \Modules\ApplicantManagement\Services\PracticalRequirement::required(
                    $model->jobPost,
                    $model->jobPost?->title,
                    $model->jobPost?->position
                );
                if ($requiresPractical && ! $model->practicalTests()->exists()) {
                    return response()->json(['message' => "Moving to {$targetStage} requires a practical assessment."], 422);
                }
            }
            if ($targetIndex >= 7) {
                $final = $model->finalEvaluation()->latest('final_evaluation_id')->first();
                if (! $final || $final->recommendation === 'Not Recommended') {
                    return response()->json(['message' => "Moving to {$targetStage} requires a passing final evaluation."], 422);
                }
            }

            $model->update([
                'stage'              => $targetStage,
                'rejected_at'        => null,
                'cooldown_lifted_at' => null,
            ]);
        }

        $positionTitle = $model->jobPost?->title ?? 'Position';
        $reason = trim($validated['reason']);

        AuditLogger::log(
            action: "Applicant Moved to Stage {$targetStage}",
            module: 'Applicant Management',
            severity: 'Warning',
            targetType: 'Applicant',
            targetId: (string) $model->applicant_id,
            details: "Moved {$model->name} from {$fromStage} to {$targetStage} for {$positionTitle}. Reason: {$reason}"
        );

        NotificationService::send(
            title: "Applicant {$model->name} moved to {$targetStage}",
            body: "{$fromStage} → {$targetStage}. Reason: {$reason}",
            module: 'Applicant Management',
            type: 'warning',
            targetType: 'Applicant',
            targetId: (string) $model->applicant_id,
            onlyRoleNames: ['Admin', 'Super Admin'],
        );

        return response()->json(new ApplicantResource($model->fresh(['jobPost.department'])));
    }

    /* ------------------------------------------------------------------ */
    /* POST /api/v1/applicants/{applicant}/reopen                          */
    /* Reopens a previously closed (Rejected) application for reconsideration */
    /* ------------------------------------------------------------------ */
    public function reopenApplication(Request $request, int $applicant): JsonResponse
    {
        $user = $request->user();
        if (! $user || ! $user->isSuperAdmin()) {
            return response()->json([
                'message' => 'Only a Super Admin may reopen a closed application.',
            ], 403);
        }

        $validated = $request->validate([
            'target_stage' => ['nullable', 'string', 'in:Screened,Accepted,Interview Scheduled,Assessed,Assessment Test,Practical Test,Final Evaluation'],
            'reason'       => ['required', 'string', 'max:1000'],
        ]);

        $model = Applicant::with(['jobPost.department'])->findOrFail($applicant);

        if ($model->stage !== 'Rejected') {
            return response()->json([
                'message' => "Only rejected applications can be reopened. {$model->name} is currently in {$model->stage}.",
            ], 422);
        }

        if ($model->isBlocked()) {
            return response()->json([
                'message' => "Cannot reopen: {$model->name} is currently blocked from recruitment.",
            ], 403);
        }

        $targetStage = $validated['target_stage'] ?? 'Screened';

        // Check active duplicate
        $existing = ApplicantRecognitionService::findDuplicate(
            (string) $model->email,
            (int) $model->job_post_id,
            (string) $model->name,
            $model->phone,
            $model->address,
            $model->applicant_id
        );
        if ($existing) {
            return response()->json([
                'message' => 'An active application already exists for this position.',
            ], 409);
        }

        DB::beginTransaction();
        try {
            $this->performReturnCleanup($model, $targetStage);
            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Could not reopen application: ' . $e->getMessage(),
            ], 500);
        }

        $positionTitle = $model->jobPost?->title ?? 'Position';
        $reason = trim($validated['reason']);

        AuditLogger::log(
            action: 'Application Reopened',
            module: 'Applicant Management',
            severity: 'Warning',
            targetType: 'Applicant',
            targetId: (string) $model->applicant_id,
            details: "Reopened application for {$model->name} ({$positionTitle}) at stage {$targetStage}. Reason: {$reason}"
        );

        NotificationService::send(
            title: "Application Reopened: {$model->name}",
            body: "Reopened at {$targetStage} for {$positionTitle}. Reason: {$reason}",
            module: 'Applicant Management',
            type: 'info',
            targetType: 'Applicant',
            targetId: (string) $model->applicant_id,
            onlyRoleNames: ['Admin', 'Super Admin'],
        );

        return response()->json(new ApplicantResource($model->fresh(['jobPost.department'])));
    }

    /* ------------------------------------------------------------------ */
    /* POST /api/v1/applicants/{applicant}/correct-hiring                  */
    /* Corrects an incorrect hiring decision (mistaken hire, no-show, reneged) */
    /* ------------------------------------------------------------------ */
    public function correctHiringDecision(Request $request, int $applicant): JsonResponse
    {
        $user = $request->user();
        if (! $user || ! $user->isSuperAdmin()) {
            return response()->json([
                'message' => 'Only a Super Admin may correct a hiring decision.',
            ], 403);
        }

        $validated = $request->validate([
            'correction_type' => ['required', 'string', 'in:mistaken_hire,no_show,reneged'],
            'reason'          => ['required', 'string', 'max:1000'],
            'apply_cooldown'  => ['nullable', 'boolean'],
        ]);

        $model = Applicant::with(['jobPost.department'])->findOrFail($applicant);

        if ($model->stage !== 'Hired') {
            return response()->json([
                'message' => "Only hired applicants can have their hiring decision corrected. {$model->name} is in {$model->stage}.",
            ], 422);
        }

        $newHire = NewHire::where('applicant_id', $model->applicant_id)->first();
        if ($newHire && ($newHire->employee_id || $newHire->stage !== 'Pre-onboarding')) {
            return response()->json([
                'message' => "{$model->name} has already progressed past Pre-onboarding or is linked to an employee record ({$newHire->employee_id}) — cannot correct automatically.",
            ], 422);
        }

        $portalEmail = $newHire?->email;
        $removedNewHireCode = $newHire?->new_hire_code;
        $correctionType = $validated['correction_type'];
        $reason = trim($validated['reason']);
        $shouldCooldown = $validated['apply_cooldown'] ?? in_array($correctionType, ['no_show', 'reneged'], true);

        DB::beginTransaction();
        try {
            if ($newHire) {
                $newHire->onboardingItems()->delete();
                $newHire->delete();
            }

            if ($model->jobPost) {
                $model->jobPost->releaseOneSlot();
            }

            $model->forceFill([
                'stage'                      => 'Rejected',
                'rejected_at'                => $shouldCooldown ? now() : null,
                'cooldown_lifted_at'         => null,
                'offer_status'               => 'Declined',
                'offer_response_note'        => "Hiring Correction ({$correctionType}): {$reason}",
                'offer_response_channel'     => 'In person',
                'offer_responded_at'         => now(),
            ])->save();

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Could not correct hiring decision: ' . $e->getMessage(),
            ], 500);
        }

        if ($newHire && $portalEmail) {
            try {
                SystemUser::where('email', $portalEmail)
                    ->where('role_id', 3)
                    ->whereNull('employee_id')
                    ->delete();
            } catch (\Throwable $e) {
                Log::warning('Could not remove portal account during hiring correction', [
                    'email' => $portalEmail,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $positionTitle = $model->jobPost?->title ?? 'Position';

        AuditLogger::log(
            action: 'Hiring Decision Corrected',
            module: 'Applicant Management',
            severity: 'Warning',
            targetType: 'Applicant',
            targetId: (string) $model->applicant_id,
            details: "Corrected hiring decision for {$model->name} ({$positionTitle}) as {$correctionType}. "
                . ($shouldCooldown ? '30-day cooldown initiated. ' : 'No cooldown applied. ')
                . ($removedNewHireCode ? "Removed onboarding record {$removedNewHireCode}. " : '')
                . "Reason: {$reason}"
        );

        NotificationService::send(
            title: "Hiring Decision Corrected: {$model->name}",
            body: "{$correctionType}: {$reason}",
            module: 'Applicant Management',
            type: 'warning',
            targetType: 'Applicant',
            targetId: (string) $model->applicant_id,
            onlyRoleNames: ['Admin', 'Super Admin'],
        );

        return response()->json(new ApplicantResource($model->fresh(['jobPost.department'])));
    }

    /* ------------------------------------------------------------------ */
    /* POST /api/v1/applicants/{applicant}/archive                         */
    /* Hides an applicant from active recruitment lists                    */
    /* ------------------------------------------------------------------ */
    public function archiveApplicant(Request $request, int $applicant): JsonResponse
    {
        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        $model = Applicant::findOrFail($applicant);

        if ($model->archived_at !== null) {
            return response()->json(['message' => 'This applicant is already archived.'], 422);
        }

        if (! in_array($model->stage, ['Hired', 'Rejected'], true)) {
            return response()->json([
                'message' => 'Only completed or rejected applications (Hired or Rejected) can be archived. In-flight active applications must be completed or rejected first.',
            ], 422);
        }

        $actor = $request->user()?->full_name ?? $request->user()?->username ?? 'HR';
        $reason = trim($validated['reason']);

        $model->update([
            'archived_at'     => now(),
            'archived_by'     => $actor,
            'archived_reason' => $reason,
        ]);

        AuditLogger::log(
            action: 'Applicant Archived',
            module: 'Applicant Management',
            severity: 'Info',
            targetType: 'Applicant',
            targetId: (string) $model->applicant_id,
            details: "Archived applicant {$model->name} ({$model->applicant_code}). Reason: {$reason}"
        );

        return response()->json([
            'message' => "{$model->name} has been archived.",
            'data'    => new ApplicantResource($model->fresh()),
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* POST /api/v1/applicants/{applicant}/restore                         */
    /* Restores an archived applicant back to active views                 */
    /* ------------------------------------------------------------------ */
    public function restoreApplicant(Request $request, int $applicant): JsonResponse
    {
        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        $model = Applicant::findOrFail($applicant);

        if ($model->archived_at === null) {
            return response()->json(['message' => 'This applicant is not archived.'], 422);
        }

        if (! in_array($model->stage, ['Hired', 'Rejected'], true)) {
            $existing = ApplicantRecognitionService::findDuplicate(
                (string) $model->email,
                (int) $model->job_post_id,
                (string) $model->name,
                $model->phone,
                $model->address,
                $model->applicant_id
            );
            if ($existing) {
                return response()->json([
                    'message' => 'Cannot restore: an active application already exists for this candidate on this position.',
                ], 409);
            }
        }

        $reason = trim($validated['reason']);

        $model->update([
            'archived_at'     => null,
            'archived_by'     => null,
            'archived_reason' => null,
        ]);

        AuditLogger::log(
            action: 'Applicant Restored from Archive',
            module: 'Applicant Management',
            severity: 'Info',
            targetType: 'Applicant',
            targetId: (string) $model->applicant_id,
            details: "Restored applicant {$model->name} ({$model->applicant_code}) from archive. Reason: {$reason}"
        );

        return response()->json([
            'message' => "{$model->name} has been restored from archive.",
            'data'    => new ApplicantResource($model->fresh()),
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* POST /api/v1/applicants/{applicant}/block                           */
    /* Restricts an applicant from specified recruitment activities        */
    /* ------------------------------------------------------------------ */
    public function blockApplicant(Request $request, int $applicant): JsonResponse
    {
        $user = $request->user();
        if (! $user || ! $user->isSuperAdmin()) {
            return response()->json([
                'message' => 'Only a Super Admin may block an applicant.',
            ], 403);
        }

        $validated = $request->validate([
            'reason'     => ['required', 'string', 'max:1000'],
            'scope'      => ['nullable', 'string', 'in:all_jobs,specific_job'],
            'expires_at' => ['nullable', 'date', 'after:now'],
        ]);

        $model = Applicant::findOrFail($applicant);
        $scope = $validated['scope'] ?? 'all_jobs';
        if ($scope === 'specific_job' && $model->job_post_id) {
            $scope = 'specific_job:' . $model->job_post_id;
        }

        $actor = $user->full_name ?? $user->username ?? 'Super Admin';
        $reason = trim($validated['reason']);
        $expiresAt = ! empty($validated['expires_at']) ? \Carbon\Carbon::parse($validated['expires_at']) : null;

        $model->update([
            'is_blocked'       => true,
            'blocked_at'       => now(),
            'blocked_by'       => $actor,
            'blocked_reason'   => $reason,
            'block_scope'      => $scope,
            'block_expires_at' => $expiresAt,
        ]);

        ApplicantBlockHistory::create([
            'applicant_id' => $model->applicant_id,
            'action'       => 'blocked',
            'performed_by' => $actor,
            'reason'       => $reason,
            'scope'        => $scope,
            'performed_at' => now(),
        ]);

        AuditLogger::log(
            action: 'Applicant Blocked',
            module: 'Applicant Management',
            severity: 'Warning',
            targetType: 'Applicant',
            targetId: (string) $model->applicant_id,
            details: "Blocked applicant {$model->name} ({$model->applicant_code}). Scope: {$scope}. Reason: {$reason}"
                . ($expiresAt ? " Expires: " . $expiresAt->toDateString() : ' (Permanent)')
        );

        NotificationService::send(
            title: "Applicant Blocked: {$model->name}",
            body: "Scope: {$scope}. Reason: {$reason}",
            module: 'Applicant Management',
            type: 'warning',
            targetType: 'Applicant',
            targetId: (string) $model->applicant_id,
            onlyRoleNames: ['Admin', 'Super Admin'],
        );

        return response()->json([
            'message' => "{$model->name} has been restricted from recruitment.",
            'data'    => new ApplicantResource($model->fresh()),
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* POST /api/v1/applicants/{applicant}/unblock                         */
    /* Removes an existing recruitment restriction                         */
    /* ------------------------------------------------------------------ */
    public function unblockApplicant(Request $request, int $applicant): JsonResponse
    {
        $user = $request->user();
        if (! $user || ! $user->isSuperAdmin()) {
            return response()->json([
                'message' => 'Only a Super Admin may unblock an applicant.',
            ], 403);
        }

        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        $model = Applicant::findOrFail($applicant);

        if (! $model->is_blocked) {
            return response()->json(['message' => 'This applicant is not blocked.'], 422);
        }

        $actor = $user->full_name ?? $user->username ?? 'Super Admin';
        $reason = trim($validated['reason']);

        $model->update([
            'is_blocked'       => false,
            'blocked_at'       => null,
            'blocked_by'       => null,
            'blocked_reason'   => null,
            'block_scope'      => null,
            'block_expires_at' => null,
        ]);

        ApplicantBlockHistory::create([
            'applicant_id' => $model->applicant_id,
            'action'       => 'unblocked',
            'performed_by' => $actor,
            'reason'       => $reason,
            'scope'        => null,
            'performed_at' => now(),
        ]);

        AuditLogger::log(
            action: 'Applicant Unblocked',
            module: 'Applicant Management',
            severity: 'Info',
            targetType: 'Applicant',
            targetId: (string) $model->applicant_id,
            details: "Removed recruitment restriction for {$model->name} ({$model->applicant_code}). Reason: {$reason}"
        );

        NotificationService::send(
            title: "Applicant Unblocked: {$model->name}",
            body: "Restriction lifted. Reason: {$reason}",
            module: 'Applicant Management',
            type: 'info',
            targetType: 'Applicant',
            targetId: (string) $model->applicant_id,
            onlyRoleNames: ['Admin', 'Super Admin'],
        );

        return response()->json([
            'message' => "Restriction lifted for {$model->name}.",
            'data'    => new ApplicantResource($model->fresh()),
        ]);
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
                $eligibleLabel = $model->rejected_at
                    ? $model->rejected_at->copy()->addDays(DuplicateApplicationService::cooldownDays())->format('M j, Y')
                    : now()->copy()->addDays(DuplicateApplicationService::cooldownDays())->format('M j, Y');
                Mail::to($model->email)->send(new ApplicantRejectedMail(
                    recipientEmail: $model->email,
                    applicantName: $model->name,
                    position: $positionTitle,
                    eligibleAfterLabel: $eligibleLabel
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
