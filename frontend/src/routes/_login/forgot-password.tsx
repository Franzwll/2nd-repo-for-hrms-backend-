import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Mail, Send } from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { authApi } from "@/lib/api";

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
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return setError("Enter a valid work email address.");

    setSubmitting(true);
    setError("");
    try {
      await authApi.forgotPassword(email.trim());
      setSent(true);
      toast.success("Password reset link sent.");
    } catch (err: any) {
      const message = err?.message || "Unable to send the reset link. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 py-12 sm:px-10">
      <div className="w-full max-w-md">
        <div className="mb-10 flex justify-center">
          <Link to="/" aria-label="Oxford Suites Makati">
            <Logo mark="maroon" />
          </Link>
        </div>

        {sent ? (
          <div className="rounded-2xl border border-gold/40 bg-[#faf6ef] p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold/20">
              <Send className="h-5 w-5 text-[#8a6d1f]" />
            </div>
            <h2 className="font-display text-2xl font-semibold">Check your inbox</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              If an active HRMS account matches that email, a password reset link has been sent. It
              expires in 60 minutes.
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
            <p className="eyebrow text-center">Staff Portal Access</p>
            <h2 className="mt-2 text-center font-display text-4xl font-semibold">
              Forgot password?
            </h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Enter your work email and we'll send you a secure link to set a new password.
            </p>
            <div className="gold-rule my-7" />

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label htmlFor="email">Work email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="pl-9"
                    autoComplete="username"
                  />
                </div>
              </div>

              {error && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {error}
                </p>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? "Sending…" : "Send reset link"}
              </Button>
            </form>
          </>
        )}

        <p className="mt-7 text-center text-sm text-muted-foreground">
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
