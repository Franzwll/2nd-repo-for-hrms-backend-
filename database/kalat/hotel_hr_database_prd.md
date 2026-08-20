# Hotel & Restaurant HR1 — Detailed Database PRD and Generation Specification (Revision 2.2)

**Source analyzed:** `Hotel-and-Restaurant-HR1 - main`, with primary evidence from `frontend/src` and its route/module/data files. **Database proposal:** 42 tables. **Database engines:** MySQL 8.0+ and PostgreSQL 15+ compatible design.
**Revision history:** Rev 1.0 proposed 34 tables in Section 1 and 37 in Section 7 (inconsistent). Rev 2.0 (post-audit, see `hotel_hr_database_audit_report.md`) corrects the count and incorporates the audit decisions: `role_permissions` replaces `system_permissions` + `system_role_permissions`, and `applicant_assessments`, `checklist_requests`, and `ess_categories` are added. All artifacts then agreed on 39 tables. Rev 2.1 (approved additions) adds `notifications`, `user_login_activity`, and `payroll_periods`, and links `payroll_records.payroll_period_id` to the new master period table. Rev 2.2 (professional hardening) adds 43 CHECK constraints across both SQL files — one per enum-like column set, including `role_permissions.module_name` and `permission_level` — and adds SQL comments on the three derived counters (`positions.filled_count`, `job_posts.filled_count`, `employees.onboarding_complete`) requiring them to be maintained in the same transaction as the triggering event. Table/column/FK/unique/index metrics are unchanged.

## 1. Purpose
This PRD defines the database to be implemented behind the existing Hotel & Restaurant HR frontend. It is intentionally evidence-driven: the database must represent the real domains and fields already exposed by the UI before introducing new entities. The design favors reuse of a master entity (department, position, employee, user, job post) over duplicate lookup tables and uses JSON only for source arrays whose decomposition would add tables without meaningful relational value.

## 2. Source-analysis rules
1. Treat `frontend/src/data/*.ts` as the current domain contract for the UI. The key contracts found are `Department`, `Position`, `Employee`, `SalaryGrade`, `HR3Recommendation`, `Applicant`, `AssessmentResult`, `Interview`, `Requisition`, `NewHire`, `ChecklistRequest`, `ESSRequest`, `EssCategory`, `EssActivityLog`, `SystemUser`, audit entries, and the ESS datasets for attendance, schedules, leave balances, payroll, benefits, learning, performance, and documents.
2. Treat `frontend/src/components/modules/*.tsx` and `frontend/src/routes/*.tsx` as the workflow contract: Applicant Management, Recruitment Management, New Hire Onboarding, Core HCM, Employee Records, ESS Management, User/Settings, Audit Logs, and public/portal announcements.
3. Do not create tables merely because a frontend array exists. Static content such as FAQs, hotel facilities, system-module descriptions, and company marketing copy should stay configuration/content data unless an admin UI clearly requires CRUD persistence.
4. When the same value appears in several screens, create one authoritative master table and reference it with a foreign key. In particular, departments, positions, salary grades, employees, system users, roles, ESS categories, and job posts must not be duplicated in module-specific tables.
5. Never use plaintext passwords. `system_users.password_hash` stores only an adaptive password hash (Argon2id/bcrypt/scrypt managed by the application).

## 3. Frontend evidence map
| Frontend source | Database domains it drives |
|---|---|
| `src/data/hr.ts` | departments, positions, salary grades, employees, position history, exits, new hires, HR3 recommendations |
| `src/data/jobs.ts` | job posts, publishing platforms |
| `src/data/applicants.ts` | applicants, screening entities, screening scores, interviews, assessments |
| `src/data/requisitions.ts` | requisitions |
| `src/data/hires.ts` | new hires, onboarding templates/items, employee onboarding items, checklist requests |
| `src/data/records.ts` | employee document metadata and 201-file archiving metadata |
| `src/data/ess.ts` | ESS categories, ESS requests, leave balances, attendance, schedules, payroll, benefits, learning, performance, employee documents |
| `src/data/users.ts` | system users, roles, permissions, audit logs |
| `src/components/modules/Settings.tsx` | role/permission administration and system settings |
| `src/components/modules/AuditLogs.tsx` | immutable audit records |
| `src/components/portal/portal-state.tsx`, `AnnouncementsCard.tsx`, `AnnouncementDialog.tsx` | announcements (title, body, **audience**, author, createdAt, visibility filtering) |
| `src/data/company.ts` | announcements are persisted; FAQs/facilities/company marketing remain non-transactional content |

## 4. Scope
### In scope
Authentication/account linkage; department and position master data; salary grades; employee 201-file core record (personal data, benefit numbers, employment data); emergency contacts; movement/history and exits; employee documents; recruitment requisitions and vacancies; job publishing; applicant screening, interviews, and assessments; hiring handoff; onboarding checklist templates, employee instances, and checklist requests; ESS categories and requests; attendance; schedules; leave balances; payroll and payroll line items; benefits; learning; performance reviews and HR3 recommendations; role-based permission matrix; audit trail; announcements; system settings.

### Explicitly not modeled as separate tables
- Company overview/tagline/mission/vision/values, hotel facilities, and FAQs: currently static public content in `company.ts`, with no demonstrated CRUD workflow.
- Job responsibilities, qualifications, skills, and benefits: retained as JSON arrays in `job_posts` to preserve the frontend structure without four additional many-to-many tables.
- Applicant flags: retained as JSON in `applicants.flags_json` because the UI treats them as a display-oriented string array.
- Checklist-request requested items and assessment score breakdowns: retained as JSON (`checklist_requests.items_json`, `applicant_assessments.scores_json`) because item CRUD is a single-document lifecycle; promote to child tables if item-level reporting is ever required.
- ESS request types: controlled application enums; categories, however, are CRUD-managed with an open/close toggle and are modeled as the `ess_categories` table.

## 5. Functional requirements
- **FR-01:** Core HCM must maintain one employee master record and reference department, position, salary grade, and supervisor through foreign keys. The 201-file personal and benefit-number fields (birth date, gender, civil status, nationality, personal email, SSS/PhilHealth/Pag-IBIG/TIN numbers) must be stored on the employee record.
- **FR-02:** Recruitment must retain a requisition-to-position-to-job-post traceability chain. Requisitions may reference positions that do not exist in the position master yet (seed data uses titles such as Security Officer, Spa Therapist, Sous Chef); the schema therefore keeps a nullable `position_id` plus a `position_title` snapshot.
- **FR-03:** Applicants must belong to a job post, and one applicant may have many screening entities, criterion scores, interviews, and assessments.
- **FR-04:** A hired applicant may become a new-hire record and then an employee; the same employee must not be duplicated across modules.
- **FR-05:** Onboarding templates must define reusable checklist items, while employee onboarding items store per-employee completion state and snapshots. Checklist requests (Performance section) must be persisted with phase, status, requester, and item JSON.
- **FR-06:** ESS requests must point to the employee who filed them, the category (master, open/close toggle), optional date range, review note, return count, attachment path, and optionally the system user assigned to process them.
- **FR-07:** Attendance must support daily punches, breaks, hours, lateness, undertime, overtime, remarks, and correction history at the application layer.
- **FR-08:** Schedules must support day-of-week rows, shift names, start/end times, locations, rest days, and effective dates.
- **FR-09:** Payroll must support one employee/pay-period header with many earning/deduction line items.
- **FR-10:** Benefits, learning progress, and performance reviews must be employee-centered and historical rather than overwritten snapshots.
- **FR-11:** Permissions must reproduce the role matrix already represented in `users.ts` as a role × module → permission-level model: one `role_permissions` table with a `(role_id, module_name)` unique key.
- **FR-12:** Audit logs must identify the actor when available (system user plus actor role/department snapshots) and preserve timestamp, action, module, target, severity, IP, and device information.
- **FR-13:** Employee documents must support status and expiry plus a last-updated timestamp for the frontend’s 201-file archive rule; document codes are unique per employee, not globally.
- **FR-14:** Announcements must persist audience (All/Admin/Employee), title, body, publish date, and author so the portal can reproduce `isVisibleTo()` filtering.
- **FR-15:** The schema must support MySQL and PostgreSQL without relying on vendor-only behavior beyond ordinary timestamp/identity differences.

## 6. Non-functional requirements
- Use foreign keys and unique constraints to prevent duplicate master data.
- Index every foreign key and common dashboard filters: status, dates, employee code, department, job status, applicant stage, ESS status, payroll period.
- Use UTC timestamps at the database/API boundary and localize to Asia/Manila in the UI.
- Use database transactions for hiring conversion, employee onboarding generation, payroll finalization, permission changes, and ESS approval actions.
- Do not physically delete employee/audit/payroll history by default; use status/archival semantics. Pure child aggregates use ON DELETE CASCADE; reference masters use RESTRICT; ESS category and audit actor use SET NULL.
- Store files outside the relational database and keep only secure storage paths/object identifiers in `employee_documents`, `applicant_assessments`/`applicants` resume fields, and `ess_requests.attachment_path`.
- Use least-privilege DB credentials and application-side authorization in addition to the role matrix.

## 7. Proposed tables
**Total: 42 tables.** This count is exactly the count represented in the generated high-level database image and the table inventory.

Column conventions: every table has a surrogate `*_id` primary key; `created_at`/`updated_at` audit timestamps; monetary values as `DECIMAL(14,2)`/`DECIMAL(12,2)` (MySQL) or `NUMERIC` (PostgreSQL); JSON only for the fields listed as JSON. Type spellings are given in MySQL form; the PostgreSQL mapping is `BIGINT UNSIGNED AUTO_INCREMENT`→`BIGSERIAL`, `TINYINT(1)`→`BOOLEAN`, `JSON`→`JSONB`, `DECIMAL`→`NUMERIC`.

### Domain 1 — Organization & Core HCM (8 tables)

**1. `departments`** — department_id PK; code UQ; name UQ; description; head_employee_id FK→employees; budget; created_at; updated_at

**2. `salary_grades`** — salary_grade_id PK; code UQ; title; min_salary; max_salary; currency_code CHAR(3) DEFAULT 'PHP'; level; notes; created_at; updated_at

**3. `positions`** — position_id PK; position_code UQ; title; department_id FK→departments; salary_grade_id FK→salary_grades; level; headcount; filled_count; created_at; updated_at *(rev 2.0: `salary_band_text` removed — derived display)*

**4. `employees`** — employee_id PK; employee_code UQ; first_name; middle_name; last_name; email UQ; personal_email; phone; address; birth_date; gender; civil_status; nationality; sss_number; philhealth_number; pagibig_number; tin_number; position_id FK→positions; department_id FK→departments; employment_type; date_hired; supervisor_employee_id FK→employees; status; onboarding_complete BOOLEAN; salary_grade_id FK→salary_grades; employee_record_last_updated_at; salary_step; created_at; updated_at *(rev 2.0: `emergency_contact_summary` removed; 9 personal/benefit fields added)*

**5. `employee_emergency_contacts`** — emergency_contact_id PK; employee_id FK→employees; name; relationship; phone; address; is_primary; created_at; updated_at

**6. `employee_position_history`** — position_history_id PK; employee_id FK→employees; effective_date; change_type DEFAULT 'Employment' (Employment/Promotion/Transfer); old_position_id FK→positions; new_position_id FK→positions; old_salary_grade_id FK→salary_grades; new_salary_grade_id FK→salary_grades; notes; created_at *(rev 2.0: `change_type` added)*

**7. `employee_exit_records`** — exit_record_id PK; employee_id UQ FK→employees (one terminal record per employee); exit_type; exit_date; clearance_status; coe_status; notes; created_at; updated_at

**8. `employee_documents`** — document_id PK; employee_id FK→employees; document_code; title; category; file_path; mime_type; file_size_bytes; document_status; document_date; expiry_date; last_updated_at; created_at; updated_at; **UNIQUE (employee_id, document_code)** *(rev 2.0: unique moved from global `document_code` to per-employee)*

### Domain 2 — Recruitment (7 tables)

**9. `job_posts`** — job_post_id PK; slug UQ; title; department_id FK→departments; position_id FK→positions (nullable); employment_type; schedule; salary_min; salary_max; vacancies; filled_count; posted_date; status; active; experience_level; education_level; summary; description; responsibilities_json; qualifications_json; skills_json; benefits_json; picture; created_at; updated_at

**10. `job_post_platforms`** — job_post_platform_id PK; job_post_id FK→job_posts; platform; published_at; status; created_at; **UNIQUE (job_post_id, platform)**

**11. `applicants`** — applicant_id PK; applicant_code UQ; job_post_id FK→job_posts; name; email; phone; applied_at; fit_score; status; stage; source; resume_file_path; summary; flags_json; created_at; updated_at

**12. `applicant_screening_entities`** — entity_id PK; applicant_id FK→applicants; label; value; created_at

**13. `applicant_screening_scores`** — score_id PK; applicant_id FK→applicants; criterion; score; created_at

**14. `interviews`** — interview_id PK; interview_code UQ; applicant_id FK→applicants; scheduled_date; scheduled_time; mode; interviewer_employee_id FK→employees (nullable); interviewer_name (snapshot); status; created_at; updated_at

**15. `applicant_assessments`** *(NEW)* — assessment_id PK; applicant_id FK→applicants; assessor_user_id FK→system_users (nullable); assessment_date; scores_json; total_score; outcome (Recommended/Hold/Not Recommended); remarks; created_at; updated_at

### Domain 3 — Hiring & Onboarding (6 tables)

**16. `requisitions`** — requisition_id PK; requisition_code UQ; position_id FK→positions (nullable); position_title (snapshot); department_id FK→departments; requested_by_user_id FK→system_users; requested_count; urgency; justification; status; requested_at; converted_job_post_id FK→job_posts; created_at; updated_at *(rev 2.0: nullable FK + title snapshot)*

**17. `new_hires`** — new_hire_id PK; new_hire_code UQ; applicant_id FK→applicants; employee_id FK→employees; name; email; phone; position_id FK→positions; department_id FK→departments; stage; start_date; created_at; updated_at

**18. `onboarding_checklist_templates`** — template_id PK; template_code UQ; title; phase; position_scope_json; status; created_at; updated_at

**19. `onboarding_checklist_items`** — template_item_id PK; template_id FK→onboarding_checklist_templates; item_text; sort_order; created_at

**20. `employee_onboarding_items`** — employee_onboarding_item_id PK; employee_id FK→employees; new_hire_id FK→new_hires; template_item_id FK→onboarding_checklist_items; item_text (snapshot); done; completed_at; completed_by_user_id FK→system_users; created_at; updated_at

**21. `checklist_requests`** *(NEW)* — checklist_request_id PK; request_code UQ; employee_id FK→employees; template_id FK→onboarding_checklist_templates; phase; items_json; status DEFAULT 'Pending'; requested_by_user_id FK→system_users; requested_at; created_at; updated_at

### Domain 4 — Employee Self-Service (5 tables)

**22. `ess_categories`** *(NEW)* — ess_category_id PK; code UQ; name; description; is_open; sort_order; created_at; updated_at

**23. `ess_requests`** — ess_request_id PK; request_code UQ; employee_id FK→employees; category_id FK→ess_categories (SET NULL); request_type; filed_at; date_from; date_to; status; assigned_to_user_id FK→system_users; details; review_note; returned_count DEFAULT 0; attachment_path; created_at; updated_at *(rev 2.0: category string → FK; 5 fields added)*

**24. `leave_balances`** — leave_balance_id PK; employee_id FK→employees; leave_type; period_year; total_days; used_days; created_at; updated_at; **UNIQUE (employee_id, leave_type, period_year)**

**25. `attendance_records`** — attendance_id PK; employee_id FK→employees; work_date; time_in; time_out; break_in; break_out; hours_worked; late_minutes; undertime_minutes; overtime_hours; remark; status; created_at; updated_at; **UNIQUE (employee_id, work_date)**

**26. `work_schedules`** — work_schedule_id PK; employee_id FK→employees; day_of_week; shift_name; start_time; end_time; location; is_rest_day; effective_from; effective_to; created_at; updated_at

### Domain 5 — Payroll & Benefits (4 tables)

**27. `payroll_periods`** *(NEW rev 2.1)* — payroll_period_id PK; period_code UQ; period_name; period_start; period_end; payout_date; status DEFAULT 'Open'; created_at; updated_at — master cut-off table referenced by `payroll_records.payroll_period_id`

**28. `payroll_records`** — payroll_record_id PK; employee_id FK→employees; payroll_period_id FK→payroll_periods (nullable, rev 2.1); pay_period_start; pay_period_end; payout_date; gross_pay; net_pay; status; created_at; updated_at

**29. `payroll_items`** — payroll_item_id PK; payroll_record_id FK→payroll_records; item_type; label; amount; created_at

**30. `employee_benefits`** — employee_benefit_id PK; employee_id FK→employees; benefit_name; reference_value; note; effective_date; end_date; status; created_at; updated_at

### Domain 6 — Learning & Performance (4 tables)

**31. `learning_courses`** — course_id PK; course_code UQ; title; category; description; created_at; updated_at

**32. `employee_learning`** — employee_learning_id PK; employee_id FK→employees; course_id FK→learning_courses; status; score; assigned_date; completed_date; created_at; updated_at; **UNIQUE (employee_id, course_id)**

**33. `performance_reviews`** — performance_review_id PK; employee_id FK→employees; review_period; review_date; competency_level; overall_rating; salary_grade_id FK→salary_grades; salary_step; evaluator_user_id FK→system_users; comments; created_at; updated_at *(rev 2.0: `salary_grade_code` → FK)*

**34. `hr3_recommendations`** — recommendation_id PK; employee_id FK→employees; recommendation_type; evaluation_score; evaluator_user_id FK→system_users; date_submitted; status; suggested_position_id FK→positions; suggested_salary_grade_id FK→salary_grades; current_employment_type (snapshot); comments; created_at; updated_at *(rev 2.0: employment-type snapshot added)*

### Domain 7 — Access Control & System (8 tables)

**35. `system_roles`** — role_id PK; role_name UQ; description; created_at; updated_at — seeded: Super Admin, Admin, Employee

**36. `role_permissions`** *(MERGE of system_permissions + system_role_permissions)* — role_permission_id PK; role_id FK→system_roles; module_name; permission_level DEFAULT 'None' (Full/View/Edit/Delete/Approve-Reject/None); created_at; updated_at; **UNIQUE (role_id, module_name)** — reproduces the Settings role matrix exactly

**37. `system_users`** — system_user_id PK; username UQ; email UQ; password_hash; full_name; department_name (snapshots for non-employee users); employee_id UQ FK→employees (nullable); role_id FK→system_roles; status; last_login_at; last_login_ip; created_at; updated_at *(rev 2.0: display-name/department snapshots added)*

**38. `notifications`** *(NEW rev 2.1)* — notification_id PK; system_user_id FK→system_users; type; title; body; module_name; target_type; target_id; is_read BOOLEAN DEFAULT FALSE; read_at; created_at — per-user in-app notifications behind the portal bell (unread count)

**39. `user_login_activity`** *(NEW rev 2.1)* — login_activity_id PK; system_user_id FK→system_users; login_at; ip_address; device_info; user_agent; status (success/failed) — append-only login history for the employee profile login-activity view

**40. `audit_logs`** — audit_log_id PK; system_user_id FK→system_users (SET NULL); actor_role; actor_department; occurred_at; action; module_name; target_type; target_id; details; severity; ip_address; device_info *(rev 2.0: actor snapshots added)* — append-only

**41. `announcements`** — announcement_id PK; published_date; title; body; audience DEFAULT 'All' (All/Admin/Employee); created_by_user_id FK→system_users; status; created_at; updated_at *(rev 2.0: audience added)*

**42. `system_settings`** — setting_id PK; setting_key UQ; setting_value JSON; updated_by_user_id FK→system_users; created_at; updated_at

## 8. Relationship rules (68 foreign keys)
- `departments.head_employee_id` → `employees.employee_id`
- `positions.department_id` → `departments.department_id`; `positions.salary_grade_id` → `salary_grades.salary_grade_id`
- `employees.position_id` → `positions.position_id`; `employees.department_id` → `departments.department_id`; `employees.supervisor_employee_id` → `employees.employee_id`; `employees.salary_grade_id` → `salary_grades.salary_grade_id`
- `employee_emergency_contacts.employee_id` → `employees.employee_id`
- `employee_position_history.employee_id` → `employees.employee_id`; `old_position_id`/`new_position_id` → `positions.position_id`; `old_salary_grade_id`/`new_salary_grade_id` → `salary_grades.salary_grade_id`
- `employee_exit_records.employee_id` → `employees.employee_id`
- `employee_documents.employee_id` → `employees.employee_id`
- `job_posts.department_id` → `departments.department_id`; `job_posts.position_id` → `positions.position_id`
- `job_post_platforms.job_post_id` → `job_posts.job_post_id`
- `applicants.job_post_id` → `job_posts.job_post_id`
- `applicant_screening_entities.applicant_id` → `applicants.applicant_id`; `applicant_screening_scores.applicant_id` → `applicants.applicant_id`
- `interviews.applicant_id` → `applicants.applicant_id`; `interviews.interviewer_employee_id` → `employees.employee_id`
- `applicant_assessments.applicant_id` → `applicants.applicant_id`; `applicant_assessments.assessor_user_id` → `system_users.system_user_id`
- `requisitions.position_id` → `positions.position_id`; `requisitions.department_id` → `departments.department_id`; `requisitions.requested_by_user_id` → `system_users.system_user_id`; `requisitions.converted_job_post_id` → `job_posts.job_post_id`
- `new_hires.applicant_id` → `applicants.applicant_id`; `new_hires.employee_id` → `employees.employee_id`; `new_hires.position_id` → `positions.position_id`; `new_hires.department_id` → `departments.department_id`
- `onboarding_checklist_items.template_id` → `onboarding_checklist_templates.template_id`
- `employee_onboarding_items.employee_id` → `employees.employee_id`; `new_hire_id` → `new_hires.new_hire_id`; `template_item_id` → `onboarding_checklist_items.template_item_id`; `completed_by_user_id` → `system_users.system_user_id`
- `checklist_requests.employee_id` → `employees.employee_id`; `template_id` → `onboarding_checklist_templates.template_id`; `requested_by_user_id` → `system_users.system_user_id`
- `ess_requests.employee_id` → `employees.employee_id`; `category_id` → `ess_categories.ess_category_id`; `assigned_to_user_id` → `system_users.system_user_id`
- `leave_balances.employee_id` → `employees.employee_id`; `attendance_records.employee_id` → `employees.employee_id`; `work_schedules.employee_id` → `employees.employee_id`
- `payroll_records.employee_id` → `employees.employee_id`; `payroll_records.payroll_period_id` → `payroll_periods.payroll_period_id`; `payroll_items.payroll_record_id` → `payroll_records.payroll_record_id`
- `employee_benefits.employee_id` → `employees.employee_id`
- `employee_learning.employee_id` → `employees.employee_id`; `course_id` → `learning_courses.course_id`
- `performance_reviews.employee_id` → `employees.employee_id`; `salary_grade_id` → `salary_grades.salary_grade_id`; `evaluator_user_id` → `system_users.system_user_id`
- `hr3_recommendations.employee_id` → `employees.employee_id`; `evaluator_user_id` → `system_users.system_user_id`; `suggested_position_id` → `positions.position_id`; `suggested_salary_grade_id` → `salary_grades.salary_grade_id`
- `role_permissions.role_id` → `system_roles.role_id`
- `system_users.employee_id` → `employees.employee_id`; `system_users.role_id` → `system_roles.role_id`
- `audit_logs.system_user_id` → `system_users.system_user_id`; `notifications.system_user_id` → `system_users.system_user_id`; `user_login_activity.system_user_id` → `system_users.system_user_id`
- `announcements.created_by_user_id` → `system_users.system_user_id`
- `system_settings.updated_by_user_id` → `system_users.system_user_id`

## 9. Key workflow data flows
### Recruitment to employee
`requisitions` → `job_posts` → `applicants` → (`interviews`, `applicant_assessments`) → `new_hires` → `employees` → `employee_onboarding_items`.

### Core employee lifecycle
`departments` + `positions` + `salary_grades` → `employees`; later movement is appended to `employee_position_history`; terminal status creates `employee_exit_records`; the 201-file is represented through `employee_documents`.

### ESS
`employees` → `ess_requests` (via `ess_categories`), `leave_balances`, `attendance_records`, `work_schedules`, `payroll_records`, `employee_benefits`, `employee_learning`, `performance_reviews`, `employee_documents`.

### Access control
`system_roles` → `role_permissions` (role × module → level); `system_users` belongs to one role and optionally one employee; `audit_logs` records actions from system users.

## 10. Integrity and validation rules
- `employees.employee_code`, `system_users.username`, `system_users.email`, `job_posts.slug`, `applicants.applicant_code`, requisition/job/interview/request/document codes must be unique; `employee_documents` codes are unique per employee.
- `employees.supervisor_employee_id` may reference the same table but must not equal `employees.employee_id`.
- `positions.department_id` and `employees.department_id/position_id` must be validated by the service layer so an employee’s position normally belongs to the employee’s department.
- `job_posts.position_id` and `requisitions.position_id` may be null for job/requisition records created before a formal position exists; `position_title` snapshots the display name.
- `payroll_records` must be unique per employee/pay period; line items must sum to the stored gross/net according to the payroll engine’s rules.
- `leave_balances` is unique per employee/leave type/year; `attendance_records` per employee/work date; `employee_learning` per employee/course; `role_permissions` per role/module; `job_post_platforms` per job post/platform; `employee_documents` per employee/code.
- `audit_logs` is append-only from the application perspective.
- Enum-like columns are guarded by CHECK constraints (43 total, identical in both SQL files). `role_permissions.module_name` is restricted to the ten frontend permission modules and `permission_level` to the six UI levels (`Full`, `View`, `Edit`, `Delete`, `Approve / Reject Only`, `None`); NULLable enum columns use `IS NULL OR col IN (...)` so they only validate when a value is provided.
- `positions.filled_count`, `job_posts.filled_count`, and `employees.onboarding_complete` are derived counters. They must be updated in the same transaction as the triggering event (applicant→new-hire conversion; last onboarding item completed); they must never be recomputed in a separate/asynchronous step.
- Employee document file bytes must never be embedded in ordinary row columns; use secure object/file storage.
- ESS request `category_id` is SET NULL when a category is removed; audit `system_user_id` is SET NULL when a user is removed (row remains).

## 11. Migration / frontend integration requirements
- Replace `src/data/*.ts` seed arrays with API-backed repositories/hooks, keeping the same field names at the UI boundary where practical.
- Introduce DTO mappers where database naming is snake_case but React types use camelCase.
- Create seed data from the existing fixtures so the initial UI remains recognizable during migration. Seed `role_permissions` from the `users.ts` role matrix; seed `ess_categories` from `ess.ts` categories; seed onboarding templates/items from `hires.ts`; seed announcements with their audience values.
- Migrate nested promotion history and exit details into `employee_position_history` (with `change_type`) and `employee_exit_records` instead of serializing them on `employees`.
- Migrate job array fields to JSON columns so existing UI rendering can continue without extra joins.
- Generate onboarding item rows from the active template(s) when a new hire becomes an employee/probationary hire.
- Ensure the employee account creation flow links `system_users.employee_id` instead of identifying the employee only by name/email; keep `full_name`/`department_name` for non-employee accounts.

## 12. Acceptance criteria for the database implementation
- The implementation contains exactly the 42 proposed tables.
- Every FK in the proposal (68) is enforced by the database.
- Every CHECK constraint in the SQL files (43) rejects out-of-domain enum values; the seed data derived from `frontend/src` satisfies all of them.
- All frontend data modules listed in Section 3 can be represented without lossy manual parsing, except the explicitly retained JSON arrays.
- Recruitment-to-hire conversion can be completed inside a transaction.
- Employee and payroll history remains queryable after status changes and separation.
- Role permissions can reproduce the current `Super Admin`, `Admin`, and `Employee` matrices from `role_permissions` alone.
- The audit log captures permission changes, approvals, account state changes, and major HR transactions, including actor role/department.
- Both supplied SQL files execute cleanly on their target database after setting the target schema/database name.
- The full-coverage image contains all 42 tables and all 443 columns; its table count exactly matches Section 7 and `hotel_hr_database_table_inventory.txt`.
- The relationship-summary image contains all 42 table names, shows all 68 FK connections, and uses only horizontal/vertical orthogonal connectors; no diagonal relationship lines are used.

## 13. Deliverables generated with this PRD
- `hotel_hr_database_prd.md` — this complete database PRD/specification (rev 2.2, 42 tables).
- `hotel_hr_database_audit_report.md` — the 25-section audit report behind revision 2.0.
- `hotel_hr_schema_mysql.sql` — MySQL 8.0+ DDL (42 tables, 443 columns, 68 FKs, 29 uniques, 90 indexes, 43 CHECKs).
- `hotel_hr_schema_postgres.sql` — PostgreSQL 15+ DDL (identical model; explicit FK indexes).
- `hotel_hr_database_full_coverage.png` — exact high-level schema coverage image with all tables and all columns.
- `hotel_hr_database_relationship_summary.png` — simplified relationship summary using horizontal/vertical connectors.
- `hotel_hr_database_table_inventory.txt` — 42-table inventory.

## 14. Implementation note
The uploaded frontend did not expose an existing persistent relational schema in the inspected `frontend/src` domain files. Therefore, this proposal uses the frontend types and workflows as the authoritative starting point, while avoiding duplicate tables for static or purely presentational structures. Existing server/database code outside that frontend scope should be checked before migration so an already-deployed table can be reused rather than duplicated.