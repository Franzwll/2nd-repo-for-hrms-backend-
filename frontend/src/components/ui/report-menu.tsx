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
  exportReport,
  printReport,
  type ReportData,
  type ReportFormat,
} from "@/lib/report-export";
import { cn } from "@/lib/utils";

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
            This report contains sensitive data. Re-enter your password to
            export or print it. The attempt is logged.
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
 * Always render it OUTSIDE data cards — in the PageHeader `actions` slot
 * (like Recruitment & Onboarding) or in a toolbar row above the card —
 * never inside a CardHeader next to filters.
 *
 *   <PageHeader … actions={<ReportMenu report={myReport} recordCount={rows.length} />} />
 *
 * Confidential reports (`report.sensitive === true`) require the user to
 * re-enter their password before exporting or printing.
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
  const { gateSensitive, gateDialog } = usePasswordGate();

  const resolveData = (): ReportData =>
    typeof report === "function" ? report() : report;

  const execute = (action: { kind: "export"; format: ReportFormat } | { kind: "print" }) => {
    const data = resolveData();
    if (action.kind === "print") {
      printReport(data);
      toast.success(`${data.title} sent to printer.`);
      return;
    }
    exportReport(data, action.format);
    toast.success(
      `${data.title} exported as ${action.format.toUpperCase()}` +
        (recordCount !== undefined ? ` (${recordCount} records).` : "."),
    );
  };

  const request = (action: { kind: "export"; format: ReportFormat } | { kind: "print" }) => {
    gateSensitive(resolveData(), () => execute(action));
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size={size} className={cn("gap-2", buttonClassName)}>
            <Download className="h-4 w-4" /> {label}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {(["pdf", "docx", "excel", "csv"] as ReportFormat[]).map((format) => (
            <DropdownMenuItem key={format} onClick={() => request({ kind: "export", format })}>
              <FileText className="mr-2 h-4 w-4" /> Export as {format.toUpperCase()}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => request({ kind: "print" })}>
            <Printer className="mr-2 h-4 w-4" /> Print…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {gateDialog}
    </>
  );
}
