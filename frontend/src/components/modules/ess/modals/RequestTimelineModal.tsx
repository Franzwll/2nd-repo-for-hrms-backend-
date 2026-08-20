import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Clock,
  User,
  Building,
  FileText,
  AlertCircle,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Send,
} from "lucide-react";
import { EssStatusBadge } from "@/components/modules/ess/shared/EssStatusBadge";
import { toast } from "sonner";

export interface RequestItem {
  id?: string;
  type: string;
  category?: string;
  date: string;
  isoDate?: string;
  status: string;
  assignedTo?: string;
  details?: string;
  filedBy?: string;
}

interface RequestTimelineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: RequestItem | null;
  onCancelRequest?: (id: string) => void;
}

export function RequestTimelineModal({
  open,
  onOpenChange,
  request,
  onCancelRequest,
}: RequestTimelineModalProps) {
  if (!request) return null;

  const isPending = request.status === "Pending" || request.status === "Under Review";

  const handleCancel = () => {
    if (request.id) {
      onCancelRequest?.(request.id);
    }
    toast.info(`Request ${request.id || request.type} has been cancelled.`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-primary/10 p-2 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-display">{request.type}</DialogTitle>
                <DialogDescription>Request ID: {request.id || "REQ-ESS-AUTO"}</DialogDescription>
              </div>
            </div>
            <EssStatusBadge status={request.status} />
          </div>
        </DialogHeader>

        {/* Request Details Card */}
        <div className="rounded-lg border border-border bg-muted/20 p-3.5 space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-muted-foreground">Category</p>
              <p className="font-semibold text-foreground">{request.category || "General HR Request"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Date Filed</p>
              <p className="font-semibold text-foreground">{request.date}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Assigned Officer</p>
              <p className="font-semibold text-foreground">{request.assignedTo || "Juan Dela Cruz (HR Admin)"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Service SLA</p>
              <p className="font-semibold text-emerald-600 dark:text-emerald-400">Within 24–48 Hours</p>
            </div>
          </div>
          {request.details && (
            <div className="pt-2 border-t border-border/60">
              <p className="text-muted-foreground">Details / Justification:</p>
              <p className="mt-0.5 text-foreground italic">"{request.details}"</p>
            </div>
          )}
        </div>

        {/* Multi-Step Approval Timeline */}
        <div className="space-y-3 py-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-primary" /> Approval Audit Trail
          </h4>

          <div className="relative pl-6 space-y-5 border-l-2 border-primary/20 ml-2">
            {/* Step 1: Filed */}
            <div className="relative">
              <div className="absolute -left-[31px] top-0.5 h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
              <p className="text-xs font-semibold text-foreground">1. Request Submitted by Employee</p>
              <p className="text-[11px] text-muted-foreground">
                Filed on {request.date} · Logged into ESS Central Queue
              </p>
            </div>

            {/* Step 2: Department Endorsement */}
            <div className="relative">
              <div
                className={`absolute -left-[31px] top-0.5 h-5 w-5 rounded-full flex items-center justify-center text-xs ${
                  request.status !== "Pending"
                    ? "bg-emerald-500 text-white"
                    : "bg-amber-500 text-white animate-pulse"
                }`}
              >
                {request.status !== "Pending" ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <Clock className="h-3 w-3" />
                )}
              </div>
              <p className="text-xs font-semibold text-foreground">2. Department Supervisor Review</p>
              <p className="text-[11px] text-muted-foreground">
                {request.status === "Pending"
                  ? "Awaiting endorsement from Executive Chef Marco"
                  : `Endorsed by Department Head · Verified shift requirement`}
              </p>
            </div>

            {/* Step 3: HR Action */}
            <div className="relative">
              <div
                className={`absolute -left-[31px] top-0.5 h-5 w-5 rounded-full flex items-center justify-center text-xs ${
                  ["Approved", "Completed", "Released"].includes(request.status)
                    ? "bg-emerald-500 text-white"
                    : request.status === "Rejected"
                    ? "bg-rose-500 text-white"
                    : "bg-muted-foreground/30 text-muted-foreground"
                }`}
              >
                {["Approved", "Completed", "Released"].includes(request.status) ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : request.status === "Rejected" ? (
                  <XCircle className="h-3.5 w-3.5" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-current" />
                )}
              </div>
              <p className="text-xs font-semibold text-foreground">3. HR Service Action &amp; Resolution</p>
              <p className="text-[11px] text-muted-foreground">
                {["Approved", "Completed", "Released"].includes(request.status)
                  ? `Approved & processed by ${request.assignedTo || "HR Office"}`
                  : request.status === "Rejected"
                  ? "Request rejected by HR. Check notes for details."
                  : "Assigned to HR Administrator for final processing"}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-between items-center border-t border-border pt-3">
          {isPending ? (
            <Button
              variant="outline"
              size="sm"
              className="text-xs text-rose-600 border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              onClick={handleCancel}
            >
              <XCircle className="mr-1 h-3.5 w-3.5" /> Cancel Request
            </Button>
          ) : (
            <div />
          )}

          <Button size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
