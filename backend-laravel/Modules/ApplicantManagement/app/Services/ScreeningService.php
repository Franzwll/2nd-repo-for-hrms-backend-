<?php

namespace Modules\ApplicantManagement\Services;

use App\Services\NlpService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Modules\ApplicantManagement\Http\Controllers\ScreeningReferenceController;
use Modules\ApplicantManagement\Models\Applicant;
use Modules\ApplicantManagement\Models\ApplicantScreeningEntity;
use Modules\ApplicantManagement\Models\ApplicantScreeningScore;
use Modules\ApplicantManagement\Models\ApplicantScreening;
use Modules\RecruitmentManagement\Models\JobPost;

class ScreeningService
{
    /**
     * Official screening result -> applicants.status mapping.
     * The four official statuses are stored in the existing status CHECK domain.
     */
    public const STATUS_MAP = [
        'PERFECT_FOR_THE_JOB' => 'fit',
        'INVALID_CREDENTIAL' => 'credential',
        'FIT_FOR_OTHER_JOB' => 'other-role',
        'NOT_FITTED_TO_JOB' => 'not-fit',
    ];

    public const OFFICIAL_LABELS = [
        'fit' => 'Perfect for the Job',
        'credential' => 'Invalid Credential',
        'other-role' => 'Fit for Other Job',
        'not-fit' => 'Not Fitted to Job',
    ];

    public function __construct(protected NlpService $nlp)
    {
    }

    /* ------------------------------------------------------------------ */
    /* Requirements built from existing job_posts fields                   */
    /* ------------------------------------------------------------------ */

    public function buildRequirements(JobPost $jobPost): array
    {
        return [
            'job_post_id' => (int) $jobPost->job_post_id,
            'title' => $jobPost->title,
            'required_skills' => $this->normalizeStringList($jobPost->skills_json),
            'preferred_skills' => [],
            'education_level' => $jobPost->education_level,
            'experience_level' => $jobPost->experience_level,
            'required_certifications' => $this->extractRequiredCertifications($jobPost->qualifications_json),
            'required_information' => ['name', 'email', 'phone'],
        ];
    }

    /** All other currently open job posts expressed in the same requirement shape.
     * Posts with no defined criteria at all are excluded: with nothing to match
     * against they would trivially score 100% and pollute recommendations. */
    public function buildOpenJobs(?JobPost $exclude = null): array
    {
        return JobPost::where('active', 1)
            ->where('status', 'Open')
            ->when($exclude, fn ($q) => $q->where('job_post_id', '!=', $exclude->job_post_id))
            ->get()
            ->map(fn (JobPost $post) => $this->buildRequirements($post))
            ->filter(function (array $requirements) {
                return ($requirements['required_skills'] ?? []) !== []
                    || ($requirements['required_certifications'] ?? []) !== []
                    || filled($requirements['education_level'] ?? null)
                    || filled($requirements['experience_level'] ?? null);
            })
            ->values()
            ->all();
    }

    /**
     * Pulls certification-like requirements out of free-text qualification strings,
     * e.g. "TESDA NC II in Cookery or equivalent culinary training." or
     * "Valid food handler's certificate." The NLP side canonicalizes them
     * against its reference data.
     */
    protected function extractRequiredCertifications($qualifications): array
    {
        $certs = [];
        foreach ($this->normalizeStringList($qualifications) as $line) {
            if (preg_match('/(nc\s?(?:i{1,3}|iv|1-4)|certificate|certification|license|licence)/i', $line)) {
                $trimmed = trim(preg_replace('/\s+/', ' ', $line), " .-");
                if ($trimmed !== '' && !in_array(strtolower($trimmed), array_map('strtolower', $certs))) {
                    $certs[] = $trimmed;
                }
                if (count($certs) >= 4) {
                    break;
                }
            }
        }

        return $certs;
    }

    protected function normalizeStringList($value): array
    {
        if (is_array($value)) {
            return array_values(array_filter(array_map(
                fn ($item) => is_string($item) ? trim($item) : '',
                $value
            )));
        }

        if (is_string($value)) {
            $decoded = json_decode($value, true);
            if (is_array($decoded)) {
                return $this->normalizeStringList($decoded);
            }

            return array_values(array_filter(array_map('trim', preg_split('/[\r\n]+/', $value))));
        }

        return [];
    }

    /* ------------------------------------------------------------------ */
    /* DB-managed reference data                                           */
    /* ------------------------------------------------------------------ */

    /**
     * Reference data (skills/job_roles/certifications + aliases) sourced from
     * the screening_reference_data table (cached 5 min). Returns null when the
     * table has no rows yet, letting the NLP service fall back to its bundled
     * seed JSON - no silent behavior change before seeding.
     */
    protected function referenceData(): ?array
    {
        try {
            $mapping = ScreeningReferenceController::groupedMapping();

            return ($mapping['skills'] || $mapping['job_roles'] || $mapping['certifications'])
                ? $mapping
                : null;
        } catch (\Throwable $e) {
            Log::warning('Screening reference data unavailable, NLP will use bundled seed data: ' . $e->getMessage());

            return null;
        }
    }

    /* ------------------------------------------------------------------ */
    /* HR-configurable scoring settings (Screening Setup dialog)            */
    /* ------------------------------------------------------------------ */

    /**
     * The screening scoring configuration persisted in system_settings under
     * `screening.configuration`:
     * {
     *   "criteria": {"Skills": {"weight": 40, "enabled": true}, ...},
     *   "passing_score": 75,
     *   "required_skills_coverage_min": 0.60
     * }
     *
     * Disabled criteria keep their row but contribute 0 weight, so HR can
     * switch a criterion off without losing its value. Returns null when
     * nothing was configured yet — the NLP service then uses its documented
     * defaults (40/30/20/10, passing 75%, coverage 60%).
     */
    public static function screeningSettings(): ?array
    {
        try {
            $raw = \Modules\Settings\Models\SystemSetting::where('setting_key', 'screening.configuration')->value('setting_value');
            if (! is_array($raw) || empty($raw)) {
                return null;
            }

            $criteria = $raw['criteria'] ?? [];
            $weights = [];
            $map = [
                'Skills' => 'skills',
                'Work Experience' => 'experience',
                'Educational Background' => 'education',
                'Certifications' => 'certifications',
            ];
            foreach ($map as $label => $key) {
                $entry = $criteria[$label] ?? null;
                if (! is_array($entry)) {
                    continue; // incomplete config falls back to defaults
                }
                $weights[$key] = ($entry['enabled'] ?? true) ? (float) ($entry['weight'] ?? 0) : 0.0;
            }
            if (count($weights) !== 4) {
                return null;
            }

            $settings = ['weights' => $weights];
            if (isset($raw['passing_score'])) {
                $settings['passing_score'] = (float) $raw['passing_score'];
            }
            if (isset($raw['required_skills_coverage_min'])) {
                $settings['required_skills_coverage_min'] = (float) $raw['required_skills_coverage_min'];
            }

            return $settings;
        } catch (\Throwable $e) {
            Log::warning('Screening configuration unavailable, defaults will be used: ' . $e->getMessage());

            return null;
        }
    }

    /* ------------------------------------------------------------------ */
    /* Screening execution                                                 */
    /* ------------------------------------------------------------------ */

    /**
     * Screens an applicant's stored resume against their applied job post and
     * all other open posts. When $precomputed is supplied (from a preview run),
     * no second NLP call is made.
     *
     * Returns the ApplicantScreening model (or null when nothing could be run).
     */
    public function screenAndPersist(Applicant $applicant, ?array $precomputed = null): ?ApplicantScreening
    {
        $jobPost = JobPost::find($applicant->job_post_id);
        if (! $jobPost) {
            Log::warning("Screening skipped: job post {$applicant->job_post_id} missing for applicant {$applicant->applicant_id}");

            return null;
        }

        $requirements = $this->buildRequirements($jobPost);
        $openJobs = $this->buildOpenJobs($jobPost);

        $result = $precomputed;
        $error = null;

        if ($result && ($result['success'] ?? false)) {
            // Reuse preview result; nothing else to do.
        } else {
            if ($result && isset($result['error'])) {
                $error = (string) $result['error'];
            }

            $absolutePath = Storage::disk('public')->path($applicant->resume_file_path);
            $response = $this->nlp->screenResumeStructured(
                $absolutePath,
                basename($applicant->resume_file_path),
                $requirements,
                $openJobs,
                referenceData: $this->referenceData(),
                screeningSettings: self::screeningSettings()
            );

            if ($response['ok']) {
                $result = $response['data'];
            } else {
                $error = $response['error'];
                Log::warning("NLP screening failed for applicant {$applicant->applicant_id}: {$error}");
            }
        }

        return $this->persistResult($applicant, $jobPost, $result, $error);
    }

    /**
     * Runs screening on an uploaded file WITHOUT creating or attaching an
     * applicant (preview for the Add Applicant wizard).
     */
    public function screenPreviewFile(string $storedPath, string $originalName, int $jobPostId): array
    {
        $jobPost = JobPost::find($jobPostId);
        if (! $jobPost) {
            return ['success' => false, 'processing_status' => 'FAILED', 'error' => "Job post {$jobPostId} not found."];
        }

        $absolutePath = Storage::disk('local')->path($storedPath);
        $response = $this->nlp->screenResumeStructured(
            $absolutePath,
            $originalName,
            $this->buildRequirements($jobPost),
            $this->buildOpenJobs($jobPost),
            referenceData: $this->referenceData(),
            screeningSettings: self::screeningSettings()
        );

        if (! $response['ok']) {
            return ['success' => false, 'processing_status' => 'FAILED', 'error' => $response['error']];
        }

        return $response['data'];
    }

    /* ------------------------------------------------------------------ */
    /* Persistence                                                         */
    /* ------------------------------------------------------------------ */

    public function persistResult(Applicant $applicant, JobPost $jobPost, ?array $result, ?string $error = null): ?ApplicantScreening
    {
        if (! $result || ! ($result['success'] ?? false)) {
            return ApplicantScreening::create([
                'applicant_id' => $applicant->applicant_id,
                'job_post_id' => $jobPost->job_post_id,
                'processing_status' => 'FAILED',
                'error_message' => mb_substr($error ?? 'Unknown screening failure', 0, 1000),
                'processed_at' => now(),
            ]);
        }

        $official = $result['screening_status'] ?? null;
        $statusValue = self::STATUS_MAP[$official] ?? null;

        $screening = ApplicantScreening::create([
            'applicant_id' => $applicant->applicant_id,
            'job_post_id' => $jobPost->job_post_id,
            'processing_status' => $result['processing_status'] ?? 'PROCESSED',
            'screening_result' => $statusValue,
            'match_score' => $result['match_score'] ?? null,
            'score_breakdown_json' => $result['score_breakdown'] ?? null,
            'profile_json' => $result['profile'] ?? null,
            'entities_json' => $result['entities'] ?? null,
            'missing_information_json' => $result['validation']['missing_information'] ?? [],
            'validation_json' => $result['validation'] ?? null,
            'alternative_job_json' => $result['alternative_job'] ?? null,
            'reasons_json' => $result['screening_reasons'] ?? [],
            'model_info_json' => $result['model_info'] ?? null,
            'error_message' => $error,
            'processed_at' => now(),
        ]);

        // Refresh entity + score breakdown rows (existing tables, reused).
        $applicant->screeningEntities()->delete();
        foreach (($result['entities'] ?? []) as $entity) {
            ApplicantScreeningEntity::create([
                'applicant_id' => $applicant->applicant_id,
                'label' => mb_substr((string) ($entity['label'] ?? ''), 0, 80),
                'value' => (string) ($entity['value'] ?? ''),
            ]);
        }

        $applicant->screeningScores()->delete();
        foreach (($result['score_breakdown'] ?? []) as $criterion => $component) {
            ApplicantScreeningScore::create([
                'applicant_id' => $applicant->applicant_id,
                'criterion' => ucfirst($criterion),
                'score' => (float) ($component['earned'] ?? 0),
            ]);
        }

        // Update the applicant row itself (fit_score, status, summary, flags).
        $flags = [];

        $validation = $result['validation'] ?? [];
        foreach (($validation['invalid_format'] ?? []) as $invalid) {
            $flags[] = $invalid;
        }
        foreach (($validation['skill_analysis']['unrecognized'] ?? []) as $skill) {
            $flags[] = "Unrecognized skill: {$skill}";
        }
        foreach (($validation['job_role_analysis']['unrecognized'] ?? []) as $role) {
            $flags[] = "Unrecognized job role: {$role}";
        }
        foreach (($validation['missing_information'] ?? []) as $missing) {
            $flags[] = "Missing: {$missing}";
        }

        $alternative = $result['alternative_job'] ?? null;
        if ($alternative) {
            $flags[] = sprintf(
                'Stronger match: %s (%s%%)',
                $alternative['title'] ?? 'Other position',
                rtrim(rtrim((string) ($alternative['alternative_match_score'] ?? ''), '0'), '.')
            );
        }

        $summaryParts = [$result['matched_summary'] ?? null];

        if ($statusValue === 'credential') {
            $summaryParts[] = 'Invalid credential or requires verification based on system validation rules.';
        } elseif ($statusValue === 'not-fit') {
            $summaryParts[] = 'No available position achieved the required qualification level.';
        }

        $summary = trim(implode(' ', array_filter($summaryParts)));
        if ($summary === '') {
            $summary = "Automated spaCy screening completed for {$jobPost->title}.";
        }

        $applicant->update([
            'fit_score' => $result['match_score'] ?? $applicant->fit_score,
            'status' => $statusValue ?? $applicant->status,
            'summary' => $summary,
            'flags_json' => $flags,
        ]);

        return $screening;
    }
}
