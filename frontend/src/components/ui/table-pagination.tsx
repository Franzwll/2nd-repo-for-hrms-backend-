import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TablePaginationProps {
  page: number;
  pageCount: number;
  from: number;
  to: number;
  total: number;
  /** Plural noun used in the "Showing 1–10 of 24 records" label. */
  label?: string;
  onPageChange: (page: number) => void;
  className?: string;
}

/** Builds a compact page-number window like: 1 … 4 5 6 … 12 */
function getPageWindow(page: number, pageCount: number, windowSize = 2): (number | "…")[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  const pages: (number | "…")[] = [1];

  const start = Math.max(2, page - windowSize);
  const end = Math.min(pageCount - 1, page + windowSize);

  if (start > 2) pages.push("…");
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < pageCount - 1) pages.push("…");

  pages.push(pageCount);
  return pages;
}

/** Shared pagination footer used by every data table in the app. */
export function TablePagination({
  page,
  pageCount,
  from,
  to,
  total,
  label = "records",
  onPageChange,
  className,
}: TablePaginationProps) {
  if (total === 0) return null;

  const window = getPageWindow(page, pageCount);

  return (
    <div className={cn("mt-4 flex flex-wrap items-center justify-between gap-3", className)}>
      <p className="text-xs text-muted-foreground">
        Showing {from}–{to} of {total} {label}
      </p>
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="outline"
          disabled={page <= 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          Previous
        </Button>
        {window.map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="px-1 text-xs text-muted-foreground">
              …
            </span>
          ) : (
            <Button
              key={p}
              size="sm"
              variant={p === page ? "default" : "outline"}
              className="w-9"
              onClick={() => onPageChange(p)}
            >
              {p}
            </Button>
          ),
        )}
        <Button
          size="sm"
          variant="outline"
          disabled={page >= pageCount}
          onClick={() => onPageChange(Math.min(pageCount, page + 1))}
        >
          Next
        </Button>
      </div>
    </div>
  );
}