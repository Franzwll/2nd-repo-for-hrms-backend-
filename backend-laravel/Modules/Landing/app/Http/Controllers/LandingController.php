<?php

namespace Modules\Landing\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Applicant;
use App\Models\JobPost;
use App\Models\SystemSetting;
use App\Services\NlpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Modules\ApplicantManagement\Models\Applicant as ManagedApplicant;
use Modules\ApplicantManagement\Services\ScreeningService;
use Modules\Landing\Http\Requests\JobApplicationRequest;
use Modules\Landing\Http\Resources\AnnouncementResource;
use Modules\Landing\Http\Resources\JobPostResource;

class LandingController extends Controller
{
    public function __construct(
        protected NlpService $nlp,
        protected ScreeningService $screening
    ) {
    }
    public function company(): JsonResponse
    {
        $keys = [
            'company.name',
            'company.timezone',
            'company.address',
            'company.phone',
            'company.email',
            'company.hours',
            'company.facilities',
            'company.faqs',
            'company.socials',
        ];
        $settings = SystemSetting::whereIn('setting_key', $keys)
            ->pluck('setting_value', 'setting_key');

        $decode = fn ($value) => json_decode($value, true);
        $value = fn (string $key, mixed $default) => $decode($settings[$key] ?? null)['value'] ?? $default;

        return response()->json([
            'data' => [
                'name' => $value('company.name', 'Oxford Suites Makati'),
                'timezone' => $value('company.timezone', 'Asia/Manila'),
                'tagline' => 'Boutique hospitality, home to passionate people.',
                'about' => 'Oxford Suites Makati is a boutique hotel delivering warm Filipino hospitality in the heart of Makati. We invest in our people because they are the heart of every guest experience.',
                'mission' => 'To provide outstanding service and create memorable experiences for every guest, while nurturing a workplace where every employee can grow and thrive.',
                'vision' => 'To be the preferred boutique hotel in the Philippines, known for genuine care, consistency, and an engaged, empowered workforce.',
                'values' => ['Care', 'Integrity', 'Excellence', 'Teamwork', 'Hospitality'],
                'address' => $value('company.address', '528 P. Burgos Street, Makati City, Metro Manila, Philippines 1210'),
                'phone' => $value('company.phone', '+63 2 8888 8688'),
                'email' => $value('company.email', 'hr@oxfordsuites.com.ph'),
                'hours' => $value('company.hours', '24 Hours'),
                'facilities' => $value('company.facilities', []),
                'faqs' => $value('company.faqs', []),
                'socials' => $value('company.socials', []),
            ],
        ]);
    }

    public function jobs(Request $request): JsonResponse
    {
        $query = JobPost::query()
            ->with(['department', 'position'])
            ->whereIn('status', ['published', 'Open'])
            ->where('active', 1);

        if ($request->filled('department_id')) {
            $query->where('department_id', $request->integer('department_id'));
        }

        if ($request->filled('q')) {
            $search = $request->string('q');

            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('summary', 'like', "%{$search}%")
                    ->orWhereHas('department', fn ($d) => $d->where('name', 'like', "%{$search}%"));
            });
        }

        $jobs = $query->orderByDesc('posted_date')->paginate($request->integer('per_page', 25));

        return response()->json([
            'data' => JobPostResource::collection($jobs),
            'meta' => [
                'current_page' => $jobs->currentPage(),
                'last_page' => $jobs->lastPage(),
                'per_page' => $jobs->perPage(),
                'total' => $jobs->total(),
            ],
        ]);
    }

    public function job(JobPost $job_post): JsonResponse
    {
        if (! $job_post->active || ! in_array($job_post->status, ['published', 'Open'])) {
            abort(404);
        }

        $job_post->load('department', 'position');

        return response()->json([
            'data' => new JobPostResource($job_post),
        ]);
    }

    public function announcements(Request $request): JsonResponse
    {
        $query = Announcement::query()
            ->where('status', 'published')
            ->where(function ($q) {
                $q->where('audience', 'All')->orWhere('audience', 'Public');
            });

        $announcements = $query->orderByDesc('published_date')
            ->paginate($request->integer('per_page', 10));

        return response()->json([
            'data' => AnnouncementResource::collection($announcements),
            'meta' => [
                'current_page' => $announcements->currentPage(),
                'last_page' => $announcements->lastPage(),
                'per_page' => $announcements->perPage(),
                'total' => $announcements->total(),
            ],
        ]);
    }

    /**
     * Lightweight public resume extraction for the landing apply form.
     * Only returns full name, email, phone, location (address) for auto-fill.
     * Supports same file types as Recruitment Management add applicant (OCR for images).
     */
    public function extractResume(Request $request): JsonResponse
    {
        $request->validate([
            'resume' => ['required', 'file', 'mimes:pdf,doc,docx,jpg,jpeg,png,webp,heic,heif,bmp,gif,tiff,tif,avif,svg', 'max:20480'],
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

        // Only expose the 4 fields required for auto-fill
        return response()->json([
            'success' => true,
            'personal_information' => [
                'name' => $personal['name'] ?? null,
                'email' => $personal['email'] ?? null,
                'phone' => $personal['phone'] ?? null,
                'address' => $personal['address'] ?? null,
            ],
        ]);
    }

    public function apply(JobApplicationRequest $request): JsonResponse
    {
        $jobPost = JobPost::find($request->integer('job_post_id'));

        if (! $jobPost || ! $jobPost->active || ! in_array($jobPost->status, ['published', 'Open'])) {
            return response()->json(['message' => 'This position is no longer accepting applications.'], 422);
        }

        $payload = [
            'applicant_code' => $this->nextApplicantCode(),
            'job_post_id' => $jobPost->job_post_id,
            'name' => $request->string('name'),
            'email' => $request->string('email'),
            'phone' => $request->string('phone'),
            'applied_at' => now(),
            'status' => 'fit',
            'stage' => 'Screened',
            'source' => $request->string('source', 'Landing Page'),
            'summary' => $request->string('summary'),
        ];

        // Store resume file if provided — same allow-list as Recruitment Management (add applicant)
        if ($request->hasFile('resume')) {
            $path = $request->file('resume')->store('resumes', 'public');
            $payload['resume_file_path'] = $path;
            $payload['resume_original_name'] = $request->file('resume')->getClientOriginalName();
        }

        $applicant = Applicant::create($payload);

        // Run spaCy NLP screening when a resume is present — same pipeline as Recruitment Management
        if (! empty($payload['resume_file_path'])) {
            try {
                $managed = ManagedApplicant::find($applicant->applicant_id);
                if ($managed) {
                    $this->screening->screenAndPersist($managed);
                    $applicant->refresh();
                }
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('Landing apply screening failed for applicant '.$applicant->applicant_id.': '.$e->getMessage());
                // keep applicant even if screening fails
            }
        }

        return response()->json([
            'message' => 'Application received. Our recruitment team will reach out soon.',
            'data' => [
                'applicant_id' => $applicant->applicant_id,
                'applicant_code' => $applicant->applicant_code,
                'job_title' => $jobPost->title,
            ],
        ], 201);
    }

    private function nextApplicantCode(): string
    {
        return DB::transaction(function () {
            DB::selectOne('SELECT GET_LOCK(?, 5)', ['applicant_code_gen']);
            try {
                $last = Applicant::max('applicant_code');
                $next = $last ? ((int) substr($last, 4)) + 1 : 1;

                return 'APP-' . str_pad((string) $next, 5, '0', STR_PAD_LEFT);
            } finally {
                DB::selectOne('SELECT RELEASE_LOCK(?)', ['applicant_code_gen']);
            }
        });
    }
}