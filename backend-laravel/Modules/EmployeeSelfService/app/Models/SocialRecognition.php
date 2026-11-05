<?php

namespace Modules\EmployeeSelfService\Models;

use App\Models\Employee;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Schema;

class SocialRecognition extends Model
{
    protected $table = 'social_recognitions';
    protected $primaryKey = 'recognition_id';

    protected $fillable = [
        'sender_employee_id',
        'recipient_employee_id',
        'sender_name',
        'recipient_name',
        'sender_role',
        'recipient_role',
        'core_value',
        'message',
        'clap_count',
        'heart_count',
        'star_count',
        'fire_count',
        'shares_count',
        'reactions_json',
    ];

    protected $casts = [
        'clap_count'  => 'integer',
        'heart_count' => 'integer',
        'star_count'  => 'integer',
        'fire_count'  => 'integer',
        'shares_count' => 'integer',
    ];

    public function sender(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'sender_employee_id', 'employee_id');
    }

    public function recipient(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'recipient_employee_id', 'employee_id');
    }

    /**
     * Legacy HasMany to recognition_reactions.
     *
     * After Phase 3e reactions live in social_recognitions.reactions_json
     * (keyed by employee_id → [reaction_type, ...]) and the Wall of Fame
     * flow reads/writes that JSON via RecognitionReaction::byEmployee(),
     * RecognitionReaction::toggle() and RecognitionReaction::record().
     * This relation is therefore only usable while the legacy child table
     * still exists — for example right after a `migrate:rollback`.
     */
    public function reactions(): HasMany
    {
        return $this->hasMany(RecognitionReaction::class, 'recognition_id', 'recognition_id');
    }
}
