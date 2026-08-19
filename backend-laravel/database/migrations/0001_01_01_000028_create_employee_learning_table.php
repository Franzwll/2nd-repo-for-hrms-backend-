<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_learning', function (Blueprint $table) {
            $table->id('employee_learning_id');
            $table->unsignedBigInteger('employee_id');
            $table->unsignedBigInteger('course_id');
            $table->string('status', 30);
            $table->decimal('score', 5, 2)->nullable();
            $table->date('assigned_date')->nullable();
            $table->date('completed_date')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->unique(['employee_id', 'course_id'], 'uq_employee_learning_natural');
            $table->index('employee_id', 'idx_employee_learning_employee_id');
            $table->index('course_id', 'idx_employee_learning_course_id');

            $table->foreign('employee_id', 'fk_employee_learning_employee_id')
                  ->references('employee_id')->on('employees')->onDelete('cascade');
            $table->foreign('course_id', 'fk_employee_learning_course_id')
                  ->references('course_id')->on('learning_courses');
        });

        DB::statement("ALTER TABLE `employee_learning` ADD CONSTRAINT `chk_employee_learning_status` CHECK (`status` IN ('Assigned', 'In Progress', 'Completed'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_learning');
    }
};