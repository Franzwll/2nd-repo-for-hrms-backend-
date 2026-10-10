# HRMS Implementation Plan

## Project Overview
**Stack**: TanStack Start (React 19) + Laravel Backend + Tailwind CSS v4 + Radix UI
**Theme**: "Crimson & Ivory" (Light) / "Espresso & Champagne" (Dark) design system
**Current State**: Dark mode, glassmorphism, parallax scrolling, skeleton loading, chart animations, sortable tables, pagination, tabs already implemented

---

## Phase 1: Core UI/UX Enhancements (Week 1-2)

### 1.1 Dark Mode - COMPLETED ✅
- **Status**: Fully implemented in `styles.css` (lines 123-175)
- **Theme**: "Espresso & Champagne" with semantic color tokens
- **Features**: OS preference detection, localStorage persistence, system listener
- **Files**: `src/lib/theme.ts`, `src/styles.css`

### 1.2 Glassmorphism - COMPLETED ✅
- **Status**: Implemented via `@utility glass` and `@utility glass-strong` in `styles.css` (lines 240-252)
- **Component**: `GlassCard` component (`src/components/ui/glass-card.tsx`) with 3 intensities
- **Usage**: Landing hero, login cards, dropdowns, dialogs

### 1.3 Parallax Scrolling - COMPLETED ✅
- **Status**: Implemented in `ParallaxHero` (`src/components/public/ParallaxHero.tsx`)
- **Hook**: `useParallax` (`src/hooks/use-parallax.ts`) with 3 depth layers
- **Features**: Reduced-motion support, mobile disable, rAF-based smooth animation
- **Current**: Landing page only

**Action Items**:
- [ ] Extend parallax to other marketing sections (about, contact, facilities)
- [ ] Add scroll-triggered animations for content reveal (already have `Reveal` component)

---

## Phase 2: Landing Page & Authentication (Week 2-3)

### 2.1 Landing Page - PARTIALLY COMPLETED
**Current**: `src/routes/_landing/index.tsx` with hero, highlights, facilities, featured jobs
**Missing**:
- [ ] SEO enhancements: JSON-LD structured data for JobPosting, Organization
- [ ] Sitemap.xml generation
- [ ] Robots.txt
- [ ] Open Graph / Twitter Card images (dynamic)
- [ ] Performance: Image optimization (WebP/AVIF), lazy loading
- [ ] Accessibility audit (WCAG 2.1 AA)

### 2.2 Login Page - COMPLETED ✅
**Current**: `src/routes/_login/login.tsx` with:
- Ken Burns montage background
- Turnstile CAPTCHA
- FloatingInput with password toggle
- OTP flow (email/TOTP)
- Role-based redirect (Super Admin / Admin / Employee)
- Preloader with progress bar

**Missing**:
- [ ] "Remember me" functionality
- [ ] Social login (Google, Microsoft) - if required
- [ ] Brute force protection UI feedback
- [ ] Session management dashboard

### 2.3 SEO - PARTIALLY COMPLETED
**Current**: Meta tags in route `head()` functions
**Required for ALL modules** (HCM, App Man, Recruitment, ESS):
- [ ] Dynamic meta tags per route
- [ ] JSON-LD structured data
- [ ] Canonical URLs
- [ ] Hreflang for multi-language (Filipino, Chinese, Bisaya)
- [ ] Sitemap generation (static + dynamic routes)

---

## Phase 3: Shared Formatting Components (Week 3-4)

### 3.1 Sortable Table - PARTIALLY COMPLETED
**Current**: Basic `Table` component (`src/components/ui/table.tsx`) - no sorting
**Required**: Column sorting (asc/desc/multi), visual indicators
**Files to modify**: `table.tsx`, create `useTableSort` hook

### 3.2 Pagination - COMPLETED ✅
**Current**: `TablePagination` (`src/components/ui/table-pagination.tsx`) with:
- Page window logic (1 … 4 5 6 … 12)
- Page size selector (10/25/50)
- Range label ("Showing X–Y of Z")
- Keyboard accessible

### 3.3 Tabs - COMPLETED ✅
**Current**: `Tabs` (`src/components/ui/tabs.tsx`) with Radix UI
- Active state styling with primary color
- Focus visible rings
- Responsive wrapping

### 3.4 Button Positioning - NEEDS AUDIT
**Current**: `Button` component with variants (default, destructive, outline, secondary, ghost, link) and sizes (default, sm, lg, icon)
**Action**: Audit all modules for consistent button placement patterns:
- [ ] Primary actions: right-aligned in cards, bottom in forms
- [ ] Secondary actions: left of primary, ghost variant
- [ ] Danger actions: destructive variant, confirmation modal
- [ ] Toolbar/grouped actions: consistent spacing (gap-2)

---

## Phase 4: Animations (Week 4-5)

### 4.1 Skeleton Loading - COMPLETED ✅
**Current**: `loading-skeletons.tsx` with:
- `CardSkeleton`, `TableSkeleton`, `StatCardsSkeleton`, `ListSkeleton`, `TableRowsSkeleton`
- ARIA attributes (`aria-busy`, `aria-label`)
- Staggered opacity for realism

### 4.2 Chart Animation - COMPLETED ✅
**Current**: `chart-animated.tsx` with:
- `AnimatedChart` wrapper respecting `prefers-reduced-motion`
- `useReducedMotion` hook
- Configurable duration (800ms) and easing (ease-out)

**Missing**:
- [ ] 120 FPS target: Verify all animations use `transform`/`opacity` only
- [ ] Add `will-change` hints for animated elements
- [ ] Test with Chrome DevTools Performance tab
- [ ] Staggered entrance animations for dashboard widgets

---

## Phase 5: Core HCM - Assessment Toggle (Week 5-6)

### 5.1 Assessment Types: Pen & Practical
**Location**: Likely in `CoreHCM.tsx` or `RecruitmentManagement.tsx`
**Requirements**:
- [ ] Toggle component for assessment type selection
- [ ] Pen assessment: Written test scoring, time limits
- [ ] Practical assessment: Skill demonstration, rubric-based scoring
- [ ] Database schema alignment check (member a-c cross-check)
- [ ] API endpoints for both assessment types

---

## Phase 6: Cross-Check & System Validation (Week 6-7)

### 6.1 Member A-C Cross-Check
- [ ] Compare feature implementations across team members
- [ ] Identify duplicates/conflicts
- [ ] Consolidate shared components

### 6.2 System vs Database Alignment
- [ ] Run `audit_db.php` and review `REVIEW-FINDINGS.md`
- [ ] Check `live_key_tables_columns.txt`, `live_foreign_keys.txt`
- [ ] Verify migrations match current schema
- [ ] Check for duplicate columns (`live_duplicate_columns.txt`)

### 6.3 System Testing, Auditing, QA
- [ ] Unit tests (Vitest/Pest)
- [ ] Integration tests (API endpoints)
- [ ] E2E tests (Playwright/Cypress)
- [ ] Accessibility testing (axe-core)
- [ ] Performance testing (Lighthouse CI)
- [ ] Security audit (OWASP Top 10)

---

## Phase 7: Module-Specific Features (Week 7-12)

### 7.1 Filtering in Table Columns
- [ ] Add filter row/header to `Table` component
- [ ] Support: text, select, date range, multi-select
- [ ] Persist filters in URL state (TanStack Router)
- [ ] Server-side filtering support

### 7.2 Consistency Across Modules
- [ ] Design token audit (colors, spacing, typography)
- [ ] Component usage audit (Button, Card, Input, etc.)
- [ ] Create shared layout components (PageHeader, SectionCard, DataTable)
- [ ] Standardize empty states, error states, loading states

### 7.3 Onboarding (NewHireOnboarding.tsx - 158KB)
- [ ] Review current implementation
- [ ] Step-by-step wizard with progress
- [ ] Document upload/verification
- [ ] Digital signature
- [ ] Task assignment tracking

### 7.4 TOTP Backup/Recovery Code Research
- [ ] Research industry standards (RFC 6238, backup codes)
- [ ] Implement backup code generation (10 codes, single-use)
- [ ] Secure storage (hashed)
- [ ] Recovery flow UI

### 7.5 Profile Picture Implementation
- [ ] Upload component (drag-drop, crop, preview)
- [ ] Image optimization (resize, WebP)
- [ ] CDN integration
- [ ] Fallback avatar (initials)

### 7.6 Resume Builder
- [ ] Template system
- [ ] Section builder (experience, education, skills, certifications)
- [ ] PDF export (jspdf already in deps)
- [ ] AI-assisted content suggestions (NLP service)

### 7.7 QR-Based Assessment
- [ ] QR code generation (assessment tokens)
- [ ] Mobile-responsive assessment interface
- [ ] Offline capability (service worker)
- [ ] Result synchronization

### 7.8 Settings Cleanup (Settings.tsx - 48KB, Settings-DESKTOP-T31RHI0.tsx - 49KB)
- [ ] Consolidate duplicate settings files
- [ ] Organize into tabs: General, Security, Notifications, Appearance, Integrations
- [ ] Remove deprecated options

### 7.9 Reload Site on Tab Change - BUG FIX
- [ ] Investigate: "nag rereload site kapag nag iba ng tab"
- [ ] Likely cause: TanStack Router hydration mismatch or state loss
- [ ] Fix: Preserve scroll position, form state, use proper router navigation

### 7.10 Encrypted DNS / Domain Names
- [ ] Research: DoH/DoT implementation
- [ ] Configure Laravel to use encrypted DNS resolver
- [ ] Environment-specific domain configuration

### 7.11 SEO for All Modules
- [ ] HCM module: Employee directory, org chart
- [ ] App Management: Application listing, job detail pages
- [ ] Recruitment: Job boards, candidate profiles (public)
- [ ] ESS: Public-facing pages only (login-protected excluded)

---

## Phase 8: Additional Features (Week 12-16)

### 8.1 Encrypted Information in App Management
- [ ] Field-level encryption for sensitive data (SSS, TIN, PhilHealth, Pag-IBIG)
- [ ] Laravel encryption (AES-256)
- [ ] Key rotation strategy

### 8.2 ESS Management - Remove Mock Data
- [ ] Replace all mock data with real API calls
- [ ] Seed database with realistic test data

### 8.3 AI Chatbot
- [ ] Conversation naming (internal)
- [ ] Media upload support (images, documents)
- [ ] Poll for AI naming
- [ ] Developer-facing debugging questions

### 8.4 Dark Mode Implementation - VERIFY COMPLETION
- [ ] Audit all components for dark mode support
- [ ] Fix any hardcoded colors
- [ ] Test all modules in dark mode

### 8.5 Audit Log Implementation
- [ ] Backend: Laravel observer/model events
- [ ] Frontend: AuditLogs.tsx component exists (16KB)
- [ ] Filtering, pagination, export

### 8.6 User Management Testing
- [ ] CRUD operations
- [ ] Role/permission matrix
- [ ] Bulk actions
- [ ] Import/export

### 8.7 Validation/Confirmation/Alert Modal
- [ ] Standardize on `AlertDialog` (Radix UI) for confirmations
- [ ] Toast notifications (Sonner) for success/error
- [ ] Form validation with Zod + React Hook Form (already in deps)

### 8.8 120 FPS Animation Target
- [ ] Profile all animations
- [ ] Use `transform`/`opacity` only
- [ ] `will-change` for animated elements
- [ ] Reduce layout thrashing
- [ ] Virtualize long lists (react-window/tanstack-virtual)

### 8.9 Reports Consistency
- [ ] Standardize report layout (header, filters, table, pagination, export)
- [ ] Consistent button placement (export: top-right)
- [ ] Date range picker component
- [ ] Scheduled reports

### 8.10 Tab Consistency
- [ ] Audit all `Tabs` usage
- [ ] Standardize: trigger styling, content spacing, keyboard nav
- [ ] Vertical tabs for sidebar navigation

### 8.11 ESS Service for Admins
- [ ] Admin view of employee self-service data
- [ ] Proxy actions (approve leave, update info)
- [ ] Audit trail for admin actions

### 8.12 Job Posting Upload - Single Flow
- [ ] Consolidate multiple upload steps
- [ ] Drag-drop multiple files
- [ ] Progress indication
- [ ] Validation before submit

### 8.13 Remove Subtext
- [ ] Audit for unnecessary helper text
- [ ] Replace with tooltips or inline validation

---

## Phase 9: Internationalization (Week 16-18)

### 9.1 Translation Implementation
**Languages**: Filipino (primary), Chinese, Bisaya
- [ ] i18n setup (react-i18next or TanStack Router i18n)
- [ ] Translation keys for all UI strings
- [ ] RTL support preparation (future)
- [ ] Date/number formatting per locale
- [ ] Currency formatting (PHP)

---

## Phase 10: Responsiveness & Polish (Week 18-20)

### 10.1 Overall Responsiveness
- [ ] Mobile-first audit (320px+)
- [ ] Tablet breakpoints (768px, 1024px)
- [ ] Desktop (1280px, 1440px, 1920px)
- [ ] Touch targets (44x44px minimum)
- [ ] Horizontal scroll prevention

### 10.2 AI Chatbot Media Upload
- [ ] Image paste/upload
- [ ] Document attachment
- [ ] Preview thumbnails
- [ ] Virus scanning integration

### 10.3 Social Media Posting (3rd Party)
- [ ] LinkedIn API integration
- [ ] Facebook/Instagram Graph API
- [ ] Twitter/X API v2
- [ ] Scheduling queue

### 10.4 Google Meet Integration
- [ ] OAuth2 flow
- [ ] Meeting creation from interview scheduling
- [ ] Calendar sync
- [ ] Recording/attendance tracking

---

## Phase 11: Security & Performance (Week 20-22)

### 11.1 Security Hardening
- [ ] CSP headers
- [ ] HSTS
- [ ] Rate limiting (API + auth)
- [ ] Input sanitization
- [ ] SQL injection prevention (Eloquent/parameterized queries)
- [ ] XSS prevention (React auto-escaping + DOMPurify for rich text)

### 11.2 Performance Optimization
- [ ] Code splitting (TanStack Router automatic)
- [ ] Image optimization (Vite + Sharp)
- [ ] Bundle analysis
- [ ] Caching strategies (React Query, HTTP headers)
- [ ] Database query optimization (N+1, indexes)

---

## Phase 12: Documentation & Handover (Week 22-24)

### 12.1 Technical Documentation
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Component storybook
- [ ] Architecture decision records (ADRs)
- [ ] Deployment guide
- [ ] Runbooks for common operations

### 12.2 User Documentation
- [ ] Admin manual
- [ ] Employee self-service guide
- [ ] Recruitment workflow guide
- [ ] Video tutorials

---

## Priority Matrix (Member A Focus)

| Priority | Task | Effort | Dependencies |
|----------|------|--------|--------------|
| P0 | Fix reload-on-tab-change bug | Medium | Router debugging |
| P0 | Table column filtering | Medium | Table component |
| P0 | SEO for all modules | High | Route metadata |
| P1 | Consolidate Settings files | Low | None |
| P1 | Audit log completion | Medium | Backend events |
| P1 | Dark mode audit | Medium | All components |
| P2 | Assessment toggle (pen/practical) | High | CoreHCM, DB schema |
| P2 | Profile picture upload | Medium | Storage/CDN |
| P2 | Resume builder | High | NLP service, PDF |
| P2 | QR-based assessment | High | Mobile, offline |
| P3 | i18n (Filipino, Chinese, Bisaya) | High | All UI strings |
| P3 | Social media / GMeet integration | High | 3rd party APIs |
| P3 | Encrypted fields (App Man) | Medium | Laravel encryption |

---

## Technical Debt to Address

1. **Duplicate Settings files**: `Settings.tsx` + `Settings-DESKTOP-T31RHI0.tsx`
2. **Large component files**: `CoreHCM.tsx` (362KB), `RecruitmentManagement.tsx` (362KB), `ApplicantManagement.tsx` (773KB) - need splitting
3. **Mock data in ESS**: Replace with real API
4. **TypeScript strictness**: Enable stricter config
5. **Test coverage**: Currently minimal

---

## Success Criteria

- [ ] All pages load < 3s (LCP)
- [ ] 100% dark mode coverage
- [ ] WCAG 2.1 AA compliance
- [ ] 90+ Lighthouse scores
- [ ] Zero critical/security vulnerabilities
- [ ] 80%+ test coverage
- [ ] All modules SEO-ready
- [ ] Multi-language support functional
- [ ] Cross-browser compatibility (Chrome, Firefox, Safari, Edge)

---

## Notes for Member A

Since the task list doesn't explicitly assign items to members A/B/C, this plan covers the full scope. Recommended focus areas for Member A based on typical frontend ownership:

1. **UI/UX**: Dark mode audit, glassmorphism consistency, animation performance
2. **Landing/Login**: SEO, performance, accessibility
3. **Shared Components**: Table sorting, filtering, button positioning standards
4. **Core HCM**: Assessment toggle implementation
5. **Bug Fixes**: Reload-on-tab-change, Settings consolidation
6. **Responsiveness**: Mobile audit across all modules

Coordinate with Members B/C on:
- Backend API contracts (assessment endpoints, encryption)
- Database schema changes
- NLP service integration (resume builder)
- 3rd party API credentials (social, GMeet)