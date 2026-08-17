-- ============================================================================
-- 2026_08_17_000002_default_password_setting
-- Manual MySQL migration (run this against the hotel_hr database).
-- Purpose: store the default password used when creating new user accounts
--          (new hires / portal accounts) as a system setting, so the
--          Settings → Login Security → "Change default password of all users"
--          action can persist it in the database and new-user flows can
--          read it back via GET /api/v1/settings/default_password.
-- Safe to re-run: INSERT ... SELECT guarded by NOT EXISTS.
-- ============================================================================

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_by_user_id`)
SELECT 'default_password', '{"password": "Oxford@2026"}', 1
WHERE NOT EXISTS (SELECT 1 FROM `system_settings` WHERE `setting_key` = 'default_password');

-- Verification:
--   SELECT `setting_key`, `setting_value` FROM `system_settings`
--   WHERE `setting_key` = 'default_password';
-- Expected value:
--   {"password": "Oxford@2026"}