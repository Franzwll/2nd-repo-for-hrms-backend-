<?php

namespace Modules\EmployeeSelfService\Events;

use App\Models\EssRequest;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Fired the moment an employee submits an ESS request. The Employee Records
 * module listens for this to surface document (hr_document) requests in its
 * fulfilment inbox — the "outbound" half of the ESS <-> ERM loop.
 */
class EssRequestFiled
{
    use Dispatchable, SerializesModels;

    public function __construct(public EssRequest $request) {}
}
