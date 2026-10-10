import { createFileRoute } from "@tanstack/react-router";
import { ApplicantManagement } from "@/components/modules/ApplicantManagement";
export const Route = createFileRoute("/admin/_applicant-management/applicants")({
  validateSearch: (search: Record<string, unknown>) => ({
    highlight: typeof search.highlight === "string" ? search.highlight : undefined,
    tab: typeof search.tab === "string" ? search.tab : undefined,
  }),
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
  component: () => <ApplicantManagement role="admin" />,
});
