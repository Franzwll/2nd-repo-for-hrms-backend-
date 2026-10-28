import { createFileRoute } from "@tanstack/react-router";
import { AdminEssSelfService } from "@/components/modules/ess";

export const Route = createFileRoute("/superadmin/_essmanagement/my-ess")({
  validateSearch: (search: Record<string, unknown>): { category?: string } => ({
    category: (search["category"] as string) ?? undefined,
  }),
  head: () => ({
    meta: [
      { title: "My ESS - Oxford Suites Makati HRMS" },
      {
        name: "description",
        content: "Your personal employee self-service hub for attendance, payroll, and requests.",
      },
      { property: "og:title", content: "My ESS - Oxford Suites Makati HRMS" },
      {
        property: "og:description",
        content: "Your personal employee self-service hub for attendance, payroll, and requests.",
      },
    ],
  }),
  component: () => <AdminEssSelfService basePath="/superadmin" />,
});
