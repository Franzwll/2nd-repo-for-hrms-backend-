import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Briefcase,
  AlertCircle,
  TrendingUp,
  Send,
  Building2,
  Paperclip,
  UploadCloud,
  FileText,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { myProfile, myPerformance } from "@/data/ess";
import { positions as fallbackPositions } from "@/data/hr";
import { essApi } from "@/lib/api";

interface PromotionRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitSuccess?: (requestData: any) => void;
  competencyScore?: string | undefined;
  lmsCompletedCount?: number | undefined;
}

interface PositionOption {
  id: string | number;
  title: string;
  dept?: string;
  level?: string;
  salaryBand?: string;
}

interface AttachedMediaItem {
  id: string;
  file: File;
  name: string;
  size: string;
  type: string;
  isImage: boolean;
  previewUrl?: string | undefined;
}

function matchesDepartment(targetDept?: string, userDept?: string): boolean {
  if (!targetDept || !userDept) return false;
  const a = targetDept.toLowerCase().trim();
  const b = userDept.toLowerCase().trim();
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  const wordsA = a.split(/[\s/&-]+/).filter((w) => w.length > 2);
  const wordsB = b.split(/[\s/&-]+/).filter((w) => w.length > 2);
  return wordsA.some((w) => wordsB.includes(w));
}

export function PromotionRequestModal({
  open,
  onOpenChange,
  onSubmitSuccess,
  competencyScore,
  lmsCompletedCount,
}: PromotionRequestModalProps) {
  const [targetPosition, setTargetPosition] = useState("");
  const [justification, setJustification] = useState("");
  const [keyAchievements, setKeyAchievements] = useState("");
  const [positionsList, setPositionsList] = useState<PositionOption[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Supporting media files state
  const [attachedFiles, setAttachedFiles] = useState<AttachedMediaItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 1. Filter fallback positions exclusively to employee's department and exclude current role.
    // Pastry Chef 2/3/4 are hidden from the promotion dropdown (hotel uses the
    // hot-kitchen ladder + Pastry Chef 1 / Lead / CDP Pastry instead).
    const HIDDEN_PROMOTION_TITLES = new Set([
      "pastry chef 2",
      "pastry chef 3",
      "pastry chef 4",
    ]);
    const isPromotionVisible = (title: string) =>
      !HIDDEN_PROMOTION_TITLES.has(title.toLowerCase().trim());

    const fallbackDeptPositions: PositionOption[] = fallbackPositions
      .filter(
        (p) =>
          matchesDepartment(p.department, myProfile.department) &&
          p.title !== myProfile.position &&
          isPromotionVisible(p.title)
      )
      .map((p) => ({
        id: p.id,
        title: p.title,
        dept: p.department,
        level: p.level,
        salaryBand: p.salaryBand,
      }));

    // 2. Fetch positions via the ESS-safe endpoint (employees have Core HCM=None
    // so /positions 403s). Falls back to the ladder when the API is unreachable.
    essApi
      .promotionPositions()
      .then((res) => {
        if (res?.data?.length) {
          const apiPositions: PositionOption[] = res.data
            .filter((p) => {
              const deptName = p.department || "";
              return (
                matchesDepartment(deptName, myProfile.department) &&
                p.title !== myProfile.position &&
                isPromotionVisible(p.title)
              );
            })
            .map((p) => ({
              id: p.position_id,
              title: p.title,
              dept: p.department || undefined,
            }));

          // Merge fallback ladder positions and API positions, deduplicating by title
          const seen = new Set<string>();
          const merged: PositionOption[] = [];
          for (const item of [...fallbackDeptPositions, ...apiPositions]) {
            const key = item.title.toLowerCase().trim();
            if (!seen.has(key)) {
              seen.add(key);
              merged.push(item);
            }
          }
          setPositionsList(merged);
        } else {
          setPositionsList(fallbackDeptPositions);
        }
      })
      .catch(() => {
        setPositionsList(fallbackDeptPositions);
      });
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const processFiles = (files: FileList | File[]) => {
    const newItems: AttachedMediaItem[] = [];
    Array.from(files).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`"${file.name}" exceeds the 10MB limit.`);
        return;
      }
      const isImage = file.type.startsWith("image/");
      const previewUrl = isImage ? URL.createObjectURL(file) : undefined;
      newItems.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        name: file.name,
        size: formatFileSize(file.size),
        type: isImage ? "image" : file.type.split("/")[1] || "document",
        isImage,
        previewUrl,
      });
    });
    if (newItems.length > 0) {
      setAttachedFiles((prev) => [...prev, ...newItems]);
      toast.success(`Attached ${newItems.length} media file${newItems.length > 1 ? "s" : ""}.`);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (id: string) => {
    setAttachedFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

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
        `Applicant: ${myProfile.name} (${myProfile.employeeId})`,
        `Target Position: ${targetPosition}`,
        `Department Career Track: ${myProfile.department}`,
        `Current Role: ${myProfile.position} (${myProfile.department})`,
        `Current Salary Grade: ${myPerformance.salaryGrade}`,
        competencyScore ? `Competency Score: ${competencyScore}` : "",
        lmsCompletedCount != null ? `LMS Training Completed: ${lmsCompletedCount} module(s)` : "",
        `Justification: ${justification.trim()}`,
        keyAchievements.trim() ? `Key Achievements: ${keyAchievements.trim()}` : "",
        attachedFiles.length > 0
          ? `Attached Supporting Media (${attachedFiles.length}):\n${attachedFiles.map((f, i) => `  ${i + 1}. ${f.name} (${f.size}, ${f.type})`).join("\n")}`
          : "",
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
      attachedFiles.forEach((f) => {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
      });
      setAttachedFiles([]);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit promotion request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <TrendingUp className="h-5 w-5" />
            <DialogTitle className="text-xl">Apply for Career Promotion</DialogTitle>
          </div>
          <DialogDescription>
            Submit an official promotion application. Submissions advance within your department career ladder
            and initiate a promotion appraisal review with your department head.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Current Profile Banner */}
          <div className="rounded-lg border border-border/80 bg-muted/40 p-3.5 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-primary" /> Current Employee Profile
            </div>
            <div className="grid grid-cols-2 gap-2.5 text-xs sm:grid-cols-3">
              <div>
                <span className="text-muted-foreground">Employee Name:</span>{" "}
                <strong className="text-foreground">{myProfile.name}</strong>
              </div>
              <div>
                <span className="text-muted-foreground">Employee ID:</span>{" "}
                <strong className="text-foreground">{myProfile.employeeId}</strong>
              </div>
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
                <strong className="text-foreground">{myPerformance.salaryGrade}</strong>
              </div>
              <div>
                <span className="text-muted-foreground">Tenure / Service:</span>{" "}
                <strong className="text-foreground">Regular Full-Time</strong>
              </div>
            </div>
          </div>

          {/* Target Position Selection - Strictly Department Restricted */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="target-position" className="text-xs font-semibold">
                Target Position / Desired Rank <span className="text-destructive">*</span>
              </Label>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                <Building2 className="h-3 w-3" /> {myProfile.department} Only
              </span>
            </div>
            <Select value={targetPosition} onValueChange={setTargetPosition}>
              <SelectTrigger id="target-position">
                <SelectValue placeholder={`Select promotion rank in ${myProfile.department}...`} />
              </SelectTrigger>
              <SelectContent className="max-h-[240px]">
                {positionsList.map((p) => (
                  <SelectItem key={p.id} value={p.title}>
                    <div className="flex items-center justify-between w-full gap-3">
                      <span>{p.title}</span>
                      {p.level && (
                        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded ml-2">
                          {p.level}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              Promotions are strictly intra-departmental. Showing positions within {myProfile.department}.
            </p>
          </div>

          {/* Justification Textarea */}
          <div className="space-y-1.5">
            <Label htmlFor="promotion-justification" className="text-xs font-semibold">
              Career Advancement Justification &amp; Readiness <span className="text-destructive">*</span>
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
              Key Achievements &amp; Contribution Highlights <span className="text-muted-foreground font-normal text-[11px]">(Optional)</span>
            </Label>
            <Textarea
              id="key-achievements"
              rows={2}
              placeholder="Notable projects completed, guest satisfaction ratings, culinary creations, leadership initiatives, cost savings..."
              value={keyAchievements}
              onChange={(e) => setKeyAchievements(e.target.value)}
              className="resize-none text-xs"
            />
          </div>

          {/* Supporting Media & Documents Upload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Paperclip className="h-3.5 w-3.5 text-primary" />
                Supporting Media &amp; Portfolio Files <span className="text-muted-foreground font-normal text-[11px]">(Optional)</span>
              </Label>
              {attachedFiles.length > 0 && (
                <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {attachedFiles.length} file{attachedFiles.length > 1 ? "s" : ""} attached
                </span>
              )}
            </div>

            <p className="text-[11px] text-muted-foreground">
              Attach photos of your pastry or culinary creations, dish presentations, certificates, commendations, or portfolio documents.
            </p>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
              id="promotion-media-upload"
            />

            {/* Drag & Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-primary bg-primary/10 scale-[0.99]"
                  : "border-border/80 hover:border-primary/60 hover:bg-muted/30"
              }`}
            >
              <div className="flex flex-col items-center justify-center gap-1">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <UploadCloud className="h-4 w-4" />
                </div>
                <div className="text-xs font-medium text-foreground">
                  Click to upload or drag &amp; drop media files
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Images (JPG, PNG, WEBP) or Documents (PDF, DOCX) up to 10MB
                </div>
              </div>
            </div>

            {/* Previews of attached files */}
            {attachedFiles.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 max-h-[160px] overflow-y-auto">
                {attachedFiles.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 p-2 rounded-lg border border-border/80 bg-background/80 shadow-2xs relative group"
                  >
                    {item.isImage && item.previewUrl ? (
                      <img
                        src={item.previewUrl}
                        alt={item.name}
                        className="h-10 w-10 object-cover rounded-md border border-border shrink-0"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-foreground truncate" title={item.name}>
                        {item.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <span>{item.size}</span>
                        <span>•</span>
                        <span className="capitalize">{item.type}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(item.id);
                      }}
                      className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Remove attachment"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
