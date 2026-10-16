import { useEffect, useMemo, useState } from "react";
import { CalendarCheck, LayoutGrid, List, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { cn } from "@/lib/utils";
import { DayButton } from "react-day-picker";

interface ScheduleRecordsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dtrRecords: any[];
  onRowClick?: (row: any, category: string) => void;
}

// TRY: calendar trial — dots mark daily status, list toggle keeps the old table.
// Delete the calendar block (or the list block) once scrum picks a winner.
type DayStatus = "present" | "late" | "absent" | "rest";

function statusOf(h: any): DayStatus | null {
  const s = String(h?.status ?? "").toLowerCase();
  if (s.includes("late")) return "late";
  if (s.includes("absent")) return "absent";
  if (s.includes("rest")) return "rest";
  if (s.includes("present")) return "present";
  return null;
}

function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function parseRecordDate(v: any): Date | null {
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

const DOT_CLASS: Record<DayStatus, string> = {
  present: "bg-emerald-500",
  late: "bg-amber-500",
  absent: "bg-red-500",
  rest: "bg-muted-foreground/40",
};

function StatusDayButton({ day, modifiers, className, ...props }: React.ComponentProps<typeof DayButton>) {
  const status: DayStatus | null =
    modifiers["present"] ? "present"
    : modifiers["late"] ? "late"
    : modifiers["absent"] ? "absent"
    : modifiers["rest"] ? "rest"
    : null;
  const tint =
    !modifiers["selected"] && status
      ? {
          present: "bg-emerald-500/10 hover:bg-emerald-500/20",
          late: "bg-amber-500/10 hover:bg-amber-500/20",
          absent: "bg-red-500/10 hover:bg-red-500/20",
          rest: "bg-muted/50 hover:bg-muted",
        }[status]
      : "";
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-1 rounded-xl text-sm transition-all",
        !modifiers["selected"] && "hover:bg-muted",
        tint,
        modifiers["selected"] && "bg-primary font-bold text-primary-foreground shadow-sm",
        !modifiers["selected"] && modifiers["today"] && "font-bold text-primary ring-1 ring-inset ring-primary/50",
        modifiers["outside"] && "opacity-40",
        className
      )}
    >
      <span className="font-semibold leading-none">{day.date.getDate()}</span>
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          modifiers["selected"] ? "bg-white" : status ? DOT_CLASS[status] : "bg-transparent"
        )}
      />
    </button>
  );
}

const LEGEND: { status: DayStatus; label: string }[] = [
  { status: "present", label: "Present" },
  { status: "late", label: "Late" },
  { status: "absent", label: "Absent" },
  { status: "rest", label: "Rest Day" },
];

export function ScheduleRecordsModal({
  open,
  onOpenChange,
  dtrRecords,
  onRowClick,
}: ScheduleRecordsModalProps) {
  const [view, setView] = useState<"calendar" | "list">("calendar");
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

  // Calendar trial: ISO-keyed map of day -> record + status modifier lists.
  const byDate = useMemo(() => {
    const map = new Map<string, { record: any; date: Date; status: DayStatus | null }>();
    for (const h of dtrRecords) {
      const d = parseRecordDate(h?.date);
      if (!d) continue;
      const key = dayKey(d);
      if (!map.has(key)) map.set(key, { record: h, date: d, status: statusOf(h) });
    }
    return map;
  }, [dtrRecords]);

  const modifiers = useMemo(() => {
    const present: Date[] = [];
    const late: Date[] = [];
    const absent: Date[] = [];
    const rest: Date[] = [];
    for (const { date, status } of byDate.values()) {
      if (status === "present") present.push(date);
      else if (status === "late") late.push(date);
      else if (status === "absent") absent.push(date);
      else if (status === "rest") rest.push(date);
    }
    return { present, late, absent, rest };
  }, [byDate]);

  // Clamp month navigation to months that actually have records.
  const coverage = useMemo(() => {
    const dates = [...byDate.values()].map((v) => v.date).sort((a, b) => a.getTime() - b.getTime());
    if (dates.length === 0) {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: start, to: start, latestKey: dayKey(now) };
    }
    const first = dates[0] as Date;
    const last = dates[dates.length - 1] as Date;
    return {
      from: new Date(first.getFullYear(), first.getMonth(), 1),
      to: new Date(last.getFullYear(), last.getMonth(), 1),
      latestKey: dayKey(last),
    };
  }, [byDate]);

  const [month, setMonth] = useState<Date>(coverage.to);
  const [selectedKey, setSelectedKey] = useState<string | null>(coverage.latestKey);

  // Records can arrive after first render — resync month/selection then.
  useEffect(() => {
    setMonth(coverage.to);
    if (!selectedKey || !byDate.has(selectedKey)) setSelectedKey(coverage.latestKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coverage]);

  const selected = selectedKey ? byDate.get(selectedKey) ?? null : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            Attendance Records
          </DialogTitle>
          <DialogDescription>
            Monthly calendar and full history of your time records. Select a day or row for details.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center rounded-lg border border-border/70 bg-muted/20 p-0.5">
            <button
              type="button"
              onClick={() => setView("calendar")}
              aria-label="Calendar view"
              className={`rounded-md p-1.5 transition-colors cursor-pointer ${view === "calendar" ? "bg-background shadow-xs text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              aria-label="List view"
              className={`rounded-md p-1.5 transition-colors cursor-pointer ${view === "list" ? "bg-background shadow-xs text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          {view === "list" && (
            <div className="relative w-full sm:w-56">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search DTR records…"
                className="pl-8 h-9"
              />
            </div>
          )}
          {view === "calendar" && (
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
              {LEGEND.map((l) => (
                <span key={l.status} className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background px-2 py-0.5 font-medium">
                  <span className={cn("h-2 w-2 rounded-full", DOT_CLASS[l.status])} />
                  {l.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {view === "calendar" ? (
          <div className="mt-3 min-h-0 flex-1 overflow-y-auto">
            <div className="rounded-xl border border-border/60 bg-card p-4 shadow-xs">
              <Calendar
                mode="single"
                month={month}
                onMonthChange={setMonth}
                startMonth={coverage.from}
                endMonth={coverage.to}
                selected={selected ? selected.date : undefined}
                onSelect={(_, selectedDay) => {
                  if (selectedDay) setSelectedKey(dayKey(selectedDay));
                }}
                modifiers={modifiers}
                components={{ DayButton: StatusDayButton }}
                classNames={{
                  month_caption: "text-base font-display font-bold",
                  weekday: "text-[11px] font-bold uppercase tracking-wider",
                  today: "bg-transparent",
                }}
                className="mx-auto w-full max-w-md [--cell-size:3rem]"
              />
            </div>
            <div className="mt-3 rounded-xl border border-border/70 bg-gradient-to-r from-primary/[0.07] via-card to-card p-4 text-xs shadow-xs">
              {selected ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <CalendarCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{selected.record.date}</p>
                      <p className="mt-0.5 text-muted-foreground">
                        In <strong className="font-mono text-foreground">{selected.record.timeIn}</strong>
                        {" · "}Out <strong className="font-mono text-foreground">{selected.record.timeOut}</strong>
                        {" · "}<strong className="font-mono text-foreground">{selected.record.workedHours} hrs</strong>
                      </p>
                    </div>
                    <EssStatusBadge status={selected.record.status} />
                  </div>
                  {onRowClick && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs text-primary cursor-pointer"
                      onClick={() => onRowClick(selected.record, "Attendance")}
                    >
                      Timeline →
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">No record for this day — select a dotted date.</p>
              )}
            </div>
          </div>
        ) : (
          <>
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
