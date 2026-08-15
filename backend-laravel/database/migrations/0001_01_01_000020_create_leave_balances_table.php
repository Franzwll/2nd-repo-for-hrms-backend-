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
            $table->decimal('allocated', 10, 2)->default(0);
            $table->decimal('used', 10, 2)->default(0);
            $table->decimal('remaining', 10, 2)->default(0);
            $table->string('period', 30)->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->unique(['employee_id', 'leave_type', 'period'], 'uq_leave_balances_natural');
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
