import { useMemo, useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TablePagination } from "@/components/ui/table-pagination";
import { ListBody } from "@/components/portal/ListBody";
import { ListEmptyState } from "@/components/portal/ListEmptyState";
import { EssStatusBadge } from "@/components/modules/ess/shared/EssStatusBadge";
import { ReportMenu } from "@/components/ui/report-menu";
import { usePagination } from "@/hooks/usePagination";
import type { ApiPayrollData } from "@/lib/api";

export interface PayrollPayslipsPaneProps {
  payslipsList: ApiPayrollData["payslips"];
  onViewPayslip: (ps: ApiPayrollData["payslips"][number]) => void;
}

const money = (value: number) => `₱${value.toLocaleString()}`;

/** Extract a 4-digit year from a payslip period or payout date string. */
function extractYear(ps: ApiPayrollData["payslips"][number]): number {
  const match = (ps.payoutDate || ps.period || "").match(/\b(20\d{2})\b/);
  return match ? Number(match[1]) : new Date().getFullYear();
}

export function PayrollPayslipsPane({
  payslipsList,
  onViewPayslip,
}: PayrollPayslipsPaneProps) {
  const currentYear = new Date().getFullYear();

  // Unique years from data
  const availableYears = useMemo(() => {
    const years = new Set(payslipsList.map(extractYear));
    if (years.size === 0) years.add(currentYear);
    return Array.from(years).sort((a, b) => b - a);
  }, [payslipsList, currentYear]);

  const [selectedYear, setSelectedYear] = useState(String(currentYear));

  // Filter by year
  const filteredPayslips = useMemo(
    () => payslipsList.filter((ps) => extractYear(ps) === Number(selectedYear)),
    [payslipsList, selectedYear],
  );

  const releasedCount = useMemo(
    () => filteredPayslips.filter((ps) => ps.status === "Released").length,
    [filteredPayslips],
  );

  const page = usePagination(filteredPayslips, 5);

  return (
    <div className="space-y-6">
      <Card className="border-border/60 shadow-xs">
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base">Payslip history</CardTitle>
              <p className="text-xs text-muted-foreground">
                Gross pay, deductions, and net pay for each period.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="h-9 w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <ReportMenu
                size="sm"
                label="Export"
                showPrint={false}
                recordCount={filteredPayslips.length}
                report={() => ({
                  title: `Payslips ${selectedYear}`,
                  subtitle: `Payroll · ${new Date().toLocaleDateString("en-US", { dateStyle: "long" })}`,
                  columns: [
                    { header: "Pay Period", key: "period" },
                    { header: "Pay Date", key: "payoutDate" },
                    { header: "Gross", key: "gross" },
                    { header: "Deductions", key: "deductions" },
                    { header: "Net Pay", key: "net" },
                    { header: "Status", key: "status" },
                  ],
                  rows: filteredPayslips
                    .filter((p) => p.status === "Released")
                    .map((p) => ({
                      period: p.period,
                      payoutDate: p.payoutDate,
                      gross: money(p.gross),
                      deductions: money(p.deductions),
                      net: money(p.net),
                      status: p.status,
                    })),
                  summary: [
                    { label: "Released Payslips", value: releasedCount },
                    {
                      label: "Total Net",
                      value: money(
                        filteredPayslips
                          .filter((p) => p.status === "Released")
                          .reduce((sum, p) => sum + p.net, 0),
                      ),
                    },
                  ],
                })}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* ── Table ── */}
          <ListBody>
            <div className="relative w-full overflow-auto">
              <Table className="min-w-[720px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider">
                      Pay period
                    </TableHead>
                    <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider">
                      Pay date
                    </TableHead>
                    <TableHead className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider">
                      Gross
                    </TableHead>
                    <TableHead className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider">
                      Deductions
                    </TableHead>
                    <TableHead className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider">
                      Net pay
                    </TableHead>
                    <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider">
                      Status
                    </TableHead>
                    <TableHead className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {page.pageItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <ListEmptyState placeholder="Search payslips…" subject="payslips" />
                      </TableCell>
                    </TableRow>
                  ) : (
                    page.pageItems.map((ps, idx) => {
                      const released = ps.status === "Released";
                      const statusLabel = ps.status === "Draft" ? "Processing" : ps.status;

                      return (
                        <TableRow key={idx} className="transition-colors">
                          <TableCell className="whitespace-nowrap px-4 py-3 text-sm font-medium text-foreground">
                            {ps.period}
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                            {ps.payoutDate || "—"}
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-4 py-3 text-right font-mono text-sm text-foreground">
                            {released ? money(ps.gross) : "—"}
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-4 py-3 text-right font-mono text-sm text-rose-600 dark:text-rose-400">
                            {released ? money(ps.deductions) : "—"}
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-4 py-3 text-right font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                            {released ? money(ps.net) : "—"}
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-4 py-3">
                            <EssStatusBadge status={statusLabel} />
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-4 py-3 text-right">
                            {released ? (
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 cursor-pointer gap-1 px-2 text-xs font-medium text-primary hover:bg-primary/10"
                                  onClick={() => onViewPayslip(ps)}
                                  title="View payslip"
                                >
                                  <Eye className="h-3.5 w-3.5" /> View
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                Not yet available
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </ListBody>

          {/* ── Pagination ── */}
          <div className="mt-3 shrink-0 border-t border-border/60 pt-3">
            <TablePagination
              page={page.page}
              pageCount={page.pageCount}
              from={page.from}
              to={page.to}
              total={page.total}
              label="payslips"
              showRangeLabel={false}
              onPageChange={page.setPage}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
