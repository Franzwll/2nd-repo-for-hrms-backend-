import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { PromotionRequestForm } from "@/components/modules/ess/modals/PromotionRequestForm";
import { essApi } from "@/lib/api";
import { RequestModalShell } from "../RequestModalShell";

interface PromotionRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted?: () => void;
}

export function PromotionRequestModal({
  open,
  onOpenChange,
  onSubmitted,
}: PromotionRequestModalProps) {
  const [competencyScore, setCompetencyScore] = useState<string | undefined>(undefined);
  const [lmsCompletedCount, setLmsCompletedCount] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    essApi
      .myPerformance()
      .then((res: any) => {
        if (!alive) return;
        const avg = res?.stats?.average_score;
        setCompetencyScore(avg != null ? `${avg}%` : undefined);
        setLmsCompletedCount(
          res?.stats?.completed_courses != null ? Number(res.stats.completed_courses) : undefined,
        );
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [open]);

  return (
    <RequestModalShell
      open={open}
      onOpenChange={onOpenChange}
      icon={TrendingUp}
      title="Submit Promotion Request"
      subtitle="Nominate yourself for a promotion and track your HR decision."
    >
      <div className="space-y-4 px-6 py-5">
        <PromotionRequestForm
          competencyScore={competencyScore}
          lmsCompletedCount={lmsCompletedCount}
          onSubmitSuccess={() => {
            onOpenChange(false);
            onSubmitted?.();
          }}
          onCancel={() => onOpenChange(false)}
        />
      </div>
    </RequestModalShell>
  );
}
