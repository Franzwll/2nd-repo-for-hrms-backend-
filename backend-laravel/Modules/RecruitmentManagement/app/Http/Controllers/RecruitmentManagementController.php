<?php

namespace Modules\RecruitmentManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\AuditLogger;
use App\Services\JobContentGenerator;
use App\Services\PosterTextMetrics;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Modules\RecruitmentManagement\Http\Requests\StoreJobPostRequest;
use Modules\RecruitmentManagement\Http\Requests\UpdateJobPostRequest;
use Modules\RecruitmentManagement\Http\Resources\JobPostResource;
use Modules\RecruitmentManagement\Models\JobPost;
use Modules\RecruitmentManagement\Models\JobPostPlatform;

class RecruitmentManagementController extends Controller
{
    /**
     * GET /api/v1/job-posts/template-picture?title=...
     *
     * Hiring poster with the position name burned into it.
     *
     * storage/jobpost_picture/template.png is a design file: it still carries the
     * dashed 3-row guide box (verticals x 77 and 525, rules at y 535 / 588 / 642 /
     * 695) the designer drew to show where the position text belongs. That guide
     * must never reach the public page, so the poster is re-composed as SVG: a white
     * sheet covers the guide box and the title is drawn on the first row, auto-shrunk
     * so it always stops before the building photo (x ≈ 537) - exactly like
     * storage/jobpost_picture/sample.png.
     */
    public function templatePicture()
    {
        return $this->posterResponse((string) request()->query('title', 'Position'));
    }

    /** Compose the hiring poster for one position title. */
    private function posterResponse(string $title): Response
    {
        $path = storage_path('jobpost_picture/template.png');
        abort_unless(is_file($path), 404);

        $imageData = base64_encode((string) file_get_contents($path));

        $sheet = [70, 525, 460, 175];   // covers every guide line of the template
        $textX = 76;                    // sample.png headline starts at x 77, tick badge ends at 62
        $maxTextWidth = 455;            // the building photo starts around x = 537
        $baseline = 579;                // sample.png baseline of the 60px reference headline

        $lines = [$title = $this->posterTitle($title)];
        $fontSize = PosterTextMetrics::fitFontSize($title, $maxTextWidth, 60, 26);

        // Freakishly long titles: two balanced rows, both shrunk to the same size.
        if (PosterTextMetrics::width($title, 26) > $maxTextWidth) {
            $lines = PosterTextMetrics::splitBalanced($title);
            $fontSize = count($lines) > 1
                ? min(array_map(
                    fn (string $line) => PosterTextMetrics::fitFontSize($line, $maxTextWidth, 40, 18),
                    $lines,
                ))
                : 26;
            $lines = array_map(
                fn (string $line) => PosterTextMetrics::truncate($line, $maxTextWidth, $fontSize),
                $lines,
            );
        }

        $svg = '<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">'
            . '<image href="data:image/png;base64,' . $imageData . '" width="1080" height="1080"/>'
            . '<rect x="' . $sheet[0] . '" y="' . $sheet[1] . '" width="' . $sheet[2] . '" height="' . $sheet[3] . '" fill="white"/>'
            . $this->posterHeadline($lines, $fontSize, $textX, $baseline)
            . '</svg>';

        return response($svg, 200, ['Content-Type' => 'image/svg+xml; charset=UTF-8', 'Cache-Control' => 'no-store']);
    }

    /**
     * Poster headline, kept in the casing the recruiter typed (sample.png does).
     * Returns plain text: measured first, xml-escaped only when it reaches the SVG.
     */
    private function posterTitle(string $title): string
    {
        $title = trim((string) preg_replace('/\s+/u', ' ', $title));

        // Only touch titles that carry no capital letter at all ("front desk").
        if ($title !== '' && ! preg_match('/[A-Z]/', $title)) {
            $title = ucwords($title);
        }

        return $title !== '' ? $title : 'Position';
    }

    /**
     * The <text> node: one row sitting on the reference baseline, or two rows centred
     * on the first two guide rows when the title had to be split.
     *
     * @param  array<int, string>  $lines
     * @param  int  $baseline  sample.png baseline, valid for the 60px reference headline
     */
    private function posterHeadline(array $lines, int $fontSize, int $textX, int $baseline): string
    {
        $halfCap = (int) round($fontSize * 0.358); // half of Arial's 0.716 em cap height

        $baselines = count($lines) > 1
            ? [562 + $halfCap, 615 + $halfCap]                        // centres of guide rows 1 and 2
            : [$baseline + (int) round(($fontSize - 60) * 0.358)];    // stays optically centred

        $spans = '';
        foreach (array_values($lines) as $index => $line) {
            $spans .= '<tspan x="' . $textX . '" dy="' . ($index === 0 ? 0 : $baselines[$index] - $baselines[0]) . '">'
                . htmlspecialchars($line, ENT_XML1, 'UTF-8') . '</tspan>';
        }

        return '<text x="' . $textX . '" y="' . $baselines[0] . '" font-family="Arial, Helvetica, sans-serif"'
            . ' font-size="' . $fontSize . '" font-weight="700" fill="#000000">' . $spans . '</text>';
    }

    /* ------------------------------------------------------------------ */
    /* GET /api/v1/job-posts */
    /* ------------------------------------------------------------------ */

    public function index(Request $request): JsonResponse
    {
        $query = JobPost::with(['department', 'platforms', 'applicants'])
            ->orderByDesc('created_at');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhereHas('department', fn ($d) => $d->where('name', 'like', "%{$search}%"));
            });
        }
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        if ($deptId = $request->query('department_id')) {
            $query->where('department_id', $deptId);
        }
        // date range: '7', '30', '90', 'year'
        if ($dateRange = $request->query('date_range')) {
            $cutoff = match ($dateRange) {
                '7' => now()->subDays(7),
                '30' => now()->subDays(30),
                '90' => now()->subDays(90),
                'year' => now()->startOfYear(),
                default => null,
            };
            if ($cutoff) {
                $query->where('posted_date', '>=', $cutoff->toDateString());
            }
        }

        $perPage = (int) $request->query('per_page', 15);
        $paginated = $query->paginate($perPage);

        return response()->json([
            'data' => JobPostResource::collection($paginated->items()),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* POST /api/v1/job-posts */
    /* ------------------------------------------------------------------ */

    public function store(StoreJobPostRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Dismissible duplicate warning: same position already has an active/open post.
        // Frontend shows "Warning — View existing / Create anyway (force_create=true)".
        if (! $request->boolean('force_create') && ! empty($data['position_id'])) {
            $dup = JobPost::where('position_id', $data['position_id'])
                ->where('active', 1)
                ->whereIn('status', ['published', 'Open'])
                ->first(['job_post_id', 'title']);
            if ($dup) {
                return response()->json([
                    'code' => 'DUPLICATE_JOB_POST',
                    'message' => "An active job post already exists for this position ({$dup->title}).",
                    'existing_job_post_id' => $dup->job_post_id,
                ], 409);
            }
        }

        // title and slug are derived from the linked position by the JobPost model
        $data['responsibilities_json'] = $data['responsibilities'] ?? [];
        $data['qualifications_json'] = $data['qualifications'] ?? [];
        $data['skills_json'] = $data['skills'] ?? [];
        $data['posted_date'] = $data['posted_date'] ?? now()->toDateString();

        $platforms = $data['platforms'] ?? [];
        unset($data['responsibilities'], $data['qualifications'], $data['skills'], $data['platforms']);

        // Handle poster picture upload
        if ($request->hasFile('picture')) {
            $data['picture'] = $request->file('picture')->store('job-post-pictures', 'public');
        }
        unset($data['picture_file']);

        $jobPost = JobPost::create($data);

        AuditLogger::log(
            action: 'Job Post Created',
            module: 'Recruitment Management',
            targetType: 'Job Post',
            targetId: (string) $jobPost->job_post_id,
            details: "Created job post '{$jobPost->title}'.",
        );

        // Write platform rows
        $this->syncPlatforms($jobPost, $platforms);

        return response()->json(
            new JobPostResource($jobPost->load(['department', 'platforms'])),
            201
        );
    }

    /* ------------------------------------------------------------------ */
    /* GET /api/v1/job-posts/{job_post} */
    /* ------------------------------------------------------------------ */

    public function show(int $job_post): JsonResponse
    {
        $model = JobPost::with(['department', 'platforms', 'applicants'])->findOrFail($job_post);

        return response()->json(new JobPostResource($model));
    }

    /** Serve legacy and current poster locations through one stable URL. */
    public function picture(int $job_post)
    {
        $model = JobPost::findOrFail($job_post);
        $storedPath = trim((string) $model->picture, '/');
        abort_if($storedPath === '', 404);

        $relativePath = preg_replace('#^(storage/|public/)#', '', $storedPath);
        $fileName = basename($relativePath ?: $storedPath);
        $candidates = [
            $storedPath,
            storage_path('app/public/' . $relativePath),
            storage_path('app/' . $relativePath),
            storage_path('jobpost_picture/' . $fileName),
            public_path('storage/' . $relativePath),
            public_path($relativePath),
            base_path('../' . $relativePath),
        ];

        $designTemplate = realpath(storage_path('jobpost_picture/template.png'));

        foreach ($candidates as $candidate) {
            $realCandidate = realpath($candidate);
            if ($realCandidate && is_file($realCandidate)) {
                // A post pointed at the bundled design file would serve the dashed
                // guide box to the career page - hand back the composed poster instead.
                if ($designTemplate && $realCandidate === $designTemplate) {
                    return $this->posterResponse($model->title);
                }

                return response()->file($realCandidate);
            }
        }

        abort(404);
    }

    /* ------------------------------------------------------------------ */
    /* PUT /api/v1/job-posts/{job_post} */
    /* ------------------------------------------------------------------ */

    public function update(UpdateJobPostRequest $request, int $job_post): JsonResponse
    {
        $model = JobPost::findOrFail($job_post);
        $data = $request->validated();

        if (isset($data['responsibilities'])) {
            $data['responsibilities_json'] = $data['responsibilities'];
            unset($data['responsibilities']);
        }
        if (isset($data['qualifications'])) {
            $data['qualifications_json'] = $data['qualifications'];
            unset($data['qualifications']);
        }
        if (isset($data['skills'])) {
            $data['skills_json'] = $data['skills'];
            unset($data['skills']);
        }
        $platforms = $data['platforms'] ?? null;
        unset($data['platforms']);

        // Handle poster picture replacement
        if ($request->hasFile('picture')) {
            if ($model->picture && Storage::disk('public')->exists($model->picture)) {
                Storage::disk('public')->delete($model->picture);
            }
            $data['picture'] = $request->file('picture')->store('job-post-pictures', 'public');
        }
        unset($data['picture_file']);

        $model->update($data);

        if ($platforms !== null) {
            $this->syncPlatforms($model, $platforms);
        }

        AuditLogger::log(
            action: 'Job Post Updated',
            module: 'Recruitment Management',
            targetType: 'Job Post',
            targetId: (string) $model->job_post_id,
            details: "Updated job post '{$model->title}' (status: {$model->status}).",
        );

        return response()->json(new JobPostResource($model->load(['department', 'platforms'])));
    }

    /* ------------------------------------------------------------------ */
    /* DELETE /api/v1/job-posts/{job_post} */
    /* ------------------------------------------------------------------ */

    public function destroy(int $job_post): JsonResponse
    {
        $model = JobPost::findOrFail($job_post);

        // Clean up poster picture
        if ($model->picture && Storage::disk('public')->exists($model->picture)) {
            Storage::disk('public')->delete($model->picture);
        }

        $model->delete();

        AuditLogger::log(
            action: 'Job Post Deleted',
            module: 'Recruitment Management',
            severity: 'Warning',
            targetType: 'Job Post',
            targetId: (string) $job_post,
            details: "Deleted job post '{$model->title}'.",
        );

        return response()->json(['message' => 'Job post deleted.']);
    }

    /* ------------------------------------------------------------------ */
    /* PATCH /api/v1/job-posts/{job_post}/toggle */
    /* Flip active flag; also updates status (Open <-> Closed) */
    /* ------------------------------------------------------------------ */

    public function toggleActive(int $job_post): JsonResponse
    {
        $model = JobPost::findOrFail($job_post);
        $newActive = ! $model->active;
        $model->update([
            'active' => $newActive,
            'status' => $newActive ? 'Open' : 'Closed',
        ]);

        return response()->json(new JobPostResource($model->load(['department', 'platforms'])));
    }

    /* ------------------------------------------------------------------ */
    /* POST /api/v1/job-posts/{job_post}/publish */
    /* Set status=Open and persist platform choices */
    /* ------------------------------------------------------------------ */

    public function publish(Request $request, int $job_post): JsonResponse
    {
        $model = JobPost::findOrFail($job_post);

        $data = $request->validate([
            'platforms' => ['required', 'array', 'min:1'],
            'platforms.*' => ['string', 'in:Website,Facebook,Instagram,Indeed'],
        ]);

        $model->update([
            'status' => 'Open',
            'active' => true,
            'posted_date' => $model->posted_date ?? now()->toDateString(),
        ]);

        $this->syncPlatforms($model, $data['platforms']);

        return response()->json(new JobPostResource($model->load(['department', 'platforms'])));
    }

    /* ------------------------------------------------------------------ */
    /* POST /api/v1/job-posts/generate-draft                               */
    /* One-click AI draft for the Job Post Builder (vocab-grounded).       */
    /* Nothing is saved — the frontend fills the 6 builder blocks and HR   */
    /* reviews before Save draft / Publish.                                */
    /* ------------------------------------------------------------------ */

    public function generateDraft(Request $request, JobContentGenerator $generator): JsonResponse
    {
        $validated = $request->validate([
            'position_title' => ['required', 'string', 'max:150'],
            'department' => ['nullable', 'string', 'max:150'],
            'employment_type' => ['nullable', 'string', 'in:Full-time,Part-time,Contract,Seasonal'],
            'schedule' => ['nullable', 'string', 'max:120'],
            'vacancies' => ['nullable', 'integer', 'min:1', 'max:500'],
            'experience_level' => ['nullable', 'string', 'max:60'],
            'education_level' => ['nullable', 'string', 'max:60'],
        ]);

        if (! $generator->isConfigured()) {
            return response()->json([
                'message' => 'The AI generator is not configured. Set GEMINI_API_KEY (or OPENROUTER_API_KEY) on the API server.',
            ], 422);
        }

        // Screening vocabulary — the same terms applicant screening scores
        // against. Falls back to empty lists when the table is unavailable.
        $skillsMap = [];
        $certsMap = [];
        try {
            if (class_exists(\Modules\ApplicantManagement\Models\ScreeningReferenceData::class)) {
                $skillsMap = \Modules\ApplicantManagement\Models\ScreeningReferenceData::mappingFor('skill');
                $certsMap = \Modules\ApplicantManagement\Models\ScreeningReferenceData::mappingFor('certification');
            }
        } catch (\Throwable) {
            $skillsMap = [];
            $certsMap = [];
        }

        $vocabulary = [
            'skills' => array_keys($skillsMap),
            'certifications' => array_keys($certsMap),
        ];

        $result = $generator->generate([
            'position_title' => $validated['position_title'],
            'department' => $validated['department'] ?? null,
            'employment_type' => $validated['employment_type'] ?? 'Full-time',
            'schedule' => $validated['schedule'] ?? 'Shifting Schedule',
            'vacancies' => $validated['vacancies'] ?? 1,
            'experience_level' => $validated['experience_level'] ?? null,
            'education_level' => $validated['education_level'] ?? null,
        ], $vocabulary);

        if (! $result['ok']) {
            $code = (string) ($result['code'] ?? 'provider');
            $retryAfter = $result['retry_after_seconds'] ?? null;

            // Usage/limit failures answer 429 so the frontend can show the
            // indicator countdown; everything else stays a provider error.
            $status = in_array($code, JobContentGenerator::LIMIT_CODES, true) ? 429 : 502;

            AuditLogger::log(
                action: 'AI Draft Failed',
                module: 'Recruitment Management',
                severity: 'Warning',
                targetType: 'Job Post Draft',
                targetId: $validated['position_title'],
                details: "AI draft for '{$validated['position_title']}' failed ({$code}): "
                    . Str::limit((string) ($result['error'] ?? 'Generation failed.'), 300),
            );

            return response()->json([
                'message' => $result['error'] ?? 'Generation failed.',
                'code' => $code,
                'retry_after_seconds' => $retryAfter,
                'resets_at' => $result['resets_at'] ?? null,
                'usage' => $result['usage'] ?? $generator->usageSnapshot(),
            ], $status);
        }

        $data = $result['data'];

        // House fallbacks so instructions/about are never blank.
        if (trim((string) ($data['instructions'] ?? '')) === '') {
            $data['instructions'] = 'Interested applicants may send their updated resume through this posting or walk-in for an interview at the HR Office, Oxford Suites Makati.';
        }
        if (trim((string) ($data['about'] ?? '')) === '') {
            $data['about'] = 'Oxford Suites Makati is a premier all-suite hotel in the heart of Makati\'s business district, known for warm Filipino hospitality and dependable service.';
        }

        // Vocab grounding report: which generated skills already exist in the
        // screening vocabulary vs. which are new (one-click-add candidates).
        $known = [];
        foreach ($skillsMap as $canonical => $aliases) {
            $known[mb_strtolower(trim((string) $canonical))] = true;
            foreach ((array) $aliases as $alias) {
                $known[mb_strtolower(trim((string) $alias))] = true;
            }
        }
        $matched = [];
        $fresh = [];
        foreach ((array) ($data['skills'] ?? []) as $skill) {
            $key = mb_strtolower(trim((string) $skill));
            if ($key !== '' && isset($known[$key])) {
                $matched[] = $skill;
            } elseif ($key !== '') {
                $fresh[] = $skill;
            }
        }

        AuditLogger::log(
            action: 'Job Draft Generated',
            module: 'Recruitment Management',
            targetType: 'Job Post Draft',
            targetId: $validated['position_title'],
            details: "AI draft generated for '{$validated['position_title']}' (" . count($matched) . ' vocab skills matched, ' . count($fresh) . ' new) via ' . ($result['via']['service'] ?? 'AI service') . '.',
        );

        return response()->json([
            'success' => true,
            'data' => $data,
            'meta' => [
                'model' => $generator->modelName(),
                'generated_via' => $result['via'] ?? null,
                'vocabulary' => [
                    'skills_count' => count($vocabulary['skills']),
                    'certifications_count' => count($vocabulary['certifications']),
                ],
                'skills_matched' => array_values($matched),
                'skills_new' => array_values($fresh),
                // Usage/limit state after this generation — drives the builder's
                // AI usage indicator without a second request.
                'usage' => $result['usage'] ?? $generator->usageSnapshot(),
            ],
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* GET /api/v1/job-posts/ai-usage                                      */
    /* AI usage/limit snapshot for the builder's "Generate with AI"        */
    /* indicator: config state, providers, drafts used today, cool-downs.  */
    /* ------------------------------------------------------------------ */

    public function aiUsage(JobContentGenerator $generator): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $generator->usageSnapshot(),
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* GET /api/v1/job-posts/stats */
    /* ------------------------------------------------------------------ */

    public function stats(): JsonResponse
    {
        return response()->json([
            'total' => JobPost::count(),
            'open' => JobPost::where('status', 'Open')->count(),
            'draft' => JobPost::where('status', 'Draft')->count(),
            'closed' => JobPost::where('status', 'Closed')->count(),
            'total_vacancies' => (int) JobPost::sum('vacancies'),
            'total_filled' => (int) JobPost::sum('filled_count'),
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* Private helpers */
    /* ------------------------------------------------------------------ */

    private function syncPlatforms(JobPost $jobPost, array $platforms): void
    {
        // Unpublish removed platforms
        JobPostPlatform::where('job_post_id', $jobPost->job_post_id)
            ->whereNotIn('platform', $platforms)
            ->update(['status' => 'unpublished']);

        // Upsert active platforms
        foreach ($platforms as $platform) {
            JobPostPlatform::updateOrCreate(
                ['job_post_id' => $jobPost->job_post_id, 'platform' => $platform],
                ['status' => 'published', 'published_at' => now()]
            );
        }
    }
}
