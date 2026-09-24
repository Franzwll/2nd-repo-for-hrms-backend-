# AI Job-Post Draft Generation (Google Gemini)

One-click auto-fill for the **Job Post Builder** in Recruitment Management.
HR picks a position, clicks **Generate with AI**, and the 6 content blocks are
filled with Gemini-generated text grounded in the screening vocabulary. Nothing
is published automatically — HR always reviews the draft before **Save draft**
or **Publish job post**.

- Model: `GEMINI_MODEL` (default `gemini-3.6-flash`) on the Google Generative
  Language API, `v1beta`
- Pattern: secure **backend proxy** — the API key never reaches the browser
- Grounding: `screening_reference_data` (skills + certifications), the same
  vocabulary the NLP applicant-screening scores against
- Resilience: Gemini key → second Gemini key (`GEMINI_FALLBACK_API_KEY`) →
  OpenRouter, with per-provider cool-downs after usage limits
- **Usage indicator** beside the button: provider chain state, drafts used
  today, and a live "resets in Xm" countdown when the free tier is used up

---

## 1. What gets generated

| # | Builder block | Shape | Rules enforced in prompt |
|---|---------------|-------|--------------------------|
| 1 | Job Description (`description`) | 2–3 sentences | Pitches the role at Oxford Suites Makati |
| 2 | Key Responsibilities (`responsibilities`) | 5–7 bullets | Plain text, each under ~120 chars, no numbering |
| 3 | Qualifications (`qualifications`) | 4–6 bullets | Mentions a vocabulary certification when relevant (e.g. TESDA NC II) |
| 4 | Required Skills (`skills`) | 6–10 items | **Prefer vocabulary terms verbatim**; at most 2 new terms |
| 5 | Application Instructions (`instructions`) | 1–2 sentences | Resume via posting or walk-in at HR Office, Oxford Suites Makati |
| 6 | About Company (`about`) | 1–2 sentences | Premier all-suite hotel, Makati business district |

Backend fallbacks guarantee `instructions` and `about` are never blank
(house defaults are substituted when the model returns them empty).

---

## 2. Architecture

```
┌──────────────────────────┐      POST /api/v1/job-posts/generate-draft      ┌──────────────────┐
│  Frontend (React)        │  ─────────────────────────────────────────────▶  │  Laravel API     │
│  RecruitmentManagement   │  { position_title, department, employment_type,  │  RecruitmentMgmt │
│  "Generate with AI"      │    schedule, vacancies }                         │  Controller      │
└──────────────────────────┘                                                 └────────┬─────────┘
       ▲                                                                              │ ① load vocabulary
       │  { description, responsibilities[],                                          │    (screening_reference_data:
       │    qualifications[], skills[],                                               │     skills + certifications)
       │    instructions, about } + meta                                              ▼
       │                                                              ┌────────────────────────┐
       │                                                              │ JobContentGenerator    │
       │                                                              │ service                │
       │                                                              └────────┬───────────────┘
       │                                                                       │ ② prompt + vocabulary
       │                                                                       ▼
       │                                                              ┌────────────────────────┐
       │                                                              │ Google Gemini API      │
       │                                                              │ gemini-3.5-flash-lite  │
       │                                                              │ :generateContent       │
       │                                                              └────────────────────────┘
```

**Why a backend proxy (not calling Gemini from the browser)?**

- The `GEMINI_API_KEY` stays server-side in Laravel's `.env` (gitignored).
  A frontend call would expose the key in shipped JS (`VITE_*` vars are public).
- The server injects the live screening vocabulary into the prompt — the
  browser doesn't hold the full vocabulary map.
- Generation is permission-guarded (`Recruitment Management:Edit`), logged to
  the audit trail, and returns a vocab-grounding report the UI displays.

---

## 3. End-to-end flow

### Accumulation formula

Each generation accumulates three inputs into the 6 filled components:

```
job input (title + department + type + schedule + vacancies)
  + screening vocabulary (recognized skills + certifications)
  + Gemini 3.5 Flash-Lite generation
  = 6 filled builder components
```

1. **Job input** comes from the builder itself — the selected position and
   department shape *what* is written (front-office duties vs. kitchen duties).
2. **Screening vocabulary** constrains *which terms* are used for skills and
   qualifications, so applicant match scores keep working.
3. **Gemini** contributes the prose: phrasing, bullet structure, instruction
   and company blurbs adapted to the hotel context.

This same 3-step accumulation is shown in-app in the ⓘ popover beside the
Generate with AI button, so HR always knows where the text comes from.

### 3.1 User flow (frontend)

1. HR opens **Recruitment → Job Post Builder** and selects department + position
   (`draft.title` is required — the button is disabled without it).
2. HR clicks **Generate with AI** (canvas header, `Sparkles` icon). An ⓘ info
   icon beside the button opens a popover listing the 6 filled components and
   the accumulation flow (job input + screening vocabulary + Gemini).
3. If any of the 6 blocks already has content, a styled in-app confirmation
   dialog ("Generate with AI?") asks before overwriting — never the browser's
   native alert, so it matches the design system.
4. Button shows **Generating…** (`Loader2` spinner) while the request runs.
5. On success:
   - The 6 `draft` fields are filled (`responsibilities`/`qualifications`/
     `skills` arrays joined with `\n` for the textareas).
   - All 6 blocks are added to the canvas if missing; `description` becomes
     the active block.
   - Success toast keeps it short: *"AI draft ready — 6 components filled"*,
     with a one-line body — new-skill count when there are off-vocabulary
     terms, otherwise a review reminder.
6. On failure: error toast (missing key, quota, unreadable response) with a
   nudge to use a **Content Template** instead.
7. HR edits freely, then **Save draft** (partial drafts allowed) or
   **Publish job post**.

### 3.1a Publish guard

**Publish** refuses incomplete posts: Department plus all 6 content blocks must
hold real text. The footer button reads "Publish job post" for new posts and
"Update template" when editing, but both call the same `publish()` function —
so the guard applies equally to creating AND updating (toasts name the active
mode: *"Complete these before updating the template: …"*). On failure the
guard shows one error naming everything missing, auto-adds the missing blocks
to the canvas, and focuses the first one so HR can fill it (via Generate with
AI or manually). **Save draft** stays lenient — partial work is never blocked.

Entered salaries must also be realistic: any typed salary of ₱10 or below is
rejected (tune via `MIN_REALISTIC_SALARY` in `publish()`); leaving both salary
fields blank still publishes as "Salary to be discussed".

### 3.1b Remove-block guard

The trash icon on a builder block removes it instantly only when the block is
empty. If the block holds user content (typed text, entered salaries, or an
uploaded hiring picture), a styled confirmation ("Remove …? — removing it will
also delete that text") appears, and confirming clears that block's draft data
as well as removing the block. The dialog also offers "Do this for all deletes
this session" — when checked, every later delete that session removes filled
blocks (and their text) immediately with no further prompts. The preference is
in-memory only, so it resets on page reload and never persists. Structural
blocks (title) remove directly since
they hold the post's identity, which is kept.

### 3.1c Usage & limit indicator (why generation "stops working")

Free-tier AI usage runs out, and a key can be revoked — both used to surface as
one vague toast. The builder now shows the state of the AI continuously:

**Indicator chip** (canvas header, beside **Generate with AI**):

| State | Chip | Behaviour |
|-------|------|-----------|
| Ready | `AI · 3 today` (green dot) | Click generates normally |
| Generating | `Generating…` (spinner tone) | Button shows *Generating…* |
| Limit reached | `AI limit · resets in 12m` (amber) | Button disabled until the cool-down expires |
| Not configured | `AI not configured` (grey) | Ask an admin to set `GEMINI_API_KEY` |
| Loading | `AI status…` (grey) | Snapshot still loading — never blocks use |

**ⓘ popover → "Usage & limits"** shows the detail behind the chip:

- drafts used today (+ progress bar when `JOB_AI_DAILY_LIMIT` is set), failures,
  tokens reported by the provider
- every provider in the chain with ✓ or ⚠ and its cool-down reason
- the last failure (code + message) and the "ready again in …" countdown
- a **Refresh** link that re-reads the snapshot

**On a limit failure** the toast names the cause ("Daily usage limit") and offers
a **Use a template** action that scrolls to the Content Templates palette, so HR
can still finish the post without AI.

Under the hood the backend skips a provider that just reported a usage limit /
dead key (instead of retrying it 3× with backoff), and reports a hard block only
when *every* provider is cooling down — if a fallback provider is healthy, the
chip stays Ready and generation still works.

### 3.2 Backend flow (`generateDraft`)

1. **Validate** input: `position_title` required; `department`,
   `employment_type` (Full-time/Part-time/Contract/Seasonal), `schedule`,
   `vacancies` (1–500), `experience_level`, `education_level` optional.
2. **Config check**: if no `GEMINI_API_KEY` → `422` (*"Set GEMINI_API_KEY on
   the API server"*). Frontend surfaces this as a friendly error.
3. **Load vocabulary**: `ScreeningReferenceData::mappingFor('skill')` and
   `mappingFor('certification')` → `{canonical: [aliases]}`. Wrapped in
   try/catch — degrades to empty lists if the table is unavailable.
4. **Generate**: `JobContentGenerator::generate($job, $vocabulary)` walks the
   provider chain (Gemini → second Gemini key → OpenRouter):
   - providers that are cooling down (recent usage limit / dead key) are skipped,
   - each HTTP failure is classified into a code (`quota_day`, `rate_minute`,
     `auth`, `model`, `request`, `overloaded`, `network`, `unreadable`),
   - the most actionable failure wins the final message (usage limit > bad key
     > bad model > overload),
   - usage metrics (attempts / drafts / failures / tokens) are recorded in the
     cache; a daily cap (`JOB_AI_DAILY_LIMIT`) is checked before calling out.
5. **Parse + normalize**: strip ``` fences, `json_decode`, trim/filter/dedupe,
   cap lengths (8 items per list, 12 skills; strings truncated to sane
   maxima).
6. **House fallbacks** for empty `instructions` / `about`.
7. **Grounding report**: each generated skill is checked case-insensitively
   against canonical values + aliases → `skills_matched[]` vs `skills_new[]`.
8. **Audit log**: `Job Draft Generated` (Recruitment Management) with
   position + matched/new counts; failures log `AI Draft Failed` (Warning).
9. **Respond**: `{ success, data: {6 fields}, meta: { model, generated_via,
   vocabulary counts, skills_matched, skills_new, usage } }`. Failures answer
   `429` for usage limits and `502` for provider errors, both with
   `code`, `retry_after_seconds`, `resets_at` and a fresh `usage` snapshot.

---

## 4. Prompt design (`JobContentGenerator::buildPrompt`)

System context: *HR copywriter for Oxford Suites Makati… warm Filipino
hospitality, Philippine English.* Then:

- **Role context** — position, department, employment type, schedule,
  vacancies, experience/education levels.
- **Vocabulary injection** — full `SKILLS:` list (capped at 150 terms) and
  `CERTIFICATIONS:` list (capped at 60) so the prompt stays bounded.
- **7 rules** — exact JSON keys only; bullet counts; verbatim vocab reuse for
  skills; certification mention in qualifications; house defaults for
  instructions/about; no markdown/numbering/extra keys.

Request options (`generationConfig`):

```json
{ "maxOutputTokens": 2048, "responseMimeType": "application/json" }
```

> `temperature` / `top_p` / `top_k` are intentionally **not** sent — Google
> deprecated them starting with `gemini-3.5-flash-lite` / `gemini-3.6-flash`
> and the API rejects them.

---

## 5. API contract

**`POST /api/v1/job-posts/generate-draft`** — auth bearer required,
permission `Recruitment Management:Edit`.

Request:

```json
{
  "position_title": "Front Desk Associate",
  "department": "Front Office",
  "employment_type": "Full-time",
  "schedule": "Shifting Schedule",
  "vacancies": 2
}
```

Success (`200`):

```json
{
  "success": true,
  "data": {
    "description": "Join our Front Office team…",
    "responsibilities": ["Welcome and assist hotel guests…"],
    "qualifications": ["Bachelor's degree in Hospitality…"],
    "skills": ["Check-in / Check-out", "Communication", "Customer Service"],
    "instructions": "Interested applicants may send…",
    "about": "Oxford Suites Makati is a premier all-suite hotel…"
  },
  "meta": {
    "model": "gemini-3.6-flash",
    "generated_via": { "service": "Google Gemini", "model": "gemini-3.6-flash", "free": false },
    "vocabulary": { "skills_count": 53, "certifications_count": 12 },
    "skills_matched": ["Check-in / Check-out", "Communication"],
    "skills_new": ["Upselling"],
    "usage": {
      "configured": true,
      "primary_model": "gemini-3.6-flash",
      "daily_limit": 0,
      "used_today": 4,
      "remaining_today": null,
      "attempts_today": 5,
      "failures_today": 1,
      "tokens_today": 8123,
      "blocked_until": null,
      "blocked_code": null,
      "blocked_reason": null,
      "providers": [
        { "service": "Google Gemini", "model": "gemini-3.6-flash", "kind": "gemini", "blocked": false, "blocked_until": null, "blocked_reason": null }
      ],
      "last_success": { "service": "Google Gemini", "model": "gemini-3.6-flash", "at": "2026-09-23T10:12:04+08:00" },
      "last_error": null
    }
  }
}
```

Usage-limit failure (`429` — this is the "usage is filled up" case):

```json
{
  "message": "Google Gemini free-tier usage is used up for today (HTTP 429). It resets around 3:00 PM — you can keep writing the post with a Content Template meanwhile.",
  "code": "quota_day",
  "retry_after_seconds": 4021,
  "resets_at": "2026-09-23T15:00:01+08:00",
  "usage": { "...": "same snapshot as above, with blocked_until/blocked_code set" }
}
```

Other codes: `rate_minute` (per-minute limit), `daily_limit` (app cap),
`auth` (401/403 — rotate the key), `model` / `request` (config), `overloaded`
(503/5xx), `network` (timeout), `unreadable` (bad JSON), `provider` (other).
Provider errors answer `502`; config errors `422`.

**`GET /api/v1/job-posts/ai-usage`** — auth bearer required, permission
`Recruitment Management` (read-only). Returns `{ success: true, data: <usage
snapshot> }` and triggers **no** generation. The builder chip and the ⓘ popover
poll it on mount, after every attempt, when the popover opens (**Refresh**) and
when a cool-down expires.

Errors: `422` validation / key not configured · `429` usage limit reached ·
`502` provider unreachable or unreadable response.

---

## 6. Configuration

| Variable | Where | Default | Purpose |
|----------|-------|---------|---------|
| `GEMINI_API_KEY` | `backend-laravel/.env` (**gitignored — real key only here**) | — | Google AI Studio key |
| `GEMINI_MODEL` | `backend-laravel/.env` (optional) | `gemini-3.6-flash` | Model override / version pin |
| `GEMINI_TIMEOUT` | `backend-laravel/.env` (optional) | `30` | HTTP timeout (seconds) |
| `GEMINI_FALLBACK_API_KEY` | `backend-laravel/.env` (optional) | — | Second key used when the primary is rate-limited |
| `GEMINI_FALLBACK_MODEL` | `backend-laravel/.env` (optional) | primary model | Model for the fallback key |
| `OPENROUTER_API_KEY` | `backend-laravel/.env` (optional) | — | Last-resort provider (survives a Google-side outage) |
| `OPENROUTER_MODEL` | `backend-laravel/.env` (optional) | `openrouter/free` | OpenRouter model slug |
| `JOB_AI_DAILY_LIMIT` | `backend-laravel/.env` (optional) | `0` (unlimited) | App-level cap on drafts per day; the indicator shows `used/limit` and the API answers `429` past it |

Setup:

1. Get a key at `https://aistudio.google.com/apikey`.
2. Add `GEMINI_API_KEY=...` to `backend-laravel/.env` (never to `.env.example`
   — that file is git-tracked and holds only empty placeholders).
3. `php artisan config:clear` and restart `php artisan serve`.

Cool-downs (per provider) live in the cache, not in the DB:
`quota_day` 30 min, `rate_minute` ≈ 65 s, `auth`/`model` 30 min (capped),
`overloaded` 45 s, `network` 20 s. They are best-effort — a broken cache never
blocks generation.

---

## 7. Code map

| Piece | File |
|-------|------|
| Gemini client + prompt + normalize | `backend-laravel/app/Services/JobContentGenerator.php` |
| Failure classification + cool-downs + usage snapshot | `backend-laravel/app/Services/JobContentGenerator.php` (`classifyFailure()`, `blockProvider()`, `usageSnapshot()`) |
| `POST generate-draft` endpoint | `backend-laravel/Modules/RecruitmentManagement/app/Http/Controllers/RecruitmentManagementController.php` → `generateDraft()` |
| `GET ai-usage` endpoint | same controller → `aiUsage()` |
| Routes | `backend-laravel/Modules/RecruitmentManagement/routes/api.php` (`job-post.generate-draft` inside `Recruitment Management:Edit`; `job-post.ai-usage` inside `Recruitment Management`) |
| Service config | `backend-laravel/config/services.php` (`services.gemini`, `services.openrouter`, `services.job_ai.daily_limit`) |
| Env template | `backend-laravel/.env.example` |
| Unit tests | `backend-laravel/tests/Unit/JobContentGeneratorTest.php` (config helpers, failure codes, cool-down, daily cap, failure priority) |
| Frontend client | `frontend/src/lib/api.ts` (`jobPostsApi.generateDraft`, `jobPostsApi.aiUsage`, `JobAiUsage`, `JobDraftErrorPayload`) |
| Button + handler | `frontend/src/components/modules/RecruitmentManagement.tsx` (`generateDraftWithAI`, `runGenerateDraft`, `loadAiUsage`, `aiIndicator`) |
| Indicator chip + popover | same file — canvas header chip, "Usage & limits" popover section, `AI_TONE_CLASS`, `aiCountdown()` |
| Vocabulary source | `Modules/ApplicantManagement/.../ScreeningReferenceData.php` (`mappingFor()`), managed via Screening Setup UI |

Related existing pieces: static `templates` + `applyTemplate()` (offline fallback),
`addTermToVocabulary()` (one-click add for `skills_new`), `requisitionStore`
conversion flow (unaffected).

---

## 8. Limits & next steps

- No streaming — one shot per click; large vocabularies are capped in-prompt
  (150 skills / 60 certs) to bound tokens and latency.
- No per-field regenerate yet (one-click fills all 6; decided scope).
- `experience_level` / `education_level` aren't in the builder `Draft` yet —
  add two Info-block dropdowns and pass them through to sharpen output.
- Possible follow-ups: cache drafts per position+department, "add all new
  skills to vocabulary" bulk action, estimated cost per generation (token
  counts are already tracked in `usage.tokens_today`), per-field regenerate.
- Token usage comes from the provider envelope (`usageMetadata` for Gemini,
  `usage` for OpenRouter) and is stored per day in the cache; it resets with
  the daily keys and is only used for the indicator.

> **Fixed regression (Sep 2026):** `generateDraft()` called
> `JobContentGenerator::isConfigured()` / `modelName()` after an edit dropped
> both methods, so every click answered HTTP 500. Both helpers now exist and
> `tests/Unit/JobContentGeneratorTest.php` guards them.
