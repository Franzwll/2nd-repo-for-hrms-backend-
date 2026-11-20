# Visual Context Dossier: New Hire Onboarding
**System:** Oxford Suites Makati HRMS — Talent Acquisition  
**Source Code:** `frontend/src/components/modules/NewHireOnboarding.tsx` (4,980 lines)  
**Reference Assets:** Actual production screenshots captured live from `http://localhost:3000` (Super Admin, Bullseur Santiago).

---

## Table of Contents
1. [Module Anatomy & Top Bar Elements](#1-module-anatomy--top-bar-elements)
2. [Picture 1: Whole Module — Tab 1: Onboarding Pipeline (Top View)](#picture-1-whole-module--tab-1-onboarding-pipeline-top-view)
3. [Picture 2: Tab 1 — Pre-onboarding List with Checklist Panel](#picture-2-tab-1--pre-onboarding-list-with-checklist-panel)
4. [Picture 3: Tab 2 — Requested Checklists & Builder (Top View)](#picture-3-tab-2--requested-checklists--builder-top-view)
5. [Picture 4: Tab 2 — Requested Checklists & Builder (Scrolled / More Templates)](#picture-4-tab-2--requested-checklists--builder-scrolled--more-templates)
6. [Picture 5: Modal — Add New Hire Dialog](#picture-5-modal--add-new-hire-dialog)
7. [Picture 6: Tab 1 — All Hired Applicants View with Right-Panel Checklist](#picture-6-tab-1--all-hired-applicants-view-with-right-panel-checklist)
8. [Picture 7: Tab 1 — All Hired Applicants (Full Table View, All Stages)](#picture-7-tab-1--all-hired-applicants-full-table-view-all-stages)
9. [Picture 8: Modal — Generate Report Dialog (AES-256 ZIP Exporter)](#picture-8-modal--generate-report-dialog-aes-256-zip-exporter)
10. [Picture 9: Employee Portal — Pre-onboarding Checklist View](#picture-9-employee-portal--pre-onboarding-checklist-view)
11. [Picture 10: Employee Portal — Document Upload & Task Submission Panel](#picture-10-employee-portal--document-upload--task-submission-panel)
12. [Picture 11: Employee Portal — Probationary Checklist View](#picture-11-employee-portal--probationary-checklist-view)
13. [Design Logic, System Architecture & Constraints for Redesign](#13-design-logic-system-architecture--constraints-for-redesign)

---

## 1. Module Anatomy & Top Bar Elements

The Onboarding module represents the critical handover bridge between candidate selection (`ApplicantManagement.tsx`) and employee lifecycle operations (`Core HCM` and `Employee Records`).

### Global Brand Styling:
- **Primary Header & Accents:** Oxford Maroon `#7a1c1c`
- **Sidebar & Brand Identity:** Dark Maroon `#5e1515`
- **Luxury Gold Accents:** Champagne Gold `#c9a84c` & `#e0c47a`
- **Surface Canvas:** Warm Ivory `#f9f7f4` with white card elevations (`#ffffff`)
- **Typography:** Display serif headers in `Cormorant Garamond` and body data in `Jost`.

### Top Bar & Global Header Components:
1. **Left Sidebar:** Dark maroon rail (`220px`) with Oxford Suites Makati crest, *Recruitment & Onboarding* menu (Applicant Management, Recruitment Management, New Hire Onboarding active), and Core HCM navigation.
2. **Topbar Breadcrumbs & Controls:** Ivory bar (`56px`) with breadcrumb `Super Admin Portal`, global search `[ Search departments, positions... (Ctrl+K) ]`, notification badges (megaphone `3`, bell `2`), and profile pill `[ BS Welcome, Bullseur ▾ ]`.
3. **PageHeader Component:**
   - Display Title: `"New Hire Onboarding"` (`font-family: Cormorant Garamond; font-size: 26px; font-weight: 700; color: #3d2b1f;`)
   - Description: `"Track pre-employment requirements, contracts, and onboarding progress for incoming hires."`
   - Action Button: `[ 📊 Generate Report ]` (triggers AES-256 encrypted compliance ZIP export).
4. **Gold Gradient Divider:** Signature 2px gradient line.
5. **4 StatCards (live values from DB):**
   - `TOTAL NEW HIRES`: **7** — (Icon: Users, tone: primary maroon)
   - `PRE-ONBOARDING`: **2** — (Icon: Clipboard list, tone: champagne gold)
   - `PROBATIONARY`: **5** — (Icon: Clipboard check, tone: champagne gold)
   - `AWAITING EVALUATION`: **2** — (Icon: Hourglass, tone: success green)
6. **Workflow Tabs Navigation:**
   - `[ 📋 Onboarding Pipeline ]` (Active by default)
   - `[ 📨 Requested Checklists ]`

---

## Picture 1: Whole Module — Tab 1: Onboarding Pipeline (Top View)

![Pipeline tab - top view](./New%20Hire%20Onboarding%20(Pipeline%20tab%20-%20top%20view).PNG)

### Elements & Components in this View:
1. **The 4 StatCards Ribbon:** Displayed horizontally: `TOTAL NEW HIRES: 7` · `PRE-ONBOARDING: 2` · `PROBATIONARY: 5` · `AWAITING EVALUATION: 2`.
2. **Tab Navigation:** `[ 📋 Onboarding Pipeline ]` (active, maroon) · `[ 📨 Requested Checklists ]` (outline).
3. **Onboarding Status Tracker Card:**
   - Card Title: Clipboard icon + `"Onboarding Status Tracker"`.
   - **Horizontal Progress Rail (2 nodes):**
     - Node 1: `Pre-onboarding` — Solid maroon circle `1` + bold maroon label `"Pre-onboarding"`. Subtext: `"Requirements submission, contract signing, orientation scheduling."`
     - Connecting track: Maroon filled line from node 1 to midway, then grey/unfilled to node 2.
     - Node 2: `Probationary` — Outlined grey circle `2` + grey label `"Probationary"`. Subtext: `"Active probation period with department training and monthly evaluation."`
   - Architecture note: Rail is decorative/non-interactive. The `Regularized` stage is not rendered as a node on this tracker.
4. **Pre-onboarding List Section (below tracker):**
   - Section title: `"Pre-onboarding List"` (Users icon, maroon).
   - Subtitle: *"Click a hire to open their requirements checklist on the right."*
   - Controls: `[ 🔍 Search name, position... ]` · `All departments ▾` · `Pre-onboarding ▾` (stage filter, pre-selected) · Settings icon · `[ + Add new hire ]` maroon button.
   - **Table Columns:** `NEW HIRE ↕`, `POSITION ↕`, `START DATE ↕`, `DAYS COUNT OF START WORKING ↕`, `REQUIREMENTS ↕`, `STAGE ↕`, `Actions`.
   - **Visible Records (Pre-onboarding filter active — 2 records total):**
     - Row 1: Avatar `CO` · **Camille Ortega** · Front Office · **Guest Relations Officer** · Start Date: `2026-08-04` · `94 days start working` · Requirements: **2/9 complete** (green partial bar) · Stage: `Pre-onboarding` (amber pill) · `👁 View` button
     - Row 2: Avatar `BS` · **Bianca Soriano** · Front Office · **Front Desk Receptionist** · Start Date: `2026-08-04` · `94 days start working` · Requirements: **5/9 complete** (green partial bar) · Stage: `Pre-onboarding` (amber pill) · `👁 View` button
   - **Right Panel:** Shows `"Select a hire from the list to view their requirements checklist."` placeholder (no hire selected).

---

## Picture 2: Tab 1 — Pre-onboarding List with Checklist Panel

![Pipeline tab - bottom view](./New%20Hire%20Onboarding%20(Pipeline%20tab%20-%20bottom%20view).PNG)

### Elements & Components in this View:
This view shows the pipeline tab scrolled down, with a hire clicked so the right-side checklist panel is populated:

1. **Onboarding Status Tracker (top, partially visible):** Same 2-node rail as Picture 1.
2. **Pre-onboarding List Table (left ~60% width):**
   - Same 2 records as Picture 1 (Camille Ortega + Bianca Soriano, Pre-onboarding filter).
   - Row 1 (Camille Ortega) appears selected (highlighted background).
   - Pagination footer: `Previous [1] Next`.
3. **Right Side Checklist Panel (~40% width, opens when hire is clicked):**
   - Header: Avatar `CO` · **Camille Ortega** · subtext `"Guest Relations Officer"` · close `×`.
   - Contact info: `camille.ortega@email.com` · `0917 664 2219` · `Start date: 2026-08-04`
   - **REQUIREMENTS CHECKLIST:** `22%` progress indicator (top-right).
   - Progress bar: green fill to ~22% then red/incomplete.
   - `Checklist items (9)` · `2/9` counter.
   - **Checklist items visible (all Pending):**
     - `Pre-employment medical exam` — `Pending` orange badge · `↑ Attach file ▾`
     - `SSS / PhilHealth / Pag-IBIG / TIN` — `Pending` · `↑ Attach file ▾`
     - `Birth certificate (PSA)` — `Pending` · `↑ Attach file ▾`
     - `Company orientation attended` — `Pending` · `↑ Attach file ▾`
     - `Uniform & ID issued` — `Pending` · `↑ Attach file ▾`
     - `pre-onboarding checklist test1` — `Pending` · `↑ Attach file ▾`
   - `[ ✏ Edit Checklist ]` button (bottom of checklist panel).
   - Footer message: `"Advance to Probationary is locked."` ⓘ (locked because requirements are incomplete).

---

## Picture 3: Tab 2 — Requested Checklists & Builder (Top View)

![Requested checklists tab - Builder & List](./New%20Hire%20Onboarding%20(Requested%20checklists%20tab%20-%20Builder%20%26%20List).PNG)

### Elements & Components in this View:
Tab 2 is a **two-column layout** (left: Requested Checklists table, right: Checklist Builder):

1. **Left Column: "Requested Checklists" Table:**
   - Section title: `"Requested Checklists"` (Send arrow icon).
   - Add toolbar: `[ Checklist Item info: e.g. Barista certification copy ]` text input · `[ Job position: Select All (all positions) ▾ ]` dropdown · `[ + Add request ]` maroon button.
   - **Table Columns:** `CHECKLIST ITEM INFO`, `JOB POSITION`, `REQUESTED`, `ACTIONS` (pencil edit, red delete).
   - **3 Real Records (all from live DB):**
     - `nho requested checklist test` · **All positions** · Performance · 2026-11-04
     - `Room-turnover timing check (30-minute SLA)` · **Standard Probationary Checklist** · Performance · 2026-08-06
     - `Guest-handling scenario evaluation` · **Standard Probationary Checklist** · Performance · 2026-08-04
   - Pagination: `Previous [1] Next`.

2. **Right Column: "Checklist Builder":**
   - Header: Clipboard icon + `"Checklist Builder"`.
   - `[ 📋 Create checklist ]` full-width maroon primary button.
   - **Template Cards (expandable, 2 visible):**
     - **Template 1: "Pre-Employment Requirements"**
       - Tags: `Pre-onboarding` (amber) · `All positions` (grey) · `Active` (green)
       - Action buttons (top-right): `Close` · `✏` · `🗑`
       - Checklist items (radio list):
         - ○ Signed employment contract
         - ○ NBI / Police clearance
         - ○ Pre-employment medical exam
         - ○ SSS / PhilHealth / Pag-IBIG / TIN
         - ○ Birth certificate (PSA)
         - ○ Company orientation attended
         - ○ Uniform & ID issued
         - ○ Department on-the-job training
     - **Template 2: "TRY PRE-ONBOARDING TEMPLATE"**
       - Tags: `Pre-onboarding` · `All positions` · `Active`
       - Action buttons: `Close` · `✏` · `🗑`
       - Items: ○ pre-onboarding checklist test1

---

## Picture 4: Tab 2 — Requested Checklists & Builder (Scrolled / More Templates)

![Requested checklists tab - Document Verification Details](./New%20Hire%20Onboarding%20(Requested%20checklists%20tab%20-%20Document%20Verification%20Details).PNG)

### Elements & Components in this View:
This is the same Tab 2 two-column layout but scrolled slightly to show a third template in the builder:

1. **Left Column:** Same 3-record Requested Checklists table (unchanged). Pagination footer visible.
2. **Right Column (Checklist Builder scrolled):**
   - Same `[ 📋 Create checklist ]` button at top.
   - **Template 1: "Pre-Employment Requirements"** — same 8 items as Picture 3.
   - **Template 2: "TRY PRE-ONBOARDING TEMPLATE"** — same as Picture 3.
   - **Template 3: "Regularization Checklist"** (newly visible after scroll)
     - Tags: `Probationary` (blue) · `All positions` · `Closed` (red — inactive template)
     - Action buttons: `Activate` link · `✏` · `🗑`
     - Items: ○ Regularization contract signed (partially visible)
   - Pagination footer: `Previous [1] [2] Next` (2 pages of templates).

---

## Picture 5: Modal — Add New Hire Dialog

![Core HCM account provisioning modal](./New%20Hire%20Onboarding%20(Core%20HCM%20account%20provisioning%20modal).PNG)

### Elements & Components in this View:
> [!NOTE]
> This screenshot was titled "Core HCM account provisioning modal" but actually shows the **"Add New Hire"** modal (triggered by the `+ Add new hire` button in the pipeline table toolbar).

1. **Modal Header:** `"Add New Hire"` title + close button `×`.
2. **Subtitle:** `"Creates a pre-onboarding record with the standard requirements checklist, and adds the hire to Employee Records."`
3. **Account Note Banner (pinkish/amber):** `"Account note: the employee portal account is created with the default password Oxford@2026 — the hire is prompted to change it on first login."`
4. **Form Fields:**
   - `Full name` label + `Or type custom name` link (top-right)
   - Dropdown: `Select applicant` (populated from accepted applicants in Applicant Management)
   - `Position` dropdown: `Select position`
   - `Department` dropdown: `Select department`
   - `Email` text input (empty)
   - `Phone number` text input (placeholder: `e.g. 0917 123 4567`)
   - `Start date` date picker: `05/11/2026` (pre-filled)
5. **Footer Actions:** `[ Cancel ]` (outline) · `[ Add new hire ]` (maroon primary button).
6. **Background (Pipeline Tab visible behind modal):**
   - Onboarding Status Tracker rail partially visible.
   - Pre-onboarding List showing Camille Ortega and Bianca Soriano rows.

---

## Picture 6: Tab 1 — All Hired Applicants View with Right-Panel Checklist

![New hire checklist review modal](./New%20Hire%20Onboarding%20(New%20hire%20checklist%20review%20modal).PNG)

### Elements & Components in this View:
This screenshot shows the pipeline tab with **stage filter changed to "All hired applicants"** and the checklist right-panel open for Camille Ortega:

1. **Onboarding Status Tracker:** Same 2-node rail (Pre-onboarding → Probationary), partially visible at top.
2. **"All Hired Applicants" List (left column):**
   - Section title: `"All Hired Applicants"` (Users icon).
   - Subtitle: *"Click a hire to open their requirements checklist on the right."*
   - Stage filter: `[ All hired applicants ▾ ]` (changed from Pre-onboarding).
   - **5 Visible Records (all 7 hires, page 1 of 1):**
     - **CAMILLE BEATRICE FERNANDEZ** (CBF) · Restaurant Server · Food & Beverage · Start: `2026-11-04` · `2 days start working, 178 days to auto-regularization` · Requirements: waiting bar (amber `Waiting for evaluation`) · Stage: `Probationary`
     - **Camille Ortega** (CO) · Guest Relations Officer · Front Office · Start: `2026-08-04` · `94 days start working` · Requirements: **2/9 complete** · Stage: `Pre-onboarding`
     - **Bianca Soriano** (BS) · Front Desk Receptionist · Front Office · Start: `2026-08-04` · `94 days start working` · Requirements: **5/9 complete** · Stage: `Pre-onboarding`
     - **Michael Reyes** (MR) · HR Assistant · Administration / HR · Start: `2026-06-01` · `158 days start working, 22 days to auto-regularization` · Requirements: waiting (amber `Waiting for evaluation`) · Stage: `Probationary`
     - **Angelo Torres** (AT) · Front Desk Receptionist · Front Office · Start: `2026-05-11` · `179 days start working, 1 day to auto-regularization` · Requirements: **3/7 complete** · Stage: `Probationary`
   - Pagination: `Previous [1] Next`.
3. **Right Panel: Camille Ortega's Checklist (selected):**
   - Header: Avatar `CO` · **Camille Ortega** · `"Guest Relations Officer"` · close `×`.
   - `camille.ortega@email.com` · `0917 664 2219` · `Start date: 2026-08-04`
   - **REQUIREMENTS CHECKLIST: 22%** (green partial bar + red remainder).
   - `Checklist items (9)` · `2/9`.
   - 6 pending items visible: Pre-employment medical exam, SSS/PhilHealth/Pag-IBIG/TIN, Birth certificate (PSA), Company orientation attended, Uniform & ID issued, pre-onboarding checklist test1 — all `Pending` with `↑ Attach file ▾`.
   - `[ ✏ Edit Checklist ]` button.
   - Footer: `"Advance to Probationary is locked."` ⓘ.

---

## Picture 7: Tab 1 — All Hired Applicants (Full Table View, All Stages)

![Performance evaluation banner component](./New%20Hire%20Onboarding%20(Performance%20evaluation%20banner%20component).PNG)

### Elements & Components in this View:
> [!NOTE]
> This screenshot was titled "Performance evaluation banner component" but shows the **full "All Hired Applicants" list view** (stage filter = `All hired applicants`) with the same right panel from Picture 6 still open. This is the same state as Picture 6 but showing more of the table.

1. **"All Hired Applicants" Table — same 5 records as Picture 6** (Camille BF, Camille Ortega, Bianca Soriano, Michael Reyes, Angelo Torres) with identical column data.
2. **Right Panel: Camille Ortega Checklist** — identical to Picture 6 right panel (22%, 2/9, pending items, Advance to Probationary locked).
3. **Background: Generate Report modal partially visible** (Report dialog open in foreground in the accompanying Report Export screenshot).

> [!IMPORTANT]
> The "Performance Evaluation Banner" that was documented in older specs does not appear in this screenshot. The 100%-completion gold callout banner may appear for Probationary hires who have completed all documents, but was not captured in the current screenshot session.

---

## Picture 8: Modal — Generate Report Dialog (AES-256 ZIP Exporter)

![Report export modal](./New%20Hire%20Onboarding%20(Report%20export%20modal).PNG)

### Elements & Components in this View:
1. **Modal Header:** `"Generate Report"` title + close button `×`.
2. **Subtitle:** `"Predefined reports — every format is password-protected (sealed in an AES-256 ZIP; you will be asked for a file password on every export)."`
3. **Report Preset Cards (3 options, each with a `[ ⬇ Generate ]` button):**
   - **Onboarding Summary** · Description: `"Every active hire with stage, days of work and overall progress."` · `[ ⬇ Generate ]`
   - **Checklist Progress** · Description: `"Verified vs. pending requirements per hire."` · `[ ⬇ Generate ]`
   - **Overdue & At-Risk** · Description: `"Incomplete hires past the expected timeline (pre-onboarding > 7 days, probationary > 30 days)."` · `[ ⬇ Generate ]`
4. **Background Context:** The module page behind the dialog shows the "All Hired Applicants" table (5 records visible) + Camille Ortega's checklist panel + the stat cards (7/2/5/2).

> [!NOTE]
> Unlike the previously documented spec, there is **no password input field visible** in this modal. The password is prompted at file download time per the subtitle description. The 3 report types are also different from the previously documented names (was: "Master Onboarding Status Report", "Pending Document Compliance", "Upcoming Probationary Milestone Evaluations").

---

## Picture 9: Employee Portal — Pre-onboarding Checklist View

![Employee portal - Pre-onboarding checklist view](./New%20Hire%20Onboarding%20(Employee%20portal%20-%20Pre-onboarding%20checklist%20view).PNG)

### Elements & Components in this View:
Captured from candidate/employee **Bianca Soriano** (`Front Desk Receptionist`, `Pre-onboarding` stage) accessing `/employee/onboarding`:

1. **Top Bar (Employee Context):**
   - Breadcrumb: `Employee Portal`
   - Global search: `[ Search departments, positions... (Ctrl+K) ]`
   - Notification bell with badge `3`
   - User profile pill: `[ BS Welcome, Bianca ▾ ]`
2. **Left Navigation Rail (Employee Self-Service):**
   - Pinned 220px dark maroon rail showing Oxford Suites Makati crest.
   - Menu items: `Dashboard`, `Employee Self-Service` (expandable), `Onboarding` (**active maroon pill**), `Settings`.
3. **PageHeader Component:**
   - Display Title: `"New Hire Onboarding"` (`font-family: Cormorant Garamond`)
   - Description: `"Track your onboarding checklist, pre-employment requirements, and first-day readiness."`
   - Action Buttons: `[ ↻ Refresh ]` · `[ 📊 Generate Report ]`.
4. **Main Onboarding Checklist Card:**
   - Header: Red clipboard icon + `"Onboarding Checklist"` + subtitle `"Probationary checklist requirements"`.
   - Controls: Search input `[ 🔍 Search checklist... ]` · Sort dropdown `[ ⇅ Recent ▾ ]`.
   - **Real Live Checklist Items (7 items visible):**
     - `Department on-the-job training` · Badge: `Verified by HR` (green) · *"Verified Oct 29, 2026"* · `[ 👁 View ]`
     - `Pre-employment medical exam` · Badge: `Verified by HR` (green) · *"Verified Aug 2, 2026"* · `[ 👁 View ]`
     - `SSS / PhilHealth / Pag-IBIG / TIN` · Badge: `Verified by HR` (green) · *"Verified Aug 2, 2026"* · `[ 👁 View ]`
     - `Birth certificate (PSA)` · Badge: `Verified by HR` (green) · *"Verified Aug 2, 2026"* · `[ 👁 View ]`
     - `NBI / Police clearance` · Badge: `Verified by HR` (green) · *"Verified Aug 1, 2026"* · `[ 👁 View ]`
     - `Signed employment contract` · Badge: `Pending` (amber) · *"Pending your action"* · `[ 👁 View ]`
     - `Company orientation attended` · Badge: `Pending` (amber) · *"Pending your action"* · `[ 👁 View ]`

---

## Picture 10: Employee Portal — Document Upload & Task Submission Panel

![Employee portal - Document upload modal](./New%20Hire%20Onboarding%20(Employee%20portal%20-%20Document%20upload%20modal).PNG)

### Elements & Components in this View:
Captured when Bianca Soriano clicks `[ 👁 View ]` on the pending **"Signed employment contract"** checklist item:

1. **Left Side (Checklist Table):**
   - The selected row (`Signed employment contract`) is highlighted in light red/pink with an active maroon indicator button labeled **`👁 Viewing`**.
2. **Right Side Inspection & Upload Panel (Sliding Drawer / Side Panel):**
   - Header Badges: `Pending Action` (amber tag) · `Probationary` tag · Close button `×`.
   - Title: `"Signed employment contract"` (bold Cormorant Garamond).
   - Instructions Box (light grey background): *"Please complete this requirement and upload the supporting document for HR verification."*
   - **Attach Supporting Document Dropzone:**
     - Cloud upload icon (`↑`).
     - Main prompt: `"Choose a file or drag & drop here"`
     - Allowed formats: `PDF, DOCX, PNG, JPG (up to 10MB)`.
   - **Notes / Details Textarea (Optional):**
     - Label: `Notes / Details (Optional)`
     - Textarea placeholder: *"Provide any additional reference number or notes for HR..."*
   - **Footer Action Buttons:**
     - `[ Cancel ]` (outline button, resets viewing item).
     - `[ ✈ Submit to HR ]` (maroon primary button, uploads file and submits task to HR for verification).

---

## Picture 11: Employee Portal — Probationary Checklist View

![Employee portal - Probationary checklist view](./New%20Hire%20Onboarding%20(Employee%20portal%20-%20Probationary%20checklist%20view).PNG)

### Elements & Components in this View:
Captured from employee **Kevin Dela Cruz** (`Line Cook`, `Probationary` stage) accessing `/employee/onboarding`:

1. **Top Bar & Profile:** `[ KD Welcome, Kevin ▾ ]` · `Employee Portal`.
2. **Main Checklist Card (Kevin's 7 Probationary Tasks):**
   - `Department orientation completed` · `Pending` · *"Pending your action"* · `[ 👁 View ]`
   - `Job description acknowledged` · `Pending` · *"Pending your action"* · `[ 👁 View ]`
   - `1st month performance evaluation` · `Pending` · *"Pending your action"* · `[ 👁 View ]`
   - `3rd month performance evaluation` · `Pending` · *"Pending your action"* · `[ 👁 View ]`
   - `5th month performance evaluation` · `Pending` · *"Pending your action"* · `[ 👁 View ]`
   - `Training hours completed` · `Pending` · *"Pending your action"* · `[ 👁 View ]`
   - `probationary checklist test1` · `Pending` · *"Pending your action"* · **`👁 Viewing`**
3. **Right Side Upload Panel (Task: "probationary checklist test1"):**
   - Instructions: `"upload"`
   - Upload Dropzone: `"Just upload — Drag & drop a file here, or click to browse — PDF, DOCX, PNG, JPG (up to 10MB)"`
   - Notes textarea + `[ Cancel ]` + `[ ✈ Submit to HR ]`.

---

## 13. Design Logic, System Architecture & Constraints for Redesign

### The 4 Core Architectural Principles of this Module:
1. **The Bridge Principle (Applicant → Employee):**
   This module is strictly the transitional space between candidate selection and long-term HR management. It takes records originating from `ApplicantManagement.tsx` (marked `Accepted`) and prepares them for `Core HCM`. The `Add New Hire` modal integrates with the applicant dropdown.
2. **Two-Stage Horizon (Pre-onboarding vs Probationary):**
   - Stage 1 (`Pre-onboarding`): Focuses on legal and compliance risk (clearances, contracts, medical fitness). Progress is locked from advancing until all checklist items are complete.
   - Stage 2 (`Probationary`): Focuses on performance tracking (auto-regularization countdown visible in `DAYS COUNT OF START WORKING` column).
3. **Checklist Template System (Right-Panel Architecture):**
   The system uses a two-panel UX: left table for hire list, right panel for inline checklist inspection. Templates (Pre-Employment Requirements, etc.) are managed in Tab 2 (Checklist Builder) and applied to individual hires. Each checklist item has an `Attach file` dropzone for document upload.
4. **Auto-regularization Timer:**
   The `DAYS COUNT OF START WORKING` column shows days elapsed + countdown to auto-regularization (e.g., "1 day to auto-regularization" for Angelo Torres). This drives the `Awaiting Evaluation` stat card.

> [!IMPORTANT]
> **Preservation Rule for Redesign Agents:**
> Any proposed redesign of `NewHireOnboarding.tsx` MUST preserve:
> 1. The two-tier lifecycle (`Pre-onboarding` document collection vs `Probationary` milestone tracking).
> 2. The standard hospitality checklist items (Signed employment contract, NBI/Police clearance, Pre-employment medical exam, SSS/PhilHealth/Pag-IBIG/TIN, Birth certificate, Company orientation, Uniform & ID, Department OJT).
> 3. The two-panel UX (left hire table + right inline checklist inspection panel).
> 4. The Checklist Builder (Tab 2) for template management with Activate/Deactivate controls.
> 5. The 3 AES-256 ZIP report types (Onboarding Summary, Checklist Progress, Overdue & At-Risk).
> 6. The `Add New Hire` modal with applicant dropdown integration and default password `Oxford@2026`.
> 7. The Oxford Suites Makati brand tokens (`#7a1c1c`, `#c9a84c`, Cormorant Garamond, Jost).
