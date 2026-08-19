<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chatbot_faqs', function (Blueprint $table) {
            $table->id('faq_id');
            $table->string('question', 255);
            $table->text('answer');
            $table->text('keywords')->nullable();
            $table->boolean('enabled')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });

        Schema::create('chatbot_unanswered', function (Blueprint $table) {
            $table->id();
            $table->string('session_id', 80)->nullable();
            $table->text('message');
            $table->string('intent', 40)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('session_id', 'idx_chatbot_unanswered_session_id');
            $table->index('created_at', 'idx_chatbot_unanswered_created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chatbot_unanswered');
        Schema::dropIfExists('chatbot_faqs');
    }
};