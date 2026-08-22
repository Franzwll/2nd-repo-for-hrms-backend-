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
  Award,
  Bot,
  ShieldCheck,
  CalendarDays,
} from "lucide-react";

import { AnnouncementsCard } from "@/components/portal/AnnouncementsCard";
import { PageHeader } from "@/components/portal/PageHeader";
import { StatCard } from "@/components/portal/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  essApi,
  newHiresApi,
  onboardingItemsApi,
  type ApiEssOverview,
  type ApiEssRequestItem,
  type ApiRecognitionItem,
} from "@/lib/api";
import { getUser } from "@/lib/auth";

export const Route = createFileRoute("/employee/")({
  component: EmployeeDashboard,
});

function EmployeeDashboard() {
  const user = getUser();
  const [overview, setOverview] = useState<ApiEssOverview | null>(null);
  const [requests, setRequests] = useState<ApiEssRequestItem[]>([]);
  const [recognitions, setRecognitions] = useState<ApiRecognitionItem[]>([]);
  const [pendingTasks, setPendingTasks] = useState<string[]>([]);
  const [loadingOnboarding, setLoadingOnboarding] = useState(true);

  // Time of day greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const employeeName = user?.full_name || overview?.employee?.name || "Employee";
  const firstName = employeeName.split(" ")[0];
  const position = overview?.employee?.position || (user?.department_name ? `${user.department_name} Staff` : "Staff");
  const department = user?.department_name || overview?.employee?.department || "General";
  const employmentType = overview?.employee?.employment_type || "Probationary";

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

    // 3. Fetch Social Recognitions
    essApi
      .recognitions()
      .then((res) => {
        if (res.recognitions) {
          setRecognitions(res.recognitions);
        }
      })
      .catch(() => {});

    // 4. Fetch Onboarding Tasks
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

  const topActions = useMemo(() => {
    if (requests && requests.length > 0) {
      return requests.slice(0, 5).map((r) => ({
        type: r.type,
        category: r.category,
        date: r.filed,
        status: r.status,
      }));
    }
    return [
      { type: "Vacation Leave (VL) Request", category: "Attendance", date: "Aug 18, 2026", status: "Approved" },
      { type: "Biometrics Correction", category: "Attendance", date: "Aug 14, 2026", status: "Completed" },
      { type: "Certificate of Employment (COE)", category: "Documents", date: "Aug 10, 2026", status: "Pending" },
      { type: "Night Differential Inquiry", category: "Payroll", date: "Aug 05, 2026", status: "Completed" },
      { type: "Food Safety Level 2 Certification", category: "Performance", date: "Aug 02, 2026", status: "Completed" },
    ];
  }, [requests]);

  const shiftBadgeText = overview?.today_schedule?.is_rest_day
    ? "Rest Day (Off Duty)"
    : `On Shift (${overview?.today_schedule?.time || "07:00 AM – 04:00 PM"})`;

  const availableLeaves = overview?.monthly_attendance?.total_leave_available ?? (overview?.leave_balances?.reduce((acc, b) => acc + b.available, 0) || 15);
  const netPay = overview?.payroll_summary?.estimated_net ?? 28080;
  const nextPayoutDate = overview?.payroll_summary?.next_payout ?? "August 30, 2026";
  const lmsDone = overview?.performance_summary?.lms_completed ?? 4;
  const lmsTotal = overview?.performance_summary?.lms_total ?? 4;

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
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Leave Balance"
          value={`${availableLeaves} days`}
          hint="Available paid leave credits"
          icon={Clock}
          tone="primary"
        />
        <StatCard
          label="Take-Home Pay"
          value={`₱${netPay.toLocaleString()}`}
          hint={`Next payout ${nextPayoutDate}`}
          icon={FileText}
          tone="success"
        />
        <StatCard
          label="LMS Training"
          value={`${lmsDone}/${lmsTotal}`}
          hint={`${overview?.performance_summary?.competency_level ?? "Proficient"} competency`}
          icon={TrendingUp}
          tone="primary"
        />
        <StatCard label="Position" value={position} hint={employmentType} icon={ClipboardCheck} tone="gold" />
      </div>

      {/* Quick Actions Grid (Compact Box Type 3x3 Grid) */}
      <div className="mt-6">
        <Card className="border-border/70 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg font-semibold">Quick Actions</CardTitle>
            <p className="text-xs text-muted-foreground">Access core employee self-service modules and automated HR tools.</p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {/* Row 1, Col 1: Attendance */}
              <div className="rounded-xl border border-primary/20 bg-card p-4 min-h-[175px] flex flex-col items-center text-center justify-between gap-2.5 transition-all hover:border-primary hover:shadow-sm hover:-translate-y-0.5 group">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-2xs transition-transform group-hover:scale-105">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="space-y-1 flex-1 flex flex-col justify-center">
                  <h3 className="font-display text-sm sm:text-base font-bold text-foreground">Attendance</h3>
                  <p className="text-[11px] text-muted-foreground leading-snug max-w-[220px]">
                    Apply and monitor daily time-in/out logs and shift schedules.
                  </p>
                </div>
                <Button asChild size="sm" className="px-5 h-7 rounded bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-[11px] shadow-xs">
                  <Link to="/employee/ess" search={{ category: "Attendance" }}>
                    View Details
                  </Link>
                </Button>
              </div>

              {/* Row 1, Col 2: Payroll */}
              <div className="rounded-xl border border-primary/20 bg-card p-4 min-h-[175px] flex flex-col items-center text-center justify-between gap-2.5 transition-all hover:border-primary hover:shadow-sm hover:-translate-y-0.5 group">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-2xs transition-transform group-hover:scale-105">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="space-y-1 flex-1 flex flex-col justify-center">
                  <h3 className="font-display text-sm sm:text-base font-bold text-foreground">Payroll</h3>
                  <p className="text-[11px] text-muted-foreground leading-snug max-w-[220px]">
                    Inspect itemized payslips, net pay, and statutory tax records.
                  </p>
                </div>
                <Button asChild size="sm" className="px-5 h-7 rounded bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-[11px] shadow-xs">
                  <Link to="/employee/ess" search={{ category: "Payroll" }}>
                    View Details
                  </Link>
                </Button>
              </div>

              {/* Row 1, Col 3: Leave Filing */}
              <div className="rounded-xl border border-primary/20 bg-card p-4 min-h-[175px] flex flex-col items-center text-center justify-between gap-2.5 transition-all hover:border-primary hover:shadow-sm hover:-translate-y-0.5 group">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-2xs transition-transform group-hover:scale-105">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="space-y-1 flex-1 flex flex-col justify-center">
                  <h3 className="font-display text-sm sm:text-base font-bold text-foreground">Leave Filing</h3>
                  <p className="text-[11px] text-muted-foreground leading-snug max-w-[220px]">
                    Submit vacation, sick, and emergency leave applications.
                  </p>
                </div>
                <Button asChild size="sm" className="px-5 h-7 rounded bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-[11px] shadow-xs">
                  <Link to="/employee/ess" search={{ category: "Attendance" }}>
                    View Details
                  </Link>
                </Button>
              </div>

              {/* Row 2, Col 1: Performance */}
              <div className="rounded-xl border border-primary/20 bg-card p-4 min-h-[175px] flex flex-col items-center text-center justify-between gap-2.5 transition-all hover:border-primary hover:shadow-md hover:-translate-y-0.5 group">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-2xs transition-transform group-hover:scale-105">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div className="space-y-1 flex-1 flex flex-col justify-center">
                  <h3 className="font-display text-sm sm:text-base font-bold text-foreground">Performance</h3>
                  <p className="text-[11px] text-muted-foreground leading-snug max-w-[220px]">
                    Track LMS courses, competency modules, and performance reviews.
                  </p>
                </div>
                <Button asChild size="sm" className="px-5 h-7 rounded bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-[11px] shadow-xs">
                  <Link to="/employee/ess" search={{ category: "Performance" }}>
                    View Details
                  </Link>
                </Button>
              </div>

              {/* Row 2, Col 2: Company Documents */}
              <div className="rounded-xl border border-primary/20 bg-card p-4 min-h-[175px] flex flex-col items-center text-center justify-between gap-2.5 transition-all hover:border-primary hover:shadow-md hover:-translate-y-0.5 group">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-2xs transition-transform group-hover:scale-105">
                  <FileCheck className="h-5 w-5" />
                </div>
                <div className="space-y-1.5 flex-1 flex flex-col justify-center">
                  <h3 className="font-display text-sm sm:text-base font-bold text-foreground">Company Documents</h3>
                  <p className="text-[11px] text-muted-foreground leading-snug max-w-[220px]">
                    Request official Certificate of Employment (COE) and clearances.
                  </p>
                </div>
                <Button asChild size="sm" className="px-5 h-7 rounded bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-[11px] shadow-xs">
                  <Link to="/employee/ess" search={{ category: "Documents" }}>
                    View Details
                  </Link>
                </Button>
              </div>

              {/* Row 2, Col 3: Social Recognition */}
              <div className="rounded-xl border border-primary/20 bg-card p-4 min-h-[175px] flex flex-col items-center text-center justify-between gap-2.5 transition-all hover:border-primary hover:shadow-md hover:-translate-y-0.5 group">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-2xs transition-transform group-hover:scale-105">
                  <Award className="h-5 w-5" />
                </div>
                <div className="space-y-1 flex-1 flex flex-col justify-center">
                  <h3 className="font-display text-sm sm:text-base font-bold text-foreground">Social Recognition</h3>
                  <p className="text-[11px] text-muted-foreground leading-snug max-w-[220px]">
                    Send peer kudos, celebrate hotel values, and browse the Wall of Fame.
                  </p>
                </div>
                <Button asChild size="sm" className="px-5 h-7 rounded bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-[11px] shadow-xs">
                  <Link to="/employee/ess" search={{ category: "Recognition" }}>
                    View Details
                  </Link>
                </Button>
              </div>

              {/* Row 3, Col 1: Statutory Benefits */}
              <div className="rounded-xl border border-primary/20 bg-card p-4 min-h-[175px] flex flex-col items-center text-center justify-between gap-2.5 transition-all hover:border-primary hover:shadow-md hover:-translate-y-0.5 group">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-2xs transition-transform group-hover:scale-105">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="space-y-1 flex-1 flex flex-col justify-center">
                  <h3 className="font-display text-sm sm:text-base font-bold text-foreground">Benefits &amp; HMO</h3>
                  <p className="text-[11px] text-muted-foreground leading-snug max-w-[220px]">
                    Review SSS, PhilHealth, Pag-IBIG HDMF, and healthcare coverage.
                  </p>
                </div>
                <Button asChild size="sm" className="px-5 h-7 rounded bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-[11px] shadow-xs">
                  <Link to="/employee/ess" search={{ category: "Benefits" }}>
                    View Details
                  </Link>
                </Button>
              </div>

              {/* Row 3, Col 2: Shift Scheduling */}
              <div className="rounded-xl border border-primary/20 bg-card p-4 min-h-[175px] flex flex-col items-center text-center justify-between gap-2.5 transition-all hover:border-primary hover:shadow-md hover:-translate-y-0.5 group">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-2xs transition-transform group-hover:scale-105">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div className="space-y-1 flex-1 flex flex-col justify-center">
                  <h3 className="font-display text-sm sm:text-base font-bold text-foreground">Shift Scheduling</h3>
                  <p className="text-[11px] text-muted-foreground leading-snug max-w-[220px]">
                    Access weekly work rosters, duty schedules, and shift swaps.
                  </p>
                </div>
                <Button asChild size="sm" className="px-5 h-7 rounded bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-[11px] shadow-xs">
                  <Link to="/employee/ess" search={{ category: "Schedule" }}>
                    View Details
                  </Link>
                </Button>
              </div>

              {/* Row 3, Col 3: HR AI Concierge */}
              <div className="rounded-xl border border-primary/40 bg-gradient-to-b from-primary/5 via-card to-card p-4 min-h-[175px] flex flex-col items-center text-center justify-between gap-2.5 transition-all hover:border-primary hover:shadow-md hover:-translate-y-0.5 group">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-2xs transition-transform group-hover:scale-105">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="space-y-1 flex-1 flex flex-col justify-center">
                  <h3 className="font-display text-sm sm:text-base font-bold text-foreground flex items-center justify-center gap-1.5">
                    HR AI Concierge
                  </h3>
                  <p className="text-[11px] text-muted-foreground leading-snug max-w-[220px]">
                    24/7 automated assistant for policy, leave &amp; payout questions.
                  </p>
                </div>
                <Button asChild size="sm" className="px-5 h-7 rounded bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-[11px] shadow-xs">
                  <Link to="/employee/ai">
                    View Details
                  </Link>
                </Button>
              </div>
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
                <p className="mt-1 text-lg font-bold font-display">{overview?.monthly_attendance?.present ?? 18} Present</p>
                <p className="text-xs text-muted-foreground">
                  {overview?.today_attendance?.time_in ? `In ${overview.today_attendance.time_in}` : "Not clocked in"} · {overview?.monthly_attendance?.late ?? 0} late
                </p>
              </Link>
              <Link to="/employee/ess" search={{ category: "Payroll" }} className="rounded-lg border border-border/70 bg-muted/20 p-3 transition-colors hover:border-primary/40 hover:bg-primary/5">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <FileText className="h-3.5 w-3.5 text-emerald-600" /> Payroll
                </div>
                <p className="mt-1 text-lg font-bold font-display">₱{netPay.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Next payout {nextPayoutDate}</p>
              </Link>
              <Link to="/employee/ess" search={{ category: "Performance" }} className="rounded-lg border border-border/70 bg-muted/20 p-3 transition-colors hover:border-primary/40 hover:bg-primary/5">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <TrendingUp className="h-3.5 w-3.5 text-purple-600" /> Performance
                </div>
                <p className="mt-1 text-lg font-bold font-display">{lmsDone}/{lmsTotal} Courses</p>
                <p className="text-xs text-muted-foreground">{overview?.performance_summary?.competency_level ?? "Proficient"} rating</p>
              </Link>
              <Link to="/employee/ess" search={{ category: "Documents" }} className="rounded-lg border border-border/70 bg-muted/20 p-3 transition-colors hover:border-primary/40 hover:bg-primary/5">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <FileCheck className="h-3.5 w-3.5 text-blue-600" /> Documents
                </div>
                <p className="mt-1 text-lg font-bold font-display">{requests.filter((r) => r.category === "Documents" || r.type.includes("COE")).length || 3} Files</p>
                <p className="text-xs text-muted-foreground">{overview?.pending_requests_count ?? 0} active request(s)</p>
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
                <Award className="h-5 w-5 text-amber-500" />
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
                {(recognitions.length > 0 ? recognitions.slice(0, 3) : [
                  {
                    id: "rec-1",
                    sender: "Chef Antonio",
                    recipient: "Aldrex M. Cordon",
                    senderAvatar: "CA",
                    badge: "Teamwork & Malasakit",
                    badgeColor: "emerald",
                    message: "Maintained peak efficiency and spotless kitchen line standards during the Saturday banquet rush.",
                    reactions: { clap: 15, heart: 8, fire: 4, star: 6 },
                    timeAgo: "Today",
                  },
                  {
                    id: "rec-2",
                    sender: "Bullseur Santiago",
                    recipient: "Maria Santos",
                    senderAvatar: "BS",
                    badge: "Guest Delight",
                    badgeColor: "amber",
                    message: "Exceeded guest expectations with proactive check-in care and warm hospitality.",
                    reactions: { clap: 9, heart: 5, fire: 3, star: 12 },
                    timeAgo: "Yesterday",
                  },
                  {
                    id: "rec-3",
                    sender: "Ricardo Villanueva",
                    recipient: "Ana Ramos",
                    senderAvatar: "RV",
                    badge: "Going the Extra Mile",
                    badgeColor: "purple",
                    message: "Stepped up to assist guest concierge services seamlessly during peak afternoon check-outs.",
                    reactions: { clap: 11, heart: 6, fire: 5, star: 7 },
                    timeAgo: "2 days ago",
                  },
                ]).map((rec) => (
                  <div key={rec.id} className="rounded-xl border border-border/70 bg-muted/20 p-3 text-xs space-y-1.5 transition-colors hover:border-amber-500/40 hover:bg-amber-500/5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="h-6 w-6 rounded-full bg-primary/20 text-primary font-bold text-[10px] grid place-items-center shrink-0">
                          {rec.senderAvatar || rec.sender.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-semibold text-foreground truncate">{rec.sender}</span>
                        <span className="text-muted-foreground text-[11px]">→</span>
                        <span className="font-semibold text-primary truncate">{rec.recipient}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 shrink-0 ${
                          rec.badgeColor === "emerald"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                            : rec.badgeColor === "purple"
                            ? "bg-purple-500/10 text-purple-600 border-purple-500/30"
                            : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                        }`}
                      >
                        {rec.badge}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-[11px] line-clamp-2 leading-relaxed">
                      "{rec.message}"
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-0.5">
                      <span>👏 {rec.reactions?.clap ?? 0}</span>
                      <span>❤️ {rec.reactions?.heart ?? 0}</span>
                      <span>🔥 {rec.reactions?.fire ?? 0}</span>
                      <span className="ml-auto text-[10px] text-muted-foreground">{rec.timeAgo}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button asChild variant="outline" size="sm" className="mt-4 w-full sm:w-auto border-amber-500/30 hover:bg-amber-500/10 text-foreground font-semibold">
              <Link to="/employee/ess" search={{ category: "Recognition" }}>
                Give Kudos &amp; View Wall <Award className="ml-2 h-4 w-4 text-amber-500" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <AnnouncementsCard role="employee" />
      </div>
    </div>
  );
}
