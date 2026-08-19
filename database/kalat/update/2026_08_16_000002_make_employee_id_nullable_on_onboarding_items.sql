-- ============================================================================
-- 2026_08_16_000002_make_employee_id_nullable_on_onboarding_items
-- Manual MySQL migration (run this against the hotel_hr database).
-- Mirrors the Laravel migration:
--   Modules/NewHireOnboarding/database/migrations/2026_08_16_000002_make_employee_id_nullable_on_onboarding_items.php
-- Purpose: a new hire that has NOT yet been created as an employee record
--          (employee_id NULL) can still receive onboarding checklist items.
--          Without this, checklist templates cannot auto-apply to
--          pre-onboarding new hires.
-- Safe to re-run: the foreign key drop is guarded via information_schema.
-- ============================================================================

-- 1) Drop the foreign key only if it still exists (no error when missing)
SET @fk_exists := (
  SELECT COUNT(*)
  FROM information_schema.REFERENTIAL_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'employee_onboarding_items'
    AND CONSTRAINT_NAME = 'fk_employee_onboarding_items_employee_id'
);

SET @sql := IF(
  @fk_exists > 0,
  'ALTER TABLE `employee_onboarding_items` DROP FOREIGN KEY `fk_employee_onboarding_items_employee_id`',
  'SELECT ''FK already absent - skipping'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2) Make employee_id nullable
ALTER TABLE `employee_onboarding_items`
  MODIFY `employee_id` BIGINT UNSIGNED NULL;

-- 3) Re-add the foreign key with ON DELETE CASCADE
ALTER TABLE `employee_onboarding_items`
  ADD CONSTRAINT `fk_employee_onboarding_items_employee_id`
  FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE;

-- Verification:
--   SHOW COLUMNS FROM `employee_onboarding_items` LIKE 'employee_id'; -- Null = YES
--   INSERT INTO `employee_onboarding_items`
--     (`employee_id`, `new_hire_id`, `template_item_id`, `item_text`, `done`)
--   VALUES (NULL, 1, 1, 'test nullable row', 0);                       -- must succeed
--   DELETE FROM `employee_onboarding_items` WHERE `item_text` = 'test nullable row';