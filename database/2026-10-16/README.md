# 2026-10-16 — ESS ↔ ERM document-request loop

Snapshot of everything done on **October 16, 2026**.

- **Feature 2:** closed-loop ESS ↔ ERM document request
  (employee files request → ERM inbox → HR fulfils with a file → employee notified & downloads).
- **Feature 1:** applicant resume/document auto-copy into Employee Records on hire.

---

## 1. Database changes (the only thing you must migrate)

Three Laravel migrations were added:

| # | Migration | Effect |
|---|-----------|--------|
| 1 | `2026_10_16_000001_create_ess_request_attachments_table` | **new table** `ess_request_attachments` |
| 2 | `2026_10_16_000002_create_ess_request_status_histories_table` | **new table** `ess_request_status_histories` |
| 3 | `2026_10_16_000003_add_provenance_to_employee_documents_table` | **4 new columns** on `employee_documents`: `source_type`, `source_id`, `original_name`, `source_hash` + index `idx_employee_documents_source` |

No existing column is dropped, renamed, or retyped. Everything is **additive**.

Copies of the migration files are in [`./migrations/`](./migrations) for reference.

### How to apply (choose ONE)

**(A) Recommended — with artisan** (works on Dokploy if the deploy runs PHP):

```bash
php artisan migrate --force
```

**(B) Without artisan — run the single SQL file** (e.g. via a DB admin/console):

```bash
mysql -u <user> -p <database> < 2026-10-16-schema.sql
```

`2026-10-16-schema.sql` is idempotent **and** registers the 3 migrations in the
`migrations` table, so running (A) afterwards is safe and will not re-create
anything. Running (A) first and (B) after is also safe (the guards skip).

> Assumes the base tables already exist: `ess_requests`, `system_users`,
> `employees`, `employee_documents`, `migrations`.

### Optional demo data (do NOT run on the shared/prod DB unless you want it)

`backend-laravel/database/seeders/EssDocumentLoopDemoSeeder.php` inserts two
sample rows (`REQ-DEMO-COE` = Pending, `REQ-DEMO-SR` = Completed with a file):

```bash
php artisan db:seed --class=EssDocumentLoopDemoSeeder
```

---

## 2. Code changes (ship with the deploy, no manual step)

### Backend (Laravel)

**New**
- `Modules/EmployeeRecords/app/Http/Controllers/DocumentRequestController.php` — ERM fulfilment inbox (`index`, `show`, `fulfill`, `file`).
- `Modules/EmployeeRecords/app/Listeners/NotifyRecordsInboxOfNewRequest.php`, `.../NotifyEmployeeRequestFulfilled.php`.
- `Modules/EmployeeRecords/app/Services/EmployeeRecordProvisioner.php` — Feature 1 applicant → employee document copy (idempotent, pointers only).
- `Modules/EmployeeSelfService/app/Events/EssRequestFiled.php`, `.../EssRequestFulfilled.php`.
- `app/Models/EssRequestAttachment.php`, `app/Models/EssRequestStatusHistory.php`.
- `app/Providers/IntegrationServiceProvider.php`.
- `app/Services/Integration/Contracts/{Attendance,Payroll,Learning,DocumentArchive}Provider.php` — Team 2/3/4/8 seams.
- `app/Services/Integration/Mocks/Mock{Attendance,Payroll,Learning,DocumentArchive}Provider.php`.

**Modified**
- `bootstrap/providers.php` — registered `IntegrationServiceProvider`.
- `app/Models/EssRequest.php` — `attachments()`, `statusHistory()`, `fulfillmentAttachment()`.
- `app/Models/EmployeeDocument.php` — provenance fields in `$fillable`.
- `Modules/EmployeeSelfService/app/Http/Controllers/EssPortalController.php` — intake (status history + event + attachment), read-back (attachments/timeline), file stream; unique request-code generation fix; category name fallback.
- `Modules/EmployeeSelfService/app/Http/Controllers/EssAdminController.php` — writes status history on status change.
- `Modules/EmployeeRecords/app/Providers/EventServiceProvider.php` — explicit listener registration.
- `Modules/NewHireOnboarding/app/Http/Controllers/NewHireController.php` — calls `EmployeeRecordProvisioner` on regularization (best-effort).
- `Modules/EmployeeSelfService/routes/api.php` — token-auth file routes.
- `Modules/EmployeeRecords/routes/api.php` — `erm/document-requests` routes + `Employee Records` permission gating.

### Frontend (React)

**New**
- `frontend/src/components/modules/employee-records/DocumentRequestInbox.tsx` — ERM fulfilment queue + fulfil modal (upload or attach from archive).

**Modified**
- `frontend/src/lib/api.ts` — `ermApi`, `ApiDocumentRequest`, `ApiEssRequestAttachment`, `essApi.requestAttachmentUrl`.
- `frontend/src/components/modules/EmployeeRecords.tsx` — new "Document Requests" tab.
- `frontend/src/components/modules/ess/modals/RequestTimelineModal.tsx` — Documents section (downloads).
- `frontend/src/components/modules/ess/tabs/EssRequestCenterTab.tsx` — passes attachments/timeline.

---

## 3. Verification

- New feature test: `backend-laravel/tests/Feature/EssErmDocumentLoopTest.php` — **3 passing** (full loop, archive-attach, permission denial).
- Full backend suite: **80 passed, 4 failed**. The 4 failures are **pre-existing and unrelated**
  (`AccessControlTest`, `AuditLogTest`, `ChatbotSecurityTest`, `NotificationAndAuditTest`).
- Locally applied only to the XAMPP `hotel_hr` database for verification.
  **Your Dokploy database was not touched.**
