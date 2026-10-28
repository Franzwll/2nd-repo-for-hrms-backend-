import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { PublicShell } from "@/components/public/PublicShell";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  UnifiedDocumentsUploader,
  pickResumeDoc,
  type UnifiedDoc,
} from "@/components/documents/UnifiedDocumentsUploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { landingApi } from "@/lib/api";
import { mapJob, peso } from "@/lib/landing";
import { useLightOnly } from "@/lib/theme";
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
  const [successOpen, setSuccessOpen] = useState(false);
  const [application, setApplication] = useState<{
    code: string;
    dropped: number;
  } | null>(null);
  const [applying, setApplying] = useState(false);

  useLightOnly();
  // Auto-fill fields from resume extraction (only name,email,phone,location)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [extracting, setExtracting] = useState(false);
  /**
   * Single smart upload box: resume + supporting docs in any order.
   * Every file is auto-recognized by content (rule + filename + content
   * check); the highest Resume-score file becomes the resume pick, the rest
   * are supporting docs. Details are auto-filled once, from the FIRST file
   * actually recognized as a resume.
   */
  const [unifiedDocs, setUnifiedDocs] = useState<UnifiedDoc[]>([]);
  /** True while any uploaded file is still being auto-recognized. */
  const recognizingDocs = unifiedDocs.some(
    (d) => d.status === "pending" || d.status === "classifying",
  );
  const resumePick = pickResumeDoc(unifiedDocs);
  const resumeFile = resumePick?.file ?? null;
  /** Backend accepts max 20 supporting files (PHP max_file_uploads=20) — the
   *  uploader auto-splits resume vs supporting, so bigger bundles used to 422
   *  with "must not have more than 10 items". Only the first 20 ride along;
   *  the count note below tells HR how many were left behind. */
  const MAX_VERIFY_DOCS = 20;
  const verifyDocs = unifiedDocs
    .filter((d) => resumePick?.id !== d.id)
    .map((d) => {
      const raw = d.manualType ?? d.result?.predicted_type ?? "Others";
      // applicant_documents only accepts COE | Certificate | Credential | Others —
      // anything else becomes Others so validation never 422s.
      const type: "COE" | "Certificate" | "Credential" | "Others" =
        raw === "COE" || raw === "Certificate" || raw === "Credential" ? raw : "Others";
      return { type, file: d.file };
    });
  const verifyDocsCapped = verifyDocs.slice(0, MAX_VERIFY_DOCS);
  const verifyDocsDropped = verifyDocs.length - verifyDocsCapped.length;

  // Normalize PH phone (+63 → 0) for auto-fill
  const normalizePHPhone = (raw?: string | null) => {
    if (!raw) return "";
    let digits = raw.replace(/\D/g, "");
    if (digits.startsWith("63") && digits.length === 12) digits = "0" + digits.slice(2);
    if (digits.length < 7 || digits.length > 15) return raw.trim();
    return digits;
  };

  const handleResumeExtract = async (file: File) => {
    // Validate type/size before extraction — same allow-list as the unified uploader
    const okType = /\.(pdf|docx?|png|jpe?g|webp|heic|heif|bmp|gif|tiff?|avif|svg|txt)$/i.test(file.name);
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
      // Apply same sanitization as ApplicantManagement add applicant step 2.
      // Invalid values are still filled so the submit-time validators flag them.
      if (pi.name?.trim()) {
        setName(sanitizeName(pi.name.trim()));
        filled.push("Full Name");
      }
      if (pi.email?.trim()) {
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

              {(job.additional ?? []).length > 0 && (
                <section className="mt-10">
                  <h2 className="font-display text-2xl font-semibold">Additional Info</h2>
                  <ul className="mt-4 space-y-2.5">
                    {(job.additional ?? []).map((r: string) => (
                      <li key={r} className="flex gap-2.5 text-[15px] text-foreground/75">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {job.instructions?.trim() ? (
                <section className="mt-10">
                  <h2 className="font-display text-2xl font-semibold">How to Apply</h2>
                  <p className="mt-3 text-[15px] leading-relaxed text-foreground/75">
                    {job.instructions}
                  </p>
                </section>
              ) : null}

              {job.about?.trim() ? (
                <section className="mt-10">
                  <h2 className="font-display text-2xl font-semibold">About Company</h2>
                  <p className="mt-3 text-[15px] leading-relaxed text-foreground/75">
                    {job.about}
                  </p>
                </section>
              ) : null}

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
                      // Resume/CV is mandatory — it is the reference NLP screening scores against.
                      if (!resumeFile) {
                        toast.error("Please attach your resume/CV to apply.");
                        return;
                      }
                      setApplying(true);
                      try {
                        const fd = new FormData();
                        fd.append("job_post_id", String(job.id));
                        fd.append("name", n);
                        fd.append("email", em);
                        fd.append("phone", ph);
                        fd.append("source", "Landing Page");
                        fd.append("resume", resumeFile);
                        // Verification documents (COE / Certificate /
                        // Credential / Others) proving the resume content.
                        // Capped at MAX_VERIFY_DOCS (backend max) — extras are
                        // left behind and reported in the success note below.
                        verifyDocsCapped.forEach((d, i) => {
                          fd.append(`verification_doc_types[${i}]`, d.type);
                          fd.append(`verification_docs[${i}]`, d.file);
                        });
                        const res = await landingApi.apply(fd);
                        setApplication({
                          code: res.data.applicant_code,
                          dropped: verifyDocsDropped,
                        });
                        setSubmitted(true);
                        setSuccessOpen(true);
                      } catch (err: any) {
                        if (
                          err?.status === 409 &&
                          err?.code === "REAPPLY_COOLDOWN"
                        ) {
                          // Failed-applicant cooldown — backend carries the
                          // eligible date + days left in the 409 payload.
                          const p = err?.payload ?? {};
                          const applied = p.applied_at
                            ? new Date(p.applied_at).toLocaleDateString()
                            : "";
                          const eligible = p.eligible_after
                            ? new Date(p.eligible_after + "T00:00:00").toLocaleDateString()
                            : "";
                          const left =
                            typeof p.days_left === "number"
                              ? ` — ${p.days_left} day(s) left`
                              : "";
                          toast.warning("Please wait before re-applying", {
                            description:
                              `You applied${applied ? ` on ${applied}` : ""}. ` +
                              `You may re-apply for any open position${eligible ? ` after ${eligible}` : ""}${left}.`,
                          });
                        } else if (err?.status === 409 || err?.code === "DUPLICATE_APPLICATION") {
                          const existing = err?.payload?.existing_applicant_code
                            ? ` (${err.payload.existing_applicant_code})`
                            : "";
                          const applied = err?.payload?.applied_at
                            ? ` on ${new Date(err.payload.applied_at).toLocaleDateString()}`
                            : "";
                          toast.warning("Duplicate application blocked", {
                            description: `You already applied for ${job.title}${existing}${applied}. Same resume can still be used for other jobs.`,
                          });
                        } else if (err?.status === 422) {
                          // Surface WHICH field failed (e.g. verification_docs count)
                          // instead of the raw Laravel message dump.
                          const fieldErrors: string[] = [];
                          const errors = err?.errors ?? err?.payload?.errors;
                          if (errors && typeof errors === "object") {
                            for (const [field, msgs] of Object.entries(errors)) {
                              const first = Array.isArray(msgs) ? msgs[0] : String(msgs ?? "");
                              if (first) fieldErrors.push(`${field}: ${first}`);
                            }
                          }
                          toast.error("Application needs attention", {
                            description:
                              fieldErrors.length > 0
                                ? fieldErrors.join(" · ")
                                : err?.message || "Unable to submit your application. Please try again.",
                          });
                        } else {
                          toast.error(
                            err?.message || "Unable to submit your application. Please try again.",
                          );
                        }
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
                        <Label>
                          Resume/CV * + Supporting Documents{" "}
                          {extracting && <span className="text-xs text-gold">Extracting…</span>}
                        </Label>
                        <UnifiedDocumentsUploader
                          docs={unifiedDocs}
                          onChange={setUnifiedDocs}
                          onResumeRecognized={(file) => void handleResumeExtract(file)}
                          title="Drop resume + COE + certificates here"
                          hint="Any order — every file is auto-recognized. Your name, email, phone and address are filled from the first recognized resume."
                        />
                        <p className="text-[11px] text-muted-foreground">
                          A resume/CV is required. Supporting documents (COE, certificates,
                          credentials) are optional.
                        </p>
                        {verifyDocs.length > 0 && (
                          <p
                            className={
                              verifyDocsDropped > 0
                                ? "text-[11px] font-medium text-amber-600"
                                : "text-[11px] text-muted-foreground"
                            }
                          >
                            {verifyDocsCapped.length} supporting file{verifyDocsCapped.length === 1 ? "" : "s"} will be attached
                            {verifyDocsDropped > 0
                              ? ` — ${verifyDocsDropped} extra will be left behind (max ${MAX_VERIFY_DOCS}). Remove files or keep the most important ${MAX_VERIFY_DOCS}.`
                              : ` (max ${MAX_VERIFY_DOCS}).`}
                          </p>
                        )}
                      </div>

                      {/* Recognized supporting docs ride along automatically —
                          the auto-split preview above shows what ships as
                          verification_docs. No manual tagging needed. */}
                    </div>

                    <Button
                      type="submit"
                      className="mt-5 w-full"
                      disabled={applying || extracting || recognizingDocs}
                    >
                      {extracting
                        ? "Extracting…"
                        : recognizingDocs
                          ? "Recognizing files…"
                          : applying
                            ? "Submitting…"
                            : "Submit Application"}
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

      <AlertDialog open={successOpen} onOpenChange={setSuccessOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Application received</AlertDialogTitle>
            <AlertDialogDescription>
              {application?.code
                ? `Application ${application.code} for ${job.title} was submitted. `
                : `Your application for ${job.title} was submitted. `}
              Your resume is queued for NLP screening. Our recruiters contact shortlisted
              applicants within 3–5 working days.
              {application?.dropped
                ? ` Only the first ${MAX_VERIFY_DOCS} supporting files were attached; ${application.dropped} extra file${application.dropped === 1 ? "" : "s"} were left behind.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Link to="/jobs">Browse more jobs</Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PublicShell>
  );
}
