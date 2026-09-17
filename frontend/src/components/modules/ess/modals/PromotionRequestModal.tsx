import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Award, Briefcase, CheckCircle2, AlertCircle, TrendingUp, Sparkles, Send, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { myProfile, myPerformance } from "@/data/ess";
import { positions as fallbackPositions } from "@/data/hr";
import { essApi, hcmApi } from "@/lib/api";

interface PromotionRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitSuccess?: (requestData: any) => void;
  competencyScore?: string;
  lmsCompletedCount?: number;
}

export function PromotionRequestModal({
  open,
  onOpenChange,
  onSubmitSuccess,
  competencyScore = "95%",
  lmsCompletedCount = 2,
}: PromotionRequestModalProps) {
  const [targetPosition, setTargetPosition] = useState("");
  const [justification, setJustification] = useState("");
  const [keyAchievements, setKeyAchievements] = useState("");
  const [positionsList, setPositionsList] = useState<{ id: string | number; title: string; dept?: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Load active positions from HCM API or fallback
    hcmApi.positions
      .list({ per_page: 100 })
      .then((res) => {
        if (res?.data?.length) {
          setPositionsList(
            res.data.map((p) => ({
              id: p.position_id,
              title: p.title,
              dept: p.department?.name,
            }))
          );
        } else {
          setPositionsList(
            fallbackPositions.map((p) => ({
              id: p.id,
              title: p.title,
              dept: p.department,
            }))
          );
        }
      })
      .catch(() => {
        setPositionsList(
          fallbackPositions.map((p) => ({
            id: p.id,
            title: p.title,
            dept: p.department,
          }))
        );
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPosition) {
      toast.error("Please select a target position.");
      return;
    }
    if (!justification.trim()) {
      toast.error("Please provide a career advancement justification.");
      return;
    }

    try {
      setSubmitting(true);
      const detailsPayload = [
        `Target Position: ${targetPosition}`,
        `Current Role: ${myProfile.position} (${myProfile.department})`,
        `Current Salary Grade: ${myPerformance.salaryGrade} (${myPerformance.salaryStep})`,
        `Evaluation Score on File: ${competencyScore}`,
        `LMS Completed Courses: ${lmsCompletedCount}`,
        `Justification: ${justification.trim()}`,
        keyAchievements.trim() ? `Key Achievements: ${keyAchievements.trim()}` : "",
      ]
        .filter(Boolean)
        .join("\n\n");

      const res = await essApi.createRequest({
        category_code: "career_promotion",
        category_name: "Career & Position",
        request_type: `Promotion Request — ${targetPosition}`,
        details: detailsPayload,
      });

      toast.success(
        "Promotion request submitted successfully! Forwarded to Core HCM & Performance Evaluation team for review."
      );
      onSubmitSuccess?.(res?.request);
      onOpenChange(false);
      setTargetPosition("");
      setJustification("");
      setKeyAchievements("");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit promotion request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <TrendingUp className="h-5 w-5" />
            <DialogTitle className="text-xl">Apply for Career Promotion</DialogTitle>
          </div>
          <DialogDescription>
            Submit an official promotion application. Your request feeds into Core HCM and initiates a performance
            appraisal review with your department head.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Current Profile & Prerequisites Banner */}
          <div className="rounded-lg border border-border/80 bg-muted/40 p-3.5 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-primary" /> Current Employee Standing
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Current Title:</span>{" "}
                <strong className="text-foreground">{myProfile.position}</strong>
              </div>
              <div>
                <span className="text-muted-foreground">Department:</span>{" "}
                <strong className="text-foreground">{myProfile.department}</strong>
              </div>
              <div>
                <span className="text-muted-foreground">Salary Grade:</span>{" "}
                <strong className="text-foreground">{myPerformance.salaryGrade} · {myPerformance.salaryStep}</strong>
              </div>
              <div>
                <span className="text-muted-foreground">Tenure / Service:</span>{" "}
                <strong className="text-foreground">Regular Full-Time</strong>
              </div>
            </div>

            {/* Performance Pre-Check */}
            <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Performance Score: <strong>{competencyScore}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-primary font-medium">
                <BookOpen className="h-3.5 w-3.5" />
                <span>LMS Modules: <strong>{lmsCompletedCount} completed</strong></span>
              </div>
            </div>
          </div>

          {/* Target Position Selection */}
          <div className="space-y-1.5">
            <Label htmlFor="target-position" className="text-xs font-semibold">
              Target Position / Desired Rank <span className="text-destructive">*</span>
            </Label>
            <Select value={targetPosition} onValueChange={setTargetPosition}>
              <SelectTrigger id="target-position">
                <SelectValue placeholder="Select target promotion position" />
              </SelectTrigger>
              <SelectContent className="max-h-[220px]">
                {positionsList
                  .filter((p) => p.title !== myProfile.position)
                  .map((p) => (
                    <SelectItem key={p.id} value={p.title}>
                      {p.title} {p.dept ? `(${p.dept})` : ""}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Justification Textarea */}
          <div className="space-y-1.5">
            <Label htmlFor="promotion-justification" className="text-xs font-semibold">
              Career Advancement Justification & Readiness <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="promotion-justification"
              rows={3}
              placeholder="Explain why you are ready for this role, how your responsibilities have expanded, and how you have prepared for this position..."
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              className="resize-none text-xs"
            />
          </div>

          {/* Key Achievements */}
          <div className="space-y-1.5">
            <Label htmlFor="key-achievements" className="text-xs font-semibold">
              Key Achievements & Contribution Highlights (Optional)
            </Label>
            <Textarea
              id="key-achievements"
              rows={2}
              placeholder="Notable projects completed, guest satisfaction ratings, leadership initiatives, cost savings..."
              value={keyAchievements}
              onChange={(e) => setKeyAchievements(e.target.value)}
              className="resize-none text-xs"
            />
          </div>

          <div className="rounded-md bg-amber-500/10 p-3 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <strong>HR Process Notice:</strong> Promotion applications are forwarded to Core HCM and the Performance
              Appraisal Board. A supervisor evaluation recommendation (HR3) is required before final executive sign-off.
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={submitting} className="gap-1.5">
              <Send className="h-3.5 w-3.5" />
              {submitting ? "Submitting..." : "Submit Promotion Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
