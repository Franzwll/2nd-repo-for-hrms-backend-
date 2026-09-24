<?php

namespace Modules\ApplicantManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\AuditLogger;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\ApplicantManagement\Http\Resources\PracticalTestResource;
use Modules\ApplicantManagement\Models\Applicant;
use Modules\ApplicantManagement\Models\PracticalTest;
use Modules\ApplicantManagement\Services\PracticalRequirement;

class PracticalTestController extends Controller
{
    /* GET /api/v1/practical-tests */
    public function index(Request $request): JsonResponse
    {
        $query = PracticalTest::with('applicant.jobPost.department')
            ->orderByDesc('test_date')
            ->orderByDesc('practical_test_id');

        if ($applicantId = $request->query('applicant_id')) {
            $query->where('applicant_id', $applicantId);
        }
        if ($result = $request->query('result')) {
            $query->where('result', $result);
        }

        $perPage = (int) $request->query('per_page', 15);
        $paginated = $query->paginate($perPage);

        return response()->json([
            'data' => PracticalTestResource::collection($paginated->items()),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'per_page'     => $paginated->perPage(),
                'total'        => $paginated->total(),
            ],
        ]);
    }

    /* POST /api/v1/applicants/{applicant}/practical-tests             */
    /* Workflow gate: assessment test "Passed" AND the position must     */
    /* require a practical exam (job_posts.requires_practical).          */
    public function store(Request $request, int $applicant): JsonResponse
    {
        $model = Applicant::with('jobPost')->findOrFail($applicant);

        // Practical applies when the job post is flagged, or when the position is
        // one of the designated hands-on roles (same rule the UI uses).
        $positionTitle = $model->jobPost?->title;
        $requiresPractical = PracticalRequirement::required($model->jobPost, $positionTitle);
        if (! $requiresPractical) {
            return response()->json([
                'message' => "The position '".($positionTitle ?? 'this applicant')."' does not require a practical assessment.",
            ], 422);
        }

        // Workflow gate: the assessment test must be recorded and passed first.
        $test = $model->latestAssessmentTest()->first();
        if (! $test || $test->result !== 'Passed') {
            return response()->json([
                'message' => 'This candidate cannot take the practical assessment until their assessment test is recorded and marked Passed.',
            ], 422);
        }

        $data = $request->validate([
            'assessor_user_id' => ['nullable', 'integer', 'exists:system_users,system_user_id'],
            'task_title'       => ['required', 'string', 'max:190'],
            'criteria_json'    => ['nullable', 'array'],
            'scores_json'      => ['nullable', 'array'],
            'total_score'      => ['nullable', 'numeric', 'min:0', 'max:100'],
            'result'           => ['required', 'string', 'in:Passed,Failed'],
            'test_date'        => ['required', 'date'],
            'remarks'          => ['nullable', 'string'],
        ]);

        $data['applicant_id'] = $applicant;

        $practical = PracticalTest::create($data);

        // Advance applicant stage (out-of-order safety)
        if (in_array($model->stage, ['Screened', 'Interview Scheduled', 'Assessed', 'Accepted', 'Assessment Test'], true)) {
            $model->update(['stage' => 'Practical Test']);
        }

        AuditLogger::log(
            action: 'Practical Assessment Recorded',
            module: 'Applicant Management',
            severity: 'Info',
            targetType: 'Practical Test',
            targetId: (string) $practical->practical_test_id,
            details: "Recorded practical assessment \"{$practical->task_title}\" for {$model->name} with score {$practical->total_score}% and result {$practical->result}."
        );

        NotificationService::send(
            title: "Practical assessment recorded: {$model->name}",
            body: "Scored {$practical->total_score}% — Result: {$practical->result}.",
            module: 'Applicant Management',
            type: 'info',
            targetType: 'Practical Test',
            targetId: (string) $practical->practical_test_id
        );

        return response()->json(new PracticalTestResource($practical->load('applicant.jobPost.department')), 201);
    }

    /* PUT /api/v1/practical-tests/{practicalTest} */
    public function update(Request $request, int $practicalTest): JsonResponse
    {
        $model = PracticalTest::findOrFail($practicalTest);

        $data = $request->validate([
            'task_title'      => ['sometimes', 'string', 'max:190'],
            'criteria_json'   => ['nullable', 'array'],
            'scores_json'     => ['nullable', 'array'],
            'total_score'     => ['nullable', 'numeric', 'min:0', 'max:100'],
            'result'          => ['sometimes', 'string', 'in:Passed,Failed'],
            'test_date'       => ['sometimes', 'date'],
            'remarks'         => ['nullable', 'string'],
        ]);

        $model->update($data);

        return response()->json(new PracticalTestResource($model->load('applicant.jobPost.department')));
    }
}
