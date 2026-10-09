import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SortHead, useSort, type SortState } from "@/components/portal/sortable";
import { TablePagination } from "@/components/ui/table-pagination";
import { TableRowsSkeleton } from "@/components/ui/loading-skeletons";
import { ListEmptyState } from "@/components/portal/ListEmptyState";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type FilterType = "text" | "select" | "date" | "number";

export interface DataColumn<T> {
  key: string;
  header: React.ReactNode;
  accessor: (row: T) => string | number | null | undefined;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: FilterType;
  filterOptions?: string[];
  align?: "left" | "right" | "center";
}

function matchesFilter<T>(row: T, col: DataColumn<T>, f: string): boolean {
  if (!f) return true;
  const v = col.accessor(row);
  if (v == null) return false;
  if (
    col.filterType === "date" ||
    col.filterType === "number" ||
    col.filterType === "text" ||
    !col.filterType
  ) {
    return String(v).toLowerCase().includes(f.toLowerCase());
  }
  // select: exact match (case-insensitive)
  return String(v).toLowerCase() === f.toLowerCase();
}

/**
 * Shared sortable + filterable data table. Every data column gets
 * sort + filter unless explicitly opted out (actions columns).
 */
export function DataTable<T extends { id?: string | number }>({
  columns,
  rows,
  loading = false,
  emptyTitle = "No records found",
  emptyBody = "Try adjusting your filters.",
  pageSize: controlledPageSize,
  onPageSizeChange,
  label = "records",
  initialSort = null,
  className,
}: {
  columns: DataColumn<T>[];
  rows: T[];
  loading?: boolean;
  emptyTitle?: string;
  emptyBody?: string;
  pageSize?: number;
  onPageSizeChange?: (n: number) => void;
  label?: string;
  initialSort?: SortState<string>;
  className?: string;
}) {
  const keys = React.useMemo(() => columns.map((c) => c.key), [columns]);
  const accessors = React.useMemo(() => {
    const m: Record<string, (row: T) => string | number | null | undefined> = {};
    columns.forEach((c) => {
      m[c.key] = c.accessor;
    });
    return m;
  }, [columns]);

  const { sort, toggle, sorted } = useSort<T, string>(rows, accessors, initialSort);
  const [filters, setFilters] = React.useState<Record<string, string>>({});
  const [page, setPage] = React.useState(1);
  const [innerSize, setInnerSize] = React.useState(10);
  const pageSize = controlledPageSize ?? innerSize;

  const filtered = React.useMemo(() => {
    return sorted.filter((r) => columns.every((c) => matchesFilter(r, c, filters[c.key] ?? "")));
  }, [sorted, columns, filters]);

  React.useEffect(() => {
    setPage(1);
  }, [filters, sort, rows.length, pageSize]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const from = filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, filtered.length);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const hasFilter = columns.some((c) => c.filterable !== false);

  return (
    <div className={cn("w-full", className)}>
      <div className="overflow-x-auto rounded-lg border border-border/70">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((c) =>
                c.sortable !== false ? (
                  <SortHead
                    key={c.key}
                    sortKey={c.key}
                    sort={sort}
                    onSort={(k: string) => toggle(k)}
                    {...(c.align ? { align: c.align } : {})}
                  >
                    {c.header}
                  </SortHead>
                ) : (
                  <TableHead key={c.key}>{c.header}</TableHead>
                ),
              )}
            </TableRow>
            {hasFilter && (
              <TableRow className="bg-muted/40">
                {columns.map((c) =>
                  c.filterable === false ? (
                    <TableHead key={`f-${c.key}`} />
                  ) : (
                    <TableHead key={`f-${c.key}`} className="px-2 py-1.5">
                      {c.filterType === "select" && c.filterOptions ? (
                        <select
                          aria-label={`Filter ${String(c.header)}`}
                          value={filters[c.key] ?? ""}
                          onChange={(e) => setFilters((p) => ({ ...p, [c.key]: e.target.value }))}
                          className="h-8 w-full rounded-md border border-input bg-background px-1.5 text-xs"
                        >
                          <option value="">All</option>
                          {c.filterOptions.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <Input
                          aria-label={`Filter ${String(c.header)}`}
                          placeholder={`Filter…`}
                          value={filters[c.key] ?? ""}
                          onChange={(e) => setFilters((p) => ({ ...p, [c.key]: e.target.value }))}
                          className="h-8 text-xs"
                          type={
                            c.filterType === "number"
                              ? "number"
                              : c.filterType === "date"
                                ? "date"
                                : "text"
                          }
                        />
                      )}
                    </TableHead>
                  ),
                )}
              </TableRow>
            )}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRowsSkeleton cols={columns.length} rows={5} />
            ) : pageRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <ListEmptyState subject={emptyTitle} placeholder={emptyBody} />
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((r, i) => (
                <TableRow key={(r.id as string) ?? i}>
                  {columns.map((c) => (
                    <TableCell
                      key={c.key}
                      className={cn(
                        c.align === "right" && "text-right",
                        c.align === "center" && "text-center",
                      )}
                    >
                      {c.render ? c.render(r) : String(c.accessor(r) ?? "—")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {!loading && (
        <TablePagination
          page={safePage}
          pageCount={pageCount}
          from={from}
          to={to}
          total={filtered.length}
          label={label}
          onPageChange={setPage}
          pageSize={pageSize}
          onPageSizeChange={onPageSizeChange ?? ((n: number) => setInnerSize(n))}
        />
      )}
      <span className="sr-only" aria-live="polite">
        {`Table sorted by ${sort ? `${sort.key} ${sort.dir}` : "default order"}. ${filtered.length} of ${rows.length} ${label}.`}
      </span>
    </div>
  );
}

export function useDataTableControls() {
  return { resetKey: 0 };
}
