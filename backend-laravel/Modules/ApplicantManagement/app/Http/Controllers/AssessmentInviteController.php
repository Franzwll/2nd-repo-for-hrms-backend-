<?php

namespace Modules\ApplicantManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\AuditLogger;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Modules\ApplicantManagement\Models\Applicant;
use Modules\ApplicantManagement\Models\AssessmentInvite;
use Modules\ApplicantManagement\Models\AssessmentTest;

class AssessmentInviteController extends Controller
{
    /** Default lifetime of a test link (days) when the caller does not set one. */
    private const DEFAULT_EXPIRY_DAYS = 7;

    /* GET /api/v1/assessment-invites?applicant_id= — staff view of links. */
    public function index(Request $request): JsonResponse
    {
        $query = AssessmentInvite::with('applicant.jobPost')->orderByDesc('assessment_invite_id');

        if ($applicantId = $request->query('applicant_id')) {
            $query->where('applicant_id', $applicantId);
        }

        return response()->json([
            'data' => $query->get()->map(fn (AssessmentInvite $i) => $this->summarize($i))->all(),
        ]);
    }

    /* POST /api/v1/applicants/{applicant}/assessment-invites
     * Generates a single-use link the APPLICANT opens (no login) to take the
     * assessment test. Workflow gate mirrors AssessmentTestController: the
     * interview assessment must be recorded and marked Passed first. */
    public function store(Request $request, int $applicant): JsonResponse
    {
        if (! \Modules\ApplicantManagement\Services\AssessmentConfig::assessmentTestEnabled()) {
            return response()->json([
                'message' => 'Assessment tests are disabled in Core HCM settings. Enable them in Core HCM to generate test links.',
            ], 422);
        }

        $model = Applicant::with('jobPost')->findOrFail($applicant);

        $assessment = $model->assessment()->first();
        if (! $assessment || $assessment->result !== 'Passed') {
            return response()->json([
                'message' => 'This candidate cannot take the assessment test until their interview assessment is recorded and marked Passed.',
            ], 422);
        }

        $data = $request->validate([
            'test_title'       => ['required', 'string', 'max:190'],
            'questions_json'   => ['required', 'array', 'min:1'],
            'questions_json.*.title'        => ['required', 'string'],
            'questions_json.*.options'      => ['required', 'array', 'min:2'],
            'questions_json.*.correctIndex' => ['required', 'integer', 'min:0'],
            'questions_json.*.points'       => ['nullable', 'numeric', 'min:0'],
            'questions_json.*.scenario'     => ['nullable', 'string'],
            'passing_score'    => ['nullable', 'numeric', 'min:0', 'max:100'],
            'expires_in_days'  => ['nullable', 'integer', 'min:1', 'max:90'],
        ]);

        $expiryDays = (int) ($data['expires_in_days'] ?? self::DEFAULT_EXPIRY_DAYS);

        $invite = AssessmentInvite::create([
            'token'              => Str::random(48),
            'applicant_id'       => $applicant,
            'created_by_user_id' => auth('sanctum')->user()?->system_user_id,
            'test_title'         => $data['test_title'],
            'questions_json'     => $data['questions_json'],
            'passing_score'      => $data['passing_score'] ?? 75.00,
            'status'             => 'Pending',
            'expires_at'         => now()->addDays($expiryDays),
        ]);

        AuditLogger::log(
            action: 'Assessment Test Link Generated',
            module: 'Applicant Management',
            severity: 'Info',
            targetType: 'Assessment Invite',
            targetId: (string) $invite->assessment_invite_id,
            details: "Generated a secure assessment test link for {$model->name} (\"{$invite->test_title}\"), valid for {$expiryDays} days."
        );

        return response()->json($this->summarize($invite->load('applicant.jobPost')), 201);
    }

    /* GET /api/v1/assessment-invites/{token} — PUBLIC (no auth).
     * Returns the applicant-facing test (correct answers stripped). */
    public function show(string $token): JsonResponse
    {
        $invite = AssessmentInvite::with('applicant.jobPost')->where('token', $token)->first();

        if (! $invite) {
            return response()->json(['message' => 'This assessment test link is invalid.'], 404);
        }

        $this->expireIfStale($invite);

        return response()->json([
            'data' => [
                'status'          => $invite->status,
                'test_title'      => $invite->test_title,
                'passing_score'   => (float) $invite->passing_score,
                'expires_at'      => $invite->expires_at?->toIso8601String(),
                'submitted_at'    => $invite->submitted_at?->toIso8601String(),
                'total_score'     => $invite->total_score !== null ? (float) $invite->total_score : null,
                'result'          => $invite->result,
                'applicant_name'  => $invite->applicant?->name,
                'position'        => $invite->applicant?->jobPost?->title,
                // Never leak the answer key to the browser.
                'questions'       => collect($invite->questions_json ?? [])->map(fn ($q) => [
                    'title'    => $q['title'] ?? '',
                    'scenario' => $q['scenario'] ?? '',
                    'options'  => array_values($q['options'] ?? []),
                    'points'   => (float) ($q['points'] ?? 0),
                ])->all(),
            ],
        ]);
    }

    /* POST /api/v1/assessment-invites/{token}/submit — PUBLIC (no auth).
     * Scores the applicant's answers server-side, records the assessment test
     * and advances the applicant stage. */
    public function submit(Request $request, string $token): JsonResponse
    {
        $invite = AssessmentInvite::with('applicant.jobPost')->where('token', $token)->first();

        if (! $invite) {
            return response()->json(['message' => 'This assessment test link is invalid.'], 404);
        }

        $this->expireIfStale($invite);

        if ($invite->status === 'Expired') {
            return response()->json(['message' => 'This assessment test link has expired. Ask the recruiter for a new link.'], 422);
        }

        // Idempotent: a resubmit / refresh returns the already-recorded result.
        if ($invite->status === 'Completed') {
            return response()->json([
                'message'     => 'This assessment test was already submitted.',
                'total_score' => $invite->total_score !== null ? (float) $invite->total_score : null,
                'result'      => $invite->result,
            ]);
        }

        $data = $request->validate([
            'answers'   => ['required', 'array'],
            'answers.*' => ['nullable', 'integer', 'min:0'],
        ]);

        $questions = $invite->questions_json ?? [];
        $answers   = $data['answers'];

        $earnedTotal = 0.0;
        $maxTotal    = 0.0;
        $scores      = [];
        foreach ($questions as $idx => $q) {
            $points = (float) ($q['points'] ?? 0);
            $maxTotal += $points;
            $correct = isset($answers[$idx]) && (int) $answers[$idx] === (int) ($q['correctIndex'] ?? -1);
            $scores[$idx] = $correct ? $points : 0;
            if ($correct) {
                $earnedTotal += $points;
            }
        }

        $total  = $maxTotal > 0 ? round(($earnedTotal / $maxTotal) * 100, 2) : 0.0;
        $result = $total >= (float) $invite->passing_score ? 'Passed' : 'Failed';

        $applicant = $invite->applicant;
        $questionRows = collect($questions)->map(fn ($q) => [
            'question' => trim(($q['title'] ?? '').' — '.($q['scenario'] ?? ''), " —"),
            'points'   => (float) ($q['points'] ?? 0),
        ])->all();

        AssessmentTest::create([
            'applicant_id'     => $invite->applicant_id,
            'assessor_user_id' => $invite->created_by_user_id,
            'test_title'       => $invite->test_title,
            'questions_json'   => $questionRows,
            'scores_json'      => $scores,
            'total_score'      => $total,
            'passing_score'    => $invite->passing_score,
            'result'           => $result,
            'test_date'        => now()->toDateString(),
            'remarks'          => 'Answered by the applicant through the secure test link.',
        ]);

        $invite->update([
            'answers_json' => $answers,
            'total_score'  => $total,
            'result'       => $result,
            'status'       => 'Completed',
            'submitted_at' => now(),
        ]);

        // Advance applicant stage (out-of-order safety), matching AssessmentTestController.
        if ($applicant && in_array($applicant->stage, ['Screened', 'Interview Scheduled', 'Assessed', 'Accepted', 'Practical Test'], true)) {
            $applicant->update(['stage' => 'Assessment Test']);
        }

        $name = $applicant?->name ?? 'Applicant';
        AuditLogger::log(
            action: 'Assessment Test Recorded',
            module: 'Applicant Management',
            severity: 'Info',
            targetType: 'Assessment Test',
            targetId: (string) $invite->assessment_invite_id,
            details: "Applicant {$name} submitted assessment test \"{$invite->test_title}\" via a secure link with score {$total}% and result {$result}."
        );

        NotificationService::send(
            title: "Assessment test submitted: {$name}",
            body: "Scored {$total}% — Result: {$result}.",
            module: 'Applicant Management',
            type: 'info',
            targetType: 'Assessment Test',
            targetId: (string) $invite->assessment_invite_id
        );

        return response()->json([
            'message'     => 'Your assessment test was submitted successfully.',
            'total_score' => $total,
            'result'      => $result,
        ]);
    }

    /* ------------------------------------------------------------------ */

    /** Marks a pending invite as Expired once its expiry time has passed. */
    private function expireIfStale(AssessmentInvite $invite): void
    {
        if (
            $invite->status === 'Pending'
            && $invite->expires_at !== null
            && $invite->expires_at->isPast()
        ) {
            $invite->update(['status' => 'Expired']);
        }
    }

    /** Staff-facing summary of an invite (includes the token to build the URL). */
    private function summarize(AssessmentInvite $invite): array
    {
        return [
            'assessment_invite_id' => $invite->assessment_invite_id,
            'token'                => $invite->token,
            'applicant_id'         => $invite->applicant_id,
            'applicant_name'       => $invite->applicant?->name,
            'position'             => $invite->applicant?->jobPost?->title,
            'test_title'           => $invite->test_title,
            'passing_score'        => (float) $invite->passing_score,
            'total_score'          => $invite->total_score !== null ? (float) $invite->total_score : null,
            'result'               => $invite->result,
            'status'               => $invite->status,
            'expires_at'           => $invite->expires_at?->toIso8601String(),
            'submitted_at'         => $invite->submitted_at?->toIso8601String(),
            'created_at'           => $invite->created_at?->toIso8601String(),
        ];
    }
}
