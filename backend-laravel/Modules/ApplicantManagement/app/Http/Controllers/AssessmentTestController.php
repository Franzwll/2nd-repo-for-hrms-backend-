<?php

namespace Modules\ApplicantManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\AuditLogger;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\ApplicantManagement\Http\Resources\AssessmentTestResource;
use Modules\ApplicantManagement\Models\Applicant;
use Modules\ApplicantManagement\Models\AssessmentTest;

class AssessmentTestController extends Controller
{
    /* GET /api/v1/assessment-tests */
    public function index(Request $request): JsonResponse
    {
        $query = AssessmentTest::with('applicant.jobPost.department')
            ->orderByDesc('test_date')
            ->orderByDesc('assessment_test_id');

        if ($applicantId = $request->query('applicant_id')) {
            $query->where('applicant_id', $applicantId);
        }
        if ($result = $request->query('result')) {
            $query->where('result', $result);
        }

        $perPage = (int) $request->query('per_page', 15);
        $paginated = $query->paginate($perPage);

        return response()->json([
            'data' => AssessmentTestResource::collection($paginated->items()),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'per_page'     => $paginated->perPage(),
                'total'        => $paginated->total(),
            ],
        ]);
    }

    /* POST /api/v1/applicants/{applicant}/assessment-tests            */
    /* Workflow gate: the interview assessment must be "Passed" first.  */
    public function store(Request $request, int $applicant): JsonResponse
    {
        $model = Applicant::with('jobPost')->findOrFail($applicant);

        // Workflow gate: only candidates who passed the interview assessment
        // may take the assessment test.
        $assessment = $model->assessment()->first();
        if (! $assessment || $assessment->result !== 'Passed') {
            return response()->json([
                'message' => 'This candidate cannot take the assessment test until their interview assessment is recorded and marked Passed.',
            ], 422);
        }

        $data = $request->validate([
            'assessor_user_id' => ['nullable', 'integer', 'exists:system_users,system_user_id'],
            'test_title'       => ['required', 'string', 'max:190'],
            'questions_json'   => ['nullable', 'array'],
            'scores_json'      => ['nullable', 'array'],
            'total_score'      => ['nullable', 'numeric', 'min:0', 'max:100'],
            'passing_score'    => ['nullable', 'numeric', 'min:0', 'max:100'],
            'result'           => ['required', 'string', 'in:Passed,Failed'],
            'test_date'        => ['required', 'date'],
            'remarks'          => ['nullable', 'string'],
        ]);

        // Consistency check: a result must agree with the score vs. passing score.
        if (isset($data['total_score'], $data['passing_score'])) {
            if (($data['total_score'] >= $data['passing_score']) !== ($data['result'] === 'Passed')) {
                return response()->json([
                    'message' => 'Score and result are inconsistent: the result must match the computed score against the passing score.',
                ], 422);
            }
        }

        $data['applicant_id'] = $applicant;
        $data['passing_score'] = $data['passing_score'] ?? 75.00;

        $test = AssessmentTest::create($data);

        // Advance applicant stage (out-of-order safety)
        if (in_array($model->stage, ['Screened', 'Interview Scheduled', 'Assessed', 'Accepted'], true)) {
            $model->update(['stage' => 'Assessment Test']);
        }

        AuditLogger::log(
            action: 'Assessment Test Recorded',
            module: 'Applicant Management',
            severity: 'Info',
            targetType: 'Assessment Test',
            targetId: (string) $test->assessment_test_id,
            details: "Recorded assessment test \"{$test->test_title}\" for {$model->name} with score {$test->total_score}% and result {$test->result}."
        );

        NotificationService::send(
            title: "Assessment test recorded: {$model->name}",
            body: "Scored {$test->total_score}% — Result: {$test->result}.",
            module: 'Applicant Management',
            type: 'info',
            targetType: 'Assessment Test',
            targetId: (string) $test->assessment_test_id
        );

        return response()->json(new AssessmentTestResource($test->load('applicant.jobPost.department')), 201);
    }

    /* PUT /api/v1/assessment-tests/{assessmentTest} */
    public function update(Request $request, int $assessmentTest): JsonResponse
    {
        $model = AssessmentTest::findOrFail($assessmentTest);

        $data = $request->validate([
            'test_title'      => ['sometimes', 'string', 'max:190'],
            'questions_json'  => ['nullable', 'array'],
            'scores_json'     => ['nullable', 'array'],
            'total_score'     => ['nullable', 'numeric', 'min:0', 'max:100'],
            'passing_score'   => ['nullable', 'numeric', 'min:0', 'max:100'],
            'result'          => ['sometimes', 'string', 'in:Passed,Failed'],
            'test_date'       => ['sometimes', 'date'],
            'remarks'         => ['nullable', 'string'],
        ]);

        $model->update($data);

        return response()->json(new AssessmentTestResource($model->load('applicant.jobPost.department')));
    }
}
