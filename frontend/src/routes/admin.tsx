import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PortalShell } from "@/components/portal/PortalShell";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Portal — Oxford Suites Makati HRMS" },
      {
        name: "description",
        content:
          "HR Admin portal for Oxford Suites Makati: recruitment, onboarding, employee records, and ESS management.",
      },
    ],
  }),
  component: () => (
    <PortalShell role="admin">
      <Outlet />
    </PortalShell>
  ),
});
