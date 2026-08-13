import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PortalShell } from "@/components/portal/PortalShell";

export const Route = createFileRoute("/superadmin")({
  head: () => ({
    meta: [
      { title: "Super Admin Portal — Oxford Suites Makati HRMS" },
      {
        name: "description",
        content:
          "Super Admin portal for the Oxford Suites Makati HRMS: system-wide control, user management, and audit logs.",
      },
    ],
  }),
  component: () => (
    <PortalShell role="superadmin">
      <Outlet />
    </PortalShell>
  ),
});
