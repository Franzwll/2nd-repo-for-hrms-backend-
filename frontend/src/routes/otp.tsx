import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, ShieldCheck, Timer } from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/otp")({
  validateSearch: (search: Record<string, unknown>) => ({
    role: (search["role"] as string) ?? "/superadmin",
  }),
  head: () => ({
    meta: [
      { title: "OTP Verification — Oxford Suites Makati HRMS" },
      {
        name: "description",
        content: "Enter your one-time password to complete sign-in to the Oxford Suites Makati HRMS portal.",
      },
    ],
  }),
  component: OTPPage,
});

const OTP_LENGTH = 6;
// Demo OTP — always valid
const DEMO_OTP = "123456";

function OTPPage() {
  const navigate = useNavigate();
  const { role } = useSearch({ from: "/otp" });

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [resendDisabled, setResendDisabled] = useState(true);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setResendDisabled(false);
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft]);

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

  const handleVerify = () => {
    const code = digits.join("");
    if (code.length < OTP_LENGTH) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }
    if (code !== DEMO_OTP) {
      setError("Incorrect OTP. Try 123456 for the demo.");
      setDigits(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
      return;
    }
    setVerified(true);
    toast.success("Identity verified — signing you in…");
    setTimeout(() => navigate({ to: role as string }), 1200);
  };

  const handleResend = () => {
    setTimeLeft(60);
    setResendDisabled(true);
    setDigits(Array(OTP_LENGTH).fill(""));
    setError("");
    toast("A new OTP has been sent to your work email.");
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      {/* Logo */}
      <div className="mb-10">
        <Logo mark="maroon" />
      </div>

      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm">
        {verified ? (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/15">
              <CheckCircle2 className="h-7 w-7 text-success" />
            </div>
            <h2 className="font-display text-2xl font-semibold">Verified!</h2>
            <p className="text-sm text-muted-foreground">Redirecting you to the portal…</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <h1 className="font-display text-2xl font-semibold">OTP Verification</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                We've sent a 6-digit code to your registered work email. Enter it below to continue.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                (Demo: use{" "}
                <span className="font-mono font-semibold text-primary">123456</span>)
              </p>
            </div>

            {/* OTP boxes */}
            <div className="flex justify-center gap-2" role="group" aria-label="One-time password input">
              {digits.map((d, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputRefs.current[idx] = el; }}
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
                    "h-12 w-10 rounded-md border text-center text-lg font-semibold transition-all outline-none",
                    "border-border bg-muted/40 text-foreground",
                    "focus:border-primary focus:ring-2 focus:ring-primary/25",
                    d ? "border-primary/50 bg-primary/5" : "",
                    error ? "border-destructive" : "",
                  )}
                />
              ))}
            </div>

            {/* Error */}
            {error && (
              <p className="mt-3 text-center text-xs text-destructive">{error}</p>
            )}

            {/* Timer */}
            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Timer className="h-3.5 w-3.5" />
              {resendDisabled ? (
                <span>Resend in {timeLeft}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="font-medium text-primary hover:underline"
                >
                  Resend OTP
                </button>
              )}
            </div>

            {/* Verify button */}
            <Button
              className="mt-6 w-full"
              size="lg"
              onClick={handleVerify}
              disabled={digits.join("").length < OTP_LENGTH}
              id="otp-verify-btn"
            >
              Verify &amp; Sign In
            </Button>

            {/* Back link */}
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Wrong account?{" "}
              <button
                type="button"
                onClick={() => navigate({ to: "/login" })}
                className="font-medium text-primary hover:underline"
              >
                Go back
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
