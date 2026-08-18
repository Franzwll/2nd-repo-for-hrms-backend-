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
}
