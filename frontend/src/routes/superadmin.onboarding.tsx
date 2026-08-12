import { createFileRoute } from "@tanstack/react-router";
import { NewHireOnboarding } from "@/components/modules/NewHireOnboarding";
export const Route = createFileRoute("/superadmin/onboarding")({
  head: () => ({
    meta: [
      { title: "New Hire Onboarding — Oxford Suites Makati HRMS" },
      { name: "description", content: "Pre-onboarding, probationary and regularization tracking with requirement checklists." },
      { property: "og:title", content: "New Hire Onboarding — Oxford Suites Makati HRMS" },
      { property: "og:description", content: "Pre-onboarding, probationary and regularization tracking with requirement checklists." },
    ],
  }),
  component: () => <NewHireOnboarding role="superadmin" />,
});
