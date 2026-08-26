import { createFileRoute } from "@tanstack/react-router";
import { EmployeeRecords } from "@/components/modules/EmployeeRecords";
export const Route = createFileRoute("/admin/_employeerecords/employees")({
  head: () => ({
    meta: [
      { title: "Employee Records — Oxford Suites Makati HRMS" },
      {
        name: "description",
        content: "201 files, employment details, certificate and report generation.",
      },
      { property: "og:title", content: "Employee Records — Oxford Suites Makati HRMS" },
      {
        property: "og:description",
        content: "201 files, employment details, certificate and report generation.",
      },
    ],
  }),
  component: () => <EmployeeRecords role="admin" />,
});
