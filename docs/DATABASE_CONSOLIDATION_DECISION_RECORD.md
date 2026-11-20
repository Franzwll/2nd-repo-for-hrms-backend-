# Database Consolidation — Decision Record

> **Date:** Nov 4, 2026  
> **Status:** Authoritative for the eight items below. Where this document conflicts with
> `deep-evaluation.md`, **this document wins**.  
> **Scope of this task:** analysis and documentation only. No migration, model, controller,
> `.env`, or schema change has been executed. Live database remains at **46 tables**.
>
> Sources reconciled:
> - `docs/DATABASE_CONSOLIDATION_PLAN.md` — what was actually executed (72 → 46).
> - `deep-evaluation.md` — architectural review of each merge.
> - The eight user decisions (2d, 3b, 3c, 3e, 3f, 3g, 4b, 4c), which take precedence.

---

## 1. Final decisions

| Ref | Table | Current state | Decision | Table delta |
|---|---|---|---|---|
| 2d | `ess_request_attachments` | Merged into `ess_request_events` (`event_type = 'attachment'`) | **Split attachments out.** Keep routing and status rows in `ess_request_events`. | +1 |
| 3b | `payroll_periods` | Dropped; `period_code` / `period_name` inlined on `payroll_records` | **Restore table and foreign key.** | +1 |
| 3c | `payroll_items` | Dropped; lines in `payroll_records.items_json` | **Restore table.** Keep JSON only during transition. | +1 |
| 3e | `recognition_reactions` | Dropped; reactions in `social_recognitions.reactions_json` | **Restore table.** | +1 |
| 3f | `employee_learning_attempts` | Dropped; attempts in `employee_learning.attempts_json` | **Restore table.** | +1 |
| 3g | `employee_exit_records` | Dropped; five exit columns on `employees` | **Restore table, redesigned as one row per separation cycle.** | +1 |
| 4b | `facilities` | Dropped; JSON under `system_settings` key `interview.facilities` | **Restore table and `interviews` foreign key.** | +1 |
| 4c | `cache`, `cache_locks`, `sessions` | Dropped; file drivers in all env files | **Keep dropped. Use Redis in production for cache, sessions, and locks. Review queue separately.** | 0 |

### Table count

| Scenario | Tables |
|---|---|
| Current live database | 46 |
| After 2d, 3b, 3c, 3e, 3f, 4b restores | 52 |
| After 3g restore as well | **53** |
| If 3g is deferred | 52 |

Phase 5 remains **skipped** (40-table target not pursued). The `deep-evaluation.md` target of
46–47 is superseded by these decisions.

---

## 2. Why these decisions override `deep-evaluation.md`

The deep evaluation judged most merges sound. The user decisions accept those judgments except
where a restored table has independent identity, independent query needs, or loses history.
Concretely:

- 2d: attachments have their own lifecycle, uploader, download path, and access checks.
- 3b/3c: payroll periods and payroll lines are reporting entities, not parent-owned JSON blobs.
- 3e/3f: reactions and quiz attempts are event rows with uniqueness and audit value.
- 3g: verification found that rehire clears the exit columns on `employees`, so per-cycle exit
  paperwork is lost.
- 4b: the deep evaluation already marked this the one merge to reverse.
- 4c: the deep evaluation's Redis recommendation is adopted for production; dropping the framework
  tables remains correct.

---

## 3. Verification performed

Checked against the live `hotel_hr` database (46 tables) and the current code, not only the docs.

### 2d — ESS attachments

- `app/Models/EssRequestAttachment.php:21` points at `ess_request_events`.
- The same model adds a global scope on `event_type = 'attachment'` and sets `event_type` on create
  (`app/Models/EssRequestAttachment.php:41-47`).
- `EssRequest::attachments()` orders by `ess_request_event_id`
  (`app/Models/EssRequest.php:66-70`), not by the old attachment key.
- Live data: `ess_request_events` has 2 rows, both `event_type = 'status'`; 0 attachment rows.
- The merge migration (`2026_11_01_000004_...`) already contains the exact attachment schema and
  copy logic needed for a split.

### 3b / 3c — Payroll

- `payroll_records` currently has `payroll_period_id`, `period_code`, `period_name`, and
  `items_json`; the `payroll_periods` foreign key is gone.
- Live data: 11 payroll records across period ids 1–4, with `period_code` / `period_name` populated.
- `EssPortalController::getPayroll()` reads `items_json` when `payroll_items` is absent
  (`Modules/EmployeeSelfService/app/Http/Controllers/EssPortalController.php:992-1011`).
- `AdminEssProfileSeeder` already dual-writes `items_json` and `payroll_items` when the table exists
  (`database/seeders/AdminEssProfileSeeder.php:147-195`).
- `MockPayrollProvider` reads only `payroll_records`; it does not read payroll items
  (`app/Services/Integration/Mocks/MockPayrollProvider.php:16-28`).
- Rollback snapshots exist: `migration_backup.payroll_periods` (4 rows) and
  `migration_backup.payroll_items` (original 85 rows).

### 3e — Recognition reactions

- `RecognitionReaction` already branches: it queries `recognition_reactions` when the table exists,
  otherwise `social_recognitions.reactions_json`
  (`Modules/EmployeeSelfService/app/Models/RecognitionReaction.php:38-142`).
- `SocialRecognition::reactions()` remains a `hasMany` relation that only works when the table
  exists (`Modules/EmployeeSelfService/app/Models/SocialRecognition.php:61-64`).
- Live data: 6 recognitions; 3 have non-null `reactions_json`; backup snapshot exists.

### 3f — Learning attempts

- No `EmployeeLearningAttempt` model exists. The controller reads and writes JSON directly:
  - failed-attempt lookup: `EssPortalController.php:2086-2131`
  - quiz submission append: `EssPortalController.php:2528-2546`
  - reset command: `app/Console/Commands/ResetQuizAttempt.php:51-89`
- Live data: 7 `employee_learning` rows; 1 has non-null `attempts_json`.
- Backup snapshot exists: `migration_backup.employee_learning_attempts`.

### 3g — Exit history (the requested verification)

This was the item that had to be checked rather than assumed.

- Exit writes an `employee_position_history` row with `change_type = 'Exit'`
  (`Modules/CoreHCM/app/Http/Controllers/EmployeeController.php:365-372`).
- Rehire writes a row with `change_type = 'Rehire'` and **clears** the five exit columns on the
  employee (`EmployeeController.php:424-445`).
- The promotion/termination path does the same: writes history and then sets the exit columns
  (`Modules/CoreHCM/app/Http/Controllers/PromotionRequestController.php:383-405`).
- `EmployeeExitRecord` is only a scoped view over `employees`; it has no independent row identity
  (`app/Models/EmployeeExitRecord.php:18-48`).
- The **original** `employee_exit_records` table had `employee_id` as `unique`
  (`database/migrations/0001_01_01_000009_create_employee_exit_records_table.php:13`), so even the
  pre-merge schema supported only one exit record per employee.

**Verified result:** the event sequence (exit date, rehire date, change type, notes) survives in
`employee_position_history`. The per-cycle exit paperwork (`exit_type`, `clearance_status`,
`coe_status`, `exit_notes`) does **not** survive a rehire, because the employee columns are nulled.
For multiple separation/rehire cycles, the current design is therefore insufficient if HR must keep
clearance/COE history per cycle.

Live data today: all 38 employees are `Active`; 0 exit rows; no `Exit` or `Rehire` history rows.
The change is low-risk now.

**Decision:** restore `employee_exit_records` as a real one-to-many history table:
`employee_id` indexed but **not unique**, one row per separation, plus a nullable `rehire_date` to
close the cycle. Keep `employee_position_history` as the broad employment timeline. If HR only ever
needs the current status, the existing employee columns are sufficient; the restore is required only
because the verification shows per-cycle clearance/COE paperwork is otherwise lost.

### 4b — Facilities

- `Facility` is a table model with fallbacks to `system_settings`
  (`Modules/ApplicantManagement/app/Models/Facility.php:19-30`, `60-143`).
- `Interview::facility` is an accessor, so eager loading is impossible
  (`Modules/ApplicantManagement/app/Models/Interview.php:45-59`).
- `StoreInterviewRequest` validates with `Rule::in(...)` over the settings list instead of
  `exists:facilities,facility_id` (`StoreInterviewRequest.php:24-27`).
- Live data: `interview.facilities` and `migration_backup.facilities` both exist (1,184 bytes each);
  2 interviews reference facility id 1; 6 have no facility.
- The merge migration's `down()` already recreates the table, restores rows, and re-adds
  `fk_interviews_facility_id` with `ON DELETE SET NULL`.

### 4c — Cache, sessions, queue

- `.env`, `.env.example`, `dokploy-backend.env`, and `dokploy-backend.test.env` all use
  `SESSION_DRIVER=file` and `CACHE_STORE=file`.
- `dokploy-backend.env` and `dokploy-backend.test.env` also use `QUEUE_CONNECTION=sync`.
- Redis configuration already exists in `config/database.php:146-179`; the default client is
  `phpredis`, but `composer.json` does not list `predis`.
- No `jobs` or `failed_jobs` tables exist.
- Cache locks use the cache store's `lock_connection`; with Redis this is the Redis `default`
  connection unless `REDIS_CACHE_LOCK_CONNECTION` is set.

---

## 4. Required implementation

Use **new forward migrations**. Do **not** run `php artisan migrate:rollback` to reach these steps:
later merges would be reverted too, and the existing `down()` methods prefer the old snapshots over
the live merged data.

### 4.1 Migration rule for every restore

1. Guard with `Schema::hasTable()` / `hasColumn()`.
2. Read the **live merged representation first** (JSON column, setting, or event rows).
3. Fall back to the `system_settings` `migration_backup.*` snapshot only when live data is absent.
4. Re-add foreign keys only after orphan rows are reconciled.
5. Do not drop the merged column/table in the same migration. Drop it in a later cleanup migration
   after verification.
6. `down()` must re-merge the rows and drop the restored table.

This matters because the live data has changed since the merges. For example,
`payroll_records.items_json` currently holds 85 lines across 11 records, and the old snapshot also
holds 85 rows; restoring the snapshot verbatim would overwrite any line edited after the merge.

### 4.2 Proposed migrations

| Order | Migration | What it does |
|---|---|---|
| 1 | `2026_11_04_000001_restore_facilities_table.php` | Create `facilities`, copy from `interview.facilities` (backup fallback), re-add `fk_interviews_facility_id` (`ON DELETE SET NULL`), keep the setting until code is switched. |
| 2 | `2026_11_04_000002_restore_ess_request_attachments_table.php` | Create `ess_request_attachments`, copy `event_type = 'attachment'` rows, delete those rows from `ess_request_events`. |
| 3 | `2026_11_04_000003_restore_payroll_periods_table.php` | Create `payroll_periods`, rebuild 4 periods from `payroll_records` (`payroll_period_id`, `period_code`, `period_name`, `pay_period_start/end`, `payout_date`, status), fall back to snapshot, re-add `fk_payroll_records_payroll_period_id`. |
| 4 | `2026_11_04_000004_restore_payroll_items_table.php` | Create `payroll_items`, expand every `payroll_records.items_json` row, fall back to snapshot, re-add `fk_payroll_items_payroll_record_id`. |
| 5 | `2026_11_04_000005_restore_recognition_reactions_table.php` | Create `recognition_reactions` with `unique(recognition_id, employee_id, reaction_type)`, expand `reactions_json`, fall back to snapshot. |
| 6 | `2026_11_04_000006_restore_employee_learning_attempts_table.php` | Create `employee_learning_attempts`, expand `attempts_json`, fall back to snapshot, add FKs. |
| 7 | `2026_11_04_000007_restore_employee_exit_records_table.php` | Create `employee_exit_records` with `employee_id` indexed but **not unique** and nullable `rehire_date`; backfill one row per employee that currently has `exit_type`. Live data is 0 rows today. |

A separate cleanup migration can then drop `payroll_records.items_json`,
`social_recognitions.reactions_json`, `employee_learning.attempts_json`, and the five exit columns
after the application is switched and verified.

### 4.3 Code changes

| Ref | Files | Change |
|---|---|---|
| 2d | `app/Models/EssRequestAttachment.php` | Set `$table = 'ess_request_attachments'`, primary key `ess_request_attachment_id`, remove the `event_type` global scope and `creating` hook. |
| 2d | `app/Models/EssRequest.php` | Order `attachments()` by `ess_request_attachment_id`. Keep `statusHistory()` / `routings()` on `ess_request_events`. |
| 2d | Attachment download controller/routes | Verify the route resolves `ess_request_attachment_id`; keep the existing key name in the API. |
| 3b | Seeders (`AdminEssProfileSeeder`, MySQL seed file) | Insert the 4 payroll periods; keep `payroll_records.payroll_period_id` aligned. |
| 3c | `AdminEssProfileSeeder` | Once `items_json` is dropped, write only to `payroll_items`. Until then, keep dual-write. |
| 3e | `RecognitionReaction.php`, `SocialRecognition.php` | Remove the `Schema::hasTable()` branch and the JSON fallback after backfill; keep the `reactions()` relation. |
| 3f | `EssPortalController.php` | Replace JSON reads/writes with `employee_learning_attempts` queries; add an `EmployeeLearningAttempt` model or use `DB::table`. |
| 3f | `app/Console/Commands/ResetQuizAttempt.php` | Count and delete attempt rows instead of clearing `attempts_json`. |
| 3g | `EmployeeExitRecord.php` | Point back at `employee_exit_records`; drop the `whereNotNull('exit_type')` global scope; map `notes` to the real column. |
| 3g | `Employee.php` | `exitRecord()` becomes `hasOne(...)->latestOfMany('exit_date')`; add `exitRecords()` for full history. |
| 3g | `EmployeeController::exit()`, `rehire()`, `PromotionRequestController` | Create an exit row; on rehire stamp `rehire_date` on the open row instead of nulling employee columns. |
| 3g | `DashboardController` | Keep querying `EmployeeExitRecord`; attrition now reads real rows. |
| 4b | `Facility.php` | Remove the settings accessors (`allFromSettings`, `findFromSettings`, `hydrateRow`, `persistRows`, cache). Use normal Eloquent queries. |
| 4b | `Interview.php` | Restore the `facility()` `belongsTo` relation. |
| 4b | `StoreInterviewRequest.php` | Restore `exists:facilities,facility_id`. |
| 4b | `FacilityController`, `InterviewResource` | Use the relation / model query directly. |
| 4b | `SettingsDatabaseSeeder`, MySQL seed file | Seed `facilities` rows instead of `interview.facilities`. |

### 4.4 Verification per restore

| Ref | Test |
|---|---|
| 2d | File an ESS request, upload an employee file, upload an HR file, release it; timeline and download still work. Run `EssRequestWorkflowTest`, `EssErmDocumentLoopTest`. |
| 3b | Open ESS → Payslips; periods and payout dates match. Check the FK exists and all 11 records point at a valid period. |
| 3c | Payslip earnings/deductions and YTD match pre-restore values; totals equal `gross_pay` / `net_pay`. |
| 3e | React / un-react; counts and `userReactions` remain correct; duplicate reaction is rejected by the unique key. |
| 3f | Take a quiz, fail once, confirm retake block; run `ess:reset-quiz-attempt --force` and confirm unlock. |
| 3g | Separate an employee, then rehire; both cycles remain visible; clearance/COE from the first cycle are not erased. Run `CoreHcmTest`, `ErmDossierTest`. |
| 4b | Create an interview with Room 1; FK blocks an invalid id; delete a facility and confirm `facility_id` becomes NULL. Run `InterviewVirtualFacilityTest`. |
| 4c | Production Redis smoke test: cache put/get/forget, cache lock, session write/read, OTP login. |

Baseline suite before these changes: 179 passed / 4 known unrelated failures
(`EssAdminSelfServiceTest` ×3, `ZoomMeetingSettingsTest` ×1). Treat any new failure as a regression.

---

## 5. 4c — Production cache, sessions, locks, and queue

### Cache, sessions, locks

Keep the three framework tables dropped. Set **production only**:

```dotenv
CACHE_STORE=redis
SESSION_DRIVER=redis
REDIS_CLIENT=phpredis
REDIS_HOST=<redis-service-host>
REDIS_PASSWORD=<password-or-null>
REDIS_PORT=6379
REDIS_DB=0
REDIS_CACHE_DB=1
REDIS_PREFIX=hotel_hr
```

- Cache locks use Redis through the cache store's lock connection. Set
  `REDIS_CACHE_LOCK_CONNECTION=default` if locks must share the default Redis database.
- `phpredis` must be installed in the production image. If it is not, either install the extension
  or set `REDIS_CLIENT=predis` and add `predis/predis` to `composer.json`.
- Local development may stay on `file`; only production needs Redis.
- After switching, confirm `storage/framework/cache` and `storage/framework/sessions` are no longer
  the source of truth, and that a redeploy does not log users out.

### Queue — reviewed separately

- All env files currently use `QUEUE_CONNECTION=sync`. No `jobs` or `failed_jobs` tables exist.
- `sync` is correct while every job is expected to run inside the request. Do not switch to Redis
  queue without a worker.
- If background jobs become necessary:
  1. Set `QUEUE_CONNECTION=redis`.
  2. Run a supervised `php artisan queue:work redis`.
  3. Add `failed_jobs` storage, or set `QUEUE_FAILED_DRIVER=null` explicitly if failures are not
     retained.
  4. Add a queue health check.

No queue change is part of the eight decisions.

---

## 6. Execution order and rollback

1. Branch from the current consolidation branch; confirm `hotel_hr` is at 46 tables.
2. Back up:
   ```powershell
   & 'C:\xampp1\mysql\bin\mysqldump.exe' -u root --routines --single-transaction hotel_hr `
     --result-file='database\backups\hotel_hr_before_restore_step1.sql'
   ```
3. Run one restore migration at a time.
4. After each: `php artisan migrate`, verify row counts, run the related feature test, then click
   through the screen.
5. Verify the reverse path on `hrms_test`, not on live data.
6. Drop merged columns/tables only in a later cleanup migration, after all code paths read the
   restored tables.

Rollback rule for each new migration: copy rows back into the merged representation, then drop the
restored table. Keep the `migration_backup.*` keys until the cleanup migration is accepted.

---

## 7. Risks and open items

| # | Risk / open item | Handling |
|---|---|---|
| 1 | Restoring 7 tables raises the count from 46 to 53, above the earlier 46/47 target. | Accepted: the user decisions take precedence. State this explicitly if the table count is an adviser requirement. |
| 2 | 3g changes the original 1:1 exit schema to one row per cycle. | Intentional. The original `unique(employee_id)` could not store multiple separations. Live exit rows are 0, so backfill is trivial. |
| 3 | Payroll `items_json` and the restored `payroll_items` can diverge if both are written. | Backfill in the restore migration; dual-write only during transition; drop `items_json` afterwards. |
| 4 | `payroll_periods` and `period_code` / `period_name` on records become duplicate sources. | Rebuild periods from records, re-add FK, then drop the two label columns after verification. |
| 5 | `recognition_reactions` and `reactions_json` can diverge. | Backfill from JSON, switch the model to table-only, then drop the JSON column. |
| 6 | `employee_learning_attempts` has no model today. | Add one or use query builder consistently in the controller and reset command. |
| 7 | Restoring `facilities` while keeping `interview.facilities` creates two sources. | Switch code to the table, then delete the setting. Keep only `migration_backup.facilities` for rollback. |
| 8 | Redis is not installed as a PHP extension in the image. | Check for `redis` in the production image's `php -m` output; otherwise use Predis. |
| 9 | Queue has no worker. | Keep `sync` until a worker is provisioned; review separately as decided. |

---

## 8. What was done in this task

- Read `docs/DATABASE_CONSOLIDATION_PLAN.md` and `deep-evaluation.md`.
- Verified the live `hotel_hr` schema: **46 tables**.
- Traced the affected code and migrations for all eight decisions, including the 3g rehire path.
- Inspected live rows for payroll, recognition reactions, learning attempts, ESS events, interviews,
  and facilities.
- Wrote this decision record.
- Added cross-reference notes to `deep-evaluation.md` and `docs/DATABASE_CONSOLIDATION_PLAN.md` so
  future readers apply these decisions instead of the earlier recommendations.
- **Did not** run migrations, change models/controllers, edit `.env` files, or touch live data.
