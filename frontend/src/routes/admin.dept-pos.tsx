import { createFileRoute } from "@tanstack/react-router";
import { DeptPosModule } from "@/components/modules/CoreHCM";

export const Route = createFileRoute("/admin/dept-pos")({
  head: () => ({
    meta: [
      { title: "Department, Positions & Salary Grades — Oxford Suites HRMS" },
      { name: "description", content: "Departments, position master list, salary grade management and vacancy requisitions." },
    ],
  }),
  component: () => <DeptPosModule role="admin" />,
});
