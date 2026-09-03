import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/components/modules/Settings";

export const Route = createFileRoute("/employee/_settings/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Oxford Suites Makati HRMS" },
      {
        name: "description",
        content:
          "Notifications, portal preferences, account security, personal contact details, and work information.",
      },
      { property: "og:title", content: "Settings — Oxford Suites Makati HRMS" },
      {
        property: "og:description",
        content:
          "Notifications, portal preferences, account security, personal contact details, and work information.",
      },
    ],
  }),
  component: () => <SettingsPage role="employee" />,
});
