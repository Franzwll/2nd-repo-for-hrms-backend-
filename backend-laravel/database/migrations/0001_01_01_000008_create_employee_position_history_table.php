<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_position_history', function (Blueprint $table) {
            $table->id('position_history_id');
            $table->unsignedBigInteger('employee_id');
            $table->date('effective_date');
            $table->string('change_type', 30)->default('Employment');
            $table->unsignedBigInteger('old_position_id')->nullable();
            $table->unsignedBigInteger('new_position_id')->nullable();
            $table->unsignedBigInteger('old_salary_grade_id')->nullable();
            $table->unsignedBigInteger('new_salary_grade_id')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('employee_id', 'idx_employee_position_history_employee_id');
            $table->index('old_position_id', 'idx_employee_position_history_old_position_id');
            $table->index('new_position_id', 'idx_employee_position_history_new_position_id');
            $table->index('old_salary_grade_id', 'idx_employee_position_history_old_salary_grade_id');
            $table->index('new_salary_grade_id', 'idx_employee_position_history_new_salary_grade_id');

            $table->foreign('employee_id', 'fk_employee_position_history_employee_id')
                  ->references('employee_id')->on('employees')->onDelete('cascade');
            $table->foreign('old_position_id', 'fk_employee_position_history_old_position_id')
                  ->references('position_id')->on('positions');
            $table->foreign('new_position_id', 'fk_employee_position_history_new_position_id')
                  ->references('position_id')->on('positions');
            $table->foreign('old_salary_grade_id', 'fk_employee_position_history_old_salary_grade_id')
                  ->references('salary_grade_id')->on('salary_grades');
            $table->foreign('new_salary_grade_id', 'fk_employee_position_history_new_salary_grade_id')
                  ->references('salary_grade_id')->on('salary_grades');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_position_history');
    }
};
