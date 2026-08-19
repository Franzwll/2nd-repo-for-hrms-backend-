<?php

namespace Modules\Landing\Providers;

use Nwidart\Modules\Support\ModuleServiceProvider;

class LandingServiceProvider extends ModuleServiceProvider
{
    protected string $name = 'Landing';

    protected string $nameLower = 'landing';

    protected array $providers = [
        EventServiceProvider::class,
        RouteServiceProvider::class,
    ];
}