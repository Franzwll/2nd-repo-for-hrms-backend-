import { useState, useMemo, useEffect } from "react";
import {
  Clock,
  Send,
  Search,
  Plus,
  ArrowUpDown,
  Filter,
  Calendar,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TablePagination } from "@/components/ui/table-pagination";
import { usePagination } from "@/hooks/usePagination";
import { TableRowsSkeleton } from "@/components/ui/loading-skeletons";
import { EssStatusBadge } from "@/components/modules/ess/shared/EssStatusBadge";
import { RequestTimelineModal, type RequestItem } from "@/components/modules/ess/modals/RequestTimelineModal";
import { essApi, type ApiEssRequestItem } from "@/lib/api";
import { REQUEST_CATEGORY_SUBTYPES } from "@/data/essRequestCatalogue";
import { toast } from "sonner";

// Dynamic Request Subtypes Mapping (shared categorized template)
const CATEGORY_SUBTYPES = REQUEST_CATEGORY_SUBTYPES;

/** "2026-10-22" -> "Oct 22, 2026" (falls back to the raw value). */
function formatRequestDate(value: string) {
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(value ?? "");
  if (!iso) return value || "—";
  return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** 20000 -> "₱20,000"; 3333.33 -> "₱3,333.33". */
function formatMoney(value: number | null | undefined) {
  if (value == null) return "—";
  return `₱${value.toLocaleString("en-PH", { maximumFractionDigits: 2 })}`;
}

/** "₱20,000 · 6 months · ₱3,333.33/mo" */
function loanSummary(meta: any): string | null {
  const loan = meta?.loan;
  if (!loan || loan.amount == null) return null;
  const parts = [formatMoney(loan.amount)];
  if (loan.term_months) parts.push(`${loan.term_months} months`);
  if (loan.monthly_amortization) parts.push(`${formatMoney(loan.monthly_amortization)}/mo`);
  return parts.join(" · ");
}

/**
 * The form groups some request types under labels that do not exist in
 * `ess_categories`. Without this map the backend stores category_id = null and
 * HR cannot filter/report those requests by category.
 */
const STORED_CATEGORY: Record<string, { name: string; code: string }> = {
  Loan: { name: "Benefits & Loans", code: "benefits" },
  "Payroll Update": { name: "Payroll", code: "payroll" },
};

export function EssAllRequestsTab() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);

  // Tracker Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Form State
  const [category, setCategory] = useState("Leave");
  const [requestType, setRequestType] = useState("Vacation");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [details, setDetails] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [loanTerm, setLoanTerm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Timeline Modal State
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [timelineOpen, setTimelineOpen] = useState(false);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await essApi.myRequests();
      if (res) {
        const liveItems = (res.requests ?? []).map((r: ApiEssRequestItem) => ({
          id: r.id,
          type: r.type,
          category: r.category || "General",
          date: r.filed ? r.filed.slice(0, 10) : r.date_from || "",
          isoDate: r.filed || r.date_from || "",
          assignedOfficer: r.assignedTo || r.assigned_to || "",
          status: r.status,
          statusRank:
            r.status === "Pending"
              ? 0
              : r.status === "Under Review"
              ? 1
              : ["For Dispatch", "With Module", "For Release", "Approved", "For Fulfillment"].includes(
                    r.status,
                  )
              ? 2
              : r.status === "Completed"
              ? 3
              : 4,
          details: r.details,
          detailsMeta: r.details_meta ?? null,
          ...(r.db_id != null ? { dbId: r.db_id } : {}),
          ...(r.review_note ?? r.note
            ? { note: r.review_note ?? r.note }
            : {}),
          ...(r.attachments ? { attachments: r.attachments } : {}),
          ...(r.has_fulfillment != null ? { has_fulfillment: r.has_fulfillment } : {}),
          ...(r.module ? { module: r.module } : {}),
          ...(r.module_label ? { moduleLabel: r.module_label } : {}),
          ...(r.module_note ? { moduleNote: r.module_note } : {}),
          ...(r.timeline ? { timeline: r.timeline } : {}),
        }));
        setRequests(liveItems);
      }
    } catch {
      // fallback gracefully to initial list
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // Update specific request type when category changes
  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    const subtypes = CATEGORY_SUBTYPES[newCat] || ["General Request"];
    setRequestType(subtypes[0] || "General Request");
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchesSearch =
        !searchQuery ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.assignedOfficer?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || r.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [requests, searchQuery, statusFilter]);

  const pagination = usePagination(filteredRequests);

  // Flag a request when the same type was already filed within the last 7 days.
  const duplicateIds = useMemo(() => {
    const ids = new Set<string>();
    for (const current of requests) {
      const currentDate = Date.parse(current.isoDate);
      if (Number.isNaN(currentDate)) continue;
      const hasEarlier = requests.some((other) => {
        if (other === current || other.type !== current.type) return false;
        const otherDate = Date.parse(other.isoDate);
        if (Number.isNaN(otherDate)) return false;
        const diff = currentDate - otherDate;
        return diff > 0 && diff <= 7 * 86400000;
      });
      if (hasEarlier) ids.add(current.id);
    }
    return ids;
  }, [requests]);

  const handleWithdraw = async (req: any) => {
    if (!window.confirm(`Withdraw ${req.type} (${req.id})? This cannot be undone.`)) return;
    try {
      await essApi.cancelRequest(req.dbId ?? req.id);
      toast.success(`Request ${req.id} withdrawn.`);
      await loadRequests();
    } catch (err: any) {
      toast.error(err?.message || "Failed to withdraw request.");
    }
  };

  const handleRowClick = (req: any) => {
    setSelectedRequest({
      id: req.id,
      ...(req.dbId != null ? { dbId: req.dbId } : {}),
      type: req.type,
      category: req.category,
      date: req.date,
      status: req.status,
      assignedTo: req.assignedOfficer,
      details: req.details,
      ...(req.note ? { note: req.note } : {}),
      ...(req.attachments ? { attachments: req.attachments } : {}),
      ...(req.timeline ? { timeline: req.timeline } : {}),
    });
    setTimelineOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) {
      toast.error("Please provide detailed description / request justification.");
      return;
    }

    const amount = Number(loanAmount);
    const term = Number(loanTerm);
    const hasLoanFigures = Number.isFinite(amount) && amount > 0;
    const termMonths = Number.isFinite(term) && term > 0 ? Math.round(term) : null;

    try {
      setSubmitting(true);
      const storedCategory = STORED_CATEGORY[category];
      const storedName = storedCategory?.name ?? category;
      const storedCode =
        storedCategory?.code ?? category.toLowerCase().replace(/[^a-z0-9]+/g, "_");
      const res = await essApi.createRequest({
        category_code: storedCode,
        category_name: storedName,
        request_type: requestType,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        details: details,
        ...(hasLoanFigures
          ? {
              loan_amount: amount,
              ...(termMonths ? { loan_term_months: termMonths } : {}),
            }
          : {}),
      });

      const todayStr = new Date().toISOString().slice(0, 10);
      const newReq = {
        id: res?.request?.request_code || `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
        type: requestType,
        category: storedName,
        date: todayStr,
        isoDate: todayStr,
        assignedOfficer:
          res?.request?.assigned_to?.full_name ||
          res?.request?.assignedTo ||
          "Unassigned",
        status: "Pending",
        statusRank: 0,
        details: details,
        detailsMeta: res?.request?.details_meta ?? (hasLoanFigures
          ? {
              loan: {
                amount,
                term_months: termMonths,
                monthly_amortization: termMonths ? Math.round((amount / termMonths) * 100) / 100 : null,
              },
            }
          : null),
      };

      setRequests([newReq, ...requests]);
      toast.success(`${requestType} request submitted to HR Services.`);

      // Reset Form
      setDateFrom("");
      setDateTo("");
      setDetails("");
      setLoanAmount("");
      setLoanTerm("");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit request to HR.");
    } finally {
      setSubmitting(false);
    }
  };

  const availableSubtypes = CATEGORY_SUBTYPES[category] || ["General Request"];
  const isLoanRequest = category === "Loan" || /loan|cash advance/i.test(requestType);
  const estimatedMonthly =
    Number(loanAmount) > 0 && Number(loanTerm) > 0
      ? Number(loanAmount) / Number(loanTerm)
      : null;

  return (
    <div className="space-y-6">
      {/* SECTION 1: ALL FILED REQUESTS TRACKER */}
      <Card className="border-border/70 shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 gap-3">
          <div>
            <CardTitle className="font-display text-xl font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              All Filed Requests Tracker
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Click any record to inspect live multi-stage review audit trail.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search request ID or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 w-[180px] sm:w-[220px] text-xs"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-[140px] text-xs">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Under Review">Under Review</SelectItem>
                <SelectItem value="For Dispatch">For Dispatch</SelectItem>
                <SelectItem value="With Module">With Module</SelectItem>
                <SelectItem value="For Release">For Release</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow>
                <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider">
                  Request
                </TableHead>
                <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider">
                  Filed
                </TableHead>
                <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider">
                  Details
                </TableHead>
                <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider">
                  Currently with
                </TableHead>
                <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRowsSkeleton cols={6} rows={5} />
              ) : pagination.pageItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground text-xs">
                    No matching requests found.
                  </TableCell>
                </TableRow>
              ) : (
                pagination.pageItems.map((r, idx) => {
                  const isDuplicate = duplicateIds.has(r.id);
                  const canWithdraw = r.status === "Pending";

                  return (
                    <TableRow
                      key={idx}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleRowClick(r)}
                    >
                      <TableCell className="whitespace-nowrap px-4 py-3">
                        <p className="text-sm font-semibold text-foreground">{r.type}</p>
                        <p className="font-mono text-[11px] text-muted-foreground">{r.id}</p>
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                        {formatRequestDate(r.date)}
                      </TableCell>
                      <TableCell className="max-w-[320px] px-4 py-3">
                        {(() => {
                          const summary = loanSummary(r.detailsMeta);
                          if (summary) {
                            return (
                              <>
                                <p className="text-xs font-semibold text-foreground">{summary}</p>
                                <p
                                  className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground"
                                  title={r.details}
                                >
                                  {r.details}
                                </p>
                              </>
                            );
                          }
                          return (
                            <p className="line-clamp-2 text-xs text-muted-foreground" title={r.details}>
                              {r.details || "—"}
                            </p>
                          );
                        })()}
                        {isDuplicate && (
                          <p className="mt-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                            Possible duplicate
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-4 py-3 text-sm font-medium text-foreground">
                        {r.assignedOfficer || "HR Services"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-4 py-3">
                        <EssStatusBadge status={r.status} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-4 py-3 text-right">
                        {canWithdraw ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 cursor-pointer px-2 text-xs font-medium text-rose-600 hover:bg-rose-500/10 hover:text-rose-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              void handleWithdraw(r);
                            }}
                          >
                            Withdraw
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 cursor-pointer px-2 text-xs font-medium text-primary hover:bg-primary/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(r);
                            }}
                          >
                            View →
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          <TablePagination
            page={pagination.page}
            pageCount={pagination.pageCount}
            from={pagination.from}
            to={pagination.to}
            total={pagination.total}
            label="requests"
            onPageChange={pagination.setPage}
          />
        </CardContent>
      </Card>

      {/* SECTION 2: SUBMIT GENERAL SELF-SERVICE REQUEST FORM */}
      <Card className="border-border/70 shadow-xs">
        <CardHeader className="pb-3 border-b border-border/60">
          <CardTitle className="font-display text-xl font-semibold flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Submit General Self-Service Request
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            File miscellaneous inquiries, personal data updates, loans, or reimbursements.
          </p>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleFormSubmit} className="space-y-5">
            {/* Request Category & Specific Request Type (2 Columns) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Request Category</Label>
                <Select value={category} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Leave">Leave</SelectItem>
                    <SelectItem value="Attendance">Attendance</SelectItem>
                    <SelectItem value="Payroll">Payroll</SelectItem>
                    <SelectItem value="Payroll Update">Payroll Update</SelectItem>
                    <SelectItem value="Loan">Loan</SelectItem>
                    <SelectItem value="Reimbursement">Reimbursement</SelectItem>
                    <SelectItem value="HR Document">HR Document</SelectItem>
                    <SelectItem value="Personal Info">Personal Info</SelectItem>
                    <SelectItem value="Account">Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Specific Request Type</Label>
                <Select value={requestType} onValueChange={setRequestType}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubtypes.map((sub) => (
                      <SelectItem key={sub} value={sub}>
                        {sub}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Effective Dates (From & To) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Effective Date (From)</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Effective Date (To)</Label>
                <Input
                  type="date"
                  value={dateTo}
                  min={dateFrom}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>

            {/* Loan figures — stored in details_meta and rendered as a summary */}
            {isLoanRequest && (
              <div className="rounded-lg border border-border/70 bg-muted/20 p-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Loan Amount (₱)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="20,000"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Term (months)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="120"
                      step="1"
                      placeholder="6"
                      value={loanTerm}
                      onChange={(e) => setLoanTerm(e.target.value)}
                    />
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {estimatedMonthly
                    ? `Estimated amortization: ${formatMoney(
                        Math.round(estimatedMonthly * 100) / 100,
                      )}/mo`
                    : "Add an amount and term to preview the monthly amortization."}
                </p>
              </div>
            )}

            {/* Details / Request Justification */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Details / Request Justification</Label>
              <Textarea
                rows={4}
                placeholder="Provide detailed description for HR review..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                required
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={submitting}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-6 shadow-xs"
              >
                <Send className="h-4 w-4" />
                {submitting ? "Submitting..." : "Submit Request to HR"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Audit Timeline Modal */}
      <RequestTimelineModal
        open={timelineOpen}
        onOpenChange={setTimelineOpen}
        request={selectedRequest}
        onUpdated={loadRequests}
      />
    </div>
  );
}
