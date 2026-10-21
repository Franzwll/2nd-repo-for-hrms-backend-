import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { TableRowsSkeleton } from "@/components/ui/loading-skeletons";
import { usePagination } from "@/hooks/usePagination";
import { EssStatusBadge } from "@/components/modules/ess/shared/EssStatusBadge";
import {
  RequestTimelineModal,
  type RequestItem,
} from "@/components/modules/ess/modals/RequestTimelineModal";
import { essApi, type ApiEssRequestItem } from "@/lib/api";

interface MyRequestHistoryTableProps {
  categories: string[];
  refreshKey?: number;
  emptyMessage?: string;
  submitLabel: string;
  onSubmit: () => void;
}

const STATUS_FILTERS = [
  "all",
  "Pending",
  "Under Review",
  "For Dispatch",
  "With Module",
  "For Release",
  "Completed",
  "Rejected",
  "Returned for Clarification",
] as const;

/**
 * Shared request-history table for every My Request module. Fetches the
 * employee's filings once and filters by the module's category set.
 */
export function MyRequestHistoryTable({
  categories,
  refreshKey = 0,
  emptyMessage = "No requests filed yet.",
  submitLabel,
  onSubmit,
}: MyRequestHistoryTableProps) {
  const [requests, setRequests] = useState<ApiEssRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [timelineOpen, setTimelineOpen] = useState(false);

  const categoryKey = categories.join("|");

  useEffect(() => {
    let alive = true;
    const allowed = new Set(
      categoryKey
        .split("|")
        .map((c) => c.trim().toLowerCase())
        .filter(Boolean),
    );

    setLoading(true);
    essApi
      .myRequests()
      .then((res) => {
        if (!alive) return;
        const rows = (res?.requests ?? []).filter((r) =>
          allowed.has(String(r.category ?? "").toLowerCase()),
        );
        setRequests(rows);
      })
      .catch(() => {
        if (alive) setRequests([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [categoryKey, refreshKey]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return requests
      .filter((r) => {
        const matchesSearch =
          !q ||
          String(r.id ?? "")
            .toLowerCase()
            .includes(q) ||
          String(r.type ?? "")
            .toLowerCase()
            .includes(q) ||
          String(r.details ?? "")
            .toLowerCase()
            .includes(q) ||
          String(r.status ?? "")
            .toLowerCase()
            .includes(q) ||
          String(r.category ?? "")
            .toLowerCase()
            .includes(q);
        const matchesStatus = status === "all" || r.status === status;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => String(b.filed).localeCompare(String(a.filed)));
  }, [requests, search, status]);

  const page = usePagination(filtered);

  const openTimeline = (r: ApiEssRequestItem) => {
    const item: RequestItem = {
      id: r.id,
      type: r.type,
      category: r.category,
      date: r.filed,
      status: r.status,
    };
    if (r.db_id != null) item.dbId = r.db_id;
    if (r.date_from) item.isoDate = r.date_from;
    const assigned = r.assignedTo ?? r.assigned_to;
    if (assigned) item.assignedTo = assigned;
    if (r.details) item.details = r.details;
    if (r.attachments) item.attachments = r.attachments;
    if (r.has_fulfillment != null) item.has_fulfillment = r.has_fulfillment;
    if (r.module) item.module = r.module;
    if (r.module_label) item.moduleLabel = r.module_label;
    if (r.module_note) item.moduleNote = r.module_note;
    if (r.timeline) item.timeline = r.timeline;
    setSelectedRequest(item);
    setTimelineOpen(true);
  };

  return (
    <Card className="border-border/70 shadow-xs">
      <CardContent className="space-y-4 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold">Request History</h2>
            <p className="text-xs text-muted-foreground">
              {loading
                ? "Loading your filings…"
                : `${filtered.length} request${filtered.length === 1 ? "" : "s"} found`}
            </p>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap sm:justify-end">
            <div className="relative min-w-[8.5rem] flex-1 sm:w-44 sm:flex-none">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search requests…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-8 text-xs"
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-8 w-[8.25rem] shrink-0 text-xs">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((s) => (
                  <SelectItem key={s} value={s} className="text-xs">
                    {s === "all" ? "All Statuses" : s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              onClick={onSubmit}
              className="h-9 shrink-0 gap-1.5 px-4 text-xs font-semibold"
            >
              <Plus className="h-3.5 w-3.5" />
              {submitLabel}
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border/70">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[16%] text-xs">Request ID</TableHead>
                <TableHead className="w-[14%] text-xs">Date Filed</TableHead>
                <TableHead className="w-[24%] text-xs">Request Type</TableHead>
                <TableHead className="hidden w-[24%] text-xs md:table-cell">Details</TableHead>
                <TableHead className="w-[14%] text-xs">Status</TableHead>
                <TableHead className="w-[8%] text-right text-xs">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRowsSkeleton cols={6} rows={5} />
              ) : page.pageItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-xs text-muted-foreground">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                page.pageItems.map((r) => (
                  <TableRow
                    key={String(r.db_id ?? r.id)}
                    className="cursor-pointer transition-colors"
                    onClick={() => openTimeline(r)}
                  >
                    <TableCell className="font-mono text-xs font-medium text-foreground">
                      {r.id}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.filed}</TableCell>
                    <TableCell className="text-xs font-semibold">
                      {r.type}
                      <Badge
                        variant="outline"
                        className="ml-1.5 hidden align-middle text-[10px] font-normal lg:inline-flex"
                      >
                        {r.category}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className="hidden max-w-[240px] truncate text-xs text-muted-foreground md:table-cell"
                      title={r.details}
                    >
                      {r.details}
                    </TableCell>
                    <TableCell>
                      <EssStatusBadge status={r.status} />
                    </TableCell>
                    <TableCell className="py-1 text-right">
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-primary">
                        View →
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <TablePagination
          page={page.page}
          pageCount={page.pageCount}
          from={page.from}
          to={page.to}
          total={page.total}
          label="requests"
          showRangeLabel={false}
          onPageChange={page.setPage}
        />
      </CardContent>

      <RequestTimelineModal
        open={timelineOpen}
        onOpenChange={setTimelineOpen}
        request={selectedRequest}
      />
    </Card>
  );
}
