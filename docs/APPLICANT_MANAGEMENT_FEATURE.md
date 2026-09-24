# Oxford Suites Makati HRMS — Applicant Management & AI Screening Feature Documentation

> **Subsystem:** Recruitment & Onboarding  
> **Module:** Applicant Management (`Modules/ApplicantManagement` + `nlp-service`)  
> **Target Enterprise:** Oxford Suites Makati, Makati City, Metro Manila, Philippines  
> **Core AI Technology:** spaCy-based Natural Language Processing (NLP) & Named Entity Recognition (NER)  

---

## 1. Subsystem Overview

The **Applicant Management Subsystem** oversees the end-to-end talent acquisition lifecycle for Oxford Suites Makati. It unifies public job applications, multi-format resume ingestion, intelligent automated screening via a dedicated Python microservice, structured interview scheduling, and assessment evaluations into a single operational pipeline.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        APPLICANT STAGE PIPELINE                        │
│                                                                        │
│   [APPLIED] ──► [SCREENING] ──► [SHORTLISTED] ──► [INTERVIEW]          │
│                                                          │             │
│   [HIRED]   ◄── [OFFERED]   ◄────────────────────────────┘             │
│      │                                                                 │
│      ▼                                                                 │
│   (Promoted to New Hire Onboarding)                                    │
│                                                                        │
│   * At any stage: Candidate may transition to [REJECTED]               │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. The Integrated NLP Screening Feature

The centerpiece of Applicant Management is its **spaCy-based NLP Screening Engine**. Rather than requiring HR recruiters to manually open, read, and evaluate every resume, the system automates resume analysis using natural language processing tailored for Philippine hospitality roles.

### 2.1. Technical Stack
- **AI / NLP Service**: Python 3.10+, FastAPI, Uvicorn
- **NLP Library**: `spaCy` (`en_core_web_sm` base model + custom fine-tuned `role_specific_ner` model)
- **Document Extractors**: `pypdfium2` (layout-preserving PDF text), `pdfplumber`, `python-docx`, `pytesseract` (Tesseract OCR for scanned resumes)
- **Backend Orchestrator**: Laravel 12 API Gateway (`Modules\ApplicantManagement\Services\ScreeningService` and `App\Services\NlpService`)
- **Database**: MySQL (`applicant_screenings`, `applicant_screening_scores`, `applicant_screening_entities`, `screening_reference_data`)

### 2.2. Execution Map: Where Does Each Process Occur?

| Stage | Process Description | Layer / Execution Environment | Exact File & Function |
|---|---|---|---|
| **1** | **Upload Resume (Applicant)** | Client Tier (Browser) | [`frontend/src/routes/_landing/jobs.$jobId.tsx`](file:///c:/Users/Windows%2010%20Lite/Downloads/MUNJOR/4TH%20YR/DEV/LATEST%20CLONE/v9/2nd-repo-for-hrms-backend-/frontend/src/routes/_landing/jobs.$jobId.tsx) |
| **2** | **Upload Resume (Admin Auto-Fill)** | Client Tier (Browser) | [`frontend/src/components/modules/ApplicantManagement.tsx`](file:///c:/Users/Windows%2010%20Lite/Downloads/MUNJOR/4TH%20YR/DEV/LATEST%20CLONE/v9/2nd-repo-for-hrms-backend-/frontend/src/components/modules/ApplicantManagement.tsx) (`AddApplicantModal`) |
| **3** | **API Ingestion & File Storage** | Application Tier (Laravel 12) | [`backend-laravel/Modules/ApplicantManagement/app/Http/Controllers/ApplicantManagementController.php`](file:///c:/Users/Windows%2010%20Lite/Downloads/MUNJOR/4TH%20YR/DEV/LATEST%20CLONE/v9/2nd-repo-for-hrms-backend-/backend-laravel/Modules/ApplicantManagement/app/Http/Controllers/ApplicantManagementController.php) (`store()`) |
| **4** | **Screening Orchestration** | Application Tier (Laravel 12) | [`backend-laravel/Modules/ApplicantManagement/app/Services/ScreeningService.php`](file:///c:/Users/Windows%2010%20Lite/Downloads/MUNJOR/4TH%20YR/DEV/LATEST%20CLONE/v9/2nd-repo-for-hrms-backend-/backend-laravel/Modules/ApplicantManagement/app/Services/ScreeningService.php) (`screenApplicant()`) |
| **5** | **HTTP Microservice Call** | Application Tier (Laravel 12) | [`backend-laravel/app/Services/NlpService.php`](file:///c:/Users/Windows%2010%20Lite/Downloads/MUNJOR/4TH%20YR/DEV/LATEST%20CLONE/v9/2nd-repo-for-hrms-backend-/backend-laravel/app/Services/NlpService.php) (`screenResumeStructured()`) |
| **6** | **FastAPI Endpoint Handler** | AI / NLP Tier (Python FastAPI) | [`nlp-service/app/main.py`](file:///c:/Users/Windows%2010%20Lite/Downloads/MUNJOR/4TH%20YR/DEV/LATEST%20CLONE/v9/2nd-repo-for-hrms-backend-/nlp-service/app/main.py) (`screening_score()`) |
| **7** | **Multi-Format Extraction & OCR** | AI / NLP Tier (Python) | [`nlp-service/app/services/text_extraction.py`](file:///c:/Users/Windows%2010%20Lite/Downloads/MUNJOR/4TH%20YR/DEV/LATEST%20CLONE/v9/2nd-repo-for-hrms-backend-/nlp-service/app/services/text_extraction.py) (`extract_text()`) |
| **8** | **Text Cleaning & OCR Repair** | AI / NLP Tier (Python) | [`nlp-service/app/services/preprocessing.py`](file:///c:/Users/Windows%2010%20Lite/Downloads/MUNJOR/4TH%20YR/DEV/LATEST%20CLONE/v9/2nd-repo-for-hrms-backend-/nlp-service/app/services/preprocessing.py) (`preprocess()`) |
| **9** | **Section Boundary Detection** | AI / NLP Tier (Python) | [`nlp-service/app/services/section_detection.py`](file:///c:/Users/Windows%2010%20Lite/Downloads/MUNJOR/4TH%20YR/DEV/LATEST%20CLONE/v9/2nd-repo-for-hrms-backend-/nlp-service/app/services/section_detection.py) (`detect_sections()`) |
| **10** | **Custom spaCy NER Extraction** | AI / NLP Tier (Python / spaCy) | [`nlp-service/app/services/entity_extraction.py`](file:///c:/Users/Windows%2010%20Lite/Downloads/MUNJOR/4TH%20YR/DEV/LATEST%20CLONE/v9/2nd-repo-for-hrms-backend-/nlp-service/app/services/entity_extraction.py) (`extract()`) |
| **11** | **Taxonomy & Canonicalization** | AI / NLP Tier (Python) | [`nlp-service/app/services/reference_data.py`](file:///c:/Users/Windows%2010%20Lite/Downloads/MUNJOR/4TH%20YR/DEV/LATEST%20CLONE/v9/2nd-repo-for-hrms-backend-/nlp-service/app/services/reference_data.py) (`canonicalize()`) |
| **12** | **Profile Building & Format Validation** | AI / NLP Tier (Python) | [`nlp-service/app/services/profile_builder.py`](file:///c:/Users/Windows%2010%20Lite/Downloads/MUNJOR/4TH%20YR/DEV/LATEST%20CLONE/v9/2nd-repo-for-hrms-backend-/nlp-service/app/services/profile_builder.py) (`build_profile()`) |
| **13** | **7-Point Credential Verification** | AI / NLP Tier (Python) | [`nlp-service/app/services/credential_verification.py`](file:///c:/Users/Windows%2010%20Lite/Downloads/MUNJOR/4TH%20YR/DEV/LATEST%20CLONE/v9/2nd-repo-for-hrms-backend-/nlp-service/app/services/credential_verification.py) (`verify_credentials()`) |
| **14** | **Scoring & Classification** | AI / NLP Tier (Python) | [`nlp-service/app/services/matching.py`](file:///c:/Users/Windows%2010%20Lite/Downloads/MUNJOR/4TH%20YR/DEV/LATEST%20CLONE/v9/2nd-repo-for-hrms-backend-/nlp-service/app/services/matching.py) & [`nlp-service/app/services/screening.py`](file:///c:/Users/Windows%2010%20Lite/Downloads/MUNJOR/4TH%20YR/DEV/LATEST%20CLONE/v9/2nd-repo-for-hrms-backend-/nlp-service/app/services/screening.py) |
| **15** | **Database Storage & Audit Logging** | Database Tier (MySQL) | [`backend-laravel/Modules/ApplicantManagement/app/Services/ScreeningService.php`](file:///c:/Users/Windows%2010%20Lite/Downloads/MUNJOR/4TH%20YR/DEV/LATEST%20CLONE/v9/2nd-repo-for-hrms-backend-/backend-laravel/Modules/ApplicantManagement/app/Services/ScreeningService.php) (`persistScreening()`) |
| **16** | **Score Card & Radar UI Display** | Client Tier (Browser) | [`frontend/src/components/modules/ApplicantManagement.tsx`](file:///c:/Users/Windows%2010%20Lite/Downloads/MUNJOR/4TH%20YR/DEV/LATEST%20CLONE/v9/2nd-repo-for-hrms-backend-/frontend/src/components/modules/ApplicantManagement.tsx) (`ApplicantDetailModal`) |

---

---

## 3. Resume Processing & Extraction Flow

```
1. RESUME INGESTION (PDF / DOCX / Scanned Image)
   │
   ▼
2. MULTI-FORMAT EXTRACTION & OCR RECOVERY
   ├── pypdfium2 + pdfplumber layout scoring (protects 2-column formats)
   └── Tesseract OCR fallback with contrast enhancement & deskewing
   │
   ▼
3. OCR REPAIR & TEXT NORMALIZATION
   ├── Local-part line join repair (dan\niel -> daniel)
   ├── Email symbol restoration ((at) -> @) and typo correction (gmai1 -> gmail)
   └── Philippine mobile extraction (09XX / +639XX)
   │
   ▼
4. SECTION RECOGNITION
   ├── Education, Experience, Skills, Certifications, Summary, Contact
   └── Fuzzy header matching (handles OCR errors like "PROFESIONAL SUMARY")
   │
   ▼
5. NAMED ENTITY RECOGNITION (NER)
   ├── PERSON: Applicant full name
   ├── EDUCATION: Academic attainments (BSHM, TESDA, High School)
   ├── JOB_TITLE: Hospitality roles (Receptionist, Chef, Bartender)
   ├── SKILL: Technical and service skills (Opera PMS, HACCP, Food Safety)
   └── CERTIFICATION: Credentials (TESDA NC II, Health Card, PRC)
   │
   ▼
6. REFERENCE CANONICALIZATION & DICTIONARY LOOKUP
   ├── Exact match, substring containment, token-set matching
   └── RECOGNIZED vs UNRECOGNIZED (unrecognized items are flagged, NEVER auto-rejected)
   │
   ▼
7. 7-POINT CREDENTIAL VERIFICATION
   ├── Overlapping full-time jobs (> 3 months)
   ├── Future dates in employment history
   ├── Experience exceeding years since graduation
   ├── Executive titles claimed with minimal career experience
   ├── Excessive job changes in a short duration
   ├── Licensure without mandatory degree prerequisites (e.g., CPA/PRC)
   └── Inverted chronological date spans
   │
   ▼
8. MULTI-CRITERIA SCORING & CLASSIFICATION
   ├── 40% Skills + 30% Experience + 20% Education + 10% Certifications
   ├── RANKING SCORE = Resume Match Score × 85% + Document Verification Score × 15%
   │   (VERIFIED = 100, UNABLE_TO_VERIFY = 50, DISCREPANCY_FOUND = 0;
   │    no documents = resume-only score, unchanged)
   └── Official Classifications:
       • PERFECT_FOR_THE_JOB (Fit for position, ranking score >= 75%)
       • INVALID_CREDENTIAL (Format/verification concern, OR a supporting document
         contradicts a resume claim)
       • FIT_FOR_OTHER_JOB (Qualified for alternative active vacancy, same ranking score)
       • NOT_FITTED_TO_JOB (Did not qualify)
```

---

## 4. Key Applicant Management Features

### 4.1. Auto-Fill Resume Parser (Add Applicant Wizard)
When HR manually registers a candidate or receives a walk-in application:
- Uploading the resume invokes `POST /extract-resume`.
- The parser extracts full name, email, mobile number, home address, educational background, and skills in under 2 seconds.
- The applicant form fields are automatically populated, eliminating repetitive manual data entry.

### 4.2. Role-Specific Screening Setup (HR Configurable)
HR managers have full control over the screening criteria per vacancy:
- **Component Weights**: Adjust the 100-point formula (Skills, Experience, Education, Certifications).
- **Passing Threshold**: Configure passing scores (e.g., 75% for rank-and-file, 85% for supervisors).
- **Skill Reference Manager**: Add custom hospitality skills, aliases, and certification synonyms directly through the web UI without modifying code.

### 4.3. Alternative Job Recommendation (`FIT_FOR_OTHER_JOB`)
When an applicant applies for a role where they fail minimum requirements (e.g., applying for *Restaurant Manager* with only 1 year experience), the NLP engine automatically scores their profile against **all other currently active job vacancies**. If the candidate qualifies for another position (e.g., *Food & Beverage Attendant*), the system marks them as `Fit for Other Job` and provides a one-click re-assignment option for HR.

### 4.4. Resume Screening + Supporting-Document Verification = Candidate Ranking
The resume profile is also verified against its own paper proof: each uploaded COE, Certificate or Credential is compared field-by-field (employer, job title, employment dates, degree, institution, certification, issuer) with the resume claims, and those verdicts are blended into the same percentage HR ranks by:

- **Ranking score** = resume match score × 85% + documents score × 15%, where a document earns 100 when `VERIFIED`, 50 when `UNABLE_TO_VERIFY` and 0 when `DISCREPANCY_FOUND`. Applicants who uploaded nothing keep their resume-only score — the blend never silently penalises them.
- **Official status** — a document that contradicts the resume flags the candidate as `Invalid credential` for manual review (the mismatched field names are quoted), while fully verified documents keep `Perfect for the Job`.
- **Live recompute** — uploading, re-verifying or deleting a document automatically re-runs the classification against the stored screening profile (`POST /applicants/{id}/screening/recompute` exposes a manual refresh), so Candidate Ranking, the Top 5 list, the applicant table and the review dialog always show the same verified percentage and status.
- **Transparent breakdown** — the review dialog shows *Resume score → Documents score → Ranking score*, with the verified / discrepancy / unable counts and the applied points.

### 4.5. Structured Interview & Assessment Lifecycle
- Schedule multi-round interviews: Initial, Technical, Panel, and Final interviews.
- Manage interview venues (on-site meeting rooms or remote meeting links).
- Integrated evaluation scorecards recording ratings across technical knowledge, communication, appearance, and hotel culture fit.
- Seamless one-click promotion of accepted candidates into the **New Hire Onboarding** module.

---

## 5. Related Documentation Links

- Detailed NLP technical architecture, mathematical formulas, and API contracts:  
  [NLP Feature Documentation](file:///c:/Users/Windows%2010%20Lite/Downloads/MUNJOR/4TH%20YR/DEV/LATEST%20CLONE/v9/2nd-repo-for-hrms-backend-/docs/NLP_FEATURE_DOCUMENTATION.md)
- Complete System-Wide Architecture & Microservice Topology:  
  [System Documentation](file:///c:/Users/Windows%2010%20Lite/Downloads/MUNJOR/4TH%20YR/DEV/LATEST%20CLONE/v9/2nd-repo-for-hrms-backend-/docs/SYSTEM_DOCUMENTATION.md)
