import { Download, Upload, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { essApi } from "@/lib/api";

export interface ViewerDoc {
  id: string;
  dbId?: number;
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

// Card-grid viewer modal — shows the file itself, not metadata.
export function DocumentViewerModal({
  open,
  onOpenChange,
  doc,
  onDownload,
  onUpload,
}: DocumentViewerModalProps) {
  if (!doc) return null;
  const isMissing = doc.status === "Missing";
  const fileUrl =
    doc.dbId != null
      ? essApi.documentFileUrl(doc.dbId)
      : doc.downloadUrl && doc.downloadUrl !== "#"
        ? doc.downloadUrl
        : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="font-display text-lg flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="truncate">{doc.title}</span>
          </DialogTitle>
          <DialogDescription>
            {doc.category} · {doc.id}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-border/70 bg-muted/20">
          {fileUrl && !isMissing ? (
            <iframe
              key={fileUrl}
              src={fileUrl}
              title={doc.title}
              className="h-full min-h-[50vh] w-full"
            />
          ) : (
            <div className="flex h-full min-h-[30vh] flex-col items-center justify-center gap-2 p-8 text-center">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <p className="text-xs font-semibold text-foreground">
                {isMissing ? "No file on record yet" : "Preview unavailable"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {isMissing
                  ? "Upload a clear scan to clear compliance."
                  : "Use Download to get a copy of this document."}
              </p>
            </div>
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
