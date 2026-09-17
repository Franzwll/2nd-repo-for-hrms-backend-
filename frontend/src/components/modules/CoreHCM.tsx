import { createContext, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
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
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/portal/PageHeader";
import { Logo } from "@/components/brand/Logo";
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
import { SortHead, useSort } from "@/components/portal/sortable";
import { usePagination } from "@/hooks/usePagination";
import { Textarea } from "@/components/ui/textarea";
import {
  type Department,
  type OrgNode,
  type Position,
  type Employee,
  type SalaryGrade,
} from "@/data/hr";
import { cn } from "@/lib/utils";
import { ListSkeleton, TableRowsSkeleton } from "@/components/ui/loading-skeletons";
import { Skeleton } from "@/components/ui/skeleton";
import { ReportMenu } from "@/components/ui/report-menu";
import { onHcmChanged, notifyHcmChanged } from "@/lib/hcm-sync";
import { loadRecordDetail } from "@/lib/employeerecords";
import { requisitionStore, useRequisitions, useRequisitionsLoading, type Requisition } from "@/data/requisitions";
import { type Role } from "@/lib/nav";
import { buildProfile, Field, Section } from "./EmployeeRecords";

/**
 * Lets each tab portal its "Generate Report" control up into the module's
 * PageHeader `actions` slot, so the button sits aligned with the page title
 * (same pattern as Recruitment & Onboarding) instead of in a toolbar row
 * above each card.
 */
const HeaderActionsContext = createContext<HTMLElement | null>(null);

function HeaderActions({ children }: { children: ReactNode }) {
  const target = useContext(HeaderActionsContext);
  if (!target) return null;
  return createPortal(children, target);
}
import {
  auditLogApi,
  hcmApi,
  requisitionsApi,
  type ApiAuditLog,
  type ApiDepartment,
  type ApiEmployee,
  type ApiHR3Recommendation,
  type ApiOrgNode,
  type ApiPosition,
  type ApiPromotionRequest,
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
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(val);

/** HRMS system logo (generic system mark, not the hotel brand). */
function SystemLogo({ size = "sm", showText = false }: { size?: "sm" | "lg"; showText?: boolean }) {
  return (
    <span className="inline-flex items-center gap-3">
      <span
        className={cn(
          "grid shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-md ring-1 ring-primary/30",
          size === "lg" ? "h-16 w-16" : "h-8 w-8",
        )}
      >
        <Users className={size === "lg" ? "h-8 w-8" : "h-4 w-4"} />
      </span>
      {showText && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-base font-bold uppercase tracking-[0.14em] text-foreground">
            HRMS
          </span>
          <span className="mt-1 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Human Resources
          </span>
        </span>
      )}
    </span>
  );
}

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

let hcmData: HcmData = {
  employees: [],
  departments: [],
  positions: [],
  salaryGrades: [],
  orgChart: [],
};
let hcmFetched = false;
const hcmListeners = new Set<() => void>();
/** True while an HCM fetch is in flight. Starts true so the very first
 *  paint shows skeletons. Components gate on `loading && empty` so
 *  background refetches never flash loaders. */
let hcmFetching = true;

function emitHcm() {
  hcmListeners.forEach((l) => l());
}

function setHcmFetching(v: boolean) {
  hcmFetching = v;
  emitHcm();
}

async function fetchHcmData() {
  setHcmFetching(true);
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
  } finally {
    setHcmFetching(false);
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
  return useSyncExternalStore(subscribeHcm, getHcmSnapshot, () => hcmData);
}

/** True while an HCM fetch is in flight. Show skeletons only when
 *  `loading && <slice> is empty` so background refetches never flash. */
function useHcmLoading() {
  return useSyncExternalStore(subscribeHcm, () => hcmFetching, () => hcmFetching);
}

async function refreshHcm() {
  hcmFetched = false;
  hcmData = { employees: [], departments: [], positions: [], salaryGrades: [], orgChart: [] };
  await fetchHcmData();
  notifyHcmChanged();
}

/* Keep Core HCM's local store in sync when other modules (Employee Records)
   mutate shared employee data. */
if (typeof window !== "undefined") {
  onHcmChanged(() => {
    hcmFetched = false;
    fetchHcmData();
  });
}

function toUiEmployee(
  e: ApiEmployee,
  employees: ApiEmployee[],
  sGrades: ApiSalaryGrade[],
): Employee {
  const supervisor = e.supervisor_employee_id
    ? employees.find((x) => x.employee_id === e.supervisor_employee_id)
    : undefined;
  const sg = e.salary_grade_id
    ? sGrades.find((g) => g.salary_grade_id === e.salary_grade_id)
    : undefined;
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

type HR3Recommendation = {
  id: string;
  recommendationId: number;
  employeeId: string;
  employeeName: string;
  department: string;
  currentType: "Probationary" | "Regular";
  recommendationType: "Regularization" | "Promotion" | "Performance Review";
  evaluationScore: number;
  evaluator: string;
  dateSubmitted: string;
  status: "Pending HR Action" | "Approved & Processed" | "Deferred" | "Acknowledged";
  suggestedPosition?: string;
  suggestedSalaryGrade?: string;
  comments: string;
};

function toUiRecommendation(r: ApiHR3Recommendation): HR3Recommendation {
  return {
    id: r.id,
    recommendationId: r.recommendation_id,
    employeeId: r.employee_code ?? String(r.employee_id ?? ""),
    employeeName: r.employee_name,
    department: r.department,
    currentType: r.current_employment_type === "Regular" ? "Regular" : "Probationary",
    recommendationType: r.recommendation_type,
    evaluationScore: r.evaluation_score,
    evaluator: r.evaluator,
    dateSubmitted: r.date_submitted ?? "",
    status: r.status,
    ...(r.suggested_position ? { suggestedPosition: r.suggested_position } : {}),
    ...(r.suggested_salary_grade ? { suggestedSalaryGrade: r.suggested_salary_grade } : {}),
    comments: r.comments ?? "",
  };
}

function toUiDepartment(d: ApiDepartment): Department {
  let head = d.head;
  if (!head || head === "Unassigned") {
    if (d.code === "DEP-HR" || d.name.includes("HR") || d.name.includes("Administration")) {
      head = "Juan Dela Cruz";
    }
  }
  return {
    code: d.code,
    name: d.name,
    description: d.description || "",
    head: head || "Unassigned",
    staff: d.staff_count ?? 0,
    openRequisitions: 0,
    budget: Number(d.budget) || 0,
  };
}

function toUiPosition(p: ApiPosition, sGrades: ApiSalaryGrade[]): Position {
  const sg = p.salary_grade_id
    ? sGrades.find((g) => g.salary_grade_id === p.salary_grade_id)
    : undefined;
  return {
    id: p.position_code,
    title: p.title,
    department: p.department_name || "",
    level: (p.level as Position["level"]) || "Rank & File",
    headcount: p.headcount,
    filled: p.filled_count,
    vacancies: Math.max(0, (p.headcount ?? 0) - (p.filled_count ?? 0)),
    salaryBand: sg
      ? `${sg.code} (${formatMoney(Number(sg.min_salary))} – ${formatMoney(Number(sg.max_salary))})`
      : p.salary_grade || "",
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
    name: gm?.full_name || "Ricardo Villanueva",
    title: gm?.position_title || "General Manager",
    children: [],
  };
  for (const node of orgNodes) {
    const staff = employees.filter((e) => e.department_id === node.department_id);
    const head = node.head || staff.find((e) => e.position_title.toLowerCase().includes("manager") || e.position_title.toLowerCase().includes("director"));
    const headName = head?.full_name || (node.code === "DEP-HR" ? "Juan Dela Cruz" : node.name);
    const headTitle = head?.position_title || (node.code === "DEP-HR" ? "HR & Administration Manager" : `${node.name} Head`);
    const headId = head?.employee_id;

    root.children!.push({
      name: headName,
      title: headTitle,
      children: staff
        .filter((e) => (headId ? e.employee_id !== headId : true) && e.full_name !== headName)
        .map((e) => ({ name: e.full_name, title: e.position_title })),
    });
  }
  return root;
}

/* =========================================================================
   1. ORGANIZATIONAL CHART MODULE
   ========================================================================= */

export function OrgChartModule({ role = "admin" }: { role?: Role }) {
  const [activeTab, setActiveTab] = useState<"org" | "employees" | "promotions" | "logs">(() => {
    const saved =
      typeof window !== "undefined" ? window.sessionStorage.getItem("hcm-org-tab") : null;
    const valid =
      saved === "org" || saved === "employees" || saved === "promotions" || saved === "logs"
        ? saved
        : "org";
    return role !== "superadmin" && valid === "logs" ? "employees" : valid;
  });
  const [empSearch, setEmpSearch] = useState("");
  /** Slot each tab portals its Generate Report control into (page header). */
  const [headerActionsEl, setHeaderActionsEl] = useState<HTMLDivElement | null>(null);

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
        actions={<div ref={setHeaderActionsEl} className="flex flex-wrap items-center gap-2" />}
      />

      <HeaderActionsContext.Provider value={headerActionsEl}>
      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="space-y-6">
        <TabsList className="inline-flex h-auto flex-wrap justify-start rounded-xl border border-border/70 bg-muted/70 p-1 shadow-sm text-muted-foreground">
          <TabsTrigger
            value="org"
            className="rounded-lg px-4 py-2 text-xs font-semibold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm cursor-pointer"
          >
            <GitBranch className="mr-1.5 h-4 w-4" /> Org Chart
          </TabsTrigger>
          <TabsTrigger
            value="employees"
            className="rounded-lg px-4 py-2 text-xs font-semibold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm cursor-pointer"
          >
            <Users className="mr-1.5 h-4 w-4" /> Employee List
          </TabsTrigger>
          <TabsTrigger
            value="promotions"
            className="rounded-lg px-4 py-2 text-xs font-semibold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm cursor-pointer"
          >
            <TrendingUp className="mr-1.5 h-4 w-4" /> Promotion Requests
          </TabsTrigger>
          {role === "superadmin" && (
            <TabsTrigger
              value="logs"
              className="rounded-lg px-4 py-2 text-xs font-semibold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm cursor-pointer"
            >
              <History className="mr-1.5 h-4 w-4" /> Lifecycle Logs
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="org" className="space-y-6">
          <OrgChartVisualizer onViewEmployee={viewEmployeeInList} />
        </TabsContent>

        <TabsContent value="employees" className="space-y-6">
          <EmployeeListManager role={role} empSearch={empSearch} onEmpSearchChange={setEmpSearch} />
        </TabsContent>

        <TabsContent value="promotions" className="space-y-6">
          <PromotionRequestsManager />
        </TabsContent>

        {role === "superadmin" && (
          <TabsContent value="logs" className="space-y-6">
            <LifecycleLogsViewer />
          </TabsContent>
        )}
      </Tabs>
      </HeaderActionsContext.Provider>
    </div>
  );
}

/* --- Org Chart Visualizer --- */
function OrgChartVisualizer({ onViewEmployee }: { onViewEmployee: (name: string) => void }) {
  const hcm = useHcmData();
  const hcmLoading = useHcmLoading();
  const [selectedNode, setSelectedNode] = useState<OrgNode | null>(null);
  const [scale, setScale] = useState(0.58);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{
    x: number;
    y: number;
    offsetX: number;
    offsetY: number;
    moved: boolean;
  } | null>(null);

  const employees = useMemo(
    () => hcm.employees.map((e) => toUiEmployee(e, hcm.employees, hcm.salaryGrades)),
    [hcm],
  );
  const departments = useMemo(() => hcm.departments.map(toUiDepartment), [hcm]);
  const orgTree = useMemo(() => buildOrgTree(hcm.orgChart, hcm.employees), [hcm]);

  const isGeneralManagerNode =
    !selectedNode ||
    selectedNode?.title === "General Manager" ||
    selectedNode?.title === "Hotel Leadership" ||
    selectedNode?.name === (employees.find((e) => e.position?.includes("General Manager"))?.name || "Ricardo A. Villanueva");

  const selectedEmployee = employees.find((employee) => employee.name === selectedNode?.name);
  const selectedDepartment = isGeneralManagerNode
    ? null
    : departments.find(
      (d) =>
        d.head === selectedNode?.name ||
        (d.name === selectedEmployee?.department && selectedEmployee?.position !== "General Manager") ||
        (selectedNode?.title?.includes("HR") && d.name.includes("HR")),
    ) || departments.find((d) => d.name === selectedEmployee?.department);

  const headEmployee = selectedDepartment
    ? employees.find((employee) => employee.name === selectedDepartment.head)
    : null;

  const displayOverview = isGeneralManagerNode
    ? {
      name: "Executive Management",
      description: "Hotel Executive Leadership, Department Directorship & Operational Governance.",
      head: employees.find((e) => e.position?.includes("General Manager"))?.name || "Ricardo A. Villanueva",
      headPosition: "General Manager",
      members: departments
        .map((d) => {
          const h = employees.find((e) => e.name === d.head);
          return h ? { id: h.id, name: h.name, position: h.position } : null;
        })
        .filter(Boolean) as { id: string; name: string; position: string }[],
    }
    : selectedDepartment
      ? {
        name: selectedDepartment.name,
        description: selectedDepartment.description,
        head: selectedDepartment.head,
        headPosition: headEmployee?.position ?? "Department Head",
        members: employees
          .filter(
            (employee) =>
              employee.department === selectedDepartment.name &&
              employee.name !== selectedDepartment.head &&
              !employee.position.includes("General Manager"),
          )
          .map((e) => ({ id: e.id, name: e.name, position: e.position })),
      }
      : null;

  const beginDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    dragStart.current = {
      x: event.clientX,
      y: event.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
      moved: false,
    };
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
      } catch { }
      dragStart.current = null;
      setDragging(false);
    } else {
      dragStart.current = null;
    }
  };

  return (
    <>
    <HeaderActions>
      <ReportMenu
        size="sm"
        label="Export org chart"
        recordCount={employees.length}
        report={() => ({
          title: "Organization Chart Report",
          subtitle: `${employees.length} employee(s) across ${departments.length} department(s)`,
          columns: [
            { header: "Employee", key: "name" },
            { header: "Position", key: "position" },
            { header: "Department", key: "department" },
            { header: "Status", key: "status" },
          ],
          rows: employees.map((e) => ({
            name: e.name,
            position: e.position,
            department: e.department,
            status: (e as any).status ?? "Active",
          })),
          summary: [
            { label: "Employees", value: employees.length },
            { label: "Departments", value: departments.length },
          ],
        })}
      />
    </HeaderActions>
    <Card className="border-border/70 shadow-sm">
      <CardContent className="p-6">
        <div className="mb-6 border-b border-border/60 pb-4">
          <h2 className="flex items-center gap-3 font-display text-xl font-semibold">
            <SystemLogo />
            Hierarchy Chart
          </h2>
          <p className="text-xs text-muted-foreground">
            Property reporting lines from General Management to department staff.
          </p>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
          {hcmLoading && employees.length === 0 ? (
            <>
              <div className="min-h-[35rem] rounded-xl border border-border p-6" aria-busy="true" aria-label="Loading organization chart">
                <div className="mx-auto max-w-md space-y-3 pt-16">
                  <Skeleton className="mx-auto h-16 w-48 rounded-xl" />
                  <div className="flex justify-center gap-3 pt-4">
                    <Skeleton className="h-16 w-40 rounded-xl" />
                    <Skeleton className="h-16 w-40 rounded-xl" />
                    <Skeleton className="h-16 w-40 rounded-xl" />
                  </div>
                  <div className="flex justify-center gap-3 pt-2">
                    <Skeleton className="h-14 w-32 rounded-xl" />
                    <Skeleton className="h-14 w-32 rounded-xl" />
                    <Skeleton className="h-14 w-32 rounded-xl" />
                    <Skeleton className="h-14 w-32 rounded-xl" />
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border p-4" aria-busy="true" aria-label="Loading details">
                <ListSkeleton items={4} />
              </div>
            </>
          ) : (
          <>
          <div
            className="relative min-h-[35rem] touch-none overflow-hidden rounded-xl border border-border bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] bg-[size:16px_16px] cursor-grab active:cursor-grabbing"
            onPointerDown={beginDrag}
            onPointerMove={drag}
            onPointerUp={endDrag}
          >
            {!dragging && (
              <div className="pointer-events-none absolute left-4 top-4 z-20 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-muted-foreground shadow-sm">
                Drag to explore · click any card for details
              </div>
            )}

            <div className="absolute top-4 right-4 z-10 flex items-center gap-1 rounded-xl border border-border/80 bg-card/95 backdrop-blur-md p-1 shadow-lg">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 cursor-pointer"
                aria-label="Zoom out"
                onClick={() => setScale((value) => Math.max(0.35, value - 0.08))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="min-w-10 text-center text-xs font-semibold">
                {Math.round(scale * 100)}%
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 cursor-pointer"
                aria-label="Zoom in"
                onClick={() => setScale((value) => Math.min(1.25, value + 0.08))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs font-semibold cursor-pointer"
                onClick={() => {
                  setScale(0.58);
                  setOffset({ x: 0, y: 0 });
                }}
              >
                Reset
              </Button>
            </div>

            <div
              className="absolute left-1/2 top-8 origin-top"
              style={{
                transform: `translate(calc(-50% + ${offset.x}px), ${offset.y}px) scale(${scale})`,
                transition: dragStart.current ? "none" : "transform 150ms ease-out",
              }}
            >
              <div className="min-w-[980px] py-6">
                <div className="mb-14 flex justify-center">
                  <Logo variant="full" mark="maroon" />
                </div>
                <OrgTree
                  node={orgTree}
                  root
                  selectedName={selectedNode?.name ?? null}
                  onSelect={setSelectedNode}
                />
              </div>
            </div>
          </div>

          <aside className="space-y-4 rounded-xl border border-border bg-muted/25 p-4">
            {displayOverview ? (
              <div>
                <p className="eyebrow">{isGeneralManagerNode ? "Leadership overview" : "Department overview"}</p>
                <h3 className="mt-1 font-display text-2xl font-semibold">
                  {displayOverview.name}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {displayOverview.description}
                </p>

                <div className="mt-4 w-full rounded-xl border border-primary/30 bg-card p-3 shadow-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {isGeneralManagerNode ? "General Manager" : "Head supervisor"}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-foreground">
                        {displayOverview.head}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {displayOverview.headPosition}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 shrink-0 px-2 text-xs text-primary hover:bg-primary/10"
                      onClick={() => onViewEmployee(displayOverview.head)}
                    >
                      <Eye className="mr-1 h-3.5 w-3.5" /> View
                    </Button>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {isGeneralManagerNode ? "Department Heads & Direct Reports" : "Team members"}
                  </p>
                  <Badge variant="secondary">{displayOverview.members.length}</Badge>
                </div>
                <div className="mt-2 max-h-64 space-y-1 overflow-y-auto pr-1">
                  {displayOverview.members.length > 0 ? (
                    displayOverview.members.map((employee) => (
                      <div
                        key={employee.id}
                        className="flex w-full items-center justify-between rounded-md bg-card px-2.5 py-2 text-left text-xs"
                      >
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
          </>
          )}
        </div>
      </CardContent>
    </Card>
    </>
  );
}

function OrgNodeCard({
  node,
  selected = false,
  onSelect,
}: {
  node: OrgNode;
  selected?: boolean;
  onSelect: (n: OrgNode) => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(node)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(node);
        }
      }}
      className={cn(
        "group relative inline-flex min-w-[200px] cursor-pointer flex-col items-center rounded-xl border px-4 py-3.5 text-center shadow-md transition-all hover:scale-[1.03] hover:border-primary hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected ? "border-2 border-primary shadow-lg" : "border-border/80 bg-card",
      )}
    >
      <Avatar className="h-11 w-11 border border-border/60 shadow-xs">
        <AvatarFallback className="bg-secondary text-xs font-bold text-foreground">
          {initialsOf(node.name)}
        </AvatarFallback>
      </Avatar>
      <p className="mt-2 text-sm font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
        {node.name}
      </p>
      <p className="text-xs text-muted-foreground">{node.title}</p>
    </div>
  );
}

function OrgTree({
  node,
  root = false,
  selectedName,
  onSelect,
}: {
  node: OrgNode;
  root?: boolean;
  selectedName?: string | null | undefined;
  onSelect: (n: OrgNode) => void;
}) {
  const children = node.children ?? [];
  return (
    <div className="flex flex-col items-center">
      <OrgNodeCard node={node} selected={selectedName === node.name} onSelect={onSelect} />
      {children.length > 0 && (
        <>
          <div className="h-6 w-[2px] bg-muted-foreground/70" />
          <div className="relative">
            {children.length > 1 && (
              <div className="absolute inset-x-0 top-0 h-[2px] bg-muted-foreground/70" />
            )}
            <div className="flex gap-10">
              {children.map((child) => (
                <div key={child.name} className="relative flex flex-col items-center">
                  <div className="absolute left-1/2 top-0 h-6 w-[2px] -translate-x-1/2 bg-muted-foreground/70" />
                  <div className="pt-6">
                    <OrgTree node={child} selectedName={selectedName} onSelect={onSelect} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
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
  const hcmLoading = useHcmLoading();
  const employeeIdByCode = useMemo(
    () => new Map(hcm.employees.map((e) => [e.employee_code, e.employee_id])),
    [hcm.employees],
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
  const [recommendations, setRecommendations] = useState<HR3Recommendation[]>([]);

  useEffect(() => {
    let cancelled = false;
    hcmApi.hr3Recommendations
      .list()
      .then((res) => {
        if (!cancelled) setRecommendations(res.data.map(toUiRecommendation));
      })
      .catch(() => {
        if (!cancelled) setRecommendations([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const [recStatusFilter, setRecStatusFilter] = useState("all");
  const [recTypeFilter, setRecTypeFilter] = useState("all");
  const [recSearch, setRecSearch] = useState("");
  const filteredRecs = recommendations.filter(
    (r) =>
      (recStatusFilter === "all" ||
        (recStatusFilter === "Acknowledged" &&
          (r.status === "Acknowledged" || (acknowledgedIds.has(r.employeeId) && r.status === "Pending HR Action"))) ||
        recStatusFilter === r.status) &&
      (recTypeFilter === "all" || r.recommendationType === recTypeFilter) &&
      (() => {
        const q = recSearch.trim().toLowerCase();
        return (
          !q ||
          r.id.toLowerCase().includes(q) ||
          r.employeeName.toLowerCase().includes(q) ||
          r.department.toLowerCase().includes(q) ||
          String(r.evaluationScore).includes(q) ||
          r.comments.toLowerCase().includes(q)
        );
      })(),
  );
  const recSort = useSort(filteredRecs, {
    id: (r) => r.id,
    employeeName: (r) => r.employeeName,
    department: (r) => r.department,
    recommendationType: (r) => r.recommendationType,
    evaluationScore: (r) => r.evaluationScore,
    dateSubmitted: (r) => r.dateSubmitted,
    status: (r) => r.status,
  });
  const recPage = usePagination(recSort.sorted);

  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [viewingEmpInfo, setViewingEmpInfo] = useState<Employee | null>(null);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [editEmpForm, setEditEmpForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    personalEmail: "",
    phone: "",
    address: "",
    birthDate: "",
    gender: "",
    civilStatus: "",
    nationality: "",
    position: "",
    department: "",
    supervisor: "",
    employmentType: "Regular" as Employee["employmentType"],
    dateHired: "",
    status: "Active" as string,
    salaryGrade: "",
    salaryStep: "",
    sssNumber: "",
    philhealthNumber: "",
    pagibigNumber: "",
    tinNumber: "",
    emergencyName: "",
    emergencyRelation: "",
    emergencyPhone: "",
  });
  const [showEditEmpModal, setShowEditEmpModal] = useState(false);
  const [pendingEmpUnsaved, setPendingEmpUnsaved] = useState(false);
  const [origEmpForm, setOrigEmpForm] = useState({ ...editEmpForm });
  const empHasChanges = JSON.stringify(editEmpForm) !== JSON.stringify(origEmpForm);

  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showRegularizeModal, setShowRegularizeModal] = useState(false);

  const [newPosition, setNewPosition] = useState("");
  const [newSalaryGrade, setNewSalaryGrade] = useState("SG-10");
  const [promotionNotes, setPromotionNotes] = useState("");
  const [promotionRecId, setPromotionRecId] = useState("");

  const [regularizeRecId, setRegularizeRecId] = useState("");
  const [regularizeNotes, setRegularizeNotes] = useState("");

  const [exitType, setExitType] = useState<"Resigned" | "Retired" | "Terminated">("Resigned");
  const [exitNotes, setExitNotes] = useState("");

  const [pendingConfirm, setPendingConfirm] = useState<{
    type: "save_promote" | "save_exit" | "save_regularize";
    data?: any;
  } | null>(null);
  const [pendingUnsavedExit, setPendingUnsavedExit] = useState<{
    target: "promote" | "exit" | "regularize";
  } | null>(null);

  const hasPendingRec = (empId: string) =>
    recommendations.some((r) => r.employeeId === empId && r.status === "Pending HR Action");

  const isAcknowledged = (empId: string) => acknowledgedIds.has(empId);

  const canActOnEmployee = (empId: string) => isAcknowledged(empId) || !hasPendingRec(empId);

  /** Pending performance evaluations (HR3 recommendations) usable for an action. */
  const recommendationsFor = (empId: string, type: "Regularization" | "Promotion") =>
    recommendations.filter(
      (r) =>
        r.employeeId === empId &&
        r.status === "Pending HR Action" &&
        (r.recommendationType === type || r.recommendationType === "Performance Review"),
    );

  const regularizeOptions = selectedEmp ? recommendationsFor(selectedEmp.id, "Regularization") : [];
  const promotionOptions = selectedEmp ? recommendationsFor(selectedEmp.id, "Promotion") : [];

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

  const empSort = useSort(filteredEmployees, {
    id: (e) => e.id,
    name: (e) => e.name,
    department: (e) => e.department,
    position: (e) => `${e.position} ${e.salaryGrade ?? ""}`,
    type: (e) => e.employmentType,
    dateHired: (e) => e.dateHired,
    status: (e) => e.status,
  });
  const empPage = usePagination(empSort.sorted);
  const deptOptions = Array.from(new Set(empList.map((e) => e.department))).sort();
  const positionOptions = hcm.positions.map((p) => p.title).sort();
  const supervisorOptions = empList.map((e) => e.name).sort();
  const salaryGradeOptions = hcm.salaryGrades.map((g) => g.code);

  const executeRegularization = async () => {
    if (!selectedEmp) return;
    const dbId = employeeIdByCode.get(selectedEmp.id);
    if (!dbId) {
      toast.error(`Could not resolve ${selectedEmp.id} in Core HCM.`);
      return;
    }
    const rec = recommendations.find((r) => r.id === regularizeRecId);
    if (!rec) {
      toast.error("Select a performance evaluation to justify regularization.");
      return;
    }
    try {
      await hcmApi.employees.regularize(dbId, {
        effective_date: new Date().toISOString().slice(0, 10),
        recommendation_id: rec.recommendationId,
        notes:
          regularizeNotes || `Regularized via performance evaluation (${rec.evaluationScore}%).`,
      });
      toast.success(
        `${selectedEmp.name} has passed evaluation and is now a Regular Employee! User account active.`,
      );
      await refreshHcm();
    } catch (err) {
      const status = (err as { status?: number }).status;
      toast.error(
        status === 403
          ? "You do not have permission to perform this action."
          : "Could not regularize employee.",
      );
      return;
    }

    setRecommendations((prev) =>
      prev.map((r) => (r.id === rec.id ? { ...r, status: "Approved & Processed" as const } : r)),
    );

    setShowRegularizeModal(false);
    setSelectedEmp(null);
    setRegularizeRecId("");
    setRegularizeNotes("");
  };

  const executePromotion = async () => {
    if (!selectedEmp || !newPosition) return;
    const dbId = employeeIdByCode.get(selectedEmp.id);
    if (!dbId) {
      toast.error(`Could not resolve ${selectedEmp.id} in Core HCM.`);
      return;
    }
    const pos = hcm.positions.find(
      (p) => p.title === newPosition || p.position_code === newPosition,
    );
    const sg = hcm.salaryGrades.find((g) => g.code === newSalaryGrade);
    if (!pos) {
      toast.error(`Position "${newPosition}" does not exist in Core HCM.`);
      return;
    }
    const rec = recommendations.find((r) => r.id === promotionRecId);
    if (!rec) {
      toast.error("Select a performance evaluation to justify this promotion.");
      return;
    }
    try {
      await hcmApi.employees.promote(dbId, {
        effective_date: new Date().toISOString().slice(0, 10),
        new_position_id: pos.position_id,
        new_salary_grade_id: sg?.salary_grade_id,
        recommendation_id: rec.recommendationId,
        notes: promotionNotes || `Promotion via performance evaluation (${rec.evaluationScore}%)`,
      });
      toast.success(`Promoted ${selectedEmp.name} to ${newPosition}! Salary Grade updated.`);
      await refreshHcm();
    } catch (err) {
      const status = (err as { status?: number }).status;
      toast.error(
        status === 403
          ? "You do not have permission to perform this action."
          : "Could not promote employee.",
      );
      return;
    }

    setRecommendations((prev) =>
      prev.map((r) => (r.id === rec.id ? { ...r, status: "Approved & Processed" as const } : r)),
    );

    setShowPromoteModal(false);
    setSelectedEmp(null);
    setNewPosition("");
    setPromotionNotes("");
    setPromotionRecId("");
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
      toast.warning(
        `Exit processed for ${selectedEmp.name} (${exitType}). System user account disabled.`,
      );
      await refreshHcm();
    } catch (err) {
      const status = (err as { status?: number }).status;
      toast.error(
        status === 403
          ? "You do not have permission to perform this action."
          : "Could not process exit.",
      );
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
    const pos = hcm.positions.find((p) => p.title === editEmpForm.position);
    const dept = hcm.departments.find((d) => d.name === editEmpForm.department);
    const sg = hcm.salaryGrades.find((g) => g.code === editEmpForm.salaryGrade);
    const sup = hcm.employees.find((x) => x.full_name === editEmpForm.supervisor);
    if (!pos || !dept) {
      toast.error("Please select a valid position and department.");
      return;
    }
    try {
      await hcmApi.employees.update(dbId, {
        first_name: editEmpForm.firstName,
        middle_name: editEmpForm.middleName || null,
        last_name: editEmpForm.lastName,
        email: editEmpForm.email,
        personal_email: editEmpForm.personalEmail || null,
        phone: editEmpForm.phone || null,
        address: editEmpForm.address || null,
        birth_date: editEmpForm.birthDate || null,
        gender: editEmpForm.gender || null,
        civil_status: editEmpForm.civilStatus || null,
        nationality: editEmpForm.nationality || null,
        position_id: pos.position_id,
        department_id: dept.department_id,
        supervisor_employee_id: sup?.employee_id ?? null,
        employment_type: editEmpForm.employmentType,
        date_hired: editEmpForm.dateHired,
        status: editEmpForm.status,
        salary_grade_id: sg?.salary_grade_id ?? null,
        salary_step: editEmpForm.salaryStep || null,
        sss_number: editEmpForm.sssNumber || null,
        philhealth_number: editEmpForm.philhealthNumber || null,
        pagibig_number: editEmpForm.pagibigNumber || null,
        tin_number: editEmpForm.tinNumber || null,
        emergency_contacts: editEmpForm.emergencyName
          ? [
            {
              name: editEmpForm.emergencyName,
              relationship: editEmpForm.emergencyRelation || null,
              phone: editEmpForm.emergencyPhone || null,
              address: null,
              is_primary: 1,
            },
          ]
          : [],
      });
      toast.success(`${editEmpForm.firstName} ${editEmpForm.lastName}'s profile updated.`);
      await refreshHcm();
    } catch (err) {
      const status = (err as { status?: number }).status;
      toast.error(
        status === 403
          ? "You do not have permission to modify employees."
          : "Could not update employee.",
      );
      return;
    }
    setShowEditEmpModal(false);
    setEditingEmp(null);
  };

  const openEditEmployee = async (e: Employee) => {
    setEditingEmp(e);
    const dbId = employeeIdByCode.get(e.id);
    let api: ApiEmployee | undefined = hcm.employees.find((x) => x.employee_code === e.id);
    if (dbId) {
      try {
        api = (await hcmApi.employees.get(dbId)).data;
      } catch {
        /* fall back to the roster snapshot */
      }
    }
    const emergency =
      api?.emergency_contacts?.find((c) => c.is_primary) ?? api?.emergency_contacts?.[0];
    const sup = api?.supervisor_employee_id
      ? hcm.employees.find((x) => x.employee_id === api.supervisor_employee_id)
      : undefined;
    const sg = api?.salary_grade_id
      ? hcm.salaryGrades.find((g) => g.salary_grade_id === api.salary_grade_id)
      : undefined;
    const nameParts = e.name.split(" ");
    const form = {
      firstName: api?.first_name ?? nameParts[0] ?? "",
      middleName: api?.middle_name ?? "",
      lastName: api?.last_name ?? nameParts.slice(1).join(" "),
      email: api?.email ?? e.email,
      personalEmail: api?.personal_email ?? "",
      phone: api?.phone ?? e.phone,
      address: api?.address ?? "",
      birthDate: api?.birth_date ?? "",
      gender: api?.gender ?? "",
      civilStatus: api?.civil_status ?? "",
      nationality: api?.nationality ?? "",
      position: api?.position_title ?? e.position,
      department: api?.department_name ?? e.department,
      supervisor: sup?.full_name ?? e.supervisor,
      employmentType: (api?.employment_type ?? e.employmentType) as Employee["employmentType"],
      dateHired: api?.date_hired ?? e.dateHired,
      status: api?.status ?? e.status,
      salaryGrade: sg?.code ?? e.salaryGrade ?? "",
      salaryStep: api?.salary_step ?? "",
      sssNumber: api?.sss_number ?? "",
      philhealthNumber: api?.philhealth_number ?? "",
      pagibigNumber: api?.pagibig_number ?? "",
      tinNumber: api?.tin_number ?? "",
      emergencyName: emergency?.name ?? "",
      emergencyRelation: emergency?.relationship ?? "",
      emergencyPhone: emergency?.phone ?? "",
    };
    setEditEmpForm(form);
    setOrigEmpForm(form);
    setShowEditEmpModal(true);
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
                  Prerequisites for employee Regularization and Promotion based on recent
                  performance scores.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-gold/50 bg-gold/10 text-gold-foreground text-xs"
              >
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
                      : "border-border/80 bg-card hover:border-gold/60 shadow-2xs",
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
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {rec.department} · Score:{" "}
                    <strong className="text-foreground">{rec.evaluationScore}%</strong>
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground italic line-clamp-2">
                    "{rec.comments}"
                  </p>
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
                      onClick={async () => {
                        try {
                          await hcmApi.hr3Recommendations.acknowledge(rec.recommendationId);
                          setAcknowledgedIds((prev) => new Set([...prev, rec.employeeId]));
                        } catch {
                          toast.error("Could not acknowledge the evaluation. Please try again.");
                        }
                      }}
                    >
                      <UserCheck className="mr-1 h-3.5 w-3.5" /> Acknowledge
                    </Button>
                  )}
                  {rec.status === "Pending HR Action" && acknowledgedIds.has(rec.employeeId) && (
                    <Badge
                      variant="outline"
                      className="border-success/40 bg-success/10 text-success text-[10px]"
                    >
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
        <DialogContent className="sm:max-w-6xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-gold" />
              All Performance & Development Handoff Requests
            </DialogTitle>
            <DialogDescription>
              Full list of HR3 evaluation recommendations sent to Core HCM for action.
            </DialogDescription>
          </DialogHeader>
          <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
            <div className="relative min-w-[14rem] flex-1 sm:max-w-xs">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-8 pl-8 text-xs"
                placeholder="Search employee, ID, department…"
                value={recSearch}
                onChange={(e) => setRecSearch(e.target.value)}
              />
            </div>
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
            <ReportMenu
              size="sm"
              recordCount={filteredRecs.length}
              report={() => ({
                title: "HR3 Recommendations Report",
                subtitle: `${filteredRecs.length} record(s) · exported ${new Date().toISOString().slice(0, 10)}`,
                columns: [
                  { header: "Evaluation ID", key: "id" },
                  { header: "Employee", key: "employeeName" },
                  { header: "Department", key: "department" },
                  { header: "Type", key: "recommendationType" },
                  { header: "Score", key: "evaluationScore" },
                  { header: "Evaluator", key: "evaluator" },
                  { header: "Submitted", key: "dateSubmitted" },
                  { header: "Status", key: "status" },
                ],
                rows: filteredRecs.map((r) => ({ ...r })),
              })}
            />
          </div>
          <div className="min-w-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortHead sortKey="id" sort={recSort.sort} onSort={recSort.toggle}>Evaluation ID</SortHead>
                  <SortHead sortKey="employeeName" sort={recSort.sort} onSort={recSort.toggle}>Employee</SortHead>
                  <SortHead sortKey="department" sort={recSort.sort} onSort={recSort.toggle}>Department</SortHead>
                  <SortHead sortKey="recommendationType" sort={recSort.sort} onSort={recSort.toggle}>Type</SortHead>
                  <SortHead sortKey="evaluationScore" sort={recSort.sort} onSort={recSort.toggle} align="center">Score</SortHead>
                  <TableHead>Comments</TableHead>
                  <SortHead sortKey="status" sort={recSort.sort} onSort={recSort.toggle}>Status</SortHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recPage.pageItems.map((rec) => (
                  <TableRow key={rec.id}>
                    <TableCell className="font-mono text-xs font-semibold text-muted-foreground">
                      {rec.id}
                    </TableCell>
                    <TableCell className="font-semibold text-sm">{rec.employeeName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {rec.department}
                    </TableCell>
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
                    <TableCell className="text-center font-mono text-xs font-semibold">
                      {rec.evaluationScore}%
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground italic max-w-xs truncate">
                      {rec.comments}
                    </TableCell>
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
        </DialogContent>
      </Dialog>

      {/* MAIN EMPLOYEE ROSTER CARD */}
      {/* Generate Report aligned with the page title via HeaderActions portal */}
      <HeaderActions>
        <ReportMenu
          size="sm"
          recordCount={filteredEmployees.length}
          report={() => ({
            title: "Employee Roster Report",
            subtitle: `${filteredEmployees.length} record(s) · exported ${new Date().toISOString().slice(0, 10)}`,
            columns: [
              { header: "Employee ID", key: "id" },
              { header: "Name", key: "name" },
              { header: "Department", key: "department" },
              { header: "Position", key: "position" },
              { header: "Salary Grade", key: "salaryGrade" },
              { header: "Type", key: "employmentType" },
              { header: "Date Hired", key: "dateHired" },
              { header: "Status", key: "status" },
            ],
            rows: filteredEmployees.map((r) => ({ ...r })),
          })}
        />
      </HeaderActions>
      <Card className="border-border/70 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
                <Users className="h-5 w-5 text-primary" /> Employee Roster
              </h2>
              <p className="text-xs text-muted-foreground">
                {filteredEmployees.length} record{filteredEmployees.length !== 1 ? "s" : ""} found
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[14rem]">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="h-9 border-border bg-card pl-8 pr-8 text-xs shadow-2xs"
                  placeholder="Search name, ID, position…"
                  value={empSearch}
                  onChange={(e) => onEmpSearchChange(e.target.value)}
                />
                {empSearch && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    title="Clear search"
                    onClick={() => onEmpSearchChange("")}
                    className="absolute right-2 top-1/2 grid h-5 w-5 -translate-y-1/2 cursor-pointer place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <Select value={empDeptFilter} onValueChange={setEmpDeptFilter}>
                <SelectTrigger className="h-9 w-44 text-xs bg-card shadow-2xs">
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All departments</SelectItem>
                  {deptOptions.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
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
                  <SortHead sortKey="id" sort={empSort.sort} onSort={empSort.toggle}>Employee ID</SortHead>
                  <SortHead sortKey="name" sort={empSort.sort} onSort={empSort.toggle}>Name</SortHead>
                  <SortHead sortKey="department" sort={empSort.sort} onSort={empSort.toggle}>Department</SortHead>
                  <SortHead sortKey="position" sort={empSort.sort} onSort={empSort.toggle}>Position & Grade</SortHead>
                  <SortHead sortKey="type" sort={empSort.sort} onSort={empSort.toggle}>Type</SortHead>
                  <SortHead sortKey="dateHired" sort={empSort.sort} onSort={empSort.toggle}>Date Hired</SortHead>
                  <SortHead sortKey="status" sort={empSort.sort} onSort={empSort.toggle}>Status</SortHead>
                  <TableHead className="text-center">Details</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hcmLoading && empList.length === 0 && <TableRowsSkeleton cols={9} rows={6} />}
                {(!hcmLoading || empList.length > 0) &&
                  empPage.pageItems.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-mono text-xs font-medium">{e.id}</TableCell>
                    <TableCell className="font-medium">{e.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{e.department}</TableCell>
                    <TableCell className="text-xs">
                      <div>{e.position}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {e.salaryGrade || "SG-08"}
                      </div>
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
                            : e.status === "Resigned" ||
                              e.status === "Retired" ||
                              e.status === "Terminated"
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
                        onClick={() => {
                          loadRecordDetail(e.id);
                          setViewingEmpInfo(e);
                        }}
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
                          onClick={() => openEditEmployee(e)}
                        >
                          <Pencil className="mr-1 h-3 w-3" /> Edit
                        </Button>

                        {e.employmentType === "Probationary" &&
                          e.status === "Active" &&
                          canActOnEmployee(e.id) && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2 text-xs border-success/50 text-success hover:bg-success/10"
                              onClick={() => {
                                setSelectedEmp(e);
                                setRegularizeRecId(
                                  recommendationsFor(e.id, "Regularization")[0]?.id ?? "",
                                );
                                setRegularizeNotes("");
                                setShowRegularizeModal(true);
                              }}
                            >
                              <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Regularize
                            </Button>
                          )}

                        {e.status === "Active" &&
                          e.employmentType !== "Probationary" &&
                          canActOnEmployee(e.id) && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2 text-xs"
                              disabled={recommendationsFor(e.id, "Promotion").length === 0}
                              title={
                                recommendationsFor(e.id, "Promotion").length === 0
                                  ? "No performance evaluation on file — required before promoting."
                                  : undefined
                              }
                              onClick={() => {
                                setSelectedEmp(e);
                                setNewPosition(e.position);
                                setNewSalaryGrade(e.salaryGrade || "SG-10");
                                setPromotionRecId(
                                  recommendationsFor(e.id, "Promotion")[0]?.id ?? "",
                                );
                                setShowPromoteModal(true);
                              }}
                            >
                              <TrendingUp className="mr-1 h-3.5 w-3.5 text-primary" /> Promote
                            </Button>
                          )}

                        {e.status === "Active" && hasPendingRec(e.id) && !isAcknowledged(e.id) && (
                          <span className="text-[10px] text-muted-foreground italic pr-1">
                            Acknowledge first
                          </span>
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
                        <div className="text-xs text-muted-foreground">
                          {viewingEmpInfo.position} · {viewingEmpInfo.department} ·{" "}
                          {viewingEmpInfo.id}
                        </div>
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
                      <Field
                        k="Rate"
                        v={`${viewingEmpInfo.employmentType} · ${p.contract.split(" · ")[0]}`}
                      />
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
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" /> Edit Employee — {editingEmp?.name}
            </DialogTitle>
            <DialogDescription>
              Update all employee profile information in Core HCM.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2 text-xs">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Personal Details</Label>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">First Name</Label>
                  <Input
                    value={editEmpForm.firstName}
                    onChange={(e) => setEditEmpForm({ ...editEmpForm, firstName: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Middle Name</Label>
                  <Input
                    value={editEmpForm.middleName}
                    onChange={(e) => setEditEmpForm({ ...editEmpForm, middleName: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Last Name</Label>
                  <Input
                    value={editEmpForm.lastName}
                    onChange={(e) => setEditEmpForm({ ...editEmpForm, lastName: e.target.value })}
                    className="text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Contact Information</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Company Email</Label>
                  <Input
                    type="email"
                    value={editEmpForm.email}
                    onChange={(e) => setEditEmpForm({ ...editEmpForm, email: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Personal Email</Label>
                  <Input
                    type="email"
                    value={editEmpForm.personalEmail}
                    onChange={(e) =>
                      setEditEmpForm({ ...editEmpForm, personalEmail: e.target.value })
                    }
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Mobile Number</Label>
                  <Input
                    value={editEmpForm.phone}
                    onChange={(e) => setEditEmpForm({ ...editEmpForm, phone: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Home Address</Label>
                  <Input
                    value={editEmpForm.address}
                    onChange={(e) => setEditEmpForm({ ...editEmpForm, address: e.target.value })}
                    className="text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Other Personal Information</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Birth Date</Label>
                  <Input
                    type="date"
                    value={editEmpForm.birthDate}
                    onChange={(e) => setEditEmpForm({ ...editEmpForm, birthDate: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Gender</Label>
                  <Select
                    value={editEmpForm.gender}
                    onValueChange={(v) => setEditEmpForm({ ...editEmpForm, gender: v })}
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Civil Status</Label>
                  <Select
                    value={editEmpForm.civilStatus}
                    onValueChange={(v) => setEditEmpForm({ ...editEmpForm, civilStatus: v })}
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Select civil status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single">Single</SelectItem>
                      <SelectItem value="Married">Married</SelectItem>
                      <SelectItem value="Widowed">Widowed</SelectItem>
                      <SelectItem value="Separated">Separated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Nationality</Label>
                  <Input
                    value={editEmpForm.nationality}
                    onChange={(e) =>
                      setEditEmpForm({ ...editEmpForm, nationality: e.target.value })
                    }
                    className="text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Employment Information</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Position</Label>
                  <Select
                    value={editEmpForm.position}
                    onValueChange={(v) => setEditEmpForm({ ...editEmpForm, position: v })}
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      {positionOptions.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Department</Label>
                  <Select
                    value={editEmpForm.department}
                    onValueChange={(v) => setEditEmpForm({ ...editEmpForm, department: v })}
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {deptOptions.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Immediate Supervisor</Label>
                  <Select
                    value={editEmpForm.supervisor}
                    onValueChange={(v) => setEditEmpForm({ ...editEmpForm, supervisor: v })}
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Select supervisor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">— None —</SelectItem>
                      {supervisorOptions.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Employment Type</Label>
                  <Select
                    value={editEmpForm.employmentType}
                    onValueChange={(v: any) =>
                      setEditEmpForm({ ...editEmpForm, employmentType: v })
                    }
                  >
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
                  <Input
                    type="date"
                    value={editEmpForm.dateHired}
                    onChange={(e) => setEditEmpForm({ ...editEmpForm, dateHired: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Status</Label>
                  <Select
                    value={editEmpForm.status}
                    onValueChange={(v) => setEditEmpForm({ ...editEmpForm, status: v })}
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="On Leave">On Leave</SelectItem>
                      <SelectItem value="Resigned">Resigned</SelectItem>
                      <SelectItem value="Retired">Retired</SelectItem>
                      <SelectItem value="Terminated">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Salary Grade</Label>
                  <Select
                    value={editEmpForm.salaryGrade}
                    onValueChange={(v) => setEditEmpForm({ ...editEmpForm, salaryGrade: v })}
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Select salary grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">— None —</SelectItem>
                      {salaryGradeOptions.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Salary Step</Label>
                  <Input
                    value={editEmpForm.salaryStep}
                    onChange={(e) => setEditEmpForm({ ...editEmpForm, salaryStep: e.target.value })}
                    className="text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Government IDs</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">SSS Number</Label>
                  <Input
                    value={editEmpForm.sssNumber}
                    onChange={(e) => setEditEmpForm({ ...editEmpForm, sssNumber: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">PhilHealth Number</Label>
                  <Input
                    value={editEmpForm.philhealthNumber}
                    onChange={(e) =>
                      setEditEmpForm({ ...editEmpForm, philhealthNumber: e.target.value })
                    }
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Pag-IBIG MID</Label>
                  <Input
                    value={editEmpForm.pagibigNumber}
                    onChange={(e) =>
                      setEditEmpForm({ ...editEmpForm, pagibigNumber: e.target.value })
                    }
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">TIN</Label>
                  <Input
                    value={editEmpForm.tinNumber}
                    onChange={(e) => setEditEmpForm({ ...editEmpForm, tinNumber: e.target.value })}
                    className="text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Emergency Contact</Label>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Name</Label>
                  <Input
                    value={editEmpForm.emergencyName}
                    onChange={(e) =>
                      setEditEmpForm({ ...editEmpForm, emergencyName: e.target.value })
                    }
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Relationship</Label>
                  <Input
                    value={editEmpForm.emergencyRelation}
                    onChange={(e) =>
                      setEditEmpForm({ ...editEmpForm, emergencyRelation: e.target.value })
                    }
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Contact Number</Label>
                  <Input
                    value={editEmpForm.emergencyPhone}
                    onChange={(e) =>
                      setEditEmpForm({ ...editEmpForm, emergencyPhone: e.target.value })
                    }
                    className="text-xs"
                  />
                </div>
              </div>
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
            <Button onClick={executeSaveEmployee}>Save Changes</Button>
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
            <DialogDescription>
              Update position title and salary grade in Core HCM.
            </DialogDescription>
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
                      {sg.code} ({sg.title} · {formatMoney(Number(sg.min_salary))} –{" "}
                      {formatMoney(Number(sg.max_salary))})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Performance Evaluation (HR3) — required</Label>
              {promotionOptions.length > 0 ? (
                <Select value={promotionRecId} onValueChange={setPromotionRecId}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Select an evaluation" />
                  </SelectTrigger>
                  <SelectContent>
                    {promotionOptions.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.recommendationType} · {r.evaluationScore}% · {r.dateSubmitted}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
                  No pending performance evaluation on file. A completed HR3 evaluation is required
                  before promoting.
                </div>
              )}
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
            <Button
              onClick={() => setPendingConfirm({ type: "save_promote" })}
              disabled={!promotionRecId}
            >
              Save Promotion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* REGULARIZATION MODAL */}
      <Dialog
        open={showRegularizeModal}
        onOpenChange={(open) => {
          if (!open && (regularizeRecId || regularizeNotes)) {
            setPendingUnsavedExit({ target: "regularize" });
          } else {
            setShowRegularizeModal(open);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" /> Regularize Employee —{" "}
              {selectedEmp?.name}
            </DialogTitle>
            <DialogDescription>
              Convert to Regular status based on a completed performance evaluation in Core HCM.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
              Current employment type: <strong>{selectedEmp?.employmentType}</strong> · Current
              position: <strong>{selectedEmp?.position}</strong>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Performance Evaluation (HR3) — required</Label>
              {regularizeOptions.length > 0 ? (
                <Select value={regularizeRecId} onValueChange={setRegularizeRecId}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Select an evaluation" />
                  </SelectTrigger>
                  <SelectContent>
                    {regularizeOptions.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.recommendationType} · {r.evaluationScore}% · {r.dateSubmitted}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
                  No pending performance evaluation on file. A completed HR3 evaluation is required
                  before regularization.
                </div>
              )}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Evaluation Notes</Label>
              <Textarea
                value={regularizeNotes}
                onChange={(e) => setRegularizeNotes(e.target.value)}
                placeholder="Performance evaluation summary..."
                rows={3}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (regularizeRecId || regularizeNotes) {
                  setPendingUnsavedExit({ target: "regularize" });
                } else {
                  setShowRegularizeModal(false);
                  setSelectedEmp(null);
                }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => setPendingConfirm({ type: "save_regularize" })}
              disabled={!regularizeRecId}
            >
              Confirm Regularization
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
            <DialogDescription>
              Mark exit status in HCM. This will automatically deactivate user account.
            </DialogDescription>
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
                  <SelectItem value="Terminated">
                    Terminated (Disciplinary / Performance)
                  </SelectItem>
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
              ⚠️ <strong>Security Action</strong>: Confirming exit status will instantly revoke user
              credentials in User Management.
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
      <AlertDialog
        open={!!pendingConfirm}
        onOpenChange={(open) => !open && setPendingConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingConfirm?.type === "save_promote" &&
                `Are you sure you want to promote ${selectedEmp?.name} to ${newPosition}?`}
              {pendingConfirm?.type === "save_exit" &&
                `Are you sure you want to process exit status (${exitType}) for ${selectedEmp?.name}? User account will be disabled.`}
              {pendingConfirm?.type === "save_regularize" &&
                `Are you sure you want to convert ${selectedEmp?.name} to Regular employee status based on the selected performance evaluation?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingConfirm(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingConfirm?.type === "save_promote") executePromotion();
                if (pendingConfirm?.type === "save_exit") executeExit();
                if (pendingConfirm?.type === "save_regularize") executeRegularization();
                setPendingConfirm(null);
              }}
            >
              Yes, Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* CONFIRMATION ALERT DIALOG (UNSAVED CHANGES EXIT) */}
      <AlertDialog
        open={!!pendingUnsavedExit}
        onOpenChange={(open) => !open && setPendingUnsavedExit(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-amber-600">Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes in this form. Are you sure you want to exit without saving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingUnsavedExit(null)}>
              Keep Editing
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (pendingUnsavedExit?.target === "promote") setShowPromoteModal(false);
                if (pendingUnsavedExit?.target === "exit") setShowExitModal(false);
                if (pendingUnsavedExit?.target === "regularize") {
                  setShowRegularizeModal(false);
                  setSelectedEmp(null);
                  setRegularizeRecId("");
                  setRegularizeNotes("");
                }
                setPendingUnsavedExit(null);
              }}
            >
              Discard & Exit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* CONFIRMATION ALERT DIALOG (UNSAVED EMP EDIT) */}
      <AlertDialog
        open={pendingEmpUnsaved}
        onOpenChange={(open) => !open && setPendingEmpUnsaved(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-amber-600">Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes in this form. Are you sure you want to exit without saving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingEmpUnsaved(false)}>
              Keep Editing
            </AlertDialogCancel>
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

/* --- Promotion Requests Manager (HR inbox for ESS-filed requests) --- */
function PromotionRequestsManager() {
  const [rows, setRows] = useState<ApiPromotionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [reviewFor, setReviewFor] = useState<ApiPromotionRequest | null>(null);
  const [decision, setDecision] = useState<"approve" | "reject" | "return" | "terminate" | "defer">("approve");
  const [notes, setNotes] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await hcmApi.promotions.list({ per_page: 100 });
      setRows(res?.data ?? []);
    } catch {
      toast.error("Could not load promotion requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase().trim();
    const name = `${r.employee?.first_name ?? ""} ${r.employee?.last_name ?? ""}`.toLowerCase();
    const matches =
      !q ||
      name.includes(q) ||
      (r.employee?.employee_code ?? "").toLowerCase().includes(q) ||
      (r.justification ?? "").toLowerCase().includes(q);
    return matches && (statusFilter === "all" || r.status === statusFilter);
  });
  const promoSort = useSort(filtered, {
    employee: (r) => `${r.employee?.first_name ?? ""} ${r.employee?.last_name ?? ""}`,
    requested: (r) => r.requested_position?.title ?? "",
    status: (r) => r.status,
    filed: (r) => r.created_at,
  });
  const page = usePagination(promoSort.sorted);
  const pendingCount = rows.filter((r) =>
    ["Pending", "Returned", "Under HR3 Review", "Pending HR Action"].includes(r.status),
  ).length;

  return (
    <>
      <HeaderActions>
        <ReportMenu
          size="sm"
          recordCount={filtered.length}
          report={() => ({
            title: "Promotion Requests Report",
            subtitle: `${filtered.length} record(s) · exported ${new Date().toISOString().slice(0, 10)}`,
            columns: [
              { header: "Employee", key: "employee" },
              { header: "Code", key: "code" },
              { header: "Requested", key: "requested" },
              { header: "Status", key: "status" },
              { header: "Filed", key: "filed" },
            ],
            rows: filtered.map((r) => ({
              employee: `${r.employee?.first_name ?? ""} ${r.employee?.last_name ?? ""}`.trim(),
              code: r.employee?.employee_code ?? "",
              requested: r.requested_position?.title ?? "For HR review",
              status: r.status,
              filed: new Date(r.created_at).toLocaleDateString(),
            })),
          })}
        />
      </HeaderActions>
      <Card className="border-border/70 shadow-sm">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 font-display text-xl font-semibold">
                <TrendingUp className="h-4 w-4 text-primary" /> Promotion Requests
                {pendingCount > 0 && (
                  <Badge variant="outline" className="border-gold/40 text-gold text-[10px]">
                    {pendingCount} pending
                  </Badge>
                )}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Filed by employees via ESS. Forward to HR3 for evaluation, then
                decide (promote / terminate) once the HR3 score is back — or
                approve directly for non-HR3 cases.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[12rem]">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search employee, code, reason…"
                  className="h-9 pl-8 text-xs bg-card"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 w-32 text-xs bg-card">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Under HR3 Review">Under HR3 Review</SelectItem>
                  <SelectItem value="Pending HR Action">Pending HR Action</SelectItem>
                  <SelectItem value="Returned">Returned</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Terminated">Terminated</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Deferred">Deferred</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline" className="h-9 gap-1.5 text-xs" onClick={load}>
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
                <TableHeader>
                  <TableRow>
                    <SortHead sortKey="employee" sort={promoSort.sort} onSort={promoSort.toggle} className="pl-6">Employee</SortHead>
                    <SortHead sortKey="requested" sort={promoSort.sort} onSort={promoSort.toggle}>Current → Requested</SortHead>
                    <TableHead>Justification</TableHead>
                    <SortHead sortKey="status" sort={promoSort.sort} onSort={promoSort.toggle}>Status</SortHead>
                    <SortHead sortKey="filed" sort={promoSort.sort} onSort={promoSort.toggle}>Filed</SortHead>
                    <TableHead className="text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && <TableRowsSkeleton cols={6} rows={6} />}
                  {!loading &&
                    page.pageItems.map((r) => (
                    <TableRow key={r.promotion_request_id}>
                      <TableCell className="pl-6 text-xs">
                        <p className="font-semibold">
                          {r.employee?.first_name} {r.employee?.last_name}
                        </p>
                        <p className="font-mono text-[11px] text-muted-foreground">
                          {r.employee?.employee_code}
                        </p>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {r.employee?.position?.title ?? "—"} →{" "}
                        <span className="font-medium text-foreground">
                          {r.requested_position?.title ?? "For HR review"}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-64 truncate text-xs text-muted-foreground">
                        {r.justification}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            r.status === "Approved"
                              ? "border-success/40 bg-success/10 text-success text-[10px]"
                              : r.status === "Rejected" || r.status === "Terminated"
                                ? "border-destructive/40 bg-destructive/10 text-destructive text-[10px]"
                                : r.status === "Under HR3 Review" || r.status === "Pending HR Action"
                                  ? "border-primary/40 bg-primary/10 text-primary text-[10px]"
                                  : "border-gold/40 text-gold text-[10px]"
                          }
                        >
                          {r.status}
                        </Badge>
                        {r.hr3_recommendation && (
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            HR3: {r.hr3_recommendation.evaluation_score}% ·{" "}
                            {r.hr3_recommendation.recommendation_type}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-1.5">
                          {(r.status === "Pending" || r.status === "Returned") && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs border-primary/40 text-primary hover:bg-primary/10"
                              onClick={async () => {
                                try {
                                  await hcmApi.promotions.forwardToHr3(r.promotion_request_id);
                                  toast.success("Forwarded to HR3 for evaluation.");
                                  load();
                                  notifyHcmChanged();
                                } catch (e: any) {
                                  toast.error(e?.message || "Could not forward to HR3.");
                                }
                              }}
                            >
                              <Send className="mr-1 h-3.5 w-3.5" /> To HR3
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            disabled={
                              r.status !== "Pending" &&
                              r.status !== "Returned" &&
                              r.status !== "Pending HR Action"
                            }
                            onClick={() => {
                              setReviewFor(r);
                              setDecision("approve");
                              setNotes("");
                            }}
                          >
                            <Eye className="mr-1 h-3.5 w-3.5" /> Review
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!loading && filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-xs text-muted-foreground">
                        No promotion requests found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="p-4 pt-2">
                <TablePagination
                  page={page.page}
                  pageCount={page.pageCount}
                  from={page.from}
                  to={page.to}
                  total={page.total}
                  label="promotion requests"
                  onPageChange={page.setPage}
                />
              </div>
        </CardContent>
      </Card>

      <Dialog open={!!reviewFor} onOpenChange={(o) => !o && setReviewFor(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Review — {reviewFor?.employee?.first_name} {reviewFor?.employee?.last_name}
            </DialogTitle>
            <DialogDescription>
              {reviewFor?.employee?.position?.title} →{" "}
              {reviewFor?.requested_position?.title ?? "HR to decide"}. Filed{" "}
              {reviewFor ? new Date(reviewFor.created_at).toLocaleDateString() : ""}.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md bg-muted/50 p-3 text-xs italic text-muted-foreground">
            “{reviewFor?.justification}”
          </div>
          {reviewFor?.hr3_recommendation && (
            <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-xs">
              <p className="font-semibold text-foreground">
                HR3 evaluation: {reviewFor.hr3_recommendation.evaluation_score}% ·{" "}
                {reviewFor.hr3_recommendation.recommendation_type}
              </p>
              <p className="text-muted-foreground">
                Status: {reviewFor.hr3_recommendation.status}. Approval consumes
                this evaluation (marks it processed).
              </p>
            </div>
          )}
          {reviewFor && (reviewFor.status === "Pending" || reviewFor.status === "Returned") && (
            <Button
              variant="outline"
              className="border-primary/40 text-primary hover:bg-primary/10"
              onClick={async () => {
                try {
                  await hcmApi.promotions.forwardToHr3(reviewFor.promotion_request_id, {
                    note: notes || undefined,
                  });
                  toast.success("Forwarded to HR3 for evaluation.");
                  setReviewFor(null);
                  load();
                  notifyHcmChanged();
                } catch (e: any) {
                  toast.error(e?.message || "Could not forward to HR3.");
                }
              }}
            >
              <Send className="mr-1.5 h-3.5 w-3.5" /> Forward to HR3 instead
            </Button>
          )}
          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <Label>Decision</Label>
              <Select value={decision} onValueChange={(v: any) => setDecision(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approve">Approve & apply promotion</SelectItem>
                  <SelectItem value="terminate">Terminate (succession decision)</SelectItem>
                  <SelectItem value="defer">Defer</SelectItem>
                  <SelectItem value="return">Return for clarification</SelectItem>
                  <SelectItem value="reject">Reject</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Review notes</Label>
              <Textarea
                rows={3}
                placeholder="Reason / effective notes for the employee record…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewFor(null)}>
              Cancel
            </Button>
            <Button onClick={() => setConfirming(true)}>Review decision</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm {decision}?</AlertDialogTitle>
            <AlertDialogDescription>
              {decision === "approve"
                ? reviewFor?.hr3_recommendation
                  ? `Applies the promotion using the linked HR3 score (${reviewFor.hr3_recommendation.evaluation_score}%) and marks the evaluation processed.`
                  : "The promotion is applied immediately: position transfer, filled-count move and a position-history entry."
                : decision === "terminate"
                  ? "The employee is exited (Resigned/Terminated flow) and the request is closed as Terminated."
                  : decision === "defer"
                    ? "The request and its HR3 evaluation are parked as Deferred."
                    : decision === "return"
                      ? "The employee is asked for clarification and can resubmit."
                      : "The request is closed as rejected."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Back</AlertDialogCancel>
            <AlertDialogAction
              className={
                decision === "reject"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
              onClick={async () => {
                if (!reviewFor) return;
                setSaving(true);
                try {
                  await hcmApi.promotions.review(reviewFor.promotion_request_id, {
                    decision,
                    review_notes: notes || undefined,
                  });
                  toast.success(`Promotion request ${decision}d.`);
                  setReviewFor(null);
                  setConfirming(false);
                  load();
                  notifyHcmChanged();
                } catch (e: any) {
                  toast.error(e?.message || "Could not review request.");
                } finally {
                  setSaving(false);
                }
              }}
            >
              {saving ? "Saving…" : `Confirm ${decision}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
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
  const [logsLoading, setLogsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLogsError("");
      setLogsLoading(true);
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
            employeeName:
              emp?.full_name ||
              a.details?.replace(/^(Regularized|Promoted|Exited)\s+/, "").split(" ")[0] ||
              a.target_id ||
              "Unknown",
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
          setLogsError(
            "Your account does not have Audit Logs permission, so lifecycle transitions cannot be loaded.",
          );
        } else {
          setLogsError("Could not load lifecycle transition logs from the audit trail.");
        }
        setLogs([]);
      }
      if (!cancelled) setLogsLoading(false);
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

  const logSort = useSort(filteredLogs, {
    id: (l) => l.id,
    timestamp: (l) => l.timestamp,
    category: (l) => l.category,
    employee: (l) => `${l.employeeId} ${l.employeeName}`,
    position: (l) => `${l.position} ${l.department}`,
    actor: (l) => l.actor,
  });
  const page = usePagination(logSort.sorted);

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
    <>
    <HeaderActions>
      <ReportMenu
        size="sm"
        recordCount={filteredLogs.length}
        report={() => ({
          title: "Lifecycle Logs Report",
          subtitle: `${filteredLogs.length} record(s) · exported ${new Date().toISOString().slice(0, 10)}`,
          columns: [
            { header: "Log ID", key: "id" },
            { header: "Timestamp", key: "timestamp" },
            { header: "Category", key: "category" },
            { header: "Employee", key: "employeeName" },
            { header: "Position", key: "position" },
            { header: "Department", key: "department" },
            { header: "Actor", key: "actor" },
          ],
          rows: filteredLogs.map((r) => ({ ...r })),
        })}
      />
    </HeaderActions>
    <Card className="border-border/70 shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
              <History className="h-5 w-5 text-primary" /> Lifecycle Transition Logs
            </h2>
            <p className="text-xs text-muted-foreground">
              Audit log records of employee regularizations, promotions, resignations, terminations,
              and retirements.
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
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
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
                <SortHead sortKey="id" sort={logSort.sort} onSort={logSort.toggle}>Log ID</SortHead>
                <SortHead sortKey="timestamp" sort={logSort.sort} onSort={logSort.toggle}>Timestamp</SortHead>
                <SortHead sortKey="category" sort={logSort.sort} onSort={logSort.toggle}>Action Category</SortHead>
                <SortHead sortKey="employee" sort={logSort.sort} onSort={logSort.toggle}>Target Employee (Status Changed)</SortHead>
                <SortHead sortKey="position" sort={logSort.sort} onSort={logSort.toggle}>Position & Department</SortHead>
                <SortHead sortKey="actor" sort={logSort.sort} onSort={logSort.toggle}>HR Admin / Actor</SortHead>
                <TableHead>Action Details & Justification</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logsLoading && <TableRowsSkeleton cols={7} rows={6} />}
              {!logsLoading &&
                page.pageItems.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs font-medium">{log.id}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{log.timestamp}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-semibold",
                        getCategoryBadgeClass(log.category),
                      )}
                    >
                      {log.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="font-semibold text-foreground">{log.employeeName}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">
                      {log.employeeId}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="font-medium">{log.position}</div>
                    <div className="text-[11px] text-muted-foreground">{log.department}</div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <span className="font-medium">{log.actor}</span>
                    <span className="text-muted-foreground block text-[11px]">{log.actorRole}</span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-xs">
                    {log.details}
                  </TableCell>
                </TableRow>
              ))}
              {!logsLoading && filteredLogs.length === 0 && (
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
    </>
  );
}

/* =========================================================================
   2. DEPARTMENT & POSITION MODULE
   ========================================================================= */

export function DeptPosModule({ role = "admin" }: { role?: Role }) {
  const [activeTab, setActiveTab] = useState<"deptpos" | "salary" | "reqs">(() => {
    const saved =
      typeof window !== "undefined" ? window.sessionStorage.getItem("hcm-deptpos-tab") : null;
    return (saved === "deptpos" || saved === "salary" || saved === "reqs" ? saved : "deptpos") as
      "deptpos" | "salary" | "reqs";
  });

  useEffect(() => {
    window.sessionStorage.setItem("hcm-deptpos-tab", activeTab);
  }, [activeTab]);

  /** Slot each tab portals its Generate Report control into (page header). */
  const [headerActionsEl, setHeaderActionsEl] = useState<HTMLDivElement | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Core HCM · Organization Setup"
        title="Department, Position & Salary Grade Management"
        description="Configure property departments, define position headcounts, manage salary grade structures, and approve requisitions."
        actions={<div ref={setHeaderActionsEl} className="flex flex-wrap items-center gap-2" />}
      />

      <HeaderActionsContext.Provider value={headerActionsEl}>
      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="space-y-6">
        <TabsList className="inline-flex h-auto flex-wrap justify-start rounded-xl border border-border/70 bg-muted/70 p-1 shadow-sm text-muted-foreground">
          <TabsTrigger
            value="deptpos"
            className="rounded-lg px-4 py-2 text-xs font-semibold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm cursor-pointer"
          >
            <Building2 className="mr-1.5 h-4 w-4" /> Department and Position
          </TabsTrigger>
          <TabsTrigger
            value="salary"
            className="rounded-lg px-4 py-2 text-xs font-semibold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm cursor-pointer"
          >
            <DollarSign className="mr-1.5 h-4 w-4" /> Salary Grade Management
          </TabsTrigger>
          <TabsTrigger
            value="reqs"
            className="rounded-lg px-4 py-2 text-xs font-semibold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm cursor-pointer"
          >
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
          <RequisitionManager role={role} />
        </TabsContent>
      </Tabs>
      </HeaderActionsContext.Provider>
    </div>
  );
}

/* --- Department and Position Manager --- */
function DepartmentAndPositionManager({ role }: { role: Role }) {
  const hcm = useHcmData();
  const hcmLoading = useHcmLoading();
  const reqs = useRequisitions();

  const deptList = useMemo<Department[]>(() => hcm.departments.map(toUiDepartment), [hcm]);
  const posList = useMemo<Position[]>(
    () => hcm.positions.map((p) => toUiPosition(p, hcm.salaryGrades)),
    [hcm],
  );
  const sGrades = useMemo<SalaryGrade[]>(() => hcm.salaryGrades.map(toUiSalaryGrade), [hcm]);
  const employees = useMemo(
    () => hcm.employees.map((e) => toUiEmployee(e, hcm.employees, hcm.salaryGrades)),
    [hcm],
  );

  const deptIdByCode = useMemo(
    () => new Map(hcm.departments.map((d) => [d.code, d.department_id])),
    [hcm],
  );
  const posIdByCode = useMemo(
    () => new Map(hcm.positions.map((p) => [p.position_code, p.position_id])),
    [hcm],
  );
  const deptIdByName = useMemo(
    () => new Map(hcm.departments.map((d) => [d.name, d.department_id])),
    [hcm],
  );
  const sgIdByCode = useMemo(
    () => new Map(hcm.salaryGrades.map((g) => [g.code, g.salary_grade_id])),
    [hcm],
  );

  const [deptTableSearch, setDeptTableSearch] = useState("");
  const [posTableSearch, setPosTableSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");

  const filteredDepts = deptList.filter(
    (d) =>
      !deptTableSearch.trim() ||
      d.name.toLowerCase().includes(deptTableSearch.toLowerCase()) ||
      d.code.toLowerCase().includes(deptTableSearch.toLowerCase()) ||
      d.head.toLowerCase().includes(deptTableSearch.toLowerCase()),
  );

  const filteredPositions = posList.filter(
    (p) =>
      (deptFilter === "all" || p.department === deptFilter) &&
      (!posTableSearch.trim() ||
        p.title.toLowerCase().includes(posTableSearch.toLowerCase()) ||
        p.id.toLowerCase().includes(posTableSearch.toLowerCase()) ||
        p.department.toLowerCase().includes(posTableSearch.toLowerCase())),
  );

  const deptSort = useSort(filteredDepts, {
    code: (d) => d.code,
    name: (d) => d.name,
    head: (d) => d.head,
    positions: (d) => d.openRequisitions,
    staff: (d) => d.staff,
  });
  const posSort = useSort(filteredPositions, {
    id: (p) => p.id,
    title: (p) => p.title,
    department: (p) => p.department,
    level: (p) => p.level,
    headcount: (p) => p.headcount,
    filled: (p) => p.filled,
    vacancies: (p) => p.headcount - p.filled,
    grade: (p) => p.salaryBand,
  });
  const deptPage = usePagination(deptSort.sorted);
  const posPage = usePagination(posSort.sorted);
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

  const [pendingConfirmSave, setPendingConfirmSave] = useState<{ type: "dept" | "pos" } | null>(
    null,
  );
  const [pendingUnsavedExit, setPendingUnsavedExit] = useState<{ target: "dept" | "pos" } | null>(
    null,
  );
  const [pendingDelete, setPendingDelete] = useState<{
    type: "dept" | "pos";
    id: number;
    name: string;
  } | null>(null);

  /* Vacancy requisition dialog (per department) */
  const [reqDialogDept, setReqDialogDept] = useState<string | null>(null);
  const [reqPosition, setReqPosition] = useState("");
  const [reqCount, setReqCount] = useState("1");
  const [reqUrgency, setReqUrgency] = useState("Normal");
  const [reqJustification, setReqJustification] = useState("");
  const [reqCountEdits, setReqCountEdits] = useState<Record<string, string>>({});

  const deptPositions = useMemo(
    () => posList.filter((p) => p.department === reqDialogDept),
    [posList, reqDialogDept],
  );
  const deptReqs = useMemo(
    () => reqs.filter((r) => r.department === reqDialogDept),
    [reqs, reqDialogDept],
  );

  const openReqDialog = (dept: Department) => {
    const firstPos = posList.find((p) => p.department === dept.name);
    setReqDialogDept(dept.name);
    setReqPosition(firstPos?.title ?? "");
    setReqCount(String(firstPos ? Math.max(1, firstPos.headcount - firstPos.filled) : 1));
    setReqUrgency("Normal");
    setReqJustification("");
    const edits: Record<string, string> = {};
    reqs
      .filter((r) => r.department === dept.name)
      .forEach((r) => {
        edits[r.id] = String(r.count);
      });
    setReqCountEdits(edits);
  };

  const onReqPositionChange = (title: string) => {
    setReqPosition(title);
    const p = deptPositions.find((x) => x.title === title);
    setReqCount(String(p ? Math.max(1, p.headcount - p.filled) : 1));
  };

  const submitRequisition = async () => {
    if (!reqDialogDept) return;
    const deptId = deptIdByName.get(reqDialogDept);
    const pos = deptPositions.find((x) => x.title === reqPosition);
    if (!deptId || !pos) {
      toast.error("Select a valid position within the department.");
      return;
    }
    const count = Math.max(1, Number(reqCount) || 1);
    try {
      await requisitionsApi.create({
        position_id: posIdByCode.get(pos.id),
        position_title: pos.title,
        department_id: deptId,
        requested_count: count,
        urgency: reqUrgency,
        justification: reqJustification.trim() || `Vacancy requisition for ${pos.title}`,
        status: "Pending",
        requested_at: new Date().toISOString().slice(0, 10),
      });
      toast.success(`Requisition for ${count} × ${pos.title} submitted.`);
      await requisitionStore.refresh();
    } catch (err) {
      const status = (err as { status?: number }).status;
      toast.error(
        status === 403
          ? "You do not have permission to create requisitions."
          : "Could not submit requisition.",
      );
    }
  };

  const saveReqCount = async (r: Requisition) => {
    const next = Math.max(1, Number(reqCountEdits[r.id]) || 1);
    try {
      if (r.dbId) {
        await requisitionsApi.update(r.dbId, { requested_count: next });
      }
      setReqCountEdits((prev) => ({ ...prev, [r.id]: String(next) }));
      toast.success(`${r.id} updated to ${next} slot${next !== 1 ? "s" : ""}.`);
      await requisitionStore.refresh();
    } catch (err) {
      const status = (err as { status?: number }).status;
      toast.error(
        status === 403
          ? "You do not have permission to edit requisitions."
          : "Could not update requisition.",
      );
    }
  };

  const [origDeptCode, setOrigDeptCode] = useState("");
  const [origDeptName, setOrigDeptName] = useState("");
  const [origDeptHead, setOrigDeptHead] = useState("");
  const [origPosTitle, setOrigPosTitle] = useState("");
  const [origPosDept, setOrigPosDept] = useState("");
  const [origPosLevel, setOrigPosLevel] = useState<Position["level"]>("Rank & File");
  const [origPosTarget, setOrigPosTarget] = useState("");
  const [origPosSGrade, setOrigPosSGrade] = useState("");

  const deptHasChanges =
    deptCode !== origDeptCode || deptName !== origDeptName || deptHead !== origDeptHead;
  const posHasChanges =
    posTitle !== origPosTitle ||
    posDept !== origPosDept ||
    posLevel !== origPosLevel ||
    posTarget !== origPosTarget ||
    posSGrade !== origPosSGrade;

  const getDerivedStaffCount = (deptName: string) => {
    return posList
      .filter((p) => p.department === deptName)
      .reduce((acc, curr) => acc + curr.filled, 0);
  };

  const getDeptSpecificHeads = (targetDeptName: string) => {
    return employees.filter((emp) => emp.status === "Active" && emp.department === targetDeptName);
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
          head_employee_id: headEmp
            ? hcm.employees.find((e) => e.full_name === deptHead)?.employee_id
            : null,
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
      {/* Generate Report aligned with the page title via HeaderActions portal */}
      <HeaderActions>
        <ReportMenu
          size="sm"
          label="Export departments"
          recordCount={filteredDepts.length}
          report={() => ({
            title: "Departments Report",
            subtitle: `${filteredDepts.length} record(s) · exported ${new Date().toISOString().slice(0, 10)}`,
            columns: [
              { header: "Dept Code", key: "code" },
              { header: "Department", key: "name" },
              { header: "Head", key: "head" },
            ],
            rows: filteredDepts.map((r) => ({ ...r })),
          })}
        />
      </HeaderActions>
      <Card className="border-border/70 shadow-sm">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 font-display text-xl font-semibold">
                <Building2 className="h-4 w-4 text-primary" /> Hotel & Restaurant Departments
              </CardTitle>
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
              {role === "superadmin" && (
                <Button
                  size="sm"
                  onClick={() => {
                    setDeptCode(`DEP-0${deptList.length + 1}`);
                    setDeptName("");
                    setDeptHead("");
                    setIsNewDept(true);
                    setEditingDept({
                      code: "",
                      name: "",
                      description: "",
                      head: "Unassigned",
                      staff: 0,
                      openRequisitions: 0,
                      budget: 0,
                    });
                  }}
                >
                  <Plus className="mr-1.5 h-4 w-4" /> Add Department
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <SortHead sortKey="code" sort={deptSort.sort} onSort={deptSort.toggle} className="w-28 pl-6">Dept Code</SortHead>
                <SortHead sortKey="name" sort={deptSort.sort} onSort={deptSort.toggle}>Department Name</SortHead>
                <SortHead sortKey="head" sort={deptSort.sort} onSort={deptSort.toggle}>Department Head</SortHead>
                <SortHead sortKey="positions" sort={deptSort.sort} onSort={deptSort.toggle} align="center">Positions Count</SortHead>
                <SortHead sortKey="staff" sort={deptSort.sort} onSort={deptSort.toggle} align="center">Staff Count (Derived)</SortHead>
                <TableHead className="w-28 text-center pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hcmLoading && deptList.length === 0 && <TableRowsSkeleton cols={6} rows={5} />}
              {(!hcmLoading || deptList.length > 0) &&
                deptPage.pageItems.map((d) => {
                const positionsUnder = posList.filter((p) => p.department === d.name);
                const derivedStaff = getDerivedStaffCount(d.name);

                return (
                  <TableRow key={d.code}>
                    <TableCell className="pl-6 font-mono text-xs font-medium">{d.code}</TableCell>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{d.head}</TableCell>
                    <TableCell className="text-center font-mono text-xs">
                      {positionsUnder.length}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="font-mono text-xs">
                        {derivedStaff} active staff
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center pr-6">
                      <div className="flex justify-center gap-1.5">
                        {role === "superadmin" && (
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
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2 text-xs border-primary/40 text-primary hover:bg-primary/10"
                          onClick={() => openReqDialog(d)}
                        >
                          <Send className="mr-1 h-3 w-3" /> Requisition
                        </Button>
                        {role === "superadmin" && (
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
                        )}
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
      <HeaderActions>
        <ReportMenu
          size="sm"
          label="Export positions"
          recordCount={filteredPositions.length}
          report={() => ({
            title: "Positions Report",
            subtitle: `${filteredPositions.length} record(s) · exported ${new Date().toISOString().slice(0, 10)}`,
            columns: [
              { header: "POS ID", key: "id" },
              { header: "Title", key: "title" },
              { header: "Department", key: "department" },
              { header: "Level", key: "level" },
              { header: "Headcount", key: "headcount" },
              { header: "Filled", key: "filled" },
              { header: "Salary Band", key: "salaryBand" },
            ],
            rows: filteredPositions.map((r) => ({ ...r })),
          })}
        />
      </HeaderActions>
      <Card className="border-border/70 shadow-sm">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 font-display text-xl font-semibold">
                <Briefcase className="h-4 w-4 text-primary" /> Job Positions & Salary Bands
              </CardTitle>
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
                    <SelectItem key={d.code} value={d.name}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {role === "superadmin" && (
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
                    setEditingPos({
                      id: "",
                      title: "",
                      department: "",
                      level: "Rank & File",
                      headcount: 5,
                      filled: 3,
                      salaryBand: "",
                    });
                  }}
                >
                  <Plus className="mr-1.5 h-4 w-4" /> Add Position
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortHead sortKey="id" sort={posSort.sort} onSort={posSort.toggle} className="w-24 pl-6">POS ID</SortHead>
                  <SortHead sortKey="title" sort={posSort.sort} onSort={posSort.toggle}>Job Position Title</SortHead>
                  <SortHead sortKey="department" sort={posSort.sort} onSort={posSort.toggle}>Department</SortHead>
                  <SortHead sortKey="level" sort={posSort.sort} onSort={posSort.toggle}>Level</SortHead>
                  <SortHead sortKey="headcount" sort={posSort.sort} onSort={posSort.toggle} align="center">Target Headcount</SortHead>
                  <SortHead sortKey="filled" sort={posSort.sort} onSort={posSort.toggle} align="center">Filled Staff</SortHead>
                  <SortHead sortKey="vacancies" sort={posSort.sort} onSort={posSort.toggle} align="center">Vacancies</SortHead>
                  <SortHead sortKey="grade" sort={posSort.sort} onSort={posSort.toggle}>Assigned Salary Grade / Band</SortHead>
                  {role === "superadmin" && (
                    <TableHead className="w-28 text-center pr-4">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {hcmLoading && posList.length === 0 && <TableRowsSkeleton cols={8} rows={5} />}
                {(!hcmLoading || posList.length > 0) &&
                  posPage.pageItems.map((p) => (
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
                    <TableCell className="text-center font-mono text-xs font-semibold">
                      {p.filled}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={p.vacancies && p.vacancies > 0 ? "outline" : "secondary"}
                        className={
                          p.vacancies && p.vacancies > 0
                            ? "border-gold/40 bg-gold/10 text-gold font-mono text-xs"
                            : "font-mono text-xs"
                        }
                      >
                        {p.vacancies ?? 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-primary font-medium">
                      {p.salaryBand}
                    </TableCell>
                    {role === "superadmin" && (
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
                    )}
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
            <DialogTitle>
              {isNewDept ? "Add New Department" : `Edit Department — ${editingDept?.name}`}
            </DialogTitle>
            <DialogDescription>
              Configure department information. Associated positions and staff count are updated
              automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Department Code</Label>
                <Input
                  value={deptCode}
                  onChange={(e) => setDeptCode(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Department Name</Label>
                <Input
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            {!isNewDept && editingDept ? (
              <div className="space-y-1">
                <Label className="text-xs">
                  Department Head (Active {editingDept.name} Staff Only)
                </Label>
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
                    No active employees currently assigned to <strong>{editingDept.name}</strong>.
                    Add or assign positions to this department first to designate a department head.
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-md border border-primary/20 bg-primary/5 p-2.5 text-[11px] text-muted-foreground">
                <strong>Department Head Assignment:</strong> A department head can be assigned after
                creation once active employees are assigned to this department.
              </div>
            )}

            <div className="space-y-1.5 rounded-lg border p-3 bg-muted/20">
              <Label className="text-xs font-semibold">
                Associated Job Positions in {deptName || "Department"}:
              </Label>
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
                  No job positions currently assigned. Positions added to this department will
                  display here automatically.
                </p>
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/40">
              <div>
                <span className="font-semibold text-xs text-foreground">
                  Total Staff Count (Derived):
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Calculated automatically from filled staff across all positions.
                </p>
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
            <Button onClick={() => setPendingConfirmSave({ type: "dept" })}>Save Department</Button>
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
            <DialogTitle>
              {isNewPos ? "Add New Job Position" : `Edit Position — ${editingPos?.title}`}
            </DialogTitle>
            <DialogDescription>
              Assign job level, target headcount, department and dynamic Salary Grade.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-1">
              <Label className="text-xs">Job Position Title</Label>
              <Input
                value={posTitle}
                onChange={(e) => setPosTitle(e.target.value)}
                className="text-xs"
                placeholder="e.g. Pastry Chef"
              />
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
                      <SelectItem key={d.code} value={d.name}>
                        {d.name}
                      </SelectItem>
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
                <Input
                  type="number"
                  value={posTarget}
                  onChange={(e) => setPosTarget(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Filled Staff</Label>
                <Input type="number" value={posFilled} disabled className="text-xs bg-muted" />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-primary">
                Assign Salary Grade (From Salary Grade Management)
              </Label>
              <Select value={posSGrade} onValueChange={setPosSGrade}>
                <SelectTrigger className="text-xs border-primary/40 bg-primary/5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sGrades.map((sg) => (
                    <SelectItem key={sg.id} value={sg.code}>
                      {sg.code} — {sg.title} ({formatMoney(sg.minSalary)} –{" "}
                      {formatMoney(sg.maxSalary)})
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
            <Button onClick={() => setPendingConfirmSave({ type: "pos" })}>Save Position</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CONFIRMATION ALERT DIALOG (SAVE DEPT / SAVE POS) */}
      <AlertDialog
        open={!!pendingConfirmSave}
        onOpenChange={(open) => !open && setPendingConfirmSave(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Changes</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingConfirmSave?.type === "dept" &&
                `Are you sure you want to save changes to department "${deptName}"?`}
              {pendingConfirmSave?.type === "pos" &&
                `Are you sure you want to save changes to position "${posTitle}"?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingConfirmSave(null)}>
              Cancel
            </AlertDialogCancel>
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
              Are you sure you want to delete{" "}
              {pendingDelete?.type === "dept" ? "department" : "position"} "{pendingDelete?.name}"?
              This action cannot be undone.
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
      <AlertDialog
        open={!!pendingUnsavedExit}
        onOpenChange={(open) => !open && setPendingUnsavedExit(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-amber-600">Discard Unsaved Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have modified fields in this modal. Are you sure you want to exit without saving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingUnsavedExit(null)}>
              Keep Editing
            </AlertDialogCancel>
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

      {/* VACANCY REQUISITION DIALOG (per department) */}
      <Dialog open={!!reqDialogDept} onOpenChange={(open) => !open && setReqDialogDept(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" /> Vacancy Requisition — {reqDialogDept}
            </DialogTitle>
            <DialogDescription>
              Send a new requisition for this department or adjust the requested slots of existing
              requisitions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">New Requisition</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Position</Label>
                  <Select value={reqPosition} onValueChange={onReqPositionChange}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      {deptPositions.map((p) => (
                        <SelectItem key={p.id} value={p.title}>
                          {p.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Number of Vacancies</Label>
                  <Input
                    type="number"
                    min={1}
                    value={reqCount}
                    onChange={(e) => setReqCount(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Urgency</Label>
                  <Select value={reqUrgency} onValueChange={setReqUrgency}>
                    <SelectTrigger className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Normal", "High", "Urgent", "Low"].map((u) => (
                        <SelectItem key={u} value={u}>
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Justification</Label>
                  <Input
                    value={reqJustification}
                    onChange={(e) => setReqJustification(e.target.value)}
                    placeholder="Reason for hiring…"
                    className="text-xs"
                  />
                </div>
              </div>
              <Button size="sm" onClick={submitRequisition} className="mt-2">
                <Send className="mr-2 h-3.5 w-3.5" /> Send Requisition
              </Button>
            </div>

            {deptReqs.length > 0 && (
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Existing Requisitions — edit slots</Label>
                <div className="space-y-2">
                  {deptReqs.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between gap-2 rounded-md border border-border p-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium">
                          {r.id} · {r.position}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {r.status} · {r.urgency}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Input
                          type="number"
                          min={1}
                          className="h-8 w-16 text-center text-xs"
                          value={reqCountEdits[r.id] ?? String(r.count)}
                          onChange={(e) =>
                            setReqCountEdits((prev) => ({ ...prev, [r.id]: e.target.value }))
                          }
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs"
                          onClick={() => saveReqCount(r)}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* --- Salary Grade Manager --- */
function SalaryGradeManager() {
  const hcm = useHcmData();
  const hcmLoading = useHcmLoading();
  const grades = useMemo<SalaryGrade[]>(() => hcm.salaryGrades.map(toUiSalaryGrade), [hcm]);
  const [sgSearch, setSgSearch] = useState("");
  const [sgLevelFilter, setSgLevelFilter] = useState("all");
  const [pendingDelete, setPendingDelete] = useState<{ type: "sg"; id: number; name: string } | null>(null);

  const [sgDialogOpen, setSgDialogOpen] = useState(false);
  const [editingSg, setEditingSg] = useState<SalaryGrade | null>(null);
  const [sgCode, setSgCode] = useState("");
  const [sgTitle, setSgTitle] = useState("");
  const [sgMin, setSgMin] = useState("");
  const [sgMax, setSgMax] = useState("");
  const [sgLevel, setSgLevel] = useState("Rank & File");
  const [sgCurrency, setSgCurrency] = useState("PHP");
  const [sgNotes, setSgNotes] = useState("");
  const [sgSaving, setSgSaving] = useState(false);

  const openAddSg = () => {
    setEditingSg(null);
    setSgCode("");
    setSgTitle("");
    setSgMin("");
    setSgMax("");
    setSgLevel("Rank & File");
    setSgCurrency("PHP");
    setSgNotes("");
    setSgDialogOpen(true);
  };

  const openEditSg = (g: SalaryGrade) => {
    setEditingSg(g);
    setSgCode(g.code);
    setSgTitle(g.title);
    setSgMin(String(g.minSalary));
    setSgMax(String(g.maxSalary));
    setSgLevel(g.level);
    setSgCurrency(g.currency || "PHP");
    setSgNotes(g.notes || "");
    setSgDialogOpen(true);
  };

  const saveSg = async () => {
    if (!sgCode.trim() || !sgTitle.trim()) {
      toast.error("Grade code and title are required.");
      return;
    }
    const min = Number(sgMin);
    const max = Number(sgMax);
    if (!Number.isFinite(min) || !Number.isFinite(max) || min < 0 || max <= min) {
      toast.error("Enter valid min and max salary (max must be greater than min).");
      return;
    }
    const payload = {
      code: sgCode.trim(),
      title: sgTitle.trim(),
      min_salary: min,
      max_salary: max,
      currency_code: sgCurrency.trim() || "PHP",
      level: sgLevel,
      notes: sgNotes.trim() || null,
    };
    setSgSaving(true);
    try {
      if (editingSg) {
        const dbId = hcm.salaryGrades.find((g) => g.code === editingSg.code)?.salary_grade_id;
        if (!dbId) {
          toast.error("Could not resolve the salary grade in Core HCM.");
          return;
        }
        await hcmApi.salaryGrades.update(dbId, payload);
        toast.success(`Salary grade ${payload.code} updated.`);
      } else {
        await hcmApi.salaryGrades.create(payload);
        toast.success(`Salary grade ${payload.code} created.`);
      }
      await refreshHcm();
      setSgDialogOpen(false);
    } catch (err) {
      const status = (err as { status?: number }).status;
      const msg = (err as { errors?: Record<string, string[]> }).errors;
      toast.error(msg ? Object.values(msg).flat()[0] : status === 422 ? "Validation failed." : "Could not save salary grade.");
      return;
    } finally {
      setSgSaving(false);
    }
  };

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

  const sgSort = useSort(filteredGrades, {
    code: (g) => g.code,
    title: (g) => g.title,
    level: (g) => g.level,
    minSalary: (g) => g.minSalary,
    maxSalary: (g) => g.maxSalary,
  });
  const sgPage = usePagination(sgSort.sorted);

  return (
    <>
    <HeaderActions>
      <ReportMenu
        size="sm"
        recordCount={filteredGrades.length}
        report={() => ({
          title: "Salary Grades Report",
          subtitle: `${filteredGrades.length} record(s) · exported ${new Date().toISOString().slice(0, 10)}`,
          columns: [
            { header: "Grade Code", key: "code" },
            { header: "Band Title", key: "title" },
            { header: "Job Level", key: "level" },
            { header: "Min Salary", key: "minSalary" },
            { header: "Max Salary", key: "maxSalary" },
            { header: "Currency", key: "currency" },
          ],
          rows: filteredGrades.map((r) => ({ ...r })),
        })}
      />
    </HeaderActions>
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 font-display text-xl font-semibold">
              <DollarSign className="h-4 w-4 text-primary" /> Salary Grade & Compensation Management
            </CardTitle>
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
            <Button size="sm" className="h-9 gap-1.5 text-xs" onClick={openAddSg}>
              <Plus className="h-4 w-4" /> Add Grade
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <SortHead sortKey="code" sort={sgSort.sort} onSort={sgSort.toggle} className="w-28 pl-6">Grade Code</SortHead>
              <SortHead sortKey="title" sort={sgSort.sort} onSort={sgSort.toggle}>Band Title</SortHead>
              <SortHead sortKey="level" sort={sgSort.sort} onSort={sgSort.toggle}>Job Level</SortHead>
              <SortHead sortKey="minSalary" sort={sgSort.sort} onSort={sgSort.toggle} align="right">Min Salary</SortHead>
              <SortHead sortKey="maxSalary" sort={sgSort.sort} onSort={sgSort.toggle} align="right">Max Salary</SortHead>
              <TableHead>Pay Band Range</TableHead>
              <TableHead className="text-right pr-6">Currency</TableHead>
              <TableHead className="text-center pr-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hcmLoading && grades.length === 0 && <TableRowsSkeleton cols={8} rows={5} />}
            {(!hcmLoading || grades.length > 0) &&
              sgPage.pageItems.map((sg) => (
              <TableRow key={sg.id}>
                <TableCell className="pl-6 font-mono text-xs font-semibold text-primary">
                  {sg.code}
                </TableCell>
                <TableCell className="font-medium text-xs">{sg.title}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[11px]">
                    {sg.level}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono text-xs">
                  {formatMoney(sg.minSalary)}
                </TableCell>
                <TableCell className="text-right font-mono text-xs">
                  {formatMoney(sg.maxSalary)}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatMoney(sg.minSalary)} – {formatMoney(sg.maxSalary)}
                </TableCell>
                <TableCell className="text-right pr-6 font-mono text-xs">{sg.currency}</TableCell>
                <TableCell className="text-center pr-4">
                  <div className="flex items-center justify-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-2 text-xs"
                      onClick={() => openEditSg(sg)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
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
                  </div>
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

      {/* ADD / EDIT SALARY GRADE DIALOG */}
      <Dialog open={sgDialogOpen} onOpenChange={setSgDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSg ? `Edit Salary Grade — ${editingSg.code}` : "Add Salary Grade"}</DialogTitle>
            <DialogDescription>
              Define the compensation band (minimum and maximum salary) for this grade.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Grade Code</Label>
                <Input value={sgCode} onChange={(e) => setSgCode(e.target.value)} className="text-xs font-mono" placeholder="e.g. SG-09" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Job Level</Label>
                <Select value={sgLevel} onValueChange={setSgLevel}>
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
            <div className="space-y-1">
              <Label className="text-xs">Band Title</Label>
              <Input value={sgTitle} onChange={(e) => setSgTitle(e.target.value)} className="text-xs" placeholder="e.g. Senior Staff" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Min Salary</Label>
                <Input type="number" value={sgMin} onChange={(e) => setSgMin(e.target.value)} className="text-xs font-mono" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Max Salary</Label>
                <Input type="number" value={sgMax} onChange={(e) => setSgMax(e.target.value)} className="text-xs font-mono" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Currency</Label>
                <Input value={sgCurrency} onChange={(e) => setSgCurrency(e.target.value)} className="text-xs font-mono" maxLength={3} />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Notes</Label>
              <Input value={sgNotes} onChange={(e) => setSgNotes(e.target.value)} className="text-xs" placeholder="Optional notes" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSgDialogOpen(false)} disabled={sgSaving}>Cancel</Button>
            <Button onClick={saveSg} disabled={sgSaving}>
              {sgSaving ? "Saving…" : editingSg ? "Save Changes" : "Add Salary Grade"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete salary grade "{pendingDelete?.name}"? This action
              cannot be undone.
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
    </>
  );
}

/* --- Requisition Manager --- */
function RequisitionManager({ role = "admin" }: { role?: Role }) {
  const reqs = useRequisitions();
  const reqLoading = useRequisitionsLoading();
  const [reqSearch, setReqSearch] = useState("");
  const [reqDeptFilter, setReqDeptFilter] = useState("all");
  const [reqStatusFilter, setReqStatusFilter] = useState("all");
  const [reqUrgencyFilter, setReqUrgencyFilter] = useState("all");
  const [editing, setEditing] = useState<Requisition | null>(null);
  const [editCount, setEditCount] = useState("1");
  const [editUrgency, setEditUrgency] = useState("Normal");
  const [editJustification, setEditJustification] = useState("");
  const [editStatus, setEditStatus] = useState<Requisition["status"]>("Pending");
  const [confirmEdit, setConfirmEdit] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [historyFor, setHistoryFor] = useState<Requisition | null>(null);
  const [historyLogs, setHistoryLogs] = useState<ApiAuditLog[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [deleteFor, setDeleteFor] = useState<Requisition | null>(null);
  const [deleting, setDeleting] = useState(false);

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
    const matchesUrgency =
      reqUrgencyFilter === "all" || r.urgency.toLowerCase() === reqUrgencyFilter.toLowerCase();
    return matchesSearch && matchesDept && matchesStatus && matchesUrgency;
  });

  const reqSort = useSort(filteredReqs, {
    id: (r) => r.id,
    position: (r) => r.position,
    department: (r) => r.department,
    count: (r) => r.count,
    urgency: (r) => r.urgency,
    status: (r) => r.status,
    requestedAt: (r) => r.requestedAt,
  });
  const reqPage = usePagination(reqSort.sorted);

  return (
    <>
    <HeaderActions>
      <ReportMenu
        size="sm"
        recordCount={filteredReqs.length}
        report={() => ({
          title: "Vacancy Requisitions Report",
          subtitle: `${filteredReqs.length} requisition(s) · exported ${new Date().toISOString().slice(0, 10)}`,
          columns: [
            { header: "Req Code", key: "id" },
            { header: "Position", key: "position" },
            { header: "Department", key: "department" },
            { header: "Slots", key: "count" },
            { header: "Urgency", key: "urgency" },
            { header: "Status", key: "status" },
            { header: "Requested", key: "requestedAt" },
          ],
          rows: filteredReqs.map((r) => ({ ...r })),
          summary: [
            { label: "Total", value: filteredReqs.length },
            {
              label: "Pending",
              value: filteredReqs.filter((r) => r.status === "Pending").length,
            },
            {
              label: "Converted",
              value: filteredReqs.filter((r) => r.status === "Converted").length,
            },
          ],
        })}
      />
    </HeaderActions>
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 font-display text-xl font-semibold">
              <Send className="h-4 w-4 text-primary" /> Vacancy Requisitions
            </CardTitle>
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
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
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
                <SelectItem value="Done">Done</SelectItem>
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
              <SortHead sortKey="id" sort={reqSort.sort} onSort={reqSort.toggle} className="pl-6">Req Code</SortHead>
              <SortHead sortKey="position" sort={reqSort.sort} onSort={reqSort.toggle}>Position Title</SortHead>
              <SortHead sortKey="department" sort={reqSort.sort} onSort={reqSort.toggle}>Department</SortHead>
              <SortHead sortKey="count" sort={reqSort.sort} onSort={reqSort.toggle} align="center">Slots Requested</SortHead>
              <SortHead sortKey="urgency" sort={reqSort.sort} onSort={reqSort.toggle}>Urgency</SortHead>
              <SortHead sortKey="status" sort={reqSort.sort} onSort={reqSort.toggle}>Status</SortHead>
              <SortHead sortKey="requestedAt" sort={reqSort.sort} onSort={reqSort.toggle}>Date Requested</SortHead>
              <TableHead className="text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reqLoading && reqs.length === 0 && <TableRowsSkeleton cols={8} rows={5} />}
            {(!reqLoading || reqs.length > 0) &&
              reqPage.pageItems.map((r) => (
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
                <TableCell className="text-xs text-muted-foreground">
                  {r.requestedAt}
                </TableCell>
                <TableCell className="text-right pr-6">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      title="Edit requisition (with confirmation)"
                      disabled={r.status === "Converted"}
                      onClick={() => {
                        setEditing(r);
                        setEditCount(String(r.count));
                        setEditUrgency(r.urgency);
                        setEditJustification(r.justification);
                        setEditStatus(r.status === "Converted" ? "Converted" : r.status);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      title="Action history (created / updated / deleted)"
                      onClick={async () => {
                        setHistoryFor(r);
                        setHistoryLoading(true);
                        try {
                          const res = await auditLogApi.list({ per_page: 100, search: r.id });
                          const logs = (res?.data ?? []).filter(
                            (l) =>
                              l.target_id === String(r.dbId ?? "") ||
                              (l.details ?? "").includes(r.id),
                          );
                          setHistoryLogs(logs);
                        } catch {
                          setHistoryLogs([]);
                        } finally {
                          setHistoryLoading(false);
                        }
                      }}
                    >
                      <History className="h-3.5 w-3.5" />
                    </Button>
                    {role === "superadmin" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        title="Delete requisition (superadmin)"
                        disabled={r.status === "Converted"}
                        onClick={() => setDeleteFor(r)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {(!reqLoading || reqs.length > 0) &&
              filteredReqs.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-xs text-muted-foreground">
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

    {/* Edit requisition dialog — saving always asks for confirmation */}
    <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit requisition {editing?.id}</DialogTitle>
          <DialogDescription>
            {editing?.position} · {editing?.department}. Changes apply immediately after you
            confirm.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="space-y-1.5">
            <Label>Slots requested</Label>
            <Input
              type="number"
              min={1}
              value={editCount}
              onChange={(e) => setEditCount(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Urgency</Label>
            <Select value={editUrgency} onValueChange={setEditUrgency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Low", "Normal", "High", "Urgent"].map((u) => (
                  <SelectItem key={u} value={u}>
                    {u}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={editStatus} onValueChange={(v: any) => setEditStatus(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Done">Done</SelectItem>
                <SelectItem value="Converted">Converted</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Justification</Label>
            <Textarea
              rows={3}
              value={editJustification}
              onChange={(e) => setEditJustification(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setEditing(null)}>
            Cancel
          </Button>
          <Button
            onClick={() => setConfirmEdit(true)}
            disabled={savingEdit || Number(editCount) < 1}
          >
            Review changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <AlertDialog open={confirmEdit} onOpenChange={setConfirmEdit}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm requisition update?</AlertDialogTitle>
          <AlertDialogDescription>
            {editing?.id}: slots {editing?.count} → {editCount}, urgency {editing?.urgency} →{" "}
            {editUrgency}, status {editing?.status} → {editStatus}. This is recorded in the
            action history.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Back</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              if (!editing) return;
              setSavingEdit(true);
              try {
                await requisitionStore.update(editing.id, {
                  count: Math.max(1, Number(editCount) || 1),
                  urgency: editUrgency,
                  justification: editJustification,
                  status: editStatus,
                });
                toast.success(`Requisition ${editing.id} updated.`);
                setEditing(null);
                setConfirmEdit(false);
              } catch {
                // requisitionStore already toasted
              } finally {
                setSavingEdit(false);
              }
            }}
          >
            Confirm update
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {/* Action history dialog */}
    <Dialog open={!!historyFor} onOpenChange={(o) => !o && setHistoryFor(null)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>History — {historyFor?.id}</DialogTitle>
          <DialogDescription>
            Created / updated / converted / deleted actions for this requisition.
          </DialogDescription>
        </DialogHeader>
        {historyLoading ? (
          <ListSkeleton items={4} />
        ) : historyLogs.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">
            No audit entries found for {historyFor?.id} yet. New creates, updates and deletes
            are logged automatically.
          </p>
        ) : (
          <div className="max-h-80 space-y-2 overflow-y-auto py-1">
            {historyLogs.map((l) => (
              <div key={l.audit_log_id} className="rounded-md border border-border/60 p-3 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{l.action}</span>
                  <span className="text-muted-foreground">
                    {new Date(l.occurred_at ?? l.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 text-muted-foreground">{l.details}</p>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>

    {/* Superadmin delete with confirmation */}
    <AlertDialog open={!!deleteFor} onOpenChange={(o) => !o && setDeleteFor(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete requisition {deleteFor?.id}?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes the request for {deleteFor?.position} (
            {deleteFor?.department}). Converted requisitions are kept as history and cannot be
            deleted. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={async () => {
              if (!deleteFor) return;
              setDeleting(true);
              try {
                await requisitionStore.remove(deleteFor.id);
                setDeleteFor(null);
              } catch {
                // store already toasted
              } finally {
                setDeleting(false);
              }
            }}
          >
            {deleting ? "Deleting…" : "Delete requisition"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

/* Backward-compatible default CoreHCM wrapper */
export function CoreHCM({ role = "admin" }: { role?: Role }) {
  return <OrgChartModule role={role} />;
}
