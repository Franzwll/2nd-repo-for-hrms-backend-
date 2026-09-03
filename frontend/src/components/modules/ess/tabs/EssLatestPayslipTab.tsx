import { useState, useEffect } from "react";
import {
  FileText,
  Printer,
  Download,
  HelpCircle,
  Building2,
  Calendar,
  Wallet,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { myProfile, myPayroll } from "@/data/ess";
import { essApi, type ApiPayrollData } from "@/lib/api";

export function EssLatestPayslipTab() {
  const [payrollData, setPayrollData] = useState<ApiPayrollData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("2026-07-01 – 07-15");

  useEffect(() => {
    essApi
      .myPayroll()
      .then((res) => {
        if (res) setPayrollData(res);
      })
      .catch(() => {});
  }, []);

  const employeeName = myProfile.name || "Kevin Santos";
  const employeeId = myProfile.employeeId || "OSM-2026-0142";
  const department = myProfile.department || "Kitchen / Culinary";
  const position = myProfile.position || "Line Cook";
  const payoutDate = payrollData?.nextPayout || "2026-08-05";

  const earnings = myPayroll.breakdown || [
    { label: "Basic Pay", amount: 16000 },
    { label: "Overtime Pay", amount: 2100 },
    { label: "Night Differential", amount: 900 },
    { label: "Meal Allowance", amount: 1500 },
    { label: "Service Charge", amount: 1000 },
  ];

  const deductions = myPayroll.deductions || [
    { label: "SSS", amount: 900 },
    { label: "PhilHealth", amount: 550 },
    { label: "Pag-IBIG", amount: 200 },
    { label: "Withholding Tax", amount: 1160 },
    { label: "Company Loan", amount: 450 },
  ];

  const grossEarnings = earnings.reduce((sum, item) => sum + item.amount, 0);
  const totalDeductions = deductions.reduce((sum, item) => sum + item.amount, 0);
  const netTakeHome = grossEarnings - totalDeductions;

  const handlePrint = () => {
    window.print();
    toast.success("Printing Official Pay Advice...");
  };

  const handleDownload = () => {
    toast.success(`Official Pay Advice (${selectedPeriod}) downloaded as PDF.`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header & Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Official Pay Advice
          </h3>
          <p className="text-xs text-muted-foreground">
            Official itemized payslip stub and statutory deduction breakdown.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="h-9 w-[190px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2026-07-01 – 07-15">2026-07-01 – 07-15</SelectItem>
              <SelectItem value="2026-06-16 – 06-30">2026-06-16 – 06-30</SelectItem>
              <SelectItem value="2026-06-01 – 06-15">2026-06-01 – 06-15</SelectItem>
            </SelectContent>
          </Select>

          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 px-2.5 py-1 text-xs font-semibold">
            Released
          </Badge>
        </div>
      </div>

      {/* Main Official Pay Advice Paper Card */}
      <Card className="border-border/80 shadow-md bg-card print:border-none print:shadow-none overflow-hidden">
        {/* Top Pay Advice Header */}
        <CardHeader className="border-b border-border/70 pb-4 bg-muted/15">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-600 dark:text-emerald-400">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-serif tracking-tight text-foreground font-semibold">
                  Official Pay Advice
                </CardTitle>
                <p className="text-xs text-muted-foreground font-medium">Pay Period: {selectedPeriod}</p>
              </div>
            </div>

            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 px-3 py-1 text-xs font-semibold">
              Released
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Company & Employee Details Header Box */}
          <div className="rounded-xl border border-border bg-card p-5 text-xs space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border/80 gap-2">
              <div>
                <p className="font-bold text-sm font-display text-foreground tracking-wide">OXFORD SUITES MAKATI</p>
                <p className="text-muted-foreground text-[11px]">7840 Makati Avenue, Poblacion, Makati City</p>
              </div>
              <div className="text-left sm:text-right space-y-0.5">
                <p className="text-muted-foreground">
                  Payout Date: <strong className="text-foreground">{payoutDate}</strong>
                </p>
                <p className="text-muted-foreground">
                  Payroll Frequency: <strong className="text-foreground">Semi-Monthly</strong>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 text-xs">
              <div>
                <p className="text-muted-foreground text-[11px]">Employee Name</p>
                <p className="font-bold text-foreground text-sm">{employeeName}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[11px]">Employee ID</p>
                <p className="font-semibold text-foreground font-mono">{employeeId}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[11px]">Department</p>
                <p className="font-semibold text-foreground">{department}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[11px]">Position</p>
                <p className="font-semibold text-foreground">{position}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[11px]">TIN</p>
                <p className="font-semibold text-foreground font-mono">123-456-789-000</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[11px]">Bank Account</p>
                <p className="font-semibold text-foreground font-mono">BDO ****4412</p>
              </div>
            </div>
          </div>

          {/* Itemized Earnings & Deductions Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Earnings Column */}
            <div className="rounded-xl border border-border/80 p-4 space-y-3 bg-card shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-border/80">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Earnings
                </span>
                <span className="text-[11px] text-muted-foreground font-medium">(PHP)</span>
              </div>
              <div className="space-y-2 text-xs">
                {earnings.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-1 border-b border-border/40 last:border-b-0">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-semibold text-foreground font-mono">
                      ₱{item.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
              <div className="pt-2.5 border-t border-border flex justify-between text-xs font-bold">
                <span className="text-foreground">Gross Earnings</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                  ₱{grossEarnings.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Deductions Column */}
            <div className="rounded-xl border border-border/80 p-4 space-y-3 bg-card shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-border/80">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  Deductions
                </span>
                <span className="text-[11px] text-muted-foreground font-medium">(PHP)</span>
              </div>
              <div className="space-y-2 text-xs">
                {deductions.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-1 border-b border-border/40 last:border-b-0">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-semibold text-rose-600 dark:text-rose-400 font-mono">
                      -₱{item.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
              <div className="pt-2.5 border-t border-border flex justify-between text-xs font-bold">
                <span className="text-foreground">Total Deductions</span>
                <span className="text-rose-600 dark:text-rose-400 font-mono text-sm">
                  -₱{totalDeductions.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* NET TAKE-HOME PAY Highlight Banner */}
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div>
              <p className="text-xs uppercase font-bold text-emerald-800 dark:text-emerald-300 tracking-wider">
                NET TAKE-HOME PAY
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Credited to registered payroll account</p>
            </div>
            <p className="text-3xl sm:text-4xl font-bold font-serif text-emerald-600 dark:text-emerald-400 tracking-tight">
              ₱{netTakeHome.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pt-3 border-t border-border">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <HelpCircle className="h-4 w-4 text-primary shrink-0" />
              <span>Have a payroll question or discrepancy? Contact HR/Payroll admin.</span>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 text-xs">
                <Printer className="h-4 w-4" /> Print
              </Button>
              <Button size="sm" onClick={handleDownload} className="gap-1.5 text-xs bg-rose-700 hover:bg-rose-800 text-white">
                <Download className="h-4 w-4" /> Download PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
