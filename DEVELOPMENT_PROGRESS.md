# DEVELOPMENT PROGRESS

## Project Information

### Capstone Title

Design and Development of Recruitment Management in Hotels and Restaurants using spaCy-based Natural Language Processing (NLP) for Role-Specific Applicant Screening using Named Entity Recognition (NER)

---

## Main Goal

Develop a Recruitment Management feature for Hotels and Restaurants that can process applicant resumes from multiple formats, extract and standardize relevant applicant information using spaCy-based Natural Language Processing (NLP) and Named Entity Recognition (NER), and perform role-specific applicant screening based on the requirements of a selected job position.

---

# Official Screening Statuses

The system must use the following screening results:

- Perfect for the Job
- Invalid Credential
- Fit for Other Job
- Not Fitted to Job

---

# Current Development Status

## Current Phase

## Current Phase

Phase: COMPLETE - All 22 development phases finished

Status: Feature complete; experimental data collection pending (optional)

---

# Completed Features

- [x] Existing project architecture analyzed
- [x] Applicant Management analyzed
- [x] Resume upload flow analyzed
- [x] PDF resume processing
- [x] DOCX resume processing
- [x] Image/OCR resume processing (implemented AND verified on this machine - Tesseract 5.5 present; scanned PDFs fall back to pypdfium2+tesseract OCR and image resumes parse fully; degrades gracefully to PARTIALLY_PROCESSED when the binary is absent)
- [x] Text cleaning and preprocessing
- [x] spaCy NLP integration
- [x] Standardized applicant profile
- [x] Missing information detection
- [x] Skill extraction
- [x] Job role extraction
- [x] Credential analysis
- [x] Custom spaCy NER dataset
- [x] NER model training
- [x] NER evaluation
- [x] Role-specific job requirements
- [x] Applicant-to-job matching
- [x] Match score computation
- [x] Score explanation
- [x] Perfect for the Job classification
- [x] Invalid Credential classification
- [x] Fit for Other Job classification
- [x] Not Fitted to Job classification
- [x] Alternative job recommendation
- [x] Applicant Management integration
- [x] Reference data DB-managed + admin CRUD UI (Checkpoint 6-7; guide REFERENCE DATA manageability requirement)
- [x] SOP 1 evaluation support
- [x] SOP 2 evaluation support
- [x] SOP 3 evaluation support
- [x] SOP 4 evaluation support
- [x] SOP 5 evaluation support
- [x] Testing
- [x] Final documentation

---

# Currently Working On

Nothing in progress - Checkpoint 9 complete (guide AM-display items 6/8/9 now surfaced in the
UI; found by a fresh audit, data was persisted but never rendered). Remaining work is
real-data collection per Next Task; all 22 guide phases stay complete.

---

# Last Completed Task

Applicant Management SOP-2 analysis surfaces in the UI (Checkpoint 9, continuation session).

A fresh guide-vs-UI audit found that three persisted API fields were never rendered anywhere
in Applicant Management: `missing_information` (AM item 6), job-role recognized/unrecognized
analysis (item 8) and structured credential analysis (item 9). Only unrecognized SKILLS and
generic flags were shown. Implemented:

1. New shared component
   `frontend/src/components/modules/ScreeningAnalysisSections.tsx`: renders Missing Essential
   Information (or "all required personal information was extracted"), Recognized Job Roles,
   Unrecognized Job Roles flagged for review, and Credential Analysis - listing each issue as
   type: detail (+note), or the honest positive state "Valid according to system validation
   rules (internal reference data only - not an external verification)". When issues exist it
   shows the guide-mandated disclaimer that invalid-credential means "invalid or requires
   verification based on system validation rules", not fraud.
2. Mounted in BOTH result surfaces: the Add Applicant wizard Step-3 panel and the applicant
   Review dialog (after the compact summary rows, before alternative-job recommendation).
3. Data availability verified against real screenings: screening 5 -> missing_information
   ["email","phone"]; screening 4 -> recognized role "Bartender"; screening 6 -> eight
   unrecognized roles from the scanned resume. All three sections render live content.
4. Quality gates: tsc --noEmit clean, eslint clean on the new component, npm run build passes
   (client + SSR).

---

# Previous Task

Module-wide API authorization for Applicant Management (Checkpoint 8, continuation session).

Checkpoint 7 protected only the reference-data CRUD. Audit of the rest of the module showed
ALL other ApplicantManagement endpoints (applicants CRUD, screening preview/detail,
evaluation, interviews, assessments) were publicly callable without any token - inconsistent
with the UserManagement / CoreHCM / AuditLog modules which all use
`auth:sanctum` + `permission:{module}`. Implemented and verified:

1. Verified no public dependency first: the careers pages' Apply flow posts to a DEDICATED
   `POST /landing/apply` endpoint in another module (frontend `landingApi.apply`), NOT to
   `/applicants`; `applicantsApi.*` is called exclusively from authenticated admin-portal
   components (ApplicantManagement.tsx, routes/admin/index.tsx). Safe to protect everything.
2. Restructured `Modules/ApplicantManagement/routes/api.php`: single
   `Route::middleware(['auth:sanctum', 'permission:Applicant Management'])` group wrapping
   ALL v1 endpoints (13 applicant routes + interviews resource + assessments + evaluation +
   screening + reference-data). Route names/paths unchanged.
3. Live role-matrix verification against the running stack:
   - No token: GET /applicants 401, GET /applicants/screening-stats 401,
     GET /evaluation/sop3-screening-metrics 401, POST /applicants/screen-resume -> "Unauthenticated."
   - Employee token: 403 on every probe (permission level None).
   - Admin token: 200 on /applicants, /evaluation/sop3 AND full multipart screen-resume
     through the NLP pipeline (bartender_resume.pdf vs job post 1 -> HTTP 200).
   - Super Admin token: 200 across probes.
   - Public flows untouched: GET /landing/jobs -> 200; POST /landing/apply with empty body
     -> 422 validation (endpoint open, auth not required).
4. Test tokens created via tinker for the matrix were revoked afterwards; temp scripts removed.
5. php -l clean; route:list confirms middleware registration; no frontend changes needed
   (api.ts already attaches the Bearer token on every request).

Note: this closes the security gap flagged at the end of Checkpoint 7. The remaining optional
enhancement is queue-based async screening.

---

# Previous Task

Admin CRUD over DB-managed screening reference data (Checkpoint 7, continuation session).

DEVELOPMENT_PROGRESS.md accuracy audit re-verified against artifacts first: every claim in
the file checks out (migrations, models, services, routes, NER model artifact, training
scripts, evaluation outputs, docs/FEATURE_DOCUMENTATION.md all present as described). The only
guide-implementable gap left was Next Task item 3a: "admin CRUD UI over screening_reference_data"
(the table was live for screening but writable only via seeding). Implemented end-to-end:

1. Backend: `ScreeningReferenceController` extended from read-only to full CRUD - GET list
   (flat rows, `data_type` filter + search across canonical values AND aliases), POST store,
   PUT update, PATCH toggle (active flag), DELETE destroy. Validation: type whitelist
   {skill|job_role|certification}, per-type unique canonical_value (422 on duplicates),
   aliases normalized (trim/dedupe/drop empties). Every mutation flushes the 5-min mapping
   cache so the next screening uses fresh data. All mutations write AuditLogger entries
   (Added/Updated/Activated/Deactivated/Deleted).
2. Routes registered under /api/v1/screening/reference-data (list/store/update/toggle/destroy).
3. Frontend API client: new typed `screeningApi.referenceData` group in api.ts
   (list/mapping/create/update/remove/toggleActive + ApiScreeningReference types).
4. New `frontend/src/components/modules/ScreeningReferenceManager.tsx`: searchable,
   type-filterable table of the vocabulary with per-row active Switch (inactive rows are
   excluded from the NLP payload but kept in the table), alias chips, add/edit dialog
   (type select + canonical value + comma-separated aliases), delete confirmation, counts
   badges, error state with retry. Mounted at the bottom of the existing Screening Setup
   dialog in ApplicantManagement.tsx (no duplicate module; follows existing UI conventions).
5. Verified LIVE closed-loop on this machine: CREATE 201 -> UPDATE 200 -> TOGGLE off =>
   entry absent from GET /screening/reference-data mapping (cache flushed) -> TOGGLE on =>
   present again -> duplicate create => HTTP 422 -> bogus data_type => HTTP 422 -> DELETE 200,
   table back to exactly 71 seeded rows. Role matrix verified: no token 401, Employee 403,
   Admin 201, Super Admin 201. All five audit-log entries confirmed in the audit_logs table.
   `tsc --noEmit` clean, eslint clean on the new component, `npm run build` passes, php -l
   clean on both touched PHP files.

---

## Earlier Task

Guide-compliance hardening: DB-managed reference data + SOP batch tooling
(Checkpoint 6, continuation session).

The guide's REFERENCE DATA requirement says to prefer the existing database over
permanently hard-coded values in Python. Reference data was previously bundled JSON only.
Implemented end-to-end and verified live:

1. New `screening_reference_data` table (migration 2026_08_24_000001: data_type,
   canonical_value, aliases_json JSON, active; unique per type+value) +
   `ScreeningReferenceData` model + `ScreeningReferenceDataSeeder` seeded with EXACT parity
   to the previous JSON files (42 skills / 18 job roles / 11 certifications), registered in
   DatabaseSeeder. Idempotent updateOrInsert.
2. `GET /api/v1/screening/reference-data` (ScreeningReferenceController) returns the grouped
   mapping {skills, job_roles, certifications} from the DB (5-min cache) with source/counts
   meta. Verified HTTP 200 with counts 42/18/11.
3. Laravel -> NLP wiring: `NlpService::screenResumeStructured()` accepts and sends
   `reference_data`; `ScreeningService` fetches the cached DB mapping for every screening
   (persist + preview paths) and sends null when the table is empty so the NLP service falls
   back to bundled JSON - no behavior change before seeding, no silent failure.
4. NLP service accepts optional `reference_data` on POST /screening/score and
   /screening/analyze-text and threads effective references through EVERY stage that consults
   reference data: entity_extraction.extract() (skills/roles/certs canonicalization,
   EDUCATION->SKILL correction, recognized_role flags), profile_builder.build_profile(),
   matching.parse_requirements() and analyze_with_certifications(). Bundled data remains the
   default when no override is supplied.
5. Closed-loop proof on this machine: inserted a temporary DB skill row ("Customer Experience"
   alias "guest recovery"), flushed cache, re-screened Julian's scanned PDF through
   POST /applicants/screen-resume -> "Guest Recovery" flipped from UNRECOGNIZED to RECOGNIZED
   as Customer Experience (HTTP 200, otherwise identical result 79 NOT_FITTED_TO_JOB); deleted
   the row, flushed again -> UNRECOGNIZED once more. The database is demonstrably the live
   source of truth with bundled fallback intact.
6. SOP accelerator: new `nlp-service/tools/batch_evaluate.py` - point it at a resume folder
   (+ optional jobs JSON) and it runs the full pipeline locally (model loads once), writes
   per-resume JSON results, an sop1_summary.json using the DOCUMENTED success definition, and
   a ground_truth_template.csv for expert SOP 2/3/5 annotation. Tested both modes against the
   real RESUME folder: parse-only (2/2 parsed, PARTIALLY_PROCESSED via OCR warnings) and
   scored Bartender requirements (Julian 78.67% PERFECT_FOR_THE_JOB; photo PNG 60%
   NOT_FITTED_TO_JOB) - all figures computed from actual files, nothing fabricated.
7. Regression checks after extractor signature changes: tests/smoke_test.py ALL PASS;
   training scripts unaffected (default references); screen-resume E2E green.

DEVELOPMENT_PROGRESS.md accuracy audit also completed that session: fixed stale Image/OCR
checkbox (now [x] - implemented AND verified here), duplicate "Final documentation" entry,
stale "Currently Working On" (PHASE 22 was already done), and the Python-version note
(this clone is Python 3.11.4; the other dev machine is 3.13). All other claims verified
against artifacts (checkpoints, migrations, model artifact, docs sections, endpoints).

## Earlier Task

Browser E2E of the Add Applicant wizard on this machine:

1. Environment re-verified here (Python 3.11.4): pipeline imports + `tests/smoke_test.py`
   ALL PASS; installed the one missing requirements dep (`pypdf`). MySQL, Laravel :8000,
   NLP :8001 and Vite :8080 all live; API checks green.
2. Ran `SystemUserPasswordSeeder` on this DB so portal logins use the seeded password.
3. Full UI E2E with Playwright: login -> OTP -> Applicant Management -> Add Applicant
   wizard -> "Through file" -> Julian Rivera's SCANNED PDF uploaded via the file input
   -> Run resume screening -> Step 3 rendered 79% "Not fitted to Job" with matched/
   missing keywords, education, skills and UNRECOGNIZED flags (identical to the
   API-level result) -> Save applicant -> row APP-1061 appears in the list.
4. Persistence verified in DB: `applicants` id 31 created; `applicant_screenings`
   screening_id 6 = (applicant 31, job_post 1 Bartender, not-fit, PARTIALLY_PROCESSED,
   score 79.00). The scanned-PDF OCR fix is now proven through ALL layers: extraction,
   full pipeline, REST API, and the React UI.
5. Frontend quality gates: `npm run build` passes. Fixed the pre-existing 37k CRLF
   lint failures via `endOfLine: "auto"` in `frontend/.prettierrc` + mechanical
   `eslint --fix`; remaining 123 pre-existing no-explicit-any errors + 17 hook warnings
   documented as codebase-wide style debt (not auto-changed).

Note: the wizard's position dropdown filters by department and resolves the job post
by exact title (`runScreening`, ApplicantManagement.tsx). Positions without a matching
`job_posts` title (e.g. Front Desk Receptionist on this seed) abort gracefully with a
"No job post found for the selected position." toast - documented behavior, not a bug.

## Earlier Task

Environment bring-up + full-stack verification on this machine (follow-up session):

1. Provisioned the Python stack: spaCy 3.8.15 + en_core_web_sm, python-multipart,
   pypdfium2, pytesseract (Tesseract 5.5 already present).
2. Verified on THIS machine: `tests/smoke_test.py` ALL PASS (4 classifications),
   `training/evaluate_ner.py` per-entity P/R/F1 regenerated, scanned Julian Rivera
   PDF through the FULL pipeline (spaCy NER extracted name/email/phone from the OCR
   text - the previously pending case is closed end-to-end).
3. Started XAMPP MySQL + Laravel + NLP service; verified live: SOP 1 stats,
   SOP 3 confusion matrix, SOP 5 alignment, GET /applicants with latest_screening,
   and `POST /applicants/screen-resume` with the scanned PDF -> HTTP 200,
   PARTIALLY_PROCESSED, NOT_FITTED_TO_JOB (score 79, mandatory required-skills
   coverage gate 25% < 60%, no eligible alternative posts) with reasons.
4. Refreshed `database/hotel_hr_latest.sql` via mysqldump so the repo dump now
   includes `applicant_screenings` + `screening_ground_truths` (with existing test
   rows). `hotel_hr_latestv1.sql` predates the feature and is kept as-is.

---

# Next Task

All 22 development phases are complete; reference data is DB-managed AND admin-manageable
(Checkpoints 6-7); the whole ApplicantManagement API is role-protected (Checkpoint 8);
queue-based async screening was evaluated and consciously deferred (see Important Decisions).
Remaining work is real experimental data collection only:

1. Collect real annotated resumes and re-run NER training/evaluation for final SOP 4 figures
   (toolchain ready: `nlp-service/training/`).
2. Collect a real resume batch: run `nlp-service/tools/batch_evaluate.py --resumes-dir <folder>`
   for instant SOP 1 figures + ground-truth template, upload the resumes as applicants, fill
   the template, record via `POST /applicants/{id}/ground-truth`, then answer SOP 1/2/3/5
   through the evaluation endpoints.
   NOTE: both require external input (real resumes / expert labels) - this is the only
   genuine blocker left; do not fabricate data to fill it.

---

# Last Modified Files

- `frontend/src/components/modules/ApplicantManagement.tsx` (Checkpoint 16: resume-swap
  confirm modal + normalizePHPhone; Checkpoint 15: auto-fill wiring; Checkpoints 10-13:
  upload/preview UX)

- `nlp-service/app/services/entity_extraction.py` + `profile_builder.py` (Checkpoint 15:
  address extraction; Checkpoint 14: five accuracy fixes from ground-truth round)
- `backend-laravel/app/Services/NlpService.php` + ApplicantManagement controller/routes
  (Checkpoint 15: extract-resume proxy + endpoint)
- `frontend/src/lib/api.ts` + `ApplicantManagement.tsx` (Checkpoint 15: auto-fill wiring;
  Checkpoints 10-13: upload/preview UX)

- `frontend/src/components/modules/ApplicantManagement.tsx` (Checkpoint 13: removed custom
  zoom toolbar + duplicate horizontal scroll - media fits container, browser PDF viewer
  handles zoom; Checkpoint 12: Step-3 fixed height + flush preview; Checkpoint 11: real
  file/image preview with click-to-open name; Checkpoint 10: drag-and-drop upload;
  Checkpoint 9: analysis sections; Checkpoint 7: ScreeningReferenceManager mount)

- `frontend/src/components/modules/ScreeningAnalysisSections.tsx` (Checkpoint 9: NEW - missing
  info / job-role / credential analysis rows, mounted in wizard step 3 + review dialog)
- `frontend/src/components/modules/ApplicantManagement.tsx` (Checkpoint 9: mounts the new
  analysis sections; Checkpoint 7: ScreeningReferenceManager mount + dialog description)

- `Modules/ApplicantManagement/routes/api.php` (Checkpoint 8: module-wide auth:sanctum +
  permission:Applicant Management; public careers flow unaffected - uses /landing/apply)
- `Modules/ApplicantManagement/app/Http/Controllers/ScreeningReferenceController.php`
  (Checkpoint 7: read-only index -> full CRUD + audit logging + cache flush on every mutation)
- `frontend/src/components/modules/ScreeningReferenceManager.tsx` (Checkpoint 7: NEW admin
  CRUD UI over screening_reference_data, mounted in the Screening Setup dialog)
- `frontend/src/lib/api.ts` (Checkpoint 7: typed screeningApi.referenceData client group)
- `Modules/ApplicantManagement/routes/api.php` (Checkpoint 7: list/store/update/toggle/destroy routes)
- `frontend/src/components/modules/ApplicantManagement.tsx` (Checkpoint 7: mounts
  ScreeningReferenceManager; dialog description updated)
- `docs/FEATURE_DOCUMENTATION.md` (final 28-section feature documentation; Checkpoint 6 reference-data updates)
- `DEVELOPMENT_PROGRESS.md` (checkpoint updates + accuracy audit fixes)
- `Modules/ApplicantManagement/.../ScreeningReferenceData.php`, `ScreeningReferenceController.php`,
  `ScreeningReferenceDataSeeder.php`, migration 2026_08_24_000001, routes/api.php (Checkpoint 6)
- `nlp-service/app/services/{reference_data,entity_extraction,profile_builder,matching,pipeline}.py`
  (+ main.py) - DB-managed reference-data override threading (Checkpoint 6)
- `nlp-service/tools/batch_evaluate.py` (SOP batch experiment runner)
- `backend-laravel/app/Services/NlpService.php` (reference_data payload)
- `Modules/ApplicantManagement/app/Services/ScreeningService.php` (sends DB mapping)
- `nlp-service/app/main.py` (structured error boundary on all pipeline endpoints)
- `backend-laravel/Modules/ApplicantManagement/...` (see Checkpoints 3-4 file lists)
- `nlp-service/requirements.txt`
- `nlp-service/app/main.py` (FastAPI app: /health, /extract-resume, /ner/extract-entities, /screening/score, /screening/analyze-text)
- `nlp-service/app/config.py` (weights 40/30/20/10, thresholds, statuses, labels)
- `nlp-service/app/services/text_extraction.py` (PDF/DOCX/TXT/image OCR + processing status)
- `nlp-service/app/services/preprocessing.py` (cleaning)
- `nlp-service/app/services/section_detection.py` (resume section headers)
- `nlp-service/app/services/entity_extraction.py` (regex + rules + spaCy + custom NER merge)
- `nlp-service/app/services/reference_data.py` (skills/roles/certs reference + aliases + recognized/unrecognized classification)
- `nlp-service/app/services/profile_builder.py` (standardized profile + validation + credential analysis)
- `nlp-service/app/services/matching.py` (role matching + documented scoring formula)
- `nlp-service/app/services/screening.py` (four-status classifier + alternative-job analysis)
- `nlp-service/app/services/pipeline.py` (orchestration)
- `nlp-service/app/data/skills.json|job_roles.json|certifications.json` (reference data with aliases)
- `nlp-service/training/generate_seed_dataset.py` (annotated synthetic resume corpus generator)
- `nlp-service/training/prepare_dataset.py` (leakage-free train/dev/test split by whole document -> .spacy DocBins)
- `nlp-service/training/train_ner.py` (custom NER training on top of en_core_web_sm)
- `nlp-service/training/evaluate_ner.py` (per-entity P/R/F1 on held-out test split)
- `nlp-service/training/ANNOTATION_GUIDELINES.md`
- `nlp-service/models_spacy/role_specific_ner/` (trained custom NER model artifact)
- `nlp-service/tests/smoke_test.py`, `nlp-service/tests/make_samples.py`, `nlp-service/tests/sample_resumes/*`

---

# Database Changes

### Migration

`Modules/ApplicantManagement/database/migrations/2026_08_23_000001_create_applicant_screenings_table.php`

Creates `applicant_screenings` (MIGRATED AND APPLIED):

- screening_id PK, applicant_id FK -> applicants (cascade), job_post_id FK -> job_posts (cascade)
- processing_status (PENDING/PROCESSING/PROCESSED/PARTIALLY_PROCESSED/FAILED) - SOP 1 tracking
- screening_result (fit/other-role/credential/not-fit) - official status
- match_score decimal(5,2)
- score_breakdown_json, profile_json, entities_json, missing_information_json,
  validation_json, alternative_job_json, reasons_json, model_info_json
- error_message, processed_at, created_at, updated_at

Existing tables REUSED unchanged: `applicants` (status/fit_score/summary/flags_json now written
by automated screening), `applicant_screening_entities`, `applicant_screening_scores`.

`screening_reference_data` (Checkpoint 6, MIGRATED AND SEEDED): DB-managed skills/job roles/
certifications + aliases replacing the hard-coded JSON as source of truth; see Checkpoint 6.

---

# API Changes

### NLP service (FastAPI, port 8001) - ALL IMPLEMENTED AND TESTED

- `GET /health` - status + model info + weights/thresholds
- `POST /extract-resume` - multipart file -> text extraction + profile + validation
- `POST /ner/extract-entities` - JSON {text} -> entities with per-entity extraction method
- `POST /screening/score` - multipart file + `requirements` JSON + optional `open_jobs` JSON ->
  full pipeline: profile, validation, match score, breakdown, classification, alternative job,
  reasons. Contract kept compatible with the pre-existing `NlpService::screenResume()`.
- `POST /screening/analyze-text` - JSON {text, requirements?, open_jobs?, reference_data?} -> same pipeline on raw text
- `reference_data` (both endpoints) - optional DB-managed mappings {skills|job_roles|certifications:
  {canonical: [aliases]}}; when absent the bundled seed JSON is used

### Laravel (`/api/v1`) - IMPLEMENTED AND TESTED

- `POST /applicants/screen-resume` - multipart resume + job_post_id; preview screening without
  creating an applicant (used by the Add Applicant wizard). Returns 502 with explicit error on failure.
- `GET /applicants/{applicant}/screening` - latest full screening detail row.
- `POST /applicants` and `PUT /applicants/{applicant}` now run screening automatically when a
  resume is present/changed; accept optional `screening_payload` JSON to reuse a preview result;
  persist applicant_screenings row + refresh entity/score rows + update applicants fields.
  When the NLP service is offline the applicant is still saved, a FAILED screening row with the
  error is recorded, and client-provided values are kept (graceful degradation, no silent failure).
- `GET /applicants` and `GET /applicants/{applicant}` now include screening relations +
  `latest_screening` (profile, breakdown, missing info, recognized/unrecognized analysis,
  credential analysis, alternative job, reasons, model info).
- `GET /screening/reference-data` - DB-managed skills/job roles/certifications + aliases
  (cached 5 min); the same mapping is sent to every screening request.

---

# Current Screening Logic

IMPLEMENTED in the Python NLP service (`nlp-service/app/services/`). Documented logic:

1. **Extraction** (per entity, method is tracked and exposed):
   - Email / Phone: regex. Sections: rule-based header detection.
   - PERSON: custom NER -> base spaCy NER -> capitalized-name heuristic fallback.
   - EDUCATION / JOB_TITLE / SKILL / CERTIFICATION: custom NER + section context + reference-data
     canonicalization (aliases). Cross-label predictions are corrected using section membership
     and reference data (e.g., an EDUCATION prediction naming a known skill becomes a SKILL).
   - Experience years: merged date ranges ("2021 - Present") + "N years" phrases.
2. **Standardized profile**: personal_information{name,email,phone}, education[], work_experience[],
   skills[], certifications[], estimated_years_experience, job_roles{recognized,unrecognized}.
3. **Validation** (SOP 2 terminology):
   - MISSING: name/email/phone absent (role-specific required_information supported).
   - INVALID_FORMAT: malformed email; PH mobile not 10 digits after leading 0; digits outside 7-15.
   - UNRECOGNIZED: skill/role not in reference data - flagged for review only, NEVER auto-rejects.
   - Credential issues: INVALID_FORMAT of essential info; UNVERIFIABLE_REQUIRED_CREDENTIAL when the
     job requires a certification and listed credentials cannot be validated against reference data.
   - A completely missing required certification is recorded as an unmet qualification requirement
     (it gates PERFECT and lowers the score) rather than an automatic credential rejection -
     aligned with the seed-data semantics (applicant #6 "No culinary certification" => not-fit).
4. **Matching** (per applied job): alias-normalized skills overlap; education level ranking
   (HS=1 < Vocational/TESDA=2 < College Level=3 < Bachelor's=4 < Master's=5); experience years vs
   minimum parsed from `experience_level` ("1-2 Years" => 1); certification matching.
5. **Match Score formula** (weights documented in app/config.py, sum = 1.00, mirrors historical
   screening_scores seed data and the existing UI breakdown):
   Overall = Skills(40% x [0.7xRequiredCoverage + 0.3xPreferredCoverage])
           + Experience(30% x min(1, years/min_years))
           + Education(20% x [1 | 0.5 if 1 level below | less otherwise])
           + Certifications(10% x matchedRatio, full credit when no certs required)
6. **Classification** (order matters, all reasons returned):
   1) Any credential issue -> INVALID_CREDENTIAL ("invalid or requires verification based on system
      validation rules" - never claims fraud).
   2) Mandatory requirements met (education + experience + required-skills coverage >= 60% +
      essential info complete) AND score >= 75 -> PERFECT_FOR_THE_JOB.
   3) Else score all other open jobs the same way; best alternative that meets ITS mandatory rules,
      scores >= 75 and outscores the applied job -> FIT_FOR_OTHER_JOB with recommendation payload
      (job_post_id, title, alternative_match_score, matched_skills, reason).
   4) Else -> NOT_FITTED_TO_JOB with explanation of what was missing.
7. **Processing statuses** (SOP 1): PROCESSED (no warnings/gaps), PARTIALLY_PROCESSED (warnings,
   unrecognized items or invalid values), FAILED (extraction failure with explicit error).

When implemented, document:

1. How the applicant profile is extracted.
2. How job requirements are retrieved.
3. How matching is calculated.
4. How match scores are calculated.
5. How screening statuses are determined.
6. How alternative jobs are identified.

---

# SOP Alignment

| SOP | Objective | Feature Status | Evidence | Notes |
|---|---|---|---|---|
| SOP 1 | Resume parsing and standardization | Implemented + tracked | processing_status per screening; GET /applicants/screening-stats | Actual percentage requires real resume batch |
| SOP 2 | Missing information and invalid/unrecognized detection | Implemented + evaluation endpoint | validation_json persisted; GET /evaluation/sop2-detection | Requires expert-annotated ground truth |
| SOP 3 | Applicant screening performance | Implemented + evaluation endpoint | GET /evaluation/sop3-screening-metrics (confusion matrix, accuracy, P/R/F1) | Requires ground-truth labels; methodology documented in response + EvaluationService |
| SOP 4 | NER extraction accuracy | Trained + evaluated on held-out split | training/evaluate_ner.py -> ner_test_report.json (no leakage) | Current figures from synthetic seed corpus; re-run on real annotated resumes for final results |
| SOP 5 | Match score alignment | Implemented + evaluation endpoint | GET /evaluation/sop5-score-alignment (Pearson r, R^2, MAE) | Requires HR-assigned qualification scores |

---

# Requirement Alignment

| Requirement | Status | Evidence/File | Next Action |
|---|---|---|---|
| Applicant Management Analysis | Done | Checkpoint 1 analysis table | - |
| Resume Processing | Done (OCR verified on this machine) | nlp-service/app/services/text_extraction.py | - |
| spaCy NLP | Done | nlp-service/app/services/entity_extraction.py | - |
| Named Entity Recognition | Done | models_spacy/role_specific_ner + training/ | Re-train with real annotated data later |
| Role-Specific Screening | Done | matching.py + ScreeningService buildRequirements/buildOpenJobs (verified E2E incl. UI wizard) | - |
| Match Score | Done | matching.py formula; persisted via ScreeningService (applicant_screenings #6 verified) | - |
| Perfect for the Job | Done | screening.py classify_applied_job; smoke test + live API verified | - |
| Invalid Credential | Done | profile_builder credential rules; smoke test + seed applicant #7 semantics | - |
| Fit for Other Job | Done | screening.py evaluate_alternative_jobs; open_jobs passed from Laravel; smoke test verified | - |
| Not Fitted to Job | Done | screening.py full_classification fallback; verified via UI wizard E2E (APP-1061, 79%) | - |
| Applicant Management Integration | Done | ScreeningService + controller + frontend wiring | - |
| Reference Data DB-managed | Done (Checkpoint 6) + admin CRUD UI (Checkpoint 7) | screening_reference_data table + GET /screening/reference-data + reference_data payload + ScreeningReferenceManager UI | Queue-based async screening remains optional |
| Evaluation | Done (tooling + batch runner) | /applicants/screening-stats, /evaluation/* endpoints, training/evaluate_ner.py, tools/batch_evaluate.py | Real experimental data collection remains |

---

# Development Checkpoints

## Checkpoint 1

### Feature

PHASE 1 + PHASE 2 - Existing project analysis and screening feature architecture design.

### Files Created

None (analysis only).

### Files Modified

- `DEVELOPMENT_PROGRESS.md`

### Database Changes

None.

### What Was Implemented

#### 1. Current Architecture Summary

- Backend: Laravel 11 modular monolith (`backend-laravel`) with nwidart modules
  (`Modules\ApplicantManagement`, `Modules\RecruitmentManagement`, `CoreHCM`, ...).
- Frontend: TanStack Start + React 19 + TypeScript + shadcn/radix UI (`frontend`),
  REST client in `frontend/src/lib/api.ts` calling `/api/v1/...`.
- NLP: FastAPI microservice scaffold at `nlp-service` (only `GET /health`), planned port 8001.
- Database: MySQL (`database/hotel_hr_latestv1.sql` dump is authoritative seed).

#### 2. Applicant Management Analysis (REUSE / EXTEND / MODIFY / ADD)

| Existing Component | Current Purpose | Action | Required Change | Reason |
|---|---|---|---|---|
| `applicants.status` CHECK ('fit','other-role','credential','not-fit') | Screening result | REUSE | Map to official statuses: fit=Perfect for the Job, credential=Invalid Credential, other-role=Fit for Other Job, not-fit=Not Fitted to Job | Already encodes exactly the four official outcomes |
| `applicants.stage` ('Screened','Interview Scheduled','Assessed','Offer','Hired','Rejected','Accepted') | Recruitment stage | REUSE | None | Correctly separated from screening result per design rule |
| `applicants.fit_score` decimal(5,2) | Match score storage | EXTEND | Written by automated screening instead of only manual entry/assessment copy | Currently only set manually or copied from interview assessment |
| `applicants.summary`, `flags_json` | Explanation + flags | EXTEND | Populated by screening service (matched/missing requirements, unrecognized items, alternative job) | Schema exists, no writer |
| `applicant_screening_entities` table/model/resource | Extracted entities (label/value) | REUSE+EXTEND | Write PERSON/EDUCATION/JOB_TITLE/SKILL/CERTIFICATION entities after NLP processing | Table exists but nothing writes to it |
| `applicant_screening_scores` table/model/resource | Per-criterion score breakdown | REUSE+EXTEND | Write Skills/Experience/Education/Certification component scores | Same |
| Resume upload (`ApplicantManagementController@store/update`) | Stores file to `storage/app/public/resumes` | EXTEND | After storing file, trigger NLP screening pipeline and persist results | Upload currently stores verbatim with zero processing |
| `App\Services\NlpService::screenResume()` | HTTP client to Python service posting multipart file + requirements to `/screening/score` | REUSE+EXTEND | Keep contract; extend with structured requirements builder + retry/error info | Client already matches planned endpoint; currently dead code |
| `job_posts.skills_json`, `qualifications_json`, `education_level`, `experience_level` | Role requirements source | EXTEND | Build structured role-specific requirements from these existing fields | No new job-requirements schema needed |
| `ApplicantManagementController@show` + `ApplicantResource` | Returns screening_entities/screening_scores for UI | EXTEND | Also return latest full screening record (profile, reasons, alternative job) | Review dialog needs explainable result |
| Frontend mock `runScreening` / `screeningResultFor` | Random-score placeholder | MODIFY | Replace random generator with real API call; keep fallback display when NLP offline | Mock conflicts with research objectives |
| Interviews / Assessments modules | Stage progression + human evaluation | NOT NEEDED | None | Unrelated to screening classification; assessment total_score sync to fit_score must be kept but screening writes happen before stage flow |

#### 3. Key Findings

- The database schema was clearly designed for automated screening but the write path was never built.
- `fit_score` seed values follow a Skills 40% / Work Experience 30% / Educational Background 20%
  / Certifications 10% weighting (verified against `applicant_screening_scores` seed rows).
- Seed data proves intended status usage: applicant 7 = 'credential' with flags "Malformed email
  address", "Incomplete phone number" -> invalid-format essential info counts as credential issue;
  applicants 3 & 8 = 'other-role' with flag "Stronger match: X (81%)" -> alternative job stored in flags.
- Tesseract OCR engine is not installed on this machine; image resumes must degrade gracefully
  to PARTIALLY_PROCESSED with explicit error message (no silent failure).
- Python 3.11.4 available; spaCy 3.8.15 + en_core_web_sm + FastAPI installed.

#### 4. Proposed Integration Flow

```
Frontend Add-Applicant wizard
   | upload resume + select job post
   v
POST /api/v1/applicants/screen-resume        (preview, no applicant created)
   | Laravel builds requirements JSON from job_posts fields (+ open_jobs list)
   v
POST nlp-service /screening/score            (multipart file + requirements)
   | extract text (PDF/DOCX/image) -> clean -> spaCy pipeline
   | regex/rules/sections + custom NER -> standardized profile
   | validation (missing/unrecognized/invalid-format/credential)
   | role matching -> match score -> four-status classification
   v
User confirms -> POST /api/v1/applicants (multipart incl. screening_payload)
   Laravel persists: applicants.fit_score/status/summary/flags_json,
   screening entities rows, score-breakdown rows, applicant_screenings row
```

### SOP/Objectives Supported

Foundation for all SOPs; SOP 1 data tracking designed (processing status per resume).

### Tests Performed

Static analysis of codebase, SQL seed verification, environment verification
(Python/spaCy/FastAPI install checks).

### Remaining Work

Phases 3-22 (NLP service implementation onward).

---

## Checkpoint 2

### Feature

PHASE 3-18: Python NLP service - resume processing, spaCy pipeline, custom NER
training/evaluation, standardized profile, validation, role-specific matching,
match score, four official screening classifications, alternative-job analysis.

### Files Created

- `nlp-service/app/config.py`, `app/main.py`
- `nlp-service/app/services/{text_extraction,preprocessing,section_detection,entity_extraction,reference_data,profile_builder,matching,screening,pipeline}.py`
- `nlp-service/app/data/{skills.json,job_roles.json,certifications.json}`
- `nlp-service/training/{generate_seed_dataset.py,prepare_dataset.py,train_ner.py,evaluate_ner.py,ANNOTATION_GUIDELINES.md}`
- `nlp-service/tests/{smoke_test.py,make_samples.py}` + sample resumes (PDF/DOCX/TXT)
- `nlp-service/models_spacy/role_specific_ner/` (trained model)
- `nlp-service/requirements.txt`

### Files Modified

- `nlp-service/app/__init__.py`, `nlp-service/app/services/__init__.py` (new)
- `DEVELOPMENT_PROGRESS.md`

### Database Changes

None yet (Laravel persistence is the current task).

### What Was Implemented

1. Multi-format text extraction: PDF (pdfplumber), DOCX (python-docx), TXT,
   images via Tesseract OCR when the binary exists; otherwise explicit
   PARTIALLY_PROCESSED error (no silent failure). Unsupported formats -> FAILED.
2. Text preprocessing (unicode NFKC, control-char removal, hyphen-linebreak
   repair, whitespace/bullet normalization).
3. Rule-based section detection (education/experience/skills/certifications/summary).
4. Entity extraction combining four tracked methods: regex, section_rule,
   spacy_base (en_core_web_sm PERSON/ORG), custom_ner. Reference-data
   canonicalization with alias support ("Point of Sale" -> POS Systems,
   "Food Server" -> Restaurant Server, ...).
5. Standardized applicant profile per capstone structure.
6. Validation with SOP 2 terminology: MISSING / INVALID_FORMAT / RECOGNIZED /
   UNRECOGNIZED / credential issues; unrecognized items flagged for review only.
7. Role-specific matching against requirements derived from job_posts fields
   (skills_json, qualifications_json-derived certifications, education_level,
   experience_level) + transparent weighted match score with breakdown.
8. Four-status classification with documented decision order and full reasons;
   alternative open-job analysis for FIT_FOR_OTHER_JOB.
9. FastAPI endpoints: GET /health, POST /extract-resume, POST /ner/extract-entities,
   POST /screening/score (multipart contract already expected by Laravel
   NlpService::screenResume), POST /screening/analyze-text.

### Custom NER

- Seed corpus generator produces annotated hotel-domain resumes with exact spans
  (80 docs generated; labels PERSON/JOB_TITLE/SKILL/EDUCATION/CERTIFICATION).
- prepare_dataset.py splits by WHOLE document (70/15/15) into train/dev/test
  .spacy DocBins; leakage check asserts no document crosses splits.
- train_ner.py fine-tunes a fresh 'ner' component on en_core_web_sm, tracking
  best dev F1 checkpointing to models_spacy/role_specific_ner.
- evaluate_ner.py reports per-entity P/R/F1 on the held-out test split and saves
  training/data/ner_test_report.json.
- Result on synthetic seed corpus test split: overall F1 = 0.9948
  (P=0.9896, R=1.0). NOTE: these numbers are valid ONLY for the synthetic seed
  corpus and must be re-measured on real annotated resumes for the actual
  research results. Do not report them as final SOP 4 metrics.
- The trained model auto-loads in the service (health reports
  custom_ner_loaded=true); extraction falls back to base spaCy + rules if absent.

### SOP/Objectives Supported

SOP 1 (parsing pipeline + statuses), SOP 2 (detection logic), SOP 3 (decision
logic + reasons), SOP 4 (dataset/train/eval harness), SOP 5 (documented score
formula). Actual metric values require real datasets.

### Tests Performed

- tests/smoke_test.py: four scenarios assert all four classifications
  (PERFECT_FOR_THE_JOB, INVALID_CREDENTIAL via malformed email+phone matching
  seed applicant #7 semantics, NOT_FITTED_TO_JOB, FIT_FOR_OTHER_JOB with Barista
  recommendation). ALL PASS.
- HTTP tests over running uvicorn instance: PDF resume -> PERFECT_FOR_THE_JOB
  100% PROCESSED; DOCX resume -> PERFECT_FOR_THE_JOB 100%; TXT barista resume vs
  Bartender requirements -> NOT_FITTED_TO_JOB 47%; analyze-text endpoint OK.
- NER evaluation on held-out test split (see above).

### Remaining Work

PHASE 19 Laravel integration (migration, ScreeningService, controller wiring,
frontend), PHASE 20 evaluation tooling, PHASE 21 end-to-end testing,
PHASE 22 documentation.

---

## Checkpoint 3

### Feature

PHASE 19 + PHASE 21 (core flows): full integration of the spaCy NLP screening
feature into the existing Applicant Management module (backend persistence,
automatic screening on upload, preview endpoint, frontend wiring) verified
end-to-end through the real UI.

### Files Created

- `Modules/ApplicantManagement/database/migrations/2026_08_23_000001_create_applicant_screenings_table.php`
- `Modules/ApplicantManagement/app/Models/ApplicantScreening.php`
- `Modules/ApplicantManagement/app/Services/ScreeningService.php`

### Files Modified

- `app/Services/NlpService.php` (added screenResumeStructured + healthy; kept old contract)
- `Modules/ApplicantManagement/.../ApplicantManagementController.php` (constructor DI,
  auto-screen in store/update, screenResume + screeningDetail endpoints, eager loads)
- `Modules/ApplicantManagement/.../Models/Applicant.php` (screenings + latestScreening relations)
- `Modules/ApplicantManagement/.../Resources/ApplicantResource.php` (latest_screening payload)
- `Modules/ApplicantManagement/routes/api.php` (2 new routes)
- `frontend/src/lib/api.ts` (ApiScreening types + applicantsApi.screenResume/getScreening)
- `frontend/src/data/applicants.ts` (ScreeningDetail type + screening_detail field)
- `frontend/src/components/modules/ApplicantManagement.tsx` (real async runScreening replacing
  the random mock; screening_payload reuse on save; loading state; result panel and review
  dialog now render real matched/missing skills from the score breakdown, unrecognized-skill
  flags, alternative-job recommendation card and the system explanation reasons)

### Database Changes

`applicant_screenings` table created via migration (see Database Changes section).

### What Was Implemented

1. Requirements builder: role requirements are derived from existing job_posts fields
   (skills_json -> required skills; education_level; experience_level parsed to min years;
   certifications extracted from free-text qualifications_json by credential keywords).
   Open-job list for FIT_FOR_OTHER_JOB analysis is built the same way, excluding posts with
   no criteria at all (they would trivially score 100% and pollute recommendations).
2. ScreeningService: orchestrates NLP call + persistence into applicant_screenings,
   applicant_screening_entities, applicant_screening_scores and applicants
   (fit_score/status/summary/flags). Official status codes map to the existing status CHECK
   domain (PERFECT_FOR_THE_JOB->fit, INVALID_CREDENTIAL->credential,
   FIT_FOR_OTHER_JOB->other-role, NOT_FITTED_TO_JOB->not-fit).
3. Automatic screening: store() screens after resume upload; update() re-screens when the
   resume is replaced. Preview endpoint screens without creating a row; saving reuses that
   payload so NLP runs once per wizard flow.
4. Graceful degradation: NLP offline -> applicant still saved, FAILED screening row with
   explicit error message recorded, client values kept.
5. Frontend: mock random screening removed; wizard step 3 and the applicant review dialog
   render the real standardized profile, matched vs missing required skills (from breakdown),
   unrecognized skill flags, alternative job recommendation and per-decision reasons.

### SOP/Objectives Supported

- SOP 1: processing_status persisted per screening (PROCESSED / PARTIALLY_PROCESSED / FAILED).
- SOP 2: missing_information, invalid_format, recognized/unrecognized skill & role analysis and
  credential_analysis persisted and displayed.
- SOP 3: system decision + reasons stored per applicant (ground-truth comparison tooling next).
- SOP 5: computed match_score + full breakdown stored per applicant/job post.
- SOP 4: unchanged from Checkpoint 2 (trained model used live by the service).

### Tests Performed

- HTTP API: POST /applicants/screen-resume with PDF (200, PERFECT_FOR_THE_JOB 100%);
  create applicant with screening_payload (201) then GET /{id} and GET /{id}/screening verify
  persisted entities/scores/screening row; DELETE cleanup OK.
- Failure path: with the NLP service stopped, PDF upload still returns 201 and writes a FAILED
  screening row containing the connection error; client-provided values preserved.
- Full browser E2E (Playwright): login -> Applicant Management -> Add Applicant wizard ->
  upload bartender_resume.pdf -> Run resume screening -> real result rendered
  (57%, Not Fitted to Job against job post 1's actual requirements, no bogus recommendation
  after the empty-requirements guard) -> Save applicant -> row appears (TOTAL APPLICANTS 0 -> 1)
  -> Review dialog shows real profile, matched skills from breakdown and the
  "Why this result" explanation list. DB verified: applicant 29 = not-fit / 57.00 with
  PROCESSED screening row; applicant 27 = fit / 100.00.
- Frontend typecheck (tsc --noEmit clean) and production build succeed.

### Remaining Work

PHASE 20 evaluation tooling (SOP 1 stats endpoint, SOP 3 confusion-matrix methodology +
ground-truth storage, SOP 5 alignment support), remaining PHASE 21 edge-case tests,
PHASE 22 final documentation.

---

## Checkpoint 4

### Feature

PHASE 20 + PHASE 21: research evaluation tooling and edge-case hardening.

### Files Created

- `Modules/ApplicantManagement/database/migrations/2026_08_23_000002_create_screening_ground_truths_table.php`
- `Modules/ApplicantManagement/app/Models/ScreeningGroundTruth.php`
- `Modules/ApplicantManagement/app/Services/EvaluationService.php`
- `Modules/ApplicantManagement/app/Http/Controllers/ScreeningEvaluationController.php`
- `nlp-service/tests/make_samples.py` sample fixtures incl. image resume generator

### Files Modified

- `Modules/ApplicantManagement/routes/api.php` (5 new routes)
- `nlp-service/app/main.py` (structured catch-all error boundary on all pipeline endpoints)

### Database Changes

`screening_ground_truths` table (MIGRATED): expert labels per applicant -
true_screening_result (official four-class), true_qualification_score (0-100),
true_missing_information_json, true_unrecognized_skills_json, notes.

### What Was Implemented

1. SOP 1: `GET /api/v1/applicants/screening-stats` - totals per processing status with the
   documented success definition (text extracted + no failure + profile generated).
2. SOP 2: `POST /applicants/{id}/ground-truth` + `GET /evaluation/sop2-detection` -
   micro-averaged precision/recall/F1 of missing-information flags and unrecognized-skill
   flags vs expert lists.
3. SOP 3: `GET /evaluation/sop3-screening-metrics` - documented methodology; raw 4x4 confusion
   matrix (actual rows x predicted columns), overall accuracy, per-class P/R/F1 with support,
   macro averages, and a binary "qualified" view where only Perfect for the Job is positive.
   No undocumented status remapping anywhere.
4. SOP 5: `GET /evaluation/sop5-score-alignment` - Pearson r, R^2 and MAE between computed
   match score and HR-assigned qualification score over paired samples.
5. Edge-case hardening: corrupt PDF / empty file / unsupported format / blank image all return
   structured FAILED errors end-to-end (NLP -> Laravel 502 with explicit message). Unexpected
   internal exceptions are caught by a service-wide boundary and returned as structured JSON,
   never a bare 500.
6. Image OCR verified working on this machine (Tesseract 5.5 found at its default install
   path even though it is not on PATH): a generated PNG resume was fully parsed
   (name/email/phone/skills) via tesseract-ocr and classified PARTIALLY_PROCESSED because of
   the OCR warning, consistent with the SOP 1 definition.

### Tests Performed

- Live API: screening-stats (totals correct), ground-truth upsert for two applicants (201),
  sop3 confusion matrix + accuracy 100% on the two paired samples, sop5 Pearson r=1.0 /
  MAE=3.5 (100 vs 95, 57 vs 55), sop2 agreement structure (null metrics when nothing flagged).
- Edge cases: corrupt.pdf, empty.txt, fake.exe, blank.png each return explicit FAILED errors;
  lily_resume.png fully parsed through OCR.
- NLP smoke suite still ALL PASS after changes.

### Remaining Work

PHASE 22: final documentation only.

---

## Checkpoint 5

### Feature

PHASE 22: final feature documentation.

### Files Created

- `docs/FEATURE_DOCUMENTATION.md` - complete documentation covering all 28 guide-required
  sections (overview, title, goal/scope, SOPs, objectives, existing-system analysis,
  Applicant Management analysis table, architecture, stack, database changes, backend changes,
  Python service, NER dataset/annotation, screening logic, score formula, classification,
  alternative jobs, integration mapping, SOP-to-feature mapping, evaluation guide,
  metric definitions, run instructions, API docs, testing record, limitations, future work,
  file change summary, final development summary).

### What Was Implemented

Documentation only; no functional changes in this checkpoint.

### Remaining Work

None required by the guide. Optional experimental-data collection as listed under Next Task.

---

## Checkpoint 6

### Feature

Guide-compliance hardening after the FINAL REVIEW audit: (a) REFERENCE DATA FOR SCREENING
moved from bundled Python JSON to the database per "prefer integrating with the existing
database and system data instead of permanently hard-coding all values in Python";
(b) batch experiment tooling operationalizing the SOP data collection; (c) progress-file
accuracy fixes.

### Files Created

- `Modules/ApplicantManagement/database/migrations/2026_08_24_000001_create_screening_reference_data_table.php`
- `Modules/ApplicantManagement/app/Models/ScreeningReferenceData.php`
- `Modules/ApplicantManagement/database/seeders/ScreeningReferenceDataSeeder.php`
  (generated from the NLP JSON files - exact value parity)
- `Modules/ApplicantManagement/app/Http/Controllers/ScreeningReferenceController.php`
- `nlp-service/tools/batch_evaluate.py`

### Files Modified

- `backend-laravel/app/Services/NlpService.php` (screenResumeStructured sends optional
  `reference_data` payload)
- `Modules/ApplicantManagement/app/Services/ScreeningService.php` (sends cached DB mapping
  on persist + preview paths; null when table empty -> NLP falls back to bundled JSON)
- `Modules/ApplicantManagement/routes/api.php` (GET /screening/reference-data)
- `backend-laravel/database/seeders/DatabaseSeeder.php` (registers reference seeder)
- `nlp-service/app/services/reference_data.py` (merge_reference + effective_references)
- `nlp-service/app/services/entity_extraction.py` (extract() accepts references; all
  internal refdata loads replaced by explicit params - skills/roles/certs canonicalization,
  EDUCATION->SKILL correction and recognized_role flags all honor the DB data)
- `nlp-service/app/services/profile_builder.py` (build_profile accepts references tuple)
- `nlp-service/app/services/matching.py` (parse_requirements accepts references)
- `nlp-service/app/services/pipeline.py` (threads references through extraction, profile,
  requirements parsing and credential analysis)
- `nlp-service/app/main.py` (/screening/score + /screening/analyze-text accept optional
  reference_data field)
- `docs/FEATURE_DOCUMENTATION.md` (sections 12 + 26 updated: DB is source of truth,
  JSON = fallback; future-improvement item marked DONE except admin CRUD UI)
- `DEVELOPMENT_PROGRESS.md` (audit fixes + this checkpoint)

### Database Changes

`screening_reference_data` table (MIGRATED AND SEEDED): ref_id PK,
data_type ENUM-ish string (skill|job_role|certification), canonical_value,
aliases_json (JSON array), active flag, timestamps; unique(data_type, canonical_value).
Seeded with exact parity to the former JSON files: 42 skills, 18 job roles,
11 certifications.

### What Was Implemented

1. DB-managed reference data end-to-end: table -> seeder -> model ->
   GET /api/v1/screening/reference-data (5-min cache, source+counts meta) ->
   ScreeningService/NlpService payload -> NLP service override applied at EVERY stage that
   consults reference data (extraction canonicalization + cross-label corrections +
   recognized/unrecognized classification + requirement parsing + credential analysis).
   Bundled app/data/*.json remain as documented fallback for NLP-only deployments.
2. Closed-loop verification: temporary DB alias flipped a live UNRECOGNIZED skill to
   RECOGNIZED through POST /applicants/screen-resume (and back after removal) - proving the
   database is the live source without code changes.
3. `tools/batch_evaluate.py`: folder-in -> per-resume JSON + sop1_summary.json (documented
   success definition) + ground_truth_template.csv for expert SOP 2/3/5 annotation. Tested
   parse-only and scored modes on real resumes.
4. Progress-file audit corrections (stale checkbox, duplicate row, stale phase note,
   contradictory Python-version note).

### Tests Performed

- php -l on all touched PHP files; migration ran; seeder ran (71 rows verified via SQL).
- GET /screening/reference-data HTTP 200 with counts {skills:42, job_roles:18,
  certifications:11} and intact aliases.
- Closed-loop alias test through Laravel preview screening (see Last Completed Task #5).
- nlp-service tests/smoke_test.py ALL PASS after extractor signature changes.
- tools/batch_evaluate.py both modes against ../RESUME (results above).

### Remaining Work

Real experimental data collection (Next Task items 1-2); optional queue-based async;
optional admin CRUD UI over screening_reference_data.

---

## Checkpoint 7

### Feature

Admin CRUD over the DB-managed screening reference data - the last guide-implementable
enhancement listed under Next Task item 3. HR admins can now manage the spaCy screening
vocabulary (skills / job roles / certifications + aliases, active flag) from the Applicant
Management Screening Setup dialog; changes take effect on the next screening run without
code changes or reseeding. Directly serves the guide's "aliases should be manageable and
documented" requirement and SOP 2 recognized/unrecognized classification.

### Files Created

- `frontend/src/components/modules/ScreeningReferenceManager.tsx`

### Files Modified

- `Modules/ApplicantManagement/app/Http/Controllers/ScreeningReferenceController.php`
  (read-only index -> + list/store/update/toggle/destroy with per-type unique validation,
  alias normalization, cache flush on every mutation, AuditLogger entries)
- `Modules/ApplicantManagement/routes/api.php` (5 new routes, wrapped in
  `auth:sanctum` + `permission:Applicant Management` so only roles with module access can
  mutate the vocabulary - Super Admin Full / Admin Edit pass; Employee None -> 403)
- `frontend/src/lib/api.ts` (ApiScreeningReference types + screeningApi.referenceData group)
- `frontend/src/components/modules/ApplicantManagement.tsx` (mounts the manager in the
  Screening Setup dialog; dialog description updated)
- `DEVELOPMENT_PROGRESS.md` (this checkpoint + tracker updates)

### Database Changes

None (reuses `screening_reference_data` from Checkpoint 6). All five mutations are recorded
in the existing `audit_logs` table via AuditLogger.

### What Was Implemented

1. Backend CRUD endpoints under `/api/v1/screening/reference-data`:
   - GET /list: flat rows ordered by type+value, optional `data_type` filter (whitelisted,
     else 422) and `search` across canonical values AND aliases, counts_by_type meta.
   - POST store / PUT update: validate type whitelist {skill|job_role|certification},
     required canonical_value unique PER TYPE (422 on violation), aliases_json array of
     strings normalized (trim/dedupe/drop empties), optional active boolean.
   - PATCH {id}/toggle: flips active; inactive rows remain in the table but are excluded
     from the NLP mapping payload.
   - DELETE {id}: hard delete.
   - Every mutation flushes the cached grouped mapping so the very next screening uses
     fresh reference data.
2. Frontend admin UI (ScreeningReferenceManager): searchable + type-filterable table with
   type badges, alias chips, per-row active Switch, add/edit dialog, delete confirmation,
   live count badges, loading/error states with retry; mounted full-width at the bottom of
   the existing Screening Setup dialog (no duplicate module).

### SOP/Objectives Supported

SOP 2 support surface management: admins can promote real-world UNRECOGNIZED skills/roles/
certifications to RECOGNIZED by adding canonical values or aliases through the UI instead
of SQL/seeding - closing the loop between detection results and vocabulary maintenance.

### Tests Performed

- Role-matrix verification (live): no token -> 401; Employee token -> 403 (permission None);
  Super Admin token -> 201 create; Admin token -> 201 on a distinct value (first attempt
  returned the expected 422 duplicate because Super Admin had just created the same value,
  proving auth passed and validation engaged). Test tokens revoked afterwards.
- Live closed-loop against the running stack: CREATE 201 -> UPDATE 200 (value renamed) ->
  TOGGLE off => absent from GET /screening/reference-data mapping -> TOGGLE on => present
  again -> duplicate create => HTTP 422 -> bogus data_type => HTTP 422 -> DELETE 200 ->
  list back to exactly 71 seeded rows.
- All five audit-log entries (Added / Updated / Deactivated / Activated / Deleted) verified
  in the audit_logs table with correct target_type/target_id/details.
- `tsc --noEmit` clean; eslint clean on the new component; `npm run build` passes;
  php -l clean on both touched PHP files; route:list shows all six reference-data routes.

### Remaining Work

Real experimental data collection (Next Task items 1-2); optional queue-based async
screening only.

---

## Checkpoint 8

### Feature

Module-wide API authorization for Applicant Management. All module endpoints were publicly
callable without any token - inconsistent with UserManagement / CoreHCM / AuditLog which all
guard their APIs with `auth:sanctum` + `permission:{module}`. The screening feature's own
endpoints (preview, detail, evaluation, reference-data) and every applicant/interview/
assessment route are now restricted to roles with "Applicant Management" access
(Super Admin Full, Admin Edit; Employee None -> 403).

### Files Created

None.

### Files Modified

- `Modules/ApplicantManagement/routes/api.php` (single auth:sanctum + permission group now
  wraps ALL v1 routes; paths/names unchanged)
- `database/hotel_hr_latest.sql` (refreshed via mysqldump - now includes
  `screening_reference_data` with all 71 seeded vocabulary rows; both older dumps
  v1/v2 predate that table and would yield a vocabulary-less DB until migrate+seed)
- `docs/FEATURE_DOCUMENTATION.md` (section 22 run instructions now point at the refreshed
  `hotel_hr_latest.sql` and explain the v1+migrate alternative)

### Database Changes

None.

### What Was Implemented

1. Public-dependency check BEFORE locking down: careers pages apply via the dedicated
   `POST /landing/apply` endpoint in another module (`landingApi.apply`); `applicantsApi.*`
   is used only inside authenticated admin-portal components. Nothing public breaks.
2. Whole-module middleware group applied (13 applicant routes + interviews + assessments +
   evaluation + screening + reference-data).
3. Live role-matrix verification (running stack): no token -> 401 on applicants /
   screening-stats / sop3 and explicit "Unauthenticated." on screen-resume; Employee -> 403;
   Admin -> 200 including a FULL multipart screen-resume run through the NLP pipeline
   (bartender_resume.pdf vs job post 1 -> HTTP 200); Super Admin -> 200. Public landing
   endpoints confirmed still open (GET /landing/jobs 200; POST /landing/apply empty body ->
   422 validation, not 401).

### SOP/Objectives Supported

Protects the integrity of the SOP evidence base: ground-truth records, evaluation metrics,
screening results and the reference vocabulary can no longer be tampered with by
unauthenticated or unauthorized callers.

### Tests Performed

See item 3 above; test tokens created via tinker for the matrix were revoked afterwards;
php -l clean; route:list confirms registration; no frontend change needed (api.ts already
sends Bearer tokens). Dump refresh verified by grepping the SQL file: all six feature tables
present (applicants, applicant_screenings, applicant_screening_entities, applicant_screening_
scores, screening_ground_truths, screening_reference_data) with seeded vocabulary rows.

### Remaining Work

Real experimental data collection (Next Task items 1-2) only. Queue-based async screening
was evaluated this session and consciously deferred - see Important Decisions.

---

## Checkpoint 9

### Feature

UI surfacing of the three SOP-2 analysis payloads that were persisted but never rendered:
missing essential information (AM modification item 6), job-role recognized/unrecognized
analysis (item 8) and structured credential analysis (item 9). Found by re-auditing the guide
against the frontend instead of trusting the tracker.

### Files Created

- `frontend/src/components/modules/ScreeningAnalysisSections.tsx`

### Files Modified

- `frontend/src/components/modules/ApplicantManagement.tsx` (import + mounted the sections in
  the Add Applicant wizard Step-3 panel and the applicant Review dialog)
- `DEVELOPMENT_PROGRESS.md` (this checkpoint)

### Database Changes

None.

### What Was Implemented

1. Shared ScreeningAnalysisSections component rendering: Missing Essential Information row,
   Recognized Job Roles row, Unrecognized Job Roles (flagged for review) row, Credential
   Analysis listing every issue as "type: detail (+note)" or the honest all-clear state
   ("Valid according to system validation rules - internal reference data only, not an
   external verification"), plus the mandatory not-fraud disclaimer when issues exist.
2. Mounted in both screening result surfaces (wizard step 3 + Review dialog) so recruiters see
   the full SOP-2 evidence without opening dev tools.

### Tests Performed

- Persisted-data check via DB: screening 5 carries missing_information [email, phone];
  screening 4 recognized role Bartender; screening 6 eight unrecognized roles - all three
  sections have real content to render.
- tsc --noEmit clean; eslint clean on new component; npm run build passes both environments.

### Remaining Work

Real experimental data collection (Next Task items 1-2) only.

---

## Checkpoint 10

### Feature

Drag-and-drop support for the Add Applicant wizard resume upload zone (user request).
"Choose resume file (PDF/DOCX)" and "Choose resume photo / scan (JPG/PNG)" now also accept
files dropped onto the zone, in addition to click-to-browse.

### Files Created

None.

### Files Modified

- `frontend/src/components/modules/ApplicantManagement.tsx` (drop-zone handlers +
  `resumeDragActive` visual state + shared `handleResumeFile` validator used by BOTH the
  picker and drop paths; picker now also validates type/size and allows re-selecting the
  same file; image accept narrowed to .jpg/.jpeg/.png to match the label text)
- `DEVELOPMENT_PROGRESS.md` (this checkpoint)

### Database Changes

None.

### What Was Implemented

1. Shared `handleResumeFile(file)` validation: image mode accepts JPG/JPEG/PNG only;
   document mode accepts PDF/DOC/DOCX only; both capped at 10 MB. Invalid type or oversized
   files are rejected with explicit toast messages - previously the picker accepted anything.
2. Drop handlers on the upload zone (dragover/dragenter/dragleave/drop, all preventDefault)
   with highlighted border/background while dragging ("border-primary bg-primary/10").
3. Hint text updated: "...click to browse or drag & drop here".

### Tests Performed

tsc --noEmit clean; npm run build passes both environments; remaining eslint errors are the
pre-existing documented no-explicit-any debt untouched by this change.

### Remaining Work

Real experimental data collection (Next Task items 1-2) only.

---

## Checkpoint 11

### Feature

Real resume previewing in the Add Applicant wizard (user request): the selected file can be
opened from Step 2 by clicking its name, and the Step-3 left panel now renders the ACTUAL
uploaded file instead of the old fake "Mock preview" paper.

### Files Created

None.

### Files Modified

- `frontend/src/components/modules/ApplicantManagement.tsx`:
  - Blob-object-URL lifecycle for `addResumeFile` (created per file, revoked on
    change/unmount) + `openResumePreview()` helper.
  - Step 2: when a file is chosen, its name becomes a primary-colored clickable link with an
    Eye icon that opens a native browser tab preview; stopPropagation prevents the label's
    file-picker from also firing.
  - Step 3 left panel: image resumes render as <img>, PDFs render inline via <iframe>,
    DOC/DOCX (not browser-renderable) show an explanatory fallback with an "Open file"
    button. Footer now shows real file size + extension and "Uploaded resume" instead of
    "Page 1 of 1 / Mock preview". The header filename is likewise click-to-open
    (keyboard-accessible).

### Database Changes

None.

### Tests Performed

tsc --noEmit clean; npm run build passes both environments.

### Remaining Work

Real experimental data collection (Next Task items 1-2) only.

---

## Checkpoint 12

### Feature

Step-3 preview polish (user request): removed the blank lower strip under the resume preview,
locked the Step-3 modal height so it no longer grows when results render, and added a
zoom-in/zoom-out/reset control to the preview.

### Files Created

None.

### Files Modified

- `frontend/src/components/modules/ApplicantManagement.tsx`:
  - Deleted the footer div under the preview (size/ext + "Uploaded resume" row) that created
    the white gap; the preview area is now `flex-1 min-h-0` inside a `flex flex-col` card, so
    it fills the card flush with no leftover space.
  - Step-3 grid fixed at `lg:h-[480px]`; right result column scrolls internally
    (`lg:max-h-full lg:overflow-y-auto`) instead of stretching the whole dialog - modal
    height stays constant between steps and while sections render.
  - New zoom toolbar (overlay top-right of preview): ZoomOut / live % label / ZoomIn /
    Reset (RotateCcw). Bounds 50%-300% in x1.25 steps; resets automatically whenever the
    selected file changes. Images scale by width % inside an overflow-auto pane (scrollable
    when zoomed); PDF iframes widen within a scrollable pane; DOC fallback unaffected.
  - Mobile (<lg): preview keeps a sensible fixed height (380px); desktop fills the grid.

### Database Changes

None.

### Tests Performed

tsc --noEmit clean; npm run build passes both environments.

### Remaining Work

Real experimental data collection (Next Task items 1-2) only.

---

## Checkpoint 13

### Feature

User-feedback refinement of the Step-3 preview: removed the custom zoom toolbar (ZoomOut /
% / ZoomIn / Reset) because the browser's embedded PDF viewer already provides its own zoom
controls, and removed the duplicate horizontal scrollbar by dropping the outer overflow-auto
panes - media now fits its container directly (image object-contain, iframe h/w-full).

Also reverted the now-unused pieces: previewZoom state + reset, PREVIEW_ZOOM_* constants,
RotateCcw import.

Kept from Checkpoint 12: flush preview card (no bottom strip), fixed lg:h-[480px] grid with
internally-scrolling right column (constant modal height).

### Files Modified

- `frontend/src/components/modules/ApplicantManagement.tsx`
- `DEVELOPMENT_PROGRESS.md` (this checkpoint)

### Database Changes

None.

### Tests Performed

tsc --noEmit clean; npm run build passes both environments.

### Remaining Work

Real experimental data collection (Next Task items 1-2) only.

---

## Checkpoint 14

### Feature

First real ground-truth evaluation round using RESUME/ (17 files, incl. the three
"alternative template" docx resumes whose true details the user supplied). Batch tooling ran
the full pipeline (SOP1 parse success 100%, 16 unique JSONs - two Bianca copies share one
name; the plain non-(1) copy was later removed from disk as a corrupt duplicate). Comparison
exposed five extractor bugs + vocabulary gaps; all fixed and re-verified.

### Files Created

- `nlp-service/evaluation_output_all/intended_jobs.json` (documented harness mapping each
  trio resume to its TRUE intended role requirements)
- `nlp-service/evaluation_output_scored_intended/` (scored run outputs)

### Files Modified

- `nlp-service/app/services/entity_extraction.py`:
  1. Experience scope: when no EXPERIENCE section body exists, scan full text MINUS
     education/summary/skills bodies (certifications intentionally kept - relocated docx
     tables park work rows there). Fixes 8.6/9.6-yr inflation from education dates
     (now 4.6/5.6, matching truth).
  2. Certifications: section-context fallback captures entries lacking NC/"certificate"
     keywords ("Customer Service Excellence, 2025"); trailer guards stop at References /
     date-range rows; pipe-list lines skipped; reference-known certs now ALWAYS appended via
     whole-text scan (safety net).
  3. Names: `_NAME_ROLE_WORDS` extended with heading words ("training","hygiene",
     "supervision","management",...) so "Hygiene Training"/"WORK EXPERIENCE" can never be a
     PERSON; new `_repair_with_caps_header()` prefers an ALL-CAPS header line that strictly
     extends a partial NER name ("James Flores" -> "NATHANIEL JAMES FLORES"); "about/me"
     added to stopwords.
  4. Education: `_EDU_NOISE_VALUES` rejects bare headers/fragments ("EDUCATION",
     "Bachelor of"); near-duplicate dedupe keeps the most complete variant; new DEGREE
     pattern `certificate(?: in| of)? ...`.
- `nlp-service/app/services/section_detection.py`: flush() now records sections even with
  empty bodies - adjacent headings (docx table relocation) previously vanished, causing
  whole-document fallback scans.
- `nlp-service/app/services/profile_builder.py`: profile.certifications now includes
  unrecognized entries (guide SOP 2: flag, never hide) + new
  `unrecognized_certifications` key.
- `nlp-service/app/data/skills.json|job_roles.json` AND DB `screening_reference_data`
  (15 upserts, cache flushed): aliases hotel front office/reservation support/opera pms/
  inventory checks+support/pastry preparation/basic baking; new skills Shift Supervision,
  Guest Recovery, Staff Training, Scheduling, Cake Decoration, Kitchen Hygiene; roles
  Restaurant Supervisor, Pastry and Bakery Assistant (+aliases), GRO/FrontDesk alias adds.
  Totals now 48 skills / 20 job_roles / 11 certifications (DB = bundled parity).

### Verification

- tests/smoke_test.py ALL PASS after every change (4 classifications intact).
- Trio after fixes vs user ground truth: names 3/3 exact; certs Nathaniel 2/2, Bianca 2/2,
  Clarisse NC II captured (+institution-line noise flagged); education clean single entries;
  years 4.6 / 5.6 / 5.6 vs truth ~4 / ~5 / ~4 (Clarisse slightly high - known edge).
- Scored vs INTENDED roles: all three 100.0% PERFECT_FOR_THE_JOB with correct matched-skill
  sets and experience gates met (Guest Relations Officer / Restaurant Supervisor /
  Pastry and Bakery Assistant).

### Remaining Work

Same as Next Task: scale this compare-and-fix loop across the remaining 13 resumes'
ground truths; final SOP figures still need the full annotated batch.

---

## Checkpoint 15

### Feature

Wizard auto-fill from resume (user request): uploading a file in Add Applicant Step 2 runs a
lightweight NLP extraction pass and auto-fills EMPTY contact fields (Full name, Email,
Contact number, Address) - user-entered values are never overwritten. New `address`
extraction added to the NLP profile. Also fixed the seed gap where "Guest Relations Officer"
and "Front Desk Receptionist" had no job_posts rows (wizard aborted with "No job post found").

### Files Created

None.

### Files Modified

- `nlp-service/app/services/entity_extraction.py`: `_extract_address(head_text)` heuristic -
  contact-line segments minus email/phone pipes; must contain comma + location word
  (city/philippines/manila/street...); rejected when it looks like a person name; returned
  as `address` in the extraction payload.
- `nlp-service/app/services/profile_builder.py`: `personal_information.address` added.
- `backend-laravel/app/Services/NlpService.php`: new `extractResume()` proxy to
  POST /extract-resume.
- `Modules/ApplicantManagement/.../ApplicantManagementController.php`: NlpService injected;
  new `extractResume()` action returning only success/processing_status/personal_information.
- `Modules/ApplicantManagement/routes/api.php`: POST applicants/extract-resume inside the
  auth+permission group.
- `frontend/src/lib/api.ts`: typed applicantsApi.extractResume.
- `frontend/src/components/modules/ApplicantManagement.tsx`: `autofillFromResume()` fired on
  every successful file pick/drop - fills ONLY empty fields (phone via sanitizePhone with
  +63->0 normalization), latest-request guard, info toast, error toast, drop-zone hint shows
  "Reading resume - filling contact fields..." while in flight.

### Database Changes

- `job_posts` +2 Open rows: Guest Relations Officer #15 and Front Desk Receptionist #16
  (skills_json/education_level/experience_level set for role-specific screening);
  `positions` +2 matching rows (POS-018/POS-019 style codes).

### Verification

- smoke_test.py ALL PASS after address additions.
- Live API: extract-resume with Nathaniel docx -> 200 {name NATHANIEL JAMES FLORES, email,
  phone +63..., address "Makati City, Philippines"}.
- Browser E2E (Playwright admin session): fresh wizard ALL fields empty -> upload docx ->
  all four fields auto-filled (+63 normalized to 0-prefix) -> Run screening -> 100% Perfect
  for the Job vs FDR post #16 with 5/5 required skills matched. Screenshot
  autofill-step2-nathaniel.png. Test token revoked afterwards; tsc/build green.
- Operational note: uvicorn runs WITHOUT --reload -> any nlp-service code edit requires an
  NLP service restart to take effect (stale-code incident hit during browser testing).

### Remaining Work

Real experimental data collection (Next Task items 1-2) only.

---

## Checkpoint 16

### Feature

Resume-swap confirmation + strict phone normalization (user request). Rules implemented in
the Add Applicant wizard Step 2:

1. Form EMPTY (no resume, nothing typed) -> upload accepts silently and auto-fills.
2. Form has ANY details (user-typed OR extracted from a previous resume) -> uploading a
   resume opens a confirm modal: "Replace applicant details?" naming both files; Replace
   overwrites all four contact fields with the new extraction; Keep current details cancels
   the new file entirely (old file + values untouched).
3. Phone normalization: strip "-" / spaces / parens; leading "+63" -> "0"
   ("+63 917-403-8821" -> "09174038821").

### Files Modified

- `frontend/src/components/modules/ApplicantManagement.tsx`:
  - handleResumeFile now routes: valid file + form-has-details -> pendingResume/replaceOpen
    modal; else applyResumeFile() directly.
  - applyResumeFile(file): sets file then autofillFromResume(file, { overwrite: true }).
  - autofillFromResume(file, {overwrite}): merge mode keeps user-typed values (previous
    behavior); overwrite mode replaces all provided fields. Both use new top-level
    normalizePHPhone() (+63->0, non-digits stripped, 7-15 digit sanity).
  - New confirm Dialog listing old file -> new file and the four overwritten fields;
    "Keep current details" discards the pending upload completely.
  - Wizard close/reset also clears pending modal state.
- `DEVELOPMENT_PROGRESS.md` (this checkpoint).

### Database Changes

None.

### Verification

tsc --noEmit clean; npm run build green. Playwright E2E all three scenarios:
A) empty form + nathaniel docx -> silent auto-fill (no modal), phone 09174038821 normalized;
B) second upload (maria pdf) over filled form -> modal shown naming both files -> Replace ->
   fields swapped to Maria Isabel Reyes set, phone 09173218456, file swapped to pdf;
C) third upload (clarisse docx) -> modal -> Keep current details -> nothing changed
   (maria values + her pdf retained). Screenshots replace-confirm-modal.png.

### Remaining Work

Real experimental data collection (Next Task items 1-2) only.

---

# Problems or Errors

### Resolved during testing: scanned/image-based PDFs failed extraction

A real user resume (`RESUME/Julian Rivera — Guest Services Professional.pdf`) had NO text
layer (2 pages, each a single image). Fixed by adding a PDF-OCR fallback:
`extract_pdf()` now rasterizes pages via PyMuPDF (~200 dpi) and recovers text with
Tesseract when pdfplumber finds nothing (method reported as `pdf-ocr (pymupdf+tesseract)`,
status PARTIALLY_PROCESSED with an OCR warning). Dependency added: `pymupdf>=1.24`.

Also fixed the name heuristic grabbing headlines like "Guest Services Professional" as a
PERSON name (`_NAME_ROLE_WORDS` rejection list in `entity_extraction.py`).

### Resolved (follow-up session): header contact block missing from scanned-PDF OCR

Root cause found by rendering page 1 and inspecting it visually: the resume header is a
colored banner ("Julian Rivera" in large display font + contact lines on a sage-green
rounded rectangle). Two independent OCR problems:

1. Full-page Tesseract layout analysis (psm 3) classified the banner as a graphic and
   skipped it entirely - identical output across plain/inverted/grayscale/blue-channel
   preprocessing proved preprocessing was NOT the issue.
2. On isolated banner crops, Tesseract's global binarization merges the dark contact
   text INTO the mid-tone green background (both fall below the Otsu threshold), turning
   the banner into a black blob.

Fix (`nlp-service/app/services/text_extraction.py` -> `_ocr_with_regions`), applied to
both the PDF-OCR fallback and image resumes - three passes merged in reading order with
line-level dedup (min length 4):

1. Name-zone crop (left 45% x top 13%), psm 6 -> recovers display-font names cleanly.
2. Header strip (top 20%) binarized with an explicit dark-text threshold
   (`gray < 120 -> black else white`) -> recovers contact lines that vanish in
   full-page binarization.
3. Full page plain -> body content.

Also switched the PDF rasterizer from pymupdf to **pypdfium2** (preferred, pure wheel)
with pymupdf kept as fallback - `requirements.txt` now lists `pypdfium2>=4.0`.
Regression test added: `nlp-service/tests/test_scanned_pdf_regression.py` (ALL PASS:
name, email, phone, address, body all recovered from the scanned PDF).

Known minor OCR noise: thresholded pass read the phone area code as "(655)" instead of
"(555)", and the display-font name leaves a garbled token line in the merged text
("J u I Id n R iverd ...") - harmless (clean name is captured first; unknown tokens are
flagged UNRECOGNIZED by design). Covered by the existing "OCR accuracy may be lower" warning.

### Environment note (this machine, follow-up session) - RESOLVED

This clone initially ran with only fastapi/uvicorn, pdfplumber, pypdfium2 and
pillow present while the network stalled on large downloads. RESOLVED in the
follow-up session: `pip install spacy` (3.8.15) + `python -m spacy download
en_core_web_sm` + `pip install python-multipart pytesseract` all succeeded once
the network recovered. Custom NER model files (`models_spacy/role_specific_ner`)
were already in the repo. Full pipeline, smoke test, NER evaluation and the
Laravel+NLP E2E are now all verified on this machine (see Last Completed Task).
Note for multi-machine accuracy: the OTHER development clone runs Python 3.13;
THIS clone runs Python 3.11.4 - both verified working.

Record errors here.

Example:

### Error

`ModuleNotFoundError: No module named 'spacy'`

### Cause

spaCy dependency is not installed.

### Solution

Install spaCy and required language model.

---

# Important Decisions

Record important architecture or research decisions here.

### Decision: Synchronous screening retained; queue-based async deferred (Checkpoint 8)

Queue-based async screening (the last "optional enhancement") was evaluated and consciously
deferred. Reasons:

1. No guide/SOP requirement is unmet: SOP 1's success definition is extraction-outcome based
   (PROCESSED / PARTIALLY_PROCESSED / FAILED persist per screening). PENDING/PROCESSING are
   request-transient states; the documented status vocabulary remains complete.
2. Operational risk asymmetry: queues need a supervised `queue:work` worker. In this XAMPP
   demo environment nothing supervises workers - if absent, resumes would sit PENDING
   forever, a WORSE failure mode than today's reliable synchronous flow.
3. Late-stage stability: the wizard already handles multi-second waits with a loading state;
   adding polling UI + job infra near project end risks the verified E2E flows for zero
   research value.

Revisit only if real batch volumes (Next Task item 2) actually make sync processing painful.

### Decision: Screening Result vs Recruitment Stage

Screening result and recruitment stage are stored separately, matching the existing schema.

Screening Result (`applicants.status`):

- fit -> Perfect for the Job
- credential -> Invalid Credential
- other-role -> Fit for Other Job
- not-fit -> Not Fitted to Job

Recruitment Stage (`applicants.stage`):

- Screened / Interview Scheduled / Assessed / Offer / Hired / Rejected / Accepted

Reason:

Screening result represents applicant-job compatibility.

Recruitment stage represents the applicant's progress in the recruitment process.

### Decision: Missing certification is a qualification gap, not automatic Invalid Credential

The guide lists "a required certification is missing" as a POSSIBLE invalid-credential
example. The system's own seed data shows missing certifications recorded as flags on
'not-fit' applicants (e.g., applicant #6: "No culinary certification") while 'credential'
status is reserved for malformed/unverifiable credentials (applicant #7: malformed email,
incomplete phone). Implemented rules therefore classify:
- INVALID_CREDENTIAL = INVALID_FORMAT essential info OR UNVERIFIABLE_REQUIRED_CREDENTIAL
  (certification-like entries exist but cannot be validated against reference data).
- Completely absent required certification = unmet requirement that gates PERFECT and lowers
  the score; applicant can still be FIT_FOR_OTHER_JOB or NOT_FITTED_TO_JOB.
This keeps "Invalid or requires verification based on system validation rules" honest and
avoids conflating qualification gaps with credential validity.

### Decision: Scoring weights fixed at Skills 40 / Experience 30 / Education 20 / Certifications 10

Verified against historical `applicant_screening_scores` seed rows and the frontend mock
breakdown (0.4/0.3/0.2/0.1). Configurable in nlp-service/app/config.py SCORE_WEIGHTS.
Completeness of required information acts as a mandatory gate for PERFECT_FOR_THE_JOB instead
of a scored component (documented).

### Decision: Extraction methods are tracked per entity

Every entity carries source in {regex, section_rule, spacy_base, custom_ner} so documentation
and evaluation can honestly distinguish NER output from rule/regex extraction, per the guide's
requirement to not falsely label all extraction as NER.

### Decision: NER training uses a synthetic seed corpus initially

Real annotated resumes do not exist yet. A generator produces annotated hotel-domain resumes
with exact spans so the entire train/evaluate toolchain works end-to-end. Metrics from this
corpus support pipeline verification only; final SOP 4 numbers require real data.

---

# Next Continuation Instruction

When development stops, use the following instruction:

"Inspect DEVELOPMENT_PROGRESS.md and the current project code first.

Perform a project state audit.

Do not restart completed features.

Verify the current implementation against the capstone title, main goal, SOPs, objectives, and official screening statuses.

Identify:

1. Completed requirements
2. Partially completed requirements
3. Broken or incomplete requirements
4. The next correct development step

Update DEVELOPMENT_PROGRESS.md after completing the next major feature."