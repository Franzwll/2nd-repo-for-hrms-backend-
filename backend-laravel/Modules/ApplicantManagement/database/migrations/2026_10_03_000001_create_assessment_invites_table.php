<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Assessment invites — single-use links that let the APPLICANT (not the
     * staff recruiter) answer the assessment test on their own device. Staff
     * generate the link from the applicant's profile; the applicant opens it
     * without logging in, submits their answers, and the server scores the
     * test, records an assessment_tests row and advances the applicant stage.
     */
    public function up(): void
    {
        Schema::create('assessment_invites', function (Blueprint $table) {
            $table->id('assessment_invite_id');
            $table->string('token', 64)->unique();
            $table->unsignedBigInteger('applicant_id');
            // Staff member who generated the link (recorded as the assessor).
            $table->unsignedBigInteger('created_by_user_id')->nullable();
            $table->string('test_title', 190);
            $table->json('questions_json');                              // [{title, scenario, options, correctIndex, points}]
            $table->json('answers_json')->nullable();                    // {questionIndex: optionIndex}
            $table->decimal('passing_score', 5, 2)->default(75.00);
            $table->decimal('total_score', 5, 2)->nullable();
            $table->string('result', 10)->nullable();                    // Passed | Failed
            $table->string('status', 20)->default('Pending');            // Pending | Completed | Expired
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index('applicant_id', 'idx_assessment_invites_applicant_id');
            $table->index('status', 'idx_assessment_invites_status');

            $table->foreign('applicant_id', 'fk_assessment_invites_applicant_id')
                  ->references('applicant_id')->on('applicants')->onDelete('cascade');
            $table->foreign('created_by_user_id', 'fk_assessment_invites_created_by_user_id')
                  ->references('system_user_id')->on('system_users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessment_invites');
    }
};
