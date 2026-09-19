import { useEffect, useState } from "react";
import { CheckCircle2, Copy, KeyRound, RefreshCw, ShieldCheck, Smartphone } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mfaApi, type MfaStatus } from "@/lib/api";

/**
 * Authenticator-app MFA enrollment (Settings → Security).
 * Users choose emailed codes (default) or a TOTP app; Super Admins
 * are required to enroll (soft-mandatory banner lives in PortalShell).
 */
export function MfaSettings() {
  const [status, setStatus] = useState<MfaStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [qrSvg, setQrSvg] = useState("");
  const [manualKey, setManualKey] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [savedAck, setSavedAck] = useState(false);
  const [disabling, setDisabling] = useState(false);

  const load = async () => {
    try {
      setStatus(await mfaApi.status());
    } catch {
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startEnroll = async () => {
    setEnrolling(true);
    setRecoveryCodes(null);
    setSavedAck(false);
    try {
      const res = await mfaApi.setup();
      setQrSvg(res.qr_svg);
      setManualKey(res.manual_key);
    } catch (e: any) {
      toast.error(e?.message || "Could not start enrollment.");
      setEnrolling(false);
    }
  };

  const confirmEnroll = async () => {
    if (code.replace(/\D/g, "").length < 6) {
      toast.error("Enter the 6-digit code from your authenticator app.");
      return;
    }
    if (!password) {
      toast.error("Enter your current password to confirm.");
      return;
    }
    setConfirming(true);
    try {
      const res = await mfaApi.confirm(code.replace(/\D/g, ""), password);
      setRecoveryCodes(res.recovery_codes);
      setCode("");
      setPassword("");
      toast.success("Authenticator app enabled.");
      load();
    } catch (e: any) {
      toast.error(e?.message || "Could not confirm. Check the code and try again.");
    } finally {
      setConfirming(false);
    }
  };

  const finishEnroll = () => {
    setEnrolling(false);
    setRecoveryCodes(null);
    setQrSvg("");
    setManualKey("");
    setSavedAck(false);
    load();
  };

  const copyKey = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied.`);
    } catch {
      toast.error("Copy failed — select the text manually.");
    }
  };

  const disable = async () => {
    if (!password) {
      toast.error("Enter your current password to confirm.");
      return;
    }
    setDisabling(true);
    try {
      const res = await mfaApi.disable(password, code.replace(/\D/g, "") || undefined);
      toast.success(res.message);
      setPassword("");
      setCode("");
      load();
    } catch (e: any) {
      toast.error(e?.message || "Could not disable authenticator MFA.");
    } finally {
      setDisabling(false);
    }
  };

  const regenerate = async () => {
    if (!password) {
      toast.error("Enter your current password to confirm.");
      return;
    }
    try {
      const res = await mfaApi.regenerateCodes(password);
      setRecoveryCodes(res.recovery_codes);
      setSavedAck(false);
      setPassword("");
      toast.success(res.message);
      load();
    } catch (e: any) {
      toast.error(e?.message || "Could not regenerate codes.");
    }
  };

  if (loading) {
    return (
      <div className="rounded-md border border-border/70 bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">
        Loading sign-in security…
      </div>
    );
  }

  const usingTotp = status?.mfa_method === "totp" && status?.totp_confirmed;

  return (
    <div className="rounded-md border border-border/70 bg-muted/30 px-3 py-2.5">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-medium">
            <Smartphone className="h-4 w-4 text-primary" />
            Authenticator app
            {usingTotp ? (
              <Badge variant="outline" className="border-success/40 bg-success/10 text-[10px] text-success">
                Enabled
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] text-muted-foreground">
                Email codes
              </Badge>
            )}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {usingTotp
              ? `You sign in with a 30-second app code. ${status?.recovery_codes_remaining ?? 0} recovery code(s) left.`
              : "Use Google/Microsoft Authenticator instead of emailed codes — works offline, more secure."}
          </p>
          {status?.totp_required && !usingTotp && (
            <p className="mt-1 text-xs font-medium text-gold">
              Required for Super Admins — please enroll below.
            </p>
          )}
        </div>
        {!enrolling && !usingTotp && (
          <Button size="sm" variant="outline" className="h-8 shrink-0 text-xs" onClick={startEnroll}>
            <KeyRound className="mr-1.5 h-3.5 w-3.5" /> Enable
          </Button>
        )}
      </div>

      {/* Enrollment wizard */}
      {enrolling && !recoveryCodes && (
        <div className="mt-3 space-y-3 rounded-md border border-primary/30 bg-card p-4">
          <ol className="space-y-3 text-xs text-muted-foreground">
            <li>
              <p className="font-semibold text-foreground">
                1. Scan with your authenticator app
              </p>
              {qrSvg ? (
                <div
                  className="mx-auto mt-2 w-fit rounded-md border border-border bg-white p-2"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
              ) : (
                <p className="mt-1">Preparing QR code…</p>
              )}
              {manualKey && (
                <button
                  type="button"
                  onClick={() => copyKey(manualKey.replace(/\s/g, ""), "Setup key")}
                  className="mt-2 flex w-full items-center justify-between gap-2 rounded-md bg-muted px-2.5 py-2 font-mono text-[11px] hover:bg-muted/70"
                  title="Copy setup key"
                >
                  <span className="truncate">{manualKey}</span>
                  <Copy className="h-3.5 w-3.5 shrink-0" />
                </button>
              )}
              <p className="mt-1">Can't scan? Enter the setup key manually in the app.</p>
            </li>
            <li className="space-y-1.5">
              <Label className="font-semibold text-foreground">
                2. Enter the 6-digit code from the app
              </Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
                inputMode="numeric"
                autoComplete="one-time-code"
                className="h-10 text-center font-mono text-lg tracking-[0.3em]"
              />
            </li>
            <li className="space-y-1.5">
              <Label className="font-semibold text-foreground">3. Confirm with your password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Current password"
                autoComplete="current-password"
              />
            </li>
          </ol>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1"
              disabled={confirming}
              onClick={confirmEnroll}
            >
              {confirming ? "Verifying…" : "Verify & enable"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEnrolling(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Recovery codes (shown once) */}
      {recoveryCodes && (
        <div className="mt-3 space-y-2 rounded-md border border-gold/40 bg-gold/10 p-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold">
            <ShieldCheck className="h-4 w-4 text-gold" />
            Save these recovery codes — each works once if you lose your phone
          </p>
          <div className="grid grid-cols-2 gap-1.5 font-mono text-xs">
            {recoveryCodes.map((c) => (
              <span key={c} className="rounded bg-card px-2 py-1.5 text-center">
                {c}
              </span>
            ))}
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() =>
              copyKey(recoveryCodes.join("\n"), "Recovery codes")
            }
          >
            <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy all codes
          </Button>
          <label className="flex cursor-pointer items-start gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={savedAck}
              onChange={(e) => setSavedAck(e.target.checked)}
              className="mt-0.5"
            />
            I saved these codes somewhere safe
          </label>
          <Button size="sm" className="w-full" disabled={!savedAck} onClick={finishEnroll}>
            <CheckCircle2 className="mr-1.5 h-4 w-4" /> Done
          </Button>
        </div>
      )}

      {/* Manage enrolled authenticator */}
      {usingTotp && !enrolling && (
        <div className="mt-3 space-y-2 rounded-md border border-border/60 bg-card p-3">
          <div className="space-y-1.5">
            <Label>Current password (required for changes)</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Current password"
              autoComplete="current-password"
              className="h-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" className="text-xs" onClick={regenerate}>
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> New recovery codes
            </Button>
            {!(status?.totp_required) && (
              <div className="flex flex-1 items-center gap-2">
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="App code"
                  inputMode="numeric"
                  className="h-8 font-mono text-xs"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 shrink-0 text-xs text-destructive hover:bg-destructive/10"
                  disabled={disabling}
                  onClick={disable}
                >
                  {disabling ? "Removing…" : "Remove"}
                </Button>
              </div>
            )}
          </div>
          {status?.totp_required && (
            <p className="text-[11px] text-muted-foreground">
              Removal is disabled — authenticator MFA is required for Super Admins.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
