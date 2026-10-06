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
import { Award, Download, Printer, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { myProfile } from "@/data/ess";
import { getUser } from "@/lib/auth";
import { downloadCertificatePdf } from "@/lib/downloadCertificatePdf";

interface LmsCertificateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseTitle: string;
  category?: string;
  completedDate?: string;
  score?: string;
}

export function LmsCertificateModal({
  open,
  onOpenChange,
  courseTitle,
  category = "Hospitality & Compliance",
  completedDate = "Jul 10, 2026",
  score = "95%",
}: LmsCertificateModalProps) {
  const user = getUser();
  const recipientName = user?.full_name || myProfile.name;
  const recipientRole = user?.department_name ? `${user.department_name} Staff` : myProfile.position;
  const recipientDept = user?.department_name || myProfile.department;
  const [downloading, setDownloading] = useState(false);

  const handlePrint = () => {
    window.print();
    toast.success("Printing certificate...");
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const safeTitle = courseTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const filename = `Certificate-${safeTitle}.pdf`;
      await downloadCertificatePdf(filename, {
        companyName: "OXFORD SUITES MAKATI",
        recipientName: recipientName,
        recipientRole: recipientRole,
        recipientDepartment: recipientDept,
        courseTitle: courseTitle,
        category: category,
        completedDate: completedDate,
        score: score,
      });
      toast.success(`Certificate for "${courseTitle}" downloaded as PDF.`);
    } catch {
      toast.error("Failed to generate certificate PDF.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] print:p-0 print:border-none">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-amber-500/10 p-2 text-amber-600">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-display">Certificate of Completion</DialogTitle>
              <DialogDescription>Verified LMS Training Credential</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Certificate Frame */}
        <div className="rounded-xl border-4 border-double border-primary/40 bg-gradient-to-b from-card via-muted/30 to-card p-6 text-center shadow-sm space-y-4">
          <div className="flex items-center justify-center gap-2 text-primary font-display font-bold text-xs uppercase tracking-widest">
            <ShieldCheck className="h-4 w-4" /> Oxford Suites Makati · Learning &amp; Development
          </div>

          <div>
            <p className="text-xs uppercase text-muted-foreground font-medium">This is proudly presented to</p>
            <h3 className="text-2xl font-bold font-display text-foreground mt-1">{recipientName}</h3>
            <p className="text-xs text-muted-foreground">{recipientRole} · {recipientDept}</p>
          </div>

          <div className="py-2 border-y border-border/80">
            <p className="text-xs text-muted-foreground">For successfully completing the corporate training module</p>
            <p className="text-lg font-bold font-display text-primary mt-1">{courseTitle}</p>
            <div className="mt-2 flex items-center justify-center gap-3 text-xs">
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                Score: {score}
              </Badge>
              <span className="text-muted-foreground">Date: <strong>{completedDate}</strong></span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <div>
              <p className="font-semibold text-foreground">L&amp;D Director</p>
              <p>Oxford Suites PH</p>
            </div>
            <div className="flex flex-col items-center">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 mb-0.5" />
              <p className="font-mono text-[9px]">ID: LMS-VERIFIED-2026</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">HR Administration</p>
              <p>Corporate Compliance</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-between items-center border-t border-border pt-3">
          <p className="text-[11px] text-muted-foreground">Permanent record saved in employee file.</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 text-xs">
              <Printer className="h-3.5 w-3.5" /> Print
            </Button>
            <Button size="sm" onClick={handleDownload} disabled={downloading} className="gap-1.5 text-xs">
              {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              {downloading ? "Generating PDF..." : "Download PDF"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
