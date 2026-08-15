import { useState } from "react";
import { ShieldCheck, HeartPulse, Landmark, CreditCard, CheckCircle2, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { myBenefits, myProfile } from "@/data/ess";
import { toast } from "sonner";

export function EssBenefitsTab() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold font-display text-foreground">Government &amp; Company Benefits</h3>
        <p className="text-xs text-muted-foreground">
          Statutory employee identifications, healthcare coverage, insurance policies, and active loans.
        </p>
      </div>

      {/* Statutory Benefits Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {myBenefits.map((b) => (
          <Card key={b.name} className="border-border/70 shadow-xs hover:border-primary/50 transition-all">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">{b.name}</span>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">
                  Active
                </Badge>
              </div>
              <p className="text-base font-bold font-mono text-foreground">{b.value}</p>
              <p className="text-xs text-muted-foreground">{b.note}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Company Loan Amortization Tracker */}
      <Card className="border-border/70 shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 gap-3">
          <div>
            <CardTitle className="font-display text-xl font-semibold flex items-center gap-2">
              <Landmark className="h-5 w-5 text-primary" />
              Company Loan Amortization Schedule
            </CardTitle>
            <p className="text-xs text-muted-foreground">Automatic payroll salary deduction tracker.</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={() => toast.info("Company loan application window opens every quarter.")}
          >
            Apply for Salary Loan
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3 text-xs">
            <div className="rounded-lg border border-border p-3 bg-muted/20">
              <p className="text-muted-foreground">Outstanding Principal Balance</p>
              <p className="text-xl font-bold font-display text-rose-600 dark:text-rose-400 mt-1">₱5,400.00</p>
            </div>
            <div className="rounded-lg border border-border p-3 bg-muted/20">
              <p className="text-muted-foreground">Amortization per Cut-off</p>
              <p className="text-xl font-bold font-display text-foreground mt-1">₱450.00 / cut-off</p>
            </div>
            <div className="rounded-lg border border-border p-3 bg-muted/20">
              <p className="text-muted-foreground">Payment Progress</p>
              <p className="text-xl font-bold font-display text-emerald-600 dark:text-emerald-400 mt-1">
                12 of 24 Paid (50%)
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span>Amortization Payoff Completion</span>
              <span className="text-primary">50% Completed</span>
            </div>
            <Progress value={50} className="h-2.5" />
            <p className="text-[11px] text-muted-foreground">
              Projected payoff date: December 15, 2026.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
