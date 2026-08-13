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
} from "lucide-react";

import { AnnouncementsCard } from "@/components/portal/AnnouncementsCard";
import { PageHeader } from "@/components/portal/PageHeader";
import { StatCard } from "@/components/portal/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { myProfile, wireframeActivity } from "@/data/ess";

export const Route = createFileRoute("/employee/")({
  component: EmployeeDashboard,
});

function EmployeeDashboard() {
  const firstName = myProfile.name.split(" ")[0];
  const topActions = wireframeActivity.slice(0, 5);

  const pendingOnboardingTasks = [
    "Acknowledge Company Policies",
    "Accept Employment Agreement",
  ];

  return (
    <div>
      <PageHeader
        eyebrow={`${myProfile.position} · ${myProfile.department}`}
        title={`Good day, ${firstName} 👋`}
        description="Here's what's happening with your employment today."
        actions={
          <Button asChild>
            <Link to="/employee/ess">Go to ESS Management</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Department" value={myProfile.department} hint="Oxford Suites Makati" icon={Headset} tone="primary" />
        <StatCard label="Position" value={myProfile.position} hint="Probationary Status" icon={ClipboardCheck} tone="gold" />
      </div>

      {/* Quick Actions Grid (1 row with 2-column layout) */}
      <div className="mt-6">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="font-display text-xl font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
              <Button
                asChild
                variant="outline"
                className="h-auto flex-col items-start gap-2 p-4 text-left hover:border-primary hover:bg-primary/5 transition-all"
              >
                <Link to="/employee/ess?category=Attendance">
                  <div className="rounded-md bg-primary/10 p-2 text-primary">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Attendance</p>
                    <p className="text-xs text-muted-foreground font-normal">File time-in/out correction</p>
                  </div>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-auto flex-col items-start gap-2 p-4 text-left hover:border-primary hover:bg-primary/5 transition-all"
              >
                <Link to="/employee/ess?category=Payroll">
                  <div className="rounded-md bg-primary/10 p-2 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Payroll</p>
                    <p className="text-xs text-muted-foreground font-normal">Overtime &amp; payslip inquiry</p>
                  </div>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-auto flex-col items-start gap-2 p-4 text-left hover:border-primary hover:bg-primary/5 transition-all"
              >
                <Link to="/employee/ess?category=Documents">
                  <div className="rounded-md bg-primary/10 p-2 text-primary">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Document</p>
                    <p className="text-xs text-muted-foreground font-normal">COE, BIR 2316, clearances</p>
                  </div>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-auto flex-col items-start gap-2 p-4 text-left hover:border-primary hover:bg-primary/5 transition-all"
              >
                <Link to="/employee/ess?category=Performance">
                  <div className="rounded-md bg-primary/10 p-2 text-primary">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Performance &amp; Promotion</p>
                    <p className="text-xs text-muted-foreground font-normal">Review goals &amp; apply</p>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Onboarding Progress Card */}
        <Card className="border-border/70 flex flex-col justify-between">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 font-display text-xl font-semibold">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              Onboarding Progress
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1 font-medium">
                <span>Overall Progress</span>
                <span className="text-primary font-semibold">60% complete</span>
              </div>
              <Progress value={60} className="h-2.5" />
            </div>

            <div className="mt-4 space-y-2 text-sm border-t border-border pt-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Overall progress</span>
                <span className="font-semibold">60% complete</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pending requirements</span>
                <span className="font-semibold">{pendingOnboardingTasks.length} items remaining</span>
              </div>
            </div>

            <Button asChild size="sm" className="mt-5 w-full sm:w-auto">
              <Link to="/employee/onboarding">
                Continue Onboarding <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Actions Card (Replaces ESS Overview) */}
        <Card className="border-border/70 flex flex-col justify-between">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-display text-xl font-semibold">
                <Activity className="h-5 w-5 text-primary" />
                Recent Actions
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                Top 5 Latest
              </Badge>
            </div>

            <div className="mt-4 space-y-3">
              {/* Top 5 latest actions list */}
              <div className="space-y-2">
                {topActions.map((act, index) => (
                  <div key={index} className="flex items-center justify-between text-xs sm:text-sm border-b border-border/50 pb-1.5">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="font-medium text-foreground truncate">{act.type}</span>
                      <span className="text-xs text-muted-foreground shrink-0">({act.category})</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground">{act.date}</span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 ${
                          act.status === "Pending"
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                            : act.status === "Approved"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                            : "bg-blue-500/10 text-blue-600 border-blue-500/30"
                        }`}
                      >
                        {act.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              {/* Unfinished onboarding section */}
              {pendingOnboardingTasks.length > 0 && (
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 mt-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-300">
                    <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                    Unfinished Onboarding Tasks ({pendingOnboardingTasks.length})
                  </div>
                  <ul className="mt-1 space-y-0.5 text-xs text-amber-700 dark:text-amber-400 pl-6 list-disc">
                    {pendingOnboardingTasks.map((task, i) => (
                      <li key={i}>{task}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <Button asChild variant="outline" size="sm" className="mt-4 w-full sm:w-auto">
              <Link to="/employee/ess">
                View All Actions <ArrowRight className="ml-2 h-4 w-4" />
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


