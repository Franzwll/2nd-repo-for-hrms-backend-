import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Calendar, Upload, Send, ShieldAlert, CheckCircle2, FileText, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { myLeaveBalances, myProfile } from "@/data/ess";
import { essApi } from "@/lib/api";

interface LeaveApplicationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitLeave?: (leaveData: any) => void;
}

export function LeaveApplicationModal({ open, onOpenChange, onSubmitLeave }: LeaveApplicationModalProps) {
  const [leaveType, setLeaveType] = useState("Vacation Leave");
  const [duration, setDuration] = useState<"full" | "half_am" | "half_pm">("full");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [reason, setReason] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);

  // Find balance for selected leave
  const activeBalance = useMemo(() => {
    const found = myLeaveBalances.find((b) => b.type === leaveType);
    if (!found) return { total: 15, used: 0, available: 15 };
    return {
      total: found.total,
      used: found.used,
      available: found.total - found.used,
    };
  }, [leaveType]);

  // Calculate requested days
  const requestedDays = useMemo(() => {
    if (duration !== "full") return 0.5;
    if (!dateFrom || !dateTo) return 1;
    const start = new Date(dateFrom);
    const end = new Date(dateTo);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 1;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }, [dateFrom, dateTo, duration]);

  const remainingAfterApproval = activeBalance.available - requestedDays;
  const isBalanceExceeded = remainingAfterApproval < 0;

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
      const res = await essApi.createRequest({
        category_code: "leave",
        category_name: "Leave",
        request_type: reqType,
        date_from: dateFrom,
        date_to: duration === "full" ? dateTo || dateFrom : dateFrom,
        details: reason ? `${reason} (Duration: ${duration})` : `Applied for ${reqType}`,
      });

      toast.success(`${leaveType} request filed successfully. Forwarded to supervisor for approval.`);
      onSubmitLeave?.(res.request);
      onOpenChange(false);
      // Reset form
      setDateFrom("");
      setDateTo("");
      setReason("");
      setFileName(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit leave request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-primary/10 p-2 text-primary">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-display">Apply for Leave</DialogTitle>
              <DialogDescription>Submit a formal paid or statutory leave request.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Leave Type Selector & Live Balance Banner */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Leave Category</Label>
            <Select value={leaveType} onValueChange={setLeaveType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {myLeaveBalances.map((b) => (
                  <SelectItem key={b.type} value={b.type}>
                    {b.type} ({b.total - b.used} days remaining)
                  </SelectItem>
                ))}
                <SelectItem value="Bereavement Leave">Bereavement Leave (3 days)</SelectItem>
                <SelectItem value="Maternity / Paternity Leave">Maternity / Paternity Leave</SelectItem>
                <SelectItem value="Magna Carta Leave">Magna Carta Leave</SelectItem>
              </SelectContent>
            </Select>

            {/* Dynamic Live Balance Pill */}
            <div className="rounded-lg border border-border/80 bg-muted/30 p-3 text-xs flex items-center justify-between">
              <div>
                <span className="text-muted-foreground">Current Available Balance: </span>
                <span className="font-bold text-foreground">{activeBalance.available} days</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <span className="text-muted-foreground">After filing:</span>
                <span className={isBalanceExceeded ? "text-rose-600 font-bold" : "text-emerald-600 font-bold"}>
                  {remainingAfterApproval} day(s)
                </span>
              </div>
            </div>
          </div>

          {/* Duration Radio Toggle */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Leave Duration</Label>
            <RadioGroup
              value={duration}
              onValueChange={(val: any) => setDuration(val)}
              className="grid grid-cols-3 gap-2"
            >
              <Label
                htmlFor="r-full"
                className={`flex items-center justify-center gap-2 rounded-md border p-2 text-xs font-medium cursor-pointer transition-colors ${
                  duration === "full" ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"
                }`}
              >
                <RadioGroupItem value="full" id="r-full" className="sr-only" />
                Full Day
              </Label>
              <Label
                htmlFor="r-half-am"
                className={`flex items-center justify-center gap-2 rounded-md border p-2 text-xs font-medium cursor-pointer transition-colors ${
                  duration === "half_am" ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"
                }`}
              >
                <RadioGroupItem value="half_am" id="r-half-am" className="sr-only" />
                Half Day (AM)
              </Label>
              <Label
                htmlFor="r-half-pm"
                className={`flex items-center justify-center gap-2 rounded-md border p-2 text-xs font-medium cursor-pointer transition-colors ${
                  duration === "half_pm" ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"
                }`}
              >
                <RadioGroupItem value="half_pm" id="r-half-pm" className="sr-only" />
                Half Day (PM)
              </Label>
            </RadioGroup>
          </div>

          {/* Dates Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

          {/* Reason Field */}
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

          {/* Medical Certificate / Supporting Document Attachment */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Attachment (Optional for Sick/Medical Leave)</Label>
            <div className="rounded-lg border border-dashed border-border p-3 text-center hover:border-primary/60 transition-colors">
              <label className="cursor-pointer flex flex-col items-center gap-1 text-xs text-muted-foreground">
                <Upload className="h-4 w-4 text-primary" />
                <span>{fileName ? fileName : "Click to upload medical cert or proof (PDF, JPG up to 5MB)"}</span>
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

          {/* Approver Route Preview */}
          <div className="rounded-md bg-muted/40 border border-border/70 p-2.5 text-[11px] text-muted-foreground flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
            <span>
              <strong>Approval Chain:</strong> {myProfile.supervisor} (Supervisor) → Juan Dela Cruz (HR Admin)
            </span>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isBalanceExceeded} className="gap-1.5">
              <Send className="h-4 w-4" /> Submit Leave Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
