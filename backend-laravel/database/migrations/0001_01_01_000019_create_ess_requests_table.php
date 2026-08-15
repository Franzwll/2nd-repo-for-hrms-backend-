<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ess_requests', function (Blueprint $table) {
            $table->id('ess_request_id');
            $table->unsignedBigInteger('employee_id');
            $table->unsignedBigInteger('ess_category_id')->nullable();
            $table->string('request_type', 30);
            $table->string('status', 20);
            $table->date('request_date')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->text('reason')->nullable();
            $table->text('admin_notes')->nullable();
            $table->unsignedBigInteger('approved_by_user_id')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index('employee_id', 'idx_ess_requests_employee_id');
            $table->index('ess_category_id', 'idx_ess_requests_ess_category_id');
            $table->index('status', 'idx_ess_requests_status');
            $table->index('request_type', 'idx_ess_requests_request_type');
            $table->index('approved_by_user_id', 'idx_ess_requests_approved_by_user_id');

            $table->foreign('employee_id', 'fk_ess_requests_employee_id')
                  ->references('employee_id')->on('employees')->onDelete('cascade');
            $table->foreign('ess_category_id', 'fk_ess_requests_ess_category_id')
                  ->references('ess_category_id')->on('ess_categories');
            $table->foreign('approved_by_user_id', 'fk_ess_requests_approved_by_user_id')
                  ->references('system_user_id')->on('system_users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ess_requests');
    }
};
