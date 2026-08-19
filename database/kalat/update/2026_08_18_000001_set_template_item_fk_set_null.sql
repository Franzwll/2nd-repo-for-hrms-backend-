-- ============================================================================
-- 2026_08_18_000001_set_template_item_fk_set_null
-- Manual MySQL migration (run this against the hotel_hr database).
-- Purpose: allow `onboarding_checklist_items` rows to be deleted even when
--          they are referenced by applied employee onboarding checklists
--          (`employee_onboarding_items.template_item_id`). Employee checklist
--          rows keep their own text copy, so the link is simply severed
--          (SET NULL) instead of blocking template edits/deletes.
--          Fixes "edits don't save / reverts to default" in the New Hire
--          Onboarding -> Checklist Template Builder (FK 1451 500 error).
-- Safe to re-run: only alters the constraint when it still uses RESTRICT /
--          NO ACTION; becomes a no-op once the FK already has SET NULL.
-- ============================================================================

SET @fk_delete_rule := (
  SELECT rc.DELETE_RULE
  FROM information_schema.REFERENTIAL_CONSTRAINTS rc
  WHERE rc.CONSTRAINT_SCHEMA = DATABASE()
    AND rc.CONSTRAINT_NAME   = 'fk_employee_onboarding_items_template_item_id'
    AND rc.TABLE_NAME        = 'employee_onboarding_items'
);

SET @sql := IF(@fk_delete_rule IS NOT NULL AND @fk_delete_rule IN ('RESTRICT', 'NO ACTION'),
  'ALTER TABLE `employee_onboarding_items`
     DROP FOREIGN KEY `fk_employee_onboarding_items_template_item_id`,
     ADD CONSTRAINT `fk_employee_onboarding_items_template_item_id`
       FOREIGN KEY (`template_item_id`) REFERENCES `onboarding_checklist_items` (`template_item_id`)
       ON DELETE SET NULL',
  'SELECT 1');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verification:
--   SELECT rc.CONSTRAINT_NAME, rc.DELETE_RULE
--   FROM information_schema.REFERENTIAL_CONSTRAINTS rc
--   WHERE rc.CONSTRAINT_SCHEMA = DATABASE()
--     AND rc.CONSTRAINT_NAME = 'fk_employee_onboarding_items_template_item_id';
-- Expected result:
--   fk_employee_onboarding_items_template_item_id | SET NULL