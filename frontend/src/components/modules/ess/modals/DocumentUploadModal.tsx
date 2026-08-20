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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileCheck, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface DocumentUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentTitle?: string;
  onUploadSuccess?: (doc: any) => void;
}

export function DocumentUploadModal({
  open,
  onOpenChange,
  documentTitle = "Updated NBI Clearance (2026)",
  onUploadSuccess,
}: DocumentUploadModalProps) {
  const [docName, setDocName] = useState(documentTitle);
  const [docCategory, setDocCategory] = useState("Government Clearance");
  const [expiryDate, setExpiryDate] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }

    const uploadedDoc = {
      id: `DOC-${Date.now().toString().slice(-3)}`,
      title: docName,
      category: docCategory,
      status: "Submitted",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
    };

    onUploadSuccess?.(uploadedDoc);
    toast.success(`${docName} uploaded successfully and sent to HR for verification.`);
    onOpenChange(false);
    setFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-blue-500/10 p-2 text-blue-600">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-display">Upload Employment Document</DialogTitle>
              <DialogDescription>Submit mandatory compliance and HR records.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Document Title</Label>
            <Input
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="e.g., NBI Clearance, Health Certificate"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Category</Label>
              <Select value={docCategory} onValueChange={setDocCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Government Clearance">Government Clearance</SelectItem>
                  <SelectItem value="Medical & Health">Medical &amp; Health</SelectItem>
                  <SelectItem value="Tax Document">Tax Document</SelectItem>
                  <SelectItem value="Employment Record">Employment Record</SelectItem>
                  <SelectItem value="Certifications">Certifications</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Expiry Date (If applicable)</Label>
              <Input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
          </div>

          {/* Drag & Drop Area */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Select File</Label>
            <div className="rounded-xl border-2 border-dashed border-border p-5 text-center hover:border-primary/60 transition-colors bg-muted/20">
              <label className="cursor-pointer flex flex-col items-center gap-2 text-xs text-muted-foreground">
                <div className="rounded-full bg-primary/10 p-2.5 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-semibold text-foreground">
                    {file ? file.name : "Click to choose or drag & drop"}
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Supports PDF, PNG, JPG up to 10MB
                  </p>
                </div>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setFile(f);
                  }}
                />
              </label>
            </div>
          </div>

          <div className="rounded-md bg-muted/40 border border-border/70 p-2.5 text-[11px] text-muted-foreground flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
            <span>Uploaded documents are encrypted and reviewed by HR Administration.</span>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="gap-1.5">
              <Upload className="h-4 w-4" /> Upload Document
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
