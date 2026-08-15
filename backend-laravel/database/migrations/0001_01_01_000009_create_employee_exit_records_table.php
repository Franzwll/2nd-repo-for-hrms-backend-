<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_exit_records', function (Blueprint $table) {
            $table->id('exit_record_id');
            $table->unsignedBigInteger('employee_id')->unique();
            $table->string('exit_type', 30);
            $table->date('exit_date');
            $table->string('clearance_status', 20);
            $table->string('coe_status', 20);
            $table->text('notes')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index('employee_id', 'idx_employee_exit_records_employee_id');

            $table->foreign('employee_id', 'fk_employee_exit_records_employee_id')
                  ->references('employee_id')->on('employees')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_exit_records');
    }
};
