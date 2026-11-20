import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import {
  Activity,
  ArrowUpRight,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { AnnouncementsCard } from "@/components/portal/AnnouncementsCard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ListSkeleton, Skeleton } from "@/components/ui/loading-skeletons";
import { dashboardApi } from "@/lib/api";
import type { ApiDashboardStats } from "@/lib/api";
import { usePreferences } from "@/lib/preferences";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/superadmin/")({
  head: () => ({
    meta: [
      { title: "System Dashboard — Oxford Suites Makati HRMS" },
      {
        name: "description",
        content:
          "Super Admin oversight: interactive analytics, access governance, staffing and audit activity.",
      },
      { property: "og:title", content: "System Dashboard — Oxford Suites Makati HRMS" },
      {
        property: "og:description",
        content: "Super Admin oversight across the whole Oxford Suites Makati HRMS.",
      },
    ],
  }),
  component: SuperAdminDashboard,
});

const PANEL = "rounded-xl border border-border/60 bg-card shadow-[0_1px_2px_rgba(16,24,40,0.04)]";
const PANEL_HEAD = "flex items-center justify-between gap-3";
const PANEL_TITLE = "flex items-center gap-2 font-display text-base font-bold";

const initials = (name: string | null | undefined) =>
  (name ?? "")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

const accountStatusClass = (status: string) => {
  switch (status) {
    case "Active":
      return "border-success/40 bg-success/10 text-success";
    case "Suspended":
      return "border-warning/40 bg-warning/20 text-warning-foreground";
    case "Disabled":
      return "border-destructive/40 bg-destructive/10 text-destructive";
    default:
      return "border-border text-muted-foreground";
  }
};

const moduleToneClass: Record<string, string> = {
  success: "border-success/40 bg-success/10 text-success",
  primary: "border-primary/40 bg-primary/10 text-primary",
  warning: "border-warning/40 bg-warning/20 text-warning-foreground",
  destructive: "border-destructive/40 bg-destructive/10 text-destructive",
  muted: "border-border text-muted-foreground",
};

const pill = "rounded-full text-[0.68rem] font-semibold";

const headcountChartConfig = {
  headcount: {
    label: "Headcount",
    color: "#881337",
  },
  hires: {
    label: "New Hires",
    color: "#d97706",
  },
  exits: {
    label: "Exits",
    color: "#dc2626",
  },
} satisfies ChartConfig;

const applicantChartConfig = {
  applications: {
    label: "Applications",
    color: "#881337",
  },
  screened: {
    label: "Screened",
    color: "#d97706",
  },
} satisfies ChartConfig;

const ROLE_TIERS: Record<
  string,
  {
    tier: string;
    level: string;
    description: string;
    permissions: string[];
    badgeClass: string;
  }
> = {
  Superadmin: {
    tier: "Root Authority",
    level: "Tier 1",
    description: "Complete system governance, security policies, database operations, and unrestricted audit oversight.",
    permissions: ["Root Governance", "Database & Migrations", "Audit Oversight"],
    badgeClass: "border-primary/40 bg-primary/10 text-primary",
  },
  Admin: {
    tier: "HR Operations",
    level: "Tier 2",
    description: "Operational management of employee records, recruitment pipelines, and department staffing.",
    permissions: ["Core HR Records", "Hiring & Pipeline", "Department Staffing"],
    badgeClass: "border-gold/40 bg-gold/10 text-gold-foreground",
  },
  Employee: {
    tier: "ESS Self-Service",
    level: "Tier 3",
    description: "Self-service portal access for personal profiles, leave requests, and attendance check-ins.",
    permissions: ["Self-Service Portal", "Leave Filing", "Attendance Log"],
    badgeClass: "border-border bg-muted/40 text-foreground",
  },
};

const getRoleMeta = (roleName: string) => {
  return (
    ROLE_TIERS[roleName] ?? {
      tier: "Role Group",
      level: "Standard",
      description: `Configured portal permissions and functional access for ${roleName}.`,
      permissions: ["Portal Access", "Workflow Actions"],
      badgeClass: "border-border bg-muted/40 text-foreground",
    }
  );
};

function SuperAdminDashboard() {
  const [stats, setStats] = useState<ApiDashboardStats | null>(null);
  const [analyticsView, setAnalyticsView] = useState<"headcount" | "recruitment" | "departments">("headcount");
  const [timeframe, setTimeframe] = useState<"6m" | "ytd">("6m");
  const [deptSort, setDeptSort] = useState<"staff" | "open" | "name">("staff");
  const [govTab, setGovTab] = useState<"posture" | "roles" | "activity">("posture");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const navigate = useNavigate();

  const { formatDateTime: fmtDateTime } = usePreferences();
  const formatDateTime = (iso: string | null) => (iso ? fmtDateTime(iso) : "Never");

  useEffect(() => {
    let cancelled = false;
    dashboardApi
      .stats()
      .then((res) => {
        if (!cancelled) setStats(res.data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const openJobs = stats?.job_posts.open ?? 0;
  const totalApplicants = stats?.job_posts.total_applicants ?? 0;
  const scheduledInterviews = stats?.interviews.scheduled ?? 0;

  const deptData = useMemo(() => {
    return [...(stats?.departments ?? [])]
      .map((d) => ({ ...d, total: d.staff + d.open }))
      .sort((a, b) => {
        if (deptSort === "open") return b.open - a.open || b.staff - a.staff;
        if (deptSort === "name") return a.name.localeCompare(b.name);
        return b.staff - a.staff || b.open - a.open;
      });
  }, [stats?.departments, deptSort]);

  const chartDepts = deptData.filter((d) => d.total > 0);
  const roleData = Object.entries(stats?.system_users.by_role ?? {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  const roleMax = Math.max(1, ...roleData.map((r) => r.value));
  const activeRoleName = selectedRole || (roleData[0]?.name ?? "Superadmin");
  const activeRoleMeta = getRoleMeta(activeRoleName);
  const activeRoleCount = stats?.system_users.by_role[activeRoleName] ?? 0;
  const activeRolePct = stats?.system_users.total
    ? Math.round((activeRoleCount / stats.system_users.total) * 100)
    : 0;
  const statusData = Object.entries(stats?.system_users.by_status ?? {}).map(([name, value]) => ({
    name,
    value,
  }));
  const recentUsers = stats?.system_users.recent ?? [];
  const recentAudit = stats?.audit.recent ?? [];
  const suspendedAccounts = stats?.system_users.by_status["Suspended"] ?? 0;
  const disabledAccounts = stats?.system_users.by_status["Disabled"] ?? 0;
  const accessFlags = suspendedAccounts + disabledAccounts;
  const criticalAudit = recentAudit.filter((a) => a.severity === "Critical").length;
  const flagged = (accessFlags > 0 ? 1 : 0) + (criticalAudit > 0 ? 1 : 0);
  const openRoles = deptData.reduce((sum, item) => sum + item.open, 0);

  // Time-series data for Headcount Dynamics
  const headcountSeries = useMemo(() => {
    const raw = timeframe === "6m" ? stats?.employees.trend_6m : stats?.employees.trend_ytd;
    return raw ?? [];
  }, [timeframe, stats?.employees]);

  const periodHires = useMemo(
    () => headcountSeries.reduce((acc, curr) => acc + (curr.hires || 0), 0),
    [headcountSeries]
  );
  const periodExits = useMemo(
    () => headcountSeries.reduce((acc, curr) => acc + (curr.exits || 0), 0),
    [headcountSeries]
  );
  const periodNet = periodHires - periodExits;

  // Applicant 7-day flow series
  const applicantSeries = useMemo(() => stats?.applicants.trend ?? [], [stats?.applicants]);
  const recentAppsCount = useMemo(
    () => applicantSeries.reduce((acc, curr) => acc + (curr.applications || 0), 0),
    [applicantSeries]
  );
  const recentScreenedCount = useMemo(
    () => applicantSeries.reduce((acc, curr) => acc + (curr.screened || 0), 0),
    [applicantSeries]
  );

  const modules = [
    {
      name: "Core HR",
      icon: Building2,
      to: "/superadmin/employees" as const,
      value: stats?.employees.total ?? 0,
      note: `${stats?.employees.active ?? 0} active employees`,
      status: "Healthy",
      tone: "success",
    },
    {
      name: "Recruitment",
      icon: Briefcase,
      to: "/superadmin/recruitment" as const,
      value: openJobs,
      note: `${totalApplicants} applicants · ${scheduledInterviews} scheduled`,
      status: openJobs > 0 ? "Active hiring" : "No open posts",
      tone: openJobs > 0 ? "primary" : "muted",
    },
    {
      name: "Portal Accounts",
      icon: KeyRound,
      to: "/superadmin/users" as const,
      value: stats?.system_users.total ?? 0,
      note: `${accessFlags} flagged accounts`,
      status: accessFlags > 0 ? `${accessFlags} review` : "Healthy",
      tone: accessFlags > 0 ? "warning" : "success",
    },
    {
      name: "Audit Trail",
      icon: Activity,
      to: "/superadmin/audit" as const,
      value: stats?.audit.total ?? 0,
      note: `${criticalAudit} critical events`,
      status: criticalAudit > 0 ? `${criticalAudit} critical` : "Healthy",
      tone: criticalAudit > 0 ? "destructive" : "success",
    },
  ];

  const metrics = [
    {
      label: "Total Employees",
      value: stats?.employees.total ?? 0,
      icon: Building2,
      to: "/superadmin/employees" as const,
    },
    {
      label: "System Users",
      value: stats?.system_users.total ?? 0,
      icon: ShieldCheck,
      to: "/superadmin/users" as const,
    },
    {
      label: "Open Vacancies",
      value: openJobs,
      icon: Briefcase,
      to: "/superadmin/recruitment" as const,
    },
    {
      label: "Total Applicants",
      value: totalApplicants,
      icon: Users,
      to: "/superadmin/applicants" as const,
    },
  ];

  const loading = stats === null;

  return (
    <div className="space-y-4">
      {/* 1. Page Header — Solid SVG with punched out tiles */}
      <div className="-mx-1 mb-2 space-y-3 px-1 pb-1 pt-1">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center text-primary">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-11 w-11 fill-current">
                <rect x="3" y="3" width="8" height="8" rx="1" />
                <rect x="13" y="3" width="8" height="8" rx="1" />
                <rect x="3" y="13" width="8" height="8" rx="1" />
                <rect x="13" y="13" width="8" height="8" rx="1" />
              </svg>
            </span>
            <div>
              <h1 className="font-display text-[1.8rem] font-bold leading-tight tracking-tight sm:text-[2rem]">
                System Dashboard
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Super Admin system overview across staffing, security, and audit activity.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Interactive KPI Metrics Grid */}
        {loading ? (
          <div
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
            aria-busy="true"
            aria-label="Loading metrics"
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={`skeleton-metric-${i}`}
                className="flex items-center gap-4 rounded-xl border border-border/60 bg-card px-4 py-3.5"
              >
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((m) => (
              <button
                key={m.label}
                type="button"
                onClick={() => navigate({ to: m.to })}
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
            ))}
          </div>
        )}
      </div>

      {/* 3. Main Dashboard Workspace */}
      <div className="grid gap-4 xl:grid-cols-12 xl:items-stretch">
        {/* Left Primary Section (xl:col-span-8): Interactive Analytics Command Hub */}
        <div className="flex flex-col gap-4 xl:col-span-8 xl:grid xl:grid-rows-[auto_1fr]">
          <Card className={PANEL}>
            <CardContent className="p-4 sm:p-5">
              {/* Analytics Header Toolbar with View Switcher */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-3">
                <h2 className={PANEL_TITLE}>
                  <TrendingUp className="h-4.5 w-4.5 text-primary" /> Workforce Analytics
                </h2>

                <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
                  {/* View Tabs */}
                  <div className="inline-flex rounded-lg border border-border/60 bg-muted/30 p-0.5">
                    <button
                      type="button"
                      onClick={() => setAnalyticsView("headcount")}
                      className={cn(
                        "rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                        analyticsView === "headcount"
                          ? "bg-card text-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Headcount
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnalyticsView("recruitment")}
                      className={cn(
                        "rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                        analyticsView === "recruitment"
                          ? "bg-card text-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Recruitment Flow
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnalyticsView("departments")}
                      className={cn(
                        "rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                        analyticsView === "departments"
                          ? "bg-card text-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Departments
                    </button>
                  </div>

                  {/* Contextual Timeframe Pill (when in headcount view) */}
                  {analyticsView === "headcount" && (
                    <div className="inline-flex rounded-lg border border-border/60 bg-muted/20 p-0.5">
                      <button
                        type="button"
                        onClick={() => setTimeframe("6m")}
                        className={cn(
                          "rounded px-2 py-0.5 text-[11px] font-medium transition-all",
                          timeframe === "6m"
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        6M
                      </button>
                      <button
                        type="button"
                        onClick={() => setTimeframe("ytd")}
                        className={cn(
                          "rounded px-2 py-0.5 text-[11px] font-medium transition-all",
                          timeframe === "ytd"
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        YTD
                      </button>
                    </div>
                  )}

                  {/* Department Sort Toggle (when in department view) */}
                  {analyticsView === "departments" && (
                    <div className="inline-flex rounded-lg border border-border/60 bg-muted/20 p-0.5">
                      <button
                        type="button"
                        onClick={() => setDeptSort("staff")}
                        className={cn(
                          "rounded px-2 py-0.5 text-[11px] font-medium transition-all",
                          deptSort === "staff"
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        Staff
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeptSort("open")}
                        className={cn(
                          "rounded px-2 py-0.5 text-[11px] font-medium transition-all",
                          deptSort === "open"
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        Openings
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* View 1: Headcount Dynamics */}
              {analyticsView === "headcount" && (
                <div className="mt-3 space-y-4">
                  {/* Micro KPI callouts */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="rounded-lg border border-primary/20 bg-primary/[0.04] p-2.5">
                      <span className="block text-[11px] font-medium text-muted-foreground">Active Staff</span>
                      <span className="font-display text-lg font-bold tabular-nums text-primary">
                        {stats?.employees.active ?? 0}
                      </span>
                    </div>
                    <div className="rounded-lg border border-primary/20 bg-primary/[0.04] p-2.5">
                      <span className="block text-[11px] font-medium text-muted-foreground">Period Hires</span>
                      <span className="font-display text-lg font-bold tabular-nums text-primary">
                        +{periodHires}
                      </span>
                    </div>
                    <div className="rounded-lg border border-primary/20 bg-primary/[0.04] p-2.5">
                      <span className="block text-[11px] font-medium text-muted-foreground">Net Growth</span>
                      <span className={cn(
                        "font-display text-lg font-bold tabular-nums",
                        periodNet >= 0 ? "text-primary" : "text-destructive"
                      )}>
                        {periodNet >= 0 ? `+${periodNet}` : periodNet}
                      </span>
                    </div>
                  </div>

                  {/* Interactive Chart */}
                  {loading ? (
                    <Skeleton className="h-[240px] w-full rounded-lg" />
                  ) : headcountSeries.length === 0 ? (
                    <div className="flex h-[240px] items-center justify-center text-xs text-muted-foreground">
                      No headcount trends recorded for this period.
                    </div>
                  ) : (
                    <ChartContainer config={headcountChartConfig} className="h-[240px] w-full">
                      <AreaChart data={headcountSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="fillHeadcount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-headcount)" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="var(--color-headcount)" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
                        <XAxis
                          dataKey="month"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          className="text-[11px]"
                        />
                        <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-[11px]" width={35} />
                        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                        <Area
                          type="monotone"
                          dataKey="headcount"
                          stroke="var(--color-headcount)"
                          strokeWidth={2}
                          fill="url(#fillHeadcount)"
                        />
                      </AreaChart>
                    </ChartContainer>
                  )}
                </div>
              )}

              {/* View 2: Recruitment Flow */}
              {analyticsView === "recruitment" && (
                <div className="mt-3 space-y-4">
                  {/* Micro KPI callouts */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="rounded-lg border border-primary/20 bg-primary/[0.04] p-2.5">
                      <span className="block text-[11px] font-medium text-muted-foreground">7-Day Apps</span>
                      <span className="font-display text-lg font-bold tabular-nums text-primary">
                        {recentAppsCount}
                      </span>
                    </div>
                    <div className="rounded-lg border border-primary/20 bg-primary/[0.04] p-2.5">
                      <span className="block text-[11px] font-medium text-muted-foreground">Screened</span>
                      <span className="font-display text-lg font-bold tabular-nums text-primary">
                        {recentScreenedCount}
                      </span>
                    </div>
                    <div className="rounded-lg border border-primary/20 bg-primary/[0.04] p-2.5">
                      <span className="block text-[11px] font-medium text-muted-foreground">Avg Fit Score</span>
                      <span className="font-display text-lg font-bold tabular-nums text-primary">
                        {stats?.applicants.avg_fit_score ?? 0}%
                      </span>
                    </div>
                  </div>

                  {/* Interactive Bar Chart for Applicant Intake */}
                  {loading ? (
                    <Skeleton className="h-[240px] w-full rounded-lg" />
                  ) : applicantSeries.length === 0 ? (
                    <div className="flex h-[240px] items-center justify-center text-xs text-muted-foreground">
                      No applicant data recorded.
                    </div>
                  ) : (
                    <ChartContainer config={applicantChartConfig} className="h-[240px] w-full">
                      <BarChart data={applicantSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
                        <XAxis
                          dataKey="day"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          className="text-[11px]"
                        />
                        <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-[11px]" width={35} />
                        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                        <Bar dataKey="applications" fill="var(--color-applications)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="screened" fill="var(--color-screened)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  )}
                </div>
              )}

              {/* View 3: Department Capacity Drilldown */}
              {analyticsView === "departments" && (
                <div className="mt-3">
                  {loading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-9 w-full rounded-md" />
                      ))}
                    </div>
                  ) : (
                    <div className="divide-y divide-border/60 max-h-[300px] overflow-y-auto pr-1">
                      {chartDepts.map((d) => {
                        const pct = d.total > 0 ? Math.round((d.staff / d.total) * 100) : 0;
                        return (
                          <div key={d.name} className="py-2.5 first:pt-1 last:pb-1 group">
                            <div className="flex items-center justify-between gap-3 text-xs">
                              <span className="truncate font-medium text-foreground group-hover:text-primary transition-colors">{d.name}</span>
                              <span className="shrink-0 tabular-nums text-muted-foreground">
                                <span className="font-bold text-primary">{d.staff}</span>
                                <span className="text-muted-foreground/60"> / {d.total} ({pct}%)</span>
                                {d.open > 0 && (
                                  <span className="ml-2 font-medium text-primary">
                                    {d.open} open
                                  </span>
                                )}
                              </span>
                            </div>
                            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-primary/10">
                              <div
                                className="h-full rounded-full bg-primary transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                      {chartDepts.length === 0 && (
                        <p className="py-6 text-center text-xs text-muted-foreground">
                          No department capacity records configured.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Audit Activity — KEPT AND PRESERVED */}
          <Card className={cn(PANEL, "flex-1")}>
            <CardContent className="p-4 sm:p-5">
              <div className={PANEL_HEAD}>
                <h2 className={PANEL_TITLE}>
                  <Activity className="h-4.5 w-4.5 text-primary" /> Audit Activity
                </h2>
                <Button asChild size="sm" variant="outline" className="h-8 text-xs">
                  <Link to="/superadmin/audit">View logs</Link>
                </Button>
              </div>
              {loading ? (
                <ListSkeleton items={3} className="mt-3" />
              ) : (
                <div className="mt-3 divide-y divide-border/60">
                  {recentAudit.length === 0 && (
                    <p className="py-4 text-center text-xs text-muted-foreground">
                      No audit events recorded.
                    </p>
                  )}
                  {recentAudit.slice(0, 5).map((a) => (
                    <div key={a.id} className="py-2.5 first:pt-1 last:pb-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-xs font-medium text-foreground">{a.action}</p>
                        <Badge
                          variant="outline"
                          className={cn(
                            pill,
                            "shrink-0",
                            a.severity === "Critical"
                              ? moduleToneClass["destructive"]
                              : a.severity === "Warning"
                                ? moduleToneClass["warning"]
                                : moduleToneClass["muted"],
                          )}
                        >
                          {a.severity}
                        </Badge>
                      </div>
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                        {a.user} · {formatDateTime(a.timestamp)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Secondary Section (xl:col-span-4): Module Health & Access Governance */}
        <div className="flex flex-col gap-4 xl:col-span-4 xl:grid xl:grid-rows-[auto_1fr]">
          {/* Module Health — Interactive Telemetry Console */}
          <Card className={PANEL}>
            <CardContent className="p-4 sm:p-5">
              <div className={PANEL_HEAD}>
                <h2 className={PANEL_TITLE}>
                  <ShieldCheck className="h-4.5 w-4.5 text-primary" /> Module Health
                </h2>
                <Badge
                  variant="outline"
                  className={cn(
                    pill,
                    "gap-1.5",
                    flagged > 0
                      ? "border-warning/40 bg-warning/15 text-warning-foreground"
                      : "border-success/40 bg-success/10 text-success"
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      flagged > 0 ? "bg-warning animate-pulse" : "bg-success"
                    )}
                  />
                  {flagged > 0 ? `${flagged} flagged` : "All operational"}
                </Badge>
              </div>

              {loading ? (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5" aria-busy="true">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-2">
                      <Skeleton className="h-7 w-7 rounded-lg" />
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {modules.map((m) => (
                    <Link
                      key={m.name}
                      to={m.to}
                      className="group relative flex flex-col justify-between rounded-xl border border-border/60 bg-muted/15 p-3 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card hover:shadow-xs"
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <m.icon className="h-3.5 w-3.5" />
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              m.tone === "destructive"
                                ? "bg-destructive animate-pulse"
                                : m.tone === "warning"
                                  ? "bg-warning animate-pulse"
                                  : "bg-success"
                            )}
                          />
                          {m.status}
                        </span>
                      </div>

                      <div className="mt-2.5">
                        <span className="block font-display text-lg font-bold tabular-nums text-foreground group-hover:text-primary transition-colors">
                          {m.value.toLocaleString()}
                        </span>
                        <span className="block text-xs font-semibold text-foreground/90 leading-tight">
                          {m.name}
                        </span>
                        <span className="block text-[10px] text-muted-foreground truncate mt-0.5">
                          {m.note}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between border-t border-border/40 pt-1.5 text-[10px] font-medium text-muted-foreground group-hover:text-primary transition-colors">
                        <span>Open module</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Access Governance — Interactive Security & Role Authority Console */}
          <Card className={cn(PANEL, "flex-1")}>
            <CardContent className="p-4 sm:p-5">
              <div className={PANEL_HEAD}>
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary">
                    <KeyRound className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="font-display text-base font-bold text-foreground leading-none">
                      Access Governance
                    </h2>
                    <span className="text-[10px] text-muted-foreground">
                      {stats?.system_users.total ?? 0} provisioned accounts
                    </span>
                  </div>
                </div>
                <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs text-primary hover:bg-primary/10">
                  <Link to="/superadmin/users">
                    Directory <ArrowUpRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>

              {/* Segmented View Switcher */}
              <div className="mt-3 grid grid-cols-3 gap-1 rounded-lg border border-border/50 bg-muted/30 p-1" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={govTab === "posture"}
                  onClick={() => setGovTab("posture")}
                  className={cn(
                    "rounded-md py-1 text-xs font-medium transition-all text-center cursor-pointer",
                    govTab === "posture"
                      ? "bg-card text-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Posture
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={govTab === "roles"}
                  onClick={() => setGovTab("roles")}
                  className={cn(
                    "rounded-md py-1 text-xs font-medium transition-all text-center cursor-pointer",
                    govTab === "roles"
                      ? "bg-card text-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Roles & RBAC
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={govTab === "activity"}
                  onClick={() => setGovTab("activity")}
                  className={cn(
                    "rounded-md py-1 text-xs font-medium transition-all text-center cursor-pointer",
                    govTab === "activity"
                      ? "bg-card text-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Live Feed
                </button>
              </div>

              {/* Tab 1: Security Posture */}
              {govTab === "posture" && (
                <div className="mt-3 space-y-3">
                  {/* Status Banner */}
                  <div
                    className={cn(
                      "flex items-center justify-between rounded-lg border p-2.5 transition-colors",
                      accessFlags > 0
                        ? "border-warning/40 bg-warning/10 text-warning-foreground"
                        : "border-success/30 bg-success/10 text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full",
                          accessFlags > 0 ? "bg-warning animate-pulse" : "bg-success"
                        )}
                      />
                      <div>
                        <p className="text-xs font-semibold leading-tight">
                          {accessFlags > 0
                            ? `${accessFlags} Account${accessFlags > 1 ? "s" : ""} Flagged`
                            : "Security Posture Optimal"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {accessFlags > 0
                            ? "Suspended or disabled accounts require audit"
                            : "100% active account compliance"}
                        </p>
                      </div>
                    </div>
                    <span className="font-display text-sm font-bold tabular-nums">
                      {stats?.system_users.total
                        ? Math.round(
                            ((stats.system_users.by_status["Active"] ?? 0) /
                              stats.system_users.total) *
                              100
                          )
                        : 100}
                      %
                    </span>
                  </div>

                  {/* Interactive Status Cards */}
                  <div className="grid grid-cols-3 gap-2">
                    {loading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full rounded-lg" />
                      ))
                    ) : (
                      <>
                        <Link
                          to="/superadmin/users"
                          className="group relative flex flex-col justify-between rounded-lg border border-border/60 bg-muted/15 p-2.5 transition-all hover:-translate-y-0.5 hover:border-success/50 hover:bg-success/5 hover:shadow-xs"
                          title="View active accounts in Directory"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Active
                            </span>
                            <span className="h-1.5 w-1.5 rounded-full bg-success" />
                          </div>
                          <div className="mt-2">
                            <span className="block font-display text-xl font-bold tabular-nums text-foreground group-hover:text-success transition-colors">
                              {stats?.system_users.by_status["Active"] ?? 0}
                            </span>
                            <span className="block text-[10px] text-muted-foreground">
                              Verified
                            </span>
                          </div>
                        </Link>

                        <Link
                          to="/superadmin/users"
                          className="group relative flex flex-col justify-between rounded-lg border border-border/60 bg-muted/15 p-2.5 transition-all hover:-translate-y-0.5 hover:border-warning/50 hover:bg-warning/5 hover:shadow-xs"
                          title="Review suspended accounts"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Suspended
                            </span>
                            <span
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                suspendedAccounts > 0
                                  ? "bg-warning animate-pulse"
                                  : "bg-muted-foreground/30"
                              )}
                            />
                          </div>
                          <div className="mt-2">
                            <span
                              className={cn(
                                "block font-display text-xl font-bold tabular-nums transition-colors",
                                suspendedAccounts > 0
                                  ? "text-warning-foreground"
                                  : "text-foreground"
                              )}
                            >
                              {suspendedAccounts}
                            </span>
                            <span className="block text-[10px] text-muted-foreground">
                              On hold
                            </span>
                          </div>
                        </Link>

                        <Link
                          to="/superadmin/users"
                          className="group relative flex flex-col justify-between rounded-lg border border-border/60 bg-muted/15 p-2.5 transition-all hover:-translate-y-0.5 hover:border-destructive/50 hover:bg-destructive/5 hover:shadow-xs"
                          title="Review disabled accounts"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Disabled
                            </span>
                            <span
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                disabledAccounts > 0
                                  ? "bg-destructive animate-pulse"
                                  : "bg-muted-foreground/30"
                              )}
                            />
                          </div>
                          <div className="mt-2">
                            <span
                              className={cn(
                                "block font-display text-xl font-bold tabular-nums transition-colors",
                                disabledAccounts > 0
                                  ? "text-destructive"
                                  : "text-foreground"
                              )}
                            >
                              {disabledAccounts}
                            </span>
                            <span className="block text-[10px] text-muted-foreground">
                              Revoked
                            </span>
                          </div>
                        </Link>
                      </>
                    )}
                  </div>

                  {/* RBAC Protocol Footnote */}
                  <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/10 px-3 py-2 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                      <span className="text-[11px]">Strict RBAC & session isolation enforced</span>
                    </div>
                    <Link
                      to="/superadmin/users"
                      className="inline-flex items-center gap-0.5 font-semibold text-[11px] text-primary hover:underline"
                    >
                      Audit <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              )}

              {/* Tab 2: Roles & RBAC Matrix */}
              {govTab === "roles" && (
                <div className="mt-3 space-y-3">
                  {/* Interactive Role Buttons */}
                  <div className="grid grid-cols-3 gap-1.5">
                    {loading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full rounded-lg" />
                      ))
                    ) : (
                      roleData.map((r) => {
                        const isSelected = activeRoleName === r.name;
                        return (
                          <button
                            key={r.name}
                            type="button"
                            onClick={() => setSelectedRole(r.name)}
                            className={cn(
                              "flex flex-col items-center justify-center rounded-lg border p-2 text-center transition-all cursor-pointer",
                              isSelected
                                ? "border-primary bg-primary/10 shadow-xs"
                                : "border-border/60 bg-muted/15 hover:border-border hover:bg-muted/30"
                            )}
                          >
                            <span
                              className={cn(
                                "text-[10px] font-medium truncate w-full",
                                isSelected ? "text-primary font-semibold" : "text-muted-foreground"
                              )}
                            >
                              {r.name}
                            </span>
                            <span className="font-display text-base font-bold tabular-nums text-foreground mt-0.5">
                              {r.value}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>

                  {/* Selected Role Detail Inspector */}
                  <div className="rounded-lg border border-border/60 bg-muted/10 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="grid h-6 w-6 place-items-center rounded-md bg-primary/10 text-primary">
                          {activeRoleName === "Superadmin" ? (
                            <ShieldAlert className="h-3.5 w-3.5" />
                          ) : activeRoleName === "Admin" ? (
                            <ShieldCheck className="h-3.5 w-3.5" />
                          ) : (
                            <UserCheck className="h-3.5 w-3.5" />
                          )}
                        </span>
                        <div>
                          <h4 className="text-xs font-semibold text-foreground leading-none">
                            {activeRoleName}
                          </h4>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {activeRoleMeta.level} · {activeRoleMeta.tier}
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className={cn(pill, activeRoleMeta.badgeClass)}>
                        {activeRoleCount} accounts ({activeRolePct}%)
                      </Badge>
                    </div>

                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {activeRoleMeta.description}
                    </p>

                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {activeRoleMeta.permissions.map((p) => (
                        <span
                          key={p}
                          className="inline-flex items-center gap-1 rounded bg-card px-1.5 py-0.5 text-[9px] font-medium text-foreground/80 border border-border/50"
                        >
                          <CheckCircle2 className="h-2.5 w-2.5 text-primary" /> {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Proportional Meter */}
                  <div className="space-y-1.5">
                    <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted/60 p-0.5 gap-0.5">
                      {roleData.map((r, i) => {
                        const total = stats?.system_users.total || 1;
                        const pct = Math.max(5, Math.round((r.value / total) * 100));
                        const colors = ["bg-primary", "bg-gold", "bg-muted-foreground/50"];
                        return (
                          <div
                            key={r.name}
                            className={cn(
                              "h-full rounded-full transition-all cursor-pointer",
                              colors[i % colors.length],
                              activeRoleName === r.name && "ring-1.5 ring-foreground"
                            )}
                            style={{ width: `${pct}%` }}
                            onClick={() => setSelectedRole(r.name)}
                            title={`${r.name}: ${r.value} (${pct}%)`}
                          />
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>Proportional distribution across roles</span>
                      <Link
                        to="/superadmin/users"
                        className="text-primary hover:underline inline-flex items-center gap-0.5 font-medium"
                      >
                        Manage roles <ArrowUpRight className="h-2.5 w-2.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Authentication Feed */}
              {govTab === "activity" && (
                <div className="mt-3 space-y-2">
                  {loading ? (
                    <ListSkeleton items={3} />
                  ) : recentUsers.length === 0 ? (
                    <div className="py-6 text-center text-xs text-muted-foreground">
                      <Clock className="mx-auto h-5 w-5 mb-1 opacity-50" />
                      No recent authentication events recorded
                    </div>
                  ) : (
                    recentUsers.slice(0, 3).map((u) => (
                      <div
                        key={u.id}
                        className="flex items-center justify-between gap-2 rounded-lg border border-border/40 bg-muted/10 p-2 transition-colors hover:bg-card hover:border-border"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <div className="relative shrink-0">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback className="bg-secondary text-[0.6rem] font-medium text-foreground">
                                {initials(u.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span
                              className={cn(
                                "absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-card",
                                u.status === "Active"
                                  ? "bg-success"
                                  : u.status === "Suspended"
                                    ? "bg-warning"
                                    : "bg-destructive"
                              )}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-medium text-foreground leading-tight">
                              {u.name ?? "Unlinked account"}
                            </p>
                            <p className="truncate text-[10px] text-muted-foreground">
                              {u.department ?? "General Staff"}
                            </p>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <Badge
                            variant="outline"
                            className={cn(pill, "text-[9px] px-1.5 py-0", accountStatusClass(u.status))}
                          >
                            {u.status}
                          </Badge>
                          <p className="mt-0.5 text-[9px] text-muted-foreground font-mono">
                            {formatDateTime(u.last_login_at)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}

                  <div className="pt-1 flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-success animate-ping" />
                      Real-time auth log
                    </span>
                    <Link
                      to="/superadmin/audit"
                      className="font-medium text-primary hover:underline inline-flex items-center gap-0.5"
                    >
                      Audit Trail <ArrowUpRight className="h-2.5 w-2.5" />
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Announcements — Full Width Bottom (KEPT AND PRESERVED) */}
        <div className="xl:col-span-12">
          <AnnouncementsCard role="superadmin" />
        </div>
      </div>
    </div>
  );
}
