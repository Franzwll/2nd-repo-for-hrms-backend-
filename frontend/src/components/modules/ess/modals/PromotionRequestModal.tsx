import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TrendingUp } from "lucide-react";
import { PromotionRequestForm } from "./PromotionRequestForm";

interface PromotionRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitSuccess?: (requestData: any) => void;
  competencyScore?: string | undefined;
  lmsCompletedCount?: number | undefined;
}

export function PromotionRequestModal({
  open,
  onOpenChange,
  onSubmitSuccess,
  competencyScore,
  lmsCompletedCount,
}: PromotionRequestModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <TrendingUp className="h-5 w-5" />
            <DialogTitle className="text-xl">Apply for Career Promotion</DialogTitle>
          </div>
        </DialogHeader>

        <PromotionRequestForm
          competencyScore={competencyScore}
          lmsCompletedCount={lmsCompletedCount}
          onSubmitSuccess={(req) => {
            onSubmitSuccess?.(req);
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
