import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, KeyRound, Lock, Mail, Send } from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import { Turnstile, TURNSTILE_SITE_KEY } from "@/components/ui/turnstile";

import { authApi } from "@/lib/api";
import { useLightOnly } from "@/lib/theme";

export const Route = createFileRoute("/_login/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password — Oxford Suites Makati HRMS" },
      {
        name: "description",
        content: "Request a password reset link for your Oxford Suites Makati HRMS account.",
      },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  useLightOnly();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return setError("Enter a valid work email address.");
    if (TURNSTILE_SITE_KEY && !captchaToken) {
      return setError("Please complete the security check first.");
    }

    setSubmitting(true);
    setError("");
    try {
      await authApi.forgotPassword(email.trim(), captchaToken || undefined);
      setSent(true);
      toast.success("Password reset link sent.");
    } catch (err: any) {
      const message = err?.message || "Unable to send the reset link. Please try again.";
      setError(message);
      setCaptchaToken("");
      setCaptchaReset((n) => n + 1);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-x-hidden bg-[#faf8f5] px-5 pt-28 pb-12 sm:px-10 sm:pt-32 lg:pt-12">
      {/* Ambient background decoration */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />

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
        {sent ? (
          <div className="rounded-2xl border border-gold/40 bg-white/70 backdrop-blur-xs p-8 text-center shadow-xs">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/20 shadow-xs">
              <Send className="h-6 w-6 text-[#8a6d1f]" />
            </div>
            <h2 className="font-display text-2xl font-semibold">Check your inbox</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              A password reset link has been sent to{" "}
              <span className="font-medium text-foreground">{email.trim()}</span>. It expires in 60 minutes.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Didn't receive it? Check your spam folder, or try again after a minute.
            </p>
            <Button variant="outline" className="mt-6 w-full" onClick={() => setSent(false)}>
              Send another link
            </Button>
          </div>
        ) : (
          <>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-xs">
              <KeyRound className="h-6 w-6" />
            </div>

            <p className="text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
              Password Recovery
            </p>
            <h2 className="mt-1.5 text-center font-display text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
              Forgot password?
            </h2>
            <p className="mt-2 text-center text-sm leading-relaxed text-muted-foreground">
              Enter your work email and we'll send you a secure link to set a new password.
            </p>

            <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <FloatingInput
                  id="email"
                  type="email"
                  label="Work email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="h-4 w-4" />}
                  autoComplete="username"
                  className="bg-white/80"
                />
              </div>

              {error && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-center text-xs text-destructive">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full cursor-pointer font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.99]"
                disabled={submitting}
              >
                {submitting ? "Sending…" : "Send reset link"}
              </Button>

              <div className="flex justify-center">
                <Turnstile
                  onVerify={setCaptchaToken}
                  onExpire={() => setCaptchaToken("")}
                  resetKey={captchaReset}
                />
              </div>
            </form>
          </>
        )}

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
