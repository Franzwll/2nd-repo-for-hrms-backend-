import { useState, useMemo, useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import {
  Award,
  ArrowRight,
  ArrowUpDown,
  BookOpen,
  Building,
  CheckCircle2,
  ChevronDown,
  CircleCheckBig,
  ClipboardList,
  Clock,
  Cog,
  Download,
  Eye,
  FileCheck,
  FileText,
  ListChecks,
  Lock,
  LockOpen,
  Plus,
  RotateCcw,
  Search,
  Send,
  Settings2,
  Trash2,
  TrendingUp,
  Upload,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/portal/PageHeader";
import { TablePagination } from "@/components/ui/table-pagination";
import { usePagination } from "@/hooks/usePagination";
import { StatCard } from "@/components/portal/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  essRequests as seed,
  requestCategories,
  essActivityLog,
  essRequests,
  myAttendance,
  myBenefits,
  myLeaveBalances,
  myPayroll,
  myProfile,
  mySchedule,
  myPerformance,
  myLearningCourses,
  myEmployeeDocuments,
  wireframeActivity,
  useEssCategories,
  addCategoryEntry,
  updateCategoryEntry,
  removeCategoryEntry,
  setCategoryOpen,
  type ESSRequest,
} from "@/data/ess";
import { departments, employees } from "@/data/hr";
import { useSort, SortHead } from "@/components/portal/sortable";
import { ListBody } from "@/components/portal/ListBody";
import { ListEmptyState } from "@/components/portal/ListEmptyState";

type Status = ESSRequest["status"] | "Returned for Clarification";
type Row = Omit<ESSRequest, "status" | "note"> & {
  status: Status;
  note?: string | undefined;
  returnedCount?: number | undefined;
};

const statusClass: Record<Status, string> = {
  Pending: "border-warning/40 bg-warning/20 text-warning-foreground",
  "Under Review": "border-gold/40 bg-gold-soft text-foreground",
  Approved: "border-success/30 bg-success/15 text-success",
  Rejected: "border-destructive/30 bg-destructive/15 text-destructive",
  Completed: "border-border bg-muted text-muted-foreground",
  "Returned for Clarification": "border-primary/30 bg-primary/10 text-primary",
};

const reportOptions = [
  "Request Summary Report",
  "Attendance Request Summary",
  "Leave Request Summary",
  "Payroll Request Summary",
  "Document Request Summary",
  "Average Processing Time",
  "Branch Performance",
  "Approval Performance",
  "ESS Usage Statistics",
];

export function EssManagement({ role }: { role: "superadmin" | "admin" | "employee" }) {
  if (role === "employee") {
    return <EmployeeEss />;
  }
  return <AdminEssManagement role={role} />;
}

export function EmployeeEss() {
  const [activeTab, setActiveTab] = useState("overview");
  const [category, setCategory] = useState(requestCategories[0]!.name);

  const searchStr = useRouterState({ select: (s) => s.location.searchStr });

  useEffect(() => {
    const params = new URLSearchParams(searchStr || "");
    const cat = params.get("category");
    if (cat === "Attendance") setActiveTab("attendance");
    else if (cat === "Payroll") setActiveTab("payroll");
    else if (cat === "Performance") setActiveTab("performance");
    else if (cat === "Documents") setActiveTab("documents");
    else if (!cat) setActiveTab("overview");
  }, [searchStr]);

  const [activities] = useState(wireframeActivity);

  const [raSearch, setRaSearch] = useState("");
  const [raCategory, setRaCategory] = useState("all");
  const [raSort, setRaSort] = useState("date-desc");

  const [attRequests, setAttRequests] = useState([
    {
      date: "Jul 20, 2026",
      isoDate: "2026-07-20",
      type: "Missed Time Out",
      status: "Pending",
      statusRank: 0,
    },
    {
      date: "Jun 12, 2026",
      isoDate: "2026-06-12",
      type: "Time In Correction",
      status: "Approved",
      statusRank: 1,
    },
  ]);
  const [attSearch, setAttSearch] = useState("");
  const [attSort, setAttSort] = useState("date-desc");
  const [attType, setAttType] = useState("Time In Correction");
  const [attDate, setAttDate] = useState("");
  const [attDetails, setAttDetails] = useState("");

  const [payRequests, setPayRequests] = useState([
    {
      date: "Jul 28, 2026",
      isoDate: "2026-07-28",
      type: "Overtime Request",
      status: "Pending",
      statusRank: 0,
    },
    {
      date: "Jun 18, 2026",
      isoDate: "2026-06-18",
      type: "Overtime Request",
      status: "Approved",
      statusRank: 1,
    },
    {
      date: "Jun 01, 2026",
      isoDate: "2026-06-01",
      type: "Payslip Request",
      status: "Released",
      statusRank: 1,
    },
  ]);
  const [paySearch, setPaySearch] = useState("");
  const [paySort, setPaySort] = useState("date-desc");
  const [payType, setPayType] = useState("Payroll Clarification");
  const [payPeriod, setPayPeriod] = useState("");
  const [payDetails, setPayDetails] = useState("");

  const [docRequests, setDocRequests] = useState([
    {
      date: "Jun 01, 2026",
      isoDate: "2026-06-01",
      type: "Certificate of Employment",
      status: "Released",
      statusRank: 1,
    },
    {
      date: "Feb 03, 2026",
      isoDate: "2026-02-03",
      type: "HMO Certification",
      status: "Released",
      statusRank: 1,
    },
  ]);
  const [docSearch, setDocSearch] = useState("");
  const [docSort, setDocSort] = useState("date-desc");
  const [docType, setDocType] = useState("BIR Form 2316");
  const [docPurpose, setDocPurpose] = useState("");

  const [promoPosition, setPromoPosition] = useState("");
  const [promoJustification, setPromoJustification] = useState("");
  const [lastPromo, setLastPromo] = useState(myPerformance.lastPromotionRequest);

  const filteredActivities = useMemo(() => {
    return activities
      .filter((item) => {
        if (raCategory !== "all" && item.category !== raCategory) return false;
        if (
          raSearch &&
          !`${item.category} ${item.type} ${item.status}`
            .toLowerCase()
            .includes(raSearch.toLowerCase())
        )
          return false;
        return true;
      })
      .sort((a, b) => {
        if (raSort === "date-desc") return b.isoDate.localeCompare(a.isoDate);
        if (raSort === "date-asc") return a.isoDate.localeCompare(b.isoDate);
        if (raSort === "status") return a.statusRank - b.statusRank;
        if (raSort === "category") return a.category.localeCompare(b.category);
        return 0;
      });
  }, [activities, raSearch, raCategory, raSort]);

  const filteredAttRequests = useMemo(() => {
    return attRequests
      .filter(
        (r) =>
          !attSearch ||
          r.type.toLowerCase().includes(attSearch.toLowerCase()) ||
          r.status.toLowerCase().includes(attSearch.toLowerCase()),
      )
      .sort((a, b) => {
        if (attSort === "date-desc") return b.isoDate.localeCompare(a.isoDate);
        if (attSort === "date-asc") return a.isoDate.localeCompare(b.isoDate);
        if (attSort === "status") return a.statusRank - b.statusRank;
        return 0;
      });
  }, [attRequests, attSearch, attSort]);

  const filteredPayRequests = useMemo(() => {
    return payRequests
      .filter(
        (r) =>
          !paySearch ||
          r.type.toLowerCase().includes(paySearch.toLowerCase()) ||
          r.status.toLowerCase().includes(paySearch.toLowerCase()),
      )
      .sort((a, b) => {
        if (paySort === "date-desc") return b.isoDate.localeCompare(a.isoDate);
        if (paySort === "date-asc") return a.isoDate.localeCompare(b.isoDate);
        if (paySort === "status") return a.statusRank - b.statusRank;
        return 0;
      });
  }, [payRequests, paySearch, paySort]);

  const filteredDocRequests = useMemo(() => {
    return docRequests
      .filter(
        (r) =>
          !docSearch ||
          r.type.toLowerCase().includes(docSearch.toLowerCase()) ||
          r.status.toLowerCase().includes(docSearch.toLowerCase()),
      )
      .sort((a, b) => {
        if (docSort === "date-desc") return b.isoDate.localeCompare(a.isoDate);
        if (docSort === "date-asc") return a.isoDate.localeCompare(b.isoDate);
        if (docSort === "status") return a.statusRank - b.statusRank;
        return 0;
      });
  }, [docRequests, docSearch, docSort]);

  const raPage = usePagination(filteredActivities);
  const attPage = usePagination(filteredAttRequests);
  const payPage = usePagination(filteredPayRequests);
  const docPage = usePagination(filteredDocRequests);

  const mine = essRequests.filter((r) => r.employeeId === myProfile.employeeId);
  const minePage = usePagination(mine);

  const handleAttSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const todayStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const isoStr = new Date().toISOString().slice(0, 10);
    const newReq = {
      date: todayStr,
      isoDate: isoStr,
      type: attType,
      status: "Pending" as const,
      statusRank: 0,
    };
    setAttRequests([newReq, ...attRequests]);
    toast.success(`${attType} request submitted successfully.`);
    setAttDetails("");
  };

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const todayStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const isoStr = new Date().toISOString().slice(0, 10);
    const newReq = {
      date: todayStr,
      isoDate: isoStr,
      type: payType,
      status: "Pending" as const,
      statusRank: 0,
    };
    setPayRequests([newReq, ...payRequests]);
    toast.success(`${payType} request submitted successfully.`);
    setPayPeriod("");
    setPayDetails("");
  };

  const handleDocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const todayStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const isoStr = new Date().toISOString().slice(0, 10);
    const newReq = {
      date: todayStr,
      isoDate: isoStr,
      type: docType,
      status: "Pending" as const,
      statusRank: 0,
    };
    setDocRequests([newReq, ...docRequests]);
    toast.success(`${docType} request submitted successfully.`);
    setDocPurpose("");
  };

  const handlePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoPosition) return;
    const todayStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    setLastPromo({ position: promoPosition, status: "Pending", date: todayStr });
    toast.success("Promotion request submitted successfully.");
    setPromoPosition("");
    setPromoJustification("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
            Pending
          </Badge>
        );
      case "Approved":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
          >
            Approved
          </Badge>
        );
      case "Completed":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
          >
            Completed
          </Badge>
        );
      case "Available":
      case "Released":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">
            {status}
          </Badge>
        );
      case "Submitted":
        return (
          <Badge
            variant="outline"
            className="bg-purple-500/10 text-purple-600 border-purple-500/30"
          >
            Submitted
          </Badge>
        );
      case "Missing":
        return (
          <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/30">
            Missing
          </Badge>
        );
      case "Rejected":
        return (
          <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/30">
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const isDedicatedModule = ["attendance", "payroll", "performance", "documents"].includes(
    activeTab,
  );

  const getPageTitle = () => {
    switch (activeTab) {
      case "attendance":
        return "Employee Self-Service · Attendance";
      case "payroll":
        return "Employee Self-Service · Payroll";
      case "performance":
        return "Employee Self-Service · Performance";
      case "documents":
        return "Employee Self-Service · Company Documents";
      default:
        return "EMPLOYEE SELF-SERVICE";
    }
  };

  const getPageDescription = () => {
    switch (activeTab) {
      case "attendance":
        return "View attendance logs, daily time-in/out records, and file correction requests.";
      case "payroll":
        return "View net pay information, payslips history, breakdown details, and submit inquiries.";
      case "performance":
        return "Track LMS learning modules, view evaluation scores, competency rating, and promotion applications.";
      case "documents":
        return "View submitted, missing, and available employee documents and request official HR records.";
      default:
        return "View your employee information, activities, and HR services.";
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Employee Portal"
        title={getPageTitle()}
        description={getPageDescription()}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        {!isDedicatedModule && (
          <TabsList className="flex h-auto flex-wrap justify-start border-b border-border bg-transparent p-0">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:border-primary data-[state=active]:bg-muted rounded-md px-4 py-2 text-sm font-medium"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="schedule"
              className="data-[state=active]:border-primary data-[state=active]:bg-muted rounded-md px-4 py-2 text-sm font-medium"
            >
              Schedule
            </TabsTrigger>
            <TabsTrigger
              value="leave"
              className="data-[state=active]:border-primary data-[state=active]:bg-muted rounded-md px-4 py-2 text-sm font-medium"
            >
              Leave Balances
            </TabsTrigger>
            <TabsTrigger
              value="benefits"
              className="data-[state=active]:border-primary data-[state=active]:bg-muted rounded-md px-4 py-2 text-sm font-medium"
            >
              Benefits &amp; Loans
            </TabsTrigger>
            <TabsTrigger
              value="submit"
              className="data-[state=active]:border-primary data-[state=active]:bg-muted rounded-md px-4 py-2 text-sm font-medium"
            >
              Submit Request
            </TabsTrigger>
            <TabsTrigger
              value="tracking"
              className="data-[state=active]:border-primary data-[state=active]:bg-muted rounded-md px-4 py-2 text-sm font-medium"
            >
              All Requests
            </TabsTrigger>
          </TabsList>
        )}

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border/70 flex flex-col justify-between">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">
                    Attendance
                  </span>
                  <div className="p-2 text-primary">
                    <Clock className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold font-display text-foreground">
                    {myAttendance.monthly.present} Present{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      · {myAttendance.monthly.late} Late
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Today Time In: {myAttendance.today.timeIn}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4 w-full justify-between p-0 h-auto font-medium text-primary hover:bg-transparent hover:text-primary/80"
                  onClick={() => setActiveTab("attendance")}
                >
                  <span>View →</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/70 flex flex-col justify-between">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">
                    Payroll
                  </span>
                  <div className="rounded-md bg-emerald-500/10 p-2 text-emerald-600">
                    <FileText className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold font-display text-foreground">
                    ₱{myPayroll.net.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Next Payout: {myPayroll.nextPayout}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4 w-full justify-between p-0 h-auto font-medium text-primary hover:bg-transparent hover:text-primary/80"
                  onClick={() => setActiveTab("payroll")}
                >
                  <span>View →</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/70 flex flex-col justify-between">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">
                    Performance
                  </span>
                  <div className="rounded-md bg-purple-500/10 p-2 text-purple-600">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold font-display text-foreground">
                    {myPerformance.lmsCoursesCompleted}/{myPerformance.lmsCoursesAssigned} Courses
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Avg Score: {myPerformance.averageScore || "90%"} ·{" "}
                    {myPerformance.competencyLevel}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4 w-full justify-between p-0 h-auto font-medium text-primary hover:bg-transparent hover:text-primary/80"
                  onClick={() => setActiveTab("performance")}
                >
                  <span>View →</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/70 flex flex-col justify-between">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">
                    Documents
                  </span>
                  <div className="rounded-md bg-blue-500/10 p-2 text-blue-600">
                    <FileCheck className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold font-display text-foreground">
                    {
                      myEmployeeDocuments.filter(
                        (d) =>
                          d.status === "Submitted" ||
                          d.status === "Available" ||
                          d.status === "Released",
                      ).length
                    }{" "}
                    Submitted
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
                    {myEmployeeDocuments.filter((d) => d.status === "Missing").length} Missing
                    requirement
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4 w-full justify-between p-0 h-auto font-medium text-primary hover:bg-transparent hover:text-primary/80"
                  onClick={() => setActiveTab("documents")}
                >
                  <span>View →</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/70">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3">
              <div>
                <CardTitle className="font-display text-xl font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  RECENT ACTIVITIES
                </CardTitle>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search activity..."
                    value={raSearch}
                    onChange={(e) => setRaSearch(e.target.value)}
                    className="pl-8 h-9 w-[160px] sm:w-[200px]"
                  />
                </div>
                <Select value={raCategory} onValueChange={setRaCategory}>
                  <SelectTrigger className="h-9 w-[150px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Attendance">Attendance</SelectItem>
                    <SelectItem value="Payroll">Payroll</SelectItem>
                    <SelectItem value="Performance">Performance</SelectItem>
                    <SelectItem value="Documents">Documents</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={raSort} onValueChange={setRaSort}>
                  <SelectTrigger className="h-9 w-[140px]">
                    <ArrowUpDown className="mr-2 h-3.5 w-3.5" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">Newest first</SelectItem>
                    <SelectItem value="date-asc">Oldest first</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Activity</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {raPage.pageItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        No activity matching filter.
                      </TableCell>
                    </TableRow>
                  ) : (
                    raPage.pageItems.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium text-sm">{item.type}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {item.category}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{item.date}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <TablePagination
                page={raPage.page}
                pageCount={raPage.pageCount}
                from={raPage.from}
                to={raPage.to}
                total={raPage.total}
                label="activities"
                onPageChange={raPage.setPage}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border/70">
              <CardContent className="p-4">
                <p className="eyebrow">Today Time In</p>
                <p className="mt-1 text-2xl font-bold font-display text-emerald-600">
                  {myAttendance.today.timeIn}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Time Out: {myAttendance.today.timeOut}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardContent className="p-4">
                <p className="eyebrow">Monthly Attendance</p>
                <p className="mt-1 text-2xl font-bold font-display">
                  {myAttendance.monthly.present} Days Present
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {myAttendance.monthly.late} Late · {myAttendance.monthly.absent} Absent
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardContent className="p-4">
                <p className="eyebrow">Overtime Hours</p>
                <p className="mt-1 text-2xl font-bold font-display text-primary">
                  {myAttendance.monthly.overtimeHours} hrs
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Approved overtime this month</p>
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardContent className="p-4">
                <p className="eyebrow">Break Shift Status</p>
                <p className="mt-1 text-sm font-semibold">
                  {myAttendance.today.breakIn} – {myAttendance.today.breakOut}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Lunch break completed</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="font-display text-xl font-semibold">
                Attendance Log History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time In</TableHead>
                    <TableHead>Time Out</TableHead>
                    <TableHead>Hours Worked</TableHead>
                    <TableHead>Remark</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myAttendance.history.map((h, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium text-xs">{h.date}</TableCell>
                      <TableCell className="text-xs">{h.in}</TableCell>
                      <TableCell className="text-xs">{h.out}</TableCell>
                      <TableCell className="text-xs">{h.hours} hrs</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            h.remark.includes("Present")
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs"
                              : h.remark.includes("Late")
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs"
                                : "bg-purple-500/10 text-purple-600 border-purple-500/30 text-xs"
                          }
                        >
                          {h.remark}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border/70">
              <CardHeader>
                <CardTitle className="font-display text-xl font-semibold">
                  Submit Attendance Correction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAttSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Request Type</Label>
                    <Select value={attType} onValueChange={setAttType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Time In Correction">Time In Correction</SelectItem>
                        <SelectItem value="Time Out Correction">Time Out Correction</SelectItem>
                        <SelectItem value="Missed Time In/Out">Missed Time In/Out</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date of Attendance</Label>
                    <Input
                      type="date"
                      value={attDate}
                      onChange={(e) => setAttDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Details / Reason</Label>
                    <Textarea
                      rows={3}
                      placeholder="Explain the correction needed..."
                      value={attDetails}
                      onChange={(e) => setAttDetails(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <Send className="mr-2 h-4 w-4" /> Submit Request
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3">
                <CardTitle className="font-display text-xl font-semibold">
                  My Attendance Requests
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search..."
                    value={attSearch}
                    onChange={(e) => setAttSearch(e.target.value)}
                    className="h-8 w-[120px]"
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
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attPage.pageItems.map((r, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="text-xs">{r.date}</TableCell>
                        <TableCell className="text-sm">{r.type}</TableCell>
                        <TableCell>{getStatusBadge(r.status)}</TableCell>
                      </TableRow>
                    ))}
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
        </TabsContent>

        <TabsContent value="payroll" className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-border/70">
              <CardContent className="p-4">
                <p className="eyebrow">Net Pay (Latest Cut-off)</p>
                <p className="mt-1 text-3xl font-bold font-display text-emerald-600">
                  ₱{myPayroll.net.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Next payout: {myPayroll.nextPayout}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardContent className="p-4">
                <p className="eyebrow">Gross Salary</p>
                <p className="mt-1 text-2xl font-bold font-display">
                  ₱{myPayroll.gross.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Includes basic pay, OT &amp; allowances
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardContent className="p-4">
                <p className="eyebrow">Total Deductions</p>
                <p className="mt-1 text-2xl font-bold font-display text-rose-600">
                  ₱{(myPayroll.gross - myPayroll.net).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  SSS, PhilHealth, Pag-IBIG &amp; Tax
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border/70">
              <CardHeader>
                <CardTitle className="font-display text-xl font-semibold">
                  Pay Breakdown &amp; Deductions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Earnings
                  </h4>
                  <div className="space-y-1.5 border-t border-border pt-2 text-sm">
                    {myPayroll.breakdown.map((item, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-medium text-foreground">
                          ₱{item.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Deductions
                  </h4>
                  <div className="space-y-1.5 border-t border-border pt-2 text-sm">
                    {myPayroll.deductions.map((item, i) => (
                      <div
                        key={i}
                        className="flex justify-between text-rose-600 dark:text-rose-400"
                      >
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-medium">-₱{item.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardHeader>
                <CardTitle className="font-display text-xl font-semibold">
                  Released Payslips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pay Period</TableHead>
                      <TableHead>Net Pay</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myPayroll.payslips.map((ps, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium text-xs">{ps.period}</TableCell>
                        <TableCell className="text-xs font-semibold">
                          ₱{ps.net.toLocaleString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(ps.status)}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-xs font-medium text-primary hover:bg-primary/10"
                            onClick={() => toast.success(`Downloading payslip for ${ps.period}`)}
                          >
                            <Download className="mr-1 h-3.5 w-3.5" /> PDF
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border/70">
              <CardHeader>
                <CardTitle className="font-display text-xl font-semibold">
                  Submit Payroll Inquiry / Request
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePaySubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Request Type</Label>
                    <Select value={payType} onValueChange={setPayType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Payroll Clarification">Payroll Clarification</SelectItem>
                        <SelectItem value="Overtime Request">Overtime Request</SelectItem>
                        <SelectItem value="Payslip Request">Payslip Copy Request</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Pay Period</Label>
                    <Input
                      placeholder="e.g., July 1–15, 2026"
                      value={payPeriod}
                      onChange={(e) => setPayPeriod(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Details</Label>
                    <Textarea
                      rows={3}
                      placeholder="Describe your payroll inquiry or overtime breakdown..."
                      value={payDetails}
                      onChange={(e) => setPayDetails(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <Send className="mr-2 h-4 w-4" /> Submit Request
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3">
                <CardTitle className="font-display text-xl font-semibold">
                  My Payroll Requests
                </CardTitle>
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
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payPage.pageItems.map((r, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="text-xs">{r.date}</TableCell>
                        <TableCell className="text-sm">{r.type}</TableCell>
                        <TableCell>{getStatusBadge(r.status)}</TableCell>
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
        </TabsContent>

        <TabsContent value="performance" className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border/70">
              <CardContent className="p-4">
                <div className="eyebrow flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" /> Last Review
                </div>
                <p className="mt-1 text-sm font-semibold">{myPerformance.lastReview}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Next review: {myPerformance.nextReview}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardContent className="p-4">
                <div className="eyebrow flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-primary" /> Competency Rating
                </div>
                <p className="mt-1 text-sm font-semibold">{myPerformance.competencyLevel}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Average Score: {myPerformance.averageScore}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardContent className="p-4">
                <div className="eyebrow flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-primary" /> LMS Courses
                </div>
                <p className="mt-1 text-sm font-semibold">
                  {myPerformance.lmsCoursesCompleted} of {myPerformance.lmsCoursesAssigned}{" "}
                  Completed
                </p>
                <Progress
                  value={
                    (myPerformance.lmsCoursesCompleted / myPerformance.lmsCoursesAssigned) * 100
                  }
                  className="mt-2 h-1.5"
                />
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardContent className="p-4">
                <div className="eyebrow flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5 text-primary" /> Salary Grade
                </div>
                <p className="mt-1 text-sm font-semibold">
                  {myPerformance.salaryGrade} · {myPerformance.salaryStep}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Position: {myProfile.position}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="font-display text-xl font-semibold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Learning Modules &amp; Course Scores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Date Completed</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myLearningCourses.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium text-sm">{c.title}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{c.category}</TableCell>
                      <TableCell>{getStatusBadge(c.status)}</TableCell>
                      <TableCell className="text-xs font-semibold">{c.score}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {c.completedDate}
                      </TableCell>
                      <TableCell>
                        {c.status === "Completed" ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-xs text-emerald-600 hover:bg-emerald-50"
                            onClick={() => toast.success(`Viewing certificate for ${c.title}`)}
                          >
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Certificate
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs"
                            onClick={() => toast.info(`Resuming ${c.title}`)}
                          >
                            Continue
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="font-display text-xl font-semibold">
                Promotion Request
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Submit a request for promotion consideration to be reviewed by your department head
                and HR.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePromoSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Position Applied For</Label>
                    <Input
                      placeholder="e.g., Senior Line Cook"
                      value={promoPosition}
                      onChange={(e) => setPromoPosition(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Current Position</Label>
                    <Input value={myProfile.position} disabled className="bg-muted" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Justification &amp; Accomplishments</Label>
                  <Textarea
                    rows={3}
                    placeholder="Explain your qualifications and key contributions..."
                    value={promoJustification}
                    onChange={(e) => setPromoJustification(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit">
                  <Send className="mr-2 h-4 w-4" /> Submit Promotion Request
                </Button>
              </form>

              <div className="mt-6 border-t border-border pt-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Last Promotion Request Status:
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{lastPromo.position}</span>
                  {getStatusBadge(lastPromo.status)}
                  <span className="text-xs text-muted-foreground">— {lastPromo.date}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-border/70">
              <CardContent className="p-4">
                <p className="eyebrow">Submitted Documents</p>
                <p className="mt-1 text-2xl font-bold font-display text-emerald-600">
                  {
                    myEmployeeDocuments.filter(
                      (d) =>
                        d.status === "Submitted" ||
                        d.status === "Available" ||
                        d.status === "Released",
                    ).length
                  }{" "}
                  File(s)
                </p>
                <p className="text-xs text-muted-foreground mt-1">Verified by HR Administration</p>
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardContent className="p-4">
                <p className="eyebrow">Missing Requirements</p>
                <p className="mt-1 text-2xl font-bold font-display text-rose-600">
                  {myEmployeeDocuments.filter((d) => d.status === "Missing").length} Action Item
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Please submit missing documents
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardContent className="p-4">
                <p className="eyebrow">Available for Download</p>
                <p className="mt-1 text-2xl font-bold font-display text-primary">
                  {
                    myEmployeeDocuments.filter(
                      (d) => d.status === "Available" || d.status === "Released",
                    ).length
                  }{" "}
                  Documents
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  COE, BIR 2316 &amp; Certifications
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="font-display text-xl font-semibold flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-primary" />
                My Employment Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myEmployeeDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium text-sm">{doc.title}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {doc.category}
                      </TableCell>
                      <TableCell>{getStatusBadge(doc.status)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{doc.date}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{doc.size}</TableCell>
                      <TableCell>
                        {doc.status === "Available" || doc.status === "Released" ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-xs text-primary hover:bg-primary/10"
                            onClick={() => toast.success(`Downloading ${doc.title}`)}
                          >
                            <Download className="mr-1 h-3.5 w-3.5" /> Download
                          </Button>
                        ) : doc.status === "Missing" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs border-amber-500/50 text-amber-600 hover:bg-amber-50"
                            onClick={() => toast.info(`Opening upload modal for ${doc.title}`)}
                          >
                            <Upload className="mr-1 h-3.5 w-3.5" /> Upload
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">On File</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border/70">
              <CardHeader>
                <CardTitle className="font-display text-xl font-semibold">
                  Request a Document
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDocSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Document Type</Label>
                    <Select value={docType} onValueChange={setDocType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BIR Form 2316">BIR Form 2316</SelectItem>
                        <SelectItem value="Certificate of Employment">
                          Certificate of Employment
                        </SelectItem>
                        <SelectItem value="Certificate of No Pending Case">
                          Certificate of No Pending Case
                        </SelectItem>
                        <SelectItem value="Service Record">Service Record</SelectItem>
                        <SelectItem value="Clearance Certificate">Clearance Certificate</SelectItem>
                        <SelectItem value="Back Pay Computation">Back Pay Computation</SelectItem>
                        <SelectItem value="HMO Certification">HMO Certification</SelectItem>
                        <SelectItem value="Employment Contract Copy">
                          Employment Contract Copy
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Purpose</Label>
                    <Input
                      placeholder="e.g., Bank loan application, visa requirement..."
                      value={docPurpose}
                      onChange={(e) => setDocPurpose(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <Send className="mr-2 h-4 w-4" /> Submit Request
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3">
                <CardTitle className="font-display text-xl font-semibold">
                  My Document Requests
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search..."
                    value={docSearch}
                    onChange={(e) => setDocSearch(e.target.value)}
                    className="h-8 w-[120px]"
                  />
                  <Select value={docSort} onValueChange={setDocSort}>
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
                      <TableHead>Document</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {docPage.pageItems.map((r, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="text-sm font-medium">{r.type}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{r.date}</TableCell>
                        <TableCell>{getStatusBadge(r.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  page={docPage.page}
                  pageCount={docPage.pageCount}
                  from={docPage.from}
                  to={docPage.to}
                  total={docPage.total}
                  label="documents"
                  onPageChange={docPage.setPage}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="mt-6">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <h2 className="font-display text-2xl font-semibold">Weekly Schedule</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {mySchedule.map((s) => (
                  <div key={s.day} className="rounded-md border border-border p-4">
                    <p className="eyebrow">{s.day}</p>
                    <p className="mt-1 text-sm font-medium">{s.shift}</p>
                    <p className="text-xs text-muted-foreground">{s.time}</p>
                    <p className="text-xs text-muted-foreground">{s.location}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leave" className="mt-6">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <h2 className="font-display text-2xl font-semibold">Leave Balances</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {myLeaveBalances.map((l) => (
                  <div key={l.type} className="rounded-md border border-border p-4">
                    <div className="flex justify-between text-sm">
                      <span>{l.type}</span>
                      <span className="font-medium">
                        {l.total - l.used} / {l.total} days
                      </span>
                    </div>
                    <Progress value={((l.total - l.used) / l.total) * 100} className="mt-2 h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benefits" className="mt-6">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <h2 className="font-display text-2xl font-semibold">
                Government &amp; Company Benefits
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {myBenefits.map((b) => (
                  <div key={b.name} className="rounded-md border border-border p-4">
                    <p className="eyebrow">{b.name}</p>
                    <p className="mt-1 text-sm font-medium">{b.value}</p>
                    <p className="text-xs text-muted-foreground">{b.note}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-md border border-border p-4">
                <p className="eyebrow">Company Loan</p>
                <p className="mt-1 text-sm">
                  Outstanding balance ₱5,400 · ₱450 / cut-off · 12 of 24 paid
                </p>
                <Progress value={50} className="mt-2 h-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submit" className="mt-6">
          <Card className="border-border/70">
            <CardContent className="space-y-4 p-6">
              <h2 className="font-display text-2xl font-semibold">Submit General Request</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
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
                <div className="space-y-2">
                  <Label>Request type</Label>
                  <Select key={category}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {(requestCategories.find((c) => c.name === category)?.types ?? []).map(
                        (t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date from</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Date to</Label>
                  <Input type="date" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Reason / details</Label>
                <Textarea rows={4} placeholder="Provide details for HR..." />
              </div>
              <div className="space-y-2">
                <Label>Supporting document</Label>
                <Input type="file" />
              </div>
              <Button onClick={() => toast.success("Request submitted to HR")}>
                Submit request
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="mt-6">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <h2 className="font-display text-2xl font-semibold">All My Requests</h2>
              <Table className="mt-4">
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Filed</TableHead>
                    <TableHead>Assigned HR</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {minePage.pageItems.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-xs font-medium">{r.id}</TableCell>
                      <TableCell className="text-sm">{r.type}</TableCell>
                      <TableCell className="text-xs">{r.filed}</TableCell>
                      <TableCell className="text-xs">{r.assignedTo}</TableCell>
                      <TableCell>{getStatusBadge(r.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                page={minePage.page}
                pageCount={minePage.pageCount}
                from={minePage.from}
                to={minePage.to}
                total={minePage.total}
                label="requests"
                onPageChange={minePage.setPage}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function AdminEssManagement({ role }: { role: "superadmin" | "admin" }) {
  const [rows, setRows] = useState<Row[]>(seed);
  const categories = useEssCategories();
  const [newCategory, setNewCategory] = useState<{
    name: string;
    description: string;
    types: string[];
  }>({
    name: "",
    description: "",
    types: [],
  });
  const [newTypeInput, setNewTypeInput] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{
    name: string;
    description: string;
    types: string[];
  }>({
    name: "",
    description: "",
    types: [],
  });
  const [editTypeInput, setEditTypeInput] = useState("");
  const [dept, setDept] = useState("all");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [reviewDecision, setReviewDecision] = useState<
    "Approved" | "Rejected" | "Returned for Clarification"
  >("Approved");
  const [reviewNote, setReviewNote] = useState("");
  const [confirmReject, setConfirmReject] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [behalfDept, setBehalfDept] = useState("all");
  const [behalfCategory, setBehalfCategory] = useState("");
  /** Collapsible new-category panel at the top of Category Management. */
  const [newCategoryOpen, setNewCategoryOpen] = useState(false);

  const filtered = rows.filter((r) => {
    if (dept !== "all" && r.department !== dept) return false;
    if (status !== "all" && r.status !== status) return false;
    if (category !== "all" && r.category !== category) return false;
    if (search && !`${r.employee} ${r.type} ${r.id}`.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const behalfEmployees = employees.filter(
    (e) => behalfDept === "all" || e.department === behalfDept,
  );

  type RowKey =
    "id" | "employee" | "department" | "category" | "type" | "filed" | "assignedTo" | "status";

  const {
    sort: rowSort,
    toggle: toggleRowSort,
    sorted: sortedFiltered,
  } = useSort<Row, RowKey>(filtered, {
    id: (r) => r.id,
    employee: (r) => r.employee,
    department: (r) => r.department,
    category: (r) => r.category,
    type: (r) => r.type,
    filed: (r) => r.filed,
    assignedTo: (r) => r.assignedTo,
    status: (r) => r.status,
  });

  const [logModule, setLogModule] = useState("all");
  const [logDept, setLogDept] = useState("all");
  const [logCategory, setLogCategory] = useState("all");
  const [logSearch, setLogSearch] = useState("");

  const logModules = Array.from(new Set(essActivityLog.map((l) => l.module)));
  const logCategories = Array.from(new Set(essActivityLog.map((l) => l.category)));

  const filteredLogs = essActivityLog.filter((l) => {
    if (logModule !== "all" && l.module !== logModule) return false;
    if (logDept !== "all" && l.department !== logDept) return false;
    if (logCategory !== "all" && l.category !== logCategory) return false;
    if (
      logSearch &&
      !`${l.user} ${l.action} ${l.requestId}`.toLowerCase().includes(logSearch.toLowerCase())
    )
      return false;
    return true;
  });

  type LogKey =
    "timestamp" | "user" | "action" | "module" | "category" | "department" | "requestId";

  const {
    sort: logSort,
    toggle: toggleLogSort,
    sorted: sortedLogs,
  } = useSort<(typeof essActivityLog)[number], LogKey>(filteredLogs, {
    timestamp: (l) => l.timestamp,
    user: (l) => l.user,
    action: (l) => l.action,
    module: (l) => l.module,
    category: (l) => l.category,
    department: (l) => l.department,
    requestId: (l) => l.requestId,
  });

  const requestPage = usePagination(sortedFiltered);
  const logPage = usePagination(sortedLogs);

  const setReqStatus = (id: string, s: Status, note?: string | undefined) =>
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: s,
              note,
              returnedCount:
                s === "Returned for Clarification" ? (r.returnedCount ?? 0) + 1 : r.returnedCount,
            }
          : r,
      ),
    );

  const bulk = (s: Status) => {
    setRows((prev) => prev.map((r) => (selected.includes(r.id) ? { ...r, status: s } : r)));
    toast.success(`${selected.length} request(s) ${s.toLowerCase()}`);
    setSelected([]);
  };

  const addCategory = () => {
    if (!newCategory.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    if (categories.some((c) => c.name.toLowerCase() === newCategory.name.trim().toLowerCase())) {
      toast.error("A category with this name already exists");
      return;
    }
    addCategoryEntry({
      name: newCategory.name.trim(),
      description: newCategory.description.trim(),
      types: newCategory.types,
    });
    setNewCategory({ name: "", description: "", types: [] });
    setNewTypeInput("");
    toast.success("Category added");
  };

  const addNewCategoryType = () => {
    const t = newTypeInput.trim();
    if (!t) return;
    if (newCategory.types.some((x) => x.toLowerCase() === t.toLowerCase())) {
      setNewTypeInput("");
      return;
    }
    setNewCategory((p) => ({ ...p, types: [...p.types, t] }));
    setNewTypeInput("");
  };

  const removeNewCategoryType = (t: string) =>
    setNewCategory((p) => ({ ...p, types: p.types.filter((x) => x !== t) }));

  const addEditCategoryType = () => {
    const t = editTypeInput.trim();
    if (!t) return;
    if (editDraft.types.some((x) => x.toLowerCase() === t.toLowerCase())) {
      setEditTypeInput("");
      return;
    }
    setEditDraft((p) => ({ ...p, types: [...p.types, t] }));
    setEditTypeInput("");
  };

  const removeEditCategoryType = (t: string) =>
    setEditDraft((p) => ({ ...p, types: p.types.filter((x) => x !== t) }));

  const startEditCategory = (c: { name: string; description: string; types: string[] }) => {
    setEditingCategory(c.name);
    setEditDraft({ name: c.name, description: c.description, types: [...c.types] });
    setEditTypeInput("");
  };

  const cancelEditCategory = () => setEditingCategory(null);

  const saveEditCategory = () => {
    if (!editingCategory) return;
    if (!editDraft.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    updateCategoryEntry(editingCategory, {
      name: editDraft.name.trim(),
      description: editDraft.description.trim(),
      types: editDraft.types,
    });
    if (category === editingCategory) setCategory(editDraft.name.trim());
    setEditingCategory(null);
    toast.success("Category updated");
  };

  const removeCategory = (name: string) => {
    removeCategoryEntry(name);
    if (category === name) setCategory("all");
    toast.success("Category removed");
  };

  const count = (s: Status) => rows.filter((r) => r.status === s).length;

  const reviewRow = rows.find((r) => r.id === reviewId) ?? null;

  // Opening a review takes ownership: Pending auto-promotes to Under Review.
  const openReview = (id: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id && r.status === "Pending" ? { ...r, status: "Under Review" } : r,
      ),
    );
    setReviewId(id);
    setReviewDecision("Approved");
    setReviewNote("");
    setConfirmReject(false);
  };

  // Employee answered a returned request → back into the reviewer's queue.
  const employeeReplied = (id: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: "Under Review", note: "Employee submitted clarification" }
          : r,
      ),
    );
    toast.success(`${id} returned to review queue`);
  };

  const submitReview = () => {
    if (!reviewRow) return;
    if (reviewDecision !== "Approved" && !reviewNote.trim()) {
      toast.error(
        reviewDecision === "Rejected"
          ? "A reason for rejection is required"
          : "Add a note explaining what clarification is needed",
      );
      return;
    }
    if (reviewDecision === "Rejected" && !confirmReject) {
      setConfirmReject(true);
      return;
    }
    setReqStatus(reviewRow.id, reviewDecision, reviewNote.trim() || undefined);
    toast.success(
      reviewDecision === "Returned for Clarification"
        ? `${reviewRow.id} returned to the employee`
        : `${reviewRow.id} marked as ${reviewDecision.toLowerCase()}`,
    );
    setReviewId(null);
    setConfirmReject(false);
  };

  return (
    <div>
      <PageHeader
        eyebrow={role === "superadmin" ? "Super Admin · Core HR" : "Admin · Core HR"}
        title="ESS Management"
        description={
          role === "superadmin"
            ? "Organization-wide monitoring, bulk processing, workflow and policy configuration."
            : "Process, approve and track employee self-service requests for your departments."
        }
        actions={
          <Button size="sm" variant="outline" onClick={() => setReportsOpen(true)}>
            <FileText className="mr-2 h-4 w-4" /> Generate reports
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard
          label="Total Requests"
          value={rows.length}
          icon={ClipboardList}
          tone="primary"
          onClick={() => setStatus("all")}
        />
        <StatCard
          label="Pending"
          value={count("Pending")}
          icon={ClipboardList}
          tone="caution"
          onClick={() => setStatus("Pending")}
        />
        <StatCard
          label="Under Review"
          value={count("Under Review")}
          icon={Eye}
          tone="gold"
          onClick={() => setStatus("Under Review")}
        />
        <StatCard
          label="Returned"
          value={count("Returned for Clarification")}
          icon={RotateCcw}
          hint="Awaiting employee response"
          onClick={() => setStatus("Returned for Clarification")}
        />
        <StatCard
          label="Approved"
          value={count("Approved")}
          icon={CheckCircle2}
          tone="success"
          onClick={() => setStatus("Approved")}
        />
        <StatCard
          label="Completed"
          value={count("Completed")}
          icon={CircleCheckBig}
          onClick={() => setStatus("Completed")}
        />
      </div>

      <Tabs defaultValue="requests" className="mt-6">
        <TabsList className="flex h-auto flex-wrap justify-start">
          <TabsTrigger className="flex items-center gap-1.5" value="requests">
            <ListChecks className="h-3.5 w-3.5" /> Request Queue
          </TabsTrigger>
          {role === "superadmin" && (
            <TabsTrigger className="flex items-center gap-1.5" value="config">
              <Settings2 className="h-3.5 w-3.5" /> ESS Administration
            </TabsTrigger>
          )}
          {role === "superadmin" && (
            <TabsTrigger className="flex items-center gap-1.5" value="audit">
              <FileCheck className="h-3.5 w-3.5" /> Audit &amp; Compliance
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="requests" className="mt-4">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
                  <Send className="h-5 w-5 text-primary" /> Employee Requests
                </h2>
                <div className="flex flex-wrap gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="w-56 pl-9"
                      placeholder="Search employee or request…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <Select value={dept} onValueChange={setDept}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All departments</SelectItem>
                      {departments.map((d) => (
                        <SelectItem key={d.code} value={d.name}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      {[
                        "Pending",
                        "Under Review",
                        "Returned for Clarification",
                        "Approved",
                        "Rejected",
                        "Completed",
                      ].map((s) => (
                        <SelectItem key={s} value={s}>
                          {s === "Returned for Clarification" ? "Returned" : s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.name} value={c.name}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {role === "superadmin" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-success/40 bg-success/10 text-success hover:bg-success/20 hover:text-success"
                        disabled={selected.length === 0}
                        onClick={() => bulk("Approved")}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Bulk approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
                        disabled={selected.length === 0}
                        onClick={() => bulk("Rejected")}
                      >
                        <XCircle className="mr-2 h-4 w-4" /> Bulk reject
                      </Button>
                    </>
                  )}

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" /> Create on behalf
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="font-display text-2xl">
                          Create Request on Behalf of Employee
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label>Department</Label>
                          <Select value={behalfDept} onValueChange={setBehalfDept}>
                            <SelectTrigger>
                              <SelectValue placeholder="All departments" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All departments</SelectItem>
                              {departments.map((d) => (
                                <SelectItem key={d.code} value={d.name}>
                                  {d.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Employee</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select employee" />
                            </SelectTrigger>
                            <SelectContent>
                              {behalfEmployees.map((e) => (
                                <SelectItem key={e.id} value={e.id}>
                                  {e.name} — {e.department}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Request category</Label>
                          <Select value={behalfCategory} onValueChange={setBehalfCategory}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((c) => (
                                <SelectItem key={c.name} value={c.name}>
                                  {c.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Details</Label>
                          <Textarea
                            rows={3}
                            placeholder={
                              categories.find((c) => c.name === behalfCategory)?.description ||
                              "Walk-in / phone request details…"
                            }
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          onClick={() => toast.success("Request filed on behalf of employee")}
                        >
                          File request
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="mt-4 overflow-x-auto">
                <ListBody>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {role === "superadmin" && <TableHead className="w-10" />}
                        <SortHead sortKey="id" sort={rowSort} onSort={toggleRowSort}>
                          Request
                        </SortHead>
                        <SortHead sortKey="employee" sort={rowSort} onSort={toggleRowSort}>
                          Employee
                        </SortHead>
                        <SortHead sortKey="type" sort={rowSort} onSort={toggleRowSort}>
                          Category / Type
                        </SortHead>
                        <SortHead sortKey="filed" sort={rowSort} onSort={toggleRowSort}>
                          Filed
                        </SortHead>
                        <SortHead sortKey="assignedTo" sort={rowSort} onSort={toggleRowSort}>
                          Assigned To
                        </SortHead>
                        <SortHead sortKey="status" sort={rowSort} onSort={toggleRowSort}>
                          Status
                        </SortHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requestPage.pageItems.map((r) => (
                        <TableRow key={r.id}>
                          {role === "superadmin" && (
                            <TableCell>
                              <Checkbox
                                checked={selected.includes(r.id)}
                                onCheckedChange={() =>
                                  setSelected((p) =>
                                    p.includes(r.id) ? p.filter((x) => x !== r.id) : [...p, r.id],
                                  )
                                }
                              />
                            </TableCell>
                          )}
                          <TableCell className="text-xs font-medium">{r.id}</TableCell>
                          <TableCell className="text-sm">
                            <p>{r.employee}</p>
                            <p className="text-xs text-muted-foreground">{r.department}</p>
                          </TableCell>
                          <TableCell className="text-sm">
                            <p>{r.type}</p>
                            <p className="text-xs text-muted-foreground">{r.category}</p>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{r.filed}</TableCell>
                          <TableCell className="text-xs">{r.assignedTo}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusClass[r.status]}>
                              {r.status === "Returned for Clarification" ? "Returned" : r.status}
                            </Badge>
                            {r.status === "Returned for Clarification" && (
                              <p className="mt-1 text-[11px] text-muted-foreground">
                                Awaiting employee response
                              </p>
                            )}
                            {(r.returnedCount ?? 0) > 1 && (
                              <p className="mt-1 text-[11px] text-caution">
                                Returned {r.returnedCount}×
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-1">
                              {r.status === "Returned for Clarification" ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => employeeReplied(r.id)}
                                >
                                  <RotateCcw className="mr-2 h-4 w-4" /> Employee replied
                                </Button>
                              ) : r.status === "Pending" || r.status === "Under Review" ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-success/40 bg-success/10 text-success hover:bg-success/20 hover:text-success"
                                    title="Approve"
                                    onClick={() => {
                                      setReqStatus(r.id, "Approved");
                                      toast.success(`${r.id} approved`);
                                    }}
                                  >
                                    <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
                                    title="Reject (opens review — a reason is required)"
                                    onClick={() => {
                                      openReview(r.id);
                                      setReviewDecision("Rejected");
                                    }}
                                  >
                                    <XCircle className="mr-2 h-4 w-4" /> Reject
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openReview(r.id)}
                                  >
                                    <Eye className="mr-2 h-4 w-4" /> Review
                                  </Button>
                                </>
                              ) : (
                                <span className="text-xs text-muted-foreground">Closed</span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {requestPage.pageItems.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={role === "superadmin" ? 8 : 7} className="py-8">
                            <ListEmptyState placeholder="Search employee or request…" />
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ListBody>
                <TablePagination
                  page={requestPage.page}
                  pageCount={requestPage.pageCount}
                  from={requestPage.from}
                  to={requestPage.to}
                  total={requestPage.total}
                  label="requests"
                  onPageChange={requestPage.setPage}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {role === "superadmin" && (
          <TabsContent value="config" className="mt-4">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-border/70">
                <CardContent className="p-6">
                  <div>
                    <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
                      <Cog className="h-5 w-5 text-primary" /> Category Management
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Create, edit and remove ESS request categories. Description shows to employees
                      as the request-form placeholder.
                    </p>
                  </div>
                  <div className="mt-3 rounded-md border border-dashed border-border">
                    <button
                      type="button"
                      onClick={() => setNewCategoryOpen((v) => !v)}
                      aria-expanded={newCategoryOpen}
                      className="flex w-full cursor-pointer items-center justify-between gap-2 p-3 text-left"
                    >
                      <span className="eyebrow flex items-center gap-1.5">
                        <ListChecks className="h-3.5 w-3.5" /> New category
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-muted-foreground transition-transform ${
                          newCategoryOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {newCategoryOpen && (
                      <div className="space-y-2 border-t border-border/70 p-3">
                        <Input
                          className="h-8 text-sm"
                          value={newCategory.name}
                          onChange={(e) => setNewCategory((p) => ({ ...p, name: e.target.value }))}
                          placeholder="Category name"
                        />
                        <Textarea
                          rows={2}
                          className="text-xs"
                          value={newCategory.description}
                          onChange={(e) =>
                            setNewCategory((p) => ({ ...p, description: e.target.value }))
                          }
                          placeholder="Optional description — shown to employees as placeholder text"
                        />
                        <div className="space-y-1.5">
                          <Label className="text-[0.7rem]">Request types</Label>
                          <div className="flex flex-wrap gap-1.5">
                            {newCategory.types.map((t) => (
                              <Badge key={t} variant="secondary" className="gap-1 text-[0.65rem]">
                                {t}
                                <button
                                  type="button"
                                  aria-label={`Remove ${t}`}
                                  onClick={() => removeNewCategoryType(t)}
                                  className="ml-0.5 rounded-full hover:text-destructive"
                                >
                                  <XCircle className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                            {newCategory.types.length === 0 && (
                              <span className="text-[0.65rem] text-muted-foreground">
                                No types yet
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1.5">
                            <Input
                              className="h-7 text-xs"
                              value={newTypeInput}
                              onChange={(e) => setNewTypeInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  addNewCategoryType();
                                }
                              }}
                              placeholder="Add a request type"
                            />
                            <Button size="sm" variant="outline" onClick={addNewCategoryType}>
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        <Button size="sm" onClick={addCategory}>
                          <Plus className="mr-2 h-3.5 w-3.5" /> Add category
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 space-y-1.5">
                    {categories.map((c) =>
                      editingCategory === c.name ? (
                        <div
                          key={c.name}
                          className="space-y-2 rounded-md border border-primary/40 bg-primary/5 p-2.5"
                        >
                          <Input
                            className="h-8 text-sm"
                            value={editDraft.name}
                            onChange={(e) => setEditDraft((p) => ({ ...p, name: e.target.value }))}
                            placeholder="Category name"
                          />
                          <Textarea
                            rows={2}
                            className="text-xs"
                            value={editDraft.description}
                            onChange={(e) =>
                              setEditDraft((p) => ({ ...p, description: e.target.value }))
                            }
                            placeholder="Optional description shown to employees"
                          />
                          <div className="space-y-1.5">
                            <Label className="text-[0.7rem]">Request types</Label>
                            <div className="flex flex-wrap gap-1.5">
                              {editDraft.types.map((t) => (
                                <Badge key={t} variant="secondary" className="gap-1 text-[0.65rem]">
                                  {t}
                                  <button
                                    type="button"
                                    aria-label={`Remove ${t}`}
                                    onClick={() => removeEditCategoryType(t)}
                                    className="ml-0.5 rounded-full hover:text-destructive"
                                  >
                                    <XCircle className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                              {editDraft.types.length === 0 && (
                                <span className="text-[0.65rem] text-muted-foreground">
                                  No types yet
                                </span>
                              )}
                            </div>
                            <div className="flex gap-1.5">
                              <Input
                                className="h-7 text-xs"
                                value={editTypeInput}
                                onChange={(e) => setEditTypeInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    addEditCategoryType();
                                  }
                                }}
                                placeholder="Add a request type"
                              />
                              <Button size="sm" variant="outline" onClick={addEditCategoryType}>
                                <Plus className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={cancelEditCategory}>
                              Cancel
                            </Button>
                            <Button size="sm" onClick={saveEditCategory}>
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div
                          key={c.name}
                          className={`flex flex-wrap items-center justify-between gap-2 rounded-md border p-2.5 ${
                            c.open === false ? "border-border bg-muted/40" : "border-border"
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="flex items-center gap-1.5 text-sm font-medium">
                              <span className="truncate">{c.name}</span>
                              {(c as any).custom && (
                                <Badge variant="secondary" className="shrink-0 text-[0.6rem]">
                                  Custom
                                </Badge>
                              )}
                              {c.open === false && (
                                <Badge
                                  variant="outline"
                                  className="shrink-0 border-destructive/30 bg-destructive/10 text-[0.6rem] text-destructive"
                                >
                                  Closed
                                </Badge>
                              )}
                            </p>
                            <p className="truncate text-[0.7rem] text-muted-foreground">
                              {c.description || "No description"}
                            </p>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {c.types.length > 0 ? (
                                c.types.map((t) => (
                                  <Badge
                                    key={t}
                                    variant="outline"
                                    className="text-[0.6rem] font-normal"
                                  >
                                    {t}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-[0.6rem] text-muted-foreground">
                                  No request types
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label={`Edit ${c.name}`}
                              onClick={() => startEditCategory(c)}
                            >
                              <Settings2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className={c.open === false ? "text-destructive" : "text-success"}
                              aria-label={
                                c.open === false
                                  ? `Open ${c.name} for requests`
                                  : `Close ${c.name} for requests`
                              }
                              title={
                                c.open === false
                                  ? "Closed — click to accept new requests"
                                  : "Open — click to stop accepting new requests"
                              }
                              onClick={() => {
                                const next = c.open === false;
                                setCategoryOpen(c.name, next);
                                toast.success(
                                  next ? `${c.name} opened` : `${c.name} closed for new requests`,
                                );
                              }}
                            >
                              {c.open === false ? (
                                <Lock className="h-3.5 w-3.5" />
                              ) : (
                                <LockOpen className="h-3.5 w-3.5" />
                              )}
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-destructive"
                              aria-label={`Remove ${c.name}`}
                              onClick={() => removeCategory(c.name)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/70">
                <CardContent className="space-y-5 p-6">
                  <div>
                    <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
                      <Settings2 className="h-5 w-5 text-primary" />
                      Request Management Settings
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Intake rules, approval routing, SLA and notifications applied to every open
                      category.
                    </p>
                  </div>

                  <div className="rounded-md border border-border p-3">
                    <p className="eyebrow">Intake</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {categories.filter((c) => c.open !== false).length} of {categories.length}{" "}
                      categories are open for new requests. Close a category in the list to stop
                      accepting requests without deleting it.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Approval levels</Label>
                    <Select defaultValue="2">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Single level (HR Officer)</SelectItem>
                        <SelectItem value="2">Two levels (Supervisor → HR)</SelectItem>
                        <SelectItem value="3">Three levels (Supervisor → HR → GM)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>SLA — first response (hrs)</Label>
                      <Input type="number" defaultValue={8} />
                    </div>
                    <div className="space-y-2">
                      <Label>SLA — resolution (hrs)</Label>
                      <Input type="number" defaultValue={48} />
                    </div>
                  </div>
                  {[
                    "Auto-assign by department",
                    "Escalate on SLA breach",
                    "Auto-close requests resolved for 7 days",
                    "Email notifications",
                    "In-system notifications",
                    "Require attachment for leave with pay",
                  ].map((s) => (
                    <div key={s} className="flex items-center justify-between">
                      <span className="text-sm">{s}</span>
                      <Switch defaultChecked />
                    </div>
                  ))}
                  <Button onClick={() => toast.success("ESS configuration saved")}>
                    <Cog className="mr-2 h-4 w-4" /> Save configuration
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {role === "superadmin" && (
          <TabsContent value="audit" className="mt-4">
            <Card className="border-border/70">
              <CardContent className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
                    <Clock className="h-5 w-5 text-primary" /> ESS Activity Log
                  </h2>
                  <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        className="w-56 pl-9"
                        placeholder="Search user, action, request…"
                        value={logSearch}
                        onChange={(e) => setLogSearch(e.target.value)}
                      />
                    </div>
                    <Select value={logModule} onValueChange={setLogModule}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="All modules" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All modules</SelectItem>
                        {logModules.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={logDept} onValueChange={setLogDept}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="All departments" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All departments</SelectItem>
                        {departments.map((d) => (
                          <SelectItem key={d.code} value={d.name}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={logCategory} onValueChange={setLogCategory}>
                      <SelectTrigger className="w-44">
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All categories</SelectItem>
                        {logCategories.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-4 overflow-x-auto">
                  <ListBody>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <SortHead sortKey="timestamp" sort={logSort} onSort={toggleLogSort}>
                            Timestamp
                          </SortHead>
                          <SortHead sortKey="user" sort={logSort} onSort={toggleLogSort}>
                            User
                          </SortHead>
                          <SortHead sortKey="action" sort={logSort} onSort={toggleLogSort}>
                            Action
                          </SortHead>
                          <SortHead sortKey="module" sort={logSort} onSort={toggleLogSort}>
                            Module
                          </SortHead>
                          <SortHead sortKey="category" sort={logSort} onSort={toggleLogSort}>
                            Category / Type
                          </SortHead>
                          <SortHead sortKey="department" sort={logSort} onSort={toggleLogSort}>
                            Department
                          </SortHead>
                          <SortHead sortKey="requestId" sort={logSort} onSort={toggleLogSort}>
                            Request ID
                          </SortHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {logPage.pageItems.map((a) => (
                          <TableRow key={a.id}>
                            <TableCell className="text-xs">{a.timestamp}</TableCell>
                            <TableCell className="text-xs">{a.user}</TableCell>
                            <TableCell className="text-sm">{a.action}</TableCell>
                            <TableCell className="text-xs">{a.module}</TableCell>
                            <TableCell className="text-xs">{a.category}</TableCell>
                            <TableCell className="text-xs">{a.department}</TableCell>
                            <TableCell className="text-xs font-medium">{a.requestId}</TableCell>
                          </TableRow>
                        ))}
                        {logPage.pageItems.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={7} className="py-8">
                              <ListEmptyState placeholder="Search user, action, request…" />
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </ListBody>
                  <TablePagination
                    page={logPage.page}
                    pageCount={logPage.pageCount}
                    from={logPage.from}
                    to={logPage.to}
                    total={logPage.total}
                    label="log entries"
                    onPageChange={logPage.setPage}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={reviewId !== null} onOpenChange={(open) => !open && setReviewId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              Review Request {reviewRow?.id}
            </DialogTitle>
          </DialogHeader>
          {reviewRow && (
            <div className="space-y-4">
              <div className="rounded-md border border-border p-3 text-sm">
                <p>
                  <span className="text-muted-foreground">Employee:</span> {reviewRow.employee} (
                  {reviewRow.department})
                </p>
                <p>
                  <span className="text-muted-foreground">Request:</span> {reviewRow.type} —{" "}
                  {reviewRow.category}
                </p>
                <p>
                  <span className="text-muted-foreground">Filed:</span> {reviewRow.filed}
                </p>
                {reviewRow.note && (
                  <p className="mt-1 text-xs text-muted-foreground">Note: {reviewRow.note}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Decision</Label>
                <RadioGroup
                  value={reviewDecision}
                  onValueChange={(v) => {
                    setReviewDecision(v as typeof reviewDecision);
                    setConfirmReject(false);
                  }}
                  className="gap-2"
                >
                  {(
                    [
                      {
                        value: "Approved",
                        id: "decision-approve",
                        label: "Approve",
                        help: "Employee is notified and the request is finalised.",
                        active: "border-success/50 bg-success/10",
                      },
                      {
                        value: "Returned for Clarification",
                        id: "decision-clarify",
                        label: "Request clarification",
                        help: "Sent back to the employee — they can edit and resubmit the same request.",
                        active: "border-primary/50 bg-primary/10",
                      },
                      {
                        value: "Rejected",
                        id: "decision-reject",
                        label: "Reject",
                        help: "Request is closed permanently; the employee must file a new one.",
                        active: "border-destructive/50 bg-destructive/10",
                      },
                    ] as const
                  ).map((o) => (
                    <label
                      key={o.value}
                      htmlFor={o.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors ${
                        reviewDecision === o.value ? o.active : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <RadioGroupItem value={o.value} id={o.id} className="mt-0.5" />
                      <span>
                        <span className="block text-sm font-medium">{o.label}</span>
                        <span className="block text-xs text-muted-foreground">{o.help}</span>
                      </span>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>
                  {reviewDecision === "Rejected"
                    ? "Reason for rejection (required)"
                    : reviewDecision === "Returned for Clarification"
                      ? "What do you need from the employee? (required)"
                      : "Note (optional)"}
                </Label>
                <Textarea
                  rows={3}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder={
                    reviewDecision === "Returned for Clarification"
                      ? "e.g. Please attach the medical certificate for 12–13 Aug."
                      : reviewDecision === "Rejected"
                        ? "e.g. Leave credits are insufficient for the requested dates."
                        : "Add remarks for the audit trail…"
                  }
                />
                {reviewDecision !== "Approved" && reviewNote.trim() && (
                  <div className="rounded-md border border-dashed border-border p-2.5">
                    <p className="eyebrow">Employee will see</p>
                    <p className="mt-1 text-xs text-muted-foreground">{reviewNote}</p>
                  </div>
                )}
              </div>

              {confirmReject && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                  Rejecting closes this request permanently. Press “Confirm rejection” to continue,
                  or switch to “Request clarification” if the employee can still fix it.
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewId(null)}>
              Cancel
            </Button>
            <Button
              variant={reviewDecision === "Rejected" ? "destructive" : "default"}
              onClick={submitReview}
            >
              {reviewDecision === "Rejected"
                ? confirmReject
                  ? "Confirm rejection"
                  : "Reject request"
                : reviewDecision === "Returned for Clarification"
                  ? "Return to employee"
                  : "Approve request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={reportsOpen} onOpenChange={setReportsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Generate Reports</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {(role === "superadmin"
              ? reportOptions
              : reportOptions.filter(
                  (r) =>
                    ![
                      "Branch Performance",
                      "Approval Performance",
                      "ESS Usage Statistics",
                    ].includes(r),
                )
            ).map((r) => (
              <div
                key={r}
                className="flex items-center justify-between rounded-md border border-border p-3"
              >
                <span className="text-sm">{r}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    toast.success(`${r} generated`);
                    setReportsOpen(false);
                  }}
                >
                  Generate
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
