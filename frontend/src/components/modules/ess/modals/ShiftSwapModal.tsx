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
import { ArrowLeftRight, Send, CheckCircle2, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { employees } from "@/data/hr";
import { myProfile } from "@/data/ess";
import { essApi } from "@/lib/api";

interface ShiftSwapModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitSwap?: (swapData: any) => void;
}

export function ShiftSwapModal({ open, onOpenChange, onSubmitSwap }: ShiftSwapModalProps) {
  const [shiftDate, setShiftDate] = useState("");
  const [targetPeer, setTargetPeer] = useState("EMP-0005");
  const [peerShiftDate, setPeerShiftDate] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const peers = employees.filter((e) => e.department === myProfile.department && e.name !== myProfile.name);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftDate || !peerShiftDate) {
      toast.error("Please provide both shift dates.");
      return;
    }

    const peerObj = employees.find((e) => e.id === targetPeer);

    try {
      setSubmitting(true);
      const res = await essApi.createRequest({
        category_code: "schedule",
        category_name: "Shift Schedule",
        request_type: "Shift Swap Request",
        date_from: shiftDate,
        date_to: peerShiftDate,
        details: `Swap shift with ${peerObj?.name || "Colleague"} (${targetPeer}) on ${peerShiftDate}. Reason: ${reason}`,
      });

      toast.success(`Shift swap request sent to ${peerObj?.name || "colleague"} and Supervisor for approval.`);
      onSubmitSwap?.(res.request);
      onOpenChange(false);
      setShiftDate("");
      setPeerShiftDate("");
      setReason("");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit shift swap request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-purple-500/10 p-2 text-purple-600">
              <ArrowLeftRight className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-display">Request Shift Swap</DialogTitle>
              <DialogDescription>Trade scheduled shifts with a colleague in {myProfile.department}.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Select Colleague to Swap With</Label>
            <Select value={targetPeer} onValueChange={setTargetPeer}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {peers.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.position})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">My Current Shift Date</Label>
              <Input
                type="date"
                value={shiftDate}
                onChange={(e) => setShiftDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Colleague's Shift Date</Label>
              <Input
                type="date"
                value={peerShiftDate}
                onChange={(e) => setPeerShiftDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Reason for Swap</Label>
            <Textarea
              rows={3}
              placeholder="State reason for shifting schedule..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          <div className="rounded-md bg-muted/40 border border-border/70 p-2.5 text-[11px] text-muted-foreground flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
            <span>Requires mutual agreement and supervisor approval at least 24 hours in advance.</span>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="gap-1.5">
              <Send className="h-4 w-4" /> Send Swap Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
