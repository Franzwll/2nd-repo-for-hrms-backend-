import { useState, useMemo, useEffect } from "react";
import {
  Calendar,
  Clock,
  FileText,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
  Sparkles,
  ShieldCheck,
  Building2,
  Check,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/portal/StatCard";
import { ListBody } from "@/components/portal/ListBody";
import { ListEmptyState } from "@/components/portal/ListEmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TablePagination } from "@/components/ui/table-pagination";
import { StatCardsSkeleton } from "@/components/ui/loading-skeletons";
import { EssStatusBadge } from "@/components/modules/ess/shared/EssStatusBadge";
import { myAttendance } from "@/data/ess";
import { ScheduleRecordsModal } from "@/components/modules/ess/modals/ScheduleRecordsModal";
import { essApi, type ApiScheduleDay, type ApiEssEmployee } from "@/lib/api";

interface EssAttendanceTabProps {
  initialTab?: "clocking" | "roster" | "schedule";
}

const DEFAULT_ROSTER: ApiScheduleDay[] = [
  {
    day: "Monday",
    shift: "Morning Shift",
    time: "07:00 AM – 04:00 PM",
    hours: "8.0h (1h break)",
    location: "Main Kitchen · Line 1",
  },
  {
    day: "Tuesday",
    shift: "Morning Shift",
    time: "07:00 AM – 04:00 PM",
    hours: "8.0h (1h break)",
    location: "Main Kitchen · Line 1",
  },
  {
    day: "Wednesday",
    shift: "Morning Shift",
    time: "07:00 AM – 04:00 PM",
    hours: "8.0h (1h break)",
    location: "Main Kitchen · Line 1",
  },
  {
    day: "Thursday",
    shift: "Mid Shift",
    time: "02:00 PM – 11:00 PM",
    hours: "8.0h (1h break)",
    location: "Main Kitchen · Pastry Prep",
  },
  {
    day: "Friday",
    shift: "Night Shift",
    time: "11:00 PM – 07:00 AM",
    hours: "8.0h (1h break)",
    location: "Main Kitchen · Night Prep",
  },
  { day: "Saturday", shift: "Rest Day", time: "Off Duty", hours: "0h", location: "Off Duty" },
  { day: "Sunday", shift: "Rest Day", time: "Off Duty", hours: "0h", location: "Off Duty" },
];

/**
 * Returns visual metadata (Sun, Moon, Sunset, or Bed) based on shift name and time
 */
function getShiftVisual(shift: string, time: string) {
  const s = (shift || "").toLowerCase();
  const t = (time || "").toLowerCase();

  const isRest = s.includes("rest") || s.includes("off") || t.includes("off");
  if (isRest) {
    return {
      type: "rest" as const,
      label: "Rest Day",
      tag: "Off Duty",
      themeBorder: "border-slate-500/25 dark:border-slate-400/20",
      themeBg: "bg-muted/30",
      themeAccent: "from-slate-500/10 to-transparent dark:from-slate-400/10",
      badgeColor: "bg-muted text-muted-foreground border-border/80",
      iconSvg: (
        <div className="p-3 rounded-2xl bg-muted/60 text-muted-foreground border border-border/70 shadow-2xs">
          <svg
            className="h-8 w-8 text-muted-foreground/70"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 4v16" />
            <path d="M2 8h18a2 2 0 0 1 2 2v10" />
            <path d="M2 17h20" />
            <path d="M6 8v9" />
          </svg>
        </div>
      ),
    };
  }

  const isNight =
    s.includes("night") ||
    s.includes("graveyard") ||
    s.includes("closing") ||
    t.includes("10:00 pm") ||
    t.includes("11:00 pm") ||
    t.includes("12:00 am") ||
    t.includes("01:00 am") ||
    (s.includes("pm") && !s.includes("am") && !s.includes("mid") && !s.includes("afternoon"));

  if (isNight) {
    return {
      type: "night" as const,
      label: "Night Shift",
      tag: "Evening / Night",
      themeBorder: "border-indigo-500/35 dark:border-indigo-400/25",
      themeBg: "bg-indigo-500/5 dark:bg-indigo-400/10",
      themeAccent: "from-indigo-500/15 via-purple-500/5 to-transparent dark:from-indigo-400/10 dark:via-purple-400/5",
      badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30 dark:bg-indigo-400/10 dark:border-indigo-400/20",
      iconSvg: (
        <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 shadow-xs dark:bg-indigo-400/10 dark:border-indigo-400/20">
          <svg
            className="h-8 w-8 text-indigo-400 drop-shadow-sm"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="currentColor" fillOpacity="0.25" />
            <path d="M19 3v4" />
            <path d="M21 5h-4" />
          </svg>
        </div>
      ),
    };
  }

  const isMid =
    s.includes("mid") ||
    s.includes("afternoon") ||
    t.includes("02:00 pm") ||
    t.includes("03:00 pm");
  if (isMid) {
    return {
      type: "mid" as const,
      label: "Mid Shift",
      tag: "Afternoon",
      themeBorder: "border-orange-500/35 dark:border-orange-400/25",
      themeBg: "bg-orange-500/5 dark:bg-orange-400/10",
      themeAccent: "from-orange-500/15 via-amber-500/5 to-transparent dark:from-orange-400/10 dark:via-amber-400/5",
      badgeColor: "bg-orange-500/10 text-orange-500 border-orange-500/30 dark:bg-orange-400/10 dark:text-orange-400 dark:border-orange-400/20",
      iconSvg: (
        <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500 border border-orange-500/30 shadow-xs dark:bg-orange-400/10 dark:text-orange-400 dark:border-orange-400/20">
          <svg
            className="h-8 w-8 text-orange-500 dark:text-orange-400 drop-shadow-sm"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2v6" />
            <path d="m4.93 10.93 1.41 1.41" />
            <path d="M20 18h2" />
            <path d="M2 18h2" />
            <path d="m19.07 10.93-1.41 1.41" />
            <path d="M22 22H2" />
            <path d="m8 6 4-4 4 4" />
            <path d="M16 18a4 4 0 0 0-8 0" />
          </svg>
        </div>
      ),
    };
  }

  // Default: Day / Morning Shift with Sun SVG
  return {
    type: "day" as const,
    label: "Day Shift",
    tag: "Morning / AM",
    themeBorder: "border-amber-500/35 dark:border-amber-400/25",
    themeBg: "bg-amber-500/5 dark:bg-amber-400/10",
    themeAccent: "from-amber-500/15 via-primary/5 to-transparent dark:from-amber-400/10",
    badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/30 dark:bg-amber-400/10 dark:text-amber-400 dark:border-amber-400/20",
    iconSvg: (
      <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/30 shadow-xs dark:bg-amber-400/10 dark:text-amber-400 dark:border-amber-400/20">
        <svg
          className="h-8 w-8 text-amber-500 dark:text-amber-400 drop-shadow-sm"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.25" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      </div>
    ),
  };
}

export function EssAttendanceTab(_props: EssAttendanceTabProps) {
  // Live Clock Terminal State — client-only (null until mounted so SSR HTML matches).
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [currentDutyStatus, setCurrentDutyStatus] = useState<
    "clocked_in" | "on_break" | "clocked_out"
  >("clocked_in");
  const [punchLog, setPunchLog] = useState({
    timeIn: myAttendance.today.timeIn || "07:52 AM",
    breakIn: myAttendance.today.breakIn || "12:00 PM",
    breakOut: myAttendance.today.breakOut || "12:58 PM",
    timeOut: myAttendance.today.timeOut !== "—" ? myAttendance.today.timeOut : "—",
  });

  // Attendance summary & history
  const [attSummary, setAttSummary] = useState({
    present_days: 18,
    leave_days: 0,
    average_hours: 8.0,
  });
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(true);

  // Schedule state
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [employeeInfo, setEmployeeInfo] = useState<ApiEssEmployee | null>(null);
  const [roster, setRoster] = useState<ApiScheduleDay[]>(DEFAULT_ROSTER);

  // TRY: top-right records modal — remove state if not applicable
  const [recordsModalOpen, setRecordsModalOpen] = useState(false);

  // Clock Ticker — starts after mount so SSR HTML matches (no hydration mismatch).
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    // Attendance Logs
    essApi
      .myAttendance()
      .then((res) => {
        if (res?.records) {
          setAttendanceLogs(res.records);
          if (res.records[0]) {
            const rec = res.records[0];
            setPunchLog((prev) => ({
              ...prev,
              timeIn: rec.timeIn || prev.timeIn,
              timeOut: rec.timeOut || prev.timeOut,
            }));
          }
        }
        if (res?.summary) {
          setAttSummary(res.summary);
        }
      })
      .catch(() => {})
      .finally(() => setAttendanceLoading(false));

    // Schedule Roster
    try {
      setScheduleLoading(true);
      const schedRes = await essApi.schedule();
      if (schedRes?.employee) setEmployeeInfo(schedRes.employee);
      if (schedRes?.weekly_roster && schedRes.weekly_roster.length > 0) {
        setRoster(schedRes.weekly_roster);
      }
    } catch {
      // fallback retained
    } finally {
      setScheduleLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formattedTime = currentTime
    ? currentTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    : "--:--:--";

  const formattedDate = currentTime
    ? currentTime.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Loading…";

  const todayDayName = currentTime
    ? currentTime.toLocaleDateString("en-US", { weekday: "long" })
    : "";

  // DTR history — admin-consistent searchable + paginated table
  const dtrRecords = useMemo(() => {
    if (attendanceLogs.length > 0) return attendanceLogs;
    return myAttendance.history.map((h) => ({
      date: h.date,
      timeIn: h.in,
      timeOut: h.out,
      workedHours: h.hours,
      status: h.remark.includes("Present")
        ? "Present"
        : h.remark.includes("Late")
          ? "Late"
          : h.remark,
    }));
  }, [attendanceLogs]);

  return (
    <div className="space-y-6">
      {/* Metric cards — admin-consistent placement above tabs */}
      {attendanceLoading ? (
        <StatCardsSkeleton count={2} />
      ) : (
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Present Days"
          value={attSummary.present_days}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label="Leave Days"
          value={attSummary.leave_days}
          icon={AlertCircle}
          tone="primary"
        />
      </div>
      )}

      <div className="mt-6 space-y-4">
        <Card className="border-border/70 shadow-xs">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                <Clock className="h-4 w-4 text-primary" /> Attendance &amp; Schedule
              </h2>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Badge
                  variant="outline"
                  className="border-primary/30 bg-primary/5 text-primary text-xs font-medium px-2.5 py-1"
                >
                  Station Active
                </Badge>
                {currentDutyStatus === "clocked_in" && (
                  <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 dark:bg-emerald-400/10 dark:border-emerald-400/20 gap-1.5 px-3 py-1 text-xs font-semibold">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Currently On Duty
                  </Badge>
                )}
                {currentDutyStatus === "on_break" && (
                  <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 dark:bg-amber-400/10 dark:border-amber-400/20 gap-1.5 px-3 py-1 text-xs font-semibold">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    On Lunch / Meal Break
                  </Badge>
                )}
                {currentDutyStatus === "clocked_out" && (
                  <Badge className="bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30 dark:bg-slate-400/10 dark:border-slate-400/20 gap-1.5 px-3 py-1 text-xs font-semibold">
                    Shift Completed / Clocked Out
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {/* Terminal Body */}
              <div className="grid gap-6 lg:grid-cols-12">
                {/* Left Column: Live Clock + Web Clocking Action Buttons (7 Cols) */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                  {/* Giant Live Clock Display */}
                  <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-muted/20 p-6 text-center shadow-xs">
                    <p className="text-xs uppercase font-semibold text-muted-foreground tracking-widest">
                      {formattedDate}
                    </p>
                    <div className="my-2.5">
                      <span className="text-5xl sm:text-6xl font-extrabold font-mono tracking-tight text-foreground drop-shadow-xs">
                        {formattedTime}
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-background border border-border/80 px-3.5 py-1 text-xs text-muted-foreground">
                      <span>Active Station Mode:</span>
                      <span className="font-semibold text-foreground">
                        {currentDutyStatus === "clocked_out"
                          ? "Shift Concluded"
                          : "Live Biometric Clocking"}
                      </span>
                    </div>
                  </div>

                  {/* Today's Punch Summary Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-xl border border-border/80 p-3 bg-muted/20 text-center shadow-2xs">
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                        Time In
                      </p>
                      <p className="font-bold text-foreground mt-1 text-sm font-mono">
                        {punchLog.timeIn}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border/80 p-3 bg-muted/20 text-center shadow-2xs">
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                        Break Out
                      </p>
                      <p className="font-bold text-foreground mt-1 text-sm font-mono">
                        {punchLog.breakIn}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border/80 p-3 bg-muted/20 text-center shadow-2xs">
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                        Break In
                      </p>
                      <p className="font-bold text-foreground mt-1 text-sm font-mono">
                        {punchLog.breakOut}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border/80 p-3 bg-muted/20 text-center shadow-2xs">
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                        Time Out
                      </p>
                      <p className="font-bold text-foreground mt-1 text-sm font-mono">
                        {punchLog.timeOut}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column: Station Verification & Shift Info (5 Cols) */}
                <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-border/70 bg-muted/20 p-5 shadow-2xs">
                  <div>
                    <div className="flex items-center justify-between pb-3.5 border-b border-border/60">
                      <h4 className="font-display text-sm font-semibold text-foreground">
                        Station Verification &amp; Shift Info
                      </h4>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-400/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 dark:border-emerald-400/20">
                        Verified
                      </span>
                    </div>

                    <div className="space-y-2.5 pt-3.5 text-xs">
                      <div className="flex items-center justify-between rounded-xl border border-border/60 p-3 bg-background/80">
                        <span className="text-muted-foreground font-medium">Assigned Shift:</span>
                        <span className="font-semibold text-foreground">
                          AM Shift (07:00 AM – 04:00 PM)
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-xl border border-border/60 p-3 bg-background/80">
                        <span className="text-muted-foreground font-medium">Geolocation:</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          Oxford Suites Makati (Main Kitchen) ✓
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-xl border border-border/60 p-3 bg-background/80">
                        <span className="text-muted-foreground font-medium">Supervisor:</span>
                        <span className="font-semibold text-foreground">
                          {employeeInfo?.supervisor || "Chef Marco D. Santos"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-xl border border-border/60 p-3 bg-background/80">
                        <span className="text-muted-foreground font-medium">Department:</span>
                        <span className="font-semibold text-foreground">
                          {employeeInfo?.department || "Kitchen / Culinary"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terminal Guidelines Footer */}
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 shrink-0">
                    <AlertCircle className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-semibold font-display text-foreground">
                      Clocking Guidelines
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground w-full lg:w-auto">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>Punctuality:</strong> 15-min grace period compliant past shift
                        start.
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>Meal Breaks:</strong> 1-hour statutory interval for break out and
                        in.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/70 shadow-xs">
          <CardContent className="p-6">
            {/* TRY: roster header + top-right records button — remove block if not applicable */}
            <div className="flex flex-wrap items-start justify-between gap-3 pb-4">
              <div>
                <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                  <Calendar className="h-4 w-4 text-primary" /> Weekly Shift Schedule &amp; Roster
                </h2>
              </div>
              <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
                <Badge
                  variant="outline"
                  className="border-primary/30 bg-primary/5 text-primary text-xs font-medium px-2.5 py-1"
                >
                  This Week
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRecordsModalOpen(true)}
                  className="gap-1.5 shadow-xs text-xs cursor-pointer"
                >
                  <FileText className="h-4 w-4 text-primary" /> View Records
                </Button>
              </div>
            </div>
            {scheduleLoading ? (
              <StatCardsSkeleton count={4} />
            ) : (
              /* 7 Vertical Cards Layout with Sun/Moon SVGs based on Shift */
              <div className="grid gap-3.5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7">
                {roster.map((s) => {
                  const visual = getShiftVisual(s.shift, s.time);
                  const isToday = s.day.toLowerCase() === todayDayName.toLowerCase();
                  const isRestDay = visual.type === "rest";

                  return (
                    <div
                      key={s.day}
                      className={`group relative flex flex-col items-center text-center justify-between p-4 rounded-2xl border transition-all duration-200 shadow-xs min-h-[260px] bg-gradient-to-b ${visual.themeAccent} bg-card ${visual.themeBorder} ${
                        isToday ? "ring-2 ring-primary/40 shadow-sm" : ""
                      }`}
                    >
                      {/* Card Top: Day & Date Indicator */}
                      <div className="w-full flex items-center justify-between pb-2 border-b border-border/50">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                          {s.day.slice(0, 3)}
                        </span>
                        {isToday ? (
                          <Badge className="bg-primary text-primary-foreground text-[9px] px-2 py-0.5 rounded-full font-bold shadow-2xs">
                            Today
                          </Badge>
                        ) : (
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {s.day}
                          </span>
                        )}
                      </div>

                      {/* Card Center: Sun or Moon SVG Thingy */}
                      <div className="my-3 flex flex-col items-center gap-1.5">
                        {visual.iconSvg}
                        <span className="text-[11px] font-bold text-foreground tracking-wide">
                          {visual.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {visual.tag}
                        </span>
                      </div>

                      {/* Card Bottom: Working Hours, Station, & Status */}
                      <div className="w-full pt-2.5 border-t border-border/50 space-y-1.5 text-xs">
                        <div className="flex items-center justify-center gap-1 font-mono font-semibold text-foreground text-[11px]">
                          <Clock className="h-3 w-3 text-primary shrink-0" />
                          <span className="truncate">{s.time}</span>
                        </div>

                        <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                          <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="truncate max-w-[110px]" title={s.location}>
                            {s.location}
                          </span>
                        </div>

                        <div className="pt-1">
                          <Badge
                            variant="outline"
                            className={`text-[9px] px-2 py-0.5 w-full justify-center font-medium ${visual.badgeColor}`}
                          >
                            {isRestDay ? "Rest Day" : "Confirmed"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      {/* TRY: records dialog — remove block if not applicable */}
      <ScheduleRecordsModal
        open={recordsModalOpen}
        onOpenChange={setRecordsModalOpen}
        dtrRecords={dtrRecords}
        weeklyRoster={roster}
      />
    </div>
  );
}
