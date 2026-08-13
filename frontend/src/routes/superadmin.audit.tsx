import { createFileRoute } from "@tanstack/react-router";
import { AuditLogs } from "@/components/modules/AuditLogs";
export const Route = createFileRoute("/superadmin/audit")({
  head: () => ({
    meta: [
      { title: "Audit Logs — Oxford Suites Makati HRMS" },
      { name: "description", content: "Full system activity trail across all HRMS modules and users." },
      { property: "og:title", content: "Audit Logs — Oxford Suites Makati HRMS" },
      { property: "og:description", content: "Full system activity trail across all HRMS modules and users." },
    ],
  }),
  component: () => <AuditLogs />,
});
