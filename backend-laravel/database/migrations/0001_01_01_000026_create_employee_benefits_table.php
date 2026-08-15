<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_benefits', function (Blueprint $table) {
            $table->id('benefit_id');
            $table->unsignedBigInteger('employee_id');
            $table->string('benefit_name', 120);
            $table->string('benefit_type', 50)->nullable();
            $table->decimal('amount', 12, 2)->nullable();
            $table->date('effective_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->string('status', 20)->default('active');
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index('employee_id', 'idx_employee_benefits_employee_id');
            $table->index('status', 'idx_employee_benefits_status');

            $table->foreign('employee_id', 'fk_employee_benefits_employee_id')
                  ->references('employee_id')->on('employees')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_benefits');
    }
};
