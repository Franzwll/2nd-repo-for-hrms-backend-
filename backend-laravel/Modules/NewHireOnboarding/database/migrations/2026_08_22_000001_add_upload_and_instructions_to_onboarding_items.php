<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('onboarding_checklist_items', function (Blueprint $table) {
            if (!Schema::hasColumn('onboarding_checklist_items', 'instructions')) {
                $table->text('instructions')->nullable()->after('item_text');
            }
            if (!Schema::hasColumn('onboarding_checklist_items', 'requires_upload')) {
                $table->boolean('requires_upload')->default(false)->after('instructions');
            }
            if (!Schema::hasColumn('onboarding_checklist_items', 'upload_placeholder')) {
                $table->string('upload_placeholder', 255)->nullable()->after('requires_upload');
            }
        });

        Schema::table('employee_onboarding_items', function (Blueprint $table) {
            if (!Schema::hasColumn('employee_onboarding_items', 'file_path')) {
                $table->string('file_path', 500)->nullable()->after('item_text');
            }
            if (!Schema::hasColumn('employee_onboarding_items', 'file_name')) {
                $table->string('file_name', 255)->nullable()->after('file_path');
            }
            if (!Schema::hasColumn('employee_onboarding_items', 'notes')) {
                $table->text('notes')->nullable()->after('file_name');
            }
        });
    }

    public function down(): void
    {
        Schema::table('onboarding_checklist_items', function (Blueprint $table) {
            $table->dropColumn(['instructions', 'requires_upload', 'upload_placeholder']);
        });

        Schema::table('employee_onboarding_items', function (Blueprint $table) {
            $table->dropColumn(['file_path', 'file_name', 'notes']);
        });
    }
};
