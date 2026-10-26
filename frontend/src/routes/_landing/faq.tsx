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
import { Card, CardContent } from "@/components/ui/card";
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
      <div className="mx-auto max-w-4xl px-4 py-14 md:px-8">
        <p className="eyebrow">Support</p>
        <h1 className="mt-1 font-display text-4xl font-semibold md:text-5xl">
          Frequently Asked Questions
        </h1>
        <div className="gold-rule my-6" />
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">
          Everything you need to know about applying, screening, and starting a career at{" "}
          {company.name}. Still stuck? Our HR team is one message away.
        </p>

        {company.faqs.length === 0 ? (
          <Card className="mt-10 border-border/70">
            <CardContent className="flex flex-col items-center p-10 text-center">
              <LifeBuoy className="h-10 w-10 text-gold" />
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
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="FAQ categories">
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
                        ? "rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground"
                        : "rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                    }
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 space-y-10">
              {groups.map((group) => (
                <section key={group.category} aria-labelledby={`faq-${group.category}`}>
                  <div className="flex items-end justify-between gap-4">
                    <h2
                      id={`faq-${group.category}`}
                      className="font-display text-2xl font-semibold"
                    >
                      {group.category}
                    </h2>
                    <span className="text-xs text-muted-foreground">
                      {group.items.length} {group.items.length === 1 ? "answer" : "answers"}
                    </span>
                  </div>
                  <Accordion type="single" collapsible className="mt-3 w-full">
                    {group.items.map((faq, index) => (
                      <AccordionItem
                        key={`${group.category}-${index}`}
                        value={`${group.category}-${index}`}
                      >
                        <AccordionTrigger className="text-left font-medium">
                          {faq.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </section>
              ))}
            </div>

            <Card className="mt-12 overflow-hidden border-border/70 bg-secondary/40">
              <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="eyebrow">Still have questions?</p>
                  <h2 className="mt-1 font-display text-2xl font-semibold">
                    Talk to our recruitment team
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Email {company.email} or call {company.phone}. We reply within 1-2 working days.
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button asChild>
                    <Link to="/contact">
                      Contact HR <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/jobs">Browse jobs</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PublicShell>
  );
}
