import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/components/modules/ProfilePage";

export const Route = createFileRoute("/superadmin/_profilepage/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — Super Admin | Oxford Suites Makati HRMS" },
      { name: "description", content: "Super Admin account profile: personal details, contact information and account activity." },
      { property: "og:title", content: "My Profile — Super Admin | Oxford Suites Makati HRMS" },
      { property: "og:description", content: "Super Admin account profile: personal details, contact information and account activity." },
    ],
  }),
  component: () => <ProfilePage role="superadmin" />,
});
