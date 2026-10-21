<?php

namespace Modules\EmployeeSelfService\Events;

use App\Models\EssRequest;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Fired the moment an employee submits an ESS request.
 *
 * This is a pre-gate event: the request is still Pending and no module may act
 * on it. Modules subscribe to EssRequestDispatched (after ESS Management
 * approval) instead. Kept for audit/analytics listeners only.
 */
class EssRequestFiled
{
    use Dispatchable, SerializesModels;

    public function __construct(public EssRequest $request) {}
}
