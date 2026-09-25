import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ScrollText } from "lucide-react";

import { PublicShell } from "@/components/public/PublicShell";
import { TERMS_SECTIONS } from "@/data/legal";

export const Route = createFileRoute("/_landing/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Oxford Suites Makati" },
      {
        name: "description",
        content: "Rules for using the Oxford Suites Makati staff portal.",
      },
      { property: "og:title", content: "Terms of Service — Oxford Suites Makati" },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-3xl px-4 py-14 md:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <p className="eyebrow mt-6">Terms of Service</p>
        <h1 className="mt-1 flex items-center gap-2 font-display text-4xl font-semibold md:text-5xl">
          <ScrollText className="h-8 w-8 text-gold" /> Portal rules
        </h1>
        <div className="gold-rule my-6" />
        <p className="text-base leading-relaxed text-muted-foreground">
          Rules for using the Oxford Suites Makati staff portal.
        </p>

        <div className="mt-8 space-y-6">
          {TERMS_SECTIONS.map((s) => (
            <section key={s.heading}>
              <h2 className="font-display text-2xl font-semibold">{s.heading}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </section>
          ))}
        </div>
      </div>
    </PublicShell>
  );
}
