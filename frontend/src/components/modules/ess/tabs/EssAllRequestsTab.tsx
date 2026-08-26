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
import { EssStatusBadge } from "@/components/modules/ess/shared/EssStatusBadge";
import { RequestTimelineModal, type RequestItem } from "@/components/modules/ess/modals/RequestTimelineModal";
import { essApi, type ApiEssRequestItem } from "@/lib/api";
import { toast } from "sonner";

// Dynamic Request Subtypes Mapping
const CATEGORY_SUBTYPES: Record<string, string[]> = {
  Leave: ["Vacation", "Sick", "Emergency", "Maternity", "Paternity", "Solo Parent", "Bereavement"],
  Attendance: ["Time In Correction", "Missed Time Out", "Overtime Claim", "Rest Day Duty", "Official Business (OB)"],
  Payroll: ["Payroll Clarification", "Overtime Discrepancy", "Night Differential Claim", "Tax Withholding Clarification"],
  "Payroll Update": ["Bank Account Update", "Tax Exemption Status Update", "Direct Deposit Update"],
  Loan: ["SSS Salary Loan", "Pag-IBIG Calamity Loan", "Company Emergency Loan", "Educational Assistance Loan"],
  Reimbursement: ["Transportation", "Medical Reimbursement", "Meal Allowance Claim", "Official Expense / Travel"],
  "HR Document": ["Certificate of Employment (with Salary)", "Certificate of Employment (without Salary)", "BIR Form 2316", "Certificate of Compensation & Benefits", "Service Record"],
  "Personal Info": ["Address Update", "Emergency Contact Update", "Civil Status Update", "Dependent Registration"],
  Account: ["Portal Password Reset", "Biometric ID Sync", "Email Address Update"],
};

export function EssAllRequestsTab() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([
    {
      id: "REQ-4410",
      type: "Sick Leave",
      category: "Leave",
      date: "2026-07-25",
      isoDate: "2026-07-25",
      assignedOfficer: "Juan Dela Cruz",
      status: "Pending",
      statusRank: 0,
      details: "Medical rest due to seasonal flu",
    },
    {
      id: "REQ-4406",
      type: "Transportation",
      category: "Reimbursement",
      date: "2026-07-21",
      isoDate: "2026-07-21",
      assignedOfficer: "Paolo Cruz",
      status: "Rejected",
      statusRank: 4,
      details: "Late night catering transportation receipt",
    },
  ]);

  // Tracker Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Form State
  const [category, setCategory] = useState("Leave");
  const [requestType, setRequestType] = useState("Vacation");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Timeline Modal State
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [timelineOpen, setTimelineOpen] = useState(false);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await essApi.myRequests();
      if (res?.requests?.length) {
        const liveItems = res.requests.map((r: ApiEssRequestItem) => ({
          id: r.id,
          type: r.type,
          category: r.category || "General",
          date: r.filed ? r.filed.slice(0, 10) : r.date_from || "2026-08-23",
          isoDate: r.filed || r.date_from || "2026-08-23",
          assignedOfficer: r.assignedTo || r.assigned_to || "Juan Dela Cruz",
          status: r.status,
          statusRank:
            r.status === "Pending"
              ? 0
              : r.status === "Under Review"
              ? 1
              : r.status === "Approved"
              ? 2
              : r.status === "Completed"
              ? 3
              : 4,
          details: r.details,
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

  const handleRowClick = (req: any) => {
    setSelectedRequest({
      id: req.id,
      type: req.type,
      category: req.category,
      date: req.date,
      status: req.status,
      assignedTo: req.assignedOfficer,
      details: req.details,
    });
    setTimelineOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) {
      toast.error("Please provide detailed description / request justification.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await essApi.createRequest({
        category_code: category.toLowerCase().replace(/\s+/g, "_"),
        category_name: category,
        request_type: requestType,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        details: details,
      });

      const todayStr = new Date().toISOString().slice(0, 10);
      const newReq = {
        id: res?.request?.request_code || `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
        type: requestType,
        category: category,
        date: todayStr,
        isoDate: todayStr,
        assignedOfficer: "Juan Dela Cruz",
        status: "Pending",
        statusRank: 0,
        details: details,
      };

      setRequests([newReq, ...requests]);
      toast.success(`${requestType} request submitted to HR Services.`);

      // Reset Form
      setDateFrom("");
      setDateTo("");
      setDetails("");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit request to HR.");
    } finally {
      setSubmitting(false);
    }
  };

  const availableSubtypes = CATEGORY_SUBTYPES[category] || ["General Request"];

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
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Request Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date Filed</TableHead>
                <TableHead>Assigned Officer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary mb-1.5" />
                    Loading requests tracker...
                  </TableCell>
                </TableRow>
              ) : pagination.pageItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground text-xs">
                    No matching requests found.
                  </TableCell>
                </TableRow>
              ) : (
                pagination.pageItems.map((r, idx) => (
                  <TableRow
                    key={idx}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleRowClick(r)}
                  >
                    <TableCell className="text-xs font-mono font-medium text-foreground">
                      {r.id}
                    </TableCell>
                    <TableCell className="text-sm font-bold text-foreground">
                      {r.type}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.category}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">{r.date}</TableCell>
                    <TableCell className="text-xs font-medium text-foreground">
                      {r.assignedOfficer}
                    </TableCell>
                    <TableCell>
                      <EssStatusBadge status={r.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-primary font-medium">
                        Timeline →
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
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
      />
    </div>
  );
}
