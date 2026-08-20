import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, FileText, FileCheck, ArrowRight, ShieldCheck } from "lucide-react";
import { myProfile } from "@/data/ess";
import { essApi, type ApiEssOverview } from "@/lib/api";

interface EssHeroBannerProps {
  onOpenClock: () => void;
  onOpenLeave: () => void;
  onOpenPayslip: () => void;
  onOpenDocRequest: () => void;
}

export function EssHeroBanner({
  onOpenClock,
  onOpenLeave,
  onOpenPayslip,
  onOpenDocRequest,
}: EssHeroBannerProps) {
  const [time, setTime] = useState(new Date());
  const [overview, setOverview] = useState<ApiEssOverview | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    essApi.overview().then(setOverview).catch(() => {});
  }, []);

  const employeeName = overview?.employee?.name || myProfile.name;
  const firstName = employeeName.split(" ")[0];
  const position = overview?.employee?.position || myProfile.position;
  const department = overview?.employee?.department || myProfile.department;
  const supervisor = overview?.employee?.supervisor || myProfile.supervisor;
  const shiftText = overview?.today_schedule?.is_rest_day
    ? "Rest Day (Off Duty)"
    : `On Shift (${overview?.today_schedule?.time || "07:00 AM – 04:00 PM"})`;

  const timeString = time.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const dateString = time.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-primary/5 p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        {/* Left: Employee Info & Live Status */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 gap-1.5 py-0.5 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {shiftText}
            </Badge>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
              {myProfile.branch}
            </Badge>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-foreground">
            Welcome back, {firstName} 👋
          </h2>

          <p className="text-xs sm:text-sm text-muted-foreground">
            {position} · {department} · Supervisor: {supervisor}
          </p>
        </div>

        {/* Right: Live Digital Clock & Quick Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="rounded-xl border border-border/80 bg-background/80 backdrop-blur-xs px-4 py-2.5 shadow-xs text-left sm:text-right">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{dateString}</p>
            <p className="font-mono text-xl sm:text-2xl font-bold text-primary">{timeString}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
            <Button
              size="sm"
              className="gap-1.5 shadow-xs bg-primary text-primary-foreground font-medium text-xs"
              onClick={onOpenClock}
            >
              <Clock className="h-3.5 w-3.5" /> Web Clocking
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-border hover:border-primary/50 text-xs"
              onClick={onOpenLeave}
            >
              <Calendar className="h-3.5 w-3.5 text-primary" /> Apply Leave
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-border hover:border-primary/50 text-xs"
              onClick={onOpenPayslip}
            >
              <FileText className="h-3.5 w-3.5 text-emerald-600" /> Latest Payslip
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-border hover:border-primary/50 text-xs"
              onClick={onOpenDocRequest}
            >
              <FileCheck className="h-3.5 w-3.5 text-blue-600" /> Request COE
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
