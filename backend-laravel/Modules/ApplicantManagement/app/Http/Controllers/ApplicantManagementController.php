<?php

namespace Modules\ApplicantManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Modules\ApplicantManagement\Http\Requests\StoreApplicantRequest;
use Modules\ApplicantManagement\Http\Requests\UpdateApplicantRequest;
use Modules\ApplicantManagement\Http\Resources\ApplicantResource;
use Modules\ApplicantManagement\Models\Applicant;

class ApplicantManagementController extends Controller
{
    /* ------------------------------------------------------------------ */
    /* GET /api/v1/applicants                                               */
    /* ------------------------------------------------------------------ */

    public function index(Request $request): JsonResponse
    {
        $query = Applicant::with(['jobPost.department'])
            ->orderByDesc('applied_at');

        // Search by name or email
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('applicant_code', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        // Filter by stage
        if ($stage = $request->query('stage')) {
            $query->where('stage', $stage);
        }

        // Filter by job post
        if ($jobPostId = $request->query('job_post_id')) {
            $query->where('job_post_id', $jobPostId);
        }

        // Filter by source
        if ($source = $request->query('source')) {
            $query->where('source', $source);
        }

        // Exclude stages from the active pipeline (e.g. Hired, Rejected)
        if ($excludeStages = $request->query('exclude_stages')) {
            $excluded = array_filter(array_map('trim', explode(',', $excludeStages)));
            if ($excluded) {
                $query->whereNotIn('stage', $excluded);
            }
        }

        $perPage = (int) $request->query('per_page', 15);
        $paginated = $query->paginate($perPage);

        return response()->json([
            'data' => ApplicantResource::collection($paginated->items()),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'per_page'     => $paginated->perPage(),
                'total'        => $paginated->total(),
            ],
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* POST /api/v1/applicants                                              */
    /* ------------------------------------------------------------------ */

    public function store(StoreApplicantRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Handle resume upload
        if ($request->hasFile('resume')) {
            $path = $request->file('resume')->store('resumes', 'public');
            $data['resume_file_path'] = $path;
        }
        unset($data['resume']);

        $data['applicant_code'] = Applicant::generateCode();

        $applicant = Applicant::create($data);

        return response()->json(
            new ApplicantResource($applicant->load(['jobPost.department'])),
            201
        );
    }

    /* ------------------------------------------------------------------ */
    /* GET /api/v1/applicants/{applicant}                                  */
    /* ------------------------------------------------------------------ */

    public function show(int $applicant): JsonResponse
    {
        $model = Applicant::with([
            'jobPost.department',
            'screeningEntities',
            'screeningScores',
            'interviews',
            'assessment',
        ])->findOrFail($applicant);

        return response()->json(new ApplicantResource($model));
    }

    /* ------------------------------------------------------------------ */
    /* PUT /api/v1/applicants/{applicant}                                  */
    /* ------------------------------------------------------------------ */

    public function update(UpdateApplicantRequest $request, int $applicant): JsonResponse
    {
        $model = Applicant::findOrFail($applicant);
        $data  = $request->validated();

        // Handle resume replacement
        if ($request->hasFile('resume')) {
            // Delete old file if it exists
            if ($model->resume_file_path && Storage::disk('public')->exists($model->resume_file_path)) {
                Storage::disk('public')->delete($model->resume_file_path);
            }
            $data['resume_file_path'] = $request->file('resume')->store('resumes', 'public');
        }
        unset($data['resume']);

        $model->update($data);

        return response()->json(
            new ApplicantResource($model->load(['jobPost.department', 'screeningEntities', 'screeningScores', 'interviews', 'assessment']))
        );
    }

    /* ------------------------------------------------------------------ */
    /* DELETE /api/v1/applicants/{applicant}                               */
    /* ------------------------------------------------------------------ */

    public function destroy(int $applicant): JsonResponse
    {
        $model = Applicant::findOrFail($applicant);

        // Clean up resume file
        if ($model->resume_file_path && Storage::disk('public')->exists($model->resume_file_path)) {
            Storage::disk('public')->delete($model->resume_file_path);
        }

        $model->delete();

        return response()->json(['message' => 'Applicant deleted successfully.']);
    }

    /* ------------------------------------------------------------------ */
    /* POST /api/v1/applicants/{applicant}/hire                            */
    /* Advances applicant to Offer or Hired stage                          */
    /* ------------------------------------------------------------------ */

    public function hire(int $applicant): JsonResponse
    {
        $model = Applicant::findOrFail($applicant);

        $nextStage = match ($model->stage) {
            'Assessed'            => 'Offer',
            'Offer'               => 'Hired',
            'Accepted'            => 'Offer',
            default               => null,
        };

        if (! $nextStage) {
            return response()->json([
                'message' => "Cannot advance from stage '{$model->stage}' using the hire action.",
            ], 422);
        }

        $model->update(['stage' => $nextStage]);

        return response()->json(new ApplicantResource($model->load(['jobPost.department'])));
    }

    /* ------------------------------------------------------------------ */
    /* GET /api/v1/applicants/stats                                        */
    /* Summary counts for the dashboard stat cards                         */
    /* ------------------------------------------------------------------ */

    public function stats(): JsonResponse
    {
        return response()->json([
            'total'               => Applicant::count(),
            'by_stage'            => Applicant::selectRaw('stage, COUNT(*) as count')
                                              ->groupBy('stage')
                                              ->pluck('count', 'stage'),
            'by_status'           => Applicant::selectRaw('status, COUNT(*) as count')
                                               ->groupBy('status')
                                               ->pluck('count', 'status'),
            'avg_fit_score'       => (float) Applicant::whereNotNull('fit_score')->avg('fit_score'),
            'hired_this_month'    => Applicant::where('stage', 'Hired')
                                               ->whereMonth('updated_at', now()->month)
                                               ->count(),
        ]);
    }
}
