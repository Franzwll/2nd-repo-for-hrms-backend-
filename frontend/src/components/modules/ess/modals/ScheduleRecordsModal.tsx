import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TablePagination } from "@/components/ui/table-pagination";
import { ListBody } from "@/components/portal/ListBody";
import { ListEmptyState } from "@/components/portal/ListEmptyState";
import { EssStatusBadge } from "@/components/modules/ess/shared/EssStatusBadge";
import { usePagination } from "@/hooks/usePagination";

interface ScheduleRecordsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dtrRecords: any[];
  onRowClick?: (row: any, category: string) => void;
}

// TRY: Reuses DTR table pattern in a Dialog.
// Delete this file + its usage in EssAttendanceTab if not applicable.
export function ScheduleRecordsModal({
  open,
  onOpenChange,
  dtrRecords,
  onRowClick,
}: ScheduleRecordsModalProps) {
  const [query, setQuery] = useState("");

  const filteredAttendance = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return dtrRecords;
    return dtrRecords.filter(
      (h: any) =>
        String(h.date ?? "").toLowerCase().includes(q) ||
        String(h.status ?? "").toLowerCase().includes(q) ||
        String(h.timeIn ?? "").toLowerCase().includes(q) ||
        String(h.timeOut ?? "").toLowerCase().includes(q)
    );
  }, [dtrRecords, query]);

  const attPage = usePagination(filteredAttendance, 5);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            Attendance Records
          </DialogTitle>
          <DialogDescription>
            Backing records for this week&apos;s roster. Same source as DTR
            History tab.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="relative w-full sm:w-56">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search DTR records…"
              className="pl-8 h-9"
            />
          </div>
        </div>

        <div className="mt-3 min-h-0 flex-1 overflow-y-auto">
          <ListBody rows={5}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time In</TableHead>
                  <TableHead>Time Out</TableHead>
                  <TableHead>Status &amp; Remark</TableHead>
                  <TableHead className="text-right">Hours</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attPage.pageItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <ListEmptyState
                        placeholder="Search DTR records…"
                        subject="DTR records"
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  attPage.pageItems.map((h: any, i: number) => (
                    <TableRow
                      key={i}
                      className={onRowClick ? "cursor-pointer hover:bg-muted/50" : undefined}
                      onClick={() => onRowClick?.(h, "Attendance")}
                    >
                      <TableCell className="font-medium text-xs text-foreground">
                        {h.date}
                      </TableCell>
                      <TableCell className="text-xs font-mono">{h.timeIn}</TableCell>
                      <TableCell className="text-xs font-mono">{h.timeOut}</TableCell>
                      <TableCell>
                        <EssStatusBadge status={h.status} />
                      </TableCell>
                      <TableCell className="text-right text-xs font-semibold font-mono text-foreground">
                        {h.workedHours} hrs
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ListBody>
        </div>

        <div className="shrink-0 border-t border-border/60 pt-3">
          <TablePagination
            page={attPage.page}
            pageCount={attPage.pageCount}
            from={attPage.from}
            to={attPage.to}
            total={attPage.total}
            label="records"
            showRangeLabel={false}
            onPageChange={attPage.setPage}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
