<?php

namespace Modules\Landing\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Nwidart\Modules\Support\ModuleServiceProvider;

class LandingServiceProvider extends ModuleServiceProvider
{
    protected string $name = 'Landing';

    protected string $nameLower = 'landing';

    protected array $providers = [
        EventServiceProvider::class,
        RouteServiceProvider::class,
    ];

    public function boot(): void
    {
        // Chatbot throttle: keyed by the authenticated account when logged in,
        // by IP for guests — so one account can't bypass the guest limit.
        RateLimiter::for('chatbot', function (Request $request) {
            $userId = $request->user()?->getAuthIdentifier();

            return Limit::perMinute(30)->by(
                $userId ? 'user:' . $userId : 'ip:' . $request->ip()
            );
        });
    }
}
