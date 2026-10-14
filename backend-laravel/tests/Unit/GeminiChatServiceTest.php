<?php

namespace Tests\Unit;

use App\Services\GeminiChatService;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

/**
 * Locks in the Landing + ESS chat chain: Groq first, OpenRouter second,
 * shared Gemini last. Both chat surfaces share POST /api/v1/landing/chat,
 * so one chain covers them.
 */
class GeminiChatServiceTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Cache::flush();

        config([
            'services.chat_groq.key' => 'chat-groq-key',
            'services.chat_groq.model' => 'openai/gpt-oss-20b',
            'services.chat_openrouter.key' => 'chat-openrouter-key',
            'services.chat_openrouter.model' => 'nvidia/nemotron-3-super-120b-a12b:free',
            'services.gemini.key' => 'shared-gemini-key',
            'services.gemini.model' => 'gemini-3.5-flash-lite',
            'services.gemini.fallback_key' => null,
            'services.gemini.fallback_model' => null,
        ]);
    }

    public function test_it_orders_groq_before_openrouter_before_gemini(): void
    {
        $service = new GeminiChatService();

        $this->assertTrue($service->configured());
        $this->assertTrue($service->available());
        $this->assertSame(
            ['groq', 'openrouter', 'gemini'],
            array_column($service->providers(), 'kind'),
        );
    }

    public function test_it_reports_not_configured_without_any_key(): void
    {
        config([
            'services.chat_groq.key' => null,
            'services.chat_openrouter.key' => null,
            'services.gemini.key' => null,
            'services.gemini.fallback_key' => null,
        ]);

        $service = new GeminiChatService();

        $this->assertFalse($service->configured());
        $this->assertSame(
            ['ok' => false, 'error' => 'Chat AI is not configured. Set CHAT_GROQ_API_KEY (or a fallback key) on the API server.'],
            $service->chat('system', [], 'hello'),
        );
    }
}
