import { EssPerformanceTab } from "./EssPerformanceTab";

/**
 * ESS "Performance" tab - employees review their performance evaluation.
 * Reachable via both ?category=Performance and ?category=Promotion.
 */
export function EssPromotionTab() {
  return (
    <div className="space-y-6">
      <EssPerformanceTab />
    </div>
  );
}
