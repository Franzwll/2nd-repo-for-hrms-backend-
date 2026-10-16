import { useMemo, useState } from "react";
import { Calendar, FileText, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  leaveHistory: any[];
  onRowClick?: (row: any, category: string) => void;
}

// TRY: Reuses DTR (686:762) + Leave (851:937) table patterns in a Dialog.
// Delete this file + its usage in EssAttendanceTab if not applicable.
export function ScheduleRecordsModal({
  open,
  onOpenChange,
  dtrRecords,
  leaveHistory,
  onRowClick,
}: ScheduleRecordsModalProps) {
  const [tab, setTab] = useState<"attendance" | "leave">("attendance");
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

  const filteredLeaves = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return leaveHistory;
    return leaveHistory.filter(
      (item: any) =>
        String(item.request_code ?? item.id ?? "").toLowerCase().includes(q) ||
        String(item.request_type ?? item.type ?? "").toLowerCase().includes(q) ||
        String(item.status ?? "").toLowerCase().includes(q) ||
        String(item.details ?? item.reason ?? "").toLowerCase().includes(q)
    );
  }, [leaveHistory, query]);

  const attPage = usePagination(filteredAttendance, 5);
  const leavePage = usePagination(filteredLeaves, 5);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            Attendance &amp; Leave Records
          </DialogTitle>
          <DialogDescription>
            Backing records for this week&apos;s roster. Same source as DTR
            History and Leave History tabs.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as typeof tab)}
          className="flex flex-col min-h-0 flex-1"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <TabsList className="h-9">
              <TabsTrigger value="attendance" className="gap-1.5 text-xs">
                <Calendar className="h-3.5 w-3.5" /> Attendance
              </TabsTrigger>
              <TabsTrigger value="leave" className="gap-1.5 text-xs">
                <FileText className="h-3.5 w-3.5" /> Leaves
              </TabsTrigger>
            </TabsList>
            <div className="relative w-full sm:w-56">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  tab === "attendance"
                    ? "Search DTR records…"
                    : "Search leave…"
                }
                className="pl-8 h-9"
              />
            </div>
          </div>

          <TabsContent value="attendance" className="mt-3 min-h-0 flex-1 overflow-y-auto">
            <ListBody>
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
            <div className="shrink-0 border-t border-border/60 pt-3 mt-3">
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
          </TabsContent>

          <TabsContent value="leave" className="mt-3 min-h-0 flex-1 overflow-y-auto">
            <ListBody>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leavePage.pageItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <ListEmptyState
                          placeholder="Search leave…"
                          subject="leave requests"
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    leavePage.pageItems.map((item: any, idx: number) => (
                      <TableRow
                        key={idx}
                        className={onRowClick ? "cursor-pointer hover:bg-muted/50" : undefined}
                        onClick={() => onRowClick?.(item, "Leave")}
                      >
                        <TableCell className="text-xs font-mono font-medium text-foreground">
                          {item.request_code || item.id}
                        </TableCell>
                        <TableCell className="text-xs font-semibold">
                          {item.request_type || item.type}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {item.date_from || item.dateFrom}{" "}
                          {item.date_to && item.date_to !== item.date_from
                            ? `to ${item.date_to}`
                            : ""}
                        </TableCell>
                        <TableCell>
                          <EssStatusBadge status={item.status} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ListBody>
            <div className="shrink-0 border-t border-border/60 pt-3 mt-3">
              <TablePagination
                page={leavePage.page}
                pageCount={leavePage.pageCount}
                from={leavePage.from}
                to={leavePage.to}
                total={leavePage.total}
                label="requests"
                showRangeLabel={false}
                onPageChange={leavePage.setPage}
              />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
