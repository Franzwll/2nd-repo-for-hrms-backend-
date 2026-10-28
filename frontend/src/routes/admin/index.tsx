import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarCheck, FileCheck2, Headset, Send, UserPlus, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
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
import { dashboardApi, essApi, newHiresApi } from "@/lib/api";
import type { ApiDashboardStats } from "@/lib/api";
import { ListSkeleton, StatCardsSkeleton } from "@/components/ui/loading-skeletons";
const Skeleton = (p: any) => <div className={"animate-pulse rounded-md bg-primary/10 " + (p.className ?? "")} />;

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
  const [essCounts, setEssCounts] = useState({ pending: 0, under_review: 0 });
  const [nhStats, setNhStats] = useState<{
    total: number;
    by_stage: Record<string, number>;
    starting_soon: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Independent fetches: a single HTML/proxy failure must not blank the
    // whole dashboard (Promise.all rejects on the first rejection, leaving
    // `stats === null` and the pink skeletons stuck forever).
    dashboardApi
      .stats()
      .then((s) => {
        if (!cancelled) setStats(s.data);
      })
      .catch(() => {});

    // Fetch ESS request queue counts for the admin
    essApi
      .adminRequests()
      .then((res) => {
        if (!cancelled && res.counts) {
          setEssCounts({ pending: res.counts.pending, under_review: res.counts.under_review });
        }
      })
      .catch(() => {});

    // Onboarding snapshot counts for the snapshot card
    newHiresApi
      .stats()
      .then((s) => {
        if (!cancelled) setNhStats(s);
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

  const stageCounts: Record<string, number> = stats?.applicants.by_stage ?? {};
  /** Mirrors ApplicantManagement's 5-step pipeline (pipelineStepOf):
   *  1 Screening (Screened + Accepted) → 2 Interview (Scheduled + Assessed) →
   *  3 Assessment Test → 4 Practical Test → 5 Final Evaluation + Offer.
   *  Hired / Rejected are terminal and excluded, same as the pipeline lists. */
  const funnel = [
    {
      stage: "1 · Screening",
      count: (stageCounts["Screened"] ?? 0) + (stageCounts["Accepted"] ?? 0),
    },
    {
      stage: "2 · Interview",
      count: (stageCounts["Interview Scheduled"] ?? 0) + (stageCounts["Assessed"] ?? 0),
    },
    { stage: "3 · Assessment", count: stageCounts["Assessment Test"] ?? 0 },
    { stage: "4 · Practical", count: stageCounts["Practical Test"] ?? 0 },
    {
      stage: "5 · Final + Offer",
      count: (stageCounts["Final Evaluation"] ?? 0) + (stageCounts["Offer"] ?? 0),
    },
  ];
  const funnelActive = funnel.reduce((s, f) => s + f.count, 0);
  const funnelConversion =
    funnelActive > 0 ? Math.round(((funnel[4]?.count ?? 0) / funnelActive) * 100) : 0;

  /** True while the dashboard data requests are in flight. */
  const loading = stats === null;

  return (
    <div>
      <PageHeader
        title="HR Admin Dashboard"
        description="Recruitment pipeline, ESS approval queue, and onboarding progress for Oxford Suites Makati."
        actions={
          <Button asChild>
            <Link to="/admin/recruitment">Post a Job</Link>
          </Button>
        }
      />

      {loading ? (
        <StatCardsSkeleton count={4} />
      ) : (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard
          label="Total Applicants"
          value={stats?.applicants.total ?? 0}
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
          icon={CalendarCheck}
          tone="gold"
          to="/admin/applicants"
        />
        <StatCard
          label="Onboarding"
          value={stats?.new_hires.total ?? 0}
          icon={UserPlus}
          to="/admin/onboarding"
        />
        <StatCard
          label="ESS Pending"
          value={essCounts.pending}
          icon={Send}
          tone="caution"
          to="/admin/ess"
        />
        <StatCard
          label="ESS Under Review"
          value={essCounts.under_review}
          icon={Headset}
          tone="gold"
          to="/admin/ess"
        />
        </div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card className="border-border/70">
          <CardContent className="p-6">
            <h2 className="font-display text-2xl font-semibold">Applications This Week</h2>
            {loading ? (
              <Skeleton className="mt-4 h-64 rounded-xl" aria-busy="true" aria-label="Loading applications chart" />
            ) : (
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
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardContent className="p-6">
            <h2 className="font-display text-2xl font-semibold">Screening Outcomes</h2>
            <p className="text-xs text-muted-foreground">Result mix from the latest NER batch.</p>
            {loading ? (
              <Skeleton className="mt-2 h-64 rounded-xl" aria-busy="true" aria-label="Loading screening outcomes chart" />
            ) : (
            <ul className="mt-4 max-h-64 space-y-4 overflow-y-auto pr-1">
              {(() => {
                const total = outcomeData.reduce((s, d) => s + d.value, 0) || 1;
                return [...outcomeData]
                  .sort((a, b) => b.value - a.value)
                  .map((d) => {
                    const pct = Math.round((d.value / total) * 100);
                    return (
                      <li key={d.key}>
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="flex min-w-0 items-center gap-2 font-medium">
                            <span
                              className="h-2.5 w-2.5 shrink-0 rounded-full"
                              style={{ background: statusColors[d.key] }}
                            />
                            <span className="truncate">{d.name}</span>
                          </span>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            <span className="font-display text-base font-semibold text-foreground">{d.value}</span>
                            {" · "}
                            {pct}%
                          </span>
                        </div>
                        <Progress value={pct} className="mt-1.5 h-2" />
                      </li>
                    );
                  });
              })()}
            </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card className="border-border/70">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold">Hiring Funnel</h2>
              <Button asChild variant="outline" size="sm">
                <Link to="/admin/applicants" search={{ highlight: undefined, tab: undefined }}>Open pipeline</Link>
              </Button>
            </div>
            {loading ? (
              <Skeleton className="mt-4 h-60 rounded-xl" aria-busy="true" aria-label="Loading hiring funnel chart" />
            ) : (
            <>
            <div className="mt-4 h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnel}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="stage" fontSize={10} stroke="var(--color-muted-foreground)" />
                  <YAxis
                    fontSize={12}
                    allowDecimals={false}
                    stroke="var(--color-muted-foreground)"
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              <span className="font-display text-base font-semibold text-foreground">{funnelActive}</span>
              {" "}active in pipeline · {funnelConversion}% reach Final + Offer
            </p>
            </>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold">Onboarding Snapshot</h2>
              <Button asChild variant="outline" size="sm">
                <Link to="/admin/onboarding">View all</Link>
              </Button>
            </div>
            {loading ? (
              <ListSkeleton items={3} className="mt-4" />
            ) : (
            <div className="mt-4 max-h-60 space-y-4 overflow-y-auto pr-1">
              {(() => {
                const stages = [
                  { name: "Pre-onboarding", color: "var(--color-caution)" },
                  { name: "Probationary", color: "var(--color-primary)" },
                  { name: "Regular", color: "var(--color-success)" },
                ];
                const total = nhStats?.total ?? stages.reduce((s, st) => s + (nhStats?.by_stage?.[st.name] ?? 0), 0);
                const safeTotal = total || 1;
                return (
                  <>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="font-display text-4xl font-bold">{total}</p>
                        <p className="text-xs text-muted-foreground">Total hires tracked</p>
                      </div>
                      <Badge variant="outline" className="border-gold/40 bg-gold/10 text-gold-foreground dark:text-gold">
                        {nhStats?.starting_soon ?? 0} starting soon
                      </Badge>
                    </div>
                    <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted" aria-label="Hires by onboarding stage">
                      {stages.map((st) => {
                        const count = nhStats?.by_stage?.[st.name] ?? 0;
                        return (
                          <div
                            key={st.name}
                            className="h-full"
                            style={{ width: `${(count / safeTotal) * 100}%`, background: st.color }}
                            title={`${st.name}: ${count}`}
                          />
                        );
                      })}
                    </div>
                    <ul className="grid grid-cols-3 gap-2">
                      {stages.map((st) => {
                        const count = nhStats?.by_stage?.[st.name] ?? 0;
                        const pct = Math.round((count / safeTotal) * 100);
                        return (
                          <li key={st.name} className="rounded-xl border border-border/70 p-3 text-center">
                            <p className="font-display text-2xl font-semibold" style={{ color: st.color }}>
                              {count}
                            </p>
                            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              {st.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground">{pct}%</p>
                          </li>
                        );
                      })}
                    </ul>
                  </>
                );
              })()}
            </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <AnnouncementsCard role="admin" />
      </div>
    </div>
  );
}
