import { useState } from "react";
import { useRouterState, Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Clock,
  FileText,
  FileCheck,
  Calendar,
  ArrowLeft,
  Sparkles,
  Bot,
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

  const isDedicatedModule = ["Attendance", "Payroll", "Performance", "Documents", "Recognition"].includes(
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
      case "Recognition":
        return "Employee Self-Service · Social Recognition & Kudos";
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
        return "Track LMS learning modules, view evaluation scores, and competency rating.";
      case "Documents":
        return "View submitted, missing, and available employee documents and request official HR records.";
      case "Recognition":
        return "Praise colleagues, give kudos, and celebrate hotel service values on the public Wall of Fame.";
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
          {categoryParam === "Recognition" && <EssRecognitionTab />}
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
              <TabsTrigger className="flex items-center gap-1.5" value="clocking">
                <Clock className="h-3.5 w-3.5" /> Web Clocking
              </TabsTrigger>
              <TabsTrigger className="flex items-center gap-1.5" value="leave">
                <Calendar className="h-3.5 w-3.5" /> Applying Leave
              </TabsTrigger>
              <TabsTrigger className="flex items-center gap-1.5" value="payslip">
                <FileText className="h-3.5 w-3.5" /> Latest Payslip
              </TabsTrigger>
              <TabsTrigger className="flex items-center gap-1.5" value="coe">
                <FileCheck className="h-3.5 w-3.5" /> Request COE
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

            <TabsContent value="clocking" className="mt-6">
              <EssAttendanceTab />
            </TabsContent>

            <TabsContent value="leave" className="mt-6">
              <EssLeaveTab />
            </TabsContent>

            <TabsContent value="payslip" className="mt-6">
              <EssPayrollTab />
            </TabsContent>

            <TabsContent value="coe" className="mt-6">
              <EssDocumentsTab />
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Floating AI Concierge Trigger Button */}
      <button
        type="button"
        onClick={() => setAiModalOpen(true)}
        aria-label="Open Oxford HR AI Assistant"
        className="fixed bottom-6 right-6 z-40 flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-tr from-primary via-primary to-amber-600 text-white shadow-xl hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-primary/20 cursor-pointer group"
      >
        <Bot className="h-6 w-6 group-hover:rotate-12 transition-transform" />
      </button>

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
          if (cat === "Attendance") setActiveTab("clocking");
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
