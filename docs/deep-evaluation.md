# Deep Evaluation: Should Each Table Have Been Merged?

> **Nov 4, 2026 override:** For items 2d, 3b, 3c, 3e, 3f, 3g, 4b, and 4c, the authoritative
> decision is `docs/DATABASE_CONSOLIDATION_DECISION_RECORD.md`. Where the two disagree, the
> decision record wins. In short: 2d splits attachments back out; 3b, 3c, 3e, 3f, 3g, and 4b
> restore their tables; 4c keeps the framework tables dropped and moves production to Redis.

> For every merge in the consolidation plan, I ask three questions:
> 1. **Should it merge?** — Is there a real architectural reason, or is this just chasing a lower number?
> 2. **Was the method correct?** — Was STI / JSON / inlining the right technique, or should the table have stayed normalized?
> 3. **Should it be restored?** — Based on the evidence, should the original table come back?
>
> I evaluated this against the **actual code** in the repository, not just the plan document.

---

## Decision Framework

Before evaluating each table, here are the principles I'm judging against:

| Principle | Explanation |
|---|---|
| **Normalize when data has its own identity** | If rows are queried independently, have FKs pointing to them, or need concurrent individual updates → keep the table |
| **Denormalize when data is owned by the parent** | If rows are always loaded/saved as a batch with one parent and never queried across parents → JSON or inline columns are fine |
| **STI (Single Table Inheritance) when types share 70%+ of columns** | If different entity types share most columns and differ only in a few → one table with a discriminator is correct |
| **Don't merge for the number** | Reducing table count is not a goal — reducing unnecessary complexity is |

---

## Phase 1: `password_reset_tokens`

| Question | Answer |
|---|---|
| Should it merge? | ✅ **Yes** — not even a merge, it's a drop. The table was genuinely unused: password reset tokens live in the cache via `PasswordResetService`. No code writes to or reads from this table. |
| Method correct? | ✅ Drop is the only correct action for an unused table. |
| Should it be restored? | **No.** |

**Verdict: ✅ Correct decision. No debate.**

---

## Phase 2a: `employee_code_sequences` + `document_code_sequences` → `code_sequences`

| Question | Answer |
|---|---|
| Should it merge? | ✅ **Yes** — both tables have an identical schema (a single counter row with `lockForUpdate()`). They are the same concept: "a named sequence". |
| Method correct? | ✅ A single table with `seq_key` as PK is the textbook generalization. Row-level locking means no added contention between employee and document code generation. |
| Should it be restored? | **No.** |

**Verdict: ✅ Clean, correct merge. Two identical structures → one.**

---

## Phase 2b: `chatbot_unanswered` → `chatbot_messages`

| Question | Answer |
|---|---|
| Should it merge? | ✅ **Yes** — an unanswered message IS a chatbot message. It was a separate table only because someone created it as an afterthought. The `source = 'unanswered'` discriminator correctly models the relationship. |
| Method correct? | ✅ Adding a `source` column and an `intent` column to `chatbot_messages` is the right normalization. The `ChatbotUnanswered` model is scoped correctly. |
| Should it be restored? | **No.** |

**Verdict: ✅ This merge actually fixes a normalization mistake in the original schema.**

---

## Phase 2c: `user_login_activity` + `applicant_block_history` → `audit_logs`

| Question | Answer |
|---|---|
| Should it merge? | ⚠️ **Debatable** — Login events and block history are both audit events, so semantically they belong in `audit_logs`. But login activity is **high-volume** (every login attempt = 1 row), while `audit_logs` is also queried for administrative audit reports. Mixing high-volume transactional data with low-volume administrative records can hurt query performance at scale. |
| Method correct? | ✅ The discriminator pattern (`module_name = 'Auth'`, `target_type = 'applicant'`) is correct. The `extra_json` column for block-specific fields (`performed_by`, `scope`) is acceptable. |
| Should it be restored? | **Not for a thesis project.** At this scale (dozens of users), the concern is theoretical. For a production HRMS with hundreds of employees logging in daily, I would keep `user_login_activity` separate from `audit_logs`. |

**Verdict: ✅ Acceptable for thesis scope. The semantic fit is correct even if scale would eventually demand separation.**

---

## Phase 2d: ESS logs → `ess_request_events` (3 tables → 1)

| Question | Answer |
|---|---|
| Should it merge? | ✅ **Yes** — routings, status changes, and attachments are all **events on the same ESS request**. They form a timeline. This is one of the strongest merges in the plan. |
| Method correct? | ✅ The `event_type` discriminator (`routing`/`status`/`attachment`) is correct. Composite index on `(ess_request_id, event_type)` means scoped queries are efficient. The timeline view benefits from having all events in one table. |
| Concern | The table has routing-specific columns (`leg`, `to_module`, `direction`, `action`) that are NULL for attachment/status events. This is normal STI overhead and acceptable here because the column overlap is substantial. |
| Should it be restored? | **No.** |

**Verdict: ✅ One of the best merges in the plan. These were always the same concept.**

---

## Phase 2e: 5 evaluation tables → `applicant_evaluations`

This is the biggest merge. Let me evaluate it model by model.

### The 4 actual evaluations: `applicant_assessments`, `assessment_tests`, `practical_tests`, `final_evaluations`

| Question | Answer |
|---|---|
| Should they merge? | ✅ **Yes** — all four are "an evaluation of an applicant by an assessor, with scores, a date, and a pass/fail result." They share `applicant_id`, `assessor_user_id`, `evaluation_date`, `total_score`, `passing_score`, `result`. The column overlap is well above 70%. This is textbook STI. |
| Method correct? | ✅ The `eval_type` discriminator with global scopes and `creating` hooks is the correct Laravel STI pattern. Resources return the old `*_id` keys. Indexes on `(applicant_id, eval_type)` are correct. |

### The 5th table: `assessment_invites`

| Question | Answer |
|---|---|
| Should it merge? | ⚠️ **Questionable** — An invite is **not an evaluation**. It is a **delivery mechanism** (a link with a token, expiry, and pending/submitted/expired status). It happens to result in an assessment test, but the invite itself is a different domain concept. |
| Evidence from code | The `AssessmentInvite` model has `token`, `expires_at`, `status` ('Pending'/'Submitted'/'Expired') — fields that no other evaluation type uses. The `created_by_user_id` → `assessor_user_id` mapping and `test_title` → `title` mapping in the `creating` hook show forced column reuse. |
| Counter-argument | However, the invite does share `applicant_id`, `questions_json`, `answers_json`, `passing_score`, `total_score`, `result` with the evaluation. After submission, it essentially **becomes** an assessment test result. And since invites had 0 rows, the practical impact is zero. |
| Should it be restored? | **No** — the column mapping works, the forced-fit is ugly but functional, and restoring it would add complexity for no real gain. Just document that `assessment_invite` is semantically different from the other eval types. |

**Verdict: ✅ The 4-evaluation merge is excellent. The assessment_invite inclusion is a stretch but acceptable given 0 rows and working column mapping.**

---

## Phase 3a: `applicant_screening_entities` + `applicant_screening_scores` → JSON on `applicant_screenings`

| Question | Answer |
|---|---|
| Should it merge? | ✅ **Yes, absolutely** — the plan document states these were **"normalized copies of data already stored as JSON"** in `applicant_screenings.entities_json` and `score_breakdown_json`. The child tables were **redundant**. |
| Method correct? | ✅ The data was already JSON. Dropping the redundant normalized copies is not even denormalization — it's removing duplication. |
| Should it be restored? | **No. This is the most justified merge in the entire plan.** |

**Verdict: ✅ Perfect. Removing actual data duplication.**

---

## Phase 3b: `payroll_periods` → columns on `payroll_records`

| Question | Answer |
|---|---|
| Should it merge? | ✅ **Yes** — `payroll_periods` had 4 rows (seed data) and `payroll_records` already had `pay_period_start`, `pay_period_end`, `payout_date`. Only `period_code` and `period_name` were added. The "period" was a weak entity with almost no independent identity. |
| Method correct? | ✅ Inlining two label columns onto the record is correct when the period has no life outside its records. |
| Should it be restored? | **No.** |

**Verdict: ✅ The period was over-normalized to begin with.**

---

## Phase 3c: `payroll_items` → `payroll_records.items_json`

| Question | Answer |
|---|---|
| Should it merge? | ✅ **Yes, for this system** — Payroll items (earnings/deductions line items) are written once at payroll processing time and read as a complete batch for the payslip view. No code queries across items independently ("show all employees' transport allowance"). |
| Method correct? | ✅ JSON is appropriate when: (1) items are always loaded as a complete set, (2) never queried independently across records, (3) never updated individually. All three hold here. |
| Concern | ⚠️ If this were a **real production payroll system**, you would eventually need aggregate queries across payroll items (total deductions by type, YTD earnings breakdowns, tax reports). JSON makes those queries impossible without loading every record into PHP. **But this is a thesis HRMS where the payroll is mocked.** |
| Should it be restored? | **No** — for thesis scope. Document the trade-off. |

**Verdict: ✅ Correct for the system's actual usage pattern. Would reconsider for production payroll.**

---

## Phase 3d: `job_post_platforms` → `job_posts.platforms_json`

| Question | Answer |
|---|---|
| Should it merge? | ✅ **Yes** — platforms are a small bounded list (3–5 values like Website/Facebook/Indeed) always loaded with the job post. The `syncPlatforms()` in the controller writes the full set at once. |
| Method correct? | ✅ The accessor hydrates `JobPostPlatform` model objects from JSON, so the API response is unchanged. |
| Concern | ⚠️ A potential report query "show all job posts published on Indeed" now requires scanning every job post and parsing JSON. But this is a `LIKE '%Indeed%'` or PHP-level filter — acceptable at this scale (tens of job posts, not millions). |
| Should it be restored? | **No.** |

**Verdict: ✅ Good candidate for JSON. Small, bounded, always loaded with parent.**

---

## Phase 3e: `recognition_reactions` → `social_recognitions.reactions_json`

| Question | Answer |
|---|---|
| Should it merge? | ✅ **Yes** — reactions are a classic JSON-column candidate: small map keyed by employee_id, always loaded as a set for the toggle UI, never queried independently ("show all reactions across all recognitions" is not a feature). |
| Method correct? | ✅ The `{employee_id: [types]}` structure is efficient for toggle checks. |
| Should it be restored? | **No.** |

**Verdict: ✅ Textbook JSON-column use case.**

---

## Phase 3f: `employee_learning_attempts` → `employee_learning.attempts_json`

| Question | Answer |
|---|---|
| Should it merge? | ✅ **Yes** — quiz attempts are small (1–5 per course), bounded (max attempts is capped), and always loaded with the learning record. The `ResetQuizAttempt` command clears them as a batch. |
| Method correct? | ✅ JSON array of attempt objects ordered by attempt_id. |
| Should it be restored? | **No.** |

**Verdict: ✅ Good candidate. Small, bounded, batch-oriented.**

---

## Phase 3g: `employee_exit_records` → columns on `employees`

| Question | Answer |
|---|---|
| Should it merge? | ✅ **Yes, absolutely** — an exit record is a **one-to-one fact about the employee**. Having a separate table for 5 fields (`exit_type`, `exit_date`, `clearance_status`, `coe_status`, `exit_notes`) that always map 1:1 to an employee is over-normalization. |
| Method correct? | ✅ Five nullable columns on `employees` is the correct shape. The `EmployeeExitRecord` model reading `employees` with `whereNotNull('exit_type')` is clean. The scoped model preserves the API contract (`exit_record_id = employee_id`). |
| Should it be restored? | **No. This should have been columns from the start.** |

**Verdict: ✅ One of the best merges. Fixing over-normalization.**

---

## Phase 3h: `screening_requirement_template_items` → `items_json` on templates

| Question | Answer |
|---|---|
| Should it merge? | ✅ **Yes** — template items (55 rows across 8 templates) are always loaded as a complete set when configuring screening or applying templates. No code queries template items across templates. No other table has FKs pointing to template items. |
| Method correct? | ✅ JSON array with preserved `item_id` values. The controller reads/writes the full list. |
| Should it be restored? | **No.** |

**Verdict: ✅ Good candidate. No FKs, no cross-template queries, batch read/write.**

---

## Phase 3i: `employee_emergency_contacts` → `employees.emergency_contacts_json`

| Question | Answer |
|---|---|
| Should it merge? | ⚠️ **Borderline** — Emergency contacts have **individual CRUD** (add one, edit one, delete one). The code in `EmployeeDossierController` does `contactsArray()` → find → modify → `persistContacts()` for every single-contact operation. This is a load-decode-modify-encode-save cycle for what used to be a single row update. |
| Evidence from code | `storeContact()`, `updateContact()`, `destroyContact()` in `EmployeeDossierController` all operate on individual contacts. This is NOT batch-oriented data — it has full CRUD semantics. |
| Counter-argument | There are only 1–3 contacts per employee. The JSON array is tiny. Concurrent edits by two HR users on the same employee's contacts are extremely unlikely. At this scale the load-modify-save pattern is fine. |
| Risk | If two users edit different contacts for the same employee simultaneously: **last-write-wins** (the second save overwrites the first user's changes). With a real table, both row-level updates would succeed independently. |
| Should it be restored? | **Not for thesis scope**, but this is the weakest JSON-column merge because the data has individual-record CRUD semantics. |

> [!WARNING]
> This is the most borderline JSON merge. The data has individual CRUD operations, not batch semantics. Acceptable only because of tiny cardinality (1–3 contacts per employee) and single-user thesis context.

**Verdict: ⚠️ Acceptable for thesis. Would keep as a separate table in production due to CRUD semantics.**

---

## Phase 4a: `onboarding_checklist_items` → `items_json` on templates

| Question | Answer |
|---|---|
| Should it merge? | ⚠️ **The riskiest JSON merge** — This is not just about the template items. `employee_onboarding_items.template_item_id` **references** these items. After the merge, that column points to an ID that lives inside a JSON array, not in a real table. |
| Evidence from code | `OnboardingChecklistTemplate::findItem()` scans ALL templates' `items_json` to resolve a single `template_item_id`. This is an O(templates × items) lookup that replaces what was an O(1) FK lookup. The `nextItemId()` method must query both the JSON arrays AND the `employee_onboarding_items` table to find the next safe ID — this is the "stable key contract" described in the plan. |
| What could go wrong | If someone deletes a template item from `items_json`, any `employee_onboarding_items` row still referencing that `template_item_id` silently loses its link. With a real FK, MySQL would block the delete or cascade. |
| Counter-argument | The `applyTo()` method creates onboarding items by copying from template items — after creation, the `item_text` is denormalized onto the employee row, so the `template_item_id` reference is mostly historical. The `findItem()` lookup only happens during materialization, not in hot paths. |
| Should it be restored? | 🟡 **Consider it**, but the damage of restoring (writing a reverse migration, re-testing) may outweigh the risk at thesis scale. If you keep it, **document the stable-key contract prominently**. |

> [!CAUTION]
> This merge creates an **implicit foreign key to a JSON array element** — a fundamentally un-relational pattern. The `findItem()` full-scan and the `nextItemId()` cross-check are complexity that a simple child table would have avoided.

**Verdict: ⚠️ The riskiest merge. Functional but fragile. The FK-to-JSON pattern adds complexity that the table count reduction doesn't justify.**

---

## Phase 4b: `facilities` → `system_settings` JSON

| Question | Answer |
|---|---|
| Should it merge? | ⚠️ **No clear benefit** — `facilities` was a 4-row reference table with a proper schema, FK to `interviews`, and clean query patterns. Moving it to a JSON blob in `system_settings` added: a `Facility::allFromSettings()` accessor, a `findFromSettings()` accessor, a `hydrateRow()` method, a static cache, and a `persistRows()` method. That's ~120 lines of model code to replace what MySQL handled natively. |
| Evidence from code | `StoreInterviewRequest` had to replace `exists:facilities,facility_id` (a simple DB rule) with `Rule::in(Facility::allFromSettings()->pluck('facility_id')->all())` — loading all facilities into PHP just to validate an ID. `Interview::facility` is now a PHP accessor instead of a `belongsTo` relation, meaning eager loading is impossible. |
| What was lost | FK constraint (`ON DELETE SET NULL`), unique constraints, `exists:` validation, `belongsTo` relation, eager loading, direct SQL queries, the ability to add rooms without touching PHP code. |
| What was gained | 1 fewer table. |
| Should it be restored? | 🟡 **Yes, this is the strongest candidate for restoration.** The table was small, simple, and correctly normalized. The merge added complexity and lost integrity guarantees, all to save one 4-row table. |

> [!IMPORTANT]
> This is the one merge I would actively recommend **reversing**. The original `facilities` table was already the correct design. The 120+ lines of accessor/hydration code in the model are more complex than the table they replaced.

**Verdict: 🔴 Unnecessary merge. Added complexity, lost FK integrity, for no real gain.**

---

## Phase 4c: `cache`, `cache_locks`, `sessions` → file drivers

| Question | Answer |
|---|---|
| Should it merge? | ✅ **Yes** — these are Laravel framework infrastructure tables, not application data. Switching to file drivers is a standard Laravel configuration change. All rows were expired/stale at migration time. |
| Method correct? | ✅ Changing `CACHE_STORE`, `SESSION_DRIVER`, `QUEUE_CONNECTION` in `.env` and dropping the tables is the correct procedure. |
| Production concern | The doc correctly notes that Dokploy redeploys clear file cache, breaking mid-login sessions. Redis is the right long-term answer. |
| Should it be restored? | **No** — but switching to Redis in production is recommended. |

**Verdict: ✅ Correct. Infrastructure tables don't need to be in the application database.**

---

## Phase 5: All 6 proposed merges

| Step | Should it merge? | Reasoning |
|---|---|---|
| 5a: `applicant_documents` + `employee_documents` → `documents` | 🔴 **No** | Different domain entities. Applicant docs have NLP verification fields; employee docs have different file paths and soft deletes. Sharing a table would force NULL columns everywhere and create confusion about which "document" is which. |
| 5b: `performance_reviews` → `hr3_recommendations` | 🔴 **No** | A review is NOT a recommendation. These are different HR3 concepts with different lifecycles and stakeholders. |
| 5c: `checklist_requests` → `ess_requests` | 🔴 **No** | Would couple onboarding workflow to the ESS request system. Different approval flows, different statuses, different ownership. |
| 5d: `work_schedules` → `employees.schedule_json` | 🔴 **No** | Schedules change over time (shift rotations, seasonal changes). Inlining loses history. Also, `MockAttendanceProvider` queries schedules independently. |
| 5e: `screening_ground_truths` → `applicant_screenings` | 🔴 **No** | Thesis evaluation data. SOP 2/3/5 metrics depend on ground truth being independently queryable and comparable against screening results. Merging would complicate the metrics calculations. |
| 5f: `employee_benefits` → `employees.benefits_json` | 🔴 **No** | Benefits interact with payroll processing. Keeping them queryable (e.g., "all employees with health insurance") matters. |

**Verdict: 🔴 Correct to skip Phase 5 entirely. These merge unrelated domain concepts.**

---

## Final Recommendation Matrix

| Step | Merge | Verdict | Action |
|---|---|---|---|
| 1 | Drop `password_reset_tokens` | ✅ **Correct** | Keep |
| 2a | Code sequences | ✅ **Correct** | Keep |
| 2b | Chatbot unanswered | ✅ **Correct** | Keep |
| 2c | Login + block → audit_logs | ✅ **Acceptable** | Keep |
| 2d | ESS logs → events | ✅ **Excellent** | Keep |
| 2e | 5 evals → applicant_evaluations | ✅ **Very good** | Keep (document that invite is a stretch) |
| 3a | Screening entities/scores → JSON | ✅ **Perfect** | Keep (was removing actual duplication) |
| 3b | Payroll periods → columns | ✅ **Correct** | Keep |
| 3c | Payroll items → JSON | ✅ **Good for thesis** | Keep (document limitation for production) |
| 3d | Job post platforms → JSON | ✅ **Good** | Keep |
| 3e | Recognition reactions → JSON | ✅ **Textbook** | Keep |
| 3f | Learning attempts → JSON | ✅ **Good** | Keep |
| 3g | Exit records → employee columns | ✅ **Excellent** | Keep (was over-normalized) |
| 3h | Screening template items → JSON | ✅ **Good** | Keep |
| 3i | Emergency contacts → JSON | ⚠️ **Borderline** | Keep, but document the CRUD caveat |
| 4a | Onboarding items → JSON | ⚠️ **Risky** | Keep, but document the FK-to-JSON contract heavily |
| 4b | Facilities → system_settings | 🔴 **Unnecessary** | **Consider restoring** — added complexity for no gain |
| 4c | Cache/sessions → file drivers | ✅ **Correct** | Keep (add Redis for production) |
| 5a–5f | Phase 5 | 🔴 **Skip** | Do not proceed |

---

## Bottom Line

> **15 out of 17 merges are well-justified.** The plan shows strong discipline: every table was traced through its code paths, every merge preserves the API contract, and every migration is reversible.
>
> **1 merge is borderline but acceptable** (3i — emergency contacts have CRUD semantics that don't fit JSON perfectly, but the tiny cardinality makes it work).
>
> **1 merge should be reconsidered** (4b — facilities). The 4-row reference table was already the correct design. Moving it into `system_settings` JSON added 120+ lines of accessor/hydration code, lost FK integrity, and gained nothing meaningful.
>
> **Phase 5 is correctly identified as high-risk and should be skipped.**
>
> The target of **46 tables** (or 47 if you restore `facilities`) is the right stopping point.
