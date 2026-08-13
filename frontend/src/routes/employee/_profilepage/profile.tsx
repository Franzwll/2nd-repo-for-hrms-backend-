import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/components/modules/ProfilePage";
export const Route = createFileRoute("/employee/_profilepage/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — Oxford Suites Makati HRMS" },
      { name: "description", content: "Your employment record, contact details and information update requests." },
      { property: "og:title", content: "My Profile — Oxford Suites Makati HRMS" },
      { property: "og:description", content: "Your employment record, contact details and information update requests." },
    ],
  }),
  component: () => <ProfilePage role="employee" />,
});
