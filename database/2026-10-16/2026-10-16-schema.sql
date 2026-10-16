-- =====================================================================
-- HRMS database changes - 2026-10-16
-- ---------------------------------------------------------------------
-- Feature 2 (ESS <-> ERM document-request loop):
--     * new table  ess_request_attachments
--     * new table  ess_request_status_histories
-- Feature 1 (Employee Records provenance):
--     * new columns on employee_documents:
--         source_type, source_id, original_name, source_hash
--     * new index  idx_employee_documents_source
--
-- This file is the single-batch ("isang bagsakan") SQL equivalent of the
-- three Laravel migrations in ./migrations/. Use it ONLY on databases where
-- you cannot run `php artisan migrate`.
--
-- CHOOSE ONE PATH:
--   (A) Recommended: deploy the code, then run  php artisan migrate --force
--   (B) Run this whole file directly.
--
-- This file is idempotent and, at the end, registers the 3 migrations in the
-- `migrations` table - so if you later run `php artisan migrate`, it will NOT
-- try to re-create them. Running (A) then (B), or (B) then (A), is safe.
--
-- Assumes the base tables already exist:
--   ess_requests, system_users, employees, employee_documents, migrations
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) ess_request_attachments
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ess_request_attachments` (
  `ess_request_attachment_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `ess_request_id` bigint(20) unsigned NOT NULL,
  `direction` varchar(20) NOT NULL DEFAULT 'employee',
  `file_path` text NOT NULL,
  `original_name` varchar(255) DEFAULT NULL,
  `mime_type` varchar(120) DEFAULT NULL,
  `file_size_bytes` bigint(20) unsigned DEFAULT NULL,
  `uploaded_by_user_id` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`ess_request_attachment_id`),
  KEY `idx_ess_request_attachments_request_id` (`ess_request_id`),
  KEY `idx_ess_request_attachments_direction` (`direction`),
  KEY `fk_ess_request_attachments_uploader` (`uploaded_by_user_id`),
  CONSTRAINT `fk_ess_request_attachments_request_id`
    FOREIGN KEY (`ess_request_id`) REFERENCES `ess_requests` (`ess_request_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ess_request_attachments_uploader`
    FOREIGN KEY (`uploaded_by_user_id`) REFERENCES `system_users` (`system_user_id`),
  CONSTRAINT `chk_ess_request_attachments_direction` CHECK (`direction` in ('employee','hr'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ---------------------------------------------------------------------
-- 2) ess_request_status_histories
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ess_request_status_histories` (
  `ess_request_status_history_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `ess_request_id` bigint(20) unsigned NOT NULL,
  `status` varchar(30) NOT NULL,
  `actor_user_id` bigint(20) unsigned DEFAULT NULL,
  `note` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`ess_request_status_history_id`),
  KEY `idx_ess_request_status_histories_request_id` (`ess_request_id`),
  KEY `idx_ess_request_status_histories_status` (`status`),
  KEY `fk_ess_request_status_histories_actor` (`actor_user_id`),
  CONSTRAINT `fk_ess_request_status_histories_actor`
    FOREIGN KEY (`actor_user_id`) REFERENCES `system_users` (`system_user_id`),
  CONSTRAINT `fk_ess_request_status_histories_request_id`
    FOREIGN KEY (`ess_request_id`) REFERENCES `ess_requests` (`ess_request_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ---------------------------------------------------------------------
-- 3) employee_documents provenance columns
--    (MySQL 8 has no "ADD COLUMN IF NOT EXISTS", so we guard with
--     information_schema + prepared statements to stay idempotent.)
-- ---------------------------------------------------------------------
SET @has_col := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'employee_documents'
    AND COLUMN_NAME = 'source_type'
);
SET @ddl := IF(@has_col = 0,
  'ALTER TABLE `employee_documents`
      ADD COLUMN `source_type` varchar(30) DEFAULT NULL AFTER `category`,
      ADD COLUMN `source_id` bigint(20) unsigned DEFAULT NULL AFTER `source_type`,
      ADD COLUMN `original_name` varchar(255) DEFAULT NULL AFTER `source_id`,
      ADD COLUMN `source_hash` varchar(128) DEFAULT NULL AFTER `original_name`',
  'SELECT ''employee_documents provenance columns already present'' AS notice');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_idx := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'employee_documents'
    AND INDEX_NAME = 'idx_employee_documents_source'
);
SET @ddl := IF(@has_idx = 0,
  'CREATE INDEX `idx_employee_documents_source` ON `employee_documents` (`source_type`, `source_id`)',
  'SELECT ''idx_employee_documents_source already present'' AS notice');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;


-- ---------------------------------------------------------------------
-- 4) register the 3 migrations (so artisan never re-runs them)
-- ---------------------------------------------------------------------
SET @next_batch := (SELECT COALESCE(MAX(`batch`), 0) + 1 FROM `migrations`);

INSERT INTO `migrations` (`migration`, `batch`)
SELECT '2026_10_16_000001_create_ess_request_attachments_table', @next_batch
FROM (SELECT 1) AS dummy
WHERE NOT EXISTS (SELECT 1 FROM `migrations`
  WHERE `migration` = '2026_10_16_000001_create_ess_request_attachments_table');

INSERT INTO `migrations` (`migration`, `batch`)
SELECT '2026_10_16_000002_create_ess_request_status_histories_table', @next_batch
FROM (SELECT 1) AS dummy
WHERE NOT EXISTS (SELECT 1 FROM `migrations`
  WHERE `migration` = '2026_10_16_000002_create_ess_request_status_histories_table');

INSERT INTO `migrations` (`migration`, `batch`)
SELECT '2026_10_16_000003_add_provenance_to_employee_documents_table', @next_batch
FROM (SELECT 1) AS dummy
WHERE NOT EXISTS (SELECT 1 FROM `migrations`
  WHERE `migration` = '2026_10_16_000003_add_provenance_to_employee_documents_table');


-- ---------------------------------------------------------------------
-- 5) verify (optional)
-- ---------------------------------------------------------------------
SELECT `migration`, `batch` FROM `migrations` WHERE `migration` LIKE '2026_10_16_%' ORDER BY `id`;
