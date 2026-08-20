<?php

namespace Modules\NewHireOnboarding\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Modules\NewHireOnboarding\Models\EmployeeOnboardingItem;
use Modules\NewHireOnboarding\Models\NewHire;

class EmployeeOnboardingItemController extends Controller
{
    /* ------------------------------------------------------------------ */
    /* GET /api/v1/new-hires/{new_hire}/onboarding-items                   */
    /* Read-time union computed in NewHire::visibleOnboardingItems():       */
    /* materialized rows + virtual items from Active checklist templates    */
    /* that match the hire's stage and position.                            */
    /*                                                                      */
    /* A checklist template is SHOW/HIDE driven:                            */
    /*  - activating a template makes its items appear (no rows inserted);  */
    /*  - deactivating (or deleting) a template hides its items again;      */
    /*  - completion state is preserved on the materialized rows.           */
    /* ------------------------------------------------------------------ */

    public function index(int $new_hire): JsonResponse
    {
        $newHire = NewHire::findOrFail($new_hire);

        return response()->json($newHire->visibleOnboardingItems());
    }

    /* ------------------------------------------------------------------ */
    /* PATCH /api/v1/onboarding-items/{item}/toggle                        */
    /* Toggle the done flag (or force it via body `done`); auto-complete   */
    /* onboarding when all items are done                                  */
    /* ------------------------------------------------------------------ */

    public function toggle(Request $request, int $item): JsonResponse
    {
        $model = EmployeeOnboardingItem::findOrFail($item);

        DB::transaction(function () use ($model, $request) {
            $nowDone = $request->has('done')
                ? (bool) $request->input('done')
                : ! $model->done;
            $model->update([
                'done'                 => $nowDone,
                'completed_at'         => $nowDone ? now() : null,
                'completed_by_user_id' => $nowDone ? ($request->user()?->id ?? null) : null,
            ]);

            // Check if all items for this new hire are complete
            if ($nowDone && $model->new_hire_id) {
                $newHire    = NewHire::with('onboardingItems')->find($model->new_hire_id);
                $allDone    = $newHire?->onboardingItems->every(fn ($i) => (bool) $i->done);

                if ($allDone && $newHire?->employee_id) {
                    // Mark the employee's onboarding_complete flag
                    \DB::table('employees')
                        ->where('employee_id', $newHire->employee_id)
                        ->update(['onboarding_complete' => true]);
                }
            }
        });

        return response()->json([
            'employee_onboarding_item_id' => $model->employee_onboarding_item_id,
            'done'                         => (bool) $model->done,
            'completed_at'                 => $model->completed_at?->toISOString(),
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* POST /api/v1/new-hires/{new_hire}/onboarding-items/bulk             */
    /* Seed items from a checklist template for a new hire                 */
    /* ------------------------------------------------------------------ */

    public function bulkCreate(Request $request, int $new_hire): JsonResponse
    {
        $model = NewHire::findOrFail($new_hire);

        $data = $request->validate([
            'template_id'  => ['required', 'integer', 'exists:onboarding_checklist_templates,template_id'],
        ]);

        $items = \Modules\NewHireOnboarding\Models\OnboardingChecklistItem
            ::where('template_id', $data['template_id'])
            ->orderBy('sort_order')
            ->get();

        // Skip template items already applied to this new hire
        $existing = $model->onboardingItems()
            ->whereNotNull('template_item_id')
            ->pluck('template_item_id')
            ->all();

        $created = [];
        foreach ($items as $templateItem) {
            if (in_array($templateItem->template_item_id, $existing, true)) {
                continue;
            }
            $oi = EmployeeOnboardingItem::create([
                'employee_id'      => $model->employee_id,
                'new_hire_id'      => $new_hire,
                'template_item_id' => $templateItem->template_item_id,
                'item_text'        => $templateItem->item_text,
                'done'             => false,
            ]);
            $created[] = $oi;
        }

        return response()->json([
            'message' => count($created) . ' onboarding items created.',
            'count'   => count($created),
        ], 201);
    }

    /* ------------------------------------------------------------------ */
    /* POST /api/v1/new-hires/{new_hire}/onboarding-items                  */
    /* Materialize a single virtual template item into a tracked row so    */
    /* its completion can be persisted (done flag, completed_at).          */
    /* ------------------------------------------------------------------ */

    public function materialize(Request $request, int $new_hire): JsonResponse
    {
        $model = NewHire::findOrFail($new_hire);

        $data = $request->validate([
            'template_item_id' => ['required', 'integer', 'exists:onboarding_checklist_items,template_item_id'],
        ]);

        $existing = $model->onboardingItems()
            ->where('template_item_id', $data['template_item_id'])
            ->first();

        if ($existing) {
            return response()->json([
                'employee_onboarding_item_id' => $existing->employee_onboarding_item_id,
                'template_item_id'             => $existing->template_item_id,
                'item_text'                    => $existing->item_text,
                'done'                          => (bool) $existing->done,
                'phase'                         => $existing->templateItem?->template?->phase
                    ?? $model->stageForOnboardingItem($existing),
            ]);
        }

        $templateItem = \Modules\NewHireOnboarding\Models\OnboardingChecklistItem
            ::findOrFail($data['template_item_id']);

        $oi = EmployeeOnboardingItem::create([
            'employee_id'      => $model->employee_id,
            'new_hire_id'      => $new_hire,
            'template_item_id' => $templateItem->template_item_id,
            'item_text'        => $templateItem->item_text,
            'done'             => false,
        ]);

        return response()->json([
            'employee_onboarding_item_id' => $oi->employee_onboarding_item_id,
            'template_item_id'             => $oi->template_item_id,
            'item_text'                    => $oi->item_text,
            'done'                          => false,
            'phase'                         => $oi->templateItem?->template?->phase
                ?? $model->stageForOnboardingItem($oi),
        ], 201);
    }
}
