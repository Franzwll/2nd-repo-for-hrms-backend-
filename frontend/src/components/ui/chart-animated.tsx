import * as React from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

/** Honors OS reduced-motion for all dashboard charts. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const fn = () => setReduced(mq.matches);
    try {
      mq.addEventListener("change", fn);
    } catch {
      /* older browsers */
    }
    return () => {
      try {
        mq.removeEventListener("change", fn);
      } catch {
        /* ignore */
      }
    };
  }, []);
  return reduced;
}

export const CHART_ANIMATION = {
  animationDuration: 800,
  animationEasing: "ease-out" as const,
};

/**
 * Shared animated chart shell. Import this instead of raw recharts wrappers
 * so every dashboard animates identically and respects reduced-motion.
 */
export function AnimatedChart({
  config,
  children,
  className,
}: {
  config: ChartConfig;
  children: React.ReactElement<Record<string, unknown>>;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const content =
    reduced && React.isValidElement(children)
      ? React.cloneElement(children, {
          isAnimationActive: false,
          animationDuration: 0,
        } as Partial<unknown>)
      : children;
  return (
    <ChartContainer config={config} className={className}>
      {content as React.ReactElement}
    </ChartContainer>
  );
}

export { ChartTooltip, ChartTooltipContent };
