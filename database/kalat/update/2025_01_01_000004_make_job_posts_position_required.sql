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

-- 6) Apply the updated job_posts seed data (ids 1-6; matches
--    hotel_hr_seed_mysql.sql rev 2.3). Upsert so databases that were seeded
--    before this change converge on the same position_id/title/slug as a
--    fresh seed.
INSERT INTO `job_posts` (
  `job_post_id`, `slug`, `title`, `department_id`, `position_id`, `employment_type`, `schedule`,
  `salary_min`, `salary_max`, `vacancies`, `filled_count`, `posted_date`, `status`, `active`,
  `experience_level`, `education_level`, `summary`, `description`,
  `responsibilities_json`, `qualifications_json`, `skills_json`, `benefits_json`
) VALUES
(1, 'front-desk-receptionist', 'Front Desk Receptionist', 1, 1, 'Full-time', 'Shifting Schedule', 18000.00, 22000.00, 3, 1, '2026-05-22', 'Open', 1, '1-2 Years', 'Bachelor''s Degree',
 'Welcome guests, manage reservations, answer inquiries, and provide excellent customer service.',
 'We are looking for a friendly and professional Front Desk Receptionist to welcome guests, manage reservations, answer inquiries, and provide excellent customer service. The ideal candidate should have strong communication skills and be able to work in a fast-paced environment.',
 '["Welcome and assist hotel guests.","Process check-in and check-out procedures.","Manage room reservations.","Handle guest inquiries and complaints professionally.","Coordinate with housekeeping and other departments.","Answer phone calls and emails."]',
 '["Bachelor''s degree or College level in Hospitality Management or related field.","Excellent communication and interpersonal skills.","Basic computer skills.","Customer service experience is an advantage.","Willing to work shifts, weekends, and holidays."]',
 '["Customer Service","Communication","Hotel Operations","Problem Solving","Time Management"]',
 '["HMO","Service Charge","Paid Leave","Meal Allowance","Career Growth"]'),
(2, 'line-cook', 'Line Cook', 3, 5, 'Full-time', 'Shifting Schedule', 16000.00, 20000.00, 4, 2, '2026-05-18', 'Open', 1, '1-2 Years', 'Vocational / TESDA',
 'Prepare and cook menu items to standard, maintain station cleanliness and food safety compliance.',
 'The Line Cook prepares and plates dishes according to Oxford Suites Makati recipes and standards, maintains a clean and organized station, and observes HACCP food-safety practices at all times.',
 '["Prepare mise en place before each service.","Cook and plate dishes to recipe standards.","Maintain sanitation and food-safety compliance.","Monitor inventory levels of station ingredients.","Support banquet and room-service volume peaks."]',
 '["TESDA NC II in Cookery or equivalent culinary training.","At least 1 year in a hotel or full-service restaurant kitchen.","Valid food handler''s certificate.","Able to work under pressure during peak service."]',
 '["Food Safety","HACCP","Knife Skills","Plating","Teamwork"]',
 '["HMO","Service Charge","Meal Allowance","Uniform","Training"]'),
(3, 'housekeeping-attendant', 'Housekeeping Attendant', 4, 7, 'Full-time', 'Shifting Schedule', 14000.00, 17000.00, 5, 3, '2026-05-10', 'Open', 1, 'No Experience', 'High School Graduate',
 'Maintain guestroom cleanliness, linen turnover, and public-area presentation to brand standards.',
 'Housekeeping Attendants keep guestrooms and public areas immaculate, restock amenities, and report maintenance issues. Full training is provided for applicants with no prior hotel experience.',
 '["Clean and prepare assigned guestrooms daily.","Replenish linens, towels, and amenities.","Report maintenance and lost-and-found items.","Maintain housekeeping cart and supplies."]',
 '["High School Graduate.","Physically fit and detail-oriented.","Willing to work shifts including weekends and holidays."]',
 '["Attention to Detail","Time Management","Room Turnover","Safety"]',
 '["HMO","Service Charge","Meal Allowance","Uniform"]'),
(4, 'restaurant-server', 'Restaurant Server', 2, 3, 'Full-time', 'Shifting Schedule', 15000.00, 18000.00, 4, 1, '2026-05-20', 'Open', 1, 'No Experience', 'High School Graduate',
 'Deliver warm, accurate table service across the dining room and banquet operations.',
 'Restaurant Servers take orders, serve food and beverages, and ensure every guest leaves with a memorable dining experience at our all-day dining outlet.',
 '["Greet and seat guests warmly.","Take and relay orders accurately to the kitchen.","Serve food and beverages following service sequence.","Handle billing and guest feedback."]',
 '["High School Graduate; hospitality training an advantage.","Good communication skills in English and Filipino.","Pleasant personality and grooming."]',
 '["Guest Service","Upselling","POS Systems","Communication"]',
 '["HMO","Service Charge","Meal Allowance","Tips"]'),
(5, 'bartender', 'Bartender', 2, 4, 'Part-time', 'Night Shift', 16000.00, 19000.00, 2, 0, '2026-05-15', 'Open', 1, '3-5 Years', 'Vocational / TESDA',
 'Craft classic and signature cocktails for the lobby lounge and rooftop bar.',
 'The Bartender prepares beverages to recipe, manages bar inventory, and creates a lively yet refined guest experience at the lounge.',
 '["Prepare cocktails and beverages to standard.","Maintain bar cleanliness and inventory.","Engage guests and recommend pairings.","Observe responsible alcohol service."]',
 '["TESDA Bartending NC II or equivalent.","At least 3 years bar experience in hotels or restaurants.","Knowledge of classic and modern mixology."]',
 '["Mixology","Inventory Control","Guest Engagement","Cash Handling"]',
 '["HMO","Service Charge","Meal Allowance","Night Differential"]'),
(6, 'hr-assistant', 'HR Assistant', 5, 8, 'Full-time', 'Day Shift', 20000.00, 25000.00, 1, 0, '2026-05-08', 'Open', 0, '1-2 Years', 'Bachelor''s Degree',
 'Support recruitment, employee records, and HR document processing.',
 'The HR Assistant supports end-to-end recruitment coordination, 201-file maintenance, and employee request processing for the property.',
 '["Coordinate interview schedules with department heads.","Maintain complete and accurate 201 files.","Process COE and employment verification requests.","Assist in new-hire onboarding documentation."]',
 '["Bachelor''s degree in Psychology, HR, or related field.","At least 1 year HR experience.","Strong organizational and documentation skills."]',
 '["Recruitment","Documentation","MS Office","Confidentiality"]',
 '["HMO","Paid Leave","Career Growth","Training"]')
ON DUPLICATE KEY UPDATE
  `slug` = VALUES(`slug`),
  `title` = VALUES(`title`),
  `department_id` = VALUES(`department_id`),
  `position_id` = VALUES(`position_id`),
  `employment_type` = VALUES(`employment_type`),
  `schedule` = VALUES(`schedule`),
  `salary_min` = VALUES(`salary_min`),
  `salary_max` = VALUES(`salary_max`),
  `vacancies` = VALUES(`vacancies`),
  `filled_count` = VALUES(`filled_count`),
  `posted_date` = VALUES(`posted_date`),
  `status` = VALUES(`status`),
  `active` = VALUES(`active`),
  `experience_level` = VALUES(`experience_level`),
  `education_level` = VALUES(`education_level`),
  `summary` = VALUES(`summary`),
  `description` = VALUES(`description`),
  `responsibilities_json` = VALUES(`responsibilities_json`),
  `qualifications_json` = VALUES(`qualifications_json`),
  `skills_json` = VALUES(`skills_json`),
  `benefits_json` = VALUES(`benefits_json`);

-- Verification queries:
--   SELECT jp.job_post_id, jp.slug, jp.title, jp.position_id FROM job_posts jp;
--   SELECT COUNT(*) FROM job_posts WHERE position_id IS NULL; -- must be 0