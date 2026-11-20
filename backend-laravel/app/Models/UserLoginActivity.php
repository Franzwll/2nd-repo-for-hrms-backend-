<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Successful sign-in history.
 *
 * Rows now live in `audit_logs` with module_name = 'Auth' and action = 'Login'.
 * The global scope hides the rest of the audit trail, and the accessors keep
 * the old column names used by LoginActivityResource.
 */
class UserLoginActivity extends Model
{
    public const MODULE = 'Auth';

    public const ACTION = 'Login';

    protected $table = 'audit_logs';

    protected $primaryKey = 'audit_log_id';

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
        'occurred_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope('login_activity', function (Builder $query): void {
            $query->where('module_name', self::MODULE)
                ->where('action', self::ACTION);
        });

        static::creating(function (UserLoginActivity $activity): void {
            $activity->module_name = self::MODULE;
            $activity->action = self::ACTION;
            $activity->occurred_at ??= now();
            $activity->severity = $activity->severity ?: 'Info';

            if ($activity->target_type === null) {
                $activity->target_type = 'user';
            }

            if ($activity->target_id === null && $activity->system_user_id !== null) {
                $activity->target_id = (string) $activity->system_user_id;
            }
        });
    }

    /** `login_at` is stored in the shared `occurred_at` column. */
    public function setLoginAtAttribute(mixed $value): void
    {
        $this->attributes['occurred_at'] = $value;
    }

    public function getLoginAtAttribute(): mixed
    {
        return $this->occurred_at;
    }

    public function getLoginActivityIdAttribute(): ?int
    {
        return $this->audit_log_id;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(SystemUser::class, 'system_user_id', 'system_user_id');
    }
}
