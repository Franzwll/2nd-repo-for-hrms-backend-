You are a senior full-stack software engineer, AI/NLP engineer, system architect, and software documentation specialist.

I am developing a capstone system and I want you to help me BUILD THE COMPLETE FEATURE end-to-end, not just provide isolated examples.

IMPORTANT DEVELOPMENT APPROACH:
1. First understand the existing project structure and architecture.
2. Do not unnecessarily rewrite or replace existing working features.
3. Adapt the new feature to the existing HRMS and Applicant Management structure.
4. Before creating or modifying files, inspect the current relevant code.
5. Reuse existing models, migrations, services, controllers, API patterns, authentication, and UI conventions whenever appropriate.
6. Implement the feature incrementally and keep the system working.
7. Clearly explain every major change.
8. Do not invent database fields or architecture without first checking whether an equivalent structure already exists.
9. If an existing implementation conflicts with the required research objectives, explain the conflict and implement the best compatible solution.
10. Treat the spaCy NLP/NER service as part of the system architecture, not as an isolated demo.
11. Analyze the existing Applicant Management module carefully before deciding to add, modify, or remove anything.
12. Preserve existing Applicant Management functionality unless a modification is necessary for the proposed NLP/NER role-specific screening feature.

==================================================
CAPSTONE TITLE
==================================================

Design and Development of Recruitment Management in Hotels and Restaurants using spaCy-based Natural Language Processing (NLP) for Role-Specific Applicant Screening using Named Entity Recognition (NER)

==================================================
MAIN GOAL
==================================================

Develop a Recruitment Management feature for Hotels and Restaurants that can process applicant resumes from multiple formats, extract and standardize relevant applicant information using spaCy-based Natural Language Processing (NLP) and Named Entity Recognition (NER), and perform role-specific applicant screening based on the requirements of a selected job position.

The system must not only parse resumes.

The core feature must perform:

1. Resume processing
2. Multi-format text extraction
3. Text cleaning and preprocessing
4. Applicant information extraction
5. spaCy-based Named Entity Recognition
6. Standardization of applicant information
7. Missing essential information detection
8. Recognition and validation of skills
9. Recognition and validation of job roles
10. Role-specific qualification matching
11. Match score computation
12. Applicant screening classification
13. Screening result storage and display in Applicant Management
14. Performance evaluation support

==================================================
CORE SYSTEM CONCEPT
==================================================

The complete process should follow this architecture:

Applicant Resume
(PDF / DOCX / Image)
        |
        v
Multi-Format Resume Processing
        |
        +-- PDF Text Extraction
        +-- DOCX Text Extraction
        +-- Image OCR
        |
        v
Text Cleaning and Preprocessing
        |
        v
spaCy-based NLP Pipeline
        |
        +-- Rule-Based Extraction
        +-- Regex Extraction
        +-- Section Detection
        +-- Custom Named Entity Recognition
        |
        v
Extract Relevant Applicant Information
        |
        +-- PERSON
        +-- EDUCATION
        +-- JOB_TITLE
        +-- SKILL
        +-- CERTIFICATION
        |
        v
Standardized Applicant Profile
        |
        v
Applicant Screening
        |
        +-- Missing Essential Information
        +-- Recognized Skills
        +-- Unrecognized Skills
        +-- Recognized Job Roles
        +-- Unrecognized Job Roles
        +-- Credential Validation
        |
        v
Role-Specific Requirement Matching
        |
        +-- Required Skills
        +-- Preferred Skills
        +-- Education Requirements
        +-- Experience Requirements
        +-- Certification Requirements
        |
        v
Match Score Computation
        |
        v
Screening Classification
        |
        +-- Perfect for the Job
        +-- Invalid Credential
        +-- Fit for Other Job
        +-- Not Fitted to Job
        |
        v
Applicant Management

==================================================
STATEMENT OF THE PROBLEM AND OBJECTIVES
==================================================

SOP 1:

Statement of the Problem:

What percentage of unstructured, multi-formatted candidate resumes can be successfully parsed and standardized without human intervention using a spaCy-based NLP model?

Objective:

To integrate a spaCy-based Natural Language Processing (NLP) pipeline that automatically examines, cleans, and organizes unstructured text data from diverse resume formats into standardized candidate profiles.


SOP 2:

Statement of the Problem:

What is the effectiveness of the developed applicant screening feature using spaCy-based Named Entity Recognition (NER) in identifying missing essential applicant information and detecting invalid or unrecognized skills and job roles from resumes?

Objective:

To determine the effectiveness of the developed applicant screening feature using spaCy-based Named Entity Recognition (NER) in identifying missing essential applicant information and detecting invalid or unrecognized skills and job roles from resumes.

IMPORTANT TERMINOLOGY:

Do not automatically treat an unknown skill or role as false or invalid.

Use the following classifications:

- RECOGNIZED
  The extracted item exists in the system's reference data or accepted aliases.

- UNRECOGNIZED
  The extracted item is not currently found in the system's reference data.

- MISSING
  Required information was not extracted or is absent.

- INVALID_FORMAT
  A value exists but fails the expected format validation.

- INVALID_CREDENTIAL
  A credential-related issue exists according to the validation rules implemented by the system.

IMPORTANT:

UNRECOGNIZED does not automatically mean INVALID.

An unrecognized skill or job role should not automatically cause the applicant to be rejected.

The system should distinguish between:

- Missing information
- Unrecognized information
- Invalid format
- Invalid credential
- Information requiring manual verification


SOP 3:

Statement of the Problem:

What is the performance of the developed applicant screening feature using spaCy-based NLP and NER in identifying qualified applicants in terms of Accuracy, Precision, Recall, and F1-score?

Objective:

To evaluate the performance of the developed applicant screening feature using Accuracy, Precision, Recall, and F1-score in identifying qualified applicants based on extracted resume information.

The system must support evaluation by comparing:

System Screening Decision

VERSUS

Ground Truth / Actual Applicant Qualification Classification.

The system's screening decisions are:

- PERFECT_FOR_THE_JOB
- INVALID_CREDENTIAL
- FIT_FOR_OTHER_JOB
- NOT_FITTED_TO_JOB

The exact classification rules must be documented.

For research evaluation using Accuracy, Precision, Recall, and F1-score, clearly document how the four screening statuses are mapped to the ground truth evaluation categories.

Do not arbitrarily convert the four statuses into binary results without documenting the methodology.


SOP 4:

Statement of the Problem:

What is the accuracy of the spaCy-based Named Entity Recognition (NER) in extracting relevant applicant information from resumes, including personal information, education, work experience, technical skills, and certifications?

Objective:

To measure the accuracy of the spaCy-based Named Entity Recognition (NER) model in identifying and extracting relevant applicant information, including personal information, education, work experience, technical skills, and certifications from resumes.

The custom NER model should initially support:

- PERSON
- EDUCATION
- JOB_TITLE
- SKILL
- CERTIFICATION

The implementation must support proper evaluation using an unseen test dataset.

Do not evaluate the NER model using the same resumes used for training.

The dataset must support:

- Training set
- Validation set
- Test set

The split should preferably be done by complete resume/document to avoid data leakage.


SOP 5:

Statement of the Problem:

How well do the computed match scores align with actual applicant qualification levels?

Objective:

To determine how accurately the computed match scores align with the applicants' actual qualification levels.

The system must therefore store or support comparison between:

Computed Match Score

and

Ground Truth / Actual Applicant Qualification Level.

The method used to determine actual qualification level must be documented.

==================================================
ROLE-SPECIFIC SCREENING REQUIREMENT
==================================================

This system is NOT only a general resume parser.

The central requirement is ROLE-SPECIFIC APPLICANT SCREENING.

Each job position should be able to define requirements such as:

1. Required Skills
2. Preferred Skills
3. Required Education
4. Preferred Education
5. Required Experience
6. Minimum Experience
7. Required Certifications
8. Preferred Certifications
9. Required Applicant Information

Example:

JOB ROLE:
Barista

Possible requirements:

Required Skills:
- Customer Service
- Coffee Preparation

Preferred Skills:
- POS
- Cash Handling

Preferred Experience:
- Barista
- Coffee Shop Staff

Required Information:
- Name
- Email
- Phone

When an applicant applies to the Barista role:

Job Requirements
        |
        v
Compare Against
        |
Applicant's Extracted Profile
        |
        v
Role-Specific Matching
        |
        v
Match Score
        |
        v
Screening Classification

The same applicant may receive a different match score for different job roles.

==================================================
SCREENING STATUS CLASSIFICATION
==================================================

The final applicant screening result must use the following statuses:

1. PERFECT FOR THE JOB
2. INVALID CREDENTIAL
3. FIT FOR OTHER JOB
4. NOT FITTED TO JOB

Do not replace these user-facing statuses with:

- Qualified
- Needs Review
- Not Qualified

The four statuses above are the official screening outcomes of the system.

==================================================
PERFECT FOR THE JOB
==================================================

Classify an applicant as:

PERFECT FOR THE JOB

when the applicant:

1. Meets the required or mandatory qualifications for the job applied for.
2. Has sufficient matching skills.
3. Meets the required education requirements where applicable.
4. Meets the required experience requirements where applicable.
5. Meets certification requirements where applicable.
6. Does not have a critical credential validation issue.
7. Achieves the defined match score or satisfies the documented qualification rules.

The result must include an explanation.

Example:

Applicant applied for:

Barista

Matched:

- Customer Service
- Coffee Preparation
- POS
- Previous Barista Experience

Result:

PERFECT FOR THE JOB

The system must show why the applicant received this result.

==================================================
INVALID CREDENTIAL
==================================================

Classify an applicant as:

INVALID CREDENTIAL

when a credential-related issue affects the applicant's qualification according to the system's documented validation rules.

Examples may include:

- A required credential is missing.
- A required certification is missing.
- A credential has an invalid format.
- A credential does not satisfy the requirements of the applied job.
- A credential cannot be recognized according to available reference data and requires verification.

IMPORTANT:

Do not falsely claim that a credential is fraudulent unless the system has actual authoritative verification.

If the system only validates based on internal reference data, formats, or job requirements, clearly state that the result means:

"Invalid or requires verification based on system validation rules."

Do not classify every unrecognized skill or job role as Invalid Credential.

==================================================
FIT FOR OTHER JOB
==================================================

Classify an applicant as:

FIT FOR OTHER JOB

when:

1. The applicant does not sufficiently match the job they applied for.

BUT

2. The applicant's extracted profile strongly matches another available or open job position.

The system should:

1. Analyze the job the applicant originally applied for.
2. Calculate the role-specific match score.
3. If the applicant is not sufficiently qualified for that role, compare the applicant profile with other available or open job positions.
4. Calculate match scores for those alternative jobs.
5. Identify the best matching alternative position.
6. Recommend an alternative job only when it satisfies the defined requirements and threshold.

Store and display:

- Recommended Job ID
- Recommended Job Title
- Alternative Match Score
- Matched Requirements
- Reason for Recommendation

Example:

Applicant applied for:

Waiter

Applied Job Score:

45%

Alternative Job:

Barista

Alternative Score:

88%

Result:

FIT FOR OTHER JOB

Recommended Position:

Barista

Reason:

The applicant has Barista experience, coffee preparation skills, POS knowledge, and customer service experience.

==================================================
NOT FITTED TO JOB
==================================================

Classify an applicant as:

NOT FITTED TO JOB

when:

1. The applicant does not sufficiently meet the requirements of the job applied for.

AND

2. The applicant does not sufficiently match another available or open job position.

The result must be explainable.

Example:

Missing:

- Required Skill: Customer Service
- Required Certification
- Relevant Work Experience

Alternative Job Analysis:

No available position achieved the required qualification level.

Result:

NOT FITTED TO JOB

==================================================
SCREENING DECISION LOGIC
==================================================

The final screening classification must not depend only on an arbitrary match-score threshold.

Consider:

1. Mandatory requirements.
2. Required skills.
3. Preferred skills.
4. Education.
5. Work experience.
6. Certifications.
7. Credential validation.
8. Missing essential information.
9. Applied job match score.
10. Alternative job match scores.

The decision flow should conceptually be:

Applicant Resume
        |
        v
Extract Applicant Information
        |
        v
Validate Information
        |
        v
Credential Problem?
        |
        +-- Yes --> INVALID CREDENTIAL
        |
        +-- No
             |
             v
      Match Against Applied Job
             |
             +-- Strong Match
             |       |
             |       v
             |   PERFECT FOR THE JOB
             |
             +-- Insufficient Match
                     |
                     v
             Analyze Other Open Jobs
                     |
                     +-- Strong Alternative Match
                     |       |
                     |       v
                     |   FIT FOR OTHER JOB
                     |
                     +-- No Suitable Alternative
                             |
                             v
                        NOT FITTED TO JOB

The exact rules, thresholds, mandatory requirements, and exceptions must be documented.

==================================================
APPLICANT PROFILE STRUCTURE
==================================================

Create or adapt a standardized applicant profile based on the existing project structure.

Conceptually, it should support:

{
  "personal_information": {
    "name": null,
    "email": null,
    "phone": null
  },
  "education": [],
  "work_experience": [],
  "skills": [],
  "certifications": []
}

Do not force this exact database structure if the existing system already has a better normalized design.

Instead, map the extracted information appropriately into the existing HRMS architecture.

==================================================
MULTI-FORMAT RESUME PROCESSING
==================================================

The system should support, where technically available:

1. PDF
2. DOCX
3. Image-based resumes

Suggested process:

PDF:
Resume -> Text Extraction

DOCX:
Resume -> Text Extraction

Image:
Resume -> OCR -> Text Extraction

All extracted text should then pass through a common processing pipeline.

Track processing status:

- PENDING
- PROCESSING
- PROCESSED
- PARTIALLY_PROCESSED
- FAILED

The definition of "successfully parsed and standardized" for SOP 1 must be explicitly documented.

For example, success may mean:

1. Text was successfully extracted.
2. The resume was processed without system failure.
3. A standardized applicant profile was generated.

Do not silently assume this definition.

==================================================
spaCy NLP AND NER REQUIREMENTS
==================================================

Use spaCy-based NLP as part of the implementation.

The pipeline may combine:

1. spaCy NLP
2. Custom spaCy NER
3. Regex
4. Rule-based matching
5. Section detection
6. Reference-data validation

Do not claim that every extraction is performed exclusively by NER.

Clearly distinguish the extraction methods.

For example:

Email:
Regex

Phone:
Regex

Resume Sections:
Rule-based / Section Detection

PERSON:
spaCy NER and/or appropriate extraction logic

EDUCATION:
Custom NER + Section Context

JOB_TITLE:
Custom NER + Reference Data

SKILL:
Custom NER + Section Context + Reference Data

CERTIFICATION:
Custom NER + Section Context

==================================================
CUSTOM NER DATASET
==================================================

Prepare the project so a custom spaCy NER model can be trained using annotated recruitment resume data.

Entity labels:

- PERSON
- EDUCATION
- JOB_TITLE
- SKILL
- CERTIFICATION

Provide:

1. Annotation guidelines
2. Dataset structure
3. Training preparation
4. Validation preparation
5. Test dataset preparation
6. Annotation validation
7. Training script or spaCy training configuration
8. Model storage/loading mechanism
9. NER evaluation process

Prevent common data leakage.

Do not split pages or fragments of the same resume across training and testing sets.

==================================================
REFERENCE DATA FOR SCREENING
==================================================

The system should maintain or use existing reference data for:

- Job Roles
- Skills
- Role Aliases
- Skill Aliases
- Education Requirements
- Certification Requirements

Prefer integrating with the existing database and system data instead of permanently hard-coding all values in Python.

Examples:

"Point of Sale" -> "POS"

"Food Server" -> "Server"

"Front Desk Staff" -> "Front Desk Officer"

The aliases should be manageable and documented.

==================================================
MISSING INFORMATION SCREENING
==================================================

The system must identify missing essential information.

Examples:

- Name
- Email
- Phone
- Education
- Work Experience

Requirements should be role-specific where appropriate.

Do not permanently treat every field as universally required.

==================================================
ROLE AND SKILL VALIDATION
==================================================

The system should:

1. Extract skills and job roles from resumes.
2. Normalize extracted values.
3. Apply aliases where appropriate.
4. Compare them against reference data.
5. Classify them as:

- RECOGNIZED
- UNRECOGNIZED

Do not automatically reject an applicant because of an unrecognized value.

Flag it appropriately for review.

==================================================
ROLE-SPECIFIC MATCH SCORE
==================================================

Implement a transparent and explainable match scoring system.

The score should be based on role-specific criteria.

Possible components:

- Required Skills
- Preferred Skills
- Education
- Work Experience
- Certifications
- Required Information Completeness

The exact scoring formula must be documented.

The weights must not be random or hidden.

The implementation should make the weights configurable or traceable.

Conceptually:

Overall Match Score =
(
Skill Score * Skill Weight
+
Education Score * Education Weight
+
Experience Score * Experience Weight
+
Certification Score * Certification Weight
+
Completeness Score * Completeness Weight
)

Mandatory requirements may override the numerical score.

Return a score explanation.

Example:

Overall Score: 82%

Skills:
30 / 40

Education:
20 / 20

Experience:
20 / 25

Certification:
12 / 15

==================================================
APPLICANT MANAGEMENT ANALYSIS AND INTEGRATION
==================================================

This requirement is extremely important.

Before implementing the NLP/NER screening feature, analyze the EXISTING Applicant Management module.

Do not assume that a new Applicant Management system is needed.

Inspect the current:

1. Applicant Management frontend pages/components.
2. Applicant Management backend controllers/services.
3. Applicant models.
4. Applicant database tables.
5. Resume upload flow.
6. Applicant creation flow.
7. Current applicant status flow.
8. Current screening or ranking functionality.
9. Current fit score or matching functionality.
10. Job application relationships.
11. Job position relationships.
12. Interview scheduling integration.
13. Assessment or evaluation integration.
14. Existing API endpoints.
15. Existing UI patterns.

After analysis, determine exactly what is needed to support the spaCy NLP + NER role-specific screening feature.

For every relevant existing component, classify the action as:

- REUSE
  Existing implementation already supports the feature.

- EXTEND
  Existing implementation should remain but needs additional functionality.

- MODIFY
  Existing implementation needs changes because it conflicts with or cannot support the feature.

- ADD
  A new component, field, table, API, service, or UI element is genuinely required.

- NOT NEEDED
  No change is required.

Provide the analysis in a table such as:

| Existing Component | Current Purpose | Action | Required Change | Reason |
|-------------------|-----------------|--------|-----------------|--------|

==================================================
APPLICANT MANAGEMENT MODIFICATION REQUIREMENTS
==================================================

Only after analyzing the existing Applicant Management module, determine whether the following need to be added or modified.

Potential additions or modifications may include:

1. Resume Processing Status

Examples:

- Pending
- Processing
- Processed
- Partially Processed
- Failed

2. NLP/NER Analysis Result

Store or retrieve:

- Extracted applicant information
- Extracted entities
- Model/version information if needed
- Processing timestamp

3. Screening Result

The Applicant Management module should support the four screening statuses:

- Perfect for the Job
- Invalid Credential
- Fit for Other Job
- Not Fitted to Job

4. Match Score

Display the role-specific match score.

5. Score Breakdown

Show why the score was generated.

Example:

Skills: 30/40
Education: 20/20
Experience: 20/25
Certification: 12/15

6. Missing Information

Display required information that could not be extracted.

7. Skill Analysis

Display:

- Recognized Skills
- Unrecognized Skills
- Normalized Skills where applicable

8. Job Role Analysis

Display:

- Recognized Job Roles
- Unrecognized Job Roles

9. Credential Analysis

Display:

- Valid according to system rules
- Missing
- Invalid format
- Requires verification

Do not claim external credential verification unless it actually exists.

10. Alternative Job Recommendation

For:

FIT FOR OTHER JOB

display:

- Recommended Job
- Alternative Match Score
- Reason for Recommendation

11. Screening Explanation

Every screening result should be understandable.

Do not only display:

Score: 82%

Also display:

Matched Requirements
Missing Requirements
Credential Issues
Alternative Job Recommendation where applicable

==================================================
IMPORTANT APPLICANT MANAGEMENT DESIGN RULE
==================================================

Analyze whether the existing system separates:

SCREENING RESULT

from

RECRUITMENT/APPLICATION STATUS OR STAGE.

These should represent different concepts.

Example:

Screening Result:

Perfect for the Job

Recruitment Stage:

Interview Scheduled

The screening result answers:

"How well does the applicant fit the job?"

The recruitment stage answers:

"Where is the applicant in the recruitment process?"

Do not automatically merge these into one status field.

Inspect the existing database and workflow.

If they are currently mixed together, recommend the cleanest compatible modification.

==================================================
TECH STACK
==================================================

Adapt the implementation to the existing project.

The current project architecture should be inspected first.

The expected technology direction is:

Backend / HRMS:
- Laravel
- PHP

Database:
- Use the existing project database and ORM architecture.
- Do not introduce a different database unnecessarily.

NLP / AI Service:
- Python
- spaCy
- Custom spaCy Named Entity Recognition (NER)

API Communication:
- Laravel communicates with the Python NLP service through an API.

Possible Python API framework:

- FastAPI, if compatible with the existing implementation.

Resume Processing:

- PDF text extraction
- DOCX text extraction
- OCR for image-based resumes where supported

Frontend:

- Preserve and adapt the existing frontend technology and UI architecture.

Before implementation, inspect the actual project files and determine the exact existing technology stack.

==================================================
DATABASE AND DATA DESIGN
==================================================

Inspect the current migrations, models, and schema first.

Determine whether these concepts already exist:

- Applicants
- Job Positions
- Job Requirements
- Skills
- Qualifications
- Certifications
- Resume Files
- Applicant Screening
- Applicant Status

If they exist, extend or adapt them instead of duplicating the data model.

If new tables or fields are required, create them only when necessary.

Potential concepts that may require storage include:

- Resume processing status
- Extracted profile data
- NLP entities
- Screening result
- Missing information flags
- Unrecognized skills
- Unrecognized roles
- Credential validation results
- Match score
- Score breakdown
- Alternative job recommendation
- NLP model/version information
- Processing timestamps

Follow the existing database conventions.

==================================================
API REQUIREMENTS
==================================================

The Python NLP service should have clear endpoints.

For example:

POST /analyze-resume

Input:

- Resume text or processed resume content
- Applicant context if required
- Job role or job position context if required

Output should conceptually include:

{
  "success": true,

  "profile": {},

  "entities": [],

  "screening": {
    "missing_information": [],
    "skills": {
      "recognized": [],
      "unrecognized": []
    },
    "job_roles": {
      "recognized": [],
      "unrecognized": []
    },
    "credentials": []
  }
}

Role-specific analysis may additionally return:

{
  "match_score": 0,
  "score_breakdown": {},
  "screening_status": "",
  "screening_reasons": [],
  "alternative_job": {}
}

Adapt the final API design to the actual existing architecture.

==================================================
ERROR HANDLING
==================================================

Handle:

- Unsupported files
- Corrupted files
- Empty resumes
- OCR failures
- Text extraction failures
- NLP processing failures
- Missing reference data
- API communication failures

Do not silently fail.

Return useful status information.

==================================================
RESEARCH EVALUATION SUPPORT
==================================================

The system must support collecting the data needed to answer the SOP.

SOP 1:

Track:

- Total resumes processed
- Successfully parsed and standardized resumes
- Failed resumes
- Partially processed resumes if applicable

SOP 2:

Support comparison between:

Actual Missing / Recognized / Unrecognized / Credential Issues

and

System Predictions

SOP 3:

Support evaluation of applicant screening decisions.

Store:

- System screening result
- Ground truth screening or qualification result

Support:

- Confusion matrix
- Accuracy
- Precision
- Recall
- F1-score

Clearly document how the four screening statuses are evaluated.

SOP 4:

Evaluate custom NER per entity:

- PERSON
- EDUCATION
- JOB_TITLE
- SKILL
- CERTIFICATION

Calculate:

- Precision
- Recall
- F1-score

Clearly define the entity evaluation method.

SOP 5:

Support comparison between:

Computed Match Score

and

Actual Applicant Qualification Level / Ground Truth Score or Classification.

Document the chosen evaluation method and justification.

Do not fabricate evaluation results.

==================================================
IMPLEMENTATION PROCESS
==================================================

Follow this development sequence:

PHASE 1:
Inspect and analyze the existing project.

Provide:

1. Current architecture summary
2. Relevant existing files
3. Existing Applicant Management flow
4. Existing job/role/qualification data structures
5. Existing resume upload flow
6. Existing screening implementation
7. Existing ranking or match score implementation
8. Existing applicant statuses and recruitment stages
9. Applicant Management reuse/extend/modify/add analysis
10. Proposed integration plan

Do not start blindly creating duplicate files.


PHASE 2:
Design the feature architecture.

Provide:

1. Updated system architecture
2. Data flow
3. Applicant Management modifications
4. Database changes
5. API communication design
6. NLP pipeline design
7. Role-specific screening design
8. Match scoring design
9. Screening status decision logic

Explain why each component is needed.


PHASE 3:
Implement resume processing.

Support:

- PDF
- DOCX
- Image/OCR where feasible

Add processing status and error handling.


PHASE 4:
Implement text preprocessing and standardization.


PHASE 5:
Implement the initial spaCy NLP pipeline.

Combine:

- Regex
- Rules
- Section detection
- NER

Do not falsely label all extraction as NER.


PHASE 6:
Implement the standardized applicant profile.


PHASE 7:
Implement missing information detection.


PHASE 8:
Implement recognized/unrecognized skill validation.


PHASE 9:
Implement recognized/unrecognized job role validation.


PHASE 10:
Implement credential validation according to the system's available rules.


PHASE 11:
Implement the custom spaCy NER dataset preparation.

Include:

- Annotation guidelines
- Dataset structure
- Train/validation/test split
- Annotation validation


PHASE 12:
Implement custom spaCy NER training.


PHASE 13:
Implement NER evaluation.


PHASE 14:
Implement role-specific job requirements.


PHASE 15:
Implement applicant-to-role matching.


PHASE 16:
Implement transparent match score computation.


PHASE 17:
Implement the four official screening classifications:

- PERFECT FOR THE JOB
- INVALID CREDENTIAL
- FIT FOR OTHER JOB
- NOT FITTED TO JOB

Document the exact decision logic.


PHASE 18:
For applicants who are not suitable for their applied job, implement alternative open-job analysis for:

FIT FOR OTHER JOB.


PHASE 19:
Integrate the complete screening feature into the existing Applicant Management module.

Do not create a duplicate Applicant Management system.

Preserve existing functionality unless modification is required.


PHASE 20:
Implement research evaluation tools and metrics.


PHASE 21:
Testing and debugging.

Test:

- Different resume formats
- Different resume layouts
- Missing information
- Recognized skills
- Unrecognized skills
- Recognized roles
- Unrecognized roles
- Credential issues
- Different job roles
- Strong job matches
- Weak job matches
- Alternative job matches
- Match score edge cases
- Required qualification failures
- API failures


PHASE 22:
Final documentation.

==================================================
FINAL DOCUMENTATION REQUIREMENT
==================================================

WHEN THE DEVELOPMENT IS COMPLETE, YOU MUST PROVIDE A COMPLETE DOCUMENTATION OF WHAT WAS DONE.

The documentation must include:

1. Project Feature Overview

Explain the purpose of the Recruitment Management Applicant Screening feature.

2. Capstone Title

Include the complete title.

3. Goal and Scope

Explain what the developed feature accomplishes.

4. Statement of the Problem

Include all five SOP questions.

5. Objectives

Include all corresponding objectives.

6. Existing System Analysis

Explain the original relevant architecture before the feature changes.

7. Applicant Management Analysis

Document:

- Existing Applicant Management workflow
- Existing components analyzed
- What was reused
- What was extended
- What was modified
- What was added
- Why each change was necessary

Create a table:

| Component | Existing Function | Action Taken | Changes | Reason |

8. Final System Architecture

Include a clear text-based or diagram-ready architecture showing:

HRMS / Laravel
        |
        v
Applicant Management
        |
        v
Resume Processing
        |
        v
Python NLP Service
        |
        +-- spaCy NLP
        +-- Custom NER
        +-- Rules
        +-- Regex
        +-- Section Detection
        |
        v
Standardized Applicant Profile
        |
        v
Role-Specific Screening
        |
        v
Match Score
        |
        v
Screening Result

        +-- Perfect for the Job
        +-- Invalid Credential
        +-- Fit for Other Job
        +-- Not Fitted to Job

9. Technology Stack

Document the actual technologies used.

10. Database Changes

For every new or modified table, migration, or field:

- Purpose
- Relationships
- Important fields

11. Backend Changes

Document:

- Controllers
- Services
- Models
- Jobs/Queues if used
- API clients
- Validation
- Error handling

12. Python NLP Service

Document:

- Project structure
- Dependencies
- spaCy model
- Entity labels
- Regex extraction
- Section detection
- Custom rules
- API endpoints
- Training process

13. NER Dataset and Annotation

Document:

- Entity definitions
- Annotation guidelines
- Dataset structure
- Train/validation/test methodology
- Data leakage prevention

14. Role-Specific Screening Logic

Explain exactly how applicant information is compared against job requirements.

15. Match Score Formula

Document the exact formula.

Explain:

- Components
- Weights
- Mandatory requirements
- Thresholds
- Score interpretation

16. Screening Classification

Document exactly how the system determines:

- Perfect for the Job
- Invalid Credential
- Fit for Other Job
- Not Fitted to Job

17. Alternative Job Recommendation

Document:

- When alternative jobs are analyzed
- Which jobs are considered
- How they are ranked
- What threshold is used
- Why a recommendation is generated

18. Applicant Management Integration

Explain exactly what was changed in Applicant Management and why.

19. SOP-to-Feature Mapping

Create:

| SOP | Implemented Feature | Data Collected | Evaluation Method |

Include all five SOPs.

20. Evaluation Guide

Provide instructions for evaluating:

- SOP 1
- SOP 2
- SOP 3
- SOP 4
- SOP 5

21. Accuracy, Precision, Recall, and F1

Document:

- Definitions
- Formulas
- Required ground truth data
- How the system calculates each metric

22. How to Run the Feature

Provide exact setup and execution instructions.

23. API Documentation

Document all relevant endpoints, requests, and responses.

24. Testing

Document:

- Test cases
- Edge cases
- Expected behavior

25. Limitations

Clearly state limitations.

Do not claim that the system is perfect or fully autonomous.

Clearly distinguish:

- Information extraction
- Information recognition
- Internal validation
- External credential verification

26. Future Improvements

Suggest technically realistic improvements.

27. File Change Summary

Provide a complete list:

Created Files:
- path
- purpose

Modified Files:
- path
- purpose

Deleted Files:
- path
- reason

28. Final Development Summary

Summarize:

- What was implemented
- What was reused from Applicant Management
- What was modified
- What was added
- What research objectives are supported
- What remains dependent on actual dataset collection and evaluation


# Autonomous Development Continuation Rule

The development process should continue automatically.

The developer must not stop after completing a task merely to request approval to:

- verify the next task
- verify the next development phase
- approve an implementation plan
- approve continuation
- approve moving to the next requirement

Instead, the developer must:

1. Follow CAPSTONE_DEVELOPMENT_GUIDE.md as the master requirements.
2. Use DEVELOPMENT_PROGRESS.md to determine the current state.
3. Inspect only the relevant project files when needed.
4. Determine the next required task based on the capstone requirements and actual project state.
5. Implement the task.
6. Test and validate the implementation.
7. Fix issues directly related to the implementation.
8. Update DEVELOPMENT_PROGRESS.md with actual changes.
9. Automatically continue to the next required task.

The developer should only stop and ask for user input when:

- required information is genuinely missing;
- a decision would significantly change the capstone requirements;
- a destructive or irreversible action is necessary;
- credentials, external access, or unavailable resources are required;
- a blocking technical issue cannot be resolved safely.

Do not repeatedly ask for approval between normal development tasks.

==================================================
FINAL REVIEW REQUIREMENT
==================================================

After all development and documentation are complete:

1. Provide me the complete documentation.
2. Clearly identify any assumptions made.
3. Clearly identify anything that could not be implemented.
4. Clearly identify which SOPs are fully supported by the implemented feature.
5. Clearly identify which results still require actual experimental data.
6. Do not fabricate Accuracy, Precision, Recall, F1-score, NER accuracy, parsing percentage, or match-score alignment results.

I will then provide the final documentation and development output to ChatGPT for an independent evaluation.

The final output must make it possible for ChatGPT to review:

- Whether the implementation matches the capstone title
- Whether the implementation supports the stated goal
- Whether each SOP can actually be answered
- Whether each objective is supported
- Whether spaCy-based NLP is genuinely used
- Whether NER is genuinely implemented and evaluated
- Whether the system is truly role-specific
- Whether the Applicant Management module was properly analyzed
- Whether unnecessary Applicant Management features were avoided
- Whether necessary Applicant Management modifications were made
- Whether the four screening statuses are logically implemented
- Whether the applicant screening logic is explainable
- Whether the match score can be evaluated
- Whether the evaluation methodology is valid

BEGIN WITH PHASE 1:

Inspect and understand the existing project before modifying anything.

First provide:

1. Current architecture analysis
2. Relevant files and modules
3. Existing Applicant Management analysis
4. Existing Applicant Management workflow
5. Existing Applicant Management frontend and backend components
6. Existing Applicant Management database structures
7. Existing applicant statuses and recruitment stages
8. Existing resume processing or screening logic
9. Existing ranking or match score logic
10. Existing job and role requirement structures
11. Existing technology stack
12. What can be REUSED
13. What needs to be EXTENDED
14. What needs to be MODIFIED
15. What needs to be ADDED
16. What is NOT NEEDED
17. A proposed implementation plan

Do not make destructive or major architectural changes before completing this analysis.

Do not create duplicate Applicant Management functionality.

Only add or modify Applicant Management features when the analysis demonstrates that they are necessary for the spaCy-based NLP, NER, role-specific applicant screening, match scoring, and the four official screening statuses.


