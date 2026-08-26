# FEATURE DOCUMENTATION
## spaCy-based NLP Role-Specific Applicant Screening

Hotel & Restaurant HRMS — Recruitment Management Capstone Feature

---

## 1. Project Feature Overview

This document describes the complete design and implementation of the **Recruitment
Management Applicant Screening feature**: an end-to-end pipeline that ingests applicant
resumes (PDF, DOCX, image and plain text), extracts and standardizes applicant information
using spaCy-based Natural Language Processing with a custom-trained Named Entity Recognition
model, validates the extracted information against curated hotel-industry reference data,
computes a transparent role-specific match score against the requirements of the applied job
post, classifies every applicant into one of four official screening statuses, and — when an
applicant is not a good fit for their applied role — recommends the best-matching alternative
open position. All results are persisted into the existing Laravel HRMS database and displayed
inside the existing Applicant Management module.

---

## 2. Capstone Title

**Design and Development of Recruitment Management in Hotels and Restaurants using spaCy-based
Natural Language Processing (NLP) for Role-Specific Applicant Screening using Named Entity
Recognition (NER)**

---

## 3. Goal and Scope

The developed feature accomplishes:

1. Multi-format resume text extraction (PDF via pdfplumber, DOCX via python-docx, images via
   Tesseract OCR, plus plain text).
2. Text cleaning and preprocessing.
3. Applicant information extraction combining regex, rule-based section detection, base spaCy
   NER and a custom-trained NER model — with the extraction method tracked per entity.
4. A standardized applicant profile (personal info, education, work experience, skills,
   certifications, estimated years of experience).
5. Missing-information detection and invalid-format validation.
6. Recognition vs non-recognition classification of skills/job roles/certifications against
   reference data with alias handling (unrecognized items are flagged for review, never
   auto-rejected).
7. Credential validation per documented system rules.
8. Role-specific requirement matching derived from existing `job_posts` data.
9. Transparent match-score computation with a documented formula and full breakdown.
10. Four-status screening classification with per-decision explanations.
11. Alternative-job recommendation for misfit applicants.
12. Storage and display of everything inside the existing Applicant Management module.
13. Research evaluation support for all five SOPs (processing statistics, detection agreement,
    confusion matrix / accuracy / precision / recall / F1 methodology, NER evaluation on a
    leakage-free held-out split, and match-score alignment metrics).

Out of scope: external credential verification against issuing bodies (the system validates
against internal reference data only), and fully automatic hiring decisions (humans always act
on screening results).

---

## 4. Statement of the Problem (SOPs)

- **SOP 1.** What percentage of unstructured, multi-formatted candidate resumes can be
  successfully parsed and standardized without human intervention using a spaCy-based NLP model?
- **SOP 2.** What is the effectiveness of the developed applicant screening feature using
  spaCy-based NER in identifying missing essential applicant information and detecting invalid
  or unrecognized skills and job roles from resumes?
- **SOP 3.** What is the performance of the developed applicant screening feature using
  spaCy-based NLP and NER in identifying qualified applicants in terms of Accuracy, Precision,
  Recall, and F1-score?
- **SOP 4.** What is the accuracy of the spaCy-based NER in extracting relevant applicant
  information from resumes, including personal information, education, work experience,
  technical skills, and certifications?
- **SOP 5.** How well do the computed match scores align with actual applicant qualification
  levels?

## 5. Objectives

- **SOP 1 objective:** integrate a spaCy NLP pipeline that automatically examines, cleans, and
  organizes unstructured resume text from diverse formats into standardized candidate profiles.
- **SOP 2 objective:** determine the effectiveness of NER-driven detection of missing essential
  information and invalid/unrecognized skills and roles.
- **SOP 3 objective:** evaluate screening performance with Accuracy, Precision, Recall and
  F1-score against ground-truth qualification classifications.
- **SOP 4 objective:** measure NER accuracy per entity label using an unseen test set.
- **SOP 5 objective:** determine how accurately computed match scores align with actual
  qualification levels assigned by HR evaluators.

---

## 6. Existing System Analysis (Before This Feature)

- Backend: Laravel modular monolith (`backend-laravel`) with nwidart modules; the Applicant
  Management module already provided applicants CRUD, interviews, assessments, audit logging,
  notifications and e-mail triggers.
- The database schema anticipated automated screening: `applicants.status` CHECK constraint
  already encoded exactly the four official outcomes (`fit`, `other-role`, `credential`,
  `not-fit`), `applicants.stage` separately encoded the recruitment stage, `fit_score` stored a
  numeric score, and `applicant_screening_entities` / `applicant_screening_scores` tables
  existed for extracted entities and score breakdowns.
- However, nothing wrote to these tables automatically: `fit_score` was either typed manually or
  copied from interview assessments, and screening entities/scores were permanently empty.
- `App\Services\NlpService::screenResume()` existed as dead code: it posted a multipart file to
  `{NLP_SERVICE_URL}/screening/score`, but the Python service was a bare FastAPI skeleton with
  only `GET /health`.
- Resume upload stored files verbatim under `storage/app/public/resumes` with no processing.
- Frontend (`frontend`, TanStack Start + React 19 + shadcn/radix) had a complete Applicant
  Management UI whose "Run screening" action generated random mock results.

## 7. Applicant Management Analysis

| Existing Component | Existing Function | Action Taken | Changes | Reason |
|---|---|---|---|---|
| `applicants.status` CHECK domain | Screening result storage | REUSE | Mapped official statuses to it | Already encodes exactly the four official outcomes |
| `applicants.stage` | Recruitment stage | REUSE | None | Correctly separated concept |
| `applicants.fit_score` | Match score | EXTEND | Written by automated screening | Was manual-only before |
| `applicants.summary`, `flags_json` | Explanation/flags | EXTEND | Auto-populated from screening | Schema existed without writer |
| `applicant_screening_entities` | Entity rows | EXTEND | Refreshed after each screening | Table existed but was never written |
| `applicant_screening_scores` | Score breakdown rows | EXTEND | Component scores written per screening | Same |
| Resume upload flow | File storage | EXTEND | Triggers NLP screening after store/replace | Upload previously stored verbatim |
| `App\Services\NlpService` | HTTP client to Python | EXTEND | Added structured requirements/open-jobs call + health probe + explicit error reporting; original contract kept | Client existed as dead code with the right endpoint shape |
| `job_posts.skills_json`, `qualifications_json`, `education_level`, `experience_level` | Job content | EXTEND | Parsed into structured screening requirements server-side | No new job-requirements schema needed |
| Interviews / Assessments / hire flow | Stage progression | NOT NEEDED | None preserved (assessment fit_score sync kept) | Unrelated to classification |
| Frontend mock `runScreening` | Random demo result | MODIFY | Replaced with real API call + rich result rendering | Mock conflicted with research objectives |

No duplicate Applicant Management system was created; all new code lives inside the existing
module (plus one global service extension and frontend wiring).

---

## 8. Final System Architecture

```
Frontend (React/TanStack) — Applicant Management UI
        │  multipart upload / REST
        ▼
Laravel API (/api/v1, port 8000)
        │  Modules\ApplicantManagement
        │  ├─ ScreeningService (requirements builder, persistence)
        │  ├─ EvaluationService (SOP metrics)
        │  └─ App\Services\NlpService (HTTP client)
        ▼
Python NLP Service (FastAPI, port 8001)
        ├─ Text extraction   PDF(pdfplumber) DOCX(python-docx) TXT Image(Tesseract OCR)
        ├─ Preprocessing     unicode NFKC, control-char strip, hyphen-rejoin, whitespace
        ├─ Section detection rule-based header matching
        ├─ Extraction        regex + section rules + en_core_web_sm + custom NER (tracked source)
        ├─ Reference data    skills / job roles / certifications + aliases -> RECOGNIZED/UNRECOGNIZED
        ├─ Profile builder   standardized profile + missing/format/credential validation
        ├─ Matching          role-specific component scoring (documented weights)
        └─ Screening         four-status classifier + alternative-job analysis
                │
                ▼
        MySQL (hotel_hr)  applicants · applicant_screenings ·
        applicant_screening_entities · applicant_screening_scores ·
        screening_ground_truths
```

## 9. Technology Stack

- Backend/HRMS: PHP 8.2, Laravel 11 (nwidart modules), MySQL (`hotel_hr`)
- NLP service: Python 3.11, FastAPI, Uvicorn, spaCy 3.8 (`en_core_web_sm` + custom trained NER),
  pdfplumber, python-docx, Pillow, pytesseract (Tesseract 5.5)
- Frontend: React 19, TanStack Start/Router, TypeScript, Tailwind v4, shadcn/radix, Sonner toasts
- Communication: HTTP/multipart JSON between Laravel and Python (`NLP_SERVICE_URL`)

## 10. Database Changes

| Object | Purpose | Key fields |
|---|---|---|
| `applicant_screenings` (new, migration 2026_08_23_000001) | One row per screening run (history kept) | processing_status (SOP 1), screening_result (official status), match_score, score_breakdown_json, profile_json, entities_json, missing_information_json, validation_json, alternative_job_json, reasons_json, model_info_json, error_message, processed_at |
| `screening_ground_truths` (new, migration 2026_08_23_000002) | Expert labels for SOP 2/3/5 evaluation | true_screening_result, true_qualification_score, true_missing_information_json, true_unrecognized_skills_json, unique(applicant_id) |
| `applicants` (existing, reused) | fit_score/status/summary/flags_json now written by screening | unchanged schema |
| `applicant_screening_entities`, `applicant_screening_scores` (existing, reused) | entity + criterion rows refreshed per screening | unchanged schema |

Relationships: `applicant_screenings.applicant_id → applicants (cascade)`;
`.job_post_id → job_posts`; `screening_ground_truths.applicant_id → applicants (cascade)`.

## 11. Backend Changes (Laravel)

- `Modules\ApplicantManagement\Services\ScreeningService` — builds role requirements from
  `job_posts` fields (skills_json → required skills; education_level; experience_level parsed to
  minimum years; certifications keyword-extracted from free-text qualifications), builds the
  open-jobs list for alternatives (skipping posts with no criteria at all), calls the NLP service,
  persists everything, maps official statuses onto `applicants.status`, generates flags
  (invalid format items, unrecognized skills/roles, missing info, stronger-match note) and a
  human-readable summary.
- `App\Services\NlpService` — added `screenResumeStructured()` (multipart file +
  `requirements` + `open_jobs` JSON, 120 s timeout, explicit ok/error contract) and `healthy()`.
  The legacy `screenResume()` signature still works.
- `ApplicantManagementController` — constructor-injected ScreeningService; `store()` screens
  after upload (reusing an optional `screening_payload` from the wizard preview so NLP runs once);
  `update()` re-screens when the resume is replaced; new endpoints `POST applicants/screen-resume`
  (preview, 502 + explicit error on failure) and `GET applicants/{id}/screening`; `index()`/`show()`
  eager-load screening relations and expose `latest_screening`.
- `ScreeningEvaluationController` + `EvaluationService` — research endpoints (section 20).
- Validation/error handling: preview endpoint validates file + job_post_id; NLP failures never
  break applicant creation — they record FAILED screenings with the exact error.

## 12. Python NLP Service

Structure (`nlp-service/`):

```
app/main.py                  FastAPI app, CORS, catch-all error boundary
app/config.py                weights, thresholds, statuses, labels, paths
app/services/text_extraction.py   PDF/DOCX/TXT/image extraction + statuses
app/services/preprocessing.py     cleaning pipeline
app/services/section_detection.py resume header rules
app/services/entity_extraction.py regex + rules + base spaCy + custom NER merge
app/services/reference_data.py    reference loading, aliases, canonicalization
app/services/profile_builder.py   standardized profile + validation + credential rules
app/services/matching.py          requirement parsing + component scores
app/services/screening.py         four-status classifier + alternatives
app/services/pipeline.py          orchestration shared by endpoints
app/tools/batch_evaluate.py       SOP 1 batch runner + ground-truth template generator
                                  (nlp-service/tools/batch_evaluate.py)
app/data/skills.json              bundled fallback: canonical skills with alias lists
app/data/job_roles.json           bundled fallback: canonical hotel roles with aliases
app/data/certifications.json      bundled fallback: canonical certifications with aliases
models_spacy/role_specific_ner/   trained custom NER artifact (auto-loaded)
training/                         dataset generator, splitter, trainer, evaluator, guidelines
tests/                            smoke suite + sample-file generators
```

Reference data source of truth: the Laravel `screening_reference_data` table (seeded with the
same values as the JSON files; manageable via SQL/admin UI). `ScreeningService` sends the
current mapping to every screening request via the `reference_data` payload field, and the
service falls back to the bundled JSON when it is absent - so a fresh NLP-only deployment
still works.

Extraction methods are explicitly tracked per entity (`source`): `regex` (email/phone/date
ranges), `section_rule` (header-scoped degree/skill/cert matching), `spacy_base`
(en_core_web_sm PERSON/ORG with org-keyword noise filter), `custom_ner` (trained model), and
`reference_scan` (whole-document alias search). Cross-label corrections apply section context
and reference data (e.g., a custom-NER EDUCATION prediction naming a known skill becomes a
SKILL; JOB_TITLE predictions inside the certifications section are dropped).

Experience years come from merged date ranges ("Mar 2021 - Present") cross-checked with "N
years" phrases. Endpoints: `GET /health`, `POST /extract-resume`, `POST /ner/extract-entities`,
`POST /screening/score`, `POST /screening/analyze-text`. Training process: see section 13.

## 13. NER Dataset and Annotation

- Labels: PERSON, EDUCATION, JOB_TITLE, SKILL, CERTIFICATION (+ ORGANIZATION produced by the
  base model for display only).
- Guidelines: `training/ANNOTATION_GUIDELINES.md` (span minimality, no overlaps, annotate what
  is literally present, per-occurrence annotation).
- Seed corpus: `training/generate_seed_dataset.py` builds synthetic hotel-domain resumes with
  exact character spans by construction (80 documents, ~625 entities). It deliberately includes
  unrecognized skill phrases so downstream UNRECOGNIZED handling is exercised.
- Splitting: `training/prepare_dataset.py` shuffles whole documents and writes train (70%) /
  dev (15%) / test (15%) `.spacy` DocBins tokenized with the serving tokenizer; asserts no
  document appears in more than one split (leakage prevention).
- Training: `training/train_ner.py` loads `en_core_web_sm`, replaces the NER pipe with fresh
  components for the five labels, trains with dropout 0.35 and compounding batches, evaluates on
  dev each epoch and checkpoints the best model to `models_spacy/role_specific_ner`.
- Evaluation: `training/evaluate_ner.py` reports per-entity precision/recall/F1 on the held-out
  test split (predictions built by explicitly running the full pipeline over gold texts) and
  saves `training/data/ner_test_report.json`.

**Reported test-split result on the synthetic seed corpus: overall P=0.9896, R=1.0000,
F1=0.9948.** These figures validate the training/evaluation toolchain only; final research
numbers must be re-measured on real annotated resumes (the harness is ready for exactly that).

## 14. Role-Specific Screening Logic

Requirements are parsed from the applied job post:

- Required skills ← canonicalized `skills_json`
- Education requirement ← `education_level` ranked (HS=1 < Vocational/TESDA=2 < College Level=3 <
  Bachelor's=4 < Master's=5)
- Minimum experience ← `experience_level` ("No Experience"=0, "1-2 Years"→1, "3-5 Years"→3…)
- Required certifications ← qualification sentences containing NC II/III/IV, certificate,
  certification, license — canonicalized against reference aliases
- Required information ← name/email/phone (configurable)

Matching compares the applicant's standardized profile (alias-normalized) against these
requirements per component and produces matched/missing lists, coverage ratios and
requirement-met booleans used both for scoring and for the mandatory gate.

## 15. Match Score Formula (documented, configurable in `app/config.py`)

```
Overall = Skills(40)            × [0.7 × required_coverage + 0.3 × preferred_coverage]
        + Experience(30)        × min(1, estimated_years / min_years)      (full if min = 0)
        + Education(20)         × {1 if met; 0.5 if one level below; 0.25×(3−gap) otherwise}
        + Certifications(10)    × matched_ratio                            (full if none required)
```

Weights sum to 1.00 and mirror the historical seed breakdown (Skills 40 / Experience 30 /
Education 20 / Certifications 10). Mandatory gates can override a passing score:
education requirement met AND experience met AND required-skills coverage ≥ 60% AND essential
information complete. Every component returns earned/max values plus matched/missing lists.

## 16. Screening Classification (exact decision order)

1. Any credential issue → **INVALID_CREDENTIAL**. Issues per documented rules:
   - INVALID_FORMAT: malformed email; PH mobile not 10 digits after leading 0/63; digit count
     outside 7–15.
   - UNVERIFIABLE_REQUIRED_CREDENTIAL: the job requires a certification, the resume lists
     certification-like entries, but none validate against reference data.
   The result is always phrased as *"invalid or requires verification based on system
   validation rules"* — fraud is never claimed.
2. Else, mandatory requirements met AND score ≥ 75 → **PERFECT_FOR_THE_JOB**.
3. Else every other open job is scored identically; if the best alternative meets its own
   mandatory rules, reaches ≥ 75 and outscores the applied job → **FIT_FOR_OTHER_JOB**
   (recommendation stored).
4. Else → **NOT_FITTED_TO_JOB**, with the reasons list explaining exactly which requirements
   failed and what the best alternative reached.

Unrecognized skills/roles never trigger rejection; they are recorded as review flags.

## 17. Alternative Job Recommendation

When step 2 fails, all other open job posts (with defined criteria) are scored with the same
formula. Stored/displayed payload: recommended `job_post_id`, title, alternative_match_score,
applied_job_score, matched_skills, and a reason sentence. Posts without any criteria are
excluded because they would trivially score 100%.

## 18. Applicant Management Integration

- Add-Applicant wizard: "Run resume screening" calls `POST /applicants/screen-resume`; step 3
  renders the real score, official status badge, matched/missing required skills from the
  breakdown, recognized key skills, unrecognized-skill flags, optional alternative-job card and
  the numbered explanation list; saving posts the same payload back so NLP runs once.
- Applicant review dialog: renders real entities, real matched/missing, flags, alternative
  recommendation and "Why this result (system explanation)".
- List/detail APIs include `latest_screening`; entity and criterion tables refresh per run;
  status/fit_score/summary/flags update atomically with the screening row.
- Existing flows (interviews, assessments, hire progression, emails, audit log, notifications)
  are untouched and keep working; every screening action is audit-logged.

## 19. SOP-to-Feature Mapping

| SOP | Implemented Feature | Data Collected | Evaluation Method |
|---|---|---|---|
| SOP 1 | Multi-format extraction + preprocessing + profile generation with processing statuses | `applicant_screenings.processing_status` per resume | `GET /applicants/screening-stats` success rates (definition included in response) |
| SOP 2 | Missing/format/credential validation + recognized/unrecognized analysis | missing_information_json, invalid_format, skill_analysis, credential_analysis | `POST ground-truth` + `GET /evaluation/sop2-detection` micro P/R/F1 |
| SOP 3 | Four-status classifier with reasons | screening_result per applicant + expert labels | `GET /evaluation/sop3-screening-metrics`: confusion matrix, accuracy, per-class & macro P/R/F1, binary qualified view |
| SOP 4 | Custom spaCy NER + tracked hybrid extraction | annotated corpus + gold test split | `training/evaluate_ner.py` per-entity P/R/F1 on unseen documents |
| SOP 5 | Weighted match score with breakdown | match_score + expert qualification score | `GET /evaluation/sop5-score-alignment`: Pearson r, R², MAE |

## 20. Evaluation Guide (how to produce research results)

1. **Run the stack** (section 22) with the NLP service healthy.
2. **Collect resumes** (e.g., 50–100 varied PDF/DOCX/image resumes). Screen each through the
   wizard or batch POST `/applicants` (multipart with resume + job_post_id).
3. **SOP 1:** read `GET /applicants/screening-stats`; report strict and lenient success rates.
4. **SOP 2:** for each screened applicant have an annotator record ground truth via
   `POST /applicants/{id}/ground-truth` (`true_missing_information`, `true_unrecognized_skills`);
   then read `GET /evaluation/sop2-detection`.
5. **SOP 3:** same ground-truth pass with `true_screening_result` chosen by an HR expert per the
   official definitions; then read `GET /evaluation/sop3-screening-metrics` (matrix + metrics).
6. **SOP 4:** annotate a set of REAL resumes following `ANNOTATION_GUIDELINES.md`, replace/extend
   `training/data/annotated_resumes.json`, re-run prepare → train → evaluate; report the saved
   test report (never train-set numbers).
7. **SOP 5:** have an HR evaluator assign `true_qualification_score` (0–100) per applicant;
   read `GET /evaluation/sop5-score-alignment` (r, R², MAE, paired samples).

Do not report any metric without its paired ground truth; the endpoints return nulls/messages
when samples are insufficient rather than fabricating numbers.

## 21. Accuracy, Precision, Recall, F1 (definitions used)

- TP/FP/FN/TN counted per class from the confusion matrix (actual rows × predicted columns).
- Precision = TP/(TP+FP); Recall = TP/(TP+FN); F1 = 2PR/(P+R); Accuracy = correct/total.
- Per-class metrics use one-vs-rest counting; macro average = mean of per-class values.
- Binary "qualified" view: positive class = Perfect for the Job only (documented mapping).
- SOP 2 metrics are set-based micro averages across applicants (flagged item = unit).
- SOP 5 uses Pearson correlation of paired scores plus MAE = Σ|x−y|/n.
- Ground truth requirement: expert labels recorded through the ground-truth endpoint; the
  system never generates its own ground truth.

## 22. How to Run the Feature

```bash
# 1. Database: import database/hotel_hr_latest.sql into MySQL `hotel_hr`.
#    This dump already contains every feature table AND the seeded screening
#    reference data (71 vocabulary rows), so no migration/seeder step is needed.
#    Alternatively import hotel_hr_latestv1.sql (pre-feature seed) and let
#    `php artisan migrate` + `php artisan db:seed` create the rest:
cd backend-laravel && php artisan migrate

# 2. Backend API (port 8000):
cd backend-laravel && php artisan serve --port=8000

# 3. NLP service (first time: pip install -r requirements.txt
#    && python -m spacy download en_core_web_sm):
cd nlp-service && python -m uvicorn app.main:app --port 8001

#    Optional custom NER (re)training:
python training/generate_seed_dataset.py 80
python training/prepare_dataset.py
python training/train_ner.py 30
python training/evaluate_ner.py

# 4. Frontend dev server (port 8080):
cd frontend && npm install && npm run dev
```

Login to the staff portal, open **Recruitment & Onboarding → Applicant Management**, use
**Add applicant**, choose a job post, upload a resume, press **Run resume screening**, review
the result, then **Save applicant**. Ensure `.env` has `NLP_SERVICE_URL=http://127.0.0.1:8001`.
Image resumes additionally require Tesseract OCR installed (auto-detected at its default
Windows path even when not on PATH).

## 23. API Documentation

### NLP service (port 8001)

| Endpoint | Input | Output |
|---|---|---|
| `GET /health` | – | status, models loaded, weights, thresholds |
| `POST /extract-resume` | multipart `file` | success, processing_status, profile, entities (label/value/source), validation, text_extraction meta |
| `POST /ner/extract-entities` | JSON `{text}` | entities with source tags, sections detected, experience estimate |
| `POST /screening/score` | multipart `file` + form `requirements` JSON + optional `open_jobs` JSON | everything in extract-resume plus match_score, score_breakdown, screening_status, screening_reasons, mandatory detail, alternative_job, model_info |
| `POST /screening/analyze-text` | JSON `{text, requirements?, open_jobs?}` | same pipeline on raw text |

Failures return HTTP 422 with `{success:false, processing_status:"FAILED", error:"…"}`.

### Laravel (`/api/v1`) additions

| Endpoint | Purpose |
|---|---|
| `POST /applicants/screen-resume` | preview screening (multipart `resume`, `job_post_id`); 200 result or 502 explicit error |
| `GET /applicants/{id}/screening` | latest screening row (full detail) |
| `POST /applicants/{id}/ground-truth` | record expert labels (SOP 2/3/5) |
| `GET /applicants/screening-stats` | SOP 1 statistics |
| `GET /evaluation/sop2-detection` | detection agreement metrics |
| `GET /evaluation/sop3-screening-metrics` | confusion matrix + accuracy/P/R/F1 |
| `GET /evaluation/sop5-score-alignment` | Pearson r, R², MAE + samples |
| `POST /applicants`, `PUT /applicants/{id}` | now accept optional `screening_payload` JSON string and auto-screen when a resume is present/replaced |

`GET /applicants` and `GET /applicants/{id}` responses embed
`latest_screening` (profile, score_breakdown, validation, alternative_job, reasons, model_info,
missing_information, processing_status, processed_at).

## 24. Testing

Automated/executed during development:

- `nlp-service/tests/smoke_test.py` — four scenarios asserting each official classification
  (perfect Line Cook; malformed contact details → Invalid Credential mirroring seed semantics;
  misfit Bartender applicant with no eligible alternative → Not Fitted; Barista-profile
  applicant → Fit for Other Job with recommendation). ALL PASS.
- HTTP tests: PDF → PERFECT_FOR_THE_JOB 100% PROCESSED; DOCX → PERFECT 100%; TXT barista resume
  vs Bartender requirements → NOT_FITTED 47%; analyze-text OK; preview endpoint 200.
- Persistence tests: create-with-payload → applicant row (status/fit_score/summary/flags),
  screening row, entity rows, criterion rows verified via API and direct SQL.
- Failure path: NLP stopped → create still 201 with FAILED screening row containing the exact
  connection error; client values preserved.
- Edge cases: corrupt PDF, empty TXT, fake EXE, blank PNG → structured FAILED errors end-to-end.
- OCR path: generated PNG resume fully parsed (name/email/phone/skills) via Tesseract,
  PARTIALLY_PROCESSED due to OCR warning.
- Browser E2E (Playwright): login → wizard → upload → real screening rendered (57%, Not Fitted,
  no bogus recommendation after empty-requirements guard) → save → list count incremented →
  review dialog shows real breakdown + explanation. Verified against live DB rows.
- Frontend `tsc --noEmit` clean; production build succeeds; NER evaluation reproduces the saved
  test report.

## 25. Limitations

- Extraction quality depends on resume layout; heavily designed/graphical layouts may extract
  partially (status PARTIALLY_PROCESSED flags this rather than failing silently).
- Image OCR accuracy is bounded by Tesseract; handwriting is not supported.
- Credential checks validate only against internal reference data and format rules — the output
  explicitly means "invalid or requires verification", never "fraudulent".
- Unrecognized does not mean invalid: unknown skills/roles are flagged for human review.
- The custom NER was trained on a synthetic seed corpus; production-grade SOP 4 figures require
  real annotated resumes (toolchain ready, swap the dataset and re-run).
- Name/experience estimation heuristics can miss unconventional formats; estimates feed scores
  transparently via the breakdown.
- Screening requires the Python service to be reachable; offline operation degrades gracefully
  (FAILED row) instead of blocking applicant intake.
- No queue/async processing yet: screening runs synchronously within the request (large OCR jobs
  may take seconds).

## 26. Future Improvements

- Queue-based background screening with websockets/status polling.
- ~~Admin-managed reference data (skills/aliases/certs) moved from JSON seed files into database~~
  DONE (continuation session): the `screening_reference_data` table is now the manageable
  source of truth - seeded from the original JSON values, exposed via
  `GET /api/v1/screening/reference-data`, and sent to the NLP service on every screening
  request (`reference_data` payload field). The bundled `nlp-service/app/data/*.json`
  files remain only as a resilience fallback when the table is empty or Laravel is not
  the caller. A full CRUD admin UI for the table is still open.
- Active-learning annotation loop: export low-confidence extractions for labeling, retrain,
  hot-swap the model directory.
- Confidence scores per entity and per decision surfaced in the UI.
- Multi-language resume support (Filipino/English mixed text).
- Docker Compose packaging for one-command environments (Tesseract + models baked in).

## 27. File Change Summary

Created:

| Path | Purpose |
|---|---|
| `backend-laravel/Modules/ApplicantManagement/database/migrations/2026_08_23_000001_create_applicant_screenings_table.php` | screening history table |
| `backend-laravel/Modules/ApplicantManagement/database/migrations/2026_08_23_000002_create_screening_ground_truths_table.php` | expert labels for evaluation |
| `backend-laravel/Modules/ApplicantManagement/app/Models/ApplicantScreening.php` | screening Eloquent model |
| `backend-laravel/Modules/ApplicantManagement/app/Models/ScreeningGroundTruth.php` | ground-truth model |
| `backend-laravel/Modules/ApplicantManagement/app/Services/ScreeningService.php` | orchestration + persistence |
| `backend-laravel/Modules/ApplicantManagement/app/Services/EvaluationService.php` | SOP metric computations |
| `backend-laravel/Modules/ApplicantManagement/app/Http/Controllers/ScreeningEvaluationController.php` | evaluation endpoints |
| `nlp-service/app/config.py` | weights/thresholds/statuses/labels |
| `nlp-service/app/services/{text_extraction,preprocessing,section_detection,entity_extraction,reference_data,profile_builder,matching,screening,pipeline}.py` | NLP pipeline |
| `nlp-service/app/data/{skills,job_roles,certifications}.json` | reference data + aliases |
| `nlp-service/training/{generate_seed_dataset,prepare_dataset,train_ner,evaluate_ner}.py`, `training/ANNOTATION_GUIDELINES.md` | NER toolchain |
| `nlp-service/models_spacy/role_specific_ner/` | trained NER artifact |
| `nlp-service/tests/{smoke_test.py,make_samples.py}`, `tests/sample_resumes/*` | test fixtures |
| `nlp-service/requirements.txt` | pinned dependencies |
| `docs/FEATURE_DOCUMENTATION.md` | this document |

Modified:

| Path | Change |
|---|---|
| `nlp-service/app/main.py` | full FastAPI app (was health-only skeleton) |
| `nlp-service/app/__init__.py`, `app/services/__init__.py` | package markers |
| `backend-laravel/app/Services/NlpService.php` | structured screening call + health probe |
| `.../ApplicantManagementController.php` | auto-screening, preview + detail endpoints, eager loads |
| `.../Models/Applicant.php` | screenings/latestScreening relations |
| `.../Http/Resources/ApplicantResource.php` | latest_screening payload |
| `.../routes/api.php` | 7 new routes |
| `frontend/src/lib/api.ts` | ApiScreening types + screenResume/getScreening clients |
| `frontend/src/data/applicants.ts` | ScreeningDetail type |
| `frontend/src/components/modules/ApplicantManagement.tsx` | real screening UX (wizard + review dialog) |
| `DEVELOPMENT_PROGRESS.md` | checkpoints 1–4 and living status |

Deleted: none.

## 28. Final Development Summary

The capstone feature was implemented end-to-end without duplicating any part of the existing
HRMS. From Applicant Management, everything was reused: the applicants table and its four-status
CHECK domain, the separate recruitment-stage field, the entity/score breakdown tables, the
resume upload flow, the audit/notification services and the entire frontend module shell. What
was added is exactly the missing write path and intelligence: a FastAPI/spaCy microservice
performing multi-format extraction, hybrid tracked-method entity extraction (including a custom
NER model trained with a leakage-free dataset/eval toolchain), standardized profiling,
SOP-compliant validation terminology, role-specific matching derived from existing job-post
fields, a documented weighted match score, the four official screening classifications with full
explanations, alternative-job recommendation, persistence via two new tables, and research
endpoints that let all five SOP questions be answered once real experimental data is collected.

Research caveats (stated plainly): current NER metrics come from the synthetic seed corpus and
must be re-measured on real annotated resumes; SOP 1/2/3/5 currently demonstrate working
collection + computation pipelines (verified with controlled samples) and await genuine
experimental datasets; no accuracy/precision/recall/F1 value anywhere in this project has been
fabricated.
