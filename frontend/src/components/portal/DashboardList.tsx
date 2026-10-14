import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Fixed-height, scrollable row list for the role dashboards.
 *
 * The dashboards lay two cards out side by side, so a list whose height tracked
 * its own row count made the whole card jump every time a request came back
 * with more (or fewer) rows — and an uncapped list just grew until the card
 * pushed the page down. This pins the body to exactly `visibleRows` rows and
 * scrolls whatever is left over, so the card keeps one height regardless of
 * what the API returns.
 *
 * `rowHeight` is the rendered height of ONE row including its gap. It is
 * measured per call site because row shapes differ between cards; it is not
 * guessed here.
 */
export function DashboardList({
  rowHeight,
  visibleRows = 5,
  className,
  style,
  children,
  ...rest
}: {
  /** Rendered height of a single row, gap included. */
  rowHeight: number;
  /** How many rows stay visible before the list scrolls. */
  visibleRows?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "style">) {
  return (
    <div
      {...rest}
      className={cn("overflow-y-auto overscroll-contain pr-1", className)}
      style={{ height: rowHeight * visibleRows, ...style }}
    >
      {children}
    </div>
  );
}

export default DashboardList;