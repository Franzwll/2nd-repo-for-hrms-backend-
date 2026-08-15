<?php

namespace Modules\NewHireOnboarding\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\NewHireOnboarding\Http\Requests\StoreChecklistTemplateRequest;
use Modules\NewHireOnboarding\Http\Resources\ChecklistTemplateResource;
use Modules\NewHireOnboarding\Models\OnboardingChecklistItem;
use Modules\NewHireOnboarding\Models\OnboardingChecklistTemplate;

class ChecklistTemplateController extends Controller
{
    /* ------------------------------------------------------------------ */
    /* GET /api/v1/checklist-templates                                     */
    /* ------------------------------------------------------------------ */

    public function index(Request $request): JsonResponse
    {
        $query = OnboardingChecklistTemplate::with('items')
            ->orderBy('phase')
            ->orderBy('title');

        if ($phase = $request->query('phase')) {
            $query->where('phase', $phase);
        }
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $perPage   = (int) $request->query('per_page', 50);
        $paginated = $query->paginate($perPage);

        return response()->json([
            'data' => ChecklistTemplateResource::collection($paginated->items()),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'per_page'     => $paginated->perPage(),
                'total'        => $paginated->total(),
            ],
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* POST /api/v1/checklist-templates                                    */
    /* ------------------------------------------------------------------ */

    public function store(StoreChecklistTemplateRequest $request): JsonResponse
    {
        $data = $request->validated();
        $items = $data['items'] ?? [];
        unset($data['items']);

        $data['template_code'] = OnboardingChecklistTemplate::generateCode();
        $data['status']        = $data['status'] ?? 'Active';

        $template = OnboardingChecklistTemplate::create($data);

        // Persist nested items
        foreach ($items as $item) {
            $template->items()->create($item);
        }

        return response()->json(
            new ChecklistTemplateResource($template->load('items')),
            201
        );
    }

    /* ------------------------------------------------------------------ */
    /* GET /api/v1/checklist-templates/{template}                          */
    /* ------------------------------------------------------------------ */

    public function show(int $template): JsonResponse
    {
        $model = OnboardingChecklistTemplate::with('items')->findOrFail($template);
        return response()->json(new ChecklistTemplateResource($model));
    }

    /* ------------------------------------------------------------------ */
    /* PUT /api/v1/checklist-templates/{template}                          */
    /* ------------------------------------------------------------------ */

    public function update(Request $request, int $template): JsonResponse
    {
        $model = OnboardingChecklistTemplate::findOrFail($template);

        $data = $request->validate([
            'title'               => ['sometimes', 'string', 'max:200'],
            'phase'               => ['sometimes', 'string', 'in:Pre-onboarding,Onboarding,Probationary,Regular'],
            'position_scope_json' => ['nullable', 'array'],
            'status'              => ['sometimes', 'string', 'in:Active,Inactive'],
        ]);

        $model->update($data);

        return response()->json(new ChecklistTemplateResource($model->load('items')));
    }

    /* ------------------------------------------------------------------ */
    /* DELETE /api/v1/checklist-templates/{template}                       */
    /* ------------------------------------------------------------------ */

    public function destroy(int $template): JsonResponse
    {
        OnboardingChecklistTemplate::findOrFail($template)->delete();
        return response()->json(['message' => 'Template deleted.']);
    }

    /* ------------------------------------------------------------------ */
    /* POST /api/v1/checklist-templates/{template}/items                   */
    /* Add a single item to an existing template                           */
    /* ------------------------------------------------------------------ */

    public function addItem(Request $request, int $template): JsonResponse
    {
        $model = OnboardingChecklistTemplate::findOrFail($template);

        $data = $request->validate([
            'item_text'  => ['required', 'string'],
            'sort_order' => ['required', 'integer', 'min:0'],
        ]);

        $item = $model->items()->create($data);

        return response()->json([
            'template_item_id' => $item->template_item_id,
            'item_text'        => $item->item_text,
            'sort_order'       => $item->sort_order,
        ], 201);
    }

    /* ------------------------------------------------------------------ */
    /* PUT /api/v1/checklist-items/{item}                                  */
    /* ------------------------------------------------------------------ */

    public function updateItem(Request $request, int $item): JsonResponse
    {
        $model = OnboardingChecklistItem::findOrFail($item);

        $data = $request->validate([
            'item_text'  => ['sometimes', 'string'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ]);

        $model->update($data);

        return response()->json([
            'template_item_id' => $model->template_item_id,
            'item_text'        => $model->item_text,
            'sort_order'       => $model->sort_order,
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* DELETE /api/v1/checklist-items/{item}                               */
    /* ------------------------------------------------------------------ */

    public function destroyItem(int $item): JsonResponse
    {
        OnboardingChecklistItem::findOrFail($item)->delete();
        return response()->json(['message' => 'Item removed.']);
    }
}
