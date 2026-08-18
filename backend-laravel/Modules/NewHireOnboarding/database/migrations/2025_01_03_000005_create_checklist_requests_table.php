<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('checklist_requests', function (Blueprint $table) {
            $table->id('checklist_request_id');
            $table->string('request_code', 40)->unique();
            $table->unsignedBigInteger('employee_id');
            $table->unsignedBigInteger('template_id')->nullable();
            $table->string('phase', 30);
            $table->json('items_json')->nullable();
            $table->string('status', 30)->default('Pending');
            $table->unsignedBigInteger('requested_by_user_id')->nullable();
            $table->date('requested_at');
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index('employee_id', 'idx_checklist_requests_employee_id');
            $table->index('template_id', 'idx_checklist_requests_template_id');
            $table->index('requested_by_user_id', 'idx_checklist_requests_requested_by_user_id');
            $table->index('status', 'idx_checklist_requests_status');

            $table->foreign('employee_id', 'fk_checklist_requests_employee_id')
                  ->references('employee_id')->on('employees');
            $table->foreign('template_id', 'fk_checklist_requests_template_id')
                  ->references('template_id')->on('onboarding_checklist_templates');
            $table->foreign('requested_by_user_id', 'fk_checklist_requests_requested_by_user_id')
                  ->references('system_user_id')->on('system_users');
        });

        DB::statement("ALTER TABLE `checklist_requests` ADD CONSTRAINT `chk_checklist_requests_phase` CHECK (`phase` IN ('Pre-onboarding', 'Probationary', 'Regular'))");
        DB::statement("ALTER TABLE `checklist_requests` ADD CONSTRAINT `chk_checklist_requests_status` CHECK (`status` IN ('Pending', 'Approved', 'Rejected', 'Completed'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('checklist_requests');
    }
};
