import { useState, useMemo } from "react";
import { Clock, Plus, Search, ArrowUpDown, Send, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
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
import { myAttendance } from "@/data/ess";
import { DtrCorrectionModal } from "@/components/modules/ess/modals/DtrCorrectionModal";
import { QuickClockModal } from "@/components/modules/ess/modals/QuickClockModal";
import { RequestTimelineModal, type RequestItem } from "@/components/modules/ess/modals/RequestTimelineModal";

export function EssAttendanceTab() {
  const [attRequests, setAttRequests] = useState([
    { id: "REQ-4408", date: "Jul 20, 2026", isoDate: "2026-07-20", type: "Missed Time Out", status: "Pending", statusRank: 0, details: "Scanner offline at end of shift" },
    { id: "REQ-4390", date: "Jun 12, 2026", isoDate: "2026-06-12", type: "Time In Correction", status: "Approved", statusRank: 1, details: "Late override approved by Chef Marco" },
    { id: "REQ-4355", date: "May 22, 2026", isoDate: "2026-05-22", type: "Rest Day Work", status: "Approved", statusRank: 1, details: "Catering banquet support" },
  ]);

  const [attSearch, setAttSearch] = useState("");
  const [attSort, setAttSort] = useState("date-desc");
  const [clockModalOpen, setClockModalOpen] = useState(false);
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [timelineOpen, setTimelineOpen] = useState(false);

  const filteredAttRequests = useMemo(() => {
    return attRequests
      .filter((r) => !attSearch || r.type.toLowerCase().includes(attSearch.toLowerCase()) || r.status.toLowerCase().includes(attSearch.toLowerCase()))
      .sort((a, b) => {
        if (attSort === "date-desc") return b.isoDate.localeCompare(a.isoDate);
        if (attSort === "date-asc") return a.isoDate.localeCompare(b.isoDate);
        if (attSort === "status") return a.statusRank - b.statusRank;
        return 0;
      });
  }, [attRequests, attSearch, attSort]);

  const attPage = usePagination(filteredAttRequests);

  const handleCorrectionSubmit = (newCorrection: any) => {
    const todayStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const isoStr = new Date().toISOString().slice(0, 10);
    const req = {
      id: `REQ-${Date.now().toString().slice(-4)}`,
      date: todayStr,
      isoDate: isoStr,
      type: newCorrection.type,
      status: "Pending",
      statusRank: 0,
      details: newCorrection.reason,
    };
    setAttRequests([req, ...attRequests]);
  };

  const handleRowClick = (req: any) => {
    setSelectedRequest({
      id: req.id,
      type: req.type,
      category: "Attendance",
      date: req.date,
      status: req.status,
      assignedTo: "Executive Chef Marco / Juan Dela Cruz",
      details: req.details || "Attendance adjustment filed by employee.",
    });
    setTimelineOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 4 Attendance Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/70 shadow-xs">
          <CardContent className="p-4">
            <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Today Time In</p>
            <p className="mt-1 text-2xl font-bold font-display text-emerald-600 dark:text-emerald-400">{myAttendance.today.timeIn}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Time Out: <strong className="text-foreground">{myAttendance.today.timeOut}</strong></p>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-xs">
          <CardContent className="p-4">
            <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Monthly Attendance</p>
            <p className="mt-1 text-2xl font-bold font-display text-foreground">{myAttendance.monthly.present} Days Present</p>
            <p className="text-xs text-muted-foreground mt-0.5">{myAttendance.monthly.late} Late · {myAttendance.monthly.absent} Absent</p>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-xs">
          <CardContent className="p-4">
            <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Overtime Rendered</p>
            <p className="mt-1 text-2xl font-bold font-display text-primary">{myAttendance.monthly.overtimeHours} hrs</p>
            <p className="text-xs text-muted-foreground mt-0.5">Approved overtime this month</p>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-xs flex flex-col justify-between">
          <CardContent className="p-4">
            <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Break Shift Status</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{myAttendance.today.breakIn} – {myAttendance.today.breakOut}</p>
            <Button
              size="sm"
              variant="outline"
              className="mt-2 w-full text-xs gap-1.5 h-8"
              onClick={() => setClockModalOpen(true)}
            >
              <Clock className="h-3.5 w-3.5 text-primary" /> Web Clocking Dialog
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* DTR Daily History */}
      <Card className="border-border/70 shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 gap-3">
          <div>
            <CardTitle className="font-display text-xl font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Daily Time Record (DTR) History
            </CardTitle>
            <p className="text-xs text-muted-foreground">Official biometric timecard logs for current cut-off.</p>
          </div>
          <Button size="sm" onClick={() => setCorrectionModalOpen(true)} className="gap-1.5 text-xs">
            <Plus className="h-4 w-4" /> File DTR Correction
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time In</TableHead>
                <TableHead>Time Out</TableHead>
                <TableHead>Hours Worked</TableHead>
                <TableHead>Status &amp; Remark</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myAttendance.history.map((h, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium text-xs text-foreground">{h.date}</TableCell>
                  <TableCell className="text-xs font-mono">{h.in}</TableCell>
                  <TableCell className="text-xs font-mono">{h.out}</TableCell>
                  <TableCell className="text-xs font-semibold">{h.hours} hrs</TableCell>
                  <TableCell>
                    <EssStatusBadge status={h.remark.includes("Present") ? "Present" : h.remark.includes("Late") ? "Late" : h.remark} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Attendance Adjustment Requests */}
      <Card className="border-border/70 shadow-xs">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3">
          <div>
            <CardTitle className="font-display text-xl font-semibold">My Attendance Correction Requests</CardTitle>
            <p className="text-xs text-muted-foreground">Click row to track approval progress &amp; reviewer comments.</p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search request..."
              value={attSearch}
              onChange={(e) => setAttSearch(e.target.value)}
              className="h-8 w-[140px]"
            />
            <Select value={attSort} onValueChange={setAttSort}>
              <SelectTrigger className="h-8 w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest first</SelectItem>
                <SelectItem value="date-asc">Oldest first</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Date Filed</TableHead>
                <TableHead>Correction Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attPage.pageItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                    No attendance requests filed yet.
                  </TableCell>
                </TableRow>
              ) : (
                attPage.pageItems.map((r, idx) => (
                  <TableRow
                    key={idx}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleRowClick(r)}
                  >
                    <TableCell className="text-xs font-mono font-medium text-foreground">{r.id}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.date}</TableCell>
                    <TableCell className="text-sm font-medium">{r.type}</TableCell>
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
            page={attPage.page}
            pageCount={attPage.pageCount}
            from={attPage.from}
            to={attPage.to}
            total={attPage.total}
            label="requests"
            onPageChange={attPage.setPage}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <QuickClockModal open={clockModalOpen} onOpenChange={setClockModalOpen} />
      <DtrCorrectionModal
        open={correctionModalOpen}
        onOpenChange={setCorrectionModalOpen}
        onSubmitCorrection={handleCorrectionSubmit}
      />
      <RequestTimelineModal
        open={timelineOpen}
        onOpenChange={setTimelineOpen}
        request={selectedRequest}
      />
    </div>
  );
}
