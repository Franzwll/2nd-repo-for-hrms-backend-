import { createFileRoute } from "@tanstack/react-router";
import { EssManagement } from "@/components/modules/ess";
export const Route = createFileRoute("/employee/_essmanagement/ess")({
  validateSearch: (search: Record<string, unknown>): { category?: string } => ({
    category: (search["category"] as string) ?? undefined,
  }),
  head: () => ({
    meta: [
      { title: "Employee Self-Service — Oxford Suites Makati HRMS" },
      {
        name: "description",
        content: "Attendance, schedule, leave, payroll, benefits and HR request submission.",
      },
      { property: "og:title", content: "Employee Self-Service — Oxford Suites Makati HRMS" },
      {
        property: "og:description",
        content: "Attendance, schedule, leave, payroll, benefits and HR request submission.",
      },
    ],
  }),
  component: () => <EssManagement role="employee" />,
});
