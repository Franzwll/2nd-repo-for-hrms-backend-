import { useState, useMemo, useEffect } from "react";
import {
  Calendar,
  Upload,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Palmtree,
  Stethoscope,
  CalendarDays,
  FileCheck,
  RotateCcw,
  Sparkles,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { myLeaveBalances, myProfile } from "@/data/ess";
import { essApi, type ApiLeaveBalance } from "@/lib/api";

export function EssLeaveTab() {
  const [leaveType, setLeaveType] = useState("Vacation Leave");
  const [duration, setDuration] = useState<"full" | "half_am" | "half_pm">("full");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [reason, setReason] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [balances, setBalances] = useState<ApiLeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLeaves = async () => {
    try {
      setLoading(true);
      const res = await essApi.leaves();
      if (res?.balances) {
        setBalances(res.balances);
      }
    } catch {
      // handled gracefully
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  // Find balance for selected leave
  const activeBalance = useMemo(() => {
    const searchToken = (leaveType.toLowerCase().split(" ")[0] || "");
    const foundApi = balances.find((b) => b.type.toLowerCase().includes(searchToken));
    if (foundApi) {
      return {
        total: foundApi.total,
        used: foundApi.used,
        available: foundApi.available,
      };
    }
    const foundStatic = myLeaveBalances.find((b) => b.type === leaveType);
    if (foundStatic) {
      return {
        total: foundStatic.total,
        used: foundStatic.used,
        available: Math.max(0, foundStatic.total - foundStatic.used),
      };
    }
    return { total: 15, used: 0, available: 15 };
  }, [leaveType, balances]);

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

  const handleReset = () => {
    setDateFrom("");
    setDateTo("");
    setReason("");
    setFileName(null);
    setDuration("full");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateFrom) {
      toast.error("Please specify a start date.");
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

      toast.success(`${leaveType} application submitted successfully. Forwarded to supervisor for approval.`);
      handleReset();
      loadLeaves();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit leave application.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Apply for Leave
        </h3>
        <p className="text-xs text-muted-foreground">
          Submit a formal paid or statutory leave application for supervisor approval.
        </p>
      </div>

      {/* Main Full Page Form Layout */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Full Page Leave Application Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-border/70 shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="font-display text-lg font-semibold flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-primary" />
                Leave Application Form
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Please complete all required fields. Your request will route to your supervisor automatically.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Leave Type Selector & Dynamic Balance Banner */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Leave Category</Label>
                  <Select value={leaveType} onValueChange={setLeaveType}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vacation Leave">Vacation Leave</SelectItem>
                      <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                      <SelectItem value="Emergency Leave">Emergency Leave</SelectItem>
                      <SelectItem value="Solo Parent Leave">Solo Parent Leave</SelectItem>
                      <SelectItem value="Bereavement Leave">Bereavement Leave</SelectItem>
                      <SelectItem value="Maternity / Paternity Leave">Maternity / Paternity Leave</SelectItem>
                      <SelectItem value="Magna Carta Leave">Magna Carta Leave</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Dynamic Balance Pill */}
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

                {/* Duration Toggle */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Leave Duration</Label>
                  <RadioGroup
                    value={duration}
                    onValueChange={(val: any) => setDuration(val)}
                    className="grid grid-cols-3 gap-2"
                  >
                    <Label
                      htmlFor="form-full"
                      className={`flex items-center justify-center gap-2 rounded-md border p-2.5 text-xs font-medium cursor-pointer transition-colors ${
                        duration === "full" ? "border-primary bg-primary/10 text-primary font-semibold" : "border-border hover:bg-muted"
                      }`}
                    >
                      <RadioGroupItem value="full" id="form-full" className="sr-only" />
                      Full Day
                    </Label>
                    <Label
                      htmlFor="form-half-am"
                      className={`flex items-center justify-center gap-2 rounded-md border p-2.5 text-xs font-medium cursor-pointer transition-colors ${
                        duration === "half_am" ? "border-primary bg-primary/10 text-primary font-semibold" : "border-border hover:bg-muted"
                      }`}
                    >
                      <RadioGroupItem value="half_am" id="form-half-am" className="sr-only" />
                      Half Day (AM)
                    </Label>
                    <Label
                      htmlFor="form-half-pm"
                      className={`flex items-center justify-center gap-2 rounded-md border p-2.5 text-xs font-medium cursor-pointer transition-colors ${
                        duration === "half_pm" ? "border-primary bg-primary/10 text-primary font-semibold" : "border-border hover:bg-muted"
                      }`}
                    >
                      <RadioGroupItem value="half_pm" id="form-half-pm" className="sr-only" />
                      Half Day (PM)
                    </Label>
                  </RadioGroup>
                </div>

                {/* Dates Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Start Date *</Label>
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

                {/* Reason Textarea */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Reason / Justification *</Label>
                  <Textarea
                    rows={3}
                    placeholder="State the purpose or justification for this leave application..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
                </div>

                {/* Attachment Upload */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Supporting Attachment (Optional for Medical/Emergency)</Label>
                  <div className="rounded-lg border border-dashed border-border p-4 text-center hover:border-primary/60 transition-colors">
                    <label className="cursor-pointer flex flex-col items-center gap-1.5 text-xs text-muted-foreground">
                      <Upload className="h-5 w-5 text-primary" />
                      <span>{fileName ? fileName : "Upload medical certificate or proof (PDF, JPG, PNG up to 5MB)"}</span>
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

                {/* Approver Preview */}
                <div className="rounded-md bg-muted/40 border border-border/70 p-3 text-xs text-muted-foreground flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>
                    <strong>Approval Chain:</strong> {myProfile.supervisor} (Supervisor) → Juan Dela Cruz (HR Administration)
                  </span>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <Button type="button" variant="outline" size="sm" onClick={handleReset} className="gap-1.5 text-xs">
                    <RotateCcw className="h-3.5 w-3.5" /> Clear Form
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isBalanceExceeded || submitting}
                    className="gap-1.5 bg-primary text-primary-foreground font-semibold text-xs shadow-xs"
                  >
                    <Send className="h-3.5 w-3.5" /> {submitting ? "Submitting..." : "Submit Leave Request"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Entitlement Overview & Leave Guidelines (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Balance Summary */}
          <Card className="border-border/70 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base font-semibold flex items-center gap-2">
                <Palmtree className="h-4 w-4 text-primary" />
                Current Entitlements Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(balances.length > 0 ? balances.slice(0, 4) : myLeaveBalances).map((b: any) => {
                const available = b.available ?? Math.max(0, b.total - b.used);
                const percent = b.total > 0 ? Math.round((available / b.total) * 100) : 0;
                return (
                  <div key={b.type} className="space-y-1 rounded-lg border border-border/60 p-3 bg-card/60">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-foreground">{b.type}</span>
                      <span className="text-primary font-mono">{available} / {b.total} days</span>
                    </div>
                    <Progress value={percent} className="h-1.5 mt-1.5" />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Leave Policies & Guidelines */}
          <Card className="border-border/70 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base font-semibold flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                Filing Guidelines &amp; Policies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>3-Day Advance Notice:</strong> Planned Vacation Leave requests must be filed at least 3 days prior to the effective date.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Medical Certificate Requirement:</strong> Sick leave spanning 2 or more consecutive working days requires an attached medical certificate upon return.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Emergency Leave Notice:</strong> Must be filed within 24 hours of resuming active duty shift.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Review Turnaround:</strong> Standard supervisor and HR review turnaround is within 24–48 business hours.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
