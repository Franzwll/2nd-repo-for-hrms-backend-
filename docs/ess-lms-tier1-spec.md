# Tier-1 Spec — AI handbook + quiz in ESS Performance

> Status: **spec only — no code yet.** Drafted for review.
> Branch context: `aldrex`. Do not rewrite pushed history (`frontend/AGENTS.md`).

## Goal

Employee opens a learning card → reads the handbook → takes an AI-generated quiz →
auto-graded → on pass, `employee_learning` flips to `Completed` with a score → the
**existing** certificate endpoint works unchanged. Revertable, no history rewrite.

**Course identity (decided — option C):** keep our own catalog (`LMS-101` Food Safety &
Sanitation Level 2, `LMS-102` Customer Excellence in Hospitality, `LMS-103` Fire Safety &
Emergency Response) and **borrow the reference repo's shape**. We do not import the repo's
5-SOP catalog or its XP/ratings/performance-task coupling.

**Engine note:** migrations use backtick-quoted `ALTER TABLE` (`employee_learning`
migration L33) → **MySQL/MariaDB**, so `json()` is safe.

## Why this is possible in our codebase

We already own every external piece the reference repo used:

| Pipeline step | Our repo — already exists |
|---|---|
| Store the handbook file | `Storage::disk('public')` + `GET ess/my-documents/{id}/file` (streams PDFs today) |
| Extract text from the file | `nlp-service` (FastAPI) — `pdfplumber`, `pypdfium2`, `pytesseract` OCR, `python-docx`; called via `App\Services\NlpService` (`NLP_SERVICE_URL`) |
| Generate quiz questions with AI | `GeminiChatService` (Groq → OpenRouter → Gemini chain) **and** `JobContentGenerator` (structured JSON from a prompt) |
| AI resilience / fallback | Circuit breaker, provider chain, quota/rate-limit detection, cool-downs, token logging |
| Per-employee result | `employee_learning`: `score decimal(5,2)`, `status` (CHECK includes `Completed`), `completed_date` |
| Issue certificate on pass | `learningCertificate()` already keys off `status='Completed'` |
| HR oversight | `EssAdminController::verifyLearning()` |

Only two things are genuinely new: **a home for the questions** and **a completion path
for the employee** (today only HR can set `Completed`).

---

## 0. Scope — what we adopt vs. deliberately exclude

**Course identity (option C):** keep our catalog and borrow the reference model's shape.

| Reference concept | Decision |
|---|---|
| 1 handbook = 1 course = 1 quiz | ✅ Adopt |
| **Read handbook → then take quiz (gated, §10)** | ✅ Adopt — ordered, not parallel |
| Quiz spec: 10 items · 10 min · pass ≥80% | ✅ Adopt |
| Handbook metadata (title, category, pages, read-minutes, mandatory) | ✅ Adopt (pages/read-minutes optional — §1d) |
| Visibility rule (mandatory → all; else only if assigned) | ✅ Adopt (simplified) |
| AI-generated questions from handbook text + deterministic fallback | ✅ Adopt |
| `xp_transactions` / XP rewards | ❌ Exclude (Tier-1) |
| `ratings` (4.5 pass / 2.5 fail) | ❌ Exclude |
| `performance_tasks` creation / completion sync | ❌ Exclude |
| `performance_goals` / `goal_id` linkage | ❌ Exclude |
| Competency update → succession readiness | ❌ Exclude |
| TNA prescription / needs-analysis flow | ❌ Exclude (assign via existing `employee_learning`) |
| The repo's 5-SOP catalog itself | ❌ Exclude — we keep our 3 courses |

> Rationale: we are the **same property** (Oxford Suites — our `GeminiChatService` system
> prompt reads *"Oxford Suites Makati HRMS assistant"*), so the reference is on-domain, but
> Tier-1 stays a **thin LMS** — consistent with the reference repo's own `AGENTS.md` §0.2
> ("LMS stays thin… a single quiz per SOP item, pass/fail").

---

## 1. Data model (DDL)

### 1a. Extend `learning_courses` (one additive migration)

Current: `course_id, course_code, title, category, description, created_at, updated_at`.

> **Catalog ownership (important):** the `learning_courses` rows (`LMS-101/102/103`) are
> already seeded by `HotelHrDatabaseSeeder` — `database/seeders/data/hotel_hr_seed_mysql.sql`,
> "Domain 6" — with **explicit ids 1–3**. Our seeder (`LmsTierOneSeeder`) is therefore
> **update-only** (it patches `content_text` + card metadata onto existing rows). Never insert
> course rows from our side: auto-increment would claim ids 1–3 and collide with the fixture
> (`Duplicate entry '1' for key 'PRIMARY'`). `HotelHrDatabaseSeeder` is single-shot (no
> truncate/guard) — re-running the full `db:seed` on a populated DB always fails; use
> `php artisan db:seed --class=LmsTierOneSeeder` instead.

```php
// backend-laravel/database/migrations/2026_xx_xx_000001_add_lms_content_to_learning_courses_table.php
public function up(): void
{
    Schema::table('learning_courses', function (Blueprint $table) {
        $table->longText('content_text')->nullable()->after('description');     // reading text (extracted or authored)
        $table->string('material_path', 255)->nullable()->after('content_text'); // optional handbook file on public disk
        $table->json('quiz_json')->nullable()->after('material_path');           // generated questions + answer key (server-only)
        $table->timestamp('quiz_generated_at')->nullable()->after('quiz_json');
    });
}

public function down(): void
{
    Schema::table('learning_courses', function (Blueprint $table) {
        $table->dropColumn(['content_text', 'material_path', 'quiz_json', 'quiz_generated_at']);
    });
}
```

`quiz_json` shape (server-side only — never sent whole to the client):

```json
{
  "pass_mark": 80,
  "time_limit_seconds": 600,
  "generated_by": "groq|openrouter|gemini|fallback",
  "questions": [
    { "id": 1, "question": "...", "options": ["...","...","...","..."],
      "correct_index": 2, "explanation": "..." }
  ]
}
```

### 1b. Attempt tracking (decided — included)

```php
Schema::create('employee_learning_attempts', function (Blueprint $table) {
    $table->id('attempt_id');
    $table->unsignedBigInteger('employee_id');
    $table->unsignedBigInteger('course_id');
    $table->unsignedTinyInteger('score');          // 0–100
    $table->unsignedSmallInteger('correct_count');
    $table->unsignedSmallInteger('total_count');
    $table->boolean('passed');
    $table->json('answers_json')->nullable();
    $table->timestamp('submitted_at')->useCurrent();
    $table->index(['employee_id', 'course_id'], 'idx_attempts_emp_course');
});
```

**Decided (#4 = A):** included — every attempt is logged (history + retakes).
`employee_learning.score` still holds the best/last score used by the course card.

### 1c. Completion source (decided — included, #3 = A)

```php
$table->string('completion_source', 20)->nullable()->after('completed_date'); // 'quiz' | 'hr' | 'import'
```

Additive/droppable. **Required** by #3 = A (immediate completion): the employee-side quiz write
*and* the HR override both set `Completed`, so HR needs to tell them apart. `'quiz'` = auto-pass,
`'hr'` = `verifyLearning`, `'import'` = bulk/seed.

### 1d. Card-parity columns (decided — included)

Gives the cards parity with the reference (pages / read-time / mandatory tag):

```php
$table->unsignedSmallInteger('estimated_reading_minutes')->nullable();
$table->unsignedSmallInteger('estimated_pages')->nullable();
$table->boolean('mandatory')->default(false);   // NB: reference spells it "manatory" (typo)
```

**Decided (#5 = A):** included — the cards use these for parity with the reference
(pages, read-time, mandatory tag).

### 1e. Reading completion (decided — hard gate, §10)

```php
$table->timestamp('reading_completed_at')->nullable()->after('completed_date');
```

Additive/droppable. Set when the reader finishes the handbook. The quiz endpoint (§2b) refuses
to serve questions until this is non-null — this is what makes the read → quiz order *enforced*
rather than cosmetic.

**No change needed to `score` / `status` / `completed_date`** — those already exist
(`employee_learning` L17–19, `status` CHECK L33 includes `Completed`).

---

## 2. Endpoints

Add inside the `auth:sanctum` + `permission:ESS Management` group in
`Modules/EmployeeSelfService/routes/api.php` (next to L34–35):

```php
Route::get ('my-learning/{courseCode}/material', [EssPortalController::class, 'learningMaterial']);
Route::get ('my-learning/{courseCode}/quiz',     [EssPortalController::class, 'learningQuiz']);
Route::post('my-learning/{courseCode}/quiz',     [EssPortalController::class, 'submitLearningQuiz']);
Route::post('my-learning/{courseCode}/reading-complete', [EssPortalController::class, 'completeLearningReading']);
```

And, for file-based handbooks, a **token-auth** streamer in the top group (mirroring
`my-documents/{id}/file`, L12–15):

```php
Route::get('my-learning/{courseCode}/file', [EssPortalController::class, 'learningMaterialFile']);
```

### 2a. `GET /ess/my-learning/{courseCode}/material`

```json
{
  "course": { "code": "LMS-101", "title": "Food Safety & Sanitation Level 2",
              "category": "Compliance", "estimated_reading_minutes": 12 },
  "content": "plain text of the handbook …",                   // null when file-based
  "file_url": "/api/v1/ess/my-learning/LMS-101/file?token=…",  // null when text-based
  "status": "Assigned | In Progress | Completed"
}
```

Behavior: `resolveEmployee()` → load course → if `content_text` empty and `material_path`
set, lazily **extract via NLP service** and cache into `content_text`.

### 2b. `GET /ess/my-learning/{courseCode}/quiz`

- **Hard gate (§1e / §10):** if `employee_learning.reading_completed_at` is null → return
  `409 { "code": "reading_required", "message": "Finish the handbook first." }` **before**
  generating or returning anything.
- If `quiz_json` is null → generate via `LmsQuizGenerator` (extract text first) → persist
  to `quiz_json` + `quiz_generated_at`.
- **Response omits the answer key:**

```json
{
  "course": { "code": "LMS-101", "title": "…", "category": "…" },
  "pass_mark": 80, "total_items": 10, "time_limit_seconds": 600,
  "questions": [ { "id": 1, "question": "…", "options": ["A","B","C","D"] } ],
  "already_passed": false, "last_score": null
}
```

- If AI + fallback both unavailable → `503 { "code": "ai_unavailable", "fallback": false }`.

### 2c. `POST /ess/my-learning/{courseCode}/quiz`

Request: `{ "answers": { "1": 2, "2": 0, "3": 3 } }` (questionId → option index)

Behavior: load server-side key from `quiz_json` → grade
(`score = round(100·correct/total)`) → upsert `employee_learning`:

- **already `Completed` (terminal, §8 #3):** no-op — return the stored score with
  `already_passed: true`; do **not** insert another `Completed` and never downgrade.
- **pass (≥80):** `status='Completed'`, `score=max(existing,best)`, `completed_date=today`,
  `completion_source='quiz'`
- **fail:** keep/set `status='In Progress'`, store best `score`, leave `completed_date` null
- insert attempts row (if 1b) · `AuditLogger::log(action:'LMS Quiz Submitted', …)`

Response (answer key returned **only here, after submit**):

```json
{
  "passed": true, "score": 90, "correct_count": 9, "total_count": 10, "pass_mark": 80,
  "status": "Completed", "certificate_eligible": true,
  "review": [
    { "id": 1, "question": "…", "options": ["A","B","C","D"],
      "correct_index": 2, "your_index": 2, "is_correct": true, "explanation": "…" }
  ]
}
```

> **Rule (#3 = A, confirmed):** the quiz sets `Completed` **immediately** on pass — the employee
> sees Complete and the certificate right away. The guard at L1577–1581 lives only in
> `updateLearningProgress` (which never writes `Completed`), so **do not weaken it** — this is a
> separate write path. Keep `verifyLearning` as the HR override; `completion_source` (§1c)
> tells quiz-passes from HR-verified.
>
> **Terminal:** once `Completed`, the course is finished — the Assessment row shows **View
> Result** and the quiz does not reopen (matches today's `isDone` branch), *including* when the
> module is opened from the **Materials** card (§5b). Resubmits are no-ops.
> Retakes are only available while **not** `Completed` (unlimited in Tier-1; add a cap later
> if needed).

---

### 2d. `POST /ess/my-learning/{courseCode}/reading-complete`

Marks the reading stage done — the write that the hard gate (§1e / §10) checks. Idempotent.

- Upserts `employee_learning`: `reading_completed_at = now()`; status moves
  `Assigned → In Progress` (never downgrades an existing `Completed`).
- Returns `{ "reading_completed_at": "2026-10-18T…", "status": "In Progress" }`.
- Called by the player's **"Finish reading → Start Assessment"** button (§5b).

---

## 3. Service skeleton — `App\Services\LmsQuizGenerator`

Model it on `JobContentGenerator` (provider chain + `parseJsonPayload` + cooldowns) — for
*temporary*, copy; for cleaner, extract a shared `AiProviderChain` trait.

```php
namespace App\Services;

class LmsQuizGenerator
{
    public function isConfigured(): bool;                        // any provider key present
    public function modelName(): string;

    /**
     * @return array{ok:bool, questions?:array<int,array{question:string,options:string[],correct_index:int,explanation:string}>,
     *               error?:string, code?:string, via?:array}
     */
    public function generate(string $title, ?string $category, string $sourceText, int $count = 10): array;

    protected function buildPrompt(string $title, ?string $category, string $sourceText, int $count): string;
    //  → "Return ONLY JSON: {\"questions\":[{\"question\",\"options\":[4],\"correct_index\",\"explanation\"}]}.
    //     Ground every item strictly in the text. No outside knowledge."

    protected function parseJsonPayload(?string $text): ?array;   // strip ```json fences, salvage first {...}
    protected function fallbackQuestions(string $sourceText, int $count): array; // deterministic cloze (AI down)

    // provider chain — reuse Groq → OpenRouter → Gemini (same keys as chat/job)
    protected function postGroq/ postOpenRouter/ postGemini(...);
}
```

Provider keys: **reuse the shared chain** (`services.chat_groq` / `chat_openrouter` /
`gemini`) for Tier 1; add dedicated `LMS_*` keys later only if you want separate budgets.

### 3b. Tiny addition to the NLP service

`nlp-service/app/main.py` already has `/extract-resume` (L82). Add one generic endpoint
using the existing `text_extraction` module:

```python
@app.post("/extract-document")
async def extract_document(file: UploadFile = File(...)):
    text, pages = extract_text(path)          # reuses pdfplumber / pypdfium2 / OCR
    return {"ok": True, "text": text, "page_count": pages}
```

And a thin client in `App\Services\NlpService`: `extractDocumentText(string $path, string $name): array`
(mirrors `extractResume`, L50).

---

## 4. Controller method sketch (mirrors existing style)

```php
public function learningQuiz(Request $request, string $courseCode): JsonResponse
{
    $employee = $this->resolveEmployee($request);
    if (! $employee) return response()->json(['message' => 'Employee not found.'], 404);

    $course = DB::table('learning_courses')->where('course_code', $courseCode)->first();
    if (! $course) return response()->json(['message' => 'Course not found.'], 404);

    $quiz = $course->quiz_json ? json_decode($course->quiz_json, true) : null;
    if (! $quiz) {
        $text = $course->content_text ?: $this->extractMaterialText($course);   // NLP hop, cached
        $gen  = app(LmsQuizGenerator::class)->generate($course->title, $course->category, $text, 10);
        if (! ($gen['ok'] ?? false)) {
            return response()->json(['code' => 'ai_unavailable', 'fallback' => false], 503);
        }
        $quiz = ['pass_mark' => 80, 'time_limit_seconds' => 600,
                 'generated_by' => $gen['via']['service'] ?? 'ai', 'questions' => $gen['questions']];
        DB::table('learning_courses')->where('course_id', $course->course_id)
          ->update(['quiz_json' => json_encode($quiz), 'quiz_generated_at' => now(),
                    'content_text' => $course->content_text ?: $text]);
    }

    $row = DB::table('employee_learning')->where('employee_id', $employee->employee_id)
        ->where('course_id', $course->course_id)->first();

    return response()->json([
        'course' => ['code' => $course->course_code, 'title' => $course->title, 'category' => $course->category ?? 'General'],
        'pass_mark' => $quiz['pass_mark'], 'total_items' => count($quiz['questions']),
        'time_limit_seconds' => $quiz['time_limit_seconds'],
        'questions' => array_map(fn ($q) => ['id' => $q['id'], 'question' => $q['question'], 'options' => $q['options']], $quiz['questions']),
        'already_passed' => $row?->status === 'Completed',
        'last_score' => $row?->score !== null ? (float) $row->score : null,
    ]);
}
```

`submitLearningQuiz()` grades from `quiz_json`, then upserts `employee_learning` exactly
as §2c describes. Certificate already works via `learningCertificate()` (L1627) once
`status='Completed'`.

---

## 5. Frontend wiring

### 5a. `frontend/src/lib/api.ts` — add to `essApi` (next to L2614–2630)

```ts
learningMaterial: (courseCode: string) =>
  request<{ course: {...}; content: string | null; file_url: string | null; status: string }>(
    `/ess/my-learning/${encodeURIComponent(courseCode)}/material`),

learningQuiz: (courseCode: string) =>
  request<{ course: {...}; pass_mark: number; total_items: number; time_limit_seconds: number;
            questions: { id: number; question: string; options: string[] }[];
            already_passed: boolean; last_score: number | null }>(
    `/ess/my-learning/${encodeURIComponent(courseCode)}/quiz`),

submitLearningQuiz: (courseCode: string, answers: Record<string, number>) =>
  request<{ passed: boolean; score: number; correct_count: number; total_count: number;
            pass_mark: number; status: string; certificate_eligible: boolean;
            review: { id:number; question:string; options:string[]; correct_index:number;
                      your_index:number; is_correct:boolean; explanation:string }[] }>(
    `/ess/my-learning/${encodeURIComponent(courseCode)}/quiz`,
    { method: "POST", body: JSON.stringify({ answers }) }),

learningMaterialUrl: (courseCode: string) => {
  const t = getToken();
  return `/api/v1/ess/my-learning/${encodeURIComponent(courseCode)}/file${t ? `?token=${encodeURIComponent(t)}` : ""}`;
},
```

### 5b. New component `frontend/src/components/modules/ess/modals/LmsActivityPlayer.tsx`

Port the mockup's engine, **re-sequenced per §10** — reading must complete **before** the quiz:

`idle → loading → reading → (reading_completed) → quiz(question i) → result(score/review) → certificate`

> ⚠️ The mockup shows **reading and quiz side by side** — that is **not** the decided flow.
> The decided flow is **read → then quiz** (§10). Do not port the side-by-side layout as-is.

- **Stage 1 — Reading (full width):** `content` text (or `<iframe src={file_url}>` for a PDF
  handbook) + a **"Finish reading → Start Assessment"** button that calls
  `essApi.completeLearningReading(code)` (§2d).
- **Stage 2 — Quiz (full width):** question card A–D + top progress bar + timer. Entered only
  after Stage 1 completes. The **server gate is authoritative** (§2b) — if `reading_completed_at`
  is null the quiz request 409s, so a bypassed client can't skip reading.
- Both the Materials card and the Assessment row open **this same modal** (layout **B**,
  §8 #7). The Assessment row deep-links straight into Stage 2 *when reading is already done*;
  otherwise it opens Stage 1.
- Captures answers into an `answers[]` array (DOM rebuilds wipe radio state — same gotcha
  as the mockup).
- **Already `Completed` is terminal (§2c), even when reached via Materials.** The handbook
  stays readable for review, but the reading footer offers **View certificate** instead of
  re-opening the assessment; and if a client reaches Stage 2 anyway (`quiz.already_passed`),
  the quiz is replaced by an "already completed" panel showing the stored `last_score`. No
  re-grading and no stale score presented as a fresh result.
- Submit → `essApi.submitLearningQuiz` → result panel (score / pass / review) →
  **View Certificate** reuses the existing `LmsCertificateModal` via
  `essApi.learningCertificate(code)` (unchanged).
- Props: `{ open, onOpenChange, course, onCompleted }`.

### 5c. `EssPerformanceTab.tsx` edits (small, localized)

- Add state: `const [activityCourse, setActivityCourse] = useState<any|null>(null)`
  (modal open = non-null).
- Card/table action buttons (L480, L589) change from
  `isDone ? handleOpenCert(c) : handleStartCourse(c)` to:

  ```tsx
  onClick={() => (isDone ? handleOpenCert(c) : openActivity(c))}
  ```

- `openActivity(c)` opens `LmsActivityPlayer`. If the course has no `reading_completed_at`,
  start at **Stage 1 (reading)**; if reading is already done, start at **Stage 2 (quiz)**.
  (The old `handleStartCourse` Assigned → In Progress write is now done by §2d
  `completeLearningReading`.)
- **Labels (§10):** Materials button → `Start Reading →` / `Continue Reading →` /
  `View Certificate`; Assessment button → `Take Assessment →` **disabled** with tooltip
  "Read the handbook first" until reading completes, then `Take Assessment →` / `View Result`.
- On `onCompleted` → re-fetch `essApi.myPerformance()` (same refresh already at L184) so
  stats/cards update live.
- Keep `LmsCertificateModal` mount (L620) untouched.

---

## 6. Flag + rollback (history-safe)

- Gate with env: `ESS_LMS_QUIZ_ENABLED=false` → `config('services.ess_lms.enabled')`; when
  off, register no new routes and hide the player (cards fall back to today's
  `updateLearningProgress` behavior).
- **Rollback:** all additive (1 migration + new service/endpoint/component + 2 tiny UI
  edits). `php artisan migrate:rollback` drops the columns/table; the code reverts via
  `git revert` of the feature commits — **no force-push / rebase / amend**, per
  `frontend/AGENTS.md`.

---

## 7. Build sequence

| Phase | Deliverable | Status |
|---|---|---|
| 0 | Migration **§1a + §1b (attempts) + §1c (`completion_source`) + §1d (card columns) + §1e (`reading_completed_at`)**; patch handbook `content_text` onto the existing catalog | ✅ `1098f1b` |
| 1 | `/extract-document` + `NlpService::extractDocumentText`; `LmsQuizGenerator` | ✅ `4550355` + `4a40e3b` |
| 2 | `learningMaterial` / `learningQuiz` / `submitLearningQuiz` / `completeLearningReading` endpoints + hard read gate (§2b / §2d) | ✅ `8b86331` |
| 3 | `LmsActivityPlayer.tsx` (two-stage: reading → quiz) + `EssPerformanceTab` wiring | ✅ `f56fc95` |
| 4 | Deterministic fallback bank, timer, retake, flag, **per-attempt question/option shuffle**, polish | ✅ `2aba8a1` |
| 4.1 | Verification pass (real HTTP round-trip) + **completed-course lock** — an already-`Completed` module cannot re-open the assessment or report a stale score | ✅ this commit |
| 5 *(opt)* | HR admin review column (surface `completion_source` + score) | ⬜ |

Rough shape: phases 0–3 = a working version; 4–5 = hardening.

**Phase 4 note — stateless per-attempt shuffle.** `quiz_json` stays in canonical order; each
`GET …/quiz` picks a random `attempt_seed`, shuffles question order and each question's options
(with `LmsQuizGenerator::permutation()`, an xorshift32 Fisher-Yates that does not touch PHP's
global RNG), and returns the seed. The client echoes the seed on submit and the server rebuilds
the same option order to map the *displayed* position back to the canonical index before grading.
The seed is safe to expose — it reveals only display order, never `correct_index`. No DB column,
no cache, no session state (so two open tabs cannot corrupt each other). A submission without a
valid seed is rejected (`attempt_seed` required).

**Phase 4 note — kill switch.** `ESS_LMS_QUIZ_ENABLED=false` → `config('services.ess_lms.enabled')`
= false unregisters all five new ESS learning routes, so the cards fall back to the previous
flow (`updateLearningProgress` + HR `verifyLearning`). Rollback = `git revert` + `migrate:rollback`.

**Phase 4 note — completed-course lock (verification fix).** A full HTTP round-trip
(login token → `my-performance` → `material` → read gate `409` → shuffled `quiz` → `submit` →
`certificate`, plus a write-path pass on `LMS-103` and restore) confirmed every endpoint and
surfaced one defect: a module that was already `Completed` (fixture / HR / import) could still
be pushed from the **Materials** card through reading → assessment, and submit then reported
`already_completed: true` with the *stored* score (e.g. `95`) even for a fresh 10/10 attempt —
confusing and misleading. Fixed in the player: the reading footer offers **View certificate**
when `material.status === 'Completed'`, and Stage 2 is replaced by an "already completed" panel
when `quiz.already_passed` is true. `Completed` remains terminal; no backend grading change.

---

## 8. Decisions (all resolved)

> Resolved: **course identity = option C** (§0) · **#1 quiz source = A (AI-generate + cache)** ·
> **#2 AI keys = A (shared Groq → OpenRouter → Gemini)** · **#3 completion = A (quiz sets
> `Completed` immediately)** · **#4 attempts table = A (include)** · **#5 card-parity columns =
> A (include)** · **read-then-quiz order = adopted** (§10) · **#6 reading gate = hard** ·
> **#7 layout = B (two-stage player)**.

1. ✅ **Questions source — A: AI-generate + cache.** Generate once from the handbook text on
   first `GET …/quiz`, store in `learning_courses.quiz_json` (§2b). Deterministic fallback stays.
2. ✅ **AI keys — A: reuse the shared chain** (Groq → OpenRouter → Gemini, already in `.env`).
   No dedicated `LMS_*` keys for Tier-1.
3. ✅ **Completion rule — A: quiz sets `Completed` immediately on pass** (§2c). HR keeps
   `verifyLearning` as override; `completion_source` (§1c) distinguishes the two. `Completed`
   is terminal; retakes only while not completed.
4. ✅ **Attempts table — A: include** `employee_learning_attempts` (§1b).
5. ✅ **Card-parity columns — A: include** pages / read-minutes / `mandatory` (§1d).

6. ✅ **Reading gate — hard:** server-enforced via `reading_completed_at` (§1e / §2b).
7. ✅ **Reading↔quiz layout — B:** one player modal; reading stage then quiz stage
   (Assessment tab = shortcut into the same player).

---

## 9. Risks

- **`nlp-service` must be running** — keep the deterministic fallback (from
  `content_text` or a hand-authored mini-bank).
- **Never ship the answer key to the client** — grade server-side; key returned only in
  the submit response.
- **Answer circulation** — `quiz_json` is cached **per course**, so every employee gets the
  same items in the same order. Combined with immediate completion (#3 = A), answers could be
  shared. **Mitigated (Phase 4):** per-attempt question/option shuffle off a random
  `attempt_seed` — same bank, no extra AI cost, and the seed leaks nothing (see the Phase 4 note
  in §7).
- **AI mis-key** — a bad question can unfairly fail someone, or unfairly pass them (issuing a
  certificate). Deterministic fallback, `generated_by`, the §1b attempts log, and the HR
  `verifyLearning` override are the safety net; an HR "recent completions" review (Phase 5)
  closes the loop.
- **AI cost/latency** — cache per course (`quiz_json`); reuse existing quota/cooldown
  tooling for "AI busy, try later".
- **Extraction quality** — scanned handbooks need OCR (available via Tesseract in the NLP
  service); clean PDFs are trivial.
- **Scope = ESS Performance only** — stays inside `Modules/EmployeeSelfService`; no new
  module, no touching HR core.

---

## 10. Reading prerequisite — read → then quiz (adopted)

**Decision (confirmed):** the intended/expected order is **read the handbook first, then take
the quiz.** This is now an adopted rule, not just narrative.

### Where things live (confirmed)

| Tab | Contents | Action label |
|---|---|---|
| **Materials** | the handbook / learning module (reading) | `Start Reading →` / `Continue Reading →` |
| **Assessment** | the quiz + score/result | `Take Assessment →` (after reading) / `View Result` |

The Assessment row is the **second step** of the same course, not a parallel shortcut.

### Current state (not yet wired)

- `filteredMaterials` and `filteredAssessments` are derived from the **same** `courses`
  array (`EssPerformanceTab.tsx` L102–104) — Assessment is a re-labelled view, not a locked stage.
- Both cards call the **same** handler `isDone ? handleOpenCert(c) : handleStartCourse(c)`
  (Materials L480, Assessment L589).
- The mockup player renders reading + quiz **side by side** — the opposite of the decided flow.
- `employee_learning` has **no reading-completion column** (`status/score/assigned_date/completed_date`
  only — migration `..._000028`); §1a–§1d add none. So "finished reading" is currently unknowable.

### Decision (locked)

- **Layout #7 = B:** a single `LmsActivityPlayer` modal with **reading stage → quiz stage**.
- **Gate #6 = hard:** the server refuses to serve quiz questions until reading is recorded.

### Required changes

1. **Track reading completion (§1e)** — `reading_completed_at` timestamp on `employee_learning`;
   set by `POST …/reading-complete` (§2d).
2. **Re-sequence the player (§5b)** — reading stage first, quiz stage second; entered only after
   the reader confirms ("Finish reading → Start Assessment").
3. **Gate the quiz server-side (§2b)** — `GET …/quiz` returns `409 { code: "reading_required" }`
   while `reading_completed_at` is null. The client gate is a convenience; the server gate is
   the rule.
4. **Relabel the cards (§5c)** — Materials `Start Reading →` / `Continue Reading →`;
   Assessment `Take Assessment →` disabled ("Read the handbook first") until unlocked.

---

## Reference — Oxford Suites SOP catalog (same property)

The reference repo seeds five SOP handbooks (`scratch/seed_lms_documents.php`). We are the same
property, so this is our operational vocabulary — kept as **reference only** under option (C)
(our seed stays `LMS-101`/`102`/`103`).

| ID | Title | Category | Department | Pages | Read | XP | Mandatory |
|---|---|---|---|---|---|---|---|
| `lms-sop-101` | SOP 101: Front Office PMS & VIP Guest Service Mastery | SOP Manual | Front Office | 14 | 20 min | +100 | ✅ |
| `lms-sop-201` | SOP 201: HACCP Food Safety, Hygiene & Kitchen Sanitation | Compliance & Safety | Kitchen | 18 | 25 min | +150 | ✅ |
| `lms-sop-301` | SOP 301: Luxury Housekeeping & Turndown Quality Standards | SOP Manual | Housekeeping | 12 | 15 min | +100 | ❌ |
| `lms-sop-401` | SOP 401: Food & Beverage Table Service & Wine Etiquette | SOP Manual | Food & Beverage | 15 | 18 min | +100 | ❌ |
| `lms-sop-501` | SOP 501: Crisis Management, Fire Safety & De-escalation Protocol | Compliance & Safety | Property-Wide | 22 | 30 min | +200 | ✅ |

Field mapping to our `learning_courses`:

| Reference (`lms_documents`) | Ours (`learning_courses`) |
|---|---|
| `id` (e.g. `lms-sop-101`) | `course_code` |
| `title` | `title` |
| `category` | `category` |
| `description` / `learning_outcomes` | `description` (or `content_text`) |
| `file_path` (PDF) | `material_path` (optional) — else `content_text` |
| `estimated_pages`, `estimated_reading_minutes`, `manatory` | optional §1d columns (`mandatory`, spelled correctly) |

**Employee flow (mirrored):** Read handbook → tap **Quiz** → pass ≥80% → status `Completed` →
certificate. **Visibility:** mandatory courses show to all; non-mandatory only when assigned
(an `employee_learning` row exists).

---

## Reference — external repo (what we're mirroring)

`Watot12345/ClonePerformanceDevelopment`: `database/lms_documents.sql` (handbook library),
`database/lms_prescribed.sql` (per-employee score/progress/status),
`scratch/seed_lms_documents.php` (the 5-SOP catalog), `js/lms/library.js` (bookshelf +
mandatory/prescribed visibility), `js/lms/quiz.js` (10-item, 10-min, navigator, auto-grade,
pass ≥80%), `controllers/LmsController.php` (`extractTextFromBookFile`, `generateQuiz`,
`submitQuizResult`, `addLmsSpecificTaskToPerformance`), Gemini with a deterministic fallback.

> Excluded from Tier-1 (see §0): XP (`xp_transactions`), `ratings`, `performance_tasks`,
> `performance_goals`/`goal_id`, competency → succession readiness, and the TNA
> prescription flow — those belong to a later tier if we decide to couple LMS to Performance.
