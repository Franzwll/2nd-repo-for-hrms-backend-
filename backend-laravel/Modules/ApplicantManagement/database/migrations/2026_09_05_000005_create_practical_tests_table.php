<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Practical tests — a hands-on, position-based practical exam. Only used
     * for designated positions (see job_posts.requires_practical). The
     * candidate is scored against position-specific criteria.
     */
    public function up(): void
    {
        Schema::create('practical_tests', function (Blueprint $table) {
            $table->id('practical_test_id');
            $table->unsignedBigInteger('applicant_id');
            $table->unsignedBigInteger('assessor_user_id')->nullable();
            $table->string('task_title', 190);
            $table->json('criteria_json')->nullable();                   // [{criterion, max_points}]
            $table->json('scores_json')->nullable();                     // {criterionIndex: score}
            $table->decimal('total_score', 5, 2)->nullable();
            $table->string('result', 10);                                // Passed | Failed
            $table->date('test_date');
            $table->text('remarks')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index('applicant_id', 'idx_practical_tests_applicant_id');
            $table->index('assessor_user_id', 'idx_practical_tests_assessor_user_id');
            $table->index('test_date', 'idx_practical_tests_test_date');

            $table->foreign('applicant_id', 'fk_practical_tests_applicant_id')
                  ->references('applicant_id')->on('applicants')->onDelete('cascade');
            $table->foreign('assessor_user_id', 'fk_practical_tests_assessor_user_id')
                  ->references('system_user_id')->on('system_users');
        });

        DB::statement("ALTER TABLE `practical_tests` ADD CONSTRAINT `chk_practical_tests_result` CHECK (`result` IN ('Passed', 'Failed'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('practical_tests');
    }
};
