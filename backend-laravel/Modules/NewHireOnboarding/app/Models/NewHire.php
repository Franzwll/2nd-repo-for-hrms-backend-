<?php

namespace Modules\NewHireOnboarding\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NewHire extends Model
{
    protected $table = 'new_hires';
    protected $primaryKey = 'new_hire_id';

    protected $fillable = [
        'new_hire_code',
        'applicant_id',
        'employee_id',
        'name',
        'email',
        'phone',
        'position_id',
        'department_id',
        'stage',
        'start_date',
        'evaluation_requested_at',
    ];

    protected $casts = [
        'start_date'               => 'date',
        'evaluation_requested_at'  => 'datetime',
    ];

    /* ------------------------------------------------------------------ */
    /* Relationships                                                         */
    /* ------------------------------------------------------------------ */

    public function department(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Department::class, 'department_id', 'department_id');
    }

    public function position(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Position::class, 'position_id', 'position_id');
    }

    public function onboardingItems(): HasMany
    {
        return $this->hasMany(EmployeeOnboardingItem::class, 'new_hire_id', 'new_hire_id');
    }

    /* ------------------------------------------------------------------ */
    /* Helpers                                                              */
    /* ------------------------------------------------------------------ */

    public static function generateCode(): string
    {
        $last = static::orderByDesc('new_hire_id')->value('new_hire_code');
        $next = $last ? ((int) substr($last, 3)) + 1 : 1;
        return 'NH-' . str_pad($next, 5, '0', STR_PAD_LEFT);
    }

    public function completionPercentage(): float
    {
        $items = $this->onboardingItems;
        if ($items->isEmpty()) {
            return 0.0;
        }
        return round(($items->where('done', true)->count() / $items->count()) * 100, 1);
    }

    /** Phase for an onboarding item whose template link is missing, inferred
     *  from the hire's own stage so untagged legacy items keep working. */
    public function stageForOnboardingItem(EmployeeOnboardingItem $item): string
    {
        return match ($this->stage) {
            'Pre-onboarding' => 'Pre-onboarding',
            default          => 'Probationary',
        };
    }

    /* ------------------------------------------------------------------ */
    /* Read-time checklist union                                            */
    /* ------------------------------------------------------------------ */

    /** All Active checklist templates — fetched once per request so lists
     *  with many hires do not re-query the same templates repeatedly. */
    protected static ?\Illuminate\Support\Collection $activeTemplatesCache = null;

    protected static function activeTemplates(): \Illuminate\Support\Collection
    {
        if (static::$activeTemplatesCache === null) {
            static::$activeTemplatesCache = OnboardingChecklistTemplate::with('items')
                ->where('status', 'Active')
                ->get();
        }

        return static::$activeTemplatesCache;
    }

    /**
     * The checklist the hire actually sees right now — a read-time union that
     * responds to template changes automatically:
     *
     *  - a materialized row is shown only while its template is still Active
     *    AND still matches the hire's stage + position (legacy/manual items
     *    with no template link always stay visible);
     *  - duplicate rows copied from the same template item are collapsed into
     *    a single entry (first, newest state wins);
     *  - every un-materialized item of every matching Active template is shown
     *    as a pending "virtual" item, so activating (or creating) a template
     *    makes it appear for existing hires without copying any rows.
     *
     * Returns the exact payload used by the API (NewHireResource and the
     *  onboarding-items endpoint) so closing/opening a template responds the
     *  same way on the admin pipeline, the checklist builder and the portal.
     */
    public function visibleOnboardingItems(): array
    {
        $rows = $this->relationLoaded('onboardingItems')
            ? $this->getRelation('onboardingItems')
            : $this->onboardingItems()->with('templateItem.template')->get();

        $placedItemIds = [];
        $placedTexts = [];
        $items = [];

        foreach ($rows as $item) {
            $template = $item->templateItem?->template;

            $visible = $item->template_item_id === null
                || ($template !== null && $template->appliesTo($this));

            if (! $visible) {
                continue;
            }

            // Deduplicate rows copied from the same template item (legacy
            // double-apply artifacts) — keep the first, newest state wins.
            if ($item->template_item_id !== null) {
                if (in_array($item->template_item_id, $placedItemIds, true)) {
                    continue;
                }
                $placedItemIds[] = $item->template_item_id;
            }

            $placedTexts[] = mb_strtolower(trim((string) $item->item_text));

            $items[] = [
                'employee_onboarding_item_id' => $item->employee_onboarding_item_id,
                'new_hire_id'                  => $this->new_hire_id,
                'employee_id'                  => $item->employee_id,
                'template_item_id'             => $item->template_item_id,
                'item_text'                    => $item->item_text,
                'instructions'                 => $item->templateItem?->instructions ?? null,
                'requires_upload'              => (bool) ($item->templateItem?->requires_upload ?? false),
                'upload_placeholder'           => $item->templateItem?->upload_placeholder ?? null,
                'file_path'                    => $item->file_path,
                'file_name'                    => $item->file_name,
                'file_url'                     => $item->file_url,
                'notes'                        => $item->notes,
                'done'                         => (bool) $item->done,
                'submitted_at'                 => $item->submitted_at?->toISOString(),
                'completed_at'                 => $item->completed_at?->toISOString(),
                'phase'                        => $template !== null
                    ? $template->phase
                    : $this->stageForOnboardingItem($item),
            ];
        }

        // Virtual items: every item of every Active matching template that has
        // not been placed yet is shown as pending. Completing one materializes
        // it (POST /new-hires/{new_hire}/onboarding-items). Items whose text
        // already exists on the hire (e.g. legacy rows seeded before templates
        // were linked) are skipped too so the checklist never duplicates.
        foreach (static::activeTemplates()->filter(fn ($template) => $template->appliesTo($this)) as $template) {
            foreach ($template->items as $templateItem) {
                if (in_array($templateItem->template_item_id, $placedItemIds, true)) {
                    continue;
                }
                if (in_array(mb_strtolower(trim((string) $templateItem->item_text)), $placedTexts, true)) {
                    continue;
                }
                $items[] = [
                    'employee_onboarding_item_id' => null,
                    'new_hire_id'                  => $this->new_hire_id,
                    'employee_id'                  => $this->employee_id,
                    'template_item_id'             => $templateItem->template_item_id,
                    'item_text'                    => $templateItem->item_text,
                    'instructions'                 => $templateItem->instructions,
                    'requires_upload'              => (bool) $templateItem->requires_upload,
                    'upload_placeholder'           => $templateItem->upload_placeholder,
                    'file_path'                    => null,
                    'file_name'                    => null,
                    'file_url'                     => null,
                    'notes'                        => null,
                    'done'                         => false,
                    'completed_at'                 => null,
                    'phase'                        => $template->phase,
                ];
            }
        }

        return collect($items)->values()->all();
    }

    /** Completion percentage based on the items the hire sees right now. */
    public function visibleCompletionPercentage(): float
    {
        $items = $this->visibleOnboardingItems();
        if (empty($items)) {
            return 0.0;
        }
        $done = collect($items)->where('done', true)->count();

        return round(($done / count($items)) * 100, 1);
    }
}
