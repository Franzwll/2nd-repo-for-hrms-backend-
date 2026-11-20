# Visual Context Dossier: Applicant Management
**System:** Oxford Suites Makati HRMS — Talent Acquisition  
**Source Code:** `frontend/src/components/modules/ApplicantManagement.tsx` (19,289 lines)  
**Reference Assets:** Actual production screenshots from current live system.

---

## Table of Contents
1. [Module Anatomy & Top Bar Elements](#1-module-anatomy--top-bar-elements)
2. [Picture 1: Whole Module — Tab 1: Ranking & Applicants](#picture-1-whole-module--tab-1-ranking--applicants)
3. [Picture 2: Tab 2 (Top View) — Room Availability, Calendar & Schedule](#picture-2-tab-2-top-view--room-availability-calendar--schedule)
4. [Picture 3: Tab 2 (Bottom View) — 5-Stage Pipeline Overview](#picture-3-tab-2-bottom-view--5-stage-pipeline-overview)
5. [Picture 4: Tab 3 — History & Audit Activity Log](#picture-4-tab-3--history--audit-activity-log)
6. [Picture 5: Modal — Resume Screening Result (Tab 1: Match & Requirements)](#picture-5-modal--resume-screening-result-tab-1-match--requirements)
7. [Picture 6: Modal — Resume Screening Result (Tab 2: Document Verification)](#picture-6-modal--resume-screening-result-tab-2-document-verification)
8. [Picture 7: Modal — Resume Screening Result (Tab 3: Technical Breakdown)](#picture-7-modal--resume-screening-result-tab-3-technical-breakdown)
9. [Picture 8: Full Takeover Component — ApplicantViewScreen](#picture-8-full-takeover-component--applicantviewscreen)

---

## 1. Module Anatomy & Top Bar Elements

Every screen in this module shares the following core structural components:
- **Left Sidebar:** Dark maroon `#5e1515` background with gold Oxford Suites Makati logo. Navigation contains *Recruitment & Onboarding* group (Applicant Management active, Recruitment Management, New Hire Onboarding), *Core HCM*, *Employee Records*, *ESS Management*, *User Management*, *Audit Logs*, and *Settings*.
- **Topbar:** Ivory bar with breadcrumb `Super Admin Portal`, system search input (`Ctrl+K`), megaphone icon, notification bell badge `2`, and user avatar pill `[ BS Welcome, Bullseur ▾ ]`.
- **PageHeader:**
  - Display Title: `"Applicant Management"` (`font-family: Cormorant Garamond`)
  - Subtitle: `"NER resume screening, candidate ranking, interview scheduling and evaluation."`
  - Action Buttons: `[📊 Generate Report]` (AES-256 ZIP export) + `[⚙️]` (Re-apply Cooldown dialog).
- **Gold Divider:** 2px gradient line (`linear-gradient(90deg, #c9a84c 0%, rgba(201,168,76,0.3) 70%, transparent 100%)`).
- **4 StatCards:**
  1. `TOTAL APPLICANTS`: **15** — *"Everyone in the pipeline"* (Icon: Users)
  2. `NEW APPLICANT`: **3** — *"Awaiting first review"* (Icon: User Plus)
  3. `PERFECT FOR THE JOB`: **9** — *"Meets score and requirements"* (Icon: Check Circle)
  4. `TODAY SCHEDULED INTERVIEW`: **1** — *"Interviews booked for today"* (Icon: Calendar)
- **WorkflowTabs:**
  - `[🏆 Ranking & applicants]`
  - `[📅 Interview pipeline]`
  - `[📜 History & audit]`

---

## Picture 1: Whole Module — Tab 1: Ranking & Applicants

![Ranking & applicants tab](./Applicant%20Management%20(Ranking%20&%20applicants%20tab).PNG)

### Elements & Components in this View:
1. **Screening Overview Card (Top Left):**
   - Header: Target icon + `"Screening overview"` + subtext `"How this hiring pool landed against the job requirements."`
   - Filter dropdown: `"All positions ▾"`
   - **Recharts Donut Chart:** Shows total count in center (**`15 RESUMES`**).
     - **Green slice (60%):** Perfect for the Job (9 applicants)
     - **Gold slice (7%):** Fit for other Job (1 applicant)
     - **Orange slice (27%):** Invalid credential (4 applicants)
     - **Red slice (7%):** Not fitted to Job (1 applicant)
   - **Status Breakdown Rows (Clickable Filter Buttons):**
     - `● Perfect for the Job`: **9** (60%) with full green progress bar
     - `● Fit for other Job`: **1** (7%)
     - `● Invalid credential`: **4** (27%) with orange bar
     - `● Not fitted to Job`: **1** (7%) with red dot
2. **Priority Candidates Card (Top Right):**
   - Header: Trophy icon + `"Priority candidates"` + `"Top 3"` gold badge (badge shows "Top 3" even though 5 candidates are listed — badge is a UI label).
   - Subtext: `"Strongest matches from resume screening."`
   - Ordered list of top 5 matches (all visible in live screenshot):
     1. `1` · Avatar `CB` · **CAMILLE BEATRICE FERNANDEZ** · Restaurant Server · **100%** · `👁`
     2. `2` · Avatar `BS` · **Bianca Soriano** · Front Desk Receptionist · **96%** · `👁`
     3. `3` · Avatar `AK` · **ARVIN KEITH DEL ROSARIO** · Line Cook · **92%** · `👁`
     4. `4` · Avatar `KD` · **Kevin Dela Cruz** · Line Cook · **91%** · `👁`
     5. `5` · Avatar `MD` · **Marjun Devera** · Restaurant Server · **88%** · `👁`
3. **Applicant List Card (Bottom):**
   - Subtitle: `"15 applicants match the current filters."`
   - Filter Toolbar: Search input (`Search name, ID, email...`), Position filter (`All positions ▾`), Screening Result (`All results ▾`), Stage (`All stages ▾`).
   - Table Columns: `APPLICANT ↕`, `ROLE ↕`, `APPLIED ↕`, `SCORE ↕`, `RESULT ↕`, `STAGE ↕`, `Actions`
   - Sample Rows:
     - **Camille Beatrice Fernandez** (APL-01045) · Restaurant Server · Nov 5, 2026 · **100% (3 docs)** · `● Perfect for the job` (Green) · Interview Scheduled · `👁 View`
     - **Angelo Gabriel Cruz** (APP-00018) · Test Post · Nov 4, 2026 · **84.33% (7 docs)** · `● Perfect for the job` · Screened · `👁 View`
     - **Angelo Gabriel Cruz** (APP-00017) · Test Post · Nov 4, 2026 · **80% (7 docs)** · `● Invalid credential` (Orange) · Rejected · `👁 View`
     - **Arvin Keith Del Rosario** (APL-01043) · Line Cook · Oct 27, 2026 · **92% (11 docs)** · `● Invalid credential` · Accepted · `👁 View`

---

## Picture 2: Tab 2 (Top View) — Room Availability, Calendar & Schedule

![Interview pipeline tab - top view](./Applicant%20Management%20(Interview%20pipeline%20tab%20-%20top%20view).PNG)

### Elements & Components in this View:
1. **Header Action:** `[📅 Book an interview]` (maroon primary button).
2. **Room Availability & Daily Schedule Card:**
   - **Month Calendar Grid (October 2026):**
     - Controls: Month dropdown (`October 2026 ▾`), Navigation buttons (`< >`), `[Today]` button.
     - Booked date badges: Oct 21 (badge `1`), Oct 27 (active maroon background, badge `1`), Oct 29 (badge `1`), Nov 4 (badge `2`), Nov 5 (badge `1`).
   - **Places Availability Sub-card (Bottom Left):**
     - Target Date: `"27 October 2026 Tuesday"` / `"Select a room to preview its schedule"`.
     - **ON-SITE Rooms:**
       - **ROOM 1:** Solid green door icon, badge `1`, `"1 booked"`.
       - **ROOM 2:** Door outline icon, `"Free"`.
       - **ROOM 3:** Door outline icon, `"Free"`.
     - **VIRTUAL:**
       - **ONLINE INTERVIEW:** Green camera outline icon, badge `1`, `"1 booked"`.
   - **Daily Schedule Preview (Right Panel):**
     - Filter: `"Show all — All rooms ▾"`.
     - Location label: `"All locations · October 27, 2026"`.
     - Booked time slots:
       - `03:45 AM — 05:30 AM` · **KRISTINE JOY BAUTISTA** · *Online Interview*
       - `04:00 AM — 06:30 AM` · **ARVIN KEITH DEL ROSARIO** · *Room 1*

---

## Picture 3: Tab 2 (Bottom View) — 5-Stage Pipeline Overview

![Interview pipeline tab - bottom view](./Applicant%20Management%20(Interview%20pipeline%20tab%20-%20bottom%20view).PNG)

### Elements & Components in this View:
1. **Pipeline Overview Card Header:**
   - Section title: `"Pipeline Overview"` (Calendar icon).
   - Filters: Search input (`Search applicant—`), `All positions ▾`, `All stages ▾`, `Any result ▾`, `[ ⊞ Show Archived & Blocked ]` toggle button.
2. **The 5-Stage Multi-Column Pipeline Table:**
   - Table Columns:
     - `APPLICANT ↕`: Avatar initials, Full Name bold, Application Code, Email, Phone.
     - `APPLIED ↕`: Date and timestamp (e.g. `2026-11-05 / 08:17 AM`).
     - `CURRENT STAGE ↕`: Step progress label (e.g. `Interview Scheduled / Step 2 of 5`, `Screened / Step 1 of 5`, `Rejected`, `Accepted / Step 1 of 5`, `Practical Test / Step 4 of 5`).
     - `SCREENING ↕`: Score percentage, Passed/Rejected badge, supporting doc count (e.g. `3 supporting docs`), screening result pill (`Perfect for the Job` green, `Invalid credential` amber).
     - `INTERVIEW ↕`: Scheduled date/time, mode (On-site / Virtual), interviewer name, status notes (e.g. `Scheduled Today`, `Accepted — no date yet`, `Passed - 80%`).
     - `ASSESSMENT ↕`: Job knowledge test status (e.g. `Waiting for interview`, `Need to Schedule`, `Not required — Completed`).
     - `PRACTICAL ↕`: Practical demonstration status (e.g. `Waiting for assessment`, `Not required — Completed`, `Offer declined — Failed`).
     - `FINAL ↕`: Final verdict (e.g. `Waiting for earlier stages`, `For Another Position` amber, `Ready to evaluate — start from A...`).
     - `ACTIONS`: `[···]` dropdown menu + `[👁 View profile]` button (triggers `<ApplicantViewScreen />` full takeover).
   - **Real Live Records Visible (Pipeline bottom screenshot):**
     - **CAMILLE BEATRICE FERNANDEZ** (APL-01045 · Restaurant Server) · 2026-11-05 08:17 AM · `Interview Scheduled Step 2 of 5` · 100% Passed 3 docs `Perfect for the Job` · 2026-11-05 01:27 AM On-site Chef Gabriel Mendoza `Scheduled Today` · Waiting for interview · Waiting for assessment · Waiting for earlier stages
     - **ANGELO GABRIEL CRUZ** (APP-00018 · Test Post) · 2026-11-04 06:58 PM · `Screened Step 1 of 5` · 84.33% Passed 7 docs `Perfect for the Job` · Need to Schedule · Not required · Waiting for assessment · Waiting for earlier stages
     - **ANGELO GABRIEL CRUZ** (APP-00017 · Test Post) · 2026-11-04 06:38 PM · `Rejected` · 80% Rejected 7 docs `Invalid credential` · 2026-11-04 06:50 PM Virtual Ana Ramos `Notes saved Passed - 80%` · Not required — Completed · `For Another Position` · Offer declined — Failed
     - **ARVIN KEITH DEL ROSARIO** (APL-01043 · Line Cook) · 2026-10-27 01:16 PM · `Accepted Step 1 of 5` · 92% Passed 11 docs `Invalid credential` · Accepted — no date yet · Waiting for interview · Not required · Waiting for earlier stages
     - **KRISTINE JOY BAUTISTA** (APL-01042 · Front Desk Receptionist) · 2026-10-27 09:09 AM · `Practical Test Step 4 of 5` · 80% Passed 11 docs · Not required — Completed · Not required — Completed · Ready to evaluate — start from A...

---

## Picture 4: Tab 3 — History & Audit Activity Log

![History & audit tab](./Applicant%20Management%20(History%20&%20audit%20tab).PNG)

### Elements & Components in this View:
1. **Card Header:** Clock/History icon + `"History & Audit"`.
   - Subtext: `"Complete trail of applicant activity — screening, transfers, interview booking, completion and cancellation, assessments and hiring decisions."`
2. **Toolbar:** `Search activity...`, `All actions ▾`, `All departments ▾`, `All users ▾`, `[📊 Generate Report]`.
3. **Audit Log Table:**
   - Columns: `DATE & TIME ↕`, `PERFORMED BY`, `POSITION`, `DEPARTMENT`, `ACTION`, `APPLICANT`, `MODULE`, `DETAILS`.
   - **Real Live Records Visible (page 1 of 10 — all 10 rows for CAMILLE BEATRICE FERNANDEZ):**
     | Date | Performed By | Action Badge | Details |
     |------|-------------|--------------|---------|
     | 2026-11-04 1:32 AM | Bullseur Santiago · Super Admin | `Interview Updated / Rescheduled` (Amber) | Updated interview for CAMILLE BEATRICE FERNANDEZ on 2026-11-05 at 01:27:00 (Scheduled). |
     | 2026-11-04 1:31 AM | Bullseur Santiago | `Interview Updated / Rescheduled` (Amber) | Updated interview for CAMILLE BEATRICE FERNANDEZ on 2026-11-05 at 01:27:00 (Scheduled). |
     | 2026-11-04 1:30 AM | Bullseur Santiago | `Applicant Moved to Stage: Interview Scheduled` (Light Red/Pink) | Moved CAMILLE BEATRICE FERNANDEZ from Assessment Test to Interview Scheduled for Restaurant Server. Reason: try try |
     | 2026-11-04 1:29 AM | System | `Assessment Test Recorded` (Light Grey/Tan) | Applicant CAMILLE BEATRICE FERNANDEZ submitted assessment test "Restaurant Server — Job Knowledge Test" via secure link with score 80% and result Passed. |
     | 2026-11-04 1:29 AM | Bullseur Santiago | `Assessment Test Link Generated` (Light Grey/Tan) | Generated a secure assessment test link for CAMILLE BEATRICE FERNANDEZ ("Restaurant Server — Job Knowledge Test"), valid for 7 days. |
     | 2026-11-04 1:27 AM | Bullseur Santiago | `Interview Updated / Rescheduled` (Amber) | Updated interview for CAMILLE BEATRICE FERNANDEZ on 2026-11-05 at 01:27:00 (Completed). |
     | 2026-11-04 1:27 AM | Bullseur Santiago | `Interview Assessment Completed` (Light Green) | Recorded interview assessment for CAMILLE BEATRICE FERNANDEZ with total score 80.00% and verdict Passed — overall evaluation: Recommended. |
     | 2026-11-04 1:27 AM | Bullseur Santiago | `Facility Request Approved` (Light Peach) | Facility request approved — Room 1 for CAMILLE BEATRICE FERNANDEZ's interview on 2026-11-05 at 01:00:00. Confirmation email sent. |
     | 2026-11-04 1:27 AM | Bullseur Santiago | `Interview Booked` (Light Red/Pink) | Scheduled interview for CAMILLE BEATRICE FERNANDEZ on 2026-11-05 at 01:00:00 (On-site). |
     | 2026-11-04 1:27 AM | Bullseur Santiago | `Applicant Stage Changed to Accepted` (Light Green) | Stage changed from Screened to Accepted for CAMILLE BEATRICE FERNANDEZ (Restaurant Server). |
   - Pagination: `"Showing 1-10 of 100 log entries"`, `Previous [1] 2 3 ... 10 Next`.

---

## Picture 5: Modal — Resume Screening Result (Tab 1: Match & Requirements)

![Resume screening - Match & Requirements](./Applicant%20Management%20(Interview%20pipeline%20tab%20after%20clicking%20review%20screening%20it%20go%20to%20resume%20screening-%20Match%20&%20Requirements).PNG)

### Elements & Components in this View:
1. **Modal Header:** Red document icon + `"Resume Screening Result"` + subtext `"AI-powered analysis and matching based on job requirements. This result is used for your evaluation and decision support."` + close button `×`.
2. **Candidate Summary Header Card:**
   - Avatar `AG` · **ANGELO GABRIEL CRUZ** · Badge: `● Perfect for the Job`
   - Job Post: `Test Post` · Applied: `2026-11-04 06:38 PM`
   - File attachment card on right: `Angelo_Gabriel_Cruz_Resume.docx` (PDF/Resume) with `[👁 View]` and `[⬇ Download]` buttons.
3. **Score & Metric Highlights Row (Top):**
   - **Match Score Gauge:** Circular green gauge displaying **`84% Match`**.
   - **Recommendation Banner:** `✓ Strong match with the requirements for this position.`
   - **4 Metric Cards:**
     - `4` / `Matched Keywords`
     - `0` / `Missing Keywords`
     - `6 years 6 months` / `Experience`
     - `High School` / `Education`
4. **Internal Modal Subtabs:**
   - `[Match & Requirements]` (Active maroon tab)
   - `[Document Verification (7)]`
   - `[Technical Breakdown]`
   - Score weight label: `"Score Weight: 84%"`
5. **Left Column: Position Requirements Card:**
   - Badge: `4/4 Matched` with full green progress bar.
   - `REQUIRED SKILLS (4/4)`: Chemical Safety (`✓ Found`), Linen Handling (`✓ Found`), Public Area Cleaning (`✓ Found`), Room Turnover (`✓ Found`).
   - `WORK EXPERIENCE (1+ YRS REQUIRED) (0/1)`: 1+ Years Experience (Applicant: 6.5 yrs) · `Not Found` (Red tag).
   - `EDUCATION (1/1)`: High School Graduate · `✓ Found`.
   - `CERTIFICATIONS (1/1)`: TESDA Housekeeping NC II · `✓ Found`.
6. **Right Column: Key Information Extracted (spaCy NER):**
   - `Essential Information`: Name, Email (`angelo.cruz.housekeeping@gmail.com`), Phone (`+63 918 302 4190`).
   - `Skills (8)`: Recognized green chips: *Chemical Safety, Food Safety, Housekeeping Operations, Housekeeping and Room Inspection, Linen Handling, Public Area Cleaning, Room Turnover, Safety Compliance*.
   - `Job Titles (2)`: Housekeeping Attendant (Recognized, Green) vs Housekeeping On the Job Trainee (Unrecognized, Orange).
   - `Work Experience (3)`: Hotel Room Attendant (2022-Pres), Junior Housekeeping Attendant (2021-2022), OJT (2020).

---

## Picture 6: Modal — Resume Screening Result (Tab 2: Document Verification)

![Resume screening - Document Verification](./Applicant%20Management%20(Interview%20pipeline%20tab%20after%20clicking%20review%20screening%20it%20go%20to%20resume%20screening-%20Document%20Verification).PNG)

### Elements & Components in this View:
1. **Candidate:** Avatar `CB` · **CAMILLE BEATRICE FERNANDEZ** · Restaurant Server · **100% Match**.
2. **Subtab:** `Document Verification (2)` (Active maroon tab).
3. **Ranking Score with Document Verification Alert:**
   - Pinkish banner with badge: `DISCREPANCY FOUND` + button `[🔄 Recompute ranking]`.
   - Explanation: `"Resume screening plus the verification of the resume claims, so the candidate's rank reflects both."`
   - **3 Score Columns:**
     - `RESUME SCORE`: **100%** (*Screening only*)
     - `DOCUMENTS SCORE`: **33%** (*33% of the ranking score*)
     - `RANKING SCORE`: **100%** (*Unchanged by documents*)
   - Discrepancy Warnings List:
     - `! Verified - 2 with discrepancies - 0 unable to verify — a document contradicts the resume, so the candidate is flagged Invalid Credential.`
     - `! COE discrepancy: the document contradicts the resume on Start date, End date.`
     - `! Credential verified: the document corroborates the resume claims.`
     - `! Certificate discrepancy: the document contradicts the resume on Certification.`
4. **Left Column: Resume vs Documents Match:**
   - Badge: `Needs your review` · Progress: `2 of 4 sections confirmed | 2 need your review` (Green bar).
   - `Identity` (Badge: `Confirmed`): Name on papers vs resume checked in 3 papers (*CAMILLE BEATRICE FERNANDEZ*).
   - `Work experience` (Badge: `Check needed`): Employer, title and dates checked in 1 papers.
5. **Right Column: Supporting Document Verification Cards (2 documents):**
   - `Certificate of Employment`: Discrepancy found (2/4 verified), `[👁 View] [⬇ Download] [🔄 Reverify]`.
   - `ID / Government ID`: Verified (1/2 verified), `[👁 View] [⬇ Download] [🔄 Reverify]`.
   - `Training Certificate`: Discrepancy found (1/2 verified).

---

## Picture 7: Modal — Resume Screening Result (Tab 3: Technical Breakdown)

![Resume screening - Technical Breakdown](./Applicant%20Management%20(Interview%20pipeline%20tab%20after%20clicking%20review%20screening%20it%20go%20to%20resume%20screening-%20Technical%20Breakdown).PNG)

### Elements & Components in this View:
1. **Subtab:** `Technical Breakdown` (Active maroon tab).
2. **Screening Details Card:**
   - Subtitle: `"Technical details from the resume analysis (OCR + NER + matching)." [Collapse ^]`
   - **4 Column Grid:**
     1. `RESUME PROCESSING`:
        - Text Extraction: `✓ Completed`
        - OCR Processing: `✓ Completed`
        - Text Quality: `✓ Successfully extracted`
        - Processing Status: `Partial`
     2. `NAMED ENTITY RECOGNITION (NER)`:
        - Skills: 12 extracted
        - Job Titles: 1 recognized
        - Education: 1 extracted
        - Experience: 6 years 6 months
        - Other Information: Applicant/resume info identified
        - Recognized Terms: 13 terms matched to vocabulary
        - `UNRECOGNIZED TERMS (7)` `[🚩 Report all]`:
          - *2021) Food, Beverage Pairing, Bottle Decanting, Event Function Execution, Order Terminal Entry, Sanitary Food, Wine Service*.
          - Note: *"Recognized as text, but not yet in the screening vocabulary — add them in Screening Reference Data so future resumes match."*
     3. `JOB REQUIREMENT MATCHING`:
        - Target Position: `Restaurant Server`
        - Match Score: `100%`
        - Matched Requirements: `7 / 7`
        - Missing Requirements: `0`
        - Required Skills: `Matched (by system rules)`
     4. `VALIDATION / SYSTEM ANALYSIS`:
        - Document Analysis: `✓ Passed`
        - Credential Analysis: `✓ Passed`
        - Unrecognized Job Roles: `0`
        - Unrecognized Skills: `7`
3. **Modal Footer:** `[🚩 Report unrecognized entries]` (outline) + `[Close]` (outline).

---

## Picture 8: Full Takeover Component — ApplicantViewScreen

![ApplicantViewScreen Takeover](./Applicant%20Management%20(Interview%20pipeline%20tab%20after%20clicking%20view%20profile).PNG)

### Elements & Components in this View:
1. **Top Navigation:** `[← Back to Applicants]` button (clicking this restores the applicant list).
2. **Candidate Header Card:**
   - Avatar `CB` · **CAMILLE BEATRICE FERNANDEZ** `APL-01045`
   - Meta: Restaurant Server · Food & Beverage · Applied: 2026-11-05 08:17 AM
   - Contact: `beatricecamille329@gmail.com` · `09170429135`
   - Badges: `● Perfect for the Job` · `Interview Scheduled`
   - Start Date as Employee: `2026-11-04`
   - Resume download card on right: `Camille_Beatrice_Fernandez_Res...` `100% Score PDF`.
3. **Horizontal 5-Step Pipeline Progress Rail:**
   - Node 1: `Screening` — **Completed** (Green circle with check `✓`)
   - Node 2: `Interview` — **In Progress** (Active maroon circle with `2`)
   - Node 3: `Assessment Test` — **Pending** (Grey circle with `3`)
   - Node 4: `Practical Assessment` — **Pending** (Grey circle with `4`)
   - Node 5: `Final Evaluation` — **Pending** (Grey circle with `5`)
4. **Two-Column Split Layout:**
   - **Left Navigation Rail (Applicant Sections):**
     - `ℹ Current Stage` (Active maroon pill)
     - `⏱ Previous Applications` `✓ Done`
     - `📄 Application Details`
     - `📤 Resume & Documents` `✓ Done`
     - `🗓 Interview`
     - `📋 Assessment Test`
     - `🔧 Practical Assessment`
     - `🎯 Final Evaluation`
   - **Right Main Content Area:**
     - Section Header: `ℹ Interview Scheduled` / *"An interview slot has been booked. Start the interview assessment on the interview day."*
     - Administrative Action Buttons: `[➔ Move stage]`, `[🗃 Archive]`, `[🚫 Block]`.
     - Stage Summary Badges:
       - `Screening`: Passed (Green dot)
       - `Interview`: Scheduled - 2026-11-05
       - `Assessment Test`: Not yet taken
       - `Practical`: Pending
     - `RECENT ACTIVITY & MILESTONES` timeline entries with timestamps and actors (*Bullseur Santiago, System*). Real entries visible:
        - `Interview Updated / Rescheduled` · 2026-11-04 1:32 AM · *Recorded by: Bullseur Santiago*
        - `Interview Updated / Rescheduled` · 2026-11-04 1:31 AM
        - `Applicant Moved to Stage Interview Scheduled` · 2026-11-04 1:30 AM
        - `Assessment Test Recorded` · 2026-11-04 1:29 AM · *Recorded by: System*
