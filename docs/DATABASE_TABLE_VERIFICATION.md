# Database Table Verification & Revised Consolidation Plan

Source: `database/hotel_hr (oct 27).sql` (72 tables) + live code in
`backend-laravel/` and `frontend/src/` (the `.kilo/worktrees` copy was ignored).

**Rule used:** a table is judged by *code usage* (writer, reader, API route, UI),
**not** by its row count. An empty table usually means "feature not used yet".

---

## 1. Verification of empty / near-empty tables

| Table | Rows | Writer (inserts) | Reader / Route / UI | Verdict |
|---|---|---|---|---|
| `applicant_block_history` | 0 | `ApplicantManagementController` block (L1789) / unblock (L1859) | `Applicant::blockHistories()`; `ApplicantAdministrativeFeatureTest` | **ACTIVE – merged into `audit_logs` (2c, Nov 1)** |
| `chatbot_unanswered` | 0 | `ChatbotEngine::logUnanswered()` | `ChatbotFaqController`; frontend `/chatbot/unanswered` | **ACTIVE – merged into `chatbot_messages` (2b, Nov 1)** |
| `screening_ground_truths` | 0 | `ScreeningEvaluationController::storeGroundTruth()` | `EvaluationService` → SOP 2/3/5 routes | **ACTIVE (thesis metrics)** |
| `employee_exit_records` | 0 | `EmployeeController`, `PromotionRequestController`, `EmployeeDossierController` | `DashboardController` attrition, `Employee::exitRecord()` | **ACTIVE** |
| `assessment_invites` | 0 | `AssessmentInviteController::store()` | public `assessment-invites/{token}` + `/submit` | **ACTIVE** |
| `final_evaluations` | 0 | `FinalEvaluationController::store()` | hiring gate in `ApplicantManagementController` | **ACTIVE – critical** |
| `promotion_requests` | 0 | `EssPortalController`, `PromotionRequestController` | HR promotion screens; `CoreHcmTest` | **ACTIVE** |
| `ess_request_events` | 2 | `EssRequestWorkflow`, ESS Portal/Admin controllers, `PromotionRequestController` | `EssRequest::routings()` / `statusHistory()` / `attachments()`, `EssAdminController::routings()`, `BaseModuleAdapter` | **ACTIVE – critical; merged 2d (Nov 1)** |
| `cache_locks` | 0 | Laravel (`CACHE_STORE=database`) | OTP/MFA login + AI breakers use Cache | **ACTIVE (framework) – dropped with 4c (Nov 2): cache, cache_locks and sessions moved to file drivers** |
| `password_reset_tokens` | 0 | none (no `Password::` broker usage) | only default in `config/auth.php` | **UNUSED – safe to drop** |

Non-empty tables previously proposed for removal – re-verified:

| Table | Verdict |
|---|---|
| `applicant_screening_entities`, `applicant_screening_scores` | **ACTIVE** – written by `ScreeningService`, eager-loaded in applicant list/detail. Mergeable only with accessors. |
| `employee_code_sequences`, `document_code_sequences` | **ACTIVE** – row-locked code generators. |
| `facilities` | **ACTIVE – merged into `system_settings` (`interview.facilities`) (4b, Nov 2)**; `FacilityController`, `Interview::facility()` accessor and the in-list validation rule keep the feature intact. |
| `payroll_periods` | Low use – FK from `payroll_records` + seed data only. |

**Correction to the earlier plan:** none of the empty tables except
`password_reset_tokens` may be deleted. They may only be **merged** in a way that
keeps the feature, model class, route and JSON response identical.

---

## 2. Revised plan – "merge, never delete a feature"

Technique: keep the old **model class name**, point it to the new table with a
global scope (`type = ...`) + `creating` hook; keep the same API Resource keys.
Controllers, routes and React stay untouched unless noted.

### Phase 1 – Zero risk (72 → 71)
- Drop `password_reset_tokens` (verified unused).

### Phase 2 – Low risk, same models (71 → 61)
| Merge into | Absorbs | Why it keeps working |
|---|---|---|
| `applicant_evaluations` (from `applicant_assessments`) | `assessment_tests`, `practical_tests`, `final_evaluations`, `assessment_invites` | 5 models kept, scoped by `eval_type`; id keys aliased in Resources |
| `ess_request_events` (from `ess_request_routings`) | `ess_request_status_histories`, `ess_request_attachments` | 3 models scoped by `event_type` (**done – Phase 2d, Nov 1**) |
| `code_sequences` | `employee_code_sequences`, `document_code_sequences` | one row per `seq_key`; `lockForUpdate()` unchanged |
| `chatbot_messages` | `chatbot_unanswered` | `ChatbotUnanswered` scoped `source='unanswered'` |
| `audit_logs` | `user_login_activity`, `applicant_block_history` | models scoped by `module_name` + `action`; stay immutable (**done – Phase 2c, Nov 1**) |

### Phase 3 – Small code changes (61 → 51)
| Change | Code touched |
|---|---|
| screening entities/scores → `applicant_screenings` JSON columns | `ScreeningService`; relations → accessors (same shape) |
| `payroll_periods` → existing columns on `payroll_records` | drop FK only |
| `payroll_items` → `payroll_records.items_json` | `EssPortalController` payslips, `MockPayrollProvider` |
| `job_post_platforms` → `job_posts.platforms_json` | `JobPost::platforms()` accessor, platform upsert (**done – Phase 3d, Nov 1**) |
| `recognition_reactions` → `social_recognitions.reactions_json` | `RecognitionReaction` read/write JSON; feed no longer eager-loads (**done – Phase 3e, Nov 1**) |
| `employee_learning_attempts` → `employee_learning.attempts_json` | quiz submit + failed-attempt gate + `ResetQuizAttempt` (**done – Phase 3f, Nov 1**) |
| `employee_exit_records` → columns on `employees` | `EmployeeExitRecord` kept as scoped model, `DashboardController` (**done – Phase 3g, Nov 1**) |
| `screening_requirement_template_items` → templates `items_json` | template model accessor + controller/seeders write JSON (**done – Phase 3h, Nov 1**) |
| `employee_emergency_contacts` → `employees.emergency_contacts_json` | `EmployeeController`, `EmployeeDossierController` (**done – Phase 3i, Nov 1**) |

### Phase 4 – Optional, medium risk (51 → 46; all three done – Nov 2)
- `onboarding_checklist_items` → `onboarding_checklist_templates.items_json` (stable keys; `employee_onboarding_items.template_item_id` depends on it) (**done – Phase 4a, Nov 2**).
- `facilities` → `system_settings` (`interview.facilities`); replace `exists:facilities` rule with an in-list rule and resolve `Interview::facility()` through the setting (**done – Phase 4b, Nov 2**).
- `cache` + `cache_locks` + `sessions` → file drivers. **Warning:** OTP/MFA codes live in cache; on Dokploy, file cache is lost on redeploy (**done – Phase 4c, Nov 2** – `CACHE_STORE=file`, `SESSION_DRIVER=file`, `QUEUE_CONNECTION=sync`).

**Result: 46 tables with every feature intact (Phase 4 complete).** Going below 40 requires merging
unrelated domains (applicant + employee documents, performance reviews into HR3
recommendations) – not recommended.

---

## 3. Safety checklist per phase
1. phpMyAdmin export + new git branch.
2. One reversible migration per merge (create → copy → drop; `down()` restores).
3. `php artisan migrate` → `php artisan test`.
4. Click-through: applicant pipeline (interview → assessment link → practical → final evaluation → hire, block/unblock), ESS routing/timeline/attachments, promotion request, employee exit + dashboard attrition, chatbot unanswered list, login + OTP.
5. Run `SHOW TABLES;` on the live DB first – counts here come from the Oct 27 dump.
