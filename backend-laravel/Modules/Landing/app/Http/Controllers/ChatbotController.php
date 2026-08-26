<?php

namespace Modules\Landing\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\ChatbotEngine;
use Illuminate\Http\JsonResponse;
use Modules\Landing\Http\Requests\ChatMessageRequest;

class ChatbotController extends Controller
{
    public function chat(ChatMessageRequest $request, ChatbotEngine $engine): JsonResponse
    {
        $reply = $engine->respond(
            $request->string('message'),
            $request->filled('session_id') ? $request->string('session_id') : null,
            $request->filled('topic') ? $request->string('topic') : null,
        );

        return response()->json($reply);
    }
}