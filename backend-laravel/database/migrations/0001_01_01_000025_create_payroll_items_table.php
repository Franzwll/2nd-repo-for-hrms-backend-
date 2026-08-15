<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payroll_items', function (Blueprint $table) {
            $table->id('payroll_item_id');
            $table->unsignedBigInteger('payroll_record_id');
            $table->string('item_type', 30);
            $table->string('item_name', 120);
            $table->decimal('amount', 12, 2)->default(0);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index('payroll_record_id', 'idx_payroll_items_payroll_record_id');

            $table->foreign('payroll_record_id', 'fk_payroll_items_payroll_record_id')
                  ->references('payroll_record_id')->on('payroll_records')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payroll_items');
    }
};
