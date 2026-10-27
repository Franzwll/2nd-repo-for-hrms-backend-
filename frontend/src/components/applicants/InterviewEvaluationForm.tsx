import { CheckCircle2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ApiSystemUser } from "@/lib/api";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* InterviewEvaluationForm — the one interview assessment form.        */
/*                                                                     */
/* Shared by the on-site "Start Interview" dialog and the Zoom room's */
/* scorecard so both flows collect the exact same assessment with the */
/* exact same UI: interviewer + date, a Category / Rate / Comments    */
/* table (1–5 dropdown + per-criterion comment), an overall          */
/* evaluation, the computed score and the Passed / Failed verdict.    */
/*                                                                     */
/* The table switches to its three-column layout from the width of the */
/* form itself (container query), not the viewport — that keeps the    */
/* wide on-site dialog and the narrower Zoom scorecard column in sync  */
/* without duplicating the markup. Below 420px the table stacks, one  */
/* field per row.                                                     */
/* ------------------------------------------------------------------ */

export type InterviewEvaluationFormProps = {
  /** Assessment criteria (one row each). */
  criteria: string[];
  /** System users that can be picked as the interviewer. */
  assessors: ApiSystemUser[];
  /** Selected interviewer id. */
  assessor: string;
  onAssessorChange: (value: string) => void;
  /** Interview date (ISO yyyy-mm-dd). */
  date: string;
  onDateChange: (value: string) => void;
  /** Score per criterion, 1–5. */
  scores: Record<string, number>;
  onScoreChange: (criterion: string, value: number) => void;
  /** Comment per criterion. */
  comments: Record<string, string>;
  onCommentChange: (criterion: string, value: string) => void;
  /** Overall evaluation text. */
  remarks: string;
  onRemarksChange: (value: string) => void;
  /** Opens the "mark as Passed?" confirmation. */
  onRequestPassed: () => void;
  /** Opens the "mark as Failed?" confirmation. */
  onRequestFailed: () => void;
  /** Pins the verdict row to the bottom of a scrolling container. */
  stickyFooter?: boolean;
  className?: string;
};

export function InterviewEvaluationForm({
  criteria,
  assessors,
  assessor,
  onAssessorChange,
  date,
  onDateChange,
  scores,
  onScoreChange,
  comments,
  onCommentChange,
  remarks,
  onRemarksChange,
  onRequestPassed,
  onRequestFailed,
  stickyFooter = false,
  className,
}: InterviewEvaluationFormProps) {
  const computedScore = Math.round(
    (criteria.reduce((t, c) => t + (scores[c] ?? 4), 0) / (criteria.length * 5)) * 100,
  );

  return (
    <div className={cn("@container space-y-4", className)}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>
            Interviewer <span className="text-destructive">*</span>
          </Label>
          <Select value={assessor} onValueChange={onAssessorChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select interviewer" />
            </SelectTrigger>
            <SelectContent>
              {assessors.length === 0 && (
                <div className="px-2 py-3 text-xs text-muted-foreground">
                  No system users found.
                </div>
              )}
              {assessors.map((u) => (
                <SelectItem key={u.system_user_id} value={String(u.system_user_id)}>
                  {u.full_name}
                  {u.department_name ? ` — ${u.department_name}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Interview date</Label>
          <Input type="date" value={date} onChange={(e) => onDateChange(e.target.value)} />
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-border">
        <div className="grid grid-cols-1 gap-2 border-b border-border bg-muted/40 px-4 py-2 @min-[420px]:grid-cols-[1fr_130px_1fr] @min-[420px]:gap-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Category
          </span>
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Rate
          </span>
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Comments
          </span>
        </div>
        {criteria.map((c, idx) => (
          <div
            key={c}
            className={
              "grid grid-cols-1 gap-3 px-4 py-3 @min-[420px]:grid-cols-[1fr_130px_1fr] @min-[420px]:items-stretch @min-[420px]:gap-4" +
              (idx > 0 ? " border-t border-border" : "")
            }
          >
            <span className="flex text-sm font-medium @min-[420px]:items-center">{c}</span>
            <Select
              value={String(scores[c] ?? 4)}
              onValueChange={(v) => onScoreChange(c, Number(v))}
            >
              <SelectTrigger className="h-full min-h-[60px] w-full @min-[420px]:w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 4, 3, 2, 1].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} / 5
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              rows={2}
              className="min-h-[60px]"
              value={comments[c] ?? ""}
              onChange={(e) => onCommentChange(c, e.target.value)}
              placeholder={`Remarks for ${c.toLowerCase()}—`}
            />
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Label>Overall Evaluation</Label>
        <Textarea
          rows={3}
          value={remarks}
          onChange={(e) => onRemarksChange(e.target.value)}
          placeholder="Overall evaluation of the interview—"
        />
      </div>

      <div className="rounded-md border border-border p-3">
        <div>
          <p className="eyebrow">Computed score</p>
          <p className="font-display text-3xl font-semibold text-primary">{computedScore}%</p>
        </div>
      </div>

      <div
        className={cn(
          "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end",
          stickyFooter &&
            "sticky bottom-0 z-10 -mx-3 border-t border-border bg-background px-3 py-2.5",
        )}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="text-xs font-semibold text-muted-foreground">Assessor Verdict:</span>
          <Button
            variant="outline"
            className="border-success/40 text-success hover:bg-success/10 hover:text-success"
            onClick={onRequestPassed}
          >
            <CheckCircle2 className="mr-1.5 h-4 w-4" /> Passed
          </Button>
          <Button
            variant="outline"
            className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={onRequestFailed}
          >
            <XCircle className="mr-1.5 h-4 w-4" /> Failed
          </Button>
        </div>
      </div>
    </div>
  );
}

export default InterviewEvaluationForm;
