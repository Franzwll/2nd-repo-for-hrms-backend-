import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Coffee,
  RotateCcw,
  LogOut,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { myAttendance } from "@/data/ess";
import { essApi, type ApiEssEmployee } from "@/lib/api";

export function EssScheduleTab() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [employeeInfo, setEmployeeInfo] = useState<ApiEssEmployee | null>(null);
  const [punchLog, setPunchLog] = useState({
    timeIn: myAttendance.today.timeIn || "07:52 AM",
    breakIn: myAttendance.today.breakIn || "12:00 PM",
    breakOut: myAttendance.today.breakOut || "12:58 PM",
    timeOut: myAttendance.today.timeOut !== "—" ? myAttendance.today.timeOut : "—",
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    essApi
      .schedule()
      .then((res) => {
        if (res?.employee) {
          setEmployeeInfo(res.employee);
        }
      })
      .catch(() => {});

    essApi
      .myAttendance()
      .then((res) => {
        if (res?.records && res.records[0]) {
          const rec = res.records[0];
          setPunchLog((prev) => ({
            ...prev,
            timeIn: rec.timeIn || prev.timeIn,
            timeOut: rec.timeOut || prev.timeOut,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const formattedDate = currentTime.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const [currentDutyStatus, setCurrentDutyStatus] = useState<"clocked_in" | "on_break" | "clocked_out">(
    punchLog.timeOut !== "—" ? "clocked_out" : "clocked_in"
  );

  const handleClockIn = () => {
    const timeStr = currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    setPunchLog((prev) => ({ ...prev, timeIn: timeStr, timeOut: "—" }));
    setCurrentDutyStatus("clocked_in");
    toast.success(`Successfully Clocked In at ${timeStr}! Have a safe and productive shift. ⏱️`);
  };

  const handleBreakOut = () => {
    const timeStr = currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    setPunchLog((prev) => ({ ...prev, breakIn: timeStr }));
    setCurrentDutyStatus("on_break");
    toast.info(`Meal break started at ${timeStr}. Enjoy your 1-hour statutory interval! ☕`);
  };

  const handleBreakIn = () => {
    const timeStr = currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    setPunchLog((prev) => ({ ...prev, breakOut: timeStr }));
    setCurrentDutyStatus("clocked_in");
    toast.success(`Duty resumed at ${timeStr}. Welcome back to your station! 💼`);
  };

  const handleClockOut = () => {
    const timeStr = currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    setPunchLog((prev) => ({ ...prev, timeOut: timeStr }));
    setCurrentDutyStatus("clocked_out");
    toast.success(`Shift completed! Clocked Out at ${timeStr}. Rest well! 🏁`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h3 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Daily Web Clocking
        </h3>
        <p className="text-xs text-muted-foreground">
          Record and verify your daily shift attendance and biometric time punches in real time.
        </p>
      </div>

      {/* Unified Executive Hero: Live Timecard Terminal & Station Verification */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/[0.04] shadow-sm">
        {/* Ambient Decorative Lighting */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-amber-500/5 blur-3xl" />

        {/* Hero Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 bg-muted/30 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2.5 text-primary shadow-2xs">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-base font-bold font-display text-foreground tracking-tight">
                Live Timecard Terminal
              </h4>
              <p className="text-xs text-muted-foreground">
                Oxford Suites Makati · Station Terminal Kiosk #01
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
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
        </div>

        {/* Hero Body: Split Grid */}
        <div className="grid gap-6 p-6 lg:grid-cols-12">
          {/* Left Column: Digital Clock Display & Today's Punches (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            {/* Giant Live Clock Display */}
            <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-b from-background/90 via-background/60 to-background/90 p-6 text-center shadow-xs backdrop-blur-sm">
              <p className="text-xs uppercase font-semibold text-muted-foreground tracking-widest">
                {formattedDate}
              </p>
              <div className="my-2.5">
                <span className="text-5xl sm:text-6xl font-extrabold font-mono tracking-tight text-foreground drop-shadow-xs">
                  {formattedTime}
                </span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-muted/60 border border-border/80 px-3.5 py-1 text-xs text-muted-foreground">
                <span>Terminal Mode:</span>
                <span className="font-semibold text-foreground">
                  {currentDutyStatus === "clocked_out" ? "Shift Concluded" : "Live Attendance Tracking"}
                </span>
              </div>
            </div>

            {/* DAILY WEB CLOCKING INTERACTIVE BUTTONS */}
            <div className="rounded-2xl border border-border/80 bg-muted/20 p-4 space-y-2.5">
              <div className="flex items-center justify-between pb-1">
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary" /> Daily Web Clocking Actions
                </p>
                <span className="text-[10px] text-muted-foreground font-mono">1-Click Punch Sync</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <Button
                  type="button"
                  onClick={handleClockIn}
                  className="h-10 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs gap-1.5 cursor-pointer active:scale-95 transition-all"
                >
                  <Play className="h-3.5 w-3.5" />
                  <span>Clock In</span>
                </Button>

                <Button
                  type="button"
                  onClick={handleBreakOut}
                  variant="outline"
                  className="h-10 text-xs font-bold border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 shadow-2xs gap-1.5 cursor-pointer active:scale-95 transition-all"
                >
                  <Coffee className="h-3.5 w-3.5" />
                  <span>Break Out</span>
                </Button>

                <Button
                  type="button"
                  onClick={handleBreakIn}
                  variant="outline"
                  className="h-10 text-xs font-bold border-teal-500/40 text-teal-600 dark:text-teal-400 bg-teal-500/10 hover:bg-teal-500/20 shadow-2xs gap-1.5 cursor-pointer active:scale-95 transition-all"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Break In</span>
                </Button>

                <Button
                  type="button"
                  onClick={handleClockOut}
                  className="h-10 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs gap-1.5 cursor-pointer active:scale-95 transition-all"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Clock Out</span>
                </Button>
              </div>
            </div>

            {/* Today's Punch Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-border/80 p-3 bg-card/80 backdrop-blur-xs text-center hover:border-primary/40 transition-colors shadow-2xs">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Time In</p>
                <p className="font-bold text-foreground mt-1 text-sm font-mono">{punchLog.timeIn}</p>
              </div>
              <div className="rounded-xl border border-border/80 p-3 bg-card/80 backdrop-blur-xs text-center hover:border-primary/40 transition-colors shadow-2xs">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Break Out</p>
                <p className="font-bold text-foreground mt-1 text-sm font-mono">{punchLog.breakIn}</p>
              </div>
              <div className="rounded-xl border border-border/80 p-3 bg-card/80 backdrop-blur-xs text-center hover:border-primary/40 transition-colors shadow-2xs">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Break In</p>
                <p className="font-bold text-foreground mt-1 text-sm font-mono">{punchLog.breakOut}</p>
              </div>
              <div className="rounded-xl border border-border/80 p-3 bg-card/80 backdrop-blur-xs text-center hover:border-primary/40 transition-colors shadow-2xs">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Time Out</p>
                <p className="font-bold text-foreground mt-1 text-sm font-mono">{punchLog.timeOut}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Station Verification & Shift Info (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-border/70 bg-background/50 p-5 backdrop-blur-xs shadow-2xs">
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
                <div className="flex items-center justify-between rounded-xl border border-border/60 p-3 bg-card/70 hover:border-primary/30 transition-colors">
                  <span className="text-muted-foreground font-medium">Assigned Shift:</span>
                  <span className="font-semibold text-foreground">AM Shift (07:00 AM – 04:00 PM)</span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border/60 p-3 bg-card/70 hover:border-primary/30 transition-colors">
                  <span className="text-muted-foreground font-medium">Geolocation:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Oxford Suites Makati (Main Kitchen) ✓
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border/60 p-3 bg-card/70 hover:border-primary/30 transition-colors">
                  <span className="text-muted-foreground font-medium">Supervisor:</span>
                  <span className="font-semibold text-foreground">
                    {employeeInfo?.supervisor || "Chef Marco D. Santos"}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border/60 p-3 bg-card/70 hover:border-primary/30 transition-colors">
                  <span className="text-muted-foreground font-medium">Department:</span>
                  <span className="font-semibold text-foreground">
                    {employeeInfo?.department || "Kitchen / Culinary"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Bottom Bar: Clocking Guidelines */}
        <div className="border-t border-border/60 bg-muted/25 px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 shrink-0">
              <AlertCircle className="h-4 w-4 text-primary shrink-0" />
              <span className="font-semibold font-display text-foreground">Clocking Guidelines</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-muted-foreground w-full lg:w-auto">
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
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Biometric Sync:</strong> Punches sync real-time with payroll cut-off.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
