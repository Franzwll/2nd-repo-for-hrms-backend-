-- ============================================================================
-- 2026_08_19_000001_dedupe_employee_onboarding_items
-- Manual MySQL migration (run this against the hotel_hr database).
-- Purpose: remove duplicate `employee_onboarding_items` rows left behind by
--          the old Checklist Template Builder update logic, which deleted +
--          recreated template items on every save. Each re-save inserted a
--          fresh copy into every matching new hire's checklist, and the old
--          copies became template_item_id NULL (via ON DELETE SET NULL) so
--          they showed up as permanent legacy duplicates in the checklist
--          (the "activating a template adds more items" bug).
--
-- Deduplication keeps one row per logical checklist entry:
--   * template-linked rows  -> one per (new_hire_id, template_item_id)
--   * legacy rows (NULL)    -> one per (new_hire_id, item_text)
--   * a completed row is preferred over pending copies; otherwise the
--     oldest copy is kept.
-- Safe to re-run: duplicates are already gone after the first pass.
-- ============================================================================

-- 1) Template-linked duplicates
DELETE e FROM employee_onboarding_items e
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
) dupes ON dupes.employee_onboarding_item_id = e.employee_onboarding_item_id;

-- 2) Legacy duplicates (same item text copied for the same new hire)
DELETE e FROM employee_onboarding_items e
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
) dupes ON dupes.employee_onboarding_item_id = e.employee_onboarding_item_id;

-- Verification (all should return 0 rows):
--   SELECT new_hire_id, template_item_id, COUNT(*) c FROM employee_onboarding_items
--   WHERE template_item_id IS NOT NULL GROUP BY new_hire_id, template_item_id HAVING c > 1;
--   SELECT new_hire_id, item_text, COUNT(*) c FROM employee_onboarding_items
--   WHERE template_item_id IS NULL GROUP BY new_hire_id, item_text HAVING c > 1;