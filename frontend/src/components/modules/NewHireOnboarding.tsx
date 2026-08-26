import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  ClipboardCheck,
  ClipboardList,
  Eye,
  ExternalLink,
  FileCheck2,
  FileText,
  Hourglass,
  Info,
  Loader2,
  Pencil,
  Plus,
  Save,
  Search,
  Send,
  ShieldCheck,
  Trash2,
  Upload,
  UserPlus,
  Users,
  X,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/portal/PageHeader";
import { ListBody } from "@/components/portal/ListBody";
import { ListEmptyState } from "@/components/portal/ListEmptyState";
import { StatCard } from "@/components/portal/StatCard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TablePagination } from "@/components/ui/table-pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { usePagination } from "@/hooks/usePagination";
import { type NewHire } from "@/data/hr";
import { myProfile } from "@/data/ess";
import {
  DEFAULT_ACCOUNT_PASSWORD,
  hireStore,
  useHires,
  useMasterChecklists,
  usePendingHire,
} from "@/data/hires";
import { cn } from "@/lib/utils";
import { SortHead, useSort } from "@/components/portal/sortable";
import {
  applicantsApi,
  checklistRequestsApi,
  coreHcmApi,
  newHiresApi,
  onboardingItemsApi,
  resolveStorageUrl,
  settingsApi,
  type ApiChecklistRequest,
  type ApiNewHire,
} from "@/lib/api";
import { getUser } from "@/lib/auth";
import {
  isValidEmail,
  isValidName,
  isValidPhone,
  sanitizeName,
  sanitizePhone,
} from "@/lib/validation";

/** Today's date in yyyy-mm-dd, used as the default start date for new hires. */
const todayIso = new Date().toISOString().slice(0, 10);

/** Onboarding only tracks these two stages — regularization is handled in Employee Records. */
type Stage = "Pre-onboarding" | "Probationary";

const stages: Stage[] = ["Pre-onboarding", "Probationary"];

const stageBlurb: Record<Stage, string> = {
  "Pre-onboarding": "Requirements submission, contract signing, orientation scheduling.",
  Probationary: "Active probation period with department training and monthly evaluation.",
};

const defaultChecklist = [
  "Signed employment contract",
  "NBI / Police clearance",
  "Pre-employment medical exam",
  "SSS / PhilHealth / Pag-IBIG / TIN",
  "Birth certificate (PSA)",
  "Company orientation attended",
  "Uniform & ID issued",
  "Department on-the-job training",
];

type RequestedChecklistItem = {
  id: string;
  item: string;
  position: string;
  requestedBy: string;
  requestedAt: string;
};

function transformApiRequest(r: ApiChecklistRequest): RequestedChecklistItem {
  return {
    id: r.request_code || `CR-${r.checklist_request_id}`,
    item: r.items_json?.[0] ?? r.template_title ?? "Checklist requirement",
    position: r.template_title ?? "All positions",
    requestedBy: "Performance",
    requestedAt: r.requested_at ? r.requested_at.slice(0, 10) : todayIso,
  };
}

const freshChecklist = (stage: Stage, probationaryItems: string[]) =>
  (stage === "Pre-onboarding" ? defaultChecklist : probationaryItems).map((item) => ({
    item,
    done: false,
    phase: stage === "Pre-onboarding" ? ("Pre-onboarding" as const) : ("Probationary" as const),
  }));

const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 3)
    .join("")
    .toUpperCase();

/** What an employee submitted for one onboarding checklist item
 *  (document upload + notes), read from employee_onboarding_items. */
type EmployeeSubmission = {
  itemText: string;
  done: boolean;
  submittedAt?: string;
  fileName?: string;
  fileUrl?: string;
  notes?: string;
  completedAt?: string;
};

/** Checklist items from the mock store and the API share the same text. */
const normalizeChecklistKey = (text: string) => text.trim().toLowerCase();

/** Renders the employee's submission (uploaded document + note) for admins. */
function EmployeeSubmissionDetails({ submission }: { submission: EmployeeSubmission }) {
  return (
    <div className="mb-1 mt-1 space-y-1 rounded-md border border-border/60 bg-muted/20 px-3 py-2">
      <p
        className={cn(
          "flex items-center gap-1.5 text-xs font-medium",
          submission.done ? "text-success" : "text-caution-foreground",
        )}
      >
        {submission.done ? (
          <>
            <ShieldCheck className="h-3.5 w-3.5" /> Verified by HR
            {submission.completedAt &&
              ` · ${new Date(submission.completedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}`}
          </>
        ) : (
          <>
            <Hourglass className="h-3.5 w-3.5" /> Awaiting HR verification
          </>
        )}
      </p>
      {submission.submittedAt && !submission.done && (
        <p className="text-[11px] text-muted-foreground">
          Submitted{" "}
          {new Date(submission.submittedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}{" "}
          by the employee — tick the checklist item during Edit Checklist to verify and count it
          toward progress.
        </p>
      )}
      {submission.fileName && (
        <div className="flex items-center justify-between gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/5 px-2 py-1.5">
          <span className="flex min-w-0 items-center gap-1.5 text-xs text-foreground">
            <FileCheck2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
            <span className="truncate" title={submission.fileName}>
              {submission.fileName}
            </span>
          </span>
          {submission.fileUrl && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 shrink-0 cursor-pointer px-2 text-[11px]"
              onClick={() => window.open(submission.fileUrl, "_blank")}
            >
              <ExternalLink className="mr-1 h-3 w-3" /> View
            </Button>
          )}
        </div>
      )}
      {submission.notes && (
        <p className="rounded-md bg-card px-2 py-1.5 text-[11px] leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">Employee note: </span>
          {submission.notes}
        </p>
      )}
    </div>
  );
}

/** One admin/superadmin checklist row — a single bordered pill that contains
 *  the toggle, the "Submitted · pending review" badge and the collapsible
 *  "View employee submission" trigger. Pending items render in red; verified
 *  items get a green background with default text color. */
function AdminChecklistRow({
  done,
  submitted,
  label,
  disabled,
  onClick,
  submission,
}: {
  done: boolean;
  submitted: boolean;
  label: string;
  disabled: boolean;
  onClick: () => void;
  submission?: EmployeeSubmission;
}) {
  const hasSubmission = Boolean(
    submission && (submission.submittedAt || submission.fileName || submission.notes),
  );

  return (
    <Collapsible className="group w-full">
      <div
        className={cn(
          "flex w-full items-center gap-2.5 rounded-md border px-3 py-2 text-left text-sm transition-colors",
          done
            ? "border-success/30 bg-success/10"
            : "border-border bg-card hover:border-primary/40",
        )}
      >
        <button
          type="button"
          disabled={disabled}
          onClick={onClick}
          aria-label={label}
          className={cn(
            "flex min-w-0 flex-1 items-center gap-2.5 bg-transparent text-left",
            disabled ? "cursor-not-allowed opacity-80" : "cursor-pointer",
          )}
        >
          {done ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
          ) : submitted ? (
            <Hourglass className="h-4 w-4 shrink-0 text-destructive" />
          ) : (
            <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
          <span
            className={cn("min-w-0", !done && submitted ? "text-destructive" : "text-foreground")}
          >
            {label}
          </span>
        </button>
        {!done && submitted && (
          <Badge
            variant="outline"
            className="shrink-0 border-destructive/40 bg-destructive/10 text-[10px] text-destructive"
          >
            Submitted · pending review
          </Badge>
        )}
        {hasSubmission && (
          <CollapsibleTrigger
            title="View employee submission"
            className="flex shrink-0 cursor-pointer items-center gap-1 rounded px-1.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            View employee submission
            <ChevronDown className="h-3 w-3 transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
        )}
      </div>
      {hasSubmission && submission && (
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          <div className="pb-1 pt-1">
            <EmployeeSubmissionDetails submission={submission} />
          </div>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}

export function NewHireOnboarding({ role }: { role: "superadmin" | "admin" | "employee" }) {
  if (role === "employee") {
    return <EmployeeOnboarding />;
  }
  return <AdminNewHireOnboarding role={role} />;
}

function AdminNewHireOnboarding({ role }: { role: "superadmin" | "admin" }) {
  const isSuperAdmin = role === "superadmin";
  const hires = useHires();
  const setHires = (updater: (prev: NewHire[]) => NewHire[]) => hireStore.setHires(updater);
  const pending = usePendingHire();
  const masterChecklists = useMasterChecklists();
  const [stage, setStage] = useState<Stage>("Pre-onboarding");
  const [showAllStages, setShowAllStages] = useState(false);
  /** Metric-card view: only hires whose performance evaluation was requested. */
  const [awaitingOnly, setAwaitingOnly] = useState(false);
  /** Hire ids whose evaluation has been requested (waiting on results). */
  const [evaluationRequested, setEvaluationRequested] = useState<string[]>([]);
  /** When each hire's evaluation was requested — drives auto-regularization. */
  const [evaluationRequestedAt, setEvaluationRequestedAt] = useState<Record<string, number>>({});
  /** Hire ids whose checklist edit was explicitly saved — gates advancing. */
  const [checklistSaved, setChecklistSaved] = useState<string[]>([]);
  /** How long to wait on a 100%-complete + evaluation-requested hire before auto-regularizing. */
  const [autoRegMonths, setAutoRegMonths] = useState(0);
  const [autoRegDays, setAutoRegDays] = useState(14);
  const [autoRegOpen, setAutoRegOpen] = useState(false);
  const [autoRegDraft, setAutoRegDraft] = useState({ months: 0, days: 14 });
  const autoRegularizeDays = autoRegMonths * 30 + autoRegDays;
  /** Reference-only checklist items requested by Performance, scoped to a position. */
  const [requestedItems, setRequestedItems] = useState<RequestedChecklistItem[]>([]);

  /** Default password for new portal accounts, read from the database
   *  (system_settings.default_password); falls back to the shipped default. */
  const [defaultPassword, setDefaultPassword] = useState(DEFAULT_ACCOUNT_PASSWORD);

  /** Departments & positions from the Core HCM database. */
  const [knownDepartments, setKnownDepartments] = useState<
    { dbId: number; code: string; name: string }[]
  >([]);
  const [knownPositions, setKnownPositions] = useState<
    { dbId: number; id: string; title: string; department: string }[]
  >([]);
  /** Hired/accepted applicants from the live database, for the add-hire form. */
  const [candidateApplicants, setCandidateApplicants] = useState<
    { id: string; name: string; position: string; email: string; phone: string }[]
  >([]);

  useEffect(() => {
    checklistRequestsApi
      .list({ per_page: 100 })
      .then((res) => {
        setRequestedItems((res?.data ?? []).map(transformApiRequest));
      })
      .catch((err) => console.warn("Could not fetch checklist requests from API:", err));
    settingsApi
      .get("default_password")
      .then((res) => {
        const pw = res?.setting_value?.password;
        if (pw) setDefaultPassword(pw);
      })
      .catch((err) => console.warn("Could not fetch default password from database:", err));
    coreHcmApi
      .departments({ per_page: 100 })
      .then((res) => {
        if (res?.data) {
          setKnownDepartments(
            res.data.map((d) => ({
              dbId: d.department_id,
              code: d.code,
              name: d.name,
            })),
          );
        }
      })
      .catch((err) => console.warn("Could not fetch departments from API:", err));
    coreHcmApi
      .positions({ per_page: 100 })
      .then((res) => {
        if (res?.data) {
          setKnownPositions(
            res.data.map((p) => ({
              dbId: p.position_id,
              id: p.position_code || String(p.position_id),
              title: p.title,
              department: p.department || "General",
            })),
          );
        }
      })
      .catch((err) => console.warn("Could not fetch positions from API:", err));
    applicantsApi
      .list({ per_page: 100 })
      .then((res) => {
        if (res?.data) {
          const hired = res.data
            .filter((a) => a.stage === "Accepted" || a.stage === "Hired")
            .map((a) => ({
              id: String(a.applicant_id),
              name: a.name,
              position: a.job_post?.title || "Staff",
              email: a.email || "",
              phone: a.phone || "",
            }));
          setCandidateApplicants(hired);
        }
      })
      .catch((err) => console.warn("Could not fetch applicants from API:", err));
  }, []);

  const [reqItemDraft, setReqItemDraft] = useState("");
  const [reqPositionDraft, setReqPositionDraft] = useState("all");
  const [editingReqId, setEditingReqId] = useState<string | null>(null);
  const [editReqItem, setEditReqItem] = useState("");
  const [editReqPosition, setEditReqPosition] = useState("all");
  /** New master checklist builder form. */
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const [newChecklistPhase, setNewChecklistPhase] = useState<"Pre-onboarding" | "Probationary">(
    "Probationary",
  );
  const [newChecklistAllPositions, setNewChecklistAllPositions] = useState(true);
  const [newChecklistPositions, setNewChecklistPositions] = useState<string[]>([]);
  const [newItem, setNewItem] = useState("");
  const [newItemInstructions, setNewItemInstructions] = useState("");
  const [newItemRequiresUpload, setNewItemRequiresUpload] = useState(true);
  const [newItemUploadPlaceholder, setNewItemUploadPlaceholder] = useState("");
  const [showItemDetails, setShowItemDetails] = useState(false);
  const [tab, setTab] = useState("pipeline");
  const [draftItems, setDraftItems] = useState<
    {
      item_text: string;
      instructions?: string;
      requires_upload?: boolean;
      upload_placeholder?: string;
    }[]
  >([]);
  /** Collapsible create-checklist form in the Checklist Builder. */
  const [showCreateChecklist, setShowCreateChecklist] = useState(false);
  /** Master checklist currently being edited inline (title + items + stage + positions). */
  const [editingChecklistId, setEditingChecklistId] = useState<string | null>(null);
  const [editChecklistTitle, setEditChecklistTitle] = useState("");
  const [editChecklistItems, setEditChecklistItems] = useState<string[]>([]);
  const [editChecklistRichItems, setEditChecklistRichItems] = useState<
    {
      item_text: string;
      instructions?: string;
      requires_upload?: boolean;
      upload_placeholder?: string;
    }[]
  >([]);
  const [editChecklistNewItem, setEditChecklistNewItem] = useState("");
  const [editItemInstructions, setEditItemInstructions] = useState("");
  const [editItemRequiresUpload, setEditItemRequiresUpload] = useState(true);
  const [editItemUploadPlaceholder, setEditItemUploadPlaceholder] = useState("");
  const [showEditItemDetails, setShowEditItemDetails] = useState(false);
  const [editChecklistPhase, setEditChecklistPhase] = useState<"Pre-onboarding" | "Probationary">(
    "Probationary",
  );
  const [editChecklistAllPositions, setEditChecklistAllPositions] = useState(true);
  const [editChecklistPositions, setEditChecklistPositions] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [editSnapshot, setEditSnapshot] = useState<{ item: string; done: boolean }[] | null>(null);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [form, setForm] = useState({
    name: "",
    position: "",
    department: "",
    startDate: todayIso,
    email: "",
    phone: "",
  });
  /** True when the modal was opened from an accepted applicant — name is fixed. */
  const [nameLocked, setNameLocked] = useState(false);
  /** Set when the modal is completing details for an existing hire entering probation. */
  const [completingId, setCompletingId] = useState<string | null>(null);

  /** Opens a clean Add New Hire modal: nothing pre-set except today's start date. */
  const openAddHire = () => {
    setForm({
      name: "",
      position: "",
      department: "",
      startDate: todayIso,
      email: "",
      phone: "",
    });
    setNameLocked(false);
    setCompletingId(null);
    setAddOpen(true);
  };

  /**
   * An accepted applicant is filed straight into Pre-onboarding — no modal.
   * The Add New Hire modal only appears later, when the hire is advanced to Probationary.
   */
  useEffect(() => {
    if (!pending) return;
    const intake = hireStore.consumePending();
    if (!intake) return;
    if (hireStore.exists(intake.name, intake.position)) return;
    const id = `NH-${String(hireStore.getHires().length + 1).padStart(2, "0")}`;
    hireStore.add(
      {
        id,
        name: intake.name,
        position: intake.position,
        department: intake.department,
        stage: "Pre-onboarding",
        startDate: todayIso,
        initials: initialsOf(intake.name),
        email: intake.email,
        phone: intake.phone,
        checklist: defaultChecklist.map((item) => ({
          item,
          done: false,
          phase: "Pre-onboarding",
        })),
      },
      intake.applicantId,
    );
    setSelectedId(id);
    setStage("Pre-onboarding");
    setShowAllStages(false);
    toast.success(`${intake.name} filed under Pre-onboarding`);
  }, [pending]);

  const selected = hires.find((h) => h.id === selectedId) ?? null;

  /** Employee submissions (uploads / notes / completion dates) per hire id,
   *  fetched live from employee_onboarding_items via the backend API so
   *  admins see exactly what each new hire submitted per checklist item. */
  const [submissionsByHire, setSubmissionsByHire] = useState<Record<string, EmployeeSubmission[]>>(
    {},
  );

  useEffect(() => {
    const dbId = selected?.dbId;
    if (!selected || !dbId) return;
    let cancelled = false;
    onboardingItemsApi
      .listForNewHire(dbId)
      .then((items) => {
        if (cancelled) return;
        setSubmissionsByHire((prev) => ({
          ...prev,
          [selected.id]: items.map((i) => ({
            itemText: i.item_text,
            done: Boolean(i.done),
            submittedAt: i.submitted_at ?? undefined,
            fileName: i.file_name ?? undefined,
            fileUrl:
              i.employee_onboarding_item_id != null
                ? onboardingItemsApi.documentUrl(i.employee_onboarding_item_id)
                : (i.file_url ?? (i.file_path ? resolveStorageUrl(i.file_path) : undefined)),
            notes: i.notes ?? undefined,
            completedAt: i.completed_at ?? undefined,
          })),
        }));
      })
      .catch((err) => console.warn("Could not load employee submissions:", err));
    return () => {
      cancelled = true;
    };
  }, [selected]);

  /** Quick lookup: normalized checklist item text → employee submission. */
  const selectedSubmissions = useMemo(() => {
    if (!selected) return {} as Record<string, EmployeeSubmission>;
    const list = submissionsByHire[selected.id] ?? [];
    return Object.fromEntries(list.map((s) => [normalizeChecklistKey(s.itemText), s])) as Record<
      string,
      EmployeeSubmission
    >;
  }, [selected, submissionsByHire]);

  const toggleItem = (hireId: string, item: string) => {
    if (editingId !== hireId) return;
    const target = hires.find((h) => h.id === hireId);
    const index = target?.checklist.findIndex((c) => c.item === item) ?? -1;
    const checklistItem = target?.checklist[index];
    if (!target || !checklistItem) return;
    const next = !checklistItem.done;
    // Optimistic local update + persistence to the DB API (real-time sync).
    hireStore.toggleItem(hireId, index, next);
  };

  const startEditChecklist = (hire: NewHire) => {
    setEditingId(hire.id);
    setEditSnapshot(hire.checklist.map((c) => ({ ...c })));
    setSelectedId(hire.id);
  };

  const cancelEditChecklist = () => {
    if (editingId && editSnapshot) {
      setHires((prev) =>
        prev.map((h) => (h.id === editingId ? { ...h, checklist: editSnapshot } : h)),
      );
    }
    setEditingId(null);
    setEditSnapshot(null);
  };

  const saveEditChecklist = () => {
    if (editingId)
      setChecklistSaved((prev) => (prev.includes(editingId) ? prev : [...prev, editingId]));
    setEditingId(null);
    setEditSnapshot(null);
    toast.success("Checklist saved");
  };

  /** Closing the checklist card also drops out of edit mode (reverting changes). */
  const closeChecklistPanel = () => {
    cancelEditChecklist();
    setSelectedId(null);
  };

  /** Pre-onboarding hires advance into Probationary through the Add New Hire modal. */
  const advance = (hire: NewHire) => {
    if (hire.stage !== "Pre-onboarding") return;
    setEditingId(null);
    setEditSnapshot(null);
    setForm({
      name: hire.name,
      position: hire.position,
      department: hire.department,
      startDate: hire.startDate,
      email: hire.email ?? "",
      phone: hire.phone ?? "",
    });
    setNameLocked(true);
    setCompletingId(hire.id);
    setSelectedId(hire.id);
    setAddOpen(true);
  };

  const addDraftItem = () => {
    const item = newItem.trim();
    if (!item) return;
    setDraftItems((prev) => [
      ...prev,
      {
        item_text: item,
        requires_upload: newItemRequiresUpload,
        ...(newItemInstructions.trim() ? { instructions: newItemInstructions.trim() } : {}),
        ...(newItemUploadPlaceholder.trim()
          ? { upload_placeholder: newItemUploadPlaceholder.trim() }
          : {}),
      },
    ]);
    setNewItem("");
    setNewItemInstructions("");
    setNewItemRequiresUpload(true);
    setNewItemUploadPlaceholder("");
    setShowItemDetails(false);
  };

  /** Requested checklist items — reference rows managed by HR. */
  const addRequestedItem = () => {
    const item = reqItemDraft.trim();
    if (!item) {
      toast.error("Enter a checklist item");
      return;
    }
    setRequestedItems((prev) => [
      {
        id: `RQ-${Date.now()}`,
        item,
        position: reqPositionDraft,
        requestedBy: "Performance",
        requestedAt: todayIso,
      },
      ...prev,
    ]);
    setReqItemDraft("");
    setReqPositionDraft("all");
    toast.success("Requested checklist item added");

    try {
      checklistRequestsApi.create({
        employee_id: 1,
        phase: "Probationary",
        items_json: [item],
        requested_at: todayIso,
      });
    } catch (e) {
      console.warn("Could not persist checklist request to database API:", e);
    }
  };

  const startEditRequestedItem = (r: RequestedChecklistItem) => {
    setEditingReqId(r.id);
    setEditReqItem(r.item);
    setEditReqPosition(r.position);
  };

  const saveRequestedItem = () => {
    if (!editingReqId) return;
    const item = editReqItem.trim();
    if (!item) {
      toast.error("Enter a checklist item");
      return;
    }
    setRequestedItems((prev) =>
      prev.map((r) => (r.id === editingReqId ? { ...r, item, position: editReqPosition } : r)),
    );
    setEditingReqId(null);
    toast.success("Requested checklist item updated");
  };

  const deleteRequestedItem = (id: string) => {
    setRequestedItems((prev) => prev.filter((r) => r.id !== id));
    if (editingReqId === id) setEditingReqId(null);
    toast.success("Requested checklist item removed");
  };

  /** Builds a new master probationary checklist — it applies to every employee. */
  const createMasterChecklist = () => {
    const title = newChecklistTitle.trim();
    if (!title) {
      toast.error("Give the checklist a title");
      return;
    }
    if (draftItems.length === 0) {
      toast.error("Add at least one checklist item");
      return;
    }
    if (!newChecklistAllPositions && newChecklistPositions.length === 0) {
      toast.error("Select at least one position");
      return;
    }
    hireStore.addMasterChecklist(
      title,
      draftItems.map((d) => d.item_text),
      {
        phase: newChecklistPhase,
        positions: newChecklistAllPositions ? "all" : newChecklistPositions,
        status: "Active",
        richItems: draftItems,
      },
    );
    setNewChecklistTitle("");
    setDraftItems([]);
    setNewChecklistPositions([]);
    setNewChecklistAllPositions(true);
    setShowCreateChecklist(false);
    toast.success(`"${title}" added to the ${newChecklistPhase} checklists`);
  };

  const startEditMasterChecklist = (id: string) => {
    const c = masterChecklists.find((m) => m.id === id);
    if (!c) return;
    setEditingChecklistId(id);
    setEditChecklistTitle(c.title);
    setEditChecklistItems([...c.items]);
    const rich =
      c.richItems && c.richItems.length > 0
        ? c.richItems.map((r) => ({ ...r }))
        : c.items.map((text) => ({ item_text: text, requires_upload: true }));
    setEditChecklistRichItems(rich);
    setEditChecklistNewItem("");
    setEditItemInstructions("");
    setEditItemRequiresUpload(true);
    setEditItemUploadPlaceholder("");
    setShowEditItemDetails(false);
    setEditChecklistPhase(c.phase ?? "Probationary");
    const all = c.positions === "all" || !c.positions;
    setEditChecklistAllPositions(all);
    setEditChecklistPositions(all ? [] : [...(c.positions as string[])]);
  };

  const cancelEditMasterChecklist = () => {
    setEditingChecklistId(null);
    setEditChecklistTitle("");
    setEditChecklistItems([]);
    setEditChecklistRichItems([]);
    setEditChecklistNewItem("");
    setEditItemInstructions("");
    setEditItemRequiresUpload(true);
    setEditItemUploadPlaceholder("");
    setShowEditItemDetails(false);
    setEditChecklistPhase("Probationary");
    setEditChecklistAllPositions(true);
    setEditChecklistPositions([]);
  };

  const saveEditMasterChecklist = () => {
    if (!editingChecklistId) return;
    if (!editChecklistTitle.trim() || editChecklistRichItems.length === 0) {
      toast.error("A checklist needs a title and at least one item");
      return;
    }
    if (!editChecklistAllPositions && editChecklistPositions.length === 0) {
      toast.error("Select at least one position");
      return;
    }
    hireStore.updateMasterChecklist(editingChecklistId, {
      title: editChecklistTitle.trim(),
      items: editChecklistRichItems.map((r) => r.item_text),
      richItems: editChecklistRichItems,
      phase: editChecklistPhase,
      positions: editChecklistAllPositions ? "all" : editChecklistPositions,
    });
    toast.success("Master checklist configuration updated");
    cancelEditMasterChecklist();
  };

  const deleteMasterChecklist = (id: string) => {
    hireStore.deleteMasterChecklist(id);
    if (editingChecklistId === id) cancelEditMasterChecklist();
    toast.success("Checklist deleted");
  };

  /** Hands a probationary hire over for performance evaluation. */
  const requestEvaluation = (hire: NewHire) => {
    setEvaluationRequested((prev) => (prev.includes(hire.id) ? prev : [...prev, hire.id]));
    setEvaluationRequestedAt((prev) => ({ ...prev, [hire.id]: Date.now() }));
    toast.success(`Evaluation requested for ${hire.name}`);
  };

  /** Restores the checklist card / list row to its normal state. */
  const cancelEvaluationRequest = (hire: NewHire) => {
    setEvaluationRequested((prev) => prev.filter((id) => id !== hire.id));
    setEvaluationRequestedAt((prev) => {
      const next = { ...prev };
      delete next[hire.id];
      return next;
    });
  };

  const progress = (h: NewHire) => {
    // Probationary progress reflects only the Probationary phase items
    // (falls back to the whole checklist when items are not phase-tagged).
    const phaseItems = h.checklist.filter((c) => (c.phase ?? "Probationary") === "Probationary");
    const pool = h.stage === "Probationary" && phaseItems.length > 0 ? phaseItems : h.checklist;
    return Math.round((pool.filter((c) => c.done).length / pool.length) * 100);
  };

  /**
   * Evaluation cycles can drag on — if a hire's checklist is fully complete
   * and evaluation was requested more than `autoRegularizeDays` ago, they are
   * regularized automatically instead of being stuck waiting.
   */
  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const dueIds = hires
        .filter(
          (h) =>
            h.stage === "Probationary" &&
            evaluationRequested.includes(h.id) &&
            progress(h) === 100 &&
            evaluationRequestedAt[h.id] !== undefined &&
            now - evaluationRequestedAt[h.id]! >= autoRegularizeDays * 24 * 60 * 60 * 1000,
        )
        .map((h) => h.id);
      if (dueIds.length === 0) return;
      setHires((prev) => prev.map((h) => (dueIds.includes(h.id) ? { ...h, stage: "Regular" } : h)));
      setEvaluationRequested((prev) => prev.filter((id) => !dueIds.includes(id)));
      setEvaluationRequestedAt((prev) => {
        const next = { ...prev };
        dueIds.forEach((id) => delete next[id]);
        return next;
      });
      dueIds.forEach((id) => {
        const h = hires.find((x) => x.id === id);
        if (h) toast.success(`${h.name} auto-regularized and handed to Core HCM`);
      });
    };
    const interval = setInterval(tick, 2000);
    tick();
    return () => clearInterval(interval);
  }, [hires, evaluationRequested, evaluationRequestedAt, autoRegularizeDays]);

  /** Onboarding tracks pre-onboarding and probationary hires only. */
  const onboardingHires = hires.filter((h) => h.stage !== "Regular");
  const awaitingHires = onboardingHires.filter((h) => evaluationRequested.includes(h.id));
  const stageFiltered = awaitingOnly
    ? awaitingHires
    : showAllStages
      ? onboardingHires
      : onboardingHires.filter((h) => h.stage === stage);
  const filtered = stageFiltered.filter((h) => {
    const matchesDept = deptFilter === "all" || h.department === deptFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      h.name.toLowerCase().includes(q) ||
      h.position.toLowerCase().includes(q) ||
      h.department.toLowerCase().includes(q);
    return matchesDept && matchesSearch;
  });
  const {
    sort,
    toggle: onSort,
    sorted: visible,
  } = useSort<NewHire, "name" | "position" | "startDate" | "requirements" | "stage">(filtered, {
    name: (h) => h.name,
    position: (h) => h.position,
    startDate: (h) => h.startDate,
    requirements: (h) => progress(h),
    stage: (h) => h.stage,
  });

  const hirePage = usePagination(visible);
  const reqPage = usePagination(requestedItems, 6);
  const checklistPage = usePagination(masterChecklists, 3);

  const selectStage = (s: Stage) => {
    setStage(s);
    setShowAllStages(false);
    setAwaitingOnly(false);
    const firstInStage = hires.find((h) => h.stage === s);
    setSelectedId(firstInStage?.id ?? null);
  };

  const resetHireForm = () => {
    setAddOpen(false);
    setNameLocked(false);
    setCompletingId(null);
    setForm({
      name: "",
      position: "",
      department: "",
      startDate: todayIso,
      email: "",
      phone: "",
    });
  };

  const addHire = async () => {
    if (!form.name || !form.position || !form.department || !form.startDate || !form.email) {
      toast.error("Name, position, department, email and start date are required.");
      return;
    }

    if (!isValidEmail(form.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (form.phone && !isValidPhone(form.phone)) {
      toast.error("Please enter a valid phone number (e.g. 09171234567 or +639171234567).");
      return;
    }

    // Resolve the selected position title / department name to their Core HCM ids
    const positionId = knownPositions.find((p) => p.title === form.position)?.dbId ?? null;
    const departmentId = knownDepartments.find((d) => d.name === form.department)?.dbId ?? null;

    // Completing an existing hire's record as they enter probation:
    // saving here is what promotes them and creates their portal account.
    if (completingId) {
      const id = completingId;
      const probationaryItems = hireStore.combinedProbationaryItems(form.position);
      setHires((prev) =>
        prev.map((h) => {
          if (h.id !== id) return h;
          // Pre-onboarding tasks stay on the checklist (tagged so they show
          // in their own collapsed section) while the probationary phase
          // items are freshly applied from the active templates.
          const preItems = h.checklist
            .filter((c) => (c.phase ?? "Pre-onboarding") === "Pre-onboarding")
            .map((c) => ({ ...c, phase: "Pre-onboarding" as const }));
          return {
            ...h,
            stage: "Probationary",
            checklist: [...preItems, ...freshChecklist("Probationary", probationaryItems)],
            position: form.position,
            department: form.department,
            positionId,
            departmentId,
            startDate: form.startDate,
            email: form.email,
            phone: form.phone,
          };
        }),
      );
      setStage("Probationary");
      setShowAllStages(false);
      setSelectedId(id);
      const name = form.name;
      const targetEmail = form.email;
      resetHireForm();
      toast.success(
        `${name} moved to Probationary — portal account created & login credentials sent to ${targetEmail} (default password: ${defaultPassword})`,
      );
      hireStore.updateHire(id, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        position: form.position,
        department: form.department,
        startDate: form.startDate,
      });
      hireStore.promoteHire(id);
      return;
    }

    const id = `NH-${String(hires.length + 1).padStart(2, "0")}`;
    const targetEmail = form.email;
    const saved = await hireStore.add({
      id,
      name: form.name,
      position: form.position,
      department: form.department,
      positionId,
      departmentId,
      stage: "Pre-onboarding",
      startDate: form.startDate,
      initials: initialsOf(form.name),
      email: form.email,
      phone: form.phone,
      checklist: defaultChecklist.map((item) => ({
        item,
        done: false,
        phase: "Pre-onboarding",
      })),
    });

    setSelectedId(id);
    setStage("Pre-onboarding");
    setShowAllStages(false);
    const name = form.name;
    resetHireForm();
    if (saved) {
      toast.success(
        `${name} added — portal account created and login credentials (email & default password) sent to ${targetEmail}`,
      );
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow={role === "superadmin" ? "Super Admin · Recruitment" : "Admin · Recruitment"}
        title="New Hire Onboarding"
        description="Track hires from pre-onboarding through probation to regularization."
      />

      <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total New Hires"
          value={onboardingHires.length}
          icon={Users}
          tone="primary"
          onClick={() => {
            setShowAllStages(true);
            setAwaitingOnly(false);
          }}
        />
        <StatCard
          label="Pre-onboarding"
          value={onboardingHires.filter((h) => h.stage === "Pre-onboarding").length}
          icon={ClipboardList}
          onClick={() => selectStage("Pre-onboarding")}
        />
        <StatCard
          label="Probationary"
          value={onboardingHires.filter((h) => h.stage === "Probationary").length}
          icon={ClipboardCheck}
          tone="gold"
          onClick={() => selectStage("Probationary")}
        />
        <StatCard
          label="Awaiting Evaluation"
          value={awaitingHires.length}
          icon={Hourglass}
          tone="success"
          onClick={() => {
            setAwaitingOnly(true);
            setShowAllStages(false);
          }}
        />
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mt-6">
        <TabsList className="flex h-auto flex-wrap justify-start">
          <TabsTrigger className="flex items-center gap-1.5" value="pipeline">
            <ClipboardList className="h-3.5 w-3.5" /> Onboarding Pipeline
          </TabsTrigger>
          <TabsTrigger className="flex items-center gap-1.5" value="checklists">
            <Send className="h-3.5 w-3.5" /> Requested Checklists
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="mt-4 space-y-6">
          {/* HORIZONTAL TRACKER */}
          <Card className="border-border/70">
            <CardContent className="p-6">
              <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
                <ClipboardList className="h-5 w-5 text-primary" /> Onboarding Status Tracker
              </h2>
              <p className="text-xs text-muted-foreground">
                Applicant and candidate stages are handled in Applicant Management — onboarding
                starts once a candidate is hired.
              </p>

              <div className="relative mt-8 px-2">
                {/* Decorative rails — not interactive */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute left-[8%] right-[8%] top-4 h-0.5 cursor-default bg-border"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute left-[8%] top-4 h-0.5 cursor-default bg-primary transition-all"
                  style={{ width: `${((stages.indexOf(stage) + 1) / stages.length) * 84}%` }}
                />

                <div className="relative grid grid-cols-2">
                  {stages.map((s, i) => {
                    const active = stages.indexOf(stage) >= i;
                    const current = stage === s && !showAllStages && !awaitingOnly;
                    return (
                      <div key={s} className="flex flex-col items-center text-center">
                        {/* Only the numbered circle is clickable */}
                        <button
                          type="button"
                          onClick={() => selectStage(s)}
                          aria-label={`Show ${s} hires`}
                          aria-current={current ? "step" : undefined}
                          className={cn(
                            "group flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 text-xs font-medium transition-all",
                            "hover:scale-105 hover:ring-4 hover:ring-primary/30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40",
                            active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card text-muted-foreground hover:border-primary/60 hover:text-primary",
                            current && "ring-4 ring-primary/20",
                          )}
                        >
                          {i + 1}
                        </button>
                        <span
                          className={cn(
                            "mt-2 text-sm font-medium",
                            current ? "text-primary" : "text-muted-foreground",
                          )}
                        >
                          {s}
                        </span>
                        <span className="mt-1 max-w-[220px] text-[0.7rem] text-muted-foreground">
                          {stageBlurb[s]}
                        </span>
                        <Badge variant="secondary" className="mt-2">
                          {onboardingHires.filter((h) => h.stage === s).length} hires
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 grid gap-6 2xl:grid-cols-[1.6fr_1fr]">
            <Card className="min-w-0 border-border/70">
              <CardContent className="min-w-0 p-6">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
                        <Users className="h-5 w-5 text-primary" />
                        {awaitingOnly
                          ? "Awaiting Evaluation"
                          : showAllStages
                            ? "All Hired Applicants"
                            : `${stage} List`}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Click a hire to open their requirements checklist on the right.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search name, position..."
                        className="w-56 pl-8"
                      />
                    </div>
                    <Select value={deptFilter} onValueChange={setDeptFilter}>
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
                      value={awaitingOnly ? "awaiting" : showAllStages ? "all" : stage}
                      onValueChange={(v) => {
                        if (v === "all") {
                          setShowAllStages(true);
                          setAwaitingOnly(false);
                        } else if (v === "awaiting") {
                          setAwaitingOnly(true);
                          setShowAllStages(false);
                        } else selectStage(v as Stage);
                      }}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All hired applicants</SelectItem>
                        {stages.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                        <SelectItem value="awaiting">Awaiting evaluation</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="icon"
                      variant="outline"
                      aria-label="Auto-regularization settings"
                      title="Auto-regularization settings"
                      className="h-9 w-9 shrink-0 cursor-pointer border-border bg-card text-foreground hover:bg-muted"
                      onClick={() => {
                        setAutoRegDraft({ months: autoRegMonths, days: autoRegDays });
                        setAutoRegOpen(true);
                      }}
                    >
                      <ShieldCheck className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={openAddHire}>
                      <UserPlus className="mr-2 h-4 w-4" /> Add new hire
                    </Button>
                  </div>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <ListBody>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <SortHead sortKey="name" sort={sort} onSort={onSort}>
                            New Hire
                          </SortHead>
                          <SortHead sortKey="position" sort={sort} onSort={onSort}>
                            Position
                          </SortHead>
                          <SortHead sortKey="startDate" sort={sort} onSort={onSort}>
                            Start Date
                          </SortHead>
                          <SortHead sortKey="requirements" sort={sort} onSort={onSort}>
                            Requirements
                          </SortHead>
                          <SortHead sortKey="stage" sort={sort} onSort={onSort}>
                            Stage
                          </SortHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {hirePage.pageItems.map((h) => {
                          const pct = progress(h);
                          const complete = pct === 100;
                          const awaiting = evaluationRequested.includes(h.id);
                          return (
                            <TableRow
                              key={h.id}
                              className={cn(
                                selectedId === h.id && "bg-primary/5",
                                complete && !awaiting && "bg-success/5",
                                awaiting && "bg-gold/5",
                              )}
                            >
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-9 w-9">
                                    <AvatarFallback
                                      className={cn(
                                        "text-xs",
                                        awaiting
                                          ? "bg-gold/15 text-gold-foreground"
                                          : complete
                                            ? "bg-success/15 text-success"
                                            : "bg-primary/10 text-primary",
                                      )}
                                    >
                                      {h.initials}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-sm font-medium">{h.name}</p>
                                    <p className="text-xs text-muted-foreground">{h.department}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm">{h.position}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {h.startDate}
                              </TableCell>
                              <TableCell className="w-48">
                                <Progress
                                  value={pct}
                                  className={cn(
                                    "h-2 [&>div]:transition-all",
                                    awaiting ? "[&>div]:bg-gold" : "[&>div]:bg-success",
                                    complete && awaiting && "[&>div]:shadow-[0_0_10px_var(--gold)]",
                                  )}
                                />
                                {awaiting ? (
                                  <p className="mt-1 flex items-center gap-1.5 text-[0.7rem] text-gold-foreground">
                                    <Loader2 className="h-3 w-3 shrink-0 animate-spin" />
                                    Waiting for evaluation
                                  </p>
                                ) : (
                                  <p
                                    className={cn(
                                      "mt-1 text-[0.7rem]",
                                      complete ? "text-success" : "text-muted-foreground",
                                    )}
                                  >
                                    {h.checklist.filter((c) => c.done).length}/{h.checklist.length}{" "}
                                    {complete ? "· all complete" : "complete"}
                                  </p>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    awaiting
                                      ? "border-gold/40 bg-gold/15 text-gold-foreground"
                                      : complete && "border-success/30 bg-success/15 text-success",
                                  )}
                                >
                                  {h.stage}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1.5">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="cursor-pointer"
                                    onClick={() => {
                                      if (editingId && editingId !== h.id) cancelEditChecklist();
                                      setSelectedId(h.id);
                                    }}
                                  >
                                    <Eye className="mr-1.5 h-3.5 w-3.5" /> View
                                  </Button>
                                  {editingId === h.id ? (
                                    <>
                                      <Button
                                        size="sm"
                                        className="cursor-pointer"
                                        onClick={saveEditChecklist}
                                      >
                                        <Save className="mr-1.5 h-3.5 w-3.5" /> Save
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="cursor-pointer"
                                        onClick={cancelEditChecklist}
                                      >
                                        Cancel
                                      </Button>
                                    </>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="cursor-pointer"
                                      onClick={() => startEditChecklist(h)}
                                    >
                                      <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit Checklist
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        {visible.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="py-8">
                              <ListEmptyState placeholder="Search name, position..." />
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </ListBody>
                </div>
                <TablePagination
                  page={hirePage.page}
                  pageCount={hirePage.pageCount}
                  from={hirePage.from}
                  to={hirePage.to}
                  total={hirePage.total}
                  label="hires"
                  onPageChange={hirePage.setPage}
                />
              </CardContent>
            </Card>

            {/* CHECKLIST PANEL — right corner */}
            <Card
              className={cn(
                "flex h-full min-w-0 flex-col border-border/70 transition-colors",
                selected &&
                  selected.stage === "Probationary" &&
                  evaluationRequested.includes(selected.id) &&
                  "border-gold/50 bg-gold/5 ring-1 ring-gold/30",
                selected &&
                  !(
                    selected.stage === "Probationary" && evaluationRequested.includes(selected.id)
                  ) &&
                  progress(selected) === 100 &&
                  "border-success/50 bg-success/5 ring-1 ring-success/30",
              )}
            >
              <CardContent className="flex min-w-0 flex-1 flex-col p-6">
                {!selected ? (
                  <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center text-sm text-muted-foreground">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <Users className="h-6 w-6 text-muted-foreground" />
                    </span>
                    Select a hire from the list to view their requirements checklist.
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback
                            className={cn(
                              "font-display",
                              progress(selected) === 100
                                ? "bg-success/15 text-success"
                                : "bg-primary/10 text-primary",
                            )}
                          >
                            {selected.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h2 className="font-display text-xl font-semibold">{selected.name}</h2>
                          <p className="text-xs text-muted-foreground">{selected.position}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="cursor-pointer"
                          onClick={closeChecklistPanel}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                      <p>{selected.email}</p>
                      <p>{selected.phone}</p>
                      <p>Start date: {selected.startDate}</p>
                    </div>

                    {(() => {
                      const isWaiting =
                        selected.stage === "Probationary" &&
                        evaluationRequested.includes(selected.id);
                      return (
                        <>
                          <div className="mt-4 flex min-h-[16rem] flex-1 flex-col">
                            <div className="flex items-center justify-between text-xs">
                              <span className="eyebrow">Requirements checklist</span>
                              <span
                                className={cn(
                                  "font-medium",
                                  progress(selected) === 100
                                    ? "text-gold-foreground"
                                    : "text-muted-foreground",
                                )}
                              >
                                {progress(selected)}%
                              </span>
                            </div>
                            <Progress
                              value={progress(selected)}
                              className={cn(
                                "mt-2 h-2 [&>div]:transition-all",
                                isWaiting ? "[&>div]:bg-gold" : "[&>div]:bg-success",
                                isWaiting &&
                                  progress(selected) === 100 &&
                                  "[&>div]:shadow-[0_0_10px_var(--gold)]",
                              )}
                            />

                            <div className="mt-3 flex w-full items-center justify-between rounded-md border border-border/70 bg-muted/30 px-3 py-2 text-xs font-medium">
                              <span>Checklist items ({selected.checklist.length})</span>
                              <span className="text-muted-foreground">
                                {selected.checklist.filter((c) => c.done).length}/
                                {selected.checklist.length}
                              </span>
                            </div>

                            <>
                              <ul className="mt-3 space-y-1.5">
                                {[...selected.checklist]
                                  .filter(
                                    (c) =>
                                      ((c.phase ?? "Probationary") === "Pre-onboarding") ===
                                      (selected.stage === "Pre-onboarding"),
                                  )
                                  .map((c, i) => ({ ...c, i }))
                                  .sort((a, b) => Number(a.done) - Number(b.done) || a.i - b.i)
                                  .map((c) => {
                                    const isEditingThis = editingId === selected.id && !isWaiting;
                                    const submission =
                                      selectedSubmissions[normalizeChecklistKey(c.item)];
                                    return (
                                      <li
                                        key={c.item}
                                        className="rounded-md transition-all duration-300 ease-in-out"
                                      >
                                        <AdminChecklistRow
                                          done={Boolean(c.done)}
                                          submitted={Boolean(
                                            submission &&
                                            (submission.submittedAt ||
                                              submission.fileName ||
                                              submission.notes),
                                          )}
                                          label={c.item}
                                          disabled={!isEditingThis}
                                          onClick={() => toggleItem(selected.id, c.item)}
                                          submission={submission}
                                        />
                                      </li>
                                    );
                                  })}
                              </ul>

                              {selected.checklist.some(
                                (c) =>
                                  ((c.phase ?? "Probationary") === "Pre-onboarding") !==
                                  (selected.stage === "Pre-onboarding"),
                              ) && (
                                <Collapsible className="mt-3">
                                  <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border border-border/70 bg-muted/30 px-3 py-2 text-xs font-medium transition-colors hover:bg-muted/50">
                                    <span className="flex items-center gap-1.5">
                                      <ChevronDown className="h-3.5 w-3.5" />
                                      {selected.stage === "Pre-onboarding"
                                        ? "Probationary tasks"
                                        : "Finished pre-onboarding checklist"}
                                    </span>
                                    <span className="text-muted-foreground">
                                      {
                                        selected.checklist.filter(
                                          (c) =>
                                            ((c.phase ?? "Probationary") === "Pre-onboarding") !==
                                              (selected.stage === "Pre-onboarding") && c.done,
                                        ).length
                                      }
                                      /
                                      {
                                        selected.checklist.filter(
                                          (c) =>
                                            ((c.phase ?? "Probationary") === "Pre-onboarding") !==
                                            (selected.stage === "Pre-onboarding"),
                                        ).length
                                      }{" "}
                                      done
                                    </span>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent className="overflow-hidden transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                                    <ul className="mt-2 space-y-1.5 pl-1.5">
                                      {[...selected.checklist]
                                        .filter(
                                          (c) =>
                                            ((c.phase ?? "Probationary") === "Pre-onboarding") !==
                                            (selected.stage === "Pre-onboarding"),
                                        )
                                        .map((c, i) => ({ ...c, i }))
                                        .sort(
                                          (a, b) => Number(a.done) - Number(b.done) || a.i - b.i,
                                        )
                                        .map((c) => {
                                          const isEditingThis =
                                            editingId === selected.id && !isWaiting;
                                          const submission =
                                            selectedSubmissions[normalizeChecklistKey(c.item)];
                                          return (
                                            <li
                                              key={c.item}
                                              className="rounded-md transition-all duration-300 ease-in-out"
                                            >
                                              <AdminChecklistRow
                                                done={Boolean(c.done)}
                                                submitted={Boolean(
                                                  submission &&
                                                  (submission.submittedAt ||
                                                    submission.fileName ||
                                                    submission.notes),
                                                )}
                                                label={c.item}
                                                disabled={!isEditingThis}
                                                onClick={() => toggleItem(selected.id, c.item)}
                                                submission={submission}
                                              />
                                            </li>
                                          );
                                        })}
                                    </ul>
                                  </CollapsibleContent>
                                </Collapsible>
                              )}
                            </>

                            {progress(selected) === 100 && !isWaiting && (
                              <div className="mt-4 rounded-md border border-success/40 bg-success/10 p-3 text-xs text-success">
                                All requirements complete — this hire is ready to advance.
                              </div>
                            )}

                            {!isWaiting && (
                              <div className="mt-auto flex flex-wrap items-stretch gap-2 pt-4">
                                {editingId === selected.id ? (
                                  <>
                                    <Button
                                      variant="outline"
                                      className="h-10 cursor-pointer"
                                      onClick={() => hireStore.setAllItemsDone(selected.id, true)}
                                    >
                                      Mark all done
                                    </Button>
                                    <Button
                                      className="h-10 cursor-pointer"
                                      onClick={saveEditChecklist}
                                    >
                                      <Save className="mr-1.5 h-4 w-4" /> Save
                                    </Button>
                                    <Button
                                      variant="outline"
                                      className="h-10 cursor-pointer"
                                      onClick={cancelEditChecklist}
                                    >
                                      Cancel
                                    </Button>
                                  </>
                                ) : (
                                  <Button
                                    variant="outline"
                                    className="h-10 cursor-pointer"
                                    onClick={() => startEditChecklist(selected)}
                                  >
                                    <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit Checklist
                                  </Button>
                                )}
                              </div>
                            )}

                            {selected.stage === "Pre-onboarding" &&
                              (progress(selected) === 100 &&
                              checklistSaved.includes(selected.id) ? (
                                <Button
                                  className="mt-2 h-10 w-full cursor-pointer"
                                  onClick={() => advance(selected)}
                                >
                                  Advance to Probationary
                                </Button>
                              ) : (
                                <p className="mt-2 rounded-md border border-dashed border-border bg-muted/40 p-3 text-center text-xs text-muted-foreground">
                                  Complete every checklist item and save the checklist to unlock
                                  “Advance to Probationary”.
                                </p>
                              ))}

                            {selected.stage === "Probationary" && (
                              <div className="mt-4">
                                {isWaiting ? (
                                  <div className="animate-in overflow-hidden rounded-xl border border-gold/40 bg-gold/5 fade-in duration-500">
                                    <div className="flex items-center gap-3 border-b border-gold/30 bg-gold/10 px-4 py-3">
                                      <span className="flex h-9 w-9 shrink-0 items-center justify-center">
                                        <Loader2 className="h-4.5 w-4.5 animate-spin text-gold-foreground" />
                                      </span>
                                      <div className="min-w-0 flex-1">
                                        <p className="font-display text-base font-semibold leading-tight text-gold-foreground">
                                          Waiting for evaluation
                                        </p>
                                        <p className="text-[0.7rem] text-muted-foreground">
                                          Sent to Performance — no result yet
                                        </p>
                                      </div>
                                      <Badge
                                        variant="outline"
                                        className="shrink-0 border-gold/40 bg-gold/10 text-[0.65rem] text-gold-foreground"
                                      >
                                        In review
                                      </Badge>
                                    </div>
                                    <div className="space-y-3 p-4">
                                      <div className="flex items-start gap-2 rounded-lg border border-border/60 bg-card px-3 py-2 text-xs">
                                        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-foreground" />
                                        <span className="text-muted-foreground">
                                          Auto-regularization in{" "}
                                          <span className="font-medium text-foreground">
                                            {autoRegMonths > 0
                                              ? `${autoRegMonths} month${autoRegMonths === 1 ? "" : "s"}${autoRegDays > 0 ? ` and ${autoRegDays} day${autoRegDays === 1 ? "" : "s"}` : ""}`
                                              : `${autoRegDays} day${autoRegDays === 1 ? "" : "s"}`}
                                          </span>{" "}
                                          if no evaluation result comes back.
                                        </span>
                                      </div>
                                      <Button
                                        variant="outline"
                                        className="h-9 w-full cursor-pointer"
                                        onClick={() => cancelEvaluationRequest(selected)}
                                      >
                                        <X className="mr-1.5 h-3.5 w-3.5" /> Cancel request
                                      </Button>
                                    </div>
                                  </div>
                                ) : progress(selected) === 100 &&
                                  checklistSaved.includes(selected.id) ? (
                                  <div className="animate-in overflow-hidden rounded-xl border border-gold/45 bg-card shadow-[0_10px_30px_-18px_var(--gold)] fade-in duration-500">
                                    <div className="relative flex items-center gap-3 border-b border-gold/30 bg-gradient-to-r from-gold/15 via-gold/5 to-transparent px-4 py-3">
                                      <span className="flex h-10 w-10 shrink-0 items-center justify-center">
                                        <ClipboardCheck className="h-5 w-5 text-gold-foreground" />
                                      </span>
                                      <div className="min-w-0 flex-1">
                                        <p className="font-display text-base font-semibold leading-tight">
                                          Ready for performance evaluation
                                        </p>
                                        <p className="truncate text-[0.7rem] text-muted-foreground">
                                          {selected.name} · {selected.position}
                                        </p>
                                      </div>
                                      <Badge
                                        variant="outline"
                                        className="shrink-0 border-gold/50 bg-gold/15 text-[0.65rem] font-medium text-gold-foreground"
                                      >
                                        100% complete
                                      </Badge>
                                    </div>
                                    <div className="space-y-3 p-4">
                                      <div className="space-y-1.5">
                                        <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-wide text-muted-foreground">
                                          <span>Checklist completion</span>
                                          <span className="font-semibold text-gold-foreground">
                                            100%
                                          </span>
                                        </div>
                                        <Progress
                                          value={100}
                                          className="h-2 [&>div]:bg-gold [&>div]:shadow-[0_0_10px_var(--gold)]"
                                        />
                                      </div>
                                      <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="rounded-lg border border-gold/25 bg-gold/5 px-3 py-2">
                                          <p className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">
                                            Requirements
                                          </p>
                                          <p className="mt-0.5 font-medium">
                                            {selected.checklist.filter((c) => c.done).length}/
                                            {selected.checklist.length} done
                                          </p>
                                        </div>
                                        <div className="rounded-lg border border-gold/25 bg-gold/5 px-3 py-2">
                                          <p className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">
                                            Checklist
                                          </p>
                                          <p className="mt-0.5 flex items-center gap-1 font-medium text-gold-foreground">
                                            <CheckCircle2 className="h-3.5 w-3.5" /> Saved
                                          </p>
                                        </div>
                                      </div>
                                      <p className="text-xs text-muted-foreground">
                                        Every probationary requirement is complete and saved — hand
                                        this hire over for evaluation.
                                      </p>
                                      <Button
                                        className="h-10 w-full cursor-pointer bg-gold text-gold-foreground hover:bg-gold/90"
                                        onClick={() => requestEvaluation(selected)}
                                      >
                                        <Send className="mr-1.5 h-4 w-4" /> Request for evaluation
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-center">
                                    <p className="text-xs font-medium">
                                      Request for evaluation is locked
                                    </p>
                                    <p className="mt-1 text-[0.7rem] text-muted-foreground">
                                      Complete all {selected.checklist.length} checklist items (
                                      {selected.checklist.filter((c) => c.done).length} done) and
                                      save the checklist to unlock it.
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="checklists" className="mt-4 space-y-6">
          <div className="grid gap-6 xl:grid-cols-2 xl:items-stretch">
            {/* MASTER PROBATIONARY CHECKLIST — applies to every employee entering probation. */}
            <Card className="flex h-[46rem] flex-col border-border/70 xl:order-2">
              <CardContent className="flex min-h-0 flex-1 flex-col p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
                      <ClipboardCheck className="h-5 w-5 text-primary" /> Checklist Builder
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Create the checklists shown in Pre-onboarding or Probationary. Active
                      Probationary checklists become the starting requirements of every new
                      probationary hire.
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {hireStore.combinedProbationaryItems().length} combined items
                  </Badge>
                </div>

                <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4">
                  <div className="order-2 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                    {checklistPage.pageItems.map((c) => (
                      <div key={c.id} className="rounded-lg border border-border p-4">
                        {editingChecklistId === c.id ? (
                          <>
                            <Input
                              value={editChecklistTitle}
                              onChange={(e) => setEditChecklistTitle(e.target.value)}
                              placeholder="Checklist title"
                            />
                            <div className="mt-3 space-y-2">
                              <Label className="text-xs">Stage</Label>
                              <Select
                                value={editChecklistPhase}
                                onValueChange={(v) =>
                                  setEditChecklistPhase(v as "Pre-onboarding" | "Probationary")
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Pre-onboarding">Pre-onboarding</SelectItem>
                                  <SelectItem value="Probationary">Probationary</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="mt-3 space-y-2">
                              <Label className="text-xs">Applies to</Label>
                              <label className="flex cursor-pointer items-center gap-2 text-sm">
                                <Checkbox
                                  checked={editChecklistAllPositions}
                                  onCheckedChange={(v) => setEditChecklistAllPositions(v === true)}
                                />
                                All positions
                              </label>
                              {!editChecklistAllPositions && (
                                <div className="max-h-40 space-y-1.5 overflow-y-auto rounded-md border border-border p-2">
                                  {knownPositions.map((p) => (
                                    <label
                                      key={p.id}
                                      className="flex cursor-pointer items-center gap-2 text-xs"
                                    >
                                      <Checkbox
                                        checked={editChecklistPositions.includes(p.title)}
                                        onCheckedChange={(v) =>
                                          setEditChecklistPositions((prev) =>
                                            v === true
                                              ? [...prev, p.title]
                                              : prev.filter((t) => t !== p.title),
                                          )
                                        }
                                      />
                                      {p.title}
                                    </label>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="mt-3 space-y-2 rounded-lg border border-border/70 bg-muted/20 p-2.5">
                              <div className="flex gap-2">
                                <Input
                                  value={editChecklistNewItem}
                                  onChange={(e) => setEditChecklistNewItem(e.target.value)}
                                  placeholder="Requirement name…"
                                  className="h-8 text-xs"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && !showEditItemDetails) {
                                      e.preventDefault();
                                      const v = editChecklistNewItem.trim();
                                      if (!v) return;
                                      setEditChecklistRichItems((prev) => [
                                        ...prev,
                                        {
                                          item_text: v,
                                          requires_upload: editItemRequiresUpload,
                                          ...(editItemInstructions.trim()
                                            ? { instructions: editItemInstructions.trim() }
                                            : {}),
                                          ...(editItemUploadPlaceholder.trim()
                                            ? {
                                                upload_placeholder:
                                                  editItemUploadPlaceholder.trim(),
                                              }
                                            : {}),
                                        },
                                      ]);
                                      setEditChecklistNewItem("");
                                      setEditItemInstructions("");
                                      setEditItemUploadPlaceholder("");
                                    }
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-xs cursor-pointer"
                                  onClick={() => setShowEditItemDetails(!showEditItemDetails)}
                                >
                                  {showEditItemDetails ? "Simple" : "Configure"}
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  className="h-8 cursor-pointer"
                                  onClick={() => {
                                    const v = editChecklistNewItem.trim();
                                    if (!v) return;
                                    setEditChecklistRichItems((prev) => [
                                      ...prev,
                                      {
                                        item_text: v,
                                        requires_upload: editItemRequiresUpload,
                                        ...(editItemInstructions.trim()
                                          ? { instructions: editItemInstructions.trim() }
                                          : {}),
                                        ...(editItemUploadPlaceholder.trim()
                                          ? { upload_placeholder: editItemUploadPlaceholder.trim() }
                                          : {}),
                                      },
                                    ]);
                                    setEditChecklistNewItem("");
                                    setEditItemInstructions("");
                                    setEditItemUploadPlaceholder("");
                                  }}
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </Button>
                              </div>

                              {showEditItemDetails && (
                                <div className="space-y-2 pt-2 border-t border-border/60 text-xs">
                                  <div className="space-y-1">
                                    <Label className="text-[10px] text-muted-foreground">
                                      Instructions
                                    </Label>
                                    <Input
                                      value={editItemInstructions}
                                      onChange={(e) => setEditItemInstructions(e.target.value)}
                                      placeholder="e.g. Upload scanned original document..."
                                      className="h-7 text-xs"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-[10px] text-muted-foreground">
                                      Upload Placeholder / Hint
                                    </Label>
                                    <Input
                                      value={editItemUploadPlaceholder}
                                      onChange={(e) => setEditItemUploadPlaceholder(e.target.value)}
                                      placeholder="e.g. Upload PDF or clear scan..."
                                      className="h-7 text-xs"
                                    />
                                  </div>
                                  <label className="flex items-center gap-2 cursor-pointer pt-0.5">
                                    <Checkbox
                                      checked={editItemRequiresUpload}
                                      onCheckedChange={(v) => setEditItemRequiresUpload(v === true)}
                                    />
                                    <span className="font-medium text-[11px]">
                                      Require document upload
                                    </span>
                                  </label>
                                </div>
                              )}
                            </div>

                            <ul className="mt-3 space-y-1.5">
                              {editChecklistRichItems.map((item, i) => (
                                <li
                                  key={`${item.item_text}-${i}`}
                                  className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-xs"
                                >
                                  <div className="min-w-0">
                                    <span className="font-medium">{item.item_text}</span>
                                    {item.instructions && (
                                      <p className="text-[10px] text-muted-foreground truncate">
                                        {item.instructions}
                                      </p>
                                    )}
                                  </div>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6 cursor-pointer shrink-0"
                                    onClick={() =>
                                      setEditChecklistRichItems((prev) =>
                                        prev.filter((_, x) => x !== i),
                                      )
                                    }
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </li>
                              ))}
                            </ul>
                            <div className="mt-3 flex justify-end gap-2">
                              <Button
                                variant="outline"
                                className="cursor-pointer text-xs h-8"
                                onClick={cancelEditMasterChecklist}
                              >
                                <X className="mr-1.5 h-3.5 w-3.5" /> Cancel
                              </Button>
                              <Button
                                className="cursor-pointer text-xs h-8"
                                onClick={saveEditMasterChecklist}
                              >
                                <Save className="mr-1.5 h-3.5 w-3.5" /> Save Configuration
                              </Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-medium">{c.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {c.items.length} item{c.items.length === 1 ? "" : "s"}
                                </p>
                                <div className="mt-1.5 flex flex-wrap gap-1.5">
                                  <Badge variant="outline" className="text-[0.65rem]">
                                    {c.phase ?? "Probationary"}
                                  </Badge>
                                  <Badge variant="outline" className="text-[0.65rem]">
                                    {c.positions === "all" || !c.positions
                                      ? "All positions"
                                      : `${c.positions.length} position${c.positions.length === 1 ? "" : "s"}`}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "text-[0.65rem]",
                                      (c.status ?? "Active") === "Active"
                                        ? "border-success/30 bg-success/15 text-success"
                                        : "border-border bg-muted text-muted-foreground",
                                    )}
                                  >
                                    {c.status ?? "Active"}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex shrink-0 gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 cursor-pointer text-xs"
                                  onClick={() =>
                                    hireStore.updateMasterChecklist(c.id, {
                                      status:
                                        (c.status ?? "Active") === "Active" ? "Closed" : "Active",
                                    })
                                  }
                                >
                                  {(c.status ?? "Active") === "Active" ? "Close" : "Activate"}
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 cursor-pointer text-primary hover:bg-primary/10"
                                  aria-label={`Edit configuration for ${c.title}`}
                                  title="Edit configuration"
                                  onClick={() => startEditMasterChecklist(c.id)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 cursor-pointer hover:text-destructive"
                                  aria-label={`Delete ${c.title}`}
                                  title="Delete checklist"
                                  onClick={() => deleteMasterChecklist(c.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                              {c.items.map((item, i) => (
                                <li key={`${item}-${i}`} className="flex items-center gap-2">
                                  <Circle className="h-3 w-3 shrink-0" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    ))}
                    {masterChecklists.length === 0 && (
                      <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                        No checklist yet — create one above.
                      </p>
                    )}
                  </div>

                  <div className="order-1">
                    {!showCreateChecklist ? (
                      <Button
                        className="w-full cursor-pointer"
                        onClick={() => setShowCreateChecklist(true)}
                      >
                        <ClipboardList className="mr-1.5 h-4 w-4" /> Create checklist
                      </Button>
                    ) : (
                      <>
                        <div className="flex items-center justify-between gap-2">
                          <span className="eyebrow">New checklist</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 cursor-pointer text-xs"
                            onClick={() => setShowCreateChecklist(false)}
                          >
                            <X className="mr-1 h-3.5 w-3.5" /> Close
                          </Button>
                        </div>
                        <div className="mt-2 space-y-2">
                          <Label className="text-xs">Checklist name</Label>
                          <Input
                            value={newChecklistTitle}
                            onChange={(e) => setNewChecklistTitle(e.target.value)}
                            placeholder="e.g. Front Office probationary checklist"
                          />
                        </div>
                        <div className="mt-3 space-y-2">
                          <Label className="text-xs">Stage</Label>
                          <Select
                            value={newChecklistPhase}
                            onValueChange={(v) =>
                              setNewChecklistPhase(v as "Pre-onboarding" | "Probationary")
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pre-onboarding">Pre-onboarding</SelectItem>
                              <SelectItem value="Probationary">Probationary</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="mt-3 space-y-2">
                          <Label className="text-xs">Applies to</Label>
                          <label className="flex cursor-pointer items-center gap-2 text-sm">
                            <Checkbox
                              checked={newChecklistAllPositions}
                              onCheckedChange={(v) => setNewChecklistAllPositions(v === true)}
                            />
                            All positions
                          </label>
                          {!newChecklistAllPositions && (
                            <div className="max-h-40 space-y-1.5 overflow-y-auto rounded-md border border-border p-2">
                              {knownPositions.map((p) => (
                                <label
                                  key={p.id}
                                  className="flex cursor-pointer items-center gap-2 text-xs"
                                >
                                  <Checkbox
                                    checked={newChecklistPositions.includes(p.title)}
                                    onCheckedChange={(v) =>
                                      setNewChecklistPositions((prev) =>
                                        v === true
                                          ? [...prev, p.title]
                                          : prev.filter((t) => t !== p.title),
                                      )
                                    }
                                  />
                                  {p.title}
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="mt-3 space-y-2 rounded-lg border border-border/70 bg-muted/20 p-3">
                          <div className="flex gap-2">
                            <Input
                              value={newItem}
                              onChange={(e) => setNewItem(e.target.value)}
                              placeholder="Requirement name (e.g. NBI Clearance)…"
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !showItemDetails) {
                                  e.preventDefault();
                                  addDraftItem();
                                }
                              }}
                            />
                            <Button
                              variant="outline"
                              className="cursor-pointer"
                              onClick={() => setShowItemDetails(!showItemDetails)}
                              title="Configure instructions and upload requirements"
                            >
                              {showItemDetails ? "Simple" : "Configure"}
                            </Button>
                            <Button className="cursor-pointer" onClick={addDraftItem}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          {showItemDetails && (
                            <div className="space-y-2.5 pt-2 border-t border-border/60 text-xs">
                              <div className="space-y-1">
                                <Label className="text-[11px] text-muted-foreground">
                                  Instructions for New Hire
                                </Label>
                                <Input
                                  value={newItemInstructions}
                                  onChange={(e) => setNewItemInstructions(e.target.value)}
                                  placeholder="e.g. Submit original clearance issued within the last 6 months."
                                  className="h-8 text-xs"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-[11px] text-muted-foreground">
                                  Upload Placeholder / File Hint
                                </Label>
                                <Input
                                  value={newItemUploadPlaceholder}
                                  onChange={(e) => setNewItemUploadPlaceholder(e.target.value)}
                                  placeholder="e.g. Upload scanned PDF or clear photo..."
                                  className="h-8 text-xs"
                                />
                              </div>
                              <label className="flex items-center gap-2 cursor-pointer pt-1">
                                <Checkbox
                                  checked={newItemRequiresUpload}
                                  onCheckedChange={(v) => setNewItemRequiresUpload(v === true)}
                                />
                                <span className="font-medium">
                                  Require document attachment / upload
                                </span>
                              </label>
                            </div>
                          )}
                        </div>

                        <ul className="mt-3 space-y-1.5">
                          {draftItems.map((item, i) => (
                            <li
                              key={`${item.item_text}-${i}`}
                              className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm"
                            >
                              <div className="min-w-0">
                                <span className="font-medium">{item.item_text}</span>
                                {item.instructions && (
                                  <p className="text-[11px] text-muted-foreground truncate">
                                    {item.instructions}
                                  </p>
                                )}
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 cursor-pointer shrink-0"
                                onClick={() =>
                                  setDraftItems((prev) => prev.filter((_, x) => x !== i))
                                }
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </li>
                          ))}
                          {draftItems.length === 0 && (
                            <li className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                              No items yet — add requirements above.
                            </li>
                          )}
                        </ul>
                        <Button
                          className="mt-3 w-full cursor-pointer"
                          onClick={createMasterChecklist}
                        >
                          <ClipboardList className="mr-1.5 h-4 w-4" /> Save checklist
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="shrink-0 border-t border-border/60 pt-3">
                  <TablePagination
                    page={checklistPage.page}
                    pageCount={checklistPage.pageCount}
                    from={checklistPage.from}
                    to={checklistPage.to}
                    total={checklistPage.total}
                    label="checklists"
                    onPageChange={checklistPage.setPage}
                  />
                </div>
              </CardContent>
            </Card>

            {/* REQUESTED CHECKLISTS — reference items raised by Performance for checklist creation. */}
            <Card className="flex h-[46rem] flex-col border-border/70 xl:order-1">
              <CardContent className="flex min-h-0 flex-1 flex-col p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
                      <Send className="h-5 w-5 text-primary" /> Requested Checklists
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Items requested by Performance. Use them as reference when building checklists
                      in the Checklist Builder — they are not attached to any single employee.
                    </p>
                  </div>
                  <Badge variant="secondary">{requestedItems.length} requested</Badge>
                </div>

                <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_13rem_auto]">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Checklist item</Label>
                    <Input
                      value={reqItemDraft}
                      onChange={(e) => setReqItemDraft(e.target.value)}
                      placeholder="e.g. Barista certification copy"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addRequestedItem();
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Job position</Label>
                    <Select value={reqPositionDraft} onValueChange={setReqPositionDraft}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Select All (all positions)</SelectItem>
                        {knownPositions.map((p) => (
                          <SelectItem key={p.id} value={p.title}>
                            {p.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button className="w-full cursor-pointer sm:w-auto" onClick={addRequestedItem}>
                      <Plus className="mr-1.5 h-4 w-4" /> Add request
                    </Button>
                  </div>
                </div>

                <div className="mt-4 min-h-0 flex-1 overflow-auto rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="px-4 py-2.5 text-left font-medium">Checklist Item</th>
                        <th className="px-4 py-2.5 text-left font-medium">Job Position</th>
                        <th className="px-4 py-2.5 text-left font-medium">Requested</th>
                        <th className="px-4 py-2.5 text-right font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reqPage.pageItems.map((r) => (
                        <tr key={r.id} className="border-t border-border/70">
                          {editingReqId === r.id ? (
                            <>
                              <td className="px-4 py-2">
                                <Input
                                  value={editReqItem}
                                  onChange={(e) => setEditReqItem(e.target.value)}
                                  className="h-8"
                                />
                              </td>
                              <td className="px-4 py-2">
                                <Select value={editReqPosition} onValueChange={setEditReqPosition}>
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="all">Select All (all positions)</SelectItem>
                                    {knownPositions.map((p) => (
                                      <SelectItem key={p.id} value={p.title}>
                                        {p.title}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="px-4 py-2 text-xs text-muted-foreground">
                                {r.requestedAt}
                              </td>
                              <td className="px-4 py-2 text-right">
                                <div className="flex justify-end gap-1.5">
                                  <Button
                                    size="sm"
                                    className="h-8 cursor-pointer"
                                    onClick={saveRequestedItem}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 cursor-pointer"
                                    onClick={() => setEditingReqId(null)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-4 py-2.5">{r.item}</td>
                              <td className="px-4 py-2.5">
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-xs",
                                    r.position === "all" &&
                                      "border-gold/40 bg-gold/10 text-gold-foreground",
                                  )}
                                >
                                  {r.position === "all" ? "All positions" : r.position}
                                </Badge>
                              </td>
                              <td className="px-4 py-2.5 text-xs text-muted-foreground">
                                {r.requestedBy} · {r.requestedAt}
                              </td>
                              <td className="px-4 py-2.5 text-right">
                                <div className="flex justify-end gap-1">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 cursor-pointer"
                                    aria-label="Edit requested item"
                                    onClick={() => startEditRequestedItem(r)}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 cursor-pointer"
                                    aria-label="Delete requested item"
                                    onClick={() => deleteRequestedItem(r.id)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                      {requestedItems.length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-4 py-8 text-center text-sm text-muted-foreground"
                          >
                            No requested checklist items yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="shrink-0 border-t border-border/60 pt-3">
                  <TablePagination
                    page={reqPage.page}
                    pageCount={reqPage.pageCount}
                    from={reqPage.from}
                    to={reqPage.to}
                    total={reqPage.total}
                    label="requests"
                    onPageChange={reqPage.setPage}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* AUTO-REGULARIZATION SETTINGS */}
      <Dialog open={autoRegOpen} onOpenChange={setAutoRegOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Auto-Regularization</DialogTitle>
            <DialogDescription>
              Set how long a hire waits on an evaluation result before they are regularized
              automatically. This applies to every probationary hire.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-gold/40 bg-gold/5 p-4 text-sm">
            <p className="text-muted-foreground">
              Auto-regularization after{" "}
              <span className="font-medium text-foreground">
                {autoRegDraft.months} month{autoRegDraft.months === 1 ? "" : "s"} and{" "}
                {autoRegDraft.days} day{autoRegDraft.days === 1 ? "" : "s"}
              </span>{" "}
              of waiting on evaluation.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Months</Label>
              <Input
                type="number"
                min={0}
                value={autoRegDraft.months}
                onChange={(e) =>
                  setAutoRegDraft((p) => ({
                    ...p,
                    months: Math.max(0, Number(e.target.value) || 0),
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Days</Label>
              <Input
                type="number"
                min={0}
                value={autoRegDraft.days}
                onChange={(e) =>
                  setAutoRegDraft((p) => ({
                    ...p,
                    days: Math.max(0, Number(e.target.value) || 0),
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => setAutoRegOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="cursor-pointer"
              onClick={() => {
                if (autoRegDraft.months === 0 && autoRegDraft.days === 0) {
                  toast.error("Set at least 1 day");
                  return;
                }
                setAutoRegMonths(autoRegDraft.months);
                setAutoRegDays(autoRegDraft.days);
                setAutoRegOpen(false);
                toast.success(
                  `Auto-regularization set to ${autoRegDraft.months} month(s) and ${autoRegDraft.days} day(s)`,
                );
              }}
            >
              Save setting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ADD NEW HIRE */}
      <Dialog
        open={addOpen}
        onOpenChange={(o) => {
          setAddOpen(o);
          if (!o) {
            setNameLocked(false);
            setCompletingId(null);
          }
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {completingId ? "Complete Hire Record" : "Add New Hire"}
            </DialogTitle>
            <DialogDescription>
              {completingId
                ? "Confirm this hire's details to move them to Probationary and create their portal account. Closing without saving keeps them in Pre-onboarding."
                : "Creates a pre-onboarding record with the standard requirements checklist, and adds the hire to Employee Records."}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-xs text-muted-foreground">
            Account note: the employee portal account is created with the default password{" "}
            <span className="font-medium text-foreground">{defaultPassword}</span> — the hire is
            prompted to change it on first login.
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Full name</Label>
              {nameLocked ? (
                <>
                  <Input value={form.name} readOnly className="bg-muted/50" />
                  <p className="text-[0.7rem] text-muted-foreground">
                    Accepted applicant — details carried over from assessment.
                  </p>
                </>
              ) : (
                <Select
                  value={form.name}
                  onValueChange={(v) => {
                    const a = candidateApplicants.find((x) => x.name === v);
                    const p = a ? knownPositions.find((x) => x.title === a.position) : undefined;
                    setForm((prev) => ({
                      ...prev,
                      name: v,
                      position: p?.title ?? prev.position,
                      department: p?.department ?? prev.department,
                      email: a?.email ?? prev.email,
                      phone: a?.phone ?? prev.phone,
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select applicant" />
                  </SelectTrigger>
                  <SelectContent>
                    {candidateApplicants
                      .filter((a) => !hires.some((h) => h.name === a.name))
                      .map((a) => (
                        <SelectItem key={a.id} value={a.name}>
                          {a.name} — {a.position}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center justify-between">
                <span>Position</span>
                {!isSuperAdmin && (
                  <span className="text-[10px] text-muted-foreground">(Locked for Admin)</span>
                )}
              </Label>
              <Select
                disabled={!isSuperAdmin}
                value={form.position}
                onValueChange={(v) => {
                  const p = knownPositions.find((x) => x.title === v);
                  setForm({ ...form, position: v, department: p?.department ?? form.department });
                }}
              >
                <SelectTrigger className={!isSuperAdmin ? "bg-muted/50 cursor-not-allowed" : ""}>
                  <SelectValue placeholder="Select position" />
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
            <div className="space-y-1.5">
              <Label className="flex items-center justify-between">
                <span>Department</span>
                {!isSuperAdmin && (
                  <span className="text-[10px] text-muted-foreground">(Locked for Admin)</span>
                )}
              </Label>
              <Select
                disabled={!isSuperAdmin}
                value={form.department}
                onValueChange={(v) => setForm({ ...form, department: v })}
              >
                <SelectTrigger className={!isSuperAdmin ? "bg-muted/50 cursor-not-allowed" : ""}>
                  <SelectValue placeholder="Select department" />
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
              <Label className="flex items-center justify-between">
                <span>Email</span>
                {!isSuperAdmin && (
                  <span className="text-[10px] text-muted-foreground">(Locked for Admin)</span>
                )}
              </Label>
              <Input
                type="email"
                readOnly={!isSuperAdmin}
                className={!isSuperAdmin ? "bg-muted/50 cursor-not-allowed" : ""}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center justify-between">
                <span>Phone number</span>
                {!isSuperAdmin && (
                  <span className="text-[10px] text-muted-foreground">(Locked for Admin)</span>
                )}
              </Label>
              <Input
                placeholder="e.g. 0917 123 4567"
                readOnly={!isSuperAdmin}
                className={!isSuperAdmin ? "bg-muted/50 cursor-not-allowed" : ""}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: sanitizePhone(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="flex items-center justify-between">
                <span>Start date</span>
                {!isSuperAdmin && (
                  <span className="text-[10px] text-muted-foreground">(Locked for Admin)</span>
                )}
              </Label>
              <Input
                type="date"
                readOnly={!isSuperAdmin}
                className={!isSuperAdmin ? "bg-muted/50 cursor-not-allowed" : ""}
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addHire}>
              {completingId ? "Confirm & create account" : "Add new hire"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* =========================================================================== */
/* EMPLOYEE PORTAL VIEW — probationary checklist for the signed-in new hire     */
/* (merged from EmployeeOnboarding.tsx so this module stays a single file)      */
/* =========================================================================== */

type Phase = "Pre-onboarding" | "Probationary";

type EmployeeChecklistItem = {
  id: string;
  title: string;
  date: string;
  isoDate: string;
  done: boolean;
  rank: number;
  phase: Phase;
  /** Employee has submitted this requirement (awaiting HR verification). */
  submittedAt?: string;
  /** Database onboarding item id — used to toggle completion / upload via the API. */
  dbId?: number;
  /** Template item id — virtual items are materialized on first interaction. */
  templateItemId?: number | null;
  instructions?: string;
  requiresUpload?: boolean;
  uploadPlaceholder?: string;
  fileName?: string;
  fileUrl?: string;
  notes?: string;
};

function EmployeeChecklistRow({
  item,
  isSelected,
  onView,
}: {
  item: EmployeeChecklistItem;
  isSelected?: boolean;
  onView: (i: EmployeeChecklistItem) => void;
}) {
  return (
    <div
      onClick={() => onView(item)}
      role="button"
      tabIndex={0}
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 px-3 rounded-lg transition-all cursor-pointer",
        isSelected
          ? "bg-primary/10 border border-primary/40 shadow-xs"
          : item.done
            ? "border border-success/30 bg-success/10"
            : "hover:bg-muted/30 border border-transparent",
      )}
    >
      <div className="flex items-start gap-3">
        {item.done ? (
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white mt-0.5 shadow-xs">
            <Check className="h-4 w-4 stroke-[3]" />
          </div>
        ) : item.submittedAt ? (
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-destructive text-destructive mt-0.5">
            <Hourglass className="h-3 w-3" />
          </div>
        ) : (
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-amber-500 text-amber-500 mt-0.5">
            <Circle className="h-3 w-3 fill-amber-500" />
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p
              className={cn(
                "text-sm font-semibold",
                !item.done && item.submittedAt ? "text-destructive" : "text-foreground",
              )}
            >
              {item.title}
            </p>
            <Badge
              variant="outline"
              className={
                item.done
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[11px]"
                  : item.submittedAt
                    ? "bg-destructive/10 text-destructive border-destructive/30 text-[11px]"
                    : "bg-amber-500/10 text-amber-600 border-amber-500/30 text-[11px]"
              }
            >
              {item.done
                ? "Verified by HR"
                : item.submittedAt
                  ? "Submitted · pending review"
                  : "Pending"}
            </Badge>
            {item.fileName && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <FileCheck2 className="h-3 w-3 text-primary" /> Attachment uploaded
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{item.date}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:ml-auto" onClick={(e) => e.stopPropagation()}>
        <Button
          size="sm"
          variant={isSelected ? "default" : "outline"}
          className="cursor-pointer text-xs h-8"
          onClick={() => onView(item)}
        >
          <Eye className="mr-1.5 h-3.5 w-3.5" /> {isSelected ? "Viewing" : "View"}
        </Button>
      </div>
    </div>
  );
}

export function EmployeeOnboarding() {
  // The current user's new hire record + checklist come from the database.
  const [newHire, setNewHire] = useState<ApiNewHire | null>(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<EmployeeChecklistItem[]>([]);

  // Task viewing & upload modal state
  const [viewingItem, setViewingItem] = useState<EmployeeChecklistItem | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadNotes, setUploadNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    // Resolve the signed-in portal user from the auth session (NOT the mock
    // profile) so the checklist always reflects the logged-in employee's own
    // new-hire record from the database.
    const authUser = getUser();
    const myName = authUser?.full_name?.trim().toLowerCase() ?? "";
    const myEmployeeId = authUser?.employee_id ?? null;

    newHiresApi
      .list({ per_page: 100 })
      .then((res) => {
        const mine =
          (myEmployeeId != null
            ? res.data.find((h) => h.employee_id === myEmployeeId)
            : undefined) ??
          (myName ? res.data.find((h) => h.name.trim().toLowerCase() === myName) : undefined) ??
          // Demo fallback: prefer a Probationary hire so the probationary
          // checklist view stays populated straight from the database.
          res.data.find((h) => h.stage === "Probationary") ??
          res.data[0] ??
          null;
        setNewHire(mine);
        return mine;
      })
      .then((mine) => {
        if (!mine) return;
        return onboardingItemsApi.listForNewHire(mine.new_hire_id).then((apiItems) => {
          // Show ONLY the Probationary checklist — pre-onboarding / onboarding
          // items are hidden from the employee portal entirely.
          const probationaryOnly = apiItems.filter(
            (i) => (i.phase ?? "Probationary") === "Probationary",
          );
          setItems(
            probationaryOnly.map((i) => ({
              id: i.employee_onboarding_item_id
                ? `chk-${i.employee_onboarding_item_id}`
                : `virt-${i.template_item_id}`,
              dbId: i.employee_onboarding_item_id ?? undefined,
              templateItemId: i.template_item_id ?? null,
              title: i.item_text,
              instructions:
                i.instructions ??
                "Please complete this requirement and upload the supporting document for HR verification.",
              requiresUpload: i.requires_upload ?? true,
              uploadPlaceholder:
                i.upload_placeholder ?? "Upload scanned copy or document (PDF, PNG, JPG)...",
              fileName: i.file_name ?? undefined,
              fileUrl:
                i.employee_onboarding_item_id != null
                  ? onboardingItemsApi.documentUrl(i.employee_onboarding_item_id)
                  : (i.file_url ?? (i.file_path ? resolveStorageUrl(i.file_path) : undefined)),
              notes: i.notes ?? "",
              submittedAt: i.submitted_at ?? undefined,
              date: i.done
                ? `Verified ${new Date(i.completed_at ?? Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                : i.submitted_at
                  ? `Submitted ${new Date(i.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · awaiting HR verification`
                  : "Pending your action",
              isoDate:
                i.done && i.completed_at
                  ? i.completed_at.slice(0, 10)
                  : (i.submitted_at?.slice(0, 10) ?? "2026-08-01"),
              done: Boolean(i.done),
              rank: i.done ? 0 : i.submitted_at ? 1 : 2,
              phase: "Probationary" as Phase,
            })),
          );
        });
      })
      .catch((err) => {
        console.warn("Could not load onboarding checklist from API:", err);
        toast.error("Could not load your onboarding checklist");
      })
      .finally(() => setLoading(false));
  }, []);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("recent");

  const completedCount = items.filter((i) => i.done).length;
  const totalCount = items.length;
  const pct = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const openViewPanel = (item: EmployeeChecklistItem) => {
    // If clicking the same item that's already open, toggle it or update selected file
    if (viewingItem?.id === item.id) {
      setViewingItem(null);
      setUploadFile(null);
      return;
    }
    setViewingItem(item);
    setUploadFile(null);
    setUploadNotes(item.notes ?? "");
  };

  const handleTaskSubmit = async () => {
    if (!viewingItem) return;

    // A submission needs at least a document or a note for HR to review.
    if (
      viewingItem.requiresUpload !== false &&
      !uploadFile &&
      !viewingItem.fileName &&
      !uploadNotes.trim()
    ) {
      toast.error("Please upload the required document (or add a note) before submitting.");
      return;
    }

    setSubmitting(true);

    try {
      let activeDbId = viewingItem.dbId;

      // Materialize virtual item if needed
      if (!activeDbId && viewingItem.templateItemId && newHire) {
        const created = await onboardingItemsApi.materialize(
          newHire.new_hire_id,
          viewingItem.templateItemId,
        );
        activeDbId = created.employee_onboarding_item_id;
      }

      if (!activeDbId) {
        toast.error("Could not link checklist item to database record.");
        return;
      }

      const submittedIso = new Date().toISOString().slice(0, 10);
      let uploadedFileName = viewingItem.fileName;
      let uploadedFileUrl = viewingItem.fileUrl;

      // Submit to HR: document (optional) + notes. This records submitted_at
      // but does NOT complete the item — only HR verification moves progress.
      const formData = new FormData();
      if (uploadFile) formData.append("file", uploadFile);
      if (uploadNotes.trim()) formData.append("notes", uploadNotes.trim());
      const res = await onboardingItemsApi.upload(activeDbId, formData);
      uploadedFileName = res.file_name ?? uploadedFileName;
      uploadedFileUrl = onboardingItemsApi.documentUrl(activeDbId);
      const submittedAt = res.submitted_at ?? new Date().toISOString();

      const updatedItem: EmployeeChecklistItem = {
        ...viewingItem,
        dbId: activeDbId,
        done: res.done,
        rank: res.done ? 0 : 1,
        date: `Submitted ${new Date(submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · awaiting HR verification`,
        isoDate: submittedIso,
        submittedAt,
        ...(uploadedFileName ? { fileName: uploadedFileName } : {}),
        ...(uploadedFileUrl ? { fileUrl: uploadedFileUrl } : {}),
        ...(uploadNotes.trim() || viewingItem.notes
          ? { notes: uploadNotes.trim() || viewingItem.notes }
          : {}),
      };

      // Update local state
      setItems((prev) =>
        prev.map((i) => (i.id === viewingItem.id || i.dbId === activeDbId ? updatedItem : i)),
      );

      // Keep viewing the updated item in panel with fresh status
      setViewingItem(updatedItem);
      setUploadFile(null);

      toast.success(res.message);
    } catch (e) {
      console.warn("Upload/submission error:", e);
      toast.error("Could not save task submission — please retry.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = useMemo(() => {
    return items
      .filter((i) => {
        if (search && !i.title.toLowerCase().includes(search.toLowerCase())) return false;
        if (filter === "completed") return i.done;
        if (filter === "pending") return !i.done;
        return true;
      })
      .sort((a, b) => {
        if (filter === "recent") return b.isoDate.localeCompare(a.isoDate);
        if (filter === "pending") return a.rank - b.rank;
        return 0;
      });
  }, [items, search, filter]);

  /* Consistent card height: the checklist area is ALWAYS exactly 7 rows tall.
     More than 7 items scroll inside the card; fewer show breathing room. The
     height is measured from real row heights so wrapping never breaks it. */
  const listScrollRef = useRef<HTMLDivElement | null>(null);
  /** Last seen single-row height — keeps the 7-row height stable even when
      search/filter/loading leaves the list temporarily empty. */
  const rowHeightFallbackRef = useRef(66);

  const syncListHeight = useCallback(() => {
    const el = listScrollRef.current;
    if (!el) return;

    const rows = Array.from(el.querySelectorAll<HTMLElement>("[data-checklist-row]"));
    if (rows[0]) {
      rowHeightFallbackRef.current = rows[0].offsetHeight;
    }

    // Bottom edge of the 7th row relative to the scroll container content.
    const seventh = el.querySelector<HTMLElement>("[data-checklist-row]:nth-child(7)");
    let target: number;
    if (seventh) {
      target =
        seventh.getBoundingClientRect().bottom - el.getBoundingClientRect().top + el.scrollTop;
    } else {
      // Fewer than 7 rows (or none): estimate from the known row height
      // plus the 6 divider lines between 7 rows.
      target = Math.ceil(rowHeightFallbackRef.current * 7 + 6);
    }

    const cap = `${Math.ceil(target)}px`;
    el.style.maxHeight = cap;
    el.style.minHeight = cap;
  }, []);

  useEffect(() => {
    syncListHeight();
    // Re-measure after fonts/layout settle and on window resizes.
    const timer = window.setTimeout(syncListHeight, 350);
    window.addEventListener("resize", syncListHeight);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", syncListHeight);
    };
  }, [syncListHeight, filteredItems, viewingItem]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Employee Portal"
        title="New Hire Onboarding"
        description="Complete these probationary requirements to finish your onboarding. This menu disappears once HR marks onboarding as complete."
      />

      {/* Yellow HR Notice Alert */}
      <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-amber-800 dark:text-amber-300">
        <Info className="h-5 w-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
        <p className="text-sm">
          Employee regularization and full activation is performed by HR Admin after all
          probationary requirements below have been verified.
        </p>
      </div>

      {/* NEW HIRE ONBOARDING Header & Progress Card */}
      <Card className="border-border/70 overflow-hidden">
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="eyebrow text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                NEW HIRE ONBOARDING
              </p>
              <h2 className="text-2xl font-bold font-display text-foreground mt-1">
                {newHire?.name ?? getUser()?.full_name ?? myProfile.name}
              </h2>
              <p className="text-sm font-medium text-muted-foreground mt-0.5">
                Employee ID:{" "}
                <span className="text-foreground font-mono font-semibold">
                  {newHire?.employee_id
                    ? `OSM-${String(newHire.employee_id).padStart(4, "0")}`
                    : myProfile.employeeId}
                </span>
              </p>
            </div>

            {/* Prominent Employment Status — PROBATIONARY */}
            <div className="flex flex-col sm:items-end gap-1.5">
              <Badge
                variant="outline"
                className="bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/40 text-base sm:text-lg px-4 py-1.5 font-bold uppercase tracking-widest self-start sm:self-auto shadow-xs"
              >
                PROBATIONARY
              </Badge>
              <span className="text-xs text-muted-foreground font-medium">Employment Status</span>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between text-sm font-medium mb-2">
              <span className="text-muted-foreground">
                Verified Progress{" "}
                <span className="font-normal text-muted-foreground/70">
                  (HR updates this when they verify your submissions)
                </span>
              </span>
              <span className="text-primary font-bold">{pct}% Complete</span>
            </div>
            <Progress value={pct} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* SPLIT VIEW CONTAINER: Checklist on Left, Task Detail Panel on Right.
          The checklist card keeps a constant 7-row height and DEFINES the
          height of the split area; on large screens the View panel is pinned
          to that exact height (it scrolls internally when longer). */}
      <div className="relative">
        <div className={cn("transition-all duration-300", viewingItem && "lg:w-7/12 lg:pr-3")}>
          <Card className="border-border/70 shadow-sm">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3">
              <div>
                <CardTitle className="font-display text-xl font-semibold">
                  ONBOARDING CHECKLIST
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Probationary checklist requirements
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search checklist..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 h-9 w-[140px] sm:w-[170px]"
                  />
                </div>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="h-9 w-[120px]">
                    <ArrowUpDown className="mr-2 h-3.5 w-3.5" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Recent</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col">
              <div ref={listScrollRef} className="-mr-2 overflow-y-auto pr-2">
                {loading ? (
                  <div className="flex h-full items-center justify-center py-12 text-center text-sm text-muted-foreground">
                    Loading your probationary onboarding checklist...
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="flex h-full items-center justify-center py-12 px-4 text-center text-sm text-muted-foreground">
                    {totalCount === 0
                      ? "No probationary onboarding checklist assigned yet — your HR admin will assign requirements once you start."
                      : "No checklist items match the current filter."}
                  </div>
                ) : (
                  <div className="divide-y divide-border/60">
                    {filteredItems.map((item) => (
                      <div key={item.id} data-checklist-row>
                        <EmployeeChecklistRow
                          item={item}
                          isSelected={viewingItem?.id === item.id}
                          onView={openViewPanel}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Split View of the specific checklist requirement —
            pinned to the checklist card's height on large screens */}
        {viewingItem && (
          <div className="mt-6 lg:absolute lg:inset-y-0 lg:left-[58.3333%] lg:right-0 lg:mt-0 lg:pl-3">
            <Card className="flex h-full flex-col border-border/70 shadow-md overflow-hidden">
              <CardHeader className="flex flex-row items-start justify-between pb-3 bg-muted/20 border-b border-border/60">
                <div className="space-y-1.5 pr-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className={
                        viewingItem.done
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-semibold"
                          : "bg-amber-500/10 text-amber-600 border-amber-500/30 font-semibold"
                      }
                    >
                      {viewingItem.done ? "Completed" : "Pending Action"}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Probationary
                    </Badge>
                  </div>
                  <CardTitle className="font-display text-lg font-bold leading-tight">
                    {viewingItem.title}
                  </CardTitle>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full cursor-pointer hover:bg-muted shrink-0"
                  onClick={() => {
                    setViewingItem(null);
                    setUploadFile(null);
                  }}
                  title="Close and expand checklist"
                  aria-label="Close task view"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>

              <CardContent className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
                {/* Instructions */}
                <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground leading-relaxed">
                  {viewingItem.instructions ||
                    "Please complete this requirement and upload the supporting document for HR verification."}
                </div>

                {/* Existing Uploaded Document */}
                {viewingItem.fileName && (
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileCheck2 className="h-5 w-5 text-emerald-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {viewingItem.fileName}
                        </p>
                        <p className="text-[11px] text-muted-foreground">{viewingItem.date}</p>
                      </div>
                    </div>
                    {viewingItem.fileUrl && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs cursor-pointer"
                        onClick={() => window.open(viewingItem.fileUrl, "_blank")}
                      >
                        <ExternalLink className="mr-1 h-3.5 w-3.5" /> View
                      </Button>
                    )}
                  </div>
                )}

                {/* Upload Dropzone / Placeholder — only when the checklist
                    item requires an upload; stretches to fill leftover
                    vertical space in the card */}
                {viewingItem.requiresUpload !== false && (
                  <div className="flex flex-1 flex-col gap-2">
                    <Label className="text-xs font-semibold">
                      {viewingItem.fileName
                        ? "Replace Attached Document"
                        : "Upload Document Requirement"}
                    </Label>
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragActive(true);
                      }}
                      onDragLeave={() => setDragActive(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragActive(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) setUploadFile(file);
                      }}
                      className={cn(
                        "relative flex min-h-[180px] flex-1 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors bg-card",
                        dragActive
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50",
                      )}
                    >
                      <Upload
                        className={cn(
                          "h-10 w-10 mb-2 transition-colors",
                          dragActive ? "text-primary" : "text-muted-foreground",
                        )}
                      />
                      <p className="text-xs font-medium text-foreground">
                        {uploadFile
                          ? uploadFile.name
                          : viewingItem.uploadPlaceholder || "Choose a file or drag & drop here"}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {dragActive
                          ? "Release to attach the file"
                          : "Drag & drop a file here, or click to browse — PDF, DOCX, PNG, JPG (up to 10MB)"}
                      </p>
                      <input
                        type="file"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setUploadFile(file);
                        }}
                      />
                    </div>
                    {uploadFile && (
                      <div className="flex items-center justify-between rounded-md bg-muted/40 p-2 text-xs">
                        <span className="truncate max-w-[220px]">
                          Selected: <strong>{uploadFile.name}</strong> (
                          {(uploadFile.size / 1024).toFixed(0)} KB)
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 cursor-pointer"
                          onClick={() => setUploadFile(null)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Optional Notes */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    Notes / Details{" "}
                    <span className="font-normal text-muted-foreground">(Optional)</span>
                  </Label>
                  <Textarea
                    value={uploadNotes}
                    onChange={(e) => setUploadNotes(e.target.value)}
                    placeholder="Provide any additional reference number or notes for HR..."
                    rows={3}
                    className="text-xs"
                  />
                </div>

                {/* Action Buttons — pinned to the bottom of the card */}
                <div className="mt-auto flex items-center justify-end gap-2 border-t border-border pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer text-xs h-9"
                    onClick={() => {
                      setViewingItem(null);
                      setUploadFile(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleTaskSubmit}
                    disabled={submitting}
                    className="cursor-pointer text-xs h-9"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Send className="mr-1.5 h-3.5 w-3.5" />{" "}
                        {uploadFile ? "Upload & Submit" : "Submit to HR"}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
