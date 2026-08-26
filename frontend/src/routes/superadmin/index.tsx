import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Activity,
  Briefcase,
  Building2,
  FileCheck2,
  Gauge,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AnnouncementsCard } from "@/components/portal/AnnouncementsCard";
import { PageHeader } from "@/components/portal/PageHeader";
import { StatCard } from "@/components/portal/StatCard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
          "Super Admin oversight: headcount analytics, hiring funnel, module health and audit activity.",
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

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

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

export function SuperAdminDashboard() {
  const [stats, setStats] = useState<ApiDashboardStats | null>(null);
  const [period, setPeriod] = useState<"6M" | "YTD">("6M");

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

  const activeTrend = period === "6M" ? stats?.employees.trend_6m : stats?.employees.trend_ytd;
  const openJobs = stats?.job_posts.open ?? 0;
  const totalApplicants = stats?.job_posts.total_applicants ?? 0;
  const currentHeadcount = activeTrend?.[activeTrend.length - 1]?.headcount ?? 0;
  const totalHires = activeTrend?.reduce((t, m) => t + m.hires, 0) ?? 0;
  const totalExits = activeTrend?.reduce((t, m) => t + m.exits, 0) ?? 0;
  const retentionRate =
    stats?.employees.total && stats?.employees.total > 0
      ? Math.round((stats.employees.active / stats.employees.total) * 1000) / 10
      : 0;

  const deptData = stats?.departments ?? [];
  const roleData = Object.entries(stats?.system_users.by_role ?? {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  const statusData = Object.entries(stats?.system_users.by_status ?? {}).map(([name, value]) => ({
    name,
    value,
  }));
  const recentUsers = stats?.system_users.recent ?? [];
  const recentAudit = stats?.audit.recent ?? [];

  return (
    <div>
      <PageHeader
        eyebrow="Super Admin"
        title="System Dashboard"
        description="Whole-system oversight across property operations, users, and HRMS modules."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Employees"
          value={stats?.employees.total ?? 0}
          hint={`${stats?.departments.length ?? 0} departments`}
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

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card className="border-border/70 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div>
                <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
                  <TrendingUp className="h-5 w-5 text-primary" /> Headcount &amp; Movement
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Rolling property headcount with hires and exits breakdown.
                </p>
              </div>
              <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
                {(["6M", "YTD"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`rounded-md px-3 py-1 text-xs font-medium ${
                      period === p
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* KPI Overview Row */}
            <div className="mt-4 grid grid-cols-4 divide-x divide-border rounded-xl border border-border bg-card p-2 text-center shadow-xs">
              <div className="p-2">
                <p className="eyebrow">Current</p>
                <p className="font-display text-xl font-bold text-primary">{currentHeadcount}</p>
              </div>
              <div className="p-2">
                <p className="eyebrow">New Hires</p>
                <p className="font-display text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {totalHires}
                </p>
              </div>
              <div className="p-2">
                <p className="eyebrow">Turnover / Exits</p>
                <p className="font-display text-xl font-bold text-amber-600 dark:text-amber-400">
                  {totalExits}
                </p>
              </div>
              <div className="p-2">
                <p className="eyebrow">Retention Rate</p>
                <p className="font-display text-xl font-bold text-gold">{retentionRate}%</p>
              </div>
            </div>

            {/* Revamped Composed Chart with Area Fill & Rounded Bars */}
            <div className="mt-5 h-68">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={activeTrend ?? []}
                  margin={{ top: 12, right: 12, left: -12, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="headcountAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    fontSize={12}
                    stroke="var(--color-muted-foreground)"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    fontSize={12}
                    stroke="var(--color-muted-foreground)"
                    tickLine={false}
                    axisLine={false}
                    domain={[0, "dataMax + 6"]}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    fontSize={12}
                    stroke="var(--color-muted-foreground)"
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--color-muted)", opacity: 0.3 }}
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="rounded-xl border border-border bg-card p-3 shadow-xl text-xs space-y-1.5 min-w-36">
                          <p className="font-display font-semibold text-foreground border-b border-border pb-1">
                            {label} Summary
                          </p>
                          <div className="flex items-center justify-between text-primary font-medium">
                            <span>Headcount:</span>
                            <span className="font-bold">
                              {payload.find((p) => p.dataKey === "headcount")?.value}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-emerald-600 font-medium">
                            <span>New Hires:</span>
                            <span className="font-bold">
                              +{payload.find((p) => p.dataKey === "hires")?.value}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-amber-600 font-medium">
                            <span>Exits:</span>
                            <span className="font-bold">
                              -{payload.find((p) => p.dataKey === "exits")?.value}
                            </span>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                  <Bar
                    yAxisId="right"
                    dataKey="hires"
                    name="New hires"
                    fill="#10B981"
                    barSize={18}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="exits"
                    name="Exits"
                    fill="#F59E0B"
                    barSize={18}
                    radius={[4, 4, 0, 0]}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="headcount"
                    fill="url(#headcountAreaGrad)"
                    stroke="none"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="headcount"
                    name="Total headcount"
                    stroke="var(--color-primary)"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "var(--color-primary)", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 6, fill: "var(--color-gold)" }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
                  <KeyRound className="h-5 w-5 text-primary" /> Portal Accounts
                </h2>
                <p className="text-xs text-muted-foreground">
                  System access by role and account status.
                </p>
              </div>
              <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
                {stats?.system_users.total ?? 0} accounts
              </Badge>
            </div>

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

            <div className="mt-4 border-t border-border/70 pt-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Recent sign-ins
              </p>
              <div className="mt-2 space-y-2">
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
                        <p className="truncate text-xs font-medium">{u.name}</p>
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
                <p className="text-xs text-muted-foreground">
                  Filled staff versus open roles across the property.
                </p>
              </div>
              <Badge variant="outline" className="border-gold/40 bg-gold/10 text-gold-foreground">
                {deptData.reduce((sum, item) => sum + item.open, 0)} open roles
              </Badge>
            </div>

            <div className="mt-4 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptData} layout="vertical" margin={{ left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis type="number" fontSize={12} stroke="var(--color-muted-foreground)" />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={130}
                      fontSize={11}
                      stroke="var(--color-muted-foreground)"
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar
                      dataKey="staff"
                      name="Filled staff"
                      fill="var(--color-primary)"
                      radius={[0, 4, 4, 0]}
                    />
                    <Bar
                      dataKey="open"
                      name="Open roles"
                      fill="var(--color-gold)"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col justify-center gap-3">
                {deptData.map((d) => {
                  const total = d.staff + d.open;
                  const pct = total > 0 ? Math.round((d.staff / total) * 100) : 100;
                  return (
                    <div key={d.name}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">{d.name}</span>
                        <span className="text-muted-foreground">
                          {d.staff}/{total} · {pct}% filled
                        </span>
                      </div>
                      <div className="mt-1 flex h-1.5 w-full overflow-hidden rounded-full bg-muted">
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
              </div>
            </div>
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
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Onboarding in progress"
          value={stats?.new_hires.total ?? 0}
          hint={`${stats?.new_hires.by_stage["Probationary"] ?? 0} probationary · ${stats?.new_hires.by_stage["Pre-onboarding"] ?? 0} pre-onboarding`}
          tone="primary"
          icon={UserPlus}
          to="/superadmin/onboarding"
        />
        <StatCard
          label="Applicants screened"
          value={stats?.applicants.total ?? 0}
          hint={`${stats?.applicants.fit ?? 0} rated fit for role`}
          tone="success"
          icon={FileCheck2}
          to="/superadmin/applicants"
        />
        <StatCard
          label="Average screening score"
          value={`${Math.round(stats?.applicants.avg_fit_score ?? 0)}%`}
          hint="NER model v2.3"
          tone="gold"
          icon={Gauge}
          to="/superadmin/applicants"
        />
        <StatCard
          label="Suspended accounts"
          value={stats?.system_users.by_status["Suspended"] ?? 0}
          hint="Requires password recovery"
          tone="caution"
          icon={ShieldAlert}
          to="/superadmin/users"
        />
      </div>
      <div className="mt-6">
        <AnnouncementsCard role="superadmin" />
      </div>
    </div>
  );
}
