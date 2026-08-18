<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id('employee_id');
            $table->string('employee_code', 40)->unique();
            $table->string('first_name', 80);
            $table->string('middle_name', 80)->nullable();
            $table->string('last_name', 80);
            $table->string('email', 190)->unique();
            $table->string('personal_email', 190)->nullable();
            $table->string('phone', 40)->nullable();
            $table->text('address')->nullable();
            $table->date('birth_date')->nullable();
            $table->string('gender', 20)->nullable();
            $table->string('civil_status', 20)->nullable();
            $table->string('nationality', 60)->nullable();
            $table->string('sss_number', 30)->nullable();
            $table->string('philhealth_number', 30)->nullable();
            $table->string('pagibig_number', 30)->nullable();
            $table->string('tin_number', 30)->nullable();
            $table->unsignedBigInteger('position_id');
            $table->unsignedBigInteger('department_id');
            $table->string('employment_type', 30);
            $table->date('date_hired');
            $table->unsignedBigInteger('supervisor_employee_id')->nullable();
            $table->string('status', 30);
            $table->boolean('onboarding_complete')->default(false);
            $table->unsignedBigInteger('salary_grade_id')->nullable();
            $table->date('employee_record_last_updated_at')->nullable();
            $table->string('salary_step', 30)->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index('department_id', 'idx_employees_department_id');
            $table->index('position_id', 'idx_employees_position_id');
            $table->index('salary_grade_id', 'idx_employees_salary_grade_id');
            $table->index('supervisor_employee_id', 'idx_employees_supervisor_employee_id');
            $table->index('status', 'idx_employees_status');
            $table->index('date_hired', 'idx_employees_date_hired');

            $table->foreign('position_id', 'fk_employees_position_id')
                  ->references('position_id')->on('positions');
            $table->foreign('department_id', 'fk_employees_department_id')
                  ->references('department_id')->on('departments');
            $table->foreign('supervisor_employee_id', 'fk_employees_supervisor_employee_id')
                  ->references('employee_id')->on('employees');
            $table->foreign('salary_grade_id', 'fk_employees_salary_grade_id')
                  ->references('salary_grade_id')->on('salary_grades');
        });

        // Circular dependency: departments.head_employee_id -> employees
        Schema::table('departments', function (Blueprint $table) {
            $table->foreign('head_employee_id', 'fk_departments_head_employee_id')
                  ->references('employee_id')->on('employees');
        });
    }

    public function down(): void
    {
        Schema::table('departments', function (Blueprint $table) {
            $table->dropForeign('fk_departments_head_employee_id');
        });
        Schema::dropIfExists('employees');
    }
};
