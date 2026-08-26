import { useEffect, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  BadgeCheck,
  Clock,
  Download,
  FileText,
  FolderOpen,
  History,
  Pencil,
  Minus,
  Plus,
  Printer,
  Search,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/portal/PageHeader";
import { ListBody } from "@/components/portal/ListBody";
import { ListEmptyState } from "@/components/portal/ListEmptyState";
import { SortHead, useSort } from "@/components/portal/sortable";
import { StatCard } from "@/components/portal/StatCard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Employee } from "@/data/hr";
import { TablePagination } from "@/components/ui/table-pagination";

import { auditLogApi, hcmApi, type ApiAuditLog, type ApiEmployee } from "@/lib/api";
import {
  getEmployeeByCode,
  getRecordDetail,
  refreshRoster,
  toUiEmployee,
  useRecordDetail,
  useRoster,
} from "@/lib/employeerecords";
import { usePagination } from "@/hooks/usePagination";

const documentTypes = [
  "Certificate of Employment (COE)",
  "Certificate of Compensation",
  "Service Record",
  "Employment Verification Letter",
  "Certificate of Training Completion",
  "Clearance Certificate",
];

const reportTypes = [
  "Employee Masterlist Report",
  "Headcount by Department Report",
  "Employment Status Report",
  "Tenure & Regularization Report",
  "New Hire & Turnover Report",
  "Record Completion & Compliance Report",
];

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

type GeneratedDoc = {
  id: string;
  employeeName: string;
  docType: string;
  generatedAt: string;
};

type RecordLog = {
  id: string;
  timestamp: string;
  actor: string;
  action: "Added" | "Edited" | "Deleted";
  target: string;
  department: string;
  notes: string;
};

function mapAuditToRecordLog(l: ApiAuditLog): RecordLog {
  const lower = l.action.toLowerCase();
  const action: RecordLog["action"] =
    lower.includes("creat") || lower.includes("add")
      ? "Added"
      : lower.includes("delet") || lower.includes("remov")
        ? "Deleted"
        : "Edited";
  const timestamp = l.timestamp
    ? l.timestamp.replace("T", " ").slice(0, 16)
    : (l.occurred_at ?? "");
  return {
    id: `LOG-${l.audit_log_id}`,
    timestamp,
    actor: l.user,
    action,
    target: l.target_id ? `${l.target_id} · ${l.action}` : l.action,
    department: l.department || "—",
    notes: l.details ?? "",
  };
}

type HistoryEntry = {
  id: string;
  type: "Promotion" | "Transfer" | "Employment";
  date: string;
  detail: string;
};

type Profile = {
  birthDate: string;
  civilStatus: string;
  gender: string;
  nationality: string;
  address: string;
  personalEmail: string;
  family: string;
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelation: string;
  sss: string;
  pagibig: string;
  philhealth: string;
  tin: string;
  contract: string;
  certificates: string[];
  licenses: string[];
  medical: string[];
  missing: string[];
};

/** One row in the 201 file Documents tab. */
type ProfileDoc = { name: string; status: "Submitted" | "Missing"; file?: string | undefined };

/** True when a record's last-updated date is older than the configured threshold. */
function olderThanYears(dateStr: string, years: number, now: Date = new Date()) {
  const t = new Date(dateStr).getTime();
  if (Number.isNaN(t)) return false;
  return now.getTime() - t >= years * 365.25 * 24 * 60 * 60 * 1000;
}

function lastUpdatedForEmployee(code: string): string {
  return getEmployeeByCode(code)?.employee_record_last_updated_at ?? "";
}

function classifyDocuments(api: ApiEmployee | undefined) {
  const certificates: string[] = [];
  const licenses: string[] = [];
  const medical: string[] = [];
  const missing: string[] = [];
  for (const d of api?.documents ?? []) {
    const cat = d.category.toLowerCase();
    if (d.document_status !== "Submitted") {
      missing.push(d.title);
    } else if (cat.includes("medical") || cat.includes("onboard") || cat.includes("exam")) {
      medical.push(d.title);
    } else if (
      cat.includes("license") ||
      cat.includes("clearance") ||
      cat.includes("permit") ||
      cat.includes("government") ||
      cat.includes("tax") ||
      cat.includes("id")
    ) {
      licenses.push(d.title);
    } else {
      certificates.push(d.title);
    }
  }
  return { certificates, licenses, medical, missing };
}

export function buildProfile(e: Employee): Profile {
  const api = getRecordDetail(e.id) ?? getEmployeeByCode(e.id);
  const emergency =
    api?.emergency_contacts?.find((c) => c.is_primary) ?? api?.emergency_contacts?.[0];
  const { certificates, licenses, medical, missing } = classifyDocuments(api);
  return {
    birthDate: api?.birth_date ?? "",
    civilStatus: api?.civil_status ?? "",
    gender: api?.gender ?? "",
    nationality: api?.nationality ?? "",
    address: api?.address ?? "",
    personalEmail: api?.personal_email ?? "",
    family: emergency ? `${emergency.relationship}: ${emergency.name}` : "—",
    emergencyName: emergency?.name ?? "—",
    emergencyPhone: emergency?.phone ?? "",
    emergencyRelation: emergency?.relationship ?? "—",
    sss: api?.sss_number ?? "",
    pagibig: api?.pagibig_number ?? "",
    philhealth: api?.philhealth_number ?? "",
    tin: api?.tin_number ?? "",
    contract: `${e.employmentType} Employment Contract · signed ${e.dateHired}`,
    certificates,
    licenses,
    medical,
    missing,
  };
}

function mapChangeType(t: string): HistoryEntry["type"] {
  if (/promot|regular/.test(t)) return "Promotion";
  if (/transfer|exit|relocat/.test(t)) return "Transfer";
  return "Employment";
}

function buildHistory(e: Employee): HistoryEntry[] {
  const detail = getRecordDetail(e.id);
  const rows = detail?.position_history ?? [];
  if (rows.length) {
    return rows.map((h) => ({
      id: `PH-${h.position_history_id}`,
      type: mapChangeType(h.change_type),
      date: h.effective_date ?? "",
      detail: h.notes ?? h.change_type,
    }));
  }
  return [
    {
      id: `${e.id}-H1`,
      type: "Employment",
      date: e.dateHired,
      detail: `Hired as ${e.position} (${e.department})`,
    },
  ];
}

const emptyEmployee = {
  name: "",
  position: "",
  department: "Front Office",
  employmentType: "Probationary" as Employee["employmentType"],
  dateHired: new Date().toISOString().slice(0, 10),
  email: "",
  phone: "",
  supervisor: "",
};

export function EmployeeRecords({ role }: { role: "superadmin" | "admin" }) {
  const isSuper = role === "superadmin";

  const roster = useRoster();
  const [list, setList] = useState<Employee[]>([]);

  useEffect(() => {
    setList(roster.employees.map(toUiEmployee));
  }, [roster.employees]);

  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("all");
  const [typeFilter, setTypeFilter] = useState<"all" | Employee["employmentType"]>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | Employee["status"]>("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [profileId, setProfileId] = useState<string | null>(null);
  const recordDetail = useRecordDetail(profileId);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [docType, setDocType] = useState(documentTypes[0]!);
  const [generatedDocs, setGeneratedDocs] = useState<GeneratedDoc[]>([]);
  const [generatedOpen, setGeneratedOpen] = useState(false);
  const [logSearch, setLogSearch] = useState("");
  const [logDept, setLogDept] = useState("all");
  const [recordLogs, setRecordLogs] = useState<RecordLog[]>([]);

  useEffect(() => {
    let cancelled = false;
    auditLogApi
      .list({ per_page: 200, module: "Employee Records" })
      .then((res) => {
        if (!cancelled) setRecordLogs((res.data ?? []).map(mapAuditToRecordLog));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const [archivedIds, setArchivedIds] = useState<string[]>([]);

  /** Auto-archive records untouched for 10+ years once the roster loads. */
  useEffect(() => {
    if (!roster.loaded) return;
    const auto = roster.employees
      .filter((e) => olderThanYears(e.employee_record_last_updated_at ?? "", 10))
      .map((e) => e.employee_code);
    setArchivedIds((prev) => Array.from(new Set([...prev, ...auto])));
  }, [roster.loaded, roster.employees]);
  const [listView, setListView] = useState<"active" | "archived">("active");
  const [form, setForm] = useState(emptyEmployee);
  const [history, setHistory] = useState<Record<string, HistoryEntry[]>>({});
  const [newHistory, setNewHistory] = useState({
    type: "Promotion" as HistoryEntry["type"],
    date: new Date().toISOString().slice(0, 10),
    detail: "",
  });
  const [profileTab, setProfileTab] = useState("personal");
  const [historyFormOpen, setHistoryFormOpen] = useState(false);
  const [editingHistoryId, setEditingHistoryId] = useState<string | null>(null);
  const [editHistory, setEditHistory] = useState<{
    type: HistoryEntry["type"];
    date: string;
    detail: string;
  }>({ type: "Promotion", date: "", detail: "" });
  const [logAction, setLogAction] = useState("all");
  const [bulkPickOpen, setBulkPickOpen] = useState(false);
  const [bulkTypes, setBulkTypes] = useState<string[]>([documentTypes[0]!]);
  /** Auto-archive threshold in years — configurable by the HR admin. */
  const [archiveYears, setArchiveYears] = useState("10");
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archiveDraft, setArchiveDraft] = useState("10");
  const [manualArchived, setManualArchived] = useState<string[]>([]);
  const [docsById, setDocsById] = useState<Record<string, ProfileDoc[]>>({});
  const [docDialog, setDocDialog] = useState<{
    mode: "add" | "edit";
    index: number;
    name: string;
    file: string;
  } | null>(null);

  const profile = list.find((e) => e.id === profileId) ?? null;
  useRecordDetail(profileId);

  const filtered = list.filter((e) => {
    const archived = archivedIds.includes(e.id);
    if (listView === "archived" ? !archived : archived) return false;
    if (dept !== "all" && e.department !== dept) return false;
    if (typeFilter !== "all" && e.employmentType !== typeFilter) return false;
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    if (search && !`${e.name} ${e.position} ${e.id}`.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const employeeSort = useSort<
    Employee,
    "employee" | "position" | "department" | "type" | "dateHired" | "status"
  >(filtered, {
    employee: (e) => e.name,
    position: (e) => e.position,
    department: (e) => e.department,
    type: (e) => e.employmentType,
    dateHired: (e) => e.dateHired,
    status: (e) => (archivedIds.includes(e.id) ? "Archived" : e.status),
  });

  const logSort = useSort<
    RecordLog,
    "timestamp" | "actor" | "action" | "target" | "department" | "notes"
  >(
    recordLogs.filter(
      (l) =>
        (logAction === "all" || l.action === logAction) &&
        (logDept === "all" || l.department === logDept) &&
        `${l.actor} ${l.target} ${l.notes}`.toLowerCase().includes(logSearch.toLowerCase()),
    ),
    {
      timestamp: (l) => l.timestamp,
      actor: (l) => l.actor,
      action: (l) => l.action,
      target: (l) => l.target,
      department: (l) => l.department,
      notes: (l) => l.notes,
    },
  );

  const employeePage = usePagination(employeeSort.sorted);
  const logPage = usePagination(logSort.sorted);

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const historyFor = (e: Employee) => history[e.id] ?? buildHistory(e);

  const addHistory = () => {
    if (!profile || !newHistory.detail.trim()) {
      toast.error("Enter the history details");
      return;
    }
    const entry: HistoryEntry = {
      id: `${profile.id}-${Date.now()}`,
      type: newHistory.type,
      date: newHistory.date,
      detail: newHistory.detail,
    };
    setHistory((h) => ({ ...h, [profile.id]: [...historyFor(profile), entry] }));
    setNewHistory({ ...newHistory, detail: "" });
    toast.success("History record created");
  };

  const deleteHistory = (id: string) => {
    if (!profile) return;
    setHistory((h) => ({
      ...h,
      [profile.id]: historyFor(profile).filter((x) => x.id !== id),
    }));
    toast.success("History record deleted");
  };

  const startEditHistory = (h: HistoryEntry) => {
    setEditingHistoryId(h.id);
    setEditHistory({ type: h.type, date: h.date, detail: h.detail });
  };

  const saveEditHistory = () => {
    if (!profile || !editingHistoryId) return;
    if (!editHistory.detail.trim()) {
      toast.error("Enter the history details");
      return;
    }
    setHistory((h) => ({
      ...h,
      [profile.id]: historyFor(profile).map((x) =>
        x.id === editingHistoryId ? { ...x, ...editHistory } : x,
      ),
    }));
    setEditingHistoryId(null);
    toast.success("History record updated");
  };

  const createEmployee = async () => {
    if (!form.name.trim() || !form.position.trim()) {
      toast.error("Name and position are required");
      return;
    }
    const nameParts = form.name.trim().split(" ");
    const dept = roster.departments.find((d) => d.name === form.department);
    const pos = roster.positions.find(
      (p) => p.title.toLowerCase() === form.position.trim().toLowerCase(),
    );
    if (!dept) {
      toast.error("Department not found");
      return;
    }
    if (!pos) {
      toast.error("Position not found — create it under Core HCM first");
      return;
    }
    const supervisor =
      form.supervisor && form.supervisor !== "—"
        ? (roster.employees.find((e) => e.full_name === form.supervisor)?.employee_id ?? null)
        : null;
    try {
      const res = await hcmApi.employees.create({
        first_name: nameParts[0] ?? "",
        last_name: (nameParts.slice(1).join(" ") || nameParts[0]) ?? "",
        email: form.email,
        phone: form.phone,
        department_id: dept.department_id,
        position_id: pos.position_id,
        supervisor_employee_id: supervisor,
        employment_type: form.employmentType,
        status: "Active",
        date_hired: form.dateHired,
      });
      setList((prev) => [toUiEmployee(res.data), ...prev]);
      setForm(emptyEmployee);
      setAddOpen(false);
      refreshRoster();
      toast.success(`${res.data.full_name} added to employee records`);
    } catch (e: any) {
      toast.error(e?.message ?? "Could not create employee record");
    }
  };

  const removeEmployee = async (id: string) => {
    const api = getEmployeeByCode(id);
    if (api && (api.status === "Active" || api.status === "On Leave")) {
      toast.error("Use the exit process to off-board an active employee");
      return;
    }
    try {
      if (api) await hcmApi.employees.remove(api.employee_id);
      setList((prev) => prev.filter((e) => e.id !== id));
      setProfileId(null);
      refreshRoster();
      toast.success("Employee record deleted");
    } catch (e: any) {
      toast.error(e?.message ?? "Could not delete employee record");
    }
  };

  const archiveEmployee = (id: string) => {
    setManualArchived((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setArchivedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    toast.success("Record moved to Archived");
  };

  const restoreEmployee = (id: string) => {
    setManualArchived((prev) => prev.filter((x) => x !== id));
    setArchivedIds((prev) => prev.filter((x) => x !== id));
    toast.success("Record restored to active list");
  };

  /** Re-runs auto-archiving with a new retention threshold. */
  const applyArchiveYears = (years: string) => {
    setArchiveYears(years);
    const auto = roster.employees
      .filter((e) => olderThanYears(e.employee_record_last_updated_at ?? "", Number(years)))
      .map((e) => e.employee_code);
    setArchivedIds(Array.from(new Set([...manualArchived, ...auto])));
    toast.success(`Auto-archiving records inactive for ${years}+ years`);
  };

  /** Documents currently on a 201 file (from the DB, then edited in place). */
  const docsFor = (emp: Employee): ProfileDoc[] => {
    const existing = docsById[emp.id];
    if (existing) return existing;
    const detail = getRecordDetail(emp.id);
    if (detail?.documents?.length) {
      return detail.documents.map((d) => ({
        name: d.title,
        status: d.document_status === "Submitted" ? ("Submitted" as const) : ("Missing" as const),
        file: d.file_path ?? undefined,
      }));
    }
    const p = buildProfile(emp);
    return [
      ...p.certificates.map((d) => ({ name: d, status: "Submitted" as const })),
      ...p.licenses.map((d) => ({ name: d, status: "Submitted" as const })),
      ...p.medical.map((d) => ({ name: d, status: "Submitted" as const })),
      ...p.missing.map((d) => ({ name: d, status: "Missing" as const })),
    ];
  };

  const setDocs = (empId: string, next: ProfileDoc[]) =>
    setDocsById((prev) => ({ ...prev, [empId]: next }));

  const saveDoc = () => {
    if (!profile || !docDialog) return;
    const name = docDialog.name.trim();
    if (!name) {
      toast.error("Document name is required");
      return;
    }
    const current = docsFor(profile);
    if (docDialog.mode === "add") {
      setDocs(profile.id, [
        ...current,
        { name, status: "Submitted", file: docDialog.file || undefined },
      ]);
      toast.success("Document added to 201 file");
    } else {
      setDocs(
        profile.id,
        current.map((d, i) =>
          i === docDialog.index
            ? { ...d, name, status: "Submitted", file: docDialog.file || d.file }
            : d,
        ),
      );
      toast.success("Document updated");
    }
    setDocDialog(null);
  };

  const removeDoc = (index: number) => {
    if (!profile) return;
    setDocs(
      profile.id,
      docsFor(profile).filter((_, i) => i !== index),
    );
    toast.success("Document removed");
  };

  const printRecord = () => {
    if (!profile) return;
    toast.success(`Preparing ${profile.name}'s record for printing…`);
    window.print();
  };

  return (
    <div>
      <PageHeader
        eyebrow={isSuper ? "Super Admin · Core HR" : "Admin · Core HR"}
        title="Employee Records"
        description="201 files, employment details, records analytics and document generation."
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => setBulkOpen(true)}>
              <FileText className="mr-2 h-4 w-4" /> Generate reports
            </Button>
          </div>
        }
      />

      <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Employees"
          value={list.length}
          icon={Users}
          tone="primary"
          onClick={() => {
            setTypeFilter("all");
            setStatusFilter("all");
          }}
        />
        <StatCard
          label="Regular"
          value={list.filter((e) => e.employmentType === "Regular").length}
          icon={BadgeCheck}
          tone="success"
          onClick={() => {
            setTypeFilter("Regular");
            setStatusFilter("all");
          }}
        />
        <StatCard
          label="Probationary"
          value={list.filter((e) => e.employmentType === "Probationary").length}
          icon={Clock}
          tone="gold"
          onClick={() => {
            setTypeFilter("Probationary");
            setStatusFilter("all");
          }}
        />
        <StatCard
          label="Inactive"
          value={list.filter((e) => e.status === "Inactive").length}
          icon={Users}
          tone="caution"
          onClick={() => {
            setStatusFilter("Inactive");
            setTypeFilter("all");
          }}
        />
      </div>

      <Tabs defaultValue="list" className="mt-6">
        <TabsList className="flex h-auto flex-wrap justify-start">
          <TabsTrigger className="flex items-center gap-1.5" value="list">
            <Users className="h-3.5 w-3.5" /> Employee List
          </TabsTrigger>
          <TabsTrigger className="flex items-center gap-1.5" value="history">
            <History className="h-3.5 w-3.5" /> Record History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
                    <Users className="h-5 w-5 text-primary" /> Employee List
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {listView === "archived"
                      ? "Records inactive/unmodified for 10+ years (DOLE/BIR retention). Hidden from the default list."
                      : selected.length > 0
                        ? `${selected.length} selected for bulk generation.`
                        : "Select employees to generate documents in bulk."}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="w-56 pl-9"
                      placeholder="Search employee…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <Select value={dept} onValueChange={setDept}>
                    <SelectTrigger className="w-52">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All departments</SelectItem>
                      {roster.departments.map((d) => (
                        <SelectItem key={d.code} value={d.name}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={listView}
                    onValueChange={(v) => setListView(v as "active" | "archived")}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active records</SelectItem>
                      <SelectItem value="archived">
                        Archived ({archiveYears}+ years) · {archivedIds.length}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    title={`Auto-archive settings (${archiveYears}+ years)`}
                    aria-label="Auto-archive settings"
                    onClick={() => {
                      setArchiveDraft(archiveYears);
                      setArchiveOpen(true);
                    }}
                  >
                    <Archive className="h-4 w-4" />
                  </Button>

                  {listView === "active" && (
                    <>
                      <Button
                        size="sm"
                        disabled={selected.length === 0}
                        onClick={() => {
                          setBulkTypes([documentTypes[0]!]);
                          setBulkPickOpen(true);
                        }}
                      >
                        <Download className="mr-2 h-4 w-4" /> Bulk generate
                      </Button>
                      <Button size="sm" onClick={() => setAddOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Add employee
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-4 overflow-x-auto">
                <ListBody>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10" />
                        <SortHead
                          sortKey="employee"
                          sort={employeeSort.sort}
                          onSort={employeeSort.toggle}
                        >
                          Employee
                        </SortHead>
                        <SortHead
                          sortKey="position"
                          sort={employeeSort.sort}
                          onSort={employeeSort.toggle}
                        >
                          Position
                        </SortHead>
                        <SortHead
                          sortKey="department"
                          sort={employeeSort.sort}
                          onSort={employeeSort.toggle}
                        >
                          Department
                        </SortHead>
                        <SortHead
                          sortKey="type"
                          sort={employeeSort.sort}
                          onSort={employeeSort.toggle}
                        >
                          Type
                        </SortHead>
                        <SortHead
                          sortKey="dateHired"
                          sort={employeeSort.sort}
                          onSort={employeeSort.toggle}
                        >
                          Date Hired
                        </SortHead>
                        <SortHead
                          sortKey="status"
                          sort={employeeSort.sort}
                          onSort={employeeSort.toggle}
                        >
                          Status
                        </SortHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employeePage.pageItems.map((e) => (
                        <TableRow key={e.id}>
                          <TableCell>
                            <Checkbox
                              checked={selected.includes(e.id)}
                              onCheckedChange={() => toggle(e.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-secondary text-[0.7rem]">
                                  {initials(e.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{e.name}</p>
                                <p className="text-xs text-muted-foreground">{e.id}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{e.position}</TableCell>
                          <TableCell className="text-sm">{e.department}</TableCell>
                          <TableCell className="text-xs">{e.employmentType}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {e.dateHired}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <Badge
                                variant="outline"
                                className={
                                  e.status === "Active"
                                    ? "border-success/30 bg-success/15 text-success"
                                    : "border-muted-foreground/30 bg-muted text-muted-foreground"
                                }
                              >
                                {e.status}
                              </Badge>
                              {archivedIds.includes(e.id) && (
                                <Badge
                                  variant="outline"
                                  className="border-gold/40 bg-gold-soft text-foreground"
                                  title={`Last updated ${lastUpdatedForEmployee(e.id)}`}
                                >
                                  Archived · since {lastUpdatedForEmployee(e.id)}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-wrap items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setProfileId(e.id);
                                  setProfileTab("personal");
                                  setHistoryFormOpen(false);
                                }}
                              >
                                <FolderOpen className="mr-2 h-3.5 w-3.5" /> View Records
                              </Button>
                              {isSuper &&
                                (archivedIds.includes(e.id) ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => restoreEmployee(e.id)}
                                  >
                                    <ArchiveRestore className="mr-2 h-3.5 w-3.5" /> Restore
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => archiveEmployee(e.id)}
                                  >
                                    <Archive className="mr-2 h-3.5 w-3.5" /> Archive
                                  </Button>
                                ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ListBody>
              </div>
              <TablePagination
                page={employeePage.page}
                pageCount={employeePage.pageCount}
                from={employeePage.from}
                to={employeePage.to}
                total={employeePage.total}
                label="employees"
                onPageChange={employeePage.setPage}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
                    <History className="h-5 w-5 text-primary" /> Record History
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Log of who added, edited, or deleted employee records and files.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="w-64 pl-9"
                      placeholder="Search logs…"
                      value={logSearch}
                      onChange={(e) => setLogSearch(e.target.value)}
                    />
                  </div>
                  <Select value={logDept} onValueChange={setLogDept}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All departments</SelectItem>
                      {roster.departments.map((d) => (
                        <SelectItem key={d.code} value={d.name}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={logAction} onValueChange={setLogAction}>
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="All actions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All actions</SelectItem>
                      <SelectItem value="Added">Added</SelectItem>
                      <SelectItem value="Edited">Edited</SelectItem>
                      <SelectItem value="Deleted">Deleted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4 overflow-x-auto">
                <ListBody>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <SortHead sortKey="timestamp" sort={logSort.sort} onSort={logSort.toggle}>
                          Timestamp
                        </SortHead>
                        <SortHead sortKey="actor" sort={logSort.sort} onSort={logSort.toggle}>
                          Actor
                        </SortHead>
                        <SortHead sortKey="action" sort={logSort.sort} onSort={logSort.toggle}>
                          Action
                        </SortHead>
                        <SortHead sortKey="department" sort={logSort.sort} onSort={logSort.toggle}>
                          Department
                        </SortHead>
                        <SortHead sortKey="target" sort={logSort.sort} onSort={logSort.toggle}>
                          Target Record / File
                        </SortHead>
                        <SortHead sortKey="notes" sort={logSort.sort} onSort={logSort.toggle}>
                          Notes
                        </SortHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logPage.pageItems.map((l) => (
                        <TableRow key={l.id}>
                          <TableCell className="text-xs text-muted-foreground">
                            {l.timestamp}
                          </TableCell>
                          <TableCell className="text-sm">{l.actor}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                l.action === "Added"
                                  ? "border-success/30 bg-success/15 text-success"
                                  : l.action === "Edited"
                                    ? "border-gold/40 bg-gold-soft text-foreground"
                                    : "border-destructive/30 bg-destructive/15 text-destructive"
                              }
                            >
                              {l.action}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{l.department}</TableCell>
                          <TableCell className="text-sm">{l.target}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{l.notes}</TableCell>
                        </TableRow>
                      ))}
                      {logPage.pageItems.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="py-8">
                            <ListEmptyState placeholder="Search actor, target, notes…" />
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ListBody>
              </div>
              <TablePagination
                page={logPage.page}
                pageCount={logPage.pageCount}
                from={logPage.from}
                to={logPage.to}
                total={logPage.total}
                label="log entries"
                onPageChange={logPage.setPage}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AUTO-ARCHIVE SETTINGS */}
      <Dialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Auto-archive settings</DialogTitle>
            <DialogDescription>
              Records left unmodified for the retention period below are moved to the Archived list
              automatically. Manually archived records stay archived.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="archive-years">Auto-archive after (years)</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="icon"
                variant="outline"
                aria-label="Decrease archive years"
                disabled={Number(archiveDraft) <= 1}
                onClick={() => setArchiveDraft(String(Math.max(1, Number(archiveDraft) - 1)))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="archive-years"
                type="number"
                min={1}
                max={30}
                value={archiveDraft}
                onChange={(e) => setArchiveDraft(e.target.value)}
                className="w-24 text-center"
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                aria-label="Increase archive years"
                disabled={Number(archiveDraft) >= 30}
                onClick={() => setArchiveDraft(String(Math.min(30, Number(archiveDraft) + 1)))}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">years</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Currently archiving {archivedIds.length} record(s) at {archiveYears}+ years.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setArchiveOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                const n = Math.min(30, Math.max(1, Number(archiveDraft) || 1));
                applyArchiveYears(String(n));
                setArchiveDraft(String(n));
                setArchiveOpen(false);
              }}
            >
              Save settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 201 FILE */}
      <Dialog open={!!profile} onOpenChange={(o) => !o && setProfileId(null)}>
        <DialogContent className="flex h-[96vh] flex-col gap-3 overflow-hidden sm:max-w-6xl">
          {profile &&
            (() => {
              const p = { ...buildProfile(profile) };
              const hist = historyFor(profile);
              return (
                <>
                  <DialogHeader>
                    <DialogTitle className="font-display text-2xl">{profile.name}</DialogTitle>
                    <DialogDescription>
                      {profile.position} · {profile.department} · {profile.id}
                    </DialogDescription>
                  </DialogHeader>

                  {!isSuper && (
                    <p className="flex items-center gap-2 rounded-md border border-border bg-muted/40 p-2.5 text-xs text-muted-foreground">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Admin access: records are read-only and statutory government IDs are hidden.
                      You may create history entries.
                    </p>
                  )}

                  <Tabs
                    value={profileTab}
                    onValueChange={setProfileTab}
                    className="flex min-h-0 flex-1 flex-col"
                  >
                    <TabsList className="flex h-auto flex-wrap justify-start">
                      <TabsTrigger value="personal">Personal Information</TabsTrigger>
                      <TabsTrigger value="documents">Documents</TabsTrigger>
                      <TabsTrigger value="history">Employment History</TabsTrigger>
                    </TabsList>

                    {isSuper && (
                      <div className="mt-3 flex h-12 flex-nowrap items-center gap-2 overflow-x-auto border-b border-border pb-3">
                        {profileTab === "documents" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setDocDialog({ mode: "add", index: -1, name: "", file: "" })
                            }
                          >
                            <Plus className="mr-2 h-3.5 w-3.5" /> Add document
                          </Button>
                        )}
                        {profileTab === "history" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setHistoryFormOpen((v) => !v)}
                          >
                            <Plus className="mr-2 h-3.5 w-3.5" /> Create history entry
                          </Button>
                        )}
                      </div>
                    )}

                    <TabsContent
                      value="personal"
                      className="mt-2 min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1"
                    >
                      <Section title="Personal details">
                        <Field k="Full name" v={profile.name} />
                        <Field k="Birth date" v={p.birthDate} />
                        <Field k="Gender" v={p.gender} />
                        <Field k="Civil status" v={p.civilStatus} />
                        <Field k="Nationality" v={p.nationality} />
                      </Section>
                      <Section title="Contact information">
                        <Field k="Company email" v={profile.email} />
                        <Field k="Personal email" v={p.personalEmail} />
                        <Field k="Mobile number" v={profile.phone} />
                        <Field k="Home address" v={p.address} wide />
                      </Section>
                      <Section title="Family information">
                        <Field k="Family" v={p.family} wide />
                      </Section>
                      <Section title="Emergency contact">
                        <Field k="Name" v={p.emergencyName} />
                        <Field k="Relationship" v={p.emergencyRelation} />
                        <Field k="Contact number" v={p.emergencyPhone} />
                      </Section>

                      <Section title="Employment information">
                        <Field k="Employee number" v={profile.id} />
                        <Field k="Position" v={profile.position} />
                        <Field k="Department" v={profile.department} />
                        <Field k="Outlet / Branch" v="Oxford Suites Makati" />
                        <Field k="Status" v={profile.status} />
                        <Field k="Date hired" v={profile.dateHired} />
                        <Field k="Immediate supervisor" v={profile.supervisor} />
                        <Field k="Shift" v="AM Shift · 07:00 – 16:00" />
                        <Field
                          k="Rate"
                          v={`${profile.employmentType} · ${p.contract.split(" · ")[0]}`}
                        />
                      </Section>

                      {isSuper ? (
                        <Section title="Government IDs">
                          <Field k="SSS number" v={p.sss} />
                          <Field k="Pag-IBIG MID" v={p.pagibig} />
                          <Field k="PhilHealth number" v={p.philhealth} />
                          <Field k="TIN" v={p.tin} />
                        </Section>
                      ) : (
                        <div className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                          Government IDs (SSS, Pag-IBIG, PhilHealth) are restricted to Super Admin.
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent
                      value="documents"
                      className="mt-3 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1"
                    >
                      <div className="space-y-1.5">
                        {docsFor(profile).map((doc, i) => (
                          <div
                            key={`${doc.name}-${i}`}
                            className="flex items-center justify-between gap-3 rounded-md border border-border p-2.5"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm">{doc.name}</p>
                              {doc.file && (
                                <p className="truncate text-xs text-muted-foreground">{doc.file}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={
                                  doc.status === "Submitted"
                                    ? "border-success/30 bg-success/15 text-success"
                                    : "border-warning/40 bg-warning/20 text-warning-foreground"
                                }
                              >
                                {doc.status}
                              </Badge>
                              {isSuper && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      setDocDialog({
                                        mode: "edit",
                                        index: i,
                                        name: doc.name,
                                        file: doc.file ?? "",
                                      })
                                    }
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-destructive"
                                    onClick={() => removeDoc(i)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent
                      value="history"
                      className="mt-3 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1"
                    >
                      {isSuper && historyFormOpen && (
                        <div className="rounded-md border border-border p-3">
                          <p className="eyebrow mb-2">New history entry</p>
                          <div className="grid gap-2 sm:grid-cols-3">
                            <Select
                              value={newHistory.type}
                              onValueChange={(v) =>
                                setNewHistory({ ...newHistory, type: v as HistoryEntry["type"] })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {["Promotion", "Transfer", "Employment"].map((t) => (
                                  <SelectItem key={t} value={t}>
                                    {t}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              type="date"
                              value={newHistory.date}
                              onChange={(e) =>
                                setNewHistory({ ...newHistory, date: e.target.value })
                              }
                            />
                            <Input
                              placeholder="Note (e.g. Front Desk Agent → Front Desk Supervisor)"
                              value={newHistory.detail}
                              onChange={(e) =>
                                setNewHistory({ ...newHistory, detail: e.target.value })
                              }
                            />
                          </div>
                          <Button
                            size="sm"
                            className="mt-2"
                            onClick={() => {
                              addHistory();
                              setHistoryFormOpen(false);
                            }}
                          >
                            <Plus className="mr-2 h-3.5 w-3.5" /> Save entry
                          </Button>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        {[...hist]
                          .sort((a, b) => (a.date < b.date ? 1 : -1))
                          .map((h) => (
                            <div key={h.id} className="rounded-md border border-border p-2.5">
                              {editingHistoryId === h.id ? (
                                <div className="space-y-2">
                                  <div className="grid gap-2 sm:grid-cols-3">
                                    <Select
                                      value={editHistory.type}
                                      onValueChange={(v) =>
                                        setEditHistory({
                                          ...editHistory,
                                          type: v as HistoryEntry["type"],
                                        })
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {["Promotion", "Transfer", "Employment"].map((t) => (
                                          <SelectItem key={t} value={t}>
                                            {t}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <Input
                                      type="date"
                                      value={editHistory.date}
                                      onChange={(e) =>
                                        setEditHistory({ ...editHistory, date: e.target.value })
                                      }
                                    />
                                    <Input
                                      value={editHistory.detail}
                                      onChange={(e) =>
                                        setEditHistory({ ...editHistory, detail: e.target.value })
                                      }
                                    />
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <Button size="sm" onClick={saveEditHistory}>
                                      Save
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setEditingHistoryId(null)}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between">
                                  <div className="flex items-start gap-3">
                                    <Badge
                                      variant="secondary"
                                      className="mt-0.5 shrink-0 text-[0.65rem]"
                                    >
                                      {h.type}
                                    </Badge>
                                    <div>
                                      <p className="text-sm">{h.detail}</p>
                                      <p className="text-xs text-muted-foreground">{h.date}</p>
                                    </div>
                                  </div>
                                  {isSuper && (
                                    <div className="flex shrink-0 gap-1">
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7"
                                        onClick={() => startEditHistory(h)}
                                        aria-label="Edit history entry"
                                      >
                                        <Pencil className="h-3.5 w-3.5" />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7"
                                        onClick={() => deleteHistory(h.id)}
                                        aria-label="Delete history entry"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </TabsContent>
                  </Tabs>

                  <DialogFooter className="mt-auto shrink-0 border-t border-border/60 pt-3">
                    <Button variant="outline" onClick={printRecord}>
                      <Printer className="mr-2 h-3.5 w-3.5" /> Print record
                    </Button>
                    <Button variant="outline" onClick={() => toast("201 file exported as PDF")}>
                      Export 201 file
                    </Button>
                  </DialogFooter>
                </>
              );
            })()}
        </DialogContent>
      </Dialog>

      {/* ADD EMPLOYEE */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Add employee</DialogTitle>
            <DialogDescription>Create a new 201 file record.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Full name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Position</Label>
              <Input
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Select
                value={form.department}
                onValueChange={(v) => setForm({ ...form, department: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roster.departments.map((d) => (
                    <SelectItem key={d.code} value={d.name}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Employment type</Label>
              <Select
                value={form.employmentType}
                onValueChange={(v) =>
                  setForm({ ...form, employmentType: v as Employee["employmentType"] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Regular", "Probationary", "Contractual"].map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Date hired</Label>
              <Input
                type="date"
                value={form.dateHired}
                onChange={(e) => setForm({ ...form, dateHired: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Immediate supervisor</Label>
              <Input
                value={form.supervisor}
                onChange={(e) => setForm({ ...form, supervisor: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Phone number</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createEmployee}>
              <Plus className="mr-2 h-4 w-4" /> Create employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* BULK GENERATE RESULTS */}
      <Dialog open={generatedOpen} onOpenChange={setGeneratedOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Generated Documents</DialogTitle>
            <DialogDescription>
              Documents generated from the latest bulk generate action.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {generatedDocs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents generated yet.</p>
            ) : (
              generatedDocs.map((g) => (
                <div
                  key={g.id}
                  className="flex items-center justify-between rounded-md border border-border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{g.employeeName}</p>
                    <p className="text-xs text-muted-foreground">
                      {g.docType} · generated {g.generatedAt}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.success(`${g.docType} for ${g.employeeName} downloaded`)}
                  >
                    <Download className="mr-1.5 h-3.5 w-3.5" /> Download
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* BULK DOCUMENT PICKER */}
      <Dialog open={bulkPickOpen} onOpenChange={setBulkPickOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Choose documents</DialogTitle>
            <DialogDescription>
              Select which documents to generate for {selected.length} selected employee(s).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {documentTypes.map((d) => (
              <label
                key={d}
                className="flex cursor-pointer items-center gap-3 rounded-md border border-border px-3 py-2 text-sm"
              >
                <Checkbox
                  checked={bulkTypes.includes(d)}
                  onCheckedChange={(v) =>
                    setBulkTypes((prev) => (v ? [...prev, d] : prev.filter((x) => x !== d)))
                  }
                />
                {d}
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkPickOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={bulkTypes.length === 0}
              onClick={() => {
                const targets = list.filter((e) => selected.includes(e.id));
                const batch: GeneratedDoc[] = targets.flatMap((e) =>
                  bulkTypes.map((t) => ({
                    id: `GEN-${Date.now()}-${e.id}-${t}`,
                    employeeName: e.name,
                    docType: t,
                    generatedAt: new Date().toLocaleString(),
                  })),
                );
                setGeneratedDocs((prev) => [...batch, ...prev]);
                setBulkPickOpen(false);
                setGeneratedOpen(true);
                toast.success(`${batch.length} document(s) generated`);
              }}
            >
              <Download className="mr-2 h-4 w-4" /> Generate {bulkTypes.length || ""} document
              {bulkTypes.length === 1 ? "" : "s"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* BULK REPORTS */}

      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Generate Reports</DialogTitle>
            <DialogDescription>
              Company-wide HR reports across all employee records.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {reportTypes.map((r) => (
              <div
                key={r}
                className="flex items-center justify-between rounded-md border border-border p-3"
              >
                <span className="text-sm">{r}</span>
                <Button size="sm" variant="outline" onClick={() => toast.success(`${r} generated`)}>
                  <Download className="mr-1.5 h-3.5 w-3.5" /> PDF
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* EDIT PERSONAL DATA */}
      {/* ADD / EDIT DOCUMENT */}
      <Dialog open={!!docDialog} onOpenChange={(o) => !o && setDocDialog(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {docDialog?.mode === "edit" ? "Edit document" : "Add document"}
            </DialogTitle>
            <DialogDescription>Rename the document or attach a replacement file.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Document name</Label>
              <Input
                value={docDialog?.name ?? ""}
                onChange={(e) =>
                  setDocDialog((prev) => (prev ? { ...prev, name: e.target.value } : prev))
                }
                placeholder="NBI Clearance (2026)"
              />
            </div>
            <div className="space-y-1.5">
              <Label>File</Label>
              <Input
                type="file"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setDocDialog((prev) => (prev ? { ...prev, file: f?.name ?? prev.file } : prev));
                }}
              />
              {docDialog?.file && (
                <p className="text-xs text-muted-foreground">Current file: {docDialog.file}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDocDialog(null)}>
              Cancel
            </Button>
            <Button onClick={saveDoc}>
              {docDialog?.mode === "edit" ? "Save changes" : "Add document"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border px-3 py-1.5">
      <p className="eyebrow mb-1">{title}</p>
      <div className="grid gap-x-4 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </div>
  );
}

export function Field({ k, v, wide }: { k: string; v: string; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <p className="text-[0.62rem] uppercase leading-tight tracking-wide text-muted-foreground">
        {k}
      </p>
      <p className="text-[0.8rem] leading-snug">{v}</p>
    </div>
  );
}

/** Field that renders as read-only text, or an editable input when `editing` is true. */
function EF({
  label,
  value,
  editing,
  onChange,
  wide,
}: {
  label: string;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  wide?: boolean;
}) {
  if (!editing) return wide ? <Field k={label} v={value} wide /> : <Field k={label} v={value} />;
  return (
    <div className={wide ? "sm:col-span-2 space-y-1.5" : "space-y-1.5"}>
      <Label className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

/** Editable field backed by a dropdown of allowed values. */
function ESelect({
  label,
  value,
  editing,
  onChange,
  options,
}: {
  label: string;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  options: string[];
}) {
  if (!editing) return <Field k={label} v={value} />;
  return (
    <div className="space-y-1.5">
      <Label className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
