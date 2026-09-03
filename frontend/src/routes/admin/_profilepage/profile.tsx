import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/components/modules/ProfilePage";

export const Route = createFileRoute("/admin/_profilepage/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — HR Admin | Oxford Suites Makati HRMS" },
      {
        name: "description",
        content:
          "HR Admin account profile: personal details, contact information and account activity.",
      },
      { property: "og:title", content: "My Profile — HR Admin | Oxford Suites Makati HRMS" },
      {
        property: "og:description",
        content:
          "HR Admin account profile: personal details, contact information and account activity.",
      },
    ],
  }),
  component: () => <ProfilePage role="admin" />,
});
