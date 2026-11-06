import type { LucideIcon } from "lucide-react";

import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export interface WorkflowTab {
  value: string;
  label: string;
  icon: LucideIcon;
  /** Optional count shown after the label, e.g. pending requisitions. */
  count?: number;
}

/**
 * The module-level tab bar shared by Applicant Management and Recruitment
 * Management. Quiet by default, with the active step carrying the brand colour
 * so the eye lands on the current task instead of three competing pills.
 */
export function WorkflowTabs({
  tabs,
  className,
}: {
  tabs: WorkflowTab[];
  className?: string;
}) {
  return (
    <TabsList
      className={cn(
        "inline-flex h-auto w-full items-center justify-start gap-1 rounded-xl border border-border/70 bg-card p-1 shadow-sm sm:w-auto",
        className,
      )}
    >
      {tabs.map((tab) => (
        <TabsTrigger
          key={tab.value}
          value={tab.value}
          className="group flex h-9 cursor-pointer items-center gap-2 rounded-lg px-3 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
        >
          <tab.icon className="h-3.5 w-3.5" />
          <span>{tab.label}</span>
          {typeof tab.count === "number" && tab.count > 0 && (
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[0.65rem] font-semibold tabular-nums text-muted-foreground group-data-[state=active]:bg-primary-foreground/20 group-data-[state=active]:text-primary-foreground">
              {tab.count}
            </span>
          )}
        </TabsTrigger>
      ))}
    </TabsList>
  );
}
