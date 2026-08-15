import { useState, useMemo } from "react";
import { Send, Search, ArrowUpDown, Plus, Filter, Clock, FileText, CheckCircle2 } from "lucide-react";
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
import { essRequests, requestCategories, myProfile, type ESSRequest } from "@/data/ess";
import { RequestTimelineModal, type RequestItem } from "@/components/modules/ess/modals/RequestTimelineModal";
import { toast } from "sonner";

export function EssRequestCenterTab() {
  const [category, setCategory] = useState(requestCategories[0]!.name);
  const [requestType, setRequestType] = useState(requestCategories[0]!.types[0]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [reason, setReason] = useState("");

  const [requestsList, setRequestsList] = useState<ESSRequest[]>(
    essRequests.filter((r) => r.employeeId === myProfile.employeeId || r.employee.includes("Kevin"))
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [timelineOpen, setTimelineOpen] = useState(false);

  const filteredRequests = useMemo(() => {
    return requestsList.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (search && !`${r.type} ${r.category} ${r.id} ${r.status}`.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [requestsList, search, statusFilter]);

  const reqPage = usePagination(filteredRequests);

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq: ESSRequest = {
      id: `REQ-${Date.now().toString().slice(-4)}`,
      employee: myProfile.name,
      employeeId: myProfile.employeeId,
      department: myProfile.department,
      category,
      type: requestType || `${category} Request`,
      filed: new Date().toISOString().slice(0, 10),
      status: "Pending",
      assignedTo: "Juan Dela Cruz (HR Admin)",
      details: reason || "General request submitted via ESS.",
    };

    setRequestsList([newReq, ...requestsList]);
    toast.success(`Request ${newReq.id} submitted to HR Administration.`);
    setReason("");
    setDateFrom("");
    setDateTo("");
  };

  const handleRowClick = (r: ESSRequest) => {
    setSelectedRequest({
      id: r.id,
      type: r.type,
      category: r.category,
      date: r.filed,
      status: r.status,
      assignedTo: r.assignedTo,
      details: r.details,
    });
    setTimelineOpen(true);
  };

  const handleCancel = (id: string) => {
    setRequestsList((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Central Requests Tracker */}
      <Card className="border-border/70 shadow-xs">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3">
          <div>
            <CardTitle className="font-display text-xl font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              All Filed Requests Tracker
            </CardTitle>
            <p className="text-xs text-muted-foreground">Click any record to inspect live multi-stage review audit trail.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search request ID or type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9 w-[180px]"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-[130px]">
                <SelectValue placeholder="Status" />
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
              {reqPage.pageItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No requests found matching criteria.
                  </TableCell>
                </TableRow>
              ) : (
                reqPage.pageItems.map((r) => (
                  <TableRow
                    key={r.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleRowClick(r)}
                  >
                    <TableCell className="text-xs font-mono font-medium text-foreground">{r.id}</TableCell>
                    <TableCell className="text-sm font-semibold">{r.type}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.category}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.filed}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.assignedTo}</TableCell>
                    <TableCell>
                      <EssStatusBadge status={r.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-primary">
                        Timeline →
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            page={reqPage.page}
            pageCount={reqPage.pageCount}
            from={reqPage.from}
            to={reqPage.to}
            total={reqPage.total}
            label="requests"
            onPageChange={reqPage.setPage}
          />
        </CardContent>
      </Card>

      {/* Submit General Request Form */}
      <Card className="border-border/70 shadow-xs">
        <CardHeader>
          <CardTitle className="font-display text-xl font-semibold flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Submit General Self-Service Request
          </CardTitle>
          <p className="text-xs text-muted-foreground">File miscellaneous inquiries, personal data updates, loans, or reimbursements.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitRequest} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Request Category</Label>
                <Select
                  value={category}
                  onValueChange={(val) => {
                    setCategory(val);
                    const found = requestCategories.find((c) => c.name === val);
                    if (found && found.types.length > 0) setRequestType(found.types[0]);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {requestCategories.map((c) => (
                      <SelectItem key={c.name} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Specific Request Type</Label>
                <Select value={requestType} onValueChange={setRequestType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {(requestCategories.find((c) => c.name === category)?.types ?? []).map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Effective Date (From)</Label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Effective Date (To)</Label>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Details / Request Justification</Label>
              <Textarea
                rows={3}
                placeholder="Provide detailed description for HR review..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="gap-1.5">
              <Send className="h-4 w-4" /> Submit Request to HR
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Timeline Modal */}
      <RequestTimelineModal
        open={timelineOpen}
        onOpenChange={setTimelineOpen}
        request={selectedRequest}
        onCancelRequest={handleCancel}
      />
    </div>
  );
}
