import { createFileRoute } from "@tanstack/react-router";
import { UserManagement } from "@/components/modules/Settings";
export const Route = createFileRoute("/superadmin/_usermanagement/users")({
  head: () => ({
    meta: [
      { title: "User Management — Oxford Suites Makati HRMS" },
      { name: "description", content: "System accounts, login activity and per-module permission matrix." },
      { property: "og:title", content: "User Management — Oxford Suites Makati HRMS" },
      { property: "og:description", content: "System accounts, login activity and per-module permission matrix." },
    ],
  }),
  component: () => <UserManagement />,
});
