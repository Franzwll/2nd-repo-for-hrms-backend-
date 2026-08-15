<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendance_records', function (Blueprint $table) {
            $table->id('attendance_record_id');
            $table->unsignedBigInteger('employee_id');
            $table->date('attendance_date');
            $table->time('time_in')->nullable();
            $table->time('time_out')->nullable();
            $table->string('status', 20);
            $table->string('remarks', 255)->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->unique(['employee_id', 'attendance_date'], 'uq_attendance_records_natural');
            $table->index('attendance_date', 'idx_attendance_records_attendance_date');
            $table->index('status', 'idx_attendance_records_status');

            $table->foreign('employee_id', 'fk_attendance_records_employee_id')
                  ->references('employee_id')->on('employees')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_records');
    }
};
