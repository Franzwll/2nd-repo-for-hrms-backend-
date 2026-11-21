import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { MessageSquare, CreditCard } from "lucide-react";

export interface PayrollLoansPaneProps {
  nextPayout: string;
  onAskAboutLoan?: () => void;
  onRequestEarlyPayoff?: () => void;
}

const money = (value: number) => `₱${value.toLocaleString()}`;

export function PayrollLoansPane({
  nextPayout,
  onAskAboutLoan,
  onRequestEarlyPayoff,
}: PayrollLoansPaneProps) {
  /* ── hardcoded demo data (will be dynamic later) ── */
  const loan = {
    title: "Salary loan",
    subtitle: "Company salary loan · deducted every cutoff",
    status: "Active" as const,
    outstanding: 5_400,
    perCutoff: 225,
    monthlyTotal: 450,
    monthsPaid: 12,
    totalMonths: 24,
    totalAmount: 10_800,
    paidAmount: 5_400,
    nextDeduction: "Nov 15, 2026",
    estimatedPayoff: "Oct 2027",
  };

  const progressPercent = Math.round(
    (loan.paidAmount / loan.totalAmount) * 100,
  );

  return (
    <div className="space-y-6">
      <Card className="border-border/60 shadow-xs">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base">{loan.title}</CardTitle>
              <p className="text-xs text-muted-foreground">{loan.subtitle}</p>
            </div>
            <Badge
              variant="outline"
              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            >
              {loan.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* ── Stat cards ── */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Outstanding balance
              </p>
              <p className="mt-1 text-lg font-semibold tabular-nums">{money(loan.outstanding)}</p>
            </div>

            <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Per cutoff
              </p>
              <p className="mt-1 text-lg font-semibold tabular-nums">{money(loan.perCutoff)}</p>
            </div>

            <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Monthly total
              </p>
              <p className="mt-1 text-lg font-semibold tabular-nums">{money(loan.monthlyTotal)}</p>
            </div>

            <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Months paid
              </p>
              <p className="mt-1 text-lg font-semibold">
                {loan.monthsPaid} of {loan.totalMonths}
              </p>
            </div>
          </div>

          {/* ── Progress bar ── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Paid {money(loan.paidAmount)} of {money(loan.totalAmount)}
              </span>
              <span className="font-medium tabular-nums">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Next deduction:{" "}
                <strong className="text-foreground">{loan.nextDeduction}</strong>
              </span>
              <span>
                Estimated payoff:{" "}
                <strong className="text-foreground">{loan.estimatedPayoff}</strong>
              </span>
            </div>
          </div>

          {/* ── Action buttons ── */}
          <div className="flex flex-wrap gap-3 border-t border-border/60 pt-4">
            <Button variant="outline" size="sm" onClick={onAskAboutLoan}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Ask about my loan
            </Button>
            <Button variant="outline" size="sm" onClick={onRequestEarlyPayoff}>
              <CreditCard className="mr-2 h-4 w-4" />
              Request early payoff
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
