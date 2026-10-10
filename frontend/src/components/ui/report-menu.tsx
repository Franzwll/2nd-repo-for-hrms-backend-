import { useState } from "react";
import { Download, FileText, Lock, Printer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api";
import {
  describeExport,
  exportReport,
  printReport,
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
 * Reusable password gate for confidential exports outside ReportMenu.
 *
 *   const { gateSensitive, gateDialog } = usePasswordGate();
 *   gateSensitive(reportLike, () => exportReport({ ...reportLike, sensitive: true }, format));
 *   ...
 *   {gateDialog}
 */
export function usePasswordGate() {
  const [pwOpen, setPwOpen] = useState(false);
  const [action, setAction] = useState<(() => void) | null>(null);
  const [password, setPassword] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [pwError, setPwError] = useState("");

  const gateSensitive = (report: { sensitive?: boolean }, run: () => void) => {
    if (!report.sensitive) {
      run();
      return;
    }
    setAction(() => run);
    setPassword("");
    setPwError("");
    setPwOpen(true);
  };

  const confirmPassword = async () => {
    if (!password) {
      setPwError("Enter your password to continue.");
      return;
    }
    setPwBusy(true);
    setPwError("");
    try {
      await authApi.confirmPassword(password);
      const run = action;
      setPwOpen(false);
      setAction(null);
      setPassword("");
      run?.();
    } catch {
      setPwError("Incorrect password. Export blocked.");
    } finally {
      setPwBusy(false);
    }
  };

  const gateDialog = (
    <Dialog open={pwOpen} onOpenChange={(o) => !o && setPwOpen(false)}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" /> Confidential report
          </DialogTitle>
          <DialogDescription>
            This report contains sensitive data. Re-enter your password to export or print it. The
            attempt is logged.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="report-pw">Password</Label>
          <Input
            id="report-pw"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") confirmPassword();
            }}
            placeholder="••••••••"
            autoComplete="current-password"
          />
          {pwError && <p className="text-xs text-destructive">{pwError}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setPwOpen(false)}>
            Cancel
          </Button>
          <Button onClick={confirmPassword} disabled={pwBusy}>
            {pwBusy ? "Verifying…" : "Confirm & continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return { gateSensitive, gateDialog };
}

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
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              const data = typeof report === "function" ? report() : report;
              printReport(data);
              toast.success(`${data.title} sent to printer.`);
            }}
          >
            <Printer className="mr-2 h-4 w-4" /> Print…
          </DropdownMenuItem>
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

/**
 * Current-view ReportMenu alias — EXACT same flat menu as "Export org chart"
 * (Export as PDF / DOCX / Excel / CSV + Print…). Kept as a named alias so
 * Generate Report headers read clearly; the report is built live from what
 * the user is currently viewing (active tab + filters).
 *
 *   <MultiReportMenu
 *     size="sm"
 *     recordCount={rows.length}
 *     report={() => buildCurrentViewReport()}
 *   />
 */
export function MultiReportMenu({
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
      toast.error(`No records to export for ${data.title}.`);
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
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              const data = typeof report === "function" ? report() : report;
              printReport(data);
              toast.success(`${data.title} sent to printer.`);
            }}
          >
            <Printer className="mr-2 h-4 w-4" /> Print…
          </DropdownMenuItem>
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
