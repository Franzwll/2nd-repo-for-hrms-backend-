import { Download, Upload, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EssStatusBadge } from "@/components/modules/ess/shared/EssStatusBadge";

export interface ViewerDoc {
  id: string;
  title: string;
  category: string;
  status: string;
  date: string;
  size: string;
  downloadUrl?: string;
}

interface DocumentViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doc: ViewerDoc | null;
  onDownload: (doc: ViewerDoc) => void;
  onUpload: (title: string) => void;
}

// TRY: card-grid viewer modal — delete file + usage in EssDocumentsTab to revert.
export function DocumentViewerModal({
  open,
  onOpenChange,
  doc,
  onDownload,
  onUpload,
}: DocumentViewerModalProps) {
  if (!doc) return null;
  const isMissing = doc.status === "Missing";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="font-display text-lg flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="truncate">{doc.title}</span>
          </DialogTitle>
          <DialogDescription>
            {doc.category} · {doc.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 overflow-y-auto">
          {/* Preview tile */}
          <div className="flex items-center gap-4 rounded-xl border border-border/70 bg-muted/20 p-4">
            <div className="relative shrink-0">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-black/10 bg-white shadow-sm">
                <span className="absolute right-0 top-0 h-3.5 w-3.5 rounded-bl-md rounded-tr-xl border-l border-b border-black/10 bg-muted" />
                <FileText className="h-7 w-7 text-red-500" strokeWidth={2} />
              </div>
              {isMissing && (
                <span className="absolute -right-1 -top-1 flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-white" />
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{doc.title}</p>
              <p className="text-xs text-muted-foreground">
                {doc.date} · <span className="font-mono">{doc.size}</span>
              </p>
              <div className="mt-1.5">
                <EssStatusBadge status={doc.status} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg border border-border/60 bg-background p-3">
              <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Category</p>
              <p className="mt-0.5 font-semibold text-foreground">{doc.category}</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-background p-3">
              <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Date on file</p>
              <p className="mt-0.5 font-semibold text-foreground">{doc.date}</p>
            </div>
          </div>

          {isMissing && (
            <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
              This file needs action — upload a clear scan to clear compliance.
            </p>
          )}
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-border/60 pt-4">
          {isMissing ? (
            <Button
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onUpload(doc.title);
              }}
              className="gap-1.5 text-xs cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5" /> Upload Now
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => onDownload(doc)}
              className="gap-1.5 text-xs cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" /> Download
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
