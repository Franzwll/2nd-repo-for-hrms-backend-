<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_learning', function (Blueprint $table) {
            $table->id('employee_learning_id');
            $table->unsignedBigInteger('employee_id');
            $table->unsignedBigInteger('course_id');
            $table->string('enrollment_status', 20)->default('enrolled');
            $table->date('enrollment_date')->nullable();
            $table->date('completion_date')->nullable();
            $table->integer('progress_percent')->default(0);
            $table->decimal('score', 6, 2)->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->unique(['employee_id', 'course_id'], 'uq_employee_learning_natural');
            $table->index('course_id', 'idx_employee_learning_course_id');
            $table->index('enrollment_status', 'idx_employee_learning_enrollment_status');

            $table->foreign('employee_id', 'fk_employee_learning_employee_id')
                  ->references('employee_id')->on('employees')->onDelete('cascade');
            $table->foreign('course_id', 'fk_employee_learning_course_id')
                  ->references('course_id')->on('learning_courses')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_learning');
    }
};
