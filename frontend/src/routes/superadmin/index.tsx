import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Briefcase,
  Building2,
  KeyRound,
  Server,
  ShieldCheck,
  Users,
} from "lucide-react";
import { AnnouncementsCard } from "@/components/portal/AnnouncementsCard";
import { PageHeader } from "@/components/portal/PageHeader";
import { StatCard } from "@/components/portal/StatCard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CardSkeleton,
  ListSkeleton,
  Skeleton,
  StatCardsSkeleton,
} from "@/components/ui/loading-skeletons";
import { dashboardApi } from "@/lib/api";
import type { ApiDashboardStats } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/superadmin/")({
  head: () => ({
    meta: [
      { title: "System Dashboard — Oxford Suites Makati HRMS" },
      {
        name: "description",
        content:
          "Super Admin oversight: module health, access governance, staffing and audit activity.",
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

const CHART = [
  "var(--color-primary)",
  "var(--color-gold)",
  "var(--color-success)",
  "var(--color-caution)",
  "var(--color-muted-foreground)",
];

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

const formatDateTime = (iso: string | null) => {
  if (!iso) return "Never";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Never";
  return d.toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

function SuperAdminDashboard() {
  const [stats, setStats] = useState<ApiDashboardStats | null>(null);

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

  const deptData = [...(stats?.departments ?? [])]
    .map((d) => ({ ...d, total: d.staff + d.open }))
    .sort((a, b) => b.total - a.total || b.staff - a.staff || a.name.localeCompare(b.name));
  const emptyDepts = deptData.filter((d) => d.total === 0);
  const chartDepts = deptData.filter((d) => d.total > 0);
  const roleData = Object.entries(stats?.system_users.by_role ?? {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
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
  const modulesFlagged = (accessFlags > 0 ? 1 : 0) + (criticalAudit > 0 ? 1 : 0);

  const modules = [
    {
      name: "Core HR",
      icon: Building2,
      to: "/superadmin/employees" as const,
      value: stats?.employees.total ?? 0,
      unit: "employees",
      note: `${stats?.employees.active ?? 0} active · ${deptData.length} departments`,
      status: "Healthy",
      tone: "success",
    },
    {
      name: "Recruitment",
      icon: Briefcase,
      to: "/superadmin/recruitment" as const,
      value: openJobs,
      unit: "open vacancies",
      note: `${totalApplicants} applicants · ${scheduledInterviews} interviews`,
      status: openJobs > 0 ? "Active hiring" : "No open posts",
      tone: openJobs > 0 ? "primary" : "muted",
    },
    {
      name: "Portal Accounts",
      icon: KeyRound,
      to: "/superadmin/users" as const,
      value: stats?.system_users.total ?? 0,
      unit: "portal accounts",
      note: `${suspendedAccounts} suspended · ${disabledAccounts} disabled`,
      status: accessFlags > 0 ? `${accessFlags} to review` : "Healthy",
      tone: accessFlags > 0 ? "warning" : "success",
    },
    {
      name: "Audit Trail",
      icon: Activity,
      to: "/superadmin/audit" as const,
      value: stats?.audit.total ?? 0,
      unit: "events logged",
      note: `${criticalAudit} critical in latest entries`,
      status: criticalAudit > 0 ? `${criticalAudit} critical` : "Healthy",
      tone: criticalAudit > 0 ? "destructive" : "success",
    },
  ];

  /** True while the dashboard stats request is in flight. */
  const loading = stats === null;

  return (
    <div>
      <PageHeader
        title="System Dashboard"
        description="Whole-system oversight across property operations, users, and HRMS modules."
      />

      {loading ? (
        <StatCardsSkeleton count={4} />
      ) : (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Employees"
          value={stats?.employees.total ?? 0}
          icon={Building2}
          tone="primary"
          to="/superadmin/employees"
        />
        <StatCard
          label="System Users"
          value={stats?.system_users.total ?? 0}
          hint="All portal accounts"
          icon={ShieldCheck}
          tone="gold"
          to="/superadmin/users"
        />
        <StatCard
          label="Open Vacancies"
          value={openJobs}
          hint="Published job posts"
          icon={Briefcase}
          tone="success"
          to="/superadmin/recruitment"
        />
        <StatCard
          label="Total Applicants"
          value={totalApplicants}
          hint="All-time submissions"
          icon={Users}
          to="/superadmin/applicants"
        />
        </div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card className="border-border/70 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-4">
              <div>
                <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
                  <Server className="h-5 w-5 text-primary" /> Module Health
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Record counts and flags across every HRMS module.
                </p>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "shrink-0 font-semibold",
                  modulesFlagged > 0
                    ? "border-warning/40 bg-warning/20 text-warning-foreground"
                    : "border-success/40 bg-success/10 text-success",
                )}
              >
                {modulesFlagged > 0 ? `${modulesFlagged} flagged` : "All clear"}
              </Badge>
            </div>

            {loading ? (
              <div
                className="mt-4 grid gap-3 sm:grid-cols-2"
                aria-busy="true"
                aria-label="Loading module health"
              >
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-border/70 p-4">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <Skeleton className="mt-3 h-3 w-20" />
                    <Skeleton className="mt-2 h-7 w-16" />
                    <Skeleton className="mt-3 h-5 w-24 rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {modules.map((m) => (
                  <Link
                    key={m.name}
                    to={m.to}
                    className="group rounded-xl border border-border/70 bg-card p-4 shadow-xs transition hover:border-primary/40 hover:bg-muted/30"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                        <m.icon className="h-4 w-4" />
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground/50 transition group-hover:text-primary" />
                    </div>
                    <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {m.name}
                    </p>
                    <p className="mt-1 flex items-baseline gap-1.5">
                      <span className="font-display text-2xl font-bold text-foreground">
                        {m.value}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{m.unit}</span>
                    </p>
                    <p className="mt-1 truncate text-[11px] text-muted-foreground">{m.note}</p>
                    <Badge
                      variant="outline"
                      className={cn("mt-3 text-[10px] font-semibold", moduleToneClass[m.tone])}
                    >
                      {m.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
                  <KeyRound className="h-5 w-5 text-primary" /> Portal Accounts
                </h2>
              </div>
              <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
                {stats?.system_users.total ?? 0} accounts
              </Badge>
            </div>

            {loading ? (
              <CardSkeleton rows={3} className="mt-4" />
            ) : (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {roleData.map((r, i) => (
                <div
                  key={r.name}
                  className="rounded-xl border border-border/80 bg-card p-3 text-center shadow-xs"
                >
                  <p
                    className="font-display text-2xl font-semibold"
                    style={{ color: CHART[i % CHART.length] }}
                  >
                    {r.value}
                  </p>
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {r.name}
                  </p>
                </div>
              ))}
            </div>
            )}

            {loading ? (
              <div className="mt-3 flex flex-wrap items-center gap-1.5" aria-busy="true">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
            ) : (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {statusData.map((s) => (
                <Badge
                  key={s.name}
                  variant="outline"
                  className={cn(accountStatusClass(s.name), "text-[10px]")}
                >
                  {s.value} {s.name}
                </Badge>
              ))}
            </div>
            )}

            <div className="mt-4 border-t border-border/70 pt-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Recent sign-ins
              </p>
              <div className="mt-2 space-y-2">
                {loading ? (
                  <ListSkeleton items={3} />
                ) : (
                <>
                {recentUsers.length === 0 && (
                  <p className="text-xs text-muted-foreground">No sign-ins recorded yet.</p>
                )}
                {recentUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="bg-secondary text-[0.6rem]">
                          {initials(u.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium">{u.name ?? "Unlinked account"}</p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {u.department ?? "—"} · {formatDateTime(u.last_login_at)}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn("shrink-0 text-[10px]", accountStatusClass(u.status))}
                    >
                      {u.status}
                    </Badge>
                  </div>
                ))}
                </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card className="border-border/70">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
                  <Building2 className="h-5 w-5 text-primary" /> Staffing by Department
                </h2>
              </div>
              <Badge variant="outline" className="border-gold/40 bg-gold/10 text-gold-foreground dark:text-gold">
                {deptData.reduce((sum, item) => sum + item.open, 0)} open roles
              </Badge>
            </div>

            {loading ? (
              <div className="mt-4 grid gap-6 lg:grid-cols-[1.4fr_1fr]" aria-busy="true" aria-label="Loading staffing chart">
                <Skeleton className="h-60 rounded-xl" />
                <ListSkeleton items={5} />
              </div>
            ) : (
            <div className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
              {chartDepts.map((d, i) => {
                const pct = d.total > 0 ? Math.round((d.staff / d.total) * 100) : 0;
                return (
                  <div key={d.name} className="rounded-xl border border-border/70 bg-card p-3 shadow-xs">
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="flex min-w-0 items-center gap-2 font-semibold">
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-primary/10 text-[11px] font-bold text-primary">
                          {i + 1}
                        </span>
                        <span className="truncate text-sm">{d.name}</span>
                      </span>
                      <span className="shrink-0 text-muted-foreground">
                        <span className="font-display text-base font-bold text-foreground">{d.staff}</span>
                        {"/"}{d.total} · {pct}% ·{" "}
                        <span className="font-semibold text-gold-foreground dark:text-gold">{d.open} open</span>
                      </span>
                    </div>
                    <div className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-l-full bg-primary"
                        style={{ width: `${pct}%` }}
                      />
                      <div
                        className="h-full rounded-r-full bg-gold"
                        style={{ width: `${100 - pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {emptyDepts.length > 0 && (
                <p className="text-[11px] text-muted-foreground">
                  {emptyDepts.length} department{emptyDepts.length !== 1 ? "s" : ""} with no
                  staffing yet: {emptyDepts.map((d) => d.name).join(", ")}.
                </p>
              )}
            </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
                <Activity className="h-5 w-5 text-primary" /> Audit Activity
              </h2>
              <Button asChild size="sm" variant="outline">
                <Link to="/superadmin/audit">View logs</Link>
              </Button>
            </div>
            {loading ? (
              <ListSkeleton items={4} className="mt-4" />
            ) : (
            <ul className="mt-4 space-y-3">
              {recentAudit.length === 0 && (
                <p className="text-xs text-muted-foreground">No audit activity recorded.</p>
              )}
              {recentAudit.map((a) => (
                <li key={a.id} className="border-b border-border pb-3 last:border-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-foreground">{a.action}</p>
                    <Badge
                      variant="outline"
                      className={
                        a.severity === "Critical"
                          ? "border-destructive/30 bg-destructive/10 text-destructive"
                          : a.severity === "Warning"
                            ? "border-warning/40 bg-warning/20 text-warning-foreground"
                            : "border-border"
                      }
                    >
                      {a.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {a.user} · {formatDateTime(a.timestamp)}
                  </p>
                </li>
              ))}
            </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <AnnouncementsCard role="superadmin" />
      </div>
    </div>
  );
}
