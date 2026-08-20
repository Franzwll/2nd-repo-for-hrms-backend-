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
import { Separator } from "@/components/ui/separator";
import { Download, Printer, FileText, AlertCircle, Building2, User, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { myProfile, myPayroll } from "@/data/ess";

interface PayslipViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  period?: string;
  netPay?: number;
  onInquiryClick?: (period: string) => void;
}

export function PayslipViewerModal({
  open,
  onOpenChange,
  period = "2026-07-01 – 07-15",
  netPay = myPayroll.net,
  onInquiryClick,
}: PayslipViewerModalProps) {
  const grossPay = myPayroll.gross;
  const totalDeductions = myPayroll.deductions.reduce((sum, item) => sum + item.amount, 0);

  const handlePrint = () => {
    window.print();
    toast.success("Printing payslip...");
  };

  const handleDownload = () => {
    toast.success(`Payslip for ${period} downloaded successfully as PDF.`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto print:p-0 print:border-none print:shadow-none">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-emerald-500/10 p-2 text-emerald-600">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-display">Official Pay Advice</DialogTitle>
                <DialogDescription>Pay Period: {period}</DialogDescription>
              </div>
            </div>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
              Released
            </Badge>
          </div>
        </DialogHeader>

        {/* Payslip Header Information */}
        <div className="rounded-lg border border-border bg-card p-4 text-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-border gap-2">
            <div>
              <p className="font-bold text-sm text-foreground">OXFORD SUITES MAKATI</p>
              <p className="text-muted-foreground text-[11px]">7840 Makati Avenue, Poblacion, Makati City</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-muted-foreground">Payout Date: <span className="font-semibold text-foreground">{myPayroll.nextPayout}</span></p>
              <p className="text-muted-foreground">Payroll Frequency: <span className="font-semibold text-foreground">Semi-Monthly</span></p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px]">
            <div>
              <p className="text-muted-foreground">Employee Name</p>
              <p className="font-semibold text-foreground">{myProfile.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Employee ID</p>
              <p className="font-semibold text-foreground">{myProfile.employeeId}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Department</p>
              <p className="font-semibold text-foreground">{myProfile.department}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Position</p>
              <p className="font-semibold text-foreground">{myProfile.position}</p>
            </div>
            <div>
              <p className="text-muted-foreground">TIN</p>
              <p className="font-semibold text-foreground">123-456-789-000</p>
            </div>
            <div>
              <p className="text-muted-foreground">Bank Account</p>
              <p className="font-semibold text-foreground">BDO ****4412</p>
            </div>
          </div>
        </div>

        {/* Itemized Earnings & Deductions Tables */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Earnings */}
          <div className="rounded-lg border border-border p-3.5 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
              <span>Earnings</span>
              <span className="text-[10px] font-normal text-muted-foreground">(PHP)</span>
            </h4>
            <div className="space-y-1.5 text-xs">
              {myPayroll.breakdown.map((item, idx) => (
                <div key={idx} className="flex justify-between py-0.5 border-b border-border/40 last:border-b-0">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium text-foreground">₱{item.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-border flex justify-between text-xs font-bold">
              <span>Gross Earnings</span>
              <span className="text-emerald-600 dark:text-emerald-400">₱{grossPay.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Deductions */}
          <div className="rounded-lg border border-border p-3.5 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center justify-between">
              <span>Deductions</span>
              <span className="text-[10px] font-normal text-muted-foreground">(PHP)</span>
            </h4>
            <div className="space-y-1.5 text-xs">
              {myPayroll.deductions.map((item, idx) => (
                <div key={idx} className="flex justify-between py-0.5 border-b border-border/40 last:border-b-0">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium text-rose-600 dark:text-rose-400">-₱{item.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-border flex justify-between text-xs font-bold">
              <span>Total Deductions</span>
              <span className="text-rose-600 dark:text-rose-400">-₱{totalDeductions.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Net Pay Highlight Banner */}
        <div className="rounded-xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/15 to-emerald-500/10 border border-emerald-500/30 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-semibold text-emerald-800 dark:text-emerald-300">Net Take-Home Pay</p>
            <p className="text-[11px] text-muted-foreground">Credited to registered payroll account</p>
          </div>
          <p className="text-2xl font-bold font-display text-emerald-600 dark:text-emerald-400">
            ₱{netPay.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-between items-center border-t border-border pt-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
            onClick={() => {
              onOpenChange(false);
              onInquiryClick?.(period);
            }}
          >
            <HelpCircle className="h-3.5 w-3.5 text-primary" />
            Have a payroll question or discrepancy?
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 text-xs">
              <Printer className="h-3.5 w-3.5" /> Print
            </Button>
            <Button size="sm" onClick={handleDownload} className="gap-1.5 text-xs">
              <Download className="h-3.5 w-3.5" /> Download PDF
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
