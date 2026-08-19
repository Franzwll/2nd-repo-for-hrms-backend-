-- ============================================================================
-- 2026_08_19_000002_dedupe_legacy_onboarding_item_duplicates
-- Manual MySQL migration (run this against the hotel_hr database).
-- Run AFTER 2026_08_19_000001_dedupe_employee_onboarding_items.sql.
-- Purpose: remove legacy `employee_onboarding_items` copies that were severed
--          from their template item (template_item_id became NULL via
--          ON DELETE SET NULL) but whose text is still provided by a
--          template-linked copy for the same new hire. The template-linked
--          row wins — its visibility is controlled by the checklist template
--          (activate = show, deactivate = hide), and completion state is
--          preserved from the legacy copy first.
-- Safe to re-run: no legacy twin remains after the first pass.
-- ============================================================================

-- 1) Carry completion state from the legacy copy to the kept row
UPDATE employee_onboarding_items t
JOIN employee_onboarding_items l
  ON l.new_hire_id = t.new_hire_id
 AND l.item_text = t.item_text
 AND l.template_item_id IS NULL
 AND l.done = 1
SET t.done = 1,
    t.completed_at = COALESCE(t.completed_at, l.completed_at),
    t.completed_by_user_id = COALESCE(t.completed_by_user_id, l.completed_by_user_id)
WHERE t.template_item_id IS NOT NULL;

-- 2) Drop legacy twins of template-linked rows
DELETE e FROM employee_onboarding_items e
JOIN employee_onboarding_items t
  ON t.new_hire_id = e.new_hire_id
 AND t.item_text = e.item_text
 AND t.template_item_id IS NOT NULL
WHERE e.template_item_id IS NULL;

-- Verification:
--   SELECT e.new_hire_id, e.item_text, COUNT(*) c
--   FROM employee_onboarding_items e
--   GROUP BY e.new_hire_id, e.item_text
--   HAVING c > 1;