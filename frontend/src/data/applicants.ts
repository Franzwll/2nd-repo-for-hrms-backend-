export type ApplicantStatus = "fit" | "other-role" | "credential" | "not-fit";

/** Latest full spaCy screening record returned by the backend. */
export type ScreeningDetail = {
  processing_status?: string;
  screening_result?: string | null;
  match_score?: number | null;
  score_breakdown?: Record<
    string,
    {
      earned?: number;
      max?: number;
      matched_required?: string[];
      missing_required?: string[];
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
    "Screened" | "Interview Scheduled" | "Assessed" | "Offer" | "Hired" | "Rejected" | "Accepted";
  source: "Online Portal" | "Walk-in" | "Referral" | "Indeed" | "Facebook";
  entities: { label: string; value: string }[];
  breakdown: { criterion: string; score: number }[];
  flags: string[];
  summary: string;
  screening_detail?: ScreeningDetail | null;
  resumeUrl?: string | null;
  resumeOriginalName?: string | null;
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

export type Interview = {
  id: string;
  dbId?: number;
  applicant: string;
  position: string;
  date: string;
  time: string;
  mode: "On-site" | "Virtual";
  interviewer: string;
  status: "Scheduled" | "Completed" | "No Show";
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
  },
];

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
  | "Applicant Accepted"
  | "Applicant Rejected"
  | "Applicant Transferred"
  | "Assessment Started"
  | "Assessment Completed"
  | "Assessment Accepted"
  | "Assessment Rejected"
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
