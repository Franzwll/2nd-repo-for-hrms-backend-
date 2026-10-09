import { useState, useEffect, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Clock,
  ClipboardList,
  FileText,
  TrendingUp,
  FileCheck,
  ClipboardCheck,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Award,
  Bot,
  HeartHandshake,
  Shield,
  Share2,
} from "lucide-react";
import { toast } from "sonner";

import { AnnouncementsCard } from "@/components/portal/AnnouncementsCard";
import { PageHeader } from "@/components/portal/PageHeader";
import { StatCard } from "@/components/portal/StatCard";
import {
  ListSkeleton,
  StatCardsSkeleton,
} from "@/components/ui/loading-skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  essApi,
  newHiresApi,
  onboardingItemsApi,
  type ApiEssOverview,
  type ApiRecognitionItem,
} from "@/lib/api";
import { getUser } from "@/lib/auth";

export const Route = createFileRoute("/employee/")({
  component: EmployeeDashboard,
});

function EmployeeDashboard() {
  // getUser() reads browser storage, which is absent during server render —
  // resolving it after mount keeps server and client HTML identical.
  const [authUser, setAuthUser] = useState<ReturnType<typeof getUser>>(null);
  useEffect(() => {
    setAuthUser(getUser());
  }, []);
  const user = authUser;
  const [overview, setOverview] = useState<ApiEssOverview | null>(null);
  const [recognitions, setRecognitions] = useState<ApiRecognitionItem[]>([]);
  const [pendingTasks, setPendingTasks] = useState<string[]>([]);
  const [loadingOnboarding, setLoadingOnboarding] = useState(true);
  const [wasInOnboarding, setWasInOnboarding] = useState(false);
  const [loadingRecognitions, setLoadingRecognitions] = useState(true);
  /** True while the ESS overview request is in flight. */
  const loadingOverview = overview === null;

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
      .catch(() => { });

    // 2. Fetch Social Recognitions
    essApi
      .recognitions()
      .then((res) => {
        if (res.recognitions) {
          setRecognitions(res.recognitions);
        }
      })
      .catch(() => { })
      .finally(() => setLoadingRecognitions(false));

    // 3. Fetch Onboarding Tasks (only shows the authenticated employee's own tasks)
    newHiresApi
      .list({ per_page: 100 })
      .then((res) => {
        const mine =
          res.data.find(
            (h) =>
              (user?.employee_id && h.employee_id === user.employee_id) ||
              h.name.toLowerCase() === employeeName.toLowerCase() ||
              h.email === user?.email
          ) ?? null;

        if (!mine) {
          setPendingTasks([]);
          return;
        }

        setWasInOnboarding(true);
        return onboardingItemsApi.listForNewHire(mine.new_hire_id).then((items) => {
          const uncompleted = items.filter((i) => !i.done).map((i) => i.item_text);
          setPendingTasks(uncompleted);
        });
      })
      .catch(() => {
        setPendingTasks([]);
      })
      .finally(() => setLoadingOnboarding(false));
  }, [employeeName, user?.employee_id, user?.email]);

  const shiftBadgeText = overview?.today_schedule?.is_rest_day
    ? "Rest Day (Off Duty)"
    : `On Shift (${overview?.today_schedule?.time || "07:00 AM – 04:00 PM"})`;

  const handleReact = async (recId: string, reaction: "clap" | "heart" | "star" | "fire") => {
    setRecognitions((prev) =>
      prev.map((r) => {
        if (r.id === recId) {
          const reactions = { ...(r.reactions || { clap: 0, heart: 0, star: 0, fire: 0 }) };
          reactions[reaction] = (reactions[reaction] || 0) + 1;
          return { ...r, reactions };
        }
        return r;
      })
    );

    try {
      const res = await essApi.reactKudos(recId, reaction);
      if (res?.reactions) {
        setRecognitions((prev) =>
          prev.map((r) => (r.id === recId ? { ...r, reactions: res.reactions as { clap: number; heart: number; fire: number; star: number } } : r))
        );
      }
    } catch {
      // Handled gracefully
    }
  };

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
        title={`${greeting}, ${firstName}`}
        description="Here's what's happening with your employment today."
      />

      {/* Onboarding Checklist Banner (Displays when employee has pending onboarding items) */}
      {!loadingOnboarding && pendingTasks.length > 0 && (
        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600">
                <AlertCircle className="h-5 w-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm text-foreground">
                    Onboarding Checklist Pending
                  </h3>
                  <Badge variant="outline" className="bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/40 text-[10px]">
                    {pendingTasks.length} task{pendingTasks.length > 1 ? "s" : ""} left
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Please complete your required onboarding submissions and document acknowledgments.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {pendingTasks.slice(0, 3).map((task, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-[11px] rounded-md bg-background/80 px-2 py-0.5 border border-border text-foreground"
                    >
                      <CheckCircle2 className="h-3 w-3 text-amber-600 shrink-0" />
                      {task}
                    </span>
                  ))}
                  {pendingTasks.length > 3 && (
                    <span className="text-[11px] text-muted-foreground self-center">
                      +{pendingTasks.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Button asChild size="sm" variant="outline" className="border-amber-500/40 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 shrink-0 text-xs h-8">
              <Link to="/employee/onboarding">
                Complete Onboarding <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Onboarding Complete — ESS transition banner */}
      {!loadingOnboarding && wasInOnboarding && pendingTasks.length === 0 && (
        <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold text-sm text-foreground">Onboarding Complete! 🎉</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  All requirements submitted and verified. Welcome to the Oxford Suites Makati team!
                </p>
              </div>
            </div>
            <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 text-xs h-8">
              <Link to="/employee/ess">
                Explore ESS Portal <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      {loadingOverview ? (
        <StatCardsSkeleton count={4} />
      ) : (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Leave Balance"
          value={`${availableLeaves} days`}
          hint="Available paid leave credits"
          icon={Clock}
          tone="primary"
          to="/employee/ess?category=Attendance"
        />
        <StatCard
          label="Take-Home Pay"
          value={`₱${netPay.toLocaleString()}`}
          hint={`Next payout ${nextPayoutDate}`}
          icon={FileText}
          tone="success"
          to="/employee/ess?category=Payroll"
        />
        <StatCard
          label="LMS Training"
          value={`${lmsDone}/${lmsTotal}`}
          hint={`${overview?.performance_summary?.competency_level ?? "Proficient"} competency`}
          icon={TrendingUp}
          tone="primary"
          to="/employee/ess?category=Performance"
        />
        <StatCard label="Position" value={position} hint={employmentType} icon={ClipboardCheck} tone="gold" to="/employee/ess" />
        </div>
      )}

      {/* Quick Actions in a compact single row */}
      <div className="mt-6">
        <Card className="border-border/70 shadow-xs">
          <CardHeader className="py-3 px-4 sm:px-6">
            <CardTitle className="font-display text-sm font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-6 pt-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-2.5">
              {/* 1: Attendance */}
              <Link
                to="/employee/ess"
                search={{ category: "Attendance" }}
                className="rounded-lg border border-primary/20 bg-card hover:bg-primary/5 hover:border-primary py-2.5 px-2 flex flex-col items-center justify-center text-center gap-1.5 transition-all hover:shadow-2xs group cursor-pointer"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/15 transition-transform group-hover:scale-105">
                  <Clock className="h-4 w-4" />
                </div>
                <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate max-w-full">
                  Attendance
                </span>
              </Link>

              {/* 2: Payroll */}
              <Link
                to="/employee/ess"
                search={{ category: "Payroll" }}
                className="rounded-lg border border-primary/20 bg-card hover:bg-primary/5 hover:border-primary py-2.5 px-2 flex flex-col items-center justify-center text-center gap-1.5 transition-all hover:shadow-2xs group cursor-pointer"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/15 transition-transform group-hover:scale-105">
                  <FileText className="h-4 w-4" />
                </div>
                <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate max-w-full">
                  Payroll
                </span>
              </Link>

              {/* 3: Performance */}
              <Link
                to="/employee/ess"
                search={{ category: "Performance" }}
                className="rounded-lg border border-primary/20 bg-card hover:bg-primary/5 hover:border-primary py-2.5 px-2 flex flex-col items-center justify-center text-center gap-1.5 transition-all hover:shadow-2xs group cursor-pointer"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/15 transition-transform group-hover:scale-105">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate max-w-full">
                  Performance
                </span>
              </Link>

              {/* 4: Documents */}
              <Link
                to="/employee/ess"
                search={{ category: "Documents" }}
                className="rounded-lg border border-primary/20 bg-card hover:bg-primary/5 hover:border-primary py-2.5 px-2 flex flex-col items-center justify-center text-center gap-1.5 transition-all hover:shadow-2xs group cursor-pointer"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/15 transition-transform group-hover:scale-105">
                  <FileCheck className="h-4 w-4" />
                </div>
                <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate max-w-full">
                  Documents
                </span>
              </Link>

              {/* 5: Recognition */}
              <Link
                to="/employee/ess"
                search={{ category: "Recognition" }}
                className="rounded-lg border border-primary/20 bg-card hover:bg-primary/5 hover:border-primary py-2.5 px-2 flex flex-col items-center justify-center text-center gap-1.5 transition-all hover:shadow-2xs group cursor-pointer"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/15 transition-transform group-hover:scale-105">
                  <Award className="h-4 w-4" />
                </div>
                <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate max-w-full">
                  Recognition
                </span>
              </Link>


              {/* 6: HR AI Concierge */}
              <Link
                to="/employee/ai"
                className="rounded-lg border border-primary/30 bg-gradient-to-b from-primary/10 to-card hover:bg-primary/15 hover:border-primary py-2.5 px-2 flex flex-col items-center justify-center text-center gap-1.5 transition-all hover:shadow-2xs group cursor-pointer"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-2xs transition-transform group-hover:scale-105">
                  <Bot className="h-4 w-4" />
                </div>
                <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate max-w-full">
                  AI Concierge
                </span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Social Recognition & Wall of Fame Card */}
        <Card className="border-border/70 flex flex-col justify-between shadow-xs">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-display text-xl font-semibold">
                <Award className="h-5 w-5 text-primary" />
                Social Recognition
              </div>
              <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary/90 hover:bg-primary/5 font-semibold text-xs">
                <Link to="/employee/ess" search={{ category: "Recognition" }}>
                  Wall of Fame <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              {/* Highlight Shoutouts */}
              {loadingRecognitions ? (
                <ListSkeleton items={3} />
              ) : (
              <div className="space-y-2.5">
                {(recognitions.length > 0 ? recognitions.slice(0, 3) : [
                  {
                    id: "rec-1",
                    sender: "Chef Antonio",
                    recipient: "Aldrex M. Cordon",
                    senderAvatar: "CA",
                    recipientAvatar: "AC",
                    badge: "Teamwork & Malasakit",
                    message: "Maintained peak efficiency and spotless kitchen line standards during the Saturday banquet rush.",
                    reactions: { clap: 15, heart: 8, star: 6, fire: 4 },
                    timeAgo: "Today",
                  },
                  {
                    id: "rec-2",
                    sender: "Bullseur Santiago",
                    recipient: "Maria Santos",
                    senderAvatar: "BS",
                    recipientAvatar: "MS",
                    badge: "Guest Delight",
                    message: "Exceeded guest expectations with proactive check-in care and warm Filipino hospitality.",
                    reactions: { clap: 9, heart: 5, star: 12, fire: 3 },
                    timeAgo: "Yesterday",
                  },
                  {
                    id: "rec-3",
                    sender: "Ricardo Villanueva",
                    recipient: "Ana Ramos",
                    senderAvatar: "RV",
                    recipientAvatar: "AR",
                    badge: "Going the Extra Mile",
                    message: "Stepped up to assist guest concierge services seamlessly during peak afternoon check-outs.",
                    reactions: { clap: 11, heart: 6, star: 7, fire: 5 },
                    timeAgo: "2 days ago",
                  },
                ]).map((rec) => (
                  <div
                    key={rec.id}
                    className="rounded-xl border border-border/80 bg-card p-3 text-xs space-y-2 transition-all hover:border-primary/40 hover:shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="h-6 w-6 rounded-full bg-muted text-foreground border border-border/80 font-bold text-[10px] grid place-items-center shrink-0">
                          {rec.senderAvatar || rec.sender.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-semibold text-foreground truncate">{rec.sender}</span>
                        <span className="text-muted-foreground text-[10px]">recognized</span>
                        <span className="font-semibold text-primary truncate">{rec.recipient}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[10px] px-2 py-0.5 shrink-0 bg-primary/10 text-primary border-primary/30 font-medium"
                      >
                        {rec.badge}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-[11px] line-clamp-2 leading-relaxed bg-muted/20 p-2 rounded-lg border border-border/40">
                      "{rec.message}"
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pt-0.5">
                      <button
                        type="button"
                        onClick={() => handleReact(rec.id, "clap")}
                        className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/30 px-2 py-0.5 hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-colors cursor-pointer"
                        title="Send Claps"
                      >
                        👏 {rec.reactions?.clap ?? 0}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReact(rec.id, "heart")}
                        className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/30 px-2 py-0.5 hover:bg-rose-500/10 hover:border-rose-500/40 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Send Heart"
                      >
                        ❤️ {rec.reactions?.heart ?? 0}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReact(rec.id, "star")}
                        className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/30 px-2 py-0.5 hover:bg-amber-500/10 hover:border-amber-500/40 hover:text-amber-600 transition-colors cursor-pointer"
                        title="Send Star"
                      >
                        ⭐ {rec.reactions?.star ?? 0}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReact(rec.id, "fire")}
                        className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/30 px-2 py-0.5 hover:bg-orange-500/10 hover:border-orange-500/40 hover:text-orange-600 transition-colors cursor-pointer"
                        title="Send Fire"
                      >
                        🔥 {rec.reactions?.fire ?? 0}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const citation = `⭐ [${rec.badge}] ${rec.recipient} recognized by ${rec.sender}: "${rec.message}" — Oxford Suites Wall of Fame`;
                          if (navigator?.clipboard?.writeText) {
                            navigator.clipboard.writeText(citation).then(() => {
                              toast.success("Praise citation copied to clipboard! 📋");
                            }).catch(() => {
                              toast.info(citation);
                            });
                          } else {
                            toast.info(citation);
                          }
                        }}
                        className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 hover:bg-muted hover:border-primary/40 hover:text-primary transition-colors cursor-pointer text-muted-foreground ml-auto"
                        title="Share praise citation"
                      >
                        <Share2 className="h-3 w-3" />
                        <span>Share</span>
                      </button>
                      <span className="text-[10px] text-muted-foreground">{rec.timeAgo}</span>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>

            <Button asChild size="sm" className="mt-4 w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs shadow-xs">
              <Link to="/employee/ess" search={{ category: "Recognition" }}>
                Explore Wall of Fame <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Announcements & Bulletins Card */}
        <AnnouncementsCard role="employee" />
      </div>
    </div>
  );
}
