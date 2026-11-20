<?php

namespace Modules\NewHireOnboarding\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class OnboardingChecklistTemplate extends Model
{
    protected $table = 'onboarding_checklist_templates';
    protected $primaryKey = 'template_id';

    protected $fillable = [
        'template_code',
        'title',
        'phase',
        'position_scope_json',
        'status',
        'items_json',
    ];

    protected $casts = [
        'position_scope_json' => 'array',
        'items_json' => 'array',
    ];

    /** Every template item keyed by template_item_id, cached per request. */
    protected static ?Collection $itemIndexCache = null;

    /**
     * Checklist items hydrated from items_json (Phase 4a).
     *
     * When the legacy child table still exists (for example right after a
     * migrate:rollback) the items come from the real relation; otherwise they
     * are hydrated from this template's items_json column, preserving each
     * item's id, text, upload flag and sort order.
     */
    public function getItemsAttribute(): Collection
    {
        if (Schema::hasTable('onboarding_checklist_items')) {
            return $this->hasMany(OnboardingChecklistItem::class, 'template_id', 'template_id')
                ->orderBy('sort_order')
                ->orderBy('template_item_id')
                ->get();
        }

        return collect($this->itemsArray())
            ->map(fn (array $item) => $this->hydrateItem($item, $this))
            ->sortBy([['sort_order', 'asc'], ['template_item_id', 'asc']])
            ->values();
    }

    /** Raw item arrays for this template (legacy table during rollback). */
    public function itemsArray(): array
    {
        if (Schema::hasTable('onboarding_checklist_items')) {
            return DB::table('onboarding_checklist_items')
                ->where('template_id', $this->template_id)
                ->orderBy('sort_order')
                ->orderBy('template_item_id')
                ->get()
                ->map(fn ($row) => (array) $row)
                ->all();
        }

        $raw = $this->items_json;
        if (is_string($raw)) {
            $raw = json_decode($raw, true);
        }

        return is_array($raw) ? array_values($raw) : [];
    }

    /** Replace this template's item list (keeps the array cast encoded). */
    public function persistItems(array $items): void
    {
        $normalized = collect($items)->map(fn (array $item) => [
            'template_item_id'   => (int) ($item['template_item_id'] ?? 0),
            'template_id'        => (int) ($item['template_id'] ?? $this->template_id),
            'item_text'          => (string) ($item['item_text'] ?? ''),
            'instructions'       => $item['instructions'] ?? null,
            'requires_upload'    => (bool) ($item['requires_upload'] ?? false),
            'upload_placeholder' => $item['upload_placeholder'] ?? null,
            'sort_order'         => (int) ($item['sort_order'] ?? 0),
            'created_at'         => $item['created_at'] ?? now()->toDateTimeString(),
        ])->sortBy([['sort_order', 'asc'], ['template_item_id', 'asc']])->values()->all();

        $this->items_json = $normalized;
        $this->save();

        static::flushItemCache();
    }

    /**
     * Reconcile the submitted item list IN PLACE: existing items keep their
     * template_item_id (so already-applied new-hire rows stay linked and never
     * duplicate), new items get the next global id, removed items disappear.
     */
    public function syncItems(array $payload): void
    {
        $existing = $this->itemsArray();
        $nextId = $this->nextItemId();

        $items = [];
        foreach (array_values($payload) as $index => $item) {
            $existingItem = $existing[$index] ?? null;
            $id = isset($existingItem['template_item_id'])
                ? (int) $existingItem['template_item_id']
                : $nextId++;

            $items[] = [
                'template_item_id'   => $id,
                'template_id'        => $this->template_id,
                'item_text'          => $item['item_text'] ?? '',
                'instructions'       => $item['instructions'] ?? null,
                'requires_upload'    => (bool) ($item['requires_upload'] ?? false),
                'upload_placeholder' => $item['upload_placeholder'] ?? null,
                'sort_order'         => $item['sort_order'] ?? $index,
                'created_at'         => $existingItem['created_at'] ?? now()->toDateTimeString(),
            ];
        }

        $this->persistItems($items);
    }

    /** Append a single item with a fresh stable id. */
    public function appendItem(array $item): OnboardingChecklistItem
    {
        $items = $this->itemsArray();
        $row = [
            'template_item_id'   => $this->nextItemId(),
            'template_id'        => $this->template_id,
            'item_text'          => $item['item_text'] ?? '',
            'instructions'       => $item['instructions'] ?? null,
            'requires_upload'    => (bool) ($item['requires_upload'] ?? false),
            'upload_placeholder' => $item['upload_placeholder'] ?? null,
            'sort_order'         => (int) ($item['sort_order'] ?? 0),
            'created_at'         => now()->toDateTimeString(),
        ];

        $items[] = $row;
        $this->persistItems($items);

        return $this->hydrateItem($row, $this);
    }

    /** Update one item by id; returns the refreshed item or null when absent. */
    public function updateItemById(int $itemId, array $changes): ?OnboardingChecklistItem
    {
        $items = $this->itemsArray();
        $updated = null;

        foreach ($items as $index => $item) {
            if ((int) ($item['template_item_id'] ?? 0) !== $itemId) {
                continue;
            }

            $items[$index] = array_merge($item, array_intersect_key(
                $changes,
                array_flip(['item_text', 'instructions', 'requires_upload', 'upload_placeholder', 'sort_order'])
            ));
            $updated = $items[$index];
        }

        if ($updated === null) {
            return null;
        }

        $this->persistItems($items);

        return $this->hydrateItem($updated, $this);
    }

    /** Remove one item by id; returns true when it existed. */
    public function removeItemById(int $itemId): bool
    {
        $items = $this->itemsArray();
        $before = count($items);

        $items = array_values(array_filter(
            $items,
            fn (array $item) => (int) ($item['template_item_id'] ?? 0) !== $itemId
        ));

        if (count($items) === $before) {
            return false;
        }

        $this->persistItems($items);

        return true;
    }

    /**
     * Next stable item id across every template.
     *
     * Applied employee rows keep their template_item_id even after a template
     * item is removed, so their highest id is part of the sequence too — a
     * removed id is never handed to a different requirement.
     */
    public function nextItemId(): int
    {
        $max = 0;

        foreach (static::all() as $template) {
            foreach ($template->itemsArray() as $item) {
                $max = max($max, (int) ($item['template_item_id'] ?? 0));
            }
        }

        if (Schema::hasTable('employee_onboarding_items')) {
            $max = max($max, (int) DB::table('employee_onboarding_items')->max('template_item_id'));
        }

        return $max + 1;
    }

    /** Hydrate a lightweight item model from a JSON row. */
    public function hydrateItem(array $item, ?self $template = null): OnboardingChecklistItem
    {
        $model = new OnboardingChecklistItem;
        $model->forceFill([
            'template_item_id'   => (int) ($item['template_item_id'] ?? 0),
            'template_id'        => (int) ($item['template_id'] ?? $this->template_id),
            'item_text'          => $item['item_text'] ?? '',
            'instructions'       => $item['instructions'] ?? null,
            'requires_upload'    => (bool) ($item['requires_upload'] ?? false),
            'upload_placeholder' => $item['upload_placeholder'] ?? null,
            'sort_order'         => (int) ($item['sort_order'] ?? 0),
            'created_at'         => $item['created_at'] ?? $this->created_at,
        ]);
        $model->exists = true;

        if ($template) {
            $model->setRelation('template', $template);
        }

        return $model;
    }

    /** Find one template item by its stable id (any template). */
    public static function findItem(int $itemId): ?OnboardingChecklistItem
    {
        if ($itemId <= 0) {
            return null;
        }

        if (static::$itemIndexCache === null) {
            $index = collect();

            foreach (static::all() as $template) {
                foreach ($template->itemsArray() as $item) {
                    $hydrated = $template->hydrateItem($item, $template);
                    $index->put($hydrated->template_item_id, $hydrated);
                }
            }

            static::$itemIndexCache = $index;
        }

        return static::$itemIndexCache->get($itemId);
    }

    public static function flushItemCache(): void
    {
        static::$itemIndexCache = null;
    }

    public static function generateCode(): string
    {
        $last = static::orderByDesc('template_id')->value('template_code');
        $next = $last ? ((int) substr($last, 4)) + 1 : 1;
        return 'OCT-' . str_pad($next, 4, '0', STR_PAD_LEFT);
    }

    /* ------------------------------------------------------------------ */
    /* Auto-apply helpers                                                    */
    /* ------------------------------------------------------------------ */

    /** Maps a template phase onto the new hire stage it targets. */
    public static function stageForPhase(string $phase): ?string
    {
        return match ($phase) {
            'Pre-onboarding' => 'Pre-onboarding',
            'Onboarding', 'Probationary' => 'Probationary',
            'Regular' => 'Regular',
            default  => null,
        };
    }

    /**
     * Whether this template applies to a new hire: it must be Active, its
     * phase must match the hire's stage, and its position scope must cover
     * the hire's position (empty scope or "all" covers every position).
     */
    public function appliesTo(NewHire $newHire): bool
    {
        if ($this->status !== 'Active') {
            return false;
        }

        if (static::stageForPhase($this->phase) !== $newHire->stage) {
            return false;
        }

        $scope = $this->position_scope_json ?? [];
        if (empty($scope) || in_array('all', $scope, true)) {
            return true;
        }

        $positionTitle = $newHire->position?->title;
        return $positionTitle !== null && in_array($positionTitle, $scope, true);
    }

    /**
     * Creates onboarding items for a new hire from this template, skipping
     * template items that were already applied so re-saving never duplicates.
     */
    public function applyTo(NewHire $newHire): int
    {
        $existing = $newHire->onboardingItems()
            ->whereNotNull('template_item_id')
            ->pluck('template_item_id')
            ->all();

        $created = 0;
        foreach ($this->items as $templateItem) {
            if (in_array($templateItem->template_item_id, $existing, true)) {
                continue;
            }
            EmployeeOnboardingItem::create([
                'employee_id'      => $newHire->employee_id,
                'new_hire_id'      => $newHire->new_hire_id,
                'template_item_id' => $templateItem->template_item_id,
                'item_text'        => $templateItem->item_text,
                'done'             => false,
            ]);
            $created++;
        }

        return $created;
    }

    /**
     * Applies this (Active) template to every matching new hire. Returns the
     * total number of onboarding items created.
     */
    public function applyToMatchingNewHires(): int
    {
        if ($this->status !== 'Active') {
            return 0;
        }

        $stage = static::stageForPhase($this->phase);
        if (! $stage) {
            return 0;
        }

        $query = NewHire::where('stage', $stage)->with('position');
        $scope = $this->position_scope_json ?? [];
        if (! empty($scope) && ! in_array('all', $scope, true)) {
            $query->whereHas('position', fn ($q) => $q->whereIn('title', $scope));
        }

        $total = 0;
        foreach ($query->get() as $newHire) {
            $total += $this->applyTo($newHire);
        }

        return $total;
    }

    /**
     * Applies every Active template that matches a new hire (used when the
     * hire is created or promoted). Returns the number of items created.
     */
    public static function applyAllFor(NewHire $newHire): int
    {
        $total = 0;
        foreach (static::where('status', 'Active')->get() as $template) {
            if ($template->appliesTo($newHire)) {
                $total += $template->applyTo($newHire);
            }
        }

        return $total;
    }
}
