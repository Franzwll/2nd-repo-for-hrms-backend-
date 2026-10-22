<?php

namespace Modules\EmployeeSelfService\Listeners;

use App\Services\Notifier;
use Illuminate\Support\Facades\Log;
use Modules\EmployeeSelfService\Events\EssRequestDispatched;
use Modules\EmployeeSelfService\Services\EssRoutingService;

/**
 * Notifies the routed module's audience that a gated request is waiting in
 * their queue. This replaces the old EssRequestFiled listener so modules never
 * hear about a request before ESS Management approves it.
 */
class NotifyModuleOfDispatchedRequest
{
    public function __construct(private readonly EssRoutingService $routing)
    {
    }

    public function handle(EssRequestDispatched $event): void
    {
        $request = $event->request;
        $request->loadMissing('employee', 'category');

        $label = $this->routing->label($event->module);
        $employeeName = $request->employee?->full_name ?? 'An employee';

        Notifier::to(Notifier::moduleAudienceIds(array_filter([
            $event->module,
            $this->routing->permissionFor($event->module),
        ])), [
            'title' => "New request for {$label}",
            'body' => "{$employeeName} requested \"{$request->request_type}\" ({$request->request_code}). "
                . "ESS Management approved it — open the {$label} queue to accept and process it.",
            'type' => 'info',
            'module_name' => $label,
            'target_type' => 'ess_request',
            'target_id' => (string) $request->ess_request_id,
        ]);

        Log::info('ESS request dispatched to module', [
            'request_code' => $request->request_code,
            'module' => $event->module,
        ]);
    }
}
