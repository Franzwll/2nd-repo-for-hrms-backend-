<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Final evaluations — the closing evaluation of the whole recruitment
     * process for an applicant (resume screening, interview assessment,
     * assessment test and — when the position requires it — the practical
     * assessment). Verdict is one of:
     * Recommended for Hire | For Another Position | Not Recommended.
     */
    public function up(): void
    {
        Schema::create('final_evaluations', function (Blueprint $table) {
            $table->id('final_evaluation_id');
            $table->unsignedBigInteger('applicant_id');
            $table->unsignedBigInteger('evaluated_by_user_id')->nullable();
            $table->date('evaluation_date');

            // Snapshot of every preceding stage (preview material)
            $table->decimal('screening_score', 5, 2)->nullable();
            $table->string('screening_status', 40)->nullable();
            $table->decimal('interview_score', 5, 2)->nullable();
            $table->string('interview_result', 10)->nullable();
            $table->decimal('assessment_test_score', 5, 2)->nullable();
            $table->string('assessment_test_result', 10)->nullable();
            $table->boolean('practical_required')->default(false);
            $table->decimal('practical_test_score', 5, 2)->nullable();
            $table->string('practical_test_result', 10)->nullable();

            $table->string('recommendation', 30);
            $table->text('overall_remarks')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->unique('applicant_id', 'uq_final_evaluations_applicant_id');
            $table->index('evaluated_by_user_id', 'idx_final_evaluations_evaluated_by');
            $table->index('evaluation_date', 'idx_final_evaluations_evaluation_date');

            $table->foreign('applicant_id', 'fk_final_evaluations_applicant_id')
                  ->references('applicant_id')->on('applicants')->onDelete('cascade');
            $table->foreign('evaluated_by_user_id', 'fk_final_evaluations_evaluated_by')
                  ->references('system_user_id')->on('system_users');
        });

        DB::statement("ALTER TABLE `final_evaluations` ADD CONSTRAINT `chk_final_evaluations_recommendation` CHECK (`recommendation` IN ('Recommended for Hire', 'For Another Position', 'Not Recommended'))");
        DB::statement("ALTER TABLE `final_evaluations` ADD CONSTRAINT `chk_final_evaluations_results` CHECK (`interview_result` IN ('Passed', 'Failed') AND `assessment_test_result` IN ('Passed', 'Failed') AND `practical_test_result` IN ('Passed', 'Failed'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('final_evaluations');
    }
};
