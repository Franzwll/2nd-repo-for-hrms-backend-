# Resume Screening (RS) Process — Step-by-Step with Validation
> Oxford Suites Makati HRMS — Applicant Management + spaCy NLP Screening
> Source-verified from: `backend-laravel/Modules/ApplicantManagement/`, `nlp-service/app/`, `docs/NLP_FEATURE_DOCUMENTATION.md`

---

## 0. Pre-condition: Job Post & Job Requirements (Screening cannot run without this)

Screening is always **resume VS job requirements**. No Job Post = no score.

1. **HR creates Requisition → converts to Job Post**, or creates Job Post directly in Recruitment module. Published with `status='Open', active=1` so it appears on the public Careers portal and in alternative-job matching.
2. **Job Post Builder fills the 4 screening inputs** (stored in `job_posts` table):
   - `skills_json` → `required_skills` — e.g. `["Opera PMS", "Customer Service", "Front Office Operations"]`
   - `qualifications_json` → filtered by `ScreeningService::extractRequiredCertifications()` for keywords `NC / certificate / license` → `required_certifications` — e.g. `"Must hold TESDA Front Office Services NC II"`
   - `education_level` — e.g. `Bachelor's Degree`
   - `experience_level` — e.g. `1-2 Years` → parsed to `min_years_experience = 1.0` by `matching.py:parse_min_years()`
3. **Screening Setup (HR-configurable, stored in `system_settings.screening.configuration`):**
   - Weights: default `Skills 40 / Experience 30 / Education 20 / Certifications 10` (`nlp-service/app/config.py`, `matching.py:_validated_weights()`)
   - `passing_score` default `75`, `required_skills_coverage_min` default `0.60`
   - Requirement Templates (`screening_requirement_templates`): reusable per-position entity lists → `Use in job post` seeds Required Skills + Qualifications + education/experience in one click.
4. **Reference taxonomy (`screening_reference_data`):** canonical skills / job_roles / certifications + aliases. Managed from UI via `ScreeningReferenceController`. Sent per-request to Python; if empty, Python falls back to bundled seed JSON.

> Code: `backend-laravel/Modules/ApplicantManagement/app/Services/ScreeningService.php:buildRequirements(), buildOpenJobs(), screeningSettings(), referenceData()`

---

## 1. Resume Upload & API Ingestion

**Two entry points, same backend:**

| Path | File | What happens |
|---|---|---|
| Candidate applies on Careers page | `frontend/src/routes/_landing/jobs.$jobId.tsx` | Selects specific `job_post_id`, uploads PDF/DOCX/PNG/JPG → `POST /api/v1/applicants` multipart |
| HR walk-in / Add Applicant wizard | `frontend/src/components/modules/ApplicantManagement.tsx:AddApplicantModal` | Uploads file → `POST /api/v1/applicants/extract-resume` for auto-fill preview (name/email/phone/skills in <2s), then `screenPreviewFile()` shows live score before creating applicant |

**Laravel ingestion** — `ApplicantManagementController.php:store()`:
1. Validates mimetype/size, stores file in `storage/app/public/resumes/`, creates `applicants` row (name, email, phone, `resume_file_path`, `resume_original_name`, `resume_hash`).
2. Calls `ScreeningService::screenAndPersist()` which loads the applied `JobPost`, builds `requirements + openJobs + referenceData + screeningSettings + documentVerifications`, and delegates to `App\Services\NlpService.php:screenResumeStructured()` → `POST http://127.0.0.1:8001/screening/score` (multipart: `file + requirements + open_jobs + reference_data + screening_settings + document_verifications`).

Frontend never talks to Python directly — single auth boundary via Laravel Sanctum.

---

## 2. FastAPI Reception — `nlp-service/app/main.py:screening_score()`

1. Parses JSON form fields (`_parse_json_field()` — 422 on invalid JSON).
2. Writes upload to temp file, calls `pipeline.py:analyze_resume_file(path, filename, requirements, openJobs, referenceOverride, settings, documents)`.
3. Deletes temp file, returns full JSON or 422 with structured `processing_status=FAILED`.

Lightweight variants: `POST /extract-resume` (parse only, no scoring), `POST /screening/analyze-text` (raw text), `POST /screening/reclassify` (re-score stored profile without re-OCR), `POST /verification/supporting-document` (COE/Certificate vs resume).

---

## 3. Stage 1 — Multi-Format Text Extraction (`text_extraction.py:extract_text()`)

| Input | Engine |
|---|---|
| Digital PDF | `pypdfium2` TextPage + `pdfplumber` fallback, `_structure_score()` preserves 2-column layouts |
| Scanned PDF (no text layer) | Rasterize at 2.0x zoom → `pytesseract` OCR |
| Image PNG/JPG (camera scan) | `pytesseract` + OpenCV/Pillow CLAHE, deskew, blur mitigation |
| DOCX | `python-docx` paragraph/table walker in order |
| TXT | UTF-8 → Latin-1 fallback, strips null bytes |

Output: `raw_text + {method, pages, extension, warnings}`.

---

## 4. Stage 2 — Cleaning & OCR Repair (`preprocessing.py:preprocess()`)

- Email repair: `(at)/[at]/ at → @`, join split local-parts `dan\niel.cruz@gmail.com → daniel.cruz@gmail.com`, domain typos `gmai1/gmial/gnail → gmail`, `yah00 → yahoo`, `.c0m/.corn → .com`.
- Phone: PH regex for `+63 9XX XXX XXXX`, `09XX-XXX-XXXX`, `(02) 8XXX-XXXX loc`.
- Disentangles mixed contact lines (address + email + phone + LinkedIn on one OCR line).

Output: `cleaned_text`.

---

## 5. Stage 3 — Section Detection (`section_detection.py:detect_sections()`)

Rule-based + fuzzy header matching (`cutoff ≥ 0.72` tolerates `PROFESIONAL SUMARY`, `WORK EXPRINCE`):

`Education / Experience / Skills / Certifications / Summary-Objective / Contact / Additional (References, Affiliations, Languages)` → character-offset spans so NER applies section-aware heuristics.

---

## 6. Stage 4 — Named Entity Recognition (`entity_extraction.py:extract()`)

Four layers combined:

1. **Regex:** emails, phones, date intervals (`YYYY-YYYY`, `Month YYYY – Present`).
2. **Section rules:** competencies bounded inside Skills section.
3. **spaCy `en_core_web_sm`:** sentences, `PERSON`, `ORG`.
4. **Custom `role_specific_ner`:** hospitality-tuned transition parser trained on annotated hotel resumes (`training/data/annotated_resumes.json`).

Labels: `PERSON` (applicant name, not references), `EDUCATION` (BSHM, TESDA Cookery, High School), `JOB_TITLE` (Front Desk, Commis Chef, Bartender), `SKILL` (Opera PMS, HACCP, Table Setting), `CERTIFICATION` (TESDA NC II, Food Handler, PRC). Also emits `work_history[] {job_title, company, period, date_range}`, `estimated_years_experience`, `emails_malformed[]`.

---

## 7. Stage 5 — Taxonomy Canonicalization (`reference_data.py:canonicalize(), classify_items()`)

Maps every raw variant to canonical DB concept via 4-step cascade:

`Exact (case-insensitive) → Substring boundary → Token-set permutation → Fuzzy SequenceMatcher ≥ 0.82`

Example: `"knowledgeable in point of sale micros systems" → "POS Systems" (RECOGNIZED)`.

**No Silent Dropping rule:** not in dictionary → `UNRECOGNIZED`, kept visible with orange badge, never penalized. HR can `Promote to Canonical` from portal → inserted into `screening_reference_data` with aliases, no deploy.

---

## 8. Stage 6 — Profile Assembly + Format Validation (`profile_builder.py`)

**`build_profile()`** standardizes:
```json
{ "personal_information": {name, email, phone, address}, "education": [], "work_experience": [], "skills": [recognized], "certifications": [recognized+unrecognized], "estimated_years_experience": 0.0, "job_roles": {recognized, unrecognized} }
```

**`validate()` — first validation gate (MISSING / INVALID_FORMAT / UNRECOGNIZED):**
- `required_information = [name, email, phone]` (from Laravel; defaults in `config.DEFAULT_REQUIRED_INFORMATION`).
- `MISSING`: `name/email/phone/education/work_experience` absent → blocks `PERFECT_FOR_THE_JOB` via `mandatory_requirements_met=false`.
- `INVALID_FORMAT` → also appended as `credential_issues[] {type: INVALID_FORMAT}` → later forces `INVALID_CREDENTIAL`. Checks: strict email regex `EMAIL_STRICT_RE`, PH phone `_phone_is_valid()` (7–15 digits, `09XXXXXXXXX` mobile rule).
- `skill_analysis {recognized, unrecognized}`, `job_role_analysis {recognized, unrecognized}` — informational only.

**`analyze_with_certifications()` — second validation gate (credential analysis):**
- Each `required_certification` canonicalized then exact/substring-matched against applicant certs → row `{required, status: RECOGNIZED | MISSING, matched_value}`.
- Extracted cert not in reference → row `{status: UNRECOGNIZED}`.
- **Escalation rule:** job requires certs + zero matched + applicant listed something unverifiable → issue `UNVERIFIABLE_REQUIRED_CREDENTIAL → INVALID_CREDENTIAL` (MISSING rows flipped to `UNVERIFIABLE`). Pure absence (no certs listed at all) stays a qualification gap, not fraud.

---

## 9. Stage 7 — 7-Point Credential Verification (`credential_verification.py:verify_credentials()`)

Internal-consistency audit on profile + work_history. Each WARNING = `-5 pts` (cap `-15`); `≥3 WARNINGs → escalate_invalid=true → INVALID_CREDENTIAL`:

1. **Timeline Overlaps** — two full-time roles overlapping ≥3 months (OJT/intern/part-time/freelance exempt; same-company promotion exempt).
2. **Future Dates** — start/end beyond current month/year; education year > current+5.
3. **Experience vs Graduation Gap** — claimed yrs exceeds yrs-since-graduation by ≥5 (allows 4 yrs working-through-college).
4. **Seniority Mismatch** — Executive (Director/GM/VP/Chief/Exec Chef) with <2.5 yrs; Manager with <1 yr.
5. **Job Hopping** — ≥5 full-time positions within 24 months → INFO (advisory, no penalty).
6. **Licensure Prerequisites** — CPA / PRC Nurse-Engineer / LET / RND / Criminologist claimed with education rank < Bachelor's (rank 4) → WARNING.
7. **Chronological Incoherence** — `2024-2021` inverted spans; earliest work >15 yrs before graduation.

Returns `{flags[], warning_count, info_count, risk_level LOW/MEDIUM/HIGH, score_penalty, escalate_invalid, summary}`. Flags merged into `validation.review_flags[]` and `credential_issues[] {type: CREDENTIAL_VERIFICATION_CONCERN}` when escalated.

Penalty is subtracted from resume score **before** document blending.

---

## 10. Stage 8 — Multi-Criteria Scoring (`matching.py:match_profile_to_requirements()`)

Explainable 100-pt model (HR weights override via `_validated_weights()`, accepts `0.4` or `40`):

```
Overall = S×0.40 + E×0.30 + A×0.20 + C×0.10
S (Skills) = 100 × (0.70 × matchedRequired/totalRequired + 0.30 × matchedPreferred/totalPreferred)  [exact + fuzzy ≥0.88]
E (Experience) = 100 × min(1, applicantYears / minYearsRequired)
A (Education) = 100 × ratio(gap) on 6-tier ladder HS<Vocational<TESDA<Undergrad<Bachelor's<Master's<Doctorate>; gap0=1.0, gap1=0.5, gap2+=0.25…
C (Certs) = 100 × matchedRequired/totalRequired  [100% if job defines none]
```

`mandatory_requirements_met = education_met AND experience_met AND required_coverage ≥ 0.60 AND completeness_ok (no MISSING)`. Breakdown records `matched_required, fuzzy_matched_required {req: found}, missing_required, estimated_years vs min_years, applicant_highest vs required_level` for UI radar + reasons.

---

## 11. Stage 9 — Decision Classification + Document Blend (`screening.py` + `verification_scoring.py`)

Order matters — `screening.py:full_classification()` → `classify_applied_job()` then `evaluate_alternative_jobs()`:

1. **Resume penalty applied:** `resume_score = match_score − credential_penalty`.
2. **Document evidence blended into RANKING score:** `Ranking = Resume×0.85 + Docs×0.15`, where per-document credit `VERIFIED=1.0, UNABLE_TO_VERIFY=0.5, DISCREPANCY_FOUND=0.0, PENDING=excluded`. No decisive docs → no-op (resume score kept). Statuses: `NOT_PROVIDED / PENDING / VERIFIED / PARTIAL / DISCREPANCY`.
3. **Blocker check → `INVALID_CREDENTIAL (credential)`:** any `INVALID_FORMAT | UNVERIFIABLE_REQUIRED_CREDENTIAL | CREDENTIAL_VERIFICATION_CONCERN`, OR any document `DISCREPANCY_FOUND` (mismatched fields quoted: Employer, Job title, Start date, Degree, Certification…).
4. **Pass check → `PERFECT_FOR_THE_JOB (fit)`:** `mandatory_met AND ranking ≥ passing_score (75)`.
5. **Fallback → score every other Open job identically (blended too):** best eligible (`mandatory_met AND ≥75 AND outscores applied`) → `FIT_FOR_OTHER_JOB (other-role)` + `{job_post_id, title, alternative_match_score, reason}`.
6. **Else → `NOT_FITTED_TO_JOB (not-fit)`** with reasons (which mandatory failed, coverage %, weakest component, missing info).

Every result carries `match_score (ranking), resume_match_score (resume-only), document_verification {status, documents_score, verified/discrepancy/unable counts, score_penalty, flags}, score_breakdown, screening_status, screening_reasons[] (human sentences), alternative_job, mandatory_detail, missing_requirements`.

Recompute path: `POST /screening/reclassify` replays stored `profile_json + validation_json` + current documents — no re-OCR. Triggered auto on doc upload/re-verify/delete via `ScreeningService::recomputeWithDocuments()` and manually via `POST /api/v1/applicants/{id}/screening/recompute`.

---

## 12. Persistence & Presentation (Database + Client Tier)

**`ScreeningService.php:persistResult()` writes MySQL (`hotel_hr`):**
- `applicant_screenings` — full audit: `processing_status (PROCESSED/PARTIALLY_PROCESSED/FAILED), screening_result (fit/credential/other-role/not-fit), match_score, resume_match_score, score_breakdown_json, profile_json, entities_json, validation_json, alternative_job_json, document_verification_json, reasons_json, model_info_json`.
- `applicant_screening_scores` — 4 rows (`Skills/Experience/Education/Certifications → earned`).
- `applicant_screening_entities` — one row per NER entity (`label, value`).
- `applicants` updated: `fit_score=ranking, status=official, summary + flags_json[]` (invalid formats, unrecognized skills/roles, `[WARNING]…`, `[DOCUMENT]…`, `Stronger match: X (Y%)`).

**UI — `ApplicantManagement.tsx:ApplicantDetailModal`:**
Score badge, radar chart, `Resume score → Documents score → Ranking score`, timeline flags, alternative-job transfer button, Top-5 + Candidate Ranking tables (all read `fit_score + status`, refreshed live on recompute).

---

## Quick Example (your own resume)

1. HR posts **Front Desk Receptionist**: skills `[Opera PMS, Customer Service, Front Office Operations]`, education `Bachelor's Degree`, experience `1-2 Years`, quals `"TESDA Front Office Services NC II"`.
2. You upload `ferdi_resume.pdf` on that job page.
3. Pipeline extracts `name/email/phone`, NER finds `Opera Property Management System → canonical Opera PMS (fuzzy)`, `Customer Service (exact)`, `BS Hospitality Management (education rank 4 ≥ 4 ✓)`, `2.5 yrs ≥ 1.0 ✓`, `TESDA NC II ✓`.
4. Validation: no MISSING/INVALID_FORMAT; verification 0 warnings → no penalty.
5. Score e.g. `S 35/40 + E 30/30 + A 20/20 + C 10/10 = 95 resume`; no docs → ranking `95`; mandatory ✓ + `≥75` → **`PERFECT_FOR_THE_JOB (fit)`** → fast-track to interview.
6. If instead you applied to Restaurant Manager (requires 5 yrs) with 1 yr → fails mandatory → system auto-scores you vs F&B Attendant → **`FIT_FOR_OTHER_JOB`** with one-click transfer.

---

*Terminology SOP: RECOGNIZED = in reference data; UNRECOGNIZED = flagged, never auto-rejected; MISSING = required info absent; INVALID_FORMAT = bad shape; INVALID_CREDENTIAL = validation/verification concern requiring HR review (not a fraud accusation). Local-only spaCy (no cloud LLM cost, RA 10173 compliant).*
