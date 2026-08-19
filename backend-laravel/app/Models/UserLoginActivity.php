<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserLoginActivity extends Model
{
    protected $table = 'user_login_activity';
    protected $primaryKey = 'login_activity_id';

    public $timestamps = false;

    protected $fillable = [
        'system_user_id',
        'login_at',
        'ip_address',
        'device_info',
        'user_agent',
        'status',
    ];

    protected $casts = [
        'login_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(SystemUser::class, 'system_user_id', 'system_user_id');
    }
}