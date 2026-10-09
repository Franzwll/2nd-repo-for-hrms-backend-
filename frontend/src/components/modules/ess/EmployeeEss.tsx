import { useState, Suspense, lazy } from "react";
import { useRouterState } from "@tanstack/react-router";
import { PageHeader } from "@/components/portal/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { QuickClockModal } from "@/components/modules/ess/modals/QuickClockModal";
import { LeaveApplicationModal } from "@/components/modules/ess/modals/LeaveApplicationModal";
import { PayslipViewerModal } from "@/components/modules/ess/modals/PayslipViewerModal";
import { DocumentRequestModal } from "@/components/modules/ess/modals/DocumentRequestModal";
import { EssAiAssistantModal } from "@/components/modules/ess/modals/EssAiAssistantModal";
import { myPayroll } from "@/data/ess";

// Lazy-loaded tab components — shows skeleton while loading
const EssOverviewTab = lazy(() =>
  import("@/components/modules/ess/tabs/EssOverviewTab").then((m) => ({ default: m.EssOverviewTab }))
);
const EssAttendanceTab = lazy(() =>
  import("@/components/modules/ess/tabs/EssAttendanceTab").then((m) => ({ default: m.EssAttendanceTab }))
);
const EssPayrollTab = lazy(() =>
  import("@/components/modules/ess/tabs/EssPayrollTab").then((m) => ({ default: m.EssPayrollTab }))
);
const EssDocumentsTab = lazy(() =>
  import("@/components/modules/ess/tabs/EssDocumentsTab").then((m) => ({ default: m.EssDocumentsTab }))
);
const EssAllRequestsTab = lazy(() =>
  import("@/components/modules/ess/tabs/EssAllRequestsTab").then((m) => ({ default: m.EssAllRequestsTab }))
);
const EssPromotionTab = lazy(() =>
  import("@/components/modules/ess/tabs/EssPromotionTab").then((m) => ({ default: m.EssPromotionTab }))
);
const EssPerformanceTab = lazy(() =>
  import("@/components/modules/ess/tabs/EssPerformanceTab").then((m) => ({ default: m.EssPerformanceTab }))
);
const EssRecognitionTab = lazy(() =>
  import("@/components/modules/ess/tabs/EssRecognitionTab").then((m) => ({ default: m.EssRecognitionTab }))
);
const EssBenefitsTab = lazy(() =>
  import("@/components/modules/ess/tabs/EssBenefitsTab").then((m) => ({ default: m.EssBenefitsTab }))
);

/** Full-page skeleton shown while any ESS tab module is loading. */
function EssPageSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200" aria-busy="true" aria-label="Loading ESS module">
      {/* Stat cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border/60 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-full mt-2" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="rounded-lg border border-border/60 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3 w-72" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-[160px] rounded-md" />
            <Skeleton className="h-9 w-[140px] rounded-md" />
            <Skeleton className="h-9 w-[130px] rounded-md" />
          </div>
        </div>
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-8 flex-[2]" style={{ opacity: 1 - i * 0.15 }} />
            <Skeleton className="h-8 flex-1" style={{ opacity: 1 - i * 0.15 }} />
            <Skeleton className="h-8 flex-1" style={{ opacity: 1 - i * 0.15 }} />
            <Skeleton className="h-8 w-20" style={{ opacity: 1 - i * 0.15 }} />
            <Skeleton className="h-8 w-24" style={{ opacity: 1 - i * 0.15 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

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
        return "Employee Self-Service · Attendance, Schedule & Balances";
      default:
        return "Employee Self-Service · Overview";
    }
  };

  const getPageDescription = () => {
    switch (categoryParam) {
      case "Schedule":
        return "7-day weekly shift assignments, station assignments, and shift swap requests.";
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
        return "Live web clocking terminal, weekly shift roster, biometric time records, and leave applications.";
      default:
        return "Your personal HR hub — attendance, payroll, documents, requests, and career tools at a glance.";
    }
  };

  const attendanceInitialTab = categoryParam === "Schedule" ? "roster" : "clocking";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Employee Portal"
        title={getPageTitle()}
        description={getPageDescription()}
      />

      {/* ── Module Content with Skeleton Loading ── */}
      <Suspense fallback={<EssPageSkeleton />}>
        {!categoryParam && <EssOverviewTab />}
        {(categoryParam === "Attendance" ||
          categoryParam === "Clocking" ||
          categoryParam === "Schedule" ||
          categoryParam === "Leave") && <EssAttendanceTab initialTab={attendanceInitialTab} />}
        {(categoryParam === "Payroll" || categoryParam === "Payslip") && <EssPayrollTab />}
        {categoryParam === "Performance" && <EssPerformanceTab />}
        {(categoryParam === "Documents" || categoryParam === "RequestDoc") && <EssDocumentsTab />}
        {(categoryParam === "Requests" || categoryParam === "COE") && <EssAllRequestsTab />}
        {categoryParam === "Recognition" && <EssRecognitionTab />}
        {(categoryParam === "Benefits" || categoryParam === "Statutory") && <EssBenefitsTab />}
        {categoryParam === "Promotion" && <EssPromotionTab />}
      </Suspense>

      {/* ── Global Modals ── */}
      <QuickClockModal open={clockModalOpen} onOpenChange={setClockModalOpen} />
      <LeaveApplicationModal open={leaveModalOpen} onOpenChange={setLeaveModalOpen} />
      <PayslipViewerModal
        open={payslipModalOpen}
        onOpenChange={setPayslipModalOpen}
        period="2026-07-01 – 07-15"
        netPay={myPayroll.net}
      />
      <DocumentRequestModal open={docRequestModalOpen} onOpenChange={setDocRequestModalOpen} />
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
