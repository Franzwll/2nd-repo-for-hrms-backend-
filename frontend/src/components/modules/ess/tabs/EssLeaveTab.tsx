import { useState } from "react";
import { Calendar, Plus, Clock, CheckCircle2, AlertCircle } from "lucide-react";
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
import { myLeaveBalances, myProfile } from "@/data/ess";
import { LeaveApplicationModal } from "@/components/modules/ess/modals/LeaveApplicationModal";
import { RequestTimelineModal, type RequestItem } from "@/components/modules/ess/modals/RequestTimelineModal";

export function EssLeaveTab() {
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [timelineOpen, setTimelineOpen] = useState(false);

  const [leaveHistory, setLeaveHistory] = useState([
    {
      id: "REQ-4410",
      type: "Sick Leave (1 day)",
      dateFrom: "2026-07-22",
      dateTo: "2026-07-22",
      days: 1,
      reason: "Acute gastroenteritis, medical cert attached.",
      status: "Approved",
      filedDate: "2026-07-20",
    },
    {
      id: "REQ-4301",
      type: "Vacation Leave (3 days)",
      dateFrom: "2026-06-15",
      dateTo: "2026-06-17",
      days: 3,
      reason: "Family travel to province.",
      status: "Approved",
      filedDate: "2026-06-01",
    },
    {
      id: "REQ-4220",
      type: "Emergency Leave (1 day)",
      dateFrom: "2026-05-10",
      dateTo: "2026-05-10",
      days: 1,
      reason: "Urgent residential repair.",
      status: "Approved",
      filedDate: "2026-05-09",
    },
  ]);

  const handleLeaveSubmit = (newLeave: any) => {
    const newEntry = {
      id: `REQ-${Date.now().toString().slice(-4)}`,
      type: newLeave.type,
      dateFrom: newLeave.dateFrom,
      dateTo: newLeave.dateTo,
      days: newLeave.days,
      reason: newLeave.reason,
      status: "Pending",
      filedDate: newLeave.filedDate,
    };
    setLeaveHistory([newEntry, ...leaveHistory]);
  };

  const handleRowClick = (item: any) => {
    setSelectedRequest({
      id: item.id,
      type: item.type,
      category: "Leave",
      date: item.filedDate,
      status: item.status,
      assignedTo: `${myProfile.supervisor} / Juan Dela Cruz`,
      details: item.reason,
    });
    setTimelineOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Apply CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold font-display text-foreground">Leave Balances &amp; Accrual</h3>
          <p className="text-xs text-muted-foreground">
            Track statutory and company-granted paid leave allocations for calendar year 2026.
          </p>
        </div>
        <Button onClick={() => setLeaveModalOpen(true)} className="gap-1.5 shadow-xs">
          <Plus className="h-4 w-4" /> Apply for Leave
        </Button>
      </div>

      {/* Visual Leave Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {myLeaveBalances.map((l) => {
          const remaining = l.total - l.used;
          const percent = Math.round((remaining / l.total) * 100);
          return (
            <Card key={l.type} className="border-border/70 shadow-xs hover:border-primary/50 transition-all">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{l.type}</p>
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
                <TableHead>Leave Type &amp; Days</TableHead>
                <TableHead>Effective Dates</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaveHistory.map((item, idx) => (
                <TableRow
                  key={idx}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleRowClick(item)}
                >
                  <TableCell className="text-xs font-mono font-medium text-foreground">{item.id}</TableCell>
                  <TableCell className="text-sm font-semibold">{item.type}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {item.dateFrom} {item.dateTo !== item.dateFrom ? `to ${item.dateTo}` : ""}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{item.reason}</TableCell>
                  <TableCell>
                    <EssStatusBadge status={item.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-primary">
                      Timeline →
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modals */}
      <LeaveApplicationModal
        open={leaveModalOpen}
        onOpenChange={setLeaveModalOpen}
        onSubmitLeave={handleLeaveSubmit}
      />
      <RequestTimelineModal
        open={timelineOpen}
        onOpenChange={setTimelineOpen}
        request={selectedRequest}
      />
    </div>
  );
}
