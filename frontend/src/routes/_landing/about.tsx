import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import { PublicShell } from "@/components/public/PublicShell";
import { VALUE_BODIES, useCompany } from "@/lib/landing";
import { useLightOnly } from "@/lib/theme";

export const Route = createFileRoute("/_landing/about")({
  head: () => ({
    meta: [
      { title: "About Us — Oxford Suites Makati" },
      {
        name: "description",
        content:
          "Learn about Oxford Suites Makati: our mission, vision, values, and history in Makati City.",
      },
      { property: "og:title", content: "About Us — Oxford Suites Makati" },
      {
        property: "og:description",
        content: "Our mission, vision, values, and history in the heart of Makati City.",
      },
    ],
  }),
  component: About,
});

const historyMilestones = [
  {
    year: "1995",
    era: "Chapter I",
    title: "Founding on P. Burgos",
    metric: "64 Keys · 48 Staff",
    body: "Oxford Suites Makati opened its doors on P. Burgos Street with 64 keys and a founding team of 48 hospitality professionals committed to Filipino warmth.",
  },
  {
    year: "2000",
    era: "Chapter II",
    title: "The First Expansion",
    metric: "128 Keys · Dining & Events",
    body: "The property doubled its room inventory to 128 keys, adding the Oxford Dining Room and Function & Banquet Halls to serve corporate and social events.",
  },
  {
    year: "2008",
    era: "Chapter III",
    title: "Wellness & Rooftop Living",
    metric: "24/7 Lifestyle Destination",
    body: "Launched the Rooftop Lounge & Bar and the 24-hour Wellness & Fitness Centre, establishing Oxford Suites as a full-service lifestyle destination in Makati.",
  },
  {
    year: "2015",
    era: "Chapter IV",
    title: "ISO 9001 Certification",
    metric: "Global Quality Benchmark",
    body: "Achieved ISO 9001 certification for quality management across all departments, reinforcing our commitment to consistent and exceptional service delivery.",
  },
  {
    year: "2020",
    era: "Chapter V",
    title: "Resilience & Digital Shift",
    metric: "Contactless & Online Portal",
    body: "Navigated the pandemic through a robust health and safety program, pivoting to contactless services and launching the online HRMS recruitment portal.",
  },
  {
    year: "2026",
    era: "Chapter VI",
    title: "Next-Gen Talent Platform",
    metric: "NLP-Assisted Recruitment",
    body: "Deployed a full-featured Human Resource Management System powered by NLP-assisted applicant screening, streamlining recruitment for all departments.",
  },
];

function About() {
  const { company } = useCompany();
  const [activeYearIdx, setActiveYearIdx] = useState(0);
  const [activeValue, setActiveValue] = useState<string | null>(null);

  useLightOnly();

  const currentMilestone = historyMilestones[activeYearIdx] ?? historyMilestones[0];
  const selectedValue = activeValue ?? company.values[0] ?? "";

  return (
    <PublicShell>
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24">
        {/* Editorial Hero Statement */}
        <header className="grid gap-8 border-b border-border pb-14 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <p className="eyebrow text-gold">Est. 1995 · Makati City</p>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.08] tracking-tight md:text-6xl">
              {company.name}
            </h1>
          </div>
          <p className="text-base leading-relaxed text-foreground/80 md:text-lg">
            {company.overview}
          </p>
        </header>

        {/* Architectural Fact Bar */}
        <div className="grid grid-cols-3 border-b border-border py-8">
          <div className="pr-4">
            <span className="block font-display text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
              {new Date().getFullYear() - 1995}+
            </span>
            <span className="mt-1.5 block text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Years in Makati
            </span>
          </div>
          <div className="border-x border-border px-4 md:px-8">
            <span className="block font-display text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
              128
            </span>
            <span className="mt-1.5 block text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Suites & Rooms
            </span>
          </div>
          <div className="pl-4 md:pl-8">
            <span className="block font-display text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
              {company.hours}
            </span>
            <span className="mt-1.5 block text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Concierge & Desk
            </span>
          </div>
        </div>

        {/* Asymmetric Mission & Vision Split */}
        <section className="grid gap-12 border-b border-border py-16 md:grid-cols-2 md:gap-16">
          <div className="space-y-3">
            <span className="font-mono text-xs uppercase tracking-widest text-gold">01 / Mission</span>
            <h2 className="font-display text-2xl font-semibold md:text-3xl">
              Hospitality rooted in genuine care
            </h2>
            <p className="pt-1 text-sm leading-relaxed text-muted-foreground md:text-base">
              {company.mission}
            </p>
          </div>
          <div className="space-y-3">
            <span className="font-mono text-xs uppercase tracking-widest text-gold">02 / Vision</span>
            <h2 className="font-display text-2xl font-semibold md:text-3xl">
              Setting the standard in Poblacion
            </h2>
            <p className="pt-1 text-sm leading-relaxed text-muted-foreground md:text-base">
              {company.vision}
            </p>
          </div>
        </section>

        {/* Interactive Values Index (No generic icon cards) */}
        <section className="border-b border-border py-16">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-gold">
                03 / Principles
              </span>
              <h2 className="mt-2 font-display text-3xl font-semibold md:text-4xl">
                What guides our team
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">Select a principle to explore</p>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div className="divide-y divide-border border-y border-border">
              {company.values.map((value, idx) => {
                const isActive = selectedValue === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onMouseEnter={() => setActiveValue(value)}
                    onClick={() => setActiveValue(value)}
                    className="group flex w-full items-center justify-between py-4 text-left transition-colors"
                  >
                    <div className="flex items-baseline gap-4">
                      <span className="font-mono text-xs text-muted-foreground">
                        0{idx + 1}
                      </span>
                      <span
                        className={`font-display text-2xl transition-all md:text-3xl ${
                          isActive
                            ? "translate-x-2 font-semibold text-primary"
                            : "text-foreground/70 group-hover:text-foreground"
                        }`}
                      >
                        {value}
                      </span>
                    </div>
                    <ArrowUpRight
                      className={`h-4 w-4 transition-all ${
                        isActive
                          ? "translate-x-0 text-gold opacity-100"
                          : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-60"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <div className="min-h-[200px] border-l-2 border-gold bg-muted/30 p-8 md:p-10">
              <p className="font-mono text-xs uppercase tracking-widest text-gold">
                Core Principle
              </p>
              <h3 className="mt-2 font-display text-3xl font-semibold text-foreground">
                {selectedValue}
              </h3>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                {VALUE_BODIES[selectedValue] ?? selectedValue}
              </p>
            </div>
          </div>
        </section>

        {/* Interactive Heritage Timeline */}
        <section className="py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-gold">
                04 / Heritage
              </span>
              <h2 className="mt-2 font-display text-3xl font-semibold md:text-4xl">
                Three decades on P. Burgos
              </h2>
            </div>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Join our next chapter <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Interactive Year Selector Track */}
          <div
            className="mt-10 flex gap-2 overflow-x-auto border-b border-border pb-4"
            role="tablist"
            aria-label="History milestones by year"
          >
            {historyMilestones.map((m, idx) => {
              const selected = idx === activeYearIdx;
              return (
                <button
                  key={m.year}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveYearIdx(idx)}
                  className={`shrink-0 px-5 py-2.5 font-mono text-sm transition-all ${
                    selected
                      ? "bg-primary font-semibold text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {m.year}
                </button>
              );
            })}
          </div>

          {/* Active Milestone Stage */}
          {currentMilestone && (
          <div className="mt-8 grid gap-6 md:grid-cols-[220px_1fr] md:items-start">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-gold">
                {currentMilestone.era}
              </p>
              <p className="mt-1 font-display text-5xl font-semibold tracking-tight text-foreground md:text-6xl">
                {currentMilestone.year}
              </p>
              <p className="mt-3 inline-block border border-border px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
                {currentMilestone.metric}
              </p>
            </div>

            <div className="max-w-2xl pt-1">
              <h3 className="font-display text-2xl font-semibold text-foreground md:text-3xl">
                {currentMilestone.title}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                {currentMilestone.body}
              </p>
            </div>
          </div>
          )}
        </section>
      </div>
    </PublicShell>
  );
}