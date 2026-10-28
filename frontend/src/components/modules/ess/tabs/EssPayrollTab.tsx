import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Building,
  Calculator,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  HeartHandshake,
  Landmark,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TablePagination } from "@/components/ui/table-pagination";
import { CardSkeleton } from "@/components/ui/loading-skeletons";
import { ListBody } from "@/components/portal/ListBody";
import { ListEmptyState } from "@/components/portal/ListEmptyState";
import { usePagination } from "@/hooks/usePagination";
import { EssStatusBadge } from "@/components/modules/ess/shared/EssStatusBadge";
import { ReportMenu } from "@/components/ui/report-menu";
import { essApi, type ApiPayrollData } from "@/lib/api";
import { PayslipViewerModal } from "@/components/modules/ess/modals/PayslipViewerModal";
import { maskSensitiveId } from "@/components/modules/ess/shared/OfficialPayslipDocument";

const money = (value: number) => `₱${value.toLocaleString()}`;

interface CalcLine {
  label: string;
  amount: number;
  hint?: string;
}

interface StatutoryRow {
  icon: typeof ShieldCheck;
  label: string;
  /** Plain, non-sensitive supporting text. */
  detail?: string;
  /** Full identification number; displayed masked until revealed. */
  sensitiveValue?: string;
  amount: number;
  unit: string;
  tone: string;
}

export function EssPayrollTab() {
  const navigate = useNavigate();
  const [payrollData, setPayrollData] = useState<ApiPayrollData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPayslipPeriod, setSelectedPayslipPeriod] = useState<string>("");
  const [selectedPayslipNet, setSelectedPayslipNet] = useState<number>(0);
  const [selectedPayslip, setSelectedPayslip] = useState<ApiPayrollData["payslips"][number] | null>(
    null,
  );
  const [payslipModalOpen, setPayslipModalOpen] = useState(false);
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});

  const toggleRevealId = (label: string) =>
    setRevealedIds((prev) => ({ ...prev, [label]: !prev[label] }));

  useEffect(() => {
    essApi
      .myPayroll()
      .then((res) => {
        setPayrollData(res);
        if (res.net) setSelectedPayslipNet(res.net);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const baseSalary = payrollData?.baseSalary ?? 0;
  const allowances = payrollData?.allowances ?? 0;
  const sss = payrollData?.deductions?.sss ?? 0;
  const philhealth = payrollData?.deductions?.philhealth ?? 0;
  const pagibig = payrollData?.deductions?.pagibig ?? 0;
  const tax = payrollData?.deductions?.tax ?? 0;
  const currentGross = baseSalary + allowances;
  const nextPayout = payrollData?.nextPayout ?? "—";
  const payPeriod = payrollData?.hero_period ?? "—";

  const payslipsList = useMemo(() => {
    return payrollData?.payslips ?? [];
  }, [payrollData]);

  // Prefer the actual released payslip line items; fall back to the payroll
  // engine's current-salary estimate so the math stays internally consistent.
  const latestPayslip = useMemo(
    () => payslipsList.find((p) => p.status === "Released") ?? payslipsList[0],
    [payslipsList],
  );
  const hasPayslipBreakdown = Boolean(
    (latestPayslip as any)?.earnings?.length &&
    (latestPayslip as any)?.deductions_breakdown?.length,
  );

  const calculation = useMemo(() => {
    if (latestPayslip && hasPayslipBreakdown) {
      const ps = latestPayslip as any;
      const earnings: CalcLine[] = (ps.earnings ?? []).map((item: any) => ({
        label: item.label,
        amount: Number(item.amount),
      }));
      const deductions: CalcLine[] = (ps.deductions_breakdown ?? []).map((item: any) => ({
        label: item.label,
        amount: Number(item.amount),
      }));
      const gross = Number(
        ps.gross ?? earnings.reduce((sum: number, item: CalcLine) => sum + item.amount, 0),
      );
      const net = Number(
        ps.net ?? gross - deductions.reduce((sum: number, item: CalcLine) => sum + item.amount, 0),
      );
      const totalDeductions = Number(ps.deductions ?? gross - net);
      return {
        earnings,
        deductions,
        gross,
        totalDeductions,
        net,
        source: "Based on latest released payslip",
      };
    }

    const earnings: CalcLine[] = [
      { label: "Base Salary", amount: baseSalary },
      { label: "Allowances", amount: allowances },
    ];
    const taxable = Math.max(0, baseSalary - (sss + philhealth + pagibig));
    const deductions: CalcLine[] = [
      { label: "SSS", amount: sss, hint: `4.5% × ${money(baseSalary)}` },
      {
        label: "PhilHealth",
        amount: philhealth,
        hint: `2.5% × ${money(baseSalary)}`,
      },
      { label: "Pag-IBIG", amount: pagibig, hint: "Fixed contribution" },
      {
        label: "BIR Withholding Tax",
        amount: tax,
        hint: `10% × ${money(taxable)}`,
      },
    ];
    const gross = currentGross;
    const totalDeductions = sss + philhealth + pagibig + tax;
    const net = gross - totalDeductions;

    return {
      earnings,
      deductions,
      gross,
      totalDeductions,
      net,
      source: "Estimated from current salary",
    };
  }, [
    latestPayslip,
    hasPayslipBreakdown,
    baseSalary,
    allowances,
    sss,
    philhealth,
    pagibig,
    tax,
    currentGross,
  ]);

  const payslipPage = usePagination(payslipsList, 4);

  const openPayslip = (ps: { period: string; net: number }) => {
    setSelectedPayslipPeriod(ps.period);
    setSelectedPayslipNet(ps.net);
    setSelectedPayslip(ps as ApiPayrollData["payslips"][number]);
    setPayslipModalOpen(true);
  };

  const statutoryRows: StatutoryRow[] = [
    {
      icon: ShieldCheck,
      label: "SSS",
      detail: "Contribution",
      sensitiveValue: payrollData?.statutory?.sss || "",
      amount: sss,
      unit: "/ month",
      tone: "bg-primary/10 text-primary",
    },
    {
      icon: HeartHandshake,
      label: "PhilHealth",
      detail: "Premium",
      sensitiveValue: payrollData?.statutory?.philhealth || "",
      amount: philhealth,
      unit: "/ month",
      tone: "bg-emerald-500/10 text-emerald-600",
    },
    {
      icon: Building,
      label: "Pag-IBIG (HDMF)",
      detail: "Contribution",
      sensitiveValue: payrollData?.statutory?.pagibig || "",
      amount: pagibig,
      unit: "/ month",
      tone: "bg-blue-500/10 text-blue-600",
    },
    {
      icon: Landmark,
      label: "BIR Withholding Tax",
      detail: "Monthly tax deduction",
      sensitiveValue: payrollData?.statutory?.tin || "",
      amount: tax,
      unit: "/ month",
      tone: "bg-rose-500/10 text-rose-600",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading payroll">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-border/70 shadow-xs">
            <CardContent className="p-5">
              <CardSkeleton rows={5} />
            </CardContent>
          </Card>
          <Card className="border-border/70 shadow-xs">
            <CardContent className="p-5">
              <CardSkeleton rows={5} />
            </CardContent>
          </Card>
        </div>
        <Card className="border-border/70 shadow-xs">
          <CardContent className="p-5">
            <CardSkeleton rows={6} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top row: Statutory (left) + Take-home pay calculation (right) */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Statutory */}
        <Card className="border-border/70 shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 font-display text-lg font-semibold">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Statutory
                </CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  Government contributions and mandatory deductions.
                </p>
              </div>
              <Badge
                variant="outline"
                className="shrink-0 border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-600"
              >
                {statutoryRows.length} Items
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {statutoryRows.map((row) => {
              const Icon = row.icon;
              const isRevealed = Boolean(revealedIds[row.label]);
              return (
                <div
                  key={row.label}
                  className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/10 px-3 py-2.5"
                >
                  <div className={`rounded-md p-1.5 ${row.tone}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground">{row.label}</p>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      {row.sensitiveValue ? (
                        <>
                          <span className="font-mono">
                            {row.detail ? `${row.detail} · ` : ""}
                            {isRevealed ? row.sensitiveValue : maskSensitiveId(row.sensitiveValue)}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleRevealId(row.label)}
                            aria-label={
                              isRevealed ? `Hide ${row.label} number` : `Show ${row.label} number`
                            }
                            aria-pressed={isRevealed}
                            title={isRevealed ? "Hide number" : "Show number"}
                            className="inline-flex items-center justify-center rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {isRevealed ? (
                              <EyeOff className="h-3.5 w-3.5" />
                            ) : (
                              <Eye className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </>
                      ) : (
                        <span>{row.detail}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xs font-semibold text-foreground">
                      {money(row.amount)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{row.unit}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Take-home pay calculation */}
        <Card className="border-border/70 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 font-display text-lg font-semibold">
              <Calculator className="h-4 w-4 text-primary" /> Take-Home Pay Calculation
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              How your net pay is computed for{" "}
              {payPeriod === "Current cut-off" ? "this cut-off" : payPeriod}.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border/60 bg-muted/10 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  1. Gross Earnings
                </p>
                <div className="mt-2 space-y-1.5">
                  {calculation.earnings.map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between gap-2 text-[11px]"
                    >
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className="font-mono font-semibold text-foreground">
                        {money(row.amount)}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-1.5 text-[11px] font-semibold">
                    <span className="text-foreground">Gross Earnings</span>
                    <span className="font-mono text-foreground">{money(calculation.gross)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/10 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  2. Deductions
                </p>
                <div className="mt-2 space-y-1.5">
                  {calculation.deductions.map((row) => (
                    <div
                      key={row.label}
                      className="flex items-start justify-between gap-2 text-[11px]"
                    >
                      <div className="min-w-0">
                        <p className="text-muted-foreground">{row.label}</p>
                        {row.hint && (
                          <p className="text-[10px] text-muted-foreground/80">{row.hint}</p>
                        )}
                      </div>
                      <span className="shrink-0 font-mono font-semibold text-foreground">
                        -{money(row.amount)}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-1.5 text-[11px] font-semibold">
                    <span className="text-foreground">Total Deductions</span>
                    <span className="font-mono text-rose-600">
                      -{money(calculation.totalDeductions)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  3. Net Take-Home Pay
                </p>
                <p className="mt-1 text-3xl font-extrabold font-display tracking-tight text-emerald-600 dark:text-emerald-400">
                  {money(calculation.net)}
                </p>
                <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                  {money(calculation.gross)} − {money(calculation.totalDeductions)} ={" "}
                  {money(calculation.net)}
                </p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>Next payout</p>
                <p className="font-semibold text-foreground">{nextPayout}</p>
                <p className="mt-1 text-[10px]">{calculation.source}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom: SSS payslip */}
      <Card className="border-border/70 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 font-display text-lg font-semibold">
                <FileText className="h-4 w-4 text-primary" /> SSS Payslip
              </CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                View and download official itemized pay stubs.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="gap-1.5 border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {payslipsList.length} Payslips Available
              </Badge>
              <ReportMenu
                size="sm"
                label="Export payslips"
                showPrint={false}
                recordCount={payslipsList.length}
                report={() => ({
                  title: "Released Payslips Report",
                  subtitle: `Payroll · ${new Date().toLocaleDateString("en-US", { dateStyle: "long" })}`,
                  columns: [
                    { header: "Pay Period", key: "period" },
                    { header: "Status", key: "status" },
                    { header: "Net Pay", key: "net" },
                  ],
                  rows: payslipsList.map((p) => ({
                    period: p.period,
                    status: p.status,
                    net: `₱${p.net.toLocaleString()}`,
                  })),
                  summary: [
                    { label: "Net Take-Home Pay", value: money(calculation.net) },
                    { label: "Gross Earnings", value: money(calculation.gross) },
                    { label: "Deductions", value: money(calculation.totalDeductions) },
                    { label: "Payslips", value: payslipsList.length },
                  ],
                })}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ListBody>
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30%]">Pay Period</TableHead>
                    <TableHead className="w-[22%]">Status</TableHead>
                    <TableHead className="w-[24%] text-right">Net Pay</TableHead>
                    <TableHead className="w-[24%] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payslipPage.pageItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <ListEmptyState placeholder="Search payslips…" subject="payslips" />
                      </TableCell>
                    </TableRow>
                  ) : (
                    payslipPage.pageItems.map((ps, idx) => (
                      <TableRow key={idx} className="transition-colors">
                        <TableCell className="text-xs font-medium text-foreground">
                          {ps.period}
                        </TableCell>
                        <TableCell>
                          <EssStatusBadge status={ps.status} />
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          ₱{ps.net.toLocaleString()}
                        </TableCell>
                        <TableCell className="py-1 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 cursor-pointer gap-1 px-2 text-xs font-medium text-primary hover:bg-primary/10"
                            onClick={() => openPayslip(ps)}
                          >
                            <Eye className="h-3.5 w-3.5" /> View Payslip
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </ListBody>
          <div className="mt-3 shrink-0 border-t border-border/60 pt-3">
            <TablePagination
              page={payslipPage.page}
              pageCount={payslipPage.pageCount}
              from={payslipPage.from}
              to={payslipPage.to}
              total={payslipPage.total}
              label="payslips"
              showRangeLabel={false}
              onPageChange={payslipPage.setPage}
            />
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <PayslipViewerModal
        open={payslipModalOpen}
        onOpenChange={setPayslipModalOpen}
        period={selectedPayslipPeriod}
        netPay={selectedPayslipNet}
        payslip={selectedPayslip}
        onInquiryClick={() =>
          navigate({ to: "/employee/my-requests/$module", params: { module: "payroll" } })
        }
      />
    </div>
  );
}
