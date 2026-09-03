import { createFileRoute } from "@tanstack/react-router";
import { NewHireOnboarding } from "@/components/modules/NewHireOnboarding";

export const Route = createFileRoute("/employee/_newhireonboarding/onboarding")({
  head: () => ({
    meta: [
      { title: "My Onboarding — Oxford Suites Makati HRMS" },
      {
        name: "description",
        content: "Complete your onboarding requirements and track your employment stage.",
      },
      { property: "og:title", content: "My Onboarding — Oxford Suites Makati HRMS" },
      {
        property: "og:description",
        content: "Complete your onboarding requirements and track your employment stage.",
      },
    ],
  }),
  component: () => <NewHireOnboarding role="employee" />,
});
