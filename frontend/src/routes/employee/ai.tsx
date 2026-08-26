import { createFileRoute } from "@tanstack/react-router";
import { EmployeeAiPage } from "@/components/modules/EmployeeAiPage";

export const Route = createFileRoute("/employee/ai")({
  head: () => ({
    meta: [
      { title: "HR AI Concierge — Oxford Suites Makati HRMS" },
      { name: "description", content: "24/7 personal HR assistant and knowledge base for Oxford Suites Makati employees." },
      { property: "og:title", content: "HR AI Concierge — Oxford Suites Makati HRMS" },
      { property: "og:description", content: "24/7 personal HR assistant and knowledge base for Oxford Suites Makati employees." },
    ],
  }),
  component: () => <EmployeeAiPage />,
});
