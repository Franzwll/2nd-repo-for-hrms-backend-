import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FileText,
  Heart,
  MapPin,
  MessageSquare,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/public/Reveal";
import { benefits, hiringSteps } from "@/data/company";
import type { LandingAnnouncement, LandingFaq } from "@/lib/landing";
import dining from "@/assets/hero-dining.jpg";
import lobby from "@/assets/hero-lobby.jpg";
import team from "@/assets/hero-team.jpg";
import rooftop from "@/assets/frame-rooftop.jpg";
import suite from "@/assets/frame-suite.jpg";
import tower from "@/assets/oxford-tower.jpg";

export function SectionHeading({
  eyebrow,
  title,
  body,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  body?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-1 font-display text-3xl font-semibold md:text-4xl">{title}</h2>
      {body ? <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p> : null}
      <div
        className={
          align === "center" ? "gold-rule mx-auto my-5 max-w-xs" : "gold-rule my-5 max-w-xs"
        }
      />
    </div>
  );
}

export function StatStrip({
  jobsCount,
  departmentsCount,
  loading = false,
}: {
  jobsCount: number;
  departmentsCount: number;
  loading?: boolean;
}) {
  const stats = [
    { icon: Briefcase, value: loading ? "—" : String(jobsCount), label: "Open roles" },
    {
      icon: Building2,
      value: loading ? "—" : String(departmentsCount),
      label: "Departments hiring",
    },
    {
      icon: CalendarDays,
      value: `${new Date().getFullYear() - 1995}+`,
      label: "Years in operation",
    },
    { icon: MapPin, value: "Makati", label: "Hotel location" },
  ];

  return (
    <section className="relative z-10 mx-auto -mt-10 max-w-6xl px-4 md:px-8">
      <Reveal>
        <div className="grid overflow-hidden rounded-xl border border-border bg-card shadow-xl sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-1 border-b border-border px-6 py-6 text-center last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"
            >
              <stat.icon className="h-5 w-5 text-gold" />
              <span className="mt-1 font-display text-3xl font-semibold text-primary">
                {stat.value}
              </span>
              <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

const benefitIcons = [TrendingUp, Heart, Sparkles, MapPin];

export function BenefitGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
      <SectionHeading
        eyebrow="Why Oxford"
        title="A workplace built around people"
        body="We combine the warmth of Filipino hospitality with the structure and support that lets careers grow."
      />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map((benefit, index) => {
          const Icon = benefitIcons[index] ?? Sparkles;
          return (
            <Reveal key={benefit.title} delay={index * 80}>
              <Card className="h-full border-border/70 bg-gradient-to-br from-card to-secondary/30 transition-transform duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 font-display text-2xl font-semibold">{benefit.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {benefit.body}
                  </p>
                </CardContent>
              </Card>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

const lifeImages = [
  {
    src: lobby,
    alt: "Warm lobby of Oxford Suites Makati",
    title: "The lobby",
    body: "Where guests and teammates meet.",
    className: "md:col-span-2 md:row-span-2",
  },
  {
    src: suite,
    alt: "Guest suite at Oxford Suites Makati",
    title: "Guest rooms",
    body: "128 keys, one standard of care.",
    className: "md:col-span-2",
  },
  {
    src: dining,
    alt: "Dining room at Oxford Suites Makati",
    title: "Dining",
    body: "Filipino warmth on every plate.",
    className: "",
  },
  {
    src: team,
    alt: "Oxford Suites Makati team at work",
    title: "Our people",
    body: "The heart of the guest experience.",
    className: "",
  },
  {
    src: rooftop,
    alt: "Rooftop lounge at Oxford Suites Makati",
    title: "Rooftop",
    body: "Sunset service above Burgos Street.",
    className: "md:col-span-2",
  },
  {
    src: tower,
    alt: "Oxford Suites Makati exterior",
    title: "Makati",
    body: "In the middle of the city's best.",
    className: "md:col-span-2",
  },
];

export function LifeAtOxford() {
  return (
    <section className="bg-secondary/40 py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeading
          eyebrow="Life at Oxford"
          title="A place you will be proud to work"
          body="From the front desk to the kitchen, every department shapes the experience our guests remember."
        />
        <div className="mt-8 grid auto-rows-[170px] gap-4 sm:grid-cols-2 md:grid-cols-4">
          {lifeImages.map((image, index) => (
            <Reveal key={image.title} delay={index * 60} className={image.className}>
              <figure className="group relative h-full overflow-hidden rounded-xl border border-border bg-card">
                <img
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <figcaption className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="font-display text-xl font-semibold">{image.title}</p>
                  <p className="mt-1 text-xs text-white/80">{image.body}</p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const stepIcons = [FileText, Search, MessageSquare, ClipboardCheck, CheckCircle2];

export function HiringProcess() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
      <SectionHeading
        eyebrow="Hiring process"
        title="From application to first day"
        body="A clear, human process. Most applicants hear from us within 3-5 working days."
        align="center"
      />
      <div className="mt-10 grid gap-5 md:grid-cols-5">
        {hiringSteps.map((step, index) => {
          const Icon = stepIcons[index] ?? CheckCircle2;
          return (
            <Reveal key={step.title} delay={index * 70}>
              <div className="relative h-full rounded-lg border border-border bg-card p-5">
                <span className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-gold">
                  Step {String(index + 1).padStart(2, "0")}
                </span>
                <span className="mt-4 grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function formatAnnouncementDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function AnnouncementsSection({
  announcements,
  loading = false,
}: {
  announcements: LandingAnnouncement[];
  loading?: boolean;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading
          eyebrow="Newsroom"
          title="What is happening at Oxford"
          body="Hiring events, recognition, and updates from across the property."
        />
        <Button asChild variant="outline">
          <Link to="/jobs">
            View openings <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {loading
          ? [0, 1, 2].map((index) => (
              <Card key={index} className="border-border/70">
                <CardContent className="space-y-4 p-6">
                  <div className="h-3 w-24 animate-pulse rounded bg-primary/10" />
                  <div className="h-6 w-3/4 animate-pulse rounded bg-primary/10" />
                  <div className="h-4 w-full animate-pulse rounded bg-primary/10" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-primary/10" />
                </CardContent>
              </Card>
            ))
          : announcements.slice(0, 3).map((announcement, index) => (
              <Reveal key={announcement.id} delay={index * 80}>
                <Card className="h-full border-border/70 transition-transform duration-300 hover:-translate-y-1">
                  <CardContent className="flex h-full flex-col p-6">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5 text-gold" />
                      {announcement.date ? formatAnnouncementDate(announcement.date) : "Update"}
                    </div>
                    <h3 className="mt-3 font-display text-2xl font-semibold">
                      {announcement.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {announcement.body}
                    </p>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
      </div>
    </section>
  );
}

export function FaqPreview({ faqs, contactEmail }: { faqs: LandingFaq[]; contactEmail: string }) {
  return (
    <section className="bg-secondary/40 py-20">
      <div className="mx-auto max-w-4xl px-4 md:px-8">
        <SectionHeading
          eyebrow="FAQ"
          title="Questions before you apply?"
          body="Quick answers about documents, screening, and timelines. If you need more, our HR team is happy to help."
          align="center"
        />
        {faqs.length === 0 ? (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Our FAQs are being updated. Email {contactEmail} and we will help you directly.
          </p>
        ) : (
          <Accordion
            type="single"
            collapsible
            className="mt-8 w-full rounded-lg border border-border bg-card px-5"
          >
            {faqs.slice(0, 4).map((faq, index) => (
              <AccordionItem key={`${faq.q}-${index}`} value={`preview-${index}`}>
                <AccordionTrigger className="text-left font-medium">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
        <div className="mt-6 text-center">
          <Button asChild variant="outline">
            <Link to="/faq">
              Read all FAQs <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-primary">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-gold/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl"
      />
      <div className="relative mx-auto max-w-5xl px-4 py-16 text-center md:px-8 md:py-20">
        <p className="eyebrow text-gold">Join the team</p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-primary-foreground md:text-5xl">
          Ready to check in?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-primary-foreground/80 md:text-base">
          Find a role that fits your craft. Apply online in minutes, and let our recruitment team
          take it from there.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90">
            <Link to="/jobs">
              Browse open roles <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <Link to="/contact">Talk to HR</Link>
          </Button>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-primary-foreground/70">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-gold" /> 528 P. Burgos Street, Makati City
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-gold" /> HR open 24 hours
          </span>
          <Badge
            variant="outline"
            className="border-primary-foreground/30 text-primary-foreground/80"
          >
            No account required
          </Badge>
        </div>
      </div>
    </section>
  );
}
