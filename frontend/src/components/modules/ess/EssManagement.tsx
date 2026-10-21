import { useState, useMemo, useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import {
  Award,
  ArrowRight,
  ArrowUpDown,
  BookOpen,
  Building,
  CheckCircle2,
  ChevronDown,
  CircleCheckBig,
  ClipboardList,
  Clock,
  Cog,
  Download,
  Eye,
  FileCheck,
  FileText,
  ListChecks,
  Lock,
  LockOpen,
  Paperclip,
  Plus,
  Search,
  Send,
  Settings2,
  Trash2,
  TrendingUp,
  Upload,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/portal/PageHeader";
import { ReportMenu } from "@/components/ui/report-menu";
import { TablePagination } from "@/components/ui/table-pagination";
import { StatCardsSkeleton, TableRowsSkeleton } from "@/components/ui/loading-skeletons";
import { usePagination } from "@/hooks/usePagination";
import { StatCard } from "@/components/portal/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  essRequests as seed,
  requestCategories,
  essActivityLog,
  essRequests,
  myAttendance,
  myBenefits,
  myLeaveBalances,
  myPayroll,
  myProfile,
  mySchedule,
  myPerformance,
  myLearningCourses,
  myEmployeeDocuments,
  wireframeActivity,
  useEssCategories,
  addCategoryEntry,
  updateCategoryEntry,
  removeCategoryEntry,
  setCategoryOpen,
  type ESSRequest,
} from "@/data/ess";
import { departments, employees } from "@/data/hr";
import { useSort, SortHead } from "@/components/portal/sortable";
import { ListBody } from "@/components/portal/ListBody";
import { ListEmptyState } from "@/components/portal/ListEmptyState";
import { EmployeeEss } from "./EmployeeEss";
import { ModuleQueuesPanel } from "./ModuleQueuesPanel";
import { essApi, type ApiEssRequestAttachment, type ApiEssRequestItem } from "@/lib/api";

type Status = ESSRequest["status"] | "Returned for Clarification";
type Row = Omit<ESSRequest, "status" | "note"> & {
  status: Status;
  note?: string | undefined;
  returnedCount?: number | undefined;
  dbId?: number | undefined;
  categoryCode?: string | undefined;
  attachments?: ApiEssRequestAttachment[] | undefined;
  hasFulfillment?: boolean | undefined;
  module?: string | null | undefined;
  moduleLabel?: string | null | undefined;
  moduleNote?: string | null | undefined;
  releasedAt?: string | null | undefined;
};

const statusClass: Record<Status, string> = {
  Pending: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  "Under Review": "bg-blue-500/10 text-blue-600 border-blue-500/30",
  "For Dispatch": "bg-sky-500/10 text-sky-600 border-sky-500/30",
  "With Module": "bg-indigo-500/10 text-indigo-600 border-indigo-500/30",
  "For Release": "bg-teal-500/10 text-teal-600 border-teal-500/30",
  Approved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  "For Fulfillment": "bg-indigo-500/10 text-indigo-600 border-indigo-500/30",
  Rejected: "bg-rose-500/10 text-rose-600 border-rose-500/30",
  Completed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  Cancelled: "bg-slate-500/10 text-slate-600 border-slate-500/30",
  "Returned for Clarification": "bg-orange-500/10 text-orange-600 border-orange-500/30",
};

/** Mirrors EssRequestWorkflow::requiresFulfillment for row-level UI choices. */
function requiresDocument(row: Row): boolean {
  const code = (row.categoryCode ?? "").toLowerCase();
  const category = (row.category ?? "").toLowerCase();
  const type = (row.type ?? "").toLowerCase();

  if (code === "ess-hrdoc" || code === "hr_document" || category.includes("document")) {
    return true;
  }

  return ["document", "certificate", "coe", "service record", "employment"].some((needle) =>
    type.includes(needle),
  );
}

const reportOptions = [
  "ESS Requests Summary",
  "Pending Requests by Department",
  "Approval Turnaround Time",
  "Returned Requests Analysis",
  "Branch Performance",
  "Approval Performance",
  "ESS Usage Statistics",
];

export function EssManagement({ role }: { role: "employee" | "admin" | "superadmin" }) {
  if (role === "employee") return <EmployeeEss />;
  return <AdminEssManagement role={role === "superadmin" ? "superadmin" : "admin"} />;
}

export function AdminEssManagement({ role }: { role: "superadmin" | "admin" }) {
  const [rows, setRows] = useState<Row[]>(seed);
  const [countsData, setCountsData] = useState<{
    total: number;
    pending: number;
    under_review: number;
    for_dispatch: number;
    with_module: number;
    for_release: number;
    approved: number;
    for_fulfillment: number;
    completed: number;
    rejected: number;
    returned: number;
    cancelled: number;
  }>({
    total: seed.length,
    pending: seed.filter((r) => r.status === "Pending").length,
    under_review: seed.filter((r) => r.status === "Under Review").length,
    for_dispatch: 0,
    with_module: 0,
    for_release: seed.filter((r) => r.status === "For Release" || r.status === "Approved").length,
    approved: seed.filter((r) => r.status === "Approved").length,
    for_fulfillment: 0,
    completed: seed.filter((r) => r.status === "Completed").length,
    rejected: seed.filter((r) => r.status === "Rejected").length,
    returned: seed.filter((r) => r.status === "Returned for Clarification").length,
    cancelled: 0,
  });

  const [loading, setLoading] = useState(true);
  const categories = useEssCategories();
  const [newCategory, setNewCategory] = useState<{
    name: string;
    description: string;
    types: string[];
  }>({
    name: "",
    description: "",
    types: [],
  });
  const [newTypeInput, setNewTypeInput] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{
    name: string;
    description: string;
    types: string[];
  }>({
    name: "",
    description: "",
    types: [],
  });
  const [editTypeInput, setEditTypeInput] = useState("");
  const [dept, setDept] = useState("all");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [reviewDecision, setReviewDecision] = useState<
    "Approved" | "Rejected" | "Returned for Clarification"
  >("Approved");
  const [reviewNote, setReviewNote] = useState("");
  const [reviewFile, setReviewFile] = useState<File | null>(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewStarting, setReviewStarting] = useState(false);
  const [confirmReject, setConfirmReject] = useState(false);
  const [fulfillRow, setFulfillRow] = useState<Row | null>(null);
  const [fulfillFile, setFulfillFile] = useState<File | null>(null);
  const [fulfillNote, setFulfillNote] = useState("");
  const [fulfilling, setFulfilling] = useState(false);
  const [bulkRejectOpen, setBulkRejectOpen] = useState(false);
  const [bulkRejectNote, setBulkRejectNote] = useState("");
  const [bulkRejecting, setBulkRejecting] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [behalfDept, setBehalfDept] = useState("all");
  const [behalfEmployeeId, setBehalfEmployeeId] = useState("");
  const [behalfCategory, setBehalfCategory] = useState("");
  const [behalfDetails, setBehalfDetails] = useState("");
  const [behalfOpen, setBehalfOpen] = useState(false);
  /** Collapsible new-category panel at the top of Category Management. */
  const [newCategoryOpen, setNewCategoryOpen] = useState(false);

  const [auditLogsList, setAuditLogsList] = useState<any[]>(essActivityLog);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await essApi.adminRequests();
      if (res?.requests && res.requests.length > 0) {
        setRows(
          res.requests.map((r: ApiEssRequestItem) => ({
            id: r.id,
            employee: r.employee || "Unknown Employee",
            employeeId: r.employeeId || "EMP-0000",
            department: r.department || "General",
            category: r.category,
            type: r.type,
            filed: r.filed,
            status: r.status as Status,
            assignedTo: r.assignedTo || r.assigned_to || "HR Admin",
            details: r.details,
            note: r.note ?? r.review_note ?? undefined,
            returnedCount: r.returnedCount ?? r.returned_count,
            dbId: r.db_id,
            categoryCode: r.category_code,
            attachments: r.attachments,
            hasFulfillment: r.has_fulfillment,
            module: r.module,
            moduleLabel: r.module_label,
            moduleNote: r.module_note,
            releasedAt: r.released_at,
          })),
        );
      }
      if (res?.counts) {
        setCountsData(res.counts);
      }
    } catch {
      // Keep local state on error
    } finally {
      setLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const res = await essApi.auditLogs();
      if (res?.logs?.length) {
        setAuditLogsList(res.logs);
      }
    } catch {
      // fallback to seed
    }
  };

  useEffect(() => {
    loadRequests();
    loadAuditLogs();
  }, []);

  const filtered = rows.filter((r) => {
    if (dept !== "all" && r.department?.toLowerCase() !== dept.toLowerCase()) return false;
    if (status !== "all" && r.status !== status) return false;
    if (category !== "all") {
      const rowCat = (r.category || "").toLowerCase();
      const selCat = category.toLowerCase();
      if (!rowCat.includes(selCat) && !selCat.includes(rowCat)) return false;
    }
    if (
      search &&
      !`${r.employee} ${r.type} ${r.id} ${r.details || ""}`.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const behalfEmployees = employees.filter(
    (e) => behalfDept === "all" || e.department === behalfDept,
  );

  type RowKey =
    "id" | "employee" | "department" | "category" | "type" | "filed" | "assignedTo" | "status";

  const {
    sort: rowSort,
    toggle: toggleRowSort,
    sorted: sortedFiltered,
  } = useSort<Row, RowKey>(filtered, {
    id: (r) => r.id,
    employee: (r) => r.employee,
    department: (r) => r.department,
    category: (r) => r.category,
    type: (r) => r.type,
    filed: (r) => r.filed,
    assignedTo: (r) => r.assignedTo,
    status: (r) => r.status,
  });

  const [logModule, setLogModule] = useState("all");
  const [logDept, setLogDept] = useState("all");
  const [logCategory, setLogCategory] = useState("all");
  const [logSearch, setLogSearch] = useState("");

  const logModules = Array.from(new Set(auditLogsList.map((l) => l.module)));
  const logCategories = Array.from(new Set(auditLogsList.map((l) => l.category)));

  const filteredLogs = auditLogsList.filter((l) => {
    if (logModule !== "all" && l.module !== logModule) return false;
    if (logDept !== "all" && l.department !== logDept) return false;
    if (logCategory !== "all" && l.category !== logCategory) return false;
    if (
      logSearch &&
      !`${l.user} ${l.action} ${l.requestId}`.toLowerCase().includes(logSearch.toLowerCase())
    )
      return false;
    return true;
  });

  type LogKey =
    "timestamp" | "user" | "action" | "module" | "category" | "department" | "requestId";

  const {
    sort: logSort,
    toggle: toggleLogSort,
    sorted: sortedLogs,
  } = useSort<(typeof auditLogsList)[number], LogKey>(filteredLogs, {
    timestamp: (l) => l.timestamp,
    user: (l) => l.user,
    action: (l) => l.action,
    module: (l) => l.module,
    category: (l) => l.category,
    department: (l) => l.department,
    requestId: (l) => l.requestId,
  });

  const requestPage = usePagination(sortedFiltered);
  const logPage = usePagination(sortedLogs);

  const bulk = async () => {
    if (selected.length === 0) return;
    try {
      await Promise.all(selected.map((id) => essApi.reviewRequest(id, "approve")));
      toast.success(`${selected.length} request(s) processed.`);
      setSelected([]);
      loadRequests();
      loadAuditLogs();
    } catch (err: any) {
      toast.error(err.message || "Some requests could not be approved.");
    }
  };

  const bulkReject = async () => {
    if (selected.length === 0) return;
    if (!bulkRejectNote.trim()) {
      toast.error("A reason for rejection is required.");
      return;
    }

    setBulkRejecting(true);
    try {
      await Promise.all(
        selected.map((id) => essApi.reviewRequest(id, "reject", bulkRejectNote.trim())),
      );
      toast.success(`${selected.length} request(s) rejected.`);
      setSelected([]);
      setBulkRejectOpen(false);
      setBulkRejectNote("");
      loadRequests();
      loadAuditLogs();
    } catch (err: any) {
      toast.error(err.message || "Some requests could not be rejected.");
    } finally {
      setBulkRejecting(false);
    }
  };

  const handleFileOnBehalf = async () => {
    if (!behalfEmployeeId) {
      toast.error("Please select an employee.");
      return;
    }
    if (!behalfCategory) {
      toast.error("Please select a request category.");
      return;
    }
    try {
      const empNum = parseInt(behalfEmployeeId.replace(/\D/g, ""), 10) || 1;
      await essApi.fileOnBehalf({
        employee_id: empNum,
        category_name: behalfCategory,
        request_type: `${behalfCategory} Request`,
        details: behalfDetails || "Filed by HR Administration on behalf of employee.",
      });
      toast.success("Request filed on behalf of employee successfully.");
      setBehalfOpen(false);
      setBehalfDetails("");
      loadRequests();
      loadAuditLogs();
    } catch (err: any) {
      toast.error(err.message || "Failed to file request on behalf.");
    }
  };

  const addCategory = () => {
    if (!newCategory.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    if (categories.some((c) => c.name.toLowerCase() === newCategory.name.trim().toLowerCase())) {
      toast.error("A category with this name already exists");
      return;
    }
    addCategoryEntry({
      name: newCategory.name.trim(),
      description: newCategory.description.trim(),
      types: newCategory.types,
    });
    setNewCategory({ name: "", description: "", types: [] });
    setNewTypeInput("");
    toast.success("Category added");
  };

  const addNewCategoryType = () => {
    const t = newTypeInput.trim();
    if (!t) return;
    if (newCategory.types.some((x) => x.toLowerCase() === t.toLowerCase())) {
      setNewTypeInput("");
      return;
    }
    setNewCategory((p) => ({ ...p, types: [...p.types, t] }));
    setNewTypeInput("");
  };

  const removeNewCategoryType = (t: string) =>
    setNewCategory((p) => ({ ...p, types: p.types.filter((x) => x !== t) }));

  const addEditCategoryType = () => {
    const t = editTypeInput.trim();
    if (!t) return;
    if (editDraft.types.some((x) => x.toLowerCase() === t.toLowerCase())) {
      setEditTypeInput("");
      return;
    }
    setEditDraft((p) => ({ ...p, types: [...p.types, t] }));
    setEditTypeInput("");
  };

  const removeEditCategoryType = (t: string) =>
    setEditDraft((p) => ({ ...p, types: p.types.filter((x) => x !== t) }));

  const startEditCategory = (c: { name: string; description: string; types: string[] }) => {
    setEditingCategory(c.name);
    setEditDraft({ name: c.name, description: c.description, types: [...c.types] });
    setEditTypeInput("");
  };

  const cancelEditCategory = () => setEditingCategory(null);

  const saveEditCategory = () => {
    if (!editingCategory) return;
    if (!editDraft.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    updateCategoryEntry(editingCategory, {
      name: editDraft.name.trim(),
      description: editDraft.description.trim(),
      types: editDraft.types,
    });
    if (category === editingCategory) setCategory(editDraft.name.trim());
    setEditingCategory(null);
    toast.success("Category updated");
  };

  const removeCategory = (name: string) => {
    removeCategoryEntry(name);
    if (category === name) setCategory("all");
    toast.success("Category removed");
  };

  const count = (s: Status) => {
    if (s === "Pending") return countsData.pending;
    if (s === "Under Review") return countsData.under_review;
    if (s === "For Dispatch") return countsData.for_dispatch;
    if (s === "With Module") return countsData.with_module;
    if (s === "For Release") return countsData.for_release;
    if (s === "Approved") return countsData.approved;
    if (s === "For Fulfillment") return countsData.for_fulfillment;
    if (s === "Completed") return countsData.completed;
    if (s === "Returned for Clarification") return countsData.returned;
    if (s === "Cancelled") return countsData.cancelled;
    return rows.filter((r) => r.status === s).length;
  };

  const buildEssReport = (reportName: string) => {
    const baseRows = sortedFiltered.map((r) => ({
      reference: r.id,
      employee: r.employee,
      department: r.department,
      category: r.category,
      type: r.type,
      filed: r.filed,
      assignedTo: r.assignedTo,
      status: r.status,
    }));
    return {
      title: reportName,
      subtitle: `Oxford Suites Makati HRMS · ${new Date().toLocaleDateString()} · Department: ${dept} | Status: ${status}`,
      columns: [
        { header: "Reference", key: "reference" },
        { header: "Employee", key: "employee" },
        { header: "Department", key: "department" },
        { header: "Category", key: "category" },
        { header: "Type", key: "type" },
        { header: "Filed", key: "filed" },
        { header: "Assigned To", key: "assignedTo" },
        { header: "Status", key: "status" },
      ],
      rows: baseRows,
      summary: [
        { label: "Total Requests", value: countsData.total },
        { label: "Pending", value: countsData.pending },
        { label: "Under Review", value: countsData.under_review },
        { label: "With Module", value: countsData.with_module },
        { label: "For Release", value: countsData.for_release },
        { label: "Completed", value: countsData.completed },
        { label: "Rows in Report", value: baseRows.length },
      ],
    };
  };

  const essReportOptions = (
    role === "superadmin"
      ? reportOptions
      : reportOptions.filter(
          (r) =>
            !["Branch Performance", "Approval Performance", "ESS Usage Statistics"].includes(r),
        )
  ).map((reportName) => ({
    id: reportName,
    title: reportName,
    build: () => buildEssReport(reportName),
    recordCount: sortedFiltered.length,
  }));

  const reviewRow = rows.find((r) => r.id === reviewId) ?? null;

  // Opening a review takes ownership: Pending is persisted as Under Review so
  // the employee's timeline reflects what actually happened.
  const openReview = async (id: string) => {
    const row = rows.find((r) => r.id === id);
    setReviewId(id);
    setReviewDecision("Approved");
    setReviewNote("");
    setReviewFile(null);
    setReviewSubmitting(false);
    setReviewStarting(false);
    setConfirmReject(false);

    if (row?.status === "Pending") {
      setReviewStarting(true);
      try {
        await essApi.reviewRequest(id, "start");
        setRows((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: "Under Review" } : r)),
        );
        loadAuditLogs();
      } catch (err: any) {
        toast.error(err.message || "Could not open this request for review.");
      } finally {
        setReviewStarting(false);
      }
    }
  };

  const openFulfill = (row: Row) => {
    setFulfillRow(row);
    setFulfillFile(null);
    setFulfillNote("");
  };

  const submitFulfill = async () => {
    if (!fulfillRow) return;
    if (!fulfillFile) {
      toast.error("Upload the document before completing this request.");
      return;
    }

    setFulfilling(true);
    try {
      const payload: { file: File; note?: string } = { file: fulfillFile };
      if (fulfillNote.trim()) payload.note = fulfillNote.trim();

      const res = await essApi.fulfillRequest(fulfillRow.id, payload);
      toast.success(
        res.message ||
          `${fulfillRow.id} released — the employee can now download the document.`,
      );
      setFulfillRow(null);
      setFulfillFile(null);
      setFulfillNote("");
      loadRequests();
      loadAuditLogs();
    } catch (err: any) {
      toast.error(err.message || "Failed to attach the document.");
    } finally {
      setFulfilling(false);
    }
  };

  const quickApprove = async (row: Row) => {
    try {
      const res = await essApi.reviewRequest(row.id, "approve");
      toast.success(res.message || `${row.id} approved.`);
      loadRequests();
      loadAuditLogs();
    } catch (err: any) {
      toast.error(err.message || "Failed to approve request.");
    }
  };

  /** Manual release: the only action that makes module output visible. */
  const releaseRow = async (row: Row) => {
    if (!window.confirm(`Release ${row.id} to ${row.employee}?`)) return;

    try {
      const res = await essApi.releaseRequest(row.id);
      toast.success(res.message || `${row.id} released to the employee.`);
      loadRequests();
      loadAuditLogs();
    } catch (err: any) {
      toast.error(err.message || "Failed to release request.");
    }
  };

  /** Send the request to another module; applied results are reversed. */
  const rerouteRow = async (row: Row) => {
    const module = window.prompt(
      "Send to module (erm, attendance, payroll, performance):",
      row.module || "erm",
    );

    if (!module) return;

    const normalized = module.trim().toLowerCase();
    if (!["erm", "attendance", "payroll", "performance"].includes(normalized)) {
      toast.error("Unknown module. Use erm, attendance, payroll or performance.");
      return;
    }

    try {
      const res = await essApi.rerouteRequest(row.id, normalized);
      toast.success(res.message || `${row.id} rerouted.`);
      loadRequests();
      loadAuditLogs();
    } catch (err: any) {
      toast.error(err.message || "Failed to reroute request.");
    }
  };

  const submitReview = async () => {
    if (!reviewRow) return;
    if (reviewDecision !== "Approved" && !reviewNote.trim()) {
      toast.error(
        reviewDecision === "Rejected"
          ? "A reason for rejection is required"
          : "Add a note explaining what clarification is needed",
      );
      return;
    }
    if (reviewDecision === "Rejected" && !confirmReject) {
      setConfirmReject(true);
      return;
    }

    setReviewSubmitting(true);
    const decision =
      reviewDecision === "Rejected"
        ? "reject"
        : reviewDecision === "Returned for Clarification"
          ? "return"
          : "approve";

    try {
      const res = await essApi.reviewRequest(
        reviewRow.id,
        decision,
        reviewNote.trim() || undefined,
        decision === "approve" ? reviewFile : null,
      );
      toast.success(res.message || `${reviewRow.id} updated.`);
      setReviewId(null);
      setReviewFile(null);
      setConfirmReject(false);
      loadRequests();
      loadAuditLogs();
    } catch (err: any) {
      toast.error(err.message || "Failed to update request status.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="ESS Management"
        description="Monitor, process and configure employee self-service requests."
        actions={<ReportMenu size="sm" reports={essReportOptions} />}
      />

      {loading ? (
        <StatCardsSkeleton count={6} />
      ) : (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard
          label="Total Requests"
          value={rows.length}
          icon={ClipboardList}
          tone="primary"
          onClick={() => setStatus("all")}
        />
        <StatCard
          label="Pending"
          value={count("Pending")}
          icon={ClipboardList}
          tone="caution"
          onClick={() => setStatus("Pending")}
        />
        <StatCard
          label="Under Review"
          value={count("Under Review")}
          icon={Eye}
          tone="gold"
          onClick={() => setStatus("Under Review")}
        />
        <StatCard
          label="With Module"
          value={count("With Module")}
          icon={Send}
          tone="gold"
          onClick={() => setStatus("With Module")}
        />
        <StatCard
          label="For Release"
          value={count("For Release")}
          icon={Upload}
          tone="gold"
          onClick={() => setStatus("For Release")}
        />
        <StatCard
          label="Completed"
          value={count("Completed")}
          icon={CircleCheckBig}
          onClick={() => setStatus("Completed")}
        />
      </div>
      )}

      <Tabs defaultValue="requests" className="mt-6">
        <TabsList>
          <TabsTrigger className="flex items-center gap-1.5" value="requests">
            <ListChecks className="h-3.5 w-3.5" /> Request Queue
          </TabsTrigger>
          <TabsTrigger className="flex items-center gap-1.5" value="modules">
            <ClipboardList className="h-3.5 w-3.5" /> Module Queues
          </TabsTrigger>
          <TabsTrigger className="flex items-center gap-1.5" value="learning">
            <BookOpen className="h-3.5 w-3.5" /> Learning
          </TabsTrigger>
          {role === "superadmin" && (
            <TabsTrigger className="flex items-center gap-1.5" value="config">
              <Settings2 className="h-3.5 w-3.5" /> ESS Administration
            </TabsTrigger>
          )}
          {role === "superadmin" && (
            <TabsTrigger className="flex items-center gap-1.5" value="audit">
              <FileCheck className="h-3.5 w-3.5" /> Audit &amp; Compliance
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="requests" className="mt-4">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
                  <Send className="h-5 w-5 text-primary" /> Employee Requests
                </h2>
                <div className="grid w-full grid-cols-2 items-center gap-2 md:flex md:w-auto md:flex-wrap md:justify-end [&_input]:w-full [&_button[role=combobox]]:w-full md:[&_button[role=combobox]]:w-44">
                  <div className="relative col-span-2 w-full min-w-0 md:col-span-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      placeholder="Search employee or request…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <Select value={dept} onValueChange={setDept}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
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
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      {[
                        "Pending",
                        "Under Review",
                        "Returned for Clarification",
                        "For Dispatch",
                        "With Module",
                        "For Release",
                        "Rejected",
                        "Completed",
                        "Cancelled",
                      ].map((s) => (
                        <SelectItem key={s} value={s}>
                          {s === "Returned for Clarification" ? "Returned" : s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.name} value={c.name}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {role === "superadmin" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-success/40 bg-success/10 text-success hover:bg-success/20 hover:text-success"
                        disabled={selected.length === 0}
                        onClick={() => void bulk()}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Bulk approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
                        disabled={selected.length === 0}
                        onClick={() => setBulkRejectOpen(true)}
                      >
                        <XCircle className="mr-2 h-4 w-4" /> Bulk reject
                      </Button>
                    </>
                  )}

                  <Dialog open={behalfOpen} onOpenChange={setBehalfOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" /> Create on behalf
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="font-display text-2xl">
                          Create Request on Behalf of Employee
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label>Department</Label>
                          <Select value={behalfDept} onValueChange={setBehalfDept}>
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
                          <Label>Employee</Label>
                          <Select value={behalfEmployeeId} onValueChange={setBehalfEmployeeId}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select employee" />
                            </SelectTrigger>
                            <SelectContent>
                              {behalfEmployees.map((e) => (
                                <SelectItem key={e.id} value={e.id}>
                                  {e.name} — {e.department}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Request category</Label>
                          <Select value={behalfCategory} onValueChange={setBehalfCategory}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((c) => (
                                <SelectItem key={c.name} value={c.name}>
                                  {c.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Details</Label>
                          <Textarea
                            rows={3}
                            value={behalfDetails}
                            onChange={(e) => setBehalfDetails(e.target.value)}
                            placeholder={
                              categories.find((c) => c.name === behalfCategory)?.description ||
                              "Walk-in / phone request details…"
                            }
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleFileOnBehalf}>
                          File request
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="mt-4 overflow-x-auto">
                <ListBody>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {role === "superadmin" && <TableHead className="w-10" />}
                        <SortHead sortKey="id" sort={rowSort} onSort={toggleRowSort}>
                          Request
                        </SortHead>
                        <SortHead sortKey="employee" sort={rowSort} onSort={toggleRowSort}>
                          Employee
                        </SortHead>
                        <SortHead sortKey="type" sort={rowSort} onSort={toggleRowSort}>
                          Category / Type
                        </SortHead>
                        <SortHead sortKey="filed" sort={rowSort} onSort={toggleRowSort}>
                          Filed
                        </SortHead>
                        <SortHead sortKey="assignedTo" sort={rowSort} onSort={toggleRowSort}>
                          Assigned To
                        </SortHead>
                        <SortHead sortKey="status" sort={rowSort} onSort={toggleRowSort}>
                          Status
                        </SortHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading && <TableRowsSkeleton cols={8} rows={6} />}
                      {!loading &&
                        requestPage.pageItems.map((r) => (
                        <TableRow key={r.id}>
                          {role === "superadmin" && (
                            <TableCell>
                              <Checkbox
                                checked={selected.includes(r.id)}
                                disabled={!["Pending", "Under Review"].includes(r.status)}
                                title={
                                  ["Pending", "Under Review"].includes(r.status)
                                    ? "Select for bulk action"
                                    : "Only pending/review requests can be bulk processed"
                                }
                                onCheckedChange={() =>
                                  setSelected((p) =>
                                    p.includes(r.id) ? p.filter((x) => x !== r.id) : [...p, r.id],
                                  )
                                }
                              />
                            </TableCell>
                          )}
                          <TableCell className="text-xs font-medium">{r.id}</TableCell>
                          <TableCell className="text-sm">
                            <p>{r.employee}</p>
                            <p className="text-xs text-muted-foreground">{r.department}</p>
                          </TableCell>
                          <TableCell className="text-sm">
                            <p>{r.type}</p>
                            <p className="text-xs text-muted-foreground">{r.category}</p>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{r.filed}</TableCell>
                          <TableCell className="text-xs">{r.assignedTo}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusClass[r.status]}>
                              {r.status === "Returned for Clarification" ? "Returned" : r.status}
                            </Badge>
                            {r.moduleLabel && (
                              <p className="mt-1 text-[11px] text-muted-foreground">
                                {r.moduleLabel}
                              </p>
                            )}
                            {r.status === "Under Review" && r.moduleNote && (
                              <p
                                className="mt-1 max-w-[180px] truncate text-[11px] text-amber-600"
                                title={r.moduleNote}
                              >
                                Declined: {r.moduleNote}
                              </p>
                            )}
                            {(r.returnedCount ?? 0) > 1 && (
                              <p className="mt-1 text-[11px] text-caution">
                                Returned {r.returnedCount}×
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-1">
                              {r.status === "Returned for Clarification" ? (
                                <span className="text-xs text-muted-foreground">
                                  Awaiting employee response
                                </span>
                              ) : r.status === "Pending" || r.status === "Under Review" ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-success/40 bg-success/10 text-success hover:bg-success/20 hover:text-success"
                                    title="Approve"
                                    onClick={() => void quickApprove(r)}
                                  >
                                    <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
                                    title="Reject (opens review — a reason is required)"
                                    onClick={() => {
                                      void openReview(r.id);
                                      setReviewDecision("Rejected");
                                    }}
                                  >
                                    <XCircle className="mr-2 h-4 w-4" /> Reject
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => void openReview(r.id)}
                                  >
                                    <Eye className="mr-2 h-4 w-4" /> Review
                                  </Button>
                                  {r.status === "Under Review" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      title="Send to a different module"
                                      onClick={() => void rerouteRow(r)}
                                    >
                                      Reroute
                                    </Button>
                                  )}
                                </>
                              ) : r.status === "For Release" ? (
                                <>
                                  {requiresDocument(r) && !r.hasFulfillment ? (
                                    <Button
                                      size="sm"
                                      className="bg-primary text-primary-foreground"
                                      onClick={() => openFulfill(r)}
                                    >
                                      <Upload className="mr-2 h-4 w-4" /> Attach &amp; release
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      className="bg-primary text-primary-foreground"
                                      onClick={() => void releaseRow(r)}
                                    >
                                      <Send className="mr-2 h-4 w-4" /> Release
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => void rerouteRow(r)}
                                  >
                                    Reroute
                                  </Button>
                                </>
                              ) : r.status === "For Dispatch" || r.status === "With Module" ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">
                                    {r.status === "For Dispatch"
                                      ? `Dispatching to ${r.moduleLabel ?? "module"}`
                                      : `${r.moduleLabel ?? "Module"} is processing`}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => void rerouteRow(r)}
                                  >
                                    Reroute
                                  </Button>
                                </div>
                              ) : r.status === "For Fulfillment" ? (
                                <Button
                                  size="sm"
                                  className="bg-primary text-primary-foreground"
                                  onClick={() => openFulfill(r)}
                                >
                                  <Upload className="mr-2 h-4 w-4" /> Fulfill / Upload
                                </Button>
                              ) : (
                                <span className="text-xs text-muted-foreground">Closed</span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {!loading && requestPage.pageItems.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={role === "superadmin" ? 8 : 7} className="py-8">
                            <ListEmptyState placeholder="Search employee or request…" />
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ListBody>
                <TablePagination
                  page={requestPage.page}
                  pageCount={requestPage.pageCount}
                  from={requestPage.from}
                  to={requestPage.to}
                  total={requestPage.total}
                  label="requests"
                  showRangeLabel={false}
                  onPageChange={requestPage.setPage}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="modules" className="mt-4">
          <ModuleQueuesPanel
            onChanged={() => {
              loadRequests();
              loadAuditLogs();
            }}
          />
        </TabsContent>
        <TabsContent value="learning" className="mt-4">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">
                Learning management is not available in this build.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        {role === "superadmin" && (
          <TabsContent value="config" className="mt-4">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-border/70">
                <CardContent className="p-6">
                  <div>
                    <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
                      <Cog className="h-5 w-5 text-primary" /> Category Management
                    </h2>
                  </div>
                  <div className="mt-3 rounded-md border border-dashed border-border">
                    <button
                      type="button"
                      onClick={() => setNewCategoryOpen((v) => !v)}
                      aria-expanded={newCategoryOpen}
                      className="flex w-full cursor-pointer items-center justify-between gap-2 p-3 text-left"
                    >
                      <span className="flex items-center gap-1.5 text-sm font-medium">
                        <ListChecks className="h-3.5 w-3.5" /> New category
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-muted-foreground transition-transform ${newCategoryOpen ? "rotate-180" : ""
                          }`}
                      />
                    </button>
                    {newCategoryOpen && (
                      <div className="space-y-2 border-t border-border/70 p-3">
                        <Input
                          className="h-8 text-sm"
                          value={newCategory.name}
                          onChange={(e) => setNewCategory((p) => ({ ...p, name: e.target.value }))}
                          placeholder="Category name"
                        />
                        <Textarea
                          rows={2}
                          className="text-xs"
                          value={newCategory.description}
                          onChange={(e) =>
                            setNewCategory((p) => ({ ...p, description: e.target.value }))
                          }
                          placeholder="Optional description — shown to employees as placeholder text"
                        />
                        <div className="space-y-1.5">
                          <Label className="text-[0.7rem]">Request types</Label>
                          <div className="flex flex-wrap gap-1.5">
                            {newCategory.types.map((t) => (
                              <Badge key={t} variant="secondary" className="gap-1 text-[0.65rem]">
                                {t}
                                <button
                                  type="button"
                                  aria-label={`Remove ${t}`}
                                  onClick={() => removeNewCategoryType(t)}
                                  className="ml-0.5 rounded-full hover:text-destructive"
                                >
                                  <XCircle className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                            {newCategory.types.length === 0 && (
                              <span className="text-[0.65rem] text-muted-foreground">
                                No types yet
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1.5">
                            <Input
                              className="h-7 text-xs"
                              value={newTypeInput}
                              onChange={(e) => setNewTypeInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  addNewCategoryType();
                                }
                              }}
                              placeholder="Add a request type"
                            />
                            <Button size="sm" variant="outline" onClick={addNewCategoryType}>
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        <Button size="sm" onClick={addCategory}>
                          <Plus className="mr-2 h-3.5 w-3.5" /> Add category
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 space-y-1.5">
                    {categories.map((c) =>
                      editingCategory === c.name ? (
                        <div
                          key={c.name}
                          className="space-y-2 rounded-md border border-primary/40 bg-primary/5 p-2.5"
                        >
                          <Input
                            className="h-8 text-sm"
                            value={editDraft.name}
                            onChange={(e) => setEditDraft((p) => ({ ...p, name: e.target.value }))}
                            placeholder="Category name"
                          />
                          <Textarea
                            rows={2}
                            className="text-xs"
                            value={editDraft.description}
                            onChange={(e) =>
                              setEditDraft((p) => ({ ...p, description: e.target.value }))
                            }
                            placeholder="Optional description shown to employees"
                          />
                          <div className="space-y-1.5">
                            <Label className="text-[0.7rem]">Request types</Label>
                            <div className="flex flex-wrap gap-1.5">
                              {editDraft.types.map((t) => (
                                <Badge key={t} variant="secondary" className="gap-1 text-[0.65rem]">
                                  {t}
                                  <button
                                    type="button"
                                    aria-label={`Remove ${t}`}
                                    onClick={() => removeEditCategoryType(t)}
                                    className="ml-0.5 rounded-full hover:text-destructive"
                                  >
                                    <XCircle className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                              {editDraft.types.length === 0 && (
                                <span className="text-[0.65rem] text-muted-foreground">
                                  No types yet
                                </span>
                              )}
                            </div>
                            <div className="flex gap-1.5">
                              <Input
                                className="h-7 text-xs"
                                value={editTypeInput}
                                onChange={(e) => setEditTypeInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    addEditCategoryType();
                                  }
                                }}
                                placeholder="Add a request type"
                              />
                              <Button size="sm" variant="outline" onClick={addEditCategoryType}>
                                <Plus className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={cancelEditCategory}>
                              Cancel
                            </Button>
                            <Button size="sm" onClick={saveEditCategory}>
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div
                          key={c.name}
                          className={`flex flex-wrap items-center justify-between gap-2 rounded-md border p-2.5 ${c.open === false ? "border-border bg-muted/40" : "border-border"
                            }`}
                        >
                          <div className="min-w-0">
                            <p className="flex items-center gap-1.5 text-sm font-medium">
                              <span className="truncate">{c.name}</span>
                              {(c as any).custom && (
                                <Badge variant="secondary" className="shrink-0 text-[0.6rem]">
                                  Custom
                                </Badge>
                              )}
                              {c.open === false && (
                                <Badge
                                  variant="outline"
                                  className="shrink-0 border-destructive/30 bg-destructive/10 text-[0.6rem] text-destructive"
                                >
                                  Closed
                                </Badge>
                              )}
                            </p>
                            <p className="truncate text-[0.7rem] text-muted-foreground">
                              {c.description || "No description"}
                            </p>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {c.types.length > 0 ? (
                                c.types.map((t) => (
                                  <Badge
                                    key={t}
                                    variant="outline"
                                    className="text-[0.6rem] font-normal"
                                  >
                                    {t}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-[0.6rem] text-muted-foreground">
                                  No request types
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label={`Edit ${c.name}`}
                              onClick={() => startEditCategory(c)}
                            >
                              <Settings2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className={c.open === false ? "text-destructive" : "text-success"}
                              aria-label={
                                c.open === false
                                  ? `Open ${c.name} for requests`
                                  : `Close ${c.name} for requests`
                              }
                              title={
                                c.open === false
                                  ? "Closed — click to accept new requests"
                                  : "Open — click to stop accepting new requests"
                              }
                              onClick={() => {
                                const next = c.open === false;
                                setCategoryOpen(c.name, next);
                                toast.success(
                                  next ? `${c.name} opened` : `${c.name} closed for new requests`,
                                );
                              }}
                            >
                              {c.open === false ? (
                                <Lock className="h-3.5 w-3.5" />
                              ) : (
                                <LockOpen className="h-3.5 w-3.5" />
                              )}
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-destructive"
                              aria-label={`Remove ${c.name}`}
                              onClick={() => removeCategory(c.name)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/70">
                <CardContent className="space-y-5 p-6">
                  <div>
                    <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
                      <Settings2 className="h-5 w-5 text-primary" />
                      Request Management Settings
                    </h2>
                  </div>

                  <div className="space-y-2">
                    <Label>Approval levels</Label>
                    <Select defaultValue="2">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Single level (HR Officer)</SelectItem>
                        <SelectItem value="2">Two levels (Supervisor → HR)</SelectItem>
                        <SelectItem value="3">Three levels (Supervisor → HR → GM)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>SLA — first response (hrs)</Label>
                      <Input type="number" defaultValue={8} />
                    </div>
                    <div className="space-y-2">
                      <Label>SLA — resolution (hrs)</Label>
                      <Input type="number" defaultValue={48} />
                    </div>
                  </div>
                  {[
                    "Auto-assign by department",
                    "Escalate on SLA breach",
                    "Auto-close requests resolved for 7 days",
                    "Email notifications",
                    "In-system notifications",
                    "Require attachment for leave with pay",
                  ].map((s) => (
                    <div key={s} className="flex items-center justify-between">
                      <span className="text-sm">{s}</span>
                      <Switch defaultChecked />
                    </div>
                  ))}
                  <Button onClick={() => toast.success("ESS configuration saved")}>
                    <Cog className="mr-2 h-4 w-4" /> Save configuration
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {role === "superadmin" && (
          <TabsContent value="audit" className="mt-4">
            <Card className="border-border/70">
              <CardContent className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
                    <Clock className="h-5 w-5 text-primary" /> ESS Activity Log
                  </h2>
                  <div className="grid w-full grid-cols-2 items-center gap-2 md:flex md:w-auto md:flex-wrap md:justify-end [&_input]:w-full [&_button[role=combobox]]:w-full md:[&_button[role=combobox]]:w-44">
                    <div className="relative col-span-2 w-full min-w-0 md:col-span-1 md:w-64">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        className="pl-9"
                        placeholder="Search user, action, request…"
                        value={logSearch}
                        onChange={(e) => setLogSearch(e.target.value)}
                      />
                    </div>
                    <Select value={logModule} onValueChange={setLogModule}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="All modules" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All modules</SelectItem>
                        {logModules.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={logDept} onValueChange={setLogDept}>
                      <SelectTrigger className="w-48">
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
                    <Select value={logCategory} onValueChange={setLogCategory}>
                      <SelectTrigger className="w-44">
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All categories</SelectItem>
                        {logCategories.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-4 overflow-x-auto">
                  <ListBody>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <SortHead sortKey="timestamp" sort={logSort} onSort={toggleLogSort}>
                            Timestamp
                          </SortHead>
                          <SortHead sortKey="user" sort={logSort} onSort={toggleLogSort}>
                            User
                          </SortHead>
                          <SortHead sortKey="action" sort={logSort} onSort={toggleLogSort}>
                            Action
                          </SortHead>
                          <SortHead sortKey="module" sort={logSort} onSort={toggleLogSort}>
                            Module
                          </SortHead>
                          <SortHead sortKey="category" sort={logSort} onSort={toggleLogSort}>
                            Category / Type
                          </SortHead>
                          <SortHead sortKey="department" sort={logSort} onSort={toggleLogSort}>
                            Department
                          </SortHead>
                          <SortHead sortKey="requestId" sort={logSort} onSort={toggleLogSort}>
                            Request ID
                          </SortHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading && <TableRowsSkeleton cols={7} rows={5} />}
                        {!loading && logPage.pageItems.map((a) => (
                          <TableRow key={a.id}>
                            <TableCell className="text-xs">{a.timestamp}</TableCell>
                            <TableCell className="text-xs">{a.user}</TableCell>
                            <TableCell className="text-sm">{a.action}</TableCell>
                            <TableCell className="text-xs">{a.module}</TableCell>
                            <TableCell className="text-xs">{a.category}</TableCell>
                            <TableCell className="text-xs">{a.department}</TableCell>
                            <TableCell className="text-xs font-medium">{a.requestId}</TableCell>
                          </TableRow>
                        ))}
                        {!loading && logPage.pageItems.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={7} className="py-8">
                              <ListEmptyState placeholder="Search user, action, request…" />
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </ListBody>
                  <TablePagination
                    page={logPage.page}
                    pageCount={logPage.pageCount}
                    from={logPage.from}
                    to={logPage.to}
                    total={logPage.total}
                    label="log entries"
                    showRangeLabel={false}
                    onPageChange={logPage.setPage}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={reviewId !== null} onOpenChange={(open) => !open && setReviewId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              Review Request {reviewRow?.id}
            </DialogTitle>
          </DialogHeader>
          {reviewRow && (
            <div className="space-y-4">
              <div className="rounded-md border border-border p-3 text-sm">
                <p>
                  <span className="text-muted-foreground">Employee:</span> {reviewRow.employee} (
                  {reviewRow.department})
                </p>
                <p>
                  <span className="text-muted-foreground">Request:</span> {reviewRow.type} —{" "}
                  {reviewRow.category}
                </p>
                <p>
                  <span className="text-muted-foreground">Filed:</span> {reviewRow.filed}
                </p>
                {reviewRow.note && (
                  <p className="mt-1 text-xs text-muted-foreground">Note: {reviewRow.note}</p>
                )}
              </div>

              {(reviewRow.attachments?.length ?? 0) > 0 && (
                <div className="space-y-2 rounded-md border border-border bg-muted/20 p-3 text-xs">
                  <p className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-muted-foreground">
                    <Paperclip className="h-3.5 w-3.5 text-primary" /> Files on this request
                  </p>
                  {(reviewRow.attachments ?? []).map((a) => {
                    const href = reviewRow.dbId
                      ? essApi.adminRequestAttachmentUrl(reviewRow.dbId, a.id)
                      : undefined;
                    return (
                      <div
                        key={a.id}
                        className="flex items-center justify-between gap-2 rounded-md border border-border/60 bg-background px-2.5 py-2"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-foreground">
                            {a.original_name || "Attachment"}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {a.direction === "hr" ? "Provided by HR" : "Attached by employee"}
                          </p>
                        </div>
                        {a.has_file && href ? (
                          <a
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            className="shrink-0 text-xs text-primary hover:underline"
                          >
                            View
                          </a>
                        ) : (
                          <span className="shrink-0 text-[11px] text-muted-foreground">
                            Unavailable
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="space-y-2">
                <Label>Decision</Label>
                <RadioGroup
                  value={reviewDecision}
                  onValueChange={(v) => {
                    setReviewDecision(v as typeof reviewDecision);
                    setConfirmReject(false);
                  }}
                  className="gap-2"
                >
                  {(
                    [
                      {
                        value: "Approved",
                        id: "decision-approve",
                        label: "Approve",
                        active: "border-success/50 bg-success/10",
                      },
                      {
                        value: "Returned for Clarification",
                        id: "decision-clarify",
                        label: "Request clarification",
                        active: "border-primary/50 bg-primary/10",
                      },
                      {
                        value: "Rejected",
                        id: "decision-reject",
                        label: "Reject",
                        active: "border-destructive/50 bg-destructive/10",
                      },
                    ] as const
                  ).map((o) => (
                    <label
                      key={o.value}
                      htmlFor={o.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors ${reviewDecision === o.value ? o.active : "border-border hover:bg-muted/50"
                        }`}
                    >
                      <RadioGroupItem value={o.value} id={o.id} className="mt-0.5" />
                      <span>
                        <span className="block text-sm font-medium">{o.label}</span>
                      </span>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>
                  {reviewDecision === "Rejected"
                    ? "Reason for rejection (required)"
                    : reviewDecision === "Returned for Clarification"
                      ? "What do you need from the employee? (required)"
                      : "Note (optional)"}
                </Label>
                <Textarea
                  rows={3}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder={
                    reviewDecision === "Returned for Clarification"
                      ? "e.g. Please attach the medical certificate for 12–13 Aug."
                      : reviewDecision === "Rejected"
                        ? "e.g. Leave credits are insufficient for the requested dates."
                        : "Add remarks for the audit trail…"
                  }
                />
                {reviewDecision !== "Approved" && reviewNote.trim() && (
                  <div className="rounded-md border border-dashed border-border p-2.5">
                    <p className="eyebrow">Employee will see</p>
                    <p className="mt-1 text-xs text-muted-foreground">{reviewNote}</p>
                  </div>
                )}
              </div>

              {reviewDecision === "Approved" && requiresDocument(reviewRow) && (
                <div className="space-y-2 rounded-md border border-dashed border-primary/40 bg-primary/5 p-3">
                  <Label htmlFor="review-document">
                    Attach the requested document now (optional)
                  </Label>
                  <Input
                    id="review-document"
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    onChange={(e) => setReviewFile(e.target.files?.[0] ?? null)}
                  />
                  <p className="text-xs text-muted-foreground">
                    If you skip this, the request is dispatched to the owning module (Employee
                    Records for documents). It comes back here as <strong>For Release</strong> and
                    only then can you release it to the employee.
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewId(null)}>
              Cancel
            </Button>
            <Button
              variant={reviewDecision === "Rejected" ? "destructive" : "default"}
              onClick={submitReview}
              disabled={reviewSubmitting || reviewStarting}
            >
              {reviewDecision === "Rejected"
                ? confirmReject
                  ? "Confirm rejection"
                  : "Reject request"
                : reviewDecision === "Returned for Clarification"
                  ? "Return to employee"
                  : reviewFile
                    ? "Approve & release"
                    : reviewRow && requiresDocument(reviewRow)
                      ? "Approve → Dispatch"
                      : "Approve request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkRejectOpen} onOpenChange={setBulkRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              Reject {selected.length} request{selected.length === 1 ? "" : "s"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="bulk-reject-reason">
              Reason for rejection <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="bulk-reject-reason"
              rows={4}
              value={bulkRejectNote}
              onChange={(e) => setBulkRejectNote(e.target.value)}
              placeholder="Explain why these requests are being rejected. Every employee will see this note."
            />
            <p className="text-xs text-muted-foreground">
              This reason is written to each request's timeline and shown to the employee.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkRejectOpen(false)}
              disabled={bulkRejecting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => void bulkReject()}
              disabled={bulkRejecting || !bulkRejectNote.trim()}
            >
              {bulkRejecting ? "Rejecting…" : "Confirm rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!fulfillRow} onOpenChange={(open) => !open && setFulfillRow(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              Fulfill {fulfillRow?.id}
            </DialogTitle>
          </DialogHeader>
          {fulfillRow && (
            <div className="space-y-4">
              <div className="rounded-md border border-border bg-muted/30 p-3 text-sm">
                <p className="font-medium">{fulfillRow.employee}</p>
                <p className="text-xs text-muted-foreground">
                  {fulfillRow.type} · {fulfillRow.category}
                </p>
                {fulfillRow.details && (
                  <p className="mt-1 text-xs text-muted-foreground">{fulfillRow.details}</p>
                )}
              </div>

              {(fulfillRow.attachments?.length ?? 0) > 0 && (
                <div className="space-y-2 rounded-md border border-border bg-muted/20 p-3 text-xs">
                  <p className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-muted-foreground">
                    <Paperclip className="h-3.5 w-3.5 text-primary" /> Files already on this request
                  </p>
                  {(fulfillRow.attachments ?? []).map((a) => (
                    <div key={a.id} className="flex items-center justify-between gap-2">
                      <span className="truncate">{a.original_name || "Attachment"}</span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {a.direction === "hr" ? "HR" : "Employee"}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="fulfill-document">
                  Document to release <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fulfill-document"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  onChange={(e) => setFulfillFile(e.target.files?.[0] ?? null)}
                />
                <p className="text-xs text-muted-foreground">
                  The employee is notified and can download this file from their Request Center.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fulfill-note">Note to employee (optional)</Label>
                <Textarea
                  id="fulfill-note"
                  rows={3}
                  value={fulfillNote}
                  onChange={(e) => setFulfillNote(e.target.value)}
                  placeholder="Attached your Certificate of Employment as requested."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setFulfillRow(null)} disabled={fulfilling}>
              Cancel
            </Button>
            <Button onClick={() => void submitFulfill()} disabled={fulfilling || !fulfillFile}>
              <Upload className="mr-2 h-4 w-4" />
              {fulfilling ? "Uploading…" : "Complete & notify"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
