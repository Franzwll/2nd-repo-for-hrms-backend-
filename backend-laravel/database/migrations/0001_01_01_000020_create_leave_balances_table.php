<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leave_balances', function (Blueprint $table) {
            $table->id('leave_balance_id');
            $table->unsignedBigInteger('employee_id');
            $table->string('leave_type', 80);
            $table->smallInteger('period_year');
            $table->decimal('total_days', 6, 2)->default(0);
            $table->decimal('used_days', 6, 2)->default(0);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->unique(['employee_id', 'leave_type', 'period_year'], 'uq_leave_balances_natural');
            $table->index('employee_id', 'idx_leave_balances_employee_id');

            $table->foreign('employee_id', 'fk_leave_balances_employee_id')
                  ->references('employee_id')->on('employees')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leave_balances');
    }
};