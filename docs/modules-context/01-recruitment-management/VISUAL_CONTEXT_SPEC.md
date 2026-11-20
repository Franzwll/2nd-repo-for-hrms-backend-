# Visual Context Dossier: Recruitment Management
**System:** Oxford Suites Makati HRMS — Talent Acquisition  
**Source Code:** `frontend/src/components/modules/RecruitmentManagement.tsx` (10,170 lines)  
**Reference Assets:** Actual production screenshots captured live from `http://localhost:3000` (Super Admin, Bullseur Santiago).

---

## Table of Contents
1. [Module Anatomy & Top Bar Elements](#1-module-anatomy--top-bar-elements)
2. [Picture 1: Whole Module — Tab 1: Vacancies & Postings (Grid View)](#picture-1-whole-module--tab-1-vacancies--postings-grid-view)
3. [Picture 2: Tab 1 — Vacancies & Postings (List / Table View)](#picture-2-tab-1--vacancies--postings-list--table-view)
4. [Picture 3: Tab 3 — Requisitions Tracker](#picture-3-tab-3--requisitions-tracker)
5. [Picture 4: Tab 2 — Job Post Builder (Empty/Start State)](#picture-4-tab-2--job-post-builder-emptystart-state)
6. [Picture 5: Component / Element — 3D Perspective Flip Card (Front & Back)](#picture-5-component--element--3d-perspective-flip-card-front--back)
7. [Picture 6: Modal — Screening Setup (Scoring Tab)](#picture-6-modal--screening-setup-scoring-tab)
8. [Picture 7: Modal — Screening Setup (Reference Data Tab)](#picture-7-modal--screening-setup-reference-data-tab)
9. [Picture 8: Modal — Add Applicant Wizard (Step 1)](#picture-8-modal--add-applicant-wizard-step-1)
10. [Picture 9: Dialog — Choose Department & Job Position (Builder Start)](#picture-9-dialog--choose-department--job-position-builder-start)
11. [Design Logic, System Architecture & Constraints for Redesign](#11-design-logic-system-architecture--constraints-for-redesign)

---

## 1. Module Anatomy & Top Bar Elements

Every screen in this module adheres to the luxury Oxford Suites Makati design tokens:
- **Primary Burgundy:** `#7a1c1c` (accent headers, active tabs, primary action buttons)
- **Primary Dark (Sidebar):** `#5e1515` (navigation rail background)
- **Champagne Gold:** `#c9a84c` (borders, badges, decorative dividers, brand highlights)
- **Warm Ivory Background:** `#f9f7f4` (page canvas)
- **Typography:** `Cormorant Garamond` (editorial display headings) and `Jost` (clean, modern sans-serif body).

### Top Bar & Global Header Components:
1. **Left Sidebar Navigation:** Fixed navigation pinned at 220px width showing Oxford Suites Makati crest, *Recruitment & Onboarding* group (Applicant Management, Recruitment Management active, New Hire Onboarding), and hotel operational modules (*Core HCM*, *Employee Records*, *ESS Management*, *User Management*, *Audit Logs*, *Settings*).
2. **Topbar Breadcrumbs & Controls:** Ivory bar (`56px`) with breadcrumb `Super Admin Portal`, global quick-search input `[ Search departments, positions... (Ctrl+K) ]`, notification bell with badge `3`, megaphone icon, and user profile pill `[ BS Welcome, Bullseur ▾ ]`.
3. **PageHeader Component:**
   - Display Title: `"Recruitment Management"` (`font-family: Cormorant Garamond; font-size: 26px; font-weight: 700; color: #3d2b1f;`)
   - Description: `"Job post builder with website preview, vacancy status and posting list."`
   - Actions Group:
     - `[⚙️]` Icon Button (top-right, gear): Opens the global Screening Setup dialog.
     - `[📊 Generate Report]` Button (`btn-outline`): Opens the AES-256 encrypted ZIP report exporter.
4. **Gold Gradient Divider:** A 2px signature dividing line (`linear-gradient(90deg, #c9a84c 0%, rgba(201,168,76,0.3) 70%, transparent 100%)`).
5. **4 StatCards:**
   - `ACTIVE POSTINGS`: **9** — *"Currently accepting applications"* (Icon: Send arrow, tone: primary maroon)
   - `TOTAL VACANCIES`: **39** — *"Open headcount across roles"* (Icon: Briefcase, tone: champagne gold)
   - `PENDING REQUISITIONS`: **10** — *"Awaiting HR review & approval"* (Icon: Clipboard/FileText, tone: success green)
   - `HIGH URGENCY`: **4** — *"Positions needing fast-track hiring"* (Icon: Alert triangle, tone: caution amber)
6. **Workflow Tabs Navigation:**
   - `[💼 Vacancies & postings]` (Active by default)
   - `[✍️ Job post builder]`
   - `[📨 Requisitions 10]`

---

## Picture 1: Whole Module — Tab 1: Vacancies & Postings (Grid View)

![Vacancies & postings tab - Grid view](./Recruitment%20Management%20(Vacancies%20%26%20postings%20tab%20-%20Grid%20view).PNG)

### Elements & Components in this View:
1. **Section Header & Toolbar:**
   - Left: `Vacancies & Postings` heading (Briefcase icon) + count subtext `"10 of 11 job posts shown."`
   - View mode toggle: `[ ☰ List ]` (outline) vs `[ ⊞ Grid ]` (active icon) — top-right of header area.
   - Action buttons (top-right): `[ + New job post ]` (maroon primary) · `[ + Add applicant ]` (maroon primary).
   - Search input: `[ Search posted positions... ]`.
   - Filter dropdowns: `All statuses ▾`, `All departments ▾`, `Any time ▾`.
2. **Hotel Job Cards Grid (3 Columns per row, paginated — 10 of 11 shown):**
   - **Visible cards on screen (3 partial cards):**
     - **Card 1: Test Post**
       - Department badge: `TEST DEPT` · Status pill: `Open` (Green)
       - Title: `Test Post` (Cormorant Garamond)
       - Meta: Full-time · Shifting Schedule · ₱18,000 – ₱22,000
       - Card features large illustrated "Hiring POSITION" graphic with hotel building image
     - **Card 2: Front Desk Receptionist**
       - Department badge: `FRONT OFFICE` · Status pill: `Open` (Green)
       - Title: `Front Desk Receptionist`
       - Meta: Full-time · Shifting Schedule · ₱18,000 – ₱22,000
       - Card features large illustrated "Hiring POSITION" graphic
     - **Card 3: Line Cook**
       - Department badge: `KITCHEN / CULINARY` · Status pill: `Open` (Green)
       - Title: `Line Cook`
       - Meta: Full-time · Shifting Schedule · ₱18,000 – ₱22,000
       - Card features large illustrated "Hiring POSITION" graphic

---

## Picture 2: Tab 1 — Vacancies & Postings (List / Table View)

![Vacancies & postings tab - List view](./Recruitment%20Management%20(Vacancies%20%26%20postings%20tab%20-%20List%20view).PNG)

### Elements & Components in this View:
1. **View Switcher:** Activated by clicking the `[ ☰ List ]` icon in the toolbar. The grid seamlessly converts into a structured, high-density tabular roster.
2. **Same header:** `Vacancies & Postings` + `"10 of 11 job posts shown."` + same filter dropdowns.
3. **Table Schema & Columns:**
   - `POSITION ↕`: Department tag above, position title in bold Cormorant Garamond, employment type & schedule below.
   - `STATUS ↕`: Pill badge (`Open` emerald green).
   - `SALARY ↕`: Monthly compensation band in Philippine Pesos.
   - `FILLED ↕`: Fraction filled + applicant count (e.g. `0/6 filled · 2 applicants` with red progress bar).
   - `POSTED ↕`: Posting date (e.g. `Posted 2026-11-04`).
   - `ACTIONS`: `[ Edit ]` button, duplicate icon, toggle switch (on/off), delete icon (red).
4. **Sample Real Records Visible:**
   - **Test Post** · TEST DEPT · Full-time · Shifting Schedule · Open · ₱18,000 – ₱22,000 · 0/6 filled · 2 applicants · Posted 2026-11-04
   - **Front Desk Receptionist** · FRONT OFFICE · Full-time · Shifting Schedule · Open · ₱18,000 – ₱22,000 · 0/5 filled · 4 applicants · Posted 2026-05-22
   - **Line Cook** · KITCHEN / CULINARY · Full-time · Shifting Schedule · Open · ₱18,000 – ₱22,000 · 3/9 filled · 3 applicants · Posted 2026-05-18
   - **Housekeeping Attendant** · HOUSEKEEPING · Full-time · Shifting Schedule · Open · ₱14,000 – ₱17,000 · 3/5 filled · 2 applicants · Posted 2026-05-10
5. **Table Sorting:** Column headers support bidirectional sorting (`↕`) by Position, Status, Salary, Filled, Posted.

---

## Picture 3: Tab 3 — Requisitions Tracker

![Requisitions tab](./Recruitment%20Management%20(Requisitions%20tab).PNG)

### Elements & Components in this View:
1. **Section Header:**
   - Title: `Vacancy Requisitions` (Send/Arrow icon).
   - Filter toolbar: `[ Search position, department... ]`, `All statuses ▾`, `All departments ▾`, `All urgencies ▾`, `[ 📊 Generate Report ]`.
2. **Table Columns:**
   - `REF NUMBER ↕`: Requisition code (e.g. `REQ-1011`) + position title bold.
   - `DEPARTMENT ↕`: Color-coded department name.
   - `OPENINGS ↕`: Number of slots requested.
   - `REQUESTED ↕`: Date submitted (YYYY-MM-DD format).
   - `URGENCY ↕`: Badge (`High` amber, `Normal` neutral, `Urgent` red, `Low` grey).
   - `STATUS ↕`: Status badge (`Pending` outlined).
   - `SET STATUS`: Editable dropdown (`Pending ▾`) for HR to update.
   - `NOTE`: `[ 📋 View note ]` button.
   - `JOB POST`: `[ ↗ Convert ]` button (converts approved requisition into job post).
3. **Real Live Records (Visible in screenshot, all Pending):**
   - **REQ-1011** · Maintenance Technician · Engineering · 2 openings · 2024-05-19 · `High` · `Pending`
   - **REQ-1010** · Accounting Clerk · Finance · 1 opening · 2024-05-18 · `Normal` · `Pending`
   - **REQ-1008** · Sous Chef · Kitchen / Culinary · 1 opening · 2024-05-16 · `Urgent` · `Pending`
   - **REQ-1006** · Spa Therapist · Wellness · 1 opening · 2024-05-14 · `Low` · `Pending`
   - **REQ-1004** · Bartender · Food & Beverage · 1 opening · 2024-05-11 · `Normal` · `Pending`
   - **REQ-1003** · Line Cook · Kitchen / Culinary · 1 opening · 2024-05-08 · `Normal` · `Pending`
   - **REQ-1002** · Housekeeping Attendant · Housekeeping · 3 openings · 2024-05-05 · `Urgent` · `Pending`

> [!NOTE]
> The Requisitions tab (live database) has 10 pending requisitions matching the `PENDING REQUISITIONS: 10` stat card. The screenshot displays 7 rows on the first page. No "Submit Requisition" button is visible in the current header — the new requisition workflow is initiated from elsewhere in the system.

---

## Picture 4: Tab 2 — Job Post Builder (Empty/Start State)

![Job post builder tab](./Recruitment%20Management%20(Job%20post%20builder%20tab).PNG)

### Elements & Components in this View:
The builder opens in its **empty/start state** when no draft has been initiated:

1. **Center Large Icon:** `FilePlus2` icon in a maroon-tinted rounded square (84px).
2. **Title:** `"Job Post Builder"` (Cormorant Garamond display heading).
3. **Subtitle:** `"Compose, preview, and publish hotel job postings with modular content blocks, Gemini-powered drafting, and real-time candidate view parity."`
4. **Two Choice Cards (side by side):**
   - **Left Card (Primary):** `[ + ]` icon button (maroon) · `"Start from scratch"` heading · subtext: `"Select a department and position from the hotel structure to create a fresh posting."` · CTA: `[ Select role & build → ]` (maroon text link)
   - **Right Card (Secondary):** Duplicate icon (gold tinted) · `"Use existing template"` heading · subtext: `"Clone an existing job posting's responsibilities, requirements, and benefits."` · Dropdown: `[ Choose a posting... ▾ ]`
5. **Bottom Value Prop Chips (3 icons):**
   - `AI Drafting` · `Screening Sync` · `Live Careers Preview`

---

## Picture 5: Component / Element — 3D Perspective Flip Card (Front & Back)

![Job post builder - 3D Flip Card Front & Back](./Recruitment%20Management%20(Job%20post%20builder%20-%203D%20Flip%20Card%20Front%20%26%20Back).PNG)

### Detailed Analysis of the Signature Component:
This signature component bridges the gap between marketing presentation and automated NLP screening rules.

1. **Front Face: Live Careers Card (Candidate-Facing Preview):**
   - **Header:** Gold brand label `"OXFORD SUITES MAKATI"` + burgundy title `"Front Desk Receptionist"` + location line `"Front Office Department · Makati City, Metro Manila"`.
   - **Role Summary:** High-touch description emphasizing luxury guest service and Opera PMS check-ins.
   - **Key Responsibilities:** Bulleted duty list cleanly formatted with custom markers.
   - **Footer:** Compensation highlight (`Salary: ₱18k – ₱22k`) and emerald status tag (`● Actively Hiring`).

2. **Back Face: Named Entity Inspector (spaCy NER Screening Rules):**
   - **Header:** Magnifying glass icon + `"🔍 Entities Indicated"` + badge `spaCy v2.4 (NLP Synced)`.
   - **Recognized Terms (Matched in Resumes — Green Badges):** `Opera PMS` (Skill), `Guest Relations` (Skill), `TESDA Front Office NC II` (Certification), `1-2 Years` (Experience), `Bachelor's Degree` (Education).
   - **Unrecognized Terms (Missing from Screening Vocabulary — Orange Badges):** `TESDA Tourism NC II` with `[+]` button.
   - **System Rule Banner:** Tokens flagged with `[+]` are queued into the *Reported Entities Manager* for administrator approval.

---

## Picture 6: Modal — Screening Setup (Scoring Tab)

![Screening setup modal - Scoring Weights](./Recruitment%20Management%20(Screening%20setup%20modal%20-%20Scoring%20Weights).PNG)

### Elements & Components in this View:
1. **Modal Header:** Rotate/sync icon + `"Screening Setup"` title + subtext `"Requirements, scoring and vocabulary used by every screening run."` + close button `×`.
2. **Status Badge:** `● NLP offline` (Red dot, indicating the spaCy NLP service is not currently running).
3. **4 Tabs (Screening Setup Dialog):**
   - `[ 📋 Requirement Templates ]` (outline)
   - `[ 📊 Scoring ]` (**Active** maroon highlighted tab)
   - `[ 📚 Reference Data ]` (outline)
   - `[ 🔬 Reported Entities ]` (outline)
4. **Left Panel — "Criteria weights":**
   - Subtitle: `"How much each criterion contributes to the match score. Enabled weights must total 100%."`
   - **Skills**: Toggle ON · Slider at **40%**
   - **Work Experience**: Toggle ON · Slider at **30%**
   - **Educational Background**: Toggle ON · Slider at **20%**
   - **Certifications**: Toggle ON · Slider at **10%**
   - **Total weight summary row:** `Total weight` → `100%` (green confirmation).
5. **Right Panel — "Passing thresholds":**
   - Subtitle: `"Cut-offs that decide how a screened resume is classified."`
   - **Passing score**: `75%` slider · Description: `"At or above this score, a resume is 'Perfect for the Job' when mandatory requirements are met."`
   - **Required-skills coverage**: `60%` slider · Description: `"Minimum share of the job post's required skills needed to pass."`
   - **"How a resume is scored"** explanation block:
     1. Text is extracted (PDF/DOCX/OCR) and entities are tagged.
     2. Entities are matched against the job post's requirements.
     3. Weighted criteria add up to the match score.
     4. Thresholds decide the result: *Perfect for the Job*, *Fit for other Job*, *Invalid credential* or *Not fitted to Job*.
6. **Footer:** `"Applies to every new screening after saving."` text + `[ 📊 Save configuration ]` maroon primary button (bottom-right).

---

## Picture 7: Modal — Screening Setup (Reference Data Tab)

![Screening setup modal - Reference Vocabulary & NLP Diagnostics](./Recruitment%20Management%20(Screening%20setup%20modal%20-%20Reference%20Vocabulary%20%26%20NLP%20Diagnostics).PNG)

### Elements & Components in this View:
1. **Active Tab:** `[ 📚 Reference Data ]` (maroon active tab).
2. **Section Header:** `"Reference Data & Aliases"` (Red bookmark icon) + subtext `"Terms the NLP service recognizes in resumes. Changes apply to every screening."` + `[ + Add entry ]` button (maroon, top-right).
3. **Vocabulary Count Summary Chips:**
   - `Education: 10` · `Certificates: 65` · `Skills: 94` · `Job Roles: 88` · `Experience: 4` · `261 active`
4. **Search input:** `[ 🔍 Search value or alias... ]`
5. **Table Columns:** `Type`, `Canonical value`, `Aliases`, `Active` (toggle), `Actions` (pencil edit, red delete).
6. **Sample Real Records (Education category, 10 entries):**
   - **Education** · `Bachelor degree in Hospitality or related field` · Aliases: `bachelor degree in hospitality or related field`, `bachelor in hospitality`, `hospitality degree or related field`, `degree in hospitality` · Active: ON toggle
   - **Education** · `Bachelor of Science in Business Administration` · Aliases: `bachelor of science in business administration`, `bsba`, `bs business administration`, `business administration degree` · Active: ON toggle
   - (additional education entries partially visible — bachelor of science in hospitality management visible)

> [!NOTE]
> This screenshot was titled "Scoring Weights" in the filename but actually shows the **Reference Data** subtab. The file naming reflects the button in the page header (`⚙️ Setup`) that opens the entire dialog — both Scoring and Reference Data are sub-tabs within it.

---

## Picture 8: Modal — Add Applicant Wizard (Step 1)

![Add applicant modal - Upload & Instant Screen](./Recruitment%20Management%20(Add%20applicant%20modal%20-%20Upload%20%26%20Instant%20Screen).PNG)

### Elements & Components in this View:
1. **Modal Header:** `"Add Applicant"` title (no icon) + close button `×`.
2. **Step Indicator:** `"Step 1 of 2 — upload documents and enter applicant details"`
3. **Form Fields:**
   - `Department` dropdown: `Administration / HR` (selected, maroon border active state)
   - `Applying for` dropdown: `Accounting Supervisor` (selected)
   - **Validation Warning (red):** `⚠ No available job post for Accounting Supervisor in Administration / HR — the posting is closed, in draft, or full. Reopen or publish it before adding applicants.`
   - `Full name` text input (placeholder: `e.g. Maria Clara Santos`)
   - `Email` text input (placeholder: `e.g. maria.santos@gmail.com`)
   - `Contact number` text input (placeholder: `e.g. 0917 123 4567`)
   - `Address` text input (placeholder: `e.g. Makati City, Metro Manila`)
4. **Document Dropzone:**
   - Upload icon + `"Resume + supporting documents"`
   - Subtext: `"Drop the resume + COE + certificates in any order — every file is auto-recognized. Details are filled from the first recognized resume, then you can run resume screening."`
   - Accepted formats: `PDF, DOC, DOCX, PNG, JPG — max 10 MB each`
5. **Footer Action:** `[ ↻ Run resume screening ]` maroon primary button (bottom-right, disabled until documents uploaded).

---

## Picture 9: Dialog — Choose Department & Job Position (Builder Start)

![New requisition modal](./Recruitment%20Management%20(New%20requisition%20modal).PNG)

### Elements & Components in this View:
> [!NOTE]
> This screenshot was titled "New requisition modal" but actually captures the **"Choose department and job position"** dialog that appears when clicking `"Select role & build"` in the Job Post Builder empty state.

1. **Dialog Header:** `"Choose department and job position"` + subtext `"Pick the department and the position this job post is for — it seeds the builder with a blank, customizable template."` + close button `×`.
2. **Form Fields:**
   - `Department` dropdown: (empty, required — maroon focus border)
   - `Job position` dropdown: `Select a position` (placeholder, greyed out until department selected)
3. **Footer Actions:**
   - `[ × Cancel ]` (outline/text)
   - `[ 🔧 Start job post ]` maroon primary button (disabled until both fields selected)
4. **Background Context:** The module page behind the dialog shows the Vacancies & Postings grid with 3 visible job cards (Test Post, Front Desk Receptionist, Line Cook) and the standard stat cards (9/39/10/4).

---

## 11. Design Logic, System Architecture & Constraints for Redesign

### The 4 Core Architectural Principles of this Module:
1. **Bi-directional Sync with Applicant Management:**
   Every requirement created in the Job Post Builder directly populates the spaCy NER dictionary used by `ApplicantManagement.tsx`. When an applicant uploads a resume, it is evaluated against the exact weights and required tokens configured here.
2. **Requisition-First Governance:**
   Department heads cannot arbitrarily create public job postings. They must submit a formal requisition (Requisitions tab) specifying slots and operational justification. Only upon Super Admin or HR approval does the requisition unlock the "Convert" (Create Job Post) workflow.
3. **Real-Time Website Parity (The Flip Card):**
   HR managers frequently draft text without realizing how it will appear to candidates. The 3D flip card enforces transparency by previewing the luxury front-end careers view while simultaneously auditing the back-end NLP tokens.
4. **Offline AES-256 ZIP Compliance:**
   Hospitality labor compliance in the Philippines (DOLE) requires periodic vacancy audit logs. The report generator packages recruitment data into encrypted password-protected archives.

> [!IMPORTANT]
> **Preservation Rule for Redesign Agents:**
> Any proposed redesign of `RecruitmentManagement.tsx` MUST preserve the 3-column builder workflow, the requisition approval lifecycle (with Convert-to-Job-Post action), the global scoring weight sliders (40/30/20/10 defaults, Passing score 75%, Required-skills coverage 60%), and the Add Applicant 2-step wizard. Visual modernizations should maintain the Oxford Suites Makati `#7a1c1c` and `#c9a84c` palette.
