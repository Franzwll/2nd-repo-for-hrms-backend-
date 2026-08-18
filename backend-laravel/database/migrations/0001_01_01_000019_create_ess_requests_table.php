<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ess_requests', function (Blueprint $table) {
            $table->id('ess_request_id');
            $table->string('request_code', 40)->unique();
            $table->unsignedBigInteger('employee_id');
            $table->unsignedBigInteger('category_id')->nullable();
            $table->string('request_type', 100);
            $table->timestamp('filed_at')->useCurrent();
            $table->date('date_from')->nullable();
            $table->date('date_to')->nullable();
            $table->string('status', 30);
            $table->unsignedBigInteger('assigned_to_user_id')->nullable();
            $table->text('details')->nullable();
            $table->text('review_note')->nullable();
            $table->integer('returned_count')->default(0);
            $table->text('attachment_path')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index('employee_id', 'idx_ess_requests_employee_id');
            $table->index('category_id', 'idx_ess_requests_category_id');
            $table->index('assigned_to_user_id', 'idx_ess_requests_assigned_to_user_id');
            $table->index('status', 'idx_ess_requests_status');
            $table->index('filed_at', 'idx_ess_requests_filed_at');

            $table->foreign('employee_id', 'fk_ess_requests_employee_id')
                  ->references('employee_id')->on('employees');
            $table->foreign('category_id', 'fk_ess_requests_category_id')
                  ->references('ess_category_id')->on('ess_categories')->onDelete('set null');
            $table->foreign('assigned_to_user_id', 'fk_ess_requests_assigned_to_user_id')
                  ->references('system_user_id')->on('system_users');
        });

        DB::statement("ALTER TABLE `ess_requests` ADD CONSTRAINT `chk_ess_requests_status` CHECK (`status` IN ('Pending', 'Under Review', 'Approved', 'Rejected', 'Completed'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('ess_requests');
    }
};