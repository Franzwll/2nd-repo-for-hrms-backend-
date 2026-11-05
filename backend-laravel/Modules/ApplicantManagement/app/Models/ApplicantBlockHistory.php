<?php

namespace Modules\ApplicantManagement\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Block / unblock trail for applicants.
 *
 * Rows now live in `audit_logs` with module_name = 'Applicant Management',
 * target_type = 'applicant' and action = 'blocked' | 'unblocked'. The
 * capitalised AuditLogger rows ('Applicant Blocked') stay separate.
 *
 * The accessors keep the old names so controllers, resources and callers do
 * not change: applicant_id, performed_by, reason, scope, performed_at.
 */
class ApplicantBlockHistory extends Model
{
    public const MODULE = 'Applicant Management';

    public const TARGET_TYPE = 'applicant';

    /** @var string[] */
    public const ACTIONS = ['blocked', 'unblocked'];

    protected $table = 'audit_logs';

    protected $primaryKey = 'audit_log_id';

    public $timestamps = false;

    protected $fillable = [
        'applicant_id',
        'action',
        'performed_by',
        'reason',
        'scope',
        'performed_at',
    ];

    protected $casts = [
        'occurred_at' => 'datetime',
        'target_id' => 'integer',
        'extra_json' => 'array',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope('applicant_block_history', function (Builder $query): void {
            $query->where('module_name', self::MODULE)
                ->where('target_type', self::TARGET_TYPE)
                ->whereIn('action', self::ACTIONS);
        });

        static::creating(function (ApplicantBlockHistory $history): void {
            $history->module_name = self::MODULE;
            $history->target_type = self::TARGET_TYPE;
            $history->occurred_at ??= now();
            $history->severity = $history->severity
                ?: ($history->action === 'blocked' ? 'Warning' : 'Info');
        });
    }

    /** `applicant_id` is stored in the shared `target_id` column. */
    public function setApplicantIdAttribute(mixed $value): void
    {
        $this->attributes['target_id'] = (string) $value;
    }

    public function getApplicantIdAttribute(): ?int
    {
        return $this->target_id;
    }

    /** `reason` is stored in the shared `details` column. */
    public function setReasonAttribute(mixed $value): void
    {
        $this->attributes['details'] = $value;
    }

    public function getReasonAttribute(): mixed
    {
        return $this->details;
    }

    /** `performed_at` is stored in the shared `occurred_at` column. */
    public function setPerformedAtAttribute(mixed $value): void
    {
        $this->attributes['occurred_at'] = $value;
    }

    public function getPerformedAtAttribute(): mixed
    {
        return $this->occurred_at;
    }

    /** `performed_by` and `scope` have no dedicated columns; keep them in JSON. */
    public function setPerformedByAttribute(mixed $value): void
    {
        $extra = $this->extra_json ?? [];
        $extra['performed_by'] = $value;
        $this->extra_json = $extra;
    }

    public function getPerformedByAttribute(): mixed
    {
        return ($this->extra_json ?? [])['performed_by'] ?? null;
    }

    public function setScopeAttribute(mixed $value): void
    {
        $extra = $this->extra_json ?? [];
        $extra['scope'] = $value;
        $this->extra_json = $extra;
    }

    public function getScopeAttribute(): mixed
    {
        return ($this->extra_json ?? [])['scope'] ?? null;
    }

    public function getBlockHistoryIdAttribute(): ?int
    {
        return $this->audit_log_id;
    }

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class, 'target_id', 'applicant_id');
    }
}
