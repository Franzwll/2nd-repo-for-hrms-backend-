import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock, Inbox, Paperclip, RefreshCw, Send, Undo2, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Textarea } from "@/components/ui/textarea";
import { essApi, type ApiEssRequestItem } from "@/lib/api";

const MODULES = [
  { key: "attendance", label: "Attendance" },
  { key: "payroll", label: "Payroll" },
  { key: "performance", label: "Performance" },
] as const;

type ModuleKey = (typeof MODULES)[number]["key"];

type QueueCounts = {
  total: number;
  for_dispatch: number;
  with_module: number;
  for_release: number;
};

const EMPTY_COUNTS: QueueCounts = {
  total: 0,
  for_dispatch: 0,
  with_module: 0,
  for_release: 0,
};

function statusClass(status: string): string {
  if (status === "For Dispatch") return "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-400";
  if (status === "With Module") return "border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:text-indigo-400";
  if (status === "For Release") return "border-teal-500/30 bg-teal-500/10 text-teal-700 dark:border-teal-400/20 dark:bg-teal-400/10 dark:text-teal-400";
  if (status === "Completed") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-400";
  return "border-border bg-muted text-muted-foreground";
}

function isLeaveRequest(row: ApiEssRequestItem): boolean {
  const type = String(row.type ?? "").toLowerCase();
  const category = String(row.category ?? "").toLowerCase();
  const code = String((row as any).category_code ?? "").toLowerCase();
  return type.includes("leave") || category.includes("leave") || code === "leave";
}

/**
 * Module Queues is the interim UI for Attendance / Payroll / Performance.
 *
 * ERM keeps its dedicated inbox, but every other module can work the same
 * gated pipeline here until its own module UI ships. The backend enforces the
 * queue scope (routed_module) and the release gate; this panel only exposes
 * the actions the module is allowed to take.
 */
export function ModuleQueuesPanel({ onChanged }: { onChanged?: () => void }) {
  const [module, setModule] = useState<ModuleKey>("attendance");
  const [rows, setRows] = useState<ApiEssRequestItem[]>([]);
  const [counts, setCounts] = useState<QueueCounts>(EMPTY_COUNTS);
  const [moduleLabel, setModuleLabel] = useState("Attendance");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("actionable");

  const [declineRow, setDeclineRow] = useState<ApiEssRequestItem | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [declining, setDeclining] = useState(false);

  const [completeRow, setCompleteRow] = useState<ApiEssRequestItem | null>(null);
  const [decision, setDecision] = useState<"approved" | "rejected">("approved");
  const [leaveType, setLeaveType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [resultNote, setResultNote] = useState("");
  const [resultFile, setResultFile] = useState<File | null>(null);
  const [completing, setCompleting] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = async (target: ModuleKey = module) => {
    try {
      setLoading(true);
      const res = await essApi.moduleRequests(target);
      setRows(res.requests ?? []);
      setCounts(res.counts ?? EMPTY_COUNTS);
      setModuleLabel(res.module_label || target);
    } catch (err: any) {
      toast.error(err?.message || "Could not load the module queue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(module);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [module]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (statusFilter === "actionable") {
        if (!["For Dispatch", "With Module"].includes(row.status)) return false;
      } else if (statusFilter !== "all" && row.status !== statusFilter) {
        return false;
      }
      if (!q) return true;
      return `${row.id} ${row.employee} ${row.type} ${row.details ?? ""}`.toLowerCase().includes(q);
    });
  }, [rows, search, statusFilter]);

  const accept = async (row: ApiEssRequestItem) => {
    setActingId(row.id);
    try {
      await essApi.acceptModuleRequest(module, row.id);
      toast.success(`${row.id} accepted. It is now with ${moduleLabel}.`);
      await load();
      onChanged?.();
    } catch (err: any) {
      toast.error(err?.message || "Could not accept the request.");
    } finally {
      setActingId(null);
    }
  };

  const openDecline = (row: ApiEssRequestItem) => {
    setDeclineRow(row);
    setDeclineReason("");
  };

  const submitDecline = async () => {
    if (!declineRow) return;
    if (!declineReason.trim()) {
      toast.error("A reason for declining is required.");
      return;
    }
    setDeclining(true);
    try {
      await essApi.declineModuleRequest(module, declineRow.id, declineReason.trim());
      toast.success(`${declineRow.id} returned to ESS Management.`);
      setDeclineRow(null);
      await load();
      onChanged?.();
    } catch (err: any) {
      toast.error(err?.message || "Could not decline the request.");
    } finally {
      setDeclining(false);
    }
  };

  const openComplete = (row: ApiEssRequestItem) => {
    setCompleteRow(row);
    setDecision("approved");
    setLeaveType("");
    setDateFrom(row.date_from ?? "");
    setDateTo(row.date_to ?? "");
    setResultNote(row.module_note ?? "");
    setResultFile(null);
  };

  const submitComplete = async () => {
    if (!completeRow) return;

    const looksLikeLeave = module === "attendance" && isLeaveRequest(completeRow);

    if (module === "attendance" && !looksLikeLeave && !resultNote.trim()) {
      toast.error("Add a note describing the attendance decision.");
      return;
    }

    if (module === "payroll" && !resultNote.trim() && !resultFile) {
      toast.error("Add a payroll note or attach the payslip file.");
      return;
    }

    if (module === "performance" && !resultNote.trim()) {
      toast.error("Add a note describing the performance decision.");
      return;
    }

    setCompleting(true);
    try {
      await essApi.completeModuleRequest(module, completeRow.id, {
        ...(looksLikeLeave || module === "performance" ? { decision } : {}),
        ...(looksLikeLeave && leaveType.trim() ? { leave_type: leaveType.trim() } : {}),
        ...(looksLikeLeave && dateFrom ? { date_from: dateFrom } : {}),
        ...(looksLikeLeave && dateTo ? { date_to: dateTo } : {}),
        ...(resultNote.trim() ? { note: resultNote.trim() } : {}),
        ...(resultFile ? { file: resultFile } : {}),
      });
      toast.success(`${completeRow.id} sent back to ESS Management for release.`);
      setCompleteRow(null);
      await load();
      onChanged?.();
    } catch (err: any) {
      toast.error(err?.message || "Could not send the result back.");
    } finally {
      setCompleting(false);
    }
  };

  const statistics = [
    { label: "Waiting for acknowledgement", value: counts.for_dispatch, icon: Inbox },
    { label: "With this module", value: counts.with_module, icon: Clock },
    { label: "Awaiting ESS release", value: counts.for_release, icon: Send },
  ];

  return (
    <div className="space-y-4">
      <Card className="border-border/70">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Module queue</Label>
              <Select value={module} onValueChange={(value) => setModule(value as ModuleKey)}>
                <SelectTrigger className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODULES.map((item) => (
                    <SelectItem key={item.key} value={item.key}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap items-end gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="actionable">Actionable</SelectItem>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="For Dispatch">For Dispatch</SelectItem>
                    <SelectItem value="With Module">With Module</SelectItem>
                    <SelectItem value="For Release">For Release</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Search</Label>
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Request, employee, type…"
                  className="h-9 w-56"
                />
              </div>

              <Button variant="outline" size="sm" onClick={() => load()} disabled={loading}>
                <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        {statistics.map((stat) => (
          <Card key={stat.label} className="border-border/70">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <stat.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {stat.label}
                </p>
                <p className="font-display text-xl font-semibold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/70">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{moduleLabel} queue</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Result</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                    Loading {moduleLabel} queue…
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                    No requests in this view.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div className="font-medium">{row.id}</div>
                      <div className="text-xs text-muted-foreground">{row.filed}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{row.employee}</div>
                      <div className="text-xs text-muted-foreground">{row.department}</div>
                    </TableCell>
                    <TableCell>
                      <div>{row.type}</div>
                      <div className="text-xs text-muted-foreground">{row.category}</div>
                      {(row.attachments ?? [])
                        .filter((attachment) => attachment.direction === "employee")
                        .map((attachment) => (
                          <a
                            key={attachment.id}
                            href={essApi.adminRequestAttachmentUrl(row.id, attachment.id)}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 flex max-w-[180px] items-center gap-1 truncate text-[11px] text-primary hover:underline"
                            title={attachment.original_name ?? undefined}
                          >
                            <Paperclip className="h-3 w-3 shrink-0" />
                            {attachment.original_name}
                          </a>
                        ))}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {row.date_from || row.date_to
                        ? `${row.date_from ?? "—"} → ${row.date_to ?? "—"}`
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusClass(row.status)}>
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[220px] text-xs text-muted-foreground">
                      {row.module_note || row.details || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1.5">
                        {row.status === "For Dispatch" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => accept(row)}
                              disabled={actingId === row.id}
                            >
                              <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openDecline(row)}
                            >
                              <Undo2 className="mr-1 h-3.5 w-3.5" />
                              Decline
                            </Button>
                          </>
                        )}

                        {row.status === "With Module" && (
                          <>
                            <Button size="sm" onClick={() => openComplete(row)}>
                              <Send className="mr-1 h-3.5 w-3.5" />
                              Send back
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openDecline(row)}
                            >
                              <Undo2 className="mr-1 h-3.5 w-3.5" />
                              Decline
                            </Button>
                          </>
                        )}

                        {row.status === "For Release" && (
                          <span className="text-xs text-muted-foreground">
                            Awaiting ESS Management release
                          </span>
                        )}

                        {row.status === "Completed" && (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Released
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!declineRow} onOpenChange={(open) => !open && setDeclineRow(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline {declineRow?.id}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            The request goes back to ESS Management as <strong>Under Review</strong> so it can be
            rerouted. The reason is shown to ESS Management and recorded in the routing ledger.
          </p>
          <div className="space-y-1.5">
            <Label>Reason</Label>
            <Textarea
              value={declineReason}
              onChange={(event) => setDeclineReason(event.target.value)}
              placeholder="e.g. This request belongs to Payroll, not Attendance."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeclineRow(null)} disabled={declining}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={submitDecline} disabled={declining}>
              <XCircle className="mr-1.5 h-4 w-4" />
              {declining ? "Returning…" : "Decline and return"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!completeRow} onOpenChange={(open) => !open && setCompleteRow(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Send result back — {completeRow?.id}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="rounded-lg border border-border/70 bg-muted/40 p-3 text-xs">
              <div className="font-medium">{completeRow?.employee}</div>
              <div className="text-muted-foreground">
                {completeRow?.type} · {completeRow?.category}
              </div>
            </div>

            {module === "attendance" && completeRow && isLeaveRequest(completeRow) && (
              <>
                <div className="space-y-1.5">
                  <Label>Decision</Label>
                  <Select
                    value={decision}
                    onValueChange={(value) => setDecision(value as "approved" | "rejected")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">Approved — deduct leave</SelectItem>
                      <SelectItem value="rejected">Rejected — no deduction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {decision === "approved" && (
                  <>
                    <div className="space-y-1.5">
                      <Label>Leave type</Label>
                      <Input
                        value={leaveType}
                        onChange={(event) => setLeaveType(event.target.value)}
                        placeholder="e.g. Vacation Leave"
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label>From</Label>
                        <Input
                          type="date"
                          value={dateFrom}
                          onChange={(event) => setDateFrom(event.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>To</Label>
                        <Input
                          type="date"
                          value={dateTo}
                          onChange={(event) => setDateTo(event.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {module === "performance" && (
              <div className="space-y-1.5">
                <Label>Decision</Label>
                <Select
                  value={decision}
                  onValueChange={(value) => setDecision(value as "approved" | "rejected")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Recommended / approved</SelectItem>
                    <SelectItem value="rejected">Not approved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Note for ESS Management</Label>
              <Textarea
                value={resultNote}
                onChange={(event) => setResultNote(event.target.value)}
                placeholder="Decision, reference, or instructions shown at release."
                rows={3}
              />
            </div>

            {module === "payroll" && (
              <div className="space-y-1.5">
                <Label>Payslip / result file (optional)</Label>
                <Input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  onChange={(event) => setResultFile(event.target.files?.[0] ?? null)}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCompleteRow(null)} disabled={completing}>
              Cancel
            </Button>
            <Button onClick={submitComplete} disabled={completing}>
              <Send className="mr-1.5 h-4 w-4" />
              {completing ? "Sending…" : "Send back to ESS Management"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
