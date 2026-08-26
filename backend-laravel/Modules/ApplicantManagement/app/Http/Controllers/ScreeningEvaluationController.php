<?php

namespace Modules\ApplicantManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\ApplicantManagement\Models\Applicant;
use Modules\ApplicantManagement\Models\ScreeningGroundTruth;
use Modules\ApplicantManagement\Services\EvaluationService;

class ScreeningEvaluationController extends Controller
{
    public function __construct(protected EvaluationService $evaluation)
    {
    }

    /* ------------------------------------------------------------------ */
    /* POST /api/v1/applicants/{applicant}/ground-truth                    */
    /* Records the expert/actual qualification labels used for research     */
    /* evaluation (SOP 2, 3 and 5).                                         */
    /* ------------------------------------------------------------------ */

    public function storeGroundTruth(Request $request, int $applicant): JsonResponse
    {
        $model = Applicant::findOrFail($applicant);

        $validated = $request->validate([
            'job_post_id' => ['nullable', 'integer', 'exists:job_posts,job_post_id'],
            'true_screening_result' => ['required', 'string', 'in:fit,other-role,credential,not-fit'],
            'true_qualification_score' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'true_missing_information' => ['nullable', 'array'],
            'true_unrecognized_skills' => ['nullable', 'array'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $truth = ScreeningGroundTruth::updateOrCreate(
            ['applicant_id' => $model->applicant_id],
            [
                'job_post_id' => $validated['job_post_id'] ?? $model->job_post_id,
                'true_screening_result' => $validated['true_screening_result'],
                'true_qualification_score' => $validated['true_qualification_score'] ?? null,
                'true_missing_information_json' => $validated['true_missing_information'] ?? null,
                'true_unrecognized_skills_json' => $validated['true_unrecognized_skills'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]
        );

        AuditLogger::log(
            action: 'Screening Ground Truth Recorded',
            module: 'Applicant Management',
            severity: 'Info',
            targetType: 'Applicant',
            targetId: (string) $model->applicant_id,
            details: "Expert screening label '{$truth->true_screening_result}' recorded for {$model->name}."
        );

        return response()->json(['data' => $truth], 201);
    }

    /* ------------------------------------------------------------------ */
    /* GET /api/v1/applicants/screening-stats                              */
    /* SOP 1 - parsing / processing statistics.                             */
    /* ------------------------------------------------------------------ */

    public function stats(): JsonResponse
    {
        return response()->json(['data' => $this->evaluation->sop1ParsingStats()]);
    }

    /* ------------------------------------------------------------------ */
    /* GET /api/v1/evaluation/sop2-detection                               */
    /* GET /api/v1/evaluation/sop3-screening-metrics                        */
    /* GET /api/v1/evaluation/sop5-score-alignment                         */
    /* ------------------------------------------------------------------ */

    public function sop2(): JsonResponse
    {
        return response()->json(['data' => $this->evaluation->sop2DetectionAgreement()]);
    }

    public function sop3(): JsonResponse
    {
        return response()->json(['data' => $this->evaluation->sop3ScreeningMetrics()]);
    }

    public function sop5(): JsonResponse
    {
        return response()->json(['data' => $this->evaluation->sop5ScoreAlignment()]);
    }
}
