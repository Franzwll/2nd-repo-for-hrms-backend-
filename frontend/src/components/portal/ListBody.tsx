import { cn } from "@/lib/utils";

/** Approximate rendered height of one table/list row, in rem. */
export const LIST_ROW_REM = 3.25;

/**
 * Minimum body height for a list card, sized to a full page of rows so the
 * card never shrinks when a search returns 0-9 results.
 */
export function listBodyMinHeight(rows = 10, rowRem = LIST_ROW_REM) {
  return { minHeight: `${(rows * rowRem).toFixed(2)}rem` };
}

/**
 * Wrapper that keeps a list/table body at a constant height regardless of how
 * many rows are rendered. Remaining space is simply left empty.
 */
export function ListBody({
  rows = 10,
  rowRem = LIST_ROW_REM,
  className,
  children,
}: {
  /** Rows a full page holds (defaults to the shared page size). */
  rows?: number;
  /** Height of a single row, in rem. */
  rowRem?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col", className)} style={listBodyMinHeight(rows, rowRem)}>
      {children}
    </div>
  );
}
