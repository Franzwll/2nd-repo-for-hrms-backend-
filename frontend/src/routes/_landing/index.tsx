import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Briefcase, Sparkles } from "lucide-react";

import { PublicShell } from "@/components/public/PublicShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { company, facilities } from "@/data/company";
import { jobs, peso } from "@/data/jobs";
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
    ],
  }),
  component: Landing,
});

function Landing() {
  const featured = jobs.filter((j) => j.active).slice(0, 3);

  return (
    <PublicShell>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <img
          src={heroImage}
          alt="Oxford Suites Makati lobby with warm lighting and marble finishes"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/70" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 md:px-8 md:py-32">
          <p className="eyebrow text-gold">{company.tagline}</p>
          <h1 className="mt-3 max-w-3xl font-display text-5xl font-semibold text-primary-foreground md:text-7xl">
            A career worth checking into.
          </h1>
          <p className="mt-5 max-w-xl text-base text-primary-foreground/80">
            {company.overview}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/jobs">
                Be One of Us <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link to="/about">About Oxford Suites</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Highlights — careers focused */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Briefcase,
              title: "Open Vacancies",
              body: `${jobs.filter((j) => j.active).length} live openings across front office, housekeeping, kitchen and service — updated daily.`,
            },
            {
              icon: Sparkles,
              title: "Smart Screening",
              body: "NLP-assisted resume screening means faster shortlisting, fairer ranking, and clearer feedback on your application.",
            },
            {
              icon: ArrowRight,
              title: "Apply in Minutes",
              body: "No account required. Submit your resume once and track your application status straight from the careers portal.",
            },
          ].map((h) => (
            <Card key={h.title} className="border-border/70">
              <CardContent className="p-6">
                <h.icon className="h-6 w-6 text-gold" />
                <h3 className="mt-4 font-display text-2xl font-semibold">{h.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{h.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>


      {/* Facilities */}
      <section className="border-y border-border bg-secondary/50">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
          <p className="eyebrow">Property</p>
          <h2 className="mt-1 font-display text-4xl font-semibold">Facilities & Services</h2>
          <div className="gold-rule my-6" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {facilities.map((f) => (
              <div key={f.name} className="rounded-md border border-border bg-card p-5">
                <h3 className="font-display text-xl font-semibold">{f.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured jobs */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Recruitment</p>
            <h2 className="mt-1 font-display text-4xl font-semibold">Featured Job Openings</h2>
          </div>
          <Button asChild variant="outline">
            <Link to="/jobs">View all vacancies</Link>
          </Button>
        </div>
        <div className="gold-rule my-6" />

        <div className="grid gap-6 md:grid-cols-3">
          {featured.map((job) => (
            <Card key={job.id} className="flex flex-col border-border/70">
              <CardContent className="flex flex-1 flex-col p-6">
                <Badge variant="outline" className="w-fit border-gold/50 text-gold">
                  {job.department}
                </Badge>
                <h3 className="mt-3 font-display text-2xl font-semibold">{job.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {job.employmentType} · {peso(job.salaryMin)} – {peso(job.salaryMax)} / month
                </p>
                <p className="mt-3 flex-1 text-sm text-muted-foreground">{job.summary}</p>
                <Button asChild className="mt-5 w-full">
                  <Link to="/jobs/$jobId" params={{ jobId: job.id }}>
                    Apply Now
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>


    </PublicShell>
  );
}
