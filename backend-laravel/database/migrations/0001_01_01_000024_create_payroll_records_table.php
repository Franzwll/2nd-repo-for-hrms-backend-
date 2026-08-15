<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payroll_records', function (Blueprint $table) {
            $table->id('payroll_record_id');
            $table->unsignedBigInteger('employee_id');
            $table->unsignedBigInteger('payroll_period_id');
            $table->decimal('gross_pay', 12, 2)->default(0);
            $table->decimal('total_deductions', 12, 2)->default(0);
            $table->decimal('net_pay', 12, 2)->default(0);
            $table->string('payment_status', 20);
            $table->date('payment_date')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->unique(['employee_id', 'payroll_period_id'], 'uq_payroll_records_natural');
            $table->index('payroll_period_id', 'idx_payroll_records_payroll_period_id');
            $table->index('payment_status', 'idx_payroll_records_payment_status');

            $table->foreign('employee_id', 'fk_payroll_records_employee_id')
                  ->references('employee_id')->on('employees')->onDelete('cascade');
            $table->foreign('payroll_period_id', 'fk_payroll_records_payroll_period_id')
                  ->references('payroll_period_id')->on('payroll_periods')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payroll_records');
    }
};
