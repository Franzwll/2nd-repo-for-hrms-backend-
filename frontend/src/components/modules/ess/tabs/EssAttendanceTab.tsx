import { useState, useMemo, useEffect } from "react";
import {
  Clock,
  Plus,
  Search,
  ArrowUpDown,
  Calendar,
  Layers,
  ArrowLeftRight,
  MapPin,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { ShiftSwapModal } from "@/components/modules/ess/modals/ShiftSwapModal";
import { LeaveApplicationModal } from "@/components/modules/ess/modals/LeaveApplicationModal";
import { RequestTimelineModal, type RequestItem } from "@/components/modules/ess/modals/RequestTimelineModal";
import { essApi, type ApiScheduleDay, type ApiEssEmployee, type ApiLeaveBalance } from "@/lib/api";

export function EssAttendanceTab() {
  const [subSection, setSubSection] = useState("dtr");

  // Attendance state
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

  // Schedule state
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [employeeInfo, setEmployeeInfo] = useState<ApiEssEmployee | null>(null);
  const [roster, setRoster] = useState<ApiScheduleDay[]>([]);

  // Leave state
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [balances, setBalances] = useState<ApiLeaveBalance[]>([]);
  const [leaveHistory, setLeaveHistory] = useState<any[]>([]);

  useEffect(() => {
    // Load Schedule
    setScheduleLoading(true);
    essApi
      .schedule()
      .then((res) => {
        setEmployeeInfo(res.employee);
        setRoster(res.weekly_roster || []);
      })
      .catch(() => {})
      .finally(() => setScheduleLoading(false));

    // Load Leaves
    setLeaveLoading(true);
    essApi
      .leaves()
      .then((res) => {
        setBalances(res.balances || []);
        setLeaveHistory(res.history || []);
      })
      .catch(() => {})
      .finally(() => setLeaveLoading(false));
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

  return (
    <div className="space-y-6">
      {/* 4 Attendance & Schedule Metric Cards */}
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
            <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Vacation Leave Balance</p>
            <p className="mt-1 text-2xl font-bold font-display text-primary">
              {balances.find((b) => b.type.includes("Vacation"))?.available ?? 13} Days
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Available for rest &amp; travel</p>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-xs flex flex-col justify-between">
          <CardContent className="p-4">
            <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Quick Actions</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Button
                size="sm"
                className="text-xs gap-1 h-8 bg-primary text-primary-foreground font-medium"
                onClick={() => setClockModalOpen(true)}
              >
                <Clock className="h-3.5 w-3.5" /> Clock In/Out
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs gap-1 h-8"
                onClick={() => setLeaveModalOpen(true)}
              >
                <Calendar className="h-3.5 w-3.5 text-emerald-600" /> Apply Leave
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sub-Navigation Tabs inside Attendance */}
      <Tabs value={subSection} onValueChange={setSubSection} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="bg-muted/60 p-1">
            <TabsTrigger value="dtr" className="text-xs gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Attendance Logs &amp; DTR
            </TabsTrigger>
            <TabsTrigger value="schedule" className="text-xs gap-1.5">
              <Layers className="h-3.5 w-3.5" /> Weekly Shift Schedule
            </TabsTrigger>
            <TabsTrigger value="leave" className="text-xs gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> Leave Balances &amp; Filing
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 1. DTR Logs & Correction Sub-tab */}
        <TabsContent value="dtr" className="space-y-6">
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
        </TabsContent>

        {/* 2. Weekly Shift Schedule Sub-tab */}
        <TabsContent value="schedule" className="space-y-6">
          <Card className="border-border/70 shadow-xs">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 gap-3">
              <div>
                <CardTitle className="font-display text-xl font-semibold flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  Weekly Shift Roster
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Current roster assigned by {employeeInfo?.supervisor ?? "Supervisor"} for {employeeInfo?.department ?? "Department"}.
                </p>
              </div>
              <Button onClick={() => setSwapModalOpen(true)} variant="outline" className="gap-1.5 shadow-xs text-xs">
                <ArrowLeftRight className="h-4 w-4 text-purple-600" /> Request Shift Swap
              </Button>
            </CardHeader>
            <CardContent>
              {scheduleLoading ? (
                <div className="flex items-center justify-center p-12 text-muted-foreground text-sm gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" /> Loading roster...
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
                            <Clock className="h-3.5 w-3.5 text-primary" /> {s.time}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> {s.location}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. Leave Balances & Filing Sub-tab */}
        <TabsContent value="leave" className="space-y-6">
          <Card className="border-border/70 shadow-xs">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 gap-3">
              <div>
                <CardTitle className="font-display text-xl font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Leave Balances ({new Date().getFullYear()})
                </CardTitle>
                <p className="text-xs text-muted-foreground">Annual leave entitlement, utilized credits, and remaining balance.</p>
              </div>
              <Button onClick={() => setLeaveModalOpen(true)} className="gap-1.5 text-xs">
                <Plus className="h-4 w-4" /> Apply for Leave
              </Button>
            </CardHeader>
            <CardContent>
              {leaveLoading ? (
                <div className="flex items-center justify-center p-8 text-muted-foreground text-sm gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" /> Loading balances...
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-3">
                  {balances.map((b) => {
                    const pct = b.total > 0 ? Math.round((b.used / b.total) * 100) : 0;
                    return (
                      <div key={b.type} className="rounded-xl border border-border/70 p-4 space-y-3 shadow-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">{b.type}</span>
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                            {b.available} Days Left
                          </Badge>
                        </div>
                        <div>
                          <p className="text-2xl font-bold font-display text-foreground">{b.available} / {b.total}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{b.used} days used this year</p>
                        </div>
                        <Progress value={pct} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Leave History Table */}
          <Card className="border-border/70 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-xl font-semibold">Leave Application History</CardTitle>
              <p className="text-xs text-muted-foreground">Filed leave requests and approval progress.</p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                        No leave history records found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    leaveHistory.map((item, idx) => (
                      <TableRow
                        key={idx}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleRowClick(item, "Leave")}
                      >
                        <TableCell className="text-xs font-mono font-medium text-foreground">{item.request_code || item.id || `REQ-${idx + 1}`}</TableCell>
                        <TableCell className="text-sm font-medium">{item.request_type || item.type}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {item.date_from ? `${item.date_from} – ${item.date_to || item.date_from}` : item.period || "—"}
                        </TableCell>
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
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <QuickClockModal open={clockModalOpen} onOpenChange={setClockModalOpen} />
      <DtrCorrectionModal
        open={correctionModalOpen}
        onOpenChange={setCorrectionModalOpen}
        onSubmitCorrection={handleCorrectionSubmit}
      />
      <ShiftSwapModal open={swapModalOpen} onOpenChange={setSwapModalOpen} />
      <LeaveApplicationModal open={leaveModalOpen} onOpenChange={setLeaveModalOpen} />
      <RequestTimelineModal
        open={timelineOpen}
        onOpenChange={setTimelineOpen}
        request={selectedRequest}
      />
    </div>
  );
}
