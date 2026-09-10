import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Re-exported so route files can pull every skeleton primitive (including the
// base `Skeleton`) from this single module — keeps dashboard imports consistent.
export { Skeleton };

/**
 * Standard loading skeletons for every data card/table in the app.
 * Use these instead of bare "Loading…" text or lone spinners so each
 * module shows layout-stable pulsing blocks while its API request is in flight.
 *
 *   if (loading) return <TableSkeleton cols={7} rows={6} />;
 *   if (loading) return <StatCardsSkeleton count={4} />;
 *   if (loading) return <CardSkeleton rows={4} />;
 */

export function CardSkeleton({ rows = 4, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("space-y-2.5 p-1", className)} aria-busy="true" aria-label="Loading">
      <Skeleton className="h-5 w-1/3" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" style={{ opacity: 1 - i * 0.12 }} />
      ))}
    </div>
  );
}

export function TableSkeleton({ cols = 5, rows = 6 }: { cols?: number; rows?: number }) {
  return (
    <div className="space-y-2 p-4" aria-busy="true" aria-label="Loading table">
      <Skeleton className="h-8 w-full" />
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-2">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-6 flex-1" style={{ opacity: 1 - r * 0.1 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      aria-busy="true"
      aria-label="Loading statistics"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2 rounded-lg border border-border/60 p-4">
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-7 w-2/3" />
        </div>
      ))}
    </div>
  );
}
export function ListSkeleton({
  items = 5,
  className,
}: {
  items?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("space-y-2 py-1", className)}
      aria-busy="true"
      aria-label="Loading list"
    >
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Pulsing placeholder rows rendered INSIDE a <TableBody> while the table
 * query is in flight — keeps column layout stable instead of a single
 * "Loading…" text row.
 *
 *   {loading && <TableRowsSkeleton cols={9} rows={5} />}
 */
export function TableRowsSkeleton({ cols = 5, rows = 5 }: { cols?: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} aria-busy="true" aria-label="Loading row">
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="px-4 py-2.5">
              <Skeleton className="h-4 w-full" style={{ opacity: 1 - r * 0.12 }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
