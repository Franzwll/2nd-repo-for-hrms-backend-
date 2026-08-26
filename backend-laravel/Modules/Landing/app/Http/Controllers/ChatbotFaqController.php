<?php

namespace Modules\Landing\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\ChatbotFaq;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
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
}