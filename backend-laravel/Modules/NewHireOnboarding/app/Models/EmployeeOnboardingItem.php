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
        'done',
        'completed_at',
        'completed_by_user_id',
    ];

    protected $casts = [
        'done'         => 'boolean',
        'completed_at' => 'datetime',
    ];

    public function newHire(): BelongsTo
    {
        return $this->belongsTo(NewHire::class, 'new_hire_id', 'new_hire_id');
    }
}
