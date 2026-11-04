import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/components/modules/Settings";
export const Route = createFileRoute("/superadmin/_settings/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Oxford Suites Makati HRMS" },
      {
        name: "description",
        content: "System-wide security policy, account preferences, and database backups.",
      },
      { property: "og:title", content: "Settings — Oxford Suites Makati HRMS" },
      {
        property: "og:description",
        content: "System-wide security policy, account preferences, and database backups.",
      },
    ],
  }),
  component: () => <SettingsPage role="superadmin" />,
});
