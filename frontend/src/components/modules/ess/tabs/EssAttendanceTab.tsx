import { useState, useMemo, useEffect } from "react";
import { Calendar, Clock, FileText, MapPin, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  LEGEND,
  attendanceTableStatus,
  statusOf,
  type DayStatus,
} from "@/components/modules/ess/shared/attendanceStatus";
import { ScheduleRecordsModal } from "@/components/modules/ess/modals/ScheduleRecordsModal";
import { usePagination } from "@/hooks/usePagination";
import { essApi, type ApiScheduleDay } from "@/lib/api";

interface EssAttendanceTabProps {
  initialTab?: "clocking" | "roster" | "schedule";
}

const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const EMPTY_ROSTER: ApiScheduleDay[] = WEEK_DAYS.map((day) => ({
  day,
  shift: "No schedule assigned",
  time: "—",
  hours: "0h",
  location: "—",
}));

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
      themeBorder: "border-slate-500/25",
      themeBg: "bg-muted/30",
      themeAccent: "from-slate-500/10 to-transparent",
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
      themeBorder: "border-indigo-500/35",
      themeBg: "bg-indigo-500/5",
      themeAccent: "from-indigo-500/15 via-purple-500/5 to-transparent",
      badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
      iconSvg: (
        <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 shadow-xs">
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
      themeBorder: "border-orange-500/35",
      themeBg: "bg-orange-500/5",
      themeAccent: "from-orange-500/15 via-amber-500/5 to-transparent",
      badgeColor: "bg-orange-500/10 text-orange-500 border-orange-500/30",
      iconSvg: (
        <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500 border border-orange-500/30 shadow-xs">
          <svg
            className="h-8 w-8 text-orange-500 drop-shadow-sm"
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
    themeBorder: "border-amber-500/35",
    themeBg: "bg-amber-500/5",
    themeAccent: "from-amber-500/15 via-primary/5 to-transparent",
    badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/30",
    iconSvg: (
      <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/30 shadow-xs">
        <svg
          className="h-8 w-8 text-amber-500 drop-shadow-sm"
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
  // Attendance summary & history
  const [attSummary, setAttSummary] = useState({
    present_days: 0,
    leave_days: 0,
    average_hours: 0,
  });
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<DayStatus | "all">("all");

  // Schedule state
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [roster, setRoster] = useState<ApiScheduleDay[]>(EMPTY_ROSTER);

  // "Today" resolves after mount so SSR HTML matches (no hydration mismatch).
  const [todayDayName, setTodayDayName] = useState("");
  useEffect(() => {
    setTodayDayName(new Date().toLocaleDateString("en-US", { weekday: "long" }));
  }, []);

  // TRY: top-right records modal — remove state if not applicable
  const [recordsModalOpen, setRecordsModalOpen] = useState(false);

  const loadData = async () => {
    // Attendance Logs
    essApi
      .myAttendance()
      .then((res) => {
        if (res?.records) {
          setAttendanceLogs(res.records);
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

  // DTR history — live biometric / web clock records only.
  const dtrRecords = useMemo(() => attendanceLogs, [attendanceLogs]);

  const filteredAttendance = useMemo(() => {
    if (statusFilter === "all") return dtrRecords;
    return dtrRecords.filter((h: any) => statusOf(h) === statusFilter);
  }, [dtrRecords, statusFilter]);

  const attPage = usePagination(filteredAttendance, 10);

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
                  <FileText className="h-4 w-4 text-primary" /> View Schedule
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
        <Card className="border-border/70 shadow-xs">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-3 pb-4">
              <div>
                <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                  <Clock className="h-4 w-4 text-primary" /> Attendance Records
                </h2>
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as DayStatus | "all")}
              >
                <SelectTrigger className="h-9 w-36 shrink-0 sm:w-40" aria-label="Filter by status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {LEGEND.map((l) => (
                    <SelectItem key={l.status} value={l.status}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ListBody rows={10}>
              <Table className="min-w-[760px]">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider">
                      Date
                    </TableHead>
                    <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider">
                      Day
                    </TableHead>
                    <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider">
                      Time in
                    </TableHead>
                    <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider">
                      Time out
                    </TableHead>
                    <TableHead className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider">
                      Hours
                    </TableHead>
                    <TableHead className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider">
                      Late
                    </TableHead>
                    <TableHead className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider">
                      OT
                    </TableHead>
                    <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attPage.pageItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8}>
                        <ListEmptyState subject="attendance records" />
                      </TableCell>
                    </TableRow>
                  ) : (
                    attPage.pageItems.map((h: any, i: number) => {
                      const worked = !!h.timeIn && h.timeIn !== "—";
                      const lateMinutes = Number(h.lateMinutes ?? 0);
                      const overtimeHours = Number(h.overtimeHours ?? 0);

                      return (
                        <TableRow key={i}>
                          <TableCell className="whitespace-nowrap px-4 py-3 text-sm font-medium text-foreground">
                            {h.date}
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                            {h.day ? String(h.day).slice(0, 3) : "—"}
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-4 py-3 font-mono text-sm">
                            {h.timeIn}
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-4 py-3 font-mono text-sm">
                            {h.timeOut}
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-4 py-3 text-right font-mono text-sm font-semibold text-foreground">
                            {worked ? Number(h.workedHours ?? 0).toFixed(1) : "—"}
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-4 py-3 text-right font-mono text-sm">
                            {!worked ? "—" : lateMinutes > 0 ? `${lateMinutes} min` : "0"}
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-4 py-3 text-right font-mono text-sm">
                            {!worked ? "—" : overtimeHours > 0 ? String(overtimeHours) : "0"}
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-4 py-3 text-sm">
                            <EssStatusBadge status={attendanceTableStatus(h)} />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </ListBody>

            <div className="border-t border-border/60 pt-3">
              <TablePagination
                page={attPage.page}
                pageCount={attPage.pageCount}
                from={attPage.from}
                to={attPage.to}
                total={attPage.total}
                label="records"
                showRangeLabel={false}
                onPageChange={attPage.setPage}
              />
            </div>
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
