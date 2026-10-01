import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { PublicShell } from "@/components/public/PublicShell";
import { HR_EMAIL, PRIVACY_SECTIONS } from "@/data/legal";

export const Route = createFileRoute("/_landing/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Notice — Oxford Suites Makati" },
      {
        name: "description",
        content:
          "How Oxford Suites Makati handles your personal data in the HRMS, in line with the Data Privacy Act of 2012 (RA 10173).",
      },
      { property: "og:title", content: "Privacy Notice — Oxford Suites Makati" },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-3xl px-4 py-14 md:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <p className="eyebrow mt-6">Privacy Notice</p>
        <h1 className="mt-1 flex items-center gap-2 font-display text-4xl font-semibold md:text-5xl">
          <ShieldCheck className="h-8 w-8 text-gold" /> Your data, protected
        </h1>
        <div className="gold-rule my-6" />
        <p className="text-base leading-relaxed text-muted-foreground">
          How Oxford Suites Makati handles your personal data in this HRMS, in line with the Data
          Privacy Act of 2012 (RA 10173).
        </p>

        <div className="mt-8 space-y-6">
          {PRIVACY_SECTIONS.map((s) => (
            <section key={s.heading}>
              <h2 className="font-display text-2xl font-semibold">{s.heading}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </section>
          ))}
          <section>
            <h2 className="font-display text-2xl font-semibold">Questions</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Contact us at <span className="font-medium text-foreground">{HR_EMAIL}</span>.
            </p>
          </section>
        </div>
      </div>
    </PublicShell>
  );
}
