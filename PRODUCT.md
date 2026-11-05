# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- **Public Job Seekers & Applicants**: Candidates browsing active job openings, submitting application details and resumes, and interacting with the intelligent FAQ/careers chatbot.
- **HR & Recruitment Admins / Super Admins**: HR staff and executives managing end-to-end recruitment pipelines, AI-assisted screening, interview schedules, pre-onboarding checklists, probationary evaluations, organizational structures, salary grades, employee records, and audit logs.
- **Employees (Employee Self-Service / ESS)**: Active staff managing daily attendance / DTR, leave requests and balances, payslips and compensation summaries, shift swap requests, document requests, announcements, and personal profiles.

## Product Purpose
A complete Human Resource Management System (HRMS) covering the entire workforce lifecycle: attracting talent through modern public careers and conversational discovery, streamlining applicant screening and onboarding, and empowering internal staff with frictionless daily HCM self-service.

## Positioning
An integrated, end-to-end HR platform combining public-facing conversational discovery (AI chatbot and automated NER resume/applicant fit scoring) with enterprise-grade operational rigor (multi-role access control, OTP-secured authentication, full audit trails, and modular HCM self-service).

## Operating Context
- Operational workflows spanning desktop admin workstations (HR desks, recruitment management) and mobile-friendly employee self-service (shift checks, attendance, clock-in, leave requests).
- High accountability environment requiring traceable actions: role-based access, OTP sign-in, status change histories, and audit logging categorized by severity.
- Hospitality industry operational constraints: flexible shift schedules, shift swaps, probationary tracking, and departmental hierarchies.

## Capabilities and Constraints
- **Capabilities**:
  - Public job board with search, filters, application submission, and 24/7 intelligent recruitment chatbot.
  - Applicant tracking system (ATS) with AI NER role-fit scoring, status pipelines, and interview scheduling.
  - Onboarding pipeline with structured checklists and pre-employment requirements.
  - Core HCM: Employee directory, departments, positions, salary grades, and employment status tracking.
  - Employee Self-Service: Attendance/DTR tracking, leave management with live balance calculation, payslip views, shift swap workflow, and document requests.
  - Governance: Super Admin, Admin, and Employee roles, OTP verification, notification center, and comprehensive audit trail.
- **Technical Constraints**:
  - Frontend: React 19, TypeScript 5.8, TanStack Start (SSR), TanStack Router, TanStack Query, Tailwind CSS 4, shadcn/ui (Radix primitives).
  - Backend: Laravel 12 REST API under `/api/v1` with modular architecture (`Modules/`).
  - Database: MySQL (`hotel_hr`).
  - AI Service: Python FastAPI NER microservice for candidate scoring.

## Brand Commitments
- Professional, trustworthy, and modern hospitality enterprise interface.
- Clean visual hierarchy distinguishing public recruitment from dense operational dashboard data.
- UI built on Tailwind CSS 4 and shadcn/ui components with consistent spacing and contrast standards.

## Evidence on Hand
- Full-stack codebase with frontend routes under `frontend/` (TanStack Router routes, shadcn/ui components).
- Database schema: `hotel_hr (oct 31).sql` and `applicant table.txt`.
- Architecture & module documentation: `README.md` and `docs/`.

## Product Principles
1. **Clarity Over Clutter**: Dense administrative data (DTR logs, applicant tables, employee lists) must remain scannable, sortable, and high-contrast without sacrificing accessibility.
2. **Frictionless Candidate & Employee Journey**: Public application workflows and employee self-service actions (clocking in, requesting leave, checking payslips) must require minimal taps/clicks and provide instant feedback.
3. **Accountability & Integrity by Default**: High-impact administrative actions (hiring status changes, leave approvals, salary updates) must provide clear confirmation, feedback states, and audit trails.
4. **Adaptive Scannability**: Interfaces adapt gracefully across desktop administrative views and on-the-go mobile viewports for employees on shift.

## Accessibility & Inclusion
- Adherence to WCAG 2.1 AA standards for contrast, keyboard navigation, and semantic HTML form elements.
- Accessible dialogs, sheets, and popovers using Radix UI primitives with clear ARIA attributes and focus management.

