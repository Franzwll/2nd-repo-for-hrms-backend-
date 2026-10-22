# ESS Request Pipeline — Implementation Plan

**Scope:** Employee (ESS) → ESS Management (Admin gate) → target module (ERM / Attendance / Payroll / Performance) → ESS Management (release) → Employee.

**Status:** Implemented on this branch (schema, workflow, adapters, ESS Management gate/release UI, module queues, tests). Migrations and PHPUnit have not been executed in this environment because no PHP runtime is available.

---

## 1. Target pipeline

```
 Employee (ESS)
      │ 1. File request
      ▼
 ESS Management  ── 2. Accept / Decline (granting station)
      │                   └── Decline → Rejected (terminal, employee notified)
      │ 3. Approve + route
      ▼
 Target module queue
   ├── ERM          (HR documents, COE, service record, clearance)
   ├── Attendance   (leave, shift swap, time correction)
   ├── Payroll      (payslip copy, tax adjustment, salary advance)
   └── Performance  (promotion, reclassification, career)
      │ 4. Module works the request and submits a result
      ▼
 ESS Management  ── 5. Verify + Release (single exit point)
      │
      ▼
 Employee (ESS)  ── 6. Sees result, downloads file / reads decision
```

**Non-negotiable rules**

1. A module **never** sees a request before ESS Admin approves it.
2. A module **never** completes a request directly. It only submits a result.
3. Only ESS Management can move a request to `Completed` and release it to the employee.
4. Every hand-off is written to an append-only routing ledger + status history + audit log.
5. Employees only see module output after release (no partial/preview files).

---

## 2. Current behaviour vs target (gap analysis)

| Area | Today | Target |
|---|---|---|
| Gate | `EssRequestFiled` notifies ERM on submit (`Modules/EmployeeRecords/app/Listeners/NotifyRecordsInboxOfNewRequest.php`) | ERM is notified only on dispatch, after ESS Admin approval |
| ERM inbox | `DocumentRequestController::documentRequests()` returns **all** document requests incl. `Pending` | Only `routed_module = erm` and actionable statuses |
| Routing | None — categories handled by ESS Admin in one queue | `routed_module` + per-module queue + dispatch/reroute |
| Document completion | `DocumentRequestController::fulfill()` sets `Completed` | Sets `For Release`; ESS Admin releases → `Completed` |
| Leave deduction | `EssRequestWorkflow::review()` deducts on ESS Admin approval (`applyLeaveDeduction`) | Deducted once when the Attendance module approves the leave (at result submission), with a compensating reversal if the request is rerouted/voided |
| Statuses | `Pending, Under Review, Approved, For Fulfillment, Rejected, Returned for Clarification, Completed, Cancelled` | Add `For Dispatch`, `With Module`, `For Release`; retire `For Fulfillment`/`Approved` via mapping |
| Notifications | Employee + HR only | Employee, ESS Admin, and the routed module audience |
| Permissions | `ESS Management` / `ESS Management:Edit` | Plus per-module permission via a module registry |

Existing tests that encode the old behaviour and must be rewritten:

- `backend-laravel/tests/Feature/EssErmDocumentLoopTest.php` (asserts ERM sees a `Pending` request)
- `backend-laravel/tests/Feature/EssRequestWorkflowTest.php` (asserts approval → `For Fulfillment`)

---

## 3. Status model and state machine

### 3.1 Statuses

| Status | Owner | Meaning |
|---|---|---|
| `Pending` | ESS Admin | Filed, waiting for the gate |
| `Under Review` | ESS Admin | Gate opened the request |
| `Returned for Clarification` | Employee | ESS Admin needs more info |
| `For Dispatch` | ESS Admin | Approved, waiting for module acknowledgement |
| `With Module` | Module | Module accepted / working |
| `For Release` | ESS Admin | Module returned a result, waiting for release |
| `Completed` | Employee | Released; terminal |
| `Rejected` | — | Declined at the gate or closed; terminal |
| `Cancelled` | — | Withdrawn by employee; terminal |

### 3.2 Transitions

| From | Action | To | Actor | Guards |
|---|---|---|---|---|
| `Pending` | `start` | `Under Review` | ESS Admin | — |
| `Pending`/`Under Review` | `approve` | `For Dispatch` | ESS Admin | category resolves to a module |
| `Pending`/`Under Review` | `approve` | `For Release` | ESS Admin | category has no module (manual handling) |
| `Pending`/`Under Review` | `return` | `Returned for Clarification` | ESS Admin | note required |
| `Pending`/`Under Review` | `reject` | `Rejected` | ESS Admin | note required |
| `Returned for Clarification` | resubmit | `Under Review` | Employee | — |
| `For Dispatch` | `accept` | `With Module` | Module | routed to caller's module |
| `For Dispatch`/`With Module` | `decline` | `Under Review` | Module | reason required; clears `routed_module` |
| `With Module` | `complete` | `For Release` | Module | result payload / file per category |
| `For Release` | `release` | `Completed` | ESS Admin | required file present; not already released |
| `For Release`/`Under Review` | `reroute` | `For Dispatch` | ESS Admin | new module selected |
| `Pending`/`Under Review`/`Returned for Clarification` | `cancel` | `Cancelled` | Employee | — |

`Completed`, `Rejected`, `Cancelled` are terminal. Any other transition returns `422`.

### 3.3 Legacy data mapping (migration)

| Old | New | Notes |
|---|---|---|
| `For Fulfillment` | `With Module` | Backfill `routed_module = 'erm'` for document requests |
| `Approved` | `For Release` | Already approved; ESS Admin releases in bulk |
| `Returned for Clarification` | unchanged | |
| `Rejected` / `Completed` / `Cancelled` | unchanged | |
| `Pending` / `Under Review` | unchanged | |

Update the `chk_ess_requests_status` CHECK constraint in the same migration (reuse the helper pattern in `database/migrations/2026_10_20_000001_add_ess_fulfillment_workflow.php`).

---

## 4. Data model changes

### 4.1 `ess_requests` (additive)

| Column | Type | Purpose |
|---|---|---|
| `routed_module` | `string(40) nullable, index` | `erm`, `attendance`, `payroll`, `performance` |
| `routed_at` | `timestamp nullable` | Last dispatch time |
| `module_responded_at` | `timestamp nullable` | Module result time |
| `module_reference` | `string(100) nullable` | External id: `leave_request_id`, `payslip_id`, `employee_document_id` |
| `module_note` | `text nullable` | Module-facing note (result/decline reason) |
| `released_at` | `timestamp nullable` | Completion/release time |
| `released_by_user_id` | `unsignedBigInteger nullable` | FK `system_users.system_user_id` |
| `sla_due_at` | `timestamp nullable` | Optional SLA/escalation |

### 4.2 `ess_categories` (additive)

| Column | Type | Purpose |
|---|---|---|
| `default_module` | `string(40) nullable, index` | Routing target |
| `requires_module_ack` | `boolean default true` | `false` = dispatch jumps straight to `With Module` |
| `sla_hours` | `integer nullable` | Drives `sla_due_at` |

> Release is **manual only** in v1. There is no auto-release path; every completed request waits in `For Release` for an ESS Admin.

### 4.3 New table `ess_request_routings` (append-only ledger)

```
ess_request_routing_id  bigint PK
ess_request_id          bigint FK -> ess_requests (cascade)
leg                     smallint          -- 1, 2, 3 ... per dispatch cycle
from_module             string(40)        -- ess_admin | erm | attendance | payroll | performance
to_module               string(40)        -- same set
action                  string(20)        -- dispatch | accept | decline | complete | reroute | release
actor_user_id           bigint nullable FK -> system_users
note                    text nullable
result_payload          json nullable     -- module-specific result
created_at              timestamp
index (ess_request_id, leg)
index (to_module, action)
```

The status history stays as the employee-facing timeline; the routing ledger is the inter-module audit trail.

### 4.4 `ess_request_attachments` (additive)

- `source_module` `string(40) nullable` — set when a module uploads the result.
- Keep `direction` as `employee|hr` to avoid a CHECK-constraint rewrite; treat `direction = hr` + `source_module != null` as module output.
- Add `EssRequest::outboundAttachment()` helper replacing scattered `firstWhere('direction', 'hr')` checks.

### 4.5 Config: `config/ess_routing.php`

```php
return [
    'enabled' => env('ESS_MODULE_ROUTING_ENABLED', true),

    'categories' => [
        'hr_document' => 'erm',
        'leave'       => 'attendance',
        'schedule'    => 'attendance',
        'attendance'  => 'attendance',
        'payroll'     => 'payroll',
        'benefits'    => 'payroll',
        'career'      => 'performance',
    ],

    'modules' => [
        'erm'         => ['label' => 'Employee Records', 'permission' => 'Employee Records',   'adapter' => ErmModuleAdapter::class],
        'attendance'  => ['label' => 'Attendance',       'permission' => 'Attendance',         'adapter' => AttendanceModuleAdapter::class],
        'payroll'     => ['label' => 'Payroll',          'permission' => 'Payroll',            'adapter' => PayrollModuleAdapter::class],
        'performance' => ['label' => 'Performance',      'permission' => 'Performance',        'adapter' => PerformanceModuleAdapter::class],
    ],
];
```

Resolution order: category `default_module` → config map by category code → keyword fallback on `request_type` (for legacy rows) → `null` (ESS Admin handles internally).

---

## 5. Backend architecture

### 5.1 New/changed components

| File | Change |
|---|---|
| `app/Models/EssRequest.php` | New fillables/casts/relations; `routings()`, `outboundAttachment()`, `moduleLabel()` |
| `app/Models/EssCategory.php` | New fillables |
| `app/Models/EssRequestRouting.php` | **New** model |
| `Modules/EmployeeSelfService/app/Services/EssRequestWorkflow.php` | Split into gate, dispatch, module result, release; remove leave deduction from `review()` |
| `Modules/EmployeeSelfService/app/Services/EssRoutingService.php` | **New** — resolves module from category/request type |
| `Modules/EmployeeSelfService/app/Services/EssModuleRegistry.php` | **New** — loads config, exposes adapters + permissions |
| `Modules/EmployeeSelfService/app/Contracts/EssModuleAdapter.php` | **New** — module seam |
| `Modules/EmployeeSelfService/app/Adapters/{Erm,Attendance,Payroll,Performance}ModuleAdapter.php` | **New** — per-module validation and side effects |
| `Modules/EmployeeSelfService/app/Http/Controllers/EssModuleInboxController.php` | **New** — generic module queue + accept/decline/complete |
| `Modules/EmployeeSelfService/app/Http/Middleware/EnsureEssModuleAccess.php` | **New** — permission from registry |
| `Modules/EmployeeSelfService/app/Events/EssRequestDispatched.php` | **New** — fired after dispatch |
| `Modules/EmployeeSelfService/app/Events/EssRequestReturnedToEss.php` | **New** — fired when module completes/declines |
| `Modules/EmployeeSelfService/app/Events/EssRequestReleased.php` | **New** — fired on release |
| `Modules/EmployeeSelfService/app/Listeners/NotifyModuleOfDispatch.php` | **New** — module audience notification |
| `Modules/EmployeeRecords/app/Http/Controllers/DocumentRequestController.php` | Filter by `routed_module = erm`; `fulfill` becomes `complete` (→ `For Release`) |
| `Modules/EmployeeRecords/app/Providers/EventServiceProvider.php` | Remove `EssRequestFiled` listener; register module dispatch listener if ERM keeps local notifications |
| `Modules/EmployeeRecords/app/Listeners/NotifyRecordsInboxOfNewRequest.php` | Delete or repurpose to `EssRequestDispatched` |
| `Modules/EmployeeSelfService/routes/api.php` | Gate, dispatch, release, reroute, module inbox routes |
| `config/ess_routing.php` | **New** |

### 5.2 Adapter contract

```php
interface EssModuleAdapter
{
    public function key(): string;

    /** Reject categories this module does not own. */
    public function supports(EssRequest $request): bool;

    /** Validate the result payload before the request moves to For Release. */
    public function validateResult(EssRequest $request, array $payload, ?UploadedFile $file): void;

    /**
     * Persist module-specific records; return the reference the ESS shows.
     * Runs inside the submitResult transaction, so module-side effects that
     * must be immediate (e.g. leave deduction) commit together with For Release.
     */
    public function applyResult(EssRequest $request, array $payload, ?UploadedFile $file, SystemUser $actor): array;

    /** Compensate applyResult when a result is voided/rerouted. Must be idempotent. */
    public function reverseResult(EssRequest $request, SystemUser $actor, string $reason): void;

    /** Delivery side effects applied exactly once, at release. Never mutates balances. */
    public function onRelease(EssRequest $request): void;
}
```

Initial adapters:

| Module | `validateResult` | `applyResult` (at module approval) | `reverseResult` | `onRelease` |
|---|---|---|---|---|
| ERM | file **or** `document_id` required | store attachment (`source_module=erm`), link `employee_documents` | remove module attachment | — |
| Attendance | decision, `date_from/to`, leave type; balance check | **deduct `leave_balances` immediately** and record `ess_request_id`; optional `attendance_records` correction | restore the exact deducted days (compensating entry) | — |
| Payroll | payslip id or generated PDF | link `payroll_records`, store PDF | unlink/mark void | mark payslip released to employee |
| Performance | decision / recommendation | link `promotion_requests` or `performance_reviews` | revert pending recommendation | apply grade/step change if approved |

`reverseResult` is what makes "deduct at module approval" safe: the balance is already correct for the employee, but an ESS Admin reroute or void still leaves the ledger consistent.

Until the real Attendance/Payroll/Performance modules exist, bind them to a `DatabaseModuleAdapter` that only validates the payload and stores it on the routing ledger. This lets the pipeline be demoed end-to-end with the ESS Admin acting on those queues.

### 5.3 Workflow API (server-side)

```php
// Gate
$workflow->startReview($request, $actor);
$workflow->review($request, $actor, 'approve'|'reject'|'return', $note);
//  approve -> For Dispatch + routed_module + ledger row

// Module
$workflow->accept($request, $actor);              // For Dispatch -> With Module
$workflow->decline($request, $actor, $reason);    // -> Under Review
$workflow->submitResult($request, $actor, $payload, $file); // -> For Release

// ESS Admin exit
$workflow->release($request, $actor, $note);      // -> Completed
$workflow->reroute($request, $actor, $module, $note); // -> For Dispatch (+ reverseResult)
```

Every method wraps DB writes in a transaction, writes `ess_request_routings` + `EssRequestStatusHistory`, and calls `AuditLogger`.

### 5.4 Leave deduction rule

The Attendance module owns the decision, so the deduction happens **at module approval**, not at ESS Admin approval and not at release:

1. ESS Admin approves → request is dispatched. **No balance change.**
2. Attendance accepts → `With Module`. **No balance change yet.**
3. Attendance approves the leave → `submitResult()` runs inside one transaction:
   - validates the balance again (server-side, not just the modal);
   - deducts `leave_balances.used_days`;
   - writes the ledger row and moves the request to `For Release`.
4. ESS Admin releases → `Completed`. **No balance change** (delivery/notification only).
5. If the result is later voided or rerouted (e.g. wrong leave type), `reverseResult()` restores exactly the deducted days and writes an audit entry.

The employee's balance therefore reflects the Attendance decision immediately, even before ESS Admin releases the notice. The release step is a delivery checkpoint, not an approval step.

### 5.5 Routes

```php
// Employee (existing, unchanged contracts)
POST   /api/v1/ess/requests/{id}/respond
POST   /api/v1/ess/requests/{id}/cancel

// ESS Admin gate + release
POST   /api/v1/ess/admin/requests/{id}/dispatch      // optional explicit dispatch
POST   /api/v1/ess/admin/requests/{id}/release
POST   /api/v1/ess/admin/requests/{id}/reroute
GET    /api/v1/ess/admin/requests/{id}/routings

// Generic module inbox (permission resolved from registry)
GET    /api/v1/ess/modules/{module}/requests
GET    /api/v1/ess/modules/{module}/requests/{id}
POST   /api/v1/ess/modules/{module}/requests/{id}/accept
POST   /api/v1/ess/modules/{module}/requests/{id}/decline
POST   /api/v1/ess/modules/{module}/requests/{id}/complete
```

`review` keeps its current contract; `decision = approve` now performs dispatch internally. Add `module` as an optional override and reject modules the category does not support.

---

## 6. Notifications and audit

| Event | Recipients | Channel target |
|---|---|---|
| Request filed | ESS Admins + Super Admins | `ESS Management`, `target_type=ess_request` |
| Gate returns / rejects | Employee | `Employee Self-Service` |
| Dispatched | Module audience (permission-based) | `module_name = <module label>` |
| Module declines | ESS Admins | `ESS Management` |
| Module completes | ESS Admins | `ESS Management` |
| Released | Employee | `Employee Self-Service` |
| SLA breached (optional) | ESS Admins + module | `ESS Management` |

Add `Notifier::moduleAudienceIds($module)` that resolves users by the module permission (and falls back to HR admins if empty), mirroring `Notifier::hrAdminIds()`.

Audit actions to add: `ESS Request Dispatched`, `ESS Request Accepted by Module`, `ESS Request Declined by Module`, `ESS Request Result Submitted`, `ESS Request Released`, `ESS Request Rerouted`. Include `from_module`, `to_module`, and `leg` in `details`.

---

## 7. Frontend changes

### 7.1 Employee — My Requests (`frontend/src/components/modules/my-request/`)

- `MyRequestHistoryTable.tsx`: add a 4-step pipeline stepper: **Filed → ESS Review → Module → Release**.
  - Display module label while `For Dispatch` / `With Module`.
  - Display "Ready for release" while `For Release`.
  - Show `module_note` only after release.
  - Download button only for released attachments.
- `myRequestModules.ts`: add `module` metadata per category so the UI can label the destination.
- Status badge map: add `For Dispatch`, `With Module`, `For Release`.

### 7.2 ESS Management (`frontend/src/components/modules/ess/EssManagement.tsx`)

- Replace the single list with stage tabs:
  - **Gate** (`Pending`, `Under Review`, `Returned for Clarification`)
  - **Routing** (`For Dispatch`) — shows target module, allows reroute
  - **Awaiting release** (`For Release`)
  - **Completed / Rejected / Cancelled**
- Add columns: `Module`, `Module result`, `Sent back at`.
- Row actions: Approve & Route, Reject, Return, **Release**, Reroute.
- Bulk actions limited to Gate (approve/reject) and Release.
- Release dialog: read module result, attach/verify file (docs), optional note, confirm.
- Remove `fulfill` as the primary ESS Admin action; keep a superadmin-only "manual fulfilment" override.

### 7.3 ERM inbox (`frontend/src/components/modules/employee-records/DocumentRequestInbox.tsx`)

- Only show requests routed to ERM (`routed_module = erm`).
- Statuses: `For Dispatch` (Accept), `With Module` (work + send back), `For Release` (read-only, "with ESS Management").
- Replace "Fulfil" with **"Send back to ESS Management"**; toast: "Sent back for release — the employee will be notified once ESS Management releases it."
- Add a gate-approved indicator so staff know the request passed the granting station.

### 7.4 Other module inboxes

- Add a reusable `ModuleRequestInbox` component (table + accept/decline/complete dialog) driven by config.
- Ship an interim **Module Queues** tab under ESS Management so Attendance / Payroll / Performance can accept, decline and send results back before their dedicated module UIs land.

### 7.5 API client (`frontend/src/lib/api.ts`)

Add to `essApi`: `dispatchRequest`, `releaseRequest`, `rerouteRequest`, `requestRoutings`, `moduleQueue`, `moduleRequest`, `moduleAccept`, `moduleDecline`, `moduleComplete`. Add `module`, `module_note`, `module_reference`, `released_at` to `ApiEssRequestItem`.

---

## 8. Security and correctness rules

1. **Gate enforcement in queries, not just actions** — module endpoints filter on `routed_module`. A module user must never fetch a `Pending`/`Under Review` request, even by id.
2. **Module permission middleware** resolves the permission from `config/ess_routing.php`; superadmin bypass stays consistent with `SystemUser::isSuperAdmin()`.
3. **Idempotency** — `accept`, `complete`, `release` return `422` when the request is not in the expected status. `release` also checks `released_at`.
4. **File access** — reuse the existing token-auth streaming pattern; module users may only stream attachments of requests routed to their module; employees only after release.
5. **Transactions** — result submission, balance mutation, release, and ledger writes are atomic.
6. **No cross-module completion** — `EssModuleInboxController` derives the module from the route and verifies `request->routed_module === route module`.
7. **Audit + history** — one ledger row per action; never mutate historical rows.
8. **Feature flag** — `ESS_MODULE_ROUTING_ENABLED=false` keeps today's behaviour, so the branch stays deployable while the plan is implemented.

---

## 9. Implementation phases

### Phase 0 — Prep (0.5 day)
- Add `config/ess_routing.php` + `ESS_MODULE_ROUTING_ENABLED`.
- Add `essApi`/type scaffolding without wiring.
- Decide the five open questions in §11.

### Phase 1 — Schema + state machine (1.5–2 days)
- Migrations: `ess_requests` columns, `ess_categories` columns, `ess_request_routings`, `ess_request_attachments.source_module`, status CHECK constraint + legacy mapping.
- `EssRequestRouting` model, `EssRequest`/`EssCategory` updates.
- Refactor `EssRequestWorkflow`: `dispatch`, `accept`, `decline`, `submitResult`, `release`, `reroute`; remove `applyLeaveDeduction` from `review()`.
- `EssRoutingService` + unit tests for resolution and transitions.
- **Exit criteria:** every transition covered by a feature test; legacy statuses map correctly.

### Phase 2 — Gate + dispatch + ERM migration (2 days)
- Fire `EssRequestDispatched` from `review(approve)`.
- Move ERM notification from `EssRequestFiled` to `EssRequestDispatched`.
- Filter `DocumentRequestController` by `routed_module`.
- Convert ERM `fulfill` → `submitResult` (`For Release`).
- Update `EssErmDocumentLoopTest` / `EssRequestWorkflowTest`; add gate tests (ERM cannot see `Pending`).
- **Exit criteria:** employee files → ESS Admin approves → ERM sees it for the first time → ERM sends back → ESS Admin releases → employee downloads.

### Phase 3 — ESS Management UI (2 days)
- Stage tabs, module columns, release/reroute dialogs, bulk release.
- Employee pipeline stepper + module labels.
- **Exit criteria:** full pipeline operable from the UI with no API calls.

### Phase 4 — Other modules (2–3 days, depends on module availability)
- Generic `EssModuleInboxController` + adapters for attendance/payroll/performance.
- Attendance adapter deducts leave in `submitResult()` (module approval), with `reverseResult()` for reroutes/voids; validate balance server-side.
- Add module queues preview in ESS Management until the real UIs exist.
- **Exit criteria:** one request per module completes the full loop.

### Phase 5 — Hardening (1–2 days)
- Notifications, audit entries, SLA job (optional), permission tests, file-access tests.
- Backfill verification against a copy of production data.
- Update `docs/FEATURE_DOCUMENTATION.md` and the ERM/ESS diagrams.

**Total:** ~9–11 working days for one developer, less if Phase 4 modules are delivered by other teams.

---

## 10. Test plan

**Backend (PHPUnit feature tests)**

| Test | Assertion |
|---|---|
| `EssRoutingGateTest` | ERM cannot list or fetch a `Pending` request; 403/empty queue |
| `EssDispatchTest` | ESS Admin approve → `For Dispatch`, `routed_module` set, ledger row, module notification |
| `EssModuleAcceptDeclineTest` | accept → `With Module`; decline → `Under Review` with reason |
| `EssModuleResultTest` | complete → `For Release`, result payload stored, employee not yet notified |
| `EssReleaseTest` | release → `Completed`, employee notified, `EssRequestFulfilled`, file downloadable |
| `EssReleaseGuardTest` | cannot release without required file; double release returns 422 |
| `EssRerouteTest` | reroute increments leg, clears module reference, old ledger preserved |
| `EssLeaveDeductionTest` | balance unchanged at dispatch/accept; deducted once when Attendance submits an approved result; released does not deduct again |
| `EssLeaveReversalTest` | rerouting a module-approved leave restores the exact days and logs the reversal |
| `EssModuleAuthorizationTest` | payroll user cannot open an ERM-routed request and vice versa |

**Frontend QA checklist**
- Employee stepper matches backend status for every state.
- ESS Admin can complete the loop with keyboard only.
- ERM inbox never shows a pre-approval request.
- File previews 403 before release.
- Mobile layout for the release dialog and stepper.

---

## 11. Confirmed decisions

| # | Decision |
|---|---|
| 1 | **Manual release only.** Every module result waits in `For Release` for an ESS Admin. No auto-release path in v1. |
| 2 | **Modules can decline.** A decline returns the request to `Under Review` with a required reason so ESS Admin can reroute it. |
| 3 | **Leave is deducted when the Attendance module approves it** (inside `submitResult`), not at ESS Admin approval and not at release. Reroute/void uses `reverseResult` to restore the days. |
| 4 | **ERM is one module.** It fulfils `hr_document`; the archive is an attach source, not a separate queue. |
| 5 | **Modules are integrated through the adapter seam.** DB/event adapters now; the same contract can be backed by HTTP when a module is a separate service. |

---

## 12. Definition of done

- A request cannot reach a module before ESS Admin approval, proven by test.
- No module can set `Completed`; only `release` can, and release is always manual.
- A leave deduction happens exactly once when Attendance approves it; release does not touch the balance; reroute/void reverses it exactly.
- Every hand-off appears in `ess_request_routings`, `ess_request_status_histories`, and `audit_logs`.
- Employee sees the module name, the module result, and the released file.
- Existing document loop still works end-to-end, with one extra release click.
- `ESS_MODULE_ROUTING_ENABLED=false` keeps the gate and parks approved requests at `For Release` for manual ESS Management handling (no module dispatch).

---

## 13. As-built notes

- **Manual document override.** When ESS Management approves an `hr_document` request *and* attaches the file in the same step, the request is approved straight to `For Release`, fulfilled, and released. It is never dispatched to ERM, so ERM receives no notification for work that is already complete (`EssRequestWorkflow::approveManually`).
- **Interim module queues.** ERM keeps its dedicated inbox. Attendance, Payroll, and Performance are operable through the generic `EssModuleInboxController` and the ESS Management → **Module Queues** tab until their own modules ship.
- **Single-result invariant.** Dispatch, reroute, and decline clear prior `direction=hr` output before a new module takes ownership. This prevents an old ERM/Payroll file from being released as another module's result. Employee uploads (`direction=employee`) are untouched.
- **Module compensation is transactional.** `dispatch`, `reroute`, and `decline` run compensation, transition, and ledger writes in one DB transaction.
- **Legacy constraint ordering fixed.** `2026_10_20_000001_add_ess_fulfillment_workflow` now widens the status CHECK before moving `Approved` rows to `For Fulfillment`; otherwise upgrades with existing rows failed before the new routing migration could run.
- **Queue authorization is edit-grade.** The Employee role has View on ESS Management so it can open the portal; that no longer grants access to the company-wide admin queue or the generic module queues. Dispatch notifications also target edit-grade module roles only, not every employee with portal access.
- **Frontend.** Employee views show a four-step pipeline (Filed → ESS Review → Module → Release), the module label while in flight, and module notes only after release. HR/module attachments remain hidden from employees until `Completed`.
- **Test execution.** PHP syntax was verified with `php-parser`; `npm run build` passes. PHPUnit/migrations were not run because this environment has no PHP runtime.
