import { createFileRoute } from "@tanstack/react-router";
import { MyRequestLanding } from "@/components/modules/my-request/MyRequestLanding";

export const Route = createFileRoute("/employee/_myrequest/my-requests/")({
  head: () => ({
    meta: [
      { title: "My Request — Oxford Suites Makati HRMS" },
      {
        name: "description",
        content: "File and track payroll, attendance, promotion, and document requests.",
      },
      { property: "og:title", content: "My Request — Oxford Suites Makati HRMS" },
      {
        property: "og:description",
        content: "File and track payroll, attendance, promotion, and document requests.",
      },
    ],
  }),
  component: MyRequestLanding,
});
