<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Generates job-post draft content grounded in the HR screening vocabulary.
 *
 * Resilience chain (first success wins):
 *   1. Shared Google Gemini with GEMINI_API_KEY / GEMINI_MODEL
 *      (gemini-3.5-flash-lite) — short timeout (JOB_GEMINI_TIMEOUT, 10s)
 *      and a single attempt, so a slow Gemini fails over in seconds
 *   2. Optional second Gemini key (GEMINI_FALLBACK_API_KEY /
 *      GEMINI_FALLBACK_MODEL) — the same model behind a different key, so a
 *      used-up free tier is recovered from without changing the output
 *   3. Groq with JOB_GROQ_API_KEY / JOB_GROQ_MODEL (openai/gpt-oss-20b)
 *   4. OpenRouter with JOB_OPENROUTER_API_KEY / JOB_OPENROUTER_MODEL
 *      (nvidia/nemotron-3-super-120b-a12b:free) — survives a Gemini/Groq
 *      outage
 *
 * Every provider has its own timeout + attempt budget (services.job_ai), so
 * the first (primary) provider can never stall the request: it gets one
 * short attempt and the chain moves on to the next provider.
 *
 * The vocabulary (skills / certifications from screening_reference_data) is
 * injected into the prompt so generated "skills" and "qualifications" reuse
 * terms the NLP screening already recognizes — keeping applicant match scores
 * meaningful. Generation never publishes anything; HR always reviews the
 * draft in the Job Post Builder first.
 *
 * Usage indicator support: every call records attempts / drafts / tokens in
 * the cache (usageSnapshot()), classifies provider failures into machine codes
 * (quota_day, rate_minute, auth …) and remembers how long a provider must be
 * skipped — so the Job Post Builder can show *why* "Generate with AI" is not
 * answering and when it will be usable again. Usage metrics are best-effort:
 * a broken cache never blocks a generation.
 */
class JobContentGenerator
{
    /** Failure codes that mean "the AI usage/limit is used up" (UI shows the limit state). */
    public const LIMIT_CODES = ['quota_day', 'rate_minute', 'quota', 'daily_limit'];

    protected ?string $groqKey;

    protected string $groqModel;

    protected ?string $openrouterKey;

    protected string $openrouterModel;

    protected ?string $apiKey;

    protected string $model;

    protected ?string $fallbackModel;

    protected ?string $fallbackApiKey;

    protected int $timeout;

    protected int $maxAttempts = 3;

    /**
     * Per-provider HTTP timeout (seconds) and attempt budget.
     *
     * The primary provider is deliberately given a short timeout and a single
     * attempt: when it is slow the chain must move on to the next provider
     * within seconds, not spend the whole request on slow retries.
     *
     * @var array<string,int>
     */
    protected array $providerTimeouts = [];

    /** @var array<string,int> */
    protected array $providerAttempts = [];

    /**
     * Hard ceiling (seconds) for one generation, across all providers.
     * When it is reached no further provider is started, so a fully degraded
     * chain answers with a clean error instead of a hanging request.
     */
    protected int $totalBudget;

    /** Optional app-level cap on successful drafts per day (0 = unlimited). */
    protected int $dailyLimit;

    /** HTTP statuses worth retrying (rate-limit / transient provider-side failures). */
    protected array $retryableStatuses = [429, 500, 502, 503, 504];

    /**
     * How long a provider is skipped after a failure, per failure code (seconds).
     * Usage limits get the longest local cool-downs so a dead/free-tier key is
     * not retried 3× on every click; auth/model failures are skipped for an hour
     * (only an admin can fix those).
     */
    protected array $cooldowns = [
        'quota_day' => 1800,
        'quota' => 1800,
        'rate_minute' => 65,
        'overloaded' => 30,
        'auth' => 1800,
        'model' => 60,
        'request' => 30,
        'network' => 20,
    ];

    public function __construct()
    {
        // Job Builder has its own Groq/OpenRouter keys; Gemini is the shared key.
        $this->groqKey = config('services.job_groq.key') ?: env('JOB_GROQ_API_KEY') ?: config('services.chat_groq.key') ?: null;
        $this->groqModel = (string) (config('services.job_groq.model') ?: env('JOB_GROQ_MODEL', 'openai/gpt-oss-20b'));
        $this->openrouterKey = config('services.job_openrouter.key') ?: env('JOB_OPENROUTER_API_KEY') ?: config('services.openrouter.key') ?: env('OPENROUTER_API_KEY') ?: null;
        $this->openrouterModel = (string) (config('services.job_openrouter.model') ?: env('JOB_OPENROUTER_MODEL', env('OPENROUTER_MODEL', 'nvidia/nemotron-3.5-lightning:free')));
        $this->apiKey = config('services.gemini.key') ?: env('GEMINI_API_KEY') ?: null;
        $this->model = (string) (config('services.gemini.model') ?: env('GEMINI_MODEL', 'gemini-3.1-flash-lite'));
        $this->fallbackModel = config('services.gemini.fallback_model') ?: env('GEMINI_FALLBACK_MODEL') ?: null;
        $this->fallbackApiKey = config('services.gemini.fallback_key') ?: env('GEMINI_FALLBACK_API_KEY') ?: null;
        $this->timeout = (int) (config('services.gemini.timeout') ?: env('GEMINI_TIMEOUT', 30));
        $this->dailyLimit = max(0, (int) (config('services.job_ai.daily_limit') ?? env('JOB_AI_DAILY_LIMIT', 0)));

        // Per-provider budget: a slow provider must not eat the whole request.
        $this->providerTimeouts = [
            'gemini' => (int) (config('services.job_ai.timeouts.gemini') ?: env('JOB_GEMINI_TIMEOUT', 10)),
            'groq' => (int) (config('services.job_ai.timeouts.groq') ?: env('JOB_GROQ_TIMEOUT', 20)),
            'openrouter' => (int) (config('services.job_ai.timeouts.openrouter') ?: env('JOB_OPENROUTER_TIMEOUT', 20)),
        ];
        $this->providerAttempts = [
            'gemini' => (int) (config('services.job_ai.attempts.gemini') ?: env('JOB_GEMINI_ATTEMPTS', 1)),
            'groq' => (int) (config('services.job_ai.attempts.groq') ?: env('JOB_GROQ_ATTEMPTS', 2)),
            'openrouter' => (int) (config('services.job_ai.attempts.openrouter') ?: env('JOB_OPENROUTER_ATTEMPTS', 2)),
        ];
        $this->totalBudget = max(5, (int) (config('services.job_ai.total_budget') ?: env('JOB_AI_TOTAL_BUDGET', 35)));
    }

    /**
     * Ordered provider attempts — duplicates (same service + model + key)
     * are collapsed so a half-configured server never calls twice.
     *
     * Order: shared Gemini -> optional second Gemini key -> Groq -> OpenRouter.
     * The second key is the same model behind a different credential, so a
     * used-up free tier is recovered from before the chain changes model.
     * The first provider carries a short timeout and one attempt, so a
     * slow answer fails over to the next provider within seconds.
     *
     * @return list<array{kind:string,model:string,key:string,label:string,timeout:int,attempts:int}>
     */
    protected function providers(): array
    {
        $chain = [];
        $seen = [];
        $add = function (string $kind, ?string $model, ?string $key, string $label) use (&$chain, &$seen) {
            if (! is_string($key) || trim($key) === '' || ! is_string($model) || trim($model) === '') {
                return;
            }
            // The signature must be exact: hashing the full key (like
            // providerTag()) keeps two *different* keys apart, while an
            // unconfigured fallback key still collapses into the primary.
            $sig = md5($kind . '|' . trim($model) . '|' . trim($key));
            if (isset($seen[$sig])) {
                return;
            }
            $seen[$sig] = true;
            $chain[] = [
                'kind' => $kind,
                'model' => trim($model),
                'key' => trim($key),
                'label' => $label,
                'timeout' => $this->timeoutFor($kind),
                'attempts' => $this->attemptsFor($kind),
            ];
        };

        $add('gemini', $this->model, $this->apiKey, 'Google Gemini');
        $add('gemini', $this->fallbackModel ?: $this->model, $this->fallbackApiKey ?: $this->apiKey, 'Google Gemini (second key)');
        $add('groq', $this->groqModel, $this->groqKey, 'Groq');
        $add('openrouter', $this->openrouterModel, $this->openrouterKey, 'OpenRouter');

        return $chain;
    }

    /** HTTP timeout (seconds) for one provider kind. */
    protected function timeoutFor(string $kind): int
    {
        $seconds = (int) ($this->providerTimeouts[$kind] ?? $this->timeout);

        return $seconds > 0 ? $seconds : $this->timeout;
    }

    /** Attempt budget for one provider kind. */
    protected function attemptsFor(string $kind): int
    {
        $attempts = (int) ($this->providerAttempts[$kind] ?? $this->maxAttempts);

        return $attempts > 0 ? $attempts : 1;
    }

    /**
     * How long a provider is skipped after a connection error. A timeout is
     * skipped longer than an instant connection refusal, so the next click
     * does not pay the same slow wait again.
     */
    protected function skipAfterConnectionError(\Throwable $e): int
    {
        $default = (int) ($this->cooldowns['network'] ?? 20);

        if ($e instanceof \Illuminate\Http\Client\ConnectionException) {
            return max(60, $default);
        }

        return $default;
    }

    /** True when at least one provider key is configured (Groq, OpenRouter or Gemini). */
    public function isConfigured(): bool
    {
        return $this->providers() !== [];
    }

    /**
     * Primary model configured for this server — Gemini's when a Gemini key
     * exists, otherwise Groq's, otherwise OpenRouter's. Shown in the API
     * meta and in the builder's AI usage indicator.
     */
    public function modelName(): string
    {
        if ($this->apiKey) {
            return $this->model;
        }

        return $this->groqKey ? $this->groqModel : $this->openrouterModel;
    }

    /**
     * @param  array{position_title:string,department?:string|null,employment_type?:string|null,schedule?:string|null,vacancies?:int|null,experience_level?:string|null,education_level?:string|null,skills?:string[],requested_note?:string|null}  $job
     * @param  array{skills:string[],certifications:string[]}  $vocabulary
     * @return array{ok:bool,data:?array,error:?string,code?:string,retry_after_seconds?:?int,resets_at?:?string,usage?:array,via?:array}
     */
    public function generate(array $job, array $vocabulary): array
    {
        if (! $this->isConfigured()) {
            return $this->failure(
                'The AI generator is not configured. Set JOB_GROQ_API_KEY (or a fallback key) on the API server.',
                'not_configured',
            );
        }

        // App-level daily cap (JOB_AI_DAILY_LIMIT, 0 = unlimited). Checked before
        // calling a provider so the indicator can warn ahead of the provider 429.
        if ($this->dailyLimit > 0 && $this->metric('success') >= $this->dailyLimit) {
            return $this->failure(
                "Today's AI draft limit ({$this->dailyLimit}) has been reached. It resets after midnight — apply a Content Template meanwhile.",
                'daily_limit',
                $this->secondsUntilDayReset(),
            );
        }

        $prompt = $this->buildPrompt($job, $vocabulary);

        // Walk the provider chain (Gemini -> Groq -> OpenRouter);
        // first success wins. Each provider gets its own attempt budget
        // because providers often answer 503/overloaded on the first try,
        // but the primary provider gets a short timeout and a single attempt
        // so a slow answer fails over to the next provider in seconds.
        $providers = $this->providers();
        if ($providers === []) {
            return $this->failure(
                'The AI generator is not configured. Set GEMINI_API_KEY (or JOB_GROQ_API_KEY / JOB_OPENROUTER_API_KEY) on the API server.',
                'not_configured',
            );
        }

        $this->bump('attempt');

        // Hard ceiling for this generation: no further provider is started
        // once it is reached, so a fully degraded chain answers with a clean
        // error instead of a hanging request.
        $deadline = microtime(true) + $this->totalBudget;

        $last = [
            'message' => 'Generation failed.',
            'code' => 'provider',
            'retry_after_seconds' => null,
            'resets_at' => null,
        ];

        foreach ($providers as $provider) {
            if (microtime(true) >= $deadline) {
                break;
            }

            // A provider that just reported a usage limit / dead key is skipped
            // instead of burning 3 slow retries on it.
            $block = $this->providerBlock($provider);
            if ($block !== null) {
                $last = $this->keepFailure($last, [
                    'message' => $block['message'],
                    'code' => $block['code'],
                    'retry_after_seconds' => $block['retry_after_seconds'],
                    'resets_at' => $block['resets_at'],
                ]);
                continue;
            }

            $attempts = (int) ($provider['attempts'] ?? $this->maxAttempts);

            for ($attempt = 1; $attempt <= $attempts; $attempt++) {
                if (microtime(true) >= $deadline) {
                    break;
                }

                try {
                    $response = match ($provider['kind']) {
                        'groq' => $this->postGroq($provider, $prompt),
                        'openrouter' => $this->postOpenRouter($provider, $prompt),
                        default => $this->postGemini($provider, $prompt),
                    };
                } catch (\Throwable $e) {
                    // Connection/timeout — always retryable.
                    Log::warning('AI draft generation connection error', [
                        'via' => $provider['label'],
                        'model' => $provider['model'],
                        'attempt' => $attempt,
                        'error' => $e->getMessage(),
                    ]);
                    $last = $this->keepFailure($last, [
                        'message' => 'Could not reach the AI service: ' . $e->getMessage(),
                        'code' => 'network',
                        'retry_after_seconds' => null,
                        'resets_at' => null,
                    ]);
                    // A provider that timed out is skipped for a while, so the
                    // next click goes straight to a healthy provider.
                    $this->blockProvider($provider, [
                        'message' => $provider['label'] . ' did not answer in time (timeout or connection error).',
                        'code' => 'network',
                        'retry_after_seconds' => $this->skipAfterConnectionError($e),
                        'resets_at' => null,
                    ]);
                    if ($attempt < $attempts) {
                        $this->backoff($attempt);
                    }
                    continue;
                }

                // Intra-provider fallback: Groq JSON format rejection (400 json_validate_failed)
                if ($response->status() === 400 && $provider['kind'] === 'groq' && str_contains(Str::lower($response->body()), 'json_validate_failed')) {
                    Log::info('Groq json_validate_failed, retrying without strict json_object response_format', [
                        'model' => $provider['model'],
                    ]);
                    try {
                        $retryResponse = $this->postGroq($provider, $prompt, false);
                        if ($retryResponse->successful()) {
                            $response = $retryResponse;
                        }
                    } catch (\Throwable) {
                        // ignore, proceed with original response
                    }
                }

                // Intra-provider fallback: Groq model not found / invalid model -> try qwen/qwen3.8-27b
                if (($response->status() === 404 || ($response->status() === 400 && str_contains(Str::lower($response->body()), 'model'))) && $provider['kind'] === 'groq') {
                    foreach (['qwen/qwen3.8-27b', 'openai/gpt-oss-120b'] as $altModel) {
                        if ($provider['model'] === $altModel) {
                            continue;
                        }
                        Log::info("Groq model {$provider['model']} unavailable, trying fallback model {$altModel}");
                        $altProvider = array_merge($provider, ['model' => $altModel]);
                        try {
                            $altResponse = $this->postGroq($altProvider, $prompt, false);
                            if ($altResponse->successful()) {
                                $response = $altResponse;
                                $provider = $altProvider;
                                break;
                            }
                        } catch (\Throwable) {
                            // continue
                        }
                    }
                }

                // Intra-provider fallback: OpenRouter model not found (404) -> try nemotron-3.5-lightning or openrouter/free
                if ($response->status() === 404 && $provider['kind'] === 'openrouter') {
                    foreach (['nvidia/nemotron-3.5-lightning:free', 'openrouter/free'] as $altModel) {
                        if ($provider['model'] === $altModel) {
                            continue;
                        }
                        Log::info("OpenRouter model {$provider['model']} returned 404, trying fallback model {$altModel}");
                        $altProvider = array_merge($provider, ['model' => $altModel]);
                        try {
                            $altResponse = $this->postOpenRouter($altProvider, $prompt);
                            if ($altResponse->successful()) {
                                $response = $altResponse;
                                $provider = $altProvider;
                                break;
                            }
                        } catch (\Throwable) {
                            // continue
                        }
                    }
                }

                // Intra-provider fallback: Gemini model unavailable (404 / 503) -> try gemini-3.1-flash-lite
                if (in_array($response->status(), [404, 503], true) && $provider['kind'] === 'gemini') {
                    foreach (['gemini-3.1-flash-lite', 'gemini-flash-latest'] as $altModel) {
                        if ($provider['model'] === $altModel) {
                            continue;
                        }
                        Log::info("Gemini model {$provider['model']} returned {$response->status()}, trying fallback model {$altModel}");
                        $altProvider = array_merge($provider, ['model' => $altModel]);
                        try {
                            $altResponse = $this->postGemini($altProvider, $prompt);
                            if ($altResponse->successful()) {
                                $response = $altResponse;
                                $provider = $altProvider;
                                break;
                            }
                        } catch (\Throwable) {
                            // continue
                        }
                    }
                }

                response_check:
                if ($response->successful()) {
                    $text = $this->responseText($provider, $response);
                    $parsed = $this->parseJsonPayload($text);

                    if ($parsed === null) {
                        $last = $this->keepFailure($last, [
                            'message' => 'The AI returned an unreadable draft. Please retry.',
                            'code' => 'unreadable',
                            'retry_after_seconds' => null,
                            'resets_at' => null,
                        ]);
                        if ($attempt < $attempts) {
                            $this->backoff($attempt);
                        }
                        continue;
                    }

                    $this->bump('success');
                    $this->recordTokens($response);
                    $this->recordSuccess($provider);

                    return [
                        'ok' => true,
                        'data' => $this->normalize($parsed),
                        'error' => null,
                        // Tells the frontend which provider actually produced
                        // the draft (e.g. OpenRouter's free auto-router).
                        'via' => [
                            'service' => $provider['label'],
                            'model' => $provider['model'],
                            'free' => $provider['kind'] === 'openrouter'
                                && ($provider['model'] === 'openrouter/free' || str_ends_with($provider['model'], ':free')),
                        ],
                        // Fresh indicator data for the builder's usage chip.
                        'usage' => $this->usageSnapshot(),
                    ];
                }

                $status = $response->status();
                $failure = $this->classifyFailure($status, $response->body(), $provider);

                Log::warning('AI draft generation failed', [
                    'via' => $provider['label'],
                    'model' => $provider['model'],
                    'attempt' => $attempt,
                    'status' => $status,
                    'code' => $failure['code'],
                    'body' => Str::limit($response->body(), 500),
                ]);

                $last = $this->keepFailure($last, $failure);

                if (! in_array($status, $this->retryableStatuses, true)) {
                    // Permanent failure for this provider (bad key, unknown
                    // model, bad request) — cool it down and move on to the
                    // next provider, whose key/model may be fine.
                    $this->blockProvider($provider, $failure);
                    break;
                }

                // Usage limits do not clear by retrying this second — cool the
                // provider down (so clicks stay fast) and let the next provider
                // in the chain answer.
                if (in_array($failure['code'], self::LIMIT_CODES, true)) {
                    $this->blockProvider($provider, $failure);
                    break;
                }

                if ($attempt < $attempts) {
                    $this->backoff($attempt);
                }
            }
        }

        return $this->failure($last['message'], $last['code'], $last['retry_after_seconds'], $last['resets_at']);
    }

    /**
     * A request pre-set with the provider's own timeout budget, so a slow
     * provider is dropped quickly instead of stalling the whole chain.
     */
    protected function requestFor(array $provider): \Illuminate\Http\Client\PendingRequest
    {
        $timeout = (int) ($provider['timeout'] ?? $this->timeout);
        $timeout = $timeout > 0 ? $timeout : $this->timeout;

        return Http::timeout($timeout)
            ->connectTimeout(max(1, min(5, $timeout)))
            ->acceptJson();
    }

    /** Single generateContent call against Google's API. */
    protected function postGemini(array $provider, string $prompt): \Illuminate\Http\Client\Response
    {
        $url = 'https://generativelanguage.googleapis.com/v1beta/models/'
            . $provider['model'] . ':generateContent?key=' . urlencode($provider['key']);

        return $this->requestFor($provider)->post($url, [
            'contents' => [
                ['parts' => [['text' => $prompt]]],
            ],
            // NOTE: temperature/top_p/top_k are deprecated and rejected
            // by gemini-3.5-flash-lite and newer, so only send the
            // output controls those models still accept.
            'generationConfig' => [
                'maxOutputTokens' => 2048,
                'responseMimeType' => 'application/json',
            ],
        ]);
    }

    /** Single chat-completions call routed through Groq. */
    protected function postGroq(array $provider, string $prompt, bool $jsonMode = true): \Illuminate\Http\Client\Response
    {
        $payload = [
            'model' => $provider['model'],
            'messages' => [
                ['role' => 'user', 'content' => $prompt],
            ],
            'max_tokens' => 2048,
        ];

        if ($jsonMode) {
            $payload['response_format'] = ['type' => 'json_object'];
        }

        return $this->requestFor($provider)
            ->withHeaders([
                'Authorization' => 'Bearer ' . $provider['key'],
            ])
            ->post('https://api.groq.com/openai/v1/chat/completions', $payload);
    }

    /** Single chat-completions call routed through OpenRouter. */
    protected function postOpenRouter(array $provider, string $prompt, bool $jsonMode = false): \Illuminate\Http\Client\Response
    {
        $payload = [
            'model' => $provider['model'],
            'messages' => [
                ['role' => 'user', 'content' => $prompt],
            ],
            'max_tokens' => 2048,
        ];

        if ($jsonMode) {
            $payload['response_format'] = ['type' => 'json_object'];
        }

        return $this->requestFor($provider)
            ->withHeaders([
                'Authorization' => 'Bearer ' . $provider['key'],
                'HTTP-Referer' => (string) (config('app.url') ?: 'http://localhost'),
                'X-Title' => 'HRMS Job Post Builder',
            ])
            ->post('https://openrouter.ai/api/v1/chat/completions', $payload);
    }

    /** Extracts the model text from any provider's success envelope. */
    protected function responseText(array $provider, \Illuminate\Http\Client\Response $response): string
    {
        if ($provider['kind'] === 'gemini') {
            return (string) data_get($response->json(), 'candidates.0.content.parts.0.text', '');
        }

        // Groq + OpenRouter both use the OpenAI chat-completions envelope.
        return (string) data_get($response->json(), 'choices.0.message.content', '');
    }

    /**
     * Turn a provider HTTP failure into a machine-readable code + a plain
     * explanation. Codes drive the builder indicator: LIMIT_CODES light up the
     * "AI limit reached" state, `auth` tells HR an admin must fix a key, etc.
     *
     * @return array{message:string,code:string,retry_after_seconds:?int,resets_at:?string}
     */
    protected function classifyFailure(int $status, string $body, array $provider): array
    {
        $via = $provider['label'];
        $keyHint = match ($provider['kind']) {
            'groq' => 'JOB_GROQ_API_KEY',
            'openrouter' => 'JOB_OPENROUTER_API_KEY',
            default => 'GEMINI_API_KEY',
        };
        $modelHint = match ($provider['kind']) {
            'groq' => 'JOB_GROQ_MODEL',
            'openrouter' => 'JOB_OPENROUTER_MODEL',
            default => 'GEMINI_MODEL',
        };
        $haystack = Str::lower($body);
        $retryAfter = $this->retryDelayFromBody($body);

        $build = function (string $message, string $code, int $defaultRetry = 0) use ($retryAfter): array {
            $seconds = $retryAfter ?? ($defaultRetry > 0 ? $defaultRetry : null);

            return [
                'message' => $message,
                'code' => $code,
                'retry_after_seconds' => $seconds,
                'resets_at' => $seconds ? now()->addSeconds($seconds)->toIso8601String() : null,
            ];
        };

        // 429 (Google rate/quota) and 402 (OpenRouter credits) are the
        // "usage is used up" family — the indicator shows the reset countdown.
        if ($status === 429 || $status === 402) {
            // Google marks a per-day quota in the QuotaFailure quota id
            // ("GenerateRequestsPerDayPerProjectPerModel-FreeTier") / message.
            $isDaily = preg_match('/per[\s_-]?day|daily|free[\s_-]?tier/i', $haystack) === 1;

            if ($isDaily) {
                $seconds = $retryAfter ?? $this->secondsUntilQuotaReset();

                return $build(
                    $via . ' free-tier usage is used up for today (HTTP ' . $status . '). It resets around '
                        . now()->addSeconds($seconds)->format('g:i A')
                        . ' — you can keep writing the post with a Content Template meanwhile.',
                    'quota_day',
                    $seconds,
                );
            }

            return $build(
                $via . ' rate limit was reached (HTTP ' . $status . '). Retry in about '
                    . $this->humanDuration($retryAfter ?? 60) . ', or use a Content Template.',
                'rate_minute',
                60,
            );
        }

        if ($status === 400 && str_contains($haystack, 'json_validate_failed')) {
            return $build('The AI model struggled with strict JSON formatting (HTTP 400). Please retry.', 'unreadable', 0);
        }

        return match (true) {
            in_array($status, [500, 502, 503, 504], true) => $build($via . ' is temporarily overloaded (HTTP ' . $status . '). Nothing was saved — please retry in a moment.', 'overloaded', 45),
            in_array($status, [401, 403], true) => $build($via . ' rejected the API key (HTTP ' . $status . '). Ask an admin to check ' . $keyHint . ' on the API server.', 'auth', 1800),
            $status === 404 => $build('The configured AI model was not found (HTTP 404). Ask an admin to check ' . $modelHint . ' on the API server.', 'model', 60),
            $status === 400 && (str_contains($haystack, 'model') || str_contains($haystack, 'not found')) => $build('The configured model name may be invalid (HTTP 400). Ask an admin to check ' . $modelHint . ' on the API server.', 'model', 60),
            $status === 400 => $build('The AI request was rejected (HTTP 400). Ask an admin to check ' . $modelHint . ' on the API server.', 'request', 30),
            default => $build('The AI service (' . $via . ') could not generate a draft (HTTP ' . $status . '). Please retry.', 'provider'),
        };
    }

    /** Seconds from Google's RetryInfo ("retryDelay":"34s") or provider prose. */
    protected function retryDelayFromBody(string $body): ?int
    {
        if (preg_match('/"retryDelay"\s*:\s*"?([\d.]+)s"?/i', $body, $m) === 1) {
            return max(1, (int) ceil((float) $m[1]));
        }

        if (preg_match('/retry(?:\s+again)?\s+in\s+([\d.]+)\s*(seconds?|secs?|s|minutes?|mins?|m)\b/i', $body, $m) === 1) {
            $value = (float) $m[1];

            return max(1, (int) ceil(stripos($m[2], 'm') === 0 ? $value * 60 : $value));
        }

        return null;
    }

    /** Seconds until Google's free-tier daily quota resets (midnight, Pacific). */
    protected function secondsUntilQuotaReset(): int
    {
        try {
            return max(60, (int) \Carbon\Carbon::now('America/Los_Angeles')->endOfDay()->addSecond()->diffInSeconds(now()));
        } catch (\Throwable) {
            return 3600;
        }
    }

    /** Seconds until the app-level daily cap resets (midnight, server timezone). */
    protected function secondsUntilDayReset(): int
    {
        try {
            return max(60, (int) now()->endOfDay()->addSecond()->diffInSeconds(now()));
        } catch (\Throwable) {
            return 3600;
        }
    }

    /** Compact "45s" / "3m" / "6h 10m" so toasts stay short. */
    protected function humanDuration(int $seconds): string
    {
        if ($seconds >= 3600) {
            return intdiv($seconds, 3600) . 'h ' . (int) ceil(($seconds % 3600) / 60) . 'm';
        }
        if ($seconds >= 60) {
            return (int) ceil($seconds / 60) . 'm';
        }

        return $seconds . 's';
    }

    /** Linear backoff between attempts (1s, 2s, 3s … capped at 5s). */
    protected function backoff(int $attempt): void
    {
        usleep(min($attempt, 5) * 1000 * 1000);
    }

    /**
     * Failure envelope + a fresh usage snapshot, so the controller and the UI
     * indicator see the limit state without a second request.
     */
    protected function failure(string $message, string $code, ?int $retryAfter = null, ?string $resetsAt = null): array
    {
        $payload = [
            'ok' => false,
            'data' => null,
            'error' => $message,
            'code' => $code,
            'retry_after_seconds' => $retryAfter,
            'resets_at' => $resetsAt ?? ($retryAfter ? now()->addSeconds($retryAfter)->toIso8601String() : null),
        ];

        // A missing key is a configuration error, not used-up usage — it must
        // not pollute the daily counters.
        if ($code !== 'not_configured') {
            $this->bump('failure');
            $this->recordLastError($payload);
        }

        $payload['usage'] = $this->usageSnapshot();

        return $payload;
    }

    /** Stable cache tag for one provider/credential (never stores the raw key). */
    protected function providerTag(array $provider): string
    {
        return substr(md5($provider['kind'] . '|' . $provider['model'] . '|' . $provider['key']), 0, 20);
    }

    /**
     * Rank a failure so the message HR sees describes the *cause* they can act
     * on: a used-up usage limit beats a dead fallback key, which beats a
     * transient overload. Ties keep the earlier (primary) provider.
     */
    protected function failurePriority(string $code): int
    {
        return match ($code) {
            'quota_day', 'daily_limit' => 5,
            'rate_minute', 'quota' => 4,
            'auth' => 3,
            'model', 'request' => 2,
            'overloaded' => 1,
            default => 0,
        };
    }

    /**
     * Keep the most actionable failure across the provider chain.
     *
     * @param  array{message:string,code:string,retry_after_seconds:?int,resets_at:?string}  $current
     * @param  array{message:string,code:string,retry_after_seconds:?int,resets_at:?string}  $candidate
     * @return array{message:string,code:string,retry_after_seconds:?int,resets_at:?string}
     */
    protected function keepFailure(array $current, array $candidate): array
    {
        return $this->failurePriority((string) $candidate['code']) > $this->failurePriority((string) $current['code'])
            ? $candidate
            : $current;
    }

    /**
     * Current cool-down for a provider, or null when it may be called.
     *
     * @return array{message:string,code:string,retry_after_seconds:int,resets_at:string}|null
     */
    protected function providerBlock(array $provider): ?array
    {
        try {
            $block = Cache::get('job_ai_block_' . $this->providerTag($provider));
        } catch (\Throwable) {
            return null;
        }

        if (! is_array($block) || (int) ($block['until'] ?? 0) <= time()) {
            return null;
        }

        $seconds = max(0, (int) $block['until'] - time());

        return [
            'message' => (string) ($block['message'] ?? ($provider['label'] . ' is cooling down after an AI usage limit.')),
            'code' => (string) ($block['code'] ?? 'cooldown'),
            'retry_after_seconds' => $seconds,
            'resets_at' => now()->addSeconds($seconds)->toIso8601String(),
        ];
    }

    /** Remember that a provider must be skipped for a while (usage limit / dead key). */
    protected function blockProvider(array $provider, array $failure): void
    {
        $code = (string) ($failure['code'] ?? 'provider');
        $seconds = (int) ($failure['retry_after_seconds'] ?? 0);
        if ($seconds <= 0) {
            $seconds = (int) ($this->cooldowns[$code] ?? 60);
        }

        // Cap the local cool-down: a per-day quota can reset earlier for paid
        // keys, and the worst case is one extra probe call.
        $seconds = max(15, min($seconds, 1800));

        try {
            Cache::put('job_ai_block_' . $this->providerTag($provider), [
                'until' => time() + $seconds,
                'code' => $code,
                'message' => (string) ($failure['message'] ?? ''),
            ], now()->addSeconds($seconds + 60));
        } catch (\Throwable) {
            // Cool-downs are best-effort — never block a generation.
        }
    }

    /** Bump a per-day usage counter (metrics must never break generation). */
    protected function bump(string $metric, int $amount = 1): void
    {
        try {
            $key = 'job_ai_' . $metric . '_' . now()->format('Ymd');
            $ttl = now()->endOfDay()->addHours(2);
            if (! Cache::has($key)) {
                Cache::put($key, 0, $ttl);
            }
            Cache::increment($key, $amount);
        } catch (\Throwable) {
            // Usage metrics are best-effort.
        }
    }

    /** Read a per-day usage counter. */
    protected function metric(string $metric): int
    {
        try {
            return (int) Cache::get('job_ai_' . $metric . '_' . now()->format('Ymd'), 0);
        } catch (\Throwable) {
            return 0;
        }
    }

    /** Add the provider-reported token spend to today's counter. */
    protected function recordTokens(\Illuminate\Http\Client\Response $response): void
    {
        try {
            $json = $response->json();
            if (! is_array($json)) {
                return;
            }

            $prompt = (int) (data_get($json, 'usageMetadata.promptTokenCount') ?? data_get($json, 'usage.prompt_tokens') ?? 0);
            $completion = (int) (data_get($json, 'usageMetadata.candidatesTokenCount') ?? data_get($json, 'usage.completion_tokens') ?? 0);

            if ($prompt + $completion > 0) {
                $this->bump('tokens', $prompt + $completion);
            }
        } catch (\Throwable) {
            // ignore
        }
    }

    /** Remember which provider answered last (shown in the indicator popover). */
    protected function recordSuccess(array $provider): void
    {
        try {
            $this->cachePut('job_ai_last_success', [
                'service' => $provider['label'],
                'model' => $provider['model'],
                'at' => now()->toIso8601String(),
            ]);
        } catch (\Throwable) {
            // ignore
        }
    }

    /** Store the last failure (code + reset time) for the indicator popover. */
    protected function recordLastError(array $payload): void
    {
        try {
            $this->cachePut('job_ai_last_error', [
                'code' => $payload['code'] ?? 'provider',
                'message' => $payload['error'] ?? 'Generation failed.',
                'retry_after_seconds' => $payload['retry_after_seconds'] ?? null,
                'resets_at' => $payload['resets_at'] ?? null,
                'at' => now()->toIso8601String(),
            ]);
        } catch (\Throwable) {
            // ignore
        }
    }

    /** Null-safe cache write for the usage records. */
    protected function cachePut(string $key, array $value): void
    {
        try {
            Cache::put($key, $value, now()->addDays(2));
        } catch (\Throwable) {
            // ignore
        }
    }

    /** Null-safe cache read for the indicator. */
    protected function cacheGet(string $key): ?array
    {
        try {
            $value = Cache::get($key);

            return is_array($value) ? $value : null;
        } catch (\Throwable) {
            return null;
        }
    }

    /** Clears any active provider cool-downs (e.g. after config changes or manual refresh). */
    public function clearCooldowns(): void
    {
        foreach ($this->providers() as $provider) {
            try {
                Cache::forget('job_ai_block_' . $this->providerTag($provider));
            } catch (\Throwable) {
                // ignore
            }
        }
    }

    /**
     * Public usage/limit snapshot for the Job Post Builder indicator
     * (GET /job-posts/ai-usage and every generate-draft response).
     *
     * @return array<string,mixed>
     */
    public function usageSnapshot(): array
    {
        $providers = [];
        $openProvider = false;
        $blockedUntil = null;
        $blockedCode = null;
        $blockedReason = null;
        $hasTrueLimit = false;

        foreach ($this->providers() as $provider) {
            $block = $this->providerBlock($provider);

            $providers[] = [
                'service' => $provider['label'],
                'model' => $provider['model'],
                'kind' => $provider['kind'],
                'blocked' => $block !== null,
                'blocked_until' => $block['resets_at'] ?? null,
                'blocked_reason' => $block['message'] ?? null,
            ];

            if ($block === null) {
                $openProvider = true;
                continue;
            }

            if (in_array($block['code'], self::LIMIT_CODES, true)) {
                $hasTrueLimit = true;
            }

            if ($blockedUntil === null || $block['resets_at'] > $blockedUntil) {
                $blockedUntil = $block['resets_at'];
                $blockedCode = $block['code'];
                $blockedReason = $block['message'];
            }
        }

        $used = $this->metric('success');
        $dailyLimit = $this->dailyLimit;
        // A hard block is reported only when EVERY provider is cooling
        // down AND an actual rate or quota limit is active. Transient errors
        // (model 404, network timeout, JSON parse) should not falsely display
        // "Limit reached" in the Job Post Builder.
        $hardBlocked = $providers !== [] && ! $openProvider && $hasTrueLimit;

        return [
            'configured' => $this->isConfigured(),
            'primary_model' => $this->modelName(),
            'daily_limit' => $dailyLimit,
            'used_today' => $used,
            'remaining_today' => $dailyLimit > 0 ? max(0, $dailyLimit - $used) : null,
            'attempts_today' => $this->metric('attempt'),
            'failures_today' => $this->metric('failure'),
            'tokens_today' => $this->metric('tokens'),
            // A hard block is reported only when EVERY provider is cooling
            // down and a true usage limit is in effect — otherwise a fallback provider can still answer.
            'blocked_until' => $hardBlocked ? $blockedUntil : null,
            'blocked_code' => $hardBlocked ? $blockedCode : null,
            'blocked_reason' => $hardBlocked ? $blockedReason : null,
            'providers' => $providers,
            'last_success' => $this->cacheGet('job_ai_last_success'),
            'last_error' => $this->cacheGet('job_ai_last_error'),
        ];
    }

    /**
     * Vocab-preferred prompt: the model reuses vocabulary terms verbatim
     * inside qualifications (and certifications) and writes only the
     * requested prose blocks. Skills are NOT generated — they come from the
     * position's requirement template. When the post already carries its own
     * screening requirements ($job['skills']), those are listed first and the
     * model is told to reflect them; $job['requested_note'] carries the
     * sourcing requisition's justification as extra role context.
     */
    /**
     * Screening level chips: the post accepts any of several levels, so the
     * prompt reads "A, B or C". Falls back to the single screening level when
     * the builder sent only that (older clients, or one chip picked).
     */
    protected function levelLine(array $levels, ?string $scalar): ?string
    {
        $levels = array_values(array_unique(array_filter(array_map(
            static fn ($l) => trim((string) $l),
            $levels
        ))));

        if ($levels === []) {
            $scalar = $scalar !== null ? trim($scalar) : '';

            return $scalar === '' ? null : $scalar;
        }

        if (count($levels) === 1) {
            return $levels[0];
        }

        $last = array_pop($levels);

        return implode(', ', $levels).' or '.$last;
    }

    protected function buildPrompt(array $job, array $vocabulary): string
    {
        $skills = array_values(array_unique(array_filter(array_map('trim', $vocabulary['skills'] ?? []))));
        $certs = array_values(array_unique(array_filter(array_map('trim', $vocabulary['certifications'] ?? []))));

        // Keep the prompt bounded: most hotel vocabularies fit, but cap anyway.
        $skills = array_slice($skills, 0, 150);
        $certs = array_slice($certs, 0, 60);

        // The post's own screening requirements (already on the draft).
        $requiredSkills = array_values(array_unique(array_filter(array_map(
            fn ($s) => trim((string) $s),
            (array) ($job['skills'] ?? []),
        ))));
        $requiredSkills = array_slice($requiredSkills, 0, 40);

        $requestedNote = trim((string) ($job['requested_note'] ?? ''));

        $blocks = $job['blocks'] ?? ['description', 'responsibilities', 'qualifications', 'additional', 'instructions', 'about'];
        $blocks = array_values(array_intersect(
            array_map('strval', (array) $blocks),
            ['description', 'responsibilities', 'qualifications', 'additional', 'instructions', 'about'],
        ));
        if ($blocks === []) {
            $blocks = ['description', 'responsibilities', 'qualifications', 'additional', 'instructions', 'about'];
        }
        $notes = isset($job['notes']) && is_array($job['notes']) ? $job['notes'] : [];
        $noteFor = function (string $key) use ($notes): string {
            $v = trim((string) ($notes[$key] ?? ''));
            return $v !== '' ? " Extra guidance: {$v}" : '';
        };

        $keys = implode(', ', $blocks);
        $lines = [
            'You are an HR copywriter for Oxford Suites Makati, a premier all-suite hotel in Makati\'s business district known for warm Filipino hospitality.',
            "Write a job-post draft for this role. Return ONLY a JSON object with exactly these keys: {$keys}.",
            '',
            'Role context:',
            '- Position: ' . ($job['position_title'] ?? 'Staff'),
            '- Department: ' . ($job['department'] ?? 'General'),
            '- Employment type: ' . ($job['employment_type'] ?? 'Full-time'),
            '- Schedule: ' . ($job['schedule'] ?? 'Shifting Schedule'),
            '- Vacancies: ' . ($job['vacancies'] ?? 1),
            '- Experience level: ' . ($this->levelLine($job['experience_levels'] ?? [], $job['experience_level'] ?? null) ?? 'Not specified'),
            '- Education level: ' . ($this->levelLine($job['education_levels'] ?? [], $job['education_level'] ?? null) ?? 'Not specified'),
        ];
        if ($requestedNote !== '') {
            $lines[] = '- Staffing request note: ' . $requestedNote;
        }
        if ($requiredSkills !== []) {
            $lines[] = '- Required skills for this post (reuse these exact terms where relevant): ' . implode('; ', $requiredSkills);
        }
        $lines[] = '';
        $lines[] = 'Screening vocabulary (terms the applicant-screening model recognizes):';
        $lines[] = '- SKILLS: ' . ($skills ? implode('; ', $skills) : '(none)');
        $lines[] = '- CERTIFICATIONS: ' . ($certs ? implode('; ', $certs) : '(none)');
        $lines[] = '';
        $lines[] = 'Rules:';
        if (in_array('description', $blocks, true)) {
            $lines[] = '1. description: 2-3 sentences pitching the role at Oxford Suites Makati.' . $noteFor('description');
        }
        if (in_array('responsibilities', $blocks, true)) {
            $lines[] = '2. responsibilities: 5-7 bullets, each under 120 characters, plain text, no numbering. Prefer the REQUIRED SKILLS wording where it fits naturally, otherwise SKILLS vocabulary.' . $noteFor('responsibilities');
        }
        if (in_array('qualifications', $blocks, true)) {
            $lines[] = '3. qualifications: 4-6 bullets; reuse the REQUIRED SKILLS terms verbatim where relevant and mention a CERTIFICATION from the list above when relevant (e.g. TESDA NC II, Food Handler).' . $noteFor('qualifications');
        }
        if (in_array('additional', $blocks, true)) {
            $lines[] = '4. additional: 3-5 bullets of perks / shift details / dress code — only promise what is standard for a Makati hotel posting, plain text, no numbering.' . $noteFor('additional');
        }
        if (in_array('instructions', $blocks, true)) {
            $lines[] = '5. instructions: 1-2 sentences telling applicants to send their updated resume through the posting or walk in at the HR Office, Oxford Suites Makati.' . $noteFor('instructions');
        }
        if (in_array('about', $blocks, true)) {
            $lines[] = '6. about: 1-2 sentences about Oxford Suites Makati as a premier all-suite hotel in Makati.' . $noteFor('about');
        }
        $lines[] = '7. Keep language professional, hotel-appropriate, Philippine English. No markdown, no numbering, no extra keys.';

        return implode("\n", $lines);
    }

    /**
     * Forces a string to well-formed UTF-8 with no illegal control bytes.
     *
     * Providers occasionally emit a stray byte sequence — a smart quote or dash
     * saved in Windows-1252, or a truncated multi-byte character. That breaks
     * two separate things downstream: json_decode rejects a raw control byte
     * with "Control character error", and JsonResponse's own json_encode throws
     * "Malformed UTF-8 characters" once the value is already decoded. Either one
     * turned an otherwise usable draft into a 500, so both are scrubbed here —
     * one bad character should never fail a whole generation.
     *
     * \t \n \r survive: they are legal JSON whitespace and meaningful content in
     * the decoded values.
     */
    protected function scrubUtf8(string $value): string
    {
        if ($value === '') {
            return $value;
        }

        if (! mb_check_encoding($value, 'UTF-8')) {
            // mb_scrub (PHP 8) replaces invalid sequences; the mb_convert_encoding
            // fallback covers older runtimes by re-interpreting the bytes as UTF-8.
            $value = function_exists('mb_scrub')
                ? mb_scrub($value, 'UTF-8')
                : (string) mb_convert_encoding($value, 'UTF-8', 'UTF-8');
        }

        // A half-decoded sequence can leave a lone control byte behind (the
        // trailing 0x09 of a cut-off 0xE2 0x80 0x09), so drop those explicitly.
        // preg_replace returns null on invalid UTF-8; the scrub above guarantees
        // valid input, and the ?? keeps a surprise from blanking the draft.
        return (string) (preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/u', '', $value) ?? $value);
    }

    /**
     * Scrubs model output that is still raw JSON text, before it is decoded.
     *
     * Same as scrubUtf8(), but \t \n \r also become spaces: they are fine as
     * JSON whitespace between tokens yet illegal *inside* a string, which is
     * where a truncated character leaves them. A space is valid in both places,
     * so pretty-printed JSON still parses and a stray control byte no longer
     * fails the whole payload.
     */
    protected function scrubJsonText(string $value): string
    {
        $clean = $this->scrubUtf8($value);
        if ($clean === '') {
            return $clean;
        }

        return str_replace(["\t", "\n", "\r"], ' ', $clean);
    }

    protected function parseJsonPayload(string $text): ?array
    {
        $clean = trim($this->scrubJsonText($text));
        // Strip ```json fences some models add despite responseMimeType.
        if (str_starts_with($clean, '```')) {
            $clean = (string) preg_replace('/^```(?:json)?\s*/i', '', $clean);
            $clean = (string) preg_replace('/\s*```$/', '', $clean);
        }

        $decoded = json_decode(trim($clean), true);

        return is_array($decoded) ? $decoded : null;
    }

    /** Normalizes model output into the builder's shape (arrays capped, strings trimmed). */
    protected function normalize(array $raw): array
    {
        $scrub = fn ($value) => $this->scrubUtf8((string) $value);

        $toList = function ($value, int $max) use ($scrub): array {
            if (is_string($value)) {
                $value = preg_split('/\r?\n/', $value) ?: [];
            }
            if (! is_array($value)) {
                return [];
            }
            $out = [];
            foreach ($value as $item) {
                $item = trim($scrub($item), " \t\n\r\0\x0B-•*1234567890.() ");
                if ($item !== '' && ! in_array($item, $out, true)) {
                    $out[] = mb_substr($item, 0, 280);
                }
                if (count($out) >= $max) {
                    break;
                }
            }

            return $out;
        };

        return [
            'description' => mb_substr(trim($scrub($raw['description'] ?? '')), 0, 1200),
            'responsibilities' => $toList($raw['responsibilities'] ?? [], 8),
            'qualifications' => $toList($raw['qualifications'] ?? [], 8),
            'skills' => $toList($raw['skills'] ?? [], 12),
            'additional' => $toList($raw['additional'] ?? [], 8),
            'instructions' => mb_substr(trim($scrub($raw['instructions'] ?? '')), 0, 600),
            'about' => mb_substr(trim($scrub($raw['about'] ?? '')), 0, 600),
        ];
    }
}
