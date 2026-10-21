import { useState } from "react";
import { Calendar, Send, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { essApi } from "@/lib/api";
import { RequestModalShell } from "../RequestModalShell";

interface PayrollRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted?: () => void;
}

const PAYROLL_TYPES = [
  { value: "Payroll Clarification", label: "Payroll / Deduction Clarification" },
  { value: "Overtime Request", label: "Overtime Rendered Claim" },
  { value: "Night Differential Dispute", label: "Night Differential Dispute" },
  { value: "Payslip Copy Request", label: "Certified Payslip Copy Request" },
  { value: "Bank Account Update", label: "Bank / Payroll Account Update" },
];

function formatPeriodDisplay(startStr: string, endStr: string) {
  if (!startStr && !endStr) return "";
  try {
    const s = startStr ? new Date(`${startStr}T00:00:00`) : null;
    const e = endStr ? new Date(`${endStr}T00:00:00`) : null;
    if (s && e) {
      const sFmt = s.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const eFmt = e.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      return `${sFmt} – ${eFmt}`;
    }
    if (s) {
      return `From ${s.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    }
  } catch {
    // fall back to raw values
  }
  return `${startStr} – ${endStr}`;
}

export function PayrollRequestModal({ open, onOpenChange, onSubmitted }: PayrollRequestModalProps) {
  const [payType, setPayType] = useState("Payroll Clarification");
  const [payPeriodStart, setPayPeriodStart] = useState("");
  const [payPeriodEnd, setPayPeriodEnd] = useState("");
  const [payDetails, setPayDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const coveredPeriodText =
    payPeriodStart && payPeriodEnd
      ? formatPeriodDisplay(payPeriodStart, payPeriodEnd)
      : payPeriodStart || payPeriodEnd || "";

  const reset = () => {
    setPayPeriodStart("");
    setPayPeriodEnd("");
    setPayDetails("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payDetails.trim()) {
      toast.error("Please enter inquiry details or claimed hours.");
      return;
    }

    try {
      setSubmitting(true);
      await essApi.createRequest({
        category_code: "payroll",
        category_name: "Payroll",
        request_type: payType,
        date_from: payPeriodStart || undefined,
        date_to: payPeriodEnd || undefined,
        details: `${coveredPeriodText ? `Covered Period: ${coveredPeriodText}. ` : ""}${payDetails.trim()}`,
      });
      toast.success(`${payType} submitted to Payroll Administration.`);
      reset();
      onOpenChange(false);
      onSubmitted?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit payroll inquiry.");
    } finally {
      setSubmitting(false);
    }
  };

  const setFirstCutoff = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    setPayPeriodStart(`${y}-${m}-01`);
    setPayPeriodEnd(`${y}-${m}-15`);
  };

  const setSecondCutoff = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
    setPayPeriodStart(`${y}-${m}-16`);
    setPayPeriodEnd(`${y}-${m}-${lastDay}`);
  };

  return (
    <RequestModalShell
      open={open}
      onOpenChange={onOpenChange}
      icon={Wallet}
      title="Submit New Payroll Request / Inquiry"
      subtitle="File an overtime rendered claim, report a deduction discrepancy, or request certified payslip copies."
    >
      <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Request Type</Label>
            <Select value={payType} onValueChange={setPayType}>
              <SelectTrigger className="h-9 bg-background text-xs focus:border-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYROLL_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value} className="text-xs">
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1.5 text-xs font-semibold">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                Covered Pay Period
              </Label>
              {payPeriodStart && payPeriodEnd && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                  {formatPeriodDisplay(payPeriodStart, payPeriodEnd)}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={payPeriodStart}
                onChange={(e) => setPayPeriodStart(e.target.value)}
                onClick={(e) => (e.currentTarget as any).showPicker?.()}
                className="h-9 cursor-pointer bg-background text-xs"
                placeholder="Start date"
                required
              />
              <Input
                type="date"
                value={payPeriodEnd}
                min={payPeriodStart || undefined}
                onChange={(e) => setPayPeriodEnd(e.target.value)}
                onClick={(e) => (e.currentTarget as any).showPicker?.()}
                className="h-9 cursor-pointer bg-background text-xs"
                placeholder="End date"
                required
              />
            </div>
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                Presets:
              </span>
              <button
                type="button"
                onClick={setFirstCutoff}
                className="cursor-pointer text-[11px] text-primary transition-colors hover:text-primary/80 hover:underline"
              >
                1st–15th Cut-off
              </button>
              <span className="text-[10px] text-muted-foreground/40">·</span>
              <button
                type="button"
                onClick={setSecondCutoff}
                className="cursor-pointer text-[11px] text-primary transition-colors hover:text-primary/80 hover:underline"
              >
                16th–End Cut-off
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Inquiry Details / Hours Claimed</Label>
          <Textarea
            rows={4}
            placeholder="Describe your inquiry, specify overtime rendered with date/hours, or note any discrepancies..."
            value={payDetails}
            onChange={(e) => setPayDetails(e.target.value)}
            className="resize-none bg-background text-xs focus:border-primary"
            required
          />
        </div>

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
            disabled={submitting}
            className="w-full gap-1.5 px-5 text-xs font-semibold shadow-xs sm:w-auto"
          >
            <Send className="h-3.5 w-3.5" />{" "}
            {submitting ? "Submitting..." : "Submit Payroll Request"}
          </Button>
        </div>
      </form>
    </RequestModalShell>
  );
}
