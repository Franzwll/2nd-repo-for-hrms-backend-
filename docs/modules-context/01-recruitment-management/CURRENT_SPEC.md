# Current Module Spec: Recruitment Management

> **Source File:** `frontend/src/components/modules/RecruitmentManagement.tsx` (10,170 lines)  
> **Route:** `/admin/_recruitmentmanagement/recruitment` & `/superadmin/_recruitmentmanagement/recruitment`

---

## 1. Visual Picture of the Current Module

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ PageHeader                                                        [ReportMenu] [⚙️ Setup]│
│ Title: "Recruitment Management"                                                        │
│ Description: "Job post builder with website preview, vacancy status and posting list." │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ ─────────────────────────────────── Gold Gradient Rule ──────────────────────────────── │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ [Active Postings: 9]  [Total Vacancies: 39]  [Pending Requisitions: 10] [High Urgency: 4]│
├────────────────────────────────────────────────────────────────────────────────────────┤
│ <WorkflowTabs>                                                                         │
│ [💼 Vacancies & postings]        [✍️ Job post builder]          [📨 Requisitions (10)] │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ TAB CONTENT AREA                                                                       │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Exhaustive Breakdown of Each Component & Element

### 2.1 Top Bar & Header Controls
- **PageHeader Component:**
  - `title="Recruitment Management"`
  - `description="Job post builder with website preview, vacancy status and posting list."`
  - `actions`:
    - `<ReportMenu reports={recruitmentMenuOptions} />`: Dropdown exporting predefined vacancy and requisition reports in PDF, DOCX, Excel, or CSV sealed in AES-256 ZIP.
    - Gear Button `⚙️` (`setScreeningOpen(true)`): Launches the global AI Screening Setup dialog.
- **Gold Rule Line:** 2px divider styling (`gold-rule`).
- **4 StatCards:**
  1. `Active Postings`: `openCount` (icon: `Send`, tone: `primary`). Subtext: *"Currently accepting applications"*.
  2. `Total Vacancies`: `totalVacancies` (icon: `Briefcase`, tone: `gold`). Subtext: *"Open headcount across roles"*.
  3. `Pending Requisitions`: `pendingRequisitions.length` (icon: `FileText`, tone: `success`). Subtext: *"Awaiting HR review & approval"*.
  4. `High Urgency`: `highUrgencyCount` (icon: `AlertTriangle`, tone: `caution`). Subtext: *"Positions needing fast-track hiring"*.

---

### 2.2 Tab 1: "Vacancies & postings" (`value="postings"`)
- **Header Elements:**
  - `h2`: `Vacancies & Postings` with Briefcase icon.
  - Subtext: `"{pagedJobs.length} of {listSort.sorted.length} job post(s) shown."`
  - Grid / List toggle button group (`LayoutGrid` vs `List` icons).
  - Search input with magnifying glass (`Search`).
  - Status filter select (`All`, `Open`, `Closed`, `Draft`).
  - Department filter select (`All`, `Front Office`, `Housekeeping`, `F&B`, etc.).
  - Sort header (`useSort`).
- **Cards (in Grid Mode):**
  - Card Header: Position Title (`j.title`), Department (`j.department`), Status badge (`Open` = green, `Closed` = red, `Draft` = gray).
  - Content: Employment Type (`j.employmentType`), Schedule (`j.schedule`), Salary Range (`₱{min} – ₱{max}`), Vacancy ratio (`{filled} of {vacancies} filled` progress bar).
  - Actions:
    - `View`: Launches view-only preview modal.
    - `Edit in Builder`: Switches tab to `builder` and loads this job's draft state.

---

### 2.3 Tab 2: "Job post builder" (`value="builder"`)
- **Empty / Start State (`!builderStarted`):**
  - Centered card with large `FilePlus2` icon.
  - Title: *"Job Post Builder"*.
  - Subtext: *"Compose, preview, and publish hotel job postings with modular content blocks, Gemini-powered drafting, and real-time candidate view parity."*
  - Two choice cards:
    - `Start from scratch`: Opens department & position picker dialog.
    - `Use existing template`: Clones existing job post.
  - 3 value prop chips at bottom: `AI Drafting`, `Screening Sync`, `Live Careers Preview`.
- **Active Builder State (`builderStarted === true`):**
  - **Breadcrumbs:** `Create job post > {Department} > {Title}`.
  - **3-Column Massive Layout:**
    - **Column 1: Component Palette (Left ~240px):**
      - Header: *"Add Components"*
      - Draggable blocks: Header, Job Info, Responsibilities, Qualifications, Skills, Benefits, About Hotel, How to Apply.
      - Collapsible *"Content Templates"* list with search.
    - **Column 2: Canvas (Center Flex-1):**
      - Editable title, department, schedule, employment type, salary.
      - Education level chips & experience level chips.
      - Core HCM position flags: `requires_assessment` & `requires_practical` toggles.
      - **The Flip-Card Entity Inspector:** A 3D perspective flip card that toggles between form inputs and the back-face showing *Recognized vs Unrecognized NLP entities*.
    - **Column 3: Live Careers Preview (Right ~420px):**
      - Live mobile/desktop view of how applicants see the posting on the hotel careers website.
      - Platform preview tabs: `Hotel Careers Website`, `Jobstreet`, `Social Media`.

---

### 2.4 Tab 3: "Requisitions" (`value="requisitions"`)
- **Section Title:** `"Vacancy Requisitions"` (Send/arrow icon).
- **Filter Toolbar:** Search input (`Search position, department...`), `All statuses ▾`, `All departments ▾`, `All urgencies ▾`, `[ 📊 Generate Report ]`.
- **Table Columns:**
  - `REF NUMBER ↕`: Requisition code (e.g. `REQ-1011`) + position title.
  - `DEPARTMENT ↕`: Department name (e.g. Engineering, Finance, Kitchen / Culinary, Housekeeping).
  - `OPENINGS ↕`: Number of slots requested.
  - `REQUESTED ↕`: Date submitted (YYYY-MM-DD format).
  - `URGENCY ↕`: Badge (`Urgent` red, `High` amber, `Normal` neutral, `Low` grey).
  - `STATUS ↕`: Status badge (`Pending` outlined).
  - `SET STATUS`: Inline editable dropdown (`Pending ▾`) for HR to update status.
  - `NOTE`: `[ 📋 View note ]` button.
  - `JOB POST`: `[ ↗ Convert ]` button — converts an approved requisition into a job post draft in the builder.

---

### 2.5 Screening Setup Dialog (`Dialog open={screeningOpen}`)
- Launched from the topbar gear icon `⚙️`.
- **Dialog Header:** `"Screening Setup"` + subtext `"Requirements, scoring and vocabulary used by every screening run."` + status badge `● NLP offline`.
- **4 Internal Tabs:**
  1. `Requirement Templates`: List of saved requirement templates with Create/Edit/Delete actions. Each template card shows stage tags (`Pre-onboarding`, `Probationary`), position scope (`All positions`), active state, and a list of checklist items.
  2. `Scoring` (**default active tab**): Left panel "Criteria weights" — toggleable sliders for `Skills` (40%), `Work Experience` (30%), `Educational Background` (20%), `Certifications` (10%) — must total 100%. Right panel "Passing thresholds" — `Passing score` slider (default 75%), `Required-skills coverage` slider (default 60%) + "How a resume is scored" explanation. Footer: `[ 📊 Save configuration ]`.
  3. `Reference Data`: Table of canonical NLP vocabulary terms with aliases (Education: 10, Certificates: 65, Skills: 94, Job Roles: 88, Experience: 4 — 261 active). Search + `[ + Add entry ]`. Each row has edit/delete.
  4. `Reported Entities`: Unrecognized keywords reported from resume screenings waiting for HR to approve into vocabulary or dismiss.

---

## 3. Current Design Logic & Why It Feels Overcrowded
1. **The 3-Column Builder:** Cramming the component palette (left), editable canvas (center), and live careers preview (right) onto one horizontal screen causes severe horizontal squeezing on standard 1080p laptop displays.
2. **The 3D Flip Card:** Hiding extracted NLP entities behind a flip card means HR officers forget to check whether their required keywords are recognized by the screening model.
3. **Redundant Subtexts:** Section headings repeat the tab labels (e.g., inside the "Vacancies & postings" tab is an `h2` titled "Vacancies & Postings" with a subtext saying "X of Y job posts shown").
