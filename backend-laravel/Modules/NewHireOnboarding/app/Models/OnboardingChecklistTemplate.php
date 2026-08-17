<?php

namespace Modules\NewHireOnboarding\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
    ];

    protected $casts = [
        'position_scope_json' => 'array',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(OnboardingChecklistItem::class, 'template_id', 'template_id')
                    ->orderBy('sort_order');
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
        foreach (static::with('items')->where('status', 'Active')->get() as $template) {
            if ($template->appliesTo($newHire)) {
                $total += $template->applyTo($newHire);
            }
        }

        return $total;
    }
}
