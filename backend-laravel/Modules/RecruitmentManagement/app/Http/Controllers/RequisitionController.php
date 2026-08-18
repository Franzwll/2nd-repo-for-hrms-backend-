<?php

namespace Modules\RecruitmentManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\RecruitmentManagement\Http\Requests\StoreRequisitionRequest;
use Modules\RecruitmentManagement\Http\Requests\UpdateRequisitionRequest;
use Modules\RecruitmentManagement\Http\Resources\RequisitionResource;
use Modules\RecruitmentManagement\Models\Requisition;

class RequisitionController extends Controller
{
    /* ------------------------------------------------------------------ */
    /* GET /api/v1/requisitions                                            */
    /* ------------------------------------------------------------------ */

    public function index(Request $request): JsonResponse
    {
        $query = Requisition::with(['department', 'position'])
            ->orderByDesc('requested_at');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('requisition_code', 'like', "%{$search}%")
                  ->orWhere('position_title', 'like', "%{$search}%")
                  ->orWhere('justification', 'like', "%{$search}%");
            });
        }
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        if ($deptId = $request->query('department_id')) {
            $query->where('department_id', $deptId);
        }
        if ($urgency = $request->query('urgency')) {
            $query->where('urgency', $urgency);
        }
        // exclude converted
        if ($request->boolean('pending_only')) {
            $query->where('status', '!=', 'Converted');
        }

        $perPage   = (int) $request->query('per_page', 15);
        $paginated = $query->paginate($perPage);

        return response()->json([
            'data' => RequisitionResource::collection($paginated->items()),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'per_page'     => $paginated->perPage(),
                'total'        => $paginated->total(),
            ],
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* POST /api/v1/requisitions                                           */
    /* ------------------------------------------------------------------ */

    public function store(StoreRequisitionRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['requisition_code'] = Requisition::generateCode();
        $data['status']           = $data['status'] ?? 'Pending';

        $requisition = Requisition::create($data);

        return response()->json(
            new RequisitionResource($requisition->load(['department', 'position'])),
            201
        );
    }

    /* ------------------------------------------------------------------ */
    /* GET /api/v1/requisitions/{requisition}                              */
    /* ------------------------------------------------------------------ */

    public function show(int $requisition): JsonResponse
    {
        $model = Requisition::with(['department', 'position', 'convertedJobPost'])
            ->findOrFail($requisition);

        return response()->json(new RequisitionResource($model));
    }

    /* ------------------------------------------------------------------ */
    /* PUT /api/v1/requisitions/{requisition}                              */
    /* ------------------------------------------------------------------ */

    public function update(UpdateRequisitionRequest $request, int $requisition): JsonResponse
    {
        $model = Requisition::findOrFail($requisition);
        $model->update($request->validated());

        return response()->json(new RequisitionResource($model->load(['department', 'position'])));
    }

    /* ------------------------------------------------------------------ */
    /* POST /api/v1/requisitions/{requisition}/convert                     */
    /* Mark requisition as Converted and link to the created job post      */
    /* ------------------------------------------------------------------ */

    public function convert(Request $request, int $requisition): JsonResponse
    {
        $data = $request->validate([
            'job_post_id' => ['nullable', 'integer', 'exists:job_posts,job_post_id'],
        ]);

        $model = Requisition::findOrFail($requisition);
        $model->update([
            'status'               => 'Converted',
            'converted_job_post_id'=> $data['job_post_id'] ?? null,
        ]);

        return response()->json(new RequisitionResource($model->load(['department', 'position', 'convertedJobPost'])));
    }
}
