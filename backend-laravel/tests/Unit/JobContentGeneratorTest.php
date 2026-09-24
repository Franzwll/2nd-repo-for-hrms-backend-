<?php

namespace Tests\Unit;

use App\Services\JobContentGenerator;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

/**
 * Locks in the "Generate with AI" contract used by the Job Post Builder
 * indicator: provider configuration, failure codes, provider cool-downs and
 * the usage snapshot. Regression guard for the missing isConfigured() /
 * modelName() helpers that used to make the endpoint answer HTTP 500.
 */
class JobContentGeneratorTest extends TestCase
{
    /** AI env vars read by env() in the service, saved so tearDown can restore them. */
    private const AI_ENV_KEYS = ['GEMINI_API_KEY', 'GEMINI_FALLBACK_API_KEY', 'OPENROUTER_API_KEY'];

    /** @var array<string, array{0:?string,1:?string}> */
    private array $savedAiEnv = [];

    protected function setUp(): void
    {
        parent::setUp();

        Cache::flush();

        // The service falls back to env() keys, so the developer's real .env
        // would leak into these tests — blank them and drive config only.
        foreach (self::AI_ENV_KEYS as $key) {
            $this->savedAiEnv[$key] = [$_ENV[$key] ?? null, $_SERVER[$key] ?? null];
            $_ENV[$key] = '';
            $_SERVER[$key] = '';
        }

        config([
            'services.gemini.key' => 'test-gemini-key',
            'services.gemini.model' => 'gemini-3.6-flash',
            'services.gemini.fallback_key' => null,
            'services.gemini.fallback_model' => null,
            'services.openrouter.key' => null,
            'services.job_ai.daily_limit' => 0,
        ]);
    }

    protected function tearDown(): void
    {
        foreach ($this->savedAiEnv as $key => [$env, $server]) {
            if ($env === null) {
                unset($_ENV[$key]);
            } else {
                $_ENV[$key] = $env;
            }

            if ($server === null) {
                unset($_SERVER[$key]);
            } else {
                $_SERVER[$key] = $server;
            }
        }

        parent::tearDown();
    }

    public function test_it_exposes_the_configuration_helpers(): void
    {
        $generator = new JobContentGenerator();

        $this->assertTrue($generator->isConfigured());
        $this->assertSame('gemini-3.6-flash', $generator->modelName());
        $this->assertTrue(method_exists($generator, 'usageSnapshot'));
    }

    public function test_it_reports_not_configured_without_any_key(): void
    {
        config([
            'services.gemini.key' => null,
            'services.openrouter.key' => null,
        ]);

        $generator = new JobContentGenerator();

        $this->assertFalse($generator->isConfigured());
        $this->assertFalse($generator->usageSnapshot()['configured']);
    }

    public function test_it_classifies_a_free_tier_daily_quota_429(): void
    {
        $failure = $this->classify(429, (string) json_encode([
            'error' => [
                'code' => 429,
                'status' => 'RESOURCE_EXHAUSTED',
                'message' => 'Quota exceeded for quota metric generate_content_free_tier_requests.',
                'details' => [[
                    '@type' => 'type.googleapis.com/google.rpc.QuotaFailure',
                    'violations' => [[
                        'quotaId' => 'GenerateRequestsPerDayPerProjectPerModel-FreeTier',
                    ]],
                ]],
            ],
        ]));

        $this->assertSame('quota_day', $failure['code']);
        $this->assertGreaterThan(0, $failure['retry_after_seconds']);
        $this->assertNotNull($failure['resets_at']);
        $this->assertContains($failure['code'], JobContentGenerator::LIMIT_CODES);
    }

    public function test_it_classifies_a_per_minute_429_with_google_retry_delay(): void
    {
        $failure = $this->classify(429, '{"error":{"code":429,"status":"RESOURCE_EXHAUSTED","details":[{"@type":"type.googleapis.com/google.rpc.RetryInfo","retryDelay":"7s"}]}}');

        $this->assertSame('rate_minute', $failure['code']);
        $this->assertSame(7, $failure['retry_after_seconds']);
    }

    public function test_it_classifies_a_rejected_api_key(): void
    {
        $failure = $this->classify(401, '{"error":{"code":401,"message":"API key not valid. Please pass a valid API key."}}');

        $this->assertSame('auth', $failure['code']);
        $this->assertStringContainsString('GEMINI_API_KEY', $failure['message']);
        $this->assertNotContains($failure['code'], JobContentGenerator::LIMIT_CODES);
    }

    public function test_a_cooling_down_provider_is_reported_in_the_snapshot(): void
    {
        $generator = new JobContentGenerator();

        $this->block($generator, [
            'message' => 'Google Gemini free-tier usage is used up for today.',
            'code' => 'quota_day',
            'retry_after_seconds' => 600,
            'resets_at' => null,
        ]);

        $snapshot = $generator->usageSnapshot();

        $this->assertTrue($snapshot['providers'][0]['blocked']);
        $this->assertSame('quota_day', $snapshot['blocked_code']);
        $this->assertNotNull($snapshot['blocked_until']);
    }

    public function test_the_daily_limit_short_circuits_generation(): void
    {
        config(['services.job_ai.daily_limit' => 1]);

        $generator = new JobContentGenerator();
        $this->bump($generator, 'success');

        $result = $generator->generate(
            ['position_title' => 'Front Desk Associate'],
            ['skills' => [], 'certifications' => []],
        );

        $this->assertFalse($result['ok']);
        $this->assertSame('daily_limit', $result['code']);
        $this->assertNotNull($result['retry_after_seconds']);
        $this->assertSame(1, $result['usage']['used_today']);
        $this->assertSame(1, $result['usage']['daily_limit']);
    }

    /** A used-up quota must outrank a dead fallback key in the reported error. */
    public function test_the_most_actionable_failure_is_reported(): void
    {
        $generator = new JobContentGenerator();
        $keep = new \ReflectionMethod($generator, 'keepFailure');

        $quota = ['message' => 'Gemini free-tier usage is used up for today.', 'code' => 'quota_day', 'retry_after_seconds' => 600, 'resets_at' => null];
        $auth = ['message' => 'OpenRouter rejected the API key.', 'code' => 'auth', 'retry_after_seconds' => 3600, 'resets_at' => null];
        $overloaded = ['message' => 'Temporarily overloaded.', 'code' => 'overloaded', 'retry_after_seconds' => 45, 'resets_at' => null];
        $network = ['message' => 'Could not reach the AI service.', 'code' => 'network', 'retry_after_seconds' => null, 'resets_at' => null];

        // A usage limit beats the dead fallback key, which beats an overload.
        $this->assertSame('quota_day', $keep->invoke($generator, $auth, $quota)['code']);
        $this->assertSame('auth', $keep->invoke($generator, $overloaded, $auth)['code']);
        // Ties keep the earlier (primary) provider's failure.
        $this->assertSame('overloaded', $keep->invoke($generator, $overloaded, $network)['code']);
    }

    /* ------------------------------------------------------------------ */
    /* Reflection helpers — the classification/cool-down internals are      */
    /* protected on purpose; these tests pin their contract.                */
    /* ------------------------------------------------------------------ */

    /** @return array{message:string,code:string,retry_after_seconds:?int,resets_at:?string} */
    private function classify(int $status, string $body): array
    {
        $generator = new JobContentGenerator();
        $invoke = new \ReflectionMethod($generator, 'classifyFailure');

        return $invoke->invoke($generator, $status, $body, $this->firstProvider($generator));
    }

    private function block(JobContentGenerator $generator, array $failure): void
    {
        $invoke = new \ReflectionMethod($generator, 'blockProvider');
        $invoke->invoke($generator, $this->firstProvider($generator), $failure);
    }

    private function bump(JobContentGenerator $generator, string $metric): void
    {
        $invoke = new \ReflectionMethod($generator, 'bump');
        $invoke->invoke($generator, $metric, 1);
    }

    private function firstProvider(JobContentGenerator $generator): array
    {
        $providers = (new \ReflectionMethod($generator, 'providers'))->invoke($generator);

        $this->assertNotEmpty($providers, 'Expected at least one configured AI provider.');

        return $providers[0];
    }
}
