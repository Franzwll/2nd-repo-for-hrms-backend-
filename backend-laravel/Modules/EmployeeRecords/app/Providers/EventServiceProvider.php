<?php

namespace Modules\EmployeeRecords\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event handler mappings for the application.
     *
     * The Employee Records module listens to ESS lifecycle events to drive the
     * document-request fulfilment loop (ESS files -> ERM fulfils -> employee
     * notified). Kept explicit so registration is deterministic.
     *
     * @var array<string, array<int, string>>
     */
    protected $listen = [
        // The module is notified by the ESS dispatcher only after the gate.
        // Listening to EssRequestFiled would expose unapproved requests.
        \Modules\EmployeeSelfService\Events\EssRequestFulfilled::class => [
            \Modules\EmployeeRecords\Listeners\NotifyEmployeeRequestFulfilled::class,
        ],
        \Modules\CoreHCM\Events\EmployeeStatusChanged::class => [
            \Modules\EmployeeRecords\Listeners\SyncEmployeeDossierOnStatusChange::class,
        ],
    ];

    /**
     * Indicates if events should be discovered.
     *
     * @var bool
     */
    protected static $shouldDiscoverEvents = false;

    /**
     * Configure the proper event listeners for email verification.
     */
    protected function configureEmailVerification(): void {}
}
