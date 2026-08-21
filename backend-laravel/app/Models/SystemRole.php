<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SystemRole extends Model
{
    protected $table = 'system_roles';
    protected $primaryKey = 'role_id';

    protected $fillable = [
        'role_name',
        'description',
        'is_super_admin',
        'is_protected',
    ];

    protected $casts = [
        'is_super_admin' => 'boolean',
        'is_protected' => 'boolean',
    ];

    public function permissions(): HasMany
    {
        return $this->hasMany(RolePermission::class, 'role_id', 'role_id');
    }

    public function users(): HasMany
    {
        return $this->hasMany(SystemUser::class, 'role_id', 'role_id');
    }
}