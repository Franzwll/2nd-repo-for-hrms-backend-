<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('performance_reviews', function (Blueprint $table) {
            $table->id('performance_review_id');
            $table->unsignedBigInteger('employee_id');
            $table->string('review_period', 80);
            $table->date('review_date')->nullable();
            $table->string('competency_level', 50)->nullable();
            $table->decimal('overall_rating', 5, 2)->nullable();
            $table->unsignedBigInteger('salary_grade_id')->nullable();
            $table->string('salary_step', 30)->nullable();
            $table->unsignedBigInteger('evaluator_user_id')->nullable();
            $table->text('comments')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index('employee_id', 'idx_performance_reviews_employee_id');
            $table->index('salary_grade_id', 'idx_performance_reviews_salary_grade_id');
            $table->index('evaluator_user_id', 'idx_performance_reviews_evaluator_user_id');

            $table->foreign('employee_id', 'fk_performance_reviews_employee_id')
                  ->references('employee_id')->on('employees');
            $table->foreign('salary_grade_id', 'fk_performance_reviews_salary_grade_id')
                  ->references('salary_grade_id')->on('salary_grades');
            $table->foreign('evaluator_user_id', 'fk_performance_reviews_evaluator_user_id')
                  ->references('system_user_id')->on('system_users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('performance_reviews');
    }
};