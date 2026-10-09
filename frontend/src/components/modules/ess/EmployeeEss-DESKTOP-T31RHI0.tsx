import { useState } from "react";
import { useRouterState, Link } from "@tanstack/react-router";
import {
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
import { EssAttendanceTab } from "@/components/modules/ess/tabs/EssAttendanceTab";
import { EssPayrollTab } from "@/components/modules/ess/tabs/EssPayrollTab";
import { EssDocumentsTab } from "@/components/modules/ess/tabs/EssDocumentsTab";
import { EssAllRequestsTab } from "@/components/modules/ess/tabs/EssAllRequestsTab";
import { EssPromotionTab } from "@/components/modules/ess/tabs/EssPromotionTab";
import { EssPerformanceTab } from "@/components/modules/ess/tabs/EssPerformanceTab";
import { EssRecognitionTab } from "@/components/modules/ess/tabs/EssRecognitionTab";
import { EssBenefitsTab } from "@/components/modules/ess/tabs/EssBenefitsTab";
import { QuickClockModal } from "@/components/modules/ess/modals/QuickClockModal";
import { LeaveApplicationModal } from "@/components/modules/ess/modals/LeaveApplicationModal";
import { PayslipViewerModal } from "@/components/modules/ess/modals/PayslipViewerModal";
import { DocumentRequestModal } from "@/components/modules/ess/modals/DocumentRequestModal";
import { EssAiAssistantModal } from "@/components/modules/ess/modals/EssAiAssistantModal";
import { myPayroll } from "@/data/ess";

export function EmployeeEss() {
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

  const isSubCategory = Boolean(
    categoryParam &&
    categoryParam !== "Attendance" &&
    categoryParam !== "Clocking" &&
    categoryParam !== "Schedule" &&
    categoryParam !== "Leave"
  );

  const getPageTitle = () => {
    switch (categoryParam) {
      case "Schedule":
        return "Employee Self-Service · Weekly Shift Schedule & Roster";
      case "Clocking":
        return "Employee Self-Service · Daily Web Clocking";
      case "Leave":
        return "Employee Self-Service · Apply for Leave";
      case "Payroll":
      case "Payslip":
        return "Employee Self-Service · Payroll";
      case "Performance":
        return "Employee Self-Service · Performance";
      case "Documents":
      case "RequestDoc":
        return "Employee Self-Service · Company Documents";
      case "Recognition":
        return "Employee Self-Service · Social Recognition & Kudos";
      case "Requests":
      case "COE":
        return "Employee Self-Service · All Requests Tracker";
      case "Benefits":
      case "Statutory":
        return "Employee Self-Service · Statutory Benefits & HMO";
      case "Promotion":
        return "Employee Self-Service · Request Promotion";
      case "Attendance":
      default:
        return "Employee Self-Service · Attendance, Schedule & Balances";
    }
  };

  const getPageDescription = () => {
    switch (categoryParam) {
      case "Schedule":
        return "7-day weekly shift assignments, station stations, and shift swap requests.";
      case "Clocking":
        return "Live web clocking terminal, real-time punch records, and station geolocation verification.";
      case "Leave":
        return "Submit formal paid and statutory leave applications for supervisor approval.";
      case "Payroll":
      case "Payslip":
        return "View net pay information, released payslips history, statutory benefits, and submit inquiries.";
      case "Performance":
        return "Track LMS learning modules, view evaluation scores, and competency rating.";
      case "Documents":
      case "RequestDoc":
        return "View submitted, missing, and available employee documents and request official HR records.";
      case "Recognition":
        return "Explore achievements, amplify praise, and celebrate hotel service values on the public Wall of Fame.";
      case "Requests":
      case "COE":
        return "Track all your filed requests, review statuses, and approval history.";
      case "Benefits":
      case "Statutory":
        return "Review SSS, PhilHealth, Pag-IBIG HDMF, and healthcare coverage.";
      case "Promotion":
        return "Request a promotion review and track your HR decision.";
      case "Attendance":
      default:
        return "Live web clocking terminal, weekly shift roster, biometric time records, and leave applications.";
    }
  };

  const attendanceInitialTab =
    categoryParam === "Schedule"
      ? "roster"
      : "clocking";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Employee Portal"
        title={getPageTitle()}
        description={getPageDescription()}
        actions={
          isSubCategory ? (
            <Button variant="outline" size="sm" asChild className="gap-1.5 text-xs">
              <Link to="/employee/ess" search={{ category: "Attendance" }}>
                <ArrowLeft className="h-3.5 w-3.5" /> Attendance &amp; Schedule
              </Link>
            </Button>
          ) : undefined
        }
      />

      {/* MODULE CONTENT */}
      <div className="mt-6">
        {(!categoryParam ||
          categoryParam === "Attendance" ||
          categoryParam === "Clocking" ||
          categoryParam === "Schedule" ||
          categoryParam === "Leave") && (
          <EssAttendanceTab initialTab={attendanceInitialTab} />
        )}
        {(categoryParam === "Payroll" || categoryParam === "Payslip") && <EssPayrollTab />}
        {categoryParam === "Performance" && <EssPerformanceTab />}
        {(categoryParam === "Documents" || categoryParam === "RequestDoc") && <EssDocumentsTab />}
        {(categoryParam === "Requests" || categoryParam === "COE") && <EssAllRequestsTab />}
        {categoryParam === "Recognition" && <EssRecognitionTab />}
        {(categoryParam === "Benefits" || categoryParam === "Statutory") && <EssBenefitsTab />}
        {categoryParam === "Promotion" && <EssPromotionTab />}
      </div>

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
          if (cat === "Schedule" || cat === "Clocking" || cat === "Attendance" || cat === "Leave") {
            window.location.href = `/employee/ess?category=${cat}`;
          } else if (cat === "Payroll") {
            window.location.href = "/employee/ess?category=Payroll";
          } else if (cat === "Documents") {
            window.location.href = "/employee/ess?category=Documents";
          } else if (cat === "Recognition") {
            window.location.href = "/employee/ess?category=Recognition";
          }
        }}
      />
    </div>
  );
}

export default EmployeeEss;
