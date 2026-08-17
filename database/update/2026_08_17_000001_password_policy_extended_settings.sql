-- ============================================================================
-- 2026_08_17_000001_password_policy_extended_settings
-- Manual MySQL migration (run this against the hotel_hr database).
-- Purpose: extend the password_policy system setting with login-security
--          fields so the Settings → Login Security screen can store them
--          under one key. The frontend now writes the "password_policy"
--          row instead of a separate "security" row.
-- Safe to re-run: uses JSON_MERGE_PATCH guarded by a key check.
-- ============================================================================

-- 1) Extend the existing password_policy row (if present) with the new fields
UPDATE `system_settings`
SET `setting_value` = JSON_MERGE_PATCH(
      `setting_value`,
      '{"twoFactor": true, "sessionTimeout": "30 minutes", "maxLoginAttempts": "3 attempts"}'
    )
WHERE `setting_key` = 'password_policy'
  AND JSON_EXTRACT(`setting_value`, '$.sessionTimeout') IS NULL;

-- 2) Legacy "security" row (Convention B dumps) → migrate into password_policy
--    so the Settings screen picks it up, then drop the old key.
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_by_user_id`)
SELECT 'password_policy',
       JSON_MERGE_PATCH(
         '{"twoFactor": true, "minLength": 8, "requireUppercase": true, "requireLowercase": true, "requireNumber": true, "requireSymbol": true}',
         `setting_value`
       ),
       `updated_by_user_id`
FROM `system_settings`
WHERE `setting_key` = 'security'
  AND NOT EXISTS (SELECT 1 FROM `system_settings` WHERE `setting_key` = 'password_policy');

DELETE FROM `system_settings` WHERE `setting_key` = 'security';

-- Verification:
--   SELECT `setting_key`, `setting_value` FROM `system_settings`
--   WHERE `setting_key` = 'password_policy';
-- Expected value:
--   {"minLength": 8, "requireUppercase": true, "requireLowercase": true,
--    "requireNumber": true, "requireSymbol": true,
--    "twoFactor": true, "sessionTimeout": "30 minutes", "maxLoginAttempts": "3 attempts"}