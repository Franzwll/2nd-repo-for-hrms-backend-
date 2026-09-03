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
  Plus,
  RotateCcw,
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
import { TablePagination } from "@/components/ui/table-pagination";
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
import { essApi, type ApiEssRequestItem } from "@/lib/api";

type Status = ESSRequest["status"] | "Returned for Clarification";
type Row = Omit<ESSRequest, "status" | "note"> & {
  status: Status;
  note?: string | undefined;
  returnedCount?: number | undefined;
};

const statusClass: Record<Status, string> = {
  Pending: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  "Under Review": "bg-blue-500/10 text-blue-600 border-blue-500/30",
  Approved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  Rejected: "bg-rose-500/10 text-rose-600 border-rose-500/30",
  Completed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  "Returned for Clarification": "bg-orange-500/10 text-orange-600 border-orange-500/30",
};

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
    approved: number;
    completed: number;
    rejected: number;
    returned: number;
  }>({
    total: seed.length,
    pending: seed.filter((r) => r.status === "Pending").length,
    under_review: seed.filter((r) => r.status === "Under Review").length,
    approved: seed.filter((r) => r.status === "Approved").length,
    completed: seed.filter((r) => r.status === "Completed").length,
    rejected: seed.filter((r) => r.status === "Rejected").length,
    returned: seed.filter((r) => (r.returnedCount ?? 0) > 0).length,
  });

  const [loading, setLoading] = useState(false);
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
  const [confirmReject, setConfirmReject] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
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
            note: r.note,
            returnedCount: r.returnedCount,
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

  const setReqStatus = async (id: string, s: Status, note?: string | undefined) => {
    try {
      await essApi.updateRequestStatus(id, { status: s, note });
      loadRequests();
      loadAuditLogs();
    } catch {
      setRows((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
              ...r,
              status: s,
              note,
              returnedCount:
                s === "Returned for Clarification" ? (r.returnedCount ?? 0) + 1 : r.returnedCount,
            }
            : r,
        ),
      );
    }
  };

  const bulk = async (s: Status) => {
    try {
      await Promise.all(selected.map((id) => essApi.updateRequestStatus(id, { status: s })));
      toast.success(`${selected.length} request(s) ${s.toLowerCase()}`);
      setSelected([]);
      loadRequests();
      loadAuditLogs();
    } catch {
      setRows((prev) => prev.map((r) => (selected.includes(r.id) ? { ...r, status: s } : r)));
      toast.success(`${selected.length} request(s) ${s.toLowerCase()}`);
      setSelected([]);
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
    if (s === "Approved") return countsData.approved;
    if (s === "Completed") return countsData.completed;
    if (s === "Returned for Clarification") return countsData.returned;
    return rows.filter((r) => r.status === s).length;
  };

  const reviewRow = rows.find((r) => r.id === reviewId) ?? null;

  // Opening a review takes ownership: Pending auto-promotes to Under Review.
  const openReview = (id: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id && r.status === "Pending" ? { ...r, status: "Under Review" } : r,
      ),
    );
    setReviewId(id);
    setReviewDecision("Approved");
    setReviewNote("");
    setConfirmReject(false);
  };

  // Employee answered a returned request → back into the reviewer's queue.
  const employeeReplied = (id: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: "Under Review", note: "Employee submitted clarification" }
          : r,
      ),
    );
    toast.success(`${id} returned to review queue`);
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

    try {
      await essApi.updateRequestStatus(reviewRow.id, {
        status: reviewDecision,
        note: reviewNote.trim() || undefined,
      });
      toast.success(
        reviewDecision === "Returned for Clarification"
          ? `${reviewRow.id} returned to the employee`
          : `${reviewRow.id} marked as ${reviewDecision.toLowerCase()}`,
      );
      setReviewId(null);
      setConfirmReject(false);
      loadRequests();
      loadAuditLogs();
    } catch (err: any) {
      toast.error(err.message || "Failed to update request status.");
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow={role === "superadmin" ? "Super Admin · Core HR" : "Admin · Core HR"}
        title="ESS Management"
        description={
          role === "superadmin"
            ? "Organization-wide monitoring, bulk processing, workflow and policy configuration."
            : "Process, approve and track employee self-service requests for your departments."
        }
        actions={
          <Button size="sm" variant="outline" onClick={() => setReportsOpen(true)}>
            <FileText className="mr-2 h-4 w-4" /> Generate reports
          </Button>
        }
      />

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
          label="Returned"
          value={count("Returned for Clarification")}
          icon={RotateCcw}
          hint="Awaiting employee response"
          onClick={() => setStatus("Returned for Clarification")}
        />
        <StatCard
          label="Approved"
          value={count("Approved")}
          icon={CheckCircle2}
          tone="success"
          onClick={() => setStatus("Approved")}
        />
        <StatCard
          label="Completed"
          value={count("Completed")}
          icon={CircleCheckBig}
          onClick={() => setStatus("Completed")}
        />
      </div>

      <Tabs defaultValue="requests" className="mt-6">
        <TabsList className="flex h-auto flex-wrap justify-start">
          <TabsTrigger className="flex items-center gap-1.5" value="requests">
            <ListChecks className="h-3.5 w-3.5" /> Request Queue
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
                <div className="flex flex-wrap gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="w-56 pl-9"
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
                        "Approved",
                        "Rejected",
                        "Completed",
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
                        onClick={() => bulk("Approved")}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Bulk approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
                        disabled={selected.length === 0}
                        onClick={() => bulk("Rejected")}
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
                      {requestPage.pageItems.map((r) => (
                        <TableRow key={r.id}>
                          {role === "superadmin" && (
                            <TableCell>
                              <Checkbox
                                checked={selected.includes(r.id)}
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
                            {r.status === "Returned for Clarification" && (
                              <p className="mt-1 text-[11px] text-muted-foreground">
                                Awaiting employee response
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
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => employeeReplied(r.id)}
                                >
                                  <RotateCcw className="mr-2 h-4 w-4" /> Employee replied
                                </Button>
                              ) : r.status === "Pending" || r.status === "Under Review" ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-success/40 bg-success/10 text-success hover:bg-success/20 hover:text-success"
                                    title="Approve"
                                    onClick={() => {
                                      setReqStatus(r.id, "Approved");
                                      toast.success(`${r.id} approved`);
                                    }}
                                  >
                                    <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
                                    title="Reject (opens review — a reason is required)"
                                    onClick={() => {
                                      openReview(r.id);
                                      setReviewDecision("Rejected");
                                    }}
                                  >
                                    <XCircle className="mr-2 h-4 w-4" /> Reject
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openReview(r.id)}
                                  >
                                    <Eye className="mr-2 h-4 w-4" /> Review
                                  </Button>
                                </>
                              ) : (
                                <span className="text-xs text-muted-foreground">Closed</span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {requestPage.pageItems.length === 0 && (
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
                  onPageChange={requestPage.setPage}
                />
              </div>
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
                    <p className="text-xs text-muted-foreground">
                      Create, edit and remove ESS request categories. Description shows to employees
                      as the request-form placeholder.
                    </p>
                  </div>
                  <div className="mt-3 rounded-md border border-dashed border-border">
                    <button
                      type="button"
                      onClick={() => setNewCategoryOpen((v) => !v)}
                      aria-expanded={newCategoryOpen}
                      className="flex w-full cursor-pointer items-center justify-between gap-2 p-3 text-left"
                    >
                      <span className="eyebrow flex items-center gap-1.5">
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
                    <p className="text-xs text-muted-foreground">
                      Intake rules, approval routing, SLA and notifications applied to every open
                      category.
                    </p>
                  </div>

                  <div className="rounded-md border border-border p-3">
                    <p className="eyebrow">Intake</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {categories.filter((c) => c.open !== false).length} of {categories.length}{" "}
                      categories are open for new requests. Close a category in the list to stop
                      accepting requests without deleting it.
                    </p>
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
                  <div className="grid grid-cols-2 gap-3">
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
                  <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        className="w-56 pl-9"
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
                        {logPage.pageItems.map((a) => (
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
                        {logPage.pageItems.length === 0 && (
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
                        help: "Employee is notified and the request is finalised.",
                        active: "border-success/50 bg-success/10",
                      },
                      {
                        value: "Returned for Clarification",
                        id: "decision-clarify",
                        label: "Request clarification",
                        help: "Sent back to the employee — they can edit and resubmit the same request.",
                        active: "border-primary/50 bg-primary/10",
                      },
                      {
                        value: "Rejected",
                        id: "decision-reject",
                        label: "Reject",
                        help: "Request is closed permanently; the employee must file a new one.",
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
                        <span className="block text-xs text-muted-foreground">{o.help}</span>
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

              {confirmReject && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                  Rejecting closes this request permanently. Press “Confirm rejection” to continue,
                  or switch to “Request clarification” if the employee can still fix it.
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
            >
              {reviewDecision === "Rejected"
                ? confirmReject
                  ? "Confirm rejection"
                  : "Reject request"
                : reviewDecision === "Returned for Clarification"
                  ? "Return to employee"
                  : "Approve request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={reportsOpen} onOpenChange={setReportsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Generate Reports</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {(role === "superadmin"
              ? reportOptions
              : reportOptions.filter(
                (r) =>
                  ![
                    "Branch Performance",
                    "Approval Performance",
                    "ESS Usage Statistics",
                  ].includes(r),
              )
            ).map((r) => (
              <div
                key={r}
                className="flex items-center justify-between rounded-md border border-border p-3"
              >
                <span className="text-sm">{r}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    toast.success(`${r} generated`);
                    setReportsOpen(false);
                  }}
                >
                  Generate
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
