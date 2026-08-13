import { createFileRoute } from "@tanstack/react-router";
import {
  Award,
  Building2,
  Calendar,
  CheckCircle,
  Heart,
  Shield,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";

import { PublicShell } from "@/components/public/PublicShell";
import { Card, CardContent } from "@/components/ui/card";
import { company } from "@/data/company";

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

const valueIcons: Record<string, React.ElementType> = {
  Warmth: Heart,
  Craft: Star,
  Integrity: Shield,
  Growth: TrendingUp,
};

const historyMilestones = [
  {
    year: "1995",
    icon: Building2,
    title: "Founding",
    body: "Oxford Suites Makati opened its doors on P. Burgos Street with 64 keys and a founding team of 48 hospitality professionals committed to Filipino warmth.",
  },
  {
    year: "2000",
    icon: Award,
    title: "First Expansion",
    body: "The property doubled its room inventory to 128 keys, adding the Oxford Dining Room and Function & Banquet Halls to serve corporate and social events.",
  },
  {
    year: "2008",
    icon: Users,
    title: "Wellness & F&B Growth",
    body: "Launched the Rooftop Lounge & Bar and the 24-hour Wellness & Fitness Centre, establishing Oxford Suites as a full-service lifestyle destination in Makati.",
  },
  {
    year: "2015",
    icon: CheckCircle,
    title: "ISO Certification",
    body: "Achieved ISO 9001 certification for quality management across all departments, reinforcing our commitment to consistent and exceptional service delivery.",
  },
  {
    year: "2020",
    icon: Shield,
    title: "Resilience & Digital Shift",
    body: "Navigated the pandemic through a robust health and safety program, pivoting to contactless services and launching the online HRMS recruitment portal.",
  },
  {
    year: "2026",
    icon: TrendingUp,
    title: "HRMS Innovation",
    body: "Deployed a full-featured Human Resource Management System powered by NLP-assisted applicant screening, streamlining recruitment for all departments.",
  },
];

function About() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-5xl px-4 py-14 md:px-8">
        <p className="eyebrow">About</p>
        <h1 className="mt-1 font-display text-4xl font-semibold md:text-5xl">{company.name}</h1>
        <div className="gold-rule my-6" />
        <p className="text-base leading-relaxed text-muted-foreground">{company.overview}</p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <h2 className="font-display text-2xl font-semibold">Our Mission</h2>
              <p className="mt-2 text-sm text-muted-foreground">{company.mission}</p>
            </CardContent>
          </Card>
          <Card className="border-border/70">
            <CardContent className="p-6">
              <h2 className="font-display text-2xl font-semibold">Our Vision</h2>
              <p className="mt-2 text-sm text-muted-foreground">{company.vision}</p>
            </CardContent>
          </Card>
        </div>

        {/* Values with icons */}
        <h2 className="mt-12 font-display text-3xl font-semibold">Our Values</h2>
        <div className="gold-rule my-5" />
        <div className="grid gap-6 sm:grid-cols-2">
          {company.values.map((v) => {
            const Icon = valueIcons[v.title] ?? Star;
            return (
              <div key={v.title} className="flex gap-4 rounded-md border border-border bg-card p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-primary">{v.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{v.body}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* History timeline */}
        <h2 className="mt-12 font-display text-3xl font-semibold">Our History</h2>
        <div className="gold-rule my-5" />
        <p className="mb-8 text-sm text-muted-foreground">
          Over three decades of hospitality excellence in the heart of Makati City.
        </p>
        <div className="relative space-y-0">
          {/* Vertical connector line */}
          <div className="absolute left-[2.25rem] top-4 hidden h-[calc(100%-2rem)] w-px bg-border sm:block" />
          {historyMilestones.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div key={m.year} className="relative flex gap-5 pb-8 last:pb-0">
                {/* Icon bubble */}
                <div className="relative z-10 flex h-[4.5rem] w-[4.5rem] shrink-0 flex-col items-center justify-center rounded-full border-2 border-border bg-card shadow-sm">
                  <Icon className="h-5 w-5 text-gold" />
                  <span className="mt-0.5 text-[0.6rem] font-bold tracking-wider text-muted-foreground">
                    {m.year}
                  </span>
                </div>
                {/* Content */}
                <div className="flex-1 rounded-md border border-border bg-card p-4">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[0.65rem] font-bold tracking-widest text-gold">
                      {m.year}
                    </span>
                    <h3 className="font-display text-lg font-semibold">{m.title}</h3>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{m.body}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Team stat */}
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Years in operation", value: `${new Date().getFullYear() - 1995}+` },
            { label: "Team members", value: "200+" },
            { label: "Guest satisfaction", value: "94%" },
          ].map((s) => (
            <div key={s.label} className="rounded-md border border-border bg-card p-5 text-center">
              <p className="font-display text-4xl font-semibold text-primary">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </PublicShell>
  );
}
