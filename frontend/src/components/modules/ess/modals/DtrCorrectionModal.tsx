import { useState } from "react";
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
import { Clock, Send, Upload, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { myProfile } from "@/data/ess";

interface DtrCorrectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitCorrection?: (correctionData: any) => void;
}

export function DtrCorrectionModal({ open, onOpenChange, onSubmitCorrection }: DtrCorrectionModalProps) {
  const [type, setType] = useState("Time In Correction");
  const [date, setDate] = useState("");
  const [correctedTime, setCorrectedTime] = useState("08:00");
  const [reason, setReason] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      toast.error("Please specify the attendance date.");
      return;
    }

    const newCorrection = {
      type,
      date,
      correctedTime,
      reason,
      status: "Pending",
      filedDate: new Date().toISOString().slice(0, 10),
    };

    onSubmitCorrection?.(newCorrection);
    toast.success(`${type} request submitted to ${myProfile.supervisor} for verification.`);
    onOpenChange(false);
    setDate("");
    setReason("");
    setFileName(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-primary/10 p-2 text-primary">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-display">DTR Attendance Correction</DialogTitle>
              <DialogDescription>Submit missed logs or timecard adjustments.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Correction Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Time In Correction">Time In Correction (Late Override)</SelectItem>
                <SelectItem value="Time Out Correction">Time Out Correction</SelectItem>
                <SelectItem value="Missed Time In/Out">Missed Punch (Both In &amp; Out)</SelectItem>
                <SelectItem value="Break In/Out Adjustment">Break In/Out Adjustment</SelectItem>
                <SelectItem value="Rest Day Work Verification">Rest Day Work Verification</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Attendance Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Actual Time Rendered</Label>
              <Input
                type="time"
                value={correctedTime}
                onChange={(e) => setCorrectedTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Reason &amp; Explanation</Label>
            <Textarea
              rows={3}
              placeholder="e.g., Biometric terminal error, floor logbook signed, field assignment..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Logbook / Supervisor Proof (Optional)</Label>
            <div className="rounded-lg border border-dashed border-border p-3 text-center hover:border-primary/60 transition-colors">
              <label className="cursor-pointer flex flex-col items-center gap-1 text-xs text-muted-foreground">
                <Upload className="h-4 w-4 text-primary" />
                <span>{fileName ? fileName : "Upload photo of manual logbook or incident report"}</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setFileName(file.name);
                  }}
                />
              </label>
            </div>
          </div>

          <div className="rounded-md bg-muted/40 border border-border/70 p-2.5 text-[11px] text-muted-foreground flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
            <span>Attendance adjustments will be reflected upon Department Head verification.</span>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="gap-1.5">
              <Send className="h-4 w-4" /> Submit Correction
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
