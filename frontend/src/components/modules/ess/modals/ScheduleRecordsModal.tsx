import { useEffect, useMemo, useState } from "react";
import { CalendarCheck, ChevronLeft, ChevronRight, LayoutGrid, List, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  weeklyRoster?: { day?: string; shift?: string; time?: string; location?: string }[];
  onRowClick?: (row: any, category: string) => void;
}

// TRY: calendar trial — dots mark daily status, list toggle keeps the old table.
// Delete the calendar block (or the list block) once scrum picks a winner.
type DayStatus = "present" | "late" | "absent" | "leave" | "rest";

const STATUS_LABEL: Record<DayStatus, string> = {
  present: "Present",
  late: "Late",
  absent: "Absent",
  leave: "Leave",
  rest: "Rest Day",
};

function statusOf(h: any): DayStatus | null {
  const status = String(h?.status ?? "").toLowerCase();
  const remark = String(h?.remark ?? h?.remarks ?? "").toLowerCase();
  const text = `${status} ${remark}`;

  // DTR rows often store the process state in `status` ("Completed") and the
  // actual attendance verdict in `remark` ("Present", "Late 7 mins", ...).
  if (/absent|awol|no[-\s]?show/.test(text)) return "absent";
  if (/late|tardy/.test(text)) return "late";
  if (/rest|off[-\s]?duty|day[-\s]?off/.test(text)) return "rest";
  if (/leave|sick|vacation|maternity|paternity|bereavement/.test(text)) return "leave";
  if (/present|on[-\s]?time|completed|regular/.test(text)) return "present";
  if (Number(h?.lateMinutes ?? h?.late_minutes ?? 0) > 0) return "late";
  if (Number(h?.workedHours ?? h?.hours_worked ?? 0) > 0) return "present";
  return null;
}

function attendanceLabel(h: any): string {
  const status = statusOf(h);
  if (status) return STATUS_LABEL[status];
  return h?.remark || h?.remarks || h?.status || "—";
}

function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function dateFromDayKey(key: string): Date | null {
  const [year, month, day] = key.split("-").map(Number);
  if (
    year === undefined ||
    month === undefined ||
    day === undefined ||
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day)
  ) {
    return null;
  }
  return new Date(year, month, day);
}

function parseRecordDate(v: any): Date | null {
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
  const str = String(v ?? "").trim();
  if (!str) return null;
  // Parse bare ISO dates as local dates so a UTC shift cannot move the day.
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(str);
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

const DOT_CLASS: Record<DayStatus, string> = {
  present: "bg-emerald-500",
  late: "bg-amber-500",
  absent: "bg-rose-500",
  leave: "bg-violet-500",
  rest: "bg-slate-400",
};

const TINT_CLASS: Record<DayStatus, string> = {
  present:
    "bg-emerald-500/10 text-emerald-700 ring-1 ring-inset ring-emerald-500/20 hover:bg-emerald-500/20 dark:text-emerald-300",
  late: "bg-amber-500/15 text-amber-700 ring-1 ring-inset ring-amber-500/25 hover:bg-amber-500/25 dark:text-amber-300",
  absent:
    "bg-rose-500/15 text-rose-700 ring-1 ring-inset ring-rose-500/25 hover:bg-rose-500/25 dark:text-rose-300",
  leave:
    "bg-violet-500/10 text-violet-700 ring-1 ring-inset ring-violet-500/20 hover:bg-violet-500/20 dark:text-violet-300",
  rest: "bg-slate-500/10 text-slate-600 ring-1 ring-inset ring-slate-400/20 hover:bg-slate-500/15 dark:text-slate-300",
};

function StatusDayButton({
  day,
  modifiers,
  className,
  compact = false,
  ...props
}: React.ComponentProps<typeof DayButton> & { compact?: boolean }) {
  const status: DayStatus | null = modifiers["present"]
    ? "present"
    : modifiers["late"]
      ? "late"
      : modifiers["absent"]
        ? "absent"
        : modifiers["leave"]
          ? "leave"
          : modifiers["rest"]
            ? "rest"
            : null;
  return (
    <button
      type="button"
      {...props}
      data-attendance-status={status ?? undefined}
      title={status ? STATUS_LABEL[status] : undefined}
      className={cn(
        "flex w-full cursor-pointer select-none flex-col items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]",
        compact ? "h-8 gap-0 rounded-md text-[11px]" : "h-16 gap-1 rounded-xl text-sm",
        !modifiers["selected"] && !status && "hover:bg-muted",
        !modifiers["selected"] && status && TINT_CLASS[status],
        modifiers["selected"] && "bg-primary font-bold text-primary-foreground shadow-sm",
        !modifiers["selected"] &&
          modifiers["today"] &&
          "font-bold text-primary ring-1 ring-inset ring-primary/50",
        modifiers["outside"] && "opacity-40",
        className,
      )}
    >
      <span className="font-semibold leading-none">{day.date.getDate()}</span>
    </button>
  );
}

const LEGEND: { status: DayStatus; label: string; short: string }[] = [
  { status: "present", label: "Present", short: "PRE" },
  { status: "late", label: "Late", short: "LAT" },
  { status: "absent", label: "Absent", short: "ABS" },
  { status: "leave", label: "Leave", short: "LVE" },
  { status: "rest", label: "Rest Day", short: "RST" },
];

const NAV_BUTTON_CLASS =
  "pointer-events-auto inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-border/60 bg-background text-muted-foreground shadow-xs transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40";

export function ScheduleRecordsModal({
  open,
  onOpenChange,
  dtrRecords,
  weeklyRoster = [],
  onRowClick,
}: ScheduleRecordsModalProps) {
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<DayStatus | "all">("all");
  const [yearView, setYearView] = useState(false);

  const filteredAttendance = useMemo(() => {
    const q = query.trim().toLowerCase();
    const wanted = statusFilter === "all" ? null : statusFilter;
    return dtrRecords.filter((h: any) => {
      if (wanted && statusOf(h) !== wanted) return false;
      if (!q) return true;
      return (
        String(h.date ?? "")
          .toLowerCase()
          .includes(q) ||
        String(h.status ?? "")
          .toLowerCase()
          .includes(q) ||
        String(h.remark ?? h.remarks ?? "")
          .toLowerCase()
          .includes(q) ||
        String(h.timeIn ?? "")
          .toLowerCase()
          .includes(q) ||
        String(h.timeOut ?? "")
          .toLowerCase()
          .includes(q)
      );
    });
  }, [dtrRecords, query, statusFilter]);

  const attPage = usePagination(filteredAttendance, 5);

  // Calendar trial: ISO-keyed map of day -> record + status modifier lists.
  const byDate = useMemo(() => {
    const map = new Map<string, { record: any; date: Date; status: DayStatus | null }>();
    for (const h of dtrRecords) {
      const d = parseRecordDate(h?.rawDate ?? h?.date);
      if (!d) continue;
      const key = dayKey(d);
      if (!map.has(key)) map.set(key, { record: h, date: d, status: statusOf(h) });
    }
    return map;
  }, [dtrRecords]);

  // Rest weekdays come from the roster, so scheduled off-duty dates are
  // colour-coded even when no DTR row exists for them.
  const restWeekdays = useMemo(() => {
    const names = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const days = new Set<number>();
    for (const item of weeklyRoster) {
      const text = `${item?.shift ?? ""} ${item?.time ?? ""} ${item?.location ?? ""}`.toLowerCase();
      if (!/(rest|off[-\s]?duty|day[-\s]?off)/.test(text)) continue;
      const index = names.indexOf(String(item?.day ?? "").toLowerCase());
      if (index >= 0) days.add(index);
    }
    return days;
  }, [weeklyRoster]);

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

  // Browsing window: first record month → current real month.
  // Months without records render empty (future `?month=` fetch can fill them).
  const window = useMemo(() => {
    const now = new Date();
    return {
      from: coverage.from,
      to: new Date(now.getFullYear(), now.getMonth(), 1),
    };
  }, [coverage]);

  // Scheduled rest days across the browsable window. A real DTR row wins if
  // one exists (e.g. someone worked on their rest day).
  const restDates = useMemo(() => {
    if (restWeekdays.size === 0) return [] as Date[];
    const dates: Date[] = [];
    const cursor = new Date(window.from.getFullYear(), window.from.getMonth(), 1);
    const end = new Date(window.to.getFullYear(), window.to.getMonth() + 1, 0);
    while (cursor <= end) {
      if (restWeekdays.has(cursor.getDay()) && !byDate.has(dayKey(cursor))) {
        dates.push(new Date(cursor));
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    return dates;
  }, [window, restWeekdays, byDate]);

  const modifiers = useMemo(() => {
    const present: Date[] = [];
    const late: Date[] = [];
    const absent: Date[] = [];
    const leave: Date[] = [];
    const rest: Date[] = [...restDates];
    for (const { date, status } of byDate.values()) {
      if (status === "present") present.push(date);
      else if (status === "late") late.push(date);
      else if (status === "absent") absent.push(date);
      else if (status === "leave") leave.push(date);
      else if (status === "rest") rest.push(date);
    }
    return { present, late, absent, leave, rest };
  }, [byDate, restDates]);

  const [month, setMonth] = useState<Date>(() =>
    coverage.to > window.to ? window.to : coverage.to,
  );
  const [selectedKey, setSelectedKey] = useState<string | null>(coverage.latestKey);

  // Records can arrive after first render — resync selection, and clamp
  // the viewed month into the window instead of yanking it back.
  useEffect(() => {
    setMonth((m) => {
      if (m < window.from) return window.from;
      if (m > window.to) return window.to;
      return m;
    });
    if (!selectedKey || !byDate.has(selectedKey)) setSelectedKey(coverage.latestKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coverage]);

  const selected = selectedKey ? (byDate.get(selectedKey) ?? null) : null;
  const selectedDate = selectedKey ? dateFromDayKey(selectedKey) : null;

  const handleCaptionClick = (date: Date) => {
    if (yearView) {
      setMonth(new Date(date.getFullYear(), date.getMonth(), 1));
      setYearView(false);
      return;
    }
    setMonth(new Date(date.getFullYear(), 0, 1));
    setYearView(true);
  };

  const collapseYearView = () => {
    const target =
      selectedDate && selectedDate.getFullYear() === month.getFullYear()
        ? selectedDate
        : new Date(month.getFullYear(), 0, 1);
    setMonth(new Date(target.getFullYear(), target.getMonth(), 1));
    setYearView(false);
  };

  // Keep the selected month visible even when the user jumps to a month in a
  // different year from the year view. Without widening the range, DayPicker
  // clamps back to the first/last month that has DTR data.
  const rangeStart = yearView
    ? new Date(month.getFullYear(), 0, 1)
    : month.getTime() < window.from.getTime()
      ? new Date(month.getFullYear(), 0, 1)
      : window.from;
  const rangeEnd = yearView
    ? new Date(month.getFullYear(), 11, 1)
    : month.getTime() > window.to.getTime()
      ? new Date(month.getFullYear(), 11, 1)
      : window.to;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">Attendance Records</DialogTitle>
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
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <div className="relative min-w-0 flex-1 sm:w-56 sm:flex-none">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search DTR records…"
                  className="pl-8 h-9"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as DayStatus | "all")}
              >
                <SelectTrigger className="h-9 w-36 shrink-0 sm:w-40" aria-label="Filter by status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {LEGEND.map((l) => (
                    <SelectItem key={l.status} value={l.status}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {view === "calendar" && (
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
              {LEGEND.map((l) => (
                <span
                  key={l.status}
                  title={l.label}
                  aria-label={l.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background px-2 py-0.5 font-semibold tracking-wide"
                >
                  <span className={cn("h-2 w-2 rounded-full", DOT_CLASS[l.status])} />
                  {l.short}
                </span>
              ))}
            </div>
          )}
        </div>

        {view === "calendar" ? (
          <>
            <div className="mt-3 min-h-0 flex-1 overflow-y-auto">
              <div className="rounded-xl border border-border/60 bg-card p-4 shadow-xs">
              <div className="w-full">
                {yearView && (
                  <div className="mb-3 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setMonth(new Date(month.getFullYear() - 1, 0, 1))
                      }
                      aria-label="Previous year"
                      className={NAV_BUTTON_CLASS}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={collapseYearView}
                      title="Collapse to month view"
                      aria-label={`Collapse ${month.getFullYear()} to month view`}
                      className="min-w-16 cursor-pointer rounded-md px-2 py-1 text-center font-display text-base font-bold transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {month.getFullYear()}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setMonth(new Date(month.getFullYear() + 1, 0, 1))
                      }
                      aria-label="Next year"
                      className={NAV_BUTTON_CLASS}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <Calendar
                  mode="single"
                  month={month}
                  onMonthChange={setMonth}
                  startMonth={rangeStart}
                  endMonth={rangeEnd}
                  numberOfMonths={yearView ? 12 : 1}
                  showOutsideDays={!yearView}
                  hideNavigation={yearView}
                  selected={selectedDate ?? undefined}
                  onSelect={(_, selectedDay) => {
                    if (selectedDay) {
                      setSelectedKey(dayKey(selectedDay));
                      setMonth(new Date(selectedDay.getFullYear(), selectedDay.getMonth(), 1));
                      if (yearView) setYearView(false);
                    }
                  }}
                  formatters={{
                    formatWeekdayName: (date) =>
                      date.toLocaleDateString("en-US", { weekday: "short" }),
                  }}
                  modifiers={modifiers}
                  components={{
                    DayButton: (buttonProps) => (
                      <StatusDayButton {...buttonProps} compact={yearView} />
                    ),
                    MonthCaption: ({
                      calendarMonth,
                      displayIndex: _displayIndex,
                      children: _children,
                      className,
                      ...props
                    }) => {
                      const label = calendarMonth.date.toLocaleDateString(
                        "en-US",
                        yearView ? { month: "short" } : { month: "short", year: "numeric" },
                      );
                      return (
                        <div
                          className={cn(
                            "relative flex w-full items-center justify-center",
                            yearView ? "h-9" : "h-10 px-10",
                            className,
                          )}
                          {...props}
                        >
                          <button
                            type="button"
                            onClick={() => handleCaptionClick(calendarMonth.date)}
                            aria-expanded={yearView}
                            title={
                              yearView
                                ? `Show ${calendarMonth.date.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`
                                : `Show all months in ${calendarMonth.date.getFullYear()}`
                            }
                            aria-label={
                              yearView
                                ? `Show ${calendarMonth.date.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`
                                : `Show all months in ${calendarMonth.date.getFullYear()}`
                            }
                            className="inline-flex cursor-pointer items-center rounded-md px-2 py-1 font-display text-base font-bold transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {label}
                          </button>
                        </div>
                      );
                    },
                    Nav: ({
                      className,
                      onPreviousClick: _onPreviousClick,
                      onNextClick: _onNextClick,
                      previousMonth,
                      nextMonth,
                      ...props
                    }) => (
                      <nav
                        className={cn(
                          "pointer-events-none absolute inset-x-0 top-0 z-10 flex w-full items-center justify-between gap-1 px-1",
                          className,
                        )}
                        {...props}
                      >
                        <button
                          type="button"
                          onClick={() => previousMonth && setMonth(previousMonth)}
                          disabled={!previousMonth}
                          aria-label="Previous month"
                          className={NAV_BUTTON_CLASS}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => nextMonth && setMonth(nextMonth)}
                          disabled={!nextMonth}
                          aria-label="Next month"
                          className={NAV_BUTTON_CLASS}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </nav>
                    ),
                  }}
                  classNames={{
                    months: yearView
                      ? "grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                      : "relative flex w-full flex-col",
                    month: yearView
                      ? "w-full rounded-xl border border-border/60 bg-background/60 p-2"
                      : "w-full",
                    month_grid: "w-full table-fixed border-separate border-spacing-1",
                    month_caption: yearView
                      ? "relative flex h-9 w-full items-center justify-center"
                      : "relative flex h-10 w-full items-center justify-center px-10",
                    caption_label: "text-base font-display font-bold",
                    weekdays: "",
                    weekday: yearView
                      ? "p-0.5 text-center text-[9px] font-bold uppercase tracking-wider text-muted-foreground"
                      : "p-1 text-center text-[11px] font-bold uppercase tracking-wider text-muted-foreground",
                    week: "",
                    day: "p-0 text-center align-top",
                    today: "bg-transparent",
                  }}
                  className="w-full [--cell-size:2.5rem]"
                />
              </div>
            </div>
          </div>
          <div className="sticky bottom-0 z-20 mt-3 w-full shrink-0 rounded-xl border border-border/70 bg-gradient-to-r from-primary/[0.07] via-card to-card p-3 text-xs shadow-xs backdrop-blur supports-[backdrop-filter]:bg-card/95">
              {selected ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <CalendarCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{selected.record.date}</p>
                      <p className="mt-0.5 text-muted-foreground">
                        In{" "}
                        <strong className="font-mono text-foreground">
                          {selected.record.timeIn}
                        </strong>
                        {" · "}Out{" "}
                        <strong className="font-mono text-foreground">
                          {selected.record.timeOut}
                        </strong>
                        {" · "}
                        <strong className="font-mono text-foreground">
                          {selected.record.workedHours} hrs
                        </strong>
                      </p>
                    </div>
                    <EssStatusBadge status={attendanceLabel(selected.record)} />
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  {selectedDate ? (
                    <>
                      No time record for{" "}
                      <strong className="font-semibold text-foreground">
                        {selectedDate.toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </strong>{" "}
                      — select a marked date.
                    </>
                  ) : (
                    "Select a date to view its time record."
                  )}
                </p>
              )}
          </div>
          </>
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
                          <ListEmptyState placeholder="Search DTR records…" subject="DTR records" />
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
                            <EssStatusBadge status={attendanceLabel(h)} />
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
