import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, Eye, ScrollText, Search, ShieldAlert, Users } from "lucide-react";
import { toast } from "sonner";

import { ReportMenu } from "@/components/ui/report-menu";
import { SortHead, type SortState } from "@/components/portal/sortable";
import { TableRowsSkeleton } from "@/components/ui/loading-skeletons";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { auditLogApi, type ApiAuditLog } from "@/lib/api";
import { usePreferences } from "@/lib/preferences";
import type { ReportData } from "@/lib/report-export";
import { cn } from "@/lib/utils";

type AuditSortKey = "occurred_at" | "action" | "module_name" | "severity";

type AuditMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

type AuditStats = {
  total: number;
  by_severity: Record<string, number>;
  by_module: Record<string, number>;
  modules: string[];
  unique_actors: number;
  latest: ApiAuditLog | null;
};

const EMPTY_META: AuditMeta = { current_page: 1, last_page: 1, per_page: 10, total: 0 };
const REPORT_ROW_LIMIT = 1000;

const display = (value?: string | null) => (value?.trim() ? value : "—");

const actionTypeFor = (action: string): "Create" | "Update" | "Delete" | "Security" => {
  const actLower = action.toLowerCase();
  if (
    actLower.includes("create") ||
    actLower.includes("add") ||
    actLower.includes("generate") ||
    actLower.includes("regularized")
  ) {
    return "Create";
  }
  if (
    actLower.includes("delete") ||
    actLower.includes("revoke") ||
    actLower.includes("disable") ||
    actLower.includes("exit") ||
    actLower.includes("deactivated")
  ) {
    return "Delete";
  }
  if (
    actLower.includes("login") ||
    actLower.includes("password") ||
    actLower.includes("2fa") ||
    actLower.includes("permission") ||
    actLower.includes("policy") ||
    actLower.includes("security")
  ) {
    return "Security";
  }
  return "Update";
};

export function AuditLogs() {
  const [severity, setSeverity] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState<ApiAuditLog[]>([]);
  const [meta, setMeta] = useState<AuditMeta>(EMPTY_META);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [sort, setSort] = useState<SortState<AuditSortKey>>(null);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<ApiAuditLog | null>(null);

  // Date / time columns follow the user's saved portal preferences (format + time zone).
  const { formatDateTime } = usePreferences();
  const formatTimestamp = (iso?: string | null) => (iso ? formatDateTime(iso) : "—");

  const filterParams = useMemo(
    () => ({
      q: search.trim() || undefined,
      module: moduleFilter !== "all" ? moduleFilter : undefined,
      severity: severity !== "all" ? severity : undefined,
    }),
    [search, moduleFilter, severity],
  );

  useEffect(() => {
    auditLogApi
      .stats()
      .then((res) => setStats(res.data))
      .catch(() => toast.error("Unable to load audit statistics."))
      .finally(() => setStatsLoaded(true));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const timer = setTimeout(
      () => {
        auditLogApi
          .list({
            ...filterParams,
            page,
            per_page: pageSize,
            sort: sort?.key,
            direction: sort?.dir,
          })
          .then((res) => {
            if (cancelled) return;
            setEntries(res.data);
            setMeta(res.meta ?? EMPTY_META);
          })
          .catch(() => {
            if (!cancelled) toast.error("Unable to load audit logs.");
          })
          .finally(() => {
            if (!cancelled) setLoading(false);
          });
      },
      search ? 300 : 0,
    );

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [filterParams, page, pageSize, sort, search]);

  const moduleOptions = stats?.modules?.length
    ? stats.modules
    : Array.from(new Set(entries.map((a) => a.module))).sort((a, b) => a.localeCompare(b));

  const toggleSort = (key: AuditSortKey) => {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      return null;
    });
    setPage(1);
  };

  const totalEvents = stats?.total ?? meta.total;
  const criticalCount = stats?.by_severity?.["Critical"] ?? 0;
  const warningCount = stats?.by_severity?.["Warning"] ?? 0;
  const uniqueActors =
    stats?.unique_actors ?? new Set(entries.map((a) => a.user).filter(Boolean)).size;

  const buildAuditReport = async (): Promise<ReportData> => {
    const all: ApiAuditLog[] = [];
    let current = 1;

    while (all.length < REPORT_ROW_LIMIT) {
      const res = await auditLogApi.list({
        ...filterParams,
        page: current,
        per_page: 100,
        sort: sort?.key,
        direction: sort?.dir,
      });
      all.push(...res.data);
      if (current >= res.meta.last_page || res.data.length === 0) break;
      current += 1;
    }

    const reportRows = all.slice(0, REPORT_ROW_LIMIT);
    const capped = meta.total > reportRows.length;

    return {
      title: "Audit Logs Report",
      subtitle:
        `Oxford Suites Makati HRMS · ${new Date().toLocaleDateString()} · ` +
        `Severity: ${severity} | Module: ${moduleFilter}` +
        (capped ? ` · First ${REPORT_ROW_LIMIT} matching rows` : ""),
      columns: [
        { header: "Timestamp", key: "timestamp" },
        { header: "User", key: "user" },
        { header: "Role", key: "role" },
        { header: "Department", key: "department" },
        { header: "Action", key: "action" },
        { header: "Module", key: "module" },
        { header: "Target", key: "target" },
        { header: "Details", key: "details" },
        { header: "Device", key: "device" },
        { header: "IP Address", key: "ip_address" },
        { header: "URL", key: "url" },
        { header: "Severity", key: "severity" },
      ],
      rows: reportRows.map((a) => ({
        timestamp: formatTimestamp(a.occurred_at || a.timestamp),
        user: display(a.user),
        role: display(a.role),
        department: display(a.department),
        action: a.action,
        module: a.module,
        target: a.target_type ? `${a.target_type}${a.target_id ? ` #${a.target_id}` : ""}` : "—",
        details: display(a.details),
        device: display(a.device),
        ip_address: display(a.ip_address),
        url: display(a.url),
        severity: a.severity,
      })),
      summary: [
        { label: "Total Events", value: totalEvents },
        { label: "Critical", value: criticalCount },
        { label: "Warnings", value: warningCount },
        { label: "Unique Actors", value: uniqueActors },
        { label: "Rows in Report", value: reportRows.length },
      ],
    };
  };

  const from = meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1;
  const to = Math.min(meta.current_page * meta.per_page, meta.total);

  return (
    <div>
      <div className="-mx-1 mb-4 space-y-3 px-1 pb-1 pt-1">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center text-primary">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-11 w-11 fill-current">
                <path fillRule="evenodd" clipRule="evenodd" d="M6.25 2.25A3.75 3.75 0 0 0 2.5 6v1.25c0 .69.56 1.25 1.25 1.25H6v10A3.5 3.5 0 0 0 9.5 22h9A3.5 3.5 0 0 0 22 18.5v-1.25a.75.75 0 0 0-.75-.75H19V6a3.75 3.75 0 0 0-3.75-3.75h-9ZM6 4A2.25 2.25 0 0 0 4 6.24V7h2V4Zm3.25 2.75a.75.75 0 0 1 .75-.75h5.25a.75.75 0 0 1 0 1.5H10a.75.75 0 0 1-.75-.75Zm.75 2.75a.75.75 0 0 0 0 1.5h5.25a.75.75 0 0 0 0-1.5H10Zm-.75 4.25a.75.75 0 0 1 .75-.75h3.25a.75.75 0 0 1 0 1.5H10a.75.75 0 0 1-.75-.75ZM10.25 17a1 1 0 0 0-1 1v1.25c0 .55-.45 1-1 1h-.5v.95A2.75 2.75 0 0 0 10.5 18.5V18h10.25v-1H10.25Z" />
              </svg>
            </span>
            <div>
              <h1 className="font-display text-[1.8rem] font-bold leading-tight tracking-tight sm:text-[2rem]">
                Audit Logs
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Full system activity trail across all HRMS modules and users.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start">
            <ReportMenu
              size="sm"
              report={buildAuditReport}
              recordCount={meta.total}
              label="Generate Report"
            />
          </div>
        </div>

        {!statsLoaded ? (
          <div
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
            aria-busy="true"
            aria-label="Loading metrics"
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={`skeleton-metric-${i}`}
                className="flex items-center gap-4 rounded-xl border border-border/60 bg-card px-4 py-3.5"
              >
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Total Events",
                value: totalEvents,
                icon: Activity,
                onClick: () => {
                  setSeverity("all");
                  setPage(1);
                },
              },
              {
                label: "Critical",
                value: criticalCount,
                icon: ShieldAlert,
                onClick: () => {
                  setSeverity("Critical");
                  setPage(1);
                },
              },
              {
                label: "Warnings",
                value: warningCount,
                icon: AlertTriangle,
                onClick: () => {
                  setSeverity("Warning");
                  setPage(1);
                },
              },
              {
                label: "Unique Actors",
                value: uniqueActors,
                icon: Users,
                onClick: () => {
                  setSeverity("Info");
                  setPage(1);
                },
              },
            ].map((m) => (
              <button
                key={m.label}
                type="button"
                onClick={m.onClick}
                className="group flex w-full cursor-pointer items-center gap-4 rounded-xl border border-border/60 bg-card px-4 py-3.5 text-left shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <m.icon className="h-6 w-6" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-medium text-muted-foreground">
                    {m.label}
                  </span>
                  <span className="mt-1 block font-display text-[1.45rem] font-bold leading-none tabular-nums text-foreground">
                    {m.value.toLocaleString()}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <Card className="rounded-xl border-border/60 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-display text-base font-bold">
              <ScrollText className="h-4.5 w-4.5 text-primary" />
              System Activity
            </h2>
            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
              <div className="relative min-w-[12rem] flex-1 sm:w-64">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="w-full pl-8"
                  placeholder="Search user, action, module, IP…"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <Select
                value={moduleFilter}
                onValueChange={(value) => {
                  setModuleFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[calc(50%-0.25rem)] sm:w-44">
                  <SelectValue placeholder="Module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All modules</SelectItem>
                  {moduleOptions.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={severity}
                onValueChange={(value) => {
                  setSeverity(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[calc(50%-0.25rem)] sm:w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All severities</SelectItem>
                  {["Info", "Warning", "Critical"].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(search || moduleFilter !== "all" || severity !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 px-2 text-xs text-muted-foreground"
                  onClick={() => {
                    setSearch("");
                    setModuleFilter("all");
                    setSeverity("all");
                    setPage(1);
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          </div>

          <div className="mt-3 overflow-x-auto">
            <Table className="text-xs">
              <TableHeader>
                <TableRow>
                  <SortHead sortKey="occurred_at" sort={sort} onSort={toggleSort}>
                    Timestamp
                  </SortHead>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Action Type</TableHead>
                  <SortHead sortKey="action" sort={sort} onSort={toggleSort}>
                    Action Details
                  </SortHead>
                  <SortHead sortKey="module_name" sort={sort} onSort={toggleSort}>
                    Module
                  </SortHead>
                  <TableHead>Device &amp; IP</TableHead>
                  <TableHead>URL</TableHead>
                  <SortHead sortKey="severity" sort={sort} onSort={toggleSort}>
                    Severity
                  </SortHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((a) => {
                  const actionType = actionTypeFor(a.action);

                  const actionTypeTone =
                    actionType === "Create"
                      ? "border-success/40 bg-success/10 text-success"
                      : actionType === "Delete"
                        ? "border-destructive/40 bg-destructive/10 text-destructive"
                        : actionType === "Security"
                          ? "border-warning/40 bg-warning/20 text-warning-foreground"
                          : "border-primary/40 bg-primary/10 text-primary";

                  return (
                    <TableRow key={a.audit_log_id}>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatTimestamp(a.occurred_at || a.timestamp)}
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="font-semibold text-foreground">{display(a.user)}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] font-medium">
                          {display(a.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] font-semibold", actionTypeTone)}
                        >
                          {actionType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-medium max-w-sm">{a.action}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{a.module}</TableCell>
                      <TableCell className="text-xs">
                        <div>{display(a.device)}</div>
                        <div className="font-mono text-[11px] text-muted-foreground">
                          {display(a.ip_address)}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[18rem]">
                        {a.url ? (
                          <div
                            className="block max-w-[18rem] truncate font-mono text-[11px] text-muted-foreground"
                            title={a.url}
                          >
                            {a.url}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            a.severity === "Critical"
                              ? "border-destructive/30 bg-destructive/15 text-destructive text-[10px]"
                              : a.severity === "Warning"
                                ? "border-warning/40 bg-warning/20 text-warning-foreground text-[10px]"
                                : "border-border text-muted-foreground text-[10px]"
                          }
                        >
                          {a.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="icon"
                          variant="ghost"
                          title={`View details for ${a.action}`}
                          aria-label={`View details for ${a.action}`}
                          onClick={() => setDetail(a)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {loading && <TableRowsSkeleton cols={10} rows={6} />}
                {!loading && entries.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      No activity matches your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <TablePagination
            page={meta.current_page}
            pageCount={Math.max(1, meta.last_page)}
            from={from}
            to={to}
            total={meta.total}
            label="entries"
            showRangeLabel={false}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>

      <Dialog open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Audit Log Details</DialogTitle>
            <DialogDescription>
              {detail ? formatTimestamp(detail.occurred_at || detail.timestamp) : ""}
            </DialogDescription>
          </DialogHeader>
          {detail && (
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">User</p>
                <p>{display(detail.user)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Role</p>
                <p>{display(detail.role)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Department</p>
                <p>{display(detail.department)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Module</p>
                <p>{detail.module}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Action</p>
                <p>{detail.action}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Target</p>
                <p>
                  {detail.target_type
                    ? `${detail.target_type}${detail.target_id ? ` #${detail.target_id}` : ""}`
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Severity</p>
                <p>{detail.severity}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Details</p>
                <p className="whitespace-pre-wrap break-words">{display(detail.details)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Device</p>
                <p>{display(detail.device)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">IP Address</p>
                <p className="font-mono text-xs">{display(detail.ip_address)}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase text-muted-foreground">URL</p>
                <p className="break-all font-mono text-xs">{display(detail.url)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
