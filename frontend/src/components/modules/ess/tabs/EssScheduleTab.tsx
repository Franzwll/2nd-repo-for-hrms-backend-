import { useState, useEffect } from "react";
import {
  Clock,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Building2,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

  const currentStatus = punchLog.timeOut !== "—" ? "clocked_out" : "clocked_in";

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

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Live Clock & Action Punch Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Clock Terminal Card */}
          <Card className="border-border/70 shadow-xs overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-primary/10 p-1.5 text-primary">
                    <Clock className="h-4 w-4" />
                  </div>
                  <CardTitle className="font-display text-base font-semibold">Live Timecard Terminal</CardTitle>
                </div>
                <Badge variant="outline" className="text-[11px] gap-1 bg-background text-emerald-600 border-emerald-500/30">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Biometric Sync Active
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Giant Live Clock Display */}
              <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/5 via-muted/30 to-background p-6 text-center shadow-xs space-y-3">
                <p className="text-xs uppercase font-semibold text-muted-foreground tracking-widest">{formattedDate}</p>
                <p className="text-4xl sm:text-5xl font-bold font-mono tracking-tight text-foreground">{formattedTime}</p>
                
                <div className="flex items-center justify-center gap-2 pt-1">
                  {currentStatus === "clocked_in" && (
                    <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 gap-1.5 px-3 py-1 text-xs">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Currently On Duty
                    </Badge>
                  )}
                  {currentStatus === "on_break" && (
                    <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 gap-1.5 px-3 py-1 text-xs">
                      <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                      On Lunch / Meal Break
                    </Badge>
                  )}
                  {currentStatus === "clocked_out" && (
                    <Badge className="bg-slate-500/15 text-slate-600 border-slate-500/30 gap-1.5 px-3 py-1 text-xs">
                      Shift Completed / Clocked Out
                    </Badge>
                  )}
                </div>
              </div>



              {/* Today's Punch Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="rounded-xl border border-border/80 p-3 bg-muted/20 text-center">
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground">Time In</p>
                  <p className="font-bold text-foreground mt-1 text-sm">{punchLog.timeIn}</p>
                </div>
                <div className="rounded-xl border border-border/80 p-3 bg-muted/20 text-center">
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground">Break Out</p>
                  <p className="font-bold text-foreground mt-1 text-sm">{punchLog.breakIn}</p>
                </div>
                <div className="rounded-xl border border-border/80 p-3 bg-muted/20 text-center">
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground">Break In</p>
                  <p className="font-bold text-foreground mt-1 text-sm">{punchLog.breakOut}</p>
                </div>
                <div className="rounded-xl border border-border/80 p-3 bg-muted/20 text-center">
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground">Time Out</p>
                  <p className="font-bold text-foreground mt-1 text-sm">{punchLog.timeOut}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Station Verification & Guidelines (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Station & Shift Info Card */}
          <Card className="border-border/70 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base font-semibold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Station Verification &amp; Shift Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center justify-between rounded-lg border border-border/80 p-3 bg-card">
                <span className="text-muted-foreground font-medium">Assigned Shift:</span>
                <span className="font-semibold text-foreground">AM Shift (07:00 AM – 04:00 PM)</span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border/80 p-3 bg-card">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-emerald-600" /> Geolocation:
                </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Oxford Suites Makati (Main Kitchen) ✓
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border/80 p-3 bg-card">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4 text-primary" /> Supervisor:
                </span>
                <span className="font-semibold text-foreground">
                  {employeeInfo?.supervisor || "Chef Marco"}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border/80 p-3 bg-card">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-primary" /> Department:
                </span>
                <span className="font-semibold text-foreground">
                  {employeeInfo?.department || "Food & Beverage"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Clocking Guidelines Card */}
          <Card className="border-border/70 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-primary" />
                Clocking Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Punctuality:</strong> Time In logs are grace-period compliant up to 15 minutes past your assigned shift start.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Meal Breaks:</strong> Record Break Out and Break In for statutory 1-hour meal intervals.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Biometric Sync:</strong> Web clocking records sync directly with payroll cut-off timecards.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
