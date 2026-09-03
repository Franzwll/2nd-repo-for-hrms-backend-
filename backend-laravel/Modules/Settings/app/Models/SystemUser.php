<?php

namespace Modules\Settings\Models;

use Illuminate\Database\Eloquent\Model;

class SystemUser extends Model
{
    protected $table = 'system_users';

    protected $primaryKey = 'system_user_id';

    public $timestamps = true;

    protected $fillable = [
        'username',
        'email',
        'password_hash',
        'full_name',
        'department_name',
        'employee_id',
        'role_id',
        'status',
        'otp_enabled',
        'last_login_at',
        'last_login_ip',
    ];

    protected $casts = [
        'otp_enabled' => 'boolean',
    ];

    protected $hidden = [
        'password_hash',
    ];
}