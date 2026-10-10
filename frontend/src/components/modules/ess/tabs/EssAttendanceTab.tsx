import { useState, useMemo, useEffect } from "react";
import {
  Calendar,
  Clock,
  Plus,
  Search,
  ArrowUpDown,
  FileEdit,
  FileText,
  ArrowLeftRight,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
  Sparkles,
  ShieldCheck,
  Building2,
  Check,
  Palmtree,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatCard } from "@/components/portal/StatCard";
import { ListBody } from "@/components/portal/ListBody";
import { ListEmptyState } from "@/components/portal/ListEmptyState";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { usePagination } from "@/hooks/usePagination";
import { EssStatusBadge } from "@/components/modules/ess/shared/EssStatusBadge";
import { myAttendance } from "@/data/ess";
import { DtrCorrectionModal } from "@/components/modules/ess/modals/DtrCorrectionModal";
import { ShiftSwapModal } from "@/components/modules/ess/modals/ShiftSwapModal";
import { LeaveApplicationModal } from "@/components/modules/ess/modals/LeaveApplicationModal";
import { RequestTimelineModal, type RequestItem } from "@/components/modules/ess/modals/RequestTimelineModal";
import { essApi, type ApiScheduleDay, type ApiEssEmployee, type ApiLeaveBalance } from "@/lib/api";
import { toast } from "sonner";

interface EssAttendanceTabProps {
  initialTab?: "clocking" | "roster" | "schedule" | "dtr" | "leave";
}

const DEFAULT_ROSTER: ApiScheduleDay[] = [
  { day: "Monday", shift: "Morning Shift", time: "07:00 AM – 04:00 PM", hours: "8.0h (1h break)", location: "Main Kitchen · Line 1" },
  { day: "Tuesday", shift: "Morning Shift", time: "07:00 AM – 04:00 PM", hours: "8.0h (1h break)", location: "Main Kitchen · Line 1" },
  { day: "Wednesday", shift: "Morning Shift", time: "07:00 AM – 04:00 PM", hours: "8.0h (1h break)", location: "Main Kitchen · Line 1" },
  { day: "Thursday", shift: "Mid Shift", time: "02:00 PM – 11:00 PM", hours: "8.0h (1h break)", location: "Main Kitchen · Pastry Prep" },
  { day: "Friday", shift: "Night Shift", time: "11:00 PM – 07:00 AM", hours: "8.0h (1h break)", location: "Main Kitchen · Night Prep" },
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
      themeBorder: "border-slate-500/25",
      themeBg: "bg-muted/30",
      themeAccent: "from-slate-500/10 to-transparent",
      badgeColor: "bg-muted text-muted-foreground border-border/80",
      iconSvg: (
        <div className="p-3 rounded-2xl bg-muted/60 text-muted-foreground border border-border/70 shadow-2xs">
          <svg className="h-8 w-8 text-muted-foreground/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      themeBorder: "border-indigo-500/35 hover:border-indigo-500/60",
      themeBg: "bg-indigo-500/5",
      themeAccent: "from-indigo-500/15 via-purple-500/5 to-transparent",
      badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
      iconSvg: (
        <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 shadow-xs">
          <svg className="h-8 w-8 text-indigo-400 drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="currentColor" fillOpacity="0.25" />
            <path d="M19 3v4" />
            <path d="M21 5h-4" />
          </svg>
        </div>
      ),
    };
  }

  const isMid = s.includes("mid") || s.includes("afternoon") || t.includes("02:00 pm") || t.includes("03:00 pm");
  if (isMid) {
    return {
      type: "mid" as const,
      label: "Mid Shift",
      tag: "Afternoon",
      themeBorder: "border-orange-500/35 hover:border-orange-500/60",
      themeBg: "bg-orange-500/5",
      themeAccent: "from-orange-500/15 via-amber-500/5 to-transparent",
      badgeColor: "bg-orange-500/10 text-orange-500 border-orange-500/30",
      iconSvg: (
        <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500 border border-orange-500/30 shadow-xs">
          <svg className="h-8 w-8 text-orange-500 drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    themeBorder: "border-amber-500/35 hover:border-amber-500/60",
    themeBg: "bg-amber-500/5",
    themeAccent: "from-amber-500/15 via-primary/5 to-transparent",
    badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/30",
    iconSvg: (
      <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/30 shadow-xs">
        <svg className="h-8 w-8 text-amber-500 drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

export function EssAttendanceTab({ initialTab = "schedule" }: EssAttendanceTabProps) {
  // Navigation tabs — admin-consistent: schedule (clocking + roster combined) / dtr / leave
  type AttendanceTabValue = "schedule" | "dtr" | "leave";
  const normalizeTab = (t: string | undefined): AttendanceTabValue => {
    if (t === "dtr") return "dtr";
    if (t === "leave") return "leave";
    return "schedule";
  };
  const [activeSubTab, setActiveSubTab] = useState<AttendanceTabValue>(
    normalizeTab(initialTab)
  );

  useEffect(() => {
    if (initialTab) {
      setActiveSubTab(normalizeTab(initialTab));
    }
  }, [initialTab]);

  // Live Clock Terminal State — client-only (null until mounted so SSR HTML matches).
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [currentDutyStatus, setCurrentDutyStatus] = useState<"clocked_in" | "on_break" | "clocked_out">("clocked_in");
  const [punchLog, setPunchLog] = useState({
    timeIn: myAttendance.today.timeIn || "07:52 AM",
    breakIn: myAttendance.today.breakIn || "12:00 PM",
    breakOut: myAttendance.today.breakOut || "12:58 PM",
    timeOut: myAttendance.today.timeOut !== "—" ? myAttendance.today.timeOut : "—",
  });

  // Attendance summary & history
  const [attSummary, setAttSummary] = useState({
    present_days: 18,
    late_days: 1,
    absent_days: 0,
    overtime_hours: 4.5,
    average_hours: 8.0,
  });
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);

  const [attRequests, setAttRequests] = useState([
    { id: "REQ-4408", date: "Jul 20, 2026", isoDate: "2026-07-20", type: "Missed Time Out", status: "Pending", statusRank: 0, details: "Scanner offline at end of shift" },
    { id: "REQ-4390", date: "Jun 12, 2026", isoDate: "2026-06-12", type: "Time In Correction", status: "Approved", statusRank: 1, details: "Late override approved by Chef Marco" },
    { id: "REQ-4355", date: "May 22, 2026", isoDate: "2026-05-22", type: "Rest Day Work", status: "Approved", statusRank: 1, details: "Catering banquet support" },
  ]);

  const [attSearch, setAttSearch] = useState("");
  const [attSort, setAttSort] = useState("date-desc");
  const [dtrSearch, setDtrSearch] = useState("");
  const [leaveSearch, setLeaveSearch] = useState("");
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [timelineOpen, setTimelineOpen] = useState(false);

  // Schedule state
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [employeeInfo, setEmployeeInfo] = useState<ApiEssEmployee | null>(null);
  const [roster, setRoster] = useState<ApiScheduleDay[]>(DEFAULT_ROSTER);

  // Leave state
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaveBalances, setLeaveBalances] = useState<ApiLeaveBalance[]>([]);
  const [leaveHistory, setLeaveHistory] = useState<any[]>([]);

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
      .catch(() => {});

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

    // Leaves
    try {
      const leaveRes = await essApi.leaves();
      setLeaveHistory(leaveRes.history || []);
      if (leaveRes?.balances && leaveRes.balances.length > 0) {
        setLeaveBalances(leaveRes.balances);
      }
    } catch {
      // ignore
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

  const todayDayName = currentTime ? currentTime.toLocaleDateString("en-US", { weekday: "long" }) : "";


  const filteredAttRequests = useMemo(() => {
    return attRequests
      .filter((r) => !attSearch || r.type.toLowerCase().includes(attSearch.toLowerCase()) || r.status.toLowerCase().includes(attSearch.toLowerCase()))
      .sort((a, b) => {
        if (attSort === "date-desc") return b.isoDate.localeCompare(a.isoDate);
        if (attSort === "date-asc") return a.isoDate.localeCompare(b.isoDate);
        if (attSort === "status") return a.statusRank - b.statusRank;
        return 0;
      });
  }, [attRequests, attSearch, attSort]);

  const attPage = usePagination(filteredAttRequests);

  // DTR history — admin-consistent searchable + paginated table
  const dtrRecords = useMemo(() => {
    if (attendanceLogs.length > 0) return attendanceLogs;
    return myAttendance.history.map((h) => ({
      date: h.date,
      timeIn: h.in,
      timeOut: h.out,
      workedHours: h.hours,
      status: h.remark.includes("Present") ? "Present" : h.remark.includes("Late") ? "Late" : h.remark,
    }));
  }, [attendanceLogs]);

  const filteredDtrRecords = useMemo(() => {
    const q = dtrSearch.trim().toLowerCase();
    if (!q) return dtrRecords;
    return dtrRecords.filter((h: any) =>
      String(h.date ?? "").toLowerCase().includes(q) ||
      String(h.status ?? "").toLowerCase().includes(q) ||
      String(h.timeIn ?? "").toLowerCase().includes(q) ||
      String(h.timeOut ?? "").toLowerCase().includes(q)
    );
  }, [dtrRecords, dtrSearch]);

  const dtrPage = usePagination(filteredDtrRecords);

  // Leave history — admin-consistent searchable + paginated table
  const filteredLeaveHistory = useMemo(() => {
    const q = leaveSearch.trim().toLowerCase();
    if (!q) return leaveHistory;
    return leaveHistory.filter((item: any) =>
      String(item.request_code ?? item.id ?? "").toLowerCase().includes(q) ||
      String(item.request_type ?? item.type ?? "").toLowerCase().includes(q) ||
      String(item.status ?? "").toLowerCase().includes(q) ||
      String(item.details ?? item.reason ?? "").toLowerCase().includes(q)
    );
  }, [leaveHistory, leaveSearch]);

  const leavePage = usePagination(filteredLeaveHistory);

  const handleCorrectionSubmit = async (newCorrection: any) => {
    const todayStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const isoStr = new Date().toISOString().slice(0, 10);
    const req = {
      id: `REQ-${Date.now().toString().slice(-4)}`,
      date: todayStr,
      isoDate: isoStr,
      type: newCorrection.type || "DTR Correction",
      status: "Pending",
      statusRank: 0,
      details: newCorrection.reason || "Time record adjustment requested",
    };
    setAttRequests([req, ...attRequests]);

    try {
      await essApi.createRequest({
        category_code: "attendance",
        category_name: "Attendance",
        request_type: newCorrection.type || "DTR Correction",
        date_from: newCorrection.date || isoStr,
        details: newCorrection.reason || "Time record adjustment requested",
      });
    } catch {
      // fallback
    }
  };

  const handleRowClick = (req: any, category = "Attendance") => {
    setSelectedRequest({
      id: req.id || req.request_code,
      type: req.type || req.request_type,
      category: category,
      date: req.date || (req.filed_at ? req.filed_at.slice(0, 10) : req.filedDate),
      status: req.status,
      assignedTo: req.assignedTo || "Executive Chef Marco / HR Admin",
      details: req.details || req.reason || "Request filed in portal.",
    });
    setTimelineOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Metric cards — admin-consistent placement above tabs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Present Days"
          value={attSummary.present_days}
          hint={`Avg ${attSummary.average_hours.toFixed(1)}h per day`}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label="Late Days"
          value={attSummary.late_days}
          hint="Arrivals past grace period"
          icon={Clock}
          tone="caution"
        />
        <StatCard
          label="Absent Days"
          value={attSummary.absent_days}
          hint="Unexcused absences this cut-off"
          icon={AlertCircle}
          tone="primary"
        />
        <StatCard
          label="Overtime Hours"
          value={`${attSummary.overtime_hours}h`}
          hint="Approved OT this cut-off"
          icon={Sparkles}
          tone="gold"
        />
      </div>

      <Tabs
        value={activeSubTab}
        onValueChange={(v) => setActiveSubTab(v as typeof activeSubTab)}
        className="mt-6"
      >
        <TabsList className="flex h-auto flex-wrap justify-start gap-2 border-0 bg-transparent p-0 shadow-none">
          <TabsTrigger
            className="flex items-center gap-1.5 rounded-lg border-border/70 bg-card px-4 py-2 text-xs font-semibold shadow-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            value="schedule"
          >
            <Clock className="h-3.5 w-3.5" /> Attendance &amp; Schedule
          </TabsTrigger>
          <TabsTrigger
            className="flex items-center gap-1.5 rounded-lg border-border/70 bg-card px-4 py-2 text-xs font-semibold shadow-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            value="dtr"
          >
            <FileText className="h-3.5 w-3.5" /> DTR &amp; Corrections
          </TabsTrigger>
          <TabsTrigger
            className="flex items-center gap-1.5 rounded-lg border-border/70 bg-card px-4 py-2 text-xs font-semibold shadow-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            value="leave"
          >
            <Palmtree className="h-3.5 w-3.5" /> Leave &amp; Balances
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
              <Clock className="h-4 w-4 text-primary" /> Attendance &amp; Schedule
            </h2>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button
                onClick={() => setSwapModalOpen(true)}
                variant="outline"
                size="sm"
                className="gap-1.5 shadow-xs text-xs cursor-pointer"
              >
                <ArrowLeftRight className="h-4 w-4 text-purple-600" /> Request Shift Swap
              </Button>
            </div>
          </div>
          <Card className="border-border/70 shadow-xs transition-all group cursor-pointer hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center justify-end gap-2 pb-4">
                <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary text-xs font-medium px-2.5 py-1">
                  Station Active
                </Badge>
                {currentDutyStatus === "clocked_in" && (
                  <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1.5 px-3 py-1 text-xs font-semibold">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Currently On Duty
                  </Badge>
                )}
                {currentDutyStatus === "on_break" && (
                  <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1.5 px-3 py-1 text-xs font-semibold">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    On Lunch / Meal Break
                  </Badge>
                )}
                {currentDutyStatus === "clocked_out" && (
                  <Badge className="bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30 gap-1.5 px-3 py-1 text-xs font-semibold">
                    Shift Completed / Clocked Out
                  </Badge>
                )}
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
                        {currentDutyStatus === "clocked_out" ? "Shift Concluded" : "Live Biometric Clocking"}
                      </span>
                    </div>
                  </div>

                  {/* Today's Punch Summary Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-xl border border-border/80 p-3 bg-muted/20 text-center hover:border-primary/40 transition-colors shadow-2xs">
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Time In</p>
                      <p className="font-bold text-foreground mt-1 text-sm font-mono">{punchLog.timeIn}</p>
                    </div>
                    <div className="rounded-xl border border-border/80 p-3 bg-muted/20 text-center hover:border-primary/40 transition-colors shadow-2xs">
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Break Out</p>
                      <p className="font-bold text-foreground mt-1 text-sm font-mono">{punchLog.breakIn}</p>
                    </div>
                    <div className="rounded-xl border border-border/80 p-3 bg-muted/20 text-center hover:border-primary/40 transition-colors shadow-2xs">
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Break In</p>
                      <p className="font-bold text-foreground mt-1 text-sm font-mono">{punchLog.breakOut}</p>
                    </div>
                    <div className="rounded-xl border border-border/80 p-3 bg-muted/20 text-center hover:border-primary/40 transition-colors shadow-2xs">
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Time Out</p>
                      <p className="font-bold text-foreground mt-1 text-sm font-mono">{punchLog.timeOut}</p>
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
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        Verified
                      </span>
                    </div>

                    <div className="space-y-2.5 pt-3.5 text-xs">
                      <div className="flex items-center justify-between rounded-xl border border-border/60 p-3 bg-background/80 hover:border-primary/30 transition-colors">
                        <span className="text-muted-foreground font-medium">Assigned Shift:</span>
                        <span className="font-semibold text-foreground">AM Shift (07:00 AM – 04:00 PM)</span>
                      </div>

                      <div className="flex items-center justify-between rounded-xl border border-border/60 p-3 bg-background/80 hover:border-primary/30 transition-colors">
                        <span className="text-muted-foreground font-medium">Geolocation:</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          Oxford Suites Makati (Main Kitchen) ✓
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-xl border border-border/60 p-3 bg-background/80 hover:border-primary/30 transition-colors">
                        <span className="text-muted-foreground font-medium">Supervisor:</span>
                        <span className="font-semibold text-foreground">
                          {employeeInfo?.supervisor || "Chef Marco D. Santos"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-xl border border-border/60 p-3 bg-background/80 hover:border-primary/30 transition-colors">
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
                    <span className="font-semibold font-display text-foreground">Clocking Guidelines</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground w-full lg:w-auto">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>Punctuality:</strong> 15-min grace period compliant past shift start.
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>Meal Breaks:</strong> 1-hour statutory interval for break out and in.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </CardContent>
          </Card>
          <Card className="border-border/70 shadow-xs transition-all group cursor-pointer hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md">
            <CardContent className="p-6">
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
                        className={`group relative flex flex-col items-center text-center justify-between p-4 rounded-2xl border transition-all duration-200 shadow-xs hover:shadow-md min-h-[260px] bg-gradient-to-b ${visual.themeAccent} bg-card ${visual.themeBorder} ${
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
                            <span className="truncate max-w-[110px]" title={s.location}>{s.location}</span>
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
        </TabsContent>

        <TabsContent value="dtr" className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
              <Clock className="h-4 w-4 text-primary" /> Attendance Logs &amp; Daily Time Record (DTR)
            </h2>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button
                size="sm"
                onClick={() => setCorrectionModalOpen(true)}
                className="gap-1.5 text-xs shadow-xs cursor-pointer"
              >
                <Plus className="h-4 w-4" /> File DTR Correction
              </Button>
            </div>
          </div>

          <Card className="border-border/70 shadow-xs transition-all group cursor-pointer hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                  <Calendar className="h-4 w-4 text-primary" /> Daily Time Record (DTR) History
                </h2>
                <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
                  <div className="relative w-56">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={dtrSearch}
                      onChange={(e) => setDtrSearch(e.target.value)}
                      placeholder="Search DTR records…"
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>
              <ListBody className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[24%]">Date</TableHead>
                      <TableHead className="w-[18%]">Time In</TableHead>
                      <TableHead className="w-[18%]">Time Out</TableHead>
                      <TableHead className="w-[22%]">Status &amp; Remark</TableHead>
                      <TableHead className="w-[18%] text-right">Hours Worked</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dtrPage.pageItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5}>
                          <ListEmptyState placeholder="Search DTR records…" subject="DTR records" />
                        </TableCell>
                      </TableRow>
                    ) : (
                      dtrPage.pageItems.map((h: any, i: number) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium text-xs text-foreground">{h.date}</TableCell>
                          <TableCell className="text-xs font-mono">{h.timeIn}</TableCell>
                          <TableCell className="text-xs font-mono">{h.timeOut}</TableCell>
                          <TableCell>
                            <EssStatusBadge status={h.status} />
                          </TableCell>
                          <TableCell className="text-right text-xs font-semibold font-mono text-foreground">
                            {h.workedHours} hrs
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ListBody>
              <div className="shrink-0 border-t border-border/60 pt-3">
                <TablePagination
                  page={dtrPage.page}
                  pageCount={dtrPage.pageCount}
                  from={dtrPage.from}
                  to={dtrPage.to}
                  total={dtrPage.total}
                  label="records"
                  showRangeLabel={false}
                  onPageChange={dtrPage.setPage}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-xs transition-all group cursor-pointer hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                  <FileEdit className="h-4 w-4 text-primary" /> My Attendance Correction Requests
                </h2>
                <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
                  <div className="relative w-56">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search requests…"
                      value={attSearch}
                      onChange={(e) => setAttSearch(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Select value={attSort} onValueChange={setAttSort}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date-desc">Newest first</SelectItem>
                      <SelectItem value="date-asc">Oldest first</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <ListBody className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Date Filed</TableHead>
                  <TableHead>Correction Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attPage.pageItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <ListEmptyState placeholder="Search requests…" subject="correction requests" />
                    </TableCell>
                  </TableRow>
                ) : (
                  attPage.pageItems.map((r, idx) => (
                    <TableRow
                      key={idx}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleRowClick(r, "Attendance")}
                    >
                      <TableCell className="text-xs font-mono font-medium text-foreground">{r.id}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{r.date}</TableCell>
                      <TableCell className="text-xs font-medium">{r.type}</TableCell>
                      <TableCell>
                        <EssStatusBadge status={r.status} />
                      </TableCell>
                      <TableCell className="text-right py-1">
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-primary cursor-pointer">
                          Timeline →
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
              </ListBody>
              <div className="shrink-0 border-t border-border/60 pt-3">
                <TablePagination
                  page={attPage.page}
                  pageCount={attPage.pageCount}
                  from={attPage.from}
                  to={attPage.to}
                  total={attPage.total}
                  label="requests"
                  showRangeLabel={false}
                  onPageChange={attPage.setPage}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leave" className="mt-4 space-y-4">
          <Card className="border-border/70 shadow-xs transition-all group cursor-pointer hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                  <FileText className="h-4 w-4 text-primary" /> Leave Filing History &amp; Approvals
                </h2>
                <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
                  <div className="relative w-56">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search leave…"
                      value={leaveSearch}
                      onChange={(e) => setLeaveSearch(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setLeaveModalOpen(true)}
                    className="gap-1.5 text-xs shadow-xs cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Apply for Leave
                  </Button>
                </div>
              </div>
              <ListBody className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request ID</TableHead>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Effective Dates</TableHead>
                      <TableHead>Reason / Details</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leavePage.pageItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <ListEmptyState placeholder="Search leave…" subject="leave requests" />
                        </TableCell>
                      </TableRow>
                    ) : (
                      leavePage.pageItems.map((item: any, idx: number) => (
                        <TableRow
                          key={idx}
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => handleRowClick(item, "Leave")}
                        >
                          <TableCell className="text-xs font-mono font-medium text-foreground">
                            {item.request_code || item.id}
                          </TableCell>
                          <TableCell className="text-xs font-semibold">{item.request_type || item.type}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {item.date_from || item.dateFrom} {item.date_to && item.date_to !== item.date_from ? `to ${item.date_to}` : ""}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{item.details || item.reason}</TableCell>
                          <TableCell>
                            <EssStatusBadge status={item.status} />
                          </TableCell>
                          <TableCell className="text-right py-1">
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-primary cursor-pointer">
                              Timeline →
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ListBody>
              <div className="shrink-0 border-t border-border/60 pt-3">
                <TablePagination
                  page={leavePage.page}
                  pageCount={leavePage.pageCount}
                  from={leavePage.from}
                  to={leavePage.to}
                  total={leavePage.total}
                  label="requests"
                  showRangeLabel={false}
                  onPageChange={leavePage.setPage}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <LeaveApplicationModal
        open={leaveModalOpen}
        onOpenChange={setLeaveModalOpen}
        onSubmitLeave={(newLeave) => {
          if (newLeave) {
            setLeaveHistory((prev) => [newLeave, ...prev]);
          }
          loadData();
        }}
      />
      <DtrCorrectionModal
        open={correctionModalOpen}
        onOpenChange={setCorrectionModalOpen}
        onSubmitCorrection={handleCorrectionSubmit}
      />
      <ShiftSwapModal
        open={swapModalOpen}
        onOpenChange={setSwapModalOpen}
        onSubmitSwap={() => loadData()}
      />
      <RequestTimelineModal
        open={timelineOpen}
        onOpenChange={setTimelineOpen}
        request={selectedRequest}
      />
    </div>
  );
}
