import type { LucideIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  to,
  onClick,
  action,
  loading = false,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "primary" | "gold" | "success" | "caution";
  /** Route to navigate to when the card is clicked. */
  to?: string;
  onClick?: () => void;
  /** Optional element rendered at the bottom of the card (e.g. a button). */
  action?: React.ReactNode;
  /** Render a pulsing placeholder instead of the value while data loads. */
  loading?: boolean;
}) {
  const toneClass = {
    default: "text-foreground",
    primary: "text-primary",
    gold: "text-gold",
    success: "text-success",
    caution: "text-caution",
  }[tone];

  const interactive = Boolean(to || onClick);

  const body = (
    <CardContent className="p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="eyebrow">{label}</p>
        <span className="flex items-center gap-1.5">
          {Icon && <Icon className={cn("h-4 w-4", toneClass)} />}
          {interactive && (
            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          )}
        </span>
      </div>
      {loading ? (
        <Skeleton className="mt-2 h-9 w-20" aria-busy="true" aria-label="Loading value" />
      ) : (
        <p className={cn("mt-2 font-display text-3xl font-semibold", toneClass)}>{value}</p>
      )}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      {action && <div className="mt-3">{action}</div>}
    </CardContent>
  );

  const cardClass = cn(
    "border-border/70 h-full transition-all group cursor-pointer hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md",
  );

  if (to) {
    // Split any inline query string into a `search` object so TanStack Router
    // treats this as a client-side navigation instead of resolving the whole
    // string (query included) as a pathname.
    const [pathname, queryString] = to.split("?");
    const search = queryString ? Object.fromEntries(new URLSearchParams(queryString)) : undefined;

    return (
      <Link
        to={pathname as never}
        search={search as never}
        className="block h-full focus-visible:outline-none"
      >
        <Card className={cardClass}>{body}</Card>
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="block h-full w-full text-left">
        <Card className={cardClass}>{body}</Card>
      </button>
    );
  }

  return <Card className={cardClass}>{body}</Card>;
}
