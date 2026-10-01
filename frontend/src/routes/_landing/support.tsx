import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, LifeBuoy } from "lucide-react";

import { PublicShell } from "@/components/public/PublicShell";
import { Card, CardContent } from "@/components/ui/card";
import { HR_EMAIL, HR_PHONE } from "@/data/legal";

export const Route = createFileRoute("/_landing/support")({
  head: () => ({
    meta: [
      { title: "Support — Oxford Suites Makati" },
      {
        name: "description",
        content:
          "Locked out or seeing an error? Contact the Oxford Suites Makati HR office for help with the staff portal.",
      },
      { property: "og:title", content: "Support — Oxford Suites Makati" },
    ],
  }),
  component: Support,
});

function Support() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-3xl px-4 py-14 md:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <p className="eyebrow mt-6">Support</p>
        <h1 className="mt-1 flex items-center gap-2 font-display text-4xl font-semibold md:text-5xl">
          <LifeBuoy className="h-8 w-8 text-gold" /> How can we help?
        </h1>
        <div className="gold-rule my-6" />
        <p className="text-base leading-relaxed text-muted-foreground">
          Locked out or seeing an error? Contact the HR office — include your employee ID and a
          screenshot if you can.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <h2 className="font-display text-xl font-semibold">HR helpdesk</h2>
              <a
                href={`mailto:${HR_EMAIL}`}
                className="mt-2 block font-medium text-primary hover:underline"
              >
                {HR_EMAIL}
              </a>
              <p className="mt-2 text-sm text-muted-foreground">
                For account issues, record corrections, and portal errors.
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/70">
            <CardContent className="p-6">
              <h2 className="font-display text-xl font-semibold">24-hour front desk</h2>
              <a
                href={`tel:${HR_PHONE.replace(/\s/g, "")}`}
                className="mt-2 block font-medium text-primary hover:underline"
              >
                {HR_PHONE}
              </a>
              <p className="mt-2 text-sm text-muted-foreground">
                For urgent access issues outside office hours.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 border-border/70">
          <CardContent className="p-6">
            <h2 className="font-display text-xl font-semibold">Forgot your password?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Use “Forgot password?” on the{" "}
              <Link to="/login" className="font-medium text-primary hover:underline">
                sign-in form
              </Link>{" "}
              — the reset link expires in 60 minutes.
            </p>
          </CardContent>
        </Card>
      </div>
    </PublicShell>
  );
}
