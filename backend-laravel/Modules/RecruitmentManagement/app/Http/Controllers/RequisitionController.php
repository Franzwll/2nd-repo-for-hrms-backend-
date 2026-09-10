<?php

namespace Modules\RecruitmentManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\RecruitmentManagement\Http\Requests\StoreRequisitionRequest;
use Modules\RecruitmentManagement\Http\Requests\UpdateRequisitionRequest;
use Modules\RecruitmentManagement\Http\Resources\RequisitionResource;
use Modules\RecruitmentManagement\Models\Requisition;
use App\Services\AuditLogger;

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

        // No duplicate active requisition for the same dept + position.
        // The requisition itself is editable, so point the user to edit instead.
        $dup = $this->findActiveDuplicate(
            (int) $data['department_id'],
            $data['position_id'] ?? null,
            $data['position_title'] ?? null
        );
        if ($dup && ! $request->boolean('force_create')) {
            return response()->json([
                'code' => 'DUPLICATE_REQUISITION',
                'message' => "An active requisition ({$dup->requisition_code}) already exists for this department and position. Edit it instead of creating a new one.",
                'existing_requisition_code' => $dup->requisition_code,
                'existing_requisition_id' => $dup->getKey(),
            ], 409);
        }

        $data['requisition_code'] = Requisition::generateCode();
        $data['status']           = $data['status'] ?? 'Pending';

        $requisition = Requisition::create($data);

        AuditLogger::log(
            action: 'Requisition Created',
            module: 'Recruitment Management',
            targetType: 'Requisition',
            targetId: (string) $requisition->getKey(),
            details: "Created requisition {$requisition->requisition_code} (status: {$requisition->status}).",
        );

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
        $validated = $request->validated();

        // If dept/position changes, re-check duplicate (excluding self).
        $deptId = (int) ($validated['department_id'] ?? $model->department_id);
        $posId = $validated['position_id'] ?? $model->position_id;
        $posTitle = $validated['position_title'] ?? $model->position_title;
        $dup = $this->findActiveDuplicate($deptId, $posId, $posTitle, $model->getKey());
        if ($dup && ! $request->boolean('force_update')) {
            return response()->json([
                'code' => 'DUPLICATE_REQUISITION',
                'message' => "Another active requisition ({$dup->requisition_code}) already covers this department and position.",
                'existing_requisition_code' => $dup->requisition_code,
                'existing_requisition_id' => $dup->getKey(),
            ], 409);
        }

        $model->update($validated);

        AuditLogger::log(
            action: 'Requisition Updated',
            module: 'Recruitment Management',
            targetType: 'Requisition',
            targetId: (string) $model->getKey(),
            details: "Updated requisition {$model->requisition_code} (status: {$model->status}).",
        );

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

        AuditLogger::log(
            action: 'Requisition Converted',
            module: 'Recruitment Management',
            targetType: 'Requisition',
            targetId: (string) $model->getKey(),
            details: "Converted requisition {$model->requisition_code} to a job post.",
        );

        return response()->json(new RequisitionResource($model->load(['department', 'position', 'convertedJobPost'])));
    }

    /* ------------------------------------------------------------------ */
    /* DELETE /api/v1/requisitions/{requisition} — superadmin only         */
    /* ------------------------------------------------------------------ */

    public function destroy(Request $request, int $requisition): JsonResponse
    {
        $user = $request->user();
        if (! $user || ! method_exists($user, 'isSuperAdmin') || ! $user->isSuperAdmin()) {
            return response()->json(['message' => 'Only a super admin can delete requisitions.'], 403);
        }

        $model = Requisition::findOrFail($requisition);

        if ($model->status === 'Converted') {
            return response()->json([
                'message' => 'Converted requisitions cannot be deleted because they are linked to a job post. They remain as history.',
            ], 422);
        }

        $code = $model->requisition_code;
        $model->delete();

        AuditLogger::log(
            action: 'Requisition Deleted',
            module: 'Recruitment Management',
            targetType: 'Requisition',
            targetId: (string) $requisition,
            details: "Deleted requisition {$code} (was status: {$model->status}).",
        );

        return response()->json(['message' => "Requisition {$code} deleted."]);
    }

    /**
     * Active = Pending or Done. Converted rows are history and never block.
     * Matches on position_id when present, else falls back to position_title.
     */
    private function findActiveDuplicate(int $departmentId, mixed $positionId, mixed $positionTitle, mixed $exceptId = null): ?Requisition
    {
        $query = Requisition::where('department_id', $departmentId)
            ->whereIn('status', ['Pending', 'Done']);

        if (! empty($positionId)) {
            $query->where('position_id', $positionId);
        } elseif (! empty($positionTitle)) {
            $query->where('position_title', $positionTitle);
        } else {
            return null;
        }

        if ($exceptId !== null) {
            $query->where($query->getModel()->getKeyName(), '!=', $exceptId);
        }

        return $query->first();
    }
}
