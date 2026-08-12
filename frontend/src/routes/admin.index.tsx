import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, FileCheck2, UserPlus, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
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
import { Progress } from "@/components/ui/progress";
import { applicants, interviews, statusMeta } from "@/data/applicants";
import { newHires } from "@/data/hr";
import { jobs } from "@/data/jobs";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Recruitment Dashboard — Oxford Suites Makati HRMS" },
      {
        name: "description",
        content:
          "Applicant pipeline analytics, interview schedule, screening outcomes and onboarding progress.",
      },
      { property: "og:title", content: "Recruitment Dashboard — Oxford Suites Makati HRMS" },
      {
        property: "og:description",
        content: "Applicant pipeline analytics and onboarding progress for HR Admins.",
      },
    ],
  }),
  component: AdminDashboard,
});

const tooltipStyle = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  fontSize: 12,
};

const applicationTrend = [
  { day: "Mon", applications: 6, screened: 5 },
  { day: "Tue", applications: 9, screened: 8 },
  { day: "Wed", applications: 4, screened: 4 },
  { day: "Thu", applications: 11, screened: 9 },
  { day: "Fri", applications: 8, screened: 8 },
  { day: "Sat", applications: 5, screened: 3 },
  { day: "Sun", applications: 3, screened: 3 },
];

const statusColors: Record<string, string> = {
  fit: "var(--color-success)",
  "other-role": "var(--color-warning)",
  credential: "var(--color-caution)",
  "not-fit": "var(--color-destructive)",
};

function AdminDashboard() {
  const openJobs = jobs.filter((j) => j.active);
  const fit = applicants.filter((a) => a.status === "fit").length;

  const outcomeData = (Object.keys(statusMeta) as (keyof typeof statusMeta)[]).map((k) => ({
    name: statusMeta[k].label,
    value: applicants.filter((a) => a.status === k).length,
    key: k,
  }));

  const funnel = ["Screened", "Interview Scheduled", "Assessed", "Offer", "Hired"].map((s) => ({
    stage: s,
    count: applicants.filter((a) => a.stage === s).length,
  }));

  const sourceData = ["Online Portal", "Referral", "Indeed", "Facebook", "Walk-in"].map((s) => ({
    name: s,
    count: applicants.filter((a) => a.source === s).length,
  }));

  return (
    <div>
      <PageHeader
        eyebrow="HR Admin"
        title="Recruitment Dashboard"
        description="Applicant pipeline, interview schedule, and onboarding progress for Oxford Suites Makati."
        actions={
          <Button asChild>
            <Link to="/admin/recruitment">Post a Job</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Applicants"
          value={applicants.length}
          hint="In current pipeline"
          icon={Users}
          tone="primary"
          to="/admin/applicants"
        />
        <StatCard
          label="Fit for Position"
          value={fit}
          hint="NLP score ≥ 80%"
          icon={FileCheck2}
          tone="success"
          to="/admin/applicants"
        />
        <StatCard
          label="Interviews Scheduled"
          value={interviews.filter((i) => i.status === "Scheduled").length}
          hint="Next 7 days"
          icon={CalendarCheck}
          tone="gold"
          to="/admin/applicants"
        />
        <StatCard
          label="Onboarding"
          value={newHires.length}
          hint="New hires in progress"
          icon={UserPlus}
          to="/admin/onboarding"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card className="border-border/70">
          <CardContent className="p-6">
            <h2 className="font-display text-2xl font-semibold">Applications This Week</h2>
            <p className="text-xs text-muted-foreground">
              Incoming applications versus resumes processed by the screening engine.
            </p>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={applicationTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="day" fontSize={12} stroke="var(--color-muted-foreground)" />
                  <YAxis fontSize={12} stroke="var(--color-muted-foreground)" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="applications"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="screened"
                    stroke="var(--color-gold)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardContent className="p-6">
            <h2 className="font-display text-2xl font-semibold">Screening Outcomes</h2>
            <p className="text-xs text-muted-foreground">Result mix from the latest NER batch.</p>
            <div className="mt-2 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={outcomeData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={78}
                    paddingAngle={3}
                  >
                    {outcomeData.map((d) => (
                      <Cell key={d.key} fill={statusColors[d.key]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card className="border-border/70">
          <CardContent className="p-6">
            <h2 className="font-display text-2xl font-semibold">Hiring Funnel</h2>
            <div className="mt-4 h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnel}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="stage" fontSize={10} stroke="var(--color-muted-foreground)" />
                  <YAxis fontSize={12} allowDecimals={false} stroke="var(--color-muted-foreground)" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardContent className="p-6">
            <h2 className="font-display text-2xl font-semibold">Applicant Sources</h2>
            <div className="mt-4 h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sourceData} layout="vertical" margin={{ left: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis type="number" allowDecimals={false} fontSize={12} stroke="var(--color-muted-foreground)" />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    fontSize={11}
                    stroke="var(--color-muted-foreground)"
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="var(--color-gold)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card className="border-border/70">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold">Top Ranked Applicants</h2>
              <Button asChild variant="outline" size="sm">
                <Link to="/admin/applicants">View all</Link>
              </Button>
            </div>
            <ul className="mt-4 space-y-3">
              {[...applicants]
                .sort((a, b) => b.score - a.score)
                .slice(0, 6)
                .map((a) => (
                  <li
                    key={a.id}
                    className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">{a.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.position} · {a.source}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{statusMeta[a.status].label}</Badge>
                      <span className="font-display text-xl font-semibold text-primary">
                        {a.score}%
                      </span>
                    </div>
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <h2 className="font-display text-2xl font-semibold">Vacancy Fill Rate</h2>
              <ul className="mt-4 space-y-4">
                {openJobs.map((j) => {
                  const pct = Math.round((j.filled / j.vacancies) * 100);
                  return (
                    <li key={j.id}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{j.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {j.filled}/{j.vacancies} filled
                        </span>
                      </div>
                      <Progress value={pct} className="mt-1.5 h-2" />
                      <p className="mt-1 text-xs text-muted-foreground">{j.applicants} applicants</p>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="mt-6">
        <AnnouncementsCard role="admin" />
      </div>
    </div>
  );
}
