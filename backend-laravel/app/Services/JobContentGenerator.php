<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Generates job-post draft content with a Google Generative Language model
 * (Gemini), grounded in the HR screening vocabulary.
 *
 * Resilience chain (first success wins):
 *   1. Google Gemini with GEMINI_API_KEY
 *   2. Google Gemini again with GEMINI_FALLBACK_API_KEY (and optionally
 *      GEMINI_FALLBACK_MODEL) — survives a dead/quota-hit primary key
 *   3. The same Gemini model family through OpenRouter with
 *      OPENROUTER_API_KEY / OPENROUTER_MODEL — survives a Google-side outage
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

    protected ?string $apiKey;

    protected string $model;

    protected ?string $fallbackModel;

    protected ?string $fallbackApiKey;

    protected ?string $openrouterKey;

    protected string $openrouterModel;

    protected int $timeout;

    protected int $maxAttempts = 3;

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
        'overloaded' => 45,
        'auth' => 3600,
        'model' => 3600,
        'request' => 300,
        'network' => 20,
    ];

    public function __construct()
    {
        $this->apiKey = config('services.gemini.key') ?: env('GEMINI_API_KEY') ?: null;
        $this->model = (string) (config('services.gemini.model') ?: env('GEMINI_MODEL', 'gemini-3.5-flash-lite'));
        $this->fallbackModel = config('services.gemini.fallback_model') ?: env('GEMINI_FALLBACK_MODEL') ?: null;
        $this->fallbackApiKey = config('services.gemini.fallback_key') ?: env('GEMINI_FALLBACK_API_KEY') ?: null;
        $this->openrouterKey = config('services.openrouter.key') ?: env('OPENROUTER_API_KEY') ?: null;
        $this->openrouterModel = (string) (config('services.openrouter.model') ?: env('OPENROUTER_MODEL', 'openrouter/free'));
        $this->timeout = (int) (config('services.gemini.timeout') ?: env('GEMINI_TIMEOUT', 30));
        $this->dailyLimit = max(0, (int) (config('services.job_ai.daily_limit') ?? env('JOB_AI_DAILY_LIMIT', 0)));
    }

    /**
     * Ordered provider attempts — duplicates (same service + model + key)
     * are collapsed so a half-configured server never calls twice.
     *
     * @return list<array{kind:string,model:string,key:string,label:string}>
     */
    protected function providers(): array
    {
        $chain = [];
        $seen = [];
        $add = function (string $kind, ?string $model, ?string $key, string $label) use (&$chain, &$seen) {
            if (! is_string($key) || trim($key) === '' || ! is_string($model) || trim($model) === '') {
                return;
            }
            $sig = $kind . '|' . trim($model) . '|' . substr(trim($key), -6);
            if (isset($seen[$sig])) {
                return;
            }
            $seen[$sig] = true;
            $chain[] = ['kind' => $kind, 'model' => trim($model), 'key' => trim($key), 'label' => $label];
        };

        $add('gemini', $this->model, $this->apiKey, 'Google Gemini');
        $add('gemini', $this->fallbackModel ?: $this->model, $this->fallbackApiKey ?: $this->apiKey, 'Google Gemini (second key)');
        $add('openrouter', $this->openrouterModel, $this->openrouterKey, 'OpenRouter');

        return $chain;
    }

    /** True when at least one provider key is configured (Gemini or OpenRouter). */
    public function isConfigured(): bool
    {
        return $this->providers() !== [];
    }

    /**
     * Primary model configured for this server — Gemini's when a Gemini key
     * exists, otherwise the OpenRouter model. Shown in the API meta and in the
     * builder's AI usage indicator.
     */
    public function modelName(): string
    {
        return $this->apiKey ? $this->model : $this->openrouterModel;
    }

    /**
     * @param  array{position_title:string,department?:string|null,employment_type?:string|null,schedule?:string|null,vacancies?:int|null,experience_level?:string|null,education_level?:string|null}  $job
     * @param  array{skills:string[],certifications:string[]}  $vocabulary
     * @return array{ok:bool,data:?array,error:?string,code?:string,retry_after_seconds?:?int,resets_at?:?string,usage?:array,via?:array}
     */
    public function generate(array $job, array $vocabulary): array
    {
        if (! $this->isConfigured()) {
            return $this->failure(
                'The AI generator is not configured. Set GEMINI_API_KEY (or OPENROUTER_API_KEY) on the API server.',
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

        // Walk the provider chain (Gemini key 1 → Gemini key 2 → OpenRouter);
        // first success wins. Each provider gets several attempts because
        // Google often answers 503/overloaded on the first try.
        $providers = $this->providers();
        if ($providers === []) {
            return $this->failure(
                'The AI generator is not configured. Set GEMINI_API_KEY (or OPENROUTER_API_KEY) on the API server.',
                'not_configured',
            );
        }

        $this->bump('attempt');

        $last = [
            'message' => 'Generation failed.',
            'code' => 'provider',
            'retry_after_seconds' => null,
            'resets_at' => null,
        ];

        foreach ($providers as $provider) {
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

            for ($attempt = 1; $attempt <= $this->maxAttempts; $attempt++) {
                try {
                    $response = $provider['kind'] === 'openrouter'
                        ? $this->postOpenRouter($provider, $prompt)
                        : $this->postGemini($provider, $prompt);
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
                    $this->backoff($attempt);
                    continue;
                }

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
                        $this->backoff($attempt);
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

                $this->backoff($attempt);
            }
        }

        return $this->failure($last['message'], $last['code'], $last['retry_after_seconds'], $last['resets_at']);
    }

    /** Single generateContent call against Google's API. */
    protected function postGemini(array $provider, string $prompt): \Illuminate\Http\Client\Response
    {
        $url = 'https://generativelanguage.googleapis.com/v1beta/models/'
            . $provider['model'] . ':generateContent?key=' . urlencode($provider['key']);

        return Http::timeout($this->timeout)
            ->acceptJson()
            ->post($url, [
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

    /** Single chat-completions call routed through OpenRouter. */
    protected function postOpenRouter(array $provider, string $prompt): \Illuminate\Http\Client\Response
    {
        return Http::timeout($this->timeout)
            ->acceptJson()
            ->withHeaders([
                'Authorization' => 'Bearer ' . $provider['key'],
                'HTTP-Referer' => (string) (config('app.url') ?: 'http://localhost'),
                'X-Title' => 'HRMS Job Post Builder',
            ])
            ->post('https://openrouter.ai/api/v1/chat/completions', [
                'model' => $provider['model'],
                'messages' => [
                    ['role' => 'user', 'content' => $prompt],
                ],
                'max_tokens' => 2048,
                'response_format' => ['type' => 'json_object'],
            ]);
    }

    /** Extracts the model text from either provider's success envelope. */
    protected function responseText(array $provider, \Illuminate\Http\Client\Response $response): string
    {
        if ($provider['kind'] === 'openrouter') {
            return (string) data_get($response->json(), 'choices.0.message.content', '');
        }

        return (string) data_get($response->json(), 'candidates.0.content.parts.0.text', '');
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
        $isOpenRouter = $provider['kind'] === 'openrouter';
        $keyHint = $isOpenRouter ? 'OPENROUTER_API_KEY' : 'GEMINI_API_KEY';
        $modelHint = $isOpenRouter ? 'OPENROUTER_MODEL' : 'GEMINI_MODEL';
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

        return match (true) {
            in_array($status, [500, 502, 503, 504], true) => $build($via . ' is temporarily overloaded (HTTP ' . $status . '). Nothing was saved — please retry in a moment.', 'overloaded', 45),
            in_array($status, [401, 403], true) => $build($via . ' rejected the API key (HTTP ' . $status . '). Ask an admin to check ' . $keyHint . ' on the API server.', 'auth', 3600),
            $status === 404 => $build('The configured AI model was not found (HTTP 404). Ask an admin to check ' . $modelHint . ' on the API server.', 'model', 3600),
            $status === 400 => $build('The AI request was rejected (HTTP 400). The configured model name may be invalid — ask an admin to check ' . $modelHint . ' on the API server.', 'request', 300),
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

            if ($blockedUntil === null || $block['resets_at'] > $blockedUntil) {
                $blockedUntil = $block['resets_at'];
                $blockedCode = $block['code'];
                $blockedReason = $block['message'];
            }
        }

        $used = $this->metric('success');
        $dailyLimit = $this->dailyLimit;
        $hardBlocked = $providers !== [] && ! $openProvider;

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
            // down — otherwise a fallback provider can still answer.
            'blocked_until' => $hardBlocked ? $blockedUntil : null,
            'blocked_code' => $hardBlocked ? $blockedCode : null,
            'blocked_reason' => $hardBlocked ? $blockedReason : null,
            'providers' => $providers,
            'last_success' => $this->cacheGet('job_ai_last_success'),
            'last_error' => $this->cacheGet('job_ai_last_error'),
        ];
    }

    /**
     * Vocab-preferred prompt: the model must reuse vocabulary terms verbatim
     * for skills (and certifications inside qualifications) and may introduce
     * at most 2 new terms when nothing fits.
     */
    protected function buildPrompt(array $job, array $vocabulary): string
    {
        $skills = array_values(array_unique(array_filter(array_map('trim', $vocabulary['skills'] ?? []))));
        $certs = array_values(array_unique(array_filter(array_map('trim', $vocabulary['certifications'] ?? []))));

        // Keep the prompt bounded: most hotel vocabularies fit, but cap anyway.
        $skills = array_slice($skills, 0, 150);
        $certs = array_slice($certs, 0, 60);

        $lines = [
            'You are an HR copywriter for Oxford Suites Makati, a premier all-suite hotel in Makati\'s business district known for warm Filipino hospitality.',
            'Write a job-post draft for this role. Return ONLY a JSON object with exactly these keys: description, responsibilities, qualifications, skills, instructions, about.',
            '',
            'Role context:',
            '- Position: ' . ($job['position_title'] ?? 'Staff'),
            '- Department: ' . ($job['department'] ?? 'General'),
            '- Employment type: ' . ($job['employment_type'] ?? 'Full-time'),
            '- Schedule: ' . ($job['schedule'] ?? 'Shifting Schedule'),
            '- Vacancies: ' . ($job['vacancies'] ?? 1),
            '- Experience level: ' . ($job['experience_level'] ?? 'Not specified'),
            '- Education level: ' . ($job['education_level'] ?? 'Not specified'),
            '',
            'Screening vocabulary (terms the applicant-screening model recognizes):',
            '- SKILLS: ' . ($skills ? implode('; ', $skills) : '(none)'),
            '- CERTIFICATIONS: ' . ($certs ? implode('; ', $certs) : '(none)'),
            '',
            'Rules:',
            '1. description: 2-3 sentences pitching the role at Oxford Suites Makati.',
            '2. responsibilities: 5-7 bullets, each under 120 characters, plain text, no numbering.',
            '3. qualifications: 4-6 bullets; mention a CERTIFICATION from the list above when relevant (e.g. TESDA NC II, Food Handler).',
            '4. skills: 6-10 items; PREFER the SKILLS vocabulary verbatim (exact spelling). You may add at most 2 new terms only when nothing in the list fits.',
            '5. instructions: 1-2 sentences telling applicants to send their updated resume through the posting or walk in at the HR Office, Oxford Suites Makati.',
            '6. about: 1-2 sentences about Oxford Suites Makati as a premier all-suite hotel in Makati.',
            '7. Keep language professional, hotel-appropriate, Philippine English. No markdown, no numbering, no extra keys.',
        ];

        return implode("\n", $lines);
    }

    protected function parseJsonPayload(string $text): ?array
    {
        $clean = trim($text);
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
        $toList = function ($value, int $max): array {
            if (is_string($value)) {
                $value = preg_split('/\r?\n/', $value) ?: [];
            }
            if (! is_array($value)) {
                return [];
            }
            $out = [];
            foreach ($value as $item) {
                $item = trim((string) $item, " \t\n\r\0\x0B-•*1234567890.() ");
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
            'description' => mb_substr(trim((string) ($raw['description'] ?? '')), 0, 1200),
            'responsibilities' => $toList($raw['responsibilities'] ?? [], 8),
            'qualifications' => $toList($raw['qualifications'] ?? [], 8),
            'skills' => $toList($raw['skills'] ?? [], 12),
            'instructions' => mb_substr(trim((string) ($raw['instructions'] ?? '')), 0, 600),
            'about' => mb_substr(trim((string) ($raw['about'] ?? '')), 0, 600),
        ];
    }
}
