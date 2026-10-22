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
  component: EmployeeLayout,
});

function EmployeeLayout() {
  // Keep in-portal navigation client-side (SPA), matching the admin and
  // superadmin portals. Previously every `/employee` link was intercepted and
  // hard-navigated, which re-mounted the app and replayed the full-screen
  // preloader on every ESS tab click. Route/tab content now shows the
  // skeleton fallbacks while chunks and API data are loading instead.
  return (
    <PortalShell role="employee">
      <Outlet />
    </PortalShell>
  );
}
