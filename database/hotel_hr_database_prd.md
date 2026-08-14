# Hotel & Restaurant HR1 — Detailed Database PRD and Generation Specification

**Source analyzed:** `Hotel-and-Restaurant-HR1 - main.zip`, with primary evidence from `frontend/src` and its route/module/data files.  **Database proposal:** 34 tables.  **Database engines:** MySQL 8.0+ and PostgreSQL 15+ compatible design.

## 1. Purpose
This PRD defines the database to be implemented behind the existing Hotel & Restaurant HR frontend. It is intentionally evidence-driven: the database must represent the real domains and fields already exposed by the UI before introducing new entities. The design favors reuse of a master entity (department, position, employee, user, job post) over duplicate lookup tables and uses JSON only for source arrays whose decomposition would add tables without meaningful relational value.

## 2. Source-analysis rules
1. Treat `frontend/src/data/*.ts` as the current domain contract for the UI. The key contracts found are `Department`, `Position`, `Employee`, `SalaryGrade`, `HR3Recommendation`, `Applicant`, `Interview`, `Requisition`, `NewHire`, `ESSRequest`, `EssActivityLog`, `SystemUser`, audit entries, and the ESS datasets for attendance, schedules, leave balances, payroll, benefits, learning, performance, and documents.
2. Treat `frontend/src/components/modules/*.tsx` and `frontend/src/routes/*.tsx` as the workflow contract: Applicant Management, Recruitment Management, New Hire Onboarding, Core HCM, Employee Records, ESS Management, User/Settings, Audit Logs, and public/portal announcements.
3. Do not create tables merely because a frontend array exists. Static content such as FAQs, hotel facilities, system-module descriptions, and company marketing copy should stay configuration/content data unless an admin UI clearly requires CRUD persistence.
4. When the same value appears in several screens, create one authoritative master table and reference it with a foreign key. In particular, departments, positions, salary grades, employees, system users, roles, and job posts must not be duplicated in module-specific tables.
5. Never use plaintext passwords. `system_users.password_hash` stores only an adaptive password hash (Argon2id/bcrypt/scrypt managed by the application).

## 3. Frontend evidence map
| Frontend source | Database domains it drives |
|---|---|
| `src/data/hr.ts` | departments, positions, salary grades, employees, position history, exits, new hires, HR3 recommendations |
| `src/data/jobs.ts` | job posts, publishing platforms |
| `src/data/applicants.ts` | applicants, screening entities, screening scores, interviews |
| `src/data/requisitions.ts` | requisitions |
| `src/data/hires.ts` | new hires, onboarding templates/items, employee onboarding items |
| `src/data/records.ts` | employee document metadata and 201-file archiving metadata |
| `src/data/ess.ts` | ESS requests, leave balances, attendance, schedules, payroll, benefits, learning, performance, employee documents |
| `src/data/users.ts` | system users, roles, permissions, audit logs |
| `src/components/modules/Settings.tsx` | role/permission administration and system settings |
| `src/components/modules/AuditLogs.tsx` | immutable audit records |
| `src/data/company.ts` | announcements are persisted; FAQs/facilities/company marketing remain non-transactional content |

## 4. Scope
### In scope
Authentication/account linkage; department and position master data; salary grades; employee 201-file core record; emergency contacts; movement/history and exits; employee documents; recruitment requisitions and vacancies; job publishing; applicant screening and interview scheduling; hiring handoff; onboarding checklist templates and employee instances; ESS requests; attendance; schedules; leave balances; payroll and payroll line items; benefits; learning; performance reviews and HR3 recommendations; role-based permissions; audit trail; announcements; system settings.

### Explicitly not modeled as separate tables
- Company overview/tagline/mission/vision/values, hotel facilities, and FAQs: currently static public content in `company.ts`, with no demonstrated CRUD workflow.
- Job responsibilities, qualifications, skills, and benefits: retained as JSON arrays in `job_posts` to preserve the frontend structure without four additional many-to-many tables.
- Applicant flags: retained as JSON in `applicants.flags_json` because the UI treats them as a display-oriented string array.
- ESS request category/type dictionaries: stored as controlled application enums/reference configuration rather than separate tables because `ess.ts` provides a fixed category/type hierarchy and no CRUD screen for the dictionary.

## 5. Functional requirements
- **FR-01:** Core HCM must maintain one employee master record and reference department, position, salary grade, and supervisor through foreign keys.
- **FR-02:** Recruitment must retain a requisition-to-position-to-job-post traceability chain.
- **FR-03:** Applicants must belong to a job post, and one applicant may have many screening entities, criterion scores, and interviews.
- **FR-04:** A hired applicant may become a new-hire record and then an employee; the same employee must not be duplicated across modules.
- **FR-05:** Onboarding templates must define reusable checklist items, while employee onboarding items store per-employee completion state and snapshots.
- **FR-06:** ESS requests must point to the employee who filed them and optionally to the system user assigned to process them.
- **FR-07:** Attendance must support daily punches, breaks, hours, lateness, undertime, overtime, remarks, and correction history at the application layer.
- **FR-08:** Schedules must support day-of-week rows, shift names, start/end times, locations, rest days, and effective dates.
- **FR-09:** Payroll must support one employee/pay-period header with many earning/deduction line items.
- **FR-10:** Benefits, learning progress, and performance reviews must be employee-centered and historical rather than overwritten snapshots.
- **FR-11:** Permissions must support the role matrix already represented in `users.ts`, including module and permission-level combinations.
- **FR-12:** Audit logs must identify the actor when available and preserve timestamp, action, module, target, severity, IP, and device information.
- **FR-13:** Employee documents must support status and expiry plus a last-updated timestamp for the frontend’s long-term archive rule.
- **FR-14:** The schema must support MySQL and PostgreSQL without relying on vendor-only behavior beyond ordinary timestamp/identity differences.

## 6. Non-functional requirements
- Use foreign keys and unique constraints to prevent duplicate master data.
- Index every foreign key and common dashboard filters: status, dates, employee code, department, job status, applicant stage, ESS status, payroll period.
- Use UTC timestamps at the database/API boundary and localize to Asia/Manila in the UI.
- Use database transactions for hiring conversion, employee onboarding generation, payroll finalization, permission changes, and ESS approval actions.
- Do not physically delete employee/audit/payroll history by default; use status/archival semantics.
- Store files outside the relational database and keep only secure storage paths/object identifiers in `employee_documents` or applicant records.
- Use least-privilege DB credentials and application-side authorization in addition to the role matrix.

## 7. Proposed tables
**Total: 37 tables.** The count in this section is exactly the count represented in the generated high-level database image.

### 1. `departments`
| Column | Type | Key / constraint | Purpose |
|---|---|---|---|
| `department_id` | `BIGINT` | PK | Surrogate identifier |
| `code` | `VARCHAR(30)` | NOT NULL UNIQUE | Source field: Department.code |
| `name` | `VARCHAR(120)` | NOT NULL UNIQUE | Department name |
| `description` | `TEXT` | NULL | Department description |
| `head_employee_id` | `BIGINT` | NULL FK employees.employee_id | Department head; nullable for circular dependency |
| `budget` | `DECIMAL(14,2)` | NULL | Budget displayed by HR module |
| `created_at` | `TIMESTAMP` | NOT NULL | Audit timestamp |
| `updated_at` | `TIMESTAMP` | NOT NULL | Audit timestamp |

### 2. `salary_grades`
| Column | Type | Key / constraint | Purpose |
|---|---|---|---|
| `salary_grade_id` | `BIGINT` | PK |  |
| `code` | `VARCHAR(30)` | NOT NULL UNIQUE | e.g. SG-8 |
| `title` | `VARCHAR(120)` | NOT NULL |  |
| `min_salary` | `DECIMAL(12,2)` | NOT NULL |  |
| `max_salary` | `DECIMAL(12,2)` | NOT NULL |  |
| `currency_code` | `CHAR(3)` | NOT NULL DEFAULT 'PHP' |  |
| `level` | `VARCHAR(30)` | NOT NULL | Rank & File/Supervisory/Managerial/Executive |
| `notes` | `TEXT` | NULL |  |
| `created_at` | `TIMESTAMP` | NOT NULL |  |
| `updated_at` | `TIMESTAMP` | NOT NULL |  |

### 3. `positions`
| Column | Type | Key / constraint | Purpose |
|---|---|---|---|
| `position_id` | `BIGINT` | PK |  |
| `position_code` | `VARCHAR(30)` | NOT NULL UNIQUE | Source Position.id |
| `title` | `VARCHAR(150)` | NOT NULL |  |
| `department_id` | `BIGINT` | NOT NULL FK departments.department_id |  |
| `salary_grade_id` | `BIGINT` | NULL FK salary_grades.salary_grade_id |  |
| `level` | `VARCHAR(30)` | NOT NULL |  |
| `headcount` | `INT` | NOT NULL DEFAULT 0 | Approved headcount |
| `filled_count` | `INT` | NOT NULL DEFAULT 0 | Cached UI count; can be recomputed |
| `salary_band_text` | `VARCHAR(120)` | NULL | Source display text |
| `created_at` | `TIMESTAMP` | NOT NULL |  |
| `updated_at` | `TIMESTAMP` | NOT NULL |  |

### 4. `employees`
| Column | Type | Key / constraint | Purpose |
|---|---|---|---|
| `employee_id` | `BIGINT` | PK |  |
| `employee_code` | `VARCHAR(40)` | NOT NULL UNIQUE | Source Employee.id / ESS employeeId |
| `first_name` | `VARCHAR(80)` | NOT NULL |  |
| `middle_name` | `VARCHAR(80)` | NULL |  |
| `last_name` | `VARCHAR(80)` | NOT NULL |  |
| `email` | `VARCHAR(190)` | NOT NULL UNIQUE |  |
| `phone` | `VARCHAR(40)` | NULL |  |
| `address` | `TEXT` | NULL | ESS profile address |
| `emergency_contact_summary` | `VARCHAR(255)` | NULL | Legacy display; detailed contacts may use employee_emergency_contacts |
| `position_id` | `BIGINT` | NOT NULL FK positions.position_id |  |
| `department_id` | `BIGINT` | NOT NULL FK departments.department_id |  |
| `employment_type` | `VARCHAR(30)` | NOT NULL | Regular/Probationary/Contractual |
| `date_hired` | `DATE` | NOT NULL |  |
| `supervisor_employee_id` | `BIGINT` | NULL FK employees.employee_id | Self-referencing supervisor |
| `status` | `VARCHAR(30)` | NOT NULL | Active/etc. |
| `onboarding_complete` | `BOOLEAN` | NOT NULL DEFAULT FALSE |  |
| `salary_grade_id` | `BIGINT` | NULL FK salary_grades.salary_grade_id |  |
| `employee_record_last_updated_at` | `DATE` | NULL | 201-file/record archive timestamp from src/data/records.ts |
| `salary_step` | `VARCHAR(30)` | NULL | ESS performance display |
| `created_at` | `TIMESTAMP` | NOT NULL |  |
| `updated_at` | `TIMESTAMP` | NOT NULL |  |

### 5. `employee_emergency_contacts`
| Column | Type | Key / constraint | Purpose |
|---|---|---|---|
| `emergency_contact_id` | `BIGINT` | PK |  |
| `employee_id` | `BIGINT` | NOT NULL FK employees.employee_id |  |
| `name` | `VARCHAR(160)` | NOT NULL |  |
| `relationship` | `VARCHAR(80)` | NULL |  |
| `phone` | `VARCHAR(40)` | NULL |  |
| `address` | `TEXT` | NULL |  |
| `is_primary` | `BOOLEAN` | NOT NULL DEFAULT TRUE |  |
| `created_at` | `TIMESTAMP` | NOT NULL |  |
| `updated_at` | `TIMESTAMP` | NOT NULL |  |

### 6. `employee_position_history`
| Column | Type | Key / constraint | Purpose |
|---|---|---|---|
| `position_history_id` | `BIGINT` | PK |  |
| `employee_id` | `BIGINT` | NOT NULL FK employees.employee_id |  |
| `effective_date` | `DATE` | NOT NULL |  |
| `old_position_id` | `BIGINT` | NULL FK positions.position_id |  |
| `new_position_id` | `BIGINT` | NULL FK positions.position_id |  |
| `old_salary_grade_id` | `BIGINT` | NULL FK salary_grades.salary_grade_id |  |
| `new_salary_grade_id` | `BIGINT` | NULL FK salary_grades.salary_grade_id |  |
| `notes` | `TEXT` | NULL | Promotion/history notes |
| `created_at` | `TIMESTAMP` | NOT NULL |  |

### 7. `employee_exit_records`
| Column | Type | Key / constraint | Purpose |
|---|---|---|---|
| `exit_record_id` | `BIGINT` | PK |  |
| `employee_id` | `BIGINT` | NOT NULL UNIQUE FK employees.employee_id | One terminal exit record per employee |
| `exit_type` | `VARCHAR(30)` | NOT NULL | Resigned/Retired/Terminated |
| `exit_date` | `DATE` | NOT NULL |  |
| `clearance_status` | `VARCHAR(20)` | NOT NULL | Pending/Cleared |
| `coe_status` | `VARCHAR(20)` | NOT NULL | Pending/Issued |
| `notes` | `TEXT` | NULL |  |
| `created_at` | `TIMESTAMP` | NOT NULL |  |
| `updated_at` | `TIMESTAMP` | NOT NULL |  |

### 8. `employee_documents`
| Column | Type | Key / constraint | Purpose |
|---|---|---|---|
| `document_id` | `BIGINT` | PK |  |
| `employee_id` | `BIGINT` | NOT NULL FK employees.employee_id |  |
| `document_code` | `VARCHAR(50)` | NOT NULL UNIQUE | Source DOC-001 style id |
| `title` | `VARCHAR(200)` | NOT NULL |  |
| `category` | `VARCHAR(80)` | NOT NULL | Tax/Employment/Onboarding/etc. |
| `file_path` | `TEXT` | NULL | Storage pointer; not binary blob |
| `mime_type` | `VARCHAR(100)` | NULL |  |
| `file_size_bytes` | `BIGINT` | NULL |  |
| `document_status` | `VARCHAR(30)` | NOT NULL | Available/Released/Submitted/Missing |
| `document_date` | `DATE` | NULL |  |
| `expiry_date` | `DATE` | NULL |  |
| `last_updated_at` | `TIMESTAMP` | NULL | For 201-file archiving rule |
| `created_at` | `TIMESTAMP` | NOT NULL |  |
| `updated_at` | `TIMESTAMP` | NOT NULL |  |

### 9. `job_posts`
| Column | Type | Key / constraint | Purpose |
|---|---|---|---|
| `job_post_id` | `BIGINT` | PK |  |
| `slug` | `VARCHAR(120)` | NOT NULL UNIQUE | Source Job.id |
| `title` | `VARCHAR(150)` | NOT NULL |  |
| `department_id` | `BIGINT` | NOT NULL FK departments.department_id |  |
| `position_id` | `BIGINT` | NULL FK positions.position_id | Link to Core HCM position where applicable |
| `employment_type` | `VARCHAR(30)` | NOT NULL |  |
| `schedule` | `VARCHAR(120)` | NULL |  |
| `salary_min` | `DECIMAL(12,2)` | NULL |  |
| `salary_max` | `DECIMAL(12,2)` | NULL |  |
| `vacancies` | `INT` | NOT NULL DEFAULT 1 |  |
| `filled_count` | `INT` | NOT NULL DEFAULT 0 |  |
| `posted_date` | `DATE` | NULL |  |
| `status` | `VARCHAR(20)` | NOT NULL | Open/Closed/Draft |
| `active` | `BOOLEAN` | NOT NULL DEFAULT TRUE |  |
| `experience_level` | `VARCHAR(50)` | NULL |  |
| `education_level` | `VARCHAR(100)` | NULL |  |
| `summary` | `TEXT` | NULL |  |
| `description` | `TEXT` | NULL |  |
| `responsibilities_json` | `JSON` | NULL | Source string[] retained as JSON to avoid unnecessary table |
| `qualifications_json` | `JSON` | NULL |  |
| `skills_json` | `JSON` | NULL |  |
| `benefits_json` | `JSON` | NULL |  |
| `created_at` | `TIMESTAMP` | NOT NULL |  |
| `updated_at` | `TIMESTAMP` | NOT NULL |  |

### 10. `job_post_platforms`
| Column | Type | Key / constraint | Purpose |
|---|---|---|---|
| `job_post_platform_id` | `BIGINT` | PK |  |
| `job_post_id` | `BIGINT` | NOT NULL FK job_posts.job_post_id |  |
| `platform` | `VARCHAR(60)` | NOT NULL | Company Website/Facebook/Indeed/etc. |
| `published_at` | `TIMESTAMP` | NULL |  |
| `status` | `VARCHAR(20)` | NOT NULL DEFAULT 'published' |  |
| `created_at` | `TIMESTAMP` | NOT NULL |  |

### 11. `applicants`
| Column | Type | Key / constraint | Purpose |
|---|---|---|---|
| `applicant_id` | `BIGINT` | PK |  |
| `applicant_code` | `VARCHAR(40)` | NOT NULL UNIQUE | Source APP-* |
| `job_post_id` | `BIGINT` | NOT NULL FK job_posts.job_post_id |  |
| `name` | `VARCHAR(160)` | NOT NULL |  |
| `email` | `VARCHAR(190)` | NOT NULL |  |
| `phone` | `VARCHAR(40)` | NULL |  |
| `applied_at` | `TIMESTAMP` | NOT NULL |  |
| `fit_score` | `DECIMAL(5,2)` | NULL | Source score |
| `status` | `VARCHAR(30)` | NOT NULL | fit/other-role/credential/not-fit |
| `stage` | `VARCHAR(40)` | NOT NULL | Screened/Interview Scheduled/Assessed/Offer/Hired/Rejected |
| `source` | `VARCHAR(60)` | NULL | Portal/Walk-in/Referral/etc. |
| `resume_file_path` | `TEXT` | NULL |  |
| `summary` | `TEXT` | NULL |  |
| `flags_json` | `JSON` | NULL | String[] |
| `created_at` | `TIMESTAMP` | NOT NULL |  |
| `updated_at` | `TIMESTAMP` | NOT NULL |  |

### 12. `applicant_screening_entities`
| Column | Type | Key / constraint | Purpose |
|---|---|---|---|
| `entity_id` | `BIGINT` | PK |  |
| `applicant_id` | `BIGINT` | NOT NULL FK applicants.applicant_id |  |
| `label` | `VARCHAR(80)` | NOT NULL | NER label |
| `value` | `TEXT` | NOT NULL | NER extracted value |
| `created_at` | `TIMESTAMP` | NOT NULL |  |

### 13. `applicant_screening_scores`
| Column | Type | Key / constraint | Purpose |
|---|---|---|---|
| `score_id` | `BIGINT` | PK |  |
| `applicant_id` | `BIGINT` | NOT NULL FK applicants.applicant_id |  |
| `criterion` | `VARCHAR(120)` | NOT NULL | Criterion name |
| `score` | `DECIMAL(5,2)` | NOT NULL |  |
| `created_at` | `TIMESTAMP` | NOT NULL |  |

### 14. `interviews`
| Column | Type | Key / constraint | Purpose |
|---|---|---|---|
| `interview_id` | `BIGINT` | PK |  |
| `interview_code` | `VARCHAR(40)` | NOT NULL UNIQUE |  |
| `applicant_id` | `BIGINT` | NOT NULL FK applicants.applicant_id |  |
| `scheduled_date` | `DATE` | NOT NULL |  |
| `scheduled_time` | `TIME` | NOT NULL |  |
| `mode` | `VARCHAR(20)` | NOT NULL | On-site/Virtual |
| `interviewer_employee_id` | `BIGINT` | NULL FK employees.employee_id |  |
| `interviewer_name` | `VARCHAR(160)` | NULL | Snapshot/display fallback |
| `status` | `VARCHAR(20)` | NOT NULL | Scheduled/Completed/No Show |
| `created_at` | `TIMESTAMP` | NOT NULL |  |
| `updated_at` | `TIMESTAMP` | NOT NULL |  |

### 15. `requisitions`
| Column | Type | Key / constraint | Purpose |
|---|---|---|---|
| `requisition_id` | `BIGINT` | PK |  |
| `requisition_code` | `VARCHAR(40)` | NOT NULL UNIQUE | Source REQ-* |
| `position_id` | `BIGINT` | NOT NULL FK positions.position_id |  |
| `department_id` | `BIGINT` | NOT NULL FK departments.department_id |  |
| `requested_by_user_id` | `BIGINT` | NULL FK system_users.system_user_id | Requesting user |
| `requested_count` | `INT` | NOT NULL |  |
| `urgency` | `VARCHAR(20)` | NOT NULL |  |
| `justification` | `TEXT` | NOT NULL |  |
| `status` | `VARCHAR(20)` | NOT NULL | Pending/Done/Converted |
| `requested_at` | `DATE` | NOT NULL |  |
| `converted_job_post_id` | `BIGINT` | NULL FK job_posts.job_post_id |  |
| `created_at` | `TIMESTAMP` | NOT NULL |  |
| `updated_at` | `TIMESTAMP` | NOT NULL |  |

### 16. `new_hires`
| Column | Type | Key / constraint | Purpose |
|---|---|---|---|
| `new_hire_id` | `BIGINT` | PK |  |
| `new_hire_code` | `VARCHAR(40)` | NOT NULL UNIQUE |  |
| `applicant_id` | `BIGINT` | NULL FK applicants.applicant_id | Originating applicant |
| `employee_id` | `BIGINT` | NULL FK employees.employee_id | Populated after employee creation |
| `name` | `VARCHAR(160)` | NOT NULL | Snapshot |
| `email` | `VARCHAR(190)` | NULL |  |
| `phone` | `VARCHAR(40)` | NULL |  |
| `position_id` | `BIGINT` | NULL FK positions.position_id |  |
| `department_id` | `BIGINT` | NULL FK departments.department_id |  |
| `stage` | `VARCHAR(30)` | NOT NULL | Pre-onboarding/Probationary/Regular |
| `start_date` | `DATE` | NOT NULL |  |
| `created_at` | `TIMESTAMP` | NOT NULL |  |
| `updated_at` | `TIMESTAMP` | NOT NULL |  |

### 17. `onboarding_checklist_templates`
| Column | Type | Key / constraint | Purpose |
|---|---|---|---|
| `template_id` | `BIGINT` | PK |  |
| `template_code` | `VARCHAR(40)` | NOT NULL UNIQUE |  |
| `title` | `VARCHAR(200)` | NOT NULL |  |
| `phase` | `VARCHAR(30)` | NOT NULL | Pre-onboarding/Probationary |
| `position_scope_json` | `JSON` | NULL | all or specific position ids/titles |
| `status` | `VARCHAR(20)` | NOT NULL | Active/Closed |
| `created_at` | `TIMESTAMP` | NOT NULL |  |
| `updated_at` | `TIMESTAMP` | NOT NULL |  |

### 18. `onboarding_checklist_items`
| Column | Type | Key / constraint | Purpose |
|---|---|---|---|
| `template_item_id` | `BIGINT` | PK |  |
| `template_id` | `BIGINT` | NOT NULL FK onboarding_checklist_templates.template_id |  |
| `item_text` | `TEXT` | NOT NULL |  |
| `sort_order` | `INT` | NOT NULL |  |
| `created_at` | `TIMESTAMP` | NOT NULL |  |

### 19. `employee_onboarding_items`
| Column | Type | Key / constraint | Purpose |
|---|---|---|---|
| `employee_onboarding_item_id` | `BIGINT` | PK |  |
| `employee_id` | `BIGINT` | NOT NULL FK employees.employee_id |  |
| `new_hire_id` | `BIGINT` | NULL FK new_hires.new_hire_id |  |
| `template_item_id` | `BIGINT` | NULL FK onboarding_checklist_items.template_item_id |  |
| `item_text` | `TEXT` | NOT NULL | Snapshot from template |
| `done` | `BOOLEAN` | NOT NULL DEFAULT FALSE |  |
| `completed_at` | `TIMESTAMP` | NULL |  |
| `completed_by_user_id` | `BIGINT` | NULL FK system_users.system_user_id |  |
| `created_at` | `TIMESTAMP` | NOT NULL |  |
| `updated_at` | `TIMESTAMP` | NOT NULL |  |

### 20. `ess_requests`
| Column | Type | Key / constraint | Purpose |
|---|---|---|---|
| `ess_request_id` | `BIGINT` | PK |  |
| `request_code` | `VARCHAR(40)` | NOT NULL UNIQUE |  |
| `employee_id` | `BIGINT` | NOT NULL FK employees.employee_id |  |
| `category` | `VARCHAR(80)` | NOT NULL |  |
| `request_type` | `VARCHAR(100)` | NOT NULL |  |
| `filed_at` | `TIMESTAMP` | NOT NULL |  |
| `status` | `VARCHAR(30)` | NOT NULL | Pending/Under Review/Approved/Rejected/Completed |
| `assigned_to_user_id` | `BIGINT` | NULL FK system_users.system_user_id |  |
| `details` | `TEXT` | NULL |  |
| `created_at` | `TIMESTAMP` | NOT NULL |  |
| `updated_at` | `TIMESTAMP` | NOT NULL |  |

### 21. `leave_balances`
| Column | Type | Key / constraint | Purpose |
|---|---|---|---|
| `leave_balance_id` | `BIGINT` | PK |  |
| `employee_id` | `BIGINT` | NOT NULL FK employees.employee_id |  |
| `leave_type` | `VARCHAR(80)` | NOT NULL |  |
| `period_year` | `SMALLINT` | NOT NULL |  |
| `total_days` | `DECIMAL(6,2)` | NOT NULL DEFAULT 0 |  |
| `used_days` | `DECIMAL(6,2)` | NOT NULL DEFAULT 0 |  |
| `created_at` | `TIMESTAMP` | NOT NULL |  |
| `updated_at` | `TIMESTAMP` | NOT NULL |  |

### 22. `attendance_records`
| Column | Type | Key / constraint | Purpose |
|---|---|---|---|
| `attendance_id` | `BIGINT` | PK |  |
| `employee_id` | `BIGINT` | NOT NULL FK employees.employee_id |  |
| `work_date` | `DATE` | NOT NULL |  |
| `time_in` | `TIMESTAMP` | NULL |  |
| `time_out` | `TIMESTAMP` | NULL |  |
| `break_in` | `TIMESTAMP` | NULL |  |
| `break_out` | `TIMESTAMP` | NULL |  |
| `hours_worked` | `DECIMAL(7,2)` | NOT NULL DEFAULT 0 |  |
| `late_minutes` | `INT` | NOT NULL DEFAULT 0 |  |
| `undertime_minutes` | `INT` | NOT NULL DEFAULT 0 |  |
| `overtime_hours` | `DECIMAL(7,2)` | NOT NULL DEFAULT 0 |  |
| `remark` | `VARCHAR(255)` | NULL |  |
| `status` | `VARCHAR(30)` | NULL |  |
| `created_at` | `TIMESTAMP` | NOT NULL |  |
| `updated_at` | `TIMESTAMP` | NOT NULL |  |

### 23. `work_schedules`
| Column | Type | Key / constraint | Purpose |
|---|---|---|---|
| `work_schedule_id` | `BIGINT` | PK |  |
| `employee_id` | `BIGINT` | NOT NULL FK employees.employee_id |  |
| `day_of_week` | `SMALLINT` | NOT NULL | 1-7 |
| `shift_name` | `VARCHAR(80)` | NULL | AM Shift/Mid Shift/etc. |
| `start_time` | `TIME` | NULL |  |
| `end_time` | `TIME` | NULL |  |
| `location` | `VARCHAR(120)` | NULL |  |
| `is_rest_day` | `BOOLEAN` | NOT NULL DEFAULT FALSE |  |
| `effective_from` | `DATE` | NOT NULL |  |
| `effective_to` | `DATE` | NULL |  |
| `created_at` | `TIMESTAMP` | NOT NULL |  |
| `updated_at` | `TIMESTAMP` | NOT NULL |  |

### 24. `payroll_records`
| Column | Type | Key / constraint | Purpose |
|---|---|---|---|
| `payroll_record_id` | `BIGINT` | PK |  |
| `employee_id` | `BIGINT` | NOT NULL FK employees.employee_id |  |
| `pay_period_start` | `DATE` | NOT NULL |  |
| `pay_period_end` | `DATE` | NOT NULL |  |
| `payout_date` | `DATE` | NULL |  |
| `gross_pay` | `DECIMAL(12,2)` | NOT NULL |  |
| `net_pay` | `DECIMAL(12,2)` | NOT NULL |  |
| `status` | `VARCHAR(30)` | NOT NULL | Draft/Released/etc. |
| `created_at` | `TIMESTAMP` | NOT NULL |  |
| `updated_at` | `TIMESTAMP` | NOT NULL |  |

### 25. `payroll_items`
| Column | Type | Key / constraint | Purpose |
|---|---|---|---|
| `payroll_item_id` | `BIGINT` | PK |  |
| `payroll_record_id` | `BIGINT` | NOT NULL FK payroll_records.payroll_record_id |  |
| `item_type` | `VARCHAR(30)` | NOT NULL | Earning/Deduction |
| `label` | `VARCHAR(120)` | NOT NULL | Basic Pay/SSS/etc. |
| `amount` | `DECIMAL(12,2)` | NOT NULL |  |
| `created_at` | `TIMESTAMP` | NOT NULL |  |

### 26. `employee_benefits`
| Column | Type | Key / constraint | Purpose |
|---|---|---|---|
| `employee_benefit_id` | `BIGINT` | PK |  |
| `employee_id` | `BIGINT` | NOT NULL FK employees.employee_id |  |
| `benefit_name` | `VARCHAR(100)` | NOT NULL | SSS/PhilHealth/Pag-IBIG/HMO/Insurance |
| `reference_value` | `VARCHAR(190)` | NULL |  |
| `note` | `TEXT` | NULL |  |
| `effective_date` | `DATE` | NULL |  |
| `end_date` | `DATE` | NULL |  |
| `status` | `VARCHAR(30)` | NOT NULL |  |
| `created_at` | `TIMESTAMP` | NOT NULL |  |
| `updated_at` | `TIMESTAMP` | NOT NULL |  |

### 27. `learning_courses`
| Column | Type | Key / constraint | Purpose |
|---|---|---|---|
| `course_id` | `BIGINT` | PK |  |
| `course_code` | `VARCHAR(40)` | NOT NULL UNIQUE |  |
| `title` | `VARCHAR(200)` | NOT NULL |  |
| `category` | `VARCHAR(120)` | NULL |  |
| `description` | `TEXT` | NULL |  |
| `created_at` | `TIMESTAMP` | NOT NULL |  |
| `updated_at` | `TIMESTAMP` | NOT NULL |  |

### 28. `employee_learning`
| Column | Type | Key / constraint | Purpose |
|---|---|---|---|
| `employee_learning_id` | `BIGINT` | PK |  |
| `employee_id` | `BIGINT` | NOT NULL FK employees.employee_id |  |
| `course_id` | `BIGINT` | NOT NULL FK learning_courses.course_id |  |
| `status` | `VARCHAR(30)` | NOT NULL | Assigned/In Progress/Completed |
| `score` | `DECIMAL(5,2)` | NULL |  |
| `assigned_date` | `DATE` | NULL |  |
| `completed_date` | `DATE` | NULL |  |
| `created_at` | `TIMESTAMP` | NOT NULL |  |
| `updated_at` | `TIMESTAMP` | NOT NULL |  |

### 29. `performance_reviews`
| Column | Type | Key / constraint | Purpose |
|---|---|---|---|
| `performance_review_id` | `BIGINT` | PK |  |
| `employee_id` | `BIGINT` | NOT NULL FK employees.employee_id |  |
| `review_period` | `VARCHAR(80)` | NOT NULL |  |
| `review_date` | `DATE` | NULL |  |
| `competency_level` | `VARCHAR(50)` | NULL |  |
| `overall_rating` | `DECIMAL(5,2)` | NULL |  |
| `salary_grade_code` | `VARCHAR(30)` | NULL | Snapshot |
| `salary_step` | `VARCHAR(30)` | NULL |  |
| `evaluator_user_id` | `BIGINT` | NULL FK system_users.system_user_id |  |
| `comments` | `TEXT` | NULL |  |
| `created_at` | `TIMESTAMP` | NOT NULL |  |
| `updated_at` | `TIMESTAMP` | NOT NULL |  |

### 30. `hr3_recommendations`
| Column | Type | Key / constraint | Purpose |
|---|---|---|---|
| `recommendation_id` | `BIGINT` | PK |  |
| `employee_id` | `BIGINT` | NOT NULL FK employees.employee_id |  |
| `recommendation_type` | `VARCHAR(40)` | NOT NULL | Regularization/Promotion/Performance Review |
| `evaluation_score` | `DECIMAL(5,2)` | NULL |  |
| `evaluator_user_id` | `BIGINT` | NULL FK system_users.system_user_id |  |
| `date_submitted` | `DATE` | NOT NULL |  |
| `status` | `VARCHAR(40)` | NOT NULL | Pending HR Action/etc. |
| `suggested_position_id` | `BIGINT` | NULL FK positions.position_id |  |
| `suggested_salary_grade_id` | `BIGINT` | NULL FK salary_grades.salary_grade_id |  |
| `comments` | `TEXT` | NULL |  |
| `created_at` | `TIMESTAMP` | NOT NULL |  |
| `updated_at` | `TIMESTAMP` | NOT NULL |  |

### 31. `system_roles`
| Column | Type | Key / constraint | Purpose |
|---|---|---|---|
| `role_id` | `BIGINT` | PK |  |
| `role_name` | `VARCHAR(50)` | NOT NULL UNIQUE | Super Admin/Admin/Employee |
| `description` | `TEXT` | NULL |  |
| `created_at` | `TIMESTAMP` | NOT NULL |  |
| `updated_at` | `TIMESTAMP` | NOT NULL |  |

### 32. `system_permissions`
| Column | Type | Key / constraint | Purpose |
|---|---|---|---|
| `permission_id` | `BIGINT` | PK |  |
| `module_name` | `VARCHAR(100)` | NOT NULL |  |
| `permission_level` | `VARCHAR(40)` | NOT NULL | Full/View/Edit/Delete/Approve-Reject/None |
| `created_at` | `TIMESTAMP` | NOT NULL |  |
| `updated_at` | `TIMESTAMP` | NOT NULL |  |

### 33. `system_role_permissions`
| Column | Type | Key / constraint | Purpose |
|---|---|---|---|
| `role_permission_id` | `BIGINT` | PK |  |
| `role_id` | `BIGINT` | NOT NULL FK system_roles.role_id |  |
| `permission_id` | `BIGINT` | NOT NULL FK system_permissions.permission_id |  |
| `created_at` | `TIMESTAMP` | NOT NULL |  |
| `updated_at` | `TIMESTAMP` | NOT NULL |  |

### 34. `system_users`
| Column | Type | Key / constraint | Purpose |
|---|---|---|---|
| `system_user_id` | `BIGINT` | PK |  |
| `username` | `VARCHAR(100)` | NOT NULL UNIQUE |  |
| `email` | `VARCHAR(190)` | NOT NULL UNIQUE |  |
| `password_hash` | `VARCHAR(255)` | NOT NULL | Never store plaintext password |
| `employee_id` | `BIGINT` | NULL UNIQUE FK employees.employee_id | Employee account linkage; admins may be non-employees |
| `role_id` | `BIGINT` | NOT NULL FK system_roles.role_id |  |
| `status` | `VARCHAR(20)` | NOT NULL | Active/Suspended/Disabled |
| `last_login_at` | `TIMESTAMP` | NULL |  |
| `last_login_ip` | `VARCHAR(45)` | NULL | IPv4/IPv6 |
| `created_at` | `TIMESTAMP` | NOT NULL |  |
| `updated_at` | `TIMESTAMP` | NOT NULL |  |

### 35. `audit_logs`
| Column | Type | Key / constraint | Purpose |
|---|---|---|---|
| `audit_log_id` | `BIGINT` | PK |  |
| `system_user_id` | `BIGINT` | NULL FK system_users.system_user_id |  |
| `occurred_at` | `TIMESTAMP` | NOT NULL |  |
| `action` | `VARCHAR(255)` | NOT NULL |  |
| `module_name` | `VARCHAR(100)` | NOT NULL |  |
| `target_type` | `VARCHAR(100)` | NULL |  |
| `target_id` | `VARCHAR(100)` | NULL |  |
| `details` | `TEXT` | NULL |  |
| `severity` | `VARCHAR(20)` | NOT NULL | Info/Warning/Critical |
| `ip_address` | `VARCHAR(45)` | NULL |  |
| `device_info` | `VARCHAR(255)` | NULL |  |

### 36. `announcements`
| Column | Type | Key / constraint | Purpose |
|---|---|---|---|
| `announcement_id` | `BIGINT` | PK |  |
| `published_date` | `DATE` | NOT NULL |  |
| `title` | `VARCHAR(200)` | NOT NULL |  |
| `body` | `TEXT` | NOT NULL |  |
| `created_by_user_id` | `BIGINT` | NULL FK system_users.system_user_id |  |
| `status` | `VARCHAR(20)` | NOT NULL DEFAULT 'published' |  |
| `created_at` | `TIMESTAMP` | NOT NULL |  |
| `updated_at` | `TIMESTAMP` | NOT NULL |  |

### 37. `system_settings`
| Column | Type | Key / constraint | Purpose |
|---|---|---|---|
| `setting_id` | `BIGINT` | PK |  |
| `setting_key` | `VARCHAR(120)` | NOT NULL UNIQUE |  |
| `setting_value` | `JSON` | NOT NULL | Supports structured password policy/config |
| `updated_by_user_id` | `BIGINT` | NULL FK system_users.system_user_id |  |
| `created_at` | `TIMESTAMP` | NOT NULL |  |
| `updated_at` | `TIMESTAMP` | NOT NULL |  |

## 8. Relationship rules
- `departments.head_employee_id` → `employees.employee_id`
- `positions.department_id` → `departments.department_id`
- `positions.salary_grade_id` → `salary_grades.salary_grade_id`
- `employees.position_id` → `positions.position_id`
- `employees.department_id` → `departments.department_id`
- `employees.supervisor_employee_id` → `employees.employee_id`
- `employees.salary_grade_id` → `salary_grades.salary_grade_id`
- `employee_emergency_contacts.employee_id` → `employees.employee_id`
- `employee_position_history.employee_id` → `employees.employee_id`
- `employee_position_history.old_position_id` → `positions.position_id`
- `employee_position_history.new_position_id` → `positions.position_id`
- `employee_position_history.old_salary_grade_id` → `salary_grades.salary_grade_id`
- `employee_position_history.new_salary_grade_id` → `salary_grades.salary_grade_id`
- `employee_exit_records.employee_id` → `employees.employee_id`
- `employee_documents.employee_id` → `employees.employee_id`
- `job_posts.department_id` → `departments.department_id`
- `job_posts.position_id` → `positions.position_id`
- `job_post_platforms.job_post_id` → `job_posts.job_post_id`
- `applicants.job_post_id` → `job_posts.job_post_id`
- `applicant_screening_entities.applicant_id` → `applicants.applicant_id`
- `applicant_screening_scores.applicant_id` → `applicants.applicant_id`
- `interviews.applicant_id` → `applicants.applicant_id`
- `interviews.interviewer_employee_id` → `employees.employee_id`
- `requisitions.position_id` → `positions.position_id`
- `requisitions.department_id` → `departments.department_id`
- `requisitions.requested_by_user_id` → `system_users.system_user_id`
- `requisitions.converted_job_post_id` → `job_posts.job_post_id`
- `new_hires.applicant_id` → `applicants.applicant_id`
- `new_hires.employee_id` → `employees.employee_id`
- `new_hires.position_id` → `positions.position_id`
- `new_hires.department_id` → `departments.department_id`
- `onboarding_checklist_items.template_id` → `onboarding_checklist_templates.template_id`
- `employee_onboarding_items.employee_id` → `employees.employee_id`
- `employee_onboarding_items.new_hire_id` → `new_hires.new_hire_id`
- `employee_onboarding_items.template_item_id` → `onboarding_checklist_items.template_item_id`
- `employee_onboarding_items.completed_by_user_id` → `system_users.system_user_id`
- `ess_requests.employee_id` → `employees.employee_id`
- `ess_requests.assigned_to_user_id` → `system_users.system_user_id`
- `leave_balances.employee_id` → `employees.employee_id`
- `attendance_records.employee_id` → `employees.employee_id`
- `work_schedules.employee_id` → `employees.employee_id`
- `payroll_records.employee_id` → `employees.employee_id`
- `payroll_items.payroll_record_id` → `payroll_records.payroll_record_id`
- `employee_benefits.employee_id` → `employees.employee_id`
- `employee_learning.employee_id` → `employees.employee_id`
- `employee_learning.course_id` → `learning_courses.course_id`
- `performance_reviews.employee_id` → `employees.employee_id`
- `performance_reviews.evaluator_user_id` → `system_users.system_user_id`
- `hr3_recommendations.employee_id` → `employees.employee_id`
- `hr3_recommendations.evaluator_user_id` → `system_users.system_user_id`
- `hr3_recommendations.suggested_position_id` → `positions.position_id`
- `hr3_recommendations.suggested_salary_grade_id` → `salary_grades.salary_grade_id`
- `system_role_permissions.role_id` → `system_roles.role_id`
- `system_role_permissions.permission_id` → `system_permissions.permission_id`
- `system_users.employee_id` → `employees.employee_id`
- `system_users.role_id` → `system_roles.role_id`
- `audit_logs.system_user_id` → `system_users.system_user_id`
- `announcements.created_by_user_id` → `system_users.system_user_id`
- `system_settings.updated_by_user_id` → `system_users.system_user_id`

## 9. Key workflow data flows
### Recruitment to employee
`requisitions` → `job_posts` → `applicants` → `interviews` → `new_hires` → `employees` → `employee_onboarding_items`.

### Core employee lifecycle
`departments` + `positions` + `salary_grades` → `employees`; later movement is appended to `employee_position_history`; terminal status creates `employee_exit_records`; the 201-file is represented through `employee_documents`.

### ESS
`employees` → `ess_requests`, `leave_balances`, `attendance_records`, `work_schedules`, `payroll_records`, `employee_benefits`, `employee_learning`, `performance_reviews`, `employee_documents`.

### Access control
`system_roles` → `system_role_permissions` → `system_permissions`; `system_users` belongs to one role and optionally one employee; `audit_logs` records actions from system users.

## 10. Integrity and validation rules
- `employees.employee_code`, `system_users.username`, `system_users.email`, `job_posts.slug`, `applicants.applicant_code`, and requisition/job/interview/document codes must be unique.
- `employees.supervisor_employee_id` may reference the same table but must not equal `employees.employee_id`.
- `positions.department_id` and `employees.department_id/position_id` must be validated by the service layer so an employee’s position normally belongs to the employee’s department.
- `job_posts.position_id` may be null for a job created before a formal position is created, but the application should resolve it before hiring where possible.
- `payroll_records` must be unique per employee/pay period; line items must sum to the stored gross/net according to the payroll engine’s rules.
- `leave_balances` is unique per employee/leave type/year.
- `attendance_records` is unique per employee/work date unless the implementation intentionally supports split attendance rows; in that case the constraint should be revised before production.
- `employee_learning` is unique per employee/course assignment for the current lifecycle.
- `system_role_permissions` is unique per role/permission pair.
- `audit_logs` is append-only from the application perspective.
- Employee document file bytes must never be embedded in ordinary row columns; use secure object/file storage.

## 11. Migration / frontend integration requirements
- Replace `src/data/*.ts` seed arrays with API-backed repositories/hooks, keeping the same field names at the UI boundary where practical.
- Introduce DTO mappers where database naming is snake_case but React types use camelCase.
- Create seed data from the existing fixtures so the initial UI remains recognizable during migration.
- Migrate nested promotion history and exit details into `employee_position_history` and `employee_exit_records` instead of serializing them on `employees`.
- Migrate job array fields to JSON columns so existing UI rendering can continue without extra joins.
- Generate onboarding item rows from the active template(s) when a new hire becomes an employee/probationary hire.
- Ensure the employee account creation flow links `system_users.employee_id` instead of identifying the employee only by name/email.

## 12. Acceptance criteria for the database implementation
- The implementation contains exactly the 34 proposed tables unless a documented source-based reason replaces one with an existing table.
- Every FK in the proposal is enforced by the database.
- All frontend data modules listed in Section 3 can be represented without lossy manual parsing, except the explicitly retained JSON arrays.
- Recruitment-to-hire conversion can be completed inside a transaction.
- Employee and payroll history remains queryable after status changes and separation.
- Role permissions can reproduce the current `Super Admin`, `Admin`, and `Employee` matrices.
- The audit log captures permission changes, approvals, account state changes, and major HR transactions.
- Both supplied SQL files execute cleanly on their target database after setting the target schema/database name.
- The high-level image contains all 34 tables and all columns; its table count exactly matches Section 7.
- The relationship-summary image contains all 34 table names and shows only horizontal/vertical orthogonal connections; no diagonal relationship lines are used.

## 13. Deliverables generated with this PRD
- `hotel_hr_database_prd.md` — this complete database PRD/specification.
- `hotel_hr_schema_mysql.sql` — MySQL 8.0+ DDL.
- `hotel_hr_schema_postgres.sql` — PostgreSQL 15+ DDL.
- `hotel_hr_database_full_coverage.png` — exact high-level schema coverage image with all tables and all columns.
- `hotel_hr_database_relationship_summary.png` — simplified relationship summary using horizontal/vertical connectors.

## 14. Implementation note
The uploaded frontend did not expose an existing persistent relational schema in the inspected `frontend/src` domain files. Therefore, this proposal uses the frontend types and workflows as the authoritative starting point, while avoiding duplicate tables for static or purely presentational structures. Existing server/database code outside that frontend scope should be checked before migration so an already-deployed table can be reused rather than duplicated.