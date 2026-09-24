<?php

namespace Modules\ApplicantManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\AuditLogger;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\ApplicantManagement\Http\Resources\FinalEvaluationResource;
use Modules\ApplicantManagement\Models\Applicant;
use Modules\ApplicantManagement\Models\FinalEvaluation;

class FinalEvaluationController extends Controller
{
    /* GET /api/v1/final-evaluations */
    public function index(Request $request): JsonResponse
    {
        $query = FinalEvaluation::with('applicant.jobPost.department')
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

    /* POST /api/v1/applicants/{applicant}/final-evaluations           */
    /* Workflow gate: every preceding stage must be completed and passed. */
    /* Builds the snapshot of the whole process (preview material).      */
    public function store(Request $request, int $applicant): JsonResponse
    {
        $model = Applicant::with(['jobPost', 'latestScreening'])->findOrFail($applicant);
        $requiresPractical = (bool) $model->jobPost?->requires_practical;

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

        // 3) Practical assessment — only when the position requires it
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
        ]);

        // Snapshot of every preceding stage (final evaluation preview)
        $data['applicant_id'] = $applicant;
        $data['screening_score'] = $model->latestScreening?->match_score;
        $data['screening_status'] = $model->latestScreening?->screening_result;
        $data['interview_score'] = $assessment->total_score;
        $data['interview_result'] = $assessment->result;
        $data['assessment_test_score'] = $test->total_score;
        $data['assessment_test_result'] = $test->result;
        $data['practical_required'] = $requiresPractical;
        $data['practical_test_score'] = $requiresPractical && $practical ? $practical->total_score : null;
        $data['practical_test_result'] = $requiresPractical && $practical ? $practical->result : null;

        $final = FinalEvaluation::updateOrCreate(
            ['applicant_id' => $applicant],
            $data
        );

        // Advance applicant stage
        if (! in_array($model->stage, ['Final Evaluation', 'Offer', 'Hired', 'Rejected'], true)) {
            $model->update(['stage' => 'Final Evaluation']);
        }

        AuditLogger::log(
            action: 'Final Evaluation Completed',
            module: 'Applicant Management',
            severity: 'Info',
            targetType: 'Final Evaluation',
            targetId: (string) $final->final_evaluation_id,
            details: "Final evaluation for {$model->name} completed — Recommendation: {$final->recommendation}."
        );

        NotificationService::send(
            title: "Final evaluation completed: {$model->name}",
            body: "Recommendation: {$final->recommendation}.",
            module: 'Applicant Management',
            type: 'info',
            targetType: 'Final Evaluation',
            targetId: (string) $final->final_evaluation_id
        );

        return response()->json(new FinalEvaluationResource($final->load('applicant.jobPost.department')), 201);
    }

    /* PUT /api/v1/final-evaluations/{finalEvaluation} */
    public function update(Request $request, int $finalEvaluation): JsonResponse
    {
        $model = FinalEvaluation::findOrFail($finalEvaluation);

        $data = $request->validate([
            'evaluation_date' => ['sometimes', 'date'],
            'recommendation'  => ['sometimes', 'string', 'in:Recommended for Hire,For Another Position,Not Recommended'],
            'overall_remarks' => ['nullable', 'string'],
        ]);

        $model->update($data);

        return response()->json(new FinalEvaluationResource($model->load('applicant.jobPost.department')));
    }
}
