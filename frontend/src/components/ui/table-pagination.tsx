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
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
          <Button
            key={p}
            size="sm"
            variant={p === page ? "default" : "outline"}
            className="w-9"
            onClick={() => onPageChange(p)}
          >
            {p}
          </Button>
        ))}
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
