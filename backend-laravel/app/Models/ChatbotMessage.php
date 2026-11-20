<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * One chatbot exchange (user question + bot reply). Powers analytics,
 * answer citations and thumbs feedback without touching the transcript
 * history the frontend keeps in localStorage.
 */
class ChatbotMessage extends Model
{
    /** Pseudo-exchange rows logged for the "suggested new FAQ" queue. */
    public const SOURCE_UNANSWERED = 'unanswered';

    protected $fillable = [
        'session_id',
        'user_id',
        'role',
        'message',
        'reply',
        'source',
        'intent',
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

    /**
     * Real exchanges only — excludes rows logged for the unanswered queue so
     * analytics and transcripts keep their original counts and shape.
     */
    public function scopeRealConversations(Builder $query): Builder
    {
        return $query->where('source', '!=', self::SOURCE_UNANSWERED);
    }
}
