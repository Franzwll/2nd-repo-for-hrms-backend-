import { useState, useMemo, useEffect } from "react";
import {
  FileText,
  Download,
  Eye,
  Send,
  Search,
  ArrowUpDown,
  HelpCircle,
  Building2,
  CheckCircle2,
  ShieldCheck,
  HeartHandshake,
  Building,
  Stethoscope,
  Landmark,
  MessageSquareText,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { essApi, type ApiPayrollData } from "@/lib/api";
import { PayslipViewerModal } from "@/components/modules/ess/modals/PayslipViewerModal";
import { RequestTimelineModal, type RequestItem } from "@/components/modules/ess/modals/RequestTimelineModal";
import { toast } from "sonner";

interface EssPayrollTabProps {
  initialTab?: "payslips" | "requests" | "benefits";
}

export function EssPayrollTab({ initialTab = "payslips" }: EssPayrollTabProps = {}) {
  const [activeTab, setActiveTab] = useState<"payslips" | "requests" | "benefits">(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [payrollData, setPayrollData] = useState<ApiPayrollData | null>(null);
  const [selectedPayslipPeriod, setSelectedPayslipPeriod] = useState<string>("Aug 01 - Aug 15, 2026");
  const [selectedPayslipNet, setSelectedPayslipNet] = useState<number>(28080);
  const [payslipModalOpen, setPayslipModalOpen] = useState(false);

  useEffect(() => {
    essApi
      .myPayroll()
      .then((res) => {
        setPayrollData(res);
        if (res.net) setSelectedPayslipNet(res.net);
      })
      .catch(() => {});

    essApi
      .myRequests()
      .then((res) => {
        if (res?.requests?.length) {
          const payItems = res.requests
            .filter((r) => r.category.toLowerCase().includes("pay") || r.type.toLowerCase().includes("overtime") || r.type.toLowerCase().includes("payslip"))
            .map((r) => ({
              id: r.id,
              date: r.filed,
              isoDate: r.date_from || r.filed,
              type: r.type,
              status: r.status,
              statusRank: r.status === "Approved" || r.status === "Completed" ? 1 : 0,
              details: r.details,
            }));
          if (payItems.length > 0) {
            setPayRequests(payItems);
          }
        }
      })
      .catch(() => {});
  }, []);

  const currentNet = payrollData?.net ?? 28080;
  const currentGross = payrollData?.gross ?? 32500;
  const currentDeductions = payrollData?.deductions?.total ?? 4420;
  const nextPayout = payrollData?.nextPayout ?? "August 31, 2026";
  const payslipsList = useMemo(() => {
    return payrollData?.payslips?.length ? payrollData.payslips : myPayroll.payslips;
  }, [payrollData]);

  const payslipPage = usePagination(payslipsList, 4);

  const [payRequests, setPayRequests] = useState<any[]>([]);

  const [paySearch, setPaySearch] = useState("");
  const [payFilterType, setPayFilterType] = useState("all");
  const [paySort, setPaySort] = useState("date-desc");
  const [payType, setPayType] = useState("Payroll Clarification");
  const [payPeriodStart, setPayPeriodStart] = useState("");
  const [payPeriodEnd, setPayPeriodEnd] = useState("");
  const [payDetails, setPayDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const formatPeriodDisplay = (startStr: string, endStr: string) => {
    if (!startStr && !endStr) return "";
    try {
      const s = startStr ? new Date(startStr + "T00:00:00") : null;
      const e = endStr ? new Date(endStr + "T00:00:00") : null;
      if (s && e) {
        const sFmt = s.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        const eFmt = e.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        return `${sFmt} – ${eFmt}`;
      } else if (s) {
        return `From ${s.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
      }
    } catch {
      // fallback
    }
    return `${startStr} – ${endStr}`;
  };

  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [timelineOpen, setTimelineOpen] = useState(false);

  const filteredPayRequests = useMemo(() => {
    return payRequests
      .filter((r) => {
        const matchesSearch = !paySearch || r.type.toLowerCase().includes(paySearch.toLowerCase()) || r.status.toLowerCase().includes(paySearch.toLowerCase());
        const matchesType = payFilterType === "all" || r.type.toLowerCase().includes(payFilterType.toLowerCase());
        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        if (paySort === "date-desc") return b.isoDate.localeCompare(a.isoDate);
        if (paySort === "date-asc") return a.isoDate.localeCompare(b.isoDate);
        if (paySort === "status") return a.statusRank - b.statusRank;
        return 0;
      });
  }, [payRequests, paySearch, payFilterType, paySort]);

  const payPage = usePagination(filteredPayRequests);

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payDetails.trim()) {
      toast.error("Please enter inquiry details or claimed hours.");
      return;
    }
    const coveredPeriodText = payPeriodStart && payPeriodEnd
      ? formatPeriodDisplay(payPeriodStart, payPeriodEnd)
      : payPeriodStart || payPeriodEnd || "";

    try {
      setSubmitting(true);
      const res = await essApi.createRequest({
        category_code: "payroll",
        category_name: "Payroll",
        request_type: payType,
        date_from: payPeriodStart || undefined,
        date_to: payPeriodEnd || undefined,
        details: `${coveredPeriodText ? `Covered Period: ${coveredPeriodText}. ` : ""}${payDetails.trim()}`,
      });
      const todayStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      const isoStr = new Date().toISOString().slice(0, 10);
      const newReq = {
        id: res?.request?.request_code || `REQ-${Date.now().toString().slice(-4)}`,
        date: todayStr,
        isoDate: isoStr,
        type: payType,
        status: "Pending",
        statusRank: 0,
        details: `${coveredPeriodText ? `Period: ${coveredPeriodText}. ` : ""}${payDetails.trim()}`,
      };
      setPayRequests([newReq, ...payRequests]);
      toast.success(`${payType} submitted to Payroll Administration.`);
      setPayPeriodStart("");
      setPayPeriodEnd("");
      setPayDetails("");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit payroll inquiry.");
    } finally {
      setSubmitting(false);
    }
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
      {/* Executive Payroll Summary Hero Header */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/[0.04] shadow-sm">
        {/* Ambient Decorative Lighting */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-emerald-500/5 blur-3xl" />

        {/* Hero Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 bg-muted/30 px-6 py-4">
          <div>
            <h4 className="text-base font-bold font-display text-foreground tracking-tight">
              Compensation &amp; Payroll Summary
            </h4>
            <p className="text-xs text-muted-foreground">
              Official salary disbursement, tax withholdings, and statutory benefits
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">Next Payout:</span>
            <span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary">
              {nextPayout}
            </span>
          </div>
        </div>

        {/* Hero Metrics Strip (The 3 Numbers Prominently Featured as Headers) */}
        <div className="grid gap-4 p-6 sm:grid-cols-3">
          {/* Net Take-Home Pay */}
          <div className="rounded-xl border border-emerald-500/30 bg-background/60 p-5 backdrop-blur-xs shadow-2xs hover:border-emerald-500/50 transition-all">
            <p className="text-[11px] uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-400">
              Net Take-Home Pay
            </p>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold font-display text-emerald-600 dark:text-emerald-400 tracking-tight">
              ₱{currentNet.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Latest cut-off disbursement · Direct deposit
            </p>
          </div>

          {/* Total Gross Earnings */}
          <div className="rounded-xl border border-border/70 bg-background/60 p-5 backdrop-blur-xs shadow-2xs hover:border-primary/40 transition-all">
            <p className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground">
              Total Gross Earnings
            </p>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold font-display text-foreground tracking-tight">
              ₱{currentGross.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Basic salary, overtime &amp; taxable allowances
            </p>
          </div>

          {/* Statutory & Tax Deductions */}
          <div className="rounded-xl border border-border/70 bg-background/60 p-5 backdrop-blur-xs shadow-2xs hover:border-rose-500/30 transition-all">
            <p className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground">
              Statutory &amp; Tax Deductions
            </p>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold font-display text-rose-600 dark:text-rose-400 tracking-tight">
              -₱{currentDeductions.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              SSS, PhilHealth, Pag-IBIG &amp; withholding tax
            </p>
          </div>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl border border-border/70 shadow-2xs overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setActiveTab("payslips")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "payslips"
                ? "bg-primary text-primary-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Released Payslips</span>
            <span
              className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold leading-none ${
                activeTab === "payslips"
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-muted text-muted-foreground border border-border/60"
              }`}
            >
              {payslipsList.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("requests")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "requests"
                ? "bg-primary text-primary-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Payroll Requests &amp; Inquiries</span>
            {filteredPayRequests.length > 0 && (
              <span
                className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold leading-none ${
                  activeTab === "requests"
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground border border-border/60"
                }`}
              >
                {filteredPayRequests.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("benefits")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "benefits"
                ? "bg-primary text-primary-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Statutory Benefits &amp; Active Loans</span>
          </button>
        </div>
      </div>

      {/* Released Payslips Card */}
      {activeTab === "payslips" && (
        <Card className="border-border/70 shadow-xs">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-border/60">
          <div>
            <CardTitle className="font-display text-xl font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Released Payslips
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              View and download official itemized pay stubs.
            </p>
          </div>
          <Badge variant="outline" className="text-xs gap-1.5 bg-primary/10 text-primary border-primary/20 font-semibold px-2.5 py-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {payslipsList.length} Payslips Available
          </Badge>
        </CardHeader>

        <CardContent className="pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">Pay Period</TableHead>
                <TableHead className="w-[22%]">Status</TableHead>
                <TableHead className="w-[24%] text-right">Net Pay</TableHead>
                <TableHead className="w-[24%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payslipPage.pageItems.map((ps, idx) => (
                <TableRow key={idx} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium text-xs text-foreground">{ps.period}</TableCell>
                  <TableCell>
                    <EssStatusBadge status={ps.status} />
                  </TableCell>
                  <TableCell className="text-right text-xs font-semibold font-mono text-emerald-600 dark:text-emerald-400">
                    ₱{ps.net.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right py-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-xs font-medium text-primary hover:bg-primary/10 gap-1 cursor-pointer"
                      onClick={() => openPayslip(ps.period, ps.net)}
                    >
                      <Eye className="h-3.5 w-3.5" /> View Payslip
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            page={payslipPage.page}
            pageCount={payslipPage.pageCount}
            from={payslipPage.from}
            to={payslipPage.to}
            total={payslipPage.total}
            label="payslips"
            onPageChange={payslipPage.setPage}
          />
        </CardContent>
      </Card>
      )}

      {/* Statutory Benefits & Company Loans Section */}
      {activeTab === "benefits" && (
        <Card className="border-border/70 shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 gap-3">
          <div>
            <CardTitle className="font-display text-xl font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Statutory Benefits &amp; Active Loans
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Official government identification numbers, healthcare coverage, and active salary loan deduction schedules.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="text-xs shadow-xs gap-1.5"
            onClick={() => toast.info("Quarterly company salary loan application window opens next month.")}
          >
            <Landmark className="h-3.5 w-3.5 text-emerald-600" /> Apply for Salary Loan
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-border/70 p-4 space-y-1.5 shadow-xs bg-muted/10">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" /> SSS Number
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold border border-emerald-500/30">Active</span>
              </div>
              <p className="text-base font-mono font-bold text-foreground">**-*****67-8</p>
              <p className="text-xs text-muted-foreground">Monthly Contribution: ₱950.00</p>
            </div>

            <div className="rounded-xl border border-border/70 p-4 space-y-1.5 shadow-xs bg-muted/10">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
                  <HeartHandshake className="h-3.5 w-3.5 text-emerald-600" /> PhilHealth
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold border border-emerald-500/30">Active</span>
              </div>
              <p className="text-base font-mono font-bold text-foreground">**-*******01-2</p>
              <p className="text-xs text-muted-foreground">Monthly Premium: ₱450.00</p>
            </div>

            <div className="rounded-xl border border-border/70 p-4 space-y-1.5 shadow-xs bg-muted/10">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5 text-blue-600" /> Pag-IBIG (HDMF)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold border border-emerald-500/30">Active</span>
              </div>
              <p className="text-base font-mono font-bold text-foreground">****-****-*012</p>
              <p className="text-xs text-muted-foreground">Monthly Savings: ₱200.00</p>
            </div>

            <div className="rounded-xl border border-border/70 p-4 space-y-1.5 shadow-xs bg-muted/10">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
                  <Stethoscope className="h-3.5 w-3.5 text-purple-600" /> HMO Healthcare
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 font-semibold border border-purple-500/30">Maxicare</span>
              </div>
              <p className="text-base font-mono font-bold text-foreground">MX-****014</p>
              <p className="text-xs text-muted-foreground">MBL Coverage: ₱150,000 / yr</p>
            </div>
          </div>

          {/* Active Loans & Amortization Sub-card */}
          <div className="rounded-xl border border-border/70 p-4 bg-muted/20 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <Landmark className="h-4 w-4 text-emerald-600" /> Active Company / SSS Salary Loan
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Outstanding Balance: <strong className="text-foreground">₱5,400.00</strong> · Deduction: <strong className="text-rose-600">-₱450.00 / cut-off</strong> (12 of 24 terms completed)
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-background border border-border/80 self-start sm:self-auto">
                Next Deduction: {nextPayout}
              </span>
            </div>

            <div className="space-y-1.5 pt-1 border-t border-border/60">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Amortization Payoff Completion</span>
                <span className="text-primary font-mono">12 / 24 terms (50%)</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div className="bg-primary h-2 rounded-full transition-all" style={{ width: "50%" }} />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Projected final amortization payoff date: December 15, 2026.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      )}

      {/* Submit Payroll & My Payroll Requests - Unified Single Card */}
      {activeTab === "requests" && (
        <Card className="border-border/70 shadow-xs">
        <CardHeader className="border-b border-border/60 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="font-display text-xl font-semibold flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                Payroll Requests &amp; Inquiries
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Submit overtime claims, report salary discrepancies, and track your filed payroll requests in one place.
              </p>
            </div>
            <Badge variant="outline" className="text-xs gap-1.5 bg-primary/10 text-primary border-primary/20 font-semibold px-2.5 py-1 self-start sm:self-auto">
              <MessageSquareText className="h-3.5 w-3.5" />
              {filteredPayRequests.length} Filed Requests
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-8">
          {/* SECTION 1 (TOP): SUBMIT PAYROLL REQUEST FORM */}
          <div className="rounded-2xl border border-border/80 bg-muted/20 p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-1 border-b border-border/50">
              <div>
                <h4 className="text-sm font-bold font-display text-foreground flex items-center gap-2">
                  <Send className="h-4 w-4 text-primary" />
                  Submit New Payroll Request / Inquiry
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  File an overtime rendered claim, report a deduction discrepancy, or request certified payslip copies.
                </p>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono uppercase bg-background px-2.5 py-0.5 rounded-full border border-border/60 hidden sm:inline-block">
                Direct HR Routing
              </span>
            </div>

            <form onSubmit={handlePaySubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* 1. Request Type */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Request Type</Label>
                  <Select value={payType} onValueChange={setPayType}>
                    <SelectTrigger className="h-9 text-xs focus:border-primary bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Payroll Clarification" className="text-xs">Payroll / Deduction Clarification</SelectItem>
                      <SelectItem value="Overtime Request" className="text-xs">Overtime Rendered Claim</SelectItem>
                      <SelectItem value="Night Differential Dispute" className="text-xs">Night Differential Dispute</SelectItem>
                      <SelectItem value="Payslip Copy Request" className="text-xs">Certified Payslip Copy Request</SelectItem>
                      <SelectItem value="Bank Account Update" className="text-xs">Bank / Payroll Account Update</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 2. Covered Pay Period */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      Covered Pay Period
                    </Label>
                    {payPeriodStart && payPeriodEnd && (
                      <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {formatPeriodDisplay(payPeriodStart, payPeriodEnd)}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      value={payPeriodStart}
                      onChange={(e) => setPayPeriodStart(e.target.value)}
                      onClick={(e) => (e.currentTarget as any).showPicker?.()}
                      className="cursor-pointer text-xs h-9 bg-background"
                      placeholder="Start date"
                      required
                    />
                    <Input
                      type="date"
                      value={payPeriodEnd}
                      min={payPeriodStart || undefined}
                      onChange={(e) => setPayPeriodEnd(e.target.value)}
                      onClick={(e) => (e.currentTarget as any).showPicker?.()}
                      className="cursor-pointer text-xs h-9 bg-background"
                      placeholder="End date"
                      required
                    />
                  </div>
                  {/* Presets */}
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">Presets:</span>
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        const y = now.getFullYear();
                        const m = String(now.getMonth() + 1).padStart(2, "0");
                        setPayPeriodStart(`${y}-${m}-01`);
                        setPayPeriodEnd(`${y}-${m}-15`);
                      }}
                      className="text-[11px] text-primary hover:underline hover:text-primary/80 transition-colors cursor-pointer"
                    >
                      1st–15th Cut-off
                    </button>
                    <span className="text-muted-foreground/40 text-[10px]">·</span>
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        const y = now.getFullYear();
                        const m = String(now.getMonth() + 1).padStart(2, "0");
                        const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
                        setPayPeriodStart(`${y}-${m}-16`);
                        setPayPeriodEnd(`${y}-${m}-${lastDay}`);
                      }}
                      className="text-[11px] text-primary hover:underline hover:text-primary/80 transition-colors cursor-pointer"
                    >
                      16th–End Cut-off
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. Inquiry Details Textarea */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Inquiry Details / Hours Claimed</Label>
                <Textarea
                  rows={2}
                  placeholder="Describe your inquiry, specify overtime rendered with date/hours, or note any discrepancies..."
                  value={payDetails}
                  onChange={(e) => setPayDetails(e.target.value)}
                  className="text-xs focus:border-primary bg-background resize-none"
                  required
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="gap-1.5 text-xs h-9 px-5 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-xs cursor-pointer w-full sm:w-auto"
                >
                  <Send className="h-3.5 w-3.5" /> {submitting ? "Submitting..." : "Submit Payroll Request"}
                </Button>
              </div>
            </form>
          </div>

          {/* SECTION 2 (UNDERNEATH): MY PAYROLL REQUESTS TABLE */}
          <div className="space-y-3.5 pt-2 border-t border-border/70">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold font-display text-foreground flex items-center gap-2">
                  <MessageSquareText className="h-4 w-4 text-primary" />
                  My Payroll Requests History
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Track the audit, verification, and resolution status of your filed payroll inquiries.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[120px] sm:min-w-[150px]">
                  <Search className="absolute left-2.5 top-2.5 h-3 w-3 text-muted-foreground" />
                  <Input
                    placeholder="Search requests..."
                    value={paySearch}
                    onChange={(e) => setPaySearch(e.target.value)}
                    className="h-8 pl-7 text-xs bg-background"
                  />
                </div>
                <Select value={payFilterType} onValueChange={setPayFilterType}>
                  <SelectTrigger className="h-8 w-[125px] text-xs bg-background">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">All Types</SelectItem>
                    <SelectItem value="Overtime" className="text-xs">Overtime</SelectItem>
                    <SelectItem value="Clarification" className="text-xs">Clarification</SelectItem>
                    <SelectItem value="Dispute" className="text-xs">Dispute</SelectItem>
                    <SelectItem value="Payslip" className="text-xs">Payslip Copy</SelectItem>
                    <SelectItem value="Loan" className="text-xs">Loan Request</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={paySort} onValueChange={setPaySort}>
                  <SelectTrigger className="h-8 w-[125px] text-xs bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc" className="text-xs">Newest first</SelectItem>
                    <SelectItem value="date-asc" className="text-xs">Oldest first</SelectItem>
                    <SelectItem value="status" className="text-xs">Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-xl border border-border/70 overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="w-[18%] text-xs">Request ID</TableHead>
                    <TableHead className="w-[16%] text-xs">Date Filed</TableHead>
                    <TableHead className="w-[24%] text-xs">Request Type</TableHead>
                    <TableHead className="w-[24%] text-xs">Details / Period</TableHead>
                    <TableHead className="w-[10%] text-xs">Status</TableHead>
                    <TableHead className="w-[8%] text-right text-xs">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payPage.pageItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground text-xs">
                        No payroll requests filed yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    payPage.pageItems.map((r, idx) => (
                      <TableRow
                        key={idx}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleRowClick(r)}
                      >
                        <TableCell className="text-xs font-mono font-medium text-foreground">{r.id}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{r.date}</TableCell>
                        <TableCell className="text-xs font-semibold">{r.type}</TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[240px] truncate" title={r.details}>
                          {r.details}
                        </TableCell>
                        <TableCell>
                          <EssStatusBadge status={r.status} />
                        </TableCell>
                        <TableCell className="text-right py-1">
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-primary cursor-pointer">
                            Timeline →
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <TablePagination
              page={payPage.page}
              pageCount={payPage.pageCount}
              from={payPage.from}
              to={payPage.to}
              total={payPage.total}
              label="requests"
              onPageChange={payPage.setPage}
            />
          </div>
        </CardContent>
      </Card>
      )}

      {/* Modals */}
      <PayslipViewerModal
        open={payslipModalOpen}
        onOpenChange={setPayslipModalOpen}
        period={selectedPayslipPeriod}
        netPay={selectedPayslipNet}
        onInquiryClick={(period) => {
          setPayDetails(`Inquiry regarding payslip period: ${period}`);
          setPayType("Payroll Clarification");
          setActiveTab("requests");
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
