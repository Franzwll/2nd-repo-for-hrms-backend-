import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Standard glassmorphism card. Use for headers, dropdowns, dialogs,
 * hero CTAs and login cards — not for dense table rows (perf).
 */
export function GlassCard({
  intensity = "md",
  className,
  ...props
}: React.ComponentProps<typeof Card> & { intensity?: "sm" | "md" | "lg" }) {
  return (
    <Card
      className={cn(
        "border-border/60 shadow-lg",
        intensity === "sm" && "bg-card/60 backdrop-blur-sm",
        intensity === "md" && "bg-card/70 backdrop-blur-md",
        intensity === "lg" && "bg-card/85 backdrop-blur-xl",
        "dark:border-white/15",
        className,
      )}
      {...props}
    />
  );
}
