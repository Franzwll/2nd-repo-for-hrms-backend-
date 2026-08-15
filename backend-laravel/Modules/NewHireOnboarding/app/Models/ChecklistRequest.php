<?php

namespace Modules\NewHireOnboarding\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChecklistRequest extends Model
{
    protected $table = 'checklist_requests';
    protected $primaryKey = 'checklist_request_id';

    protected $fillable = [
        'request_code',
        'employee_id',
        'template_id',
        'phase',
        'items_json',
        'status',
        'requested_by_user_id',
        'requested_at',
    ];

    protected $casts = [
        'items_json'   => 'array',
        'requested_at' => 'date',
    ];

    public function template(): BelongsTo
    {
        return $this->belongsTo(OnboardingChecklistTemplate::class, 'template_id', 'template_id');
    }

    public static function generateCode(): string
    {
        $last = static::orderByDesc('checklist_request_id')->value('request_code');
        $next = $last ? ((int) substr($last, 3)) + 1 : 1;
        return 'CR-' . str_pad($next, 5, '0', STR_PAD_LEFT);
    }
}
