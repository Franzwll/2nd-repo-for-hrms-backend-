<?php

namespace Tests;

use App\Models\SystemUser;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * Reset Sanctum's guard cache between requests.
     * In feature tests, the auth guard singleton caches the resolved user,
     * so subsequent requests with different tokens would reuse the cached user.
     * We also flush the session because Sanctum checks the 'web' guard first,
     * and session state from previous requests can interfere with token auth.
     */
    protected function resetAuthGuards(): void
    {
        $this->app->make('auth')->forgetGuards();
        $this->flushSession();
    }

    protected function superAdminToken(): string
    {
        $this->resetAuthGuards();
        $user = SystemUser::where('email', 'bullseur@oxfordsuites.com.ph')->firstOrFail();

        return $user->createToken('test-token')->plainTextToken;
    }

    protected function authHeaders(string $token): array
    {
        // Reset guards before each authenticated request to prevent
        // the Sanctum guard from caching a previous request's user
        $this->resetAuthGuards();

        return ['Authorization' => "Bearer {$token}", 'Accept' => 'application/json'];
    }

    protected function loginViaOtp(): string
    {
        $this->resetAuthGuards();

        $login = $this->postJson('/api/v1/auth/login', [
            'email' => 'bullseur@oxfordsuites.com.ph',
            'password' => 'Oxford@2026',
        ])->assertOk()->json();

        $verify = $this->postJson('/api/v1/auth/otp/verify', [
            'login_token' => $login['login_token'],
            'otp' => $login['debug_otp'],
        ])->assertOk()->json();

        return $verify['token'];
    }
}
