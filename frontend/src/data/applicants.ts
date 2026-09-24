export type ApplicantStatus = "fit" | "other-role" | "credential" | "not-fit";

/** Latest full spaCy screening record returned by the backend. */
export type ScreeningDetail = {
  processing_status?: string;
  screening_result?: string | null;
  match_score?: number | null;
  /** Resume-only score before the supporting-document evidence was blended in. */
  resume_match_score?: number | null;
  /** Supporting-document evidence behind the ranking score (documents score,
   *  verified / discrepancy / unable counts, applied penalty and flags). */
  document_verification?: {
    status?: string;
    weight?: number;
    documents_total?: number;
    decisive_count?: number;
    verified_count?: number;
    discrepancy_count?: number;
    unable_count?: number;
    pending_count?: number;
    ignored_count?: number;
    credit_ratio?: number | null;
    documents_score?: number | null;
    score_penalty?: number;
    escalate_invalid?: boolean;
    mismatched_fields?: string[];
    flags?: string[];
  } | null;
  score_breakdown?: Record<
    string,
    {
      earned?: number;
      max?: number;
      matched_required?: string[];
      missing_required?: string[];
      fuzzy_matched_required?: Record<string, string>;
      matched_preferred?: string[];
      missing_preferred?: string[];
      estimated_years?: number;
      min_years_required?: number;
      requirement_met?: boolean;
      required_level?: string;
      applicant_highest_level?: string[];
      matched?: string[];
      missing?: string[];
      no_requirements?: boolean;
    }
  >;
  profile?: {
    personal_information?: { name?: string | null; email?: string | null; phone?: string | null };
    education?: string[];
    work_experience?: { job_title?: string; period?: string | null }[];
    skills?: string[];
    certifications?: string[];
    unrecognized_certifications?: string[];
    estimated_years_experience?: number;
    job_roles?: { recognized?: string[]; unrecognized?: string[] };
  };
  missing_information?: string[];
  validation?: {
    invalid_format?: string[];
    skill_analysis?: { recognized?: string[]; unrecognized?: string[] };
    job_role_analysis?: { recognized?: string[]; unrecognized?: string[] };
    credential_issues?: { type: string; detail: string; note?: string }[];
  };
  alternative_job?: {
    job_post_id?: number;
    title?: string;
    alternative_match_score?: number;
    applied_job_score?: number;
    matched_skills?: string[];
    reason?: string;
  } | null;
  reasons?: string[];
  error_message?: string | null;
};

export type Applicant = {
  id: string;
  dbId?: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  jobId: string;
  appliedAt: string;
  score: number;
  status: ApplicantStatus;
  stage:
    | "Screened"
    | "Interview Scheduled"
    | "Assessed"
    | "Assessment Test"
    | "Practical Test"
    | "Final Evaluation"
    | "Offer"
    | "Hired"
    | "Rejected"
    | "Accepted";
  source: "Online Portal" | "Walk-in" | "Referral" | "Indeed" | "Facebook";
  entities: { label: string; value: string }[];
  breakdown: { criterion: string; score: number }[];
  flags: string[];
  summary: string;
  screening_detail?: ScreeningDetail | null;
  resumeUrl?: string | null;
  resumeOriginalName?: string | null;
  /** Number of uploaded supporting documents (COE / Certificate /
   *  Credential / Others). Absent (undefined) when unknown, e.g. mock rows. */
  docCount?: number;
  /** Whether this position takes a practical assessment (from the API's job
   *  post flag / designated positions). Undefined on mock rows. */
  requiresPractical?: boolean;
};

export const statusMeta: Record<
  ApplicantStatus,
  { label: string; className: string; dot: string }
> = {
  fit: {
    label: "Perfect for the Job",
    className: "bg-success/15 text-success border-success/30",
    dot: "bg-success",
  },
  "other-role": {
    label: "Fit for other Job",
    className: "bg-warning/20 text-warning-foreground border-warning/40",
    dot: "bg-warning",
  },
  credential: {
    label: "Invalid credential",
    className: "bg-caution/15 text-caution border-caution/30",
    dot: "bg-caution",
  },
  "not-fit": {
    label: "Not fitted to Job",
    className: "bg-destructive/15 text-destructive border-destructive/30",
    dot: "bg-destructive",
  },
};

export const getStatusMeta = (status: any) => {
  return statusMeta[status as ApplicantStatus] ?? statusMeta["not-fit"];
};

export const applicants: Applicant[] = [
  {
    id: "APP-1041",
    name: "Bianca Soriano",
    email: "bianca.soriano@email.com",
    phone: "0912 345 6789",
    position: "Front Desk Receptionist",
    jobId: "front-desk-receptionist",
    appliedAt: "2026-07-25 23:15",
    score: 96,
    status: "fit",
    stage: "Interview Scheduled",
    source: "Online Portal",
    entities: [
      { label: "SKILL", value: "Guest Relations" },
      { label: "SKILL", value: "Opera PMS" },
      { label: "ORG", value: "Grand Horizon Hotel" },
      { label: "EDU", value: "BS Hospitality Management" },
      { label: "CERT", value: "TESDA Front Office NC II" },
    ],
    breakdown: [
      { criterion: "Skills", score: 38 },
      { criterion: "Work Experience", score: 28 },
      { criterion: "Educational Background", score: 20 },
      { criterion: "Certifications", score: 10 },
    ],
    flags: [],
    summary:
      "Three years front office experience at a 4-star property, PMS proficient, complete credentials.",
  },
  {
    id: "APP-1040",
    name: "Marjun Devera",
    email: "marjun.devera@email.com",
    phone: "0917 664 2219",
    position: "Restaurant Server",
    jobId: "restaurant-server",
    appliedAt: "2026-07-25 22:40",
    score: 88,
    status: "fit",
    stage: "Accepted",
    source: "Referral",
    entities: [
      { label: "SKILL", value: "Table Service" },
      { label: "SKILL", value: "POS Systems" },
      { label: "ORG", value: "Bistro Manila" },
      { label: "EDU", value: "HRM Vocational" },
    ],
    breakdown: [
      { criterion: "Skills", score: 34 },
      { criterion: "Work Experience", score: 26 },
      { criterion: "Educational Background", score: 18 },
      { criterion: "Certifications", score: 10 },
    ],
    flags: [],
    summary: "Strong dining-room service background with banquet exposure.",
  },
  {
    id: "APP-1039",
    name: "Kanor Ornak",
    email: "kanor.ornak@email.com",
    phone: "0905 118 7742",
    position: "Front Desk Receptionist",
    jobId: "front-desk-receptionist",
    appliedAt: "2026-07-25 21:12",
    score: 74,
    status: "other-role",
    stage: "Screened",
    source: "Indeed",
    entities: [
      { label: "SKILL", value: "Cash Handling" },
      { label: "SKILL", value: "Inventory" },
      { label: "ORG", value: "Cafe Verde" },
      { label: "EDU", value: "College Level" },
    ],
    breakdown: [
      { criterion: "Skills", score: 26 },
      { criterion: "Work Experience", score: 22 },
      { criterion: "Educational Background", score: 16 },
      { criterion: "Certifications", score: 10 },
    ],
    flags: ["Stronger match: Restaurant Server (86%)"],
    summary: "Retail and cafe service background; better aligned to F&B service roles.",
  },
  {
    id: "APP-1038",
    name: "Princess Mabangis",
    email: "princess.mabangis@email",
    phone: "0912 345",
    position: "Housekeeping Attendant",
    jobId: "housekeeping-attendant",
    appliedAt: "2026-07-25 20:10",
    score: 58,
    status: "credential",
    stage: "Screened",
    source: "Walk-in",
    entities: [
      { label: "SKILL", value: "Room Turnover" },
      { label: "ORG", value: "Sunrise Inn" },
    ],
    breakdown: [
      { criterion: "Skills", score: 24 },
      { criterion: "Work Experience", score: 18 },
      { criterion: "Educational Background", score: 10 },
      { criterion: "Certifications", score: 6 },
    ],
    flags: [
      "Malformed email address",
      "Incomplete phone number",
      "Job position typo on application form",
    ],
    summary: "Relevant housekeeping experience but contact details failed NER validation.",
  },
  {
    id: "APP-1037",
    name: "Elena Torres",
    email: "elena.torres@email.com",
    phone: "0918 220 3341",
    position: "Line Cook",
    jobId: "line-cook",
    appliedAt: "2026-07-25 19:02",
    score: 22,
    status: "not-fit",
    stage: "Rejected",
    source: "Online Portal",
    entities: [
      { label: "SKILL", value: "Data Entry" },
      { label: "EDU", value: "BS Accountancy" },
    ],
    breakdown: [
      { criterion: "Skills", score: 8 },
      { criterion: "Work Experience", score: 6 },
      { criterion: "Educational Background", score: 6 },
      { criterion: "Certifications", score: 2 },
    ],
    flags: ["No culinary certification", "No kitchen experience detected"],
    summary: "Clerical background with no hospitality or culinary entities detected.",
  },
  {
    id: "APP-1036",
    name: "Kevin Dela Cruz",
    email: "kevin.delacruz@email.com",
    phone: "0921 774 9903",
    position: "Line Cook",
    jobId: "line-cook",
    appliedAt: "2026-07-24 16:48",
    score: 91,
    status: "fit",
    stage: "Offer",
    source: "Online Portal",
    entities: [
      { label: "SKILL", value: "Hot Kitchen" },
      { label: "CERT", value: "TESDA Cookery NC II" },
      { label: "CERT", value: "Food Handler" },
      { label: "ORG", value: "Seaside Grill" },
    ],
    breakdown: [
      { criterion: "Skills", score: 36 },
      { criterion: "Work Experience", score: 27 },
      { criterion: "Educational Background", score: 18 },
      { criterion: "Certifications", score: 10 },
    ],
    flags: [],
    summary: "Certified cook with four years hot-kitchen experience across two hotel outlets.",
  },
  {
    id: "APP-1035",
    name: "Jompaks Berdugo",
    email: "jompaks.berdugo@email.com",
    phone: "0933 552 1180",
    position: "Bartender",
    jobId: "bartender",
    appliedAt: "2026-07-24 14:22",
    score: 84,
    status: "fit",
    stage: "Assessed",
    source: "Facebook",
    entities: [
      { label: "SKILL", value: "Mixology" },
      { label: "CERT", value: "TESDA Bartending NC II" },
      { label: "ORG", value: "Sky Lounge BGC" },
    ],
    breakdown: [
      { criterion: "Skills", score: 32 },
      { criterion: "Work Experience", score: 25 },
      { criterion: "Educational Background", score: 17 },
      { criterion: "Certifications", score: 10 },
    ],
    flags: [],
    summary: "Rooftop bar experience with strong signature-cocktail portfolio.",
  },
  {
    id: "APP-1034",
    name: "Mark Reyes",
    email: "mark.reyes@email.com",
    phone: "0908 441 2277",
    position: "Housekeeping Attendant",
    jobId: "housekeeping-attendant",
    appliedAt: "2026-07-24 11:05",
    score: 69,
    status: "other-role",
    stage: "Screened",
    source: "Walk-in",
    entities: [
      { label: "SKILL", value: "Maintenance" },
      { label: "SKILL", value: "Laundry Operations" },
    ],
    breakdown: [
      { criterion: "Skills", score: 24 },
      { criterion: "Work Experience", score: 21 },
      { criterion: "Educational Background", score: 14 },
      { criterion: "Certifications", score: 10 },
    ],
    flags: ["Stronger match: Facilities Maintenance (81%)"],
    summary: "Building maintenance background; endorse to Facilities vacancy.",
  },
  {
    id: "APP-1033",
    name: "Juan De La Cruz",
    email: "juan.delacruz@email.com",
    phone: "0912 345 6789",
    position: "HR Assistant",
    jobId: "hr-assistant",
    appliedAt: "2026-07-23 09:31",
    score: 76,
    status: "fit",
    stage: "Interview Scheduled",
    source: "Indeed",
    entities: [
      { label: "SKILL", value: "Recruitment" },
      { label: "EDU", value: "BS Psychology" },
      { label: "ORG", value: "Metro Staffing" },
    ],
    breakdown: [
      { criterion: "Skills", score: 28 },
      { criterion: "Work Experience", score: 23 },
      { criterion: "Educational Background", score: 18 },
      { criterion: "Certifications", score: 7 },
    ],
    flags: [],
    summary: "Agency recruitment coordinator transitioning to in-house HR.",
  },
  {
    id: "APP-1032",
    name: "Camille Ortega",
    email: "camille.ortega@email.com",
    phone: "0917 664 2219",
    position: "Front Desk Receptionist",
    jobId: "front-desk-receptionist",
    appliedAt: "2026-07-22 15:47",
    score: 93,
    status: "fit",
    stage: "Hired",
    source: "Referral",
    entities: [
      { label: "SKILL", value: "Guest Relations" },
      { label: "CERT", value: "TESDA Front Office NC II" },
      { label: "EDU", value: "BS Tourism" },
    ],
    breakdown: [
      { criterion: "Skills", score: 37 },
      { criterion: "Work Experience", score: 28 },
      { criterion: "Educational Background", score: 19 },
      { criterion: "Certifications", score: 9 },
    ],
    flags: [],
    summary: "Referred by Front Office Manager; completed practical assessment with 94%.",
  },
];

export const screeningCriteria = [
  { name: "Skills", weight: 40, enabled: true },
  { name: "Work Experience", weight: 30, enabled: true },
  { name: "Educational Background", weight: 20, enabled: true },
  { name: "Certifications", weight: 10, enabled: true },
];

const toIsoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const TODAY_ISO = toIsoDate(new Date());

export const interviewers = [
  { id: "S1", name: "Ana Ramos", role: "Front Office Manager", department: "Front Office" },
  { id: "S2", name: "Chef Gabriel Mendoza", role: "F&B Director", department: "Food & Beverage" },
  { id: "S3", name: "Lourdes Bautista", role: "Executive Housekeeper", department: "Housekeeping" },
  { id: "S4", name: "Juan Dela Cruz", role: "HR Officer", department: "Administration / HR" },
];

export type PassFail = "Passed" | "Failed";

export type Facility = {
  id: string;
  dbId?: number;
  name: string;
  type: "On-site" | "Virtual";
  location: string;
  capacity: number;
  icon: "room" | "online";
  description: string;
};

/**
 * Mock facilities — mirrors the `facilities` table seeded by the
 * 2026_09_05_000001_create_facilities_table migration (Room 1-3 for on-site
 * interviews and the Online Interview virtual room).
 */
export const facilities: Facility[] = [
  {
    id: "FAC-1",
    dbId: 1,
    name: "Room 1",
    type: "On-site",
    location: "Oxford Suites Makati, HR Office, 3rd Floor",
    capacity: 1,
    icon: "room",
    description: "Primary on-site interview room with guest-facing setup.",
  },
  {
    id: "FAC-2",
    dbId: 2,
    name: "Room 2",
    type: "On-site",
    location: "Oxford Suites Makati, HR Office, 3rd Floor",
    capacity: 1,
    icon: "room",
    description: "Secondary on-site interview room for panel interviews.",
  },
  {
    id: "FAC-3",
    dbId: 3,
    name: "Room 3",
    type: "On-site",
    location: "Oxford Suites Makati, HR Office, 3rd Floor",
    capacity: 2,
    icon: "room",
    description: "Practical demonstration room for hands-on assessments.",
  },
  {
    id: "FAC-4",
    dbId: 4,
    name: "Online Interview",
    type: "Virtual",
    location: "meet.oxfordsuites.ph/interview-room",
    capacity: 5,
    icon: "online",
    description: "Virtual interview room hosted on the company meeting platform.",
  },
];

export const getFacilityById = (dbId?: number | null) =>
  facilities.find((f) => f.dbId === dbId) ?? null;

export type FacilityStatus =
  "Not Required" | "Waiting for Facility Approval" | "Facility Approved" | "Facility Declined";

export type Interview = {
  id: string;
  dbId?: number;
  applicant: string;
  position: string;
  date: string;
  time: string;
  mode: "On-site" | "Virtual";
  interviewer: string;
  status: "Scheduled" | "Completed" | "Cancelled" | "No Show";
  /** Reserved facility for this schedule (request facility feature). */
  facilityName?: string | null;
  facilityStatus?: FacilityStatus;
};

export const interviews: Interview[] = [
  {
    id: "INT-201",
    applicant: "Bianca Soriano",
    position: "Front Desk Receptionist",
    date: "2026-07-28",
    time: "09:00 AM",
    mode: "On-site",
    interviewer: "Ana Ramos",
    status: "Scheduled",
    facilityName: "Room 1",
    facilityStatus: "Facility Approved",
  },
  {
    id: "INT-202",
    applicant: "Juan De La Cruz",
    position: "HR Assistant",
    date: "2026-07-28",
    time: "01:30 PM",
    mode: "Virtual",
    interviewer: "Juan Dela Cruz",
    status: "Scheduled",
    facilityName: "Online Interview",
    facilityStatus: "Facility Approved",
  },
  {
    id: "INT-203",
    applicant: "Jompaks Berdugo",
    position: "Bartender",
    date: "2026-07-29",
    time: "04:00 PM",
    mode: "On-site",
    interviewer: "Chef Gabriel Mendoza",
    status: "Scheduled",
    facilityName: "Room 2",
    facilityStatus: "Waiting for Facility Approval",
  },
  {
    id: "INT-204",
    applicant: "Kevin Dela Cruz",
    position: "Line Cook",
    date: "2026-07-30",
    time: "10:00 AM",
    mode: "On-site",
    interviewer: "Chef Gabriel Mendoza",
    status: "Completed",
    facilityName: "Room 3",
    facilityStatus: "Facility Approved",
  },
  {
    id: "INT-205",
    applicant: "Marjun Devera",
    position: "Restaurant Server",
    date: "2026-07-31",
    time: "02:00 PM",
    mode: "On-site",
    interviewer: "Ana Ramos",
    status: "Scheduled",
    facilityName: "Room 1",
    facilityStatus: "Facility Approved",
  },
];

/** Assessment test row — job-specific test after the interview assessment. */
export type AssessmentTestRow = {
  id: string;
  dbId?: number;
  applicantId: string;
  name: string;
  position: string;
  title: string;
  questions: { question: string; points: number }[];
  scores: Record<string, number>;
  total: number;
  passing: number;
  result: PassFail;
  date: string;
  remarks: string;
};

/** Practical assessment row — position-based hands-on exam. */
export type PracticalTestRow = {
  id: string;
  dbId?: number;
  applicantId: string;
  name: string;
  position: string;
  taskTitle: string;
  criteria: { criterion: string; maxPoints: number; comment?: string | null }[];
  scores: Record<string, number>;
  total: number;
  result: PassFail;
  date: string;
  remarks: string;
};

export type FinalRecommendation =
  "Recommended for Hire" | "For Another Position" | "Not Recommended";

/** Final evaluation row — whole-process verdict with a stage snapshot. */
export type FinalEvaluationRow = {
  id: string;
  dbId?: number;
  applicantId: string;
  name: string;
  position: string;
  screeningScore: number | null;
  screeningStatus: string | null;
  interviewScore: number | null;
  interviewResult: PassFail | null;
  assessmentTestScore: number | null;
  assessmentTestResult: PassFail | null;
  practicalRequired: boolean;
  practicalTestScore: number | null;
  practicalTestResult: PassFail | null;
  recommendation: FinalRecommendation;
  overallRemarks: string;
  date: string;
  /** Evaluator recorded with the final evaluation (name + system user id). */
  evaluatedBy?: string | null;
  evaluatedById?: number | null;
};

/** Verification document uploaded against the resume/CV content. */
export type VerificationDocType = "COE" | "Certificate" | "Credential" | "Others";

export type ApplicantDocumentDoc = {
  id: string;
  dbId?: number;
  applicantId: string;
  docType: VerificationDocType;
  title: string;
  originalCopy: boolean;
  fileName: string;
  uploadedAt: string;
};

/**
 * What each document type verifies in the resume/CV:
 * COE proves employment claims, Certificates/Credentials prove training and
 * qualification claims, Others covers awards, portfolios and similar proofs.
 */
export const VERIFICATION_DOC_TYPES: {
  type: VerificationDocType;
  label: string;
  verifies: string;
}[] = [
  {
    type: "COE",
    label: "COE (Certificate of Employment)",
    verifies: "Proves the work experience and job titles claimed in the resume.",
  },
  {
    type: "Certificate",
    label: "Certificate of Training",
    verifies: "Proves the trainings and seminars claimed in the resume.",
  },
  {
    type: "Credential",
    label: "Credentials (Diploma, License, TOR)",
    verifies: "Proves the educational attainment and licenses claimed in the resume.",
  },
  {
    type: "Others",
    label: "Others (Awards, Portfolio)",
    verifies: "Supports achievements, awards and other resume claims.",
  },
];

/** Default criteria for the position-based practical assessment. Each criterion
 *  is rated on the same 1-5 scale as the interview (Rate dropdown "n / 5"). */
export const DEFAULT_PRACTICAL_CRITERIA = [
  { criterion: "Task Execution & Accuracy", maxPoints: 5 },
  { criterion: "Position-Specific Skill", maxPoints: 5 },
  { criterion: "Work Standards & Procedures", maxPoints: 5 },
  { criterion: "Time Management", maxPoints: 5 },
];

/**
 * Positions designated to take a practical assessment. The database flag
 * (`job_posts.requires_practical`) is authoritative when the API reports it —
 * pass it as `dbFlag`; this list is the fallback for posts that were never
 * configured, and mirrors `PracticalRequirement::POSITIONS` on the backend so
 * the UI never offers a practical the API will refuse to save.
 */
export const PRACTICAL_POSITIONS = [
  "Line Cook",
  "Bartender",
  "Front Desk Receptionist",
  "Restaurant Server",
];

export const requiresPractical = (position: string, dbFlag?: boolean | null) =>
  dbFlag === true || PRACTICAL_POSITIONS.includes(position);

/** Top-candidate tiers per the ranking rules:
 * 1 — completed proof of resume content (COE/certificates/credentials/others,
 *     all original copies) and perfect for the job
 * 2 — a few proofs (not completed) but original copies and perfect for the job
 * 3 — perfect for the job even without proof of content
 */
export type TopCandidateTier = 1 | 2 | 3;

export const topCandidateTierMeta: Record<TopCandidateTier, { label: string; className: string }> =
  {
    1: { label: "Top Candidate", className: "bg-gold text-gold-foreground" },
    2: { label: "Strong Candidate", className: "bg-primary/15 text-primary border-primary/30" },
    3: { label: "Perfect for the Job", className: "bg-success/15 text-success border-success/30" },
  };

/**
 * Computes the top-candidate tier from the screening status and the uploaded
 * verification documents (COE / Certificate / Credential / Others, original
 * copies). Falls back to tier 3 when the position is only "perfect for the
 * job" without any proof of content.
 */
export const computeTopCandidateTier = (
  status: ApplicantStatus,
  docs: { docType: VerificationDocType; originalCopy: boolean }[],
): TopCandidateTier => {
  if (status !== "fit") return 3;
  const completed = ["COE", "Certificate", "Credential"].every((required) =>
    docs.some((d) => d.docType === required && d.originalCopy),
  );
  if (completed) return 1;
  if (docs.length > 0) return 2;
  return 3;
};

export const assessmentCriteria = [
  "Guest Service Orientation",
  "Communication Skills",
  "Technical / Practical Skill",
  "Grooming & Professionalism",
  "Availability & Flexibility",
];

export type AuditActionType =
  | "Interview Booked"
  | "Interview Scheduled"
  | "Interview Completed"
  | "Interview Cancelled"
  | "Interview Rescheduled"
  | "Interview No-Show"
  | "Facility Request Approved"
  | "Applicant Accepted"
  | "Applicant Rejected"
  | "Applicant Transferred"
  | "Assessment Started"
  | "Assessment Completed"
  | "Assessment Accepted"
  | "Assessment Rejected"
  | "Assessment Test Recorded"
  | "Practical Assessment Recorded"
  | "Final Evaluation Completed"
  | "Verification Document Uploaded"
  | "Status Change"
  | "Applicant Added";

export type AuditEntry = {
  id: string;
  date: string;
  time: string;
  actorName: string;
  actorPosition: string;
  actorDepartment: string;
  actionType: AuditActionType;
  target: string;
  module: string;
  details: string;
};

/**
 * @deprecated Mock audit log removed — History & Audit is now fully backed by the database.
 * The `audit_logs` table is populated server-side via `App\Services\AuditLogger`
 * (see `backend-laravel/app/Services/AuditLogger.php` and all
 * `ApplicantManagement` controllers). Frontend fetches live data via
 * `auditLogApi.list({ module: "Applicant Management" })` and no longer falls
 * back to this mock. Kept as empty array for backward-compat type safety.
 */
export const applicantAuditLog: AuditEntry[] = [];
