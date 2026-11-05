<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * Unmatched chatbot question kept in the review queue.
 *
 * The rows live in `chatbot_messages` with source = 'unanswered'; the global
 * scope hides normal exchanges so every existing query keeps its old meaning.
 */
class ChatbotUnanswered extends Model
{
    protected $table = 'chatbot_messages';

    protected $fillable = [
        'session_id',
        'message',
        'intent',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope(
            'unanswered',
            fn (Builder $query) => $query->where('source', ChatbotMessage::SOURCE_UNANSWERED),
        );

        static::creating(function (ChatbotUnanswered $row): void {
            $row->source = ChatbotMessage::SOURCE_UNANSWERED;
            $row->role = $row->role ?: 'guest';
            $row->reply = (string) ($row->reply ?? '');
        });
    }
}
