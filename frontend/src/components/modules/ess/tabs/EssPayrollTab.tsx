import { useEffect, useMemo, useState, Suspense, lazy } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CardSkeleton } from "@/components/ui/loading-skeletons";
import { Card, CardContent } from "@/components/ui/card";
import {
  myRequestModulePath,
  myRequestsPath,
  useEssPortal,
} from "@/components/modules/ess/EssPortalContext";
import { PayslipViewerModal } from "@/components/modules/ess/modals/PayslipViewerModal";
import { essApi, type ApiPayrollData } from "@/lib/api";

// Lazy-loaded pane components
const PayrollOverviewPane = lazy(() =>
  import("@/components/modules/ess/tabs/payroll/PayrollOverviewPane").then((m) => ({
    default: m.PayrollOverviewPane,
  })),
);
const PayrollPayslipsPane = lazy(() =>
  import("@/components/modules/ess/tabs/payroll/PayrollPayslipsPane").then((m) => ({
    default: m.PayrollPayslipsPane,
  })),
);
const PayrollLoansBenefitsPane = lazy(() =>
  import("@/components/modules/ess/tabs/payroll/PayrollLoansBenefitsPane").then((m) => ({
    default: m.PayrollLoansBenefitsPane,
  })),
);
const PayrollTaxDocsPane = lazy(() =>
  import("@/components/modules/ess/tabs/payroll/PayrollTaxDocsPane").then((m) => ({
    default: m.PayrollTaxDocsPane,
  })),
);

const money = (value: number) => `₱${value.toLocaleString()}`;

interface CalcLine {
  label: string;
  amount: number;
  hint?: string;
}

/** Skeleton for tab pane loading */
function PaneSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200" aria-busy="true">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-border/60 shadow-xs">
            <CardContent className="p-5">
              <CardSkeleton rows={2} />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-border/60 shadow-xs">
        <CardContent className="p-5">
          <CardSkeleton rows={6} />
        </CardContent>
      </Card>
    </div>
  );
}

export function EssPayrollTab() {
  const navigate = useNavigate();
  const { basePath } = useEssPortal();
  const myRequestsTo = myRequestsPath(basePath);
  const payrollRequestTo = myRequestModulePath(basePath);

  const [payrollData, setPayrollData] = useState<ApiPayrollData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Payslip viewer modal state
  const [selectedPayslip, setSelectedPayslip] = useState<ApiPayrollData["payslips"][number] | null>(
    null,
  );
  const [payslipModalOpen, setPayslipModalOpen] = useState(false);

  useEffect(() => {
    essApi
      .myPayroll()
      .then((res) => setPayrollData(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ── Derived values ──
  const baseSalary = payrollData?.baseSalary ?? 0;
  const allowances = payrollData?.allowances ?? 0;
  const sss = payrollData?.deductions?.sss ?? 0;
  const philhealth = payrollData?.deductions?.philhealth ?? 0;
  const pagibig = payrollData?.deductions?.pagibig ?? 0;
  const tax = payrollData?.deductions?.tax ?? 0;
  const currentGross = baseSalary + allowances;
  const nextPayout = payrollData?.nextPayout ?? "—";
  const payPeriod = payrollData?.hero_period ?? "—";

  const payslipsList = useMemo(() => payrollData?.payslips ?? [], [payrollData]);

  const latestPayslip = useMemo(
    () => payslipsList.find((p) => p.status === "Released") ?? payslipsList[0],
    [payslipsList],
  );
  const hasPayslipBreakdown = Boolean(
    (latestPayslip as any)?.earnings?.length &&
      (latestPayslip as any)?.deductions_breakdown?.length,
  );

  const calculation = useMemo(() => {
    if (latestPayslip && hasPayslipBreakdown) {
      const ps = latestPayslip as any;
      const earnings: CalcLine[] = (ps.earnings ?? []).map((item: any) => ({
        label: item.label,
        amount: Number(item.amount),
      }));
      const deductions: CalcLine[] = (ps.deductions_breakdown ?? []).map((item: any) => ({
        label: item.label,
        amount: Number(item.amount),
      }));
      const gross = Number(
        ps.gross ?? earnings.reduce((sum: number, item: CalcLine) => sum + item.amount, 0),
      );
      const net = Number(
        ps.net ?? gross - deductions.reduce((sum: number, item: CalcLine) => sum + item.amount, 0),
      );
      const totalDeductions = Number(ps.deductions ?? gross - net);
      return {
        earnings,
        deductions,
        gross,
        totalDeductions,
        net,
        source: "Based on latest released payslip",
      };
    }

    const earnings: CalcLine[] = [
      { label: "Base Salary", amount: baseSalary },
      { label: "Allowances", amount: allowances },
    ];
    const taxable = Math.max(0, baseSalary - (sss + philhealth + pagibig));
    const deductions: CalcLine[] = [
      { label: "SSS", amount: sss, hint: `4.5% × ${money(baseSalary)}` },
      { label: "PhilHealth", amount: philhealth, hint: `2.5% × ${money(baseSalary)}` },
      { label: "Pag-IBIG", amount: pagibig, hint: "Fixed contribution" },
      { label: "BIR Withholding Tax", amount: tax, hint: `10% × ${money(taxable)}` },
    ];
    const gross = currentGross;
    const totalDeductions = sss + philhealth + pagibig + tax;
    const net = gross - totalDeductions;

    return {
      earnings,
      deductions,
      gross,
      totalDeductions,
      net,
      source: "Estimated from current salary",
    };
  }, [latestPayslip, hasPayslipBreakdown, baseSalary, allowances, sss, philhealth, pagibig, tax, currentGross]);

  const lateAbsenceDeductions = useMemo(
    () =>
      calculation.deductions
        .filter((row) => /late|absent|undertime|tard/i.test(row.label))
        .reduce((sum, row) => sum + row.amount, 0),
    [calculation.deductions],
  );

  // ── Handlers ──
  const openPayslip = (ps: ApiPayrollData["payslips"][number]) => {
    setSelectedPayslip(ps);
    setPayslipModalOpen(true);
  };

  if (loading) {
    return <PaneSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Tab navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payslips">Payslips</TabsTrigger>
          <TabsTrigger value="loans-benefits">Loans & Benefits</TabsTrigger>
          <TabsTrigger value="tax-documents">Tax documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Suspense fallback={<PaneSkeleton />}>
            {payrollData && (
              <PayrollOverviewPane
                payrollData={payrollData}
                calculation={calculation}
                nextPayout={nextPayout}
                payPeriod={payPeriod}
                lateAbsenceDeductions={lateAbsenceDeductions}
                onDownloadPayslip={() => {
                  const latest = payslipsList.find((p) => p.status === "Released");
                  if (latest) openPayslip(latest);
                }}
                onViewAttendance={() =>
                  navigate({ to: "/employee/ess", search: { category: "Attendance" } })
                }
                onReportConcern={() =>
                  navigate({ to: payrollRequestTo, params: { module: "payroll" } })
                }
              />
            )}
          </Suspense>
        </TabsContent>

        <TabsContent value="payslips">
          <Suspense fallback={<PaneSkeleton />}>
            <PayrollPayslipsPane payslipsList={payslipsList} onViewPayslip={openPayslip} />
          </Suspense>
        </TabsContent>

        <TabsContent value="loans-benefits">
          <Suspense fallback={<PaneSkeleton />}>
            <PayrollLoansBenefitsPane
              nextPayout={nextPayout}
              onAskAboutLoan={() =>
                navigate({ to: payrollRequestTo, params: { module: "payroll" } })
              }
              onRequestEarlyPayoff={() =>
                navigate({ to: payrollRequestTo, params: { module: "payroll" } })
              }
              onOpenRequests={() => navigate({ to: myRequestsTo })}
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="tax-documents">
          <Suspense fallback={<PaneSkeleton />}>
            <PayrollTaxDocsPane />
          </Suspense>
        </TabsContent>
      </Tabs>

      {/* Payslip Viewer Modal (shared across tabs) */}
      <PayslipViewerModal
        open={payslipModalOpen}
        onOpenChange={setPayslipModalOpen}
        period={selectedPayslip?.period ?? ""}
        netPay={selectedPayslip?.net ?? 0}
        payslip={selectedPayslip}
        onInquiryClick={() =>
          navigate({ to: payrollRequestTo, params: { module: "payroll" } })
        }
      />
    </div>
  );
}
