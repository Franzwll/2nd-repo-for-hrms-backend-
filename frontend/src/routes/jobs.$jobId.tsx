import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, FileText, Upload } from "lucide-react";
import { toast } from "sonner";

import { PublicShell } from "@/components/public/PublicShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getJob, peso } from "@/data/jobs";

export const Route = createFileRoute("/jobs/$jobId")({
  loader: ({ params }) => {
    const job = getJob(params.jobId);
    if (!job) throw notFound();
    return { job };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Vacancy unavailable — Oxford Suites Makati" }, { name: "robots", content: "noindex" }],
      };
    }
    const { job } = loaderData;
    const title = `${job.title} — Careers at Oxford Suites Makati`;
    return {
      meta: [
        { title },
        { name: "description", content: job.summary },
        { property: "og:title", content: title },
        { property: "og:description", content: job.summary },
      ],
    };
  },
  component: JobDetail,
});

function JobDetail() {
  const { job } = Route.useLoaderData();
  const [submitted, setSubmitted] = useState(false);
  const [fileName, setFileName] = useState("");

  return (
    <PublicShell>
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <Link
          to="/jobs"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to all jobs
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Job details */}
          <div>
            <Badge variant="outline" className="border-gold/50 text-gold">
              {job.department}
            </Badge>
            <h1 className="mt-3 font-display text-4xl font-semibold md:text-5xl">{job.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {job.employmentType} · {job.schedule} · Makati City
            </p>
            <p className="mt-1 text-base font-medium text-primary">
              {peso(job.salaryMin)} – {peso(job.salaryMax)} per month
            </p>
            <div className="gold-rule my-6" />

            <section>
              <h2 className="font-display text-2xl font-semibold">Job Description</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{job.description}</p>
            </section>

            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold">Responsibilities</h2>
              <ul className="mt-3 space-y-2">
                {job.responsibilities.map((r: string) => (
                  <li key={r} className="flex gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    {r}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold">Qualifications</h2>
              <ul className="mt-3 space-y-2">
                {job.qualifications.map((r: string) => (
                  <li key={r} className="flex gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    {r}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold">Benefits</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {job.benefits.map((b: string) => (
                  <span
                    key={b}
                    className="rounded border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </section>
          </div>

          {/* Application form */}
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <Card className="border-border/70">
              <CardContent className="p-6">
                {submitted ? (
                  <div className="py-6 text-center">
                    <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
                    <h2 className="mt-4 font-display text-2xl font-semibold">
                      Application received
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Your resume is queued for NLP screening. Our recruiters contact shortlisted
                      applicants within 3–5 working days.
                    </p>
                    <Button asChild variant="outline" className="mt-5 w-full">
                      <Link to="/jobs">Browse more jobs</Link>
                    </Button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setSubmitted(true);
                      toast.success("Application submitted", {
                        description: `Your application for ${job.title} was received.`,
                      });
                    }}
                  >
                    <h2 className="font-display text-2xl font-semibold">Apply for this job</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      No account needed. Fields marked * are required.
                    </p>

                    <div className="mt-5 space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input id="name" required placeholder="Juan Dela Cruz" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input id="email" type="email" required placeholder="juan@email.com" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input id="phone" required placeholder="+63 917 000 0000" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="location">Location *</Label>
                        <Input id="location" required placeholder="Makati City" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="resume">Resume / CV *</Label>
                        <label
                          htmlFor="resume"
                          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/40 px-4 py-6 text-center"
                        >
                          {fileName ? (
                            <>
                              <FileText className="h-5 w-5 text-gold" />
                              <span className="text-sm text-foreground">{fileName}</span>
                            </>
                          ) : (
                            <>
                              <Upload className="h-5 w-5 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                Click to upload — PDF, DOC, DOCX (max 5MB)
                              </span>
                            </>
                          )}
                        </label>
                        <Input
                          id="resume"
                          type="file"
                          required
                          accept=".pdf,.doc,.docx"
                          className="sr-only"
                          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="cover">Cover Letter (optional)</Label>
                        <Textarea id="cover" rows={4} placeholder="Tell us why you're a great fit." />
                      </div>
                    </div>

                    <Button type="submit" className="mt-5 w-full">
                      Submit Application
                    </Button>
                    <p className="mt-3 text-xs text-muted-foreground">
                      By submitting, you consent to the processing of your data for recruitment
                      purposes under the Data Privacy Act of 2012.
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </PublicShell>
  );
}
