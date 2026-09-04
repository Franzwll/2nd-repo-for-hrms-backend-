<?php

namespace Modules\NewHireOnboarding\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\NewHireOnboarding\Http\Requests\StoreChecklistRequestRequest;
use Modules\NewHireOnboarding\Http\Resources\ChecklistRequestResource;
use Modules\NewHireOnboarding\Models\ChecklistRequest;
use App\Services\AuditLogger;

class ChecklistRequestController extends Controller
{
    /* ------------------------------------------------------------------ */
    /* GET /api/v1/checklist-requests                                      */
    /* ------------------------------------------------------------------ */

    public function index(Request $request): JsonResponse
    {
        $query = ChecklistRequest::with('template')
            ->orderByDesc('requested_at');

        if ($employeeId = $request->query('employee_id')) {
            $query->where('employee_id', $employeeId);
        }
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        if ($phase = $request->query('phase')) {
            $query->where('phase', $phase);
        }

        $perPage   = (int) $request->query('per_page', 15);
        $paginated = $query->paginate($perPage);

        return response()->json([
            'data' => ChecklistRequestResource::collection($paginated->items()),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'per_page'     => $paginated->perPage(),
                'total'        => $paginated->total(),
            ],
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* POST /api/v1/checklist-requests                                     */
    /* ------------------------------------------------------------------ */

    public function store(StoreChecklistRequestRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['request_code'] = ChecklistRequest::generateCode();
        $data['status']       = 'Pending';

        $cr = ChecklistRequest::create($data);

        AuditLogger::log(
            action: 'Checklist Request Created',
            module: 'New Hire Onboarding',
            targetType: 'Checklist Request',
            targetId: (string) $cr->getKey(),
            details: "Created onboarding checklist request {$cr->request_code} (status: {$cr->status}).",
        );

        return response()->json(
            new ChecklistRequestResource($cr->load('template')),
            201
        );
    }

    /* ------------------------------------------------------------------ */
    /* GET /api/v1/checklist-requests/{request}                            */
    /* ------------------------------------------------------------------ */

    public function show(int $checklistRequest): JsonResponse
    {
        $model = ChecklistRequest::with('template')->findOrFail($checklistRequest);
        return response()->json(new ChecklistRequestResource($model));
    }

    /* ------------------------------------------------------------------ */
    /* PUT /api/v1/checklist-requests/{request}                            */
    /* ------------------------------------------------------------------ */

    public function update(Request $request, int $checklistRequest): JsonResponse
    {
        $model = ChecklistRequest::findOrFail($checklistRequest);

        $data = $request->validate([
            'phase'      => ['sometimes', 'string', 'in:Pre-onboarding,Probationary,Regular'],
            'items_json' => ['nullable', 'array'],
            'status'     => ['sometimes', 'string', 'in:Pending,Approved,Rejected,Completed'],
        ]);

        $model->update($data);

        AuditLogger::log(
            action: 'Checklist Request Updated',
            module: 'New Hire Onboarding',
            targetType: 'Checklist Request',
            targetId: (string) $model->getKey(),
            details: "Updated onboarding checklist request {$model->request_code} (status: {$model->status}).",
        );

        return response()->json(new ChecklistRequestResource($model->load('template')));
    }

    /* ------------------------------------------------------------------ */
    /* POST /api/v1/checklist-requests/{request}/approve                   */
    /* ------------------------------------------------------------------ */

    public function approve(int $checklistRequest): JsonResponse
    {
        $model = ChecklistRequest::findOrFail($checklistRequest);

        if ($model->status !== 'Pending') {
            return response()->json([
                'message' => "Cannot approve a request with status '{$model->status}'.",
            ], 422);
        }

        $model->update(['status' => 'Approved']);

        return response()->json(new ChecklistRequestResource($model->load('template')));
    }

    /* ------------------------------------------------------------------ */
    /* POST /api/v1/checklist-requests/{request}/reject                    */
    /* ------------------------------------------------------------------ */

    public function reject(Request $request, int $checklistRequest): JsonResponse
    {
        $model = ChecklistRequest::findOrFail($checklistRequest);

        if ($model->status !== 'Pending') {
            return response()->json([
                'message' => "Cannot reject a request with status '{$model->status}'.",
            ], 422);
        }

        $model->update(['status' => 'Rejected']);

        return response()->json(new ChecklistRequestResource($model->load('template')));
    }
}
