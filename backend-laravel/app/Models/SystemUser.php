<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SystemUser extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $table = 'system_users';
    protected $primaryKey = 'system_user_id';

    public $incrementing = true;

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

    protected $hidden = [
        'password_hash',
    ];

    protected $casts = [
        'last_login_at' => 'datetime',
        'otp_enabled' => 'boolean',
    ];

    public function getAuthPassword(): string
    {
        return $this->password_hash;
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(SystemRole::class, 'role_id', 'role_id');
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'employee_id', 'employee_id');
    }

    public function permissions(): HasMany
    {
        return $this->hasMany(RolePermission::class, 'role_id', 'role_id');
    }

    public function loginActivity(): HasMany
    {
        return $this->hasMany(UserLoginActivity::class, 'system_user_id', 'system_user_id');
    }

    public function audits(): HasMany
    {
        return $this->hasMany(AuditLog::class, 'system_user_id', 'system_user_id');
    }

    public function permissionMap(): array
    {
        return $this->permissions->pluck('permission_level', 'module_name')->all();
    }

    public function isSuperAdmin(): bool
    {
        // Prefer the explicit role flag; fall back to the legacy role_id = 1
        // convention so existing sessions/records keep behaving correctly.
        if ($this->relationLoaded('role') && $this->role) {
            return (bool) $this->role->is_super_admin;
        }

        return (int) $this->role_id === 1;
    }

    public function hasModuleAccess(string $module): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        $level = $this->permissions->firstWhere('module_name', $module)?->permission_level ?? 'None';

        return $level !== 'None';
    }
}