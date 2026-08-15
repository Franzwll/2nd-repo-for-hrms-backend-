import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  Clock,
  FileText,
  TrendingUp,
  FileCheck,
  ArrowRight,
  Search,
  ArrowUpDown,
  Filter,
  Calendar,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  myAttendance,
  myPayroll,
  myPerformance,
  myEmployeeDocuments,
  wireframeActivity,
} from "@/data/ess";
import { RequestTimelineModal, type RequestItem } from "@/components/modules/ess/modals/RequestTimelineModal";

interface EssOverviewTabProps {
  onNavigateTab?: (tab: string) => void;
  onOpenClock: () => void;
  onOpenLeave: () => void;
  onOpenPayslip: () => void;
  onOpenDocRequest: () => void;
}

export function EssOverviewTab({
  onOpenClock,
  onOpenLeave,
  onOpenPayslip,
  onOpenDocRequest,
}: EssOverviewTabProps) {
  const [activities, setActivities] = useState(wireframeActivity);
  const [raSearch, setRaSearch] = useState("");
  const [raCategory, setRaCategory] = useState("all");
  const [raSort, setRaSort] = useState("date-desc");
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [timelineOpen, setTimelineOpen] = useState(false);

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

  const raPage = usePagination(filteredActivities);

  const handleRowClick = (item: any) => {
    setSelectedRequest({
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      type: item.type,
      category: item.category,
      date: item.date,
      isoDate: item.isoDate,
      status: item.status,
      assignedTo: "Juan Dela Cruz (HR Admin)",
      details: "Self-service employee request logged into system.",
    });
    setTimelineOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 4 Feature Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Attendance Card */}
        <Card className="border-border/70 flex flex-col justify-between hover:border-primary/50 transition-all shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Attendance</span>
              <div className="rounded-md bg-primary/10 p-2 text-primary">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold font-display text-foreground">
                {myAttendance.monthly.present} Present <span className="text-sm font-normal text-muted-foreground">· {myAttendance.monthly.late} Late</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">Today Time In: <strong className="text-foreground">{myAttendance.today.timeIn}</strong></p>
            </div>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="mt-4 w-full justify-between p-0 h-auto font-medium text-primary hover:bg-transparent hover:text-primary/80"
            >
              <Link to="/employee/ess" search={{ category: "Attendance" }}>
                <span>View Attendance Log →</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Payroll Card */}
        <Card className="border-border/70 flex flex-col justify-between hover:border-primary/50 transition-all shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Payroll</span>
              <div className="rounded-md bg-emerald-500/10 p-2 text-emerald-600">
                <FileText className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold font-display text-emerald-600 dark:text-emerald-400">
                ₱{myPayroll.net.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Next Payout: <strong className="text-foreground">{myPayroll.nextPayout}</strong></p>
            </div>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="mt-4 w-full justify-between p-0 h-auto font-medium text-primary hover:bg-transparent hover:text-primary/80"
            >
              <Link to="/employee/ess" search={{ category: "Payroll" }}>
                <span>View Pay Breakdown →</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Performance Card */}
        <Card className="border-border/70 flex flex-col justify-between hover:border-primary/50 transition-all shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Performance</span>
              <div className="rounded-md bg-purple-500/10 p-2 text-purple-600">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold font-display text-foreground">
                {myPerformance.lmsCoursesCompleted}/{myPerformance.lmsCoursesAssigned} Courses
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Avg Score: <strong className="text-foreground">{myPerformance.averageScore || "90%"}</strong> · {myPerformance.competencyLevel}
              </p>
            </div>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="mt-4 w-full justify-between p-0 h-auto font-medium text-primary hover:bg-transparent hover:text-primary/80"
            >
              <Link to="/employee/ess" search={{ category: "Performance" }}>
                <span>LMS &amp; Scores →</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Documents Card */}
        <Card className="border-border/70 flex flex-col justify-between hover:border-primary/50 transition-all shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Documents</span>
              <div className="rounded-md bg-blue-500/10 p-2 text-blue-600">
                <FileCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold font-display text-foreground">
                {myEmployeeDocuments.filter((d) => d.status === "Submitted" || d.status === "Available" || d.status === "Released").length} Verified
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
                {myEmployeeDocuments.filter((d) => d.status === "Missing").length} Action Item Required
              </p>
            </div>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="mt-4 w-full justify-between p-0 h-auto font-medium text-primary hover:bg-transparent hover:text-primary/80"
            >
              <Link to="/employee/ess" search={{ category: "Documents" }}>
                <span>Manage Documents →</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities & Service History */}
      <Card className="border-border/70 shadow-xs">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3">
          <div>
            <CardTitle className="font-display text-xl font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Self-Service Activity
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Click any activity row to view approval timeline &amp; audit history.</p>
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
                <TableHead>Activity &amp; Request</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date Filed</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {raPage.pageItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No activity matching filter.
                  </TableCell>
                </TableRow>
              ) : (
                raPage.pageItems.map((item, idx) => (
                  <TableRow
                    key={idx}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleRowClick(item)}
                  >
                    <TableCell className="font-medium text-sm text-foreground">
                      {item.type}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{item.category}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{item.date}</TableCell>
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

      {/* Audit Timeline Modal */}
      <RequestTimelineModal
        open={timelineOpen}
        onOpenChange={setTimelineOpen}
        request={selectedRequest}
      />
    </div>
  );
}
