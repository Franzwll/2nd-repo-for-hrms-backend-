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
        \Modules\EmployeeSelfService\Events\EssRequestFiled::class => [
            \Modules\EmployeeRecords\Listeners\NotifyRecordsInboxOfNewRequest::class,
        ],
        \Modules\EmployeeSelfService\Events\EssRequestFulfilled::class => [
            \Modules\EmployeeRecords\Listeners\NotifyEmployeeRequestFulfilled::class,
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
