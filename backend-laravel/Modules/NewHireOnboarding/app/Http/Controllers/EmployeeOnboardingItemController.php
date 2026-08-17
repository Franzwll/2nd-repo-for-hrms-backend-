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
    /* ------------------------------------------------------------------ */

    public function index(int $new_hire): JsonResponse
    {
        $items = EmployeeOnboardingItem::where('new_hire_id', $new_hire)
            ->orderBy('employee_onboarding_item_id')
            ->get();

        return response()->json($items->map(fn ($item) => [
            'employee_onboarding_item_id' => $item->employee_onboarding_item_id,
            'new_hire_id'                  => $item->new_hire_id,
            'employee_id'                  => $item->employee_id,
            'template_item_id'             => $item->template_item_id,
            'item_text'                    => $item->item_text,
            'done'                          => (bool) $item->done,
            'completed_at'                  => $item->completed_at?->toISOString(),
            'completed_by_user_id'          => $item->completed_by_user_id,
        ]));
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
}
