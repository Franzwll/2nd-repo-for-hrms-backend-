import { useEffect, useState } from "react";
import { Eye, EyeOff, FileArchive, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MIN_PASSWORD_LENGTH = 4;

/**
 * Password gate for every protected report export (PDF, DOCX, Excel, CSV).
 *
 * Plain report files cannot carry a password natively, so each file is sealed
 * inside an AES-256 encrypted ZIP. This dialog collects the file password
 * (asked on every export, never stored) and hands it to the caller, which then
 * calls `exportReport(data, format, { password })`.
 */
export function SecureExportDialog({
  open,
  onOpenChange,
  reportTitle,
  formatLabel,
  fileHint,
  busy,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportTitle: string;
  formatLabel: string;
  fileHint?: string | undefined;
  busy?: boolean | undefined;
  onConfirm: (password: string) => void | Promise<void>;
}) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setPassword("");
      setConfirm("");
      setShowPw(false);
      setShowConfirm(false);
      setError(null);
    }
  }, [open]);

  const submit = async () => {
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match. Re-type the confirmation.");
      return;
    }
    setError(null);
    await onConfirm(password);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <Lock className="h-5 w-5 text-primary" /> Protect {formatLabel} export
          </DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">{reportTitle}</span> will be exported as a
            password-protected ZIP containing the {formatLabel} file
            {fileHint ? (
              <>
                {" "}
                (<span className="font-mono">{fileHint}</span>)
              </>
            ) : null}
            . Enter a file password — it will be required to open the ZIP.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
            <p className="flex items-center gap-1.5 font-medium text-foreground">
              <FileArchive className="h-3.5 w-3.5" /> AES-256 encrypted ZIP · {formatLabel} inside
            </p>
            <p className="mt-1">
              A plain {formatLabel} file cannot carry a password, so it is sealed in an encrypted
              ZIP. Share the password with the recipient through a separate channel. The password is
              asked on every export and is never stored.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="secure-export-password">File password</Label>
            <div className="relative">
              <Input
                id="secure-export-password"
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                placeholder={`Minimum ${MIN_PASSWORD_LENGTH} characters`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void submit();
                }}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="secure-export-confirm">Confirm password</Label>
            <div className="relative">
              <Input
                id="secure-export-confirm"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Re-type the file password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void submit();
                }}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? "Hide confirmation" : "Show confirmation"}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {error && <p className="text-xs font-medium text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={() => void submit()} disabled={busy}>
            {busy ? "Encrypting…" : `Export protected ${formatLabel}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
