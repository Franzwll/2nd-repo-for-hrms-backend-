<?php

namespace Modules\EmployeeSelfService\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * Explicit registration keeps the pipeline deterministic: a module is only
     * notified after the ESS Management gate dispatches the request.
     *
     * @var array<string, array<int, string>>
     */
    protected $listen = [
        \Modules\EmployeeSelfService\Events\EssRequestDispatched::class => [
            \Modules\EmployeeSelfService\Listeners\NotifyModuleOfDispatchedRequest::class,
        ],
        \Modules\EmployeeSelfService\Events\EssRequestReturnedToEss::class => [
            \Modules\EmployeeSelfService\Listeners\NotifyEssAdminsOfModuleResponse::class,
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
