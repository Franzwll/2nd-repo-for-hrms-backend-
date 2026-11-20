import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, LifeBuoy, Mail, Phone } from "lucide-react";

import { PublicShell } from "@/components/public/PublicShell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useCompany, type LandingFaq } from "@/lib/landing";
import { useLightOnly } from "@/lib/theme";

export const Route = createFileRoute("/_landing/faq")({
  head: () => ({
    meta: [
      { title: "Applicant FAQs — Oxford Suites Makati Careers" },
      {
        name: "description",
        content:
          "Answers about applying to Oxford Suites Makati: required documents, resume screening, hiring timeline, eligibility, benefits, and entry-level roles.",
      },
      { property: "og:title", content: "Applicant FAQs — Oxford Suites Makati Careers" },
      {
        property: "og:description",
        content:
          "Documents, screening, timelines, and benefits for applicants at Oxford Suites Makati.",
      },
    ],
  }),
  component: Faq,
});

const CATEGORY_ORDER = [
  "Applying",
  "Screening & interviews",
  "Eligibility",
  "Working at Oxford",
  "General",
];

function categoryOf(faq: LandingFaq): string {
  return faq.category?.trim() || "General";
}

function Faq() {
  const { company } = useCompany();
  const [activeCategory, setActiveCategory] = useState("All");

  useLightOnly();

  const categories = useMemo(() => {
    const found = new Set(company.faqs.map(categoryOf));
    const ordered = CATEGORY_ORDER.filter((category) => found.has(category));
    const extra = [...found].filter((category) => !CATEGORY_ORDER.includes(category)).sort();
    return ["All", ...ordered, ...extra];
  }, [company.faqs]);

  const visibleFaqs = useMemo(
    () =>
      activeCategory === "All"
        ? company.faqs
        : company.faqs.filter((faq) => categoryOf(faq) === activeCategory),
    [activeCategory, company.faqs],
  );

  const groups = useMemo(() => {
    const order = CATEGORY_ORDER.filter((category) =>
      visibleFaqs.some((faq) => categoryOf(faq) === category),
    );
    const extra = [...new Set(visibleFaqs.map(categoryOf))]
      .filter((category) => !CATEGORY_ORDER.includes(category))
      .sort();
    return [...order, ...extra].map((category) => ({
      category,
      items: visibleFaqs.filter((faq) => categoryOf(faq) === category),
    }));
  }, [visibleFaqs]);

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: company.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  }).replace(/</g, "\\u003c");

  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <div className="mx-auto max-w-4xl px-4 py-16 md:px-8">
        <header className="max-w-2xl">
          <p className="eyebrow">Support</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Everything you need to know about applying, screening, and starting a career at{" "}
            {company.name}.
          </p>
        </header>

        {company.faqs.length === 0 ? (
          <div className="mt-12 flex flex-col items-center rounded-xl border border-border bg-card p-12 text-center">
            <LifeBuoy className="h-8 w-8 text-gold" />
            <h2 className="mt-4 font-display text-2xl font-semibold">FAQs are being updated</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Our careers team is refreshing these answers. In the meantime, reach out and we will
              help you personally.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild>
                <a href={`mailto:${company.email}`}>
                  <Mail className="mr-2 h-4 w-4" /> Email HR
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href={`tel:${company.phone.replace(/[^\d+]/g, "")}`}>
                  <Phone className="mr-2 h-4 w-4" /> Call HR
                </a>
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Minimalist Category Bar */}
            <div
              className="mt-10 flex flex-wrap gap-2 border-b border-border pb-4"
              role="group"
              aria-label="FAQ categories"
            >
              {categories.map((category) => {
                const selected = activeCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    aria-pressed={selected}
                    className={
                      selected
                        ? "rounded-lg bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground shadow-xs"
                        : "rounded-lg px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    }
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            {/* Accordion Groups */}
            <div className="mt-10 space-y-12">
              {groups.map((group) => (
                <section key={group.category} aria-labelledby={`faq-${group.category}`}>
                  <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
                    <h2
                      id={`faq-${group.category}`}
                      className="font-display text-xl font-semibold text-foreground"
                    >
                      {group.category}
                    </h2>
                    <span className="text-xs font-medium text-muted-foreground">
                      {group.items.length} {group.items.length === 1 ? "question" : "questions"}
                    </span>
                  </div>
                  <Accordion type="single" collapsible className="mt-2 w-full">
                    {group.items.map((faq, index) => (
                      <AccordionItem
                        key={`${group.category}-${index}`}
                        value={`${group.category}-${index}`}
                        className="border-border/80"
                      >
                        <AccordionTrigger className="py-4 text-left text-[15px] font-medium hover:text-primary hover:no-underline">
                          {faq.q}
                        </AccordionTrigger>
                        <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </section>
              ))}
            </div>

            {/* Bottom Support Callout */}
            <div className="mt-14 flex flex-col justify-between gap-6 rounded-xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:p-8">
              <div>
                <p className="eyebrow">Still have questions?</p>
                <h2 className="mt-1 font-display text-2xl font-semibold">
                  Talk to our recruitment team
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Email {company.email} or call {company.phone}. We reply within 1–2 working days.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-3">
                <Button asChild>
                  <Link to="/contact">
                    Contact HR <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/jobs">Browse jobs</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </PublicShell>
  );
}