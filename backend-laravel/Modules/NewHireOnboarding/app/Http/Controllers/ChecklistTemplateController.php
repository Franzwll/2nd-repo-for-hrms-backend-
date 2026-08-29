<?php

namespace Modules\NewHireOnboarding\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\NewHireOnboarding\Http\Requests\StoreChecklistTemplateRequest;
use Modules\NewHireOnboarding\Http\Resources\ChecklistTemplateResource;
use Modules\NewHireOnboarding\Models\OnboardingChecklistItem;
use Modules\NewHireOnboarding\Models\OnboardingChecklistTemplate;
use App\Services\AuditLogger;

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

        AuditLogger::log(
            action: 'Checklist Template Created',
            module: 'New Hire Onboarding',
            targetType: 'Checklist Template',
            targetId: (string) $template->getKey(),
            details: "Created onboarding checklist template '{$template->title}' (status: {$template->status}).",
        );

        // Persist nested items
        foreach ($items as $item) {
            $template->items()->create($item);
        }

        // Templates are read-time only: activating a template does NOT insert
        // rows into each new hire's checklist — matching hires simply start
        // seeing its items (see EmployeeOnboardingItemController@index).
        $payload = (new ChecklistTemplateResource($template->load('items')))->resolve();

        return response()->json($payload, 201);
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
            'title'                      => ['sometimes', 'string', 'max:200'],
            'phase'                      => ['sometimes', 'string', 'in:Pre-onboarding,Onboarding,Probationary,Regular'],
            'position_scope_json'        => ['nullable', 'array'],
            'status'                     => ['sometimes', 'string', 'in:Active,Inactive,Closed'],
            'items'                      => ['nullable', 'array'],
            'items.*.item_text'          => ['required', 'string'],
            'items.*.instructions'       => ['nullable', 'string'],
            'items.*.requires_upload'    => ['nullable', 'boolean'],
            'items.*.upload_placeholder' => ['nullable', 'string', 'max:255'],
            'items.*.sort_order'         => ['nullable', 'integer', 'min:0'],
        ]);

        // "Closed" is the builder's label; the DB only stores Active/Inactive.
        if (isset($data['status']) && $data['status'] === 'Closed') {
            $data['status'] = 'Inactive';
        }

        // Reconcile the item set IN PLACE: existing template items keep their
        // template_item_id (so already-applied new-hire rows stay linked and
        // never duplicate), new items are created, removed items are deleted.
        $items = $data['items'] ?? null;
        unset($data['items']);

        $model->update($data);

        AuditLogger::log(
            action: 'Checklist Template Updated',
            module: 'New Hire Onboarding',
            targetType: 'Checklist Template',
            targetId: (string) $model->getKey(),
            details: "Updated onboarding checklist template '{$model->title}' (status: {$model->status}).",
        );

        if ($items !== null) {
            $existingItems = $model->items()->get();
            $existingById  = $existingItems->keyBy('template_item_id');

            $updatedIds = [];
            foreach ($items as $index => $item) {
                $existing = $existingItems->values()->get($index);
                $itemPayload = [
                    'item_text'          => $item['item_text'],
                    'instructions'       => $item['instructions'] ?? null,
                    'requires_upload'    => (bool) ($item['requires_upload'] ?? false),
                    'upload_placeholder' => $item['upload_placeholder'] ?? null,
                    'sort_order'         => $item['sort_order'] ?? $index,
                ];

                if ($existing) {
                    $existing->update($itemPayload);
                    $updatedIds[] = $existing->template_item_id;
                } else {
                    $created = $model->items()->create($itemPayload);
                    $updatedIds[] = $created->template_item_id;
                }
            }

            // Drop template items that were removed from the checklist — their
            // copied new-hire rows become orphans and are hidden at read time.
            $existingItems->whereNotIn('template_item_id', $updatedIds)
                ->each->delete();
        }

        $payload = (new ChecklistTemplateResource($model->load('items')))->resolve();

        return response()->json($payload);
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

        AuditLogger::log(
            action: 'Checklist Template Item Updated',
            module: 'New Hire Onboarding',
            targetType: 'Checklist Template Item',
            targetId: (string) $model->getKey(),
            details: "Updated checklist item text for template item (ID: {$model->template_item_id}).",
        );

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
