<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Append-only ledger for the ESS <-> module pipeline.
 *
 * One row per hand-off: dispatch, accept, decline, complete, reroute, release.
 * Status history is the employee-facing timeline; this table is the audit trail
 * between ESS Management and the module that owned the request.
 */
class EssRequestRouting extends Model
{
    protected $table = 'ess_request_routings';
    protected $primaryKey = 'ess_request_routing_id';

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

    public function request(): BelongsTo
    {
        return $this->belongsTo(EssRequest::class, 'ess_request_id', 'ess_request_id');
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(SystemUser::class, 'actor_user_id', 'system_user_id');
    }
}
