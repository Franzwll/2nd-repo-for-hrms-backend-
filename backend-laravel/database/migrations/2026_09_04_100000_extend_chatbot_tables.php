<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // One row per chatbot exchange (user question + bot reply) so answers
        // can carry thumbs feedback, citations and source analytics.
        Schema::create('chatbot_messages', function (Blueprint $table) {
            $table->id();
            $table->string('session_id', 80)->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('role', 20)->default('guest');
            $table->text('message');
            $table->text('reply');
            $table->string('source', 20)->default('fallback');
            $table->text('faq_ids')->nullable();
            $table->boolean('had_faq_context')->default(false);
            $table->tinyInteger('feedback')->nullable();
            $table->unsignedInteger('prompt_tokens')->default(0);
            $table->unsignedInteger('completion_tokens')->default(0);
            $table->timestamps();

            $table->index('session_id', 'idx_chatbot_messages_session');
            $table->index('user_id', 'idx_chatbot_messages_user');
            $table->index('created_at', 'idx_chatbot_messages_created');
            $table->index('source', 'idx_chatbot_messages_source');
        });

        // Full-text search over FAQ knowledge so retrieval beats the old
        // word-overlap scoring (MySQL only; other drivers keep LIKE matching).
        if (Schema::getConnection()->getDriverName() === 'mysql') {
            Schema::table('chatbot_faqs', function (Blueprint $table) {
                $table->fullText(['question', 'keywords'], 'ft_chatbot_faqs_search');
            });
        }

        // Default workflow guidance as editable FAQs — replaces the hardcoded
        // "HR GUIDANCE" line so admins can keep answers current without deploys.
        $guidance = [
            [
                'question' => 'How do employee promotions work in the HRMS?',
                'answer' => 'Employees file a promotion request from their ESS portal (Promotion tab). HR reviews it under Core HCM → Promotion Requests; approving applies the position transfer and history entry immediately.',
                'keywords' => 'promotion,promotions,regularization,regularize,hr3,evaluation,handoff,salary increase,demote',
                'sort_order' => 90,
            ],
            [
                'question' => 'How do job requisitions become job posts?',
                'answer' => 'Requisitions are raised in Core HCM (Departments & Positions → Requisitions). Recruitment then converts an approved requisition into a live job post via the Requisitions tab.',
                'keywords' => 'requisition,requisitions,headcount,vacancy request,job order,hiring request,convert',
                'sort_order' => 91,
            ],
            [
                'question' => 'How do I export a report?',
                'answer' => 'Every module header has a Generate Report control — use it to export the current view as PDF, DOCX or Excel.',
                'keywords' => 'report,reports,export,pdf,docx,excel,generate report,download',
                'sort_order' => 92,
            ],
            [
                'question' => 'How do I file a leave request?',
                'answer' => 'Open the ESS portal, go to Request Center (or Attendance tab for leave balances), pick the leave type and date range, then submit. HR sees it instantly in the ESS Management queue.',
                'keywords' => 'leave,leave request,vl,sl,file leave,time off,absence,leave credits,attendance',
                'sort_order' => 93,
            ],
        ];

        foreach ($guidance as $g) {
            $exists = DB::table('chatbot_faqs')->where('question', $g['question'])->exists();
            if (! $exists) {
                DB::table('chatbot_faqs')->insert(array_merge($g, [
                    'enabled' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]));
            }
        }
    }

    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() === 'mysql') {
            Schema::table('chatbot_faqs', function (Blueprint $table) {
                $table->dropFullText('ft_chatbot_faqs_search');
            });
        }
        Schema::dropIfExists('chatbot_messages');
    }
};
