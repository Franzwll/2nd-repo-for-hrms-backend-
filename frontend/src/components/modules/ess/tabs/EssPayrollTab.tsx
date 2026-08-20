import { useState, useMemo } from "react";
import { FileText, Download, Eye, Send, Search, ArrowUpDown, HelpCircle, Building2, CheckCircle2 } from "lucide-react";
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
import { myPayroll } from "@/data/ess";
import { PayslipViewerModal } from "@/components/modules/ess/modals/PayslipViewerModal";
import { RequestTimelineModal, type RequestItem } from "@/components/modules/ess/modals/RequestTimelineModal";
import { toast } from "sonner";

export function EssPayrollTab() {
  const [selectedPayslipPeriod, setSelectedPayslipPeriod] = useState<string>("2026-07-01 – 07-15");
  const [selectedPayslipNet, setSelectedPayslipNet] = useState<number>(myPayroll.net);
  const [payslipModalOpen, setPayslipModalOpen] = useState(false);

  const [payRequests, setPayRequests] = useState([
    { id: "REQ-4407", date: "Jul 28, 2026", isoDate: "2026-07-28", type: "Overtime Request (4 hrs)", status: "Pending", statusRank: 0, details: "Kitchen prep for banquet event." },
    { id: "REQ-4388", date: "Jun 18, 2026", isoDate: "2026-06-18", type: "Overtime Request (2 hrs)", status: "Approved", statusRank: 1, details: "Dinner service rush." },
    { id: "REQ-4350", date: "Jun 01, 2026", isoDate: "2026-06-01", type: "Payslip Copy Request", status: "Released", statusRank: 1, details: "Certified copy for loan processing." },
  ]);

  const [paySearch, setPaySearch] = useState("");
  const [paySort, setPaySort] = useState("date-desc");
  const [payType, setPayType] = useState("Payroll Clarification");
  const [payPeriod, setPayPeriod] = useState("");
  const [payDetails, setPayDetails] = useState("");

  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [timelineOpen, setTimelineOpen] = useState(false);

  const filteredPayRequests = useMemo(() => {
    return payRequests
      .filter((r) => !paySearch || r.type.toLowerCase().includes(paySearch.toLowerCase()) || r.status.toLowerCase().includes(paySearch.toLowerCase()))
      .sort((a, b) => {
        if (paySort === "date-desc") return b.isoDate.localeCompare(a.isoDate);
        if (paySort === "date-asc") return a.isoDate.localeCompare(b.isoDate);
        if (paySort === "status") return a.statusRank - b.statusRank;
        return 0;
      });
  }, [payRequests, paySearch, paySort]);

  const payPage = usePagination(filteredPayRequests);

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const todayStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const isoStr = new Date().toISOString().slice(0, 10);
    const newReq = {
      id: `REQ-${Date.now().toString().slice(-4)}`,
      date: todayStr,
      isoDate: isoStr,
      type: payType,
      status: "Pending",
      statusRank: 0,
      details: `${payPeriod ? `Period: ${payPeriod}. ` : ""}${payDetails}`,
    };
    setPayRequests([newReq, ...payRequests]);
    toast.success(`${payType} submitted to Payroll Administration.`);
    setPayPeriod("");
    setPayDetails("");
  };

  const openPayslip = (period: string, net: number) => {
    setSelectedPayslipPeriod(period);
    setSelectedPayslipNet(net);
    setPayslipModalOpen(true);
  };

  const handleRowClick = (req: any) => {
    setSelectedRequest({
      id: req.id,
      type: req.type,
      category: "Payroll",
      date: req.date,
      status: req.status,
      assignedTo: "Paolo Cruz (Payroll Officer)",
      details: req.details,
    });
    setTimelineOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 3 Main Payroll Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/70 shadow-xs">
          <CardContent className="p-4">
            <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Net Pay (Latest Cut-off)</p>
            <p className="mt-1 text-3xl font-bold font-display text-emerald-600 dark:text-emerald-400">₱{myPayroll.net.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Next payout date: <strong className="text-foreground">{myPayroll.nextPayout}</strong></p>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-xs">
          <CardContent className="p-4">
            <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Gross Earnings</p>
            <p className="mt-1 text-2xl font-bold font-display text-foreground">₱{myPayroll.gross.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Includes basic pay, OT &amp; allowances</p>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-xs">
          <CardContent className="p-4">
            <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Total Deductions</p>
            <p className="mt-1 text-2xl font-bold font-display text-rose-600 dark:text-rose-400">
              -₱{(myPayroll.gross - myPayroll.net).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">SSS, PhilHealth, Pag-IBIG &amp; Tax</p>
          </CardContent>
        </Card>
      </div>

      {/* Payslips & Breakdown Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Released Payslips Table */}
        <Card className="border-border/70 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="font-display text-xl font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Released Payslips
              </CardTitle>
              <p className="text-xs text-muted-foreground">View and download official itemized pay stubs.</p>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pay Period</TableHead>
                  <TableHead>Net Pay</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myPayroll.payslips.map((ps, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium text-xs text-foreground">{ps.period}</TableCell>
                    <TableCell className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      ₱{ps.net.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <EssStatusBadge status={ps.status} />
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs font-medium text-primary hover:bg-primary/10 gap-1"
                        onClick={() => openPayslip(ps.period, ps.net)}
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs font-medium gap-1"
                        onClick={() => toast.success(`Downloading PDF payslip for ${ps.period}`)}
                      >
                        <Download className="h-3.5 w-3.5" /> PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Current Period Breakdown */}
        <Card className="border-border/70 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-xl font-semibold">Latest Pay Stub Breakdown</CardTitle>
            <p className="text-xs text-muted-foreground">Itemized item distribution for current period.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Earnings</h4>
              <div className="space-y-1.5 border-t border-border pt-2 text-xs">
                {myPayroll.breakdown.map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium text-foreground">₱{item.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Deductions</h4>
              <div className="space-y-1.5 border-t border-border pt-2 text-xs">
                {myPayroll.deductions.map((item, i) => (
                  <div key={i} className="flex justify-between text-rose-600 dark:text-rose-400">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium">-₱{item.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statutory Benefits & Company Loans Section */}
      <Card className="border-border/70 shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-xl font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Statutory Benefits &amp; Active Loans
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Official government identification numbers, healthcare coverage, and active salary loan deduction schedules.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-border/70 p-4 space-y-1.5 shadow-xs bg-muted/10">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">SSS Number</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold border border-emerald-500/30">Active</span>
              </div>
              <p className="text-base font-mono font-bold text-foreground">34-5678901-2</p>
              <p className="text-xs text-muted-foreground">Monthly Contribution: ₱950.00</p>
            </div>

            <div className="rounded-xl border border-border/70 p-4 space-y-1.5 shadow-xs bg-muted/10">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">PhilHealth</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold border border-emerald-500/30">Active</span>
              </div>
              <p className="text-base font-mono font-bold text-foreground">12-345678901-2</p>
              <p className="text-xs text-muted-foreground">Monthly Premium: ₱450.00</p>
            </div>

            <div className="rounded-xl border border-border/70 p-4 space-y-1.5 shadow-xs bg-muted/10">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Pag-IBIG (HDMF)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold border border-emerald-500/30">Active</span>
              </div>
              <p className="text-base font-mono font-bold text-foreground">1234-5678-9012</p>
              <p className="text-xs text-muted-foreground">Monthly Savings: ₱200.00</p>
            </div>

            <div className="rounded-xl border border-border/70 p-4 space-y-1.5 shadow-xs bg-muted/10">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">HMO Healthcare</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 font-semibold border border-purple-500/30">Maxicare</span>
              </div>
              <p className="text-base font-mono font-bold text-foreground">MX-8892014</p>
              <p className="text-xs text-muted-foreground">MBL Coverage: ₱150,000 / yr</p>
            </div>
          </div>

          {/* Active Loans Sub-card */}
          <div className="mt-4 rounded-xl border border-border/70 p-4 bg-muted/20">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Active Company / SSS Salary Loan
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Remaining Balance: <strong className="text-foreground">₱8,400.00</strong> · Deduction: <strong className="text-rose-600">-₱700.00 / cut-off</strong> (12 of 24 terms completed)
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-background border border-border/80 self-start sm:self-auto">
                Next Deduction: {myPayroll.nextPayout}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inquiry Form & Requests Table */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/70 shadow-xs">
          <CardHeader>
            <CardTitle className="font-display text-xl font-semibold">Submit Payroll Inquiry / OT Request</CardTitle>
            <p className="text-xs text-muted-foreground">Report discrepancy or request certified copy.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePaySubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Request Type</Label>
                <Select value={payType} onValueChange={setPayType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Payroll Clarification">Payroll / Deduction Clarification</SelectItem>
                    <SelectItem value="Overtime Request">Overtime Rendered Claim</SelectItem>
                    <SelectItem value="Night Differential Dispute">Night Differential Dispute</SelectItem>
                    <SelectItem value="Payslip Copy Request">Certified Payslip Copy Request</SelectItem>
                    <SelectItem value="Bank Account Update">Bank / Payroll Account Update</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Covered Pay Period</Label>
                <Input
                  placeholder="e.g., July 1–15, 2026"
                  value={payPeriod}
                  onChange={(e) => setPayPeriod(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Inquiry Details / Hours Claimed</Label>
                <Textarea
                  rows={3}
                  placeholder="Describe your inquiry or specify overtime rendered..."
                  value={payDetails}
                  onChange={(e) => setPayDetails(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full gap-1.5">
                <Send className="h-4 w-4" /> Submit Payroll Inquiry
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-xs">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3">
            <div>
              <CardTitle className="font-display text-xl font-semibold">My Payroll Requests</CardTitle>
              <p className="text-xs text-muted-foreground">Click row to track audit status.</p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search..."
                value={paySearch}
                onChange={(e) => setPaySearch(e.target.value)}
                className="h-8 w-[120px]"
              />
              <Select value={paySort} onValueChange={setPaySort}>
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
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payPage.pageItems.map((r, idx) => (
                  <TableRow
                    key={idx}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleRowClick(r)}
                  >
                    <TableCell className="text-xs font-mono font-medium text-foreground">{r.id}</TableCell>
                    <TableCell className="text-xs font-semibold">{r.type}</TableCell>
                    <TableCell>
                      <EssStatusBadge status={r.status} />
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
            <TablePagination
              page={payPage.page}
              pageCount={payPage.pageCount}
              from={payPage.from}
              to={payPage.to}
              total={payPage.total}
              label="requests"
              onPageChange={payPage.setPage}
            />
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <PayslipViewerModal
        open={payslipModalOpen}
        onOpenChange={setPayslipModalOpen}
        period={selectedPayslipPeriod}
        netPay={selectedPayslipNet}
        onInquiryClick={(period) => {
          setPayPeriod(period);
          setPayType("Payroll Clarification");
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
