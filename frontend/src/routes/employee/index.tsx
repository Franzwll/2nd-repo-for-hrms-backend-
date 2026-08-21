import { useState, useEffect, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Clock,
  FileText,
  TrendingUp,
  FileCheck,
  ClipboardCheck,
  Headset,
  ArrowRight,
  Activity,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Sparkles,
  Bot,
} from "lucide-react";

import { AnnouncementsCard } from "@/components/portal/AnnouncementsCard";
import { PageHeader } from "@/components/portal/PageHeader";
import { StatCard } from "@/components/portal/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { myAttendance, myEmployeeDocuments, myPayroll, myPerformance, myProfile, wireframeActivity } from "@/data/ess";
import { essApi, newHiresApi, onboardingItemsApi, type ApiEssOverview, type ApiEssRequestItem } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { EssAiAssistantModal } from "@/components/modules/ess/modals/EssAiAssistantModal";

export const Route = createFileRoute("/employee/")({
  component: EmployeeDashboard,
});

function EmployeeDashboard() {
  const user = getUser();
  const [overview, setOverview] = useState<ApiEssOverview | null>(null);
  const [requests, setRequests] = useState<ApiEssRequestItem[]>([]);
  const [pendingTasks, setPendingTasks] = useState<string[]>([]);
  const [loadingOnboarding, setLoadingOnboarding] = useState(true);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // Time of day greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const employeeName = user?.full_name || overview?.employee?.name || myProfile.name;
  const firstName = employeeName.split(" ")[0];
  const position = overview?.employee?.position || myProfile.position;
  const department = user?.department_name || overview?.employee?.department || myProfile.department;
  const employmentType = overview?.employee?.employment_type || "Probationary Status";

  useEffect(() => {
    // 1. Fetch ESS Overview
    essApi
      .overview()
      .then(setOverview)
      .catch(() => {});

    // 2. Fetch ESS Requests
    essApi
      .myRequests()
      .then((res) => {
        if (res.requests && res.requests.length > 0) {
          setRequests(res.requests);
        }
      })
      .catch(() => {});

    // 3. Fetch Onboarding Tasks
    newHiresApi
      .list({ per_page: 100 })
      .then((res) => {
        const mine =
          res.data.find(
            (h) =>
              (user?.employee_id && h.employee_id === user.employee_id) ||
              h.name.toLowerCase() === employeeName.toLowerCase() ||
              h.email === user?.email
          ) ??
          res.data[0] ??
          null;

        if (!mine) {
          setPendingTasks(["Acknowledge Company Policies", "Accept Employment Agreement"]);
          return;
        }

        return onboardingItemsApi.listForNewHire(mine.new_hire_id).then((items) => {
          const uncompleted = items.filter((i) => !i.done).map((i) => i.item_text);
          setPendingTasks(uncompleted);
        });
      })
      .catch(() => {
        setPendingTasks(["Acknowledge Company Policies", "Accept Employment Agreement"]);
      })
      .finally(() => setLoadingOnboarding(false));
  }, [employeeName, user?.employee_id, user?.email]);

  // Combined top actions from real requests and fallback activities
  const topActions = useMemo(() => {
    if (requests.length > 0) {
      return requests.slice(0, 5).map((r) => ({
        type: r.type,
        category: r.category,
        date: r.filed,
        status: r.status,
      }));
    }
    return wireframeActivity.slice(0, 5);
  }, [requests]);

  const shiftBadgeText = overview?.today_schedule?.is_rest_day
    ? "Rest Day (Off Duty)"
    : `On Shift (${overview?.today_schedule?.time || "07:00 AM – 04:00 PM"})`;

  return (
    <div>
      <PageHeader
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold uppercase tracking-wider">{position} · {department}</span>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[11px] py-0">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block mr-1.5 animate-pulse" />
              {shiftBadgeText}
            </Badge>
          </div>
        }
        title={`${greeting}, ${firstName} 👋`}
        description="Here's what's happening with your employment today."
        actions={
          <Button asChild>
            <Link to="/employee/ess" search={{}}>Go to ESS Management</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Department" value={department} hint="Oxford Suites Makati" icon={Headset} tone="primary" />
        <StatCard label="Position" value={position} hint={employmentType} icon={ClipboardCheck} tone="gold" />
      </div>

      {/* Quick Actions Grid (6-column responsive layout) */}
      <div className="mt-6">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="font-display text-xl font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              <Button
                asChild
                variant="outline"
                className="h-auto flex-row items-center gap-3 p-4 text-left hover:border-primary hover:bg-primary/5 transition-all shadow-2xs"
              >
                <Link to="/employee/ess" search={{ category: "Attendance" }}>
                  <div className="p-2 text-primary rounded-md bg-primary/10">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">Attendance</p>
                    <p className="text-xs text-muted-foreground font-normal truncate">Time in/out &amp; logs</p>
                  </div>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-auto flex-row items-center gap-3 p-4 text-left hover:border-primary hover:bg-primary/5 transition-all shadow-2xs"
              >
                <Link to="/employee/ess" search={{ category: "Payroll" }}>
                  <div className="rounded-md bg-emerald-500/10 p-2 text-emerald-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">Payroll</p>
                    <p className="text-xs text-muted-foreground font-normal truncate">Payslips &amp; breakdown</p>
                  </div>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-auto flex-row items-center gap-3 p-4 text-left hover:border-primary hover:bg-primary/5 transition-all shadow-2xs"
              >
                <Link to="/employee/ess" search={{ category: "Performance" }}>
                  <div className="rounded-md bg-purple-500/10 p-2 text-purple-600">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">Performance</p>
                    <p className="text-xs text-muted-foreground font-normal truncate">LMS courses &amp; scores</p>
                  </div>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-auto flex-row items-center gap-3 p-4 text-left hover:border-primary hover:bg-primary/5 transition-all shadow-2xs"
              >
                <Link to="/employee/ess" search={{ category: "Documents" }}>
                  <div className="rounded-md bg-blue-500/10 p-2 text-blue-600">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">Document</p>
                    <p className="text-xs text-muted-foreground font-normal truncate">COE &amp; HR clearances</p>
                  </div>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-auto flex-row items-center gap-3 p-4 text-left hover:border-primary hover:bg-primary/5 transition-all shadow-2xs"
              >
                <Link to="/employee/ess" search={{ category: "Recognition" }}>
                  <div className="rounded-md bg-amber-500/10 p-2 text-amber-600">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">Recognition</p>
                    <p className="text-xs text-muted-foreground font-normal truncate">Kudos &amp; Wall of Fame</p>
                  </div>
                </Link>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setAiModalOpen(true)}
                className="h-auto flex-row items-center gap-3 p-4 text-left hover:border-primary hover:bg-primary/5 transition-all shadow-2xs cursor-pointer border-primary/40 bg-gradient-to-br from-primary/10 via-background to-amber-500/10"
              >
                <div className="rounded-md bg-rose-500/15 p-2 text-rose-600 shadow-2xs">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm flex items-center gap-1.5 text-foreground">
                    <span>HR AI Concierge</span>
                  </p>
                  <p className="text-xs text-muted-foreground font-normal truncate">Ask questions &amp; help</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* ESS Overview Card (analytics + logs) */}
        <Card className="border-border/70 flex flex-col justify-between">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-display text-xl font-semibold">
                <Activity className="h-5 w-5 text-primary" />
                ESS Overview
              </div>
              <Button asChild variant="ghost" size="sm" className="text-primary">
                <Link to="/employee/ess" search={{}}>
                  Open ESS <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link to="/employee/ess" search={{ category: "Attendance" }} className="rounded-lg border border-border/70 bg-muted/20 p-3 transition-colors hover:border-primary/40 hover:bg-primary/5">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 text-primary" /> Attendance
                </div>
                <p className="mt-1 text-lg font-bold font-display">{myAttendance.monthly.present} Present</p>
                <p className="text-xs text-muted-foreground">
                  {overview?.today_attendance?.time_in ? `In ${overview.today_attendance.time_in}` : `Time In ${myAttendance.today.timeIn}`} · {myAttendance.monthly.late} late
                </p>
              </Link>
              <Link to="/employee/ess" search={{ category: "Payroll" }} className="rounded-lg border border-border/70 bg-muted/20 p-3 transition-colors hover:border-primary/40 hover:bg-primary/5">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <FileText className="h-3.5 w-3.5 text-emerald-600" /> Payroll
                </div>
                <p className="mt-1 text-lg font-bold font-display">₱{myPayroll.net.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Next payout {myPayroll.nextPayout}</p>
              </Link>
              <Link to="/employee/ess" search={{ category: "Performance" }} className="rounded-lg border border-border/70 bg-muted/20 p-3 transition-colors hover:border-primary/40 hover:bg-primary/5">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <TrendingUp className="h-3.5 w-3.5 text-purple-600" /> Performance
                </div>
                <p className="mt-1 text-lg font-bold font-display">{myPerformance.lmsCoursesCompleted}/{myPerformance.lmsCoursesAssigned} Courses</p>
                <p className="text-xs text-muted-foreground">Avg {myPerformance.averageScore} · {myPerformance.competencyLevel}</p>
              </Link>
              <Link to="/employee/ess" search={{ category: "Documents" }} className="rounded-lg border border-border/70 bg-muted/20 p-3 transition-colors hover:border-primary/40 hover:bg-primary/5">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <FileCheck className="h-3.5 w-3.5 text-blue-600" /> Documents
                </div>
                <p className="mt-1 text-lg font-bold font-display">{myEmployeeDocuments.filter((d) => d.status !== "Missing").length} Submitted</p>
                <p className="text-xs text-amber-600">{myEmployeeDocuments.filter((d) => d.status === "Missing").length} missing requirement</p>
              </Link>
            </div>

            {/* Recent activities log */}
            <div className="mt-4 space-y-2 border-t border-border pt-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent activities</p>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Top 5 Latest</Badge>
              </div>
              {topActions.map((act, index) => (
                <div key={index} className="flex items-center justify-between gap-2 text-xs border-b border-border/50 pb-1.5">
                  <span className="font-medium text-foreground truncate">{act.type}</span>
                  <span className="shrink-0 text-muted-foreground">{act.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Social Recognition & Wall of Fame Card */}
        <Card className="border-border/70 flex flex-col justify-between">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-display text-xl font-semibold">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Social Recognition
              </div>
              <Button asChild variant="ghost" size="sm" className="text-amber-600 font-semibold">
                <Link to="/employee/ess" search={{ category: "Recognition" }}>
                  Wall of Fame <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              {/* Highlight Shoutouts */}
              <div className="space-y-2.5">
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3 text-xs space-y-1.5 transition-colors hover:border-amber-500/40 hover:bg-amber-500/5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="h-6 w-6 rounded-full bg-amber-500/20 text-amber-700 font-bold text-[10px] grid place-items-center shrink-0">
                        CA
                      </div>
                      <span className="font-semibold text-foreground truncate">Chef Antonio</span>
                      <span className="text-muted-foreground text-[11px]">→</span>
                      <span className="font-semibold text-primary truncate">Aldrex M. Cordon</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-emerald-500/10 text-emerald-600 border-emerald-500/30 shrink-0">
                      Teamwork &amp; Malasakit
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-[11px] line-clamp-2 leading-relaxed">
                    "Maintained peak efficiency and spotless kitchen line standards during the Saturday banquet rush."
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-0.5">
                    <span>👏 15</span>
                    <span>❤️ 8</span>
                    <span>🔥 4</span>
                    <span className="ml-auto text-[10px] text-muted-foreground">Today</span>
                  </div>
                </div>

                <div className="rounded-xl border border-border/70 bg-muted/20 p-3 text-xs space-y-1.5 transition-colors hover:border-amber-500/40 hover:bg-amber-500/5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="h-6 w-6 rounded-full bg-primary/20 text-primary font-bold text-[10px] grid place-items-center shrink-0">
                        BS
                      </div>
                      <span className="font-semibold text-foreground truncate">Bullseur Santiago</span>
                      <span className="text-muted-foreground text-[11px]">→</span>
                      <span className="font-semibold text-primary truncate">Maria Santos</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-amber-500/10 text-amber-600 border-amber-500/30 shrink-0">
                      Guest Delight
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-[11px] line-clamp-2 leading-relaxed">
                    "Exceeded guest expectations with proactive check-in care and warm hospitality."
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-0.5">
                    <span>⭐ 12</span>
                    <span>👏 9</span>
                    <span>❤️ 5</span>
                    <span className="ml-auto text-[10px] text-muted-foreground">Yesterday</span>
                  </div>
                </div>

                <div className="rounded-xl border border-border/70 bg-muted/20 p-3 text-xs space-y-1.5 transition-colors hover:border-amber-500/40 hover:bg-amber-500/5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="h-6 w-6 rounded-full bg-purple-500/20 text-purple-700 font-bold text-[10px] grid place-items-center shrink-0">
                        RV
                      </div>
                      <span className="font-semibold text-foreground truncate">Ricardo Villanueva</span>
                      <span className="text-muted-foreground text-[11px]">→</span>
                      <span className="font-semibold text-primary truncate">Ana Ramos</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-purple-500/10 text-purple-600 border-purple-500/30 shrink-0">
                      Going the Extra Mile
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-[11px] line-clamp-2 leading-relaxed">
                    "Stepped up to assist guest concierge services seamlessly during peak afternoon check-outs."
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-0.5">
                    <span>👏 11</span>
                    <span>⭐ 7</span>
                    <span>❤️ 6</span>
                    <span className="ml-auto text-[10px] text-muted-foreground">2 days ago</span>
                  </div>
                </div>
              </div>
            </div>

            <Button asChild variant="outline" size="sm" className="mt-4 w-full sm:w-auto border-amber-500/30 hover:bg-amber-500/10 text-foreground font-semibold">
              <Link to="/employee/ess" search={{ category: "Recognition" }}>
                Give Kudos &amp; View Wall <Sparkles className="ml-2 h-4 w-4 text-amber-500" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <AnnouncementsCard role="employee" />
      </div>

      <EssAiAssistantModal
        open={aiModalOpen}
        onOpenChange={setAiModalOpen}
      />
    </div>
  );
}


