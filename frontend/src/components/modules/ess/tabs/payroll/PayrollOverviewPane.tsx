import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ApiPayrollData } from "@/lib/api";
import {
  Calendar,
  Clock,
  DollarSign,
  Download,
  MessageSquare,
  TrendingUp,
  Wallet,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CalcLine {
  label: string;
  amount: number;
  hint?: string;
}

interface PayrollCalculation {
  earnings: CalcLine[];
  deductions: CalcLine[];
  gross: number;
  totalDeductions: number;
  net: number;
  source: string;
}

export interface PayrollOverviewPaneProps {
  payrollData: ApiPayrollData;
  calculation: PayrollCalculation;
  nextPayout: string;
  payPeriod: string;
  lateAbsenceDeductions: number;
  onDownloadPayslip?: () => void;
  onViewAttendance?: () => void;
  onReportConcern?: () => void;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const money = (value: number) => `₱${value.toLocaleString()}`;

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function HeroCard({
  icon: Icon,
  title,
  value,
  subtitle,
  valueClassName,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number | string }>;
  title: string;
  value: string;
  subtitle?: string;
  valueClassName?: string;
}) {
  return (
    <Card className="border-border/60 bg-card shadow-xs">
      <CardContent className="flex items-start gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Icon size={20} className="text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <p className={`mt-0.5 text-xl font-semibold tracking-tight ${valueClassName ?? ""}`}>
            {value}
          </p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ContributionRow({
  label,
  perCutoff,
  perMonth,
}: {
  label: string;
  perCutoff: number;
  perMonth: number;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-foreground">{label}</span>
      <span className="text-sm tabular-nums text-muted-foreground">
        {money(perCutoff)}{" "}
        <span className="mx-0.5 text-border">·</span>{" "}
        {money(perMonth)}/mo
      </span>
    </div>
  );
}

function QuickLinkButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number | string }>;
  label: string;
  onClick?: (() => void) | undefined;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
    >
      <Icon size={16} className="shrink-0 text-muted-foreground" />
      <span>{label}</span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function PayrollOverviewPane({
  payrollData,
  calculation,
  nextPayout,
  payPeriod,
  lateAbsenceDeductions,
  onDownloadPayslip,
  onViewAttendance,
  onReportConcern,
}: PayrollOverviewPaneProps) {
  const processingPayslip = payrollData.processing_payslip;

  /* Derive government contribution values from deductions */
  const findDeduction = (keyword: string) =>
    calculation.deductions.find((d) =>
      d.label.toLowerCase().includes(keyword.toLowerCase()),
    );

  const sss = findDeduction("sss");
  const philHealth = findDeduction("philhealth");
  const pagIbig = findDeduction("pag-ibig") ?? findDeduction("pagibig");
  const withholdingTax = findDeduction("withholding") ?? findDeduction("tax");

  const contributions = [
    { label: "SSS", perCutoff: sss?.amount ?? 0 },
    { label: "PhilHealth", perCutoff: philHealth?.amount ?? 0 },
    { label: "Pag-IBIG", perCutoff: pagIbig?.amount ?? 0 },
    { label: "Withholding tax", perCutoff: withholdingTax?.amount ?? 0 },
  ];

  return (
    <div className="space-y-6">
      {/* ── Hero stat cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <HeroCard
          icon={Wallet}
          title="Latest net pay"
          subtitle={payPeriod}
          value={money(calculation.net)}
          valueClassName="text-emerald-600 dark:text-emerald-400"
        />
        <HeroCard
          icon={Calendar}
          title="Next payday"
          value={nextPayout}
        />
        <HeroCard
          icon={TrendingUp}
          title="YTD gross"
          value={money(payrollData.ytd_gross ?? 0)}
        />
        <HeroCard
          icon={DollarSign}
          title="YTD tax withheld"
          value={money(payrollData.ytd_tax_withheld ?? 0)}
        />
      </div>

      {/* ── Processing payslip alert ───────────────────────────── */}
      {processingPayslip && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-700 dark:text-amber-400">
          <Clock size={18} className="mt-0.5 shrink-0" />
          <p className="text-sm leading-relaxed">
            Your <span className="font-semibold">{processingPayslip.period}</span> payslip
            is still processing.
            {processingPayslip.payout_date && (
              <> Next loan deduction: <span className="font-semibold">{processingPayslip.payout_date}</span>.</>
            )}
          </p>
        </div>
      )}

      {/* ── Two-column body ────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Left column — Take-home pay breakdown */}
        <Card className="border-border/60 bg-card shadow-xs lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Take-home pay</CardTitle>
            <p className="text-xs text-muted-foreground">{payPeriod}</p>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Earnings */}
            <div className="space-y-1">
              {calculation.earnings.map((line) => (
                <div
                  key={line.label}
                  className="flex items-center justify-between py-1.5"
                >
                  <span className="text-sm text-foreground">{line.label}</span>
                  <span className="text-sm tabular-nums text-foreground">
                    {money(line.amount)}
                  </span>
                </div>
              ))}
            </div>

            {/* Gross pay subtotal */}
            <div className="flex items-center justify-between border-t pt-2">
              <span className="text-sm font-semibold text-foreground">
                Gross pay
              </span>
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {money(calculation.gross)}
              </span>
            </div>

            {/* Deductions */}
            <div className="space-y-1">
              {calculation.deductions.map((line) => (
                <div
                  key={line.label}
                  className="flex items-center justify-between py-1.5"
                >
                  <span className="text-sm text-foreground">
                    {line.label}
                    {line.hint && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({line.hint})
                      </span>
                    )}
                  </span>
                  <span className="text-sm tabular-nums text-red-600 dark:text-red-400">
                    −{money(Math.abs(line.amount))}
                  </span>
                </div>
              ))}

              {/* Late / absences (shown separately) */}
              {lateAbsenceDeductions > 0 && (
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-foreground">
                    Late/absences
                  </span>
                  <span className="text-sm tabular-nums text-red-600 dark:text-red-400">
                    −{money(lateAbsenceDeductions)}
                  </span>
                </div>
              )}
            </div>

            {/* Total deductions */}
            <div className="flex items-center justify-between border-t pt-2">
              <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                Total deductions
              </span>
              <span className="text-sm font-semibold tabular-nums text-red-600 dark:text-red-400">
                −{money(Math.abs(calculation.totalDeductions + lateAbsenceDeductions))}
              </span>
            </div>

            {/* Net pay badge */}
            <div className="flex items-center justify-between rounded-lg bg-emerald-500/10 px-4 py-3">
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                Net pay
              </span>
              <Badge
                variant="secondary"
                className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
              >
                {money(calculation.net)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Right column — Government contributions & Quick links */}
        <div className="space-y-6 lg:col-span-2">
          {/* Government contributions */}
          <Card className="border-border/60 bg-card shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                Government contributions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border/60">
                {contributions.map((c) => (
                  <ContributionRow
                    key={c.label}
                    label={c.label}
                    perCutoff={c.perCutoff}
                    perMonth={c.perCutoff * 2}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick links */}
          <Card className="border-border/60 bg-card shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Quick links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <QuickLinkButton
                icon={Download}
                label="Download latest payslip"
                onClick={onDownloadPayslip}
              />
              <QuickLinkButton
                icon={Calendar}
                label="View attendance for this period"
                onClick={onViewAttendance}
              />
              <QuickLinkButton
                icon={MessageSquare}
                label="Report a payroll concern"
                onClick={onReportConcern}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
