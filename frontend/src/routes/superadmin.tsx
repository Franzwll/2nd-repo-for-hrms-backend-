import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PortalShell } from "@/components/portal/PortalShell";
import { PreferencesProvider } from "@/lib/preferences";

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
    <PreferencesProvider><PortalShell role="superadmin">
      <Outlet />
    </PortalShell></PreferencesProvider>
  ),
});
