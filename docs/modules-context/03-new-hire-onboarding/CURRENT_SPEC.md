# Current Module Spec: New Hire Onboarding

> **Source File:** `frontend/src/components/modules/NewHireOnboarding.tsx` (4,980 lines)  
> **Route:** `/admin/onboarding` & `/superadmin/onboarding`

---

## 1. Visual Picture of the Current Module

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ PageHeader                                                              [Generate Report]│
│ Title: "New Hire Onboarding"                                                           │
│ Description: "Track pre-employment requirements, contracts, & onboarding progress."    │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ ─────────────────────────────────── Gold Gradient Rule ──────────────────────────────── │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ [Total New Hires: 7]  [Pre-onboarding: 2] [Probationary: 5] [Awaiting Evaluation: 2]   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ <Tabs>                                                                                 │
│ [📋 Onboarding Pipeline]                     [📨 Requested Checklists]                 │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ TAB 1 CONTENT:                                                                         │
│ ┌────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ "Onboarding Status Tracker" Card                                                   │ │
│ │ Horizontal decorative progress rails:                                              │ │
│ │ (1) Pre-onboarding ─────────────────────────➔ (2) Probationary                     │ │
│ └────────────────────────────────────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ New Hires Table: Name, Role, Department, Start Date, Checklist Progress, Actions   │ │
│ └────────────────────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Exhaustive Breakdown of Each Component & Element

### 2.1 Top Bar & Header Controls
- **PageHeader Component:**
  - `title="New Hire Onboarding"`
  - `description="Track pre-employment requirements, contracts, and onboarding progress for incoming hires."`
  - `actions`:
    - `Generate Report` button: Launches `<Dialog open={reportsOpen}>` with 3 pre-defined reports (each with its own `[ ⬇ Generate ]` button):
      - **Onboarding Summary** — *"Every active hire with stage, days of work and overall progress."*
      - **Checklist Progress** — *"Verified vs. pending requirements per hire."*
      - **Overdue & At-Risk** — *"Incomplete hires past the expected timeline (pre-onboarding > 7 days, probationary > 30 days)."*
      - All exports are sealed in an **AES-256 ZIP** (password prompted at download time, not via a form field).
- **Gold Rule Line:** 2px divider (`gold-rule`).
- **4 StatCards:**
  1. `Total New Hires`: `onboardingHires.length` (icon: `Users`, tone: `primary`).
  2. `Pre-onboarding`: `onboardingHires.filter(h => h.stage === "Pre-onboarding").length` (icon: `ClipboardList`).
  3. `Probationary`: `onboardingHires.filter(h => h.stage === "Probationary").length` (icon: `ClipboardCheck`, tone: `gold`).
  4. `Awaiting Evaluation`: `awaitingHires.length` (icon: `Hourglass`, tone: `success`).

---

### 2.2 Tab 1: "Onboarding Pipeline" (`value="pipeline"`)

#### Component A: "Onboarding Status Tracker" Card
- `h2`: `ClipboardList` icon + *"Onboarding Status Tracker"*.
- **Horizontal Progress Rail (2 nodes, non-interactive/decorative):**
  - Node 1: `Pre-onboarding` — solid maroon fill, maroon circle `1`. Subtext: *"Requirements submission, contract signing, orientation scheduling."*
  - Node 2: `Probationary` — outlined grey circle `2`. Subtext: *"Active probation period with department training and monthly evaluation."*
  - Note: The `Regularized` stage is NOT rendered as a node on this tracker rail.

#### Component B: Hire List Table (Two-Panel Layout)
- **Layout:** Left ~60% = hire list table; Right ~40% = inline checklist inspection panel (opens when a hire is clicked).
- Left panel controls toolbar:
  - Search input (`Search name, position...`).
  - `All departments ▾` filter.
  - Stage filter dropdown (`Pre-onboarding`, `Probationary`, `All hired applicants`).
  - Settings icon (gear).
  - `[ + Add new hire ]` maroon primary button.
- **Table Columns:**
  1. `NEW HIRE ↕`: Avatar initials, Name, Sub-department.
  2. `POSITION ↕`: Job title.
  3. `START DATE ↕`: Formatted commencement date (YYYY-MM-DD).
  4. `DAYS COUNT OF START WORKING ↕`: Days elapsed + auto-regularization countdown (e.g. `94 days start working`, `1 day to auto-regularization`).
  5. `REQUIREMENTS ↕`: Progress bar (e.g. `2/9 complete`, `5/9 complete`).
  6. `STAGE ↕`: Badge (`Pre-onboarding` amber, `Probationary` blue/neutral).
  7. `Actions`: `[ 👁 View ]` button — clicking populates the right-side checklist panel.
- **Right panel (Checklist Panel):** Shows selected hire's contact info, `REQUIREMENTS CHECKLIST` progress (%), individual checklist items with `Pending` badge + `↑ Attach file ▾` dropzone per item, `[ ✏ Edit Checklist ]` button, and `"Advance to Probationary is locked."` footer when incomplete.

#### Component C: "Add New Hire" Modal (`open={addHireOpen}`)
- Triggered by `[ + Add new hire ]` button.
- Form: `Full name` dropdown (linked to accepted applicants list) or `Or type custom name`, `Position`, `Department`, `Email`, `Phone number`, `Start date` date picker.
- Account Note Banner: *"The employee portal account is created with the default password Oxford@2026 — the hire is prompted to change it on first login."*
- Footer: `[ Cancel ]` + `[ Add new hire ]`.

---

### 2.3 Tab 2: "Requested Checklists" (`value="checklists"`)
Two-column layout:
- **Left Column: "Requested Checklists" table** — tracks custom document/task requests added per job position.
  - Add toolbar: Checklist item info text input + Job position dropdown (`Select All`) + `[ + Add request ]`.
  - Columns: `CHECKLIST ITEM INFO`, `JOB POSITION`, `REQUESTED`, `ACTIONS` (edit, delete).
  - Real records: `nho requested checklist test` (All positions), `Room-turnover timing check (30-minute SLA)` (Standard Probationary Checklist), `Guest-handling scenario evaluation` (Standard Probationary Checklist).
  - Pagination footer.
- **Right Column: "Checklist Builder"** — manage reusable checklist templates applied to new hires.
  - `[ 📋 Create checklist ]` full-width maroon button.
  - **Template Cards (expandable)** showing: template name, stage tag (`Pre-onboarding`/`Probationary`), position scope, active state (`Active` green / `Closed` red), checklist items list, and `Close`/edit/delete actions.
  - Live templates:
    - **Pre-Employment Requirements** (Pre-onboarding · All positions · Active): Signed employment contract, NBI / Police clearance, Pre-employment medical exam, SSS / PhilHealth / Pag-IBIG / TIN, Birth certificate (PSA), Company orientation attended, Uniform & ID issued, Department on-the-job training.
    - **TRY PRE-ONBOARDING TEMPLATE** (Pre-onboarding · All positions · Active): pre-onboarding checklist test1.
    - **Regularization Checklist** (Probationary · All positions · **Closed**): Regularization contract signed (+ more items).
  - Pagination footer (2 pages of templates).

---

### 2.4 The Employee-Facing Onboarding Portal (`<EmployeeOnboarding />`, Route `/employee/onboarding`)
When accessed by an employee user (`role === "employee"`), the page bypasses the admin pipeline and renders the dedicated candidate/employee self-service portal:
- **API Data Source:** `GET /api/v1/ess/my-checklist` — pulls `{ data, new_hire }` scoped to the authenticated employee.
- **Top Header:** `"New Hire Onboarding"` + subtext `"Track your onboarding checklist, pre-employment requirements, and first-day readiness."` + `[ ↻ Refresh ]` + `[ 📊 Generate Report ]`.
- **Main Checklist Card:**
  - Lists the employee's active requirements (e.g. 9 for pre-onboarding, 7 for probationary).
  - Status badges: `Verified by HR` (green) with verification date, or `Pending` (amber) with *"Pending your action"*.
  - `[ 👁 View ]` action button per item.
- **Side Panel Task Inspector & Upload Drawer:**
  - Clicking `[ 👁 View ]` changes button to `👁 Viewing` (active maroon highlight) and opens the right-hand panel.
  - Shows requirement title, instructions box, and drag-and-drop file upload dropzone (`PDF, DOCX, PNG, JPG up to 10MB`).
  - Textarea for optional candidate notes for HR verification.
  - `[ Cancel ]` button and `[ ✈ Submit to HR ]` submission button.

---

## 3. Data Models & State Schema

```typescript
type OnboardingStage = "Pre-onboarding" | "Probationary" | "Regularized";

interface NewHire {
  id: string;                         // "HIRE-1042"
  applicantId?: string;               // Originating "APP-1029"
  name: string;
  email: string;
  position: string;                   // "Front Desk Receptionist"
  department: string;                 // "Front Office"
  startDate: string;                  // "2026-11-15"
  stage: OnboardingStage;
  documentsCompleted: number;         // e.g. 5
  documentsTotal: number;             // e.g. 7
  coreHcmProvisioned: boolean;        // Account created in Core HCM?
  probationaryMonth: number;          // 0, 3, or 5
}
```

---

## 4. Why This Module Needs Better Integration with Recruitment
1. **Disjointed Hand-off:** In the current system, when an applicant is accepted in `ApplicantManagement`, there is no visual indicator or progress bar bridging the gap until the HR officer manually switches modules.
2. **Document Re-verification Overhead:** Documents verified during the Applicant Management screening review are often re-requested in Onboarding because the two modules maintain separate file records.
