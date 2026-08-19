import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, KeyRound, Lock } from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { authApi } from "@/lib/api";

export const Route = createFileRoute("/_login/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  head: () => ({
    meta: [
      { title: "Set a New Password — Oxford Suites Makati HRMS" },
      {
        name: "description",
        content: "Choose a new password for your Oxford Suites Makati HRMS account.",
      },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token } = Route.useSearch();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");

    setError("");
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
      toast.success("Password updated. You can now sign in.");
    } catch (err: any) {
      const message = err?.message || "Unable to reset your password. Please try again.";
      setError(message);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-5 py-12">
        <div className="w-full max-w-md text-center">
          <p className="eyebrow">Password Reset</p>
          <h2 className="mt-2 font-display text-3xl font-semibold">Link is missing</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            This reset link is incomplete. Please request a new one.
          </p>
          <Link
            to="/forgot-password"
            className="mt-6 inline-block text-sm font-medium text-primary hover:underline"
          >
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 py-12 sm:px-10">
      <div className="w-full max-w-md">
        <div className="mb-10 flex justify-center">
          <Link to="/" aria-label="Oxford Suites Makati">
            <Logo mark="maroon" />
          </Link>
        </div>

        {done ? (
          <div className="rounded-2xl border border-gold/40 bg-[#faf6ef] p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="font-display text-2xl font-semibold">Password updated</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Your password has been reset. Sign in with your new password to continue.
            </p>
            <Button size="lg" className="mt-6 w-full" onClick={() => navigate({ to: "/login" })}>
              Go to sign in
            </Button>
          </div>
        ) : (
          <>
            <p className="eyebrow text-center">Staff Portal Access</p>
            <h2 className="mt-2 text-center font-display text-4xl font-semibold">
              Set a new password
            </h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Choose a new password for your account. Use at least 8 characters.
            </p>
            <div className="gold-rule my-7" />

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label htmlFor="password">New password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="pl-9"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm">Re-enter new password</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirm"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Re-enter your new password"
                    className="pl-9"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {error && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {error}
                </p>
              )}

              <Button type="submit" size="lg" className="w-full">
                Update password
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
