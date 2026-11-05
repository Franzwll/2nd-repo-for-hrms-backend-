<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Employee-facing timeline for an ESS request.
 *
 * Rows now live in `ess_request_events` with event_type = 'status'. The global
 * scope keeps routing and attachment rows out, and the old primary key name is
 * kept as an accessor for callers that still read it.
 */
class EssRequestStatusHistory extends Model
{
    public const EVENT_TYPE = 'status';

    protected $table = 'ess_request_events';
    protected $primaryKey = 'ess_request_event_id';

    public $timestamps = false; // only created_at

    protected $fillable = [
        'ess_request_id',
        'status',
        'actor_user_id',
        'note',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope('status_events', function (Builder $query): void {
            $query->where('event_type', self::EVENT_TYPE);
        });

        static::creating(function (EssRequestStatusHistory $history): void {
            $history->event_type = self::EVENT_TYPE;
            $history->created_at ??= now();
        });
    }

    /** The old primary key name, still exposed to callers. */
    public function getEssRequestStatusHistoryIdAttribute(): ?int
    {
        return $this->ess_request_event_id;
    }

    public function request(): BelongsTo
    {
        return $this->belongsTo(EssRequest::class, 'ess_request_id', 'ess_request_id');
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(SystemUser::class, 'actor_user_id', 'system_user_id');
    }
}
