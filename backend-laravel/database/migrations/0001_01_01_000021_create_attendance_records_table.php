<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendance_records', function (Blueprint $table) {
            $table->id('attendance_id');
            $table->unsignedBigInteger('employee_id');
            $table->date('work_date');
            $table->timestamp('time_in')->nullable();
            $table->timestamp('time_out')->nullable();
            $table->timestamp('break_in')->nullable();
            $table->timestamp('break_out')->nullable();
            $table->decimal('hours_worked', 7, 2)->default(0);
            $table->integer('late_minutes')->default(0);
            $table->integer('undertime_minutes')->default(0);
            $table->decimal('overtime_hours', 7, 2)->default(0);
            $table->string('remark', 255)->nullable();
            $table->string('status', 30)->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->unique(['employee_id', 'work_date'], 'uq_attendance_records_natural');
            $table->index('employee_id', 'idx_attendance_records_employee_id');
            $table->index('work_date', 'idx_attendance_records_work_date');

            $table->foreign('employee_id', 'fk_attendance_records_employee_id')
                  ->references('employee_id')->on('employees')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_records');
    }
};