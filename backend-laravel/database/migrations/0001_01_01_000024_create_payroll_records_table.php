<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payroll_records', function (Blueprint $table) {
            $table->id('payroll_record_id');
            $table->unsignedBigInteger('employee_id');
            $table->unsignedBigInteger('payroll_period_id')->nullable();
            $table->date('pay_period_start');
            $table->date('pay_period_end');
            $table->date('payout_date')->nullable();
            $table->decimal('gross_pay', 12, 2);
            $table->decimal('net_pay', 12, 2);
            $table->string('status', 30);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index('employee_id', 'idx_payroll_records_employee_id');
            $table->index('payroll_period_id', 'idx_payroll_records_payroll_period_id');
            $table->index('pay_period_start', 'idx_payroll_records_pay_period_start');
            $table->index('status', 'idx_payroll_records_status');

            $table->foreign('employee_id', 'fk_payroll_records_employee_id')
                  ->references('employee_id')->on('employees');
            $table->foreign('payroll_period_id', 'fk_payroll_records_payroll_period_id')
                  ->references('payroll_period_id')->on('payroll_periods');
        });

        DB::statement("ALTER TABLE `payroll_records` ADD CONSTRAINT `chk_payroll_records_status` CHECK (`status` IN ('Draft', 'Finalized', 'Released'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('payroll_records');
    }
};