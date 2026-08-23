import { useState, useMemo, useEffect } from "react";
import {
  Calendar,
  Clock,
  Plus,
  Search,
  ArrowUpDown,
  CalendarCheck,
  TrendingUp,
  FileEdit,
  Palmtree,
  Stethoscope,
  AlertCircle,
  CalendarDays,
  Loader2,
  FileText,
  Layers,
  ArrowLeftRight,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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
import { ShiftSwapModal } from "@/components/modules/ess/modals/ShiftSwapModal";
import { RequestTimelineModal, type RequestItem } from "@/components/modules/ess/modals/RequestTimelineModal";
import { essApi, type ApiScheduleDay, type ApiEssEmployee, type ApiLeaveBalance } from "@/lib/api";

export function EssAttendanceTab() {
  // Live Attendance state
  const [attSummary, setAttSummary] = useState({
    present_days: 18,
    late_days: 1,
    absent_days: 0,
    overtime_hours: 4.5,
    average_hours: 8.0,
  });
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);

  const [attRequests, setAttRequests] = useState([
    { id: "REQ-4408", date: "Jul 20, 2026", isoDate: "2026-07-20", type: "Missed Time Out", status: "Pending", statusRank: 0, details: "Scanner offline at end of shift" },
    { id: "REQ-4390", date: "Jun 12, 2026", isoDate: "2026-06-12", type: "Time In Correction", status: "Approved", statusRank: 1, details: "Late override approved by Chef Marco" },
    { id: "REQ-4355", date: "May 22, 2026", isoDate: "2026-05-22", type: "Rest Day Work", status: "Approved", statusRank: 1, details: "Catering banquet support" },
  ]);

  const [attSearch, setAttSearch] = useState("");
  const [attSort, setAttSort] = useState("date-desc");
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [timelineOpen, setTimelineOpen] = useState(false);

  // Schedule state
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [employeeInfo, setEmployeeInfo] = useState<ApiEssEmployee | null>(null);
  const [roster, setRoster] = useState<ApiScheduleDay[]>([]);

  // Leave state (balances & filing history)
  const [leaveLoading, setLeaveLoading] = useState(true);
  const [balances, setBalances] = useState<ApiLeaveBalance[]>([]);
  const [leaveHistory, setLeaveHistory] = useState<any[]>([]);

  const loadData = async () => {
    // Load Attendance Logs
    essApi
      .myAttendance()
      .then((res) => {
        if (res?.records) {
          setAttendanceLogs(res.records);
        }
        if (res?.summary) {
          setAttSummary(res.summary);
        }
      })
      .catch(() => {});

    // Load Schedule
    try {
      setScheduleLoading(true);
      const schedRes = await essApi.schedule();
      setEmployeeInfo(schedRes.employee);
      setRoster(schedRes.weekly_roster || []);
    } catch {
      // handled gracefully
    } finally {
      setScheduleLoading(false);
    }

    // Load Leaves
    try {
      setLeaveLoading(true);
      const leaveRes = await essApi.leaves();
      setBalances(leaveRes.balances || []);
      setLeaveHistory(leaveRes.history || []);
    } catch {
      // handled gracefully
    } finally {
      setLeaveLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

  const handleCorrectionSubmit = async (newCorrection: any) => {
    const todayStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const isoStr = new Date().toISOString().slice(0, 10);
    const req = {
      id: `REQ-${Date.now().toString().slice(-4)}`,
      date: todayStr,
      isoDate: isoStr,
      type: newCorrection.type || "DTR Correction",
      status: "Pending",
      statusRank: 0,
      details: newCorrection.reason || "Time record adjustment requested",
    };
    setAttRequests([req, ...attRequests]);

    try {
      await essApi.createRequest({
        category_code: "attendance",
        category_name: "Attendance",
        request_type: newCorrection.type || "DTR Correction",
        date_from: newCorrection.date || isoStr,
        details: newCorrection.reason || "Time record adjustment requested",
      });
    } catch {
      // Handled gracefully with fallback
    }
  };

  const handleRowClick = (req: any, category = "Attendance") => {
    setSelectedRequest({
      id: req.id || req.request_code,
      type: req.type || req.request_type,
      category: category,
      date: req.date || (req.filed_at ? req.filed_at.slice(0, 10) : req.filedDate),
      status: req.status,
      assignedTo: req.assignedTo || "Executive Chef Marco / HR Admin",
      details: req.details || req.reason || "Request filed in portal.",
    });
    setTimelineOpen(true);
  };

  const getLeaveIcon = (type: string) => {
    if (type.includes("Vacation")) return <Palmtree className="h-4 w-4 text-amber-600" />;
    if (type.includes("Sick")) return <Stethoscope className="h-4 w-4 text-emerald-600" />;
    if (type.includes("Emergency")) return <AlertCircle className="h-4 w-4 text-rose-600" />;
    return <CalendarDays className="h-4 w-4 text-primary" />;
  };

  const todayRecord = attendanceLogs[0];

  return (
    <div className="space-y-8">
      {/* SECTION 1: WEEKLY SHIFT SCHEDULE & ROSTER */}
      <div className="space-y-4">
        <Card className="border-border/70 shadow-xs">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 gap-3">
            <div>
              <CardTitle className="font-display text-xl font-semibold flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                Weekly Shift Schedule &amp; Roster
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Current work schedule assigned by {employeeInfo?.supervisor ?? "Supervisor"} for {employeeInfo?.department ?? "Department"}.
              </p>
            </div>
            <Button onClick={() => setSwapModalOpen(true)} variant="outline" size="sm" className="gap-1.5 shadow-xs text-xs">
              <ArrowLeftRight className="h-4 w-4 text-purple-600" /> Request Shift Swap
            </Button>
          </CardHeader>
          <CardContent>
            {scheduleLoading ? (
              <div className="flex items-center justify-center p-12 text-muted-foreground text-sm gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" /> Loading weekly roster...
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {roster.map((s) => {
                  const isRestDay = s.shift === "Rest Day" || s.shift.includes("Rest");
                  return (
                    <div
                      key={s.day}
                      className={`rounded-xl border p-4 transition-all shadow-xs ${
                        isRestDay
                          ? "border-border/60 bg-muted/20 opacity-80"
                          : "border-primary/30 bg-primary/5 hover:border-primary/60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{s.day}</span>
                        <Badge
                          variant="outline"
                          className={
                            isRestDay
                              ? "bg-muted text-muted-foreground border-border text-[10px]"
                              : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]"
                          }
                        >
                          {s.shift}
                        </Badge>
                      </div>
                      <div className="mt-3 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs text-foreground font-semibold">
                          <Clock className="h-3.5 w-3.5 text-primary shrink-0" /> {s.time}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> {s.location}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* SECTION 2: ATTENDANCE LOGS & DAILY TIME RECORD (DTR) */}
      <div className="space-y-6 pt-2 border-t border-border">
        {/* Attendance Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Attendance Logs &amp; Daily Time Record (DTR)
            </h3>
            <p className="text-xs text-muted-foreground">
              Official biometric timecard logs, daily time-in/out records, and attendance correction requests.
            </p>
          </div>
          <Button size="sm" onClick={() => setCorrectionModalOpen(true)} className="gap-1.5 text-xs shadow-xs">
            <Plus className="h-4 w-4" /> File DTR Correction
          </Button>
        </div>

        {/* Attendance Metric Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-border/70 shadow-xs hover:border-primary/40 transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Today Time In</p>
                <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-1 text-2xl font-bold font-display text-emerald-600 dark:text-emerald-400">
                {todayRecord ? todayRecord.timeIn : "07:54 AM"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Time Out: <strong className="text-foreground">{todayRecord ? todayRecord.timeOut : "On Duty"}</strong>
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-xs hover:border-primary/40 transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Monthly Attendance</p>
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <CalendarCheck className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-1 text-2xl font-bold font-display text-foreground">{attSummary.present_days} Days Present</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {attSummary.late_days} Late · {attSummary.absent_days} Absent · {attSummary.overtime_hours}h Overtime
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-xs hover:border-primary/40 transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Average Hours</p>
                <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-1 text-2xl font-bold font-display text-primary">
                {attSummary.average_hours} Hours / Day
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Standard 8-hour shift compliance</p>
            </CardContent>
          </Card>
        </div>

        {/* DTR Daily History Table */}
        <Card className="border-border/70 shadow-xs">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 gap-3">
            <div>
              <CardTitle className="font-display text-xl font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Daily Time Record (DTR) History
              </CardTitle>
              <p className="text-xs text-muted-foreground">Official biometric timecard logs for current cut-off.</p>
            </div>
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
                {(attendanceLogs.length > 0 ? attendanceLogs : myAttendance.history.map(h => ({
                  date: h.date,
                  timeIn: h.in,
                  timeOut: h.out,
                  workedHours: h.hours,
                  status: h.remark.includes("Present") ? "Present" : h.remark.includes("Late") ? "Late" : h.remark
                }))).map((h, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium text-xs text-foreground">{h.date}</TableCell>
                    <TableCell className="text-xs font-mono">{h.timeIn}</TableCell>
                    <TableCell className="text-xs font-mono">{h.timeOut}</TableCell>
                    <TableCell className="text-xs font-semibold">{h.workedHours} hrs</TableCell>
                    <TableCell>
                      <EssStatusBadge status={h.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Attendance Adjustment Requests Table */}
        <Card className="border-border/70 shadow-xs">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3">
            <div>
              <CardTitle className="font-display text-xl font-semibold flex items-center gap-2">
                <FileEdit className="h-5 w-5 text-primary" />
                My Attendance Correction Requests
              </CardTitle>
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
                      onClick={() => handleRowClick(r, "Attendance")}
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
      </div>

      {/* SECTION 3: LEAVE BALANCES & ACCRUAL */}
      <div className="space-y-6 pt-2 border-t border-border">
        <div>
          <h3 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Leave Balances &amp; Accrual ({new Date().getFullYear()})
          </h3>
          <p className="text-xs text-muted-foreground">
            Track statutory and company-granted paid leave allocations, utilized credits, and remaining balance.
          </p>
        </div>

        {leaveLoading ? (
          <div className="flex items-center justify-center p-12 text-muted-foreground text-sm gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" /> Loading leave balances...
          </div>
        ) : (
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
        )}

        {/* SECTION 4: LEAVE FILING HISTORY & APPROVALS */}
        <Card className="border-border/70 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-xl font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
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
                      onClick={() => handleRowClick(item, "Leave")}
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
      </div>

      {/* Modals */}
      <DtrCorrectionModal
        open={correctionModalOpen}
        onOpenChange={setCorrectionModalOpen}
        onSubmitCorrection={handleCorrectionSubmit}
      />
      <ShiftSwapModal
        open={swapModalOpen}
        onOpenChange={setSwapModalOpen}
        onSubmitSwap={() => loadData()}
      />
      <RequestTimelineModal
        open={timelineOpen}
        onOpenChange={setTimelineOpen}
        request={selectedRequest}
      />
    </div>
  );
}
