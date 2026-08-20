<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Applied employee checklist items keep their own text copy, so template
 * items may be safely deleted. The FK must not RESTRICT the delete — it
 * becomes ON DELETE SET NULL.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('employee_onboarding_items')) {
            return;
        }

        $fk = 'fk_employee_onboarding_items_template_item_id';

        DB::statement('ALTER TABLE `employee_onboarding_items` DROP FOREIGN KEY `' . $fk . '`');
        DB::statement(
            'ALTER TABLE `employee_onboarding_items`
             ADD CONSTRAINT `' . $fk . '`
             FOREIGN KEY (`template_item_id`) REFERENCES `onboarding_checklist_items` (`template_item_id`)
             ON DELETE SET NULL'
        );
    }

    public function down(): void
    {
        if (! Schema::hasTable('employee_onboarding_items')) {
            return;
        }

        $fk = 'fk_employee_onboarding_items_template_item_id';

        DB::statement('ALTER TABLE `employee_onboarding_items` DROP FOREIGN KEY `' . $fk . '`');
        DB::statement(
            'ALTER TABLE `employee_onboarding_items`
             ADD CONSTRAINT `' . $fk . '`
             FOREIGN KEY (`template_item_id`) REFERENCES `onboarding_checklist_items` (`template_item_id`)'
        );
    }
};