import { useCallback, useEffect, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  BadgeCheck,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  FolderOpen,
  History,
  Inbox,
  Lock,
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

import { ListBody } from "@/components/portal/ListBody";
import { ListEmptyState } from "@/components/portal/ListEmptyState";
import { SortHead, useSort } from "@/components/portal/sortable";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Skeleton, TableRowsSkeleton } from "@/components/ui/loading-skeletons";

import {
  auditLogApi,
  ermApi,
  hcmApi,
  type ApiAuditLog,
  type ApiDocument,
  type ApiEmployee,
} from "@/lib/api";
import { DocumentRequestInbox } from "./employee-records/DocumentRequestInbox";
import {
  getEmployeeByCode,
  getRecordDetail,
  refreshRoster,
  toUiEmployee,
  useRecordDetail,
  useRoster,
} from "@/lib/employeerecords";
import { build201FileReport, exportReport, type ReportFormat } from "@/lib/report-export";
import { usePasswordGate, useSecuredPrint } from "@/components/ui/report-menu";
import { usePagination } from "@/hooks/usePagination";
import { useHighlightId, highlightRowClass } from "@/hooks/useHighlight";

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

/** Export formats offered in the Generate Reports dialog, in menu order. */
const REPORT_FORMAT_OPTIONS: { id: ReportFormat; label: string }[] = [
  { id: "pdf", label: "PDF" },
  { id: "docx", label: "DOCX" },
  { id: "excel", label: "Excel" },
  { id: "csv", label: "CSV" },
];

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

type GeneratedDoc = {
  id: string;
  employeeCode: string;
  employeeName: string;
  department: string;
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
type ProfileDoc = {
  id?: number;
  name: string;
  status: "Verified" | "Submitted" | "Pending" | "Missing";
  file?: string | undefined;
  hasFile: boolean;
};

/** Map an ERM document row to the compact 201-file row the UI renders. */
function toProfileDoc(d: ApiDocument): ProfileDoc {
  const status: ProfileDoc["status"] =
    d.document_status === "Verified"
      ? "Verified"
      : d.document_status === "Submitted"
        ? "Submitted"
        : d.document_status === "Rejected"
          ? "Missing"
          : "Pending";
  return {
    id: d.document_id,
    name: d.title,
    status,
    file: d.original_name ?? d.file_path?.split("/").pop() ?? undefined,
    hasFile: d.has_file === true || Boolean(d.file_url),
  };
}

/** Derive a sensible 201-file category from a document's name. */
function deriveCategory(name: string): string {
  const n = name.toLowerCase();
  if (/clearance|nbi|police|permit/.test(n)) return "Clearance";
  if (/medical|health|exam|fit to work/.test(n)) return "Medical";
  if (/\bsss\b|philhealth|pag-?ibig|\btin\b/.test(n)) return "Government";
  if (/certificate|coe/.test(n)) return "Certificate";
  if (/resume|curriculum|\bcv\b/.test(n)) return "Resume";
  if (/contract|agreement/.test(n)) return "Contract";
  return "Others";
}

function classifyDocuments(api: ApiEmployee | undefined) {
  const certificates: string[] = [];
  const licenses: string[] = [];
  const medical: string[] = [];
  const missing: string[] = [];
  for (const d of api?.documents ?? []) {
    const cat = d.category.toLowerCase();
    if (!["Verified", "Submitted"].includes(d.document_status)) {
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

export function EmployeeRecords({ role }: { role: "superadmin" | "admin" }) {
  const isSuper = role === "superadmin";
  const { id: highlightId } = useHighlightId();

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
  const [logsLoading, setLogsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLogsLoading(true);
    auditLogApi
      .list({ per_page: 200, module: "Employee Records" })
      .then((res) => {
        if (!cancelled) setRecordLogs((res.data ?? []).map(mapAuditToRecordLog));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLogsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const [archivedList, setArchivedList] = useState<Employee[]>([]);
  const [archivedApi, setArchivedApi] = useState<ApiEmployee[]>([]);
  const [listView, setListView] = useState<"active" | "archived">("active");
  const [mainTab, setMainTab] = useState("list");

  /** ESS document-request metrics surfaced at the top of the ERM page. */
  const [requestCounts, setRequestCounts] = useState({ total: 0, pending: 0, fulfilled: 0 });
  const [requestCountsLoading, setRequestCountsLoading] = useState(true);

  const loadRequestCounts = useCallback(() => {
    setRequestCountsLoading(true);
    ermApi
      .documentRequests()
      .then((res) => setRequestCounts(res.counts ?? { total: 0, pending: 0, fulfilled: 0 }))
      .catch(() => {})
      .finally(() => setRequestCountsLoading(false));
  }, []);

  useEffect(() => {
    loadRequestCounts();
  }, [loadRequestCounts]);

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
  /** True once the bulk batch has been password-unlocked at generation time. */
  const [bulkUnlocked, setBulkUnlocked] = useState(false);
  const [requestStatusFilter, setRequestStatusFilter] = useState("all");
  /** Auto-archive threshold in years — configurable by the HR admin. */
  const [archiveYears, setArchiveYears] = useState("10");
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archiveDraft, setArchiveDraft] = useState("10");
  const [docsById, setDocsById] = useState<Record<string, ProfileDoc[]>>({});
  const [docSaving, setDocSaving] = useState(false);
  const [docDialog, setDocDialog] = useState<{
    mode: "add" | "edit";
    index: number;
    id?: number;
    name: string;
    file: string;
    fileObj?: File;
  } | null>(null);

  const profile = list.find((e) => e.id === profileId) ?? null;
  useRecordDetail(profileId);

  /** Archived records are soft-deleted server-side; load them on demand. */
  const loadArchived = useCallback(() => {
    ermApi.employees
      .archived()
      .then((res) => {
        const rows = res.data ?? [];
        setArchivedApi(rows);
        setArchivedList(rows.map(toUiEmployee));
      })
      .catch(() => {
        setArchivedApi([]);
        setArchivedList([]);
      });
  }, []);

  useEffect(() => {
    if (listView === "archived") loadArchived();
  }, [listView, loadArchived]);

  const filtered = (listView === "archived" ? archivedList : list).filter((e) => {
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
    status: (e) => e.status,
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

  const employeeIdFor = (code: string) =>
    getEmployeeByCode(code)?.employee_id ??
    archivedApi.find((e) => e.employee_code === code)?.employee_id;

  const archiveEmployee = async (id: string) => {
    const employeeId = employeeIdFor(id);
    if (!employeeId) {
      toast.error("Employee record not found");
      return;
    }
    try {
      await ermApi.employees.archive(employeeId);
      toast.success("Record moved to Archived");
      setProfileId(null);
      refreshRoster();
      loadArchived();
    } catch (e: any) {
      toast.error(e?.message ?? "Could not archive record");
    }
  };

  const restoreEmployee = async (id: string) => {
    const employeeId = employeeIdFor(id);
    if (!employeeId) {
      toast.error("Employee record not found");
      return;
    }
    try {
      await ermApi.employees.restore(employeeId);
      toast.success("Record restored to active list");
      refreshRoster();
      loadArchived();
    } catch (e: any) {
      toast.error(e?.message ?? "Could not restore record");
    }
  };

  /** Retention threshold is informational — archiving itself is manual/backend. */
  const applyArchiveYears = (years: string) => {
    setArchiveYears(years);
    toast.success(`Retention threshold set to ${years}+ years`);
  };

  /** Documents currently on a 201 file (server data first, then local fallback). */
  const docsFor = (emp: Employee): ProfileDoc[] => {
    const existing = docsById[emp.id];
    if (existing) return existing;
    const detail = getRecordDetail(emp.id);
    if (detail?.documents?.length) {
      return detail.documents.map(toProfileDoc);
    }
    const p = buildProfile(emp);
    return [
      ...p.certificates.map((d) => ({ name: d, status: "Submitted" as const, hasFile: false })),
      ...p.licenses.map((d) => ({ name: d, status: "Submitted" as const, hasFile: false })),
      ...p.medical.map((d) => ({ name: d, status: "Submitted" as const, hasFile: false })),
      ...p.missing.map((d) => ({ name: d, status: "Missing" as const, hasFile: false })),
    ];
  };

  const setDocs = (empId: string, next: ProfileDoc[]) =>
    setDocsById((prev) => ({ ...prev, [empId]: next }));

  /** Re-read the 201 file's documents from the server after a mutation. */
  const reloadDocs = async (emp: Employee) => {
    const employeeId = employeeIdFor(emp.id);
    if (!employeeId) return;
    try {
      const res = await ermApi.employees.documents(employeeId);
      setDocs(emp.id, (res.documents ?? []).map(toProfileDoc));
    } catch {
      /* best-effort refresh */
    }
  };

  const saveDoc = async () => {
    if (!profile || !docDialog) return;
    const name = docDialog.name.trim();
    if (!name) {
      toast.error("Document name is required");
      return;
    }
    const employeeId = employeeIdFor(profile.id);
    if (!employeeId) {
      toast.error("Employee record not found");
      return;
    }
    setDocSaving(true);
    try {
      if (docDialog.mode === "add") {
        await ermApi.employees.uploadDocument(employeeId, {
          title: name,
          category: deriveCategory(name),
          ...(docDialog.fileObj ? { file: docDialog.fileObj } : {}),
        });
        toast.success("Document added to 201 file");
      } else if (docDialog.id) {
        if (docDialog.fileObj) {
          // Replace: drop the old row, add the new file.
          await ermApi.employees.removeDocument(employeeId, docDialog.id);
          await ermApi.employees.uploadDocument(employeeId, {
            title: name,
            category: deriveCategory(name),
            file: docDialog.fileObj,
          });
        } else {
          await ermApi.employees.updateDocument(employeeId, docDialog.id, { title: name });
        }
        toast.success("Document updated");
      } else {
        // Legacy local-only row (no server id) — edit in place.
        const current = docsFor(profile);
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
      await reloadDocs(profile);
      setDocDialog(null);
    } catch (e: any) {
      toast.error(e?.message ?? "Could not save document");
    } finally {
      setDocSaving(false);
    }
  };

  const removeDoc = async (index: number) => {
    if (!profile) return;
    const doc = docsFor(profile)[index];
    const employeeId = employeeIdFor(profile.id);
    if (employeeId && doc?.id) {
      try {
        await ermApi.employees.removeDocument(employeeId, doc.id);
        toast.success("Document removed from 201 file");
        await reloadDocs(profile);
      } catch (e: any) {
        toast.error(e?.message ?? "Could not remove document");
      }
      return;
    }
    setDocs(
      profile.id,
      docsFor(profile).filter((_, i) => i !== index),
    );
    toast.success("Document removed");
  };

  /** Toggle a document between Verified and Pending Verification. */
  const verifyDoc = async (index: number) => {
    if (!profile) return;
    const doc = docsFor(profile)[index];
    const employeeId = employeeIdFor(profile.id);
    const next = doc?.status === "Verified" ? "Pending Verification" : "Verified";
    if (employeeId && doc?.id) {
      try {
        await ermApi.employees.verifyDocument(employeeId, doc.id, next);
        toast.success(
          `${doc?.name ?? "Document"} marked ${next === "Verified" ? "verified" : "pending"}.`,
        );
        await reloadDocs(profile);
      } catch (e: any) {
        toast.error(e?.message ?? "Could not update document");
      }
      return;
    }
    setDocs(
      profile.id,
      docsFor(profile).map((d, i) =>
        i === index
          ? { ...d, status: next === "Verified" ? ("Verified" as const) : ("Pending" as const) }
          : d,
      ),
    );
  };

  // Security gate: 201 files are confidential — password is required before
  // opening, printing, or exporting any employee's full record.
  const { gateSensitive, gateDialog } = usePasswordGate();
  const { requestPrint, printDialog } = useSecuredPrint();

  /** Single source of truth for this employee's 201-file report payload. */
  const build201Report = (emp: Employee) =>
    build201FileReport({
      employeeName: emp.name,
      employeeCode: emp.id,
      position: emp.position,
      department: emp.department,
      status: emp.status,
      employmentType: emp.employmentType,
      dateHired: emp.dateHired,
      email: emp.email,
      phone: emp.phone,
      supervisor: emp.supervisor,
      documents: docsFor(emp).map((d) => ({
        name: d.name,
        status: d.status,
        ...(d.file ? { file: d.file } : {}),
      })),
      history: historyFor(emp).map((h) => ({ type: h.type, date: h.date, detail: h.detail })),
    });

  /** PRINT path only — generates an encrypted PDF for the 201 file. */
  const printRecord = () => {
    if (!profile) return;
    gateSensitive({ sensitive: true }, () => requestPrint(build201Report(profile)));
  };

  /** EXPORT path only — downloads the 201 file, never opens the print dialog. */
  const export201File = (format: ReportFormat) => {
    if (!profile) return;
    gateSensitive({ sensitive: true }, () => {
      exportReport(build201Report(profile), format);
      toast.success(`${profile.name}'s 201 file exported as ${format.toUpperCase()}.`);
    });
  };

  /** Password-gated entry into a 201 file (security measure). */
  const open201File = (emp: Employee) => {
    gateSensitive({ sensitive: true }, () => {
      setProfileId(emp.id);
      setProfileTab("personal");
      setHistoryFormOpen(false);
    });
  };

  /** Company-wide HR report payloads built from the live roster. */
  const buildCompanyReport = (reportName: string) => {
    const base = {
      title: reportName,
      subtitle: `Oxford Suites Makati · ${list.length} employee(s) on record`,
      sensitive: true as const,
      summary: [
        { label: "Total Employees", value: list.length },
        { label: "Regular", value: list.filter((e) => e.employmentType === "Regular").length },
        { label: "Active", value: list.filter((e) => e.status === "Active").length },
      ],
    };
    if (reportName.includes("Headcount")) {
      const byDept = new Map<string, number>();
      list.forEach((e) => byDept.set(e.department, (byDept.get(e.department) ?? 0) + 1));
      return {
        ...base,
        columns: [
          { header: "Department", key: "department" },
          { header: "Headcount", key: "count" },
        ],
        rows: [...byDept.entries()].map(([department, count]) => ({ department, count })),
      };
    }
    return {
      ...base,
      columns: [
        { header: "Employee", key: "name" },
        { header: "Position", key: "position" },
        { header: "Department", key: "department" },
        { header: "Type", key: "type" },
        { header: "Status", key: "status" },
        { header: "Date Hired", key: "dateHired" },
      ],
      rows: list.map((e) => ({
        name: `${e.name} (${e.id})`,
        position: e.position,
        department: e.department,
        type: e.employmentType,
        status: e.status,
        dateHired: e.dateHired,
      })),
    };
  };

  /** EXPORT path only — downloads the company report, never prints. */
  const exportCompanyReport = (reportName: string, format: ReportFormat) => {
    gateSensitive({ sensitive: true }, () => {
      exportReport(buildCompanyReport(reportName), format);
      toast.success(`${reportName} exported as ${format.toUpperCase()}.`);
    });
  };

  /** Export one generated document. The batch is unlocked once at generate time. */
  const downloadGenerated = (g: GeneratedDoc) => {
    const run = () => {
      const emp =
        list.find((e) => e.id === g.employeeCode) ?? list.find((e) => e.name === g.employeeName);
      exportReport(
        {
          title: `${g.docType} - ${g.employeeName}`,
          ...(emp
            ? {
                subtitle: `${emp.id} · ${emp.position} · ${emp.department}`,
              }
            : {}),
          columns: [
            { header: "Field", key: "field" },
            { header: "Detail", key: "detail" },
          ],
          rows: emp
            ? [
                { field: "Employee", detail: emp.name },
                { field: "Employee No.", detail: emp.id },
                { field: "Position", detail: emp.position },
                { field: "Department", detail: emp.department },
                { field: "Document", detail: g.docType },
                { field: "Generated", detail: g.generatedAt },
              ]
            : [{ field: "Document", detail: g.docType }],
          sensitive: true,
        },
        "pdf",
      );
      toast.success(`${g.docType} for ${g.employeeName} downloaded`);
    };

    if (bulkUnlocked) {
      run();
    } else {
      gateSensitive({ sensitive: true }, run);
    }
  };

  /** Selected employees shown in the picker, clearly separated. */
  const bulkRecipients = list.filter((e) => selected.includes(e.id));

  /** Generated documents grouped per employee for segregated display. */
  const generatedGroups = generatedDocs
    .reduce<
      {
        employeeCode: string;
        employeeName: string;
        department: string;
        items: GeneratedDoc[];
      }[]
    >((groups, doc) => {
      const existing = groups.find((g) => g.employeeCode === doc.employeeCode);
      if (existing) {
        existing.items.push(doc);
      } else {
        groups.push({
          employeeCode: doc.employeeCode,
          employeeName: doc.employeeName,
          department: doc.department,
          items: [doc],
        });
      }
      return groups;
    }, [])
    .sort((a, b) => a.employeeName.localeCompare(b.employeeName));

  return (
    <div>
      {gateDialog}
      {printDialog}
      <div className="-mx-1 mb-4 space-y-3 px-1 pb-1 pt-1">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center text-primary">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-11 w-11 fill-current">
                {/* Clean Open Folder Back & Tab */}
                <path d="M4 4a2 2 0 0 0-2 2v11.2l1.65-5.35A2.5 2.5 0 0 1 6.04 10H20V7.5a2 2 0 0 0-2-2h-6.76a2 2 0 0 1-1.42-.59l-.4-.4A2 2 0 0 0 8 4H4Z" />
                {/* Bold Angled Front Flap */}
                <path d="M6.04 11.5a1 1 0 0 0-.96.71l-1.92 6.23A1.5 1.5 0 0 0 4.6 20.5h14.62a1.5 1.5 0 0 0 1.45-1.14l1.68-6.72A1 1 0 0 0 21.38 11.5H6.04Z" />
              </svg>
            </span>
            <div>
              <h1 className="font-display text-[1.8rem] font-bold leading-tight tracking-tight sm:text-[2rem]">
                Employee Records
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                201 files, employment details, records analytics and document generation.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start">
            <Button size="sm" variant="outline" onClick={() => setBulkOpen(true)}>
              <FileText className="mr-2 h-4 w-4" /> Generate reports
            </Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Total Employees",
              value: list.length,
              icon: Users,
              loading: !roster.loaded,
              onClick: () => {
                setTypeFilter("all");
                setStatusFilter("all");
              },
            },
            {
              label: "Total requests",
              value: requestCounts.total,
              icon: Inbox,
              loading: requestCountsLoading,
              onClick: () => {
                setRequestStatusFilter("all");
                setMainTab("requests");
              },
            },
            {
              label: "Awaiting fulfilment",
              value: requestCounts.pending,
              icon: Clock,
              loading: requestCountsLoading,
              onClick: () => {
                setRequestStatusFilter("pending");
                setMainTab("requests");
              },
            },
            {
              label: "Fulfilled",
              value: requestCounts.fulfilled,
              icon: CheckCircle2,
              loading: requestCountsLoading,
              onClick: () => {
                setRequestStatusFilter("Completed");
                setMainTab("requests");
              },
            },
          ].map((m) =>
            m.loading ? (
              <div
                key={`skeleton-${m.label}`}
                className="flex items-center gap-4 rounded-xl border border-border/60 bg-card px-4 py-3.5"
                aria-busy="true"
              >
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            ) : (
              <button
                key={m.label}
                type="button"
                onClick={m.onClick}
                className="group flex w-full cursor-pointer items-center gap-4 rounded-xl border border-border/60 bg-card px-4 py-3.5 text-left shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <m.icon className="h-6 w-6" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-medium text-muted-foreground">
                    {m.label}
                  </span>
                  <span className="mt-1 block font-display text-[1.45rem] font-bold leading-none tabular-nums text-foreground">
                    {m.value.toLocaleString()}
                  </span>
                </span>
              </button>
            ),
          )}
        </div>
      </div>

      <Tabs value={mainTab} onValueChange={setMainTab} className="mt-6">
        <TabsList>
          <TabsTrigger className="flex items-center gap-1.5" value="list">
            <Users className="h-3.5 w-3.5" /> Employee List
          </TabsTrigger>
          <TabsTrigger className="flex items-center gap-1.5" value="history">
            <History className="h-3.5 w-3.5" /> Record History
          </TabsTrigger>
          <TabsTrigger className="flex items-center gap-1.5" value="requests">
            <Inbox className="h-3.5 w-3.5" /> Document Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          <Card className="rounded-xl border-border/60 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 font-display text-base font-bold">
                  <Users className="h-4.5 w-4.5 text-primary" />
                  Employee List
                </h2>
                <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
                  <div className="relative w-full min-w-0 sm:w-64">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="w-full pl-8"
                      placeholder="Search employees…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <Select value={dept} onValueChange={setDept}>
                    <SelectTrigger className="w-[calc(50%-0.25rem)] sm:w-44">
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
                    <SelectTrigger className="w-[calc(50%-0.25rem)] sm:w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active records</SelectItem>
                      <SelectItem value="archived">Archived · {archivedList.length}</SelectItem>
                    </SelectContent>
                  </Select>
                  {(search || dept !== "all" || listView !== "active") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 px-2 text-xs text-muted-foreground"
                      onClick={() => {
                        setSearch("");
                        setDept("all");
                        setListView("active");
                      }}
                    >
                      Clear filters
                    </Button>
                  )}
                  <div className="flex w-full items-center gap-2 sm:ml-auto sm:w-auto">
                    {listView === "active" && selected.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {selected.length} selected
                      </span>
                    )}
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
                      <Button
                        size="sm"
                        disabled={selected.length === 0}
                        onClick={() => {
                          setBulkTypes([documentTypes[0]!]);
                          setBulkUnlocked(false);
                          setBulkPickOpen(true);
                        }}
                      >
                        <Download className="mr-2 h-4 w-4" /> Bulk generate
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {listView === "archived" && (
                <p className="mt-3 rounded-md border border-border/70 bg-muted/20 px-3 py-2 text-[11px] text-muted-foreground">
                  Soft-archived 201 files (retained for statutory retention). Restore to return a
                  record to the active list.
                </p>
              )}

              <div className="mt-3 overflow-x-auto">
                <ListBody>
                  <Table className="text-xs">
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
                      {!roster.loaded && <TableRowsSkeleton cols={8} rows={6} />}
                      {roster.loaded &&
                        employeePage.pageItems.map((e) => (
                          <TableRow
                            key={e.id}
                            data-highlight-id={e.id}
                            className={highlightRowClass(!!highlightId && e.id === highlightId)}
                          >
                            <TableCell>
                              <Checkbox
                                checked={selected.includes(e.id)}
                                onCheckedChange={() => toggle(e.id)}
                                disabled={listView === "archived"}
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
                                {listView === "archived" && (
                                  <Badge
                                    variant="outline"
                                    className="border-gold/40 bg-gold-soft text-foreground"
                                  >
                                    Archived
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex flex-wrap items-center justify-end gap-2">
                                {listView === "active" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => open201File(e)}
                                  >
                                    <FolderOpen className="mr-2 h-3.5 w-3.5" /> View Records
                                  </Button>
                                )}
                                {isSuper &&
                                  (listView === "archived" ? (
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
                showRangeLabel={false}
                onPageChange={employeePage.setPage}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card className="rounded-xl border-border/60 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 font-display text-base font-bold">
                  <History className="h-4.5 w-4.5 text-primary" />
                  Record History
                </h2>
                <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
                  <div className="relative w-full min-w-0 sm:w-64">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="w-full pl-8"
                      placeholder="Search logs…"
                      value={logSearch}
                      onChange={(e) => setLogSearch(e.target.value)}
                    />
                  </div>
                  <Select value={logDept} onValueChange={setLogDept}>
                    <SelectTrigger className="w-[calc(50%-0.25rem)] sm:w-44">
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
                    <SelectTrigger className="w-[calc(50%-0.25rem)] sm:w-36">
                      <SelectValue placeholder="All actions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All actions</SelectItem>
                      <SelectItem value="Added">Added</SelectItem>
                      <SelectItem value="Edited">Edited</SelectItem>
                      <SelectItem value="Deleted">Deleted</SelectItem>
                    </SelectContent>
                  </Select>
                  {(logSearch || logDept !== "all" || logAction !== "all") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 px-2 text-xs text-muted-foreground"
                      onClick={() => {
                        setLogSearch("");
                        setLogDept("all");
                        setLogAction("all");
                      }}
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              </div>

              <div className="mt-3 overflow-x-auto">
                <ListBody>
                  <Table className="text-xs">
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
                      {logsLoading && <TableRowsSkeleton cols={6} rows={5} />}
                      {!logsLoading &&
                        logPage.pageItems.map((l) => (
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
                            <TableCell className="text-xs text-muted-foreground">
                              {l.notes}
                            </TableCell>
                          </TableRow>
                        ))}
                      {!logsLoading && logPage.pageItems.length === 0 && (
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
                showRangeLabel={false}
                onPageChange={logPage.setPage}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="mt-4">
          <DocumentRequestInbox
            statusFilter={requestStatusFilter}
            onStatusFilterChange={setRequestStatusFilter}
            onCountsChange={loadRequestCounts}
          />
        </TabsContent>
      </Tabs>

      {/* AUTO-ARCHIVE SETTINGS */}
      <Dialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Auto-archive settings</DialogTitle>
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
              Retention threshold: records older than {archiveYears}+ years should be archived
              manually. Currently {archivedList.length} record(s) archived.
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
                      You may verify documents and create history entries.
                    </p>
                  )}
                  {isSuper && (
                    <p className="flex items-center gap-2 rounded-md border border-gold/40 bg-gold-soft p-2.5 text-xs text-muted-foreground">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Confidential 201 file — password-verified access. Printing and exporting are
                      logged and require re-confirmation.
                    </p>
                  )}

                  <Tabs
                    value={profileTab}
                    onValueChange={setProfileTab}
                    className="flex min-h-0 flex-1 flex-col"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <TabsList className="w-auto">
                        <TabsTrigger value="personal">Personal Information</TabsTrigger>
                        <TabsTrigger value="documents">Documents</TabsTrigger>
                        <TabsTrigger value="history">Employment History</TabsTrigger>
                      </TabsList>

                      {isSuper && (
                        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto">
                          {profileTab === "documents" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-[34px]"
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
                              className="h-[34px]"
                              onClick={() => setHistoryFormOpen((v) => !v)}
                            >
                              <Plus className="mr-2 h-3.5 w-3.5" /> Create history entry
                            </Button>
                          )}
                        </div>
                      )}
                    </div>

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
                      className="mt-2 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1"
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
                                  doc.status === "Verified" || doc.status === "Submitted"
                                    ? "border-success/30 bg-success/15 text-success"
                                    : doc.status === "Pending"
                                      ? "border-warning/40 bg-warning/20 text-warning-foreground"
                                      : "border-destructive/30 bg-destructive/10 text-destructive"
                                }
                              >
                                {doc.status === "Verified"
                                  ? "Verified"
                                  : doc.status === "Submitted"
                                    ? "Submitted"
                                    : doc.status === "Pending"
                                      ? "Pending verification"
                                      : "Missing"}
                              </Badge>
                              {doc.id && doc.hasFile && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  title="Open file"
                                  onClick={() =>
                                    window.open(
                                      ermApi.employees.documentFileUrl(
                                        employeeIdFor(profile.id) ?? "",
                                        doc.id as number,
                                      ),
                                      "_blank",
                                      "noopener",
                                    )
                                  }
                                >
                                  <FolderOpen className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="gap-1 text-xs"
                                title={
                                  doc.status === "Verified"
                                    ? "Mark as pending verification"
                                    : "Mark as verified"
                                }
                                aria-label={
                                  doc.status === "Verified"
                                    ? `Mark ${doc.name} as pending verification`
                                    : `Mark ${doc.name} as verified`
                                }
                                onClick={() => verifyDoc(i)}
                              >
                                <ShieldCheck className="h-3.5 w-3.5" />
                                {doc.status === "Verified" ? "Unverify" : "Verify"}
                              </Button>
                              {isSuper && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      setDocDialog({
                                        mode: "edit",
                                        index: i,
                                        ...(doc.id !== undefined ? { id: doc.id } : {}),
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
                      className="mt-2 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1"
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          <Download className="mr-2 h-3.5 w-3.5" /> Export 201 file
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {(["pdf", "docx", "excel", "csv"] as ReportFormat[]).map((format) => (
                          <DropdownMenuItem key={format} onClick={() => export201File(format)}>
                            <FileText className="mr-2 h-4 w-4" /> Export as {format.toUpperCase()}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={printRecord}>
                          <Printer className="mr-2 h-4 w-4" /> Print…
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </DialogFooter>
                </>
              );
            })()}
        </DialogContent>
      </Dialog>

      {/* BULK GENERATE RESULTS */}
      <Dialog
        open={generatedOpen}
        onOpenChange={(open) => {
          setGeneratedOpen(open);
          if (!open) setBulkUnlocked(false);
        }}
      >
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Generated Documents</DialogTitle>
            <DialogDescription>
              Documents generated from the latest bulk generate action, grouped per employee.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {generatedDocs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents generated yet.</p>
            ) : (
              generatedGroups.map((group) => (
                <div key={group.employeeCode} className="rounded-md border border-border p-3">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{group.employeeName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {group.employeeCode} · {group.department}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {group.items.length} document{group.items.length === 1 ? "" : "s"}
                    </Badge>
                  </div>
                  <div className="space-y-1.5">
                    {group.items.map((g) => (
                      <div
                        key={g.id}
                        className="flex items-center justify-between gap-2 rounded-md bg-muted/40 px-2.5 py-2"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm">{g.docType}</p>
                          <p className="text-xs text-muted-foreground">generated {g.generatedAt}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="shrink-0"
                          onClick={() => downloadGenerated(g)}
                        >
                          <Download className="mr-1.5 h-3.5 w-3.5" /> Download
                        </Button>
                      </div>
                    ))}
                  </div>
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
          <div className="space-y-4">
            <div className="space-y-1.5">
              <p className="eyebrow">Recipients ({bulkRecipients.length})</p>
              <div className="max-h-32 space-y-1 overflow-y-auto rounded-md border border-border p-2">
                {bulkRecipients.map((e) => (
                  <div key={e.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate">{e.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {e.id} · {e.department}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="eyebrow">Documents</p>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkPickOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={bulkTypes.length === 0 || bulkRecipients.length === 0}
              onClick={() => {
                const targets = bulkRecipients;
                if (targets.length === 0 || bulkTypes.length === 0) return;
                gateSensitive({ sensitive: true }, () => {
                  const generatedAt = new Date().toLocaleString();
                  const batch: GeneratedDoc[] = targets.flatMap((e) =>
                    bulkTypes.map((t) => ({
                      id: `GEN-${Date.now()}-${e.id}-${t}`,
                      employeeCode: e.id,
                      employeeName: e.name,
                      department: e.department,
                      docType: t,
                      generatedAt,
                    })),
                  );
                  setGeneratedDocs((prev) => [...batch, ...prev]);
                  setBulkUnlocked(true);
                  setBulkPickOpen(false);
                  setGeneratedOpen(true);
                  setSelected([]);
                  toast.success(
                    `${batch.length} document(s) generated for ${targets.length} employee(s)`,
                  );
                });
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
          </DialogHeader>
          <div className="space-y-2">
            {reportTypes.map((r) => (
              <div
                key={r}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-3 sm:flex-nowrap"
              >
                <span className="text-sm">{r}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" className="shrink-0 cursor-pointer">
                      <Download className="mr-2 h-4 w-4" /> Generate
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-60">
                    {REPORT_FORMAT_OPTIONS.map((format) => (
                      <DropdownMenuItem
                        key={format.id}
                        onClick={() => exportCompanyReport(r, format.id)}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        <span className="flex items-center gap-1.5">
                          Export as {format.label}{" "}
                          <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                        </span>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => requestPrint(buildCompanyReport(r))}>
                      <Printer className="mr-2 h-4 w-4" /> Print…
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
                  setDocDialog((prev) =>
                    prev
                      ? { ...prev, ...(f ? { fileObj: f } : {}), file: f?.name ?? prev.file }
                      : prev,
                  );
                }}
              />
              {docDialog?.file && (
                <p className="text-xs text-muted-foreground">Current file: {docDialog.file}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDocDialog(null)} disabled={docSaving}>
              Cancel
            </Button>
            <Button onClick={saveDoc} disabled={docSaving}>
              {docSaving ? "Saving…" : docDialog?.mode === "edit" ? "Save changes" : "Add document"}
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
