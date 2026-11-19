import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useState } from "react";
import { Mail, MapPin, Menu, Phone, X } from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { Chatbot } from "@/components/public/Chatbot";
import { Button } from "@/components/ui/button";
import { useCompany } from "@/lib/landing";
import { useLightOnly } from "@/lib/theme";

const links = [
  { label: "Home", to: "/" },
  { label: "Find Jobs", to: "/jobs" },
  { label: "About Us", to: "/about" },
  { label: "FAQ", to: "/faq" },
  { label: "Contact", to: "/contact" },
];

const legalLinks = [
  { label: "Support", to: "/support" },
  { label: "Privacy Notice", to: "/privacy" },
  { label: "Terms of Service", to: "/terms" },
  { label: "Cookie Preferences", to: "/cookies" },
];

export function PublicShell({ children, bare = false }: { children: ReactNode; bare?: boolean }) {
  const { company } = useCompany();
  // Public pages are always light. (Previously this called applyInitialTheme()
  // in a passive effect, which ran AFTER each page's useLightOnly layout
  // effect and re-applied the stored/OS dark theme — black nav/sections and
  // a washed-out hero whenever the OS or stored preference was dark.)
  useLightOnly();
  const [menuOpen, setMenuOpen] = useState(false);

  // Bare mode: logo + content only (e.g. assessment test link).
  // Hides nav links, Login, footer, and chatbot.
  if (bare) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <header className="border-b border-border bg-background/90 backdrop-blur">
          <div className="mx-auto flex h-18 max-w-7xl items-center justify-center px-4 py-3 md:px-8">
            <Link to="/" className="shrink-0" aria-label="Oxford Suites Makati home">
              <Logo mark="maroon" />
            </Link>
          </div>
        </header>

        <main className="flex flex-1 justify-center">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full min-w-0 flex-col overflow-x-clip bg-background">
<header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <Link
            to="/"
            className="shrink-0 transition-opacity hover:opacity-85"
            onClick={() => setMenuOpen(false)}
          >
            <Logo mark="maroon" />
          </Link>

          {/* Clean Typographic Nav */}
          <nav aria-label="Main navigation" className="hidden items-center gap-8 lg:flex">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: l.to === "/" }}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "font-medium text-foreground" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Single Action */}
          <div className="hidden lg:block">
            <Button asChild size="sm" className="rounded-full px-5">
              <Link to="/login">Login</Link>
            </Button>
          </div>

          {/* Mobile Controls */}
          <div className="flex items-center gap-2 lg:hidden">
            <Button asChild size="sm" variant="ghost" className="rounded-full text-xs">
              <Link to="/login">Login</Link>
            </Button>
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="grid h-9 w-9 place-items-center rounded-full text-foreground transition-colors hover:bg-muted/60"
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Minimal Mobile Menu */}
        {menuOpen && (
          <div className="border-t border-border/40 bg-background/95 px-4 py-4 backdrop-blur-md lg:hidden">
            <nav aria-label="Mobile navigation" className="flex flex-col space-y-1">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  activeOptions={{ exact: l.to === "/" }}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  activeProps={{ className: "font-medium text-foreground" }}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>
      <footer className="border-t border-border/70 bg-secondary/35">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:grid-cols-12 md:px-8">
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-5">
            <Logo mark="maroon" />
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              {company.overview}
            </p>
            {company.socials.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 text-xs font-medium text-muted-foreground">
                {company.socials.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Columns */}
          <div className="md:col-span-2">
            <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-gold">
              Careers
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {links.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-gold">
              Policies
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {legalLinks.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Property Contact Column */}
          <div className="md:col-span-3">
            <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-gold">
              Property &amp; HR Desk
            </p>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span className="leading-relaxed">{company.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-gold" />
                <a
                  href={`tel:${company.phone.replace(/[^\d+]/g, "")}`}
                  className="transition-colors hover:text-foreground"
                >
                  {company.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-gold" />
                <a
                  href={`mailto:${company.email}`}
                  className="break-all transition-colors hover:text-foreground"
                >
                  {company.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Clean Split Bottom Bar */}
        <div className="border-t border-border/60">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center md:px-8">
            <p>
              © {new Date().getFullYear()} {company.name}. All rights reserved.
            </p>
            <p className="text-[0.7rem] text-muted-foreground/75">
              HRMS Recruitment Portal · spaCy NLP &amp; NER Screening Prototype
            </p>
          </div>
        </div>
      </footer>

      <Chatbot />
    </div>
  );
}
