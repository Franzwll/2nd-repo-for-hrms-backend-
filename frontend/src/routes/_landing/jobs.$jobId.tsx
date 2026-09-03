import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
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
import { cn } from "@/lib/utils";
import {
  isValidEmail,
  isValidName,
  isValidPhone,
  sanitizeName,
  sanitizePhone,
} from "@/lib/validation";

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
  const [resumeDragActive, setResumeDragActive] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumePreviewUrl, setResumePreviewUrl] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

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
    setResumeFile(file);
    // Validate type/size before extraction — same allow-list as Recruitment Management (add applicant)
    const okType = /\.(pdf|docx?|png|jpe?g|webp|heic|heif|bmp|gif|tiff|tif|avif|svg)$/i.test(file.name);
    if (!okType) {
      toast.error("Unsupported file — please use PDF, DOC, DOCX, PNG, JPG or JPEG.");
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
      // Apply same sanitization/validation as ApplicantManagement add applicant step 2
      if (pi.name?.trim() && isValidName(sanitizeName(pi.name.trim()))) {
        setName(sanitizeName(pi.name.trim()));
        filled.push("Full Name");
      } else if (pi.name?.trim()) {
        setName(sanitizeName(pi.name.trim()));
        filled.push("Full Name");
      }
      if (pi.email?.trim() && isValidEmail(pi.email.trim())) {
        setEmail(pi.email.trim());
        filled.push("Email");
      } else if (pi.email?.trim()) {
        // still fill but will be flagged on submit
        setEmail(pi.email.trim());
        filled.push("Email");
      }
      if (pi.phone?.trim()) {
        const normalized = normalizePHPhone(pi.phone);
        setPhone(sanitizePhone(normalized));
        filled.push("Phone");
      }
      if (pi.address?.trim()) {
        setLocation(pi.address.trim());
        filled.push("Location");
      }
      if (filled.length)
        toast.info(`Auto-filled ${filled.join(", ")} from resume — please review.`);
    } catch (e) {
      // silent — extraction is optional, user can still type manually
      console.warn("Resume extraction failed", e);
    } finally {
      setExtracting(false);
    }
  };

  // Preview URL for the uploaded resume (so user can see the file)
  useEffect(() => {
    if (!resumeFile) {
      setResumePreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(resumeFile);
    setResumePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [resumeFile]);

  return (
    <PublicShell>
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <Link
          to="/jobs"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to all jobs
        </Link>

        {/* Two-column layout — apply form on the right, top-aligned with the header */}
        <div className="mt-6 grid gap-8 md:grid-cols-[1fr_400px]">
          {/* Left column — poster header, gold rule, and job details */}
          <div className="min-w-0">
            {/* Header — poster on the left, vacancy info on the right */}
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              {job.picture && (
                <img
                  src={job.picture}
                  alt={`${job.title} hiring poster`}
                  className="h-44 w-40 shrink-0 rounded-md border border-border bg-white object-contain shadow-sm"
                />
              )}

              <div className="min-w-0 pt-1">
                <Badge variant="outline" className="border-gold/50 text-gold">
                  {job.department}
                </Badge>
                <h1 className="mt-3 font-display text-4xl font-semibold md:text-5xl">
                  {job.title}
                </h1>
                <p className="mt-2.5 text-sm text-foreground/75">
                  {job.employmentType} <span className="text-gold">·</span> {job.schedule}{" "}
                  <span className="text-gold">·</span> Makati City
                </p>
                <p className="mt-1.5 text-base font-semibold text-primary">
                  {peso(job.salaryMin)} — {peso(job.salaryMax)} per month
                </p>
              </div>
            </div>

            <div className="gold-rule mt-6" />

            {/* Job details */}
            <div className="mt-8">
              <section>
                <h2 className="font-display text-2xl font-semibold">Job Description</h2>
                <p className="mt-3 text-[15px] leading-relaxed text-foreground/75">
                  {job.description}
                </p>
              </section>

              <section className="mt-10">
                <h2 className="font-display text-2xl font-semibold">Responsibilities</h2>
                <ul className="mt-4 space-y-2.5">
                  {(job.responsibilities ?? []).map((r: string) => (
                    <li key={r} className="flex gap-2.5 text-[15px] text-foreground/75">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                      {r}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="mt-10">
                <h2 className="font-display text-2xl font-semibold">Qualifications</h2>
                <ul className="mt-4 space-y-2.5">
                  {(job.qualifications ?? []).map((r: string) => (
                    <li key={r} className="flex gap-2.5 text-[15px] text-foreground/75">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                      {r}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="mt-10">
                <h2 className="font-display text-2xl font-semibold">Benefits</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(job.benefits ?? []).map((b: string) => (
                    <span
                      key={b}
                      className="rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground/75"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </section>
            </div>
          </div>

          {/* Application form — top-aligned with the header, above the gold rule level */}
          <aside className="h-fit md:sticky md:top-24">
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
                      const loc = location.trim();
                      // Same validation as ApplicantManagement add applicant step 2
                      if (!n) {
                        toast.error("Full name is required.");
                        return;
                      }
                      if (!isValidName(n)) {
                        toast.error(
                          "Enter a valid full name (letters, spaces, hyphen, apostrophe, ≥2 chars).",
                        );
                        return;
                      }
                      if (!em) {
                        toast.error("Email address is required.");
                        return;
                      }
                      if (!isValidEmail(em)) {
                        toast.error("Enter a valid email address.");
                        return;
                      }
                      if (!ph) {
                        toast.error("Phone number is required.");
                        return;
                      }
                      if (!isValidPhone(ph)) {
                        toast.error("Enter a valid phone number (7–15 digits).");
                        return;
                      }
                      if (!loc) {
                        toast.error("Location is required.");
                        return;
                      }
                      if (loc.length < 2) {
                        toast.error("Enter a valid location (≥2 chars).");
                        return;
                      }
                      setApplying(true);
                      try {
                        let res;
                        if (resumeFile) {
                          const fd = new FormData();
                          fd.append("job_post_id", String(job.id));
                          fd.append("name", n);
                          fd.append("email", em);
                          fd.append("phone", ph);
                          fd.append("source", "Landing Page");
                          fd.append("summary", cover);
                          fd.append("resume", resumeFile);
                          res = await landingApi.apply(fd);
                        } else {
                          res = await landingApi.apply({
                            job_post_id: Number(job.id),
                            name: n,
                            email: em,
                            phone: ph,
                            source: "Landing Page",
                            summary: cover,
                          });
                        }
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
                      No account needed. Fields marked * are required.{" "}
                      {extracting && <span className="text-gold">Extracting from resume…</span>}
                    </p>

                    <div className="mt-5 space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          required
                          placeholder="Juan Dela Cruz"
                          value={name}
                          onChange={(e) => setName(sanitizeName(e.target.value))}
                        />
                        <p className="text-[11px] text-muted-foreground">
                          Letters, spaces, hyphen, apostrophe only (≥2 chars).
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          placeholder="juan@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          name="phone"
                          required
                          placeholder="+63 917 000 0000"
                          value={phone}
                          onChange={(e) => setPhone(sanitizePhone(e.target.value))}
                        />
                        <p className="text-[11px] text-muted-foreground">Digits 7–15, + allowed.</p>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="location">Location *</Label>
                        <Input
                          id="location"
                          name="location"
                          required
                          placeholder="Makati City"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="resume">
                          Resume / CV (optional){" "}
                          {extracting && <span className="text-xs text-gold">Extracting…</span>}
                        </Label>
                        <label
                          htmlFor="resume"
                          className={cn(
                            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-6 text-center transition-colors",
                            resumeDragActive
                              ? "border-primary bg-primary/10"
                              : "border-border bg-muted/40 hover:bg-muted/60",
                          )}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setResumeDragActive(true);
                          }}
                          onDragEnter={(e) => {
                            e.preventDefault();
                            setResumeDragActive(true);
                          }}
                          onDragLeave={(e) => {
                            e.preventDefault();
                            setResumeDragActive(false);
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            setResumeDragActive(false);
                            handleResumeExtract(e.dataTransfer.files?.[0] ?? null);
                          }}
                        >
                          {fileName ? (
                            <>
                              <FileText
                                className={cn(
                                  "h-9 w-9",
                                  resumeDragActive ? "text-primary" : "text-gold",
                                )}
                              />
                              <span className="text-sm font-medium text-foreground">
                                {fileName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {extracting
                                  ? "Extracting name, email, phone, location…"
                                  : "Drag a new file to replace or click to browse"}
                              </span>
                            </>
                          ) : (
                            <>
                              <Upload
                                className={cn(
                                  "h-9 w-9",
                                  resumeDragActive ? "text-primary" : "text-muted-foreground",
                                )}
                              />
                              <span className="text-sm text-muted-foreground">
                                Drag a file here or click to upload — PDF, DOC, DOCX, PNG, JPG (max 10MB) —
                                auto-fills name, email, phone, location
                              </span>
                            </>
                          )}
                        </label>
                        <Input
                          id="resume"
                          name="resume"
                          type="file"
                          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.heic,.heif,.bmp,.gif,.tiff,.tif,.avif,.svg"
                          className="sr-only"
                          onChange={(e) => handleResumeExtract(e.target.files?.[0] ?? null)}
                        />
                        {/* File name as clickable link — opens in new tab / downloads */}
                        {resumeFile && resumePreviewUrl && (
                          <div className="mt-2 flex items-center justify-between gap-2 rounded-md border border-border bg-card px-3 py-2">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <FileText className="h-4 w-4 shrink-0 text-gold" />
                              <a
                                href={resumePreviewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                download={resumeFile.name}
                                className="truncate text-xs font-medium text-primary underline underline-offset-2 hover:text-primary/80"
                                title="Click to open in new tab or download"
                              >
                                {resumeFile.name}
                              </a>
                              <span className="shrink-0 text-[11px] text-muted-foreground">
                                {(resumeFile.size / 1024).toFixed(0)} KB
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 shrink-0 text-xs text-muted-foreground"
                              onClick={() => {
                                setResumeFile(null);
                                setFileName("");
                                setResumePreviewUrl(null);
                                const el = document.getElementById(
                                  "resume",
                                ) as HTMLInputElement | null;
                                if (el) el.value = "";
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        )}
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
