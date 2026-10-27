import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Lock, ShieldCheck, Timer } from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Preloader } from "@/components/ui/preloader";
import { cn } from "@/lib/utils";

import { authApi, mfaApi } from "@/lib/api";
import { useLightOnly } from "@/lib/theme";
import { setToken, setUser } from "@/lib/auth";
import { clearLoginContext, getLoginContext, persistLoginContext } from "./login";

export const Route = createFileRoute("/_login/otp")({
  head: () => ({
    meta: [
      { title: "OTP Verification — Oxford Suites Makati HRMS" },
      {
        name: "description",
        content:
          "Enter your one-time password to complete sign-in to the Oxford Suites Makati HRMS portal.",
      },
    ],
  }),
  component: OTPPage,
});

const OTP_LENGTH = 6;

const maskEmail = (email?: string) => {
  if (!email) return "";
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  if (name.length <= 2)
    return `${name[0] ?? "*"}${"*".repeat(Math.max(1, name.length - 1))}@${domain}`;
  return `${name[0]}${"*".repeat(name.length - 2)}${name[name.length - 1]}@${domain}`;
};

function OTPPage() {
  useLightOnly();
  const navigate = useNavigate();
  const loginCtx = getLoginContext();
  const isTotp = loginCtx?.mfa_method === "totp";

  const [digits, setDigits] = useState<string[]>(() =>
    Array.from({ length: OTP_LENGTH }, () => ""),
  );
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);
  const [redirectTarget, setRedirectTarget] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // True server TTL (120s) — resend unlocks after a 30s anti-spam cooldown.
  const [timeLeft, setTimeLeft] = useState(() => getLoginContext()?.expires_in ?? 120);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const otpTtl = loginCtx?.expires_in ?? 120;

  useEffect(() => {
    if (!getLoginContext()) {
      toast.error("Please sign in to continue.");
      navigate({ to: "/login" });
    }
  }, [navigate]);

  // Countdown timer — resend unlocks 30s after issue; expiry matches the server TTL.
  useEffect(() => {
    if (timeLeft <= otpTtl - 30) {
      setResendDisabled(false);
    }
    if (timeLeft <= 0) {
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, otpTtl]);

  const handleChange = (idx: number, val: string) => {
    const char = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[idx] = char;
    setDigits(next);
    setError("");
    if (char && idx < OTP_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = [...digits];
    pasted.split("").forEach((c, i) => {
      next[i] = c;
    });
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
    e.preventDefault();
  };

  const finishSignIn = (res: { token: string; user: any }) => {
    setToken(res.token);
    setUser(res.user);
    clearLoginContext();
    const target =
      res.user.role === "Super Admin"
        ? "/superadmin"
        : res.user.role === "Admin"
          ? "/admin"
          : "/employee";
    setRedirectTarget(target);
    setVerified(true);
    toast.success("Identity verified — signing you in…");
  };

  const handleVerify = async () => {
    const code = digits.join("");
    if (code.length < OTP_LENGTH) {
      setError(
        isTotp
          ? "Please enter the 6-digit code from your authenticator app."
          : "Please enter the complete 6-digit OTP.",
      );
      const firstEmptyIndex = digits.findIndex((d) => !d);
      if (firstEmptyIndex !== -1) {
        inputRefs.current[firstEmptyIndex]?.focus();
      }
      return;
    }
    const ctx = getLoginContext();
    if (!ctx) {
      setError("Your login session has expired. Please sign in again.");
      navigate({ to: "/login" });
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      if (ctx.mfa_method === "totp") {
        finishSignIn(await mfaApi.verify(ctx.login_token, code));
      } else {
        finishSignIn(await authApi.verifyOtp(ctx.login_token, code));
      }
    } catch (err: any) {
      setError(err?.message || "Invalid or expired code.");
      setDigits(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecovery = async () => {
    const ctx = getLoginContext();
    if (!ctx) {
      setError("Your login session has expired. Please sign in again.");
      navigate({ to: "/login" });
      return;
    }
    if (recoveryCode.trim().length < 4) {
      setError("Enter one of your recovery codes (e.g. XXXX-XXXX).");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await mfaApi.recover(ctx.login_token, recoveryCode.trim());
      if (typeof res.recovery_codes_remaining === "number" && res.recovery_codes_remaining <= 2) {
        toast.warning(
          `Only ${res.recovery_codes_remaining} recovery code(s) left — generate new ones in Settings → Security.`,
        );
      }
      finishSignIn(res);
    } catch (err: any) {
      setError(err?.message || "Invalid recovery code.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    const ctx = getLoginContext();
    if (!ctx || ctx.mfa_method === "totp") return;
    setSubmitting(true);
    try {
      const res = await authApi.resendOtp(ctx.login_token);
      persistLoginContext({
        login_token: ctx.login_token,
        email: ctx.email,
        expires_in: res.expires_in,
        ...(ctx.mfa_method ? { mfa_method: ctx.mfa_method } : {}),
      });
      setDigits(Array.from({ length: OTP_LENGTH }, () => ""));
      setTimeLeft(res.expires_in);
      setResendDisabled(true);
      setError("");
      toast("A new OTP has been sent to your work email.");
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err?.message || "Unable to resend OTP. Please sign in again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-x-hidden bg-[#faf8f5] px-5 pt-28 pb-12 sm:px-10 sm:pt-32 lg:pt-12">
      {/* Ambient background decoration */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />

      {/* Workspace preloader with maroon background shown once verified */}
      {verified && redirectTarget && (
        <Preloader onComplete={() => navigate({ to: redirectTarget })} />
      )}

      {/* Brand lockup imitating Sign In's position & sizing:
          Top-left corner, responsive scale (scale-125 on mobile, scale-150 on sm, scale-170 on lg) */}
      <Link
        to="/"
        aria-label="Oxford Suites Makati — home"
        className="absolute left-6 top-6 z-20 origin-left scale-125 drop-shadow-sm transition-transform hover:scale-[1.28] sm:left-8 sm:top-8 sm:scale-150 sm:hover:scale-[1.53] lg:left-12 lg:top-10 lg:scale-170 lg:hover:scale-[1.73]"
      >
        <Logo mark="maroon" tone="primary" />
      </Link>

      {/* Form Container (Clean & Frameless without card border or white background) */}
      <div className="relative z-10 w-full max-w-md">
        {/* Header Icon */}
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-xs">
          <ShieldCheck className="h-6 w-6" />
        </div>

        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
          Security Verification
        </p>
        <h2 className="mt-1.5 text-center font-display text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
          {isTotp ? "Authenticator Code" : "OTP Verification"}
        </h2>
        <p className="mt-2 text-center text-sm leading-relaxed text-muted-foreground">
          {isTotp ? (
            <>
              Open your authenticator app and enter the 6-digit code for{" "}
              <span className="font-medium text-foreground">
                {maskEmail(loginCtx?.email)}
              </span>.
            </>
          ) : (
            <>
              We've sent a 6-digit code to{" "}
              <span className="font-medium text-foreground">
                {maskEmail(loginCtx?.email)}
              </span>.
              <br />
              Enter it below to continue.
            </>
          )}
        </p>

        {import.meta.env.DEV && loginCtx?.debug_otp && (
          <div
            className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-md text-center"
            title="Click to copy"
          >
            <div className="font-medium text-primary text-xs">Dev debug OTP:</div>
            <div className="mt-1 font-mono text-lg font-semibold text-primary">
              {loginCtx.debug_otp}
            </div>
            <div className="text-xs text-primary/80 mt-1">
              Copy to auto-fill or enter manually
            </div>
          </div>
        )}

        {isTotp && recoveryMode ? (
          <form
            className="mt-7 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleRecovery();
            }}
          >
            <p className="text-center text-xs text-muted-foreground">
              Lost your phone? Enter one of your recovery codes (each works once).
            </p>
            <input
              type="text"
              value={recoveryCode}
              onChange={(e) => {
                setRecoveryCode(e.target.value);
                setError("");
              }}
              placeholder="XXXX-XXXX"
              autoComplete="one-time-code"
              className="h-12 w-full rounded-md border border-stone-300/80 bg-white/80 text-center font-mono text-lg font-semibold tracking-widest outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/25"
            />
            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-center text-xs text-destructive">
                {error}
              </p>
            )}
            <Button
              type="submit"
              size="lg"
              className="w-full cursor-pointer font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.99]"
              disabled={submitting || recoveryCode.trim().length < 4}
            >
              {submitting ? "Verifying…" : "Sign in with recovery code"}
            </Button>
            <button
              type="button"
              onClick={() => {
                setRecoveryMode(false);
                setError("");
              }}
              className="w-full text-center text-sm font-medium text-primary hover:underline cursor-pointer"
            >
              Back to authenticator code
            </button>
          </form>
        ) : (
          <form
            className="mt-7"
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify();
            }}
          >
            {/* OTP input boxes */}
            <div
              className="flex justify-center gap-2 sm:gap-2.5"
              role="group"
              aria-label="One-time password input"
            >
              {digits.map((d, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  id={`otp-digit-${idx + 1}`}
                  aria-label={`OTP digit ${idx + 1}`}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={handlePaste}
                  className={cn(
                    "h-12 min-w-0 flex-1 max-w-10 sm:h-14 sm:max-w-12 rounded-lg border text-center text-lg font-semibold transition-all outline-none",
                    "border-stone-300/80 bg-white/80 text-foreground shadow-2xs",
                    "focus:border-primary focus:ring-2 focus:ring-primary/25 focus:bg-white",
                    d ? "border-primary/50 bg-primary/5" : "",
                    error ? "border-destructive" : "",
                  )}
                />
              ))}
            </div>

            {/* Error display */}
            {error && (
              <p className="mt-3 rounded-md bg-destructive/10 px-3 py-2 text-center text-xs text-destructive">
                {error}
              </p>
            )}

            {/* Timer / resend for email OTP */}
            {!isTotp && (
              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Timer className="h-3.5 w-3.5" />
                {timeLeft > 0 ? (
                  <span>
                    Code expires in {Math.floor(timeLeft / 60)}:
                    {String(timeLeft % 60).padStart(2, "0")}
                    {!resendDisabled && (
                      <>
                        {" · "}
                        <button
                          type="button"
                          onClick={handleResend}
                          className="font-medium text-primary hover:underline cursor-pointer"
                        >
                          Resend OTP
                        </button>
                      </>
                    )}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="font-medium text-primary hover:underline cursor-pointer"
                  >
                    Code expired — send a new one
                  </button>
                )}
              </div>
            )}

            {/* Verify Button - matching Sign In CTA */}
            <Button
              type="submit"
              size="lg"
              className="mt-6 w-full cursor-pointer font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.99]"
              disabled={submitting}
              id="otp-verify-btn"
            >
              {submitting ? "Verifying…" : "Verify & Sign In"}
            </Button>

            {isTotp && (
              <p className="mt-3 text-center text-sm text-muted-foreground">
                Lost your phone?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setRecoveryMode(true);
                    setError("");
                  }}
                  className="font-medium text-primary hover:underline cursor-pointer"
                >
                  Use a recovery code
                </button>
              </p>
            )}
          </form>
        )}

        {/* Back to sign in link */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
