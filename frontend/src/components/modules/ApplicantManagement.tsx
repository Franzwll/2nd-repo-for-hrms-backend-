import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  BookMarked,
  Briefcase,
  CalendarClock,
  CalendarDays,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Info,
  CheckCircle2,
  ClipboardCheck,
  Download,
  Eye,
  ExternalLink,
  FileText,
  CalendarPlus,
  History,
  Image as ImageIcon,
  Loader2,
  Mail,
  MoreHorizontal,
  Pencil,
  Plus,
  Repeat2,
  ScanLine,
  Search,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  Star,
  Trash2,
  Trophy,
  Upload,
  UserPlus,
  Users,
  X,
  XCircle,
  ZoomIn,
  ZoomOut,
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
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { departments, positions } from "@/data/hr";
import { hireStore } from "@/data/hires";
import { jobs } from "@/data/jobs";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { SortHead, useSort } from "@/components/portal/sortable";
import {
  applicantsApi,
  assessmentsApi,
  auditLogApi,
  interviewsApi,
  jobPostsApi,
  resolveStorageUrl,
  screeningApi,
  settingsApi,
  type ApiApplicant,
  type ApiInterview,
  type ApiScreeningPreview,
  type ApiScreeningReference,
  type ApiSystemUser,
} from "@/lib/api";
import { exportReport, type ReportFormat } from "@/lib/report-export";
import {
  isValidEmail,
  isValidName,
  isValidPhone,
  sanitizeName,
  sanitizePhone,
} from "@/lib/validation";

function transformApiApplicant(a: ApiApplicant): Applicant {
  return {
    id: a.applicant_code || `APP-${a.applicant_id}`,
    dbId: a.applicant_id,
    name: a.name || `Applicant #${a.applicant_id}`,
    email: a.email || "",
    phone: a.phone || "0912 345 6789",
    position: a.job_post?.title || "Front Desk Receptionist",
    jobId: String(a.job_post_id ?? ""),
    appliedAt: a.applied_at ? a.applied_at.slice(0, 16).replace("T", " ") : "2026-07-25 12:00",
    score: a.fit_score || 0,
    status: normalizeApplicantStatus(a.status),
    stage: (a.stage as any) || "Screened",
    source: (a.source || "Online Portal") as any,
    entities: a.screening_entities?.map((e) => ({ label: e.label, value: e.value })) || [],
    breakdown: a.screening_scores?.map((s) => ({ criterion: s.criterion, score: s.score })) || [],
    flags: a.flags_json || [],
    summary: a.summary || "",
    screening_detail: (a.latest_screening as Applicant["screening_detail"]) ?? null,
    resumeUrl: resolveStorageUrl(a.resume_url),
    resumeOriginalName: (a as any).resume_original_name ?? null,
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
  };
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
const keywordLibrary: Record<string, string[]> = {
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
  name: string;
  position: string;
  scores: Record<string, number>;
  total: number;
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

/** Default interview slot configuration � 14 interviewers / rooms, 14 time slots, on-site. */
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
 * Renders the SOP-2 screening analysis surfaces required in Applicant
 * Management: missing essential information, job-role recognition and the
 * credential analysis. All values come from the persisted spaCy screening
 * payload (`latest_screening`) - nothing is recomputed client-side.
 */
export function ScreeningAnalysisSections({
  detail,
  className,
}: {
  detail: ScreeningAnalysisDetail | null | undefined;
  className?: string;
}) {
  if (!detail) return null;

  const missingInfo = detail.missing_information ?? [];
  const roles = detail.validation?.job_role_analysis;
  const recognizedRoles = roles?.recognized ?? [];
  const unrecognizedRoles = roles?.unrecognized ?? [];
  const credentialIssues = detail.validation?.credential_issues ?? [];

  return (
    <div className={cn("divide-y divide-border rounded-md border border-border", className)}>
      {/* Guide AM item 6 - Missing information */}
      <ScreeningAnalysisRow
        label="Missing essential information"
        labelClassName={missingInfo.length > 0 ? "text-caution" : undefined}
      >
        {missingInfo.length > 0 ? (
          <span className="text-caution">{missingInfo.join(", ")}</span>
        ) : (
          <span className="text-muted-foreground">
            All required personal information was extracted.
          </span>
        )}
      </ScreeningAnalysisRow>

      {/* Guide AM items 7/8 - Skill & job-role analysis */}
      <ScreeningAnalysisRow label="Recognized job roles">
        {recognizedRoles.length > 0 ? (
          <span>{recognizedRoles.join(", ")}</span>
        ) : (
          <span className="text-muted-foreground">None matched the reference data</span>
        )}
      </ScreeningAnalysisRow>
      <ScreeningAnalysisRow
        label={
          <span className="flex items-center gap-1">
            <Info className="h-3 w-3" /> Unrecognized job roles (flagged for review)
          </span>
        }
        labelClassName={unrecognizedRoles.length > 0 ? "text-caution" : undefined}
      >
        {unrecognizedRoles.length > 0 ? (
          <span className="text-caution">{unrecognizedRoles.join(", ")}</span>
        ) : (
          <span className="text-muted-foreground">None</span>
        )}
      </ScreeningAnalysisRow>

      {/* Guide AM item 9 - Credential analysis */}
      <ScreeningAnalysisRow
        label="Credential analysis"
        labelClassName={credentialIssues.length > 0 ? "text-destructive" : undefined}
      >
        {credentialIssues.length > 0 ? (
          <ul className="list-disc space-y-1 pl-4">
            {credentialIssues.map((c, i) => (
              <li key={i}>
                <span className="font-medium">{c.type}:</span> {c.detail}
                {c.note && <span className="block text-xs text-muted-foreground">{c.note}</span>}
              </li>
            ))}
          </ul>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <ShieldCheck className="text-success h-4 w-4" />
            Valid according to system validation rules (internal reference data only - not an
            external verification).
          </span>
        )}
      </ScreeningAnalysisRow>

      {credentialIssues.length > 0 && (
        <div className="bg-destructive/5 flex items-start gap-2 p-3 text-xs text-muted-foreground">
          <ShieldAlert className="text-destructive mt-0.5 h-3.5 w-3.5 shrink-0" />
          <p>
            "Invalid credential" means invalid or requires verification based on system validation
            rules. It does not imply fraud.
          </p>
        </div>
      )}
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
    label: "Certification",
    className:
      "border-success/30 bg-success/10 text-success dark:border-success/40 dark:bg-success/20",
  },
};

const SCREENING_TYPE_OPTIONS = Object.entries(SCREENING_TYPE_META) as [
  ScreeningRefType,
  { label: string },
][];

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
  const [typeFilter, setTypeFilter] = useState<"all" | ScreeningRefType>("all");
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows
      .filter((r) => (typeFilter === "all" ? true : r.data_type === typeFilter))
      .filter((r) =>
        q
          ? `${r.canonical_value} ${(r.aliases_json ?? []).join(" ")}`.toLowerCase().includes(q)
          : true,
      );
  }, [rows, typeFilter, search]);

  const counts = useMemo(
    () => ({
      skill: rows.filter((r) => r.data_type === "skill").length,
      job_role: rows.filter((r) => r.data_type === "job_role").length,
      certification: rows.filter((r) => r.data_type === "certification").length,
      active: rows.filter((r) => r.active).length,
    }),
    [rows],
  );

  const openCreate = () => {
    setEditing(null);
    setForm({ data_type: "skill", canonical_value: "", aliases: "" });
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
              Database-managed vocabulary used by the NLP service to classify skills, job roles and
              certifications as RECOGNIZED or UNRECOGNIZED. Changes apply to every new screening.
            </p>
          </div>
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add entry
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <Badge variant="secondary">Skills: {counts.skill}</Badge>
          <Badge variant="secondary">Job Roles: {counts.job_role}</Badge>
          <Badge variant="secondary">Certifications: {counts.certification}</Badge>
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
            <div className="flex flex-wrap gap-2">
              <Select
                value={typeFilter}
                onValueChange={(v) => setTypeFilter(v as "all" | ScreeningRefType)}
              >
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {SCREENING_TYPE_OPTIONS.map(([value, meta]) => (
                    <SelectItem key={value} value={value}>
                      {meta.label}s
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search value or alias…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-56 pl-8"
                />
              </div>
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
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                        No entries match the current filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((row) => (
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
                                <Badge key={alias} variant="secondary" className="text-[0.65rem]">
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
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>

      {/* ADD / EDIT DIALOG */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Reference Entry" : "Add Reference Entry"}</DialogTitle>
            <DialogDescription>
              Canonical values are matched against entities extracted from resumes; aliases let
              alternate phrasings map to the same entry.
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

export function ApplicantManagement({ role }: { role: "superadmin" | "admin" }) {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Applicant[]>([]);

  useEffect(() => {
    const excludeStages = role === "admin" ? "Hired,Rejected" : "Hired";
    Promise.allSettled([
      applicantsApi.list({ per_page: 100, exclude_stages: excludeStages }),
      interviewsApi.list({ per_page: 100 }),
      assessmentsApi.list({ per_page: 100 }),
    ])
      .then(([appRes, intRes, asmRes]) => {
        if (appRes.status === "fulfilled") {
          setRows((appRes.value?.data ?? []).map(transformApiApplicant));
        }
        if (intRes.status === "fulfilled") {
          setInterviews((intRes.value?.data ?? []).map(transformApiInterview));
        }
        if (asmRes.status === "fulfilled") {
          setAssessments(
            (asmRes.value?.data ?? []).map((a) => ({
              applicantId: a.applicant?.applicant_code ?? `APP-${a.applicant_id}`,
              name: a.applicant?.name ?? `Applicant #${a.applicant_id}`,
              position: a.applicant?.position ?? "—",
              scores: a.scores_json ?? {},
              total: Math.round(a.total_score ?? 0),
              remarks: a.remarks ?? "",
              date: a.assessment_date,
              outcome: a.outcome,
            })),
          );
        }
      })
      .catch((err) => {
        console.warn("Could not fetch applicants/interviews/assessments from API:", err);
      });
  }, []);

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
    userManagementApi.users
      .list()
      .then((res) => setAssessors(res.data))
      .catch(() => {
        console.warn("Could not fetch system users for assessor selector.");
      });
  }, []);

  const [tab, setTab] = useState("ranking");
  const [positionFilter, setPositionFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [rankingFilter, setRankingFilter] = useState<"all" | "passed" | "ready">("all");
  const applicantListRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [review, setReview] = useState<Applicant | null>(null);
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
  const [assessmentFilter, setAssessmentFilter] = useState<"ready" | "completed" | "all">("all");
  /** Pending accept/reject decision awaiting confirmation. */
  const [assessDecision, setAssessDecision] = useState<{
    r: AssessmentResult;
    kind: "accept" | "reject";
  } | null>(null);
  const [assessmentSearch, setAssessmentSearch] = useState("");
  const [assessmentDept, setAssessmentDept] = useState<string>("all");
  const [assessmentOutcome, setAssessmentOutcome] = useState<string>("all");
  const [evalScores, setEvalScores] = useState<Record<string, number>>({});
  const [evalRemarks, setEvalRemarks] = useState("");
  const [evalAssessor, setEvalAssessor] = useState("");
  const [evalDateTime, setEvalDateTime] = useState(() => isoOf(new Date()));
  const [viewMonth, setViewMonth] = useState<Date>(new Date(2026, 7, 1));
  const [reportsOpen, setReportsOpen] = useState(false);
  const [screeningOpen, setScreeningOpen] = useState(false);
  const [interviewSearch, setInterviewSearch] = useState("");
  const [interviewStatusFilter, setInterviewStatusFilter] = useState<string>("all");
  const [interviewModeFilter, setInterviewModeFilter] = useState<string>("all");
  const [calSearch, setCalSearch] = useState("");
  const [calStatusFilter, setCalStatusFilter] = useState<string>("all");
  const [slotSettings, setSlotSettings] = useState(DEFAULT_SLOT_SETTINGS);
  const [slotDialogOpen, setSlotDialogOpen] = useState(false);

  /** Interview pending cancellation confirmation. */
  const [cancelInterview, setCancelInterview] = useState<Interview | null>(null);
  const [schedule, setSchedule] = useState({
    applicant: "",
    date: "2026-08-03",
    time: buildTimeSlots(
      DEFAULT_SLOT_SETTINGS.startTime,
      DEFAULT_SLOT_SETTINGS.intervalMinutes,
      DEFAULT_SLOT_SETTINGS.slotCount,
    )[0]!,
    mode: DEFAULT_SLOT_SETTINGS.defaultMode as string,
    interviewer: interviewers[0]!.name,
  });
  const [scheduleDept, setScheduleDept] = useState<string>("all");
  /** Interview being rescheduled — prefills Book an Interview and updates the record on confirm. */
  const [rescheduling, setRescheduling] = useState<Interview | null>(null);

  // Audit / history log — fully backed by database (audit_logs table)
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(true);
  const [auditSearch, setAuditSearch] = useState("");
  const [auditActionFilter, setAuditActionFilter] = useState<string>("all");
  const [auditDeptFilter, setAuditDeptFilter] = useState<string>("all");
  const [auditActorFilter, setAuditActorFilter] = useState<string>("all");

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
            target: a.target_id ?? a.target ?? "—",
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

  // Report format state
  const [reportFormat, setReportFormat] = useState<ReportFormat>("pdf");

  // Add-applicant flow
  const [addOpen, setAddOpen] = useState(false);
  const [addStep, setAddStep] = useState<1 | 2 | 3>(1);
  const [addMethod, setAddMethod] = useState<"file" | "image">("file");
  const [addFileName, setAddFileName] = useState("");
  const [addResumeFile, setAddResumeFile] = useState<File | null>(null);
  /** True while a file is being dragged over the resume drop zone. */
  const [resumeDragActive, setResumeDragActive] = useState(false);
  /** Pending upload awaiting user confirmation to replace existing details. */
  const [pendingResume, setPendingResume] = useState<File | null>(null);
  const [replaceOpen, setReplaceOpen] = useState(false);
  const [addDept, setAddDept] = useState<string>(positions[0]!.department);
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    position: positions[0]!.title,
  });
  const [screenResult, setScreenResult] = useState<{
    score: number;
    status: ApplicantStatus;
    entities: { label: string; value: string }[];
    detail?: ApiScreeningPreview | null;
  } | null>(null);
  const [screeningLoading, setScreeningLoading] = useState(false);

  /** Maps the NLP service's official status codes to the UI status values. */
  const toUiStatus = (code: unknown): ApplicantStatus => {
    switch (code) {
      case "PERFECT_FOR_THE_JOB":
        return "fit";
      case "INVALID_CREDENTIAL":
        return "credential";
      case "FIT_FOR_OTHER_JOB":
        return "other-role";
      default:
        return "not-fit";
    }
  };

  /** Validates type/size, then routes through the replacement-confirmation
   *  rules: if the form already holds any applicant details (typed or
   *  extracted from a previous resume), a confirm modal protects them;
   *  an empty form accepts the new resume silently. */
  const handleResumeFile = (file: File | null | undefined) => {
    if (!file) return;
    const isImage = addMethod === "image";
    const name = file.name.toLowerCase();
    const okType = isImage
      ? /\.(jpe?g|png)$/.test(name) || file.type === "image/jpeg" || file.type === "image/png"
      : /\.(pdf|docx?)$/.test(name);
    if (!okType) {
      toast.error(
        isImage
          ? "Unsupported image — please use a JPG or PNG file."
          : "Unsupported file — please use a PDF or DOCX resume.",
      );
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is larger than the 10 MB limit.");
      return;
    }
    const hasExistingDetails = [addForm.name, addForm.email, addForm.phone, addForm.address].some(
      (v) => v.trim().length > 0,
    );
    if (hasExistingDetails) {
      setPendingResume(file);
      setReplaceOpen(true);
      return;
    }
    applyResumeFile(file);
  };

  /** Applies the file unconditionally and runs the extraction auto-fill
   *  in replace mode (values overwrite whatever the form held). */
  const applyResumeFile = (file: File) => {
    setAddResumeFile(file);
    setAddFileName(file.name);
    void autofillFromResume(file, { overwrite: true });
  };

  /** Latest-request guard so a quick re-upload never applies stale results. */
  const autofillSeq = useRef(0);
  const [resumeAutofilling, setResumeAutofilling] = useState(false);

  const autofillFromResume = async (
    file: File,
    opts: { overwrite: boolean } = { overwrite: false },
  ) => {
    const seq = ++autofillSeq.current;
    setResumeAutofilling(true);
    try {
      const fd = new FormData();
      fd.append("resume", file);
      const res = await applicantsApi.extractResume(fd);
      if (seq !== autofillSeq.current || !res.success) return;
      const pi = res.personal_information ?? {};
      const filled: string[] = [];
      setAddForm((prev) => {
        const next = { ...prev };
        const put = (key: "name" | "email" | "phone" | "address", raw?: string | null) => {
          const value = key === "phone" ? (normalizePHPhone(raw) ?? "") : (raw?.trim() ?? "");
          if (!value) return;
          if (!opts.overwrite && next[key].trim()) return; // merge mode: keep user input
          if (next[key].trim() === value) return; // nothing to change
          next[key] = value;
          filled.push(key);
        };
        put("name", pi.name);
        put("email", pi.email);
        put("phone", pi.phone);
        put("address", pi.address);
        return next;
      });
      if (filled.length) {
        toast.info(
          `${opts.overwrite ? "Replaced" : "Auto-filled"} ${filled.length} field${filled.length === 1 ? "" : "s"} from "${file.name}" — review before continuing.`,
        );
      }
    } catch (e) {
      console.warn("Resume auto-fill failed:", e);
      if (seq === autofillSeq.current) {
        toast.error("Could not read contact details from this resume.");
      }
    } finally {
      if (seq === autofillSeq.current) setResumeAutofilling(false);
    }
  };

  /** Blob URL for previewing the selected resume; revoked on change/unmount. */
  const [resumePreviewUrl, setResumePreviewUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!addResumeFile) {
      setResumePreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(addResumeFile);
    setResumePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [addResumeFile]);

  /** Zoom levels for resume previews (50-300%, default 200% centered). */
  const [addPreviewZoom, setAddPreviewZoom] = useState(200);
  const [reviewPreviewZoom, setReviewPreviewZoom] = useState(200);
  useEffect(() => setAddPreviewZoom(200), [addResumeFile]);
  useEffect(() => setReviewPreviewZoom(200), [review?.id]);

  /** DOCX HTML preview for local file (Add Applicant) */
  const addDocxContainerRef = useRef<HTMLDivElement>(null);
  const [addDocxLoading, setAddDocxLoading] = useState(false);
  const [addDocxError, setAddDocxError] = useState<string | null>(null);
  useEffect(() => {
    if (!addResumeFile || !/\.docx$/i.test(addResumeFile.name)) {
      if (addDocxContainerRef.current) addDocxContainerRef.current.innerHTML = "";
      setAddDocxError(null);
      setAddDocxLoading(false);
      return;
    }
    let cancelled = false;
    setAddDocxLoading(true);
    setAddDocxError(null);
    const render = async () => {
      // Wait for container to mount (docx branch is conditional on resumePreviewUrl)
      for (let i = 0; i < 20; i++) {
        if (cancelled) return;
        if (addDocxContainerRef.current) break;
        await new Promise((r) => setTimeout(r, 50));
      }
      const el = addDocxContainerRef.current;
      if (!el || cancelled) {
        setAddDocxLoading(false);
        return;
      }
      el.innerHTML = "";
      try {
        const { renderAsync } = await import("docx-preview");
        const ab = await addResumeFile.arrayBuffer();
        if (cancelled || !addDocxContainerRef.current) return;
        await renderAsync(ab, addDocxContainerRef.current, undefined, {
          className: "docx",
          inWrapper: false,
          ignoreWidth: false,
          ignoreHeight: false,
          ignoreFonts: false,
          breakPages: true,
          ignoreLastRenderedPageBreak: true,
          experimental: false,
        } as any);
      } catch (e) {
        if (!cancelled) setAddDocxError(String(e));
      } finally {
        if (!cancelled) setAddDocxLoading(false);
      }
    };
    render();
    return () => {
      cancelled = true;
    };
  }, [addResumeFile, resumePreviewUrl]);

  useEffect(() => {
    if (!addResumeFile && addDocxContainerRef.current) {
      addDocxContainerRef.current.innerHTML = "";
    }
  }, [addResumeFile]);

  /** DOCX preview for server file (Review) — actual Word rendering */
  const reviewDocxContainerRef = useRef<HTMLDivElement>(null);
  const [reviewDocxLoading, setReviewDocxLoading] = useState(false);
  const [reviewDocxError, setReviewDocxError] = useState<string | null>(null);
  useEffect(() => {
    const isDocx = /\.docx$/i.test(review?.resumeUrl || "") || /\.docx$/i.test(review?.resumeOriginalName || "");
    if (!review?.resumeUrl || !isDocx) {
      if (reviewDocxContainerRef.current) reviewDocxContainerRef.current.innerHTML = "";
      setReviewDocxError(null);
      setReviewDocxLoading(false);
      return;
    }
    let cancelled = false;
    setReviewDocxLoading(true);
    setReviewDocxError(null);
    const render = async () => {
      for (let i = 0; i < 20; i++) {
        if (cancelled) return;
        if (reviewDocxContainerRef.current) break;
        await new Promise((r) => setTimeout(r, 50));
      }
      const el = reviewDocxContainerRef.current;
      if (!el || cancelled) {
        setReviewDocxLoading(false);
        return;
      }
      el.innerHTML = "";
      try {
        const { renderAsync } = await import("docx-preview");
        const resp = await fetch(review.resumeUrl!);
        if (!resp.ok) throw new Error("fetch failed");
        const ab = await resp.arrayBuffer();
        if (cancelled || !reviewDocxContainerRef.current) return;
        await renderAsync(ab, reviewDocxContainerRef.current, undefined, {
          className: "docx",
          inWrapper: false,
          ignoreWidth: false,
          ignoreHeight: false,
          ignoreFonts: false,
          breakPages: true,
          ignoreLastRenderedPageBreak: true,
        } as any);
      } catch (e) {
        if (!cancelled) setReviewDocxError(String(e));
      } finally {
        if (!cancelled) setReviewDocxLoading(false);
      }
    };
    render();
    return () => {
      cancelled = true;
    };
  }, [review?.resumeUrl, review?.resumeOriginalName]);

  /** Opens the selected resume in a new tab (images/PDFs render natively). */
  const openResumePreview = () => {
    if (resumePreviewUrl) window.open(resumePreviewUrl, "_blank", "noopener");
  };

  /**
   * Stages hidden from the active pipeline lists.
   * Hired applicants move to New Hire Onboarding and are no longer shown;
   * rejected applicants stay visible to the super admin only.
   */
  const hiddenStages = role === "admin" ? ["Hired", "Rejected"] : ["Hired"];
  const isHiddenStage = (a: Applicant) => hiddenStages.includes(a.stage);

  /** Stages where the hiring decision is already made — these applicants can
   *  no longer be accepted & scheduled, rejected, or referred to another role
   *  from the applicant list review. */
  const LOCKED_ACTION_STAGES: Applicant["stage"][] = [
    "Interview Scheduled",
    "Assessed",
    "Accepted",
    "Offer",
    "Rejected",
  ];
  const isActionLocked = (a: Applicant) => LOCKED_ACTION_STAGES.includes(a.stage);

  /** Interviews can only be rescheduled / cancelled while the applicant is
   *  still within the interview phase (not yet assessed / accepted / offered /
   *  hired / rejected) and the interview itself has not been completed. */
  const isInterviewLocked = (i: { status: string; applicant: string }): boolean => {
    if (i.status === "Completed") return true;
    const src = rows.find((r) => r.name === i.applicant);
    if (!src) return false;
    return ["Assessed", "Accepted", "Offer", "Hired", "Rejected"].includes(src.stage);
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

  const topFiveToday = useMemo(
    () =>
      [...rows]
        .filter((a) => !isHiddenStage(a))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5),
    [rows, isHiddenStage],
  );

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

  /** Opens the Interview Scheduling section, focused on today's date. */
  const goToTodayInterviews = () => {
    setTab("scheduling");
    setSchedule((s) => ({ ...s, date: TODAY_ISO }));
    const d = new Date(`${TODAY_ISO}T00:00:00`);
    setViewMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    setInterviewSearch("");
    setInterviewStatusFilter("all");
    setInterviewModeFilter("all");
  };

  /** Opens the Assessments section filtered to applicants ready for assessment. */
  const goToReadyToAssess = () => {
    setTab("assessment");
    setAssessmentFilter("ready");
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

  /** Rejecting an assessment drops the row from the list. */
  const rejectAssessment = async (r: AssessmentResult) => {
    const applicant = rows.find((a) => a.id === r.applicantId);
    setStage(r.applicantId, "Rejected");
    addAudit({
      actionType: "Assessment Rejected",
      target: r.name,
      module: "Applicant Management",
      details: `Rejected after assessment (${r.total}%)`,
    });
    setAssessments((prev) => prev.filter((a) => a.applicantId !== r.applicantId));
    toast.success(`${r.name} rejected after assessment`);

    try {
      if (applicant?.dbId) {
        await applicantsApi.update(applicant.dbId, { stage: "Rejected" });
      }
    } catch (e) {
      console.warn("Could not update applicant stage on database API:", e);
    }
  };

  /** Accept ? prefill the scheduler and jump to the Interview Scheduling tab. */
  const acceptAndSchedule = (a: Applicant) => {
    if (isActionLocked(a)) return;
    const dept =
      positions.find((p) => p.title === a.position)?.department ??
      jobs.find((j) => j.id === a.jobId)?.department;
    const known = dept && departments.some((d) => d.name === dept) ? dept : "all";
    setScheduleDept(known);
    setSchedule((s) => ({ ...s, applicant: a.name }));
    // Accepted applicants (stage) become selectable for interview booking
    setStage(a.id, "Accepted");
    setReview(null);
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
      ? (positions.find((p) => p.title === src.position)?.department ??
        jobs.find((j) => j.id === src.jobId)?.department)
      : undefined;
    const known = dept && departments.some((d) => d.name === dept) ? dept : "all";
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
    });
    setRescheduling(i);
    setTab("scheduling");
    toast.success(`Rescheduling ${i.applicant}`, {
      description: `Current: ${i.date} · ${i.time} — pick a new date and slot.`,
    });
  };

  const confirmSchedule = async () => {
    if (!schedule.applicant) {
      toast.error("Select an applicant first");
      return;
    }
    // When the applicant already has an interview booked, this booking acts
    // as a reschedule of that interview instead of blocking the action.
    const existingInterview = interviews.find((i) => i.applicant === schedule.applicant);
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

    // Reschedule (or re-book) — update the existing interview record instead of creating a new one
    if (updateTarget) {
      const updated: Interview = {
        ...updateTarget,
        date: schedule.date,
        time: schedule.time,
        mode: schedule.mode as "On-site" | "Virtual",
        interviewer: schedule.interviewer,
        status: "Scheduled",
      };
      setInterviews((prev) => prev.map((x) => (x.id === updateTarget.id ? updated : x)));
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
          `${schedule.applicant} could not be saved to the database, so the interview cannot be scheduled. ${e instanceof Error ? e.message : ""
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
    };
    setInterviews((prev) => [newInt, ...prev]);
    if (src) setStage(src.id, "Interview Scheduled");
    addAudit({
      actionType: "Interview Scheduled",
      target: schedule.applicant,
      module: "Interview Scheduling",
      details: `${schedule.mode} interview booked for ${schedule.date} · ${schedule.time} with ${schedule.interviewer}.`,
    });
    toast.success(`Interview confirmed for ${schedule.applicant}`, {
      description: `${schedule.date} · ${schedule.time} · ${schedule.mode}`,
    });

    try {
      await interviewsApi.create({
        applicant_id: applicantId,
        scheduled_date: schedule.date,
        scheduled_time: schedule.time.includes(":") ? schedule.time.slice(0, 5) : "09:00",
        mode: schedule.mode,
        interviewer_name: schedule.interviewer,
        status: "Scheduled",
      });
      if (src?.email) {
        toast.success(`Interview invitation email sent to ${src.email}`);
      }
    } catch (e) {
      if (e instanceof Error && /already has a booked interview/i.test(e.message)) {
        toast.error(e.message);
      } else {
        console.warn("Could not persist interview to database API or dispatch email:", e);
        toast.error(
          `The interview could not be saved to the database. ${e instanceof Error ? e.message : ""
          }`,
        );
      }
    }
  };

  /** Generates and downloads a CSV report based on the selected report type. */
  const generateReport = (reportId: string) => {
    const timestamp = new Date().toISOString().slice(0, 10);

    if (reportId === "all") {
      const columns: CsvColumn<Applicant>[] = [
        { header: "Applicant ID", accessor: (r) => r.id },
        { header: "Name", accessor: (r) => r.name },
        { header: "Email", accessor: (r) => r.email },
        { header: "Phone", accessor: (r) => r.phone },
        { header: "Position", accessor: (r) => r.position },
        { header: "Applied At", accessor: (r) => r.appliedAt },
        { header: "Score (%)", accessor: (r) => r.score },
        { header: "Status", accessor: (r) => statusMeta[r.status].label },
        { header: "Stage", accessor: (r) => r.stage },
        { header: "Source", accessor: (r) => r.source },
      ];
      exportToCsv(`applicants-all-${timestamp}`, columns, rows);
    } else if (reportId === "status") {
      type StatusRow = { status: string; count: number; avgScore: number };
      const statusRows: StatusRow[] = (Object.keys(statusMeta) as ApplicantStatus[]).map((k) => {
        const group = rows.filter((a) => a.status === k);
        return {
          status: statusMeta[k].label,
          count: group.length,
          avgScore: group.length ? Math.round(group.reduce((t, a) => t + a.score, 0) / group.length) : 0,
        };
      });
      const columns: CsvColumn<StatusRow>[] = [
        { header: "Status", accessor: (r) => r.status },
        { header: "Count", accessor: (r) => r.count },
        { header: "Average Score (%)", accessor: (r) => r.avgScore },
      ];
      exportToCsv(`applicants-by-status-${timestamp}`, columns, statusRows);
    } else if (reportId === "position") {
      type PosRow = { position: string; total: number; passed: number; passRate: string };
      const posMap = new Map<string, Applicant[]>();
      rows.forEach((a) => {
        const list = posMap.get(a.position) ?? [];
        list.push(a);
        posMap.set(a.position, list);
      });
      const posRows: PosRow[] = Array.from(posMap.entries()).map(([pos, list]) => ({
        position: pos,
        total: list.length,
        passed: list.filter((a) => a.score >= passing).length,
        passRate: list.length ? `${Math.round((list.filter((a) => a.score >= passing).length / list.length) * 100)}%` : "0%",
      }));
      const columns: CsvColumn<PosRow>[] = [
        { header: "Position", accessor: (r) => r.position },
        { header: "Total Applicants", accessor: (r) => r.total },
        { header: "Passed Screening", accessor: (r) => r.passed },
        { header: "Pass Rate", accessor: (r) => r.passRate },
      ];
      exportToCsv(`applicants-by-position-${timestamp}`, columns, posRows);
    } else if (reportId === "screening") {
      const columns: CsvColumn<Applicant>[] = [
        { header: "Applicant ID", accessor: (r) => r.id },
        { header: "Name", accessor: (r) => r.name },
        { header: "Position", accessor: (r) => r.position },
        { header: "Score (%)", accessor: (r) => r.score },
        { header: "Status", accessor: (r) => statusMeta[r.status].label },
        { header: "Extracted Entities", accessor: (r) => r.entities.map((e) => `${e.label}: ${e.value}`).join("; ") },
        { header: "Flags", accessor: (r) => r.flags.join("; ") || "None" },
        { header: "Summary", accessor: (r) => r.summary },
      ];
      exportToCsv(`screening-results-${timestamp}`, columns, rows);
    } else if (reportId === "interview") {
      const columns: CsvColumn<Interview>[] = [
        { header: "Interview ID", accessor: (r) => r.id },
        { header: "Applicant", accessor: (r) => r.applicant },
        { header: "Position", accessor: (r) => r.position },
        { header: "Date", accessor: (r) => r.date },
        { header: "Time", accessor: (r) => r.time },
        { header: "Mode", accessor: (r) => r.mode },
        { header: "Interviewer", accessor: (r) => r.interviewer },
        { header: "Status", accessor: (r) => r.status },
      ];
      exportToCsv(`interview-summary-${timestamp}`, columns, interviews);
    }

    toast.success("Report downloaded", {
      description: "CSV file has been saved to your downloads folder.",
    });
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
      `Total score : ${saved?.total ??
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
      `Match     : ${a.score}% � ${statusMeta[a.status].label}`,
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

  /** Cancels an interview after the user confirms in the modal. */

  const performCancelInterview = async () => {
    const i = cancelInterview;
    if (!i || isInterviewLocked(i)) return;
    setInterviews((prev) => prev.filter((x) => x.id !== i.id));
    const src = rows.find((a) => a.name === i.applicant);
    if (src) setStage(src.id, "Screened");
    addAudit({
      actionType: "Interview Cancelled",
      target: i.applicant,
      module: "Interview Scheduling",
      details: `Interview on ${i.date} � ${i.time} cancelled.`,
    });
    setCancelInterview(null);
    toast(`Interview cancelled � ${i.applicant}`);

    try {
      if (i.dbId) await interviewsApi.delete(i.dbId);
    } catch (e) {
      console.warn("Could not remove interview from database API:", e);
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

  /** Persists an interview assessment to the database API and advances the applicant. */
  const saveAssessment = async () => {
    if (!evaluating) return;
    const total = Math.round(
      (assessmentCriteria.reduce((t, c) => t + (evalScores[c] ?? 4), 0) /
        (assessmentCriteria.length * 5)) *
      100,
    );
    const outcome = total >= 80 ? "Recommended" : total >= 65 ? "Hold" : "Not Recommended";
    setAssessments((prev) => [
      {
        applicantId: evaluating.id,
        name: evaluating.name,
        position: evaluating.position,
        scores: evalScores,
        total,
        remarks: evalRemarks || "No remarks recorded.",
        date: isoOf(new Date()),
        outcome,
      },
      ...prev,
    ]);
    setStage(evaluating.id, "Assessed");
    addAudit({
      actionType: "Assessment Completed",
      target: evaluating.name,
      module: "Applicant Management",
      details: `Assessment saved with a total score of ${total}%`,
    });
    setEvaluating(null);
    toast.success(`Assessment saved � ${total}%`);

    try {
      if (evaluating.dbId) {
        const datePart = evalDateTime.slice(0, 10) || isoOf(new Date());
        await applicantsApi.createAssessment(evaluating.dbId, {
          applicant_id: evaluating.dbId,
          assessor_user_id: evalAssessor ? Number(evalAssessor) : null,
          assessment_date: datePart,
          scores_json: evalScores,
          total_score: total,
          outcome,
          remarks: evalRemarks || "No remarks recorded.",
        });
        await applicantsApi.update(evaluating.dbId, { stage: "Assessed" });
      }
    } catch (e) {
      console.warn("Could not persist assessment to database API:", e);
    }
  };

  const openRefer = (a: Applicant) => {
    if (isActionLocked(a)) return;
    setReferring(a);
    const suggested = a.flags.find((f) => f.startsWith("Stronger match:"));
    setReferTarget(suggested ? suggested.replace("Stronger match:", "").split("(")[0]!.trim() : "");
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
    setReview(null);

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

  const totalWeight = criteria.reduce((t, c) => t + (c.enabled ? c.weight : 0), 0);

  /** Runs the real spaCy NLP screening through the Laravel backend.
   *  The uploaded resume is analyzed against the selected job post and all
   *  other open positions; the full result payload is kept so saving the
   *  applicant can reuse it (no second NLP call). */
  const runScreening = async () => {
    if (!addResumeFile) {
      toast.error("Upload a resume file first.");
      return;
    }
    setScreeningLoading(true);
    try {
      let jobPostId: number | undefined;
      try {
        const jobsRes = await jobPostsApi.list({ per_page: 100 });
        jobPostId = jobsRes?.data?.find((j) => j.title === addForm.position)?.job_post_id;
      } catch {
        // job post lookup failed — backend will reject without a valid id
      }
      if (!jobPostId) {
        toast.error("No job post found for the selected position.");
        return;
      }
      const fd = new FormData();
      fd.append("resume", addResumeFile);
      fd.append("job_post_id", String(jobPostId));
      const result = await applicantsApi.screenResume(fd);
      if (!result.success) {
        throw new Error(result.error_message || "The resume could not be processed.");
      }
      setScreenResult({
        score: Number((result.match_score ?? 0).toFixed(2)),
        status: toUiStatus(result.screening_status),
        entities:
          result.entities?.map((e) => ({
            label:
              e.label === "EDUCATION"
                ? "EDU"
                : e.label === "ORGANIZATION"
                  ? "ORG"
                  : e.label === "CERTIFICATION"
                    ? "CERT"
                    : e.label,
            value: e.value,
          })) ?? [],
        detail: result,
      });
      toast.success(
        `Screening complete — ${result.match_score ?? 0}% (${statusMeta[toUiStatus(result.screening_status)].label})`,
      );
      setAddStep(3);
    } catch (e) {
      console.warn("Resume screening failed:", e);
      toast.error(
        "Could not screen the resume. Make sure the NLP service is running on port 8001, then retry.",
      );
    } finally {
      setScreeningLoading(false);
    }
  };

  const saveNewApplicant = async () => {
    if (!addForm.name || !addForm.email || !addForm.phone || !addForm.address) {
      toast.error("Complete name, email, phone number and address.");
      return;
    }

    if (!isValidName(addForm.name)) {
      toast.error("Please enter a valid full name (letters only, no numbers).");
      return;
    }

    if (!isValidEmail(addForm.email)) {
      toast.error("Please enter a valid email address (e.g. name@domain.com).");
      return;
    }

    if (!isValidPhone(addForm.phone)) {
      toast.error("Please enter a valid contact number (7 to 15 digits).");
      return;
    }

    const res = screenResult!;
    const now = new Date();
    const newApp: Applicant = {
      id: `APP-${1042 + rows.length}`,
      name: addForm.name.trim(),
      email: addForm.email.trim(),
      phone: addForm.phone.trim(),
      position: addForm.position,
      jobId: addForm.position.toLowerCase().replace(/[^a-z]+/g, "-"),
      appliedAt: `${isoOf(now)} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
      score: res.score,
      status: res.status,
      stage: "Screened",
      source: addMethod === "image" ? "Walk-in" : "Online Portal",
      entities: res.entities,
      breakdown: [
        { criterion: "Skills", score: Math.round(res.score * 0.4) },
        { criterion: "Work Experience", score: Math.round(res.score * 0.3) },
        {
          criterion: "Educational Background",
          score: Math.round(res.score * 0.2),
        },
        { criterion: "Certifications", score: Math.round(res.score * 0.1) },
      ],
      flags: res.status === "credential" ? ["Manual credential verification required"] : [],
      summary: `Added via ${addMethod === "image" ? "image (OCR)" : "document"} screening — ${addFileName || "uploaded resume"}.`,
      screening_detail: (res.detail as unknown as Applicant["screening_detail"]) ?? null,
    };
    setRows((prev) => [newApp, ...prev]);
    addAudit({
      actionType: "Applicant Added",
      target: newApp.name,
      module: "Screening",
      details: `Added via ${addMethod === "image" ? "image (OCR)" : "document"} screening — ${addFileName || "uploaded resume"}, scored ${res.score}%.`,
    });
    toast.success(`${addForm.name} added to the applicant list`);
    setAddOpen(false);
    setAddStep(1);
    setScreenResult(null);
    setAddFileName("");
    setAddResumeFile(null);
    setAddForm({
      name: "",
      email: "",
      phone: "",
      address: "",
      position: positions[0]!.title,
    });

    try {
      let jobPostId = 1;
      try {
        const jobsRes = await jobPostsApi.list({ per_page: 100 });
        jobPostId = jobsRes?.data?.find((j) => j.title === newApp.position)?.job_post_id ?? 1;
      } catch {
        // fall back to the first job post when the lookup fails
      }
      const base = {
        job_post_id: jobPostId,
        name: newApp.name,
        email: newApp.email,
        phone: newApp.phone,
        source: newApp.source,
        summary: newApp.summary,
        status: newApp.status,
        stage: newApp.stage,
        flags_json: newApp.flags,
        // persist the screening score so it isn't 0% after a refresh
        fit_score: res.score,
      };
      let payload: FormData | Record<string, any> = base;
      if (addResumeFile) {
        const fd = new FormData();
        Object.entries(base).forEach(([k, v]) => {
          if (k === "flags_json") {
            fd.append(k, JSON.stringify(v ?? []));
          } else {
            fd.append(k, String(v));
          }
        });
        fd.append("resume", addResumeFile);
        // Reuse the preview's NLP result server-side (no second screening run).
        if (res.detail) {
          fd.append("screening_payload", JSON.stringify(res.detail));
        }
        payload = fd;
      }
      const created = await applicantsApi.create(payload);
      setRows((prev) =>
        prev.map((x) => (x.id === newApp.id ? { ...x, dbId: created.applicant_id } : x)),
      );
    } catch (e) {
      console.warn("Could not persist applicant to database API:", e);
      toast.error(
        `${addForm.name} was added locally, but could not be saved to the database — interview scheduling may not work for this applicant until the record is re-saved.`,
      );
    }
  };

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

  /** Bookable slot labels � excludes any slot that overlaps the configured break window. */
  const slotsForSelected = useMemo(
    () => dailySchedule.filter((s) => !s.isBreak).map((s) => s.label),
    [dailySchedule],
  );

  /** Maximum concurrent interviews per slot � limited by whichever is scarcer, interviewers or rooms. */
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

  const readyToAssess = rows.filter(
    (a) => a.stage === "Interview Scheduled" && !assessments.some((x) => x.applicantId === a.id),
  );

  /** Accepted applicants that passed screening but have no interview booked yet. */
  type InterviewRow = {
    id: string;
    applicant: string;
    position: string;
    date: string;
    time: string;
    mode: string;
    interviewer: string;
    status: string;
    pending?: boolean;
  };

  const needSchedule: InterviewRow[] = rows
    .filter(
      (a) =>
        a.stage === "Accepted" &&
        a.status === "fit" &&
        !interviews.some((i) => i.applicant === a.name),
    )
    .map((a) => ({
      id: `NS-${a.id}`,
      applicant: a.name,
      position: a.position,
      date: "",
      time: "",
      mode: "�",
      interviewer: "�",
      status: "Need to Schedule",
      pending: true,
    }));

  /**
   * Interviews visible in the Scheduled Interviews list.
   * Hired / rejected (admin only) applicants are gone from the pipeline.
   */
  const interviewRows: InterviewRow[] = [
    ...needSchedule,
    ...interviews.filter((i) => {
      const src = rows.find((r) => r.name === i.applicant);
      if (!src) return true;
      return !isHiddenStage(src);
    }),
  ];

  const interviewFiltered = interviewRows
    .filter((i) =>
      interviewSearch ? i.applicant.toLowerCase().includes(interviewSearch.toLowerCase()) : true,
    )
    .filter((i) => (interviewStatusFilter === "all" ? true : i.status === interviewStatusFilter))
    .filter((i) => (interviewModeFilter === "all" ? true : i.mode === interviewModeFilter));

  const interviewSort = useSort(interviewFiltered, {
    applicant: (i) => i.applicant,
    position: (i) => i.position,
    schedule: (i) => `${i.date} ${i.time}`,
    mode: (i) => i.mode,
    interviewer: (i) => i.interviewer,
    status: (i) => i.status,
  });

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
    positions.find((p) => p.title === position)?.department ?? "�";

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
          // Applicants who already reached Offer / Accepted / Hired /
          // Rejected no longer belong in the assessment list.
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
    const outcome = row.kind === "ready" ? "Ready for Assessment" : row.r.outcome;
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
    status: (row) => (row.kind === "ready" ? "Ready for Assessment" : row.r.outcome),
    details: (row) =>
      row.kind === "ready"
        ? row.iv
          ? `Interviewed ${row.iv.date} � ${row.iv.time}`
          : "Interview not booked"
        : `Assessed ${row.r.date} � ${row.r.remarks}`,
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

  const applicantPage = usePagination(applicantSort.sorted);
  const interviewPage = usePagination(interviewSort.sorted);
  const assessmentPage = usePagination(assessmentSort.sorted);
  const auditPage = usePagination(auditSort.sorted);

  const auditActionTypes = Array.from(new Set(auditLog.map((e) => e.actionType))).sort();
  const auditActors = Array.from(new Set(auditLog.map((e) => e.actorName))).sort();

  /**
   * Applicants available in "1. Select Applicant":
   * only accepted ones (Accept &amp; Schedule), no applicant that is already
   * booked, and none that moved past the interview stage (assessment etc.).
   */
  const scheduleApplicants = [
    ...rows.filter(
      (a) =>
        a.stage === "Accepted" &&
        !interviews.some((i) => i.applicant === a.name) &&
        !["Assessed", "Offer", "Hired", "Rejected"].includes(a.stage) &&
        (scheduleDept === "all" ||
          positions.find((p) => p.title === a.position)?.department === scheduleDept),
    ),
    // While rescheduling, the applicant being moved stays selectable even
    // though they already have a booked interview.
    ...(rescheduling
      ? rows.filter(
        (a) =>
          a.name === rescheduling.applicant &&
          (scheduleDept === "all" ||
            positions.find((p) => p.title === a.position)?.department === scheduleDept),
      )
      : []),
  ];
  const scheduleInterviewers = interviewers.filter(
    (s) => scheduleDept === "all" || s.department === scheduleDept,
  );

  return (
    <div>
      <PageHeader
        eyebrow={role === "superadmin" ? "Super Admin � Recruitment" : "Admin � Recruitment"}
        title="Applicant Management"
        description="spaCy NER resume screening, candidate ranking, interview scheduling and evaluation."
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setReportsOpen(true)}>
              <FileText className="mr-2 h-4 w-4" /> Reports
            </Button>
            <Button
              size="icon"
              variant="outline"
              aria-label="Screening setup"
              title="Screening setup"
              onClick={() => setScreeningOpen(true)}
            >
              <Settings2 className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="h-full [&>*]:h-full">
          <StatCard
            label="Total Applicants"
            value={rows.length}
            hint="Tap to view all"
            icon={Users}
            tone="primary"
            onClick={() => goToApplicants("all")}
          />
        </div>
        <div className="h-full [&>*]:h-full">
          <StatCard
            label="Passed Screening"
            value={rows.filter((a) => a.score >= passing).length}
            hint={`Passing score ${passing}%`}
            icon={CheckCircle2}
            tone="success"
            onClick={() => goToApplicants("passed")}
          />
        </div>
        <div className="h-full [&>*]:h-full">
          <StatCard
            label="Today Scheduled Interviews"
            value={interviews.filter((i) => i.date === TODAY_ISO).length}
            hint="Tap to open today's schedule"
            icon={CalendarDays}
            tone="gold"
            onClick={goToTodayInterviews}
          />
        </div>
        <div className="h-full [&>*]:h-full">
          <StatCard
            label="Ready to Assess"
            value={readyToAssess.length}
            hint="Awaiting evaluation"
            icon={ClipboardCheck}
            onClick={goToReadyToAssess}
          />
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mt-6">
        <TabsList className="flex h-auto flex-wrap justify-start rounded-xl border border-border/70 bg-muted/70 p-1 shadow-sm">
          <TabsTrigger
            className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            value="ranking"
          >
            <Trophy className="h-3.5 w-3.5" /> Ranking &amp; Applicants
          </TabsTrigger>
          <TabsTrigger
            className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            value="scheduling"
          >
            <CalendarClock className="h-3.5 w-3.5" /> Interview Scheduling
          </TabsTrigger>
          <TabsTrigger
            className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            value="assessment"
          >
            <ClipboardCheck className="h-3.5 w-3.5" /> Assessment
          </TabsTrigger>
          <TabsTrigger
            className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            value="history"
          >
            <History className="h-3.5 w-3.5" /> History &amp; Audit
          </TabsTrigger>
        </TabsList>

        {/* RANKING + TABLE */}
        <TabsContent value="ranking" className="mt-4 space-y-6">
          <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
            <Card className="border-border/70">
              <CardContent className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
                      <Trophy className="h-5 w-5 text-primary" />
                      Candidate Ranking
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Resume screening results � {screenedTotal} resume
                      {screenedTotal === 1 ? "" : "s"} processed
                      {positionFilter !== "all"
                        ? ` for ${positionFilter}`
                        : " across all positions"}
                      .
                    </p>
                  </div>
                  <Select value={positionFilter} onValueChange={setPositionFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All positions</SelectItem>
                      {positions.map((p) => (
                        <SelectItem key={p.id} value={p.title}>
                          {p.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="mt-2 flex flex-wrap items-center justify-center gap-8 py-2">
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
                          <Cell key={d.key} fill={statusChartColor[d.key]} />
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
                      <span className="font-display text-3xl font-semibold">{screenedTotal}</span>
                      <span className="text-[0.7rem] uppercase tracking-wide text-muted-foreground">
                        Resumes
                      </span>
                    </div>
                  </div>

                  <div className="grid w-full min-w-[16rem] max-w-[24rem] flex-1 grid-cols-1 gap-2">
                    {distribution.map((d) => (
                      <div
                        key={d.key}
                        className="flex items-center justify-between rounded-md border border-border px-4 py-3"
                      >
                        <span className="flex items-center gap-2 text-sm">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ background: statusChartColor[d.key] }}
                          />
                          {d.name}
                        </span>
                        <span className="font-display text-lg font-semibold">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="flex flex-col overflow-hidden border-border/70 xl:max-h-[30rem]">
              <CardContent className="flex min-h-0 flex-1 flex-col p-6">
                <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
                  <Trophy className="h-5 w-5 text-gold" /> Top 5 Candidates Today
                </h2>
                <p className="text-xs text-muted-foreground">
                  Highest ranked resumes from today&apos;s screening batch.
                </p>
                <ol className="mt-4 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
                  {topFiveToday.map((a, i) => (
                    <li
                      key={a.id}
                      className="flex flex-col gap-3 rounded-xl border border-border/80 bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
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
                        </div>
                      </div>

                      {/* Row 2: Badge (styled like the photo) + Score */}
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className={cn(
                            statusMeta[a.status].className,
                            "rounded-full border-green-200 bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:border-green-800 dark:bg-green-900/40 dark:text-green-300",
                          )}
                        >
                          {statusMeta[a.status].label}
                        </Badge>
                        <span className="font-display text-2xl font-bold text-primary">
                          {a.score}%
                        </span>
                      </div>

                      {/* Review button � full width, matches photo */}
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => setReview(a)}
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
                  <p className="text-xs text-muted-foreground">
                    Based on the applied job position
                    {positionFilter !== "all" ? ` � ${positionFilter}` : " � all positions"}.
                  </p>
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
                    placeholder="Search applicant�"
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
                      {positions.map((p) => (
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

                  <Button size="sm" onClick={() => setAddOpen(true)}>
                    <UserPlus className="mr-2 h-4 w-4" /> Add applicant
                  </Button>
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
                            title={a.appliedAt}
                          >
                            {a.appliedAt}
                          </TableCell>
                          <TableCell>
                            <span className="font-display text-sm font-semibold">{a.score}%</span>
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
                            <div className="flex justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 cursor-pointer"
                                title="Review screening result and decide"
                                onClick={() => setReview(a)}
                              >
                                <FileText className="mr-1.5 h-3.5 w-3.5" /> Review
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
                  onPageChange={applicantPage.setPage}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SCHEDULING */}
        <TabsContent value="scheduling" className="mt-4 space-y-6">
          <div className="grid gap-6 xl:grid-cols-2">
            {/* ?? Interview Calendar ??????????????????????????????? */}
            <Card className="flex h-full flex-col rounded-xl border-border/70 shadow-sm">
              <CardContent className="flex flex-1 flex-col p-5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center text-primary">
                      <CalendarDays className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="font-display text-2xl font-semibold">Interview Calendar</h2>
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
                        aria-label="Slot settings"
                        title="Slot settings"
                        onClick={() => setSlotDialogOpen(true)}
                      >
                        <Settings2 className="h-4 w-4" />
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
                    const count = interviews.filter((i) => i.date === iso).length;
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
                          "relative min-h-[2.9rem] border-b border-r border-border/70 text-sm transition-colors last:border-r-0",
                          free && !selected && "bg-success/25 font-semibold text-success",
                          full && !selected && "bg-destructive/25 font-semibold text-destructive",
                          isToday && !selected && "bg-gold/30 ring-1 ring-inset ring-gold",
                          !selected && !free && !full && "hover:bg-muted/50",
                          count === 0 &&
                          !schedulable &&
                          (cell.inMonth
                            ? "text-muted-foreground/40"
                            : "opacity-40 text-muted-foreground/40"),
                          count > 0 &&
                          !selected &&
                          !full &&
                          "bg-primary/5 font-semibold text-primary",
                          selected && free && "bg-green-700 font-semibold text-white",
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
                              "absolute bottom-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full",
                              selected ? "bg-white" : full ? "bg-destructive" : "bg-primary",
                            )}
                          />
                        )}
                        {free && (
                          <span
                            className={cn(
                              "absolute bottom-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full",
                              selected ? "bg-white" : "bg-success",
                            )}
                          />
                        )}
                        {count > 1 && (
                          <span
                            className={cn(
                              "absolute -top-1 -right-1 z-10 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[0.6rem] font-semibold text-white",
                              selected && full
                                ? "bg-red-900"
                                : selected && free
                                  ? "bg-green-800"
                                  : "bg-primary",
                            )}
                          >
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-success" /> Free day (schedulable)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-destructive" /> Full (all slots booked)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-primary" /> Booked
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-gold" /> Today
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/30" /> Not schedulable
                    / No availability
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
                            onClick={() => toast(`Viewing interview � ${i.applicant}`)}
                            className="grid w-full cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border/70 bg-muted/20 p-2.5 text-left transition-colors hover:bg-muted/40"
                          >
                            <span className="shrink-0 rounded-md bg-card px-2.5 py-1.5 text-xs font-semibold text-primary shadow-sm">
                              {i.time}
                            </span>
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
                              <button
                                type="button"
                                aria-label={`Delete interview for ${i.applicant}`}
                                title="Delete interview"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCancelInterview(interviews.find((x) => x.id === i.id) ?? null);
                                }}
                                className="rounded-md p-1 text-destructive transition-colors hover:bg-destructive/10"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                            </span>
                          </div>
                        ))}
                      {interviews.filter((i) => i.date === schedule.date).length === 0 && (
                        <p className="rounded-lg border border-dashed border-border p-5 text-center text-xs text-muted-foreground">
                          No interviews booked � the whole day is free.
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

            {/* ?? Book an Interview ???????????????????????????????? */}
            <Card className="flex h-full flex-col rounded-xl border-border/70 shadow-sm">
              <CardContent className="flex flex-1 flex-col p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center text-primary">
                    <CalendarClock className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-display text-2xl font-semibold">Book an Interview</h2>
                    <p className="text-xs text-muted-foreground">
                      Fill in the details to schedule an interview and send an invite.
                    </p>
                  </div>
                </div>

                {/* Booking progress removed per user request */ undefined}

                <div className="mt-4 flex-1 space-y-4">
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
                              The number of interviews that can happen at the same time based on
                              available interviewers and rooms.
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
                                      roomsAvailable: Math.max(1, Number(e.target.value) || 1),
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
                              Free-day indicators on the interview calendar only apply to the days
                              selected here.
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
                                        active ? prev.filter((d) => d !== day) : [...prev, day],
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
                                <CalendarDays className="h-3.5 w-3.5" /> BREAK SLOT (UNAVAILABLE
                                TIME)
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
                                        (((startMin + mins) % (24 * 60)) + 24 * 60) % (24 * 60);
                                      const eh = String(Math.floor(endMin / 60)).padStart(2, "0");
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
                                <CalendarDays className="h-3.5 w-3.5" /> DAILY SCHEDULE PREVIEW
                              </p>
                              <Badge
                                variant="outline"
                                className="border-primary/30 bg-primary/10 text-primary"
                              >
                                {slotsForSelected.length} slots available
                              </Badge>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {dailySchedule[0]?.label} �{" "}
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
                                    {slot.label} � {slot.endLabel}
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
                                  ? `Break window (${dailySchedule.find((s) => s.isBreak)?.label ?? slotSettings.breakStart} � ${slotSettings.breakEnd})`
                                  : "No break configured",
                                slotSettings.allowWalkIn
                                  ? "Walk-ins allowed"
                                  : "Walk-ins not allowed",
                                `Default type: ${slotSettings.defaultMode}`,
                                `Schedulable days: ${schedulableDays.length
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
                                toast.success("Slot settings saved — schedulable days updated"),
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

                  {rescheduling && (
                    <div className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-xs text-warning-foreground">
                      <Repeat2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>
                        Rescheduling <b>{rescheduling.applicant}</b> from {rescheduling.date} ·{" "}
                        {rescheduling.time} — confirm to update their existing interview.
                      </span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-sm">Filter by Department</Label>
                    <Select
                      value={scheduleDept}
                      onValueChange={(v) => {
                        setScheduleDept(v);
                        setSchedule((p) => ({ ...p, applicant: "" }));
                        setRescheduling(null);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All departments" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All departments</SelectItem>
                        {departments.map((d) => (
                          <SelectItem key={d.code} value={d.name}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                        {slotSettings.slotCount} slots � {capacityPerSlot} applicants each
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
                          return (
                            <SelectItem key={t} value={t} disabled={full}>
                              {t}
                              <span className="ml-1.5 text-xs text-muted-foreground">
                                {full ? "(full)" : `(${remaining} left)`}
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="grid gap-4 sm:grid-cols-2">
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
                        <Label className="text-sm">Interviewer</Label>
                        <Select
                          value={schedule.interviewer}
                          onValueChange={(v) => setSchedule({ ...schedule, interviewer: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {scheduleInterviewers.map((s) => (
                              <SelectItem key={s.id} value={s.name}>
                                {s.name} � {s.role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border border-border/70 bg-muted/25 p-4">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div className="min-w-0 text-sm">
                      <p className="font-medium">
                        {schedule.mode === "Virtual" ? "Virtual Interview" : "On-site Interview"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {schedule.mode === "Virtual"
                          ? "Meeting link: meet.oxfordsuites.ph/interview-room"
                          : "Location: Oxford Suites Makati, HR Office, 3rd Floor"}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {schedule.applicant || "No applicant selected"}
                        </span>
                        {schedule.date && schedule.time
                          ? ` � ${new Date(`${schedule.date}T00:00:00`).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                            },
                          )} at ${schedule.time}`
                          : " � pick a date and time"}
                        {schedule.interviewer ? ` � ${schedule.interviewer}` : ""}
                      </p>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    disabled={!schedule.applicant || !schedule.date || !schedule.time}
                    onClick={confirmSchedule}
                  >
                    <Mail className="mr-2 h-4 w-4" /> Confirm &amp; Send Invitation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/70">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
                  <CalendarClock className="h-5 w-5 text-primary" />
                  Scheduled Interviews
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search applicant�"
                      value={interviewSearch}
                      onChange={(e) => setInterviewSearch(e.target.value)}
                      className="w-52 pl-8"
                    />
                  </div>
                  <Select value={interviewStatusFilter} onValueChange={setInterviewStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                      <SelectItem value="Need to Schedule">Need to Schedule</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={interviewModeFilter} onValueChange={setInterviewModeFilter}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All modes</SelectItem>
                      <SelectItem value="On-site">On-site</SelectItem>
                      <SelectItem value="Virtual">Virtual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4 overflow-x-auto">
                <ListBody>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <SortHead
                          sortKey="applicant"
                          sort={interviewSort.sort}
                          onSort={interviewSort.toggle}
                        >
                          Applicant
                        </SortHead>
                        <SortHead
                          sortKey="position"
                          sort={interviewSort.sort}
                          onSort={interviewSort.toggle}
                        >
                          Position
                        </SortHead>
                        <SortHead
                          sortKey="schedule"
                          sort={interviewSort.sort}
                          onSort={interviewSort.toggle}
                        >
                          Schedule
                        </SortHead>
                        <SortHead
                          sortKey="mode"
                          sort={interviewSort.sort}
                          onSort={interviewSort.toggle}
                        >
                          Mode
                        </SortHead>
                        <SortHead
                          sortKey="interviewer"
                          sort={interviewSort.sort}
                          onSort={interviewSort.toggle}
                        >
                          Interviewer
                        </SortHead>
                        <SortHead
                          sortKey="status"
                          sort={interviewSort.sort}
                          onSort={interviewSort.toggle}
                        >
                          Status
                        </SortHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {interviewPage.pageItems.map((i) => (
                        <TableRow key={i.id}>
                          <TableCell className="text-sm font-medium">{i.applicant}</TableCell>
                          <TableCell className="text-sm">{i.position}</TableCell>
                          <TableCell className="text-xs">
                            {i.pending ? "�" : `${i.date} � ${i.time}`}
                          </TableCell>
                          <TableCell className="text-xs">
                            <Badge variant="outline">{i.mode}</Badge>
                          </TableCell>
                          <TableCell className="text-xs">{i.interviewer}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                i.pending
                                  ? "border-caution/30 bg-caution/10 text-caution"
                                  : "border-primary/30 bg-primary/10 text-primary"
                              }
                            >
                              {i.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {i.pending ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const a = rows.find((r) => r.name === i.applicant);
                                    if (a) acceptAndSchedule(a);
                                  }}
                                >
                                  <CalendarPlus className="mr-1.5 h-3.5 w-3.5" />
                                  Schedule
                                </Button>
                              ) : isInterviewLocked(i) ? (
                                <span className="text-[0.7rem] italic text-muted-foreground">
                                  Interview finalized
                                </span>
                              ) : (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const real = interviews.find((x) => x.id === i.id);
                                      if (real) rescheduleInterview(real);
                                    }}
                                  >
                                    <CalendarPlus className="mr-1.5 h-3.5 w-3.5" />
                                    Reschedule
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-destructive/40 text-destructive hover:bg-destructive/10"
                                    onClick={() =>
                                      setCancelInterview(
                                        interviews.find((x) => x.id === i.id) ?? null,
                                      )
                                    }
                                  >
                                    <X className="mr-1.5 h-3.5 w-3.5" />
                                    Cancel
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ListBody>
                <TablePagination
                  page={interviewPage.page}
                  pageCount={interviewPage.pageCount}
                  from={interviewPage.from}
                  to={interviewPage.to}
                  total={interviewPage.total}
                  label="interviews"
                  onPageChange={interviewPage.setPage}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ASSESSMENT */}
        <TabsContent value="assessment" className="mt-4 space-y-6">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
                    <ClipboardCheck className="h-5 w-5 text-primary" />
                    Assessments
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Candidates ready for evaluation and those already assessed.
                  </p>
                </div>
                <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={assessmentSearch}
                      onChange={(e) => setAssessmentSearch(e.target.value)}
                      placeholder="Search candidate, position�"
                      className="w-56 pl-8"
                    />
                  </div>
                  <Select
                    value={assessmentFilter}
                    onValueChange={(v) => setAssessmentFilter(v as typeof assessmentFilter)}
                  >
                    <SelectTrigger className="w-52">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ready">Ready for Assessment</SelectItem>
                      <SelectItem value="completed">Completed Assessment</SelectItem>
                      <SelectItem value="all">All Assessments</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={assessmentDept} onValueChange={setAssessmentDept}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All departments</SelectItem>
                      {departments.map((d) => (
                        <SelectItem key={d.code} value={d.name}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={assessmentOutcome} onValueChange={setAssessmentOutcome}>
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="Outcome" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All outcomes</SelectItem>
                      <SelectItem value="Ready for Assessment">Ready for Assessment</SelectItem>
                      <SelectItem value="Recommended">Recommended</SelectItem>
                      <SelectItem value="Hold">Hold</SelectItem>
                      <SelectItem value="Not Recommended">Not Recommended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4">
                <ListBody>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <SortHead
                          sortKey="name"
                          sort={assessmentSort.sort}
                          onSort={assessmentSort.toggle}
                        >
                          Candidate
                        </SortHead>
                        <SortHead
                          sortKey="position"
                          sort={assessmentSort.sort}
                          onSort={assessmentSort.toggle}
                        >
                          Position
                        </SortHead>
                        <SortHead
                          sortKey="department"
                          sort={assessmentSort.sort}
                          onSort={assessmentSort.toggle}
                        >
                          Department
                        </SortHead>
                        <SortHead
                          sortKey="score"
                          sort={assessmentSort.sort}
                          onSort={assessmentSort.toggle}
                        >
                          Score
                        </SortHead>
                        <SortHead
                          sortKey="status"
                          sort={assessmentSort.sort}
                          onSort={assessmentSort.toggle}
                        >
                          Status
                        </SortHead>
                        <SortHead
                          sortKey="details"
                          sort={assessmentSort.sort}
                          onSort={assessmentSort.toggle}
                        >
                          Details
                        </SortHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assessmentPage.pageItems.map((row) =>
                        row.kind === "ready" ? (
                          <TableRow key={`ready-${row.a.id}`}>
                            <TableCell className="text-sm font-medium">{row.a.name}</TableCell>
                            <TableCell className="text-sm">{row.a.position}</TableCell>
                            <TableCell className="text-sm">
                              {deptForPosition(row.a.position)}
                            </TableCell>
                            <TableCell>{row.a.score}%</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="border-gold/40 bg-gold/15 text-gold-foreground"
                              >
                                Ready for Assessment
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {row.iv ? "Interview booked" : "Interview not booked"}
                            </TableCell>
                            <TableCell className="text-xs">{row.iv?.date ?? "—"}</TableCell>
                            <TableCell className="text-xs">{row.iv?.time ?? "—"}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                disabled={!row.iv || row.iv.date !== TODAY_ISO}
                                title={
                                  !row.iv
                                    ? "Interview not booked yet"
                                    : row.iv.date > TODAY_ISO
                                      ? `Assessment available on interview day (${row.iv.date})`
                                      : row.iv.date < TODAY_ISO
                                        ? "Assessment window for this interview has passed"
                                        : "Start assessment"
                                }
                                onClick={() => {
                                  setEvaluating(row.a);
                                  setEvalScores(
                                    Object.fromEntries(assessmentCriteria.map((c) => [c, 4])),
                                  );
                                  setEvalRemarks("");
                                  setEvalAssessor("");
                                  setEvalDateTime(isoOf(new Date()));
                                }}
                              >
                                Start assessment
                              </Button>
                            </TableCell>
                          </TableRow>
                        ) : (
                          <TableRow key={`done-${row.r.applicantId}`}>
                            <TableCell className="text-sm font-medium">{row.r.name}</TableCell>
                            <TableCell className="text-sm">{row.r.position}</TableCell>
                            <TableCell className="text-sm">
                              {deptForPosition(row.r.position)}
                            </TableCell>
                            <TableCell>
                              <span className="font-display text-lg font-semibold text-primary">
                                {row.r.total}%
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  row.r.outcome === "Recommended"
                                    ? "border-success/30 bg-success/15 text-success"
                                    : row.r.outcome === "Hold"
                                      ? "border-warning/40 bg-warning/20 text-warning-foreground"
                                      : "border-destructive/30 bg-destructive/10 text-destructive"
                                }
                              >
                                {row.r.outcome}
                              </Badge>
                            </TableCell>
                            <TableCell
                              className="max-w-[260px] truncate text-xs text-muted-foreground"
                              title={row.r.remarks}
                            >
                              Assessed {row.r.date} � {row.r.remarks}
                            </TableCell>
                            <TableCell className="text-xs">{row.iv?.date ?? "—"}</TableCell>
                            <TableCell className="text-xs">{row.iv?.time ?? "—"}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  className="cursor-pointer"
                                  onClick={() =>
                                    setAssessDecision({
                                      r: row.r,
                                      kind: "accept",
                                    })
                                  }
                                >
                                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="cursor-pointer border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                  onClick={() =>
                                    setAssessDecision({
                                      r: row.r,
                                      kind: "reject",
                                    })
                                  }
                                >
                                  <XCircle className="mr-1.5 h-3.5 w-3.5" /> Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ),
                      )}
                      {assessmentSort.sorted.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={9} className="text-sm text-muted-foreground">
                            Nothing to show for this filter yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ListBody>
                <TablePagination
                  page={assessmentPage.page}
                  pageCount={assessmentPage.pageCount}
                  from={assessmentPage.from}
                  to={assessmentPage.to}
                  total={assessmentPage.total}
                  label="assessments"
                  onPageChange={assessmentPage.setPage}
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
                    Complete trail of applicant activity � screening, transfers, interview booking,
                    completion and cancellation, assessments and hiring decisions.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={auditSearch}
                      onChange={(e) => setAuditSearch(e.target.value)}
                      placeholder="Search activity�"
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
                      {departments.map((d) => (
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
                        <SortHead sortKey="target" sort={auditSort.sort} onSort={auditSort.toggle}>
                          Applicant
                        </SortHead>
                        <SortHead sortKey="module" sort={auditSort.sort} onSort={auditSort.toggle}>
                          Module
                        </SortHead>
                        <SortHead sortKey="details" sort={auditSort.sort} onSort={auditSort.toggle}>
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
                          <TableCell className="whitespace-nowrap text-sm">{e.target}</TableCell>
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
                          <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" /> Loading audit history…
                            </span>
                          </TableCell>
                        </TableRow>
                      )}
                      {!auditLoading && auditLog.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                            No audit history yet. Activity will appear here as you screen applicants, book interviews, and complete assessments.
                          </TableCell>
                        </TableRow>
                      )}
                      {!auditLoading && auditLog.length > 0 && auditSort.sorted.length === 0 && (
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

      {/* REPORTS DIALOG */}
      <Dialog open={reportsOpen} onOpenChange={setReportsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Generate Report</DialogTitle>
            <DialogDescription>
              Choose a report type and output format from current applicant data.
            </DialogDescription>
          </DialogHeader>

          {/* Format selector */}
          <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 p-2.5">
            <span className="text-xs font-medium text-muted-foreground">Format:</span>
            {(["pdf", "docx", "excel"] as ReportFormat[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setReportFormat(f)}
                className={cn(
                  "rounded px-2.5 py-1 text-xs font-semibold transition-colors",
                  reportFormat === f
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-muted-foreground",
                )}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>

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
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const cols =
                      r.id === "interview"
                        ? [
                          { header: "Applicant", key: "applicant" },
                          { header: "Position", key: "position" },
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
                            { header: "Email", key: "email" },
                            { header: "Score", key: "score" },
                            { header: "Status", key: "status" },
                            { header: "Stage", key: "stage" },
                          ]
                          : [
                            { header: "ID", key: "id" },
                            { header: "Name", key: "name" },
                            { header: "Email", key: "email" },
                            { header: "Position", key: "position" },
                            { header: "Score", key: "score" },
                            { header: "Status", key: "status" },
                            { header: "Stage", key: "stage" },
                            { header: "Applied", key: "appliedAt" },
                          ];
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
                    exportReport(
                      {
                        title: `Applicant Management — ${r.title}`,
                        subtitle: `Oxford Suites Makati HRMS · ${new Date().toLocaleDateString()}`,
                        columns: cols,
                        rows: data as any,
                        summary: [
                          { label: "Total Applicants", value: rows.length },
                          {
                            label: "Passed Screening",
                            value: rows.filter((a) => a.score >= passing).length,
                          },
                          { label: "Interviews Scheduled", value: interviews.length },
                        ],
                      },
                      reportFormat,
                    );
                    toast.success(`${r.title} report exported as ${reportFormat.toUpperCase()}`);
                  }}
                >
                  <Download className="mr-2 h-4 w-4" /> {reportFormat.toUpperCase()}
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* REPLACE DETAILS CONFIRMATION (resume upload over existing data) */}
      <Dialog
        open={replaceOpen}
        onOpenChange={(o) => {
          if (!o) {
            setPendingResume(null);
            setReplaceOpen(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Replace applicant details?</DialogTitle>
            <DialogDescription>
              The form already has details{addResumeFile ? ` from "${addFileName}"` : " you"}{" "}
              entered. Uploading "{pendingResume?.name ?? "this resume"}" will overwrite Full name,
              Email, Contact number and Address with the values extracted from it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setPendingResume(null);
                setReplaceOpen(false);
              }}
            >
              Keep current details
            </Button>
            <Button
              onClick={() => {
                const file = pendingResume;
                setPendingResume(null);
                setReplaceOpen(false);
                if (file) applyResumeFile(file);
              }}
            >
              Replace details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SCREENING SETUP DIALOG */}
      <Dialog open={screeningOpen} onOpenChange={setScreeningOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Screening Setup</DialogTitle>
            <DialogDescription>
              Configure screening criteria weights, keyword libraries and the DB-managed reference
              vocabulary used by the spaCy NER model.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border/70">
              <CardContent className="space-y-5 p-6">
                <div>
                  <h2 className="font-display text-2xl font-semibold">
                    Resume Screening Customization
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Tune the criteria weights used by the spaCy NER scoring model.
                  </p>
                </div>
                {criteria.map((c, idx) => (
                  <div key={c.name} className="rounded-md border border-border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={c.enabled}
                          onCheckedChange={(v) =>
                            setCriteria((prev) =>
                              prev.map((x, i) => (i === idx ? { ...x, enabled: v } : x)),
                            )
                          }
                        />
                        <span className="text-sm font-medium">{c.name}</span>
                      </div>
                      <span className="font-display text-lg font-semibold text-primary">
                        {c.weight}%
                      </span>
                    </div>
                    <Slider
                      className="mt-3"
                      value={[c.weight]}
                      max={60}
                      step={5}
                      onValueChange={(v) =>
                        setCriteria((prev) =>
                          prev.map((x, i) => (i === idx ? { ...x, weight: v[0] ?? x.weight } : x)),
                        )
                      }
                    />
                  </div>
                ))}
                <p
                  className={cn(
                    "text-xs",
                    totalWeight === 100 ? "text-success" : "text-destructive",
                  )}
                >
                  Total weight: {totalWeight}% {totalWeight === 100 ? "?" : "(should equal 100%)"}
                </p>
                <div className="space-y-2">
                  <Label>Passing score � {passing}%</Label>
                  <Slider
                    value={[passing]}
                    max={100}
                    step={1}
                    onValueChange={(v) => setPassing(v[0] ?? passing)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardContent className="space-y-5 p-6">
                <div>
                  <h2 className="font-display text-2xl font-semibold">
                    Skill &amp; Certification Keywords
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Pick a job position to load its suggested keyword checklist, then add any
                    extras.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Job position</Label>
                  <Select
                    value={keywordPosition}
                    onValueChange={(v) => {
                      setKeywordPosition(v);
                      setSelectedKeywords(keywordLibrary[v] ?? []);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((p) => (
                        <SelectItem key={p.id} value={p.title}>
                          {p.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Additional keywords (comma separated)</Label>
                  <Textarea
                    rows={3}
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Entity labels captured</Label>
                  <div className="flex flex-wrap gap-2">
                    {["PERSON", "EMAIL", "PHONE", "SKILL", "ORG", "EDU", "CERT", "DATE"].map(
                      (l) => (
                        <Badge key={l} variant="secondary">
                          {l}
                        </Badge>
                      ),
                    )}
                  </div>
                </div>

                <div className="rounded-md border border-border p-4">
                  <p className="text-sm font-medium">NER training data</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Model v2.3 � 1,248 annotated resumes � last trained 2026-07-20
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toast("Annotation set uploaded")}
                    >
                      <Upload className="mr-2 h-4 w-4" /> Upload training set
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toast.success("Screening batch re-queued")}
                    >
                      <ScanLine className="mr-2 h-4 w-4" /> Re-run screening
                    </Button>
                    <Button
                      size="sm"
                      onClick={() =>
                        toast.success(
                          `Configuration saved � ${selectedKeywords.length} keywords active for ${keywordPosition}`,
                        )
                      }
                    >
                      <Sliders className="mr-2 h-4 w-4" /> Save configuration
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <ScreeningReferenceManager />
        </DialogContent>
      </Dialog>

      {/* REVIEW DIALOG � resume screening result */}
      {/* Assessment decision confirmation */}
      <Dialog open={!!assessDecision} onOpenChange={(o) => !o && setAssessDecision(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {assessDecision?.kind === "accept" ? "Accept applicant?" : "Reject applicant?"}
            </DialogTitle>
            <DialogDescription>
              {assessDecision?.kind === "accept"
                ? `${assessDecision?.r.name} will be removed from the assessment list and handed to New Hire Onboarding as pre-onboarding. You'll be taken there now.`
                : `${assessDecision?.r.name} will be marked rejected and removed from the assessment list.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssessDecision(null)}>
              Cancel
            </Button>
            <Button
              variant={assessDecision?.kind === "reject" ? "destructive" : "default"}
              onClick={() => {
                if (!assessDecision) return;
                if (assessDecision.kind === "accept") acceptAssessment(assessDecision.r);
                else rejectAssessment(assessDecision.r);
                setAssessDecision(null);
              }}
            >
              {assessDecision?.kind === "accept" ? "Yes, continue" : "Yes, reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Interview cancellation confirmation */}
      <Dialog open={!!cancelInterview} onOpenChange={(o) => !o && setCancelInterview(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel this interview?</DialogTitle>
            <DialogDescription>
              {cancelInterview
                ? `${cancelInterview.applicant}'s interview on ${cancelInterview.date} � ${cancelInterview.time} will be removed from the schedule list.`
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

      <Dialog open={!!review} onOpenChange={(o) => !o && setReview(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[95vw] w-[95vw] lg:max-w-[1500px]">
          {review && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">
                  Resume Screening Result � {review.name}
                </DialogTitle>
                <DialogDescription>
                  {review.position} � applied {review.appliedAt} � source {review.source} �{" "}
                  {review.id}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 lg:grid-cols-[460px_1fr] lg:items-start">
                <div className="flex h-full flex-col overflow-hidden rounded-md border border-border bg-card lg:sticky lg:top-0">
                  <div className="flex items-center justify-between gap-2 border-b border-border bg-card px-3 py-2">
                    <span className="flex min-w-0 flex-1 items-center gap-1.5 text-xs font-medium">
                      <FileText className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span
                        className="flex-1 break-all whitespace-normal text-primary underline underline-offset-2"
                        title={review.resumeOriginalName || review.resumeUrl || undefined}
                        role={review.resumeUrl ? "button" : undefined}
                        tabIndex={review.resumeUrl ? 0 : undefined}
                        onClick={() => {
                          if (review.resumeUrl) window.open(review.resumeUrl, "_blank", "noopener");
                        }}
                        onKeyDown={(e) => {
                          if (review.resumeUrl && (e.key === "Enter" || e.key === " ")) {
                            e.preventDefault();
                            window.open(review.resumeUrl!, "_blank", "noopener");
                          }
                        }}
                      >
                        {review.resumeOriginalName ||
                          (review.resumeUrl
                            ? review.resumeUrl.split("/").pop() || `${review.name.replace(/\s+/g, "_")}_Resume.pdf`
                            : `${review.name.replace(/\s+/g, "_")}_Resume.pdf`)}
                      </span>
                    </span>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => setReviewPreviewZoom((z) => Math.max(50, z - 10))}
                        disabled={reviewPreviewZoom <= 50}
                        aria-label="Zoom out"
                      >
                        <ZoomOut className="h-3.5 w-3.5" />
                      </Button>
                      <span className="w-8 text-center text-[0.65rem] text-muted-foreground">{reviewPreviewZoom}%</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => setReviewPreviewZoom((z) => Math.min(300, z + 10))}
                        disabled={reviewPreviewZoom >= 300}
                        aria-label="Zoom in"
                      >
                        <ZoomIn className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="relative flex-1 min-h-[520px] overflow-auto bg-muted/30 p-3">
                    {review.resumeUrl ? (
                      /\.(jpe?g|png)$/i.test(review.resumeUrl) ||
                        /\.(jpe?g|png)$/i.test(review.resumeOriginalName || "") ? (
                        <div className="flex h-full w-full items-center justify-center">
                          <img
                            src={review.resumeUrl}
                            alt={`Resume: ${review.name}`}
                            className="max-h-full max-w-full rounded-sm border border-border object-contain shadow-sm transition-transform"
                            style={{ transform: `scale(${reviewPreviewZoom / 100})`, transformOrigin: "center center" }}
                          />
                        </div>
                      ) : /\.pdf$/i.test(review.resumeUrl) ||
                        /\.pdf$/i.test(review.resumeOriginalName || "") ? (
                        <div className="h-full w-full overflow-auto">
                          <div
                            style={{
                              transform: `scale(${reviewPreviewZoom / 100})`,
                              transformOrigin: "top center",
                              height: reviewPreviewZoom !== 100 ? `${(100 / reviewPreviewZoom) * 100}%` : "100%",
                            }}
                            className="h-full w-full"
                          >
                            <iframe
                              src={review.resumeUrl}
                              title={`Resume: ${review.name}`}
                              className="h-full w-full rounded-sm border border-border bg-white"
                            />
                          </div>
                        </div>
                      ) : /\.docx$/i.test(review.resumeUrl || "") ||
                        /\.docx$/i.test(review.resumeOriginalName || "") ? (
                        <div className="h-full w-full overflow-auto rounded-sm border border-border bg-white p-2">
                          {reviewDocxLoading ? (
                            <div className="flex h-full min-h-[400px] w-full items-center justify-center gap-2 p-8 text-xs text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" /> Rendering DOCX...
                            </div>
                          ) : reviewDocxError ? (
                            <div className="flex h-full min-h-[400px] w-full flex-col items-center justify-center gap-3 px-6 py-8 text-center">
                              <FileText className="h-10 w-10 text-muted-foreground" />
                              <p className="text-xs font-medium">Could not render Word document</p>
                              <p className="text-xs text-muted-foreground">{reviewDocxError}</p>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(review.resumeUrl!, "_blank", "noopener")}
                              >
                                <ExternalLink className="mr-2 h-3.5 w-3.5" /> Open file
                              </Button>
                            </div>
                          ) : (
                            <div className="flex justify-center">
                              <div
                                ref={reviewDocxContainerRef}
                                className="docx bg-white min-h-[500px] w-full max-w-[800px]"
                                style={{
                                  transform: `scale(${reviewPreviewZoom / 100})`,
                                  transformOrigin: "top center",
                                }}
                              />
                            </div>
                          )}
                        </div>
                      ) : /\.doc$/i.test(review.resumeUrl || "") ||
                        /\.doc$/i.test(review.resumeOriginalName || "") ? (
                        <div className="flex h-full w-full flex-col overflow-hidden rounded-sm border border-border bg-white">
                          {window.location.hostname === "localhost" ||
                            window.location.hostname === "127.0.0.1" ? (
                            <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-white p-6 text-center">
                              <div className="rounded-full bg-amber-50 p-3">
                                <FileText className="h-8 w-8 text-amber-600" />
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-medium">Legacy .doc format</p>
                                <p className="mx-auto max-w-[36ch] text-xs leading-relaxed text-muted-foreground">
                                  .doc preview needs a public URL for Office Online Viewer. On localhost it can’t be rendered. Your file will still be screened correctly — open it in Word or save as <b>.docx</b> for full in-browser preview.
                                </p>
                              </div>
                              <Button size="sm" onClick={() => window.open(review.resumeUrl!, "_blank", "noopener")}>
                                <ExternalLink className="mr-2 h-3.5 w-3.5" /> Open in Word
                              </Button>
                            </div>
                          ) : (
                            <>
                              <div className="flex-1 overflow-hidden">
                                <iframe
                                  src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(new URL(review.resumeUrl!, window.location.origin).href)}`}
                                  title={`Resume: ${review.name}`}
                                  className="h-full w-full border-0"
                                />
                              </div>
                              <div className="flex items-center justify-center gap-2 border-t border-border bg-muted/20 px-2 py-1.5 text-[0.65rem] text-muted-foreground">
                                <span className="text-center">Legacy .doc — via Office Online Viewer</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 shrink-0 px-2 text-[0.65rem]"
                                  onClick={() => window.open(review.resumeUrl!, "_blank", "noopener")}
                                >
                                  <ExternalLink className="mr-1 h-3 w-3" /> Open
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center">
                          <FileText className="h-10 w-10 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">
                            Preview isn&apos;t available for .doc files. Please convert to PDF or DOCX for in-browser preview. You can still open the file.
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(review.resumeUrl!, "_blank", "noopener")}
                          >
                            <ExternalLink className="mr-2 h-3.5 w-3.5" /> Open file
                          </Button>
                        </div>
                      )
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-center">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">No resume file available</p>
                        <p className="text-[0.65rem] text-muted-foreground">Uploaded via {review.source}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4 lg:overflow-y-auto lg:pr-2">
                  {(() => {
                    const verdictCopy: Record<string, string> = {
                      fit: "Strong match � meets or exceeds the requirements for this role.",
                      "other-role":
                        "Not the strongest fit here, but the profile suggests they'd do well in a different role.",
                      credential:
                        "Promising profile, but a required certification or credential couldn't be verified.",
                      "not-fit": "Falls short of the core requirements for this role.",
                    };
                    const { entities, score } = screeningResultFor(review);
                    const detail = review.screening_detail;
                    const breakdown = detail?.score_breakdown;
                    const passed = score >= passing;
                    const matched =
                      breakdown?.["skills"]?.matched_required ??
                      (keywordLibrary[review.position] ?? []).filter((k) =>
                        entities.some((e) =>
                          e.value.toLowerCase().includes(k.toLowerCase().split(" ")[0]!),
                        ),
                      );
                    const missing =
                      breakdown?.["skills"]?.missing_required ??
                      (keywordLibrary[review.position] ?? []).filter((k) => !matched.includes(k));
                    const experienceEntities = entities.filter(
                      (e) => e.label === "ORG" || e.label === "ORGANIZATION",
                    );
                    const educationEntities = entities.filter(
                      (e) => e.label === "EDU" || e.label === "EDUCATION",
                    );
                    const experience: string[] =
                      (detail?.profile?.work_experience ?? [])
                        .map((w) => w.job_title)
                        .filter((t): t is string => Boolean(t)) ||
                      experienceEntities.map((e) => e.value);
                    const education: string[] =
                      detail?.profile?.education ?? educationEntities.map((e) => e.value);
                    const skills = entities.filter((e) => e.label === "SKILL");

                    return (
                      <>
                        {/* Score + verdict */}
                        <div className="flex items-center gap-4 rounded-md border border-border p-4">
                          <div className="text-center">
                            <p className="font-display text-4xl font-semibold text-primary">
                              {Math.round(score)}%
                            </p>
                            <p className="eyebrow">Match score</p>
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge
                                variant="outline"
                                className={statusMeta[review.status].className}
                              >
                                {statusMeta[review.status].label}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={
                                  passed
                                    ? "border-success/30 bg-success/10 text-success"
                                    : "border-destructive/30 bg-destructive/10 text-destructive"
                                }
                              >
                                {passed ? "Passed threshold" : "Below threshold"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {verdictCopy[review.status]}
                            </p>
                          </div>
                        </div>

                        {/* Keyword match */}
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-md border border-success/30 bg-success/5 p-3">
                            <p className="eyebrow mb-2 text-success">
                              Matched keywords ({matched.length})
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {matched.length === 0 && (
                                <span className="text-xs text-muted-foreground">None found</span>
                              )}
                              {matched.map((k) => (
                                <Badge
                                  key={k}
                                  variant="outline"
                                  className="border-success/30 bg-success/10 text-success"
                                >
                                  ? {k}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="rounded-md border border-border p-3">
                            <p className="eyebrow mb-2 text-muted-foreground">
                              Missing keywords ({missing.length})
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {missing.length === 0 && (
                                <span className="text-xs text-muted-foreground">
                                  All keywords covered
                                </span>
                              )}
                              {missing.map((k) => (
                                <Badge key={k} variant="outline" className="text-muted-foreground">
                                  ? {k}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Compact summary — 2×2 grid, easy to scan, no scroll needed */}
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-md border border-border bg-card p-3">
                            <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                              <Briefcase className="h-3.5 w-3.5" /> Work experience
                            </p>
                            <p className="text-sm leading-relaxed">
                              {experience.length > 0 ? (
                                experience.join(", ")
                              ) : (
                                <span className="text-muted-foreground">No employer history detected</span>
                              )}
                            </p>
                          </div>
                          <div className="rounded-md border border-border bg-card p-3">
                            <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                              <GraduationCap className="h-3.5 w-3.5" /> Education
                            </p>
                            <p className="text-sm leading-relaxed">
                              {education.length > 0 ? (
                                education.join(", ")
                              ) : (
                                <span className="text-muted-foreground">Not specified</span>
                              )}
                            </p>
                          </div>
                          <div className="rounded-md border border-border bg-card p-3">
                            <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                              <Sparkles className="h-3.5 w-3.5" /> Key skills
                            </p>
                            <p className="text-sm leading-relaxed">
                              {skills.length > 0 ? (
                                skills.map((s) => s.value).join(", ")
                              ) : (
                                <span className="text-muted-foreground">None listed</span>
                              )}
                            </p>
                          </div>
                          <div className="rounded-md border border-border bg-card p-3">
                            <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                              <AlertTriangle className="h-3.5 w-3.5" /> Red flags
                            </p>
                            <p className={cn("text-sm leading-relaxed", review.flags.length > 0 ? "text-amber-600" : "text-muted-foreground")}>
                              {review.flags.length > 0 ? review.flags.join(" • ") : "None detected — clean"}
                            </p>
                          </div>
                        </div>

                        {/* Missing info / job-role / credential analysis (SOP 2) */}
                        <ScreeningAnalysisSections detail={detail} />

                        {/* Alternative job recommendation */}
                        {detail?.alternative_job && (
                          <div className="rounded-md border border-warning/40 bg-warning/5 p-3 text-sm">
                            <p className="font-medium text-warning">
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

                        {/* Screening explanation */}
                        {(detail?.reasons?.length ?? 0) > 0 && (
                          <div className="rounded-md border border-border p-3">
                            <p className="eyebrow mb-2">Why this result (system explanation)</p>
                            <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">
                              {detail!.reasons!.map((r, i) => (
                                <li key={i}>{r}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Recommendation */}
                        <div
                          className={cn(
                            "rounded-md border p-3 text-sm",
                            passed
                              ? "border-success/30 bg-success/10 text-success"
                              : "border-destructive/30 bg-destructive/10 text-destructive",
                          )}
                        >
                          <p className="font-medium">
                            {passed
                              ? "Recommendation: Move forward � accept and schedule an interview."
                              : "Recommendation: Reject or refer to a better-matching role."}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              <DialogFooter className="flex-wrap gap-2">
                {isActionLocked(review) ? (
                  <p className="flex w-full items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">
                    <Info className="h-4 w-4 shrink-0" />
                    This applicant is already at the{" "}
                    <span className="font-semibold text-foreground">{review.stage}</span> stage — no
                    further accept, reject or referral actions can be taken here.
                  </p>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => openRefer(review)}>
                      <Repeat2 className="mr-2 h-4 w-4" /> Refer to other position
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        reject(review);
                        setReview(null);
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
                  Choose a better-matching vacancy for {referring.name} ({referring.position}).
                </DialogDescription>
              </DialogHeader>

              <RadioGroup value={referTarget} onValueChange={setReferTarget} className="space-y-2">
                {positions
                  .filter((p) => p.title !== referring.position && p.filled < p.headcount)
                  .map((p) => {
                    const suggested = referring.flags.some((f) => f.includes(p.title));
                    return (
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
                          <span className="flex items-center gap-2 text-sm font-medium">
                            {p.title}
                            {suggested && (
                              <Badge className="bg-gold text-gold-foreground">Best match</Badge>
                            )}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {p.department} � {p.headcount - p.filled} seat(s) open � {p.salaryBand}
                          </span>
                        </span>
                      </label>
                    );
                  })}
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

      {/* EVALUATION DIALOG */}
      <Dialog open={!!evaluating} onOpenChange={(o) => !o && setEvaluating(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          {evaluating && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">Interview Assessment</DialogTitle>
                <DialogDescription>
                  {evaluating.name} � {evaluating.position}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Assessor</Label>
                  <Select value={evalAssessor} onValueChange={setEvalAssessor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select assessor" />
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
                          {u.department_name ? ` � ${u.department_name}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Assessment date</Label>
                  <Input
                    type="date"
                    value={evalDateTime}
                    onChange={(e) => setEvalDateTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-3">
                {assessmentCriteria.map((c) => (
                  <div key={c} className="flex items-center justify-between gap-3">
                    <span className="text-sm">{c}</span>
                    <Select
                      value={String(evalScores[c] ?? 4)}
                      onValueChange={(v) => setEvalScores((p) => ({ ...p, [c]: Number(v) }))}
                    >
                      <SelectTrigger className="w-32">
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
                  </div>
                ))}
                <div className="rounded-md border border-border p-3">
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
                <div className="space-y-2">
                  <Label>Interviewer remarks</Label>
                  <Textarea
                    rows={3}
                    value={evalRemarks}
                    onChange={(e) => setEvalRemarks(e.target.value)}
                    placeholder="Observations and recommendation�"
                  />
                </div>
              </div>
              <DialogFooter className="flex-col gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() => downloadEvaluationForm(evaluating)}
                  className="sm:mr-auto"
                >
                  <Download className="mr-2 h-4 w-4" /> Evaluation form
                </Button>
                <Button variant="outline" onClick={() => downloadScreeningResult(evaluating)}>
                  <Download className="mr-2 h-4 w-4" /> Screening result
                </Button>

                <Button onClick={saveAssessment}>Save assessment</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ADD APPLICANT DIALOG */}
      <Dialog
        open={addOpen}
        onOpenChange={(o) => {
          setAddOpen(o);
          if (!o) {
            setAddStep(1);
            setScreenResult(null);
            setAddResumeFile(null);
            setPendingResume(null);
            setReplaceOpen(false);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[95vw] w-[95vw] lg:max-w-[1500px]">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Add Applicant</DialogTitle>
            <DialogDescription>
              Step {addStep} of 3 �{" "}
              {addStep === 1
                ? "choose how the resume will be screened"
                : addStep === 2
                  ? "upload the resume and enter applicant details"
                  : "review the screening result"}
            </DialogDescription>
          </DialogHeader>

          {addStep === 1 && (
            <div className="space-y-3">
              {[
                {
                  id: "file" as const,
                  icon: FileText,
                  title: "Through file",
                  body: "PDF or DOCX resume � text is parsed directly by the NER model.",
                },
                {
                  id: "image" as const,
                  icon: ImageIcon,
                  title: "Through image",
                  body: "Photo or scan of a walk-in resume � OCR first, then NER screening.",
                },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setAddMethod(m.id)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-md border p-4 text-left transition-colors",
                    addMethod === m.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40",
                  )}
                >
                  <m.icon className="mt-0.5 h-5 w-5 text-primary" />
                  <span>
                    <span className="block text-sm font-medium">{m.title}</span>
                    <span className="block text-xs text-muted-foreground">{m.body}</span>
                  </span>
                </button>
              ))}
              <DialogFooter>
                <Button onClick={() => setAddStep(2)}>Continue</Button>
              </DialogFooter>
            </div>
          )}

          {addStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Department</Label>
                <Select
                  value={addDept}
                  onValueChange={(v) => {
                    setAddDept(v);
                    const first = positions.find((p) => p.department === v);
                    if (first) setAddForm((f) => ({ ...f, position: first.title }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[...new Set(positions.map((p) => p.department))].map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Applying for</Label>
                <Select
                  value={addForm.position}
                  onValueChange={(v) => setAddForm({ ...addForm, position: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {positions
                      .filter((p) => p.department === addDept)
                      .map((p) => (
                        <SelectItem key={p.id} value={p.title}>
                          {p.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Full name</Label>
                  <Input
                    value={addForm.name}
                    placeholder="e.g. Maria Clara Santos"
                    onChange={(e) => setAddForm({ ...addForm, name: sanitizeName(e.target.value) })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="e.g. maria.santos@gmail.com"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Contact number</Label>
                  <Input
                    placeholder="e.g. 0917 123 4567"
                    value={addForm.phone}
                    onChange={(e) =>
                      setAddForm({ ...addForm, phone: sanitizePhone(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Address</Label>
                  <Input
                    placeholder="e.g. Makati City, Metro Manila"
                    value={addForm.address}
                    onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
                  />
                </div>
              </div>

              <label
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed p-8 text-center transition-colors",
                  resumeDragActive
                    ? "border-primary bg-primary/10"
                    : "border-border bg-muted/40 hover:bg-muted/60",
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  setResumeDragActive(true);
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setResumeDragActive(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setResumeDragActive(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setResumeDragActive(false);
                  handleResumeFile(e.dataTransfer.files?.[0]);
                }}
              >
                {addMethod === "image" ? (
                  <ImageIcon
                    className={cn(
                      "h-9 w-9",
                      resumeDragActive ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                ) : (
                  <FileText
                    className={cn(
                      "h-9 w-9",
                      resumeDragActive ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                )}
                {addFileName ? (
                  <span
                    className="mt-3 inline-flex max-w-full items-center gap-1.5 text-sm font-medium text-primary underline underline-offset-2"
                    title="Click to open a preview of this file"
                    onClick={(e) => {
                      // open the preview instead of triggering the file picker
                      e.preventDefault();
                      e.stopPropagation();
                      openResumePreview();
                    }}
                  >
                    <span className="truncate">{addFileName}</span>
                    <Eye className="h-3.5 w-3.5 shrink-0" />
                  </span>
                ) : (
                  <span className="mt-3 text-sm font-medium">
                    {`Choose resume ${addMethod === "image" ? "photo / scan" : "file"}`}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {resumeAutofilling
                    ? "Reading resume — filling contact fields…"
                    : addMethod === "image"
                      ? "JPG or PNG up to 10 MB — click to browse or drag & drop here"
                      : "PDF or DOCX up to 10 MB — click to browse or drag & drop here"}
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept={
                    addMethod === "image"
                      ? ".jpg,.jpeg,.png,image/jpeg,image/png"
                      : ".pdf,.doc,.docx"
                  }
                  onChange={(e) => {
                    handleResumeFile(e.target.files?.[0]);
                    // allow re-selecting the same file after a failed pick
                    e.target.value = "";
                  }}
                />
              </label>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setAddStep(1)}>
                  Back
                </Button>
                <Button
                  onClick={() => {
                    if (!addForm.name.trim()) {
                      toast.error("Full name is required.");
                      return;
                    }
                    if (!isValidName(addForm.name)) {
                      toast.error(
                        "Full name must contain letters only (no numbers or special symbols).",
                      );
                      return;
                    }
                    if (!addForm.email.trim()) {
                      toast.error("Email address is required.");
                      return;
                    }
                    if (!isValidEmail(addForm.email)) {
                      toast.error(
                        "Please enter a valid formal email address (e.g. name@domain.com).",
                      );
                      return;
                    }
                    if (!addForm.phone.trim()) {
                      toast.error("Contact number is required.");
                      return;
                    }
                    if (!isValidPhone(addForm.phone)) {
                      toast.error("Please enter a valid phone number (7 to 15 digits).");
                      return;
                    }
                    if (!addForm.address.trim()) {
                      toast.error("Address is required.");
                      return;
                    }
                    if (!addFileName && !addResumeFile) {
                      toast.error("Please upload or choose a resume file.");
                      return;
                    }
                    runScreening();
                  }}
                >
                  {screeningLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Screening resume...
                    </>
                  ) : (
                    <>
                      <ScanLine className="mr-2 h-4 w-4" /> Run resume screening
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}

          {addStep === 3 && screenResult && (
            <div className="space-y-4">
              <div className="grid gap-6 lg:grid-cols-[460px_1fr] lg:items-start">
                <div className="flex h-full flex-col overflow-hidden rounded-md border border-border bg-card lg:sticky lg:top-0">
                  <div className="flex items-center justify-between gap-2 border-b border-border bg-card px-3 py-2">
                    <span className="flex min-w-0 flex-1 items-center gap-1.5 text-xs font-medium">
                      {addMethod === "image" ? (
                        <ImageIcon className="h-3.5 w-3.5 shrink-0 text-primary" />
                      ) : (
                        <FileText className="h-3.5 w-3.5 shrink-0 text-primary" />
                      )}
                      <span
                        className="flex-1 break-all whitespace-normal text-primary underline underline-offset-2"
                        title={addFileName || `${addForm.name || "applicant"}_Resume`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openResumePreview();
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            openResumePreview();
                          }
                        }}
                      >
                        {addFileName || `${addForm.name || "applicant"}_Resume`}
                      </span>
                    </span>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => setAddPreviewZoom((z) => Math.max(50, z - 10))}
                        disabled={addPreviewZoom <= 50}
                        aria-label="Zoom out"
                      >
                        <ZoomOut className="h-3.5 w-3.5" />
                      </Button>
                      <span className="w-8 text-center text-[0.65rem] text-muted-foreground">{addPreviewZoom}%</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => setAddPreviewZoom((z) => Math.min(300, z + 10))}
                        disabled={addPreviewZoom >= 300}
                        aria-label="Zoom in"
                      >
                        <ZoomIn className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="relative flex-1 min-h-[520px] overflow-auto bg-muted/30 p-3">
                    {resumePreviewUrl && addResumeFile ? (
                      /\.(jpe?g|png)$/i.test(addResumeFile.name) ||
                        addResumeFile.type.startsWith("image/") ? (
                        <div className="flex h-full w-full items-center justify-center">
                          <img
                            src={resumePreviewUrl}
                            alt={`Uploaded resume: ${addFileName}`}
                            className="max-h-full max-w-full rounded-sm border border-border object-contain shadow-sm transition-transform"
                            style={{ transform: `scale(${addPreviewZoom / 100})`, transformOrigin: "center center" }}
                          />
                        </div>
                      ) : /\.pdf$/i.test(addResumeFile.name) ||
                        addResumeFile.type === "application/pdf" ? (
                        <div className="h-full w-full overflow-auto">
                          <div
                            style={{
                              transform: `scale(${addPreviewZoom / 100})`,
                              transformOrigin: "top center",
                              height: addPreviewZoom !== 100 ? `${(100 / addPreviewZoom) * 100}%` : "100%",
                            }}
                            className="h-full w-full"
                          >
                            <iframe
                              src={resumePreviewUrl}
                              title={`Uploaded resume: ${addFileName}`}
                              className="h-full w-full rounded-sm border border-border bg-white"
                            />
                          </div>
                        </div>
                      ) : /\.docx$/i.test(addResumeFile.name) ? (
                        <div className="h-full w-full overflow-auto rounded-sm border border-border bg-white p-2">
                          {addDocxLoading ? (
                            <div className="flex h-full min-h-[400px] w-full items-center justify-center gap-2 p-8 text-xs text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" /> Rendering DOCX...
                            </div>
                          ) : addDocxError ? (
                            <div className="flex h-full min-h-[400px] w-full flex-col items-center justify-center gap-3 px-6 py-8 text-center">
                              <FileText className="h-10 w-10 text-muted-foreground" />
                              <p className="text-xs font-medium">Could not render Word document</p>
                              <p className="text-xs text-muted-foreground">{addDocxError}</p>
                              <Button size="sm" variant="outline" onClick={openResumePreview}>
                                <ExternalLink className="mr-2 h-3.5 w-3.5" /> Open file
                              </Button>
                            </div>
                          ) : (
                            <div className="flex justify-center">
                              <div
                                ref={addDocxContainerRef}
                                className="docx bg-white min-h-[500px] w-full max-w-[800px]"
                                style={{
                                  transform: `scale(${addPreviewZoom / 100})`,
                                  transformOrigin: "top center",
                                }}
                              />
                            </div>
                          )}
                        </div>
                      ) : /\.doc$/i.test(addResumeFile.name) ? (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-white p-6 text-center">
                          <div className="rounded-full bg-amber-50 p-3">
                            <FileText className="h-8 w-8 text-amber-600" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Legacy .doc format</p>
                            <p className="mx-auto max-w-[32ch] text-xs leading-relaxed text-muted-foreground">
                              Your file will be screened correctly, but browsers can’t preview the old .doc format directly. Save as <b>.docx</b> in Word for a true preview, or open it now.
                            </p>
                          </div>
                          <Button size="sm" onClick={openResumePreview}>
                            <ExternalLink className="mr-2 h-3.5 w-3.5" /> Open in Word
                          </Button>
                        </div>
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center">
                          <FileText className="h-10 w-10 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">
                            Preview not available for this file type. Open the file to view it.
                          </p>
                          <Button size="sm" variant="outline" onClick={openResumePreview}>
                            <ExternalLink className="mr-2 h-3.5 w-3.5" /> Open file
                          </Button>
                        </div>
                      )
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-center">
                        {addMethod === "image" ? (
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        ) : (
                          <FileText className="h-8 w-8 text-muted-foreground" />
                        )}
                        <p className="text-xs text-muted-foreground">
                          {addFileName || "No file selected"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4 lg:overflow-y-auto lg:pr-2">
                  {(() => {
                    const verdictCopy: Record<string, string> = {
                      fit: "Strong match � meets or exceeds the requirements for this role.",
                      "other-role":
                        "Not the strongest fit here, but the profile suggests they'd do well in a different role.",
                      credential:
                        "A credential issue was found (invalid format or unverifiable against system reference data). This does not imply fraud.",
                      "not-fit":
                        "Falls short of the core requirements and no open role matched strongly enough.",
                    };
                    const detail = screenResult.detail;
                    const breakdown = detail?.score_breakdown;
                    const passed = screenResult.score >= passing;
                    const matched =
                      breakdown?.["skills"]?.matched_required ??
                      (keywordLibrary[addForm.position] ?? []).filter((k) =>
                        screenResult.entities.some((e) =>
                          e.value.toLowerCase().includes(k.toLowerCase().split(" ")[0]!),
                        ),
                      );
                    const missing =
                      breakdown?.["skills"]?.missing_required ??
                      (keywordLibrary[addForm.position] ?? []).filter((k) => !matched.includes(k));
                    const experience: string[] =
                      (detail?.profile?.work_experience ?? [])
                        .map((w) => w.job_title)
                        .filter((t): t is string => Boolean(t)) ||
                      screenResult.entities.filter((e) => e.label === "ORG").map((e) => e.value);
                    const education: string[] =
                      detail?.profile?.education ??
                      screenResult.entities.filter((e) => e.label === "EDU").map((e) => e.value);
                    const skills = screenResult.entities.filter((e) => e.label === "SKILL");
                    const unrecognizedSkills =
                      detail?.validation?.skill_analysis?.unrecognized ?? [];
                    const alt = detail?.alternative_job;

                    return (
                      <>
                        <p className="eyebrow">Resume Screening Result</p>
                        {/* Score + verdict */}
                        <div className="flex items-center gap-4 rounded-md border border-border p-4">
                          <div className="text-center">
                            <p className="font-display text-4xl font-semibold text-primary">
                              {Math.round(screenResult.score)}%
                            </p>
                            <p className="eyebrow">Match score</p>
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge
                                variant="outline"
                                className={statusMeta[screenResult.status].className}
                              >
                                {statusMeta[screenResult.status].label}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={
                                  passed
                                    ? "border-success/30 bg-success/10 text-success"
                                    : "border-destructive/30 bg-destructive/10 text-destructive"
                                }
                              >
                                {passed ? "Passed threshold" : "Below threshold"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {verdictCopy[screenResult.status]}
                            </p>
                          </div>
                        </div>

                        {/* Keyword match */}
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-md border border-success/30 bg-success/5 p-3">
                            <p className="eyebrow mb-2 text-success">
                              Matched keywords ({matched.length})
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {matched.length === 0 && (
                                <span className="text-xs text-muted-foreground">None found</span>
                              )}
                              {matched.map((k) => (
                                <Badge
                                  key={k}
                                  variant="outline"
                                  className="border-success/30 bg-success/10 text-success"
                                >
                                  ? {k}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="rounded-md border border-border p-3">
                            <p className="eyebrow mb-2 text-muted-foreground">
                              Missing keywords ({missing.length})
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {missing.length === 0 && (
                                <span className="text-xs text-muted-foreground">
                                  All keywords covered
                                </span>
                              )}
                              {missing.map((k) => (
                                <Badge key={k} variant="outline" className="text-muted-foreground">
                                  ? {k}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Compact summary — 2×2 grid, easy to scan, no scroll needed */}
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-md border border-border bg-card p-3">
                            <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                              <Briefcase className="h-3.5 w-3.5" /> Work experience
                            </p>
                            <p className="text-sm leading-relaxed">
                              {experience.length > 0 ? (
                                <>{experience.join(", ")}{detail?.profile?.estimated_years_experience ? ` (~${detail.profile.estimated_years_experience} yrs)` : ""}</>
                              ) : (
                                <span className="text-muted-foreground">No employer history detected</span>
                              )}
                            </p>
                          </div>
                          <div className="rounded-md border border-border bg-card p-3">
                            <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                              <GraduationCap className="h-3.5 w-3.5" /> Education
                            </p>
                            <p className="text-sm leading-relaxed">
                              {education.length > 0 ? (
                                education.join(", ")
                              ) : (
                                <span className="text-muted-foreground">Not specified</span>
                              )}
                            </p>
                          </div>
                          <div className="rounded-md border border-border bg-card p-3">
                            <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                              <Sparkles className="h-3.5 w-3.5" /> Key skills
                            </p>
                            <p className="text-sm leading-relaxed">
                              {skills.length > 0 ? (
                                skills.map((s) => s.value).join(", ")
                              ) : (
                                <span className="text-muted-foreground">None listed</span>
                              )}
                            </p>
                          </div>
                          <div className="rounded-md border border-border bg-card p-3">
                            <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                              <AlertTriangle className="h-3.5 w-3.5" /> {unrecognizedSkills.length > 0 ? "Unrecognized skills" : "Skills note"}
                            </p>
                            <p className={cn("text-sm leading-relaxed", unrecognizedSkills.length > 0 ? "text-amber-600" : "text-muted-foreground")}>
                              {unrecognizedSkills.length > 0 ? unrecognizedSkills.join(", ") : "All skills recognized — clean"}
                            </p>
                          </div>
                        </div>

                        {/* Missing info / job-role / credential analysis (SOP 2) */}
                        <ScreeningAnalysisSections detail={detail} />

                        {/* Alternative job recommendation */}
                        {alt && (
                          <div className="rounded-md border border-warning/40 bg-warning/5 p-3 text-sm">
                            <p className="font-medium text-warning">
                              Recommended alternative: {alt.title} (
                              {Math.round(alt.alternative_match_score ?? 0)}%)
                            </p>
                            {alt.reason && (
                              <p className="mt-1 text-xs text-muted-foreground">{alt.reason}</p>
                            )}
                          </div>
                        )}

                        {/* Screening explanation */}
                        {(detail?.reasons?.length ?? 0) > 0 && (
                          <div className="rounded-md border border-border p-3">
                            <p className="eyebrow mb-2">Why this result (system explanation)</p>
                            <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">
                              {detail!.reasons!.map((r, i) => (
                                <li key={i}>{r}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Recommendation */}
                        <div
                          className={cn(
                            "rounded-md border p-3 text-sm",
                            passed
                              ? "border-success/30 bg-success/10 text-success"
                              : "border-destructive/30 bg-destructive/10 text-destructive",
                          )}
                        >
                          <p className="font-medium">
                            {passed
                              ? "Recommendation: Move forward � accept and schedule an interview."
                              : "Recommendation: Reject or refer to a better-matching role."}
                          </p>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className="cursor-pointer"
                          onClick={() => {
                            toast("Re-running resume analysis�");
                            runScreening();
                          }}
                        >
                          <ScanLine className="mr-2 h-4 w-4" /> Retry analysis
                        </Button>
                      </>
                    );
                  })()}
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setAddStep(2)}>
                  Back
                </Button>
                <Button onClick={saveNewApplicant}>Save applicant</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
