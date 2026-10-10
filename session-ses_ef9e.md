# Working databases identification, table reduction

**Session ID:** ses_ef9e52542ffer5raG07W5O7prJ
**Created:** 10/4/2026, 4:49:45 PM
**Updated:** 10/4/2026, 9:39:49 PM

---

## User

may i know the table that are currently working and it is used, I just want to know and I want to lessen my table in my database.

---

## Assistant (Build · Muse Spark 1.3 Free · 12.1s)

_Thinking:_



Listing your tables to see what's actually used.

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Windows 10 Lite\\Downloads\\MUNJOR\\4TH YR\\DEV\\LATEST CLONE\\v14\\2nd-repo-for-hrms-backend-"
}
```

**Output:**
```
<path>C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-</path>
<type>directory</type>
<entries>
__pycache__/
.git/
.gitattributes
.gitignore
.kilo/
.playwright-mcp/
backend-laravel/
CAPSTONE_DEVELOPMENT_GUIDE.md
database/
dev-server.log
DEVELOPMENT_PROGRESS.md
docs/
frontend/
hotel_hr (10).sql
hotel_hr.sql
nlp-service/
package-lock.json
README.md
reference/
requirements.txt
RESUME/
session-ses_f04a.md
session-ses_fdf0.md
Social_Recognition_Feature_Spec.md
source/
TECHNICAL-SOFTWARE-EVALUATION-AUDIT-CHECKLIST.docx
TRASH/

(27 entries)
</entries>
```

---

## Assistant (Build · Muse Spark 1.3 Free · 6.7s)

_Thinking:_



**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Windows 10 Lite\\Downloads\\MUNJOR\\4TH YR\\DEV\\LATEST CLONE\\v14\\2nd-repo-for-hrms-backend-\\database"
}
```

**Output:**
```
<path>C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\database</path>
<type>directory</type>
<entries>
add_drop_tables.js
EMPLOYEE_ESS_MAPPING.md
hotel_hr (7).sql
hotel_hr_database_full_coverage.png
hotel_hr_database_prd.md
hotel_hr_database_relationship_summary.png
hotel_hr_database_table_inventory.txt
hotel_hr_latest_export.sql
hotel_hr_latest.sql
hotel_hr_latestv1.9.sql
hotel_hr_latestv1.sql
hotel_hr_latestv2.sql
hotel_hr_merged(latest) (2).sql
hotel_hr_merged(latest) (3).sql
hotel_hr_merged(latest) (4).sql
hotel_hr_merged(latest).sql
hotel_hr_schema_mysql.sql
hotel_hr_schema_postgres.sql
hotel_hr_seed_mysql.sql
hotel_hr_seed_postgres.sql
hotel_hr.sql
kalat/
REVIEW-FINDINGS.md
sync_laravel_seeder.js
update_database_dump.js

(25 entries)
</entries>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Windows 10 Lite\\Downloads\\MUNJOR\\4TH YR\\DEV\\LATEST CLONE\\v14\\2nd-repo-for-hrms-backend-\\backend-laravel"
}
```

**Output:**
```
<path>C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel</path>
<type>directory</type>
<entries>
_add_5_applicants_with_docs.php
_reinsert_adrian_concierge.php
_reset_new2_applicants.php
.editorconfig
.env
.env.example
.gitattributes
.github/
.gitignore
.phpunit.result.cache
.styleci.yml
app/
artisan
audit_db.php
bootstrap/
CHANGELOG.md
check_aldrex.php
check_emp_link.php
check_jhonwick.php
check_phpmyadmin_db.php
composer-DESKTOP-T31RHI0.json
composer-DESKTOP-T31RHI0.lock
composer.json
composer.lock
config/
database/
fix_jhonwick.php
modules_statuses.json
Modules/
package.json
phpunit.xml
public/
README.md
resources/
routes/
scripts/
seed_recognitions_clean.php
seed_recognitions.php
seed_user.php
storage/
sync_employees.php
test_all_ess.php
test_auth.php
test_db_endpoints.php
test_ess_routes.php
test_ess.php
tests/
tmp_jobdump.php
tmp_jobpurge.php
tmp_rmverify.php
vendor/
verify_jw.php
vite.config.js

(53 entries)
</entries>
```

---

## Assistant (Build · Muse Spark 1.3 Free · 6.7s)

_Thinking:_



**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Windows 10 Lite\\Downloads\\MUNJOR\\4TH YR\\DEV\\LATEST CLONE\\v14\\2nd-repo-for-hrms-backend-\\database\\hotel_hr_database_table_inventory.txt"
}
```

**Output:**
```
<path>C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\database\hotel_hr_database_table_inventory.txt</path>
<type>file</type>
<content>
1: Hotel & Restaurant HR1 - Final Database Table Inventory (Revision 2.2)
2: =======================================================================
3: 
4: 01. departments
5: 02. salary_grades
6: 03. positions
7: 04. employees
8: 05. employee_emergency_contacts
9: 06. employee_position_history
10: 07. employee_exit_records
11: 08. employee_documents
12: 09. job_posts
13: 10. job_post_platforms
14: 11. applicants
15: 12. applicant_screening_entities
16: 13. applicant_screening_scores
17: 14. interviews
18: 15. applicant_assessments          [NEW]
19: 16. requisitions
20: 17. new_hires
21: 18. onboarding_checklist_templates
22: 19. onboarding_checklist_items
23: 20. employee_onboarding_items
24: 21. checklist_requests             [NEW]
25: 22. ess_categories                 [NEW]
26: 23. ess_requests
27: 24. leave_balances
28: 25. attendance_records
29: 26. work_schedules
30: 27. payroll_periods                [NEW rev 2.1]
31: 28. payroll_records
32: 29. payroll_items
33: 30. employee_benefits
34: 31. learning_courses
35: 32. employee_learning
36: 33. performance_reviews
37: 34. hr3_recommendations
38: 35. system_roles
39: 36. role_permissions               [MERGE: system_permissions + system_role_permissions]
40: 37. system_users
41: 38. notifications                  [NEW rev 2.1]
42: 39. user_login_activity            [NEW rev 2.1]
43: 40. audit_logs
44: 41. announcements
45: 42. system_settings
46: 
47: TOTAL TABLES: 42
48: 
49: Revision 2.0 changes vs revision 1.0 (37 tables):
50: - MERGED system_permissions + system_role_permissions -> role_permissions
51: - ADDED applicant_assessments, checklist_requests, ess_categories
52: - MODIFIED employees, positions, employee_position_history,
53:   employee_documents, requisitions, ess_requests, performance_reviews,
54:   hr3_recommendations, system_users, audit_logs, announcements
55: 
56: Revision 2.1 changes vs revision 2.0 (39 tables):
57: - ADDED notifications, user_login_activity, payroll_periods
58: - MODIFIED payroll_records (nullable payroll_period_id FK)
59: 
60: Revision 2.2 changes vs revision 2.1:
61: - ADDED 43 CHECK constraints (enum/domain guards; identical in both SQL files)
62: - ADDED SQL comments on derived counters (positions.filled_count,
63:   job_posts.filled_count, employees.onboarding_complete): must be maintained
64:   in the same transaction as the triggering event
65: - No table/column/FK/unique/index metric changes
66: 
67: Verified metrics (parsed from hotel_hr_schema_mysql.sql rev 2.2):
68: - Columns: 443
69: - Primary keys: 42
70: - Foreign keys: 68
71: - Unique constraints: 29
72: - Non-unique indexes: 90
73: - CHECK constraints: 43

(End of file - total 73 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Windows 10 Lite\\Downloads\\MUNJOR\\4TH YR\\DEV\\LATEST CLONE\\v14\\2nd-repo-for-hrms-backend-\\database\\hotel_hr_database_prd.md"
}
```

**Output:**
```
<path>C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\database\hotel_hr_database_prd.md</path>
<type>file</type>
<content>
1: # Hotel & Restaurant HR1 — Detailed Database PRD and Generation Specification (Revision 2.2)
2: 
3: **Source analyzed:** `Hotel-and-Restaurant-HR1 - main`, with primary evidence from `frontend/src` and its route/module/data files. **Database proposal:** 42 tables. **Database engines:** MySQL 8.0+ and PostgreSQL 15+ compatible design.
4: **Revision history:** Rev 1.0 proposed 34 tables in Section 1 and 37 in Section 7 (inconsistent). Rev 2.0 (post-audit, see `hotel_hr_database_audit_report.md`) corrects the count and incorporates the audit decisions: `role_permissions` replaces `system_permissions` + `system_role_permissions`, and `applicant_assessments`, `checklist_requests`, and `ess_categories` are added. All artifacts then agreed on 39 tables. Rev 2.1 (approved additions) adds `notifications`, `user_login_activity`, and `payroll_periods`, and links `payroll_records.payroll_period_id` to the new master period table. Rev 2.2 (professional hardening) adds 43 CHECK constraints across both SQL files — one per enum-like column set, including `role_permissions.module_name` and `permission_level` — and adds SQL comments on the three derived counters (`positions.filled_count`, `job_posts.filled_count`, `employees.onboarding_complete`) requiring them to be maintained in the same transaction as the triggering event. Table/column/FK/unique/index metrics are unchanged.
5: 
6: ## 1. Purpose
7: This PRD defines the database to be implemented behind the existing Hotel & Restaurant HR frontend. It is intentionally evidence-driven: the database must represent the real domains and fields already exposed by the UI before introducing new entities. The design favors reuse of a master entity (department, position, employee, user, job post) over duplicate lookup tables and uses JSON only for source arrays whose decomposition would add tables without meaningful relational value.
8: 
9: ## 2. Source-analysis rules
10: 1. Treat `frontend/src/data/*.ts` as the current domain contract for the UI. The key contracts found are `Department`, `Position`, `Employee`, `SalaryGrade`, `HR3Recommendation`, `Applicant`, `AssessmentResult`, `Interview`, `Requisition`, `NewHire`, `ChecklistRequest`, `ESSRequest`, `EssCategory`, `EssActivityLog`, `SystemUser`, audit entries, and the ESS datasets for attendance, schedules, leave balances, payroll, benefits, learning, performance, and documents.
11: 2. Treat `frontend/src/components/modules/*.tsx` and `frontend/src/routes/*.tsx` as the workflow contract: Applicant Management, Recruitment Management, New Hire Onboarding, Core HCM, Employee Records, ESS Management, User/Settings, Audit Logs, and public/portal announcements.
12: 3. Do not create tables merely because a frontend array exists. Static content such as FAQs, hotel facilities, system-module descriptions, and company marketing copy should stay configuration/content data unless an admin UI clearly requires CRUD persistence.
13: 4. When the same value appears in several screens, create one authoritative master table and reference it with a foreign key. In particular, departments, positions, salary grades, employees, system users, roles, ESS categories, and job posts must not be duplicated in module-specific tables.
14: 5. Never use plaintext passwords. `system_users.password_hash` stores only an adaptive password hash (Argon2id/bcrypt/scrypt managed by the application).
15: 
16: ## 3. Frontend evidence map
17: | Frontend source | Database domains it drives |
18: |---|---|
19: | `src/data/hr.ts` | departments, positions, salary grades, employees, position history, exits, new hires, HR3 recommendations |
20: | `src/data/jobs.ts` | job posts, publishing platforms |
21: | `src/data/applicants.ts` | applicants, screening entities, screening scores, interviews, assessments |
22: | `src/data/requisitions.ts` | requisitions |
23: | `src/data/hires.ts` | new hires, onboarding templates/items, employee onboarding items, checklist requests |
24: | `src/data/records.ts` | employee document metadata and 201-file archiving metadata |
25: | `src/data/ess.ts` | ESS categories, ESS requests, leave balances, attendance, schedules, payroll, benefits, learning, performance, employee documents |
26: | `src/data/users.ts` | system users, roles, permissions, audit logs |
27: | `src/components/modules/Settings.tsx` | role/permission administration and system settings |
28: | `src/components/modules/AuditLogs.tsx` | immutable audit records |
29: | `src/components/portal/portal-state.tsx`, `AnnouncementsCard.tsx`, `AnnouncementDialog.tsx` | announcements (title, body, **audience**, author, createdAt, visibility filtering) |
30: | `src/data/company.ts` | announcements are persisted; FAQs/facilities/company marketing remain non-transactional content |
31: 
32: ## 4. Scope
33: ### In scope
34: Authentication/account linkage; department and position master data; salary grades; employee 201-file core record (personal data, benefit numbers, employment data); emergency contacts; movement/history and exits; employee documents; recruitment requisitions and vacancies; job publishing; applicant screening, interviews, and assessments; hiring handoff; onboarding checklist templates, employee instances, and checklist requests; ESS categories and requests; attendance; schedules; leave balances; payroll and payroll line items; benefits; learning; performance reviews and HR3 recommendations; role-based permission matrix; audit trail; announcements; system settings.
35: 
36: ### Explicitly not modeled as separate tables
37: - Company overview/tagline/mission/vision/values, hotel facilities, and FAQs: currently static public content in `company.ts`, with no demonstrated CRUD workflow.
38: - Job responsibilities, qualifications, skills, and benefits: retained as JSON arrays in `job_posts` to preserve the frontend structure without four additional many-to-many tables.
39: - Applicant flags: retained as JSON in `applicants.flags_json` because the UI treats them as a display-oriented string array.
40: - Checklist-request requested items and assessment score breakdowns: retained as JSON (`checklist_requests.items_json`, `applicant_assessments.scores_json`) because item CRUD is a single-document lifecycle; promote to child tables if item-level reporting is ever required.
41: - ESS request types: controlled application enums; categories, however, are CRUD-managed with an open/close toggle and are modeled as the `ess_categories` table.
42: 
43: ## 5. Functional requirements
44: - **FR-01:** Core HCM must maintain one employee master record and reference department, position, salary grade, and supervisor through foreign keys. The 201-file personal and benefit-number fields (birth date, gender, civil status, nationality, personal email, SSS/PhilHealth/Pag-IBIG/TIN numbers) must be stored on the employee record.
45: - **FR-02:** Recruitment must retain a requisition-to-position-to-job-post traceability chain. Requisitions may reference positions that do not exist in the position master yet (seed data uses titles such as Security Officer, Spa Therapist, Sous Chef); the schema therefore keeps a nullable `position_id` plus a `position_title` snapshot.
46: - **FR-03:** Applicants must belong to a job post, and one applicant may have many screening entities, criterion scores, interviews, and assessments.
47: - **FR-04:** A hired applicant may become a new-hire record and then an employee; the same employee must not be duplicated across modules.
48: - **FR-05:** Onboarding templates must define reusable checklist items, while employee onboarding items store per-employee completion state and snapshots. Checklist requests (Performance section) must be persisted with phase, status, requester, and item JSON.
49: - **FR-06:** ESS requests must point to the employee who filed them, the category (master, open/close toggle), optional date range, review note, return count, attachment path, and optionally the system user assigned to process them.
50: - **FR-07:** Attendance must support daily punches, breaks, hours, lateness, undertime, overtime, remarks, and correction history at the application layer.
51: - **FR-08:** Schedules must support day-of-week rows, shift names, start/end times, locations, rest days, and effective dates.
52: - **FR-09:** Payroll must support one employee/pay-period header with many earning/deduction line items.
53: - **FR-10:** Benefits, learning progress, and performance reviews must be employee-centered and historical rather than overwritten snapshots.
54: - **FR-11:** Permissions must reproduce the role matrix already represented in `users.ts` as a role × module → permission-level model: one `role_permissions` table with a `(role_id, module_name)` unique key.
55: - **FR-12:** Audit logs must identify the actor when available (system user plus actor role/department snapshots) and preserve timestamp, action, module, target, severity, IP, and device information.
56: - **FR-13:** Employee documents must support status and expiry plus a last-updated timestamp for the frontend’s 201-file archive rule; document codes are unique per employee, not globally.
57: - **FR-14:** Announcements must persist audience (All/Admin/Employee), title, body, publish date, and author so the portal can reproduce `isVisibleTo()` filtering.
58: - **FR-15:** The schema must support MySQL and PostgreSQL without relying on vendor-only behavior beyond ordinary timestamp/identity differences.
59: 
60: ## 6. Non-functional requirements
61: - Use foreign keys and unique constraints to prevent duplicate master data.
62: - Index every foreign key and common dashboard filters: status, dates, employee code, department, job status, applicant stage, ESS status, payroll period.
63: - Use UTC timestamps at the database/API boundary and localize to Asia/Manila in the UI.
64: - Use database transactions for hiring conversion, employee onboarding generation, payroll finalization, permission changes, and ESS approval actions.
65: - Do not physically delete employee/audit/payroll history by default; use status/archival semantics. Pure child aggregates use ON DELETE CASCADE; reference masters use RESTRICT; ESS category and audit actor use SET NULL.
66: - Store files outside the relational database and keep only secure storage paths/object identifiers in `employee_documents`, `applicant_assessments`/`applicants` resume fields, and `ess_requests.attachment_path`.
67: - Use least-privilege DB credentials and application-side authorization in addition to the role matrix.
68: 
69: ## 7. Proposed tables
70: **Total: 42 tables.** This count is exactly the count represented in the generated high-level database image and the table inventory.
71: 
72: Column conventions: every table has a surrogate `*_id` primary key; `created_at`/`updated_at` audit timestamps; monetary values as `DECIMAL(14,2)`/`DECIMAL(12,2)` (MySQL) or `NUMERIC` (PostgreSQL); JSON only for the fields listed as JSON. Type spellings are given in MySQL form; the PostgreSQL mapping is `BIGINT UNSIGNED AUTO_INCREMENT`→`BIGSERIAL`, `TINYINT(1)`→`BOOLEAN`, `JSON`→`JSONB`, `DECIMAL`→`NUMERIC`.
73: 
74: ### Domain 1 — Organization & Core HCM (8 tables)
75: 
76: **1. `departments`** — department_id PK; code UQ; name UQ; description; head_employee_id FK→employees; budget; created_at; updated_at
77: 
78: **2. `salary_grades`** — salary_grade_id PK; code UQ; title; min_salary; max_salary; currency_code CHAR(3) DEFAULT 'PHP'; level; notes; created_at; updated_at
79: 
80: **3. `positions`** — position_id PK; position_code UQ; title; department_id FK→departments; salary_grade_id FK→salary_grades; level; headcount; filled_count; created_at; updated_at *(rev 2.0: `salary_band_text` removed — derived display)*
81: 
82: **4. `employees`** — employee_id PK; employee_code UQ; first_name; middle_name; last_name; email UQ; personal_email; phone; address; birth_date; gender; civil_status; nationality; sss_number; philhealth_number; pagibig_number; tin_number; position_id FK→positions; department_id FK→departments; employment_type; date_hired; supervisor_employee_id FK→employees; status; onboarding_complete BOOLEAN; salary_grade_id FK→salary_grades; employee_record_last_updated_at; salary_step; created_at; updated_at *(rev 2.0: `emergency_contact_summary` removed; 9 personal/benefit fields added)*
83: 
84: **5. `employee_emergency_contacts`** — emergency_contact_id PK; employee_id FK→employees; name; relationship; phone; address; is_primary; created_at; updated_at
85: 
86: **6. `employee_position_history`** — position_history_id PK; employee_id FK→employees; effective_date; change_type DEFAULT 'Employment' (Employment/Promotion/Transfer); old_position_id FK→positions; new_position_id FK→positions; old_salary_grade_id FK→salary_grades; new_salary_grade_id FK→salary_grades; notes; created_at *(rev 2.0: `change_type` added)*
87: 
88: **7. `employee_exit_records`** — exit_record_id PK; employee_id UQ FK→employees (one terminal record per employee); exit_type; exit_date; clearance_status; coe_status; notes; created_at; updated_at
89: 
90: **8. `employee_documents`** — document_id PK; employee_id FK→employees; document_code; title; category; file_path; mime_type; file_size_bytes; document_status; document_date; expiry_date; last_updated_at; created_at; updated_at; **UNIQUE (employee_id, document_code)** *(rev 2.0: unique moved from global `document_code` to per-employee)*
91: 
92: ### Domain 2 — Recruitment (7 tables)
93: 
94: **9. `job_posts`** — job_post_id PK; slug UQ; title; department_id FK→departments; position_id FK→positions (nullable); employment_type; schedule; salary_min; salary_max; vacancies; filled_count; posted_date; status; active; experience_level; education_level; summary; description; responsibilities_json; qualifications_json; skills_json; benefits_json; created_at; updated_at
95: 
96: **10. `job_post_platforms`** — job_post_platform_id PK; job_post_id FK→job_posts; platform; published_at; status; created_at; **UNIQUE (job_post_id, platform)**
97: 
98: **11. `applicants`** — applicant_id PK; applicant_code UQ; job_post_id FK→job_posts; name; email; phone; applied_at; fit_score; status; stage; source; resume_file_path; summary; flags_json; created_at; updated_at
99: 
100: **12. `applicant_screening_entities`** — entity_id PK; applicant_id FK→applicants; label; value; created_at
101: 
102: **13. `applicant_screening_scores`** — score_id PK; applicant_id FK→applicants; criterion; score; created_at
103: 
104: **14. `interviews`** — interview_id PK; interview_code UQ; applicant_id FK→applicants; scheduled_date; scheduled_time; mode; interviewer_employee_id FK→employees (nullable); interviewer_name (snapshot); status; created_at; updated_at
105: 
106: **15. `applicant_assessments`** *(NEW)* — assessment_id PK; applicant_id FK→applicants; assessor_user_id FK→system_users (nullable); assessment_date; scores_json; total_score; outcome (Recommended/Hold/Not Recommended); remarks; created_at; updated_at
107: 
108: ### Domain 3 — Hiring & Onboarding (6 tables)
109: 
110: **16. `requisitions`** — requisition_id PK; requisition_code UQ; position_id FK→positions (nullable); position_title (snapshot); department_id FK→departments; requested_by_user_id FK→system_users; requested_count; urgency; justification; status; requested_at; converted_job_post_id FK→job_posts; created_at; updated_at *(rev 2.0: nullable FK + title snapshot)*
111: 
112: **17. `new_hires`** — new_hire_id PK; new_hire_code UQ; applicant_id FK→applicants; employee_id FK→employees; name; email; phone; position_id FK→positions; department_id FK→departments; stage; start_date; created_at; updated_at
113: 
114: **18. `onboarding_checklist_templates`** — template_id PK; template_code UQ; title; phase; position_scope_json; status; created_at; updated_at
115: 
116: **19. `onboarding_checklist_items`** — template_item_id PK; template_id FK→onboarding_checklist_templates; item_text; sort_order; created_at
117: 
118: **20. `employee_onboarding_items`** — employee_onboarding_item_id PK; employee_id FK→employees; new_hire_id FK→new_hires; template_item_id FK→onboarding_checklist_items; item_text (snapshot); done; completed_at; completed_by_user_id FK→system_users; created_at; updated_at
119: 
120: **21. `checklist_requests`** *(NEW)* — checklist_request_id PK; request_code UQ; employee_id FK→employees; template_id FK→onboarding_checklist_templates; phase; items_json; status DEFAULT 'Pending'; requested_by_user_id FK→system_users; requested_at; created_at; updated_at
121: 
122: ### Domain 4 — Employee Self-Service (5 tables)
123: 
124: **22. `ess_categories`** *(NEW)* — ess_category_id PK; code UQ; name; description; is_open; sort_order; created_at; updated_at
125: 
126: **23. `ess_requests`** — ess_request_id PK; request_code UQ; employee_id FK→employees; category_id FK→ess_categories (SET NULL); request_type; filed_at; date_from; date_to; status; assigned_to_user_id FK→system_users; details; review_note; returned_count DEFAULT 0; attachment_path; created_at; updated_at *(rev 2.0: category string → FK; 5 fields added)*
127: 
128: **24. `leave_balances`** — leave_balance_id PK; employee_id FK→employees; leave_type; period_year; total_days; used_days; created_at; updated_at; **UNIQUE (employee_id, leave_type, period_year)**
129: 
130: **25. `attendance_records`** — attendance_id PK; employee_id FK→employees; work_date; time_in; time_out; break_in; break_out; hours_worked; late_minutes; undertime_minutes; overtime_hours; remark; status; created_at; updated_at; **UNIQUE (employee_id, work_date)**
131: 
132: **26. `work_schedules`** — work_schedule_id PK; employee_id FK→employees; day_of_week; shift_name; start_time; end_time; location; is_rest_day; effective_from; effective_to; created_at; updated_at
133: 
134: ### Domain 5 — Payroll & Benefits (4 tables)
135: 
136: **27. `payroll_periods`** *(NEW rev 2.1)* — payroll_period_id PK; period_code UQ; period_name; period_start; period_end; payout_date; status DEFAULT 'Open'; created_at; updated_at — master cut-off table referenced by `payroll_records.payroll_period_id`
137: 
138: **28. `payroll_records`** — payroll_record_id PK; employee_id FK→employees; payroll_period_id FK→payroll_periods (nullable, rev 2.1); pay_period_start; pay_period_end; payout_date; gross_pay; net_pay; status; created_at; updated_at
139: 
140: **29. `payroll_items`** — payroll_item_id PK; payroll_record_id FK→payroll_records; item_type; label; amount; created_at
141: 
142: **30. `employee_benefits`** — employee_benefit_id PK; employee_id FK→employees; benefit_name; reference_value; note; effective_date; end_date; status; created_at; updated_at
143: 
144: ### Domain 6 — Learning & Performance (4 tables)
145: 
146: **31. `learning_courses`** — course_id PK; course_code UQ; title; category; description; created_at; updated_at
147: 
148: **32. `employee_learning`** — employee_learning_id PK; employee_id FK→employees; course_id FK→learning_courses; status; score; assigned_date; completed_date; created_at; updated_at; **UNIQUE (employee_id, course_id)**
149: 
150: **33. `performance_reviews`** — performance_review_id PK; employee_id FK→employees; review_period; review_date; competency_level; overall_rating; salary_grade_id FK→salary_grades; salary_step; evaluator_user_id FK→system_users; comments; created_at; updated_at *(rev 2.0: `salary_grade_code` → FK)*
151: 
152: **34. `hr3_recommendations`** — recommendation_id PK; employee_id FK→employees; recommendation_type; evaluation_score; evaluator_user_id FK→system_users; date_submitted; status; suggested_position_id FK→positions; suggested_salary_grade_id FK→salary_grades; current_employment_type (snapshot); comments; created_at; updated_at *(rev 2.0: employment-type snapshot added)*
153: 
154: ### Domain 7 — Access Control & System (8 tables)
155: 
156: **35. `system_roles`** — role_id PK; role_name UQ; description; created_at; updated_at — seeded: Super Admin, Admin, Employee
157: 
158: **36. `role_permissions`** *(MERGE of system_permissions + system_role_permissions)* — role_permission_id PK; role_id FK→system_roles; module_name; permission_level DEFAULT 'None' (Full/View/Edit/Delete/Approve-Reject/None); created_at; updated_at; **UNIQUE (role_id, module_name)** — reproduces the Settings role matrix exactly
159: 
160: **37. `system_users`** — system_user_id PK; username UQ; email UQ; password_hash; full_name; department_name (snapshots for non-employee users); employee_id UQ FK→employees (nullable); role_id FK→system_roles; status; last_login_at; last_login_ip; created_at; updated_at *(rev 2.0: display-name/department snapshots added)*
161: 
162: **38. `notifications`** *(NEW rev 2.1)* — notification_id PK; system_user_id FK→system_users; type; title; body; module_name; target_type; target_id; is_read BOOLEAN DEFAULT FALSE; read_at; created_at — per-user in-app notifications behind the portal bell (unread count)
163: 
164: **39. `user_login_activity`** *(NEW rev 2.1)* — login_activity_id PK; system_user_id FK→system_users; login_at; ip_address; device_info; user_agent; status (success/failed) — append-only login history for the employee profile login-activity view
165: 
166: **40. `audit_logs`** — audit_log_id PK; system_user_id FK→system_users (SET NULL); actor_role; actor_department; occurred_at; action; module_name; target_type; target_id; details; severity; ip_address; device_info *(rev 2.0: actor snapshots added)* — append-only
167: 
168: **41. `announcements`** — announcement_id PK; published_date; title; body; audience DEFAULT 'All' (All/Admin/Employee); created_by_user_id FK→system_users; status; created_at; updated_at *(rev 2.0: audience added)*
169: 
170: **42. `system_settings`** — setting_id PK; setting_key UQ; setting_value JSON; updated_by_user_id FK→system_users; created_at; updated_at
171: 
172: ## 8. Relationship rules (68 foreign keys)
173: - `departments.head_employee_id` → `employees.employee_id`
174: - `positions.department_id` → `departments.department_id`; `positions.salary_grade_id` → `salary_grades.salary_grade_id`
175: - `employees.position_id` → `positions.position_id`; `employees.department_id` → `departments.department_id`; `employees.supervisor_employee_id` → `employees.employee_id`; `employees.salary_grade_id` → `salary_grades.salary_grade_id`
176: - `employee_emergency_contacts.employee_id` → `employees.employee_id`
177: - `employee_position_history.employee_id` → `employees.employee_id`; `old_position_id`/`new_position_id` → `positions.position_id`; `old_salary_grade_id`/`new_salary_grade_id` → `salary_grades.salary_grade_id`
178: - `employee_exit_records.employee_id` → `employees.employee_id`
179: - `employee_documents.employee_id` → `employees.employee_id`
180: - `job_posts.department_id` → `departments.department_id`; `job_posts.position_id` → `positions.position_id`
181: - `job_post_platforms.job_post_id` → `job_posts.job_post_id`
182: - `applicants.job_post_id` → `job_posts.job_post_id`
183: - `applicant_screening_entities.applicant_id` → `applicants.applicant_id`; `applicant_screening_scores.applicant_id` → `applicants.applicant_id`
184: - `interviews.applicant_id` → `applicants.applicant_id`; `interviews.interviewer_employee_id` → `employees.employee_id`
185: - `applicant_assessments.applicant_id` → `applicants.applicant_id`; `applicant_assessments.assessor_user_id` → `system_users.system_user_id`
186: - `requisitions.position_id` → `positions.position_id`; `requisitions.department_id` → `departments.department_id`; `requisitions.requested_by_user_id` → `system_users.system_user_id`; `requisitions.converted_job_post_id` → `job_posts.job_post_id`
187: - `new_hires.applicant_id` → `applicants.applicant_id`; `new_hires.employee_id` → `employees.employee_id`; `new_hires.position_id` → `positions.position_id`; `new_hires.department_id` → `departments.department_id`
188: - `onboarding_checklist_items.template_id` → `onboarding_checklist_templates.template_id`
189: - `employee_onboarding_items.employee_id` → `employees.employee_id`; `new_hire_id` → `new_hires.new_hire_id`; `template_item_id` → `onboarding_checklist_items.template_item_id`; `completed_by_user_id` → `system_users.system_user_id`
190: - `checklist_requests.employee_id` → `employees.employee_id`; `template_id` → `onboarding_checklist_templates.template_id`; `requested_by_user_id` → `system_users.system_user_id`
191: - `ess_requests.employee_id` → `employees.employee_id`; `category_id` → `ess_categories.ess_category_id`; `assigned_to_user_id` → `system_users.system_user_id`
192: - `leave_balances.employee_id` → `employees.employee_id`; `attendance_records.employee_id` → `employees.employee_id`; `work_schedules.employee_id` → `employees.employee_id`
193: - `payroll_records.employee_id` → `employees.employee_id`; `payroll_records.payroll_period_id` → `payroll_periods.payroll_period_id`; `payroll_items.payroll_record_id` → `payroll_records.payroll_record_id`
194: - `employee_benefits.employee_id` → `employees.employee_id`
195: - `employee_learning.employee_id` → `employees.employee_id`; `course_id` → `learning_courses.course_id`
196: - `performance_reviews.employee_id` → `employees.employee_id`; `salary_grade_id` → `salary_grades.salary_grade_id`; `evaluator_user_id` → `system_users.system_user_id`
197: - `hr3_recommendations.employee_id` → `employees.employee_id`; `evaluator_user_id` → `system_users.system_user_id`; `suggested_position_id` → `positions.position_id`; `suggested_salary_grade_id` → `salary_grades.salary_grade_id`
198: - `role_permissions.role_id` → `system_roles.role_id`
199: - `system_users.employee_id` → `employees.employee_id`; `system_users.role_id` → `system_roles.role_id`
200: - `audit_logs.system_user_id` → `system_users.system_user_id`; `notifications.system_user_id` → `system_users.system_user_id`; `user_login_activity.system_user_id` → `system_users.system_user_id`
201: - `announcements.created_by_user_id` → `system_users.system_user_id`
202: - `system_settings.updated_by_user_id` → `system_users.system_user_id`
203: 
204: ## 9. Key workflow data flows
205: ### Recruitment to employee
206: `requisitions` → `job_posts` → `applicants` → (`interviews`, `applicant_assessments`) → `new_hires` → `employees` → `employee_onboarding_items`.
207: 
208: ### Core employee lifecycle
209: `departments` + `positions` + `salary_grades` → `employees`; later movement is appended to `employee_position_history`; terminal status creates `employee_exit_records`; the 201-file is represented through `employee_documents`.
210: 
211: ### ESS
212: `employees` → `ess_requests` (via `ess_categories`), `leave_balances`, `attendance_records`, `work_schedules`, `payroll_records`, `employee_benefits`, `employee_learning`, `performance_reviews`, `employee_documents`.
213: 
214: ### Access control
215: `system_roles` → `role_permissions` (role × module → level); `system_users` belongs to one role and optionally one employee; `audit_logs` records actions from system users.
216: 
217: ## 10. Integrity and validation rules
218: - `employees.employee_code`, `system_users.username`, `system_users.email`, `job_posts.slug`, `applicants.applicant_code`, requisition/job/interview/request/document codes must be unique; `employee_documents` codes are unique per employee.
219: - `employees.supervisor_employee_id` may reference the same table but must not equal `employees.employee_id`.
220: - `positions.department_id` and `employees.department_id/position_id` must be validated by the service layer so an employee’s position normally belongs to the employee’s department.
221: - `job_posts.position_id` and `requisitions.position_id` may be null for job/requisition records created before a formal position exists; `position_title` snapshots the display name.
222: - `payroll_records` must be unique per employee/pay period; line items must sum to the stored gross/net according to the payroll engine’s rules.
223: - `leave_balances` is unique per employee/leave type/year; `attendance_records` per employee/work date; `employee_learning` per employee/course; `role_permissions` per role/module; `job_post_platforms` per job post/platform; `employee_documents` per employee/code.
224: - `audit_logs` is append-only from the application perspective.
225: - Enum-like columns are guarded by CHECK constraints (43 total, identical in both SQL files). `role_permissions.module_name` is restricted to the ten frontend permission modules and `permission_level` to the six UI levels (`Full`, `View`, `Edit`, `Delete`, `Approve / Reject Only`, `None`); NULLable enum columns use `IS NULL OR col IN (...)` so they only validate when a value is provided.
226: - `positions.filled_count`, `job_posts.filled_count`, and `employees.onboarding_complete` are derived counters. They must be updated in the same transaction as the triggering event (applicant→new-hire conversion; last onboarding item completed); they must never be recomputed in a separate/asynchronous step.
227: - Employee document file bytes must never be embedded in ordinary row columns; use secure object/file storage.
228: - ESS request `category_id` is SET NULL when a category is removed; audit `system_user_id` is SET NULL when a user is removed (row remains).
229: 
230: ## 11. Migration / frontend integration requirements
231: - Replace `src/data/*.ts` seed arrays with API-backed repositories/hooks, keeping the same field names at the UI boundary where practical.
232: - Introduce DTO mappers where database naming is snake_case but React types use camelCase.
233: - Create seed data from the existing fixtures so the initial UI remains recognizable during migration. Seed `role_permissions` from the `users.ts` role matrix; seed `ess_categories` from `ess.ts` categories; seed onboarding templates/items from `hires.ts`; seed announcements with their audience values.
234: - Migrate nested promotion history and exit details into `employee_position_history` (with `change_type`) and `employee_exit_records` instead of serializing them on `employees`.
235: - Migrate job array fields to JSON columns so existing UI rendering can continue without extra joins.
236: - Generate onboarding item rows from the active template(s) when a new hire becomes an employee/probationary hire.
237: - Ensure the employee account creation flow links `system_users.employee_id` instead of identifying the employee only by name/email; keep `full_name`/`department_name` for non-employee accounts.
238: 
239: ## 12. Acceptance criteria for the database implementation
240: - The implementation contains exactly the 42 proposed tables.
241: - Every FK in the proposal (68) is enforced by the database.
242: - Every CHECK constraint in the SQL files (43) rejects out-of-domain enum values; the seed data derived from `frontend/src` satisfies all of them.
243: - All frontend data modules listed in Section 3 can be represented without lossy manual parsing, except the explicitly retained JSON arrays.
244: - Recruitment-to-hire conversion can be completed inside a transaction.
245: - Employee and payroll history remains queryable after status changes and separation.
246: - Role permissions can reproduce the current `Super Admin`, `Admin`, and `Employee` matrices from `role_permissions` alone.
247: - The audit log captures permission changes, approvals, account state changes, and major HR transactions, including actor role/department.
248: - Both supplied SQL files execute cleanly on their target database after setting the target schema/database name.
249: - The full-coverage image contains all 42 tables and all 443 columns; its table count exactly matches Section 7 and `hotel_hr_database_table_inventory.txt`.
250: - The relationship-summary image contains all 42 table names, shows all 68 FK connections, and uses only horizontal/vertical orthogonal connectors; no diagonal relationship lines are used.
251: 
252: ## 13. Deliverables generated with this PRD
253: - `hotel_hr_database_prd.md` — this complete database PRD/specification (rev 2.2, 42 tables).
254: - `hotel_hr_database_audit_report.md` — the 25-section audit report behind revision 2.0.
255: - `hotel_hr_schema_mysql.sql` — MySQL 8.0+ DDL (42 tables, 443 columns, 68 FKs, 29 uniques, 90 indexes, 43 CHECKs).
256: - `hotel_hr_schema_postgres.sql` — PostgreSQL 15+ DDL (identical model; explicit FK indexes).
257: - `hotel_hr_database_full_coverage.png` — exact high-level schema coverage image with all tables and all columns.
258: - `hotel_hr_database_relationship_summary.png` — simplified relationship summary using horizontal/vertical connectors.
259: - `hotel_hr_database_table_inventory.txt` — 42-table inventory.
260: 
261: ## 14. Implementation note
262: The uploaded frontend did not expose an existing persistent relational schema in the inspected `frontend/src` domain files. Therefore, this proposal uses the frontend types and workflows as the authoritative starting point, while avoiding duplicate tables for static or purely presentational structures. Existing server/database code outside that frontend scope should be checked before migration so an already-deployed table can be reused rather than duplicated.

(End of file - total 262 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Windows 10 Lite\\Downloads\\MUNJOR\\4TH YR\\DEV\\LATEST CLONE\\v14\\2nd-repo-for-hrms-backend-\\backend-laravel\\database"
}
```

**Output:**
```
<path>C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\database</path>
<type>directory</type>
<entries>
.gitignore
migrations/
seeders/

(3 entries)
</entries>
```

---

## Assistant (Build · Muse Spark 1.3 Free · 11.6s)

_Thinking:_



Found the 42-table blueprint — now checking what's actually live in code.

**Tool: bash**

**Input:**
```json
{
  "command": "Get-ChildItem -LiteralPath \"backend-laravel\\database\\migrations\" | Select-Object -ExpandProperty Name | Sort-Object; Write-Output \"---COUNT---\"; (Get-ChildItem -LiteralPath \"backend-laravel\\database\\migrations\").Count",
  "workdir": "C:\\Users\\Windows 10 Lite\\Downloads\\MUNJOR\\4TH YR\\DEV\\LATEST CLONE\\v14\\2nd-repo-for-hrms-backend-"
}
```

**Output:**
```
0001_01_01_000000_create_users_table.php
0001_01_01_000001_create_cache_table.php
0001_01_01_000003_create_departments_table.php
0001_01_01_000004_create_salary_grades_table.php
0001_01_01_000005_create_positions_table.php
0001_01_01_000006_create_employees_table.php
0001_01_01_000007_create_employee_emergency_contacts_table.php
0001_01_01_000008_create_employee_position_history_table.php
0001_01_01_000009_create_employee_exit_records_table.php
0001_01_01_000010_create_employee_documents_table.php
0001_01_01_000011_create_system_roles_table.php
0001_01_01_000012_create_role_permissions_table.php
0001_01_01_000013_create_system_users_table.php
0001_01_01_000014_create_notifications_table.php
0001_01_01_000015_create_user_login_activity_table.php
0001_01_01_000016_create_audit_logs_table.php
0001_01_01_000017_create_announcements_table.php
0001_01_01_000018_create_ess_categories_table.php
0001_01_01_000019_create_ess_requests_table.php
0001_01_01_000020_create_leave_balances_table.php
0001_01_01_000021_create_attendance_records_table.php
0001_01_01_000022_create_work_schedules_table.php
0001_01_01_000023_create_payroll_periods_table.php
0001_01_01_000024_create_payroll_records_table.php
0001_01_01_000025_create_payroll_items_table.php
0001_01_01_000026_create_employee_benefits_table.php
0001_01_01_000027_create_learning_courses_table.php
0001_01_01_000028_create_employee_learning_table.php
0001_01_01_000029_create_performance_reviews_table.php
0001_01_01_000030_create_hr3_recommendations_table.php
2026_08_15_171717_create_personal_access_tokens_table.php
2026_08_18_000001_add_url_to_audit_logs_table.php
2026_08_20_000001_create_chatbot_tables.php
2026_08_22_000001_create_social_recognitions_and_reactions_tables.php
2026_08_22_120000_add_super_admin_and_protected_flags_to_system_roles.php
2026_09_04_000002_create_promotion_requests_table.php
2026_09_04_100000_extend_chatbot_tables.php
2026_09_18_000001_add_hr3_loop_to_promotion_requests_table.php
2026_09_18_000001_add_hr3_loop_to_promotion_requests_table-DESKTOP-T31RHI0.php
2026_09_19_000001_add_mfa_to_system_users_table.php
2026_09_19_000002_add_lockout_to_system_users_table.php
---COUNT---
41

```

---

## Assistant (Build · Muse Spark 1.3 Free · 8.5s)

**Tool: bash**

**Input:**
```json
{
  "command": "Get-ChildItem -LiteralPath \"backend-laravel\\app\\Models\" | Select-Object -ExpandProperty Name | Sort-Object; Write-Output \"---MODULES---\"; Get-ChildItem -LiteralPath \"backend-laravel\\Modules\" | Select-Object -ExpandProperty Name | Sort-Object; Write-Output \"---SEEDERS---\"; Get-ChildItem -LiteralPath \"backend-laravel\\database\\seeders\" | Select-Object -ExpandProperty Name | Sort-Object",
  "workdir": "C:\\Users\\Windows 10 Lite\\Downloads\\MUNJOR\\4TH YR\\DEV\\LATEST CLONE\\v14\\2nd-repo-for-hrms-backend-"
}
```

**Output:**
```
Announcement.php
Applicant.php
Applicant-DESKTOP-FJ91I5O.php
AttendanceRecord.php
AuditLog.php
ChatbotFaq.php
ChatbotMessage.php
ChatbotUnanswered.php
Department.php
Employee.php
EmployeeBenefit.php
EmployeeDocument.php
EmployeeEmergencyContact.php
EmployeeExitRecord.php
EmployeePositionHistory.php
EssCategory.php
EssRequest.php
Hr3Recommendation.php
JobPost.php
JobPost-DESKTOP-FJ91I5O.php
LeaveBalance.php
Notification.php
Position.php
PromotionRequest.php
RolePermission.php
SalaryGrade.php
SystemRole.php
SystemSetting.php
SystemUser.php
SystemUser-DESKTOP-T31RHI0.php
User.php
UserLoginActivity.php
WorkSchedule.php
---MODULES---
ApplicantManagement
AuditLog
Auth
CoreHCM
EmployeeRecords
EmployeeSelfService
Landing
NewHireOnboarding
Profile
RecruitmentManagement
Settings
UserManagement
---SEEDERS---
data
DatabaseSeeder.php
HotelHrDatabaseSeeder.php
SystemUserPasswordSeeder.php

```

---

## Assistant (Build · Muse Spark 1.3 Free · 11.5s)

_Thinking:_



**Tool: bash**

**Input:**
```json
{
  "command": "$m = Get-ChildItem -LiteralPath \"backend-laravel\\database\\migrations\" -Filter \"*.php\" | Select-Object -ExpandProperty Name; Write-Output ($m -join \"`n\"); Write-Output \"===MODELS-EXTRA===\"; Select-String -Path \"backend-laravel\\app\\Models\\*.php\" -Pattern \"class\\s+\\w+|protected\\s+\\$table\" | Select-Object Filename,Line | Format-Table -AutoSize | Out-String -Width 200",
  "workdir": "C:\\Users\\Windows 10 Lite\\Downloads\\MUNJOR\\4TH YR\\DEV\\LATEST CLONE\\v14\\2nd-repo-for-hrms-backend-"
}
```

**Output:**
```
0001_01_01_000000_create_users_table.php
0001_01_01_000001_create_cache_table.php
0001_01_01_000003_create_departments_table.php
0001_01_01_000004_create_salary_grades_table.php
0001_01_01_000005_create_positions_table.php
0001_01_01_000006_create_employees_table.php
0001_01_01_000007_create_employee_emergency_contacts_table.php
0001_01_01_000008_create_employee_position_history_table.php
0001_01_01_000009_create_employee_exit_records_table.php
0001_01_01_000010_create_employee_documents_table.php
0001_01_01_000011_create_system_roles_table.php
0001_01_01_000012_create_role_permissions_table.php
0001_01_01_000013_create_system_users_table.php
0001_01_01_000014_create_notifications_table.php
0001_01_01_000015_create_user_login_activity_table.php
0001_01_01_000016_create_audit_logs_table.php
0001_01_01_000017_create_announcements_table.php
0001_01_01_000018_create_ess_categories_table.php
0001_01_01_000019_create_ess_requests_table.php
0001_01_01_000020_create_leave_balances_table.php
0001_01_01_000021_create_attendance_records_table.php
0001_01_01_000022_create_work_schedules_table.php
0001_01_01_000023_create_payroll_periods_table.php
0001_01_01_000024_create_payroll_records_table.php
0001_01_01_000025_create_payroll_items_table.php
0001_01_01_000026_create_employee_benefits_table.php
0001_01_01_000027_create_learning_courses_table.php
0001_01_01_000028_create_employee_learning_table.php
0001_01_01_000029_create_performance_reviews_table.php
0001_01_01_000030_create_hr3_recommendations_table.php
2026_08_15_171717_create_personal_access_tokens_table.php
2026_08_18_000001_add_url_to_audit_logs_table.php
2026_08_20_000001_create_chatbot_tables.php
2026_08_22_000001_create_social_recognitions_and_reactions_tables.php
2026_08_22_120000_add_super_admin_and_protected_flags_to_system_roles.php
2026_09_04_000002_create_promotion_requests_table.php
2026_09_04_100000_extend_chatbot_tables.php
2026_09_18_000001_add_hr3_loop_to_promotion_requests_table-DESKTOP-T31RHI0.php
2026_09_18_000001_add_hr3_loop_to_promotion_requests_table.php
2026_09_19_000001_add_mfa_to_system_users_table.php
2026_09_19_000002_add_lockout_to_system_users_table.php
===MODELS-EXTRA===
Select-String : The string class\s+\w+|protected\s+\ is not a valid regular expression: parsing 
"class\s+\w+|protected\s+\" - Illegal \ at end of pattern.
At line:1 char:190
+ ... -EXTRA==="; Select-String -Path "backend-laravel\app\Models\*.php" -P ...
+                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : InvalidArgument: (:) [Select-String], ArgumentException
    + FullyQualifiedErrorId : InvalidRegex,Microsoft.PowerShell.Commands.SelectStringCommand
 

```

---

## Assistant (Build · Muse Spark 1.3 Free · 11.3s)

**Tool: grep**

**Input:**
```json
{
  "include": "*.php",
  "path": "C:\\Users\\Windows 10 Lite\\Downloads\\MUNJOR\\4TH YR\\DEV\\LATEST CLONE\\v14\\2nd-repo-for-hrms-backend-\\backend-laravel\\app\\Models",
  "pattern": "\\$table\\s*="
}
```

**Output:**
```
Found 31 matches
C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\app\Models\WorkSchedule.php:
  Line 10:     protected $table = 'work_schedules';


C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\app\Models\UserLoginActivity.php:
  Line 10:     protected $table = 'user_login_activity';


C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\app\Models\EssCategory.php:
  Line 10:     protected $table = 'ess_categories';


C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\app\Models\EmployeePositionHistory.php:
  Line 10:     protected $table = 'employee_position_history';


C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\app\Models\SystemUser.php:
  Line 15:     protected $table = 'system_users';


C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\app\Models\Position.php:
  Line 11:     protected $table = 'positions';


C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\app\Models\SystemUser-DESKTOP-T31RHI0.php:
  Line 15:     protected $table = 'system_users';


C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\app\Models\Notification.php:
  Line 10:     protected $table = 'notifications';


C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\app\Models\SystemSetting.php:
  Line 9:     protected $table = 'system_settings';


C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\app\Models\LeaveBalance.php:
  Line 10:     protected $table = 'leave_balances';


C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\app\Models\SystemRole.php:
  Line 10:     protected $table = 'system_roles';


C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\app\Models\JobPost.php:
  Line 11:     protected $table = 'job_posts';


C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\app\Models\SalaryGrade.php:
  Line 10:     protected $table = 'salary_grades';


C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\app\Models\JobPost-DESKTOP-FJ91I5O.php:
  Line 11:     protected $table = 'job_posts';


C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\app\Models\RolePermission.php:
  Line 10:     protected $table = 'role_permissions';


C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\app\Models\PromotionRequest.php:
  Line 10:     protected $table = 'promotion_requests';


C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\app\Models\Hr3Recommendation.php:
  Line 10:     protected $table = 'hr3_recommendations';


C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\app\Models\EssRequest.php:
  Line 10:     protected $table = 'ess_requests';


C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\app\Models\ChatbotFaq.php:
  Line 9:     protected $table = 'chatbot_faqs';


C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\app\Models\AuditLog.php:
  Line 10:     protected $table = 'audit_logs';


C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\app\Models\Applicant.php:
  Line 10:     protected $table = 'applicants';


C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\app\Models\AttendanceRecord.php:
  Line 10:     protected $table = 'attendance_records';


C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\app\Models\Applicant-DESKTOP-FJ91I5O.php:
  Line 10:     protected $table = 'applicants';


C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\app\Models\Employee.php:
  Line 12:     protected $table = 'employees';


C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\app\Models\Department.php:
  Line 11:     protected $table = 'departments';


C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\app\Models\Announcement.php:
  Line 10:     protected $table = 'announcements';


C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\app\Models\ChatbotUnanswered.php:
  Line 9:     protected $table = 'chatbot_unanswered';


C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\app\Models\EmployeeDocument.php:
  Line 10:     protected $table = 'employee_documents';


C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\app\Models\EmployeeEmergencyContact.php:
  Line 10:     protected $table = 'employee_emergency_contacts';


C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\app\Models\EmployeeBenefit.php:
  Line 10:     protected $table = 'employee_benefits';


C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\app\Models\EmployeeExitRecord.php:
  Line 10:     protected $table = 'employee_exit_records';

```

**Tool: bash**

**Input:**
```json
{
  "command": "Get-ChildItem -LiteralPath \"backend-laravel\\Modules\" -Recurse -Filter \"*.php\" | Select-Object -ExpandProperty FullName | ForEach-Object { $_.Replace((Get-Location).Path + \"\\\", \"\") }",
  "workdir": "C:\\Users\\Windows 10 Lite\\Downloads\\MUNJOR\\4TH YR\\DEV\\LATEST CLONE\\v14\\2nd-repo-for-hrms-backend-"
}
```

**Output:**
```
backend-laravel\Modules\ApplicantManagement\app\Http\Controllers\ApplicantAssessmentController.php
backend-laravel\Modules\ApplicantManagement\app\Http\Controllers\ApplicantDocumentController.php
backend-laravel\Modules\ApplicantManagement\app\Http\Controllers\ApplicantManagementController-DESKTOP-FJ91I5O.php
backend-laravel\Modules\ApplicantManagement\app\Http\Controllers\ApplicantManagementController.php
backend-laravel\Modules\ApplicantManagement\app\Http\Controllers\AssessmentInviteController.php
backend-laravel\Modules\ApplicantManagement\app\Http\Controllers\AssessmentTestController.php
backend-laravel\Modules\ApplicantManagement\app\Http\Controllers\FacilityController.php
backend-laravel\Modules\ApplicantManagement\app\Http\Controllers\FinalEvaluationController.php
backend-laravel\Modules\ApplicantManagement\app\Http\Controllers\InterviewController.php
backend-laravel\Modules\ApplicantManagement\app\Http\Controllers\PracticalTestController.php
backend-laravel\Modules\ApplicantManagement\app\Http\Controllers\ScreeningEvaluationController.php
backend-laravel\Modules\ApplicantManagement\app\Http\Controllers\ScreeningReferenceController.php
backend-laravel\Modules\ApplicantManagement\app\Http\Controllers\ScreeningRequirementTemplateController.php
backend-laravel\Modules\ApplicantManagement\app\Http\Requests\StoreApplicantRequest.php
backend-laravel\Modules\ApplicantManagement\app\Http\Requests\StoreAssessmentRequest.php
backend-laravel\Modules\ApplicantManagement\app\Http\Requests\StoreInterviewRequest.php
backend-laravel\Modules\ApplicantManagement\app\Http\Requests\UpdateApplicantRequest.php
backend-laravel\Modules\ApplicantManagement\app\Http\Requests\UpdateInterviewRequest.php
backend-laravel\Modules\ApplicantManagement\app\Http\Resources\ApplicantDocumentResource.php
backend-laravel\Modules\ApplicantManagement\app\Http\Resources\ApplicantResource.php
backend-laravel\Modules\ApplicantManagement\app\Http\Resources\AssessmentResource.php
backend-laravel\Modules\ApplicantManagement\app\Http\Resources\AssessmentTestResource.php
backend-laravel\Modules\ApplicantManagement\app\Http\Resources\FacilityResource.php
backend-laravel\Modules\ApplicantManagement\app\Http\Resources\FinalEvaluationResource.php
backend-laravel\Modules\ApplicantManagement\app\Http\Resources\InterviewResource.php
backend-laravel\Modules\ApplicantManagement\app\Http\Resources\PracticalTestResource.php
backend-laravel\Modules\ApplicantManagement\app\Http\Resources\ScreeningEntityResource.php
backend-laravel\Modules\ApplicantManagement\app\Http\Resources\ScreeningScoreResource.php
backend-laravel\Modules\ApplicantManagement\app\Models\Applicant-DESKTOP-FJ91I5O.php
backend-laravel\Modules\ApplicantManagement\app\Models\Applicant.php
backend-laravel\Modules\ApplicantManagement\app\Models\ApplicantAssessment.php
backend-laravel\Modules\ApplicantManagement\app\Models\ApplicantDocument.php
backend-laravel\Modules\ApplicantManagement\app\Models\ApplicantScreening.php
backend-laravel\Modules\ApplicantManagement\app\Models\ApplicantScreeningEntity.php
backend-laravel\Modules\ApplicantManagement\app\Models\ApplicantScreeningScore.php
backend-laravel\Modules\ApplicantManagement\app\Models\AssessmentInvite.php
backend-laravel\Modules\ApplicantManagement\app\Models\AssessmentTest.php
backend-laravel\Modules\ApplicantManagement\app\Models\Facility.php
backend-laravel\Modules\ApplicantManagement\app\Models\FinalEvaluation.php
backend-laravel\Modules\ApplicantManagement\app\Models\Interview.php
backend-laravel\Modules\ApplicantManagement\app\Models\PracticalTest.php
backend-laravel\Modules\ApplicantManagement\app\Models\ScreeningGroundTruth.php
backend-laravel\Modules\ApplicantManagement\app\Models\ScreeningReferenceData.php
backend-laravel\Modules\ApplicantManagement\app\Models\ScreeningRequirementTemplate.php
backend-laravel\Modules\ApplicantManagement\app\Models\ScreeningRequirementTemplateItem.php
backend-laravel\Modules\ApplicantManagement\app\Providers\ApplicantManagementServiceProvider.php
backend-laravel\Modules\ApplicantManagement\app\Providers\EventServiceProvider.php
backend-laravel\Modules\ApplicantManagement\app\Providers\RouteServiceProvider.php
backend-laravel\Modules\ApplicantManagement\app\Services\DocumentVerificationService.php
backend-laravel\Modules\ApplicantManagement\app\Services\EvaluationService.php
backend-laravel\Modules\ApplicantManagement\app\Services\PracticalRequirement.php
backend-laravel\Modules\ApplicantManagement\app\Services\ScreeningService.php
backend-laravel\Modules\ApplicantManagement\config\config.php
backend-laravel\Modules\ApplicantManagement\database\migrations\2025_01_02_000001_create_applicants_table.php
backend-laravel\Modules\ApplicantManagement\database\migrations\2025_01_02_000002_create_applicant_screening_entities_table.php
backend-laravel\Modules\ApplicantManagement\database\migrations\2025_01_02_000003_create_applicant_screening_scores_table.php
backend-laravel\Modules\ApplicantManagement\database\migrations\2025_01_02_000004_create_interviews_table.php
backend-laravel\Modules\ApplicantManagement\database\migrations\2025_01_02_000005_create_applicant_assessments_table.php
backend-laravel\Modules\ApplicantManagement\database\migrations\2026_08_16_000004_add_accepted_to_applicants_stage_check.php
backend-laravel\Modules\ApplicantManagement\database\migrations\2026_08_23_000001_create_applicant_screenings_table.php
backend-laravel\Modules\ApplicantManagement\database\migrations\2026_08_23_000002_create_screening_ground_truths_table.php
backend-laravel\Modules\ApplicantManagement\database\migrations\2026_08_24_000001_create_screening_reference_data_table.php
backend-laravel\Modules\ApplicantManagement\database\migrations\2026_08_27_000001_add_resume_original_name_to_applicants_table.php
backend-laravel\Modules\ApplicantManagement\database\migrations\2026_09_04_000001_add_resume_hash_to_applicants_table.php
backend-laravel\Modules\ApplicantManagement\database\migrations\2026_09_05_000001_create_facilities_table.php
backend-laravel\Modules\ApplicantManagement\database\migrations\2026_09_05_000002_add_facility_to_interviews_table.php
backend-laravel\Modules\ApplicantManagement\database\migrations\2026_09_05_000003_extend_applicant_assessments_table.php
backend-laravel\Modules\ApplicantManagement\database\migrations\2026_09_05_000004_create_assessment_tests_table.php
backend-laravel\Modules\ApplicantManagement\database\migrations\2026_09_05_000005_create_practical_tests_table.php
backend-laravel\Modules\ApplicantManagement\database\migrations\2026_09_05_000006_create_final_evaluations_table.php
backend-laravel\Modules\ApplicantManagement\database\migrations\2026_09_05_000007_create_applicant_documents_table.php
backend-laravel\Modules\ApplicantManagement\database\migrations\2026_09_05_000008_extend_applicants_stage_check.php
backend-laravel\Modules\ApplicantManagement\database\migrations\2026_09_07_000001_add_verification_to_applicant_documents_table.php
backend-laravel\Modules\ApplicantManagement\database\migrations\2026_09_23_000001_add_document_verification_to_applicant_screenings_table.php
backend-laravel\Modules\ApplicantManagement\database\migrations\2026_09_26_000001_create_screening_requirement_templates_table.php
backend-laravel\Modules\ApplicantManagement\database\migrations\2026_10_03_000001_create_assessment_invites_table.php
backend-laravel\Modules\ApplicantManagement\database\seeders\ApplicantManagementDatabaseSeeder.php
backend-laravel\Modules\ApplicantManagement\database\seeders\ScreeningReferenceDataSeeder.php
backend-laravel\Modules\ApplicantManagement\database\seeders\ScreeningRequirementTemplateSeeder.php
backend-laravel\Modules\ApplicantManagement\resources\views\index.blade.php
backend-laravel\Modules\ApplicantManagement\resources\views\components\layouts\master.blade.php
backend-laravel\Modules\ApplicantManagement\routes\api.php
backend-laravel\Modules\ApplicantManagement\routes\web.php
backend-laravel\Modules\AuditLog\app\Http\Controllers\AuditLogController.php
backend-laravel\Modules\AuditLog\app\Http\Resources\AuditLogResource.php
backend-laravel\Modules\AuditLog\app\Providers\AuditLogServiceProvider.php
backend-laravel\Modules\AuditLog\app\Providers\EventServiceProvider.php
backend-laravel\Modules\AuditLog\app\Providers\RouteServiceProvider.php
backend-laravel\Modules\AuditLog\config\config.php
backend-laravel\Modules\AuditLog\database\seeders\AuditLogDatabaseSeeder.php
backend-laravel\Modules\AuditLog\resources\views\index.blade.php
backend-laravel\Modules\AuditLog\resources\views\components\layouts\master.blade.php
backend-laravel\Modules\AuditLog\routes\api.php
backend-laravel\Modules\AuditLog\routes\web.php
backend-laravel\Modules\Auth\app\Http\Controllers\AuthController-DESKTOP-T31RHI0.php
backend-laravel\Modules\Auth\app\Http\Controllers\AuthController.php
backend-laravel\Modules\Auth\app\Http\Controllers\MfaController.php
backend-laravel\Modules\Auth\app\Http\Controllers\PasswordResetController-DESKTOP-T31RHI0.php
backend-laravel\Modules\Auth\app\Http\Controllers\PasswordResetController.php
backend-laravel\Modules\Auth\app\Http\Controllers\Concerns\VerifiesCaptcha.php
backend-laravel\Modules\Auth\app\Http\Requests\ForgotPasswordRequest.php
backend-laravel\Modules\Auth\app\Http\Requests\LoginRequest.php
backend-laravel\Modules\Auth\app\Http\Requests\OtpVerifyRequest.php
backend-laravel\Modules\Auth\app\Http\Requests\ResetPasswordRequest.php
backend-laravel\Modules\Auth\app\Http\Resources\UserResource.php
backend-laravel\Modules\Auth\app\Mail\SendPasswordResetMail.php
backend-laravel\Modules\Auth\app\Providers\AuthServiceProvider.php
backend-laravel\Modules\Auth\app\Providers\EventServiceProvider.php
backend-laravel\Modules\Auth\app\Providers\RouteServiceProvider.php
backend-laravel\Modules\Auth\app\Services\PasswordResetService.php
backend-laravel\Modules\Auth\config\config.php
backend-laravel\Modules\Auth\routes\api-DESKTOP-T31RHI0.php
backend-laravel\Modules\Auth\routes\api.php
backend-laravel\Modules\Auth\routes\web.php
backend-laravel\Modules\CoreHCM\app\Http\Controllers\CoreHCMController.php
backend-laravel\Modules\CoreHCM\app\Http\Controllers\DashboardController.php
backend-laravel\Modules\CoreHCM\app\Http\Controllers\DepartmentController.php
backend-laravel\Modules\CoreHCM\app\Http\Controllers\EmployeeController.php
backend-laravel\Modules\CoreHCM\app\Http\Controllers\GlobalSearchController.php
backend-laravel\Modules\CoreHCM\app\Http\Controllers\HR3RecommendationController.php
backend-laravel\Modules\CoreHCM\app\Http\Controllers\OrgChartController.php
backend-laravel\Modules\CoreHCM\app\Http\Controllers\PositionController.php
backend-laravel\Modules\CoreHCM\app\Http\Controllers\PromotionRequestController.php
backend-laravel\Modules\CoreHCM\app\Http\Controllers\SalaryGradeController.php
backend-laravel\Modules\CoreHCM\app\Http\Controllers\Concerns\AppliesTableQuery.php
backend-laravel\Modules\CoreHCM\app\Http\Requests\EmployeeLifecycleRequest.php
backend-laravel\Modules\CoreHCM\app\Http\Requests\StoreDepartmentRequest.php
backend-laravel\Modules\CoreHCM\app\Http\Requests\StoreEmployeeRequest.php
backend-laravel\Modules\CoreHCM\app\Http\Requests\StorePositionRequest.php
backend-laravel\Modules\CoreHCM\app\Http\Requests\StoreSalaryGradeRequest.php
backend-laravel\Modules\CoreHCM\app\Http\Requests\UpdateDepartmentRequest.php
backend-laravel\Modules\CoreHCM\app\Http\Requests\UpdateEmployeeRequest.php
backend-laravel\Modules\CoreHCM\app\Http\Requests\UpdatePositionRequest.php
backend-laravel\Modules\CoreHCM\app\Http\Requests\UpdateSalaryGradeRequest.php
backend-laravel\Modules\CoreHCM\app\Http\Resources\DepartmentResource.php
backend-laravel\Modules\CoreHCM\app\Http\Resources\DocumentResource.php
backend-laravel\Modules\CoreHCM\app\Http\Resources\EmergencyContactResource.php
backend-laravel\Modules\CoreHCM\app\Http\Resources\EmployeeResource.php
backend-laravel\Modules\CoreHCM\app\Http\Resources\ExitRecordResource.php
backend-laravel\Modules\CoreHCM\app\Http\Resources\OrgChartResource.php
backend-laravel\Modules\CoreHCM\app\Http\Resources\PositionHistoryResource.php
backend-laravel\Modules\CoreHCM\app\Http\Resources\PositionResource.php
backend-laravel\Modules\CoreHCM\app\Http\Resources\SalaryGradeResource.php
backend-laravel\Modules\CoreHCM\app\Providers\CoreHCMServiceProvider.php
backend-laravel\Modules\CoreHCM\app\Providers\EventServiceProvider.php
backend-laravel\Modules\CoreHCM\app\Providers\RouteServiceProvider.php
backend-laravel\Modules\CoreHCM\config\config.php
backend-laravel\Modules\CoreHCM\database\seeders\CoreHCMDatabaseSeeder.php
backend-laravel\Modules\CoreHCM\resources\views\index.blade.php
backend-laravel\Modules\CoreHCM\resources\views\components\layouts\master.blade.php
backend-laravel\Modules\CoreHCM\routes\api-DESKTOP-FJ91I5O.php
backend-laravel\Modules\CoreHCM\routes\api.php
backend-laravel\Modules\CoreHCM\routes\web.php
backend-laravel\Modules\EmployeeRecords\app\Http\Controllers\EmployeeRecordsController.php
backend-laravel\Modules\EmployeeRecords\app\Providers\EmployeeRecordsServiceProvider.php
backend-laravel\Modules\EmployeeRecords\app\Providers\EventServiceProvider.php
backend-laravel\Modules\EmployeeRecords\app\Providers\RouteServiceProvider.php
backend-laravel\Modules\EmployeeRecords\config\config.php
backend-laravel\Modules\EmployeeRecords\database\seeders\EmployeeRecordsDatabaseSeeder.php
backend-laravel\Modules\EmployeeRecords\resources\views\index.blade.php
backend-laravel\Modules\EmployeeRecords\resources\views\components\layouts\master.blade.php
backend-laravel\Modules\EmployeeRecords\routes\api.php
backend-laravel\Modules\EmployeeRecords\routes\web.php
backend-laravel\Modules\EmployeeSelfService\app\Http\Controllers\EmployeeSelfServiceController.php
backend-laravel\Modules\EmployeeSelfService\app\Http\Controllers\EssAdminController.php
backend-laravel\Modules\EmployeeSelfService\app\Http\Controllers\EssPortalController-DESKTOP-FJ91I5O.php
backend-laravel\Modules\EmployeeSelfService\app\Http\Controllers\EssPortalController.php
backend-laravel\Modules\EmployeeSelfService\app\Models\RecognitionReaction.php
backend-laravel\Modules\EmployeeSelfService\app\Models\SocialRecognition.php
backend-laravel\Modules\EmployeeSelfService\app\Providers\EmployeeSelfServiceServiceProvider.php
backend-laravel\Modules\EmployeeSelfService\app\Providers\EventServiceProvider.php
backend-laravel\Modules\EmployeeSelfService\app\Providers\RouteServiceProvider.php
backend-laravel\Modules\EmployeeSelfService\config\config.php
backend-laravel\Modules\EmployeeSelfService\database\seeders\EmployeeSelfServiceDatabaseSeeder.php
backend-laravel\Modules\EmployeeSelfService\resources\views\index.blade.php
backend-laravel\Modules\EmployeeSelfService\resources\views\components\layouts\master.blade.php
backend-laravel\Modules\EmployeeSelfService\routes\api-DESKTOP-FJ91I5O.php
backend-laravel\Modules\EmployeeSelfService\routes\api.php
backend-laravel\Modules\EmployeeSelfService\routes\web.php
backend-laravel\Modules\Landing\app\Http\Controllers\AnnouncementController.php
backend-laravel\Modules\Landing\app\Http\Controllers\ChatbotController-DESKTOP-FJ91I5O.php
backend-laravel\Modules\Landing\app\Http\Controllers\ChatbotController.php
backend-laravel\Modules\Landing\app\Http\Controllers\ChatbotFaqController-DESKTOP-FJ91I5O.php
backend-laravel\Modules\Landing\app\Http\Controllers\ChatbotFaqController.php
backend-laravel\Modules\Landing\app\Http\Controllers\LandingController-DESKTOP-FJ91I5O.php
backend-laravel\Modules\Landing\app\Http\Controllers\LandingController.php
backend-laravel\Modules\Landing\app\Http\Requests\ChatMessageRequest-DESKTOP-FJ91I5O.php
backend-laravel\Modules\Landing\app\Http\Requests\ChatMessageRequest.php
backend-laravel\Modules\Landing\app\Http\Requests\JobApplicationRequest.php
backend-laravel\Modules\Landing\app\Http\Requests\StoreAnnouncementRequest.php
backend-laravel\Modules\Landing\app\Http\Requests\StoreChatbotFaqRequest.php
backend-laravel\Modules\Landing\app\Http\Requests\UpdateChatbotFaqRequest.php
backend-laravel\Modules\Landing\app\Http\Resources\AnnouncementResource.php
backend-laravel\Modules\Landing\app\Http\Resources\ChatbotFaqResource.php
backend-laravel\Modules\Landing\app\Http\Resources\JobPostResource.php
backend-laravel\Modules\Landing\app\Providers\EventServiceProvider.php
backend-laravel\Modules\Landing\app\Providers\LandingServiceProvider-DESKTOP-FJ91I5O.php
backend-laravel\Modules\Landing\app\Providers\LandingServiceProvider.php
backend-laravel\Modules\Landing\app\Providers\RouteServiceProvider.php
backend-laravel\Modules\Landing\config\config.php
backend-laravel\Modules\Landing\routes\api-DESKTOP-FJ91I5O.php
backend-laravel\Modules\Landing\routes\api.php
backend-laravel\Modules\Landing\routes\web.php
backend-laravel\Modules\NewHireOnboarding\app\Http\Controllers\ChecklistRequestController.php
backend-laravel\Modules\NewHireOnboarding\app\Http\Controllers\ChecklistTemplateController.php
backend-laravel\Modules\NewHireOnboarding\app\Http\Controllers\EmployeeOnboardingItemController.php
backend-laravel\Modules\NewHireOnboarding\app\Http\Controllers\NewHireController.php
backend-laravel\Modules\NewHireOnboarding\app\Http\Controllers\NewHireOnboardingController.php
backend-laravel\Modules\NewHireOnboarding\app\Http\Requests\StoreChecklistRequestRequest.php
backend-laravel\Modules\NewHireOnboarding\app\Http\Requests\StoreChecklistTemplateRequest.php
backend-laravel\Modules\NewHireOnboarding\app\Http\Requests\StoreNewHireRequest.php
backend-laravel\Modules\NewHireOnboarding\app\Http\Requests\UpdateNewHireRequest.php
backend-laravel\Modules\NewHireOnboarding\app\Http\Resources\ChecklistRequestResource.php
backend-laravel\Modules\NewHireOnboarding\app\Http\Resources\ChecklistTemplateResource.php
backend-laravel\Modules\NewHireOnboarding\app\Http\Resources\NewHireResource.php
backend-laravel\Modules\NewHireOnboarding\app\Models\ChecklistRequest.php
backend-laravel\Modules\NewHireOnboarding\app\Models\EmployeeOnboardingItem.php
backend-laravel\Modules\NewHireOnboarding\app\Models\NewHire.php
backend-laravel\Modules\NewHireOnboarding\app\Models\OnboardingChecklistItem.php
backend-laravel\Modules\NewHireOnboarding\app\Models\OnboardingChecklistTemplate.php
backend-laravel\Modules\NewHireOnboarding\app\Providers\EventServiceProvider.php
backend-laravel\Modules\NewHireOnboarding\app\Providers\NewHireOnboardingServiceProvider.php
backend-laravel\Modules\NewHireOnboarding\app\Providers\RouteServiceProvider.php
backend-laravel\Modules\NewHireOnboarding\config\config.php
backend-laravel\Modules\NewHireOnboarding\database\migrations\2025_01_03_000001_create_new_hires_table.php
backend-laravel\Modules\NewHireOnboarding\database\migrations\2025_01_03_000002_create_onboarding_checklist_templates_table.php
backend-laravel\Modules\NewHireOnboarding\database\migrations\2025_01_03_000003_create_onboarding_checklist_items_table.php
backend-laravel\Modules\NewHireOnboarding\database\migrations\2025_01_03_000004_create_employee_onboarding_items_table.php
backend-laravel\Modules\NewHireOnboarding\database\migrations\2025_01_03_000005_create_checklist_requests_table.php
backend-laravel\Modules\NewHireOnboarding\database\migrations\2026_08_16_000002_make_employee_id_nullable_on_onboarding_items.php
backend-laravel\Modules\NewHireOnboarding\database\migrations\2026_08_18_000001_set_template_item_fk_set_null.php
backend-laravel\Modules\NewHireOnboarding\database\migrations\2026_08_19_000001_dedupe_employee_onboarding_items.php
backend-laravel\Modules\NewHireOnboarding\database\migrations\2026_08_19_000002_dedupe_legacy_onboarding_item_duplicates.php
backend-laravel\Modules\NewHireOnboarding\database\migrations\2026_08_22_000001_add_upload_and_instructions_to_onboarding_items.php
backend-laravel\Modules\NewHireOnboarding\database\migrations\2026_08_25_000002_add_submitted_at_to_employee_onboarding_items.php
backend-laravel\Modules\NewHireOnboarding\database\migrations\2026_08_31_000001_add_evaluation_requested_at_to_new_hires_table.php
backend-laravel\Modules\NewHireOnboarding\database\seeders\NewHireOnboardingDatabaseSeeder.php
backend-laravel\Modules\NewHireOnboarding\resources\views\index.blade.php
backend-laravel\Modules\NewHireOnboarding\resources\views\components\layouts\master.blade.php
backend-laravel\Modules\NewHireOnboarding\routes\api.php
backend-laravel\Modules\NewHireOnboarding\routes\web.php
backend-laravel\Modules\Profile\app\Http\Controllers\ProfileController.php
backend-laravel\Modules\Profile\app\Providers\EventServiceProvider.php
backend-laravel\Modules\Profile\app\Providers\ProfileServiceProvider.php
backend-laravel\Modules\Profile\app\Providers\RouteServiceProvider.php
backend-laravel\Modules\Profile\config\config.php
backend-laravel\Modules\Profile\database\seeders\ProfileDatabaseSeeder.php
backend-laravel\Modules\Profile\resources\views\index.blade.php
backend-laravel\Modules\Profile\resources\views\components\layouts\master.blade.php
backend-laravel\Modules\Profile\routes\api.php
backend-laravel\Modules\Profile\routes\web.php
backend-laravel\Modules\RecruitmentManagement\app\Enums\WorkSchedule.php
backend-laravel\Modules\RecruitmentManagement\app\Http\Controllers\RecruitmentManagementController-DESKTOP-FJ91I5O.php
backend-laravel\Modules\RecruitmentManagement\app\Http\Controllers\RecruitmentManagementController.php
backend-laravel\Modules\RecruitmentManagement\app\Http\Controllers\RequisitionController-DESKTOP-FJ91I5O.php
backend-laravel\Modules\RecruitmentManagement\app\Http\Controllers\RequisitionController.php
backend-laravel\Modules\RecruitmentManagement\app\Http\Requests\StoreJobPostRequest.php
backend-laravel\Modules\RecruitmentManagement\app\Http\Requests\StoreRequisitionRequest.php
backend-laravel\Modules\RecruitmentManagement\app\Http\Requests\UpdateJobPostRequest.php
backend-laravel\Modules\RecruitmentManagement\app\Http\Requests\UpdateRequisitionRequest.php
backend-laravel\Modules\RecruitmentManagement\app\Http\Resources\JobPostResource.php
backend-laravel\Modules\RecruitmentManagement\app\Http\Resources\RequisitionResource.php
backend-laravel\Modules\RecruitmentManagement\app\Models\JobPost-DESKTOP-FJ91I5O.php
backend-laravel\Modules\RecruitmentManagement\app\Models\JobPost.php
backend-laravel\Modules\RecruitmentManagement\app\Models\JobPostPlatform.php
backend-laravel\Modules\RecruitmentManagement\app\Models\Requisition.php
backend-laravel\Modules\RecruitmentManagement\app\Providers\EventServiceProvider.php
backend-laravel\Modules\RecruitmentManagement\app\Providers\RecruitmentManagementServiceProvider.php
backend-laravel\Modules\RecruitmentManagement\app\Providers\RouteServiceProvider.php
backend-laravel\Modules\RecruitmentManagement\config\config.php
backend-laravel\Modules\RecruitmentManagement\database\migrations\2025_01_01_000001_create_job_posts_table.php
backend-laravel\Modules\RecruitmentManagement\database\migrations\2025_01_01_000002_create_job_post_platforms_table.php
backend-laravel\Modules\RecruitmentManagement\database\migrations\2025_01_01_000003_create_requisitions_table.php
backend-laravel\Modules\RecruitmentManagement\database\migrations\2025_01_01_000004_make_job_posts_position_required.php
backend-laravel\Modules\RecruitmentManagement\database\migrations\2026_08_16_000001_add_picture_to_job_posts_table.php
backend-laravel\Modules\RecruitmentManagement\database\migrations\2026_08_29_000001_remove_benefits_from_job_posts_table.php
backend-laravel\Modules\RecruitmentManagement\database\migrations\2026_09_05_000001_add_requires_practical_to_job_posts_table.php
backend-laravel\Modules\RecruitmentManagement\database\seeders\RecruitmentManagementDatabaseSeeder.php
backend-laravel\Modules\RecruitmentManagement\resources\views\index.blade.php
backend-laravel\Modules\RecruitmentManagement\resources\views\components\layouts\master.blade.php
backend-laravel\Modules\RecruitmentManagement\routes\api-DESKTOP-FJ91I5O.php
backend-laravel\Modules\RecruitmentManagement\routes\api.php
backend-laravel\Modules\RecruitmentManagement\routes\web.php
backend-laravel\Modules\Settings\app\Console\RunSettingsAutoBackup.php
backend-laravel\Modules\Settings\app\Http\Controllers\BackupController.php
backend-laravel\Modules\Settings\app\Http\Controllers\MySettingsController.php
backend-laravel\Modules\Settings\app\Http\Controllers\NotificationController.php
backend-laravel\Modules\Settings\app\Http\Controllers\SettingsController.php
backend-laravel\Modules\Settings\app\Http\Requests\BulkUpsertSettingRequest.php
backend-laravel\Modules\Settings\app\Http\Requests\UpsertSettingRequest.php
backend-laravel\Modules\Settings\app\Http\Resources\SystemSettingResource.php
backend-laravel\Modules\Settings\app\Models\SystemSetting.php
backend-laravel\Modules\Settings\app\Models\SystemUser.php
backend-laravel\Modules\Settings\app\Providers\EventServiceProvider.php
backend-laravel\Modules\Settings\app\Providers\RouteServiceProvider.php
backend-laravel\Modules\Settings\app\Providers\SettingsServiceProvider.php
backend-laravel\Modules\Settings\app\Services\BackupService.php
backend-laravel\Modules\Settings\config\config.php
backend-laravel\Modules\Settings\database\migrations\2025_01_04_000001_create_system_settings_table.php
backend-laravel\Modules\Settings\database\migrations\2026_08_25_000001_add_otp_enabled_to_system_users_table.php
backend-laravel\Modules\Settings\database\seeders\SettingsDatabaseSeeder.php
backend-laravel\Modules\Settings\resources\views\index.blade.php
backend-laravel\Modules\Settings\resources\views\components\layouts\master.blade.php
backend-laravel\Modules\Settings\routes\api.php
backend-laravel\Modules\Settings\routes\web.php
backend-laravel\Modules\UserManagement\app\Http\Controllers\RoleController.php
backend-laravel\Modules\UserManagement\app\Http\Controllers\UserController.php
backend-laravel\Modules\UserManagement\app\Http\Controllers\UserManagementController.php
backend-laravel\Modules\UserManagement\app\Http\Requests\StoreRoleRequest.php
backend-laravel\Modules\UserManagement\app\Http\Requests\StoreUserRequest.php
backend-laravel\Modules\UserManagement\app\Http\Requests\UpdateRolePermissionsRequest.php
backend-laravel\Modules\UserManagement\app\Http\Requests\UpdateRoleRequest.php
backend-laravel\Modules\UserManagement\app\Http\Requests\UpdateUserRequest.php
backend-laravel\Modules\UserManagement\app\Http\Resources\LoginActivityResource.php
backend-laravel\Modules\UserManagement\app\Http\Resources\RoleResource.php
backend-laravel\Modules\UserManagement\app\Http\Resources\UserManagementResource.php
backend-laravel\Modules\UserManagement\app\Providers\EventServiceProvider.php
backend-laravel\Modules\UserManagement\app\Providers\RouteServiceProvider.php
backend-laravel\Modules\UserManagement\app\Providers\UserManagementServiceProvider.php
backend-laravel\Modules\UserManagement\config\config.php
backend-laravel\Modules\UserManagement\database\seeders\UserManagementDatabaseSeeder.php
backend-laravel\Modules\UserManagement\resources\views\index.blade.php
backend-laravel\Modules\UserManagement\resources\views\components\layouts\master.blade.php
backend-laravel\Modules\UserManagement\routes\api.php
backend-laravel\Modules\UserManagement\routes\web.php

```

---

## Assistant (Build · Muse Spark 1.3 Free · 9.3s)

_Thinking:_



**Tool: bash**

**Input:**
```json
{
  "command": "python3 -c \"\nimport re, glob, os\nfiles = ['hotel_hr.sql', 'hotel_hr (10).sql']\nfor f in files:\n    p = os.path.join(os.getcwd(), f)\n    if not os.path.exists(p):\n        print(f+' NOT FOUND'); continue\n    txt = open(p, encoding='utf-8', errors='ignore').read()\n    tables = sorted(set(re.findall(r'CREATE TABLE[^`]*`(\\w+)`', txt, re.I)))\n    print(f, len(tables))\n    print(', '.join(tables))\n    print('---')\n\"",
  "workdir": "C:\\Users\\Windows 10 Lite\\Downloads\\MUNJOR\\4TH YR\\DEV\\LATEST CLONE\\v14\\2nd-repo-for-hrms-backend-"
}
```

**Output:**
```
Traceback (most recent call last):
  File "<string>", line 9, in <module>
  File "C:\msys64\ucrt64\lib\python3.10\re.py", line 240, in findall
    return _compile(pattern, flags).findall(string)
  File "C:\msys64\ucrt64\lib\python3.10\re.py", line 303, in _compile
    p = sre_compile.compile(pattern, flags)
  File "C:\msys64\ucrt64\lib\python3.10\sre_compile.py", line 788, in compile
    p = sre_parse.parse(p, flags)
  File "C:\msys64\ucrt64\lib\python3.10\sre_parse.py", line 955, in parse
    p = _parse_sub(source, state, flags & SRE_FLAG_VERBOSE, 0)
  File "C:\msys64\ucrt64\lib\python3.10\sre_parse.py", line 444, in _parse_sub
    itemsappend(_parse(source, state, verbose, nested + 1,
  File "C:\msys64\ucrt64\lib\python3.10\sre_parse.py", line 550, in _parse
    raise source.error("unterminated character set",
re.error: unterminated character set at position 12

```

---

## Assistant (Build · Muse Spark 1.3 Free · 12.3s)

**Tool: bash**

**Input:**
```json
{
  "command": "python3 -c \"import re, os; files=['hotel_hr.sql', 'hotel_hr (10).sql']; [print(f) or print(len(set(re.findall(r'CREATE TABLE', open(os.path.join(os.getcwd(), f), encoding='utf-8', errors='ignore').read(), re.IGNORECASE)))) or print(sorted(set(re.findall('CREATE TABLE.{0,10}?`(\\w+)`', open(os.path.join(os.getcwd(), f), encoding='utf-8', errors='ignore').read())))) for f in files if os.path.exists(os.path.join(os.getcwd(), f))]\"",
  "workdir": "C:\\Users\\Windows 10 Lite\\Downloads\\MUNJOR\\4TH YR\\DEV\\LATEST CLONE\\v14\\2nd-repo-for-hrms-backend-"
}
```

**Output:**
```
hotel_hr.sql
1
['IF']
hotel_hr (10).sql
1
['IF']

```

---

## Assistant (Build · Muse Spark 1.3 Free · 7.9s)

_Thinking:_



The database dumps aren't parsing as expected — trying a different approach.

**Tool: bash**

**Input:**
```json
{
  "command": "Get-Content -LiteralPath \"hotel_hr.sql\" -TotalCount 60; Write-Output \"=====SIZE=====\"; (Get-Item -LiteralPath \"hotel_hr.sql\").Length; (Get-Item -LiteralPath \"hotel_hr (10).sql\").Length",
  "workdir": "C:\\Users\\Windows 10 Lite\\Downloads\\MUNJOR\\4TH YR\\DEV\\LATEST CLONE\\v14\\2nd-repo-for-hrms-backend-"
}
```

**Output:**
```
-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 28, 2026 at 04:13 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `hotel_hr`
--
CREATE DATABASE IF NOT EXISTS `hotel_hr` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `hotel_hr`;

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE IF NOT EXISTS `announcements` (
  `announcement_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `published_date` date NOT NULL,
  `title` varchar(200) NOT NULL,
  `body` text NOT NULL,
  `audience` varchar(20) NOT NULL DEFAULT 'All',
  `created_by_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'published',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`announcement_id`),
  KEY `idx_announcements_created_by_user_id` (`created_by_user_id`),
  KEY `idx_announcements_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`announcement_id`, `published_date`, `title`, `body`, `audience`, `created_by_user_id`, `status`, `created_at`, `updated_at`) VALUES
(1, '2026-05-24', 'Job Fair: Hotel & Restaurant Careers Day', 'Walk-in interviews for Front Office, F&B, and Kitchen roles at the Grand Ballroom.', 'All', 1, 'published', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(2, '2026-05-18', 'TESDA Certification Sponsorship', 'Oxford Suites now sponsors NC II certification for qualified regular employees.', 'All', 1, 'published', '2026-08-17 17:41:34', '2026-08-17 17:41:34'),
(3, '2026-05-02', 'Service Excellence Awards 2026', 'Congratulations to Front Office for the highest guest satisfaction score this quarter.', 'All', 1, 'published', '2026-08-17 17:41:34', '2026-08-17 17:41:34');

-- --------------------------------------------------------

--
-- Table structure for table `applicants`
--
=====SIZE=====
2015237
2467007

```

---

## Assistant (Build · Muse Spark 1.3 Free · 7.4s)

**Tool: bash**

**Input:**
```json
{
  "command": "Select-String -LiteralPath \"hotel_hr.sql\" -Pattern \"Table structure for table\" | Select-Object -ExpandProperty Line",
  "workdir": "C:\\Users\\Windows 10 Lite\\Downloads\\MUNJOR\\4TH YR\\DEV\\LATEST CLONE\\v14\\2nd-repo-for-hrms-backend-"
}
```

**Output:**
```
-- Table structure for table `announcements`
-- Table structure for table `applicants`
-- Table structure for table `applicant_assessments`
-- Table structure for table `applicant_documents`
-- Table structure for table `applicant_screenings`
-- Table structure for table `applicant_screening_entities`
-- Table structure for table `applicant_screening_scores`
-- Table structure for table `assessment_tests`
-- Table structure for table `attendance_records`
-- Table structure for table `audit_logs`
-- Table structure for table `cache`
-- Table structure for table `cache_locks`
-- Table structure for table `chatbot_faqs`
-- Table structure for table `chatbot_messages`
-- Table structure for table `chatbot_unanswered`
-- Table structure for table `checklist_requests`
-- Table structure for table `departments`
-- Table structure for table `employees`
-- Table structure for table `employee_benefits`
-- Table structure for table `employee_documents`
-- Table structure for table `employee_emergency_contacts`
-- Table structure for table `employee_exit_records`
-- Table structure for table `employee_learning`
-- Table structure for table `employee_onboarding_items`
-- Table structure for table `employee_position_history`
-- Table structure for table `ess_categories`
-- Table structure for table `ess_requests`
-- Table structure for table `facilities`
-- Table structure for table `final_evaluations`
-- Table structure for table `hr3_recommendations`
-- Table structure for table `interviews`
-- Table structure for table `job_posts`
-- Table structure for table `job_post_platforms`
-- Table structure for table `learning_courses`
-- Table structure for table `leave_balances`
-- Table structure for table `migrations`
-- Table structure for table `new_hires`
-- Table structure for table `notifications`
-- Table structure for table `onboarding_checklist_items`
-- Table structure for table `onboarding_checklist_templates`
-- Table structure for table `password_reset_tokens`
-- Table structure for table `payroll_items`
-- Table structure for table `payroll_periods`
-- Table structure for table `payroll_records`
-- Table structure for table `performance_reviews`
-- Table structure for table `personal_access_tokens`
-- Table structure for table `positions`
-- Table structure for table `practical_tests`
-- Table structure for table `promotion_requests`
-- Table structure for table `recognition_reactions`
-- Table structure for table `requisitions`
-- Table structure for table `role_permissions`
-- Table structure for table `salary_grades`
-- Table structure for table `screening_ground_truths`
-- Table structure for table `screening_reference_data`
-- Table structure for table `screening_requirement_templates`
-- Table structure for table `screening_requirement_template_items`
-- Table structure for table `sessions`
-- Table structure for table `social_recognitions`
-- Table structure for table `system_roles`
-- Table structure for table `system_settings`
-- Table structure for table `system_users`
-- Table structure for table `user_login_activity`
-- Table structure for table `work_schedules`

```

---

## Assistant (Build · Muse Spark 1.3 Free · 9.0s)

_Thinking:_



**Tool: bash**

**Input:**
```json
{
  "command": "python3 backend-laravel/audit_db.php 2>&1 | head -n 200",
  "workdir": "C:\\Users\\Windows 10 Lite\\Downloads\\MUNJOR\\4TH YR\\DEV\\LATEST CLONE\\v14\\2nd-repo-for-hrms-backend-"
}
```

**Output:**
```
head : The term 'head' is not recognized as the name of a cmdlet, function, script file, or operable program. Check 
the spelling of the name, or if a path was included, verify that the path is correct and try again.
At line:1 char:45
+ python3 backend-laravel/audit_db.php 2>&1 | head -n 200
+                                             ~~~~
    + CategoryInfo          : ObjectNotFound: (head:String) [], CommandNotFoundException
    + FullyQualifiedErrorId : CommandNotFoundException
 

```

---

## Assistant (Build · Muse Spark 1.3 Free · 5.7s)

**Tool: bash**

**Input:**
```json
{
  "command": "Select-String -LiteralPath \"hotel_hr.sql\" -Pattern \"Dumping data for table\" | Select-Object -ExpandProperty Line",
  "workdir": "C:\\Users\\Windows 10 Lite\\Downloads\\MUNJOR\\4TH YR\\DEV\\LATEST CLONE\\v14\\2nd-repo-for-hrms-backend-"
}
```

**Output:**
```
-- Dumping data for table `announcements`
-- Dumping data for table `applicants`
-- Dumping data for table `applicant_assessments`
-- Dumping data for table `applicant_documents`
-- Dumping data for table `applicant_screenings`
-- Dumping data for table `applicant_screening_entities`
-- Dumping data for table `applicant_screening_scores`
-- Dumping data for table `assessment_tests`
-- Dumping data for table `attendance_records`
-- Dumping data for table `audit_logs`
-- Dumping data for table `cache`
-- Dumping data for table `chatbot_faqs`
-- Dumping data for table `chatbot_unanswered`
-- Dumping data for table `checklist_requests`
-- Dumping data for table `departments`
-- Dumping data for table `employees`
-- Dumping data for table `employee_benefits`
-- Dumping data for table `employee_documents`
-- Dumping data for table `employee_emergency_contacts`
-- Dumping data for table `employee_exit_records`
-- Dumping data for table `employee_learning`
-- Dumping data for table `employee_onboarding_items`
-- Dumping data for table `employee_position_history`
-- Dumping data for table `ess_categories`
-- Dumping data for table `ess_requests`
-- Dumping data for table `facilities`
-- Dumping data for table `final_evaluations`
-- Dumping data for table `hr3_recommendations`
-- Dumping data for table `interviews`
-- Dumping data for table `job_posts`
-- Dumping data for table `job_post_platforms`
-- Dumping data for table `learning_courses`
-- Dumping data for table `leave_balances`
-- Dumping data for table `migrations`
-- Dumping data for table `new_hires`
-- Dumping data for table `notifications`
-- Dumping data for table `onboarding_checklist_items`
-- Dumping data for table `onboarding_checklist_templates`
-- Dumping data for table `payroll_items`
-- Dumping data for table `payroll_periods`
-- Dumping data for table `payroll_records`
-- Dumping data for table `performance_reviews`
-- Dumping data for table `personal_access_tokens`
-- Dumping data for table `positions`
-- Dumping data for table `practical_tests`
-- Dumping data for table `requisitions`
-- Dumping data for table `role_permissions`
-- Dumping data for table `salary_grades`
-- Dumping data for table `screening_ground_truths`
-- Dumping data for table `screening_reference_data`
-- Dumping data for table `screening_requirement_templates`
-- Dumping data for table `screening_requirement_template_items`
-- Dumping data for table `sessions`
-- Dumping data for table `social_recognitions`
-- Dumping data for table `system_roles`
-- Dumping data for table `system_settings`
-- Dumping data for table `system_users`
-- Dumping data for table `user_login_activity`
-- Dumping data for table `work_schedules`

```

---

## Assistant (Build · Muse Spark 1.3 Free · 8.2s)

_Thinking:_



**Tool: bash**

**Input:**
```json
{
  "command": "python -c \"import re; txt=open('hotel_hr.sql',encoding='utf-8',errors='ignore').read(); import collections; parts=re.split(r'-- Dumping data for table \\`([^\\`]+)\\`', txt); d={}; print('chunks',len(parts)); f=open('C:\\\\Users\\\\WINDOW~1\\\\AppData\\\\Local\\\\Temp\\\\opencode\\\\counts.txt','w',encoding='utf-8'); idx=1; cur=None; counts={}; lines=txt.splitlines(); cur=None; import re2; \" 2>&1 | Select-Object -First 20",
  "workdir": "C:\\Users\\Windows 10 Lite\\Downloads\\MUNJOR\\4TH YR\\DEV\\LATEST CLONE\\v14\\2nd-repo-for-hrms-backend-"
}
```

**Output:**
```
python :   File "<string>", line 1
At line:1 char:1
+ python -c "import re; txt=open('hotel_hr.sql',encoding='utf-8',errors ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (  File "<string>", line 1:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
    import re; txt=open('hotel_hr.sql',encoding='utf-8',errors='ignore').read(); import collections; 
parts=re.split(r'-- Dumping data for table \([^\]+)\', txt); d={}; print('chunks',len(parts)); 
f=open('C:\\Users\\WINDOW~1\\AppData\\Local\\Temp\\opencode\\counts.txt','w',encoding='utf-8'); idx=1; cur=None; 
counts={}; lines=txt.splitlines(); cur=None; import re2; 
                                                                                                                    
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
SyntaxError: invalid syntax. Perhaps you forgot a comma?

```

---

## Assistant (Build · Muse Spark 1.3 Free · 16.6s)

_Thinking:_



I've mapped the live tables — now measuring which ones hold real data.

**Tool: write**

**Input:**
```json
{
  "content": "import re\ntxt = open('hotel_hr.sql', encoding='utf-8', errors='ignore').read()\n# split by dumping sections\nmarkers = list(re.finditer(r\"-- Dumping data for table `([^`]+)`\", txt))\nprint(f\"sections: {len(markers)}\")\nfor i, m in enumerate(markers):\n    tbl = m.group(1)\n    start = m.end()\n    end = markers[i+1].start() if i+1 < len(markers) else len(txt)\n    chunk = txt[start:end]\n    inserts = re.findall(r\"INSERT INTO\", chunk)\n    # count value rows approx: count '),' occurrences in insert lines\n    rows = 0\n    for line in chunk.splitlines():\n        if line.startswith(\"INSERT\"):\n            # count tuples: number of '),' + 1 if has VALUES\n            rows += line.count(\"),\")\n            if \"VALUES\" in line and rows == 0:\n                rows += 1\n    print(f\"{tbl}: inserts={len(inserts)} approx_rows~{rows} chars={len(chunk)}\")\n",
  "filePath": "C:\\Users\\WINDOW~1\\AppData\\Local\\Temp\\opencode\\count_rows.py"
}
```

**Output:**
```
Wrote file successfully.
```

---

## Assistant (Build · Muse Spark 1.3 Free · 11.6s)

**Tool: bash**

**Input:**
```json
{
  "command": "python C:\\Users\\WINDOW~1\\AppData\\Local\\Temp\\opencode\\count_rows.py",
  "workdir": "C:\\Users\\Windows 10 Lite\\Downloads\\MUNJOR\\4TH YR\\DEV\\LATEST CLONE\\v14\\2nd-repo-for-hrms-backend-"
}
```

**Output:**
```
sections: 59
announcements: inserts=1 approx_rows~1 chars=2121
applicants: inserts=1 approx_rows~1 chars=37374
applicant_assessments: inserts=1 approx_rows~1 chars=9026
applicant_documents: inserts=2 approx_rows~1 chars=81899
applicant_screenings: inserts=6 approx_rows~1 chars=275015
applicant_screening_entities: inserts=2 approx_rows~1 chars=70102
applicant_screening_scores: inserts=1 approx_rows~1 chars=11400
assessment_tests: inserts=1 approx_rows~1 chars=21237
attendance_records: inserts=1 approx_rows~1 chars=2553
audit_logs: inserts=8 approx_rows~1 chars=400067
cache: inserts=1 approx_rows~1 chars=35647
chatbot_faqs: inserts=1 approx_rows~1 chars=3577
chatbot_unanswered: inserts=1 approx_rows~1 chars=1446
checklist_requests: inserts=1 approx_rows~1 chars=1587
departments: inserts=1 approx_rows~1 chars=3445
employees: inserts=1 approx_rows~1 chars=8709
employee_benefits: inserts=1 approx_rows~1 chars=2951
employee_documents: inserts=1 approx_rows~1 chars=3477
employee_emergency_contacts: inserts=1 approx_rows~1 chars=2207
employee_exit_records: inserts=1 approx_rows~1 chars=1199
employee_learning: inserts=1 approx_rows~1 chars=1923
employee_onboarding_items: inserts=1 approx_rows~1 chars=27401
employee_position_history: inserts=1 approx_rows~1 chars=3841
ess_categories: inserts=1 approx_rows~1 chars=2744
ess_requests: inserts=1 approx_rows~1 chars=2746
facilities: inserts=1 approx_rows~1 chars=2245
final_evaluations: inserts=1 approx_rows~1 chars=3062
hr3_recommendations: inserts=1 approx_rows~1 chars=2139
interviews: inserts=1 approx_rows~1 chars=6449
job_posts: inserts=1 approx_rows~1 chars=22952
job_post_platforms: inserts=1 approx_rows~1 chars=3896
learning_courses: inserts=1 approx_rows~1 chars=1525
leave_balances: inserts=1 approx_rows~1 chars=1528
migrations: inserts=1 approx_rows~1 chars=6405
new_hires: inserts=1 approx_rows~1 chars=6052
notifications: inserts=16 approx_rows~1 chars=757158
onboarding_checklist_items: inserts=1 approx_rows~1 chars=2131
onboarding_checklist_templates: inserts=1 approx_rows~1 chars=1415
payroll_items: inserts=1 approx_rows~1 chars=5065
payroll_periods: inserts=1 approx_rows~1 chars=1824
payroll_records: inserts=1 approx_rows~1 chars=2255
performance_reviews: inserts=1 approx_rows~1 chars=1738
personal_access_tokens: inserts=1 approx_rows~1 chars=22549
positions: inserts=1 approx_rows~1 chars=3371
practical_tests: inserts=1 approx_rows~1 chars=4596
requisitions: inserts=1 approx_rows~1 chars=4423
role_permissions: inserts=1 approx_rows~1 chars=3367
salary_grades: inserts=1 approx_rows~1 chars=2458
screening_ground_truths: inserts=1 approx_rows~1 chars=1292
screening_reference_data: inserts=1 approx_rows~1 chars=29649
screening_requirement_templates: inserts=1 approx_rows~1 chars=2220
screening_requirement_template_items: inserts=1 approx_rows~1 chars=4167
sessions: inserts=1 approx_rows~1 chars=6557
social_recognitions: inserts=1 approx_rows~1 chars=2160
system_roles: inserts=1 approx_rows~1 chars=1339
system_settings: inserts=1 approx_rows~1 chars=6615
system_users: inserts=1 approx_rows~1 chars=6959
user_login_activity: inserts=1 approx_rows~1 chars=38163
work_schedules: inserts=1 approx_rows~1 chars=17383

```

---

## Assistant (Build · Muse Spark 1.3 Free · 13.9s)

_Thinking:_



**Tool: write**

**Input:**
```json
{
  "content": "import re\ntxt = open('hotel_hr.sql', encoding='utf-8', errors='ignore').read()\nstructs = re.findall(r\"-- Table structure for table `([^`]+)`\", txt)\ndumps = re.findall(r\"-- Dumping data for table `([^`]+)`\", txt)\nprint(\"STRUCT total\", len(structs))\nprint(\"DUMP sections\", len(dumps))\nno_data_section = [t for t in structs if t not in dumps]\nprint(\"TABLES WITH STRUCTURE BUT NO DATA SECTION (empty / not dumped):\", no_data_section)\nmarkers = list(re.finditer(r\"-- Dumping data for table `([^`]+)`\", txt))\nfor i, m in enumerate(markers):\n    tbl = m.group(1)\n    start = m.end()\n    end = markers[i+1].start() if i+1 < len(markers) else len(txt)\n    chunk = txt[start:end]\n    # find INSERT ... VALUES\\n(...) blocks; count rows by counting lines starting with ( plus INSERT line\n    # simpler: count occurrences of \"),\\\\n(\" or \"),\" within INSERT statements\n    ins_lines = [l for l in chunk.splitlines() if l.strip().startswith(\"(\") or l.strip().startswith(\"INSERT\")]\n    # Better: extract INSERT blocks\n    inserts = re.findall(r\"INSERT INTO.*?VALUES\\s*(.*?);\", chunk, re.DOTALL)\n    total_rows = 0\n    for b in inserts:\n        # count top-level tuples: split on '),'\n        total_rows += b.count(\"),\") + (1 if b.strip() else 0)\n    print(f\"{tbl}: rows={total_rows}\")\n",
  "filePath": "C:\\Users\\WINDOW~1\\AppData\\Local\\Temp\\opencode\\count_rows2.py"
}
```

**Output:**
```
Wrote file successfully.
```

---

## Assistant (Build · Muse Spark 1.3 Free · 8.2s)

**Tool: bash**

**Input:**
```json
{
  "command": "python C:\\Users\\WINDOW~1\\AppData\\Local\\Temp\\opencode\\count_rows2.py",
  "workdir": "C:\\Users\\Windows 10 Lite\\Downloads\\MUNJOR\\4TH YR\\DEV\\LATEST CLONE\\v14\\2nd-repo-for-hrms-backend-"
}
```

**Output:**
```
STRUCT total 64
DUMP sections 59
TABLES WITH STRUCTURE BUT NO DATA SECTION (empty / not dumped): ['cache_locks', 'chatbot_messages', 'password_reset_tokens', 'promotion_requests', 'recognition_reactions']
announcements: rows=3
applicants: rows=1
applicant_assessments: rows=2
applicant_documents: rows=17
applicant_screenings: rows=7
applicant_screening_entities: rows=950
applicant_screening_scores: rows=184
assessment_tests: rows=16
attendance_records: rows=7
audit_logs: rows=1360
cache: rows=1
chatbot_faqs: rows=1
chatbot_unanswered: rows=2
checklist_requests: rows=2
departments: rows=9
employees: rows=24
employee_benefits: rows=12
employee_documents: rows=11
employee_emergency_contacts: rows=10
employee_exit_records: rows=1
employee_learning: rows=4
employee_onboarding_items: rows=175
employee_position_history: rows=24
ess_categories: rows=9
ess_requests: rows=7
facilities: rows=4
final_evaluations: rows=8
hr3_recommendations: rows=3
interviews: rows=27
job_posts: rows=4
job_post_platforms: rows=38
learning_courses: rows=3
leave_balances: rows=11
migrations: rows=80
new_hires: rows=28
notifications: rows=2669
onboarding_checklist_items: rows=15
onboarding_checklist_templates: rows=2
payroll_items: rows=61
payroll_periods: rows=4
payroll_records: rows=7
performance_reviews: rows=1
personal_access_tokens: rows=106
positions: rows=19
practical_tests: rows=3
requisitions: rows=5
role_permissions: rows=30
salary_grades: rows=7
screening_ground_truths: rows=2
screening_reference_data: rows=154
screening_requirement_templates: rows=8
screening_requirement_template_items: rows=55
sessions: rows=1
social_recognitions: rows=4
system_roles: rows=3
system_settings: rows=20
system_users: rows=24
user_login_activity: rows=1
work_schedules: rows=7

```

---

## Assistant (Build · Muse Spark 1.3 Free · 9.6s)

_Thinking:_



**Tool: bash**

**Input:**
```json
{
  "command": "Select-String -Path \"backend-laravel\\database\\migrations\\*.php\", \"backend-laravel\\Modules\\*\\database\\migrations\\*.php\" -Pattern \"Schema::create\" | Select-Object -ExpandProperty Line | Sort-Object -Unique",
  "workdir": "C:\\Users\\Windows 10 Lite\\Downloads\\MUNJOR\\4TH YR\\DEV\\LATEST CLONE\\v14\\2nd-repo-for-hrms-backend-"
}
```

**Output:**
```
            Schema::create('recognition_reactions', function (Blueprint $table) {
            Schema::create('social_recognitions', function (Blueprint $table) {
        Schema::create('announcements', function (Blueprint $table) {
        Schema::create('applicant_assessments', function (Blueprint $table) {
        Schema::create('applicant_documents', function (Blueprint $table) {
        Schema::create('applicant_screening_entities', function (Blueprint $table) {
        Schema::create('applicant_screening_scores', function (Blueprint $table) {
        Schema::create('applicant_screenings', function (Blueprint $table) {
        Schema::create('applicants', function (Blueprint $table) {
        Schema::create('assessment_invites', function (Blueprint $table) {
        Schema::create('assessment_tests', function (Blueprint $table) {
        Schema::create('attendance_records', function (Blueprint $table) {
        Schema::create('audit_logs', function (Blueprint $table) {
        Schema::create('cache', function (Blueprint $table) {
        Schema::create('cache_locks', function (Blueprint $table) {
        Schema::create('chatbot_faqs', function (Blueprint $table) {
        Schema::create('chatbot_messages', function (Blueprint $table) {
        Schema::create('chatbot_unanswered', function (Blueprint $table) {
        Schema::create('checklist_requests', function (Blueprint $table) {
        Schema::create('departments', function (Blueprint $table) {
        Schema::create('employee_benefits', function (Blueprint $table) {
        Schema::create('employee_documents', function (Blueprint $table) {
        Schema::create('employee_emergency_contacts', function (Blueprint $table) {
        Schema::create('employee_exit_records', function (Blueprint $table) {
        Schema::create('employee_learning', function (Blueprint $table) {
        Schema::create('employee_onboarding_items', function (Blueprint $table) {
        Schema::create('employee_position_history', function (Blueprint $table) {
        Schema::create('employees', function (Blueprint $table) {
        Schema::create('ess_categories', function (Blueprint $table) {
        Schema::create('ess_requests', function (Blueprint $table) {
        Schema::create('facilities', function (Blueprint $table) {
        Schema::create('final_evaluations', function (Blueprint $table) {
        Schema::create('hr3_recommendations', function (Blueprint $table) {
        Schema::create('interviews', function (Blueprint $table) {
        Schema::create('job_post_platforms', function (Blueprint $table) {
        Schema::create('job_posts', function (Blueprint $table) {
        Schema::create('learning_courses', function (Blueprint $table) {
        Schema::create('leave_balances', function (Blueprint $table) {
        Schema::create('new_hires', function (Blueprint $table) {
        Schema::create('notifications', function (Blueprint $table) {
        Schema::create('onboarding_checklist_items', function (Blueprint $table) {
        Schema::create('onboarding_checklist_templates', function (Blueprint $table) {
        Schema::create('password_reset_tokens', function (Blueprint $table) {
        Schema::create('payroll_items', function (Blueprint $table) {
        Schema::create('payroll_periods', function (Blueprint $table) {
        Schema::create('payroll_records', function (Blueprint $table) {
        Schema::create('performance_reviews', function (Blueprint $table) {
        Schema::create('personal_access_tokens', function (Blueprint $table) {
        Schema::create('positions', function (Blueprint $table) {
        Schema::create('practical_tests', function (Blueprint $table) {
        Schema::create('promotion_requests', function (Blueprint $table) {
        Schema::create('requisitions', function (Blueprint $table) {
        Schema::create('role_permissions', function (Blueprint $table) {
        Schema::create('salary_grades', function (Blueprint $table) {
        Schema::create('screening_ground_truths', function (Blueprint $table) {
        Schema::create('screening_reference_data', function (Blueprint $table) {
        Schema::create('screening_requirement_template_items', function (Blueprint $table) {
        Schema::create('screening_requirement_templates', function (Blueprint $table) {
        Schema::create('sessions', function (Blueprint $table) {
        Schema::create('system_roles', function (Blueprint $table) {
        Schema::create('system_settings', function (Blueprint $table) {
        Schema::create('system_users', function (Blueprint $table) {
        Schema::create('user_login_activity', function (Blueprint $table) {
        Schema::create('work_schedules', function (Blueprint $table) {

```

---

## Assistant (Build · Muse Spark 1.3 Free · 13.9s)

_Thinking:_



Found several empty and duplicate tables — now verifying if code actually depends on them.

**Tool: grep**

**Input:**
```json
{
  "include": "*.php",
  "path": "C:\\Users\\Windows 10 Lite\\Downloads\\MUNJOR\\4TH YR\\DEV\\LATEST CLONE\\v14\\2nd-repo-for-hrms-backend-\\backend-laravel\\Modules",
  "pattern": "promotion_requests|recognition_reactions|social_recognitions|chatbot_messages|facilities|assessment_invites"
}
```

**Output:**
```
Found 36 matches
C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\Modules\ApplicantManagement\routes\api.php:
  Line 149:           Route::get('facilities', [FacilityController::class, 'index'])

  Line 150:                ->name('facilities.index');


C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\Modules\ApplicantManagement\database\seeders\ScreeningReferenceDataSeeder.php:
  Line 146:                 'Hospitality Facilities Team Leader' => ['hospitality facilities team leader', 'facilities team leader', 'facilities supervisor', 'hospitality facilities supervisor'],

  Line 148:                 'Hospitality Maintenance Coordinator' => ['hospitality maintenance coordinator', 'maintenance coordinator', 'facilities maintenance coordinator', 'hospitality maintenance supervisor'],

  Line 156:                 'Hotel Facilities Supervisor' => ['hotel facilities supervisor', 'facilities supervisor', 'property maintenance supervisor', 'hotel facilities manager'],

  Line 174:                 'Maintenance Technician' => ['maintenance technician', 'hotel maintenance technician', 'maintenance staff', 'handyman', 'building maintenance staff', 'facilities assistant'],

  Line 224:                 'Facilities Management Training - Philippine Society of Ventilating, Air-Conditioning and Refrigerating Engineers (2020)' => ['facilities management training - philippine society of ventilating, air-conditioning and refrigerating engineers (2020)', 'facilities management training - philippine society of ventilating, air-conditioning and refrigerating engineers', 'facilities management training - philippine society of ventilating, air'],


C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\Modules\Landing\app\Http\Controllers\LandingController.php:
  Line 38:             'company.facilities',

  Line 61:                 'facilities' => $value('company.facilities', []),


C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\Modules\Landing\app\Http\Controllers\LandingController-DESKTOP-FJ91I5O.php:
  Line 38:             'company.facilities',

  Line 61:                 'facilities' => $value('company.facilities', []),


C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\Modules\ApplicantManagement\database\migrations\2026_10_03_000001_create_assessment_invites_table.php:
  Line 18:         Schema::create('assessment_invites', function (Blueprint $table) {

  Line 36:             $table->index('applicant_id', 'idx_assessment_invites_applicant_id');

  Line 37:             $table->index('status', 'idx_assessment_invites_status');

  Line 39:             $table->foreign('applicant_id', 'fk_assessment_invites_applicant_id')

  Line 41:             $table->foreign('created_by_user_id', 'fk_assessment_invites_created_by_user_id')

  Line 48:         Schema::dropIfExists('assessment_invites');


C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\Modules\ApplicantManagement\database\migrations\2026_09_05_000002_add_facility_to_interviews_table.php:
  Line 25:                   ->references('facility_id')->on('facilities')


C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\Modules\ApplicantManagement\database\migrations\2026_09_05_000001_create_facilities_table.php:
  Line 11:      * Interview / assessment facilities.

  Line 19:         Schema::create('facilities', function (Blueprint $table) {

  Line 31:             $table->index('type', 'idx_facilities_type');

  Line 32:             $table->index('is_active', 'idx_facilities_is_active');

  Line 35:         DB::statement("ALTER TABLE `facilities` ADD CONSTRAINT `chk_facilities_type` CHECK (`type` IN ('On-site', 'Virtual'))");

  Line 38:         DB::table('facilities')->insert([

  Line 80:         Schema::dropIfExists('facilities');


C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\Modules\ApplicantManagement\app\Models\Facility.php:
  Line 10:     protected $table = 'facilities';


C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\Modules\ApplicantManagement\app\Models\AssessmentInvite.php:
  Line 10:     protected $table = 'assessment_invites';


C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\Modules\EmployeeSelfService\app\Models\SocialRecognition.php:
  Line 12:     protected $table = 'social_recognitions';


C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\Modules\EmployeeSelfService\app\Models\RecognitionReaction.php:
  Line 11:     protected $table = 'recognition_reactions';


C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\Modules\ApplicantManagement\app\Http\Requests\StoreInterviewRequest.php:
  Line 21:             'facility_id'             => ['nullable', 'integer', 'exists:facilities,facility_id'],


C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\Modules\ApplicantManagement\app\Http\Controllers\FacilityController.php:
  Line 14:     /* GET /api/v1/facilities                                              */

  Line 15:     /* List interview facilities (optional ?type=On-site|Virtual filter)   */

  Line 26:         $facilities = $query->get();

  Line 29:             'data' => FacilityResource::collection($facilities),

  Line 33:                 'per_page'     => $facilities->count(),

  Line 34:                 'total'        => $facilities->count(),

```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Windows 10 Lite\\Downloads\\MUNJOR\\4TH YR\\DEV\\LATEST CLONE\\v14\\2nd-repo-for-hrms-backend-\\backend-laravel\\database\\migrations\\0001_01_01_000000_create_users_table.php"
}
```

**Output:**
```
<path>C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\database\migrations\0001_01_01_000000_create_users_table.php</path>
<type>file</type>
<content>
1: <?php
2: 
3: use Illuminate\Database\Migrations\Migration;
4: use Illuminate\Database\Schema\Blueprint;
5: use Illuminate\Support\Facades\Schema;
6: 
7: return new class extends Migration
8: {
9:     /**
10:      * Run the migrations.
11:      *
12:      * Note: the stock Laravel `users` table was removed — authentication in
13:      * this application is handled entirely by the custom `system_users` table
14:      * (see 2025_..._create_system_users_table).
15:      */
16:     public function up(): void
17:     {
18:         Schema::create('password_reset_tokens', function (Blueprint $table) {
19:             $table->string('email')->primary();
20:             $table->string('token');
21:             $table->timestamp('created_at')->nullable();
22:         });
23: 
24:         Schema::create('sessions', function (Blueprint $table) {
25:             $table->string('id')->primary();
26:             $table->foreignId('user_id')->nullable()->index();
27:             $table->string('ip_address', 45)->nullable();
28:             $table->text('user_agent')->nullable();
29:             $table->longText('payload');
30:             $table->integer('last_activity')->index();
31:         });
32:     }
33: 
34:     /**
35:      * Reverse the migrations.
36:      */
37:     public function down(): void
38:     {
39:         Schema::dropIfExists('password_reset_tokens');
40:         Schema::dropIfExists('sessions');
41:     }
42: };

(End of file - total 42 lines)
</content>
```

---

## Assistant (Build · Muse Spark 1.3 Free · 12.1s)

_Thinking:_



Based on your live DB dump `hotel_hr.sql` (Sep 28, 2026) + migrations in `backend-laravel/`, here is the truth:

### 1. Currently working / used: 59 tables with data

From `hotel_hr.sql` row counts (`-- Dumping data`):

**Core HCM (10):** `departments (9)`, `salary_grades (7)`, `positions (19)`, `employees (24)`, `employee_emergency_contacts (10)`, `employee_position_history (24)`, `employee_exit_records (1)`, `employee_documents (11)`, `employee_benefits (12)`, `hr3_recommendations (3)`

**Recruitment (7):** `requisitions (5)`, `job_posts (4)`, `job_post_platforms (38)`, `applicants (1)`, `applicant_screening_entities (950)`, `applicant_screening_scores (184)`, `interviews (27)`

**Applicant pipeline - new (8):** `applicant_screenings (7)`, `applicant_assessments (2)`, `applicant_documents (17)`, `assessment_tests (16)`, `practical_tests (3)`, `final_evaluations (8)`, `facilities (4)`, `screening_reference_data (154)`, `screening_ground_truths (2)`, `screening_requirement_templates (8)`, `screening_requirement_template_items (55)`

**Hiring/Onboarding (5):** `new_hires (28)`, `onboarding_checklist_templates (2)`, `onboarding_checklist_items (15)`, `employee_onboarding_items (175)`, `checklist_requests (2)`

**ESS/Payroll (11):** `ess_categories (9)`, `ess_requests (7)`, `leave_balances (11)`, `attendance_records (7)`, `work_schedules (7)`, `payroll_periods (4)`, `payroll_records (7)`, `payroll_items (61)`, `learning_courses (3)`, `employee_learning (4)`, `performance_reviews (1)`

**System (9):** `system_roles (3)`, `role_permissions (30)`, `system_users (24)`, `user_login_activity (1)`, `audit_logs (1360)`, `notifications (2669)`, `announcements (3)`, `system_settings (20)`, `social_recognitions (4)`

**Chatbot (2):** `chatbot_faqs (1)`, `chatbot_unanswered (2)`

**Framework - keep, don't drop (5):** `migrations (80)`, `personal_access_tokens (106)`, `sessions (1)`, `cache (1)`, `cache_locks`

### 2. Empty / safe to drop if you want fewer tables

Structure exists but 0 rows in dump:
`promotion_requests`, `recognition_reactions`, `chatbot_messages`, `password_reset_tokens` + `assessment_invites` (migration `2026_10_03` exists, not yet in dump).

### 3. How to lessen tables - biggest wins

1. `recognition_reactions (0 rows)` -> drop if you don't need like/react, keep only `social_recognitions`.
2. `promotion_requests (0 rows)` -> drop whole feature if unused.
3. `chatbot_messages (0 rows)` -> drop, keep `chatbot_faqs` + `chatbot_unanswered`.
4. Screening stack: 7 tables (`applicant_screenings`, `applicant_screening_entities`, `applicant_screening_scores`, `screening_ground_truths`, `screening_reference_data`, `screening_requirement_templates/_items`) -> old vs new pipeline duplicated. Pick one pipeline, drop the other = -4 tables.
5. Assessment stack: `applicant_assessments` + `assessment_tests` + `practical_tests` + `final_evaluations` + `assessment_invites` = -3 tables if merged to 2.
6. `facilities (4 rows)` -> replace with `interviews.location VARCHAR`, drop table.
7. `job_post_platforms (38 rows)` -> replace with `job_posts.platforms_json`, drop table.

Doing 1+2+3+6+7 alone: 64 -> ~57 tables with zero code risk to core HR.


---

## User

all of this table are working right?
Screening stack: 7 tables (applicant_screenings, applicant_screening_entities, applicant_screening_scores, screening_ground_truths, screening_reference_data, screening_requirement_templates/_items) -> old vs new pipeline duplicated. Pick one pipeline, drop the other = -4 tables.
Assessment stack: applicant_assessments + assessment_tests + practical_tests + final_evaluations + assessment_invites = -3 tables if merged to 2.
facilities (4 rows) -> replace with interviews.location VARCHAR, drop table.
job_post_platforms (38 rows) -> replace with job_posts.platforms_json, drop table. 

then may i know the column for each table

---

## Assistant (Build · Muse Spark 1.3 Free · 36.9s)

_Thinking:_



Confirming those tables are live, then pulling every column.

**Tool: write**

**Input:**
```json
{
  "content": "import re\ntxt = open('hotel_hr.sql', encoding='utf-8', errors='ignore').read()\nwanted = ['applicant_screenings','applicant_screening_entities','applicant_screening_scores','screening_ground_truths','screening_reference_data','screening_requirement_templates','screening_requirement_template_items','applicant_assessments','assessment_tests','practical_tests','final_evaluations','facilities','job_post_platforms','job_posts','interviews']\nfor tbl in wanted:\n    m = re.search(r\"CREATE TABLE IF NOT EXISTS `\"+tbl+r\"` \\((.*?)\\n\\) ENGINE\", txt, re.DOTALL)\n    if not m:\n        print(f\"== {tbl}: NOT FOUND ==\")\n        continue\n    body = m.group(1)\n    print(f\"== {tbl} ==\")\n    for line in body.splitlines():\n        print(line.strip())\n    print()\n",
  "filePath": "C:\\Users\\WINDOW~1\\AppData\\Local\\Temp\\opencode\\cols.py"
}
```

**Output:**
```
Wrote file successfully.
```

---

## Assistant (Build · Muse Spark 1.3 Free · 5.7s)

**Tool: bash**

**Input:**
```json
{
  "command": "python C:\\Users\\WINDOW~1\\AppData\\Local\\Temp\\opencode\\cols.py",
  "workdir": "C:\\Users\\Windows 10 Lite\\Downloads\\MUNJOR\\4TH YR\\DEV\\LATEST CLONE\\v14\\2nd-repo-for-hrms-backend-"
}
```

**Output:**
```
...output truncated...

Full output saved to: C:\Users\Windows 10 Lite\.local\share\opencode\tool-output\tool_106900b2b001CvR4Huqy3O25Ke

(32, 84, 'Credential', 'City Tour Guiding Workshop Certificate', 0, 'applicant-documents/5uKN3PLoK2NZS3z6sh01yW71yCmyYw8KhIyW31eJ.pdf', 'Adrian_Luis_Navarro_Training_Certificate_Service.pdf', 'DISCREPANCY_FOUND', '{\"success\":true,\"document_type\":\"Credential\",\"verification_status\":\"DISCREPANCY_FOUND\",\"checks\":{\"certification\":{\"resume_value\":\"Luxury Destination Itinerary Planning & Vip\",\"document_value\":\"Foundations Of City Tour Guiding And Landmark Navigation\",\"normalized_resume\":\"luxury destination itinerary planning & vip\",\"normalized_document\":\"foundations of city tour guiding and landmark navigation\",\"match_method\":\"fuzzy\",\"result\":\"MISMATCH\"},\"issuer\":{\"resume_value\":null,\"document_value\":null,\"normalized_resume\":null,\"normalized_document\":null,\"match_method\":\"unable\",\"result\":\"UNABLE_TO_EXTRACT\"}},\"summary\":\"Discrepancy found in Certification - the credential document does not fully match the resume claims.\",\"extracted_document_profile\":{\"name\":\"ADRIAN LUIS NAVARRO\",\"organizations\":[],\"job_titles_raw\":[],\"education\":[\"CERTIFICATE OF TRAINING PARTICIPATION\\nThis certificate is proudly awarded t\"],\"certifications_raw\":[\"Of Training\",\"This Certificate\",\"Adrian Luis Navarro\",\"For Active Participation And Completion Of The Workshop\",\"Foundations Of City Tour Guiding And Landmark Navigation\",\"Registration Id: Ws\",\"Ramon F. Bautista\",\"Managing Director\",\"Lourdes M. Tan\",\"Lead Program Facilitator\",\"Ramon F. Bautista Lourdes M. Tan\",\"Managing Director Lead Program Facilitator\"],\"work_history\":[],\"sections_detected\":[\"certifications\"],\"estimated_years_experience\":0,\"document_claims\":{\"certification\":\"Foundations Of City Tour Guiding And Landmark Navigation\",\"issuer\":null}},\"text_extraction\":{\"method\":\"pdf-text (pypdfium2+pdfplumber)\",\"pages\":1,\"extension\":\".pdf\",\"character_count\":570}}', '{\"name\":\"ADRIAN LUIS NAVARRO\",\"organizations\":[],\"job_titles_raw\":[],\"education\":[\"CERTIFICATE OF TRAINING PARTICIPATION\\nThis certificate is proudly awarded t\"],\"certifications_raw\":[\"Of Training\",\"This Certificate\",\"Adrian Luis Navarro\",\"For Active Participation And Completion Of The Workshop\",\"Foundations Of City Tour Guiding And Landmark Navigation\",\"Registration Id: Ws\",\"Ramon F. Bautista\",\"Managing Director\",\"Lourdes M. Tan\",\"Lead Program Facilitator\",\"Ramon F. Bautista Lourdes M. Tan\",\"Managing Director Lead Program Facilitator\"],\"work_history\":[],\"sections_detected\":[\"certifications\"],\"estimated_years_experience\":0,\"document_claims\":{\"certification\":\"Foundations Of City Tour Guiding And Landmark Navigation\",\"issuer\":null}}', '2026-09-22 14:04:22', '2026-09-18 23:59:25', '2026-09-18 15:59:25', '2026-09-22 14:04:22'),
(33, 84, 'Credential', 'Incomplete Certificate (torn scan)', 0, 'applicant-documents/ZPEKe1ENhTMNLQNgyeOcZt6GMn6LwvZ2HIGn6dpf.pdf', 'Adrian_Luis_Navarro_Incomplete_Certificate.pdf', 'UNABLE_TO_VERIFY', '{\"success\":true,\"document_type\":\"Credential\",\"verification_status\":\"UNABLE_TO_VERIFY\",\"checks\":[],\"summary\":\"The applicant\'s name appears nowhere in the document \\u2014 the recipient area may be torn off or unreadable, or this may be someone else\'s paper \\u2014 so its claims cannot be attributed to this applicant. Manual HR review is required.\",\"extracted_document_profile\":[],\"text_extraction\":{\"method\":\"pdf-ocr (pypdfium2+tesseract)\",\"pages\":1,\"extension\":\".pdf\",\"character_count\":402}}', '[]', '2026-09-22 14:05:14', '2026-09-18 23:59:25', '2026-09-18 15:59:25', '2026-09-22 14:05:14');

-- --------------------------------------------------------

--
-- Table structure for table `applicant_screenings`
--

CREATE TABLE IF NOT EXISTS `applicant_screenings` (
`screening_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
`applicant_id` bigint(20) UNSIGNED NOT NULL,
`job_post_id` bigint(20) UNSIGNED NOT NULL,
`processing_status` varchar(30) NOT NULL DEFAULT 'PENDING',
`screening_result` varchar(30) DEFAULT NULL,
`match_score` decimal(5,2) DEFAULT NULL,
`resume_match_score` decimal(5,2) DEFAULT NULL,
`score_breakdown_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`score_breakdown_json`)),
`profile_json` longtext DEFAULT NULL,
`entities_json` longtext DEFAULT NULL,
`missing_information_json` longtext DEFAULT NULL,
`validation_json` longtext DEFAULT NULL,
`alternative_job_json` longtext DEFAULT NULL,
`document_verification_json` longtext DEFAULT NULL,
`reasons_json` longtext DEFAULT NULL,
`model_info_json` longtext DEFAULT NULL,
`error_message` text DEFAULT NULL,
`processed_at` timestamp NULL DEFAULT NULL,
`created_at` timestamp NOT NULL DEFAULT current_timestamp(),
`updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
PRIMARY KEY (`screening_id`),
KEY `idx_applicant_screenings_applicant_id` (`applicant_id`),
KEY `idx_applicant_screenings_job_post_id` (`job_post_id`),
KEY `idx_applicant_screenings_processing_status` (`processing_status`)

== assessment_tests ==

`assessment_test_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
`applicant_id` bigint(20) UNSIGNED NOT NULL,
`assessor_user_id` bigint(20) UNSIGNED DEFAULT NULL,
`test_title` varchar(190) NOT NULL,
`questions_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`questions_json`)),
`scores_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`scores_json`)),
`total_score` decimal(5,2) DEFAULT NULL,
`passing_score` decimal(5,2) NOT NULL DEFAULT 75.00,
`result` varchar(10) NOT NULL,
`test_date` date NOT NULL,
`remarks` text DEFAULT NULL,
`created_at` timestamp NOT NULL DEFAULT current_timestamp(),
`updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
PRIMARY KEY (`assessment_test_id`),
KEY `idx_assessment_tests_applicant_id` (`applicant_id`),
KEY `idx_assessment_tests_assessor_user_id` (`assessor_user_id`),
KEY `idx_assessment_tests_test_date` (`test_date`)
) ;

--
-- Dumping data for table `assessment_tests`
--

INSERT INTO `assessment_tests` (`assessment_test_id`, `applicant_id`, `assessor_user_id`, `test_title`, `questions_json`, `scores_json`, `total_score`, `passing_score`, `result`, `test_date`, `remarks`, `created_at`, `updated_at`) VALUES
(1, 47, 11, 'Front Desk Receptionist � Job Knowledge Test', '[{\"question\":\"hahaha\",\"points\":20},{\"question\":\"hahaha\",\"points\":20},{\"question\":\"haha\",\"points\":20},{\"question\":\"ahha\",\"points\":20},{\"question\":\"hahaha\",\"points\":20}]', '[0,0,0,0,0]', 0.00, 75.00, 'Failed', '2026-09-06', 'heheh', '2026-09-05 09:00:24', '2026-09-05 09:00:24'),
(2, 36, 11, 'Bartender � Job Knowledge Test', '[{\"question\":\"hahaha\",\"points\":100}]', '[100]', 100.00, 75.00, 'Passed', '2026-09-06', 'hehehe', '2026-09-05 09:00:52', '2026-09-05 09:00:52'),
(3, 32, NULL, 'HR Assistant � Job Knowledge Test', '[{\"question\":\"g\",\"points\":20}]', '[20]', 100.00, 75.00, 'Passed', '2026-09-06', 'g', '2026-09-05 11:58:29', '2026-09-05 11:58:29'),
(4, 60, NULL, 'Front Desk Receptionist � Job Knowledge Test', '[{\"question\":\"Handle Electrical Issue Promptly \\u2014 You have checked in a guest to their assigned room. The guest has settled in and uses an electric appliance, which causes a spark, and the electricity trips on the entire floor. What would you do?\",\"points\":20},{\"question\":\"Handle Guest Complaint With Care \\u2014 A guest approaches the front desk and complains that their room was not cleaned before check-in, even though the system shows it as inspected. The guest is upset and other guests are waiting in line. What would you do?\",\"points\":20},{\"question\":\"Prioritize Food Safety \\u2014 During a busy dinner service, you notice a co-worker place cooked food on a tray that previously held raw ingredients without cleaning it. Orders are piling up. What would you do?\",\"points\":20},{\"question\":\"Manage Overlapping Reservations \\u2014 Two guests arrive at the same time claiming the same reserved table. The reservation book shows one entry clearly, but the other guest insists they booked by phone. Both are getting impatient. What would you do?\",\"points\":20},{\"question\":\"Support the Team During Rush Hour \\u2014 It is peak check-in time, the lobby is full, and a co-worker at the next counter is struggling with a difficult transaction while your own line is moving smoothly. What would you do?\",\"points\":20}]', '[0,20,0,20,0]', 40.00, 75.00, 'Failed', '2026-09-06', 'Auto-checked: 2/5 correct.', '2026-09-05 13:34:47', '2026-09-05 13:34:47'),
(7, 72, NULL, 'Front Desk Receptionist � Job Knowledge Test', '[{\"question\":\"Handle Electrical Issue Promptly \\u2014 You have checked in a guest to their assigned room. The guest has settled in and uses an electric appliance, which causes a spark, and the electricity trips on the entire floor. What would you do?\",\"points\":20},{\"question\":\"Handle Guest Complaint With Care \\u2014 A guest complains at the front desk that their room was not cleaned before check-in, even though the system shows it as inspected. The guest is upset and other guests are waiting in line. What would you do?\",\"points\":20},{\"question\":\"Manage Overlapping Reservations \\u2014 Two guests arrive at the same time claiming the same reservation. The book shows one entry clearly, but the other guest insists they booked by phone. Both are impatient. What would you do?\",\"points\":20},{\"question\":\"Handle a Fully Booked Night \\u2014 A guest with a confirmed reservation arrives, but the hotel is fully booked due to an earlier system error. The guest is tired after a long trip. What would you do?\",\"points\":20},{\"question\":\"Support the Team During Rush Hour \\u2014 It is peak check-in time, the lobby is full, and a co-worker at the next counter is struggling with a difficult transaction while your own line is moving smoothly. What would you do?\",\"points\":20}]', '[20,20,20,20,20]', 100.00, 75.00, 'Passed', '2026-09-06', 'Auto-checked: 5/5 correct.', '2026-09-05 17:33:46', '2026-09-05 17:33:46'),
(8, 75, NULL, 'Line Cook � Job Knowledge Test', '[{\"question\":\"Stop Cross-Contamination \\u2014 During a busy service, you see cooked food placed on a tray that previously held raw ingredients without being cleaned. Orders are piling up. What would you do?\",\"points\":20},{\"question\":\"Respond to a Grease Flare-Up \\u2014 A small grease flare-up starts in a pan on your station while several orders are on the fire. What would you do?\",\"points\":20},{\"question\":\"Follow the Recipe Under Pressure \\u2014 You run out of a key ingredient mid-service and the next delivery is an hour away. The head cook is busy. What would you do?\",\"points\":20},{\"question\":\"Keep the Station Hygienic \\u2014 Your station surfaces and tools have built-up residue halfway through service, but tickets keep coming. What would you do?\",\"points\":20},{\"question\":\"Plate Consistently at Speed \\u2014 Plates are leaving your station looking different from one another during a rush, and the supervisor flags inconsistent portions. What would you do?\",\"points\":20}]', '[20,20,20,20,20]', 100.00, 75.00, 'Passed', '2026-09-06', 'Auto-checked: 5/5 correct.', '2026-09-05 17:36:53', '2026-09-05 17:36:53'),
(9, 29, NULL, 'Bartender � Job Knowledge Test', '[{\"question\":\"Handle an Intoxicated Guest \\u2014 A visibly intoxicated guest demands another strong drink and becomes insistent when you hesitate. What would you do?\",\"points\":20},{\"question\":\"Verify Age Before Serving \\u2014 A young-looking guest orders a cocktail but cannot present a valid ID, claiming they left it in their room. What would you do?\",\"points\":20},{\"question\":\"Broken Glass Near the Ice Bin \\u2014 A glass shatters near the open ice bin during a rush, and fragments may have fallen into the ice. Drink orders are waiting. What would you do?\",\"points\":20},{\"question\":\"Manage a Long Bar Queue \\u2014 A long queue forms at the bar and waiting guests are getting restless. You are the only bartender for the next few minutes. What would you do?\",\"points\":20},{\"question\":\"Remake a Rejected Cocktail \\u2014 A guest sends back a cocktail, saying it tastes wrong. You followed the recipe, but the guest is disappointed. What would you do?\",\"points\":20}]', '[20,20,20,20,20]', 100.00, 75.00, 'Passed', '2026-09-13', 'Auto-checked: 5/5 correct.', '2026-09-13 00:40:26', '2026-09-13 00:40:26'),
(10, 43, NULL, 'Front Desk Receptionist � Job Knowledge Test', '[{\"question\":\"Handle Electrical Issue Promptly \\u2014 You have checked in a guest to their assigned room. The guest has settled in and uses an electric appliance, which causes a spark, and the electricity trips on the entire floor. What would you do?\",\"points\":20},{\"question\":\"Handle Guest Complaint With Care \\u2014 A guest complains at the front desk that their room was not cleaned before check-in, even though the system shows it as inspected. The guest is upset and other guests are waiting in line. What would you do?\",\"points\":20},{\"question\":\"Manage Overlapping Reservations \\u2014 Two guests arrive at the same time claiming the same reservation. The book shows one entry clearly, but the other guest insists they booked by phone. Both are impatient. What would you do?\",\"points\":20},{\"question\":\"Handle a Fully Booked Night \\u2014 A guest with a confirmed reservation arrives, but the hotel is fully booked due to an earlier system error. The guest is tired after a long trip. What would you do?\",\"points\":20},{\"question\":\"Support the Team During Rush Hour \\u2014 It is peak check-in time, the lobby is full, and a co-worker at the next counter is struggling with a difficult transaction while your own line is moving smoothly. What would you do?\",\"points\":20}]', '[20,20,20,20,20]', 100.00, 75.00, 'Passed', '2026-09-15', 'Auto-checked: 5/5 correct.', '2026-09-15 00:01:36', '2026-09-15 00:01:36'),
(11, 41, NULL, 'Front Desk Receptionist � Job Knowledge Test', '[{\"question\":\"Handle Electrical Issue Promptly \\u2014 You have checked in a guest to their assigned room. The guest has settled in and uses an electric appliance, which causes a spark, and the electricity trips on the entire floor. What would you do?\",\"points\":20},{\"question\":\"Handle Guest Complaint With Care \\u2014 A guest complains at the front desk that their room was not cleaned before check-in, even though the system shows it as inspected. The guest is upset and other guests are waiting in line. What would you do?\",\"points\":20},{\"question\":\"Manage Overlapping Reservations \\u2014 Two guests arrive at the same time claiming the same reservation. The book shows one entry clearly, but the other guest insists they booked by phone. Both are impatient. What would you do?\",\"points\":20},{\"question\":\"Handle a Fully Booked Night \\u2014 A guest with a confirmed reservation arrives, but the hotel is fully booked due to an earlier system error. The guest is tired after a long trip. What would you do?\",\"points\":20},{\"question\":\"Support the Team During Rush Hour \\u2014 It is peak check-in time, the lobby is full, and a co-worker at the next counter is struggling with a difficult transaction while your own line is moving smoothly. What would you do?\",\"points\":20}]', '[20,20,20,20,20]', 100.00, 75.00, 'Passed', '2026-09-15', 'Auto-checked: 5/5 correct.', '2026-09-15 01:28:50', '2026-09-15 01:28:50'),
(12, 53, NULL, 'HR Assistant � Job Knowledge Test', '[{\"question\":\"Handle Electrical Issue Promptly \\u2014 You have checked in a guest to their assigned room. The guest has settled in and uses an electric appliance, which causes a spark, and the electricity trips on the entire floor. What would you do?\",\"points\":20},{\"question\":\"Handle Guest Complaint With Care \\u2014 A guest approaches the front desk and complains that their room was not cleaned before check-in, even though the system shows it as inspected. The guest is upset and other guests are waiting in line. What would you do?\",\"points\":20},{\"question\":\"Prioritize Food Safety \\u2014 During a busy dinner service, you notice a co-worker place cooked food on a tray that previously held raw ingredients without cleaning it. Orders are piling up. What would you do?\",\"points\":20},{\"question\":\"Manage Overlapping Reservations \\u2014 Two guests arrive at the same time claiming the same reserved table. The reservation book shows one entry clearly, but the other guest insists they booked by phone. Both are getting impatient. What would you do?\",\"points\":20},{\"question\":\"Support the Team During Rush Hour \\u2014 It is peak check-in time, the lobby is full, and a co-worker at the next counter is struggling with a difficult transaction while your own line is moving smoothly. What would you do?\",\"points\":20}]', '[20,20,20,20,20]', 100.00, 75.00, 'Passed', '2026-09-15', 'Auto-checked: 5/5 correct.', '2026-09-15 01:32:27', '2026-09-15 01:32:27'),
(14, 81, NULL, 'Front Desk Receptionist � Job Knowledge Test', '[{\"question\":\"Handle Electrical Issue Promptly \\u2014 You have checked in a guest to their assigned room. The guest has settled in and uses an electric appliance, which causes a spark, and the electricity trips on the entire floor. What would you do?\",\"points\":20},{\"question\":\"Handle Guest Complaint With Care \\u2014 A guest complains at the front desk that their room was not cleaned before check-in, even though the system shows it as inspected. The guest is upset and other guests are waiting in line. What would you do?\",\"points\":20},{\"question\":\"Manage Overlapping Reservations \\u2014 Two guests arrive at the same time claiming the same reservation. The book shows one entry clearly, but the other guest insists they booked by phone. Both are impatient. What would you do?\",\"points\":20},{\"question\":\"Handle a Fully Booked Night \\u2014 A guest with a confirmed reservation arrives, but the hotel is fully booked due to an earlier system error. The guest is tired after a long trip. What would you do?\",\"points\":20},{\"question\":\"Support the Team During Rush Hour \\u2014 It is peak check-in time, the lobby is full, and a co-worker at the next counter is struggling with a difficult transaction while your own line is moving smoothly. What would you do?\",\"points\":20}]', '[20,20,20,20,20]', 100.00, 75.00, 'Passed', '2026-09-21', 'Auto-checked: 5/5 correct.', '2026-09-21 04:40:54', '2026-09-21 04:40:54'),
(15, 71, NULL, 'Guest Relations Officer � Job Knowledge Test', '[{\"question\":\"Handle Electrical Issue Promptly \\u2014 You have checked in a guest to their assigned room. The guest has settled in and uses an electric appliance, which causes a spark, and the electricity trips on the entire floor. What would you do?\",\"points\":20},{\"question\":\"Handle Guest Complaint With Care \\u2014 A guest complains at the front desk that their room was not cleaned before check-in, even though the system shows it as inspected. The guest is upset and other guests are waiting in line. What would you do?\",\"points\":20},{\"question\":\"Manage Overlapping Reservations \\u2014 Two guests arrive at the same time claiming the same reservation. The book shows one entry clearly, but the other guest insists they booked by phone. Both are impatient. What would you do?\",\"points\":20},{\"question\":\"Handle a Fully Booked Night \\u2014 A guest with a confirmed reservation arrives, but the hotel is fully booked due to an earlier system error. The guest is tired after a long trip. What would you do?\",\"points\":20},{\"question\":\"Support the Team During Rush Hour \\u2014 It is peak check-in time, the lobby is full, and a co-worker at the next counter is struggling with a difficult transaction while your own line is moving smoothly. What would you do?\",\"points\":20}]', '[20,20,20,20,20]', 100.00, 75.00, 'Passed', '2026-09-26', 'Auto-checked: 5/5 correct.', '2026-09-25 12:03:44', '2026-09-25 12:03:44'),
(16, 71, NULL, 'Guest Relations Officer � Job Knowledge Test', '[{\"question\":\"Handle Electrical Issue Promptly \\u2014 You have checked in a guest to their assigned room. The guest has settled in and uses an electric appliance, which causes a spark, and the electricity trips on the entire floor. What would you do?\",\"points\":20},{\"question\":\"Handle Guest Complaint With Care \\u2014 A guest complains at the front desk that their room was not cleaned before check-in, even though the system shows it as inspected. The guest is upset and other guests are waiting in line. What would you do?\",\"points\":20},{\"question\":\"Manage Overlapping Reservations \\u2014 Two guests arrive at the same time claiming the same reservation. The book shows one entry clearly, but the other guest insists they booked by phone. Both are impatient. What would you do?\",\"points\":20},{\"question\":\"Handle a Fully Booked Night \\u2014 A guest with a confirmed reservation arrives, but the hotel is fully booked due to an earlier system error. The guest is tired after a long trip. What would you do?\",\"points\":20},{\"question\":\"Support the Team During Rush Hour \\u2014 It is peak check-in time, the lobby is full, and a co-worker at the next counter is struggling with a difficult transaction while your own line is moving smoothly. What would you do?\",\"points\":20}]', '[20,20,20,20,20]', 100.00, 75.00, 'Passed', '2026-09-26', 'Auto-checked: 5/5 correct.', '2026-09-25 12:03:47', '2026-09-25 12:03:47'),
(17, 71, NULL, 'Guest Relations Officer � Job Knowledge Test', '[{\"question\":\"Handle Electrical Issue Promptly \\u2014 You have checked in a guest to their assigned room. The guest has settled in and uses an electric appliance, which causes a spark, and the electricity trips on the entire floor. What would you do?\",\"points\":20},{\"question\":\"Handle Guest Complaint With Care \\u2014 A guest complains at the front desk that their room was not cleaned before check-in, even though the system shows it as inspected. The guest is upset and other guests are waiting in line. What would you do?\",\"points\":20},{\"question\":\"Manage Overlapping Reservations \\u2014 Two guests arrive at the same time claiming the same reservation. The book shows one entry clearly, but the other guest insists they booked by phone. Both are impatient. What would you do?\",\"points\":20},{\"question\":\"Handle a Fully Booked Night \\u2014 A guest with a confirmed reservation arrives, but the hotel is fully booked due to an earlier system error. The guest is tired after a long trip. What would you do?\",\"points\":20},{\"question\":\"Support the Team During Rush Hour \\u2014 It is peak check-in time, the lobby is full, and a co-worker at the next counter is struggling with a difficult transaction while your own line is moving smoothly. What would you do?\",\"points\":20}]', '[20,20,20,20,20]', 100.00, 75.00, 'Passed', '2026-09-26', 'Auto-checked: 5/5 correct.', '2026-09-25 12:03:50', '2026-09-25 12:03:50'),
(18, 71, NULL, 'Guest Relations Officer � Job Knowledge Test', '[{\"question\":\"Handle Electrical Issue Promptly \\u2014 You have checked in a guest to their assigned room. The guest has settled in and uses an electric appliance, which causes a spark, and the electricity trips on the entire floor. What would you do?\",\"points\":20},{\"question\":\"Handle Guest Complaint With Care \\u2014 A guest complains at the front desk that their room was not cleaned before check-in, even though the system shows it as inspected. The guest is upset and other guests are waiting in line. What would you do?\",\"points\":20},{\"question\":\"Manage Overlapping Reservations \\u2014 Two guests arrive at the same time claiming the same reservation. The book shows one entry clearly, but the other guest insists they booked by phone. Both are impatient. What would you do?\",\"points\":20},{\"question\":\"Handle a Fully Booked Night \\u2014 A guest with a confirmed reservation arrives, but the hotel is fully booked due to an earlier system error. The guest is tired after a long trip. What would you do?\",\"points\":20},{\"question\":\"Support the Team During Rush Hour \\u2014 It is peak check-in time, the lobby is full, and a co-worker at the next counter is struggling with a difficult transaction while your own line is moving smoothly. What would you do?\",\"points\":20}]', '[20,20,20,20,20]', 100.00, 75.00, 'Passed', '2026-09-26', 'Auto-checked: 5/5 correct.', '2026-09-25 12:03:50', '2026-09-25 12:03:50'),
(19, 71, NULL, 'Guest Relations Officer � Job Knowledge Test', '[{\"question\":\"Handle Electrical Issue Promptly \\u2014 You have checked in a guest to their assigned room. The guest has settled in and uses an electric appliance, which causes a spark, and the electricity trips on the entire floor. What would you do?\",\"points\":20},{\"question\":\"Handle Guest Complaint With Care \\u2014 A guest complains at the front desk that their room was not cleaned before check-in, even though the system shows it as inspected. The guest is upset and other guests are waiting in line. What would you do?\",\"points\":20},{\"question\":\"Manage Overlapping Reservations \\u2014 Two guests arrive at the same time claiming the same reservation. The book shows one entry clearly, but the other guest insists they booked by phone. Both are impatient. What would you do?\",\"points\":20},{\"question\":\"Handle a Fully Booked Night \\u2014 A guest with a confirmed reservation arrives, but the hotel is fully booked due to an earlier system error. The guest is tired after a long trip. What would you do?\",\"points\":20},{\"question\":\"Support the Team During Rush Hour \\u2014 It is peak check-in time, the lobby is full, and a co-worker at the next counter is struggling with a difficult transaction while your own line is moving smoothly. What would you do?\",\"points\":20}]', '[20,20,20,20,20]', 100.00, 75.00, 'Passed', '2026-09-26', 'Auto-checked: 5/5 correct.', '2026-09-25 12:03:54', '2026-09-25 12:03:54');

-- --------------------------------------------------------

--
-- Table structure for table `attendance_records`
--

CREATE TABLE IF NOT EXISTS `attendance_records` (
`attendance_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
`employee_id` bigint(20) UNSIGNED NOT NULL,
`work_date` date NOT NULL,
`time_in` timestamp NULL DEFAULT NULL,
`time_out` timestamp NULL DEFAULT NULL,
`break_in` timestamp NULL DEFAULT NULL,
`break_out` timestamp NULL DEFAULT NULL,
`hours_worked` decimal(7,2) NOT NULL DEFAULT 0.00,
`late_minutes` int(11) NOT NULL DEFAULT 0,
`undertime_minutes` int(11) NOT NULL DEFAULT 0,
`overtime_hours` decimal(7,2) NOT NULL DEFAULT 0.00,
`remark` varchar(255) DEFAULT NULL,
`status` varchar(30) DEFAULT NULL,
`created_at` timestamp NOT NULL DEFAULT current_timestamp(),
`updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
PRIMARY KEY (`attendance_id`),
UNIQUE KEY `uq_attendance_records_natural` (`employee_id`,`work_date`),
KEY `idx_attendance_records_work_date` (`work_date`)

== practical_tests ==

`practical_test_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
`applicant_id` bigint(20) UNSIGNED NOT NULL,
`assessor_user_id` bigint(20) UNSIGNED DEFAULT NULL,
`task_title` varchar(190) NOT NULL,
`criteria_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`criteria_json`)),
`scores_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`scores_json`)),
`total_score` decimal(5,2) DEFAULT NULL,
`result` varchar(10) NOT NULL,
`test_date` date NOT NULL,
`remarks` text DEFAULT NULL,
`created_at` timestamp NOT NULL DEFAULT current_timestamp(),
`updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
PRIMARY KEY (`practical_test_id`),
KEY `idx_practical_tests_applicant_id` (`applicant_id`),
KEY `idx_practical_tests_assessor_user_id` (`assessor_user_id`),
KEY `idx_practical_tests_test_date` (`test_date`)
) ;

--
-- Dumping data for table `practical_tests`
--

INSERT INTO `practical_tests` (`practical_test_id`, `applicant_id`, `assessor_user_id`, `task_title`, `criteria_json`, `scores_json`, `total_score`, `result`, `test_date`, `remarks`, `created_at`, `updated_at`) VALUES
(1, 29, 18, 'Bartender � Practical Demonstration', '[{\"criterion\":\"Task Execution & Accuracy\",\"max_points\":5,\"comment\":null},{\"criterion\":\"Position-Specific Skill\",\"max_points\":5,\"comment\":null},{\"criterion\":\"Work Standards & Procedures\",\"max_points\":5,\"comment\":null},{\"criterion\":\"Time Management\",\"max_points\":5,\"comment\":null}]', '[4,4,4,4]', 80.00, 'Passed', '2026-09-23', NULL, '2026-09-22 09:44:48', '2026-09-22 09:44:48'),
(2, 29, 18, 'Bartender � Practical Demonstration', '[{\"criterion\":\"Task Execution & Accuracy\",\"max_points\":5,\"comment\":null},{\"criterion\":\"Position-Specific Skill\",\"max_points\":5,\"comment\":null},{\"criterion\":\"Work Standards & Procedures\",\"max_points\":5,\"comment\":null},{\"criterion\":\"Time Management\",\"max_points\":5,\"comment\":null}]', '[4,4,4,4]', 80.00, 'Passed', '2026-09-23', NULL, '2026-09-22 09:44:55', '2026-09-22 09:44:55'),
(3, 29, 18, 'Bartender � Practical Demonstration', '[{\"criterion\":\"Task Execution & Accuracy\",\"max_points\":5,\"comment\":null},{\"criterion\":\"Position-Specific Skill\",\"max_points\":5,\"comment\":null},{\"criterion\":\"Work Standards & Procedures\",\"max_points\":5,\"comment\":null},{\"criterion\":\"Time Management\",\"max_points\":5,\"comment\":null}]', '[4,4,4,4]', 80.00, 'Passed', '2026-09-23', NULL, '2026-09-22 09:45:03', '2026-09-22 09:45:03');

-- --------------------------------------------------------

--
-- Table structure for table `promotion_requests`
--

CREATE TABLE IF NOT EXISTS `promotion_requests` (
`promotion_request_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
`employee_id` bigint(20) UNSIGNED NOT NULL,
`current_position_id` bigint(20) UNSIGNED DEFAULT NULL,
`requested_position_id` bigint(20) UNSIGNED DEFAULT NULL,
`requested_salary_grade_id` bigint(20) UNSIGNED DEFAULT NULL,
`justification` text NOT NULL,
`status` varchar(30) NOT NULL DEFAULT 'Pending',
`reviewed_by` bigint(20) UNSIGNED DEFAULT NULL,
`reviewed_at` timestamp NULL DEFAULT NULL,
`review_notes` text DEFAULT NULL,
`created_at` timestamp NOT NULL DEFAULT current_timestamp(),
`updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
PRIMARY KEY (`promotion_request_id`),
KEY `idx_promo_req_employee` (`employee_id`),
KEY `idx_promo_req_status` (`status`)
) ;

-- --------------------------------------------------------

--
-- Table structure for table `recognition_reactions`
--

CREATE TABLE IF NOT EXISTS `recognition_reactions` (
`reaction_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
`recognition_id` bigint(20) UNSIGNED NOT NULL,
`employee_id` bigint(20) UNSIGNED DEFAULT NULL,
`reaction_type` varchar(50) NOT NULL,
`created_at` timestamp NULL DEFAULT NULL,
`updated_at` timestamp NULL DEFAULT NULL,
PRIMARY KEY (`reaction_id`),
UNIQUE KEY `rec_emp_react_unique` (`recognition_id`,`employee_id`,`reaction_type`),
KEY `recognition_reactions_employee_id_foreign` (`employee_id`)

== final_evaluations ==

`final_evaluation_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
`applicant_id` bigint(20) UNSIGNED NOT NULL,
`evaluated_by_user_id` bigint(20) UNSIGNED DEFAULT NULL,
`evaluation_date` date NOT NULL,
`screening_score` decimal(5,2) DEFAULT NULL,
`screening_status` varchar(40) DEFAULT NULL,
`interview_score` decimal(5,2) DEFAULT NULL,
`interview_result` varchar(10) DEFAULT NULL,
`assessment_test_score` decimal(5,2) DEFAULT NULL,
`assessment_test_result` varchar(10) DEFAULT NULL,
`practical_required` tinyint(1) NOT NULL DEFAULT 0,
`practical_test_score` decimal(5,2) DEFAULT NULL,
`practical_test_result` varchar(10) DEFAULT NULL,
`recommendation` varchar(30) NOT NULL,
`overall_remarks` text DEFAULT NULL,
`created_at` timestamp NOT NULL DEFAULT current_timestamp(),
`updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
PRIMARY KEY (`final_evaluation_id`),
UNIQUE KEY `uq_final_evaluations_applicant_id` (`applicant_id`),
KEY `idx_final_evaluations_evaluated_by` (`evaluated_by_user_id`),
KEY `idx_final_evaluations_evaluation_date` (`evaluation_date`)
) ;

--
-- Dumping data for table `final_evaluations`
--

INSERT INTO `final_evaluations` (`final_evaluation_id`, `applicant_id`, `evaluated_by_user_id`, `evaluation_date`, `screening_score`, `screening_status`, `interview_score`, `interview_result`, `assessment_test_score`, `assessment_test_result`, `practical_required`, `practical_test_score`, `practical_test_result`, `recommendation`, `overall_remarks`, `created_at`, `updated_at`) VALUES
(1, 36, 11, '2026-09-06', 83.20, 'other-role', 80.00, 'Passed', 100.00, 'Passed', 0, NULL, NULL, 'Recommended for Hire', NULL, '2026-09-05 09:01:40', '2026-09-05 09:01:40'),
(2, 32, 3, '2026-09-06', 62.00, 'not-fit', 80.00, 'Passed', 100.00, 'Passed', 0, NULL, NULL, 'Recommended for Hire', NULL, '2026-09-05 16:23:56', '2026-09-05 16:23:56'),
(4, 72, NULL, '2026-09-06', 88.80, 'fit', 80.00, 'Passed', 100.00, 'Passed', 0, NULL, NULL, 'For Another Position', NULL, '2026-09-05 17:34:46', '2026-09-05 17:34:46'),
(5, 43, 2, '2026-09-15', 57.60, 'not-fit', 80.00, 'Passed', 100.00, 'Passed', 0, NULL, NULL, 'Recommended for Hire', 'gggg', '2026-09-15 00:02:19', '2026-09-15 00:02:19'),
(6, 41, NULL, '2026-09-15', 83.20, 'not-fit', 80.00, 'Passed', 100.00, 'Passed', 0, NULL, NULL, 'Recommended for Hire', NULL, '2026-09-15 01:29:50', '2026-09-15 01:29:50'),
(7, 53, NULL, '2026-09-15', 79.00, 'other-role', 80.00, 'Passed', 100.00, 'Passed', 0, NULL, NULL, 'Recommended for Hire', NULL, '2026-09-15 01:32:41', '2026-09-15 01:32:41'),
(9, 75, NULL, '2026-09-21', 83.80, 'fit', 80.00, 'Passed', 100.00, 'Passed', 0, NULL, NULL, 'Recommended for Hire', NULL, '2026-09-21 05:43:01', '2026-09-21 05:43:01'),
(10, 81, 3, '2026-09-23', 77.60, 'not-fit', 80.00, 'Passed', 100.00, 'Passed', 0, NULL, NULL, 'Recommended for Hire', NULL, '2026-09-22 09:31:14', '2026-09-22 09:31:14');

-- --------------------------------------------------------

--
-- Table structure for table `hr3_recommendations`
--

CREATE TABLE IF NOT EXISTS `hr3_recommendations` (
`recommendation_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
`employee_id` bigint(20) UNSIGNED NOT NULL,
`recommendation_type` varchar(40) NOT NULL,
`evaluation_score` decimal(5,2) DEFAULT NULL,
`evaluator_user_id` bigint(20) UNSIGNED DEFAULT NULL,
`date_submitted` date NOT NULL,
`status` varchar(40) NOT NULL,
`suggested_position_id` bigint(20) UNSIGNED DEFAULT NULL,
`suggested_salary_grade_id` bigint(20) UNSIGNED DEFAULT NULL,
`current_employment_type` varchar(30) DEFAULT NULL,
`comments` text DEFAULT NULL,
`created_at` timestamp NOT NULL DEFAULT current_timestamp(),
`updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
PRIMARY KEY (`recommendation_id`),
KEY `idx_hr3_recommendations_employee_id` (`employee_id`),
KEY `idx_hr3_recommendations_evaluator_user_id` (`evaluator_user_id`),
KEY `idx_hr3_recommendations_suggested_position_id` (`suggested_position_id`),
KEY `idx_hr3_recommendations_suggested_salary_grade_id` (`suggested_salary_grade_id`)

== facilities ==

`facility_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
`name` varchar(120) NOT NULL,
`type` varchar(20) NOT NULL,
`location` varchar(190) DEFAULT NULL,
`capacity` int(10) UNSIGNED NOT NULL DEFAULT 1,
`icon` varchar(60) DEFAULT NULL,
`description` text DEFAULT NULL,
`is_active` tinyint(1) NOT NULL DEFAULT 1,
`created_at` timestamp NOT NULL DEFAULT current_timestamp(),
`updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
PRIMARY KEY (`facility_id`),
UNIQUE KEY `facilities_name_unique` (`name`),
KEY `idx_facilities_type` (`type`),
KEY `idx_facilities_is_active` (`is_active`)
) ;

--
-- Dumping data for table `facilities`
--

INSERT INTO `facilities` (`facility_id`, `name`, `type`, `location`, `capacity`, `icon`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Room 1', 'On-site', 'Oxford Suites Makati, HR Office, 3rd Floor', 1, 'room', 'Primary on-site interview room with guest-facing setup.', 1, '2026-09-05 02:49:50', '2026-09-05 02:49:50'),
(2, 'Room 2', 'On-site', 'Oxford Suites Makati, HR Office, 3rd Floor', 1, 'room', 'Secondary on-site interview room for panel interviews.', 1, '2026-09-05 02:49:50', '2026-09-05 02:49:50'),
(3, 'Room 3', 'On-site', 'Oxford Suites Makati, HR Office, 3rd Floor', 2, 'room', 'Practical demonstration room for hands-on assessments.', 1, '2026-09-05 02:49:50', '2026-09-05 02:49:50'),
(4, 'Online Interview', 'Virtual', 'meet.oxfordsuites.ph/interview-room', 5, 'online', 'Virtual interview room hosted on the company meeting platform.', 1, '2026-09-05 02:49:50', '2026-09-05 02:49:50');

-- --------------------------------------------------------

--
-- Table structure for table `final_evaluations`
--

CREATE TABLE IF NOT EXISTS `final_evaluations` (
`final_evaluation_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
`applicant_id` bigint(20) UNSIGNED NOT NULL,
`evaluated_by_user_id` bigint(20) UNSIGNED DEFAULT NULL,
`evaluation_date` date NOT NULL,
`screening_score` decimal(5,2) DEFAULT NULL,
`screening_status` varchar(40) DEFAULT NULL,
`interview_score` decimal(5,2) DEFAULT NULL,
`interview_result` varchar(10) DEFAULT NULL,
`assessment_test_score` decimal(5,2) DEFAULT NULL,
`assessment_test_result` varchar(10) DEFAULT NULL,
`practical_required` tinyint(1) NOT NULL DEFAULT 0,
`practical_test_score` decimal(5,2) DEFAULT NULL,
`practical_test_result` varchar(10) DEFAULT NULL,
`recommendation` varchar(30) NOT NULL,
`overall_remarks` text DEFAULT NULL,
`created_at` timestamp NOT NULL DEFAULT current_timestamp(),
`updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
PRIMARY KEY (`final_evaluation_id`),
UNIQUE KEY `uq_final_evaluations_applicant_id` (`applicant_id`),
KEY `idx_final_evaluations_evaluated_by` (`evaluated_by_user_id`),
KEY `idx_final_evaluations_evaluation_date` (`evaluation_date`)
) ;

--
-- Dumping data for table `final_evaluations`
--

INSERT INTO `final_evaluations` (`final_evaluation_id`, `applicant_id`, `evaluated_by_user_id`, `evaluation_date`, `screening_score`, `screening_status`, `interview_score`, `interview_result`, `assessment_test_score`, `assessment_test_result`, `practical_required`, `practical_test_score`, `practical_test_result`, `recommendation`, `overall_remarks`, `created_at`, `updated_at`) VALUES
(1, 36, 11, '2026-09-06', 83.20, 'other-role', 80.00, 'Passed', 100.00, 'Passed', 0, NULL, NULL, 'Recommended for Hire', NULL, '2026-09-05 09:01:40', '2026-09-05 09:01:40'),
(2, 32, 3, '2026-09-06', 62.00, 'not-fit', 80.00, 'Passed', 100.00, 'Passed', 0, NULL, NULL, 'Recommended for Hire', NULL, '2026-09-05 16:23:56', '2026-09-05 16:23:56'),
(4, 72, NULL, '2026-09-06', 88.80, 'fit', 80.00, 'Passed', 100.00, 'Passed', 0, NULL, NULL, 'For Another Position', NULL, '2026-09-05 17:34:46', '2026-09-05 17:34:46'),
(5, 43, 2, '2026-09-15', 57.60, 'not-fit', 80.00, 'Passed', 100.00, 'Passed', 0, NULL, NULL, 'Recommended for Hire', 'gggg', '2026-09-15 00:02:19', '2026-09-15 00:02:19'),
(6, 41, NULL, '2026-09-15', 83.20, 'not-fit', 80.00, 'Passed', 100.00, 'Passed', 0, NULL, NULL, 'Recommended for Hire', NULL, '2026-09-15 01:29:50', '2026-09-15 01:29:50'),
(7, 53, NULL, '2026-09-15', 79.00, 'other-role', 80.00, 'Passed', 100.00, 'Passed', 0, NULL, NULL, 'Recommended for Hire', NULL, '2026-09-15 01:32:41', '2026-09-15 01:32:41'),
(9, 75, NULL, '2026-09-21', 83.80, 'fit', 80.00, 'Passed', 100.00, 'Passed', 0, NULL, NULL, 'Recommended for Hire', NULL, '2026-09-21 05:43:01', '2026-09-21 05:43:01'),
(10, 81, 3, '2026-09-23', 77.60, 'not-fit', 80.00, 'Passed', 100.00, 'Passed', 0, NULL, NULL, 'Recommended for Hire', NULL, '2026-09-22 09:31:14', '2026-09-22 09:31:14');

-- --------------------------------------------------------

--
-- Table structure for table `hr3_recommendations`
--

CREATE TABLE IF NOT EXISTS `hr3_recommendations` (
`recommendation_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
`employee_id` bigint(20) UNSIGNED NOT NULL,
`recommendation_type` varchar(40) NOT NULL,
`evaluation_score` decimal(5,2) DEFAULT NULL,
`evaluator_user_id` bigint(20) UNSIGNED DEFAULT NULL,
`date_submitted` date NOT NULL,
`status` varchar(40) NOT NULL,
`suggested_position_id` bigint(20) UNSIGNED DEFAULT NULL,
`suggested_salary_grade_id` bigint(20) UNSIGNED DEFAULT NULL,
`current_employment_type` varchar(30) DEFAULT NULL,
`comments` text DEFAULT NULL,
`created_at` timestamp NOT NULL DEFAULT current_timestamp(),
`updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
PRIMARY KEY (`recommendation_id`),
KEY `idx_hr3_recommendations_employee_id` (`employee_id`),
KEY `idx_hr3_recommendations_evaluator_user_id` (`evaluator_user_id`),
KEY `idx_hr3_recommendations_suggested_position_id` (`suggested_position_id`),
KEY `idx_hr3_recommendations_suggested_salary_grade_id` (`suggested_salary_grade_id`)

== job_post_platforms ==

`job_post_platform_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
`job_post_id` bigint(20) UNSIGNED NOT NULL,
`platform` varchar(60) NOT NULL,
`published_at` timestamp NULL DEFAULT NULL,
`status` varchar(20) NOT NULL DEFAULT 'published',
`created_at` timestamp NOT NULL DEFAULT current_timestamp(),
PRIMARY KEY (`job_post_platform_id`),
UNIQUE KEY `uq_job_post_platforms_natural` (`job_post_id`,`platform`)

== job_posts ==

`job_post_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
`slug` varchar(120) NOT NULL,
`title` varchar(150) NOT NULL,
`department_id` bigint(20) UNSIGNED NOT NULL,
`position_id` bigint(20) UNSIGNED NOT NULL,
`employment_type` varchar(30) NOT NULL,
`schedule` varchar(120) DEFAULT NULL,
`salary_min` decimal(12,2) DEFAULT NULL,
`salary_max` decimal(12,2) DEFAULT NULL,
`vacancies` int(11) NOT NULL DEFAULT 1,
`filled_count` int(11) NOT NULL DEFAULT 0,
`posted_date` date DEFAULT NULL,
`status` varchar(20) NOT NULL,
`requires_practical` tinyint(1) NOT NULL DEFAULT 0,
`active` tinyint(1) NOT NULL DEFAULT 1,
`experience_level` varchar(50) DEFAULT NULL,
`education_level` varchar(100) DEFAULT NULL,
`summary` text DEFAULT NULL,
`description` text DEFAULT NULL,
`responsibilities_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`responsibilities_json`)),
`qualifications_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`qualifications_json`)),
`skills_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`skills_json`)),
`picture` varchar(255) DEFAULT NULL,
`created_at` timestamp NOT NULL DEFAULT current_timestamp(),
`updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
PRIMARY KEY (`job_post_id`),
UNIQUE KEY `uq_job_posts_slug` (`slug`),
KEY `fk_job_posts_department_id` (`department_id`),
KEY `fk_job_posts_position_id` (`position_id`)

== interviews ==

`interview_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
`interview_code` varchar(40) NOT NULL,
`applicant_id` bigint(20) UNSIGNED NOT NULL,
`scheduled_date` date NOT NULL,
`scheduled_time` time NOT NULL,
`mode` varchar(20) NOT NULL,
`facility_id` bigint(20) UNSIGNED DEFAULT NULL,
`facility_status` varchar(40) DEFAULT 'Not Required',
`interviewer_employee_id` bigint(20) UNSIGNED DEFAULT NULL,
`interviewer_name` varchar(160) DEFAULT NULL,
`status` varchar(20) NOT NULL,
`created_at` timestamp NOT NULL DEFAULT current_timestamp(),
`updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
PRIMARY KEY (`interview_id`),
UNIQUE KEY `uq_interviews_interview_code` (`interview_code`),
KEY `fk_interviews_applicant_id` (`applicant_id`),
KEY `fk_interviews_interviewer_employee_id` (`interviewer_employee_id`),
KEY `idx_interviews_facility_id` (`facility_id`)
) ;

--
-- Dumping data for table `interviews`
--

INSERT INTO `interviews` (`interview_id`, `interview_code`, `applicant_id`, `scheduled_date`, `scheduled_time`, `mode`, `facility_id`, `facility_status`, `interviewer_employee_id`, `interviewer_name`, `status`, `created_at`, `updated_at`) VALUES
(1, 'INT-201', 10, '2026-09-02', '09:00:00', 'On-site', NULL, 'Not Required', 1, 'Ana Ramos', 'Scheduled', '2026-08-17 00:31:34', '2026-09-02 00:03:52'),
(3, 'INT-203', 4, '2026-07-29', '16:00:00', 'On-site', NULL, 'Not Required', 2, 'Chef Gabriel Mendoza', 'Scheduled', '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(4, 'INT-204', 5, '2026-07-30', '10:00:00', 'On-site', NULL, 'Not Required', 2, 'Chef Gabriel Mendoza', 'Completed', '2026-08-17 00:31:34', '2026-08-17 00:31:34'),
(5, 'INT-205', 9, '2026-08-17', '08:00:00', 'On-site', NULL, 'Not Required', 1, 'Chef Gabriel Mendoza', 'Scheduled', '2026-08-17 00:31:34', '2026-08-16 22:28:41'),
(12, 'INT-00207', 16, '2026-08-18', '08:00:00', 'On-site', NULL, 'Not Required', NULL, 'Ana Ramos', 'Scheduled', '2026-08-18 04:03:48', '2026-08-18 04:03:48'),
(13, 'INT-00208', 15, '2026-09-01', '08:00:00', 'On-site', NULL, 'Not Required', NULL, 'Ana Ramos', 'Scheduled', '2026-08-18 04:04:08', '2026-08-31 13:34:06'),
(14, 'INT-00209', 18, '2026-08-19', '08:00:00', 'On-site', NULL, 'Not Required', NULL, 'Chef Gabriel Mendoza', 'Scheduled', '2026-08-18 05:40:08', '2026-08-18 10:46:32'),
(15, 'INT-00210', 17, '2026-09-01', '08:00:00', 'On-site', NULL, 'Not Required', NULL, 'Ana Ramos', 'Cancelled', '2026-08-18 05:41:23', '2026-08-31 16:09:06'),
(16, 'INT-00211', 19, '2026-08-19', '08:00:00', 'On-site', NULL, 'Not Required', NULL, 'Ana Ramos', 'Scheduled', '2026-08-18 08:17:21', '2026-08-18 08:17:45'),
(18, 'INT-00212', 22, '2026-08-19', '08:00:00', 'On-site', NULL, 'Not Required', NULL, 'Ana Ramos', 'Scheduled', '2026-08-18 08:42:14', '2026-08-18 08:42:57'),
(20, 'INT-00214', 24, '2026-08-19', '08:00:00', 'On-site', NULL, 'Not Required', NULL, 'Ana Ramos', 'Scheduled', '2026-08-18 10:47:34', '2026-08-18 10:47:34'),
(22, 'INT-00215', 53, '2026-09-15', '17:31:00', 'On-site', NULL, 'Not Required', NULL, 'Juan Dela Cruz', 'Completed', '2026-08-31 11:33:56', '2026-09-15 01:31:50'),
(26, 'INT-00216', 46, '2026-09-04', '08:00:00', 'On-site', NULL, 'Not Required', NULL, 'Ana Ramos', 'Scheduled', '2026-08-31 12:45:05', '2026-09-03 10:04:57'),
(27, 'INT-00217', 55, '2026-09-01', '08:00:00', 'On-site', NULL, 'Not Required', NULL, 'Ana Ramos', 'Scheduled', '2026-08-31 12:57:21', '2026-08-31 12:57:21'),
(30, 'INT-00220', 60, '2026-09-06', '08:00:00', 'On-site', NULL, 'Not Required', NULL, 'Ana Ramos', 'Scheduled', '2026-09-03 10:31:34', '2026-09-05 12:40:01'),
(32, 'INT-00222', 47, '2026-09-06', '08:00:00', 'On-site', NULL, 'Not Required', NULL, 'Ana Ramos', 'Scheduled', '2026-09-05 08:56:36', '2026-09-05 08:56:36'),
(33, 'INT-00223', 36, '2026-09-06', '08:00:00', 'On-site', 1, 'Facility Approved', NULL, 'Chef Gabriel Mendoza', 'Scheduled', '2026-09-05 08:58:54', '2026-09-05 08:59:01'),
(34, 'INT-00224', 32, '2026-09-06', '08:00:00', 'On-site', 1, 'Facility Approved', NULL, 'Juan Dela Cruz', 'Scheduled', '2026-09-05 11:46:28', '2026-09-05 11:46:36'),
(37, 'INT-00225', 75, '2026-09-06', '08:00:00', 'On-site', 1, 'Facility Approved', NULL, 'Ana Ramos', 'Scheduled', '2026-09-05 17:30:54', '2026-09-05 17:31:02'),
(38, 'INT-00226', 72, '2026-09-06', '08:00:00', 'On-site', 3, 'Facility Approved', NULL, 'Ana Ramos', 'Scheduled', '2026-09-05 17:32:57', '2026-09-05 17:33:05'),
(39, 'INT-00227', 29, '2026-09-13', '08:00:00', 'On-site', 2, 'Facility Approved', NULL, 'Chef Gabriel Mendoza', 'Scheduled', '2026-09-13 00:38:49', '2026-09-13 00:38:59'),
(40, 'INT-00228', 43, '2026-09-15', '08:00:00', 'On-site', 1, 'Facility Approved', NULL, 'Ana Ramos', 'Scheduled', '2026-09-15 00:00:27', '2026-09-15 00:00:34'),
(41, 'INT-00229', 41, '2026-09-15', '08:00:00', 'On-site', 2, 'Facility Approved', NULL, 'Ana Ramos', 'Scheduled', '2026-09-15 00:56:49', '2026-09-15 00:56:57'),
(42, 'INT-00230', 81, '2026-09-21', '20:40:00', 'On-site', 2, 'Facility Approved', NULL, 'Ana Ramos', 'Completed', '2026-09-15 02:51:31', '2026-09-21 04:40:38'),
(43, 'INT-00231', 78, '2026-09-15', '10:00:00', 'On-site', 1, 'Facility Approved', NULL, 'Lourdes Bautista', 'Scheduled', '2026-09-15 06:41:46', '2026-09-15 06:41:54'),
(44, 'INT-00232', 79, '2026-09-06', '10:00:00', 'On-site', 1, 'Facility Approved', NULL, 'Lourdes Bautista', 'Scheduled', '2026-09-15 06:43:17', '2026-09-15 06:43:24'),
(46, 'INT-00233', 71, '2026-09-26', '04:03:00', 'On-site', 1, 'Facility Approved', NULL, 'Ana Ramos', 'Completed', '2026-09-25 12:02:44', '2026-09-25 12:03:13');

-- --------------------------------------------------------

--
-- Table structure for table `job_posts`
--

CREATE TABLE IF NOT EXISTS `job_posts` (
`job_post_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
`slug` varchar(120) NOT NULL,
`title` varchar(150) NOT NULL,
`department_id` bigint(20) UNSIGNED NOT NULL,
`position_id` bigint(20) UNSIGNED NOT NULL,
`employment_type` varchar(30) NOT NULL,
`schedule` varchar(120) DEFAULT NULL,
`salary_min` decimal(12,2) DEFAULT NULL,
`salary_max` decimal(12,2) DEFAULT NULL,
`vacancies` int(11) NOT NULL DEFAULT 1,
`filled_count` int(11) NOT NULL DEFAULT 0,
`posted_date` date DEFAULT NULL,
`status` varchar(20) NOT NULL,
`requires_practical` tinyint(1) NOT NULL DEFAULT 0,
`active` tinyint(1) NOT NULL DEFAULT 1,
`experience_level` varchar(50) DEFAULT NULL,
`education_level` varchar(100) DEFAULT NULL,
`summary` text DEFAULT NULL,
`description` text DEFAULT NULL,
`responsibilities_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`responsibilities_json`)),
`qualifications_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`qualifications_json`)),
`skills_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`skills_json`)),
`picture` varchar(255) DEFAULT NULL,
`created_at` timestamp NOT NULL DEFAULT current_timestamp(),
`updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
PRIMARY KEY (`job_post_id`),
UNIQUE KEY `uq_job_posts_slug` (`slug`),
KEY `fk_job_posts_department_id` (`department_id`),
KEY `fk_job_posts_position_id` (`position_id`)


```

---

## Assistant (Build · Muse Spark 1.3 Free · 7.8s)

_Thinking:_



**Tool: bash**

**Input:**
```json
{
  "command": "Get-ChildItem -LiteralPath \"backend-laravel\\Modules\\ApplicantManagement\\database\\migrations\", \"backend-laravel\\Modules\\RecruitmentManagement\\database\\migrations\" | Select-Object -ExpandProperty Name | Sort-Object",
  "workdir": "C:\\Users\\Windows 10 Lite\\Downloads\\MUNJOR\\4TH YR\\DEV\\LATEST CLONE\\v14\\2nd-repo-for-hrms-backend-"
}
```

**Output:**
```
.gitkeep
.gitkeep
2025_01_01_000001_create_job_posts_table.php
2025_01_01_000002_create_job_post_platforms_table.php
2025_01_01_000003_create_requisitions_table.php
2025_01_01_000004_make_job_posts_position_required.php
2025_01_02_000001_create_applicants_table.php
2025_01_02_000002_create_applicant_screening_entities_table.php
2025_01_02_000003_create_applicant_screening_scores_table.php
2025_01_02_000004_create_interviews_table.php
2025_01_02_000005_create_applicant_assessments_table.php
2026_08_16_000001_add_picture_to_job_posts_table.php
2026_08_16_000004_add_accepted_to_applicants_stage_check.php
2026_08_23_000001_create_applicant_screenings_table.php
2026_08_23_000002_create_screening_ground_truths_table.php
2026_08_24_000001_create_screening_reference_data_table.php
2026_08_27_000001_add_resume_original_name_to_applicants_table.php
2026_08_29_000001_remove_benefits_from_job_posts_table.php
2026_09_04_000001_add_resume_hash_to_applicants_table.php
2026_09_05_000001_add_requires_practical_to_job_posts_table.php
2026_09_05_000001_create_facilities_table.php
2026_09_05_000002_add_facility_to_interviews_table.php
2026_09_05_000003_extend_applicant_assessments_table.php
2026_09_05_000004_create_assessment_tests_table.php
2026_09_05_000005_create_practical_tests_table.php
2026_09_05_000006_create_final_evaluations_table.php
2026_09_05_000007_create_applicant_documents_table.php
2026_09_05_000008_extend_applicants_stage_check.php
2026_09_07_000001_add_verification_to_applicant_documents_table.php
2026_09_23_000001_add_document_verification_to_applicant_screenings_table.php
2026_09_26_000001_create_screening_requirement_templates_table.php
2026_10_03_000001_create_assessment_invites_table.php

```

---

## Assistant (Build · Muse Spark 1.3 Free · 11.1s)

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Windows 10 Lite\\Downloads\\MUNJOR\\4TH YR\\DEV\\LATEST CLONE\\v14\\2nd-repo-for-hrms-backend-\\backend-laravel\\Modules\\ApplicantManagement\\database\\migrations\\2025_01_02_000002_create_applicant_screening_entities_table.php"
}
```

**Output:**
```
<path>C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\Modules\ApplicantManagement\database\migrations\2025_01_02_000002_create_applicant_screening_entities_table.php</path>
<type>file</type>
<content>
1: <?php
2: 
3: use Illuminate\Database\Migrations\Migration;
4: use Illuminate\Database\Schema\Blueprint;
5: use Illuminate\Support\Facades\Schema;
6: 
7: return new class extends Migration
8: {
9:     public function up(): void
10:     {
11:         Schema::create('applicant_screening_entities', function (Blueprint $table) {
12:             $table->id('entity_id');
13:             $table->unsignedBigInteger('applicant_id');
14:             $table->string('label', 80);
15:             $table->text('value');
16:             $table->timestamp('created_at')->useCurrent();
17: 
18:             $table->index('applicant_id', 'idx_applicant_screening_entities_applicant_id');
19: 
20:             $table->foreign('applicant_id', 'fk_applicant_screening_entities_applicant_id')
21:                   ->references('applicant_id')->on('applicants')->onDelete('cascade');
22:         });
23:     }
24: 
25:     public function down(): void
26:     {
27:         Schema::dropIfExists('applicant_screening_entities');
28:     }
29: };

(End of file - total 29 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Windows 10 Lite\\Downloads\\MUNJOR\\4TH YR\\DEV\\LATEST CLONE\\v14\\2nd-repo-for-hrms-backend-\\backend-laravel\\Modules\\ApplicantManagement\\database\\migrations\\2025_01_02_000003_create_applicant_screening_scores_table.php"
}
```

**Output:**
```
<path>C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\Modules\ApplicantManagement\database\migrations\2025_01_02_000003_create_applicant_screening_scores_table.php</path>
<type>file</type>
<content>
1: <?php
2: 
3: use Illuminate\Database\Migrations\Migration;
4: use Illuminate\Database\Schema\Blueprint;
5: use Illuminate\Support\Facades\Schema;
6: 
7: return new class extends Migration
8: {
9:     public function up(): void
10:     {
11:         Schema::create('applicant_screening_scores', function (Blueprint $table) {
12:             $table->id('score_id');
13:             $table->unsignedBigInteger('applicant_id');
14:             $table->string('criterion', 120);
15:             $table->decimal('score', 5, 2);
16:             $table->timestamp('created_at')->useCurrent();
17: 
18:             $table->index('applicant_id', 'idx_applicant_screening_scores_applicant_id');
19: 
20:             $table->foreign('applicant_id', 'fk_applicant_screening_scores_applicant_id')
21:                   ->references('applicant_id')->on('applicants')->onDelete('cascade');
22:         });
23:     }
24: 
25:     public function down(): void
26:     {
27:         Schema::dropIfExists('applicant_screening_scores');
28:     }
29: };

(End of file - total 29 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Windows 10 Lite\\Downloads\\MUNJOR\\4TH YR\\DEV\\LATEST CLONE\\v14\\2nd-repo-for-hrms-backend-\\backend-laravel\\Modules\\ApplicantManagement\\database\\migrations\\2025_01_02_000005_create_applicant_assessments_table.php"
}
```

**Output:**
```
<path>C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\Modules\ApplicantManagement\database\migrations\2025_01_02_000005_create_applicant_assessments_table.php</path>
<type>file</type>
<content>
1: <?php
2: 
3: use Illuminate\Database\Migrations\Migration;
4: use Illuminate\Database\Schema\Blueprint;
5: use Illuminate\Support\Facades\DB;
6: use Illuminate\Support\Facades\Schema;
7: 
8: return new class extends Migration
9: {
10:     public function up(): void
11:     {
12:         Schema::create('applicant_assessments', function (Blueprint $table) {
13:             $table->id('assessment_id');
14:             $table->unsignedBigInteger('applicant_id');
15:             $table->unsignedBigInteger('assessor_user_id')->nullable();
16:             $table->date('assessment_date');
17:             $table->json('scores_json')->nullable();
18:             $table->decimal('total_score', 5, 2)->nullable();
19:             $table->string('outcome', 20);
20:             $table->text('remarks')->nullable();
21:             $table->timestamp('created_at')->useCurrent();
22:             $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
23: 
24:             $table->index('applicant_id', 'idx_applicant_assessments_applicant_id');
25:             $table->index('assessor_user_id', 'idx_applicant_assessments_assessor_user_id');
26: 
27:             $table->foreign('applicant_id', 'fk_applicant_assessments_applicant_id')
28:                   ->references('applicant_id')->on('applicants')->onDelete('cascade');
29:             $table->foreign('assessor_user_id', 'fk_applicant_assessments_assessor_user_id')
30:                   ->references('system_user_id')->on('system_users');
31:         });
32: 
33:         DB::statement("ALTER TABLE `applicant_assessments` ADD CONSTRAINT `chk_applicant_assessments_outcome` CHECK (`outcome` IN ('Recommended', 'Hold', 'Not Recommended'))");
34:     }
35: 
36:     public function down(): void
37:     {
38:         Schema::dropIfExists('applicant_assessments');
39:     }
40: };

(End of file - total 40 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Windows 10 Lite\\Downloads\\MUNJOR\\4TH YR\\DEV\\LATEST CLONE\\v14\\2nd-repo-for-hrms-backend-\\backend-laravel\\Modules\\ApplicantManagement\\database\\migrations\\2026_08_23_000001_create_applicant_screenings_table.php"
}
```

**Output:**
```
<path>C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\Modules\ApplicantManagement\database\migrations\2026_08_23_000001_create_applicant_screenings_table.php</path>
<type>file</type>
<content>
1: <?php
2: 
3: use Illuminate\Database\Migrations\Migration;
4: use Illuminate\Database\Schema\Blueprint;
5: use Illuminate\Support\Facades\Schema;
6: 
7: return new class extends Migration
8: {
9:     public function up(): void
10:     {
11:         Schema::create('applicant_screenings', function (Blueprint $table) {
12:             $table->id('screening_id');
13:             $table->unsignedBigInteger('applicant_id');
14:             $table->unsignedBigInteger('job_post_id');
15:             $table->string('processing_status', 30)->default('PENDING');
16:             $table->string('screening_result', 30)->nullable();
17:             $table->decimal('match_score', 5, 2)->nullable();
18:             $table->json('score_breakdown_json')->nullable();
19:             $table->longtext('profile_json')->nullable();
20:             $table->longtext('entities_json')->nullable();
21:             $table->longtext('missing_information_json')->nullable();
22:             $table->longtext('validation_json')->nullable();
23:             $table->longtext('alternative_job_json')->nullable();
24:             $table->longtext('reasons_json')->nullable();
25:             $table->longtext('model_info_json')->nullable();
26:             $table->text('error_message')->nullable();
27:             $table->timestamp('processed_at')->nullable();
28:             $table->timestamp('created_at')->useCurrent();
29:             $table->timestamp('updated_at')->nullable()->useCurrentOnUpdate();
30: 
31:             $table->index('applicant_id', 'idx_applicant_screenings_applicant_id');
32:             $table->index('job_post_id', 'idx_applicant_screenings_job_post_id');
33:             $table->index('processing_status', 'idx_applicant_screenings_processing_status');
34: 
35:             $table->foreign('applicant_id', 'fk_applicant_screenings_applicant_id')
36:                   ->references('applicant_id')->on('applicants')->onDelete('cascade');
37:             $table->foreign('job_post_id', 'fk_applicant_screenings_job_post_id')
38:                   ->references('job_post_id')->on('job_posts')->onDelete('cascade');
39:         });
40:     }
41: 
42:     public function down(): void
43:     {
44:         Schema::dropIfExists('applicant_screenings');
45:     }
46: };

(End of file - total 46 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Windows 10 Lite\\Downloads\\MUNJOR\\4TH YR\\DEV\\LATEST CLONE\\v14\\2nd-repo-for-hrms-backend-\\backend-laravel\\Modules\\ApplicantManagement\\database\\migrations\\2026_08_23_000002_create_screening_ground_truths_table.php"
}
```

**Output:**
```
<path>C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\Modules\ApplicantManagement\database\migrations\2026_08_23_000002_create_screening_ground_truths_table.php</path>
<type>file</type>
<content>
1: <?php
2: 
3: use Illuminate\Database\Migrations\Migration;
4: use Illuminate\Database\Schema\Blueprint;
5: use Illuminate\Support\Facades\Schema;
6: 
7: return new class extends Migration
8: {
9:     public function up(): void
10:     {
11:         Schema::create('screening_ground_truths', function (Blueprint $table) {
12:             $table->id('gt_id');
13:             $table->unsignedBigInteger('applicant_id');
14:             $table->unsignedBigInteger('job_post_id');
15:             $table->string('true_screening_result', 30);
16:             $table->decimal('true_qualification_score', 5, 2)->nullable();
17:             $table->json('true_missing_information_json')->nullable();
18:             $table->json('true_unrecognized_skills_json')->nullable();
19:             $table->text('notes')->nullable();
20:             $table->timestamp('created_at')->useCurrent();
21:             $table->timestamp('updated_at')->nullable()->useCurrentOnUpdate();
22: 
23:             $table->unique('applicant_id', 'uq_screening_ground_truths_applicant');
24: 
25:             $table->foreign('applicant_id', 'fk_screening_gt_applicant_id')
26:                   ->references('applicant_id')->on('applicants')->onDelete('cascade');
27:             $table->foreign('job_post_id', 'fk_screening_gt_job_post_id')
28:                   ->references('job_post_id')->on('job_posts')->onDelete('cascade');
29:         });
30:     }
31: 
32:     public function down(): void
33:     {
34:         Schema::dropIfExists('screening_ground_truths');
35:     }
36: };

(End of file - total 36 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Windows 10 Lite\\Downloads\\MUNJOR\\4TH YR\\DEV\\LATEST CLONE\\v14\\2nd-repo-for-hrms-backend-\\backend-laravel\\Modules\\ApplicantManagement\\database\\migrations\\2026_08_24_000001_create_screening_reference_data_table.php"
}
```

**Output:**
```
<path>C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\Modules\ApplicantManagement\database\migrations\2026_08_24_000001_create_screening_reference_data_table.php</path>
<type>file</type>
<content>
1: <?php
2: 
3: use Illuminate\Database\Migrations\Migration;
4: use Illuminate\Database\Schema\Blueprint;
5: use Illuminate\Support\Facades\Schema;
6: 
7: return new class extends Migration
8: {
9:     /**
10:      * DB-managed reference data for spaCy screening (skills, job roles,
11:      * certifications + their aliases). Replaces the bundled seed JSON files
12:      * as the single manageable source once seeded; the NLP service keeps its
13:      * bundled copy only as a resilience fallback.
14:      */
15:     public function up(): void
16:     {
17:         Schema::create('screening_reference_data', function (Blueprint $table) {
18:             $table->id('ref_id');
19:             $table->string('data_type', 20); // skill | job_role | certification
20:             $table->string('canonical_value', 150);
21:             $table->json('aliases_json')->nullable();
22:             $table->boolean('active')->default(1);
23:             $table->timestamp('created_at')->useCurrent();
24:             $table->timestamp('updated_at')->nullable()->useCurrentOnUpdate();
25: 
26:             $table->unique(['data_type', 'canonical_value'], 'uq_screening_ref_type_value');
27:             $table->index('data_type', 'idx_screening_reference_data_type');
28:         });
29:     }
30: 
31:     public function down(): void
32:     {
33:         Schema::dropIfExists('screening_reference_data');
34:     }
35: };

(End of file - total 35 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Windows 10 Lite\\Downloads\\MUNJOR\\4TH YR\\DEV\\LATEST CLONE\\v14\\2nd-repo-for-hrms-backend-\\backend-laravel\\Modules\\ApplicantManagement\\database\\migrations\\2026_09_26_000001_create_screening_requirement_templates_table.php"
}
```

**Output:**
```
<path>C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\Modules\ApplicantManagement\database\migrations\2026_09_26_000001_create_screening_requirement_templates_table.php</path>
<type>file</type>
<content>
1: <?php
2: 
3: use Illuminate\Database\Migrations\Migration;
4: use Illuminate\Database\Schema\Blueprint;
5: use Illuminate\Support\Facades\Schema;
6: 
7: return new class extends Migration
8: {
9:     /**
10:      * Requirement templates for the Screening Setup
11:      * (Recruitment Management -> Screening setup -> Requirement Templates).
12:      *
13:      * A template is scoped to a Core HCM position (the "entity" it belongs to)
14:      * and lists the requirement entities a resume must satisfy — skill,
15:      * job_role, certification, education and experience rows. Templates are
16:      * applied to a job post draft in the Job Post Builder, seeding the post's
17:      * Required Skills / Qualifications blocks plus its structured education and
18:      * experience levels (the exact fields the NLP screening scores against).
19:      */
20:     public function up(): void
21:     {
22:         Schema::create('screening_requirement_templates', function (Blueprint $table) {
23:             $table->id('template_id');
24:             $table->string('name', 150);
25:             $table->unsignedBigInteger('position_id')->nullable();
26:             $table->string('description', 500)->nullable();
27:             $table->boolean('active')->default(1);
28:             $table->timestamp('created_at')->useCurrent();
29:             $table->timestamp('updated_at')->nullable()->useCurrentOnUpdate();
30: 
31:             $table->index('position_id', 'idx_screening_req_templates_position');
32:             $table->foreign('position_id', 'fk_screening_req_templates_position')
33:                   ->references('position_id')->on('positions')
34:                   ->nullOnDelete();
35:         });
36: 
37:         Schema::create('screening_requirement_template_items', function (Blueprint $table) {
38:             $table->id('item_id');
39:             $table->unsignedBigInteger('template_id');
40:             // skill | job_role | certification | education | experience
41:             $table->string('entity_type', 20);
42:             $table->string('value', 255);
43:             $table->boolean('required')->default(1);
44:             $table->timestamp('created_at')->useCurrent();
45: 
46:             $table->unique(['template_id', 'entity_type', 'value'], 'uq_screening_req_items_value');
47:             $table->index('template_id', 'idx_screening_req_items_template');
48:             $table->foreign('template_id', 'fk_screening_req_items_template')
49:                   ->references('template_id')->on('screening_requirement_templates')
50:                   ->cascadeOnDelete();
51:         });
52:     }
53: 
54:     public function down(): void
55:     {
56:         Schema::dropIfExists('screening_requirement_template_items');
57:         Schema::dropIfExists('screening_requirement_templates');
58:     }
59: };

(End of file - total 59 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Windows 10 Lite\\Downloads\\MUNJOR\\4TH YR\\DEV\\LATEST CLONE\\v14\\2nd-repo-for-hrms-backend-\\backend-laravel\\Modules\\ApplicantManagement\\database\\migrations\\2026_09_05_000001_create_facilities_table.php"
}
```

**Output:**
```
<path>C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\Modules\ApplicantManagement\database\migrations\2026_09_05_000001_create_facilities_table.php</path>
<type>file</type>
<content>
1: <?php
2: 
3: use Illuminate\Database\Migrations\Migration;
4: use Illuminate\Database\Schema\Blueprint;
5: use Illuminate\Support\Facades\DB;
6: use Illuminate\Support\Facades\Schema;
7: 
8: return new class extends Migration
9: {
10:     /**
11:      * Interview / assessment facilities.
12:      *
13:      * Mock reference data matches the facility board used in the scheduling
14:      * reference shots: Room 1 / Room 2 / Room 3 for on-site interviews and the
15:      * "Online Interview" virtual room for video interviews.
16:      */
17:     public function up(): void
18:     {
19:         Schema::create('facilities', function (Blueprint $table) {
20:             $table->id('facility_id');
21:             $table->string('name', 120)->unique();
22:             $table->string('type', 20);                                  // On-site | Virtual
23:             $table->string('location', 190)->nullable();
24:             $table->unsignedInteger('capacity')->default(1);
25:             $table->string('icon', 60)->nullable();                      // room | online
26:             $table->text('description')->nullable();
27:             $table->boolean('is_active')->default(true);
28:             $table->timestamp('created_at')->useCurrent();
29:             $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
30: 
31:             $table->index('type', 'idx_facilities_type');
32:             $table->index('is_active', 'idx_facilities_is_active');
33:         });
34: 
35:         DB::statement("ALTER TABLE `facilities` ADD CONSTRAINT `chk_facilities_type` CHECK (`type` IN ('On-site', 'Virtual'))");
36: 
37:         // Mock data for the facility request feature.
38:         DB::table('facilities')->insert([
39:             [
40:                 'name'        => 'Room 1',
41:                 'type'        => 'On-site',
42:                 'location'    => 'Oxford Suites Makati, HR Office, 3rd Floor',
43:                 'capacity'    => 1,
44:                 'icon'        => 'room',
45:                 'description' => 'Primary on-site interview room with guest-facing setup.',
46:                 'is_active'   => true,
47:             ],
48:             [
49:                 'name'        => 'Room 2',
50:                 'type'        => 'On-site',
51:                 'location'    => 'Oxford Suites Makati, HR Office, 3rd Floor',
52:                 'capacity'    => 1,
53:                 'icon'        => 'room',
54:                 'description' => 'Secondary on-site interview room for panel interviews.',
55:                 'is_active'   => true,
56:             ],
57:             [
58:                 'name'        => 'Room 3',
59:                 'type'        => 'On-site',
60:                 'location'    => 'Oxford Suites Makati, HR Office, 3rd Floor',
61:                 'capacity'    => 2,
62:                 'icon'        => 'room',
63:                 'description' => 'Practical demonstration room for hands-on assessments.',
64:                 'is_active'   => true,
65:             ],
66:             [
67:                 'name'        => 'Online Interview',
68:                 'type'        => 'Virtual',
69:                 'location'    => 'meet.oxfordsuites.ph/interview-room',
70:                 'capacity'    => 5,
71:                 'icon'        => 'online',
72:                 'description' => 'Virtual interview room hosted on the company meeting platform.',
73:                 'is_active'   => true,
74:             ],
75:         ]);
76:     }
77: 
78:     public function down(): void
79:     {
80:         Schema::dropIfExists('facilities');
81:     }
82: };

(End of file - total 82 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Windows 10 Lite\\Downloads\\MUNJOR\\4TH YR\\DEV\\LATEST CLONE\\v14\\2nd-repo-for-hrms-backend-\\backend-laravel\\Modules\\ApplicantManagement\\database\\migrations\\2026_09_05_000004_create_assessment_tests_table.php"
}
```

**Output:**
```
<path>C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\Modules\ApplicantManagement\database\migrations\2026_09_05_000004_create_assessment_tests_table.php</path>
<type>file</type>
<content>
1: <?php
2: 
3: use Illuminate\Database\Migrations\Migration;
4: use Illuminate\Database\Schema\Blueprint;
5: use Illuminate\Support\Facades\DB;
6: use Illuminate\Support\Facades\Schema;
7: 
8: return new class extends Migration
9: {
10:     /**
11:      * Assessment tests — the job-specific written/knowledge test taken after
12:      * the interview assessment. The candidate receives a score result based
13:      * on their test answers.
14:      */
15:     public function up(): void
16:     {
17:         Schema::create('assessment_tests', function (Blueprint $table) {
18:             $table->id('assessment_test_id');
19:             $table->unsignedBigInteger('applicant_id');
20:             $table->unsignedBigInteger('assessor_user_id')->nullable();
21:             $table->string('test_title', 190);
22:             $table->json('questions_json')->nullable();                  // [{question, points}]
23:             $table->json('scores_json')->nullable();                     // {questionIndex: score}
24:             $table->decimal('total_score', 5, 2)->nullable();
25:             $table->decimal('passing_score', 5, 2)->default(75.00);
26:             $table->string('result', 10);                                // Passed | Failed
27:             $table->date('test_date');
28:             $table->text('remarks')->nullable();
29:             $table->timestamp('created_at')->useCurrent();
30:             $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
31: 
32:             $table->index('applicant_id', 'idx_assessment_tests_applicant_id');
33:             $table->index('assessor_user_id', 'idx_assessment_tests_assessor_user_id');
34:             $table->index('test_date', 'idx_assessment_tests_test_date');
35: 
36:             $table->foreign('applicant_id', 'fk_assessment_tests_applicant_id')
37:                   ->references('applicant_id')->on('applicants')->onDelete('cascade');
38:             $table->foreign('assessor_user_id', 'fk_assessment_tests_assessor_user_id')
39:                   ->references('system_user_id')->on('system_users');
40:         });
41: 
42:         DB::statement("ALTER TABLE `assessment_tests` ADD CONSTRAINT `chk_assessment_tests_result` CHECK (`result` IN ('Passed', 'Failed'))");
43:     }
44: 
45:     public function down(): void
46:     {
47:         Schema::dropIfExists('assessment_tests');
48:     }
49: };

(End of file - total 49 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Windows 10 Lite\\Downloads\\MUNJOR\\4TH YR\\DEV\\LATEST CLONE\\v14\\2nd-repo-for-hrms-backend-\\backend-laravel\\Modules\\ApplicantManagement\\database\\migrations\\2026_09_05_000005_create_practical_tests_table.php"
}
```

**Output:**
```
<path>C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\Modules\ApplicantManagement\database\migrations\2026_09_05_000005_create_practical_tests_table.php</path>
<type>file</type>
<content>
1: <?php
2: 
3: use Illuminate\Database\Migrations\Migration;
4: use Illuminate\Database\Schema\Blueprint;
5: use Illuminate\Support\Facades\DB;
6: use Illuminate\Support\Facades\Schema;
7: 
8: return new class extends Migration
9: {
10:     /**
11:      * Practical tests — a hands-on, position-based practical exam. Only used
12:      * for designated positions (see job_posts.requires_practical). The
13:      * candidate is scored against position-specific criteria.
14:      */
15:     public function up(): void
16:     {
17:         Schema::create('practical_tests', function (Blueprint $table) {
18:             $table->id('practical_test_id');
19:             $table->unsignedBigInteger('applicant_id');
20:             $table->unsignedBigInteger('assessor_user_id')->nullable();
21:             $table->string('task_title', 190);
22:             $table->json('criteria_json')->nullable();                   // [{criterion, max_points}]
23:             $table->json('scores_json')->nullable();                     // {criterionIndex: score}
24:             $table->decimal('total_score', 5, 2)->nullable();
25:             $table->string('result', 10);                                // Passed | Failed
26:             $table->date('test_date');
27:             $table->text('remarks')->nullable();
28:             $table->timestamp('created_at')->useCurrent();
29:             $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
30: 
31:             $table->index('applicant_id', 'idx_practical_tests_applicant_id');
32:             $table->index('assessor_user_id', 'idx_practical_tests_assessor_user_id');
33:             $table->index('test_date', 'idx_practical_tests_test_date');
34: 
35:             $table->foreign('applicant_id', 'fk_practical_tests_applicant_id')
36:                   ->references('applicant_id')->on('applicants')->onDelete('cascade');
37:             $table->foreign('assessor_user_id', 'fk_practical_tests_assessor_user_id')
38:                   ->references('system_user_id')->on('system_users');
39:         });
40: 
41:         DB::statement("ALTER TABLE `practical_tests` ADD CONSTRAINT `chk_practical_tests_result` CHECK (`result` IN ('Passed', 'Failed'))");
42:     }
43: 
44:     public function down(): void
45:     {
46:         Schema::dropIfExists('practical_tests');
47:     }
48: };

(End of file - total 48 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Windows 10 Lite\\Downloads\\MUNJOR\\4TH YR\\DEV\\LATEST CLONE\\v14\\2nd-repo-for-hrms-backend-\\backend-laravel\\Modules\\ApplicantManagement\\database\\migrations\\2026_09_05_000006_create_final_evaluations_table.php"
}
```

**Output:**
```
<path>C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\Modules\ApplicantManagement\database\migrations\2026_09_05_000006_create_final_evaluations_table.php</path>
<type>file</type>
<content>
1: <?php
2: 
3: use Illuminate\Database\Migrations\Migration;
4: use Illuminate\Database\Schema\Blueprint;
5: use Illuminate\Support\Facades\DB;
6: use Illuminate\Support\Facades\Schema;
7: 
8: return new class extends Migration
9: {
10:     /**
11:      * Final evaluations — the closing evaluation of the whole recruitment
12:      * process for an applicant (resume screening, interview assessment,
13:      * assessment test and — when the position requires it — the practical
14:      * assessment). Verdict is one of:
15:      * Recommended for Hire | For Another Position | Not Recommended.
16:      */
17:     public function up(): void
18:     {
19:         Schema::create('final_evaluations', function (Blueprint $table) {
20:             $table->id('final_evaluation_id');
21:             $table->unsignedBigInteger('applicant_id');
22:             $table->unsignedBigInteger('evaluated_by_user_id')->nullable();
23:             $table->date('evaluation_date');
24: 
25:             // Snapshot of every preceding stage (preview material)
26:             $table->decimal('screening_score', 5, 2)->nullable();
27:             $table->string('screening_status', 40)->nullable();
28:             $table->decimal('interview_score', 5, 2)->nullable();
29:             $table->string('interview_result', 10)->nullable();
30:             $table->decimal('assessment_test_score', 5, 2)->nullable();
31:             $table->string('assessment_test_result', 10)->nullable();
32:             $table->boolean('practical_required')->default(false);
33:             $table->decimal('practical_test_score', 5, 2)->nullable();
34:             $table->string('practical_test_result', 10)->nullable();
35: 
36:             $table->string('recommendation', 30);
37:             $table->text('overall_remarks')->nullable();
38:             $table->timestamp('created_at')->useCurrent();
39:             $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
40: 
41:             $table->unique('applicant_id', 'uq_final_evaluations_applicant_id');
42:             $table->index('evaluated_by_user_id', 'idx_final_evaluations_evaluated_by');
43:             $table->index('evaluation_date', 'idx_final_evaluations_evaluation_date');
44: 
45:             $table->foreign('applicant_id', 'fk_final_evaluations_applicant_id')
46:                   ->references('applicant_id')->on('applicants')->onDelete('cascade');
47:             $table->foreign('evaluated_by_user_id', 'fk_final_evaluations_evaluated_by')
48:                   ->references('system_user_id')->on('system_users');
49:         });
50: 
51:         DB::statement("ALTER TABLE `final_evaluations` ADD CONSTRAINT `chk_final_evaluations_recommendation` CHECK (`recommendation` IN ('Recommended for Hire', 'For Another Position', 'Not Recommended'))");
52:         DB::statement("ALTER TABLE `final_evaluations` ADD CONSTRAINT `chk_final_evaluations_results` CHECK (`interview_result` IN ('Passed', 'Failed') AND `assessment_test_result` IN ('Passed', 'Failed') AND `practical_test_result` IN ('Passed', 'Failed'))");
53:     }
54: 
55:     public function down(): void
56:     {
57:         Schema::dropIfExists('final_evaluations');
58:     }
59: };

(End of file - total 59 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Windows 10 Lite\\Downloads\\MUNJOR\\4TH YR\\DEV\\LATEST CLONE\\v14\\2nd-repo-for-hrms-backend-\\backend-laravel\\Modules\\ApplicantManagement\\database\\migrations\\2026_10_03_000001_create_assessment_invites_table.php"
}
```

**Output:**
```
<path>C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\Modules\ApplicantManagement\database\migrations\2026_10_03_000001_create_assessment_invites_table.php</path>
<type>file</type>
<content>
1: <?php
2: 
3: use Illuminate\Database\Migrations\Migration;
4: use Illuminate\Database\Schema\Blueprint;
5: use Illuminate\Support\Facades\Schema;
6: 
7: return new class extends Migration
8: {
9:     /**
10:      * Assessment invites — single-use links that let the APPLICANT (not the
11:      * staff recruiter) answer the assessment test on their own device. Staff
12:      * generate the link from the applicant's profile; the applicant opens it
13:      * without logging in, submits their answers, and the server scores the
14:      * test, records an assessment_tests row and advances the applicant stage.
15:      */
16:     public function up(): void
17:     {
18:         Schema::create('assessment_invites', function (Blueprint $table) {
19:             $table->id('assessment_invite_id');
20:             $table->string('token', 64)->unique();
21:             $table->unsignedBigInteger('applicant_id');
22:             // Staff member who generated the link (recorded as the assessor).
23:             $table->unsignedBigInteger('created_by_user_id')->nullable();
24:             $table->string('test_title', 190);
25:             $table->json('questions_json');                              // [{title, scenario, options, correctIndex, points}]
26:             $table->json('answers_json')->nullable();                    // {questionIndex: optionIndex}
27:             $table->decimal('passing_score', 5, 2)->default(75.00);
28:             $table->decimal('total_score', 5, 2)->nullable();
29:             $table->string('result', 10)->nullable();                    // Passed | Failed
30:             $table->string('status', 20)->default('Pending');            // Pending | Completed | Expired
31:             $table->timestamp('expires_at')->nullable();
32:             $table->timestamp('submitted_at')->nullable();
33:             $table->timestamp('created_at')->useCurrent();
34:             $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
35: 
36:             $table->index('applicant_id', 'idx_assessment_invites_applicant_id');
37:             $table->index('status', 'idx_assessment_invites_status');
38: 
39:             $table->foreign('applicant_id', 'fk_assessment_invites_applicant_id')
40:                   ->references('applicant_id')->on('applicants')->onDelete('cascade');
41:             $table->foreign('created_by_user_id', 'fk_assessment_invites_created_by_user_id')
42:                   ->references('system_user_id')->on('system_users');
43:         });
44:     }
45: 
46:     public function down(): void
47:     {
48:         Schema::dropIfExists('assessment_invites');
49:     }
50: };

(End of file - total 50 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Windows 10 Lite\\Downloads\\MUNJOR\\4TH YR\\DEV\\LATEST CLONE\\v14\\2nd-repo-for-hrms-backend-\\backend-laravel\\Modules\\RecruitmentManagement\\database\\migrations\\2025_01_01_000002_create_job_post_platforms_table.php"
}
```

**Output:**
```
<path>C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\Modules\RecruitmentManagement\database\migrations\2025_01_01_000002_create_job_post_platforms_table.php</path>
<type>file</type>
<content>
1: <?php
2: 
3: use Illuminate\Database\Migrations\Migration;
4: use Illuminate\Database\Schema\Blueprint;
5: use Illuminate\Support\Facades\DB;
6: use Illuminate\Support\Facades\Schema;
7: 
8: return new class extends Migration
9: {
10:     public function up(): void
11:     {
12:         Schema::create('job_post_platforms', function (Blueprint $table) {
13:             $table->id('job_post_platform_id');
14:             $table->unsignedBigInteger('job_post_id');
15:             $table->string('platform', 60);
16:             $table->timestamp('published_at')->nullable();
17:             $table->string('status', 20)->default('published');
18:             $table->timestamp('created_at')->useCurrent();
19: 
20:             $table->unique(['job_post_id', 'platform'], 'uq_job_post_platforms_natural');
21: 
22:             $table->foreign('job_post_id', 'fk_job_post_platforms_job_post_id')
23:                   ->references('job_post_id')->on('job_posts')->onDelete('cascade');
24:         });
25: 
26:         DB::statement("ALTER TABLE `job_post_platforms` ADD CONSTRAINT `chk_job_post_platforms_status` CHECK (`status` IN ('published', 'unpublished'))");
27:     }
28: 
29:     public function down(): void
30:     {
31:         Schema::dropIfExists('job_post_platforms');
32:     }
33: };

(End of file - total 33 lines)
</content>
```

---

## Assistant (Build · Muse Spark 1.3 Free · 7.6s)

_Thinking:_



Got the base schemas — now checking for later column additions.

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Windows 10 Lite\\Downloads\\MUNJOR\\4TH YR\\DEV\\LATEST CLONE\\v14\\2nd-repo-for-hrms-backend-\\backend-laravel\\Modules\\ApplicantManagement\\database\\migrations\\2026_09_23_000001_add_document_verification_to_applicant_screenings_table.php"
}
```

**Output:**
```
<path>C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\Modules\ApplicantManagement\database\migrations\2026_09_23_000001_add_document_verification_to_applicant_screenings_table.php</path>
<type>file</type>
<content>
1: <?php
2: 
3: use Illuminate\Database\Migrations\Migration;
4: use Illuminate\Database\Schema\Blueprint;
5: use Illuminate\Support\Facades\Schema;
6: 
7: return new class extends Migration
8: {
9:     /**
10:      * Adds the supporting-document verification evidence to the EXISTING
11:      * applicant_screenings table so the candidate's ranking percentage and
12:      * official status can be recomputed whenever a document is uploaded,
13:      * re-verified or removed:
14:      *
15:      * document_verification_json  Full evidence block returned by the NLP
16:      *                             service (documents score, verified /
17:      *                             discrepancy / unable counts, penalty, flags)
18:      * resume_match_score          The resume-only score BEFORE the document
19:      *                             evidence was blended in, so HR can see both.
20:      *
21:      * Both columns are nullable, so existing rows need no backfill.
22:      */
23:     public function up(): void
24:     {
25:         Schema::table('applicant_screenings', function (Blueprint $table) {
26:             $table->decimal('resume_match_score', 5, 2)->nullable()->after('match_score');
27:             $table->longtext('document_verification_json')->nullable()->after('alternative_job_json');
28:         });
29:     }
30: 
31:     public function down(): void
32:     {
33:         Schema::table('applicant_screenings', function (Blueprint $table) {
34:             $table->dropColumn(['resume_match_score', 'document_verification_json']);
35:         });
36:     }
37: };

(End of file - total 37 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Windows 10 Lite\\Downloads\\MUNJOR\\4TH YR\\DEV\\LATEST CLONE\\v14\\2nd-repo-for-hrms-backend-\\backend-laravel\\Modules\\ApplicantManagement\\database\\migrations\\2026_09_05_000003_extend_applicant_assessments_table.php"
}
```

**Output:**
```
<path>C:\Users\Windows 10 Lite\Downloads\MUNJOR\4TH YR\DEV\LATEST CLONE\v14\2nd-repo-for-hrms-backend-\backend-laravel\Modules\ApplicantManagement\database\migrations\2026_09_05_000003_extend_applicant_assessments_table.php</path>
<type>file</type>
<content>
1: <?php
2: 
3: use Illuminate\Database\Migrations\Migration;
4: use Illuminate\Database\Schema\Blueprint;
5: use Illuminate\Support\Facades\DB;
6: use Illuminate\Support\Facades\Schema;
7: 
8: return new class extends Migration
9: {
10:     /**
11:      * Interview assessment extensions:
12:      *  - comments_json: per-criterion comment (criterion => comment)
13:      *  - result: the assessor's explicit Passed / Failed verdict.
14:      * The existing `remarks` column is now presented as the
15:      * "Overall Evaluation" text in the UI.
16:      */
17:     public function up(): void
18:     {
19:         Schema::table('applicant_assessments', function (Blueprint $table) {
20:             $table->json('comments_json')->nullable()->after('scores_json');
21:             $table->string('result', 10)->nullable()->after('outcome');
22:         });
23: 
24:         DB::statement("ALTER TABLE `applicant_assessments` ADD CONSTRAINT `chk_applicant_assessments_result` CHECK (`result` IN ('Passed', 'Failed'))");
25:     }
26: 
27:     public function down(): void
28:     {
29:         $version = (string) DB::selectOne('SELECT VERSION() AS v')->v;
30:         $syntax = str_contains($version, 'MariaDB') ? 'DROP CONSTRAINT' : 'DROP CHECK';
31: 
32:         try {
33:             DB::statement("ALTER TABLE `applicant_assessments` {$syntax} `chk_applicant_assessments_result`");
34:         } catch (Throwable) {
35:             // Constraint may not exist on a fresh schema.
36:         }
37: 
38:         Schema::table('applicant_assessments', function (Blueprint $table) {
39:             $table->dropColumn(['comments_json', 'result']);
40:         });
41:     }
42: };

(End of file - total 42 lines)
</content>
```

---

## Assistant (Build · Muse Spark 1.3 Free · 10.8s)

_Thinking:_



Yes — all working, all have live data in `hotel_hr.sql` (Sep 28 dump), except 1:

| Table | Rows | Working? |
|---|---|---|
| `applicant_screenings` | 7 | Yes |
| `applicant_screening_entities` | 950 | Yes |
| `applicant_screening_scores` | 184 | Yes |
| `screening_ground_truths` | 2 | Yes |
| `screening_reference_data` | 154 | Yes |
| `screening_requirement_templates` | 8 | Yes |
| `screening_requirement_template_items` | 55 | Yes |
| `applicant_assessments` | 2 | Yes |
| `assessment_tests` | 16 | Yes |
| `practical_tests` | 3 | Yes |
| `final_evaluations` | 8 | Yes |
| `facilities` | 4 | Yes |
| `job_post_platforms` | 38 | Yes |
| `assessment_invites` | 0 | Code exists (`2026_10_03` migration), not in dump yet — new, unused |

### Columns per table

**1. `applicant_screenings`** — new NLP pipeline header:
`screening_id, applicant_id FK, job_post_id FK, processing_status, screening_result, match_score, resume_match_score*, score_breakdown_json, profile_json, entities_json, missing_information_json, validation_json, alternative_job_json, document_verification_json*, reasons_json, model_info_json, error_message, processed_at, created_at, updated_at`
`*added by 2026_09_23 migration`

**2. `applicant_screening_entities`** — old pipeline detail:
`entity_id, applicant_id FK, label, value, created_at`

**3. `applicant_screening_scores`** — old pipeline detail:
`score_id, applicant_id FK, criterion, score, created_at`

**4. `screening_ground_truths`** — ML eval only:
`gt_id, applicant_id FK, job_post_id FK, true_screening_result, true_qualification_score, true_missing_information_json, true_unrecognized_skills_json, notes, created_at, updated_at`

**5. `screening_reference_data`** — NLP dictionary:
`ref_id, data_type (skill/job_role/certification), canonical_value, aliases_json, active, created_at, updated_at`

**6. `screening_requirement_templates`:**
`template_id, name, position_id FK nullable, description, active, created_at, updated_at`

**7. `screening_requirement_template_items`:**
`item_id, template_id FK, entity_type (skill/job_role/certification/education/experience), value, required, created_at`

**8. `applicant_assessments`** — interview assessment:
`assessment_id, applicant_id FK, assessor_user_id FK, assessment_date, scores_json, comments_json*, total_score, outcome (Recommended/Hold/Not Recommended), result (Passed/Failed)*, remarks, created_at, updated_at`
`*added by 2026_09_05_000003`

**9. `assessment_tests`** — written test:
`assessment_test_id, applicant_id FK, assessor_user_id FK, test_title, questions_json, scores_json, total_score, passing_score, result, test_date, remarks, created_at, updated_at`

**10. `practical_tests`** — hands-on test:
`practical_test_id, applicant_id FK, assessor_user_id FK, task_title, criteria_json, scores_json, total_score, result, test_date, remarks, created_at, updated_at`

**11. `final_evaluations`** — closing verdict:
`final_evaluation_id, applicant_id FK UQ, evaluated_by_user_id FK, evaluation_date, screening_score, screening_status, interview_score, interview_result, assessment_test_score, assessment_test_result, practical_required, practical_test_score, practical_test_result, recommendation, overall_remarks, created_at, updated_at`

**12. `assessment_invites`** — self-service link:
`assessment_invite_id, token UQ, applicant_id FK, created_by_user_id FK, test_title, questions_json, answers_json, passing_score, total_score, result, status (Pending/Completed/Expired), expires_at, submitted_at, created_at, updated_at`

**13. `facilities`:**
`facility_id, name UQ, type (On-site/Virtual), location, capacity, icon, description, is_active, created_at, updated_at`

**14. `job_post_platforms`:**
`job_post_platform_id, job_post_id FK, platform, published_at, status, created_at` — UQ `(job_post_id, platform)`


---

## User

give me the table with column a table output text so that i can visualize it

---

## Assistant (Build · Muse Spark 1.3 Free · 22.6s)

_Thinking:_



Here is copy-paste text view for those 14 tables — from your live migrations + `hotel_hr.sql`:

```
================================================================
TABLE: applicant_screenings (7 rows) - NEW pipeline header
================================================================
| Column                   | Type            | Key/Note        |
|--------------------------+-----------------+-----------------|
| screening_id             | BIGINT UNSIGNED | PK              |
| applicant_id             | BIGINT UNSIGNED | FK > applicants |
| job_post_id              | BIGINT UNSIGNED | FK > job_posts  |
| processing_status        | VARCHAR(30)     | default PENDING |
| screening_result         | VARCHAR(30)     | NULLABLE        |
| match_score              | DECIMAL(5,2)    | NULLABLE        |
| resume_match_score       | DECIMAL(5,2)    | NULLABLE *added |
| score_breakdown_json     | JSON            | NULLABLE        |
| profile_json             | LONGTEXT        | NULLABLE        |
| entities_json            | LONGTEXT        | NULLABLE        |
| missing_information_json | LONGTEXT        | NULLABLE        |
| validation_json          | LONGTEXT        | NULLABLE        |
| alternative_job_json     | LONGTEXT        | NULLABLE        |
| document_verification_json| LONGTEXT       | NULLABLE *added |
| reasons_json             | LONGTEXT        | NULLABLE        |
| model_info_json          | LONGTEXT        | NULLABLE        |
| error_message            | TEXT            | NULLABLE        |
| processed_at             | TIMESTAMP       | NULLABLE        |
| created_at               | TIMESTAMP       |                 |
| updated_at               | TIMESTAMP       | NULLABLE        |

================================================================
TABLE: applicant_screening_entities (950 rows) - OLD pipeline
================================================================
| Column       | Type            | Key/Note        |
|--------------+-----------------+-----------------|
| entity_id    | BIGINT UNSIGNED | PK              |
| applicant_id | BIGINT UNSIGNED | FK > applicants |
| label        | VARCHAR(80)     |                 |
| value        | TEXT            |                 |
| created_at   | TIMESTAMP       |                 |

================================================================
TABLE: applicant_screening_scores (184 rows) - OLD pipeline
================================================================
| Column       | Type            | Key/Note        |
|--------------+-----------------+-----------------|
| score_id     | BIGINT UNSIGNED | PK              |
| applicant_id | BIGINT UNSIGNED | FK > applicants |
| criterion    | VARCHAR(120)    |                 |
| score        | DECIMAL(5,2)    |                 |
| created_at   | TIMESTAMP       |                 |

================================================================
TABLE: screening_ground_truths (2 rows) - ML eval only
================================================================
| Column                        | Type            | Key/Note        |
|-------------------------------+-----------------+-----------------|
| gt_id                         | BIGINT UNSIGNED | PK              |
| applicant_id                  | BIGINT UNSIGNED | FK > applicants,UQ|
| job_post_id                   | BIGINT UNSIGNED | FK > job_posts  |
| true_screening_result         | VARCHAR(30)     |                 |
| true_qualification_score      | DECIMAL(5,2)    | NULLABLE        |
| true_missing_information_json | JSON            | NULLABLE        |
| true_unrecognized_skills_json | JSON            | NULLABLE        |
| notes                         | TEXT            | NULLABLE        |
| created_at                    | TIMESTAMP       |                 |
| updated_at                    | TIMESTAMP       | NULLABLE        |

================================================================
TABLE: screening_reference_data (154 rows) - NLP dictionary
================================================================
| Column          | Type            | Key/Note        |
|-----------------+-----------------+-----------------|
| ref_id          | BIGINT UNSIGNED | PK              |
| data_type       | VARCHAR(20)     | skill/job_role/certification, UQ(data_type+value)|
| canonical_value | VARCHAR(150)    |                 |
| aliases_json    | JSON            | NULLABLE        |
| active          | BOOLEAN         | default 1       |
| created_at      | TIMESTAMP       |                 |
| updated_at      | TIMESTAMP       | NULLABLE        |

================================================================
TABLE: screening_requirement_templates (8 rows)
================================================================
| Column       | Type            | Key/Note        |
|--------------+-----------------+-----------------|
| template_id  | BIGINT UNSIGNED | PK              |
| name         | VARCHAR(150)    |                 |
| position_id  | BIGINT UNSIGNED | FK > positions, NULLABLE |
| description  | VARCHAR(500)    | NULLABLE        |
| active       | BOOLEAN         | default 1       |
| created_at   | TIMESTAMP       |                 |
| updated_at   | TIMESTAMP       | NULLABLE        |

================================================================
TABLE: screening_requirement_template_items (55 rows)
================================================================
| Column      | Type            | Key/Note        |
|-------------+-----------------+-----------------|
| item_id     | BIGINT UNSIGNED | PK              |
| template_id | BIGINT UNSIGNED | FK > templates  |
| entity_type | VARCHAR(20)     | skill/job_role/certification/education/experience |
| value       | VARCHAR(255)    | UQ(template+type+value) |
| required    | BOOLEAN         | default 1       |
| created_at  | TIMESTAMP       |                 |

================================================================
TABLE: applicant_assessments (2 rows) - interview assessment
================================================================
| Column           | Type            | Key/Note        |
|------------------+-----------------+-----------------|
| assessment_id    | BIGINT UNSIGNED | PK              |
| applicant_id     | BIGINT UNSIGNED | FK > applicants |
| assessor_user_id | BIGINT UNSIGNED | FK > system_users, NULLABLE |
| assessment_date  | DATE            |                 |
| scores_json      | JSON            | NULLABLE        |
| comments_json    | JSON            | NULLABLE *added |
| total_score      | DECIMAL(5,2)    | NULLABLE        |
| outcome          | VARCHAR(20)     | Recommended/Hold/Not Recommended |
| result           | VARCHAR(10)     | Passed/Failed, NULLABLE *added |
| remarks          | TEXT            | NULLABLE        |
| created_at       | TIMESTAMP       |                 |
| updated_at       | TIMESTAMP       |                 |

================================================================
TABLE: assessment_tests (16 rows) - written test
================================================================
| Column           | Type            | Key/Note        |
|------------------+-----------------+-----------------|
| assessment_test_id| BIGINT UNSIGNED| PK              |
| applicant_id     | BIGINT UNSIGNED | FK > applicants |
| assessor_user_id | BIGINT UNSIGNED | FK > system_users, NULLABLE |
| test_title       | VARCHAR(190)    |                 |
| questions_json   | JSON            | NULLABLE        |
| scores_json      | JSON            | NULLABLE        |
| total_score      | DECIMAL(5,2)    | NULLABLE        |
| passing_score    | DECIMAL(5,2)    | default 75.00   |
| result           | VARCHAR(10)     | Passed/Failed   |
| test_date        | DATE            |                 |
| remarks          | TEXT            | NULLABLE        |
| created_at       | TIMESTAMP       |                 |
| updated_at       | TIMESTAMP       |                 |

================================================================
TABLE: practical_tests (3 rows) - hands-on test
================================================================
| Column           | Type            | Key/Note        |
|------------------+-----------------+-----------------|
| practical_test_id| BIGINT UNSIGNED | PK              |
| applicant_id     | BIGINT UNSIGNED | FK > applicants |
| assessor_user_id | BIGINT UNSIGNED | FK > system_users, NULLABLE |
| task_title       | VARCHAR(190)    |                 |
| criteria_json    | JSON            | NULLABLE        |
| scores_json      | JSON            | NULLABLE        |
| total_score      | DECIMAL(5,2)    | NULLABLE        |
| result           | VARCHAR(10)     | Passed/Failed   |
| test_date        | DATE            |                 |
| remarks          | TEXT            | NULLABLE        |
| created_at       | TIMESTAMP       |                 |
| updated_at       | TIMESTAMP       |                 |

================================================================
TABLE: final_evaluations (8 rows) - closing verdict
================================================================
| Column               | Type            | Key/Note        |
|----------------------+-----------------+-----------------|
| final_evaluation_id  | BIGINT UNSIGNED | PK              |
| applicant_id         | BIGINT UNSIGNED | FK > applicants, UQ |
| evaluated_by_user_id | BIGINT UNSIGNED | FK > system_users, NULLABLE |
| evaluation_date      | DATE            |                 |
| screening_score      | DECIMAL(5,2)    | NULLABLE        |
| screening_status     | VARCHAR(40)     | NULLABLE        |
| interview_score      | DECIMAL(5,2)    | NULLABLE        |
| interview_result     | VARCHAR(10)     | NULLABLE        |
| assessment_test_score| DECIMAL(5,2)    | NULLABLE        |
| assessment_test_result| VARCHAR(10)    | NULLABLE        |
| practical_required   | BOOLEAN         | default 0       |
| practical_test_score | DECIMAL(5,2)    | NULLABLE        |
| practical_test_result| VARCHAR(10)     | NULLABLE        |
| recommendation       | VARCHAR(30)     | Hire/Another/Not Recommended |
| overall_remarks      | TEXT            | NULLABLE        |
| created_at           | TIMESTAMP       |                 |
| updated_at           | TIMESTAMP       |                 |

================================================================
TABLE: assessment_invites (0 rows) - NEW, not in dump yet
================================================================
| Column             | Type            | Key/Note        |
|--------------------+-----------------+-----------------|
| assessment_invite_id| BIGINT UNSIGNED| PK              |
| token              | VARCHAR(64)     | UQ              |
| applicant_id       | BIGINT UNSIGNED | FK > applicants |
| created_by_user_id | BIGINT UNSIGNED | FK > system_users, NULLABLE |
| test_title         | VARCHAR(190)    |                 |
| questions_json     | JSON            |                 |
| answers_json       | JSON            | NULLABLE        |
| passing_score      | DECIMAL(5,2)    | default 75.00   |
| total_score        | DECIMAL(5,2)    | NULLABLE        |
| result             | VARCHAR(10)     | NULLABLE        |
| status             | VARCHAR(20)     | Pending/Completed/Expired |
| expires_at         | TIMESTAMP       | NULLABLE        |
| submitted_at       | TIMESTAMP       | NULLABLE        |
| created_at         | TIMESTAMP       |                 |
| updated_at         | TIMESTAMP       |                 |

================================================================
TABLE: facilities (4 rows)
================================================================
| Column      | Type            | Key/Note        |
|-------------+-----------------+-----------------|
| facility_id | BIGINT UNSIGNED | PK              |
| name        | VARCHAR(120)    | UQ: Room 1,2,3,Online |
| type        | VARCHAR(20)     | On-site/Virtual |
| location    | VARCHAR(190)    | NULLABLE        |
| capacity    | INT UNSIGNED    | default 1       |
| icon        | VARCHAR(60)     | NULLABLE room/online |
| description | TEXT            | NULLABLE        |
| is_active   | BOOLEAN         | default 1       |
| created_at  | TIMESTAMP       |                 |
| updated_at  | TIMESTAMP       |                 |

================================================================
TABLE: job_post_platforms (38 rows)
================================================================
| Column              | Type            | Key/Note        |
|---------------------+-----------------+-----------------|
| job_post_platform_id| BIGINT UNSIGNED | PK              |
| job_post_id         | BIGINT UNSIGNED | FK > job_posts, UQ(job+platform) |
| platform            | VARCHAR(60)     | e.g. Facebook/Indeed/LinkedIn |
| published_at        | TIMESTAMP       | NULLABLE        |
| status              | VARCHAR(20)     | published/unpublished |
| created_at          | TIMESTAMP       |                 |
```


---

## User

I want like this table format: Table	Rows	Working?
applicant_screenings	7	Yes
applicant_screening_entities	950	Yes
applicant_screening_scores	184	Yes
screening_ground_truths	2	Yes
screening_reference_data	154	Yes
screening_requirement_templates	8	Yes
screening_requirement_template_items	55	Yes
applicant_assessments	2	Yes
assessment_tests	16	Yes
practical_tests	3	Yes
final_evaluations	8	Yes
facilities	4	Yes
job_post_platforms	38	Yes
assessment_invites	0	Code exists (2026_10_03 migration), not in dump yet — new, unused 

---

## Assistant (Build · Muse Spark 1.3 Free · 6.0s)

_Thinking:_



| Table | Rows | Working? |
|---|---|---|
| applicant_screenings | 7 | Yes |
| applicant_screening_entities | 950 | Yes |
| applicant_screening_scores | 184 | Yes |
| screening_ground_truths | 2 | Yes |
| screening_reference_data | 154 | Yes |
| screening_requirement_templates | 8 | Yes |
| screening_requirement_template_items | 55 | Yes |
| applicant_assessments | 2 | Yes |
| assessment_tests | 16 | Yes |
| practical_tests | 3 | Yes |
| final_evaluations | 8 | Yes |
| facilities | 4 | Yes |
| job_post_platforms | 38 | Yes |
| assessment_invites | 0 | Code exists (2026_10_03 migration), not in dump yet — new, unused |


---

## User

give me the column of each table also

---

## Assistant (Build · Muse Spark 1.3 Free · 7.3s)

_Thinking:_



| Table | Rows | Working? | Columns |
|---|---|---|---|
| applicant_screenings | 7 | Yes | screening_id, applicant_id, job_post_id, processing_status, screening_result, match_score, resume_match_score, score_breakdown_json, profile_json, entities_json, missing_information_json, validation_json, alternative_job_json, document_verification_json, reasons_json, model_info_json, error_message, processed_at, created_at, updated_at |
| applicant_screening_entities | 950 | Yes | entity_id, applicant_id, label, value, created_at |
| applicant_screening_scores | 184 | Yes | score_id, applicant_id, criterion, score, created_at |
| screening_ground_truths | 2 | Yes | gt_id, applicant_id, job_post_id, true_screening_result, true_qualification_score, true_missing_information_json, true_unrecognized_skills_json, notes, created_at, updated_at |
| screening_reference_data | 154 | Yes | ref_id, data_type, canonical_value, aliases_json, active, created_at, updated_at |
| screening_requirement_templates | 8 | Yes | template_id, name, position_id, description, active, created_at, updated_at |
| screening_requirement_template_items | 55 | Yes | item_id, template_id, entity_type, value, required, created_at |
| applicant_assessments | 2 | Yes | assessment_id, applicant_id, assessor_user_id, assessment_date, scores_json, comments_json, total_score, outcome, result, remarks, created_at, updated_at |
| assessment_tests | 16 | Yes | assessment_test_id, applicant_id, assessor_user_id, test_title, questions_json, scores_json, total_score, passing_score, result, test_date, remarks, created_at, updated_at |
| practical_tests | 3 | Yes | practical_test_id, applicant_id, assessor_user_id, task_title, criteria_json, scores_json, total_score, result, test_date, remarks, created_at, updated_at |
| final_evaluations | 8 | Yes | final_evaluation_id, applicant_id, evaluated_by_user_id, evaluation_date, screening_score, screening_status, interview_score, interview_result, assessment_test_score, assessment_test_result, practical_required, practical_test_score, practical_test_result, recommendation, overall_remarks, created_at, updated_at |
| facilities | 4 | Yes | facility_id, name, type, location, capacity, icon, description, is_active, created_at, updated_at |
| job_post_platforms | 38 | Yes | job_post_platform_id, job_post_id, platform, published_at, status, created_at |
| assessment_invites | 0 | Code exists (2026_10_03 migration), not in dump yet — new, unused | assessment_invite_id, token, applicant_id, created_by_user_id, test_title, questions_json, answers_json, passing_score, total_score, result, status, expires_at, submitted_at, created_at, updated_at |


---

## User

what are the column that are duplicated in other table

---

## Assistant (Build · Muse Spark 1.3 Free · 14.6s)

_Thinking:_



| Duplicated Column | Found In | Why Duplicate |
|---|---|---|
| `applicant_id` | applicant_screenings, entities, scores, ground_truths, applicant_assessments, assessment_tests, practical_tests, final_evaluations, assessment_invites | Same FK in 9 tables — applicant-centric sprawl |
| `job_post_id` | applicant_screenings, screening_ground_truths, job_post_platforms | Same FK, 3 meanings of job link |
| `scores_json` | applicant_assessments, assessment_tests, practical_tests | Same purpose, 3 copies |
| `total_score` | applicant_assessments, assessment_tests, practical_tests, assessment_invites | Same purpose, 4 copies |
| `result` | applicant_assessments, assessment_tests, practical_tests, assessment_invites | All Passed/Failed, 4 copies — plus `interview_result, assessment_test_result, practical_test_result` inside final_evaluations |
| `remarks` | applicant_assessments, assessment_tests, practical_tests | Same free-text, 3 copies — plus `overall_remarks` in final_evaluations |
| `assessor_user_id` | applicant_assessments, assessment_tests, practical_tests | Same FK — plus `evaluated_by_user_id` in final_evaluations, `created_by_user_id` in assessment_invites |
| `test_title` | assessment_tests, assessment_invites | Same title — plus `task_title` in practical_tests |
| `questions_json` | assessment_tests, assessment_invites | Same Q&A blob, 2 copies |
| `passing_score` | assessment_tests, assessment_invites | Same field, 2 copies |
| `test_date` | assessment_tests, practical_tests | Same date — plus `assessment_date` in applicant_assessments, `evaluation_date` in final_evaluations |
| `value` | applicant_screening_entities.value, screening_requirement_template_items.value | Both store entity string value |
| `entities_json` vs `applicant_screening_entities` table | applicant_screenings.entities_json + applicant_screening_entities table | JSON copy of child table |
| `score_breakdown_json` vs `applicant_screening_scores` table | applicant_screenings.score_breakdown_json + applicant_screening_scores table | JSON copy of child table |
| `screening_result / screening_status / true_screening_result` | applicant_screenings.screening_result, final_evaluations.screening_status, screening_ground_truths.true_screening_result | Same verdict, 3 names |
| `match_score / resume_match_score / screening_score / true_qualification_score` | applicant_screenings.match_score + resume_match_score, final_evaluations.screening_score + assessment_test_score, ground_truths.true_qualification_score | Same score, 5 names |
| `missing_information_json / true_missing_information_json` | applicant_screenings.missing_information_json, screening_ground_truths.true_missing_information_json | Same blob, train vs truth |
| `template_id` | screening_requirement_templates.template_id (PK), screening_requirement_template_items.template_id (FK) | Normal parent-child — not removable, but mergeable to JSON |
| `name / description` | screening_requirement_templates.name + description, facilities.name + description | Generic fields, same pattern |
| `active / is_active / status` | screening_reference_data.active, requirement_templates.active, facilities.is_active, job_post_platforms.status, assessment_invites.status | Same open/close flag, 3 names |
| `created_at` | all 14 tables | Audit field |
| `updated_at` | applicant_screenings, ground_truths, reference_data, requirement_templates, applicant_assessments, assessment_tests, practical_tests, final_evaluations, facilities, assessment_invites | Audit field, 10 tables |


---

