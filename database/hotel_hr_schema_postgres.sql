-- ============================================================================
-- Hotel & Restaurant HR1 - Final Database Schema (PostgreSQL 15+)
-- Revision: 2.2 (rev 2.1 + CHECK constraints + derived-counter notes). 42 tables.
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
-- PostgreSQL specifics: BIGSERIAL identities, JSONB, BOOLEAN, and explicit
-- indexes on every foreign key and common dashboard filter (PostgreSQL does
-- not auto-create indexes for FK columns, unlike MySQL).
-- ============================================================================

-- Self-contained: create the database if missing, then connect to it.
-- Run with: psql -U postgres -f hotel_hr_schema_postgres.sql
-- NOTE: "\connect" is a psql meta-command. When using pgAdmin instead,
-- create the "hotel_hr" database manually and remove these two lines.
CREATE DATABASE hotel_hr WITH ENCODING 'UTF8';
\connect hotel_hr

-- ---------------------------------------------------------------------------
-- Domain 1: Organization & Core HCM
-- ---------------------------------------------------------------------------

CREATE TABLE "departments" (
  "department_id" BIGSERIAL,
  "code" VARCHAR(30) NOT NULL UNIQUE,
  "name" VARCHAR(120) NOT NULL UNIQUE,
  "description" TEXT NULL,
  "head_employee_id" BIGINT NULL,
  "budget" NUMERIC(14,2) NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("department_id")
);

CREATE TABLE "salary_grades" (
  "salary_grade_id" BIGSERIAL,
  "code" VARCHAR(30) NOT NULL UNIQUE,
  "title" VARCHAR(120) NOT NULL,
  "min_salary" NUMERIC(12,2) NOT NULL,
  "max_salary" NUMERIC(12,2) NOT NULL,
  "currency_code" CHAR(3) NOT NULL DEFAULT 'PHP',
  "level" VARCHAR(30) NOT NULL,
  "notes" TEXT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("salary_grade_id"),
  CONSTRAINT chk_salary_grades_level CHECK ("level" IN ('Rank & File', 'Supervisory', 'Managerial', 'Executive'))
);

CREATE TABLE "positions" (
  "position_id" BIGSERIAL,
  "position_code" VARCHAR(30) NOT NULL UNIQUE,
  "title" VARCHAR(150) NOT NULL,
  "department_id" BIGINT NOT NULL,
  "salary_grade_id" BIGINT NULL,
  "level" VARCHAR(30) NOT NULL,
  "headcount" INT NOT NULL DEFAULT 0,
  -- NOTE: `filled_count` is a derived counter; maintain it in the same
  -- transaction as applicant->new_hire conversion (see PRD Section 11).
  "filled_count" INT NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("position_id"),
  CONSTRAINT chk_positions_level CHECK ("level" IN ('Rank & File', 'Supervisory', 'Managerial', 'Executive'))
);

CREATE TABLE "employees" (
  "employee_id" BIGSERIAL,
  "employee_code" VARCHAR(40) NOT NULL UNIQUE,
  "first_name" VARCHAR(80) NOT NULL,
  "middle_name" VARCHAR(80) NULL,
  "last_name" VARCHAR(80) NOT NULL,
  "email" VARCHAR(190) NOT NULL UNIQUE,
  "personal_email" VARCHAR(190) NULL,
  "phone" VARCHAR(40) NULL,
  "address" TEXT NULL,
  "birth_date" DATE NULL,
  "gender" VARCHAR(20) NULL,
  "civil_status" VARCHAR(20) NULL,
  "nationality" VARCHAR(60) NULL,
  "sss_number" VARCHAR(30) NULL,
  "philhealth_number" VARCHAR(30) NULL,
  "pagibig_number" VARCHAR(30) NULL,
  "tin_number" VARCHAR(30) NULL,
  "position_id" BIGINT NOT NULL,
  "department_id" BIGINT NOT NULL,
  "employment_type" VARCHAR(30) NOT NULL,
  -- NOTE: derived counter `onboarding_complete` is set by the service layer when
  -- the last employee_onboarding_items row completes (see PRD Section 11).
  "date_hired" DATE NOT NULL,
  "supervisor_employee_id" BIGINT NULL,
  "status" VARCHAR(30) NOT NULL,
  "onboarding_complete" BOOLEAN NOT NULL DEFAULT FALSE,
  "salary_grade_id" BIGINT NULL,
  "employee_record_last_updated_at" DATE NULL,
  "salary_step" VARCHAR(30) NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("employee_id"),
  CONSTRAINT chk_employees_employment_type CHECK ("employment_type" IN ('Regular', 'Probationary', 'Contractual')),
  CONSTRAINT chk_employees_status CHECK ("status" IN ('Active', 'Probationary', 'Regular', 'Promoted', 'Resigned', 'Retired', 'Terminated', 'Inactive')),
  CONSTRAINT chk_employees_gender CHECK ("gender" IS NULL OR "gender" IN ('Male', 'Female')),
  CONSTRAINT chk_employees_civil_status CHECK ("civil_status" IS NULL OR "civil_status" IN ('Single', 'Married', 'Widowed', 'Separated', 'Divorced'))
);

CREATE TABLE "employee_emergency_contacts" (
  "emergency_contact_id" BIGSERIAL,
  "employee_id" BIGINT NOT NULL,
  "name" VARCHAR(160) NOT NULL,
  "relationship" VARCHAR(80) NULL,
  "phone" VARCHAR(40) NULL,
  "address" TEXT NULL,
  "is_primary" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("emergency_contact_id")
);

CREATE TABLE "employee_position_history" (
  "position_history_id" BIGSERIAL,
  "employee_id" BIGINT NOT NULL,
  "effective_date" DATE NOT NULL,
  "change_type" VARCHAR(30) NOT NULL DEFAULT 'Employment',
  "old_position_id" BIGINT NULL,
  "new_position_id" BIGINT NULL,
  "old_salary_grade_id" BIGINT NULL,
  "new_salary_grade_id" BIGINT NULL,
  "notes" TEXT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("position_history_id"),
  CONSTRAINT chk_employee_position_history_change_type CHECK ("change_type" IN ('Employment', 'Promotion', 'Transfer'))
);

CREATE TABLE "employee_exit_records" (
  "exit_record_id" BIGSERIAL,
  "employee_id" BIGINT NOT NULL UNIQUE,
  "exit_type" VARCHAR(30) NOT NULL,
  "exit_date" DATE NOT NULL,
  "clearance_status" VARCHAR(20) NOT NULL,
  "coe_status" VARCHAR(20) NOT NULL,
  "notes" TEXT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("exit_record_id"),
  CONSTRAINT chk_employee_exit_records_exit_type CHECK ("exit_type" IN ('Resigned', 'Retired', 'Terminated')),
  CONSTRAINT chk_employee_exit_records_clearance_status CHECK ("clearance_status" IN ('Pending', 'Cleared')),
  CONSTRAINT chk_employee_exit_records_coe_status CHECK ("coe_status" IN ('Pending', 'Issued'))
);

CREATE TABLE "employee_documents" (
  "document_id" BIGSERIAL,
  "employee_id" BIGINT NOT NULL,
  "document_code" VARCHAR(50) NOT NULL,
  "title" VARCHAR(200) NOT NULL,
  "category" VARCHAR(80) NOT NULL,
  "file_path" TEXT NULL,
  "mime_type" VARCHAR(100) NULL,
  "file_size_bytes" BIGINT NULL,
  "document_status" VARCHAR(30) NOT NULL,
  "document_date" DATE NULL,
  "expiry_date" DATE NULL,
  "last_updated_at" TIMESTAMP NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("document_id"),
  CONSTRAINT uq_employee_documents_natural UNIQUE ("employee_id", "document_code")
);

-- ---------------------------------------------------------------------------
-- Domain 2: Recruitment (job publishing, applications, screening, interviews,
-- assessments)
-- ---------------------------------------------------------------------------

CREATE TABLE "job_posts" (
  "job_post_id" BIGSERIAL,
  "slug" VARCHAR(120) NOT NULL UNIQUE,
  "title" VARCHAR(150) NOT NULL,
  "department_id" BIGINT NOT NULL,
  "position_id" BIGINT NULL,
  "employment_type" VARCHAR(30) NOT NULL,
  "schedule" VARCHAR(120) NULL,
  "salary_min" NUMERIC(12,2) NULL,
  "salary_max" NUMERIC(12,2) NULL,
  "vacancies" INT NOT NULL DEFAULT 1,
  -- NOTE: `filled_count` is a derived counter; maintain it in the same
  -- transaction as applicant->new_hire conversion (see PRD Section 11).
  "filled_count" INT NOT NULL DEFAULT 0,
  "posted_date" DATE NULL,
  "status" VARCHAR(20) NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "experience_level" VARCHAR(50) NULL,
  "education_level" VARCHAR(100) NULL,
  "summary" TEXT NULL,
  "description" TEXT NULL,
  "responsibilities_json" JSONB NULL,
  "qualifications_json" JSONB NULL,
  "skills_json" JSONB NULL,
  "benefits_json" JSONB NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("job_post_id"),
  CONSTRAINT chk_job_posts_status CHECK ("status" IN ('Open', 'Closed', 'Draft')),
  CONSTRAINT chk_job_posts_employment_type CHECK ("employment_type" IN ('Full-time', 'Part-time', 'Contract', 'Seasonal')),
  CONSTRAINT chk_job_posts_experience_level CHECK ("experience_level" IS NULL OR "experience_level" IN ('No Experience', '1-2 Years', '3-5 Years', '5+ Years')),
  CONSTRAINT chk_job_posts_education_level CHECK ("education_level" IS NULL OR "education_level" IN ('High School Graduate', 'Vocational / TESDA', 'College Level', 'Bachelor''s Degree'))
);

CREATE TABLE "job_post_platforms" (
  "job_post_platform_id" BIGSERIAL,
  "job_post_id" BIGINT NOT NULL,
  "platform" VARCHAR(60) NOT NULL,
  "published_at" TIMESTAMP NULL,
  "status" VARCHAR(20) NOT NULL DEFAULT 'published',
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("job_post_platform_id"),
  CONSTRAINT uq_job_post_platforms_natural UNIQUE ("job_post_id", "platform"),
  CONSTRAINT chk_job_post_platforms_status CHECK ("status" IN ('published', 'unpublished'))
);

CREATE TABLE "applicants" (
  "applicant_id" BIGSERIAL,
  "applicant_code" VARCHAR(40) NOT NULL UNIQUE,
  "job_post_id" BIGINT NOT NULL,
  "name" VARCHAR(160) NOT NULL,
  "email" VARCHAR(190) NOT NULL,
  "phone" VARCHAR(40) NULL,
  "applied_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "fit_score" NUMERIC(5,2) NULL,
  "status" VARCHAR(30) NOT NULL,
  "stage" VARCHAR(40) NOT NULL,
  "source" VARCHAR(60) NULL,
  "resume_file_path" TEXT NULL,
  "summary" TEXT NULL,
  "flags_json" JSONB NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("applicant_id"),
  CONSTRAINT chk_applicants_status CHECK ("status" IN ('fit', 'other-role', 'credential', 'not-fit')),
  CONSTRAINT chk_applicants_stage CHECK ("stage" IN ('Screened', 'Interview Scheduled', 'Assessed', 'Offer', 'Hired', 'Rejected'))
);

CREATE TABLE "applicant_screening_entities" (
  "entity_id" BIGSERIAL,
  "applicant_id" BIGINT NOT NULL,
  "label" VARCHAR(80) NOT NULL,
  "value" TEXT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("entity_id")
);

CREATE TABLE "applicant_screening_scores" (
  "score_id" BIGSERIAL,
  "applicant_id" BIGINT NOT NULL,
  "criterion" VARCHAR(120) NOT NULL,
  "score" NUMERIC(5,2) NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("score_id")
);

CREATE TABLE "interviews" (
  "interview_id" BIGSERIAL,
  "interview_code" VARCHAR(40) NOT NULL UNIQUE,
  "applicant_id" BIGINT NOT NULL,
  "scheduled_date" DATE NOT NULL,
  "scheduled_time" TIME NOT NULL,
  "mode" VARCHAR(20) NOT NULL,
  "interviewer_employee_id" BIGINT NULL,
  "interviewer_name" VARCHAR(160) NULL,
  "status" VARCHAR(20) NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("interview_id"),
  CONSTRAINT chk_interviews_mode CHECK ("mode" IN ('On-site', 'Virtual')),
  CONSTRAINT chk_interviews_status CHECK ("status" IN ('Scheduled', 'Completed', 'No Show'))
);

CREATE TABLE "applicant_assessments" (
  "assessment_id" BIGSERIAL,
  "applicant_id" BIGINT NOT NULL,
  "assessor_user_id" BIGINT NULL,
  "assessment_date" DATE NOT NULL,
  "scores_json" JSONB NULL,
  "total_score" NUMERIC(5,2) NULL,
  "outcome" VARCHAR(20) NOT NULL,
  "remarks" TEXT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("assessment_id"),
  CONSTRAINT chk_applicant_assessments_outcome CHECK ("outcome" IN ('Recommended', 'Hold', 'Not Recommended'))
);

-- ---------------------------------------------------------------------------
-- Domain 3: Hiring & Onboarding (requisitions, new hires, checklists)
-- ---------------------------------------------------------------------------

CREATE TABLE "requisitions" (
  "requisition_id" BIGSERIAL,
  "requisition_code" VARCHAR(40) NOT NULL UNIQUE,
  "position_id" BIGINT NULL,
  "position_title" VARCHAR(150) NULL,
  "department_id" BIGINT NOT NULL,
  "requested_by_user_id" BIGINT NULL,
  "requested_count" INT NOT NULL,
  "urgency" VARCHAR(20) NOT NULL,
  "justification" TEXT NOT NULL,
  "status" VARCHAR(20) NOT NULL,
  "requested_at" DATE NOT NULL,
  "converted_job_post_id" BIGINT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("requisition_id"),
  CONSTRAINT chk_requisitions_urgency CHECK ("urgency" IN ('Normal', 'High', 'Urgent', 'Low')),
  CONSTRAINT chk_requisitions_status CHECK ("status" IN ('Pending', 'Done', 'Converted'))
);

CREATE TABLE "new_hires" (
  "new_hire_id" BIGSERIAL,
  "new_hire_code" VARCHAR(40) NOT NULL UNIQUE,
  "applicant_id" BIGINT NULL,
  "employee_id" BIGINT NULL,
  "name" VARCHAR(160) NOT NULL,
  "email" VARCHAR(190) NULL,
  "phone" VARCHAR(40) NULL,
  "position_id" BIGINT NULL,
  "department_id" BIGINT NULL,
  "stage" VARCHAR(30) NOT NULL,
  "start_date" DATE NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("new_hire_id"),
  CONSTRAINT chk_new_hires_stage CHECK ("stage" IN ('Pre-onboarding', 'Probationary', 'Regular'))
);

CREATE TABLE "onboarding_checklist_templates" (
  "template_id" BIGSERIAL,
  "template_code" VARCHAR(40) NOT NULL UNIQUE,
  "title" VARCHAR(200) NOT NULL,
  "phase" VARCHAR(30) NOT NULL,
  "position_scope_json" JSONB NULL,
  "status" VARCHAR(20) NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("template_id"),
  CONSTRAINT chk_onboarding_checklist_templates_phase CHECK ("phase" IN ('Pre-onboarding', 'Onboarding', 'Probationary', 'Regular')),
  CONSTRAINT chk_onboarding_checklist_templates_status CHECK ("status" IN ('Active', 'Inactive'))
);

CREATE TABLE "onboarding_checklist_items" (
  "template_item_id" BIGSERIAL,
  "template_id" BIGINT NOT NULL,
  "item_text" TEXT NOT NULL,
  "sort_order" INT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("template_item_id")
);

CREATE TABLE "employee_onboarding_items" (
  "employee_onboarding_item_id" BIGSERIAL,
  "employee_id" BIGINT NOT NULL,
  "new_hire_id" BIGINT NULL,
  "template_item_id" BIGINT NULL,
  "item_text" TEXT NOT NULL,
  "done" BOOLEAN NOT NULL DEFAULT FALSE,
  "completed_at" TIMESTAMP NULL,
  "completed_by_user_id" BIGINT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("employee_onboarding_item_id")
);

CREATE TABLE "checklist_requests" (
  "checklist_request_id" BIGSERIAL,
  "request_code" VARCHAR(40) NOT NULL UNIQUE,
  "employee_id" BIGINT NOT NULL,
  "template_id" BIGINT NULL,
  "phase" VARCHAR(30) NOT NULL,
  "items_json" JSONB NULL,
  "status" VARCHAR(30) NOT NULL DEFAULT 'Pending',
  "requested_by_user_id" BIGINT NULL,
  "requested_at" DATE NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("checklist_request_id"),
  CONSTRAINT chk_checklist_requests_phase CHECK ("phase" IN ('Pre-onboarding', 'Probationary', 'Regular')),
  CONSTRAINT chk_checklist_requests_status CHECK ("status" IN ('Pending', 'Approved', 'Rejected', 'Completed'))
);

-- ---------------------------------------------------------------------------
-- Domain 4: Employee Self-Service (categories, requests, attendance,
-- schedules, leave)
-- ---------------------------------------------------------------------------

CREATE TABLE "ess_categories" (
  "ess_category_id" BIGSERIAL,
  "code" VARCHAR(40) NOT NULL UNIQUE,
  "name" VARCHAR(120) NOT NULL,
  "description" TEXT NULL,
  "is_open" BOOLEAN NOT NULL DEFAULT TRUE,
  "sort_order" INT NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("ess_category_id")
);

CREATE TABLE "ess_requests" (
  "ess_request_id" BIGSERIAL,
  "request_code" VARCHAR(40) NOT NULL UNIQUE,
  "employee_id" BIGINT NOT NULL,
  "category_id" BIGINT NULL,
  "request_type" VARCHAR(100) NOT NULL,
  "filed_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "date_from" DATE NULL,
  "date_to" DATE NULL,
  "status" VARCHAR(30) NOT NULL,
  "assigned_to_user_id" BIGINT NULL,
  "details" TEXT NULL,
  "review_note" TEXT NULL,
  "returned_count" INT NOT NULL DEFAULT 0,
  "attachment_path" TEXT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("ess_request_id"),
  CONSTRAINT chk_ess_requests_status CHECK ("status" IN ('Pending', 'Under Review', 'Approved', 'Rejected', 'Completed'))
);

CREATE TABLE "leave_balances" (
  "leave_balance_id" BIGSERIAL,
  "employee_id" BIGINT NOT NULL,
  "leave_type" VARCHAR(80) NOT NULL,
  "period_year" SMALLINT NOT NULL,
  "total_days" NUMERIC(6,2) NOT NULL DEFAULT 0,
  "used_days" NUMERIC(6,2) NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("leave_balance_id"),
  CONSTRAINT uq_leave_balances_natural UNIQUE ("employee_id", "leave_type", "period_year")
);

CREATE TABLE "attendance_records" (
  "attendance_id" BIGSERIAL,
  "employee_id" BIGINT NOT NULL,
  "work_date" DATE NOT NULL,
  "time_in" TIMESTAMP NULL,
  "time_out" TIMESTAMP NULL,
  "break_in" TIMESTAMP NULL,
  "break_out" TIMESTAMP NULL,
  "hours_worked" NUMERIC(7,2) NOT NULL DEFAULT 0,
  "late_minutes" INT NOT NULL DEFAULT 0,
  "undertime_minutes" INT NOT NULL DEFAULT 0,
  "overtime_hours" NUMERIC(7,2) NOT NULL DEFAULT 0,
  "remark" VARCHAR(255) NULL,
  "status" VARCHAR(30) NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("attendance_id"),
  CONSTRAINT uq_attendance_records_natural UNIQUE ("employee_id", "work_date")
);

CREATE TABLE "work_schedules" (
  "work_schedule_id" BIGSERIAL,
  "employee_id" BIGINT NOT NULL,
  "day_of_week" SMALLINT NOT NULL,
  "shift_name" VARCHAR(80) NULL,
  "start_time" TIME NULL,
  "end_time" TIME NULL,
  "location" VARCHAR(120) NULL,
  "is_rest_day" BOOLEAN NOT NULL DEFAULT FALSE,
  "effective_from" DATE NOT NULL,
  "effective_to" DATE NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("work_schedule_id"),
  CONSTRAINT chk_work_schedules_day_of_week CHECK ("day_of_week" BETWEEN 0 AND 6)
);

-- ---------------------------------------------------------------------------
-- Domain 5: Payroll & Benefits
-- ---------------------------------------------------------------------------

CREATE TABLE "payroll_periods" (
  "payroll_period_id" BIGSERIAL,
  "period_code" VARCHAR(40) NOT NULL UNIQUE,
  "period_name" VARCHAR(120) NOT NULL,
  "period_start" DATE NOT NULL,
  "period_end" DATE NOT NULL,
  "payout_date" DATE NULL,
  "status" VARCHAR(20) NOT NULL DEFAULT 'Open',
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("payroll_period_id"),
  CONSTRAINT chk_payroll_periods_status CHECK ("status" IN ('Open', 'Closed'))
);

CREATE TABLE "payroll_records" (
  "payroll_record_id" BIGSERIAL,
  "employee_id" BIGINT NOT NULL,
  "payroll_period_id" BIGINT NULL,
  "pay_period_start" DATE NOT NULL,
  "pay_period_end" DATE NOT NULL,
  "payout_date" DATE NULL,
  "gross_pay" NUMERIC(12,2) NOT NULL,
  "net_pay" NUMERIC(12,2) NOT NULL,
  "status" VARCHAR(30) NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("payroll_record_id"),
  CONSTRAINT chk_payroll_records_status CHECK ("status" IN ('Draft', 'Finalized', 'Released'))
);

CREATE TABLE "payroll_items" (
  "payroll_item_id" BIGSERIAL,
  "payroll_record_id" BIGINT NOT NULL,
  "item_type" VARCHAR(30) NOT NULL,
  "label" VARCHAR(120) NOT NULL,
  "amount" NUMERIC(12,2) NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("payroll_item_id"),
  CONSTRAINT chk_payroll_items_item_type CHECK ("item_type" IN ('Earning', 'Deduction'))
);

CREATE TABLE "employee_benefits" (
  "employee_benefit_id" BIGSERIAL,
  "employee_id" BIGINT NOT NULL,
  "benefit_name" VARCHAR(100) NOT NULL,
  "reference_value" VARCHAR(190) NULL,
  "note" TEXT NULL,
  "effective_date" DATE NULL,
  "end_date" DATE NULL,
  "status" VARCHAR(30) NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("employee_benefit_id"),
  CONSTRAINT chk_employee_benefits_status CHECK ("status" IN ('Active', 'Inactive', 'Expired'))
);

-- ---------------------------------------------------------------------------
-- Domain 6: Learning & Performance
-- ---------------------------------------------------------------------------

CREATE TABLE "learning_courses" (
  "course_id" BIGSERIAL,
  "course_code" VARCHAR(40) NOT NULL UNIQUE,
  "title" VARCHAR(200) NOT NULL,
  "category" VARCHAR(120) NULL,
  "description" TEXT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("course_id")
);

CREATE TABLE "employee_learning" (
  "employee_learning_id" BIGSERIAL,
  "employee_id" BIGINT NOT NULL,
  "course_id" BIGINT NOT NULL,
  "status" VARCHAR(30) NOT NULL,
  "score" NUMERIC(5,2) NULL,
  "assigned_date" DATE NULL,
  "completed_date" DATE NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("employee_learning_id"),
  CONSTRAINT uq_employee_learning_natural UNIQUE ("employee_id", "course_id"),
  CONSTRAINT chk_employee_learning_status CHECK ("status" IN ('Assigned', 'In Progress', 'Completed'))
);

CREATE TABLE "performance_reviews" (
  "performance_review_id" BIGSERIAL,
  "employee_id" BIGINT NOT NULL,
  "review_period" VARCHAR(80) NOT NULL,
  "review_date" DATE NULL,
  "competency_level" VARCHAR(50) NULL,
  "overall_rating" NUMERIC(5,2) NULL,
  "salary_grade_id" BIGINT NULL,
  "salary_step" VARCHAR(30) NULL,
  "evaluator_user_id" BIGINT NULL,
  "comments" TEXT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("performance_review_id")
);

CREATE TABLE "hr3_recommendations" (
  "recommendation_id" BIGSERIAL,
  "employee_id" BIGINT NOT NULL,
  "recommendation_type" VARCHAR(40) NOT NULL,
  "evaluation_score" NUMERIC(5,2) NULL,
  "evaluator_user_id" BIGINT NULL,
  "date_submitted" DATE NOT NULL,
  "status" VARCHAR(40) NOT NULL,
  "suggested_position_id" BIGINT NULL,
  "suggested_salary_grade_id" BIGINT NULL,
  "current_employment_type" VARCHAR(30) NULL,
  "comments" TEXT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("recommendation_id"),
  CONSTRAINT chk_hr3_recommendations_recommendation_type CHECK ("recommendation_type" IN ('Regularization', 'Promotion', 'Performance Review')),
  CONSTRAINT chk_hr3_recommendations_status CHECK ("status" IN ('Pending HR Action', 'Approved & Processed', 'Deferred'))
);

-- ---------------------------------------------------------------------------
-- Domain 7: Access Control, Audit & System
-- ---------------------------------------------------------------------------

CREATE TABLE "system_roles" (
  "role_id" BIGSERIAL,
  "role_name" VARCHAR(50) NOT NULL UNIQUE,
  "description" TEXT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("role_id")
);

CREATE TABLE "role_permissions" (
  "role_permission_id" BIGSERIAL,
  "role_id" BIGINT NOT NULL,
  "module_name" VARCHAR(100) NOT NULL,
  "permission_level" VARCHAR(40) NOT NULL DEFAULT 'None',
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("role_permission_id"),
  CONSTRAINT uq_role_permissions_natural UNIQUE ("role_id", "module_name"),
  CONSTRAINT chk_role_permissions_module_name CHECK ("module_name" IN ('Dashboard', 'Applicant Management', 'Recruitment Management', 'New Hire Onboarding', 'Core HCM', 'Employee Records', 'ESS Management', 'User Management', 'Audit Logs', 'Settings')),
  CONSTRAINT chk_role_permissions_permission_level CHECK ("permission_level" IN ('Full', 'View', 'Edit', 'Delete', 'Approve / Reject Only', 'None'))
);

CREATE TABLE "system_users" (
  "system_user_id" BIGSERIAL,
  "username" VARCHAR(100) NOT NULL UNIQUE,
  "email" VARCHAR(190) NOT NULL UNIQUE,
  "password_hash" VARCHAR(255) NOT NULL,
  "full_name" VARCHAR(160) NULL,
  "department_name" VARCHAR(120) NULL,
  "employee_id" BIGINT NULL UNIQUE,
  "role_id" BIGINT NOT NULL,
  "status" VARCHAR(20) NOT NULL,
  "last_login_at" TIMESTAMP NULL,
  "last_login_ip" VARCHAR(45) NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("system_user_id"),
  CONSTRAINT chk_system_users_status CHECK ("status" IN ('Active', 'Suspended', 'Disabled'))
);

CREATE TABLE "notifications" (
  "notification_id" BIGSERIAL,
  "system_user_id" BIGINT NOT NULL,
  "type" VARCHAR(50) NOT NULL,
  "title" VARCHAR(200) NOT NULL,
  "body" TEXT NULL,
  "module_name" VARCHAR(100) NULL,
  "target_type" VARCHAR(100) NULL,
  "target_id" VARCHAR(100) NULL,
  "is_read" BOOLEAN NOT NULL DEFAULT FALSE,
  "read_at" TIMESTAMP NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("notification_id")
);

CREATE TABLE "user_login_activity" (
  "login_activity_id" BIGSERIAL,
  "system_user_id" BIGINT NOT NULL,
  "login_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ip_address" VARCHAR(45) NULL,
  "device_info" VARCHAR(255) NULL,
  "user_agent" TEXT NULL,
  "status" VARCHAR(20) NOT NULL DEFAULT 'success',
  PRIMARY KEY ("login_activity_id"),
  CONSTRAINT chk_user_login_activity_status CHECK ("status" IN ('success', 'failed'))
);

CREATE TABLE "audit_logs" (
  "audit_log_id" BIGSERIAL,
  "system_user_id" BIGINT NULL,
  "actor_role" VARCHAR(50) NULL,
  "actor_department" VARCHAR(120) NULL,
  "occurred_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "action" VARCHAR(255) NOT NULL,
  "module_name" VARCHAR(100) NOT NULL,
  "target_type" VARCHAR(100) NULL,
  "target_id" VARCHAR(100) NULL,
  "details" TEXT NULL,
  "severity" VARCHAR(20) NOT NULL,
  "ip_address" VARCHAR(45) NULL,
  "device_info" VARCHAR(255) NULL,
  PRIMARY KEY ("audit_log_id"),
  CONSTRAINT chk_audit_logs_severity CHECK ("severity" IN ('Info', 'Warning', 'Critical'))
);

CREATE TABLE "announcements" (
  "announcement_id" BIGSERIAL,
  "published_date" DATE NOT NULL,
  "title" VARCHAR(200) NOT NULL,
  "body" TEXT NOT NULL,
  "audience" VARCHAR(20) NOT NULL DEFAULT 'All',
  "created_by_user_id" BIGINT NULL,
  "status" VARCHAR(20) NOT NULL DEFAULT 'published',
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("announcement_id"),
  CONSTRAINT chk_announcements_audience CHECK ("audience" IN ('All', 'Admin', 'Employee', 'Super Admin')),
  CONSTRAINT chk_announcements_status CHECK ("status" IN ('draft', 'published', 'archived'))
);

CREATE TABLE "system_settings" (
  "setting_id" BIGSERIAL,
  "setting_key" VARCHAR(120) NOT NULL UNIQUE,
  "setting_value" JSONB NOT NULL,
  "updated_by_user_id" BIGINT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("setting_id")
);

-- ---------------------------------------------------------------------------
-- Foreign keys (added after all tables to allow circular references)
-- ---------------------------------------------------------------------------

ALTER TABLE "departments" ADD CONSTRAINT fk_departments_head_employee_id FOREIGN KEY ("head_employee_id") REFERENCES "employees" ("employee_id");
ALTER TABLE "positions" ADD CONSTRAINT fk_positions_department_id FOREIGN KEY ("department_id") REFERENCES "departments" ("department_id");
ALTER TABLE "positions" ADD CONSTRAINT fk_positions_salary_grade_id FOREIGN KEY ("salary_grade_id") REFERENCES "salary_grades" ("salary_grade_id");
ALTER TABLE "employees" ADD CONSTRAINT fk_employees_position_id FOREIGN KEY ("position_id") REFERENCES "positions" ("position_id");
ALTER TABLE "employees" ADD CONSTRAINT fk_employees_department_id FOREIGN KEY ("department_id") REFERENCES "departments" ("department_id");
ALTER TABLE "employees" ADD CONSTRAINT fk_employees_supervisor_employee_id FOREIGN KEY ("supervisor_employee_id") REFERENCES "employees" ("employee_id");
ALTER TABLE "employees" ADD CONSTRAINT fk_employees_salary_grade_id FOREIGN KEY ("salary_grade_id") REFERENCES "salary_grades" ("salary_grade_id");
ALTER TABLE "employee_emergency_contacts" ADD CONSTRAINT fk_employee_emergency_contacts_employee_id FOREIGN KEY ("employee_id") REFERENCES "employees" ("employee_id") ON DELETE CASCADE;
ALTER TABLE "employee_position_history" ADD CONSTRAINT fk_employee_position_history_employee_id FOREIGN KEY ("employee_id") REFERENCES "employees" ("employee_id") ON DELETE CASCADE;
ALTER TABLE "employee_position_history" ADD CONSTRAINT fk_employee_position_history_old_position_id FOREIGN KEY ("old_position_id") REFERENCES "positions" ("position_id");
ALTER TABLE "employee_position_history" ADD CONSTRAINT fk_employee_position_history_new_position_id FOREIGN KEY ("new_position_id") REFERENCES "positions" ("position_id");
ALTER TABLE "employee_position_history" ADD CONSTRAINT fk_employee_position_history_old_salary_grade_id FOREIGN KEY ("old_salary_grade_id") REFERENCES "salary_grades" ("salary_grade_id");
ALTER TABLE "employee_position_history" ADD CONSTRAINT fk_employee_position_history_new_salary_grade_id FOREIGN KEY ("new_salary_grade_id") REFERENCES "salary_grades" ("salary_grade_id");
ALTER TABLE "employee_exit_records" ADD CONSTRAINT fk_employee_exit_records_employee_id FOREIGN KEY ("employee_id") REFERENCES "employees" ("employee_id") ON DELETE CASCADE;
ALTER TABLE "employee_documents" ADD CONSTRAINT fk_employee_documents_employee_id FOREIGN KEY ("employee_id") REFERENCES "employees" ("employee_id") ON DELETE CASCADE;
ALTER TABLE "job_posts" ADD CONSTRAINT fk_job_posts_department_id FOREIGN KEY ("department_id") REFERENCES "departments" ("department_id");
ALTER TABLE "job_posts" ADD CONSTRAINT fk_job_posts_position_id FOREIGN KEY ("position_id") REFERENCES "positions" ("position_id");
ALTER TABLE "job_post_platforms" ADD CONSTRAINT fk_job_post_platforms_job_post_id FOREIGN KEY ("job_post_id") REFERENCES "job_posts" ("job_post_id") ON DELETE CASCADE;
ALTER TABLE "applicants" ADD CONSTRAINT fk_applicants_job_post_id FOREIGN KEY ("job_post_id") REFERENCES "job_posts" ("job_post_id");
ALTER TABLE "applicant_screening_entities" ADD CONSTRAINT fk_applicant_screening_entities_applicant_id FOREIGN KEY ("applicant_id") REFERENCES "applicants" ("applicant_id") ON DELETE CASCADE;
ALTER TABLE "applicant_screening_scores" ADD CONSTRAINT fk_applicant_screening_scores_applicant_id FOREIGN KEY ("applicant_id") REFERENCES "applicants" ("applicant_id") ON DELETE CASCADE;
ALTER TABLE "interviews" ADD CONSTRAINT fk_interviews_applicant_id FOREIGN KEY ("applicant_id") REFERENCES "applicants" ("applicant_id") ON DELETE CASCADE;
ALTER TABLE "interviews" ADD CONSTRAINT fk_interviews_interviewer_employee_id FOREIGN KEY ("interviewer_employee_id") REFERENCES "employees" ("employee_id");
ALTER TABLE "applicant_assessments" ADD CONSTRAINT fk_applicant_assessments_applicant_id FOREIGN KEY ("applicant_id") REFERENCES "applicants" ("applicant_id") ON DELETE CASCADE;
ALTER TABLE "applicant_assessments" ADD CONSTRAINT fk_applicant_assessments_assessor_user_id FOREIGN KEY ("assessor_user_id") REFERENCES "system_users" ("system_user_id");
ALTER TABLE "requisitions" ADD CONSTRAINT fk_requisitions_position_id FOREIGN KEY ("position_id") REFERENCES "positions" ("position_id");
ALTER TABLE "requisitions" ADD CONSTRAINT fk_requisitions_department_id FOREIGN KEY ("department_id") REFERENCES "departments" ("department_id");
ALTER TABLE "requisitions" ADD CONSTRAINT fk_requisitions_requested_by_user_id FOREIGN KEY ("requested_by_user_id") REFERENCES "system_users" ("system_user_id");
ALTER TABLE "requisitions" ADD CONSTRAINT fk_requisitions_converted_job_post_id FOREIGN KEY ("converted_job_post_id") REFERENCES "job_posts" ("job_post_id");
ALTER TABLE "new_hires" ADD CONSTRAINT fk_new_hires_applicant_id FOREIGN KEY ("applicant_id") REFERENCES "applicants" ("applicant_id");
ALTER TABLE "new_hires" ADD CONSTRAINT fk_new_hires_employee_id FOREIGN KEY ("employee_id") REFERENCES "employees" ("employee_id");
ALTER TABLE "new_hires" ADD CONSTRAINT fk_new_hires_position_id FOREIGN KEY ("position_id") REFERENCES "positions" ("position_id");
ALTER TABLE "new_hires" ADD CONSTRAINT fk_new_hires_department_id FOREIGN KEY ("department_id") REFERENCES "departments" ("department_id");
ALTER TABLE "onboarding_checklist_items" ADD CONSTRAINT fk_onboarding_checklist_items_template_id FOREIGN KEY ("template_id") REFERENCES "onboarding_checklist_templates" ("template_id") ON DELETE CASCADE;
ALTER TABLE "employee_onboarding_items" ADD CONSTRAINT fk_employee_onboarding_items_employee_id FOREIGN KEY ("employee_id") REFERENCES "employees" ("employee_id") ON DELETE CASCADE;
ALTER TABLE "employee_onboarding_items" ADD CONSTRAINT fk_employee_onboarding_items_new_hire_id FOREIGN KEY ("new_hire_id") REFERENCES "new_hires" ("new_hire_id");
ALTER TABLE "employee_onboarding_items" ADD CONSTRAINT fk_employee_onboarding_items_template_item_id FOREIGN KEY ("template_item_id") REFERENCES "onboarding_checklist_items" ("template_item_id");
ALTER TABLE "employee_onboarding_items" ADD CONSTRAINT fk_employee_onboarding_items_completed_by_user_id FOREIGN KEY ("completed_by_user_id") REFERENCES "system_users" ("system_user_id");
ALTER TABLE "checklist_requests" ADD CONSTRAINT fk_checklist_requests_employee_id FOREIGN KEY ("employee_id") REFERENCES "employees" ("employee_id");
ALTER TABLE "checklist_requests" ADD CONSTRAINT fk_checklist_requests_template_id FOREIGN KEY ("template_id") REFERENCES "onboarding_checklist_templates" ("template_id");
ALTER TABLE "checklist_requests" ADD CONSTRAINT fk_checklist_requests_requested_by_user_id FOREIGN KEY ("requested_by_user_id") REFERENCES "system_users" ("system_user_id");
ALTER TABLE "ess_requests" ADD CONSTRAINT fk_ess_requests_employee_id FOREIGN KEY ("employee_id") REFERENCES "employees" ("employee_id");
ALTER TABLE "ess_requests" ADD CONSTRAINT fk_ess_requests_category_id FOREIGN KEY ("category_id") REFERENCES "ess_categories" ("ess_category_id") ON DELETE SET NULL;
ALTER TABLE "ess_requests" ADD CONSTRAINT fk_ess_requests_assigned_to_user_id FOREIGN KEY ("assigned_to_user_id") REFERENCES "system_users" ("system_user_id");
ALTER TABLE "leave_balances" ADD CONSTRAINT fk_leave_balances_employee_id FOREIGN KEY ("employee_id") REFERENCES "employees" ("employee_id") ON DELETE CASCADE;
ALTER TABLE "attendance_records" ADD CONSTRAINT fk_attendance_records_employee_id FOREIGN KEY ("employee_id") REFERENCES "employees" ("employee_id") ON DELETE CASCADE;
ALTER TABLE "work_schedules" ADD CONSTRAINT fk_work_schedules_employee_id FOREIGN KEY ("employee_id") REFERENCES "employees" ("employee_id") ON DELETE CASCADE;
ALTER TABLE "payroll_records" ADD CONSTRAINT fk_payroll_records_employee_id FOREIGN KEY ("employee_id") REFERENCES "employees" ("employee_id");
ALTER TABLE "payroll_records" ADD CONSTRAINT fk_payroll_records_payroll_period_id FOREIGN KEY ("payroll_period_id") REFERENCES "payroll_periods" ("payroll_period_id");
ALTER TABLE "payroll_items" ADD CONSTRAINT fk_payroll_items_payroll_record_id FOREIGN KEY ("payroll_record_id") REFERENCES "payroll_records" ("payroll_record_id") ON DELETE CASCADE;
ALTER TABLE "employee_benefits" ADD CONSTRAINT fk_employee_benefits_employee_id FOREIGN KEY ("employee_id") REFERENCES "employees" ("employee_id") ON DELETE CASCADE;
ALTER TABLE "employee_learning" ADD CONSTRAINT fk_employee_learning_employee_id FOREIGN KEY ("employee_id") REFERENCES "employees" ("employee_id") ON DELETE CASCADE;
ALTER TABLE "employee_learning" ADD CONSTRAINT fk_employee_learning_course_id FOREIGN KEY ("course_id") REFERENCES "learning_courses" ("course_id");
ALTER TABLE "performance_reviews" ADD CONSTRAINT fk_performance_reviews_employee_id FOREIGN KEY ("employee_id") REFERENCES "employees" ("employee_id");
ALTER TABLE "performance_reviews" ADD CONSTRAINT fk_performance_reviews_salary_grade_id FOREIGN KEY ("salary_grade_id") REFERENCES "salary_grades" ("salary_grade_id");
ALTER TABLE "performance_reviews" ADD CONSTRAINT fk_performance_reviews_evaluator_user_id FOREIGN KEY ("evaluator_user_id") REFERENCES "system_users" ("system_user_id");
ALTER TABLE "hr3_recommendations" ADD CONSTRAINT fk_hr3_recommendations_employee_id FOREIGN KEY ("employee_id") REFERENCES "employees" ("employee_id");
ALTER TABLE "hr3_recommendations" ADD CONSTRAINT fk_hr3_recommendations_evaluator_user_id FOREIGN KEY ("evaluator_user_id") REFERENCES "system_users" ("system_user_id");
ALTER TABLE "hr3_recommendations" ADD CONSTRAINT fk_hr3_recommendations_suggested_position_id FOREIGN KEY ("suggested_position_id") REFERENCES "positions" ("position_id");
ALTER TABLE "hr3_recommendations" ADD CONSTRAINT fk_hr3_recommendations_suggested_salary_grade_id FOREIGN KEY ("suggested_salary_grade_id") REFERENCES "salary_grades" ("salary_grade_id");
ALTER TABLE "role_permissions" ADD CONSTRAINT fk_role_permissions_role_id FOREIGN KEY ("role_id") REFERENCES "system_roles" ("role_id") ON DELETE CASCADE;
ALTER TABLE "system_users" ADD CONSTRAINT fk_system_users_employee_id FOREIGN KEY ("employee_id") REFERENCES "employees" ("employee_id");
ALTER TABLE "system_users" ADD CONSTRAINT fk_system_users_role_id FOREIGN KEY ("role_id") REFERENCES "system_roles" ("role_id");
ALTER TABLE "audit_logs" ADD CONSTRAINT fk_audit_logs_system_user_id FOREIGN KEY ("system_user_id") REFERENCES "system_users" ("system_user_id") ON DELETE SET NULL;
ALTER TABLE "notifications" ADD CONSTRAINT fk_notifications_system_user_id FOREIGN KEY ("system_user_id") REFERENCES "system_users" ("system_user_id") ON DELETE CASCADE;
ALTER TABLE "user_login_activity" ADD CONSTRAINT fk_user_login_activity_system_user_id FOREIGN KEY ("system_user_id") REFERENCES "system_users" ("system_user_id") ON DELETE CASCADE;
ALTER TABLE "announcements" ADD CONSTRAINT fk_announcements_created_by_user_id FOREIGN KEY ("created_by_user_id") REFERENCES "system_users" ("system_user_id");
ALTER TABLE "system_settings" ADD CONSTRAINT fk_system_settings_updated_by_user_id FOREIGN KEY ("updated_by_user_id") REFERENCES "system_users" ("system_user_id");

-- ---------------------------------------------------------------------------
-- Indexes (PostgreSQL does not auto-create indexes for FK columns)
-- ---------------------------------------------------------------------------

CREATE INDEX idx_departments_head_employee_id ON "departments" ("head_employee_id");
CREATE INDEX idx_positions_department_id ON "positions" ("department_id");
CREATE INDEX idx_positions_salary_grade_id ON "positions" ("salary_grade_id");
CREATE INDEX idx_employees_department_id ON "employees" ("department_id");
CREATE INDEX idx_employees_position_id ON "employees" ("position_id");
CREATE INDEX idx_employees_salary_grade_id ON "employees" ("salary_grade_id");
CREATE INDEX idx_employees_supervisor_employee_id ON "employees" ("supervisor_employee_id");
CREATE INDEX idx_employees_status ON "employees" ("status");
CREATE INDEX idx_employees_date_hired ON "employees" ("date_hired");
CREATE INDEX idx_employee_emergency_contacts_employee_id ON "employee_emergency_contacts" ("employee_id");
CREATE INDEX idx_employee_position_history_employee_id ON "employee_position_history" ("employee_id");
CREATE INDEX idx_employee_position_history_old_position_id ON "employee_position_history" ("old_position_id");
CREATE INDEX idx_employee_position_history_new_position_id ON "employee_position_history" ("new_position_id");
CREATE INDEX idx_employee_position_history_old_salary_grade_id ON "employee_position_history" ("old_salary_grade_id");
CREATE INDEX idx_employee_position_history_new_salary_grade_id ON "employee_position_history" ("new_salary_grade_id");
CREATE INDEX idx_employee_exit_records_employee_id ON "employee_exit_records" ("employee_id");
CREATE INDEX idx_employee_documents_category ON "employee_documents" ("category");
CREATE INDEX idx_employee_documents_document_status ON "employee_documents" ("document_status");
CREATE INDEX idx_job_posts_department_id ON "job_posts" ("department_id");
CREATE INDEX idx_job_posts_position_id ON "job_posts" ("position_id");
CREATE INDEX idx_job_posts_status_active ON "job_posts" ("status", "active");
CREATE INDEX idx_applicants_job_post_id ON "applicants" ("job_post_id");
CREATE INDEX idx_applicants_status ON "applicants" ("status");
CREATE INDEX idx_applicants_stage ON "applicants" ("stage");
CREATE INDEX idx_applicants_applied_at ON "applicants" ("applied_at");
CREATE INDEX idx_applicant_screening_entities_applicant_id ON "applicant_screening_entities" ("applicant_id");
CREATE INDEX idx_applicant_screening_scores_applicant_id ON "applicant_screening_scores" ("applicant_id");
CREATE INDEX idx_interviews_applicant_id ON "interviews" ("applicant_id");
CREATE INDEX idx_interviews_interviewer_employee_id ON "interviews" ("interviewer_employee_id");
CREATE INDEX idx_interviews_scheduled_date ON "interviews" ("scheduled_date");
CREATE INDEX idx_applicant_assessments_applicant_id ON "applicant_assessments" ("applicant_id");
CREATE INDEX idx_applicant_assessments_assessor_user_id ON "applicant_assessments" ("assessor_user_id");
CREATE INDEX idx_requisitions_position_id ON "requisitions" ("position_id");
CREATE INDEX idx_requisitions_department_id ON "requisitions" ("department_id");
CREATE INDEX idx_requisitions_requested_by_user_id ON "requisitions" ("requested_by_user_id");
CREATE INDEX idx_requisitions_converted_job_post_id ON "requisitions" ("converted_job_post_id");
CREATE INDEX idx_requisitions_status ON "requisitions" ("status");
CREATE INDEX idx_requisitions_requested_at ON "requisitions" ("requested_at");
CREATE INDEX idx_new_hires_applicant_id ON "new_hires" ("applicant_id");
CREATE INDEX idx_new_hires_employee_id ON "new_hires" ("employee_id");
CREATE INDEX idx_new_hires_position_id ON "new_hires" ("position_id");
CREATE INDEX idx_new_hires_department_id ON "new_hires" ("department_id");
CREATE INDEX idx_new_hires_stage ON "new_hires" ("stage");
CREATE INDEX idx_onboarding_checklist_items_template_id ON "onboarding_checklist_items" ("template_id");
CREATE INDEX idx_employee_onboarding_items_employee_id ON "employee_onboarding_items" ("employee_id");
CREATE INDEX idx_employee_onboarding_items_new_hire_id ON "employee_onboarding_items" ("new_hire_id");
CREATE INDEX idx_employee_onboarding_items_template_item_id ON "employee_onboarding_items" ("template_item_id");
CREATE INDEX idx_employee_onboarding_items_completed_by_user_id ON "employee_onboarding_items" ("completed_by_user_id");
CREATE INDEX idx_checklist_requests_employee_id ON "checklist_requests" ("employee_id");
CREATE INDEX idx_checklist_requests_template_id ON "checklist_requests" ("template_id");
CREATE INDEX idx_checklist_requests_requested_by_user_id ON "checklist_requests" ("requested_by_user_id");
CREATE INDEX idx_checklist_requests_status ON "checklist_requests" ("status");
CREATE INDEX idx_ess_requests_employee_id ON "ess_requests" ("employee_id");
CREATE INDEX idx_ess_requests_category_id ON "ess_requests" ("category_id");
CREATE INDEX idx_ess_requests_assigned_to_user_id ON "ess_requests" ("assigned_to_user_id");
CREATE INDEX idx_ess_requests_status ON "ess_requests" ("status");
CREATE INDEX idx_ess_requests_filed_at ON "ess_requests" ("filed_at");
CREATE INDEX idx_attendance_records_work_date ON "attendance_records" ("work_date");
CREATE INDEX idx_work_schedules_employee_id ON "work_schedules" ("employee_id");
CREATE INDEX idx_payroll_periods_status ON "payroll_periods" ("status");
CREATE INDEX idx_payroll_records_employee_id ON "payroll_records" ("employee_id");
CREATE INDEX idx_payroll_records_payroll_period_id ON "payroll_records" ("payroll_period_id");
CREATE INDEX idx_payroll_records_pay_period_start ON "payroll_records" ("pay_period_start");
CREATE INDEX idx_payroll_records_status ON "payroll_records" ("status");
CREATE INDEX idx_payroll_items_payroll_record_id ON "payroll_items" ("payroll_record_id");
CREATE INDEX idx_employee_benefits_employee_id ON "employee_benefits" ("employee_id");
CREATE INDEX idx_employee_learning_course_id ON "employee_learning" ("course_id");
CREATE INDEX idx_performance_reviews_employee_id ON "performance_reviews" ("employee_id");
CREATE INDEX idx_performance_reviews_salary_grade_id ON "performance_reviews" ("salary_grade_id");
CREATE INDEX idx_performance_reviews_evaluator_user_id ON "performance_reviews" ("evaluator_user_id");
CREATE INDEX idx_hr3_recommendations_employee_id ON "hr3_recommendations" ("employee_id");
CREATE INDEX idx_hr3_recommendations_evaluator_user_id ON "hr3_recommendations" ("evaluator_user_id");
CREATE INDEX idx_hr3_recommendations_suggested_position_id ON "hr3_recommendations" ("suggested_position_id");
CREATE INDEX idx_hr3_recommendations_suggested_salary_grade_id ON "hr3_recommendations" ("suggested_salary_grade_id");
CREATE INDEX idx_role_permissions_role_id ON "role_permissions" ("role_id");
CREATE INDEX idx_system_users_role_id ON "system_users" ("role_id");
CREATE INDEX idx_system_users_status ON "system_users" ("status");
CREATE INDEX idx_audit_logs_system_user_id ON "audit_logs" ("system_user_id");
CREATE INDEX idx_audit_logs_occurred_at ON "audit_logs" ("occurred_at");
CREATE INDEX idx_audit_logs_module_name ON "audit_logs" ("module_name");
CREATE INDEX idx_audit_logs_severity ON "audit_logs" ("severity");
CREATE INDEX idx_notifications_system_user_id ON "notifications" ("system_user_id");
CREATE INDEX idx_notifications_is_read ON "notifications" ("is_read");
CREATE INDEX idx_notifications_created_at ON "notifications" ("created_at");
CREATE INDEX idx_user_login_activity_system_user_id ON "user_login_activity" ("system_user_id");
CREATE INDEX idx_user_login_activity_login_at ON "user_login_activity" ("login_at");
CREATE INDEX idx_user_login_activity_status ON "user_login_activity" ("status");
CREATE INDEX idx_announcements_created_by_user_id ON "announcements" ("created_by_user_id");
CREATE INDEX idx_announcements_status ON "announcements" ("status");
CREATE INDEX idx_system_settings_updated_by_user_id ON "system_settings" ("updated_by_user_id");