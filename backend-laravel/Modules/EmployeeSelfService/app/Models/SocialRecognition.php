<?php

namespace Modules\EmployeeSelfService\Models;

use App\Models\Employee;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
    ];

    protected $casts = [
        'clap_count' => 'integer',
        'heart_count' => 'integer',
        'star_count' => 'integer',
        'fire_count' => 'integer',
    ];

    public function sender(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'sender_employee_id', 'employee_id');
    }

    public function recipient(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'recipient_employee_id', 'employee_id');
    }

    public function reactions(): HasMany
    {
        return $this->hasMany(RecognitionReaction::class, 'recognition_id', 'recognition_id');
    }
}
