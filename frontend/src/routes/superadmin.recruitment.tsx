import { createFileRoute } from "@tanstack/react-router";
import { RecruitmentManagement } from "@/components/modules/RecruitmentManagement";
export const Route = createFileRoute("/superadmin/recruitment")({
  head: () => ({
    meta: [
      { title: "Recruitment Management — Oxford Suites Makati HRMS" },
      { name: "description", content: "Job post builder with multi-platform previews, vacancy status and posting list." },
      { property: "og:title", content: "Recruitment Management — Oxford Suites Makati HRMS" },
      { property: "og:description", content: "Job post builder with multi-platform previews, vacancy status and posting list." },
    ],
  }),
  component: () => <RecruitmentManagement role="superadmin" />,
});
