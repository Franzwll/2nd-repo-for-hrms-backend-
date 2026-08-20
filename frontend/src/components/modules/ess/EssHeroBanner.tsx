import { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { myProfile } from "@/data/ess";
import { essApi, type ApiEssOverview } from "@/lib/api";
import { getUser } from "@/lib/auth";

export function EssHeroBanner() {
  const user = getUser();
  const [time, setTime] = useState(new Date());
  const [overview, setOverview] = useState<ApiEssOverview | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    essApi.overview().then(setOverview).catch(() => {});
  }, []);

  const greeting = useMemo(() => {
    const hour = time.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, [time]);

  const employeeName = overview?.employee?.name || user?.full_name || myProfile.name;
  const firstName = employeeName.split(" ")[0];
  const position = overview?.employee?.position || myProfile.position;
  const department = overview?.employee?.department || user?.department_name || myProfile.department;
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
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
            {greeting}, {firstName} 👋
          </h2>

          <p className="text-xs sm:text-sm text-muted-foreground">
            {position} · {department} · Supervisor: {supervisor}
          </p>
        </div>

        {/* Right: Live Digital Clock */}
        <div className="rounded-xl border border-border/80 bg-background/80 backdrop-blur-xs px-5 py-3 shadow-xs text-left sm:text-right self-start sm:self-auto">
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{dateString}</p>
          <p className="font-mono text-2xl sm:text-3xl font-bold text-primary">{timeString}</p>
        </div>
      </div>
    </div>
  );
}
