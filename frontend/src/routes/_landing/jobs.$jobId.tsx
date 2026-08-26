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
import { landingApi } from "@/lib/api";
import { mapJob, peso } from "@/lib/landing";

export const Route = createFileRoute("/_landing/jobs/$jobId")({
  loader: async ({ params }) => {
    try {
      const res = await landingApi.job(params.jobId);
      return { job: mapJob(res.data) };
    } catch {
      throw notFound();
    }
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Vacancy unavailable — Oxford Suites Makati" },
          { name: "robots", content: "noindex" },
        ],
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
  const [applying, setApplying] = useState(false);
  // Auto-fill fields from resume extraction (only name,email,phone,location)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [extracting, setExtracting] = useState(false);

  // Normalize PH phone (+63 → 0) for auto-fill
  const normalizePHPhone = (raw?: string | null) => {
    if (!raw) return "";
    let digits = raw.replace(/\D/g, "");
    if (digits.startsWith("63") && digits.length === 12) digits = "0" + digits.slice(2);
    if (digits.length < 7 || digits.length > 15) return raw.trim();
    return digits;
  };

  const handleResumeExtract = async (file: File | null) => {
    if (!file) return;
    setFileName(file.name);
    // Validate type/size before extraction
    const okType = /\.(pdf|docx?)$/i.test(file.name);
    if (!okType) {
      toast.error("Unsupported file — please use PDF or DOCX.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File larger than 10 MB.");
      return;
    }
    setExtracting(true);
    try {
      const fd = new FormData();
      fd.append("resume", file);
      const res = await landingApi.extractResume(fd);
      if (!res.success) return;
      const pi = res.personal_information ?? {};
      const filled: string[] = [];
      // Only auto-fill the 4 fields: full name, email, phone, location(address)
      if (pi.name?.trim()) {
        setName(pi.name.trim());
        filled.push("Full Name");
      }
      if (pi.email?.trim()) {
        setEmail(pi.email.trim());
        filled.push("Email");
      }
      if (pi.phone?.trim()) {
        setPhone(normalizePHPhone(pi.phone));
        filled.push("Phone");
      }
      if (pi.address?.trim()) {
        setLocation(pi.address.trim());
        filled.push("Location");
      }
      if (filled.length) toast.info(`Auto-filled ${filled.join(", ")} from resume — please review.`);
    } catch (e) {
      // silent — extraction is optional, user can still type manually
      console.warn("Resume extraction failed", e);
    } finally {
      setExtracting(false);
    }
  };

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
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {job.description}
              </p>
            </section>

            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold">Responsibilities</h2>
              <ul className="mt-3 space-y-2">
                {(job.responsibilities ?? []).map((r: string) => (
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
                {(job.qualifications ?? []).map((r: string) => (
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
                {(job.benefits ?? []).map((b: string) => (
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
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      const cover = String(fd.get("cover") ?? "").trim();
                      const n = name.trim();
                      const em = email.trim();
                      const ph = phone.trim();
                      if (!n || !em || !ph) {
                        toast.error("Please fill in the required fields.");
                        return;
                      }
                      setApplying(true);
                      try {
                        const res = await landingApi.apply({
                          job_post_id: Number(job.id),
                          name: n,
                          email: em,
                          phone: ph,
                          source: "Landing Page",
                          summary: cover,
                        });
                        setSubmitted(true);
                        toast.success("Application submitted", {
                          description: `Application ${res.data.applicant_code} for ${job.title} was received.`,
                        });
                      } catch (err: any) {
                        toast.error(
                          err?.message || "Unable to submit your application. Please try again.",
                        );
                      } finally {
                        setApplying(false);
                      }
                    }}
                  >
                    <h2 className="font-display text-2xl font-semibold">Apply for this job</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      No account needed. Fields marked * are required. {extracting && <span className="text-gold">Extracting from resume…</span>}
                    </p>

                    <div className="mt-5 space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input id="name" name="name" required placeholder="Juan Dela Cruz" value={name} onChange={(e) => setName(e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input id="email" name="email" type="email" required placeholder="juan@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input id="phone" name="phone" required placeholder="+63 917 000 0000" value={phone} onChange={(e) => setPhone(e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="location">Location *</Label>
                        <Input id="location" name="location" required placeholder="Makati City" value={location} onChange={(e) => setLocation(e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="resume">Resume / CV (optional) {extracting && <span className="text-xs text-gold">Extracting…</span>}</Label>
                        <label
                          htmlFor="resume"
                          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/40 px-4 py-6 text-center"
                        >
                          {fileName ? (
                            <>
                              <FileText className="h-5 w-5 text-gold" />
                              <span className="text-sm text-foreground">{fileName}</span>
                              {extracting && <span className="text-xs text-muted-foreground">Extracting name, email, phone, location…</span>}
                            </>
                          ) : (
                            <>
                              <Upload className="h-5 w-5 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                Click to upload — PDF, DOC, DOCX (max 5MB) — auto-fills name, email, phone, location
                              </span>
                            </>
                          )}
                        </label>
                        <Input
                          id="resume"
                          name="resume"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="sr-only"
                          onChange={(e) => handleResumeExtract(e.target.files?.[0] ?? null)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="cover">Cover Letter (optional)</Label>
                        <Textarea
                          id="cover"
                          name="cover"
                          rows={4}
                          placeholder="Tell us why you're a great fit."
                        />
                      </div>
                    </div>

                    <Button type="submit" className="mt-5 w-full" disabled={applying || extracting}>
                      {extracting ? "Extracting…" : applying ? "Submitting…" : "Submit Application"}
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
