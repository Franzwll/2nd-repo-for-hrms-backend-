<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_onboarding_items', function (Blueprint $table) {
            $table->id('employee_onboarding_item_id');
            $table->unsignedBigInteger('employee_id');
            $table->unsignedBigInteger('new_hire_id')->nullable();
            $table->unsignedBigInteger('template_item_id')->nullable();
            $table->text('item_text');
            $table->boolean('done')->default(false);
            $table->timestamp('completed_at')->nullable();
            $table->unsignedBigInteger('completed_by_user_id')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index('employee_id', 'idx_employee_onboarding_items_employee_id');
            $table->index('new_hire_id', 'idx_employee_onboarding_items_new_hire_id');
            $table->index('template_item_id', 'idx_employee_onboarding_items_template_item_id');
            $table->index('completed_by_user_id', 'idx_employee_onboarding_items_completed_by_user_id');

            $table->foreign('employee_id', 'fk_employee_onboarding_items_employee_id')
                  ->references('employee_id')->on('employees')->onDelete('cascade');
            $table->foreign('new_hire_id', 'fk_employee_onboarding_items_new_hire_id')
                  ->references('new_hire_id')->on('new_hires');
            $table->foreign('template_item_id', 'fk_employee_onboarding_items_template_item_id')
                  ->references('template_item_id')->on('onboarding_checklist_items');
            $table->foreign('completed_by_user_id', 'fk_employee_onboarding_items_completed_by_user_id')
                  ->references('system_user_id')->on('system_users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_onboarding_items');
    }
};
