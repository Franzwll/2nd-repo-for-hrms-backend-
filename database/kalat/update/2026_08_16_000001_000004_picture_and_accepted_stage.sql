-- ============================================================================
-- 2026_08_16_000001_add_picture_to_job_posts
-- 2026_08_16_000004_add_accepted_to_applicants_stage_check
-- Manual MySQL migration (run this against the hotel_hr database).
-- Mirrors the Laravel migrations:
--   Modules/RecruitmentManagement/database/migrations/2026_08_16_000001_add_picture_to_job_posts_table.php
--   Modules/ApplicantManagement/database/migrations/2026_08_16_000004_add_accepted_to_applicants_stage_check.php
-- Purpose: job posts can carry a poster image (public disk), and applicants
--          can be moved to the new 'Accepted' stage (interview scheduling
--          eligibility is now stage-based).
-- ============================================================================

-- 1) Add poster image column to job_posts (after benefits_json)
ALTER TABLE `job_posts`
  ADD COLUMN `picture` VARCHAR(255) NULL AFTER `benefits_json`;

-- 2) Allow the new 'Accepted' stage by re-creating the applicants stage check
--    (DROP CONSTRAINT works on MariaDB 10.2+ and MySQL 8.0.19+; plain
--    DROP CHECK is MariaDB-incompatible, which silently left the old check)
ALTER TABLE `applicants`
  DROP CONSTRAINT chk_applicants_stage;

ALTER TABLE `applicants`
  ADD CONSTRAINT chk_applicants_stage
    CHECK (`stage` IN ('Screened', 'Interview Scheduled', 'Assessed', 'Offer', 'Hired', 'Rejected', 'Accepted'));