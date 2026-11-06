# CURRENT SYSTEM MASTER DOSSIER
## Oxford Suites Makati HRMS — Talent Acquisition & Onboarding Suite
**Document Purpose:** Exhaustive, 100% unvarnished visual and architectural reference of the **CURRENT** codebase for AI Agents and UI/UX Designers to analyze, understand design rationale, and propose production-grade redesign mockups.

---

## 1. System Overview & Technical Stack

- **Hotel Entity:** Oxford Suites Makati (Luxury 4-Star Hotel, Metro Manila, Philippines)
- **Frontend Stack:** React 19, Vite, TanStack Start & Router (file-based routing), Tailwind CSS v4, Radix UI Primitives, Lucide React icons, Recharts, Zoom Meeting SDK (`@zoom/meetingsdk`), zip.js (`@zip.js/zip.js`), jsPDF, docx-preview, mammoth.
- **Backend Stack:** Laravel 11 (Modules architecture), MySQL, Python FastAPI spaCy v2.4 NLP service (port 8001).
- **Core Brand Theme Tokens ("Crimson & Ivory"):**
  - **Primary Burgundy:** `#7a1c1c` (`oklch(0.427 0.166 22.5)`)
  - **Sidebar Dark Burgundy:** `#5e1515`
  - **Champagne Gold:** `#c9a84c` (`oklch(0.72 0.104 85)`) & `#e0c47a`
  - **Warm Ivory Canvas:** `#f9f7f4` (`oklch(0.988 0.005 85)`)
  - **Card Surface:** `#ffffff` with subtle warm borders (`#e4dad0`, `#f0e8e0`)
  - **Primary Text:** `#3d2b1f` (Deep warm charcoal/espresso)
  - **Muted Text:** `#7d6b5e`
  - **Display Typography:** `Cormorant Garamond` (Luxury Serif for page titles, modal headers, job titles)
  - **Body Typography:** `Jost` (Modern, readable Sans-Serif for tables, forms, labels)

---

## 2. The Three Interconnected Modules Architecture

```text
┌────────────────────────────────────────────────────────┐
│             1. RECRUITMENT MANAGEMENT                  │
│  • Vacancy Requisitions Tracker (10 Pending)           │
│  • 3-Column Job Post Builder (Palette / Form / Card)   │
│  • Global Screening Setup (40/30/20/10 Sliders & NLP)  │
│  • Instant spaCy Applicant Intake Wizard               │
└───────────────────────────┬────────────────────────────┘
                            │ (Publishes vacancies & feeds candidate resumes)
                            ▼
┌────────────────────────────────────────────────────────┐
│             2. APPLICANT MANAGEMENT                    │
│  • spaCy NER Resume Screening & 100% Match Engine      │
│  • 1500px Monolithic Resume Screening Result Modal     │
│    (Match & Req, Doc Verification, Tech Breakdown)     │
│  • Room Availability Calendar (Rooms 1, 2, 3 & Virtual)│
│  • 5-Stage Multi-Column Pipeline Table                 │
│  • Full Takeover Component: <ApplicantViewScreen />    │
└───────────────────────────┬────────────────────────────┘
                            │ (When applicant accepts job offer)
                            ▼
┌────────────────────────────────────────────────────────┐
│             3. NEW HIRE ONBOARDING                     │
│  • 2-Node Status Tracker Rail (Pre-onb -> Probation)   │
│  • 8 Standard Philippine Pre-Employment Checklists     │
│  • Core HCM Employee Account Provisioning Engine       │
│  • 180-Day Probationary Track (3rd & 5th Month Review) │
│  • Password-Protected AES-256 ZIP Compliance Exporter  │
└────────────────────────────────────────────────────────┘
```

---

## 3. Master Index of Visual Context Specifications & PNG Snapshots

Every module folder contains:
1. `CURRENT_SPEC.md`: Concise architectural spec listing every component, element, tab, modal, and state with live stat-card values verified from the live database.
2. `VISUAL_CONTEXT_SPEC.md`: Exhaustive markdown dossier embedding and breaking down every picture, modal, tab in modal, whole module, per tab of a module, element, and component — sourced from actual live PNG screenshots.
3. High-resolution production PNG screenshots captured live from the running system at `http://localhost:3000` matching the 1920x960 viewport.

### Module 01: Recruitment Management
- **Source Code:** `frontend/src/components/modules/RecruitmentManagement.tsx` (10,170 lines)
- **Active Routes:**
  - Admin: `frontend/src/routes/admin/_recruitmentmanagement/recruitment.tsx` (`/admin/recruitment`)
  - Super Admin: `frontend/src/routes/superadmin/_recruitmentmanagement/recruitment.tsx` (`/superadmin/recruitment`)
- **Live Database Stat Cards:** Active Postings: **9** | Total Vacancies: **39** | Pending Requisitions: **10** | High Urgency: **4**
- **Visual Dossier:** [VISUAL_CONTEXT_SPEC.md](./01-recruitment-management/VISUAL_CONTEXT_SPEC.md)
- **Spec:** [CURRENT_SPEC.md](./01-recruitment-management/CURRENT_SPEC.md)
- **PNG Screenshots (9 Files):**
  1. `Recruitment Management (Vacancies & postings tab - Grid view).PNG` — Whole module & job cards grid (10 of 11 shown).
  2. `Recruitment Management (Vacancies & postings tab - List view).PNG` — Tabular roster of vacancies with fill ratio & salary bands.
  3. `Recruitment Management (Requisitions tab).PNG` — Vacancy requisitions tracker (10 pending requisitions, e.g. REQ-1002 to REQ-1011).
  4. `Recruitment Management (Job post builder tab).PNG` — Start state choice cards (Start from scratch vs Use existing template).
  5. `Recruitment Management (Job post builder - 3D Flip Card Front & Back).PNG` — Signature 3D flip card component (Careers preview & NER token inspector).
  6. `Recruitment Management (Screening setup modal - Scoring Weights).PNG` — Screening Setup modal: Scoring tab (Criteria weights & passing thresholds).
  7. `Recruitment Management (Screening setup modal - Reference Vocabulary & NLP Diagnostics).PNG` — Screening Setup modal: Reference Data tab (261 active vocabulary terms & aliases).
  8. `Recruitment Management (Add applicant modal - Upload & Instant Screen).PNG` — Add Applicant 2-step intake wizard.
  9. `Recruitment Management (New requisition modal).PNG` — Choose department and job position dialog (builder starter).

### Module 02: Applicant Management
- **Source Code:** `frontend/src/components/modules/ApplicantManagement.tsx` (19,289 lines)
- **Associated Candidate Components (`frontend/src/components/applicants`):**
  - `InterviewEvaluationForm.tsx`: Evaluation scorecard and rating rubric for candidate interviews.
  - `ZoomEmbeddedMeeting.tsx`: Embedded Zoom Meeting Web SDK player for in-platform virtual interviews.
- **Active Routes:**
  - Admin: `frontend/src/routes/admin/_applicant-management/applicants.tsx` (`/admin/applicants`)
  - Super Admin: `frontend/src/routes/superadmin/_applicant-management/applicants.tsx` (`/superadmin/applicants`)
- **Live Database Stat Cards:** Total Applicants: **15** | New Applicant: **3** | Perfect for the Job: **9** | Today Scheduled Interview: **1**
- **Visual Dossier:** [VISUAL_CONTEXT_SPEC.md](./02-applicant-management/VISUAL_CONTEXT_SPEC.md)
- **Spec:** [CURRENT_SPEC.md](./02-applicant-management/CURRENT_SPEC.md)
- **PNG Screenshots (8 Files):**
  1. `Applicant Management (Ranking & applicants tab).PNG` — Whole module, 15-resume donut chart, top 5 priority list.
  2. `Applicant Management (Interview pipeline tab - top view).PNG` — October 2026 Room availability (Rooms 1, 2, 3 & Virtual) & daily schedule.
  3. `Applicant Management (Interview pipeline tab - bottom view).PNG` — 5-stage pipeline overview table.
  4. `Applicant Management (History & audit tab).PNG` — Audit trail table with 8 event badge colors.
  5. `Applicant Management (Interview pipeline tab after clicking review screening it go to resume screening- Match & Requirements).PNG` — Modal subtab 1: NER chips & 4/4 checklist.
  6. `Applicant Management (Interview pipeline tab after clicking review screening it go to resume screening- Document Verification).PNG` — Modal subtab 2: Discrepancy alert & verification cards.
  7. `Applicant Management (Interview pipeline tab after clicking review screening it go to resume screening- Technical Breakdown).PNG` — Modal subtab 3: 4-column OCR/NER engine stats.
  8. `Applicant Management (Interview pipeline tab after clicking view profile).PNG` — Full takeover `<ApplicantViewScreen />` with 5-stage stepper.

### Module 03: New Hire Onboarding
- **Source Code:** `frontend/src/components/modules/NewHireOnboarding.tsx` (4,980 lines)
- **Active Routes:**
  - Admin: `frontend/src/routes/admin/_newhireonboarding/onboarding.tsx` (`/admin/onboarding`)
  - Super Admin: `frontend/src/routes/superadmin/_newhireonboarding/onboarding.tsx` (`/superadmin/onboarding`)
  - Employee: `frontend/src/routes/employee/_newhireonboarding/onboarding.tsx` (`/employee/onboarding`)
- **Live Database Stat Cards:** Total New Hires: **7** | Pre-onboarding: **2** | Probationary: **5** | Awaiting Evaluation: **2**
- **Visual Dossier:** [VISUAL_CONTEXT_SPEC.md](./03-new-hire-onboarding/VISUAL_CONTEXT_SPEC.md)
- **Spec:** [CURRENT_SPEC.md](./03-new-hire-onboarding/CURRENT_SPEC.md)
- **PNG Screenshots (11 Files):**
  1. `New Hire Onboarding (Pipeline tab - top view).PNG` — Whole module, 4 StatCards (7/2/5/2), 2-node progress tracker rail.
  2. `New Hire Onboarding (Pipeline tab - bottom view).PNG` — Pre-onboarding list with selected hire checklist inspection panel.
  3. `New Hire Onboarding (Requested checklists tab - Builder & List).PNG` — 2-column layout: Requested Checklists ledger & Checklist Builder templates.
  4. `New Hire Onboarding (Requested checklists tab - Document Verification Details).PNG` — Scrolled Checklist Builder showing multiple templates (Active & Closed).
  5. `New Hire Onboarding (Core HCM account provisioning modal).PNG` — Add New Hire dialog with applicant dropdown and default credentials.
  6. `New Hire Onboarding (New hire checklist review modal).PNG` — All Hired Applicants roster with right-hand inline checklist inspector.
  7. `New Hire Onboarding (Performance evaluation banner component).PNG` — Full All Hired Applicants roster view across all onboarding stages.
  8. `New Hire Onboarding (Report export modal).PNG` — Generate Report modal with 3 encrypted compliance report options.
  9. `New Hire Onboarding (Employee portal - Pre-onboarding checklist view).PNG` — Candidate/employee self-service portal (`/employee/onboarding`) with verified vs pending items.
  10. `New Hire Onboarding (Employee portal - Document upload modal).PNG` — Employee side panel task submission drawer with file upload dropzone and HR notes.
  11. `New Hire Onboarding (Employee portal - Probationary checklist view).PNG` — Probationary employee portal checklist view with milestone evaluations and task submissions.

---

## 4. Instructions for Redesign Agents

When creating redesign mockups or suggestions:
1. **Never invent arbitrary fake features:** Base all functionality on the actual forms, fields, badges, and states documented in these dossiers.
2. **Preserve Inter-Module Continuity:**
   - Position and criteria drafted in `RecruitmentManagement.tsx` feed directly into `ApplicantManagement.tsx`.
   - Candidates accepted in `ApplicantManagement.tsx` automatically populate `NewHireOnboarding.tsx`.
   - Onboarding completions in `NewHireOnboarding.tsx` provision employee records directly into `Core HCM`.
3. **Respect Oxford Suites Luxury Hospitality Identity:**
   - Headings must retain high-elegance serif typography (`Cormorant Garamond`).
   - Retain the signature Burgundy (`#7a1c1c`), Gold (`#c9a84c`), and Ivory (`#f9f7f4`) palette.
4. **Refer to the PNG Files Directly:** Inspect the actual screenshots to understand layout spacing, density, and visual hierarchy before proposing UX simplifications.
