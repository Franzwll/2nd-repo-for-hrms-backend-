import { useState } from "react";
import { Clock, FileCheck, Send, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { essApi } from "@/lib/api";
import { subtypesFor } from "@/data/essRequestCatalogue";
import { RequestModalShell } from "../RequestModalShell";

const DOCUMENT_TYPES = subtypesFor("HR Document");

interface DocumentRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted?: () => void;
}

export function DocumentRequestModal({
  open,
  onOpenChange,
  onSubmitted,
}: DocumentRequestModalProps) {
  const [docType, setDocType] = useState(DOCUMENT_TYPES[0] ?? "");
  const [purpose, setPurpose] = useState("Bank Loan Application");
  const [deliveryFormat, setDeliveryFormat] = useState<"digital" | "hardcopy">("digital");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      await essApi.createRequest({
        category_code: "hr_document",
        category_name: "HR Document",
        request_type: docType,
        details: `Purpose: ${purpose} | Format: ${deliveryFormat === "digital" ? "Digital PDF" : "Physical Hardcopy"}${remarks ? ` | Remarks: ${remarks}` : ""}`,
      });

      toast.success(`Request for ${docType} submitted to HR Services.`);
      setRemarks("");
      onOpenChange(false);
      onSubmitted?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit document request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RequestModalShell
      open={open}
      onOpenChange={onOpenChange}
      icon={FileCheck}
      title="Request Official HR Document"
      subtitle="Generate and request official company records and certificates."
    >
      <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Request Type</Label>
            <Select value={docType} onValueChange={setDocType}>
              <SelectTrigger className="h-9 bg-background text-xs focus:border-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t} className="text-xs">
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Purpose of Request</Label>
            <Select value={purpose} onValueChange={setPurpose}>
              <SelectTrigger className="h-9 bg-background text-xs focus:border-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bank Loan Application" className="text-xs">
                  Bank Loan / Mortgage Application
                </SelectItem>
                <SelectItem value="Credit Card Application" className="text-xs">
                  Credit Card Application
                </SelectItem>
                <SelectItem value="Visa / International Travel" className="text-xs">
                  Visa / Embassy Travel Requirements
                </SelectItem>
                <SelectItem value="Government Agency Requirement" className="text-xs">
                  Government Agency (SSS/PhilHealth/HDMF)
                </SelectItem>
                <SelectItem value="Personal Records & Reference" className="text-xs">
                  Personal File / Reference
                </SelectItem>
                <SelectItem value="School / Academic Requirement" className="text-xs">
                  School / Academic Requirement
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Issuance Format</Label>
          <RadioGroup
            value={deliveryFormat}
            onValueChange={(val: any) => setDeliveryFormat(val)}
            className="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
          >
            <Label
              htmlFor="mr-fmt-digital"
              className={`flex cursor-pointer flex-col gap-1 rounded-lg border p-3 transition-colors ${
                deliveryFormat === "digital"
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border hover:bg-muted"
              }`}
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="digital" id="mr-fmt-digital" className="sr-only" />
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold">Digital PDF (Fast)</span>
              </div>
              <p className="pl-6 text-[10px] text-muted-foreground">
                QR-verified e-signature, released in 24 hrs.
              </p>
            </Label>

            <Label
              htmlFor="mr-fmt-hardcopy"
              className={`flex cursor-pointer flex-col gap-1 rounded-lg border p-3 transition-colors ${
                deliveryFormat === "hardcopy"
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border hover:bg-muted"
              }`}
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="hardcopy" id="mr-fmt-hardcopy" className="sr-only" />
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-semibold">Physical Hardcopy</span>
              </div>
              <p className="pl-6 text-[10px] text-muted-foreground">
                With HR dry seal, pickup at HR office.
              </p>
            </Label>
          </RadioGroup>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">
            Additional Remarks / Specific Addressee (Optional)
          </Label>
          <Textarea
            rows={3}
            placeholder="e.g., Please address to: The Visa Officer, Embassy of Japan..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="resize-none bg-background text-xs focus:border-primary"
          />
        </div>

        <div className="flex items-center justify-between rounded-md border border-border/70 bg-muted/40 p-2.5 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-primary" /> Standard Turnaround Time:
          </span>
          <span className="font-semibold text-foreground">1 to 2 Business Days</span>
        </div>

        <div className="flex flex-col-reverse justify-end gap-2 border-t border-border/70 pt-4 sm:flex-row">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="w-full gap-1.5 px-5 text-xs font-semibold shadow-xs sm:w-auto"
          >
            <Send className="h-3.5 w-3.5" /> {submitting ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </form>
    </RequestModalShell>
  );
}
