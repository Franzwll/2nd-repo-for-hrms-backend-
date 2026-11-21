import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { MessageSquare, CreditCard, Eye, EyeOff } from "lucide-react";

export interface PayrollLoansBenefitsPaneProps {
  nextPayout: string;
  onAskAboutLoan?: (() => void) | undefined;
  onRequestEarlyPayoff?: (() => void) | undefined;
  onOpenRequests?: (() => void) | undefined;
}

const money = (value: number) => `₱${value.toLocaleString()}`;

export function PayrollLoansBenefitsPane({
  nextPayout,
  onAskAboutLoan,
  onRequestEarlyPayoff,
  onOpenRequests,
}: PayrollLoansBenefitsPaneProps) {
  const [showCardNumber, setShowCardNumber] = useState(false);

  /* ── Hardcoded demo data (will be dynamic later) ── */
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

  const hmo = {
    title: "HMO and health benefits",
    subtitle: "Valid Jan 1 – Dec 31, 2026",
    status: "Active" as const,
    provider: "iCare",
    plan: "Regular",
    yearlyLimit: 150_000,
    premiumPaidBy: "Employer",
    used: 32_500,
    remaining: 117_500,
    resetsOn: "Jan 1, 2027",
    cardMasked: "IC-****1234",
    cardFull: "IC-8849-1234",
    dependents: 1,
  };

  const loanProgress = Math.round((loan.paidAmount / loan.totalAmount) * 100);
  const hmoProgress = Math.round((hmo.used / hmo.yearlyLimit) * 100);

  return (
    <div className="space-y-6">
      {/* ═══════════════════ Salary Loan Card ═══════════════════ */}
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
          {/* Stat cards */}
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

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Paid {money(loan.paidAmount)} of {money(loan.totalAmount)}
              </span>
              <span className="font-medium tabular-nums">{loanProgress}%</span>
            </div>
            <Progress value={loanProgress} className="h-2" />
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

          {/* Action buttons */}
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

      {/* ═══════════════════ HMO & Benefits Card ═══════════════════ */}
      <Card className="border-border/60 shadow-xs">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base">{hmo.title}</CardTitle>
              <p className="text-xs text-muted-foreground">{hmo.subtitle}</p>
            </div>
            <Badge
              variant="outline"
              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            >
              {hmo.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Provider
              </p>
              <p className="mt-1 text-lg font-semibold">{hmo.provider}</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Plan
              </p>
              <p className="mt-1 text-lg font-semibold">{hmo.plan}</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Yearly limit
              </p>
              <p className="mt-1 text-lg font-semibold tabular-nums">{money(hmo.yearlyLimit)}</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Premium paid by
              </p>
              <p className="mt-1 text-lg font-semibold">{hmo.premiumPaidBy}</p>
            </div>
          </div>

          {/* Usage progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Used <strong className="text-foreground">{money(hmo.used)}</strong> of{" "}
                {money(hmo.yearlyLimit)}
              </span>
              <span className="font-medium tabular-nums">{hmoProgress}%</span>
            </div>
            <Progress value={hmoProgress} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Remaining:{" "}
                <strong className="text-emerald-600 dark:text-emerald-400">
                  {money(hmo.remaining)}
                </strong>
              </span>
              <span>
                Resets <strong className="text-foreground">{hmo.resetsOn}</strong>
              </span>
            </div>
          </div>

          {/* Card number & Dependents */}
          <div className="space-y-0 divide-y divide-border/60 rounded-lg border border-border/60">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-muted-foreground">Card no.</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-medium">
                  {showCardNumber ? hmo.cardFull : hmo.cardMasked}
                </span>
                <button
                  type="button"
                  onClick={() => setShowCardNumber((prev) => !prev)}
                  aria-label={showCardNumber ? "Hide card number" : "Show card number"}
                  aria-pressed={showCardNumber}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {showCardNumber ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-muted-foreground">Dependents</span>
              <span className="text-sm font-medium">
                {hmo.dependents} ·{" "}
                <button
                  type="button"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  View dependents
                </button>
              </span>
            </div>
          </div>

          {/* Footer banner */}
          <div className="flex flex-col items-start justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3.5 sm:flex-row sm:items-center">
            <p className="text-sm text-muted-foreground">
              Need a letter of authorization or have a claim?
            </p>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 border-primary/30 text-primary hover:bg-primary/10"
              onClick={onOpenRequests}
            >
              Open My Requests
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

