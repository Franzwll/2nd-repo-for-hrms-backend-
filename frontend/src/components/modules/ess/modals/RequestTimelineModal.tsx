import { useEffect, useState } from "react";
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
import {
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Paperclip,
  Upload,
  XCircle,
} from "lucide-react";
import { EssStatusBadge } from "@/components/modules/ess/shared/EssStatusBadge";
import { essApi, type ApiEssRequestAttachment } from "@/lib/api";
import { toast } from "sonner";

export interface RequestItem {
  id?: string;
  dbId?: number;
  type: string;
  category?: string;
  date: string;
  isoDate?: string;
  status: string;
  assignedTo?: string;
  details?: string;
  filedBy?: string;
  note?: string | null;
  attachments?: ApiEssRequestAttachment[];
  has_fulfillment?: boolean;
  module?: string | null;
  moduleLabel?: string | null;
  moduleNote?: string | null;
  timeline?: { status: string; note: string | null; at: string | null }[];
}

const PIPELINE_STEPS = ["Filed", "ESS Review", "Module", "Release"] as const;

function pipelineStage(status: string): number {
  if (status === "For Dispatch" || status === "With Module" || status === "For Fulfillment") return 2;
  if (status === "For Release") return 3;
  if (status === "Completed") return 4;
  return 1;
}

function formatBytes(bytes: number | null | undefined) {
  if (!bytes || bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  return `${value.toFixed(value < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

function formatTimelineDate(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusIcon(status: string) {
  if (["Completed", "For Release", "Approved", "For Fulfillment"].includes(status)) {
    return <CheckCircle2 className="h-3.5 w-3.5" />;
  }
  if (["Rejected", "Cancelled"].includes(status)) {
    return <XCircle className="h-3.5 w-3.5" />;
  }
  return <Clock className="h-3 w-3" />;
}

interface RequestTimelineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: RequestItem | null;
  /** Called after a cancel/clarification so the parent can refresh its list. */
  onUpdated?: () => void;
}

export function RequestTimelineModal({
  open,
  onOpenChange,
  request,
  onUpdated,
}: RequestTimelineModalProps) {
  const [responseNote, setResponseNote] = useState("");
  const [responseFiles, setResponseFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Never carry a draft clarification from one request to another.
  useEffect(() => {
    setResponseNote("");
    setResponseFiles([]);
  }, [request?.id, request?.status]);

  if (!request) return null;

  const isOpenStatus = ["Pending", "Under Review", "Returned for Clarification"].includes(
    request.status,
  );
  const isReturned = request.status === "Returned for Clarification";
  const requestId = request.dbId ?? request.id;
  const timeline = request.timeline?.length
    ? request.timeline
    : [{ status: "Pending", note: "Request filed by employee.", at: null }];

  const handleCancel = async () => {
    if (!requestId) return;

    setCancelling(true);
    try {
      await essApi.cancelRequest(requestId);
      toast.success(`Request ${request.id ?? request.type} cancelled.`);
      onUpdated?.();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel the request.");
    } finally {
      setCancelling(false);
    }
  };

  const handleRespond = async () => {
    if (!requestId) return;
    if (!responseNote.trim() && responseFiles.length === 0) {
      toast.error("Add a note or attach a file so HR knows what changed.");
      return;
    }

    setSending(true);
    try {
      const form = new FormData();
      if (responseNote.trim()) form.append("note", responseNote.trim());
      responseFiles.forEach((file) => form.append("attachments[]", file));

      await essApi.respondToRequest(requestId, form);
      toast.success("Clarification submitted — your request is back with HR.");
      setResponseNote("");
      setResponseFiles([]);
      onUpdated?.();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit your clarification.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[calc(100vw-2rem)] overflow-y-auto sm:max-w-[560px]">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-primary/10 p-2 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="font-display text-xl">{request.type}</DialogTitle>
                <DialogDescription>Request ID: {request.id || "REQ-ESS-AUTO"}</DialogDescription>
              </div>
            </div>
            <EssStatusBadge status={request.status} />
          </div>
        </DialogHeader>

        {!["Rejected", "Cancelled"].includes(request.status) && (
          <div className="grid grid-cols-4 gap-1.5">
            {PIPELINE_STEPS.map((step, index) => {
              const stage = pipelineStage(request.status);
              const number = index + 1;
              const done = stage > number;
              const active = stage === number;

              return (
                <div key={step} className="space-y-1">
                  <div
                    className={`h-1.5 rounded-full ${
                      done || active ? "bg-primary" : "bg-muted"
                    }`}
                  />
                  <p
                    className={`text-[10px] font-medium ${
                      active
                        ? "text-primary"
                        : done
                          ? "text-foreground"
                          : "text-muted-foreground"
                    }`}
                  >
                    {step}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {isReturned && (
          <div className="rounded-lg border border-amber-500/40 dark:border-amber-400/25 bg-amber-500/10 dark:bg-amber-400/10 p-3.5 text-sm">
            <p className="flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-300">
              <Clock className="h-4 w-4" /> Action needed
            </p>
            <p className="mt-1 text-xs text-amber-800/90 dark:text-amber-200/90">
              {request.note || "HR needs more information before this request can continue."}
            </p>
          </div>
        )}

        {request.status === "Rejected" && (
          <div className="rounded-lg border border-rose-500/40 dark:border-rose-400/25 bg-rose-500/10 dark:bg-rose-400/10 p-3.5 text-sm">
            <p className="flex items-center gap-1.5 font-semibold text-rose-700 dark:text-rose-300">
              <XCircle className="h-4 w-4" /> Request rejected
            </p>
            <p className="mt-1 text-xs text-rose-800/90 dark:text-rose-200/90">
              {request.note || "Contact HR for more details."}
            </p>
          </div>
        )}

        {["For Dispatch", "With Module", "For Fulfillment"].includes(request.status) && (
          <div className="rounded-lg border border-indigo-500/40 dark:border-indigo-400/25 bg-indigo-500/10 dark:bg-indigo-400/10 p-3.5 text-sm">
            <p className="font-semibold text-indigo-700 dark:text-indigo-300">
              Approved — being processed by the responsible team
            </p>
            <p className="mt-1 text-xs text-indigo-800/90 dark:text-indigo-200/90">
              {request.moduleLabel
                ? `With ${request.moduleLabel}. You will be notified here once the result is ready.`
                : "You will be notified here once the result is ready."}
            </p>
          </div>
        )}

        {request.status === "For Release" && (
          <div className="rounded-lg border border-teal-500/40 dark:border-teal-400/25 bg-teal-500/10 dark:bg-teal-400/10 p-3.5 text-sm">
            <p className="font-semibold text-teal-700 dark:text-teal-300">
              Approved — waiting for final release
            </p>
            <p className="mt-1 text-xs text-teal-800/90 dark:text-teal-200/90">
              HR is reviewing the result. Any file appears here once it is released to you.
            </p>
          </div>
        )}

        {request.status === "Completed" && (
          <div className="rounded-lg border border-emerald-500/40 dark:border-emerald-400/25 bg-emerald-500/10 dark:bg-emerald-400/10 p-3.5 text-sm">
            <p className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4" /> Ready
            </p>
            <p className="mt-1 text-xs text-emerald-800/90 dark:text-emerald-200/90">
              Your request is complete.
              {request.moduleNote
                ? ` Result: ${request.moduleNote}`
                : " Download any released file from the Documents section below."}
            </p>
          </div>
        )}

        {/* Request Details */}
        <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3.5 text-xs">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground">Category</p>
              <p className="font-semibold text-foreground">
                {request.category || "General HR Request"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Date Filed</p>
              <p className="font-semibold text-foreground">{request.date}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Assigned Officer</p>
              <p className="font-semibold text-foreground">
                {request.assignedTo || "HR Administration"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Service SLA</p>
              <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                Within 24–48 Hours
              </p>
            </div>
          </div>
          {request.details && (
            <div className="border-t border-border/60 pt-2">
              <p className="text-muted-foreground">Details / Justification:</p>
              <p className="mt-0.5 italic text-foreground">"{request.details}"</p>
            </div>
          )}
        </div>

        {/* Attached / fulfilled documents */}
        {(request.attachments?.length ?? 0) > 0 && (
          <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3.5 text-xs">
            <p className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-muted-foreground">
              <Paperclip className="h-3.5 w-3.5 text-primary" /> Documents
            </p>
            {(request.attachments ?? []).map((a) => {
              const isHr = a.direction === "hr";
              const attachmentRequestId = request.dbId ?? request.id;
              const href =
                attachmentRequestId != null
                  ? essApi.requestAttachmentUrl(attachmentRequestId, a.id)
                  : undefined;

              return (
                <div
                  key={a.id}
                  className="flex items-center justify-between gap-2 rounded-md border border-border/60 bg-background px-2.5 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">
                      {a.original_name || (isHr ? "HR document" : "My attachment")}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {isHr ? "Provided by HR" : "Attached by you"}
                      {a.file_size_bytes ? ` · ${formatBytes(a.file_size_bytes)}` : ""}
                    </p>
                  </div>
                  {a.has_file && href ? (
                    <Button
                      asChild
                      size="sm"
                      variant={isHr ? "default" : "outline"}
                      className="shrink-0"
                    >
                      <a href={href} target="_blank" rel="noreferrer">
                        <Download className="mr-1.5 h-3.5 w-3.5" /> {isHr ? "Download" : "View"}
                      </a>
                    </Button>
                  ) : (
                    <span className="shrink-0 text-[11px] text-muted-foreground">Unavailable</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Clarification response */}
        {isReturned && (
          <div className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-3.5">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Your response to HR</Label>
              <Textarea
                rows={3}
                value={responseNote}
                onChange={(e) => setResponseNote(e.target.value)}
                placeholder="Explain what you changed or provide the missing information…"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Attach files (optional)</Label>
              <Input
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                onChange={(e) => setResponseFiles(Array.from(e.target.files ?? []))}
              />
            </div>
            <Button size="sm" onClick={() => void handleRespond()} disabled={sending}>
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              {sending ? "Submitting…" : "Submit clarification"}
            </Button>
          </div>
        )}

        {/* Real status timeline */}
        <div className="space-y-3 py-1">
          <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-primary" /> Request Timeline
          </h4>

          <div className="ml-2 space-y-4 border-l-2 border-primary/20 pl-6">
            {timeline.map((entry, index) => (
              <div key={`${entry.status}-${index}`} className="relative">
                <div className="absolute -left-[31px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  {statusIcon(entry.status)}
                </div>
                <p className="text-xs font-semibold text-foreground">{entry.status}</p>
                <p className="text-[11px] text-muted-foreground">{entry.note || "—"}</p>
                {entry.at && (
                  <p className="text-[11px] text-muted-foreground">{formatTimelineDate(entry.at)}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="flex-col items-center gap-2 border-t border-border pt-3 sm:flex-row sm:justify-between">
          {isOpenStatus ? (
            <Button
              variant="outline"
              size="sm"
              className="border-rose-500/30 dark:border-rose-400/20 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              onClick={() => void handleCancel()}
              disabled={cancelling}
            >
              <XCircle className="mr-1 h-3.5 w-3.5" />
              {cancelling ? "Cancelling…" : "Cancel Request"}
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
