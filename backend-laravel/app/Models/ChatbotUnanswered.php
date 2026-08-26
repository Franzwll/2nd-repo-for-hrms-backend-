<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatbotUnanswered extends Model
{
    protected $table = 'chatbot_unanswered';

    public $timestamps = false;

    protected $fillable = [
        'session_id',
        'message',
        'intent',
    ];
}