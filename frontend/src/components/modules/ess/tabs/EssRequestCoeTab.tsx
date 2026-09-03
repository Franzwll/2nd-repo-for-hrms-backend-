import { useState } from "react";
import {
  FileCheck,
  Send,
  Clock,
  ShieldCheck,
  Sparkles,
  RotateCcw,
  FileText,
  Building2,
  CheckCircle2,
  HelpCircle,
  QrCode,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { essApi } from "@/lib/api";

export function EssRequestCoeTab() {
  const [docType, setDocType] = useState("Certificate of Employment (with Salary)");
  const [purpose, setPurpose] = useState("Bank Loan / Mortgage Application");
  const [deliveryFormat, setDeliveryFormat] = useState<"digital" | "hardcopy">("digital");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleReset = () => {
    setDocType("Certificate of Employment (with Salary)");
    setPurpose("Bank Loan / Mortgage Application");
    setDeliveryFormat("digital");
    setRemarks("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      await essApi.createRequest({
        category_code: "hr_document",
        category_name: "HR Document",
        request_type: docType,
        details: `Purpose: ${purpose} | Format: ${deliveryFormat === "digital" ? "Digital PDF" : "Physical Hardcopy"}${remarks ? ` | Addressee/Remarks: ${remarks}` : ""}`,
      });

      toast.success(`Request for ${docType} successfully submitted to HR Services.`);
      handleReset();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit document request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h3 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-primary" />
          Request Official HR Document / COE
        </h3>
        <p className="text-xs text-muted-foreground">
          Generate and request official company records, Certificate of Employment (COE), and tax certifications.
        </p>
      </div>

      {/* Main Full-Page Form Grid Layout */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Full-Page Document Request Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-border/70 shadow-xs">
            <CardHeader className="pb-4 border-b border-border/60 bg-muted/15">
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="font-display text-lg font-semibold">
                    Request Official HR Document
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Complete the details below to request certificates and employment records.
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Document Type Selector */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Document Type *</Label>
                  <Select value={docType} onValueChange={setDocType}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Certificate of Employment (with Salary)">
                        Certificate of Employment (with Salary)
                      </SelectItem>
                      <SelectItem value="Certificate of Employment (without Salary)">
                        Certificate of Employment (without Salary)
                      </SelectItem>
                      <SelectItem value="BIR Form 2316 (Certified Copy)">
                        BIR Form 2316 (Certified Copy)
                      </SelectItem>
                      <SelectItem value="Certificate of Compensation & Benefits">
                        Certificate of Compensation &amp; Benefits
                      </SelectItem>
                      <SelectItem value="Service Record Certificate">
                        Service Record Certificate
                      </SelectItem>
                      <SelectItem value="Certificate of No Pending Case">
                        Certificate of No Pending Case
                      </SelectItem>
                      <SelectItem value="HMO Coverage Certificate">
                        HMO Coverage Certificate
                      </SelectItem>
                      <SelectItem value="Employment Contract Copy">
                        Employment Contract Copy
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Purpose of Request */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Purpose of Request *</Label>
                  <Select value={purpose} onValueChange={setPurpose}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bank Loan / Mortgage Application">
                        Bank Loan / Mortgage Application
                      </SelectItem>
                      <SelectItem value="Credit Card Application">
                        Credit Card Application
                      </SelectItem>
                      <SelectItem value="Visa / Embassy Travel Requirements">
                        Visa / Embassy Travel Requirements
                      </SelectItem>
                      <SelectItem value="Government Agency (SSS/PhilHealth/HDMF)">
                        Government Agency (SSS/PhilHealth/HDMF)
                      </SelectItem>
                      <SelectItem value="Personal File / Reference">
                        Personal File / Reference
                      </SelectItem>
                      <SelectItem value="School / Academic Requirement">
                        School / Academic Requirement
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Issuance Format Cards */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Issuance Format</Label>
                  <RadioGroup
                    value={deliveryFormat}
                    onValueChange={(val: any) => setDeliveryFormat(val)}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                  >
                    <Label
                      htmlFor="full-fmt-digital"
                      className={`flex flex-col gap-1 rounded-xl border p-3.5 cursor-pointer transition-all shadow-2xs ${
                        deliveryFormat === "digital"
                          ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary/40"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="digital" id="full-fmt-digital" className="sr-only" />
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-xs font-bold">Digital PDF (Fast)</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground pl-6">
                        QR-verified e-signature, released in 24 hrs.
                      </p>
                    </Label>

                    <Label
                      htmlFor="full-fmt-hardcopy"
                      className={`flex flex-col gap-1 rounded-xl border p-3.5 cursor-pointer transition-all shadow-2xs ${
                        deliveryFormat === "hardcopy"
                          ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary/40"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="hardcopy" id="full-fmt-hardcopy" className="sr-only" />
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        <span className="text-xs font-bold">Physical Hardcopy</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground pl-6">
                        With HR dry seal, pickup at HR office.
                      </p>
                    </Label>
                  </RadioGroup>
                </div>

                {/* Additional Remarks Textarea */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    Additional Remarks / Specific Addressee (Optional)
                  </Label>
                  <Textarea
                    rows={3}
                    placeholder="e.g., Please address to: The Visa Officer, Embassy of Japan..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </div>

                {/* Turnaround Time Banner */}
                <div className="rounded-lg bg-muted/40 border border-border/80 p-3 text-xs text-muted-foreground flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" /> Standard Turnaround Time:
                  </span>
                  <span className="font-bold text-foreground">1 to 2 Business Days</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <Button type="button" variant="outline" size="sm" onClick={handleReset} className="gap-1.5 text-xs">
                    <RotateCcw className="h-3.5 w-3.5" /> Clear Form
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={submitting}
                    className="gap-1.5 bg-primary text-primary-foreground font-semibold text-xs shadow-xs"
                  >
                    <Send className="h-3.5 w-3.5" /> {submitting ? "Submitting..." : "Submit Request"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Issuance Guidelines & Verification Details (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Certificate Features Card */}
          <Card className="border-border/70 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base font-semibold flex items-center gap-2">
                <QrCode className="h-4 w-4 text-primary" />
                Certificate Security &amp; Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>QR-Code Authenticity:</strong> All digital documents contain a cryptographic QR code for instant third-party verification.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Official Embossed Seal:</strong> Hardcopy documents include an official dry seal and authorized signatory.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Embassy &amp; Bank Compliant:</strong> Formatted in accordance with standard financial and diplomatic visa requirements.
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Request Policies Card */}
          <Card className="border-border/70 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base font-semibold flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                Issuance Policy &amp; Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs text-muted-foreground">
              <div className="rounded-lg border border-border/80 p-3 bg-muted/20 space-y-1">
                <p className="font-semibold text-foreground">Turnaround Period</p>
                <p>Digital requests are processed within 24 hours. Physical hardcopies take 1–2 business days.</p>
              </div>

              <div className="rounded-lg border border-border/80 p-3 bg-muted/20 space-y-1">
                <p className="font-semibold text-foreground">Document Pickup Location</p>
                <p>Human Resources Department, 4th Floor Administration Suite, Oxford Suites Makati.</p>
              </div>

              <div className="rounded-lg border border-border/80 p-3 bg-muted/20 space-y-1">
                <p className="font-semibold text-foreground">Free Issuance</p>
                <p>Standard certificates and annual BIR 2316 copies are issued at zero cost to all active employees.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
