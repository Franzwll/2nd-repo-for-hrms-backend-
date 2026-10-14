<?php

namespace Modules\ApplicantManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\AuditLogger;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\ApplicantManagement\Http\Resources\FinalEvaluationResource;
use Modules\ApplicantManagement\Models\Applicant;
use Modules\ApplicantManagement\Models\ApplicantDocument;
use Modules\ApplicantManagement\Models\FinalEvaluation;
use Modules\ApplicantManagement\Services\FinalEvaluationScoreService;
use Modules\ApplicantManagement\Services\PracticalRequirement;
use Modules\RecruitmentManagement\Models\JobPost;

class FinalEvaluationController extends Controller
{
    /* GET /api/v1/final-evaluations */
    public function index(Request $request): JsonResponse
    {
        $query = FinalEvaluation::with(['applicant.jobPost.department', 'recommendedJobPost'])
            ->orderByDesc('evaluation_date')
            ->orderByDesc('final_evaluation_id');

        if ($applicantId = $request->query('applicant_id')) {
            $query->where('applicant_id', $applicantId);
        }
        if ($recommendation = $request->query('recommendation')) {
            $query->where('recommendation', $recommendation);
        }

        $perPage = (int) $request->query('per_page', 15);
        $paginated = $query->paginate($perPage);

        return response()->json([
            'data' => FinalEvaluationResource::collection($paginated->items()),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'per_page'     => $paginated->perPage(),
                'total'        => $paginated->total(),
            ],
        ]);
    }

    /* GET /api/v1/applicants/{applicant}/final-evaluations/preview */
    /* Read-only system calculation — frontend displays, never computes. */
    public function preview(int $applicant): JsonResponse
    {
        $model = Applicant::with(['jobPost', 'latestScreening'])->findOrFail($applicant);

        return response()->json($this->buildPreview($model));
    }

    /* POST /api/v1/applicants/{applicant}/final-evaluations           */
    /* Workflow gate: every preceding stage must be completed and passed. */
    /* Builds the snapshot of the whole process (preview material).      */
    /* Overall Score is ALWAYS recalculated server-side — any client      */
    /* provided overall_score is ignored and never trusted.              */
    public function store(Request $request, int $applicant): JsonResponse
    {
        $model = Applicant::with(['jobPost', 'latestScreening'])->findOrFail($applicant);
        $positionTitle = $model->jobPost?->title;
        $requiresPractical = PracticalRequirement::required($model->jobPost, $positionTitle);

        // Workflow gates (mirror the frontend pipeline order):
        // 1) Interview assessment — Passed
        $assessment = $model->assessment()->first();
        if (! $assessment || $assessment->result !== 'Passed') {
            return response()->json([
                'message' => 'Complete the interview assessment (Passed) before the final evaluation.',
            ], 422);
        }

        // 2) Assessment test — Passed
        $test = $model->latestAssessmentTest()->first();
        if (! $test || $test->result !== 'Passed') {
            return response()->json([
                'message' => 'Complete the assessment test (Passed) before the final evaluation.',
            ], 422);
        }

        // 3) Practical assessment — only when the position requires it.
        // Missing practical for non-required positions is NOT a failure.
        $practical = $model->latestPracticalTest()->first();
        if ($requiresPractical && (! $practical || $practical->result !== 'Passed')) {
            return response()->json([
                'message' => 'Complete the practical assessment (Passed) before the final evaluation.',
            ], 422);
        }

        $data = $request->validate([
            'evaluated_by_user_id' => ['nullable', 'integer', 'exists:system_users,system_user_id'],
            'evaluation_date'      => ['required', 'date'],
            'recommendation'       => ['required', 'string', 'in:Recommended for Hire,For Another Position,Not Recommended'],
            'overall_remarks'      => ['nullable', 'string'],
            'recommended_job_post_id' => ['nullable', 'integer', 'exists:job_posts,job_post_id'],
        ]);
        // NOTE: overall_score / scores from the client are intentionally NOT
        // in the validation list — they are ignored and recalculated below.

        // System-calculated scores from existing records (never from request).
        $screeningScore = $model->latestScreening?->match_score !== null
            ? (float) $model->latestScreening->match_score : null;
        $interviewScore = $assessment->total_score !== null ? (float) $assessment->total_score : null;
        $assessmentScore = $test->total_score !== null ? (float) $test->total_score : null;
        $practicalScore = ($requiresPractical && $practical && $practical->total_score !== null)
            ? (float) $practical->total_score : null;

        $calc = FinalEvaluationScoreService::calculate(
            $screeningScore,
            $interviewScore,
            $assessmentScore,
            $practicalScore,
            $requiresPractical
        );

        $recommendation = $data['recommendation'];

        // Recommendation rules.
        if ($recommendation === 'Recommended for Hire') {
            if (! $calc['complete'] || $calc['overall_score'] === null) {
                return response()->json([
                    'message' => 'Required evaluation data is incomplete — the Overall Score could not be calculated.',
                ], 422);
            }
            // Blocking verification: proven resume/document mismatch.
            $blocking = ApplicantDocument::where('applicant_id', $applicant)
                ->where('verification_status', 'DISCREPANCY_FOUND')
                ->count();
            if ($blocking > 0) {
                return response()->json([
                    'message' => 'There is an unresolved document verification discrepancy. Resolve it before recommending for hire.',
                ], 422);
            }
        }

        if ($recommendation === 'Not Recommended' && trim((string) ($data['overall_remarks'] ?? '')) === '') {
            return response()->json([
                'message' => 'Evaluator remarks are required when the recommendation is Not Recommended.',
            ], 422);
        }

        $recommendedJobPostId = null;
        $recommendedTitle = null;
        if ($recommendation === 'For Another Position') {
            if (empty($data['recommended_job_post_id'])) {
                return response()->json([
                    'message' => 'Select one alternative position for "For Another Position".',
                ], 422);
            }
            $target = JobPost::find($data['recommended_job_post_id']);
            if (! $target) {
                return response()->json(['message' => 'Selected alternative position no longer exists.'], 422);
            }
            $isOpen = in_array($target->status, ['Open', 'published', 'Published'], true)
                && (int) ($target->active ?? 1) === 1
                && $target->remainingSlots() > 0;
            if (! $isOpen) {
                return response()->json([
                    'message' => "The position '{$target->title}' is no longer available (closed or no vacancies). Choose another available position.",
                ], 422);
            }
            $recommendedJobPostId = $target->job_post_id;
            $recommendedTitle = $target->title;
        }

        // Snapshot of every preceding stage (final evaluation preview)
        // + backend-calculated overall score. Client scores never used.
        $snapshot = [
            'applicant_id' => $applicant,
            'evaluated_by_user_id' => $data['evaluated_by_user_id'] ?? null,
            'evaluation_date' => $data['evaluation_date'],
            'screening_score' => $screeningScore,
            'screening_status' => $model->latestScreening?->screening_result,
            'interview_score' => $interviewScore,
            'interview_result' => $assessment->result,
            'assessment_test_score' => $assessmentScore,
            'assessment_test_result' => $test->result,
            'practical_required' => $requiresPractical,
            'practical_test_score' => $requiresPractical ? $practicalScore : null,
            'practical_test_result' => $requiresPractical ? ($practical?->result) : null,
            'overall_score' => $calc['overall_score'],
            'score_breakdown_json' => [
                'weights' => $calc['weights'],
                'applicable_weight' => $calc['applicable_weight'],
                'overall_score' => $calc['overall_score'],
                'overall_score_rounded' => $calc['overall_score_rounded'],
                'breakdown' => $calc['breakdown'],
            ],
            'recommendation' => $recommendation,
            'recommended_job_post_id' => $recommendedJobPostId,
            'recommended_position_title' => $recommendedTitle,
            'overall_remarks' => $data['overall_remarks'] ?? null,
        ];

        $final = FinalEvaluation::updateOrCreate(
            ['applicant_id' => $applicant],
            $snapshot
        );

        // Advance applicant stage (never to Hired — only Offer/Hired via hire action).
        if (! in_array($model->stage, ['Final Evaluation', 'Offer', 'Hired', 'Rejected'], true)) {
            $model->update(['stage' => 'Final Evaluation']);
        }

        $overallText = $calc['overall_score'] !== null ? round($calc['overall_score'], 1).'%' : 'n/a';
        AuditLogger::log(
            action: 'Final Evaluation Completed',
            module: 'Applicant Management',
            severity: 'Info',
            targetType: 'Final Evaluation',
            targetId: (string) $final->final_evaluation_id,
            details: "Final evaluation for {$model->name} ({$positionTitle}) completed — "
                . "Screening {$screeningScore}%, Interview {$interviewScore}%, "
                . "Assessment {$assessmentScore}%"
                . ($requiresPractical ? ", Practical {$practicalScore}%" : ', Practical Not Required')
                . " — Overall {$overallText} (system calculated) — Recommendation: {$final->recommendation}."
        );

        NotificationService::send(
            title: "Final evaluation completed: {$model->name}",
            body: "Overall {$overallText} — Recommendation: {$final->recommendation}.",
            module: 'Applicant Management',
            type: 'info',
            targetType: 'Final Evaluation',
            targetId: (string) $final->final_evaluation_id,
            onlyRoleNames: ['Admin', 'Super Admin']
        );

        return response()->json(new FinalEvaluationResource($final->load(['applicant.jobPost.department', 'recommendedJobPost'])), 201);
    }

    /* PUT /api/v1/final-evaluations/{finalEvaluation} */
    /* Scores remain read-only — only HR-entered fields may change. */
    public function update(Request $request, int $finalEvaluation): JsonResponse
    {
        $model = FinalEvaluation::findOrFail($finalEvaluation);

        $data = $request->validate([
            'evaluation_date' => ['sometimes', 'date'],
            'recommendation'  => ['sometimes', 'string', 'in:Recommended for Hire,For Another Position,Not Recommended'],
            'overall_remarks' => ['nullable', 'string'],
        ]);

        if (($data['recommendation'] ?? null) === 'Not Recommended'
            && trim((string) ($data['overall_remarks'] ?? $model->overall_remarks ?? '')) === '') {
            return response()->json([
                'message' => 'Evaluator remarks are required when the recommendation is Not Recommended.',
            ], 422);
        }

        $model->update($data);

        return response()->json(new FinalEvaluationResource($model->load(['applicant.jobPost.department', 'recommendedJobPost'])));
    }

    /**
     * Shared preview payload: scores, normalized overall, requirement
     * status, and blocking-verification flag — without persisting.
     */
    private function buildPreview(Applicant $model): array
    {
        $positionTitle = $model->jobPost?->title;
        $requiresPractical = PracticalRequirement::required($model->jobPost, $positionTitle);

        $assessment = $model->assessment()->first();
        $test = $model->latestAssessmentTest()->first();
        $practical = $model->latestPracticalTest()->first();

        $screeningScore = $model->latestScreening?->match_score !== null
            ? (float) $model->latestScreening->match_score : null;
        $interviewScore = $assessment?->total_score !== null ? (float) $assessment->total_score : null;
        $assessmentScore = $test?->total_score !== null ? (float) $test->total_score : null;
        $practicalScore = ($requiresPractical && $practical && $practical->total_score !== null)
            ? (float) $practical->total_score : null;

        $calc = FinalEvaluationScoreService::calculate(
            $screeningScore,
            $interviewScore,
            $assessmentScore,
            $practicalScore,
            $requiresPractical
        );

        $blockingDiscrepancies = ApplicantDocument::where('applicant_id', $model->applicant_id)
            ->where('verification_status', 'DISCREPANCY_FOUND')
            ->count();

        $interviewPassed = $assessment && $assessment->result === 'Passed';
        $assessmentPassed = $test && $test->result === 'Passed';
        $practicalPassed = $requiresPractical ? ($practical && $practical->result === 'Passed') : null;

        return [
            'applicant_id' => $model->applicant_id,
            'position' => $positionTitle,
            'practical_required' => $requiresPractical,
            'scores' => [
                'screening_score' => $screeningScore,
                'screening_status' => $model->latestScreening?->screening_result,
                'interview_score' => $interviewScore,
                'interview_result' => $assessment?->result,
                'assessment_test_score' => $assessmentScore,
                'assessment_test_result' => $test?->result,
                'practical_test_score' => $requiresPractical ? $practicalScore : null,
                'practical_test_result' => $requiresPractical ? ($practical?->result) : null,
            ],
            'overall_score' => $calc['overall_score'],
            'overall_score_rounded' => $calc['overall_score_rounded'],
            'score_breakdown' => $calc['breakdown'],
            'weights' => $calc['weights'],
            'calculation_complete' => $calc['complete'],
            'requirements' => [
                'interview_passed' => (bool) $interviewPassed,
                'assessment_passed' => (bool) $assessmentPassed,
                'practical' => ! $requiresPractical ? 'not_required' : ((bool) $practicalPassed ? 'passed' : 'missing_or_failed'),
                'all_passed' => (bool) ($interviewPassed && $assessmentPassed && (! $requiresPractical || $practicalPassed)),
            ],
            'blocking_verification_issues' => (int) $blockingDiscrepancies,
        ];
    }
}
