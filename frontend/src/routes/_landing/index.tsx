import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Briefcase, Clock, MapPin } from "lucide-react";

import { PublicShell } from "@/components/public/PublicShell";
import { ParallaxHero } from "@/components/public/ParallaxHero";
import { Reveal } from "@/components/public/Reveal";
import {
  AnnouncementsSection,
  BenefitGrid,
  FaqPreview,
  FinalCta,
  HiringProcess,
  LifeAtOxford,
  StatStrip,
} from "@/components/public/landing-sections";
import { Button } from "@/components/ui/button";
import { peso, useAnnouncements, useCompany, useLandingJobs } from "@/lib/landing";
import { useLightOnly } from "@/lib/theme";
import heroImage from "@/assets/hero-oxford-suites.jpg";

export const Route = createFileRoute("/_landing/")({
  head: () => ({
    meta: [
      { title: "Oxford Suites Makati — Hotel, Dining & Careers" },
      {
        name: "description",
        content:
          "Discover Oxford Suites Makati: elegant suites, distinctive dining, event venues, and hospitality careers with our HRMS recruitment portal.",
      },
      { property: "og:title", content: "Oxford Suites Makati — Hotel, Dining & Careers" },
      {
        property: "og:description",
        content:
          "Discover Oxford Suites Makati: elegant suites, distinctive dining, event venues, and hospitality careers with our HRMS recruitment portal.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "/oxford-mark-maroon.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Landing,
});

function Landing() {
  const { company } = useCompany();
  const { jobs, loading: jobsLoading } = useLandingJobs();
  const { announcements, loading: announcementsLoading } = useAnnouncements(3);
  const featured = jobs.slice(0, 3);
  const departments = new Set(jobs.map((job) => job.department).filter(Boolean)).size;

  useLightOnly();

  return (
    <PublicShell>
      <ParallaxHero
        image={heroImage}
        imageAlt="Oxford Suites Makati lobby with warm lighting and marble finishes"
        eyebrow={
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-gold/50 bg-black/25 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-gold backdrop-blur-sm">
              Now hiring
            </span>
          </div>
        }
        title="A career worth checking into."
        body={
          <div className="mt-5 max-w-xl">
            <p className="text-base leading-relaxed text-primary-foreground/85">
              {company.overview}
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-primary-foreground/75">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-gold" /> Makati City
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-gold" />
                {jobsLoading ? "Loading open roles" : `${jobs.length} open roles`}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-gold" /> 2–3 week hiring process
              </span>
            </div>
          </div>
        }
        actions={
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/jobs">
                Browse open roles <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/35 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link to="/about">Why Oxford Suites</Link>
            </Button>
          </div>
        }
      />

      <StatStrip jobsCount={jobs.length} departmentsCount={departments} loading={jobsLoading} />

      <BenefitGrid />
      <LifeAtOxford />
      <HiringProcess />

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <p className="eyebrow">Recruitment</p>
            <h2 className="mt-1.5 font-display text-3xl font-semibold tracking-tight md:text-4xl">
              Featured job openings
            </h2>
          </div>
          <Button asChild variant="outline">
            <Link to="/jobs">
              View all vacancies <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {jobsLoading ? (
            [0, 1, 2].map((index) => (
              <div
                key={index}
                className="space-y-4 rounded-xl border border-border bg-card p-6"
              >
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="h-7 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                <div className="h-16 w-full animate-pulse rounded bg-muted" />
                <div className="h-10 w-full animate-pulse rounded bg-muted" />
              </div>
            ))
          ) : featured.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center md:col-span-3">
              <p className="text-sm text-muted-foreground">
                No featured openings right now. Check back soon or view all vacancies.
              </p>
              <Button asChild className="mt-4" variant="outline">
                <Link to="/jobs">View all vacancies</Link>
              </Button>
            </div>
          ) : (
            featured.map((job, index) => {
              const slotsLeft = Math.max(0, job.vacancies - job.filled);
              return (
                <Reveal key={job.id} delay={index * 80}>
                  <article className="group flex h-full flex-col rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold uppercase tracking-wider text-gold">
                        {job.department || "Various departments"}
                      </span>
                      {slotsLeft > 0 && (
                        <span className="rounded-md bg-muted px-2 py-0.5 font-medium text-muted-foreground">
                          {slotsLeft} {slotsLeft === 1 ? "slot" : "slots"} left
                        </span>
                      )}
                    </div>

                    <h3 className="mt-3 font-display text-2xl font-semibold text-foreground transition-colors group-hover:text-primary">
                      {job.title}
                    </h3>

                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {job.employmentType}
                      {job.schedule ? ` · ${job.schedule}` : ""}
                    </p>

                    {job.salaryMax > 0 && (
                      <p className="mt-3 text-sm font-semibold text-foreground">
                        {peso(job.salaryMin)} – {peso(job.salaryMax)}{" "}
                        <span className="font-normal text-muted-foreground">/ month</span>
                      </p>
                    )}

                    <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {job.summary}
                    </p>

                    <div className="mt-6 border-t border-border pt-4">
                      <Button asChild className="w-full">
                        <Link to="/jobs/$jobId" params={{ jobId: job.id }}>
                          Apply now <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </article>
                </Reveal>
              );
            })
          )}
        </div>
      </section>

      <AnnouncementsSection announcements={announcements} loading={announcementsLoading} />

      <FaqPreview faqs={company.faqs} contactEmail={company.email} />

      <FinalCta />
    </PublicShell>
  );
}