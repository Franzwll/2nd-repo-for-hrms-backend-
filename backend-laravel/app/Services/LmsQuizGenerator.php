<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Generates a Tier-1 LMS quiz (10 items, 4 options each) grounded strictly in
 * one handbook's extracted text.
 *
 * Resilience chain (first success wins) - the SAME shared chain the AI chat and
 * the Job Post Builder already use, so Tier-1 needs no new keys:
 *   1. Groq            (CHAT_GROQ_API_KEY / CHAT_GROQ_MODEL)
 *   2. OpenRouter      (CHAT_OPENROUTER_API_KEY / CHAT_OPENROUTER_MODEL)
 *   3. Google Gemini   (GEMINI_API_KEY / GEMINI_MODEL, + optional fallback key)
 *
 * If every provider fails (or returns unparseable JSON), we build a
 * deterministic cloze bank from the handbook text (fallbackQuestions()) so a
 * course is never left without a quiz.
 *
 * SECURITY: the answer key (correct_index + explanation) is persisted
 * server-side only - learning_courses.quiz_json - and is never part of a GET
 * response. EssPortalController::learningQuiz() strips it before serving.
 *
 * Modeled on JobContentGenerator (provider chain + parseJsonPayload +
 * provider cool-downs) rather than extracted into a shared trait, to keep the
 * Tier-1 surface small and easy to revert.
 */
class LmsQuizGenerator
{
    /** Failure codes that mean "the AI usage/limit is used up". */
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

    /** HTTP statuses worth retrying (rate-limit / transient provider-side failures). */
    protected array $retryableStatuses = [429, 500, 502, 503, 504];

    /** How long a provider is skipped after a failure, per failure code (seconds). */
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

    /** Short stop-word list so a cloze fallback blanks meaningful terms only. */
    protected array $stopwords = [
        'about', 'above', 'after', 'again', 'against', 'along', 'among', 'around', 'because',
        'before', 'being', 'below', 'between', 'could', 'during', 'every', 'further', 'having',
        'here', 'into', 'itself', 'more', 'most', 'much', 'must', 'other', 'others', 'over',
        'same', 'should', 'some', 'such', 'than', 'that', 'their', 'them', 'then', 'there',
        'these', 'they', 'this', 'those', 'through', 'under', 'until', 'very', 'were', 'what',
        'when', 'where', 'which', 'while', 'with', 'within', 'without', 'would', 'your',
        'yours', 'from', 'have', 'has', 'been', 'will', 'shall', 'may', 'might', 'also',
        'only', 'just', 'each', 'both', 'does', 'doing', 'done', 'make', 'made', 'many',
        'well', 'using', 'used', 'use', 'any', 'all', 'are', 'and', 'the', 'for', 'not',
        'you', 'our', 'out', 'can', 'its', 'was', 'his', 'her', 'him', 'she', 'who', 'why',
        'how', 'per', 'etc', 'upon', 'onto', 'off', 'too', 'must', 'them', 'then',
    ];

    public function __construct()
    {
        // Reuse the shared chat chain keys; no dedicated LMS_* keys for Tier-1.
        $this->groqKey = config('services.chat_groq.key') ?: env('CHAT_GROQ_API_KEY') ?: null;
        $this->groqModel = (string) (config('services.chat_groq.model') ?: env('CHAT_GROQ_MODEL', 'openai/gpt-oss-20b'));
        $this->openrouterKey = config('services.chat_openrouter.key') ?: env('CHAT_OPENROUTER_API_KEY') ?: config('services.openrouter.key') ?: env('OPENROUTER_API_KEY') ?: null;
        $this->openrouterModel = (string) (config('services.chat_openrouter.model') ?: env('CHAT_OPENROUTER_MODEL', env('OPENROUTER_MODEL', 'nvidia/nemotron-3-super-120b-a12b:free')));
        $this->apiKey = config('services.gemini.key') ?: env('GEMINI_API_KEY') ?: null;
        $this->model = (string) (config('services.gemini.model') ?: env('GEMINI_MODEL', 'gemini-3.5-flash-lite'));
        $this->fallbackModel = config('services.gemini.fallback_model') ?: env('GEMINI_FALLBACK_MODEL') ?: null;
        $this->fallbackApiKey = config('services.gemini.fallback_key') ?: env('GEMINI_FALLBACK_API_KEY') ?: null;
        $this->timeout = (int) (config('services.gemini.timeout') ?: env('GEMINI_TIMEOUT', 45));
    }

    /**
     * Ordered provider attempts - duplicates (same service + model + key) are
     * collapsed so a half-configured server never calls twice.
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

        $add('groq', $this->groqModel, $this->groqKey, 'Groq');
        $add('openrouter', $this->openrouterModel, $this->openrouterKey, 'OpenRouter');
        $add('gemini', $this->model, $this->apiKey, 'Google Gemini');
        $add('gemini', $this->fallbackModel ?: $this->model, $this->fallbackApiKey ?: $this->apiKey, 'Google Gemini (second key)');

        return $chain;
    }

    /** True when at least one provider key is configured (Groq, OpenRouter or Gemini). */
    public function isConfigured(): bool
    {
        return $this->providers() !== [];
    }

    /** Primary model configured for this server (shown in the API meta). */
    public function modelName(): string
    {
        if ($this->groqKey) {
            return $this->groqModel;
        }

        return $this->openrouterKey ? $this->openrouterModel : $this->model;
    }

    /**
     * Generate a quiz grounded in $sourceText.
     *
     * @return array{ok:bool,questions?:list<array{id:int,question:string,options:list<string>,correct_index:int,explanation:string}>,generated_by?:string,via?:array,error?:string,code?:string}
     */
    public function generate(string $title, ?string $category, string $sourceText, int $count = 10): array
    {
        $count = max(1, min($count, 20));
        $sourceText = trim($sourceText);

        if ($this->isConfigured() && $sourceText !== '') {
            $prompt = $this->buildPrompt($title, $category, $sourceText, $count);

            foreach ($this->providers() as $provider) {
                if ($this->providerBlock($provider) !== null) {
                    continue;
                }

                for ($attempt = 1; $attempt <= $this->maxAttempts; $attempt++) {
                    try {
                        $response = match ($provider['kind']) {
                            'groq' => $this->postGroq($provider, $prompt),
                            'openrouter' => $this->postOpenRouter($provider, $prompt),
                            default => $this->postGemini($provider, $prompt),
                        };
                    } catch (\Throwable $e) {
                        Log::warning('LMS quiz generation connection error', [
                            'via' => $provider['label'],
                            'model' => $provider['model'],
                            'attempt' => $attempt,
                            'error' => $e->getMessage(),
                        ]);
                        $this->backoff($attempt);
                        continue;
                    }

                    if ($response->successful()) {
                        $parsed = $this->parseJsonPayload($this->responseText($provider, $response));
                        $questions = $parsed ? $this->normalizeQuestions($parsed, $count) : [];

                        // Accept a partial (but usable) set rather than discarding
                        // good AI output for a couple of missing items.
                        if (count($questions) >= max(3, (int) ceil($count * 0.5))) {
                            $this->recordSuccess($provider);

                            return [
                                'ok' => true,
                                'questions' => $this->withIds($questions),
                                'generated_by' => $provider['kind'],
                                'via' => ['service' => $provider['label'], 'model' => $provider['model']],
                            ];
                        }

                        $this->backoff($attempt);
                        continue;
                    }

                    $failure = $this->classifyFailure($response->status(), $response->body(), $provider);

                    Log::warning('LMS quiz generation failed', [
                        'via' => $provider['label'],
                        'model' => $provider['model'],
                        'attempt' => $attempt,
                        'status' => $response->status(),
                        'code' => $failure['code'],
                        'body' => Str::limit($response->body(), 500),
                    ]);

                    // Permanent failure (bad key / unknown model / bad request) or a
                    // used-up limit: cool the provider down and try the next one.
                    if (! in_array($response->status(), $this->retryableStatuses, true)
                        || in_array($failure['code'], self::LIMIT_CODES, true)) {
                        $this->blockProvider($provider, $failure);
                        break;
                    }

                    $this->backoff($attempt);
                }
            }
        }

        // Deterministic fallback: a cloze bank built from the handbook text.
        $fallback = $this->fallbackQuestions($sourceText, $count);
        if (count($fallback) >= 3) {
            return [
                'ok' => true,
                'questions' => $this->withIds($fallback),
                'generated_by' => 'fallback',
                'via' => ['service' => 'Deterministic fallback', 'model' => 'cloze'],
            ];
        }

        return [
            'ok' => false,
            'error' => 'The AI service is unavailable and the handbook text was not usable to build a fallback quiz.',
            'code' => 'ai_unavailable',
        ];
    }

    /**
     * Deterministic cloze bank: blank a meaningful term in a sentence and offer
     * three distractor terms drawn from the same handbook. Used when the AI
     * chain is unavailable so a course is never left quiz-less.
     *
     * @return list<array{question:string,options:list<string>,correct_index:int,explanation:string}>
     */
    protected function fallbackQuestions(string $sourceText, int $count): array
    {
        $text = trim($sourceText);
        if ($text === '') {
            return [];
        }

        // Handbooks are Markdown with hard-wrapped lines, so first re-join each
        // line that is a continuation of the previous one (no sentence
        // terminator, and not itself the start of a heading/bullet block).
        // Without this, a sentence split across two source lines leaks a
        // mid-sentence fragment ("... it is ________'s job").
        $lines = preg_split('/\r\n|\r|\n/', $text) ?: [];
        $joined = [];
        $previous = '';
        foreach ($lines as $line) {
            $trimmed = trim($line);
            if ($trimmed === '') {
                if ($previous !== '') {
                    $joined[] = $previous;
                    $previous = '';
                }
                continue;
            }

            $startsBlock = preg_match('/^(?:#{1,6}\s*|[-*]\s+|\d+[.)]\s+)/u', $trimmed) === 1;
            $continues = $previous !== ''
                && ! $startsBlock
                && preg_match('/[.!?]["\')\]]?\s*$/', $previous) !== 1;

            if ($continues) {
                $previous .= ' ' . $trimmed;
            } else {
                if ($previous !== '') {
                    $joined[] = $previous;
                }
                $previous = $trimmed;
            }
        }
        if ($previous !== '') {
            $joined[] = $previous;
        }

        // Split each block into sentences. Heading lines are used for vocabulary
        // (below) but never become question sentences, and list markers are
        // stripped so the blank reads cleanly.
        $sentences = [];
        foreach ($joined as $block) {
            if (preg_match('/^#{1,6}\s*/', $block) === 1) {
                continue;
            }
            $clean = (string) preg_replace('/^(?:#{1,6}\s*|[-*]\s+|\d+[.)]\s+)/u', '', $block);
            $clean = trim(preg_replace('/\s+/', ' ', $clean) ?? '');
            if ($clean === '') {
                continue;
            }
            foreach (preg_split('/(?<=[.!?])\s+/', $clean) ?: [] as $piece) {
                $piece = trim($piece);
                if (mb_strlen($piece) >= 40 && mb_strlen($piece) <= 320) {
                    $sentences[] = $piece;
                }
            }
        }

        // Frequency-ranked candidate terms across the whole handbook.
        $tokens = preg_split('/[^A-Za-z0-9\-\/]+/', Str::lower($text)) ?: [];
        $freq = [];
        foreach ($tokens as $token) {
            if (mb_strlen($token) < 5 || is_numeric($token) || in_array($token, $this->stopwords, true)) {
                continue;
            }
            $freq[$token] = ($freq[$token] ?? 0) + 1;
        }
        arsort($freq);
        $vocab = array_slice(array_keys($freq), 0, 120);
        if (count($vocab) < 4) {
            return [];
        }

        // Preferred display form per term, so acronyms/proper nouns survive
        // lower-casing (e.g. "HACCP", "Oxford").
        $displayForms = [];
        if (preg_match_all('/[A-Za-z][A-Za-z0-9\-\/]{4,}/', $text, $matches) > 0) {
            foreach ($matches[0] as $raw) {
                $lower = Str::lower($raw);
                if (! isset($displayForms[$lower])) {
                    $displayForms[$lower] = $raw;
                } elseif (strtoupper($raw) === $raw) {
                    $displayForms[$lower] = $raw; // prefer an all-caps (acronym) form
                }
            }
        }

        $questions = [];
        $usedTerms = [];

        foreach ($sentences as $sentence) {
            if (count($questions) >= $count) {
                break;
            }

            $sentenceLower = Str::lower($sentence);

            // Pick an unused vocabulary term that actually appears in this sentence.
            $term = null;
            foreach ($vocab as $candidate) {
                if (isset($usedTerms[$candidate])) {
                    continue;
                }
                if (preg_match('/\b' . preg_quote($candidate, '/') . '\b/i', $sentenceLower) === 1) {
                    $term = $candidate;
                    break;
                }
            }
            if ($term === null) {
                continue;
            }

            $answer = $this->matchCase($sentence, $term);

            // Distractors: other frequent terms absent from this sentence, then
            // cased to match the answer so capitalisation is not a giveaway.
            $answerCapitalised = preg_match('/^[A-Z]/', $answer) === 1;
            $decorate = function (string $word) use ($displayForms, $answerCapitalised): string {
                $word = $displayForms[$word] ?? $word;
                if (mb_strlen($word) > 1 && strtoupper($word) === $word) {
                    return $word; // acronym: keep as-is
                }

                return $answerCapitalised ? ucfirst($word) : lcfirst($word);
            };

            $distractors = [];
            foreach ($vocab as $candidate) {
                if ($candidate === $term || in_array($candidate, $usedTerms, true)) {
                    continue;
                }
                if (preg_match('/\b' . preg_quote($candidate, '/') . '\b/i', $sentenceLower) === 1) {
                    continue;
                }
                $distractors[] = $candidate;
                if (count($distractors) >= 12) {
                    break;
                }
            }
            if (count($distractors) < 3) {
                continue;
            }

            $options = array_merge([$answer], array_map($decorate, array_slice($distractors, 0, 3)));
            // Deterministic shuffle so the same handbook always yields the same
            // bank (per-attempt shuffle happens at serve time in Phase 4).
            $options = $this->seededShuffle($options, (int) crc32($term . '|' . $sentence));
            $correctIndex = array_search($answer, $options, true);

            $blanked = (string) preg_replace(
                '/\b' . preg_quote($answer, '/') . '\b/i',
                '________',
                $sentence,
                1,
            );

            $questions[] = [
                'question' => 'Fill in the blank: ' . $blanked,
                'options' => array_values($options),
                'correct_index' => $correctIndex === false ? 0 : (int) $correctIndex,
                'explanation' => 'The handbook states: "' . Str::limit($sentence, 200) . '"',
            ];
            $usedTerms[$term] = true;
        }

        return $questions;
    }

    /** Assign stable 1-based ids (the shape stored in learning_courses.quiz_json). */
    protected function withIds(array $questions): array
    {
        $out = [];
        foreach (array_values($questions) as $index => $question) {
            $out[] = [
                'id' => $index + 1,
                'question' => $question['question'],
                'options' => $question['options'],
                'correct_index' => $question['correct_index'],
                'explanation' => $question['explanation'],
            ];
        }

        return $out;
    }

    /**
     * Validates + trims model output into the stored question shape. Items with
     * a missing question, not exactly 4 options, or an out-of-range
     * correct_index are dropped rather than trusted.
     *
     * @return list<array{question:string,options:list<string>,correct_index:int,explanation:string}>
     */
    protected function normalizeQuestions(array $raw, int $count): array
    {
        $items = $raw['questions'] ?? $raw;
        if (! is_array($items)) {
            return [];
        }

        $out = [];
        $seen = [];
        foreach ($items as $item) {
            if (! is_array($item)) {
                continue;
            }

            $question = trim((string) ($item['question'] ?? ''));
            $options = $item['options'] ?? [];
            if (is_string($options)) {
                $options = preg_split('/\r?\n/', $options) ?: [];
            }
            if (! is_array($options)) {
                continue;
            }

            $options = array_values(array_filter(
                array_map(fn ($o) => trim((string) $o), $options),
                fn ($o) => $o !== '',
            ));
            $options = array_slice($options, 0, 4);

            $correct = (int) ($item['correct_index'] ?? -1);

            if ($question === '' || count($options) !== 4 || $correct < 0 || $correct > 3) {
                continue;
            }

            $key = Str::lower($question);
            if (isset($seen[$key])) {
                continue;
            }
            $seen[$key] = true;

            $out[] = [
                'question' => mb_substr($question, 0, 500),
                'options' => array_map(fn ($o) => mb_substr($o, 0, 240), $options),
                'correct_index' => $correct,
                'explanation' => mb_substr(trim((string) ($item['explanation'] ?? '')), 0, 300),
            ];

            if (count($out) >= $count) {
                break;
            }
        }

        return $out;
    }

    /** Grounded prompt: every item must come from the handbook text, no outside knowledge. */
    protected function buildPrompt(string $title, ?string $category, string $sourceText, int $count): string
    {
        // Bound the prompt so long handbooks do not blow the token budget.
        $excerpt = mb_substr($sourceText, 0, 12000);

        return implode("\n", [
            'You are an instructional designer for Oxford Suites Makati, a premier all-suite hotel in Makati.',
            'Create a ' . $count . '-item multiple-choice quiz for the learning module "' . $title . '"'
                . ($category ? ' (category: ' . $category . ')' : '') . '.',
            '',
            'Return ONLY a JSON object with this exact shape:',
            '{"questions":[{"question":"...","options":["...","...","...","..."],"correct_index":0,"explanation":"..."}]}',
            '',
            'Rules:',
            '1. Exactly ' . $count . ' questions.',
            '2. Each question has exactly 4 options; exactly one is correct.',
            '3. correct_index is the 0-based index of the correct option.',
            '4. Ground EVERY question and answer strictly in the handbook text below. Do not use outside knowledge and do not invent facts.',
            '5. explanation: one short sentence (max 200 characters) saying why the answer is correct.',
            '6. Keep each question self-contained and unambiguous; never use "all of the above" or "none of the above".',
            '7. Professional Philippine English. No markdown, no numbering, no extra keys.',
            '',
            'HANDBOOK TEXT:',
            '"""',
            $excerpt,
            '"""',
        ]);
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
                'generationConfig' => [
                    'maxOutputTokens' => 4096,
                    'responseMimeType' => 'application/json',
                ],
            ]);
    }

    /** Single chat-completions call routed through Groq. */
    protected function postGroq(array $provider, string $prompt): \Illuminate\Http\Client\Response
    {
        return Http::timeout($this->timeout)
            ->acceptJson()
            ->withHeaders([
                'Authorization' => 'Bearer ' . $provider['key'],
            ])
            ->post('https://api.groq.com/openai/v1/chat/completions', [
                'model' => $provider['model'],
                'messages' => [
                    ['role' => 'user', 'content' => $prompt],
                ],
                'max_tokens' => 4096,
                'response_format' => ['type' => 'json_object'],
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
                'X-Title' => 'HRMS ESS Learning',
            ])
            ->post('https://openrouter.ai/api/v1/chat/completions', [
                'model' => $provider['model'],
                'messages' => [
                    ['role' => 'user', 'content' => $prompt],
                ],
                'max_tokens' => 4096,
                'response_format' => ['type' => 'json_object'],
            ]);
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
     * Turn a provider HTTP failure into a machine-readable code + explanation.
     *
     * @return array{message:string,code:string,retry_after_seconds:?int,resets_at:?string}
     */
    protected function classifyFailure(int $status, string $body, array $provider): array
    {
        $via = $provider['label'];
        $keyHint = match ($provider['kind']) {
            'groq' => 'CHAT_GROQ_API_KEY',
            'openrouter' => 'CHAT_OPENROUTER_API_KEY',
            default => 'GEMINI_API_KEY',
        };
        $modelHint = match ($provider['kind']) {
            'groq' => 'CHAT_GROQ_MODEL',
            'openrouter' => 'CHAT_OPENROUTER_MODEL',
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

        if ($status === 429 || $status === 402) {
            $isDaily = preg_match('/per[\s_-]?day|daily|free[\s_-]?tier/i', $haystack) === 1;

            return $build(
                $via . ' usage limit reached (HTTP ' . $status . ').',
                $isDaily ? 'quota_day' : 'rate_minute',
                $isDaily ? 1800 : 60,
            );
        }

        return match (true) {
            in_array($status, [500, 502, 503, 504], true) => $build($via . ' is temporarily overloaded (HTTP ' . $status . ').', 'overloaded', 45),
            in_array($status, [401, 403], true) => $build($via . ' rejected the API key (HTTP ' . $status . '). Check ' . $keyHint . '.', 'auth', 3600),
            $status === 404 => $build('The configured AI model was not found (HTTP 404). Check ' . $modelHint . '.', 'model', 3600),
            $status === 400 => $build('The AI request was rejected (HTTP 400). Check ' . $modelHint . '.', 'request', 300),
            default => $build($via . ' could not generate a quiz (HTTP ' . $status . ').', 'provider'),
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

    /** Linear backoff between attempts (1s, 2s, 3s ... capped at 5s). */
    protected function backoff(int $attempt): void
    {
        usleep(min($attempt, 5) * 1000 * 1000);
    }

    /** Stable cache tag for one provider/credential (never stores the raw key). */
    protected function providerTag(array $provider): string
    {
        return substr(md5($provider['kind'] . '|' . $provider['model'] . '|' . $provider['key']), 0, 20);
    }

    /**
     * Current cool-down for a provider, or null when it may be called.
     *
     * @return array{message:string,code:string,retry_after_seconds:int,resets_at:string}|null
     */
    protected function providerBlock(array $provider): ?array
    {
        try {
            $block = Cache::get('lms_ai_block_' . $this->providerTag($provider));
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
            Cache::put('lms_ai_block_' . $this->providerTag($provider), [
                'until' => time() + $seconds,
                'code' => $code,
                'message' => (string) ($failure['message'] ?? ''),
            ], now()->addSeconds($seconds + 60));
        } catch (\Throwable) {
            // Cool-downs are best-effort - never block a generation.
        }
    }

    /** Remember which provider answered last (shown in the API meta). */
    protected function recordSuccess(array $provider): void
    {
        try {
            Cache::put('lms_ai_last_success', [
                'service' => $provider['label'],
                'model' => $provider['model'],
                'at' => now()->toIso8601String(),
            ], now()->addDays(2));
        } catch (\Throwable) {
            // ignore
        }
    }

    /** Strips ```json fences some models add despite responseMimeType. */
    protected function parseJsonPayload(?string $text): ?array
    {
        $clean = trim((string) $text);
        if ($clean === '') {
            return null;
        }

        if (str_starts_with($clean, '```')) {
            $clean = (string) preg_replace('/^```(?:json)?\s*/i', '', $clean);
            $clean = (string) preg_replace('/\s*```$/', '', $clean);
        }

        $decoded = json_decode(trim($clean), true);
        if (is_array($decoded)) {
            return $decoded;
        }

        // Salvage the first {...} object when the model wrapped it in prose.
        if (preg_match('/\{.*\}/s', $clean, $m) === 1) {
            $decoded = json_decode($m[0], true);
            if (is_array($decoded)) {
                return $decoded;
            }
        }

        return null;
    }

    /** Return $needle as it appears in $haystack so the blank keeps its case. */
    protected function matchCase(string $haystack, string $needle): string
    {
        if (preg_match('/\b(' . preg_quote($needle, '/') . ')\b/i', $haystack, $m) === 1) {
            return $m[1];
        }

        return $needle;
    }

    /** Deterministic Fisher-Yates shuffle (seeded) so the fallback bank is stable. */
    protected function seededShuffle(array $items, int $seed): array
    {
        mt_srand($seed);
        for ($i = count($items) - 1; $i > 0; $i--) {
            $j = mt_rand(0, $i);
            [$items[$i], $items[$j]] = [$items[$j], $items[$i]];
        }
        mt_srand(); // re-seed with entropy so we do not affect other randomness

        return $items;
    }
}
