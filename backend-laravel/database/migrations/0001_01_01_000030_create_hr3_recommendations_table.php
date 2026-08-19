<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hr3_recommendations', function (Blueprint $table) {
            $table->id('recommendation_id');
            $table->unsignedBigInteger('employee_id');
            $table->string('recommendation_type', 40);
            $table->decimal('evaluation_score', 5, 2)->nullable();
            $table->unsignedBigInteger('evaluator_user_id')->nullable();
            $table->date('date_submitted');
            $table->string('status', 40);
            $table->unsignedBigInteger('suggested_position_id')->nullable();
            $table->unsignedBigInteger('suggested_salary_grade_id')->nullable();
            $table->string('current_employment_type', 30)->nullable();
            $table->text('comments')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index('employee_id', 'idx_hr3_recommendations_employee_id');
            $table->index('evaluator_user_id', 'idx_hr3_recommendations_evaluator_user_id');
            $table->index('suggested_position_id', 'idx_hr3_recommendations_suggested_position_id');
            $table->index('suggested_salary_grade_id', 'idx_hr3_recommendations_suggested_salary_grade_id');

            $table->foreign('employee_id', 'fk_hr3_recommendations_employee_id')
                  ->references('employee_id')->on('employees');
            $table->foreign('evaluator_user_id', 'fk_hr3_recommendations_evaluator_user_id')
                  ->references('system_user_id')->on('system_users');
            $table->foreign('suggested_position_id', 'fk_hr3_recommendations_suggested_position_id')
                  ->references('position_id')->on('positions');
            $table->foreign('suggested_salary_grade_id', 'fk_hr3_recommendations_suggested_salary_grade_id')
                  ->references('salary_grade_id')->on('salary_grades');
        });

        DB::statement("ALTER TABLE `hr3_recommendations` ADD CONSTRAINT `chk_hr3_recommendations_recommendation_type` CHECK (`recommendation_type` IN ('Regularization', 'Promotion', 'Performance Review'))");
        DB::statement("ALTER TABLE `hr3_recommendations` ADD CONSTRAINT `chk_hr3_recommendations_status` CHECK (`status` IN ('Pending HR Action', 'Approved & Processed', 'Deferred'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('hr3_recommendations');
    }
};