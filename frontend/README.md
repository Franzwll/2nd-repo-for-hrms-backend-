# Oxford Suites Makati — Human Resource Management System (HRMS)

A web-based HRMS for **Oxford Suites Makati**, a hotel property in Makati City, Philippines. The system combines a public-facing careers site with three role-based internal portals covering recruitment, onboarding, core HR, employee records, and employee self-service.

> **Status: interactive front-end prototype.** Every screen is fully clickable and stateful, but all data comes from in-memory TypeScript fixtures under `src/data/`. There is no database and no real authentication yet — refreshing the page resets any changes.

---

## Table of contents

1. [Overview](#1-overview)
2. [Tech stack](#2-tech-stack)
3. [Roles and demo accounts](#3-roles-and-demo-accounts)
4. [Site map](#4-site-map)
5. [Module reference](#5-module-reference)
6. [Data model](#6-data-model)
7. [Project structure](#7-project-structure)
8. [Design system](#8-design-system)
9. [Running the project](#9-running-the-project)
10. [Current limitations and next steps](#10-current-limitations-and-next-steps)

---

## 1. Overview

The system serves two audiences:

- **Public visitors and job seekers** — browse the property, read FAQs, contact HR, view open vacancies, and open a detailed job page. A floating chatbot assists on public pages.
- **Internal staff** — sign in to a role-scoped portal. HR admins run recruitment end to end (applicant screening, interview scheduling, assessment, job posting, requisitions, onboarding), maintain departments and 201 files, and process employee self-service requests. Super Admins additionally manage portal accounts, permissions, and the system audit trail. Employees get a personal portal for attendance, schedule, leave, payroll, benefits, and requests.

A shared announcement system lets admins broadcast messages to a chosen audience; announcements surface both on dashboards and in a megaphone panel in the portal header.

---

## 2. Tech stack

| Layer | Choice |
| --- | --- |
| Framework | TanStack Start v1 (React 19, SSR-capable) |
| Routing | TanStack Router — file-based, `src/routes/` |
| Data/caching | TanStack Query |
| Build tool | Vite |
| Language | TypeScript (strict), path alias `@/` → `src/` |
| Styling | Tailwind CSS v4 with theme tokens in `src/styles.css` |
| UI kit | shadcn/ui on Radix primitives (`src/components/ui/`) |
| Charts | Recharts |
| Icons | lucide-react |
| Forms / validation | react-hook-form + zod |
| Toasts | sonner |
| Dates | date-fns, react-day-picker |

### Scripts

```sh
npm run dev        # start the dev server
npm run build      # production build
npm run build:dev  # development-mode build
npm run preview    # preview the production build
npm run lint       # eslint
npm run format     # prettier
```

---

## 3. Roles and demo accounts

Role metadata lives in `src/lib/nav.ts` (`roleMeta`, `navForRole`).

| Role | Demo user | Base path |
| --- | --- | --- |
| Super Admin | Bullseur Santiago (BS) | `/superadmin` |
| Admin | Juan Dela Cruz (JD) | `/admin` |
| Employee | Kevin Dela Cruz (KD) | `/employee` |

**Access differences**

- **Super Admin** — everything: Dashboard, Recruitment & Onboarding, Core HCM, Employee Records, ESS Management, User Management, Audit Logs, Settings. Only Super Admin can delete announcements and open ESS Administration / Audit & Compliance tabs.
- **Admin** — same as Super Admin minus User Management and Audit Logs.
- **Employee** — Dashboard, ESS, Onboarding, Profile, Settings.

The login screen is currently a role picker: choosing a role routes into the matching portal. No credentials are verified.

---

## 4. Site map

### Public site (`PublicShell` + `Chatbot`)

| Route | Page |
| --- | --- |
| `/` | Home — property hero, highlights, featured vacancies |
| `/about` | About the property |
| `/faq` | Frequently asked questions |
| `/contact` | Contact HR |
| `/jobs` | Open vacancies listing with filters |
| `/jobs/$jobId` | Job detail and application entry point |
| `/login` | Portal sign-in / role selection |

### Super Admin portal (`/superadmin`)

| Route | Page |
| --- | --- |
| `/superadmin` | System Dashboard |
| `/superadmin/applicants` | Applicant Management |
| `/superadmin/recruitment` | Recruitment Management |
| `/superadmin/onboarding` | New Hire Onboarding |
| `/superadmin/hcm` | Core HCM |
| `/superadmin/employees` | Employee Records |
| `/superadmin/ess` | ESS Management |
| `/superadmin/users` | User Management |
| `/superadmin/audit` | Audit Logs |
| `/superadmin/profile` | Profile |
| `/superadmin/settings` | Settings |

### Admin portal (`/admin`)

`/admin`, `/admin/applicants`, `/admin/recruitment`, `/admin/onboarding`, `/admin/hcm`, `/admin/employees`, `/admin/ess`, `/admin/profile`, `/admin/settings`.

### Employee portal (`/employee`)

`/employee`, `/employee/ess`, `/employee/onboarding`, `/employee/profile`, `/employee/settings`.

All portal routes render inside `PortalShell` (collapsible sidebar, search, announcements panel, notification bell, role switcher, user menu).

---

## 5. Module reference

### Applicant Management — `src/components/modules/ApplicantManagement.tsx`

The largest module. Three tabs:

- **Ranking & Applicants** — resume-screening results with a fit score per candidate (`fit`, `other-role`, `credential`, `not-fit`), filters by vacancy and status, a candidate ranking table, and a height-aligned "Top 5 candidates today" card. Opening a candidate shows parsed resume data, criteria matches, and actions.
- **Interview Scheduling** — a two-column enterprise layout:
  - *Interview Calendar*: custom month grid with Previous / Next / Today navigation, per-date states (selected, booked, suggested, unavailable), interview-count badges, a legend, and a list of that day's interviews as compact cards (time, applicant, position, interviewer, quick action).
  - *Book an Interview*: numbered workflow — 1) Select applicant, 2) Choose date (pill buttons for suggested dates), 3) Select time slot (pill buttons), 4) Interview details (mode and interviewer dropdowns), an info panel showing location or meeting link, and a full-width **Confirm & send invitation** button.
  - Below both: a full-width *Scheduled Interviews* table (applicant, position, schedule, mode, status).
- **Assessment** — scoring against defined assessment criteria and a recommendation outcome.

### Recruitment Management — `RecruitmentManagement.tsx`

- **Vacancies & Postings** — job list with status (`Open`, `Closed`, `Draft`), applicant counts, and publishing channels.
- **Job Post Builder** — compose a posting: title, department, employment type, salary range, responsibilities, qualifications, and preview.
- **Requisitions** — manpower requisition queue backed by a subscribable store, with approve/reject flow.

### New Hire Onboarding — `NewHireOnboarding.tsx`

Pipeline across three stages: **Pre-onboarding → Probationary → Regular**. Each stage has its own checklist. Promoting a hire to the next stage issues a **fresh checklist that starts at 0% complete**, so progress never carries over between stages. Shows per-hire progress, documents, and stage timeline.

### Core HCM — `CoreHCM.tsx`

- **Departments** — Front Office, Food & Beverage, Kitchen / Culinary, Housekeeping, and more, each with a head, staff count, open requisitions, and budget. The **first department is selected by default**.
- **Positions** — collapsible position groups. Expanding a position lists its members in a single row: avatar, name, employee ID, department, position, employment type + status badge, and a per-member **Transfer** button.
- **Organizational chart** — hierarchical view from the General Manager down.
- There is no separate "View roster" dialog; the member list inside each position replaced it.

### Employee Records — `EmployeeRecords.tsx`

- **Employee List** — searchable, filterable directory with export.
- **Record History** — change trail on employee records.
- **201 file dialog** — Personal Information, Documents, Employment History tabs, plus certificate and report generation.

### ESS Management (admin) — `EssManagement.tsx`

- **Request Queue** — all employee self-service requests with category, urgency, and approve/decline actions.
- **ESS Administration** *(Super Admin only)* — request categories, routing, and policy configuration.
- **Audit & Compliance** *(Super Admin only)* — request audit trail.

### Employee ESS — `EmployeeEss.tsx`

Personal tabs: **Attendance**, **Schedule**, **Leave** (balances and filing), **Payroll** (payslips and breakdown), **Benefits**, and **My Requests**.

### User Management — `AdminModules.tsx`

- **User List** — portal accounts with role, status (Active / Suspended), and last login.
- **Permission Matrix** — per-module permission levels per role and per permission group.
- **Authentication & Login Security** — password policy, failed-attempt lockout, default password.

### Audit Logs — `AdminModules.tsx`

Full system activity trail: actor, action, module, timestamp, and severity (`Info`, `Warning`, `Critical`), with filters.

### Settings — `AdminModules.tsx`

Two-pane vertical-tab layout designed so every card fits the viewport without page scrolling:

- **Notifications** — email, browser, and system-announcement toggles.
- **Preferences** — theme, language, date/time format, timezone.
- **Company** *(admin roles)* — company name, email, contact, operating hours, address.
- **Backup & Restore** — backup progress and a scroll-contained backup history table.

### Announcements — `portal-state.tsx`, `AnnouncementDialog.tsx`, `AnnouncementsCard.tsx`, `PortalShell.tsx`

- Audiences: **All**, **Employee**, **Admin**, **Super Admin**; `isVisibleTo(audience, role)` decides visibility.
- Creating an announcement also raises a notification.
- Announcements appear on role dashboards and in a **megaphone panel in the portal header** with an unread-style count badge.
- **Only Super Admin can delete announcements**, both on the card and in the header panel.

---

## 6. Data model

All fixtures live in `src/data/`.

| File | Exports |
| --- | --- |
| `hr.ts` | `Department`, `departments`, `Position`, `positions`, `OrgNode`, `orgChart`, `NewHire`, `newHires`, `Employee`, `employees` |
| `applicants.ts` | `Applicant`, `ApplicantStatus`, `statusMeta`, `applicants`, `screeningCriteria`, `interviewers`, `Interview`, `interviews`, `assessmentCriteria` |
| `jobs.ts` | `Job`, `JobStatus`, `jobs`, `getJob(id)`, `peso(n)` currency formatter |
| `users.ts` | `SystemUser`, `roleLabels`, `systemUsers`, `permissionModules`, `permissionLevels`, `defaultMatrix`, `permissionGroups`, `roleGroupMatrix`, `AuditEntry`, `auditLogs` |
| `ess.ts` | `ESSRequest`, `essRequests`, `requestCategories`, `myProfile`, `myAttendance`, `mySchedule`, `myLeaveBalances`, `myPayroll`, `myBenefits` |
| `requisitions.ts` | `Requisition`, `requisitionStore` (subscribable), `useRequisitions()` |
| `company.ts` | `company`, `facilities`, `systemModules`, `announcements`, `faqs` |

**Runtime stores**

- `src/components/portal/portal-state.tsx` — a small publish/subscribe store holding announcements and notifications, exposed via `usePortalState()` (`markRead`, `markAllRead`, `addAnnouncement`, `removeAnnouncement`, `unreadCount`).
- `src/data/requisitions.ts` — `useSyncExternalStore`-backed requisition store shared across recruitment screens.

Both are in-memory only.

---

## 7. Project structure

### Full file tree

```text
.
├── .lovable/                       Lovable project metadata
│   ├── plan/                       archived implementation plans
│   └── project.json
├── .prettierrc / .prettierignore   formatting rules
├── AGENTS.md                       agent/contributor guidelines
├── README.md                       this document
├── bun.lock / bunfig.toml          Bun lockfile and config
├── components.json                 shadcn/ui generator config
├── eslint.config.js                lint rules
├── package.json                    dependencies and scripts
├── tsconfig.json                   TypeScript config, `@/` → `src/`
├── vite.config.ts                  Vite + TanStack Start + Tailwind plugins
├── public/
│   ├── favicon.png
│   └── robots.txt
└── src/
    ├── router.tsx                  creates the router with a QueryClient context
    ├── routeTree.gen.ts            auto-generated route tree — never edit
    ├── server.ts                   SSR / server entry
    ├── start.ts                    client start config
    ├── styles.css                  Tailwind v4 theme tokens and utilities
    ├── assets/
    │   ├── hero-oxford-suites.jpg  public homepage hero image
    │   ├── login-hospitality.jpg   login split-screen image
    │   ├── login-hero.jpg.asset.json
    │   ├── oxford-logo.png.asset.json
    │   └── oxford-mark.png.asset.json
    ├── components/
    │   ├── brand/
    │   │   └── Logo.tsx            Oxford Suites wordmark and mark
    │   ├── modules/                one file per HRMS module
    │   │   ├── AdminModules.tsx        User Management, Audit Logs, Settings
    │   │   ├── ApplicantManagement.tsx ranking, interview scheduling, assessment
    │   │   ├── CoreHCM.tsx             departments, positions, org chart
    │   │   ├── EmployeeEss.tsx         employee-side self-service tabs
    │   │   ├── EmployeeRecords.tsx     employee list, history, 201 file
    │   │   ├── EssManagement.tsx       admin request queue and compliance
    │   │   ├── NewHireOnboarding.tsx   pre-onboarding → probationary → regular
    │   │   ├── ProfilePage.tsx         shared profile page for all roles
    │   │   └── RecruitmentManagement.tsx vacancies, post builder, requisitions
    │   ├── portal/
    │   │   ├── AnnouncementDialog.tsx  compose an announcement with audience
    │   │   ├── AnnouncementsCard.tsx   dashboard announcements list
    │   │   ├── PageHeader.tsx          module title/description header
    │   │   ├── PortalShell.tsx         sidebar, header, notifications, role menu
    │   │   ├── StatCard.tsx            KPI tile used on dashboards
    │   │   └── portal-state.tsx        in-memory announcement/notification store
    │   ├── public/
    │   │   ├── Chatbot.tsx             floating FAQ assistant on public pages
    │   │   └── PublicShell.tsx         public site header and footer
    │   └── ui/                     48 shadcn/ui primitives (accordion, alert,
    │                               alert-dialog, aspect-ratio, avatar, badge,
    │                               breadcrumb, button, calendar, card, carousel,
    │                               chart, checkbox, collapsible, command,
    │                               context-menu, dialog, drawer, dropdown-menu,
    │                               form, hover-card, input, input-otp, label,
    │                               menubar, navigation-menu, pagination, popover,
    │                               progress, radio-group, resizable, scroll-area,
    │                               select, separator, sheet, sidebar, skeleton,
    │                               slider, sonner, switch, table, tabs, textarea,
    │                               toggle, toggle-group, tooltip)
    ├── data/
    │   ├── applicants.ts           applicants, screening criteria, interviews
    │   ├── company.ts              company info, facilities, modules, FAQs
    │   ├── ess.ts                  ESS requests, attendance, payroll, benefits
    │   ├── hr.ts                   departments, positions, org chart, employees
    │   ├── jobs.ts                 job postings, `getJob()`, peso formatter
    │   ├── requisitions.ts         requisition type + subscribable store
    │   └── users.ts                system users, permissions, audit log entries
    ├── hooks/
    │   └── use-mobile.tsx          responsive breakpoint hook
    ├── lib/
    │   ├── error-capture.ts        global runtime error capture
    │   ├── error-page.ts           error page rendering helper
    │   ├── lovable-error-reporting.ts  reports errors to the editor
    │   ├── nav.ts                  roles, `roleMeta`, `navForRole()` sidebar nav
    │   └── utils.ts                `cn()` class merge helper
    └── routes/
        ├── README.md               routing conventions cheat sheet
        ├── __root.tsx              app shell, head defaults, Toaster
        ├── index.tsx               `/` public home
        ├── about.tsx               `/about`
        ├── faq.tsx                 `/faq`
        ├── contact.tsx             `/contact`
        ├── login.tsx               `/login` role picker
        ├── jobs.index.tsx          `/jobs` vacancy list
        ├── jobs.$jobId.tsx         `/jobs/:jobId` job detail
        ├── admin.tsx               `/admin` layout (PortalShell, admin)
        ├── admin.index.tsx         admin dashboard
        ├── admin.applicants.tsx    admin Applicant Management
        ├── admin.recruitment.tsx   admin Recruitment Management
        ├── admin.onboarding.tsx    admin New Hire Onboarding
        ├── admin.hcm.tsx           admin Core HCM
        ├── admin.employees.tsx     admin Employee Records
        ├── admin.ess.tsx           admin ESS Management
        ├── admin.settings.tsx      admin Settings
        ├── admin.profile.tsx       admin Profile
        ├── superadmin.tsx          `/superadmin` layout
        ├── superadmin.index.tsx    system dashboard
        ├── superadmin.applicants.tsx
        ├── superadmin.recruitment.tsx
        ├── superadmin.onboarding.tsx
        ├── superadmin.hcm.tsx
        ├── superadmin.employees.tsx
        ├── superadmin.ess.tsx
        ├── superadmin.users.tsx    User Management (Super Admin only)
        ├── superadmin.audit.tsx    Audit Logs (Super Admin only)
        ├── superadmin.settings.tsx
        ├── superadmin.profile.tsx
        ├── employee.tsx            `/employee` layout
        ├── employee.index.tsx      employee dashboard
        ├── employee.ess.tsx        employee self-service
        ├── employee.onboarding.tsx employee onboarding checklist
        ├── employee.settings.tsx
        └── employee.profile.tsx
```

### Directory roles at a glance

| Path | Responsibility |
| --- | --- |
| `src/routes/` | File-based routes: one file per URL; portal layouts wrap children in `PortalShell` |
| `src/components/modules/` | The nine HRMS feature modules, each self-contained and shared across roles via a `role` prop |
| `src/components/portal/` | Internal-portal chrome and the shared announcement/notification store |
| `src/components/public/` | Careers-site chrome and chatbot |
| `src/components/ui/` | Unmodified shadcn/ui primitives; the visual base for everything else |
| `src/data/` | Typed in-memory fixtures — the future database boundary |
| `src/lib/` | Navigation config, class utilities, error handling |
| `src/hooks/` | Reusable React hooks |
| `src/assets/` | Imagery imported directly by components |


---

## 8. Design system

- **Palette** — burgundy primary with cream, beige, gold accent, and white surfaces; a matching dark theme is defined. All colors are semantic tokens (`--primary`, `--gold`, `--success`, `--caution`, `--border`, `--card`, sidebar tokens…) declared in `src/styles.css` and consumed as Tailwind utilities or `var(--color-*)` in charts.
- **Typography** — a display face for headings (`font-display`) paired with a clean body face; a small uppercase `eyebrow` utility labels sections.
- **Surfaces** — rounded cards (12px radius), soft `border-border/70` outlines, subtle shadows, generous spacing.
- **Rule** — never hardcode color utilities such as `text-white`, `bg-black`, or `bg-[#...]` in components; they bypass theming and break dark mode. Use tokens and shadcn variants.

---

## 9. Running the project

Requires Node.js and npm.

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

The dev server prints a local URL. You can also keep building the project in the [Lovable editor](https://lovable.dev), where changes sync straight to the connected repository.

---

## 10. Current limitations and next steps

**Not yet implemented**

- No database — all data is in-memory and resets on refresh.
- No real authentication or authorization; login is a role picker and role checks are client-side only.
- No file uploads (resumes, 201 documents, certificates are simulated).
- No email or notification delivery; invitations and alerts are UI-only.
- Reports, exports, and backups are mocked.

**Recommended next steps**

1. Enable **Lovable Cloud** for a Postgres database, real accounts, and file storage.
2. Move authentication to real sign-in with a separate `user_roles` table and row-level security so role checks are enforced on the server.
3. Migrate fixtures module by module — Applicant Management and Core HCM first, since the rest reference their records.
4. Add server-side actions for interview invitations and announcement broadcasts (email), then wire reporting and exports to real data.
