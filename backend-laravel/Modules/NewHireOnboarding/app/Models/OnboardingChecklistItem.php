<?php

namespace Modules\NewHireOnboarding\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OnboardingChecklistItem extends Model
{
    protected $table = 'onboarding_checklist_items';
    protected $primaryKey = 'template_item_id';

    public $timestamps = false; // only created_at

    protected $casts = [
        'requires_upload' => 'boolean',
        'created_at'      => 'datetime',
    ];

    protected $fillable = [
        'template_id',
        'item_text',
        'instructions',
        'requires_upload',
        'upload_placeholder',
        'sort_order',
    ];

    public function template(): BelongsTo
    {
        return $this->belongsTo(OnboardingChecklistTemplate::class, 'template_id', 'template_id');
    }
}
