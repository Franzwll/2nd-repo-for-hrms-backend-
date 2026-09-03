<?php

namespace Modules\ApplicantManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\ApplicantManagement\Http\Requests\StoreAssessmentRequest;
use Modules\ApplicantManagement\Http\Resources\AssessmentResource;
use Modules\ApplicantManagement\Models\Applicant;
use Modules\ApplicantManagement\Models\ApplicantAssessment;

class ApplicantAssessmentController extends Controller
{
    /* ------------------------------------------------------------------ */
    /* GET /api/v1/assessments                                             */
    /* List assessments with optional applicant filter                     */
    /* ------------------------------------------------------------------ */

    public function index(Request $request): JsonResponse
    {
        $query = ApplicantAssessment::with('applicant.jobPost.department')
            ->orderByDesc('assessment_date')
            ->orderByDesc('assessment_id');

        if ($applicantId = $request->query('applicant_id')) {
            $query->where('applicant_id', $applicantId);
        }
        if ($outcome = $request->query('outcome')) {
            $query->where('outcome', $outcome);
        }

        $perPage = (int) $request->query('per_page', 15);
        $paginated = $query->paginate($perPage);

        return response()->json([
            'data' => AssessmentResource::collection($paginated->items()),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'per_page'     => $paginated->perPage(),
                'total'        => $paginated->total(),
            ],
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* POST /api/v1/applicants/{applicant}/assessments                     */
    /* Records an assessment; advances applicant stage to "Assessed"       */
    /* ------------------------------------------------------------------ */

    public function store(StoreAssessmentRequest $request, int $applicant): JsonResponse
    {
        $model = Applicant::findOrFail($applicant);

        $data = $request->validated();
        $data['applicant_id'] = $applicant;

        $assessment = ApplicantAssessment::create($data);

        // Advance applicant stage
        if (in_array($model->stage, ['Screened', 'Interview Scheduled'])) {
            $model->update(['stage' => 'Assessed']);
        }

        // Update fit_score from total_score if present
        if (isset($data['total_score'])) {
            $model->update(['fit_score' => $data['total_score']]);
        }

        \App\Services\AuditLogger::log(
            action: 'Interview Assessment Completed',
            module: 'Applicant Management',
            severity: 'Info',
            targetType: 'Assessment',
            targetId: (string) $assessment->assessment_id,
            details: "Recorded assessment for {$model->name} with total score {$assessment->total_score}% and outcome {$assessment->outcome}."
        );

        \App\Services\NotificationService::send(
            title: "Assessment completed: {$model->name}",
            body: "Scored {$assessment->total_score}% — Outcome: {$assessment->outcome}.",
            module: 'Applicant Management',
            type: 'info',
            targetType: 'Assessment',
            targetId: (string) $assessment->assessment_id
        );

        return response()->json(new AssessmentResource($assessment), 201);
    }

    /* ------------------------------------------------------------------ */
    /* PUT /api/v1/assessments/{assessment}                                */
    /* ------------------------------------------------------------------ */

    public function update(Request $request, int $assessment): JsonResponse
    {
        $model = ApplicantAssessment::findOrFail($assessment);

        $data = $request->validate([
            'scores_json'  => ['nullable', 'array'],
            'total_score'  => ['nullable', 'numeric', 'min:0', 'max:100'],
            'outcome'      => ['sometimes', 'string', 'in:Recommended,Hold,Not Recommended'],
            'remarks'      => ['nullable', 'string'],
        ]);

        $model->update($data);

        // Sync fit_score on the parent applicant if total_score changed
        if (isset($data['total_score'])) {
            $model->applicant->update(['fit_score' => $data['total_score']]);
        }

        return response()->json(new AssessmentResource($model));
    }
}
