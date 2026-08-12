import { createFileRoute } from "@tanstack/react-router";
import { OrgChartModule } from "@/components/modules/CoreHCM";
export const Route = createFileRoute("/superadmin/hcm")({
  head: () => ({
    meta: [
      { title: "Core HCM — Oxford Suites Makati HRMS" },
      { name: "description", content: "Departments, organizational chart, job positions and vacancy requisitions." },
      { property: "og:title", content: "Core HCM — Oxford Suites Makati HRMS" },
      { property: "og:description", content: "Departments, organizational chart, job positions and vacancy requisitions." },
    ],
  }),
  component: () => <OrgChartModule role="superadmin" />,
});
