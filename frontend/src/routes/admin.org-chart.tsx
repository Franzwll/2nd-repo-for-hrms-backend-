import { createFileRoute } from "@tanstack/react-router";
import { OrgChartModule } from "@/components/modules/CoreHCM";

export const Route = createFileRoute("/admin/org-chart")({
  head: () => ({
    meta: [
      { title: "Organizational Chart & Roster — Oxford Suites HRMS" },
      { name: "description", content: "Hierarchy chart, employee roster, lifecycle actions and status transition logs." },
    ],
  }),
  component: () => <OrgChartModule role="admin" />,
});
