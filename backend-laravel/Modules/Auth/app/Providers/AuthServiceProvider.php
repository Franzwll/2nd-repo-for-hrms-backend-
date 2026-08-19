<?php

namespace Modules\Auth\Providers;

use Nwidart\Modules\Support\ModuleServiceProvider;
use Illuminate\Console\Scheduling\Schedule;

class AuthServiceProvider extends ModuleServiceProvider
{
    protected string $name = 'Auth';

    protected string $nameLower = 'auth';

    protected array $providers = [
        EventServiceProvider::class,
        RouteServiceProvider::class,
    ];
}