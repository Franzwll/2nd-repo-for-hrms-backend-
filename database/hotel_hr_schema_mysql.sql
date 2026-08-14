-- Generated from the frontend/src analysis of Hotel-and-Restaurant-HR1.
-- Schema is normalized around persisted HR domains; JSON is retained only for source arrays that do not warrant independent entities.

SET FOREIGN_KEY_CHECKS=0;
CREATE TABLE `departments` (
  `department_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `code` VARCHAR(30) NOT NULL UNIQUE,
  `name` VARCHAR(120) NOT NULL UNIQUE,
  `description` TEXT NULL,
  `head_employee_id` BIGINT UNSIGNED NULL,
  `budget` DECIMAL(14,2) NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`department_id`)
);

CREATE TABLE `salary_grades` (
  `salary_grade_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `code` VARCHAR(30) NOT NULL UNIQUE,
  `title` VARCHAR(120) NOT NULL,
  `min_salary` DECIMAL(12,2) NOT NULL,
  `max_salary` DECIMAL(12,2) NOT NULL,
  `currency_code` CHAR(3) NOT NULL DEFAULT 'PHP',
  `level` VARCHAR(30) NOT NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`salary_grade_id`)
);

CREATE TABLE `positions` (
  `position_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `position_code` VARCHAR(30) NOT NULL UNIQUE,
  `title` VARCHAR(150) NOT NULL,
  `department_id` BIGINT UNSIGNED NOT NULL,
  `salary_grade_id` BIGINT UNSIGNED NULL,
  `level` VARCHAR(30) NOT NULL,
  `headcount` INT NOT NULL DEFAULT 0,
  `filled_count` INT NOT NULL DEFAULT 0,
  `salary_band_text` VARCHAR(120) NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`position_id`)
);

CREATE TABLE `employees` (
  `employee_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `employee_code` VARCHAR(40) NOT NULL UNIQUE,
  `first_name` VARCHAR(80) NOT NULL,
  `middle_name` VARCHAR(80) NULL,
  `last_name` VARCHAR(80) NOT NULL,
  `email` VARCHAR(190) NOT NULL UNIQUE,
  `phone` VARCHAR(40) NULL,
  `address` TEXT NULL,
  `emergency_contact_summary` VARCHAR(255) NULL,
  `position_id` BIGINT UNSIGNED NOT NULL,
  `department_id` BIGINT UNSIGNED NOT NULL,
  `employment_type` VARCHAR(30) NOT NULL,
  `date_hired` DATE NOT NULL,
  `supervisor_employee_id` BIGINT UNSIGNED NULL,
  `status` VARCHAR(30) NOT NULL,
  `onboarding_complete` TINYINT(1) NOT NULL DEFAULT FALSE,
  `salary_grade_id` BIGINT UNSIGNED NULL,
  `employee_record_last_updated_at` DATE NULL,
  `salary_step` VARCHAR(30) NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`employee_id`)
);

CREATE TABLE `employee_emergency_contacts` (
  `emergency_contact_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `employee_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(160) NOT NULL,
  `relationship` VARCHAR(80) NULL,
  `phone` VARCHAR(40) NULL,
  `address` TEXT NULL,
  `is_primary` TINYINT(1) NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`emergency_contact_id`)
);

CREATE TABLE `employee_position_history` (
  `position_history_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `employee_id` BIGINT UNSIGNED NOT NULL,
  `effective_date` DATE NOT NULL,
  `old_position_id` BIGINT UNSIGNED NULL,
  `new_position_id` BIGINT UNSIGNED NULL,
  `old_salary_grade_id` BIGINT UNSIGNED NULL,
  `new_salary_grade_id` BIGINT UNSIGNED NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`position_history_id`)
);

CREATE TABLE `employee_exit_records` (
  `exit_record_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `employee_id` BIGINT UNSIGNED NOT NULL UNIQUE,
  `exit_type` VARCHAR(30) NOT NULL,
  `exit_date` DATE NOT NULL,
  `clearance_status` VARCHAR(20) NOT NULL,
  `coe_status` VARCHAR(20) NOT NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`exit_record_id`)
);

CREATE TABLE `employee_documents` (
  `document_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `employee_id` BIGINT UNSIGNED NOT NULL,
  `document_code` VARCHAR(50) NOT NULL UNIQUE,
  `title` VARCHAR(200) NOT NULL,
  `category` VARCHAR(80) NOT NULL,
  `file_path` TEXT NULL,
  `mime_type` VARCHAR(100) NULL,
  `file_size_bytes` BIGINT UNSIGNED NULL,
  `document_status` VARCHAR(30) NOT NULL,
  `document_date` DATE NULL,
  `expiry_date` DATE NULL,
  `last_updated_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`document_id`)
);

CREATE TABLE `job_posts` (
  `job_post_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `slug` VARCHAR(120) NOT NULL UNIQUE,
  `title` VARCHAR(150) NOT NULL,
  `department_id` BIGINT UNSIGNED NOT NULL,
  `position_id` BIGINT UNSIGNED NULL,
  `employment_type` VARCHAR(30) NOT NULL,
  `schedule` VARCHAR(120) NULL,
  `salary_min` DECIMAL(12,2) NULL,
  `salary_max` DECIMAL(12,2) NULL,
  `vacancies` INT NOT NULL DEFAULT 1,
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
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`job_post_id`)
);

CREATE TABLE `job_post_platforms` (
  `job_post_platform_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `job_post_id` BIGINT UNSIGNED NOT NULL,
  `platform` VARCHAR(60) NOT NULL,
  `published_at` TIMESTAMP NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'published',
  `created_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`job_post_platform_id`)
);

CREATE TABLE `applicants` (
  `applicant_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `applicant_code` VARCHAR(40) NOT NULL UNIQUE,
  `job_post_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(160) NOT NULL,
  `email` VARCHAR(190) NOT NULL,
  `phone` VARCHAR(40) NULL,
  `applied_at` TIMESTAMP NOT NULL,
  `fit_score` DECIMAL(5,2) NULL,
  `status` VARCHAR(30) NOT NULL,
  `stage` VARCHAR(40) NOT NULL,
  `source` VARCHAR(60) NULL,
  `resume_file_path` TEXT NULL,
  `summary` TEXT NULL,
  `flags_json` JSON NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`applicant_id`)
);

CREATE TABLE `applicant_screening_entities` (
  `entity_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `applicant_id` BIGINT UNSIGNED NOT NULL,
  `label` VARCHAR(80) NOT NULL,
  `value` TEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`entity_id`)
);

CREATE TABLE `applicant_screening_scores` (
  `score_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `applicant_id` BIGINT UNSIGNED NOT NULL,
  `criterion` VARCHAR(120) NOT NULL,
  `score` DECIMAL(5,2) NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`score_id`)
);

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
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`interview_id`)
);

CREATE TABLE `requisitions` (
  `requisition_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `requisition_code` VARCHAR(40) NOT NULL UNIQUE,
  `position_id` BIGINT UNSIGNED NOT NULL,
  `department_id` BIGINT UNSIGNED NOT NULL,
  `requested_by_user_id` BIGINT UNSIGNED NULL,
  `requested_count` INT NOT NULL,
  `urgency` VARCHAR(20) NOT NULL,
  `justification` TEXT NOT NULL,
  `status` VARCHAR(20) NOT NULL,
  `requested_at` DATE NOT NULL,
  `converted_job_post_id` BIGINT UNSIGNED NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`requisition_id`)
);

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
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`new_hire_id`)
);

CREATE TABLE `onboarding_checklist_templates` (
  `template_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `template_code` VARCHAR(40) NOT NULL UNIQUE,
  `title` VARCHAR(200) NOT NULL,
  `phase` VARCHAR(30) NOT NULL,
  `position_scope_json` JSON NULL,
  `status` VARCHAR(20) NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`template_id`)
);

CREATE TABLE `onboarding_checklist_items` (
  `template_item_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `template_id` BIGINT UNSIGNED NOT NULL,
  `item_text` TEXT NOT NULL,
  `sort_order` INT NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`template_item_id`)
);

CREATE TABLE `employee_onboarding_items` (
  `employee_onboarding_item_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `employee_id` BIGINT UNSIGNED NOT NULL,
  `new_hire_id` BIGINT UNSIGNED NULL,
  `template_item_id` BIGINT UNSIGNED NULL,
  `item_text` TEXT NOT NULL,
  `done` TINYINT(1) NOT NULL DEFAULT FALSE,
  `completed_at` TIMESTAMP NULL,
  `completed_by_user_id` BIGINT UNSIGNED NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`employee_onboarding_item_id`)
);

CREATE TABLE `ess_requests` (
  `ess_request_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `request_code` VARCHAR(40) NOT NULL UNIQUE,
  `employee_id` BIGINT UNSIGNED NOT NULL,
  `category` VARCHAR(80) NOT NULL,
  `request_type` VARCHAR(100) NOT NULL,
  `filed_at` TIMESTAMP NOT NULL,
  `status` VARCHAR(30) NOT NULL,
  `assigned_to_user_id` BIGINT UNSIGNED NULL,
  `details` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`ess_request_id`)
);

CREATE TABLE `leave_balances` (
  `leave_balance_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `employee_id` BIGINT UNSIGNED NOT NULL,
  `leave_type` VARCHAR(80) NOT NULL,
  `period_year` SMALLINT NOT NULL,
  `total_days` DECIMAL(6,2) NOT NULL DEFAULT 0,
  `used_days` DECIMAL(6,2) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`leave_balance_id`)
);

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
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`attendance_id`)
);

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
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`work_schedule_id`)
);

CREATE TABLE `payroll_records` (
  `payroll_record_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `employee_id` BIGINT UNSIGNED NOT NULL,
  `pay_period_start` DATE NOT NULL,
  `pay_period_end` DATE NOT NULL,
  `payout_date` DATE NULL,
  `gross_pay` DECIMAL(12,2) NOT NULL,
  `net_pay` DECIMAL(12,2) NOT NULL,
  `status` VARCHAR(30) NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`payroll_record_id`)
);

CREATE TABLE `payroll_items` (
  `payroll_item_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `payroll_record_id` BIGINT UNSIGNED NOT NULL,
  `item_type` VARCHAR(30) NOT NULL,
  `label` VARCHAR(120) NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`payroll_item_id`)
);

CREATE TABLE `employee_benefits` (
  `employee_benefit_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `employee_id` BIGINT UNSIGNED NOT NULL,
  `benefit_name` VARCHAR(100) NOT NULL,
  `reference_value` VARCHAR(190) NULL,
  `note` TEXT NULL,
  `effective_date` DATE NULL,
  `end_date` DATE NULL,
  `status` VARCHAR(30) NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`employee_benefit_id`)
);

CREATE TABLE `learning_courses` (
  `course_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `course_code` VARCHAR(40) NOT NULL UNIQUE,
  `title` VARCHAR(200) NOT NULL,
  `category` VARCHAR(120) NULL,
  `description` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`course_id`)
);

CREATE TABLE `employee_learning` (
  `employee_learning_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `employee_id` BIGINT UNSIGNED NOT NULL,
  `course_id` BIGINT UNSIGNED NOT NULL,
  `status` VARCHAR(30) NOT NULL,
  `score` DECIMAL(5,2) NULL,
  `assigned_date` DATE NULL,
  `completed_date` DATE NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`employee_learning_id`)
);

CREATE TABLE `performance_reviews` (
  `performance_review_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `employee_id` BIGINT UNSIGNED NOT NULL,
  `review_period` VARCHAR(80) NOT NULL,
  `review_date` DATE NULL,
  `competency_level` VARCHAR(50) NULL,
  `overall_rating` DECIMAL(5,2) NULL,
  `salary_grade_code` VARCHAR(30) NULL,
  `salary_step` VARCHAR(30) NULL,
  `evaluator_user_id` BIGINT UNSIGNED NULL,
  `comments` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`performance_review_id`)
);

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
  `comments` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`recommendation_id`)
);

CREATE TABLE `system_roles` (
  `role_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `role_name` VARCHAR(50) NOT NULL UNIQUE,
  `description` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`role_id`)
);

CREATE TABLE `system_permissions` (
  `permission_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `module_name` VARCHAR(100) NOT NULL,
  `permission_level` VARCHAR(40) NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`permission_id`)
);

CREATE TABLE `system_role_permissions` (
  `role_permission_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `role_id` BIGINT UNSIGNED NOT NULL,
  `permission_id` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`role_permission_id`)
);

CREATE TABLE `system_users` (
  `system_user_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `email` VARCHAR(190) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `employee_id` BIGINT UNSIGNED NULL UNIQUE,
  `role_id` BIGINT UNSIGNED NOT NULL,
  `status` VARCHAR(20) NOT NULL,
  `last_login_at` TIMESTAMP NULL,
  `last_login_ip` VARCHAR(45) NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`system_user_id`)
);

CREATE TABLE `audit_logs` (
  `audit_log_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `system_user_id` BIGINT UNSIGNED NULL,
  `occurred_at` TIMESTAMP NOT NULL,
  `action` VARCHAR(255) NOT NULL,
  `module_name` VARCHAR(100) NOT NULL,
  `target_type` VARCHAR(100) NULL,
  `target_id` VARCHAR(100) NULL,
  `details` TEXT NULL,
  `severity` VARCHAR(20) NOT NULL,
  `ip_address` VARCHAR(45) NULL,
  `device_info` VARCHAR(255) NULL,
  PRIMARY KEY (`audit_log_id`)
);

CREATE TABLE `announcements` (
  `announcement_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `published_date` DATE NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `body` TEXT NOT NULL,
  `created_by_user_id` BIGINT UNSIGNED NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'published',
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`announcement_id`)
);

CREATE TABLE `system_settings` (
  `setting_id` BIGINT UNSIGNED AUTO_INCREMENT,
  `setting_key` VARCHAR(120) NOT NULL UNIQUE,
  `setting_value` JSON NOT NULL,
  `updated_by_user_id` BIGINT UNSIGNED NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`setting_id`)
);

-- Foreign keys
ALTER TABLE `departments` ADD CONSTRAINT fk_departments_head_employee_id FOREIGN KEY (`head_employee_id`) REFERENCES `employees` (`employee_id`);
ALTER TABLE `positions` ADD CONSTRAINT fk_positions_department_id FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`);
ALTER TABLE `positions` ADD CONSTRAINT fk_positions_salary_grade_id FOREIGN KEY (`salary_grade_id`) REFERENCES `salary_grades` (`salary_grade_id`);
ALTER TABLE `employees` ADD CONSTRAINT fk_employees_position_id FOREIGN KEY (`position_id`) REFERENCES `positions` (`position_id`);
ALTER TABLE `employees` ADD CONSTRAINT fk_employees_department_id FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`);
ALTER TABLE `employees` ADD CONSTRAINT fk_employees_supervisor_employee_id FOREIGN KEY (`supervisor_employee_id`) REFERENCES `employees` (`employee_id`);
ALTER TABLE `employees` ADD CONSTRAINT fk_employees_salary_grade_id FOREIGN KEY (`salary_grade_id`) REFERENCES `salary_grades` (`salary_grade_id`);
ALTER TABLE `employee_emergency_contacts` ADD CONSTRAINT fk_employee_emergency_contacts_employee_id FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`);
ALTER TABLE `employee_position_history` ADD CONSTRAINT fk_employee_position_history_employee_id FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`);
ALTER TABLE `employee_position_history` ADD CONSTRAINT fk_employee_position_history_old_position_id FOREIGN KEY (`old_position_id`) REFERENCES `positions` (`position_id`);
ALTER TABLE `employee_position_history` ADD CONSTRAINT fk_employee_position_history_new_position_id FOREIGN KEY (`new_position_id`) REFERENCES `positions` (`position_id`);
ALTER TABLE `employee_position_history` ADD CONSTRAINT fk_employee_position_history_old_salary_grade_id FOREIGN KEY (`old_salary_grade_id`) REFERENCES `salary_grades` (`salary_grade_id`);
ALTER TABLE `employee_position_history` ADD CONSTRAINT fk_employee_position_history_new_salary_grade_id FOREIGN KEY (`new_salary_grade_id`) REFERENCES `salary_grades` (`salary_grade_id`);
ALTER TABLE `employee_exit_records` ADD CONSTRAINT fk_employee_exit_records_employee_id FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`);
ALTER TABLE `employee_documents` ADD CONSTRAINT fk_employee_documents_employee_id FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`);
ALTER TABLE `job_posts` ADD CONSTRAINT fk_job_posts_department_id FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`);
ALTER TABLE `job_posts` ADD CONSTRAINT fk_job_posts_position_id FOREIGN KEY (`position_id`) REFERENCES `positions` (`position_id`);
ALTER TABLE `job_post_platforms` ADD CONSTRAINT fk_job_post_platforms_job_post_id FOREIGN KEY (`job_post_id`) REFERENCES `job_posts` (`job_post_id`);
ALTER TABLE `applicants` ADD CONSTRAINT fk_applicants_job_post_id FOREIGN KEY (`job_post_id`) REFERENCES `job_posts` (`job_post_id`);
ALTER TABLE `applicant_screening_entities` ADD CONSTRAINT fk_applicant_screening_entities_applicant_id FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`applicant_id`);
ALTER TABLE `applicant_screening_scores` ADD CONSTRAINT fk_applicant_screening_scores_applicant_id FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`applicant_id`);
ALTER TABLE `interviews` ADD CONSTRAINT fk_interviews_applicant_id FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`applicant_id`);
ALTER TABLE `interviews` ADD CONSTRAINT fk_interviews_interviewer_employee_id FOREIGN KEY (`interviewer_employee_id`) REFERENCES `employees` (`employee_id`);
ALTER TABLE `requisitions` ADD CONSTRAINT fk_requisitions_position_id FOREIGN KEY (`position_id`) REFERENCES `positions` (`position_id`);
ALTER TABLE `requisitions` ADD CONSTRAINT fk_requisitions_department_id FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`);
ALTER TABLE `requisitions` ADD CONSTRAINT fk_requisitions_requested_by_user_id FOREIGN KEY (`requested_by_user_id`) REFERENCES `system_users` (`system_user_id`);
ALTER TABLE `requisitions` ADD CONSTRAINT fk_requisitions_converted_job_post_id FOREIGN KEY (`converted_job_post_id`) REFERENCES `job_posts` (`job_post_id`);
ALTER TABLE `new_hires` ADD CONSTRAINT fk_new_hires_applicant_id FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`applicant_id`);
ALTER TABLE `new_hires` ADD CONSTRAINT fk_new_hires_employee_id FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`);
ALTER TABLE `new_hires` ADD CONSTRAINT fk_new_hires_position_id FOREIGN KEY (`position_id`) REFERENCES `positions` (`position_id`);
ALTER TABLE `new_hires` ADD CONSTRAINT fk_new_hires_department_id FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`);
ALTER TABLE `onboarding_checklist_items` ADD CONSTRAINT fk_onboarding_checklist_items_template_id FOREIGN KEY (`template_id`) REFERENCES `onboarding_checklist_templates` (`template_id`);
ALTER TABLE `employee_onboarding_items` ADD CONSTRAINT fk_employee_onboarding_items_employee_id FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`);
ALTER TABLE `employee_onboarding_items` ADD CONSTRAINT fk_employee_onboarding_items_new_hire_id FOREIGN KEY (`new_hire_id`) REFERENCES `new_hires` (`new_hire_id`);
ALTER TABLE `employee_onboarding_items` ADD CONSTRAINT fk_employee_onboarding_items_template_item_id FOREIGN KEY (`template_item_id`) REFERENCES `onboarding_checklist_items` (`template_item_id`);
ALTER TABLE `employee_onboarding_items` ADD CONSTRAINT fk_employee_onboarding_items_completed_by_user_id FOREIGN KEY (`completed_by_user_id`) REFERENCES `system_users` (`system_user_id`);
ALTER TABLE `ess_requests` ADD CONSTRAINT fk_ess_requests_employee_id FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`);
ALTER TABLE `ess_requests` ADD CONSTRAINT fk_ess_requests_assigned_to_user_id FOREIGN KEY (`assigned_to_user_id`) REFERENCES `system_users` (`system_user_id`);
ALTER TABLE `leave_balances` ADD CONSTRAINT fk_leave_balances_employee_id FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`);
ALTER TABLE `attendance_records` ADD CONSTRAINT fk_attendance_records_employee_id FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`);
ALTER TABLE `work_schedules` ADD CONSTRAINT fk_work_schedules_employee_id FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`);
ALTER TABLE `payroll_records` ADD CONSTRAINT fk_payroll_records_employee_id FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`);
ALTER TABLE `payroll_items` ADD CONSTRAINT fk_payroll_items_payroll_record_id FOREIGN KEY (`payroll_record_id`) REFERENCES `payroll_records` (`payroll_record_id`);
ALTER TABLE `employee_benefits` ADD CONSTRAINT fk_employee_benefits_employee_id FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`);
ALTER TABLE `employee_learning` ADD CONSTRAINT fk_employee_learning_employee_id FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`);
ALTER TABLE `employee_learning` ADD CONSTRAINT fk_employee_learning_course_id FOREIGN KEY (`course_id`) REFERENCES `learning_courses` (`course_id`);
ALTER TABLE `performance_reviews` ADD CONSTRAINT fk_performance_reviews_employee_id FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`);
ALTER TABLE `performance_reviews` ADD CONSTRAINT fk_performance_reviews_evaluator_user_id FOREIGN KEY (`evaluator_user_id`) REFERENCES `system_users` (`system_user_id`);
ALTER TABLE `hr3_recommendations` ADD CONSTRAINT fk_hr3_recommendations_employee_id FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`);
ALTER TABLE `hr3_recommendations` ADD CONSTRAINT fk_hr3_recommendations_evaluator_user_id FOREIGN KEY (`evaluator_user_id`) REFERENCES `system_users` (`system_user_id`);
ALTER TABLE `hr3_recommendations` ADD CONSTRAINT fk_hr3_recommendations_suggested_position_id FOREIGN KEY (`suggested_position_id`) REFERENCES `positions` (`position_id`);
ALTER TABLE `hr3_recommendations` ADD CONSTRAINT fk_hr3_recommendations_suggested_salary_grade_id FOREIGN KEY (`suggested_salary_grade_id`) REFERENCES `salary_grades` (`salary_grade_id`);
ALTER TABLE `system_role_permissions` ADD CONSTRAINT fk_system_role_permissions_role_id FOREIGN KEY (`role_id`) REFERENCES `system_roles` (`role_id`);
ALTER TABLE `system_role_permissions` ADD CONSTRAINT fk_system_role_permissions_permission_id FOREIGN KEY (`permission_id`) REFERENCES `system_permissions` (`permission_id`);
ALTER TABLE `system_users` ADD CONSTRAINT fk_system_users_employee_id FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`);
ALTER TABLE `system_users` ADD CONSTRAINT fk_system_users_role_id FOREIGN KEY (`role_id`) REFERENCES `system_roles` (`role_id`);
ALTER TABLE `audit_logs` ADD CONSTRAINT fk_audit_logs_system_user_id FOREIGN KEY (`system_user_id`) REFERENCES `system_users` (`system_user_id`);
ALTER TABLE `announcements` ADD CONSTRAINT fk_announcements_created_by_user_id FOREIGN KEY (`created_by_user_id`) REFERENCES `system_users` (`system_user_id`);
ALTER TABLE `system_settings` ADD CONSTRAINT fk_system_settings_updated_by_user_id FOREIGN KEY (`updated_by_user_id`) REFERENCES `system_users` (`system_user_id`);
ALTER TABLE `job_post_platforms` ADD CONSTRAINT uq_job_post_platforms_natural UNIQUE (`job_post_id`, `platform`);
ALTER TABLE `leave_balances` ADD CONSTRAINT uq_leave_balances_natural UNIQUE (`employee_id`, `leave_type`, `period_year`);
ALTER TABLE `attendance_records` ADD CONSTRAINT uq_attendance_records_natural UNIQUE (`employee_id`, `work_date`);
ALTER TABLE `employee_learning` ADD CONSTRAINT uq_employee_learning_natural UNIQUE (`employee_id`, `course_id`);
ALTER TABLE `system_role_permissions` ADD CONSTRAINT uq_system_role_permissions_natural UNIQUE (`role_id`, `permission_id`);
SET FOREIGN_KEY_CHECKS=1;