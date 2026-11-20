# HRMS Database Consolidation Plan

> Master plan for consolidating the `hotel_hr` database from **72 tables to 50 tables**
> without breaking any feature, test, or frontend screen.
>
> - Evidence for each table: `docs/DATABASE_TABLE_VERIFICATION.md`
> - Decision authority & rationale: `docs/DATABASE_CONSOLIDATION_DECISION_RECORD.md`
> - Last updated & finalized: **Nov 4, 2026** · Branch: `ferdy`
>
> **Nov 4, 2026 finalization:** All scheduled table restorations (2d, 3b, 3c, 3e, 3f, 3g, 4b)
> and selected Phase 5 consolidations (5d, 5e, 5f) have been executed, migrated, seeded, and
> validated across all automated test suites. Framework tables (4c: `cache`, `cache_locks`, `sessions`)
> remain dropped. The final verified database table count is **exactly 50 tables**.

---

## Contents
1. [Summary](#1-summary)
2. [Ground rules](#2-ground-rules)
3. [Progress tracker](#3-progress-tracker)
4. [Verification results](#4-verification-results)
5. [Phase 1 – Drop the unused table (done)](#5-phase-1--drop-the-unused-table-done)
6. [Phase 2 – Merge tables, same models](#6-phase-2--merge-tables-same-models)
7. [Phase 3 – Small code changes](#7-phase-3--small-code-changes)
8. [Phase 4 – Optional, medium risk](#8-phase-4--optional-medium-risk)
9. [Phase 5 – Optional, to reach 40](#9-phase-5--optional-to-reach-40)
10. [Final table list (46)](#10-final-table-list-46)
11. [How to do each merge](#11-how-to-do-each-merge)
12. [Testing](#12-testing)
13. [Backup and rollback](#13-backup-and-rollback)
14. [Risks and open decisions](#14-risks-and-open-decisions)

---

## 1. Summary

| Stage | Tables |
|---|---|
| Starting point (`hotel_hr (oct 31).sql` and live DB) | 72 |
| After Phase 1 | 71 |
| After Phase 3i (Phase 3 complete) | 51 |
| After Phase 4a | 50 |
| After Phase 4b | 49 |
| After Phase 4c (Phase 4 complete) | 46 |
| After 7 Table Restorations (2d, 3b, 3c, 3e, 3f, 3g, 4b) | 53 |
| **Final executed state (After Phase 5d, 5e, 5f merges)** | **50** |

**Approach:** merge related tables; restore entities requiring independent life-cycles, auditability, or relational integrity; never remove a feature.
The final database state of 50 tables is verified and running cleanly on both live `hotel_hr` and test `hrms_test` databases.

---

## 2. Ground rules

1. **Judge a table by its code, not its row count.** Before touching a table,
   find the code that writes to it, the code that reads it, its API route and
   its screen. Empty does not mean unused.
2. **Keep every model class.** A merged model points to the new table with a
   global scope (for example `eval_type = 'practical_test'`) and a `creating`
   hook that fills in the type automatically.
3. **Keep the API response identical.** Same JSON keys (for example
   `final_evaluation_id`), so the React frontend needs no changes.
4. **Keep every route and controller**, unless a step says "small change".
5. **Every migration is reversible.** `up()` creates, copies, then drops;
   `down()` recreates the old tables and copies the data back.
6. **One merge at a time:** back up → migrate → test → click through → next.
7. **Nothing is committed or pushed** unless you decide to.
8. **Ignore `.kilo/worktrees/`**. It is a separate copy of the project.

---

## 3. Progress tracker

| Step | Change | Tables after | Status |
|---|---|---|---|
| 1 | Drop `password_reset_tokens` | 71 | ✅ Done (Oct 31) |
| 2a | `employee_code_sequences` + `document_code_sequences` → `code_sequences` | 70 | ✅ Done (Nov 1) |
| 2b | `chatbot_unanswered` → `chatbot_messages` | 69 | ✅ Done (Nov 1) |
| 2c | `user_login_activity` + `applicant_block_history` → `audit_logs` | 67 | ✅ Done (Nov 1) |
| 2d | `ess_request_routings` + `ess_request_status_histories` + `ess_request_attachments` → `ess_request_events` | 65 | ✅ Done (Nov 1) |
| 2e | 4 evaluation tables → pplicant_evaluations | 61 | ✅ Done (Nov 1) |
| 3a | Screening entities + scores → `applicant_screenings` | 59 | ✅ Done (Nov 1) |
| 3b | `payroll_periods` → `payroll_records` | 58 | ✅ Done (Nov 1) |
| 3c | `payroll_items` → `payroll_records.items_json` | 57 | ✅ Done (Nov 1) |
| 3d | `job_post_platforms` → `job_posts.platforms_json` | 56 | ✅ Done (Nov 1, 2026) |
| 3e | `recognition_reactions` → `social_recognitions.reactions_json` | 55 | ✅ Done (Nov 1, 2026) |
| 3f | `employee_learning_attempts` → `employee_learning.attempts_json` | 54 | ✅ Done (Nov 1, 2026) |
| 3g | `employee_exit_records` → columns on `employees` | 53 | ✅ Done (Nov 1, 2026) |
| 3h | `screening_requirement_template_items` → templates `items_json` | 52 | ✅ Done (Nov 1, 2026) |
| 3i | `employee_emergency_contacts` → `employees.emergency_contacts_json` | 51 | ✅ Done (Nov 1, 2026) |
| 4a | `onboarding_checklist_items` → templates `items_json` | 50 | ✅ Done (Nov 2, 2026) |
| 4b | `facilities` → `system_settings` | 49 | ✅ Done (Nov 2, 2026) |
| 4c | `cache`, `cache_locks`, `sessions` → file drivers | 46 | ✅ Done (Nov 2, 2026) |
| 5a–5f | See Phase 5 | 40 | ⬜ optional, high risk |

---

## 4. Verification results

Checked against the real code in `backend-laravel/` and `frontend/src/`.

### 4.1 Empty or near-empty tables

| Table | Rows | Written by | Read by / screen | Result |
|---|---|---|---|---|
| `applicant_block_history` | 0 | Block/unblock in `ApplicantManagementController` | `Applicant::blockHistories()`; feature test | **In use** |
| `chatbot_unanswered` | 0 | `ChatbotEngine::logUnanswered()` | `ChatbotFaqController`; `/chatbot/unanswered` | **In use** |
| `screening_ground_truths` | 0 | `POST applicants/{id}/ground-truth` | `EvaluationService` → SOP 2/3/5 metrics | **In use (thesis)** |
| `employee_exit_records` | 0 | `EmployeeController`, `PromotionRequestController`, `EmployeeDossierController` | Dashboard attrition chart | **In use** |
| `assessment_invites` | 0 | `AssessmentInviteController::store()` | Public assessment link pages | **In use** |
| `final_evaluations` | 0 | `FinalEvaluationController` | Hiring is blocked until it exists | **In use, critical** |
| `promotion_requests` | 0 | ESS portal, `PromotionRequestController` | HR promotion screens; test | **In use** |
| `ess_request_events` | 2 | All ESS routing, status and file events | ESS request timeline, admin routings, module adapters | **In use, critical – merged 2d (Nov 1)** |
| `cache_locks` | 0 | Laravel cache (`CACHE_STORE=database`) | OTP/MFA codes, reset tokens, AI breakers | **In use (framework)** |
| `password_reset_tokens` | 0 | Nothing | Nothing (reset tokens live in the cache) | **Unused → dropped** |

### 4.2 Non-empty tables that are also in use

| Table | Why it can't simply be dropped |
|---|---|
| `applicant_screening_entities`, `applicant_screening_scores` | Written by `ScreeningService`, shown on the applicant list and detail screens |
| `employee_code_sequences`, `document_code_sequences` | Row-locked number generators for employee and document codes |
| `facilities` | Interview form rule `exists:facilities,facility_id`; `Interview::facility()` |
| `payroll_periods` | Only a foreign key from `payroll_records` plus seed data (low use) |

### 4.3 Tables that stay untouched (core)

`employees`, `applicants`, `job_posts`, `positions`, `departments`,
`salary_grades`, `system_users`, `system_roles`, `role_permissions`,
`notifications`, `ess_requests`, `ess_categories`, `screening_reference_data`
(260 rows used by the NLP service), `personal_access_tokens`, `migrations`.


---

## 5. Phase 1 – Drop the unused table (done)

**Result: 72 → 71 tables. Completed Oct 31, 2026.**

| Item | Detail |
|---|---|
| Table removed | `password_reset_tokens` (0 rows, never used) |
| Why it was safe | Forgot/reset password uses `PasswordResetService`, which keeps tokens in the cache (`auth.reset.{token}`) |
| Migration | `backend-laravel/database/migrations/2026_10_31_000001_drop_unused_password_reset_tokens_table.php` |
| Backup | `database/backups/hotel_hr_before_phase1.sql` (~973 KB) |
| Checks done | Migrate ✅ · Rollback restores table ✅ · Re-migrate ✅ · `AuthFlowTest` + `AuthLockoutTest` 14/14 passed ✅ |
| Still to check by hand | Login with OTP, forgot-password page |

Not changed: `config/auth.php` (its setting is only read if Laravel's built-in
reset broker is used, and it isn't).

---

## 6. Phase 2 – Merge tables, same models

**Result: 71 → 61. Risk: low. Controllers, routes and screens are not changed.**
Do the steps in this order (safest first).

### 2a. Code sequences → `code_sequences` (71 → 70) ✅ Done (Nov 1, 2026)
- **New table:** `code_sequences (seq_key PK, next_val, updated_at)`.
- **Copy:** rows `employee_code` and `document_code` from the two old tables
  (values `37` and `11`; both generators still floor against existing rows).
- **Code:** `EmployeeLifecycleService::generateEmployeeCode()` and the document
  code generator use `where('seq_key', …)->lockForUpdate()`; logic otherwise identical.
- **Test:** create an employee; upload an employee document; codes keep counting up.
- **Migration:** `backend-laravel/database/migrations/2026_11_01_000001_create_code_sequences_table.php`
- **Backup:** `database/backups/hotel_hr_before_phase2a.sql` (~973 KB)
- **Checks done:** migrate 71 → 70 ✅ · rollback 70 → 71 restores both old tables
  and their counters ✅ · re-migrate 71 → 70 ✅ · table count verified ✅ ·
  `CoreHcmTest` 8/8 ✅ · `ErmDossierTest` 9/9 ✅ ·
  `EmployeeDocumentsRoutingTest` + `EssErmDocumentLoopTest` 7/7 ✅
- **Still to check by hand:** create an employee from the HR screen; upload a
  document from the ESS profile and confirm `EMP-####` / `DOC-#####` continue.

### 2b. `chatbot_unanswered` → `chatbot_messages` (70 → 69) ✅ Done (Nov 1, 2026)
- **Add columns:** `intent` (nullable). Unanswered rows use `source = 'unanswered'`.
- **Code:** `ChatbotUnanswered` model points to `chatbot_messages` with a scope on
  `source`, and maps `message`/`session_id`/`intent` as before.
- **Check:** `ChatbotFaqController` analytics must exclude unanswered rows when counting real chats.
- **Test:** ask the chatbot an unknown question → appears in the Unanswered list → dismiss works.
- **Migration:** `backend-laravel/database/migrations/2026_11_01_000002_merge_chatbot_unanswered_into_chatbot_messages.php`
- **Backup:** `database/backups/hotel_hr_before_phase2b.sql` (~972 KB)
- **Exclusions:** `ChatbotMessage::realConversations()` keeps unanswered rows out of
  analytics, the session list and the transcript; the feedback queue still sees them.
- **Checks done:** copy path tested with a probe row ✅ · migrate 70 → 69 ✅ ·
  rollback 69 → 70 restores `chatbot_unanswered`, its row and drops `intent` ✅ ·
  re-migrate 70 → 69 ✅ · probe row removed afterwards ✅ ·
  `ChatbotSecurityTest` 15/15 ✅ (includes the new unanswered-row test)
- **Still to check by hand:** ask the chatbot an unknown question, confirm it appears
  under Settings → Chatbot → Unanswered, then dismiss it.

### 2c. Login activity + block history → `audit_logs` (69 → 67) ✅ Done (Nov 1, 2026)
- **Add columns** to `audit_logs`: `user_agent`, `status`, `extra_json` (nullable).
- **Code:** `UserLoginActivity` scoped `module_name = 'Auth'`, `action = 'Login'`;
  `ApplicantBlockHistory` scoped `target_type = 'applicant'`, action `blocked`/`unblocked`.
  Accessors return the old field names (`login_at`, `performed_at`, `scope`, …).
- **Test:** log in → login history shows it; block/unblock an applicant → history shows it;
  `ApplicantAdministrativeFeatureTest`, `AuthFlowTest`.
- **Migration:** `backend-laravel/database/migrations/2026_11_01_000003_merge_login_and_block_history_into_audit_logs.php`
- **Backup:** `database/backups/hotel_hr_before_phase2c.sql` (~971 KB)
- **Exclusions:** existing `AuditLogger` rows (`'Applicant Blocked'` / `'Applicant Unblocked'`,
  `target_type = 'Applicant'`) stay separate from the scoped block trail. Login rows use
  `target_type = 'user'`; block rows keep `performed_by` and `scope` in `extra_json`.
- **Checks done:** copy path tested with a probe block row ✅ · migrate 69 → 67 ✅ ·
  rollback 67 → 69 restores both tables, all 139 login rows and the block row, and drops
  the new columns ✅ · re-migrate 69 → 67 ✅ · probe row removed afterwards ✅ ·
  `AuthFlowTest` 12/12 ✅ · `ApplicantAdministrativeFeatureTest` 11/11 ✅ ·
  `AuditLogTest` + `UserManagementTest` + `NotificationAndAuditTest` 23/23 ✅
- **Still to check by hand:** open a user's login history, then block/unblock an applicant
  and confirm both entries appear on the relevant screens.

### 2d. ESS logs → `ess_request_events` (67 → 65) ✅ Done (Nov 1, 2026)
- **New table:** `ess_request_events`, with `event_type`
  (`routing` / `status` / `attachment`) plus the routing, status and attachment columns.
- **Code:** `EssRequestRouting`, `EssRequestStatusHistory`, `EssRequestAttachment`
  each point at the shared table, scope every query by `event_type`, and expose the
  old key names (`ess_request_routing_id`, `ess_request_status_history_id`,
  `ess_request_attachment_id`). `EssRequest::routings()`, `statusHistory()` and
  `attachments()` keep their shapes; attachment download routes resolve the shared
  event key.
- **Check:** `EssRequestWorkflow::recordRouting()` only sees `event_type = 'routing'`
  when it computes the next `leg`.
- **Test:** `EssRequestWorkflowTest`, `EssErmDocumentLoopTest`; file a request,
  route it, upload an HR file, release it; timeline shows every step.
- **Migration:** `backend-laravel/database/migrations/2026_11_01_000004_merge_ess_request_logs_into_ess_request_events.php`
- **Backup:** `database/backups/hotel_hr_before_phase2d.sql` (~1.98 MB)
- **Checks done:** copy path tested with a probe routing, status and attachment row ✅ ·
  migrate 67 → 65 ✅ · rollback 65 → 67 restores all three tables, their rows,
  constraints and auto-increment keys, and drops `ess_request_events` ✅ ·
  re-migrate 67 → 65 ✅ · probe rows removed afterwards ✅ ·
  `EssRequestWorkflowTest` + `EssErmDocumentLoopTest` 9/9 (92 assertions) ✅ ·
  `EmployeeDocumentsRoutingTest` 3/3 ✅
- **Known unrelated failure:** `EssAdminSelfServiceTest` 3/7 — the seeded
  `bullseur` account is linked to employee 38, so the test's "unlinked superadmin"
  premise no longer matches the seed. It does not touch the ESS log tables.
- **Still to check by hand:** file an ESS request, approve/route it, upload the HR
  file, release it, and confirm the timeline and download still work.

### 2e. Applicant evaluations → `applicant_evaluations` (65 → 61) ✅ Done (Nov 1, 2026)
- **New table:** `applicant_evaluations`, with `eval_type`
  (`interview_assessment` / `assessment_test` / `practical_test` / `final_evaluation` / `assessment_invite`),
  shared columns (`applicant_id`, `assessor_user_id`, `evaluation_date`, `title`, `total_score`,
  `passing_score`, `result`, `outcome`, `remarks`, `scores_json`, `comments_json`, `questions_json`,
  `criteria_json`, `answers_json`, `token`, `status`), snapshot / recommendation columns for final
  evaluations, and `details_json`.
- **Absorbs:** `applicant_assessments`, `assessment_tests`, `practical_tests`, `final_evaluations`, `assessment_invites`.
- **Code:** all 5 models kept, each scoped by `eval_type`; Resources still return
  `assessment_id`, `assessment_test_id`, `practical_test_id`, `final_evaluation_id`, `assessment_invite_id`.
  `Applicant::assessment()`, `latestAssessmentTest()`, `latestPracticalTest()`, `finalEvaluation()`
  use `latestOfMany('evaluation_id')`.
- **Migration:** `backend-laravel/database/migrations/2026_11_01_000005_merge_evaluation_tables_into_applicant_evaluations.php`
- **Backup:** `database/backups/hotel_hr_before_phase2e.sql` (~984 KB)
- **Checks done:** migrate 65 → 61 ✅ · rollback 61 → 65 restores all five tables, their rows,
  constraints and indexes, and drops `applicant_evaluations` ✅ · re-migrate 65 → 61 ✅ ·
  `hotel_hr_seed_mysql.sql` updated for clean seed rebuilds ✅ ·
  `ApplicantAdministrativeFeatureTest` 11/11 ✅ · `ReturnToPipelineTest` 3/3 ✅ ·
  `OfferResponseMediumTest` 4/4 ✅ · `FinalEvaluationScoreServiceTest` 4/4 ✅
- **Still to check by hand:** full pipeline: interview → assessment link (public page + submit) →
  practical test → final evaluation → hire.

---

## 7. Phase 3 – Small code changes

**Result: 61 → 51. Risk: low–medium.** Each step changes a few backend files;
the API response shape stays the same, so the frontend is not changed.

| Step | Change | Files to touch | How to test |
|---|---|---|---|
| 3a | `applicant_screening_entities` + `applicant_screening_scores` → existing `applicant_screenings.entities_json` / `score_breakdown_json` | `ScreeningService` (stop extra inserts); `Applicant::screeningEntities()` / `screeningScores()` → accessors with the same array shape; remove them from `with([...])` in `ApplicantManagementController` | Upload a resume; applicant list badges and radar chart look the same |
| 3b | `payroll_periods` → columns already on `payroll_records` | Drop the foreign key only; seeders | ESS payslips page |
| 3c | `payroll_items` → `payroll_records.items_json` | `EssPortalController` payslip block, `MockPayrollProvider` | Payslip earnings/deductions match the backup |
| 3d | `job_post_platforms` → `job_posts.platforms_json` | `JobPost::platforms()` → accessor; platform save in `RecruitmentManagementController` | Publish a job to platforms; badges show |
| 3e | `recognition_reactions` → `social_recognitions.reactions_json` (`{employee_id: [types]}`) | Reaction toggle and "my reactions" in `EssPortalController`; `SocialRecognition::reactions()` | React / un-react; counts stay correct |
| 3f | `employee_learning_attempts` → `employee_learning.attempts_json` | Quiz submit in `EssPortalController`; `ResetQuizAttempt` command | Take a quiz; reset command still works |
| 3g | `employee_exit_records` → `employees.exit_type, exit_date, clearance_status, coe_status, exit_notes` | `EmployeeExitRecord` kept as a model reading `employees`; `DashboardController`; dossier/exit endpoints | Separate an employee; dashboard attrition and dossier exit tab |
| 3h | `screening_requirement_template_items` → `screening_requirement_templates.items_json` | Template model accessor; NLP dev script `nlp-service/tools/sync_demo_jobs_and_templates.py` | Screening still flags missing requirements |
| 3i | `employee_emergency_contacts` → `employees.emergency_contacts_json` | `EmployeeController`, `EmployeeDossierController`, ESS profile | Add/edit contacts in HR and ESS |

### 3a. Screening entities + scores → `applicant_screenings` (61 → 59) ✅ Done (Nov 1, 2026)
- **Absorbs:** `applicant_screening_entities` (135 rows), `applicant_screening_scores` (52 rows).
- **Strategy:** both child tables contained normalized copies of data already stored as JSON in
  `applicant_screenings.entities_json` and `applicant_screenings.score_breakdown_json`. The migration
  compiles the child rows into those JSON columns (creating a synthetic screening row for seed-only
  applicants 1–10 that had no `applicant_screenings` row), then drops the child tables.
- **Code:** `Applicant::screeningEntities` and `screeningScores` are now attribute accessors that
  hydrate `ApplicantScreeningEntity` / `ApplicantScreeningScore` model objects from
  `latestScreening->entities_json` and `score_breakdown_json`. The `ApplicantResource` emits
  the exact same `screening_entities` and `screening_scores` JSON keys.
  `ScreeningService::persistScreeningResult()` no longer inserts into the child tables.
- **Migration:** `backend-laravel/database/migrations/2026_11_01_000006_merge_screening_entities_and_scores_into_applicant_screenings.php`
- **Backup:** `database/backups/hotel_hr_before_phase3a.sql` (~979 KB)
- **Rollback data:** original rows saved in `system_settings` keys
  `migration_backup.applicant_screening_entities` / `…scores` / `…created_screening_ids`.
- **Checks done:** migrate 61 → 59 ✅ · rollback 59 → 61 restores both tables, all 135 entity
  rows and 52 score rows with original PKs, and removes synthetic screening rows ✅ ·
  re-migrate 61 → 59 ✅ · accessor verified for seed applicant (3 entities, 4 scores) and
  NLP-screened applicant (34 entities, 4 scores) ✅ ·
  `ApplicantAdministrativeFeatureTest` 11/11 ✅ · `ReturnToPipelineTest` 3/3 ✅ ·
  `OfferResponseMediumTest` 4/4 ✅ · `FinalEvaluationScoreServiceTest` 4/4 ✅
- **Still to check by hand:** upload a resume; confirm the applicant list badges and radar chart
  render the same entities and score breakdown.

### 3b. `payroll_periods` → columns on `payroll_records` (59 → 58) ✅ Done (Nov 1, 2026)
- **Dropped table:** `payroll_periods` (4 rows: June & July 2026 cut-offs).
- **Inlined columns:** `period_code` varchar(40) and `period_name` varchar(120) added to `payroll_records`.
  `pay_period_start`, `pay_period_end`, and `payout_date` already existed on `payroll_records`.
- **Code:** `EssPortalController` and `MockPayrollProvider` query `payroll_records` directly without joining
  `payroll_periods`; `payroll_records.payroll_period_id` retained as nullable for seeder compatibility.
- **Foreign key:** `fk_payroll_records_payroll_period_id` dropped.
- **Migration:** `backend-laravel/database/migrations/2026_11_01_000007_merge_payroll_periods_into_payroll_records.php`
- **Backup:** `database/backups/hotel_hr_before_phase3b.sql` (~1.00 MB)
- **Rollback data:** original rows saved in `system_settings` key `migration_backup.payroll_periods`.
- **Checks done:** migrate 59 → 58 ✅ · rollback 58 → 59 restores table, CHECK constraint,
  all 4 rows and re-adds FK ✅ · re-migrate 59 → 58 ✅ · payslip retrieval verified for
  employee 5 (PS-1 through PS-4) ✅ · `hotel_hr_seed_mysql.sql` updated ✅
- **Still to check by hand:** open ESS profile → Payslips tab and confirm pay history displays cleanly.

### 3c. `payroll_items` → `payroll_records.items_json` (58 → 57) ✅ Done (Nov 1, 2026)
- **Dropped table:** `payroll_items` (85 rows across 11 records).
- **Inlined column:** `items_json` longtext nullable on `payroll_records`, storing the item lines
  (`item_type` Earning/Deduction, `label`, `amount`, `created_at`).
- **Code:** `EssPortalController` extracts payslip lines and calendar-year YTD directly from
  `payroll_records.items_json`, falling back to `payroll_items` if present; `AdminEssProfileSeeder`
  inlines items upon seeding.
- **Migration:** `backend-laravel/database/migrations/2026_11_01_000008_merge_payroll_items_into_payroll_records.php`
- **Backup:** `database/backups/hotel_hr_before_phase3c.sql` (~1.00 MB)
- **Rollback data:** original rows saved in `system_settings` key `migration_backup.payroll_items`.
- **Checks done:** migrate 58 → 57 ✅ · rollback 57 → 58 restores table, all 85 rows,
  FK constraint, and CHECK constraint ✅ · re-migrate 58 → 57 ✅ · verified Record 1 earnings sum
  (10,600 == gross) and net (8,975 == net) ✅ · `hotel_hr_seed_mysql.sql` updated ✅
- **Still to check by hand:** open ESS profile → Payslips tab and confirm item lines and YTD totals match.

### 3d. `job_post_platforms` → `job_posts.platforms_json` (57 → 56) ✅ Done (Nov 1, 2026)
- **Dropped table:** `job_post_platforms` (14 rows across job posts 1–10).
- **Inlined column:** `platforms_json` longtext nullable on `job_posts`, storing each platform entry
  (`job_post_platform_id`, `job_post_id`, `platform`, `published_at`, `status`, `created_at`).
- **Code:** `JobPost::getPlatformsAttribute()` hydrates `JobPostPlatform` model objects from
  `platforms_json` (falling back to the live child table only during a rollback).
  `RecruitmentManagementController::syncPlatforms()` keeps `platforms_json` in step with the
  published/unpublished flags; `index()`/`show()` read platforms through the accessor, not a relation.
- **Migration:** `backend-laravel/database/migrations/2026_11_01_000009_merge_job_post_platforms_into_job_posts.php`
- **Backup:** `database/backups/hotel_hr_before_phase3d.sql` (~1.02 MB)
- **Rollback data:** original rows saved in `system_settings` key `migration_backup.job_post_platforms`.
- **Checks done:** migrate 57 → 56 ✅ · rollback 56 → 57 restores table, all 14 rows, the FK
  constraint and auto-increment ✅ · re-migrate 57 → 56 ✅ · accessor verified against seeded posts
  (job post 1 → Website/Facebook/Indeed; resource emits only `published` names) ✅ ·
  `hotel_hr_seed_mysql.sql` and `hotel_hr_staffing_extension.sql` updated to write `platforms_json` ✅
- **Still to check by hand:** publish a job to platforms and confirm the platform badges render.

### 3e. `recognition_reactions` → `social_recognitions.reactions_json` (56 → 55) ✅ Done (Nov 1, 2026)
- **Dropped table:** `recognition_reactions` (4 rows: employee reactions on recognitions 1, 2 and 4).
- **Inlined column:** `reactions_json` longtext nullable on `social_recognitions`, keyed
  `{ "employee_id": ["type", ...], ... }`.
- **Code:** `RecognitionReaction::byEmployee()`, `::toggle()` and `::record()` read/write
  `reactions_json` when the child table is absent (the Wall of Fame flow is unchanged);
  `EssPortalController::getRecognitions()` no longer eager-loads the dropped relation.
- **Migration:** `backend-laravel/database/migrations/2026_11_01_000010_merge_recognition_reactions_into_social_recognitions.php`
- **Backup:** `database/backups/hotel_hr_before_phase3e.sql` (~1.02 MB)
- **Rollback data:** original rows saved in `system_settings` key `migration_backup.recognition_reactions`.
- **Checks done:** migrate 56 → 55 ✅ · rollback 55 → 56 restores table, all 4 rows, FKs and
  auto-increment ✅ · re-migrate 56 → 55 ✅ · reaction toggle add/remove verified against live
  `reactions_json` ✅ · `/ess/recognitions` feed verified (6 recognitions, no eager-load crash) ✅ ·
  `hotel_hr_seed_mysql.sql` updated; live reactions restored to original seed values after testing ✅
- **Still to check by hand:** react / un-react to a Wall of Fame post and confirm counts and
  `userReactions` stay correct.

### 3f. `employee_learning_attempts` → `employee_learning.attempts_json` (55 → 54) ✅ Done (Nov 1, 2026)
- **Dropped table:** `employee_learning_attempts` (2 rows: failed quiz attempts for employee 5 / course 3).
- **Inlined column:** `attempts_json` longtext nullable on `employee_learning`, storing attempt objects
  (`attempt_id`, `score`, `correct_count`, `total_count`, `passed`, `answers_json`, `submitted_at`)
  ordered by attempt_id.
- **Code:** `EssPortalController::failedQuizAttempt()` returns the most recent failed attempt from
  `attempts_json`; `getMyPerformance()` derives failed course ids via
  `failedCourseIdsFromAttemptsJson()`; quiz submission appends the new attempt to `attempts_json`;
  `ResetQuizAttempt` (`ess:reset-quiz-attempt`) counts and clears attempts from `attempts_json`.
- **Migration:** `backend-laravel/database/migrations/2026_11_01_000011_merge_employee_learning_attempts_into_employee_learning.php`
- **Backup:** `database/backups/hotel_hr_before_phase3f.sql` (~1.03 MB)
- **Rollback data:** original rows saved in `system_settings` key `migration_backup.employee_learning_attempts`
  (+ `migration_backup.employee_learning_created_rows` for synthetic learning rows).
- **Checks done:** migrate 55 → 54 ✅ · rollback 54 → 55 restores table, all 2 rows with original
  IDs, FKs, indexes and auto-increment, drops `attempts_json` and cleans the backup keys ✅ ·
  re-migrate 55 → 54 ✅ · `failedQuizAttempt`, `failedCourseIdsFromAttemptsJson` and `learningRow`
  verified against the live DB ✅ · `ess:reset-quiz-attempt` reports `Attempts: 2 (2 failed)`
  from `attempts_json` and cancels safely ✅ · `CoreHcmTest` 8/8 ✅ · `ErmDossierTest` 9/9 ✅ ·
  `EssErmDocumentLoopTest` 4/4 ✅ · `EssRequestWorkflowTest` 5/5 ✅
- **Still to check by hand:** take an ESS LMS quiz, fail once and confirm retake is blocked and the
  performance card shows `quiz_failed`; run `ess:reset-quiz-attempt --force` and confirm the quiz unlocks.

### 3g. `employee_exit_records` → columns on `employees` (54 → 53) ✅ Done (Nov 1, 2026)
- **Dropped table:** `employee_exit_records` (0 rows: no live exits on the seeded data).
- **Inlined columns** on `employees`: `exit_type` varchar(30), `exit_date` date,
  `clearance_status` varchar(20), `coe_status` varchar(20), `exit_notes` text — all nullable.
- **Code:** `EmployeeExitRecord` kept as a model but now reads `employees` with a global scope
  `whereNotNull('exit_type')`, maps `exit_record_id = employee_id` and `notes = exit_notes`
  via accessors, so `Employee::exitRecord()`, the dossier exit endpoints and the dashboard
  attrition chart are unchanged. Write paths (`EmployeeController::exit()`, `rehire()`,
  `PromotionRequestController` terminate branch) set/clear the exit columns directly on the
  employee row inside the same `forceFill` that changes status.
- **Migration:** `backend-laravel/database/migrations/2026_11_01_000012_merge_employee_exit_records_into_employees.php`
- **Backup:** `database/backups/hotel_hr_before_phase3g.sql` (~657 KB)
- **Rollback data:** original rows saved in `system_settings` key `migration_backup.employee_exit_records`
  (0 rows today; `down()` also restores from the `employees` exit columns as a fallback).
- **Checks done:** migrate 54 → 53 ✅ · rollback 53 → 54 restores table, structure, indexes, FK and
  cleans the backup key ✅ · re-migrate 54 → 53 ✅ · write + accessor verified live (exit wrote to
  employee row; `exit_record_id`/`notes` map correctly; dossier `exit_record` payload identical to
  the old shape; scope count matches) ✅ · live employee restored to original state after test ✅ ·
  `CoreHcmTest` 8/8 ✅ · `ErmDossierTest` 9/9 ✅ (assertion now targets `employees.exit_type`).
- **Still to check by hand:** separate an employee from the HR profile and confirm the dashboard
  attrition chart and the dossier exit tab (clearance / COE) behave the same.

### 3h. `screening_requirement_template_items` → templates `items_json` (53 → 52) ✅ Done (Nov 1, 2026)
- **Dropped table:** `screening_requirement_template_items` (55 rows across 8 starter templates).
- **Inlined column:** `items_json` longtext nullable on `screening_requirement_templates`, storing each
  entity (`item_id`, `template_id`, `entity_type`, `value`, `required`, `created_at`) ordered by item_id.
- **Code:** `ScreeningRequirementTemplate::getItemsAttribute()` hydrates `ScreeningRequirementTemplateItem`
  model objects from `items_json` (falling back to the live child table only during a rollback), so the
  controller payload (`item_id` / `entity_type` / `value` / `required`) is unchanged.
  `ScreeningRequirementTemplateController` store/update/toggle write `items_json` directly
  (new `itemsToJson()` helper); the eager `items` relation load was dropped from `index()`/`store()`/`update()`.
- **Seeders:** `ScreeningRequirementTemplateSeeder` and `ScreeningDemoSeeder` write `items_json` instead of
  inserting child rows.
- **Migration:** `backend-laravel/database/migrations/2026_11_01_000013_merge_screening_requirement_template_items_into_templates.php`
- **Backup:** `database/backups/hotel_hr_before_phase3h.sql` (~705 KB)
- **Rollback data:** original rows saved in `system_settings` key `migration_backup.screening_requirement_template_items`
  (+ a fallback that rebuilds rows from each template's `items_json`).
- **Checks done:** migrate 53 → 52 ✅ · rollback 52 → 53 restores table, all 55 rows with original
  item_ids (1–62), the unique/index/FK constraints, drops `items_json` and cleans the backup key ✅ ·
  re-migrate 53 → 52 ✅ · accessor + controller payload verified for all 8 templates (55 inlined
  entities, payload keys identical, no empty templates) ✅ · `items_json` array cast + controller
  store/update write path verified (no double-encoding) ✅ · NLP dev script
  `sync_demo_jobs_and_templates.py` reviewed (only updates `screening_requirement_templates.name`,
  no item-table queries) ✅ · seed MySQL file needs no change (templates come from the PHP seeders) ✅ ·
  `ScreeningRequirementTemplateTest` 2/2 ✅ · `ApplicantAdministrativeFeatureTest` 11/11 ✅
- **Still to check by hand:** open Screening Setup → Requirement Templates in HR and confirm the items
  still render per template; apply a template in the Job Post Builder and confirm skills/qualifications
  seed the same as before.

### 3i. `employee_emergency_contacts` → `employees.emergency_contacts_json` (52 → 51) ✅ Done (Nov 1, 2026)
- **Dropped table:** `employee_emergency_contacts` (10 rows: one contact each for employees 1, 4, 5, 6, 8, 13, 14, 15, 16, 22).
- **Inlined column:** `emergency_contacts_json` longtext nullable on `employees`, storing each contact
  (`emergency_contact_id`, `employee_id`, `name`, `relationship`, `phone`, `address`, `is_primary`,
  `created_at`, `updated_at`) ordered by emergency_contact_id.
- **Code:** `Employee::emergencyContacts` is now an attribute accessor that hydrates
  `EmployeeEmergencyContact` model objects from `emergency_contacts_json` (falling back to the live
  child table only during a rollback), so the API shape is unchanged.
  `EmployeeDossierController` contact CRUD (`contacts`/`storeContact`/`updateContact`/`destroyContact`)
  now reads/writes the JSON column via new `contactsArray()`/`persistContacts()`/`hydrateContact()`
  helpers (stable ids, primary-flag demotion); `EmployeeDossierResource` emits contacts from the
  accessor without eager-loading; `EssPortalController` no longer eager-loads the dropped relation.
- **Migration:** `backend-laravel/database/migrations/2026_11_01_000014_merge_employee_emergency_contacts_into_employees.php`
- **Backup:** `database/backups/hotel_hr_before_phase3i.sql` (~1.04 MB)
- **Rollback data:** original rows saved in `system_settings` key `migration_backup.employee_emergency_contacts`
  (+ a fallback that rebuilds rows from each employee's `emergency_contacts_json`).
- **Checks done:** migrate 52 → 51 ✅ · rollback 51 → 52 restores table, all 10 rows with original
  emergency_contact_ids (1–10), the index and FK, drops the JSON column and cleans the backup key ✅ ·
  re-migrate 52 → 51 ✅ · accessor + EmergencyContactResource + dossier payload verified for seeded
  contacts (keys identical) ✅ · CRUD helpers (`contactsArray`) verified ✅ ·
  `hotel_hr_seed_mysql.sql` updated to inline contacts into `employees` ✅
- **Still to check by hand:** open an employee dossier → Emergency Contacts and add/edit/remove a contact,
  confirm the ESS profile emergency-contact block still renders.

---

## 8. Phase 4 – Optional, medium risk

**Result: 51 → 50 after 4a; 50 → 49 after 4b; 49 → 46 with 4c.** Do this only if you need to be in the 40s.

| Step | Change | Risk / note |
|---|---|---|
| 4a | ✅ `onboarding_checklist_items` → `onboarding_checklist_templates.items_json` | `employee_onboarding_items.template_item_id` points to it; keep stable item keys and keep the old IDs inside the JSON |
| 4b | ✅ `facilities` → `system_settings` key `interview.facilities` (keep the same IDs) | Replace rule `exists:facilities,facility_id` with an in-list rule; `Interview::facility()` becomes an accessor |
| 4c | ✅ `cache`, `cache_locks`, `sessions` → `CACHE_STORE=file`, `SESSION_DRIVER=file` | OTP/MFA codes and reset tokens live in the cache. On Dokploy a redeploy clears file cache, so users mid-login must retry. Better option: Redis |

### 4a. `onboarding_checklist_items` → templates `items_json` (51 → 50) ✅ Done (Nov 2, 2026)
- **Dropped table:** `onboarding_checklist_items` (18 rows across 3 starter templates).
- **Inlined column:** `items_json` longtext nullable on `onboarding_checklist_templates`, storing each item
  (`template_item_id`, `template_id`, `item_text`, `instructions`, `requires_upload`, `upload_placeholder`,
  `sort_order`, `created_at`) ordered by `sort_order` then `template_item_id`.
- **Stable keys:** `employee_onboarding_items.template_item_id` is kept as a plain integer (the FK is dropped).
  Every id stored inside `items_json` is the original `template_item_id`, and new items take the next id after
  both the template JSON and the applied employee rows, so a removed id is never handed to another requirement.
- **Code:** `OnboardingChecklistTemplate::items` is now an accessor that hydrates `OnboardingChecklistItem`
  model objects from `items_json` (falling back to the live child table only during a rollback). New helpers
  (`itemsArray`, `persistItems`, `syncItems`, `appendItem`, `updateItemById`, `removeItemById`, `findItem`)
  back the controller write paths. `EmployeeOnboardingItem::templateItem` resolves through `findItem()` instead
  of a relation; eager loads of `templateItem.template` were removed from `NewHire`, `NewHireController`,
  `EmployeeOnboardingItemController` and `EssPortalController`.
- **Controllers:** `ChecklistTemplateController` store/update/addItem/updateItem/destroyItem read and write
  `items_json`; `EmployeeOnboardingItemController` bulkCreate/materialize resolve template items from the JSON.
- **Seeders:** `hotel_hr_seed_mysql.sql` now writes the three starter templates with `items_json` and no longer
  inserts child rows.
- **Migration:** `backend-laravel/database/migrations/2026_11_01_000015_merge_onboarding_checklist_items_into_templates.php`
- **Backup:** `database/backups/hotel_hr_before_phase4a.sql` (~873 KB)
- **Rollback data:** original rows saved in `system_settings` key `migration_backup.onboarding_checklist_items`.
- **Checks done:** migrate 51 → 50 ✅ · rollback 50 → 51 restores the table, all 18 rows with original ids
  (1–18), the index, FK and auto-increment, re-adds the employee FK, drops `items_json` and cleans the backup
  key ✅ · re-migrate 51 → 50 ✅ · accessor verified for all 3 seeded templates (8/6/4 items), `findItem()`
  and `EmployeeOnboardingItem::templateItem` phase resolution verified ✅ · write helpers exercised on a
  throwaway template (sync → append → update → remove) ✅ · `OnboardingChecklistTemplateTest` 3/3 ✅ ·
  `AccessControlTest`, `CoreHcmTest`, `ErmDossierTest`, `EssErmDocumentLoopTest`, `EssRequestWorkflowTest`,
  `ScreeningRequirementTemplateTest` 42/42 ✅ · dev script `scripts/hrms-integration-test.php` updated to read
  `items_json` ✅
- **Still to check by hand:** open the checklist builder, create/edit a template with items, apply it in the
  onboarding pipeline, materialize a virtual item, and confirm the ESS checklist still shows the same items.

### 4b. `facilities` → `system_settings` `interview.facilities` (50 → 49) ✅ Done (Nov 2, 2026)
- **Dropped table:** `facilities` (4 rows: Room 1–3 on-site + Online Interview virtual room).
- **Inlined setting:** `system_settings` key `interview.facilities` stores a JSON array with every column
  (`facility_id`, `name`, `type`, `location`, `capacity`, `icon`, `description`, `is_active`, `created_at`,
  `updated_at`). The original `facility_id` values (1–4) are preserved, so `interviews.facility_id` remains a
  stable reference.
- **Stable key:** `interviews.facility_id` is kept as a plain integer; the FK `fk_interviews_facility_id` is
  dropped but its index `idx_interviews_facility_id` is kept. `ON DELETE SET NULL` semantics are no longer
  enforced by MySQL; the accessor simply returns `null` for a missing id.
- **Code:** `Facility::allFromSettings()` / `findFromSettings()` read the setting (falling back to the live table
  only during a rollback) and hydrate the same `Facility` model. `Interview::facility` is now an accessor backed
  by `findFromSettings()`; all `with('facility')` / `load('facility')` calls were removed and
  `InterviewResource` resolves the accessor directly, keeping the same `facility` payload keys.
  `StoreInterviewRequest` replaces `exists:facilities,facility_id` with `Rule::in(...)` over the setting.
  `FacilityController` filters/sorts the setting-backed collection and returns the identical response shape.
- **Seeders:** `SettingsDatabaseSeeder` now seeds the four default facilities (idempotent) and
  `hotel_hr_seed_mysql.sql` writes the same `interview.facilities` row with `INSERT IGNORE` (the consolidation
  migration already writes it on `migrate:fresh`).
- **Migration:** `backend-laravel/database/migrations/2026_11_01_000016_merge_facilities_into_system_settings.php`
- **Backup:** `database/backups/hotel_hr_before_phase4b.sql` (~858 KB)
- **Rollback data:** original rows saved in `system_settings` key `migration_backup.facilities`.
- **Checks done:** migrate 50 → 49 ✅ · rollback 49 → 50 restores the table, all 4 rows with original ids (1–4),
  the unique/index/check constraints and auto-increment (5), re-adds the interviews FK, drops the setting and
  backup key ✅ · re-migrate 50 → 49 ✅ · `Facility::allFromSettings()` returns 4 rows ✅ ·
  `Interview::find(6)->facility` resolves Room 1 ✅ · `Rule::in` accepts id 1 and rejects 999 ✅ ·
  `GET /api/v1/facilities` and `?type=Virtual` return the same payload ✅ ·
  `InterviewVirtualFacilityTest` 3/3 ✅ · full suite 179 passed / 4 failed (the known unrelated
  `EssAdminSelfServiceTest` ×3 and `ZoomMeetingSettingsTest` ×1 baseline) ✅ ·
  dev script `scripts/hrms-integration-test.php` reads `interview.facilities` ✅
- **Still to check by hand:** open the interview scheduler, pick Room 1–3 / Online Interview, book an on-site
  interview, confirm the facility-approval email, and confirm the facility list still renders.

### 4c. `cache`, `cache_locks`, `sessions` → file drivers (49 → 46) ✅ Done (Nov 2, 2026)
- **Dropped tables:** `cache` (16 rows: OTP / MFA / AI-breaker keys, all expired), `cache_locks` (0 rows),
  `sessions` (6 rows, all from Oct 19–21, older than `SESSION_LIFETIME` 120 min). No active data was lost.
- **Why it was safe:** nothing writes to these tables directly — verified there is no `DB::table('cache'|'cache_locks'|'sessions')`
  and no `assertDatabaseHas` on them anywhere in app code or tests. The file driver now holds the same transient data.
- **Driver switch:** `CACHE_STORE=file`, `SESSION_DRIVER=file` and `QUEUE_CONNECTION=sync` in
  `backend-laravel/.env` + `.env.example` (config defaults in `config/cache.php`, `config/session.php`,
  `config/queue.php` are already `file`/`file`/`sync`), `dokploy-backend.env` and `dokploy-backend.test.env`.
  No `jobs` / `failed_jobs` tables exist, so the queue stays on `sync`.
- **Code:** no app-code changes needed.
- **Migration:** `backend-laravel/database/migrations/2026_11_01_000017_drop_database_cache_and_session_tables.php`
  (`up()` snapshots each table into `system_settings` then drops; `down()` recreates the stock tables, restores the rows and cleans the keys).
- **Backup:** `database/backups/hotel_hr_before_phase4c.sql` (~879 KB)
- **Rollback data:** original rows saved in `system_settings` keys `migration_backup.cache` (16),
  `migration_backup.cache_locks` (0) and `migration_backup.sessions` (6).
- **Checks done:** migrate 49 → 46 ✅ · rollback 46 → 49 recreates the three stock tables and restores all
  16/0/6 rows, then cleans the backup keys ✅ · re-migrate 49 → 46 ✅ · file drivers probed end-to-end
  (`Cache::put/get/forget`, `Cache::lock` and `Session::put/get` all OK) ✅ · fresh-migrate chain verified on
  the `hrms_test` database (46 tables after running every migration) ✅ ·
  `AuthFlowTest` + `AuthLockoutTest` + `MfaTotpTest` + `ChatbotSecurityTest` + `CoreHcmTest` + `ErmDossierTest`
  50/50 (326 assertions) ✅
- **Still to check by hand:** log in with an OTP, use the MFA recovery code, trigger an AI breaker, and confirm
  `storage/framework/cache/…` / `storage/framework/sessions/…` fill in during those flows.

> **Queue note (resolved with 4c):** the Dokploy env files previously had `QUEUE_CONNECTION=database` with no
> `jobs` table. They now use `QUEUE_CONNECTION=sync`, matching `.env` and `.env.example`.

---

## 9. Phase 5 – Selected Consolidations & Restorations

**Executed Nov 4, 2026. Target state achieved: exactly 50 tables.**

Per docs/DATABASE_CONSOLIDATION_DECISION_RECORD.md, seven tables were restored and three targeted consolidations (5d, 5e, 5f) were executed, while high-risk merges (5a, 5b, 5c) were intentionally skipped.

### 9.1 Restorations (+7 tables)
1. **2d — ess_request_attachments (Restored):** Separated file attachments out of ess_request_events to give files independent lifecycle, upload handling, and direct relations (EssRequestAttachment).
2. **3b — payroll_periods (Restored):** Restored table and foreign key from payroll_records.payroll_period_id.
3. **3c — payroll_items (Restored):** Restored relational earnings/deductions table with foreign key to payroll_records.
4. **3e — 
ecognition_reactions (Restored):** Restored event-row table for Wall of Fame employee reactions.
5. **3f — employee_learning_attempts (Restored):** Restored discrete LMS attempt tracking (EmployeeLearningAttempt).
6. **3g — employee_exit_records (Restored):** Redesigned and restored as a dedicated table storing 1 row per separation cycle, preserving full multi-cycle separation and rehire history.
7. **4b — acilities (Restored):** Restored relational room booking table and foreign key on interviews.facility_id.

### 9.2 Phase 5 Consolidations Executed (-3 tables)
- **5d. work_schedules → employees.schedule_json (Done):**
  - Schema: JSON column schedule_json on employees.
  - Migration: 2026_11_04_000008_merge_work_schedules_into_employees.php.
  - Code: Employee cast and accessor work_schedules; MockAttendanceProvider reads schedule_json; AdminEssProfileSeeder updated.
- **5e. screening_ground_truths → pplicant_screenings columns (Done):**
  - Schema: Added 	rue_screening_result, ground_truth_notes, ground_truth_set_by directly to pplicant_screenings.
  - Migration: 2026_11_04_000009_merge_screening_ground_truths_into_applicant_screenings.php.
  - Code: ScreeningGroundTruth model scoped to pplicant_screenings; ScreeningEvaluationController and EvaluationService update/read screening rows directly.
- **5f. employee_benefits → employees.benefits_json (Done):**
  - Schema: JSON column enefits_json on employees.
  - Migration: 2026_11_04_000010_merge_employee_benefits_into_employees.php.
  - Code: Employee cast and accessor enefits; MockPayrollProvider reads enefits_json; AdminEssProfileSeeder updated.

### 9.3 Skipped Merges (Preserved Separate)
- **5a (pplicant_documents + employee_documents):** Kept separate due to disparate access rules, NLP verification pipelines, and ERM archival constraints.
- **5b (performance_reviews + hr3_recommendations):** Kept separate to preserve clean domain boundary between routine reviews and advisory recommendations.
- **5c (checklist_requests + ess_requests):** Kept separate to avoid polluting generic ESS request workflow with checklist state machine.

---

## 10. Final table list (50)

Verified on live hotel_hr and test hrms_test databases:

1. nnouncements
2. pplicant_documents
3. pplicant_evaluations
4. pplicant_screenings
5. pplicants
6. ttendance_records
7. udit_logs
8. chatbot_faqs
9. chatbot_messages
10. checklist_requests
11. code_sequences
12. departments
13. employee_documents
14. employee_exit_records *(restored)*
15. employee_learning
16. employee_learning_attempts *(restored)*
17. employee_onboarding_items
18. employee_position_history
19. employees *(inlines emergency_contacts_json, schedule_json, benefits_json)*
20. ess_categories
21. ess_request_attachments *(restored)*
22. ess_request_events
23. ess_requests
24. acilities *(restored)*
25. hr3_recommendations
26. interviews
27. job_posts *(inlines platforms_json)*
28. learning_courses
29. leave_balances
30. migrations
31. 
ew_hires
32. 
otifications
33. onboarding_checklist_templates *(inlines items_json)*
34. payroll_items *(restored)*
35. payroll_periods *(restored)*
36. payroll_records
37. performance_reviews
38. personal_access_tokens
39. positions
40. promotion_requests
41. 
ecognition_reactions *(restored)*
42. 
equisitions
43. 
ole_permissions
44. salary_grades
45. screening_reference_data
46. screening_requirement_templates *(inlines items_json)*
47. social_recognitions
48. system_roles
49. system_settings
50. system_users

---

## 11. How to do each merge

The same pattern is used for every step in Phases 2–4.

### 11.1 Migration template

```php
public function up(): void
{
    // 1. Create the new table or add columns (guard with hasTable/hasColumn)
    // 2. Copy rows: INSERT INTO new (...) SELECT ... FROM old
    // 3. Check: row counts match, otherwise throw (migration stops, nothing dropped)
    // 4. Drop foreign keys that point to the old table, then drop the old table
}

public function down(): void
{
    // 1. Recreate the old table with its original structure
    // 2. Copy rows back from the merged table
    // 3. Delete those rows / drop the added columns
}
```

### 11.2 Model template (keeps controllers unchanged)

```php
class PracticalTest extends Model
{
    protected $table = 'applicant_evaluations';
    protected $primaryKey = 'evaluation_id';

    protected static function booted(): void
    {
        static::addGlobalScope('type', fn ($q) => $q->where('eval_type', 'practical_test'));
        static::creating(fn ($m) => $m->eval_type = 'practical_test');
    }
}
```

The Resource keeps returning `'practical_test_id' => $this->evaluation_id`, so
the frontend sees the same JSON.

### 11.3 Steps for every merge

1. Back up (see section 13).
2. Search for every use of the table: `protected $table`, `DB::table('…')`,
   `->join('…')`, `exists:…` rules, raw SQL, seeders, tests, NLP dev scripts.
3. Write the migration and change the models.
4. `php artisan migrate`, then `php artisan migrate:rollback --step=1`, then migrate again.
5. Run the related tests and click through the screens.
6. Mark the step ✅ in section 3.

---

## 12. Testing

### 12.1 Automated

```bash
cd backend-laravel
php artisan test --filter=<RelatedTest>
php artisan test          # full suite (takes several minutes)
```

Tests use the separate `hrms_test` database (see `phpunit.xml`), so your real
data is never touched.

| Area | Tests |
|---|---|
| Login / OTP | `AuthFlowTest`, `AuthLockoutTest` |
| Applicants | `ApplicantAdministrativeFeatureTest`, `ReturnToPipelineTest`, `ApplicantRecognitionServiceTest` |
| ESS | `EssRequestWorkflowTest`, `EssErmDocumentLoopTest`, `EssAdminSelfServiceTest` |
| Core HCM / ERM | `CoreHcmTest`, `ErmDossierTest` |
| Access | `AccessControlTest`, `UserManagementTest` |

### 12.2 Manual click-through

- [ ] Login with OTP, forgot-password, MFA
- [ ] Applicant: upload resume → screening → interview (with facility) →
      assessment link → practical → final evaluation → hire
- [ ] Block / unblock / archive an applicant
- [ ] Job post: create, publish to platforms
- [ ] Onboarding checklist: items, uploads, review
- [ ] ESS: file request → route → module response → release; timeline; attachments
- [ ] ESS: payslips, learning quiz, recognitions, promotion request
- [ ] HR: employee profile, emergency contacts, separation, dashboard attrition
- [ ] Chatbot: FAQ answer, unanswered list, dismiss
- [ ] Audit logs and login history

---

## 13. Backup and rollback

**Before every step:**
```powershell
& 'C:\xampp1\mysql\bin\mysqldump.exe' -u root --routines --single-transaction hotel_hr `
  --result-file='database\backups\hotel_hr_before_<step>.sql'
```

**Undo the last step:**
```bash
cd backend-laravel
php artisan migrate:rollback --step=1
```

**Full restore:** import the matching backup in phpMyAdmin.

**Git:** nothing is committed. `database/backups/` is not in `.gitignore`, so
don't use `git add .` unless you want the backups committed.

---

## 14. Risks and open decisions

| # | Item | Recommendation |
|---|---|---|
| 1 | Target 40 vs 46 | 46 keeps everything safe; 40 needs Phase 5 (high risk) |
| 2 | `screening_ground_truths` | Keep while the thesis evaluation is needed |
| 3 | Cache/session to files (4c) | ✅ Done – file drivers in `.env`, `.env.example` and the Dokploy env files. A Dokploy redeploy clears file cache, so users mid-login must re-login; Redis remains the better long-term option |
| 4 | `QUEUE_CONNECTION=database` with no `jobs` table | ✅ Set to `sync` everywhere (no `jobs` / `failed_jobs` tables exist) |
| 5 | Dokploy production database | Apply each phase locally first, then on production with a backup |
| 6 | NLP dev scripts in `nlp-service/tools/*.py` | Update them if they query merged tables (not used by the running service) |
| 7 | `.kilo/worktrees/` copy | Ignore; never edit it |
| 2d | ess_request_routings + ess_request_status_histories → ess_request_events; ess_request_attachments restored | 66 | ✅ Done (Nov 4, 2026) |
| 2e | 4 evaluation tables → pplicant_evaluations | 62 | ✅ Done (Nov 1) |
| 3a | Screening entities + scores → pplicant_screenings | 60 | ✅ Done (Nov 1) |
| 3b | payroll_periods restored as dedicated table + FK to payroll_records | 61 | ✅ Done (Nov 4, 2026) |
| 3c | payroll_items restored as dedicated relational lines table | 62 | ✅ Done (Nov 4, 2026) |
| 3d | job_post_platforms → job_posts.platforms_json | 61 | ✅ Done (Nov 1, 2026) |
| 3e | 
ecognition_reactions restored as relational table | 62 | ✅ Done (Nov 4, 2026) |
| 3f | employee_learning_attempts restored as relational table | 63 | ✅ Done (Nov 4, 2026) |
| 3g | employee_exit_records restored (redesigned as 1-row-per-separation-cycle) | 64 | ✅ Done (Nov 4, 2026) |
| 3h | screening_requirement_template_items → templates items_json | 63 | ✅ Done (Nov 1, 2026) |
| 3i | employee_emergency_contacts → employees.emergency_contacts_json | 62 | ✅ Done (Nov 1, 2026) |
| 4a | onboarding_checklist_items → templates items_json | 61 | ✅ Done (Nov 2, 2026) |
| 4b | acilities restored as relational table + FK to interviews | 62 | ✅ Done (Nov 4, 2026) |
| 4c | cache, cache_locks, sessions kept dropped (file/Redis drivers) | 59 | ✅ Done (Nov 2, 2026) |
| 5a–5c| documents merge, performance_reviews merge, checklist_requests merge | 59 | ⬜ Skipped (preserved) |
| 5d | work_schedules → employees.schedule_json | 52 | ✅ Done (Nov 4, 2026) |
| 5e | screening_ground_truths → pplicant_screenings columns | 51 | ✅ Done (Nov 4, 2026) |
| 5f | employee_benefits → employees.benefits_json | 50 | ✅ Done (Nov 4, 2026) |

---

## 4. Verification results

Checked against the real code in `backend-laravel/` and `frontend/src/`.

### 4.1 Empty or near-empty tables

| Table | Rows | Written by | Read by / screen | Result |
|---|---|---|---|---|
| `applicant_block_history` | 0 | Block/unblock in `ApplicantManagementController` | `Applicant::blockHistories()`; feature test | **In use** |
| `chatbot_unanswered` | 0 | `ChatbotEngine::logUnanswered()` | `ChatbotFaqController`; `/chatbot/unanswered` | **In use** |
| `screening_ground_truths` | 0 | `POST applicants/{id}/ground-truth` | `EvaluationService` → SOP 2/3/5 metrics | **In use (thesis)** |
| `employee_exit_records` | 0 | `EmployeeController`, `PromotionRequestController`, `EmployeeDossierController` | Dashboard attrition chart | **In use** |
| `assessment_invites` | 0 | `AssessmentInviteController::store()` | Public assessment link pages | **In use** |
| `final_evaluations` | 0 | `FinalEvaluationController` | Hiring is blocked until it exists | **In use, critical** |
| `promotion_requests` | 0 | ESS portal, `PromotionRequestController` | HR promotion screens; test | **In use** |
| `ess_request_events` | 2 | All ESS routing, status and file events | ESS request timeline, admin routings, module adapters | **In use, critical – merged 2d (Nov 1)** |
| `cache_locks` | 0 | Laravel cache (`CACHE_STORE=database`) | OTP/MFA codes, reset tokens, AI breakers | **In use (framework)** |
| `password_reset_tokens` | 0 | Nothing | Nothing (reset tokens live in the cache) | **Unused → dropped** |

### 4.2 Non-empty tables that are also in use

| Table | Why it can't simply be dropped |
|---|---|
| `applicant_screening_entities`, `applicant_screening_scores` | Written by `ScreeningService`, shown on the applicant list and detail screens |
| `employee_code_sequences`, `document_code_sequences` | Row-locked number generators for employee and document codes |
| `facilities` | Interview form rule `exists:facilities,facility_id`; `Interview::facility()` |
| `payroll_periods` | Only a foreign key from `payroll_records` plus seed data (low use) |

### 4.3 Tables that stay untouched (core)

`employees`, `applicants`, `job_posts`, `positions`, `departments`,
`salary_grades`, `system_users`, `system_roles`, `role_permissions`,
`notifications`, `ess_requests`, `ess_categories`, `screening_reference_data`
(260 rows used by the NLP service), `personal_access_tokens`, `migrations`.


---

## 5. Phase 1 – Drop the unused table (done)

**Result: 72 → 71 tables. Completed Oct 31, 2026.**

| Item | Detail |
|---|---|
| Table removed | `password_reset_tokens` (0 rows, never used) |
| Why it was safe | Forgot/reset password uses `PasswordResetService`, which keeps tokens in the cache (`auth.reset.{token}`) |
| Migration | `backend-laravel/database/migrations/2026_10_31_000001_drop_unused_password_reset_tokens_table.php` |
| Backup | `database/backups/hotel_hr_before_phase1.sql` (~973 KB) |
| Checks done | Migrate ✅ · Rollback restores table ✅ · Re-migrate ✅ · `AuthFlowTest` + `AuthLockoutTest` 14/14 passed ✅ |
| Still to check by hand | Login with OTP, forgot-password page |

Not changed: `config/auth.php` (its setting is only read if Laravel's built-in
reset broker is used, and it isn't).

---

## 6. Phase 2 – Merge tables, same models

**Result: 71 → 61. Risk: low. Controllers, routes and screens are not changed.**
Do the steps in this order (safest first).

### 2a. Code sequences → `code_sequences` (71 → 70) ✅ Done (Nov 1, 2026)
- **New table:** `code_sequences (seq_key PK, next_val, updated_at)`.
- **Copy:** rows `employee_code` and `document_code` from the two old tables
  (values `37` and `11`; both generators still floor against existing rows).
- **Code:** `EmployeeLifecycleService::generateEmployeeCode()` and the document
  code generator use `where('seq_key', …)->lockForUpdate()`; logic otherwise identical.
- **Test:** create an employee; upload an employee document; codes keep counting up.
- **Migration:** `backend-laravel/database/migrations/2026_11_01_000001_create_code_sequences_table.php`
- **Backup:** `database/backups/hotel_hr_before_phase2a.sql` (~973 KB)
- **Checks done:** migrate 71 → 70 ✅ · rollback 70 → 71 restores both old tables
  and their counters ✅ · re-migrate 71 → 70 ✅ · table count verified ✅ ·
  `CoreHcmTest` 8/8 ✅ · `ErmDossierTest` 9/9 ✅ ·
  `EmployeeDocumentsRoutingTest` + `EssErmDocumentLoopTest` 7/7 ✅
- **Still to check by hand:** create an employee from the HR screen; upload a
  document from the ESS profile and confirm `EMP-####` / `DOC-#####` continue.

### 2b. `chatbot_unanswered` → `chatbot_messages` (70 → 69) ✅ Done (Nov 1, 2026)
- **Add columns:** `intent` (nullable). Unanswered rows use `source = 'unanswered'`.
- **Code:** `ChatbotUnanswered` model points to `chatbot_messages` with a scope on
  `source`, and maps `message`/`session_id`/`intent` as before.
- **Check:** `ChatbotFaqController` analytics must exclude unanswered rows when counting real chats.
- **Test:** ask the chatbot an unknown question → appears in the Unanswered list → dismiss works.
- **Migration:** `backend-laravel/database/migrations/2026_11_01_000002_merge_chatbot_unanswered_into_chatbot_messages.php`
- **Backup:** `database/backups/hotel_hr_before_phase2b.sql` (~972 KB)
- **Exclusions:** `ChatbotMessage::realConversations()` keeps unanswered rows out of
  analytics, the session list and the transcript; the feedback queue still sees them.
- **Checks done:** copy path tested with a probe row ✅ · migrate 70 → 69 ✅ ·
  rollback 69 → 70 restores `chatbot_unanswered`, its row and drops `intent` ✅ ·
  re-migrate 70 → 69 ✅ · probe row removed afterwards ✅ ·
  `ChatbotSecurityTest` 15/15 ✅ (includes the new unanswered-row test)
- **Still to check by hand:** ask the chatbot an unknown question, confirm it appears
  under Settings → Chatbot → Unanswered, then dismiss it.

### 2c. Login activity + block history → `audit_logs` (69 → 67) ✅ Done (Nov 1, 2026)
- **Add columns** to `audit_logs`: `user_agent`, `status`, `extra_json` (nullable).
- **Code:** `UserLoginActivity` scoped `module_name = 'Auth'`, `action = 'Login'`;
  `ApplicantBlockHistory` scoped `target_type = 'applicant'`, action `blocked`/`unblocked`.
  Accessors return the old field names (`login_at`, `performed_at`, `scope`, …).
- **Test:** log in → login history shows it; block/unblock an applicant → history shows it;
  `ApplicantAdministrativeFeatureTest`, `AuthFlowTest`.
- **Migration:** `backend-laravel/database/migrations/2026_11_01_000003_merge_login_and_block_history_into_audit_logs.php`
- **Backup:** `database/backups/hotel_hr_before_phase2c.sql` (~971 KB)
- **Exclusions:** existing `AuditLogger` rows (`'Applicant Blocked'` / `'Applicant Unblocked'`,
  `target_type = 'Applicant'`) stay separate from the scoped block trail. Login rows use
  `target_type = 'user'`; block rows keep `performed_by` and `scope` in `extra_json`.
- **Checks done:** copy path tested with a probe block row ✅ · migrate 69 → 67 ✅ ·
  rollback 67 → 69 restores both tables, all 139 login rows and the block row, and drops
  the new columns ✅ · re-migrate 69 → 67 ✅ · probe row removed afterwards ✅ ·
  `AuthFlowTest` 12/12 ✅ · `ApplicantAdministrativeFeatureTest` 11/11 ✅ ·
  `AuditLogTest` + `UserManagementTest` + `NotificationAndAuditTest` 23/23 ✅
- **Still to check by hand:** open a user's login history, then block/unblock an applicant
  and confirm both entries appear on the relevant screens.

### 2d. ESS logs → `ess_request_events` (67 → 65) ✅ Done (Nov 1, 2026)
- **New table:** `ess_request_events`, with `event_type`
  (`routing` / `status` / `attachment`) plus the routing, status and attachment columns.
- **Code:** `EssRequestRouting`, `EssRequestStatusHistory`, `EssRequestAttachment`
  each point at the shared table, scope every query by `event_type`, and expose the
  old key names (`ess_request_routing_id`, `ess_request_status_history_id`,
  `ess_request_attachment_id`). `EssRequest::routings()`, `statusHistory()` and
  `attachments()` keep their shapes; attachment download routes resolve the shared
  event key.
- **Check:** `EssRequestWorkflow::recordRouting()` only sees `event_type = 'routing'`
  when it computes the next `leg`.
- **Test:** `EssRequestWorkflowTest`, `EssErmDocumentLoopTest`; file a request,
  route it, upload an HR file, release it; timeline shows every step.
- **Migration:** `backend-laravel/database/migrations/2026_11_01_000004_merge_ess_request_logs_into_ess_request_events.php`
- **Backup:** `database/backups/hotel_hr_before_phase2d.sql` (~1.98 MB)
- **Checks done:** copy path tested with a probe routing, status and attachment row ✅ ·
  migrate 67 → 65 ✅ · rollback 65 → 67 restores all three tables, their rows,
  constraints and auto-increment keys, and drops `ess_request_events` ✅ ·
  re-migrate 67 → 65 ✅ · probe rows removed afterwards ✅ ·
  `EssRequestWorkflowTest` + `EssErmDocumentLoopTest` 9/9 (92 assertions) ✅ ·
  `EmployeeDocumentsRoutingTest` 3/3 ✅
- **Known unrelated failure:** `EssAdminSelfServiceTest` 3/7 — the seeded
  `bullseur` account is linked to employee 38, so the test's "unlinked superadmin"
  premise no longer matches the seed. It does not touch the ESS log tables.
- **Still to check by hand:** file an ESS request, approve/route it, upload the HR
  file, release it, and confirm the timeline and download still work.

### 2e. Applicant evaluations → `applicant_evaluations` (65 → 61) ✅ Done (Nov 1, 2026)
- **New table:** `applicant_evaluations`, with `eval_type`
  (`interview_assessment` / `assessment_test` / `practical_test` / `final_evaluation` / `assessment_invite`),
  shared columns (`applicant_id`, `assessor_user_id`, `evaluation_date`, `title`, `total_score`,
  `passing_score`, `result`, `outcome`, `remarks`, `scores_json`, `comments_json`, `questions_json`,
  `criteria_json`, `answers_json`, `token`, `status`), snapshot / recommendation columns for final
  evaluations, and `details_json`.
- **Absorbs:** `applicant_assessments`, `assessment_tests`, `practical_tests`, `final_evaluations`, `assessment_invites`.
- **Code:** all 5 models kept, each scoped by `eval_type`; Resources still return
  `assessment_id`, `assessment_test_id`, `practical_test_id`, `final_evaluation_id`, `assessment_invite_id`.
  `Applicant::assessment()`, `latestAssessmentTest()`, `latestPracticalTest()`, `finalEvaluation()`
  use `latestOfMany('evaluation_id')`.
- **Migration:** `backend-laravel/database/migrations/2026_11_01_000005_merge_evaluation_tables_into_applicant_evaluations.php`
- **Backup:** `database/backups/hotel_hr_before_phase2e.sql` (~984 KB)
- **Checks done:** migrate 65 → 61 ✅ · rollback 61 → 65 restores all five tables, their rows,
  constraints and indexes, and drops `applicant_evaluations` ✅ · re-migrate 65 → 61 ✅ ·
  `hotel_hr_seed_mysql.sql` updated for clean seed rebuilds ✅ ·
  `ApplicantAdministrativeFeatureTest` 11/11 ✅ · `ReturnToPipelineTest` 3/3 ✅ ·
  `OfferResponseMediumTest` 4/4 ✅ · `FinalEvaluationScoreServiceTest` 4/4 ✅
- **Still to check by hand:** full pipeline: interview → assessment link (public page + submit) →
  practical test → final evaluation → hire.

---

## 7. Phase 3 – Small code changes

**Result: 61 → 51. Risk: low–medium.** Each step changes a few backend files;
the API response shape stays the same, so the frontend is not changed.

| Step | Change | Files to touch | How to test |
|---|---|---|---|
| 3a | `applicant_screening_entities` + `applicant_screening_scores` → existing `applicant_screenings.entities_json` / `score_breakdown_json` | `ScreeningService` (stop extra inserts); `Applicant::screeningEntities()` / `screeningScores()` → accessors with the same array shape; remove them from `with([...])` in `ApplicantManagementController` | Upload a resume; applicant list badges and radar chart look the same |
| 3b | `payroll_periods` → columns already on `payroll_records` | Drop the foreign key only; seeders | ESS payslips page |
| 3c | `payroll_items` → `payroll_records.items_json` | `EssPortalController` payslip block, `MockPayrollProvider` | Payslip earnings/deductions match the backup |
| 3d | `job_post_platforms` → `job_posts.platforms_json` | `JobPost::platforms()` → accessor; platform save in `RecruitmentManagementController` | Publish a job to platforms; badges show |
| 3e | `recognition_reactions` → `social_recognitions.reactions_json` (`{employee_id: [types]}`) | Reaction toggle and "my reactions" in `EssPortalController`; `SocialRecognition::reactions()` | React / un-react; counts stay correct |
| 3f | `employee_learning_attempts` → `employee_learning.attempts_json` | Quiz submit in `EssPortalController`; `ResetQuizAttempt` command | Take a quiz; reset command still works |
| 3g | `employee_exit_records` → `employees.exit_type, exit_date, clearance_status, coe_status, exit_notes` | `EmployeeExitRecord` kept as a model reading `employees`; `DashboardController`; dossier/exit endpoints | Separate an employee; dashboard attrition and dossier exit tab |
| 3h | `screening_requirement_template_items` → `screening_requirement_templates.items_json` | Template model accessor; NLP dev script `nlp-service/tools/sync_demo_jobs_and_templates.py` | Screening still flags missing requirements |
| 3i | `employee_emergency_contacts` → `employees.emergency_contacts_json` | `EmployeeController`, `EmployeeDossierController`, ESS profile | Add/edit contacts in HR and ESS |

### 3a. Screening entities + scores → `applicant_screenings` (61 → 59) ✅ Done (Nov 1, 2026)
- **Absorbs:** `applicant_screening_entities` (135 rows), `applicant_screening_scores` (52 rows).
- **Strategy:** both child tables contained normalized copies of data already stored as JSON in
  `applicant_screenings.entities_json` and `applicant_screenings.score_breakdown_json`. The migration
  compiles the child rows into those JSON columns (creating a synthetic screening row for seed-only
  applicants 1–10 that had no `applicant_screenings` row), then drops the child tables.
- **Code:** `Applicant::screeningEntities` and `screeningScores` are now attribute accessors that
  hydrate `ApplicantScreeningEntity` / `ApplicantScreeningScore` model objects from
  `latestScreening->entities_json` and `score_breakdown_json`. The `ApplicantResource` emits
  the exact same `screening_entities` and `screening_scores` JSON keys.
  `ScreeningService::persistScreeningResult()` no longer inserts into the child tables.
- **Migration:** `backend-laravel/database/migrations/2026_11_01_000006_merge_screening_entities_and_scores_into_applicant_screenings.php`
- **Backup:** `database/backups/hotel_hr_before_phase3a.sql` (~979 KB)
- **Rollback data:** original rows saved in `system_settings` keys
  `migration_backup.applicant_screening_entities` / `…scores` / `…created_screening_ids`.
- **Checks done:** migrate 61 → 59 ✅ · rollback 59 → 61 restores both tables, all 135 entity
  rows and 52 score rows with original PKs, and removes synthetic screening rows ✅ ·
  re-migrate 61 → 59 ✅ · accessor verified for seed applicant (3 entities, 4 scores) and
  NLP-screened applicant (34 entities, 4 scores) ✅ ·
  `ApplicantAdministrativeFeatureTest` 11/11 ✅ · `ReturnToPipelineTest` 3/3 ✅ ·
  `OfferResponseMediumTest` 4/4 ✅ · `FinalEvaluationScoreServiceTest` 4/4 ✅
- **Still to check by hand:** upload a resume; confirm the applicant list badges and radar chart
  render the same entities and score breakdown.

### 3b. `payroll_periods` → columns on `payroll_records` (59 → 58) ✅ Done (Nov 1, 2026)
- **Dropped table:** `payroll_periods` (4 rows: June & July 2026 cut-offs).
- **Inlined columns:** `period_code` varchar(40) and `period_name` varchar(120) added to `payroll_records`.
  `pay_period_start`, `pay_period_end`, and `payout_date` already existed on `payroll_records`.
- **Code:** `EssPortalController` and `MockPayrollProvider` query `payroll_records` directly without joining
  `payroll_periods`; `payroll_records.payroll_period_id` retained as nullable for seeder compatibility.
- **Foreign key:** `fk_payroll_records_payroll_period_id` dropped.
- **Migration:** `backend-laravel/database/migrations/2026_11_01_000007_merge_payroll_periods_into_payroll_records.php`
- **Backup:** `database/backups/hotel_hr_before_phase3b.sql` (~1.00 MB)
- **Rollback data:** original rows saved in `system_settings` key `migration_backup.payroll_periods`.
- **Checks done:** migrate 59 → 58 ✅ · rollback 58 → 59 restores table, CHECK constraint,
  all 4 rows and re-adds FK ✅ · re-migrate 59 → 58 ✅ · payslip retrieval verified for
  employee 5 (PS-1 through PS-4) ✅ · `hotel_hr_seed_mysql.sql` updated ✅
- **Still to check by hand:** open ESS profile → Payslips tab and confirm pay history displays cleanly.

### 3c. `payroll_items` → `payroll_records.items_json` (58 → 57) ✅ Done (Nov 1, 2026)
- **Dropped table:** `payroll_items` (85 rows across 11 records).
- **Inlined column:** `items_json` longtext nullable on `payroll_records`, storing the item lines
  (`item_type` Earning/Deduction, `label`, `amount`, `created_at`).
- **Code:** `EssPortalController` extracts payslip lines and calendar-year YTD directly from
  `payroll_records.items_json`, falling back to `payroll_items` if present; `AdminEssProfileSeeder`
  inlines items upon seeding.
- **Migration:** `backend-laravel/database/migrations/2026_11_01_000008_merge_payroll_items_into_payroll_records.php`
- **Backup:** `database/backups/hotel_hr_before_phase3c.sql` (~1.00 MB)
- **Rollback data:** original rows saved in `system_settings` key `migration_backup.payroll_items`.
- **Checks done:** migrate 58 → 57 ✅ · rollback 57 → 58 restores table, all 85 rows,
  FK constraint, and CHECK constraint ✅ · re-migrate 58 → 57 ✅ · verified Record 1 earnings sum
  (10,600 == gross) and net (8,975 == net) ✅ · `hotel_hr_seed_mysql.sql` updated ✅
- **Still to check by hand:** open ESS profile → Payslips tab and confirm item lines and YTD totals match.

### 3d. `job_post_platforms` → `job_posts.platforms_json` (57 → 56) ✅ Done (Nov 1, 2026)
- **Dropped table:** `job_post_platforms` (14 rows across job posts 1–10).
- **Inlined column:** `platforms_json` longtext nullable on `job_posts`, storing each platform entry
  (`job_post_platform_id`, `job_post_id`, `platform`, `published_at`, `status`, `created_at`).
- **Code:** `JobPost::getPlatformsAttribute()` hydrates `JobPostPlatform` model objects from
  `platforms_json` (falling back to the live child table only during a rollback).
  `RecruitmentManagementController::syncPlatforms()` keeps `platforms_json` in step with the
  published/unpublished flags; `index()`/`show()` read platforms through the accessor, not a relation.
- **Migration:** `backend-laravel/database/migrations/2026_11_01_000009_merge_job_post_platforms_into_job_posts.php`
- **Backup:** `database/backups/hotel_hr_before_phase3d.sql` (~1.02 MB)
- **Rollback data:** original rows saved in `system_settings` key `migration_backup.job_post_platforms`.
- **Checks done:** migrate 57 → 56 ✅ · rollback 56 → 57 restores table, all 14 rows, the FK
  constraint and auto-increment ✅ · re-migrate 57 → 56 ✅ · accessor verified against seeded posts
  (job post 1 → Website/Facebook/Indeed; resource emits only `published` names) ✅ ·
  `hotel_hr_seed_mysql.sql` and `hotel_hr_staffing_extension.sql` updated to write `platforms_json` ✅
- **Still to check by hand:** publish a job to platforms and confirm the platform badges render.

### 3e. `recognition_reactions` → `social_recognitions.reactions_json` (56 → 55) ✅ Done (Nov 1, 2026)
- **Dropped table:** `recognition_reactions` (4 rows: employee reactions on recognitions 1, 2 and 4).
- **Inlined column:** `reactions_json` longtext nullable on `social_recognitions`, keyed
  `{ "employee_id": ["type", ...], ... }`.
- **Code:** `RecognitionReaction::byEmployee()`, `::toggle()` and `::record()` read/write
  `reactions_json` when the child table is absent (the Wall of Fame flow is unchanged);
  `EssPortalController::getRecognitions()` no longer eager-loads the dropped relation.
- **Migration:** `backend-laravel/database/migrations/2026_11_01_000010_merge_recognition_reactions_into_social_recognitions.php`
- **Backup:** `database/backups/hotel_hr_before_phase3e.sql` (~1.02 MB)
- **Rollback data:** original rows saved in `system_settings` key `migration_backup.recognition_reactions`.
- **Checks done:** migrate 56 → 55 ✅ · rollback 55 → 56 restores table, all 4 rows, FKs and
  auto-increment ✅ · re-migrate 56 → 55 ✅ · reaction toggle add/remove verified against live
  `reactions_json` ✅ · `/ess/recognitions` feed verified (6 recognitions, no eager-load crash) ✅ ·
  `hotel_hr_seed_mysql.sql` updated; live reactions restored to original seed values after testing ✅
- **Still to check by hand:** react / un-react to a Wall of Fame post and confirm counts and
  `userReactions` stay correct.

### 3f. `employee_learning_attempts` → `employee_learning.attempts_json` (55 → 54) ✅ Done (Nov 1, 2026)
- **Dropped table:** `employee_learning_attempts` (2 rows: failed quiz attempts for employee 5 / course 3).
- **Inlined column:** `attempts_json` longtext nullable on `employee_learning`, storing attempt objects
  (`attempt_id`, `score`, `correct_count`, `total_count`, `passed`, `answers_json`, `submitted_at`)
  ordered by attempt_id.
- **Code:** `EssPortalController::failedQuizAttempt()` returns the most recent failed attempt from
  `attempts_json`; `getMyPerformance()` derives failed course ids via
  `failedCourseIdsFromAttemptsJson()`; quiz submission appends the new attempt to `attempts_json`;
  `ResetQuizAttempt` (`ess:reset-quiz-attempt`) counts and clears attempts from `attempts_json`.
- **Migration:** `backend-laravel/database/migrations/2026_11_01_000011_merge_employee_learning_attempts_into_employee_learning.php`
- **Backup:** `database/backups/hotel_hr_before_phase3f.sql` (~1.03 MB)
- **Rollback data:** original rows saved in `system_settings` key `migration_backup.employee_learning_attempts`
  (+ `migration_backup.employee_learning_created_rows` for synthetic learning rows).
- **Checks done:** migrate 55 → 54 ✅ · rollback 54 → 55 restores table, all 2 rows with original
  IDs, FKs, indexes and auto-increment, drops `attempts_json` and cleans the backup keys ✅ ·
  re-migrate 55 → 54 ✅ · `failedQuizAttempt`, `failedCourseIdsFromAttemptsJson` and `learningRow`
  verified against the live DB ✅ · `ess:reset-quiz-attempt` reports `Attempts: 2 (2 failed)`
  from `attempts_json` and cancels safely ✅ · `CoreHcmTest` 8/8 ✅ · `ErmDossierTest` 9/9 ✅ ·
  `EssErmDocumentLoopTest` 4/4 ✅ · `EssRequestWorkflowTest` 5/5 ✅
- **Still to check by hand:** take an ESS LMS quiz, fail once and confirm retake is blocked and the
  performance card shows `quiz_failed`; run `ess:reset-quiz-attempt --force` and confirm the quiz unlocks.

### 3g. `employee_exit_records` → columns on `employees` (54 → 53) ✅ Done (Nov 1, 2026)
- **Dropped table:** `employee_exit_records` (0 rows: no live exits on the seeded data).
- **Inlined columns** on `employees`: `exit_type` varchar(30), `exit_date` date,
  `clearance_status` varchar(20), `coe_status` varchar(20), `exit_notes` text — all nullable.
- **Code:** `EmployeeExitRecord` kept as a model but now reads `employees` with a global scope
  `whereNotNull('exit_type')`, maps `exit_record_id = employee_id` and `notes = exit_notes`
  via accessors, so `Employee::exitRecord()`, the dossier exit endpoints and the dashboard
  attrition chart are unchanged. Write paths (`EmployeeController::exit()`, `rehire()`,
  `PromotionRequestController` terminate branch) set/clear the exit columns directly on the
  employee row inside the same `forceFill` that changes status.
- **Migration:** `backend-laravel/database/migrations/2026_11_01_000012_merge_employee_exit_records_into_employees.php`
- **Backup:** `database/backups/hotel_hr_before_phase3g.sql` (~657 KB)
- **Rollback data:** original rows saved in `system_settings` key `migration_backup.employee_exit_records`
  (0 rows today; `down()` also restores from the `employees` exit columns as a fallback).
- **Checks done:** migrate 54 → 53 ✅ · rollback 53 → 54 restores table, structure, indexes, FK and
  cleans the backup key ✅ · re-migrate 54 → 53 ✅ · write + accessor verified live (exit wrote to
  employee row; `exit_record_id`/`notes` map correctly; dossier `exit_record` payload identical to
  the old shape; scope count matches) ✅ · live employee restored to original state after test ✅ ·
  `CoreHcmTest` 8/8 ✅ · `ErmDossierTest` 9/9 ✅ (assertion now targets `employees.exit_type`).
- **Still to check by hand:** separate an employee from the HR profile and confirm the dashboard
  attrition chart and the dossier exit tab (clearance / COE) behave the same.

### 3h. `screening_requirement_template_items` → templates `items_json` (53 → 52) ✅ Done (Nov 1, 2026)
- **Dropped table:** `screening_requirement_template_items` (55 rows across 8 starter templates).
- **Inlined column:** `items_json` longtext nullable on `screening_requirement_templates`, storing each
  entity (`item_id`, `template_id`, `entity_type`, `value`, `required`, `created_at`) ordered by item_id.
- **Code:** `ScreeningRequirementTemplate::getItemsAttribute()` hydrates `ScreeningRequirementTemplateItem`
  model objects from `items_json` (falling back to the live child table only during a rollback), so the
  controller payload (`item_id` / `entity_type` / `value` / `required`) is unchanged.
  `ScreeningRequirementTemplateController` store/update/toggle write `items_json` directly
  (new `itemsToJson()` helper); the eager `items` relation load was dropped from `index()`/`store()`/`update()`.
- **Seeders:** `ScreeningRequirementTemplateSeeder` and `ScreeningDemoSeeder` write `items_json` instead of
  inserting child rows.
- **Migration:** `backend-laravel/database/migrations/2026_11_01_000013_merge_screening_requirement_template_items_into_templates.php`
- **Backup:** `database/backups/hotel_hr_before_phase3h.sql` (~705 KB)
- **Rollback data:** original rows saved in `system_settings` key `migration_backup.screening_requirement_template_items`
  (+ a fallback that rebuilds rows from each template's `items_json`).
- **Checks done:** migrate 53 → 52 ✅ · rollback 52 → 53 restores table, all 55 rows with original
  item_ids (1–62), the unique/index/FK constraints, drops `items_json` and cleans the backup key ✅ ·
  re-migrate 53 → 52 ✅ · accessor + controller payload verified for all 8 templates (55 inlined
  entities, payload keys identical, no empty templates) ✅ · `items_json` array cast + controller
  store/update write path verified (no double-encoding) ✅ · NLP dev script
  `sync_demo_jobs_and_templates.py` reviewed (only updates `screening_requirement_templates.name`,
  no item-table queries) ✅ · seed MySQL file needs no change (templates come from the PHP seeders) ✅ ·
  `ScreeningRequirementTemplateTest` 2/2 ✅ · `ApplicantAdministrativeFeatureTest` 11/11 ✅
- **Still to check by hand:** open Screening Setup → Requirement Templates in HR and confirm the items
  still render per template; apply a template in the Job Post Builder and confirm skills/qualifications
  seed the same as before.

### 3i. `employee_emergency_contacts` → `employees.emergency_contacts_json` (52 → 51) ✅ Done (Nov 1, 2026)
- **Dropped table:** `employee_emergency_contacts` (10 rows: one contact each for employees 1, 4, 5, 6, 8, 13, 14, 15, 16, 22).
- **Inlined column:** `emergency_contacts_json` longtext nullable on `employees`, storing each contact
  (`emergency_contact_id`, `employee_id`, `name`, `relationship`, `phone`, `address`, `is_primary`,
  `created_at`, `updated_at`) ordered by emergency_contact_id.
- **Code:** `Employee::emergencyContacts` is now an attribute accessor that hydrates
  `EmployeeEmergencyContact` model objects from `emergency_contacts_json` (falling back to the live
  child table only during a rollback), so the API shape is unchanged.
  `EmployeeDossierController` contact CRUD (`contacts`/`storeContact`/`updateContact`/`destroyContact`)
  now reads/writes the JSON column via new `contactsArray()`/`persistContacts()`/`hydrateContact()`
  helpers (stable ids, primary-flag demotion); `EmployeeDossierResource` emits contacts from the
  accessor without eager-loading; `EssPortalController` no longer eager-loads the dropped relation.
- **Migration:** `backend-laravel/database/migrations/2026_11_01_000014_merge_employee_emergency_contacts_into_employees.php`
- **Backup:** `database/backups/hotel_hr_before_phase3i.sql` (~1.04 MB)
- **Rollback data:** original rows saved in `system_settings` key `migration_backup.employee_emergency_contacts`
  (+ a fallback that rebuilds rows from each employee's `emergency_contacts_json`).
- **Checks done:** migrate 52 → 51 ✅ · rollback 51 → 52 restores table, all 10 rows with original
  emergency_contact_ids (1–10), the index and FK, drops the JSON column and cleans the backup key ✅ ·
  re-migrate 52 → 51 ✅ · accessor + EmergencyContactResource + dossier payload verified for seeded
  contacts (keys identical) ✅ · CRUD helpers (`contactsArray`) verified ✅ ·
  `hotel_hr_seed_mysql.sql` updated to inline contacts into `employees` ✅
- **Still to check by hand:** open an employee dossier → Emergency Contacts and add/edit/remove a contact,
  confirm the ESS profile emergency-contact block still renders.

---

## 8. Phase 4 – Optional, medium risk

**Result: 51 → 50 after 4a; 50 → 49 after 4b; 49 → 46 with 4c.** Do this only if you need to be in the 40s.

| Step | Change | Risk / note |
|---|---|---|
| 4a | ✅ `onboarding_checklist_items` → `onboarding_checklist_templates.items_json` | `employee_onboarding_items.template_item_id` points to it; keep stable item keys and keep the old IDs inside the JSON |
| 4b | ✅ `facilities` → `system_settings` key `interview.facilities` (keep the same IDs) | Replace rule `exists:facilities,facility_id` with an in-list rule; `Interview::facility()` becomes an accessor |
| 4c | ✅ `cache`, `cache_locks`, `sessions` → `CACHE_STORE=file`, `SESSION_DRIVER=file` | OTP/MFA codes and reset tokens live in the cache. On Dokploy a redeploy clears file cache, so users mid-login must retry. Better option: Redis |

### 4a. `onboarding_checklist_items` → templates `items_json` (51 → 50) ✅ Done (Nov 2, 2026)
- **Dropped table:** `onboarding_checklist_items` (18 rows across 3 starter templates).
- **Inlined column:** `items_json` longtext nullable on `onboarding_checklist_templates`, storing each item
  (`template_item_id`, `template_id`, `item_text`, `instructions`, `requires_upload`, `upload_placeholder`,
  `sort_order`, `created_at`) ordered by `sort_order` then `template_item_id`.
- **Stable keys:** `employee_onboarding_items.template_item_id` is kept as a plain integer (the FK is dropped).
  Every id stored inside `items_json` is the original `template_item_id`, and new items take the next id after
  both the template JSON and the applied employee rows, so a removed id is never handed to another requirement.
- **Code:** `OnboardingChecklistTemplate::items` is now an accessor that hydrates `OnboardingChecklistItem`
  model objects from `items_json` (falling back to the live child table only during a rollback). New helpers
  (`itemsArray`, `persistItems`, `syncItems`, `appendItem`, `updateItemById`, `removeItemById`, `findItem`)
  back the controller write paths. `EmployeeOnboardingItem::templateItem` resolves through `findItem()` instead
  of a relation; eager loads of `templateItem.template` were removed from `NewHire`, `NewHireController`,
  `EmployeeOnboardingItemController` and `EssPortalController`.
- **Controllers:** `ChecklistTemplateController` store/update/addItem/updateItem/destroyItem read and write
  `items_json`; `EmployeeOnboardingItemController` bulkCreate/materialize resolve template items from the JSON.
- **Seeders:** `hotel_hr_seed_mysql.sql` now writes the three starter templates with `items_json` and no longer
  inserts child rows.
- **Migration:** `backend-laravel/database/migrations/2026_11_01_000015_merge_onboarding_checklist_items_into_templates.php`
- **Backup:** `database/backups/hotel_hr_before_phase4a.sql` (~873 KB)
- **Rollback data:** original rows saved in `system_settings` key `migration_backup.onboarding_checklist_items`.
- **Checks done:** migrate 51 → 50 ✅ · rollback 50 → 51 restores the table, all 18 rows with original ids
  (1–18), the index, FK and auto-increment, re-adds the employee FK, drops `items_json` and cleans the backup
  key ✅ · re-migrate 51 → 50 ✅ · accessor verified for all 3 seeded templates (8/6/4 items), `findItem()`
  and `EmployeeOnboardingItem::templateItem` phase resolution verified ✅ · write helpers exercised on a
  throwaway template (sync → append → update → remove) ✅ · `OnboardingChecklistTemplateTest` 3/3 ✅ ·
  `AccessControlTest`, `CoreHcmTest`, `ErmDossierTest`, `EssErmDocumentLoopTest`, `EssRequestWorkflowTest`,
  `ScreeningRequirementTemplateTest` 42/42 ✅ · dev script `scripts/hrms-integration-test.php` updated to read
  `items_json` ✅
- **Still to check by hand:** open the checklist builder, create/edit a template with items, apply it in the
  onboarding pipeline, materialize a virtual item, and confirm the ESS checklist still shows the same items.

### 4b. `facilities` → `system_settings` `interview.facilities` (50 → 49) ✅ Done (Nov 2, 2026)
- **Dropped table:** `facilities` (4 rows: Room 1–3 on-site + Online Interview virtual room).
- **Inlined setting:** `system_settings` key `interview.facilities` stores a JSON array with every column
  (`facility_id`, `name`, `type`, `location`, `capacity`, `icon`, `description`, `is_active`, `created_at`,
  `updated_at`). The original `facility_id` values (1–4) are preserved, so `interviews.facility_id` remains a
  stable reference.
- **Stable key:** `interviews.facility_id` is kept as a plain integer; the FK `fk_interviews_facility_id` is
  dropped but its index `idx_interviews_facility_id` is kept. `ON DELETE SET NULL` semantics are no longer
  enforced by MySQL; the accessor simply returns `null` for a missing id.
- **Code:** `Facility::allFromSettings()` / `findFromSettings()` read the setting (falling back to the live table
  only during a rollback) and hydrate the same `Facility` model. `Interview::facility` is now an accessor backed
  by `findFromSettings()`; all `with('facility')` / `load('facility')` calls were removed and
  `InterviewResource` resolves the accessor directly, keeping the same `facility` payload keys.
  `StoreInterviewRequest` replaces `exists:facilities,facility_id` with `Rule::in(...)` over the setting.
  `FacilityController` filters/sorts the setting-backed collection and returns the identical response shape.
- **Seeders:** `SettingsDatabaseSeeder` now seeds the four default facilities (idempotent) and
  `hotel_hr_seed_mysql.sql` writes the same `interview.facilities` row with `INSERT IGNORE` (the consolidation
  migration already writes it on `migrate:fresh`).
- **Migration:** `backend-laravel/database/migrations/2026_11_01_000016_merge_facilities_into_system_settings.php`
- **Backup:** `database/backups/hotel_hr_before_phase4b.sql` (~858 KB)
- **Rollback data:** original rows saved in `system_settings` key `migration_backup.facilities`.
- **Checks done:** migrate 50 → 49 ✅ · rollback 49 → 50 restores the table, all 4 rows with original ids (1–4),
  the unique/index/check constraints and auto-increment (5), re-adds the interviews FK, drops the setting and
  backup key ✅ · re-migrate 50 → 49 ✅ · `Facility::allFromSettings()` returns 4 rows ✅ ·
  `Interview::find(6)->facility` resolves Room 1 ✅ · `Rule::in` accepts id 1 and rejects 999 ✅ ·
  `GET /api/v1/facilities` and `?type=Virtual` return the same payload ✅ ·
  `InterviewVirtualFacilityTest` 3/3 ✅ · full suite 179 passed / 4 failed (the known unrelated
  `EssAdminSelfServiceTest` ×3 and `ZoomMeetingSettingsTest` ×1 baseline) ✅ ·
  dev script `scripts/hrms-integration-test.php` reads `interview.facilities` ✅
- **Still to check by hand:** open the interview scheduler, pick Room 1–3 / Online Interview, book an on-site
  interview, confirm the facility-approval email, and confirm the facility list still renders.

### 4c. `cache`, `cache_locks`, `sessions` → file drivers (49 → 46) ✅ Done (Nov 2, 2026)
- **Dropped tables:** `cache` (16 rows: OTP / MFA / AI-breaker keys, all expired), `cache_locks` (0 rows),
  `sessions` (6 rows, all from Oct 19–21, older than `SESSION_LIFETIME` 120 min). No active data was lost.
- **Why it was safe:** nothing writes to these tables directly — verified there is no `DB::table('cache'|'cache_locks'|'sessions')`
  and no `assertDatabaseHas` on them anywhere in app code or tests. The file driver now holds the same transient data.
- **Driver switch:** `CACHE_STORE=file`, `SESSION_DRIVER=file` and `QUEUE_CONNECTION=sync` in
  `backend-laravel/.env` + `.env.example` (config defaults in `config/cache.php`, `config/session.php`,
  `config/queue.php` are already `file`/`file`/`sync`), `dokploy-backend.env` and `dokploy-backend.test.env`.
  No `jobs` / `failed_jobs` tables exist, so the queue stays on `sync`.
- **Code:** no app-code changes needed.
- **Migration:** `backend-laravel/database/migrations/2026_11_01_000017_drop_database_cache_and_session_tables.php`
  (`up()` snapshots each table into `system_settings` then drops; `down()` recreates the stock tables, restores the rows and cleans the keys).
- **Backup:** `database/backups/hotel_hr_before_phase4c.sql` (~879 KB)
- **Rollback data:** original rows saved in `system_settings` keys `migration_backup.cache` (16),
  `migration_backup.cache_locks` (0) and `migration_backup.sessions` (6).
- **Checks done:** migrate 49 → 46 ✅ · rollback 46 → 49 recreates the three stock tables and restores all
  16/0/6 rows, then cleans the backup keys ✅ · re-migrate 49 → 46 ✅ · file drivers probed end-to-end
  (`Cache::put/get/forget`, `Cache::lock` and `Session::put/get` all OK) ✅ · fresh-migrate chain verified on
  the `hrms_test` database (46 tables after running every migration) ✅ ·
  `AuthFlowTest` + `AuthLockoutTest` + `MfaTotpTest` + `ChatbotSecurityTest` + `CoreHcmTest` + `ErmDossierTest`
  50/50 (326 assertions) ✅
- **Still to check by hand:** log in with an OTP, use the MFA recovery code, trigger an AI breaker, and confirm
  `storage/framework/cache/…` / `storage/framework/sessions/…` fill in during those flows.

> **Queue note (resolved with 4c):** the Dokploy env files previously had `QUEUE_CONNECTION=database` with no
> `jobs` table. They now use `QUEUE_CONNECTION=sync`, matching `.env` and `.env.example`.

---

## 9. Phase 5 – Optional, to reach 40

**Result: 46 → 40. Risk: high.** These merge unrelated data. Only do this if
40 is a hard requirement (for example from your adviser).

| Step | Change | Why it's risky |
|---|---|---|
| 5a | `applicant_documents` + `employee_documents` → `documents` with `owner_type` | Different file paths, NLP verification fields, soft deletes |
| 5b | `performance_reviews` → `hr3_recommendations` (`recommendation_type = 'review'`) | Mixes two HR3 concepts |
| 5c | `checklist_requests` → `ess_requests` (an "Onboarding Checklist" category) | Changes the onboarding request flow |
| 5d | `work_schedules` → `employees.schedule_json` | `MockAttendanceProvider`, `AdminEssProfileSeeder` |
| 5e | `screening_ground_truths` → `applicant_screenings` (ground-truth columns) | Thesis SOP 2/3/5 metrics depend on it |
| 5f | `employee_benefits` → `employees.benefits_json` | Payroll provider seam |

---

## 10. Final table list (46)

After Phase 4:

`announcements`, `applicants`, `applicant_documents`, `applicant_evaluations`,
`applicant_screenings`, `attendance_records`, `audit_logs`, `chatbot_faqs`,
`chatbot_messages`, `checklist_requests`, `code_sequences`, `departments`,
`employees`, `employee_benefits`, `employee_documents`, `employee_learning`,
`employee_onboarding_items`, `employee_position_history`, `ess_categories`,
`ess_requests`, `ess_request_events`, `hr3_recommendations`, `interviews`,
`job_posts`, `learning_courses`, `leave_balances`, `migrations`, `new_hires`,
`notifications`, `onboarding_checklist_templates`, `payroll_records`,
`performance_reviews`, `personal_access_tokens`, `positions`,
`promotion_requests`, `requisitions`, `role_permissions`, `salary_grades`,
`screening_ground_truths`, `screening_reference_data`,
`screening_requirement_templates`, `social_recognitions`, `system_roles`,
`system_settings`, `system_users`, `work_schedules`

---

## 11. How to do each merge

The same pattern is used for every step in Phases 2–4.

### 11.1 Migration template

```php
public function up(): void
{
    // 1. Create the new table or add columns (guard with hasTable/hasColumn)
    // 2. Copy rows: INSERT INTO new (...) SELECT ... FROM old
    // 3. Check: row counts match, otherwise throw (migration stops, nothing dropped)
    // 4. Drop foreign keys that point to the old table, then drop the old table
}

public function down(): void
{
    // 1. Recreate the old table with its original structure
    // 2. Copy rows back from the merged table
    // 3. Delete those rows / drop the added columns
}
```

### 11.2 Model template (keeps controllers unchanged)

```php
class PracticalTest extends Model
{
    protected $table = 'applicant_evaluations';
    protected $primaryKey = 'evaluation_id';

    protected static function booted(): void
    {
        static::addGlobalScope('type', fn ($q) => $q->where('eval_type', 'practical_test'));
        static::creating(fn ($m) => $m->eval_type = 'practical_test');
    }
}
```

The Resource keeps returning `'practical_test_id' => $this->evaluation_id`, so
the frontend sees the same JSON.

### 11.3 Steps for every merge

1. Back up (see section 13).
2. Search for every use of the table: `protected $table`, `DB::table('…')`,
   `->join('…')`, `exists:…` rules, raw SQL, seeders, tests, NLP dev scripts.
3. Write the migration and change the models.
4. `php artisan migrate`, then `php artisan migrate:rollback --step=1`, then migrate again.
5. Run the related tests and click through the screens.
6. Mark the step ✅ in section 3.

---

## 12. Testing

### 12.1 Automated

```bash
cd backend-laravel
php artisan test --filter=<RelatedTest>
php artisan test          # full suite (takes several minutes)
```

Tests use the separate `hrms_test` database (see `phpunit.xml`), so your real
data is never touched.

| Area | Tests |
|---|---|
| Login / OTP | `AuthFlowTest`, `AuthLockoutTest` |
| Applicants | `ApplicantAdministrativeFeatureTest`, `ReturnToPipelineTest`, `ApplicantRecognitionServiceTest` |
| ESS | `EssRequestWorkflowTest`, `EssErmDocumentLoopTest`, `EssAdminSelfServiceTest` |
| Core HCM / ERM | `CoreHcmTest`, `ErmDossierTest` |
| Access | `AccessControlTest`, `UserManagementTest` |

### 12.2 Manual click-through

- [ ] Login with OTP, forgot-password, MFA
- [ ] Applicant: upload resume → screening → interview (with facility) →
      assessment link → practical → final evaluation → hire
- [ ] Block / unblock / archive an applicant
- [ ] Job post: create, publish to platforms
- [ ] Onboarding checklist: items, uploads, review
- [ ] ESS: file request → route → module response → release; timeline; attachments
- [ ] ESS: payslips, learning quiz, recognitions, promotion request
- [ ] HR: employee profile, emergency contacts, separation, dashboard attrition
- [ ] Chatbot: FAQ answer, unanswered list, dismiss
- [ ] Audit logs and login history

---

## 13. Backup and rollback

**Before every step:**
```powershell
& 'C:\xampp1\mysql\bin\mysqldump.exe' -u root --routines --single-transaction hotel_hr `
  --result-file='database\backups\hotel_hr_before_<step>.sql'
```

**Undo the last step:**
```bash
cd backend-laravel
php artisan migrate:rollback --step=1
```

**Full restore:** import the matching backup in phpMyAdmin.

**Git:** nothing is committed. `database/backups/` is not in `.gitignore`, so
don't use `git add .` unless you want the backups committed.

---

## 14. Risks and open decisions

| # | Item | Recommendation |
|---|---|---|
| 1 | Target 40 vs 46 | 46 keeps everything safe; 40 needs Phase 5 (high risk) |
| 2 | `screening_ground_truths` | Keep while the thesis evaluation is needed |
| 3 | Cache/session to files (4c) | ✅ Done – file drivers in `.env`, `.env.example` and the Dokploy env files. A Dokploy redeploy clears file cache, so users mid-login must re-login; Redis remains the better long-term option |
| 4 | `QUEUE_CONNECTION=database` with no `jobs` table | ✅ Set to `sync` everywhere (no `jobs` / `failed_jobs` tables exist) |
| 5 | Dokploy production database | Apply each phase locally first, then on production with a backup |
| 6 | NLP dev scripts in `nlp-service/tools/*.py` | Update them if they query merged tables (not used by the running service) |
| 7 | `.kilo/worktrees/` copy | Ignore; never edit it |

