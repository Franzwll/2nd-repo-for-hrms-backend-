import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PortalShell } from "@/components/portal/PortalShell";

export const Route = createFileRoute("/employee")({
  head: () => ({
    meta: [
      { title: "Employee Portal — Oxford Suites Makati HRMS" },
      {
        name: "description",
        content:
          "Employee self-service portal for Oxford Suites Makati: payslips, leave requests, schedules, and documents.",
      },
    ],
  }),
  component: () => (
    <PortalShell role="employee">
      <Outlet />
    </PortalShell>
  ),
});
