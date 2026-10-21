<?php

namespace Modules\EmployeeSelfService\Events;

use App\Models\EssRequest;
use App\Models\SystemUser;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Fired when ESS Management releases a module result to the employee. This is
 * the only event that makes module output visible to the employee.
 */
class EssRequestReleased
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public EssRequest $request,
        public ?SystemUser $actor = null
    ) {}
}
