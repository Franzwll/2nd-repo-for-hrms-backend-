<?php

namespace Modules\RecruitmentManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Modules\RecruitmentManagement\Http\Requests\StoreJobPostRequest;
use Modules\RecruitmentManagement\Http\Requests\UpdateJobPostRequest;
use Modules\RecruitmentManagement\Http\Resources\JobPostResource;
use Modules\RecruitmentManagement\Models\JobPost;
use Modules\RecruitmentManagement\Models\JobPostPlatform;

class RecruitmentManagementController extends Controller
{
    /* ------------------------------------------------------------------ */
    /* GET /api/v1/job-posts                                               */
    /* ------------------------------------------------------------------ */

    public function index(Request $request): JsonResponse
    {
        $query = JobPost::with(['department', 'platforms', 'applicants'])
            ->orderByDesc('created_at');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhereHas('department', fn ($d) => $d->where('name', 'like', "%{$search}%"));
            });
        }
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        if ($deptId = $request->query('department_id')) {
            $query->where('department_id', $deptId);
        }
        // date range: '7', '30', '90', 'year'
        if ($dateRange = $request->query('date_range')) {
            $cutoff = match ($dateRange) {
                '7'    => now()->subDays(7),
                '30'   => now()->subDays(30),
                '90'   => now()->subDays(90),
                'year' => now()->startOfYear(),
                default => null,
            };
            if ($cutoff) {
                $query->where('posted_date', '>=', $cutoff->toDateString());
            }
        }

        $perPage   = (int) $request->query('per_page', 15);
        $paginated = $query->paginate($perPage);

        return response()->json([
            'data' => JobPostResource::collection($paginated->items()),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'per_page'     => $paginated->perPage(),
                'total'        => $paginated->total(),
            ],
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* POST /api/v1/job-posts                                              */
    /* ------------------------------------------------------------------ */

    public function store(StoreJobPostRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Map frontend field names to DB column names
        $data['slug']                  = JobPost::generateSlug($data['title']);
        $data['responsibilities_json'] = $data['responsibilities'] ?? [];
        $data['qualifications_json']   = $data['qualifications']   ?? [];
        $data['skills_json']           = $data['skills']           ?? [];
        $data['benefits_json']         = $data['benefits']         ?? [];
        $data['posted_date']           = $data['posted_date']      ?? now()->toDateString();

        $platforms = $data['platforms'] ?? [];
        unset($data['responsibilities'], $data['qualifications'], $data['skills'], $data['benefits'], $data['platforms']);

        $jobPost = JobPost::create($data);

        // Write platform rows
        $this->syncPlatforms($jobPost, $platforms);

        return response()->json(
            new JobPostResource($jobPost->load(['department', 'platforms'])),
            201
        );
    }

    /* ------------------------------------------------------------------ */
    /* GET /api/v1/job-posts/{job_post}                                    */
    /* ------------------------------------------------------------------ */

    public function show(int $job_post): JsonResponse
    {
        $model = JobPost::with(['department', 'platforms', 'applicants'])->findOrFail($job_post);
        return response()->json(new JobPostResource($model));
    }

    /* ------------------------------------------------------------------ */
    /* PUT /api/v1/job-posts/{job_post}                                    */
    /* ------------------------------------------------------------------ */

    public function update(UpdateJobPostRequest $request, int $job_post): JsonResponse
    {
        $model = JobPost::findOrFail($job_post);
        $data  = $request->validated();

        if (isset($data['responsibilities'])) {
            $data['responsibilities_json'] = $data['responsibilities'];
            unset($data['responsibilities']);
        }
        if (isset($data['qualifications'])) {
            $data['qualifications_json'] = $data['qualifications'];
            unset($data['qualifications']);
        }
        if (isset($data['skills'])) {
            $data['skills_json'] = $data['skills'];
            unset($data['skills']);
        }
        if (isset($data['benefits'])) {
            $data['benefits_json'] = $data['benefits'];
            unset($data['benefits']);
        }

        $platforms = $data['platforms'] ?? null;
        unset($data['platforms']);

        $model->update($data);

        if ($platforms !== null) {
            $this->syncPlatforms($model, $platforms);
        }

        return response()->json(new JobPostResource($model->load(['department', 'platforms'])));
    }

    /* ------------------------------------------------------------------ */
    /* DELETE /api/v1/job-posts/{job_post}                                 */
    /* ------------------------------------------------------------------ */

    public function destroy(int $job_post): JsonResponse
    {
        JobPost::findOrFail($job_post)->delete();
        return response()->json(['message' => 'Job post deleted.']);
    }

    /* ------------------------------------------------------------------ */
    /* PATCH /api/v1/job-posts/{job_post}/toggle                           */
    /* Flip active flag; also updates status (Open <-> Closed)             */
    /* ------------------------------------------------------------------ */

    public function toggleActive(int $job_post): JsonResponse
    {
        $model     = JobPost::findOrFail($job_post);
        $newActive = ! $model->active;
        $model->update([
            'active' => $newActive,
            'status' => $newActive ? 'Open' : 'Closed',
        ]);
        return response()->json(new JobPostResource($model->load(['department', 'platforms'])));
    }

    /* ------------------------------------------------------------------ */
    /* POST /api/v1/job-posts/{job_post}/publish                           */
    /* Set status=Open and persist platform choices                        */
    /* ------------------------------------------------------------------ */

    public function publish(Request $request, int $job_post): JsonResponse
    {
        $model = JobPost::findOrFail($job_post);

        $data = $request->validate([
            'platforms'   => ['required', 'array', 'min:1'],
            'platforms.*' => ['string', 'in:Website,Facebook,Instagram,Indeed'],
        ]);

        $model->update([
            'status'      => 'Open',
            'active'      => true,
            'posted_date' => $model->posted_date ?? now()->toDateString(),
        ]);

        $this->syncPlatforms($model, $data['platforms']);

        return response()->json(new JobPostResource($model->load(['department', 'platforms'])));
    }

    /* ------------------------------------------------------------------ */
    /* GET /api/v1/job-posts/stats                                         */
    /* ------------------------------------------------------------------ */

    public function stats(): JsonResponse
    {
        return response()->json([
            'total'            => JobPost::count(),
            'open'             => JobPost::where('status', 'Open')->count(),
            'draft'            => JobPost::where('status', 'Draft')->count(),
            'closed'           => JobPost::where('status', 'Closed')->count(),
            'total_vacancies'  => (int) JobPost::sum('vacancies'),
            'total_filled'     => (int) JobPost::sum('filled_count'),
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* Private helpers                                                      */
    /* ------------------------------------------------------------------ */

    private function syncPlatforms(JobPost $jobPost, array $platforms): void
    {
        // Unpublish removed platforms
        JobPostPlatform::where('job_post_id', $jobPost->job_post_id)
            ->whereNotIn('platform', $platforms)
            ->update(['status' => 'unpublished']);

        // Upsert active platforms
        foreach ($platforms as $platform) {
            JobPostPlatform::updateOrCreate(
                ['job_post_id' => $jobPost->job_post_id, 'platform' => $platform],
                ['status' => 'published', 'published_at' => now()]
            );
        }
    }
}
