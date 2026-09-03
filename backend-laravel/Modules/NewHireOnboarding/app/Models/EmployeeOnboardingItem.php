<?php

namespace Modules\NewHireOnboarding\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeOnboardingItem extends Model
{
    protected $table = 'employee_onboarding_items';
    protected $primaryKey = 'employee_onboarding_item_id';

    protected $fillable = [
        'employee_id',
        'new_hire_id',
        'template_item_id',
        'item_text',
        'file_path',
        'file_name',
        'notes',
        'done',
        'submitted_at',
        'completed_at',
        'completed_by_user_id',
    ];

    protected $casts = [
        'done'         => 'boolean',
        'completed_at' => 'datetime',
        'submitted_at' => 'datetime',
    ];

    protected $appends = ['file_url'];

    public function getFileUrlAttribute(): ?string
    {
        return $this->file_path ? asset('storage/' . $this->file_path) : null;
    }

    public function newHire(): BelongsTo
    {
        return $this->belongsTo(NewHire::class, 'new_hire_id', 'new_hire_id');
    }

    /** The template item this was copied from (determines its phase). */
    public function templateItem(): BelongsTo
    {
        return $this->belongsTo(
            OnboardingChecklistItem::class,
            'template_item_id',
            'template_item_id',
        );
    }
}
