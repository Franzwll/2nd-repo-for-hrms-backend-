<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Removes legacy employee_onboarding_items duplicates that remain after the
 * 2026_08_19_000001 dedupe: copies that were severed from their template item
 * (template_item_id became NULL via ON DELETE SET NULL) but whose text is
 * still provided by an active template-linked copy for the same new hire.
 *
 * The template-linked row wins because its visibility is controlled by the
 * checklist template (activate = show, deactivate = hide). Completion state
 * is preserved first: if the legacy copy was completed, the kept row inherits
 * done/completed_at/completed_by_user_id.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('employee_onboarding_items')) {
            return;
        }

        // Carry completion state from the legacy copy to the kept row
        DB::statement(
            'UPDATE employee_onboarding_items t
             JOIN employee_onboarding_items l
               ON l.new_hire_id = t.new_hire_id
              AND l.item_text = t.item_text
              AND l.template_item_id IS NULL
              AND l.done = 1
             SET t.done = 1,
                 t.completed_at = COALESCE(t.completed_at, l.completed_at),
                 t.completed_by_user_id = COALESCE(t.completed_by_user_id, l.completed_by_user_id)
             WHERE t.template_item_id IS NOT NULL'
        );

        // Drop legacy twins of template-linked rows
        DB::statement(
            'DELETE e FROM employee_onboarding_items e
             JOIN employee_onboarding_items t
               ON t.new_hire_id = e.new_hire_id
              AND t.item_text = e.item_text
              AND t.template_item_id IS NOT NULL
             WHERE e.template_item_id IS NULL'
        );
    }

    public function down(): void
    {
        // Deduplication cannot be undone.
    }
};