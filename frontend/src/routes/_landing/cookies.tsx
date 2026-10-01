import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Cookie } from "lucide-react";
import { useState } from "react";

import { PublicShell } from "@/components/public/PublicShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { acknowledgeCookies, isCookieAcknowledged } from "@/data/legal";

export const Route = createFileRoute("/_landing/cookies")({
  head: () => ({
    meta: [
      { title: "Cookie Preferences — Oxford Suites Makati" },
      {
        name: "description",
        content:
          "What the Oxford Suites Makati staff portal stores on your device. No advertising trackers, ever.",
      },
      { property: "og:title", content: "Cookie Preferences — Oxford Suites Makati" },
    ],
  }),
  component: Cookies,
});

function Cookies() {
  const [acked, setAcked] = useState<boolean>(() => isCookieAcknowledged());

  const ack = () => {
    acknowledgeCookies();
    setAcked(true);
  };

  return (
    <PublicShell>
      <div className="mx-auto max-w-3xl px-4 py-14 md:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <p className="eyebrow mt-6">Cookie Preferences</p>
        <h1 className="mt-1 flex items-center gap-2 font-display text-4xl font-semibold md:text-5xl">
          <Cookie className="h-8 w-8 text-gold" /> What we store
        </h1>
        <div className="gold-rule my-6" />
        <p className="text-base leading-relaxed text-muted-foreground">
          What this portal stores on your device. No advertising trackers, ever.
        </p>

        <Card className="mt-8 border-border/70">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-semibold">
                  Strictly necessary — always on
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Sign-in token, login-step state, and UI preferences in your browser's local
                  storage, plus Cloudflare Turnstile's security check when you sign in or reset your
                  password.
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
                On
              </span>
            </div>
          </CardContent>
        </Card>

        <p className="mt-4 text-sm text-muted-foreground">
          Clearing your browser data signs you out — that's expected. There are no optional or
          marketing cookies to toggle.
        </p>

        <Button className="mt-6" onClick={ack} disabled={acked}>
          {acked && <CheckCircle2 className="mr-2 h-4 w-4" />}
          {acked ? "Preferences saved" : "Got it"}
        </Button>
      </div>
    </PublicShell>
  );
}
