<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RolePermission extends Model
{
    protected $table = 'role_permissions';
    protected $primaryKey = 'role_permission_id';

    protected $fillable = [
        'role_id',
        'module_name',
        'permission_level',
    ];

    public function role(): BelongsTo
    {
        return $this->belongsTo(SystemRole::class, 'role_id', 'role_id');
    }
}