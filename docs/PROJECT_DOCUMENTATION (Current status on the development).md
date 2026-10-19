# 📋 Complete Project Documentation: Hotel & Restaurant HRMS

## 🎯 Project Title

**"Design and Development of Recruitment Management in Hotels and Restaurants using spaCy-based Natural Language Processing (NLP) for Roles - Specific with a Feature of Applicant Screening using Named Entity Recognition (NER)"**

**Client:** Oxford Suites Makati (Hotel in Makati City, Philippines)

---

## 📑 Table of Contents

1. [System Architecture](#-system-architecture)
2. [File Structure](#-file-structure)
3. [Pages Per Role](#-pages-per-role)
4. [Module Details](#-module-details)
5. [Database Schema](#-database-schema-42-tables)
6. [Tech Stack](#-tech-stack)
7. [Setup Instructions](#-setup-instructions)
8. [Authentication Flow](#-authentication-flow)
9. [API Endpoints](#-api-endpoints)
10. [Design System](#-design-system)
11. [Current Status](#-current-status)
12. [Team Split](#-suggested-3-dev-split)
13. [Build Order](#-build-order-recommended)

---

## 🏗️ System Architecture

### Three-Service Architecture

| Service | Role | Technology |
|---------|------|------------|
| `frontend` | UI only, no business logic | React + Vite + TypeScript + TanStack Start |
| `backend-laravel` | Auth, business rules, data, source of truth | PHP Laravel 12 + MySQL |
| `nlp-service` | Stateless: OCR + NER + screening score | Python FastAPI + spaCy |

### Communication Flow

```
┌─────────────┐     REST API      ┌─────────────────┐      HTTP       ┌─────────────┐
│   Frontend  │ ───────────────► │ backend-laravel │ ──────────────► │ nlp-service │
│   (React)   │ ◄─────────────── │    (Laravel)    │ ◄────────────── │  (FastAPI)  │
└─────────────┘   JSON Response   └────────┬────────┘   JSON Response └─────────────┘
                                           │
                                           ▼
                                    ┌─────────────┐
                                    │    MySQL    │
                                    │  Database   │
                                    └─────────────┘
```

**Why the frontend never talks to Python directly:**
- Keeps one auth boundary (Laravel/Sanctum)
- Keeps the NLP service swappable/rewritable later without touching the frontend
- Keeps applicant data validated/logged in one place before it hits an ML service

---

## 📁 File Structure

```
2nd-repo-for-hrms-backend-/
│
├── frontend/                          # React application
│   ├── public/
│   │   ├── favicon.png
│   │   └── robots.txt
│   ├── src/
│   │   ├── router.tsx                 # Creates router with QueryClient context
│   │   ├── routeTree.gen.ts           # Auto-generated route tree (never edit)
│   │   ├── server.ts                  # SSR / server entry
│   │   ├── start.ts                   # Client start config
│   │   ├── styles.css                 # Tailwind v4 theme tokens
│   │   │
│   │   ├── assets/                    # Images and static assets
│   │   │   ├── hero-oxford-suites.jpg
│   │   │   ├── login-hospitality.jpg
│   │   │   ├── oxford-logo.png
│   │   │   └── ...
│   │   │
│   │   ├── routes/                    # File-based routing (TanStack Router)
│   │   │   ├── __root.tsx             # App shell, head defaults, Toaster
│   │   │   ├── admin.tsx              # Admin layout wrapper
│   │   │   ├── employee.tsx           # Employee layout wrapper
│   │   │   ├── superadmin.tsx         # Super Admin layout wrapper
│   │   │   │
│   │   │   ├── _landing/              # Public pages
│   │   │   │   ├── index.tsx          # Home page
│   │   │   │   ├── about.tsx
│   │   │   │   ├── faq.tsx
│   │   │   │   ├── contact.tsx
│   │   │   │   ├── jobs.index.tsx     # Jobs listing
│   │   │   │   └── jobs.$jobId.tsx    # Job detail
│   │   │   │
│   │   │   ├── _login/                # Auth pages
│   │   │   │   ├── login.tsx
│   │   │   │   ├── otp.tsx
│   │   │   │   ├── forgot-password.tsx
│   │   │   │   └── reset-password.tsx
│   │   │   │
│   │   │   ├── admin/                 # Admin portal pages
│   │   │   │   ├── index.tsx          # Dashboard
│   │   │   │   ├── _applicant-management/
│   │   │   │   ├── _recruitmentmanagement/
│   │   │   │   ├── _newhireonboarding/
│   │   │   │   ├── _corehcm/
│   │   │   │   ├── _employeerecords/
│   │   │   │   ├── _essmanagement/
│   │   │   │   ├── _profilepage/
│   │   │   │   └── _settings/
│   │   │   │
│   │   │   ├── superadmin/            # Super Admin portal pages
│   │   │   │   ├── index.tsx
│   │   │   │   ├── _applicant-management/
│   │   │   │   ├── _recruitmentmanagement/
│   │   │   │   ├── _newhireonboarding/
│   │   │   │   ├── _corehcm/
│   │   │   │   ├── _employeerecords/
│   │   │   │   ├── _essmanagement/
│   │   │   │   ├── _usermanagement/
│   │   │   │   ├── _auditlogs/
│   │   │   │   ├── _profilepage/
│   │   │   │   └── _settings/
│   │   │   │
│   │   │   └── employee/              # Employee portal pages
│   │   │       ├── index.tsx
│   │   │       ├── _essmanagement/
│   │   │       ├── _newhireonboarding/
│   │   │       ├── _profilepage/
│   │   │       └── _settings/
│   │   │
│   │   ├── components/
│   │   │   ├── brand/
│   │   │   │   └── Logo.tsx           # Oxford Suites wordmark
│   │   │   │
│   │   │   ├── modules/               # HRMS feature modules
│   │   │   │   ├── ApplicantManagement.tsx
│   │   │   │   ├── RecruitmentManagement.tsx
│   │   │   │   ├── NewHireOnboarding.tsx
│   │   │   │   ├── CoreHCM.tsx
│   │   │   │   ├── EmployeeRecords.tsx
│   │   │   │   ├── EssManagement.tsx
│   │   │   │   ├── UserManagement.tsx
│   │   │   │   ├── AuditLogs.tsx
│   │   │   │   ├── Settings.tsx
│   │   │   │   ├── ProfilePage.tsx
│   │   │   │   └── EmployeeOnboarding.tsx
│   │   │   │
│   │   │   ├── portal/                # Portal chrome/shell
│   │   │   │   ├── PortalShell.tsx    # Sidebar, header, notifications
│   │   │   │   ├── PageHeader.tsx
│   │   │   │   ├── StatCard.tsx
│   │   │   │   ├── AnnouncementsCard.tsx
│   │   │   │   ├── AnnouncementDialog.tsx
│   │   │   │   ├── portal-state.tsx   # In-memory announcement store
│   │   │   │   ├── ListBody.tsx
│   │   │   │   ├── ListEmptyState.tsx
│   │   │   │   └── sortable.tsx
│   │   │   │
│   │   │   ├── public/                # Public site components
│   │   │   │   ├── PublicShell.tsx    # Header and footer
│   │   │   │   └── Chatbot.tsx        # Floating FAQ assistant
│   │   │   │
│   │   │   └── ui/                    # shadcn/ui primitives (48 components)
│   │   │       ├── accordion.tsx
│   │   │       ├── alert.tsx
│   │   │       ├── avatar.tsx
│   │   │       ├── badge.tsx
│   │   │       ├── button.tsx
│   │   │       ├── calendar.tsx
│   │   │       ├── card.tsx
│   │   │       ├── dialog.tsx
│   │   │       ├── dropdown-menu.tsx
│   │   │       ├── form.tsx
│   │   │       ├── input.tsx
│   │   │       ├── select.tsx
│   │   │       ├── table.tsx
│   │   │       ├── tabs.tsx
│   │   │       └── ... (34 more)
│   │   │
│   │   ├── data/                      # TypeScript fixtures
│   │   │   ├── applicants.ts          # Applicants, screening criteria, interviews
│   │   │   ├── company.ts             # Company info, facilities, FAQs
│   │   │   ├── ess.ts                 # ESS requests, attendance, payroll
│   │   │   ├── hires.ts               # New hires data
│   │   │   ├── hr.ts                  # Departments, positions, employees
│   │   │   ├── jobs.ts                # Job postings
│   │   │   ├── records.ts             # Employee records
│   │   │   ├── requisitions.ts        # Requisition store
│   │   │   └── users.ts               # System users, permissions
│   │   │
│   │   ├── hooks/
│   │   │   ├── use-mobile.tsx         # Responsive breakpoint hook
│   │   │   └── usePagination.ts
│   │   │
│   │   └── lib/                       # Utilities and API
│   │       ├── api.ts                 # Centralized API client
│   │       ├── auth.ts                # Auth token management
│   │       ├── nav.ts                 # Roles, roleMeta, navForRole()
│   │       ├── utils.ts               # cn() class merge helper
│   │       ├── employeerecords.ts
│   │       ├── hcm-sync.ts
│   │       ├── landing.ts
│   │       ├── error-capture.ts
│   │       └── error-page.ts
│   │
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── eslint.config.js
│   ├── components.json                # shadcn/ui config
│   └── README.md
│
├── backend-laravel/                   # Laravel API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   └── Middleware/
│   │   │
│   │   ├── Models/                    # Shared models
│   │   │   ├── User.php
│   │   │   ├── Employee.php
│   │   │   ├── Department.php
│   │   │   ├── Position.php
│   │   │   ├── SalaryGrade.php
│   │   │   ├── Applicant.php
│   │   │   ├── JobPost.php
│   │   │   ├── AuditLog.php
│   │   │   ├── Announcement.php
│   │   │   ├── SystemUser.php
│   │   │   ├── SystemRole.php
│   │   │   ├── SystemSetting.php
│   │   │   ├── EmployeeDocument.php
│   │   │   ├── EmployeeEmergencyContact.php
│   │   │   ├── EmployeeExitRecord.php
│   │   │   ├── EmployeePositionHistory.php
│   │   │   ├── Hr3Recommendation.php
│   │   │   ├── RolePermission.php
│   │   │   └── UserLoginActivity.php
│   │   │
│   │   ├── Services/
│   │   │   ├── NlpService.php         # HTTP client for Python NLP
│   │   │   ├── AuditLogger.php
│   │   │   └── OtpService.php
│   │   │
│   │   ├── Mail/
│   │   │   └── SendOtpMail.php
│   │   │
│   │   └── Providers/
│   │       └── AppServiceProvider.php
│   │
│   ├── Modules/                       # Modular Laravel structure
│   │   ├── ApplicantManagement/
│   │   │   ├── app/
│   │   │   │   ├── Http/Controllers/
│   │   │   │   ├── Http/Requests/
│   │   │   │   ├── Http/Resources/
│   │   │   │   └── Models/
│   │   │   │       ├── Applicant.php
│   │   │   │       ├── ApplicantAssessment.php
│   │   │   │       ├── ApplicantScreeningEntity.php
│   │   │   │       ├── ApplicantScreeningScore.php
│   │   │   │       └── Interview.php
│   │   │   ├── database/migrations/
│   │   │   ├── routes/api.php
│   │   │   └── tests/
│   │   │
│   │   ├── RecruitmentManagement/
│   │   │   ├── app/
│   │   │   │   └── Models/
│   │   │   │       ├── JobPost.php
│   │   │   │       ├── JobPostPlatform.php
│   │   │   │       └── Requisition.php
│   │   │   ├── database/migrations/
│   │   │   └── routes/api.php
│   │   │
│   │   ├── NewHireOnboarding/
│   │   │   ├── app/
│   │   │   │   └── Models/
│   │   │   │       ├── NewHire.php
│   │   │   │       ├── OnboardingChecklistTemplate.php
│   │   │   │       ├── OnboardingChecklistItem.php
│   │   │   │       ├── EmployeeOnboardingItem.php
│   │   │   │       └── ChecklistRequest.php
│   │   │   ├── database/migrations/
│   │   │   └── routes/api.php
│   │   │
│   │   ├── CoreHCM/
│   │   │   ├── app/Http/Controllers/
│   │   │   ├── database/migrations/
│   │   │   └── routes/api.php
│   │   │
│   │   ├── EmployeeSelfService/
│   │   │   ├── app/Http/Controllers/
│   │   │   ├── database/migrations/
│   │   │   └── routes/api.php
│   │   │
│   │   ├── EmployeeRecords/
│   │   │   ├── app/Http/Controllers/
│   │   │   ├── database/migrations/
│   │   │   └── routes/api.php
│   │   │
│   │   ├── UserManagement/
│   │   │   ├── app/Http/Controllers/
│   │   │   ├── database/migrations/
│   │   │   └── routes/api.php
│   │   │
│   │   ├── AuditLog/
│   │   │   ├── app/Http/Controllers/
│   │   │   ├── database/migrations/
│   │   │   └── routes/api.php
│   │   │
│   │   ├── Settings/
│   │   │   ├── app/Http/Controllers/
│   │   │   ├── database/migrations/
│   │   │   └── routes/api.php
│   │   │
│   │   ├── Profile/
│   │   │   ├── app/Http/Controllers/
│   │   │   └── routes/api.php
│   │   │
│   │   ├── Auth/
│   │   │   ├── app/
│   │   │   │   ├── Http/Controllers/
│   │   │   │   ├── Mail/
│   │   │   │   └── Services/
│   │   │   └── routes/api.php
│   │   │
│   │   └── Landing/
│   │       ├── app/Http/Controllers/
│   │       └── routes/api.php
│   │
│   ├── database/
│   │   └── migrations/                # 33 migration files
│   │       ├── 0001_01_01_000000_create_users_table.php
│   │       ├── 0001_01_01_000003_create_departments_table.php
│   │       ├── 0001_01_01_000004_create_salary_grades_table.php
│   │       ├── 0001_01_01_000005_create_positions_table.php
│   │       ├── 0001_01_01_000006_create_employees_table.php
│   │       └── ... (28 more)
│   │
│   ├── routes/
│   │   ├── web.php
│   │   └── console.php
│   │
│   ├── config/
│   ├── storage/
│   ├── tests/
│   ├── composer.json
│   ├── modules_statuses.json
│   └── .env.example
│
├── nlp-service/                       # Python FastAPI microservice
│   ├── app/
│   │   └── main.py                    # FastAPI entrypoint
│   └── models_spacy/                  # Custom spaCy models (empty)
│
├── database/                          # Database schemas
│   ├── hotel_hr_latest.sql            # Latest MySQL schema (42 tables)
│   └── kalat/
│       ├── hotel_hr_database_prd.md   # Database PRD specification
│       ├── hotel_hr_database_table_inventory.txt
│       ├── hotel_hr_schema_mysql.sql
│       ├── hotel_hr_schema_postgres.sql
│       ├── hotel_hr_seed_mysql.sql
│       └── hotel_hr_seed_postgres.sql
│
├── reference/                         # Documentation
│   ├── info.txt                       # System scope and subsystems
│   ├── pages&techstack.txt            # Pages & tech stack summary
│   ├── HRMS Backend Setup Guide.txt   # Detailed setup guide
│   ├── Claude.md
│   └── Claude.pdf
│
├── TRASH/                             # Unused assets
│
├── README.md
└── .gitignore
```

---

## 🖥️ Pages Per Role

### 🌐 Public Site (No Auth Required)

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Property hero, highlights, featured vacancies |
| `/about` | About | Client-related info about Oxford Suites |
| `/faq` | FAQ | FAQs about job applying |
| `/contact` | Contact | Contact information for HR |
| `/jobs` | Jobs List | Open vacancies with filters |
| `/jobs/$jobId` | Job Details | Apply for specific job, upload resume |
| `/login` | Login | Employee/Admin/Super Admin login |
| `/forgot-password` | Forgot Password | Password recovery |
| `/otp` | OTP Verification | Two-factor authentication |
| `/reset-password` | Reset Password | Set new password |

### 👑 Super Admin Portal (`/superadmin`)

| Route | Page | Features |
|-------|------|----------|
| `/superadmin` | Dashboard | System-wide KPIs, announcements |
| `/superadmin/applicants` | Applicant Management | Ranking, interview scheduling, assessment |
| `/superadmin/recruitment` | Recruitment Management | Vacancies, job post builder, requisitions |
| `/superadmin/onboarding` | New Hire Onboarding | Pre-onboarding → Probationary → Regular |
| `/superadmin/hcm` | Core HCM | Departments, positions, org chart |
| `/superadmin/dept-pos` | Departments & Positions | Manage organizational structure |
| `/superadmin/org-chart` | Organizational Chart | Hierarchical view |
| `/superadmin/employees` | Employee Records | 201 files, employee directory |
| `/superadmin/ess` | ESS Management | Request queue, administration, audit |
| `/superadmin/users` | User Management | Portal accounts, permissions matrix |
| `/superadmin/audit` | Audit Logs | System activity trail |
| `/superadmin/profile` | Profile | Personal information |
| `/superadmin/settings` | Settings | Notifications, preferences, company, backup |

### 🔧 Admin Portal (`/admin`)

Same as Super Admin **MINUS**:
- ❌ User Management
- ❌ Audit Logs

| Route | Page |
|-------|------|
| `/admin` | Dashboard |
| `/admin/applicants` | Applicant Management |
| `/admin/recruitment` | Recruitment Management |
| `/admin/onboarding` | New Hire Onboarding |
| `/admin/hcm` | Core HCM |
| `/admin/dept-pos` | Departments & Positions |
| `/admin/org-chart` | Organizational Chart |
| `/admin/employees` | Employee Records |
| `/admin/ess` | ESS Management |
| `/admin/profile` | Profile |
| `/admin/settings` | Settings |

### 👤 Employee Portal (`/employee`)

| Route | Page | Features |
|-------|------|----------|
| `/employee` | Dashboard | Personal KPIs, announcements |
| `/employee/ess` | ESS (Self-Service) | Attendance, schedule, leave, payroll, benefits, requests |
| `/employee/onboarding` | Onboarding | Checklist (visible only if incomplete) |
| `/employee/profile` | My Profile | Personal information |
| `/employee/settings` | Settings | Notifications, preferences, password |

---

## 📦 Module Details

### 1. Applicant Management (Largest Module)

**Component:** `src/components/modules/ApplicantManagement.tsx`

**Three Tabs:**

#### Tab 1: Ranking & Applicants
- Resume screening results with fit score per candidate
- Fit categories: `fit`, `other-role`, `credential`, `not-fit`
- Filters by vacancy and status
- Candidate ranking table
- "Top 5 candidates today" card
- Opening a candidate shows parsed resume data, criteria matches, and actions

#### Tab 2: Interview Scheduling
- **Interview Calendar**: Custom month grid with Previous/Next/Today navigation
  - Per-date states: selected, booked, suggested, unavailable
  - Interview-count badges
  - Legend
  - List of that day's interviews as compact cards
- **Book an Interview**: Numbered workflow
  1. Select applicant
  2. Choose date (pill buttons for suggested dates)
  3. Select time slot (pill buttons)
  4. Interview details (mode and interviewer dropdowns)
  5. Info panel showing location or meeting link
  6. Full-width "Confirm & send invitation" button
- **Scheduled Interviews Table**: Applicant, position, schedule, mode, status

#### Tab 3: Assessment
- Scoring against defined assessment criteria
- Recommendation outcome

---

### 2. Recruitment Management

**Component:** `src/components/modules/RecruitmentManagement.tsx`

#### Vacancies & Postings
- Job list with status (`Open`, `Closed`, `Draft`)
- Applicant counts
- Publishing channels

#### Job Post Builder
- Compose a posting:
  - Title
  - Department
  - Employment type
  - Salary range
  - Responsibilities
  - Qualifications
  - Preview

#### Requisitions
- Manpower requisition queue
- Backed by a subscribable store
- Approve/reject flow

---

### 3. New Hire Onboarding

**Component:** `src/components/modules/NewHireOnboarding.tsx`

**Pipeline across three stages:**
```
Pre-onboarding → Probationary → Regular
```

- Each stage has its own checklist
- Promoting a hire to the next stage issues a **fresh checklist that starts at 0% complete**
- Progress never carries over between stages
- Shows per-hire progress, documents, and stage timeline

---

### 4. Core HCM

**Component:** `src/components/modules/CoreHCM.tsx`

#### Departments
- Front Office, Food & Beverage, Kitchen/Culinary, Housekeeping, and more
- Each with: head, staff count, open requisitions, budget
- First department is selected by default

#### Positions
- Collapsible position groups
- Expanding a position lists its members in a single row:
  - Avatar, name, employee ID, department, position
  - Employment type + status badge
  - Per-member Transfer button

#### Organizational Chart
- Hierarchical view from the General Manager down

---

### 5. Employee Records

**Component:** `src/components/modules/EmployeeRecords.tsx`

#### Employee List
- Searchable, filterable directory
- Export functionality

#### Record History
- Change trail on employee records

#### 201 File Dialog
- Personal Information tab
- Documents tab
- Employment History tab
- Certificate and report generation

---

### 6. ESS Management (Admin Side)

**Component:** `src/components/modules/EssManagement.tsx`

#### Request Queue
- All employee self-service requests
- Category, urgency
- Approve/decline actions

#### ESS Administration *(Super Admin only)*
- Request categories
- Routing
- Policy configuration

#### Audit & Compliance *(Super Admin only)*
- Request audit trail

---

### 7. Employee ESS (Employee Side)

**Component:** `src/components/modules/EmployeeEss.tsx`

**Personal tabs:**
- **Attendance** - Daily punches, late/undime tracking
- **Schedule** - Shift assignments, rest days
- **Leave** - Balances and filing
- **Payroll** - Payslips and breakdown
- **Benefits** - HMO, allowances
- **My Requests** - Personal ESS requests

---

### 8. User Management (Super Admin Only)

**Component:** `src/components/modules/UserManagement.tsx`

#### User List
- Portal accounts with role
- Status (Active / Suspended)
- Last login

#### Permission Matrix
- Per-module permission levels
- Per role and per permission group

#### Authentication & Login Security
- Password policy
- Failed-attempt lockout
- Default password

---

### 9. Audit Logs (Super Admin Only)

**Component:** `src/components/modules/AuditLogs.tsx`

- Full system activity trail
- Actor, action, module, timestamp
- Severity levels: `Info`, `Warning`, `Critical`
- Filters

---

### 10. Settings

**Component:** `src/components/modules/Settings.tsx`

**Two-pane vertical-tab layout:**

#### Notifications
- Email toggles
- Browser toggles
- System-announcement toggles

#### Preferences
- Theme
- Language
- Date/time format
- Timezone

#### Company *(admin roles)*
- Company name
- Email
- Contact
- Operating hours
- Address

#### Backup & Restore
- Backup progress
- Scroll-contained backup history table

---

### 11. Announcements System

**Components:** `portal-state.tsx`, `AnnouncementDialog.tsx`, `AnnouncementsCard.tsx`, `PortalShell.tsx`

- Audiences: **All**, **Employee**, **Admin**, **Super Admin**
- `isVisibleTo(audience, role)` decides visibility
- Creating an announcement also raises a notification
- Announcements appear on role dashboards and in a megaphone panel in the portal header
- **Only Super Admin can delete announcements**

---

## 🗄️ Database Schema (42 Tables)

### Domain 1: Organization & Core HCM (8 tables)

| # | Table | Description |
|---|-------|-------------|
| 1 | `departments` | Department master data |
| 2 | `salary_grades` | Salary grade levels with min/max |
| 3 | `positions` | Position definitions per department |
| 4 | `employees` | Employee 201 file master record |
| 5 | `employee_emergency_contacts` | Emergency contact information |
| 6 | `employee_position_history` | Promotion/transfer history |
| 7 | `employee_exit_records` | Exit/clearance records |
| 8 | `employee_documents` | Document attachments metadata |

### Domain 2: Recruitment (7 tables)

| # | Table | Description |
|---|-------|-------------|
| 9 | `job_posts` | Job vacancy postings |
| 10 | `job_post_platforms` | Publishing platforms per job |
| 11 | `applicants` | Applicant records |
| 12 | `applicant_screening_entities` | NER-extracted entities |
| 13 | `applicant_screening_scores` | Criterion-based scores |
| 14 | `interviews` | Interview schedules |
| 15 | `applicant_assessments` | Assessment results |

### Domain 3: Onboarding (6 tables)

| # | Table | Description |
|---|-------|-------------|
| 16 | `requisitions` | Manpower requisitions |
| 17 | `new_hires` | New hire records |
| 18 | `onboarding_checklist_templates` | Reusable checklist templates |
| 19 | `onboarding_checklist_items` | Template items |
| 20 | `employee_onboarding_items` | Per-employee checklist state |
| 21 | `checklist_requests` | Checklist item requests |

### Domain 4: ESS (5 tables)

| # | Table | Description |
|---|-------|-------------|
| 22 | `ess_categories` | ESS request categories |
| 23 | `ess_requests` | Employee self-service requests |
| 24 | `leave_balances` | Leave credit balances |
| 25 | `attendance_records` | Daily attendance punches |
| 26 | `work_schedules` | Shift schedules |

### Domain 5: Payroll & Benefits (4 tables)

| # | Table | Description |
|---|-------|-------------|
| 27 | `payroll_periods` | Payroll period master |
| 28 | `payroll_records` | Payroll header per employee |
| 29 | `payroll_items` | Earning/deduction line items |
| 30 | `employee_benefits` | Benefits enrollment |

### Domain 6: Learning & Performance (4 tables)

| # | Table | Description |
|---|-------|-------------|
| 31 | `learning_courses` | Course catalog |
| 32 | `employee_learning` | Learning progress |
| 33 | `performance_reviews` | Performance evaluations |
| 34 | `hr3_recommendations` | HR3 recommendations |

### Domain 7: System & Security (8 tables)

| # | Table | Description |
|---|-------|-------------|
| 35 | `system_roles` | Role definitions |
| 36 | `role_permissions` | Role × module permission matrix |
| 37 | `system_users` | Portal user accounts |
| 38 | `notifications` | User notifications |
| 39 | `user_login_activity` | Login history |
| 40 | `audit_logs` | Immutable audit trail |
| 41 | `announcements` | System announcements |
| 42 | `system_settings` | Key-value settings |

### Schema Metrics

| Metric | Count |
|--------|-------|
| Total Tables | 42 |
| Columns | 443 |
| Primary Keys | 42 |
| Foreign Keys | 68 |
| Unique Constraints | 29 |
| Non-unique Indexes | 90 |
| CHECK Constraints | 43 |

---

## 🛠️ Tech Stack

### Frontend

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start v1 (React 19, SSR-capable) |
| Routing | TanStack Router (file-based) |
| Data/Caching | TanStack Query |
| Build | Vite 8 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| UI Kit | shadcn/ui (Radix primitives) |
| Charts | Recharts |
| Icons | lucide-react |
| Forms | react-hook-form + zod |
| Toasts | sonner |
| Dates | date-fns, react-day-picker |

### Backend

| Layer | Technology |
|-------|------------|
| Framework | Laravel 12 |
| PHP | 8.2+ |
| Auth | Laravel Sanctum |
| Modules | nwidart/laravel-modules v12 |
| Database | MySQL 8.0+ |
| Queue | Database driver |
| Cache | Database driver |
| Session | Database driver |

### NLP Service

| Layer | Technology |
|-------|------------|
| Framework | FastAPI |
| NLP | spaCy |
| OCR | pytesseract / easyocr |
| Server | uvicorn |
| Models | Custom-trained role-specific NER |

---

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+
- PHP 8.2+
- Composer
- MySQL 8.0+
- Python 3.10+
- Tesseract OCR (OS-level binary)

### Frontend Setup

```bash
cd frontend
npm install
npm run dev        # Start dev server
npm run build      # Production build
npm run lint       # ESLint
npm run format     # Prettier
```

**Environment Variables (`.env`):**
```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

### Backend Setup

```bash
cd backend-laravel
composer install
copy .env.example .env    # Windows
# cp .env.example .env    # Linux/Mac
php artisan key:generate
php artisan migrate
php artisan serve
```

**Composer Scripts:**
```bash
composer run setup   # Full setup (install, env, migrate, npm)
composer run dev     # Run server + queue + logs + vite concurrently
composer run test    # Run tests
```

**Environment Variables (`.env`):**
```env
APP_NAME=HRMS
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=hotel_hr
DB_USERNAME=root
DB_PASSWORD=

MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=
MAIL_PASSWORD=
```

### NLP Service Setup

```bash
cd nlp-service
python -m venv venv
venv\Scripts\activate     # Windows
# source venv/bin/activate  # Linux/Mac

pip install fastapi uvicorn spacy pytesseract pdf2image python-multipart pillow
python -m spacy download en_core_web_sm

uvicorn app.main:app --reload --port 8001
```

### Database Setup

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE hotel_hr CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Import the schema
mysql -u root -p hotel_hr < database/hotel_hr_latest.sql

# Or import seed data
mysql -u root -p hotel_hr < database/kalat/hotel_hr_seed_mysql.sql
```

---

## 🔐 Authentication Flow

### Login Process

```
┌──────────┐                    ┌──────────┐                    ┌──────────┐
│ Frontend │                    │ Laravel  │                    │  Email   │
└────┬─────┘                    └────┬─────┘                    └────┬─────┘
     │  POST /auth/login             │                               │
     │  {email, password}            │                               │
     │──────────────────────────────►│                               │
     │                               │  Validate credentials         │
     │                               │  Generate OTP                 │
     │                               │──────────────────────────────►│
     │                               │         Send OTP email        │
     │  {login_token, debug_otp}     │                               │
     │◄──────────────────────────────│                               │
     │                               │                               │
     │  POST /auth/otp/verify        │                               │
     │  {login_token, otp}           │                               │
     │──────────────────────────────►│                               │
     │                               │  Verify OTP                   │
     │                               │  Create Sanctum token         │
     │  {token, user}                │                               │
     │◄──────────────────────────────│                               │
     │                               │                               │
     │  Authenticated requests       │                               │
     │  Authorization: Bearer {token}│                               │
     │──────────────────────────────►│                               │
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/auth/login` | POST | Login with email/password |
| `/v1/auth/otp/verify` | POST | Verify OTP |
| `/v1/auth/otp/resend` | POST | Resend OTP |
| `/v1/auth/forgot-password` | POST | Request password reset |
| `/v1/auth/reset-password` | POST | Reset password with token |
| `/v1/auth/me` | GET | Get current user |
| `/v1/auth/logout` | POST | Logout |

### Roles

| Role | Access Level |
|------|--------------|
| `super_admin` | Full access to all modules |
| `admin` | All except User Management & Audit Logs |
| `employee` | Personal portal only |

---

## 📡 API Endpoints

### Applicant Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/applicants` | GET | List applicants |
| `/v1/applicants` | POST | Create applicant |
| `/v1/applicants/{id}` | GET | Get applicant |
| `/v1/applicants/{id}` | PUT | Update applicant |
| `/v1/applicants/{id}` | DELETE | Delete applicant |
| `/v1/applicants/{id}/hire` | POST | Advance to Offer/Hired |
| `/v1/applicants/stats` | GET | Get statistics |
| `/v1/interviews` | GET/POST | List/create interviews |
| `/v1/interviews/{id}` | PUT/DELETE | Update/delete interview |
| `/v1/assessments` | GET | List assessments |
| `/v1/applicants/{id}/assessments` | POST | Create assessment |

### Recruitment Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/job-posts` | GET/POST | List/create job posts |
| `/v1/job-posts/{id}` | GET/PUT/DELETE | CRUD job post |
| `/v1/job-posts/{id}/toggle` | PATCH | Toggle active status |
| `/v1/job-posts/{id}/publish` | POST | Publish to platforms |
| `/v1/job-posts/stats` | GET | Get statistics |
| `/v1/requisitions` | GET/POST | List/create requisitions |
| `/v1/requisitions/{id}` | GET/PUT | Get/update requisition |
| `/v1/requisitions/{id}/convert` | POST | Convert to job post |

### Core HCM

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/employees` | GET/POST | List/create employees |
| `/v1/employees/{id}` | GET/PUT/DELETE | CRUD employee |
| `/v1/employees/{id}/regularize` | POST | Regularize employee |
| `/v1/employees/{id}/promote` | POST | Promote employee |
| `/v1/employees/{id}/exit` | POST | Process exit |
| `/v1/departments` | GET/POST | List/create departments |
| `/v1/departments/{id}` | PUT/DELETE | Update/delete |
| `/v1/positions` | GET/POST | List/create positions |
| `/v1/positions/{id}` | PUT/DELETE | Update/delete |
| `/v1/salary-grades` | GET | List salary grades |
| `/v1/org-chart` | GET | Get org chart |
| `/v1/hr3-recommendations` | GET | List HR3 recommendations |

### New Hire Onboarding

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/new-hires` | GET/POST | List/create new hires |
| `/v1/new-hires/{id}` | GET/PUT/DELETE | CRUD new hire |
| `/v1/new-hires/{id}/promote-stage` | POST | Promote to next stage |
| `/v1/new-hires/stats` | GET | Get statistics |
| `/v1/checklist-templates` | GET/POST | List/create templates |
| `/v1/checklist-templates/{id}` | GET/PUT/DELETE | CRUD template |
| `/v1/checklist-templates/{id}/items` | POST | Add item |
| `/v1/checklist-items/{id}` | PUT/DELETE | Update/delete item |
| `/v1/onboarding-items/{id}/toggle` | PATCH | Toggle item done |
| `/v1/checklist-requests` | GET/POST | List/create requests |
| `/v1/checklist-requests/{id}/approve` | POST | Approve request |
| `/v1/checklist-requests/{id}/reject` | POST | Reject request |

### User Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/users` | GET/POST | List/create users |
| `/v1/users/{id}` | GET/PUT/DELETE | CRUD user |
| `/v1/users/{id}/login-activity` | GET | Get login history |
| `/v1/roles` | GET/POST | List/create roles |
| `/v1/roles/{id}` | GET/PUT/DELETE | CRUD role |
| `/v1/roles/{id}/permissions` | GET/PUT | Get/update permissions |

### Settings & Audit

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/settings` | GET | Get all settings |
| `/v1/settings/{key}` | GET/PUT/DELETE | CRUD setting |
| `/v1/settings/bulk` | PATCH | Bulk upsert settings |
| `/v1/system-users` | GET | List system users |
| `/v1/reset-default-password` | POST | Reset default password |
| `/v1/my/settings` | GET | Get user settings |
| `/v1/my/settings/{scope}` | PUT | Save user settings |
| `/v1/my/change-password` | POST | Change password |
| `/v1/audit-logs` | GET | List audit logs |

---

## 🎨 Design System

### Color Palette

| Token | Usage |
|-------|-------|
| `--primary` | Burgundy primary color |
| `--gold` | Gold accent |
| `--success` | Success states |
| `--caution` | Warning states |
| `--border` | Border colors |
| `--card` | Card backgrounds |
| Cream/Beige | Background surfaces |

### Typography

- **Display font**: For headings (`font-display`)
- **Body font**: Clean sans-serif for body text
- **Eyebrow utility**: Small uppercase labels for sections

### Surfaces

- Rounded cards (12px radius)
- Soft `border-border/70` outlines
- Subtle shadows
- Generous spacing

### Rules

- Never hardcode color utilities (`text-white`, `bg-black`, `bg-[#...]`)
- Use tokens and shadcn variants
- Dark mode supported via CSS tokens

---

## 📊 Current Status

### ✅ Completed

- [x] Frontend UI (all pages clickable and stateful)
- [x] Laravel modular structure (12 modules)
- [x] Database schema (42 tables)
- [x] Authentication with OTP
- [x] API integration layer
- [x] Applicant Management API
- [x] Recruitment Management API
- [x] New Hire Onboarding API
- [x] Core HCM API
- [x] User Management API
- [x] Settings API
- [x] Audit Log API

### 🚧 In Progress / Not Yet Implemented

- [ ] NLP service (only health check endpoint exists)
- [ ] Real file uploads (resumes, documents)
- [ ] Email/notification delivery
- [ ] Reports and exports
- [ ] Docker compose setup
- [ ] Real-time features

---

## 👥 Suggested 3-Dev Split

| Dev | Owns |
|-----|------|
| **Dev A** | ApplicantManagement + RecruitmentManagement (Laravel) + connecting the public job-application flow on the frontend |
| **Dev B** | CoreHCM + EmployeeSelfService + EmployeeRecords (Laravel) + NewHireOnboarding, plus UserManagement/roles setup |
| **Dev C** | nlp-service (Python: OCR, spaCy NER, scoring) + NlpService integration class in Laravel + Docker/deployment |

This splits along subsystem boundaries, keeps the ML-heavy work isolated to one person, and means Dev A/B rarely touch the same files.

---

## 📝 Build Order (Recommended)

> Don't build modules in isolation — build vertically.

1. **Auth + roles + Users table** (whole team needs this first)
2. **Core HCM**: Employee, Department, Position tables — everything else references Employee
3. **Applicant Management**: Applicant, Resume upload endpoint (stub NLP call with dummy data first)
4. **NLP service**: OCR + NER working standalone, tested via Postman
5. **Wire NLP service** into the resume upload flow for real
6. **Recruitment Management**: job postings, interview scheduling
7. **New Hire Onboarding**: triggered on "hired" status
8. **ESS + Employee Records**
9. **Audit logs + Settings** last — they hook into everything else via events, easiest to bolt on at the end

---

## 📚 Additional Resources

### Reference Files

| File | Description |
|------|-------------|
| `reference/info.txt` | System scope and subsystem hierarchy |
| `reference/pages&techstack.txt` | Pages per role and tech stack summary |
| `reference/HRMS Backend Setup Guide.txt` | Detailed backend setup guide |
| `database/kalat/hotel_hr_database_prd.md` | Database PRD specification |
| `database/kalat/hotel_hr_database_table_inventory.txt` | Table inventory |

### Git Workflow

```
main (stable) → develop (integration) → feature/module-name branches
```

Each dev works only inside their assigned Module folder to keep merge conflicts minimal.

---

## 📄 License

This project is developed for Oxford Suites Makati as part of a 4th year academic requirement.

---

*Last Updated: August 21, 2026*