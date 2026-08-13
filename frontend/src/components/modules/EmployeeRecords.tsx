import { useEffect, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  BadgeCheck,
  Clock,
  Download,
  FileText,
  FolderOpen,
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
import { departments, employees as seedEmployees, type Employee } from "@/data/hr";
import { useHireEmployees } from "@/data/hires";
import { TablePagination } from "@/components/ui/table-pagination";

import { isArchivable, lastUpdatedFor, recordMeta } from "@/data/records";
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

/** Deterministic pseudo-random helper so demo records stay stable per employee. */
const seedOf = (id: string) => id.split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 9973, 7);

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

const recordLogs: RecordLog[] = [
  {
    id: "LOG-001",
    timestamp: "2026-01-14 09:12",
    actor: "Juan Dela Cruz",
    action: "Added",
    target: "EMP-0004 · Camille Ortega (201 file)",
    department: "Front Office",
    notes: "New employee record created after onboarding approval.",
  },
  {
    id: "LOG-002",
    timestamp: "2026-01-15 13:47",
    actor: "Maria Lim",
    action: "Edited",
    target: "EMP-0006 · Marjun Devera (Employment information)",
    department: "Housekeeping",
    notes: "Updated department assignment after transfer.",
  },
  {
    id: "LOG-003",
    timestamp: "2026-01-16 10:05",
    actor: "Juan Dela Cruz",
    action: "Edited",
    target: "EMP-0002 · Chef Gabriel Mendoza (Personal information)",
    department: "Food & Beverage",
    notes: "Corrected contact number.",
  },
  {
    id: "LOG-004",
    timestamp: "2026-01-18 16:30",
    actor: "Paolo Cruz",
    action: "Deleted",
    target: "EMP-0009 · Test Record",
    department: "Human Resources",
    notes: "Removed duplicate record created in error.",
  },
  {
    id: "LOG-005",
    timestamp: "2026-01-20 08:55",
    actor: "Maria Lim",
    action: "Added",
    target: "EMP-0005 · Kevin Dela Cruz (NBI Clearance file)",
    department: "Engineering",
    notes: "Uploaded renewed NBI clearance to 201 file.",
  },
  {
    id: "LOG-006",
    timestamp: "2026-01-21 11:20",
    actor: "Juan Dela Cruz",
    action: "Deleted",
    target: "EMP-0003 · Lourdes Bautista (Expired Health Certificate)",
    department: "Front Office",
    notes: "Removed expired document after renewal was uploaded.",
  },
];

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

const civil = ["Single", "Married", "Widowed", "Separated"];
const genders = ["Female", "Male"];

function buildProfile(e: Employee): Profile {
  const s = seedOf(e.id);
  const missingPool = [
    "PSA Birth Certificate",
    "NBI Clearance (renewal)",
    "Latest Medical Exam",
    "TESDA Certificate",
  ];
  const missingCount = s % 3;
  return {
    birthDate: `19${80 + (s % 18)}-${String((s % 12) + 1).padStart(2, "0")}-${String(
      (s % 27) + 1,
    ).padStart(2, "0")}`,
    civilStatus: civil[s % civil.length]!,
    gender: genders[s % 2]!,
    nationality: "Filipino",
    address: `${(s % 300) + 1} Kalayaan Ave., Barangay Poblacion, Makati City`,
    personalEmail: `${e.name.split(" ")[0]!.toLowerCase()}.personal@email.com`,
    family: `Spouse / Parent: ${["Elena", "Ramon", "Teresa", "Miguel"][s % 4]} ${
      e.name.split(" ").slice(-1)[0]
    } · ${s % 4} dependent(s)`,
    emergencyName: `${["Elena", "Ramon", "Teresa", "Miguel"][(s + 1) % 4]} ${
      e.name.split(" ").slice(-1)[0]
    }`,
    emergencyPhone: `0917 ${String(100 + (s % 800))} ${String(1000 + (s % 8000))}`,
    emergencyRelation: ["Spouse", "Parent", "Sibling", "Guardian"][s % 4]!,
    sss: `34-${String(1000000 + ((s * 971) % 8999999))}-${s % 10}`,
    pagibig: `1211-${String(1000 + (s % 8999))}-${String(1000 + ((s * 7) % 8999))}`,
    philhealth: `02-${String(100000000 + ((s * 613) % 899999999))}-${s % 10}`,
    tin: `${String(100 + (s % 800))}-${String(100 + ((s * 3) % 800))}-${String(
      100 + ((s * 5) % 800),
    )}-000`,
    contract: `${e.employmentType} Employment Contract · signed ${e.dateHired}`,
    certificates: [
      "Basic Occupational Safety & Health",
      "Guest Service Excellence Training",
      ...(s % 2 ? ["TESDA NC II"] : []),
    ],
    licenses:
      s % 3 === 0 ? ["Food Handler's Permit", "Health Certificate"] : ["Health Certificate"],
    medical: ["Annual Physical Exam (2026)", "Drug Test Clearance"],
    missing: missingPool.slice(0, missingCount),
  };
}

function buildHistory(e: Employee): HistoryEntry[] {
  const s = seedOf(e.id);
  const list: HistoryEntry[] = [
    {
      id: `${e.id}-H1`,
      type: "Employment",
      date: e.dateHired,
      detail: `Hired as ${e.position} (${e.department})`,
    },
  ];
  if (s % 2 === 0)
    list.push({
      id: `${e.id}-H2`,
      type: "Promotion",
      date: `20${22 + (s % 3)}-0${(s % 8) + 1}-15`,
      detail: `Promoted to ${e.position}`,
    });
  if (s % 3 === 0)
    list.push({
      id: `${e.id}-H3`,
      type: "Transfer",
      date: `20${21 + (s % 4)}-1${s % 2}-02`,
      detail: `Transferred to ${e.department}`,
    });
  return list;
}

const emptyEmployee = {
  name: "",
  position: "",
  department: departments[0]?.name ?? "Front Office",
  employmentType: "Probationary" as Employee["employmentType"],
  dateHired: new Date().toISOString().slice(0, 10),
  email: "",
  phone: "",
  supervisor: "",
};

export function EmployeeRecords({ role }: { role: "superadmin" | "admin" }) {
  const isSuper = role === "superadmin";

  const hireEmployees = useHireEmployees();
  const [list, setList] = useState<Employee[]>(seedEmployees);

  /** Hires created in New Hire Onboarding show up here immediately. */
  useEffect(() => {
    setList((prev) => {
      const missing = hireEmployees.filter((e) => !prev.some((p) => p.id === e.id));
      return missing.length ? [...missing, ...prev] : prev;
    });
  }, [hireEmployees]);

  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("all");
  const [typeFilter, setTypeFilter] = useState<"all" | Employee["employmentType"]>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | Employee["status"]>("all");
  /** Supervisor picker options — existing employees plus an unassigned marker. */
  const supervisorOptions = ["—", ...Array.from(new Set(list.map((e) => e.name)))];
  const [selected, setSelected] = useState<string[]>([]);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [docType, setDocType] = useState(documentTypes[0]!);
  const [generatedDocs, setGeneratedDocs] = useState<GeneratedDoc[]>([]);
  const [generatedOpen, setGeneratedOpen] = useState(false);
  const [logSearch, setLogSearch] = useState("");
  const [logDept, setLogDept] = useState("all");
  const [archivedIds, setArchivedIds] = useState<string[]>(() =>
    recordMeta.filter((m) => isArchivable(m.lastUpdated)).map((m) => m.employeeId),
  );
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
  const [personalOverrides, setPersonalOverrides] = useState<
    Record<string, Record<string, string>>
  >({});
  const [docDialog, setDocDialog] = useState<{
    mode: "add" | "edit";
    index: number;
    name: string;
    file: string;
  } | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [personalForm, setPersonalForm] = useState<Record<string, string>>({});
  const [employmentForm, setEmploymentForm] = useState<Record<string, string>>({});

  const profile = list.find((e) => e.id === profileId) ?? null;

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


  const createEmployee = () => {
    if (!form.name.trim() || !form.position.trim()) {
      toast.error("Name and position are required");
      return;
    }
    const emp: Employee = {
      ...form,
      id: `EMP-${String(list.length + 1).padStart(4, "0")}`,
      status: "Active",
    };
    setList((prev) => [emp, ...prev]);
    setForm(emptyEmployee);
    setAddOpen(false);
    toast.success(`${emp.name} added to employee records`);
  };

  const removeEmployee = (id: string) => {
    setList((prev) => prev.filter((e) => e.id !== id));
    setProfileId(null);
    toast.success("Employee record deleted");
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
    const auto = recordMeta
      .filter((m) => olderThanYears(m.lastUpdated, Number(years)))
      .map((m) => m.employeeId);
    setArchivedIds(Array.from(new Set([...manualArchived, ...auto])));
    toast.success(`Auto-archiving records inactive for ${years}+ years`);
  };

  /** Documents currently on a 201 file (seeded from the fixture, then edited in place). */
  const docsFor = (emp: Employee): ProfileDoc[] => {
    const existing = docsById[emp.id];
    if (existing) return existing;
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

  const openPersonalEdit = () => {
    if (!profile) return;
    const p = { ...buildProfile(profile), ...(personalOverrides[profile.id] ?? {}) };
    setPersonalForm({
      name: profile.name,
      birthDate: String(p.birthDate),
      gender: String(p.gender),
      civilStatus: String(p.civilStatus),
      nationality: String(p.nationality),
      personalEmail: String(p.personalEmail),
      phone: profile.phone,
      address: String(p.address),
      emergencyName: String(p.emergencyName),
      emergencyRelation: String(p.emergencyRelation),
      emergencyPhone: String(p.emergencyPhone),
    });
  };

  const savePersonal = () => {
    if (!profile) return;
    const { name, phone, ...rest } = personalForm;
    setList((prev) =>
      prev.map((e) =>
        e.id === profile.id ? { ...e, name: name || e.name, phone: phone ?? e.phone } : e,
      ),
    );
    setPersonalOverrides((prev) => ({
      ...prev,
      [profile.id]: { ...(prev[profile.id] ?? {}), ...rest },
    }));
  };

  const openEmploymentEdit = () => {
    if (!profile) return;
    setEmploymentForm({
      position: profile.position,
      department: profile.department,
      status: profile.status,
      employmentType: profile.employmentType,
      dateHired: profile.dateHired,
      supervisor: profile.supervisor,
      email: profile.email,
    });
  };

  const saveEmployment = () => {
    if (!profile) return;
    setList((prev) =>
      prev.map((e) =>
        e.id === profile.id
          ? {
              ...e,
              position: employmentForm["position"] || e.position,
              department: employmentForm["department"] || e.department,
              status: (employmentForm["status"] as Employee["status"]) || e.status,
              employmentType:
                (employmentForm["employmentType"] as Employee["employmentType"]) ||
                e.employmentType,
              dateHired: employmentForm["dateHired"] || e.dateHired,
              supervisor: employmentForm["supervisor"] || e.supervisor,
              email: employmentForm["email"] || e.email,
            }
          : e,
      ),
    );
  };

  const openEdit = () => {
    openPersonalEdit();
    openEmploymentEdit();
    setEditMode(true);
  };

  const saveEdit = () => {
    savePersonal();
    saveEmployment();
    setEditMode(false);
    toast.success("Record updated");
  };

  const cancelEdit = () => setEditMode(false);

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
          <TabsTrigger value="list">Employee List</TabsTrigger>
          <TabsTrigger value="history">Record History</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl font-semibold">Employee List</h2>
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
                      {departments.map((d) => (
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
                                title={`Last updated ${lastUpdatedFor(e.id)}`}
                              >
                                Archived · since {lastUpdatedFor(e.id)}
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
                                setEditMode(false);
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
                  <h2 className="font-display text-2xl font-semibold">Record History</h2>
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
                      {departments.map((d) => (
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
              const p = { ...buildProfile(profile), ...(personalOverrides[profile.id] ?? {}) };
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

                  <Tabs value={profileTab} onValueChange={setProfileTab} className="flex min-h-0 flex-1 flex-col">
                    <TabsList className="flex h-auto flex-wrap justify-start">
                      <TabsTrigger value="personal">Personal Information</TabsTrigger>
                      <TabsTrigger value="documents">Documents</TabsTrigger>
                      <TabsTrigger value="history">Employment History</TabsTrigger>
                    </TabsList>

                    {isSuper && (
                      <div className="mt-3 flex h-12 flex-nowrap items-center gap-2 overflow-x-auto border-b border-border pb-3">
                        {profileTab === "personal" && (
                          <>
                            {!editMode ? (
                              <Button size="sm" variant="outline" onClick={openEdit}>
                                <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                              </Button>
                            ) : (
                              <>
                                <Button size="sm" onClick={saveEdit}>
                                  Save changes
                                </Button>
                                <Button size="sm" variant="outline" onClick={cancelEdit}>
                                  Cancel
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
                              onClick={() => removeEmployee(profile.id)}
                            >
                              <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete record
                            </Button>
                          </>
                        )}
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

                    <TabsContent value="personal" className="mt-2 min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
                      <Section title="Personal details">
                        <EF
                          label="Full name"
                          value={editMode ? (personalForm["name"] ?? "") : profile.name}
                          editing={editMode}
                          onChange={(v) => setPersonalForm((prev) => ({ ...prev, name: v }))}
                        />
                        <EF
                          label="Birth date"
                          value={editMode ? (personalForm["birthDate"] ?? "") : p.birthDate}
                          editing={editMode}
                          onChange={(v) => setPersonalForm((prev) => ({ ...prev, birthDate: v }))}
                        />
                        <EF
                          label="Gender"
                          value={editMode ? (personalForm["gender"] ?? "") : p.gender}
                          editing={editMode}
                          onChange={(v) => setPersonalForm((prev) => ({ ...prev, gender: v }))}
                        />
                        <EF
                          label="Civil status"
                          value={editMode ? (personalForm["civilStatus"] ?? "") : p.civilStatus}
                          editing={editMode}
                          onChange={(v) => setPersonalForm((prev) => ({ ...prev, civilStatus: v }))}
                        />
                        <EF
                          label="Nationality"
                          value={editMode ? (personalForm["nationality"] ?? "") : p.nationality}
                          editing={editMode}
                          onChange={(v) => setPersonalForm((prev) => ({ ...prev, nationality: v }))}
                        />
                      </Section>
                      <Section title="Contact information">
                        <Field k="Company email" v={profile.email} />
                        <EF
                          label="Personal email"
                          value={editMode ? (personalForm["personalEmail"] ?? "") : p.personalEmail}
                          editing={editMode}
                          onChange={(v) =>
                            setPersonalForm((prev) => ({ ...prev, personalEmail: v }))
                          }
                        />
                        <EF
                          label="Mobile number"
                          value={editMode ? (personalForm["phone"] ?? "") : profile.phone}
                          editing={editMode}
                          onChange={(v) => setPersonalForm((prev) => ({ ...prev, phone: v }))}
                        />
                        <EF
                          label="Home address"
                          value={editMode ? (personalForm["address"] ?? "") : p.address}
                          editing={editMode}
                          onChange={(v) => setPersonalForm((prev) => ({ ...prev, address: v }))}
                          wide
                        />
                      </Section>
                      <Section title="Family information">
                        <Field k="Family" v={p.family} wide />
                      </Section>
                      <Section title="Emergency contact">
                        <EF
                          label="Name"
                          value={editMode ? (personalForm["emergencyName"] ?? "") : p.emergencyName}
                          editing={editMode}
                          onChange={(v) =>
                            setPersonalForm((prev) => ({ ...prev, emergencyName: v }))
                          }
                        />
                        <EF
                          label="Relationship"
                          value={
                            editMode ? (personalForm["emergencyRelation"] ?? "") : p.emergencyRelation
                          }
                          editing={editMode}
                          onChange={(v) =>
                            setPersonalForm((prev) => ({ ...prev, emergencyRelation: v }))
                          }
                        />
                        <EF
                          label="Contact number"
                          value={
                            editMode ? (personalForm["emergencyPhone"] ?? "") : p.emergencyPhone
                          }
                          editing={editMode}
                          onChange={(v) =>
                            setPersonalForm((prev) => ({ ...prev, emergencyPhone: v }))
                          }
                        />
                      </Section>

                      <Section title="Employment information">
                        <Field k="Employee number" v={profile.id} />
                        <EF
                          label="Position"
                          value={editMode ? (employmentForm["position"] ?? "") : profile.position}
                          editing={editMode}
                          onChange={(v) => setEmploymentForm((prev) => ({ ...prev, position: v }))}
                        />
                        <ESelect
                          label="Department"
                          value={
                            editMode ? (employmentForm["department"] ?? "") : profile.department
                          }
                          editing={editMode}
                          options={departments.map((d) => d.name)}
                          onChange={(v) =>
                            setEmploymentForm((prev) => ({ ...prev, department: v }))
                          }
                        />
                        <Field k="Outlet / Branch" v="Oxford Suites Makati" />
                        <ESelect
                          label="Status"
                          value={editMode ? (employmentForm["status"] ?? "") : profile.status}
                          editing={editMode}
                          options={["Active", "Inactive"]}
                          onChange={(v) => setEmploymentForm((prev) => ({ ...prev, status: v }))}
                        />
                        <EF
                          label="Date hired"
                          value={editMode ? (employmentForm["dateHired"] ?? "") : profile.dateHired}
                          editing={editMode}
                          onChange={(v) => setEmploymentForm((prev) => ({ ...prev, dateHired: v }))}
                        />
                        <ESelect
                          label="Immediate supervisor"
                          value={
                            editMode ? (employmentForm["supervisor"] ?? "") : profile.supervisor
                          }
                          editing={editMode}
                          options={supervisorOptions}
                          onChange={(v) =>
                            setEmploymentForm((prev) => ({ ...prev, supervisor: v }))
                          }
                        />
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

                    <TabsContent value="documents" className="mt-3 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
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

                    <TabsContent value="history" className="mt-3 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
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
                            <div
                              key={h.id}
                              className="rounded-md border border-border p-2.5"
                            >
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
                  {departments.map((d) => (
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border px-3 py-1.5">
      <p className="eyebrow mb-1">{title}</p>
      <div className="grid gap-x-4 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </div>
  );
}

function Field({ k, v, wide }: { k: string; v: string; wide?: boolean }) {
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
