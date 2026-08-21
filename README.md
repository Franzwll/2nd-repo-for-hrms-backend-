# HRMS — Recruitment, Onboarding & Core HCM

A full-stack Human Resource Management System covering the complete employee lifecycle — from public job seekers and applicants, through onboarding, into day-to-day Core HCM and employee self-service.

The application is split into a **public careers experience** (job listings + an intelligent chatbot assistant) and three **role-based internal portals** (Super Admin, Admin, Employee).

---

## Table of Contents

1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [System Architecture](#system-architecture)
5. [Repository Structure](#repository-structure)
6. [Portals & Roles](#portals--roles)
7. [Getting Started](#getting-started)
8. [Configuration](#configuration)
9. [Scripts](#scripts)
10. [Testing](#testing)
11. [API Overview](#api-overview)
12. [Database](#database)
13. [Contributing](#contributing)
14. [License](#license)

---

## Overview

HRMS streamlines recruitment, onboarding, and workforce management in a single platform:

- **Public side** — a modern careers landing page where candidates can browse open positions, submit applications, and ask an always-available **chatbot** about jobs, the application process, documents, salary and benefits.
- **Internal side** — role-based dashboards that give HR, managers, and employees the tools to run recruitment pipelines, onboard new hires, maintain employee records, and access employee self-service.

Authentication is **email + password with one-time password (OTP) verification**, and all critical actions are tracked in an **audit log**.

---

## Key Features

### Recruitment & Onboarding

- **Job post management** — publish, edit, open/close positions with roles, departments, and salary grades.
- **Applicant pipeline** — submit, track, and screen applications; applicants are scored for role fit.
- **AI-assisted screening** — an NLP microservice (NER model) ranks applicants against the role.
- **Interview & hiring flow** — from application to offer.
- **New-hire onboarding** — structured onboarding checklists, pre-onboarding requirements, and probationary tracking.

### Core HCM

- **Employee records** — departments, positions, salary grades, and employment history.
- **Employee Self-Service (ESS)** — attendance & DTR, leave application with balances, payslips & payroll, document requests/upload, request center with status timelines, work schedule & shift swap, benefits, and performance.
- **User management** — portal accounts with role-based permissions and status control.
- **Audit logs** — a full trail of system activity by severity.
- **Announcements & notifications** — targeted announcements by audience with read tracking.
- **Settings & profiles** — account preferences, notification settings, and password management.

### Platform

- **Intelligent careers chatbot** — intent-aware assistant (jobs, apply, documents, salary, benefits, company info) backed by live data, with an admin-managed **FAQ knowledge base** and automatic logging of unanswered questions.
- **OTP-secured sign-in** — 6-digit one-time password with expiry, resend, and attempt limits.
- **Responsive design** — a polished design system built for desktop and mobile.

---

## Technology Stack

| Layer      | Technology |
| ---------- | ---------- |
| Frontend   | React 19, TypeScript 5.8, TanStack Start (SSR), TanStack Router, TanStack Query, Tailwind CSS 4, shadcn/ui (Radix), Recharts, Sonner |
| Backend    | Laravel 12 (PHP ^8.2), modular architecture under `Modules/`, Sanctum-style bearer auth |
| Database   | MySQL (database: `hotel_hr`) |
| NLP Service| Python FastAPI microservice — NER-based applicant fit scoring |
| Tooling    | Vite 8, ESLint, Prettier, PHPUnit |

---

## System Architecture

```
┌────────────────────────────┐        ┌─────────────────────────────┐
│        Frontend            │  HTTP  │          Backend            │
│  React + TanStack Start    │ ─────► │   Laravel 12 (port 8000)    │
│  (Vite dev on port 8080)   │  JSON  │  REST API under /api/v1     │
└────────────────────────────┘        └──────────────┬──────────────┘
                                                     │
                                    ┌────────────────▼───────────────┐
                                    │        MySQL  (hotel_hr)        │
                                    └─────────────────────────────────┘
                                                     ▲
                                    ┌────────────────┴───────────────┐
                                    │   NLP Service (FastAPI)        │
                                    │   NER fit scoring for          │
                                    │   applicant screening          │
                                    └────────────────────────────────┘
```

The frontend calls the Laravel API at `http://127.0.0.1:8000/api/v1` (override via `VITE_API_BASE_URL`). The backend is organized into feature modules, each with its own controllers, routes, and models.

---

## Repository Structure

```
.
├── frontend/                 # React + TanStack Start application
│   └── src/
│       ├── components/       # UI primitives, portal shell, feature modules
│       ├── routes/           # File-based routing (landing, login, admin, superadmin, employee)
│       ├── lib/              # API client, auth/session, navigation, utilities
│       └── data/             # Seed/fixture data used by some screens
├── backend-laravel/          # Laravel API
│   ├── app/                  # Core application code
│   ├── Modules/              # Feature modules
│   │   ├── Landing/               # Public site + chatbot engine
│   │   ├── Auth/                  # Login + OTP flow
│   │   ├── RecruitmentManagement/ # Job posts & recruitment
│   │   ├── ApplicantManagement/   # Applicant pipeline & screening
│   │   ├── NewHireOnboarding/     # Onboarding workflows
│   │   ├── CoreHCM/               # Core HCM services
│   │   ├── EmployeeRecords/       # Employee records
│   │   ├── EmployeeSelfService/   # ESS (attendance, leave, payroll, docs, etc.)
│   │   ├── UserManagement/        # Portal accounts & roles
│   │   ├── AuditLog/              # Activity audit trail
│   │   ├── Settings/              # System & profile settings
│   │   └── Profile/               # User profiles
│   ├── database/             # Migrations and seeders
│   └── routes/               # Route registration
├── nlp-service/              # FastAPI microservice for NER fit scoring
│   └── app/main.py
└── database/                 # Schema dumps and reference documentation
```

---

## Portals & Roles

| Portal | Path | Audience | Highlights |
| ------ | ---- | -------- | ---------- |
| Public landing | `/` | Everyone | Careers, open jobs, job detail, applicant chatbot |
| Super Admin | `/superadmin` | System-wide oversight | Dashboard analytics, user management, audit logs, settings, chatbot FAQ admin |
| Admin | `/admin` | HR / management | Recruitment, applicants, onboarding, ESS management, announcements |
| Employee | `/employee` | Staff self-service | ESS dashboard, attendance, leave, payslips, documents, requests |

Each portal renders a role-specific dashboard with permission-aware navigation (per-module access is governed by a role/permission matrix).

---

## Getting Started

### Prerequisites

- PHP 8.2+
- Composer
- Node.js 20+
- MySQL 8+ (a database named `hotel_hr` is used by default)
- Python 3.11+ (only if running the NLP service)

### 1. Backend (Laravel API)

```bash
cd backend-laravel

# Install dependencies
composer install

# Environment configuration
cp .env.example .env        # or use your existing .env
# Set DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD in .env

# Run migrations and seeders
php artisan migrate --seed

# Start the API server (default: http://127.0.0.1:8000)
php artisan serve
```

> **Note:** if a migration fails with "table already exists" (e.g., pre-existing tables in the live database), run the migration explicitly with its path instead:
>
> ```bash
> php artisan migrate --path=database/migrations/<file>.php
> ```

### 2. Frontend (React + TanStack Start)

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server (default: http://localhost:8080)
npm run dev
```

### 3. NLP Service (optional — applicant screening)

```bash
cd nlp-service
python -m venv .venv
.venv\Scripts\activate       # Windows; use `source .venv/bin/activate` on macOS/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --port 9000
```

### 4. Sign in

Open the frontend at `http://localhost:8080`, sign in with a seeded account, and enter the 6-digit OTP emailed by the API (the current OTP is also returned in the login response as `debug_otp` for development).

---

## Configuration

| Variable | Where | Default | Purpose |
| -------- | ----- | ------- | ------- |
| `VITE_API_BASE_URL` | `frontend/.env` | `http://127.0.0.1:8000/api/v1` | Backend API base URL |
| `DB_*` | `backend-laravel/.env` | `hotel_hr` / `root` | MySQL connection settings |
| `APP_URL` | `backend-laravel/.env` | `http://localhost` | Application URL for generated links |

---

## Scripts

### Frontend

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Start the Vite dev server (port 8080) |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |

### Backend

| Command | Description |
| ------- | ----------- |
| `php artisan serve` | Start the API server (port 8000) |
| `php artisan migrate` | Run database migrations |
| `php artisan db:seed` | Seed the database |
| `php artisan test` | Run the PHPUnit test suite |

---

## Testing

The backend ships a PHPUnit suite covering API endpoints and service logic.

```bash
cd backend-laravel
php artisan test
```

Frontend type-safety and style are enforced with TypeScript and ESLint:

```bash
cd frontend
npx tsc -b
npm run lint
```

---

## API Overview

All endpoints are namespaced under `/api/v1` and most require a bearer token (obtained through the login + OTP flow).

| Area | Example endpoints |
| ---- | ----------------- |
| Auth | `POST /auth/login`, `POST /auth/otp/verify`, `POST /auth/otp/resend`, `POST /auth/logout` |
| Public / landing | `GET /landing/jobs`, `POST /landing/chat` (chatbot) |
| Chatbot FAQ | `GET/POST/PUT/DELETE /chatbot/faqs` (admin-only) |
| Recruitment | `GET/POST/PUT/DELETE /job-posts`, `GET/POST /applicants`, `GET /applicants/{id}/screen` |
| Onboarding | `GET/POST /onboarding/...` |
| Core HCM / ESS | `GET/POST /employees`, `GET /my/...`, `GET /ess/...` |
| System | `GET /dashboard/stats`, `GET /users`, `GET /audit/...`, `GET/POST /announcements`, `GET/PUT /my/settings` |

> The chatbot endpoint is public; management endpoints are permission-guarded by role.

---

## Database

The system uses a MySQL database (`hotel_hr`). Schema dumps and reference documentation live in the `database/` directory:

- `database/kalat/` — full schema dumps (MySQL / PostgreSQL variants)
- `database/EMPLOYEE_ESS_MAPPING.md` — mapping of employees to ESS data
- `database/REVIEW-FINDINGS.md` — schema and data review notes

Migrations are versioned under `backend-laravel/database/migrations/`.

---

## Contributing

1. Create a feature branch and commit focused changes.
2. Run the test suite and type checks before submitting.
3. Keep the connected branch in a working state — history on shared branches should not be rewritten once pushed.

---

## License

Proprietary. All rights reserved.