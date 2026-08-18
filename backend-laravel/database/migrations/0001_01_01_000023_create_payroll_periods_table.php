<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payroll_periods', function (Blueprint $table) {
            $table->id('payroll_period_id');
            $table->string('period_code', 40)->unique();
            $table->string('period_name', 120);
            $table->date('period_start');
            $table->date('period_end');
            $table->date('payout_date')->nullable();
            $table->string('status', 20)->default('Open');
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index('status', 'idx_payroll_periods_status');
        });

        DB::statement("ALTER TABLE `payroll_periods` ADD CONSTRAINT `chk_payroll_periods_status` CHECK (`status` IN ('Open', 'Closed'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('payroll_periods');
    }
};