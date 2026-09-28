# HRMS Integration Test Report
# Applicant Management · Recruitment Management · New Hire Onboarding · Settings

- Date: 2026-09-26
- Environment: Laravel 12 (php artisan serve @ 127.0.0.1:8000) · MariaDB 10.4 `hotel_hr` · spaCy NLP service @ 127.0.0.1:8001 · React frontend (Vite proxy `/api` → :8000)
- Method: real HTTP calls against the running API (Bearer token from the real login + OTP flow) with **direct MySQL assertions before/after every action** — proof that each button persists to the database.
- Harness: `backend-laravel/scripts/hrms-integration-test.php`

## Result at a glance

| Suite | Checks | Passed | Failed |
|---|---|---|---|
| Full run `--section=all` (lists, metric cards, all write paths, cleanup sweep) | 105 | 100 | 5 (all documented findings below) |
| Destructive maintenance `--section=destructive --destructive` (restore snapshot + reset all passwords) | 17 | 16 | 1 (same company-info finding) |

Every list screen and metric card reconciles **exactly** with the SQL aggregates (see §3). All TEST rows created by the run were removed afterwards (cleanup sweep reports 0 leftovers).

## 1. What was verified as working (button → API → DB effect)

### Applicant Management
| Button / action | API called | DB effect verified |
|---|---|---|
| Accept & Schedule | `PUT /applicants/{id}` (`stage=Accepted`) + `POST /interviews` | `applicants.stage` + `interviews` row (`Scheduled`, `facility_status=Waiting for Facility Approval`) |
| Book an Interview (facility request) | `POST /interviews` → `POST /interviews/{id}/facility-approve` | `facility_status → Facility Approved`; applicant stage `Interview Scheduled` |
| Reschedule interview | `PUT /interviews/{id}` | `scheduled_date/time/mode/interviewer` updated |
| Cancel interview | `PUT /interviews/{id}` (`status=Cancelled`) | `interviews.status = Cancelled` |
| Schedule interview (re-book) | `POST /interviews` | new row allowed once previous is Cancelled |
| Reject | `PUT /applicants/{id}` (`stage=Rejected`) | `applicants.stage = Rejected` |
| Interview assessment (Passed) | `POST /applicants/{id}/assessments` | `applicant_assessments` row + stage `Assessed` + `fit_score` sync |
| Start Assessment Test | `POST /applicants/{id}/assessment-tests` | `assessment_tests` row + stage `Assessment Test` (passes the "interview assessment must be Passed" gate) |
| Start Practical Test | `POST /applicants/{id}/practical-tests` | `practical_tests` row + stage `Practical Test` (job post `requires_practical=1`) |
| Complete Final Evaluation | `POST /applicants/{id}/final-evaluations` | `final_evaluations` snapshot (interview 88 / test 85 / practical 90) + stage `Final Evaluation` |
| Accept verified decision | `POST /applicants/{id}/hire` ×2 | stage `Final Evaluation → Offer → Hired` |
| Verify candidate decision (the dialog itself) | — none — | **Finding #2 (UI-only)** |

### Recruitment Management
| Button / action | API called | DB effect verified |
|---|---|---|
| New job post (Save draft) | `POST /job-posts` | `job_posts` row (Draft/active=0, `requires_practical`) + `job_post_platforms` |
| Edit template | `PUT /job-posts/{id}` | summary/vacancies/responsibilities updated |
| Publish job post | `POST /job-posts/{id}/publish` | status `Open`, `active=1`, `posted_date` set, platforms synced (Website/Indeed) |
| Activate / close posting | `PATCH /job-posts/{id}/toggle` | `Closed ↔ Open` |
| Copy & Use Template | `POST /job-posts` (duplicate as draft) | new draft row |
| Cancel draft | `DELETE /job-posts/{id}` | row removed |
| Run resume screening | `POST /applicants/screen-resume` | NLP preview scored the PDF (spaCy online) — preview only |
| Save applicant after screening | `POST /applicants` (multipart + resume) | `applicants` row + `applicant_screenings` (`PROCESSED`, match=100) |
| Convert (requisition → job post) | `POST /requisitions` + `POST /requisitions/{id}/convert` | `requisitions.status=Converted`, `converted_job_post_id` set |
| Criteria weights + Passing thresholds | `PUT /screening/configuration` | `system_settings.screening.configuration` (validated 100% weights; restored) |
| Reference Data & Aliases — add/edit/deactivate/delete | `POST/PUT/PATCH/DELETE /screening/reference-data` | `screening_reference_data` rows incl. `aliases_json`; all removed |

### New Hire Onboarding
| Button / action | API called | DB effect verified |
|---|---|---|
| Add new hire | `POST /new-hires` | `new_hires` row + auto-created `system_users` portal account + credentials email |
| Create checklist (save checklist) | `POST /checklist-templates` | template + `onboarding_checklist_items` (2 items) |
| Edit checklist | `PUT /checklist-templates/{id}` | title updated, item added/removed (sync verified) |
| Activate / Close | `PUT /checklist-templates/{id}` (`status`) | `Active ↔ Inactive` |
| Edit checklist in the onboarding pipeline | `POST /new-hires/{id}/promote-stage` + `GET …/onboarding-items` | stage → Probationary; stage-gated template items appear and are auto-materialized in `employee_onboarding_items` |
| Toggle pipeline item | `PATCH /onboarding-items/{id}/toggle` | `done=1`, `completed_at` set |
| Delete checklist | `DELETE /checklist-templates/{id}` | template + items removed (works when unreferenced; see Finding #4) |
| Request for evaluation | `PUT /new-hires/{id}` `evaluation_requested_at` | timestamp persisted; null clears it |
| Auto regularization (save setting) | `PUT /settings/onboarding.auto_regularize_days` | value persisted (restored) |
| Requested checklist — create/edit | `POST /checklist-requests`, `PUT /checklist-requests/{id}` | rows + status change persisted |
| Delete requested checklist | — none — | **Finding #3 (UI-only)** |

### Settings
| Control | API called | DB effect verified |
|---|---|---|
| Email / Browser notifications + System announcements toggles | `PUT /my/settings/notifications` | `system_settings.my_notifications_<email>` (restored) |
| Preference: theme / date format / language / time format / time zone → Save changes | `PUT /my/settings/preferences` | `system_settings.my_preferences_<email>` (restored) |
| Login Security: Two-factor + min length + upper/lower/number/symbol | `PUT /settings/security` | `system_settings.security` (restored) |
| Change default password of all users | `POST /reset-default-password` | 23 active users re-hashed; `default_password = Oxford@2026`; hash verifies |
| OTP verification at login (per account) | `PUT /my/otp` | `system_users.otp_enabled` toggled 1→0→1 |
| Update Password | `POST /my/change-password` | hash changed then reverted (`Hash::check`) |
| Company info save | `PUT /settings/company` | `system_settings.company` — see Finding #5 for the public page |
| System announcements | `POST` + `DELETE /announcements/{id}` | row created/removed |
| Create backup | `POST /settings/backups` | real `.sql` dump + `system_settings.backups` entry (BKP-9 ≈ 1.9 MB) |
| Download | `GET /settings/backups/{id}/download` | `.sql` streamed (security note §4) |
| Restore | `POST /settings/backups/{id}/restore` | 245 SQL statements; data intact |
| Automatic backup | `PUT /settings/backup` + Artisan `settings:auto-backup` | preference persisted; command ran (created BKP-7 "Automatic"); scheduled in `SettingsServiceProvider::configureSchedules()` → `everySixHours()` |

## 2. Fix applied during this test

`frontend/src/lib/api.ts` — the Settings **"OTP verification at login"** toggle calls `mySettingsApi.toggleOtp`, which did not exist (runtime `TypeError` and 3 TypeScript errors), even though `PUT /my/otp` exists on the backend. Added:

```ts
toggleOtp: (user: string, enabled: boolean) =>
  request<{ message: string; otp_enabled: boolean }>("/my/otp", {
    method: "PUT",
    body: JSON.stringify({ user, enabled }),
  }),
```
plus `otp_enabled?: boolean` on `mySettingsApi.get()`'s return type.

Verified: `npx tsc --noEmit` now reports **no** error in `Settings.tsx` or `lib/api.ts` (24 pre-existing errors remain in unrelated files: ESS payslip/schedule tabs, `UserManagement.tsx` `usersApi.resetPassword`, `portal-state.tsx` Notification type, `downloadPayslipPdf.ts`, `PromotionRequestModal.tsx`).

## 3. List screens & metric cards — SQL reconciliation (all PASS)

| Screen / card | Endpoint | SQL source | Result |
|---|---|---|---|
| Applicant list | `GET /applicants` | `COUNT(applicants)` = 56 | exact match |
| Total Applicants card + stage/status breakdown + avg score | `GET /applicants/stats` | `COUNT`, `GROUP BY stage/status`, `AVG(fit_score)` = 78.075 | exact match |
| Interview Scheduling list | `GET /interviews` | `COUNT(interviews)` = 27 | exact match |
| Assessment / Assessment-Test / Practical / Final-Evaluation lists | matching GET endpoints | 24 / 16 / 3 / 8 | exact match |
| Job posts list + Open/Draft/Closed cards | `GET /job-posts`, `/job-posts/stats` | 13 total · 11 open · 0 draft · 2 closed | exact match |
| Requisition list | `GET /requisitions` | 14 | exact match |
| Onboarding pipeline list + "Onboarding in progress" card | `GET /new-hires`, `/new-hires/stats` | 28 total · 15 pre-onboarding · 7 probationary · 6 regular | exact match |
| Checklist templates / requests lists | `GET /checklist-templates`, `/checklist-requests` | 2 / 2 | exact match |
| Screening Reference Data & Aliases list | `GET /screening/reference-data/list` | 154 | exact match |
| Announcements list (admin + public) | `GET /announcements`, `/landing/announcements` | 3 | exact match |
| Dashboard cards (Total Applicants, Open Vacancies, Onboarding, Interviews scheduled) | `GET /dashboard/stats` | SQL aggregates | exact match |
| Audit Log total card | `GET /audit-logs/stats` | 1285 | exact match |
| Settings map / backups list | `GET /settings`, `/settings/backups` | 20 system_settings rows; backup catalog | map exact; 3 catalog rows have missing files (Finding #1) |
| Screening Setup dialog | `GET /screening/status` | NLP online, weights sum = 100% | PASS |

## 4. Findings (the 5 failed checks) and recommended fixes

### Finding #1 — Backup catalog lists 3 entries whose `.sql` files are missing
- Evidence: `GET /settings/backups` returns 8 entries; 3 files (BKP-1…BKP-3) do not exist in `storage/app/backups` → `missing_files=3`. Restore/Download of those entries returns `404 "Backup file is missing on the server."`
- Fix: prune/filter catalog entries with missing files (`BackupService::entries()`), or delete the stale `system_settings.backups` rows.

### Finding #2 — "Verify candidate decision" is not persisted
- Evidence: `confirmVerifyFinal()` (ApplicantManagement.tsx) only sets local component state + a local audit toast; there is no endpoint call. The persisted effect happens only later through the hire action (`POST /applicants/{id}/hire`, verified PASS).
- Fix: persist the verified verdict (e.g., on `final_evaluations` or a new `verified_decision` column) and log it through the audit trail.

### Finding #3 — "Delete requested checklist" is UI-only
- Evidence: `deleteRequestedItem()` filters local state only; no `DELETE /checklist-requests/{id}` route exists (route:list shows only index/store/show/update/approve/reject).
- Fix: add a destroy endpoint + `checklistRequestsApi.remove()`, or convert the button to status `Rejected`.

### Finding #4 — Deleting a checklist referenced by a requested checklist → HTTP 500
- Evidence: `fk_checklist_requests_template_id` is **RESTRICT** (`information_schema.REFERENTIAL_CONSTRAINTS`); `DELETE /checklist-templates/{id}` → 500 while a request references it. The frontend also deletes optimistically: `hireStore.deleteMasterChecklist` fire-and-forgets the API call (`hires.ts` lines 382-393) and the button toasts "Checklist deleted" anyway → the checklist reappears after the 15s sync.
- Fix: catch the FK error server-side and return `422` with a friendly message; `await` the delete in `hireStore.deleteMasterChecklist`, show an error toast, and revert the local removal on failure (or make the FK `ON DELETE SET NULL`).

### Finding #5 — Company info saved in Settings is not reflected on the public career page
- Evidence: Settings writes ONE row `system_settings.company = {name,email,contact,businessHours,address,tin}`, but `LandingController::company()` reads DIFFERENT rows: `company.name`, `company.address`, `company.phone`, `company.email`, `company.hours` (each `{"value": …}`), with field-name differences (`contact` vs `phone`, `businessHours` vs `hours`). After saving, `/landing/company` still returns "Oxford Suites Makati".
- Fix: dual-write the dotted keys on save (or make `LandingController` read the `company` object), and align the field names.

### Security / hygiene notes (passing checks, worth attention)
- **Backups endpoints have no auth middleware** (`/api/v1/settings/backups*` only runs the `api` group) — a download without a token returned HTTP 200. Needed for `window.open` downloads, but should be token-protected (`?token=` like the resume preview endpoints).
- **Login Security policy is stored but not enforced server-side**: `my/change-password` and `reset-default-password` validate only `min:8`; the uppercase/lowercase/number/symbol/two-factor flags are not applied to password changes.
- `/auth/login` is throttled to 5 requests/minute (observed 429 when the harness logged in per section — expected behaviour, harness now reuses one token).

## 5. How to re-run

```bash
cd backend-laravel

# read-only: lists + metric cards vs SQL
php scripts/hrms-integration-test.php --section=lists

# per module (create + verify + clean up TEST- rows)
php scripts/hrms-integration-test.php --section=recruitment
php scripts/hrms-integration-test.php --section=applicant
php scripts/hrms-integration-test.php --section=onboarding
php scripts/hrms-integration-test.php --section=settings

# everything (reuses a single login; ends with a TEST- row sweep)
php scripts/hrms-integration-test.php --section=all

# destructive maintenance (restore latest snapshot + reset all passwords to Oxford@2026)
php scripts/hrms-integration-test.php --section=destructive --destructive

# remove any leftover TEST- rows after interrupted runs
php scripts/hrms-integration-test.php --section=cleanup
```
Options: `--keep` (leave TEST rows for manual UI review), `--email=`, `--password=`, `--verbose`.

## 6. Test data created and left behind
- Backups **BKP-5 … BKP-9** (+ **BKP-7**, the first "Automatic" backup) — real dumps, safe to delete or keep.
- Login activity / audit-log entries from the test runs (normal system behaviour).
- All `TEST-*` applicants, job posts, requisitions, new hires, checklist templates/requests and announcements were removed by the per-section cleanup and the final sweep (verified: 0 leftovers).
- After the destructive run, all active portal accounts sign in with the default password **Oxford@2026**.



