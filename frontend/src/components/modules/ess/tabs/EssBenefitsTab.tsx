import { useState, useEffect } from "react";
import { ShieldCheck, HeartPulse, Landmark, CreditCard, CheckCircle2, Plus, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { essApi, type ApiEssBenefit } from "@/lib/api";

export function EssBenefitsTab() {
  const [loading, setLoading] = useState(true);
  const [benefits, setBenefits] = useState<ApiEssBenefit[]>([]);

  const loadBenefits = async () => {
    try {
      setLoading(true);
      const res = await essApi.benefits();
      setBenefits(res.benefits || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load employee benefits.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBenefits();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold font-display text-foreground">Government &amp; Company Benefits</h3>
        <p className="text-xs text-muted-foreground">
          Statutory employee identifications, healthcare coverage, insurance policies, and active loans.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12 text-muted-foreground text-sm gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" /> Loading benefits data...
        </div>
      ) : (
        /* Statutory Benefits Cards */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b) => (
            <Card key={b.employee_benefit_id} className="border-border/70 shadow-xs hover:border-primary/50 transition-all">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">{b.benefit_name}</span>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">
                    {b.status || "Active"}
                  </Badge>
                </div>
                <p className="text-base font-bold font-mono text-foreground">{b.reference_value || "—"}</p>
                <p className="text-xs text-muted-foreground">{b.note || "Standard Statutory Coverage"}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
