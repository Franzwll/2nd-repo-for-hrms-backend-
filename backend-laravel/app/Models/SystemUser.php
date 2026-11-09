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
        'mfa_method',
        'totp_secret',
        'totp_confirmed_at',
        'mfa_recovery_codes',
        'failed_attempts',
        'locked_until',
        'last_login_at',
        'last_login_ip',
        'profile_photo_url',
        'gender',
    ];

    protected $hidden = [
        'password_hash',
        'totp_secret',
        'mfa_recovery_codes',
    ];

    protected $casts = [
        'last_login_at' => 'datetime',
        'totp_confirmed_at' => 'datetime',
        'locked_until' => 'datetime',
        'otp_enabled' => 'boolean',
        'totp_secret' => 'encrypted',
        'mfa_recovery_codes' => 'array',
    ];

    public function isLockedOut(): bool
    {
        return $this->locked_until !== null && $this->locked_until->isFuture();
    }

    /**
     * Whether this account signs in with a TOTP authenticator app
     * instead of an emailed OTP code.
     */
    public function usesTotp(): bool
    {
        return $this->mfa_method === 'totp' && $this->totp_confirmed_at !== null;
    }

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
        // Prefer the explicit role flag. Load the relation when it is missing:
        // the old implementation only checked role_id = 1 unless the relation
        // happened to be eager-loaded, so a Super Admin role with any other id
        // was denied by PermissionMiddleware.
        if (! $this->relationLoaded('role')) {
            $this->loadMissing('role');
        }
        $role = $this->role;

        if ($role) {
            if ((bool) $role->is_super_admin) {
                return true;
            }

            // Legacy databases created before the is_super_admin column existed.
            if ($role->getAttribute('is_super_admin') === null && $role->role_name === 'Super Admin') {
                return true;
            }
        }

        // Legacy convention: role_id 1 has always been the Super Admin role.
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