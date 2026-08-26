import { useState, useEffect } from "react";
import { useRouterState, Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Clock,
  FileText,
  TrendingUp,
  FileCheck,
  Calendar,
  Layers,
  HeartHandshake,
  Send,
  ArrowLeft,
} from "lucide-react";
import { PageHeader } from "@/components/portal/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EssHeroBanner } from "@/components/modules/ess/EssHeroBanner";
import { EssOverviewTab } from "@/components/modules/ess/tabs/EssOverviewTab";
import { EssAttendanceTab } from "@/components/modules/ess/tabs/EssAttendanceTab";
import { EssLeaveTab } from "@/components/modules/ess/tabs/EssLeaveTab";
import { EssPayrollTab } from "@/components/modules/ess/tabs/EssPayrollTab";
import { EssDocumentsTab } from "@/components/modules/ess/tabs/EssDocumentsTab";
import { EssPerformanceTab } from "@/components/modules/ess/tabs/EssPerformanceTab";
import { EssScheduleTab } from "@/components/modules/ess/tabs/EssScheduleTab";
import { EssBenefitsTab } from "@/components/modules/ess/tabs/EssBenefitsTab";
import { EssRequestCenterTab } from "@/components/modules/ess/tabs/EssRequestCenterTab";
import { QuickClockModal } from "@/components/modules/ess/modals/QuickClockModal";
import { LeaveApplicationModal } from "@/components/modules/ess/modals/LeaveApplicationModal";
import { PayslipViewerModal } from "@/components/modules/ess/modals/PayslipViewerModal";
import { DocumentRequestModal } from "@/components/modules/ess/modals/DocumentRequestModal";
import { myProfile, myPayroll } from "@/data/ess";

export function EmployeeEss() {
  const [activeTab, setActiveTab] = useState("overview");

  // Global Quick Action Modals
  const [clockModalOpen, setClockModalOpen] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [payslipModalOpen, setPayslipModalOpen] = useState(false);
  const [docRequestModalOpen, setDocRequestModalOpen] = useState(false);

  // Sync category query parameter from TanStack Router URL (e.g. ?category=Attendance)
  const searchStr = useRouterState({ select: (s) => s.location.searchStr });
  const params = new URLSearchParams(searchStr || "");
  const categoryParam = params.get("category");

  const isDedicatedModule = ["Attendance", "Payroll", "Performance", "Documents"].includes(
    categoryParam || ""
  );

  const getPageTitle = () => {
    switch (categoryParam) {
      case "Attendance":
        return "Employee Self-Service · Attendance";
      case "Payroll":
        return "Employee Self-Service · Payroll";
      case "Performance":
        return "Employee Self-Service · Performance";
      case "Documents":
        return "Employee Self-Service · Company Documents";
      default:
        return "EMPLOYEE SELF-SERVICE";
    }
  };

  const getPageDescription = () => {
    switch (categoryParam) {
      case "Attendance":
        return "View attendance logs, daily time-in/out records, and file correction requests.";
      case "Payroll":
        return "View net pay information, payslips history, breakdown details, and submit inquiries.";
      case "Performance":
        return "Track LMS learning modules, view evaluation scores, competency rating, and promotion applications.";
      case "Documents":
        return "View submitted, missing, and available employee documents and request official HR records.";
      default:
        return "View your employee information, activities, and HR services.";
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Employee Portal"
        title={getPageTitle()}
        description={getPageDescription()}
        actions={
          isDedicatedModule ? (
            <Button variant="outline" size="sm" asChild className="gap-1.5 text-xs">
              <Link to="/employee/ess">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to ESS Overview
              </Link>
            </Button>
          ) : undefined
        }
      />

      {/* DEDICATED MODULE SECTIONS (Activated via Sidebar or Card View buttons) */}
      {isDedicatedModule ? (
        <div className="mt-6">
          {categoryParam === "Attendance" && <EssAttendanceTab />}
          {categoryParam === "Payroll" && <EssPayrollTab />}
          {categoryParam === "Performance" && <EssPerformanceTab />}
          {categoryParam === "Documents" && <EssDocumentsTab />}
        </div>
      ) : (
        /* MAIN ESS SECTION (All Requests / Portal Hub) */
        <div className="space-y-6">
          {/* Hero Banner with Live Clock, Shift Status & Fast Action Modals */}
          <EssHeroBanner
            onOpenClock={() => setClockModalOpen(true)}
            onOpenLeave={() => setLeaveModalOpen(true)}
            onOpenPayslip={() => setPayslipModalOpen(true)}
            onOpenDocRequest={() => setDocRequestModalOpen(true)}
          />

          {/* 5 Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="flex h-auto flex-wrap justify-start">
              <TabsTrigger className="flex items-center gap-1.5" value="overview">
                <LayoutDashboard className="h-3.5 w-3.5" /> Overview
              </TabsTrigger>
              <TabsTrigger className="flex items-center gap-1.5" value="schedule">
                <Layers className="h-3.5 w-3.5" /> Weekly Schedule
              </TabsTrigger>
              <TabsTrigger className="flex items-center gap-1.5" value="leave">
                <Calendar className="h-3.5 w-3.5" /> Leave Balances
              </TabsTrigger>
              <TabsTrigger className="flex items-center gap-1.5" value="benefits">
                <HeartHandshake className="h-3.5 w-3.5" /> Benefits &amp; Loans
              </TabsTrigger>
              <TabsTrigger className="flex items-center gap-1.5" value="requests">
                <Send className="h-3.5 w-3.5" /> All Requests
              </TabsTrigger>
            </TabsList>

            {/* Tab Contents */}
            <TabsContent value="overview" className="mt-6">
              <EssOverviewTab
                onOpenClock={() => setClockModalOpen(true)}
                onOpenLeave={() => setLeaveModalOpen(true)}
                onOpenPayslip={() => setPayslipModalOpen(true)}
                onOpenDocRequest={() => setDocRequestModalOpen(true)}
              />
            </TabsContent>

            <TabsContent value="schedule" className="mt-6">
              <EssScheduleTab />
            </TabsContent>

            <TabsContent value="leave" className="mt-6">
              <EssLeaveTab />
            </TabsContent>

            <TabsContent value="benefits" className="mt-6">
              <EssBenefitsTab />
            </TabsContent>

            <TabsContent value="requests" className="mt-6">
              <EssRequestCenterTab />
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Global Modals */}
      <QuickClockModal open={clockModalOpen} onOpenChange={setClockModalOpen} />
      <LeaveApplicationModal open={leaveModalOpen} onOpenChange={setLeaveModalOpen} />
      <PayslipViewerModal
        open={payslipModalOpen}
        onOpenChange={setPayslipModalOpen}
        period="2026-07-01 – 07-15"
        netPay={myPayroll.net}
      />
      <DocumentRequestModal
        open={docRequestModalOpen}
        onOpenChange={setDocRequestModalOpen}
      />
    </div>
  );
}

export default EmployeeEss;
