import { createFileRoute } from "@tanstack/react-router";
import { ApplicantManagement } from "@/components/modules/ApplicantManagement";
export const Route = createFileRoute("/superadmin/_applicant-management/applicants")({
  head: () => ({
    meta: [
      { title: "Applicant Management — Oxford Suites Makati HRMS" },
      {
        name: "description",
        content: "NER resume screening, candidate ranking, interview scheduling and evaluation.",
      },
      { property: "og:title", content: "Applicant Management — Oxford Suites Makati HRMS" },
      {
        property: "og:description",
        content: "NER resume screening, candidate ranking, interview scheduling and evaluation.",
      },
    ],
  }),
  component: () => <ApplicantManagement role="superadmin" />,
});
