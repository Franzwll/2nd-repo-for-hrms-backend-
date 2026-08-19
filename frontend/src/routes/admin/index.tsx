import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
import { applicantsApi, dashboardApi, jobPostsApi } from "@/lib/api";
import type { ApiApplicant, ApiDashboardStats, ApiJobPost } from "@/lib/api";

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

const statusColors: Record<string, string> = {
  fit: "var(--color-success)",
  "other-role": "var(--color-warning)",
  credential: "var(--color-caution)",
  "not-fit": "var(--color-destructive)",
};

const statusLabels: Record<string, string> = {
  fit: "Fit",
  "other-role": "Other Role",
  credential: "Credential",
  "not-fit": "Not Fit",
};

function AdminDashboard() {
  const [stats, setStats] = useState<ApiDashboardStats | null>(null);
  const [applicants, setApplicants] = useState<ApiApplicant[]>([]);
  const [openJobs, setOpenJobs] = useState<ApiJobPost[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      dashboardApi.stats(),
      applicantsApi.list({ per_page: 100 }),
      jobPostsApi.list({ per_page: 100, status: "Open" }),
    ])
      .then(([s, a, j]) => {
        if (cancelled) return;
        setStats(s.data);
        setApplicants(a.data ?? []);
        setOpenJobs((j.data ?? []).filter((p) => p.active));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const fit = stats?.applicants.fit ?? 0;

  const outcomeData = (Object.keys(stats?.applicants.by_status ?? {}) as string[]).map((k) => ({
    name: statusLabels[k] ?? k,
    value: stats?.applicants.by_status[k] ?? 0,
    key: k,
  }));

  const funnel = ["Screened", "Interview Scheduled", "Assessed", "Offer", "Hired"].map((s) => ({
    stage: s,
    count: stats?.applicants.by_stage[s] ?? 0,
  }));

  const sourceData = Object.entries(stats?.applicants.by_source ?? {}).map(([name, count]) => ({
    name,
    count,
  }));

  const topApplicants = [...applicants]
    .sort((a, b) => (b.fit_score ?? 0) - (a.fit_score ?? 0))
    .slice(0, 6);

  const vacancyJobs = openJobs.filter((j) => j.vacancies > 0);

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
          value={stats?.applicants.total ?? 0}
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
          value={stats?.interviews.scheduled ?? 0}
          hint="Next 7 days"
          icon={CalendarCheck}
          tone="gold"
          to="/admin/applicants"
        />
        <StatCard
          label="Onboarding"
          value={stats?.new_hires.total ?? 0}
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
                <LineChart data={stats?.applicants.trend ?? []}>
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

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
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

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card className="border-border/70">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold">Top Ranked Applicants</h2>
              <Button asChild variant="outline" size="sm">
                <Link to="/admin/applicants">View all</Link>
              </Button>
            </div>
            <ul className="mt-4 space-y-3">
              {topApplicants.map((a) => (
                <li
                  key={a.applicant_id}
                  className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">{a.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.job_post?.title ?? "—"} · {a.source ?? "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{statusLabels[a.status] ?? a.status}</Badge>
                    <span className="font-display text-xl font-semibold text-primary">
                      {a.fit_score ?? 0}%
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
                {vacancyJobs.map((j) => {
                  const pct = j.vacancies > 0 ? Math.round((j.filled_count / j.vacancies) * 100) : 0;
                  return (
                    <li key={j.job_post_id}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{j.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {j.filled_count}/{j.vacancies} filled
                        </span>
                      </div>
                      <Progress value={pct} className="mt-1.5 h-2" />
                      <p className="mt-1 text-xs text-muted-foreground">
                        {j.applicants_count ?? 0} applicants
                      </p>
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
