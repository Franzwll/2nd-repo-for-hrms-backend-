<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Assessment tests — the job-specific written/knowledge test taken after
     * the interview assessment. The candidate receives a score result based
     * on their test answers.
     */
    public function up(): void
    {
        Schema::create('assessment_tests', function (Blueprint $table) {
            $table->id('assessment_test_id');
            $table->unsignedBigInteger('applicant_id');
            $table->unsignedBigInteger('assessor_user_id')->nullable();
            $table->string('test_title', 190);
            $table->json('questions_json')->nullable();                  // [{question, points}]
            $table->json('scores_json')->nullable();                     // {questionIndex: score}
            $table->decimal('total_score', 5, 2)->nullable();
            $table->decimal('passing_score', 5, 2)->default(75.00);
            $table->string('result', 10);                                // Passed | Failed
            $table->date('test_date');
            $table->text('remarks')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index('applicant_id', 'idx_assessment_tests_applicant_id');
            $table->index('assessor_user_id', 'idx_assessment_tests_assessor_user_id');
            $table->index('test_date', 'idx_assessment_tests_test_date');

            $table->foreign('applicant_id', 'fk_assessment_tests_applicant_id')
                  ->references('applicant_id')->on('applicants')->onDelete('cascade');
            $table->foreign('assessor_user_id', 'fk_assessment_tests_assessor_user_id')
                  ->references('system_user_id')->on('system_users');
        });

        DB::statement("ALTER TABLE `assessment_tests` ADD CONSTRAINT `chk_assessment_tests_result` CHECK (`result` IN ('Passed', 'Failed'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('assessment_tests');
    }
};
