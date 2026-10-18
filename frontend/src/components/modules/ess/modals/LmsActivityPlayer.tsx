import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  RotateCcw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { essApi } from "@/lib/api";

/**
 * Tier-1 LMS activity player — ONE modal, TWO stages (handbook -> quiz).
 *
 * Stage order is enforced: the reading stage must be finished (which writes
 * `reading_completed_at` server-side) before the assessment can load. The
 * server re-checks that gate on both GET and POST, so this is a convenience
 * mirror of the real rule (`409 reading_required`).
 *
 * Grading happens server-side; the answer key never reaches the browser until
 * the review returned *after* a submission.
 */

type Stage = "loading" | "reading" | "quiz" | "result" | "gated" | "error";

interface LmsMaterial {
  course: {
    code: string;
    title: string;
    category: string;
    estimated_reading_minutes: number | null;
    estimated_pages: number | null;
    mandatory: boolean;
  };
  content: string | null;
  file_url: string | null;
  status: string;
  reading_completed_at: string | null;
}

interface LmsQuiz {
  course: { code: string; title: string; category: string };
  pass_mark: number;
  total_items: number;
  time_limit_seconds: number;
  questions: { id: number; question: string; options: string[] }[];
  already_passed: boolean;
  last_score: number | null;
}

interface LmsResult {
  passed: boolean;
  score: number;
  correct_count: number;
  total_count: number;
  pass_mark: number;
  status: string;
  certificate_eligible: boolean;
  already_completed?: boolean;
  review: {
    id: number;
    question: string;
    options: string[];
    correct_index: number;
    your_index: number | null;
    is_correct: boolean;
    explanation: string;
  }[];
}

interface LmsActivityPlayerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Catalog course code, e.g. "LMS-101". */
  courseId: string;
  courseTitle: string;
  category?: string;
  /** Stage chosen by the card that opened the player. */
  initialStage?: "reading" | "quiz";
  /** Fired after a pass so the tab can refetch the course list. */
  onCompleted?: (courseId: string) => void;
  /** Fired by "View certificate" — the tab closes the player and opens the cert. */
  onViewCertificate?: (courseId: string) => void;
}

function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Lightweight handbook renderer: headings, bullets and paragraphs (no MD dep). */
function HandbookText({ text }: { text: string }) {
  const blocks = text
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <div className="space-y-3 text-sm leading-relaxed text-foreground/90">
      {blocks.map((block, i) => {
        if (/^#{1,6}\s+/.test(block)) {
          return (
            <h3 key={i} className="pt-1 font-display text-sm font-bold text-foreground">
              {block.replace(/^#{1,6}\s+/, "")}
            </h3>
          );
        }

        const lines = block
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
        if (lines.length > 1 && lines.every((l) => /^(?:[-*]|\d+[.)])\s+/.test(l))) {
          return (
            <ul key={i} className="list-disc space-y-1 pl-5">
              {lines.map((l, j) => (
                <li key={j}>{l.replace(/^(?:[-*]|\d+[.)])\s+/, "")}</li>
              ))}
            </ul>
          );
        }

        return (
          <p key={i} className="whitespace-pre-line">
            {block.replace(/^(?:[-*]|\d+[.)])\s+/, "")}
          </p>
        );
      })}
    </div>
  );
}

export function LmsActivityPlayer({
  open,
  onOpenChange,
  courseId,
  courseTitle,
  category,
  initialStage = "reading",
  onCompleted,
  onViewCertificate,
}: LmsActivityPlayerProps) {
  const [stage, setStage] = useState<Stage>("loading");
  const [material, setMaterial] = useState<LmsMaterial | null>(null);
  const [quiz, setQuiz] = useState<LmsQuiz | null>(null);
  const [result, setResult] = useState<LmsResult | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [showFile, setShowFile] = useState(false);

  const loadMaterial = useCallback(async (): Promise<LmsMaterial | null> => {
    try {
      const res = await essApi.learningMaterial(courseId);
      setMaterial(res);
      return res;
    } catch (e) {
      setErrorMsg((e as Error)?.message || "Could not load the handbook.");
      return null;
    }
  }, [courseId]);

  const openReading = useCallback(async () => {
    setStage("loading");
    setErrorMsg(null);
    setShowFile(false);
    setBusy(true);
    const res = await loadMaterial();
    setBusy(false);
    setStage(res ? "reading" : "error");
  }, [loadMaterial]);

  const openQuiz = useCallback(async () => {
    setStage("loading");
    setErrorMsg(null);
    setBusy(true);
    try {
      const res = await essApi.learningQuiz(courseId);
      setQuiz(res);
      setAnswers({});
      setResult(null);
      setSecondsLeft(res.time_limit_seconds ?? null);
      setStage("quiz");
    } catch (e) {
      const err = e as Error & { code?: string; status?: number };
      if (err?.code === "reading_required" || err?.status === 409) {
        setErrorMsg("Finish the handbook before taking the assessment.");
        setStage("gated");
      } else {
        setErrorMsg(err?.message || "Could not load the assessment.");
        setStage("error");
      }
    } finally {
      setBusy(false);
    }
  }, [courseId]);

  // Reset + open on the requested stage whenever the modal opens.
  useEffect(() => {
    if (!open) {
      setStage("loading");
      setMaterial(null);
      setQuiz(null);
      setResult(null);
      setAnswers({});
      setErrorMsg(null);
      setSecondsLeft(null);
      setShowFile(false);
      return;
    }
    if (initialStage === "quiz") void openQuiz();
    else void openReading();
  }, [open, initialStage, openQuiz, openReading]);

  const submit = useCallback(
    async (finalAnswers: Record<number, number>) => {
      setBusy(true);
      try {
        const res = await essApi.submitLearningQuiz(courseId, finalAnswers);
        setResult(res);
        setSecondsLeft(null);
        setStage("result");
        if (res.passed) {
          toast.success(`Passed with ${res.score}% — "${courseTitle}" completed.`);
          onCompleted?.(courseId);
        } else {
          toast.error(
            `Score ${res.score}% — ${res.pass_mark}% is needed to pass. You can retake it.`,
          );
        }
      } catch (e) {
        toast.error((e as Error)?.message || "Could not submit the assessment.");
      } finally {
        setBusy(false);
      }
    },
    [courseId, courseTitle, onCompleted],
  );

  // Latest answers + submit, read by the countdown so answering a question does
  // not re-create the timer (which would stretch the clock).
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const submitRef = useRef(submit);
  submitRef.current = submit;

  // Countdown — auto-submits whatever is answered when it runs out.
  useEffect(() => {
    if (stage !== "quiz" || secondsLeft == null) return;
    if (secondsLeft <= 0) {
      void submitRef.current(answersRef.current);
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => (s == null ? s : s - 1)), 1000);
    return () => clearTimeout(timer);
  }, [stage, secondsLeft]);

  const completeReading = async () => {
    setBusy(true);
    try {
      await essApi.completeLearningReading(courseId);
      onCompleted?.(courseId);
      setBusy(false);
      await openQuiz();
    } catch (e) {
      setBusy(false);
      toast.error((e as Error)?.message || "Could not record the reading — please retry.");
    }
  };

  const answeredCount = Object.keys(answers).length;
  const allAnswered = quiz != null && answeredCount >= quiz.total_items;
  const readDone = material?.reading_completed_at != null;
  const readingMinutes = material?.course.estimated_reading_minutes ?? null;
  const materialsUrl = essApi.learningMaterialUrl(courseId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-[900px]">
        <DialogHeader>
          <div className="flex items-start gap-2">
            <div className="rounded-md bg-primary/10 p-2 text-primary">
              {stage === "quiz" || stage === "result" ? (
                <ShieldCheck className="h-5 w-5" />
              ) : (
                <BookOpen className="h-5 w-5" />
              )}
            </div>
            <div className="min-w-0">
              <DialogTitle className="truncate font-display text-lg">{courseTitle}</DialogTitle>
              <DialogDescription className="flex items-center gap-2">
                <span>{category ?? material?.course.category ?? "Learning module"}</span>
                <span aria-hidden>·</span>
                <span className="font-semibold text-primary">
                  {stage === "result"
                    ? "Result"
                    : stage === "quiz"
                      ? "Step 2 of 2 · Assessment"
                      : "Step 1 of 2 · Handbook"}
                </span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Stage stepper */}
        <div className="flex items-center gap-2 text-[11px] font-semibold">
          <span
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${
              stage === "reading"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/70 text-muted-foreground"
            }`}
          >
            <BookOpen className="h-3 w-3" /> 1. Read handbook
            {readDone && <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
          </span>
          <span className="h-px w-6 bg-border" />
          <span
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${
              stage === "quiz" || stage === "result"
                ? "border-primary bg-primary/10 text-primary"
                : "border-dashed border-border/70 text-muted-foreground"
            }`}
          >
            <ShieldCheck className="h-3 w-3" /> 2. Assessment
            {!readDone && <span className="font-normal opacity-70">(read first)</span>}
          </span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {/* ---------------- loading ---------------- */}
          {stage === "loading" && (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              {busy ? "Preparing your activity…" : "Loading…"}
            </div>
          )}

          {/* ---------------- reading stage ---------------- */}
          {stage === "reading" && material && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                {readingMinutes != null && (
                  <Badge variant="outline" className="gap-1">
                    <Clock className="h-3 w-3" /> ~{readingMinutes} min read
                  </Badge>
                )}
                {material.course.estimated_pages != null && (
                  <Badge variant="outline" className="gap-1">
                    <FileText className="h-3 w-3" /> {material.course.estimated_pages} pages
                  </Badge>
                )}
                {material.course.mandatory && (
                  <Badge variant="outline" className="border-red-500/40 text-red-600">
                    Mandatory
                  </Badge>
                )}
                {material.file_url && (
                  <button
                    type="button"
                    onClick={() => setShowFile((v) => !v)}
                    className="ml-auto font-semibold text-primary hover:underline"
                  >
                    {showFile ? "Show text version" : "Open original file"}
                  </button>
                )}
              </div>

              {showFile && material.file_url ? (
                <iframe
                  key={materialsUrl}
                  src={materialsUrl}
                  title={courseTitle}
                  className="h-[48vh] w-full rounded-lg border border-border/70 bg-muted/20"
                />
              ) : material.content ? (
                <div className="rounded-lg border border-border/70 bg-background p-4">
                  <HandbookText text={material.content} />
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border/70 p-8 text-center text-xs text-muted-foreground">
                  No handbook content is on record for this course yet.
                </div>
              )}
            </div>
          )}

          {/* ---------------- reading gate / errors ---------------- */}
          {stage === "gated" && (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 p-6 text-center">
              <div className="rounded-full bg-amber-500/10 p-3 text-amber-600">
                <BookOpen className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-foreground">Read the handbook first</p>
              <p className="max-w-sm text-xs text-muted-foreground">
                The assessment unlocks once you have finished the reading stage.
              </p>
              <Button size="sm" className="gap-1.5 text-xs" onClick={() => void openReading()}>
                <BookOpen className="h-3.5 w-3.5" /> Go to handbook
              </Button>
            </div>
          )}

          {stage === "error" && (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 p-6 text-center">
              <div className="rounded-full bg-red-500/10 p-3 text-red-600">
                <XCircle className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-foreground">Activity unavailable</p>
              <p className="max-w-sm text-xs text-muted-foreground">
                {errorMsg || "Please try again in a moment."}
              </p>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs"
                onClick={() => void (initialStage === "quiz" ? openQuiz() : openReading())}
              >
                <RotateCcw className="h-3.5 w-3.5" /> Retry
              </Button>
            </div>
          )}

          {/* ---------------- quiz stage ---------------- */}
          {stage === "quiz" && quiz && (
            <div className="space-y-3">
              <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 rounded-lg border border-border/70 bg-card/95 px-3 py-2 backdrop-blur-sm">
                <span className="text-xs font-semibold text-foreground">
                  Answered {answeredCount} / {quiz.total_items}
                </span>
                <Progress
                  value={(answeredCount / Math.max(1, quiz.total_items)) * 100}
                  className="h-1.5 w-24"
                />
                <span className="text-[11px] text-muted-foreground">
                  Pass mark {quiz.pass_mark}%
                </span>
                {secondsLeft != null && (
                  <span
                    className={`ml-auto flex items-center gap-1 font-mono text-xs font-bold ${
                      secondsLeft <= 60 ? "text-red-600" : "text-foreground"
                    }`}
                    title="Time remaining"
                  >
                    <Clock className="h-3.5 w-3.5" /> {formatClock(secondsLeft)}
                  </span>
                )}
              </div>

              {quiz.questions.map((q, index) => (
                <fieldset
                  key={q.id}
                  className="rounded-lg border border-border/70 bg-background p-3"
                >
                  <legend className="px-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Question {index + 1} of {quiz.total_items}
                  </legend>
                  <p className="text-sm font-semibold text-foreground">{q.question}</p>
                  <div className="mt-2 space-y-1.5">
                    {q.options.map((option, optionIndex) => {
                      const selected = answers[q.id] === optionIndex;
                      return (
                        <button
                          key={optionIndex}
                          type="button"
                          onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: optionIndex }))}
                          className={`flex w-full items-start gap-2 rounded-md border px-3 py-2 text-left text-xs transition-colors ${
                            selected
                              ? "border-primary bg-primary/10 font-semibold text-foreground"
                              : "border-border/70 text-muted-foreground hover:border-primary/40 hover:bg-muted/40"
                          }`}
                        >
                          <span
                            className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[9px] font-bold ${
                              selected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border"
                            }`}
                          >
                            {String.fromCharCode(65 + optionIndex)}
                          </span>
                          <span>{option}</span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
            </div>
          )}

          {/* ---------------- result stage ---------------- */}
          {stage === "result" && result && (
            <div className="space-y-3">
              <div
                className={`flex flex-wrap items-center gap-3 rounded-lg border p-4 ${
                  result.passed
                    ? "border-emerald-500/40 bg-emerald-500/10"
                    : "border-amber-500/40 bg-amber-500/10"
                }`}
              >
                <div
                  className={`rounded-full p-2.5 ${
                    result.passed ? "bg-emerald-600 text-white" : "bg-amber-500 text-white"
                  }`}
                >
                  {result.passed ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <XCircle className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {result.passed ? "Assessment passed" : "Not passed yet"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Score <strong className="text-foreground">{result.score}%</strong> ·{" "}
                    {result.correct_count} of {result.total_count} correct · pass mark{" "}
                    {result.pass_mark}%
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  {result.passed ? (
                    result.certificate_eligible && (
                      <Button
                        size="sm"
                        className="gap-1.5 text-xs"
                        onClick={() => {
                          onOpenChange(false);
                          onViewCertificate?.(courseId);
                        }}
                      >
                        <ShieldCheck className="h-3.5 w-3.5" /> View certificate
                      </Button>
                    )
                  ) : (
                    <Button size="sm" className="gap-1.5 text-xs" onClick={() => void openQuiz()}>
                      <RotateCcw className="h-3.5 w-3.5" /> Retake assessment
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {result.review.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-border/70 bg-background p-3"
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className={`mt-0.5 rounded-full p-1 ${
                          item.is_correct
                            ? "bg-emerald-500/15 text-emerald-600"
                            : "bg-red-500/15 text-red-600"
                        }`}
                      >
                        {item.is_correct ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-foreground">
                          {index + 1}. {item.question}
                        </p>
                        <div className="mt-1.5 space-y-1">
                          {item.options.map((option, optionIndex) => {
                            const isCorrect = optionIndex === item.correct_index;
                            const isYourWrong = optionIndex === item.your_index && !isCorrect;
                            return (
                              <p
                                key={optionIndex}
                                className={`rounded px-2 py-1 text-[11px] ${
                                  isCorrect
                                    ? "bg-emerald-500/10 font-semibold text-emerald-700 dark:text-emerald-400"
                                    : isYourWrong
                                      ? "bg-red-500/10 text-red-700 line-through dark:text-red-400"
                                      : "text-muted-foreground"
                                }`}
                              >
                                {String.fromCharCode(65 + optionIndex)}. {option}
                                {isCorrect ? " ✓" : ""}
                                {isYourWrong ? " (your answer)" : ""}
                              </p>
                            );
                          })}
                        </div>
                        {item.explanation && (
                          <p className="mt-1.5 text-[11px] italic text-muted-foreground">
                            {item.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ---------------- footer actions ---------------- */}
        {stage === "reading" && (
          <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
            <p className="text-[11px] text-muted-foreground">
              {readDone
                ? "Reading already completed — you can review or continue."
                : "Finish the handbook to unlock the assessment."}
            </p>
            <Button
              size="sm"
              className="gap-1.5 text-xs"
              disabled={busy}
              onClick={() => void completeReading()}
            >
              {busy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ArrowRight className="h-3.5 w-3.5" />
              )}
              {readDone ? "Start Assessment" : "Finish reading → Start Assessment"}
            </Button>
          </div>
        )}

        {stage === "quiz" && quiz && (
          <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
            <p className="text-[11px] text-muted-foreground">
              {allAnswered
                ? "All questions answered — submit for grading."
                : `${quiz.total_items - answeredCount} question${quiz.total_items - answeredCount === 1 ? "" : "s"} left.`}
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs"
                onClick={() => void openReading()}
              >
                <BookOpen className="h-3.5 w-3.5" /> Back to handbook
              </Button>
              <Button
                size="sm"
                className="gap-1.5 text-xs"
                disabled={busy || !allAnswered}
                onClick={() => void submit(answers)}
              >
                {busy ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
                Submit assessment
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
