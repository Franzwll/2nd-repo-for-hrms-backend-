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
