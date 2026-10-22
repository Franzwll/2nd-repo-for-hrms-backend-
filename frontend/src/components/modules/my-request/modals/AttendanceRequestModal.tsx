import { useMemo, useState } from "react";
import { ArrowLeftRight, Calendar, CheckCircle2, CalendarClock, Send, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { myLeaveBalances, myProfile } from "@/data/ess";
import { employees } from "@/data/hr";
import { essApi } from "@/lib/api";
import { RequestModalShell } from "../RequestModalShell";

interface AttendanceRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted?: () => void;
}

type AttendanceRequestType = "Leave Application" | "Shift Swap";

export function AttendanceRequestModal({
  open,
  onOpenChange,
  onSubmitted,
}: AttendanceRequestModalProps) {
  const [requestType, setRequestType] = useState<AttendanceRequestType>("Leave Application");

  // Leave application state
  const [leaveType, setLeaveType] = useState("Vacation Leave");
  const [duration, setDuration] = useState<"full" | "half_am" | "half_pm">("full");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [reason, setReason] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);

  // Shift swap state
  const [shiftDate, setShiftDate] = useState("");
  const [targetPeer, setTargetPeer] = useState("EMP-0005");
  const [peerShiftDate, setPeerShiftDate] = useState("");
  const [swapReason, setSwapReason] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const activeBalance = useMemo(() => {
    const found = myLeaveBalances.find((b) => b.type === leaveType);
    if (!found) return { total: 15, used: 0, available: 15 };
    return { total: found.total, used: found.used, available: found.total - found.used };
  }, [leaveType]);

  const requestedDays = useMemo(() => {
    if (duration !== "full") return 0.5;
    if (!dateFrom || !dateTo) return 1;
    const start = new Date(dateFrom);
    const end = new Date(dateTo);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 1;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [dateFrom, dateTo, duration]);

  const remainingAfterApproval = activeBalance.available - requestedDays;
  const isBalanceExceeded = remainingAfterApproval < 0;

  const peers = employees.filter(
    (e) => e.department === myProfile.department && e.name !== myProfile.name,
  );

  const reset = () => {
    setDateFrom("");
    setDateTo("");
    setReason("");
    setFileName(null);
    setShiftDate("");
    setPeerShiftDate("");
    setSwapReason("");
  };

  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateFrom) {
      toast.error("Please specify a starting date.");
      return;
    }
    if (isBalanceExceeded) {
      toast.error("Insufficient leave balance for this request.");
      return;
    }

    try {
      setSubmitting(true);
      const reqType = `${leaveType} (${requestedDays} day${requestedDays > 1 ? "s" : ""})`;
      await essApi.createRequest({
        category_code: "leave",
        category_name: "Leave",
        request_type: reqType,
        date_from: dateFrom,
        date_to: duration === "full" ? dateTo || dateFrom : dateFrom,
        details: reason ? `${reason} (Duration: ${duration})` : `Applied for ${reqType}`,
      });

      toast.success(
        `${leaveType} request filed successfully. Forwarded to supervisor for approval.`,
      );
      reset();
      onOpenChange(false);
      onSubmitted?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit leave request.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftDate || !peerShiftDate) {
      toast.error("Please provide both shift dates.");
      return;
    }

    const peerObj = employees.find((e) => e.id === targetPeer);

    try {
      setSubmitting(true);
      await essApi.createRequest({
        category_code: "schedule",
        category_name: "Shift Schedule",
        request_type: "Shift Swap Request",
        date_from: shiftDate,
        date_to: peerShiftDate,
        details: `Swap shift with ${peerObj?.name || "Colleague"} (${targetPeer}) on ${peerShiftDate}. Reason: ${swapReason}`,
      });

      toast.success(
        `Shift swap request sent to ${peerObj?.name || "colleague"} and Supervisor for approval.`,
      );
      reset();
      onOpenChange(false);
      onSubmitted?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit shift swap request.");
    } finally {
      setSubmitting(false);
    }
  };

  const isLeave = requestType === "Leave Application";

  return (
    <RequestModalShell
      open={open}
      onOpenChange={onOpenChange}
      icon={isLeave ? CalendarClock : ArrowLeftRight}
      title={isLeave ? "Apply for Leave" : "Request Shift Swap"}
      subtitle={
        isLeave
          ? "Submit a formal paid or statutory leave request."
          : `Trade scheduled shifts with a colleague in ${myProfile.department}.`
      }
    >
      <form
        onSubmit={isLeave ? handleSubmitLeave : handleSubmitSwap}
        className="space-y-4 px-6 py-5"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Request Type</Label>
            <Select
              value={requestType}
              onValueChange={(v) => setRequestType(v as AttendanceRequestType)}
            >
              <SelectTrigger className="h-9 bg-background text-xs focus:border-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Leave Application" className="text-xs">
                  Leave Application
                </SelectItem>
                <SelectItem value="Shift Swap" className="text-xs">
                  Shift Swap
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLeave ? (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Leave Category</Label>
              <Select value={leaveType} onValueChange={setLeaveType}>
                <SelectTrigger className="h-9 bg-background text-xs focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {myLeaveBalances.map((b) => (
                    <SelectItem key={b.type} value={b.type} className="text-xs">
                      {b.type} ({b.total - b.used} days remaining)
                    </SelectItem>
                  ))}
                  <SelectItem value="Bereavement Leave" className="text-xs">
                    Bereavement Leave (3 days)
                  </SelectItem>
                  <SelectItem value="Maternity / Paternity Leave" className="text-xs">
                    Maternity / Paternity Leave
                  </SelectItem>
                  <SelectItem value="Magna Carta Leave" className="text-xs">
                    Magna Carta Leave
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Select Colleague to Swap With</Label>
              <Select value={targetPeer} onValueChange={setTargetPeer}>
                <SelectTrigger className="h-9 bg-background text-xs focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {peers.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-xs">
                      {p.name} ({p.position})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {isLeave ? (
          <>
            <div className="flex items-center justify-between rounded-lg border border-border/80 bg-muted/30 p-3 text-xs">
              <div>
                <span className="text-muted-foreground">Current Available Balance: </span>
                <span className="font-bold text-foreground">{activeBalance.available} days</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <span className="text-muted-foreground">After filing:</span>
                <span
                  className={
                    isBalanceExceeded ? "font-bold text-rose-600" : "font-bold text-emerald-600"
                  }
                >
                  {remainingAfterApproval} day(s)
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Leave Duration</Label>
              <RadioGroup
                value={duration}
                onValueChange={(val: any) => setDuration(val)}
                className="grid grid-cols-3 gap-2"
              >
                {[
                  { value: "full", label: "Full Day", id: "mr-r-full" },
                  { value: "half_am", label: "Half Day (AM)", id: "mr-r-half-am" },
                  { value: "half_pm", label: "Half Day (PM)", id: "mr-r-half-pm" },
                ].map((opt) => (
                  <Label
                    key={opt.value}
                    htmlFor={opt.id}
                    className={`flex cursor-pointer items-center justify-center gap-2 rounded-md border p-2 text-xs font-medium transition-colors ${
                      duration === opt.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <RadioGroupItem value={opt.value} id={opt.id} className="sr-only" />
                    {opt.label}
                  </Label>
                ))}
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Start Date</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  required
                />
              </div>
              {duration === "full" && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">End Date</Label>
                  <Input
                    type="date"
                    value={dateTo}
                    min={dateFrom}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Reason / Justification</Label>
              <Textarea
                rows={3}
                placeholder="State your reason for leave..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                Attachment (Optional for Sick/Medical Leave)
              </Label>
              <div className="rounded-lg border border-dashed border-border p-3 text-center transition-colors hover:border-primary/60">
                <label className="flex cursor-pointer flex-col items-center gap-1 text-xs text-muted-foreground">
                  <Upload className="h-4 w-4 text-primary" />
                  <span>
                    {fileName
                      ? fileName
                      : "Click to upload medical cert or proof (PDF, JPG up to 5MB)"}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setFileName(file.name);
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-md border border-border/70 bg-muted/40 p-2.5 text-[11px] text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
              <span>
                <strong>Approval Chain:</strong> {myProfile.supervisor} (Supervisor) → Juan Dela
                Cruz (HR Admin)
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">My Current Shift Date</Label>
                <Input
                  type="date"
                  value={shiftDate}
                  onChange={(e) => setShiftDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Colleague's Shift Date</Label>
                <Input
                  type="date"
                  value={peerShiftDate}
                  onChange={(e) => setPeerShiftDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Reason for Swap</Label>
              <Textarea
                rows={3}
                placeholder="State reason for shifting schedule..."
                value={swapReason}
                onChange={(e) => setSwapReason(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center gap-2 rounded-md border border-border/70 bg-muted/40 p-2.5 text-[11px] text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
              <span>
                Requires mutual agreement and supervisor approval at least 24 hours in advance.
              </span>
            </div>
          </>
        )}

        <div className="flex flex-col-reverse justify-end gap-2 border-t border-border/70 pt-4 sm:flex-row">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting || (isLeave && isBalanceExceeded)}
            className="w-full gap-1.5 px-5 text-xs font-semibold shadow-xs sm:w-auto"
          >
            <Send className="h-3.5 w-3.5" />
            {isLeave ? "Submit Leave Request" : "Send Swap Request"}
          </Button>
        </div>
      </form>
    </RequestModalShell>
  );
}
