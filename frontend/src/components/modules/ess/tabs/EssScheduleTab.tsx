import { useState, useEffect } from "react";
import { Calendar, ArrowLeftRight, Clock, MapPin, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShiftSwapModal } from "@/components/modules/ess/modals/ShiftSwapModal";
import { toast } from "sonner";
import { essApi, type ApiScheduleDay, type ApiEssEmployee } from "@/lib/api";

export function EssScheduleTab() {
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [employeeInfo, setEmployeeInfo] = useState<ApiEssEmployee | null>(null);
  const [roster, setRoster] = useState<ApiScheduleDay[]>([]);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const res = await essApi.schedule();
      setEmployeeInfo(res.employee);
      setRoster(res.weekly_roster);
    } catch (err: any) {
      toast.error(err.message || "Failed to load weekly schedule.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header & Shift Swap Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold font-display text-foreground">Weekly Shift Roster</h3>
          <p className="text-xs text-muted-foreground">
            Current work schedule assigned by {employeeInfo?.supervisor ?? "Supervisor"} for {employeeInfo?.department ?? "Department"}.
          </p>
        </div>
        <Button onClick={() => setSwapModalOpen(true)} variant="outline" className="gap-1.5 shadow-xs text-xs">
          <ArrowLeftRight className="h-4 w-4 text-purple-600" /> Request Shift Swap
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12 text-muted-foreground text-sm gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" /> Loading roster...
        </div>
      ) : (
        /* Weekly Schedule Days Grid */
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {roster.map((s) => {
            const isRestDay = s.shift === "Rest Day" || s.shift.includes("Rest");
            return (
              <div
                key={s.day}
                className={`rounded-xl border p-4 transition-all shadow-xs ${
                  isRestDay
                    ? "border-border/60 bg-muted/20 opacity-80"
                    : "border-border/80 bg-card hover:border-primary/50"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">{s.day}</span>
                  <Badge
                    variant="outline"
                    className={
                      isRestDay
                        ? "bg-slate-500/10 text-slate-600 border-slate-500/30 text-[10px]"
                        : "bg-primary/10 text-primary border-primary/20 text-[10px]"
                    }
                  >
                    {s.shift}
                  </Badge>
                </div>

                <div className="mt-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{s.time}</span>
                  </div>
                  {!isRestDay && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>{s.location}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Shift Policies & Reminders */}
      <Card className="border-border/70 shadow-xs">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-lg font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Shift &amp; Attendance Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>15-Minute Grace Period:</strong> Shifts starting at 07:00 AM have a grace period until 07:15 AM before tardiness is computed.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Mandatory 1-Hour Meal Break:</strong> Must be logged between 11:30 AM and 01:30 PM for AM/Mid shifts.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Night Differential Hours:</strong> Hours worked between 10:00 PM and 06:00 AM are entitled to an additional 10% premium.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Shift Swap Modal */}
      <ShiftSwapModal
        open={swapModalOpen}
        onOpenChange={setSwapModalOpen}
        onSubmitSwap={() => {
          loadSchedule();
        }}
      />
    </div>
  );
}
