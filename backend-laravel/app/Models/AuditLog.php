<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    protected $table = 'audit_logs';
    protected $primaryKey = 'audit_log_id';

    public $timestamps = false;

    protected $fillable = [
        'system_user_id',
        'actor_role',
        'actor_department',
        'occurred_at',
        'action',
        'module_name',
        'target_type',
        'target_id',
        'details',
        'severity',
        'ip_address',
        'device_info',
    ];

    protected $casts = [
        'occurred_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(SystemUser::class, 'system_user_id', 'system_user_id');
    }
}