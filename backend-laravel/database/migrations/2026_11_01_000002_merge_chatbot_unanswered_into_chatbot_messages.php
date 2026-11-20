<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * DB consolidation – Phase 2b.
     *
     * `chatbot_unanswered` only stored the question side of an exchange.
     * Unanswered questions now live in `chatbot_messages` with
     * `source = 'unanswered'`, so the chatbot has one audit table.
     *
     * Analytics and transcript endpoints must ignore those rows; they are
     * filtered by ChatbotMessage::realConversations().
     */
    public function up(): void
    {
        if (! Schema::hasTable('chatbot_messages')) {
            return;
        }

        if (! Schema::hasColumn('chatbot_messages', 'intent')) {
            Schema::table('chatbot_messages', function (Blueprint $table) {
                $table->string('intent', 40)->nullable()->after('source');
            });
        }

        if (! Schema::hasTable('chatbot_unanswered')) {
            return;
        }

        $sourceCount = DB::table('chatbot_unanswered')->count();
        $before = DB::table('chatbot_messages')->count();

        DB::table('chatbot_unanswered')->orderBy('id')->chunkById(500, function ($rows) {
            $insert = [];

            foreach ($rows as $row) {
                $createdAt = $row->created_at ?? now();

                $insert[] = [
                    'session_id' => $row->session_id,
                    'user_id' => null,
                    'role' => 'guest',
                    'message' => $row->message,
                    'reply' => '',
                    'source' => 'unanswered',
                    'intent' => $row->intent,
                    'faq_ids' => null,
                    'had_faq_context' => false,
                    'feedback' => null,
                    'prompt_tokens' => 0,
                    'completion_tokens' => 0,
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ];
            }

            if ($insert !== []) {
                DB::table('chatbot_messages')->insert($insert);
            }
        });

        $copied = DB::table('chatbot_messages')->count() - $before;

        if ($copied !== $sourceCount) {
            throw new RuntimeException(
                "Phase 2b copy failed: expected {$sourceCount} unanswered rows, copied {$copied}. chatbot_unanswered was not dropped."
            );
        }

        Schema::dropIfExists('chatbot_unanswered');
    }

    /**
     * Restores chatbot_unanswered and removes the merged rows / intent column.
     */
    public function down(): void
    {
        if (! Schema::hasTable('chatbot_messages')) {
            return;
        }

        if (! Schema::hasTable('chatbot_unanswered')) {
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

        $merged = DB::table('chatbot_messages')->where('source', 'unanswered')->count();
        $before = DB::table('chatbot_unanswered')->count();

        DB::table('chatbot_messages')
            ->where('source', 'unanswered')
            ->orderBy('id')
            ->chunkById(500, function ($rows) {
                $insert = [];

                foreach ($rows as $row) {
                    $insert[] = [
                        'session_id' => $row->session_id,
                        'message' => $row->message,
                        'intent' => $row->intent ?? null,
                        'created_at' => $row->created_at ?? now(),
                    ];
                }

                if ($insert !== []) {
                    DB::table('chatbot_unanswered')->insert($insert);
                }
            });

        $restored = DB::table('chatbot_unanswered')->count() - $before;

        if ($restored !== $merged) {
            throw new RuntimeException(
                "Phase 2b rollback failed: expected {$merged} unanswered rows, restored {$restored}. Merged rows were kept."
            );
        }

        DB::table('chatbot_messages')->where('source', 'unanswered')->delete();

        if (Schema::hasColumn('chatbot_messages', 'intent')) {
            Schema::table('chatbot_messages', function (Blueprint $table) {
                $table->dropColumn('intent');
            });
        }
    }
};
