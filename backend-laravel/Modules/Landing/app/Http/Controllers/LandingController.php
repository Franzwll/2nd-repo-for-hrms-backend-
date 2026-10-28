<?php

namespace Modules\Landing\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Applicant;
use App\Models\JobPost;
use App\Models\SystemSetting;
use App\Services\ApplicantRecognitionService;
use App\Services\DuplicateApplicationService;
use App\Services\NlpService;
use App\Services\NotificationService;
use App\Services\ResumeStorage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Modules\ApplicantManagement\Models\Applicant as ManagedApplicant;
use Modules\ApplicantManagement\Models\ApplicantDocument;
use Modules\ApplicantManagement\Services\DocumentVerificationService;
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

    /**
     * Extensions accepted for public landing uploads.
     * NOTE: validated against the CLIENT filename extension, not content
     * sniffing — this PHP build's fileinfo reports valid .docx files as
     * application/octet-stream, so the `mimes:` rule wrongly rejects real
     * Word resumes with a 422. Uploads are temp-stored under random names,
     * size-capped, and actually parsed downstream; a spoofed file only
     * yields "unreadable", never execution.
     */
    public static function allowedUploadExtensions(): array
    {
        return ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'bmp', 'gif', 'tiff', 'tif', 'avif', 'svg', 'txt'];
    }

    /**
     * Validation rule (Closure) accepting the extensions above. Keeps the
     * same error message format the `mimes:` rule produced.
     */
    public static function uploadExtensionRule(): \Closure
    {
        $allowed = self::allowedUploadExtensions();

        return function ($attribute, $value, $fail) use ($allowed) {
            $ext = strtolower($value->getClientOriginalExtension());
            if (! in_array($ext, $allowed, true)) {
                $fail('The ' . $attribute . ' field must be a file of type: ' . implode(', ', $allowed) . '.');
            }
        };
    }

    public function company(): JsonResponse
    {
        $keys = [
            'company',
            'company.name',
            'company.timezone',
            'company.tagline',
            'company.about',
            'company.mission',
            'company.vision',
            'company.values',
            'company.address',
            'company.phone',
            'company.email',
            'company.hours',
            'company.facilities',
            'company.faqs',
            'company.socials',
        ];
        $settings = SystemSetting::whereIn('setting_key', $keys)
            ->pluck('setting_value', 'setting_key')
            ->all();

        $decode = function ($raw) {
            if ($raw === null) {
                return null;
            }
            $decoded = is_string($raw) ? json_decode($raw, true) : $raw;

            return is_array($decoded) && array_key_exists('value', $decoded)
                ? $decoded['value']
                : $decoded;
        };

        // Settings → Company saves ONE `company` blob ({name,email,contact,
        // businessHours,address,tin}), while older readers expect flat
        // `company.*` rows. Read the blob first, then flat rows, then the
        // canonical defaults below so edits in Settings reach the landing page.
        $blob = $decode($settings['company'] ?? null);
        $blob = is_array($blob) ? $blob : [];

        // Values from the original demo seeder. Treat them as "not set" so a
        // stale seed cannot override the real property details.
        $legacy = [
            'Oxford Suites',
            '123 Makati Avenue, Makati City, Metro Manila',
            '+63 2 8999 0000',
            'Monday–Friday · 8:00 AM – 6:00 PM',
        ];

        $clean = function ($value) use ($legacy) {
            if (is_string($value)) {
                $value = trim($value);

                return $value === '' || in_array($value, $legacy, true) ? null : $value;
            }

            return $value === [] ? null : $value;
        };

        $pick = function (array $blobKeys, array $settingKeys, $default) use ($blob, $settings, $decode, $clean) {
            foreach ($blobKeys as $key) {
                $value = $clean($blob[$key] ?? null);
                if ($value !== null) {
                    return $value;
                }
            }
            foreach ($settingKeys as $key) {
                if (! array_key_exists($key, $settings)) {
                    continue;
                }
                $value = $clean($decode($settings[$key]));
                if ($value !== null) {
                    return $value;
                }
            }

            return $default;
        };

        return response()->json([
            'data' => [
                'name' => $pick(['name'], ['company.name'], 'Oxford Suites Makati'),
                'timezone' => $pick(['timezone'], ['company.timezone'], 'Asia/Manila'),
                'tagline' => $pick(
                    ['tagline'],
                    ['company.tagline'],
                    'Boutique hospitality, home to passionate people.'
                ),
                'about' => $pick(
                    ['about', 'overview'],
                    ['company.about'],
                    'Oxford Suites Makati is a premier hotel and restaurant destination in the heart of Makati City, offering elegant accommodations, distinctive dining, and event spaces designed around genuine Filipino hospitality.'
                ),
                'mission' => $pick(
                    ['mission'],
                    ['company.mission'],
                    'To deliver consistently exceptional hotel and dining experiences through empowered people, disciplined service standards, and thoughtful modern systems.'
                ),
                'vision' => $pick(
                    ['vision'],
                    ['company.vision'],
                    'To be the most respected independent hospitality brand in Metro Manila — recognized for warmth, craft, and career growth.'
                ),
                'values' => $pick(['values'], ['company.values'], $this->defaultValues()),
                'address' => $pick(
                    ['address'],
                    ['company.address'],
                    '528 P. Burgos Street, Makati City, Metro Manila, Philippines 1210'
                ),
                'phone' => $pick(['phone', 'contact'], ['company.phone'], '+63 2 8888 8688'),
                'email' => $pick(['email'], ['company.email'], 'hr@oxfordsuites.com.ph'),
                'hours' => $pick(['hours', 'businessHours'], ['company.hours'], '24 Hours'),
                'facilities' => $pick(
                    ['facilities'],
                    ['company.facilities'],
                    $this->defaultFacilities()
                ),
                'faqs' => $pick(['faqs'], ['company.faqs'], $this->defaultFaqs()),
                'socials' => $pick(
                    ['socials'],
                    ['company.socials'],
                    ['Facebook', 'Instagram', 'LinkedIn', 'Indeed']
                ),
            ],
        ]);
    }

    private function defaultValues(): array
    {
        return ['Warmth', 'Craft', 'Integrity', 'Growth'];
    }

    private function defaultFacilities(): array
    {
        return [
            [
                'name' => 'Guest Rooms & Suites',
                'body' => '128 keys across Deluxe, Executive, and Oxford Suite categories with skyline views.',
            ],
            [
                'name' => 'The Oxford Dining Room',
                'body' => 'All-day dining featuring Filipino and continental menus with a live cooking station.',
            ],
            [
                'name' => 'Rooftop Lounge & Bar',
                'body' => 'Signature cocktails, curated pairings, and sunset service above Burgos Street.',
            ],
            [
                'name' => 'Function & Banquet Halls',
                'body' => 'Five configurable venues seating 20 to 300 for weddings, conferences, and socials.',
            ],
            [
                'name' => 'Wellness & Fitness Centre',
                'body' => '24-hour gym, lap pool, and spa treatment rooms for in-house and member guests.',
            ],
            [
                'name' => 'Business Centre',
                'body' => 'Meeting pods, printing, and concierge support for corporate long-stay guests.',
            ],
        ];
    }

    private function defaultFaqs(): array
    {
        return [
            [
                'q' => 'Do I need an account to apply?',
                'category' => 'Applying',
                'a' => 'No. You can browse all vacancies and submit an application with your resume without creating an HRMS account.',
            ],
            [
                'q' => 'What documents should I prepare?',
                'category' => 'Applying',
                'a' => 'Prepare an updated resume and supporting documents that prove your experience or qualifications, such as a certificate of employment, training certificates, and role-specific credentials like TESDA NC II, food handler, or bartending licenses.',
            ],
            [
                'q' => 'How is my resume screened?',
                'category' => 'Screening & interviews',
                'a' => 'Our system uses spaCy-based Natural Language Processing with Named Entity Recognition to extract your skills, experience, education, and certifications, then scores your fit against the role criteria set by HR.',
            ],
            [
                'q' => 'How long does the hiring process take?',
                'category' => 'Screening & interviews',
                'a' => 'Shortlisted applicants are typically contacted within 3–5 working days. The full process — screening, interview, assessment, and background verification — usually takes two to three weeks.',
            ],
            [
                'q' => 'Do you accept applicants with no experience?',
                'category' => 'Eligibility',
                'a' => 'Yes. Several Housekeeping and Food & Beverage roles are open to entry-level applicants, with paid on-the-job training.',
            ],
            [
                'q' => 'Can I apply for more than one position?',
                'category' => 'Applying',
                'a' => 'Yes. If our screening finds you are a stronger match for a different vacancy, our recruiters may also endorse you to that role.',
            ],
            [
                'q' => 'Can I apply if I am a fresh graduate or career shifter?',
                'category' => 'Eligibility',
                'a' => 'Yes. We welcome fresh graduates and career shifters. Several entry-level Housekeeping, Front Office, and Food & Beverage roles include paid on-the-job training.',
            ],
            [
                'q' => 'What happens after I submit my application?',
                'category' => 'Screening & interviews',
                'a' => 'Your resume is screened against the role requirements, then shortlisted applicants are contacted for an interview and practical assessment. You can expect an update within 3-5 working days.',
            ],
            [
                'q' => 'Do you offer part-time, seasonal, or shift-based roles?',
                'category' => 'Working at Oxford',
                'a' => 'Yes. Depending on the department, we hire full-time, part-time, contract, and seasonal teammates. Hotel operations also follow shifting schedules, including weekends and holidays.',
            ],
            [
                'q' => 'What benefits do regular employees receive?',
                'category' => 'Working at Oxford',
                'a' => 'Regular teammates enjoy service charge, meal allowance, HMO coverage after regularization, paid leave, and access to training and certification programs.',
            ],
            [
                'q' => 'Is training provided for entry-level roles?',
                'category' => 'Working at Oxford',
                'a' => 'Yes. New teammates receive department orientation, service-standard training, and paid on-the-job training. We also sponsor TESDA certification for qualified employees.',
            ],
            [
                'q' => 'Where is Oxford Suites Makati, and can I walk in?',
                'category' => 'Applying',
                'a' => 'We are at 528 P. Burgos Street, Makati City. Walk-in applicants are welcome at the HR office during business hours, but applying online is the fastest way to be screened.',
            ],
            [
                'q' => 'How can I follow up on my application?',
                'category' => 'Screening & interviews',
                'a' => 'Reply to the acknowledgment email you receive after applying, or contact HR at hr@oxfordsuites.com.ph with your full name and the role you applied for.',
            ],
        ];
    }

    public function jobs(Request $request): JsonResponse
    {
        $query = JobPost::query()
            ->with(['department', 'position'])
            ->whereIn('status', ['published', 'Open'])
            ->where('active', 1)
            // Hide fully-filled posts from the vacancy list
            ->whereRaw('COALESCE(vacancies, 1) - COALESCE(filled_count, 0) > 0');

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
        if (! $job_post->active || ! in_array($job_post->status, ['published', 'Open']) || $job_post->remainingSlots() <= 0) {
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
        ScreeningService::raiseTimeLimit();

        $request->validate([
            'resume' => ['required', 'file', self::uploadExtensionRule(), 'max:20480'],
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

    /**
     * Public content-based classifier for the isolated accuracy test page
     * (and the future single-dropzone apply flow). Accepts any resume /
     * supporting document and predicts Resume | COE | Certificate |
     * Credential | Others.
     *
     * Three-signal fusion: CONTENT decides; filename is a small hint;
     * is_first (first upload, expected resume slot) is a small +2 resume
     * prior that never overrules strong document phrasing.
     */
    public function classifyDocument(Request $request): JsonResponse
    {
        ScreeningService::raiseTimeLimit();

        $request->validate([
            'file' => ['required', 'file', self::uploadExtensionRule(), 'max:20480'],
            // NOTE: 'boolean' rule rejects the strings FormData sends
            // ("true"/"false"/"1"/"0"), so accept those explicitly and cast below.
            'is_first' => ['sometimes', 'in:true,false,1,0,yes,no,on,off'],
        ]);

        $isFirst = filter_var($request->input('is_first', false), FILTER_VALIDATE_BOOLEAN);
        $originalName = $request->file('file')->getClientOriginalName() ?: 'document';
        $storedPath = $request->file('file')->store('classify-tmp', 'local');
        try {
            $fullPath = Storage::disk('local')->path($storedPath);
            $result = $this->nlp->classifyDocument($fullPath, $originalName, $isFirst);
        } finally {
            if (Storage::disk('local')->exists($storedPath)) {
                Storage::disk('local')->delete($storedPath);
            }
        }

        if (! ($result['ok'] ?? false)) {
            return response()->json([
                'success' => false,
                'error_message' => $result['error'] ?? 'Document classification failed.',
            ], 502);
        }

        return response()->json(array_merge(['success' => true], $result['data'] ?? []));
    }

    public function apply(JobApplicationRequest $request): JsonResponse    {
        ScreeningService::raiseTimeLimit();

        $jobPost = JobPost::find($request->integer('job_post_id'));

        if (! $jobPost || ! $jobPost->active || ! in_array($jobPost->status, ['published', 'Open']) || $jobPost->remainingSlots() <= 0) {
            return response()->json(['message' => 'This position is no longer accepting applications. All slots have been filled.'], 422);
        }

        // Block check first: recognized applicant restricted from recruitment
        $block = ApplicantRecognitionService::findBlock(
            (string) $request->string('email'),
            (string) $request->string('name'),
            $request->filled('phone') ? (string) $request->string('phone') : null,
            $request->filled('address') ? (string) $request->string('address') : null,
            (int) $jobPost->job_post_id
        );
        if ($block) {
            return response()->json(
                DuplicateApplicationService::blockResponse($block),
                403
            );
        }

        // Failed-applicant cooldown: recognized applicant blocked from ANY job inside waiting window
        $cooldown = ApplicantRecognitionService::findCooldown(
            (string) $request->string('email'),
            (string) $request->string('name'),
            $request->filled('phone') ? (string) $request->string('phone') : null,
            $request->filled('address') ? (string) $request->string('address') : null
        );
        if ($cooldown) {
            return response()->json(
                DuplicateApplicationService::cooldownResponse($cooldown),
                409
            );
        }

        // Scoped duplicate guard: recognized applicant + same job + active stage only.
        $existing = ApplicantRecognitionService::findDuplicate(
            (string) $request->string('email'),
            (int) $jobPost->job_post_id,
            (string) $request->string('name'),
            $request->filled('phone') ? (string) $request->string('phone') : null,
            $request->filled('address') ? (string) $request->string('address') : null
        );
        if ($existing) {
            return response()->json(
                DuplicateApplicationService::duplicateResponse($existing, (string) $jobPost->title),
                409
            );
        }

        $payload = [
            'applicant_code' => $this->nextApplicantCode(),
            'job_post_id' => $jobPost->job_post_id,
            'name' => $request->string('name'),
            'email' => $request->string('email'),
            'phone' => $request->string('phone'),
            'address' => $request->filled('address') ? $request->string('address') : null,
            'applied_at' => now(),
            'status' => 'fit',
            'stage' => 'Screened',
            'source' => $request->string('source', 'Landing Page'),
            'summary' => $request->string('summary'),
        ];

        // Store the resume — mandatory for every public application (see
        // JobApplicationRequest) and the reference the NLP screening scores
        // against. Same allow-list as Recruitment Management (add applicant).
        // Content hash is stored for audit; it is NOT used to block (filename/hash
        // alone must never trigger a duplicate — only email+job+active stage does).
        if ($request->hasFile('resume')) {
            $payload['resume_hash'] = DuplicateApplicationService::hashFile($request->file('resume'));
            // Preserve the real extension from the original client filename.
            // store()/'guessExtension()' derives it from the MIME type, which
            // returns ".bin" for common formats (e.g. .docx), breaking the NLP
            // screening that keys off the stored file name.
            $payload['resume_file_path'] = ResumeStorage::store($request->file('resume'));
            $payload['resume_original_name'] = $request->file('resume')->getClientOriginalName();
        }

        $applicant = Applicant::create($payload);

        // Persist supporting docs from the unified 1-box uploader
        // (recognized COE / Certificate / Credential / Others). Same flow as
        // Recruitment Management post-save: store + auto-verify each file.
        // Defensive slice to 20: validation caps the array, but if more ever
        // slip through the applicant must still save with the first 20 kept.
        $rawDocs = $request->file('verification_docs', []);
        $docFiles = array_slice(array_values(is_array($rawDocs) ? $rawDocs : [$rawDocs]), 0, 20);
        $docTypes = $request->input('verification_doc_types', []);
        if (! is_array($docTypes)) {
            $docTypes = [$docTypes];
        }
        $allowedTypes = ['COE', 'Certificate', 'Credential', 'Others'];
        foreach ($docFiles as $i => $docFile) {
            if (! $docFile instanceof \Illuminate\Http\UploadedFile || ! $docFile->isValid()) {
                continue;
            }
            $docType = (string) ($docTypes[$i] ?? 'Others');
            if (! in_array($docType, $allowedTypes, true)) {
                $docType = 'Others';
            }
            try {
                $docPath = $docFile->store('applicant-documents', 'public');
                $document = ApplicantDocument::create([
                    'applicant_id' => $applicant->applicant_id,
                    'doc_type' => $docType,
                    'title' => $docFile->getClientOriginalName() ?: 'document',
                    'original_copy' => false,
                    'file_path' => $docPath,
                    'original_name' => $docFile->getClientOriginalName(),
                ]);
                app(DocumentVerificationService::class)->verifyDocument($document);
            } catch (\Throwable $docErr) {
                \Illuminate\Support\Facades\Log::warning(
                    'Landing apply document persist failed for applicant '.$applicant->applicant_id.': '.$docErr->getMessage()
                );
            }
        }

        // Run spaCy NLP screening on the (now mandatory) resume — same pipeline
        // as Recruitment Management.
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

        // Notify HR: public landing applies don't pass through the
        // authenticated observer, so ring HR Admins directly (helpful-only).
        NotificationService::send(
            title: "New applicant from Landing: {$applicant->name}",
            body: "Applied for {$jobPost->title} via Landing Page with screening score " . ($applicant->fit_score ?? 0) . "%.",
            module: 'Applicant Management',
            type: 'info',
            targetType: 'Applicant',
            targetId: (string) $applicant->applicant_id,
            onlyRoleNames: ['Admin', 'Super Admin']
        );

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
                $maxId = (int) DB::table('applicants')->max('applicant_id');
                $candidateNumber = max(1, $maxId + 1);

                do {
                    $code = 'APP-' . str_pad((string) $candidateNumber, 5, '0', STR_PAD_LEFT);
                    $candidateNumber++;
                } while (Applicant::where('applicant_code', $code)->exists());

                return $code;
            } finally {
                DB::selectOne('SELECT RELEASE_LOCK(?)', ['applicant_code_gen']);
            }
        });
    }
}