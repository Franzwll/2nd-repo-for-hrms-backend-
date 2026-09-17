import { useState, useEffect } from "react";
import {
  FileText,
  Printer,
  Download,
  HelpCircle,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { myProfile, myPayroll } from "@/data/ess";
import { essApi, type ApiPayrollData } from "@/lib/api";
import { OfficialPayslipDocument } from "@/components/modules/ess/shared/OfficialPayslipDocument";

import { printReceipt } from "@/lib/printReceipt";
import { downloadPayslipPdf } from "@/lib/downloadPayslipPdf";

const PERIOD_PRESETS: Record<
  string,
  {
    payPeriod: string;
    payDate: string;
    paidDays: number;
    lopDays: number;
    earnings: Array<{ label: string; amount: number; ytd: number }>;
    deductions: Array<{ label: string; amount: number; ytd: number }>;
    netPay: number;
  }
> = {
  "2026-07-01 – 07-15": {
    payPeriod: "2026-07-01 – 07-15",
    payDate: "05/08/2026",
    paidDays: 15,
    lopDays: 0,
    earnings: [
      { label: "Basic Pay", amount: 16000, ytd: 112000 },
      { label: "Overtime Pay", amount: 2100, ytd: 14700 },
      { label: "Night Differential", amount: 900, ytd: 6300 },
      { label: "Meal Allowance", amount: 1500, ytd: 10500 },
      { label: "Service Charge Share", amount: 1000, ytd: 7000 },
    ],
    deductions: [
      { label: "SSS Contribution", amount: 900, ytd: 6300 },
      { label: "PhilHealth Premium", amount: 550, ytd: 3850 },
      { label: "Pag-IBIG HDMF", amount: 200, ytd: 1400 },
      { label: "Withholding Tax (BIR)", amount: 1160, ytd: 8120 },
      { label: "Company Salary Loan", amount: 450, ytd: 3150 },
    ],
    netPay: 9120,
  },
  "2026-06-16 – 06-30": {
    payPeriod: "2026-06-16 – 06-30",
    payDate: "20/07/2026",
    paidDays: 15,
    lopDays: 0,
    earnings: [
      { label: "Basic Pay", amount: 16000, ytd: 96000 },
      { label: "Overtime Pay", amount: 1800, ytd: 12600 },
      { label: "Night Differential", amount: 800, ytd: 5400 },
      { label: "Meal Allowance", amount: 1500, ytd: 9000 },
      { label: "Service Charge Share", amount: 950, ytd: 6000 },
    ],
    deductions: [
      { label: "SSS Contribution", amount: 900, ytd: 5400 },
      { label: "PhilHealth Premium", amount: 550, ytd: 3300 },
      { label: "Pag-IBIG HDMF", amount: 200, ytd: 1200 },
      { label: "Withholding Tax (BIR)", amount: 1100, ytd: 6960 },
      { label: "Company Salary Loan", amount: 450, ytd: 2700 },
    ],
    netPay: 9040,
  },
  "2026-06-01 – 06-15": {
    payPeriod: "2026-06-01 – 06-15",
    payDate: "05/07/2026",
    paidDays: 14,
    lopDays: 1,
    earnings: [
      { label: "Basic Pay", amount: 16000, ytd: 80000 },
      { label: "Overtime Pay", amount: 1200, ytd: 10800 },
      { label: "Night Differential", amount: 750, ytd: 4600 },
      { label: "Meal Allowance", amount: 1500, ytd: 7500 },
      { label: "Service Charge Share", amount: 900, ytd: 5050 },
    ],
    deductions: [
      { label: "SSS Contribution", amount: 900, ytd: 4500 },
      { label: "PhilHealth Premium", amount: 550, ytd: 2750 },
      { label: "Pag-IBIG HDMF", amount: 200, ytd: 1000 },
      { label: "Withholding Tax (BIR)", amount: 1050, ytd: 5860 },
      { label: "Company Salary Loan", amount: 450, ytd: 2250 },
    ],
    netPay: 8975,
  },
};

export function EssLatestPayslipTab() {
  const [selectedKey, setSelectedKey] = useState<string>("2026-07-01 – 07-15");
  const [payrollData, setPayrollData] = useState<ApiPayrollData | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    essApi
      .myPayroll()
      .then((res) => {
        if (res) setPayrollData(res);
      })
      .catch(() => {});
  }, []);

  const currentPreset = PERIOD_PRESETS[selectedKey] || PERIOD_PRESETS["2026-07-01 – 07-15"];

  const handlePrint = () => {
    printReceipt("official-payslip-receipt", `Oxford Suites Makati - Pay Advice (${currentPreset.payPeriod})`);
    toast.success("Printing official pay advice...");
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const safeFilename = `Oxford-Suites-Makati-Payslip-${currentPreset.payPeriod.replace(/[\s–—/]+/g, "-")}.pdf`;
      await downloadPayslipPdf("official-payslip-receipt", safeFilename, {
        payPeriod: currentPreset.payPeriod,
        payDate: currentPreset.payDate,
        paidDays: currentPreset.paidDays,
        lopDays: currentPreset.lopDays,
        earnings: currentPreset.earnings,
        deductions: currentPreset.deductions,
        netPay: currentPreset.netPay,
      });
      toast.success(`Payslip (${currentPreset.payPeriod}) downloaded successfully!`);
    } catch (err) {
      toast.error("Failed to generate PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Controls & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h3 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Official Pay Advice
          </h3>
          <p className="text-xs text-muted-foreground">
            Official itemized payslip receipt with YTD statutory deductions and net earnings.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Select value={selectedKey} onValueChange={setSelectedKey}>
            <SelectTrigger className="h-9 w-[210px] text-xs font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2026-07-01 – 07-15">July 01 – 15, 2026</SelectItem>
              <SelectItem value="2026-06-16 – 06-30">June 16 – 30, 2026</SelectItem>
              <SelectItem value="2026-06-01 – 06-15">June 01 – 15, 2026</SelectItem>
            </SelectContent>
          </Select>

          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 px-2.5 py-1 text-xs font-semibold"
          >
            Released
          </Badge>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="h-9 gap-1.5 text-xs font-medium"
          >
            <Printer className="h-4 w-4" /> Print
          </Button>

          <Button
            size="sm"
            onClick={handleDownload}
            className="h-9 gap-1.5 text-xs font-medium bg-rose-700 hover:bg-rose-800 text-white shadow-xs"
          >
            <Download className="h-4 w-4" /> Download PDF
          </Button>
        </div>
      </div>

      {/* Realistic Enterprise Payslip Document */}
      <OfficialPayslipDocument
        companyName="Oxford Suites Makati"
        companyAddress="7840 Makati Avenue, Poblacion, Makati City, Philippines 1210"
        employeeName={myProfile.name || "Kevin Santos"}
        employeeId={myProfile.employeeId || "OSM-2026-0142"}
        designation={myProfile.position || "Line Cook"}
        department={myProfile.department || "Kitchen / Culinary"}
        dateOfJoining={myProfile.dateHired ? new Date(myProfile.dateHired).toLocaleDateString("en-GB") : "15/04/2026"}
        payPeriod={currentPreset.payPeriod}
        payDate={currentPreset.payDate}
        paidDays={currentPreset.paidDays}
        lopDays={currentPreset.lopDays}
        bankAccount="BDO ****4412"
        tin="123-456-789-000"
        sss="34-1234567-8"
        philHealth="12-345678901-2"
        pagIbig="1234-5678-9012"
        earnings={currentPreset.earnings}
        deductions={currentPreset.deductions}
        netPay={currentPreset.netPay}
      />

      {/* Bottom Information & Discrepancy Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between p-4 rounded-xl border border-border/70 bg-card shadow-2xs print:hidden">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <HelpCircle className="h-4 w-4 text-primary shrink-0" />
          <span>
            Need an official certified copy with stamp or notice a discrepancy? Submit a clarification to the Payroll Officer.
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-1.5 text-xs"
          >
            <Printer className="h-3.5 w-3.5" /> Quick Print
          </Button>
          <Button
            size="sm"
            onClick={handleDownload}
            className="gap-1.5 text-xs bg-rose-700 hover:bg-rose-800 text-white"
          >
            <Download className="h-3.5 w-3.5" /> Save Official PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
