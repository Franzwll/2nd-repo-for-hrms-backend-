<?php

namespace Modules\EmployeeSelfService\Listeners;

use App\Services\Notifier;
use Modules\EmployeeSelfService\Events\EssRequestReturnedToEss;
use Modules\EmployeeSelfService\Services\EssRoutingService;

/**
 * Tells ESS Management that a module sent a result back and the request is
 * waiting for release.
 */
class NotifyEssAdminsOfModuleResponse
{
    public function __construct(private readonly EssRoutingService $routing)
    {
    }

    public function handle(EssRequestReturnedToEss $event): void
    {
        $request = $event->request;
        $request->loadMissing('employee');

        $label = $this->routing->label($event->module);
        $employeeName = $request->employee?->full_name ?? 'An employee';

        Notifier::to(
            array_merge(Notifier::hrAdminIds(), Notifier::superAdminIds()),
            [
                'title' => 'Request ready for release',
                'body' => "{$label} returned \"{$request->request_type}\" ({$request->request_code}) "
                    . "for {$employeeName}. Review the result and release it to the employee.",
                'type' => 'info',
                'module_name' => 'ESS Management',
                'target_type' => 'ess_request',
                'target_id' => (string) $request->ess_request_id,
            ]
        );
    }
}
