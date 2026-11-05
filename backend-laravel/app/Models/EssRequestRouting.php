<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Append-only ledger for the ESS <-> module pipeline.
 *
 * One row per hand-off: dispatch, accept, decline, complete, reroute, release.
 * Status history is the employee-facing timeline; this model is the audit
 * trail between ESS Management and the module that owned the request.
 *
 * Rows now live in `ess_request_events` with event_type = 'routing'. The
 * global scope keeps the other event types out, and the old key name is kept
 * as an accessor so the admin routings endpoint does not change.
 */
class EssRequestRouting extends Model
{
    public const EVENT_TYPE = 'routing';

    protected $table = 'ess_request_events';
    protected $primaryKey = 'ess_request_event_id';

    protected $fillable = [
        'ess_request_id',
        'leg',
        'from_module',
        'to_module',
        'action',
        'actor_user_id',
        'note',
        'result_payload',
    ];

    protected $casts = [
        'leg' => 'integer',
        'result_payload' => 'array',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope('routing_events', function (Builder $query): void {
            $query->where('event_type', self::EVENT_TYPE);
        });

        static::creating(function (EssRequestRouting $routing): void {
            $routing->event_type = self::EVENT_TYPE;
        });
    }

    /** The old primary key name, still exposed to the API. */
    public function getEssRequestRoutingIdAttribute(): ?int
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
