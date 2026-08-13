import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  Briefcase,
  Building2,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";


import { AnnouncementsCard } from "@/components/portal/AnnouncementsCard";
import { PageHeader } from "@/components/portal/PageHeader";
import { StatCard } from "@/components/portal/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { applicants } from "@/data/applicants";
import { departments, employees, newHires } from "@/data/hr";
import { jobs } from "@/data/jobs";
import { auditLogs, systemUsers } from "@/data/users";

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

const CHART = ["var(--color-primary)", "var(--color-gold)", "var(--color-success)", "var(--color-caution)", "var(--color-muted-foreground)"];

const headcountTrend = [
  { month: "Feb", headcount: 78, hires: 4, exits: 2 },
  { month: "Mar", headcount: 81, hires: 6, exits: 3 },
  { month: "Apr", headcount: 84, hires: 5, exits: 2 },
  { month: "May", headcount: 86, hires: 4, exits: 2 },
  { month: "Jun", headcount: 89, hires: 7, exits: 4 },
  { month: "Jul", headcount: 93, hires: 8, exits: 4 },
];

export function SuperAdminDashboard() {
  const openJobs = jobs.filter((j) => j.active).length;
  const totalApplicants = jobs.reduce((t, j) => t + j.applicants, 0);

  const deptData = departments.map((d) => ({ name: d.name, staff: d.staff, open: d.openRequisitions }));
  const roleData = ["Super Admin", "Admin", "Employee"].map((r) => ({
    name: r,
    value: systemUsers.filter((u) => u.role === r).length,
  }));
  const severityData = (["Info", "Warning", "Critical"] as const).map((s) => ({
    name: s,
    value: auditLogs.filter((a) => a.severity === s).length,
  }));

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
          value={employees.length}
          hint="Across 5 departments"
          icon={Building2}
          tone="primary"
          to="/superadmin/employees"
        />
        <StatCard
          label="System Users"
          value={systemUsers.length}
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
        <Card className="border-border/70">
          <CardContent className="p-6">
            <h2 className="font-display text-2xl font-semibold">Headcount &amp; Movement</h2>
            <p className="text-xs text-muted-foreground">
              Rolling 6-month property headcount with hires and exits.
            </p>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={headcountTrend} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="month" fontSize={12} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                  <YAxis
                    yAxisId="left"
                    fontSize={12}
                    stroke="var(--color-muted-foreground)"
                    tickLine={false}
                    axisLine={false}
                    domain={[0, "dataMax + 4"]}
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
                    cursor={{ fill: "var(--color-muted)", opacity: 0.4 }}
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar
                    yAxisId="right"
                    dataKey="hires"
                    name="New hires"
                    fill="var(--color-success)"
                    barSize={16}
                    radius={[3, 3, 0, 0]}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="exits"
                    name="Exits"
                    fill="var(--color-caution)"
                    barSize={16}
                    radius={[3, 3, 0, 0]}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="headcount"
                    name="Total headcount"
                    stroke="var(--color-primary)"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "var(--color-primary)" }}
                    activeDot={{ r: 5 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardContent className="p-6">
            <h2 className="font-display text-2xl font-semibold">Portal Accounts</h2>
            <p className="text-xs text-muted-foreground">Distribution of system users by role.</p>
            <div className="mt-2 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {roleData.map((_, i) => (
                      <Cell key={i} fill={CHART[i % CHART.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3 text-center">
              {severityData.map((s, i) => (
                <div key={s.name}>
                  <p className="eyebrow">{s.name}</p>
                  <p
                    className="font-display text-xl font-semibold"
                    style={{ color: CHART[i % CHART.length] }}
                  >
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card className="border-border/70">
          <CardContent className="p-6">
            <h2 className="font-display text-2xl font-semibold">Staffing by Department</h2>
            <p className="text-xs text-muted-foreground">
              Filled staff versus open requisitions per department.
            </p>
            <div className="mt-4 h-72">
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
                  <Bar dataKey="staff" name="Filled" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="open" name="Open" fill="var(--color-gold)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold">Audit Activity</h2>
              <Button asChild size="sm" variant="outline">
                <Link to="/superadmin/audit">View logs</Link>
              </Button>
            </div>
            <ul className="mt-4 space-y-3">
              {auditLogs.slice(0, 6).map((a) => (
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
                    {a.user} · {a.timestamp}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/70">
          <CardContent className="p-5">
            <p className="eyebrow flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-success" /> Onboarding in progress
            </p>
            <p className="mt-2 font-display text-3xl font-semibold">{newHires.length}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {newHires.filter((h) => h.stage === "Probationary").length} probationary ·{" "}
              {newHires.filter((h) => h.stage === "Pre-onboarding").length} pre-onboarding
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70">
          <CardContent className="p-5">
            <p className="eyebrow">Screened this week</p>
            <p className="mt-2 font-display text-3xl font-semibold">{applicants.length}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {applicants.filter((a) => a.status === "fit").length} rated fit for role
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70">
          <CardContent className="p-5">
            <p className="eyebrow">Average screening score</p>
            <p className="mt-2 font-display text-3xl font-semibold text-gold">
              {Math.round(applicants.reduce((t, a) => t + a.score, 0) / applicants.length)}%
            </p>
            <p className="mt-1 text-xs text-muted-foreground">NER model v2.3</p>
          </CardContent>
        </Card>
        <Card className="border-border/70">
          <CardContent className="p-5">
            <p className="eyebrow">Suspended accounts</p>
            <p className="mt-2 font-display text-3xl font-semibold text-caution">
              {systemUsers.filter((u) => u.status === "Suspended").length}

            </p>
            <p className="mt-1 text-xs text-muted-foreground">Requires password recovery</p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-6">
        <AnnouncementsCard role="superadmin" />
      </div>
    </div>
  );
}
