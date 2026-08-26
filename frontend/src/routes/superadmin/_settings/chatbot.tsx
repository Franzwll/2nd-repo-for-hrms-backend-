import { createFileRoute } from "@tanstack/react-router";
import { ChatbotFaqPage } from "@/components/modules/ChatbotFaq";
export const Route = createFileRoute("/superadmin/_settings/chatbot")({
  head: () => ({
    meta: [
      { title: "Chatbot FAQ — Oxford Suites Makati HRMS" },
      { name: "description", content: "Manage the landing-page careers assistant FAQ entries." },
      { property: "og:title", content: "Chatbot FAQ — Oxford Suites Makati HRMS" },
      {
        property: "og:description",
        content: "Manage the landing-page careers assistant FAQ entries.",
      },
    ],
  }),
  component: () => <ChatbotFaqPage role="superadmin" />,
});
