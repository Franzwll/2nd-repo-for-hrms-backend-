<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Cleans up duplicate employee_onboarding_items rows created by the old
 * checklist template update logic (which deleted + recreated template items
 * on every save, so each re-save inserted a fresh copy into every new hire's
 * checklist — old copies became template_item_id NULL via ON DELETE SET NULL
 * and showed up as permanent legacy duplicates).
 *
 * Deduplication rules (keeps one row per logical checklist entry):
 *  - template-linked rows (template_item_id NOT NULL): one row per
 *    (new_hire_id, template_item_id) — prefers a completed row, else the
 *    oldest row.
 *  - legacy rows (template_item_id NULL): one row per (new_hire_id,
 *    item_text) — prefers a completed row, else the oldest row.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('employee_onboarding_items')) {
            return;
        }

        // Keep id helper: completed row if any, otherwise the oldest.
        // Template-linked duplicates
        DB::statement(
            'DELETE e FROM employee_onboarding_items e
             JOIN (
               SELECT employee_onboarding_item_id
               FROM employee_onboarding_items
               WHERE template_item_id IS NOT NULL
                 AND employee_onboarding_item_id NOT IN (
                   SELECT keep_id FROM (
                     SELECT COALESCE(
                       MAX(CASE WHEN done = 1 THEN employee_onboarding_item_id END),
                       MIN(employee_onboarding_item_id)
                     ) AS keep_id
                     FROM employee_onboarding_items
                     WHERE template_item_id IS NOT NULL
                     GROUP BY new_hire_id, template_item_id
                   ) keeps
                 )
             ) dupes ON dupes.employee_onboarding_item_id = e.employee_onboarding_item_id'
        );

        // Legacy duplicates (same item text copied for the same new hire)
        DB::statement(
            'DELETE e FROM employee_onboarding_items e
             JOIN (
               SELECT employee_onboarding_item_id
               FROM employee_onboarding_items
               WHERE template_item_id IS NULL
                 AND employee_onboarding_item_id NOT IN (
                   SELECT keep_id FROM (
                     SELECT COALESCE(
                       MAX(CASE WHEN done = 1 THEN employee_onboarding_item_id END),
                       MIN(employee_onboarding_item_id)
                     ) AS keep_id
                     FROM employee_onboarding_items
                     WHERE template_item_id IS NULL
                     GROUP BY new_hire_id, item_text
                   ) keeps
                 )
             ) dupes ON dupes.employee_onboarding_item_id = e.employee_onboarding_item_id'
        );
    }

    public function down(): void
    {
        // Deduplication cannot be undone.
    }
};