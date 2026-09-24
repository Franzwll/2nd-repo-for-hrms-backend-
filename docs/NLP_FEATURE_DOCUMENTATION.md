# Oxford Suites Makati HRMS — Natural Language Processing (NLP) Feature Documentation

> **Academic & Industry Project Reference:**  
> *"Design and Development of Recruitment Management in Hotels and Restaurants using spaCy-based Natural Language Processing (NLP) for Roles - Specific with a Feature of Applicant Screening using Named Entity Recognition (NER)"*  
> **Client / Industry Partner:** Oxford Suites Makati, Makati City, Metro Manila, Philippines  
> **Target Subsystem:** Recruitment & Onboarding — Applicant Management & AI Screening Module  

---

## 1. Executive Overview

The **NLP Screening Feature** is an automated, role-specific recruitment intelligence engine embedded within the Oxford Suites Makati Human Resource Management System (HRMS). It transforms unstructured, diverse candidate resumes (PDFs, Word documents, scanned images) into structured applicant profiles, cross-references candidate credentials against job requirements, verifies internal data coherence, and computes objective, explainable match scores.

### Why NLP in Hotel & Restaurant Recruitment?
Hospitality recruitment suffers from three distinct challenges:
1. **High Volume & High Turnover**: Hotels receive hundreds of applications for service, kitchen, housekeeping, and front-office roles.
2. **Format Diversity**: Resumes range from polished digital PDFs to phone camera snapshots of printed bio-data sheets.
3. **Domain-Specific Credentials**: Hospitality roles demand localized qualifications (e.g., TESDA National Certificates like *NC II in Bread & Pastry Production*, *Food Safety / HACCP*, local food handlers' health cards, and PRC licenses) that generic resume parsers consistently fail to recognize.

The system solves these challenges by combining **Optical Character Recognition (OCR)**, **spaCy-based Named Entity Recognition (NER)**, **rule-based semantic section detection**, **7-point automated credential verification**, and an **explainable 100-point multi-criteria scoring algorithm**.

---

## 2. High-Level Architecture & Communication Topology

The NLP feature operates as a dedicated microservice within a 3-tier distributed architecture:

```
┌────────────────────────────────────────────────────────────────────────┐
│                              CLIENT TIER                               │
│                    React 19 + TanStack Start Frontend                  │
│   • Public Careers Portal: Resume upload & AI inquiry chatbot          │
│   • HR Admin Portal: Screening dashboard, score breakdown & badges     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / JSON REST
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                            APPLICATION TIER                            │
│                  Laravel 12 REST API Gateway (PHP 8.2+)                │
│   • Modules/ApplicantManagement: Applicant lifecycle & status state    │
│   • App\Services\NlpService: HTTP Client communication with Python     │
│   • ScreeningReferenceController: Dynamic DB skills & alias mappings   │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
    Multipart / JSON│                                │ Eloquent ORM
       Over HTTP    ▼                                ▼
┌───────────────────────────────┐  ┌────────────────────────────────────┐
│      AI / NLP MICROSERVICE    │  │           DATABASE TIER            │
│   Python FastAPI + Uvicorn    │  │       MySQL (hotel_hr schema)      │
│  • Dual-Engine Text Extraction│  │ • applicant_screenings             │
│  • Custom spaCy NER Pipeline  │  │ • applicant_screening_scores       │
│  • Credential Verification    │  │ • applicant_screening_entities     │
│  • Role-Specific Fit Scoring  │  │ • screening_reference_data         │
└───────────────────────────────┘  └────────────────────────────────────┘
```

### Architectural Rationale
- **Single Authentication Boundary**: The frontend never communicates directly with the Python service. All requests pass through Laravel Sanctum, ensuring authenticated, authorized HR access and centralized audit logging.
- **Resource Isolation**: Compute-intensive OCR and tokenization workloads in Python do not block web request handling in PHP/Laravel.
- **Stateless Microservice**: The Python NLP service retains no database state. Job criteria and reference dictionaries are passed dynamically per request, allowing dynamic configuration from the HR admin portal.

---

## 2.1. Execution Map: Where Does Each Process Occur?

The table below maps every functional process to its exact **execution environment (tier)**, **source file path**, and **primary function or class**:

| # | Process / Sub-Process | Execution Layer / Tier | Exact Source File & Component | Trigger / Input | Primary Output / Persistence |
|---|---|---|---|---|---|
| **1** | **Resume Submission (Candidate)** | **Client Tier** (Browser) | [`frontend/src/routes/_landing/jobs.$jobId.tsx`](file:///c:/Users/Windows%2010%20Lite/Downloads/MUNJOR/4TH%20YR/DEV/LATEST%20CLONE/v9/2nd-repo-for-hrms-backend-/frontend/src/routes/_landing/jobs.$jobId.tsx) | Candidate uploads PDF/DOCX/image on Careers page | Multipart HTTP POST payload to Laravel API |
| **2** | **Manual Resume Upload / Auto-fill** | **Client Tier** (Browser) | [`frontend/src/components/modules/ApplicantManagement.tsx`](file:///c:/Users/Windows%2010%20Lite/Downloads/MUNJOR/4TH%20YR/DEV/LATEST%20CLONE/v9/2nd-repo-for-hrms-backend-/frontend/src/components/modules/ApplicantManagement.tsx) (`AddApplicantModal`) | HR uploads walk-in resume file | Triggers `POST /api/v1/applicants/extract-resume` to auto-fill form fields |
| **3** | **API Ingestion & Auth Gateway** | **Application Tier** (Laravel 12) | [`backend-laravel/Modules/ApplicantManagement/app/Http/Controllers/ApplicantManagementController.php`](file:///c:/Users/Windows%2010%20Lite/Downloads/MUNJOR/4TH%20YR/DEV/LATEST%20CLONE/v9/2nd-repo-for-hrms-backend-/backend-laravel/Modules/ApplicantManagement/app/Http/Controllers/ApplicantManagementController.php) | Inbound HTTP request from frontend | Validates file size/mimetypes, stores file in `storage/app/public/resumes` |
| **4** | **Screening Orchestration** | **Application Tier** (Laravel 12) | [`backend-laravel/Modules/ApplicantManagement/app/Services/ScreeningService.php`](file:///c:/Users/Windows%2010%20Lite/Downloads/MUNJOR/4TH%20YR/DEV/LATEST%20CLONE/v9/2nd-repo-for-hrms-backend-/backend-laravel/Modules/ApplicantManagement/app/Services/ScreeningService.php) (`screenApplicant()`) | Invoked on new application or manual HR "Screen" button | Assembles job criteria, active open jobs, and DB reference aliases |
| **5** | **HTTP Microservice Bridge** | **Application Tier** (Laravel 12) | [`backend-laravel/app/Services/NlpService.php`](file:///c:/Users/Windows%2010%20Lite/Downloads/MUNJOR/4TH%20YR/DEV/LATEST%20CLONE/v9/2nd-repo-for-hrms-backend-/backend-laravel/app/Services/NlpService.php) (`screenResumeStructured()`) | `ScreeningService` calls `NlpService` | Multipart POST over HTTP to Python FastAPI service (`http://127.0.0.1:8001/screening/score`) |
| **6** | **FastAPI Ingestion & Routing** | **AI / NLP Tier** (FastAPI) | [`nlp-service/app/main.py`](file:///c:/Users/Windows%2010%20Lite/Downloads/MUNJOR/4TH%20YR/DEV/LATEST%20CLONE/v9/2nd-repo-for-hrms-backend-/nlp-service/app/main.py) (`screening_score()`) | Inbound HTTP request from Laravel | Creates temporary file, unpacks JSON requirements & settings |
| **7** | **End-to-End NLP Orchestration** | **AI / NLP Tier** (Python) | [`nlp-service/app/services/pipeline.py`](file:///c:/Users/Windows%2010%20Lite/Downloads/MUNJOR/4TH%20YR/DEV/LATEST%20CLONE/v9/2nd-repo-for-hrms-backend-/nlp-service/app/services/pipeline.py) (`analyze_resume_file()`) | Main endpoint calls pipeline | Sequentially invokes stages 8 through 15 |
| **8** | **Multi-Format Extraction & OCR** | **AI / NLP Tier** (Python) | [`nlp-service/app/services/text_extraction.py`](file:///c:/Users/Windows%2010%20Lite/Downloads/MUNJOR/4TH%20YR/DEV/LATEST%20CLONE/v9/2nd-repo-for-hrms-backend-/nlp-service/app/services/text_extraction.py) (`extract_pdf()`, `_pdf_ocr_fallback()`) | Temporary resume file path | Raw text + extraction metadata (`method`, `warnings`, `pages`) |
| **9** | **Text Cleaning & OCR Repair** | **AI / NLP Tier** (Python) | [`nlp-service/app/services/preprocessing.py`](file:///c:/Users/Windows%2010%20Lite/Downloads/MUNJOR/4TH%20YR/DEV/LATEST%20CLONE/v9/2nd-repo-for-hrms-backend-/nlp-service/app/services/preprocessing.py) (`preprocess()`) | Extracted raw text | Sanitized text with OCR typo corrections (e.g., `gmai1` $\rightarrow$ `gmail`, `(at)` $\rightarrow$ `@`) |
| **10** | **Section Boundary Detection** | **AI / NLP Tier** (Python) | [`nlp-service/app/services/section_detection.py`](file:///c:/Users/Windows%2010%20Lite/Downloads/MUNJOR/4TH%20YR/DEV/LATEST%20CLONE/v9/2nd-repo-for-hrms-backend-/nlp-service/app/services/section_detection.py) (`detect_sections()`) | Cleaned resume text | Character offset spans mapping `education`, `experience`, `skills`, `certifications`, `contact` |
| **11** | **Entity Extraction & Custom spaCy NER** | **AI / NLP Tier** (Python / spaCy) | [`nlp-service/app/services/entity_extraction.py`](file:///c:/Users/Windows%2010%20Lite/Downloads/MUNJOR/4TH%20YR/DEV/LATEST%20CLONE/v9/2nd-repo-for-hrms-backend-/nlp-service/app/services/entity_extraction.py) (`extract()`) | Preprocessed text + section map | Extracted raw entities (`PERSON`, `JOB_TITLE`, `SKILL`, `CERTIFICATION`, `EDUCATION`, contact info) |
| **12** | **Taxonomy Canonicalization** | **AI / NLP Tier** (Python) | [`nlp-service/app/services/reference_data.py`](file:///c:/Users/Windows%2010%20Lite/Downloads/MUNJOR/4TH%20YR/DEV/LATEST%20CLONE/v9/2nd-repo-for-hrms-backend-/nlp-service/app/services/reference_data.py) (`canonicalize()`, `classify_items()`) | Extracted skill/role tokens + reference data | Resolves items to canonical entities; tags `RECOGNIZED` vs `UNRECOGNIZED` |
| **13** | **Applicant Profile Assembly** | **AI / NLP Tier** (Python) | [`nlp-service/app/services/profile_builder.py`](file:///c:/Users/Windows%2010%20Lite/Downloads/MUNJOR/4TH%20YR/DEV/LATEST%20CLONE/v9/2nd-repo-for-hrms-backend-/nlp-service/app/services/profile_builder.py) (`build_profile()`, `validate()`) | Extracted entities & classified terms | Standardized candidate profile dictionary + validation flags (`missing_information`, `invalid_format`) |
| **14** | **7-Point Credential Verification** | **AI / NLP Tier** (Python) | [`nlp-service/app/services/credential_verification.py`](file:///c:/Users/Windows%2010%20Lite/Downloads/MUNJOR/4TH%20YR/DEV/LATEST%20CLONE/v9/2nd-repo-for-hrms-backend-/nlp-service/app/services/credential_verification.py) (`verify_credentials()`) | Standardized profile & work history | Consistency audit results: flags, warnings, score penalties, escalation trigger |
| **15** | **Multi-Criteria Scoring & Classification** | **AI / NLP Tier** (Python) | [`nlp-service/app/services/matching.py`](file:///c:/Users/Windows%2010%20Lite/Downloads/MUNJOR/4TH%20YR/DEV/LATEST%20CLONE/v9/2nd-repo-for-hrms-backend-/nlp-service/app/services/matching.py) & [`nlp-service/app/services/screening.py`](file:///c:/Users/Windows%2010%20Lite/Downloads/MUNJOR/4TH%20YR/DEV/LATEST%20CLONE/v9/2nd-repo-for-hrms-backend-/nlp-service/app/services/screening.py) | Profile vs Job requirements + Open jobs list | Match score (0-100), 4-part breakdown, official status, alternative job recommendation, explanation reasons |
| **16** | **Result Persistence & DB Storage** | **Database Tier** (MySQL via Laravel) | [`backend-laravel/Modules/ApplicantManagement/app/Services/ScreeningService.php`](file:///c:/Users/Windows%2010%20Lite/Downloads/MUNJOR/4TH%20YR/DEV/LATEST%20CLONE/v9/2nd-repo-for-hrms-backend-/backend-laravel/Modules/ApplicantManagement/app/Services/ScreeningService.php) (`persistScreening()`) | Python JSON response received by Laravel | Writes to `applicant_screenings`, `applicant_screening_scores`, `applicant_screening_entities`, and updates `applicants.status` |
| **17** | **Interactive UI Presentation** | **Client Tier** (Browser) | [`frontend/src/components/modules/ApplicantManagement.tsx`](file:///c:/Users/Windows%2010%20Lite/Downloads/MUNJOR/4TH%20YR/DEV/LATEST%20CLONE/v9/2nd-repo-for-hrms-backend-/frontend/src/components/modules/ApplicantManagement.tsx) (`ApplicantDetailModal`, `RadarChart`, `ScoreBadge`) | Reads data via `GET /api/v1/applicants/{id}` | Renders match badge, radar breakdown, timeline flags, and alternative job suggestion |
| **18** | **AI Careers Inquiries (Chatbot)** | **Application Tier** (Laravel 12) | [`backend-laravel/app/Services/ChatbotEngine.php`](file:///c:/Users/Windows%2010%20Lite/Downloads/MUNJOR/4TH%20YR/DEV/LATEST%20CLONE/v9/2nd-repo-for-hrms-backend-/backend-laravel/app/Services/ChatbotEngine.php) & [`frontend/src/components/public/Chatbot.tsx`](file:///c:/Users/Windows%2010%20Lite/Downloads/MUNJOR/4TH%20YR/DEV/LATEST%20CLONE/v9/2nd-repo-for-hrms-backend-/frontend/src/components/public/Chatbot.tsx) | Candidate sends message in floating widget | Intent recognition & FAQ retrieval; fallback logs to `chatbot_unanswered` |

---

## 3. End-to-End Processing Pipeline

When a candidate uploads a resume or HR triggers automated screening, the document passes through an 8-stage pipeline:

```
[Resume Upload: PDF / DOCX / Image]
               │
               ▼
   [Stage 1: Multi-Format Extraction] ──────► [pdfplumber + pypdfium2 / Tesseract OCR]
               │
               ▼
   [Stage 2: Cleaning & OCR Repair]   ──────► [Heuristic email/phone/typo repair]
               │
               ▼
   [Stage 3: Section Detection]       ──────► [Rule-based + fuzzy section segmentation]
               │
               ▼
   [Stage 4: Named Entity Recognition]──────► [spaCy Custom NER: PERSON, SKILL, etc.]
               │
               ▼
   [Stage 5: Profile Normalization]   ──────► [Alias mapping & RECOGNIZED classification]
               │
               ▼
   [Stage 6: Credential Verification] ──────► [7-point timeline & consistency checks]
               │
               ▼
   [Stage 7: Multi-Criteria Scoring]  ──────► [Weighted matching: Skills 40, Exp 30, Edu 20, Certs 10]
               │
               ▼
   [Stage 8: Decision Classification] ──────► [PERFECT, INVALID_CREDENTIAL, FIT_OTHER, NOT_FITTED]
```

---

## 4. Detailed Component Breakdown

### 4.1. Multi-Format Text Extraction (`text_extraction.py`)

The extraction engine handles both clean digital documents and degraded image scans:

| Format | Primary Engine | Fallback / Enhancement Engine | Features |
|---|---|---|---|
| **Digital PDF** | `pypdfium2` (TextPage API) | `pdfplumber` | Employs heuristic layout quality scoring (`_structure_score`). Preserves 2-column sidebar layouts (contact info vs. experience) without interleaving lines. |
| **Scanned PDF** | Page rasterization (2.0x zoom) | `pytesseract` (Tesseract OCR) | Detects zero-text PDFs, rasterizes pages into high-res images, and extracts text using OCR. |
| **Images (PNG/JPG)** | `pytesseract` | OpenCV / Pillow preprocessing | CLAHE contrast enhancement, deskewing, and Gaussian blur mitigation for mobile camera uploads. |
| **Word DOCX** | `python-docx` | XML paragraph/table walker | Parses headings, body paragraphs, and structured table cells in order. |
| **Plain Text** | Native UTF-8 decode | Latin-1 / ASCII fallback | Strips null bytes and abnormal control codes. |

```python
# Layout scoring heuristic in text_extraction.py:
def _structure_score(text: str) -> int:
    # Favors date ranges, email anchors, and line structure;
    # Penalizes merged lines (>150 chars) typical of broken column extraction.
```

---

### 4.2. OCR Preprocessing & Heuristic Repair (`preprocessing.py` & `entity_extraction.py`)

Scanned resumes frequently suffer from OCR misreads. The preprocessing engine automatically cleans common OCR artifacts:

- **Email Obfuscation & Character Split Repair**:
  - Converts `(at)`, `[at]`, `{at}`, ` at ` into `@`.
  - Joins newline breaks in local-parts: `dan\niel.cruz@gmail.com` $\rightarrow$ `daniel.cruz@gmail.com`.
  - Repairs domain typos: `gmai1`, `gmial`, `gnail` $\rightarrow$ `gmail`; `yah00` $\rightarrow$ `yahoo`; `.c0m`, `.corn` $\rightarrow$ `.com`.
- **Philippine Phone Normalization**:
  - Regular expressions parse national formats: `+63 9XX XXX XXXX`, `09XX-XXX-XXXX`, and Metro Manila landlines `(02) 8XXX-XXXX loc. 123`.
- **Mixed Contact Line Disentanglement**:
  - Extracts street address, email, phone, and LinkedIn URL even when concatenated on a single line by OCR.

---

### 4.3. Resume Section Segmentation (`section_detection.py`)

Rather than scanning the resume as one flat string, the system detects logical section boundaries so downstream extractors apply section-aware heuristics:

1. **Education**: `Educational Background`, `Tertiary Education`, `Scholastic Records`
2. **Experience**: `Work History`, `Professional Experience`, `Hotel & Hospitality Record`
3. **Skills**: `Core Competencies`, `Technical Skills`, `Areas of Expertise`
4. **Certifications**: `Licenses & Certifications`, `Trainings & Seminars Attended`
5. **Summary / Objective**: `Career Profile`, `Professional Summary`, `About Me`
6. **Contact Information**: `Personal Data`, `Get In Touch`
7. **Additional**: `Character References`, `Affiliations`, `Languages Spoken`

**Fuzzy Header Recovery**: Tolerates OCR noise (e.g., `PROFESIONAL SUMARY` or `WORK EXPRINCE`) using string distance matching ($\text{cutoff} \ge 0.72$).

---

### 4.4. Named Entity Recognition (NER) Architecture (`entity_extraction.py`)

The entity extraction layer combines four complementary techniques:
1. **Regular Expressions**: Phone numbers, emails, date intervals (`YYYY-YYYY`, `Month YYYY - Present`).
2. **Section Context Rules**: Extracts competencies directly bounded by the detected `Skills` section.
3. **spaCy Base Model (`en_core_web_sm`)**: General linguistic tokens, sentence boundaries, and standard named entities (`PERSON`, `ORG`).
4. **Custom Fine-Tuned Model (`models_spacy/role_specific_ner`)**: Specialized transition-based parser trained on hospitality resumes.

#### Custom NER Entity Labels

| Label | Definition | Hospitality Examples | Non-Entity Exclusions |
|---|---|---|---|
| `PERSON` | Full applicant name | "JUAN DELA CRUZ", "MARIA SANTOS" | Character references, hotel managers |
| `EDUCATION` | Academic program or attainment | "BS Hospitality Management", "TESDA Cookery Course", "High School Graduate" | School names ("UST"), graduation years |
| `JOB_TITLE` | Industry role or position | "Front Desk Receptionist", "Commis Chef", "Bartender", "Executive Housekeeper" | Department names, employment types |
| `SKILL` | Professional or technical competency | "Opera PMS", "Espresso Brewing", "HACCP Guidelines", "Table Setting", "Inventory Audit" | General soft words ("hardworking") |
| `CERTIFICATION` | Official credential or license | "TESDA Cookery NC II", "Food Handler Health Certificate", "PRC Registered Nurse" | General seminars without certification |

---

### 4.5. Reference Normalization & Canonicalization (`reference_data.py`)

Hospitality terms vary widely across applicants (e.g., *"F&B Service"*, *"Food and Beverage Attendant"*, *"Waiter"*, *"Dining Crew"*). The canonicalization engine maps variants into standard database concepts:

```
Raw Extracted Text: "knowledgeable in point of sale micros systems"
   │
   ├── 1. Exact Match Check (case-insensitive)
   ├── 2. Substring Boundary Match
   ├── 3. Token-Set Permutation Match
   └── 4. Fuzzy SequenceMatcher (similarity >= 0.82)
   │
   ▼
Canonical Database Entity: "POS Systems" (RECOGNIZED)
```

#### The "No Silent Dropping" Rule
If an applicant lists a valid skill or role not yet present in the hotel's database dictionary, it is classified as `UNRECOGNIZED`. 
- **Critical Policy**: `UNRECOGNIZED` items are **NEVER discarded or penalized**.
- They are highlighted in orange badges on the HR applicant dossier for manual review.
- HR admins can click **"Promote to Canonical"** from the portal, instantly adding the term and its aliases into `screening_reference_data` without code deployment.

---

### 4.6. Automated Credential Verification Engine (`credential_verification.py`)

To protect the hotel against resume padding, falsified credentials, or contradictory timelines, the engine runs **7 automated cross-validation checks**:

```
                                ┌────────────────────────────────────────────────────────┐
                                │          7 AUTOMATED VERIFICATION CHECKS              │
                                └──────────────────────────┬─────────────────────────────┘
                                                           │
        ┌───────────────────┬───────────────────┬──────────┴────────┬───────────────────┬───────────────────┐
        ▼                   ▼                   ▼                   ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐   ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ 1. Timeline   │   │ 2. Future     │   │ 3. Experience │   │ 4. Seniority  │   │ 5. Job-       │   │ 6. Licensure  │
│    Overlaps   │   │    Dates      │   │    vs. Grad   │   │    Mismatch   │   │    Hopping    │   │    Prereqs    │
│ (> 3 months)  │   │ (> Current Yr)│   │ (Years > Grad)│   │ (Exec vs Exp) │   │ (> 4 in 1 yr) │   │ (PRC/CPA w/o) │
└───────────────┘   └───────────────┘   └───────────────┘   └───────────────┘   └───────────────┘   └───────────────┘
                                                           │
                                                           ▼
                                                ┌─────────────────────┐
                                                │ 7. Chronological    │
                                                │    Incoherence      │
                                                │ (End Date < Start)  │
                                                └─────────────────────┘
```

1. **Timeline Overlaps**: Flags concurrent full-time employment exceeding 3 months (exempting OJT, internships, and part-time jobs).
2. **Future Dates**: Detects work or education start/end dates beyond the current calendar month/year.
3. **Experience vs. Graduation Gap**: Flags candidates claiming 8 years of post-college experience when graduation occurred only 3 years ago.
4. **Seniority vs. Experience Mismatch**: Flags executive titles (*"Director of F&B"*, *"General Manager"*) held with under 3 years of total experience.
5. **Excessive Job-Hopping**: Flags high role velocity ($> 4$ non-contract jobs in a single 12-month span).
6. **Education-Certification Prerequisites**: Flags regulated Philippine professional credentials that mandate a 4-year bachelor's degree:
   - Certified Public Accountant (CPA)
   - Professional Regulation Commission (PRC) Registered Nurse / Engineer
   - Licensed Professional Teacher (LET)
   *If claimed with only high school or vocational education, an alert is raised.*
7. **Chronological Incoherence**: Detects inverted date spans (e.g., `2024 - 2021`).

#### Verification Impact on Screening:
- Each warning incurs a minor penalty ($\mathbf{-5.0\text{ pts}}$ each, up to a maximum of $\mathbf{-15.0\text{ pts}}$).
- If $\mathbf{\ge 3\text{ high-risk warnings}}$ occur, the candidate is automatically classified as `INVALID_CREDENTIAL` for mandatory manual HR review.

---

### 4.7. Role-Specific Fit Scoring Formula (`matching.py`)

Candidate compatibility is evaluated using an explainable 100-point weighted model. The default weights reflect the historical hiring criteria of Oxford Suites Makati:

$$\text{Overall Fit Score} = (S \times 0.40) + (E \times 0.30) + (A \times 0.20) + (C \times 0.10)$$

Where:
- **$S$ = Skills Score (40 pts max)**:
  $$S = 100 \times \left( 0.70 \times \frac{\text{Matched Required Skills}}{\text{Total Required Skills}} + 0.30 \times \frac{\text{Matched Preferred Skills}}{\text{Total Preferred Skills}} \right)$$
  *(Includes exact matches and fuzzy matches with ratio $\ge 0.88$)*
- **$E$ = Experience Score (30 pts max)**:
  $$E = 100 \times \min\left(1.0, \frac{\text{Applicant Total Years}}{\text{Job Required Minimum Years}}\right)$$
- **$A$ = Education Score (20 pts max)**:
  Evaluated against an ordinal 6-tier educational ladder:
  $$\text{Level 1 (High School)} < \text{Level 2 (Vocational / TESDA)} < \text{Level 3 (College Undergrad)} < \text{Level 4 (Bachelor's)} < \text{Level 5 (Master's)} < \text{Level 6 (Doctorate)}$$
  Full points if applicant rank $\ge$ required rank; tiered deductions if below.
- **$C$ = Certifications Score (10 pts max)**:
  $$C = 100 \times \frac{\text{Matched Required Certifications}}{\text{Total Required Certifications}}$$
  *(Defaults to 100% if the job role specifies no mandatory certifications)*

> **HR Configurable**: Through the **Screening Setup Dialog** in the Admin portal, HR managers can adjust these component weights (e.g., increasing Experience to 50% for senior roles) and alter the passing score threshold.

---

### 4.8. Decision Classification Engine (`screening.py`)

The pipeline assigns candidates into one of **four official, mutually exclusive classifications**:

```
                       [Candidate Evaluated]
                                │
          ┌─────────────────────┴─────────────────────┐
          ▼                                           ▼
[Credential Blocker or                           [No Blocker]
 3+ High-Risk Flags?]                                 │
          │                                           ▼
         YES                             [Mandatory Criteria Met AND
          │                               Score >= Passing Threshold?]
          ▼                                           │
  INVALID_CREDENTIAL                     ┌────────────┴────────────┐
("Invalid Credential")                   ▼                         ▼
                                        YES                       NO
                                         │                         │
                                         ▼                         ▼
                                PERFECT_FOR_THE_JOB     [Better Fit for Another
                              ("Perfect for the Job")      Active Hotel Opening?]
                                                                   │
                                                      ┌────────────┴────────────┐
                                                      ▼                         ▼
                                                     YES                       NO
                                                      │                         │
                                                      ▼                         ▼
                                              FIT_FOR_OTHER_JOB         NOT_FITTED_TO_JOB
                                           ("Fit for Other Job")      ("Not Fitted to Job")
```

| Classification | Database Key | Description & Business Action |
|---|---|---|
| **PERFECT_FOR_THE_JOB** | `fit` | Meets all mandatory criteria (education rank, minimum years, required skills coverage $\ge 60\%$) and scores $\ge 75\%$ (or HR-defined threshold). **Action:** Fast-tracked to interview scheduling. |
| **INVALID_CREDENTIAL** | `credential` | Triggered by missing contact essentials, malformed phone/email, unverifiable credentials, or $\ge 3$ timeline incoherence warnings. *Note: Signifies validation concern requiring HR verification; does not accuse applicant of fraud.* |
| **FIT_FOR_OTHER_JOB** | `other-role` | Did not meet criteria for applied position, but when evaluated against all other open vacancies, qualified with $\ge 75\%$ match for an alternative vacancy. **Action:** HR prompted to transfer candidate to alternative opening. |
| **NOT_FITTED_TO_JOB** | `not-fit` | Scored below threshold or missed mandatory requirements with no qualifying alternative position. **Action:** Retained in candidate talent pool. |

---

### 4.9. Supporting-Document Verification Impact on the Ranking Score (`verification_scoring.py`)

Resume screening alone only validates the resume *against the job post*. Supporting-document verification (`document_verification.py`) validates the resume *against its own paper proof* — each uploaded COE, Certificate or Credential is compared field-by-field (employer, job title, employment dates, degree, institution, certification, issuer) with the resume claims. Those two signals are combined so the single percentage HR ranks by — and the official status — express **resume screening + verification of the resume**:

$$\text{Ranking Score} = \underbrace{\text{Resume Match Score}}_{4.7} \times (1 - w) + \text{Documents Score} \times w, \qquad w = 0.15$$

$$\text{Documents Score} = 100 \times \text{mean(credit of decisive documents)}$$

| Document Verdict | Credit | Meaning |
| --- | --- | --- |
| `VERIFIED` | 1.00 | The document corroborates the resume claims. |
| `UNABLE_TO_VERIFY` | 0.50 | The document could not be compared (partial credit, never rejected). |
| `DISCREPANCY_FOUND` | 0.00 | The document contradicts a resume claim. |
| `PENDING` / `PROCESSING` | *excluded* | Verification still running — not counted either way. |
| `Others` (unmappable) | *excluded* | Stored for manual HR review, never scored. |

**Guarantees**

- **No silent penalty**: with no decisive document the blend is a no-op, so an applicant who uploaded nothing keeps exactly the resume-only score.
- **Discrepancy escalation**: any document contradicting a resume claim (`DISCREPANCY_FOUND`) forces the official classification to `INVALID_CREDENTIAL` for manual review, with the mismatched field names (`Employer`, `Job title`, `Start date`, `Degree`, `Certification`, …) quoted in the reasons.
- **Rank consistency**: alternative-job referrals (`FIT_FOR_OTHER_JOB`) are scored with the same blended score, so a recommendation never points at a role the documents contradict.
- **Auditable evidence block**: every screening result carries `resume_match_score` (resume-only) and `document_verification` (`status`, `documents_score`, verified / discrepancy / unable counts, applied `score_penalty`, per-document breakdown and human-readable flags). The UI shows this as *Resume score → Documents score → Ranking score*.
- **Recompute without re-OCR**: the `POST /screening/reclassify` endpoint (section 7.4) replays the stored profile + validation through this classification stage, so uploading, re-verifying or deleting a document refreshes the candidate's percentage, rank order and status instantly.

**Evidence statuses** (reported alongside the score)

| Status | Condition |
| --- | --- |
| `NOT_PROVIDED` | No supporting documents uploaded. |
| `PENDING` | Documents exist but none produced a comparable verdict yet. |
| `VERIFIED` | Every decisive document corroborated the resume. |
| `PARTIAL` | Mixed results (some unverifiable), score still blended. |
| `DISCREPANCY` | At least one document contradicts the resume → `INVALID_CREDENTIAL`. |

---

## 5. Connected NLP Component: AI Careers Chatbot

In addition to resume parsing, the system incorporates an intent-driven **Careers Chatbot** (`backend-laravel/app/Services/ChatbotEngine.php`) deployed on the public landing page.

- **Capabilities**:
  - Responds to applicant queries regarding active hotel vacancies, salary bands, benefits (HMO, duty meals), dress codes, and application requirements.
  - Explains the automated NLP screening process to prospective candidates to ensure hiring transparency.
  - Matches user inquiries against HR-managed FAQs using keyword tokenization, stopword elimination, and string distance ranking.
  - Logs unhandled questions into `chatbot_unanswered` table for HR review and knowledge base enrichment.

---

## 6. Database Persistence Layer

Screening outputs are permanently recorded across four normalized MySQL tables:

```
┌─────────────────────────┐          ┌────────────────────────────────┐
│       applicants        │ 1      1 │      applicant_screenings      │
├─────────────────────────┤──────────├────────────────────────────────┤
│ applicant_id (PK)       │          │ screening_id (PK)              │
│ job_post_id (FK)        │          │ applicant_id (FK)              │
│ first_name, last_name   │          │ job_post_id (FK)               │
│ email, phone            │          │ processing_status (ENUM)       │
│ resume_path             │          │ screening_result (ENUM)        │
│ status ('fit', etc.)    │          │ match_score (DECIMAL 5,2)      │
└─────────────────────────┘          │ score_breakdown_json (JSON)    │
             │ 1                     │ profile_json (LONGTEXT)        │
             │                       │ validation_json (LONGTEXT)     │
             │                       │ reasons_json (LONGTEXT)        │
             │ N                     │ alternative_job_json (LONGTEXT)│
┌────────────┴────────────┐          └────────────────────────────────┘
│applicant_screening_     │
│scores                   │          ┌────────────────────────────────┐
├─────────────────────────┤          │   screening_reference_data     │
│ score_id (PK)           │          ├────────────────────────────────┤
│ applicant_id (FK)       │          │ id (PK)                        │
│ criterion ('skills'...) │          │ category ('skill','role',etc.) │
│ score (DECIMAL 5,2)     │          │ canonical_name (VARCHAR 120)   │
└─────────────────────────┘          │ aliases_json (JSON Array)      │
                                     └────────────────────────────────┘
```

1. `applicant_screenings`: Complete audit record containing the full JSON payload: extracted profile, detected entities, validation flags, scoring breakdown, and human-readable explanation sentences.
2. `applicant_screening_scores`: Component scores (skills, experience, education, certifications) enabling aggregated dashboard analytics and SQL filtering.
3. `applicant_screening_entities`: Normalized entity rows extracted by spaCy (`PERSON`, `JOB_TITLE`, `SKILL`, etc.) linked to the applicant.
4. `screening_reference_data`: Master taxonomy of hotel skills, job titles, and certifications with dynamic alias arrays maintained by HR.

---

## 7. API Reference

### 7.1. Health & Model Diagnostics
```http
GET /health
Host: 127.0.0.1:8001
```
**Response:**
```json
{
  "status": "ok",
  "base_model": "en_core_web_sm",
  "custom_ner_loaded": true,
  "weights": {
    "skills": 0.40,
    "experience": 0.30,
    "education": 0.20,
    "certifications": 0.10
  },
  "thresholds": {
    "perfect": 75.0,
    "alternative_job": 75.0,
    "required_skills_coverage_min": 0.60
  }
}
```

---

### 7.2. Full Resume Screening
```http
POST /screening/score
Host: 127.0.0.1:8001
Content-Type: multipart/form-data
```
**Form Parameters:**
- `file`: Resume file (PDF, DOCX, PNG, JPG).
- `requirements`: JSON string representing job post criteria:
  ```json
  {
    "job_post_id": 12,
    "title": "Front Desk Receptionist",
    "required_skills": ["Opera PMS", "Customer Service", "Front Office Operations"],
    "preferred_skills": ["Foreign Language (Japanese)", "Concierge"],
    "education_level": "Bachelor's Degree",
    "experience_level": "1-2 Years",
    "required_certifications": ["TESDA Front Office Services NC II"]
  }
  ```
- `open_jobs`: *(Optional)* Array of other active job criteria for alternative role matching.
- `reference_data`: *(Optional)* Dynamic skills/roles/certs dictionary loaded from MySQL.
- `screening_settings`: *(Optional)* Custom HR scoring weights and passing score.
- `document_verifications`: *(Optional)* JSON array of the applicant's already-verified supporting documents — `[{applicant_document_id, doc_type, verification_status, verification_result}]`. Their evidence is blended into the ranking score (section 4.9).

**Sample Output Payload:**
```json
{
  "success": true,
  "processing_status": "PROCESSED",
  "screening_status": "PERFECT_FOR_THE_JOB",
  "match_score": 84.78,
  "resume_match_score": 86.5,
  "document_verification": {
    "status": "PARTIAL",
    "weight": 0.15,
    "documents_total": 2,
    "decisive_count": 2,
    "verified_count": 1,
    "discrepancy_count": 0,
    "unable_count": 1,
    "pending_count": 0,
    "ignored_count": 0,
    "documents_score": 75.0,
    "score_penalty": 1.72,
    "escalate_invalid": false,
    "mismatched_fields": [],
    "flags": [
      "COE verified: the document corroborates the resume claims.",
      "Certificate unverifiable: the document could not be compared against the resume claims."
    ]
  },
  "mandatory_requirements_met": true,
  "score_breakdown": {
    "skills": {
      "weight": 0.40,
      "earned": 35.0,
      "max": 40.0,
      "matched_required": ["Customer Service", "Front Office Operations"],
      "fuzzy_matched_required": {"Opera PMS": "Opera Property Management System"},
      "missing_required": [],
      "required_coverage": 1.0
    },
    "experience": {
      "weight": 0.30,
      "earned": 30.0,
      "max": 30.0,
      "estimated_years": 2.5,
      "min_years_required": 1.0,
      "requirement_met": true
    },
    "education": {
      "weight": 0.20,
      "earned": 20.0,
      "max": 20.0,
      "applicant_highest_level": ["BS Hospitality Management"],
      "required_level": "Bachelor's Degree",
      "requirement_met": true
    },
    "certifications": {
      "weight": 0.10,
      "earned": 10.0,
      "max": 10.0,
      "matched": ["TESDA Front Office Services NC II"],
      "missing": []
    }
  },
  "screening_reasons": [
    "Overall match score 84.78% reached the required threshold of 75.0% for Front Desk Receptionist.",
    "Matched required skills: Customer Service, Front Office Operations, Opera PMS.",
    "Education requirement met: True; experience requirement met: True (2.5 yrs vs 1.0 yrs minimum).",
    "Supporting-document verification (1 verified, 1 unverifiable) reduced the score from 86.5% to 84.78% (documents score 75.0% at a 15% weighting)."
  ],
  "validation": {
    "missing_information": [],
    "invalid_format": [],
    "credential_issues": [],
    "credential_verification": {
      "checks_performed": 7,
      "warning_count": 0,
      "flags": [],
      "score_penalty": 0.0,
      "escalate_invalid": false
    }
  }
}
```

---

### 7.3. Auto-Fill Resume Parsing (Add Applicant Wizard)
```http
POST /extract-resume
Host: 127.0.0.1:8001
Content-Type: multipart/form-data
```
A lightweight pass that performs text extraction and NER without computing role match scores. Used by the HR admin portal to automatically populate candidate contact details, previous employers, and competencies upon file upload.

---

### 7.4. Ranking Reclassification With Document Evidence
```http
POST /screening/reclassify
Host: 127.0.0.1:8001
Content-Type: application/json
```
Re-runs **only** the classification stage (section 4.9) against the applicant's stored screening data plus the current supporting-document evidence, so an upload / re-verification / deletion refreshes the ranking percentage, rank order and official status without re-uploading or re-OCR-ing the resume. Laravel calls it from `ScreeningService::recomputeWithDocuments()` (auto-triggered by `DocumentVerificationService`, and exposed to HR through `POST /api/v1/applicants/{applicant}/screening/recompute`).

**Request body:**
```json
{
  "profile": { "...": "applicant_screenings.profile_json" },
  "validation": { "...": "applicant_screenings.validation_json" },
  "requirements": { "job_post_id": 12, "title": "Front Desk Receptionist", "required_skills": ["Customer Service"] },
  "open_jobs": [],
  "document_verifications": [
    { "applicant_document_id": 8, "doc_type": "COE", "verification_status": "VERIFIED", "verification_result": { "checks": {} } }
  ],
  "screening_settings": { "weights": { "skills": 0.4, "experience": 0.3, "education": 0.2, "certifications": 0.1 }, "passing_score": 75 }
}
```

**Response:** the classification subset — `match_score`, `resume_match_score`, `document_verification`, `score_breakdown`, `screening_status`, `screening_reasons`, `alternative_job`, `mandatory_requirements_met`, `mandatory_detail` and `missing_requirements`.

---

## 8. Academic & Capstone Defense Highlights

When presenting or defending this feature before an academic evaluation panel or technical audit, emphasize these key architectural and algorithmic decisions:

1. **Why spaCy + Custom NER rather than Cloud LLMs (e.g., OpenAI / Claude / Gemini)?**
   - **Explainability & Non-Hallucination**: LLMs are black boxes that may generate inconsistent scores for identical resumes. This engine uses deterministic, mathematical component weights with an auditable mathematical breakdown.
   - **Cost & Operational Sovereignty**: Cloud LLM tokens cost significant money at scale. The Python spaCy microservice runs 100% locally on-premise without per-screening API fees.
   - **Data Privacy (Republic Act 10173 - Philippine Data Privacy Act)**: Applicant resumes contain sensitive personal information (full names, contact info, home addresses, government identifiers). Keeping extraction on the local server ensures zero external data leakage.

2. **How does the system handle scanned or low-quality bio-data resumes?**
   - Incorporates a dual-engine OCR pipeline with adaptive image preprocessing (contrast enhancement, deskewing, noise filtering) followed by regex-driven character reconstruction for typical OCR letter swaps.

3. **How are unrecognized skills handled without bias?**
   - In accordance with standard operating procedures, unrecognized skills are never penalized. They are logged and presented to the HR recruiter with visual indicator badges, allowing continuous human-in-the-loop dictionary expansion.

4. **How does the system guard against fabricated resumes?**
   - The automated credential verification engine performs 7 cross-attribute consistency checks (e.g., detecting impossible graduation timelines, inverted dates, and unearned professional licensures) before granting passing status.
