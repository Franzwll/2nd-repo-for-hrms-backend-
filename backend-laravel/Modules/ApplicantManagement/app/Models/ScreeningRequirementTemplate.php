<?php

namespace Modules\ApplicantManagement\Models;

use App\Models\Position;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Schema;

/**
 * A Screening Setup requirement template — the reusable list of requirement
 * entities (skills, job roles, certifications, education, experience) defined
 * per Core HCM position and applied to a job post in the Job Post Builder.
 */
class ScreeningRequirementTemplate extends Model
{
    protected $table = 'screening_requirement_templates';

    protected $primaryKey = 'template_id';

    protected $fillable = [
        'name',
        'position_id',
        'description',
        'active',
        'items_json',
    ];

    protected $casts = [
        'active' => 'boolean',
        'items_json' => 'array',
    ];

    /**
     * Requirement entities hydrated from items_json (Phase 3h).
     *
     * When the legacy child table still exists (for example right after a
     * migrate:rollback) the items come from the real relation; otherwise they
     * are hydrated from this template's items_json column, preserving each
     * item's id, entity_type, value and required flag.
     */
    public function getItemsAttribute(): \Illuminate\Support\Collection
    {
        if (Schema::hasTable('screening_requirement_template_items')) {
            return $this->hasMany(ScreeningRequirementTemplateItem::class, 'template_id', 'template_id')
                ->orderBy('item_id')
                ->get();
        }

        $raw = $this->items_json;
        if (is_string($raw)) {
            $raw = json_decode($raw, true);
        }
        if (! is_array($raw)) {
            return collect();
        }

        return collect($raw)->values()->map(function (array $item, int $idx) {
            $model = new ScreeningRequirementTemplateItem;
            $model->forceFill([
                'item_id'     => $item['item_id'] ?? ($idx + 1),
                'template_id' => $item['template_id'] ?? $this->template_id,
                'entity_type' => $item['entity_type'] ?? '',
                'value'       => $item['value'] ?? '',
                'required'    => $item['required'] ?? true,
                'created_at'  => $item['created_at'] ?? $this->created_at,
            ]);
            return $model;
        });
    }

    public function position(): BelongsTo
    {
        return $this->belongsTo(Position::class, 'position_id', 'position_id');
    }
}
