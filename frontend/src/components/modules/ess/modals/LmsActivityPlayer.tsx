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
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Lock,
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
 * Grading happens server-side and the answer key never reaches the browser.
 * The post-submit review only shows the employee's own answers. A failed
 * attempt is final, so the quiz is locked rather than offered as a retake.
 */

type Stage = "loading" | "reading" | "confirm" | "quiz" | "result" | "locked" | "gated" | "error";

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
  /** Per-attempt shuffle seed — echoed back on submit. */
  attempt_seed: number;
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
  retake_allowed?: boolean;
  review: {
    id: number;
    question: string;
    options: string[];
    your_index: number | null;
    is_correct: boolean;
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
  /**
   * Single-stage mode. When set, the player shows only the handbook or only the
   * quiz, without the handbook → assessment stepper or cross-stage CTA.
   */
  mode?: "handbook" | "quiz";
  /** Fired after a submission (pass or fail) so the tab can refetch the list. */
  onCompleted?: (courseId: string) => void;
  /** Fired by "View certificate" — the tab closes the player and opens the cert. */
  onViewCertificate?: (courseId: string) => void;
  /** Used by the gated quiz state to switch the player back to the handbook. */
  onOpenHandbook?: () => void;
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
  mode,
  onCompleted,
  onViewCertificate,
  onOpenHandbook,
}: LmsActivityPlayerProps) {
  const [stage, setStage] = useState<Stage>("loading");
  const [material, setMaterial] = useState<LmsMaterial | null>(null);
  const [quiz, setQuiz] = useState<LmsQuiz | null>(null);
  const [result, setResult] = useState<LmsResult | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lockedScore, setLockedScore] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [showFile, setShowFile] = useState(false);

  const singleStage = mode === "handbook" || mode === "quiz";

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
    setShowFile(Boolean(res?.file_url));
    setBusy(false);
    setStage(res ? "reading" : "error");
  }, [loadMaterial]);

  // Loads the quiz bank but does not start the attempt. A fresh attempt lands
  // on the confirmation panel; the countdown only starts from startQuiz().
  const openQuiz = useCallback(async () => {
    setStage("loading");
    setErrorMsg(null);
    setLockedScore(null);
    setBusy(true);
    try {
      const res = await essApi.learningQuiz(courseId);
      setQuiz(res);
      setAnswers({});
      setResult(null);
      setSecondsLeft(null);
      // Already-passed modules keep the terminal panel instead of confirming.
      setStage(res.already_passed ? "quiz" : "confirm");
    } catch (e) {
      const err = e as Error & {
        code?: string;
        status?: number;
        payload?: { score?: number | string };
      };
      if (err?.code === "retake_not_allowed") {
        setLockedScore(err.payload?.score != null ? Math.round(Number(err.payload.score)) : null);
        setErrorMsg(err.message || "You did not pass this assessment. Retakes are not allowed.");
        setStage("locked");
      } else if (err?.code === "reading_required" || err?.status === 409) {
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

  const startQuiz = () => {
    if (!quiz || quiz.already_passed) return;
    setAnswers({});
    setSecondsLeft(quiz.time_limit_seconds ?? null);
    setStage("quiz");
  };

  // Reset + open on the requested stage whenever the modal opens.
  useEffect(() => {
    if (!open) {
      setStage("loading");
      setMaterial(null);
      setQuiz(null);
      setResult(null);
      setAnswers({});
      setErrorMsg(null);
      setLockedScore(null);
      setSecondsLeft(null);
      setShowFile(false);
      return;
    }
    if (mode === "handbook") void openReading();
    else if (mode === "quiz") void openQuiz();
    else if (initialStage === "quiz") void openQuiz();
    else void openReading();
  }, [open, initialStage, mode, openQuiz, openReading]);

  const submit = useCallback(
    async (finalAnswers: Record<number, number>) => {
      if (!quiz) return;
      setBusy(true);
      try {
        const res = await essApi.submitLearningQuiz(courseId, finalAnswers, quiz.attempt_seed);
        setResult(res);
        setSecondsLeft(null);
        setStage("result");
        if (res.passed) {
          toast.success(`Passed with ${res.score}% — "${courseTitle}" completed.`);
        } else {
          toast.error(
            `Score ${res.score}% — ${res.pass_mark}% is needed to pass. This assessment cannot be retaken.`,
          );
        }
        // Refresh the card after either outcome so a failed attempt is shown
        // as locked instead of "Ready to take".
        onCompleted?.(courseId);
      } catch (e) {
        toast.error((e as Error)?.message || "Could not submit the assessment.");
      } finally {
        setBusy(false);
      }
    },
    [courseId, courseTitle, onCompleted, quiz],
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

  // Handbook-only mode: record completion but stay in the reader. The quiz is a
  // separate destination, so there is deliberately no "Start Assessment" CTA.
  const markReadingComplete = async () => {
    setBusy(true);
    try {
      const res = await essApi.completeLearningReading(courseId);
      setMaterial((prev) =>
        prev
          ? { ...prev, reading_completed_at: res.reading_completed_at, status: res.status }
          : prev,
      );
      onCompleted?.(courseId);
      toast.success("Handbook marked as read — the quiz is now unlocked.");
    } catch (e) {
      toast.error((e as Error)?.message || "Could not record the reading — please retry.");
    } finally {
      setBusy(false);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const allAnswered = quiz != null && answeredCount >= quiz.total_items;
  const readDone = material?.reading_completed_at != null;
  // A module that is already Completed (quiz pass, HR verification or import)
  // is terminal: the handbook stays available for review, but the assessment is
  // not re-administered and no stale score is presented as a new result.
  const alreadyCompleted = material?.status === "Completed";
  const quizLocked = quiz?.already_passed === true;
  const readingMinutes = material?.course.estimated_reading_minutes ?? null;
  const materialsUrl = essApi.learningMaterialUrl(courseId);

  const stageLabel = (() => {
    if (mode === "handbook") return "Handbook";
    if (mode === "quiz") {
      if (stage === "result" || stage === "locked") return "Result";
      if (stage === "confirm") return "Quiz confirmation";
      return "Quiz";
    }
    if (stage === "result" || stage === "locked") return "Result";
    if (stage === "confirm" || stage === "quiz") return "Step 2 of 2 · Assessment";
    return "Step 1 of 2 · Handbook";
  })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-[900px]">
        <DialogHeader>
          <div className="flex items-start gap-2">
            <div className="rounded-md bg-primary/10 p-2 text-primary">
              {stage === "confirm" ||
              stage === "quiz" ||
              stage === "result" ||
              stage === "locked" ? (
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
                <span className="font-semibold text-primary">{stageLabel}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Stage stepper — hidden when the player is opened for one stage only. */}
        {!singleStage && (
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
                stage === "confirm" || stage === "quiz" || stage === "result" || stage === "locked"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-dashed border-border/70 text-muted-foreground"
              }`}
            >
              <ShieldCheck className="h-3 w-3" /> 2. Assessment
              {!readDone && <span className="font-normal opacity-70">(read first)</span>}
            </span>
          </div>
        )}

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
                  <div className="ml-auto flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowFile((v) => !v)}
                      className="font-semibold text-primary hover:underline"
                    >
                      {showFile ? "Show text version" : "Open original file"}
                    </button>
                  </div>
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

          {/* ---------------- quiz confirmation ---------------- */}
          {stage === "confirm" && quiz && (
            <div className="flex min-h-[260px] flex-col items-center justify-center gap-4 p-6 text-center">
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-foreground">Ready to take the assessment?</p>
                <p className="max-w-md text-xs text-muted-foreground">
                  The quiz starts as soon as you confirm. Make sure you have enough time to finish
                  it in one sitting.
                </p>
              </div>

              <div className="grid w-full max-w-sm gap-2 rounded-lg border border-border/70 bg-muted/20 p-3 text-left text-xs">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Questions</span>
                  <span className="font-semibold text-foreground">{quiz.total_items}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Pass mark</span>
                  <span className="font-semibold text-foreground">{quiz.pass_mark}%</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Time limit</span>
                  <span className="font-semibold text-foreground">
                    {formatClock(quiz.time_limit_seconds)}
                  </span>
                </div>
              </div>

              <div className="flex max-w-md items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-left text-[11px] text-amber-800 dark:text-amber-300">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  You get <strong>one attempt</strong>. If you do not reach the {quiz.pass_mark}%
                  pass mark, this assessment cannot be retaken.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs"
                  onClick={() => (mode === "quiz" ? onOpenChange(false) : void openReading())}
                >
                  {mode === "quiz" ? "Cancel" : "Back to handbook"}
                </Button>
                <Button size="sm" className="gap-1.5 text-xs" onClick={startQuiz}>
                  <ShieldCheck className="h-3.5 w-3.5" /> Start assessment
                </Button>
              </div>
            </div>
          )}

          {/* ---------------- failed attempt / locked ---------------- */}
          {stage === "locked" && (
            <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 p-6 text-center">
              <div className="rounded-full bg-amber-500/10 p-3 text-amber-600">
                <Lock className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-foreground">Assessment not passed</p>
              <p className="max-w-sm text-xs text-muted-foreground">
                {errorMsg || "You did not pass this assessment. Retakes are not allowed."}
              </p>
              {lockedScore != null && (
                <p className="text-xs text-muted-foreground">
                  Your score: <strong className="text-foreground">{lockedScore}%</strong>
                </p>
              )}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs"
                  onClick={() => onOpenChange(false)}
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() => {
                    if (mode === "quiz" && onOpenHandbook) onOpenHandbook();
                    else void openReading();
                  }}
                >
                  <BookOpen className="h-3.5 w-3.5" /> Review handbook
                </Button>
              </div>
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
              <Button
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => {
                  if (mode === "quiz" && onOpenHandbook) onOpenHandbook();
                  else void openReading();
                }}
              >
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

          {/* ---------------- quiz stage (locked when already completed) --- */}
          {stage === "quiz" && quiz && quizLocked && (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 p-6 text-center">
              <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-foreground">Module already completed</p>
              <p className="max-w-sm text-xs text-muted-foreground">
                {quiz.last_score != null
                  ? `You passed this assessment with ${Math.round(quiz.last_score)}%. Retakes are not required.`
                  : "This module is already completed. Retakes are not required."}
              </p>
              {onViewCertificate && (
                <Button
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() => {
                    onOpenChange(false);
                    onViewCertificate(courseId);
                  }}
                >
                  <ShieldCheck className="h-3.5 w-3.5" /> View certificate
                </Button>
              )}
            </div>
          )}

          {/* ---------------- quiz stage ---------------- */}
          {stage === "quiz" && quiz && !quizLocked && (
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
                    {result.passed ? "Assessment passed" : "Assessment not passed"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Score <strong className="text-foreground">{result.score}%</strong> ·{" "}
                    {result.correct_count} of {result.total_count} correct · pass mark{" "}
                    {result.pass_mark}%
                  </p>
                  {!result.passed && (
                    <p className="mt-1 text-[11px] font-medium text-amber-700 dark:text-amber-400">
                      This was your only attempt — retakes are not allowed.
                    </p>
                  )}
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
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-xs"
                      onClick={() => onOpenChange(false)}
                    >
                      Close
                    </Button>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground">
                Your answers are shown below. Correct answers are not disclosed.
              </p>

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
                        <p
                          className={`mt-1.5 rounded px-2 py-1 text-[11px] ${
                            item.is_correct
                              ? "bg-emerald-500/10 font-semibold text-emerald-700 dark:text-emerald-400"
                              : "bg-red-500/10 text-red-700 dark:text-red-400"
                          }`}
                        >
                          {item.your_index != null
                            ? `Your answer: ${String.fromCharCode(65 + item.your_index)}. ${
                                item.options[item.your_index] ?? ""
                              }`
                            : "No answer selected."}
                        </p>
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
            {mode === "handbook" ? (
              <>
                <p className="text-[11px] text-muted-foreground">
                  {readDone || alreadyCompleted
                    ? "Reading completed — the quiz is unlocked."
                    : "Mark the handbook as read to unlock the quiz."}
                </p>
                {readDone || alreadyCompleted ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs"
                    onClick={() => onOpenChange(false)}
                  >
                    Close
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="gap-1.5 text-xs"
                    disabled={busy}
                    onClick={() => void markReadingComplete()}
                  >
                    {busy ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                    Mark as read
                  </Button>
                )}
              </>
            ) : (
              <>
                <p className="text-[11px] text-muted-foreground">
                  {alreadyCompleted
                    ? "This module is already completed — the handbook is here for review."
                    : readDone
                      ? "Reading already completed — you can review or continue."
                      : "Finish the handbook to unlock the assessment."}
                </p>
                {alreadyCompleted ? (
                  onViewCertificate ? (
                    <Button
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={() => {
                        onOpenChange(false);
                        onViewCertificate(courseId);
                      }}
                    >
                      <ShieldCheck className="h-3.5 w-3.5" /> View certificate
                    </Button>
                  ) : null
                ) : (
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
                )}
              </>
            )}
          </div>
        )}

        {stage === "quiz" && quiz && !quizLocked && (
          <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
            <p className="text-[11px] text-muted-foreground">
              {allAnswered
                ? "All questions answered — submit for grading."
                : `${quiz.total_items - answeredCount} question${quiz.total_items - answeredCount === 1 ? "" : "s"} left.`}
            </p>
            <div className="flex items-center gap-2">
              {mode !== "quiz" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs"
                  onClick={() => void openReading()}
                >
                  <BookOpen className="h-3.5 w-3.5" /> Back to handbook
                </Button>
              )}
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
