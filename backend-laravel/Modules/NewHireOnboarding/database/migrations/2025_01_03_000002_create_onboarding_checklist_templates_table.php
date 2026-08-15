<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('onboarding_checklist_templates', function (Blueprint $table) {
            $table->id('template_id');
            $table->string('template_code', 40)->unique();
            $table->string('title', 200);
            $table->string('phase', 30);
            $table->json('position_scope_json')->nullable();
            $table->string('status', 20);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });

        DB::statement("ALTER TABLE `onboarding_checklist_templates` ADD CONSTRAINT `chk_onboarding_checklist_templates_phase` CHECK (`phase` IN ('Pre-onboarding', 'Onboarding', 'Probationary', 'Regular'))");
        DB::statement("ALTER TABLE `onboarding_checklist_templates` ADD CONSTRAINT `chk_onboarding_checklist_templates_status` CHECK (`status` IN ('Active', 'Inactive'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('onboarding_checklist_templates');
    }
};
