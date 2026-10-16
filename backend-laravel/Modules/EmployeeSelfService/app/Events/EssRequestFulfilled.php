<?php

namespace Modules\EmployeeSelfService\Events;

use App\Models\EssRequest;
use App\Models\EssRequestAttachment;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Fired when HR fulfils an ESS request by attaching the file the employee
 * asked for. The employee is notified and can now download it — the "return"
 * half of the ESS <-> ERM loop.
 */
class EssRequestFulfilled
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public EssRequest $request,
        public EssRequestAttachment $attachment,
    ) {}
}
