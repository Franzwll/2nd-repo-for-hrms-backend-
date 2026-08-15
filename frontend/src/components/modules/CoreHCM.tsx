import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  Award,
  Briefcase,
  Building2,
  CheckCircle2,
  DollarSign,
  Eye,
  GitBranch,
  History,
  Info,
  Pencil,
  Plus,
  Search,
  Send,
  Sparkles,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
  UserX,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/portal/PageHeader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { TablePagination } from "@/components/ui/table-pagination";
import { usePagination } from "@/hooks/usePagination";
import { Textarea } from "@/components/ui/textarea";
import {
  type Department,
  type OrgNode,
  type Position,
  type Employee,
  type SalaryGrade,
  type HR3Recommendation,
} from "@/data/hr";
import { hr3Recommendations as seedHr3Recommendations } from "@/data/hr";
import { cn } from "@/lib/utils";
import { useRequisitions } from "@/data/requisitions";
import { type Role } from "@/lib/nav";
import { buildProfile, Field, Section } from "./EmployeeRecords";
import {
  auditLogApi,
  hcmApi,
  type ApiAuditLog,
  type ApiDepartment,
  type ApiEmployee,
  type ApiOrgNode,
  type ApiPosition,
  type ApiSalaryGrade,
} from "@/lib/api";

const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const formatMoney = (val: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(val);

/* =========================================================================
   SHARED CORE HCM DATA LAYER
   ========================================================================= */

type HcmData = {
  employees: ApiEmployee[];
  departments: ApiDepartment[];
  positions: ApiPosition[];
  salaryGrades: ApiSalaryGrade[];
  orgChart: ApiOrgNode[];
};

let hcmData: HcmData = { employees: [], departments: [], positions: [], salaryGrades: [], orgChart: [] };
let hcmFetched = false;
const hcmListeners = new Set<() => void>();

function emitHcm() {
  hcmListeners.forEach((l) => l());
}

async function fetchHcmData() {
  try {
    const [emp, dep, pos, sg, org] = await Promise.all([
      hcmApi.employees.list({ per_page: 500 }),
      hcmApi.departments.list({ per_page: 500 }),
      hcmApi.positions.list({ per_page: 500 }),
      hcmApi.salaryGrades.list({ per_page: 500 }),
      hcmApi.orgChart.list(),
    ]);
    hcmData = {
      employees: emp.data ?? [],
      departments: dep.data ?? [],
      positions: pos.data ?? [],
      salaryGrades: sg.data ?? [],
      orgChart: org.data ?? [],
    };
  } catch (err) {
    console.warn("Could not load Core HCM data.", err);
  }
  emitHcm();
}

function getHcmSnapshot() {
  if (!hcmFetched && typeof window !== "undefined") {
    hcmFetched = true;
    fetchHcmData();
  }
  return hcmData;
}

function subscribeHcm(listener: () => void) {
  hcmListeners.add(listener);
  if (!hcmFetched) {
    hcmFetched = true;
    fetchHcmData();
  }
  return () => {
    hcmListeners.delete(listener);
  };
}

function useHcmData() {
  return useSyncExternalStore(subscribeHcm, getHcmSnapshot);
}

async function refreshHcm() {
  hcmFetched = false;
  hcmData = { employees: [], departments: [], positions: [], salaryGrades: [], orgChart: [] };
  await fetchHcmData();
}

function toUiEmployee(e: ApiEmployee, employees: ApiEmployee[], sGrades: ApiSalaryGrade[]): Employee {
  const supervisor = e.supervisor_employee_id
    ? employees.find((x) => x.employee_id === e.supervisor_employee_id)
    : undefined;
  const sg = e.salary_grade_id ? sGrades.find((g) => g.salary_grade_id === e.salary_grade_id) : undefined;
  const status = e.status === "On Leave" ? "Active" : (e.status as Employee["status"]) || "Active";
  return {
    id: e.employee_code,
    name: e.full_name,
    position: e.position_title,
    department: e.department_name,
    employmentType: e.employment_type === "Contractual" ? "Contractual" : e.employment_type,
    dateHired: e.date_hired || "",
    email: e.email,
    phone: e.phone || "",
    supervisor: supervisor?.full_name ?? "",
    status,
    salaryGrade: sg?.code ?? "SG-08",
  };
}

function toUiDepartment(d: ApiDepartment): Department {
  return {
    code: d.code,
    name: d.name,
    description: d.description || "",
    head: d.head || "Unassigned",
    staff: d.staff_count ?? 0,
    openRequisitions: 0,
    budget: Number(d.budget) || 0,
  };
}

function toUiPosition(p: ApiPosition, sGrades: ApiSalaryGrade[]): Position {
  const sg = p.salary_grade_id ? sGrades.find((g) => g.salary_grade_id === p.salary_grade_id) : undefined;
  return {
    id: p.position_code,
    title: p.title,
    department: p.department_name || "",
    level: (p.level as Position["level"]) || "Rank & File",
    headcount: p.headcount,
    filled: p.filled_count,
    salaryBand: sg ? `${sg.code} (${formatMoney(Number(sg.min_salary))} – ${formatMoney(Number(sg.max_salary))})` : p.salary_grade || "",
  };
}

function toUiSalaryGrade(g: ApiSalaryGrade): SalaryGrade {
  return {
    id: g.code,
    code: g.code,
    title: g.title,
    minSalary: Number(g.min_salary),
    maxSalary: Number(g.max_salary),
    currency: g.currency_code,
    level: (g.level as SalaryGrade["level"]) || "Rank & File",
    notes: g.notes || "",
  };
}

function buildOrgTree(orgNodes: ApiOrgNode[], employees: ApiEmployee[]): OrgNode {
  const gm = employees.find((e) => e.position_title === "General Manager");
  const root: OrgNode = {
    name: gm?.full_name || "General Management",
    title: gm?.position_title || "Hotel Leadership",
    children: [],
  };
  for (const node of orgNodes) {
    const staff = employees.filter((e) => e.department_id === node.department_id);
    const head = node.head;
    root.children!.push({
      name: head?.full_name || node.name,
      title: head?.position_title || node.name,
      children: staff
        .filter((e) => e.employee_id !== head?.employee_id)
        .map((e) => ({ name: e.full_name, title: e.position_title })),
    });
  }
  return root;
}

/* =========================================================================
   1. ORGANIZATIONAL CHART MODULE
   ========================================================================= */

export function OrgChartModule({ role = "admin" }: { role?: Role }) {
  const [activeTab, setActiveTab] = useState<"org" | "employees" | "logs">(() => {
    const saved = typeof window !== "undefined" ? window.sessionStorage.getItem("hcm-org-tab") : null;
    return (saved === "org" || saved === "employees" || saved === "logs" ? saved : "org") as "org" | "employees" | "logs";
  });
  const [empSearch, setEmpSearch] = useState("");

  useEffect(() => {
    window.sessionStorage.setItem("hcm-org-tab", activeTab);
  }, [activeTab]);

  const viewEmployeeInList = (name: string) => {
    setEmpSearch(name);
    setActiveTab("employees");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Core HCM · Human Capital Management"
        title="Organizational Structure & Employee Roster"
        description="Visualize reporting hierarchy, manage employee regularization & promotions, and track lifecycle transitions."
      />

      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="space-y-6">
        <TabsList className="inline-flex h-auto flex-wrap justify-start rounded-xl border border-border/70 bg-muted/70 p-1 shadow-sm text-muted-foreground">
          <TabsTrigger value="org" className="rounded-lg px-4 py-2 text-xs font-semibold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm cursor-pointer">
            <GitBranch className="mr-1.5 h-4 w-4" /> Org Chart
          </TabsTrigger>
          <TabsTrigger value="employees" className="rounded-lg px-4 py-2 text-xs font-semibold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm cursor-pointer">
            <Users className="mr-1.5 h-4 w-4" /> Employee List
          </TabsTrigger>
          <TabsTrigger value="logs" className="rounded-lg px-4 py-2 text-xs font-semibold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm cursor-pointer">
            <History className="mr-1.5 h-4 w-4" /> Lifecycle Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="org" className="space-y-6">
          <OrgChartVisualizer onViewEmployee={viewEmployeeInList} />
        </TabsContent>

        <TabsContent value="employees" className="space-y-6">
          <EmployeeListManager role={role} empSearch={empSearch} onEmpSearchChange={setEmpSearch} />
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <LifecycleLogsViewer />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* --- Org Chart Visualizer --- */
function OrgChartVisualizer({ onViewEmployee }: { onViewEmployee: (name: string) => void }) {
  const hcm = useHcmData();
  const [selectedNode, setSelectedNode] = useState<OrgNode | null>(null);
  const [scale, setScale] = useState(0.58);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number; offsetX: number; offsetY: number; moved: boolean } | null>(null);

  const employees = useMemo(() => hcm.employees.map((e) => toUiEmployee(e, hcm.employees, hcm.salaryGrades)), [hcm]);
  const departments = useMemo(() => hcm.departments.map(toUiDepartment), [hcm]);
  const orgTree = useMemo(() => buildOrgTree(hcm.orgChart, hcm.employees), [hcm]);

  const selectedEmployee = employees.find((employee) => employee.name === selectedNode?.name);
  const selectedDepartment = departments.find(
    (d) => d.head === selectedNode?.name || d.name === selectedEmployee?.department,
  );
  const departmentStaff = selectedDepartment
    ? employees.filter(
        (employee) =>
          employee.department === selectedDepartment.name &&
          employee.name !== selectedDepartment.head
      )
    : [];
  const headEmployee = selectedDepartment
    ? employees.find((employee) => employee.name === selectedDepartment.head)
    : null;

  const beginDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    dragStart.current = { x: event.clientX, y: event.clientY, offsetX: offset.x, offsetY: offset.y, moved: false };
  };
  const drag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStart.current) return;
    const dx = event.clientX - dragStart.current.x;
    const dy = event.clientY - dragStart.current.y;
    if (!dragStart.current.moved) {
      if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
      dragStart.current.moved = true;
      setDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    setOffset({ x: dragStart.current.offsetX + dx, y: dragStart.current.offsetY + dy });
  };
  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragStart.current?.moved) {
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        /* capture may already have been released */
      }
    }
    dragStart.current = null;
    setDragging(false);
  };

  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="p-6">
        <div className="mb-6 border-b border-border/60 pb-4">
          <h2 className="font-display text-xl font-semibold">Hierarchy Chart</h2>
          <p className="text-xs text-muted-foreground">
            Property reporting lines from General Management to department staff.
          </p>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div
            className="relative min-h-[35rem] touch-none overflow-hidden rounded-xl border border-border bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] bg-[size:16px_16px] cursor-grab active:cursor-grabbing"
            onPointerDown={beginDrag}
            onPointerMove={drag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            {!dragging && (
              <div className="pointer-events-none absolute left-4 top-4 z-20 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-muted-foreground shadow-sm">Drag to explore · click any card for details</div>
            )}

            <div className="absolute top-4 right-4 z-10 flex items-center gap-1 rounded-xl border border-border/80 bg-card/95 backdrop-blur-md p-1 shadow-lg">
              <Button size="icon" variant="ghost" className="h-7 w-7 cursor-pointer" aria-label="Zoom out" onClick={() => setScale((value) => Math.max(0.35, value - 0.08))}><ZoomOut className="h-4 w-4" /></Button>
              <span className="min-w-10 text-center text-xs font-semibold">{Math.round(scale * 100)}%</span>
              <Button size="icon" variant="ghost" className="h-7 w-7 cursor-pointer" aria-label="Zoom in" onClick={() => setScale((value) => Math.min(1.25, value + 0.08))}><ZoomIn className="h-4 w-4" /></Button>
              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs font-semibold cursor-pointer" onClick={() => { setScale(0.58); setOffset({ x: 0, y: 0 }); }}>Reset</Button>
            </div>

            <div className="absolute left-1/2 top-8 origin-top" style={{ transform: `translate(calc(-50% + ${offset.x}px), ${offset.y}px) scale(${scale})`, transition: dragStart.current ? "none" : "transform 150ms ease-out" }}>
              <div className="min-w-[980px] py-4"><OrgTree node={orgTree} root onSelect={setSelectedNode} /></div>
            </div>
          </div>

          <aside className="space-y-4 rounded-xl border border-border bg-muted/25 p-4">
            {selectedDepartment ? (
              <div>
                <p className="eyebrow">Department overview</p>
                <h3 className="mt-1 font-display text-2xl font-semibold">{selectedDepartment.name}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{selectedDepartment.description}</p>

                <button
                  type="button"
                  onClick={() => onViewEmployee(selectedDepartment.head)}
                  className="mt-4 w-full text-left rounded-xl border border-primary/30 bg-card p-3 shadow-xs transition-all hover:border-primary hover:bg-primary/5 hover:shadow-md cursor-pointer group"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Head supervisor</p>
                  <p className="mt-1 text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{selectedDepartment.head}</p>
                  <p className="text-xs text-muted-foreground">{headEmployee?.position ?? "Department Head"}</p>
                </button>

                <div className="mt-4 flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Team members</p><Badge variant="secondary">{departmentStaff.length}</Badge></div>
                <div className="mt-2 max-h-64 space-y-1 overflow-y-auto pr-1">
                  {departmentStaff.length > 0 ? (
                    departmentStaff.map((employee) => (
                      <div key={employee.id} className="flex w-full items-center justify-between rounded-md bg-card px-2.5 py-2 text-left text-xs">
                        <span>
                          <span className="block font-medium">{employee.name}</span>
                          <span className="text-muted-foreground">{employee.position}</span>
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs text-primary hover:bg-primary/10"
                          onClick={() => onViewEmployee(employee.name)}
                        >
                          <Eye className="mr-1 h-3.5 w-3.5" /> View
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-md border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                      No current employees assigned to this department yet.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                Select an employee card on the chart to view their department here.
              </div>
            )}
          </aside>
        </div>
      </CardContent>
    </Card>
  );
}

function OrgNodeCard({ node, root = false, onSelect }: { node: OrgNode; root?: boolean; onSelect: (n: OrgNode) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(node)}
      className={cn(
        "group relative inline-flex min-w-[200px] flex-col items-center rounded-xl border px-4 py-3.5 text-center shadow-md transition-all cursor-pointer hover:scale-[1.03] hover:border-primary hover:ring-2 hover:ring-gold/60 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        root ? "border-primary bg-primary/10 ring-2 ring-primary/40" : "border-border/80 bg-card"
      )}
    >
      <Avatar className="h-11 w-11 shadow-xs border border-border/60">
        <AvatarFallback className={cn("text-xs font-bold", root ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground")}>
          {initialsOf(node.name)}
        </AvatarFallback>
      </Avatar>
      <p className="mt-2 text-sm font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">{node.name}</p>
      <p className="text-xs text-muted-foreground">{node.title}</p>
    </button>
  );
}

function OrgTree({ node, root = false, onSelect }: { node: OrgNode; root?: boolean; onSelect: (n: OrgNode) => void }) {
  return (
    <div className="flex flex-col items-center">
      <OrgNodeCard node={node} root={root} onSelect={onSelect} />
      {node.children && node.children.length > 0 && (
        <div className="flex flex-col items-center">
          <div className="h-6 w-px bg-border" />
          <div className="relative flex justify-center">
            {node.children.length > 1 && (
              <div className="absolute top-0 h-px bg-border" style={{ left: "15%", right: "15%" }} />
            )}
            <div className="flex gap-8 pt-6">
              {node.children.map((child) => (
                <div key={child.name} className="relative flex flex-col items-center">
                  <div className="absolute -top-6 h-6 w-px bg-border" />
                  <OrgTree node={child} onSelect={onSelect} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* --- Employee List Manager --- */
function EmployeeListManager({
  role,
  empSearch,
  onEmpSearchChange,
}: {
  role: Role;
  empSearch: string;
  onEmpSearchChange: (value: string) => void;
}) {
  const hcm = useHcmData();
  const employeeIdByCode = useMemo(
    () => new Map(hcm.employees.map((e) => [e.employee_code, e.employee_id])),
    [hcm.employees]
  );
  const [empList, setEmpList] = useState<Employee[]>([]);

  useEffect(() => {
    setEmpList(hcm.employees.map((e) => toUiEmployee(e, hcm.employees, hcm.salaryGrades)));
  }, [hcm]);

  const [empDeptFilter, setEmpDeptFilter] = useState("all");
  const [empStatusFilter, setEmpStatusFilter] = useState("all");
  const [empTypeFilter, setEmpTypeFilter] = useState("all");

  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(new Set());
  const [showViewAllRecs, setShowViewAllRecs] = useState(false);
  const [recommendations, setRecommendations] = useState<HR3Recommendation[]>(seedHr3Recommendations);
  const [recStatusFilter, setRecStatusFilter] = useState("all");
  const [recTypeFilter, setRecTypeFilter] = useState("all");
  const filteredRecs = recommendations.filter(
    (r) =>
      (recStatusFilter === "all" ||
        (recStatusFilter === "Acknowledged" && acknowledgedIds.has(r.employeeId) && r.status === "Pending HR Action") ||
        recStatusFilter === r.status) &&
      (recTypeFilter === "all" || r.recommendationType === recTypeFilter)
  );
  const recPage = usePagination(filteredRecs);

  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [viewingEmpInfo, setViewingEmpInfo] = useState<Employee | null>(null);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [editEmpForm, setEditEmpForm] = useState({
    name: "",
    position: "",
    department: "",
    email: "",
    phone: "",
    employmentType: "Regular" as Employee["employmentType"],
    dateHired: "",
    supervisor: "",
  });
  const [showEditEmpModal, setShowEditEmpModal] = useState(false);
  const [pendingEmpUnsaved, setPendingEmpUnsaved] = useState(false);
  const [origEmpForm, setOrigEmpForm] = useState({ ...editEmpForm });
  const empHasChanges = JSON.stringify(editEmpForm) !== JSON.stringify(origEmpForm);

  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  const [newPosition, setNewPosition] = useState("");
  const [newSalaryGrade, setNewSalaryGrade] = useState("SG-10");
  const [promotionNotes, setPromotionNotes] = useState("");

  const [exitType, setExitType] = useState<"Resigned" | "Retired" | "Terminated">("Resigned");
  const [exitNotes, setExitNotes] = useState("");

  const [pendingConfirm, setPendingConfirm] = useState<{ type: "save_promote" | "save_exit" | "regularize"; data?: any } | null>(null);
  const [pendingUnsavedExit, setPendingUnsavedExit] = useState<{ target: "promote" | "exit" } | null>(null);

  const hasPendingRec = (empId: string) =>
    recommendations.some((r) => r.employeeId === empId && r.status === "Pending HR Action");

  const isAcknowledged = (empId: string) => acknowledgedIds.has(empId);

  const canActOnEmployee = (empId: string) => isAcknowledged(empId) || !hasPendingRec(empId);

  const filteredEmployees = empList.filter((e) => {
    const q = empSearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      e.name.toLowerCase().includes(q) ||
      e.id.toLowerCase().includes(q) ||
      e.position.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q);
    const matchesDept = empDeptFilter === "all" || e.department === empDeptFilter;
    const matchesStatus = empStatusFilter === "all" || e.status === empStatusFilter;
    const matchesType = empTypeFilter === "all" || e.employmentType === empTypeFilter;
    return matchesSearch && matchesDept && matchesStatus && matchesType;
  });

  const empPage = usePagination(filteredEmployees);
  const deptOptions = Array.from(new Set(empList.map((e) => e.department))).sort();

  const executeRegularization = async (emp: Employee) => {
    const dbId = employeeIdByCode.get(emp.id);
    if (!dbId) {
      toast.error(`Could not resolve ${emp.id} in Core HCM.`);
      return;
    }
    try {
      await hcmApi.employees.regularize(dbId, {
        effective_date: new Date().toISOString().slice(0, 10),
        notes: "Regularized via HR3 evaluation handoff.",
      });
      toast.success(`${emp.name} has passed evaluation and is now a Regular Employee! User account active.`);
      await refreshHcm();
    } catch (err) {
      const status = (err as { status?: number }).status;
      toast.error(status === 403 ? "You do not have permission to perform this action." : "Could not regularize employee.");
      return;
    }

    setRecommendations((prev) =>
      prev.map((r) => (r.employeeId === emp.id ? { ...r, status: "Approved & Processed" as const } : r))
    );
  };

  const executePromotion = async () => {
    if (!selectedEmp || !newPosition) return;
    const dbId = employeeIdByCode.get(selectedEmp.id);
    if (!dbId) {
      toast.error(`Could not resolve ${selectedEmp.id} in Core HCM.`);
      return;
    }
    const pos = hcm.positions.find((p) => p.title === newPosition || p.position_code === newPosition);
    const sg = hcm.salaryGrades.find((g) => g.code === newSalaryGrade);
    if (!pos) {
      toast.error(`Position "${newPosition}" does not exist in Core HCM.`);
      return;
    }
    try {
      await hcmApi.employees.promote(dbId, {
        effective_date: new Date().toISOString().slice(0, 10),
        new_position_id: pos.position_id,
        new_salary_grade_id: sg?.salary_grade_id,
        notes: promotionNotes || "HR3 Succession planning promotion",
      });
      toast.success(`Promoted ${selectedEmp.name} to ${newPosition}! Salary Grade updated.`);
      await refreshHcm();
    } catch (err) {
      const status = (err as { status?: number }).status;
      toast.error(status === 403 ? "You do not have permission to perform this action." : "Could not promote employee.");
      return;
    }

    setRecommendations((prev) =>
      prev.map((r) => (r.employeeId === selectedEmp.id ? { ...r, status: "Approved & Processed" as const } : r))
    );

    setShowPromoteModal(false);
    setSelectedEmp(null);
    setNewPosition("");
    setPromotionNotes("");
  };

  const executeExit = async () => {
    if (!selectedEmp) return;
    const dbId = employeeIdByCode.get(selectedEmp.id);
    if (!dbId) {
      toast.error(`Could not resolve ${selectedEmp.id} in Core HCM.`);
      return;
    }
    try {
      await hcmApi.employees.exit(dbId, {
        effective_date: new Date().toISOString().slice(0, 10),
        exit_type: exitType,
        exit_date: new Date().toISOString().slice(0, 10),
        notes: exitNotes || `Employee exit via ${exitType}`,
      });
      toast.warning(`Exit processed for ${selectedEmp.name} (${exitType}). System user account disabled.`);
      await refreshHcm();
    } catch (err) {
      const status = (err as { status?: number }).status;
      toast.error(status === 403 ? "You do not have permission to perform this action." : "Could not process exit.");
      return;
    }
    setShowExitModal(false);
    setSelectedEmp(null);
    setExitNotes("");
  };

  const executeSaveEmployee = async () => {
    if (!editingEmp) return;
    const dbId = employeeIdByCode.get(editingEmp.id);
    if (!dbId) {
      toast.error(`Could not resolve ${editingEmp.id} in Core HCM.`);
      return;
    }
    try {
      await hcmApi.employees.update(dbId, {
        first_name: editEmpForm.name.split(" ")[0] || editEmpForm.name,
        last_name: editEmpForm.name.split(" ").slice(1).join(" ") || editEmpForm.name,
        email: editEmpForm.email,
        phone: editEmpForm.phone,
        position_title: editEmpForm.position,
        department_name: editEmpForm.department,
        employment_type: editEmpForm.employmentType,
        date_hired: editEmpForm.dateHired,
      });
      toast.success(`Employee ${editEmpForm.name} updated.`);
      await refreshHcm();
    } catch (err) {
      const status = (err as { status?: number }).status;
      toast.error(status === 403 ? "You do not have permission to modify employees." : "Could not update employee.");
      return;
    }
    setShowEditEmpModal(false);
    setEditingEmp(null);
  };

  return (
    <div className="space-y-6">
      {/* PERFORMANCE & DEVELOPMENT (HR3) EVALUATION RECOMMENDATIONS CARD */}
      <Card className="border-gold/40 bg-gradient-to-r from-gold-soft/30 via-background to-background shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center text-gold">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <CardTitle className="font-display text-lg font-semibold">
                  Performance & Development Handoff (HR3 Evaluations)
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Prerequisites for employee Regularization and Promotion based on recent performance scores.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-gold/50 bg-gold/10 text-gold-foreground text-xs">
                HR3 Evaluation Sync Active
              </Badge>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs border-gold/50 text-gold-foreground hover:bg-gold/10"
                onClick={() => setShowViewAllRecs(true)}
              >
                View All
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="grid gap-3 sm:grid-cols-3">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className={cn(
                  "flex flex-col justify-between rounded-lg border p-3.5 transition-all",
                  rec.status === "Approved & Processed"
                    ? "border-success/30 bg-success/5 opacity-70"
                    : acknowledgedIds.has(rec.employeeId)
                    ? "border-primary/30 bg-primary/5 shadow-2xs"
                    : "border-border/80 bg-card hover:border-gold/60 shadow-2xs"
                )}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-sm">{rec.employeeName}</span>
                    <Badge
                      variant="outline"
                      className={
                        rec.recommendationType === "Regularization"
                          ? "border-primary/40 bg-primary/10 text-primary text-[10px]"
                          : "border-gold/50 bg-gold/10 text-gold-foreground text-[10px]"
                      }
                    >
                      {rec.recommendationType}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{rec.department} · Score: <strong className="text-foreground">{rec.evaluationScore}%</strong></p>
                  <p className="mt-2 text-xs text-muted-foreground italic line-clamp-2">"{rec.comments}"</p>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2.5">
                  <span className="text-[11px] text-muted-foreground">
                    {acknowledgedIds.has(rec.employeeId) && rec.status === "Pending HR Action"
                      ? "Acknowledged — ready for action"
                      : rec.status}
                  </span>
                  {rec.status === "Pending HR Action" && !acknowledgedIds.has(rec.employeeId) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs border-gold/50 text-gold-foreground hover:bg-gold/10"
                      onClick={() => {
                        setAcknowledgedIds((prev) => new Set([...prev, rec.employeeId]));
                      }}
                    >
                      <UserCheck className="mr-1 h-3.5 w-3.5" /> Acknowledge
                    </Button>
                  )}
                  {rec.status === "Pending HR Action" && acknowledgedIds.has(rec.employeeId) && (
                    <Badge variant="outline" className="border-success/40 bg-success/10 text-success text-[10px]">
                      ✓ Acknowledged
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* VIEW ALL HR3 RECOMMENDATIONS DIALOG */}
      <Dialog open={showViewAllRecs} onOpenChange={setShowViewAllRecs}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-gold" />
              All Performance & Development Handoff Requests
            </DialogTitle>
            <DialogDescription>
              Full list of HR3 evaluation recommendations sent to Core HCM for action.
            </DialogDescription>
          </DialogHeader>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Select value={recStatusFilter} onValueChange={setRecStatusFilter}>
              <SelectTrigger className="h-8 w-44 text-xs bg-card">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="Pending HR Action">Pending HR Action</SelectItem>
                <SelectItem value="Acknowledged">Acknowledged</SelectItem>
                <SelectItem value="Approved & Processed">Approved & Processed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={recTypeFilter} onValueChange={setRecTypeFilter}>
              <SelectTrigger className="h-8 w-44 text-xs bg-card">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="Regularization">Regularization</SelectItem>
                <SelectItem value="Promotion">Promotion</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead>Comments</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recPage.pageItems.map((rec) => (
                  <TableRow key={rec.id}>
                    <TableCell className="font-semibold text-sm">{rec.employeeName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{rec.department}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          rec.recommendationType === "Regularization"
                            ? "border-primary/40 bg-primary/10 text-primary text-[10px]"
                            : "border-gold/50 bg-gold/10 text-gold-foreground text-[10px]"
                        }
                      >
                        {rec.recommendationType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-mono text-xs font-semibold">{rec.evaluationScore}%</TableCell>
                    <TableCell className="text-xs text-muted-foreground italic max-w-xs truncate">{rec.comments}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          rec.status === "Approved & Processed"
                            ? "border-success/40 bg-success/10 text-success text-[10px]"
                            : acknowledgedIds.has(rec.employeeId)
                            ? "border-primary/40 bg-primary/10 text-primary text-[10px]"
                            : "border-gold/40 text-gold text-[10px]"
                        }
                      >
                        {acknowledgedIds.has(rec.employeeId) && rec.status === "Pending HR Action"
                          ? "Acknowledged"
                          : rec.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-3">
            <TablePagination
              page={recPage.page}
              pageCount={recPage.pageCount}
              from={recPage.from}
              to={recPage.to}
              total={recPage.total}
              label="recommendations"
              onPageChange={recPage.setPage}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewAllRecs(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MAIN EMPLOYEE ROSTER CARD */}
      <Card className="border-border/70 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 font-display text-xl font-semibold"><Users className="h-5 w-5 text-primary" /> Employee Roster</h2>
              <p className="text-xs text-muted-foreground">
                {filteredEmployees.length} record{filteredEmployees.length !== 1 ? "s" : ""} found
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[14rem]">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="h-9 border-border bg-card pl-8 text-xs shadow-2xs"
                  placeholder="Search name, ID, position…"
                  value={empSearch}
                  onChange={(e) => onEmpSearchChange(e.target.value)}
                />
              </div>
              <Select value={empDeptFilter} onValueChange={setEmpDeptFilter}>
                <SelectTrigger className="h-9 w-44 text-xs bg-card shadow-2xs">
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All departments</SelectItem>
                  {deptOptions.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={empTypeFilter} onValueChange={setEmpTypeFilter}>
                <SelectTrigger className="h-9 w-36 text-xs bg-card shadow-2xs">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="Probationary">Probationary</SelectItem>
                  <SelectItem value="Regular">Regular</SelectItem>
                </SelectContent>
              </Select>
              <Select value={empStatusFilter} onValueChange={setEmpStatusFilter}>
                <SelectTrigger className="h-9 w-36 text-xs bg-card shadow-2xs">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Resigned">Resigned</SelectItem>
                  <SelectItem value="Retired">Retired</SelectItem>
                  <SelectItem value="Terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Position & Grade</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date Hired</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Details</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {empPage.pageItems.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-mono text-xs font-medium">{e.id}</TableCell>
                    <TableCell className="font-medium">{e.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{e.department}</TableCell>
                    <TableCell className="text-xs">
                      <div>{e.position}</div>
                      <div className="text-[11px] text-muted-foreground">{e.salaryGrade || "SG-08"}</div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          e.employmentType === "Regular"
                            ? "border-success/40 text-success text-[11px]"
                            : e.employmentType === "Probationary"
                            ? "border-gold/40 text-gold text-[11px]"
                            : "border-border text-[11px]"
                        }
                      >
                        {e.employmentType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{e.dateHired}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          e.status === "Active"
                            ? "border-success/40 bg-success/10 text-success text-[11px]"
                            : e.status === "Resigned" || e.status === "Retired" || e.status === "Terminated"
                            ? "border-destructive/40 bg-destructive/10 text-destructive text-[11px]"
                            : "border-border text-muted-foreground text-[11px]"
                        }
                      >
                        {e.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2.5 text-xs bg-muted/30 hover:bg-primary/10 hover:text-primary hover:border-primary/40"
                        onClick={() => setViewingEmpInfo(e)}
                      >
                        <Info className="mr-1.5 h-3.5 w-3.5 text-primary" /> View Info
                      </Button>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2 text-xs"
                          onClick={() => {
                            setEditingEmp(e);
                            setEditEmpForm({
                              name: e.name,
                              position: e.position,
                              department: e.department,
                              email: e.email,
                              phone: e.phone,
                              employmentType: e.employmentType,
                              dateHired: e.dateHired,
                              supervisor: e.supervisor,
                            });
                            setOrigEmpForm({
                              name: e.name,
                              position: e.position,
                              department: e.department,
                              email: e.email,
                              phone: e.phone,
                              employmentType: e.employmentType,
                              dateHired: e.dateHired,
                              supervisor: e.supervisor,
                            });
                            setShowEditEmpModal(true);
                          }}
                        >
                          <Pencil className="mr-1 h-3 w-3" /> Edit
                        </Button>

                        {e.employmentType === "Probationary" && e.status === "Active" && canActOnEmployee(e.id) && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2 text-xs border-success/50 text-success hover:bg-success/10"
                            onClick={() => setPendingConfirm({ type: "regularize", data: e })}
                          >
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Regularize
                          </Button>
                        )}

                        {e.status === "Active" && e.employmentType !== "Probationary" && canActOnEmployee(e.id) && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2 text-xs"
                            onClick={() => {
                              setSelectedEmp(e);
                              setNewPosition(e.position);
                              setNewSalaryGrade(e.salaryGrade || "SG-10");
                              setShowPromoteModal(true);
                            }}
                          >
                            <TrendingUp className="mr-1 h-3.5 w-3.5 text-primary" /> Promote
                          </Button>
                        )}

                        {e.status === "Active" && hasPendingRec(e.id) && !isAcknowledged(e.id) && (
                          <span className="text-[10px] text-muted-foreground italic pr-1">Acknowledge first</span>
                        )}

                        {e.status === "Active" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              setSelectedEmp(e);
                              setShowExitModal(true);
                            }}
                          >
                            <UserX className="mr-1 h-3.5 w-3.5" /> Exit
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <TablePagination
            page={empPage.page}
            pageCount={empPage.pageCount}
            from={empPage.from}
            to={empPage.to}
            total={empPage.total}
            label="employees"
            onPageChange={empPage.setPage}
          />
        </CardContent>
      </Card>

      {/* VIEW EMPLOYEE INFO MODAL */}
      <Dialog open={!!viewingEmpInfo} onOpenChange={(open) => !open && setViewingEmpInfo(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          {viewingEmpInfo &&
            (() => {
              const p = buildProfile(viewingEmpInfo);
              return (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                      <Avatar className="h-11 w-11">
                        <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                          {initialsOf(viewingEmpInfo.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-display text-xl font-bold">{viewingEmpInfo.name}</div>
                        <div className="text-xs text-muted-foreground">{viewingEmpInfo.position} · {viewingEmpInfo.department} · {viewingEmpInfo.id}</div>
                      </div>
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-1.5 text-sm">
                    <Section title="Personal details">
                      <Field k="Full name" v={viewingEmpInfo.name} />
                      <Field k="Birth date" v={p.birthDate} />
                      <Field k="Gender" v={p.gender} />
                      <Field k="Civil status" v={p.civilStatus} />
                      <Field k="Nationality" v={p.nationality} />
                    </Section>
                    <Section title="Contact information">
                      <Field k="Company email" v={viewingEmpInfo.email} />
                      <Field k="Personal email" v={p.personalEmail} />
                      <Field k="Mobile number" v={viewingEmpInfo.phone} />
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
                      <Field k="Employee number" v={viewingEmpInfo.id} />
                      <Field k="Position" v={viewingEmpInfo.position} />
                      <Field k="Department" v={viewingEmpInfo.department} />
                      <Field k="Outlet / Branch" v="Oxford Suites Makati" />
                      <Field k="Status" v={viewingEmpInfo.status} />
                      <Field k="Date hired" v={viewingEmpInfo.dateHired} />
                      <Field k="Immediate supervisor" v={viewingEmpInfo.supervisor} />
                      <Field k="Shift" v="AM Shift · 07:00 – 16:00" />
                      <Field k="Rate" v={`${viewingEmpInfo.employmentType} · ${p.contract.split(" · ")[0]}`} />
                    </Section>
                    <Section title="Government IDs">
                      <Field k="SSS number" v={p.sss} />
                      <Field k="Pag-IBIG MID" v={p.pagibig} />
                      <Field k="PhilHealth number" v={p.philhealth} />
                      <Field k="TIN" v={p.tin} />
                    </Section>
                  </div>

                  <DialogFooter>
                    <Button onClick={() => setViewingEmpInfo(null)}>Close</Button>
                  </DialogFooter>
                </>
              );
            })()}
        </DialogContent>
      </Dialog>

      {/* EDIT EMPLOYEE MODAL */}
      <Dialog
        open={showEditEmpModal}
        onOpenChange={(open) => {
          if (!open && empHasChanges) {
            setPendingEmpUnsaved(true);
          } else if (!open) {
            setShowEditEmpModal(false);
            setEditingEmp(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" /> Edit Employee — {editingEmp?.name}
            </DialogTitle>
            <DialogDescription>Update employee profile information in Core HCM.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-1">
              <Label className="text-xs">Full Name</Label>
              <Input value={editEmpForm.name} onChange={(e) => setEditEmpForm({ ...editEmpForm, name: e.target.value })} className="text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Position</Label>
                <Input value={editEmpForm.position} onChange={(e) => setEditEmpForm({ ...editEmpForm, position: e.target.value })} className="text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Department</Label>
                <Input value={editEmpForm.department} onChange={(e) => setEditEmpForm({ ...editEmpForm, department: e.target.value })} className="text-xs" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Email</Label>
                <Input value={editEmpForm.email} onChange={(e) => setEditEmpForm({ ...editEmpForm, email: e.target.value })} className="text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Phone</Label>
                <Input value={editEmpForm.phone} onChange={(e) => setEditEmpForm({ ...editEmpForm, phone: e.target.value })} className="text-xs" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Employment Type</Label>
                <Select value={editEmpForm.employmentType} onValueChange={(v: any) => setEditEmpForm({ ...editEmpForm, employmentType: v })}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Regular">Regular</SelectItem>
                    <SelectItem value="Probationary">Probationary</SelectItem>
                    <SelectItem value="Contractual">Contractual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Date Hired</Label>
                <Input value={editEmpForm.dateHired} onChange={(e) => setEditEmpForm({ ...editEmpForm, dateHired: e.target.value })} className="text-xs" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Supervisor</Label>
              <Input value={editEmpForm.supervisor} onChange={(e) => setEditEmpForm({ ...editEmpForm, supervisor: e.target.value })} className="text-xs" />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (empHasChanges) {
                  setPendingEmpUnsaved(true);
                } else {
                  setShowEditEmpModal(false);
                  setEditingEmp(null);
                }
              }}
            >
              Cancel
            </Button>
            <Button onClick={executeSaveEmployee}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PROMOTION MODAL */}
      <Dialog
        open={showPromoteModal}
        onOpenChange={(open) => {
          if (!open && (newPosition !== selectedEmp?.position || promotionNotes)) {
            setPendingUnsavedExit({ target: "promote" });
          } else {
            setShowPromoteModal(open);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" /> Promote Employee — {selectedEmp?.name}
            </DialogTitle>
            <DialogDescription>Update position title and salary grade in Core HCM.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label className="text-xs">Current Position Title</Label>
              <Input value={selectedEmp?.position || ""} disabled className="bg-muted text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">New Promoted Position Title</Label>
              <Input
                value={newPosition}
                onChange={(e) => setNewPosition(e.target.value)}
                placeholder="e.g. Senior Receptionist / Supervisor"
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">New Salary Grade</Label>
              <Select value={newSalaryGrade} onValueChange={setNewSalaryGrade}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hcm.salaryGrades.map((sg) => (
                    <SelectItem key={sg.code} value={sg.code}>
                      {sg.code} ({sg.title} · {formatMoney(Number(sg.min_salary))} – {formatMoney(Number(sg.max_salary))})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Succession Justification & Evaluation Notes</Label>
              <Textarea
                value={promotionNotes}
                onChange={(e) => setPromotionNotes(e.target.value)}
                placeholder="HR3 evaluation score details..."
                rows={3}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (newPosition !== selectedEmp?.position || promotionNotes) {
                  setPendingUnsavedExit({ target: "promote" });
                } else {
                  setShowPromoteModal(false);
                }
              }}
            >
              Cancel
            </Button>
            <Button onClick={() => setPendingConfirm({ type: "save_promote" })}>
              Save Promotion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EXIT MODAL */}
      <Dialog
        open={showExitModal}
        onOpenChange={(open) => {
          if (!open && exitNotes) {
            setPendingUnsavedExit({ target: "exit" });
          } else {
            setShowExitModal(open);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <UserX className="h-5 w-5" /> Process Exit Status — {selectedEmp?.name}
            </DialogTitle>
            <DialogDescription>Mark exit status in HCM. This will automatically deactivate user account.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label className="text-xs">Exit Reason / Trigger</Label>
              <Select value={exitType} onValueChange={(v: any) => setExitType(v)}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Resigned">Resigned (Initiated via ESS / HR)</SelectItem>
                  <SelectItem value="Retired">Retired (Age / Policy)</SelectItem>
                  <SelectItem value="Terminated">Terminated (Disciplinary / Performance)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Clearance & Exit Notes</Label>
              <Textarea
                value={exitNotes}
                onChange={(e) => setExitNotes(e.target.value)}
                placeholder="Exit clearance interview notes..."
                rows={3}
                className="text-xs"
              />
            </div>

            <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
              ⚠️ <strong>Security Action</strong>: Confirming exit status will instantly revoke user credentials in User Management.
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (exitNotes) {
                  setPendingUnsavedExit({ target: "exit" });
                } else {
                  setShowExitModal(false);
                }
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => setPendingConfirm({ type: "save_exit" })}>
              Confirm Exit & Deactivate Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CONFIRMATION ALERT DIALOG (SAVE / ACTION) */}
      <AlertDialog open={!!pendingConfirm} onOpenChange={(open) => !open && setPendingConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingConfirm?.type === "save_promote" && `Are you sure you want to promote ${selectedEmp?.name} to ${newPosition}?`}
              {pendingConfirm?.type === "save_exit" && `Are you sure you want to process exit status (${exitType}) for ${selectedEmp?.name}? User account will be disabled.`}
              {pendingConfirm?.type === "regularize" && `Are you sure you want to convert ${pendingConfirm?.data?.name} to Regular employee status?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingConfirm(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingConfirm?.type === "save_promote") executePromotion();
                if (pendingConfirm?.type === "save_exit") executeExit();
                if (pendingConfirm?.type === "regularize") executeRegularization(pendingConfirm.data);
                setPendingConfirm(null);
              }}
            >
              Yes, Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* CONFIRMATION ALERT DIALOG (UNSAVED CHANGES EXIT) */}
      <AlertDialog open={!!pendingUnsavedExit} onOpenChange={(open) => !open && setPendingUnsavedExit(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-amber-600">Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes in this form. Are you sure you want to exit without saving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingUnsavedExit(null)}>Keep Editing</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (pendingUnsavedExit?.target === "promote") setShowPromoteModal(false);
                if (pendingUnsavedExit?.target === "exit") setShowExitModal(false);
                setPendingUnsavedExit(null);
              }}
            >
              Discard & Exit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* CONFIRMATION ALERT DIALOG (UNSAVED EMP EDIT) */}
      <AlertDialog open={pendingEmpUnsaved} onOpenChange={(open) => !open && setPendingEmpUnsaved(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-amber-600">Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes in this form. Are you sure you want to exit without saving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingEmpUnsaved(false)}>Keep Editing</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                setShowEditEmpModal(false);
                setEditingEmp(null);
                setPendingEmpUnsaved(false);
              }}
            >
              Discard & Exit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* --- Lifecycle Logs Viewer --- */
type LifecycleLog = {
  id: string;
  timestamp: string;
  category: "Regularization" | "Promotion" | "Resignation" | "Termination" | "Retirement";
  employeeName: string;
  employeeId: string;
  position: string;
  department: string;
  actor: string;
  actorRole: string;
  details: string;
};

function LifecycleLogsViewer() {
  const hcm = useHcmData();
  const [filterType, setFilterType] = useState("all");
  const [filterDept, setFilterDept] = useState("all");
  const [search, setSearch] = useState("");
  const [logs, setLogs] = useState<LifecycleLog[]>([]);
  const [logsError, setLogsError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLogsError("");
      try {
        const res = await auditLogApi.list({ module: "Core HCM", per_page: 100 });
        if (cancelled) return;
        const employees = hcm.employees;
        const relevant = (res.data ?? []).filter((a) => {
          const act = a.action.toLowerCase();
          return act.includes("regulariz") || act.includes("promot") || act.includes("exit");
        });
        const mapped: LifecycleLog[] = relevant.map((a) => {
          const detailsText = a.details || a.action || "";
          const category: LifecycleLog["category"] =
            a.action.includes("regulariz") || a.action.includes("Regulariz")
              ? "Regularization"
              : a.action.includes("promot") || a.action.includes("Promot")
              ? "Promotion"
              : detailsText.includes("Retired")
              ? "Retirement"
              : detailsText.includes("Terminated")
              ? "Termination"
              : "Resignation";
          const emp = employees.find((e) => e.employee_code === a.target_id);
          return {
            id: `LC-${a.audit_log_id}`,
            timestamp: (a.occurred_at || a.timestamp || "").replace("T", " ").slice(0, 16),
            category,
            employeeName: emp?.full_name || a.details?.replace(/^(Regularized|Promoted|Exited)\s+/, "").split(" ")[0] || a.target_id || "Unknown",
            employeeId: a.target_id || "—",
            position: emp?.position_title || "—",
            department: emp?.department_name || "—",
            actor: a.user || a.role || "System",
            actorRole: a.role || "System",
            details: detailsText,
          };
        });
        setLogs(mapped);
      } catch (err) {
        if (cancelled) return;
        const status = (err as { status?: number }).status;
        if (status === 403) {
          setLogsError("Your account does not have Audit Logs permission, so lifecycle transitions cannot be loaded.");
        } else {
          setLogsError("Could not load lifecycle transition logs from the audit trail.");
        }
        setLogs([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hcm.employees]);

  const deptOptions = Array.from(new Set(logs.map((l) => l.department))).sort();

  const filteredLogs = logs.filter((log) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      log.employeeName.toLowerCase().includes(q) ||
      log.employeeId.toLowerCase().includes(q) ||
      log.position.toLowerCase().includes(q) ||
      log.department.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q);
    const matchesType = filterType === "all" || log.category === filterType;
    const matchesDept = filterDept === "all" || log.department === filterDept;
    return matchesSearch && matchesType && matchesDept;
  });

  const page = usePagination(filteredLogs);

  const getCategoryBadgeClass = (category: LifecycleLog["category"]) => {
    switch (category) {
      case "Regularization":
        return "border-success/40 bg-success/10 text-success";
      case "Promotion":
        return "border-primary/40 bg-primary/10 text-primary";
      case "Resignation":
        return "border-amber-500/40 bg-amber-500/10 text-amber-600";
      case "Termination":
        return "border-destructive/40 bg-destructive/10 text-destructive";
      case "Retirement":
        return "border-purple-500/40 bg-purple-500/10 text-purple-600";
      default:
        return "border-border text-muted-foreground";
    }
  };

  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="flex items-center gap-2 font-display text-xl font-semibold"><History className="h-5 w-5 text-primary" /> Lifecycle Transition Logs</h2>
            <p className="text-xs text-muted-foreground">
              Audit log records of employee regularizations, promotions, resignations, terminations, and retirements.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[14rem]">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search employee, position, action details…"
                className="h-9 pl-8 text-xs bg-card"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={filterDept} onValueChange={setFilterDept}>
              <SelectTrigger className="h-9 w-44 text-xs bg-card">
                <SelectValue placeholder="All departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All departments</SelectItem>
                {deptOptions.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="h-9 w-44 text-xs bg-card">
                <SelectValue placeholder="All event categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All lifecycle events</SelectItem>
                <SelectItem value="Regularization">Regularization</SelectItem>
                <SelectItem value="Promotion">Promotion</SelectItem>
                <SelectItem value="Resignation">Resignation</SelectItem>
                <SelectItem value="Termination">Termination</SelectItem>
                <SelectItem value="Retirement">Retirement</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Log ID</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Action Category</TableHead>
                <TableHead>Target Employee (Status Changed)</TableHead>
                <TableHead>Position & Department</TableHead>
                <TableHead>HR Admin / Actor</TableHead>
                <TableHead>Action Details & Justification</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {page.pageItems.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs font-medium">{log.id}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{log.timestamp}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-[10px] font-semibold", getCategoryBadgeClass(log.category))}>
                      {log.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="font-semibold text-foreground">{log.employeeName}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">{log.employeeId}</div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="font-medium">{log.position}</div>
                    <div className="text-[11px] text-muted-foreground">{log.department}</div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <span className="font-medium">{log.actor}</span>
                    <span className="text-muted-foreground block text-[11px]">{log.actorRole}</span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-xs">{log.details}</TableCell>
                </TableRow>
              ))}
              {filteredLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-xs text-muted-foreground">
                    {logsError || "No matching lifecycle transition log entries found."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <TablePagination
          page={page.page}
          pageCount={page.pageCount}
          from={page.from}
          to={page.to}
          total={page.total}
          label="lifecycle logs"
          onPageChange={page.setPage}
        />
      </CardContent>
    </Card>
  );
}

/* =========================================================================
   2. DEPARTMENT & POSITION MODULE
   ========================================================================= */

export function DeptPosModule({ role = "admin" }: { role?: Role }) {
  const [activeTab, setActiveTab] = useState<"deptpos" | "salary" | "reqs">(() => {
    const saved = typeof window !== "undefined" ? window.sessionStorage.getItem("hcm-deptpos-tab") : null;
    return (saved === "deptpos" || saved === "salary" || saved === "reqs" ? saved : "deptpos") as "deptpos" | "salary" | "reqs";
  });

  useEffect(() => {
    window.sessionStorage.setItem("hcm-deptpos-tab", activeTab);
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Core HCM · Organization Setup"
        title="Department, Position & Salary Grade Management"
        description="Configure property departments, define position headcounts, manage salary grade structures, and approve requisitions."
      />

      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="space-y-6">
        <TabsList className="inline-flex h-auto flex-wrap justify-start rounded-xl border border-border/70 bg-muted/70 p-1 shadow-sm text-muted-foreground">
          <TabsTrigger value="deptpos" className="rounded-lg px-4 py-2 text-xs font-semibold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm cursor-pointer">
            <Building2 className="mr-1.5 h-4 w-4" /> Department and Position
          </TabsTrigger>
          <TabsTrigger value="salary" className="rounded-lg px-4 py-2 text-xs font-semibold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm cursor-pointer">
            <DollarSign className="mr-1.5 h-4 w-4" /> Salary Grade Management
          </TabsTrigger>
          <TabsTrigger value="reqs" className="rounded-lg px-4 py-2 text-xs font-semibold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm cursor-pointer">
            <Send className="mr-1.5 h-4 w-4" /> Requisitions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deptpos" className="space-y-6">
          <DepartmentAndPositionManager role={role} />
        </TabsContent>

        <TabsContent value="salary" className="space-y-6">
          <SalaryGradeManager />
        </TabsContent>

        <TabsContent value="reqs" className="space-y-6">
          <RequisitionManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* --- Department and Position Manager --- */
function DepartmentAndPositionManager({ role }: { role: Role }) {
  const hcm = useHcmData();

  const deptList = useMemo<Department[]>(() => hcm.departments.map(toUiDepartment), [hcm]);
  const posList = useMemo<Position[]>(() => hcm.positions.map((p) => toUiPosition(p, hcm.salaryGrades)), [hcm]);
  const sGrades = useMemo<SalaryGrade[]>(() => hcm.salaryGrades.map(toUiSalaryGrade), [hcm]);
  const employees = useMemo(() => hcm.employees.map((e) => toUiEmployee(e, hcm.employees, hcm.salaryGrades)), [hcm]);

  const deptIdByCode = useMemo(() => new Map(hcm.departments.map((d) => [d.code, d.department_id])), [hcm]);
  const posIdByCode = useMemo(() => new Map(hcm.positions.map((p) => [p.position_code, p.position_id])), [hcm]);
  const deptIdByName = useMemo(() => new Map(hcm.departments.map((d) => [d.name, d.department_id])), [hcm]);
  const sgIdByCode = useMemo(() => new Map(hcm.salaryGrades.map((g) => [g.code, g.salary_grade_id])), [hcm]);

  const [deptTableSearch, setDeptTableSearch] = useState("");
  const [posTableSearch, setPosTableSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");

  const filteredDepts = deptList.filter(
    (d) =>
      !deptTableSearch.trim() ||
      d.name.toLowerCase().includes(deptTableSearch.toLowerCase()) ||
      d.code.toLowerCase().includes(deptTableSearch.toLowerCase()) ||
      d.head.toLowerCase().includes(deptTableSearch.toLowerCase())
  );

  const filteredPositions = posList.filter(
    (p) =>
      (deptFilter === "all" || p.department === deptFilter) &&
      (!posTableSearch.trim() ||
        p.title.toLowerCase().includes(posTableSearch.toLowerCase()) ||
        p.id.toLowerCase().includes(posTableSearch.toLowerCase()) ||
        p.department.toLowerCase().includes(posTableSearch.toLowerCase()))
  );

  const deptPage = usePagination(filteredDepts);
  const posPage = usePagination(filteredPositions);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [editingPos, setEditingPos] = useState<Position | null>(null);
  const [isNewPos, setIsNewPos] = useState(false);
  const [isNewDept, setIsNewDept] = useState(false);

  const [deptCode, setDeptCode] = useState("");
  const [deptName, setDeptName] = useState("");
  const [deptHead, setDeptHead] = useState("");

  const [posTitle, setPosTitle] = useState("");
  const [posDept, setPosDept] = useState("Front Office");
  const [posLevel, setPosLevel] = useState<Position["level"]>("Rank & File");
  const [posTarget, setPosTarget] = useState("5");
  const [posFilled, setPosFilled] = useState("3");
  const [posSGrade, setPosSGrade] = useState("SG-05");

  const [pendingConfirmSave, setPendingConfirmSave] = useState<{ type: "dept" | "pos" } | null>(null);
  const [pendingUnsavedExit, setPendingUnsavedExit] = useState<{ target: "dept" | "pos" } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ type: "dept" | "pos"; id: number; name: string } | null>(null);

  const [origDeptCode, setOrigDeptCode] = useState("");
  const [origDeptName, setOrigDeptName] = useState("");
  const [origDeptHead, setOrigDeptHead] = useState("");
  const [origPosTitle, setOrigPosTitle] = useState("");
  const [origPosDept, setOrigPosDept] = useState("");
  const [origPosLevel, setOrigPosLevel] = useState<Position["level"]>("Rank & File");
  const [origPosTarget, setOrigPosTarget] = useState("");
  const [origPosSGrade, setOrigPosSGrade] = useState("");

  const deptHasChanges = deptCode !== origDeptCode || deptName !== origDeptName || deptHead !== origDeptHead;
  const posHasChanges = posTitle !== origPosTitle || posDept !== origPosDept || posLevel !== origPosLevel || posTarget !== origPosTarget || posSGrade !== origPosSGrade;

  const getDerivedStaffCount = (deptName: string) => {
    return posList.filter((p) => p.department === deptName).reduce((acc, curr) => acc + curr.filled, 0);
  };

  const getDeptSpecificHeads = (targetDeptName: string) => {
    return employees.filter(
      (emp) => emp.status === "Active" && emp.department === targetDeptName
    );
  };

  const executeSaveDepartment = async () => {
    if (!deptName || !deptCode) {
      toast.error("Department Name and Code are required.");
      return;
    }

    try {
      if (isNewDept) {
        await hcmApi.departments.create({ code: deptCode, name: deptName, description: "" });
        toast.success(`Department ${deptName} created.`);
      } else if (editingDept) {
        const dbId = deptIdByCode.get(editingDept.code);
        if (!dbId) {
          toast.error(`Could not resolve department ${editingDept.code} in Core HCM.`);
          return;
        }
        const headEmp = employees.find((e) => e.name === deptHead && e.department === deptName);
        await hcmApi.departments.update(dbId, {
          code: deptCode,
          name: deptName,
          head_employee_id: headEmp ? hcm.employees.find((e) => e.full_name === deptHead)?.employee_id : null,
        });
        toast.success(`Department ${deptName} updated.`);
      }
      await refreshHcm();
    } catch (err) {
      const status = (err as { status?: number }).status;
      if (status === 422) {
        const msg = (err as { errors?: Record<string, string[]> }).errors;
        toast.error(msg ? Object.values(msg).flat()[0] : "Validation failed.");
      } else if (status === 403) {
        toast.error("You do not have permission to modify departments.");
      } else {
        toast.error("Could not save department.");
      }
      return;
    }

    setEditingDept(null);
    setIsNewDept(false);
  };

  const executeDelete = async () => {
    if (!pendingDelete) return;
    try {
      if (pendingDelete.type === "dept") {
        await hcmApi.departments.remove(pendingDelete.id);
        toast.success(`Department "${pendingDelete.name}" deleted.`);
      } else if (pendingDelete.type === "pos") {
        await hcmApi.positions.remove(pendingDelete.id);
        toast.success(`Position "${pendingDelete.name}" deleted.`);
      }
      await refreshHcm();
    } catch (err) {
      const status = (err as { status?: number }).status;
      toast.error(status === 422 ? (err as Error).message : "Could not delete. It may be in use.");
      return;
    }
    setPendingDelete(null);
  };

  const executeSavePosition = async () => {
    if (!posTitle) {
      toast.error("Job position title is required.");
      return;
    }

    try {
      if (isNewPos) {
        const deptDbId = deptIdByName.get(posDept);
        const sgDbId = sgIdByCode.get(posSGrade);
        if (!deptDbId || !sgDbId) {
          toast.error("Selected department or salary grade could not be resolved in Core HCM.");
          return;
        }
        await hcmApi.positions.create({
          title: posTitle,
          department_id: deptDbId,
          salary_grade_id: sgDbId,
          level: posLevel,
          headcount: Number(posTarget) || 1,
        });
        toast.success(`Position ${posTitle} added to ${posDept}.`);
      } else if (editingPos) {
        const dbId = posIdByCode.get(editingPos.id);
        const deptDbId = deptIdByName.get(posDept);
        const sgDbId = sgIdByCode.get(posSGrade);
        if (!dbId || !deptDbId || !sgDbId) {
          toast.error("Position, department, or salary grade could not be resolved in Core HCM.");
          return;
        }
        await hcmApi.positions.update(dbId, {
          position_code: editingPos.id,
          title: posTitle,
          department_id: deptDbId,
          salary_grade_id: sgDbId,
          level: posLevel,
          headcount: Number(posTarget),
        });
        toast.success(`Position ${posTitle} updated.`);
      }
      await refreshHcm();
    } catch (err) {
      const status = (err as { status?: number }).status;
      if (status === 422) {
        const msg = (err as { errors?: Record<string, string[]> }).errors;
        toast.error(msg ? Object.values(msg).flat()[0] : "Validation failed.");
      } else if (status === 403) {
        toast.error("You do not have permission to modify positions.");
      } else {
        toast.error("Could not save position.");
      }
      return;
    }

    setEditingPos(null);
    setIsNewPos(false);
  };

  return (
    <div className="space-y-8">
      {/* 1. DEPARTMENTS SECTION CARD */}
      <Card className="border-border/70 shadow-sm">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 font-display text-xl font-semibold"><Building2 className="h-4 w-4 text-primary" /> Hotel & Restaurant Departments</CardTitle>
              <p className="text-xs text-muted-foreground">
                {filteredDepts.length} department{filteredDepts.length !== 1 ? "s" : ""} found
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative min-w-[14rem]">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search department, code, head…"
                  className="h-9 pl-8 text-xs bg-card shadow-2xs"
                  value={deptTableSearch}
                  onChange={(e) => setDeptTableSearch(e.target.value)}
                />
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setDeptCode(`DEP-0${deptList.length + 1}`);
                  setDeptName("");
                  setDeptHead("");
                  setIsNewDept(true);
                  setEditingDept({ code: "", name: "", description: "", head: "Unassigned", staff: 0, openRequisitions: 0, budget: 0 });
                }}
              >
                <Plus className="mr-1.5 h-4 w-4" /> Add Department
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28 pl-6">Dept Code</TableHead>
                <TableHead>Department Name</TableHead>
                <TableHead>Department Head</TableHead>
                <TableHead className="text-center">Positions Count</TableHead>
                <TableHead className="text-center">Staff Count (Derived)</TableHead>
                <TableHead className="w-28 text-center pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deptPage.pageItems.map((d) => {
                const positionsUnder = posList.filter((p) => p.department === d.name);
                const derivedStaff = getDerivedStaffCount(d.name);

                return (
                  <TableRow key={d.code}>
                    <TableCell className="pl-6 font-mono text-xs font-medium">{d.code}</TableCell>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{d.head}</TableCell>
                    <TableCell className="text-center font-mono text-xs">{positionsUnder.length}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="font-mono text-xs">
                        {derivedStaff} active staff
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center pr-6">
                      <div className="flex justify-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 text-xs"
                          onClick={() => {
                            setEditingDept(d);
                            setDeptCode(d.code);
                            setDeptName(d.name);
                            setDeptHead(d.head);
                            setOrigDeptCode(d.code);
                            setOrigDeptName(d.name);
                            setOrigDeptHead(d.head);
                            setIsNewDept(false);
                          }}
                        >
                          <Pencil className="mr-1 h-3 w-3" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            const dbId = deptIdByCode.get(d.code);
                            if (dbId) setPendingDelete({ type: "dept", id: dbId, name: d.name });
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <div className="p-4 pt-2">
            <TablePagination
              page={deptPage.page}
              pageCount={deptPage.pageCount}
              from={deptPage.from}
              to={deptPage.to}
              total={deptPage.total}
              label="departments"
              onPageChange={deptPage.setPage}
            />
          </div>
        </CardContent>
      </Card>

      {/* 2. POSITIONS SECTION CARD */}
      <Card className="border-border/70 shadow-sm">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 font-display text-xl font-semibold"><Briefcase className="h-4 w-4 text-primary" /> Job Positions & Salary Bands</CardTitle>
              <p className="text-xs text-muted-foreground">
                {filteredPositions.length} position{filteredPositions.length !== 1 ? "s" : ""} found
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[14rem]">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search title, ID, department…"
                  className="h-9 pl-8 text-xs bg-card shadow-2xs"
                  value={posTableSearch}
                  onChange={(e) => setPosTableSearch(e.target.value)}
                />
              </div>
              <Select value={deptFilter} onValueChange={setDeptFilter}>
                <SelectTrigger className="h-9 w-44 text-xs bg-card shadow-2xs">
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All departments</SelectItem>
                  {deptList.map((d) => (
                    <SelectItem key={d.code} value={d.name}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                onClick={() => {
                  setPosTitle("");
                  setPosDept(deptList[0]?.name || "Front Office");
                  setPosLevel("Rank & File");
                  setPosTarget("5");
                  setPosFilled("3");
                  setPosSGrade("SG-05");
                  setIsNewPos(true);
                  setEditingPos({ id: "", title: "", department: "", level: "Rank & File", headcount: 5, filled: 3, salaryBand: "" });
                }}
              >
                <Plus className="mr-1.5 h-4 w-4" /> Add Position
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24 pl-6">POS ID</TableHead>
                  <TableHead>Job Position Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead className="text-center">Target Headcount</TableHead>
                  <TableHead className="text-center">Filled Staff</TableHead>
                  <TableHead>Assigned Salary Grade / Band</TableHead>
                  <TableHead className="w-28 text-center pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posPage.pageItems.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="pl-6 font-mono text-xs font-medium">{p.id}</TableCell>
                    <TableCell className="font-medium">{p.title}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{p.department}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[11px]">
                        {p.level}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-mono text-xs">{p.headcount}</TableCell>
                    <TableCell className="text-center font-mono text-xs font-semibold">{p.filled}</TableCell>
                    <TableCell className="text-xs text-primary font-medium">{p.salaryBand}</TableCell>
                    <TableCell className="text-center pr-4">
                      <div className="flex justify-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 text-xs"
                          onClick={() => {
                            setEditingPos(p);
                            setPosTitle(p.title);
                            setPosDept(p.department);
                            setPosLevel(p.level);
                            setPosTarget(String(p.headcount));
                            setPosFilled(String(p.filled));
                            setPosSGrade(p.salaryBand.split(" ")[0] || "SG-05");
                            setOrigPosTitle(p.title);
                            setOrigPosDept(p.department);
                            setOrigPosLevel(p.level);
                            setOrigPosTarget(String(p.headcount));
                            setOrigPosSGrade(p.salaryBand.split(" ")[0] || "SG-05");
                            setIsNewPos(false);
                          }}
                        >
                          <Pencil className="mr-1 h-3 w-3" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            const dbId = posIdByCode.get(p.id);
                            if (dbId) setPendingDelete({ type: "pos", id: dbId, name: p.title });
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="p-4 pt-2">
            <TablePagination
              page={posPage.page}
              pageCount={posPage.pageCount}
              from={posPage.from}
              to={posPage.to}
              total={posPage.total}
              label="positions"
              onPageChange={posPage.setPage}
            />
          </div>
        </CardContent>
      </Card>

      {/* EDIT / ADD DEPARTMENT MODAL */}
      <Dialog
        open={!!editingDept}
        onOpenChange={(open) => {
          if (!open && deptHasChanges) {
            setPendingUnsavedExit({ target: "dept" });
          } else if (!open) {
            setEditingDept(null);
            setIsNewDept(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{isNewDept ? "Add New Department" : `Edit Department — ${editingDept?.name}`}</DialogTitle>
            <DialogDescription>
              Configure department information. Associated positions and staff count are updated automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Department Code</Label>
                <Input value={deptCode} onChange={(e) => setDeptCode(e.target.value)} className="text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Department Name</Label>
                <Input value={deptName} onChange={(e) => setDeptName(e.target.value)} className="text-xs" />
              </div>
            </div>

            {!isNewDept && editingDept ? (
              <div className="space-y-1">
                <Label className="text-xs">Department Head (Active {editingDept.name} Staff Only)</Label>
                {getDeptSpecificHeads(editingDept.name).length > 0 ? (
                  <Select value={deptHead} onValueChange={setDeptHead}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Select active department head" />
                    </SelectTrigger>
                    <SelectContent>
                      {getDeptSpecificHeads(editingDept.name).map((h) => (
                        <SelectItem key={h.id} value={h.name}>
                          {h.name} ({h.position} · {h.department})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-2.5 text-[11px] text-amber-700">
                    No active employees currently assigned to <strong>{editingDept.name}</strong>. Add or assign positions to this department first to designate a department head.
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-md border border-primary/20 bg-primary/5 p-2.5 text-[11px] text-muted-foreground">
                <strong>Department Head Assignment:</strong> A department head can be assigned after creation once active employees are assigned to this department.
              </div>
            )}

            <div className="space-y-1.5 rounded-lg border p-3 bg-muted/20">
              <Label className="text-xs font-semibold">Associated Job Positions in {deptName || "Department"}:</Label>
              {posList.filter((p) => p.department === deptName).length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {posList
                    .filter((p) => p.department === deptName)
                    .map((p) => (
                      <Badge key={p.id} variant="secondary" className="text-[11px]">
                        {p.title} ({p.filled} staff)
                      </Badge>
                    ))}
                </div>
              ) : (
                <p className="text-muted-foreground italic text-[11px]">
                  No job positions currently assigned. Positions added to this department will display here automatically.
                </p>
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/40">
              <div>
                <span className="font-semibold text-xs text-foreground">Total Staff Count (Derived):</span>
                <p className="text-[11px] text-muted-foreground">Calculated automatically from filled staff across all positions.</p>
              </div>
              <Badge variant="default" className="font-mono text-sm">
                {getDerivedStaffCount(deptName)} Staff
              </Badge>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (deptHasChanges) {
                  setPendingUnsavedExit({ target: "dept" });
                } else {
                  setEditingDept(null);
                  setIsNewDept(false);
                }
              }}
            >
              Cancel
            </Button>
            <Button onClick={() => setPendingConfirmSave({ type: "dept" })}>
              Save Department
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT / ADD POSITION MODAL */}
      <Dialog
        open={!!editingPos}
        onOpenChange={(open) => {
          if (!open && posHasChanges) {
            setPendingUnsavedExit({ target: "pos" });
          } else if (!open) {
            setEditingPos(null);
            setIsNewPos(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isNewPos ? "Add New Job Position" : `Edit Position — ${editingPos?.title}`}</DialogTitle>
            <DialogDescription>
              Assign job level, target headcount, department and dynamic Salary Grade.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-1">
              <Label className="text-xs">Job Position Title</Label>
              <Input value={posTitle} onChange={(e) => setPosTitle(e.target.value)} className="text-xs" placeholder="e.g. Pastry Chef" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Department</Label>
                <Select value={posDept} onValueChange={setPosDept}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {deptList.map((d) => (
                      <SelectItem key={d.code} value={d.name}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Job Level</Label>
                <Select value={posLevel} onValueChange={(v: any) => setPosLevel(v)}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Rank & File">Rank & File</SelectItem>
                    <SelectItem value="Supervisory">Supervisory</SelectItem>
                    <SelectItem value="Managerial">Managerial</SelectItem>
                    <SelectItem value="Executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Target Headcount</Label>
                <Input type="number" value={posTarget} onChange={(e) => setPosTarget(e.target.value)} className="text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Filled Staff</Label>
                <Input type="number" value={posFilled} disabled className="text-xs bg-muted" />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-primary">Assign Salary Grade (From Salary Grade Management)</Label>
              <Select value={posSGrade} onValueChange={setPosSGrade}>
                <SelectTrigger className="text-xs border-primary/40 bg-primary/5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sGrades.map((sg) => (
                    <SelectItem key={sg.id} value={sg.code}>
                      {sg.code} — {sg.title} ({formatMoney(sg.minSalary)} – {formatMoney(sg.maxSalary)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (posHasChanges) {
                  setPendingUnsavedExit({ target: "pos" });
                } else {
                  setEditingPos(null);
                  setIsNewPos(false);
                }
              }}
            >
              Cancel
            </Button>
            <Button onClick={() => setPendingConfirmSave({ type: "pos" })}>
              Save Position
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CONFIRMATION ALERT DIALOG (SAVE DEPT / SAVE POS) */}
      <AlertDialog open={!!pendingConfirmSave} onOpenChange={(open) => !open && setPendingConfirmSave(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Changes</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingConfirmSave?.type === "dept" && `Are you sure you want to save changes to department "${deptName}"?`}
              {pendingConfirmSave?.type === "pos" && `Are you sure you want to save changes to position "${posTitle}"?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingConfirmSave(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingConfirmSave?.type === "dept") executeSaveDepartment();
                if (pendingConfirmSave?.type === "pos") executeSavePosition();
                setPendingConfirmSave(null);
              }}
            >
              Yes, Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* CONFIRMATION ALERT DIALOG (DELETE) */}
      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {pendingDelete?.type === "dept" ? "department" : "position"} "{pendingDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={executeDelete}
            >
              Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* CONFIRMATION ALERT DIALOG (UNSAVED CHANGES EXIT) */}
      <AlertDialog open={!!pendingUnsavedExit} onOpenChange={(open) => !open && setPendingUnsavedExit(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-amber-600">Discard Unsaved Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have modified fields in this modal. Are you sure you want to exit without saving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingUnsavedExit(null)}>Keep Editing</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (pendingUnsavedExit?.target === "dept") {
                  setEditingDept(null);
                  setIsNewDept(false);
                }
                if (pendingUnsavedExit?.target === "pos") {
                  setEditingPos(null);
                  setIsNewPos(false);
                }
                setPendingUnsavedExit(null);
              }}
            >
              Discard & Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* --- Salary Grade Manager --- */
function SalaryGradeManager() {
  const hcm = useHcmData();
  const grades = useMemo<SalaryGrade[]>(() => hcm.salaryGrades.map(toUiSalaryGrade), [hcm]);
  const [sgSearch, setSgSearch] = useState("");
  const [sgLevelFilter, setSgLevelFilter] = useState("all");
  const [pendingDelete, setPendingDelete] = useState<{ type: "sg"; id: number; name: string } | null>(null);

  const executeDelete = async () => {
    if (!pendingDelete) return;
    try {
      await hcmApi.salaryGrades.remove(pendingDelete.id);
      toast.success(`Salary grade "${pendingDelete.name}" deleted.`);
      await refreshHcm();
    } catch (err) {
      const status = (err as { status?: number }).status;
      toast.error(status === 422 ? (err as Error).message : "Could not delete. It may be in use.");
      return;
    }
    setPendingDelete(null);
  };

  const filteredGrades = grades.filter((g) => {
    const q = sgSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      g.code.toLowerCase().includes(q) ||
      g.title.toLowerCase().includes(q) ||
      g.level.toLowerCase().includes(q);
    const matchesLevel = sgLevelFilter === "all" || g.level === sgLevelFilter;
    return matchesSearch && matchesLevel;
  });

  const sgPage = usePagination(filteredGrades);

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 font-display text-xl font-semibold"><DollarSign className="h-4 w-4 text-primary" /> Salary Grade & Compensation Management</CardTitle>
            <p className="text-xs text-muted-foreground">
              {filteredGrades.length} grade structure{filteredGrades.length !== 1 ? "s" : ""} found
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[14rem]">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search code, title, level…"
                className="h-9 pl-8 text-xs bg-card shadow-2xs"
                value={sgSearch}
                onChange={(e) => setSgSearch(e.target.value)}
              />
            </div>
            <Select value={sgLevelFilter} onValueChange={setSgLevelFilter}>
              <SelectTrigger className="h-9 w-40 text-xs bg-card shadow-2xs">
                <SelectValue placeholder="All job levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All job levels</SelectItem>
                <SelectItem value="Rank & File">Rank & File</SelectItem>
                <SelectItem value="Supervisory">Supervisory</SelectItem>
                <SelectItem value="Managerial">Managerial</SelectItem>
                <SelectItem value="Executive">Executive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-28 pl-6">Grade Code</TableHead>
              <TableHead>Band Title</TableHead>
              <TableHead>Job Level</TableHead>
              <TableHead className="text-right">Min Salary</TableHead>
              <TableHead className="text-right">Max Salary</TableHead>
              <TableHead>Pay Band Range</TableHead>
              <TableHead className="text-right pr-6">Currency</TableHead>
              <TableHead className="text-center pr-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sgPage.pageItems.map((sg) => (
              <TableRow key={sg.id}>
                <TableCell className="pl-6 font-mono text-xs font-semibold text-primary">{sg.code}</TableCell>
                <TableCell className="font-medium text-xs">{sg.title}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[11px]">
                    {sg.level}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono text-xs">{formatMoney(sg.minSalary)}</TableCell>
                <TableCell className="text-right font-mono text-xs">{formatMoney(sg.maxSalary)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatMoney(sg.minSalary)} – {formatMoney(sg.maxSalary)}
                </TableCell>
                <TableCell className="text-right pr-6 font-mono text-xs">{sg.currency}</TableCell>
                <TableCell className="text-center pr-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      const dbId = hcm.salaryGrades.find((g) => g.code === sg.code)?.salary_grade_id;
                      if (dbId) setPendingDelete({ type: "sg", id: dbId, name: sg.code });
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="p-4 pt-2">
          <TablePagination
            page={sgPage.page}
            pageCount={sgPage.pageCount}
            from={sgPage.from}
            to={sgPage.to}
            total={sgPage.total}
            label="salary grades"
            onPageChange={sgPage.setPage}
          />
        </div>
      </CardContent>

      {/* DELETE CONFIRMATION DIALOG */}
      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete salary grade "{pendingDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={executeDelete}
            >
              Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

/* --- Requisition Manager --- */
function RequisitionManager() {
  const reqs = useRequisitions();
  const [reqSearch, setReqSearch] = useState("");
  const [reqDeptFilter, setReqDeptFilter] = useState("all");
  const [reqStatusFilter, setReqStatusFilter] = useState("all");
  const [reqUrgencyFilter, setReqUrgencyFilter] = useState("all");

  const deptOptions = Array.from(new Set(reqs.map((r) => r.department))).sort();

  const filteredReqs = reqs.filter((r) => {
    const q = reqSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      r.id.toLowerCase().includes(q) ||
      r.position.toLowerCase().includes(q) ||
      r.department.toLowerCase().includes(q) ||
      r.justification.toLowerCase().includes(q);
    const matchesDept = reqDeptFilter === "all" || r.department === reqDeptFilter;
    const matchesStatus = reqStatusFilter === "all" || r.status === reqStatusFilter;
    const matchesUrgency = reqUrgencyFilter === "all" || r.urgency.toLowerCase() === reqUrgencyFilter.toLowerCase();
    return matchesSearch && matchesDept && matchesStatus && matchesUrgency;
  });

  const reqPage = usePagination(filteredReqs);

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 font-display text-xl font-semibold"><Send className="h-4 w-4 text-primary" /> Vacancy Requisitions</CardTitle>
            <p className="text-xs text-muted-foreground">
              {filteredReqs.length} requisition{filteredReqs.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[14rem]">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search requisitions, position, justification…"
                className="h-9 pl-8 text-xs bg-card shadow-2xs"
                value={reqSearch}
                onChange={(e) => setReqSearch(e.target.value)}
              />
            </div>

            <Select value={reqDeptFilter} onValueChange={setReqDeptFilter}>
              <SelectTrigger className="h-9 w-40 text-xs bg-card shadow-2xs">
                <SelectValue placeholder="All departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All departments</SelectItem>
                {deptOptions.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={reqStatusFilter} onValueChange={setReqStatusFilter}>
              <SelectTrigger className="h-9 w-32 text-xs bg-card shadow-2xs">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Converted">Converted</SelectItem>
              </SelectContent>
            </Select>

            <Select value={reqUrgencyFilter} onValueChange={setReqUrgencyFilter}>
              <SelectTrigger className="h-9 w-32 text-xs bg-card shadow-2xs">
                <SelectValue placeholder="All urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All urgency</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Urgent">Urgent</SelectItem>
                <SelectItem value="Normal">Normal</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Req Code</TableHead>
              <TableHead>Position Title</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="text-center">Slots Requested</TableHead>
              <TableHead>Urgency</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right pr-6">Date Requested</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reqPage.pageItems.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="pl-6 font-mono text-xs font-medium">{r.id}</TableCell>
                <TableCell className="font-medium text-xs">{r.position}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{r.department}</TableCell>
                <TableCell className="text-center font-mono text-xs">{r.count}</TableCell>
                <TableCell className="text-xs">
                  <Badge
                    variant="outline"
                    className={
                      r.urgency === "Urgent" || r.urgency === "High"
                        ? "border-amber-500/40 bg-amber-500/10 text-amber-600 text-[10px]"
                        : "border-border text-muted-foreground text-[10px]"
                    }
                  >
                    {r.urgency}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      r.status === "Done"
                        ? "border-success/40 bg-success/10 text-success text-[10px]"
                        : r.status === "Converted"
                        ? "border-primary/40 bg-primary/10 text-primary text-[10px]"
                        : "border-gold/40 text-gold text-[10px]"
                    }
                  >
                    {r.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right pr-6 text-xs text-muted-foreground">{r.requestedAt}</TableCell>
              </TableRow>
            ))}
            {filteredReqs.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-xs text-muted-foreground">
                  No vacancy requisitions match your search and filter criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="p-4 pt-2">
          <TablePagination
            page={reqPage.page}
            pageCount={reqPage.pageCount}
            from={reqPage.from}
            to={reqPage.to}
            total={reqPage.total}
            label="requisitions"
            onPageChange={reqPage.setPage}
          />
        </div>
      </CardContent>
    </Card>
  );
}

/* Backward-compatible default CoreHCM wrapper */
export function CoreHCM({ role = "admin" }: { role?: Role }) {
  return <OrgChartModule role={role} />;
}