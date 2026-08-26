import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin } from "lucide-react";
import { myAttendance } from "@/data/ess";

interface QuickClockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickClockModal({ open, onOpenChange }: QuickClockModalProps) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [currentStatus] = useState<"clocked_in" | "on_break" | "clocked_out">("clocked_in");
  const punchLog = {
    timeIn: myAttendance.today.timeIn || "07:52 AM",
    breakIn: myAttendance.today.breakIn || "12:00 PM",
    breakOut: myAttendance.today.breakOut || "12:58 PM",
    timeOut: myAttendance.today.timeOut !== "—" ? myAttendance.today.timeOut : "—",
  };

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

        <div className="border-t border-border pt-3 text-center">
          <p className="text-xs text-muted-foreground">
            Logs are automatically synced with biometric server.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
