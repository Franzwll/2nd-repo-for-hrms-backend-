# Resume Screening (RS) Process — Step-by-Step with Validation

> Oxford Suites Makati HRMS — Applicant Management + spaCy NLP Screening
> Compiled and source-verified from: `backend-laravel/Modules/ApplicantManagement/`, `backend-laravel/app/Services/NlpService.php`, `nlp-service/app/`, `docs/NLP_FEATURE_DOCUMENTATION.md`, `docs/APPLICANT_MANAGEMENT_FEATURE.md`
> **Live-validated:** every figure in §13 comes from an actual end-to-end run of the running NLP service (`http://127.0.0.1:8001`) using the repository's own resume `reference/RESUME/Julian Rivera — Guest Services Professional.pdf` against seeded job post #1 (Front Desk Receptionist).

**Screening philosophy (read first):**

- Screening is always **resume VS job requirements** — no Job Post, no score.
- The score is **explainable and auditable**: every point has a named criterion, a weight, and a stored breakdown row.
- **Validation never silently drops and never silently rejects**: unrecognized items are kept visible and flagged; only documented validation rules (missing information, malformed contact data, unverifiable required credentials, contradictions against uploaded proof) can block or escalate a candidate.
- Local-only spaCy (no cloud LLM cost, RA 10173 compliant). HR owns the final decision; the system ranks and explains.

---

## Contents

0. System overview
1. Precondition — Job Post & Job Requirements (before any resume is accepted)
2. Data input — Resume intake (two entry points)
3. Laravel → NLP request assembly
4. NLP Stage 1 — Text extraction + file-format validation
5. NLP Stage 2 — Cleaning & OCR repair
6. NLP Stage 3 — Section detection
7. NLP Stage 4 — Named Entity Recognition (4 layers)
8. NLP Stage 5 — Taxonomy canonicalization
9. NLP Stage 6 — Profile assembly + validation gate (MISSING / INVALID_FORMAT)
10. NLP Stage 7 — 7-point credential verification
11. NLP Stage 8 — Multi-criteria scoring
12. NLP Stage 9 — Decision classification + document blending
13. Live-validated example (Julian Rivera × Front Desk Receptionist)
14. Persistence & UI presentation
15. Recompute paths & supporting-document verification
16. Validation terminology & rules matrix
17. Endpoint & payload reference
18. Failure modes observed + reproduction commands

---

## 0. System overview

```
[Job Post + Job Requirements]  ← must exist & be Open/Active before any resume is accepted
        │
[Resume upload] → Laravel validates file, stores it, builds the requirements payload
        │
[NLP pipeline]  OCR → clean → sections → NER → canonicalize → validate → credential-check → score → classify
        │
[Persistence]   applicant_screenings + scores + entities + applicants.fit_score/status/summary/flags
        │
[UI]            Candidate Ranking, score badge, radar, flags, alternative-job transfer
```

- The frontend **never** talks to Python directly — Laravel Sanctum is the single auth boundary.
- The NLP service is a local FastAPI app (`nlp-service/app/main.py`, port **8001**); Laravel reaches it via `App\Services\NlpService` (`NLP_SERVICE_URL`, default `http://127.0.0.1:8001`).
- Two compute tiers of this process are testable in isolation: Laravel services (`ScreeningService`, `NlpService`) and the pure Python stages (`matching.py`, `screening.py`, `verification_scoring.py`).

---

## 1. Precondition — Job Post & Job Requirements (Validation Gate A)

Screening cannot run without a matching Job Post: the resume is always matched **against** requirements. This gate happens **before any resume data is input**.

### 1.1 HR creates the post

1. HR creates a **Requisition → converts to Job Post**, or builds a Job Post directly in the Recruitment module (Job Post Builder).
2. The post is published with **`status='Open', active=1`** so it appears on the public Careers portal and participates in alternative-job matching.
3. The post can be seeded from a reusable **Requirement Template** (`screening_requirement_templates` + items): one click "Use in job post" fills Required Skills + Qualifications + Education + Experience for a position.

### 1.2 The four screening inputs (stored in `job_posts`)

| Job Post field | Becomes | Example (seeded job post #1) |
|---|---|---|
| `skills_json` | `required_skills` | `["Customer Service","Communication","Hotel Operations","Problem Solving","Time Management"]` |
| `qualifications_json` | filtered by `ScreeningService::extractRequiredCertifications()` for keywords `NC / certificate / certification / license` → `required_certifications` (max 4, de-duplicated) | this post has no cert keywords → `[]` |
| `education_level` | `education_level` | `Bachelor's Degree` |
| `experience_level` | `experience_level` → parsed by `matching.py:parse_min_years()` | `1-2 Years` → `min_years_experience = 1.0` |

`parse_min_years()` rules: `"No Experience"/"None"` → `0.0`; takes the **lowest number** found (`"1-2 Years"` → `1.0`, `"3-5 Years"` → `3.0`, `"5+ Years"` → `5.0`); no number → `0.0`.

**Validation inside Laravel** — `ScreeningService::buildRequirements(JobPost)` (`Modules/ApplicantManagement/app/Services/ScreeningService.php:43`) always emits the canonical shape:

```json
{
  "job_post_id": 1,
  "title": "Front Desk Receptionist",
  "required_skills": ["Customer Service", "Communication", "Hotel Operations", "Problem Solving", "Time Management"],
  "preferred_skills": [],
  "education_level": "Bachelor's Degree",
  "experience_level": "1-2 Years",
  "required_certifications": [],
  "required_information": ["name", "email", "phone"]
}
```

### 1.3 HR-configurable screening setup

Stored in `system_settings` under `screening.configuration` and loaded by `ScreeningService::screeningSettings()`:

- Weights — default **Skills 40 / Experience 30 / Education 20 / Certifications 10** (`nlp-service/app/config.py:SCORE_WEIGHTS`).
- `passing_score` — default **75** (0–100).
- `required_skills_coverage_min` — default **0.60** (60%).
- Disabled criteria keep their row but contribute `0` weight, so HR can switch a criterion off without losing its value. A wrong-shaped configuration (not exactly 4 criteria) returns `null` → NLP uses documented defaults. Python re-clamps values (`passing_score` 0–100, coverage 0–1) so bad input can never corrupt scoring.

### 1.4 Reference taxonomy (alias dictionary)

`screening_reference_data` holds canonical **skills / job_roles / certifications** plus aliases, managed from the UI (`ScreeningReferenceController`, cached 5 min). It is sent per request; if empty, Python falls back to bundled seed JSON (`nlp-service/app/data/*.json`) — no silent behavior change. HR can **"Promote to Canonical"** an unrecognized item from the portal; it is inserted with aliases, no deploy needed.

### 1.5 The "open jobs" list for alternative matching (Gate A2)

`ScreeningService::buildOpenJobs(?JobPost $exclude)` (`ScreeningService.php:60`) collects every OTHER post with `active=1 AND status='Open'`, and **drops posts with no criteria at all** (no skills + no certs + no education + no experience) because such a post would trivially score 100% and pollute recommendations. In the seeded data, applying to post #1 produces alternatives: Line Cook (2), Housekeeping Attendant (3), Restaurant Server (4), Bartender (5) — HR Assistant (6) is `active=0` and therefore excluded.

**Gate A validation summary (must all pass before any resume is accepted):**

| # | Check | Where enforced | Failure behavior |
|---|---|---|---|
| A1 | Job post exists | `JobPost::find()` in `screenAndPersist` / `screenPreviewFile` | screening skipped / preview `{"success":false,"error":"Job post X not found."}` |
| A2 | Post is Open + Active | `buildOpenJobs`, Careers portal listing | post cannot be applied to / not offered as alternative |
| A3 | Requirements shape | `buildRequirements` + Python `matching.parse_requirements` | empty criteria → post excluded defensively |
| A4 | Request field `job_post_id` valid | `ApplicantManagementController::screenResume` (`exists:job_posts,job_post_id`) | HTTP 422 validation error |

---

## 2. Data Input — Resume Intake (Two Entry Points)

Both paths land in the same Laravel ingestion pipeline.

### 2.1 Path A — Candidate applies on the Careers page

`frontend/src/routes/_landing/jobs.$jobId.tsx` — the candidate selects a **specific published job**, uploads PDF / DOCX / PNG / JPG, and the form posts multipart to `POST /api/v1/applicants`. Laravel validates, stores the file, creates the `applicants` row, then runs `ScreeningService::screenAndPersist()`.

### 2.2 Path B — HR walk-in / Add Applicant wizard

`frontend/src/components/modules/ApplicantManagement.tsx` (`AddApplicantModal`):

1. **Upload → auto-fill.** `POST /api/v1/applicants/extract-resume` runs a lightweight NLP pass (text extraction + profile only, **no scoring**). The controller returns only `name/email/phone/address` + `processing_status` (502 on NLP failure) and the wizard fills empty contact fields in under ~2 s.
2. **Preview screening (optional but recommended).** `POST /api/v1/applicants/screen-resume` validates `resume` (`required|file|max:20480`) and `job_post_id` (`required|integer|exists:job_posts,job_post_id`), stores the file under `resumes-tmp` (local disk) and calls `screenPreviewFile()`. The temp file is always deleted (`finally`). Response: `200` with the full screening payload, or `502` with `{"success":false,"processing_status":"FAILED","error":...}`. Every preview writes a `Resume Screening Preview` audit entry (Info on success, Warning on failure).
3. **Submit.** `POST /api/v1/applicants` creates the applicant; if the wizard carries the preview result in `screening_payload`, `screenAndPersist()` **reuses it** so the NLP service is not called twice for the same resume.

### 2.3 Intake validation rules (enforced before screening)

| # | Rule | Where | Failure behavior |
|---|---|---|---|
| B1 | `resume` present, is a file, ≤ 20 480 KB | `screenResume()` / `extractResume()` / `StoreApplicantRequest` | HTTP 422 validation error |
| B2 | `job_post_id` present & exists | `screenResume()` | HTTP 422 |
| B3 | Duplicate guard — same **email + same job + active stage** | `DuplicateApplicationService::findDuplicate` in `store()` | HTTP 409 with the existing applicant |
| B4 | Resume stored + hashed | `store('resumes','public')`, `DuplicateApplicationService::hashFile()` | file kept in `storage/app/public/resumes/`, `resume_hash` on the row |
| B5 | Screening only when a resume exists | `store()` (`if ($applicant->resume_file_path)`) | applicant created without screening |
| B6 | Original filename kept for audit | `resume_original_name` column | — |

---

## 3. Laravel → NLP Request Assembly

`ScreeningService::screenAndPersist()` (`ScreeningService.php:219`):

1. Loads the applied `JobPost` (skips with a log warning if missing).
2. Builds `requirements` (§1.2) and `openJobs` (§1.5).
3. Reuses the wizard's precomputed preview result when valid; otherwise calls
   `NlpService::screenResumeStructured($absolutePath, $basename, $requirements, $openJobs, referenceData: …, screeningSettings: …, documentVerifications: …)` with a **120 s timeout**.
4. `documentVerifications()` forwards every stored supporting document that already has a `verification_status` (PENDING rows included — Python ignores them) as
   `{applicant_document_id, doc_type, verification_status, verification_result:{checks, summary}}`.

**The multipart request Laravel sends** (`POST {NLP_SERVICE_URL}/screening/score`):

```
file                   = the resume binary
requirements           = JSON string (requirements shape above)
open_jobs              = JSON string (array of the same shape, excluding the applied post)
reference_data         = JSON string or omitted  (DB-managed alias dictionary)
screening_settings     = JSON string or omitted  (weights / passing_score / coverage min)
document_verifications = JSON string or omitted  (verified COE / Certificate / Credential rows)
```

**NLP service reception** (`main.py:screening_score()`):

- `_parse_json_field()` — invalid JSON in any field → **HTTP 422** `"requirements/open_jobs/reference_data must be valid JSON strings."`
- Writes the upload to a temp file, runs `pipeline.analyze_resume_file(...)`, deletes the temp file, and returns the full JSON — or **HTTP 422** with the structured body `{"success":false,"processing_status":"FAILED","error":...,"file":{"name":...}}` when extraction fails.
- `_safe()` converts any unexpected internal error into a structured failure dict, so clients never receive a bare 500 and no failure is silent.

**Response contract (what comes back):** `success`, `profile`, `entities`, `sections_detected`, `estimated_years_experience`, `validation{missing_information, invalid_format, skill_analysis, job_role_analysis, credential_analysis, credential_issues, credential_verification, review_flags}`, `requirements_applied`, `match_score`, `resume_match_score`, `document_verification`, `score_breakdown`, `screening_status`, `screening_reasons[]`, `matched_summary`, `alternative_job`, `mandatory_requirements_met`, `model_info`, `processing_status`, `text_extraction`, `_timing_seconds`.

**Failure persistence:** if the call fails (`ok=false`) or the profile is unusable, `persistResult()` still writes an `applicant_screenings` row with `processing_status='FAILED'` and the error message (truncated to 1000 chars), so a failed screening is never silent.

---

## 4. NLP Stage 1 — Text Extraction + File-Format Validation

`text_extraction.py:extract_text()` dispatches by extension:

| Input | Engine |
|---|---|
| Digital PDF | `pypdfium2` TextPage + `pdfplumber` fallback; `_structure_score()` preserves 2-column layouts |
| Scanned PDF (no text layer) | Rasterize at 2.0× zoom → `pytesseract` OCR |
| Image PNG/JPG/BMP/GIF/TIF/WEBP | `pytesseract` + OpenCV/Pillow CLAHE, deskew, blur mitigation |
| DOCX | `python-docx` paragraph/table walker in reading order |
| TXT | UTF-8 → Latin-1 fallback, strips null bytes |

Output: `raw_text` + `{method, pages, extension, warnings}`.

**Validation rules (Gate C1):**

| Check | Rule | Result on failure |
|---|---|---|
| Filename present | cannot determine format | `ExtractionError` |
| File exists on disk | path must exist | `ExtractionError` |
| Supported format | `.pdf .docx .txt` + images; anything else | `"Unsupported resume format '.exe'. Supported: PDF, DOCX, TXT and common images."` → `processing_status=FAILED` |
| Non-empty text | extracted text must not be empty | `"No readable text could be extracted from 'X'."` → `FAILED` |
| OCR quality | image OCR always warns | warning `"Text extracted from image using OCR; accuracy may be lower."` |
| OCR per page | page yields nothing | warning `"Page N: OCR produced no readable text."` |
| OCR fallback errors | rasterize/OCR crash | `PARTIALLY_PROCESSED` + error message |

Extraction failure propagates as **HTTP 422** with the structured body (never a bare 500), and the Laravel side records it as a failed screening + audit warning.

**Live evidence (Julian's resume):** `method: "pdf-ocr (pypdfium2+tesseract)"`, `pages: 2`, `character_count: 3300`, no warnings — i.e. the 2-page scanned PDF was OCR'd, and 3300 characters is well above the "no readable text" failure bar.

---

## 5. NLP Stage 2 — Cleaning & OCR Repair

`preprocessing.py:preprocess()` repairs common OCR/format noise on the raw text:

- **Email repair:** `(at)/[at]/ at → @`; join split local parts (`dan\niel.cruz@gmail.com → daniel.cruz@gmail.com`); domain typos `gmai1/gmial/gnail → gmail`, `yah00 → yahoo`, `.c0m/.corn → .com`.
- **Phone normalization:** PH regexes for `+63 9XX XXX XXXX`, `09XX-XXX-XXXX`, `(02) 8XXX-XXXX loc`.
- **Contact-line disentangling:** address + email + phone + LinkedIn mixed onto one OCR line are separated.

Output: `cleaned_text` — this is the text all later stages read. Emails that remain malformed are forwarded as `emails_malformed[]` so Stage 6 can raise `INVALID_FORMAT` (see §9).

---

## 6. NLP Stage 3 — Section Detection

`section_detection.py:detect_sections()` uses rule-based + fuzzy header matching with **cutoff ≥ 0.72**, so OCR-mangled headers like `PROFESIONAL SUMARY` or `WORK EXPRINCE` still map to the correct section:

`Education / Experience / Skills / Certifications / Summary-Objective / Contact / Additional (References, Affiliations, Languages)`

Each section is returned as a **character-offset span**, which makes the later NER stage section-aware (e.g., only skills inside the Skills/Competencies region are trusted as skills). Julian's live run detected: `["additional","education","experience","skills"]` — all four relevant sections, so his skills and work history were read from the correct areas.

---

## 7. NLP Stage 4 — Named Entity Recognition (4 Layers)

`entity_extraction.py:extract()` combines four layers:

1. **Regex** — emails, phones, date intervals (`YYYY-YYYY`, `Month YYYY – Present`).
2. **Section rules** — competencies bounded inside the Skills section.
3. **spaCy `en_core_web_sm`** — sentence segmentation, `PERSON`, `ORG`.
4. **Custom `role_specific_ner`** — hospitality-tuned model trained on annotated hotel resumes (`nlp-service/training/data/annotated_resumes.json`); loaded at startup, visible at `/health` (`custom_ner_loaded: true`).

Labels emitted: `PERSON` (applicant name, not references), `EDUCATION`, `JOB_TITLE`, `SKILL`, `CERTIFICATION`, plus `work_history[] {job_title, company, period, date_range}`, `estimated_years_experience`, `emails_malformed[]`.

**Live evidence (Julian):** 35 entities → PERSON 1, EDUCATION 1, JOB_TITLE 3 (Front Desk Associate, Restaurant Cashier, Concierge), SKILL 23, ORGANIZATION 5, EMAIL 1, PHONE 1.

---

## 8. NLP Stage 5 — Taxonomy Canonicalization

`reference_data.py:canonicalize()` maps every raw variant to a canonical concept via a 4-step cascade:

```
Exact (case-insensitive) → Substring boundary → Token-set permutation → Fuzzy SequenceMatcher ≥ 0.82
```

Example: `"knowledgeable in point of sale micros systems" → "POS Systems" (RECOGNIZED)`.

**No Silent Dropping rule:** anything not in the dictionary becomes `UNRECOGNIZED`, is kept visible in the profile with an orange badge, and is **never penalized** — it only flags for HR review. HR can `Promote to Canonical` from the portal (row inserted into `screening_reference_data` with aliases, no deploy).

`classify_items()` produces the recognized/unrecognized split for skills, job roles, and certifications separately.

**Live evidence (Julian):** 13 recognized skills (Cash Handling, Check-in / Check-out, Complaint Handling, Concierge Services, Customer Service, Front Office Operations, Guest Relations, Housekeeping Operations, MS Office, Night Audit Procedures, Property Management Systems, Reservations, Upselling); 10 unrecognized (CPR Certified, Conflict Deescalation, First Aid, Manager, OpenTable, Oracle Hosp, Oracle Hospitality, Salesforce CRM, ServSafe Food Protection, VIP Arrival Protocol); roles recognized (Concierge, Front Desk Associate, Restaurant Cashier) vs unrecognized ("feedback rating on post-stay surveys"). All kept, none dropped.

---

## 9. NLP Stage 6 — Profile Assembly + Validation Gate (MISSING / INVALID_FORMAT)

### 9.1 `build_profile()` — standard applicant profile

```json
{
  "personal_information": {"name": "...", "email": "...", "phone": "...", "address": "..."},
  "education": ["Bachelor of Science in Hospitality Management"],
  "work_experience": [{"job_title": "...", "company": "...", "location": "...", "period": "...", "recognized_role": true}],
  "skills": [recognized skills only],
  "certifications": [recognized + unrecognized, kept visible],
  "unrecognized_certifications": [],
  "estimated_years_experience": 0.0,
  "estimated_experience_months": 0,
  "job_roles": {"recognized": [], "unrecognized": []},
  "unrecognized_skills": []
}
```

`_prefer_mobile()` picks the best contact number: PH mobile first (`09XXXXXXXXX` 11 digits, `63XXXXXXXXXX` 12 digits, or 10 digits starting with 9), otherwise the first extracted phone.

### 9.2 `validate()` — first validation gate

`required_information` comes from Laravel (`["name","email","phone"]`, default `config.DEFAULT_REQUIRED_INFORMATION`). Rules:

| Type | Trigger | Downstream effect |
|---|---|---|
| **MISSING** | `name` absent; `email` absent (and not malformed); `phone` absent; `education` absent when required; `work_experience` absent when required and no estimated years | `mandatory_requirements_met=false` → blocks `PERFECT_FOR_THE_JOB`; surfaced in reasons as "Essential information missing: …" |
| **INVALID_FORMAT** | email fails strict regex `^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$` (or was flagged malformed during preprocessing → `"Malformed email address: X"`); phone fails `_phone_is_valid()` — 7–15 digits total, PH mobile must be 10 digits after stripping `0`/`63` and start with 9 → `"Incomplete or malformed phone number: X"` | each entry is also pushed into `credential_issues[] {type:"INVALID_FORMAT"}` → **forces INVALID_CREDENTIAL** at classification time |
| **UNRECOGNIZED** | skill/role not in reference data | `skill_analysis.unrecognized` / `job_role_analysis.unrecognized` + `review_flags` — **flagged for manual review only, never auto-rejected** |

### 9.3 `analyze_with_certifications()` — second validation gate (credential analysis)

- Every `required_certification` is canonicalized, then exact-matched, then substring-matched (only when both strings are ≥ 5 chars so short keys like `"nc ii"` can't ride inside unrelated names) against the applicant's certifications → row `{required, status: RECOGNIZED | MISSING, matched_value}`.
- Extracted certifications not in reference data → row `{status: UNRECOGNIZED}` with note `"Invalid or requires verification based on system validation rules."`
- **Escalation rule:** if the job requires certifications **and zero matched** **and** the applicant listed certification-like entries that could not be validated → issue `UNVERIFIABLE_REQUIRED_CREDENTIAL` (MISSING rows flipped to `UNVERIFIABLE` → `INVALID_CREDENTIAL`). **Pure absence** (applicant listed none at all) stays a qualification gap — it gates PERFECT but is NOT treated as fraud.

**Live evidence (Julian):** `missing_information: []`, `invalid_format: []`, `credential_analysis: []`, `credential_issues: []`, one `review_flags` entry (`UNRECOGNIZED_JOB_ROLE: feedback rating on post-stay surveys — flagged for manual review only`). Clean validation gate.

---

## 10. NLP Stage 7 — 7-Point Credential Verification

`credential_verification.py:verify_credentials()` audits the profile + work history for internal consistency. Each **WARNING = −5 pts** (capped at **−15**); **≥ 3 WARNINGs → `escalate_invalid=true` → `INVALID_CREDENTIAL`**.

| # | Check | Rule |
|---|---|---|
| 1 | Timeline Overlaps | two full-time roles overlapping ≥ 3 months (OJT / intern / part-time / freelance exempt; same-company promotion exempt) |
| 2 | Future Dates | start/end beyond the current month/year; education year > current + 5 |
| 3 | Experience vs Graduation Gap | claimed years exceeds years-since-graduation by ≥ 5 (allows up to 4 yrs working through college) |
| 4 | Seniority Mismatch | Executive titles (Director/GM/VP/Chief/Exec Chef) with < 2.5 yrs; Manager with < 1 yr |
| 5 | Job Hopping | ≥ 5 full-time positions within 24 months → **INFO only, no penalty** |
| 6 | Licensure Prerequisites | CPA / PRC Nurse-Engineer / LET / RND / Criminologist claimed with education rank below Bachelor's (rank 4) |
| 7 | Chronological Incoherence | inverted spans (`2024-2021`); earliest work > 15 yrs before graduation |

Returns `{flags[], warning_count, info_count, risk_level LOW/MEDIUM/HIGH, score_penalty, escalate_invalid, summary}`; flags are merged into `validation.review_flags[]` and, when escalated, a `credential_issues[] {type: CREDENTIAL_VERIFICATION_CONCERN}`. The penalty is subtracted from the resume score **before** document blending (see §12 step 1).

**Live evidence (Julian):** `risk_level: LOW`, `warning_count: 0`, `score_penalty: 0.0`, "All internal credential consistency checks passed." — his May–Aug 2025 and Aug 2024–Apr 2025 timeline is coherent.

---

## 11. NLP Stage 8 — Multi-Criteria Scoring

`matching.py:match_profile_to_requirements()` — explainable 100-point model (HR weights from §1.3 override the defaults; both `0.4` and `40` shapes accepted, normalized by `_validated_weights()`):

```
Overall = Skills×0.40 + Experience×0.30 + Education×0.20 + Certifications×0.10

S (Skills)       = 100 × (0.70 × matchedRequired/totalRequired + 0.30 × matchedPreferred/totalPreferred)
                   (exact matches first; then alias canonicalization; then fuzzy difflib ≥ 0.88;
                    multi-token subset matches count; preferred term counts 100% when the job defines none)
E (Experience)   = 100 × min(1, applicantYears / minYearsRequired)          [parse_min_years()]
A (Education)    = 100 × ratio(gap) on the 6-tier ladder:
                   HS(1) < Vocational/TESDA(2) < College level(3) < Bachelor's(4) < Master's(5) < Doctorate(6)
                   gap 0 → 1.0 | gap 1 → 0.5 | gap ≥ 2 → 0.25 × max(0, 3−gap)
C (Certs)        = 100 × matchedRequired/totalRequired                      [100% if the job defines none]
```

Every component is normalized to its weight (e.g., Skills earned is out of 40) and the breakdown records everything needed for the UI radar + reasons:

- skills: `matched_required`, `fuzzy_matched_required {required: found}`, `missing_required`, `matched_preferred`, `missing_preferred`, `required_coverage`, `preferred_coverage`
- experience: `estimated_years`, `min_years_required`, `requirement_met`
- education: `applicant_highest_level`, `required_level`, `requirement_met`
- certifications: `matched`, `missing`, `no_requirements`

**Mandatory gate (validation before classification):**

```
mandatory_requirements_met =
      education_met
  AND experience_met
  AND required_skills_coverage ≥ required_skills_coverage_min (0.60)
  AND essential_information_complete (no MISSING entries)
```

`mandatory_detail` records each sub-check; `missing_requirements` bundles missing skills, missing certifications, missing information, education-below-requirement, experience-below-minimum — all persisted and displayed.

---

## 12. NLP Stage 9 — Decision Classification + Document Blending

`screening.py:full_classification()` — **order matters**, exactly as implemented:

1. **Resume penalty applied.** `resume_score = match_score − credential_penalty` (−5/warning, cap −15). A reason sentence is appended when a penalty applies.
2. **Document evidence blended into the RANKING score** (`verification_scoring.py`):
   `Ranking = Resume×0.85 + Documents×0.15`, where `documents_score = mean(credit) × 100` over **decisive** documents only — `VERIFIED=1.0`, `UNABLE_TO_VERIFY=0.5`, `DISCREPANCY_FOUND=0.0`; PENDING/PROCESSING rows and unmappable "Others" are ignored. **No decisive docs → no-op** (resume score kept exactly). Evidence statuses: `NOT_PROVIDED / PENDING / VERIFIED / PARTIAL / DISCREPANCY`; a human summary + flags are appended.
3. **Blocker check → `INVALID_CREDENTIAL` (`credential`)**: any credential issue of type `INVALID_FORMAT | UNVERIFIABLE_REQUIRED_CREDENTIAL | CREDENTIAL_VERIFICATION_CONCERN`, **or** any supporting document with `DISCREPANCY_FOUND` (contradicting resume fields are quoted: Employer, Job title, Start date, Degree, Certification…). Reasons include the disclaimer that INVALID_CREDENTIAL means "invalid or requires verification based on system validation rules" — not fraud.
4. **Pass check → `PERFECT_FOR_THE_JOB` (`fit`)**: `mandatory_requirements_met AND ranking ≥ passing_score (75)`.
5. **Fallback → score every other Open job identically** (penalty + document blend applied too): eligible = mandatory met AND score ≥ 75 (alt threshold) AND outscores the applied job's score → `FIT_FOR_OTHER_JOB` (`other-role`) with `alternative_job {job_post_id, title, alternative_match_score, applied_job_score, matched_skills, reason}` + explanatory reasons.
6. **Else → `NOT_FITTED_TO_JOB` (`not-fit`)** with reasons: which mandatory checks failed (education, experience, coverage % with the missing list, missing info), plus if the score is below threshold the weakest component is named; alternative analysis is summarized (no eligible alternatives / top alternative reached X% / no other jobs supplied).

**Official status ⇄ stored status mapping** (`ScreeningService::STATUS_MAP`):

| Official | Stored in `applicants.status` | Label shown |
|---|---|---|
| `PERFECT_FOR_THE_JOB` | `fit` | Perfect for the Job |
| `INVALID_CREDENTIAL` | `credential` | Invalid Credential |
| `FIT_FOR_OTHER_JOB` | `other-role` | Fit for Other Job |
| `NOT_FITTED_TO_JOB` | `not-fit` | Not Fitted to Job |

**Processing status** (`analyze_resume_file`): `PROCESSED` only when there are no missing fields, no invalid formats, no unrecognized skills/roles, no extraction warnings and no credential warnings; otherwise `PARTIALLY_PROCESSED`; `FAILED` when extraction fails.

**Known message quirk (observed live):** in step 6, when the best alternative is blocked by the 60% coverage gate (not by the score), the sentence still reads "…reached only X%, below the 75.0% recommendation threshold" even when X > 75. The classification itself is correct (it was NOT recommended); only the wording is imprecise — a candidate for a future message fix in `screening.py`.

---

## 13. Live-Validated Example (Julian Rivera × Front Desk Receptionist)

**Setup actually executed** (against the live service, replicating exactly what Laravel sends):

- **Job post (input before any resume):** #1 Front Desk Receptionist — skills `[Customer Service, Communication, Hotel Operations, Problem Solving, Time Management]`, education `Bachelor's Degree`, experience `1-2 Years`, no certification keywords in qualifications.
- **Open jobs also sent:** #2 Line Cook, #3 Housekeeping Attendant, #4 Restaurant Server, #5 Bartender (criteria-bearing, Open + Active).
- **Resume input:** `reference/RESUME/Julian Rivera — Guest Services Professional.pdf` (2-page scanned PDF).
- **Call:** `POST http://127.0.0.1:8001/screening/score` with `file` + `requirements` + `open_jobs` (no settings / reference / documents → documented defaults + bundled reference data).

**What the pipeline produced (actual values):**

| Stage | Output |
|---|---|
| Extraction | `pdf-ocr (pypdfium2+tesseract)`, 2 pages, 3 300 chars, no warnings |
| Sections | additional, education, experience, skills |
| Entities | 35 total (PERSON 1, EDUCATION 1, JOB_TITLE 3, SKILL 23, ORG 5, EMAIL 1, PHONE 1) |
| Profile | Julian Rivera · julian.rivera@email.com · 1 (555) 342-8891 · BS Hospitality Management · roles: Front Desk Associate, Restaurant Cashier, Concierge · **estimated 1.08 yrs / 13 months** |
| Skills | 13 recognized, 10 unrecognized (kept, not penalized) |
| Validation | `missing_information []`, `invalid_format []`, 1 review flag (unrecognized role) |
| Credential verification | `LOW` risk, 0 warnings, **penalty 0.0** |
| Document evidence | `NOT_PROVIDED` → ranking = resume score (no-op blend) |
| Timing | **0.39 s** |

**Score breakdown (arithmetic verified):**

| Criterion | Earned / Max | Computation |
|---|---|---|
| Skills | **17.6 / 40** | required 1/5 matched (Customer Service) → 0.70×0.2 = 0.14; no preferred defined → +0.30; ×100×0.40 |
| Experience | 30 / 30 | 1.08 yrs ÷ 1.0 required → capped at 100% |
| Education | 20 / 20 | Bachelor's (rank 4) vs Bachelor's required, gap 0 → 100% |
| Certifications | 10 / 10 | job defines none → 100% (`no_requirements: true`) |
| **Overall** | **77.6 / 100** | 17.6 + 30 + 20 + 10 |

**Final classification (actual):**

- `screening_status`: **`NOT_FITTED_TO_JOB`**
- `match_score = resume_match_score = 77.6` (no documents to blend)
- `mandatory_requirements_met`: **False** — the single blocker
- Reasons: *"Required-skills coverage 20% is below the 60% minimum. Missing: Communication, Hotel Operations, Problem Solving, Time Management."* + *"Alternative job analysis: highest-scoring open position 'Restaurant Server' reached only 86.0%, below the 75.0% recommendation threshold."*
- `processing_status`: `PARTIALLY_PROCESSED` (unrecognized items flagged — No Silent Dropping)

**Alternative-job deep dive (verified with a second live call):** Julian scores **86.0%** against Restaurant Server (Customer Service + Upselling matched, coverage 50%) but it is **not eligible** because 50% < 60% coverage gate → cannot become `FIT_FOR_OTHER_JOB`. This also demonstrates the message quirk from §12 (86% is not "below 75%" — the coverage gate, not the score, blocked the recommendation).

**Why 77.6% still didn't pass:** the mandatory gate outranks the number. His profile is education/experience-strong but skill-covered only 20%; to flip to `PERFECT_FOR_THE_JOB` the post would need ≥ 3 of 5 required skills matched (≥ 60%) AND the score would need to stay ≥ 75.

> Historical note: the audit backup (`storage/app/backups/BKP-4-20260925-203753.sql`) logged this same persona as "Not Fitted to Job (79.00%)" from an earlier model/data version — same mechanics, minor score drift versus today's 77.6%.

---

## 14. Persistence & UI Presentation

**`ScreeningService::persistResult()` writes MySQL `hotel_hr`:**

- **`applicant_screenings`** — full audit row: `processing_status (PROCESSED/PARTIALLY_PROCESSED/FAILED)`, `screening_result (fit/credential/other-role/not-fit)`, `match_score` (ranking), `resume_match_score`, `score_breakdown_json`, `profile_json`, `entities_json`, `missing_information_json`, `validation_json`, `alternative_job_json`, `document_verification_json`, `reasons_json`, `model_info_json`, `error_message`, `processed_at`. On total failure a `FAILED` row with the error is still written.
- **`applicant_screening_scores`** — 4 rows per run (`Skills/Experience/Education/Certifications` → `earned`), powering the radar chart; previous rows are refreshed.
- **`applicant_screening_entities`** — one row per NER entity (Julian: 35 rows).
- **`applicants` row updated:** `fit_score` = ranking score, `status` = mapped official status, `summary` = `matched_summary` + document-evidence sentence + (for `credential`) verification summary or the standard disclaimer + (for `not-fit`) "No available position achieved the required qualification level.", and `flags_json[]` = invalid formats, `Unrecognized skill: X`, `Unrecognized job role: X`, `Missing: X`, `[WARNING]/[INFO] <credential check>`, `[DOCUMENT] <evidence flag>`, `Stronger match: X (Y%)`.

**Side effects:** `AuditLogger` entries (`Applicant Screened`, `Resume Screening Preview`, `Applicant Created`…) and a `NotificationService` alert ("New applicant … with screening score X%").

**UI — `ApplicantDetailModal` (`ApplicantManagement.tsx`):** score badge + radar chart, the three-number story `Resume score → Documents score → Ranking score`, timeline flags (orange badges for unrecognized items), one-click alternative-job transfer button, and the Top-5 + Candidate Ranking tables (all read `applicants.fit_score + status`, refreshed live on recompute).

---

## 15. Recompute Paths & Supporting-Document Verification

### 15.1 Verifying a supporting document (COE / Certificate / Credential)

`POST /verification/supporting-document` (NLP) compares an uploaded proof document against the resume profile claims. Reuses the same text extraction, preprocessing and NER; returns `verification_status: VERIFIED | UNABLE_TO_VERIFY | DISCREPANCY_FOUND` plus per-field `checks` and a summary. Unreadable/failed documents are reported as `UNABLE_TO_VERIFY` (never an HTTP error) so Laravel can always persist a state.

**Impact on the ranking score (§12 step 2):**

| Document verdict | Credit | Effect |
|---|---|---|
| `VERIFIED` | 1.00 | claims corroborated |
| `UNABLE_TO_VERIFY` | 0.50 | nothing to compare |
| `DISCREPANCY_FOUND` | 0.00 | claims contradicted → escalates to `INVALID_CREDENTIAL` |
| `PENDING`/`PROCESSING` | excluded | not yet decisive |

`documents_score = mean(credit) × 100`; `Ranking = Resume×0.85 + Documents×0.15`; no decisive documents → no-op (resume score kept, no silent penalty).

### 15.2 Recompute without re-OCR

After a document is uploaded, re-verified or deleted, `ScreeningService::recomputeWithDocuments()` calls NLP `POST /screening/reclassify` with the **stored** `profile_json + validation_json` + current documents + current requirements/open jobs/settings. The classifier (the exact same `full_classification()`) re-runs **without touching the resume file again**, then Laravel updates `applicant_screenings` + the `applicants` ranking row (replacing `[DOCUMENT] …` flags so they never duplicate). Manual trigger: `POST /api/v1/applicants/{applicant}/screening/recompute`. Documents uploaded before the first screening stay `PENDING` until the next full screening picks them up.

---

## 16. Validation Terminology & Rules Matrix

**SOP terminology (used verbatim by the system):**

| Term | Meaning | Consequence |
|---|---|---|
| **RECOGNIZED** | item exists in reference data or aliases | counts toward scoring |
| **UNRECOGNIZED** | not found in reference data | flagged (orange badge, `review_flags`) — **never auto-rejected**, counted as "not matched" only where the job explicitly requires that exact item |
| **MISSING** | required information absent (name/email/phone/education/work experience, or a required certification the applicant never listed) | blocks `PERFECT_FOR_THE_JOB` via `mandatory_requirements_met=false`; pure absent certification stays a qualification gap |
| **INVALID_FORMAT** | value exists but fails format validation (malformed email/phone) | escalated to `INVALID_CREDENTIAL` |
| **INVALID_CREDENTIAL** | validation/verification concern requiring HR review (unverifiable required credential, credential-verification warnings ≥ 3, or document discrepancy) | official status `credential`; HR reviews — **not a fraud accusation** |

**Validation checkpoints across the whole flow (summary):**

| Gate | Where | What is validated | Failure → |
|---|---|---|---|
| A — Job post | §1 | post exists, Open+Active, criteria shape, `job_post_id` exists | skip / 422 / excluded |
| B — Intake | §2 | file type/size, `job_post_id`, duplicates, storage | 422 / 409 |
| C1 — Extraction | §4 | supported format, file present, non-empty text, OCR quality warnings | 422 `FAILED` / warnings → `PARTIALLY_PROCESSED` |
| C2 — Profile | §9 | MISSING info, INVALID_FORMAT email/phone, recognized/unrecognized skills & roles | blocks PERFECT / escalates INVALID_CREDENTIAL / flags only |
| C3 — Credentials | §9.3 | required vs listed certifications match | `UNVERIFIABLE_REQUIRED_CREDENTIAL` → INVALID_CREDENTIAL |
| C4 — Consistency | §10 | 7-point credential verification | −5/warning (cap −15); ≥ 3 warnings → INVALID_CREDENTIAL |
| C5 — Gate | §11 | education, experience, coverage ≥ 60%, no missing info | `mandatory_requirements_met=false` |
| C6 — Documents | §15 | COE/Certificate/Credential vs resume claims | blend 15% / DISCREPANCY → INVALID_CREDENTIAL |
| C7 — Classification | §12 | statuses + thresholds | `PERFECT / INVALID_CREDENTIAL / FIT_FOR_OTHER_JOB / NOT_FITTED` |

**Statuses observed in the wild:** `processing_status = PROCESSED | PARTIALLY_PROCESSED | FAILED`; `document_verification.status = NOT_PROVIDED | PENDING | VERIFIED | PARTIAL | DISCREPANCY`; official label set = `Perfect for the Job | Invalid Credential | Fit for Other Job | Not Fitted to Job`.

---

## 17. Endpoint & Payload Reference

### 17.1 NLP service (FastAPI, port 8001)

| Method & Path | Purpose | Key inputs |
|---|---|---|
| `GET /health` | liveness + loaded model info + weights + thresholds | — |
| `POST /extract-resume` | text extraction + profile only (auto-fill) | `file` multipart |
| `POST /ner/extract-entities` | raw entity extraction on provided text | JSON `{text}` |
| `POST /screening/score` | **full pipeline** — extraction → … → classification | `file` + `requirements`/`open_jobs`/`reference_data`/`screening_settings`/`document_verifications` (JSON strings) |
| `POST /screening/analyze-text` | same pipeline on raw text | JSON `{text, requirements?, open_jobs?, reference_data?, document_verifications?}` |
| `POST /screening/reclassify` | re-score STORED profile (no re-OCR) | JSON `{profile, validation, requirements?, open_jobs?, document_verifications?, screening_settings?, reference_data?}` |
| `POST /verification/supporting-document` | COE/Certificate/Credential vs resume claims | `file` + `doc_type` + `resume_profile` (+ optional `reference_data`) |

### 17.2 Laravel API (Sanctum + `permission:Applicant Management`)

| Route | Purpose |
|---|---|
| `POST /api/v1/applicants` | create applicant (+ resume upload) → runs screening |
| `POST /api/v1/applicants/screen-resume` | preview screening for an uploaded resume (no applicant row) |
| `POST /api/v1/applicants/extract-resume` | auto-fill contact fields from resume |
| `GET /api/v1/applicants/{applicant}/screening` | latest full screening detail |
| `POST /api/v1/applicants/{applicant}/screening/recompute` | recompute ranking with current document evidence |
| `POST /api/v1/applicants/{applicant}/ground-truth` | expert label for evaluation metrics |
| `GET /api/v1/applicants/screening-stats`, `GET /api/v1/evaluation/sop2-detection|sop3-screening-metrics|sop5-score-alignment` | SOP evaluation dashboards |
| `GET/PUT/POST/PATCH/DELETE /api/v1/screening/reference-data…`, `GET /api/v1/screening/status`, `PUT /api/v1/screening/configuration` | reference taxonomy + Screening Setup |
| `GET/POST/PUT/PATCH /api/v1/screening/requirement-templates…` | reusable per-position requirement templates |

---

## 18. Failure Modes Observed + Reproduction Commands

### 18.1 Real failure messages recorded in the audit trail

| Situation | Response |
|---|---|
| Empty TXT (`empty.txt`) | `422 {"success":false,"processing_status":"FAILED","error":"No readable text could be extracted from 'empty.txt'."}` |
| Unsupported file (`fake.exe`) | `422 … "Unsupported resume format '.exe'. Supported: PDF, DOCX, TXT and common images."` |
| Blank image (`blank.png`) | `422 … "No readable text could be extracted from 'blank.png'."` |
| Scanned PDF before OCR handling | `422 … "No readable text could be extracted from 'Julian Rivera — Guest Services Professional.pdf'."` (now handled — the same file OCRs successfully) |
| NLP service down | preview returns `502` + Warning audit entry; `NlpService::healthy()` lets the frontend warn before screening |
| Anything else unexpected | structured failure dict (`_safe()`), never a bare 500 |

### 18.2 Why an otherwise fine applicant shows `PARTIALLY_PROCESSED`

Any of: unrecognized skills/roles present (most common), extraction warnings (image OCR), missing/invalid contact info, or credential-verification warnings. It does **not** mean failure — it means "HR should glance at the flags."

### 18.3 Reproduce the live screening yourself (PowerShell)

```powershell
# 0) service must be up
curl.exe -s http://127.0.0.1:8001/health

# 1) lightweight extraction (auto-fill path)
curl.exe -s -X POST -F "file=@C:\path\to\resume.pdf" http://127.0.0.1:8001/extract-resume

# 2) full screening — exactly what Laravel sends (JSON fields as files)
curl.exe -s -X POST ^
  -F "file=@C:\path\to\resume.pdf;type=application/pdf" ^
  -F "requirements=<requirements.json" ^
  -F "open_jobs=<open_jobs.json" ^
  http://127.0.0.1:8001/screening/score -o screening_result.json

# 3) pretty-print the result
Get-Content screening_result.json -Raw | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

The `requirements.json` / `open_jobs.json` payloads are exactly the shapes in §1.2 and §1.5. The validated run in §13 used the repo's own `reference/RESUME/Julian Rivera — Guest Services Professional.pdf` plus job post #1 and open jobs #2–#5 from the seed data (`backend-laravel/database/seeders/data/hotel_hr_seed_mysql.sql`).

---

*Compiled for the CLINE workspace, 2026-09-29. Source-verified against branch `ferdy` (commit 350dbbc) and live-validated against the running NLP service on 127.0.0.1:8001. Terminology follows the capstone SOP: RECOGNIZED / UNRECOGNIZED / MISSING / INVALID_FORMAT / INVALID_CREDENTIAL.*
