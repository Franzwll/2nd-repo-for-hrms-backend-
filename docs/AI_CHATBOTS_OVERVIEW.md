# HRMS AI Assistants — Overview

Three role-scoped AI assistants power the Oxford Suites Makati HRMS. All AI calls go through a **secure Laravel backend proxy** — API keys never reach the browser. When the AI provider is down, each assistant degrades gracefully to a local rule/template fallback so the UI never goes blank.

| # | Assistant | Audience | Where it lives | Provider |
|---|-----------|----------|----------------|----------|
| 1 | **Landing Chatbot (Careers Assistant)** | Public / job applicants (no login) | Public careers site `/` — floating chat bubble | Groq → OpenRouter → Gemini (`GeminiChatService`) + `ChatbotEngine` fallback |
| 2 | **ESS HR AI Concierge** | Logged-in employees (+ Admin/SuperAdmin via widget) | ESS portal: `/employee/ai` full page + floating `AiConciergeWidget` in all portals | Same chat stack, `role=employee/admin/superadmin` |
| 3 | **Recruitment Job Post Builder AI** | HR / Admin / SuperAdmin recruiters | Recruitment Management → Job Post Builder → "Generate with AI" | Groq → OpenRouter → Gemini (`JobContentGenerator`) |

---

## 1. Landing AI Chatbot — Public Careers Assistant

**Purpose:** Convert visitors into applicants. Answers questions about open jobs, how to apply, documents, salary, benefits, timeline, and company info using **live job-board data**, not canned text.

### User experience
- Floating bubble (bottom-right) on the public landing site, available on `/` and job-detail pages.
- Greeting: *"Hello! I'm the Oxford Suites Makati careers assistant. I pull live updates straight from our job board…"*
- Starter chips: `What jobs are open?` / `How do I apply?` / `What documents do I need?` / `How long is the hiring process?`
- Features: **no persistence — a browser refresh always restarts the conversation** (fresh greeting + fresh in-memory session id; stale `hrms-chatbot-*` keys from older builds are cleared on mount), typing indicator, thumbs up/down feedback, rich-text replies, FAQ citation chips (`Based on: …`), unread badge, offline fallback reply.
- Frontend: `frontend/src/components/public/Chatbot.tsx:79`

### How it works (backend)
1. `POST /api/v1/landing/chat` → `ChatbotController::chat` (`backend-laravel/Modules/Landing/app/Http/Controllers/ChatbotController.php:18`)
   - Public route, throttled (`throttle:chatbot`). Request: `{ message, session_id, role: 'guest'|'applicant', history[] }`.
2. `buildContext()` (`ChatbotController.php:118`) builds live RAG context:
   - Top 15 **open** `job_posts` (status `published`/`Open`, slots remaining) with title, department, slots left, employment type, salary min–max, summary.
   - Company settings (`company.name/address/phone/email/hours` from `system_settings`).
   - Top 5 keyword-matched **enabled FAQs**, tagged `[FAQ#id]` for citations.
3. `GeminiChatService::chat()` (`backend-laravel/app/Services/GeminiChatService.php`) tries Groq (`CHAT_GROQ_MODEL`, default `openai/gpt-oss-20b`) → OpenRouter (`CHAT_OPENROUTER_MODEL`, default `nvidia/nemotron-3-super-120b-a12b:free`) → shared Gemini (`gemini-3.5-flash-lite` default), temp `0.4`, last 12 turns, circuit breaker after 5 full-chain failures.
   - `systemPrompt('guest', $context)` (`GeminiChatService.php`) scopes the model to HRMS topics only, forbids inventing vacancies/salaries, requires `SOURCES: FAQ-x` citation line.
4. Fallback: `ChatbotEngine::respond()` (`backend-laravel/app/Services/ChatbotEngine.php:51`) — intent matcher (`open_jobs, apply, documents, salary, benefits, timeline, resume/NLP, experience, contact, about…`) + live job/company data + FAQ match. Unmatched questions are logged to `chatbot_unanswered` for HR review.
5. Every exchange is persisted to `chatbot_messages` (`session_id, user_id, role, message, reply, source: groq|openrouter|gemini|fallback, faq_ids`) for audit/analytics.

### Admin management
- FAQ knowledge base CRUD: `GET/POST/PUT/DELETE /chatbot/faqs` (permission `Settings` / `Settings:Edit`).
- UI: `frontend/src/components/modules/ChatbotFaq.tsx`, routes `frontend/src/routes/superadmin/_settings/chatbot.tsx`, `frontend/src/routes/admin/_settings/chatbot.tsx`.
- Feedback: `POST /chatbot/messages/{message}/feedback` (thumbs up/down).
- Tables: `chatbot_faqs`, `chatbot_messages`, `chatbot_unanswered`.

---

## 2. ESS AI — HR AI Concierge (Employee)

**Purpose:** 24/7 personal HR assistant for employees — leave balances, payroll/payday, COE & documents, attendance/DTR & shifts, HMO/benefits, recognition, promotions — plus one-click shortcuts into the right ESS screen.

### User experience — two surfaces, one backend
**A. Full page — `/employee/ai`** (`frontend/src/routes/employee/ai.tsx:1`, `frontend/src/components/modules/EmployeeAiPage.tsx:105`)
- Hero state: *"How can I help you today, {firstName}?"* with large prompt box + 2×2 suggested-topic cards (Leave Credits, Payroll & Payday, Request a COE, HMO & Medical).
- Left drawer: New Conversation, Knowledge Topics (Leave, Payroll, COE, Attendance, HMO, Recognition), "Verified HR Knowledge" badge.
- Active thread: avatar chat bubbles, embedded **Quick Action cards** (e.g. "File a Leave Request → Go to Leave Application") that deep-link to `/employee/ess?category=…`, FAQ citation chips, thumbs feedback, typing animation, `localStorage` history (`oxford_ess_ai_fullpage_history`).

**B. Floating widget — `AiConciergeWidget`** (`frontend/src/components/portal/AiConciergeWidget.tsx:76`)
- Small circle (bottom-right) inside every authenticated portal. Nav label: **"HR AI Concierge"** (`frontend/src/lib/nav.ts:72`).
- Role-aware greeting + starters:
  - `employee`: *How do I file leave? / How do I request a promotion? / Where is my payslip?*
  - `admin`/`superadmin`: *How do I approve a promotion? / How do I export a report? / How do requisitions work?*
- Server-backed history drawer (last 20 sessions, full transcript reload), new-chat button.
- Also surfaced as a dashboard card on `frontend/src/routes/employee/index.tsx:369`.

### How it works (backend — same stack, different role)
- Same endpoint `POST /api/v1/landing/chat` but with `role: employee|admin|superadmin` (derived from the logged-in user in `ChatbotController.php:27-41`).
- `systemPrompt()` switches scope:
  - `employee` → ESS (leave, attendance, payroll, documents, benefits, recognition, promotion requests), onboarding, policies.
  - `admin/superadmin` → how to *operate* the HRMS (Core HCM, Recruitment, Applicants, Onboarding, ESS admin, reports, requisitions, promotions) + HR best practices.
- Quick replies per role (`ChatbotController.php:103`), sessions/transcript APIs for the widget:
  - `GET /chatbot/sessions`, `GET /chatbot/sessions/{session}/messages` (`ChatbotController.php:239,260`).
- Offline behavior: `EmployeeAiPage.fallbackAnswer()` shows live ESS leave balances from `essApi.overview()` + the matching action card instead of going blank.

---

## 3. Recruitment AI — Job Post Builder ("Generate with AI")

**Purpose:** One-click draft writer for recruiters. HR picks a position → clicks **Generate with AI** → the 6 builder blocks are auto-filled with Gemini copy **grounded in the screening vocabulary** so applicant match scores stay meaningful. Nothing is saved or published automatically — HR always reviews before **Save draft / Publish**.

> Full spec: `docs/JOB_POST_AI_GENERATION.md:1`

### User experience
- Location: Recruitment Management → Job Post Builder (frontend: `frontend/src/components/modules/RecruitmentManagement.tsx:3186,5786`).
- Inputs sent: `position_title, department, employment_type, schedule, vacancies, experience_level, education_level` (`frontend/src/lib/api.ts:1071`).
- Outputs filled (6 blocks): `description` (2–3 sentences) · `responsibilities` (5–7 bullets) · `qualifications` (4–6 bullets, cites vocab certifications like TESDA NC II) · `skills` (6–10 items, prefers vocab verbatim, max 2 new terms) · `instructions` · `about`.
- **AI usage indicator** next to the button (`api.ts:1088`, `RecruitmentManagement.tsx:2879-2932`): provider chain state, drafts used today (`used_today of daily_limit`), tokens, failures, live `resets in Xm` countdown on quota, last-error popover, progress bar, per-provider blocked badges.
- Related automation: blank salary min/max **auto-inherits the position's Core HCM grade band** (`applyPositionSalaryDefaults`, `RecruitmentManagementController.php:609`) — no extra click needed.
- Vocab grounding report: `skills_matched[]` vs `skills_new[]` (one-click-add candidates for the screening vocabulary).

### How it works (backend)
1. `POST /api/v1/job-posts/generate-draft` → `RecruitmentManagementController::generateDraft` (`backend-laravel/Modules/RecruitmentManagement/app/Http/Controllers/RecruitmentManagementController.php:434`).
2. Loads vocabulary from `screening_reference_data` (`skill` + `certification` maps) and calls `JobContentGenerator::generate()` (`backend-laravel/app/Services/JobContentGenerator.php:140`).
3. Resilience chain (first success wins): **Groq (`JOB_GROQ_*`) → OpenRouter (`JOB_OPENROUTER_*`, default `nvidia/nemotron-3-super-120b-a12b:free`) → shared Gemini (`GEMINI_API_KEY`, + optional `GEMINI_FALLBACK_API_KEY`)** (`providers()`, `JobContentGenerator.php`), each with retries, per-code cool-downs (`quota_day 30m, rate_minute 65s, auth/model 1h…`), and failure ranking so HR sees the actionable cause.
4. Prompt (`buildPrompt`, `JobContentGenerator.php:740`) injects role context + up to 150 skills / 60 certifications with strict JSON-only output (`description, responsibilities, qualifications, skills, instructions, about`); `normalize()` caps/trims output, house defaults fill blank `instructions`/`about`.
5. Status mapping: quota/rate-limit → `429` (drives the countdown), else `502`; every attempt/success/failure/token is cached per-day and every generation/failure is audit-logged (`Job Draft Generated` / `AI Draft Failed`).
6. `GET /api/v1/job-posts/ai-usage` → `aiUsage()` (`RecruitmentManagementController.php:571`) returns `usageSnapshot()` (`JobContentGenerator.php:679`): `configured, primary_model, daily_limit, used_today, remaining_today, attempts/failures/tokens_today, blocked_until/code/reason, providers[], last_success, last_error`.

### Config (API server `.env` — real keys only here, never in `.env.example`)
| Var | Default | Purpose |
|-----|---------|---------|
| `CHAT_GROQ_API_KEY` / `CHAT_GROQ_MODEL` | `openai/gpt-oss-20b` | Landing + ESS chat, 1st provider (shared key) |
| `CHAT_OPENROUTER_API_KEY` / `CHAT_OPENROUTER_MODEL` | `nvidia/nemotron-3-super-120b-a12b:free` | Landing + ESS chat, 2nd fallback (shared key) |
| `GEMINI_API_KEY` | — | Shared 3rd fallback (chat + job drafts) |
| `GEMINI_MODEL` | `gemini-3.5-flash-lite` | Shared Gemini model |
| `GEMINI_FALLBACK_API_KEY` / `GEMINI_FALLBACK_MODEL` | — | Optional extra Gemini credential |
| `JOB_GROQ_API_KEY` / `JOB_GROQ_MODEL` | `openai/gpt-oss-20b` | Job drafts, 1st provider (**different** key from chat) |
| `JOB_OPENROUTER_API_KEY` / `JOB_OPENROUTER_MODEL` | `nvidia/nemotron-3-super-120b-a12b:free` | Job drafts, 2nd fallback (**different** key from chat) |
| `JOB_AI_DAILY_LIMIT` | `0` (unlimited) | App-level drafts-per-day cap |

---

## Shared technical notes
- **Security:** backend proxy pattern — keys live in Laravel `config/services.php` (`chat_groq`, `chat_openrouter`, `job_groq`, `job_openrouter`, `gemini`); frontend only calls `/api/v1/*` with a Sanctum bearer token (chat itself is public + throttled).
- **Audit:** chat exchanges → `chatbot_messages`; unanswered → `chatbot_unanswered`; FAQ votes → feedback column; AI drafts → `AuditLogger` + token-usage cache (`chat_ai_tokens_Ym` + legacy `gemini_tokens_Ym`, `job_ai_*`).
- **Files map:** chat backend `Modules/Landing/*` + `app/Services/GeminiChatService.php`, `app/Services/ChatbotEngine.php`; drafts backend `Modules/RecruitmentManagement/*` + `app/Services/JobContentGenerator.php`; frontend `components/public/Chatbot.tsx`, `components/portal/AiConciergeWidget.tsx`, `components/modules/EmployeeAiPage.tsx`, `components/modules/RecruitmentManagement.tsx`, `lib/api.ts` (`chatbotApi`, `jobPostsApi`).
