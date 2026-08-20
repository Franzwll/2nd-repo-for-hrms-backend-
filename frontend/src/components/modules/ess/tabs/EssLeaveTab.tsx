import { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Palmtree,
  Stethoscope,
  CalendarDays,
  HeartHandshake,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EssStatusBadge } from "@/components/modules/ess/shared/EssStatusBadge";
import { LeaveApplicationModal } from "@/components/modules/ess/modals/LeaveApplicationModal";
import { RequestTimelineModal, type RequestItem } from "@/components/modules/ess/modals/RequestTimelineModal";
import { essApi, type ApiLeaveBalance } from "@/lib/api";
import { toast } from "sonner";

export function EssLeaveTab() {
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [balances, setBalances] = useState<ApiLeaveBalance[]>([]);
  const [leaveHistory, setLeaveHistory] = useState<any[]>([]);

  const loadLeaves = async () => {
    try {
      setLoading(true);
      const res = await essApi.leaves();
      setBalances(res.balances);
      setLeaveHistory(res.history || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load leave records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const handleRowClick = (item: any) => {
    setSelectedRequest({
      id: item.request_code || item.id,
      type: item.request_type || item.type,
      category: "Leave",
      date: item.filed_at ? item.filed_at.slice(0, 10) : item.filedDate,
      status: item.status,
      assignedTo: item.assignedTo || "HR Administration",
      details: item.details || item.reason,
    });
    setTimelineOpen(true);
  };

  const getLeaveIcon = (type: string) => {
    if (type.includes("Vacation")) return <Palmtree className="h-4 w-4 text-amber-600" />;
    if (type.includes("Sick")) return <Stethoscope className="h-4 w-4 text-emerald-600" />;
    if (type.includes("Emergency")) return <AlertCircle className="h-4 w-4 text-rose-600" />;
    return <CalendarDays className="h-4 w-4 text-primary" />;
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Apply CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Leave Balances &amp; Accrual
          </h3>
          <p className="text-xs text-muted-foreground">
            Track statutory and company-granted paid leave allocations for calendar year 2026.
          </p>
        </div>
        <Button onClick={() => setLeaveModalOpen(true)} className="gap-1.5 shadow-xs">
          <Plus className="h-4 w-4" /> Apply for Leave
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12 text-muted-foreground text-sm gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" /> Loading leave balances...
        </div>
      ) : (
        <>
          {/* Visual Leave Cards Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {balances.map((l) => {
              const remaining = Math.max(0, l.total - l.used);
              const percent = l.total > 0 ? Math.round((remaining / l.total) * 100) : 0;
              return (
                <Card key={l.type} className="border-border/70 shadow-xs hover:border-primary/50 transition-all">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                          {getLeaveIcon(l.type)} {l.type}
                        </p>
                        <p className="text-2xl font-bold font-display text-foreground mt-1">
                          {remaining} <span className="text-xs font-normal text-muted-foreground">/ {l.total} days</span>
                        </p>
                      </div>
                      <span className="text-xs font-bold text-primary font-mono">{percent}%</span>
                    </div>
                    <Progress value={percent} className="h-2" />
                    <div className="flex justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/60">
                      <span>Used: {l.used} days</span>
                      <span>Available: {remaining} days</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Leave History / Ledger */}
          <Card className="border-border/70 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-xl font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Leave Filing History &amp; Approvals
              </CardTitle>
              <p className="text-xs text-muted-foreground">Click any record to inspect the approval chain and reviewer notes.</p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Effective Dates</TableHead>
                    <TableHead>Reason / Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        No filed leave requests yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    leaveHistory.map((item, idx) => (
                      <TableRow
                        key={idx}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleRowClick(item)}
                      >
                        <TableCell className="text-xs font-mono font-medium text-foreground">
                          {item.request_code || item.id}
                        </TableCell>
                        <TableCell className="text-sm font-semibold">{item.request_type || item.type}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {item.date_from || item.dateFrom} {item.date_to && item.date_to !== item.date_from ? `to ${item.date_to}` : ""}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{item.details || item.reason}</TableCell>
                        <TableCell>
                          <EssStatusBadge status={item.status} />
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
            </CardContent>
          </Card>
        </>
      )}

      {/* Modals */}
      <LeaveApplicationModal
        open={leaveModalOpen}
        onOpenChange={setLeaveModalOpen}
        onSubmitLeave={() => {
          loadLeaves();
        }}
      />
      <RequestTimelineModal
        open={timelineOpen}
        onOpenChange={setTimelineOpen}
        request={selectedRequest}
      />
    </div>
  );
}
