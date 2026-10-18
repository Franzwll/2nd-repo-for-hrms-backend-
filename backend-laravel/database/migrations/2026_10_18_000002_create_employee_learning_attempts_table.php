<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tier-1 thin LMS — §1b: one row per quiz attempt (history + retakes).
 * Additive; rollback with `php artisan migrate:rollback`.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_learning_attempts', function (Blueprint $table) {
            $table->id('attempt_id');
            $table->unsignedBigInteger('employee_id');
            $table->unsignedBigInteger('course_id');
            $table->unsignedTinyInteger('score');              // 0–100
            $table->unsignedSmallInteger('correct_count');
            $table->unsignedSmallInteger('total_count');
            $table->boolean('passed');
            $table->json('answers_json')->nullable();
            $table->timestamp('submitted_at')->useCurrent();

            $table->index(['employee_id', 'course_id'], 'idx_attempts_emp_course');

            $table->foreign('employee_id', 'fk_attempts_employee_id')
                  ->references('employee_id')->on('employees')->onDelete('cascade');
            $table->foreign('course_id', 'fk_attempts_course_id')
                  ->references('course_id')->on('learning_courses')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_learning_attempts');
    }
};
