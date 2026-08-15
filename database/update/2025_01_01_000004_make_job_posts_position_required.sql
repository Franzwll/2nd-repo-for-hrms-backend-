-- ============================================================================
-- 2025_01_01_000004_make_job_posts_position_required
-- Manual MySQL migration (run this against the hotel_hr database).
-- Mirrors the Laravel migration:
--   Modules/RecruitmentManagement/database/migrations/2025_01_01_000004_make_job_posts_position_required.php
-- Purpose: job_posts.title and job_posts.slug must refer to the linked
--          Core HR position (positions.title) via job_posts.position_id,
--          and position_id becomes required.
-- ============================================================================

-- 1) Backfill rows missing a position by matching the legacy free-text title
UPDATE `job_posts` jp
JOIN `positions` p ON p.title = jp.title
SET jp.position_id = p.position_id
WHERE jp.position_id IS NULL;

-- 2) Remove rows that still have no position (no match in positions.title).
--    A job post without a position cannot derive title/slug anymore.
--    Review the ids first: SELECT * FROM job_posts WHERE position_id IS NULL;
DELETE FROM `job_posts` WHERE `position_id` IS NULL;

-- 3) Sync title from the linked position so it always equals position.title
UPDATE `job_posts` jp
JOIN `positions` p ON p.position_id = jp.position_id
SET jp.title = p.title
WHERE jp.title <> p.title;

-- 4) Regenerate slug from the position title (basic slug: lowercase, spaces
--    to dashes; collisions get a numeric suffix like `bartender-1`)
UPDATE `job_posts` jp
JOIN `positions` p ON p.position_id = jp.position_id
SET jp.slug = CASE
    WHEN NOT EXISTS (
        SELECT 1 FROM `job_posts` j2
        WHERE j2.slug = LOWER(REPLACE(p.title, ' ', '-'))
          AND j2.job_post_id <> jp.job_post_id
    ) THEN LOWER(REPLACE(p.title, ' ', '-'))
    ELSE CONCAT(LOWER(REPLACE(p.title, ' ', '-')), '-1')
END
WHERE jp.slug <> LOWER(REPLACE(p.title, ' ', '-'));

-- 5) Make position_id required at the schema level
ALTER TABLE `job_posts`
    MODIFY `position_id` BIGINT UNSIGNED NOT NULL;

-- Verification queries:
--   SELECT jp.job_post_id, jp.slug, jp.title, jp.position_id FROM job_posts jp;
--   SELECT COUNT(*) FROM job_posts WHERE position_id IS NULL; -- must be 0