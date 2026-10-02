import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  XCircle,
} from "lucide-react";

import { PublicShell } from "@/components/public/PublicShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/* The public applicant page talks to the API without a staff session, so it
   uses the same base URL as the main client (relative "/api/v1", proxied to
   Laravel in dev) but with plain fetch — no Authorization header. */
const API_BASE_URL = (import.meta.env["VITE_API_BASE_URL"] as string) || "/api/v1";

interface InviteQuestion {
  title: string;
  scenario: string;
  options: string[];
  points: number;
}

interface InvitePayload {
  status: "Pending" | "Completed" | "Expired";
  test_title: string;
  passing_score: number;
  expires_at: string | null;
  submitted_at: string | null;
  total_score: number | null;
  result: "Passed" | "Failed" | null;
  applicant_name: string | null;
  position: string | null;
  questions: InviteQuestion[];
}

interface SubmitResult {
  total_score: number | null;
  result: "Passed" | "Failed" | null;
}

export const Route = createFileRoute("/_landing/assessment-test/$token")({
  head: () => ({
    meta: [
      { title: "Assessment Test — Oxford Suites Makati" },
      { name: "robots", content: "noindex" },
      {
        name: "description",
        content: "Answer your job knowledge assessment test online.",
      },
    ],
  }),
  component: ApplicantAssessmentTest,
});

function ApplicantAssessmentTest() {
  const { token } = Route.useParams();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [invite, setInvite] = useState<InvitePayload | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<SubmitResult | null>(null);

  /* Load the test (public, no auth). */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/assessment-invites/${token}`, {
          headers: { Accept: "application/json" },
        });
        const body = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(body?.message || "This assessment test link could not be loaded.");
        }
        if (!cancelled) setInvite(body.data as InvitePayload);
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : "Could not load the assessment test.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const questions = invite?.questions ?? [];
  const totalQ = questions.length;
  const answeredCount = useMemo(
    () => questions.filter((_, idx) => answers[idx] != null).length,
    [questions, answers],
  );
  const allAnswered = totalQ > 0 && answeredCount === totalQ;

  const submit = async () => {
    if (!invite) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/assessment-invites/${token}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ answers }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(body?.message || "Your answers could not be submitted. Please try again.");
      }
      setSubmitted({
        total_score: body?.total_score ?? null,
        result: body?.result ?? null,
      });
    } catch (e) {
      setSubmitError(
        e instanceof Error ? e.message : "Your answers could not be submitted. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicShell>
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-8">
        {loading ? (
          <Card className="border-border/70">
            <CardContent className="flex items-center justify-center gap-3 p-10 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading your assessment test…
            </CardContent>
          </Card>
        ) : loadError ? (
          <StatusCard tone="error" title="Test link unavailable" body={loadError} />
        ) : !invite ? (
          <StatusCard
            tone="error"
            title="Test link unavailable"
            body="This assessment test link is invalid."
          />
        ) : submitted ? (
          <StatusCard
            tone={submitted.result === "Passed" ? "success" : "error"}
            title="Assessment test submitted"
            body={
              submitted.total_score != null
                ? `Your score is ${Math.round(submitted.total_score)}% — Result: ${submitted.result}.`
                : "Your answers were submitted successfully."
            }
            hint="You may now close this page. The recruitment team has received your result."
          />
        ) : invite.status === "Completed" ? (
          <StatusCard
            tone={invite.result === "Passed" ? "success" : "error"}
            title="Assessment test already submitted"
            body={
              invite.total_score != null
                ? `Your recorded score is ${Math.round(invite.total_score)}% — Result: ${invite.result}.`
                : "You have already submitted this assessment test."
            }
          />
        ) : invite.status === "Expired" ? (
          <StatusCard
            tone="error"
            title="Test link expired"
            body="This assessment test link has expired."
            hint="Please ask the recruiter to generate a new link."
          />
        ) : (
          <AssessmentRunner
            invite={invite}
            answers={answers}
            step={step}
            totalQ={totalQ}
            answeredCount={answeredCount}
            allAnswered={allAnswered}
            submitting={submitting}
            submitError={submitError}
            onSelect={(qIdx, optIdx) => setAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))}
            onStep={setStep}
            onSubmit={submit}
          />
        )}
      </div>
    </PublicShell>
  );
}

/* ------------------------------------------------------------------ */
/* Single-question runner — one question at a time, then a review-and-  */
/* submit step (mirrors the staff runner layout for the applicant).     */
/* ------------------------------------------------------------------ */

function AssessmentRunner({
  invite,
  answers,
  step,
  totalQ,
  answeredCount,
  allAnswered,
  submitting,
  submitError,
  onSelect,
  onStep,
  onSubmit,
}: {
  invite: InvitePayload;
  answers: Record<number, number>;
  step: number;
  totalQ: number;
  answeredCount: number;
  allAnswered: boolean;
  submitting: boolean;
  submitError: string | null;
  onSelect: (qIdx: number, optIdx: number) => void;
  onStep: (step: number | ((s: number) => number)) => void;
  onSubmit: () => void;
}) {
  const isReview = step >= totalQ;
  const question = invite.questions[step];

  return (
    <div className="space-y-5">
      <div>
        <p className="eyebrow">Assessment Test</p>
        <h1 className="mt-1 font-display text-3xl font-semibold">{invite.test_title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {invite.applicant_name ? `${invite.applicant_name}` : "Applicant"}
          {invite.position ? ` — ${invite.position}` : ""} · Passing score{" "}
          {Math.round(invite.passing_score)}%
        </p>
      </div>

      {isReview ? (
        <Card className="border-border/70">
          <CardContent className="space-y-4 p-6">
            <h2 className="font-display text-xl font-semibold">Review your answers</h2>
            <p className="text-sm text-muted-foreground">
              {answeredCount} of {totalQ} question(s) answered. You cannot change your answers
              after submitting.
            </p>
            <div className="space-y-2">
              {invite.questions.map((q, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm"
                >
                  <span className="min-w-0 flex-1">
                    <span className="font-medium">
                      {idx + 1}. {q.title}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                      {answers[idx] != null ? q.options[answers[idx]] : "Not answered"}
                    </span>
                  </span>
                  <button
                    type="button"
                    className="shrink-0 text-xs font-medium text-primary hover:underline"
                    onClick={() => onStep(idx)}
                  >
                    Change
                  </button>
                </div>
              ))}
            </div>

            {submitError && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2">
              <Button variant="outline" onClick={() => onStep(totalQ - 1)} disabled={submitting}>
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
              </Button>
              <Button variant="destructive" disabled={!allAnswered || submitting} onClick={onSubmit}>
                {submitting ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-1.5 h-4 w-4" />
                )}
                Submit test
              </Button>
            </div>
            {!allAnswered && (
              <p className="text-right text-xs text-muted-foreground">
                {totalQ - answeredCount} question(s) left — answer every question before
                submitting.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/70">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Question {step + 1} of {totalQ}
              </p>
              <span className="text-xs text-muted-foreground">{question?.points ?? 0} points</span>
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold">{question?.title}</h2>
              {question?.scenario ? (
                <p className="mt-1 text-sm text-muted-foreground">{question.scenario}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              {question?.options.map((opt, optIdx) => {
                const selected = answers[step] === optIdx;
                return (
                  <label
                    key={optIdx}
                    className={
                      "flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm transition-colors " +
                      (selected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40")
                    }
                  >
                    <input
                      type="radio"
                      name={`q-${step}`}
                      className="accent-primary"
                      checked={selected}
                      onChange={() => onSelect(step, optIdx)}
                    />
                    <span>{opt}</span>
                  </label>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <Button
                variant="outline"
                disabled={step === 0}
                onClick={() => onStep((s) => Math.max(0, s - 1))}
              >
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Prev
              </Button>
              <Button
                disabled={answers[step] == null}
                onClick={() => onStep((s) => Math.min(totalQ, s + 1))}
              >
                {step === totalQ - 1 ? "Review answers" : "Next"}{" "}
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Result / error card                                                 */
/* ------------------------------------------------------------------ */

function StatusCard({
  tone,
  title,
  body,
  hint,
}: {
  tone: "success" | "error";
  title: string;
  body: string;
  hint?: string;
}) {
  const Icon = tone === "success" ? CheckCircle2 : XCircle;
  return (
    <Card className="border-border/70">
      <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
        <Icon
          className={tone === "success" ? "h-10 w-10 text-success" : "h-10 w-10 text-destructive"}
        />
        <h1 className="font-display text-2xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">{body}</p>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
