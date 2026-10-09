import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart3,
  BookMarked,
  Briefcase,
  Building2,
  CalendarClock,
  CalendarDays,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Circle,
  ClipboardList,
  Clock,
  GraduationCap,
  HelpCircle,
  Hourglass,
  Info,
  CheckCircle2,
  Check,
  ClipboardCheck,
  Download,
  Eye,
  ExternalLink,
  FileCheck2,
  FileText,
  Flag,
  Lock,
  Link2,
  CalendarPlus,
  History,
  Loader2,
  Mail,
  Maximize2,
  Monitor,
  MoreHorizontal,
  Pencil,
  Plus,
  Printer,
  Repeat2,
  RefreshCw,
  Save,
  ScanLine,
  Search,
  Send,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Star,
  Target,
  Trash2,
  Trophy,
  Upload,
  User,
  UserPlus,
  Users,
  Video,
  Volume2,
  Wrench,
  X,
  XCircle,
} from "lucide-react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip as RTooltip } from "recharts";
import { toast } from "sonner";

import { ListBody } from "@/components/portal/ListBody";
import { PageHeader } from "@/components/portal/PageHeader";
import { StatCard } from "@/components/portal/StatCard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TablePagination } from "@/components/ui/table-pagination";
import { usePagination } from "@/hooks/usePagination";
import { Textarea } from "@/components/ui/textarea";
import {
  DEFAULT_PRACTICAL_CRITERIA,
  FINAL_EVALUATION_WEIGHTS,
  PRACTICAL_POSITIONS,
  VERIFICATION_DOC_TYPES,
  computeTopCandidateTier,
  facilities,
  getFacilityById,
  requiresPractical,
  topCandidateTierMeta,
  type AssessmentTestRow,
  type Facility,
  type FacilityStatus,
  type FinalEvaluationRow,
  type FinalRecommendation,
  type FinalScoreBreakdownItem,
  type PassFail,
  type PracticalTestRow,
  type VerificationDocType,
} from "@/data/applicants";
import {
  assessmentCriteria,
  interviewers,
  screeningCriteria,
  statusMeta,
  TODAY_ISO,
  type Applicant,
  type ApplicantStatus,
  type AuditEntry,
  type Interview,
} from "@/data/applicants";
import { departments, positions, type NewHire } from "@/data/hr";
import { reportedEntitiesStore, type ReportedEntityType } from "@/data/reported-entities";
import {
  DEFAULT_ACCOUNT_PASSWORD,
  hireStore,
  useHires,
  useMasterChecklists,
  type ChecklistViewTarget,
} from "@/data/hires";
import { jobs } from "@/data/jobs";
import { useNavigate } from "@tanstack/react-router";
import { cn, downloadTextFile } from "@/lib/utils";
import { getUser } from "@/lib/auth";
import { SortHead, useSort } from "@/components/portal/sortable";
import {
  applicantDocumentsApi,
  applicantsApi,
  assessmentInvitesApi,
  assessmentTestsApi,
  assessmentsApi,
  auditLogApi,
  coreHcmApi,
  finalEvaluationsApi,
  facilitiesApi,
  interviewsApi,
  jobPostsApi,
  onboardingItemsApi,
  practicalTestsApi,
  screeningApi,
  settingsApi,
  type ApiApplicant,
  type ApiApplicantDocument,
  type ApiAssessmentTest,
  type ApiDocumentVerificationCheck,
  type ApiDepartment,
  type ApiFacility,
  type ApiFinalEvaluation,
  type ApiFinalEvaluationPreview,
  type ApiInterview,
  type ApiJobPost,
  type ApiPosition,
  type ApiPracticalTest,
  type ApiScreeningPreview,
  type ApiScreeningReference,
  type ApiSystemUser,
  type ScreeningReferencePayload,
} from "@/lib/api";
import {
  describeExport,
  exportReport,
  printReport,
  type ReportData,
  type ReportFormat,
} from "@/lib/report-export";
import { SecureExportDialog } from "@/components/ui/secure-export-dialog";
import {
  isValidEmail,
  isValidName,
  isValidPhone,
  sanitizeName,
  sanitizePhone,
} from "@/lib/validation";

function transformApiApplicant(a: ApiApplicant): Applicant {
  const position = a.job_post?.title || "Front Desk Receptionist";
  return {
    id: a.applicant_code || `APP-${a.applicant_id}`,
    dbId: a.applicant_id,
    name: a.name,
    email: a.email,
    phone: a.phone || "0912 345 6789",
    position,
    jobId: String(a.job_post_id),
    appliedAt: formatUtcToPH24(a.applied_at, "2026-07-25 12:00"),
    score: a.fit_score || 0,
    status: a.status,
    stage: a.stage,
    source: (a.source || "Online Portal") as any,
    entities: a.screening_entities?.map((e) => ({ label: e.label, value: e.value })) || [],
    breakdown: a.screening_scores?.map((s) => ({ criterion: s.criterion, score: s.score })) || [],
    flags: a.flags_json || [],
    summary: a.summary || "",
    screening_detail: (a.latest_screening as Applicant["screening_detail"]) ?? null,
    // Stream the resume through the API (same-origin, ?token= auth) instead of
    // the cross-origin /storage URL — browsers refuse to render cross-origin
    // files inside the review dialog's preview <iframe>/<img>, which showed
    // a blank white panel. resume_original_name keeps the file-type branches
    // (.pdf/.docx/.doc/.png) working since this URL has no extension.
    resumeUrl: a.resume_url ? applicantsApi.resumeDocumentUrl(a.applicant_id) : null,
    resumeOriginalName: (a as any).resume_original_name ?? null,
    docCount: typeof a.documents_count === "number" ? a.documents_count : 0,
    // Same rule the API enforces when a practical assessment is recorded, so the
    // stage is never offered for a position whose save would be rejected.
    requiresPractical: requiresPractical(position, a.job_post?.requires_practical),
  };
}

/** Mock resume screening result — used until real screening data exists for an applicant. */
function screeningResultFor(a: Applicant) {
  if (a.entities.length > 0) return { entities: a.entities, score: a.score };
  const keywords = keywordLibrary[a.position] ?? [];
  return {
    entities: keywords.map((k, i) => ({
      label: i === 0 ? "SKILL" : i === 1 ? "EDU" : i % 2 === 0 ? "SKILL" : "ORG",
      value: k,
    })),
    score: 78 + ((a.id.charCodeAt(0) + a.id.length * 7) % 18),
  };
}

/** Converts "HH:MM" from the API into the "HH:MM AM/PM" slot format. */
const formatApiTime = (t: string | null | undefined) => {
  if (!t) return "—";
  if (/AM|PM/i.test(t)) return t;
  const [h, m] = t.split(":").map(Number);
  const hour = h ?? 12;
  const suffix = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${String(h12).padStart(2, "0")}:${String(m ?? 0).padStart(2, "0")} ${suffix}`;
};

/** Converts a UTC ISO datetime from the API into Philippine Time
 *  (Asia/Manila, UTC+8) as "YYYY-MM-DD HH:MM" 24h. The backend stores
 *  `applied_at` as a UTC timestamp, so the raw value must be shifted or
 *  evening UTC applications would show on the wrong day. Kept 24h so
 *  string sorting stays chronological — display goes through
 *  `displayAppliedAt` for the 12h AM/PM form. */
const formatUtcToPH24 = (iso: string | null | undefined, fallback: string): string => {
  if (!iso) return fallback;
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return fallback;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(dt);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}`;
};

/** Display form of an appliedAt value — "YYYY-MM-DD hh:mm AM/PM".
 *  Pass-through when already 12h; converts legacy "YYYY-MM-DD HH:MM"
 *  24h strings (mock rows) to AM/PM. */
const displayAppliedAt = (v: string | null | undefined): string => {
  if (!v) return "—";
  if (/AM|PM/i.test(v)) return v;
  const m = v.match(/(\d{4}-\d{2}-\d{2})[ T](\d{1,2}):(\d{2})/);
  if (!m) return v;
  const hour = Number(m[2]);
  const suffix = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${m[1]} ${String(h12).padStart(2, "0")}:${m[3]} ${suffix}`;
};

function transformApiInterview(i: ApiInterview): Interview {
  return {
    id: i.interview_code || `INT-${i.interview_id}`,
    dbId: i.interview_id,
    applicant: i.applicant?.name ?? `Applicant #${i.applicant_id}`,
    position: i.applicant?.position || "Front Desk Receptionist",
    date: i.scheduled_date,
    time: formatApiTime(i.scheduled_time),
    interviewer: i.interviewer_name || "HR Officer",
    mode: i.mode,
    status: i.status,
    // Request facility feature — reserved facility + approval status
    facilityName: i.facility?.name ?? null,
    facilityStatus: (i.facility_status ?? "Not Required") as FacilityStatus,
  };
}

/** Maps an API assessment test into the local row shape. */
function transformApiAssessmentTest(a: ApiAssessmentTest): AssessmentTestRow {
  const questions = Array.isArray(a.questions_json)
    ? a.questions_json.map((q: any, idx: number) =>
        typeof q === "string"
          ? { question: q, points: 20 }
          : { question: q.question ?? `Question ${idx + 1}`, points: q.points ?? 20 },
      )
    : [];
  return {
    id: a.assessment_test_id ? `AST-${a.assessment_test_id}` : `AST-${Date.now()}`,
    dbId: a.assessment_test_id,
    applicantId: a.applicant?.applicant_code ?? `APP-${a.applicant_id}`,
    name: a.applicant?.name ?? `Applicant #${a.applicant_id}`,
    position: a.applicant?.position ?? "—",
    title: a.test_title,
    questions,
    scores: a.scores_json ?? {},
    total: Math.round(a.total_score ?? 0),
    passing: Math.round(a.passing_score ?? 75),
    result: a.result,
    date: a.test_date,
    remarks: a.remarks ?? "",
  };
}

/** Maps an API practical test into the local row shape. */
function transformApiPracticalTest(a: ApiPracticalTest): PracticalTestRow {
  const criteria = Array.isArray(a.criteria_json)
    ? a.criteria_json.map((c: any) =>
        typeof c === "string"
          ? { criterion: c, maxPoints: 25, comment: null }
          : {
              criterion: c.criterion ?? "Criterion",
              maxPoints: c.max_points ?? 25,
              comment: c.comment ?? null,
            },
      )
    : [];
  return {
    id: a.practical_test_id ? `PRT-${a.practical_test_id}` : `PRT-${Date.now()}`,
    dbId: a.practical_test_id,
    applicantId: a.applicant?.applicant_code ?? `APP-${a.applicant_id}`,
    name: a.applicant?.name ?? `Applicant #${a.applicant_id}`,
    position: a.applicant?.position ?? "—",
    taskTitle: a.task_title,
    criteria,
    scores: a.scores_json ?? {},
    total: Math.round(a.total_score ?? 0),
    result: a.result,
    date: a.test_date,
    remarks: a.remarks ?? "",
  };
}

/** Maps an API final evaluation into the local row shape. */
function transformApiFinalEvaluation(f: ApiFinalEvaluation): FinalEvaluationRow {
  return {
    id: f.final_evaluation_id ? `FIN-${f.final_evaluation_id}` : `FIN-${Date.now()}`,
    dbId: f.final_evaluation_id,
    applicantId: f.applicant?.applicant_code ?? `APP-${f.applicant_id}`,
    name: f.applicant?.name ?? `Applicant #${f.applicant_id}`,
    position: f.applicant?.position ?? "—",
    screeningScore: f.screening_score,
    screeningStatus: f.screening_status,
    interviewScore: f.interview_score,
    interviewResult: f.interview_result,
    assessmentTestScore: f.assessment_test_score,
    assessmentTestResult: f.assessment_test_result,
    practicalRequired: f.practical_required,
    practicalTestScore: f.practical_test_score,
    practicalTestResult: f.practical_test_result,
    overallScore: f.overall_score ?? null,
    overallScoreRounded: f.overall_score_rounded ?? (f.overall_score != null ? Math.round(f.overall_score * 10) / 10 : null),
    scoreBreakdown: (f.score_breakdown as FinalScoreBreakdownItem[] | null) ?? null,
    recommendation: f.recommendation,
    recommendedJobPostId: f.recommended_job_post_id ?? null,
    recommendedPositionTitle: f.recommended_position_title ?? null,
    overallRemarks: f.overall_remarks ?? "",
    date: f.evaluation_date,
    evaluatedById: f.evaluated_by_user_id ?? null,
  };
}

/** Fetches every page of a paginated list endpoint (`{ data, meta }` shape) so
 *  older records are never cut off by the page size. The interview index orders
 *  newest-first, so past-date bookings used to fall off page 1 and their
 *  Reschedule buttons disappeared from the View profile and the pipeline
 *  Actions menu — this walks all pages instead. */
async function fetchAllPages<T>(
  list: (params?: Record<string, any>) => Promise<{ data: T[]; meta: any }>,
  params?: Record<string, any>,
  perPage = 500,
): Promise<T[]> {
  const all: T[] = [];
  let page = 1;
  for (;;) {
    const res = await list({ ...params, per_page: perPage, page });
    const items = res?.data ?? [];
    all.push(...items);
    const lastPage = (res?.meta as { last_page?: number } | undefined)?.last_page ?? 1;
    if (page >= lastPage || items.length === 0) break;
    page += 1;
    if (page > 50) break; // safety cap: 50 x 500 records
  }
  return all;
}

/** Badge tone per audit action type in the History & Audit log. */
const auditBadgeClass = (action: string) => {
  if (/Accepted|Completed/.test(action)) return "border-success/40 bg-success/10 text-success";
  if (/Rejected|Cancelled|No-Show/.test(action))
    return "border-destructive/40 bg-destructive/10 text-destructive";
  if (/Booked|Scheduled|Started/.test(action))
    return "border-primary/40 bg-primary/10 text-primary";
  if (/Transferred|Status Change/.test(action))
    return "border-warning/40 bg-warning/10 text-warning";
  return "border-border bg-secondary text-secondary-foreground";
};

const statusChartColor: Record<ApplicantStatus, string> = {
  fit: "var(--color-success)",
  "other-role": "var(--color-warning)",
  credential: "var(--color-caution)",
  "not-fit": "var(--color-destructive)",
};

const tooltipStyle = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius)",
  fontSize: 12,
};

/** Keyword library suggested per job position for the screening setup checklist. */
export const keywordLibrary: Record<string, string[]> = {
  "Front Desk Receptionist": [
    "Guest Relations",
    "Opera PMS",
    "Check-in / Check-out",
    "TESDA Front Office NC II",
    "Cash Handling",
    "Reservations",
  ],
  "Guest Relations Officer": [
    "Guest Relations",
    "Complaint Handling",
    "VIP Handling",
    "BS Tourism",
    "Multilingual",
  ],
  "Restaurant Server": [
    "Table Service",
    "POS Systems",
    "Banquet Service",
    "Food Safety",
    "Upselling",
  ],
  Bartender: ["Mixology", "TESDA Bartending NC II", "Inventory", "Cocktail Craft", "Bar Hygiene"],
  "Line Cook": [
    "Hot Kitchen",
    "TESDA Cookery NC II",
    "Food Handler",
    "HACCP",
    "Mise en Place",
    "Plating",
  ],
  "Pastry Chef": ["Pastry", "Baking", "Dessert Plating", "Culinary Arts Diploma", "HACCP"],
  "Housekeeping Attendant": [
    "Room Turnover",
    "Linen Handling",
    "Chemical Safety",
    "Public Area Cleaning",
    "TESDA Housekeeping NC II",
  ],
  "HR Assistant": [
    "Recruitment",
    "201 Files",
    "Payroll Support",
    "BS Psychology",
    "DOLE Compliance",
  ],
};

const suggestedSlots = [
  { date: "2026-08-03", times: ["09:00 AM", "10:30 AM", "02:00 PM"] },
  { date: "2026-08-04", times: ["09:00 AM", "01:30 PM"] },
  { date: "2026-08-05", times: ["10:00 AM", "03:00 PM", "04:30 PM"] },
  { date: "2026-08-06", times: ["09:30 AM", "02:30 PM"] },
];

/** Day-of-week names aligned with Date.prototype.getDay() (0 = Sunday). */
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Default schedulable interview days, overridable in Slot Settings. */
const DEFAULT_SCHEDULABLE_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

type AssessmentResult = {
  applicantId: string;
  dbId?: number;
  name: string;
  position: string;
  scores: Record<string, number>;
  /** Per-criterion comment recorded by the assessor. */
  comments: Record<string, string>;
  total: number;
  /** Assessor's explicit verdict — Passed or Failed. */
  result: PassFail;
  /** The "Overall Evaluation" text (formerly interviewer remarks). */
  remarks: string;
  date: string;
  outcome: "Recommended" | "Hold" | "Not Recommended";
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

/** Resolves which facility an interview occupies — by its reserved room name,
 *  falling back to the virtual room for online interviews. On-site interviews
 *  without a reserved room resolve to null (unassigned). */
const facilityOfInterview = (i: Interview): Facility | null => {
  const byName = facilities.find((f) => f.name === i.facilityName);
  if (byName) return byName;
  if (i.mode === "Virtual") return facilities.find((f) => f.type === "Virtual") ?? null;
  return null;
};

/** Front-view door icon in the style of the Places reference (green when reserved). */
function DoorIcon({ highlighted, className }: { highlighted: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 48 72" className={className ?? "h-16 w-12"} aria-hidden="true">
      <rect
        x="7"
        y="4"
        width="34"
        height="64"
        rx="2"
        fill={highlighted ? "#15803d" : "transparent"}
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <rect
        x="13"
        y="10"
        width="22"
        height="52"
        rx="1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        opacity="0.65"
      />
      <circle cx="31" cy="40" r="2.2" fill={highlighted ? "#ffffff" : "currentColor"} />
    </svg>
  );
}

/** Normalizes extracted contact numbers to plain local form:
 *  strips "-" and spaces, converts a leading +63 to 0
 *  ("+63 917-403-8821" -> "09174038821"). Returns null when unusable. */
function normalizePHPhone(raw?: string | null): string | null {
  if (!raw) return null;
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("63") && digits.length === 12) {
    digits = "0" + digits.slice(2);
  }
  if (digits.length < 7 || digits.length > 15) return null;
  return digits;
}

const reportOptions = [
  {
    id: "all",
    title: "All Applicants",
    description: "Complete list of every applicant on record with status and stage.",
  },
  {
    id: "status",
    title: "By Status",
    description: "Breakdown of applicants grouped by screening status.",
  },
  {
    id: "position",
    title: "By Position",
    description: "Applicant counts and pass rates segmented per job position.",
  },
  {
    id: "screening",
    title: "Screening Results",
    description: "Detailed NER screening scores, keywords and flags for each resume.",
  },
  {
    id: "interview",
    title: "Interview Summary",
    description: "Scheduled, completed and upcoming interviews with outcomes.",
  },
];

const isoOf = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const timeOf = (d: Date) =>
  d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

const CURRENT_ACTOR = {
  name: "Juan Dela Cruz",
  position: "HR Officer",
  department: "Administration / HR",
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const yearOptions = Array.from({ length: 11 }, (_, i) => 2021 + i);

/** Default interview slot configuration — 14 interviewers / rooms, 14 time slots, on-site. */
const DEFAULT_SLOT_SETTINGS = {
  capacityPerSlot: 14,
  interviewersAvailable: 14,
  roomsAvailable: 14,
  slotCount: 14,
  startTime: "08:00",
  intervalMinutes: 30,
  allowWalkIn: true,
  defaultMode: "On-site" as "On-site" | "Virtual",
  breakEnabled: true,
  breakStart: "12:00",
  breakEnd: "13:00",
};

/** Parses "HH:MM" into minutes-from-midnight. */
const parseTimeToMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

/** Formats minutes-from-midnight into a 12-hour "hh:mm AM/PM" label. */
const formatMinutesAsTime = (mins: number) => {
  const total = ((mins % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(total / 60);
  const m = total % 60;
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${suffix}`;
};

/** Builds the day's time slots from a start time, interval and slot count. */
const buildTimeSlots = (startTime: string, intervalMinutes: number, count: number) => {
  const [h, m] = startTime.split(":").map(Number);
  const base = (h ?? 8) * 60 + (m ?? 0);
  return Array.from({ length: Math.max(1, count) }, (_, i) => {
    const total = (base + i * Math.max(5, intervalMinutes)) % (24 * 60);
    const hour24 = Math.floor(total / 60);
    const minute = total % 60;
    const suffix = hour24 >= 12 ? "PM" : "AM";
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    return `${String(hour12).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${suffix}`;
  });
};

/** Builds the full daily schedule (start/end minutes + labels), flagging any slot that overlaps the break window. */
const buildSlotSchedule = (
  startTime: string,
  intervalMinutes: number,
  count: number,
  breakEnabled: boolean,
  breakStart: string,
  breakEnd: string,
) => {
  const [h, m] = startTime.split(":").map(Number);
  const base = (h ?? 8) * 60 + (m ?? 0);
  const step = Math.max(5, intervalMinutes);
  const breakStartMin = parseTimeToMinutes(breakStart);
  const breakEndMin = parseTimeToMinutes(breakEnd);
  return Array.from({ length: Math.max(1, count) }, (_, i) => {
    const startMin = base + i * step;
    const endMin = startMin + step;
    const isBreak = breakEnabled && startMin < breakEndMin && endMin > breakStartMin;
    return {
      startMin,
      endMin,
      label: formatMinutesAsTime(startMin),
      endLabel: formatMinutesAsTime(endMin),
      isBreak,
    };
  });
};

/** Minimal structural shape shared by ApiScreening and ScreeningDetail. */
type ScreeningAnalysisDetail = {
  missing_information?: string[];
  validation?: {
    job_role_analysis?: { recognized?: string[]; unrecognized?: string[] };
    credential_issues?: { type: string; detail: string; note?: string }[];
    credential_verification?: {
      flags?: { check: string; severity: "WARNING" | "INFO"; detail: string; evidence?: any }[];
      warning_count?: number;
      info_count?: number;
      risk_level?: "LOW" | "MEDIUM" | "HIGH";
      score_penalty?: number;
      escalate_invalid?: boolean;
      summary?: string;
    };
  };
} | null;

function ScreeningAnalysisRow({
  label,
  children,
  labelClassName,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  labelClassName?: string | undefined;
}) {
  return (
    <div className="flex items-start justify-between gap-3 p-3">
      <p className={cn("w-36 shrink-0 text-xs font-medium text-muted-foreground", labelClassName)}>
        {label}
      </p>
      <div className="flex-1 text-sm">{children}</div>
    </div>
  );
}

/**
 * SOP-2 screening analysis surfaces (missing essential information, job-role
 * recognition, credential analysis) — intentionally hidden. The detailed
 * breakdown bars and "Why this result" reasons in the Screening Details
 * accordion remain the single explanation surface.
 */
export function ScreeningAnalysisSections({
  detail,
  className,
}: {
  detail: ScreeningAnalysisDetail | null | undefined;
  className?: string;
}) {
  void detail;
  void className;
  return null;
}

/* ------------------------------------------------------------------ */
/* Resume Screening redesign — shared presentational building blocks   */
/* used by View profile → Resume & Documents and the Review dialog.    */
/* Layout follows the approved mockups; colors/fonts use the design    */
/* system tokens only (success / destructive / primary / gold-soft).   */
/* ------------------------------------------------------------------ */

export type ScreeningRequirementState = "found" | "meets" | "missing";

export type ScreeningRequirementRow = {
  label: string;
  state: ScreeningRequirementState;
  group: "skills" | "experience" | "education" | "certifications";
  hint?: string;
};

function screeningDonutTone(score: number): string {
  if (score >= 75) return "text-success";
  if (score >= 55) return "text-caution";
  return "text-destructive";
}

/** Circular match-score ring from the mockups (donut + % + "Match"). */
export function ScreeningScoreDonut({ score, size = 132 }: { score: number; size?: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(score))) / 100;
  const r = 54;
  const c = 2 * Math.PI * r;
  return (
    <div
      className={cn("relative shrink-0", screeningDonutTone(score))}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${Math.round(score)} percent match`}
    >
      <svg viewBox="0 0 132 132" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="66" cy="66" r={r} fill="none" stroke="var(--color-muted)" strokeWidth="12" />
        <circle
          cx="66"
          cy="66"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${c * pct} ${c}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-[1.65rem] font-bold leading-none text-foreground">
          {Math.round(score)}%
        </span>
        <span className="mt-1 text-[0.7rem] font-semibold text-muted-foreground">Match</span>
      </div>
    </div>
  );
}

function screeningVerdictCopy(
  status: ApplicantStatus,
  score: number,
): { title: string; subtitle: string } {
  if (status === "fit" && score >= 95)
    return {
      title: "Perfect for the job!",
      subtitle: "All key requirements are matched. This applicant meets the job qualifications.",
    };
  if (status === "fit")
    return {
      title: "Strong match with the requirements",
      subtitle: "for this position.",
    };
  if (status === "other-role")
    return {
      title: "Better fit for another role",
      subtitle: "Some requirements match, but the profile aligns more strongly elsewhere.",
    };
  if (status === "credential")
    return {
      title: "Needs credential review",
      subtitle: "A required certification or credential could not be verified automatically.",
    };
  return {
    title: "Below the role requirements",
    subtitle: "Key requirements are missing for this position.",
  };
}

function screeningVerdictTone(
  status: ApplicantStatus,
  score: number,
): {
  bar: string;
  iconWrap: string;
  title: string;
} {
  if (status === "fit" || (status !== "not-fit" && score >= 75))
    return {
      bar: "border-success/20 bg-success/5",
      iconWrap: "bg-success text-success-foreground",
      title: "text-success",
    };
  if (status === "other-role")
    return {
      bar: "border-warning/30 bg-warning/10",
      iconWrap: "bg-warning text-warning-foreground",
      title: "text-warning-foreground",
    };
  if (status === "credential")
    return {
      bar: "border-caution/25 bg-caution/5",
      iconWrap: "bg-caution text-caution-foreground",
      title: "text-caution",
    };
  return {
    bar: "border-destructive/20 bg-destructive/5",
    iconWrap: "bg-destructive text-destructive-foreground",
    title: "text-destructive",
  };
}

/** Green verdict banner beside the donut ("Strong match…", "Perfect for the job!"). */
export function ScreeningVerdictBanner({
  status,
  score,
}: {
  status: ApplicantStatus;
  score: number;
}) {
  const copy = screeningVerdictCopy(status, score);
  const tone = screeningVerdictTone(status, score);
  return (
    <div className={cn("flex items-start gap-3 rounded-lg border p-3.5", tone.bar)}>
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          tone.iconWrap,
        )}
      >
        <Check className="h-4 w-4" strokeWidth={3} />
      </span>
      <div className="min-w-0">
        <p className={cn("text-sm font-semibold leading-snug", tone.title)}>{copy.title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{copy.subtitle}</p>
      </div>
    </div>
  );
}

type ScreeningTone = "success" | "destructive" | "primary" | "gold";

const screeningToneClass: Record<ScreeningTone, { card: string; value: string; label: string }> = {
  success: {
    card: "border-success/20 bg-success/5",
    value: "text-success",
    label: "text-success/80",
  },
  destructive: {
    card: "border-destructive/20 bg-destructive/5",
    value: "text-destructive",
    label: "text-destructive/80",
  },
  primary: {
    card: "border-primary/20 bg-primary/5",
    value: "text-primary",
    label: "text-primary/80",
  },
  gold: {
    card: "border-gold/30 bg-gold-soft dark:bg-gold/15",
    value: "text-gold-foreground dark:text-gold",
    label: "text-gold-foreground/70 dark:text-gold/70",
  },
};

/** Single stat tile (value + label) — composes the profile grid and modal strip. */
function ScreeningStatTile({
  icon,
  value,
  valueTitle,
  label,
  tone,
  small,
  className,
}: {
  icon?: React.ReactNode;
  value: React.ReactNode;
  valueTitle?: string;
  label: string;
  tone: ScreeningTone;
  small?: boolean;
  className?: string;
}) {
  const t = screeningToneClass[tone];
  return (
    <div className={cn("h-full rounded-lg border p-3", t.card, className)}>
      <p
        className={cn(
          "flex items-center gap-1.5 font-bold leading-none",
          small ? "text-sm leading-tight" : "text-lg",
          t.value,
        )}
      >
        {icon}
        <span className="truncate" title={valueTitle}>
          {value}
        </span>
      </p>
      <p className={cn("mt-1.5 text-[0.7rem] font-medium leading-tight", t.label)}>{label}</p>
    </div>
  );
}

/** Compact verdict card for the single-row modal strip (latest mockup). */
function ScreeningVerdictMini({
  status,
  score,
  className,
}: {
  status: ApplicantStatus;
  score: number;
  className?: string;
}) {
  const copy = screeningVerdictCopy(status, score);
  const tone = screeningVerdictTone(status, score);
  return (
    <div className={cn("h-full rounded-lg border p-3", tone.bar, className)}>
      <p className={cn("flex items-center gap-1.5 text-sm font-bold leading-tight", tone.title)}>
        <span
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
            tone.iconWrap,
          )}
        >
          <Check className="h-3 w-3" strokeWidth={3} />
        </span>
        <span>{copy.title}</span>
      </p>
      <p className="mt-1.5 text-[0.7rem] leading-snug text-muted-foreground">{copy.subtitle}</p>
    </div>
  );
}

/**
 * Renders the NLP experience estimate the way HR reads it: whole years plus the
 * remaining months ("10 years 4 months") instead of a rounded decimal such as
 * "10.3 years". The total already counts every employment period inclusively
 * (see entity_extraction._estimate_experience).
 */
export function formatExperienceYears(years: number | null | undefined): string {
  if (years === null || years === undefined || Number.isNaN(years)) return "—";
  const totalMonths = Math.round(years * 12);
  if (totalMonths <= 0) return "—";
  const yrs = Math.floor(totalMonths / 12);
  const mos = totalMonths % 12;
  const yLabel = `${yrs} year${yrs === 1 ? "" : "s"}`;
  const mLabel = `${mos} month${mos === 1 ? "" : "s"}`;
  if (yrs === 0) return mLabel;
  return mos === 0 ? yLabel : `${yLabel} ${mLabel}`;
}

/** Four stat tiles under the banner: matched / missing / experience / education. */
export function ScreeningStatTiles({
  matchedCount,
  missingCount,
  yearsExperience,
  educationLabel,
  matchedLabel = "Matched Requirements",
  missingLabel = "Missing Requirements",
  showIcons = true,
}: {
  matchedCount: number;
  missingCount: number;
  yearsExperience: number | null;
  educationLabel: string;
  matchedLabel?: string;
  missingLabel?: string;
  showIcons?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <ScreeningStatTile
        icon={showIcons ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : undefined}
        value={matchedCount}
        label={matchedLabel}
        tone="success"
      />
      <ScreeningStatTile
        icon={showIcons ? <XCircle className="h-4 w-4 shrink-0" /> : undefined}
        value={missingCount}
        label={missingLabel}
        tone="destructive"
      />
      <ScreeningStatTile
        icon={showIcons ? <CalendarDays className="h-4 w-4 shrink-0" /> : undefined}
        value={yearsExperience !== null ? formatExperienceYears(yearsExperience) : "—"}
        label="Experience"
        tone="primary"
      />
      <ScreeningStatTile
        icon={showIcons ? <GraduationCap className="h-4 w-4 shrink-0" /> : undefined}
        value={educationLabel}
        valueTitle={educationLabel}
        label="Education"
        tone="gold"
        small
      />
    </div>
  );
}

/** Single-row summary strip for the review dialog: donut + verdict + 4 tiles. */
export function ScreeningModalSummary({
  status,
  score,
  matchedCount,
  missingCount,
  yearsExperience,
  educationLabel,
}: {
  status: ApplicantStatus;
  score: number;
  matchedCount: number;
  missingCount: number;
  yearsExperience: number | null;
  educationLabel: string;
}) {
  const years = yearsExperience !== null ? formatExperienceYears(yearsExperience) : "—";
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-col items-center gap-4 xl:flex-row">
        <ScreeningScoreDonut score={score} size={132} />
        <div className="grid w-full min-w-0 flex-1 grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <div className="col-span-2 md:col-span-3 xl:col-span-2">
            <ScreeningVerdictMini status={status} score={score} />
          </div>
          <ScreeningStatTile
            icon={<CheckCircle2 className="h-4 w-4 shrink-0" />}
            value={matchedCount}
            label="Matched Keywords"
            tone="success"
          />
          <ScreeningStatTile
            icon={<XCircle className="h-4 w-4 shrink-0" />}
            value={missingCount}
            label="Missing Keywords"
            tone="destructive"
          />
          <ScreeningStatTile
            icon={<CalendarDays className="h-4 w-4 shrink-0" />}
            value={years}
            label="Experience"
            tone="primary"
          />
          <ScreeningStatTile
            icon={<GraduationCap className="h-4 w-4 shrink-0" />}
            value={educationLabel}
            valueTitle={educationLabel}
            label="Education"
            tone="gold"
            small
          />
        </div>
      </div>
    </div>
  );
}

/** How supporting documents changed the ranking percentage.
 *
 *  The percentage HR ranks by is a RANKING score: the NLP service blends the
 *  resume match score with the supporting-document verification evidence
 *  (VERIFIED = 100, UNABLE_TO_VERIFY = 50, DISCREPANCY_FOUND = 0 at a 15%
 *  weighting). This strip keeps that arithmetic visible instead of hiding it
 *  behind one number: resume score → documents score → ranking score. */
export function ScreeningVerificationImpact({
  verification,
  resumeScore,
  score,
  onRecompute,
  recomputing = false,
}: {
  verification: ScreeningEvidence | null;
  resumeScore: number;
  score: number;
  onRecompute?: (() => void) | undefined;
  recomputing?: boolean | undefined;
}) {
  const status = (verification?.status ?? "NOT_PROVIDED").toUpperCase();
  const decisive = ["VERIFIED", "PARTIAL", "DISCREPANCY"].includes(status);
  const weight = Math.round((verification?.weight ?? 0.15) * 100);
  const documentsScore =
    verification?.documents_score !== null && verification?.documents_score !== undefined
      ? Math.round(verification.documents_score)
      : null;
  const movement = Math.round((score - resumeScore) * 10) / 10;

  const tone: { wrap: string; chip: string; label: string } =
    status === "VERIFIED"
      ? {
          wrap: "border-success/25 bg-success/5",
          chip: "border-success/25 bg-success/10 text-success",
          label: "Documents verified",
        }
      : status === "DISCREPANCY"
        ? {
            wrap: "border-destructive/25 bg-destructive/5",
            chip: "border-destructive/25 bg-destructive/10 text-destructive",
            label: "Discrepancy found",
          }
        : status === "PARTIAL"
          ? {
              wrap: "border-warning/30 bg-warning/5",
              chip: "border-warning/30 bg-warning/10 text-warning-foreground",
              label: "Partially verified",
            }
          : {
              wrap: "border-border bg-muted/20",
              chip: "border-border bg-secondary text-secondary-foreground",
              label: status === "PENDING" ? "Verification pending" : "No documents",
            };

  return (
    <div className={cn("rounded-xl border p-4", tone.wrap)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Ranking score with document verification
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide",
                tone.chip,
              )}
            >
              {tone.label}
            </span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Resume screening plus the verification of the resume claims, so the candidate&apos;s
            rank reflects both.
          </p>
        </div>
        {onRecompute && (
          <Button size="sm" variant="outline" disabled={recomputing} onClick={onRecompute}>
            {recomputing ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            )}
            Recompute ranking
          </Button>
        )}
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <div className="rounded-lg border border-border/70 bg-card px-3 py-2">
          <p className="eyebrow">Resume score</p>
          <p className="font-display text-lg font-semibold">{Math.round(resumeScore)}%</p>
          <p className="text-[0.68rem] text-muted-foreground">Screening only</p>
        </div>
        <div className="rounded-lg border border-border/70 bg-card px-3 py-2">
          <p className="eyebrow">Documents score</p>
          <p className="font-display text-lg font-semibold">
            {documentsScore !== null ? `${documentsScore}%` : "—"}
          </p>
          <p className="text-[0.68rem] text-muted-foreground">
            {decisive ? `${weight}% of the ranking score` : "No usable evidence yet"}
          </p>
        </div>
        <div className="rounded-lg border border-primary/25 bg-primary/5 px-3 py-2">
          <p className="eyebrow">Ranking score</p>
          <p className="font-display text-lg font-semibold text-primary">{Math.round(score)}%</p>
          <p className="text-[0.68rem] text-muted-foreground">
            {movement === 0
              ? "Unchanged by documents"
              : movement > 0
                ? `+${movement} pts from documents`
                : `${movement} pts from documents`}
          </p>
        </div>
      </div>

      {decisive ? (
        <div className="mt-3 space-y-1">
          <p className="text-xs text-muted-foreground">
            {`${verification?.verified_count ?? 0} verified · ${verification?.discrepancy_count ?? 0} with discrepancies · ${verification?.unable_count ?? 0} unable to verify`}
            {verification?.escalate_invalid
              ? " — a document contradicts the resume, so the candidate is flagged Invalid Credential."
              : "."}
          </p>
          {(verification?.flags ?? []).slice(0, 4).map((flag) => (
            <p key={flag} className="flex items-start gap-1.5 text-[0.68rem] text-muted-foreground">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
              {flag}
            </p>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">
          No COE, Certificate or Credential has been compared against this resume yet, so the score
          reflects the resume screening only — upload a supporting document to include its
          verification.
        </p>
      )}
    </div>
  );
}

function RequirementResultPill({ state }: { state: ScreeningRequirementState }) {
  if (state === "found")
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-success/25 bg-success/10 px-2 py-0.5 text-[0.68rem] font-semibold text-success">
        <Check className="h-3 w-3" strokeWidth={3} /> Found
      </span>
    );
  if (state === "meets")
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-success/25 bg-success/10 px-2 py-0.5 text-[0.68rem] font-semibold text-success">
        <Check className="h-3 w-3" strokeWidth={3} /> Meets
      </span>
    );
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-destructive/25 bg-destructive/10 px-2 py-0.5 text-[0.68rem] font-semibold text-destructive">
      <AlertTriangle className="h-3 w-3" /> Not Found
    </span>
  );
}

/** Tinted status square leading each requirement row. */
function RequirementStatusSquare({ state }: { state: ScreeningRequirementState }) {
  return (
    <span
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
        state === "found" && "border-success/25 bg-success/10 text-success",
        state === "meets" && "border-success/25 bg-success/10 text-success",
        state === "missing" && "border-destructive/25 bg-destructive/10 text-destructive",
      )}
    >
      {state === "missing" ? (
        <AlertTriangle className="h-4 w-4" />
      ) : (
        <Check className="h-4 w-4" strokeWidth={3} />
      )}
    </span>
  );
}

const REQUIREMENT_GROUPS = [
  { key: "skills", title: "Required Skills" },
  { key: "experience", title: "Work Experience" },
  { key: "education", title: "Education" },
  { key: "certifications", title: "Certifications" },
] as const;

/** Requirement Match panel — grouped, structured result table with a progress header. */
export function RequirementMatchPanel({
  rows,
  experienceMinYears = null,
}: {
  rows: ScreeningRequirementRow[];
  experienceMinYears?: number | null;
}) {
  const found = rows.filter((r) => r.state !== "missing").length;
  const pct = rows.length > 0 ? Math.round((found / rows.length) * 100) : 0;
  const expSuffix =
    experienceMinYears !== null && experienceMinYears > 0
      ? ` (${experienceMinYears}+ yrs required)`
      : "";
  const groupsWithItems = REQUIREMENT_GROUPS.map((g) => ({
    ...g,
    items: rows.filter((r) => r.group === g.key),
  })).filter((g) => g.items.length > 0);
  const groupTitle = (key: string) => {
    const base = REQUIREMENT_GROUPS.find((g) => g.key === key)?.title ?? key;
    return key === "experience" ? `${base}${expSuffix}` : base;
  };
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-display text-base font-semibold">
          <Target className="h-4.5 w-4.5 text-primary" /> Position Requirements
        </h3>
        <span className="rounded-full border border-success/25 bg-success/10 px-2 py-0.5 text-[0.68rem] font-semibold text-success">
          {found}/{rows.length} Matched
        </span>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-success" style={{ width: `${pct}%` }} />
        </div>
        <span className="shrink-0 text-[0.7rem] font-semibold text-muted-foreground">
          {found} of {rows.length} met
        </span>
      </div>
      {groupsWithItems.length === 0 ? (
        <p className="mt-3 rounded-md border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
          No requirements configured for this position.
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          {groupsWithItems.map((g) => (
            <RequirementGroupSection key={g.key} title={groupTitle(g.key)} items={g.items} />
          ))}
        </div>
      )}
    </div>
  );
}

/** One requirement group (skills / experience / education / certifications). */
function RequirementGroupSection({
  title,
  items,
}: {
  title: string;
  items: ScreeningRequirementRow[];
}) {
  const met = items.filter((r) => r.state !== "missing").length;
  return (
    <section>
      <p className="eyebrow flex items-center justify-between">
        <span>{title}</span>
        <span>
          {met}/{items.length}
        </span>
      </p>
      <ul className="mt-2 divide-y divide-border/60 overflow-hidden rounded-lg border border-border/70">
        {items.map((r) => (
          <li key={r.label} className="flex items-center gap-3 px-3 py-2.5">
            <RequirementStatusSquare state={r.state} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-semibold" title={r.label}>
                {r.label}
              </span>
              {r.hint && (
                <span
                  className="mt-0.5 block truncate text-[0.7rem] text-muted-foreground"
                  title={r.hint}
                >
                  {r.hint}
                </span>
              )}
            </span>
            <RequirementResultPill state={r.state} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Short degree label for the Education stat tile ("Bachelor's Degree", …). */
export function shortEducationLabel(education: string[]): string {
  const joined = education.join(" ").toLowerCase();
  if (/master|mba|ms |ma /.test(joined)) return "Master's Degree";
  if (/bachelor|bs |b\.s|bs\.|college|university|bachelor'|undergrad/.test(joined))
    return "Bachelor's Degree";
  if (/tesda|nc\s?ii|vocational|diploma|certificate/.test(joined)) return "Vocational / TESDA";
  if (/high\s?school|secondary/.test(joined)) return "High School";
  if (education.length > 0) {
    const first = education[0] ?? "";
    return first.length > 22 ? `${first.slice(0, 22)}…` : first;
  }
  return "Not specified";
}

/** Derives everything the redesign needs from an applicant + screening payload. */
/** Supporting-document evidence shape behind the ranking score. */
type ScreeningEvidence = NonNullable<
  NonNullable<Applicant["screening_detail"]>["document_verification"]
>;

function screeningViewModel(a: Applicant): {
  score: number;
  detail: Applicant["screening_detail"];
  /** Resume-only screening score before the supporting-document evidence. */
  resumeScore: number;
  /** Supporting-document evidence blended into the ranking score. */
  verification: ScreeningEvidence | null;
  matched: string[];
  missing: string[];
  rows: ScreeningRequirementRow[];
  skills: string[];
  skillsRecognized: boolean;
  unrecognizedCertifications: string[];
  recognizedRoles: string[];
  unrecognizedRoles: string[];
  workExperience: { job_title?: string; period?: string | null }[];
  education: string[];
  certifications: string[];
  personalInfo: { name: string | null; email: string | null; phone: string | null };
  yearsExperience: number | null;
  experienceMinYears: number | null;
  educationLabel: string;
} {
  const { entities, score } = screeningResultFor(a);
  const detail = a.screening_detail;
  const verification = detail?.document_verification ?? null;
  const resumeScore = detail?.resume_match_score ?? score;
  const breakdown = detail?.score_breakdown;
  const personal = detail?.profile?.personal_information;
  const personalInfo = {
    name: personal?.name ?? null,
    email: personal?.email ?? null,
    phone: personal?.phone ?? null,
  };
  const lib = keywordLibrary[a.position] ?? [];
  const matched =
    breakdown?.["skills"]?.matched_required ??
    breakdown?.["skills"]?.matched ??
    lib.filter((k) =>
      entities.some((e) => e.value.toLowerCase().includes(k.toLowerCase().split(" ")[0]!)),
    );
  const missing =
    breakdown?.["skills"]?.missing_required ??
    breakdown?.["skills"]?.missing ??
    lib.filter((k) => !matched.includes(k));

  const fuzzySkillMap: Record<string, string> = breakdown?.["skills"]?.fuzzy_matched_required ?? {};
  const recognizedPool: string[] = [
    ...(detail?.profile?.skills ?? []),
    ...(detail?.validation?.skill_analysis?.recognized ?? []),
    ...entities.filter((e) => e.label === "SKILL").map((e) => e.value),
  ];
  /** Applicant's own phrasing behind a matched required skill (fuzzy credit,
   *  exact recognized entry, then first-word evidence) for the row hint. */
  const applicantSkillFor = (requiredLabel: string): string | null => {
    const fuzzyHit = fuzzySkillMap[requiredLabel];
    if (fuzzyHit) return fuzzyHit;
    const norm = requiredLabel.toLowerCase();
    const exact = recognizedPool.find((s) => s.toLowerCase() === norm);
    if (exact) return exact;
    const first = norm.split(" ")[0];
    if (!first) return null;
    return recognizedPool.find((s) => s.toLowerCase().includes(first)) ?? null;
  };
  const rows: ScreeningRequirementRow[] = [
    ...matched.map((label) => {
      const mine = applicantSkillFor(label);
      return {
        label,
        state: "found" as const,
        group: "skills" as const,
        hint: mine ? `Applicant: ${mine}` : "Detected in resume",
      };
    }),
    ...missing.map((label) => ({
      label,
      state: "missing" as const,
      group: "skills" as const,
      hint: "Not detected in resume",
    })),
  ];
  const expBreak = breakdown?.["experience"];
  let experienceMinYears: number | null = expBreak?.min_years_required ?? null;
  const expYearsEstimate =
    detail?.profile?.estimated_years_experience ?? expBreak?.estimated_years ?? null;
  if (expBreak) {
    const minYears = expBreak.min_years_required ?? null;
    const met = !!expBreak.requirement_met;
    rows.push({
      label: minYears ? `${minYears}+ Years Experience` : "Work Experience",
      state: met ? "meets" : "missing",
      group: "experience",
      hint:
        expYearsEstimate !== null
          ? `Applicant ${expYearsEstimate} yrs`
          : met
            ? "Requirement satisfied"
            : "Below requirement",
    });
  }
  const eduBreak = breakdown?.["education"];
  if (eduBreak && !eduBreak.no_requirements) {
    const reqLevel = eduBreak.required_level || eduBreak.matched?.[0] || "Bachelor's Degree";
    const eduMissing = eduBreak.missing_required ?? eduBreak.missing ?? [];
    const eduFound = eduMissing.length === 0;
    const applicantTop =
      eduBreak.applicant_highest_level?.[0] ?? detail?.profile?.education?.[0] ?? null;
    rows.push({
      label: reqLevel,
      state: eduFound ? "found" : "missing",
      group: "education",
      hint: eduFound
        ? applicantTop
          ? `Applicant: ${applicantTop}`
          : "Requirement satisfied"
        : `Required: ${reqLevel}`,
    });
  }
  const certBreak = breakdown?.["certifications"];
  if (certBreak && !certBreak.no_requirements) {
    const certMatched = certBreak.matched ?? [];
    const certMissing = certBreak.missing ?? [];
    certMatched.forEach((label) =>
      rows.push({
        label,
        state: "found",
        group: "certifications",
        hint: "Detected in resume",
      }),
    );
    certMissing.forEach((label) =>
      rows.push({
        label,
        state: "missing",
        group: "certifications",
        hint: "Not detected in resume",
      }),
    );
  }
  if (!expBreak) {
    const years = detail?.profile?.estimated_years_experience ?? null;
    if (years !== null && years !== undefined) {
      rows.push({
        label: "2+ Years Experience",
        state: years >= 2 ? "meets" : "missing",
        group: "experience",
        hint: `Applicant ${years} yrs`,
      });
      experienceMinYears = 2;
    }
  }
  if (!eduBreak) {
    const eduList = detail?.profile?.education ?? [];
    if (eduList.length > 0) {
      const short = shortEducationLabel(eduList);
      rows.push({
        label: short === "Not specified" ? "Bachelor's Degree" : short,
        state: "found",
        group: "education",
        hint: `Applicant: ${eduList[0] ?? short}`,
      });
    }
  }

  const profileSkills = detail?.profile?.skills ?? [];
  const entitySkills = entities.filter((e) => e.label === "SKILL").map((e) => e.value);
  const skills = (profileSkills.length > 0 ? profileSkills : entitySkills).slice(0, 12);
  const recognizedRoles =
    detail?.profile?.job_roles?.recognized ??
    detail?.validation?.job_role_analysis?.recognized ??
    [];
  const unrecognizedRoles =
    detail?.profile?.job_roles?.unrecognized ??
    detail?.validation?.job_role_analysis?.unrecognized ??
    [];
  const workExperience = detail?.profile?.work_experience ?? [];
  const education = detail?.profile?.education ?? [];
  const certifications = detail?.profile?.certifications ?? [];
  const yearsExperience =
    detail?.profile?.estimated_years_experience ?? expBreak?.estimated_years ?? null;

  return {
    score,
    detail,
    /* The displayed percentage is the RANKING score: it blends the resume match
       score with the supporting-document verification evidence (15% weighting,
       see the NLP service's verification_scoring.py). `resumeScore` keeps the
       resume-only component visible for HR. */
    resumeScore,
    verification,
    matched,
    missing,
    rows,
    skills,
    skillsRecognized: (detail?.profile?.skills ?? []).length > 0,
    recognizedRoles,
    unrecognizedRoles,
    workExperience,
    education,
    certifications,
    unrecognizedCertifications: detail?.profile?.unrecognized_certifications ?? [],
    personalInfo,
    yearsExperience,
    experienceMinYears,
    educationLabel: shortEducationLabel(education),
  };
}

/** Normalizes an entity phrase for comparison (lowercase, punctuation-free). */
function normalizeMatchText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9+/#.\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Word/token-aware match between a required entity and one candidate entity —
 *  avoids raw-substring false positives ("IT" inside "Hospitality") and the
 *  exact-match false negatives ("Customer Service" vs "Customer Service Skills"). */
function requirementMatches(candidate: string, requirement: string): boolean {
  const c = normalizeMatchText(candidate);
  const r = normalizeMatchText(requirement);
  if (!c || !r) return false;
  if (c === r) return true;
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (new RegExp(`\\b${esc(r)}\\b`).test(c) || new RegExp(`\\b${esc(c)}\\b`).test(r)) return true;
  const requiredTokens = r.split(" ").filter((t) => t.length > 2);
  if (requiredTokens.length === 0) return false;
  const hits = requiredTokens.filter((t) => c.includes(t)).length;
  return hits / requiredTokens.length >= 0.6;
}

/** Fit of a screened applicant against another vacancy's requirement entities.
 *  Requirements come from the job post's skills first, then the position's
 *  keyword library, and only then the free-text qualifications (so long HR
 *  sentences never inflate or deflate the score). The candidate side comes from
 *  the stored resume screening profile (skills, certifications, job roles,
 *  education and estimated years of experience). */
function referralMatch(
  a: Applicant,
  post: ApiJobPost | undefined,
): { score: number; matched: string[]; total: number; notes: string[]; source: string } {
  const profile = a.screening_detail?.profile;
  const candidatePool = [
    ...(profile?.skills ?? []),
    ...(profile?.certifications ?? []),
    ...(profile?.unrecognized_certifications ?? []),
    ...(profile?.job_roles?.recognized ?? []),
    ...(profile?.job_roles?.unrecognized ?? []),
    ...(profile?.education ?? []),
  ].filter(Boolean);

  const postSkills = (post?.skills ?? []).filter(Boolean);
  const template = keywordLibrary[post?.title ?? a.position] ?? [];
  const qualifications = (post?.qualifications ?? []).filter(Boolean);
  const required =
    postSkills.length > 0 ? postSkills : template.length > 0 ? template : qualifications;
  const source =
    postSkills.length > 0
      ? "job post skills"
      : template.length > 0
        ? "position keyword library"
        : "job post qualifications";

  const matched = required.filter((r) => candidatePool.some((c) => requirementMatches(c, r)));
  const score = required.length > 0 ? Math.round((matched.length / required.length) * 100) : 0;

  const notes: string[] = [];
  const years = profile?.estimated_years_experience ?? null;
  const reqYears = /(\d+)/.exec(String(post?.experience_level ?? ""))?.[1];
  if (years !== null) {
    if (reqYears && Number(reqYears) > 0) {
      notes.push(
        years >= Number(reqYears)
          ? `${years} yrs exp — meets ${reqYears}`
          : `${years} yrs exp — needs ${reqYears}`,
      );
    } else {
      notes.push(`${years} yrs experience`);
    }
  }

  return { score, matched, total: required.length, notes, source };
}

/** Reports every unrecognized entity of a screening result in ONE click —
 *  de-duplicated, then queued for Recruitment Management → Screening Setup →
 *  Reported Entities where HR promotes them into the screening vocabulary. */
function reportAllUnrecognized(
  entries: { value: string; type: ReportedEntityType }[],
  applicantName?: string,
) {
  const unique = new Map<string, { value: string; type: ReportedEntityType }>();
  entries.forEach((e) => {
    const value = e.value.trim();
    if (value) unique.set(`${e.type}:${value.toLowerCase()}`, { value, type: e.type });
  });
  if (unique.size === 0) {
    toast.info("Nothing unrecognized to report");
    return;
  }
  unique.forEach((e) =>
    reportedEntitiesStore.report({
      value: e.value,
      suggestedType: e.type,
      source: "Resume Screening Result",
      ...(applicantName ? { applicant: applicantName } : {}),
    }),
  );
  toast.success(`${unique.size} unrecognized entr${unique.size === 1 ? "y" : "ies"} reported`, {
    description:
      "Process them in Recruitment Management → Screening Setup → Reported Entities.",
  });
}

/** Every unrecognized entity of a screening result, ready for the report
 *  checklist (job roles, skills and certifications). */
function unrecognizedEntriesFrom(
  vm: ReturnType<typeof screeningViewModel>,
  detail: Applicant["screening_detail"],
): { value: string; type: ReportedEntityType }[] {
  const validation = (detail?.validation ?? {}) as ScreeningValidationExt;
  return [
    ...vm.unrecognizedRoles.map((v) => ({ value: v, type: "job_role" as const })),
    ...vm.unrecognizedCertifications.map((v) => ({ value: v, type: "certification" as const })),
    ...(validation.skill_analysis?.unrecognized ?? []).map((v) => ({
      value: v,
      type: "skill" as const,
    })),
    ...(validation.job_role_analysis?.unrecognized ?? []).map((v) => ({
      value: v,
      type: "job_role" as const,
    })),
  ];
}

const REPORT_TYPE_LABELS: Record<ReportedEntityType, string> = {
  education: "Education",
  certification: "Certificate",
  skill: "Skill",
  job_role: "Job Role",
  experience: "Experience",
};

/**
 * "Report unrecognized entities" — opens a checklist of every unrecognized
 * entity in the screening result with everything pre-checked; HR unchecks what
 * should not be reported and confirms once.
 */
function ReportUnrecognizedDialog({
  entries,
  applicantName,
  className,
  triggerLabel,
  variant = "outline",
}: {
  entries: { value: string; type: ReportedEntityType }[];
  applicantName?: string;
  className?: string;
  triggerLabel?: string;
  variant?: "outline" | "default" | "ghost";
}) {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  // Every entry is checked by default each time the dialog opens.
  useEffect(() => {
    if (open) {
      setChecked(Object.fromEntries(entries.map((e) => [`${e.type}:${e.value}`, true])));
    }
  }, [open, entries]);

  const selected = entries.filter((e) => checked[`${e.type}:${e.value}`] !== false);

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant={variant}
        className={cn("cursor-pointer", className)}
        disabled={entries.length === 0}
        title={
          entries.length === 0 ? "No unrecognized entities in this screening result" : undefined
        }
        onClick={() => setOpen(true)}
      >
        <Flag className="mr-1.5 h-3.5 w-3.5" />
        {triggerLabel ?? `Report ${entries.length} unrecognized`}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              Report unrecognized entities
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-1">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>
                {entries.length} unrecognized entr{entries.length === 1 ? "y" : "ies"}
              </span>
              <span className="flex items-center gap-2">
                <button
                  type="button"
                  className="cursor-pointer font-semibold text-primary hover:underline"
                  onClick={() =>
                    setChecked(
                      Object.fromEntries(entries.map((e) => [`${e.type}:${e.value}`, true])),
                    )
                  }
                >
                  Check all
                </button>
                <button
                  type="button"
                  className="cursor-pointer font-semibold text-primary hover:underline"
                  onClick={() =>
                    setChecked(
                      Object.fromEntries(entries.map((e) => [`${e.type}:${e.value}`, false])),
                    )
                  }
                >
                  Uncheck all
                </button>
              </span>
            </div>
            <div className="max-h-72 space-y-0.5 overflow-y-auto rounded-md border border-border p-2">
              {entries.map((e) => {
                const key = `${e.type}:${e.value}`;
                return (
                  <label
                    key={key}
                    className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={checked[key] !== false}
                      onCheckedChange={(v) => setChecked((p) => ({ ...p, [key]: v === true }))}
                      className="mt-0.5"
                    />
                    <span className="min-w-0 flex-1 break-words">{e.value}</span>
                    <Badge variant="secondary" className="shrink-0 text-[0.6rem]">
                      {REPORT_TYPE_LABELS[e.type]}
                    </Badge>
                  </label>
                );
              })}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="cursor-pointer" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              className="cursor-pointer"
              disabled={selected.length === 0}
              onClick={() => {
                reportAllUnrecognized(selected, applicantName);
                setOpen(false);
              }}
            >
              <Flag className="mr-1.5 h-3.5 w-3.5" /> Report {selected.length} selected
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Resume Information / Key Information Extracted panel from the mockups.
 *  `variant="profile"` mirrors Image 1 (plain headers, no job-titles section);
 *  `variant="modal"` mirrors Images 2–3 (counts, job titles, experience, other-info box). */
export function ResumeInfoPanel({
  title = "Resume Information",
  variant = "profile",
  skills,
  recognizedRoles,
  unrecognizedRoles,
  workExperience,
  education,
  experienceYears,
  certifications = [],
  personalInfo = null,
  skillsRecognized = false,
  unrecognizedCertifications = [],
}: {
  title?: string;
  variant?: "profile" | "modal";
  skills: string[];
  recognizedRoles: string[];
  unrecognizedRoles: string[];
  workExperience: { job_title?: string; period?: string | null }[];
  education: string[];
  experienceYears?: number | null;
  certifications?: string[];
  personalInfo?: { name: string | null; email: string | null; phone: string | null } | null;
  skillsRecognized?: boolean;
  unrecognizedCertifications?: string[];
}) {
  const modal = variant === "modal";
  const hasJobRoles = recognizedRoles.length > 0 || unrecognizedRoles.length > 0;
  const count = (n: number) =>
    modal && n > 0 ? <span className="text-muted-foreground">({n})</span> : null;
  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-5">
      <h3 className="flex items-center gap-2 font-display text-base font-semibold">
        <FileText className="h-4.5 w-4.5 text-primary" /> {title}
      </h3>
      <div className="mt-3 flex-1 space-y-4">
        {modal && (
          <section>
            <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Users className="h-3.5 w-3.5 text-primary" /> Essential Information
            </p>
            <dl className="mt-2 space-y-1.5">
              {(
                [
                  ["Name", personalInfo?.name],
                  ["Email", personalInfo?.email],
                  ["Phone", personalInfo?.phone],
                ] as const
              ).map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-2 text-[0.7rem]">
                  <dt className="shrink-0 text-muted-foreground">{label}</dt>
                  <dd
                    className={cn(
                      "min-w-0 truncate text-right font-semibold",
                      !value && "font-normal text-muted-foreground",
                    )}
                    title={value ?? undefined}
                  >
                    {value || "Not extracted"}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}
        <section className={cn(modal && "border-t border-border/60 pt-3")}>
          <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Users className="h-3.5 w-3.5 text-primary" /> Skills {count(skills.length)}
          </p>
          {skills.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {skills.map((s) => {
                const recognized = modal && skillsRecognized;
                return (
                  <span
                    key={s}
                    className={
                      recognized
                        ? "rounded-full border border-success/25 bg-success/10 px-2.5 py-1 text-[0.7rem] font-medium text-success"
                        : "rounded-full bg-secondary px-2.5 py-1 text-[0.7rem] font-medium text-secondary-foreground"
                    }
                  >
                    {s}
                    {recognized ? " (Recognized)" : ""}
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="mt-1.5 text-xs text-muted-foreground">No skills extracted.</p>
          )}
        </section>
        {modal && hasJobRoles && (
          <section className="border-t border-border/60 pt-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Briefcase className="h-3.5 w-3.5 text-primary" /> Job Titles{" "}
              {count(recognizedRoles.length + unrecognizedRoles.length)}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {recognizedRoles.map((r) => (
                <span
                  key={`rec-${r}`}
                  className="rounded-full border border-success/25 bg-success/10 px-2.5 py-1 text-[0.7rem] font-medium text-success"
                >
                  {r} (Recognized)
                </span>
              ))}
              {unrecognizedRoles.map((r) => (
                <span
                  key={`unrec-${r}`}
                  className="rounded-full bg-secondary px-2.5 py-1 text-[0.7rem] font-medium text-muted-foreground"
                >
                  {r} (Unrecognized)
                </span>
              ))}
            </div>
          </section>
        )}
        <section className="border-t border-border/60 pt-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Briefcase className="h-3.5 w-3.5 text-primary" /> Work Experience{" "}
            {count(workExperience.length)}
          </p>
          {workExperience.length > 0 ? (
            <ul className="mt-2 space-y-2">
              {workExperience.slice(0, 4).map((w, i) => (
                <li key={i} className="flex items-start justify-between gap-3">
                  <p className="min-w-0 truncate text-xs font-semibold">{w.job_title || "Role"}</p>
                  {w.period && (
                    <span className="shrink-0 text-[0.7rem] text-muted-foreground">{w.period}</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1.5 text-xs text-muted-foreground">No employer history detected.</p>
          )}
        </section>
        <section className="border-t border-border/60 pt-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <GraduationCap className="h-3.5 w-3.5 text-primary" /> Education{" "}
            {count(education.length)}
          </p>
          {education.length > 0 ? (
            <ul className="mt-2 space-y-1.5">
              {education.slice(0, 3).map((e, i) => (
                <li key={i} className="text-xs font-medium leading-relaxed">
                  {e}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1.5 text-xs text-muted-foreground">Not specified.</p>
          )}
        </section>
        {modal && experienceYears !== null && experienceYears !== undefined && (
          <section className="border-t border-border/60 pt-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Briefcase className="h-3.5 w-3.5 text-primary" /> Experience{" "}
              <span className="text-muted-foreground">(1)</span>
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {formatExperienceYears(experienceYears)}
            </p>
          </section>
        )}
        {modal && certifications.length > 0 && (
          <section className="border-t border-border/60 pt-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Info className="h-3.5 w-3.5 text-primary" /> Other extracted information{" "}
              {count(certifications.length)}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {certifications.slice(0, 8).map((c) => {
                const unrec = unrecognizedCertifications.some(
                  (u) => u.toLowerCase() === c.toLowerCase(),
                );
                return (
                  <span
                    key={c}
                    className={
                      unrec
                        ? "rounded-full bg-secondary px-2.5 py-1 text-[0.7rem] font-medium text-muted-foreground"
                        : "rounded-full border border-success/25 bg-success/10 px-2.5 py-1 text-[0.7rem] font-medium text-success"
                    }
                  >
                    {c} {unrec ? "(Unrecognized)" : "(Recognized)"}
                  </span>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

/** Validation payload plus the NLP-only skill analysis (present in the stored
 *  screening JSON but absent from the narrow frontend ScreeningDetail type). */
type ScreeningValidationExt = NonNullable<
  NonNullable<Applicant["screening_detail"]>["validation"]
> & {
  skill_analysis?: { recognized?: string[]; unrecognized?: string[] };
};

function TechPanel({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border/70 bg-card p-3.5">
      <p className="flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-wide text-foreground">
        <span className="text-primary">{icon}</span> {title}
      </p>
      <dl className="mt-2.5 space-y-1.5">{children}</dl>
    </div>
  );
}

function TechRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-2 text-[0.7rem]">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right font-semibold">{children}</dd>
    </div>
  );
}

function TechPill({
  tone,
  children,
}: {
  tone: "success" | "warning" | "muted";
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-1.5 py-px text-[0.65rem] font-semibold",
        tone === "success" && "border-success/25 bg-success/10 text-success",
        tone === "warning" && "border-warning/30 bg-warning/10 text-warning-foreground",
        tone === "muted" && "border-border bg-secondary text-muted-foreground",
      )}
    >
      {tone === "success" && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
      {children}
    </span>
  );
}

/** Expanded Screening Details for the review dialog — the four technical
 *  panels from the latest mockup, all derived from the stored screening payload. */
function ScreeningTechnicalPanels({
  position,
  score,
  detail,
  vm,
}: {
  position: string;
  score: number;
  detail: Applicant["screening_detail"];
  vm: ReturnType<typeof screeningViewModel>;
}) {
  const processed = detail?.processing_status === "PROCESSED";
  const partial = detail?.processing_status === "PARTIALLY_PROCESSED";
  const ran = processed || partial;
  const validation = (detail?.validation ?? {}) as ScreeningValidationExt;
  const credentialIssues = validation.credential_issues ?? [];
  const unrecRoles = validation.job_role_analysis?.unrecognized ?? [];
  const unrecSkills = validation.skill_analysis?.unrecognized ?? [];
  const unrecTerms = [...unrecRoles, ...unrecSkills];
  const found = vm.rows.filter((r) => r.state !== "missing").length;
  const expRow = vm.rows.find((r) => /year/i.test(r.label));
  const eduRow = vm.rows.find((r) =>
    /bachelor|degree|education|tesda|diploma|college|\bnc\b/i.test(r.label),
  );
  const expMet = expRow ? expRow.state !== "missing" : null;
  const eduMet = eduRow ? eduRow.state !== "missing" : null;
  const skillsMet = vm.missing.length === 0;

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <TechPanel icon={<FileText className="h-3.5 w-3.5" />} title="Resume Processing">
        <TechRow label="Text Extraction">
          {ran ? (
            <TechPill tone="success">Completed</TechPill>
          ) : (
            <TechPill tone="muted">Pending</TechPill>
          )}
        </TechRow>
        <TechRow label="OCR Processing">
          {ran ? (
            <TechPill tone="success">Completed</TechPill>
          ) : (
            <TechPill tone="muted">Pending</TechPill>
          )}
        </TechRow>
        <TechRow label="Text Quality">
          {vm.skills.length > 0 || vm.education.length > 0 ? (
            <TechPill tone="success">Successfully extracted</TechPill>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </TechRow>
        <TechRow label="Processing Status">
          {processed ? (
            <TechPill tone="success">Completed</TechPill>
          ) : partial ? (
            <TechPill tone="warning">Partial</TechPill>
          ) : (
            <TechPill tone="muted">Pending</TechPill>
          )}
        </TechRow>
      </TechPanel>

      <TechPanel icon={<ScanLine className="h-3.5 w-3.5" />} title="Named Entity Recognition (NER)">
        <TechRow label="Skills">
          <span className="text-success">{vm.skills.length} extracted</span>
        </TechRow>
        <TechRow label="Job Titles">
          <span className="text-success">{vm.recognizedRoles.length} recognized</span>
        </TechRow>
        <TechRow label="Education">
          <span className="text-success">{vm.education.length} extracted</span>
        </TechRow>
        <TechRow label="Experience">
          <span className="text-success">
            {vm.yearsExperience !== null ? formatExperienceYears(vm.yearsExperience) : "—"}
          </span>
        </TechRow>
        <TechRow label="Other Information">
          <span className="font-normal text-muted-foreground">
            Applicant/resume info identified
          </span>
        </TechRow>
        <TechRow label="Recognized Terms">
          <span className="text-success">
            {vm.recognizedRoles.length + vm.skills.length} terms matched to the vocabulary
          </span>
        </TechRow>
        {/* Unrecognized Terms live on the NER panel: they are an entity
            recognition outcome, not a system-validation failure. */}
        {unrecTerms.length > 0 ? (
          <div className="rounded-md border border-destructive/20 bg-destructive/5 p-2">
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[0.65rem] font-bold uppercase tracking-wide text-destructive">
                Unrecognized Terms ({unrecTerms.length})
              </p>
              <ReportUnrecognizedDialog
                entries={unrecTerms.map((t) => ({
                  value: t,
                  type: unrecRoles.includes(t) ? ("job_role" as const) : ("skill" as const),
                }))}
                triggerLabel="Report all"
                variant="ghost"
                className="flex h-5 items-center gap-1 rounded-full border border-warning/40 bg-warning/10 px-2 py-0 text-[0.6rem] font-semibold text-warning-foreground transition-colors hover:bg-warning/20"
              />
            </div>
            <ul className="columns-2 list-disc gap-4 pl-4 text-[0.65rem] leading-relaxed text-muted-foreground">
              {unrecTerms.slice(0, 10).map((t) => (
                <li key={t} className="break-inside-avoid">
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-1 text-[0.6rem] text-muted-foreground">
              Recognized as text, but not yet in the screening vocabulary — add them in Screening
              Reference Data so future resumes match.
            </p>
          </div>
        ) : (
          <TechRow label="Unrecognized Terms">
            <TechPill tone="success">None</TechPill>
          </TechRow>
        )}
      </TechPanel>

      <TechPanel icon={<Target className="h-3.5 w-3.5" />} title="Job Requirement Matching">
        <TechRow label="Target Position">
          <span className="text-primary">{position}</span>
        </TechRow>
        <TechRow label="Match Score">
          <span className="text-success">{Math.round(score)}%</span>
        </TechRow>
        <TechRow label="Matched Requirements">
          <span className="text-success">
            {found} / {vm.rows.length}
          </span>
        </TechRow>
        <TechRow label="Missing Requirements">
          <span className={vm.missing.length > 0 ? "text-destructive" : "text-success"}>
            {vm.missing.length}
          </span>
        </TechRow>
        <TechRow label="Experience Requirement">
          {expMet === null ? (
            <span className="text-muted-foreground">—</span>
          ) : expMet ? (
            <span className="text-success">Met</span>
          ) : (
            <span className="text-destructive">Missing</span>
          )}
        </TechRow>
        <TechRow label="Education Requirement">
          {eduMet === null ? (
            <span className="text-muted-foreground">—</span>
          ) : eduMet ? (
            <span className="text-success">Met</span>
          ) : (
            <span className="text-destructive">Missing</span>
          )}
        </TechRow>
        <TechRow label="Required Skills">
          {skillsMet ? (
            <span className="text-success">Matched (by system rules)</span>
          ) : (
            <span className="text-destructive">Missing (by system rules)</span>
          )}
        </TechRow>
      </TechPanel>

      <TechPanel
        icon={<ShieldCheck className="h-3.5 w-3.5" />}
        title="Validation / System Analysis"
      >
        <TechRow label="Document Analysis">
          {ran ? (
            <TechPill tone="success">Passed</TechPill>
          ) : (
            <TechPill tone="muted">Pending</TechPill>
          )}
        </TechRow>
        <TechRow label="Credential Analysis">
          {credentialIssues.length === 0 ? (
            <TechPill tone="success">Passed</TechPill>
          ) : (
            <TechPill tone="warning">{credentialIssues.length} found</TechPill>
          )}
        </TechRow>
        <TechRow label="Unrecognized Job Roles">
          <span className={unrecRoles.length > 0 ? "text-warning-foreground" : ""}>
            {unrecRoles.length}
          </span>
        </TechRow>
        <TechRow label="Unrecognized Skills">
          <span className={unrecSkills.length > 0 ? "text-warning-foreground" : ""}>
            {unrecSkills.length}
          </span>
        </TechRow>
        <TechRow label="Unrecognized Terms">
          <span className="font-normal text-muted-foreground">
            Listed on the Named Entity Recognition card
          </span>
        </TechRow>
      </TechPanel>
    </div>
  );
}

/** Collapsible technical-details bar.
 *  `variant="profile"` mirrors Image 1 (chart icon, chevron affordance);
 *  `variant="modal"` mirrors Images 2–3 (gear icon, View Details/Collapse pill,
 *  four technical panels when expanded). */
export function ScreeningDetailsAccordion({
  detail,
  variant = "profile",
  position,
  score,
  vm,
}: {
  detail: Applicant["screening_detail"];
  variant?: "profile" | "modal";
  position?: string;
  score?: number;
  vm?: ReturnType<typeof screeningViewModel>;
}) {
  const [open, setOpen] = useState(false);
  const reasons = detail?.reasons ?? [];
  const breakdownEntries = Object.entries(detail?.score_breakdown ?? {});
  const modal = variant === "modal";
  return (
    <div className="overflow-hidden rounded-xl border border-primary/15 bg-primary/5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-5 py-3.5 text-left"
        aria-expanded={open}
      >
        {modal ? (
          <Settings2 className="h-5 w-5 shrink-0 text-primary" />
        ) : (
          <BarChart3 className="h-5 w-5 shrink-0 text-primary" />
        )}
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold">Screening Details</span>
          <span className="block truncate text-[0.7rem] text-muted-foreground">
            Technical details from the resume analysis (OCR + NER + matching).
          </span>
        </span>
        {modal ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-primary">
            {open ? "Collapse" : "View Details"}
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
          </span>
        ) : (
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-primary transition-transform",
              open && "rotate-180",
            )}
          />
        )}
      </button>
      {open && (
        <div className="space-y-3 border-t border-primary/15 bg-card px-5 py-4">
          {modal && vm && position !== undefined && score !== undefined ? (
            <>
              <ScreeningTechnicalPanels position={position} score={score} detail={detail} vm={vm} />
              <ScreeningAnalysisSections detail={detail} className="border-border/70" />
            </>
          ) : (
            <>
              <ScreeningAnalysisSections detail={detail} className="border-border/70" />
              {breakdownEntries.length > 0 && (
                <div className="space-y-2">
                  {breakdownEntries.map(([criterion, b]) => {
                    const pct = b?.max
                      ? Math.min(100, Math.round(((b?.earned ?? 0) / b.max) * 100))
                      : 0;
                    return (
                      <div key={criterion} className="flex items-center gap-3">
                        <span className="w-36 shrink-0 text-xs capitalize text-muted-foreground">
                          {criterion}
                        </span>
                        <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                          <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-10 text-right text-xs font-semibold">
                          {b?.earned ?? 0}/{b?.max ?? 0}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
              {reasons.length > 0 && (
                <div className="rounded-md border border-border p-3">
                  <p className="eyebrow mb-2">Why this result (system explanation)</p>
                  <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">
                    {reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
              {breakdownEntries.length === 0 && reasons.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Detailed criterion scores will appear here once the NLP screening payload is
                  available.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* NOTE: screening-stage recommendations were removed by design — a
 * "Recommendation" verdict only belongs to the Final Evaluation stage
 * (Verify Candidate Decision). Screening ends with scores and evidence;
 * Accept / Reject / Refer actions live in the dialog footer and the
 * pipeline row menus. */

/** Colored file-type glyph for supporting documents (palette tokens only).
 *  The caption mirrors the mockups: RES (resume), PDF (COE), CERT (training),
 *  ID (credential), PDF (others). */
function ScreeningDocIcon({ docType, label }: { docType: string; label?: string }) {
  const t = docType.toLowerCase();
  const cls =
    t === "coe"
      ? "bg-primary/10 text-primary"
      : t === "certificate"
        ? "bg-success/10 text-success"
        : t === "credential"
          ? "bg-gold-soft text-gold-foreground dark:bg-gold/15 dark:text-gold"
          : "bg-destructive/10 text-destructive";
  const caption =
    label ??
    (t === "resume" ? "RES" : t === "certificate" ? "CERT" : t === "credential" ? "ID" : "PDF");
  return (
    <span
      className={cn("flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg", cls)}
    >
      <FileText className="h-4 w-4" />
      <span className="text-[0.55rem] font-bold leading-none">{caption}</span>
    </span>
  );
}

/** Caption for a verification document's glyph (see ScreeningDocIcon). */
function screeningDocCaption(docType: string): string {
  const t = docType.toLowerCase();
  if (t === "certificate") return "CERT";
  if (t === "credential") return "ID";
  return "PDF";
}

function screeningDocStatusMeta(status?: string | null | undefined): {
  label: string;
  className: string;
  Icon: typeof CheckCircle2;
} {
  const s = (status ?? "PENDING").toUpperCase();
  if (s === "VERIFIED" || s === "SCREENED")
    return {
      label: s === "SCREENED" ? "Screened" : "Verified",
      className: "border-success/25 bg-success/10 text-success",
      Icon: CheckCircle2,
    };
  if (s === "DISCREPANCY_FOUND")
    return {
      label: "Discrepancy Found",
      className: "border-warning/30 bg-warning/10 text-warning-foreground",
      Icon: AlertTriangle,
    };
  if (s === "UNABLE_TO_VERIFY")
    return {
      label: "Unable to Verify",
      className: "border-destructive/25 bg-destructive/10 text-destructive",
      Icon: AlertTriangle,
    };
  if (s === "PROCESSING")
    return {
      label: "Verifying…",
      className: "border-primary/25 bg-primary/10 text-primary",
      Icon: Loader2,
    };
  if (/PENDING|REVIEW/.test(s))
    return {
      label: "Pending Review",
      className: "border-warning/30 bg-warning/10 text-warning-foreground",
      Icon: Clock,
    };
  return {
    label: "Not Yet Reviewed",
    className: "border-border bg-secondary text-secondary-foreground",
    Icon: History,
  };
}

function ScreeningDocStatusPill({ status }: { status?: string | null | undefined }) {
  const meta = screeningDocStatusMeta(status);
  const Icon = meta.Icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.68rem] font-semibold",
        meta.className,
      )}
    >
      <Icon className="h-3 w-3" /> {meta.label}
    </span>
  );
}

/** Card-grid supporting documents (View profile variant of the mockup).
 *  When `onReverify` is provided (Review-dialog usage) each card also shows
 *  a Reverify action plus expandable field-by-field verification details,
 *  while keeping the same horizontal card-grid layout as View profile. */
function ScreeningSupportDocsGrid({
  resumeName,
  resumeSub,
  onOpenResume,
  docs,
  loading,
  onView,
  onDownload,
  reverifyingId = null,
  onReverify,
  title = "Supporting Documents",
  subtitle = "These documents help verify the applicant's information.",
  showResume = true,
}: {
  resumeName: string;
  resumeSub: string;
  onOpenResume?: (() => void) | undefined;
  docs: ApiApplicantDocument[];
  loading: boolean;
  onView: (d: ApiApplicantDocument) => void;
  onDownload: (d: ApiApplicantDocument) => void;
  reverifyingId?: string | null;
  onReverify?: ((d: ApiApplicantDocument) => void) | undefined;
  title?: string;
  subtitle?: string;
  /** The resume card belongs to "Resume & Documents"; the Supporting Document
   *  Verification section only lists the uploaded proof papers. */
  showResume?: boolean;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const detailed = !!onReverify;
  const docTitleOf = (d: ApiApplicantDocument) =>
    d.title || d.original_name || `Document #${d.applicant_document_id}`;
  const docKindLabel = (d: ApiApplicantDocument) =>
    d.doc_type === "COE"
      ? "Certificate of Employment"
      : d.doc_type === "Certificate"
        ? "Training Certificate"
        : d.doc_type === "Credential"
          ? "ID / Government ID"
          : "Supporting Document";
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-display text-base font-semibold">
          <ShieldCheck className="h-4.5 w-4.5 text-primary" /> {title}
        </h3>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-[0.68rem] font-semibold text-secondary-foreground">
          {docs.length} document{docs.length === 1 ? "" : "s"}
        </span>
      </div>
      <p className="mt-0.5 text-[0.7rem] text-muted-foreground">{subtitle}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {showResume && (
          <div className="flex flex-col rounded-lg border border-border/70 p-4">
            <div className="flex items-start gap-2.5">
              <ScreeningDocIcon docType="resume" />
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold" title={resumeName}>
                  Resume
                </p>
                <p className="truncate text-[0.7rem] text-muted-foreground" title={resumeSub}>
                  {resumeSub}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <ScreeningDocStatusPill status="SCREENED" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button size="sm" variant="outline" onClick={onOpenResume}>
                View
              </Button>
              <Button size="sm" onClick={onOpenResume}>
                Download
              </Button>
            </div>
          </div>
        )}
        {loading && (
          <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border p-6 text-xs text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading documents…
          </div>
        )}
        {!loading &&
          docs.map((d) => {
            const id = String(d.applicant_document_id);
            const expanded = expandedId === id;
            const checks = Object.entries(d.verification_result?.checks ?? {});
            const busy = reverifyingId === id;
            return (
              <div
                key={d.applicant_document_id}
                className="flex flex-col rounded-lg border border-border/70 p-4"
              >
                <button
                  type="button"
                  className="flex items-start gap-2.5 text-left"
                  onClick={() => (detailed ? setExpandedId(expanded ? null : id) : undefined)}
                  aria-expanded={detailed ? expanded : undefined}
                  title={docTitleOf(d)}
                >
                  <ScreeningDocIcon docType={d.doc_type} label={screeningDocCaption(d.doc_type)} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold" title={docTitleOf(d)}>
                      {docKindLabel(d)}
                    </p>
                    <p className="truncate text-[0.7rem] text-muted-foreground">
                      {screeningDocCaption(d.doc_type)} · {d.doc_type}
                    </p>
                  </div>
                  {detailed && (
                    <span
                      className="flex h-7 w-6 shrink-0 items-center justify-center text-muted-foreground"
                      aria-hidden="true"
                    >
                      {expanded ? (
                        <ChevronDown className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5" />
                      )}
                    </span>
                  )}
                </button>
                <div className="mt-3">
                  <ScreeningDocStatusPill status={d.verification_status} />
                </div>
                <div className={cn("mt-3 grid gap-2", detailed ? "grid-cols-3" : "grid-cols-2")}>
                  <Button
                    size="sm"
                    variant="outline"
                    className={cn(detailed && "h-7 min-w-0 px-1 text-[0.68rem]")}
                    onClick={() => onView(d)}
                  >
                    {detailed ? (
                      <>
                        <Eye className="mr-1 h-3 w-3 shrink-0" /> View
                      </>
                    ) : (
                      "View"
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant={detailed ? "outline" : "default"}
                    className={cn(detailed && "h-7 min-w-0 px-1 text-[0.68rem]")}
                    onClick={() => onDownload(d)}
                  >
                    {detailed ? (
                      <>
                        <Download className="mr-1 h-3 w-3 shrink-0" /> Download
                      </>
                    ) : (
                      "Download"
                    )}
                  </Button>
                  {detailed && onReverify && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 min-w-0 px-1 text-[0.68rem]"
                      disabled={busy}
                      onClick={() => onReverify(d)}
                    >
                      {busy ? (
                        <Loader2 className="h-3 w-3 shrink-0 animate-spin" />
                      ) : (
                        <>
                          <RefreshCw className="mr-1 h-3 w-3 shrink-0" /> Reverify
                        </>
                      )}
                    </Button>
                  )}
                </div>
                {detailed && expanded && (
                  <div className="mt-3 space-y-2 border-t border-border/60 pt-3">
                    {d.verification_result?.summary && (
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {d.verification_result.summary}
                      </p>
                    )}
                    {checks.length === 0 ? (
                      <p className="text-xs italic text-muted-foreground">
                        No field-by-field comparison available for this document yet.
                      </p>
                    ) : (
                      checks.map(([key, check]) => (
                        <DocVerificationCheckRow key={key} labelKey={key} check={check} />
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        {!loading && docs.length === 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-dashed border-border p-4 text-xs text-muted-foreground sm:col-span-1 xl:col-span-3">
            <Info className="h-4 w-4 shrink-0" /> No verification documents uploaded yet.
          </div>
        )}
      </div>
    </div>
  );
}

/** Compact verification rows (Review-dialog variant of the mockup). */
function ScreeningSupportDocsList({
  docs,
  loading,
  reverifyingId,
  onView,
  onDownload,
  onReverify,
}: {
  docs: ApiApplicantDocument[];
  loading: boolean;
  reverifyingId: string | null;
  onView: (d: ApiApplicantDocument) => void;
  onDownload: (d: ApiApplicantDocument) => void;
  onReverify: (d: ApiApplicantDocument) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-display text-base font-semibold">
          <ShieldCheck className="h-4.5 w-4.5 text-primary" /> Supporting Document Verification
        </h3>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-[0.68rem] font-semibold text-secondary-foreground">
          {docs.length} document{docs.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className="mt-3 flex-1 space-y-3">
        {loading && (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading supporting documents…
          </p>
        )}
        {!loading && docs.length === 0 && (
          <p className="flex items-center gap-2 rounded-md border border-dashed border-border px-3 py-2.5 text-xs text-muted-foreground">
            <Info className="h-4 w-4 shrink-0" /> No verification documents uploaded yet.
          </p>
        )}
        {!loading &&
          docs.map((d) => {
            const id = String(d.applicant_document_id);
            const expanded = expandedId === id;
            const checks = Object.entries(d.verification_result?.checks ?? {});
            const busy = reverifyingId === id;
            return (
              <div key={id} className="rounded-lg border border-border/70">
                <div className="flex items-center gap-2.5 px-3 pt-2.5">
                  <ScreeningDocIcon docType={d.doc_type} label={screeningDocCaption(d.doc_type)} />
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => setExpandedId(expanded ? null : id)}
                    aria-expanded={expanded}
                    title={d.title || d.original_name || undefined}
                  >
                    <span className="block truncate text-xs font-semibold">
                      {d.title || d.original_name || `Document #${d.applicant_document_id}`}
                    </span>
                    <span className="mt-0.5 block text-[0.7rem] text-muted-foreground">
                      {screeningDocCaption(d.doc_type)} · {d.doc_type}
                    </span>
                  </button>
                  <span
                    className="flex h-7 w-6 shrink-0 items-center justify-center text-muted-foreground"
                    aria-hidden="true"
                  >
                    {expanded ? (
                      <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5" />
                    )}
                  </span>
                </div>
                <div className="px-3 pt-1.5">
                  <ScreeningDocStatusPill status={d.verification_status} />
                </div>
                <div className="grid grid-cols-3 gap-1.5 px-3 py-2.5">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 min-w-0 px-1 text-[0.68rem]"
                    onClick={() => onView(d)}
                  >
                    <Eye className="mr-1 h-3 w-3 shrink-0" /> View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 min-w-0 px-1 text-[0.68rem]"
                    onClick={() => onDownload(d)}
                  >
                    <Download className="mr-1 h-3 w-3 shrink-0" /> Download
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 min-w-0 px-1 text-[0.68rem]"
                    disabled={busy}
                    onClick={() => onReverify(d)}
                  >
                    {busy ? (
                      <Loader2 className="h-3 w-3 shrink-0 animate-spin" />
                    ) : (
                      <>
                        <RefreshCw className="mr-1 h-3 w-3 shrink-0" /> Reverify
                      </>
                    )}
                  </Button>
                </div>
                {expanded && (
                  <div className="space-y-2 border-t border-border/60 px-3 py-3">
                    {d.verification_result?.summary && (
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {d.verification_result.summary}
                      </p>
                    )}
                    {checks.length === 0 ? (
                      <p className="text-xs italic text-muted-foreground">
                        No field-by-field comparison available for this document yet.
                      </p>
                    ) : (
                      checks.map(([key, check]) => (
                        <DocVerificationCheckRow key={key} labelKey={key} check={check} />
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}

type ScreeningRefType = ApiScreeningReference["data_type"];

const SCREENING_TYPE_META: Record<ScreeningRefType, { label: string; className: string }> = {
  skill: {
    label: "Skill",
    className:
      "border-primary/30 bg-primary/10 text-primary dark:border-primary/40 dark:bg-primary/20",
  },
  job_role: {
    label: "Job Role",
    className:
      "border-warning/30 bg-warning/10 text-warning dark:border-warning/40 dark:bg-warning/20",
  },
  certification: {
    label: "Certificate",
    className:
      "border-success/30 bg-success/10 text-success dark:border-success/40 dark:bg-success/20",
  },
  education: {
    label: "Education",
    className:
      "border-caution/30 bg-caution/10 text-caution dark:border-caution/40 dark:bg-caution/20",
  },
  experience: {
    label: "Experience",
    className: "border-border bg-muted text-foreground",
  },
};

/** Section order in Reference Data & Aliases — each entity type gets its own
 *  block so Education, Certificates, Skills, Job Roles and Experience are
 *  managed separately. */
const SCREENING_TYPE_ORDER: ScreeningRefType[] = [
  "education",
  "certification",
  "skill",
  "job_role",
  "experience",
];

const SCREENING_TYPE_OPTIONS = SCREENING_TYPE_ORDER.map(
  (value) =>
    [value, SCREENING_TYPE_META[value]] as [ScreeningRefType, { label: string; className: string }],
);

/**
 * Admin CRUD over the DB-managed spaCy screening reference data
 * (`screening_reference_data`). Entries here decide which extracted skills,
 * job roles and certifications are classified RECOGNIZED vs UNRECOGNIZED by
 * the NLP service; changes take effect on the next screening run.
 */
export function ScreeningReferenceManager() {
  const [rows, setRows] = useState<ApiScreeningReference[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<ApiScreeningReference | null>(null);
  const [form, setForm] = useState<{
    data_type: ScreeningRefType;
    canonical_value: string;
    aliases: string;
  }>({ data_type: "skill", canonical_value: "", aliases: "" });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ApiScreeningReference | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await screeningApi.referenceData.list();
      setRows(res.data ?? []);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Could not load reference data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /** Entries grouped per entity type — each type renders its own section, so
   *  education, certificates, skills, job roles and experience stay separate. */
  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase();
    const groups: Record<ScreeningRefType, ApiScreeningReference[]> = {
      education: [],
      certification: [],
      skill: [],
      job_role: [],
      experience: [],
    };
    for (const r of rows) {
      if (
        q &&
        !`${r.canonical_value} ${(r.aliases_json ?? []).join(" ")}`.toLowerCase().includes(q)
      ) {
        continue;
      }
      groups[r.data_type] = [...(groups[r.data_type] ?? []), r];
    }
    return groups;
  }, [rows, search]);

  const counts = useMemo(
    () => ({
      skill: rows.filter((r) => r.data_type === "skill").length,
      job_role: rows.filter((r) => r.data_type === "job_role").length,
      certification: rows.filter((r) => r.data_type === "certification").length,
      education: rows.filter((r) => r.data_type === "education").length,
      experience: rows.filter((r) => r.data_type === "experience").length,
      active: rows.filter((r) => r.active).length,
    }),
    [rows],
  );

  const openCreate = () => {
    setEditing(null);
    setForm({ data_type: "skill", canonical_value: "", aliases: "" });
    setEditorOpen(true);
  };

  /** "Add" inside an entity-type section — opens the editor pre-set to it. */
  const openCreateFor = (type: ScreeningRefType) => {
    setEditing(null);
    setForm({ data_type: type, canonical_value: "", aliases: "" });
    setEditorOpen(true);
  };

  const openEdit = (row: ApiScreeningReference) => {
    setEditing(row);
    setForm({
      data_type: row.data_type,
      canonical_value: row.canonical_value,
      aliases: (row.aliases_json ?? []).join(", "),
    });
    setEditorOpen(true);
  };

  const save = async () => {
    const value = form.canonical_value.trim();
    if (!value) {
      toast.error("Enter a canonical value.");
      return;
    }
    const payload = {
      data_type: form.data_type,
      canonical_value: value,
      aliases_json: form.aliases
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
    };
    setSaving(true);
    try {
      if (editing) {
        await screeningApi.referenceData.update(editing.ref_id, payload);
        toast.success(`Updated "${value}"`, {
          description: "Future screenings will use this entry immediately.",
        });
      } else {
        await screeningApi.referenceData.create(payload);
        toast.success(`Added "${value}" to the screening vocabulary`);
      }
      setEditorOpen(false);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save the reference entry.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (row: ApiScreeningReference) => {
    setBusyId(row.ref_id);
    try {
      await screeningApi.referenceData.toggleActive(row.ref_id);
      toast.success(
        row.active
          ? `"${row.canonical_value}" deactivated — excluded from future screenings`
          : `"${row.canonical_value}" activated`,
      );
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update the entry.");
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.ref_id);
    try {
      await screeningApi.referenceData.remove(deleteTarget.ref_id);
      toast.success(`Deleted "${deleteTarget.canonical_value}"`);
      setDeleteTarget(null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete the entry.");
    } finally {
      setBusyId(null);
    }
  };

  const [bulkSaving, setBulkSaving] = useState(false);

  /** Downloads a CSV sample showing the expected bulk-upload format. */
  const downloadBulkSample = () => {
    downloadTextFile(
      "screening-reference-sample.csv",
      [
        "# Screening reference bulk upload — one entry per line.",
        "# Format: data_type,canonical_value,alias1|alias2|alias3",
        "# data_type is one of: education, certification, skill, job_role, experience",
        "education,Bachelor of Science in Hospitality Management,BSHM|BS Hospitality Management",
        "certification,TESDA Housekeeping NC II,Housekeeping NC2|HK NC II",
        "skill,Guest Relations,Guest Relation|Guest Services",
        "job_role,Front Desk Receptionist,Front Office Agent|Receptionist",
        "experience,Front Office,5 years front desk|Hotel front desk experience",
      ].join("\n"),
    );
    toast.success("Sample bulk-upload file downloaded");
  };

  /** Parses a CSV / TXT bulk file into reference-entry payloads. Lines starting
   *  with "#" are treated as comments. */
  const parseBulkFile = (text: string): ScreeningReferencePayload[] => {
    const payloads: ScreeningReferencePayload[] = [];
    text.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const [rawType, rawValue, rawAliases] = trimmed.split(",");
      const type = (rawType ?? "").trim().toLowerCase().replace(/\s+/g, "_") as ScreeningRefType;
      const value = (rawValue ?? "").trim();
      if (!value || !SCREENING_TYPE_ORDER.includes(type)) return;
      payloads.push({
        data_type: type,
        canonical_value: value,
        aliases_json: (rawAliases ?? "")
          .split("|")
          .map((a) => a.trim())
          .filter(Boolean),
      });
    });
    return payloads;
  };

  /** Bulk-uploads every parsed row into the screening vocabulary. */
  const handleBulkUpload = async (file: File | null | undefined) => {
    if (!file) return;
    setBulkSaving(true);
    try {
      const payloads = parseBulkFile(await file.text());
      if (payloads.length === 0) {
        toast.error("No valid rows found in the file.", {
          description:
            "Expected per line: data_type,canonical_value,alias1|alias2 — download the sample for the exact format.",
        });
        return;
      }
      let created = 0;
      let skipped = 0;
      for (const payload of payloads) {
        try {
          await screeningApi.referenceData.create(payload);
          created += 1;
        } catch {
          skipped += 1;
        }
      }
      toast.success(
        `${created} entr${created === 1 ? "y" : "ies"} added to the screening vocabulary`,
        skipped > 0
          ? { description: `${skipped} row(s) skipped (duplicate or invalid).` }
          : undefined,
      );
      setEditorOpen(false);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not read the bulk file.");
    } finally {
      setBulkSaving(false);
    }
  };

  return (
    <Card className="border-border/70">
      <CardContent className="space-y-4 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
              <BookMarked className="h-5 w-5 text-primary" />
              Reference Data &amp; Aliases
            </h2>
            <p className="text-xs text-muted-foreground">
              Database-managed vocabulary used by the NLP service to classify education,
              certificates, skills, job roles and experience as RECOGNIZED or UNRECOGNIZED — each
              entity type is managed in its own section below. Changes apply to every new screening.
            </p>
          </div>
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add entry
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <Badge variant="secondary">Education: {counts.education}</Badge>
          <Badge variant="secondary">Certificates: {counts.certification}</Badge>
          <Badge variant="secondary">Skills: {counts.skill}</Badge>
          <Badge variant="secondary">Job Roles: {counts.job_role}</Badge>
          <Badge variant="secondary">Experience: {counts.experience}</Badge>
          <Badge variant="outline">{counts.active} active</Badge>
        </div>

        {loadError ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            {loadError}
            <Button size="sm" variant="outline" className="ml-3" onClick={load}>
              Retry
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search value or alias…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-64 pl-8"
                />
              </div>
              <p className="text-[0.7rem] text-muted-foreground">
                One section per entity type — education, certificates, skills, job roles and
                experience.
              </p>
            </div>

            <div className="max-h-[22rem] overflow-y-auto rounded-md border border-border">
              <Table className="text-xs">
                <TableHeader className="sticky top-0 bg-card">
                  <TableRow>
                    <TableHead className="w-28">Type</TableHead>
                    <TableHead>Canonical value</TableHead>
                    <TableHead>Aliases</TableHead>
                    <TableHead className="w-16">Active</TableHead>
                    <TableHead className="w-24 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                        <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Loading reference
                        data…
                      </TableCell>
                    </TableRow>
                  ) : rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                        No reference entries yet — add one above, or bulk-upload a file from the
                        Add Reference Entry dialog.
                      </TableCell>
                    </TableRow>
                  ) : (
                    SCREENING_TYPE_ORDER.flatMap((type) => {
                      const meta = SCREENING_TYPE_META[type];
                      const entries = grouped[type] ?? [];
                      if (entries.length === 0 && search.trim()) return [];
                      return [
                        <TableRow key={`section-${type}`} className="bg-muted/50 hover:bg-muted/50">
                          <TableCell colSpan={5} className="py-1.5">
                            <span className="flex flex-wrap items-center justify-between gap-2">
                              <span className="flex items-center gap-2">
                                <Badge variant="outline" className={meta.className}>
                                  {meta.label}
                                </Badge>
                                <span className="text-[0.65rem] text-muted-foreground">
                                  {entries.length} entr{entries.length === 1 ? "y" : "ies"}
                                </span>
                              </span>
                              <button
                                type="button"
                                className="cursor-pointer text-[0.65rem] font-semibold text-primary hover:underline"
                                onClick={() => openCreateFor(type)}
                              >
                                + Add {meta.label}
                              </button>
                            </span>
                          </TableCell>
                        </TableRow>,
                        ...entries.map((row) => (
                          <TableRow key={row.ref_id}>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={SCREENING_TYPE_META[row.data_type].className}
                              >
                                {SCREENING_TYPE_META[row.data_type].label}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{row.canonical_value}</TableCell>
                            <TableCell>
                              <div className="flex max-w-md flex-wrap gap-1">
                                {(row.aliases_json ?? []).length > 0 ? (
                                  (row.aliases_json ?? []).map((alias) => (
                                    <Badge
                                      key={alias}
                                      variant="secondary"
                                      className="text-[0.65rem]"
                                    >
                                      {alias}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={row.active}
                                disabled={busyId === row.ref_id}
                                onCheckedChange={() => toggleActive(row)}
                                aria-label={`Toggle ${row.canonical_value}`}
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7"
                                  onClick={() => openEdit(row)}
                                  aria-label={`Edit ${row.canonical_value}`}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 text-destructive"
                                  onClick={() => setDeleteTarget(row)}
                                  aria-label={`Delete ${row.canonical_value}`}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )),
                      ];
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>

      {/* ADD / EDIT DIALOG */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Reference Entry" : "Add Reference Entry"}</DialogTitle>
            <DialogDescription>
              Canonical values are matched against entities extracted from resumes; aliases let
              alternate phrasings map to the same entry. Add one entry at a time, or bulk-upload a
              file below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={form.data_type}
                onValueChange={(v) => setForm((f) => ({ ...f, data_type: v as ScreeningRefType }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SCREENING_TYPE_OPTIONS.map(([value, meta]) => (
                    <SelectItem key={value} value={value}>
                      {meta.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Canonical value</Label>
              <Input
                placeholder={
                  form.data_type === "job_role" ? "e.g. Front Desk Officer" : "e.g. POS Systems"
                }
                value={form.canonical_value}
                onChange={(e) => setForm((f) => ({ ...f, canonical_value: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Aliases (comma separated)</Label>
              <Textarea
                rows={3}
                placeholder={
                  form.data_type === "skill"
                    ? "e.g. Point of Sale, POS, Cash Register System"
                    : "e.g. Food Server, Server Staff"
                }
                value={form.aliases}
                onChange={(e) => setForm((f) => ({ ...f, aliases: e.target.value }))}
              />
            </div>
            {!editing && (
              <div className="space-y-2 rounded-md border border-dashed border-border bg-muted/30 p-3">
                <Label className="text-xs">Bulk upload entries</Label>
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    type="file"
                    accept=".csv,.txt"
                    disabled={bulkSaving}
                    className="h-9 w-full cursor-pointer text-xs sm:w-52"
                    onChange={(e) => {
                      void handleBulkUpload(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-9 cursor-pointer"
                    disabled={bulkSaving}
                    onClick={downloadBulkSample}
                  >
                    <Download className="mr-1.5 h-3.5 w-3.5" /> Download sample
                  </Button>
                  {bulkSaving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                </div>
                <p className="text-[0.7rem] leading-relaxed text-muted-foreground">
                  One entry per line:{" "}
                  <code className="rounded bg-muted px-1">
                    data_type,canonical_value,alias1|alias2
                  </code>{" "}
                  — data_type is education, certification, skill, job_role or experience. Download
                  the sample file for the exact format.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditorOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? "Save changes" : "Add entry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION */}
      <Dialog open={deleteTarget !== null} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete reference entry?</DialogTitle>
            <DialogDescription>
              "{deleteTarget?.canonical_value}" will be removed from the screening vocabulary.
              Resumes already screened keep their results.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={busyId !== null}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={busyId !== null}>
              {busyId !== null && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export type MockAssessmentQuestion = {
  title: string;
  scenario: string;
  options: string[];
  correctIndex: number;
  points: number;
};

/** Mock question set for the candidate-facing assessment test runner. */
export const MOCK_ASSESSMENT_QUESTIONS: MockAssessmentQuestion[] = [
  {
    title: "Handle Electrical Issue Promptly",
    scenario:
      "You have checked in a guest to their assigned room. The guest has settled in and uses an electric appliance, which causes a spark, and the electricity trips on the entire floor. What would you do?",
    options: [
      "The first thing would be to immediately call all guests on the intercom and inform them about the situation, telling them that help is reaching them soon.",
      "Immediately go to the floor, quickly gather all the guests, and help them safely reach an area where they can be comfortable.",
      "The first thing is to give any form of light, such as candles, in every room so the guests can take their belongings at the earliest and then be gathered in a safe place.",
      "Inform the guests about the issue and let them stay in the room until the issue is resolved.",
    ],
    correctIndex: 1,
    points: 20,
  },
  {
    title: "Handle Guest Complaint With Care",
    scenario:
      "A guest approaches the front desk and complains that their room was not cleaned before check-in, even though the system shows it as inspected. The guest is upset and other guests are waiting in line. What would you do?",
    options: [
      "Tell the guest the system shows the room as clean, so there must be a misunderstanding, and ask them to wait.",
      "Apologize sincerely, offer a room change or immediate re-cleaning, and assure the guest you will personally follow up.",
      "Ask the guest to come back later once the line is clear so you can discuss the issue privately.",
      "Offer a discount right away without checking what actually happened in the room.",
    ],
    correctIndex: 1,
    points: 20,
  },
  {
    title: "Prioritize Food Safety",
    scenario:
      "During a busy dinner service, you notice a co-worker place cooked food on a tray that previously held raw ingredients without cleaning it. Orders are piling up. What would you do?",
    options: [
      "Say nothing to avoid slowing down the service, since the food will be served hot anyway.",
      "Stop the tray from being served, inform the co-worker, replace it with a clean tray, and notify the supervisor.",
      "Wipe the tray quickly with a dry cloth and continue serving to keep up with orders.",
      "Serve the food and mention the issue to the supervisor after the shift ends.",
    ],
    correctIndex: 1,
    points: 20,
  },
  {
    title: "Manage Overlapping Reservations",
    scenario:
      "Two guests arrive at the same time claiming the same reserved table. The reservation book shows one entry clearly, but the other guest insists they booked by phone. Both are getting impatient. What would you do?",
    options: [
      "Give the table to whoever arrived first and ask the other guest to wait without a clear plan.",
      "Stay calm, verify the reservation record, offer the table to the confirmed booking, and seat the other guest at a comparable table with a complimentary gesture.",
      "Tell both guests the table is unavailable and ask them to choose another restaurant.",
      "Ask the two guests to decide between themselves who gets the table.",
    ],
    correctIndex: 1,
    points: 20,
  },
  {
    title: "Support the Team During Rush Hour",
    scenario:
      "It is peak check-in time, the lobby is full, and a co-worker at the next counter is struggling with a difficult transaction while your own line is moving smoothly. What would you do?",
    options: [
      "Focus only on your own line so you finish faster, since helping might slow you down.",
      "Signal your supervisor, keep your line moving, and assist your co-worker as soon as there is a short gap without leaving guests unattended.",
      "Take over your co-worker's transaction immediately and leave your own guests waiting.",
      "Ignore the situation because it is the supervisor's responsibility, not yours.",
    ],
    correctIndex: 1,
    points: 20,
  },
];

const FRONT_OFFICE_QUESTIONS: MockAssessmentQuestion[] = [
  {
    title: "Handle Electrical Issue Promptly",
    scenario:
      "You have checked in a guest to their assigned room. The guest has settled in and uses an electric appliance, which causes a spark, and the electricity trips on the entire floor. What would you do?",
    options: [
      "Call all guests on the intercom at once and tell them help is on the way.",
      "Immediately go to the floor, quickly gather all the guests, and help them safely reach an area where they can be comfortable.",
      "Hand out candles to every room so guests can collect their belongings.",
      "Ask guests to stay in their rooms until the issue is resolved.",
    ],
    correctIndex: 1,
    points: 20,
  },
  {
    title: "Handle Guest Complaint With Care",
    scenario:
      "A guest complains at the front desk that their room was not cleaned before check-in, even though the system shows it as inspected. The guest is upset and other guests are waiting in line. What would you do?",
    options: [
      "Insist the system shows the room as clean and ask the guest to wait.",
      "Apologize sincerely, offer a room change or immediate re-cleaning, and personally follow up.",
      "Ask the guest to return later once the line is clear.",
      "Offer a discount immediately without checking the room.",
    ],
    correctIndex: 1,
    points: 20,
  },
  {
    title: "Manage Overlapping Reservations",
    scenario:
      "Two guests arrive at the same time claiming the same reservation. The book shows one entry clearly, but the other guest insists they booked by phone. Both are impatient. What would you do?",
    options: [
      "Give the slot to whoever arrived first with no backup plan.",
      "Stay calm, verify the record, honor the confirmed booking, and seat the other guest at a comparable option with a complimentary gesture.",
      "Tell both guests nothing is available and turn them away.",
      "Ask the two guests to decide between themselves.",
    ],
    correctIndex: 1,
    points: 20,
  },
  {
    title: "Handle a Fully Booked Night",
    scenario:
      "A guest with a confirmed reservation arrives, but the hotel is fully booked due to an earlier system error. The guest is tired after a long trip. What would you do?",
    options: [
      "Tell the guest there is nothing you can do and suggest they find another hotel themselves.",
      "Apologize, arrange a comparable nearby hotel at no extra cost, cover the transport, and follow up the next day.",
      "Ask the guest to share a room with another party for the night.",
      "Blame the system error and ask the guest to wait in the lobby until someone checks out.",
    ],
    correctIndex: 1,
    points: 20,
  },
  {
    title: "Support the Team During Rush Hour",
    scenario:
      "It is peak check-in time, the lobby is full, and a co-worker at the next counter is struggling with a difficult transaction while your own line is moving smoothly. What would you do?",
    options: [
      "Focus only on your own line so you finish faster.",
      "Signal your supervisor, keep your line moving, and assist your co-worker as soon as there is a short gap without leaving guests unattended.",
      "Abandon your own guests to take over the co-worker's transaction.",
      "Ignore it since it is the supervisor's responsibility.",
    ],
    correctIndex: 1,
    points: 20,
  },
];

const SERVICE_QUESTIONS: MockAssessmentQuestion[] = [
  {
    title: "Prioritize Food Safety",
    scenario:
      "During a busy dinner service, you notice a co-worker place cooked food on a tray that previously held raw ingredients without cleaning it. Orders are piling up. What would you do?",
    options: [
      "Say nothing to avoid slowing service.",
      "Stop the tray from being served, inform the co-worker, replace it with a clean tray, and notify the supervisor.",
      "Wipe the tray quickly with a dry cloth and keep serving.",
      "Serve the food and mention it after the shift.",
    ],
    correctIndex: 1,
    points: 20,
  },
  {
    title: "Fix a Wrong Order Gracefully",
    scenario:
      "A guest flags that the dish served is not what they ordered, and they have already waited a long time. The kitchen is slammed. What would you do?",
    options: [
      "Tell the guest the kitchen is busy and they must wait without updates.",
      "Apologize, confirm the correct order, prioritize the remake with the kitchen, and keep the guest updated until it arrives.",
      "Argue that the order ticket matches what was served.",
      "Remove the dish and bring the bill to turn the table faster.",
    ],
    correctIndex: 1,
    points: 20,
  },
  {
    title: "Respond to a Spill Near a Guest",
    scenario:
      "You accidentally spill soup near a guest's table. No one is hurt, but the guest is startled and their sleeve has a small stain. What would you do?",
    options: [
      "Quickly walk away and let someone else handle it.",
      "Check the guest is okay, apologize, clean the area at once, offer to have the garment cleaned, and replace the dish.",
      "Blame the crowded layout and continue serving.",
      "Offer a discount only if the guest complains loudly.",
    ],
    correctIndex: 1,
    points: 20,
  },
  {
    title: "Manage Overlapping Reservations",
    scenario:
      "Two parties claim the same reserved table at peak hours. The book shows one entry, but the other party insists they booked by phone. What would you do?",
    options: [
      "Seat whoever arrived first with no plan for the other party.",
      "Stay calm, verify the record, honor the confirmed booking, and seat the other party at a comparable table with a complimentary gesture.",
      "Declare the table unavailable for both parties.",
      "Let the two parties argue it out.",
    ],
    correctIndex: 1,
    points: 20,
  },
  {
    title: "Help the Team at Peak Hours",
    scenario:
      "The dining area is full, a co-worker is overwhelmed with a large table, and your own section is under control. What would you do?",
    options: [
      "Stay in your section and watch so you are not blamed for mistakes.",
      "Keep your section covered while assisting with refills, clearing, or running food whenever there is a gap.",
      "Take over their table completely and leave your guests unattended.",
      "Do nothing since sections are strictly assigned.",
    ],
    correctIndex: 1,
    points: 20,
  },
];

const BAR_QUESTIONS: MockAssessmentQuestion[] = [
  {
    title: "Handle an Intoxicated Guest",
    scenario:
      "A visibly intoxicated guest demands another strong drink and becomes insistent when you hesitate. What would you do?",
    options: [
      "Serve the drink to avoid conflict.",
      "Politely refuse further alcohol, offer water or food, and inform your supervisor following house policy.",
      "Serve a weaker drink without telling the guest.",
      "Ask other guests to calm the person down.",
    ],
    correctIndex: 1,
    points: 20,
  },
  {
    title: "Verify Age Before Serving",
    scenario:
      "A young-looking guest orders a cocktail but cannot present a valid ID, claiming they left it in their room. What would you do?",
    options: [
      "Serve them since they look old enough.",
      "Politely decline alcohol service without a valid ID, per policy, and offer a non-alcoholic alternative.",
      "Serve one drink as an exception this time.",
      "Ask another bartender to serve them instead.",
    ],
    correctIndex: 1,
    points: 20,
  },
  {
    title: "Broken Glass Near the Ice Bin",
    scenario:
      "A glass shatters near the open ice bin during a rush, and fragments may have fallen into the ice. Drink orders are waiting. What would you do?",
    options: [
      "Scoop around the fragments and keep using the ice to save time.",
      "Stop using the ice at once, discard all contaminated ice, clean and sanitize the bin, refill with fresh ice, and remake affected drinks.",
      "Pick out the visible pieces and continue serving.",
      "Close the bar until the end of the shift.",
    ],
    correctIndex: 1,
    points: 20,
  },
  {
    title: "Manage a Long Bar Queue",
    scenario:
      "A long queue forms at the bar and waiting guests are getting restless. You are the only bartender for the next few minutes. What would you do?",
    options: [
      "Serve friends and familiar faces first to move faster.",
      "Acknowledge waiting guests, serve strictly in order, keep the pace steady, and call for backup support.",
      "Rush pours and skip standard measures to go faster.",
      "Stop taking new orders until the queue disappears on its own.",
    ],
    correctIndex: 1,
    points: 20,
  },
  {
    title: "Remake a Rejected Cocktail",
    scenario:
      "A guest sends back a cocktail, saying it tastes wrong. You followed the recipe, but the guest is disappointed. What would you do?",
    options: [
      "Insist the drink is correct and refuse to remake it.",
      "Apologize, confirm their preferred taste, and remake the drink promptly.",
      "Charge them for a second drink before remaking.",
      "Blame the recipe and walk away.",
    ],
    correctIndex: 1,
    points: 20,
  },
];

const KITCHEN_QUESTIONS: MockAssessmentQuestion[] = [
  {
    title: "Stop Cross-Contamination",
    scenario:
      "During a busy service, you see cooked food placed on a tray that previously held raw ingredients without being cleaned. Orders are piling up. What would you do?",
    options: [
      "Say nothing since the food will be served hot.",
      "Stop the tray from being served, replace it with a clean one, inform the co-worker, and notify the supervisor.",
      "Wipe the tray with a dry cloth and keep serving.",
      "Report it only after the shift ends.",
    ],
    correctIndex: 1,
    points: 20,
  },
  {
    title: "Respond to a Grease Flare-Up",
    scenario:
      "A small grease flare-up starts in a pan on your station while several orders are on the fire. What would you do?",
    options: [
      "Throw water on the pan to put it out quickly.",
      "Stay calm, turn off the heat if safe, smother the flames with a lid, and call for help per kitchen safety procedure.",
      "Carry the burning pan across the kitchen to the sink.",
      "Ignore it and keep cooking since it looks small.",
    ],
    correctIndex: 1,
    points: 20,
  },
  {
    title: "Follow the Recipe Under Pressure",
    scenario:
      "You run out of a key ingredient mid-service and the next delivery is an hour away. The head cook is busy. What would you do?",
    options: [
      "Substitute silently with whatever is nearby and say nothing.",
      "Inform the head cook at once, suggest approved alternatives, and only proceed with their go-ahead.",
      "Skip the ingredient and hope guests do not notice.",
      "Remove the dish from the pass without telling anyone.",
    ],
    correctIndex: 1,
    points: 20,
  },
  {
    title: "Keep the Station Hygienic",
    scenario:
      "Your station surfaces and tools have built-up residue halfway through service, but tickets keep coming. What would you do?",
    options: [
      "Keep cooking — cleaning can wait until closing.",
      "Clean and sanitize tools and surfaces at the earliest gap without delaying orders, following the cleaning schedule.",
      "Rinse everything with water only at the end of the night.",
      "Borrow a co-worker's clean tools and return them dirty.",
    ],
    correctIndex: 1,
    points: 20,
  },
  {
    title: "Plate Consistently at Speed",
    scenario:
      "Plates are leaving your station looking different from one another during a rush, and the supervisor flags inconsistent portions. What would you do?",
    options: [
      "Plate faster and ignore presentation until the rush ends.",
      "Slow just enough to follow the standard portioning and plating guide so every plate matches.",
      "Serve larger portions to please guests regardless of standard.",
      "Blame the rush and continue as before.",
    ],
    correctIndex: 1,
    points: 20,
  },
];

const HOUSEKEEPING_QUESTIONS: MockAssessmentQuestion[] = [
  {
    title: "Handle a Dirty Room Complaint",
    scenario:
      "A guest complains their room was not properly cleaned — dusty surfaces and an unemptied bin — shortly before they must leave for an event. What would you do?",
    options: [
      "Tell them housekeeping already finished the room and move on.",
      "Apologize, re-clean the room immediately focusing on the reported issues, and confirm with the guest before they leave.",
      "Ask them to wait until the next scheduled cleaning.",
      "Offer a discount without checking the room.",
    ],
    correctIndex: 1,
    points: 20,
  },
  {
    title: "Use Cleaning Chemicals Safely",
    scenario:
      "You need to clean a heavily stained bathroom, and a co-worker suggests mixing two strong chemicals to work faster. What would you do?",
    options: [
      "Mix them since a co-worker recommended it.",
      "Refuse to mix chemicals, follow label instructions and dilution charts, wear protective gear, and ventilate the room.",
      "Use extra amounts of one chemical without measuring.",
      "Skip protective gear to finish faster.",
    ],
    correctIndex: 1,
    points: 20,
  },
  {
    title: "Handle Found Valuables",
    scenario:
      "While cleaning a checked-out room, you find an expensive watch under the pillow. No one has reported it yet. What would you do?",
    options: [
      "Keep it aside personally and wait to see if anyone asks.",
      "Secure it immediately and turn it over to lost-and-found following hotel procedure with proper documentation.",
      "Leave it where it is for the next guest.",
      "Ask co-workers if anyone wants it.",
    ],
    correctIndex: 1,
    points: 20,
  },
  {
    title: "Respect a Do-Not-Disturb Sign",
    scenario:
      "A room on your list shows do-not-disturb past normal cleaning hours, and the guest has not responded to calls. Checkout pressure is building. What would you do?",
    options: [
      "Enter anyway since the schedule must be followed.",
      "Respect the sign, inform your supervisor of the delay, and return at the next appropriate interval per procedure.",
      "Knock repeatedly until the guest answers.",
      "Skip the room entirely without reporting it.",
    ],
    correctIndex: 1,
    points: 20,
  },
  {
    title: "Turn Over Rooms at Peak Checkout",
    scenario:
      "Several rooms check out at once and new guests are arriving early. Your cart is low on linen and amenities. What would you do?",
    options: [
      "Clean rooms partially to appear fast.",
      "Prioritize by arrival times, restock the cart first, then clean each room fully to standard before release.",
      "Release rooms without inspection to save time.",
      "Wait for someone else to restock while standing by.",
    ],
    correctIndex: 1,
    points: 20,
  },
];

/** Picks the mock question set matching the candidate's position. */
export const MOCK_ASSESSMENT_QUESTIONS_BY_POSITION: Record<string, MockAssessmentQuestion[]> = {
  "Front Desk Receptionist": FRONT_OFFICE_QUESTIONS,
  "Guest Relations Officer": FRONT_OFFICE_QUESTIONS,
  "Restaurant Server": SERVICE_QUESTIONS,
  Bartender: BAR_QUESTIONS,
  "Line Cook": KITCHEN_QUESTIONS,
  "Pastry Chef": KITCHEN_QUESTIONS,
  "Housekeeping Attendant": HOUSEKEEPING_QUESTIONS,
};

export function getMockAssessmentQuestions(position: string): MockAssessmentQuestion[] {
  return MOCK_ASSESSMENT_QUESTIONS_BY_POSITION[position] ?? MOCK_ASSESSMENT_QUESTIONS;
}

/** Countdown budget for the mock assessment test runner (10 minutes). */
export const MOCK_TEST_DURATION_SECONDS = 10 * 60;

/* ------------------------------------------------------------------ */
/* Supporting Document Verification — inline section of the applicant  */
/* review dialog. Compares uploaded COE / Certificate / Credential     */
/* files against the applicant's resume claims (additive section; the  */
/* existing screening UI is untouched).                                */
/* ------------------------------------------------------------------ */

const docVerificationCheckLabels: Record<string, string> = {
  company: "Company",
  position: "Position",
  start_date: "Start Date",
  end_date: "End Date",
  degree: "Degree / Program",
  institution: "Institution",
  certification: "Certification",
  issuer: "Issuing Organization",
};

function DocVerificationCheckRow({
  labelKey,
  check,
}: {
  labelKey: string;
  check: ApiDocumentVerificationCheck;
}) {
  return (
    <div className="rounded-md border border-border/60 bg-card p-2.5">
      <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
        {docVerificationCheckLabels[labelKey] ?? labelKey}
      </p>
      <div className="mt-1 space-y-0.5 text-xs">
        <p>
          <span className="text-muted-foreground">Resume: </span>
          {check.resume_value ?? "—"}
        </p>
        <p>
          <span className="text-muted-foreground">Document: </span>
          {check.document_value ?? "—"}
        </p>
        <p
          className={cn(
            "flex items-center gap-1 font-semibold",
            check.result === "MATCH" && "text-emerald-600 dark:text-emerald-400",
            check.result === "MISMATCH" && "text-amber-600 dark:text-amber-400",
            check.result === "UNABLE_TO_EXTRACT" && "text-muted-foreground",
          )}
        >
          {check.result === "MATCH" && <CheckCircle2 className="h-3.5 w-3.5" />}
          {check.result === "MISMATCH" && <AlertTriangle className="h-3.5 w-3.5" />}
          {check.result === "UNABLE_TO_EXTRACT" && <Info className="h-3.5 w-3.5" />}
          {check.result === "MATCH"
            ? `MATCH${
                check.match_method === "canonical_alias"
                  ? " (canonical alias)"
                  : check.match_method === "fuzzy"
                    ? " (fuzzy)"
                    : check.match_method === "date_tolerance"
                      ? " (same period)"
                      : ""
              }`
            : check.result === "MISMATCH"
              ? "MISMATCH"
              : "CAN'T COMPARE"}
        </p>
        {check.note && <p className="text-[0.65rem] italic text-muted-foreground">{check.note}</p>}
        {check.compared_resume_entry && check.compared_resume_entry.total_entries > 1 && (
          <p className="text-[0.65rem] italic text-muted-foreground">
            Compared against work entry{" "}
            {(check.compared_resume_entry.entry_index ?? 0) + 1} of{" "}
            {check.compared_resume_entry.total_entries}
            {check.compared_resume_entry.job_title ||
            check.compared_resume_entry.company
              ? ` (${[check.compared_resume_entry.job_title, check.compared_resume_entry.company].filter(Boolean).join(" · ")})`
              : ""}
          </p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Resume vs Supporting Documents — professional category matching for */
/* the Review dialog top row (3rd column). New method: instead of a    */
/* flat field list, results are grouped into the four sections HR      */
/* actually reviews — Identity, Work experience, Education, and        */
/* Certifications — each with its own verdict. Plain business language */
/* only (Confirmed / Check needed / No paper); the full paper-by-paper */
/* proof grid lives below, before Screening Details.                   */
/* ------------------------------------------------------------------ */

type MatchSectionStatus = "confirmed" | "needs-review" | "not-checked";

interface MatchEvidence {
  label: string;
  resume: string | null;
  papers: string | null;
  status: MatchSectionStatus;
  source?: string | undefined;
}

interface MatchSection {
  key: "identity" | "work" | "education" | "certification";
  title: string;
  hint: string;
  status: MatchSectionStatus;
  fields: MatchEvidence[];
  papersCount: number;
}

function normName(value: unknown): string {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[.,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function namesAgree(resumeName: string | null, docNames: string[]): string | null {
  const resume = normName(resumeName);
  if (!resume) return null;
  const resumeTokens = new Set(resume.split(" ").filter((t) => t.length > 1));
  for (const raw of docNames) {
    const doc = normName(raw);
    if (!doc) continue;
    if (doc === resume) return raw;
    if (doc.includes(resume) || resume.includes(doc)) return raw;
    const docTokens = new Set(doc.split(" ").filter((t) => t.length > 1));
    if (resumeTokens.size === 0 || docTokens.size === 0) continue;
    let overlap = 0;
    resumeTokens.forEach((t) => {
      if (docTokens.has(t)) overlap += 1;
    });
    const ratio = overlap / Math.max(resumeTokens.size, docTokens.size);
    if (ratio >= 0.6) return raw;
  }
  return null;
}

/** Words that never appear in a real person name — company, venue, role and
 *  document vocabulary. Any value containing one is an extraction error
 *  (hotel name, job title, certificate fragment), not someone's name. */
const NON_NAME_WORDS = new Set([
  "hotel",
  "hotels",
  "suite",
  "suites",
  "resort",
  "resorts",
  "inn",
  "lodge",
  "motel",
  "plaza",
  "manor",
  "casino",
  "convention",
  "center",
  "centre",
  "club",
  "resto",
  "restaurant",
  "restaurants",
  "cafe",
  "catering",
  "banquet",
  "banquets",
  "event",
  "events",
  "gala",
  "galas",
  "travel",
  "tours",
  "agency",
  "company",
  "corp",
  "corporation",
  "incorporated",
  "inc",
  "ltd",
  "limited",
  "group",
  "holdings",
  "enterprise",
  "enterprises",
  "services",
  "service",
  "management",
  "operations",
  "hospitality",
  "standards",
  "standard",
  "rating",
  "ratings",
  "development",
  "authority",
  "commission",
  "board",
  "department",
  "institute",
  "academy",
  "school",
  "college",
  "university",
  "tesda",
  "training",
  "adb",
  "beo",
  "execution",
  "timing",
  "certificate",
  "certificates",
  "certification",
  "completion",
  "supervisor",
  "manager",
  "chef",
  "cook",
  "attendant",
  "agent",
  "officer",
  "coordinator",
  "receptionist",
  "receptionists",
  "bartender",
  "barista",
  "housekeeper",
  "housekeeping",
  "waiter",
  "waitress",
  "steward",
  "cashier",
  "clerk",
  "technician",
  "executive",
  "director",
  "assistant",
  "associate",
  "leader",
  "member",
  "staff",
  "crew",
  "team",
]);

/** Name particles that are legitimately part of Filipino / Spanish names. */
const NAME_PARTICLES = new Set([
  "de",
  "la",
  "del",
  "dela",
  "san",
  "santa",
  "sto",
  "st",
  "van",
  "von",
  "di",
  "da",
  "bin",
  "ibn",
]);

/**
 * Rejects strings that cannot be a person name: skill phrases
 * ("BEO Execution & Timing"), hotel fragments ("GRAND CREST ADB"), job
 * titles, certificate boilerplate. Comparing those would produce a scary
 * false "Different" — instead the panel honestly reports "Can't confirm".
 */
function isPlausiblePersonName(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const raw = value.trim();
  if (!raw) return false;
  if (/[0-9@&/|\\<>*#+=$%]/.test(raw)) return false;
  const tokens = raw.split(/\s+/);
  if (tokens.length < 2 || tokens.length > 4) return false;
  for (const token of tokens) {
    const lettersOnly = token.replace(/[.'’`-]/g, "");
    if (!lettersOnly || !/^[A-Za-zÑñÁáÉéÍíÓóÚúÜü]+$/.test(lettersOnly)) return false;
    const low = lettersOnly.toLowerCase();
    if (NAME_PARTICLES.has(low)) continue;
    if (NON_NAME_WORDS.has(low)) return false;
  }
  return true;
}

function checkStatus(result: unknown): MatchSectionStatus {
  if (result === "MATCH") return "confirmed";
  if (result === "MISMATCH") return "needs-review";
  return "not-checked";
}

function worstStatus(statuses: MatchSectionStatus[]): MatchSectionStatus {
  if (statuses.includes("needs-review")) return "needs-review";
  if (statuses.includes("confirmed")) return "confirmed";
  return "not-checked";
}

function pickCheck(
  docs: ApiApplicantDocument[],
  key: string,
  targetDocTypes?: string[],
): { check: ApiDocumentVerificationCheck; doc: ApiApplicantDocument } | null {
  const filteredDocs =
    targetDocTypes && targetDocTypes.length > 0
      ? docs.filter((d) => !d.doc_type || targetDocTypes.includes(d.doc_type))
      : docs;
  const samples: { check: ApiDocumentVerificationCheck; doc: ApiApplicantDocument }[] = [];
  (filteredDocs.length > 0 ? filteredDocs : docs).forEach((doc) => {
    const check = doc.verification_result?.checks?.[key];
    if (check) samples.push({ check, doc });
  });
  if (samples.length === 0) return null;
  // Verification semantics: a genuine discrepancy in ANY paper must surface
  // for HR review — a match elsewhere must never hide it. (E.g. the current-
  // employer COE matches while the previous-employer COE exposes a 3-month
  // start-date gap; showing only the match would certify a false history.)
  // UNABLE_TO_EXTRACT samples rank last: "can't compare" never overrides a
  // real verdict in either direction.
  return (
    samples.find((s) => s.check.result === "MISMATCH") ??
    samples.find((s) => s.check.result === "MATCH") ??
    samples[0]!
  );
}

/** "Compared against work entry 2 of 3" — traces a COE verdict back to the
 *  exact resume stint the paper was measured against. */
function comparedEntrySource(check: ApiDocumentVerificationCheck | undefined): string | undefined {
  const entry = check?.compared_resume_entry;
  if (!entry || entry.total_entries < 1) return undefined;
  const position =
    entry.entry_index !== null && entry.entry_index !== undefined
      ? `entry ${(entry.entry_index ?? 0) + 1} of ${entry.total_entries}`
      : `1 of ${entry.total_entries} ${entry.total_entries === 1 ? "entry" : "entries"}`;
  const what = [entry.job_title, entry.company].filter(Boolean).join(" · ");
  return `Compared against work ${position}${what ? ` (${what})` : ""}`;
}

export function ScreeningResumeDocsMatchDetail({
  docs,
  loading,
  resumeName,
  resumeEducation,
  resumeCertifications,
}: {
  docs: ApiApplicantDocument[];
  loading: boolean;
  resumeName?: string | null;
  resumeEducation?: string[];
  resumeCertifications?: string[];
}) {
  const sections: MatchSection[] = (() => {
    // — Identity: does the name on the papers match the resume name? —
    // Non-name strings on either side (skill phrases, hotel fragments, job
    // titles picked up by the extractor) are refused instead of compared,
    // so extraction noise reports "Can't confirm" rather than "Different".
    const docNames = docs
      .map((d) => (d.extracted_profile as Record<string, unknown> | null)?.["name"])
      .filter((n): n is string => typeof n === "string" && n.trim().length > 0);
    const plausibleDocNames = docNames.filter(isPlausiblePersonName);
    const resumePlausible = isPlausiblePersonName(resumeName);
    const nameHit = resumePlausible ? namesAgree(resumeName ?? null, plausibleDocNames) : null;
    const identityCheckable = resumePlausible && plausibleDocNames.length > 0;
    const identity: MatchSection = {
      key: "identity",
      title: "Identity",
      hint: "Name on papers vs resume",
      papersCount: docNames.length,
      status:
        docs.length === 0 || !identityCheckable
          ? "not-checked"
          : nameHit
            ? "confirmed"
            : "needs-review",
      fields: [
        {
          label: "Full name",
          resume: resumeName ?? null,
          papers: docNames.length > 0 ? (nameHit ?? plausibleDocNames[0] ?? docNames[0]!) : null,
          status:
            docs.length === 0 || !identityCheckable
              ? "not-checked"
              : nameHit
                ? "confirmed"
                : "needs-review",
          source:
            plausibleDocNames.length > 1
              ? `Seen in ${plausibleDocNames.length} papers`
              : plausibleDocNames.length === 1
                ? "Seen in 1 paper"
                : docNames.length > 0
                  ? "Name on papers unclear — check by hand"
                  : undefined,
        },
      ],
    };

    // — Work experience (COE papers): employer + title + dates —
    const company = pickCheck(docs, "company", ["COE"]);
    const position = pickCheck(docs, "position", ["COE"]);
    const start = pickCheck(docs, "start_date", ["COE"]);
    const end = pickCheck(docs, "end_date", ["COE"]);
    const dateStatuses = [start, end]
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .map((x) => checkStatus(x.check.result));
    const dateResume = start?.check.resume_value ?? end?.check.resume_value ?? null;
    const datePapers = start?.check.document_value ?? end?.check.document_value ?? null;
    const workFields: MatchEvidence[] = [];
    if (company)
      workFields.push({
        label: "Employer",
        resume: company.check.resume_value,
        papers: company.check.document_value,
        status: checkStatus(company.check.result),
        source: comparedEntrySource(company.check),
      });
    if (position)
      workFields.push({
        label: "Job title",
        resume: position.check.resume_value,
        papers: position.check.document_value,
        status: checkStatus(position.check.result),
        source: comparedEntrySource(position.check),
      });
    if (start || end) {
      const dateNote = start?.check.note ?? end?.check.note ?? undefined;
      const entrySource = comparedEntrySource(start?.check ?? end?.check);
      workFields.push({
        label: "Employment dates",
        resume: dateResume,
        papers: datePapers,
        status: worstStatus(dateStatuses),
        source: [entrySource, dateNote].filter(Boolean).join(" — ") || undefined,
      });
    }
    const workDocs = new Set(
      docs
        .filter((d) => d.doc_type === "COE" || d.verification_result?.checks?.company)
        .map((d) => d.applicant_document_id),
    ).size;
    const work: MatchSection = {
      key: "work",
      title: "Work experience",
      hint: "Employer, title and dates",
      papersCount: workDocs,
      status:
        workFields.length === 0 ? "not-checked" : worstStatus(workFields.map((f) => f.status)),
      fields: workFields,
    };

    // — Education (certificate papers): degree + school —
    const degree = pickCheck(docs, "degree", ["Certificate", "Credential"]);
    const institution = pickCheck(docs, "institution", ["Certificate", "Credential"]);
    const eduFields: MatchEvidence[] = [];
    if (degree)
      eduFields.push({
        label: "Degree / program",
        resume: degree.check.resume_value ?? resumeEducation?.[0] ?? null,
        papers: degree.check.document_value,
        status: checkStatus(degree.check.result),
      });
    if (institution)
      eduFields.push({
        label: "School",
        resume: institution.check.resume_value,
        papers: institution.check.document_value,
        status: checkStatus(institution.check.result),
      });
    const eduDocs = new Set(
      docs
        .filter(
          (d) =>
            (d.doc_type === "Certificate" || d.doc_type === "Credential") &&
            d.verification_result?.checks?.degree,
        )
        .map((d) => d.applicant_document_id),
    ).size;
    const education: MatchSection = {
      key: "education",
      title: "Education",
      hint: "Degree and school",
      papersCount: eduDocs,
      status: eduFields.length === 0 ? "not-checked" : worstStatus(eduFields.map((f) => f.status)),
      fields: eduFields,
    };

    // — Certifications (credential papers): licence + issuer —
    const cert = pickCheck(docs, "certification", ["Credential", "Certificate"]);
    const issuer = pickCheck(docs, "issuer", ["Credential", "Certificate"]);
    const certFields: MatchEvidence[] = [];
    if (cert)
      certFields.push({
        label: "Certificate / licence",
        resume: cert.check.resume_value ?? resumeCertifications?.[0] ?? null,
        papers: cert.check.document_value,
        status: checkStatus(cert.check.result),
      });
    if (issuer)
      certFields.push({
        label: "Issued by",
        resume: issuer.check.resume_value,
        papers: issuer.check.document_value,
        status: checkStatus(issuer.check.result),
      });
    const certDocs = new Set(
      docs
        .filter(
          (d) =>
            (d.doc_type === "Credential" || d.doc_type === "Certificate") &&
            d.verification_result?.checks?.certification,
        )
        .map((d) => d.applicant_document_id),
    ).size;
    const certification: MatchSection = {
      key: "certification",
      title: "Certifications",
      hint: "Licences and issuer",
      papersCount: certDocs,
      status:
        certFields.length === 0 ? "not-checked" : worstStatus(certFields.map((f) => f.status)),
      fields: certFields,
    };

    return [identity, work, education, certification];
  })();

  const confirmed = sections.filter((s) => s.status === "confirmed").length;
  const needsReview = sections.filter((s) => s.status === "needs-review").length;
  const checked = sections.filter((s) => s.status !== "not-checked").length;
  const pct = Math.round((confirmed / sections.length) * 100);

  const overall =
    docs.length === 0
      ? { label: "No papers yet", className: "border-border bg-secondary text-muted-foreground" }
      : needsReview > 0
        ? {
            label: "Needs your review",
            className: "border-warning/30 bg-warning/10 text-warning-foreground",
          }
        : checked === sections.length && confirmed === sections.length
          ? { label: "All confirmed", className: "border-success/25 bg-success/10 text-success" }
          : {
              label: "Partially confirmed",
              className: "border-primary/25 bg-primary/10 text-primary",
            };

  const sectionMeta: Record<MatchSection["key"], { icon: React.ReactNode; empty: string }> = {
    identity: {
      icon: <User className="h-3.5 w-3.5 text-primary" />,
      empty: "No name could be read from the papers yet.",
    },
    work: {
      icon: <Briefcase className="h-3.5 w-3.5 text-primary" />,
      empty: "No employment paper (COE) uploaded.",
    },
    education: {
      icon: <GraduationCap className="h-3.5 w-3.5 text-primary" />,
      empty: "No education certificate uploaded.",
    },
    certification: {
      icon: <Award className="h-3.5 w-3.5 text-primary" />,
      empty: "No licence / credential uploaded.",
    },
  };

  const statusPill = (status: MatchSectionStatus, hasPapers = false) =>
    status === "confirmed" ? (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-success/25 bg-success/10 px-1.5 py-px text-[0.65rem] font-semibold text-success">
        <CheckCircle2 className="h-2.5 w-2.5" /> Confirmed
      </span>
    ) : status === "needs-review" ? (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-1.5 py-px text-[0.65rem] font-semibold text-warning-foreground">
        <AlertTriangle className="h-2.5 w-2.5" /> Check needed
      </span>
    ) : (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-secondary px-1.5 py-px text-[0.65rem] font-semibold text-muted-foreground">
        <Info className="h-2.5 w-2.5" /> {hasPapers ? "Can't confirm" : "No paper"}
      </span>
    );

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-display text-base font-semibold">
          <ShieldCheck className="h-4.5 w-4.5 text-primary" /> Resume vs Documents Match
        </h3>
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 text-[0.68rem] font-semibold",
            overall.className,
          )}
        >
          {overall.label}
        </span>
      </div>
      <p className="mt-0.5 text-[0.7rem] text-muted-foreground">
        Separate from the job-fit score — this only checks whether the uploaded papers support the
        resume.
      </p>

      {loading ? (
        <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Checking papers…
        </p>
      ) : docs.length === 0 ? (
        <p className="mt-3 flex items-center gap-2 rounded-md border border-dashed border-border px-3 py-2.5 text-xs text-muted-foreground">
          <Info className="h-4 w-4 shrink-0" /> No proof papers uploaded yet. Upload a COE,
          education certificate or licence to start the check.
        </p>
      ) : (
        <>
          <p className="mt-3 text-xs font-semibold">
            {confirmed} of {sections.length} sections confirmed
            {needsReview > 0 && (
              <span className="font-normal text-muted-foreground">
                {" "}
                · {needsReview} need{needsReview === 1 ? "s" : ""} your review
              </span>
            )}
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-success" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-3 flex-1 space-y-3 overflow-y-auto pr-0.5">
            {sections.map((section) => (
              <section key={section.key} className="rounded-lg border border-border/60 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    {sectionMeta[section.key].icon} {section.title}
                  </p>
                  {statusPill(section.status, section.papersCount > 0)}
                </div>
                <p className="mt-0.5 text-[0.68rem] text-muted-foreground">
                  {section.hint}
                  {section.papersCount > 0 && (
                    <>
                      {" "}
                      · checked in {section.papersCount} paper
                      {section.papersCount === 1 ? "" : "s"}
                    </>
                  )}
                </p>
                {section.fields.length === 0 ? (
                  <p className="mt-2 text-xs italic text-muted-foreground">
                    {sectionMeta[section.key].empty}
                  </p>
                ) : (
                  <ul className="mt-2 space-y-1.5">
                    {section.fields.map((field) => (
                      <li
                        key={field.label}
                        className="rounded-md bg-muted/40 px-2.5 py-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">{field.label}</span>
                          <span
                            className={cn(
                              "inline-flex shrink-0 items-center gap-1 text-[0.68rem] font-semibold",
                              field.status === "confirmed" && "text-success",
                              field.status === "needs-review" && "text-warning-foreground",
                              field.status === "not-checked" && "text-muted-foreground",
                            )}
                          >
                            {field.status === "confirmed" ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : field.status === "needs-review" ? (
                              <AlertTriangle className="h-3 w-3" />
                            ) : (
                              <Info className="h-3 w-3" />
                            )}
                            {field.status === "confirmed"
                              ? "Same"
                              : field.status === "needs-review"
                                ? "Different"
                                : "Can't confirm"}
                          </span>
                        </div>
                        <p
                          className="mt-0.5 truncate text-[0.7rem] text-muted-foreground"
                          title={field.resume ?? undefined}
                        >
                          Resume: {field.resume ?? "—"}
                        </p>
                        <p
                          className="truncate text-[0.7rem] text-muted-foreground"
                          title={field.papers ?? undefined}
                        >
                          Papers: {field.papers ?? "—"}
                        </p>
                        {field.source && (
                          <p
                            className="truncate text-[0.65rem] italic text-muted-foreground/80"
                            title={field.source}
                          >
                            {field.source}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
          <p className="mt-3 border-t border-border/60 pt-2 text-[0.68rem] text-muted-foreground">
            Paper-by-paper proof for each document is shown below.
          </p>
        </>
      )}
    </div>
  );
}

/* ============================================================================
   APPLICANT VIEW SCREEN — home of the moved stage sections (redesign).
   Mirrors SCREEN 2 of docs/mockups/applicant-management-redesign-mockup.html:
   a per-applicant screen with hero, stage stepper and section nav hosting the
   Interview / Assessment Test / Practical Assessment / Final Evaluation panels
   that used to be top-level tabs, alongside Current Stage, Application Details
   and Resume & Documents. Activity history lives in Current Stage.
   ============================================================================ */

type ViewPanel =
  | "current"
  | "details"
  | "resume"
  | "interview"
  | "test"
  | "practical"
  | "final"
  /* Requirements checklist — the New Hire Onboarding right-side card, shown
     here for applicants with an extended offer or already hired. */
  | "onboarding";

type ViewScreenDoc = {
  docType: VerificationDocType;
  title: string;
  originalCopy: boolean;
  fileName: string;
  uploadedAt: string;
};

type ApplicantViewScreenProps = {
  a: Applicant;
  docs: ViewScreenDoc[];
  interviews: Interview[];
  assessments: AssessmentResult[];
  assessmentTests: AssessmentTestRow[];
  practicalTests: PracticalTestRow[];
  finalEvaluations: FinalEvaluationRow[];
  audit: AuditEntry[];
  passing: number;
  onBack: () => void;
  onReview: () => void;
  /** Re-runs the screening with the current supporting-document evidence. */
  onRecomputeRanking?: () => void;
  /** True while the recompute request is in flight. */
  recomputingRanking?: boolean;
  onSchedule: () => void;
  onStartInterview: () => void;
  /** Accept & schedule / Schedule interview — jumps to Interview Scheduling prefilled. */
  onAcceptAndSchedule?: () => void;
  /** Reschedule — jumps to Interview Scheduling prefilling the live booking. */
  onRescheduleInterview?: (i: Interview) => void;
  /** Mirrors the Pipeline Overview flags for the viewed applicant. */
  showAcceptInterview?: boolean;
  showScheduleInterview?: boolean;
  showRescheduleInterview?: boolean;
  onStartTest: () => void;
  onStartPractical: () => void;
  /** Generates a no-login link the APPLICANT opens to answer the assessment
   *  test on their own device (staff runner stays for supervised sessions). */
  onCopyTestLink?: () => void;
  /** True while the applicant test link is being generated. */
  inviteBusy?: boolean;
  onStartFinal: () => void;
  onViewInterview: (r: AssessmentResult) => void;
  onViewTest: (r: AssessmentTestRow) => void;
  onViewPractical: (t: PracticalTestRow) => void;
  onViewFinal: (f: FinalEvaluationRow) => void;
  /** Verified choice for this applicant's final evaluation (if any). */
  verifiedFinal?: FinalRecommendation | null;
  /** True once the applicant is Hired / Rejected (decision locked). */
  finalDecided?: boolean;
  /** Opens the Verify Candidate Decision dialog for the given final record. */
  onVerifyFinal?: (f: FinalEvaluationRow) => void;
  /** Shown when the profile was opened from the New Hire Onboarding pipeline —
   *  a second back action returning to that list. */
  onBackToOnboarding?: (() => void) | undefined;
  /** True when the profile was opened from the New Hire Onboarding
   *  "View Checklist" action: the Requirements Checklist section is shown (and
   *  opened) even if the applicant sits outside the usual Offer / Hired stages. */
  forceChecklist?: boolean | undefined;
};

/** Humanized hiring milestones for the stage stepper (maps internal stages). */
const VIEW_MILESTONES: { key: ViewPanel; label: string }[] = [
  /* Screening — the resume screening result and the supporting verification
     documents live in the Resume & Documents section, so this node opens it
     instead of the generic Current Stage overview. */
  { key: "resume", label: "Screening" },
  { key: "interview", label: "Interview" },
  { key: "test", label: "Assessment Test" },
  { key: "practical", label: "Practical Assessment" },
  { key: "final", label: "Final Evaluation" },
  /* Onboarding step — the Requirements Checklist card moved here from New Hire
     Onboarding. Sits after the recruitment pipeline closes (offer / hired). */
  { key: "onboarding", label: "Requirements Checklist" },
];

/** Colour state of one node on the applicant progress bar. */
type StageProgressState = "done" | "current" | "pending";

/** Index (0-based) of the milestone the applicant currently sits on. */
const milestoneIndexOf = (a: Applicant) => {
  // The pipeline is behind the applicant (final evaluation recorded, offer,
  // hired or rejected) — every milestone counts as reached.
  // "Accepted" is NOT one of these: it means "accepted for interview", so the
  // screening stage is done and the interview is next.
  if (["Final Evaluation", "Offer", "Hired", "Rejected"].includes(a.stage))
    return VIEW_MILESTONES.length;
  if (a.stage === "Practical Test") return 3;
  if (["Assessment Test", "Assessed"].includes(a.stage)) return 2;
  if (a.stage === "Interview Scheduled") return 1;
  return 0;
};

/** Module-level department resolver for the View screen (mirrors the
 *  main function's `deptForPosition` but works outside its scope). */
const departmentOf = (position: string) =>
  positions.find((p) => p.title === position)?.department ??
  jobs.find((j) => j.title === position)?.department ??
  "—";

/** Checklist item text → submission lookup key (mirrors New Hire Onboarding). */
const checklistKeyOf = (text: string) => text.trim().toLowerCase();

/** Employee submission attached to one requirements checklist item. */
type ChecklistSubmission = {
  fileName?: string;
  fileUrl?: string;
  notes?: string;
  submittedAt?: string;
};

/** One requirements checklist row — same status language as the New Hire
 *  Onboarding card: Verified (green), Submitted · pending review (red),
 *  Pending (caution). Uploaded documents stay viewable from here, and the row
 *  is clickable while the card is in edit mode (tick / untick). */
function RequirementItemRow({
  item,
  done,
  submission,
  editing,
  onToggle,
}: {
  item: string;
  done: boolean;
  submission?: ChecklistSubmission | undefined;
  /** True while "Edit Checklist" is active — then the row reacts to clicks. */
  editing: boolean;
  onToggle: () => void;
}) {
  const submitted = Boolean(
    submission && (submission.submittedAt || submission.fileName || submission.notes),
  );
  return (
    <li
      className={cn(
        "rounded-md border px-3 py-2 text-sm transition-colors",
        done
          ? "border-success/30 bg-success/10"
          : submitted
            ? "border-destructive/30 bg-destructive/5"
            : "border-border bg-card",
        editing && "cursor-pointer hover:border-primary/40",
      )}
    >
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          disabled={!editing}
          onClick={onToggle}
          aria-label={item}
          title={editing ? "Click to tick / untick this requirement" : undefined}
          className={cn(
            "flex min-w-0 flex-1 items-center gap-2.5 bg-transparent text-left",
            editing ? "cursor-pointer" : "cursor-default",
          )}
        >
          {done ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
          ) : submitted ? (
            <Hourglass className="h-4 w-4 shrink-0 text-destructive" />
          ) : (
            <Circle className="h-4 w-4 shrink-0 text-caution" />
          )}
          <span
            className={cn(
              "min-w-0 flex-1",
              !done && submitted ? "text-destructive" : "text-foreground",
            )}
          >
            {item}
          </span>
        </button>
        {done ? (
          <Badge
            variant="outline"
            className="shrink-0 border-success/40 bg-success/10 text-[10px] text-success"
          >
            Verified
          </Badge>
        ) : submitted ? (
          <Badge
            variant="outline"
            className="shrink-0 border-destructive/40 bg-destructive/10 text-[10px] text-destructive"
          >
            Submitted · pending review
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="shrink-0 border-caution/40 bg-caution/10 text-[10px] text-caution"
          >
            Pending
          </Badge>
        )}
      </div>
      {submission?.fileName && (
        <div
          className={cn(
            "mt-2 flex items-center justify-between gap-2 rounded-md border px-2 py-1.5",
            done ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5",
          )}
        >
          <span className="flex min-w-0 items-center gap-1.5 text-xs text-foreground">
            <FileCheck2
              className={cn("h-3.5 w-3.5 shrink-0", done ? "text-success" : "text-destructive")}
            />
            <span className="truncate" title={submission.fileName}>
              {submission.fileName}
            </span>
          </span>
          {submission.fileUrl && (
            <a
              href={submission.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
            >
              <Button size="sm" variant="ghost" className="h-6 cursor-pointer px-2 text-[11px]">
                <ExternalLink className="mr-1 h-3 w-3" /> View
              </Button>
            </a>
          )}
        </div>
      )}
      {submission?.notes && (
        <p className="mt-1.5 rounded-md bg-card px-2 py-1.5 text-[11px] leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">Employee note: </span>
          {submission.notes}
        </p>
      )}
    </li>
  );
}

/** Requirements checklist card — the New Hire Onboarding right-side card,
 *  moved into this View profile for applicants whose offer was extended or
 *  who are already hired. Progress and submissions sync with onboarding. */
function RequirementsChecklistCard({
  linkedHire,
  items,
  submissions,
  done,
  progress,
}: {
  linkedHire: NewHire | null;
  items: { item: string; done: boolean }[];
  submissions: Record<string, ChecklistSubmission>;
  done: number;
  progress: number;
}) {
  /* Editing mirrors the New Hire Onboarding card: ticking is staged behind
     "Edit Checklist" (rows only react to clicks while editing), "Save" keeps
     the ticks and "Cancel" reverts them. Every tick persists to
     employee_onboarding_items through the shared hire store, so the new hire's
     portal and every admin screen stay in sync. */
  const [editing, setEditing] = useState(false);
  const [snapshot, setSnapshot] = useState<NewHire["checklist"] | null>(null);
  /** Whether an evaluation was pending when editing began — used to restore it
   *  if the edit is cancelled (the store stops it as soon as a tick is lost). */
  const [evaluationWasRequested, setEvaluationWasRequested] = useState(false);
  /** The checklist is editable only once the hire record already exists. */
  const canEdit = Boolean(linkedHire?.dbId);

  const startEdit = () => {
    if (!linkedHire) return;
    setSnapshot(linkedHire.checklist.map((c) => ({ ...c })));
    setEvaluationWasRequested(Boolean(linkedHire.evaluationRequestedAt));
    setEditing(true);
  };

  const saveEdit = () => {
    setSnapshot(null);
    setEvaluationWasRequested(false);
    setEditing(false);
    toast.success("Checklist saved");
  };

  const cancelEdit = () => {
    if (linkedHire && snapshot) {
      hireStore.setHires((prev) =>
        prev.map((h) => (h.id === linkedHire.id ? { ...h, checklist: snapshot } : h)),
      );
      /* Reverting puts every tick back. If the pending evaluation was stopped
         because the checklist dipped below 100% while editing, restore it —
         Cancel must undo the whole edit, evaluation request included. */
      const phaseItems = snapshot.filter((c) => (c.phase ?? "Probationary") === "Probationary");
      const pool =
        linkedHire.stage === "Probationary" && phaseItems.length > 0 ? phaseItems : snapshot;
      const restoredComplete = pool.length > 0 && pool.every((c) => c.done);
      if (evaluationWasRequested && !linkedHire.evaluationRequestedAt && restoredComplete) {
        hireStore.requestEvaluation(linkedHire.id);
        toast.info(
          `Evaluation request for ${linkedHire.name} restored — the checklist is complete.`,
        );
      }
    }
    setSnapshot(null);
    setEvaluationWasRequested(false);
    setEditing(false);
  };

  /** Clicks a requirement while editing — persists the tick immediately. */
  const toggleItem = (item: string, itemDone: boolean) => {
    if (!editing || !linkedHire) return;
    const index = linkedHire.checklist.findIndex((c) => c.item === item);
    if (index === -1) return;
    hireStore.toggleItem(linkedHire.id, index, !itemDone);
  };

  /** True while the hire is handed over to Performance and no result has
   *  arrived — mirrors the New Hire Onboarding waiting state. */
  const awaitingEvaluation = Boolean(linkedHire?.evaluationRequestedAt);

  /* --- Hire-stage actions (the same checklist-driven flow as New Hire
     Onboarding): advancing to Probationary and the evaluation hand-over both
     unlock only when every requirement is ticked. */
  const advanceToProbationary = () => {
    if (!linkedHire?.dbId) return;
    hireStore.promoteHire(linkedHire.id);
    toast.success(
      `${linkedHire.name} moved to Probationary — portal account created & login credentials sent to ${linkedHire.email} (default password: ${DEFAULT_ACCOUNT_PASSWORD})`,
    );
  };

  const requestEvaluation = () => {
    if (!linkedHire) return;
    hireStore.requestEvaluation(linkedHire.id);
    toast.success(`Evaluation requested for ${linkedHire.name}`);
  };

  const cancelEvaluationRequest = () => {
    if (linkedHire) hireStore.cancelEvaluationRequest(linkedHire.id);
  };

  const regularizeHire = () => {
    if (!linkedHire) return;
    toast.success(`${linkedHire.name} regularized — moved to Employee Records`, {
      description: "The checklist, portal account and Core HCM hand-over are preserved.",
    });
    hireStore.cancelEvaluationRequest(linkedHire.id);
    hireStore.promoteHire(linkedHire.id);
  };

  return (
    <Card className="flex h-full flex-col border-border/70">
      <CardContent className="flex min-h-0 flex-1 flex-col p-6">
        <div className="flex min-h-[16rem] flex-1 flex-col">
          <div className="flex items-center justify-between text-xs">
            <span className="eyebrow">Requirements checklist</span>
            <span
              className={cn(
                "font-medium",
                progress === 100 ? "text-success" : "text-muted-foreground",
              )}
            >
              {progress}%
            </span>
          </div>
          <Progress
            value={progress}
            className="mt-2 h-2 [&>div]:bg-success [&>div]:transition-all"
          />

          <div className="mt-3 flex w-full items-center justify-between rounded-md border border-border/70 bg-muted/30 px-3 py-2 text-xs font-medium">
            <span>Checklist items ({items.length})</span>
            <span className="text-muted-foreground">
              {done}/{items.length}
            </span>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
            {items.length === 0 ? (
              <p className="mt-3 flex items-center gap-2 rounded-md border border-dashed border-border px-3 py-2.5 text-xs text-muted-foreground">
                <Info className="h-4 w-4 shrink-0" /> No pre-employment checklist is configured for
                this position yet.
              </p>
            ) : (
              <ul className="mt-3 space-y-1.5">
                {items.map((item, idx) => (
                  <RequirementItemRow
                    key={`${item.item}-${idx}`}
                    item={item.item}
                    done={item.done}
                    submission={submissions[checklistKeyOf(item.item)]}
                    editing={editing && canEdit}
                    onToggle={() => toggleItem(item.item, item.done)}
                  />
                ))}
              </ul>
            )}
          </div>

          {/* Editing controls — same flow as the New Hire Onboarding card. */}
          {canEdit && (
            <div className="mt-3 flex flex-wrap items-stretch gap-2">
              {editing ? (
                <>
                  <Button
                    variant="outline"
                    className="h-10 cursor-pointer"
                    onClick={() => {
                      if (linkedHire) hireStore.setAllItemsDone(linkedHire.id, true);
                    }}
                  >
                    Mark all done
                  </Button>
                  <Button className="h-10 cursor-pointer" onClick={saveEdit}>
                    <Save className="mr-1.5 h-4 w-4" /> Save
                  </Button>
                  <Button variant="outline" className="h-10 cursor-pointer" onClick={cancelEdit}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Button variant="outline" className="h-10 cursor-pointer" onClick={startEdit}>
                  <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit Checklist
                </Button>
              )}
            </div>
          )}

          {/* Hire-stage actions — the checklist unlocks them: advancing to
              Probationary and the evaluation hand-over both need 100%. */}
          {linkedHire && (
            <div className="mt-4 space-y-2 border-t border-border/60 pt-4">
              <p className="eyebrow">
                {linkedHire.stage === "Pre-onboarding"
                  ? "Pre-onboarding actions"
                  : linkedHire.stage === "Probationary"
                    ? "Probationary actions"
                    : "Onboarding record"}
              </p>

              {linkedHire.stage === "Pre-onboarding" && (
                <>
                  <Button
                    className="h-10 w-full cursor-pointer"
                    disabled={progress !== 100}
                    title={
                      progress === 100
                        ? "Move this hire to Probationary — portal account created and credentials sent"
                        : "Complete every checklist item to unlock advancing to Probationary"
                    }
                    onClick={advanceToProbationary}
                  >
                    Advance to Probationary
                  </Button>
                  {progress !== 100 && (
                    <p className="text-[11px] text-muted-foreground">
                      Complete every checklist item to unlock advancing to Probationary.
                    </p>
                  )}
                </>
              )}

              {linkedHire.stage === "Probationary" && !awaitingEvaluation && (
                <>
                  <Button
                    className="h-10 w-full cursor-pointer bg-gold text-gold-foreground hover:bg-gold/90"
                    disabled={progress !== 100}
                    title={
                      progress === 100
                        ? "Hand this hire over to Performance for the probationary evaluation"
                        : "Complete every probationary checklist item to unlock the evaluation request"
                    }
                    onClick={requestEvaluation}
                  >
                    <Send className="mr-1.5 h-4 w-4" /> Request for evaluation
                  </Button>
                  {progress !== 100 && (
                    <p className="text-[11px] text-muted-foreground">
                      Complete every probationary checklist item to unlock the evaluation request.
                    </p>
                  )}
                </>
              )}

              {linkedHire.stage === "Probationary" && awaitingEvaluation && (
                <>
                  {/* Evaluation hand-over status — animated loader, review badge
                      and a pulsing indeterminate bar while Performance works. */}
                  <div className="animate-in overflow-hidden rounded-xl border border-gold/40 bg-gold/5 fade-in duration-500">
                    <div className="flex items-center gap-3 border-b border-gold/30 bg-gold/10 px-4 py-3">
                      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center">
                        <span className="absolute inline-flex h-9 w-9 animate-ping rounded-full bg-gold/20" />
                        <Loader2 className="relative h-5 w-5 animate-spin text-gold-foreground dark:text-gold" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-display text-sm font-semibold leading-tight text-gold-foreground dark:text-gold">
                          Waiting for evaluation
                        </p>
                        <p className="text-[0.7rem] text-muted-foreground">
                          Sent to Performance
                          {linkedHire.evaluationRequestedAt
                            ? ` on ${new Date(linkedHire.evaluationRequestedAt).toLocaleDateString(
                                "en-US",
                                { month: "short", day: "numeric", year: "numeric" },
                              )}`
                            : ""}{" "}
                          — no result yet.
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="shrink-0 border-gold/40 bg-gold/10 text-[0.65rem] text-gold-foreground dark:text-gold"
                      >
                        In review
                      </Badge>
                    </div>
                    <div className="h-1 w-full overflow-hidden bg-gold/10">
                      <div className="h-full w-1/2 animate-pulse rounded-r-full bg-gold/70" />
                    </div>
                  </div>

                  {/* Both actions span the checklist card width. */}
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="h-10 w-full cursor-pointer"
                      onClick={cancelEvaluationRequest}
                    >
                      <X className="mr-1.5 h-4 w-4" /> Cancel request
                    </Button>
                    <Button
                      className="h-10 w-full cursor-pointer bg-gold text-gold-foreground hover:bg-gold/90"
                      onClick={regularizeHire}
                    >
                      <CheckCircle2 className="mr-1.5 h-4 w-4" /> Regular the employee
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {(editing || !linkedHire) && (
            <p className="mt-3 flex items-start gap-2 rounded-md border border-dashed border-border bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                {editing
                  ? "Edit mode is on — click a requirement to tick or untick it. Save keeps the changes; Cancel reverts them."
                  : "The pre-employment requirements for this position. The checklist is auto-filed in New Hire Onboarding once the hire record is created — then it becomes editable here."}
              </span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ApplicantViewScreen({
  a,
  docs,
  interviews,
  assessments,
  assessmentTests,
  practicalTests,
  finalEvaluations,
  audit,
  passing,
  onBack,
  onReview,
  onRecomputeRanking,
  recomputingRanking,
  onSchedule,
  onStartInterview,
  onAcceptAndSchedule,
  onRescheduleInterview,
  showAcceptInterview,
  showScheduleInterview,
  showRescheduleInterview,
  onStartTest,
  onStartPractical,
  onCopyTestLink,
  inviteBusy,
  onStartFinal,
  onViewInterview,
  onViewTest,
  onViewPractical,
  onViewFinal,
  verifiedFinal,
  finalDecided,
  onVerifyFinal,
  onBackToOnboarding,
  forceChecklist,
}: ApplicantViewScreenProps) {
  const [panel, setPanel] = useState<ViewPanel>(() =>
    /* Arriving from New Hire Onboarding's "View Checklist" — or an Offer / Hired
       applicant opening the profile — lands straight on the Requirements
       Checklist card moved here from New Hire Onboarding. */
    forceChecklist === true || a.stage === "Offer" || a.stage === "Hired"
      ? "onboarding"
      : "current",
  );
  /* Position rule from the API (job-post flag / designated positions) with the
     static list as fallback — must match the practical API gate. */
  const requiresPrac = requiresPractical(a.position, a.requiresPractical);
  // Live (non-cancelled) booking first — mirrors the Pipeline Overview row.
  const liveInterview = interviews.find((i) => i.status !== "Cancelled");
  const interview = liveInterview ?? interviews[0];
  const assessment = assessments[0];
  const test = assessmentTests[0];
  const practical = practicalTests[0];
  const final = finalEvaluations[0];
  /** Ready-checks mirror the removed Interview / Test / Practical / Final tabs. */
  const readyForTest = a.stage === "Assessed" && assessment?.result === "Passed";
  const readyForPractical =
    a.stage === "Assessment Test" && requiresPrac && test?.result === "Passed";
  const readyForFinal =
    (a.stage === "Practical Test" || a.stage === "Assessment Test") &&
    test?.result === "Passed" &&
    (!requiresPrac || practical?.result === "Passed");

  const tier = computeTopCandidateTier(
    a.status,
    docs.map((d) => ({ docType: d.docType, originalCopy: d.originalCopy })),
  );
  const passedScreening = a.score >= passing;

  /** Offer extended or hired — the stages whose applicants show the
   *  requirements checklist (the New Hire Onboarding card moved into this
   *  View profile). Declared early because the auto-open effect below reads it.
   *  The "View Checklist" arrival from the onboarding pipeline forces it on so
   *  the clicked-through checklist is always the section that opens. */
  const showRequirementsChecklist =
    forceChecklist === true || a.stage === "Offer" || a.stage === "Hired";

  /**
   * Per-stage progress behind the stepper, derived from the recorded results
   * (interview assessment / test / practical / final evaluation) plus the
   * applicant's stage — not from the stage string alone — so the bar reacts the
   * moment a process is completed:
   *   done    → green   (that stage is finished, or was skipped)
   *   current → red     (the stage being worked on right now)
   *   pending → gray    (not reached yet)
   * A practical the role does not require turns green once the applicant has
   * advanced past it, and recording the final evaluation turns every applicable
   * stage green.
   */
  const stepStates: StageProgressState[] = (() => {
    /* "Accepted" means accepted *for interview* — the pipeline is not closed,
       so it must not read as finished here. */
    const closed = ["Offer", "Hired", "Rejected"].includes(a.stage);
    const staged = [
      /* 0 Screening */ closed || a.stage !== "Screened",
      /* 1 Interview */ closed || !!assessment,
      /* 2 Test      */ closed || !!test,
      /* 3 Practical */ requiresPrac ? closed || !!practical : false,
      /* 4 Final     */ closed || !!final || a.stage === "Final Evaluation",
    ];
    const states: StageProgressState[] = staged.map((s) => (s ? "done" : "pending"));
    // A stage the role skips is never "worked on": leave it out when locating
    // the current stage, then show it green once the applicant is past it.
    const applicable = (i: number) => requiresPrac || i !== 3;
    const currentIdx = states.findIndex((s, i) => applicable(i) && s === "pending");
    if (!requiresPrac && (currentIdx === -1 || currentIdx > 3)) states[3] = "done";
    if (currentIdx !== -1) states[currentIdx] = "current";
    return states;
  })();

  /**
   * Auto-advance the visible section. When a process is completed while this
   * screen is open (interview recorded, test finished, practical scored, final
   * evaluation saved) the next section opens by itself — the progress of the
   * next step is visible immediately, without refreshing the page.
   */
  const flowKey = [
    a.id,
    a.stage,
    interview ? "interview" : "-",
    assessment?.result ?? "-",
    test?.result ?? "-",
    requiresPrac ? (practical?.result ?? "-") : "skip",
    final ? (final.recommendation ?? "final") : "-",
  ].join("|");
  const lastFlowKey = useRef(flowKey);
  useEffect(() => {
    if (lastFlowKey.current === flowKey) return;
    lastFlowKey.current = flowKey;
    // Leave the user alone when they are reading reference material — or the
    // requirements checklist card they arrived on.
    if (panel === "details" || panel === "resume" || panel === "onboarding") return;
    // Open the stage being worked on now (the first stage that is not finished).
    const nextIdx = stepStates.findIndex((s) => s === "current");
    // A closed pipeline (offer extended / hired) opens the requirements
    // checklist — the card moved here from New Hire Onboarding.
    const target =
      nextIdx === -1
        ? showRequirementsChecklist
          ? "onboarding"
          : "final"
        : VIEW_MILESTONES[nextIdx]!.key;
    setPanel(target === "practical" && !requiresPrac ? "final" : target);
    // `stepStates` is rebuilt from the same inputs as `flowKey`, so the flow key
    // is enough to know when the progress changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flowKey, a, panel, requiresPrac]);

  const stageDesc: Record<string, string> = {
    Screened:
      "Resume was screened by the NLP service. Review the result to accept, refer or reject.",
    "Interview Scheduled":
      "An interview slot has been booked. Start the interview assessment on the interview day.",
    Assessed: "The interview has been assessed. Passed candidates unlock the assessment test.",
    "Assessment Test":
      "The job-specific test is complete for this applicant — next is the practical (when required) or the final evaluation.",
    "Practical Test":
      "The hands-on practical exam is complete — the final evaluation is now available.",
    "Final Evaluation":
      "All process stages are complete — record the final evaluation to decide the hire.",
    Accepted: "The applicant has been accepted and can be scheduled for onboarding.",
    Offer: "An offer has been extended to this applicant.",
    Hired: "The applicant has been hired and moved to New Hire Onboarding.",
    Rejected: "This applicant was not selected for the role.",
  };

  const docCount = docs.length + (a.resumeUrl ? 1 : 0);

  /** Server-side verification documents for this applicant (the source of
   *  truth — the `docs` prop only holds uploads staged in this session).
   *  Loaded so View profile → Resume & Documents shows every uploaded
   *  supporting document, not just session-staged ones. */
  const [serverDocs, setServerDocs] = useState<Record<string, ApiApplicantDocument>>({});
  const [serverDocsLoading, setServerDocsLoading] = useState(false);
  const [reverifyingServerDocId, setReverifyingServerDocId] = useState<string | null>(null);
  const serverDocList = Object.values(serverDocs);
  useEffect(() => {
    if (!a.dbId) {
      setServerDocs({});
      return;
    }
    let cancelled = false;
    setServerDocsLoading(true);
    applicantDocumentsApi
      .list(a.dbId)
      .then((res) => {
        if (cancelled) return;
        const map: Record<string, ApiApplicantDocument> = {};
        (res?.data ?? []).forEach((doc) => {
          map[String(doc.applicant_document_id)] = doc;
        });
        setServerDocs(map);
      })
      .catch((e) => {
        if (!cancelled) console.warn("Could not load verification documents:", e);
      })
      .finally(() => {
        if (!cancelled) setServerDocsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [a.dbId]);
  /** Re-runs supporting-document verification from the View screen. */
  const reverifyServerDoc = async (doc: ApiApplicantDocument) => {
    const key = String(doc.applicant_document_id);
    setReverifyingServerDocId(key);
    try {
      const updated = await applicantDocumentsApi.verify(doc.applicant_document_id);
      setServerDocs((prev) => ({ ...prev, [key]: updated }));
      toast.success(`Re-verification complete: ${updated.verification_status ?? "PENDING"}`);
    } catch (e) {
      console.warn("Re-verification failed:", e);
      toast.error("Could not re-verify the document. Is the NLP service online?");
    } finally {
      setReverifyingServerDocId(null);
    }
  };

  /* ------------------------------------------------------------------ */
  /* Requirements checklist — the New Hire Onboarding right-side card    */
  /* moved into this View profile. Offer / Hired applicants only.        */
  /* ------------------------------------------------------------------ */

  /** Live new-hire records — the checklist source, linked by applicant id. */
  const hires = useHires();
  const masterChecklists = useMasterChecklists();

  /** The onboarding record created for this applicant (falls back to name +
   *  position for rows saved before the applicant link was stored). */
  const linkedHire = useMemo(() => {
    if (!showRequirementsChecklist) return null;
    const byApplicant =
      a.dbId != null
        ? hires.find((h) => h.applicantId != null && h.applicantId === a.dbId)
        : undefined;
    if (byApplicant) return byApplicant;
    return hires.find((h) => h.name === a.name && h.position === a.position) ?? null;
  }, [hires, a.dbId, a.name, a.position, showRequirementsChecklist]);

  /** Pre-employment requirements: the hire's own checklist when the onboarding
   *  record exists, otherwise the Pre-onboarding template items that apply to
   *  the position (the same rule the backend uses when the hire is filed). */
  const requirementItems = useMemo(() => {
    if (!showRequirementsChecklist) return [] as { item: string; done: boolean }[];
    if (linkedHire) {
      const phaseItems = linkedHire.checklist.filter(
        (c) => (c.phase ?? "Probationary") === "Pre-onboarding",
      );
      const pool = phaseItems.length > 0 ? phaseItems : linkedHire.checklist;
      return pool.map((c) => ({ item: c.item, done: c.done }));
    }
    return masterChecklists
      .filter((c) => (c.phase ?? "Probationary") === "Pre-onboarding")
      .filter((c) => (c.status ?? "Active") === "Active")
      .filter(
        (c) =>
          c.positions === "all" || !c.positions || (c.positions as string[]).includes(a.position),
      )
      .flatMap((c) => c.items)
      .map((item) => ({ item, done: false }));
  }, [showRequirementsChecklist, linkedHire, masterChecklists, a.position]);

  /** Employee submissions (uploads / notes) per checklist item, straight from
   *  employee_onboarding_items — submitted documents stay visible here. */
  const [hireSubmissions, setHireSubmissions] = useState<
    Record<string, { fileName?: string; fileUrl?: string; notes?: string; submittedAt?: string }>
  >({});
  useEffect(() => {
    const dbId = linkedHire?.dbId;
    if (!dbId) {
      setHireSubmissions({});
      return;
    }
    let cancelled = false;
    onboardingItemsApi
      .listForNewHire(dbId)
      .then((items) => {
        if (cancelled) return;
        const map: Record<
          string,
          { fileName?: string; fileUrl?: string; notes?: string; submittedAt?: string }
        > = {};
        (items ?? []).forEach((i) => {
          const fileUrl =
            i.employee_onboarding_item_id != null
              ? onboardingItemsApi.documentUrl(i.employee_onboarding_item_id)
              : i.file_url;
          map[checklistKeyOf(String(i.item_text ?? ""))] = {
            ...(i.file_name ? { fileName: i.file_name } : {}),
            ...(fileUrl ? { fileUrl } : {}),
            ...(i.notes ? { notes: i.notes } : {}),
            ...(i.submitted_at ? { submittedAt: i.submitted_at } : {}),
          };
        });
        setHireSubmissions(map);
      })
      .catch((err) => console.warn("Could not load the onboarding submissions:", err));
    return () => {
      cancelled = true;
    };
    // Only the linked database id matters — the store replaces the array on
    // every 15s sync, which would otherwise refetch the same submissions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkedHire?.dbId]);

  const checklistDone = requirementItems.filter((i) => i.done).length;
  const checklistProgress =
    requirementItems.length > 0 ? Math.round((checklistDone / requirementItems.length) * 100) : 0;

  /* --- Stepper states including the onboarding step ------------------------
     The requirements checklist is the 6th milestone, right after the final
     evaluation: red while requirements are still open, green once every item is
     ticked, gray until the applicant reaches the offer / hired stage. */
  const checklistMilestoneState: StageProgressState = showRequirementsChecklist
    ? requirementItems.length > 0 && checklistDone === requirementItems.length
      ? "done"
      : "current"
    : "pending";
  const milestoneStates: StageProgressState[] = [...stepStates, checklistMilestoneState];

  /** Stepper click — jumps straight to the clicked milestone's section. */
  const openMilestone = (key: ViewPanel) => {
    if (key === "onboarding" && !showRequirementsChecklist) return;
    setPanel(key === "practical" && !requiresPrac ? "final" : key);
  };

  /** Leaves the checklist section automatically when the applicant's stage is
   *  no longer Offer / Hired (e.g. the live record moved on). */
  useEffect(() => {
    if (panel === "onboarding" && !showRequirementsChecklist) setPanel("current");
  }, [panel, showRequirementsChecklist]);

  /** One entry of the section nav. `done` turns the badge into a green check so
   *  a finished process is visible at a glance (and, for positions that skip it,
   *  the practical reads completed as soon as the applicant reaches the final
   *  evaluation). */
  const sectionBtn = (
    id: ViewPanel,
    label: string,
    icon: React.ReactNode,
    badge?: number,
    done?: boolean,
  ) => (
    <button
      type="button"
      onClick={() => setPanel(id)}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold transition-colors",
        panel === id
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {icon} {label}
      {done ? (
        <span
          className={cn(
            "ml-auto inline-flex items-center gap-1 rounded-full px-1.5 py-px text-[0.6rem] font-bold",
            panel === id ? "bg-success/25 text-success-foreground" : "bg-success/15 text-success",
          )}
          title="Completed"
        >
          <Check className="h-3 w-3" strokeWidth={3} /> Done
        </span>
      ) : (
        badge !== undefined &&
        badge > 0 && (
          <span className="ml-auto min-w-4 rounded-full bg-secondary px-1.5 text-center text-[0.65rem] font-bold text-secondary-foreground">
            {badge}
          </span>
        )
      )}
    </button>
  );

  const emptyNote = (text: string) => (
    <p className="flex items-center gap-2 rounded-md border border-dashed border-border px-3 py-2.5 text-xs text-muted-foreground">
      <Info className="h-4 w-4 shrink-0" /> {text}
    </p>
  );

  return (
    <div className="mt-6 space-y-5">
      {/* Top bar — Review lives in Resume & Documents, scheduling stays here */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Applicants
          </Button>
          {onBackToOnboarding && (
            <Button variant="outline" size="sm" onClick={onBackToOnboarding}>
              <ClipboardList className="mr-1.5 h-3.5 w-3.5" /> Back to New Hire Onboarding
            </Button>
          )}
        </div>
        <Button size="sm" onClick={onSchedule}>
          <CalendarClock className="mr-1.5 h-3.5 w-3.5" /> Book Interview
        </Button>
      </div>

      {/* Applicant hero — mirrors the profile mockup: identity + resume file card */}
      <Card className="border-border/70">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-4">
            <Avatar className="h-14 w-14 shrink-0">
              <AvatarFallback className="bg-primary text-lg font-semibold text-primary-foreground">
                {initials(a.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-2xl font-semibold">{a.name}</h2>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Briefcase className="h-3.5 w-3.5 text-primary" />
                <span className="font-medium text-foreground">{a.position}</span>
              </p>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" /> Applied: {displayAppliedAt(a.appliedAt)}
                </span>
                <Badge variant="outline" className={cn("gap-1", statusMeta[a.status].className)}>
                  <span className={cn("h-1.5 w-1.5 rounded-full", statusMeta[a.status].dot)} />
                  {statusMeta[a.status].label}
                </Badge>
              </p>
              {/* Onboarding hand-over — the employee's first day of work. */}
              {linkedHire?.startDate && (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarClock className="h-3.5 w-3.5 text-gold-foreground dark:text-gold" />
                  Start Date as Employee:{" "}
                  <span className="font-medium text-foreground">{linkedHire.startDate}</span>
                </p>
              )}
            </div>
            {a.resumeUrl ? (
              <div className="ml-auto flex shrink-0 items-center gap-2.5 rounded-lg border border-border/70 px-3 py-2">
                <ScreeningDocIcon docType="resume" label="RES" />
                <div className="min-w-0 max-w-52">
                  <p
                    className="truncate text-xs font-semibold"
                    title={a.resumeOriginalName || undefined}
                  >
                    {a.resumeOriginalName || "Resume / CV"}
                  </p>
                  <p className="text-[0.7rem] text-muted-foreground">
                    PDF · Screened at {Math.round(a.score)}%
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 shrink-0"
                  title="Download resume"
                  onClick={() => window.open(a.resumeUrl!, "_blank", "noopener")}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="ml-auto text-right">
                <p className="eyebrow">Resume Score</p>
                <p
                  className={cn(
                    "font-display text-3xl font-semibold",
                    a.score >= passing
                      ? "text-success"
                      : a.score >= 60
                        ? "text-caution"
                        : "text-destructive",
                  )}
                >
                  {a.score}%
                </p>
                <p className="text-[0.65rem] text-muted-foreground">
                  {passedScreening ? "Passed screening" : "Below passing score"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stage stepper — timeline: Screening → Interview → Assessment Test →
          Practical Assessment → Final Evaluation → Requirements Checklist.
          Every node is clickable and opens its section; the checklist node
          opens the onboarding step. */}
      <Card className="border-border/70">
        <CardContent className="overflow-x-auto px-6 py-5">
          <div className="flex min-w-[640px] items-start">
            {VIEW_MILESTONES.map((m, i) => {
              /* Colour comes from the recorded progress, not the stage label:
                 completed → green, the stage being worked on → red, the rest → gray. */
              const state: StageProgressState = milestoneStates[i] ?? "pending";
              const done = state === "done";
              const current = state === "current";
              const isPrac = m.label === "Practical Assessment";
              const skipped = isPrac && !requiresPrac;
              const isChecklistStep = m.key === "onboarding";
              /** Verdict already recorded for this stage, when there is one. */
              const verdict =
                i === 1
                  ? (assessment?.result ?? null)
                  : i === 2
                    ? (test?.result ?? null)
                    : i === 3
                      ? (practical?.result ?? null)
                      : null;
              const statusText = isChecklistStep
                ? done
                  ? "Completed"
                  : current
                    ? `In Progress · ${checklistDone}/${requirementItems.length}`
                    : "Pending"
                : skipped
                  ? done
                    ? "Not required — Completed"
                    : "Not required"
                  : done
                    ? verdict
                      ? `Completed · ${verdict}`
                      : "Completed"
                    : current
                      ? "In Progress"
                      : "Pending";
              const isLast = i === VIEW_MILESTONES.length - 1;

              // Connector to the next node: green behind a completed stage, a
              // green→red ramp into the stage in progress, gray while pending.
              const nextState = milestoneStates[i + 1] ?? "pending";
              const lineClass =
                nextState === "done"
                  ? "bg-success"
                  : nextState === "current"
                    ? "bg-gradient-to-r from-success to-destructive/50"
                    : "bg-muted";

              return (
                <div
                  key={m.label}
                  className="relative flex flex-1 flex-col items-center text-center"
                >
                  {/* Connector line */}
                  {!isLast && (
                    <div
                      aria-hidden
                      className={cn(
                        "absolute top-[14px] h-0.5",
                        "left-[calc(50%+22px)] right-[calc(-50%+22px)]",
                        lineClass,
                      )}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => openMilestone(m.key)}
                    disabled={isChecklistStep && !showRequirementsChecklist}
                    aria-label={`Open ${m.label}`}
                    title={
                      isChecklistStep && !showRequirementsChecklist
                        ? "The requirements checklist opens once the offer is extended or the hire record is filed"
                        : `Open ${m.label}`
                    }
                    className={cn(
                      "relative z-10 flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-xs font-bold transition-all",
                      "hover:ring-4 hover:ring-primary/25 disabled:cursor-not-allowed disabled:hover:ring-0",
                      done
                        ? "bg-success text-success-foreground"
                        : current
                          ? "bg-destructive text-destructive-foreground ring-4 ring-destructive/15"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {done ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
                  </button>
                  <span
                    className={cn(
                      "mt-2 px-1 text-xs font-semibold leading-tight",
                      done
                        ? "text-success"
                        : current
                          ? "text-destructive"
                          : "text-muted-foreground",
                    )}
                  >
                    {m.label}
                  </span>
                  <span
                    className={cn(
                      "mt-0.5 text-[11px] font-medium leading-tight",
                      done
                        ? "text-success"
                        : current
                          ? "text-destructive"
                          : "text-muted-foreground",
                    )}
                  >
                    {statusText}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Body grid: section nav + panels. The Requirements Checklist is its own
          focused step — the applicant section nav is hidden there, so only the
          checklist occupies the view. */}
      <div
        className={cn(
          "grid items-start gap-4",
          panel === "onboarding" ? "grid-cols-1" : "lg:grid-cols-[240px_1fr] lg:items-stretch",
        )}
      >
        {panel !== "onboarding" && (
          <Card className="border-border/70 h-full self-stretch flex flex-col overflow-hidden lg:h-[80vh]">
            <CardContent className="h-full p-3 lg:overflow-y-auto">
              <div>
                <p className="eyebrow mb-2">Applicant sections</p>
                <div className="space-y-1">
                  {sectionBtn("current", "Current Stage", <Info className="h-4 w-4" />)}
                  {sectionBtn("details", "Application Details", <FileText className="h-4 w-4" />)}
                  {sectionBtn(
                    "resume",
                    "Resume & Documents",
                    <Upload className="h-4 w-4" />,
                    docCount,
                    passedScreening,
                  )}
                  {sectionBtn(
                    "interview",
                    "Interview",
                    <ClipboardCheck className="h-4 w-4" />,
                    assessments.length,
                    !!assessment,
                  )}
                  {sectionBtn(
                    "test",
                    "Assessment Test",
                    <BookMarked className="h-4 w-4" />,
                    assessmentTests.length,
                    !!test,
                  )}
                  {sectionBtn(
                    "practical",
                    "Practical Assessment",
                    <Wrench className="h-4 w-4" />,
                    requiresPrac ? practicalTests.length : undefined,
                    /* Not required for this position: done as soon as the
                     applicant has advanced past the stage (progress bar rule). */
                    requiresPrac ? !!practical : stepStates[3] === "done",
                  )}
                  {sectionBtn(
                    "final",
                    "Final Evaluation",
                    <CheckCircle2 className="h-4 w-4" />,
                    finalEvaluations.length,
                    stepStates[4] === "done",
                  )}
                  {/* Requirements checklist — the New Hire Onboarding card moved
                    into this View profile; offered / hired applicants only. */}
                  {showRequirementsChecklist &&
                    sectionBtn(
                      "onboarding",
                      "Requirements Checklist",
                      <ClipboardList className="h-4 w-4" />,
                      requirementItems.length,
                      requirementItems.length > 0 && checklistDone === requirementItems.length,
                    )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="min-w-0 h-full space-y-4 lg:h-[80vh] lg:overflow-y-auto [&>*]:min-h-full">
          {(() => {
            switch (panel) {
              case "current":
                return (
                  <Card className="border-border/70 min-h-full">
                    <CardContent className="p-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="flex items-center gap-2 font-display text-xl font-semibold">
                            <Info className="h-4 w-4 text-primary" /> {a.stage}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {stageDesc[a.stage] ?? "Process stage for this applicant."}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {tier <= 2 && (
                            <Badge
                              variant="outline"
                              className={cn(topCandidateTierMeta[tier].className)}
                            >
                              <Trophy className="h-3 w-3" /> {topCandidateTierMeta[tier].label}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Stage overview — shortcuts only, details live in each section */}
                      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {[
                          {
                            id: "details" as ViewPanel,
                            icon: <FileText className="h-4 w-4" />,
                            label: "Screening",
                            meta: passedScreening ? "Passed" : "For Review",
                          },
                          {
                            id: "interview" as ViewPanel,
                            icon: <ClipboardCheck className="h-4 w-4" />,
                            label: "Interview",
                            meta: assessment
                              ? `${assessment.result} · ${assessment.total}%`
                              : interview
                                ? `Scheduled · ${interview.date}`
                                : "Not yet conducted",
                          },
                          {
                            id: "test" as ViewPanel,
                            icon: <BookMarked className="h-4 w-4" />,
                            label: "Assessment Test",
                            meta: test ? `${test.result} · ${test.total}%` : "Not yet taken",
                          },
                          {
                            id: "practical" as ViewPanel,
                            icon: <Wrench className="h-4 w-4" />,
                            label: "Practical Assessment",
                            meta: !requiresPrac
                              ? "Not required"
                              : practical
                                ? `${practical.result} · ${practical.total}%`
                                : "Pending",
                          },
                        ].map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => setPanel(r.id)}
                            className="flex min-h-0 flex-col items-start gap-1.5 rounded-md border border-border bg-card px-3 py-2.5 text-left transition-colors hover:border-primary/40"
                          >
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                              {r.icon} {r.label}
                            </span>
                            <span className="text-[0.7rem] text-muted-foreground">{r.meta}</span>
                          </button>
                        ))}
                      </div>

                      <div className="mt-4">
                        <h4 className="text-sm font-semibold tracking-wide text-muted-foreground">
                          Recent Activity
                        </h4>
                        {(() => {
                          const stageFallback =
                            audit.length === 0
                              ? [
                                  final
                                    ? {
                                        id: `stage-final-${final.id}`,
                                        actionType: "Final Evaluation Completed",
                                        details: `Final evaluation recorded — ${final.recommendation}.`,
                                        actorName: "System",
                                        date: final.date,
                                        time: "",
                                      }
                                    : null,
                                  test
                                    ? {
                                        id: `stage-test-${test.id}`,
                                        actionType: "Assessment Test Completed",
                                        details: `${test.title} — ${test.result} · ${test.total}%.`,
                                        actorName: "System",
                                        date: test.date,
                                        time: "",
                                      }
                                    : null,
                                  assessment
                                    ? {
                                        id: `stage-interview-${assessment.date}`,
                                        actionType: "Interview Completed",
                                        details: `Interview ${assessment.result} · ${assessment.total}% — ${assessment.outcome}.`,
                                        actorName: "System",
                                        date: assessment.date,
                                        time: "",
                                      }
                                    : interview
                                      ? {
                                          id: `stage-sched-${interview.date}-${interview.time}`,
                                          actionType: "Interview Scheduled",
                                          details: `${interview.date} · ${interview.time} — ${interview.status}.`,
                                          actorName: "System",
                                          date: interview.date,
                                          time: "",
                                        }
                                      : null,
                                  {
                                    id: `stage-screening-${a.id}`,
                                    actionType: "Resume Screening Completed",
                                    details: `Screened at ${a.score}% — ${passedScreening ? "Passed" : "For Review"}.`,
                                    actorName: "System",
                                    date: a.appliedAt,
                                    time: "",
                                  },
                                ].filter((x): x is NonNullable<typeof x> => x !== null)
                              : [];
                          const items = (audit.length > 0 ? audit : stageFallback).slice(0, 6);
                          if (items.length === 0) {
                            return (
                              <div className="mt-2">
                                {emptyNote("No recorded events for this applicant yet.")}
                              </div>
                            );
                          }
                          return (
                            <div className="mt-2 space-y-2">
                              {items.map((e) => (
                                <div
                                  key={e.id}
                                  className="flex items-start gap-2.5 rounded-md border border-border px-3 py-2"
                                >
                                  <span
                                    className={cn(
                                      "mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full",
                                      /Rejected|Cancelled|No-Show/.test(e.actionType)
                                        ? "bg-destructive"
                                        : "bg-primary",
                                    )}
                                  />
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs font-semibold">{e.actionType}</p>
                                    <p className="truncate text-[0.7rem] text-muted-foreground">
                                      {e.details}
                                    </p>
                                  </div>
                                  <span className="shrink-0 text-[0.65rem] text-muted-foreground">
                                    {e.actorName} · {e.date} {e.time}
                                  </span>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                );
              case "details":
                return (
                  <Card className="border-border/70 min-h-full">
                    <CardContent className="p-6">
                      <div>
                        <h3 className="flex items-center gap-2 font-display text-xl font-semibold">
                          <FileText className="h-4 w-4 text-primary" /> Application Details
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Submitted via {a.source} · {displayAppliedAt(a.appliedAt)}
                        </p>
                      </div>

                      <div className="mt-4 grid gap-x-10 gap-y-3 sm:grid-cols-2">
                        {[
                          ["Applicant ID", a.id],
                          ["Full Name", a.name],
                          ["Email", a.email],
                          ["Phone", a.phone],
                          ["Position Applied", a.position],
                          ["Department", departmentOf(a.position)],
                          ["Source", a.source],
                          ["Current Stage", a.stage],
                          ["Applied", displayAppliedAt(a.appliedAt)],
                        ].map(([k, v]) => (
                          <div key={k}>
                            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
                              {k}
                            </p>
                            <p className="text-sm font-medium">{v}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              case "resume":
                return (
                  <Card className="border-border/70 min-h-full">
                    <CardContent className="p-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="flex items-center gap-2 font-display text-xl font-semibold">
                            <Upload className="h-4 w-4 text-primary" /> Resume &amp; Documents
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            Resume screening result plus supporting verification documents (COE,
                            Certificate, Credentials, Others).
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant="outline"
                            className="border-border bg-secondary text-secondary-foreground"
                          >
                            {docCount} item{docCount === 1 ? "" : "s"}
                          </Badge>
                          <Button size="sm" variant="outline" onClick={onReview}>
                            <ScanLine className="mr-1.5 h-3.5 w-3.5" /> Review Screening
                          </Button>
                        </div>
                      </div>

                      {/* Resume Screening Result — redesigned to the approved mockup */}
                      {(() => {
                        const vm = screeningViewModel(a);
                        const detail = vm.detail;
                        return (
                          <div className="mt-4 space-y-4">
                            <div className="rounded-xl border border-border bg-card p-5">
                              <h3 className="flex items-center gap-2 font-display text-base font-semibold">
                                <ShieldCheck className="h-4.5 w-4.5 text-primary" /> Resume
                                Screening
                              </h3>
                              <div className="mt-4 flex flex-col items-center gap-4 lg:flex-row lg:items-start">
                                <ScreeningScoreDonut score={vm.score} />
                                <div className="w-full min-w-0 flex-1 space-y-3">
                                  <ScreeningVerdictBanner status={a.status} score={vm.score} />
                                  <ScreeningStatTiles
                                    matchedCount={vm.matched.length}
                                    missingCount={vm.missing.length}
                                    yearsExperience={vm.yearsExperience}
                                    educationLabel={vm.educationLabel}
                                    showIcons={false}
                                  />
                                </div>
                              </div>
                            </div>

                            <ScreeningVerificationImpact
                              verification={vm.verification}
                              resumeScore={vm.resumeScore}
                              score={vm.score}
                              onRecompute={onRecomputeRanking}
                              recomputing={recomputingRanking}
                            />

                            <div className="grid items-stretch gap-4 lg:grid-cols-2">
                              <ResumeInfoPanel
                                title="Key Information Extracted"
                                variant="modal"
                                skills={vm.skills}
                                recognizedRoles={vm.recognizedRoles}
                                unrecognizedRoles={vm.unrecognizedRoles}
                                workExperience={vm.workExperience}
                                education={vm.education}
                                experienceYears={vm.yearsExperience}
                                certifications={vm.certifications}
                                personalInfo={vm.personalInfo}
                                skillsRecognized={vm.skillsRecognized}
                                unrecognizedCertifications={vm.unrecognizedCertifications}
                              />
                              <RequirementMatchPanel
                                rows={vm.rows}
                                experienceMinYears={vm.experienceMinYears}
                              />
                            </div>

                            <ScreeningResumeDocsMatchDetail
                              docs={serverDocList}
                              loading={serverDocsLoading}
                              resumeName={vm.personalInfo.name ?? a.name}
                              resumeEducation={vm.education}
                              resumeCertifications={vm.certifications}
                            />

                            <ScreeningSupportDocsGrid
                              resumeName={a.resumeOriginalName || "Resume / CV"}
                              resumeSub={`PDF · Screened at ${Math.round(vm.score)}%`}
                              onOpenResume={
                                a.resumeUrl
                                  ? () => window.open(a.resumeUrl!, "_blank", "noopener")
                                  : undefined
                              }
                              docs={serverDocList}
                              loading={serverDocsLoading}
                              onView={(d) =>
                                window.open(
                                  applicantDocumentsApi.fileUrl(d.applicant_document_id),
                                  "_blank",
                                  "noopener",
                                )
                              }
                              onDownload={(d) =>
                                window.open(
                                  applicantDocumentsApi.fileUrl(d.applicant_document_id, true),
                                  "_blank",
                                  "noopener",
                                )
                              }
                            />

                            {docs.length > 0 && (
                              <div className="rounded-xl border border-border bg-card p-5">
                                <h3 className="text-sm font-semibold">Session uploads</h3>
                                <p className="mt-0.5 text-[0.7rem] text-muted-foreground">
                                  Documents staged in this session, not yet verified against the
                                  resume.
                                </p>
                                <div className="mt-3 space-y-4">
                                  {VERIFICATION_DOC_TYPES.map((t) => {
                                    const group = docs.filter((d) => d.docType === t.type);
                                    if (group.length === 0) return null;
                                    return (
                                      <div key={t.type}>
                                        <p className="flex flex-wrap items-center gap-2 text-xs font-semibold text-foreground">
                                          {t.label}
                                          <Badge
                                            variant="outline"
                                            className="border-border bg-muted text-muted-foreground"
                                          >
                                            {group.length}
                                          </Badge>
                                        </p>
                                        <p className="text-[0.7rem] text-muted-foreground">
                                          {t.verifies}
                                        </p>
                                        <div className="mt-2 overflow-x-auto">
                                          <Table>
                                            <TableHeader>
                                              <TableRow>
                                                <TableHead>Title / File</TableHead>
                                                <TableHead>Original Copy</TableHead>
                                                <TableHead>Uploaded</TableHead>
                                              </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                              {group.map((d) => (
                                                <TableRow key={`${d.docType}-${d.fileName}`}>
                                                  <TableCell>
                                                    <p className="text-sm font-medium">{d.title}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                      {d.fileName}
                                                    </p>
                                                  </TableCell>
                                                  <TableCell>
                                                    {d.originalCopy ? (
                                                      <Badge
                                                        variant="outline"
                                                        className="border-success/30 bg-success/10 text-success"
                                                      >
                                                        Original
                                                      </Badge>
                                                    ) : (
                                                      <Badge
                                                        variant="outline"
                                                        className="border-caution/30 bg-caution/10 text-caution"
                                                      >
                                                        Copy
                                                      </Badge>
                                                    )}
                                                  </TableCell>
                                                  <TableCell className="text-xs text-muted-foreground">
                                                    {d.uploadedAt}
                                                  </TableCell>
                                                </TableRow>
                                              ))}
                                            </TableBody>
                                          </Table>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            <ScreeningDetailsAccordion
                              detail={detail}
                              variant="modal"
                              position={a.position}
                              score={vm.score}
                              vm={vm}
                            />

                            {detail?.alternative_job && (
                              <div className="rounded-xl border border-warning/40 bg-warning/5 p-4 text-sm">
                                <p className="font-medium text-warning-foreground">
                                  Recommended alternative: {detail.alternative_job.title} (
                                  {Math.round(detail.alternative_job.alternative_match_score ?? 0)}
                                  %)
                                </p>
                                {detail.alternative_job.reason && (
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {detail.alternative_job.reason}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* Report unrecognized entities — full width at the bottom
                          of the Resume Screening Result in Resume & Documents. */}
                      {(() => {
                        const vm = screeningViewModel(a);
                        const entries = unrecognizedEntriesFrom(vm, a.screening_detail);
                        return (
                          <ReportUnrecognizedDialog
                            entries={entries}
                            applicantName={a.name}
                            className="mt-4 w-full justify-center"
                            triggerLabel={
                              entries.length > 0
                                ? `Report unrecognized entities (${entries.length})`
                                : "Report unrecognized entities"
                            }
                          />
                        );
                      })()}
                    </CardContent>
                  </Card>
                );
              case "interview":
                return (
                  <Card className="border-border/70 min-h-full">
                    <CardContent className="p-6">
                      <div>
                        <h3 className="flex items-center gap-2 font-display text-xl font-semibold">
                          <ClipboardCheck className="h-4 w-4 text-primary" /> Interview
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          This applicant&apos;s interview record — booking &amp; rescheduling stay
                          in the main list.
                        </p>
                      </div>

                      {(showAcceptInterview ||
                        showScheduleInterview ||
                        showRescheduleInterview) && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {showAcceptInterview && (
                            <Button size="sm" onClick={onAcceptAndSchedule}>
                              <CalendarPlus className="mr-1.5 h-3.5 w-3.5" /> Accept &amp; Schedule
                            </Button>
                          )}
                          {showScheduleInterview && (
                            <Button size="sm" onClick={onAcceptAndSchedule}>
                              <CalendarPlus className="mr-1.5 h-3.5 w-3.5" /> Schedule Interview
                            </Button>
                          )}
                          {showRescheduleInterview && liveInterview && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onRescheduleInterview?.(liveInterview)}
                            >
                              <Repeat2 className="mr-1.5 h-3.5 w-3.5" /> Reschedule Interview
                            </Button>
                          )}
                        </div>
                      )}

                      {assessment ? (
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-border px-4 py-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium">
                              Interview completed {assessment.date}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {assessment.remarks || "No overall evaluation notes recorded."}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-display text-2xl font-semibold text-primary">
                              {assessment.total}%
                            </span>
                            <Badge
                              variant="outline"
                              className={cn(
                                assessment.result === "Passed"
                                  ? "border-success/30 bg-success/10 text-success"
                                  : "border-destructive/30 bg-destructive/10 text-destructive",
                              )}
                            >
                              {assessment.result}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={cn(
                                assessment.outcome === "Recommended"
                                  ? "border-success/30 bg-success/10 text-success"
                                  : assessment.outcome === "Hold"
                                    ? "border-warning/40 bg-warning/10 text-warning"
                                    : "border-destructive/30 bg-destructive/10 text-destructive",
                              )}
                            >
                              {assessment.outcome}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onViewInterview(assessment)}
                            >
                              <Eye className="mr-1.5 h-3.5 w-3.5" /> View Results
                            </Button>
                          </div>
                        </div>
                      ) : interview ? (
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-border px-4 py-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium">
                              {interview.date} · {interview.time}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {interview.mode}
                              {interview.facilityName ? ` · ${interview.facilityName}` : ""}
                              {interview.facilityStatus ? ` · ${interview.facilityStatus}` : ""}
                              {interview.interviewer ? ` · ${interview.interviewer}` : ""}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              variant="outline"
                              className="border-gold/40 bg-gold-soft text-gold-foreground dark:bg-gold/15 dark:text-gold"
                            >
                              {interview.status}
                            </Badge>
                            {interview.date === TODAY_ISO ? (
                              <Button size="sm" onClick={onStartInterview}>
                                <ClipboardCheck className="mr-1.5 h-3.5 w-3.5" /> Start Interview
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                {interview.date > TODAY_ISO
                                  ? "Available on interview day"
                                  : "Interview window has passed"}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4">
                          {emptyNote(
                            "No interview yet. Book a slot from the Interview Pipeline tab in the main list.",
                          )}
                        </div>
                      )}

                      {!assessment && (
                        <p className="mt-4 flex w-full items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">
                          <Info className="h-4 w-4 shrink-0" />
                          <span>
                            Booking and rescheduling stay in the{" "}
                            <b className="font-semibold text-foreground">Interview Pipeline</b> tab.
                            This section shows this applicant&apos;s interview record only.
                          </span>
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              case "test":
                return (
                  <Card className="border-border/70 min-h-full">
                    <CardContent className="p-6">
                      <div>
                        <h3 className="flex items-center gap-2 font-display text-xl font-semibold">
                          <BookMarked className="h-4 w-4 text-primary" /> Assessment Test
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Job-specific test that unlocks after the interview assessment is passed.
                        </p>
                      </div>

                      {test ? (
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-border px-4 py-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium">{test.title}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {test.name} · {test.position} · {test.date}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-display text-2xl font-semibold text-primary">
                              {test.total}%
                            </span>
                            <Badge
                              variant="outline"
                              className={cn(
                                test.result === "Passed"
                                  ? "border-success/30 bg-success/10 text-success"
                                  : "border-destructive/30 bg-destructive/10 text-destructive",
                              )}
                            >
                              {test.result}
                            </Badge>
                            <Button size="sm" variant="outline" onClick={() => onViewTest(test)}>
                              <Eye className="mr-1.5 h-3.5 w-3.5" /> View
                            </Button>
                          </div>
                        </div>
                      ) : readyForTest ? (
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-primary/30 bg-primary/5 px-4 py-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium">Ready for the assessment test</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {a.position} — the interview assessment was passed.
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={inviteBusy}
                              onClick={() => onCopyTestLink?.()}
                              title="Generate a no-login link the applicant opens to answer the test themselves"
                            >
                              {inviteBusy ? (
                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Link2 className="mr-1.5 h-3.5 w-3.5" />
                              )}
                              Copy applicant test link
                            </Button>
                            <Button size="sm" onClick={onStartTest}>
                              <BookMarked className="mr-1.5 h-3.5 w-3.5" /> Start Assessment Test
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4">
                          {emptyNote(
                            "Assessment test unlocks after the interview stage is completed and passed.",
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              case "practical":
                return (
                  <Card className="border-border/70 min-h-full">
                    <CardContent className="p-6">
                      <div>
                        <h3 className="flex items-center gap-2 font-display text-xl font-semibold">
                          <Wrench className="h-4 w-4 text-primary" /> Practical Assessment
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Hands-on practical exam — only for designated positions (
                          {PRACTICAL_POSITIONS.join(", ")}).
                        </p>
                      </div>

                      {!requiresPrac ? (
                        <div className="mt-4">
                          {emptyNote("This position does not require a practical assessment.")}
                        </div>
                      ) : practical ? (
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-border px-4 py-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium">{practical.taskTitle}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {practical.name} · {practical.position} · {practical.date}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-display text-2xl font-semibold text-primary">
                              {practical.total}%
                            </span>
                            <Badge
                              variant="outline"
                              className={cn(
                                practical.result === "Passed"
                                  ? "border-success/30 bg-success/10 text-success"
                                  : "border-destructive/30 bg-destructive/10 text-destructive",
                              )}
                            >
                              {practical.result}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onViewPractical(practical)}
                            >
                              <Eye className="mr-1.5 h-3.5 w-3.5" /> View
                            </Button>
                          </div>
                        </div>
                      ) : readyForPractical ? (
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-primary/30 bg-primary/5 px-4 py-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium">
                              Ready for the practical assessment
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {a.position} — the assessment test was passed.
                            </p>
                          </div>
                          <Button size="sm" onClick={onStartPractical}>
                            <Wrench className="mr-1.5 h-3.5 w-3.5" /> Record Practical Exam
                          </Button>
                        </div>
                      ) : (
                        <div className="mt-4">
                          {emptyNote("Practical exam unlocks after passing the assessment test.")}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              case "final":
                return (
                  <Card className="border-border/70 min-h-full">
                    <CardContent className="p-6">
                      <div>
                        <h3 className="flex items-center gap-2 font-display text-xl font-semibold">
                          <CheckCircle2 className="h-4 w-4 text-primary" /> Final Evaluation
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Whole-process verdict — resume screening, interview, assessment test and
                          practical.
                        </p>
                      </div>

                      {final ? (
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-border px-4 py-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium">
                              Final evaluation recorded {final.date}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {final.overallRemarks || "No overall remarks recorded."}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              variant="outline"
                              className={cn(
                                final.recommendation === "Recommended for Hire"
                                  ? "border-success/30 bg-success/10 text-success"
                                  : final.recommendation === "For Another Position"
                                    ? "border-warning/40 bg-warning/10 text-warning"
                                    : "border-destructive/30 bg-destructive/10 text-destructive",
                              )}
                            >
                              {final.recommendation}
                            </Badge>
                            <Button size="sm" variant="outline" onClick={() => onViewFinal(final)}>
                              <Eye className="mr-1.5 h-3.5 w-3.5" /> View Results
                            </Button>
                          </div>
                        </div>
                      ) : readyForFinal ? (
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-primary/30 bg-primary/5 px-4 py-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium">Ready for the final evaluation</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {a.position} — all process stages completed.
                            </p>
                          </div>
                          <Button size="sm" onClick={onStartFinal}>
                            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Complete Final
                            Evaluation
                          </Button>
                        </div>
                      ) : (
                        <div className="mt-4">
                          {emptyNote(
                            "Final evaluation unlocks after the assessment test (and the practical, when required) is passed.",
                          )}
                        </div>
                      )}

                      {/* Verify Candidate Decision — simple spaced section below the final record. */}
                      {final && (
                        <div className="mt-6 space-y-2">
                          <h4 className="flex items-center gap-2 text-sm font-semibold">
                            <ShieldCheck className="h-4 w-4 text-primary" /> Verify Candidate
                            Decision
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Confirm the recorded recommendation — verification locks the hiring
                            decision.
                          </p>
                          {verifiedFinal ? (
                            <p className="text-xs font-semibold text-success">
                              Verified · {verifiedFinal}
                              {!finalDecided && (
                                <span className="font-normal text-muted-foreground">
                                  {" "}
                                  — decision pending.
                                </span>
                              )}
                            </p>
                          ) : finalDecided ? (
                            <p className="text-xs text-muted-foreground">
                              Decision already recorded for this applicant.
                            </p>
                          ) : onVerifyFinal ? (
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <p className="text-xs text-warning">
                                Recorded as {final.recommendation} — awaiting verification.
                              </p>
                              <Button size="sm" onClick={() => onVerifyFinal(final)}>
                                <ShieldCheck className="mr-1.5 h-3.5 w-3.5" /> Verify Candidate
                                Decision
                              </Button>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              /* Requirements checklist — the New Hire Onboarding right-side
                 card, moved into this View profile. Shown only for applicants
                 whose offer was extended or who are already hired. */
              case "onboarding":
                return !showRequirementsChecklist ? null : (
                  <RequirementsChecklistCard
                    linkedHire={linkedHire}
                    items={requirementItems}
                    submissions={hireSubmissions}
                    done={checklistDone}
                    progress={checklistProgress}
                  />
                );
              default:
                return null;
            }
          })()}
        </div>
      </div>

    </div>
  );
}

/** Candidate cards visible in the "Top 5 Candidates Today" list before it
 *  scrolls. Candidates 4 and 5 stay in the list and remain reachable by
 *  scrolling — the card never grows to fit all five. */
const TOP_FIVE_VISIBLE_CARDS = 3;

export function ApplicantManagement({ role }: { role: "superadmin" | "admin" }) {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Applicant[]>([]);

  /**
   * Loads every pipeline record that drives the applicant progress bar:
   * applicants (stage), interviews, interview assessments, assessment tests,
   * practical assessments and final evaluations.
   *
   * Reused by the mount fetch and by the background auto-refresh below, so the
   * UI always mirrors the database without a manual browser refresh.
   */
  const loadApplicantRecords = useCallback(async () => {
    // Hired applicants leave the pipeline (they move to New Hire Onboarding);
    // rejected applicants stay in the list, only labelled as "Rejected".
    const excludeStages = "Hired";
    try {
      const [appRes, intRes, asmRes, testRes, practRes, finalRes] = await Promise.allSettled([
        fetchAllPages(applicantsApi.list, { exclude_stages: excludeStages }),
        fetchAllPages(interviewsApi.list),
        fetchAllPages(assessmentsApi.list),
        fetchAllPages(assessmentTestsApi.list),
        fetchAllPages(practicalTestsApi.list),
        fetchAllPages(finalEvaluationsApi.list),
      ]);
      if (appRes.status === "fulfilled") {
        setRows((appRes.value ?? []).map(transformApiApplicant));
      }
      if (intRes.status === "fulfilled") {
        setInterviews((intRes.value ?? []).map(transformApiInterview));
      }
      if (asmRes.status === "fulfilled") {
        setAssessments(
          (asmRes.value ?? []).map((a) => ({
            applicantId: a.applicant?.applicant_code ?? `APP-${a.applicant_id}`,
            dbId: a.assessment_id,
            name: a.applicant?.name ?? `Applicant #${a.applicant_id}`,
            position: a.applicant?.position ?? "—",
            scores: a.scores_json ?? {},
            comments: a.comments_json ?? {},
            total: Math.round(a.total_score ?? 0),
            remarks: a.remarks ?? "",
            date: a.assessment_date,
            outcome: a.outcome,
            result: (a.result ??
              (a.outcome === "Recommended"
                ? "Passed"
                : a.outcome === "Not Recommended"
                  ? "Failed"
                  : "Failed")) as PassFail,
          })),
        );
      }
      if (testRes.status === "fulfilled") {
        setAssessmentTests((testRes.value ?? []).map(transformApiAssessmentTest));
      }
      if (practRes.status === "fulfilled") {
        setPracticalTests((practRes.value ?? []).map(transformApiPracticalTest));
      }
      if (finalRes.status === "fulfilled") {
        setFinalEvaluations((finalRes.value ?? []).map(transformApiFinalEvaluation));
      }
    } catch (err) {
      console.warn("Could not fetch applicants/interviews/assessments from API:", err);
    }
  }, []);

  useEffect(() => {
    void loadApplicantRecords();
  }, [loadApplicantRecords]);

  /**
   * Re-reads the pipeline records right after a stage is recorded, so the
   * progress bar shows the saved state immediately instead of waiting for the
   * next background poll.
   */
  const syncAfterStageChange = useCallback(() => {
    void loadApplicantRecords();
  }, [loadApplicantRecords]);

  /**
   * Auto-refresh: polls the pipeline records in the background and refreshes
   * immediately when the tab regains focus/visibility, so a stage change or a
   * newly recorded assessment turns the progress bar green/red on its own — no
   * manual browser refresh and no navigating away and back.
   */
  useEffect(() => {
    const REFRESH_INTERVAL_MS = 20_000;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void loadApplicantRecords();
    }, REFRESH_INTERVAL_MS);
    const refreshNow = () => void loadApplicantRecords();
    const onVisibility = () => {
      if (document.visibilityState === "visible") refreshNow();
    };
    window.addEventListener("focus", refreshNow);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refreshNow);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [loadApplicantRecords]);

  // Schedulable interview days (Mon–Sun setter) persisted via system_settings
  const [schedulableDays, setSchedulableDays] = useState<string[]>(DEFAULT_SCHEDULABLE_DAYS);
  const [schedulableDaysDraft, setSchedulableDaysDraft] =
    useState<string[]>(DEFAULT_SCHEDULABLE_DAYS);
  // System users for the assessment assessor selector
  const [assessors, setAssessors] = useState<ApiSystemUser[]>([]);

  useEffect(() => {
    settingsApi
      .get("interview.schedulable_days")
      .then((res) => {
        const days = Array.isArray(res.setting_value) ? res.setting_value : [];
        if (days.length) {
          setSchedulableDays(days);
          setSchedulableDaysDraft(days);
        }
      })
      .catch(() => {
        console.warn("Could not fetch schedulable days, using default.");
      });
    settingsApi
      .listSystemUsers()
      .then((res) => setAssessors(res.data))
      .catch(() => {
        console.warn("Could not fetch system users for assessor selector.");
      });
  }, []);

  /* --- Logged-in staff member (default Interviewer / Assessor / Evaluated by) --- */
  /** system_user_id of the signed-in staff member. Every process step that
   *  records a name (Interviewer, Practical Assessment Assessor, Evaluated by)
   *  is pre-filled with this person — they are the one processing the step —
   *  and stays editable so a different interviewer can be recorded. */
  const [currentUserId, setCurrentUserId] = useState("");
  useEffect(() => {
    const user = getUser();
    if (user?.system_user_id) setCurrentUserId(String(user.system_user_id));
  }, []);
  /** The logged-in user's id, but only when they are a selectable system user
   *  (before the user list loads we trust the session value so the field is
   *  never left blank). */
  const loggedInAssessorId = useMemo(() => {
    if (!currentUserId) return "";
    if (assessors.length === 0) return currentUserId;
    return assessors.some((u) => String(u.system_user_id) === currentUserId)
      ? currentUserId
      : "";
  }, [currentUserId, assessors]);

  /** Applicant currently having a secure assessment test link generated. */
  const [inviteBusyId, setInviteBusyId] = useState<string | null>(null);

  /* --- Shared confirmation prompt for every pass / fail / save decision --- */
  /** Pending destructive-or-committing action awaiting the user's confirmation.
   *  Every Passed / Failed / Save / Recommend / Reject button routes through
   *  this so nothing is committed (or a stage advanced) on a single stray
   *  click. */
  const [pendingConfirm, setPendingConfirm] = useState<{
    title: string;
    description: string;
    confirmLabel: string;
    destructive?: boolean;
    onConfirm: () => void | Promise<void>;
  } | null>(null);

  const [tab, setTab] = useState("ranking");
  const [positionFilter, setPositionFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [rankingFilter, setRankingFilter] = useState<"all" | "passed" | "ready">("all");
  const applicantListRef = useRef<HTMLDivElement>(null);
  /** Pipeline Overview card — the metric cards scroll it into view after
   *  applying their quick filter. */
  const pipelineListRef = useRef<HTMLDivElement>(null);
  /** Room Availability & Daily Schedule card — "View in calendar" scrolls here. */
  const roomAvailabilityRef = useRef<HTMLDivElement>(null);

  /* --- Top 5 Candidates Today list viewport -------------------------------- */
  /* The visible list area is locked to exactly TOP_FIVE_VISIBLE_CARDS cards so
     candidates 4 and 5 scroll instead of stretching the card taller than the
     Candidate Ranking card beside it. Card height is measured at runtime, so
     the viewport stays exactly three cards at any zoom / font size. */
  const [topFiveList, setTopFiveList] = useState<HTMLOListElement | null>(null);
  const [topFiveCard, setTopFiveCard] = useState<HTMLLIElement | null>(null);
  const [topFiveViewport, setTopFiveViewport] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [review, setReview] = useState<Applicant | null>(null);
  /** When true the Review dialog is view-only (Pipeline Overview entry) —
   *  no Accept & schedule / Reject / Refer / Schedule actions are shown.
   *  Ranking list entries keep the full decision footer. */
  const [reviewReadOnly, setReviewReadOnly] = useState(false);
  const openReview = (a: Applicant, readOnly = false) => {
    setReviewReadOnly(readOnly);
    setReview(a);
  };
  const closeReview = () => {
    setReview(null);
    setReviewReadOnly(false);
  };
  const [evaluating, setEvaluating] = useState<Applicant | null>(null);
  const [referring, setReferring] = useState<Applicant | null>(null);
  const [referTarget, setReferTarget] = useState("");
  const [criteria, setCriteria] = useState(screeningCriteria);
  const [passing, setPassing] = useState(75);
  const [keywordPosition, setKeywordPosition] = useState(positions[0]!.title);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(
    keywordLibrary[positions[0]!.title] ?? [],
  );
  const [keywords, setKeywords] = useState(
    "guest relations, opera pms, tesda, food handler, mixology, housekeeping",
  );
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [assessments, setAssessments] = useState<AssessmentResult[]>([]);
  /** Assessment test rows (job-specific test after the interview assessment). */
  const [assessmentTests, setAssessmentTests] = useState<AssessmentTestRow[]>([]);
  /** Practical assessment rows (position-designated candidates only). */
  const [practicalTests, setPracticalTests] = useState<PracticalTestRow[]>([]);
  /** Final evaluation rows (whole-process verdict). */
  const [finalEvaluations, setFinalEvaluations] = useState<FinalEvaluationRow[]>([]);
  /** Verification documents uploaded against each applicant's resume content. */
  const [applicantDocs, setApplicantDocs] = useState<
    Record<
      string,
      {
        docType: VerificationDocType;
        title: string;
        originalCopy: boolean;
        fileName: string;
        uploadedAt: string;
      }[]
    >
  >({});
  /** Supporting-document verification rows for the applicant currently open
   *  in the review dialog (keyed by applicant_document_id). */
  const [reviewDocVerifications, setReviewDocVerifications] = useState<
    Record<string, ApiApplicantDocument>
  >({});
  const [reviewDocsLoading, setReviewDocsLoading] = useState(false);
  const [reverifyingDocId, setReverifyingDocId] = useState<string | null>(null);
  /** True while the ranking is being recomputed with the document evidence. */
  const [recomputingRanking, setRecomputingRanking] = useState(false);
  const [assessmentFilter, setAssessmentFilter] = useState<"ready" | "completed" | "all">("all");
  /** Final evaluation being verified via "Verify Candidate Decision". */
  const [verifyingFinal, setVerifyingFinal] = useState<FinalEvaluationRow | null>(null);
  const [verifyChoice, setVerifyChoice] = useState<FinalRecommendation | null>(null);
  /** Verified candidate decisions: final evaluation id -> verified recommendation. */
  const [verifiedDecisions, setVerifiedDecisions] = useState<Record<string, FinalRecommendation>>(
    {},
  );
  /** Final evaluation verified as "For Another Position" — awaiting the best
   *  recommended position; confirming it auto-accepts the candidate. */
  const [positionPick, setPositionPick] = useState<FinalEvaluationRow | null>(null);
  const [positionPickChoice, setPositionPickChoice] = useState("");
  const [assessmentSearch, setAssessmentSearch] = useState("");
  const [assessmentDept, setAssessmentDept] = useState<string>("all");
  const [assessmentOutcome, setAssessmentOutcome] = useState<string>("all");
  const [evalScores, setEvalScores] = useState<Record<string, number>>({});
  /** Per-criterion comments recorded in the interview assessment. */
  const [evalComments, setEvalComments] = useState<Record<string, string>>({});
  /** Assessor's explicit Passed / Failed verdict for the interview assessment. */
  const [evalResult, setEvalResult] = useState<PassFail | null>(null);
  const [evalRemarks, setEvalRemarks] = useState("");
  const [evalAssessor, setEvalAssessor] = useState("");
  const [evalDateTime, setEvalDateTime] = useState(() => isoOf(new Date()));

  /* --- Assessment Test dialog state (job-specific test after interview) --- */
  const [testingTest, setTestingTest] = useState<Applicant | null>(null);
  const [testTitle, setTestTitle] = useState("");
  const [testAssessor, setTestAssessor] = useState("");
  const [testDate, setTestDate] = useState(() => isoOf(new Date()));
  const [testQuestions, setTestQuestions] = useState<{ question: string; points: number }[]>([
    { question: "", points: 20 },
  ]);
  const [testScores, setTestScores] = useState<Record<string, number>>({});
  const [testPassing, setTestPassing] = useState(75);
  const [testRemarks, setTestRemarks] = useState("");
  /* --- Mock test runner state (candidate-facing quiz, Image 1 layout) --- */
  const [testStep, setTestStep] = useState(0);
  const [testAnswers, setTestAnswers] = useState<Record<number, number>>({});
  const [testTimeLeft, setTestTimeLeft] = useState(MOCK_TEST_DURATION_SECONDS);
  const [testQuestionSet, setTestQuestionSet] =
    useState<MockAssessmentQuestion[]>(MOCK_ASSESSMENT_QUESTIONS);
  /** Candidate's picked options per saved test row (row id -> question idx -> option idx). */
  const [testAnswerMap, setTestAnswerMap] = useState<Record<string, Record<number, number>>>({});
  const testAutoSubmitted = useRef(false);

  /* --- Practical Assessment dialog state (position-designated only) --- */
  const [testingPractical, setTestingPractical] = useState<Applicant | null>(null);
  const [practicalTask, setPracticalTask] = useState("");
  const [practicalAssessor, setPracticalAssessor] = useState("");
  const [practicalDate, setPracticalDate] = useState(() => isoOf(new Date()));
  const [practicalCriteria, setPracticalCriteria] = useState<
    { criterion: string; maxPoints: number }[]
  >(DEFAULT_PRACTICAL_CRITERIA);
  const [practicalScores, setPracticalScores] = useState<Record<string, number>>({});
  /** Per-criterion comments recorded in the practical assessment. */
  const [practicalComments, setPracticalComments] = useState<Record<string, string>>({});
  const [practicalRemarks, setPracticalRemarks] = useState("");

  /* --- Final Evaluation dialog state (whole-process verdict) --- */
  const [finalizing, setFinalizing] = useState<Applicant | null>(null);
  const [finalAssessor, setFinalAssessor] = useState("");
  const [finalDate, setFinalDate] = useState(() => isoOf(new Date()));
  const [finalRemarks, setFinalRemarks] = useState("");
  /* System-assisted final evaluation: backend preview (scores + overall),
     HR-chosen recommendation, single alternative position, breakdown toggle. */
  const [finalPreview, setFinalPreview] = useState<ApiFinalEvaluationPreview | null>(null);
  const [finalPreviewLoading, setFinalPreviewLoading] = useState(false);
  const [finalChoice, setFinalChoice] = useState<FinalRecommendation | null>(null);
  const [finalAltJobPostId, setFinalAltJobPostId] = useState("");
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);
  const [viewingFinal, setViewingFinal] = useState<FinalEvaluationRow | null>(null);
  /** Interview result being viewed (View button in the Interview tab). */
  const [viewingInterview, setViewingInterview] = useState<AssessmentResult | null>(null);
  /** Assessment test result being viewed (View button in the Assessment Test tab). */
  const [viewingAssessmentTest, setViewingAssessmentTest] = useState<AssessmentTestRow | null>(
    null,
  );
  /** Practical assessment result being viewed (View button in the Practical tab). */
  const [viewingPractical, setViewingPractical] = useState<PracticalTestRow | null>(null);
  /** Applicant open in the redesign View screen — home of the moved stage sections
   *  (Interview, Assessment Test, Practical Assessment, Final Evaluation). */
  const [viewingApplicant, setViewingApplicant] = useState<Applicant | null>(null);
  /** True while the View screen was opened from the New Hire Onboarding
   *  "View Checklist" action — adds a "Back to New Hire Onboarding" button. */
  const [viewedFromOnboarding, setViewedFromOnboarding] = useState(false);
  /** Queued "View Checklist" target handed over from New Hire Onboarding. */
  const [checklistViewTarget, setChecklistViewTarget] = useState<ChecklistViewTarget | null>(null);

  /* Consume the queued hand-off once. The target is carried in state, so a
     double-invoked effect run (React dev) can never drain the store twice and
     drop the request. */
  useEffect(() => {
    const target = hireStore.consumePendingChecklistView();
    if (target) setChecklistViewTarget(target);
  }, []);

  /**
   * Opens the handed-over applicant in the View profile right away — the
   * Requirements Checklist is forced as the landing section.
   */
  useEffect(() => {
    if (!checklistViewTarget) return;
    const { applicantId, applicantName } = checklistViewTarget;

    /* Direct route — the hire knows its applicant id. Fetched directly so
       Hired records (excluded from the active pipeline list) still open. */
    if (applicantId != null) {
      setChecklistViewTarget(null);
      applicantsApi
        .get(applicantId)
        .then((res) => {
          setViewedFromOnboarding(true);
          setViewingApplicant(transformApiApplicant(res));
        })
        .catch((e) => {
          console.warn("Could not open the applicant View profile:", e);
          toast.error("Could not open the applicant's view profile.");
        });
      return;
    }

    /* Legacy records without applicant_id: wait for the pipeline list, then
       resolve the applicant by exact name — falling back to the full applicants
       list, which still includes Hired records. */
    if (rows.length === 0) return;
    setChecklistViewTarget(null);
    const wanted = applicantName.trim().toLowerCase();
    const local = rows.find((r) => r.name.trim().toLowerCase() === wanted);
    if (local) {
      setViewedFromOnboarding(true);
      setViewingApplicant(local);
      return;
    }
    fetchAllPages(applicantsApi.list)
      .then((items) => {
        const match = items
          .map(transformApiApplicant)
          .find((r) => r.name.trim().toLowerCase() === wanted);
        if (!match) {
          toast.error(
            `No applicant profile matches "${applicantName}" — this hire was filed without an applicant.`,
          );
          return;
        }
        setViewedFromOnboarding(true);
        setViewingApplicant(match);
      })
      .catch((e) => {
        console.warn("Could not resolve the applicant for this hire:", e);
        toast.error("Could not open the applicant's view profile.");
      });
  }, [checklistViewTarget, rows]);

  /** Closing the View screen clears the onboarding-origin flag. */
  useEffect(() => {
    if (!viewingApplicant) setViewedFromOnboarding(false);
  }, [viewingApplicant]);
  /** Test & answers being reviewed from the result dialog. */
  const [viewingTestAnswers, setViewingTestAnswers] = useState<AssessmentTestRow | null>(null);
  const [viewMonth, setViewMonth] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [reportsOpen, setReportsOpen] = useState(false);
  const [screeningOpen, setScreeningOpen] = useState(false);
  /** Password-protected export flow — predefined report + format awaiting a file password. */
  const [csvOpen, setCsvOpen] = useState(false);
  const [csvBusy, setCsvBusy] = useState(false);
  const [csvPending, setCsvPending] = useState<
    | { kind: "applicant"; optionId: string; format: ReportFormat }
    | { kind: "audit"; format: ReportFormat }
    | null
  >(null);
  /* --- Pipeline Overview filters (one row per applicant) --- */
  const [pipelineSearch, setPipelineSearch] = useState("");
  const [pipelinePosition, setPipelinePosition] = useState<string>("all");
  const [pipelineStage, setPipelineStage] = useState<string>("all");
  const [pipelineResult, setPipelineResult] = useState<string>("all");
  /** Time window for the "Perfect for the Job" metric card (Today / Week / Month). */
  const [perfectRange, setPerfectRange] = useState<"today" | "week" | "month">("today");
  /** Pipeline Overview filter: only applicants with a live interview booked on
   *  this ISO date. Set by the Today Scheduled Interview metric and the Daily
   *  Schedule Preview "View list in Pipeline" action. */
  const [pipelineScheduledDate, setPipelineScheduledDate] = useState<string | null>(null);
  const [calSearch, setCalSearch] = useState("");
  const [calStatusFilter, setCalStatusFilter] = useState<string>("all");
  const [slotSettings, setSlotSettings] = useState(DEFAULT_SLOT_SETTINGS);
  const [slotDialogOpen, setSlotDialogOpen] = useState(false);
  /** Full calendar view — opened from the button beside Slot Settings. */
  const [calViewOpen, setCalViewOpen] = useState(false);
  /** Month shown in the full calendar view (independent from the mini calendar). */
  const [calViewMonth, setCalViewMonth] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  /** Selected date (ISO yyyy-mm-dd) in the full calendar view. */
  const [calViewDate, setCalViewDate] = useState<string>(() => isoOf(new Date()));
  /** Facility selected in the full calendar view's schedule preview. */
  const [calViewFacilityId, setCalViewFacilityId] = useState<string>("all");
  /** Full calendar view panel — month grid, or the day detail (double-click a date). */
  const [calViewPanel, setCalViewPanel] = useState<"calendar" | "day">("calendar");
  /** Booking-mode layout — true once an applicant is picked for scheduling
   *  (Accept & schedule / Schedule interview / Reschedule / manual select).
   *  The Book an Interview card swaps into the merged card's right column and
   *  the Daily Schedule Preview moves under the calendar. Reverts on confirm. */
  const [bookingFocus, setBookingFocus] = useState(false);
  /** Focus target for the booking form's applicant picker in the swapped slot. */
  const bookSelectRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (bookingFocus) bookSelectRef.current?.focus();
  }, [bookingFocus]);

  /** Interview pending cancellation confirmation. */
  const [cancelInterview, setCancelInterview] = useState<Interview | null>(null);
  const [schedule, setSchedule] = useState({
    applicant: "",
    date: TODAY_ISO,
    time: buildTimeSlots(
      DEFAULT_SLOT_SETTINGS.startTime,
      DEFAULT_SLOT_SETTINGS.intervalMinutes,
      DEFAULT_SLOT_SETTINGS.slotCount,
    )[0]!,
    mode: DEFAULT_SLOT_SETTINGS.defaultMode as string,
    /** Required — must be chosen in the Book an Interview card. */
    interviewer: "",
    /** Required facility reservation for the schedule (request facility feature). */
    facilityId: "",
  });
  /** Facility request tracker: schedule id -> facility approval status. */
  const [facilityStatuses, setFacilityStatuses] = useState<Record<string, FacilityStatus>>({});

  /**
   * MOCK FACILITY APPROVAL — every schedule with a requested facility starts
   * in "Waiting for Facility Approval" and is confirmed ("Facility Approved")
   * after 3 seconds, after which a confirmation email is automatically sent
   * to the applicant. (Mock only — no real facility owner approval flow.)
   */
  useEffect(() => {
    const pending = interviews.filter(
      (i) =>
        i.status === "Scheduled" &&
        i.facilityName &&
        (facilityStatuses[i.id] ?? i.facilityStatus) === "Waiting for Facility Approval",
    );
    if (pending.length === 0) return;

    const timers = pending.map((i) =>
      setTimeout(() => {
        setInterviews((prev) =>
          prev.map((x) =>
            x.id === i.id ? { ...x, facilityStatus: "Facility Approved" as FacilityStatus } : x,
          ),
        );
        setFacilityStatuses((prev) => ({ ...prev, [i.id]: "Facility Approved" }));
        const email = rows.find((r) => r.name === i.applicant)?.email;
        addAudit({
          actionType: "Facility Request Approved",
          target: i.applicant,
          module: "Interview Scheduling",
          details: `Facility request approved — ${i.facilityName} reserved for ${i.applicant}'s interview on ${i.date} at ${i.time}. Confirmation email sent to ${email ?? "the applicant"}.`,
        });
        toast.success(`Facility request approved — ${i.facilityName}`, {
          description: `${i.applicant}'s schedule is confirmed. Confirmation email sent to ${email ?? "the applicant"}.`,
        });
      }, 3000),
    );

    return () => timers.forEach(clearTimeout);
  }, [interviews, facilityStatuses]);
  const [scheduleDept, setScheduleDept] = useState<string>("all");
  const [schedulePosition, setSchedulePosition] = useState<string>("all");

  // Always keep the interview calendar anchored to the current month/date on mount.
  useEffect(() => {
    const now = new Date();
    setViewMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSchedule((prev) => ({ ...prev, date: TODAY_ISO }));
  }, []);
  /** DB-backed lookups for departments / positions / job-posts (with fallback to static hr.ts). */
  const [dbDepartments, setDbDepartments] = useState<ApiDepartment[]>([]);
  const [dbPositions, setDbPositions] = useState<ApiPosition[]>([]);
  const [dbJobPosts, setDbJobPosts] = useState<ApiJobPost[]>([]);

  useEffect(() => {
    Promise.allSettled([
      coreHcmApi.departments({ per_page: 100 }),
      coreHcmApi.positions({ per_page: 200 }),
      jobPostsApi.list({ per_page: 200 }),
    ]).then(([deptRes, posRes, jobRes]) => {
      if (deptRes.status === "fulfilled") {
        const d = (deptRes.value as any)?.data ?? [];
        if (Array.isArray(d) && d.length) setDbDepartments(d);
      }
      if (posRes.status === "fulfilled") {
        const p = (posRes.value as any)?.data ?? [];
        if (Array.isArray(p) && p.length) setDbPositions(p);
      }
      if (jobRes.status === "fulfilled") {
        const j = (jobRes.value as any)?.data ?? [];
        if (Array.isArray(j) && j.length) setDbJobPosts(j);
      }
    });
  }, []);

  const displayDepartments = useMemo(() => {
    if (dbDepartments.length) {
      return dbDepartments.map((d) => ({ code: String(d.department_id ?? d.code), name: d.name }));
    }
    return departments;
  }, [dbDepartments]);

  const displayPositions = useMemo(() => {
    if (dbPositions.length) {
      return dbPositions.map((p) => ({
        id: String(p.position_id ?? p.position_code),
        title: p.title,
        // ApiPosition.department may be name; fallback to lookup via department_id
        department:
          (p as any).department_name ??
          (p as any).department ??
          dbDepartments.find((d) => String(d.department_id) === String((p as any).department_id))
            ?.name ??
          departments.find(
            (d) => String((d as any).department_id) === String((p as any).department_id),
          )?.name ??
          "General",
      }));
    }
    return positions;
  }, [dbPositions, dbDepartments]);

  const activeJobTitles = useMemo(() => {
    const s = new Set<string>();
    dbJobPosts.forEach((j: any) => {
      const isActive =
        j.active !== false &&
        (j.status === "Open" || j.status === "Published" || j.status === "published");
      if (isActive && j.title) s.add(j.title);
    });
    return s;
  }, [dbJobPosts]);

  const deptHasPosting = useCallback(
    (deptName: string) =>
      dbJobPosts.some(
        (j: any) =>
          (j.department ?? j.department_name) === deptName &&
          j.active !== false &&
          (j.status === "Open" || j.status === "Published" || j.status === "published"),
      ),
    [dbJobPosts],
  );

  /** Interview being rescheduled — prefills Book an Interview and updates the record on confirm. */
  const [rescheduling, setRescheduling] = useState<Interview | null>(null);

  // Audit / history log — fully backed by database (audit_logs table)
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(true);
  const [auditSearch, setAuditSearch] = useState("");
  const [auditActionFilter, setAuditActionFilter] = useState<string>("all");
  const [auditDeptFilter, setAuditDeptFilter] = useState<string>("all");
  const [auditActorFilter, setAuditActorFilter] = useState<string>("all");

  // Latest rows / interviews / assessments for resolving audit targets to
  // human-readable applicant names (audit rows only persist a target id).
  const auditDataRef = useRef({ rows, interviews, assessments });
  auditDataRef.current = { rows, interviews, assessments };

  /** Resolves an audit entry's target id into the applicant's name — via the
   *  Applicant/Interview records when possible, otherwise by matching a known
   *  applicant name inside the entry details. Falls back to the raw id. */
  const auditTargetLabel = (a: any): string => {
    const raw = a.target_id ?? a.target;
    const id = raw == null ? "—" : String(raw);
    const details: string = a.details ?? "";
    const targetType: string = a.target_type ?? "";
    const { rows: r, interviews: iv, assessments: asm } = auditDataRef.current;
    if (/applicant/i.test(targetType)) {
      const match = r.find((x) => String(x.dbId) === id);
      if (match) return match.name;
    }
    if (/interview/i.test(targetType)) {
      const match = iv.find((x) => String(x.dbId) === id);
      if (match) return match.applicant;
    }
    if (/assessment/i.test(targetType)) {
      const match = asm.find((x) => x.name && details.includes(x.name));
      if (match) return match.name;
    }
    // Fall back to any known applicant name mentioned in the details text
    const knownNames = [
      ...new Set([
        ...r.map((x) => x.name),
        ...iv.map((x) => x.applicant),
        ...asm.map((x) => x.name),
      ]),
    ].filter((n): n is string => !!n && n.length > 2);
    const mentioned = knownNames.find((n) => details.includes(n));
    return mentioned ?? id;
  };

  const refreshAuditLog = () => {
    setAuditLoading(true);
    return auditLogApi
      .list({ module: "Applicant Management", per_page: 200 })
      .then((res) => {
        const entries: AuditEntry[] = (res.data ?? []).map((a: any) => {
          const ts: string | null = a.timestamp ?? a.occurred_at ?? a.logged_at ?? null;
          const d = ts ? ts.slice(0, 10) : isoOf(new Date());
          // ts is ISO8601 like 2026-07-20T09:12:00.000000Z — extract HH:MM with AM/PM via timeOf if needed
          let t = "";
          if (ts) {
            const isoTime = ts.slice(11, 16); // HH:MM
            t = timeOf(new Date(ts));
            // fallback to raw HH:MM:SS if parsing fails
            if (!t || t === "—") t = ts.slice(11, 19);
            if (!t) t = isoTime;
          } else {
            t = timeOf(new Date());
          }
          return {
            id: String(a.audit_log_id ?? a.id ?? Date.now()),
            date: d,
            time: t,
            actorName: a.user ?? a.actor_name ?? a.actor_role ?? "System",
            actorPosition: a.role ?? a.actor_role ?? "—",
            actorDepartment: a.department ?? a.actor_department ?? "—",
            actionType: (a.action ?? "Activity") as AuditEntry["actionType"],
            target: auditTargetLabel(a),
            module: a.module ?? a.module_name ?? "Applicant Management",
            details: a.details ?? "",
          };
        });
        setAuditLog(entries);
      })
      .catch(() => {
        // keep empty on failure — backend will be populated as actions occur
      })
      .finally(() => setAuditLoading(false));
  };

  useEffect(() => {
    refreshAuditLog();
  }, []);

  useEffect(() => {
    if (tab === "history") {
      refreshAuditLog();
    }
  }, [tab]);

  const addAudit = (
    entry: Omit<
      AuditEntry,
      "id" | "date" | "time" | "actorName" | "actorPosition" | "actorDepartment"
    >,
  ) => {
    const now = new Date();
    const next: AuditEntry = {
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      date: isoOf(now),
      time: timeOf(now),
      actorName: CURRENT_ACTOR.name,
      actorPosition: CURRENT_ACTOR.position,
      actorDepartment: CURRENT_ACTOR.department,
      ...entry,
    };
    // Optimistic local update for instant feedback
    setAuditLog((prev) => [next, ...prev]);
    // Re-sync with database after backend has persisted the real audit entry (via AuditLogger)
    window.setTimeout(() => {
      refreshAuditLog();
    }, 800);
  };

  const buildAuditReportData = (): ReportData => {
    const rowsForReport = auditSort.sorted.length ? auditSort.sorted : auditFiltered;
    const columns = [
      { header: "Date & Time", key: "datetime", width: "14%" },
      { header: "Performed By", key: "actor", width: "14%" },
      { header: "Position", key: "position", width: "14%" },
      { header: "Department", key: "dept", width: "12%" },
      { header: "Action", key: "action", width: "12%" },
      { header: "Applicant", key: "applicant", width: "12%" },
      { header: "Module", key: "module", width: "10%" },
      { header: "Details", key: "details", width: "22%" },
    ];
    const rowsData = rowsForReport.map((e) => ({
      datetime: `${e.date} ${e.time}`,
      actor: e.actorName,
      position: e.actorPosition,
      dept: e.actorDepartment,
      action: e.actionType,
      applicant: e.target,
      module: e.module,
      details: e.details,
    }));
    const filterSummary =
      auditSearch ||
      auditActionFilter !== "all" ||
      auditDeptFilter !== "all" ||
      auditActorFilter !== "all"
        ? `Filters — Action: ${auditActionFilter} | Dept: ${auditDeptFilter} | User: ${auditActorFilter}${auditSearch ? ` | Search: "${auditSearch}"` : ""}`
        : "All audit entries (no filters)";
    return {
      title: "History & Audit Report — Applicant Management",
      subtitle: `Oxford Suites Makati HRMS · ${new Date().toLocaleDateString("en-US", { dateStyle: "long" })} · ${filterSummary}`,
      columns,
      rows: rowsData,
      summary: [
        { label: "Total Entries", value: auditLog.length },
        { label: "Filtered", value: rowsForReport.length },
        { label: "Generated", value: new Date().toLocaleString() },
      ],
    };
  };

  /** Every format is password-protected: picking one opens the password gate. */
  const handleExportAuditReport = (format: ReportFormat) => {
    if (buildAuditReportData().rows.length === 0) {
      toast.error("No audit entries to export for current filters.");
      return;
    }
    setCsvPending({ kind: "audit", format });
    setCsvOpen(true);
  };

  const buildApplicantReportData = (r: (typeof reportOptions)[number]): ReportData => {
    // Department resolver — Core HCM master first (org-chart source of truth),
    // then static fallbacks. Mirrors deptForPosition / departmentOf used by the
    // ranking list, scheduler and review screen so the report can never drift
    // from the Organizational Chart's Department ↔ Position mapping.
    const deptOfPosition = (position: string) =>
      displayPositions.find((p) => p.title === position)?.department ??
      positions.find((p) => p.title === position)?.department ??
      jobs.find((j) => j.title === position)?.department ??
      "—";
    // Org-chart column arrangement: Position immediately followed by
    // Department (Employee → Position → Department → Status).
    const cols =
      r.id === "interview"
        ? [
            { header: "Applicant", key: "applicant" },
            { header: "Position", key: "position" },
            { header: "Department", key: "department" },
            { header: "Date", key: "date" },
            { header: "Time", key: "time" },
            { header: "Mode", key: "mode" },
            { header: "Interviewer", key: "interviewer" },
            { header: "Status", key: "status" },
          ]
        : r.id === "screening"
          ? [
              { header: "ID", key: "id" },
              { header: "Name", key: "name" },
              { header: "Position", key: "position" },
              { header: "Department", key: "department" },
              { header: "Email", key: "email" },
              { header: "Score", key: "score" },
              { header: "Status", key: "status" },
              { header: "Stage", key: "stage" },
            ]
          : [
              { header: "ID", key: "id" },
              { header: "Name", key: "name" },
              { header: "Position", key: "position" },
              { header: "Department", key: "department" },
              { header: "Email", key: "email" },
              { header: "Score", key: "score" },
              { header: "Status", key: "status" },
              { header: "Stage", key: "stage" },
              { header: "Applied", key: "appliedAt" },
            ];
    const byDeptThenPosition = (a: any, b: any) =>
      String(a.department ?? "").localeCompare(String(b.department ?? "")) ||
      String(a.position ?? "").localeCompare(String(b.position ?? "")) ||
      String(a.name ?? a.applicant ?? "").localeCompare(String(b.name ?? b.applicant ?? ""));
    let reportRows: Record<string, any>[];
    if (r.id === "interview") {
      reportRows = (interviews as any[])
        .map((i: any) => ({ ...i, department: deptOfPosition(i.position) }))
        .sort(byDeptThenPosition);
    } else {
      const data =
        r.id === "interview"
          ? interviews
          : rows.filter((a) =>
              r.id === "passed"
                ? a.score >= passing
                : r.id === "position" || r.id === "status"
                  ? true
                  : true,
            );
      reportRows = (data as any[])
        .map((a: any) => ({ ...a, department: deptOfPosition(a.position) }))
        .sort(byDeptThenPosition);
    }
    const scopeParts = [
      `Position: ${positionFilter}`,
      `Status: ${statusFilter}`,
      `Stage: ${stageFilter}`,
    ];
    const departmentsCovered = new Set(
      reportRows.map((x: any) => x.department).filter((d) => d && d !== "—"),
    ).size;
    return {
      title: `Applicant Management — ${r.title}`,
      subtitle: `Oxford Suites Makati HRMS · ${new Date().toLocaleDateString()} · Predefined report: ${r.title} · ${scopeParts.join(" | ")}`,
      columns: cols,
      rows: reportRows as any,
      // Same security logic as every other module: applicant rows carry PII
      // (names + emails) so the export must be password-gated like the roster.
      sensitive: true,
      summary: [
        { label: "Total Applicants", value: rows.length },
        {
          label: "Passed Screening",
          value: rows.filter((a) => a.score >= passing).length,
        },
        { label: "Interviews Scheduled", value: interviews.length },
        { label: "Departments Covered", value: departmentsCovered },
        { label: "Rows in Report", value: reportRows.length },
      ],
    };
  };

  /** Every format is password-protected: picking one opens the password gate. */
  const handleExportApplicantReport = (r: (typeof reportOptions)[number], format: ReportFormat) => {
    if (buildApplicantReportData(r).rows.length === 0) {
      toast.error(`No records to export for ${r.title}.`);
      return;
    }
    setCsvPending({ kind: "applicant", optionId: r.id, format });
    setCsvOpen(true);
  };

  const confirmCsvExport = async (password: string) => {
    if (!csvPending) return;
    setCsvBusy(true);
    try {
      const data =
        csvPending.kind === "audit"
          ? buildAuditReportData()
          : buildApplicantReportData(
              reportOptions.find((o) => o.id === csvPending.optionId) ?? reportOptions[0]!,
            );
      await exportReport(data, csvPending.format, { password });
      const { zipName } = describeExport(data, csvPending.format);
      toast.success(
        `${data.title} exported as password-protected ${csvPending.format.toUpperCase()} (${zipName}).`,
      );
      setCsvOpen(false);
      setCsvPending(null);
    } catch (e) {
      console.error("Protected export failed:", e);
      toast.error(e instanceof Error ? e.message : "Protected export failed.");
    } finally {
      setCsvBusy(false);
    }
  };

  /** Load verification documents (with their verification results) whenever
   *  the review dialog opens for an applicant. */
  useEffect(() => {
    if (!review) {
      setReviewDocVerifications({});
      return;
    }
    let cancelled = false;
    setReviewDocsLoading(true);
    applicantDocumentsApi
      .list(review.dbId ?? review.id)
      .then((res) => {
        if (cancelled) return;
        const map: Record<string, ApiApplicantDocument> = {};
        (res?.data ?? []).forEach((doc) => {
          map[String(doc.applicant_document_id)] = doc;
        });
        setReviewDocVerifications(map);
      })
      .catch((e) => {
        if (!cancelled) console.warn("Could not load verification documents:", e);
      })
      .finally(() => {
        if (!cancelled) setReviewDocsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [review?.id]);

  /** Re-runs supporting-document verification against the resume claims. */
  const reverifyDocument = async (doc: ApiApplicantDocument) => {
    const key = String(doc.applicant_document_id);
    setReverifyingDocId(key);
    try {
      const updated = await applicantDocumentsApi.verify(doc.applicant_document_id);
      setReviewDocVerifications((prev) => ({ ...prev, [key]: updated }));
      toast.success(`Re-verification complete: ${updated.verification_status ?? "PENDING"}`);
      // The backend already re-includes the fresh verdict in the ranking, so
      // pull the recomputed percentage/status for the row + open dialog.
      if (review?.dbId) {
        const res = await applicantsApi.recomputeScreening(review.dbId);
        const updatedApplicant = transformApiApplicant(res.applicant);
        setRows((prev) => prev.map((r) => (r.id === updatedApplicant.id ? updatedApplicant : r)));
        setReview((prev) => (prev && prev.id === updatedApplicant.id ? updatedApplicant : prev));
      }
    } catch (e) {
      console.warn("Re-verification failed:", e);
      toast.error("Could not re-verify the document. Is the NLP service online?");
    } finally {
      setReverifyingDocId(null);
    }
  };

  /**
   * Recomputes the applicant's screening with the CURRENT supporting-document
   * evidence (NLP blends the resume score with the documents score), then
   * refreshes the row + any open dialog so Candidate Ranking, the Top 5 list,
   * the table percentage and the official status all reflect the verification.
   */
  const recomputeRanking = async (a: Applicant) => {
    if (!a.dbId) return;
    setRecomputingRanking(true);
    try {
      const res = await applicantsApi.recomputeScreening(a.dbId);
      const updated = transformApiApplicant(res.applicant);
      setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setReview((prev) => (prev && prev.id === updated.id ? updated : prev));
      toast.success(
        `Ranking recomputed: ${Math.round(updated.score)}% — ${statusMeta[updated.status].label}`,
      );
    } catch (e) {
      console.error("Ranking recompute failed:", e);
      toast.error("Could not recompute the ranking. Is the NLP service online?");
    } finally {
      setRecomputingRanking(false);
    }
  };

  /**
   * Stages hidden from the active pipeline lists.
   * Hired applicants move to New Hire Onboarding and are no longer shown.
   * Rejected applicants REMAIN visible in the list — they are simply labelled
   * as "Rejected" (with their decision actions locked).
   */
  const hiddenStages = ["Hired"];
  const isHiddenStage = (a: Applicant) => hiddenStages.includes(a.stage);

  /**
   * Pipeline Overview position label — "Step X of 5" for the five visible
   * stages (Screening → Interview → Assessment → Practical → Final).
   * Returns null when the applicant is no longer moving through the steps.
   */
  const pipelineStepOf = (stage: Applicant["stage"]): string | null => {
    switch (stage) {
      case "Screened":
      case "Accepted":
        return "Step 1 of 5";
      case "Interview Scheduled":
      case "Assessed":
        return "Step 2 of 5";
      case "Assessment Test":
        return "Step 3 of 5";
      case "Practical Test":
        return "Step 4 of 5";
      case "Final Evaluation":
      case "Offer":
        return "Step 5 of 5";
      default:
        return null;
    }
  };

  /** Stages where the hiring decision is already made — these applicants can
   *  no longer be accepted & scheduled, rejected, or referred to another role
   *  from the applicant list review. */
  const LOCKED_ACTION_STAGES: Applicant["stage"][] = [
    "Interview Scheduled",
    "Assessed",
    "Assessment Test",
    "Practical Test",
    "Final Evaluation",
    "Accepted",
    "Offer",
    "Rejected",
  ];
  const isActionLocked = (a: Applicant) => LOCKED_ACTION_STAGES.includes(a.stage);

  /** Interviews can be rescheduled while the applicant is still within the
   *  interview phase (not yet assessed / offered / hired / rejected) and no
   *  assessment is recorded. The assessment record — not the raw status
   *  string — decides "done": a stale "Completed" without an assessment is
   *  still an open booking (reschedulable / cancellable).
   *  Cancelled interviews stay re-bookable (reschedule reactivates them). */
  const isInterviewLocked = (i: { status: string; applicant: string }): boolean => {
    if (i.status === "Cancelled") return false;
    // An assessment record means the interview is truly done — locking it
    // protects the saved scorecard from being orphaned.
    if (assessments.some((x) => x.name === i.applicant)) return true;
    // Stale "Completed" without an assessment is still actionable.
    if (i.status === "Completed") return false;
    const src = rows.find((r) => r.name === i.applicant);
    if (!src) return false;
    return [
      "Assessed",
      "Assessment Test",
      "Practical Test",
      "Final Evaluation",
      "Offer",
      "Hired",
      "Rejected",
    ].includes(src.stage);
  };

  /** Applicants who have moved past assessment (Offer / Accepted / Hired /
   *  Rejected) no longer belong in the assessment list. */
  const noLongerAssessable = (a: Applicant) =>
    ["Offer", "Accepted", "Hired", "Rejected"].includes(a.stage);

  const distribution = useMemo(() => {
    const scoped =
      positionFilter === "all" ? rows : rows.filter((a) => a.position === positionFilter);
    return (Object.keys(statusMeta) as ApplicantStatus[]).map((k) => ({
      key: k,
      name: statusMeta[k].label,
      value: scoped.filter((a) => a.status === k).length,
    }));
  }, [rows, positionFilter]);

  const screenedTotal = distribution.reduce((t, d) => t + d.value, 0);

  /** Applicants whose ranking percentage includes verified document evidence
   *  (a COE / Certificate / Credential was compared against the resume claims). */
  const documentVerifiedTotal = useMemo(
    () =>
      rows.filter((a) =>
        ["VERIFIED", "PARTIAL", "DISCREPANCY"].includes(
          (a.screening_detail?.document_verification?.status ?? "").toUpperCase(),
        ),
      ).length,
    [rows],
  );

  const topFiveToday = useMemo(
    () =>
      [...rows]
        .filter((a) => !isHiddenStage(a))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5),
    [rows, isHiddenStage],
  );

  /* Measures one candidate card once it is on screen and locks the list
     viewport to TOP_FIVE_VISIBLE_CARDS cards (see the ranking card). Runs
     before paint, so the list never flashes all five cards. */
  useLayoutEffect(() => {
    if (!topFiveList || !topFiveCard) return;
    const measure = () => {
      const rowGap = Number.parseFloat(getComputedStyle(topFiveList).rowGap || "0") || 0;
      const cardHeight = topFiveCard.getBoundingClientRect().height;
      if (cardHeight <= 0) return;
      setTopFiveViewport(
        Math.round(cardHeight * TOP_FIVE_VISIBLE_CARDS + rowGap * (TOP_FIVE_VISIBLE_CARDS - 1)),
      );
    };
    measure();
    // Re-measure when the card resizes (zoom, font-size, longer content).
    const observer = new ResizeObserver(measure);
    observer.observe(topFiveCard);
    return () => observer.disconnect();
  }, [topFiveList, topFiveCard, topFiveToday.length]);

  const filtered = rows.filter((a) => {
    if (isHiddenStage(a)) return false;
    if (positionFilter !== "all" && a.position !== positionFilter) return false;
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (stageFilter !== "all" && a.stage !== stageFilter) return false;
    if (rankingFilter === "passed" && a.score < passing) return false;
    if (
      rankingFilter === "ready" &&
      !(a.stage === "Interview Scheduled" && !assessments.some((x) => x.applicantId === a.id))
    )
      return false;
    if (
      search &&
      !`${a.name} ${a.email} ${a.position}`.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  /** Switches to the applicant list, applies a quick metric filter, and scrolls it into view. */
  const goToApplicants = (filter: "all" | "passed" | "ready") => {
    setTab("ranking");
    setRankingFilter(filter);
    if (filter === "all") {
      setPositionFilter("all");
      setStatusFilter("all");
      setStageFilter("all");
      setSearch("");
    }
    window.setTimeout(() => {
      applicantListRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 60);
  };

  /** Candidate Ranking donut/legend → filters the Applicant List by that
   *  screening status (Perfect for the Job, Fit for other Job, Invalid
   *  credential, Not fitted to Job) and scrolls it into view. */
  const goToStatus = (status: ApplicantStatus) => {
    setTab("ranking");
    setRankingFilter("all");
    setStatusFilter(status);
    setStageFilter("all");
    setPositionFilter("all");
    setSearch("");
    window.setTimeout(() => {
      applicantListRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 60);
  };

  /** Opens the Interview Pipeline section, focused on today's date — both the
   *  booking calendar AND the Room Availability & Daily Schedule calendar jump
   *  to today, and the Pipeline Overview lists every applicant scheduled for
   *  today. */
  const goToTodayInterviews = () => {
    setTab("scheduling");
    setSchedule((s) => ({ ...s, date: TODAY_ISO }));
    const d = new Date(`${TODAY_ISO}T00:00:00`);
    setViewMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    setCalViewDate(TODAY_ISO);
    setCalViewMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    // Pipeline Overview → only the candidates booked for today.
    setPipelineScheduledDate(TODAY_ISO);
    setPipelineStage("all");
    setPipelinePosition("all");
    setPipelineResult("all");
    setPipelineSearch("");
    window.setTimeout(() => {
      roomAvailabilityRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  /** Metric → "New Applicant": opens the Pipeline Overview filtered to fresh
   *  Screened applicants (screening done, no hiring decision yet). */
  const goToNewApplicants = () => {
    setTab("scheduling");
    setPipelineStage("Screened");
    setPipelineResult("all");
    setPipelinePosition("all");
    setPipelineSearch("");
    setPipelineScheduledDate(null);
    window.setTimeout(() => {
      pipelineListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  /** Metric → "Perfect for the Job": opens the Pipeline Overview filtered to
   *  candidates the screener marked perfect for the job (status = fit). */
  const goToPerfectForJob = () => {
    setTab("scheduling");
    setPipelineStage("all");
    setPipelinePosition("all");
    setPipelineSearch("");
    setPipelineResult("perfect");
    setPipelineScheduledDate(null);
    window.setTimeout(() => {
      pipelineListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  /** Daily Schedule Preview row → select the applicant in the Pipeline
   *  Overview (searches their name there) and scrolls the card into view. */
  const selectInPipeline = (applicantName: string) => {
    setTab("scheduling");
    setPipelineStage("all");
    setPipelinePosition("all");
    setPipelineResult("all");
    setPipelineSearch(applicantName);
    window.setTimeout(() => {
      pipelineListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  /** Daily Schedule Preview → "View list in Pipeline": shows every applicant
   *  whose live interview is booked on the previewed day in the Pipeline
   *  Overview (today's preview therefore lists today's candidates). */
  const showScheduledInPipeline = (date: string) => {
    setTab("scheduling");
    setPipelineScheduledDate(date);
    setPipelineStage("all");
    setPipelinePosition("all");
    setPipelineResult("all");
    setPipelineSearch("");
    window.setTimeout(() => {
      pipelineListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  /** "View scheduled in the calendar" — jumps to the Interview Pipeline and
   *  points the Room Availability & Daily Schedule calendar at the booked
   *  interview's date (and reserved room, when one exists). */
  const viewScheduledInCalendar = (a: Applicant) => {
    const booked =
      interviews.find((i) => i.applicant === a.name && i.status !== "Cancelled") ??
      interviews.find((i) => i.applicant === a.name);
    const date = booked?.date ?? TODAY_ISO;
    const d = new Date(`${date}T00:00:00`);
    setTab("scheduling");
    setCalViewDate(date);
    setSchedule((s) => ({ ...s, date }));
    if (!Number.isNaN(d.getTime())) {
      setCalViewMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    }
    const room = booked?.facilityName
      ? facilities.find((f) => f.name === booked.facilityName)
      : undefined;
    if (room) setCalViewFacilityId(room.id);
    window.setTimeout(() => {
      roomAvailabilityRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  const applicantSort = useSort(filtered, {
    name: (a) => a.name,
    contact: (a) => a.email,
    position: (a) => a.position,
    applied: (a) => a.appliedAt,
    score: (a) => a.score,
    status: (a) => statusMeta[a.status].label,
    stage: (a) => a.stage,
  });

  const setStage = (id: string, stage: Applicant["stage"]) =>
    setRows((prev) => prev.map((a) => (a.id === id ? { ...a, stage } : a)));

  /** Accepting an assessment hands the applicant to New Hire Onboarding as pre-onboarding. */
  const acceptAssessment = async (r: AssessmentResult) => {
    const applicant = rows.find((a) => a.id === r.applicantId);
    setStage(r.applicantId, "Hired");
    addAudit({
      actionType: "Assessment Accepted",
      target: r.name,
      module: "Applicant Management",
      details: `Accepted after assessment (${r.total}%) and sent to New Hire Onboarding`,
    });
    hireStore.setPending({
      name: r.name,
      position: r.position,
      department: positions.find((p) => p.title === r.position)?.department ?? "",
      email: applicant?.email ?? "",
      phone: applicant?.phone ?? "",
      ...(applicant?.dbId !== undefined ? { applicantId: applicant.dbId } : {}),
    });
    setAssessments((prev) => prev.filter((a) => a.applicantId !== r.applicantId));
    toast.success(`${r.name} accepted — creating their pre-onboarding record`);

    try {
      const appId = applicant?.dbId ?? r.applicantId;
      await applicantsApi.hire(appId);
    } catch (e) {
      console.warn("Could not advance applicant stage on database API:", e);
    }

    navigate({ to: `/${role}/onboarding` });
  };

  /** Rejecting an assessment keeps the record in the list, only labelled as
   *  "Rejected" — the assessment history must remain visible. */
  const rejectAssessment = async (r: AssessmentResult) => {
    const applicant = rows.find((a) => a.id === r.applicantId);
    setStage(r.applicantId, "Rejected");
    addAudit({
      actionType: "Assessment Rejected",
      target: r.name,
      module: "Applicant Management",
      details: `Rejected after assessment (${r.total}%)`,
    });
    toast.success(`${r.name} rejected after assessment`);

    try {
      if (applicant?.dbId) {
        await applicantsApi.update(applicant.dbId, { stage: "Rejected" });
      }
    } catch (e) {
      console.warn("Could not update applicant stage on database API:", e);
    }
  };

  /** Confirms the verified candidate decision from the Verify Candidate
   *  Decision dialog. Recommended for Hire auto-accepts the candidate,
   *  For Another Position opens the position picker then auto-accepts into
   *  the chosen position, and Not Recommended auto-rejects — the tab-level
   *  Accept / Reject buttons were removed because verification IS the
   *  decision. The Reject button in the footer passes "Not Recommended"
   *  directly; Confirm uses the selected recommendation. */
  const confirmVerifyFinal = (choice?: FinalRecommendation) => {
    const chosen = choice ?? verifyChoice;
    if (!verifyingFinal || !chosen) {
      toast.error("Select a recommendation to verify.");
      return;
    }
    const f = verifyingFinal;
    setVerifiedDecisions((prev) => ({ ...prev, [f.id]: chosen }));
    addAudit({
      actionType: "Final Evaluation Completed",
      target: f.name,
      module: "Applicant Management",
      details: `Candidate decision verified for ${f.name} — ${chosen}.`,
    });

    if (chosen === "Not Recommended") {
      setVerifyingFinal(null);
      setVerifyChoice(null);
      rejectFinalEvaluation(f, chosen);
      return;
    }
    if (chosen === "Recommended for Hire") {
      setVerifyingFinal(null);
      setVerifyChoice(null);
      acceptFinalEvaluation(f, chosen);
      return;
    }
    // For Another Position — pick the best recommended position first; the
    // candidate is auto-accepted into it once chosen.
    setVerifyingFinal(null);
    setVerifyChoice(null);
    setPositionPick(f);
    setPositionPickChoice("");
  };

  /** Auto-accepts the candidate from the Verify Candidate Decision flow
   *  (verified Recommended for Hire / For Another Position): hands the
   *  applicant to New Hire Onboarding as pre-onboarding, hired as a
   *  Probationary employee — same process as accepting a candidate. */
  const acceptFinalEvaluation = async (
    f: FinalEvaluationRow,
    verified: FinalRecommendation,
    positionOverride?: string,
  ) => {
    const applicant = rows.find((a) => a.id === f.applicantId);
    const hirePosition = positionOverride ?? f.position;
    setStage(f.applicantId, "Hired");
    addAudit({
      actionType: "Assessment Accepted",
      target: f.name,
      module: "Applicant Management",
      details: `Accepted after final evaluation (verified: ${verified}${
        positionOverride ? ` — reassigned to ${hirePosition}` : ""
      }) and sent to New Hire Onboarding as Probationary`,
    });
    hireStore.setPending({
      name: f.name,
      position: hirePosition,
      department: positions.find((p) => p.title === hirePosition)?.department ?? "",
      email: applicant?.email ?? "",
      phone: applicant?.phone ?? "",
      ...(applicant?.dbId !== undefined ? { applicantId: applicant.dbId } : {}),
    });
    toast.success(`${f.name} accepted — creating their pre-onboarding record as Probationary`);

    try {
      const appId = applicant?.dbId ?? f.applicantId;
      await applicantsApi.hire(appId);
      // Hired closes the pipeline — refresh so the progress bar shows it at once.
      syncAfterStageChange();
    } catch (e) {
      console.warn("Could not advance applicant stage on database API:", e);
    }

    navigate({ to: `/${role}/onboarding` });
  };

  /** Auto-rejects the candidate from the Verify Candidate Decision flow
   *  (verified Not Recommended) and keeps the final evaluation record
   *  visible. */
  const rejectFinalEvaluation = async (f: FinalEvaluationRow, verified: FinalRecommendation) => {
    const applicant = rows.find((a) => a.id === f.applicantId);
    setStage(f.applicantId, "Rejected");
    addAudit({
      actionType: "Assessment Rejected",
      target: f.name,
      module: "Applicant Management",
      details: `Rejected after final evaluation (verified: ${verified})`,
    });
    toast.success(`${f.name} rejected after final evaluation`);

    try {
      if (applicant?.dbId) {
        await applicantsApi.update(applicant.dbId, { stage: "Rejected" });
      }
      // The pipeline closed — refresh so the progress bar shows it at once.
      syncAfterStageChange();
    } catch (e) {
      console.warn("Could not update applicant stage on database API:", e);
    }
  };

  /** Accept → prefill the scheduler and jump to the Interview Scheduling tab. */
  const acceptAndSchedule = (a: Applicant) => {
    // "Accepted" applicants are exactly the ones this action is for — only
    // block stages past the decision point (assessed, offered, hired, rejected).
    if (a.stage !== "Accepted" && isActionLocked(a)) return;
    // Prefer DB-backed positions so the department filter matches the
    // "1. Select Applicant" list; fall back to the static lookups.
    const dept =
      displayPositions.find((p) => p.title === a.position)?.department ??
      positions.find((p) => p.title === a.position)?.department ??
      jobs.find((j) => j.id === a.jobId)?.department;
    const known = dept && displayDepartments.some((d) => d.name === dept) ? dept : "all";
    setScheduleDept(known);
    setSchedule((s) => ({ ...s, applicant: a.name }));
    setBookingFocus(true);
    // Accepted applicants (stage) become selectable for interview booking
    setStage(a.id, "Accepted");
    closeReview();
    setTab("scheduling");
    toast.success(`${a.name} moved to scheduling`, {
      description: "Pick a suggested date and slot on the interview calendar.",
    });

    try {
      if (a.dbId) applicantsApi.update(a.dbId, { stage: "Accepted" });
    } catch (e) {
      console.warn("Could not mark applicant as Accepted on database API:", e);
    }
  };

  /** Reschedule — prefills the Book an Interview card with the current interview data
   *  (department, applicant, date, time slot, mode, interviewer) and updates the
   *  existing record when confirmed. */
  const rescheduleInterview = (i: Interview) => {
    if (isInterviewLocked(i)) return;
    const src = rows.find((r) => r.name === i.applicant);
    const dept = src
      ? (displayPositions.find((p) => p.title === src.position)?.department ??
        positions.find((p) => p.title === src.position)?.department ??
        jobs.find((j) => j.id === src.jobId)?.department)
      : undefined;
    const known = dept && displayDepartments.some((d) => d.name === dept) ? dept : "all";
    const slotTime = slotsForSelected.includes(i.time) ? i.time : slotsForSelected[0]!;
    setScheduleDept(known);
    setSchedule({
      applicant: i.applicant,
      date: i.date,
      time: slotTime,
      mode: i.mode,
      interviewer: scheduleInterviewers.some((s) => s.name === i.interviewer)
        ? i.interviewer
        : (scheduleInterviewers[0]?.name ?? i.interviewer),
      // Carry the reserved facility over when rescheduling (mock tracker).
      facilityId: facilities.find((f) => f.name === i.facilityName)?.id ?? "",
    });
    // Point the interview calendar at the month of the scheduled date so the
    // booked day is immediately visible/highlighted.
    const d = new Date(`${i.date}T00:00:00`);
    if (!Number.isNaN(d.getTime())) {
      setViewMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    }
    setRescheduling(i);
    setBookingFocus(true);
    setTab("scheduling");
    toast.success(`Rescheduling ${i.applicant}`, {
      description: `Current: ${i.date} · ${i.time} — pick a new date and slot.`,
    });
  };

  /** Maps the interviewer chosen in "Book an Interview" to the matching
   *  system user, so the interview Assessor defaults to that same person.
   *  Falls back to a word-overlap match when the stored name is ordered,
   *  punctuated or titled differently ("Chef Gabriel Mendoza" vs
   *  "Gabriel Mendoza"). */
  const assessorIdForInterviewer = (interviewerName?: string | null): string => {
    const norm = (v: string) => v.trim().toLowerCase().replace(/\s+/g, " ");
    const titles = new Set([
      "chef",
      "mr",
      "mrs",
      "ms",
      "miss",
      "dr",
      "engr",
      "atty",
      "sir",
      "maam",
      "madam",
      "capt",
      "prof",
    ]);
    const coreWords = (v: string) => {
      const words = norm(v).split(" ").filter(Boolean);
      const stripped = words.filter((w) => !titles.has(w.replace(/[.]/g, "")));
      return stripped.length > 0 ? stripped : words;
    };
    const wanted = norm(interviewerName ?? "");
    if (!wanted) return "";
    const exact = assessors.find((u) => norm(u.full_name ?? "") === wanted);
    if (exact) return String(exact.system_user_id);
    const wantedWords = coreWords(wanted);
    const loose = assessors.find((u) => {
      const words = coreWords(u.full_name ?? "");
      if (words.length === 0 || wantedWords.length === 0) return false;
      const [short, long] =
        wantedWords.length <= words.length ? [wantedWords, words] : [words, wantedWords];
      const longSet = new Set(long);
      return short.every((w) => longSet.has(w));
    });
    return loose ? String(loose.system_user_id) : "";
  };

  /** Opens the interview assessment dialog for an applicant — shared by the
   *  Pipeline Overview interview cell and the applicant View screen.
   *  The Interviewer is pre-filled with the logged-in staff member (the person
   *  processing the interview); when the booking names a different interviewer
   *  that person is used instead. Required to save the interview. */
  const startInterviewFor = (a: Applicant) => {
    setEvaluating(a);
    setEvalScores(Object.fromEntries(assessmentCriteria.map((c) => [c, 4])));
    setEvalComments({});
    setEvalResult(null);
    setEvalRemarks("");
    const iv =
      interviews.find((x) => x.applicant === a.name && x.status !== "Cancelled") ??
      interviews.find((x) => x.applicant === a.name);
    setEvalAssessor(loggedInAssessorId || assessorIdForInterviewer(iv?.interviewer));
    setEvalDateTime(isoOf(new Date()));
  };

  /** Re-book — like reschedule but also reactivates Rejected applicants.
   *  Bypasses isInterviewLocked (which locks Rejected) and resets the
   *  applicant stage to Interview Scheduled so confirming the new slot
   *  resumes the pipeline. */
  const rebookInterview = (i: Interview) => {
    const src = rows.find((r) => r.name === i.applicant);
    const dept = src
      ? (displayPositions.find((p) => p.title === src.position)?.department ??
        positions.find((p) => p.title === src.position)?.department ??
        jobs.find((j) => j.id === src.jobId)?.department)
      : undefined;
    const known = dept && displayDepartments.some((d) => d.name === dept) ? dept : "all";
    const slotTime = slotsForSelected.includes(i.time) ? i.time : slotsForSelected[0]!;
    setScheduleDept(known);
    setSchedule({
      applicant: i.applicant,
      date: i.date,
      time: slotTime,
      mode: i.mode,
      interviewer: scheduleInterviewers.some((s) => s.name === i.interviewer)
        ? i.interviewer
        : (scheduleInterviewers[0]?.name ?? i.interviewer),
      facilityId: facilities.find((f) => f.name === i.facilityName)?.id ?? "",
    });
    const d = new Date(`${i.date}T00:00:00`);
    if (!Number.isNaN(d.getTime())) {
      setViewMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    }
    setRescheduling(i);
    setBookingFocus(true);
    if (src && src.stage === "Rejected") {
      setStage(src.id, "Interview Scheduled");
      addAudit({
        actionType: "Interview Rescheduled",
        target: src.name,
        module: "Interview Scheduling",
        details: `Re-booked after rejection — previous: ${i.date} · ${i.time}. Pick a new date and slot.`,
      });
      try {
        if (src.dbId) applicantsApi.update(src.dbId, { stage: "Interview Scheduled" });
      } catch (e) {
        console.warn("Could not reactivate applicant stage on database API:", e);
      }
    }
    setTab("scheduling");
    toast.success(`Re-booking ${i.applicant}`, {
      description: `Previous: ${i.date} · ${i.time} — pick a new date and slot.`,
    });
  };

  /** Re-book a Rejected applicant that has no interview record left
   *  (e.g. rejected at screening). Reactivates them to Accepted and jumps
   *  to the scheduler so a fresh interview can be booked. */
  const rebookRejectedApplicant = (a: Applicant) => {
    if (a.stage !== "Rejected") return;
    const dept =
      displayPositions.find((p) => p.title === a.position)?.department ??
      positions.find((p) => p.title === a.position)?.department ??
      jobs.find((j) => j.id === a.jobId)?.department;
    const known = dept && displayDepartments.some((d) => d.name === dept) ? dept : "all";
    setScheduleDept(known);
    setSchedule((s) => ({ ...s, applicant: a.name }));
    setBookingFocus(true);
    setStage(a.id, "Accepted");
    addAudit({
      actionType: "Interview Rescheduled",
      target: a.name,
      module: "Interview Scheduling",
      details: `Re-booked after rejection — reactivated from Rejected to Accepted. Pick a new date and slot.`,
    });
    try {
      if (a.dbId) applicantsApi.update(a.dbId, { stage: "Accepted" });
    } catch (e) {
      console.warn("Could not reactivate applicant stage on database API:", e);
    }
    setTab("scheduling");
    toast.success(`Re-booking ${a.name}`, {
      description: "Pick a new date and slot to resume their pipeline.",
    });
  };

  const confirmSchedule = async () => {
    if (!schedule.applicant) {
      toast.error("Select an applicant first");
      return;
    }
    if (!schedule.interviewer) {
      toast.error("Select an interviewer first");
      return;
    }
    if (!schedule.facilityId || schedule.facilityId === "none") {
      toast.error("Request a facility to schedule the interview");
      return;
    }
    // When the applicant already has a live interview booked, this booking acts
    // as a reschedule of that interview instead of blocking the action.
    // Cancelled interviews don't count — they're re-bookable.
    const existingInterview = interviews.find(
      (i) => i.applicant === schedule.applicant && i.status !== "Cancelled",
    );
    const updateTarget = rescheduling ?? existingInterview ?? null;
    const taken = interviews.filter(
      (i) => i.date === schedule.date && i.time === schedule.time && i.id !== updateTarget?.id,
    ).length;
    if (taken >= capacityPerSlot) {
      toast.error(
        `That slot is full — ${capacityPerSlot} applicants already booked for ${schedule.time}.`,
      );
      return;
    }
    // The requested room / meeting space can only host one interview per slot.
    if (facilityBookedInSlot(schedule.facilityId, schedule.date, schedule.time)) {
      toast.error("That facility is already booked for this slot.", {
        description: `${
          facilities.find((f) => f.id === schedule.facilityId)?.name ?? "The room"
        } has another interview at ${schedule.time} on ${schedule.date} — pick a different slot or request another facility.`,
      });
      return;
    }

    // Reschedule (or re-book) — update the existing interview record instead of creating a new one
    if (updateTarget) {
      const facilityName =
        schedule.facilityId && schedule.facilityId !== "none"
          ? (facilities.find((f) => f.id === schedule.facilityId)?.name ??
            updateTarget.facilityName ??
            null)
          : (updateTarget.facilityName ?? null);
      const updated: Interview = {
        ...updateTarget,
        date: schedule.date,
        time: schedule.time,
        mode: schedule.mode as "On-site" | "Virtual",
        interviewer: schedule.interviewer,
        status: "Scheduled",
        facilityName,
        facilityStatus:
          schedule.facilityId && schedule.facilityId !== "none"
            ? ("Waiting for Facility Approval" as FacilityStatus)
            : (updateTarget.facilityStatus ?? ("Not Required" as FacilityStatus)),
      };
      setInterviews((prev) => prev.map((x) => (x.id === updateTarget.id ? updated : x)));
      // Re-book / reschedule always (re)activates the applicant into the
      // interview stage — e.g. Cancelled (Screened) or Rejected back to
      // Interview Scheduled so the pipeline resumes.
      const srcForStage = rows.find((a) => a.name === schedule.applicant);
      if (srcForStage && srcForStage.stage !== "Interview Scheduled") {
        setStage(srcForStage.id, "Interview Scheduled");
        try {
          if (srcForStage.dbId)
            applicantsApi.update(srcForStage.dbId, { stage: "Interview Scheduled" });
        } catch (e) {
          console.warn("Could not advance applicant stage on database API:", e);
        }
      }
      if (schedule.facilityId && schedule.facilityId !== "none") {
        setFacilityStatuses((prev) => ({
          ...prev,
          [updateTarget.id]: "Waiting for Facility Approval",
        }));
      }
      addAudit({
        actionType: "Interview Rescheduled",
        target: schedule.applicant,
        module: "Interview Scheduling",
        details: `Rescheduled to ${schedule.date} · ${schedule.time} · ${schedule.mode} with ${schedule.interviewer}.`,
      });
      toast.success(`Interview rescheduled for ${schedule.applicant}`, {
        description: `${schedule.date} · ${schedule.time} · ${schedule.mode}`,
      });
      try {
        if (updateTarget.dbId) {
          await interviewsApi.update(updateTarget.dbId, {
            scheduled_date: schedule.date,
            scheduled_time: schedule.time.includes(":") ? schedule.time.slice(0, 5) : "09:00",
            mode: schedule.mode,
            interviewer_name: schedule.interviewer,
            status: "Scheduled",
          });
        }
      } catch (e) {
        console.warn("Could not persist interview reschedule to database API:", e);
      }
      setRescheduling(null);
      setBookingFocus(false);
      return;
    }

    const src = rows.find((a) => a.name === schedule.applicant);
    let applicantId = src?.dbId;
    if (!applicantId) {
      if (!src) {
        toast.error(`Could not find ${schedule.applicant} in the applicant list.`);
        return;
      }
      // The applicant was only ever added locally (e.g. the earlier save to
      // the database failed). Persist it now so the interview can be booked.
      try {
        let jobPostId = 1;
        try {
          const jobsRes = await jobPostsApi.list({ per_page: 100 });
          jobPostId = jobsRes?.data?.find((j) => j.title === src.position)?.job_post_id ?? 1;
        } catch {
          // fall back to the first job post when the lookup fails
        }
        const created = await applicantsApi.create({
          job_post_id: jobPostId,
          name: src.name,
          email: src.email,
          phone: src.phone,
          source: src.source,
          summary: src.summary,
          status: src.status,
          stage: src.stage,
          flags_json: src.flags ?? [],
          fit_score: src.score,
        });
        applicantId = created.applicant_id;
        setRows((prev) =>
          prev.map((x) => (x.id === src.id ? { ...x, dbId: created.applicant_id } : x)),
        );
      } catch (e) {
        console.warn("Could not persist applicant to database API:", e);
        toast.error(
          `${schedule.applicant} could not be saved to the database, so the interview cannot be scheduled. ${
            e instanceof Error ? e.message : ""
          }`,
        );
        return;
      }
    }
    const newInt = {
      id: `INT-${300 + interviews.length}`,
      applicant: schedule.applicant,
      position: src?.position ?? "—",
      date: schedule.date,
      time: schedule.time,
      mode: schedule.mode as "On-site" | "Virtual",
      interviewer: schedule.interviewer,
      status: "Scheduled" as const,
      // Request facility: reserve the chosen facility for this schedule. The
      // schedule is only confirmed once the facility request is approved.
      facilityName:
        schedule.facilityId && schedule.facilityId !== "none"
          ? (facilities.find((f) => f.id === schedule.facilityId)?.name ?? null)
          : null,
      facilityStatus: (schedule.facilityId && schedule.facilityId !== "none"
        ? "Waiting for Facility Approval"
        : "Not Required") as FacilityStatus,
    };
    setInterviews((prev) => [newInt, ...prev]);
    if (schedule.facilityId && schedule.facilityId !== "none") {
      setFacilityStatuses((prev) => ({ ...prev, [newInt.id]: "Waiting for Facility Approval" }));
    }
    if (src) setStage(src.id, "Interview Scheduled");
    addAudit({
      actionType: "Interview Scheduled",
      target: schedule.applicant,
      module: "Interview Scheduling",
      details: `${schedule.mode} interview booked for ${schedule.date} · ${schedule.time} with ${schedule.interviewer}.${
        schedule.facilityId && schedule.facilityId !== "none"
          ? ` Facility request submitted for ${facilities.find((f) => f.id === schedule.facilityId)?.name} — awaiting approval.`
          : ""
      }`,
    });
    toast.success(
      schedule.facilityId && schedule.facilityId !== "none"
        ? `Interview scheduled for ${schedule.applicant} — awaiting facility approval`
        : `Interview confirmed for ${schedule.applicant}`,
      {
        description: `${schedule.date} · ${schedule.time} · ${schedule.mode}${
          schedule.facilityId && schedule.facilityId !== "none"
            ? ` · ${facilities.find((f) => f.id === schedule.facilityId)?.name} (facility approval pending)`
            : ""
        }`,
      },
    );

    try {
      const chosenFacility =
        schedule.facilityId && schedule.facilityId !== "none"
          ? facilities.find((f) => f.id === schedule.facilityId)
          : undefined;
      const createdInterview = await interviewsApi.create({
        applicant_id: applicantId,
        scheduled_date: schedule.date,
        scheduled_time: schedule.time.includes(":") ? schedule.time.slice(0, 5) : "09:00",
        mode: schedule.mode,
        interviewer_name: schedule.interviewer,
        status: "Scheduled",
        facility_id: chosenFacility?.dbId ?? null,
      });
      // Mock facility approval after 3 seconds + confirmation email.
      if (createdInterview?.interview_id && chosenFacility) {
        setTimeout(() => {
          void interviewsApi.facilityApprove(createdInterview.interview_id).catch(() => {
            /* mock approval endpoint — safe to ignore when unreachable */
          });
        }, 3000);
      }
      if (src?.email) {
        toast.success(`Interview invitation email sent to ${src.email}`);
      }
    } catch (e) {
      if (e instanceof Error && /already has a booked interview/i.test(e.message)) {
        toast.error(e.message);
      } else {
        console.warn("Could not persist interview to database API or dispatch email:", e);
        toast.error(
          `The interview could not be saved to the database. ${
            e instanceof Error ? e.message : ""
          }`,
        );
      }
    }
    setBookingFocus(false);
  };

  /** Downloads a printable interview evaluation form for an applicant. */
  const downloadEvaluationForm = (a: Applicant) => {
    const saved = assessments.find((x) => x.applicantId === a.id);
    const scores = saved?.scores ?? evalScores;
    const lines = [
      "INTERVIEW EVALUATION FORM",
      "==========================",
      `Applicant   : ${a.name}`,
      `Position    : ${a.position}`,
      `Applicant ID: ${a.id}`,
      `Date        : ${saved?.date ?? isoOf(new Date())}`,
      "",
      "CRITERIA (score / 5)",
      ...assessmentCriteria.map((c) => `- ${c}: ${scores[c] ?? "____"} / 5`),
      "",
      `Total score : ${
        saved?.total ??
        Math.round(
          (assessmentCriteria.reduce((t, c) => t + (scores[c] ?? 4), 0) /
            (assessmentCriteria.length * 5)) *
            100,
        )
      }%`,
      `Outcome     : ${saved?.outcome ?? "Pending"}`,
      "",
      "Remarks:",
      saved?.remarks ?? (evalRemarks || "________________________________________"),
      "",
      "Interviewer signature: ____________________    Date: ____________",
    ];
    downloadTextFile(`evaluation-form-${a.id}.txt`, lines.join("\n"));
    toast.success("Evaluation form downloaded");
  };

  /** Downloads the AI resume screening result for an applicant. */
  const downloadScreeningResult = (a: Applicant) => {
    const lines = [
      "APPLICANT RESUME SCREENING RESULT",
      "=================================",
      `Applicant : ${a.name}`,
      `Email     : ${a.email}`,
      `Phone     : ${a.phone}`,
      `Position  : ${a.position} (${a.jobId})`,
      `Applied   : ${a.appliedAt}`,
      `Source    : ${a.source}`,
      `Stage     : ${a.stage}`,
      `Match     : ${a.score}% — ${statusMeta[a.status].label}`,
      "",
      "EXTRACTED DETAILS",
      ...a.entities.map((e) => `- ${e.label}: ${e.value}`),
      "",
      "CRITERIA BREAKDOWN",
      ...a.breakdown.map((b) => `- ${b.criterion}: ${b.score}%`),
      "",
      "FLAGS",
      ...(a.flags.length ? a.flags.map((f) => `- ${f}`) : ["- None"]),
      "",
      "SUMMARY",
      a.summary,
    ];
    downloadTextFile(`screening-result-${a.id}.txt`, lines.join("\n"));
    toast.success("Screening result downloaded");
  };

  /** Marks an interview as Cancelled (the record is kept and labelled) after
   *  the user confirms in the modal. The applicant returns to the "Screened"
   *  stage so they can be re-booked; the database record is updated too. */
  const performCancelInterview = async () => {
    const i = cancelInterview;
    if (!i) return;
    // Only a truly-done interview (assessment recorded) is uncancellable.
    // A stale "Completed" without an assessment is still an open booking.
    if (i.status === "Completed" && assessments.some((x) => x.name === i.applicant)) {
      toast.error("Completed interviews can no longer be cancelled.");
      setCancelInterview(null);
      return;
    }
    // Keep the record, but flag it as Cancelled so it stays visible in the
    // calendar with its label.
    setInterviews((prev) => prev.map((x) => (x.id === i.id ? { ...x, status: "Cancelled" } : x)));
    const src = rows.find((a) => a.name === i.applicant);
    if (src) setStage(src.id, "Screened");
    addAudit({
      actionType: "Interview Cancelled",
      target: i.applicant,
      module: "Interview Scheduling",
      details: `Interview on ${i.date} — ${i.time} cancelled.`,
    });
    setCancelInterview(null);
    toast(`Interview cancelled — ${i.applicant}`, {
      description: "The record is kept and labelled as Cancelled.",
    });

    try {
      if (i.dbId) await interviewsApi.update(i.dbId, { status: "Cancelled" });
    } catch (e) {
      console.warn("Could not mark the interview as cancelled on the database API:", e);
    }
  };

  const reject = async (a: Applicant) => {
    if (isActionLocked(a)) return;
    setStage(a.id, "Rejected");
    addAudit({
      actionType: "Applicant Rejected",
      target: a.name,
      module: "Screening",
      details: `Applicant rejected at ${a.stage} stage for ${a.position}.`,
    });

    try {
      if (a.dbId) {
        await applicantsApi.update(a.dbId, { stage: "Rejected" });
        toast.success(`Regret letter email sent to ${a.email}`);
      } else {
        toast(`${a.name} marked as rejected`);
      }
    } catch (e) {
      console.warn("Could not update applicant stage or send regret email:", e);
      toast.info(`${a.name} marked as rejected`);
    }
  };

  /** Reports a stage the API refused to save, showing the server's own message.
   *  The dialog stays open so the recorded scoring is not lost. */
  const reportStageSaveFailure = (stageLabel: string, e: unknown) => {
    console.warn(`Could not persist ${stageLabel} to database API:`, e);
    toast.error(
      e instanceof Error && e.message
        ? `${stageLabel} was NOT saved — ${e.message}`
        : `${stageLabel} was NOT saved. Please try again.`,
    );
  };

  /** Queues a confirmation prompt for a committing action (Passed / Failed /
   *  Save / Recommend / Reject) so the decision is never applied on a single
   *  stray click. The action runs only when the user confirms. */
  const askConfirm = (opts: {
    title: string;
    description: string;
    confirmLabel: string;
    destructive?: boolean;
    onConfirm: () => void | Promise<void>;
  }) => setPendingConfirm(opts);

  /** Persists an interview to the database API and advances the applicant.
   *  The assessor verdict (Passed / Failed) comes from the Assessor Verdict
   *  buttons in the Interview dialog footer. */
  const saveAssessment = async (verdict?: PassFail) => {
    if (!evaluating) return;
    // The interviewer who conducts/records this interview — required.
    if (!evalAssessor) {
      toast.error("Select the interviewer before saving the interview.");
      return;
    }
    const total = Math.round(
      (assessmentCriteria.reduce((t, c) => t + (evalScores[c] ?? 4), 0) /
        (assessmentCriteria.length * 5)) *
        100,
    );
    const outcome = total >= 80 ? "Recommended" : total >= 65 ? "Hold" : "Not Recommended";
    // The assessor's explicit Passed / Failed verdict for this process stage.
    const result: PassFail = verdict ?? evalResult ?? (total >= 65 ? "Passed" : "Failed");
    setEvalResult(result);
    // Verdict time (stamped on the interview record) and the booking being closed.
    const now = new Date();
    const nowHour = now.getHours();
    const stampedTime = `${String(nowHour % 12 === 0 ? 12 : nowHour % 12).padStart(2, "0")}:${String(
      now.getMinutes(),
    ).padStart(2, "0")} ${nowHour >= 12 ? "PM" : "AM"}`;
    const completedInterview = interviews.find((i) => i.applicant === evaluating.name);

    // Persist FIRST: a refused save must never be reported as saved.
    if (evaluating.dbId) {
      try {
        const datePart = evalDateTime.slice(0, 10) || isoOf(new Date());
        await applicantsApi.createAssessment(evaluating.dbId, {
          applicant_id: evaluating.dbId,
          assessor_user_id: evalAssessor ? Number(evalAssessor) : null,
          assessment_date: datePart,
          scores_json: evalScores,
          comments_json: evalComments,
          total_score: total,
          outcome,
          result,
          remarks: evalRemarks || "No overall evaluation recorded.",
        });
        // Secondary stage sync — the assessment row is already saved and the
        // backend advances the stage in the same request, so a refusal here
        // must not make the recorded interview look like it was lost.
        await applicantsApi
          .update(evaluating.dbId, { stage: "Assessed" })
          .catch((e) => console.warn("Stage sync deferred for interview assessment:", e));
        // Persist the verdict time on the interview record as well.
        if (completedInterview?.dbId) {
          await interviewsApi
            .update(completedInterview.dbId, {
              status: "Completed",
              scheduled_time: `${String(now.getHours()).padStart(2, "0")}:${String(
                now.getMinutes(),
              ).padStart(2, "0")}`,
            })
            .catch(() => undefined);
        }
      } catch (e) {
        reportStageSaveFailure("Interview assessment", e);
        return;
      }
    }

    setAssessments((prev) => [
      {
        applicantId: evaluating.id,
        ...(evaluating.dbId !== undefined ? { dbId: evaluating.dbId } : {}),
        name: evaluating.name,
        position: evaluating.position,
        scores: evalScores,
        comments: evalComments,
        total,
        remarks: evalRemarks || "No overall evaluation recorded.",
        date: isoOf(new Date()),
        outcome,
        result,
      },
      ...prev,
    ]);
    setStage(evaluating.id, "Assessed");
    setInterviews((prev) =>
      prev.map((i) =>
        i.applicant === evaluating.name
          ? { ...i, time: stampedTime, status: "Completed" as Interview["status"] }
          : i,
      ),
    );
    addAudit({
      actionType: "Assessment Completed",
      target: evaluating.name,
      module: "Applicant Management",
      details: `Interview saved with a total score of ${total}% — verdict ${result}.`,
    });
    setEvaluating(null);
    toast.success(`Interview saved — ${total}% (${result})`);
    // Re-read the saved records so the progress bar reflects them at once.
    syncAfterStageChange();
  };

  const openRefer = (a: Applicant) => {
    if (isActionLocked(a)) return;
    setReferring(a);
    // Prefill with the strongest resume-screening match against each open job
    // post's requirement entities; fall back to the NLP "Stronger match" flag.
    const openPositions = positions.filter(
      (p) =>
        normalizeMatchText(p.title) !== normalizeMatchText(a.position) && p.filled < p.headcount,
    );
    const best = [...openPositions]
      .map((p) => ({
        title: p.title,
        fit: referralMatch(
          a,
          dbJobPosts.find((j) => j.title === p.title),
        ),
      }))
      .sort((x, y) => y.fit.score - x.fit.score)[0];
    if (best && best.fit.total > 0 && best.fit.score > 0) {
      setReferTarget(best.title);
      return;
    }
    const suggested = a.flags.find((f) => f.startsWith("Stronger match:"));
    setReferTarget(suggested ? suggested.replace("Stronger match:", "").split("(")[0]!.trim() : "");
  };

  /** Opens the Assessment Test runner pre-filled for the candidate's position. */
  const openAssessmentTest = (a: Applicant) => {
    const questionSet = getMockAssessmentQuestions(a.position);
    setTestingTest(a);
    setTestTitle(`${a.position} — Job Knowledge Test`);
    // Defaults to the logged-in staff member processing the test.
    setTestAssessor(loggedInAssessorId);
    setTestDate(isoOf(new Date()));
    setTestQuestionSet(questionSet);
    setTestQuestions(
      questionSet.map((q) => ({
        question: `${q.title} — ${q.scenario}`,
        points: q.points,
      })),
    );
    setTestScores({});
    setTestPassing(75);
    setTestRemarks("");
    setTestStep(0);
    setTestAnswers({});
    setTestTimeLeft(MOCK_TEST_DURATION_SECONDS);
    testAutoSubmitted.current = false;
  };

  /** Selects an option for a mock test question and auto-scores it. */
  const selectTestOption = (qIdx: number, optIdx: number) => {
    const mock = testQuestionSet[qIdx];
    if (!mock) return;
    setTestAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
    setTestScores((prev) => ({
      ...prev,
      [String(qIdx)]: optIdx === mock.correctIndex ? mock.points : 0,
    }));
  };

  const clearTestAnswer = (qIdx: number) => {
    setTestAnswers((prev) => {
      const next = { ...prev };
      delete next[qIdx];
      return next;
    });
    setTestScores((prev) => {
      const next = { ...prev };
      delete next[String(qIdx)];
      return next;
    });
  };

  const closeAssessmentTest = () => {
    setTestingTest(null);
    setTestStep(0);
    setTestAnswers({});
    setTestTimeLeft(MOCK_TEST_DURATION_SECONDS);
    testAutoSubmitted.current = false;
  };

  /** Copies text with a legacy fallback for non-secure contexts where the
   *  async clipboard API is unavailable. */
  const copyTextToClipboard = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        return ok;
      } catch {
        return false;
      }
    }
  };

  /** Generates a single-use secure test link the APPLICANT opens on their own
   *  device to answer the assessment test (the staff runner above stays for
   *  supervised sessions) and copies it to the clipboard. The link needs no
   *  login and expires in 7 days; scoring happens server-side on submit. */
  const copyApplicantTestLink = async (a: Applicant) => {
    if (!a.dbId) {
      toast.error("Sync the applicant record first — the test link needs a saved applicant.");
      return;
    }
    setInviteBusyId(a.id);
    try {
      const bank = getMockAssessmentQuestions(a.position);
      const invite = await assessmentInvitesApi.create(a.dbId, {
        test_title: `${a.position} — Job Knowledge Test`,
        questions_json: bank.map((q) => ({
          title: q.title,
          scenario: q.scenario,
          options: q.options,
          correctIndex: q.correctIndex,
          points: q.points,
        })),
        passing_score: 75,
      });
      const url = `${window.location.origin}/assessment-test/${invite.token}`;
      const copied = await copyTextToClipboard(url);
      toast.success(copied ? "Applicant test link copied" : "Applicant test link generated", {
        description: url,
      });
      addAudit({
        actionType: "Assessment Test Link Generated",
        target: a.name,
        module: "Applicant Management",
        details: `Generated a secure assessment test link for ${a.name} (${a.position}).`,
      });
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Could not generate the applicant test link.",
      );
    } finally {
      setInviteBusyId(null);
    }
  };

  /** Persists an assessment test (auto-checked score result) and advances the applicant. */
  const saveAssessmentTest = async (force = false) => {
    if (!testingTest) return;
    const questionSet = testQuestionSet;
    const unanswered = questionSet.filter((_, idx) => testAnswers[idx] == null);
    if (unanswered.length > 0 && !force) {
      toast.error(`Answer all questions first (${unanswered.length} remaining).`);
      return;
    }
    const cleaned = questionSet.map((q) => ({
      question: `${q.title} — ${q.scenario}`,
      points: q.points,
    }));
    const correctCount = questionSet.filter((q, idx) => testAnswers[idx] === q.correctIndex).length;
    const maxTotal = cleaned.reduce((t, q) => t + (q.points || 0), 0);
    const earned = cleaned.reduce((t, q, idx) => t + (testScores[String(idx)] ?? 0), 0);
    const total = maxTotal > 0 ? Math.round((earned / maxTotal) * 100) : 0;
    const result: PassFail = total >= testPassing ? "Passed" : "Failed";
    const autoRemarks = `Auto-checked: ${correctCount}/${questionSet.length} correct.`;
    const row: AssessmentTestRow = {
      id: `AST-${Date.now()}`,
      applicantId: testingTest.id,
      name: testingTest.name,
      position: testingTest.position,
      title: testTitle.trim() || `${testingTest.position} — Job Knowledge Test`,
      questions: cleaned,
      scores: Object.fromEntries(
        cleaned.map((_, idx) => [String(idx), testScores[String(idx)] ?? 0]),
      ),
      total,
      passing: testPassing,
      result,
      date: testDate,
      remarks: autoRemarks,
    };
    // Persist FIRST: a refused save must never be reported as saved.
    if (testingTest.dbId) {
      try {
        await assessmentTestsApi.create(testingTest.dbId, {
          assessor_user_id: testAssessor ? Number(testAssessor) : null,
          test_title: row.title,
          questions_json: cleaned,
          scores_json: row.scores,
          total_score: total,
          passing_score: testPassing,
          result,
          test_date: testDate,
          remarks: autoRemarks,
        });
      } catch (e) {
        reportStageSaveFailure("Assessment test", e);
        return;
      }
      // Secondary stage sync — the test row is already saved and the backend
      // advances the stage in the same request, so a refusal here must not
      // make the recorded test look like it was lost.
      await applicantsApi
        .update(testingTest.dbId, { stage: "Assessment Test" })
        .catch((e) => console.warn("Stage sync deferred for assessment test:", e));
    }

    setAssessmentTests((prev) => [row, ...prev]);
    setTestAnswerMap((prev) => ({ ...prev, [row.id]: { ...testAnswers } }));
    setStage(testingTest.id, "Assessment Test");
    addAudit({
      actionType: "Assessment Test Recorded",
      target: testingTest.name,
      module: "Applicant Management",
      details: `Assessment test "${row.title}" auto-checked — ${correctCount}/${questionSet.length} correct, score ${total}% (passing ${testPassing}%), result ${result}.`,
    });
    toast.success(`Assessment test auto-checked — ${total}% (${result})`);
    closeAssessmentTest();
    // Re-read the saved records so the progress bar reflects them at once.
    syncAfterStageChange();
  };

  /* Countdown for the mock test runner — auto-checks (force submits) on timeout. */
  useEffect(() => {
    if (!testingTest) return;
    if (testTimeLeft <= 0) {
      if (!testAutoSubmitted.current) {
        testAutoSubmitted.current = true;
        toast.info("Time is up — auto-checking the assessment test.");
        void saveAssessmentTest(true);
      }
      return;
    }
    const timer = window.setTimeout(() => setTestTimeLeft((t) => t - 1), 1000);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testingTest, testTimeLeft]);

  /* Number-key shortcuts (1–4) select the visible question's option. */
  useEffect(() => {
    if (!testingTest) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= "1" && e.key <= "4") {
        const opt = Number(e.key) - 1;
        const mock = testQuestionSet[testStep];
        if (mock && mock.options[opt] !== undefined) selectTestOption(testStep, opt);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testingTest, testStep, testQuestionSet]);

  /** Opens the Practical Assessment dialog for a designated position. */
  const openPractical = (a: Applicant) => {
    setTestingPractical(a);
    setPracticalTask(`${a.position} — Practical Demonstration`);
    setPracticalDate(isoOf(new Date()));
    // Defaults to the logged-in staff member conducting the practical exam.
    setPracticalAssessor(loggedInAssessorId);
    setPracticalCriteria(DEFAULT_PRACTICAL_CRITERIA.map((c) => ({ ...c })));
    // Default each criterion to a 4 / 5 rating — mirrors the Interview dialog.
    setPracticalScores(
      Object.fromEntries(DEFAULT_PRACTICAL_CRITERIA.map((_, idx) => [String(idx), 4])),
    );
    setPracticalComments({});
    setPracticalRemarks("");
  };

  /** Persists a practical assessment with the assessor's explicit Passed/Failed
   *  verdict (Assessor Verdict buttons) and advances the applicant.
   *
   *  The record is written to the database FIRST: the dialog only closes with a
   *  success toast once the API accepted it. When the API refuses (the position
   *  does not take a practical, or the assessment test is not recorded/passed
   *  yet) the reason is shown and the dialog stays open so the scoring is not
   *  lost — previously the failure was only logged to the console, which looked
   *  like the assessment was saved while nothing was persisted. */
  const savePractical = async (verdict: PassFail) => {
    if (!testingPractical) return;
    if (!practicalTask.trim()) {
      toast.error("Enter the practical task title.");
      return;
    }
    // The person who conducts the hands-on exam must be recorded — required.
    if (!practicalAssessor) {
      toast.error(
        "Select the Practical Assessment Assessor before recording the practical assessment.",
      );
      return;
    }
    const maxTotal = practicalCriteria.reduce((t, c) => t + (c.maxPoints || 0), 0);
    const earned = practicalCriteria.reduce(
      (t, c, idx) => t + (practicalScores[String(idx)] ?? 0),
      0,
    );
    // Rate is on the same 1-5 scale as the interview — percentage of the
    // maximum (criteria count × 5).
    const total = maxTotal > 0 ? Math.round((earned / (practicalCriteria.length * 5)) * 100) : 0;
    // The assessor's explicit Passed / Failed verdict for this process stage.
    const result: PassFail = verdict;
    const row: PracticalTestRow = {
      id: `PRT-${Date.now()}`,
      applicantId: testingPractical.id,
      name: testingPractical.name,
      position: testingPractical.position,
      taskTitle: practicalTask.trim(),
      criteria: practicalCriteria.map((c, idx) => ({
        ...c,
        comment: practicalComments[String(idx)] || null,
      })),
      scores: Object.fromEntries(
        practicalCriteria.map((_, idx) => [String(idx), practicalScores[String(idx)] ?? 0]),
      ),
      total,
      result,
      date: practicalDate,
      remarks: practicalRemarks,
    };

    if (testingPractical.dbId) {
      try {
        await practicalTestsApi.create(testingPractical.dbId, {
          assessor_user_id: practicalAssessor ? Number(practicalAssessor) : null,
          task_title: row.taskTitle,
          criteria_json: practicalCriteria.map((c, idx) => ({
            criterion: c.criterion,
            max_points: c.maxPoints,
            comment: practicalComments[String(idx)] || null,
          })),
          scores_json: row.scores,
          total_score: total,
          result,
          test_date: practicalDate,
          remarks: practicalRemarks || null,
        });
      } catch (e) {
        reportStageSaveFailure("Practical assessment", e);
        return;
      }
      // Secondary stage sync — the practical row is already saved and the
      // backend advances the stage in the same request, so a refusal here must
      // not make the recorded assessment look like it was lost.
      await applicantsApi
        .update(testingPractical.dbId, { stage: "Practical Test" })
        .catch((e) => console.warn("Stage sync deferred for practical assessment:", e));
    }

    setPracticalTests((prev) => [row, ...prev]);
    setStage(testingPractical.id, "Practical Test");
    addAudit({
      actionType: "Practical Assessment Recorded",
      target: testingPractical.name,
      module: "Applicant Management",
      details: `Practical assessment "${row.taskTitle}" recorded — score ${total}%, verdict ${result}.`,
    });
    toast.success(`Practical assessment recorded — ${total}% (${result})`);
    setTestingPractical(null);
    // Re-read the saved records so the progress bar reflects them at once.
    syncAfterStageChange();
  };

  /** Snapshot of every process stage for the final evaluation preview. */
  const finalSnapshotFor = (a: Applicant) => {
    const test = assessmentTests.find((t) => t.applicantId === a.id);
    const practical = practicalTests.find((t) => t.applicantId === a.id);
    const assessment = assessments.find((x) => x.applicantId === a.id);
    const practicalRequired = requiresPractical(a.position, a.requiresPractical);
    return {
      screeningScore: a.score,
      screeningStatus: statusMeta[a.status].label,
      interviewScore: assessment?.total ?? null,
      interviewResult: assessment?.result ?? null,
      testScore: test?.total ?? null,
      testResult: test?.result ?? null,
      practicalRequired,
      practicalScore: practical?.total ?? null,
      practicalResult: practical?.result ?? null,
    };
  };

  /** Opens the Final Evaluation dialog for a candidate who completed the pipeline.
   *  Fetches the backend preview (system scores + overall) — the dialog
   *  displays it read-only; HR only picks the recommendation. */
  const openFinalEvaluation = (a: Applicant) => {
    setFinalizing(a);
    // Defaults to the logged-in staff member signing off the final decision.
    setFinalAssessor(loggedInAssessorId);
    setFinalDate(isoOf(new Date()));
    setFinalRemarks("");
    setFinalChoice(null);
    setFinalAltJobPostId("");
    setShowScoreBreakdown(false);
    setFinalPreview(null);
    if (a.dbId) {
      setFinalPreviewLoading(true);
      finalEvaluationsApi
        .preview(a.dbId)
        .then((p) => setFinalPreview(p))
        .catch((e) => console.warn("Could not load final evaluation preview:", e))
        .finally(() => setFinalPreviewLoading(false));
    }
  };

  /** Persists the final evaluation with the whole-process verdict. The
   *  recommendation comes from the HR-selected radio choice in the dialog
   *  (Recommended for Hire / For Another Position / Not Recommended).
   *  Scores are NEVER sent — the backend recalculates authoritatively. */
  const saveFinalEvaluation = async (recommendation: FinalRecommendation) => {
    if (!finalizing) return;
    // Whoever signs off the final decision must be recorded — required.
    if (!finalAssessor) {
      toast.error("Select who evaluated this candidate before saving the final evaluation.");
      return;
    }
    if (recommendation === "For Another Position" && !finalAltJobPostId) {
      toast.error("Select one alternative position for this candidate.");
      return;
    }
    if (recommendation === "Not Recommended" && !finalRemarks.trim()) {
      toast.error("Evaluator remarks are required when the candidate is Not Recommended.");
      return;
    }
    const snap = finalSnapshotFor(finalizing);
    const previewOverall = finalPreview?.overall_score_rounded ?? finalPreview?.overall_score ?? null;
    const row: FinalEvaluationRow = {
      id: `FIN-${Date.now()}`,
      applicantId: finalizing.id,
      name: finalizing.name,
      position: finalizing.position,
      screeningScore: finalPreview?.scores.screening_score ?? snap.screeningScore,
      screeningStatus: finalPreview?.scores.screening_status ?? snap.screeningStatus,
      interviewScore: finalPreview?.scores.interview_score ?? snap.interviewScore,
      interviewResult: (finalPreview?.scores.interview_result as PassFail | null) ?? snap.interviewResult,
      assessmentTestScore: finalPreview?.scores.assessment_test_score ?? snap.testScore,
      assessmentTestResult: (finalPreview?.scores.assessment_test_result as PassFail | null) ?? snap.testResult,
      practicalRequired: finalPreview?.practical_required ?? snap.practicalRequired,
      practicalTestScore: finalPreview ? finalPreview.scores.practical_test_score : snap.practicalScore,
      practicalTestResult: finalPreview
        ? (finalPreview.scores.practical_test_result as PassFail | null)
        : snap.practicalResult,
      overallScore: finalPreview?.overall_score ?? previewOverall,
      overallScoreRounded: previewOverall,
      scoreBreakdown: (finalPreview?.score_breakdown as FinalScoreBreakdownItem[] | undefined) ?? null,
      recommendation,
      recommendedJobPostId: finalAltJobPostId ? Number(finalAltJobPostId) : null,
      recommendedPositionTitle:
        dbJobPosts.find((j: any) => String(j.job_post_id) === String(finalAltJobPostId))?.title ?? null,
      overallRemarks: finalRemarks,
      date: finalDate,
      evaluatedBy:
        assessors.find((u) => String(u.system_user_id) === String(finalAssessor))?.full_name ??
        null,
      evaluatedById: finalAssessor ? Number(finalAssessor) : null,
    };
    // Persist FIRST: a refused save must never be reported as saved.
    if (finalizing.dbId) {
      try {
        const saved = await finalEvaluationsApi.create(finalizing.dbId, {
          evaluated_by_user_id: finalAssessor ? Number(finalAssessor) : null,
          evaluation_date: finalDate,
          recommendation,
          overall_remarks: finalRemarks || null,
          ...(recommendation === "For Another Position" && finalAltJobPostId
            ? { recommended_job_post_id: Number(finalAltJobPostId) }
            : {}),
        });
        const mapped = transformApiFinalEvaluation(saved);
        row.overallScore = mapped.overallScore ?? row.overallScore;
        row.overallScoreRounded = mapped.overallScoreRounded ?? row.overallScoreRounded;
        row.scoreBreakdown = mapped.scoreBreakdown ?? row.scoreBreakdown;
        row.recommendedJobPostId = mapped.recommendedJobPostId ?? row.recommendedJobPostId;
        row.recommendedPositionTitle = mapped.recommendedPositionTitle ?? row.recommendedPositionTitle;
      } catch (e) {
        reportStageSaveFailure("Final evaluation", e);
        return;
      }
      // Secondary stage sync — the evaluation row is already saved and the
      // backend advances the stage in the same request, so a refusal here must
      // not make the recorded evaluation look like it was lost.
      await applicantsApi
        .update(finalizing.dbId, { stage: "Final Evaluation" })
        .catch((e) => console.warn("Stage sync deferred for final evaluation:", e));
    }

    setFinalEvaluations((prev) => [row, ...prev]);
    setStage(finalizing.id, "Final Evaluation");
    addAudit({
      actionType: "Final Evaluation Completed",
      target: finalizing.name,
      module: "Applicant Management",
      details: `Final evaluation completed for ${finalizing.name} — Overall ${
        row.overallScoreRounded ?? "n/a"
      }% (system calculated) — recommendation: ${recommendation}.`,
    });
    toast.success(`Final evaluation completed — ${recommendation}`);
    setFinalizing(null);
    setFinalPreview(null);
    setFinalChoice(null);
    setFinalAltJobPostId("");
    // Re-read the saved records — the completed final evaluation turns every
    // applicable stage on the progress bar green.
    syncAfterStageChange();
  };

  /** Presented result of every recruitment stage, rendered inline in the Final
   *  Evaluation and Verify Candidate Decision dialogs — the stage view modals
   *  (resume screening result, interview assessment, assessment test and
   *  practical assessment when required) are shown together here instead of
   *  behind separate View buttons. */
  const stageResultBlocks = (info: {
    applicantId: string;
    screeningScore: number | null;
    screeningStatus: string | null;
    practicalRequired: boolean;
  }) => {
    const applicant = rows.find((a) => a.id === info.applicantId);
    const interview = assessments.find((x) => x.applicantId === info.applicantId);
    const test = assessmentTests.find((x) => x.applicantId === info.applicantId);
    const practical = practicalTests.find((x) => x.applicantId === info.applicantId);
    const blockClass = "h-full space-y-2 rounded-md border border-border px-3 py-2.5";
    const resultBadgeClass = (r: PassFail | null | undefined) =>
      r === "Passed"
        ? "border-success/40 bg-success/10 text-success"
        : "border-destructive/40 bg-destructive/10 text-destructive";
    return (
      <div className="space-y-2">
        <p className="eyebrow">Recruitment process results</p>

        {/* Stage results laid out horizontally with aligned heights —
            screening, interview, test and practical side by side (4 columns
            when the position requires a practical, 3 otherwise). */}
        <div
          className={
            "grid gap-2 md:items-stretch " +
            (info.practicalRequired ? "md:grid-cols-4" : "md:grid-cols-3")
          }
        >
          {/* Resume screening result */}
          <div className={blockClass}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">Resume Screening</p>
              <span className="font-display text-lg font-semibold text-primary">
                {info.screeningScore != null ? `${Math.round(info.screeningScore)}%` : "—"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {info.screeningStatus ?? "—"}
              {applicant?.summary ? ` — ${applicant.summary}` : ""}
            </p>
          </div>

          {/* Interview assessment result */}
          <div className={blockClass}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">Interview Assessment</p>
              {interview ? (
                <div className="flex items-center gap-2">
                  <span className="font-display text-lg font-semibold text-primary">
                    {interview.total}%
                  </span>
                  <Badge variant="outline" className={resultBadgeClass(interview.result)}>
                    {interview.result}
                  </Badge>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">No interview recorded.</span>
              )}
            </div>
            {interview && (
              <>
                <div className="overflow-hidden rounded-md border border-border">
                  <div className="grid grid-cols-[1fr_64px_1fr] gap-2 border-b border-border bg-muted/40 px-3 py-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Category
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Rate
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Comments
                    </span>
                  </div>
                  {assessmentCriteria.map((c, idx) => (
                    <div
                      key={c}
                      className={
                        "grid grid-cols-[1fr_64px_1fr] gap-2 px-3 py-1.5" +
                        (idx > 0 ? " border-t border-border" : "")
                      }
                    >
                      <span className="min-w-0 text-xs font-medium">{c}</span>
                      <span className="text-xs text-muted-foreground">
                        {interview.scores[c] ?? "—"}/5
                      </span>
                      <span className="min-w-0 break-words text-xs text-muted-foreground">
                        {interview.comments?.[c] || "—"}
                      </span>
                    </div>
                  ))}
                </div>
                {interview.remarks && (
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Overall evaluation:</span> {interview.remarks}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Assessment test result */}
          <div className={blockClass}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">Assessment Test</p>
              {test ? (
                <div className="flex items-center gap-2">
                  <span className="font-display text-lg font-semibold text-primary">
                    {test.total}%
                  </span>
                  <Badge variant="outline" className={resultBadgeClass(test.result)}>
                    {test.result}
                  </Badge>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">No assessment test recorded.</span>
              )}
            </div>
            {test && (
              <>
                <p className="text-xs text-muted-foreground">
                  {test.title} — passing score {test.passing}%
                </p>
                {test.remarks && (
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Remarks:</span> {test.remarks}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Practical assessment result (only when the position requires it) */}
          {info.practicalRequired && (
            <div className={blockClass}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium">Practical Assessment</p>
                {practical ? (
                  <div className="flex items-center gap-2">
                    <span className="font-display text-lg font-semibold text-primary">
                      {practical.total}%
                    </span>
                    <Badge variant="outline" className={resultBadgeClass(practical.result)}>
                      {practical.result}
                    </Badge>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    No practical assessment recorded.
                  </span>
                )}
              </div>
              {practical && (
                <>
                  <div className="overflow-hidden rounded-md border border-border">
                    {practical.criteria.map((c, idx) => (
                      <div
                        key={idx}
                        className={
                          "flex items-center justify-between gap-3 px-3 py-1.5" +
                          (idx > 0 ? " border-t border-border" : "")
                        }
                      >
                        <span className="min-w-0 flex-1 truncate text-xs font-medium">
                          {c.criterion}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {practical.scores[String(idx)] ?? 0} / {c.maxPoints}
                        </span>
                      </div>
                    ))}
                  </div>
                  {practical.remarks && (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Overall evaluation:</span> {practical.remarks}
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  /** Moves the applicant to another vacancy — locally AND on the database
   *  (job post reassignment + stage reset), so it survives a refresh. */
  const confirmRefer = async (targetTitle: string) => {
    const applicant = referring;
    if (!applicant) return;
    setRows((prev) =>
      prev.map((x) =>
        x.id === applicant.id
          ? {
              ...x,
              position: targetTitle,
              status: "fit",
              stage: "Screened",
            }
          : x,
      ),
    );
    addAudit({
      actionType: "Applicant Transferred",
      target: applicant.name,
      module: "Screening",
      details: `Transferred from ${applicant.position} to ${targetTitle}.`,
    });
    toast.success(`${applicant.name} referred to ${targetTitle}`);
    setReferring(null);
    closeReview();

    try {
      if (applicant.dbId) {
        let jobPostId: number | undefined;
        try {
          const res = await jobPostsApi.list({ per_page: 100 });
          jobPostId = res?.data?.find((j) => j.title === targetTitle)?.job_post_id;
        } catch {
          // target vacancy lookup failed — still persist stage/status below
        }
        await applicantsApi.update(applicant.dbId, {
          job_post_id: jobPostId,
          stage: "Screened",
          status: "fit",
          flags_json: [...(applicant.flags ?? []), `Referred to ${targetTitle}`],
        });
        if (applicant.email) {
          toast.success(`Job offer email sent to ${applicant.email}`);
        }
      }
    } catch (e) {
      console.warn("Could not persist referral or send offer email:", e);
      toast.error("The referral could not be saved to the database.");
    }
  };

  /** Book an Interview — every dropdown/field must be filled before the
   *  "Request Facility to Scheduled" button is enabled. */
  const bookingMissingFields = [
    !schedule.applicant && "Select Applicant",
    !schedule.date && "Interview Date",
    !schedule.time && "Time Slot",
    !schedule.interviewer && "Interviewer",
    !(schedule.facilityId && schedule.facilityId !== "none") && "Request Facility",
  ].filter(Boolean) as string[];

  const monthCells = useMemo(() => {
    const first = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
    const start = new Date(first);
    start.setDate(first.getDate() - first.getDay());
    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return { date, inMonth: date.getMonth() === viewMonth.getMonth() };
    });
  }, [viewMonth]);

  /** Month grid for the full calendar view (same 6x7 layout, own month state). */
  const calViewCells = useMemo(() => {
    const first = new Date(calViewMonth.getFullYear(), calViewMonth.getMonth(), 1);
    const start = new Date(first);
    start.setDate(first.getDate() - first.getDay());
    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return { date, inMonth: date.getMonth() === calViewMonth.getMonth() };
    });
  }, [calViewMonth]);

  /** Non-cancelled interviews on the full-calendar selected date. */
  const calViewDayInterviews = useMemo(
    () => interviews.filter((i) => i.date === calViewDate && i.status !== "Cancelled"),
    [interviews, calViewDate],
  );

  const dailySchedule = useMemo(
    () =>
      buildSlotSchedule(
        slotSettings.startTime,
        slotSettings.intervalMinutes,
        slotSettings.slotCount,
        slotSettings.breakEnabled,
        slotSettings.breakStart,
        slotSettings.breakEnd,
      ),
    [
      slotSettings.startTime,
      slotSettings.intervalMinutes,
      slotSettings.slotCount,
      slotSettings.breakEnabled,
      slotSettings.breakStart,
      slotSettings.breakEnd,
    ],
  );

  /** Bookable slot labels — excludes any slot that overlaps the configured break window. */
  const slotsForSelected = useMemo(
    () => dailySchedule.filter((s) => !s.isBreak).map((s) => s.label),
    [dailySchedule],
  );

  /** Schedule preview for the full-calendar selected room/meeting + date.
   *  Supports "all" to show every interview booked on the selected date. */
  const calViewPreview = useMemo(() => {
    const showAll = calViewFacilityId === "all";
    const room = showAll
      ? {
          ...facilities[0]!,
          name: "All rooms",
          location: "All locations",
          type: "On-site" as const,
        }
      : (facilities.find((f) => f.id === calViewFacilityId) ?? facilities[0]!);
    const slotIndex = (label: string) => {
      const idx = dailySchedule.findIndex((s) => s.label === label);
      return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
    };
    const mapped = (
      showAll
        ? [...calViewDayInterviews]
        : calViewDayInterviews.filter((i) => facilityOfInterview(i)?.id === room.id)
    ).sort((a, b) => slotIndex(a.time) - slotIndex(b.time));
    const rangeLabel = (label: string) => {
      const slot = dailySchedule.find((s) => s.label === label);
      return slot ? `${slot.label} — ${slot.endLabel}` : label;
    };
    const slotsAvailable = showAll
      ? Math.max(0, slotsForSelected.length * facilities.length - mapped.length)
      : Math.max(0, slotsForSelected.length - mapped.length);
    const unassignedOnSite =
      showAll || room.type !== "On-site"
        ? []
        : calViewDayInterviews.filter((i) => i.mode === "On-site" && !facilityOfInterview(i));
    return { room, mapped, rangeLabel, slotsAvailable, unassignedOnSite, showAll };
  }, [calViewDayInterviews, calViewFacilityId, dailySchedule, slotsForSelected]);

  /** Maximum concurrent interviews per slot — limited by whichever is scarcer, interviewers or rooms. */
  const capacityPerSlot = Math.max(
    1,
    Math.min(
      slotSettings.capacityPerSlot,
      slotSettings.interviewersAvailable,
      slotSettings.roomsAvailable,
    ),
  );

  /** Interviews already booked for a given date + time slot. */
  const bookedInSlot = (date: string, time: string) =>
    interviews.filter((i) => i.date === date && i.time === time).length;

  /** True when the requested facility (room / meeting space) already holds a
   *  live interview in the same date + time slot. The interview currently being
   *  rescheduled is ignored so keeping its own slot is not a conflict. */
  const facilityBookedInSlot = (facilityId: string, date: string, time: string) => {
    if (!facilityId || facilityId === "none") return false;
    const facility = facilities.find((f) => f.id === facilityId);
    if (!facility) return false;
    return interviews.some(
      (i) =>
        i.date === date &&
        i.time === time &&
        i.status !== "Cancelled" &&
        i.id !== rescheduling?.id &&
        i.facilityName === facility.name,
    );
  };

  const readyToAssess = rows.filter(
    (a) =>
      a.stage === "Interview Scheduled" &&
      !assessments.some((x) => x.applicantId === a.id) &&
      // An interview that was cancelled must never leave the candidate in the
      // assessment queue — there must be a live (non-cancelled) booking.
      interviews.some((i) => i.applicant === a.name && i.status !== "Cancelled"),
  );

  type AssessmentRow =
    | {
        kind: "ready";
        a: Applicant;
        iv?: (typeof interviews)[number] | undefined;
      }
    | {
        kind: "completed";
        r: AssessmentResult;
        iv?: (typeof interviews)[number] | undefined;
      };

  const deptForPosition = (position: string) =>
    displayPositions.find((p) => p.title === position)?.department ?? "—";

  /** Outcome label for an interview row — a candidate rejected after the
   *  interview stays in the list, only labelled "Rejected". */
  const assessmentRowOutcome = (row: AssessmentRow): string => {
    if (row.kind === "ready") return "Ready for Interview";
    const src = rows.find((a) => a.id === row.r.applicantId);
    return src?.stage === "Rejected" ? "Rejected" : row.r.outcome;
  };

  const assessmentRowsAll: AssessmentRow[] = [
    ...(assessmentFilter !== "completed"
      ? readyToAssess
          .filter((a) => !isHiddenStage(a))
          .map((a) => ({
            kind: "ready" as const,
            a,
            iv: interviews.find((i) => i.applicant === a.name),
          }))
      : []),
    ...(assessmentFilter !== "ready"
      ? assessments
          .filter((r) => {
            const src = rows.find((a) => a.id === r.applicantId);
            if (!src) return true;
            // A candidate rejected after the assessment STAYS in the list
            // (labelled "Rejected"); the other past-decision stages don't.
            if (src.stage === "Rejected") return true;
            return !isHiddenStage(src) && !noLongerAssessable(src);
          })
          .map((r) => ({
            kind: "completed" as const,
            r,
            iv: interviews.find((i) => i.applicant === r.name),
          }))
      : []),
  ];

  const assessmentRows = assessmentRowsAll.filter((row) => {
    const name = row.kind === "ready" ? row.a.name : row.r.name;
    const position = row.kind === "ready" ? row.a.position : row.r.position;
    const dept = deptForPosition(position);
    const outcome = assessmentRowOutcome(row);
    const q = assessmentSearch.trim().toLowerCase();
    return (
      (!q || `${name} ${position} ${dept} ${outcome}`.toLowerCase().includes(q)) &&
      (assessmentDept === "all" || dept === assessmentDept) &&
      (assessmentOutcome === "all" || outcome === assessmentOutcome)
    );
  });

  const assessmentSort = useSort(assessmentRows, {
    name: (row) => (row.kind === "ready" ? row.a.name : row.r.name),
    position: (row) => (row.kind === "ready" ? row.a.position : row.r.position),
    department: (row) => deptForPosition(row.kind === "ready" ? row.a.position : row.r.position),
    score: (row) => (row.kind === "ready" ? row.a.score : row.r.total),
    status: (row) => assessmentRowOutcome(row),
    details: (row) =>
      row.kind === "ready"
        ? row.iv
          ? `Interviewed ${row.iv.date} — ${row.iv.time}`
          : "Interview not booked"
        : `Interviewed ${row.r.date} — ${row.r.remarks}`,
  });

  const auditFiltered = auditLog
    .filter((e) => (auditActionFilter === "all" ? true : e.actionType === auditActionFilter))
    .filter((e) => (auditDeptFilter === "all" ? true : e.actorDepartment === auditDeptFilter))
    .filter((e) => (auditActorFilter === "all" ? true : e.actorName === auditActorFilter))
    .filter((e) =>
      auditSearch
        ? `${e.actorName} ${e.target} ${e.actionType} ${e.module} ${e.details}`
            .toLowerCase()
            .includes(auditSearch.toLowerCase())
        : true,
    );

  const auditSort = useSort(auditFiltered, {
    timestamp: (e) => `${e.date} ${e.time}`,
    actorName: (e) => e.actorName,
    actorPosition: (e) => e.actorPosition,
    actorDepartment: (e) => e.actorDepartment,
    actionType: (e) => e.actionType,
    target: (e) => e.target,
    module: (e) => e.module,
    details: (e) => e.details,
  });

  /* --- Pipeline Overview: one row per applicant —
     Interview (schedule + result) → Assessment Test → Practical → Final.
     Merged view of the four scattered lists, per pipeline-overview-mockup.html.
     Hired applicants stay visible here as read-only (View only) so their
     completed pipeline can still be inspected; other lists keep hiding them
     via isHiddenStage. --- */
  const pipelineRows = useMemo(() => {
    const base = rows;
    return base
      .map((a) => {
        const live = interviews.find((i) => i.applicant === a.name && i.status !== "Cancelled");
        const anyInterview = live ?? interviews.find((i) => i.applicant === a.name) ?? undefined;
        const assessment = assessments.find((x) => x.applicantId === a.id);
        const test = assessmentTests.find((t) => t.applicantId === a.id);
        const practical = practicalTests.find((t) => t.applicantId === a.id);
        const final = finalEvaluations.find((f) => f.applicantId === a.id);
        const requiresPrac = requiresPractical(a.position, a.requiresPractical);
        const needsSchedule =
          a.stage === "Accepted" &&
          !interviews.some((i) => i.applicant === a.name && i.status !== "Cancelled");
        const readyForTest = a.stage === "Assessed" && assessment?.result === "Passed";
        const readyForPractical =
          a.stage === "Assessment Test" && requiresPrac && test?.result === "Passed";
        const readyForFinal =
          (a.stage === "Practical Test" || a.stage === "Assessment Test") &&
          test?.result === "Passed" &&
          (!requiresPrac || practical?.result === "Passed");
        return {
          a,
          interview: anyInterview,
          liveInterview: live,
          assessment,
          test,
          practical,
          final,
          requiresPrac,
          needsSchedule,
          readyForTest,
          readyForPractical,
          readyForFinal,
        };
      })
      .filter(({ a, interview, liveInterview, assessment, test, practical, final }) => {
        if (pipelinePosition !== "all" && a.position !== pipelinePosition) return false;
        if (pipelineStage !== "all" && a.stage !== pipelineStage) return false;
        if (
          pipelineSearch &&
          !`${a.name} ${a.id} ${a.position}`.toLowerCase().includes(pipelineSearch.toLowerCase())
        )
          return false;
        if (pipelineScheduledDate) {
          // Quick filter — applicants whose live interview is booked on the
          // selected day (Today Scheduled Interview metric / Daily Schedule
          // Preview). Cancelled bookings never match.
          const booked = liveInterview ?? interview;
          if (!booked || booked.status === "Cancelled" || booked.date !== pipelineScheduledDate) {
            return false;
          }
        }
        if (pipelineResult === "passed") {
          const ok =
            assessment?.result === "Passed" ||
            test?.result === "Passed" ||
            practical?.result === "Passed" ||
            (final != null && final.recommendation !== "Not Recommended");
          if (!ok) return false;
        }
        if (pipelineResult === "failed") {
          const bad =
            assessment?.result === "Failed" ||
            test?.result === "Failed" ||
            practical?.result === "Failed" ||
            final?.recommendation === "Not Recommended";
          if (!bad) return false;
        }
        if (pipelineResult === "pending") {
          if (test || practical || final) return false;
        }
        if (pipelineResult === "perfect") {
          // Metric-card quick filter — candidates the screener marked perfect
          // for the job (status = fit).
          if (a.status !== "fit") return false;
        }
        return true;
      });
  }, [
    rows,
    interviews,
    assessments,
    assessmentTests,
    practicalTests,
    finalEvaluations,
    pipelinePosition,
    pipelineStage,
    pipelineSearch,
    pipelineResult,
    pipelineScheduledDate,
  ]);

  const pipelineSort = useSort(pipelineRows, {
    applicant: (r) => r.a.name,
    applied: (r) => r.a.appliedAt,
    stage: (r) => r.a.stage,
    screening: (r) => r.a.score,
    interview: (r) => r.assessment?.total ?? null,
    assessment: (r) => r.test?.total ?? null,
    practical: (r) => r.practical?.total ?? null,
    final: (r) => r.final?.recommendation ?? null,
  });

  const applicantPage = usePagination(applicantSort.sorted);
  const assessmentPage = usePagination(assessmentSort.sorted);
  const pipelinePage = usePagination(pipelineSort.sorted);
  const auditPage = usePagination(auditSort.sorted);

  const auditActionTypes = Array.from(new Set(auditLog.map((e) => e.actionType))).sort();
  const auditActors = Array.from(new Set(auditLog.map((e) => e.actorName))).sort();

  /**
   * Applicants available in "1. Select Applicant":
   * only accepted ones (Accept &amp; Schedule), no applicant that is already
   * booked, and none that moved past the interview stage (assessment etc.).
   */
  const scheduleApplicantsBase = rows.filter(
    (a) =>
      a.stage === "Accepted" &&
      // Cancelled interviews don't count as booked — the applicant is
      // selectable again for re-booking.
      !interviews.some((i) => i.applicant === a.name && i.status !== "Cancelled") &&
      !["Assessed", "Offer", "Hired", "Rejected"].includes(a.stage) &&
      (scheduleDept === "all" ||
        displayPositions.find((p) => p.title === a.position)?.department === scheduleDept) &&
      (schedulePosition === "all" || a.position === schedulePosition),
  );

  const scheduleApplicants = [
    ...scheduleApplicantsBase,
    // While rescheduling, the applicant being moved stays selectable even
    // though they already have a booked interview.
    ...(rescheduling
      ? rows.filter(
          (a) =>
            a.name === rescheduling.applicant &&
            (scheduleDept === "all" ||
              displayPositions.find((p) => p.title === a.position)?.department === scheduleDept) &&
            (schedulePosition === "all" || a.position === schedulePosition),
        )
      : []),
    // Safety net: the applicant preselected via "Accept & Schedule" (or the
    // Schedule action) must always be selectable, even when the department /
    // position filter or the booked-interview check would otherwise exclude
    // them (e.g. DB/department name mismatches).
    ...(schedule.applicant
      ? rows.filter(
          (a) =>
            a.name === schedule.applicant &&
            a.stage === "Accepted" &&
            !scheduleApplicantsBase.some((b) => b.id === a.id),
        )
      : []),
  ].filter((a, idx, arr) => arr.findIndex((x) => x.id === a.id) === idx);
  /**
   * Interviewer options for "Book an Interview". The seeded hospitality
   * interviewers are kept for their departments/roles, and active system users
   * are appended so the person booked here is also a real assessor account —
   * the interview's Assessor field then auto-selects them (and is required).
   */
  const scheduleInterviewers = useMemo(() => {
    const inDept = (dept: string) => scheduleDept === "all" || dept === scheduleDept;
    const seeded = interviewers.filter((s) => inDept(s.department));
    const taken = new Set(seeded.map((s) => s.name.trim().toLowerCase()));
    const users = assessors
      .map((u) => ({
        id: `U${u.system_user_id}`,
        name: (u.full_name ?? "").trim(),
        role: u.department_name ?? "System user",
        department: u.department_name ?? "",
      }))
      .filter((u) => !!u.name && !taken.has(u.name.toLowerCase()) && inDept(u.department));
    return [...seeded, ...users];
  }, [assessors, scheduleDept]);

  /**
   * The applicant open in the View screen — always resolved against the live
   * rows so a finished process (interview / test / practical / final) is
   * reflected immediately in the stepper and section badges without a refresh.
   */
  const viewedApplicant = viewingApplicant
    ? (rows.find((r) => r.id === viewingApplicant.id) ?? viewingApplicant)
    : null;

  return (
    <div>
      <PageHeader
        title="Applicant Management"
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setReportsOpen(true)}>
              <Download className="mr-2 h-4 w-4" /> Generate Report
            </Button>
          </div>
        }
      />

      {viewedApplicant ? (
        <ApplicantViewScreen
          key={viewedApplicant.id}
          a={viewedApplicant}
          docs={applicantDocs[viewedApplicant.id] ?? []}
          interviews={interviews.filter((i) => i.applicant === viewedApplicant.name)}
          assessments={assessments.filter((x) => x.applicantId === viewedApplicant.id)}
          assessmentTests={assessmentTests.filter((t) => t.applicantId === viewedApplicant.id)}
          practicalTests={practicalTests.filter((t) => t.applicantId === viewedApplicant.id)}
          finalEvaluations={finalEvaluations.filter((f) => f.applicantId === viewedApplicant.id)}
          audit={auditLog.filter(
            (e) =>
              e.target.includes(viewedApplicant.name) ||
              e.target.includes(viewedApplicant.id) ||
              e.details.includes(viewedApplicant.name) ||
              e.details.includes(viewedApplicant.id),
          )}
          passing={passing}
          onBack={() => setViewingApplicant(null)}
          onBackToOnboarding={
            viewedFromOnboarding ? () => navigate({ to: `/${role}/onboarding` }) : undefined
          }
          forceChecklist={viewedFromOnboarding}
          onReview={() => openReview(viewedApplicant)}
          onRecomputeRanking={() => recomputeRanking(viewedApplicant)}
          recomputingRanking={recomputingRanking}
          onSchedule={() => {
            setViewingApplicant(null);
            setTab("scheduling");
          }}
          onStartInterview={() => startInterviewFor(viewedApplicant)}
          onAcceptAndSchedule={() => {
            // Show the resume screening result first — the review dialog's
            // Accept & schedule continues into the booking form.
            setViewingApplicant(null);
            openReview(viewedApplicant);
          }}
          onRescheduleInterview={(i) => {
            rescheduleInterview(i);
            setViewingApplicant(null);
          }}
          showAcceptInterview={
            viewedApplicant.stage === "Screened" &&
            !interviews.some((i) => i.applicant === viewedApplicant.name) &&
            !assessments.some((x) => x.applicantId === viewedApplicant.id)
          }
          showScheduleInterview={
            viewedApplicant.stage === "Accepted" &&
            !interviews.some(
              (i) => i.applicant === viewedApplicant.name && i.status !== "Cancelled",
            )
          }
          showRescheduleInterview={(() => {
            const live = interviews.find(
              (i) => i.applicant === viewedApplicant.name && i.status !== "Cancelled",
            );
            return (
              !!live &&
              !assessments.some((x) => x.applicantId === viewedApplicant.id) &&
              live.status !== "Cancelled" &&
              !["Hired", "Rejected"].includes(viewedApplicant.stage) &&
              !isInterviewLocked(live)
            );
          })()}
          onStartTest={() => openAssessmentTest(viewedApplicant)}
          onStartPractical={() => openPractical(viewedApplicant)}
          onCopyTestLink={() => copyApplicantTestLink(viewedApplicant)}
          inviteBusy={inviteBusyId === viewedApplicant.id}
          onStartFinal={() => openFinalEvaluation(viewedApplicant)}
          onViewInterview={(r) => setViewingInterview(r)}
          onViewTest={(t) => setViewingAssessmentTest(t)}
          onViewPractical={(t) => setViewingPractical(t)}
          onViewFinal={(f) => setViewingFinal(f)}
          verifiedFinal={(() => {
            const f = finalEvaluations.find((x) => x.applicantId === viewedApplicant.id);
            return f ? (verifiedDecisions[f.id] ?? null) : null;
          })()}
          finalDecided={["Hired", "Rejected"].includes(viewedApplicant.stage)}
          onVerifyFinal={(f) => {
            setVerifyingFinal(f);
            setVerifyChoice(f.recommendation);
          }}
        />
      ) : (
        <>
          <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="h-full [&>*]:h-full">
              <StatCard
                label="Total Applicants"
                value={rows.length}
                icon={Users}
                tone="primary"
                onClick={() => goToApplicants("all")}
              />
            </div>
            <div className="h-full [&>*]:h-full">
              <StatCard
                label="New Applicant"
                value={rows.filter((a) => a.stage === "Screened").length}
                icon={UserPlus}
                tone="primary"
                onClick={goToNewApplicants}
              />
            </div>
            <div className="h-full [&>*]:h-full">
              {/* Perfect for the Job — same card shape as StatCard, plus a
                  Today / Week / Month quick range switch for the count. */}
              <Card
                className="group h-full cursor-pointer transition-colors hover:border-primary/40"
                onClick={goToPerfectForJob}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <p className="eyebrow">Perfect for the Job</p>
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                    </div>
                    <div
                      className="flex w-fit shrink-0 items-center gap-0.5 rounded-md border border-border bg-muted/50 p-0.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {(["today", "week", "month"] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setPerfectRange(r)}
                          className={cn(
                            "cursor-pointer rounded px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide transition-colors",
                            perfectRange === r
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="mt-2 font-display text-3xl font-semibold text-success">
                    {(() => {
                      const inRange = (appliedAt: string) => {
                        const d = new Date(appliedAt.replace(" ", "T"));
                        if (Number.isNaN(d.getTime())) return false;
                        if (perfectRange === "today") return isoOf(d) === TODAY_ISO;
                        const days = perfectRange === "week" ? 7 : 30;
                        const cutoff = new Date();
                        cutoff.setHours(0, 0, 0, 0);
                        cutoff.setDate(cutoff.getDate() - (days - 1));
                        return d.getTime() >= cutoff.getTime();
                      };
                      return rows.filter((a) => a.status === "fit" && inRange(a.appliedAt)).length;
                    })()}
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="h-full [&>*]:h-full">
              <StatCard
                label="Today Scheduled Interview"
                value={
                  interviews.filter((i) => i.date === TODAY_ISO && i.status !== "Cancelled").length
                }
                icon={CalendarDays}
                tone="gold"
                onClick={goToTodayInterviews}
              />
            </div>
          </div>

          <Tabs value={tab} onValueChange={setTab} className="mt-6">
            <TabsList className="flex h-auto flex-wrap justify-start gap-2 border-0 bg-transparent p-0 shadow-none">
              <TabsTrigger
                className="flex items-center gap-1.5 rounded-lg border-border/70 bg-card px-4 py-2 text-xs font-semibold shadow-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                value="ranking"
              >
                <Trophy className="h-3.5 w-3.5" /> Ranking &amp; Applicants
              </TabsTrigger>
              <TabsTrigger
                className="flex items-center gap-1.5 rounded-lg border-border/70 bg-card px-4 py-2 text-xs font-semibold shadow-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                value="scheduling"
              >
                <CalendarClock className="h-3.5 w-3.5" /> Interview Pipeline
              </TabsTrigger>
              <TabsTrigger
                className="flex items-center gap-1.5 rounded-lg border-border/70 bg-card px-4 py-2 text-xs font-semibold shadow-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                value="history"
              >
                <History className="h-3.5 w-3.5" /> History &amp; Audit
              </TabsTrigger>
            </TabsList>

            {/* RANKING + TABLE */}
            <TabsContent value="ranking" className=" space-y-6">
              <div className="grid items-stretch gap-6 xl:grid-cols-[2fr_1fr]">
                <Card className="border-border/70">
                  <CardContent className="flex h-full flex-col p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
                          <Trophy className="h-5 w-5 text-primary" />
                          Candidate Ranking
                        </h2>
                      </div>
                      <Select value={positionFilter} onValueChange={setPositionFilter}>
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All positions</SelectItem>
                          {displayPositions.map((p) => (
                            <SelectItem key={p.id} value={p.title}>
                              {p.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="mx-auto mt-2 flex w-full max-w-3xl flex-1 flex-wrap items-center justify-center gap-8 py-2">
                      <div className="relative h-[380px] w-[380px] shrink-0">
                        <PieChart width={380} height={380}>
                          <Pie
                            isAnimationActive={false}
                            data={distribution}
                            dataKey="value"
                            nameKey="name"
                            cx={190}
                            cy={190}
                            innerRadius={80}
                            outerRadius={130}
                            paddingAngle={2}
                            labelLine={false}
                            label={(props: {
                              cx?: number;
                              cy?: number;
                              midAngle?: number;
                              innerRadius?: number;
                              outerRadius?: number;
                              value?: number;
                            }) => {
                              const {
                                cx = 0,
                                cy = 0,
                                midAngle = 0,
                                innerRadius = 0,
                                outerRadius = 0,
                                value = 0,
                              } = props;
                              const pct = screenedTotal ? (value / screenedTotal) * 100 : 0;
                              if (pct < 4) return null;
                              const r = innerRadius + (outerRadius - innerRadius) / 2;
                              const rad = -midAngle * (Math.PI / 180);
                              return (
                                <text
                                  x={cx + r * Math.cos(rad)}
                                  y={cy + r * Math.sin(rad)}
                                  textAnchor="middle"
                                  dominantBaseline="central"
                                  fill="#fff"
                                  fontSize={11}
                                  fontWeight={600}
                                >
                                  {Math.round(pct)}%
                                </text>
                              );
                            }}
                          >
                            {distribution.map((d) => (
                              <Cell
                                key={d.key}
                                fill={statusChartColor[d.key]}
                                className="cursor-pointer"
                                onClick={() => goToStatus(d.key)}
                              />
                            ))}
                          </Pie>
                          <RTooltip
                            contentStyle={tooltipStyle}
                            formatter={(value: number | string) => {
                              const n = Number(value);
                              const pct = screenedTotal ? Math.round((n / screenedTotal) * 100) : 0;
                              return [`${n} (${pct}%)`, "Resumes"] as [string, string];
                            }}
                          />
                        </PieChart>

                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                          <span className="font-display text-3xl font-semibold">
                            {screenedTotal}
                          </span>
                          <span className="text-[0.7rem] uppercase tracking-wide text-muted-foreground">
                            Resumes
                          </span>
                        </div>
                      </div>

                      <div className="grid w-full min-w-[16rem] max-w-[24rem] flex-1 grid-cols-1 gap-2">
                        {distribution.map((d) => (
                          <button
                            type="button"
                            key={d.key}
                            title={`Show the ${d.name} applicants in the Applicant List`}
                            onClick={() => goToStatus(d.key)}
                            className="flex cursor-pointer items-center justify-between rounded-md border border-border px-4 py-3 text-left transition-colors hover:border-primary/40 hover:bg-muted/40"
                          >
                            <span className="flex items-center gap-2 text-sm">
                              <span
                                className="h-3 w-3 rounded-full"
                                style={{ background: statusChartColor[d.key] }}
                              />
                              {d.name}
                            </span>
                            <span className="font-display text-lg font-semibold">{d.value}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Right — stretches to the row height so its bottom edge lines
                up with Candidate Ranking, while the list viewport is locked to
                three candidate cards; candidates 4 and 5 scroll into view. */}
                <Card className="flex min-h-0 flex-col self-stretch overflow-hidden border-border/70">
                  <CardContent className="flex min-h-0 flex-1 flex-col p-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
                        <Trophy className="h-5 w-5 text-gold" /> Top 5 Candidates Today
                      </h2>
                    </div>
                    <ol
                      ref={setTopFiveList}
                      style={topFiveViewport ? { maxHeight: `${topFiveViewport}px` } : undefined}
                      className="mt-4 flex max-h-[33rem] min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1"
                    >
                      {topFiveToday.map((a, i) => (
                        <li
                          key={a.id}
                          ref={i === 0 ? setTopFiveCard : undefined}
                          className="flex shrink-0 flex-col gap-3 rounded-xl border border-border/80 bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                        >
                          {/* Row 1: Rank + Avatar + Name/Position */}
                          <div className="flex items-center gap-3">
                            <span
                              className={cn(
                                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-xs font-semibold",
                                i === 0
                                  ? "bg-gold text-gold-foreground"
                                  : "bg-secondary text-secondary-foreground",
                              )}
                            >
                              {i + 1}
                            </span>
                            <Avatar className="h-12 w-12 shrink-0">
                              <AvatarFallback className="bg-secondary text-sm font-medium">
                                {initials(a.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-base font-semibold">{a.name}</p>
                              <p className="truncate text-sm text-muted-foreground">{a.position}</p>
                              {(() => {
                                const tier = computeTopCandidateTier(
                                  a.status,
                                  applicantDocs[a.id] ?? [],
                                );
                                return (
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "mt-1 text-[0.65rem]",
                                      topCandidateTierMeta[tier].className,
                                    )}
                                  >
                                    <Trophy className="mr-1 h-3 w-3" />
                                    {topCandidateTierMeta[tier].label}
                                  </Badge>
                                );
                              })()}
                            </div>
                            {/* Score shares the name/badge row — the separate
                                score row that left a white gap before Review is
                                gone, and the percent lines up with the badge. */}
                            <span className="ml-auto shrink-0 self-center font-display text-2xl font-bold text-primary">
                              {a.score}%
                            </span>
                          </div>

                          {/* Review button — full width, matches photo */}
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={() => openReview(a)}
                          >
                            Review
                          </Button>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              </div>

              <Card ref={applicantListRef} className="scroll-mt-4 border-border/70">
                <CardContent className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
                        <Users className="h-5 w-5 text-primary" />
                        Applicant List
                      </h2>
                      {rankingFilter !== "all" && (
                        <Badge
                          variant="outline"
                          className="mt-1.5 gap-1 border-primary/30 bg-primary/10 text-primary"
                        >
                          {rankingFilter === "passed" ? "Passed screening" : "Ready to assess"}
                          <button
                            type="button"
                            className="ml-1 hover:opacity-70"
                            onClick={() => setRankingFilter("all")}
                            aria-label="Clear quick filter"
                          >
                            ?
                          </button>
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Input
                        placeholder="Search applicant—"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-56"
                      />
                      <Select value={positionFilter} onValueChange={setPositionFilter}>
                        <SelectTrigger className="w-52">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All positions</SelectItem>
                          {displayPositions.map((p) => (
                            <SelectItem key={p.id} value={p.title}>
                              {p.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-52">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All statuses</SelectItem>
                          {(Object.keys(statusMeta) as ApplicantStatus[]).map((k) => (
                            <SelectItem key={k} value={k}>
                              {statusMeta[k].label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={stageFilter} onValueChange={setStageFilter}>
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All stages</SelectItem>
                          {[
                            "Screened",
                            "Accepted",
                            "Interview Scheduled",
                            "Assessed",
                            "Offer",
                            "Hired",
                            "Rejected",
                          ].map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <ListBody>
                      <Table className="table-fixed text-xs">
                        <TableHeader>
                          <TableRow>
                            <SortHead
                              sortKey="name"
                              sort={applicantSort.sort}
                              onSort={applicantSort.toggle}
                              className="w-[22%]"
                            >
                              Applicant
                            </SortHead>
                            <SortHead
                              sortKey="contact"
                              sort={applicantSort.sort}
                              onSort={applicantSort.toggle}
                              className="hidden w-[18%] md:table-cell"
                            >
                              Contact
                            </SortHead>
                            <SortHead
                              sortKey="position"
                              sort={applicantSort.sort}
                              onSort={applicantSort.toggle}
                              className="w-[16%]"
                            >
                              Position
                            </SortHead>
                            <SortHead
                              sortKey="applied"
                              sort={applicantSort.sort}
                              onSort={applicantSort.toggle}
                              className="w-[11%]"
                            >
                              Applied
                            </SortHead>
                            <SortHead
                              sortKey="score"
                              sort={applicantSort.sort}
                              onSort={applicantSort.toggle}
                              className="w-[8%]"
                            >
                              Score
                            </SortHead>
                            <SortHead
                              sortKey="status"
                              sort={applicantSort.sort}
                              onSort={applicantSort.toggle}
                              className="w-[13%]"
                            >
                              Status
                            </SortHead>
                            <SortHead
                              sortKey="stage"
                              sort={applicantSort.sort}
                              onSort={applicantSort.toggle}
                              className="w-[8%]"
                            >
                              Stage
                            </SortHead>
                            <TableHead className="w-[15%] text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {applicantPage.pageItems.map((a) => (
                            <TableRow key={a.id}>
                              <TableCell className="max-w-0">
                                <div className="flex min-w-0 items-center gap-2">
                                  <Avatar className="h-7 w-7 shrink-0">
                                    <AvatarFallback className="bg-secondary text-[0.65rem]">
                                      {initials(a.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0">
                                    <p className="truncate font-medium" title={a.name}>
                                      {a.name}
                                    </p>
                                    <p className="truncate text-muted-foreground">{a.id}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="hidden max-w-0 md:table-cell">
                                <p className="truncate" title={a.email}>
                                  {a.email}
                                </p>
                                <p className="truncate text-muted-foreground">{a.phone}</p>
                              </TableCell>
                              <TableCell className="max-w-0 truncate" title={a.position}>
                                {a.position}
                              </TableCell>
                              <TableCell
                                className="max-w-0 truncate text-muted-foreground"
                                title={displayAppliedAt(a.appliedAt)}
                              >
                                {displayAppliedAt(a.appliedAt)}
                              </TableCell>
                              <TableCell>
                                <span className="font-display text-sm font-semibold">
                                  {a.score}%
                                </span>
                                {(a.docCount ?? 0) > 0 ? (
                                  <p
                                    className="truncate text-xs font-medium text-primary"
                                    title={`${a.docCount} supporting document${a.docCount === 1 ? "" : "s"} uploaded — open View profile → Resume & Documents to inspect`}
                                  >
                                    {a.docCount} supporting doc{a.docCount === 1 ? "" : "s"}
                                  </p>
                                ) : null}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "max-w-full truncate px-1.5 py-0.5",
                                    statusMeta[a.status].className,
                                  )}
                                  title={statusMeta[a.status].label}
                                >
                                  <span
                                    className={cn(
                                      "mr-1 h-1.5 w-1.5 shrink-0 rounded-full",
                                      statusMeta[a.status].dot,
                                    )}
                                  />
                                  <span className="truncate">{statusMeta[a.status].label}</span>
                                </Badge>
                              </TableCell>
                              <TableCell className="max-w-0 truncate" title={a.stage}>
                                {a.stage}
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-end gap-1.5">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 cursor-pointer"
                                    title="Open applicant view profile"
                                    onClick={() => setViewingApplicant(a)}
                                  >
                                    <Eye className="mr-1.5 h-3.5 w-3.5" /> View profile
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ListBody>
                    <TablePagination
                      page={applicantPage.page}
                      pageCount={applicantPage.pageCount}
                      from={applicantPage.from}
                      to={applicantPage.to}
                      total={applicantPage.total}
                      label="applicants"
                      showRangeLabel={false}
                      onPageChange={applicantPage.setPage}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SCHEDULING */}
            <TabsContent value="scheduling" className="mt-4 space-y-6">
              {/* Top row retired — the mini Interview Calendar + top Book an Interview
              card stay mounted but hidden: the Book card hosts the slot-settings /
              full-calendar dialogs (portaled overlays, still reachable from below).
              The visible booking form only appears in booking mode inside the
              Room Availability card below. */}
              <div className="hidden">
                {/* ?? Interview Calendar ??????????????????????????????? */}
                <Card className="flex h-full flex-col rounded-xl border-border/70 shadow-sm">
                  <CardContent className="flex flex-1 flex-col p-5">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                      <div className="flex min-w-0 items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center text-primary">
                          <CalendarDays className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <h2 className="font-display text-2xl font-semibold">
                            Interview Calendar
                          </h2>
                          <p className="text-xs text-muted-foreground">
                            Pick a date to view availability and interviews.
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center justify-end gap-2">
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const today = new Date();
                              setViewMonth(new Date(today.getFullYear(), today.getMonth(), 1));
                              setSchedule((s) => ({ ...s, date: isoOf(today) }));
                            }}
                          >
                            Today
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            aria-label="Previous month"
                            onClick={() =>
                              setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))
                            }
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            aria-label="Next month"
                            onClick={() =>
                              setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))
                            }
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            aria-label="Full calendar view"
                            title="Full calendar view"
                            onClick={() => {
                              const today = new Date();
                              setCalViewMonth(new Date(today.getFullYear(), today.getMonth(), 1));
                              setCalViewDate(isoOf(today));
                              setCalViewPanel("calendar");
                              setCalViewOpen(true);
                            }}
                          >
                            <Maximize2 className="h-4 w-4" />
                          </Button>
                        </>
                      </div>
                    </div>

                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="mt-4 inline-flex items-center gap-2 self-start rounded-lg px-2 py-1 font-display text-lg font-semibold transition-colors hover:bg-muted"
                        >
                          {viewMonth.toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                          })}
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-64 space-y-3 p-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Month</Label>
                          <Select
                            value={String(viewMonth.getMonth())}
                            onValueChange={(v) =>
                              setViewMonth((m) => new Date(m.getFullYear(), Number(v), 1))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {monthNames.map((name, i) => (
                                <SelectItem key={name} value={String(i)}>
                                  {name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Year</Label>
                          <Select
                            value={String(viewMonth.getFullYear())}
                            onValueChange={(v) =>
                              setViewMonth((m) => new Date(Number(v), m.getMonth(), 1))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {yearOptions.map((y) => (
                                <SelectItem key={y} value={String(y)}>
                                  {y}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </PopoverContent>
                    </Popover>

                    <div className="mt-2 grid grid-cols-7 text-center text-[0.65rem] font-semibold tracking-wide text-muted-foreground">
                      {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
                        <span key={d} className="py-1.5">
                          {d}
                        </span>
                      ))}
                    </div>

                    <div className="grid flex-1 grid-cols-7 grid-rows-6 overflow-hidden rounded-lg border border-border">
                      {monthCells.map((cell) => {
                        const iso = isoOf(cell.date);
                        // Cancelled bookings don't make a day "Booked/Full".
                        const count = interviews.filter(
                          (i) => i.date === iso && i.status !== "Cancelled",
                        ).length;
                        // A day is free only if the setter says it is schedulable;
                        // full once every slot is booked.
                        const dayName = DAY_NAMES[cell.date.getDay()]!;
                        const schedulable = schedulableDays.includes(dayName);
                        const free = count === 0 && schedulable;
                        const full = count > 0 && schedulable && count >= capacityPerSlot;
                        const selected = schedule.date === iso;
                        const isToday = iso === TODAY_ISO;
                        return (
                          <button
                            key={iso}
                            type="button"
                            aria-label={cell.date.toDateString()}
                            aria-pressed={selected}
                            onClick={() => {
                              setSchedule((s) => ({ ...s, date: iso }));
                            }}
                            className={cn(
                              "relative min-h-[2.9rem] cursor-pointer border-b border-r border-border/70 text-sm transition-colors hover:z-10 last:border-r-0",
                              free &&
                                !selected &&
                                "bg-card font-normal text-foreground hover:bg-muted/50 hover:shadow-sm",
                              full &&
                                !selected &&
                                "bg-destructive/25 font-semibold text-destructive hover:bg-destructive/35 hover:shadow-sm",
                              isToday &&
                                !selected &&
                                "bg-gold/30 ring-1 ring-inset ring-gold hover:bg-gold/40 hover:shadow-sm",
                              !selected && !free && !full && "hover:bg-muted/50 hover:shadow-sm",
                              count === 0 &&
                                !schedulable &&
                                (cell.inMonth
                                  ? "text-muted-foreground/40"
                                  : "opacity-40 text-muted-foreground/40"),
                              count > 0 &&
                                !selected &&
                                !full &&
                                "bg-[oklch(0.427_0.166_22.5)]/[0.08] font-semibold text-[oklch(0.427_0.166_22.5)] hover:bg-[oklch(0.427_0.166_22.5)]/[0.15] hover:shadow-sm",
                              selected &&
                                free &&
                                "bg-card font-semibold text-foreground ring-2 ring-inset ring-primary",
                              selected && full && "bg-red-700 font-semibold text-white",
                              selected &&
                                !free &&
                                !full &&
                                "bg-primary font-semibold text-primary-foreground",
                            )}
                          >
                            {cell.date.getDate()}
                            {count > 1 && (
                              <span
                                className={cn(
                                  "absolute -top-1 -right-1 z-10 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[0.6rem] font-semibold text-white",
                                  selected && full
                                    ? "bg-red-900"
                                    : selected && free
                                      ? "bg-foreground"
                                      : "bg-[oklch(0.427_0.166_22.5)]",
                                )}
                              >
                                {count}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-3 flex flex-wrap justify-between gap-x-3 gap-y-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full border border-border bg-card" /> Free
                        day (schedulable)
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-destructive" /> Full (all slots
                        booked)
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-[oklch(0.427_0.166_22.5)]" />{" "}
                        Booked
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-gold" /> Today
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-muted-foreground/30" /> Not
                        schedulable / No availability
                      </span>
                    </div>

                    <div className="mt-4 flex flex-none flex-col">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-display text-base font-semibold">
                          Interviews on{" "}
                          {new Date(`${schedule.date}T00:00:00`).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                        <Badge
                          variant="outline"
                          className="border-primary/30 bg-primary/10 text-primary"
                        >
                          {interviews.filter((i) => i.date === schedule.date).length}
                        </Badge>
                        <div className="ml-auto flex min-w-0 items-center gap-1.5">
                          <div className="relative w-28">
                            <Search className="pointer-events-none absolute top-1/2 left-2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              value={calSearch}
                              onChange={(e) => setCalSearch(e.target.value)}
                              placeholder="Search"
                              className="h-7 pl-6 text-xs"
                            />
                          </div>
                          <Select value={calStatusFilter} onValueChange={setCalStatusFilter}>
                            <SelectTrigger className="h-7 w-[92px] text-xs">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All status</SelectItem>
                              <SelectItem value="Scheduled">Scheduled</SelectItem>
                              <SelectItem value="Completed">Completed</SelectItem>
                              <SelectItem value="Cancelled">Cancelled</SelectItem>
                              <SelectItem value="No Show">No Show</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="relative mt-2 h-[10.5rem]">
                        <div className="absolute inset-0 space-y-2 overflow-y-auto pr-1.5">
                          {interviews
                            .filter((i) => i.date === schedule.date)
                            .filter((i) =>
                              calStatusFilter === "all" ? true : i.status === calStatusFilter,
                            )
                            .filter((i) =>
                              calSearch
                                ? `${i.applicant} ${i.position} ${i.interviewer}`
                                    .toLowerCase()
                                    .includes(calSearch.toLowerCase())
                                : true,
                            )
                            .map((i) => (
                              <div
                                key={i.id}
                                role="button"
                                tabIndex={0}
                                onClick={() => toast(`Viewing interview — ${i.applicant}`)}
                                className="grid w-full cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border/70 bg-muted/20 p-2.5 text-left transition-colors hover:bg-muted/40"
                              >
                                {i.status === "Cancelled" ? (
                                  <span className="shrink-0 rounded-md border border-destructive/40 bg-destructive/10 px-2 py-1.5 text-xs font-semibold text-destructive line-through">
                                    {i.time}
                                  </span>
                                ) : (
                                  <span className="shrink-0 rounded-md bg-card px-2.5 py-1.5 text-xs font-semibold text-primary shadow-sm">
                                    {i.time}
                                  </span>
                                )}
                                <span className="grid min-w-0 gap-1 sm:grid-cols-2">
                                  <span className="min-w-0">
                                    <span className="block truncate text-sm font-medium">
                                      {i.applicant}
                                    </span>
                                    <span className="block truncate text-xs text-muted-foreground">
                                      {i.position}
                                    </span>
                                  </span>
                                  <span className="min-w-0">
                                    <span className="block truncate text-sm font-medium">
                                      {i.interviewer}
                                    </span>
                                    <span className="block truncate text-xs text-muted-foreground">
                                      {i.mode}
                                    </span>
                                  </span>
                                </span>
                                <span className="flex items-center gap-1">
                                  {i.status === "Cancelled" && (
                                    <Badge
                                      variant="outline"
                                      className="shrink-0 border-destructive/40 bg-destructive/10 text-destructive"
                                    >
                                      Cancelled
                                    </Badge>
                                  )}
                                  {i.status !== "Cancelled" && (
                                    <button
                                      type="button"
                                      aria-label={`Delete interview for ${i.applicant}`}
                                      title="Delete interview"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCancelInterview(
                                          interviews.find((x) => x.id === i.id) ?? null,
                                        );
                                      }}
                                      className="rounded-md p-1 text-destructive transition-colors hover:bg-destructive/10"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                                </span>
                              </div>
                            ))}
                          {interviews.filter((i) => i.date === schedule.date).length === 0 && (
                            <p className="rounded-lg border border-dashed border-border p-5 text-center text-xs text-muted-foreground">
                              No interviews booked — the whole day is free.
                            </p>
                          )}
                        </div>
                        {interviews.filter((i) => i.date === schedule.date).length > 3 && (
                          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 rounded-b-lg bg-gradient-to-t from-card to-transparent" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* ?? Book an Interview — top slot (stays mounted for its dialogs;
                hidden while bookingFocus shows the shared-state copy below) */}
                <Card
                  className={cn(
                    "flex h-full flex-col rounded-xl border-border/70 shadow-sm",
                    bookingFocus && "hidden",
                  )}
                >
                  <CardContent className="flex flex-1 flex-col p-5">
                    <div className="flex items-start gap-2.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center text-primary">
                        <CalendarClock className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <h2 className="font-display text-xl font-semibold">Book an Interview</h2>
                        <p className="text-xs text-muted-foreground">
                          Fill in the details to schedule an interview and send an invite.
                        </p>
                      </div>
                    </div>

                    {/* Booking progress removed per user request */ undefined}

                    <div className="mt-3 flex flex-1 flex-col">
                      <div className="flex-1 space-y-2">
                        <Dialog open={slotDialogOpen} onOpenChange={setSlotDialogOpen}>
                          <DialogContent className="max-h-[88vh] overflow-hidden sm:max-w-[min(1400px,95vw)]">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2 font-display text-2xl">
                                <Settings2 className="h-5 w-5 text-primary" /> Slot Settings
                              </DialogTitle>
                              <DialogDescription>
                                Customize how interview slots are generated and managed.
                              </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-6 lg:grid-cols-2">
                              {/* ?? Left column: configuration ??????????????? */}
                              <div className="max-h-[58vh] space-y-5 overflow-y-auto pr-1">
                                <div className="space-y-3">
                                  <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground">
                                    <Users className="h-3.5 w-3.5" /> CAPACITY (PER TIME SLOT)
                                  </p>
                                  <p className="text-[0.7rem] text-muted-foreground">
                                    The number of interviews that can happen at the same time based
                                    on available interviewers and rooms.
                                  </p>
                                  <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="space-y-1">
                                      <Label className="text-xs">Available Interviewers</Label>
                                      <Input
                                        type="number"
                                        min={1}
                                        max={100}
                                        value={slotSettings.interviewersAvailable}
                                        onChange={(e) =>
                                          setSlotSettings((p) => ({
                                            ...p,
                                            interviewersAvailable: Math.max(
                                              1,
                                              Number(e.target.value) || 1,
                                            ),
                                          }))
                                        }
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs">Available Rooms</Label>
                                      <Input
                                        type="number"
                                        min={1}
                                        max={100}
                                        value={slotSettings.roomsAvailable}
                                        onChange={(e) =>
                                          setSlotSettings((p) => ({
                                            ...p,
                                            roomsAvailable: Math.max(
                                              1,
                                              Number(e.target.value) || 1,
                                            ),
                                          }))
                                        }
                                      />
                                    </div>
                                  </div>
                                  <div className="rounded-lg border border-primary/30 bg-primary/10 p-3">
                                    <p className="text-xs font-medium text-foreground">
                                      Maximum Concurrent Interviews
                                    </p>
                                    <div className="mt-1 flex items-baseline gap-2">
                                      <span className="font-display text-3xl font-bold text-primary">
                                        {capacityPerSlot}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        interviews per time slot
                                      </span>
                                    </div>
                                    <p className="text-[0.65rem] text-muted-foreground">
                                      (Limited by available interviewers and rooms)
                                    </p>
                                  </div>
                                </div>

                                <div className="space-y-3 border-t border-border/70 pt-4">
                                  <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground">
                                    <CalendarClock className="h-3.5 w-3.5" /> TIME CONFIGURATION
                                  </p>
                                  <div className="grid gap-3 sm:grid-cols-3">
                                    <div className="space-y-1">
                                      <Label className="text-xs">First slot starts</Label>
                                      <Input
                                        type="time"
                                        value={slotSettings.startTime}
                                        onChange={(e) =>
                                          setSlotSettings((p) => ({
                                            ...p,
                                            startTime: e.target.value || "08:00",
                                          }))
                                        }
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs">Slot duration</Label>
                                      <Select
                                        value={String(slotSettings.intervalMinutes)}
                                        onValueChange={(v) =>
                                          setSlotSettings((p) => ({
                                            ...p,
                                            intervalMinutes: Number(v),
                                          }))
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {[15, 20, 30, 45, 60].map((m) => (
                                            <SelectItem key={m} value={String(m)}>
                                              {m} minutes
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs">Number of time slots</Label>
                                      <Select
                                        value={String(slotSettings.slotCount)}
                                        onValueChange={(v) =>
                                          setSlotSettings((p) => ({
                                            ...p,
                                            slotCount: Number(v),
                                          }))
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {[6, 8, 10, 12, 14, 16, 18, 20].map((n) => (
                                            <SelectItem key={n} value={String(n)}>
                                              {n} slots
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-3 border-t border-border/70 pt-4">
                                  <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground">
                                    <CalendarDays className="h-3.5 w-3.5" /> SCHEDULABLE DAYS
                                  </p>
                                  <p className="text-[0.7rem] text-muted-foreground">
                                    Free-day indicators on the interview calendar only apply to the
                                    days selected here.
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {DAY_NAMES.map((day) => {
                                      const active = schedulableDaysDraft.includes(day);
                                      return (
                                        <button
                                          key={day}
                                          type="button"
                                          onClick={() =>
                                            setSchedulableDaysDraft((prev) =>
                                              active
                                                ? prev.filter((d) => d !== day)
                                                : [...prev, day],
                                            )
                                          }
                                          className={cn(
                                            "h-8 rounded-md border px-3 text-xs font-medium transition-colors",
                                            active
                                              ? "border-primary/40 bg-primary/10 text-primary"
                                              : "border-border bg-muted/20 text-muted-foreground",
                                          )}
                                        >
                                          {day.slice(0, 3).toUpperCase()}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                <div className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                                  <div className="flex items-center justify-between">
                                    <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground">
                                      <CalendarDays className="h-3.5 w-3.5" /> BREAK SLOT
                                      (UNAVAILABLE TIME)
                                    </p>
                                    <Switch
                                      checked={slotSettings.breakEnabled}
                                      onCheckedChange={(v) =>
                                        setSlotSettings((p) => ({
                                          ...p,
                                          breakEnabled: v,
                                        }))
                                      }
                                    />
                                  </div>
                                  <p className="text-[0.7rem] text-muted-foreground">
                                    Time within this range will not be available for interviews.
                                  </p>
                                  <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="space-y-1">
                                      <Label className="text-xs">Break start</Label>
                                      <Input
                                        type="time"
                                        disabled={!slotSettings.breakEnabled}
                                        value={slotSettings.breakStart}
                                        onChange={(e) =>
                                          setSlotSettings((p) => ({
                                            ...p,
                                            breakStart: e.target.value || "12:00",
                                          }))
                                        }
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs">Break end</Label>
                                      <Input
                                        type="time"
                                        disabled={!slotSettings.breakEnabled}
                                        value={slotSettings.breakEnd}
                                        onChange={(e) =>
                                          setSlotSettings((p) => ({
                                            ...p,
                                            breakEnd: e.target.value || "13:00",
                                          }))
                                        }
                                      />
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      className="h-7 border-primary/40 bg-primary/10 text-xs text-primary"
                                      disabled={!slotSettings.breakEnabled}
                                      onClick={() =>
                                        setSlotSettings((p) => ({
                                          ...p,
                                          breakStart: "12:00",
                                          breakEnd: "13:00",
                                        }))
                                      }
                                    >
                                      Lunch Break
                                    </Button>
                                    {[15, 30, 60].map((mins) => (
                                      <Button
                                        key={mins}
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        className="h-7 text-xs"
                                        disabled={!slotSettings.breakEnabled}
                                        onClick={() =>
                                          setSlotSettings((p) => {
                                            const startMin = parseTimeToMinutes(p.breakStart);
                                            const endMin =
                                              (((startMin + mins) % (24 * 60)) + 24 * 60) %
                                              (24 * 60);
                                            const eh = String(Math.floor(endMin / 60)).padStart(
                                              2,
                                              "0",
                                            );
                                            const em = String(endMin % 60).padStart(2, "0");
                                            return { ...p, breakEnd: `${eh}:${em}` };
                                          })
                                        }
                                      >
                                        {mins === 60 ? "1 hour" : `${mins} min`}
                                      </Button>
                                    ))}
                                  </div>
                                </div>

                                <div className="space-y-3 border-t border-border/70 pt-4">
                                  <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground">
                                    <Sliders className="h-3.5 w-3.5" /> OTHER OPTIONS
                                  </p>
                                  <div className="flex items-center justify-between rounded-md border border-border/70 bg-muted/20 px-3 py-2">
                                    <div>
                                      <p className="text-xs font-medium">Walk-in applicants</p>
                                      <p className="text-[0.7rem] text-muted-foreground">
                                        Allow applicants without a scheduled appointment.
                                      </p>
                                    </div>
                                    <Switch
                                      checked={slotSettings.allowWalkIn}
                                      onCheckedChange={(v) =>
                                        setSlotSettings((p) => ({
                                          ...p,
                                          allowWalkIn: v,
                                        }))
                                      }
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">Default interview type</Label>
                                    <Select
                                      value={slotSettings.defaultMode}
                                      onValueChange={(v) =>
                                        setSlotSettings((p) => ({
                                          ...p,
                                          defaultMode: v as typeof p.defaultMode,
                                        }))
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="On-site">On-site</SelectItem>
                                        <SelectItem value="Virtual">Virtual</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>

                              {/* ?? Right column: preview ???????????????????? */}
                              <div className="max-h-[58vh] space-y-4 overflow-y-auto pl-0 lg:border-l lg:border-border/70 lg:pl-6">
                                <div>
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground">
                                      <CalendarDays className="h-3.5 w-3.5" /> DAILY SCHEDULE
                                      PREVIEW
                                    </p>
                                    <Badge
                                      variant="outline"
                                      className="border-primary/30 bg-primary/10 text-primary"
                                    >
                                      {slotsForSelected.length} slots available
                                    </Badge>
                                  </div>
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {dailySchedule[0]?.label} —{" "}
                                    {dailySchedule[dailySchedule.length - 1]?.endLabel}
                                  </p>
                                  <div className="mt-2 space-y-1.5 rounded-lg border border-border/70 p-2">
                                    {dailySchedule.map((slot, idx) => (
                                      <div
                                        key={idx}
                                        className={cn(
                                          "flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs",
                                          slot.isBreak
                                            ? "border border-primary/30 bg-primary/10 font-medium text-primary"
                                            : "bg-muted/20",
                                        )}
                                      >
                                        <span>
                                          {slot.label} — {slot.endLabel}
                                        </span>
                                        {slot.isBreak ? (
                                          <Badge className="border-primary/30 bg-primary/15 text-primary">
                                            Break
                                          </Badge>
                                        ) : (
                                          <Badge className="border-success/30 bg-success/10 text-success">
                                            Available
                                          </Badge>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="rounded-lg border border-border/70 bg-muted/10 p-3">
                                  <p className="text-xs font-semibold tracking-wide text-muted-foreground">
                                    SUMMARY
                                  </p>
                                  <div className="mt-2 grid gap-1.5 text-xs sm:grid-cols-2">
                                    {[
                                      `${capacityPerSlot} interviews per slot`,
                                      `${slotSettings.interviewersAvailable} interviewers`,
                                      `${slotSettings.roomsAvailable} rooms`,
                                      `${slotSettings.slotCount} slots per day`,
                                      `${slotSettings.intervalMinutes} minutes duration`,
                                      slotSettings.breakEnabled
                                        ? `Break window (${dailySchedule.find((s) => s.isBreak)?.label ?? slotSettings.breakStart} — ${slotSettings.breakEnd})`
                                        : "No break configured",
                                      slotSettings.allowWalkIn
                                        ? "Walk-ins allowed"
                                        : "Walk-ins not allowed",
                                      `Default type: ${slotSettings.defaultMode}`,
                                      `Schedulable days: ${
                                        schedulableDays.length
                                          ? schedulableDays.map((d) => d.slice(0, 3)).join(", ")
                                          : "None"
                                      }`,
                                    ].map((line) => (
                                      <span key={line} className="flex items-center gap-1.5">
                                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />
                                        {line}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <DialogFooter className="gap-2">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSlotSettings(DEFAULT_SLOT_SETTINGS);
                                  setSchedulableDaysDraft(DEFAULT_SCHEDULABLE_DAYS);
                                }}
                              >
                                Reset to default
                              </Button>
                              <Button
                                onClick={() => {
                                  setSchedulableDays(schedulableDaysDraft);
                                  setSlotDialogOpen(false);
                                  settingsApi
                                    .upsert("interview.schedulable_days", schedulableDaysDraft)
                                    .then(() =>
                                      toast.success(
                                        "Slot settings saved — schedulable days updated",
                                      ),
                                    )
                                    .catch(() => {
                                      toast.success("Slot settings saved");
                                    });
                                }}
                              >
                                Save settings
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        {/* ?? Full calendar view ????????????????????????????? */}
                        <Dialog open={calViewOpen} onOpenChange={setCalViewOpen}>
                          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[min(1400px,96vw)]">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2 font-display text-2xl">
                                <CalendarDays className="h-5 w-5 text-primary" /> Interview Calendar
                              </DialogTitle>
                            </DialogHeader>

                            {calViewPanel === "calendar" ? (
                              <>
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <button
                                        type="button"
                                        className="inline-flex items-center gap-2 rounded-lg px-2 py-1 font-display text-lg font-semibold transition-colors hover:bg-muted"
                                      >
                                        {calViewMonth.toLocaleDateString("en-US", {
                                          month: "long",
                                          year: "numeric",
                                        })}
                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                      </button>
                                    </PopoverTrigger>
                                    <PopoverContent align="start" className="w-64 space-y-3 p-3">
                                      <div className="space-y-1.5">
                                        <Label className="text-xs">Month</Label>
                                        <Select
                                          value={String(calViewMonth.getMonth())}
                                          onValueChange={(v) =>
                                            setCalViewMonth(
                                              (mo) => new Date(mo.getFullYear(), Number(v), 1),
                                            )
                                          }
                                        >
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {monthNames.map((name, i) => (
                                              <SelectItem key={name} value={String(i)}>
                                                {name}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="space-y-1.5">
                                        <Label className="text-xs">Year</Label>
                                        <Select
                                          value={String(calViewMonth.getFullYear())}
                                          onValueChange={(v) =>
                                            setCalViewMonth(
                                              (mo) => new Date(Number(v), mo.getMonth(), 1),
                                            )
                                          }
                                        >
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {yearOptions.map((y) => (
                                              <SelectItem key={y} value={String(y)}>
                                                {y}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        const today = new Date();
                                        setCalViewMonth(
                                          new Date(today.getFullYear(), today.getMonth(), 1),
                                        );
                                        setCalViewDate(isoOf(today));
                                      }}
                                    >
                                      Today
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="outline"
                                      aria-label="Previous month"
                                      onClick={() =>
                                        setCalViewMonth(
                                          (mo) => new Date(mo.getFullYear(), mo.getMonth() - 1, 1),
                                        )
                                      }
                                    >
                                      <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="outline"
                                      aria-label="Next month"
                                      onClick={() =>
                                        setCalViewMonth(
                                          (mo) => new Date(mo.getFullYear(), mo.getMonth() + 1, 1),
                                        )
                                      }
                                    >
                                      <ChevronRight className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>

                                <div className="mt-2 grid grid-cols-7 text-center text-[0.65rem] font-semibold tracking-wide text-muted-foreground">
                                  {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
                                    <span key={d} className="py-1.5">
                                      {d}
                                    </span>
                                  ))}
                                </div>

                                <div className="grid grid-cols-7 grid-rows-6 overflow-hidden rounded-lg border border-border">
                                  {calViewCells.map((cell) => {
                                    const iso = isoOf(cell.date);
                                    // Cancelled bookings don't make a day "Booked/Full".
                                    const count = interviews.filter(
                                      (i) => i.date === iso && i.status !== "Cancelled",
                                    ).length;
                                    const dayName = DAY_NAMES[cell.date.getDay()]!;
                                    const schedulable = schedulableDays.includes(dayName);
                                    const free = count === 0 && schedulable;
                                    const full =
                                      count > 0 && schedulable && count >= capacityPerSlot;
                                    const selected = calViewDate === iso;
                                    const isToday = iso === TODAY_ISO;
                                    return (
                                      <button
                                        key={iso}
                                        type="button"
                                        aria-label={cell.date.toDateString()}
                                        aria-pressed={selected}
                                        onClick={() => setCalViewDate(iso)}
                                        onDoubleClick={() => {
                                          setCalViewDate(iso);
                                          setCalViewPanel("day");
                                        }}
                                        className={cn(
                                          "relative min-h-[3.5rem] cursor-pointer border-b border-r border-border/70 text-sm transition-colors hover:z-10 last:border-r-0",
                                          free &&
                                            !selected &&
                                            "bg-card font-normal text-foreground hover:bg-muted/50 hover:shadow-sm",
                                          full &&
                                            !selected &&
                                            "bg-destructive/25 font-semibold text-destructive hover:bg-destructive/35 hover:shadow-sm",
                                          isToday &&
                                            !selected &&
                                            "bg-gold/30 ring-1 ring-inset ring-gold hover:bg-gold/40 hover:shadow-sm",
                                          !selected &&
                                            !free &&
                                            !full &&
                                            "hover:bg-muted/50 hover:shadow-sm",
                                          count === 0 &&
                                            !schedulable &&
                                            (cell.inMonth
                                              ? "text-muted-foreground/40"
                                              : "opacity-40 text-muted-foreground/40"),
                                          count > 0 &&
                                            !selected &&
                                            !full &&
                                            "bg-[oklch(0.427_0.166_22.5)]/[0.08] font-semibold text-[oklch(0.427_0.166_22.5)] hover:bg-[oklch(0.427_0.166_22.5)]/[0.15] hover:shadow-sm",
                                          selected &&
                                            free &&
                                            "bg-card font-semibold text-foreground ring-2 ring-inset ring-primary",
                                          selected && full && "bg-red-700 font-semibold text-white",
                                          selected &&
                                            !free &&
                                            !full &&
                                            "bg-primary font-semibold text-primary-foreground",
                                        )}
                                      >
                                        {cell.date.getDate()}
                                        {count > 0 && (
                                          <span
                                            className={cn(
                                              "absolute -top-1 -right-1 z-10 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[0.6rem] font-semibold text-white",
                                              selected && full
                                                ? "bg-red-900"
                                                : selected && free
                                                  ? "bg-foreground"
                                                  : "bg-[oklch(0.427_0.166_22.5)]",
                                            )}
                                          >
                                            {count}
                                          </span>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              </>
                            ) : (
                              <div className="mt-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setCalViewPanel("calendar")}
                                >
                                  <ChevronLeft className="h-4 w-4" /> Back to calendar
                                </Button>
                              </div>
                            )}

                            {calViewPanel === "day" &&
                              (() => {
                                const [yy, mm, dd] = calViewDate.split("-").map(Number);
                                const selectedDate = new Date(yy ?? 1970, (mm ?? 1) - 1, dd ?? 1);
                                const onSiteRooms = facilities.filter((f) => f.type === "On-site");
                                const virtualRoom =
                                  facilities.find((f) => f.type === "Virtual") ?? null;
                                const reservedCount = (id: string) =>
                                  calViewDayInterviews.filter(
                                    (i) => facilityOfInterview(i)?.id === id,
                                  ).length;
                                const virtualCount = virtualRoom
                                  ? reservedCount(virtualRoom.id)
                                  : 0;
                                return (
                                  <div className="mt-4 grid items-start gap-4 lg:grid-cols-2">
                                    {/* ?? Places — rooms + virtual for the selected date */}
                                    <Card className="rounded-xl border-border/70 shadow-sm">
                                      <CardContent className="p-5">
                                        <p className="text-xs font-semibold tracking-widest">
                                          PLACES
                                        </p>
                                        <div className="mt-1 flex items-end gap-2">
                                          <span className="font-display text-5xl font-bold leading-none">
                                            {selectedDate.getDate()}
                                          </span>
                                          <span className="pb-1 text-sm text-muted-foreground">
                                            {selectedDate.toLocaleDateString("en-US", {
                                              month: "long",
                                              year: "numeric",
                                              weekday: "long",
                                            })}
                                          </span>
                                        </div>

                                        <p className="mt-5 text-center text-xs font-semibold tracking-widest underline underline-offset-4">
                                          ON-SITE
                                        </p>
                                        <div className="mt-3 flex flex-1 items-center justify-center gap-3 px-2 sm:gap-8">
                                          {onSiteRooms.map((room) => {
                                            const count = reservedCount(room.id);
                                            const isSelected = calViewFacilityId === room.id;
                                            return (
                                              <button
                                                key={room.id}
                                                type="button"
                                                onClick={() => setCalViewFacilityId(room.id)}
                                                aria-pressed={isSelected}
                                                title={`${room.name} — ${count > 0 ? `${count} booked` : "free"}`}
                                                className={cn(
                                                  "flex flex-col items-center gap-1.5 rounded-xl p-2 transition-colors hover:bg-muted/60",
                                                  isSelected &&
                                                    "bg-muted/60 ring-2 ring-inset ring-primary",
                                                )}
                                              >
                                                <span className="relative">
                                                  <span
                                                    className={cn(
                                                      count > 0
                                                        ? "text-green-700"
                                                        : "text-foreground",
                                                    )}
                                                  >
                                                    <DoorIcon highlighted={count > 0} />
                                                  </span>
                                                  {count > 0 && (
                                                    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.6rem] font-semibold text-white">
                                                      {count}
                                                    </span>
                                                  )}
                                                </span>
                                                <span className="text-xs font-semibold tracking-wide">
                                                  {room.name.toUpperCase()}
                                                </span>
                                                <span className="text-[0.65rem] text-muted-foreground">
                                                  {count > 0 ? `${count} booked` : "Free"}
                                                </span>
                                              </button>
                                            );
                                          })}
                                        </div>

                                        <div className="my-4 border-t border-border/70" />

                                        <p className="text-center text-xs font-semibold tracking-widest underline underline-offset-4">
                                          VIRTUAL
                                        </p>
                                        {virtualRoom && (
                                          <div className="mt-3 flex justify-center">
                                            <button
                                              type="button"
                                              onClick={() => setCalViewFacilityId(virtualRoom.id)}
                                              aria-pressed={calViewFacilityId === virtualRoom.id}
                                              title={`${virtualRoom.name} — ${virtualCount > 0 ? `${virtualCount} booked` : "free"}`}
                                              className={cn(
                                                "flex flex-col items-center gap-1.5 rounded-xl p-2 transition-colors hover:bg-muted/60",
                                                calViewFacilityId === virtualRoom.id &&
                                                  "bg-muted/60 ring-2 ring-inset ring-primary",
                                              )}
                                            >
                                              <span className="relative">
                                                <span
                                                  className={cn(
                                                    "flex h-16 w-24 items-center justify-center rounded-lg border-2",
                                                    virtualCount > 0
                                                      ? "border-green-700 bg-green-700/15 text-green-700"
                                                      : "border-foreground/70 text-foreground",
                                                  )}
                                                >
                                                  <Video className="h-8 w-8" />
                                                </span>
                                                {virtualCount > 0 && (
                                                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.6rem] font-semibold text-white">
                                                    {virtualCount}
                                                  </span>
                                                )}
                                              </span>
                                              <span className="text-xs font-semibold tracking-wide">
                                                ONLINE INTERVIEW
                                              </span>
                                              <span className="text-[0.65rem] text-muted-foreground">
                                                {virtualCount > 0
                                                  ? `${virtualCount} booked`
                                                  : "Free"}
                                              </span>
                                            </button>
                                          </div>
                                        )}
                                      </CardContent>
                                    </Card>

                                    {/* ?? Daily schedule preview for the selected room/meeting */}
                                    <Card className="rounded-xl border-border/70 shadow-sm">
                                      <CardContent className="p-5">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                          <p className="flex items-center gap-1.5 text-xs font-semibold tracking-widest text-muted-foreground">
                                            <CalendarDays className="h-3.5 w-3.5" /> DAILY SCHEDULE
                                            PREVIEW
                                          </p>
                                          <span className="rounded-full border border-destructive/40 bg-destructive/10 px-2.5 py-0.5 text-[0.65rem] font-semibold text-destructive">
                                            {calViewPreview.slotsAvailable} slots available
                                          </span>
                                        </div>
                                        <div className="mt-3">
                                          <Select
                                            value={calViewFacilityId}
                                            onValueChange={setCalViewFacilityId}
                                          >
                                            <SelectTrigger className="font-display text-lg font-semibold">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="all">
                                                Show all — All rooms
                                              </SelectItem>
                                              {facilities.map((f) => (
                                                <SelectItem key={f.id} value={f.id}>
                                                  {f.name} · {f.type}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                          <p className="mt-1 text-xs text-muted-foreground">
                                            {calViewPreview.room.location} ·{" "}
                                            {selectedDate.toLocaleDateString("en-US", {
                                              month: "long",
                                              day: "numeric",
                                              year: "numeric",
                                            })}
                                          </p>
                                        </div>
                                        <div className="mt-3 flex-1 space-y-2">
                                          {calViewPreview.mapped.map((i) => (
                                            <button
                                              type="button"
                                              key={i.id}
                                              title={`${i.applicant} · ${i.position} · ${i.interviewer} · ${i.status} — click to find them in the Pipeline Overview`}
                                              onClick={() => selectInPipeline(i.applicant)}
                                              className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-border/70 bg-muted/20 px-3 py-2.5 text-left transition-colors hover:border-primary/50 hover:bg-primary/5"
                                            >
                                              <span className="shrink-0 text-xs font-medium">
                                                {calViewPreview.rangeLabel(i.time)}
                                              </span>
                                              <span className="truncate text-right text-xs font-semibold">
                                                {i.applicant}
                                                {calViewPreview.showAll && (
                                                  <span className="ml-1.5 font-normal text-muted-foreground">
                                                    · {facilityOfInterview(i)?.name ?? "No room"}
                                                  </span>
                                                )}
                                              </span>
                                            </button>
                                          ))}
                                          {calViewPreview.mapped.length === 0 && (
                                            <p className="rounded-lg border border-dashed border-border p-5 text-center text-xs text-muted-foreground">
                                              No interviews booked — the whole day is free.
                                            </p>
                                          )}
                                          {calViewPreview.unassignedOnSite.length > 0 && (
                                            <p className="text-[0.7rem] text-muted-foreground">
                                              + {calViewPreview.unassignedOnSite.length} on-site
                                              interview(s) without a reserved room are not listed
                                              here.
                                            </p>
                                          )}
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </div>
                                );
                              })()}
                          </DialogContent>
                        </Dialog>

                        {rescheduling && (
                          <div className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-xs text-warning-foreground">
                            <Repeat2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            <span>
                              Rescheduling <b>{rescheduling.applicant}</b> from {rescheduling.date}{" "}
                              · {rescheduling.time} — confirm to update their existing interview.
                            </span>
                          </div>
                        )}

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label className="text-sm">Filter by Department</Label>
                            <Select
                              value={scheduleDept}
                              onValueChange={(v) => {
                                setScheduleDept(v);
                                setSchedulePosition("all");
                                setSchedule((p) => ({ ...p, applicant: "" }));
                                setRescheduling(null);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="All departments" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All departments</SelectItem>
                                {displayDepartments.map((d) => (
                                  <SelectItem key={d.code} value={d.name}>
                                    <span className="flex items-center gap-2">
                                      {d.name}
                                      {deptHasPosting(d.name) && (
                                        <span className="rounded bg-success/15 px-1.5 py-0.5 text-[0.6rem] font-semibold text-success">
                                          Posting
                                        </span>
                                      )}
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">Position</Label>
                            <Select
                              value={schedulePosition}
                              onValueChange={(v) => {
                                setSchedulePosition(v);
                                setSchedule((p) => ({ ...p, applicant: "" }));
                                setRescheduling(null);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="All positions" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All positions</SelectItem>
                                {displayPositions
                                  .filter(
                                    (p) => scheduleDept === "all" || p.department === scheduleDept,
                                  )
                                  .map((p) => (
                                    <SelectItem key={p.id} value={p.title}>
                                      <span className="flex items-center gap-2">
                                        {p.title}
                                        {activeJobTitles.has(p.title) && (
                                          <span className="rounded bg-success/15 px-1.5 py-0.5 text-[0.6rem] font-semibold text-success">
                                            Posting
                                          </span>
                                        )}
                                      </span>
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm">
                            <span className="text-primary">1.</span> Select Applicant
                          </Label>
                          <Select
                            value={schedule.applicant}
                            onValueChange={(v) => {
                              setSchedule({ ...schedule, applicant: v });
                              if (v !== rescheduling?.applicant) setRescheduling(null);
                              if (v) setBookingFocus(true);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select applicant" />
                            </SelectTrigger>
                            <SelectContent>
                              {scheduleApplicants.length === 0 && (
                                <div className="px-2 py-3 text-xs text-muted-foreground">
                                  No accepted applicants available in this department.
                                </div>
                              )}
                              {scheduleApplicants.map((a) => (
                                <SelectItem key={a.id} value={a.name}>
                                  {a.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm">
                            <span className="text-primary">2.</span> Interview Date
                          </Label>
                          <Input
                            type="date"
                            value={schedule.date}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (!val) return;
                              setSchedule((p) => ({ ...p, date: val }));
                              // Sync calendar view to the selected date
                              const d = new Date(val);
                              if (!isNaN(d.getTime())) {
                                setViewMonth(new Date(d.getFullYear(), d.getMonth(), 1));
                              }
                            }}
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <Label className="text-sm">
                              <span className="text-primary">3.</span> Select Time Slot
                            </Label>
                            <span className="text-[0.7rem] text-muted-foreground">
                              {slotSettings.slotCount} slots — {capacityPerSlot} applicants each
                            </span>
                          </div>
                          <Select
                            value={schedule.time}
                            onValueChange={(v) => setSchedule((p) => ({ ...p, time: v }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a time slot" />
                            </SelectTrigger>
                            <SelectContent>
                              {slotsForSelected.map((t) => {
                                const used = bookedInSlot(schedule.date, t);
                                const remaining = capacityPerSlot - used;
                                const full = remaining <= 0;
                                // Same room/meeting cannot take two interviews in
                                // one slot, even when the slot has capacity.
                                const roomBusy = facilityBookedInSlot(
                                  schedule.facilityId,
                                  schedule.date,
                                  t,
                                );
                                return (
                                  <SelectItem key={t} value={t} disabled={full || roomBusy}>
                                    {t}
                                    <span className="ml-1.5 text-xs text-muted-foreground">
                                      {roomBusy
                                        ? "(facility already booked)"
                                        : full
                                          ? "(full)"
                                          : `(${remaining} left)`}
                                    </span>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label className="text-sm">
                              <span className="text-primary">4.</span> Interview Details
                            </Label>
                            <Select
                              value={schedule.mode}
                              onValueChange={(v) => setSchedule({ ...schedule, mode: v })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="On-site">On-site</SelectItem>
                                <SelectItem value="Virtual">Virtual</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">
                              <span className="text-primary">5.</span> Interviewer
                            </Label>
                            <Select
                              value={schedule.interviewer}
                              onValueChange={(v) => setSchedule({ ...schedule, interviewer: v })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select interviewer" />
                              </SelectTrigger>
                              <SelectContent>
                                {scheduleInterviewers.map((s) => (
                                  <SelectItem key={s.id} value={s.name}>
                                    {s.name} — {s.role}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">
                              <span className="text-primary">6.</span> Request Facility
                            </Label>
                            <Select
                              value={schedule.facilityId}
                              onValueChange={(v) => setSchedule({ ...schedule, facilityId: v })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select facility" />
                              </SelectTrigger>
                              <SelectContent>
                                {facilities
                                  .filter((f) => f.type === schedule.mode)
                                  .map((f) => (
                                    <SelectItem key={f.id} value={f.id}>
                                      {f.name} · {f.type} — cap. {f.capacity}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 space-y-2 border-t border-border/30 pt-2">
                        <Button
                          className="w-full"
                          size="lg"
                          disabled={bookingMissingFields.length > 0}
                          onClick={confirmSchedule}
                          title={
                            bookingMissingFields.length > 0
                              ? `Please fill in: ${bookingMissingFields.join(", ")}`
                              : undefined
                          }
                        >
                          <Mail className="mr-2 h-4 w-4" /> Request Facility to Scheduled
                        </Button>
                        {bookingMissingFields.length > 0 && (
                          <p className="text-center text-xs text-muted-foreground">
                            Fill in:{" "}
                            <span className="font-medium">{bookingMissingFields.join(", ")}</span>{" "}
                            to enable.
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Merged full-calendar + day detail — always visible (Image 1 + Image 2).
              Left: calendar on top with PLACES stretched horizontally below.
              Right: DAILY SCHEDULE PREVIEW. The day detail shows immediately
              for the selected date — no click needed. */}
              <Card ref={roomAvailabilityRef} className="scroll-mt-4 border-border/70">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
                        <CalendarDays className="h-5 w-5 text-primary" />
                        Room Availability & Daily Schedule
                      </h2>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {bookingFocus ? (
                        <Button size="sm" variant="outline" onClick={() => setBookingFocus(false)}>
                          <ChevronLeft className="mr-2 h-4 w-4" /> Back to overview
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => setBookingFocus(true)}>
                          <CalendarPlus className="mr-2 h-4 w-4" /> Book an Interview
                        </Button>
                      )}
                    </div>
                  </div>

                  {(() => {
                    const [yy, mm, dd] = calViewDate.split("-").map(Number);
                    const selectedDate = new Date(yy ?? 1970, (mm ?? 1) - 1, dd ?? 1);
                    const onSiteRooms = facilities.filter((f) => f.type === "On-site");
                    const virtualRoom = facilities.find((f) => f.type === "Virtual") ?? null;
                    const reservedCount = (id: string) =>
                      calViewDayInterviews.filter((i) => facilityOfInterview(i)?.id === id).length;
                    const virtualCount = virtualRoom ? reservedCount(virtualRoom.id) : 0;
                    return (
                      <div className="mt-4 grid items-stretch gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
                        {/* LEFT — calendar on top, PLACES stretched horizontally below.
                        No h-full here: the grid's items-stretch sizes this column,
                        and a percentage height would cancel the stretch. */}
                        <div className="flex min-h-0 min-w-0 flex-col space-y-4">
                          <div className="min-w-0 rounded-xl border border-border/70 bg-card p-4 shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button
                                    type="button"
                                    className="inline-flex items-center gap-2 rounded-lg px-2 py-1 font-display text-lg font-semibold transition-colors hover:bg-muted"
                                  >
                                    {calViewMonth.toLocaleDateString("en-US", {
                                      month: "long",
                                      year: "numeric",
                                    })}
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent align="start" className="w-64 space-y-3 p-3">
                                  <div className="space-y-1.5">
                                    <Label className="text-xs">Month</Label>
                                    <Select
                                      value={String(calViewMonth.getMonth())}
                                      onValueChange={(v) =>
                                        setCalViewMonth(
                                          (mo) => new Date(mo.getFullYear(), Number(v), 1),
                                        )
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {monthNames.map((name, i) => (
                                          <SelectItem key={name} value={String(i)}>
                                            {name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label className="text-xs">Year</Label>
                                    <Select
                                      value={String(calViewMonth.getFullYear())}
                                      onValueChange={(v) =>
                                        setCalViewMonth(
                                          (mo) => new Date(Number(v), mo.getMonth(), 1),
                                        )
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {yearOptions.map((y) => (
                                          <SelectItem key={y} value={String(y)}>
                                            {y}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </PopoverContent>
                              </Popover>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const today = new Date();
                                    setCalViewMonth(
                                      new Date(today.getFullYear(), today.getMonth(), 1),
                                    );
                                    setCalViewDate(isoOf(today));
                                    setSchedule((s) => ({ ...s, date: isoOf(today) }));
                                    setViewMonth(
                                      new Date(today.getFullYear(), today.getMonth(), 1),
                                    );
                                  }}
                                >
                                  Today
                                </Button>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  aria-label="Previous month"
                                  onClick={() =>
                                    setCalViewMonth(
                                      (mo) => new Date(mo.getFullYear(), mo.getMonth() - 1, 1),
                                    )
                                  }
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  aria-label="Next month"
                                  onClick={() =>
                                    setCalViewMonth(
                                      (mo) => new Date(mo.getFullYear(), mo.getMonth() + 1, 1),
                                    )
                                  }
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  aria-label="Slot settings"
                                  title="Slot settings"
                                  onClick={() => setSlotDialogOpen(true)}
                                >
                                  <Settings2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="mt-2 grid grid-cols-7 text-center text-[0.65rem] font-semibold tracking-wide text-muted-foreground">
                              {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
                                <span key={d} className="py-1.5">
                                  {d}
                                </span>
                              ))}
                            </div>

                            <div className="grid grid-cols-7 grid-rows-6 overflow-hidden rounded-lg border border-border">
                              {calViewCells.map((cell) => {
                                const iso = isoOf(cell.date);
                                const count = interviews.filter(
                                  (i) => i.date === iso && i.status !== "Cancelled",
                                ).length;
                                const dayName = DAY_NAMES[cell.date.getDay()]!;
                                const schedulable = schedulableDays.includes(dayName);
                                const free = count === 0 && schedulable;
                                const full = count > 0 && schedulable && count >= capacityPerSlot;
                                const selected = calViewDate === iso;
                                const isToday = iso === TODAY_ISO;
                                return (
                                  <button
                                    key={iso}
                                    type="button"
                                    aria-label={cell.date.toDateString()}
                                    aria-pressed={selected}
                                    onClick={() => {
                                      setCalViewDate(iso);
                                      setSchedule((s) => ({ ...s, date: iso }));
                                      setViewMonth(
                                        new Date(cell.date.getFullYear(), cell.date.getMonth(), 1),
                                      );
                                    }}
                                    className={cn(
                                      "relative min-h-[4.5rem] cursor-pointer border-b border-r border-border/70 text-sm transition-colors hover:z-10 last:border-r-0",
                                      free &&
                                        !selected &&
                                        "bg-card font-normal text-foreground hover:bg-muted/50 hover:shadow-sm",
                                      full &&
                                        !selected &&
                                        "bg-destructive/25 font-semibold text-destructive hover:bg-destructive/35 hover:shadow-sm",
                                      isToday &&
                                        !selected &&
                                        "bg-gold/30 ring-1 ring-inset ring-gold hover:bg-gold/40 hover:shadow-sm",
                                      !selected &&
                                        !free &&
                                        !full &&
                                        "hover:bg-muted/50 hover:shadow-sm",
                                      count === 0 &&
                                        !schedulable &&
                                        (cell.inMonth
                                          ? "text-muted-foreground/40"
                                          : "opacity-40 text-muted-foreground/40"),
                                      count > 0 &&
                                        !selected &&
                                        !full &&
                                        "bg-[oklch(0.427_0.166_22.5)]/[0.08] font-semibold text-[oklch(0.427_0.166_22.5)] hover:bg-[oklch(0.427_0.166_22.5)]/[0.15] hover:shadow-sm",
                                      selected &&
                                        free &&
                                        "bg-card font-semibold text-foreground ring-2 ring-inset ring-primary",
                                      selected && full && "bg-red-700 font-semibold text-white",
                                      selected &&
                                        !free &&
                                        !full &&
                                        "bg-primary font-semibold text-primary-foreground",
                                    )}
                                  >
                                    {cell.date.getDate()}
                                    {count > 0 && (
                                      <span
                                        className={cn(
                                          "absolute -top-1 -right-1 z-10 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[0.6rem] font-semibold text-white",
                                          selected && full
                                            ? "bg-red-900"
                                            : selected && free
                                              ? "bg-foreground"
                                              : "bg-[oklch(0.427_0.166_22.5)]",
                                        )}
                                      >
                                        {count}
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {bookingFocus && (
                            /* DAILY SCHEDULE PREVIEW — booking-mode copy under the calendar
                         (shared state with the right-column copy above PLACES).
                         flex-1 fills the stretched left column so this card's bottom
                         edge always lines up with the Book an Interview card. */
                            <Card className="flex min-h-0 flex-1 flex-col rounded-xl border-border/70 shadow-sm">
                              <CardContent className="flex min-h-0 flex-1 flex-col p-5">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <p className="flex items-center gap-1.5 text-xs font-semibold tracking-widest text-muted-foreground">
                                    <CalendarDays className="h-3.5 w-3.5" /> DAILY SCHEDULE PREVIEW
                                  </p>
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="rounded-full border border-destructive/40 bg-destructive/10 px-2.5 py-0.5 text-[0.65rem] font-semibold text-destructive">
                                      {calViewPreview.slotsAvailable} slots available
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-6 cursor-pointer gap-1 px-2 text-[0.65rem]"
                                      title={`Show every applicant scheduled on ${calViewDate} in the Pipeline Overview`}
                                      onClick={() => showScheduledInPipeline(calViewDate)}
                                    >
                                      <Eye className="h-3 w-3" /> View list in Pipeline
                                    </Button>
                                  </div>
                                </div>
                                <div className="mt-3">
                                  <Select
                                    value={calViewFacilityId}
                                    onValueChange={setCalViewFacilityId}
                                  >
                                    <SelectTrigger className="font-display text-lg font-semibold">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="all">Show all — All rooms</SelectItem>
                                      {facilities.map((f) => (
                                        <SelectItem key={f.id} value={f.id}>
                                          {f.name} · {f.type}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {calViewPreview.room.location} ·{" "}
                                    {selectedDate.toLocaleDateString("en-US", {
                                      month: "long",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </p>
                                </div>
                                {/* Flexible list: fills the stretched card (flex-1) so the card
                              bottom stays aligned with Book an Interview even with few
                              items; caps + scrolls once it exceeds ~5 rows. */}
                                <div className="mt-3 flex max-h-72 min-h-[10rem] flex-1 flex-col space-y-2 overflow-y-auto pr-1">
                                  {calViewPreview.mapped.map((i) => (
                                    <button
                                      type="button"
                                      key={i.id}
                                      title={`${i.applicant} · ${i.position} · ${i.interviewer} · ${i.status} — click to find them in the Pipeline Overview`}
                                      onClick={() => selectInPipeline(i.applicant)}
                                      className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-border/70 bg-muted/20 px-3 py-2.5 text-left transition-colors hover:border-primary/50 hover:bg-primary/5"
                                    >
                                      <span className="shrink-0 text-xs font-medium">
                                        {calViewPreview.rangeLabel(i.time)}
                                      </span>
                                      <span className="truncate text-right text-xs font-semibold">
                                        {i.applicant}
                                        {calViewPreview.showAll && (
                                          <span className="ml-1.5 font-normal text-muted-foreground">
                                            · {facilityOfInterview(i)?.name ?? "No room"}
                                          </span>
                                        )}
                                      </span>
                                    </button>
                                  ))}
                                  {calViewPreview.mapped.length === 0 && (
                                    <p className="flex w-full flex-1 items-center justify-center rounded-lg border border-dashed border-border p-5 text-center text-xs text-muted-foreground">
                                      No interviews booked — the whole day is free.
                                    </p>
                                  )}
                                  {calViewPreview.unassignedOnSite.length > 0 && (
                                    <p className="text-[0.7rem] text-muted-foreground">
                                      + {calViewPreview.unassignedOnSite.length} on-site
                                      interview(s) without a reserved room are not listed here.
                                    </p>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* PLACES — compact strip stretched horizontally below the calendar.
                          Content height only (same full column width); the taller
                          calendar cells above take the freed space. */}
                          <Card
                            className={cn(
                              "flex flex-col rounded-xl border-border/70 shadow-sm",
                              bookingFocus && "hidden",
                            )}
                          >
                            <CardContent className="flex flex-col px-6 py-4">
                              <div className="flex flex-wrap items-end justify-between gap-2">
                                <div>
                                  <p className="text-xs font-semibold tracking-widest">PLACES</p>
                                  <div className="mt-1 flex items-end gap-2">
                                    <span className="font-display text-3xl font-bold leading-none">
                                      {selectedDate.getDate()}
                                    </span>
                                    <span className="pb-1 text-sm text-muted-foreground">
                                      {selectedDate.toLocaleDateString("en-US", {
                                        month: "long",
                                        year: "numeric",
                                        weekday: "long",
                                      })}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-[0.7rem] text-muted-foreground">
                                  Select a room to preview its schedule
                                </p>
                              </div>

                              <div className="mt-2 flex flex-col justify-center gap-4 py-2 sm:flex-row sm:items-stretch">
                                <div className="flex min-w-0 flex-1 flex-col justify-center">
                                  <p className="text-center text-xs font-semibold tracking-widest underline underline-offset-4">
                                    ON-SITE
                                  </p>
                                  <div className="mt-2 flex items-start justify-center gap-2 sm:gap-6">
                                    {onSiteRooms.map((room) => {
                                      const count = reservedCount(room.id);
                                      const isSelected = calViewFacilityId === room.id;
                                      return (
                                        <button
                                          key={room.id}
                                          type="button"
                                          onClick={() => setCalViewFacilityId(room.id)}
                                          aria-pressed={isSelected}
                                          title={`${room.name} — ${count > 0 ? `${count} booked` : "free"}`}
                                          className={cn(
                                            "flex flex-col items-center gap-1 rounded-xl p-1.5 transition-colors hover:bg-muted/60",
                                            isSelected &&
                                              "bg-muted/60 ring-2 ring-inset ring-primary",
                                          )}
                                        >
                                          <span className="relative">
                                            <span
                                              className={cn(
                                                count > 0 ? "text-green-700" : "text-foreground",
                                              )}
                                            >
                                              <DoorIcon
                                                highlighted={count > 0}
                                                className="h-12 w-9"
                                              />
                                            </span>
                                            {count > 0 && (
                                              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.6rem] font-semibold text-white">
                                                {count}
                                              </span>
                                            )}
                                          </span>
                                          <span className="text-xs font-semibold tracking-wide">
                                            {room.name.toUpperCase()}
                                          </span>
                                          <span className="text-[0.65rem] text-muted-foreground">
                                            {count > 0 ? `${count} booked` : "Free"}
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                <div
                                  className="w-px self-stretch bg-border/70 max-sm:hidden"
                                  aria-hidden="true"
                                />
                                <div
                                  className="border-t border-border/70 sm:hidden"
                                  aria-hidden="true"
                                />

                                <div className="flex min-w-0 flex-col justify-center sm:w-56 sm:shrink-0">
                                  <p className="text-center text-xs font-semibold tracking-widest underline underline-offset-4">
                                    VIRTUAL
                                  </p>
                                  {virtualRoom && (
                                    <div className="mt-2 flex items-center justify-center">
                                      <button
                                        type="button"
                                        onClick={() => setCalViewFacilityId(virtualRoom.id)}
                                        aria-pressed={calViewFacilityId === virtualRoom.id}
                                        title={`${virtualRoom.name} — ${virtualCount > 0 ? `${virtualCount} booked` : "free"}`}
                                        className={cn(
                                          "flex flex-col items-center gap-1 rounded-xl p-1.5 transition-colors hover:bg-muted/60",
                                          calViewFacilityId === virtualRoom.id &&
                                            "bg-muted/60 ring-2 ring-inset ring-primary",
                                        )}
                                      >
                                        <span className="relative">
                                          <span
                                            className={cn(
                                              "flex h-12 w-20 items-center justify-center rounded-lg border-2",
                                              virtualCount > 0
                                                ? "border-green-700 bg-green-700/15 text-green-700"
                                                : "border-foreground/70 text-foreground",
                                            )}
                                          >
                                            <Video className="h-6 w-6" />
                                          </span>
                                          {virtualCount > 0 && (
                                            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.6rem] font-semibold text-white">
                                              {virtualCount}
                                            </span>
                                          )}
                                        </span>
                                        <span className="text-xs font-semibold tracking-wide">
                                          ONLINE INTERVIEW
                                        </span>
                                        <span className="text-[0.65rem] text-muted-foreground">
                                          {virtualCount > 0 ? `${virtualCount} booked` : "Free"}
                                        </span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        {bookingFocus && (
                          /* BOOK AN INTERVIEW — booking-mode copy in the preview slot.
                       Shared state with the top card (its dialogs stay mounted
                       there); keep the two copies in sync when editing.
                       No h-full: self-stretch (with auto height) is what makes
                       this card fill the row so its bottom edge aligns with the
                       DAILY SCHEDULE PREVIEW card. */
                          <Card className="flex min-h-0 flex-col self-stretch rounded-xl border-border/70 shadow-sm">
                            <CardContent className="flex min-h-0 flex-1 flex-col p-4">
                              <div className="flex items-start gap-2.5">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center text-primary">
                                  <CalendarClock className="h-5 w-5" />
                                </span>
                                <div className="min-w-0">
                                  <h2 className="font-display text-xl font-semibold">
                                    Book an Interview
                                  </h2>
                                  <p className="text-xs text-muted-foreground">
                                    Fill in the details to schedule an interview and send an invite.
                                  </p>
                                </div>
                              </div>

                              <div className="mt-3 flex flex-1 flex-col">
                                <div className="flex-1 space-y-2">
                                  {rescheduling && (
                                    <div className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-xs text-warning-foreground">
                                      <Repeat2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                      <span>
                                        Rescheduling <b>{rescheduling.applicant}</b> from{" "}
                                        {rescheduling.date} · {rescheduling.time} — confirm to
                                        update their existing interview.
                                      </span>
                                    </div>
                                  )}

                                  <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="space-y-2">
                                      <Label className="text-sm">Filter by Department</Label>
                                      <Select
                                        value={scheduleDept}
                                        onValueChange={(v) => {
                                          setScheduleDept(v);
                                          setSchedulePosition("all");
                                          setSchedule((p) => ({ ...p, applicant: "" }));
                                          setRescheduling(null);
                                        }}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="All departments" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="all">All departments</SelectItem>
                                          {displayDepartments.map((d) => (
                                            <SelectItem key={d.code} value={d.name}>
                                              <span className="flex items-center gap-2">
                                                {d.name}
                                                {deptHasPosting(d.name) && (
                                                  <span className="rounded bg-success/15 px-1.5 py-0.5 text-[0.6rem] font-semibold text-success">
                                                    Posting
                                                  </span>
                                                )}
                                              </span>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-sm">Position</Label>
                                      <Select
                                        value={schedulePosition}
                                        onValueChange={(v) => {
                                          setSchedulePosition(v);
                                          setSchedule((p) => ({ ...p, applicant: "" }));
                                          setRescheduling(null);
                                        }}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="All positions" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="all">All positions</SelectItem>
                                          {displayPositions
                                            .filter(
                                              (p) =>
                                                scheduleDept === "all" ||
                                                p.department === scheduleDept,
                                            )
                                            .map((p) => (
                                              <SelectItem key={p.id} value={p.title}>
                                                <span className="flex items-center gap-2">
                                                  {p.title}
                                                  {activeJobTitles.has(p.title) && (
                                                    <span className="rounded bg-success/15 px-1.5 py-0.5 text-[0.6rem] font-semibold text-success">
                                                      Posting
                                                    </span>
                                                  )}
                                                </span>
                                              </SelectItem>
                                            ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <Label className="text-sm">
                                      <span className="text-primary">1.</span> Select Applicant
                                    </Label>
                                    <Select
                                      value={schedule.applicant}
                                      onValueChange={(v) => {
                                        setSchedule({ ...schedule, applicant: v });
                                        if (v !== rescheduling?.applicant) setRescheduling(null);
                                        if (v) setBookingFocus(true);
                                      }}
                                    >
                                      <SelectTrigger ref={bookSelectRef}>
                                        <SelectValue placeholder="Select applicant" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {scheduleApplicants.length === 0 && (
                                          <div className="px-2 py-3 text-xs text-muted-foreground">
                                            No accepted applicants available in this department.
                                          </div>
                                        )}
                                        {scheduleApplicants.map((a) => (
                                          <SelectItem key={a.id} value={a.name}>
                                            {a.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-2">
                                    <Label className="text-sm">
                                      <span className="text-primary">2.</span> Interview Date
                                    </Label>
                                    <Input
                                      type="date"
                                      value={schedule.date}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        if (!val) return;
                                        setSchedule((p) => ({ ...p, date: val }));
                                        // Sync calendar view to the selected date
                                        const d = new Date(val);
                                        if (!isNaN(d.getTime())) {
                                          setViewMonth(new Date(d.getFullYear(), d.getMonth(), 1));
                                        }
                                      }}
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <Label className="text-sm">
                                        <span className="text-primary">3.</span> Select Time Slot
                                      </Label>
                                      <span className="text-[0.7rem] text-muted-foreground">
                                        {slotSettings.slotCount} slots — {capacityPerSlot}{" "}
                                        applicants each
                                      </span>
                                    </div>
                                    <Select
                                      value={schedule.time}
                                      onValueChange={(v) => setSchedule((p) => ({ ...p, time: v }))}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a time slot" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {slotsForSelected.map((t) => {
                                          const used = bookedInSlot(schedule.date, t);
                                          const remaining = capacityPerSlot - used;
                                          const full = remaining <= 0;
                                          // Same room/meeting cannot take two interviews
                                          // in one slot, even when the slot has capacity.
                                          const roomBusy = facilityBookedInSlot(
                                            schedule.facilityId,
                                            schedule.date,
                                            t,
                                          );
                                          return (
                                            <SelectItem
                                              key={t}
                                              value={t}
                                              disabled={full || roomBusy}
                                            >
                                              {t}
                                              <span className="ml-1.5 text-xs text-muted-foreground">
                                                {roomBusy
                                                  ? "(facility already booked)"
                                                  : full
                                                    ? "(full)"
                                                    : `(${remaining} left)`}
                                              </span>
                                            </SelectItem>
                                          );
                                        })}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-3">
                                    <div className="space-y-2">
                                      <Label className="text-sm">
                                        <span className="text-primary">4.</span> Interview Details
                                      </Label>
                                      <Select
                                        value={schedule.mode}
                                        onValueChange={(v) => setSchedule({ ...schedule, mode: v })}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="On-site">On-site</SelectItem>
                                          <SelectItem value="Virtual">Virtual</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-sm">
                                        <span className="text-primary">5.</span> Interviewer
                                      </Label>
                                      <Select
                                        value={schedule.interviewer}
                                        onValueChange={(v) =>
                                          setSchedule({ ...schedule, interviewer: v })
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select interviewer" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {scheduleInterviewers.map((s) => (
                                            <SelectItem key={s.id} value={s.name}>
                                              {s.name} — {s.role}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-sm">
                                        <span className="text-primary">6.</span> Request Facility
                                      </Label>
                                      <Select
                                        value={schedule.facilityId}
                                        onValueChange={(v) =>
                                          setSchedule({ ...schedule, facilityId: v })
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select facility" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {facilities
                                            .filter((f) => f.type === schedule.mode)
                                            .map((f) => (
                                              <SelectItem key={f.id} value={f.id}>
                                                {f.name} · {f.type} — cap. {f.capacity}
                                              </SelectItem>
                                            ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-2 space-y-2 border-t border-border/30 pt-2">
                                  <Button
                                    className="w-full"
                                    size="lg"
                                    disabled={bookingMissingFields.length > 0}
                                    onClick={confirmSchedule}
                                    title={
                                      bookingMissingFields.length > 0
                                        ? `Please fill in: ${bookingMissingFields.join(", ")}`
                                        : undefined
                                    }
                                  >
                                    <Mail className="mr-2 h-4 w-4" /> Request Facility to Scheduled
                                  </Button>
                                  {bookingMissingFields.length > 0 && (
                                    <p className="text-center text-xs text-muted-foreground">
                                      Fill in:{" "}
                                      <span className="font-medium">
                                        {bookingMissingFields.join(", ")}
                                      </span>{" "}
                                      to enable.
                                    </p>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* RIGHT — DAILY SCHEDULE PREVIEW in normal mode;
                        hidden while bookingFocus (a copy sits under the calendar
                        and Book an Interview takes this slot) */}
                        <Card
                          className={cn(
                            "flex min-h-0 flex-col self-stretch rounded-xl border-border/70 shadow-sm",
                            bookingFocus && "hidden",
                          )}
                        >
                          <CardContent className="flex min-h-0 flex-1 flex-col p-5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="flex items-center gap-1.5 text-xs font-semibold tracking-widest text-muted-foreground">
                                <CalendarDays className="h-3.5 w-3.5" /> DAILY SCHEDULE PREVIEW
                              </p>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="rounded-full border border-destructive/40 bg-destructive/10 px-2.5 py-0.5 text-[0.65rem] font-semibold text-destructive">
                                  {calViewPreview.slotsAvailable} slots available
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 cursor-pointer gap-1 px-2 text-[0.65rem]"
                                  title={`Show every applicant scheduled on ${calViewDate} in the Pipeline Overview`}
                                  onClick={() => showScheduledInPipeline(calViewDate)}
                                >
                                  <Eye className="h-3 w-3" /> View list in Pipeline
                                </Button>
                              </div>
                            </div>
                            <div className="mt-3">
                              <Select
                                value={calViewFacilityId}
                                onValueChange={setCalViewFacilityId}
                              >
                                <SelectTrigger className="font-display text-lg font-semibold">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">Show all — All rooms</SelectItem>
                                  {facilities.map((f) => (
                                    <SelectItem key={f.id} value={f.id}>
                                      {f.name} · {f.type}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {calViewPreview.room.location} ·{" "}
                                {selectedDate.toLocaleDateString("en-US", {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                            <div className="mt-3 flex min-h-0 flex-1 flex-col space-y-2">
                              {calViewPreview.mapped.map((i) => (
                                <button
                                  type="button"
                                  key={i.id}
                                  title={`${i.applicant} · ${i.position} · ${i.interviewer} · ${i.status} — click to find them in the Pipeline Overview`}
                                  onClick={() => selectInPipeline(i.applicant)}
                                  className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-border/70 bg-muted/20 px-3 py-2.5 text-left transition-colors hover:border-primary/50 hover:bg-primary/5"
                                >
                                  <span className="shrink-0 text-xs font-medium">
                                    {calViewPreview.rangeLabel(i.time)}
                                  </span>
                                  <span className="truncate text-right text-xs font-semibold">
                                    {i.applicant}
                                    {calViewPreview.showAll && (
                                      <span className="ml-1.5 font-normal text-muted-foreground">
                                        · {facilityOfInterview(i)?.name ?? "No room"}
                                      </span>
                                    )}
                                  </span>
                                </button>
                              ))}
                              {calViewPreview.mapped.length === 0 && (
                                <p className="flex w-full flex-1 items-center justify-center rounded-lg border border-dashed border-border p-5 text-center text-xs text-muted-foreground">
                                  No interviews booked — the whole day is free.
                                </p>
                              )}
                              {calViewPreview.unassignedOnSite.length > 0 && (
                                <p className="text-[0.7rem] text-muted-foreground">
                                  + {calViewPreview.unassignedOnSite.length} on-site interview(s)
                                  without a reserved room are not listed here.
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Pipeline Overview list — schedule + pipeline actions live here */}
              <Card ref={pipelineListRef} className="scroll-mt-4 border-border/70">
                <CardContent className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
                        <ClipboardCheck className="h-5 w-5 text-primary" />
                        Pipeline Overview
                      </h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Search applicant—"
                          value={pipelineSearch}
                          onChange={(e) => setPipelineSearch(e.target.value)}
                          className="w-52 pl-8"
                        />
                      </div>
                      <Select value={pipelinePosition} onValueChange={setPipelinePosition}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="All positions" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All positions</SelectItem>
                          {displayPositions.map((p) => (
                            <SelectItem key={p.id} value={p.title}>
                              {p.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={pipelineStage} onValueChange={setPipelineStage}>
                        <SelectTrigger className="w-44">
                          <SelectValue placeholder="All stages" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All stages</SelectItem>
                          {[
                            "Screened",
                            "Accepted",
                            "Interview Scheduled",
                            "Assessed",
                            "Assessment Test",
                            "Practical Test",
                            "Final Evaluation",
                            "Offer",
                            "Hired",
                            "Rejected",
                          ].map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={pipelineResult} onValueChange={setPipelineResult}>
                        <SelectTrigger className="w-36">
                          <SelectValue placeholder="Any result" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any result</SelectItem>
                          <SelectItem value="passed">Passed</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="perfect">Perfect for the Job</SelectItem>
                        </SelectContent>
                      </Select>
                      {pipelineScheduledDate && (
                        <Badge
                          variant="outline"
                          className="h-9 gap-1 rounded-md border-primary/30 bg-primary/10 px-2.5 text-xs text-primary"
                        >
                          Scheduled {pipelineScheduledDate}
                          <button
                            type="button"
                            className="ml-1 cursor-pointer hover:opacity-70"
                            onClick={() => setPipelineScheduledDate(null)}
                            aria-label="Clear the scheduled-day filter"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}
                      {(pipelineSearch ||
                        pipelinePosition !== "all" ||
                        pipelineStage !== "all" ||
                        pipelineResult !== "all" ||
                        pipelineScheduledDate) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-9 px-2 text-xs"
                          onClick={() => {
                            setPipelineSearch("");
                            setPipelinePosition("all");
                            setPipelineStage("all");
                            setPipelineResult("all");
                            setPipelineScheduledDate(null);
                          }}
                        >
                          <X className="mr-1 h-3.5 w-3.5" /> Clear
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 [&_table]:table-auto [&_td]:max-w-none [&_td]:align-top [&_td_.truncate]:overflow-visible [&_td_.truncate]:whitespace-normal [&_td_.truncate]:break-words">
                    <ListBody>
                      <Table className="table-fixed text-xs">
                        <TableHeader>
                          <TableRow>
                            <SortHead
                              sortKey="applicant"
                              sort={pipelineSort.sort}
                              onSort={pipelineSort.toggle}
                              className="w-[24%]"
                            >
                              Applicant
                            </SortHead>
                            <SortHead
                              sortKey="applied"
                              sort={pipelineSort.sort}
                              onSort={pipelineSort.toggle}
                              className="w-[8%]"
                            >
                              Applied
                            </SortHead>
                            <SortHead
                              sortKey="stage"
                              sort={pipelineSort.sort}
                              onSort={pipelineSort.toggle}
                              className="w-[9%]"
                            >
                              Current Stage
                            </SortHead>
                            <SortHead
                              sortKey="screening"
                              sort={pipelineSort.sort}
                              onSort={pipelineSort.toggle}
                              className="w-[7%]"
                            >
                              Screening
                            </SortHead>
                            <SortHead
                              sortKey="interview"
                              sort={pipelineSort.sort}
                              onSort={pipelineSort.toggle}
                              className="w-[12%]"
                            >
                              Interview
                            </SortHead>
                            <SortHead
                              sortKey="assessment"
                              sort={pipelineSort.sort}
                              onSort={pipelineSort.toggle}
                              className="w-[10%]"
                            >
                              Assessment
                            </SortHead>
                            <SortHead
                              sortKey="practical"
                              sort={pipelineSort.sort}
                              onSort={pipelineSort.toggle}
                              className="w-[9%]"
                            >
                              Practical
                            </SortHead>
                            <SortHead
                              sortKey="final"
                              sort={pipelineSort.sort}
                              onSort={pipelineSort.toggle}
                              className="w-[9%]"
                            >
                              Final
                            </SortHead>
                            <TableHead className="w-[12%]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pipelinePage.pageItems.map(
                            ({
                              a,
                              interview,
                              liveInterview,
                              assessment,
                              test,
                              practical,
                              final,
                              requiresPrac,
                              needsSchedule,
                              readyForTest,
                              readyForPractical,
                              readyForFinal,
                            }) => {
                              const isHired = a.stage === "Hired";
                              const isRejected = a.stage === "Rejected";
                              const canProgress = !isHired && !isRejected;
                              // 1 · Accept & schedule — any Screened applicant with no
                              // booked interview and no assessment yet can be
                              // accepted straight from the pipeline.
                              const showAccept =
                                a.stage === "Screened" &&
                                !liveInterview &&
                                !interview &&
                                !assessment &&
                                canProgress;
                              const showSchedule = needsSchedule && canProgress;
                              // 3 · Re-book — Cancelled interviews stay re-bookable,
                              // and Rejected applicants can be re-booked (with or
                              // without a prior interview) as long as the interview
                              // was never completed (no assessment record).
                              const showRebookCancelled =
                                !!interview &&
                                !assessment &&
                                !isHired &&
                                interview.status === "Cancelled";
                              const showRebookRejected = isRejected && !isHired && !assessment;
                              const showRebook = showRebookCancelled || showRebookRejected;
                              const showStart =
                                !!interview &&
                                !assessment &&
                                canProgress &&
                                interview.status !== "Cancelled" &&
                                !isRejected;
                              // Facility verification gate — mirrors the Interview
                              // Scheduling rule that a booking is only confirmed once
                              // its facility request is approved: while approval is
                              // still pending, the interview cannot be started.
                              const bookingForFacility = liveInterview ?? interview;
                              const facilityPending =
                                !!bookingForFacility?.facilityName &&
                                (facilityStatuses[bookingForFacility.id] ??
                                  bookingForFacility.facilityStatus) ===
                                  "Waiting for Facility Approval";
                              // 2 · Reschedule — any live booking that is not done
                              // yet (no assessment record) can be moved to a new
                              // slot. A stale "Completed" without an assessment
                              // counts as still open.
                              const showReschedule =
                                !!liveInterview &&
                                !assessment &&
                                canProgress &&
                                liveInterview.status !== "Cancelled" &&
                                !isInterviewLocked(liveInterview);
                              // Cancel — only while still Scheduled (or stale
                              // "Completed" with no assessment) and not yet
                              // interviewed. Cancelled / No Show / truly-done
                              // rows never show Cancel.
                              const showCancel =
                                !!liveInterview &&
                                !assessment &&
                                canProgress &&
                                (liveInterview.status === "Scheduled" ||
                                  liveInterview.status === "Completed") &&
                                !isInterviewLocked(liveInterview);
                              const startToday = showStart
                                ? (liveInterview?.date ?? interview?.date) === TODAY_ISO
                                : false;
                              const showStartTest = !test && readyForTest && canProgress;
                              const showStartPractical =
                                requiresPrac && !practical && readyForPractical && canProgress;
                              const showCompleteFinal = !final && readyForFinal && canProgress;
                              const decided = isHired || isRejected;
                              const verified = final ? verifiedDecisions[final.id] : undefined;
                              const showVerify = !!final && !decided && !verified;
                              const showVerifiedBadge = !!final && !!verified && !decided;
                              const hasStageActions =
                                showAccept ||
                                showSchedule ||
                                showStart ||
                                showRebook ||
                                showReschedule ||
                                showCancel ||
                                showStartTest ||
                                showStartPractical ||
                                showCompleteFinal ||
                                showVerify;
                              const hasViews =
                                !!assessment ||
                                !!test ||
                                !!practical ||
                                !!final ||
                                showVerifiedBadge;
                              const hasMore = hasStageActions || hasViews;
                              return (
                                <TableRow key={a.id} className="hover:bg-muted/30">
                                  <TableCell className="max-w-0">
                                    <div className="flex min-w-0 items-start gap-2">
                                      <Avatar className="h-7 w-7 shrink-0">
                                        <AvatarFallback className="bg-secondary text-[0.65rem]">
                                          {initials(a.name)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="min-w-0 flex-1">
                                        <p className="truncate font-medium" title={a.name}>
                                          {a.name}
                                        </p>
                                        <p
                                          className="truncate text-muted-foreground"
                                          title={`${a.id} · ${a.position}`}
                                        >
                                          {a.id} · {a.position}
                                        </p>
                                        {a.email ? (
                                          <p
                                            className="truncate text-muted-foreground"
                                            title={a.email}
                                          >
                                            {a.email}
                                          </p>
                                        ) : null}
                                        {a.phone ? (
                                          <p
                                            className="truncate text-muted-foreground"
                                            title={a.phone}
                                          >
                                            {a.phone}
                                          </p>
                                        ) : null}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="max-w-0">
                                    {(() => {
                                      const shown = displayAppliedAt(a.appliedAt);
                                      const [d, ...rest] = shown.split(" ");
                                      const t = rest.join(" ");
                                      return (
                                        <>
                                          <p className="truncate font-medium" title={shown}>
                                            {d || "—"}
                                          </p>
                                          {t ? (
                                            <p className="truncate text-muted-foreground">{t}</p>
                                          ) : null}
                                        </>
                                      );
                                    })()}
                                  </TableCell>
                                  <TableCell className="max-w-0">
                                    {(() => {
                                      const step = pipelineStepOf(a.stage);
                                      return step ? (
                                        <>
                                          <p className="truncate font-medium" title={a.stage}>
                                            {a.stage}
                                          </p>
                                          <p className="truncate text-muted-foreground">{step}</p>
                                        </>
                                      ) : (
                                        <p className="truncate font-medium" title={a.stage}>
                                          {a.stage}
                                        </p>
                                      );
                                    })()}
                                  </TableCell>
                                  <TableCell className="max-w-0">
                                    <p className="font-display text-sm font-semibold">{a.score}%</p>
                                    <p
                                      className={cn(
                                        "truncate text-xs font-semibold",
                                        a.stage === "Rejected"
                                          ? "text-destructive"
                                          : a.score >= passing
                                            ? "text-success"
                                            : "text-caution",
                                      )}
                                    >
                                      {a.stage === "Rejected"
                                        ? "Rejected"
                                        : a.score >= passing
                                          ? "Passed"
                                          : "Below passing"}
                                    </p>
                                    {(a.docCount ?? 0) > 0 ? (
                                      <p
                                        className="truncate text-xs font-medium text-primary"
                                        title={`${a.docCount} supporting document${a.docCount === 1 ? "" : "s"} uploaded — open View profile → Resume & Documents to inspect`}
                                      >
                                        {a.docCount} supporting doc{a.docCount === 1 ? "" : "s"}
                                      </p>
                                    ) : null}
                                    {/* Screening verdict — below the supporting
                                        documents, or right below Passed / Below
                                        passing when no documents were uploaded. */}
                                    <p
                                      className={cn(
                                        "mt-1 inline-flex rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold",
                                        statusMeta[a.status].className,
                                      )}
                                      title={statusMeta[a.status].label}
                                    >
                                      {statusMeta[a.status].label}
                                    </p>
                                  </TableCell>
                                  <TableCell className="max-w-0">
                                    {needsSchedule &&
                                    a.stage !== "Hired" &&
                                    a.stage !== "Rejected" ? (
                                      <>
                                        <p className="truncate text-muted-foreground">
                                          Accepted — no date yet
                                        </p>
                                      </>
                                    ) : !interview ? (
                                      <p className="truncate text-muted-foreground">
                                        {a.stage === "Rejected"
                                          ? "Rejected"
                                          : a.stage === "Hired"
                                            ? "Hired"
                                            : "Need to Schedule"}
                                      </p>
                                    ) : (
                                      <>
                                        <p
                                          className="truncate font-medium"
                                          title={`${interview.date} · ${interview.time} · ${interview.mode} · ${interview.interviewer}${interview.facilityName ? ` · ${interview.facilityName}` : ""}`}
                                        >
                                          {interview.date} · {interview.time}
                                        </p>
                                        <p className="truncate text-muted-foreground">
                                          {interview.mode} · {interview.interviewer}
                                        </p>
                                        {(() => {
                                          // An interview only counts as done when its
                                          // assessment record exists. A stale
                                          // "Completed" without assessment is still an
                                          // open booking → Scheduled colors.
                                          const done = !!assessment;
                                          const liveDay = liveInterview?.date ?? interview.date;
                                          const isToday = liveDay === TODAY_ISO;
                                          const label = done
                                            ? `${assessment.result} · ${assessment.total}%`
                                            : interview.status === "Cancelled"
                                              ? "Cancelled"
                                              : interview.status === "No Show"
                                                ? "No Show"
                                                : isToday
                                                  ? "Scheduled Today"
                                                  : "Scheduled";
                                          const tone = done
                                            ? assessment.result === "Passed"
                                              ? "text-success"
                                              : "text-destructive"
                                            : interview.status === "Cancelled" ||
                                                interview.status === "No Show"
                                              ? "text-destructive"
                                              : "text-primary";
                                          return (
                                            <>
                                              <p
                                                className={cn(
                                                  "truncate text-xs font-semibold",
                                                  tone,
                                                )}
                                              >
                                                {label}
                                              </p>
                                              {facilityPending &&
                                              !done &&
                                              interview.status !== "Cancelled" &&
                                              interview.status !== "No Show" ? (
                                                <p
                                                  className="truncate text-[0.7rem] font-medium text-caution"
                                                  title="The facility request for this booking is still awaiting approval — the schedule is confirmed once approved"
                                                >
                                                  Awaiting facility approval
                                                </p>
                                              ) : null}
                                            </>
                                          );
                                        })()}
                                      </>
                                    )}
                                  </TableCell>
                                  <TableCell className="max-w-0">
                                    {test ? (
                                      <>
                                        <p className="font-display text-sm font-semibold">
                                          {test.total}%
                                        </p>
                                        <p
                                          className={cn(
                                            "truncate text-xs font-semibold",
                                            test.result === "Passed"
                                              ? "text-success"
                                              : "text-destructive",
                                          )}
                                        >
                                          {test.result}
                                        </p>
                                        <p
                                          className="truncate text-muted-foreground"
                                          title={test.title}
                                        >
                                          {test.title}
                                        </p>
                                      </>
                                    ) : readyForTest &&
                                      a.stage !== "Hired" &&
                                      a.stage !== "Rejected" ? (
                                      <>
                                        <p className="truncate text-muted-foreground">
                                          Ready for test — start from Actions
                                        </p>
                                      </>
                                    ) : a.stage === "Rejected" ? (
                                      <p className="truncate text-xs font-semibold text-destructive">
                                        Rejected
                                      </p>
                                    ) : a.stage === "Hired" ? (
                                      <p className="truncate text-muted-foreground">Hired</p>
                                    ) : (
                                      <p className="truncate text-muted-foreground">
                                        Waiting for interview
                                      </p>
                                    )}
                                  </TableCell>
                                  <TableCell className="max-w-0">
                                    {!requiresPrac ? (
                                      /* Roles that skip the practical: the stage reads
                                         as completed (green) once the applicant has
                                         moved past it — the assessment test is the
                                         step right before it there. */
                                      <p
                                        className={cn(
                                          "truncate",
                                          test?.result === "Passed" || milestoneIndexOf(a) > 3
                                            ? "text-xs font-semibold text-success"
                                            : "text-muted-foreground",
                                        )}
                                        title="This position skips the practical stage"
                                      >
                                        {test?.result === "Passed" || milestoneIndexOf(a) > 3
                                          ? "Not required — Completed"
                                          : "Not required"}
                                      </p>
                                    ) : practical ? (
                                      <>
                                        <p className="font-display text-sm font-semibold">
                                          {practical.total}%
                                        </p>
                                        <p
                                          className={cn(
                                            "truncate text-xs font-semibold",
                                            practical.result === "Passed"
                                              ? "text-success"
                                              : "text-destructive",
                                          )}
                                        >
                                          {practical.result}
                                        </p>
                                        <p
                                          className="truncate text-muted-foreground"
                                          title={practical.taskTitle}
                                        >
                                          {practical.taskTitle}
                                        </p>
                                      </>
                                    ) : readyForPractical &&
                                      a.stage !== "Hired" &&
                                      a.stage !== "Rejected" ? (
                                      <>
                                        <p className="truncate text-muted-foreground">
                                          Ready for practical — start from Actions
                                        </p>
                                      </>
                                    ) : a.stage === "Rejected" ? (
                                      <p className="truncate text-xs font-semibold text-destructive">
                                        Rejected
                                      </p>
                                    ) : a.stage === "Hired" ? (
                                      <p className="truncate text-muted-foreground">Hired</p>
                                    ) : (
                                      <p className="truncate text-muted-foreground">
                                        {test?.result === "Passed"
                                          ? "Up next — record it"
                                          : "Waiting for assessment"}
                                      </p>
                                    )}
                                  </TableCell>
                                  <TableCell className="max-w-0">
                                    {final ? (
                                      <>
                                        <p
                                          className={cn(
                                            "truncate text-xs font-semibold",
                                            final.recommendation === "Recommended for Hire"
                                              ? "text-success"
                                              : final.recommendation === "For Another Position"
                                                ? "text-warning"
                                                : "text-destructive",
                                          )}
                                          title={final.recommendation}
                                        >
                                          {final.recommendation}
                                        </p>
                                        <p className="truncate text-muted-foreground">
                                          {final.date}
                                        </p>
                                        <p
                                          className={cn(
                                            "truncate text-xs font-semibold",
                                            verified
                                              ? "text-success"
                                              : decided
                                                ? "text-muted-foreground"
                                                : "text-warning",
                                          )}
                                          title={
                                            verified
                                              ? `Verified decision: ${verified}`
                                              : "Recorded but not yet verified — use Actions → Verify decision"
                                          }
                                        >
                                          {verified
                                            ? decided
                                              ? `Verified · ${verified}`
                                              : "Verified — pending"
                                            : "Unverified"}
                                        </p>
                                      </>
                                    ) : readyForFinal &&
                                      a.stage !== "Hired" &&
                                      a.stage !== "Rejected" ? (
                                      <>
                                        <p className="truncate text-muted-foreground">
                                          Ready to evaluate — start from Actions
                                        </p>
                                      </>
                                    ) : a.stage === "Rejected" ? (
                                      <p className="truncate text-muted-foreground">Rejected</p>
                                    ) : a.stage === "Hired" ? (
                                      <p className="truncate text-muted-foreground">Hired</p>
                                    ) : (
                                      <p className="truncate text-muted-foreground">
                                        Waiting for earlier stages
                                      </p>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-nowrap items-center justify-start gap-1.5">
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-7 w-7 shrink-0 cursor-pointer px-0"
                                            title="Stage actions"
                                          >
                                            <MoreHorizontal className="h-3.5 w-3.5" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-52">
                                          {showAccept ? (
                                            <DropdownMenuItem onClick={() => openReview(a)}>
                                              Accept &amp; schedule
                                            </DropdownMenuItem>
                                          ) : null}
                                          {showSchedule ? (
                                            <DropdownMenuItem onClick={() => openReview(a)}>
                                              Schedule interview
                                            </DropdownMenuItem>
                                          ) : null}
                                          {showRebook ? (
                                            <DropdownMenuItem
                                              onClick={() =>
                                                interview
                                                  ? rebookInterview(interview)
                                                  : rebookRejectedApplicant(a)
                                              }
                                            >
                                              Re-book interview
                                            </DropdownMenuItem>
                                          ) : null}
                                          {showStart && interview ? (
                                            // Wrapper carries the tooltip: a disabled menu item
                                            // has pointer-events disabled, so a `title` on the
                                            // item itself would never surface on hover.
                                            <span
                                              className="block"
                                              title={
                                                facilityPending
                                                  ? "Waiting for facility approval — the interview can start once the facility request is approved"
                                                  : startToday
                                                    ? undefined
                                                    : "Scheduled today to access it"
                                              }
                                            >
                                              <DropdownMenuItem
                                                disabled={!startToday || facilityPending}
                                                onClick={
                                                  startToday && !facilityPending
                                                    ? () => startInterviewFor(a)
                                                    : undefined
                                                }
                                              >
                                                Start interview
                                              </DropdownMenuItem>
                                            </span>
                                          ) : null}
                                          {showReschedule && liveInterview ? (
                                            <DropdownMenuItem
                                              onClick={() => rescheduleInterview(liveInterview)}
                                            >
                                              Reschedule interview
                                            </DropdownMenuItem>
                                          ) : null}
                                          {showCancel && liveInterview ? (
                                            <DropdownMenuItem
                                              className="text-destructive focus:text-destructive"
                                              onClick={() =>
                                                setCancelInterview(
                                                  interviews.find(
                                                    (x) => x.id === liveInterview.id,
                                                  ) ?? liveInterview,
                                                )
                                              }
                                            >
                                              <X className="mr-2 h-3.5 w-3.5" /> Cancel interview
                                            </DropdownMenuItem>
                                          ) : null}
                                          {showStartTest ? (
                                            <>
                                              <DropdownMenuItem onClick={() => openAssessmentTest(a)}>
                                                Start assessment test
                                              </DropdownMenuItem>
                                              <DropdownMenuItem
                                                disabled={inviteBusyId === a.id}
                                                onClick={() => void copyApplicantTestLink(a)}
                                              >
                                                Copy applicant test link
                                              </DropdownMenuItem>
                                            </>
                                          ) : null}
                                          {showStartPractical ? (
                                            <DropdownMenuItem onClick={() => openPractical(a)}>
                                              Start practical test
                                            </DropdownMenuItem>
                                          ) : null}
                                          {showCompleteFinal ? (
                                            <DropdownMenuItem
                                              onClick={() => openFinalEvaluation(a)}
                                            >
                                              Complete final evaluation
                                            </DropdownMenuItem>
                                          ) : null}
                                          {showVerify && final ? (
                                            <DropdownMenuItem
                                              onClick={() => {
                                                setVerifyingFinal(final);
                                                setVerifyChoice(final.recommendation);
                                              }}
                                            >
                                              Verify decision
                                            </DropdownMenuItem>
                                          ) : null}
                                          {hasStageActions && hasViews ? (
                                            <DropdownMenuSeparator />
                                          ) : null}
                                          <DropdownMenuItem onClick={() => openReview(a, true)}>
                                            <FileText className="mr-2 h-3.5 w-3.5" /> Review
                                            screening
                                          </DropdownMenuItem>
                                          {assessment ? (
                                            <DropdownMenuItem
                                              onClick={() => setViewingInterview(assessment)}
                                            >
                                              <Eye className="mr-2 h-3.5 w-3.5" /> View interview
                                            </DropdownMenuItem>
                                          ) : null}
                                          {test ? (
                                            <DropdownMenuItem
                                              onClick={() => setViewingAssessmentTest(test)}
                                            >
                                              <Eye className="mr-2 h-3.5 w-3.5" /> View assessment
                                              test
                                            </DropdownMenuItem>
                                          ) : null}
                                          {practical ? (
                                            <DropdownMenuItem
                                              onClick={() => setViewingPractical(practical)}
                                            >
                                              <Eye className="mr-2 h-3.5 w-3.5" /> View practical
                                              test
                                            </DropdownMenuItem>
                                          ) : null}
                                          {final ? (
                                            <DropdownMenuItem
                                              onClick={() => setViewingFinal(final)}
                                            >
                                              <Eye className="mr-2 h-3.5 w-3.5" /> View final
                                              evaluation
                                            </DropdownMenuItem>
                                          ) : null}
                                          {showVerifiedBadge ? (
                                            <DropdownMenuItem disabled>
                                              Verified — pending
                                            </DropdownMenuItem>
                                          ) : null}
                                          {/* Last item of the View section. */}
                                          {interview ? (
                                            <DropdownMenuItem
                                              onClick={() => viewScheduledInCalendar(a)}
                                            >
                                              <CalendarDays className="mr-2 h-3.5 w-3.5" /> View
                                              scheduled in calendar
                                            </DropdownMenuItem>
                                          ) : null}
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 shrink-0 cursor-pointer whitespace-nowrap px-2"
                                        title="Open this applicant's View screen — interview, tests and evaluation"
                                        onClick={() => setViewingApplicant(a)}
                                      >
                                        <Eye className="mr-1.5 h-3.5 w-3.5" /> View profile
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            },
                          )}
                          {pipelinePage.pageItems.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={9} className="py-10 text-center">
                                <div className="mx-auto max-w-xs space-y-1.5">
                                  <ClipboardCheck className="mx-auto h-6 w-6 text-muted-foreground" />
                                  <p className="text-sm font-semibold">No applicants found</p>
                                  <p className="text-xs text-muted-foreground">
                                    Try a different search or clear the filters above.
                                  </p>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </ListBody>
                    <TablePagination
                      page={pipelinePage.page}
                      pageCount={pipelinePage.pageCount}
                      from={pipelinePage.from}
                      to={pipelinePage.to}
                      total={pipelinePage.total}
                      label="applicants"
                      showRangeLabel={false}
                      onPageChange={pipelinePage.setPage}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* HISTORY & AUDIT */}
            <TabsContent value="history" className="mt-4 space-y-6">
              <Card className="border-border/70">
                <CardContent className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
                        <History className="h-5 w-5 text-primary" /> History &amp; Audit
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Complete trail of applicant activity — screening, transfers, interview
                        booking, completion and cancellation, assessments and hiring decisions.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          value={auditSearch}
                          onChange={(e) => setAuditSearch(e.target.value)}
                          placeholder="Search activity—"
                          className="w-56 pl-8"
                        />
                      </div>
                      <Select value={auditActionFilter} onValueChange={setAuditActionFilter}>
                        <SelectTrigger className="w-44">
                          <SelectValue placeholder="Action" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All actions</SelectItem>
                          {auditActionTypes.map((a) => (
                            <SelectItem key={a} value={a}>
                              {a}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={auditDeptFilter} onValueChange={setAuditDeptFilter}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All departments</SelectItem>
                          {displayDepartments.map((d) => (
                            <SelectItem key={d.code} value={d.name}>
                              {d.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={auditActorFilter} onValueChange={setAuditActorFilter}>
                        <SelectTrigger className="w-44">
                          <SelectValue placeholder="Actor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All users</SelectItem>
                          {auditActors.map((a) => (
                            <SelectItem key={a} value={a}>
                              {a}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="gap-2">
                            <Download className="h-4 w-4" /> Generate Report
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64">
                          <DropdownMenuItem onClick={() => handleExportAuditReport("pdf")}>
                            <FileText className="mr-2 h-4 w-4" />
                            <span className="flex items-center gap-1.5">
                              Export as PDF
                              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExportAuditReport("docx")}>
                            <FileText className="mr-2 h-4 w-4" />
                            <span className="flex items-center gap-1.5">
                              Export as DOCX
                              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExportAuditReport("excel")}>
                            <FileText className="mr-2 h-4 w-4" />
                            <span className="flex items-center gap-1.5">
                              Export as Excel
                              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExportAuditReport("csv")}>
                            <FileText className="mr-2 h-4 w-4" />
                            <span className="flex items-center gap-1.5">
                              Export as CSV
                              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                            </span>
                          </DropdownMenuItem>
                          <p className="px-2 py-1.5 text-[11px] leading-snug text-muted-foreground">
                            Every file is sealed in a password-protected ZIP (AES-256). You will be
                            asked for a file password.
                          </p>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              const data = buildAuditReportData();
                              printReport(data);
                              toast.success(`${data.title} sent to printer.`);
                            }}
                          >
                            <Printer className="mr-2 h-4 w-4" /> Print…
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      {(auditSearch ||
                        auditActionFilter !== "all" ||
                        auditDeptFilter !== "all" ||
                        auditActorFilter !== "all") && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setAuditSearch("");
                            setAuditActionFilter("all");
                            setAuditDeptFilter("all");
                            setAuditActorFilter("all");
                          }}
                        >
                          Reset
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 overflow-x-auto rounded-md border border-border">
                    <ListBody>
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-secondary/40">
                            <SortHead
                              sortKey="timestamp"
                              sort={auditSort.sort}
                              onSort={auditSort.toggle}
                              className="whitespace-nowrap"
                            >
                              Date &amp; time
                            </SortHead>
                            <SortHead
                              sortKey="actorName"
                              sort={auditSort.sort}
                              onSort={auditSort.toggle}
                            >
                              Performed by
                            </SortHead>
                            <SortHead
                              sortKey="actorPosition"
                              sort={auditSort.sort}
                              onSort={auditSort.toggle}
                            >
                              Position
                            </SortHead>
                            <SortHead
                              sortKey="actorDepartment"
                              sort={auditSort.sort}
                              onSort={auditSort.toggle}
                            >
                              Department
                            </SortHead>
                            <SortHead
                              sortKey="actionType"
                              sort={auditSort.sort}
                              onSort={auditSort.toggle}
                            >
                              Action
                            </SortHead>
                            <SortHead
                              sortKey="target"
                              sort={auditSort.sort}
                              onSort={auditSort.toggle}
                            >
                              Applicant
                            </SortHead>
                            <SortHead
                              sortKey="module"
                              sort={auditSort.sort}
                              onSort={auditSort.toggle}
                            >
                              Module
                            </SortHead>
                            <SortHead
                              sortKey="details"
                              sort={auditSort.sort}
                              onSort={auditSort.toggle}
                            >
                              Details
                            </SortHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {auditPage.pageItems.map((e) => (
                            <TableRow key={e.id}>
                              <TableCell className="whitespace-nowrap text-xs">
                                <span className="font-medium">{e.date}</span>
                                <span className="block text-muted-foreground">{e.time}</span>
                              </TableCell>
                              <TableCell className="whitespace-nowrap text-sm font-medium">
                                {e.actorName}
                              </TableCell>
                              <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                                {e.actorPosition}
                              </TableCell>
                              <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                                {e.actorDepartment}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                <Badge variant="outline" className={auditBadgeClass(e.actionType)}>
                                  {e.actionType}
                                </Badge>
                              </TableCell>
                              <TableCell className="whitespace-nowrap text-sm">
                                {e.target}
                              </TableCell>
                              <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                                {e.module}
                              </TableCell>
                              <TableCell className="min-w-[18rem] text-xs text-muted-foreground">
                                {e.details}
                              </TableCell>
                            </TableRow>
                          ))}
                          {auditLoading && (
                            <TableRow>
                              <TableCell
                                colSpan={8}
                                className="py-10 text-center text-sm text-muted-foreground"
                              >
                                <span className="inline-flex items-center gap-2">
                                  <Loader2 className="h-4 w-4 animate-spin" /> Loading audit
                                  history…
                                </span>
                              </TableCell>
                            </TableRow>
                          )}
                          {!auditLoading && auditLog.length === 0 && (
                            <TableRow>
                              <TableCell
                                colSpan={8}
                                className="py-10 text-center text-sm text-muted-foreground"
                              >
                                No audit history yet. Activity will appear here as you screen
                                applicants, book interviews, and complete assessments.
                              </TableCell>
                            </TableRow>
                          )}
                          {!auditLoading &&
                            auditLog.length > 0 &&
                            auditSort.sorted.length === 0 && (
                              <TableRow>
                                <TableCell
                                  colSpan={8}
                                  className="py-10 text-center text-sm text-muted-foreground"
                                >
                                  No activity matches your filters.
                                </TableCell>
                              </TableRow>
                            )}
                        </TableBody>
                      </Table>
                    </ListBody>
                    <TablePagination
                      page={auditPage.page}
                      pageCount={auditPage.pageCount}
                      from={auditPage.from}
                      to={auditPage.to}
                      total={auditPage.total}
                      label="log entries"
                      onPageChange={auditPage.setPage}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* REPORTS DIALOG — predefined reports */}
      <Dialog open={reportsOpen} onOpenChange={setReportsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Generate Report</DialogTitle>
            <DialogDescription>
              Predefined reports — every format is password-protected (sealed in an AES-256 ZIP; you
              will be asked for a file password on every export).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            {reportOptions.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-md border border-border p-3"
              >
                <div>
                  <p className="text-sm font-medium">{r.title}</p>
                  <p className="text-xs text-muted-foreground">{r.description}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Download className="mr-2 h-4 w-4" /> Generate
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-60">
                    <DropdownMenuItem onClick={() => handleExportApplicantReport(r, "pdf")}>
                      <FileText className="mr-2 h-4 w-4" />
                      <span className="flex items-center gap-1.5">
                        Export as PDF <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExportApplicantReport(r, "docx")}>
                      <FileText className="mr-2 h-4 w-4" />
                      <span className="flex items-center gap-1.5">
                        Export as DOCX <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExportApplicantReport(r, "excel")}>
                      <FileText className="mr-2 h-4 w-4" />
                      <span className="flex items-center gap-1.5">
                        Export as Excel <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExportApplicantReport(r, "csv")}>
                      <FileText className="mr-2 h-4 w-4" />
                      <span className="flex items-center gap-1.5">
                        Export as CSV <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                      </span>
                    </DropdownMenuItem>
                    <p className="px-2 py-1.5 text-[11px] leading-snug text-muted-foreground">
                      Password-protected ZIP — password asked on every export.
                    </p>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        const data = buildApplicantReportData(r);
                        printReport(data);
                        toast.success(`${data.title} sent to printer.`);
                      }}
                    >
                      <Printer className="mr-2 h-4 w-4" /> Print…
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
            <div className="flex items-center justify-between gap-3 rounded-md border border-dashed border-border p-3">
              <div>
                <p className="text-sm font-medium">History &amp; Audit</p>
                <p className="text-xs text-muted-foreground">
                  Who did what, when — available from the History tab&apos;s Generate Report menu
                  (same formats, every file is password-protected).
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SecureExportDialog
        open={csvOpen}
        onOpenChange={(o) => {
          if (!csvBusy) {
            setCsvOpen(o);
            if (!o) setCsvPending(null);
          }
        }}
        reportTitle={
          !csvPending || csvPending.kind === "audit"
            ? "History & Audit Report — Applicant Management"
            : `Applicant Management — ${reportOptions.find((o) => o.id === csvPending.optionId)?.title ?? ""}`
        }
        formatLabel={
          !csvPending
            ? ""
            : csvPending.format === "pdf"
              ? "PDF"
              : csvPending.format === "docx"
                ? "DOCX"
                : csvPending.format === "excel"
                  ? "Excel"
                  : "CSV"
        }
        busy={csvBusy}
        onConfirm={confirmCsvExport}
      />

      {/* REVIEW DIALOG — resume screening result */}

      {/* VERIFY CANDIDATE DECISION — after completing the Final Evaluation.
          Same UI as the Final Evaluation dialog (evaluated by + date, presented
          stage results, overall remarks) — only the recommendation differs.
          Confirming it auto-accepts / auto-rejects the candidate. */}
      <Dialog open={!!verifyingFinal} onOpenChange={(o) => !o && setVerifyingFinal(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto overflow-x-hidden sm:max-w-7xl">
          {verifyingFinal && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">
                  Verify Candidate Decision
                </DialogTitle>
                <DialogDescription>
                  {verifyingFinal.name} — {verifyingFinal.position}. Confirm the recorded
                  recommendation to finalize the candidate decision.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Evaluated by</Label>
                  <p className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
                    {verifyingFinal.evaluatedBy ??
                      assessors.find(
                        (u) => String(u.system_user_id) === String(verifyingFinal.evaluatedById),
                      )?.full_name ??
                      "—"}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label>Date</Label>
                  <p className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
                    {verifyingFinal.date}
                  </p>
                </div>
              </div>

              {stageResultBlocks({
                applicantId: verifyingFinal.applicantId,
                screeningScore: verifyingFinal.screeningScore,
                screeningStatus: verifyingFinal.screeningStatus,
                practicalRequired: verifyingFinal.practicalRequired,
              })}

              <div className="rounded-md border border-border p-3">
                <p className="eyebrow">Overall remarks</p>
                <p className="text-sm">{verifyingFinal.overallRemarks || "—"}</p>
              </div>

              <div className="space-y-2">
                <Label>Recommendation</Label>
                {(
                  [
                    "Recommended for Hire",
                    "For Another Position",
                    "Not Recommended",
                  ] as FinalRecommendation[]
                ).map((r) => (
                  <label
                    key={r}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm transition-colors",
                      verifyChoice === r
                        ? r === "Not Recommended"
                          ? "border-destructive bg-destructive/5"
                          : "border-success bg-success/5"
                        : "border-border hover:border-primary/40",
                    )}
                  >
                    <input
                      type="radio"
                      name="verifyChoice"
                      className={r === "Not Recommended" ? "accent-destructive" : "accent-primary"}
                      checked={verifyChoice === r}
                      onChange={() => setVerifyChoice(r)}
                    />
                    {r}
                  </label>
                ))}
              </div>
              <DialogFooter className="flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                <Button variant="outline" onClick={() => setVerifyingFinal(null)}>
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() =>
                    askConfirm({
                      title: "Reject this candidate?",
                      description: `${verifyingFinal.name}'s verified decision will be recorded as Rejected — the candidate is not accepted for any position.`,
                      confirmLabel: "Yes, reject candidate",
                      destructive: true,
                      onConfirm: () => confirmVerifyFinal("Not Recommended"),
                    })
                  }
                >
                  <XCircle className="mr-1.5 h-4 w-4" /> Reject
                </Button>
                <Button
                  disabled={!verifyChoice}
                  onClick={() =>
                    askConfirm({
                      title: "Confirm this candidate decision?",
                      description: `The recorded recommendation "${verifyChoice}" will be verified and the candidate decision finalized.`,
                      confirmLabel: "Yes, confirm decision",
                      onConfirm: () => confirmVerifyFinal(),
                    })
                  }
                >
                  Confirm
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* RECOMMENDED POSITION PICKER — "For Another Position" verification */}
      <Dialog open={!!positionPick} onOpenChange={(o) => !o && setPositionPick(null)}>
        <DialogContent className="sm:max-w-md">
          {positionPick && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">Recommended position</DialogTitle>
                <DialogDescription>
                  {positionPick.name} is verified as "For Another Position". Choose the best
                  recommended position — the candidate is accepted into it automatically.
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[50vh] space-y-2 overflow-y-auto">
                {displayPositions.map((p) => (
                  <label
                    key={p.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm transition-colors",
                      positionPickChoice === p.title
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40",
                    )}
                  >
                    <input
                      type="radio"
                      name="positionPick"
                      className="accent-primary"
                      checked={positionPickChoice === p.title}
                      onChange={() => setPositionPickChoice(p.title)}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{p.title}</span>
                      <span className="block text-xs text-muted-foreground">{p.department}</span>
                    </span>
                  </label>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPositionPick(null)}>
                  Cancel
                </Button>
                <Button
                  disabled={!positionPickChoice}
                  onClick={() => {
                    const f = positionPick;
                    const chosen = positionPickChoice;
                    if (!f) return;
                    askConfirm({
                      title: "Accept the candidate for another position?",
                      description: `${f.name} will be accepted for "${chosen}".`,
                      confirmLabel: "Yes, accept candidate",
                      onConfirm: () => {
                        setPositionPick(null);
                        acceptFinalEvaluation(f, "For Another Position", chosen);
                      },
                    });
                  }}
                >
                  Accept candidate
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Interview cancellation confirmation */}
      <Dialog open={!!cancelInterview} onOpenChange={(o) => !o && setCancelInterview(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel this interview?</DialogTitle>
            <DialogDescription>
              {cancelInterview
                ? `${cancelInterview.applicant}'s interview on ${cancelInterview.date} — ${cancelInterview.time} will be marked as Cancelled and kept in the schedule list with its label.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelInterview(null)}>
              Keep interview
            </Button>
            <Button variant="destructive" onClick={performCancelInterview}>
              Yes, cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Global confirmation for every pass / fail / save / recommend / reject
          decision — opened by askConfirm(...) so a committing action can never
          fire on a single stray click. */}
      <AlertDialog
        open={!!pendingConfirm}
        onOpenChange={(o) => {
          if (!o) setPendingConfirm(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pendingConfirm?.title}</AlertDialogTitle>
            <AlertDialogDescription>{pendingConfirm?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={cn(
                pendingConfirm?.destructive
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : undefined,
              )}
              onClick={() => {
                const action = pendingConfirm?.onConfirm;
                setPendingConfirm(null);
                void action?.();
              }}
            >
              {pendingConfirm?.confirmLabel ?? "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!review} onOpenChange={(o) => !o && closeReview()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[95vw] w-[95vw] lg:max-w-[1500px]">
          {review && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <FileText className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <DialogTitle className="font-display text-xl">
                      Resume Screening Result
                    </DialogTitle>
                    <DialogDescription className="mt-0.5">
                      AI-powered analysis and matching based on job requirements. This result is
                      used for your evaluation and decision support.
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {/* Applicant strip — avatar, role, status + resume file actions */}
              <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4">
                <Avatar className="h-12 w-12 shrink-0">
                  <AvatarFallback className="bg-primary text-base font-semibold text-primary-foreground">
                    {initials(review.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-lg font-semibold leading-tight">
                      {review.name}
                    </p>
                    <Badge variant="outline" className={statusMeta[review.status].className}>
                      {statusMeta[review.status].label}
                    </Badge>
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 font-medium text-foreground">
                      <Users className="h-3.5 w-3.5 text-primary" /> {review.position}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" /> Applied:{" "}
                      {displayAppliedAt(review.appliedAt)}
                    </span>
                  </p>
                </div>
                {review.resumeUrl && (
                  <div className="flex items-center gap-2.5 rounded-lg border border-border/70 px-3 py-2">
                    <ScreeningDocIcon docType="resume" label="RES" />
                    <div className="min-w-0 max-w-52">
                      <p
                        className="truncate text-xs font-semibold"
                        title={review.resumeOriginalName || undefined}
                      >
                        {review.resumeOriginalName ||
                          `${review.name.replace(/\s+/g, "_")}_Resume.pdf`}
                      </p>
                      <p className="text-[0.7rem] text-muted-foreground">PDF · Resume</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-[0.7rem]"
                      onClick={() => window.open(review.resumeUrl!, "_blank", "noopener")}
                    >
                      <Eye className="mr-1 h-3 w-3" /> View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-[0.7rem]"
                      onClick={() => window.open(review.resumeUrl!, "_blank", "noopener")}
                    >
                      <Download className="mr-1 h-3 w-3" /> Download
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {(() => {
                  const vm = screeningViewModel(review);
                  const detail = vm.detail;

                  return (
                    <>
                      <ScreeningModalSummary
                        status={review.status}
                        score={vm.score}
                        matchedCount={vm.matched.length}
                        missingCount={vm.missing.length}
                        yearsExperience={vm.yearsExperience}
                        educationLabel={vm.educationLabel}
                      />

                      {/* Resume screening + supporting-document verification =
                          the ranking percentage this candidate is ordered by. */}
                      <ScreeningVerificationImpact
                        verification={vm.verification}
                        resumeScore={vm.resumeScore}
                        score={vm.score}
                        onRecompute={() => recomputeRanking(review)}
                        recomputing={recomputingRanking}
                      />

                      <div className="grid items-stretch gap-4 lg:grid-cols-3">
                        <ResumeInfoPanel
                          title="Key Information Extracted"
                          variant="modal"
                          skills={vm.skills}
                          recognizedRoles={vm.recognizedRoles}
                          unrecognizedRoles={vm.unrecognizedRoles}
                          workExperience={vm.workExperience}
                          education={vm.education}
                          experienceYears={vm.yearsExperience}
                          certifications={vm.certifications}
                          personalInfo={vm.personalInfo}
                          skillsRecognized={vm.skillsRecognized}
                          unrecognizedCertifications={vm.unrecognizedCertifications}
                        />
                        <RequirementMatchPanel
                          rows={vm.rows}
                          experienceMinYears={vm.experienceMinYears}
                        />
                        <ScreeningResumeDocsMatchDetail
                          docs={Object.values(reviewDocVerifications)}
                          loading={reviewDocsLoading}
                          resumeName={vm.personalInfo.name ?? review.name}
                          resumeEducation={vm.education}
                          resumeCertifications={vm.certifications}
                        />
                      </div>

                      <ScreeningSupportDocsGrid
                        key={review.id}
                        title="Supporting Document Verification"
                        subtitle="Uploaded documents compared field-by-field against the claims in the applicant's resume."
                        showResume={false}
                        resumeName={review.resumeOriginalName || "Resume / CV"}
                        resumeSub={`PDF · Screened at ${Math.round(vm.score)}%`}
                        onOpenResume={
                          review.resumeUrl
                            ? () => window.open(review.resumeUrl!, "_blank", "noopener")
                            : undefined
                        }
                        docs={Object.values(reviewDocVerifications)}
                        loading={reviewDocsLoading}
                        reverifyingId={reverifyingDocId}
                        onView={(d) =>
                          window.open(
                            applicantDocumentsApi.fileUrl(d.applicant_document_id),
                            "_blank",
                            "noopener",
                          )
                        }
                        onDownload={(d) =>
                          window.open(
                            applicantDocumentsApi.fileUrl(d.applicant_document_id, true),
                            "_blank",
                            "noopener",
                          )
                        }
                        onReverify={reverifyDocument}
                      />

                      <ScreeningDetailsAccordion
                        detail={detail}
                        variant="modal"
                        position={review.position}
                        score={vm.score}
                        vm={vm}
                      />

                      {detail?.alternative_job && (
                        <div className="rounded-xl border border-warning/40 bg-warning/5 p-4 text-sm">
                          <p className="font-medium text-warning-foreground">
                            Recommended alternative: {detail.alternative_job.title} (
                            {Math.round(detail.alternative_job.alternative_match_score ?? 0)}
                            %)
                          </p>
                          {detail.alternative_job.reason && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {detail.alternative_job.reason}
                            </p>
                          )}
                        </div>
                      )}

                      {/* No recommendation box here by design: recommendations
                          belong to the Final Evaluation stage. Screening ends
                          with the details accordion above; Accept / Reject /
                          Refer actions live in the dialog footer below. */}
                    </>
                  );
                })()}
              </div>

              <DialogFooter className="flex-wrap gap-2">
                {reviewReadOnly ? (
                  <>
                    <ReportUnrecognizedDialog
                      entries={unrecognizedEntriesFrom(
                        screeningViewModel(review),
                        review.screening_detail,
                      )}
                      applicantName={review.name}
                      triggerLabel="Report unrecognized entries"
                    />
                    <Button variant="outline" onClick={closeReview}>
                      Close
                    </Button>
                  </>
                ) : isActionLocked(review) ? (
                  <>
                    {review.stage === "Accepted" && (
                      <Button
                        variant="outline"
                        className="w-full justify-center sm:ml-auto sm:w-auto"
                        onClick={() => acceptAndSchedule(review)}
                      >
                        <CalendarPlus className="mr-2 h-4 w-4" /> Schedule interview
                      </Button>
                    )}
                    <p className="flex w-full items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">
                      <Info className="h-4 w-4 shrink-0" />
                      This applicant is already at the{" "}
                      <span className="font-semibold text-foreground">{review.stage}</span> stage
                      —
                      {review.stage === "Accepted"
                        ? " use Schedule interview to book them in."
                        : " no further accept, reject or referral actions can be taken here."}
                    </p>
                  </>
                ) : (
                  <>
                    <ReportUnrecognizedDialog
                      entries={unrecognizedEntriesFrom(
                        screeningViewModel(review),
                        review.screening_detail,
                      )}
                      applicantName={review.name}
                      triggerLabel="Report unrecognized entries"
                    />
                    <Button variant="outline" onClick={() => openRefer(review)}>
                      <Repeat2 className="mr-2 h-4 w-4" /> Refer to other position
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        reject(review);
                        closeReview();
                      }}
                    >
                      <XCircle className="mr-2 h-4 w-4" /> Reject
                    </Button>
                    <Button onClick={() => acceptAndSchedule(review)}>
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Accept &amp; schedule
                    </Button>
                  </>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* REFER DIALOG */}
      <Dialog open={!!referring} onOpenChange={(o) => !o && setReferring(null)}>
        <DialogContent className="sm:max-w-lg">
          {referring && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">Refer to Other Position</DialogTitle>
                <DialogDescription>
                  Ranked by how well {referring.name}&apos;s resume screening entities (skills,
                  certificates, roles, education, experience) match each vacancy&apos;s job post
                  requirements — strongest match first.
                </DialogDescription>
              </DialogHeader>

              <RadioGroup value={referTarget} onValueChange={setReferTarget} className="space-y-2">
                {positions
                  .filter(
                    (p) =>
                      normalizeMatchText(p.title) !== normalizeMatchText(referring.position) &&
                      p.filled < p.headcount,
                  )
                  .map((p) => ({
                    p,
                    fit: referralMatch(
                      referring,
                      dbJobPosts.find((j) => j.title === p.title),
                    ),
                  }))
                  .sort((x, y) => y.fit.score - x.fit.score)
                  .map(({ p, fit }, idx) => (
                    <label
                      key={p.id}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors",
                        referTarget === p.title
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40",
                      )}
                    >
                      <RadioGroupItem value={p.title} className="mt-1" />
                      <span className="flex-1">
                        <span className="flex flex-wrap items-center gap-2 text-sm font-medium">
                          {p.title}
                          {idx === 0 && fit.total > 0 && (
                            <Badge className="bg-gold text-gold-foreground">Best match</Badge>
                          )}
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[0.65rem]",
                              fit.score >= 60
                                ? "border-success/40 bg-success/10 text-success"
                                : fit.score >= 30
                                  ? "border-warning/40 bg-warning/10 text-warning-foreground"
                                  : "border-border bg-muted text-muted-foreground",
                            )}
                          >
                            {fit.score}% resume match
                          </Badge>
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {p.department} — {p.headcount - p.filled} seat(s) open —{" "}
                          {p.salaryBand}
                        </span>
                        <span className="mt-1 block text-[0.7rem] text-muted-foreground">
                          {fit.total > 0
                            ? `${fit.matched.length}/${fit.total} requirements matched (${fit.source})${
                                fit.notes.length > 0 ? ` · ${fit.notes.join(" · ")}` : ""
                              }`
                            : "No requirement entities configured for this job post yet."}
                        </span>
                      </span>
                    </label>
                  ))}
              </RadioGroup>

              <DialogFooter>
                <Button variant="outline" onClick={() => setReferring(null)}>
                  Cancel
                </Button>
                <Button disabled={!referTarget} onClick={() => confirmRefer(referTarget)}>
                  Confirm referral
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* INTERVIEW DIALOG — wider layout, comments on the right */}
      <Dialog open={!!evaluating} onOpenChange={(o) => !o && setEvaluating(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto overflow-x-hidden sm:max-w-4xl">
          {evaluating && (
            <>
              <DialogHeader className="min-w-0">
                <DialogTitle className="font-display text-2xl">Interview</DialogTitle>
                <DialogDescription
                  className="min-w-0 max-w-full break-words"
                  style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
                >
                  {evaluating.name} — {evaluating.position}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>
                    Interviewer <span className="text-destructive">*</span>
                  </Label>
                  <Select value={evalAssessor} onValueChange={setEvalAssessor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select interviewer" />
                    </SelectTrigger>
                    <SelectContent>
                      {assessors.length === 0 && (
                        <div className="px-2 py-3 text-xs text-muted-foreground">
                          No system users found.
                        </div>
                      )}
                      {assessors.map((u) => (
                        <SelectItem key={u.system_user_id} value={String(u.system_user_id)}>
                          {u.full_name}
                          {u.department_name ? ` — ${u.department_name}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[0.7rem] text-muted-foreground">
                    Defaults to you (the logged-in user) — change it if another interviewer
                    conducted this interview. Required.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label>Interview date</Label>
                  <Input
                    type="date"
                    value={evalDateTime}
                    onChange={(e) => setEvalDateTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="overflow-hidden rounded-md border border-border">
                  <div className="grid grid-cols-1 gap-2 border-b border-border bg-muted/40 px-4 py-2 md:grid-cols-[1fr_130px_1fr] md:gap-4">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Category
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Rate
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Comments
                    </span>
                  </div>
                  {assessmentCriteria.map((c, idx) => (
                    <div
                      key={c}
                      className={
                        "grid grid-cols-1 gap-3 px-4 py-3 md:grid-cols-[1fr_130px_1fr] md:items-stretch md:gap-4" +
                        (idx > 0 ? " border-t border-border" : "")
                      }
                    >
                      <span className="flex text-sm font-medium md:items-center">{c}</span>
                      <Select
                        value={String(evalScores[c] ?? 4)}
                        onValueChange={(v) => setEvalScores((p) => ({ ...p, [c]: Number(v) }))}
                      >
                        <SelectTrigger className="h-full min-h-[60px] w-full md:w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[5, 4, 3, 2, 1].map((n) => (
                            <SelectItem key={n} value={String(n)}>
                              {n} / 5
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Textarea
                        rows={2}
                        className="min-h-[60px]"
                        value={evalComments[c] ?? ""}
                        onChange={(e) => setEvalComments((p) => ({ ...p, [c]: e.target.value }))}
                        placeholder={`Remarks for ${c.toLowerCase()}—`}
                      />
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label>Overall Evaluation</Label>
                  <Textarea
                    rows={3}
                    value={evalRemarks}
                    onChange={(e) => setEvalRemarks(e.target.value)}
                    placeholder="Overall evaluation of the interview—"
                  />
                </div>
                <div className="rounded-md border border-border p-3">
                  <div>
                    <p className="eyebrow">Computed score</p>
                    <p className="font-display text-3xl font-semibold text-primary">
                      {Math.round(
                        (assessmentCriteria.reduce((t, c) => t + (evalScores[c] ?? 4), 0) /
                          (assessmentCriteria.length * 5)) *
                          100,
                      )}
                      %
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter className="flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Assessor Verdict:
                  </span>
                  <Button
                    variant="outline"
                    className="border-success/40 text-success hover:bg-success/10 hover:text-success"
                    onClick={() =>
                      askConfirm({
                        title: "Mark this interview as Passed?",
                        description: `${evaluating.name}'s interview will be saved with a Passed verdict and the candidate will advance to the assessment test stage.`,
                        confirmLabel: "Yes, mark Passed",
                        onConfirm: () => saveAssessment("Passed"),
                      })
                    }
                  >
                    <CheckCircle2 className="mr-1.5 h-4 w-4" /> Passed
                  </Button>
                  <Button
                    variant="outline"
                    className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() =>
                      askConfirm({
                        title: "Mark this interview as Failed?",
                        description: `${evaluating.name}'s interview will be saved with a Failed verdict.`,
                        confirmLabel: "Yes, mark Failed",
                        destructive: true,
                        onConfirm: () => saveAssessment("Failed"),
                      })
                    }
                  >
                    <XCircle className="mr-1.5 h-4 w-4" /> Failed
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ASSESSMENT TEST RUNNER — candidate-facing quiz (mock data, auto-checked) */}
      <Dialog
        open={!!testingTest}
        onOpenChange={(o) => {
          if (!o) closeAssessmentTest();
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          {testingTest &&
            (() => {
              const totalQ = testQuestionSet.length;
              const current = testQuestionSet[testStep]!;
              const answeredCount = testQuestionSet.filter(
                (_, idx) => testAnswers[idx] != null,
              ).length;
              const isLast = testStep === totalQ - 1;
              const allAnswered = answeredCount === totalQ;
              const mins = Math.floor(Math.max(0, testTimeLeft) / 60);
              const secs = Math.max(0, testTimeLeft) % 60;
              const timeLabel = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
              const progressPct = Math.round(((testStep + 1) / totalQ) * 100);
              return (
                <>
                  {/* Top bar: progress + timer */}
                  <div className="flex items-center gap-3">
                    <span className="shrink-0 rounded-full border border-border px-2.5 py-1 text-xs font-medium">
                      {testStep + 1}/{totalQ}
                    </span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-success transition-all"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <span className="ml-auto flex shrink-0 items-center gap-1.5 text-sm font-semibold">
                      <Hourglass className="h-4 w-4" /> {timeLabel}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {testingTest.name} — {testingTest.position} · {testTitle} · Passing{" "}
                    {testPassing}% · {answeredCount}/{totalQ} answered — auto-checked when all
                    are answered.
                  </p>

                  {/* Question */}
                  <div className="mt-4 space-y-2">
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      Question <Volume2 className="h-3.5 w-3.5" />
                    </p>
                    <h3 className="text-sm font-bold">{current.title}</h3>
                    <p className="text-sm leading-relaxed">{current.scenario}</p>
                    <p className="pt-1 text-xs text-muted-foreground">Select one</p>
                  </div>

                  {/* Options */}
                  <div className="mt-2 space-y-2.5">
                    {current.options.map((opt, optIdx) => {
                      const selected = testAnswers[testStep] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => selectTestOption(testStep, optIdx)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                            selected
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50",
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                              selected ? "border-primary" : "border-muted-foreground",
                            )}
                          >
                            {selected && <span className="h-2 w-2 rounded-full bg-primary" />}
                          </span>
                          <span className="flex-1">{opt}</span>
                          <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[0.65rem] text-muted-foreground">
                            Press {optIdx + 1}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => clearTestAnswer(testStep)}
                    className="mt-2 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                  >
                    Clear answer
                  </button>

                  {/* Bottom bar */}
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <HelpCircle className="h-4 w-4" />
                      <span className="hidden sm:inline">Press 1–4 to select an answer</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={testStep === 0}
                        onClick={() => setTestStep((s) => Math.max(0, s - 1))}
                      >
                        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Prev
                      </Button>
                      {!isLast ? (
                        <Button size="sm" onClick={() => setTestStep((s) => s + 1)}>
                          Next <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={!allAnswered}
                          title={
                            allAnswered
                              ? "Auto-check now"
                              : `Answer all questions first (${totalQ - answeredCount} remaining)`
                          }
                          onClick={() =>
                            askConfirm({
                              title: "Submit the assessment test?",
                              description: `${testingTest.name}'s answers will be auto-checked and the result recorded. Answers cannot be changed after this.`,
                              confirmLabel: "Yes, submit test",
                              onConfirm: () => saveAssessmentTest(),
                            })
                          }
                        >
                          Finish — auto-check <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {!allAnswered && (
                    <p className="mt-2 text-right text-xs text-muted-foreground">
                      {totalQ - answeredCount} question(s) left — the test auto-checks once all
                      are answered.
                    </p>
                  )}
                </>
              );
            })()}
        </DialogContent>
      </Dialog>

      {/* PRACTICAL ASSESSMENT DIALOG — expanded, same layout as the Interview dialog */}
      <Dialog open={!!testingPractical} onOpenChange={(o) => !o && setTestingPractical(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto overflow-x-hidden sm:max-w-4xl">
          {testingPractical && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">Practical Assessment</DialogTitle>
                <DialogDescription>
                  {testingPractical.name} — {testingPractical.position}. Hands-on practical exam
                  based on the position; the assessor records it as Passed or Failed.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Practical task — a fixed title for the position; HR does not
                    edit it, only the criteria scoring below is filled in. */}
                <div className="space-y-1.5">
                  <Label>Practical task</Label>
                  <p className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm font-medium">
                    {practicalTask}
                  </p>
                  <p className="text-[0.7rem] text-muted-foreground">
                    Fixed title for this position — it cannot be changed.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>
                      Practical Assessment Assessor <span className="text-destructive">*</span>
                    </Label>
                    <Select value={practicalAssessor} onValueChange={setPracticalAssessor}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {assessors.map((u) => (
                          <SelectItem key={u.system_user_id} value={String(u.system_user_id)}>
                            {u.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={practicalDate}
                      onChange={(e) => setPracticalDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* Practical criteria per position — same bordered 3-column
                    layout as the Interview dialog (criterion / rate / comments) */}
                <div className="overflow-hidden rounded-md border border-border">
                  <div className="grid grid-cols-1 gap-2 border-b border-border bg-muted/40 px-4 py-2 md:grid-cols-[1fr_130px_1fr] md:gap-4">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Criterion
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Rate
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Comments
                    </span>
                  </div>
                  {practicalCriteria.map((c, idx) => (
                    <div
                      key={idx}
                      className={
                        "grid grid-cols-1 gap-3 px-4 py-3 md:grid-cols-[1fr_130px_1fr] md:items-stretch md:gap-4" +
                        (idx > 0 ? " border-t border-border" : "")
                      }
                    >
                      <span className="flex text-sm font-medium md:items-center">
                        {c.criterion}
                      </span>
                      <Select
                        value={String(practicalScores[String(idx)] ?? 4)}
                        onValueChange={(v) =>
                          setPracticalScores((p) => ({ ...p, [String(idx)]: Number(v) }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[5, 4, 3, 2, 1].map((n) => (
                            <SelectItem key={n} value={String(n)}>
                              {n} / 5
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Textarea
                        rows={2}
                        className="min-h-[60px]"
                        value={practicalComments[String(idx)] ?? ""}
                        onChange={(e) =>
                          setPracticalComments((p) => ({
                            ...p,
                            [String(idx)]: e.target.value,
                          }))
                        }
                        placeholder={`Comments for ${c.criterion.toLowerCase()}—`}
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label>Overall Evaluation</Label>
                  <Textarea
                    rows={3}
                    value={practicalRemarks}
                    onChange={(e) => setPracticalRemarks(e.target.value)}
                    placeholder="Overall evaluation of the practical exam—"
                  />
                </div>

                <div className="rounded-md border border-border p-3">
                  <p className="eyebrow">Computed score</p>
                  <p className="font-display text-3xl font-semibold text-primary">
                    {(() => {
                      // Same 1-5 rating scale as the interview — percentage of
                      // the maximum (criteria count × 5).
                      const count = practicalCriteria.length || 1;
                      const earned = practicalCriteria.reduce(
                        (t, _, idx) => t + (practicalScores[String(idx)] ?? 4),
                        0,
                      );
                      return Math.round((earned / (count * 5)) * 100);
                    })()}
                    %
                  </p>
                </div>
              </div>
              <DialogFooter className="flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                <span className="text-xs font-semibold text-muted-foreground">
                  Assessor Verdict:
                </span>
                <Button
                  variant="outline"
                  className="border-success/40 text-success hover:bg-success/10 hover:text-success"
                  onClick={() =>
                    askConfirm({
                      title: "Mark the practical assessment as Passed?",
                      description: `${testingPractical.name}'s practical assessment will be saved with a Passed verdict.`,
                      confirmLabel: "Yes, mark Passed",
                      onConfirm: () => savePractical("Passed"),
                    })
                  }
                >
                  <CheckCircle2 className="mr-1.5 h-4 w-4" /> Passed
                </Button>
                <Button
                  variant="outline"
                  className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() =>
                    askConfirm({
                      title: "Mark the practical assessment as Failed?",
                      description: `${testingPractical.name}'s practical assessment will be saved with a Failed verdict.`,
                      confirmLabel: "Yes, mark Failed",
                      destructive: true,
                      onConfirm: () => savePractical("Failed"),
                    })
                  }
                >
                  <XCircle className="mr-1.5 h-4 w-4" /> Failed
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* FINAL EVALUATION DIALOG — system-assisted: system scores read-only,
          HR picks the recommendation. */}
      <Dialog open={!!finalizing} onOpenChange={(o) => !o && setFinalizing(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto overflow-x-hidden sm:max-w-7xl">
          {finalizing && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">Final Evaluation</DialogTitle>
                <DialogDescription>
                  {finalizing.name} — {finalizing.position}. System-calculated scores below
                  are read-only; HR makes the final recommendation.
                </DialogDescription>
              </DialogHeader>

              {/* Evaluated by + date */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>
                    Evaluated by <span className="text-destructive">*</span>
                  </Label>
                  <Select value={finalAssessor} onValueChange={setFinalAssessor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {assessors.map((u) => (
                        <SelectItem key={u.system_user_id} value={String(u.system_user_id)}>
                          {u.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={finalDate}
                    onChange={(e) => setFinalDate(e.target.value)}
                  />
                </div>
              </div>

              {(() => {
                const snap = finalSnapshotFor(finalizing);
                const preview = finalPreview;
                const practicalRequired = preview?.practical_required ?? snap.practicalRequired;
                const screening = preview?.scores.screening_score ?? snap.screeningScore;
                const interview = preview?.scores.interview_score ?? snap.interviewScore;
                const assessment = preview?.scores.assessment_test_score ?? snap.testScore;
                const practical = preview
                  ? preview.scores.practical_test_score
                  : snap.practicalScore;
                const overall = preview?.overall_score_rounded ?? preview?.overall_score ?? null;
                const breakdown = (preview?.score_breakdown as FinalScoreBreakdownItem[] | undefined) ?? null;
                const reqs = preview?.requirements ?? null;
                const interviewOk = reqs ? reqs.interview_passed : snap.interviewResult === "Passed";
                const assessmentOk = reqs ? reqs.assessment_passed : snap.testResult === "Passed";
                const practicalState: "passed" | "missing_or_failed" | "not_required" = reqs
                  ? reqs.practical
                  : !practicalRequired
                    ? "not_required"
                    : snap.practicalResult === "Passed"
                      ? "passed"
                      : "missing_or_failed";
                const availableAltPosts = dbJobPosts.filter(
                  (j: any) =>
                    j.status === "Open" &&
                    j.active !== false &&
                    (Number(j.vacancies ?? 1) - Number(j.filled_count ?? 0)) > 0,
                );
                return (
                  <div className="space-y-3">
                    {/* Detailed stage results first (existing presentation) */}
                    {stageResultBlocks({
                      applicantId: finalizing.id,
                      screeningScore: screening,
                      screeningStatus: preview?.scores.screening_status ?? snap.screeningStatus,
                      practicalRequired,
                    })}

                    {/* SYSTEM-GENERATED evaluation summary (read-only) */}
                    <div className="rounded-md border border-border bg-muted/30 p-3">
                      <p className="eyebrow">Evaluation Summary — System Generated (read-only)</p>
                      {finalPreviewLoading ? (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Calculating scores from completed evaluations…
                        </p>
                      ) : (
                        <div className="mt-2 space-y-1 text-sm">
                          <div className="flex items-center justify-between gap-3">
                            <span>Screening / Role Fit</span>
                            <span className="font-display font-semibold text-primary">
                              {screening != null ? `${Math.round(screening)}%` : "—"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span>Interview Score</span>
                            <span className="font-display font-semibold text-primary">
                              {interview != null ? `${Math.round(interview)}%` : "—"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span>Assessment Test</span>
                            <span className="font-display font-semibold text-primary">
                              {assessment != null ? `${Math.round(assessment)}%` : "—"}
                            </span>
                          </div>
                          {practicalRequired && (
                            <div className="flex items-center justify-between gap-3">
                              <span>Practical Test</span>
                              <span className="font-display font-semibold text-primary">
                                {practical != null ? `${Math.round(practical)}%` : "—"}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between gap-3 border-t border-border pt-2">
                            <span className="font-medium">
                              Overall Score{" "}
                              <Badge variant="outline" className="ml-1 border-primary/40 text-primary">
                                System Calculated
                              </Badge>
                            </span>
                            <span className="font-display text-xl font-semibold text-primary">
                              {overall != null ? `${overall}%` : "—"}
                            </span>
                          </div>
                          {preview && !preview.calculation_complete && (
                            <p className="text-xs text-destructive">
                              Scores incomplete — the Overall Score cannot be calculated yet.
                            </p>
                          )}
                        </div>
                      )}
                      {/* Transparent score breakdown */}
                      <button
                        type="button"
                        className="mt-2 text-xs font-medium text-primary underline-offset-4 hover:underline"
                        onClick={() => setShowScoreBreakdown((v) => !v)}
                      >
                        {showScoreBreakdown ? "Hide score calculation" : "Show score calculation"}
                      </button>
                      {showScoreBreakdown && (
                        <div className="mt-2 space-y-1 rounded-md border border-border bg-background p-2.5 text-xs">
                          {(breakdown ?? []).filter((b) => b.applied).map((b) => (
                            <div key={b.key} className="flex items-center justify-between gap-3">
                              <span>
                                {b.label} — {b.score != null ? `${Math.round(b.score)}%` : "—"} ×{" "}
                                {b.weight}%
                              </span>
                              <span className="font-medium">
                                = {b.contribution != null ? b.contribution.toFixed(2) : "—"}
                              </span>
                            </div>
                          ))}
                          {!breakdown && (
                            <p className="text-muted-foreground">
                              Screening {FINAL_EVALUATION_WEIGHTS.screening}% · Interview{" "}
                              {FINAL_EVALUATION_WEIGHTS.interview}% · Assessment{" "}
                              {FINAL_EVALUATION_WEIGHTS.assessment}%
                              {practicalRequired
                                ? ` · Practical ${FINAL_EVALUATION_WEIGHTS.practical}%`
                                : " · Practical not required (weights normalized)"}
                              .
                            </p>
                          )}
                          <div className="border-t border-border pt-1 font-medium">
                            Overall Score = {preview?.overall_score != null ? preview.overall_score.toFixed(2) : "—"}%
                            {overall != null && preview?.overall_score != null && overall !== preview.overall_score
                              ? ` · Rounded = ${overall}%`
                              : ""}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* SYSTEM-GENERATED requirement status (read-only) */}
                    <div className="rounded-md border border-border p-3">
                      <p className="eyebrow">Requirement Status — System Generated</p>
                      <div className="mt-2 space-y-1 text-sm">
                        <p className={interviewOk ? "text-success" : "text-destructive"}>
                          {interviewOk ? "✓" : "✗"} Interview {interviewOk ? "Passed" : "Not Passed"}
                        </p>
                        <p className={assessmentOk ? "text-success" : "text-destructive"}>
                          {assessmentOk ? "✓" : "✗"} Assessment Test{" "}
                          {assessmentOk ? "Passed" : "Not Passed"}
                        </p>
                        {practicalState === "not_required" ? (
                          <p className="text-muted-foreground">— Practical Test Not Required</p>
                        ) : (
                          <p
                            className={
                              practicalState === "passed" ? "text-success" : "text-destructive"
                            }
                          >
                            {practicalState === "passed" ? "✓" : "✗"} Practical Test{" "}
                            {practicalState === "passed" ? "Passed" : "Not Passed"}
                          </p>
                        )}
                        {preview && preview.blocking_verification_issues > 0 && (
                          <p className="text-xs text-destructive">
                            ⚠ {preview.blocking_verification_issues} document verification
                            discrepanc{preview.blocking_verification_issues === 1 ? "y" : "ies"} must
                            be resolved before “Recommended for Hire”.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* HR-ENTERED final recommendation */}
                    <div className="rounded-md border border-primary/30 p-3">
                      <p className="eyebrow">Final Recommendation — HR Decision</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        The Overall Score supports your decision — it never hires automatically. Only
                        “Recommended for Hire” can proceed to Offer.
                      </p>
                      <div className="mt-2 space-y-2">
                        {(
                          [
                            "Recommended for Hire",
                            "For Another Position",
                            "Not Recommended",
                          ] as FinalRecommendation[]
                        ).map((r) => (
                          <label
                            key={r}
                            className={cn(
                              "flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm transition-colors",
                              finalChoice === r
                                ? r === "Not Recommended"
                                  ? "border-destructive bg-destructive/5"
                                  : "border-success bg-success/5"
                                : "border-border hover:border-primary/40",
                            )}
                          >
                            <input
                              type="radio"
                              name="finalChoice"
                              className={r === "Not Recommended" ? "accent-destructive" : "accent-primary"}
                              checked={finalChoice === r}
                              onChange={() => setFinalChoice(r)}
                            />
                            {r}
                          </label>
                        ))}
                      </div>
                      {finalChoice === "For Another Position" && (
                        <div className="mt-3 space-y-1.5">
                          <Label>
                            Recommended Position <span className="text-destructive">*</span>
                          </Label>
                          <Select value={finalAltJobPostId} onValueChange={setFinalAltJobPostId}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select one available position" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableAltPosts.map((j: any) => (
                                <SelectItem key={j.job_post_id} value={String(j.job_post_id)}>
                                  {j.title} — {j.department ?? ""} (
                                  {Number(j.vacancies ?? 1) - Number(j.filled_count ?? 0)} slot
                                  {Number(j.vacancies ?? 1) - Number(j.filled_count ?? 0) === 1 ? "" : "s"})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {!availableAltPosts.length && (
                            <p className="text-xs text-destructive">
                              No open positions with vacancies right now.
                            </p>
                          )}
                        </div>
                      )}
                      <div className="mt-3 space-y-2">
                        <Label>
                          Evaluator Remarks{" "}
                          {finalChoice === "Not Recommended" && (
                            <span className="text-destructive">*</span>
                          )}
                        </Label>
                        <Textarea
                          rows={3}
                          value={finalRemarks}
                          onChange={(e) => setFinalRemarks(e.target.value)}
                          placeholder="Summary of the whole process — reason for the decision…"
                        />
                      </div>
                    </div>
                  </div>
                );
              })()}

              <DialogFooter className="flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-end">
                <Button variant="outline" onClick={() => setFinalizing(null)}>
                  Cancel
                </Button>
                <Button
                  disabled={!finalChoice}
                  onClick={() =>
                    finalChoice &&
                    askConfirm({
                      title: "Complete the final evaluation?",
                      description:
                        finalChoice === "For Another Position"
                          ? `${finalizing.name} will be evaluated as "For Another Position".`
                          : `${finalizing.name} will be evaluated with the recommendation "${finalChoice}".`,
                      confirmLabel: "Yes, complete evaluation",
                      destructive: finalChoice === "Not Recommended",
                      onConfirm: () => saveFinalEvaluation(finalChoice),
                    })
                  }
                >
                  <CheckCircle2 className="mr-1.5 h-4 w-4" /> Complete Final Evaluation
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* VIEW FINAL EVALUATION DIALOG — same horizontal "Recruitment process
          results" presentation as the Final Evaluation / Verify dialogs */}
      <Dialog open={!!viewingFinal} onOpenChange={(o) => !o && setViewingFinal(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto overflow-x-hidden sm:max-w-7xl">
          {viewingFinal && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">Final Evaluation Result</DialogTitle>
                <DialogDescription>
                  {viewingFinal.name} — {viewingFinal.position} · {viewingFinal.date}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                {/* Presented result of every recruitment stage, laid out
                    horizontally with aligned heights */}
                {stageResultBlocks({
                  applicantId: viewingFinal.applicantId,
                  screeningScore: viewingFinal.screeningScore,
                  screeningStatus: viewingFinal.screeningStatus,
                  practicalRequired: viewingFinal.practicalRequired,
                })}
                <div className="rounded-md border border-border bg-muted/30 p-3">
                  <p className="eyebrow">Overall Score — System Calculated (read-only)</p>
                  <p className="font-display text-xl font-semibold text-primary">
                    {viewingFinal.overallScoreRounded ?? viewingFinal.overallScore ?? "—"}
                    {(viewingFinal.overallScoreRounded ?? viewingFinal.overallScore) != null ? "%" : ""}
                  </p>
                  {viewingFinal.scoreBreakdown && viewingFinal.scoreBreakdown.length > 0 && (
                    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                      {viewingFinal.scoreBreakdown
                        .filter((b) => b.applied)
                        .map((b) => (
                          <div key={b.key} className="flex items-center justify-between gap-3">
                            <span>
                              {b.label} — {b.score != null ? `${Math.round(b.score)}%` : "—"} ×{" "}
                              {b.weight}%
                            </span>
                            <span>= {b.contribution != null ? b.contribution.toFixed(2) : "—"}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
                <div className="rounded-md border border-border p-3">
                  <p className="eyebrow">Recommendation</p>
                  <p className="font-display text-xl font-semibold text-primary">
                    {viewingFinal.recommendation}
                  </p>
                  {viewingFinal.recommendation === "For Another Position" &&
                    viewingFinal.recommendedPositionTitle && (
                      <p className="mt-1 text-sm">
                        Recommended Position:{" "}
                        <span className="font-medium">{viewingFinal.recommendedPositionTitle}</span>
                      </p>
                    )}
                  {viewingFinal.overallRemarks && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {viewingFinal.overallRemarks}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setViewingFinal(null)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* VIEW INTERVIEW RESULT DIALOG */}
      <Dialog open={!!viewingInterview} onOpenChange={(o) => !o && setViewingInterview(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          {viewingInterview && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">
                  Interview Result — {viewingInterview.name}
                </DialogTitle>
                <DialogDescription>
                  {viewingInterview.position} — interviewed {viewingInterview.date}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-3">
                  <div>
                    <p className="eyebrow">Total score</p>
                    <p className="font-display text-3xl font-semibold text-primary">
                      {viewingInterview.total}%
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={
                        viewingInterview.outcome === "Recommended"
                          ? "border-success/30 bg-success/15 text-success"
                          : viewingInterview.outcome === "Hold"
                            ? "border-warning/40 bg-warning/20 text-warning-foreground"
                            : "border-destructive/30 bg-destructive/10 text-destructive"
                      }
                    >
                      {viewingInterview.outcome}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={
                        viewingInterview.result === "Passed"
                          ? "border-success/40 bg-success/10 text-success"
                          : "border-destructive/40 bg-destructive/10 text-destructive"
                      }
                    >
                      {viewingInterview.result}
                    </Badge>
                  </div>
                </div>
                <div className="overflow-hidden rounded-md border border-border">
                  <div className="grid grid-cols-1 gap-2 border-b border-border bg-muted/40 px-4 py-2 md:grid-cols-[1fr_80px_1fr] md:gap-4">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Category
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Rate
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Comments
                    </span>
                  </div>
                  {assessmentCriteria.map((c, idx) => (
                    <div
                      key={c}
                      className={
                        "grid grid-cols-1 gap-1 px-4 py-2.5 md:grid-cols-[1fr_80px_1fr] md:gap-4" +
                        (idx > 0 ? " border-t border-border" : "")
                      }
                    >
                      <span className="text-sm font-medium">{c}</span>
                      <span className="text-sm text-muted-foreground">
                        {viewingInterview.scores[c] != null
                          ? `${viewingInterview.scores[c]} / 5`
                          : "—"}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {viewingInterview.comments?.[c] || "—"}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="rounded-md border border-border p-3">
                  <p className="eyebrow">Overall Evaluation</p>
                  <p className="text-sm text-muted-foreground">{viewingInterview.remarks}</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setViewingInterview(null)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* VIEW ASSESSMENT TEST RESULT DIALOG */}
      <Dialog
        open={!!viewingAssessmentTest}
        onOpenChange={(o) => !o && setViewingAssessmentTest(null)}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
          {viewingAssessmentTest && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">
                  Assessment Test Result — {viewingAssessmentTest.name}
                </DialogTitle>
                <DialogDescription>
                  {viewingAssessmentTest.title} — {viewingAssessmentTest.position} ·{" "}
                  {viewingAssessmentTest.date}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-3">
                  <div>
                    <p className="eyebrow">Score result</p>
                    <p className="font-display text-3xl font-semibold text-primary">
                      {viewingAssessmentTest.total}%
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Passing score: {viewingAssessmentTest.passing}% ·{" "}
                      {
                        viewingAssessmentTest.questions.filter(
                          (q, idx) => (viewingAssessmentTest.scores[String(idx)] ?? 0) >= q.points,
                        ).length
                      }
                      /{viewingAssessmentTest.questions.length} correct
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      viewingAssessmentTest.result === "Passed"
                        ? "border-success/40 bg-success/10 text-success"
                        : "border-destructive/40 bg-destructive/10 text-destructive"
                    }
                  >
                    {viewingAssessmentTest.result}
                  </Badge>
                </div>
              </div>
              <DialogFooter className="sm:justify-between">
                <Button
                  variant="outline"
                  className="sm:mr-auto"
                  onClick={() => setViewingTestAnswers(viewingAssessmentTest)}
                >
                  <Eye className="mr-1.5 h-3.5 w-3.5" /> View Test & Answer
                </Button>
                <Button variant="outline" onClick={() => setViewingAssessmentTest(null)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* VIEW PRACTICAL RESULT DIALOG */}
      <Dialog open={!!viewingPractical} onOpenChange={(o) => !o && setViewingPractical(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          {viewingPractical && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">
                  Practical Assessment Result — {viewingPractical.name}
                </DialogTitle>
                <DialogDescription>
                  {viewingPractical.position} — {viewingPractical.taskTitle} ·{" "}
                  {viewingPractical.date}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-3">
                  <div>
                    <p className="eyebrow">Computed score</p>
                    <p className="font-display text-3xl font-semibold text-primary">
                      {viewingPractical.total}%
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      viewingPractical.result === "Passed"
                        ? "border-success/40 bg-success/10 text-success"
                        : "border-destructive/40 bg-destructive/10 text-destructive"
                    }
                  >
                    {viewingPractical.result}
                  </Badge>
                </div>
                <div className="overflow-hidden rounded-md border border-border">
                  <div className="grid grid-cols-[1fr_64px_1fr] gap-2 border-b border-border bg-muted/40 px-3 py-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Criterion
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Rate
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Comments
                    </span>
                  </div>
                  {viewingPractical.criteria.map((c, idx) => (
                    <div
                      key={idx}
                      className={
                        "grid grid-cols-[1fr_64px_1fr] gap-2 px-3 py-2.5" +
                        (idx > 0 ? " border-t border-border" : "")
                      }
                    >
                      <span className="min-w-0 text-sm font-medium">{c.criterion}</span>
                      <span className="text-sm text-muted-foreground">
                        {viewingPractical.scores[String(idx)] ?? 0} / {c.maxPoints}
                      </span>
                      <span className="min-w-0 break-words text-xs text-muted-foreground">
                        {c.comment || "—"}
                      </span>
                    </div>
                  ))}
                </div>
                {viewingPractical.remarks && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Overall evaluation:</span>{" "}
                    {viewingPractical.remarks}
                  </p>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setViewingPractical(null)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* TEST & ANSWERS REVIEW DIALOG */}
      <Dialog open={!!viewingTestAnswers} onOpenChange={(o) => !o && setViewingTestAnswers(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          {viewingTestAnswers &&
            (() => {
              const row = viewingTestAnswers;
              const mockSet = getMockAssessmentQuestions(row.position);
              const useMock = mockSet.length === row.questions.length;
              const picked = testAnswerMap[row.id] ?? {};
              return (
                <>
                  <DialogHeader>
                    <DialogTitle className="font-display text-2xl">
                      Test & Answers — {row.name}
                    </DialogTitle>
                    <DialogDescription>
                      {row.title} — {row.position} · {row.date} · {row.total}% ({row.result})
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    {(useMock ? mockSet : []).map((q, idx) =>
                      useMock ? (
                        <div key={idx} className="rounded-md border border-border p-3">
                          <p className="text-sm font-semibold">
                            Q{idx + 1}. {q.title}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{q.scenario}</p>
                          <div className="mt-2 space-y-1.5">
                            {q.options.map((opt, optIdx) => {
                              const isCorrect = optIdx === q.correctIndex;
                              const isPicked = picked[idx] === optIdx;
                              return (
                                <div
                                  key={optIdx}
                                  className={cn(
                                    "flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs",
                                    isCorrect
                                      ? "border-success/50 bg-success/10"
                                      : isPicked
                                        ? "border-destructive/50 bg-destructive/10"
                                        : "border-border",
                                  )}
                                >
                                  <span className="flex-1">{opt}</span>
                                  {isCorrect && (
                                    <Badge
                                      variant="outline"
                                      className="border-success/40 bg-success/10 text-success"
                                    >
                                      Correct answer
                                    </Badge>
                                  )}
                                  {isPicked && !isCorrect && (
                                    <Badge
                                      variant="outline"
                                      className="border-destructive/40 bg-destructive/10 text-destructive"
                                    >
                                      Your answer
                                    </Badge>
                                  )}
                                  {isPicked && isCorrect && (
                                    <Badge
                                      variant="outline"
                                      className="border-success/40 bg-success/10 text-success"
                                    >
                                      Your answer
                                    </Badge>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          {(row.scores[String(idx)] ?? 0) >= q.points ? (
                            <p className="mt-1.5 text-xs font-medium text-success">Correct</p>
                          ) : (
                            <p className="mt-1.5 text-xs font-medium text-destructive">Wrong</p>
                          )}
                        </div>
                      ) : null,
                    )}
                    {!useMock &&
                      row.questions.map((q, idx) => (
                        <div
                          key={idx}
                          className="flex items-start justify-between gap-3 rounded-md border border-border px-3 py-2"
                        >
                          <p className="text-sm font-medium">
                            Q{idx + 1}. {q.question}
                          </p>
                          {(row.scores[String(idx)] ?? 0) >= q.points ? (
                            <Badge
                              variant="outline"
                              className="border-success/40 bg-success/10 text-success"
                            >
                              Correct
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-destructive/40 bg-destructive/10 text-destructive"
                            >
                              Wrong
                            </Badge>
                          )}
                        </div>
                      ))}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setViewingTestAnswers(null)}>
                      Close
                    </Button>
                  </DialogFooter>
                </>
              );
            })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
