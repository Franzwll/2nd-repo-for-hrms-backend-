import { useState } from "react";
import { useRouterState, Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Clock,
  FileText,
  FileCheck,
  Calendar,
  Layers,
  ArrowLeft,
  HeartHandshake,
  Send,
} from "lucide-react";
import { PageHeader } from "@/components/portal/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EssHeroBanner } from "@/components/modules/ess/EssHeroBanner";
import { EssOverviewTab } from "@/components/modules/ess/tabs/EssOverviewTab";
import { EssScheduleTab } from "@/components/modules/ess/tabs/EssScheduleTab";
import { EssAttendanceTab } from "@/components/modules/ess/tabs/EssAttendanceTab";
import { EssLeaveTab } from "@/components/modules/ess/tabs/EssLeaveTab";
import { EssPayrollTab } from "@/components/modules/ess/tabs/EssPayrollTab";
import { EssLatestPayslipTab } from "@/components/modules/ess/tabs/EssLatestPayslipTab";
import { EssDocumentsTab } from "@/components/modules/ess/tabs/EssDocumentsTab";
import { EssAllRequestsTab } from "@/components/modules/ess/tabs/EssAllRequestsTab";
import { EssPerformanceTab } from "@/components/modules/ess/tabs/EssPerformanceTab";
import { EssRecognitionTab } from "@/components/modules/ess/tabs/EssRecognitionTab";
import { QuickClockModal } from "@/components/modules/ess/modals/QuickClockModal";
import { LeaveApplicationModal } from "@/components/modules/ess/modals/LeaveApplicationModal";
import { PayslipViewerModal } from "@/components/modules/ess/modals/PayslipViewerModal";
import { DocumentRequestModal } from "@/components/modules/ess/modals/DocumentRequestModal";
import { EssAiAssistantModal } from "@/components/modules/ess/modals/EssAiAssistantModal";
import { myPayroll } from "@/data/ess";

export function EmployeeEss() {
  const [activeTab, setActiveTab] = useState("overview");

  // Global Quick Action Modals
  const [clockModalOpen, setClockModalOpen] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [payslipModalOpen, setPayslipModalOpen] = useState(false);
  const [docRequestModalOpen, setDocRequestModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // Sync category query parameter from TanStack Router URL (e.g. ?category=Attendance)
  const searchStr = useRouterState({ select: (s) => s.location.searchStr });
  const params = new URLSearchParams(searchStr || "");
  const categoryParam = params.get("category");

  const isDedicatedModule = [
    "Schedule",
    "Clocking",
    "Attendance",
    "Leave",
    "Payroll",
    "Performance",
    "Documents",
    "Recognition",
    "Benefits",
  ].includes(categoryParam || "");

  const getPageTitle = () => {
    switch (categoryParam) {
      case "Schedule":
      case "Clocking":
        return "Employee Self-Service · Daily Web Clocking";
      case "Attendance":
        return "Employee Self-Service · Attendance, Schedule & Balances";
      case "Leave":
        return "Employee Self-Service · Apply for Leave";
      case "Payroll":
        return "Employee Self-Service · Payroll";
      case "Performance":
        return "Employee Self-Service · Performance";
      case "Documents":
        return "Employee Self-Service · Company Documents";
      case "Recognition":
        return "Employee Self-Service · Social Recognition & Kudos";
      case "Requests":
      case "COE":
        return "Employee Self-Service · All Requests Tracker";
      case "Benefits":
        return "Employee Self-Service · Statutory Benefits & HMO";
      default:
        return "EMPLOYEE SELF-SERVICE";
    }
  };

  const getPageDescription = () => {
    switch (categoryParam) {
      case "Schedule":
      case "Clocking":
        return "Live web clocking terminal, real-time punch records, and station geolocation verification.";
      case "Attendance":
        return "View weekly shift schedule, daily time records, leave balances, and filing history.";
      case "Leave":
        return "Submit formal paid and statutory leave applications for supervisor approval.";
      case "Payroll":
        return "View net pay information, payslips history, breakdown details, and submit inquiries.";
      case "Performance":
        return "Track LMS learning modules, view evaluation scores, and competency rating.";
      case "Documents":
        return "View submitted, missing, and available employee documents and request official HR records.";
      case "Recognition":
        return "Praise colleagues, give kudos, and celebrate hotel service values on the public Wall of Fame.";
      case "Benefits":
        return "Review SSS, PhilHealth, Pag-IBIG HDMF, and healthcare coverage.";
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
          {(categoryParam === "Schedule" || categoryParam === "Clocking") && <EssScheduleTab />}
          {categoryParam === "Attendance" && <EssAttendanceTab />}
          {categoryParam === "Leave" && <EssLeaveTab />}
          {categoryParam === "Payroll" && <EssPayrollTab />}
          {categoryParam === "Payslip" && <EssLatestPayslipTab />}
          {categoryParam === "Performance" && <EssPerformanceTab />}
          {categoryParam === "Documents" && <EssDocumentsTab />}
          {(categoryParam === "Requests" || categoryParam === "COE" || categoryParam === "RequestDoc") && <EssAllRequestsTab />}
          {categoryParam === "Recognition" && <EssRecognitionTab />}
          {(categoryParam === "Benefits" || categoryParam === "Statutory") && <EssPayrollTab />}
        </div>
      ) : (
        /* MAIN ESS SECTION (Portal Hub) */
        <div className="space-y-6">
          {/* Hero Banner with Live Clock and Shift Status */}
          <EssHeroBanner />

          {/* Action Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="flex h-auto flex-wrap justify-start">
              <TabsTrigger className="flex items-center gap-1.5" value="overview">
                <LayoutDashboard className="h-3.5 w-3.5" /> Overview
              </TabsTrigger>
              <TabsTrigger className="flex items-center gap-1.5" value="schedule">
                <Clock className="h-3.5 w-3.5" /> Daily Web Clocking
              </TabsTrigger>
              <TabsTrigger className="flex items-center gap-1.5" value="leave">
                <Calendar className="h-3.5 w-3.5" /> Apply for Leave
              </TabsTrigger>
              <TabsTrigger className="flex items-center gap-1.5" value="payslip">
                <FileText className="h-3.5 w-3.5" /> Latest Payslip
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

            <TabsContent value="payslip" className="mt-6">
              <EssLatestPayslipTab />
            </TabsContent>

            <TabsContent value="requests" className="mt-6">
              <EssAllRequestsTab />
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
      <EssAiAssistantModal
        open={aiModalOpen}
        onOpenChange={setAiModalOpen}
        onNavigateCategory={(cat) => {
          if (cat === "Schedule" || cat === "Clocking" || cat === "Attendance") setActiveTab("schedule");
          else if (cat === "Leave") setActiveTab("leave");
          else if (cat === "Payroll") setActiveTab("payslip");
          else if (cat === "Documents") setActiveTab("coe");
          else if (cat === "Recognition") {
            window.location.href = "/employee/ess?category=Recognition";
          }
        }}
      />
    </div>
  );
}

export default EmployeeEss;
