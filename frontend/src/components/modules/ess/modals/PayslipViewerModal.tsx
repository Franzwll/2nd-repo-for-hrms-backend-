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
import { Download, Printer, FileText, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { myProfile, myPayroll } from "@/data/ess";
import { OfficialPayslipDocument } from "@/components/modules/ess/shared/OfficialPayslipDocument";
import { printReceipt } from "@/lib/printReceipt";
import { downloadPayslipPdf } from "@/lib/downloadPayslipPdf";

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
  netPay = 9120,
  onInquiryClick,
}: PayslipViewerModalProps) {
  const handlePrint = () => {
    printReceipt("official-payslip-receipt", `Oxford Suites Makati - Pay Advice (${period})`);
    toast.success("Printing official pay advice...");
  };

  const handleDownload = async () => {
    try {
      const safeFilename = `Oxford-Suites-Makati-Payslip-${period.replace(/[\s–—/]+/g, "-")}.pdf`;
      await downloadPayslipPdf("official-payslip-receipt", safeFilename, {
        payPeriod: period,
        payDate: "05/08/2026",
        paidDays: 15,
        lopDays: 0,
        earnings: earningsWithYtd,
        deductions: deductionsWithYtd,
        netPay: netPay,
      });
      toast.success(`Payslip (${period}) downloaded successfully!`);
    } catch (err) {
      toast.error("Failed to generate PDF.");
    }
  };

  const earningsWithYtd = [
    { label: "Basic Pay", amount: 16000, ytd: 112000 },
    { label: "Overtime Pay", amount: 2100, ytd: 14700 },
    { label: "Night Differential", amount: 900, ytd: 6300 },
    { label: "Meal Allowance", amount: 1500, ytd: 10500 },
    { label: "Service Charge Share", amount: 1000, ytd: 7000 },
  ];

  const deductionsWithYtd = [
    { label: "SSS Contribution", amount: 900, ytd: 6300 },
    { label: "PhilHealth Premium", amount: 550, ytd: 3850 },
    { label: "Pag-IBIG HDMF", amount: 200, ytd: 1400 },
    { label: "Withholding Tax (BIR)", amount: 1160, ytd: 8120 },
    { label: "Company Salary Loan", amount: 450, ytd: 3150 },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[850px] max-h-[92vh] overflow-y-auto p-4 sm:p-6 print:p-0 print:border-none print:shadow-none">
        <DialogHeader className="print:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-display">Official Pay Advice Stub</DialogTitle>
                <DialogDescription className="text-xs">Period: {period}</DialogDescription>
              </div>
            </div>
            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs"
            >
              Released
            </Badge>
          </div>
        </DialogHeader>

        {/* Realistic Payslip Document */}
        <OfficialPayslipDocument
          companyName="Oxford Suites Makati"
          companyAddress="7840 Makati Avenue, Poblacion, Makati City, Philippines 1210"
          employeeName={myProfile.name || "Kevin Santos"}
          employeeId={myProfile.employeeId || "OSM-2026-0142"}
          designation={myProfile.position || "Line Cook"}
          department={myProfile.department || "Kitchen / Culinary"}
          dateOfJoining={myProfile.dateHired ? new Date(myProfile.dateHired).toLocaleDateString("en-GB") : "15/04/2026"}
          payPeriod={period}
          payDate="05/08/2026"
          paidDays={15}
          lopDays={0}
          bankAccount="BDO ****4412"
          tin="123-456-789-000"
          sss="34-1234567-8"
          philHealth="12-345678901-2"
          pagIbig="1234-5678-9012"
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
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 text-xs">
              <Printer className="h-3.5 w-3.5" /> Print
            </Button>
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
