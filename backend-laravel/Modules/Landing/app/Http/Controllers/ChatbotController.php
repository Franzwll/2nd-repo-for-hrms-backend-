<?php

namespace Modules\Landing\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\ChatbotFaq;
use App\Models\ChatbotMessage;
use App\Models\JobPost;
use App\Models\SystemSetting;
use App\Services\ChatbotEngine;
use App\Services\GeminiChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Modules\Landing\Http\Requests\ChatMessageRequest;

class ChatbotController extends Controller
{
    public function chat(
        ChatMessageRequest $request,
        ChatbotEngine $engine,
        GeminiChatService $gemini
    ): JsonResponse {
        $message = (string) $request->string('message');
        $sessionId = $request->filled('session_id') ? (string) $request->string('session_id') : null;
        $topic = $request->filled('topic') ? (string) $request->string('topic') : null;

        // Role: explicit request role wins; else derive from the logged-in user.
        $role = (string) ($request->string('role') ?: 'guest');
        $user = $request->user();
        if ($user) {
            if (method_exists($user, 'isSuperAdmin') && $user->isSuperAdmin()) {
                $role = 'superadmin';
            } elseif (! empty($user->role)) {
                $role = strtolower((string) $user->role);
            } elseif ($role === 'guest') {
                $role = 'employee';
            }
        }
        if (! in_array($role, ['guest', 'applicant', 'employee', 'admin', 'superadmin'], true)) {
            $role = 'guest';
        }

        [$context, $contextFaqIds] = $this->buildContext($role, $message);
        $hadFaqContext = count($contextFaqIds) > 0;

        // Try real AI first (backend proxy keeps GEMINI_API_KEY server-side).
        // The circuit breaker drops to the rule engine after repeated failures.
        if ($gemini->configured() && $gemini->available()) {
            $history = collect($request->input('history', []))
                ->map(fn ($t) => ['role' => $t['role'] ?? 'user', 'text' => (string) ($t['text'] ?? '')])
                ->filter(fn ($t) => $t['text'] !== '')
                ->values()
                ->all();

            $result = $gemini->chat(GeminiChatService::systemPrompt($role, $context), $history, $message);

            if ($result['ok'] ?? false) {
                [$replyText, $sourceIds] = $this->extractSources($result['text']);
                $sources = $this->faqSources($sourceIds);

                $messageId = $this->persistExchange(
                    $request,
                    $role,
                    $sessionId,
                    $message,
                    $replyText,
                    'gemini',
                    $sourceIds ?: $contextFaqIds,
                    $hadFaqContext,
                );

                return response()->json([
                    'reply' => $replyText,
                    'quick_replies' => $this->quickReplies($role),
                    'topic' => $topic,
                    'source' => 'gemini',
                    'reduced' => false,
                    'message_id' => $messageId,
                    'sources' => $sources,
                ]);
            }
            // Fall through to the rule engine when Gemini is unavailable.
        }

        $reply = $engine->respond($message, $sessionId, $topic);
        $reply['source'] = 'fallback';
        $reply['reduced'] = true;
        $reply['message_id'] = $this->persistExchange(
            $request,
            $role,
            $sessionId,
            $message,
            (string) ($reply['reply'] ?? ''),
            'fallback',
            [],
            false,
        );
        $reply['sources'] = [];

        return response()->json($reply);
    }

    private function quickReplies(string $role): array
    {
        return match ($role) {
            'employee' => ['How do I file leave?', 'How do I request a promotion?', 'Where is my payslip?'],
            'admin', 'superadmin' => ['How do I approve a promotion?', 'How do I export a report?', 'How do requisitions work?'],
            default => ['What jobs are open?', 'How do I apply?', 'What documents do I need?'],
        };
    }

    /**
     * Live RAG context so Gemini answers from real data, not memory.
     * Public roles only see open posts + company info + enabled FAQs.
     *
     * @return array{0: string, 1: array<int, int>} context text + FAQ ids included
     */
    private function buildContext(string $role, string $message): array
    {
        $lines = [];
        $faqIds = [];

        $jobs = JobPost::query()
            ->with(['department', 'position'])
            ->whereIn('status', ['published', 'Open'])
            ->where('active', 1)
            ->whereRaw('COALESCE(vacancies, 1) - COALESCE(filled_count, 0) > 0')
            ->orderByDesc('posted_date')
            ->limit(15)
            ->get();

        if ($jobs->isNotEmpty()) {
            $lines[] = 'OPEN POSITIONS (only these exist — never invent others):';
            foreach ($jobs as $job) {
                $remaining = max(0, (int) ($job->vacancies ?? 1) - (int) ($job->filled_count ?? 0));
                $lines[] = sprintf(
                    '- %s (%s) — %s slots left, %s %s-%s/month. %s',
                    $job->title,
                    $job->department?->name ?? 'General',
                    $remaining,
                    $job->employment_type ?? '',
                    $job->salary_min ?? '?',
                    $job->salary_max ?? '?',
                    mb_substr((string) $job->summary, 0, 160)
                );
            }
        } else {
            $lines[] = 'No open positions right now.';
        }

        $settings = SystemSetting::whereIn('setting_key', [
            'company.name', 'company.address', 'company.phone', 'company.email', 'company.hours',
        ])->pluck('setting_value', 'setting_key');
        $decode = fn ($v) => json_decode((string) $v, true);
        $val = fn (string $k, $d) => $decode($settings[$k] ?? null)['value'] ?? $d;
        $lines[] = sprintf(
            'COMPANY: %s, %s, %s, %s, hours %s.',
            $val('company.name', 'Oxford Suites Makati'),
            $val('company.address', '528 P. Burgos Street, Makati City'),
            $val('company.phone', '+63 2 8888 8688'),
            $val('company.email', 'hr@oxfordsuites.com.ph'),
            $val('company.hours', '24 Hours')
        );

        // Keyword-matched FAQs as extra knowledge (top 5), tagged for citations.
        $words = array_filter(preg_split('/[^a-z0-9]+/', mb_strtolower($message)));
        if ($words) {
            $faqs = ChatbotFaq::where('enabled', 1)->limit(40)->get()
                ->map(function ($faq) use ($words) {
                    $hay = mb_strtolower($faq->question . ' ' . ($faq->keywords ?? ''));
                    $score = 0;
                    foreach ($words as $w) {
                        if (mb_strlen($w) > 2 && str_contains($hay, $w)) {
                            $score++;
                        }
                    }
                    return ['score' => $score, 'faq' => $faq];
                })
                ->filter(fn ($x) => $x['score'] > 0)
                ->sortByDesc('score')
                ->take(5);
            foreach ($faqs as $x) {
                $faqId = (int) $x['faq']->faq_id;
                $faqIds[] = $faqId;
                $lines[] = sprintf(
                    '[FAQ#%d] Q: %s A: %s',
                    $faqId,
                    $x['faq']->question,
                    mb_substr((string) $x['faq']->answer, 0, 400)
                );
            }
        }

        return [implode("\n", $lines), $faqIds];
    }

    /**
     * Pull the model's trailing "SOURCES: FAQ-1, FAQ-2" citation line out of
     * the reply and resolve it to the FAQ questions for the UI chips.
     *
     * @return array{0: string, 1: array<int, int>} clean reply + cited FAQ ids
     */
    private function extractSources(string $text): array
    {
        $reply = trim($text);
        $ids = [];

        if (preg_match('/SOURCES?:\s*([^\n]+)\s*$/i', $reply, $m)) {
            $reply = trim((string) preg_replace('/SOURCES?:\s*([^\n]+)\s*$/i', '', $reply));
            preg_match_all('/FAQ-(\d+)/i', $m[1], $idMatches);
            $ids = array_map('intval', array_unique($idMatches[1] ?? []));
        }

        return [$reply, $ids];
    }

    /** Resolve cited FAQ ids to {faq_id, question} pairs for the UI. */
    private function faqSources(array $ids): array
    {
        if ($ids === []) {
            return [];
        }

        try {
            return ChatbotFaq::whereIn('faq_id', $ids)
                ->get(['faq_id', 'question'])
                ->map(fn ($f) => ['faq_id' => (int) $f->faq_id, 'question' => $f->question])
                ->values()
                ->all();
        } catch (\Throwable $e) {
            return [];
        }
    }

    /**
     * Store the exchange for audit + analytics. Never breaks the chat if the
     * table is missing (e.g. migration not yet run) or the DB hiccups.
     */
    private function persistExchange(
        ChatMessageRequest $request,
        string $role,
        ?string $sessionId,
        string $message,
        string $reply,
        string $source,
        array $faqIds,
        bool $hadFaqContext
    ): ?int {
        try {
            $row = ChatbotMessage::create([
                'session_id' => $sessionId,
                'user_id' => $request->user()?->getAuthIdentifier(),
                'role' => $role,
                'message' => mb_substr($message, 0, 2000),
                'reply' => mb_substr($reply, 0, 4000),
                'source' => $source,
                'faq_ids' => array_slice(array_map('intval', $faqIds), 0, 10),
                'had_faq_context' => $hadFaqContext,
            ]);

            return $row?->id;
        } catch (\Throwable $e) {
            Log::warning('Chatbot exchange not persisted: ' . $e->getMessage());

            return null;
        }
    }
}