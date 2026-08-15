-- ============================================================================
-- Hotel & Restaurant HR1 - Final Database Schema (MySQL 8.0+)
-- Revision: 2.3 (rev 2.2 + job_posts.position_id required). 42 tables.
-- Source of truth: frontend/src of Hotel-and-Restaurant-HR1 (data + workflow
-- analysis) and docs/hotel_hr_database_audit_report.md.
-- Change summary vs revision 1.0 (37 tables):
--   MERGE  : system_permissions + system_role_permissions -> role_permissions
--   ADD    : applicant_assessments, checklist_requests, ess_categories
--   MODIFY : employees, positions, employee_position_history,
--            employee_documents, requisitions, ess_requests,
--            performance_reviews, hr3_recommendations, system_users,
--            audit_logs, announcements
-- Change summary vs revision 2.0 (39 tables):
--   ADD    : notifications, user_login_activity, payroll_periods
--   MODIFY : payroll_records (nullable payroll_period_id FK)
-- Change summary vs revision 2.2 (42 tables):
--   MODIFY : job_posts (position_id NOT NULL; title and slug always derive
--            from the linked Core HR position title via position_id)
-- ============================================================================

-- Self-contained: create the database if missing, then switch to it.
-- Safe to re-run (IF NOT EXISTS).
CREATE DATABASE IF NOT EXISTS `hotel_hr`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE `hotel_hr`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=0;

-- ---------------------------------------------------------------------------
-- Domain 1: Organization & Core HCM
-- ---------------------------------------------------------------------------

CREATE TABLE `departments` (
  `department_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `code` VARCHAR(30) NOT NULL UNIQUE,
  `name` VARCHAR(120) NOT NULL UNIQUE,
  `description` TEXT NULL,
  `head_employee_id` BIGINT UNSIGNED NULL,
  `budget` DECIMAL(14,2) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`department_id`),
  KEY `idx_departments_head_employee_id` (`head_employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `salary_grades` (
  `salary_grade_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `code` VARCHAR(30) NOT NULL UNIQUE,
  `title` VARCHAR(120) NOT NULL,
  `min_salary` DECIMAL(12,2) NOT NULL,
  `max_salary` DECIMAL(12,2) NOT NULL,
  `currency_code` CHAR(3) NOT NULL DEFAULT 'PHP',
  `level` VARCHAR(30) NOT NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`salary_grade_id`),
  CONSTRAINT chk_salary_grades_level CHECK (`level` IN ('Rank & File', 'Supervisory', 'Managerial', 'Executive'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `positions` (
  `position_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `position_code` VARCHAR(30) NOT NULL UNIQUE,
  `title` VARCHAR(150) NOT NULL,
  `department_id` BIGINT UNSIGNED NOT NULL,
  `salary_grade_id` BIGINT UNSIGNED NULL,
  `level` VARCHAR(30) NOT NULL,
  `headcount` INT NOT NULL DEFAULT 0,
  -- NOTE: `filled_count` is a derived counter; maintain it in the same
  -- transaction as applicant->new_hire conversion (see PRD Section 11).
  `filled_count` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`position_id`),
  KEY `idx_positions_department_id` (`department_id`),
  KEY `idx_positions_salary_grade_id` (`salary_grade_id`),
  CONSTRAINT chk_positions_level CHECK (`level` IN ('Rank & File', 'Supervisory', 'Managerial', 'Executive'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `employees` (
  `employee_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `employee_code` VARCHAR(40) NOT NULL UNIQUE,
  `first_name` VARCHAR(80) NOT NULL,
  `middle_name` VARCHAR(80) NULL,
  `last_name` VARCHAR(80) NOT NULL,
  `email` VARCHAR(190) NOT NULL UNIQUE,
  `personal_email` VARCHAR(190) NULL,
  `phone` VARCHAR(40) NULL,
  `address` TEXT NULL,
  `birth_date` DATE NULL,
  `gender` VARCHAR(20) NULL,
  `civil_status` VARCHAR(20) NULL,
  `nationality` VARCHAR(60) NULL,
  `sss_number` VARCHAR(30) NULL,
  `philhealth_number` VARCHAR(30) NULL,
  `pagibig_number` VARCHAR(30) NULL,
  `tin_number` VARCHAR(30) NULL,
  `position_id` BIGINT UNSIGNED NOT NULL,
  `department_id` BIGINT UNSIGNED NOT NULL,
  `employment_type` VARCHAR(30) NOT NULL,
  -- NOTE: derived counter `onboarding_complete` is set by the service layer when
  -- the last employee_onboarding_items row completes (see PRD Section 11).
  `date_hired` DATE NOT NULL,
  `supervisor_employee_id` BIGINT UNSIGNED NULL,
  `status` VARCHAR(30) NOT NULL,
  `onboarding_complete` TINYINT(1) NOT NULL DEFAULT FALSE,
  `salary_grade_id` BIGINT UNSIGNED NULL,
  `employee_record_last_updated_at` DATE NULL,
  `salary_step` VARCHAR(30) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`employee_id`),
  KEY `idx_employees_department_id` (`department_id`),
  KEY `idx_employees_position_id` (`position_id`),
  KEY `idx_employees_salary_grade_id` (`salary_grade_id`),
  KEY `idx_employees_supervisor_employee_id` (`supervisor_employee_id`),
  KEY `idx_employees_status` (`status`),
  KEY `idx_employees_date_hired` (`date_hired`),
  CONSTRAINT chk_employees_employment_type CHECK (`employment_type` IN ('Regular', 'Probationary', 'Contractual')),
  CONSTRAINT chk_employees_status CHECK (`status` IN ('Active', 'Probationary', 'Regular', 'Promoted', 'Resigned', 'Retired', 'Terminated', 'Inactive')),
  CONSTRAINT chk_employees_gender CHECK (`gender` IS NULL OR `gender` IN ('Male', 'Female')),
  CONSTRAINT chk_employees_civil_status CHECK (`civil_status` IS NULL OR `civil_status` IN ('Single', 'Married', 'Widowed', 'Separated', 'Divorced'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `employee_emergency_contacts` (
  `emergency_contact_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `employee_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(160) NOT NULL,
  `relationship` VARCHAR(80) NULL,
  `phone` VARCHAR(40) NULL,
  `address` TEXT NULL,
  `is_primary` TINYINT(1) NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`emergency_contact_id`),
  KEY `idx_employee_emergency_contacts_employee_id` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `employee_position_history` (
  `position_history_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `employee_id` BIGINT UNSIGNED NOT NULL,
  `effective_date` DATE NOT NULL,
  `change_type` VARCHAR(30) NOT NULL DEFAULT 'Employment',
  `old_position_id` BIGINT UNSIGNED NULL,
  `new_position_id` BIGINT UNSIGNED NULL,
  `old_salary_grade_id` BIGINT UNSIGNED NULL,
  `new_salary_grade_id` BIGINT UNSIGNED NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`position_history_id`),
  KEY `idx_employee_position_history_employee_id` (`employee_id`),
  KEY `idx_employee_position_history_old_position_id` (`old_position_id`),
  KEY `idx_employee_position_history_new_position_id` (`new_position_id`),
  KEY `idx_employee_position_history_old_salary_grade_id` (`old_salary_grade_id`),
  KEY `idx_employee_position_history_new_salary_grade_id` (`new_salary_grade_id`),
  CONSTRAINT chk_employee_position_history_change_type CHECK (`change_type` IN ('Employment', 'Promotion', 'Transfer'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `employee_exit_records` (
  `exit_record_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `employee_id` BIGINT UNSIGNED NOT NULL UNIQUE,
  `exit_type` VARCHAR(30) NOT NULL,
  `exit_date` DATE NOT NULL,
  `clearance_status` VARCHAR(20) NOT NULL,
  `coe_status` VARCHAR(20) NOT NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`exit_record_id`),
  KEY `idx_employee_exit_records_employee_id` (`employee_id`),
  CONSTRAINT chk_employee_exit_records_exit_type CHECK (`exit_type` IN ('Resigned', 'Retired', 'Terminated')),
  CONSTRAINT chk_employee_exit_records_clearance_status CHECK (`clearance_status` IN ('Pending', 'Cleared')),
  CONSTRAINT chk_employee_exit_records_coe_status CHECK (`coe_status` IN ('Pending', 'Issued'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `employee_documents` (
  `document_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `employee_id` BIGINT UNSIGNED NOT NULL,
  `document_code` VARCHAR(50) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `category` VARCHAR(80) NOT NULL,
  `file_path` TEXT NULL,
  `mime_type` VARCHAR(100) NULL,
  `file_size_bytes` BIGINT UNSIGNED NULL,
  `document_status` VARCHAR(30) NOT NULL,
  `document_date` DATE NULL,
  `expiry_date` DATE NULL,
  `last_updated_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`document_id`),
  UNIQUE KEY `uq_employee_documents_natural` (`employee_id`, `document_code`),
  KEY `idx_employee_documents_category` (`category`),
  KEY `idx_employee_documents_document_status` (`document_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Domain 2: Recruitment (job publishing, applications, screening, interviews,
-- assessments)
-- ---------------------------------------------------------------------------

CREATE TABLE `job_posts` (
  `job_post_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `slug` VARCHAR(120) NOT NULL UNIQUE,
  `title` VARCHAR(150) NOT NULL,
  `department_id` BIGINT UNSIGNED NOT NULL,
  -- NOTE: required FK to the Core HR position. `title` and `slug` always
  -- derive from the linked position's title (positions.title) so they can
  -- never drift out of sync with the Job Post Builder dropdown.
  `position_id` BIGINT UNSIGNED NOT NULL,
  `employment_type` VARCHAR(30) NOT NULL,
  `schedule` VARCHAR(120) NULL,
  `salary_min` DECIMAL(12,2) NULL,
  `salary_max` DECIMAL(12,2) NULL,
  `vacancies` INT NOT NULL DEFAULT 1,
  -- NOTE: `filled_count` is a derived counter; maintain it in the same
  -- transaction as applicant->new_hire conversion (see PRD Section 11).
  `filled_count` INT NOT NULL DEFAULT 0,
  `posted_date` DATE NULL,
  `status` VARCHAR(20) NOT NULL,
  `active` TINYINT(1) NOT NULL DEFAULT TRUE,
  `experience_level` VARCHAR(50) NULL,
  `education_level` VARCHAR(100) NULL,
  `summary` TEXT NULL,
  `description` TEXT NULL,
  `responsibilities_json` JSON NULL,
  `qualifications_json` JSON NULL,
  `skills_json` JSON NULL,
  `benefits_json` JSON NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`job_post_id`),
  KEY `idx_job_posts_department_id` (`department_id`),
  KEY `idx_job_posts_position_id` (`position_id`),
  KEY `idx_job_posts_status_active` (`status`, `active`),
  CONSTRAINT chk_job_posts_status CHECK (`status` IN ('Open', 'Closed', 'Draft')),
  CONSTRAINT chk_job_posts_employment_type CHECK (`employment_type` IN ('Full-time', 'Part-time', 'Contract', 'Seasonal')),
  CONSTRAINT chk_job_posts_experience_level CHECK (`experience_level` IS NULL OR `experience_level` IN ('No Experience', '1-2 Years', '3-5 Years', '5+ Years')),
  CONSTRAINT chk_job_posts_education_level CHECK (`education_level` IS NULL OR `education_level` IN ('High School Graduate', 'Vocational / TESDA', 'College Level', 'Bachelor''s Degree'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `job_post_platforms` (
  `job_post_platform_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `job_post_id` BIGINT UNSIGNED NOT NULL,
  `platform` VARCHAR(60) NOT NULL,
  `published_at` TIMESTAMP NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'published',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`job_post_platform_id`),
  UNIQUE KEY `uq_job_post_platforms_natural` (`job_post_id`, `platform`),
  CONSTRAINT chk_job_post_platforms_status CHECK (`status` IN ('published', 'unpublished'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `applicants` (
  `applicant_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `applicant_code` VARCHAR(40) NOT NULL UNIQUE,
  `job_post_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(160) NOT NULL,
  `email` VARCHAR(190) NOT NULL,
  `phone` VARCHAR(40) NULL,
  `applied_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fit_score` DECIMAL(5,2) NULL,
  `status` VARCHAR(30) NOT NULL,
  `stage` VARCHAR(40) NOT NULL,
  `source` VARCHAR(60) NULL,
  `resume_file_path` TEXT NULL,
  `summary` TEXT NULL,
  `flags_json` JSON NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`applicant_id`),
  KEY `idx_applicants_job_post_id` (`job_post_id`),
  KEY `idx_applicants_status` (`status`),
  KEY `idx_applicants_stage` (`stage`),
  KEY `idx_applicants_applied_at` (`applied_at`),
  CONSTRAINT chk_applicants_status CHECK (`status` IN ('fit', 'other-role', 'credential', 'not-fit')),
  CONSTRAINT chk_applicants_stage CHECK (`stage` IN ('Screened', 'Interview Scheduled', 'Assessed', 'Offer', 'Hired', 'Rejected'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `applicant_screening_entities` (
  `entity_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `applicant_id` BIGINT UNSIGNED NOT NULL,
  `label` VARCHAR(80) NOT NULL,
  `value` TEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`entity_id`),
  KEY `idx_applicant_screening_entities_applicant_id` (`applicant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `applicant_screening_scores` (
  `score_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `applicant_id` BIGINT UNSIGNED NOT NULL,
  `criterion` VARCHAR(120) NOT NULL,
  `score` DECIMAL(5,2) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`score_id`),
  KEY `idx_applicant_screening_scores_applicant_id` (`applicant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `interviews` (
  `interview_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `interview_code` VARCHAR(40) NOT NULL UNIQUE,
  `applicant_id` BIGINT UNSIGNED NOT NULL,
  `scheduled_date` DATE NOT NULL,
  `scheduled_time` TIME NOT NULL,
  `mode` VARCHAR(20) NOT NULL,
  `interviewer_employee_id` BIGINT UNSIGNED NULL,
  `interviewer_name` VARCHAR(160) NULL,
  `status` VARCHAR(20) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`interview_id`),
  KEY `idx_interviews_applicant_id` (`applicant_id`),
  KEY `idx_interviews_interviewer_employee_id` (`interviewer_employee_id`),
  KEY `idx_interviews_scheduled_date` (`scheduled_date`),
  CONSTRAINT chk_interviews_mode CHECK (`mode` IN ('On-site', 'Virtual')),
  CONSTRAINT chk_interviews_status CHECK (`status` IN ('Scheduled', 'Completed', 'No Show'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `applicant_assessments` (
  `assessment_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `applicant_id` BIGINT UNSIGNED NOT NULL,
  `assessor_user_id` BIGINT UNSIGNED NULL,
  `assessment_date` DATE NOT NULL,
  `scores_json` JSON NULL,
  `total_score` DECIMAL(5,2) NULL,
  `outcome` VARCHAR(20) NOT NULL,
  `remarks` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`assessment_id`),
  KEY `idx_applicant_assessments_applicant_id` (`applicant_id`),
  KEY `idx_applicant_assessments_assessor_user_id` (`assessor_user_id`),
  CONSTRAINT chk_applicant_assessments_outcome CHECK (`outcome` IN ('Recommended', 'Hold', 'Not Recommended'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Domain 3: Hiring & Onboarding (requisitions, new hires, checklists)
-- ---------------------------------------------------------------------------

CREATE TABLE `requisitions` (
  `requisition_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `requisition_code` VARCHAR(40) NOT NULL UNIQUE,
  `position_id` BIGINT UNSIGNED NULL,
  `position_title` VARCHAR(150) NULL,
  `department_id` BIGINT UNSIGNED NOT NULL,
  `requested_by_user_id` BIGINT UNSIGNED NULL,
  `requested_count` INT NOT NULL,
  `urgency` VARCHAR(20) NOT NULL,
  `justification` TEXT NOT NULL,
  `status` VARCHAR(20) NOT NULL,
  `requested_at` DATE NOT NULL,
  `converted_job_post_id` BIGINT UNSIGNED NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`requisition_id`),
  KEY `idx_requisitions_position_id` (`position_id`),
  KEY `idx_requisitions_department_id` (`department_id`),
  KEY `idx_requisitions_requested_by_user_id` (`requested_by_user_id`),
  KEY `idx_requisitions_converted_job_post_id` (`converted_job_post_id`),
  KEY `idx_requisitions_status` (`status`),
  KEY `idx_requisitions_requested_at` (`requested_at`),
  CONSTRAINT chk_requisitions_urgency CHECK (`urgency` IN ('Normal', 'High', 'Urgent', 'Low')),
  CONSTRAINT chk_requisitions_status CHECK (`status` IN ('Pending', 'Done', 'Converted'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `new_hires` (
  `new_hire_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `new_hire_code` VARCHAR(40) NOT NULL UNIQUE,
  `applicant_id` BIGINT UNSIGNED NULL,
  `employee_id` BIGINT UNSIGNED NULL,
  `name` VARCHAR(160) NOT NULL,
  `email` VARCHAR(190) NULL,
  `phone` VARCHAR(40) NULL,
  `position_id` BIGINT UNSIGNED NULL,
  `department_id` BIGINT UNSIGNED NULL,
  `stage` VARCHAR(30) NOT NULL,
  `start_date` DATE NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`new_hire_id`),
  KEY `idx_new_hires_applicant_id` (`applicant_id`),
  KEY `idx_new_hires_employee_id` (`employee_id`),
  KEY `idx_new_hires_position_id` (`position_id`),
  KEY `idx_new_hires_department_id` (`department_id`),
  KEY `idx_new_hires_stage` (`stage`),
  CONSTRAINT chk_new_hires_stage CHECK (`stage` IN ('Pre-onboarding', 'Probationary', 'Regular'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `onboarding_checklist_templates` (
  `template_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `template_code` VARCHAR(40) NOT NULL UNIQUE,
  `title` VARCHAR(200) NOT NULL,
  `phase` VARCHAR(30) NOT NULL,
  `position_scope_json` JSON NULL,
  `status` VARCHAR(20) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`template_id`),
  CONSTRAINT chk_onboarding_checklist_templates_phase CHECK (`phase` IN ('Pre-onboarding', 'Onboarding', 'Probationary', 'Regular')),
  CONSTRAINT chk_onboarding_checklist_templates_status CHECK (`status` IN ('Active', 'Inactive'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `onboarding_checklist_items` (
  `template_item_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `template_id` BIGINT UNSIGNED NOT NULL,
  `item_text` TEXT NOT NULL,
  `sort_order` INT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`template_item_id`),
  KEY `idx_onboarding_checklist_items_template_id` (`template_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `employee_onboarding_items` (
  `employee_onboarding_item_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `employee_id` BIGINT UNSIGNED NOT NULL,
  `new_hire_id` BIGINT UNSIGNED NULL,
  `template_item_id` BIGINT UNSIGNED NULL,
  `item_text` TEXT NOT NULL,
  `done` TINYINT(1) NOT NULL DEFAULT FALSE,
  `completed_at` TIMESTAMP NULL,
  `completed_by_user_id` BIGINT UNSIGNED NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`employee_onboarding_item_id`),
  KEY `idx_employee_onboarding_items_employee_id` (`employee_id`),
  KEY `idx_employee_onboarding_items_new_hire_id` (`new_hire_id`),
  KEY `idx_employee_onboarding_items_template_item_id` (`template_item_id`),
  KEY `idx_employee_onboarding_items_completed_by_user_id` (`completed_by_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `checklist_requests` (
  `checklist_request_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `request_code` VARCHAR(40) NOT NULL UNIQUE,
  `employee_id` BIGINT UNSIGNED NOT NULL,
  `template_id` BIGINT UNSIGNED NULL,
  `phase` VARCHAR(30) NOT NULL,
  `items_json` JSON NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'Pending',
  `requested_by_user_id` BIGINT UNSIGNED NULL,
  `requested_at` DATE NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`checklist_request_id`),
  KEY `idx_checklist_requests_employee_id` (`employee_id`),
  KEY `idx_checklist_requests_template_id` (`template_id`),
  KEY `idx_checklist_requests_requested_by_user_id` (`requested_by_user_id`),
  KEY `idx_checklist_requests_status` (`status`),
  CONSTRAINT chk_checklist_requests_phase CHECK (`phase` IN ('Pre-onboarding', 'Probationary', 'Regular')),
  CONSTRAINT chk_checklist_requests_status CHECK (`status` IN ('Pending', 'Approved', 'Rejected', 'Completed'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Domain 4: Employee Self-Service (categories, requests, attendance,
-- schedules, leave)
-- ---------------------------------------------------------------------------

CREATE TABLE `ess_categories` (
  `ess_category_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `code` VARCHAR(40) NOT NULL UNIQUE,
  `name` VARCHAR(120) NOT NULL,
  `description` TEXT NULL,
  `is_open` TINYINT(1) NOT NULL DEFAULT TRUE,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ess_category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ess_requests` (
  `ess_request_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `request_code` VARCHAR(40) NOT NULL UNIQUE,
  `employee_id` BIGINT UNSIGNED NOT NULL,
  `category_id` BIGINT UNSIGNED NULL,
  `request_type` VARCHAR(100) NOT NULL,
  `filed_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `date_from` DATE NULL,
  `date_to` DATE NULL,
  `status` VARCHAR(30) NOT NULL,
  `assigned_to_user_id` BIGINT UNSIGNED NULL,
  `details` TEXT NULL,
  `review_note` TEXT NULL,
  `returned_count` INT NOT NULL DEFAULT 0,
  `attachment_path` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ess_request_id`),
  KEY `idx_ess_requests_employee_id` (`employee_id`),
  KEY `idx_ess_requests_category_id` (`category_id`),
  KEY `idx_ess_requests_assigned_to_user_id` (`assigned_to_user_id`),
  KEY `idx_ess_requests_status` (`status`),
  KEY `idx_ess_requests_filed_at` (`filed_at`),
  CONSTRAINT chk_ess_requests_status CHECK (`status` IN ('Pending', 'Under Review', 'Approved', 'Rejected', 'Completed'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `leave_balances` (
  `leave_balance_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `employee_id` BIGINT UNSIGNED NOT NULL,
  `leave_type` VARCHAR(80) NOT NULL,
  `period_year` SMALLINT NOT NULL,
  `total_days` DECIMAL(6,2) NOT NULL DEFAULT 0,
  `used_days` DECIMAL(6,2) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`leave_balance_id`),
  UNIQUE KEY `uq_leave_balances_natural` (`employee_id`, `leave_type`, `period_year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `attendance_records` (
  `attendance_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `employee_id` BIGINT UNSIGNED NOT NULL,
  `work_date` DATE NOT NULL,
  `time_in` TIMESTAMP NULL,
  `time_out` TIMESTAMP NULL,
  `break_in` TIMESTAMP NULL,
  `break_out` TIMESTAMP NULL,
  `hours_worked` DECIMAL(7,2) NOT NULL DEFAULT 0,
  `late_minutes` INT NOT NULL DEFAULT 0,
  `undertime_minutes` INT NOT NULL DEFAULT 0,
  `overtime_hours` DECIMAL(7,2) NOT NULL DEFAULT 0,
  `remark` VARCHAR(255) NULL,
  `status` VARCHAR(30) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`attendance_id`),
  UNIQUE KEY `uq_attendance_records_natural` (`employee_id`, `work_date`),
  KEY `idx_attendance_records_work_date` (`work_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `work_schedules` (
  `work_schedule_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `employee_id` BIGINT UNSIGNED NOT NULL,
  `day_of_week` SMALLINT NOT NULL,
  `shift_name` VARCHAR(80) NULL,
  `start_time` TIME NULL,
  `end_time` TIME NULL,
  `location` VARCHAR(120) NULL,
  `is_rest_day` TINYINT(1) NOT NULL DEFAULT FALSE,
  `effective_from` DATE NOT NULL,
  `effective_to` DATE NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`work_schedule_id`),
  KEY `idx_work_schedules_employee_id` (`employee_id`),
  CONSTRAINT chk_work_schedules_day_of_week CHECK (`day_of_week` BETWEEN 0 AND 6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Domain 5: Payroll & Benefits
-- ---------------------------------------------------------------------------

CREATE TABLE `payroll_periods` (
  `payroll_period_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `period_code` VARCHAR(40) NOT NULL UNIQUE,
  `period_name` VARCHAR(120) NOT NULL,
  `period_start` DATE NOT NULL,
  `period_end` DATE NOT NULL,
  `payout_date` DATE NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'Open',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`payroll_period_id`),
  KEY `idx_payroll_periods_status` (`status`),
  CONSTRAINT chk_payroll_periods_status CHECK (`status` IN ('Open', 'Closed'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `payroll_records` (
  `payroll_record_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `employee_id` BIGINT UNSIGNED NOT NULL,
  `payroll_period_id` BIGINT UNSIGNED NULL,
  `pay_period_start` DATE NOT NULL,
  `pay_period_end` DATE NOT NULL,
  `payout_date` DATE NULL,
  `gross_pay` DECIMAL(12,2) NOT NULL,
  `net_pay` DECIMAL(12,2) NOT NULL,
  `status` VARCHAR(30) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`payroll_record_id`),
  KEY `idx_payroll_records_employee_id` (`employee_id`),
  KEY `idx_payroll_records_payroll_period_id` (`payroll_period_id`),
  KEY `idx_payroll_records_pay_period_start` (`pay_period_start`),
  KEY `idx_payroll_records_status` (`status`),
  CONSTRAINT chk_payroll_records_status CHECK (`status` IN ('Draft', 'Finalized', 'Released'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `payroll_items` (
  `payroll_item_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `payroll_record_id` BIGINT UNSIGNED NOT NULL,
  `item_type` VARCHAR(30) NOT NULL,
  `label` VARCHAR(120) NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`payroll_item_id`),
  KEY `idx_payroll_items_payroll_record_id` (`payroll_record_id`),
  CONSTRAINT chk_payroll_items_item_type CHECK (`item_type` IN ('Earning', 'Deduction'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `employee_benefits` (
  `employee_benefit_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `employee_id` BIGINT UNSIGNED NOT NULL,
  `benefit_name` VARCHAR(100) NOT NULL,
  `reference_value` VARCHAR(190) NULL,
  `note` TEXT NULL,
  `effective_date` DATE NULL,
  `end_date` DATE NULL,
  `status` VARCHAR(30) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`employee_benefit_id`),
  KEY `idx_employee_benefits_employee_id` (`employee_id`),
  CONSTRAINT chk_employee_benefits_status CHECK (`status` IN ('Active', 'Inactive', 'Expired'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Domain 6: Learning & Performance
-- ---------------------------------------------------------------------------

CREATE TABLE `learning_courses` (
  `course_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `course_code` VARCHAR(40) NOT NULL UNIQUE,
  `title` VARCHAR(200) NOT NULL,
  `category` VARCHAR(120) NULL,
  `description` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `employee_learning` (
  `employee_learning_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `employee_id` BIGINT UNSIGNED NOT NULL,
  `course_id` BIGINT UNSIGNED NOT NULL,
  `status` VARCHAR(30) NOT NULL,
  `score` DECIMAL(5,2) NULL,
  `assigned_date` DATE NULL,
  `completed_date` DATE NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`employee_learning_id`),
  UNIQUE KEY `uq_employee_learning_natural` (`employee_id`, `course_id`),
  KEY `idx_employee_learning_course_id` (`course_id`),
  CONSTRAINT chk_employee_learning_status CHECK (`status` IN ('Assigned', 'In Progress', 'Completed'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `performance_reviews` (
  `performance_review_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `employee_id` BIGINT UNSIGNED NOT NULL,
  `review_period` VARCHAR(80) NOT NULL,
  `review_date` DATE NULL,
  `competency_level` VARCHAR(50) NULL,
  `overall_rating` DECIMAL(5,2) NULL,
  `salary_grade_id` BIGINT UNSIGNED NULL,
  `salary_step` VARCHAR(30) NULL,
  `evaluator_user_id` BIGINT UNSIGNED NULL,
  `comments` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`performance_review_id`),
  KEY `idx_performance_reviews_employee_id` (`employee_id`),
  KEY `idx_performance_reviews_salary_grade_id` (`salary_grade_id`),
  KEY `idx_performance_reviews_evaluator_user_id` (`evaluator_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `hr3_recommendations` (
  `recommendation_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `employee_id` BIGINT UNSIGNED NOT NULL,
  `recommendation_type` VARCHAR(40) NOT NULL,
  `evaluation_score` DECIMAL(5,2) NULL,
  `evaluator_user_id` BIGINT UNSIGNED NULL,
  `date_submitted` DATE NOT NULL,
  `status` VARCHAR(40) NOT NULL,
  `suggested_position_id` BIGINT UNSIGNED NULL,
  `suggested_salary_grade_id` BIGINT UNSIGNED NULL,
  `current_employment_type` VARCHAR(30) NULL,
  `comments` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`recommendation_id`),
  KEY `idx_hr3_recommendations_employee_id` (`employee_id`),
  KEY `idx_hr3_recommendations_evaluator_user_id` (`evaluator_user_id`),
  KEY `idx_hr3_recommendations_suggested_position_id` (`suggested_position_id`),
  KEY `idx_hr3_recommendations_suggested_salary_grade_id` (`suggested_salary_grade_id`),
  CONSTRAINT chk_hr3_recommendations_recommendation_type CHECK (`recommendation_type` IN ('Regularization', 'Promotion', 'Performance Review')),
  CONSTRAINT chk_hr3_recommendations_status CHECK (`status` IN ('Pending HR Action', 'Approved & Processed', 'Deferred'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Domain 7: Access Control, Audit & System
-- ---------------------------------------------------------------------------

CREATE TABLE `system_roles` (
  `role_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `role_name` VARCHAR(50) NOT NULL UNIQUE,
  `description` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `role_permissions` (
  `role_permission_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `role_id` BIGINT UNSIGNED NOT NULL,
  `module_name` VARCHAR(100) NOT NULL,
  `permission_level` VARCHAR(40) NOT NULL DEFAULT 'None',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`role_permission_id`),
  UNIQUE KEY `uq_role_permissions_natural` (`role_id`, `module_name`),
  KEY `idx_role_permissions_role_id` (`role_id`),
  CONSTRAINT chk_role_permissions_module_name CHECK (`module_name` IN ('Dashboard', 'Applicant Management', 'Recruitment Management', 'New Hire Onboarding', 'Core HCM', 'Employee Records', 'ESS Management', 'User Management', 'Audit Logs', 'Settings')),
  CONSTRAINT chk_role_permissions_permission_level CHECK (`permission_level` IN ('Full', 'View', 'Edit', 'Delete', 'Approve / Reject Only', 'None'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `system_users` (
  `system_user_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `email` VARCHAR(190) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(160) NULL,
  `department_name` VARCHAR(120) NULL,
  `employee_id` BIGINT UNSIGNED NULL UNIQUE,
  `role_id` BIGINT UNSIGNED NOT NULL,
  `status` VARCHAR(20) NOT NULL,
  `last_login_at` TIMESTAMP NULL,
  `last_login_ip` VARCHAR(45) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`system_user_id`),
  KEY `idx_system_users_role_id` (`role_id`),
  KEY `idx_system_users_status` (`status`),
  CONSTRAINT chk_system_users_status CHECK (`status` IN ('Active', 'Suspended', 'Disabled'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `notifications` (
  `notification_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `system_user_id` BIGINT UNSIGNED NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `body` TEXT NULL,
  `module_name` VARCHAR(100) NULL,
  `target_type` VARCHAR(100) NULL,
  `target_id` VARCHAR(100) NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT FALSE,
  `read_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notification_id`),
  KEY `idx_notifications_system_user_id` (`system_user_id`),
  KEY `idx_notifications_is_read` (`is_read`),
  KEY `idx_notifications_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `user_login_activity` (
  `login_activity_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `system_user_id` BIGINT UNSIGNED NOT NULL,
  `login_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ip_address` VARCHAR(45) NULL,
  `device_info` VARCHAR(255) NULL,
  `user_agent` TEXT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'success',
  PRIMARY KEY (`login_activity_id`),
  KEY `idx_user_login_activity_system_user_id` (`system_user_id`),
  KEY `idx_user_login_activity_login_at` (`login_at`),
  KEY `idx_user_login_activity_status` (`status`),
  CONSTRAINT chk_user_login_activity_status CHECK (`status` IN ('success', 'failed'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `audit_logs` (
  `audit_log_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `system_user_id` BIGINT UNSIGNED NULL,
  `actor_role` VARCHAR(50) NULL,
  `actor_department` VARCHAR(120) NULL,
  `occurred_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `action` VARCHAR(255) NOT NULL,
  `module_name` VARCHAR(100) NOT NULL,
  `target_type` VARCHAR(100) NULL,
  `target_id` VARCHAR(100) NULL,
  `details` TEXT NULL,
  `severity` VARCHAR(20) NOT NULL,
  `ip_address` VARCHAR(45) NULL,
  `device_info` VARCHAR(255) NULL,
  PRIMARY KEY (`audit_log_id`),
  KEY `idx_audit_logs_system_user_id` (`system_user_id`),
  KEY `idx_audit_logs_occurred_at` (`occurred_at`),
  KEY `idx_audit_logs_module_name` (`module_name`),
  KEY `idx_audit_logs_severity` (`severity`),
  CONSTRAINT chk_audit_logs_severity CHECK (`severity` IN ('Info', 'Warning', 'Critical'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `announcements` (
  `announcement_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `published_date` DATE NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `body` TEXT NOT NULL,
  `audience` VARCHAR(20) NOT NULL DEFAULT 'All',
  `created_by_user_id` BIGINT UNSIGNED NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'published',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`announcement_id`),
  KEY `idx_announcements_created_by_user_id` (`created_by_user_id`),
  KEY `idx_announcements_status` (`status`),
  CONSTRAINT chk_announcements_audience CHECK (`audience` IN ('All', 'Admin', 'Employee', 'Super Admin')),
  CONSTRAINT chk_announcements_status CHECK (`status` IN ('draft', 'published', 'archived'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `system_settings` (
  `setting_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `setting_key` VARCHAR(120) NOT NULL UNIQUE,
  `setting_value` JSON NOT NULL,
  `updated_by_user_id` BIGINT UNSIGNED NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`setting_id`),
  KEY `idx_system_settings_updated_by_user_id` (`updated_by_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Foreign keys (added after all tables to allow circular references)
-- ---------------------------------------------------------------------------

ALTER TABLE `departments` ADD CONSTRAINT fk_departments_head_employee_id FOREIGN KEY (`head_employee_id`) REFERENCES `employees` (`employee_id`);
ALTER TABLE `positions` ADD CONSTRAINT fk_positions_department_id FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`);
ALTER TABLE `positions` ADD CONSTRAINT fk_positions_salary_grade_id FOREIGN KEY (`salary_grade_id`) REFERENCES `salary_grades` (`salary_grade_id`);
ALTER TABLE `employees` ADD CONSTRAINT fk_employees_position_id FOREIGN KEY (`position_id`) REFERENCES `positions` (`position_id`);
ALTER TABLE `employees` ADD CONSTRAINT fk_employees_department_id FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`);
ALTER TABLE `employees` ADD CONSTRAINT fk_employees_supervisor_employee_id FOREIGN KEY (`supervisor_employee_id`) REFERENCES `employees` (`employee_id`);
ALTER TABLE `employees` ADD CONSTRAINT fk_employees_salary_grade_id FOREIGN KEY (`salary_grade_id`) REFERENCES `salary_grades` (`salary_grade_id`);
ALTER TABLE `employee_emergency_contacts` ADD CONSTRAINT fk_employee_emergency_contacts_employee_id FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE;
ALTER TABLE `employee_position_history` ADD CONSTRAINT fk_employee_position_history_employee_id FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE;
ALTER TABLE `employee_position_history` ADD CONSTRAINT fk_employee_position_history_old_position_id FOREIGN KEY (`old_position_id`) REFERENCES `positions` (`position_id`);
ALTER TABLE `employee_position_history` ADD CONSTRAINT fk_employee_position_history_new_position_id FOREIGN KEY (`new_position_id`) REFERENCES `positions` (`position_id`);
ALTER TABLE `employee_position_history` ADD CONSTRAINT fk_employee_position_history_old_salary_grade_id FOREIGN KEY (`old_salary_grade_id`) REFERENCES `salary_grades` (`salary_grade_id`);
ALTER TABLE `employee_position_history` ADD CONSTRAINT fk_employee_position_history_new_salary_grade_id FOREIGN KEY (`new_salary_grade_id`) REFERENCES `salary_grades` (`salary_grade_id`);
ALTER TABLE `employee_exit_records` ADD CONSTRAINT fk_employee_exit_records_employee_id FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE;
ALTER TABLE `employee_documents` ADD CONSTRAINT fk_employee_documents_employee_id FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE;
ALTER TABLE `job_posts` ADD CONSTRAINT fk_job_posts_department_id FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`);
ALTER TABLE `job_posts` ADD CONSTRAINT fk_job_posts_position_id FOREIGN KEY (`position_id`) REFERENCES `positions` (`position_id`);
ALTER TABLE `job_post_platforms` ADD CONSTRAINT fk_job_post_platforms_job_post_id FOREIGN KEY (`job_post_id`) REFERENCES `job_posts` (`job_post_id`) ON DELETE CASCADE;
ALTER TABLE `applicants` ADD CONSTRAINT fk_applicants_job_post_id FOREIGN KEY (`job_post_id`) REFERENCES `job_posts` (`job_post_id`);
ALTER TABLE `applicant_screening_entities` ADD CONSTRAINT fk_applicant_screening_entities_applicant_id FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`applicant_id`) ON DELETE CASCADE;
ALTER TABLE `applicant_screening_scores` ADD CONSTRAINT fk_applicant_screening_scores_applicant_id FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`applicant_id`) ON DELETE CASCADE;
ALTER TABLE `interviews` ADD CONSTRAINT fk_interviews_applicant_id FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`applicant_id`) ON DELETE CASCADE;
ALTER TABLE `interviews` ADD CONSTRAINT fk_interviews_interviewer_employee_id FOREIGN KEY (`interviewer_employee_id`) REFERENCES `employees` (`employee_id`);
ALTER TABLE `applicant_assessments` ADD CONSTRAINT fk_applicant_assessments_applicant_id FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`applicant_id`) ON DELETE CASCADE;
ALTER TABLE `applicant_assessments` ADD CONSTRAINT fk_applicant_assessments_assessor_user_id FOREIGN KEY (`assessor_user_id`) REFERENCES `system_users` (`system_user_id`);
ALTER TABLE `requisitions` ADD CONSTRAINT fk_requisitions_position_id FOREIGN KEY (`position_id`) REFERENCES `positions` (`position_id`);
ALTER TABLE `requisitions` ADD CONSTRAINT fk_requisitions_department_id FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`);
ALTER TABLE `requisitions` ADD CONSTRAINT fk_requisitions_requested_by_user_id FOREIGN KEY (`requested_by_user_id`) REFERENCES `system_users` (`system_user_id`);
ALTER TABLE `requisitions` ADD CONSTRAINT fk_requisitions_converted_job_post_id FOREIGN KEY (`converted_job_post_id`) REFERENCES `job_posts` (`job_post_id`);
ALTER TABLE `new_hires` ADD CONSTRAINT fk_new_hires_applicant_id FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`applicant_id`);
ALTER TABLE `new_hires` ADD CONSTRAINT fk_new_hires_employee_id FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`);
ALTER TABLE `new_hires` ADD CONSTRAINT fk_new_hires_position_id FOREIGN KEY (`position_id`) REFERENCES `positions` (`position_id`);
ALTER TABLE `new_hires` ADD CONSTRAINT fk_new_hires_department_id FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`);
ALTER TABLE `onboarding_checklist_items` ADD CONSTRAINT fk_onboarding_checklist_items_template_id FOREIGN KEY (`template_id`) REFERENCES `onboarding_checklist_templates` (`template_id`) ON DELETE CASCADE;
ALTER TABLE `employee_onboarding_items` ADD CONSTRAINT fk_employee_onboarding_items_employee_id FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE;
ALTER TABLE `employee_onboarding_items` ADD CONSTRAINT fk_employee_onboarding_items_new_hire_id FOREIGN KEY (`new_hire_id`) REFERENCES `new_hires` (`new_hire_id`);
ALTER TABLE `employee_onboarding_items` ADD CONSTRAINT fk_employee_onboarding_items_template_item_id FOREIGN KEY (`template_item_id`) REFERENCES `onboarding_checklist_items` (`template_item_id`);
ALTER TABLE `employee_onboarding_items` ADD CONSTRAINT fk_employee_onboarding_items_completed_by_user_id FOREIGN KEY (`completed_by_user_id`) REFERENCES `system_users` (`system_user_id`);
ALTER TABLE `checklist_requests` ADD CONSTRAINT fk_checklist_requests_employee_id FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`);
ALTER TABLE `checklist_requests` ADD CONSTRAINT fk_checklist_requests_template_id FOREIGN KEY (`template_id`) REFERENCES `onboarding_checklist_templates` (`template_id`);
ALTER TABLE `checklist_requests` ADD CONSTRAINT fk_checklist_requests_requested_by_user_id FOREIGN KEY (`requested_by_user_id`) REFERENCES `system_users` (`system_user_id`);
ALTER TABLE `ess_requests` ADD CONSTRAINT fk_ess_requests_employee_id FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`);
ALTER TABLE `ess_requests` ADD CONSTRAINT fk_ess_requests_category_id FOREIGN KEY (`category_id`) REFERENCES `ess_categories` (`ess_category_id`) ON DELETE SET NULL;
ALTER TABLE `ess_requests` ADD CONSTRAINT fk_ess_requests_assigned_to_user_id FOREIGN KEY (`assigned_to_user_id`) REFERENCES `system_users` (`system_user_id`);
ALTER TABLE `leave_balances` ADD CONSTRAINT fk_leave_balances_employee_id FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE;
ALTER TABLE `attendance_records` ADD CONSTRAINT fk_attendance_records_employee_id FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE;
ALTER TABLE `work_schedules` ADD CONSTRAINT fk_work_schedules_employee_id FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE;
ALTER TABLE `payroll_records` ADD CONSTRAINT fk_payroll_records_employee_id FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`);
ALTER TABLE `payroll_records` ADD CONSTRAINT fk_payroll_records_payroll_period_id FOREIGN KEY (`payroll_period_id`) REFERENCES `payroll_periods` (`payroll_period_id`);
ALTER TABLE `payroll_items` ADD CONSTRAINT fk_payroll_items_payroll_record_id FOREIGN KEY (`payroll_record_id`) REFERENCES `payroll_records` (`payroll_record_id`) ON DELETE CASCADE;
ALTER TABLE `employee_benefits` ADD CONSTRAINT fk_employee_benefits_employee_id FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE;
ALTER TABLE `employee_learning` ADD CONSTRAINT fk_employee_learning_employee_id FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE;
ALTER TABLE `employee_learning` ADD CONSTRAINT fk_employee_learning_course_id FOREIGN KEY (`course_id`) REFERENCES `learning_courses` (`course_id`);
ALTER TABLE `performance_reviews` ADD CONSTRAINT fk_performance_reviews_employee_id FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`);
ALTER TABLE `performance_reviews` ADD CONSTRAINT fk_performance_reviews_salary_grade_id FOREIGN KEY (`salary_grade_id`) REFERENCES `salary_grades` (`salary_grade_id`);
ALTER TABLE `performance_reviews` ADD CONSTRAINT fk_performance_reviews_evaluator_user_id FOREIGN KEY (`evaluator_user_id`) REFERENCES `system_users` (`system_user_id`);
ALTER TABLE `hr3_recommendations` ADD CONSTRAINT fk_hr3_recommendations_employee_id FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`);
ALTER TABLE `hr3_recommendations` ADD CONSTRAINT fk_hr3_recommendations_evaluator_user_id FOREIGN KEY (`evaluator_user_id`) REFERENCES `system_users` (`system_user_id`);
ALTER TABLE `hr3_recommendations` ADD CONSTRAINT fk_hr3_recommendations_suggested_position_id FOREIGN KEY (`suggested_position_id`) REFERENCES `positions` (`position_id`);
ALTER TABLE `hr3_recommendations` ADD CONSTRAINT fk_hr3_recommendations_suggested_salary_grade_id FOREIGN KEY (`suggested_salary_grade_id`) REFERENCES `salary_grades` (`salary_grade_id`);
ALTER TABLE `role_permissions` ADD CONSTRAINT fk_role_permissions_role_id FOREIGN KEY (`role_id`) REFERENCES `system_roles` (`role_id`) ON DELETE CASCADE;
ALTER TABLE `system_users` ADD CONSTRAINT fk_system_users_employee_id FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`);
ALTER TABLE `system_users` ADD CONSTRAINT fk_system_users_role_id FOREIGN KEY (`role_id`) REFERENCES `system_roles` (`role_id`);
ALTER TABLE `audit_logs` ADD CONSTRAINT fk_audit_logs_system_user_id FOREIGN KEY (`system_user_id`) REFERENCES `system_users` (`system_user_id`) ON DELETE SET NULL;
ALTER TABLE `notifications` ADD CONSTRAINT fk_notifications_system_user_id FOREIGN KEY (`system_user_id`) REFERENCES `system_users` (`system_user_id`) ON DELETE CASCADE;
ALTER TABLE `user_login_activity` ADD CONSTRAINT fk_user_login_activity_system_user_id FOREIGN KEY (`system_user_id`) REFERENCES `system_users` (`system_user_id`) ON DELETE CASCADE;
ALTER TABLE `announcements` ADD CONSTRAINT fk_announcements_created_by_user_id FOREIGN KEY (`created_by_user_id`) REFERENCES `system_users` (`system_user_id`);
ALTER TABLE `system_settings` ADD CONSTRAINT fk_system_settings_updated_by_user_id FOREIGN KEY (`updated_by_user_id`) REFERENCES `system_users` (`system_user_id`);

SET FOREIGN_KEY_CHECKS=1;