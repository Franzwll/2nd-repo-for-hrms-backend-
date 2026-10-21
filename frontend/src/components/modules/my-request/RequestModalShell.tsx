import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

interface RequestModalShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  children: ReactNode;
  badge?: string;
}

/**
 * Wide, screenshot-aligned shell shared by every My Request dialog:
 * icon + title + subtitle on the left, routing badge on the right.
 */
export function RequestModalShell({
  open,
  onOpenChange,
  icon: Icon,
  title,
  subtitle,
  children,
  badge = "Direct HR Routing",
}: RequestModalShellProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-4xl max-h-[92vh] overflow-y-auto p-0 gap-0">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/70 px-6 py-5 pr-14">
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-primary/10 p-2 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="font-display text-xl font-semibold">{title}</DialogTitle>
              <DialogDescription className="text-xs">{subtitle}</DialogDescription>
            </div>
          </div>
          <span className="hidden shrink-0 rounded-full border border-border/70 bg-card px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-muted-foreground sm:inline-block">
            {badge}
          </span>
        </div>
        {children}
      </DialogContent>
    </Dialog>
  );
}
