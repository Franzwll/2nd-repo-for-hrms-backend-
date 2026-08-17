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
    ];

    protected $casts = [
        'start_date' => 'date',
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
}
