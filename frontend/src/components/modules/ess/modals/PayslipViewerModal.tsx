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
import { Download, FileText, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { OfficialPayslipDocument } from "@/components/modules/ess/shared/OfficialPayslipDocument";
import { downloadPayslipPdf } from "@/lib/downloadPayslipPdf";
import { useEssProfile } from "@/hooks/useEssProfile";

interface PayslipViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  period?: string;
  netPay?: number;
  /** Full record from GET /ess/my-payroll — carries itemized lines when present. */
  payslip?: {
    earnings?: { label: string; amount: number; ytd: number }[];
    deductions_breakdown?: { label: string; amount: number; ytd: number }[];
    payoutDate?: string;
    status?: string;
  } | null;
  onInquiryClick?: (period: string) => void;
}

export function PayslipViewerModal({
  open,
  onOpenChange,
  period = "",
  netPay = 0,
  payslip,
  onInquiryClick,
}: PayslipViewerModalProps) {
  const { employee } = useEssProfile();
  const handleDownload = async () => {
    try {
      const safeFilename = `Oxford-Suites-Makati-Payslip-${period.replace(/[\s–—/]+/g, "-")}.pdf`;
      await downloadPayslipPdf("official-payslip-receipt", safeFilename, {
        payPeriod: period,
        payDate: payslip?.payoutDate ?? "",
        paidDays: 0,
        lopDays: 0,
        employeeName: employee?.name ?? "",
        employeeId: employee?.code ?? "",
        designation: employee?.position ?? "",
        department: employee?.department ?? "",
        dateOfJoining: employee?.date_hired ?? "",
        tin: employee?.tin_number ?? "",
        sss: employee?.sss_number ?? "",
        philHealth: employee?.philhealth_number ?? "",
        pagIbig: employee?.pagibig_number ?? "",
        earnings: earningsWithYtd,
        deductions: deductionsWithYtd,
        netPay: netPay,
      });
      toast.success(`Payslip (${period}) downloaded successfully!`);
    } catch {
      toast.error("Failed to generate PDF.");
    }
  };

  // Itemized lines from the payroll record when the backend provides them.
  const earningsWithYtd = payslip?.earnings ?? [];
  const deductionsWithYtd = payslip?.deductions_breakdown ?? [];

  const payDate = payslip?.payoutDate ?? "—";
  const stubStatus = payslip?.status ?? "—";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-[850px] max-h-[92vh] overflow-y-auto p-4 sm:p-6 print:p-0 print:border-none print:shadow-none">
        <DialogHeader className="print:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-emerald-500/10 dark:bg-emerald-400/10 p-2 text-emerald-600 dark:text-emerald-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-display">Official Pay Advice Stub</DialogTitle>
                <DialogDescription className="text-xs">Period: {period}</DialogDescription>
              </div>
            </div>
            <Badge
              variant="outline"
              className="bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 dark:border-emerald-400/20 text-xs"
            >
              {stubStatus}
            </Badge>
          </div>
        </DialogHeader>

        {/* Realistic Payslip Document */}
        <OfficialPayslipDocument
          companyName="Oxford Suites Makati"
          companyAddress="7840 Makati Avenue, Poblacion, Makati City, Philippines 1210"
          employeeName={employee?.name ?? ""}
          employeeId={employee?.code ?? ""}
          designation={employee?.position ?? ""}
          department={employee?.department ?? ""}
          dateOfJoining={employee?.date_hired ?? ""}
          payPeriod={period}
          payDate={payDate}
          paidDays={0}
          lopDays={0}
          bankAccount=""
          tin={employee?.tin_number ?? ""}
          sss={employee?.sss_number ?? ""}
          philHealth={employee?.philhealth_number ?? ""}
          pagIbig={employee?.pagibig_number ?? ""}
          earnings={earningsWithYtd}
          deductions={deductionsWithYtd}
          netPay={netPay}
        />

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-between items-center border-t border-border pt-3 print:hidden">
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
            <Button
              size="sm"
              onClick={handleDownload}
              className="gap-1.5 text-xs bg-rose-700 hover:bg-rose-800 text-white"
            >
              <Download className="h-3.5 w-3.5" /> Download PDF
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
