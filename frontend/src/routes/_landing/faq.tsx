import { createFileRoute } from "@tanstack/react-router";

import { PublicShell } from "@/components/public/PublicShell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqs } from "@/data/company";

export const Route = createFileRoute("/_landing/faq")({
  head: () => ({
    meta: [
      { title: "Applicant FAQs — Oxford Suites Makati Careers" },
      {
        name: "description",
        content:
          "Answers about applying to Oxford Suites Makati: required documents, resume screening, hiring timeline, and entry-level roles.",
      },
      { property: "og:title", content: "Applicant FAQs — Oxford Suites Makati Careers" },
      {
        property: "og:description",
        content: "Documents, screening, and timelines for applicants at Oxford Suites Makati.",
      },
    ],
  }),
  component: Faq,
});

function Faq() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-3xl px-4 py-14 md:px-8">
        <p className="eyebrow">Support</p>
        <h1 className="mt-1 font-display text-4xl font-semibold md:text-5xl">
          Frequently Asked Questions
        </h1>
        <div className="gold-rule my-6" />
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f, i) => (
            <AccordionItem key={f.q} value={`item-${i}`}>
              <AccordionTrigger className="text-left font-medium">{f.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </PublicShell>
  );
}
