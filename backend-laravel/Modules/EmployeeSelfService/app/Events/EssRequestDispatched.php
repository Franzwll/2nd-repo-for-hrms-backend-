<?php

namespace Modules\EmployeeSelfService\Events;

use App\Models\EssRequest;
use App\Models\SystemUser;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Fired after the ESS Management gate approves a request and routes it to a
 * module. Modules must not react to EssRequestFiled — that happens before the
 * gate and would let them see unapproved requests.
 */
class EssRequestDispatched
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public EssRequest $request,
        public string $module,
        public ?SystemUser $actor = null
    ) {}
}
