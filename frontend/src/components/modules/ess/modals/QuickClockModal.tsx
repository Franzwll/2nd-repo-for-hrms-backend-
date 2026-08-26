import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, CheckCircle2, Coffee, LogOut, LogIn, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { myAttendance, mySchedule } from "@/data/ess";
import { essApi } from "@/lib/api";

interface QuickClockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClockAction?: (actionType: string, time: string) => void;
}

export function QuickClockModal({ open, onOpenChange, onClockAction }: QuickClockModalProps) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [currentStatus, setCurrentStatus] = useState<"clocked_in" | "on_break" | "clocked_out">("clocked_in");
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

  const handlePunch = async (type: "in" | "break_start" | "break_end" | "out") => {
    const timeStr = currentTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    if (type === "in") {
      try {
        await essApi.clock("clock_in");
        setPunchLog((prev) => ({ ...prev, timeIn: timeStr }));
        setCurrentStatus("clocked_in");
        toast.success(`Clocked IN recorded at ${timeStr}`);
        onClockAction?.("Clock In", timeStr);
      } catch (err: any) {
        toast.error(err.message || "Failed to record clock-in.");
      }
    } else if (type === "break_start") {
      setPunchLog((prev) => ({ ...prev, breakIn: timeStr }));
      setCurrentStatus("on_break");
      toast.info(`Break STARTED at ${timeStr}`);
      onClockAction?.("Break Out", timeStr);
    } else if (type === "break_end") {
      setPunchLog((prev) => ({ ...prev, breakOut: timeStr }));
      setCurrentStatus("clocked_in");
      toast.success(`Break ENDED at ${timeStr}`);
      onClockAction?.("Break In", timeStr);
    } else if (type === "out") {
      try {
        await essApi.clock("clock_out");
        setPunchLog((prev) => ({ ...prev, timeOut: timeStr }));
        setCurrentStatus("clocked_out");
        toast.success(`Clocked OUT recorded at ${timeStr}`);
        onClockAction?.("Clock Out", timeStr);
      } catch (err: any) {
        toast.error(err.message || "Failed to record clock-out.");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-primary/10 p-2 text-primary">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-display">Daily Web Clocking</DialogTitle>
              <DialogDescription>Record and verify your daily shift attendance.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Live Clock Display */}
        <div className="rounded-xl border border-border bg-muted/40 p-5 text-center shadow-xs">
          <p className="text-xs uppercase font-semibold text-muted-foreground tracking-widest">{formattedDate}</p>
          <p className="mt-2 text-4xl font-bold font-mono tracking-tight text-foreground">{formattedTime}</p>
          <div className="mt-3 flex items-center justify-center gap-2">
            {currentStatus === "clocked_in" && (
              <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 gap-1.5 px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Currently On Duty
              </Badge>
            )}
            {currentStatus === "on_break" && (
              <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 gap-1.5 px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                On Lunch / Break
              </Badge>
            )}
            {currentStatus === "clocked_out" && (
              <Badge className="bg-slate-500/15 text-slate-600 border-slate-500/30 gap-1.5 px-3 py-1">
                Shift Ended / Clocked Out
              </Badge>
            )}
          </div>
        </div>

        {/* Shift Details & Geolocation */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between rounded-md border border-border/80 p-2.5 bg-card">
            <span className="text-muted-foreground font-medium">Assigned Shift:</span>
            <span className="font-semibold text-foreground">AM Shift (07:00 AM – 04:00 PM)</span>
          </div>
          <div className="flex items-center justify-between rounded-md border border-border/80 p-2.5 bg-card">
            <span className="text-muted-foreground font-medium flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-emerald-600" /> Location:
            </span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              Oxford Suites Makati (Main Kitchen) ✓
            </span>
          </div>
        </div>

        {/* Today's Punch Summary */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="rounded-lg border border-border p-2 bg-background">
            <p className="text-muted-foreground text-[10px] uppercase font-semibold">Time In</p>
            <p className="font-bold text-foreground mt-1">{punchLog.timeIn}</p>
          </div>
          <div className="rounded-lg border border-border p-2 bg-background">
            <p className="text-muted-foreground text-[10px] uppercase font-semibold">Break Out</p>
            <p className="font-bold text-foreground mt-1">{punchLog.breakIn}</p>
          </div>
          <div className="rounded-lg border border-border p-2 bg-background">
            <p className="text-muted-foreground text-[10px] uppercase font-semibold">Break In</p>
            <p className="font-bold text-foreground mt-1">{punchLog.breakOut}</p>
          </div>
          <div className="rounded-lg border border-border p-2 bg-background">
            <p className="text-muted-foreground text-[10px] uppercase font-semibold">Time Out</p>
            <p className="font-bold text-foreground mt-1">{punchLog.timeOut}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <Button
            variant="outline"
            className="border-emerald-500/40 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 gap-1.5"
            onClick={() => handlePunch("in")}
          >
            <LogIn className="h-4 w-4" /> Punch In
          </Button>

          {currentStatus === "clocked_in" ? (
            <Button
              variant="outline"
              className="border-amber-500/40 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 gap-1.5"
              onClick={() => handlePunch("break_start")}
            >
              <Coffee className="h-4 w-4" /> Start Break
            </Button>
          ) : (
            <Button
              variant="outline"
              className="border-amber-500/40 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 gap-1.5"
              onClick={() => handlePunch("break_end")}
            >
              <Coffee className="h-4 w-4" /> End Break
            </Button>
          )}

          <Button
            variant="outline"
            className="col-span-2 border-rose-500/40 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 gap-1.5"
            onClick={() => handlePunch("out")}
          >
            <LogOut className="h-4 w-4" /> Punch Out (End Shift)
          </Button>
        </div>

        <DialogFooter className="sm:justify-between border-t border-border pt-3">
          <p className="text-[11px] text-muted-foreground">
            Logs are automatically synced with biometric server.
          </p>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
