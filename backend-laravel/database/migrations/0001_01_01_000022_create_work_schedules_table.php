<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('work_schedules', function (Blueprint $table) {
            $table->id('work_schedule_id');
            $table->unsignedBigInteger('employee_id');
            $table->smallInteger('day_of_week');
            $table->string('shift_name', 80)->nullable();
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->string('location', 120)->nullable();
            $table->boolean('is_rest_day')->default(false);
            $table->date('effective_from');
            $table->date('effective_to')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index('employee_id', 'idx_work_schedules_employee_id');

            $table->foreign('employee_id', 'fk_work_schedules_employee_id')
                  ->references('employee_id')->on('employees')->onDelete('cascade');
        });

        DB::statement("ALTER TABLE `work_schedules` ADD CONSTRAINT `chk_work_schedules_day_of_week` CHECK (`day_of_week` BETWEEN 0 AND 6)");
    }

    public function down(): void
    {
        Schema::dropIfExists('work_schedules');
    }
};