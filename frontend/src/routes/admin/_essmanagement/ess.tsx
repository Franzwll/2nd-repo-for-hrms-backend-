import { createFileRoute } from "@tanstack/react-router";
import { EssManagement } from "@/components/modules/EssManagement";
export const Route = createFileRoute("/admin/_essmanagement/ess")({
  head: () => ({
    meta: [
      { title: "ESS Management — Oxford Suites Makati HRMS" },
      { name: "description", content: "Monitor, process and configure employee self-service requests." },
      { property: "og:title", content: "ESS Management — Oxford Suites Makati HRMS" },
      { property: "og:description", content: "Monitor, process and configure employee self-service requests." },
    ],
  }),
  component: () => <EssManagement role="admin" />,
});
