import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Bookmark,
  Briefcase,
  CheckCircle2,
  ChevronsUpDown,
  Copy,
  Database,
  Download,
  ExternalLink,
  Eye,
  Facebook,
  FilePlus2,
  FileText,
  Globe,
  GraduationCap,
  GripVertical,
  Heart,
  Image as ImageIcon,
  Instagram,
  LayoutGrid,
  List,
  Loader2,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  PencilRuler,
  Plus,
  ScanLine,
  Search,
  Send,
  Settings2,
  Share2,
  Sliders,
  Sparkles,
  SquareArrowOutUpRight,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  Upload,
  UserPlus,
  Users,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { toast } from "sonner";
import { useBlocker } from "@tanstack/react-router";

import { PageHeader } from "@/components/portal/PageHeader";
import { StatCard } from "@/components/portal/StatCard";
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
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TablePagination } from "@/components/ui/table-pagination";
import { ListEmptyState } from "@/components/portal/ListEmptyState";
import { ListBody } from "@/components/portal/ListBody";
import { DEFAULT_PAGE_SIZE } from "@/hooks/usePagination";
import { Textarea } from "@/components/ui/textarea";
import { peso, type Job } from "@/data/jobs";
import { departments, positions, type Department, type Position } from "@/data/hr";
import { requisitionStore, useRequisitions, type Requisition } from "@/data/requisitions";
import {
  assessmentCriteria,
  interviewers,
  screeningCriteria,
  statusMeta,
  type ApplicantStatus,
} from "@/data/applicants";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSort } from "@/components/portal/sortable";
import { cn } from "@/lib/utils";
import {
  API_BASE_URL,
  applicantsApi,
  coreHcmApi,
  jobPostsApi,
  resolveStorageUrl,
  screeningApi,
  type ApiJobPost,
  type ApiScreeningPreview,
  type ApiScreeningReference,
} from "@/lib/api";
import {
  isValidEmail,
  isValidName,
  isValidPhone,
  sanitizeDecimalString,
  sanitizeDigitsOnly,
  sanitizeInteger,
  sanitizeName,
  sanitizePhone,
} from "@/lib/validation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportReport, type ReportData, type ReportFormat } from "@/lib/report-export";
import {
  ScreeningAnalysisSections,
  ScreeningReferenceManager,
  keywordLibrary,
} from "@/components/modules/ApplicantManagement";

function transformApiJob(j: ApiJobPost): Job {
  const job: Job = {
    id: j.slug || String(j.job_post_id),
    dbId: j.job_post_id,
    title: j.title,
    department: j.department || "Front Office",
    employmentType: j.employment_type,
    schedule: j.schedule || "Shifting Schedule",
    salaryMin: Number(j.salary_min) || 0,
    salaryMax: Number(j.salary_max) || 0,
    vacancies: Number(j.vacancies) || 1,
    filled: Number(j.filled_count) || 0,
    posted: j.posted_date || new Date().toISOString().slice(0, 10),
    status: j.status,
    active: Boolean(j.active),
    experience: (j.experience_level || "1-2 Years") as any,
    education: (j.education_level || "High School Graduate") as any,
    summary: j.summary || "",
    description: j.description || "",
    responsibilities: j.responsibilities || [],
    qualifications: j.qualifications || [],
    skills: j.skills || [],
    benefits: [],
    applicants: Number(j.applicants_count) || 0,
    platforms: j.platforms && j.platforms.length > 0 ? j.platforms : ["Website"],
  };
  if (j.picture_url) job.picture = resolveStorageUrl(j.picture_url) ?? "";
  return job;
}

/** Colour-coded urgency badge classes. */
const urgencyBadge = (urgency: string) =>
  urgency === "Urgent"
    ? "border-destructive/40 bg-destructive/10 text-destructive"
    : urgency === "High"
      ? "border-warning/40 bg-warning/20 text-warning-foreground"
      : urgency === "Low"
        ? "border-border bg-muted text-muted-foreground"
        : "border-primary/30 bg-secondary/50 text-primary";

/** Classifies a requirement-template term for the vocabulary: certification
 *  names (TESDA / NC II / certificate / license…) become certifications so the
 *  NLP credential analysis can verify them; everything else is a skill. */
function guessRefType(term: string): "skill" | "certification" {
  return /nc\s*(i{1,3}|iv|1-4)|tesda|certificate|certification|license|licence|food handler/i.test(
    term,
  )
    ? "certification"
    : "skill";
}

/** One-click reveal of a requisition's justification note. */
function RequisitionNote({ req, label = "View note" }: { req: Requisition; label?: string }) {
  if (!req.justification) return null;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline" className="h-8 w-full min-w-0 gap-1 px-2 text-xs">
          <FileText className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 space-y-2 p-4 text-left">
        <div>
          <p className="font-display text-sm font-semibold">Request note — {req.id}</p>
          <p className="text-[0.7rem] text-muted-foreground">
            {req.position} · {req.department} · {req.count} opening(s)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={urgencyBadge(req.urgency)}>
            {req.urgency} urgency
          </Badge>
          <span className="text-[0.7rem] text-muted-foreground">Requested {req.requestedAt}</span>
        </div>
        <p className="rounded-md bg-secondary/40 p-3 text-xs italic leading-relaxed text-muted-foreground">
          “{req.justification}”
        </p>
      </PopoverContent>
    </Popover>
  );
}

const templates = [
  {
    id: "front-office",
    name: "Front Office Template",
    summary: "Guest-facing role template with PMS and shifting-schedule language.",
    responsibilities:
      "Welcome and assist hotel guests.\nProcess check-in and check-out procedures.\nHandle reservations, inquiries, and guest concerns.",
    qualifications:
      "Bachelor's degree in Hospitality, Tourism or related field.\nAt least 1 year front office experience.\nExcellent English communication skills.",
  },
  {
    id: "kitchen",
    name: "Kitchen / Culinary Template",
    summary: "Back-of-house template with TESDA certification and sanitation clauses.",
    responsibilities:
      "Prepare mise en place for assigned station.\nCook menu items to standard recipes.\nMaintain HACCP sanitation standards.",
    qualifications:
      "TESDA Cookery NC II holder.\nAt least 2 years hot-kitchen experience.\nWilling to work shifting schedules and holidays.",
  },
  {
    id: "housekeeping",
    name: "Housekeeping Template",
    summary: "Rooms division template covering turnover targets and safety.",
    responsibilities:
      "Clean and prepare assigned guestrooms.\nReport maintenance issues promptly.\nManage linen and amenity stocks.",
    qualifications:
      "High school graduate or vocational.\nPhysically fit, attentive to detail.\nPrevious hotel housekeeping experience an advantage.",
  },
];

const platformMeta = [
  { key: "Website", icon: Globe },
  { key: "Facebook", icon: Facebook },
  { key: "Instagram", icon: Instagram },
  { key: "Indeed", icon: Briefcase },
];

type BlockId =
  | "title"
  | "info"
  | "picture"
  | "description"
  | "responsibilities"
  | "qualifications"
  | "skills"
  | "instructions"
  | "about";

const blockLibrary: { id: BlockId; label: string; hint: string }[] = [
  { id: "title", label: "Job Title", hint: "Headline + department" },
  { id: "info", label: "Job Info", hint: "Type, schedule, vacancies, salary" },
  { id: "description", label: "Job Description", hint: "Short role pitch" },
  { id: "responsibilities", label: "Key Responsibilities", hint: "Bulleted duties" },
  { id: "qualifications", label: "Qualifications", hint: "Bulleted requirements" },
  { id: "skills", label: "Required Skills", hint: "Bulleted skill tags" },
  { id: "instructions", label: "Application Instruction", hint: "How to apply" },
  { id: "about", label: "About Company", hint: "Company blurb" },
  { id: "picture", label: "Picture of Hiring", hint: "Template or uploaded image" },
];

const fullBlocks: BlockId[] = blockLibrary.map((b) => b.id);

/**
 * Enum of work schedule options for the job post builder — kept in sync with
 * the backend WorkSchedule enum (Modules\RecruitmentManagement\Enums).
 */
const WORK_SCHEDULE_OPTIONS = [
  "Shifting Schedule",
  "Day Shift (8:00 AM - 5:00 PM)",
  "Night Shift (10:00 PM - 6:00 AM)",
  "Monday to Friday (9:00 AM - 6:00 PM)",
  "Flexible Schedule",
  "Weekend Shift",
  "Rotating Shifts",
] as const;

type Draft = {
  title: string;
  department: string;
  employmentType: string;
  schedule: string;
  salaryMin: string;
  salaryMax: string;
  vacancies: string;
  description: string;
  responsibilities: string;
  qualifications: string;
  skills: string;
  instructions: string;
  about: string;
};

const blankDraft: Draft = {
  title: "",
  department: "",
  employmentType: "Full-time",
  schedule: "Shifting Schedule",
  salaryMin: "",
  salaryMax: "",
  vacancies: "1",
  description: "",
  responsibilities: "",
  qualifications: "",
  skills: "",
  instructions: "",
  about: "",
};

const defaultAbout =
  "Oxford Suites Makati is a premier all-suite hotel in the heart of Makati's business district, known for warm Filipino hospitality and dependable service.";
const defaultInstructions =
  "Interested applicants may send their updated resume through this posting or walk-in for an interview at the HR Office, Oxford Suites Makati.";

function jobToDraft(j: Job): Draft {
  return {
    title: j.title,
    department: j.department,
    employmentType: j.employmentType,
    schedule: j.schedule,
    salaryMin: String(j.salaryMin),
    salaryMax: String(j.salaryMax),
    vacancies: String(j.vacancies),
    description: j.summary,
    responsibilities: j.responsibilities.join("\n"),
    qualifications: j.qualifications.join("\n"),
    skills: j.skills.join("\n"),
    instructions: defaultInstructions,
    about: defaultAbout,
  };
}

function hasContentFor(id: BlockId, d: Draft): boolean {
  switch (id) {
    case "title":
      return d.title.trim() !== "";
    case "info":
      return (
        d.salaryMin.trim() !== "" ||
        d.salaryMax.trim() !== "" ||
        (d.vacancies.trim() !== "" && d.vacancies !== "1")
      );
    case "description":
      return d.description.trim() !== "";
    case "responsibilities":
      return d.responsibilities.trim() !== "";
    case "qualifications":
      return d.qualifications.trim() !== "";
    case "skills":
      return d.skills.trim() !== "";
    case "instructions":
      return d.instructions.trim() !== "";
    case "about":
      return d.about.trim() !== "";
    default:
      return false;
  }
}

function snapshotOf(d: Draft, b: BlockId[]) {
  return JSON.stringify({ d, b });
}

export function RecruitmentManagement({ role }: { role: "superadmin" | "admin" }) {
  const [jobList, setJobList] = useState<Job[]>([]);

  useEffect(() => {
    jobPostsApi
      .list({ per_page: 100 })
      .then((res) => {
        setJobList((res?.data ?? []).map(transformApiJob));
      })
      .catch((err) => {
        console.warn("Could not fetch jobs from API:", err);
      });
  }, []);

  /** Departments & positions straight from the Core HCM database. */
  const [apiDepartments, setApiDepartments] = useState<Department[]>([]);
  const [apiPositions, setApiPositions] = useState<Position[]>([]);

  useEffect(() => {
    Promise.allSettled([
      coreHcmApi.departments({ per_page: 100 }),
      coreHcmApi.positions({ per_page: 100 }),
    ])
      .then(([deptRes, posRes]) => {
        if (deptRes.status === "fulfilled") {
          setApiDepartments(
            (deptRes.value?.data ?? []).map((d) => ({
              code: d.code,
              name: d.name,
              description: d.description ?? "",
              head: "—",
              staff: 0,
              openRequisitions: 0,
              budget: 0,
              dbId: d.department_id,
            })),
          );
        }
        if (posRes.status === "fulfilled") {
          setApiPositions(
            (posRes.value?.data ?? []).map((p) => ({
              id: p.position_code || `POS-${p.position_id}`,
              title: p.title,
              department: p.department_name ?? p.department ?? "General",
              level: (p.level as Position["level"]) || "Rank & File",
              headcount: p.headcount,
              filled: p.filled_count,
              salaryBand: "",
              dbId: p.position_id,
              departmentId: p.department_id,
            })),
          );
        }
      })
      .catch((err) => {
        console.warn("Could not fetch departments/positions from API:", err);
      });
  }, []);

  const knownDepartments = apiDepartments;
  const knownPositions = apiPositions;

  const [tab, setTab] = useState("postings");
  const [mode, setMode] = useState<"template" | "custom">("custom");
  const [newOpen, setNewOpen] = useState(false);
  const [blocks, setBlocks] = useState<BlockId[]>([]);
  const [dragging, setDragging] = useState<BlockId | null>(null);
  const [activeBlock, setActiveBlock] = useState<BlockId>("title");
  /** Canvas container — used to locate a block's editor control for auto-focus. */
  const composerRef = useRef<HTMLDivElement | null>(null);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [reqSearch, setReqSearch] = useState("");
  const [reqStatus, setReqStatus] = useState("all");
  const [reqDept, setReqDept] = useState("all");
  const [reqUrgency, setReqUrgency] = useState("all");
  const [reqPage, setReqPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sourceReqId, setSourceReqId] = useState<string | null>(null);
  /** Manually linked pending requisition when the post wasn't converted from one. */
  const [linkedReqId, setLinkedReqId] = useState<string | null>(null);

  /* ------------------------------------------------------------------ */
  /* Add Applicant wizard (moved from Applicant Management)               */
  /* ------------------------------------------------------------------ */

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
  const [addDept, setAddDept] = useState<string>("");
  /** When set (admin flow), the wizard is locked to this job post. */
  const [addPresetJob, setAddPresetJob] = useState<Job | null>(null);
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    position: "",
  });
  /** Confirmation when Step 2 has unsaved fill-up and user tries to Back/X */
  const [confirmStep2ExitOpen, setConfirmStep2ExitOpen] = useState(false);
  const [pendingStep2ExitAction, setPendingStep2ExitAction] = useState<"back" | "close" | null>(null);
  const hasStep2Data =
    [addForm.name, addForm.email, addForm.phone, addForm.address].some((v) => v.trim().length > 0) ||
    Boolean(addFileName) ||
    Boolean(addResumeFile);
  const [screenResult, setScreenResult] = useState<{
    score: number;
    status: ApplicantStatus;
    entities: { label: string; value: string }[];
    detail?: ApiScreeningPreview | null;
  } | null>(null);
  const [screeningLoading, setScreeningLoading] = useState(false);
  /** Screening setup dialog (moved from Applicant Management header). */
  const [screeningOpen, setScreeningOpen] = useState(false);
  /** Active tab inside the Screening Setup dialog. */
  const [screeningTab, setScreeningTab] = useState("scoring");
  const [criteria, setCriteria] = useState(screeningCriteria);
  const [passing, setPassing] = useState(75);
  /** Minimum fraction of a post's required skills that must match (0—100%). */
  const [coverageMin, setCoverageMin] = useState(60);
  /** NLP service status shown inside the Screening Setup dialog. */
  const [nlpStatus, setNlpStatus] = useState<{
    online: boolean;
    base_model: string | null;
    custom_ner_loaded: boolean;
  } | null>(null);
  /** True while the screening configuration is being saved. */
  const [savingConfig, setSavingConfig] = useState(false);
  /** Requirement Templates tab — selected position + custom-entry form. */
  const [keywordPosition, setKeywordPosition] = useState(positions[0]!.title);
  /** Vocabulary (Reference Data) lookup so template chips can show which
   *  terms the model already recognizes — loaded when the dialog opens. */
  const [refValues, setRefValues] = useState<Set<string>>(new Set());
  const [customTerm, setCustomTerm] = useState("");
  const [customTermType, setCustomTermType] = useState<"skill" | "job_role" | "certification">(
    "skill",
  );
  const [addingTerm, setAddingTerm] = useState(false);
  const totalWeight = criteria.reduce((t, c) => t + (c.enabled ? c.weight : 0), 0);

  /** Loads the live screening configuration + NLP service status when the
   *  Screening Setup dialog opens — no fake defaults, everything shown is
   *  what screenings actually run with. The fast vocabulary lookup is fired
   *  first so it is not stuck behind the slow NLP health probe. */
  const loadScreeningStatus = useCallback(() => {
    // Vocabulary lookup for the Requirement Templates tab — lets each chip
    // show whether the model already recognizes that term.
    screeningApi.referenceData
      .list()
      .then((res) => {
        const set = new Set<string>();
        (res.data ?? []).forEach((r) =>
          (r.aliases_json ?? [])
            .concat(r.canonical_value)
            .forEach((v) => set.add(v.trim().toLowerCase())),
        );
        setRefValues(set);
      })
      .catch((e) => console.warn("Could not load reference data for templates:", e));
    screeningApi.configuration
      .status()
      .then((res) => {
        const data = res.data;
        setNlpStatus(data.nlp_service);
        const effective = data.saved ?? data.effective;
        setCriteria(
          Object.entries(effective.criteria).map(([name, entry]) => ({
            name,
            weight: entry.weight,
            enabled: entry.enabled,
          })),
        );
        setPassing(effective.passing_score);
        setCoverageMin(Math.round((effective.required_skills_coverage_min ?? 0.6) * 100));
      })
      .catch((e) => console.warn("Could not load screening configuration status:", e));
  }, []);

  useEffect(() => {
    if (screeningOpen) loadScreeningStatus();
  }, [screeningOpen, loadScreeningStatus]);

  /** Persists the HR screening configuration — it applies to every new
   *  screening run through the NLP service (weights + thresholds). */
  const saveScreeningConfiguration = async () => {
    if (totalWeight !== 100) {
      toast.error(`Enabled criteria weights must total 100% — currently ${totalWeight}%.`);
      return;
    }
    const configuration = {
      criteria: Object.fromEntries(
        criteria.map((c) => [c.name, { weight: c.weight, enabled: c.enabled }]),
      ),
      passing_score: passing,
      required_skills_coverage_min: coverageMin / 100,
    };
    setSavingConfig(true);
    try {
      await screeningApi.configuration.save(configuration);
      toast.success("Screening configuration saved — it applies to every new resume screening.");
    } catch (e) {
      toast.error(
        e instanceof Error && e.message
          ? e.message
          : "The screening configuration could not be saved.",
      );
    } finally {
      setSavingConfig(false);
    }
  };

  /** Adds a template term to the Reference Data vocabulary (skill/role/cert)
   *  so the NLP model starts recognizing it in resumes. When the entry already
   *  exists, the backend's unique rule rejects it — surfaced as a friendly
   *  "already recognized" message instead of an error. */
  const addTermToVocabulary = async (
    term: string,
    type: "skill" | "job_role" | "certification",
  ) => {
    const value = term.trim();
    if (!value) return;
    setAddingTerm(true);
    try {
      await screeningApi.referenceData.create({
        data_type: type,
        canonical_value: value,
        aliases_json: [],
        active: true,
      });
      setRefValues((prev) => new Set(prev).add(value.toLowerCase()));
      toast.success(`"${value}" added to the screening vocabulary`, {
        description:
          "The model will recognize it as a " + type.replace("_", " ") + " in every new screening.",
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (/unique|already|duplicate/i.test(msg)) {
        toast.info(`"${value}" is already in the vocabulary`);
      } else {
        toast.error(`"${value}" could not be added — ${msg || "please try again."}`);
      }
    } finally {
      setAddingTerm(false);
    }
  };

  /** Injects the selected position's template keywords into the Job Post
   *  Builder's Required Skills block (deduplicated against what's already
   *  drafted) and jumps straight there — one click instead of copy-paste. */
  const applyTemplateToBuilder = (templateKeywords: string[]) => {
    if (templateKeywords.length === 0) return;
    const existing = new Set(draft.skills.split("\n").map((l) => l.trim().toLowerCase()));
    const merged = [
      ...draft.skills
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean),
      ...templateKeywords.filter((k) => !existing.has(k.trim().toLowerCase())),
    ];
    setDraft((d) => ({ ...d, skills: merged.join("\n") }));
    // Make sure the Required Skills block is on the builder canvas and active,
    // so the injected keywords are immediately visible.
    setBlocks((b) => (b.includes("skills") ? b : [...b, "skills" as BlockId]));
    setActiveBlock("skills");
    setScreeningOpen(false);
    setTab("builder");
    setBuilderStarted(true);
    toast.success(`Added ${templateKeywords.length} template keyword(s) to Required Skills`, {
      description: "Review them in the Job Post Builder, then publish or save the post.",
    });
  };

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

  /** Normalizes extracted contact numbers to plain local form:
   *  strips "-" and spaces, converts a leading +63 to 0
   *  ("+63 917-403-8821" -> "09174038821"). Returns null when unusable. */
  const normalizePHPhone = (raw?: string | null): string | null => {
    if (!raw) return null;
    let digits = raw.replace(/\D/g, "");
    if (digits.startsWith("63") && digits.length === 12) {
      digits = "0" + digits.slice(2);
    }
    if (digits.length < 7 || digits.length > 15) return null;
    return digits;
  };

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

  /** Zoom level for the resume preview (50—300%, reset on file change). */
  const [addPreviewZoom, setAddPreviewZoom] = useState(100);
  useEffect(() => setAddPreviewZoom(100), [addResumeFile]);

  /** Opens the selected resume in a new tab (images/PDFs render natively). */
  const openResumePreview = () => {
    if (resumePreviewUrl) window.open(resumePreviewUrl, "_blank", "noopener");
  };

  /** Positions of the department currently selected in the wizard — deduplicated by title. */
  const addPositions = useMemo(() => {
    const filtered = knownPositions.filter((p) => p.department === addDept);
    const seen = new Map<string, (typeof filtered)[number]>();
    for (const p of filtered) {
      if (!seen.has(p.title)) seen.set(p.title, p);
    }
    return Array.from(seen.values());
  }, [knownPositions, addDept]);

  /** True when the selected department/position pair has a live job post. */
  const postingIndicator = useCallback(
    (dept: string, positionTitle?: string) =>
      jobList.some(
        (j) =>
          j.department === dept &&
          (!positionTitle || j.title === positionTitle) &&
          j.active &&
          j.status === "Open",
      ),
    [jobList],
  );

  const resetAddWizard = () => {
    setAddStep(1);
    setScreenResult(null);
    setAddResumeFile(null);
    setPendingResume(null);
    setReplaceOpen(false);
    setAddFileName("");
    setAddForm({ name: "", email: "", phone: "", address: "", position: "" });
  };

  const closeAddWizard = () => {
    setAddOpen(false);
    resetAddWizard();
  };

  const clearStep2Fields = () => {
    setAddForm((prev) => ({ ...prev, name: "", email: "", phone: "", address: "" }));
    setAddFileName("");
    setAddResumeFile(null);
    setPendingResume(null);
    setReplaceOpen(false);
  };

  const requestCloseWizard = () => {
    if (addStep === 2 && hasStep2Data) {
      setPendingStep2ExitAction("close");
      setConfirmStep2ExitOpen(true);
    } else {
      closeAddWizard();
    }
  };

  const requestBackToStep1 = () => {
    if (hasStep2Data) {
      setPendingStep2ExitAction("back");
      setConfirmStep2ExitOpen(true);
    } else {
      setAddStep(1);
    }
  };

  const handleConfirmStep2Discard = () => {
    const action = pendingStep2ExitAction;
    setConfirmStep2ExitOpen(false);
    setPendingStep2ExitAction(null);
    if (action === "close") {
      closeAddWizard();
    } else if (action === "back") {
      clearStep2Fields();
      setAddStep(1);
    }
  };

  const handleConfirmStep2Stay = () => {
    setConfirmStep2ExitOpen(false);
    setPendingStep2ExitAction(null);
  };

  /** Admin flow — locked to the clicked job post (department + position auto-set). */
  const openAddApplicantForJob = (job: Job) => {
    setAddPresetJob(job);
    setAddDept(job.department);
    setAddForm({ name: "", email: "", phone: "", address: "", position: job.title });
    setAddStep(1);
    setScreenResult(null);
    setAddResumeFile(null);
    setAddFileName("");
    setPendingResume(null);
    setReplaceOpen(false);
    setAddOpen(true);
  };

  /** Super admin flow — free choice of any department & position. */
  const openAddApplicantFree = () => {
    setAddPresetJob(null);
    const firstDept = knownDepartments[0]?.name ?? departments[0]?.name ?? "";
    const firstPos = knownPositions.find((p) => p.department === firstDept)?.title ?? "";
    setAddDept(firstDept);
    setAddForm({ name: "", email: "", phone: "", address: "", position: firstPos });
    setAddStep(1);
    setScreenResult(null);
    setAddResumeFile(null);
    setAddFileName("");
    setPendingResume(null);
    setReplaceOpen(false);
    setAddOpen(true);
  };

  /**
   * Resolves the job post the applicant will be attached to.
   * Admin flow: the clicked job post. Super admin flow: an existing open post
   * for the selected position; when none exists, a Draft post is created so
   * the NLP screening and the applicant record always have a valid job_post_id.
   */
  const resolveJobPostId = async (): Promise<number | null> => {
    // Admin flow — the job post is known up-front.
    if (addPresetJob?.dbId) return addPresetJob.dbId;

    const positionId = knownPositions.find((p) => p.title === addForm.position)?.dbId;
    const departmentId = knownDepartments.find((d) => d.name === addDept)?.dbId;

    // Reuse an existing post for this position (any status).
    const existing = jobList.find((j) => j.title === addForm.position && j.department === addDept);
    if (existing?.dbId) return existing.dbId;

    // No job post exists yet — create a minimal Draft so the applicant can
    // still be screened and saved (super admin can apply to any position).
    if (positionId && departmentId) {
      try {
        const created = await jobPostsApi.create({
          position_id: positionId,
          department_id: departmentId,
          title: addForm.position,
          employment_type: "Full-time",
          schedule: "Shifting Schedule",
          vacancies: 1,
          status: "Draft",
          active: false,
          summary: `Auto-created draft post for ${addForm.position} (${addDept}) — created when an applicant was added.`,
        });
        const newJob = transformApiJob(created);
        setJobList((prev) => [newJob, ...prev]);
        toast.info(
          `No job post existed for ${addForm.position} — a draft post was created so the applicant can be screened.`,
        );
        return created.job_post_id;
      } catch (e) {
        console.warn("Could not auto-create draft job post:", e);
        toast.error("No job post exists for this position and a draft could not be created.");
        return null;
      }
    }
    toast.error(
      !addForm.position
        ? "Select a position first — this department has no defined positions."
        : "No job post found for the selected position.",
    );
    return null;
  };

  /**
   * Runs the real spaCy NLP screening through the Laravel backend.
   * The uploaded resume is analyzed against the selected job post and all
   * other open positions; the full result payload is kept so saving the
   * applicant can reuse it (no second NLP call).
   */
  const runScreening = async (jobPostId?: number) => {
    if (!addResumeFile) {
      toast.error("Upload a resume file first.");
      return;
    }
    setScreeningLoading(true);
    try {
      const id = jobPostId ?? (await resolveJobPostId());
      if (!id) {
        setScreeningLoading(false);
        return;
      }
      const fd = new FormData();
      fd.append("resume", addResumeFile);
      fd.append("job_post_id", String(id));
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
        e instanceof Error && e.message && !e.message.startsWith("Request failed")
          ? e.message
          : "Could not screen the resume. Make sure the NLP service is running on port 8001, then retry.",
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
    const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    setAddOpen(false);
    resetAddWizard();

    try {
      const jobPostId = addPresetJob?.dbId ?? (await resolveJobPostId());
      if (!jobPostId) return;

      const base = {
        job_post_id: jobPostId,
        name: addForm.name.trim(),
        email: addForm.email.trim(),
        phone: addForm.phone.trim(),
        source: addMethod === "image" ? "Walk-in" : "Online Portal",
        summary: `Added via ${addMethod === "image" ? "image (OCR)" : "document"} screening — ${addFileName || "uploaded resume"}, scored ${res.score}%.`,
        status: res.status,
        stage: "Screened",
        flags_json: res.status === "credential" ? ["Manual credential verification required"] : [],
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
        if (res.detail) {
          fd.append("screening_payload", JSON.stringify(res.detail));
        }
        payload = fd;
      }
      await applicantsApi.create(payload);
      toast.success(`${base.name} added to the applicant list in Applicant Management`);
    } catch (e) {
      console.warn("Could not persist applicant to database API:", e);
      toast.error(
        `${addForm.name} could not be saved to the database. ${
          e instanceof Error ? e.message : ""
        }`,
      );
    }
  };

  const requisitions = useRequisitions();

  const [draft, setDraft] = useState<Draft>(blankDraft);
  const [platforms, setPlatforms] = useState<Record<string, boolean>>({
    Website: true,
    Facebook: true,
    Instagram: false,
    Indeed: true,
  });
  const [preview, setPreview] = useState("Website");
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [dialogPreview, setDialogPreview] = useState("Website");
  const [customPosterUrl, setCustomPosterUrl] = useState<string | null>(null);
  /** The actual File object, uploaded with the job post on publish. */
  const [posterFile, setPosterFile] = useState<File | null>(null);

  const [deptDialogOpen, setDeptDialogOpen] = useState(false);
  const [pendingDept, setPendingDept] = useState("");
  const [pendingPosition, setPendingPosition] = useState("");
  /** False shows the "create a job posting" entry card instead of the builder canvas. */
  const [builderStarted, setBuilderStarted] = useState(false);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const [confirmTemplateOpen, setConfirmTemplateOpen] = useState(false);
  const [pendingTemplateJob, setPendingTemplateJob] = useState<Job | null>(null);
  const [templateSearch, setTemplateSearch] = useState("");
  const [savedSnapshot, setSavedSnapshot] = useState<string>(snapshotOf(blankDraft, []));

  const canSaveDraft = useMemo(
    () => blocks.some((id) => hasContentFor(id, draft)),
    [blocks, draft],
  );
  const isDirty = useMemo(
    () => tab === "builder" && canSaveDraft && snapshotOf(draft, blocks) !== savedSnapshot,
    [tab, canSaveDraft, draft, blocks, savedSnapshot],
  );

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const routeBlocker = useBlocker({
    shouldBlockFn: () => isDirty,
    withResolver: true,
  });

  const saveDraftAction = async () => {
    const title = draft.title.trim() || "Untitled position";
    const draftId =
      editingJobId ??
      `draft-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-4)}`;
    const existing = jobList.find((j) => j.id === draftId);
    const payload: Job = {
      id: draftId,
      title,
      department: draft.department,
      employmentType: draft.employmentType as Job["employmentType"],
      schedule: draft.schedule,
      salaryMin: Number(draft.salaryMin) || 0,
      salaryMax: Number(draft.salaryMax) || 0,
      vacancies: Number(draft.vacancies) || 1,
      filled: existing?.filled ?? 0,
      posted: existing?.posted ?? new Date().toISOString().slice(0, 10),
      status: "Draft",
      active: false,
      experience: existing?.experience ?? "1-2 Years",
      education: existing?.education ?? "High School Graduate",
      summary: draft.description,
      description: draft.description,
      responsibilities: lines(draft.responsibilities),
      qualifications: lines(draft.qualifications),
      skills: lines(draft.skills),
      applicants: existing?.applicants ?? 0,
      benefits: [],
      platforms: [],
    };
    setJobList((prev) =>
      prev.some((j) => j.id === draftId)
        ? prev.map((j) => (j.id === draftId ? payload : j))
        : [payload, ...prev],
    );
    setEditingJobId(draftId);
    setSavedSnapshot(snapshotOf(draft, blocks));

    // Persist the draft to the database so it survives reloads
    try {
      let positionId = positionsForDepartment(draft.department).find(
        (p) => p.title === title,
      )?.dbId;
      let departmentId = knownDepartments.find((d) => d.name === draft.department)?.dbId;
      if (!departmentId) {
        const created = await coreHcmApi.createDepartment({ name: draft.department });
        departmentId = created.department_id;
      }
      if (!positionId) {
        const created = await coreHcmApi.createPosition({
          title,
          department_id: departmentId,
          level: "Rank & File",
          headcount: 1,
        });
        positionId = created.position_id;
      }

      const basePayload = {
        position_id: positionId,
        department_id: departmentId,
        title: payload.title,
        employment_type: payload.employmentType,
        schedule: payload.schedule,
        salary_min: payload.salaryMin,
        salary_max: payload.salaryMax,
        vacancies: payload.vacancies,
        status: "Draft",
        active: false,
        summary: payload.summary,
        description: payload.description,
        responsibilities: payload.responsibilities,
        qualifications: payload.qualifications,
        skills: payload.skills,
        platforms: [],
      };

      if (existing?.dbId) {
        await jobPostsApi.update(existing.dbId, basePayload);
      } else {
        const created = await jobPostsApi.create(basePayload);
        setJobList((prev) =>
          prev.map((j) => (j.id === draftId ? { ...j, dbId: created.job_post_id } : j)),
        );
      }
      toast.success(`Draft saved — “${title}” is in your postings as a draft`);
    } catch (e) {
      console.warn("Could not persist draft to database API:", e);
      toast.error(`“${title}” was kept locally, but could not be saved to the database.`);
    }
  };

  const toggleActive = async (id: string) => {
    const target = jobList.find((j) => j.id === id);
    setJobList((prev) =>
      prev.map((j) =>
        j.id === id
          ? { ...j, active: !j.active, status: !j.active ? "Open" : ("Closed" as const) }
          : j,
      ),
    );
    try {
      await jobPostsApi.toggle(target?.dbId ?? id);
      toast.success("Job post status updated in database");
    } catch (e) {
      console.warn("Could not toggle job on API:", e);
    }
  };

  const deleteJob = async (job: Job) => {
    if (!job.dbId || !window.confirm(`Delete the “${job.title}” job posting?`)) return;
    try {
      await jobPostsApi.delete(job.dbId);
      setJobList((prev) => prev.filter((item) => item.id !== job.id));
      toast.success(`“${job.title}” deleted`);
    } catch (e) {
      console.warn("Could not delete job on API:", e);
      toast.error("The job posting could not be deleted.");
    }
  };

  const totalVacancies = jobList.reduce((t, j) => t + j.vacancies, 0);
  const totalFilled = jobList.reduce((t, j) => t + j.filled, 0);

  const lines = (s: string) =>
    s
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);

  const applyTemplate = (id: string) => {
    const t = templates.find((x) => x.id === id);
    if (!t) return;
    setDraft((d) => ({
      ...d,
      description: t.summary,
      responsibilities: t.responsibilities,
      qualifications: t.qualifications,
    }));
    toast.success(`${t.name} applied to the draft`);
  };

  const publish = async () => {
    const chosen = Object.keys(platforms).filter((k) => platforms[k]);
    if (!draft.title.trim()) {
      toast.error("Job title is required");
      return;
    }
    const vac = Number(draft.vacancies);
    if (isNaN(vac) || vac < 1) {
      toast.error("Vacancies must be a valid positive number (at least 1).");
      return;
    }
    const sMin = Number(draft.salaryMin) || 0;
    const sMax = Number(draft.salaryMax) || 0;
    if (sMin < 0 || sMax < 0) {
      toast.error("Salary amounts cannot be negative.");
      return;
    }
    if (sMin > sMax && sMax > 0) {
      toast.error("Minimum salary cannot be greater than maximum salary.");
      return;
    }
    const jobPayload: Job = {
      id:
        editingJobId ??
        `${draft.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()
          .toString()
          .slice(-4)}`,
      title: draft.title,
      department: draft.department,
      employmentType: draft.employmentType as Job["employmentType"],
      schedule: draft.schedule,
      salaryMin: Number(draft.salaryMin) || 0,
      salaryMax: Number(draft.salaryMax) || 0,
      vacancies: Number(draft.vacancies) || 1,
      filled: editingJobId ? (jobList.find((j) => j.id === editingJobId)?.filled ?? 0) : 0,
      posted: editingJobId
        ? (jobList.find((j) => j.id === editingJobId)?.posted ??
          new Date().toISOString().slice(0, 10))
        : new Date().toISOString().slice(0, 10),
      status: chosen.length ? "Open" : "Draft",
      active: chosen.length > 0,
      experience: "1-2 Years",
      education: "High School Graduate",
      summary: draft.description,
      description: draft.description,
      responsibilities: lines(draft.responsibilities),
      qualifications: lines(draft.qualifications),
      skills: lines(draft.skills),
      applicants: editingJobId ? (jobList.find((j) => j.id === editingJobId)?.applicants ?? 0) : 0,
      benefits: [],
      platforms: chosen,
    };
    const posterUrl = customPosterUrl ?? jobList.find((j) => j.id === editingJobId)?.picture;
    if (posterUrl) jobPayload.picture = posterUrl;

    setJobList((prev) =>
      editingJobId
        ? prev.map((j) => (j.id === editingJobId ? jobPayload : j))
        : [jobPayload, ...prev],
    );
    if (sourceReqId) {
      requisitionStore.update(sourceReqId, { status: "Converted" });
    }
    setTab("postings");
    setEditingJobId(null);
    setSourceReqId(null);
    setBuilderStarted(false);
    setSavedSnapshot(snapshotOf(blankDraft, []));

    // Persist to backend database API — resolve the position & department
    // from the database (Core HCM) and auto-create them when the role is new,
    // so every posting carries a valid position_id / department_id.
    let positionId = positionsForDepartment(draft.department).find(
      (p) => p.title === draft.title,
    )?.dbId;
    let departmentId = knownDepartments.find((d) => d.name === draft.department)?.dbId;

    try {
      if (!departmentId) {
        const created = await coreHcmApi.createDepartment({
          name: draft.department,
        });
        departmentId = created.department_id;
      }
      if (!positionId) {
        const created = await coreHcmApi.createPosition({
          title: draft.title,
          department_id: departmentId,
          level: "Rank & File",
          headcount: 1,
        });
        positionId = created.position_id;
      }

      const basePayload = {
        position_id: positionId,
        department_id: departmentId,
        title: jobPayload.title,
        employment_type: jobPayload.employmentType,
        schedule: jobPayload.schedule,
        salary_min: jobPayload.salaryMin,
        salary_max: jobPayload.salaryMax,
        vacancies: jobPayload.vacancies,
        status: jobPayload.status,
        active: jobPayload.active,
        summary: jobPayload.summary,
        description: jobPayload.description,
        responsibilities: jobPayload.responsibilities,
        qualifications: jobPayload.qualifications,
        skills: jobPayload.skills,
        platforms: chosen,
      };
      // Uploaded poster picture rides along as multipart/form-data
      let payload: Record<string, any> | FormData = basePayload;
      if (posterFile) {
        const fd = new FormData();
        Object.entries(basePayload).forEach(([k, v]) => {
          if (k === "active") {
            // Laravel's boolean rule rejects the string "true"/"false"
            fd.append(k, String(v ? 1 : 0));
          } else if (Array.isArray(v)) {
            // PHP only builds an array from repeated multipart keys when the
            // name ends with "[]" (e.g. responsibilities[]=a&responsibilities[]=b)
            v.forEach((item) => fd.append(`${k}[]`, String(item)));
          } else {
            fd.append(k, String(v));
          }
        });
        fd.append("picture", posterFile);
        payload = fd;
      }

      let createdJobId: number | undefined;
      const existing = editingJobId ? jobList.find((j) => j.id === editingJobId) : undefined;
      if (editingJobId && existing?.dbId) {
        await jobPostsApi.update(existing.dbId, payload);
      } else {
        // No saved record yet (e.g. a locally-kept draft) — create a real row
        const created = await jobPostsApi.create(payload);
        createdJobId = created.job_post_id;
        setJobList((prev) =>
          prev.map((j) => (j.id === jobPayload.id ? { ...j, dbId: created.job_post_id } : j)),
        );
      }
      if (sourceReqId) {
        const srcReq = requisitions.find((r) => r.id === sourceReqId);
        const jobDbId = createdJobId ?? jobList.find((j) => j.id === jobPayload.id)?.dbId;
        if (jobDbId) {
          await requisitionStore.markConverted(srcReq?.id ?? sourceReqId, jobDbId);
        }
      }
      toast.success(
        editingJobId
          ? `“${jobPayload.title}” template updated`
          : chosen.length
            ? `“${jobPayload.title}” published to ${chosen.join(", ")}`
            : `“${jobPayload.title}” saved as a draft posting`,
      );
    } catch (e) {
      console.warn("Could not persist job post to database API:", e);
      toast.error("The job posting could not be saved to the database.");
    }
  };

  const startNewPost = (department: string, position?: string) => {
    const seeded: Draft = { ...blankDraft, department, title: position ?? "" };
    setDraft(seeded);
    setBlocks(position ? ["title"] : []);
    setBuilderStarted(true);
    setEditingJobId(null);
    setSourceReqId(null);
    setLinkedReqId(null);
    setMode("custom");
    setNewOpen(false);
    setDeptDialogOpen(false);
    setSavedSnapshot(snapshotOf(seeded, position ? ["title"] : []));
    setTab("builder");
    setPendingTab(null);
  };

  const editTemplate = (job: Job) => {
    const seeded = jobToDraft(job);
    setDraft(seeded);
    setBlocks(fullBlocks);
    setEditingJobId(job.id);
    setSourceReqId(null);
    setLinkedReqId(null);
    setMode("template");
    setBuilderStarted(true);
    setSavedSnapshot(snapshotOf(seeded, fullBlocks));
    setTab("builder");
    toast.message(`Editing template for “${job.title}”`);
  };

  const copyAndUseTemplate = (job: Job) => {
    const seeded = jobToDraft(job);
    setDraft(seeded);
    setBlocks(fullBlocks);
    setEditingJobId(null);
    setSourceReqId(null);
    setLinkedReqId(null);
    setMode("template");
    setBuilderStarted(true);
    setSavedSnapshot(snapshotOf(seeded, fullBlocks));
    setTab("builder");
    toast.message(`Copied “${job.title}” — publish as a new posting`);
  };

  const convertRequisition = (reqId: string) => {
    const req = requisitions.find((r) => r.id === reqId);
    if (!req) return;
    const seeded: Draft = {
      ...blankDraft,
      title: req.position,
      department: req.department,
      vacancies: String(req.count),
      description: `We are looking for ${req.count} ${req.position}(s) to join our ${req.department} team.`,
    };
    setDraft(seeded);
    setBlocks(fullBlocks);
    setEditingJobId(null);
    setSourceReqId(reqId);
    setLinkedReqId(null);
    setMode("template");
    setBuilderStarted(true);
    setSavedSnapshot(snapshotOf(seeded, fullBlocks));
    setTab("builder");
    toast.message(
      `Building a job post from requisition ${req.id} — it stays pending until you publish`,
    );
  };

  const addBlock = (id: BlockId) => {
    setBlocks((b) => (b.includes(id) ? b : [...b, id]));
    setActiveBlock(id);
  };
  const removeBlock = (id: BlockId) => setBlocks((b) => b.filter((x) => x !== id));

  /**
   * Focuses a block's first editor control (textarea or combobox trigger).
   * Runs only when a DIFFERENT block becomes active — never steals focus
   * from controls the user clicked directly inside the current block.
   */
  const focusBlockEditor = (id: BlockId) => {
    requestAnimationFrame(() => {
      const scope = composerRef.current;
      if (!scope) return;
      const blockEl = scope.querySelector<HTMLElement>(`[data-block-id="${id}"]`);
      if (!blockEl) return;
      const target =
        blockEl.querySelector<HTMLElement>("textarea") ??
        blockEl.querySelector<HTMLElement>('button[role="combobox"]') ??
        blockEl.querySelector<HTMLElement>("input");
      if (!target) return;
      target.focus();
      blockEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  };

  /** Auto-select the first control once, whenever the active block changes. */
  useEffect(() => {
    if (!activeBlock) return;
    focusBlockEditor(activeBlock);
  }, [activeBlock]);

  /**
   * Clicking a component selects it and focuses its first combobox / textarea.
   * Clicks on interactive elements inside an already-open block (textareas,
   * inputs, comboboxes…) are left alone so users can move between fields and
   * place their cursor anywhere without the selection snapping back.
   */
  const selectBlock = (id: BlockId, e: ReactMouseEvent<HTMLDivElement>) => {
    if (activeBlock === id) return;
    const target = e.target as HTMLElement;
    if (target.closest("textarea, input, button[role='combobox'], button, label")) return;
    setActiveBlock(id);
  };

  const dropOn = (target: BlockId) => {
    if (!dragging || dragging === target) return;
    setBlocks((b) => {
      const next = b.includes(dragging) ? b.filter((x) => x !== dragging) : [...b];
      const i = next.indexOf(target);
      next.splice(i, 0, dragging);
      return next;
    });
    setDragging(null);
  };

  const has = (id: BlockId) => blocks.includes(id);

  const openCount = useMemo(() => jobList.filter((j) => j.active).length, [jobList]);

  const filteredJobs = useMemo(() => {
    const now = new Date();
    const cutoffFor = (f: string) => {
      if (f === "7") return new Date(now.getTime() - 7 * 86400000);
      if (f === "30") return new Date(now.getTime() - 30 * 86400000);
      if (f === "90") return new Date(now.getTime() - 90 * 86400000);
      if (f === "year") return new Date(now.getFullYear(), 0, 1);
      return null;
    };
    const cutoff = cutoffFor(dateFilter);
    return jobList.filter((j) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q || j.title.toLowerCase().includes(q) || j.department.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || j.status === statusFilter;
      const matchesDept = deptFilter === "all" || j.department === deptFilter;
      const matchesDate = !cutoff || new Date(`${j.posted}T00:00:00`) >= cutoff;
      return matchesSearch && matchesStatus && matchesDept && matchesDate;
    });
  }, [jobList, search, statusFilter, deptFilter, dateFilter]);

  const listSort = useSort(filteredJobs, {
    title: (j: Job) => j.title,
    department: (j: Job) => j.department,
    status: (j: Job) => j.status,
    salary: (j: Job) => j.salaryMin,
    filled: (j: Job) => j.filled,
    posted: (j: Job) => j.posted,
  });

  const PAGE_SIZE = DEFAULT_PAGE_SIZE;
  const pageCount = Math.max(1, Math.ceil(listSort.sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pagedJobs = listSort.sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, deptFilter, dateFilter]);

  const listGridCols = "grid-cols-[minmax(220px,1.4fr)_110px_150px_190px_210px_110px_190px]";

  // Metric cards jump to the postings list with the matching filter applied.
  const focusPostings = (status: "all" | "Open" | "Closed", sortBy?: "filled" | "applicants") => {
    setTab("postings");
    setStatusFilter(status);
    setSearch("");
    setDeptFilter("all");
    setDateFilter("all");
    setPage(1);
    if (sortBy === "filled") {
      setViewMode("list");
    }
    requestAnimationFrame(() => {
      document.getElementById("recruitment-postings")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };
  // Metric cards jump to the requisitions list with the matching filter applied.
  const focusRequisitions = (opts: { status?: string; urgency?: string } = {}) => {
    setTab("requisitions");
    setReqStatus(opts.status ?? "all");
    setReqUrgency(opts.urgency ?? "all");
    setReqSearch("");
    setReqDept("all");
    setReqPage(1);
  };
  // Requisitions use the same aligned-column treatment as the postings list view.
  const reqGridCols = "grid-cols-[minmax(130px,1.1fr)_106px_62px_88px_80px_86px_112px_96px_104px]";

  function ListSortHead({
    sortKey,
    children,
    align = "left",
  }: {
    sortKey: "title" | "department" | "status" | "salary" | "filled" | "posted";
    children: ReactNode;
    align?: "left" | "right" | "center";
  }) {
    const active = listSort.sort?.key === sortKey;
    const Icon = !active ? ChevronsUpDown : listSort.sort?.dir === "asc" ? ArrowUp : ArrowDown;
    return (
      <button
        type="button"
        onClick={() => listSort.toggle(sortKey)}
        className={cn(
          "flex items-center gap-1.5 text-left text-[0.65rem] font-semibold uppercase tracking-wide transition-colors hover:text-foreground",
          active ? "text-foreground" : "text-muted-foreground",
          align === "right" && "justify-end text-right",
          align === "center" && "justify-center text-center",
        )}
      >
        <span>{children}</span>
        <Icon className={cn("h-3 w-3 shrink-0", active ? "opacity-100" : "opacity-40")} />
      </button>
    );
  }

  type RequisitionSortKey =
    "id" | "position" | "department" | "count" | "requestedAt" | "urgency" | "status";

  function RequisitionSortHead({
    sortKey,
    children,
    align = "left",
    sort,
    onSort,
  }: {
    sortKey: RequisitionSortKey;
    children: ReactNode;
    align?: "left" | "right" | "center";
    sort: ReturnType<typeof useSort<Requisition, RequisitionSortKey>>["sort"];
    onSort: (key: RequisitionSortKey) => void;
  }) {
    const active = sort?.key === sortKey;
    const Icon = !active ? ChevronsUpDown : sort?.dir === "asc" ? ArrowUp : ArrowDown;
    return (
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          "flex items-center gap-1.5 text-left text-[0.65rem] font-semibold uppercase tracking-wide transition-colors hover:text-foreground",
          active ? "text-foreground" : "text-muted-foreground",
          align === "right" && "justify-end text-right",
          align === "center" && "justify-center text-center",
        )}
      >
        <span>{children}</span>
        <Icon className={cn("h-3 w-3 shrink-0", active ? "opacity-100" : "opacity-40")} />
      </button>
    );
  }

  const pendingRequisitions = requisitions.filter((r) => r.status !== "Converted");
  const highUrgencyCount = requisitions.filter(
    (r) => r.urgency === "High" && r.status !== "Converted",
  ).length;

  /** A requisition counts as new when raised within a week of the latest request. */
  const latestReqTime = Math.max(
    ...requisitions.map((r) => new Date(r.requestedAt).getTime()).filter((t) => !Number.isNaN(t)),
    0,
  );
  const isNewRequisition = (requestedAt: string) =>
    latestReqTime - new Date(requestedAt).getTime() <= 7 * 24 * 60 * 60 * 1000;

  const reqUrgencies = Array.from(new Set(requisitions.map((r) => r.urgency)));
  const filteredRequisitions = pendingRequisitions.filter((r) => {
    const q = reqSearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      `${r.id} ${r.position} ${r.department} ${r.urgency} ${r.justification}`
        .toLowerCase()
        .includes(q);
    return (
      matchesSearch &&
      (reqStatus === "all" || r.status === reqStatus) &&
      (reqDept === "all" || r.department === reqDept) &&
      (reqUrgency === "all" || r.urgency === reqUrgency)
    );
  });
  const reqSort = useSort(filteredRequisitions, {
    id: (r: Requisition) => r.id,
    position: (r: Requisition) => r.position,
    department: (r: Requisition) => r.department,
    count: (r: Requisition) => r.count,
    requestedAt: (r: Requisition) => r.requestedAt,
    urgency: (r: Requisition) => r.urgency,
    status: (r: Requisition) => r.status,
  });
  const REQ_PER_PAGE = DEFAULT_PAGE_SIZE;
  const reqPageCount = Math.max(1, Math.ceil(reqSort.sorted.length / REQ_PER_PAGE));
  const reqPageSafe = Math.min(reqPage, reqPageCount);
  const visibleRequisitions = reqSort.sorted.slice(
    (reqPageSafe - 1) * REQ_PER_PAGE,
    reqPageSafe * REQ_PER_PAGE,
  );

  const handleTabChange = (value: string) => {
    if (tab === "builder" && value !== "builder" && isDirty) {
      setPendingTab(value);
      setConfirmLeaveOpen(true);
      return;
    }
    if (value === "builder" && !editingJobId && !sourceReqId && !isDirty) {
      // Always land on the dashed "Create a job posting" card first.
      setBuilderStarted(false);
      setDeptDialogOpen(false);
      setNewOpen(false);
    }
    setTab(value);
  };

  const confirmLeaveSave = () => {
    saveDraftAction();
    setConfirmLeaveOpen(false);
    if (pendingTab) setTab(pendingTab);
    setPendingTab(null);
  };

  const confirmLeaveDiscard = () => {
    setSavedSnapshot(snapshotOf(draft, blocks));
    setConfirmLeaveOpen(false);
    if (pendingTab) setTab(pendingTab);
    setPendingTab(null);
  };

  const effectiveReqId = sourceReqId ?? linkedReqId;
  const sourceReq = requisitions.find((r) => r.id === effectiveReqId) ?? null;

  useEffect(() => {
    if (!linkedReqId || sourceReqId) return;
    const request = requisitions.find((r) => r.id === linkedReqId);
    if (!request) return;
    setDraft((current) => ({
      ...current,
      title: request.position,
      department: request.department,
      vacancies: String(request.count),
    }));
  }, [linkedReqId, sourceReqId, requisitions]);

  const recruitmentReport = {
    title: "Recruitment Management Report",
    subtitle: "Vacancies, job postings, and staffing requisitions",
    columns: [
      { header: "Job title", key: "title" },
      { header: "Department", key: "department" },
      { header: "Status", key: "status" },
      { header: "Vacancies", key: "vacancies" },
      { header: "Filled", key: "filled" },
      { header: "Applicants", key: "applicants" },
      { header: "Posted", key: "posted" },
    ],
    rows: [
      ...jobList.map((job) => ({ ...job })),
      ...pendingRequisitions.map((request) => ({
        title: `${request.position} (requisition ${request.id})`,
        department: request.department,
        status: request.status,
        vacancies: request.count,
        filled: "-",
        applicants: "-",
        posted: request.requestedAt,
      })),
    ],
    summary: [
      { label: "Active postings", value: openCount },
      { label: "Total vacancies", value: totalVacancies },
      { label: "Pending requisitions", value: pendingRequisitions.length },
    ],
  };
  const requisitionReport = {
    title: "Vacancy Requisitions Report",
    subtitle: "Pending requisitions from Core HCM",
    columns: [
      { header: "Reference", key: "id" },
      { header: "Position", key: "position" },
      { header: "Department", key: "department" },
      { header: "Openings", key: "count" },
      { header: "Urgency", key: "urgency" },
      { header: "Status", key: "status" },
      { header: "Requested", key: "requestedAt" },
    ],
    rows: filteredRequisitions.map((request) => ({ ...request })),
  };
  const ReportMenu = ({
    report,
    buttonClassName,
  }: {
    report: ReportData;
    buttonClassName?: string;
  }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={cn("gap-2", buttonClassName)}>
          <Download className="h-4 w-4" /> Generate report
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(["pdf", "docx", "excel"] as ReportFormat[]).map((format) => (
          <DropdownMenuItem key={format} onClick={() => exportReport(report, format)}>
            <FileText className="mr-2 h-4 w-4" /> Export as {format.toUpperCase()}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const salaryLine =
    draft.salaryMin || draft.salaryMax
      ? `${peso(Number(draft.salaryMin) || 0)} — ${peso(Number(draft.salaryMax) || 0)} a month`
      : "Salary to be discussed";

  const renderRequestedNote = () =>
    sourceReq ? (
      <div className="space-y-2 rounded-md border border-border bg-secondary/30 p-3 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-display text-sm font-semibold">Requested Note — {sourceReq.id}</p>
          <Badge variant="outline" className={urgencyBadge(sourceReq.urgency)}>
            {sourceReq.urgency} urgency
          </Badge>
        </div>
        <p className="text-[0.7rem] text-muted-foreground">
          {sourceReq.position} · {sourceReq.department} · {sourceReq.count} opening(s) · Requested{" "}
          {sourceReq.requestedAt}
        </p>
        {sourceReq.justification && (
          <p className="rounded-md bg-card p-3 text-xs italic leading-relaxed text-muted-foreground">
            “{sourceReq.justification}”
          </p>
        )}
      </div>
    ) : (
      <div className="rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
        This posting wasn't sourced from a staffing request — no requested note on file.
      </div>
    );

  const posterImageUrl =
    customPosterUrl ??
    `${API_BASE_URL}/job-posts/template-picture?title=${encodeURIComponent(draft.title || "Position")}`;
  const positionsForDepartment = (department: string) => {
    const departmentId = knownDepartments.find((d) => d.name === department)?.dbId;
    return knownPositions.filter(
      (p) =>
        (departmentId !== undefined && p.departmentId === departmentId) ||
        (p.departmentId === undefined && p.department === department),
    );
  };

  const handlePosterUpload = (file: File | null) => {
    if (!file) return;
    setPosterFile(file);
    const url = URL.createObjectURL(file);
    setCustomPosterUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
  };

  const handlePosterRemove = () => {
    setPosterFile(null);
    setCustomPosterUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  };

  /** Poster control: lets the recruiter swap the template photo used on the FB/IG hiring poster. */
  const PosterUploadControl = () => (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-dashed border-border p-2.5 text-[0.7rem]">
      <span className="font-medium text-muted-foreground">Picture of hiring:</span>
      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 font-medium hover:border-primary/40">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handlePosterUpload(e.target.files?.[0] ?? null)}
        />
        Upload photo
      </label>
      {customPosterUrl && (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-[0.7rem]"
          onClick={handlePosterRemove}
        >
          Remove
        </Button>
      )}
    </div>
  );

  /** Hiring poster template with the current position overlaid — imitates the design team's artwork. */
  const HiringPoster = ({ className }: { className?: string }) => (
    <div className={cn("relative aspect-square w-full overflow-hidden bg-card", className)}>
      <img
        src={posterImageUrl}
        alt="Oxford Suites Makati hiring poster"
        className="h-full w-full object-cover"
      />
      <p className="absolute left-[10%] top-[41%] max-w-[45%] font-display text-[6.5%] font-bold uppercase leading-tight text-foreground">
        {draft.title || "Position"}
      </p>
    </div>
  );

  /** Compact summary used by the inline tabs — the full render lives in the Preview post dialog. */
  const renderShortPreview = (channel: string) => {
    const meta = platformMeta.find((p) => p.key === channel);
    const Icon = meta?.icon ?? Globe;
    const cta =
      channel === "Website"
        ? "Apply Now"
        : channel === "Indeed"
          ? "Apply with Indeed"
          : channel === "Facebook"
            ? "Like · Comment · Share"
            : "Like · Comment · Share";
    return (
      <div className="space-y-2.5 rounded-md border border-border bg-card p-3">
        <div className="flex items-center gap-2 text-[0.7rem] font-semibold text-muted-foreground">
          <Icon className="h-3.5 w-3.5 text-gold" />
          {channel}
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight text-foreground">
            {draft.title || "Untitled role"}
          </p>
          <p className="mt-0.5 text-[0.7rem] text-muted-foreground">
            {draft.department || "Department"} · Makati City · {draft.employmentType}
          </p>
        </div>
        {(draft.salaryMin || draft.salaryMax) && (
          <p className="text-[0.7rem] font-semibold text-primary">{salaryLine}</p>
        )}
        {draft.description && (
          <p className="line-clamp-2 text-[0.7rem] text-muted-foreground">{draft.description}</p>
        )}
        <div className="flex items-center justify-between gap-2 border-t border-border pt-2">
          <span className="text-[0.7rem] font-medium text-foreground">{cta}</span>
          <span className="text-[0.65rem] text-muted-foreground">
            Full view in <span className="font-medium">Preview post</span>
          </span>
        </div>
      </div>
    );
  };

  const renderWebsitePreview = () => (
    <div className="space-y-5 rounded-md border border-border bg-card p-6">
      {has("title") && (
        <div>
          <h3 className="font-display text-3xl font-semibold leading-tight text-foreground">
            {draft.title || "Untitled role"}
          </h3>
          <p className="mt-1.5 text-[0.7rem] text-muted-foreground">
            {draft.employmentType} · {draft.schedule} · Makati City
          </p>
        </div>
      )}
      {has("info") && (draft.salaryMin || draft.salaryMax) && (
        <p className="text-sm font-bold text-primary">
          {peso(Number(draft.salaryMin) || 0)} — {peso(Number(draft.salaryMax) || 0)} per month
        </p>
      )}
      <div className="border-t border-border" />
      {has("description") && draft.description && (
        <div>
          <p className="font-display text-lg font-semibold">Job Description</p>
          <p className="mt-1.5 text-muted-foreground">{draft.description}</p>
        </div>
      )}
      {has("responsibilities") && lines(draft.responsibilities).length > 0 && (
        <div>
          <p className="font-display text-lg font-semibold">Responsibilities</p>
          <ul className="mt-1.5 space-y-1.5">
            {lines(draft.responsibilities).map((r) => (
              <li key={r} className="flex items-start gap-2 text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {has("qualifications") && lines(draft.qualifications).length > 0 && (
        <div>
          <p className="font-display text-lg font-semibold">Qualifications</p>
          <ul className="mt-1.5 space-y-1.5">
            {lines(draft.qualifications).map((r) => (
              <li key={r} className="flex items-start gap-2 text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {has("about") && draft.about && (
        <div>
          <p className="font-display text-lg font-semibold">About us</p>
          <p className="mt-1.5 text-muted-foreground">{draft.about}</p>
        </div>
      )}
      {has("picture") && <HiringPoster className="mx-auto max-w-md" />}
      <Button size="sm" className="w-full sm:w-auto">
        Apply Now
      </Button>
    </div>
  );

  const renderIndeedPreview = () => (
    <div className="space-y-4 rounded-md border border-border bg-card p-4">
      <div>
        <h3 className="text-lg font-semibold">{draft.title || "Untitled role"}</h3>
        <p className="flex items-center gap-1 text-sm font-medium text-primary underline-offset-2 hover:underline">
          Oxford Suites Makati <Globe className="h-3 w-3" />
        </p>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" /> Makati City, Metro Manila
        </p>
        <p className="mt-1 text-sm font-semibold">{salaryLine}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm">Apply with Indeed</Button>
        <Button size="icon" variant="outline" className="h-8 w-8">
          <Bookmark className="h-3.5 w-3.5" />
        </Button>
        <Button size="icon" variant="outline" className="h-8 w-8">
          <ThumbsDown className="h-3.5 w-3.5" />
        </Button>
        <Button size="icon" variant="outline" className="h-8 w-8">
          <Share2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="border-t border-border pt-3">
        <p className="eyebrow mb-1.5">Job details</p>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary">Pay: {salaryLine}</Badge>
          <Badge variant="secondary">Job type: {draft.employmentType}</Badge>
        </div>
      </div>
      <div className="border-t border-border pt-3">
        <p className="eyebrow mb-1.5">Location</p>
        <p className="text-muted-foreground">Makati City, Metro Manila</p>
      </div>
      <div className="space-y-3 border-t border-border pt-3">
        <p className="eyebrow">Full job description</p>
        {draft.description && (
          <div>
            <p className="text-xs font-semibold">About the role</p>
            <p className="text-muted-foreground">{draft.description}</p>
          </div>
        )}
        {lines(draft.responsibilities).length > 0 && (
          <div>
            <p className="text-xs font-semibold">What you'll be doing</p>
            <ul className="list-inside list-disc text-muted-foreground">
              {lines(draft.responsibilities).map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        )}
        {lines(draft.qualifications).length > 0 && (
          <div>
            <p className="text-xs font-semibold">What we're looking for</p>
            <ul className="list-inside list-disc text-muted-foreground">
              {lines(draft.qualifications).map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        )}
        <div>
          <p className="text-xs font-semibold">About us</p>
          <p className="text-muted-foreground">{draft.about || defaultAbout}</p>
        </div>
      </div>
    </div>
  );

  const facebookCaption = (
    <div className="space-y-2 whitespace-pre-line text-sm">
      <p className="font-semibold">We're Hiring: {draft.title || "New Position"}</p>
      <p className="text-muted-foreground">Location: Makati City, Philippines</p>
      <p>{draft.description || "Join our growing team at Oxford Suites Makati!"}</p>
      {lines(draft.responsibilities).length > 0 && (
        <div>
          <p className="font-semibold">What You'll Do:</p>
          <ul className="list-inside list-disc text-muted-foreground">
            {lines(draft.responsibilities).map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      )}
      {lines(draft.qualifications).length > 0 && (
        <div>
          <p className="font-semibold">What We're Looking For:</p>
          <ul className="list-inside list-disc text-muted-foreground">
            {lines(draft.qualifications).map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      )}
      {draft.about && (
        <div>
          <p className="font-semibold">About us:</p>
          <p className="text-muted-foreground">{draft.about}</p>
        </div>
      )}
      <p>Ready to join our team? {draft.instructions || defaultInstructions}</p>
    </div>
  );

  const renderFacebookPreview = () => (
    <div className="overflow-hidden rounded-md border border-border bg-card text-foreground">
      <div className="flex items-center gap-2 p-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          O
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-foreground">Oxford Suites Makati</p>
          <p className="text-[0.65rem] text-muted-foreground">Just now · ðŸŒ</p>
        </div>
        <MoreHorizontal className="ml-auto h-4 w-4 text-muted-foreground" />
      </div>
      <div className="px-3 pb-3 text-muted-foreground">{facebookCaption}</div>
      {has("picture") && <HiringPoster className="border-t border-border" />}
      <div className="flex items-center justify-around border-t border-border px-3 py-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <ThumbsUp className="h-3.5 w-3.5" /> Like
        </span>
        <span className="flex items-center gap-1.5">
          <MessageCircle className="h-3.5 w-3.5" /> Comment
        </span>
        <span className="flex items-center gap-1.5">
          <Share2 className="h-3.5 w-3.5" /> Share
        </span>
      </div>
    </div>
  );

  const renderInstagramPreview = () => (
    <div className="mx-auto max-w-sm overflow-hidden rounded-md border border-border bg-card text-foreground">
      <div className="flex items-center gap-2 border-b border-border p-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[0.6rem] font-bold text-primary-foreground">
          O
        </span>
        <p className="text-xs font-semibold text-foreground">
          oxfordsuitesmakati <span className="font-normal text-primary">· Follow</span>
        </p>
        <MoreHorizontal className="ml-auto h-4 w-4 text-muted-foreground" />
      </div>
      <div className="px-3 pb-3 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">
          oxfordsuitesmakati{" "}
          <span className="font-normal text-muted-foreground">
            We're Hiring: {draft.title || "New Position"}
          </span>
        </p>
        <p className="text-muted-foreground">Location: Makati City, Philippines</p>
        <div className="mt-1">{facebookCaption}</div>
      </div>
      {has("picture") && <HiringPoster />}
      <div className="flex items-center gap-3 p-3">
        <Heart className="h-5 w-5" />
        <MessageCircle className="h-5 w-5" />
        <Send className="h-5 w-5" />
        <Bookmark className="ml-auto h-5 w-5" />
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader
        eyebrow={role === "superadmin" ? "Super Admin · Recruitment" : "Admin · Recruitment"}
        title="Recruitment Management"
        description="Open or close postings per position, then build job posts with live multi-platform previews."
        actions={
          <div className="flex items-center gap-2">
            <ReportMenu report={recruitmentReport} />
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active Postings"
          value={openCount}
          icon={Send}
          tone="primary"
          onClick={() => focusPostings("Open")}
        />
        <StatCard
          label="Total Vacancies"
          value={totalVacancies}
          icon={Briefcase}
          tone="gold"
          onClick={() => focusPostings("all")}
        />
        <StatCard
          label="Pending Requisitions"
          value={pendingRequisitions.length}
          hint="From Core HCM"
          icon={FileText}
          tone="success"
          onClick={() => focusRequisitions({ status: "Pending" })}
        />
        <StatCard
          label="High Urgency"
          value={highUrgencyCount}
          hint="Requisitions flagged high urgency"
          icon={AlertTriangle}
          tone="caution"
          onClick={() => focusRequisitions({ urgency: "High" })}
        />
      </div>

      <Tabs value={tab} onValueChange={handleTabChange} className="mt-6">
        <TabsList className="inline-flex h-auto flex-wrap justify-start rounded-xl border border-border/70 bg-muted/70 p-1 shadow-sm text-muted-foreground">
          <TabsTrigger
            className="rounded-lg px-4 py-2 text-xs font-semibold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm cursor-pointer"
            value="postings"
          >
            <Briefcase className="mr-1.5 h-4 w-4" /> Vacancies &amp; Postings
          </TabsTrigger>
          <TabsTrigger
            className="rounded-lg px-4 py-2 text-xs font-semibold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm cursor-pointer"
            value="builder"
          >
            <FilePlus2 className="mr-1.5 h-4 w-4" /> Job Post Builder
          </TabsTrigger>
          <TabsTrigger
            className="rounded-lg px-4 py-2 text-xs font-semibold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm cursor-pointer"
            value="requisitions"
          >
            <Send className="mr-1.5 h-4 w-4" /> Requisitions
            {pendingRequisitions.length ? ` (${pendingRequisitions.length})` : ""}
          </TabsTrigger>
        </TabsList>

        <TabsContent id="recruitment-postings" value="postings" className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
              <Briefcase className="h-4 w-4 text-primary" /> Vacancies &amp; Postings
            </h2>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <div className="relative w-56">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search posted positions…"
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                </SelectContent>
              </Select>
              <Select value={deptFilter} onValueChange={setDeptFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All departments</SelectItem>
                  {knownDepartments.map((d) => (
                    <SelectItem key={d.code} value={d.name}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Date posted" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any time</SelectItem>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="year">This year</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
                <Button
                  type="button"
                  size="icon"
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  className="h-7 w-7"
                  onClick={() => setViewMode("list")}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  className="h-7 w-7"
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
              <Button onClick={() => setNewOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> New job post
              </Button>
              {role === "superadmin" && (
                <Button onClick={openAddApplicantFree}>
                  <UserPlus className="mr-2 h-4 w-4" /> Add applicant
                </Button>
              )}
            </div>
          </div>

          <ListBody
            className={cn(
              viewMode === "grid" ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3" : "space-y-2",
            )}
          >
            {viewMode === "list" && (
              <div className="space-y-2">
                <div
                  className={cn(
                    "hidden items-center gap-3 rounded-md border border-transparent px-3 py-1.5 md:grid",
                    listGridCols,
                  )}
                >
                  <ListSortHead sortKey="title">Position</ListSortHead>
                  <ListSortHead sortKey="status">Status</ListSortHead>
                  <ListSortHead sortKey="salary">Salary</ListSortHead>
                  <ListSortHead sortKey="filled">Filled</ListSortHead>
                  <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
                    Published to
                  </span>
                  <ListSortHead sortKey="posted">Posted</ListSortHead>
                  <span className="text-right text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
                    Actions
                  </span>
                </div>
                {pagedJobs.map((j) => {
                  const pct = Math.min(
                    100,
                    Math.round((j.filled / Math.max(1, j.vacancies)) * 100),
                  );
                  return (
                    <Card
                      key={j.id}
                      className={j.active ? "border-success/40" : "border-border/70 opacity-80"}
                    >
                      <CardContent className={cn("grid items-center gap-3 p-3", listGridCols)}>
                        <div className="min-w-0">
                          <p className="eyebrow truncate">{j.department}</p>
                          <h3 className="truncate font-display text-base font-semibold leading-tight">
                            {j.title}
                          </h3>
                          <p className="truncate text-[0.7rem] text-muted-foreground">
                            {j.employmentType} · {j.schedule}
                          </p>
                        </div>
                        <div>
                          <Badge
                            variant="outline"
                            className={
                              j.status === "Open"
                                ? "border-success/30 bg-success/15 text-success"
                                : "border-border"
                            }
                          >
                            {j.status}
                          </Badge>
                        </div>
                        <p className="truncate text-xs font-medium">
                          {peso(j.salaryMin)} — {peso(j.salaryMax)}
                        </p>
                        <div>
                          <div className="flex justify-between text-[0.65rem] text-muted-foreground">
                            <span>
                              {j.filled}/{j.vacancies} filled
                            </span>
                            <span>{j.applicants} applicants</span>
                          </div>
                          <Progress value={pct} className="mt-1 h-1.5" />
                        </div>
                        <div className="flex flex-wrap items-center gap-1">
                          {j.platforms.map((p) => (
                            <Badge key={p} variant="secondary" className="text-[0.6rem]">
                              {p}
                            </Badge>
                          ))}
                        </div>
                        <span className="truncate text-[0.65rem] text-muted-foreground">
                          Posted {j.posted}
                        </span>
                        <div className="flex items-center justify-end gap-2">
                          {role === "admin" && (
                            <Button
                              size="sm"
                              onClick={() => openAddApplicantForJob(j)}
                              title={`Add applicant for ${j.title}`}
                            >
                              <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Add applicant
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => editTemplate(j)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => copyAndUseTemplate(j)}>
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          <Switch
                            checked={j.active}
                            onCheckedChange={() => toggleActive(j.id)}
                            aria-label={`Toggle posting for ${j.title}`}
                          />
                          {role === "superadmin" && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 border border-destructive/40 text-destructive hover:text-destructive"
                              onClick={() => deleteJob(j)}
                              aria-label={`Delete posting for ${j.title}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
            {viewMode === "grid" &&
              pagedJobs.map((j) => {
                const pct = Math.min(100, Math.round((j.filled / Math.max(1, j.vacancies)) * 100));
                return (
                  <Card
                    key={j.id}
                    className={j.active ? "border-success/40" : "border-border/70 opacity-80"}
                  >
                    <CardContent className="flex h-full flex-col p-5">
                      <div className="min-h-0 flex-1">
                        <img
                          src={
                            j.picture ||
                            `${API_BASE_URL}/job-posts/template-picture?title=${encodeURIComponent(j.title)}`
                          }
                          alt={`${j.title} hiring poster`}
                          className="mb-3 aspect-video w-full rounded-md border border-border object-cover"
                        />
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="eyebrow">{j.department}</p>
                            <h3 className="font-display text-xl font-semibold">{j.title}</h3>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {j.employmentType} · {j.schedule}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              j.status === "Open"
                                ? "border-success/30 bg-success/15 text-success"
                                : "border-border"
                            }
                          >
                            {j.status}
                          </Badge>
                        </div>

                        <p className="mt-3 text-sm font-medium">
                          {peso(j.salaryMin)} — {peso(j.salaryMax)}
                        </p>

                        <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                          <span>
                            {j.filled} filled of {j.vacancies}
                          </span>
                          <span>{j.applicants} applicants</span>
                        </div>
                        <Progress value={pct} className="mt-2 h-2" />

                        <div className="mt-3 flex flex-wrap gap-1">
                          {j.platforms.map((p) => (
                            <Badge key={p} variant="secondary" className="text-[0.65rem]">
                              {p}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="mt-4 flex min-h-[76px] flex-wrap content-end gap-2 border-t border-border pt-3">
                        {role === "admin" && (
                          <Button size="sm" onClick={() => openAddApplicantForJob(j)}>
                            <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Add applicant
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => editTemplate(j)}>
                          Edit Template
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => copyAndUseTemplate(j)}>
                          <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy & Use Template
                        </Button>
                        {role === "superadmin" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="border border-destructive/40 text-destructive hover:text-destructive"
                            onClick={() => deleteJob(j)}
                          >
                            <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                          </Button>
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Posted {j.posted}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">
                            {j.active ? "Open" : "Closed"}
                          </span>
                          <Switch
                            checked={j.active}
                            onCheckedChange={() => toggleActive(j.id)}
                            aria-label={`Toggle posting for ${j.title}`}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            {filteredJobs.length === 0 && (
              <div className="md:col-span-2 xl:col-span-3">
                <ListEmptyState placeholder="Search posted positions…" />
              </div>
            )}
          </ListBody>

          <TablePagination
            page={safePage}
            pageCount={pageCount}
            from={filteredJobs.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}
            to={Math.min(safePage * PAGE_SIZE, filteredJobs.length)}
            total={filteredJobs.length}
            label="postings"
            onPageChange={setPage}
          />
        </TabsContent>

        <TabsContent value="requisitions" className="mt-4">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
                    <Send className="h-5 w-5 text-primary" /> Vacancy Requisitions
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Requests raised from Core HCM's job position list, pending conversion into a job
                    post.
                  </p>
                </div>
                <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="w-56 pl-9"
                      placeholder="Search position, department…"
                      value={reqSearch}
                      onChange={(e) => {
                        setReqSearch(e.target.value);
                        setReqPage(1);
                      }}
                    />
                  </div>
                  <Select
                    value={reqStatus}
                    onValueChange={(v) => {
                      setReqStatus(v);
                      setReqPage(1);
                    }}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={reqDept}
                    onValueChange={(v) => {
                      setReqDept(v);
                      setReqPage(1);
                    }}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All departments</SelectItem>
                      {knownDepartments.map((d) => (
                        <SelectItem key={d.code} value={d.name}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={reqUrgency}
                    onValueChange={(v) => {
                      setReqUrgency(v);
                      setReqPage(1);
                    }}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All urgencies</SelectItem>
                      {reqUrgencies.map((u) => (
                        <SelectItem key={u} value={u}>
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <ReportMenu report={requisitionReport} buttonClassName="h-10 whitespace-nowrap" />
                </div>
              </div>
              <ListBody className="mt-4 space-y-2 overflow-x-auto">
                <div
                  className={cn(
                    "hidden min-w-[960px] items-center gap-2 px-3 py-1.5 md:grid",
                    reqGridCols,
                  )}
                >
                  <RequisitionSortHead sortKey="id" sort={reqSort.sort} onSort={reqSort.toggle}>
                    Ref Number
                  </RequisitionSortHead>
                  <RequisitionSortHead
                    sortKey="department"
                    sort={reqSort.sort}
                    onSort={reqSort.toggle}
                  >
                    Department
                  </RequisitionSortHead>
                  <RequisitionSortHead sortKey="count" sort={reqSort.sort} onSort={reqSort.toggle}>
                    Openings
                  </RequisitionSortHead>
                  <RequisitionSortHead
                    sortKey="requestedAt"
                    sort={reqSort.sort}
                    onSort={reqSort.toggle}
                  >
                    Requested
                  </RequisitionSortHead>
                  <RequisitionSortHead
                    sortKey="urgency"
                    sort={reqSort.sort}
                    onSort={reqSort.toggle}
                  >
                    Urgency
                  </RequisitionSortHead>
                  <RequisitionSortHead sortKey="status" sort={reqSort.sort} onSort={reqSort.toggle}>
                    Status
                  </RequisitionSortHead>
                  <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
                    Set status
                  </span>
                  <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
                    Note
                  </span>
                  <span className="text-right text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
                    Job post
                  </span>
                </div>
                {visibleRequisitions.map((r) => (
                  <Card key={r.id} className="border-border/70">
                    <CardContent
                      className={cn(
                        "grid min-w-[960px] items-center gap-2 px-3 py-2 md:grid",
                        reqGridCols,
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="eyebrow shrink-0">{r.id}</span>
                        <span className="truncate text-sm font-semibold leading-tight">
                          {r.position}
                        </span>
                      </div>
                      <p className="truncate text-sm text-muted-foreground">{r.department}</p>
                      <p className="text-xs font-medium">{r.count}</p>
                      <p className="truncate text-[0.7rem] text-muted-foreground">
                        {r.requestedAt}
                      </p>
                      <div>
                        <Badge variant="outline" className={urgencyBadge(r.urgency)}>
                          {r.urgency}
                        </Badge>
                      </div>
                      <div>
                        <Badge
                          variant="outline"
                          className={
                            r.status === "Done"
                              ? "border-success/30 bg-success/15 text-success"
                              : r.status === "Converted"
                                ? "border-border bg-muted text-muted-foreground"
                                : "border-caution/40 bg-caution/15 text-caution"
                          }
                        >
                          {r.status}
                        </Badge>
                      </div>
                      <div>
                        {r.status === "Converted" ? (
                          <span className="text-xs text-muted-foreground">—</span>
                        ) : (
                          <Select
                            value={r.status}
                            onValueChange={(v) =>
                              requisitionStore.update(r.id, {
                                status: v as Requisition["status"],
                              })
                            }
                          >
                            <SelectTrigger className="h-8 w-full text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="Done">Mark as Done</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                      <div className="flex min-w-0 items-center">
                        <RequisitionNote req={r} />
                      </div>
                      <div className="flex items-center justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1.5 px-2 text-xs"
                          title="Convert to job post"
                          onClick={() => convertRequisition(r.id)}
                        >
                          <SquareArrowOutUpRight className="h-3.5 w-3.5" />
                          Convert
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredRequisitions.length === 0 && <ListEmptyState subject="requisitions" />}
              </ListBody>
              <TablePagination
                page={reqPageSafe}
                pageCount={reqPageCount}
                from={filteredRequisitions.length === 0 ? 0 : (reqPageSafe - 1) * REQ_PER_PAGE + 1}
                to={Math.min(reqPageSafe * REQ_PER_PAGE, filteredRequisitions.length)}
                total={filteredRequisitions.length}
                label="requisitions"
                onPageChange={setReqPage}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="builder" className="mt-4">
          {!builderStarted ? (
            <button
              type="button"
              onClick={() => {
                setPendingDept(draft.department || (knownDepartments[0]?.name ?? ""));
                setPendingPosition("");
                setDeptDialogOpen(true);
              }}
              className="group flex min-h-[520px] w-full flex-col items-center justify-center gap-5 rounded-2xl border-2 border-dashed border-border bg-muted/20 p-12 text-center transition-all hover:border-primary/60 hover:bg-primary/5 active:scale-[0.995]"
            >
              <span className="flex h-20 w-20 items-center justify-center text-primary transition-transform group-hover:scale-105">
                <FilePlus2 className="h-9 w-9" />
              </span>
              <span className="font-display text-3xl font-semibold">Create a job posting</span>
              <span className="max-w-lg text-sm text-muted-foreground">
                Choose a department and job position to start a new posting, then build it with
                drag-and-drop content blocks and preview it across every hiring channel.
              </span>
              <span className="mt-1 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-card px-4 py-2 text-xs font-medium text-primary">
                <Plus className="h-3.5 w-3.5" /> Start a new posting
              </span>
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <button
                  type="button"
                  onClick={() => {
                    setBuilderStarted(false);
                    setNewOpen(false);
                    setDeptDialogOpen(false);
                  }}
                  className="font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
                >
                  Create job post
                </button>
                <span>›</span>
                <button
                  type="button"
                  onClick={() => {
                    setPendingDept(draft.department || (knownDepartments[0]?.name ?? ""));
                    setPendingPosition(draft.title);
                    setDeptDialogOpen(true);
                  }}
                  className="underline-offset-4 hover:text-primary hover:underline"
                >
                  {draft.department || "Department"}
                </button>
                <span>›</span>
                <button
                  type="button"
                  onClick={() => {
                    setPendingDept(draft.department || (knownDepartments[0]?.name ?? ""));
                    setPendingPosition(draft.title);
                    setDeptDialogOpen(true);
                  }}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  {draft.title || "Untitled position"}
                </button>
              </div>

              <div className="grid gap-4 xl:grid-cols-[190px_minmax(0,1fr)_360px]">
                {/* Component palette */}
                <Card className="border-border/70">
                  <CardContent className="p-3">
                    <p className="eyebrow mb-2 font-bold">Add Components</p>
                    <div className="space-y-1.5">
                      {blockLibrary.map((b) => (
                        <div
                          key={b.id}
                          draggable
                          onDragStart={() => setDragging(b.id)}
                          onDragEnd={() => setDragging(null)}
                          onClick={() => addBlock(b.id)}
                          className={`flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 text-[0.7rem] transition ${
                            has(b.id)
                              ? "border-primary/30 bg-secondary/60"
                              : "border-border hover:border-primary/40"
                          }`}
                        >
                          <Plus className="h-3 w-3 shrink-0 text-muted-foreground" />
                          <span className="font-semibold">{b.label}</span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-[0.65rem] text-muted-foreground">
                      Drag onto the canvas to reorder, click to add.
                    </p>

                    <div className="mt-4 space-y-3 border-t border-border pt-3">
                      <p className="eyebrow font-bold">Content Templates</p>
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Search templates..."
                          value={templateSearch}
                          onChange={(e) => setTemplateSearch(e.target.value)}
                          className="h-7 pl-7 text-xs"
                        />
                      </div>
                      <div className="h-64 overflow-y-auto pr-1 space-y-3">
                        {(() => {
                          const q = templateSearch.trim().toLowerCase();
                          const filtered = q
                            ? jobList.filter((j) => `${j.title} ${j.department}`.toLowerCase().includes(q))
                            : jobList;
                          const grouped: Record<string, Job[]> = { Draft: [], Open: [], Closed: [] };
                          for (const j of filtered) {
                            const s = j.status as string;
                            if (grouped[s]) grouped[s].push(j);
                            else grouped[j.status]?.push(j);
                          }
                          const order: (keyof typeof grouped)[] = ["Draft", "Open", "Closed"];
                          const hasAny = order.some((k) => grouped[k].length > 0);
                          if (!hasAny) {
                            return (
                              <p className="py-2 text-xs text-muted-foreground">
                                {q ? `No templates match "${templateSearch}"` : "No templates yet — create a draft, open or closed post."}
                              </p>
                            );
                          }
                          return order.map((status) => {
                            const list = grouped[status];
                            if (list.length === 0) return null;
                            return (
                              <div key={status}>
                                <p className="text-[0.68rem] font-semibold uppercase tracking-wide text-muted-foreground">
                                  {status} ({list.length})
                                </p>
                                <div className="mt-1 space-y-1.5">
                                  {list.map((j) => (
                                    <button
                                      key={j.id}
                                      type="button"
                                      onClick={() => {
                                        setPendingTemplateJob(j);
                                        setConfirmTemplateOpen(true);
                                      }}
                                      className="w-full rounded-md border border-border px-2 py-1.5 text-left text-[0.68rem] hover:border-primary/40"
                                      title={`${j.title} — ${j.department}`}
                                    >
                                      <span className="block truncate font-medium">{j.title}</span>
                                      <span className="block truncate text-[0.62rem] text-muted-foreground">
                                        {j.department}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Canvas / composer */}
                <Card className="border-border/70">
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-center justify-between">
                      <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
                        <FilePlus2 className="h-4 w-4 text-primary" />
                        {editingJobId ? "Edit Your Job Post" : "Edit Your Job Post"}
                      </h2>
                    </div>

                    <div className="space-y-2" ref={composerRef}>
                      {blocks.map((id) => {
                        const meta = blockLibrary.find((b) => b.id === id)!;
                        return (
                          <div
                            key={id}
                            data-block-id={id}
                            draggable
                            onDragStart={() => setDragging(id)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => dropOn(id)}
                            onClick={(e) => selectBlock(id, e)}
                            className={`rounded-md border px-3 py-2 transition ${
                              activeBlock === id
                                ? "border-primary bg-secondary/40"
                                : "border-border hover:border-primary/40"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-2 text-xs font-medium">
                                <GripVertical className="h-3 w-3 cursor-grab text-muted-foreground" />
                                {meta.label}
                                <span className="text-[0.65rem] font-normal text-muted-foreground">
                                  {meta.hint}
                                </span>
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeBlock(id);
                                }}
                                aria-label={`Remove ${meta.label}`}
                              >
                                <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                              </button>
                            </div>

                            {activeBlock === id && (
                              <div className="mt-2 space-y-2">
                                {id === "title" && (
                                  <div className="grid gap-2 sm:grid-cols-2">
                                    <div className="space-y-1">
                                      <Label className="text-[0.7rem]">Department</Label>
                                      <Select
                                        value={draft.department}
                                        onValueChange={(department) => {
                                          const firstPosition =
                                            positionsForDepartment(department)[0];
                                          setDraft({
                                            ...draft,
                                            department,
                                            title: firstPosition?.title ?? "",
                                          });
                                        }}
                                      >
                                        <SelectTrigger className="h-8 text-xs">
                                          <SelectValue placeholder="Select a department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {knownDepartments.map((d) => (
                                            <SelectItem key={d.code} value={d.name}>
                                              {d.name}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-[0.7rem]">Job title</Label>
                                      <Select
                                        value={draft.title}
                                        onValueChange={(v) => setDraft({ ...draft, title: v })}
                                      >
                                        <SelectTrigger className="h-8 text-xs">
                                          <SelectValue placeholder="Select a position from Core HR" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {positionsForDepartment(draft.department).map((p) => (
                                            <SelectItem key={p.id} value={p.title}>
                                              {p.title}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                )}
                                {id === "info" && (
                                  <div className="grid gap-2 sm:grid-cols-3">
                                    <div className="space-y-1">
                                      <Label className="text-[0.7rem]">Type</Label>
                                      <Select
                                        value={draft.employmentType}
                                        onValueChange={(v) =>
                                          setDraft({ ...draft, employmentType: v })
                                        }
                                      >
                                        <SelectTrigger className="h-8 text-xs">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {["Full-time", "Part-time", "Contract", "Seasonal"].map(
                                            (t) => (
                                              <SelectItem key={t} value={t}>
                                                {t}
                                              </SelectItem>
                                            ),
                                          )}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-[0.7rem]">Schedule</Label>
                                      <Select
                                        value={draft.schedule || "Shifting Schedule"}
                                        onValueChange={(v) => setDraft({ ...draft, schedule: v })}
                                      >
                                        <SelectTrigger className="h-8 text-xs">
                                          <SelectValue placeholder="Select work schedule" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {WORK_SCHEDULE_OPTIONS.map((s) => (
                                            <SelectItem key={s} value={s}>
                                              {s}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-[0.7rem]">Vacancies</Label>
                                      <Input
                                        type="number"
                                        min={1}
                                        className="h-8 text-xs"
                                        value={draft.vacancies}
                                        disabled={role === "admin" && Boolean(sourceReqId)}
                                        onChange={(e) =>
                                          setDraft({
                                            ...draft,
                                            vacancies: sanitizeDigitsOnly(e.target.value),
                                          })
                                        }
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-[0.7rem]">Salary min (₱)</Label>
                                      <Input
                                        type="number"
                                        min={0}
                                        className="h-8 text-xs"
                                        value={draft.salaryMin}
                                        onChange={(e) =>
                                          setDraft({
                                            ...draft,
                                            salaryMin: sanitizeDecimalString(e.target.value),
                                          })
                                        }
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-[0.7rem]">Salary max (₱)</Label>
                                      <Input
                                        type="number"
                                        min={0}
                                        className="h-8 text-xs"
                                        value={draft.salaryMax}
                                        onChange={(e) =>
                                          setDraft({
                                            ...draft,
                                            salaryMax: sanitizeDecimalString(e.target.value),
                                          })
                                        }
                                      />
                                    </div>
                                  </div>
                                )}
                                {id === "description" && (
                                  <Textarea
                                    autoFocus
                                    rows={2}
                                    className="text-xs"
                                    value={draft.description}
                                    onChange={(e) =>
                                      setDraft({ ...draft, description: e.target.value })
                                    }
                                    placeholder="Short pitch of the role…"
                                  />
                                )}
                                {id === "picture" && (
                                  <div className="space-y-2">
                                    <HiringPoster className="mx-auto max-w-md" />
                                    <PosterUploadControl />
                                  </div>
                                )}
                                {id === "responsibilities" && (
                                  <Textarea
                                    autoFocus
                                    rows={3}
                                    className="text-xs"
                                    value={draft.responsibilities}
                                    onChange={(e) =>
                                      setDraft({ ...draft, responsibilities: e.target.value })
                                    }
                                    placeholder="One responsibility per line…"
                                  />
                                )}
                                {id === "qualifications" && (
                                  <Textarea
                                    autoFocus
                                    rows={3}
                                    className="text-xs"
                                    value={draft.qualifications}
                                    onChange={(e) =>
                                      setDraft({ ...draft, qualifications: e.target.value })
                                    }
                                    placeholder="One qualification per line…"
                                  />
                                )}
                                {id === "skills" && (
                                  <Textarea
                                    autoFocus
                                    rows={2}
                                    className="text-xs"
                                    value={draft.skills}
                                    onChange={(e) => setDraft({ ...draft, skills: e.target.value })}
                                    placeholder="One skill per line…"
                                  />
                                )}
                                {id === "instructions" && (
                                  <Textarea
                                    autoFocus
                                    rows={2}
                                    className="text-xs"
                                    value={draft.instructions}
                                    onChange={(e) =>
                                      setDraft({ ...draft, instructions: e.target.value })
                                    }
                                    placeholder="How should applicants apply?"
                                  />
                                )}
                                {id === "about" && (
                                  <Textarea
                                    autoFocus
                                    rows={2}
                                    className="text-xs"
                                    value={draft.about}
                                    onChange={(e) => setDraft({ ...draft, about: e.target.value })}
                                    placeholder="Company blurb…"
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => dragging && addBlock(dragging)}
                        className="rounded-md border border-dashed border-border py-3 text-center text-[0.7rem] text-muted-foreground"
                      >
                        Drop a component here
                      </div>
                    </div>

                    <div className="rounded-md border border-border p-3">
                      <p className="eyebrow mb-2">Publish To</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {platformMeta.map((p) => (
                          <div key={p.key} className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-xs">
                              <p.icon className="h-3.5 w-3.5 text-muted-foreground" /> {p.key}
                            </span>
                            <Switch
                              checked={platforms[p.key] ?? false}
                              onCheckedChange={(v) => setPlatforms({ ...platforms, [p.key]: v })}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!canSaveDraft}
                        onClick={saveDraftAction}
                      >
                        Save draft
                      </Button>
                      <Button size="sm" onClick={publish}>
                        <Send className="mr-2 h-4 w-4" />
                        {editingJobId ? "Update template" : "Publish job post"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Preview */}
                <Card className="border-border/70">
                  <CardContent className="space-y-4 p-4">
                    <div>
                      <h2 className="font-display text-lg font-semibold">Requested Note</h2>
                      {!sourceReqId && (
                        <div className="mt-2 space-y-1.5">
                          <Label className="text-xs">Link a pending staffing request</Label>
                          <Select
                            value={linkedReqId ?? "none"}
                            onValueChange={(v) => setLinkedReqId(v === "none" ? null : v)}
                          >
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue placeholder="No staffing request" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No staffing request</SelectItem>
                              {requisitions
                                .filter((r) => r.status === "Pending")
                                .map((r) => (
                                  <SelectItem key={r.id} value={r.id}>
                                    {r.id} — {r.position} ({r.department})
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      <div className="mt-2">{renderRequestedNote()}</div>
                    </div>
                    <div>
                      <Tabs value={preview} onValueChange={setPreview}>
                        <TabsList className="grid w-full grid-cols-4 gap-1">
                          {platformMeta.map((p) => (
                            <TabsTrigger
                              key={p.key}
                              value={p.key}
                              className="min-w-0 px-1 text-[0.7rem]"
                            >
                              <p.icon className="mr-1 h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{p.key}</span>
                            </TabsTrigger>
                          ))}
                        </TabsList>

                        <TabsContent value="Website" className="mt-3 text-[0.7rem]">
                          {renderShortPreview("Website")}
                        </TabsContent>
                        <TabsContent value="Indeed" className="mt-3 text-[0.7rem]">
                          {renderShortPreview("Indeed")}
                        </TabsContent>
                        <TabsContent value="Facebook" className="mt-3 text-[0.7rem]">
                          {renderShortPreview("Facebook")}
                        </TabsContent>
                        <TabsContent value="Instagram" className="mt-3 text-[0.7rem]">
                          {renderShortPreview("Instagram")}
                        </TabsContent>
                      </Tabs>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <h2 className="font-display text-lg font-semibold">Preview</h2>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setDialogPreview(preview);
                            setPreviewDialogOpen(true);
                          }}
                        >
                          Preview post
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {draft.title || "Untitled position"} — {dialogPreview} preview
            </DialogTitle>
            <DialogDescription>
              Full-size preview of how this posting will appear on {dialogPreview}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap gap-2">
            {platformMeta.map((p) => (
              <Button
                key={p.key}
                type="button"
                size="sm"
                variant={dialogPreview === p.key ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setDialogPreview(p.key)}
              >
                <p.icon className="mr-1.5 h-3.5 w-3.5" />
                {p.key}
              </Button>
            ))}
          </div>
          <div className="text-sm">
            {dialogPreview === "Website" && renderWebsitePreview()}
            {dialogPreview === "Indeed" && renderIndeedPreview()}
            {dialogPreview === "Facebook" && renderFacebookPreview()}
            {dialogPreview === "Instagram" && renderInstagramPreview()}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={newOpen || deptDialogOpen}
        onOpenChange={(open) => {
          setNewOpen(open);
          setDeptDialogOpen(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose department and job position</DialogTitle>
            <DialogDescription>
              Pick the department and the position this job post is for — it seeds the builder with
              a blank, customizable template.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Department</Label>
              <Select
                value={pendingDept}
                onValueChange={(v) => {
                  setPendingDept(v);
                  setPendingPosition("");
                }}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {knownDepartments.map((d) => (
                    <SelectItem key={d.code} value={d.name}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Job position</Label>
              <Select value={pendingPosition} onValueChange={setPendingPosition}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select a position" />
                </SelectTrigger>
                <SelectContent>
                  {positionsForDepartment(pendingDept).map((p) => (
                    <SelectItem key={p.id} value={p.title}>
                      {p.title}
                    </SelectItem>
                  ))}
                  {positionsForDepartment(pendingDept).length === 0 && (
                    <div className="px-2 py-3 text-xs text-muted-foreground">
                      No positions defined for this department.
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setNewOpen(false);
                setDeptDialogOpen(false);
              }}
            >
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
            <Button
              disabled={!pendingPosition}
              onClick={() => startNewPost(pendingDept, pendingPosition)}
            >
              <PencilRuler className="mr-2 h-4 w-4" /> Start job post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmLeaveOpen} onOpenChange={setConfirmLeaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save this job post as a draft?</DialogTitle>
            <DialogDescription>
              You have unsaved changes in the Job Post Builder. Save your progress as a draft before
              leaving, or discard the changes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmLeaveOpen(false)}>
              Cancel
            </Button>
            <Button variant="outline" onClick={confirmLeaveDiscard}>
              Discard
            </Button>
            <Button onClick={confirmLeaveSave}>Save as draft & leave</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={routeBlocker.status === "blocked"}
        onOpenChange={(open) => {
          if (!open) routeBlocker.reset?.();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save this job post as a draft?</DialogTitle>
            <DialogDescription>
              You’re navigating away with unsaved Job Post Builder changes. Save your progress as a
              draft before leaving, or discard the changes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => routeBlocker.reset?.()}>
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSavedSnapshot(snapshotOf(draft, blocks));
                routeBlocker.proceed?.();
              }}
            >
              Discard
            </Button>
            <Button
              onClick={() => {
                saveDraftAction();
                routeBlocker.proceed?.();
              }}
            >
              Save as draft & leave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ADD APPLICANT DIALOG — NLP resume screening wizard */}
      <Dialog open={addOpen} onOpenChange={(o) => (o ? setAddOpen(true) : requestCloseWizard())}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[95vw] w-[95vw] lg:max-w-[1500px]">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Add Applicant</DialogTitle>
            <DialogDescription>
              {addPresetJob
                ? `${addPresetJob.department} · Step ${addStep} of 3 — `
                : `Step ${addStep} of 3 — `}
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
                  body: "PDF or DOCX resume — text is parsed directly by the NER model.",
                },
                {
                  id: "image" as const,
                  icon: ImageIcon,
                  title: "Through image",
                  body: "Photo or scan of a walk-in resume — OCR first, then NER screening.",
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
              {/* Department — locked to the clicked job post for admins,
                  free choice of every department for the super admin. */}
              <div className="space-y-2">
                <Label>Department</Label>
                <Select
                  value={addDept}
                  disabled={Boolean(addPresetJob)}
                  onValueChange={(v) => {
                    setAddDept(v);
                    const first = knownPositions.find((p) => p.department === v);
                    setAddForm((f) => ({ ...f, position: first?.title ?? "" }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {knownDepartments.map((d) => (
                      <SelectItem key={d.code} value={d.name}>
                        <span className="flex items-center gap-2">
                          {d.name}
                          {postingIndicator(d.name) && (
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

              {/* Applying for — locked to the clicked job post for admins. */}
              <div className="space-y-2">
                <Label>Applying for</Label>
                <Select
                  value={addForm.position}
                  disabled={Boolean(addPresetJob) || addPositions.length === 0}
                  onValueChange={(v) => setAddForm({ ...addForm, position: v })}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        addPositions.length === 0
                          ? "No positions defined for this department"
                          : "Select a position"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {addPositions.map((p) => (
                      <SelectItem key={p.id} value={p.title}>
                        <span className="flex items-center gap-2">
                          {p.title}
                          {postingIndicator(addDept, p.title) && (
                            <span className="rounded bg-success/15 px-1.5 py-0.5 text-[0.6rem] font-semibold text-success">
                              Posting
                            </span>
                          )}
                        </span>
                      </SelectItem>
                    ))}
                    {addPositions.length === 0 && (
                      <div className="px-2 py-3 text-xs text-muted-foreground">
                        No positions defined for this department.
                      </div>
                    )}
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
                    className="mt-3 inline-flex max-w-full flex-wrap items-center gap-1.5 break-words text-sm font-medium text-primary underline underline-offset-2"
                    style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
                    title="Click to open a preview of this file"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openResumePreview();
                    }}
                  >
                    <span
                      className="min-w-0 flex-1"
                      style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
                    >
                      {addFileName}
                    </span>
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
                <Button variant="outline" onClick={requestBackToStep1}>
                  Back
                </Button>
                <Button
                  onClick={() => {
                    if (!addForm.position) {
                      toast.error(
                        "Select a position first — this department has no defined positions.",
                      );
                      return;
                    }
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
                    <span
                      className="flex min-w-0 flex-1 items-center gap-1.5 text-xs font-medium"
                      style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
                    >
                      {addMethod === "image" ? (
                        <ImageIcon className="h-3.5 w-3.5 shrink-0 text-primary" />
                      ) : (
                        <FileText className="h-3.5 w-3.5 shrink-0 text-primary" />
                      )}
                      <span
                        className="min-w-0 flex-1 break-words whitespace-normal text-primary underline underline-offset-2"
                        style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
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
                      <span className="w-8 text-center text-[0.65rem] text-muted-foreground">
                        {addPreviewZoom}%
                      </span>
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
                  <div className="relative flex-1 min-h-[420px] overflow-auto bg-muted/30 p-3">
                    {resumePreviewUrl && addResumeFile ? (
                      /\.(jpe?g|png)$/i.test(addResumeFile.name) ||
                      addResumeFile.type.startsWith("image/") ? (
                        <div className="flex h-full w-full items-center justify-center">
                          <img
                            src={resumePreviewUrl}
                            alt={`Uploaded resume: ${addFileName}`}
                            className="max-h-full max-w-full rounded-sm border border-border object-contain shadow-sm transition-transform"
                            style={{
                              transform: `scale(${addPreviewZoom / 100})`,
                              transformOrigin: "center center",
                            }}
                          />
                        </div>
                      ) : /\.pdf$/i.test(addResumeFile.name) ||
                        addResumeFile.type === "application/pdf" ? (
                        <div className="h-full w-full overflow-auto">
                          <div
                            style={{
                              transform: `scale(${addPreviewZoom / 100})`,
                              transformOrigin: "top center",
                              height:
                                addPreviewZoom !== 100
                                  ? `${(100 / addPreviewZoom) * 100}%`
                                  : "100%",
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
                      fit: "Strong match — meets or exceeds the requirements for this role.",
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
                      screenResult.entities.filter((e) => e.label === "SKILL").map((e) => e.value);
                    const missing =
                      breakdown?.["skills"]?.missing_required ?? (matched.length === 0 ? [] : []);
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
                                  ✓ {k}
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
                                  ‑ {k}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Compact summary — 2Ã—2 grid, easy to scan, no scroll needed */}
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-md border border-border bg-card p-3">
                            <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                              <Briefcase className="h-3.5 w-3.5" /> Work experience
                            </p>
                            <p className="text-sm leading-relaxed">
                              {experience.length > 0 ? (
                                <>
                                  {experience.join(", ")}
                                  {detail?.profile?.estimated_years_experience
                                    ? ` (~${detail.profile.estimated_years_experience} yrs)`
                                    : ""}
                                </>
                              ) : (
                                <span className="text-muted-foreground">
                                  No employer history detected
                                </span>
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
                              <AlertTriangle className="h-3.5 w-3.5" />{" "}
                              {unrecognizedSkills.length > 0
                                ? "Unrecognized skills"
                                : "Skills note"}
                            </p>
                            <p
                              className={cn(
                                "text-sm leading-relaxed",
                                unrecognizedSkills.length > 0
                                  ? "text-amber-600"
                                  : "text-muted-foreground",
                              )}
                            >
                              {unrecognizedSkills.length > 0
                                ? unrecognizedSkills.join(", ")
                                : "All skills recognized — clean"}
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
                              ? "Recommendation: Move forward — the applicant is saved to the applicant list for interview scheduling."
                              : "Recommendation: Save for review or refer to a better-matching role in Applicant Management."}
                          </p>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className="cursor-pointer"
                          onClick={() => {
                            toast("Re-running resume analysis…");
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

      {/* CONTENT TEMPLATE CONFIRMATION — fill all components */}
      <Dialog open={confirmTemplateOpen} onOpenChange={setConfirmTemplateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Use this template?</DialogTitle>
            <DialogDescription>
              This will fill all components in the builder with &quot;{pendingTemplateJob?.title}&quot;
              {pendingTemplateJob ? ` — ${pendingTemplateJob.department}` : ""} data. Missing
              components will be automatically created. Continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmTemplateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!pendingTemplateJob) return;
                const seeded = jobToDraft(pendingTemplateJob);
                setDraft(seeded);
                setBlocks(fullBlocks);
                setEditingJobId(pendingTemplateJob.id);
                setSourceReqId(null);
                setLinkedReqId(null);
                setMode("template");
                setBuilderStarted(true);
                setSavedSnapshot(snapshotOf(seeded, fullBlocks));
                setConfirmTemplateOpen(false);
                toast.success(`Template "${pendingTemplateJob.title}" applied — all components filled`);
              }}
            >
              Fill all components
            </Button>
          </DialogFooter>
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
          <DialogHeader className="min-w-0">
            <DialogTitle>Replace applicant details?</DialogTitle>
            <DialogDescription
              className="min-w-0 max-w-full break-words"
              style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
            >
              The form already has details
              {addResumeFile ? (
                <>
                  {" "}
                  from "
                  <span
                    className="break-words"
                    style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
                  >
                    {addFileName}
                  </span>
                  "
                </>
              ) : (
                " you"
              )}{" "}
              entered. Uploading "
              <span
                className="break-words"
                style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
              >
                {pendingResume?.name ?? "this resume"}
              </span>
              " will overwrite Full name, Email, Contact number and Address with the values
              extracted from it.
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

      {/* CONFIRM EXIT STEP 2 WITH FILLED DATA — Back/X with unsaved fill-up */}
      <Dialog
        open={confirmStep2ExitOpen}
        onOpenChange={(o) => {
          if (!o) handleConfirmStep2Stay();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Discard filled information?</DialogTitle>
            <DialogDescription>
              You have unsaved information in Full name, Email, Contact number or Address
              {addFileName ? ` (file "${addFileName}")` : ""}. If you{" "}
              {pendingStep2ExitAction === "back" ? "go back" : "exit"}, your fill-up will be
              removed. Stay will keep your data and stay in Step 2.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleConfirmStep2Stay}>
              Stay
            </Button>
            <Button variant="destructive" onClick={handleConfirmStep2Discard}>
              {pendingStep2ExitAction === "back" ? "Discard & Back" : "Discard & Exit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SCREENING SETUP DIALOG — moved from Applicant Management header */}
      <Dialog open={screeningOpen} onOpenChange={setScreeningOpen}>
        <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden p-0 sm:max-w-4xl">
          <Tabs
            value={screeningTab}
            onValueChange={setScreeningTab}
            className="flex min-h-0 w-full flex-1 flex-col"
          >
            {/* Header + live NLP service status */}
            <div className="space-y-3 border-b border-border px-6 pb-4 pt-6">
              <DialogHeader className="space-y-2 text-left">
                <DialogTitle className="flex items-center gap-2 font-display text-2xl">
                  <ScanLine className="h-5 w-5 text-primary" /> Screening Setup
                </DialogTitle>
                <DialogDescription>
                  Scoring — how resumes are scored. Requirement Templates — what to require per
                  position. Reference Data — the vocabulary the model recognizes in resumes. Saved
                  settings apply to every new screening run.
                </DialogDescription>
              </DialogHeader>

              <div
                className={cn(
                  "flex flex-wrap items-center gap-2 rounded-md border px-3 py-2 text-xs",
                  nlpStatus?.online
                    ? "border-success/40 bg-success/10 text-success"
                    : "border-destructive/40 bg-destructive/10 text-destructive",
                )}
              >
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    nlpStatus?.online ? "bg-success" : "bg-destructive animate-pulse",
                  )}
                />
                {nlpStatus === null ? (
                  <span className="text-muted-foreground">Checking NLP service…</span>
                ) : nlpStatus.online ? (
                  <>
                    <span className="font-medium">NLP service online</span>
                    <Badge variant="secondary">{nlpStatus.base_model ?? "spaCy"}</Badge>
                    {nlpStatus.custom_ner_loaded ? (
                      <Badge variant="secondary">Custom NER model loaded</Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-warning/40 text-warning-foreground"
                      >
                        Custom NER not loaded
                      </Badge>
                    )}
                  </>
                ) : (
                  <span className="font-medium">
                    NLP service offline — resume screening will fail until it is running on port
                    8001.
                  </span>
                )}
              </div>

              <TabsList className="h-auto w-full justify-start rounded-lg border border-border/70 bg-muted/70 p-1">
                {[
                  { value: "scoring", label: "Scoring", icon: Sliders },
                  { value: "keywords", label: "Requirement Templates", icon: FilePlus2 },
                  { value: "reference", label: "Reference Data", icon: Database },
                ].map((t) => (
                  <TabsTrigger
                    key={t.value}
                    value={t.value}
                    className="flex flex-1 items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm cursor-pointer"
                  >
                    <t.icon className="h-3.5 w-3.5" /> {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Scrollable tab content */}
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
              <TabsContent value="scoring" className="mt-0">
                <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                  {/* Criteria weights */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-sm font-semibold">Criteria weights</h3>
                      <p className="text-xs text-muted-foreground">
                        How much each criterion contributes to the match score. Enabled weights must
                        total 100%.
                      </p>
                    </div>
                    {criteria.map((c, idx) => (
                      <div
                        key={c.name}
                        className={cn(
                          "rounded-md border p-3 transition-colors",
                          c.enabled ? "border-border" : "border-dashed border-border bg-muted/30",
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <label className="flex min-w-0 cursor-pointer items-center gap-2">
                            <Switch
                              checked={c.enabled}
                              onCheckedChange={(v) =>
                                setCriteria((prev) =>
                                  prev.map((x, i) => (i === idx ? { ...x, enabled: v } : x)),
                                )
                              }
                            />
                            <span
                              className={cn(
                                "truncate text-sm font-medium",
                                !c.enabled && "text-muted-foreground line-through",
                              )}
                            >
                              {c.name}
                            </span>
                          </label>
                          <span
                            className={cn(
                              "font-display text-base font-semibold tabular-nums",
                              c.enabled ? "text-primary" : "text-muted-foreground",
                            )}
                          >
                            {c.weight}%
                          </span>
                        </div>
                        <Slider
                          className="mt-2.5"
                          value={[c.weight]}
                          max={100}
                          step={5}
                          disabled={!c.enabled}
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
                    <div
                      className={cn(
                        "flex items-center justify-between rounded-md border px-3 py-2 text-xs font-medium",
                        totalWeight === 100
                          ? "border-success/40 bg-success/10 text-success"
                          : "border-destructive/40 bg-destructive/10 text-destructive",
                      )}
                    >
                      <span>Total weight</span>
                      <span className="font-display text-sm tabular-nums">{totalWeight}%</span>
                    </div>
                  </div>

                  {/* Thresholds + preview */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold">Passing thresholds</h3>
                      <p className="text-xs text-muted-foreground">
                        Cut-offs that decide how a screened resume is classified.
                      </p>
                    </div>

                    <div className="space-y-2 rounded-md border border-border p-3">
                      <div className="flex items-baseline justify-between">
                        <Label className="text-xs">Passing score</Label>
                        <span className="font-display text-sm font-semibold text-primary tabular-nums">
                          {passing}%
                        </span>
                      </div>
                      <Slider
                        value={[passing]}
                        max={100}
                        step={1}
                        onValueChange={(v) => setPassing(v[0] ?? passing)}
                      />
                      <p className="text-[0.7rem] text-muted-foreground">
                        Resumes scoring at or above this are classified “Perfect for the Job” —
                        provided mandatory requirements are also met.
                      </p>
                    </div>

                    <div className="space-y-2 rounded-md border border-border p-3">
                      <div className="flex items-baseline justify-between">
                        <Label className="text-xs">Required-skills coverage</Label>
                        <span className="font-display text-sm font-semibold text-primary tabular-nums">
                          {coverageMin}%
                        </span>
                      </div>
                      <Slider
                        value={[coverageMin]}
                        max={100}
                        step={5}
                        onValueChange={(v) => setCoverageMin(v[0] ?? coverageMin)}
                      />
                      <p className="text-[0.7rem] text-muted-foreground">
                        A resume must match at least this fraction of the job post&apos;s required
                        skills before it can pass — even when the weighted score is high.
                      </p>
                    </div>

                    {/* How scoring works — quick reference */}
                    <div className="space-y-2 rounded-md border border-border/70 bg-muted/30 p-3 text-xs text-muted-foreground">
                      <p className="font-medium text-foreground">How a resume is scored</p>
                      <ol className="list-decimal space-y-1 pl-4">
                        <li>
                          Text is extracted (PDF/DOCX/OCR) and entities are tagged by the NER model.
                        </li>
                        <li>
                          Skills, experience, education and certifications are matched against the
                          job post&apos;s requirements.
                        </li>
                        <li>
                          Each criterion earns a share of its weight; the sum is the match score.
                        </li>
                        <li>
                          Classification:{" "}
                          <span className="font-medium text-foreground">Perfect for the Job</span>{" "}
                          (passes thresholds),{" "}
                          <span className="font-medium text-foreground">Fit for other Job</span>{" "}
                          (better match among open posts),{" "}
                          <span className="font-medium text-foreground">Invalid credential</span>{" "}
                          (credential issue found), otherwise{" "}
                          <span className="font-medium text-foreground">Not fitted to Job</span>.
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="keywords" className="mt-0">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold">Requirement templates per position</h3>
                    <p className="text-xs text-muted-foreground">
                      What to <span className="font-medium text-foreground">require</span> for this
                      role — use the chips to seed a job post&apos;s requirements, or add a term to
                      the vocabulary so the model recognizes it in resumes.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Job position</Label>
                    <Select value={keywordPosition} onValueChange={(v) => setKeywordPosition(v)}>
                      <SelectTrigger className="max-w-sm">
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

                  {(() => {
                    const template = keywordLibrary[keywordPosition] ?? [];
                    const inVocab = (k: string) => refValues.has(k.trim().toLowerCase());
                    const missing = template.filter((k) => !inVocab(k));
                    return (
                      <>
                        <div className="flex flex-wrap gap-1.5 rounded-md border border-border bg-muted/30 p-3">
                          {template.map((k) => (
                            <Badge
                              key={k}
                              variant={inVocab(k) ? "secondary" : "outline"}
                              className="group gap-1 py-1 pl-2 pr-1 text-xs"
                            >
                              {k}
                              {inVocab(k) ? (
                                <span
                                  className="text-[0.6rem] text-success"
                                  title="Already in the screening vocabulary"
                                >
                                  ✓
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  disabled={addingTerm}
                                  title={`Add "${k}" to the screening vocabulary so the model recognizes it in resumes`}
                                  className="rounded-sm px-0.5 text-[0.65rem] font-bold text-primary transition-colors hover:bg-primary/15 disabled:opacity-50"
                                  onClick={() => addTermToVocabulary(k, guessRefType(k))}
                                >
                                  +
                                </button>
                              )}
                            </Badge>
                          ))}
                          {template.length === 0 && (
                            <span className="text-xs text-muted-foreground">
                              No template keywords for this position yet — add custom terms below.
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            size="sm"
                            className="cursor-pointer"
                            disabled={template.length === 0}
                            onClick={() => applyTemplateToBuilder(template)}
                          >
                            <FilePlus2 className="mr-1.5 h-3.5 w-3.5" /> Use in Job Post Builder
                          </Button>
                          {missing.length > 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="cursor-pointer"
                              disabled={addingTerm}
                              onClick={() =>
                                Promise.all(
                                  missing.map((k) => addTermToVocabulary(k, guessRefType(k))),
                                )
                              }
                            >
                              <Plus className="mr-1.5 h-3.5 w-3.5" /> Add all {missing.length}{" "}
                              missing to vocabulary
                            </Button>
                          )}
                          <p className="text-[0.7rem] text-muted-foreground">
                            {missing.length === 0 && template.length > 0
                              ? "All template terms are already recognized by the model."
                              : `${missing.length} of ${template.length} terms are not yet in the vocabulary — terms not in the vocabulary are flagged for review when found in resumes.`}
                          </p>
                        </div>
                      </>
                    );
                  })()}

                  <div className="space-y-2 rounded-md border border-border p-3">
                    <Label className="text-xs">Add a custom term to the vocabulary</Label>
                    <div className="flex flex-wrap items-center gap-2">
                      <Select
                        value={customTermType}
                        onValueChange={(v) => setCustomTermType(v as typeof customTermType)}
                      >
                        <SelectTrigger className="h-9 w-40 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="skill">Skill</SelectItem>
                          <SelectItem value="job_role">Job role</SelectItem>
                          <SelectItem value="certification">Certification</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        className="h-9 min-w-0 flex-1 text-xs"
                        placeholder="e.g. Opera Cloud, Micros POS, Guest Service Officer"
                        value={customTerm}
                        onChange={(e) => setCustomTerm(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && customTerm.trim()) {
                            e.preventDefault();
                            addTermToVocabulary(customTerm, customTermType).then(() =>
                              setCustomTerm(""),
                            );
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-9 cursor-pointer"
                        disabled={addingTerm || !customTerm.trim()}
                        onClick={() =>
                          addTermToVocabulary(customTerm, customTermType).then(() =>
                            setCustomTerm(""),
                          )
                        }
                      >
                        {addingTerm ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Plus className="h-3.5 w-3.5" />
                        )}
                        Add
                      </Button>
                    </div>
                    <p className="text-[0.7rem] text-muted-foreground">
                      Terms added here appear on the Reference Data tab and are matched in every new
                      screening — aliases can be managed there.
                    </p>
                  </div>

                  <p className="text-[0.7rem] text-muted-foreground">
                    Entities captured from every resume:{" "}
                    {["PERSON", "EDUCATION", "JOB_TITLE", "SKILL", "CERTIFICATION"].join(" · ")}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="reference" className="mt-0">
                <p className="mb-3 rounded-md border border-border/70 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Vocabulary, not requirements.</span>{" "}
                  These are the terms the NLP model matches in resumes — with aliases for spelling
                  variants. Managing them here affects every screening; it does not change what a
                  job post requires (that lives in each post&apos;s skills list).
                </p>
                <ScreeningReferenceManager />
              </TabsContent>
            </div>

            {/* Footer — sticky save bar for the scoring tab */}
            <div className="border-t border-border bg-muted/30 px-6 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[0.7rem] text-muted-foreground">
                  {screeningTab === "scoring"
                    ? "Weights and thresholds apply to every new resume screening after saving."
                    : screeningTab === "keywords"
                      ? "Templates seed job post requirements; the + buttons add terms to the screening vocabulary."
                      : "Reference Data changes apply to the next screening immediately."}
                </p>
                <Button
                  className="cursor-pointer"
                  disabled={savingConfig || totalWeight !== 100}
                  onClick={saveScreeningConfiguration}
                >
                  {savingConfig ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
                    </>
                  ) : (
                    <>
                      <Sliders className="mr-2 h-4 w-4" /> Save configuration
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
