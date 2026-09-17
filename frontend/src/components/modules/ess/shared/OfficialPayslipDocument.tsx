import React from "react";
import { Logo } from "@/components/brand/Logo";
import { numberToWords } from "@/lib/numberToWords";
import { cn } from "@/lib/utils";

export interface PayslipItem {
  label: string;
  amount: number;
  ytd?: number;
}

export interface OfficialPayslipDocumentProps {
  companyName?: string;
  companyAddress?: string;
  employeeName?: string;
  employeeId?: string;
  designation?: string;
  department?: string;
  dateOfJoining?: string;
  payPeriod?: string;
  payDate?: string;
  paidDays?: number;
  lopDays?: number;
  bankAccount?: string;
  tin?: string;
  sss?: string;
  philHealth?: string;
  pagIbig?: string;
  earnings?: PayslipItem[];
  deductions?: PayslipItem[];
  netPay?: number;
  className?: string;
  showWatermark?: boolean;
}

export function OfficialPayslipDocument({
  companyName = "Oxford Suites Makati",
  companyAddress = "7840 Makati Avenue, Poblacion, Makati City, Philippines 1210",
  employeeName = "Kevin Santos",
  employeeId = "OSM-2026-0142",
  designation = "Line Cook",
  department = "Kitchen / Culinary",
  dateOfJoining = "15/04/2026",
  payPeriod = "July 01 – 15, 2026",
  payDate = "05/08/2026",
  paidDays = 15,
  lopDays = 0,
  bankAccount = "BDO ****4412",
  tin = "123-456-789-000",
  sss = "34-1234567-8",
  philHealth = "12-345678901-2",
  pagIbig = "1234-5678-9012",
  earnings = [
    { label: "Basic Pay", amount: 16000, ytd: 112000 },
    { label: "Overtime Pay", amount: 2100, ytd: 14700 },
    { label: "Night Differential", amount: 900, ytd: 6300 },
    { label: "Meal Allowance", amount: 1500, ytd: 10500 },
    { label: "Service Charge Share", amount: 1000, ytd: 7000 },
  ],
  deductions = [
    { label: "SSS Contribution", amount: 900, ytd: 6300 },
    { label: "PhilHealth Premium", amount: 550, ytd: 3850 },
    { label: "Pag-IBIG HDMF", amount: 200, ytd: 1400 },
    { label: "Withholding Tax (BIR)", amount: 1160, ytd: 8120 },
    { label: "Company Salary Loan", amount: 450, ytd: 3150 },
  ],
  netPay,
  className,
}: OfficialPayslipDocumentProps) {
  const grossEarnings = earnings.reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalDeductions = deductions.reduce((sum, item) => sum + (item.amount || 0), 0);
  const calculatedNetPay = netPay !== undefined ? netPay : grossEarnings - totalDeductions;

  // Align rows count for side-by-side grid
  const maxRows = Math.max(earnings.length, deductions.length);
  const normalizedEarnings = [...earnings];
  const normalizedDeductions = [...deductions];

  while (normalizedEarnings.length < maxRows) {
    normalizedEarnings.push({ label: "", amount: 0, ytd: 0 });
  }
  while (normalizedDeductions.length < maxRows) {
    normalizedDeductions.push({ label: "", amount: 0, ytd: 0 });
  }

  const formatCurrency = (val?: number) => {
    if (val === undefined || isNaN(val)) return "—";
    return `₱${val.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const amountWords = numberToWords(calculatedNetPay);

  return (
    <div
      id="official-payslip-receipt"
      className={cn(
        "w-full bg-white dark:bg-card text-slate-900 dark:text-card-foreground font-sans p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-border shadow-xs text-xs space-y-6 print:p-0 print:border-none print:shadow-none print:bg-white print:text-black",
        className,
      )}
    >
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-border/80">
        <div className="flex items-center gap-3">
          <Logo variant="full" mark="maroon" className="scale-95 origin-left" />
          <div className="border-l border-slate-200 dark:border-border pl-3">
            <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-foreground font-display">
              {companyName}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-muted-foreground leading-tight">
              {companyAddress}
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-muted-foreground font-semibold">
            Payslip For the Period
          </p>
          <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-foreground font-display">
            {payPeriod}
          </p>
        </div>
      </div>

      {/* 2. Employee Summary & Net Pay Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Left 7 cols: Employee Details */}
        <div className="md:col-span-7 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-muted-foreground border-b border-slate-100 dark:border-border/50 pb-1">
            Employee Summary
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
            <div className="flex items-baseline justify-between sm:justify-start gap-2">
              <span className="text-slate-500 dark:text-muted-foreground w-28 shrink-0">
                Employee Name
              </span>
              <span className="font-semibold text-slate-900 dark:text-foreground flex-1">
                : {employeeName}
              </span>
            </div>

            <div className="flex items-baseline justify-between sm:justify-start gap-2">
              <span className="text-slate-500 dark:text-muted-foreground w-28 shrink-0">
                Designation
              </span>
              <span className="font-medium text-slate-900 dark:text-foreground flex-1">
                : {designation}
              </span>
            </div>

            <div className="flex items-baseline justify-between sm:justify-start gap-2">
              <span className="text-slate-500 dark:text-muted-foreground w-28 shrink-0">
                Employee ID
              </span>
              <span className="font-semibold font-mono text-slate-900 dark:text-foreground flex-1">
                : {employeeId}
              </span>
            </div>

            <div className="flex items-baseline justify-between sm:justify-start gap-2">
              <span className="text-slate-500 dark:text-muted-foreground w-28 shrink-0">
                Department
              </span>
              <span className="font-medium text-slate-900 dark:text-foreground flex-1">
                : {department}
              </span>
            </div>

            <div className="flex items-baseline justify-between sm:justify-start gap-2">
              <span className="text-slate-500 dark:text-muted-foreground w-28 shrink-0">
                Date of Joining
              </span>
              <span className="font-medium text-slate-800 dark:text-foreground flex-1">
                : {dateOfJoining}
              </span>
            </div>

            <div className="flex items-baseline justify-between sm:justify-start gap-2">
              <span className="text-slate-500 dark:text-muted-foreground w-28 shrink-0">
                Pay Date
              </span>
              <span className="font-medium text-slate-800 dark:text-foreground flex-1">
                : {payDate}
              </span>
            </div>
          </div>
        </div>

        {/* Right 5 cols: Net Pay & Work Days Box */}
        <div className="md:col-span-5 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-10 bg-emerald-600 rounded-full shrink-0" />
            <div>
              <p className="text-2xl font-bold font-mono tracking-tight text-emerald-900 dark:text-emerald-300">
                {formatCurrency(calculatedNetPay)}
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                Employee Net Pay
              </p>
            </div>
          </div>

          <div className="border-t border-emerald-200/80 dark:border-emerald-800/40 pt-2.5 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-emerald-800 dark:text-emerald-300/80">Paid Days</span>
              <span className="font-bold text-slate-900 dark:text-foreground font-mono">
                : {paidDays}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-emerald-800 dark:text-emerald-300/80">LOP / Unpaid</span>
              <span className="font-bold text-slate-900 dark:text-foreground font-mono">
                : {lopDays}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Statutory Identification Bar */}
      <div className="rounded-lg bg-slate-50 dark:bg-muted/30 border border-slate-200 dark:border-border/70 px-4 py-2.5 text-[11px]">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          <div>
            <span className="text-slate-500 dark:text-muted-foreground block text-[10px] uppercase font-semibold">
              Bank A/C Number
            </span>
            <span className="font-semibold font-mono text-slate-800 dark:text-foreground">
              {bankAccount}
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-muted-foreground block text-[10px] uppercase font-semibold">
              TIN
            </span>
            <span className="font-semibold font-mono text-slate-800 dark:text-foreground">
              {tin}
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-muted-foreground block text-[10px] uppercase font-semibold">
              SSS Number
            </span>
            <span className="font-semibold font-mono text-slate-800 dark:text-foreground">
              {sss}
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-muted-foreground block text-[10px] uppercase font-semibold">
              PhilHealth
            </span>
            <span className="font-semibold font-mono text-slate-800 dark:text-foreground">
              {philHealth}
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-muted-foreground block text-[10px] uppercase font-semibold">
              Pag-IBIG (HDMF)
            </span>
            <span className="font-semibold font-mono text-slate-800 dark:text-foreground">
              {pagIbig}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Side-by-Side Itemized Earnings & Deductions Table */}
      <div className="border border-slate-200 dark:border-border/80 rounded-xl overflow-hidden shadow-2xs">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/90 dark:bg-muted/60 text-slate-700 dark:text-muted-foreground font-bold border-b border-slate-200 dark:border-border/80 text-[11px] uppercase tracking-wider">
              <th className="p-3 w-1/4">Earnings</th>
              <th className="p-3 text-right w-1/8">Amount</th>
              <th className="p-3 text-right w-1/8 border-r border-slate-200 dark:border-border/80">
                YTD
              </th>
              <th className="p-3 w-1/4">Deductions</th>
              <th className="p-3 text-right w-1/8">Amount</th>
              <th className="p-3 text-right w-1/8">YTD</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-border/40">
            {normalizedEarnings.map((earn, index) => {
              const ded = normalizedDeductions[index];
              return (
                <tr
                  key={index}
                  className="hover:bg-slate-50/60 dark:hover:bg-muted/20 transition-colors"
                >
                  {/* Earnings Left Side */}
                  <td className="p-2.5 font-medium text-slate-700 dark:text-foreground/90">
                    {earn.label || "—"}
                  </td>
                  <td className="p-2.5 text-right font-mono font-semibold text-slate-900 dark:text-foreground">
                    {earn.label ? formatCurrency(earn.amount) : "—"}
                  </td>
                  <td className="p-2.5 text-right font-mono text-slate-500 dark:text-muted-foreground border-r border-slate-200 dark:border-border/80">
                    {earn.label ? formatCurrency(earn.ytd) : "—"}
                  </td>

                  {/* Deductions Right Side */}
                  <td className="p-2.5 font-medium text-slate-700 dark:text-foreground/90">
                    {ded?.label || "—"}
                  </td>
                  <td className="p-2.5 text-right font-mono font-semibold text-rose-600 dark:text-rose-400">
                    {ded?.label ? formatCurrency(ded.amount) : "—"}
                  </td>
                  <td className="p-2.5 text-right font-mono text-slate-500 dark:text-muted-foreground">
                    {ded?.label ? formatCurrency(ded.ytd) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 dark:bg-muted/40 font-bold border-t-2 border-slate-200 dark:border-border">
              <td className="p-3 text-slate-900 dark:text-foreground">Gross Earnings</td>
              <td className="p-3 text-right font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                {formatCurrency(grossEarnings)}
              </td>
              <td className="p-3 border-r border-slate-200 dark:border-border/80" />
              <td className="p-3 text-slate-900 dark:text-foreground">Total Deductions</td>
              <td className="p-3 text-right font-mono text-rose-600 dark:text-rose-400 text-sm">
                {formatCurrency(totalDeductions)}
              </td>
              <td className="p-3" />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 5. Total Net Payable Banner */}
      <div className="border border-slate-200 dark:border-border/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-muted/20">
        <div>
          <p className="text-xs uppercase font-extrabold tracking-wider text-slate-900 dark:text-foreground">
            TOTAL NET PAYABLE
          </p>
          <p className="text-[11px] text-slate-500 dark:text-muted-foreground mt-0.5">
            Gross Earnings - Total Deductions
          </p>
        </div>

        <div className="bg-emerald-100/90 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/60 px-6 py-2 rounded-lg text-right">
          <p className="text-xl sm:text-2xl font-bold font-mono text-emerald-900 dark:text-emerald-300">
            {formatCurrency(calculatedNetPay)}
          </p>
        </div>
      </div>

      {/* 6. Amount in Words */}
      <div className="text-right text-xs py-1">
        <span className="text-slate-500 dark:text-muted-foreground">Amount In Words : </span>
        <strong className="font-semibold text-slate-900 dark:text-foreground">
          {amountWords}
        </strong>
      </div>

      {/* 7. Footer Disclaimer */}
      <div className="pt-4 border-t border-slate-200 dark:border-border/80 text-center">
        <p className="text-[11px] text-slate-400 dark:text-muted-foreground/80 italic">
          -- This document has been automatically generated by Oxford Suites Makati HRMS;
          therefore, a signature is not required. --
        </p>
      </div>
    </div>
  );
}
