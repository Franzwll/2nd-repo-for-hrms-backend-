# PROTOTYPE / SYSTEM TESTING FORM

**Program:** Bachelor of Science in Information Technology  
**Date:** October 30, 2026  
**Research Adviser:** Vincent Carlo Garados  
**Technical Adviser:** Enrico B. Pineda  
**Research Title:** DESIGN AND DEVELOPMENT OF RECRUITMENT MANAGEMENT IN HOTELS AND RESTAURANTS USING SPACY-BASED NATURAL LANGUAGE PROCESSING (NLP) FOR ROLES - SPECIFIC WITH A FEATURE OF APPLICANT SCREENING USING NAMED ENTITY RECOGNITION (NER)  
**Client / Partner Industry:** Oxford Suites Makati  
**Institution:** Bestlink College of the Philippines – College of Computing Studies  

**Members & Roles:**
- Caibigan, Francis D. (*Project Manager*)
- Espeña, Ferdinand Jr. G. (*System Developer / Lead Programmer*)
- Cordon, Aldrex M. (*Security & Systems Analyst*)
- Ochea, Althea Mia O. (*Quality Assurance Tester*)
- Almeria, James Carl P. (*Technical Documentation Specialist*)

---

## System Test Cases & Results

| Test ID | Feature / Function | Expected Outcome | Actual Outcome | Status | Remarks |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | **Public Careers Portal & Job Application Module** | Prospective applicants can access the public career portal (`/careers`), browse active hotel openings with dynamic filters (department, position, employment type), view job requirements, and submit an application with resume upload (PDF/DOCX). The system must validate inputs, prevent duplicate submissions, store applicant details in MySQL, and immediately dispatch an automated email confirmation to the candidate. | Open job postings are fetched dynamically from the Laravel API (`GET /api/v1/job-posts`) with accurate vacancy counts. The multi-step application modal enforces client and server-side MIME type and size checks. Upon submission, the record persists to the `applicants` table, the resume is safely stored in local disk storage, and an automated acknowledgement email is queued. Real-time applicant counts update across HR admin dashboards without errors. | **PASSED** | Fully verified; prevents duplicate submissions via email and requisition availability guards. |
| **TC-02** | **AI-Powered Resume Screening & Named Entity Recognition (NER)** | Resumes uploaded in PDF, DOCX, or scanned formats must be processed by the stateless Python FastAPI NLP microservice. Optical Character Recognition (Tesseract 5.5 OCR) extracts raw text, while the domain-trained spaCy NER model identifies role-specific entities (`PERSON`, `EDUCATION`, `JOB_TITLE`, `SKILL`, `CERTIFICATION`). The system compares extracted criteria against job post requirements to compute a weighted match score (0–100%) and categorizes candidates into four tiers (`Strong Match`, `Moderate Match`, `Weak Match`, `No Match`). | Resumes are parsed by the Python FastAPI microservice (`POST /api/v1/applicants/screen-resume` on port 8001) within 1.2 to 2.8 seconds. Visual entity highlighting accurately renders over candidate profile cards. The weighted scoring algorithm processes education, hospitality skills, and experience criteria configured under `system_settings`. Computed scores and suitability tiers are saved in `applicant_screenings`, providing transparent qualification metrics to HR recruiters. | **PASSED** | Meets benchmark accuracy; layout-aware text extraction successfully handles single and multi-column formats. |
| **TC-03** | **Applicant Tracking System (ATS) & Multi-Stage Interview Management** | HR staff can track and advance candidates across structured stages (`Screening`, `Interview Scheduled`, `Interview Assessed`, `Assessment Test`, `Practical Test`, `Final Evaluation`, `Offer`, `Hired`, or `Rejected`). Scheduling an interview triggers facility availability validation, conflict checks, assessor assignment, and email notifications to applicants and evaluation committee members. | The recruiter pipeline Kanban and tabular views render live candidate statuses. Advancing to interview (`POST /api/v1/interviews`) triggers automated facility availability validation (`facility_status = Facility Approved`). Assessor scorecards dynamically compute composite scores. Strict business rules enforce progression prerequisites (e.g., passing the interview evaluation before practical testing). Status transitions write to `applicant_status_histories` for end-to-end traceability. | **PASSED** | Stage progression gates prevent skipping mandatory evaluation milestones; calendar and email alerts function seamlessly. |
| **TC-04** | **New Hire Onboarding & Document Checklist Verification** | When an applicant is marked as `Hired`, the system provisions a new hire profile (`new_hires`), automatically generates staff portal login credentials, sends a welcome email with temporary password, and binds required pre-employment checklist items (e.g., SSS, PhilHealth, Pag-IBIG, NBI clearance, Medical certificate) from predefined departmental templates. | Upon confirming hiring (`POST /api/v1/applicants/{id}/hire`), a record is inserted into `new_hires`, an authenticated account is created in `system_users`, and stage-gated pre-employment checklist items populate into `employee_onboarding_items`. HR admins can review, approve, or reject uploaded compliance documents. Upon fulfilling all checklist items, the system marks the candidate as onboarding-complete and ready for probationary regularization. | **PASSED** | Automatic credential generation, welcome email delivery, and template-based checklist attachment operate without data leakage. |
| **TC-05** | **Core Human Capital Management (HCM) & Organizational Structure** | Administrators can manage organizational master records: departments, positions, headcount budgets, and 3NF-normalized standardized salary grades. Employee 201 dossiers maintain demographic data, statutory identification numbers, department/position links, supervisor chains, and employment status history with strict referential integrity. | Department, position, and salary grade CRUD operations execute seamlessly. Headcount validation guards prevent over-hiring beyond approved position budgets. Database foreign keys enforce `RESTRICT` rules to safeguard master structures against orphaned records. Dynamic organizational charts accurately render reporting lines and supervisor hierarchy from active employee records in `employees`. | **PASSED** | 3NF relational normalization strictly maintained across 55 MySQL tables; compensation bounds (`min_salary <= max_salary`) validated. |
| **TC-06** | **Employee Self-Service (ESS), DTR Attendance & Leave Management** | Employees can access the self-service portal (`/employee`) on desktop or mobile viewports to record Daily Time Record (DTR) clock-in/clock-out, view work schedules, file shift swap requests with peers, apply for leave with automatic balance calculation, and view or download secure payslip breakdowns. | DTR clock-in and clock-out actions log verified server-side timestamps and IP addresses, preventing device time manipulation. Leave filing dynamically checks accrued credits (Vacation/Sick leave) and routes requests through supervisory approval pipelines. Peer shift swaps require mutual acceptance before manager approval. Payslips are rendered securely in restricted view containers with zero unauthorized cross-user access. | **PASSED** | Mobile-responsive design verified on smartphone viewports; accurate DTR duration and leave balance decrements confirmed. |
| **TC-07** | **Security, RBAC Authorization Matrix & Immutable Audit Logging** | The platform enforces enterprise-grade security: Laravel Sanctum bearer token authentication, Two-Factor Authentication (2FA OTP via email), role-based access control across Super Admin, HR Admin, and Employee roles, and comprehensive tamper-proof audit trails logging actor, IP address, timestamp, affected module, and mutation payload. | Sanctum authentication and custom RBAC middleware intercept all requests, returning `403 Forbidden` for unauthorized route attempts. Enabling 2FA mandates 6-digit OTP email validation before granting session tokens. Passwords utilize Bcrypt hashing with configurable complexity policies. High-impact operations (status changes, salary updates, checklist deletions) append immutable JSON records to `audit_logs` and `user_login_activity`. | **PASSED** | Successfully defended against OWASP Top 10 vectors (SQL injection, XSS, CSRF, broken access control); audit trail immutability verified. |

---

## Defect / Issue Log

| Issue ID | Bug / Issue Description | Severity | Corrective Action Needed | Status |
| :--- | :--- | :--- | :--- | :--- |
| **DEF-01** | **Checklist Template Deletion Foreign Key Violation:** Attempting to delete an active onboarding checklist template that had existing linked records in `checklist_requests` resulted in an unhandled HTTP 500 error due to MySQL foreign key constraint `fk_checklist_requests_template_id RESTRICT`. | **HIGH** | Added pre-deletion validation in `ChecklistTemplateController@destroy` to inspect referencing records in `checklist_requests`. If active requests are linked, hard deletion is blocked and the template is gracefully switched to `status = 'Inactive'` (soft archival), notifying the administrator via a friendly UI modal. | **RESOLVED** |
| **DEF-02** | **Multi-Column Resume Text Interleaving in OCR Pre-processing:** When processing resumes formatted with two-column visual layouts, the Tesseract OCR engine parsed text horizontally across columns, interleaving education credentials with unrelated work experience entries and skewing the spaCy NER entity boundary detection. | **MAJOR** | Enhanced the Python FastAPI pre-processing pipeline with PyMuPDF layout analysis and bounding-box column segmentation. Text streams are now segregated into distinct vertical columns before being tokenized and evaluated by the spaCy hospitality NER model, improving extraction accuracy to >92%. | **RESOLVED** |
| **DEF-03** | **Two-Factor Authentication (OTP) Multi-Tab Session Synchronization:** When an authorized user logged in with 2FA enabled and opened duplicate browser tabs prior to inputting the 6-digit email OTP, concurrent tab sessions entered an unverified state that caused race-condition failures against protected API endpoints. | **MODERATE** | Re-architected the authentication flow to issue a transient `AUTH_2FA_PENDING` token state. Bearer tokens with full privileges are only minted upon successful OTP verification. Cross-tab state synchronization was implemented using the browser `BroadcastChannel` API to ensure all active tabs redirect consistently. | **RESOLVED** |

---

## Overall Evaluation & Recommendation

**Overall System Status:**  
`[  ] Approved without Modifications` &nbsp;&nbsp;&nbsp;&nbsp; `[ / ] Approved subject to Minor Revisions` &nbsp;&nbsp;&nbsp;&nbsp; `[  ] Major Revisions Required (Re-test)`

<br>

| Signatory Role | Name & Title | Signature |
| :--- | :--- | :--- |
| **Verified / Conformed by:** | **VINCENT CARLO GARADOS**<br>Research Adviser | _______________________ |
| **Verified / Conformed by:** | **CYRILLE ANNE I. NERY, MSIT**<br>Lead Panel Evaluator | _______________________ |
| **Verified / Conformed by:** | **ALDREN S. MAMATUS**<br>Local Panel Evaluator | _______________________ |
| **Verified / Conformed by:** | **KHRISTIAN HOSEÑA**<br>Local Panel Evaluator | _______________________ |
| **Verified / Conformed by:** | **ENRICO B. PINEDA**<br>Technical Adviser | _______________________ |

<br>

| Proponent Role | Name | Signature |
| :--- | :--- | :--- |
| **Prepared by:** | **FRANCIS D. CAIBIGAN**<br>Project Manager | _______________________ |
| | **FERDINAND JR. G. ESPEÑA**<br>System Developer / Lead Programmer | _______________________ |
| | **ALDREX M. CORDON**<br>Security & Systems Analyst | _______________________ |
| | **ALTHEA MIA O. OCHEA**<br>Quality Assurance Tester | _______________________ |
| | **JAMES CARL P. ALMERIA**<br>Technical Documentation Specialist | _______________________ |
