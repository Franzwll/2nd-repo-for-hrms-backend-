<?php

namespace Modules\ApplicantManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Mail\OfferNewJobMail;
use App\Services\AuditLogger;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Modules\ApplicantManagement\Http\Resources\ApplicantResource;
use Modules\ApplicantManagement\Http\Resources\FinalEvaluationResource;
use Modules\ApplicantManagement\Models\Applicant;
use Modules\ApplicantManagement\Models\ApplicantDocument;
use Modules\ApplicantManagement\Models\FinalEvaluation;
use Modules\ApplicantManagement\Services\AssessmentRequirement;
use Modules\ApplicantManagement\Services\FinalEvaluationScoreService;
use Modules\ApplicantManagement\Services\OfferService;
use Modules\ApplicantManagement\Services\PracticalRequirement;
use Modules\NewHireOnboarding\Services\NewHireIntakeService;
use Modules\RecruitmentManagement\Models\JobPost;

class FinalEvaluationController extends Controller
{
    /* GET /api/v1/final-evaluations */
    public function index(Request $request): JsonResponse
    {
        // Lazy 7-day rule: a pending offer past its response window is
        // treated as a declined applicant before the list is returned.
        OfferService::expireOverdue();

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
        $model = Applicant::with(['jobPost.position', 'latestScreening'])->findOrFail($applicant);

        return response()->json($this->buildPreview($model));
    }

    /* POST /api/v1/applicants/{applicant}/final-evaluations           */
    /* Workflow gate: every preceding stage must be completed and passed. */
    /* Builds the snapshot of the whole process (preview material).      */
    /* Overall Score is ALWAYS recalculated server-side — any client      */
    /* provided overall_score is ignored and never trusted.              */
    public function store(Request $request, int $applicant): JsonResponse
    {
        $model = Applicant::with(['jobPost.position', 'latestScreening'])->findOrFail($applicant);
        $positionTitle = $model->jobPost?->title;
        // Core HCM position flags (owner): every applicant for a flagged
        // position must undergo the required stages. Legacy job-post flags
        // are fallbacks for old rows.
        $requiresAssessment = AssessmentRequirement::required($model->jobPost, null, $model->jobPost?->position);
        $requiresPractical = PracticalRequirement::required($model->jobPost, $positionTitle, $model->jobPost?->position);

        // Workflow gates (mirror the frontend pipeline order):
        // 1) Interview assessment — Passed
        $assessment = $model->assessment()->first();
        if (! $assessment || $assessment->result !== 'Passed') {
            return response()->json([
                'message' => 'Complete the interview assessment (Passed) before the final evaluation.',
            ], 422);
        }

        // 2) Assessment test — Passed, but only when the Core HCM position
        // requires it. Non-required positions skip straight to practical/final.
        $test = $model->latestAssessmentTest()->first();
        if ($requiresAssessment && (! $test || $test->result !== 'Passed')) {
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
        // No screening record at all → the applicant was never screened (e.g. a
        // walk-in / phone applicant with no resume). Exclude Screening and
        // normalize, rather than blocking the Overall Score. A resume that
        // exists but failed to screen still leaves this true → incomplete.
        $screeningApplicable = $model->latestScreening !== null;
        $interviewScore = $assessment->total_score !== null ? (float) $assessment->total_score : null;
        // Assessment score only counts when the Core HCM position requires it —
        // non-required positions skip the stage (weight normalized, never zero).
        $assessmentScore = ($requiresAssessment && $test && $test->total_score !== null)
            ? (float) $test->total_score : null;
        $practicalScore = ($requiresPractical && $practical && $practical->total_score !== null)
            ? (float) $practical->total_score : null;

        $calc = FinalEvaluationScoreService::calculate(
            $screeningScore,
            $interviewScore,
            $assessmentScore,
            $practicalScore,
            $requiresPractical,
            $requiresAssessment,
            $screeningApplicable
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
            'assessment_required' => $requiresAssessment,
            'assessment_test_score' => $requiresAssessment ? $assessmentScore : null,
            'assessment_test_result' => $requiresAssessment ? ($test?->result) : null,
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

        if ($recommendation === 'Not Recommended') {
            // Not Passed — the applicant is out of the running and shows as
            // Failed in the Pipeline Overview (no offer was accepted). Any
            // stale pending offer is cleared so the record never reads as
            // "awaiting response" after the decline.
            $model->update([
                'stage'            => 'Rejected',
                'offer_status'     => null,
                'offer_sent_at'    => null,
                'offer_expires_at' => null,
                'rejected_at'      => now(),
            ]);
        } elseif (in_array($recommendation, ['Recommended for Hire', 'For Another Position'], true)) {
            // Recommending the candidate supersedes any stale pending offer —
            // staff resend the offer email with the new decision.
            $keepOffer = $model->offer_status === 'Pending';
            $model->update([
                'stage' => in_array($model->stage, ['Offer', 'Hired', 'Rejected'], true)
                    ? $model->stage
                    : 'Final Evaluation',
                ...($keepOffer ? [] : [
                    'offer_status'     => null,
                    'offer_sent_at'    => null,
                    'offer_expires_at' => null,
                ]),
            ]);
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
                . ($requiresAssessment ? "Assessment {$assessmentScore}%" : 'Assessment Not Required')
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

    /* POST /api/v1/applicants/{applicant}/offer                              */
    /* Sends the offer email after a Final Evaluation recommended the         */
    /* candidate (Recommended for Hire / For Another Position) and records    */
    /* the 7-day response window. The applicant replies by email — HR records */
    /* the reply later via respondToOffer().                                  */
    public function offer(Request $request, int $applicant): JsonResponse
    {
        $model = Applicant::with(['jobPost'])->findOrFail($applicant);

        $data = $request->validate([
            'details' => ['nullable', 'string'],
        ]);

        if (in_array($model->stage, ['Hired', 'Rejected'], true)) {
            return response()->json([
                'message' => "This applicant is already {$model->stage} — no further offer can be sent.",
            ], 422);
        }

        if ($model->offer_status === 'Accepted') {
            return response()->json([
                'message' => 'This applicant already accepted the offer.',
            ], 422);
        }

        $final = $model->finalEvaluation()->latest('final_evaluation_id')->first();
        if (! $final) {
            return response()->json([
                'message' => 'Complete the final evaluation before sending an offer.',
            ], 422);
        }
        if ($final->recommendation === 'Not Recommended') {
            return response()->json([
                'message' => 'The final evaluation did not recommend this candidate — no offer to send.',
            ], 422);
        }

        // Position being offered — the recommended post when the evaluation
        // sent the candidate to another position, otherwise the applied post.
        $offeredPosition = $model->jobPost?->title ?? 'Position';
        if ($final->recommendation === 'For Another Position') {
            $target = $final->recommendedJobPost;
            if (! $target) {
                return response()->json([
                    'message' => 'The recommended position for this candidate is no longer available.',
                ], 422);
            }
            $offeredPosition = $target->title;
        }

        if (! $model->email) {
            return response()->json(['message' => 'Applicant does not have an email address.'], 422);
        }

        $expiresAt = now()->addDays(OfferService::RESPONSE_WINDOW_DAYS);

        try {
            Mail::to($model->email)->send(new OfferNewJobMail(
                recipientEmail: $model->email,
                applicantName: $model->name,
                offeredPosition: $offeredPosition,
                details: $data['details'] ?? null,
                responseDeadline: $expiresAt->timezone('Asia/Manila')
                    ->format('F j, Y (g:i A)'),
                responseWindowDays: OfferService::RESPONSE_WINDOW_DAYS,
            ));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning("Failed to send offer email to {$model->email}: " . $e->getMessage());

            return response()->json([
                'message' => 'The offer email could not be sent. Please check the mail configuration and try again.',
            ], 500);
        }

        $model->update([
            'stage'            => 'Offer',
            'offer_status'     => 'Pending',
            'offer_sent_at'    => now(),
            'offer_expires_at' => $expiresAt,
        ]);

        AuditLogger::log(
            action: 'Offer Sent to Applicant',
            module: 'Applicant Management',
            severity: 'Info',
            targetType: 'Applicant',
            targetId: (string) $model->applicant_id,
            details: "Offer for {$offeredPosition} emailed to {$model->name} ({$model->email}) — "
                . OfferService::RESPONSE_WINDOW_DAYS . ' days to respond (until '
                . $expiresAt->timezone('Asia/Manila')->format('M j, Y g:i A') . ').'
        );

        NotificationService::send(
            title: "Offer sent: {$model->name}",
            body: "Offer for {$offeredPosition} sent — awaiting the applicant's response for up to "
                . OfferService::RESPONSE_WINDOW_DAYS . ' days, otherwise treated as declined.',
            module: 'Applicant Management',
            type: 'info',
            targetType: 'Applicant',
            targetId: (string) $model->applicant_id,
            onlyRoleNames: ['Admin', 'Super Admin']
        );

        return response()->json(new ApplicantResource($model->fresh()->load(['jobPost.department'])));
    }

    /* POST /api/v1/applicants/{applicant}/offer/response                     */
    /* HR records the applicant's reply to the offer:                         */
    /*  - accepted (+ start_date): applicant becomes Hired and the start date */
    /*    anchors New Hire Onboarding ("Days of Work").                       */
    /*  - declined: applicant is failed in the pipeline (Rejected).           */
    /* The 7-day rule is enforced first — an unanswered offer past its window */
    /* is treated as declined.                                                */
    public function respondToOffer(Request $request, int $applicant): JsonResponse
    {
        OfferService::expireOverdue();

        $data = $request->validate([
            'response'   => ['required', 'string', 'in:accepted,declined'],
            'start_date' => ['required_if:response,accepted', 'nullable', 'date'],
            // How the applicant replied — no applicant portal / inbound email
            // integration exists, so HR records the channel it came through.
            'channel'    => ['required', 'string', 'in:Email,SMS,Call,In person'],
            'note'       => ['nullable', 'string', 'max:1000'],
        ]);

        $responseMeta = [
            'offer_response_channel'     => $data['channel'],
            'offer_response_note'        => $data['note'] ?? null,
            'offer_responded_at'         => now(),
            'offer_response_recorded_by' => $request->user()?->full_name
                ?? $request->user()?->username,
        ];

        return DB::transaction(function () use ($applicant, $data, $responseMeta) {
            $model = Applicant::with(['jobPost'])->lockForUpdate()->findOrFail($applicant);

            if ($model->stage !== 'Offer' || $model->offer_status !== 'Pending') {
                return response()->json([
                    'message' => 'This applicant is not awaiting an offer response.',
                    'current_stage' => $model->stage,
                    'current_offer_status' => $model->offer_status,
                ], 422);
            }

            if ($data['response'] === 'accepted') {
                if ($model->offerResponseExpired()) {
                    // Window lapsed before HR recorded the reply — declined
                    // applicant, so no cooldown (welcome back anytime).
                    $model->update(['offer_status' => 'Declined', 'stage' => 'Rejected', 'rejected_at' => null]);

                    return response()->json([
                        'message' => 'The ' . OfferService::RESPONSE_WINDOW_DAYS . '-day response window expired — '
                            . 'the applicant is treated as declined (Failed).',
                    ], 422);
                }

                $final = $model->finalEvaluation()->latest('final_evaluation_id')->first();
                if (! $final || $final->recommendation === 'Not Recommended') {
                    return response()->json([
                        'message' => 'A final evaluation recommending this candidate is required before accepting.',
                    ], 422);
                }

                // For Another Position — the applicant now joins the recommended
                // post, so their job post (and the new hire derived from it)
                // points at the right position/department.
                if ($final->recommendation === 'For Another Position' && $final->recommended_job_post_id) {
                    $model->job_post_id = $final->recommended_job_post_id;
                }

                $model->stage = 'Hired';
                $model->offer_status = 'Accepted';
                $model->offer_start_date = $data['start_date'];
                $model->fill($responseMeta);
                $model->save();

                // Filling a slot: auto-closes the job post when vacancies reach 0.
                if ($model->jobPost) {
                    try {
                        $model->jobPost->fillOneSlot();
                    } catch (\Throwable $e) {
                        \Illuminate\Support\Facades\Log::warning('Job post slot fill failed for post ' . $model->job_post_id . ': ' . $e->getMessage());
                    }
                }

                // File the accepted applicant into New Hire Onboarding right here
                // on the server (idempotent per applicant). The browser handoff
                // used to be the only creator, so a reload could silently drop the
                // hire; doing it server-side guarantees the Pre-onboarding record.
                $newHire = null;
                try {
                    $newHire = NewHireIntakeService::fileApplicant(
                        $model->applicant_id,
                        ['start_date' => $data['start_date']]
                    );
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::warning('New hire intake failed for applicant ' . $model->applicant_id . ': ' . $e->getMessage());
                }

                AuditLogger::log(
                    action: 'Applicant Accepted Offer',
                    module: 'Applicant Management',
                    severity: 'Info',
                    targetType: 'Applicant',
                    targetId: (string) $model->applicant_id,
                    details: "{$model->name} accepted the offer for {$model->jobPost?->title} — "
                        . 'start of work ' . $data['start_date']
                        . ($newHire ? " (filed under New Hire Onboarding as Pre-onboarding, {$newHire->new_hire_code}). " : ' (New Hire Onboarding intake pending). ')
                        . "Replied via {$data['channel']}"
                        . (! empty($data['note']) ? " — {$data['note']}" : '') . '.'
                );

                NotificationService::send(
                    title: "Offer accepted: {$model->name}",
                    body: "Start of work " . $data['start_date'] . ' — filing under Pre-onboarding.',
                    module: 'Applicant Management',
                    type: 'success',
                    targetType: 'Applicant',
                    targetId: (string) $model->applicant_id,
                    onlyRoleNames: ['Admin', 'Super Admin']
                );

                return response()->json(new ApplicantResource($model->fresh()->load(['jobPost.department'])));
            }

            // Declined — failed in the pipeline, no onboarding. Decliners are
            // welcome back anytime: no rejected_at, so no cooldown.
            $model->update([
                'stage'        => 'Rejected',
                'offer_status' => 'Declined',
                'rejected_at'  => null,
                ...$responseMeta,
            ]);

            AuditLogger::log(
                action: 'Applicant Declined Offer',
                module: 'Applicant Management',
                severity: 'Warning',
                targetType: 'Applicant',
                targetId: (string) $model->applicant_id,
                details: "{$model->name} declined the offer — recorded as Failed in the Pipeline Overview. "
                    . "Replied via {$data['channel']}"
                    . (! empty($data['note']) ? " — {$data['note']}" : '') . '.'
            );

            return response()->json(new ApplicantResource($model->fresh()->load(['jobPost.department'])));
        });
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
        $model->loadMissing('jobPost.position');
        $positionTitle = $model->jobPost?->title;
        // Core HCM position flags (owner) — same rule as store().
        $requiresAssessment = AssessmentRequirement::required($model->jobPost, null, $model->jobPost?->position);
        $requiresPractical = PracticalRequirement::required($model->jobPost, $positionTitle, $model->jobPost?->position);

        $assessment = $model->assessment()->first();
        $test = $model->latestAssessmentTest()->first();
        $practical = $model->latestPracticalTest()->first();

        $screeningScore = $model->latestScreening?->match_score !== null
            ? (float) $model->latestScreening->match_score : null;
        // Same rule as store(): no screening record → Screening is not part of
        // the calculation (walk-in / phone applicants are never screened).
        $screeningApplicable = $model->latestScreening !== null;
        $interviewScore = $assessment?->total_score !== null ? (float) $assessment->total_score : null;
        $assessmentScore = ($requiresAssessment && $test?->total_score !== null) ? (float) $test->total_score : null;
        $practicalScore = ($requiresPractical && $practical && $practical->total_score !== null)
            ? (float) $practical->total_score : null;

        $calc = FinalEvaluationScoreService::calculate(
            $screeningScore,
            $interviewScore,
            $assessmentScore,
            $practicalScore,
            $requiresPractical,
            $requiresAssessment,
            $screeningApplicable
        );

        $blockingDiscrepancies = ApplicantDocument::where('applicant_id', $model->applicant_id)
            ->where('verification_status', 'DISCREPANCY_FOUND')
            ->count();

        $interviewPassed = $assessment && $assessment->result === 'Passed';
        $assessmentPassed = $requiresAssessment ? ($test && $test->result === 'Passed') : true;
        $practicalPassed = $requiresPractical ? ($practical && $practical->result === 'Passed') : null;

        return [
            'applicant_id' => $model->applicant_id,
            'position' => $positionTitle,
            'assessment_required' => $requiresAssessment,
            'practical_required' => $requiresPractical,
            'screening_applicable' => $screeningApplicable,
            'scores' => [
                'screening_score' => $screeningScore,
                'screening_status' => $model->latestScreening?->screening_result,
                'interview_score' => $interviewScore,
                'interview_result' => $assessment?->result,
                'assessment_test_score' => $requiresAssessment ? $assessmentScore : null,
                'assessment_test_result' => $requiresAssessment ? ($test?->result) : null,
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
