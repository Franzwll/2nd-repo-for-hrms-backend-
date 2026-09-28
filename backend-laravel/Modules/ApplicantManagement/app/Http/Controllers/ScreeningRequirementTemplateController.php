<?php

namespace Modules\ApplicantManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Modules\ApplicantManagement\Models\ScreeningRequirementTemplate;
use Modules\ApplicantManagement\Models\ScreeningRequirementTemplateItem;

/**
 * Requirement templates for the Screening Setup dialog
 * (Recruitment Management -> Screening setup -> Requirement Templates).
 *
 * HR defines, per Core HCM position, the requirement entities a resume must
 * satisfy — skill, job_role, certification, education and experience rows.
 * A template is then applied to a job post draft in the Job Post Builder,
 * where skills/certifications seed the post's content blocks and education /
 * experience rows fill the structured levels the NLP screening scores against.
 */
class ScreeningRequirementTemplateController extends Controller
{
    /* ------------------------------------------------------------------ */
    /* GET /api/v1/screening/requirement-templates                        */
    /* Optional ?position_id= filter and ?active= flag.                    */
    /* ------------------------------------------------------------------ */

    public function index(Request $request): JsonResponse
    {
        $query = ScreeningRequirementTemplate::query()
            ->with(['items', 'position'])
            ->orderBy('name');

        if ($request->filled('position_id')) {
            $query->where('position_id', (int) $request->input('position_id'));
        }
        if ($request->has('active')) {
            $query->where('active', $request->boolean('active'));
        }

        $rows = $query->get()
            ->map(fn (ScreeningRequirementTemplate $template) => $this->toPayload($template))
            ->values()
            ->all();

        return response()->json(['success' => true, 'data' => $rows]);
    }

    /* ------------------------------------------------------------------ */
    /* POST /api/v1/screening/requirement-templates                        */
    /* ------------------------------------------------------------------ */

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);

        $template = DB::transaction(function () use ($data) {
            $template = ScreeningRequirementTemplate::create([
                'name' => trim($data['name']),
                'position_id' => $data['position_id'],
                'description' => $data['description'] ?? null,
                'active' => $data['active'] ?? true,
            ]);

            $template->items()->createMany($data['items']);

            return $template;
        });

        $template->load(['items', 'position']);

        AuditLogger::log(
            action: 'Requirement Template Created',
            module: 'Applicant Management',
            severity: 'Info',
            targetType: 'Screening Requirement Template',
            targetId: (string) $template->template_id,
            details: "Created requirement template '{$template->name}' with "
                . count($data['items']) . ' requirement entities for '
                . ($template->position?->title ?? 'any position') . '.'
        );

        return response()->json([
            'success' => true,
            'data' => $this->toPayload($template),
            'message' => 'Requirement template created.',
        ], 201);
    }

    /* ------------------------------------------------------------------ */
    /* PUT /api/v1/screening/requirement-templates/{id}                    */
    /* Replaces the template and all of its requirement entities.          */
    /* ------------------------------------------------------------------ */

    public function update(Request $request, int $id): JsonResponse
    {
        $template = ScreeningRequirementTemplate::findOrFail($id);
        $data = $this->validated($request, $template->template_id);

        DB::transaction(function () use ($template, $data) {
            $template->update([
                'name' => trim($data['name']),
                'position_id' => $data['position_id'],
                'description' => $data['description'] ?? null,
                'active' => array_key_exists('active', $data) ? (bool) $data['active'] : $template->active,
            ]);

            $template->items()->delete();
            $template->items()->createMany($data['items']);
        });

        $template->load(['items', 'position']);

        AuditLogger::log(
            action: 'Requirement Template Updated',
            module: 'Applicant Management',
            severity: 'Info',
            targetType: 'Screening Requirement Template',
            targetId: (string) $template->template_id,
            details: "Updated requirement template '{$template->name}' "
                . "({$template->items->count()} requirement entities)."
        );

        return response()->json([
            'success' => true,
            'data' => $this->toPayload($template),
            'message' => 'Requirement template updated.',
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* PATCH /api/v1/screening/requirement-templates/{id}/toggle           */
    /* Inactive templates stay stored but are not offered in the builder.  */
    /* ------------------------------------------------------------------ */

    public function toggle(int $id): JsonResponse
    {
        $template = ScreeningRequirementTemplate::findOrFail($id);

        $template->update(['active' => ! $template->active]);
        $template->load(['items', 'position']);

        AuditLogger::log(
            action: $template->active ? 'Requirement Template Activated' : 'Requirement Template Deactivated',
            module: 'Applicant Management',
            severity: 'Info',
            targetType: 'Screening Requirement Template',
            targetId: (string) $template->template_id,
            details: ($template->active ? 'Activated' : 'Deactivated')
                . " requirement template '{$template->name}'."
        );

        return response()->json(['success' => true, 'data' => $this->toPayload($template)]);
    }

    /* ------------------------------------------------------------------ */
    /* DELETE /api/v1/screening/requirement-templates/{id}                 */
    /* ------------------------------------------------------------------ */

    public function destroy(int $id): JsonResponse
    {
        $template = ScreeningRequirementTemplate::findOrFail($id);
        $details = "{$template->name} (#{$template->template_id})";

        $template->delete();

        AuditLogger::log(
            action: 'Requirement Template Deleted',
            module: 'Applicant Management',
            severity: 'Warning',
            targetType: 'Screening Requirement Template',
            targetId: (string) $id,
            details: "Deleted requirement template '{$details}'."
        );

        return response()->json([
            'success' => true,
            'message' => "Deleted requirement template '{$details}'.",
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* Helpers                                                             */
    /* ------------------------------------------------------------------ */

    /**
     * Validates the template header + requirement entities. Entities are
     * trimmed and de-duplicated per (entity_type, value) so a template can
     * never store the same requirement twice.
     *
     * @return array<string, mixed>
     */
    private function validated(Request $request, ?int $ignoreId = null): array
    {
        $rawPosition = $request->input('position_id');
        $positionId = ($rawPosition === null || $rawPosition === '' || $rawPosition === 'none')
            ? null
            : (int) $rawPosition;

        $data = $request->validate([
            'name' => [
                'required',
                'string',
                'max:150',
                Rule::unique('screening_requirement_templates', 'name')
                    ->where(fn ($query) => $positionId === null
                        ? $query->whereNull('position_id')
                        : $query->where('position_id', $positionId))
                    ->ignore($ignoreId, 'template_id'),
            ],
            'position_id' => ['nullable', 'integer', 'exists:positions,position_id'],
            'description' => ['nullable', 'string', 'max:500'],
            'active' => ['boolean'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.entity_type' => ['required', 'string', Rule::in(ScreeningRequirementTemplateItem::TYPES)],
            'items.*.value' => ['required', 'string', 'max:255'],
            'items.*.required' => ['boolean'],
        ]);

        $items = [];
        $seen = [];
        foreach ($data['items'] as $item) {
            $value = trim((string) ($item['value'] ?? ''));
            if ($value === '') {
                continue;
            }
            $key = $item['entity_type'] . '|' . strtolower($value);
            if (isset($seen[$key])) {
                continue;
            }
            $seen[$key] = true;

            $items[] = [
                'entity_type' => $item['entity_type'],
                'value' => $value,
                'required' => array_key_exists('required', $item) ? (bool) $item['required'] : true,
            ];
        }

        if ($items === []) {
            throw ValidationException::withMessages([
                'items' => 'Add at least one requirement entity to the template.',
            ]);
        }

        $data['position_id'] = $positionId;
        $data['items'] = $items;

        return $data;
    }

    /** API shape consumed by the Screening Setup manager and builder picker. */
    private function toPayload(ScreeningRequirementTemplate $template): array
    {
        return [
            'template_id' => $template->template_id,
            'name' => $template->name,
            'position_id' => $template->position_id,
            'position_title' => $template->position?->title,
            'description' => $template->description,
            'active' => (bool) $template->active,
            'items' => $template->items
                ->map(fn (ScreeningRequirementTemplateItem $item) => [
                    'item_id' => $item->item_id,
                    'entity_type' => $item->entity_type,
                    'value' => $item->value,
                    'required' => (bool) $item->required,
                ])
                ->values()
                ->all(),
            'created_at' => $template->created_at?->toISOString(),
            'updated_at' => $template->updated_at?->toISOString(),
        ];
    }
}
