import { useState, useEffect } from "react";
import { ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatCardsSkeleton } from "@/components/ui/loading-skeletons";
import { Badge } from "@/components/ui/badge";
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load employee benefits.";
      toast.error(message);
      setBenefits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBenefits();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold font-display text-foreground">
          Government &amp; Company Benefits
        </h3>
        <p className="text-xs text-muted-foreground">
          Statutory employee identifications, healthcare coverage, insurance policies, and active
          loans assigned to your employee record.
        </p>
      </div>

      {loading ? (
        <StatCardsSkeleton count={3} />
      ) : benefits.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b) => (
            <Card
              key={b.employee_benefit_id}
              className="border-border/70 shadow-xs hover:border-primary/50 transition-all"
            >
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                    {b.benefit_name}
                  </span>
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]"
                  >
                    {b.status || "Active"}
                  </Badge>
                </div>
                <p className="text-base font-bold font-mono text-foreground">
                  {b.reference_value || "—"}
                </p>
                <p className="text-xs text-muted-foreground">{b.note || ""}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border/70 shadow-xs">
          <CardContent className="flex flex-col items-center gap-2 p-10 text-center">
            <ShieldCheck className="h-8 w-8 text-muted-foreground/60" />
            <p className="text-sm font-semibold text-foreground">No benefits on file yet</p>
            <p className="max-w-md text-xs text-muted-foreground">
              Your statutory and company benefits will appear here once HR Administration assigns
              them to your employee record.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
