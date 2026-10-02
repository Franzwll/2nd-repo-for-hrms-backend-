import { useState } from "react";
import { Download, FileText, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  describeExport,
  exportReport,
  type ReportData,
  type ReportFormat,
} from "@/lib/report-export";
import { SecureExportDialog } from "@/components/ui/secure-export-dialog";
import { cn } from "@/lib/utils";

const FORMATS: { id: ReportFormat; label: string }[] = [
  { id: "pdf", label: "PDF" },
  { id: "docx", label: "DOCX" },
  { id: "excel", label: "Excel" },
  { id: "csv", label: "CSV" },
];

/**
 * Standard "Generate Report" control for every module.
 *
 * Every format is password-protected: picking one asks for a file password,
 * then downloads an AES-256 encrypted ZIP containing the file.
 *
 * Always render it OUTSIDE data cards — in the PageHeader `actions` slot
 * (like Recruitment & Onboarding) or in a toolbar row above the card —
 * never inside a CardHeader next to filters.
 *
 *   <PageHeader … actions={<ReportMenu report={myReport} recordCount={rows.length} />} />
 */
export function ReportMenu({
  report,
  recordCount,
  label = "Generate Report",
  buttonClassName,
  size = "default",
}: {
  report: ReportData | (() => ReportData);
  recordCount?: number;
  label?: string;
  buttonClassName?: string;
  size?: "default" | "sm" | "icon";
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<{ data: ReportData; format: ReportFormat } | null>(null);

  const requestExport = (format: ReportFormat) => {
    const data = typeof report === "function" ? report() : report;
    if (data.rows.length === 0) {
      toast.error("No records to export for the current filters.");
      return;
    }
    setPending({ data, format });
    setDialogOpen(true);
  };

  const confirmExport = async (password: string) => {
    if (!pending) return;
    setBusy(true);
    try {
      await exportReport(pending.data, pending.format, { password });
      const { zipName } = describeExport(pending.data, pending.format);
      toast.success(
        `${pending.data.title} exported as password-protected ${pending.format.toUpperCase()} (${zipName})` +
          (recordCount !== undefined ? ` (${recordCount} records).` : "."),
      );
      setDialogOpen(false);
      setPending(null);
    } catch (e) {
      console.error("Protected export failed:", e);
      toast.error(e instanceof Error ? e.message : "Protected export failed.");
    } finally {
      setBusy(false);
    }
  };

  const pendingLabel = pending ? (FORMATS.find((f) => f.id === pending.format)?.label ?? "") : "";
  const pendingHint = pending ? describeExport(pending.data, pending.format).zipName : undefined;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size={size} className={cn("gap-2", buttonClassName)}>
            <Download className="h-4 w-4" /> {label}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          {FORMATS.map((format) => (
            <DropdownMenuItem key={format.id} onClick={() => requestExport(format.id)}>
              <FileText className="mr-2 h-4 w-4" />
              <span className="flex items-center gap-1.5">
                Export as {format.label} <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              </span>
            </DropdownMenuItem>
          ))}
          <p className="px-2 py-1.5 text-[11px] leading-snug text-muted-foreground">
            Every file is sealed in a password-protected ZIP (AES-256). You will be asked for a file
            password.
          </p>
        </DropdownMenuContent>
      </DropdownMenu>
      <SecureExportDialog
        open={dialogOpen}
        onOpenChange={(o) => {
          if (!busy) {
            setDialogOpen(o);
            if (!o) setPending(null);
          }
        }}
        reportTitle={pending?.data.title ?? "Report"}
        formatLabel={pendingLabel}
        fileHint={pendingHint}
        busy={busy}
        onConfirm={confirmExport}
      />
    </>
  );
}
