<?php

namespace Modules\Landing\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\ChatbotFaq;
use App\Models\ChatbotMessage;
use App\Models\ChatbotUnanswered;
use App\Services\AuditLogger;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Modules\Landing\Http\Requests\StoreChatbotFaqRequest;
use Modules\Landing\Http\Requests\UpdateChatbotFaqRequest;
use Modules\Landing\Http\Resources\ChatbotFaqResource;

class ChatbotFaqController extends Controller
{
    private function ensureAdmin(): void
    {
        $roleId = (int) (request()->user()?->role_id ?? 0);

        abort_unless(in_array($roleId, [1, 2], true), 403, 'Only administrators can manage chatbot FAQs.');
    }

    public function index(): JsonResponse
    {
        $this->ensureAdmin();

        $faqs = ChatbotFaq::orderBy('sort_order')->orderBy('faq_id')->get();

        return response()->json([
            'data' => ChatbotFaqResource::collection($faqs),
        ]);
    }

    public function store(StoreChatbotFaqRequest $request): JsonResponse
    {
        $this->ensureAdmin();

        $faq = ChatbotFaq::create($request->validated());

        return response()->json([
            'message' => 'FAQ created successfully.',
            'data' => new ChatbotFaqResource($faq),
        ], 201);
    }

    public function update(UpdateChatbotFaqRequest $request, ChatbotFaq $faq): JsonResponse
    {
        $this->ensureAdmin();

        $faq->update($request->validated());

        return response()->json([
            'message' => 'FAQ updated successfully.',
            'data' => new ChatbotFaqResource($faq->fresh()),
        ]);
    }

    public function destroy(ChatbotFaq $faq): JsonResponse
    {
        $this->ensureAdmin();

        $question = $faq->question;
        $faq->delete();

        return response()->json(['message' => 'FAQ deleted successfully.']);
    }

    /* ------------------------------------------------------------------ */
    /* Analytics (Settings → Chatbot FAQ → Insights)                        */
    /* ------------------------------------------------------------------ */

    public function analytics(): JsonResponse
    {
        $this->ensureAdmin();

        try {
            $since30 = Carbon::now()->subDays(30);
            $trend = collect(range(13, 0))->map(function (int $i) {
                $day = Carbon::today()->subDays($i);

                return [
                    'date' => $day->format('Y-m-d'),
                    'conversations' => ChatbotMessage::whereDate('created_at', $day)
                        ->distinct('session_id')->count('session_id'),
                ];
            })->values();

            return response()->json([
                'data' => [
                    'conversations_today' => ChatbotMessage::whereDate('created_at', Carbon::today())
                        ->distinct('session_id')->count('session_id'),
                    'messages_today' => ChatbotMessage::whereDate('created_at', Carbon::today())->count(),
                    'gemini_messages_30d' => ChatbotMessage::where('source', 'gemini')
                        ->where('created_at', '>=', $since30)->count(),
                    'fallback_messages_30d' => ChatbotMessage::where('source', 'fallback')
                        ->where('created_at', '>=', $since30)->count(),
                    'feedback_up' => ChatbotMessage::where('feedback', 1)->count(),
                    'feedback_down' => ChatbotMessage::where('feedback', -1)->count(),
                    'gemini_tokens_month' => (int) Cache::get('gemini_tokens_' . now()->format('Ym'), 0),
                    'trend_14d' => $trend,
                ],
            ]);
        } catch (\Throwable $e) {
            // Table not migrated yet — return empty data instead of a 500.
            return response()->json(['data' => [
                'conversations_today' => 0,
                'messages_today' => 0,
                'gemini_messages_30d' => 0,
                'fallback_messages_30d' => 0,
                'feedback_up' => 0,
                'feedback_down' => 0,
                'gemini_tokens_month' => 0,
                'trend_14d' => [],
            ]]);
        }
    }

    /** Unmatched user questions — the "suggested new FAQ" queue. */
    public function unanswered(): JsonResponse
    {
        $this->ensureAdmin();

        try {
            $rows = ChatbotUnanswered::query()
                ->select('message', DB::raw('COUNT(*) as hits'), DB::raw('MAX(created_at) as last_at'))
                ->groupBy('message')
                ->orderByDesc('hits')
                ->limit(25)
                ->get()
                ->map(fn ($r) => [
                    'id' => md5((string) $r->message),
                    'message' => $r->message,
                    'hits' => (int) $r->hits,
                    'last_at' => $r->last_at,
                ]);

            return response()->json(['data' => $rows]);
        } catch (\Throwable $e) {
            return response()->json(['data' => []]);
        }
    }

    /** Remove one unanswered suggestion from the review queue. */
    public function dismissUnanswered(string $hash): JsonResponse
    {
        $this->ensureAdmin();

        try {
            ChatbotUnanswered::query()->get()
                ->first(fn ($r) => md5((string) $r->message) === $hash)
                ?->delete();
        } catch (\Throwable $e) {
            // Queue cleanup is best-effort.
        }

        return response()->json(['message' => 'Suggestion dismissed.']);
    }

    /** Thumbs up/down on a single bot answer (public — used by the landing widget). */
    public function feedback(Request $request, ChatbotMessage $message): JsonResponse
    {
        $value = (int) $request->input('value', 0);
        abort_unless(in_array($value, [1, -1, 0], true), 422, 'Invalid feedback value.');

        try {
            $message->update(['feedback' => $value === 0 ? null : $value]);
        } catch (\Throwable $e) {
            // Never fail the UX over a stored vote.
        }

        return response()->json(['message' => 'Feedback saved.']);
    }
}