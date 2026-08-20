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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FileCheck, Send, Clock, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { essApi } from "@/lib/api";

interface DocumentRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestSuccess?: (req: any) => void;
}

export function DocumentRequestModal({ open, onOpenChange, onRequestSuccess }: DocumentRequestModalProps) {
  const [docType, setDocType] = useState("Certificate of Employment (with Salary)");
  const [purpose, setPurpose] = useState("Bank Loan Application");
  const [deliveryFormat, setDeliveryFormat] = useState<"digital" | "hardcopy">("digital");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      const res = await essApi.createRequest({
        category_code: "hr_document",
        category_name: "HR Document",
        request_type: docType,
        details: `Purpose: ${purpose} | Format: ${deliveryFormat === "digital" ? "Digital PDF" : "Physical Hardcopy"}${remarks ? ` | Remarks: ${remarks}` : ""}`,
      });

      onRequestSuccess?.(res.request);
      toast.success(`Request for ${docType} submitted to HR Services.`);
      onOpenChange(false);
      setRemarks("");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit document request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-primary/10 p-2 text-primary">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-display">Request Official HR Document</DialogTitle>
              <DialogDescription>Generate and request official company records and certificates.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Document Type</Label>
            <Select value={docType} onValueChange={setDocType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Certificate of Employment (with Salary)">Certificate of Employment (with Salary)</SelectItem>
                <SelectItem value="Certificate of Employment (without Salary)">Certificate of Employment (without Salary)</SelectItem>
                <SelectItem value="BIR Form 2316 (Certified Copy)">BIR Form 2316 (Certified Copy)</SelectItem>
                <SelectItem value="Certificate of Compensation & Benefits">Certificate of Compensation &amp; Benefits</SelectItem>
                <SelectItem value="Service Record Certificate">Service Record Certificate</SelectItem>
                <SelectItem value="Certificate of No Pending Administrative Case">Certificate of No Pending Case</SelectItem>
                <SelectItem value="HMO Coverage Certificate">HMO Coverage Certificate</SelectItem>
                <SelectItem value="Employment Contract Copy">Employment Contract Copy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Purpose of Request</Label>
            <Select value={purpose} onValueChange={setPurpose}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bank Loan Application">Bank Loan / Mortgage Application</SelectItem>
                <SelectItem value="Credit Card Application">Credit Card Application</SelectItem>
                <SelectItem value="Visa / International Travel">Visa / Embassy Travel Requirements</SelectItem>
                <SelectItem value="Government Agency Requirement">Government Agency (SSS/PhilHealth/HDMF)</SelectItem>
                <SelectItem value="Personal Records & Reference">Personal File / Reference</SelectItem>
                <SelectItem value="School / Academic Requirement">School / Academic Requirement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Issuance Format</Label>
            <RadioGroup
              value={deliveryFormat}
              onValueChange={(val: any) => setDeliveryFormat(val)}
              className="grid grid-cols-2 gap-2.5"
            >
              <Label
                htmlFor="fmt-digital"
                className={`flex flex-col gap-1 rounded-lg border p-3 cursor-pointer transition-colors ${
                  deliveryFormat === "digital" ? "border-primary bg-primary/5 text-foreground" : "border-border hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="digital" id="fmt-digital" className="sr-only" />
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold">Digital PDF (Fast)</span>
                </div>
                <p className="text-[10px] text-muted-foreground pl-6">
                  QR-verified e-signature, released in 24 hrs.
                </p>
              </Label>

              <Label
                htmlFor="fmt-hardcopy"
                className={`flex flex-col gap-1 rounded-lg border p-3 cursor-pointer transition-colors ${
                  deliveryFormat === "hardcopy" ? "border-primary bg-primary/5 text-foreground" : "border-border hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="hardcopy" id="fmt-hardcopy" className="sr-only" />
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-semibold">Physical Hardcopy</span>
                </div>
                <p className="text-[10px] text-muted-foreground pl-6">
                  With HR dry seal, pickup at HR office.
                </p>
              </Label>
            </RadioGroup>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Additional Remarks / Specific Addressee (Optional)</Label>
            <Textarea
              rows={2}
              placeholder="e.g., Please address to: The Visa Officer, Embassy of Japan..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          <div className="rounded-md bg-muted/40 border border-border/70 p-2.5 text-[11px] text-muted-foreground flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" /> Standard Turnaround Time:
            </span>
            <span className="font-semibold text-foreground">1 to 2 Business Days</span>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="gap-1.5">
              <Send className="h-4 w-4" /> Submit Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
