<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_benefits', function (Blueprint $table) {
            $table->id('employee_benefit_id');
            $table->unsignedBigInteger('employee_id');
            $table->string('benefit_name', 100);
            $table->string('reference_value', 190)->nullable();
            $table->text('note')->nullable();
            $table->date('effective_date')->nullable();
            $table->date('end_date')->nullable();
            $table->string('status', 30);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index('employee_id', 'idx_employee_benefits_employee_id');

            $table->foreign('employee_id', 'fk_employee_benefits_employee_id')
                  ->references('employee_id')->on('employees')->onDelete('cascade');
        });

        DB::statement("ALTER TABLE `employee_benefits` ADD CONSTRAINT `chk_employee_benefits_status` CHECK (`status` IN ('Active', 'Inactive', 'Expired'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_benefits');
    }
};