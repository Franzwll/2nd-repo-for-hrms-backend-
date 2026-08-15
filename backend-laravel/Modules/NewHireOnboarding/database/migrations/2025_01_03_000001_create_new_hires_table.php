<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('new_hires', function (Blueprint $table) {
            $table->id('new_hire_id');
            $table->string('new_hire_code', 40)->unique();
            $table->unsignedBigInteger('applicant_id')->nullable();
            $table->unsignedBigInteger('employee_id')->nullable();
            $table->string('name', 160);
            $table->string('email', 190)->nullable();
            $table->string('phone', 40)->nullable();
            $table->unsignedBigInteger('position_id')->nullable();
            $table->unsignedBigInteger('department_id')->nullable();
            $table->string('stage', 30);
            $table->date('start_date');
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index('applicant_id', 'idx_new_hires_applicant_id');
            $table->index('employee_id', 'idx_new_hires_employee_id');
            $table->index('position_id', 'idx_new_hires_position_id');
            $table->index('department_id', 'idx_new_hires_department_id');
            $table->index('stage', 'idx_new_hires_stage');

            $table->foreign('applicant_id', 'fk_new_hires_applicant_id')
                  ->references('applicant_id')->on('applicants');
            $table->foreign('employee_id', 'fk_new_hires_employee_id')
                  ->references('employee_id')->on('employees');
            $table->foreign('position_id', 'fk_new_hires_position_id')
                  ->references('position_id')->on('positions');
            $table->foreign('department_id', 'fk_new_hires_department_id')
                  ->references('department_id')->on('departments');
        });

        DB::statement("ALTER TABLE `new_hires` ADD CONSTRAINT `chk_new_hires_stage` CHECK (`stage` IN ('Pre-onboarding', 'Probationary', 'Regular'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('new_hires');
    }
};
