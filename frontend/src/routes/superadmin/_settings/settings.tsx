import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/components/modules/Settings";
export const Route = createFileRoute("/superadmin/_settings/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Oxford Suites Makati HRMS" },
      { name: "description", content: "Account security, default password and notification preferences." },
      { property: "og:title", content: "Settings — Oxford Suites Makati HRMS" },
      { property: "og:description", content: "Account security, default password and notification preferences." },
    ],
  }),
  component: () => <SettingsPage role="superadmin" />,
});
