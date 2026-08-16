import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarClock,
  CalendarDays,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Info,
  CheckCircle2,
  ClipboardCheck,
  Download,
  Eye,
  FileText,
  CalendarPlus,
  History,
  Image as ImageIcon,
  Mail,
  MoreHorizontal,
  Repeat2,
  ScanLine,
  Search,
  Settings2,
  Sliders,
  Sparkles,
  Star,
  Trophy,
  Upload,
  UserPlus,
  Users,
  X,
  XCircle,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
} from "recharts";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  applicantAuditLog,
  applicants as seedApplicants,
  assessmentCriteria,
  interviewers,
  interviews as seedInterviews,
  screeningCriteria,
  statusMeta,
  TODAY_ISO,
  type Applicant,
  type ApplicantStatus,
  type AuditEntry,
} from "@/data/applicants";
import { departments, positions } from "@/data/hr";
import { hireStore } from "@/data/hires";
import { jobs } from "@/data/jobs";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { SortHead, useSort } from "@/components/portal/sortable";
import { applicantsApi, interviewsApi, settingsApi, type ApiApplicant, type ApiInterview, type ApiSystemUser } from "@/lib/api";

function transformApiApplicant(a: ApiApplicant): Applicant {
  return {
    id: a.applicant_code || `APP-${a.applicant_id}`,
    dbId: a.applicant_id,
    name: a.name,
    email: a.email,
    phone: a.phone || "0912 345 6789",
    position: a.job_post?.title || "Front Desk Receptionist",
    jobId: String(a.job_post_id),
    appliedAt: a.applied_at ? a.applied_at.slice(0, 16).replace("T", " ") : "2026-07-25 12:00",
    score: a.fit_score || 0,
    status: a.status,
    stage: a.stage,
    source: (a.source || "Online Portal") as any,
    entities: a.screening_entities?.map((e) => ({ label: e.label, value: e.value })) || [],
    breakdown: a.screening_scores?.map((s) => ({ criterion: s.criterion, score: s.score })) || [],
    flags: a.flags_json || [],
    summary: a.summary || "",
  };
}

function transformApiInterview(i: ApiInterview): (typeof seedInterviews)[number] {
  return {
    id: i.interview_code || `INT-${i.interview_id}`,
    dbId: i.interview_id,
    applicant: `Applicant #${i.applicant_id}`,
    applicantId: `APP-${i.applicant_id}`,
    applicantName: "Candidate",
    position: "Front Desk Receptionist",
    date: i.scheduled_date,
    time: i.scheduled_time,
    interviewer: i.interviewer_name || "HR Officer",
    mode: i.mode,
    status: i.status,
  } as any;
}

/** Badge tone per audit action type in the History & Audit log. */
const auditBadgeClass = (action: string) => {
  if (/Accepted|Completed/.test(action))
    return "border-success/40 bg-success/10 text-success";
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
  Bartender: [
    "Mixology",
    "TESDA Bartending NC II",
    "Inventory",
    "Cocktail Craft",
    "Bar Hygiene",
  ],
  "Line Cook": [
    "Hot Kitchen",
    "TESDA Cookery NC II",
    "Food Handler",
    "HACCP",
    "Mise en Place",
    "Plating",
  ],
  "Pastry Chef": [
    "Pastry",
    "Baking",
    "Dessert Plating",
    "Culinary Arts Diploma",
    "HACCP",
  ],
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
const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/** Default schedulable interview days, overridable in Slot Settings. */
const DEFAULT_SCHEDULABLE_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

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

const seedAssessments: AssessmentResult[] = [
  {
    applicantId: "APP-1032",
    name: "Camille Ortega",
    position: "Front Desk Receptionist",
    scores: {},
    total: 94,
    remarks:
      "Excellent guest-facing presence; completed practical front desk simulation.",
    date: "2026-07-23",
    outcome: "Recommended",
  },
  {
    applicantId: "APP-1035",
    name: "Jompaks Berdugo",
    position: "Bartender",
    scores: {},
    total: 88,
    remarks: "Strong mixology demo, needs coaching on upselling scripts.",
    date: "2026-07-25",
    outcome: "Recommended",
  },
  {
    applicantId: "APP-1036",
    name: "Kevin Dela Cruz",
    position: "Line Cook",
    scores: {},
    total: 82,
    remarks: "Solid knife skills and station timing during the cook test.",
    date: "2026-07-26",
    outcome: "Recommended",
  },
];

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

const reportOptions = [
  {
    id: "all",
    title: "All Applicants",
    description:
      "Complete list of every applicant on record with status and stage.",
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
    description:
      "Detailed NER screening scores, keywords and flags for each resume.",
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
const buildTimeSlots = (
  startTime: string,
  intervalMinutes: number,
  count: number,
) => {
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
    const isBreak =
      breakEnabled && startMin < breakEndMin && endMin > breakStartMin;
    return {
      startMin,
      endMin,
      label: formatMinutesAsTime(startMin),
      endLabel: formatMinutesAsTime(endMin),
      isBreak,
    };
  });
};

/** Triggers a client-side download of generated text content. */
const downloadTextFile = (filename: string, content: string) => {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export function ApplicantManagement({
  role,
}: {
  role: "superadmin" | "admin";
}) {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Applicant[]>(seedApplicants);

  useEffect(() => {
    Promise.allSettled([
      applicantsApi.list({ per_page: 100 }),
      interviewsApi.list({ per_page: 100 }),
    ]).then(([appRes, intRes]) => {
      if (appRes.status === "fulfilled" && appRes.value?.data?.length > 0) {
        setRows(appRes.value.data.map(transformApiApplicant));
      }
      if (intRes.status === "fulfilled" && intRes.value?.data?.length > 0) {
        setInterviews(intRes.value.data.map(transformApiInterview));
      }
    }).catch((err) => {
      console.warn("Could not fetch applicants/interviews from API:", err);
    });
  }, []);

  // Schedulable interview days (Mon–Sun setter) persisted via system_settings
  const [schedulableDays, setSchedulableDays] = useState<string[]>(
    DEFAULT_SCHEDULABLE_DAYS,
  );
  const [schedulableDaysDraft, setSchedulableDaysDraft] = useState<string[]>(
    DEFAULT_SCHEDULABLE_DAYS,
  );
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

  const [tab, setTab] = useState("ranking");
  const [positionFilter, setPositionFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [rankingFilter, setRankingFilter] = useState<
    "all" | "passed" | "ready"
  >("all");
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
  const [interviews, setInterviews] = useState(seedInterviews);
  const [assessments, setAssessments] =
    useState<AssessmentResult[]>(seedAssessments);
  const [assessmentFilter, setAssessmentFilter] = useState<
    "ready" | "completed" | "all"
  >("all");
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
  const [interviewStatusFilter, setInterviewStatusFilter] =
    useState<string>("all");
  const [interviewModeFilter, setInterviewModeFilter] = useState<string>("all");
  const [calSearch, setCalSearch] = useState("");
  const [calStatusFilter, setCalStatusFilter] = useState<string>("all");
  const [slotSettings, setSlotSettings] = useState(DEFAULT_SLOT_SETTINGS);
  const [slotDialogOpen, setSlotDialogOpen] = useState(false);

  /** Interview pending cancellation confirmation. */
  const [cancelInterview, setCancelInterview] = useState<
    (typeof seedInterviews)[number] | null
  >(null);
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

  // Audit / history log
  const [auditLog, setAuditLog] = useState<AuditEntry[]>(applicantAuditLog);
  const [auditSearch, setAuditSearch] = useState("");
  const [auditActionFilter, setAuditActionFilter] = useState<string>("all");
  const [auditDeptFilter, setAuditDeptFilter] = useState<string>("all");
  const [auditActorFilter, setAuditActorFilter] = useState<string>("all");

  const addAudit = (
    entry: Omit<
      AuditEntry,
      "id" | "date" | "time" | "actorName" | "actorPosition" | "actorDepartment"
    >,
  ) => {
    const now = new Date();
    setAuditLog((prev) => [
      {
        id: `AUD-${String(prev.length + 1).padStart(3, "0")}-${now.getTime()}`,
        date: isoOf(now),
        time: timeOf(now),
        actorName: CURRENT_ACTOR.name,
        actorPosition: CURRENT_ACTOR.position,
        actorDepartment: CURRENT_ACTOR.department,
        ...entry,
      },
      ...prev,
    ]);
  };

  // Add-applicant flow
  const [addOpen, setAddOpen] = useState(false);
  const [addStep, setAddStep] = useState<1 | 2 | 3>(1);
  const [addMethod, setAddMethod] = useState<"file" | "image">("file");
  const [addFileName, setAddFileName] = useState("");
  const [addResumeFile, setAddResumeFile] = useState<File | null>(null);
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
  } | null>(null);

  const distribution = useMemo(() => {
    const scoped =
      positionFilter === "all"
        ? rows
        : rows.filter((a) => a.position === positionFilter);
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
        .filter((a) => a.stage !== "Rejected")
        .sort((a, b) => b.score - a.score)
        .slice(0, 5),
    [rows],
  );

  const filtered = rows.filter((a) => {
    if (positionFilter !== "all" && a.position !== positionFilter) return false;
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (stageFilter !== "all" && a.stage !== stageFilter) return false;
    if (rankingFilter === "passed" && a.score < passing) return false;
    if (
      rankingFilter === "ready" &&
      !(
        a.stage === "Interview Scheduled" &&
        !assessments.some((x) => x.applicantId === a.id)
      )
    )
      return false;
    if (
      search &&
      !`${a.name} ${a.email} ${a.position}`
        .toLowerCase()
        .includes(search.toLowerCase())
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
      department:
        positions.find((p) => p.title === r.position)?.department ?? "",
      email: applicant?.email ?? "",
      phone: applicant?.phone ?? "",
      ...(applicant?.dbId !== undefined ? { applicantId: applicant.dbId } : {}),
    });
    setAssessments((prev) =>
      prev.filter((a) => a.applicantId !== r.applicantId),
    );
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
  const rejectAssessment = (r: AssessmentResult) => {
    const applicant = rows.find((a) => a.id === r.applicantId);
    setStage(r.applicantId, "Rejected");
    addAudit({
      actionType: "Assessment Rejected",
      target: r.name,
      module: "Applicant Management",
      details: `Rejected after assessment (${r.total}%)`,
    });
    setAssessments((prev) =>
      prev.filter((a) => a.applicantId !== r.applicantId),
    );
    toast.success(`${r.name} rejected after assessment`);

    try {
      if (applicant?.dbId)
        applicantsApi.update(applicant.dbId, { stage: "Rejected" });
    } catch (e) {
      console.warn("Could not update applicant stage on database API:", e);
    }
  };

  /** Accept ? prefill the scheduler and jump to the Interview Scheduling tab. */
  const acceptAndSchedule = (a: Applicant) => {
    const dept =
      positions.find((p) => p.title === a.position)?.department ??
      jobs.find((j) => j.id === a.jobId)?.department;
    const known =
      dept && departments.some((d) => d.name === dept) ? dept : "all";
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

  const confirmSchedule = async () => {
    if (!schedule.applicant) {
      toast.error("Select an applicant first");
      return;
    }
    // An applicant can only be booked/scheduled once
    if (interviews.some((i) => i.applicant === schedule.applicant)) {
      toast.error(
        `${schedule.applicant} already has a booked interview and can only be scheduled once.`,
      );
      return;
    }
    const taken = interviews.filter(
      (i) => i.date === schedule.date && i.time === schedule.time,
    ).length;
    if (taken >= capacityPerSlot) {
      toast.error(
        `That slot is full — ${capacityPerSlot} applicants already booked for ${schedule.time}.`,
      );
      return;
    }
    const src = rows.find((a) => a.name === schedule.applicant);
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
        applicant_id: src?.dbId ?? 1,
        scheduled_date: schedule.date,
        scheduled_time: schedule.time.includes(":") ? schedule.time.slice(0, 5) : "09:00",
        mode: schedule.mode,
        interviewer_name: schedule.interviewer,
        status: "Scheduled",
      });
    } catch (e) {
      if (e instanceof Error && /already has a booked interview/i.test(e.message)) {
        toast.error(e.message);
      } else {
        console.warn("Could not persist interview to database API:", e);
      }
    }
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
      saved?.remarks ??
        (evalRemarks || "________________________________________"),
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
    if (!i) return;
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

  const reject = (a: Applicant) => {
    setStage(a.id, "Rejected");
    addAudit({
      actionType: "Applicant Rejected",
      target: a.name,
      module: "Screening",
      details: `Applicant rejected at ${a.stage} stage for ${a.position}.`,
    });
    toast(`${a.name} marked as rejected`, {
      description: "Regret letter queued for sending.",
    });

    try {
      if (a.dbId) applicantsApi.update(a.dbId, { stage: "Rejected" });
    } catch (e) {
      console.warn("Could not update applicant stage on database API:", e);
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
    const outcome =
      total >= 80 ? "Recommended" : total >= 65 ? "Hold" : "Not Recommended";
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
    setReferring(a);
    const suggested = a.flags.find((f) => f.startsWith("Stronger match:"));
    setReferTarget(
      suggested
        ? suggested.replace("Stronger match:", "").split("(")[0]!.trim()
        : "",
    );
  };

  const totalWeight = criteria.reduce(
    (t, c) => t + (c.enabled ? c.weight : 0),
    0,
  );

  /** Mock NER parse � fills the applicant fields straight from the "resume". */
  const runScreening = () => {
    const score = 62 + Math.floor(Math.random() * 34);
    const status: ApplicantStatus =
      score >= 85 ? "fit" : score >= 70 ? "other-role" : "credential";
    const parsedName =
      addForm.name ||
      [
        "Maria Clara Santos",
        "Joaquin Delos Reyes",
        "Andrea Villanueva",
        "Rafael Lim",
      ][Math.floor(Math.random() * 4)]!;
    const handle = parsedName.toLowerCase().replace(/[^a-z]+/g, ".");
    setAddForm((f) => ({
      ...f,
      name: parsedName,
      email: f.email || `${handle}@gmail.com`,
      phone:
        f.phone || `+63 9${Math.floor(100000000 + Math.random() * 899999999)}`,
      address: f.address || "Brgy. Poblacion, Makati City, Metro Manila",
    }));
    setScreenResult({
      score,
      status,
      entities: [
        { label: "PERSON", value: parsedName },
        {
          label: "SKILL",
          value: (keywordLibrary[addForm.position] ?? ["Guest Service"])[0]!,
        },
        { label: "ORG", value: "Previous employer detected" },
        { label: "EDU", value: "Hospitality-related coursework" },
      ],
    });
    setAddStep(3);
  };

  const saveNewApplicant = async () => {
    if (!addForm.name || !addForm.email || !addForm.phone || !addForm.address) {
      toast.error("Complete name, email, phone number and address.");
      return;
    }
    const res = screenResult!;
    const now = new Date();
    const newApp: Applicant = {
      id: `APP-${1042 + rows.length}`,
      name: addForm.name,
      email: addForm.email,
      phone: addForm.phone,
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
      flags:
        res.status === "credential"
          ? ["Manual credential verification required"]
          : [],
      summary: `Added via ${addMethod === "image" ? "image (OCR)" : "document"} screening — ${addFileName || "uploaded resume"}.`,
    };
    setRows((prev) => [newApp, ...prev]);
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
      const base = {
        job_post_id: 1,
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
        Object.entries(base).forEach(([k, v]) => fd.append(k, String(v)));
        fd.append("resume", addResumeFile);
        payload = fd;
      }
      const created = await applicantsApi.create(payload);
      setRows((prev) =>
        prev.map((x) =>
          x.id === newApp.id ? { ...x, dbId: created.applicant_id } : x,
        ),
      );
    } catch (e) {
      console.warn("Could not persist applicant to database API:", e);
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
    (a) =>
      a.stage === "Interview Scheduled" &&
      !assessments.some((x) => x.applicantId === a.id),
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

  const interviewRows: InterviewRow[] = [...needSchedule, ...interviews];

  const interviewFiltered = interviewRows
    .filter((i) =>
      interviewSearch
        ? i.applicant.toLowerCase().includes(interviewSearch.toLowerCase())
        : true,
    )
    .filter((i) =>
      interviewStatusFilter === "all"
        ? true
        : i.status === interviewStatusFilter,
    )
    .filter((i) =>
      interviewModeFilter === "all" ? true : i.mode === interviewModeFilter,
    );

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
      ? readyToAssess.map((a) => ({
          kind: "ready" as const,
          a,
          iv: interviews.find((i) => i.applicant === a.name),
        }))
      : []),
    ...(assessmentFilter !== "ready"
      ? assessments.map((r) => ({
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
    const outcome =
      row.kind === "ready" ? "Ready for Assessment" : row.r.outcome;
    const q = assessmentSearch.trim().toLowerCase();
    return (
      (!q ||
        `${name} ${position} ${dept} ${outcome}`.toLowerCase().includes(q)) &&
      (assessmentDept === "all" || dept === assessmentDept) &&
      (assessmentOutcome === "all" || outcome === assessmentOutcome)
    );
  });

  const assessmentSort = useSort(assessmentRows, {
    name: (row) => (row.kind === "ready" ? row.a.name : row.r.name),
    position: (row) => (row.kind === "ready" ? row.a.position : row.r.position),
    department: (row) =>
      deptForPosition(row.kind === "ready" ? row.a.position : row.r.position),
    score: (row) => (row.kind === "ready" ? row.a.score : row.r.total),
    status: (row) =>
      row.kind === "ready" ? "Ready for Assessment" : row.r.outcome,
    details: (row) =>
      row.kind === "ready"
        ? row.iv
          ? `Interviewed ${row.iv.date} � ${row.iv.time}`
          : "Interview not booked"
        : `Assessed ${row.r.date} � ${row.r.remarks}`,
  });

  const auditFiltered = auditLog
    .filter((e) =>
      auditActionFilter === "all" ? true : e.actionType === auditActionFilter,
    )
    .filter((e) =>
      auditDeptFilter === "all" ? true : e.actorDepartment === auditDeptFilter,
    )
    .filter((e) =>
      auditActorFilter === "all" ? true : e.actorName === auditActorFilter,
    )
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

  const auditActionTypes = Array.from(
    new Set(applicantAuditLog.map((e) => e.actionType)),
  ).sort();
  const auditActors = Array.from(
    new Set(applicantAuditLog.map((e) => e.actorName)),
  ).sort();

  /**
   * Applicants available in "1. Select Applicant":
   * only accepted ones (Accept &amp; Schedule), no applicant that is already
   * booked, and none that moved past the interview stage (assessment etc.).
   */
  const scheduleApplicants = rows.filter(
    (a) =>
      a.stage === "Accepted" &&
      !interviews.some((i) => i.applicant === a.name) &&
      !["Assessed", "Offer", "Hired", "Rejected"].includes(a.stage) &&
      (scheduleDept === "all" ||
        positions.find((p) => p.title === a.position)?.department ===
          scheduleDept),
  );
  const scheduleInterviewers = interviewers.filter(
    (s) => scheduleDept === "all" || s.department === scheduleDept,
  );

  return (
    <div>
      <PageHeader
        eyebrow={
          role === "superadmin"
            ? "Super Admin � Recruitment"
            : "Admin � Recruitment"
        }
        title="Applicant Management"
        description="spaCy NER resume screening, candidate ranking, interview scheduling and evaluation."
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setReportsOpen(true)}
            >
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
<TabsTrigger className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm" value="ranking"><Trophy className="h-3.5 w-3.5" /> Ranking &amp; Applicants</TabsTrigger>
          <TabsTrigger className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm" value="scheduling"><CalendarClock className="h-3.5 w-3.5" /> Interview Scheduling</TabsTrigger>
          <TabsTrigger className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm" value="assessment"><ClipboardCheck className="h-3.5 w-3.5" /> Assessment</TabsTrigger>
          <TabsTrigger className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm" value="history"><History className="h-3.5 w-3.5" /> History &amp; Audit</TabsTrigger>
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
                  <Select
                    value={positionFilter}
                    onValueChange={setPositionFilter}
                  >
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

                <div className="mt-2 flex flex-wrap items-center justify-center gap-4 py-2">
                  <div className="relative h-[260px] w-[260px] shrink-0">
                    <PieChart width={260} height={260}>
                      <Pie
                        isAnimationActive={false}
                        data={distribution}
                        dataKey="value"
                        nameKey="name"
                        cx={130}
                        cy={130}
                        innerRadius={52}
                        outerRadius={84}
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
                          const pct = screenedTotal
                            ? (value / screenedTotal) * 100
                            : 0;
                          if (pct < 4) return null;
                          const r =
                            innerRadius + (outerRadius - innerRadius) / 2;
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
                          const pct = screenedTotal
                            ? Math.round((n / screenedTotal) * 100)
                            : 0;
                          return [`${n} (${pct}%)`, "Resumes"] as [
                            string,
                            string,
                          ];
                        }}
                      />
                    </PieChart>

                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-display text-2xl font-semibold">
                        {screenedTotal}
                      </span>
                      <span className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">
                        Resumes
                      </span>
                    </div>
                  </div>

                  <div className="grid w-[15.5rem] max-w-full grid-cols-1 gap-2">
                    {distribution.map((d) => (
                      <div
                        key={d.key}
                        className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                      >
                        <span className="flex items-center gap-2 text-xs">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ background: statusChartColor[d.key] }}
                          />
                          {d.name}
                        </span>
                        <span className="font-display text-base font-semibold">
                          {d.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="flex flex-col overflow-hidden border-border/70 xl:max-h-[30rem]">
              <CardContent className="flex min-h-0 flex-1 flex-col p-6">
                <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
                  <Trophy className="h-5 w-5 text-gold" /> Top 5 Candidates
                  Today
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
                          <p className="truncate text-base font-semibold">
                            {a.name}
                          </p>
                          <p className="truncate text-sm text-muted-foreground">
                            {a.position}
                          </p>
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
                    {positionFilter !== "all"
                      ? ` � ${positionFilter}`
                      : " � all positions"}
                    .
                  </p>
                  {rankingFilter !== "all" && (
                    <Badge
                      variant="outline"
                      className="mt-1.5 gap-1 border-primary/30 bg-primary/10 text-primary"
                    >
                      {rankingFilter === "passed"
                        ? "Passed screening"
                        : "Ready to assess"}
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
                  <Select
                    value={positionFilter}
                    onValueChange={setPositionFilter}
                  >
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
                      {(Object.keys(statusMeta) as ApplicantStatus[]).map(
                        (k) => (
                          <SelectItem key={k} value={k}>
                            {statusMeta[k].label}
                          </SelectItem>
                        ),
                      )}
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
                        <TableHead className="w-[15%] text-right">
                          Actions
                        </TableHead>
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
                                <p
                                  className="truncate font-medium"
                                  title={a.name}
                                >
                                  {a.name}
                                </p>
                                <p className="truncate text-muted-foreground">
                                  {a.id}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden max-w-0 md:table-cell">
                            <p className="truncate" title={a.email}>
                              {a.email}
                            </p>
                            <p className="truncate text-muted-foreground">
                              {a.phone}
                            </p>
                          </TableCell>
                          <TableCell
                            className="max-w-0 truncate"
                            title={a.position}
                          >
                            {a.position}
                          </TableCell>
                          <TableCell
                            className="max-w-0 truncate text-muted-foreground"
                            title={a.appliedAt}
                          >
                            {a.appliedAt}
                          </TableCell>
                          <TableCell>
                            <span className="font-display text-sm font-semibold">
                              {a.score}%
                            </span>
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
                              <span className="truncate">
                                {statusMeta[a.status].label}
                              </span>
                            </Badge>
                          </TableCell>
                          <TableCell
                            className="max-w-0 truncate"
                            title={a.stage}
                          >
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
                                <FileText className="mr-1.5 h-3.5 w-3.5" />{" "}
                                Review
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
                          const today = new Date("2026-08-03");
                          setViewMonth(
                            new Date(today.getFullYear(), today.getMonth(), 1),
                          );
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
                          setViewMonth(
                            (m) =>
                              new Date(m.getFullYear(), m.getMonth() - 1, 1),
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
                          setViewMonth(
                            (m) =>
                              new Date(m.getFullYear(), m.getMonth() + 1, 1),
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
                          setViewMonth(
                            (m) => new Date(m.getFullYear(), Number(v), 1),
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
                        value={String(viewMonth.getFullYear())}
                        onValueChange={(v) =>
                          setViewMonth(
                            (m) => new Date(Number(v), m.getMonth(), 1),
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

                <div className="mt-2 grid grid-cols-7 text-center text-[0.65rem] font-semibold tracking-wide text-muted-foreground">
                  {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(
                    (d) => (
                      <span key={d} className="py-1.5">
                        {d}
                      </span>
                    ),
                  )}
                </div>

                <div className="grid flex-1 grid-cols-7 grid-rows-6 overflow-hidden rounded-lg border border-border">
                  {monthCells.map((cell) => {
                    const iso = isoOf(cell.date);
                    const count = interviews.filter(
                      (i) => i.date === iso,
                    ).length;
                    // A day is a free day only if the setter says it is
                    const dayName = DAY_NAMES[cell.date.getDay()]!;
                    const schedulable = schedulableDays.includes(dayName);
                    const free = count === 0 && schedulable && cell.inMonth;
                    const selected = schedule.date === iso;
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

                          !cell.inMonth &&
                            "bg-muted/20 text-muted-foreground/50",
                          cell.inMonth && !selected && "hover:bg-muted/50",
                          cell.inMonth &&
                            count === 0 &&
                            !schedulable &&
                            "text-muted-foreground/40",
                          count > 0 &&
                            !selected &&
                            "bg-primary/5 font-semibold text-primary",
                          selected &&
                            "bg-primary font-semibold text-primary-foreground",
                        )}
                      >
                        {cell.date.getDate()}
                        {count > 0 && (
                          <span
                            className={cn(
                              "absolute bottom-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full",
                              selected ? "bg-primary-foreground" : "bg-primary",
                            )}
                          />
                        )}
                        {free && (
                          <span className="absolute bottom-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-gold" />
                        )}
                        {count > 1 && (
                          <span className="absolute -top-1 -right-1 z-10 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.6rem] font-semibold text-primary-foreground">
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-primary" /> Booked
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-gold" /> Free
                    day (schedulable)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />{" "}
                    Not schedulable / No availability
                  </span>
                </div>

                <div className="mt-4 flex flex-none flex-col">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-base font-semibold">
                      Interviews on{" "}
                      {new Date(`${schedule.date}T00:00:00`).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </p>
                    <Badge
                      variant="outline"
                      className="border-primary/30 bg-primary/10 text-primary"
                    >
                      {
                        interviews.filter((i) => i.date === schedule.date)
                          .length
                      }
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
                      <Select
                        value={calStatusFilter}
                        onValueChange={setCalStatusFilter}
                      >
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
                          calStatusFilter === "all"
                            ? true
                            : i.status === calStatusFilter,
                        )
                        .filter((i) =>
                          calSearch
                            ? `${i.applicant} ${i.position} ${i.interviewer}`
                                .toLowerCase()
                                .includes(calSearch.toLowerCase())
                            : true,
                        )
                        .map((i) => (
                          <button
                            key={i.id}
                            type="button"
                            onClick={() =>
                              toast(`Viewing interview � ${i.applicant}`)
                            }
                            className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border/70 bg-muted/20 p-2.5 text-left transition-colors hover:bg-muted/40"
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
                            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                          </button>
                        ))}
                      {interviews.filter((i) => i.date === schedule.date)
                        .length === 0 && (
                        <p className="rounded-lg border border-dashed border-border p-5 text-center text-xs text-muted-foreground">
                          No interviews booked � the whole day is free.
                        </p>
                      )}
                    </div>
                    {interviews.filter((i) => i.date === schedule.date).length >
                      3 && (
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
                    <h2 className="font-display text-2xl font-semibold">
                      Book an Interview
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Fill in the details to schedule an interview and send an
                      invite.
                    </p>
                  </div>
                </div>

                {(() => {
                  const steps = [
                    { label: "Applicant", done: Boolean(schedule.applicant) },
                    { label: "Date", done: Boolean(schedule.date) },
                    { label: "Time", done: Boolean(schedule.time) },
                    {
                      label: "Details",
                      done: Boolean(schedule.mode && schedule.interviewer),
                    },
                  ];
                  const done = steps.filter((s) => s.done).length;
                  return (
                    <div className="mt-4 rounded-lg border border-border/70 bg-muted/20 p-2.5">
                      <div className="flex items-center justify-between text-[0.7rem] font-medium text-muted-foreground">
                        <span>Booking progress</span>
                        <span>
                          {done} of {steps.length} complete
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-4 gap-2">
                        {steps.map((s, idx) => (
                          <div key={s.label} className="min-w-0">
                            <div
                              className={cn(
                                "h-1.5 rounded-full transition-colors duration-300",
                                s.done ? "bg-primary" : "bg-border",
                              )}
                            />
                            <p
                              className={cn(
                                "mt-1.5 truncate text-[0.7rem] transition-colors",
                                s.done
                                  ? "font-medium text-primary"
                                  : "text-muted-foreground",
                              )}
                            >
                              {idx + 1}. {s.label}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                <div className="mt-4 flex-1 space-y-4">
                  <Dialog
                    open={slotDialogOpen}
                    onOpenChange={setSlotDialogOpen}
                  >
                    <DialogContent className="max-h-[88vh] overflow-hidden sm:max-w-[min(1400px,95vw)]">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 font-display text-2xl">
                          <Settings2 className="h-5 w-5 text-primary" /> Slot
                          Settings
                        </DialogTitle>
                        <DialogDescription>
                          Customize how interview slots are generated and
                          managed.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="grid gap-6 lg:grid-cols-2">
                        {/* ?? Left column: configuration ??????????????? */}
                        <div className="max-h-[58vh] space-y-5 overflow-y-auto pr-1">
                          <div className="space-y-3">
                            <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground">
                              <Users className="h-3.5 w-3.5" /> CAPACITY (PER
                              TIME SLOT)
                            </p>
                            <p className="text-[0.7rem] text-muted-foreground">
                              The number of interviews that can happen at the
                              same time based on available interviewers and
                              rooms.
                            </p>
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div className="space-y-1">
                                <Label className="text-xs">
                                  Available Interviewers
                                </Label>
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
                                <Label className="text-xs">
                                  Available Rooms
                                </Label>
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
                              <CalendarClock className="h-3.5 w-3.5" /> TIME
                              CONFIGURATION
                            </p>
                            <div className="grid gap-3 sm:grid-cols-3">
                              <div className="space-y-1">
                                <Label className="text-xs">
                                  First slot starts
                                </Label>
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
                                <Label className="text-xs">
                                  Number of time slots
                                </Label>
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
                              <CalendarDays className="h-3.5 w-3.5" />{" "}
                              SCHEDULABLE DAYS
                            </p>
                            <p className="text-[0.7rem] text-muted-foreground">
                              Free-day indicators on the interview calendar
                              only apply to the days selected here.
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {DAY_NAMES.map((day) => {
                                const active =
                                  schedulableDaysDraft.includes(day);
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
                                <CalendarDays className="h-3.5 w-3.5" /> BREAK
                                SLOT (UNAVAILABLE TIME)
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
                              Time within this range will not be available for
                              interviews.
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
                                      const startMin = parseTimeToMinutes(
                                        p.breakStart,
                                      );
                                      const endMin =
                                        (((startMin + mins) % (24 * 60)) +
                                          24 * 60) %
                                        (24 * 60);
                                      const eh = String(
                                        Math.floor(endMin / 60),
                                      ).padStart(2, "0");
                                      const em = String(endMin % 60).padStart(
                                        2,
                                        "0",
                                      );
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
                                <p className="text-xs font-medium">
                                  Walk-in applicants
                                </p>
                                <p className="text-[0.7rem] text-muted-foreground">
                                  Allow applicants without a scheduled
                                  appointment.
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
                              <Label className="text-xs">
                                Default interview type
                              </Label>
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
                                  <SelectItem value="On-site">
                                    On-site
                                  </SelectItem>
                                  <SelectItem value="Virtual">
                                    Virtual
                                  </SelectItem>
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
                                <CalendarDays className="h-3.5 w-3.5" /> DAILY
                                SCHEDULE PREVIEW
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
                              {
                                dailySchedule[dailySchedule.length - 1]
                                  ?.endLabel
                              }
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
                                `Schedulable days: ${
                                  schedulableDays.length
                                    ? schedulableDays
                                        .map((d) => d.slice(0, 3))
                                        .join(", ")
                                    : "None"
                                }`,
                              ].map((line) => (
                                <span
                                  key={line}
                                  className="flex items-center gap-1.5"
                                >
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

                  <div className="space-y-2">
                    <Label className="text-sm">Filter by Department</Label>
                    <Select
                      value={scheduleDept}
                      onValueChange={(v) => {
                        setScheduleDept(v);
                        setSchedule((p) => ({ ...p, applicant: "" }));
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
                      onValueChange={(v) =>
                        setSchedule({ ...schedule, applicant: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select applicant" />
                      </SelectTrigger>
                      <SelectContent>
                        {scheduleApplicants.length === 0 && (
                          <div className="px-2 py-3 text-xs text-muted-foreground">
                            No accepted applicants available in this
                            department.
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
                      onChange={(e) =>
                        setSchedule((p) => ({
                          ...p,
                          date: e.target.value || p.date,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Label className="text-sm">
                        <span className="text-primary">3.</span> Select Time
                        Slot
                      </Label>
                      <span className="text-[0.7rem] text-muted-foreground">
                        {slotSettings.slotCount} slots � {capacityPerSlot}{" "}
                        applicants each
                      </span>
                    </div>
                    <Select
                      value={schedule.time}
                      onValueChange={(v) =>
                        setSchedule((p) => ({ ...p, time: v }))
                      }
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
                          <span className="text-primary">4.</span> Interview
                          Details
                        </Label>
                        <Select
                          value={schedule.mode}
                          onValueChange={(v) =>
                            setSchedule({ ...schedule, mode: v })
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
                      <div className="space-y-2">
                        <Label className="text-sm">Interviewer</Label>
                        <Select
                          value={schedule.interviewer}
                          onValueChange={(v) =>
                            setSchedule({ ...schedule, interviewer: v })
                          }
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
                        {schedule.mode === "Virtual"
                          ? "Virtual Interview"
                          : "On-site Interview"}
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
                          ? ` � ${new Date(
                              `${schedule.date}T00:00:00`,
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })} at ${schedule.time}`
                          : " � pick a date and time"}
                        {schedule.interviewer
                          ? ` � ${schedule.interviewer}`
                          : ""}
                      </p>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    disabled={
                      !schedule.applicant || !schedule.date || !schedule.time
                    }
                    onClick={confirmSchedule}
                  >
                    <Mail className="mr-2 h-4 w-4" /> Confirm &amp; Send
                    Invitation
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
                  <Select
                    value={interviewStatusFilter}
                    onValueChange={setInterviewStatusFilter}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                      <SelectItem value="Need to Schedule">
                        Need to Schedule
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={interviewModeFilter}
                    onValueChange={setInterviewModeFilter}
                  >
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
                          <TableCell className="text-sm font-medium">
                            {i.applicant}
                          </TableCell>
                          <TableCell className="text-sm">
                            {i.position}
                          </TableCell>
                          <TableCell className="text-xs">
                            {i.pending ? "�" : `${i.date} � ${i.time}`}
                          </TableCell>
                          <TableCell className="text-xs">
                            <Badge variant="outline">{i.mode}</Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            {i.interviewer}
                          </TableCell>
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
                                    const a = rows.find(
                                      (r) => r.name === i.applicant,
                                    );
                                    if (a) acceptAndSchedule(a);
                                  }}
                                >
                                  <CalendarPlus className="mr-1.5 h-3.5 w-3.5" />
                                  Schedule
                                </Button>
                              ) : (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const a = rows.find(
                                        (r) => r.name === i.applicant,
                                      );
                                      if (a) acceptAndSchedule(a);
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
                                        interviews.find((x) => x.id === i.id) ??
                                          null,
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
                    onValueChange={(v) =>
                      setAssessmentFilter(v as typeof assessmentFilter)
                    }
                  >
                    <SelectTrigger className="w-52">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ready">
                        Ready for Assessment
                      </SelectItem>
                      <SelectItem value="completed">
                        Completed Assessment
                      </SelectItem>
                      <SelectItem value="all">All Assessments</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={assessmentDept}
                    onValueChange={setAssessmentDept}
                  >
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
                  <Select
                    value={assessmentOutcome}
                    onValueChange={setAssessmentOutcome}
                  >
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="Outcome" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All outcomes</SelectItem>
                      <SelectItem value="Ready for Assessment">
                        Ready for Assessment
                      </SelectItem>
                      <SelectItem value="Recommended">Recommended</SelectItem>
                      <SelectItem value="Hold">Hold</SelectItem>
                      <SelectItem value="Not Recommended">
                        Not Recommended
                      </SelectItem>
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
                            <TableCell className="text-sm font-medium">
                              {row.a.name}
                            </TableCell>
                            <TableCell className="text-sm">
                              {row.a.position}
                            </TableCell>
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
                            <TableCell className="text-xs">
                              {row.iv?.date ?? "—"}
                            </TableCell>
                            <TableCell className="text-xs">
                              {row.iv?.time ?? "—"}
                            </TableCell>
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
                                    Object.fromEntries(
                                      assessmentCriteria.map((c) => [c, 4]),
                                    ),
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
                            <TableCell className="text-sm font-medium">
                              {row.r.name}
                            </TableCell>
                            <TableCell className="text-sm">
                              {row.r.position}
                            </TableCell>
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
                            <TableCell className="text-xs">
                              {row.iv?.date ?? "—"}
                            </TableCell>
                            <TableCell className="text-xs">
                              {row.iv?.time ?? "—"}
                            </TableCell>
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
                                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />{" "}
                                  Accept
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
                                  <XCircle className="mr-1.5 h-3.5 w-3.5" />{" "}
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ),
                      )}
                      {assessmentSort.sorted.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={9}
                            className="text-sm text-muted-foreground"
                          >
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
                    <History className="h-5 w-5 text-primary" /> History &amp;
                    Audit
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Complete trail of applicant activity � screening, transfers,
                    interview booking, completion and cancellation, assessments
                    and hiring decisions.
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
                  <Select
                    value={auditActionFilter}
                    onValueChange={setAuditActionFilter}
                  >
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
                  <Select
                    value={auditDeptFilter}
                    onValueChange={setAuditDeptFilter}
                  >
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
                  <Select
                    value={auditActorFilter}
                    onValueChange={setAuditActorFilter}
                  >
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
                            <span className="block text-muted-foreground">
                              {e.time}
                            </span>
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
                            <Badge
                              variant="outline"
                              className={auditBadgeClass(e.actionType)}
                            >
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
                      {auditSort.sorted.length === 0 && (
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
            <DialogTitle className="font-display text-2xl">
              Generate Report
            </DialogTitle>
            <DialogDescription>
              Choose a report to generate from current applicant data.
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
                  <p className="text-xs text-muted-foreground">
                    {r.description}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    toast.success(`${r.title} report generated`, {
                      description: "Ready to download from Reports history.",
                    })
                  }
                >
                  <Download className="mr-2 h-4 w-4" /> Generate
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* SCREENING SETUP DIALOG */}
      <Dialog open={screeningOpen} onOpenChange={setScreeningOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              Screening Setup
            </DialogTitle>
            <DialogDescription>
              Configure screening criteria weights and keyword libraries used by
              the NER model.
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
                    Tune the criteria weights used by the spaCy NER scoring
                    model.
                  </p>
                </div>
                {criteria.map((c, idx) => (
                  <div
                    key={c.name}
                    className="rounded-md border border-border p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={c.enabled}
                          onCheckedChange={(v) =>
                            setCriteria((prev) =>
                              prev.map((x, i) =>
                                i === idx ? { ...x, enabled: v } : x,
                              ),
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
                          prev.map((x, i) =>
                            i === idx ? { ...x, weight: v[0] ?? x.weight } : x,
                          ),
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
                  Total weight: {totalWeight}%{" "}
                  {totalWeight === 100 ? "?" : "(should equal 100%)"}
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
                    Pick a job position to load its suggested keyword checklist,
                    then add any extras.
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
                    {[
                      "PERSON",
                      "EMAIL",
                      "PHONE",
                      "SKILL",
                      "ORG",
                      "EDU",
                      "CERT",
                      "DATE",
                    ].map((l) => (
                      <Badge key={l} variant="secondary">
                        {l}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="rounded-md border border-border p-4">
                  <p className="text-sm font-medium">NER training data</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Model v2.3 � 1,248 annotated resumes � last trained
                    2026-07-20
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
        </DialogContent>
      </Dialog>

      {/* REVIEW DIALOG � resume screening result */}
      {/* Assessment decision confirmation */}
      <Dialog
        open={!!assessDecision}
        onOpenChange={(o) => !o && setAssessDecision(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {assessDecision?.kind === "accept"
                ? "Accept applicant?"
                : "Reject applicant?"}
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
              variant={
                assessDecision?.kind === "reject" ? "destructive" : "default"
              }
              onClick={() => {
                if (!assessDecision) return;
                if (assessDecision.kind === "accept")
                  acceptAssessment(assessDecision.r);
                else rejectAssessment(assessDecision.r);
                setAssessDecision(null);
              }}
            >
              {assessDecision?.kind === "accept"
                ? "Yes, continue"
                : "Yes, reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Interview cancellation confirmation */}
      <Dialog
        open={!!cancelInterview}
        onOpenChange={(o) => !o && setCancelInterview(null)}
      >
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
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-4xl">
          {review && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">
                  Resume Screening Result � {review.name}
                </DialogTitle>
                <DialogDescription>
                  {review.position} � applied {review.appliedAt} � source{" "}
                  {review.source} � {review.id}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
                <div className="rounded-md border border-border bg-card">
                  <div className="flex items-center justify-between border-b border-border px-3 py-2">
                    <span className="flex min-w-0 items-center gap-1.5 text-xs font-medium">
                      <FileText className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="truncate">{`${review.name.replace(/\s+/g, "_")}_Resume.pdf`}</span>
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        aria-label="Zoom out"
                      >
                        <ZoomOut className="h-3.5 w-3.5" />
                      </Button>
                      <span className="text-[0.65rem] text-muted-foreground">
                        100%
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        aria-label="Zoom in"
                      >
                        <ZoomIn className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="h-[420px] overflow-y-auto bg-muted/30 p-4">
                    <div className="mx-auto aspect-[8.5/11] w-full max-w-[280px] space-y-3 rounded-sm border border-border bg-card p-4 shadow-sm">
                      <div className="space-y-1 border-b border-border pb-2">
                        <p className="text-sm font-semibold">{review.name}</p>
                        <p className="text-[0.65rem] text-muted-foreground">
                          {review.email} � {review.phone}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[0.6rem] font-semibold uppercase text-primary">
                          Objective
                        </p>
                        <div className="h-1.5 w-full rounded-full bg-muted" />
                        <div className="h-1.5 w-4/5 rounded-full bg-muted" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[0.6rem] font-semibold uppercase text-primary">
                          Experience
                        </p>
                        <div className="h-1.5 w-full rounded-full bg-muted" />
                        <div className="h-1.5 w-full rounded-full bg-muted" />
                        <div className="h-1.5 w-3/4 rounded-full bg-muted" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[0.6rem] font-semibold uppercase text-primary">
                          Education
                        </p>
                        <div className="h-1.5 w-full rounded-full bg-muted" />
                        <div className="h-1.5 w-2/3 rounded-full bg-muted" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[0.6rem] font-semibold uppercase text-primary">
                          Skills
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {review.entities.slice(0, 4).map((e) => (
                            <span
                              key={e.label}
                              className="rounded-full bg-secondary px-1.5 py-0.5 text-[0.55rem]"
                            >
                              {e.value}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-border px-3 py-1.5 text-[0.65rem] text-muted-foreground">
                    <span>Page 1 of 1</span>
                    <span>Mock preview � uploaded via {review.source}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {(() => {
                    const verdictCopy: Record<string, string> = {
                      fit: "Strong match � meets or exceeds the requirements for this role.",
                      "other-role":
                        "Not the strongest fit here, but the profile suggests they'd do well in a different role.",
                      credential:
                        "Promising profile, but a required certification or credential couldn't be verified.",
                      "not-fit":
                        "Falls short of the core requirements for this role.",
                    };
                    const passed = review.score >= passing;
                    const matched = (
                      keywordLibrary[review.position] ?? []
                    ).filter((k) =>
                      review.entities.some((e) =>
                        e.value
                          .toLowerCase()
                          .includes(k.toLowerCase().split(" ")[0]!),
                      ),
                    );
                    const missing = (
                      keywordLibrary[review.position] ?? []
                    ).filter((k) => !matched.includes(k));
                    const experience = review.entities.filter(
                      (e) => e.label === "ORG",
                    );
                    const education = review.entities.filter(
                      (e) => e.label === "EDU",
                    );
                    const skills = review.entities.filter(
                      (e) => e.label === "SKILL",
                    );

                    return (
                      <>
                        {/* Score + verdict */}
                        <div className="flex items-center gap-4 rounded-md border border-border p-4">
                          <div className="text-center">
                            <p className="font-display text-4xl font-semibold text-primary">
                              {review.score}%
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
                                {passed
                                  ? "Passed threshold"
                                  : "Below threshold"}
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
                                <span className="text-xs text-muted-foreground">
                                  None found
                                </span>
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
                                <Badge
                                  key={k}
                                  variant="outline"
                                  className="text-muted-foreground"
                                >
                                  ? {k}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Compact summary rows */}
                        <div className="divide-y divide-border rounded-md border border-border">
                          <div className="flex items-start justify-between gap-3 p-3">
                            <p className="w-32 shrink-0 text-xs font-medium text-muted-foreground">
                              Work experience
                            </p>
                            <p className="flex-1 text-sm">
                              {experience.length > 0
                                ? experience.map((e) => e.value).join(", ")
                                : "No employer history detected"}
                            </p>
                          </div>
                          <div className="flex items-start justify-between gap-3 p-3">
                            <p className="w-32 shrink-0 text-xs font-medium text-muted-foreground">
                              Education
                            </p>
                            <p className="flex-1 text-sm">
                              {education.length > 0
                                ? education.map((e) => e.value).join(", ")
                                : "Not specified"}
                            </p>
                          </div>
                          <div className="flex items-start justify-between gap-3 p-3">
                            <p className="w-32 shrink-0 text-xs font-medium text-muted-foreground">
                              Key skills
                            </p>
                            <p className="flex-1 text-sm">
                              {skills.length > 0
                                ? skills.map((s) => s.value).join(", ")
                                : "None listed"}
                            </p>
                          </div>
                          <div className="flex items-start justify-between gap-3 p-3">
                            <p className="w-32 shrink-0 text-xs font-medium text-muted-foreground">
                              Red flags
                            </p>
                            <p
                              className={cn(
                                "flex-1 text-sm",
                                review.flags.length > 0
                                  ? "text-caution"
                                  : "text-muted-foreground",
                              )}
                            >
                              {review.flags.length > 0
                                ? review.flags.join(" � ")
                                : "None detected"}
                            </p>
                          </div>
                        </div>

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
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Accept &amp;
                  schedule
                </Button>
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
                <DialogTitle className="font-display text-2xl">
                  Refer to Other Position
                </DialogTitle>
                <DialogDescription>
                  Choose a better-matching vacancy for {referring.name} (
                  {referring.position}).
                </DialogDescription>
              </DialogHeader>

              <RadioGroup
                value={referTarget}
                onValueChange={setReferTarget}
                className="space-y-2"
              >
                {positions
                  .filter(
                    (p) =>
                      p.title !== referring.position && p.filled < p.headcount,
                  )
                  .map((p) => {
                    const suggested = referring.flags.some((f) =>
                      f.includes(p.title),
                    );
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
                              <Badge className="bg-gold text-gold-foreground">
                                Best match
                              </Badge>
                            )}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {p.department} � {p.headcount - p.filled} seat(s)
                            open � {p.salaryBand}
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
                <Button
                  disabled={!referTarget}
                  onClick={() => {
                    setRows((prev) =>
                      prev.map((x) =>
                        x.id === referring.id
                          ? {
                              ...x,
                              position: referTarget,
                              status: "fit",
                              stage: "Screened",
                            }
                          : x,
                      ),
                    );
                    addAudit({
                      actionType: "Applicant Transferred",
                      target: referring.name,
                      module: "Screening",
                      details: `Transferred from ${referring.position} to ${referTarget}.`,
                    });
                    toast.success(
                      `${referring.name} referred to ${referTarget}`,
                    );
                    setReferring(null);
                    setReview(null);
                  }}
                >
                  Confirm referral
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* EVALUATION DIALOG */}
      <Dialog
        open={!!evaluating}
        onOpenChange={(o) => !o && setEvaluating(null)}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          {evaluating && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">
                  Interview Assessment
                </DialogTitle>
                <DialogDescription>
                  {evaluating.name} � {evaluating.position}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Assessor</Label>
                  <Select
                    value={evalAssessor}
                    onValueChange={setEvalAssessor}
                  >
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
                        <SelectItem
                          key={u.system_user_id}
                          value={String(u.system_user_id)}
                        >
                          {u.full_name}
                          {u.department_name
                            ? ` � ${u.department_name}`
                            : ""}
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
                  <div
                    key={c}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="text-sm">{c}</span>
                    <Select
                      value={String(evalScores[c] ?? 4)}
                      onValueChange={(v) =>
                        setEvalScores((p) => ({ ...p, [c]: Number(v) }))
                      }
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
                      (assessmentCriteria.reduce(
                        (t, c) => t + (evalScores[c] ?? 4),
                        0,
                      ) /
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
                <Button
                  variant="outline"
                  onClick={() => downloadScreeningResult(evaluating)}
                >
                  <Download className="mr-2 h-4 w-4" /> Screening result
                </Button>

                <Button onClick={saveAssessment}>
                  Save assessment
                </Button>
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
          }
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              Add Applicant
            </DialogTitle>
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
                    <span className="block text-xs text-muted-foreground">
                      {m.body}
                    </span>
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
                    if (first)
                      setAddForm((f) => ({ ...f, position: first.title }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[...new Set(positions.map((p) => p.department))].map(
                      (d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ),
                    )}
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
                    onChange={(e) =>
                      setAddForm({ ...addForm, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={addForm.email}
                    onChange={(e) =>
                      setAddForm({ ...addForm, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Contact number</Label>
                  <Input
                    value={addForm.phone}
                    onChange={(e) =>
                      setAddForm({ ...addForm, phone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Address</Label>
                  <Input
                    value={addForm.address}
                    onChange={(e) =>
                      setAddForm({ ...addForm, address: e.target.value })
                    }
                  />
                </div>
              </div>

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-border bg-muted/40 p-8 text-center">
                {addMethod === "image" ? (
                  <ImageIcon className="h-9 w-9 text-muted-foreground" />
                ) : (
                  <FileText className="h-9 w-9 text-muted-foreground" />
                )}
                <span className="mt-3 text-sm font-medium">
                  {addFileName ||
                    `Choose resume ${addMethod === "image" ? "photo / scan" : "file"}`}
                </span>
                <span className="text-xs text-muted-foreground">
                  {addMethod === "image"
                    ? "JPG or PNG up to 10 MB"
                    : "PDF or DOCX up to 10 MB"}
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept={addMethod === "image" ? "image/*" : ".pdf,.doc,.docx"}
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setAddResumeFile(file);
                    setAddFileName(file?.name ?? "");
                  }}
                />
              </label>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setAddStep(1)}>
                  Back
                </Button>
                <Button
                  onClick={() => {
                    if (!addFileName) {
                      toast.error("Select a resume file first.");
                      return;
                    }
                    toast(
                      addMethod === "image"
                        ? "Running OCR then NER screening�"
                        : "Running NER resume screening�",
                    );
                    runScreening();
                  }}
                >
                  <ScanLine className="mr-2 h-4 w-4" /> Run resume screening
                </Button>
              </DialogFooter>
            </div>
          )}

          {addStep === 3 && screenResult && (
            <div className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
                <div className="rounded-md border border-border bg-card">
                  <div className="flex items-center justify-between border-b border-border px-3 py-2">
                    <span className="flex min-w-0 items-center gap-1.5 text-xs font-medium">
                      {addMethod === "image" ? (
                        <ImageIcon className="h-3.5 w-3.5 shrink-0 text-primary" />
                      ) : (
                        <FileText className="h-3.5 w-3.5 shrink-0 text-primary" />
                      )}
                      <span className="truncate">
                        {addFileName || `${addForm.name || "applicant"}_Resume`}
                      </span>
                    </span>
                  </div>
                  <div className="flex h-[420px] items-center justify-center overflow-y-auto bg-muted/30 p-4">
                    <div className="mx-auto aspect-[8.5/11] w-full max-w-[280px] space-y-3 rounded-sm border border-border bg-card p-4 shadow-sm">
                      <div className="space-y-1 border-b border-border pb-2">
                        <p className="text-sm font-semibold">
                          {addForm.name || "�"}
                        </p>
                        <p className="text-[0.65rem] text-muted-foreground">
                          {addForm.email || "�"} � {addForm.phone || "�"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[0.6rem] font-semibold uppercase text-primary">
                          Address
                        </p>
                        <p className="text-[0.6rem] text-muted-foreground">
                          {addForm.address || "�"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[0.6rem] font-semibold uppercase text-primary">
                          Skills
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {screenResult.entities.slice(0, 4).map((e) => (
                            <span
                              key={e.label}
                              className="rounded-full bg-secondary px-1.5 py-0.5 text-[0.55rem]"
                            >
                              {e.value}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-border px-3 py-1.5 text-[0.65rem] text-muted-foreground">
                    <span>Page 1 of 1</span>
                    <span>
                      Mock preview �{" "}
                      {addMethod === "image" ? "image / scan" : "document"}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {(() => {
                    const verdictCopy: Record<string, string> = {
                      fit: "Strong match � meets or exceeds the requirements for this role.",
                      "other-role":
                        "Not the strongest fit here, but the profile suggests they'd do well in a different role.",
                      credential:
                        "Promising profile, but a required certification or credential couldn't be verified.",
                      "not-fit":
                        "Falls short of the core requirements for this role.",
                    };
                    const passed = screenResult.score >= passing;
                    const matched = (
                      keywordLibrary[addForm.position] ?? []
                    ).filter((k) =>
                      screenResult.entities.some((e) =>
                        e.value
                          .toLowerCase()
                          .includes(k.toLowerCase().split(" ")[0]!),
                      ),
                    );
                    const missing = (
                      keywordLibrary[addForm.position] ?? []
                    ).filter((k) => !matched.includes(k));
                    const experience = screenResult.entities.filter(
                      (e) => e.label === "ORG",
                    );
                    const education = screenResult.entities.filter(
                      (e) => e.label === "EDU",
                    );
                    const skills = screenResult.entities.filter(
                      (e) => e.label === "SKILL",
                    );

                    return (
                      <>
                        <p className="eyebrow">Resume Screening Result</p>
                        {/* Score + verdict */}
                        <div className="flex items-center gap-4 rounded-md border border-border p-4">
                          <div className="text-center">
                            <p className="font-display text-4xl font-semibold text-primary">
                              {screenResult.score}%
                            </p>
                            <p className="eyebrow">Match score</p>
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge
                                variant="outline"
                                className={
                                  statusMeta[screenResult.status].className
                                }
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
                                {passed
                                  ? "Passed threshold"
                                  : "Below threshold"}
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
                                <span className="text-xs text-muted-foreground">
                                  None found
                                </span>
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
                                <Badge
                                  key={k}
                                  variant="outline"
                                  className="text-muted-foreground"
                                >
                                  ? {k}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Compact summary rows */}
                        <div className="divide-y divide-border rounded-md border border-border">
                          <div className="flex items-start justify-between gap-3 p-3">
                            <p className="w-32 shrink-0 text-xs font-medium text-muted-foreground">
                              Work experience
                            </p>
                            <p className="flex-1 text-sm">
                              {experience.length > 0
                                ? experience.map((e) => e.value).join(", ")
                                : "No employer history detected"}
                            </p>
                          </div>
                          <div className="flex items-start justify-between gap-3 p-3">
                            <p className="w-32 shrink-0 text-xs font-medium text-muted-foreground">
                              Education
                            </p>
                            <p className="flex-1 text-sm">
                              {education.length > 0
                                ? education.map((e) => e.value).join(", ")
                                : "Not specified"}
                            </p>
                          </div>
                          <div className="flex items-start justify-between gap-3 p-3">
                            <p className="w-32 shrink-0 text-xs font-medium text-muted-foreground">
                              Key skills
                            </p>
                            <p className="flex-1 text-sm">
                              {skills.length > 0
                                ? skills.map((s) => s.value).join(", ")
                                : "None listed"}
                            </p>
                          </div>
                        </div>

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
