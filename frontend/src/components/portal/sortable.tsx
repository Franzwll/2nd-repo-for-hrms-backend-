import * as React from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { TableHead } from "@/components/ui/table";

export type SortDir = "asc" | "desc";
export type SortState<K extends string> = { key: K; dir: SortDir } | null;

/**
 * Shared client-side table sorting helper used across every HRMS data table.
 * `accessors` maps a column key to a comparable primitive for each row.
 */
export function useSort<T, K extends string>(
  rows: T[],
  accessors: Record<K, (row: T) => string | number | null | undefined>,
  initial: SortState<K> = null,
) {
  const [sort, setSort] = React.useState<SortState<K>>(initial);

  const toggle = React.useCallback((key: K) => {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      return null;
    });
  }, []);

  const sorted = React.useMemo(() => {
    if (!sort) return rows;
    const get = accessors[sort.key];
    if (!get) return rows;
    const factor = sort.dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const va = get(a);
      const vb = get(b);
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === "number" && typeof vb === "number") return (va - vb) * factor;
      return (
        String(va).localeCompare(String(vb), undefined, { numeric: true, sensitivity: "base" }) *
        factor
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, sort]);

  return { sort, toggle, sorted };
}

export function SortHead<K extends string>({
  sortKey,
  sort,
  onSort,
  children,
  className,
  align = "left",
}: {
  sortKey: K;
  sort: SortState<K>;
  onSort: (key: K) => void;
  children: React.ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
}) {
  const active = sort?.key === sortKey;
  const Icon = !active ? ChevronsUpDown : sort?.dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <TableHead className={cn("p-0", className)}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          "flex w-full cursor-pointer select-none items-center gap-1.5 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide transition-colors hover:text-foreground",
          active ? "text-foreground" : "text-muted-foreground",
          align === "right" && "justify-end text-right",
          align === "center" && "justify-center text-center",
        )}
      >
        <span>{children}</span>
        <Icon className={cn("h-3.5 w-3.5 shrink-0", active ? "opacity-100" : "opacity-40")} />
      </button>
    </TableHead>
  );
}
