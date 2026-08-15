<?php

namespace Modules\ApplicantManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\ApplicantManagement\Http\Requests\StoreInterviewRequest;
use Modules\ApplicantManagement\Http\Requests\UpdateInterviewRequest;
use Modules\ApplicantManagement\Http\Resources\InterviewResource;
use Modules\ApplicantManagement\Models\Applicant;
use Modules\ApplicantManagement\Models\Interview;

class InterviewController extends Controller
{
    /* ------------------------------------------------------------------ */
    /* GET /api/v1/interviews                                              */
    /* ------------------------------------------------------------------ */

    public function index(Request $request): JsonResponse
    {
        $query = Interview::with('applicant')
            ->orderByDesc('scheduled_date');

        if ($applicantId = $request->query('applicant_id')) {
            $query->where('applicant_id', $applicantId);
        }
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        if ($date = $request->query('date')) {
            $query->whereDate('scheduled_date', $date);
        }

        $perPage = (int) $request->query('per_page', 15);
        $paginated = $query->paginate($perPage);

        return response()->json([
            'data' => InterviewResource::collection($paginated->items()),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'per_page'     => $paginated->perPage(),
                'total'        => $paginated->total(),
            ],
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* POST /api/v1/interviews                                             */
    /* Also advances applicant stage to "Interview Scheduled"              */
    /* ------------------------------------------------------------------ */

    public function store(StoreInterviewRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['status'] = $data['status'] ?? 'Scheduled';
        $data['interview_code'] = Interview::generateCode();

        $interview = Interview::create($data);

        // Advance applicant to "Interview Scheduled" stage
        $applicant = Applicant::findOrFail($data['applicant_id']);
        if (in_array($applicant->stage, ['Screened'])) {
            $applicant->update(['stage' => 'Interview Scheduled']);
        }

        return response()->json(new InterviewResource($interview->load('applicant')), 201);
    }

    /* ------------------------------------------------------------------ */
    /* GET /api/v1/interviews/{interview}                                  */
    /* ------------------------------------------------------------------ */

    public function show(int $interview): JsonResponse
    {
        $model = Interview::with('applicant')->findOrFail($interview);
        return response()->json(new InterviewResource($model));
    }

    /* ------------------------------------------------------------------ */
    /* PUT /api/v1/interviews/{interview}                                  */
    /* ------------------------------------------------------------------ */

    public function update(UpdateInterviewRequest $request, int $interview): JsonResponse
    {
        $model = Interview::findOrFail($interview);
        $model->update($request->validated());

        return response()->json(new InterviewResource($model->load('applicant')));
    }

    /* ------------------------------------------------------------------ */
    /* DELETE /api/v1/interviews/{interview}                               */
    /* ------------------------------------------------------------------ */

    public function destroy(int $interview): JsonResponse
    {
        Interview::findOrFail($interview)->delete();
        return response()->json(['message' => 'Interview cancelled.']);
    }
}
