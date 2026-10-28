<?php

namespace Tests\Unit;

use App\Services\JobContentGenerator;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
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
    private const AI_ENV_KEYS = ['JOB_GROQ_API_KEY', 'JOB_GROQ_MODEL', 'JOB_OPENROUTER_API_KEY', 'JOB_OPENROUTER_MODEL', 'GEMINI_API_KEY', 'GEMINI_MODEL', 'GEMINI_FALLBACK_API_KEY', 'GEMINI_FALLBACK_MODEL', 'OPENROUTER_API_KEY', 'OPENROUTER_MODEL', 'JOB_GEMINI_TIMEOUT', 'JOB_GROQ_TIMEOUT', 'JOB_OPENROUTER_TIMEOUT', 'JOB_GEMINI_ATTEMPTS', 'JOB_GROQ_ATTEMPTS', 'JOB_OPENROUTER_ATTEMPTS'];

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
            'services.job_groq.key' => 'test-job-groq-key',
            'services.job_groq.model' => 'openai/gpt-oss-20b',
            'services.job_openrouter.key' => null,
            'services.job_openrouter.model' => 'nvidia/nemotron-3-super-120b-a12b:free',
            'services.gemini.key' => 'test-gemini-key',
            'services.gemini.model' => 'gemini-3.5-flash-lite',
            'services.gemini.fallback_key' => null,
            'services.gemini.fallback_model' => null,
            'services.openrouter.key' => null,
            'services.openrouter.model' => 'nvidia/nemotron-3-super-120b-a12b:free',
            'services.chat_groq.key' => null,
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
        $this->assertSame('gemini-3.5-flash-lite', $generator->modelName());
        $this->assertTrue(method_exists($generator, 'usageSnapshot'));
    }

    public function test_it_reports_not_configured_without_any_key(): void
    {
        config([
            'services.job_groq.key' => null,
            'services.job_openrouter.key' => null,
            'services.gemini.key' => null,
            'services.gemini.fallback_key' => null,
            'services.openrouter.key' => null,
            'services.chat_groq.key' => null,
        ]);

        // env() fallback must also be blank (the constructor reads env directly).
        foreach (['JOB_GROQ_API_KEY', 'JOB_OPENROUTER_API_KEY', 'GEMINI_API_KEY', 'GEMINI_FALLBACK_API_KEY', 'OPENROUTER_API_KEY'] as $k) {
            $_ENV[$k] = '';
            $_SERVER[$k] = '';
            putenv($k . '=');
        }

        $generator = new JobContentGenerator();

        $this->assertFalse($generator->isConfigured());
        $this->assertFalse($generator->usageSnapshot()['configured']);
    }

    public function test_it_orders_gemini_before_groq_before_openrouter(): void
    {
        config([
            'services.job_groq.key' => 'job-groq-key',
            'services.job_groq.model' => 'openai/gpt-oss-20b',
            'services.job_openrouter.key' => 'job-openrouter-key',
            'services.job_openrouter.model' => 'nvidia/nemotron-3-super-120b-a12b:free',
            'services.gemini.key' => 'shared-gemini-key',
            'services.gemini.model' => 'gemini-3.5-flash-lite',
        ]);

        $generator = new JobContentGenerator();
        $kinds = array_column((new \ReflectionMethod($generator, 'providers'))->invoke($generator), 'kind');

        // No second Gemini key configured -> the slot collapses into the
        // primary and the chain stays at three providers.
        $this->assertSame(['gemini', 'groq', 'openrouter'], $kinds);
        $this->assertSame('gemini-3.5-flash-lite', $generator->modelName());
    }

    /**
     * A second Gemini key is the same model behind a different credential, so
     * it belongs right after the primary: a used-up free tier is recovered
     * from before the chain changes model.
     */
    public function test_a_second_gemini_key_sits_right_after_the_primary(): void
    {
        config([
            'services.job_groq.key' => 'job-groq-key',
            'services.job_openrouter.key' => 'job-openrouter-key',
            'services.gemini.key' => 'shared-gemini-key',
            'services.gemini.model' => 'gemini-3.5-flash-lite',
            'services.gemini.fallback_key' => 'second-gemini-key',
            'services.gemini.fallback_model' => 'gemini-3.5-flash-lite',
        ]);

        $generator = new JobContentGenerator();
        $providers = (new \ReflectionMethod($generator, 'providers'))->invoke($generator);

        $this->assertSame(['gemini', 'gemini', 'groq', 'openrouter'], array_column($providers, 'kind'));
        // The second key carries the same short budget as the primary.
        $this->assertSame(10, $providers[1]['timeout']);
        $this->assertSame(1, $providers[1]['attempts']);
    }

    /** A quota'd primary key must not block the second key. */
    public function test_each_gemini_key_has_its_own_cool_down(): void
    {
        config([
            'services.gemini.key' => 'shared-gemini-key',
            'services.gemini.model' => 'gemini-3.5-flash-lite',
            'services.gemini.fallback_key' => 'second-gemini-key',
            'services.gemini.fallback_model' => 'gemini-3.5-flash-lite',
        ]);

        $generator = new JobContentGenerator();
        $providers = (new \ReflectionMethod($generator, 'providers'))->invoke($generator);

        (new \ReflectionMethod($generator, 'blockProvider'))->invoke($generator, $providers[0], [
            'message' => 'Google Gemini free-tier usage is used up for today.',
            'code' => 'quota_day',
            'retry_after_seconds' => 600,
            'resets_at' => null,
        ]);

        $providerBlock = new \ReflectionMethod($generator, 'providerBlock');

        $this->assertNotNull($providerBlock->invoke($generator, $providers[0]));
        $this->assertNull($providerBlock->invoke($generator, $providers[1]));
    }

    /**
     * A slow primary provider must not stall the request: the chain moves on
     * to the next provider within the primary's own short timeout.
     */
    public function test_the_primary_provider_gets_a_short_timeout_and_one_attempt(): void
    {
        config([
            'services.job_groq.key' => 'job-groq-key',
            'services.job_groq.model' => 'openai/gpt-oss-20b',
            'services.job_openrouter.key' => 'job-openrouter-key',
            'services.job_openrouter.model' => 'nvidia/nemotron-3-super-120b-a12b:free',
            'services.gemini.key' => 'shared-gemini-key',
            'services.gemini.model' => 'gemini-3.5-flash-lite',
            'services.job_ai.timeouts.gemini' => 10,
            'services.job_ai.timeouts.groq' => 20,
            'services.job_ai.attempts.gemini' => 1,
            'services.job_ai.attempts.groq' => 2,
        ]);

        $generator = new JobContentGenerator();
        $providers = (new \ReflectionMethod($generator, 'providers'))->invoke($generator);

        $this->assertSame('gemini', $providers[0]['kind']);
        $this->assertSame(10, $providers[0]['timeout']);
        $this->assertSame(1, $providers[0]['attempts']);
        $this->assertSame('groq', $providers[1]['kind']);
        $this->assertSame(20, $providers[1]['timeout']);
        $this->assertSame(2, $providers[1]['attempts']);
    }

    /**
     * The whole point of the reorder: a slow (timing out) Gemini must hand
     * over to Groq instead of stalling the click.
     */
    public function test_a_timing_out_gemini_fails_over_to_groq(): void
    {
        config([
            'services.job_groq.key' => 'job-groq-key',
            'services.job_groq.model' => 'openai/gpt-oss-20b',
            'services.job_openrouter.key' => null,
            'services.gemini.key' => 'shared-gemini-key',
            'services.gemini.model' => 'gemini-3.5-flash-lite',
        ]);

        $geminiCalls = 0;
        $groqCalls = 0;

        Http::fake(function (Request $request) use (&$geminiCalls, &$groqCalls) {
            if (str_contains($request->url(), 'generativelanguage.googleapis.com')) {
                $geminiCalls++;

                throw new ConnectionException('cURL error 28: Operation timed out');
            }

            $groqCalls++;

            return Http::response([
                'choices' => [[
                    'message' => ['content' => json_encode([
                        'description' => 'Front desk role at Oxford Suites Makati.',
                        'responsibilities' => ['Greet arriving guests'],
                        'qualifications' => ['Hotel management diploma'],
                        'skills' => ['Communication'],
                        'additional' => ['HMO'],
                        'instructions' => 'Apply at the HR Office.',
                        'about' => 'Oxford Suites Makati is a premier all-suite hotel.',
                    ])],
                ]],
            ], 200);
        });

        $generator = new JobContentGenerator();
        $result = $generator->generate(
            ['position_title' => 'Front Desk Associate'],
            ['skills' => [], 'certifications' => []],
        );

        $this->assertTrue($result['ok'], (string) $result['error']);
        $this->assertSame('Groq', $result['via']['service']);
        $this->assertSame('Front desk role at Oxford Suites Makati.', $result['data']['description']);
        // Gemini was tried exactly once (its own attempt budget) before Groq.
        $this->assertSame(1, $geminiCalls);
        $this->assertSame(1, $groqCalls);
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
        // First provider is Gemini, so its key hint is reported.
        $this->assertStringContainsString('GEMINI_API_KEY', $failure['message']);
        $this->assertNotContains($failure['code'], JobContentGenerator::LIMIT_CODES);
    }

    public function test_a_cooling_down_provider_is_reported_in_the_snapshot(): void
    {
        $generator = new JobContentGenerator();

        $failure = [
            'message' => 'Groq free-tier usage is used up for today.',
            'code' => 'quota_day',
            'retry_after_seconds' => 600,
            'resets_at' => null,
        ];

        // Block every provider so the snapshot reports a hard block
        // (blocked_* is only set when NO fallback provider is open).
        foreach ((new \ReflectionMethod($generator, 'providers'))->invoke($generator) as $provider) {
            $block = new \ReflectionMethod($generator, 'blockProvider');
            $block->invoke($generator, $provider, $failure);
        }

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

    public function test_groq_retries_without_strict_json_mode_on_validation_failure(): void
    {
        config([
            'services.job_groq.key' => 'job-groq-key',
            'services.job_groq.model' => 'openai/gpt-oss-20b',
            'services.job_openrouter.key' => null,
            'services.gemini.key' => null,
        ]);

        $callCount = 0;
        Http::fake(function (Request $request) use (&$callCount) {
            $callCount++;
            if ($callCount === 1) {
                // First call with json_object format fails with json_validate_failed
                return Http::response([
                    'error' => [
                        'message' => 'Failed to validate JSON. Please adjust your prompt.',
                        'code' => 'json_validate_failed',
                    ],
                ], 400);
            }

            // Retry without strict json mode succeeds
            return Http::response([
                'choices' => [[
                    'message' => ['content' => json_encode([
                        'description' => 'Role at Oxford Suites Makati.',
                        'responsibilities' => ['Handle guest check-in'],
                        'qualifications' => ['High school diploma'],
                        'skills' => ['Customer Service'],
                        'additional' => ['Day shift'],
                        'instructions' => 'Send resume.',
                        'about' => 'Oxford Suites Makati.',
                    ])],
                ]],
            ], 200);
        });

        $generator = new JobContentGenerator();
        $result = $generator->generate(
            ['position_title' => 'Front Desk Associate'],
            ['skills' => [], 'certifications' => []],
        );

        $this->assertTrue($result['ok'], (string) ($result['error'] ?? 'Expected success'));
        $this->assertSame('Groq', $result['via']['service']);
        $this->assertSame(2, $callCount);
    }

    public function test_openrouter_falls_back_when_configured_model_is_404(): void
    {
        config([
            'services.job_groq.key' => null,
            'services.job_openrouter.key' => 'job-openrouter-key',
            'services.job_openrouter.model' => 'nvidia/nemotron-3-super-120b-a12b:free',
            'services.gemini.key' => null,
        ]);

        $openrouterCalls = [];
        Http::fake(function (Request $request) use (&$openrouterCalls) {
            $data = $request->data();
            $openrouterCalls[] = $data['model'] ?? '';

            if (($data['model'] ?? '') === 'nvidia/nemotron-3-super-120b-a12b:free') {
                return Http::response(['error' => ['message' => 'Not found', 'code' => 404]], 404);
            }

            return Http::response([
                'choices' => [[
                    'message' => ['content' => json_encode([
                        'description' => 'OpenRouter generated role.',
                        'responsibilities' => ['Guest relations'],
                        'qualifications' => ['TESDA NC II'],
                        'skills' => ['Front Desk Operations'],
                        'additional' => ['Uniform provided'],
                        'instructions' => 'Walk-in at HR.',
                        'about' => 'Premier hotel in Makati.',
                    ])],
                ]],
            ], 200);
        });

        $generator = new JobContentGenerator();
        $result = $generator->generate(
            ['position_title' => 'Front Desk Associate'],
            ['skills' => [], 'certifications' => []],
        );

        $this->assertTrue($result['ok'], (string) ($result['error'] ?? 'Expected success'));
        $this->assertSame('OpenRouter', $result['via']['service']);
        $this->assertContains('nvidia/nemotron-3-super-120b-a12b:free', $openrouterCalls);
        $this->assertContains('nvidia/nemotron-3.5-lightning:free', $openrouterCalls);
    }

    public function test_clear_cooldowns_removes_provider_blocks(): void
    {
        $generator = new JobContentGenerator();
        $providers = (new \ReflectionMethod($generator, 'providers'))->invoke($generator);

        (new \ReflectionMethod($generator, 'blockProvider'))->invoke($generator, $providers[0], [
            'message' => 'Temporary test failure.',
            'code' => 'model',
            'retry_after_seconds' => 60,
            'resets_at' => null,
        ]);

        $providerBlock = new \ReflectionMethod($generator, 'providerBlock');
        $this->assertNotNull($providerBlock->invoke($generator, $providers[0]));

        $generator->clearCooldowns();
        $this->assertNull($providerBlock->invoke($generator, $providers[0]));
    }

    public function test_non_quota_errors_do_not_report_hard_block_in_snapshot(): void
    {
        $generator = new JobContentGenerator();
        $providers = (new \ReflectionMethod($generator, 'providers'))->invoke($generator);

        // Block every provider with non-quota error codes (model 404, network error)
        foreach ($providers as $provider) {
            (new \ReflectionMethod($generator, 'blockProvider'))->invoke($generator, $provider, [
                'message' => 'Model not found.',
                'code' => 'model',
                'retry_after_seconds' => 60,
                'resets_at' => null,
            ]);
        }

        $snapshot = $generator->usageSnapshot();
        // Individual providers are marked cooling down, but UI should NOT show "Limit reached"
        $this->assertTrue($snapshot['providers'][0]['blocked']);
        $this->assertNull($snapshot['blocked_until']);
        $this->assertNull($snapshot['blocked_code']);
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
