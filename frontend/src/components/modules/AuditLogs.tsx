import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ScrollText,
  Search,
  ShieldAlert,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/portal/PageHeader";
import { ReportMenu } from "@/components/ui/report-menu";
import { SortHead, useSort } from "@/components/portal/sortable";
import { StatCard } from "@/components/portal/StatCard";
import { TableRowsSkeleton } from "@/components/ui/loading-skeletons";
import { Badge } from "@/components/ui/badge";
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
import { ListBody } from "@/components/portal/ListBody";
import { usePagination } from "@/hooks/usePagination";
import { auditLogApi, type ApiAuditLog } from "@/lib/api";
import { cn } from "@/lib/utils";

const formatTimestamp = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export function AuditLogs() {
  const [severity, setSeverity] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState<ApiAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    auditLogApi
      .list({ per_page: 500 })
      .then((res) => {
        if (!cancelled) setEntries(res.data);
      })
      .catch(() => {
        if (!cancelled) toast.error("Unable to load audit logs.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const moduleOptions = Array.from(new Set(entries.map((a) => a.module)));
  const filteredRows = entries.filter((a) => {
    const matchesSeverity = severity === "all" || a.severity === severity;
    const matchesModule = moduleFilter === "all" || a.module === moduleFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      a.user.toLowerCase().includes(q) ||
      a.action.toLowerCase().includes(q) ||
      a.module.toLowerCase().includes(q) ||
      a.department.toLowerCase().includes(q) ||
      a.ip_address.toLowerCase().includes(q) ||
      (a.url ?? "").toLowerCase().includes(q);
    return matchesSeverity && matchesModule && matchesSearch;
  });
  const {
    sort,
    toggle,
    sorted: rows,
  } = useSort(filteredRows, {
    timestamp: (a) => a.timestamp,
    user: (a) => a.user,
    role: (a) => a.role,
    action: (a) => a.action,
    module: (a) => a.module,
    department: (a) => a.department,
    device: (a) => a.device,
    ipAddress: (a) => a.ip_address,
    url: (a) => a.url ?? "",
    severity: (a) => a.severity,
  });

  const auditPage = usePagination(rows, 5);

  const totalEvents = entries.length;
  const criticalCount = entries.filter((a) => a.severity === "Critical").length;
  const warningCount = entries.filter((a) => a.severity === "Warning").length;
  const uniqueActors = new Set(entries.map((a) => a.user)).size;

  const buildAuditReport = () => ({
    title: "Audit Logs Report",
    subtitle: `Oxford Suites Makati HRMS · ${new Date().toLocaleDateString()} · Severity: ${severity} | Module: ${moduleFilter}`,
    columns: [
      { header: "Timestamp", key: "timestamp" },
      { header: "User", key: "user" },
      { header: "Role", key: "role" },
      { header: "Department", key: "department" },
      { header: "Action", key: "action" },
      { header: "Module", key: "module" },
      { header: "Device", key: "device" },
      { header: "IP Address", key: "ip_address" },
      { header: "URL", key: "url" },
      { header: "Severity", key: "severity" },
    ],
    rows: rows.map((a) => ({
      timestamp: formatTimestamp(a.timestamp),
      user: a.user,
      role: a.role,
      department: a.department,
      action: a.action,
      module: a.module,
      device: a.device,
      ip_address: a.ip_address,
      url: a.url ?? "—",
      severity: a.severity,
    })),
    summary: [
      { label: "Total Events", value: totalEvents },
      { label: "Critical", value: criticalCount },
      { label: "Warnings", value: warningCount },
      { label: "Unique Actors", value: uniqueActors },
      { label: "Rows in Report", value: rows.length },
    ],
  });

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        description="Full system activity trail across all HRMS modules and users."
        actions={
          <ReportMenu size="sm" report={() => buildAuditReport()} recordCount={rows.length} />
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Events"
          value={totalEvents}
          tone="primary"
          icon={Activity}
          onClick={() => setSeverity("all")}
        />
        <StatCard
          label="Critical"
          value={criticalCount}
          tone="caution"
          icon={ShieldAlert}
          onClick={() => setSeverity("Critical")}
        />
        <StatCard
          label="Warnings"
          value={warningCount}
          tone="gold"
          icon={AlertTriangle}
          onClick={() => setSeverity("Warning")}
        />
        <StatCard
          label="Unique Actors"
          value={uniqueActors}
          tone="success"
          icon={Users}
          onClick={() => setSeverity("Info")}
        />
      </div>

      <Card className="mt-4 border-border/70">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
              <ScrollText className="h-5 w-5 text-primary" /> System Activity
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[14rem] flex-1">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder="Search user, action, module, IP…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={moduleFilter} onValueChange={setModuleFilter}>
                <SelectTrigger className="w-48">
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
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger className="w-44">
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
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortHead sortKey="timestamp" sort={sort} onSort={toggle}>
                    Timestamp
                  </SortHead>
                  <SortHead sortKey="user" sort={sort} onSort={toggle}>
                    User
                  </SortHead>
                  <SortHead sortKey="role" sort={sort} onSort={toggle}>
                    Role
                  </SortHead>
                  <TableHead>Action Type</TableHead>
                  <SortHead sortKey="action" sort={sort} onSort={toggle}>
                    Action Details
                  </SortHead>
                  <SortHead sortKey="module" sort={sort} onSort={toggle}>
                    Module
                  </SortHead>
                  <SortHead sortKey="device" sort={sort} onSort={toggle}>
                    Device &amp; IP
                  </SortHead>
                  <SortHead sortKey="url" sort={sort} onSort={toggle}>
                    URL
                  </SortHead>
                  <SortHead sortKey="severity" sort={sort} onSort={toggle}>
                    Severity
                  </SortHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditPage.pageItems.map((a) => {
                  const actLower = a.action.toLowerCase();
                  const actionType: "Create" | "Update" | "Delete" | "Security" =
                    actLower.includes("create") ||
                    actLower.includes("add") ||
                    actLower.includes("generate") ||
                    actLower.includes("regularized")
                      ? "Create"
                      : actLower.includes("delete") ||
                          actLower.includes("revoke") ||
                          actLower.includes("disable") ||
                          actLower.includes("exit") ||
                          actLower.includes("deactivated")
                        ? "Delete"
                        : actLower.includes("login") ||
                            actLower.includes("password") ||
                            actLower.includes("2fa") ||
                            actLower.includes("permission") ||
                            actLower.includes("policy") ||
                            actLower.includes("security")
                          ? "Security"
                          : "Update";

                  const actionTypeTone =
                    actionType === "Create"
                      ? "border-success/40 bg-success/10 text-success"
                      : actionType === "Delete"
                        ? "border-destructive/40 bg-destructive/10 text-destructive"
                        : actionType === "Security"
                          ? "border-amber-500/40 bg-amber-500/10 text-amber-600"
                          : "border-primary/40 bg-primary/10 text-primary";

                  return (
                    <TableRow key={a.audit_log_id}>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatTimestamp(a.timestamp)}
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="font-semibold text-foreground">{a.user}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] font-medium">
                          {a.role}
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
                        <div>{a.device}</div>
                        <div className="font-mono text-[11px] text-muted-foreground">
                          {a.ip_address}
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
                    </TableRow>
                  );
                })}
                {loading && <TableRowsSkeleton cols={9} rows={6} />}
                {!loading && rows.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={9}
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
            page={auditPage.page}
            pageCount={auditPage.pageCount}
            from={auditPage.from}
            to={auditPage.to}
            total={auditPage.total}
            label="entries"
            showRangeLabel={false}
            onPageChange={auditPage.setPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
