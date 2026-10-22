<?php

namespace Modules\EmployeeSelfService\Events;

use App\Models\EssRequest;
use App\Models\SystemUser;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Fired when a module submits a result and the request lands back in the ESS
 * Management release queue ("For Release").
 */
class EssRequestReturnedToEss
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public EssRequest $request,
        public string $module,
        public ?SystemUser $actor = null
    ) {}
}
