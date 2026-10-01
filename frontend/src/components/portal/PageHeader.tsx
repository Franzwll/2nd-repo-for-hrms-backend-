import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  /** When false, hides the divider line below the header (keeps the spacing gap). */
  showRule?: boolean;
  /** Divider color — gold by default, maroon uses the primary token. */
  ruleTone?: "gold" | "maroon";
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  children,
  className,
  showRule = true,
  ruleTone = "gold",
}: PageHeaderProps) {
  return (
    <div className={cn("mb-6", className)}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 flex-1">
          {eyebrow && <div className="eyebrow mb-1">{eyebrow}</div>}
          <h1 className="font-display text-3xl font-semibold md:text-4xl">{title}</h1>
          {description && (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
          )}
          {children && <div className="mt-3">{children}</div>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
      </div>
      {showRule ? (
        <div className={ruleTone === "maroon" ? "maroon-rule mt-4" : "gold-rule mt-4"} />
      ) : (
        <div aria-hidden className="mt-4 h-px" />
      )}
    </div>
  );
}

