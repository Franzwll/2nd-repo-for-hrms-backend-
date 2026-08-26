import {
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
  ChevronsUpDown,
  Copy,
  CheckCircle2,
  Facebook,
  Globe,
  FilePlus2,
  SquareArrowOutUpRight,
  FileText,
  GripVertical,
  Heart,
  Instagram,
  LayoutGrid,
  List,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  PencilRuler,
  Plus,
  Search,
  Send,
  Share2,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  X,
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
import { type Department, type Position } from "@/data/hr";
import { requisitionStore, useRequisitions, type Requisition } from "@/data/requisitions";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSort } from "@/components/portal/sortable";
import { cn } from "@/lib/utils";
import hiringTemplate from "@/assets/hiring-template.png.asset.json";
import { coreHcmApi, jobPostsApi, resolveStorageUrl, type ApiJobPost } from "@/lib/api";
import { sanitizeDigitsOnly, sanitizeDecimalString, sanitizeInteger } from "@/lib/validation";

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
    benefits: j.benefits || [],
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
  | "description"
  | "responsibilities"
  | "qualifications"
  | "skills"
  | "benefits"
  | "instructions"
  | "about"
  | "social";

const blockLibrary: { id: BlockId; label: string; hint: string }[] = [
  { id: "title", label: "Job Title", hint: "Headline + department" },
  { id: "info", label: "Job Info", hint: "Type, schedule, vacancies, salary" },
  { id: "description", label: "Job Description", hint: "Short role pitch" },
  { id: "responsibilities", label: "Key Responsibilities", hint: "Bulleted duties" },
  { id: "qualifications", label: "Qualifications", hint: "Bulleted requirements" },
  { id: "skills", label: "Required Skills", hint: "Bulleted skill tags" },
  { id: "benefits", label: "Benefits", hint: "Perks badges" },
  { id: "instructions", label: "Application Instruction", hint: "How to apply" },
  { id: "about", label: "About Company", hint: "Company blurb" },
  { id: "social", label: "Social Media Links", hint: "Facebook / Instagram / website" },
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
  benefits: string;
  instructions: string;
  about: string;
  social: string;
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
  benefits: "",
  instructions: "",
  about: "",
  social: "",
};

const defaultAbout =
  "Oxford Suites Makati is a premier all-suite hotel in the heart of Makati's business district, known for warm Filipino hospitality and dependable service.";
const defaultInstructions =
  "Interested applicants may send their updated resume through this posting or walk-in for an interview at the HR Office, Oxford Suites Makati.";
const defaultSocial = "facebook.com/OxfordSuitesMakati · instagram.com/oxfordsuitesmakati";

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
    benefits: j.benefits.join("\n"),
    instructions: defaultInstructions,
    about: defaultAbout,
    social: defaultSocial,
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
    case "benefits":
      return d.benefits.trim() !== "";
    case "instructions":
      return d.instructions.trim() !== "";
    case "about":
      return d.about.trim() !== "";
    case "social":
      return d.social.trim() !== "";
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
              department: p.department || "General",
              level: (p.level as Position["level"]) || "Rank & File",
              headcount: p.headcount,
              filled: p.filled_count,
              salaryBand: "",
              dbId: p.position_id,
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
      benefits: lines(draft.benefits),
      applicants: existing?.applicants ?? 0,
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
      let positionId = knownPositions.find((p) => p.title === title)?.dbId;
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
        benefits: payload.benefits,
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
      benefits: lines(draft.benefits),
      applicants: editingJobId ? (jobList.find((j) => j.id === editingJobId)?.applicants ?? 0) : 0,
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
    let positionId = knownPositions.find((p) => p.title === draft.title)?.dbId;
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
        benefits: jobPayload.benefits,
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
  const REQ_PER_PAGE = DEFAULT_PAGE_SIZE;
  const reqPageCount = Math.max(1, Math.ceil(filteredRequisitions.length / REQ_PER_PAGE));
  const reqPageSafe = Math.min(reqPage, reqPageCount);
  const visibleRequisitions = filteredRequisitions.slice(
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

  const salaryLine =
    draft.salaryMin || draft.salaryMax
      ? `${peso(Number(draft.salaryMin) || 0)} – ${peso(Number(draft.salaryMax) || 0)} a month`
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

  const posterImageUrl = customPosterUrl ?? hiringTemplate.url;

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
          {peso(Number(draft.salaryMin) || 0)} – {peso(Number(draft.salaryMax) || 0)} per month
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
      {has("benefits") && lines(draft.benefits).length > 0 && (
        <div>
          <p className="font-display text-lg font-semibold">Benefits</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {lines(draft.benefits).map((b) => (
              <span
                key={b}
                className="rounded-md border border-border bg-card px-2.5 py-1 text-[0.65rem] font-medium text-foreground"
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      )}
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
        {lines(draft.benefits).length > 0 && (
          <div>
            <p className="text-xs font-semibold">Benefits</p>
            <ul className="list-inside list-disc text-muted-foreground">
              {lines(draft.benefits).map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        )}
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
      {lines(draft.benefits).length > 0 && (
        <div>
          <p className="font-semibold">What We Offer:</p>
          <ul className="list-inside list-disc text-muted-foreground">
            {lines(draft.benefits).map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
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
          <p className="text-[0.65rem] text-muted-foreground">Just now · 🌐</p>
        </div>
        <MoreHorizontal className="ml-auto h-4 w-4 text-muted-foreground" />
      </div>
      <div className="px-3 pb-3 text-muted-foreground">{facebookCaption}</div>
      <HiringPoster />
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
      <HiringPoster />
      <div className="flex items-center gap-3 p-3">
        <Heart className="h-5 w-5" />
        <MessageCircle className="h-5 w-5" />
        <Send className="h-5 w-5" />
        <Bookmark className="ml-auto h-5 w-5" />
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
    </div>
  );

  return (
    <div>
      <PageHeader
        eyebrow={role === "superadmin" ? "Super Admin · Recruitment" : "Admin · Recruitment"}
        title="Recruitment Management"
        description="Open or close postings per position, then build job posts with live multi-platform previews."
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
            <Send className="mr-1.5 h-4 w-4" /> Requisitions from Core HCM
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
                          {peso(j.salaryMin)} – {peso(j.salaryMax)}
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
                    <CardContent className="p-5">
                      {j.picture && (
                        <img
                          src={j.picture}
                          alt={`${j.title} hiring poster`}
                          className="mb-3 aspect-video w-full rounded-md border border-border object-cover"
                        />
                      )}
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
                        {peso(j.salaryMin)} – {peso(j.salaryMax)}
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

                      <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3">
                        <Button size="sm" variant="outline" onClick={() => editTemplate(j)}>
                          Edit Template
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => copyAndUseTemplate(j)}>
                          <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy & Use Template
                        </Button>
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
                </div>
              </div>
              <ListBody className="mt-4 space-y-2 overflow-x-auto">
                <div
                  className={cn(
                    "hidden min-w-[960px] items-center gap-2 px-3 py-1.5 md:grid",
                    reqGridCols,
                  )}
                >
                  {[
                    "Ref Number",
                    "Department",
                    "Openings",
                    "Requested",
                    "Urgency",
                    "Status",
                    "Set status",
                    "Note",
                    "Job post",
                  ].map((h, i) => (
                    <span
                      key={h || `col-${i}`}
                      className={cn(
                        "text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground",
                        i === 8 && "text-right",
                      )}
                    >
                      {h}
                    </span>
                  ))}
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

                    <div className="mt-4 space-y-1.5 border-t border-border pt-3">
                      <p className="eyebrow font-bold">Content Templates</p>
                      {templates.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => applyTemplate(t.id)}
                          className="w-full rounded-md border border-border px-2 py-1.5 text-left text-[0.68rem] hover:border-primary/40"
                        >
                          {t.name}
                        </button>
                      ))}
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
                                      <Label className="text-[0.7rem]">Job title</Label>
                                      <Select
                                        value={draft.title}
                                        onValueChange={(v) =>
                                          setDraft({
                                            ...draft,
                                            title: v,
                                            department:
                                              knownPositions.find((p) => p.title === v)
                                                ?.department ?? draft.department,
                                          })
                                        }
                                      >
                                        <SelectTrigger className="h-8 text-xs">
                                          <SelectValue placeholder="Select a position from Core HR" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {knownPositions.map((p) => (
                                            <SelectItem key={p.id} value={p.title}>
                                              {p.title}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-[0.7rem]">Department</Label>
                                      <Select
                                        value={draft.department}
                                        onValueChange={(v) => setDraft({ ...draft, department: v })}
                                      >
                                        <SelectTrigger className="h-8 text-xs">
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
                                {id === "benefits" && (
                                  <Textarea
                                    autoFocus
                                    rows={2}
                                    className="text-xs"
                                    value={draft.benefits}
                                    onChange={(e) =>
                                      setDraft({ ...draft, benefits: e.target.value })
                                    }
                                    placeholder="One benefit per line…"
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
                                {id === "social" && (
                                  <div className="space-y-2">
                                    <Textarea
                                      autoFocus
                                      rows={2}
                                      className="text-xs"
                                      value={draft.social}
                                      onChange={(e) =>
                                        setDraft({ ...draft, social: e.target.value })
                                      }
                                      placeholder="Social media links…"
                                    />
                                    <PosterUploadControl />
                                  </div>
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
                  {knownPositions
                    .filter((p) => p.department === pendingDept)
                    .map((p) => (
                      <SelectItem key={p.id} value={p.title}>
                        {p.title}
                      </SelectItem>
                    ))}
                  {knownPositions.filter((p) => p.department === pendingDept).length === 0 && (
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
    </div>
  );
}
