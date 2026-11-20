# Current Module Spec: Applicant Management

> **Source File:** `frontend/src/components/modules/ApplicantManagement.tsx` (19,289 lines)  
> **Route:** `/admin/_applicant-management/applicants` & `/superadmin/_applicant-management/applicants`

---

## 1. Visual Picture of the Current Module

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ PageHeader                                                      [ReportMenu] [⚙️ Cooldown]│
│ Title: "Applicant Management"                                                          │
│ Description: "NER resume screening, candidate ranking, interview scheduling & eval."   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ ─────────────────────────────────── Gold Gradient Rule ──────────────────────────────── │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ [Total Applicants: 15]  [New Applicant: 3]   [Perfect for Job: 9]   [Today Scheduled: 1]│
├────────────────────────────────────────────────────────────────────────────────────────┤
│ <WorkflowTabs>                                                                         │
│ [🏆 Ranking & applicants]        [📅 Interview pipeline]         [📜 History & audit]  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ CURRENT CROWDED LAYOUT INSIDE TAB 1:                                                   │
│ ┌──────────────────────────────────────────────┬─────────────────────────────────────┐ │
│ │ Screening Overview Card                      │ Priority Candidates Card            │ │
│ │ • "Screening overview" (h2 + subtext)        │ • "Priority candidates" (h3)        │ │
│ │ • Position Select Dropdown                   │ • Top 5 list with avatars, names,   │ │
│ │ • 240px Recharts PieChart (Donut)            │   scores, and Eye review buttons    │ │
│ │ • 4 Status Breakdown buttons with bars:      │                                     │ │
│ │   Fit, Other-role, Credential, Not-fit       │                                     │ │
│ │ • Subtext helper note                        │                                     │ │
│ └──────────────────────────────────────────────┴─────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ Applicant List Card                                                                │ │
│ │ • "Applicant List" (h2 + subtext)                                                  │ │
│ │ • Search Input                                                                     │ │
│ │ • 3 Selects: Position, Screening Status, Pipeline Stage                            │ │
│ │ • Table: Applicant, Role, Applied, Score, Result, Stage, Actions                   │ │
│ │ • TablePagination                                                                  │ │
│ └────────────────────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Exhaustive Breakdown of Each Component & Element

### 2.1 Top Bar & Header Controls
- **PageHeader Component:**
  - `title="Applicant Management"`
  - `description="NER resume screening, candidate ranking, interview scheduling and evaluation."`
  - `actions`:
    - `<ReportMenu reports={...} />`: Predefined report exports (e.g. `all`, `interview`, `audit`) sealed in an AES-256 ZIP.
    - Gear Button `⚙️` (`setCooldownOpen(true)`): Opens the **Re-apply Cooldown Dialog** configuring `recruitment.reapply_cooldown_days` (default 90 days).
- **Gold Rule:** 2px divider (`gold-rule`).
- **4 StatCards:**
  1. `Total Applicants`: `rows.length` (icon: `Users`, tone: `primary`). Subtext: *"Everyone in the pipeline"*.
  2. `New Applicant`: `rows.filter(a => a.stage === "Screened").length` (icon: `UserPlus`, tone: `primary`). Subtext: *"Awaiting first review"*.
  3. `Perfect for the Job`: `rows.filter(a => a.status === "fit").length` (icon: `CheckCircle2`, tone: `success`). Subtext: *"Meets score and requirements"*.
  4. `Today Scheduled Interview`: `interviews.filter(i => i.date === TODAY_ISO && i.status !== "Cancelled").length` (icon: `CalendarDays`, tone: `gold`). Subtext: *"Interviews booked for today"*.

---

### 2.2 Tab 1: "Ranking & applicants" (`value="ranking"`)

#### Component A: Screening Overview Card (Top Left)
- `h2`: `Target` icon + *"Screening overview"* + subtext: *"How this hiring pool landed against the job requirements."*
- Position Filter Select (`positionFilter`).
- **The 240px Recharts Donut PieChart:**
  - Displays slices for `Fit for the Job` (green), `Other Role` (warning gold), `Needs Credentials` (caution amber), `Not a Fit` (destructive red).
  - Center overlay showing total resume count.
- **Status Filter Breakdown Buttons:**
  - 4 stacked cards showing category name, count, and percentage progress bar.
- Subtext: *"Click any chart slice or status card to filter the applicant list below."*

#### Component B: Priority Candidates Card (Top Right)
- `h3`: `Trophy` icon + *"Priority candidates"* + badge: *"Top 5"*.
- Subtext: *"Strongest matches from resume screening."*
- Ordered list of top 5 applicants showing rank number circle, avatar with initials, candidate name, position, score %, and `Eye` icon button triggering `openReview(a)`.

#### Component C: Applicant List Card (Bottom)
- `h2`: `Users` icon + *"Applicant List"* + subtext: *"{count} applicants match the current filters."*
- Controls toolbar:
  - Search input (`search`): searches name, ID, email.
  - Position filter select (`positionFilter`).
  - Status filter select (`statusFilter`).
  - Stage filter select (`stageFilter`: `Screened`, `Accepted`, `Interview Scheduled`, `Assessed`, `Offer`, `Hired`, `Rejected`).
  - Clear filters button.
- **Table Columns:**
  1. `Applicant`: Avatar + Name + Email + Phone.
  2. `Role`: Position title.
  3. `Applied`: Formatted date/time.
  4. `Score`: Tabular score percentage.
  5. `Result`: Badge (`statusMeta`).
  6. `Stage`: Pipeline stage badge.
  7. `Actions`: Dropdown menu (`View Profile`, `Review Screening`, `Schedule Interview`, etc.).

---

### 2.3 The Full-Screen Takeover: `<ApplicantViewScreen />`
- When any applicant row is clicked, the table disappears and the entire page renders `<ApplicantViewScreen />`.
- Features candidate profile header, back button, stage indicators, and over a dozen sub-sections (Resume viewer, interview bookings, practical test entries, cooldown override buttons, document reverification).

---

### 2.4 The Review Screening Modal (`openReview(applicant)`)
- Modal Dialog: `max-w-[95vw] w-[95vw] lg:max-w-[1500px]` (extremely wide!).
- Header: `FileText` icon + *"Resume Screening Result"* + subtitle: *"AI-powered analysis and matching based on job requirements."*
- Candidate Strip: Avatar, name, status badge, target position, applied date, and resume PDF action buttons (`View`, `Download`).
- **3 Large Subtabs:**
  1. **Match & Requirements (`value="match"`):**
     - Left: `RequirementMatchPanel` (lists required skills, experience years, education).
     - Right: `ResumeInfoPanel` (extracted skills, recognized roles, unrecognized roles, work experience, education, certifications).
  2. **Document Verification (`value="verification"`):**
     - `ScreeningVerificationImpact`, `ScreeningResumeDocsMatchDetail`, `ScreeningSupportDocsGrid` (checking uploaded IDs and diplomas against resume claims).
  3. **Technical Breakdown (`value="technical"`):**
     - Recommended alternative role notice.
     - `ScreeningDetailsAccordion`: raw token matching, penalty breakdown, weights.
- Footer Actions:
  - `Reject Candidate` (with cooldown notice).
  - `Refer to Other Role`.
  - `Accept & Schedule Interview` (advances applicant to `Accepted` / opens interview booking).

---

### 2.5 Tab 2: "Interview pipeline" (`value="scheduling"`)
- Table of booked interviews showing candidate, position, scheduled date, slot time, mode (`In-person` vs `Virtual`), interviewer name, facility status, Zoom link copy button, and `InterviewEvaluationForm` trigger.

---

### 2.6 Tab 3: "History & audit" (`value="history"`)
- Event audit log table with colored badges: `Screening Run`, `Interview Booked`, `Status Change`, `Accepted`, `Rejected`, `Offer Sent`.

---

## 3. Why the Current System Feels Overcrowded & Messy
1. **Vertical Bloat in Tab 1:** Having the 240px Recharts Donut PieChart and Top 5 card stacked **above** an already dense table forces users to scroll down constantly just to see applicants.
2. **Disruptive Full Page Takeovers:** Clicking a candidate unmounts the entire table and renders a massive multi-section page instead of an intuitive side-drawer.
3. **Monstrous 1500px Review Dialog:** The Review Screening modal is packed with dense technical accordions and multi-column document verification grids.
