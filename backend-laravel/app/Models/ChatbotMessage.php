<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * One chatbot exchange (user question + bot reply). Powers analytics,
 * answer citations and thumbs feedback without touching the transcript
 * history the frontend keeps in localStorage.
 */
class ChatbotMessage extends Model
{
    protected $fillable = [
        'session_id',
        'user_id',
        'role',
        'message',
        'reply',
        'source',
        'faq_ids',
        'had_faq_context',
        'feedback',
        'prompt_tokens',
        'completion_tokens',
    ];

    protected $casts = [
        'faq_ids' => 'array',
        'had_faq_context' => 'boolean',
        'feedback' => 'integer',
        'prompt_tokens' => 'integer',
        'completion_tokens' => 'integer',
    ];
}
